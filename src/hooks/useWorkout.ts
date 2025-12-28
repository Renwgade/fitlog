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

  // Calculate display day (1-7) based on currentDay
  const displayDay = ((currentDay - 1) % 7) + 1;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await initUserProgress(user.uid);
      } else {
        await signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  const initUserProgress = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      setCurrentDay(data.currentDay || 1);
      setSelectedVersion(data.selectedVersion || "versionA");
      setCompletedExercises(data.progress?.[data.currentDay] || []);
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
    }
    setProgressLoaded(true);
  };

  useEffect(() => {
    if (!progressLoaded) return;

    const fetchWorkout = async () => {
      const dayStr = displayDay.toString();
      const workoutRef = doc(db, "workoutPlans", "weeklyPlan", selectedVersion, dayStr);
      const workoutSnap = await getDoc(workoutRef);

      if (workoutSnap.exists()) {
        setWorkoutDay(workoutSnap.data() as WorkoutDay);
      } else {
        setWorkoutDay({ title: "Rest Day", exercises: [] });
      }
      setLoading(false);
    };

    fetchWorkout();
  }, [displayDay, selectedVersion, progressLoaded]);

  const toggleExercise = async (exerciseName: string) => {
    if (!user) return;

    const newCompleted = completedExercises.includes(exerciseName)
      ? completedExercises.filter(id => id !== exerciseName)
      : [...completedExercises, exerciseName];

    setCompletedExercises(newCompleted);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      [`progress.${currentDay}`]: newCompleted
    });

    // Check if day is completed
    if (workoutDay && newCompleted.length === workoutDay.exercises.length && workoutDay.exercises.length > 0) {
      setTimeout(async () => {
        const nextDay = currentDay + 1;
        setCurrentDay(nextDay);
        setCompletedExercises([]);
        await updateDoc(userRef, {
          currentDay: nextDay,
          [`progress.${nextDay}`]: []
        });
      }, 1000);
    }
  };

  const changeVersion = async (version: "versionA" | "versionB") => {
    if (!user) return;
    setSelectedVersion(version);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { selectedVersion: version });
  };

  return {
    loading,
    currentDay,
    displayDay,
    selectedVersion,
    workoutDay,
    completedExercises,
    toggleExercise,
    changeVersion
  };
}
