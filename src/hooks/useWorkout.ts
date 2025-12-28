"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";

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
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });
  const [history, setHistory] = useState<Record<number, string[]>>({});
  const [workoutDates, setWorkoutDates] = useState<Record<string, { day: number, exercises: string[] }>>({});

  // Calculate display day (1-7) based on currentDay
  const displayDay = ((currentDay - 1) % 7) + 1;

  useEffect(() => {
    // Load history from local storage
    const localUser = localStorage.getItem("workoutUser");
    if (localUser) {
      const data = JSON.parse(localUser);
      setHistory(data.progress || {});
      setWorkoutDates(data.workoutDates || {});
    }
  }, [currentDay, completedExercises]);

  useEffect(() => {
    let interval: any;
    if (restTimer.active && restTimer.seconds > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => ({ ...prev, seconds: prev.seconds - 1 }));
      }, 1000);
    } else if (restTimer.seconds === 0) {
      setRestTimer((prev) => ({ ...prev, active: false }));
    }
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.seconds]);

  const startTimer = (seconds: number) => {
    setRestTimer({ active: true, seconds });
  };

  useEffect(() => {
    // Check local storage first for user data
    const localUser = localStorage.getItem("workoutUser");
    if (localUser) {
      const data = JSON.parse(localUser);
      setCurrentDay(data.currentDay || 1);
      setSelectedVersion(data.selectedVersion || "versionA");
      setCompletedExercises(data.progress?.[data.currentDay] || []);
      setProgressLoaded(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await initUserProgress(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.warn("Firebase Auth failed, using local storage only");
          if (!localUser) {
            // Initialize local storage if not present
            const initialData = {
              currentDay: 1,
              selectedVersion: "versionA",
              progress: { 1: [] }
            };
            localStorage.setItem("workoutUser", JSON.stringify(initialData));
            setCurrentDay(1);
            setSelectedVersion("versionA");
            setCompletedExercises([]);
            setProgressLoaded(true);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const initUserProgress = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setCurrentDay(data.currentDay || 1);
        setSelectedVersion(data.selectedVersion || "versionA");
        setCompletedExercises(data.progress?.[data.currentDay] || []);
        
        // Sync to local storage
        localStorage.setItem("workoutUser", JSON.stringify(data));
      } else {
        const initialData = {
          currentDay: 1,
          selectedVersion: "versionA",
          progress: { 1: [] }
        };
        await setDoc(userRef, initialData);
        setCurrentDay(1);
        setSelectedVersion("versionA");
        setCompletedExercises([]);
        localStorage.setItem("workoutUser", JSON.stringify(initialData));
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
      
      // Try local storage first
      const localPlans = localStorage.getItem("workoutPlans");
      if (localPlans) {
        const plans = JSON.parse(localPlans);
        const dayData = plans[selectedVersion]?.days[dayStr];
        if (dayData) {
          if (!controller.signal.aborted) {
            setWorkoutDay(dayData);
            setLoading(false);
          }
          return;
        }
      }

      // Try Firebase
      try {
        const workoutRef = doc(db, "workoutPlans", "weeklyPlan", selectedVersion, dayStr);
        const workoutSnap = await getDoc(workoutRef);

        if (!controller.signal.aborted) {
          if (workoutSnap.exists()) {
            setWorkoutDay(workoutSnap.data() as WorkoutDay);
          } else {
            setWorkoutDay({ title: "Rest Day", exercises: [] });
          }
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          console.warn("Firebase workout fetch failed");
          setWorkoutDay({ title: "Rest Day", exercises: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchWorkout();

    return () => controller.abort();
  }, [displayDay, selectedVersion, progressLoaded]);

  const toggleExercise = async (exerciseName: string) => {
    const newCompleted = completedExercises.includes(exerciseName)
      ? completedExercises.filter(id => id !== exerciseName)
      : [...completedExercises, exerciseName];

    setCompletedExercises(newCompleted);

    // Start rest timer if exercise was completed (not undone)
    if (!completedExercises.includes(exerciseName)) {
      const exercise = workoutDay?.exercises.find(e => e.name === exerciseName);
      if (exercise && exercise.rest) {
        // Parse rest time (e.g., "90s" or "90–150s")
        const secondsMatch = exercise.rest.match(/(\d+)/);
        if (secondsMatch) {
          startTimer(parseInt(secondsMatch[1]));
        }
      }
    }

    // Update local storage
    const localUser = localStorage.getItem("workoutUser");
    const userData = localUser ? JSON.parse(localUser) : { progress: {} };
    userData.progress = userData.progress || {};
    userData.progress[currentDay] = newCompleted;
    
    // Track calendar activity
    const todayDate = new Date().toISOString().split('T')[0];
    userData.workoutDates = userData.workoutDates || {};
    userData.workoutDates[todayDate] = {
      day: currentDay,
      exercises: newCompleted
    };
    
    localStorage.setItem("workoutUser", JSON.stringify(userData));
    setWorkoutDates(userData.workoutDates);

    // Update Firebase
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`progress.${currentDay}`]: newCompleted
        });
      } catch (e) {
        console.warn("Firebase update failed");
      }
    }

    // Check if day is completed
    const isRestDay = workoutDay?.exercises.length === 0;
    const isWorkoutDayComplete = workoutDay && newCompleted.length === workoutDay.exercises.length && workoutDay.exercises.length > 0;
    const isRestDayComplete = isRestDay && exerciseName === "Rest Complete";

    if (isWorkoutDayComplete || isRestDayComplete) {
      setTimeout(async () => {
        const nextDay = currentDay + 1;
        setCurrentDay(nextDay);
        setCompletedExercises([]);
        
        // Update local storage for next day
        userData.currentDay = nextDay;
        userData.progress[nextDay] = [];
        localStorage.setItem("workoutUser", JSON.stringify(userData));

        if (user) {
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              currentDay: nextDay,
              [`progress.${nextDay}`]: []
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
    
    // Update local storage
    const localUser = localStorage.getItem("workoutUser");
    const userData = localUser ? JSON.parse(localUser) : {};
    userData.selectedVersion = version;
    localStorage.setItem("workoutUser", JSON.stringify(userData));

    if (user) {
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
    toggleExercise,
    changeVersion,
    startTimer,
    setRestTimer
  };
}
