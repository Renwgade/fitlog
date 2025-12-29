"use client";

import { useEffect, useRef, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Tracks active usage time and writes a single daily record per user:
 * Collection: `usageDaily`, Doc: `{userId}`
 * Fields: { todayDate: YYYY-MM-DD, todayTimeSeconds: number, updatedAt: Timestamp }
 *
 * Rules:
 * - A "session" runs from activity start until tab close or inactivity >= 5 minutes.
 * - Refresh creates a new session; totals accumulate for the day.
 * - The record overwrites daily (only today's date/time kept).
 */
export function useDailyUsage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [todaySeconds, setTodaySeconds] = useState<number>(0);
  const todayDateRef = useRef<string>(formatDateISO(new Date()));
  const baselineSecondsRef = useRef<number>(0); // existing stored seconds for today
  const accumulatedThisMountRef = useRef<number>(0); // seconds accumulated across sessions in this mount
  const sessionStartRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<any>(null);

  // Start a new session
  const startSession = () => {
    if (sessionStartRef.current == null) {
      sessionStartRef.current = Date.now();
    }
    scheduleInactivity();
  };

  // End current session and persist
  const endSession = async (reason: string) => {
    const start = sessionStartRef.current;
    if (start == null) return; // nothing to end
    const now = Date.now();
    const elapsedSec = Math.max(0, Math.floor((now - start) / 1000));
    accumulatedThisMountRef.current += elapsedSec;
    sessionStartRef.current = null;

    // Persist to Firestore or localStorage
    const today = todayDateRef.current;
    const totalSec = baselineSecondsRef.current + accumulatedThisMountRef.current;

    // update display state immediately
    setTodaySeconds(totalSec);

    // Write to localStorage for reliability on unload
    try {
      localStorage.setItem(
        "dailyUsage",
        JSON.stringify({ todayDate: today, todayTimeSeconds: totalSec })
      );
    } catch { }

    if (db && userId) {
      try {
        const usageRef = doc(db, "usageDaily", userId);
        await updateDoc(usageRef, {
          todayDate: today,
          todayTimeSeconds: totalSec,
          updatedAt: serverTimestamp(),
          _reason: reason,
        });
      } catch (e) {
        // if doc missing, set it
        try {
          const usageRef = doc(db, "usageDaily", userId);
          await setDoc(usageRef, {
            todayDate: today,
            todayTimeSeconds: totalSec,
            updatedAt: serverTimestamp(),
            _reason: reason,
          });
        } catch { }
      }
    }
  };

  const clearInactivity = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const scheduleInactivity = () => {
    clearInactivity();
    inactivityTimerRef.current = setTimeout(() => {
      // 5 minutes without any activity
      endSession("inactivity");
    }, 5 * 60 * 1000);
  };

  const onActivity = () => {
    // If coming back from inactivity, start new session
    if (sessionStartRef.current == null) {
      startSession();
    } else {
      scheduleInactivity();
    }
  };

  const ensureDocForToday = async (uid: string) => {
    if (!db) return;
    const today = todayDateRef.current;
    const usageRef = doc(db, "usageDaily", uid);
    try {
      const snap = await getDoc(usageRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        if (data.todayDate === today) {
          baselineSecondsRef.current = Number(data.todayTimeSeconds || 0);
          setTodaySeconds(baselineSecondsRef.current);
        } else {
          // reset for new day
          baselineSecondsRef.current = 0;
          await updateDoc(usageRef, {
            todayDate: today,
            todayTimeSeconds: 0,
            updatedAt: serverTimestamp(),
          });
          setTodaySeconds(0);
        }
      } else {
        await setDoc(usageRef, {
          todayDate: today,
          todayTimeSeconds: 0,
          updatedAt: serverTimestamp(),
        });
        baselineSecondsRef.current = 0;
        setTodaySeconds(0);
      }
    } catch {
      // ignore; will create/update later
    }
  };

  useEffect(() => {
    // Track auth for userId; fallback to device id
    let unsub: any = null;
    if (auth) {
      unsub = onAuthStateChanged(auth, async (u) => {
        const uid = u?.uid || null;
        setUserId(uid);
        if (uid) {
          await ensureDocForToday(uid);
        }
      });
    } else {
      // offline device id
      try {
        const id = localStorage.getItem("deviceId") || `device-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
        localStorage.setItem("deviceId", id);
        setUserId(id);
      } catch {
        setUserId("device-unknown");
      }
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    // Start a session on mount
    startSession();

    // Activity listeners
    const events = ["mousemove", "keydown", "touchstart", "scroll"] as const;
    events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    const onVisibility = () => {
      if (document.hidden) {
        endSession("hidden");
      } else {
        startSession();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onBeforeUnload = () => {
      // Finalize session before closing/refreshing
      endSession("unload");
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    const midnightCheck = setInterval(() => {
      const nowDate = formatDateISO(new Date());
      if (nowDate !== todayDateRef.current) {
        // new day: finalize previous and reset counters
        endSession("midnight");
        todayDateRef.current = nowDate;
        baselineSecondsRef.current = 0;
        accumulatedThisMountRef.current = 0;
        setTodaySeconds(0);
        startSession();
      }
    }, 60 * 1000);

    // Live display updater
    const tick = () => {
      const start = sessionStartRef.current;
      const live = start ? Math.floor((Date.now() - start) / 1000) : 0;
      setTodaySeconds(baselineSecondsRef.current + accumulatedThisMountRef.current + live);
    };
    tick();
    const liveTimer = setInterval(tick, 1000);

    return () => {
      clearInactivity();
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearInterval(midnightCheck);
      clearInterval(liveTimer);
    };
  }, [userId]);

  return { todaySeconds };
}