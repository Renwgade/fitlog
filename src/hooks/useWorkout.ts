"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  getUserData,
  setUserData,
  getAllPlans,
  setAllPlans,
} from "@/lib/storage";
import useRestTimer from "@/hooks/useRestTimer";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  tempo: string;
  rest: string;
  notes: string;
  image: string;
  description?: string;
  focusMuscles?: string;
}

export interface WorkoutDay {
  title: string;
  exercises: Exercise[];
}

export function useWorkout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<"versionA" | "versionB">("versionA");
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const { restTimer, startTimer, setRestTimer } = useRestTimer();

  const [history, setHistory] = useState<Record<number, string[]>>({});
  const [workoutDates, setWorkoutDates] = useState<Record<string, { day: number; exercises: string[] }>>({});
  const [allPlans, setAllPlansState] = useState<any>(null);

  const displayDay = ((currentDay - 1) % 7) + 1;

  useEffect(() => {
    const data = getUserData();
    setHistory(data.progress || {});
    setWorkoutDates(data.workoutDates || {});
    const plans = getAllPlans();
    if (plans) setAllPlansState(plans);
  }, []);

  useEffect(() => {
    const data = getUserData();
    setCurrentDay(data.currentDay || 1);
    setSelectedVersion(data.selectedVersion || "versionA");
    setCompletedExercises(data.progress?.[data.currentDay] || []);
    setProgressLoaded(true);

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (u) {
          setUser(u);
          await initUserProgress(u.uid);
        } else {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.warn("Firebase Auth failed, using local storage only");
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const initUserProgress = async (userId: string) => {
    try {
      if (!db) throw new Error("Offline");
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        setCurrentDay(data.currentDay || 1);
        setSelectedVersion(data.selectedVersion || "versionA");
        setCompletedExercises(data.progress?.[data.currentDay] || []);
        setUserData(data);
      } else {
        const init = {
          currentDay: 1,
          selectedVersion: "versionA" as const,
          progress: { 1: [] },
        };
        await setDoc(userRef, init);
        setUserData(init);
      }
    } catch (e) {
      console.warn("Firebase progress init failed, using local storage");
    }
    setProgressLoaded(true);
  };

  useEffect(() => {
    if (!progressLoaded) return;

    const controller = new AbortController();

    const fetchWorkout = async () => {
      const dayStr = displayDay.toString();

      const localPlans = localStorage.getItem("workoutPlans");
      if (localPlans) {
        const plans = JSON.parse(localPlans);
        const dayData = plans[selectedVersion]?.days[dayStr];
        if (dayData && !controller.signal.aborted) {
          setWorkoutDay(dayData);
          setLoading(false);
          return;
        }
      }

      try {
        if (!db) throw new Error("Offline");
        const workoutRef = doc(db, "workoutPlans", "weeklyPlan", selectedVersion, dayStr);
        const snap = await getDoc(workoutRef);
        if (!controller.signal.aborted) {
          if (snap.exists()) setWorkoutDay(snap.data() as WorkoutDay);
          else setWorkoutDay({ title: "Rest Day", exercises: [] });
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          console.warn("Firebase workout fetch failed");
          setWorkoutDay({ title: "Rest Day", exercises: [] });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchWorkout();
    return () => controller.abort();
  }, [displayDay, selectedVersion, progressLoaded]);

  const toggleExercise = async (exerciseName: string) => {
    const newCompleted = completedExercises.includes(exerciseName)
      ? completedExercises.filter((id) => id !== exerciseName)
      : [...completedExercises, exerciseName];

    setCompletedExercises(newCompleted);

    if (!completedExercises.includes(exerciseName)) {
      const ex = workoutDay?.exercises.find((e) => e.name === exerciseName);
      if (ex?.rest) {
        const match = ex.rest.match(/(\d+)/);
        if (match) startTimer(parseInt(match[1]));
      }
    }

    const data = getUserData();
    data.progress[currentDay] = newCompleted;

    const today = new Date().toISOString().split("T")[0];
    data.workoutDates = data.workoutDates || {};
    data.workoutDates[today] = { day: currentDay, exercises: newCompleted };
    setUserData(data);
    setWorkoutDates(data.workoutDates);

    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`progress.${currentDay}`]: newCompleted,
        });
      } catch (e) {
        console.warn("Firebase update failed");
      }
    }

    const isRestDay = workoutDay?.exercises.length === 0;
    const isWorkoutDayComplete =
      workoutDay &&
      newCompleted.length === workoutDay.exercises.length &&
      workoutDay.exercises.length > 0;
    const isRestDayComplete = isRestDay && exerciseName === "Rest Complete";

    if (isWorkoutDayComplete || isRestDayComplete) {
      setTimeout(async () => {
        const nextDay = currentDay + 1;
        setCurrentDay(nextDay);
        setCompletedExercises([]);

        const nextData = getUserData();
        nextData.currentDay = nextDay;
        nextData.progress[nextDay] = [];
        setUserData(nextData);
        setWorkoutDates(nextData.workoutDates ?? {});

        if (user && db) {
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              currentDay: nextDay,
              [`progress.${nextDay}`]: [],
            });
          } catch (e) {
            console.warn("Firebase update failed");
          }
        }
      }, 1000);
    }
  };

  const changeVersion = async (version: "versionA" | "versionB") => {
    setSelectedVersion(version);
    const data = getUserData();
    data.selectedVersion = version;
    setUserData(data);

    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { selectedVersion: version });
      } catch (e) {
        console.warn("Firebase update failed");
      }
    }
  };

  return {
    loading,
    currentDay,
    displayDay,
    selectedVersion,
    workoutDay,
    completedExercises,
    restTimer,
    history,
    workoutDates,
    allPlans,
    toggleExercise,
    changeVersion,
    startTimer,
    setRestTimer,
  };
}
