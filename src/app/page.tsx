"use client";

import Image from "next/image";

import { useState, useEffect } from "react";
import { useWorkout, Exercise } from "@/hooks/useWorkout";
import { seedWorkoutData, EXERCISE_IMAGES } from "@/lib/seed-data";
import { EXERCISE_DETAILS } from "@/lib/exercises-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Loader2,
  CheckCircle2,
  Dumbbell,
  Calendar,
  Settings,
  History,
  Home,
  Info,
  RotateCcw,
  ChevronRight,
  Clock,
  Zap,
  BookOpen,
  Utensils,
  TrendingUp,
  Maximize2,
  Activity,
  ArrowRight,
  Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDailyUsage } from "@/hooks/useDailyUsage";

const PhilosophyTab = dynamic(() => import("@/components/tabs/philosophy"));
const NutritionTab = dynamic(() => import("@/components/tabs/nutrition"));
const CalendarTab = dynamic(() => import("@/components/tabs/calendar-tab"));
const UICalendar = dynamic(() => import("@/components/ui/calendar").then(mod => mod.Calendar), { ssr: false });
const StatusOverlay = dynamic(() => import("@/components/status-overlay"), { ssr: false });

export default function WorkoutApp() {
  const {
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
    setRestTimer
  } = useWorkout();

  // Initialize daily usage tracking (writes to Firestore `usageDaily`)
  const { todaySeconds } = useDailyUsage();

  const [viewLibrary, setViewLibrary] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "philosophy" | "nutrition" | "calendar" | "settings">("workout");
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  // per-second timers moved into StatusOverlay component
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [quote, setQuote] = useState<{ q: string; a: string } | null>(null);
  const [quoteVisible, setQuoteVisible] = useState(false);

  const getTabColor = () => {
    switch (activeTab) {
      case "workout": return "indigo";
      case "philosophy": return "amber";
      case "nutrition": return "emerald";
      case "calendar": return "rose";
      case "settings": return "zinc";
      default: return "indigo";
    }
  };

  const themeColor = getTabColor();

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // session time handled inside StatusOverlay

  // formatSessionTime moved into StatusOverlay

  const fetchQuote = async () => {
    setQuoteVisible(false);
    const FALLBACK_QUOTES = [
      { q: "Believe in your infinite potential. Your only limitations are those you set upon yourself.", a: "Roy T. Bennett" },
      { q: "Do not fear failure but rather fear not trying.", a: "Roy T. Bennett" },
      { q: "Never lose hope. Storms make people stronger and never last forever.", a: "Roy T. Bennett" },
      { q: "The fool doth think he is wise, but the wise man knows himself to be a fool.", a: "William Shakespeare" },
    ];
    try {
      const picked = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(picked);
      localStorage.setItem("workout_daily_quote", JSON.stringify(picked));
    } catch (e) {
      console.warn("Quote fetch failed", e);
      setQuote({ q: "Success is the sum of small efforts, repeated day-in and day-out.", a: "Robert Collier" });
    }
    setTimeout(() => setQuoteVisible(true), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("workout_daily_quote");
    if (saved) setQuote(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (activeTab === "philosophy") {
      fetchQuote();
    }
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeed = async () => {
    setSeeding(true);
    await seedWorkoutData();
    setSeeding(false);
    window.location.reload();
  };

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      localStorage.removeItem("workoutUser");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = workoutDay?.exercises.length
    ? (completedExercises.length / workoutDay.exercises.length) * 100
    : 0;

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Get data for selected date in calendar
  const getSelectedDateData = () => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return workoutDates[dateStr];
  };

  const selectedDateWorkout = getSelectedDateData();

  // Helper to get plan for a specific history day
  const getHistoryPlan = () => {
    if (!selectedDate || !allPlans) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const historyData = workoutDates[dateStr];

    let displayDayNum: number;
    let version: "versionA" | "versionB" = selectedVersion;

    if (historyData) {
      displayDayNum = ((historyData.day - 1) % 7) + 1;
    } else {
      // Predicted plan based on weekday (1=Mon, 7=Sun)
      const dayOfWeek = selectedDate.getDay();
      displayDayNum = dayOfWeek === 0 ? 7 : dayOfWeek;
    }

    return allPlans[version]?.days[displayDayNum];
  };

  const selectedDayPlan = getHistoryPlan();

  // We will modify the calendar display to be more detailed later in the render loop.

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Status Overlay (PWA Style) */}
      <StatusOverlay todaySeconds={todaySeconds} />

      {/* Background Glows (workout tab only) */}
      {activeTab === "workout" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              backgroundColor:
                themeColor === "indigo" ? "rgba(99, 102, 241, 0.08)" :
                  themeColor === "amber" ? "rgba(245, 158, 11, 0.08)" :
                    themeColor === "emerald" ? "rgba(16, 185, 129, 0.08)" :
                      themeColor === "rose" ? "rgba(244, 63, 94, 0.08)" : "rgba(113, 113, 122, 0.08)"
            }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] blur-[80px] rounded-full transition-colors duration-700"
          />
          <motion.div
            animate={{
              backgroundColor:
                themeColor === "indigo" ? "rgba(79, 70, 229, 0.04)" :
                  themeColor === "amber" ? "rgba(217, 119, 6, 0.04)" :
                    themeColor === "emerald" ? "rgba(5, 150, 105, 0.04)" :
                      themeColor === "rose" ? "rgba(225, 29, 72, 0.04)" : "rgba(82, 82, 91, 0.04)"
            }}
            className="absolute top-[30%] -right-[5%] w-[40%] h-[40%] blur-[60px] rounded-full transition-colors duration-700"
          />
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isImageFullscreen && selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-4"
            onClick={() => setIsImageFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full h-full flex items-center justify-center"
            >
              <Image
                src={selectedExercise.image}
                alt={selectedExercise.name}
                fill
                className="object-contain rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-white/10 border-white/20 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageFullscreen(false);
                }}
              >
                ✕
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-3xl px-4 pt-10 space-y-8 md:px-8">
        {activeTab === "workout" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10"
          >
            {/* Header */}
            <header className="flex flex-col gap-4">
              <AnimatePresence>
                {restTimer.active && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-8 left-4 right-4 z-[120] mx-auto max-w-sm"
                  >
                    <div className="bg-indigo-600/90 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/20 ring-1 ring-white/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2 animate-pulse">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Next Set In</p>
                          <p className="text-2xl font-black tabular-nums">{formatTime(restTimer.seconds)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-none font-bold"
                        onClick={() => setRestTimer({ active: false, seconds: 0 })}
                      >
                        Skip
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-x">
                    Muscle Gain
                  </h1>
                  <p className="text-zinc-200 font-bold uppercase tracking-widest text-[11px] mt-1 opacity-80">
                    Day {currentDay} • {dayNames[displayDay - 1]}
                  </p>
                </div>
                {!workoutDay && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeed}
                    disabled={seeding}
                    className="border-indigo-500/30 bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 px-4 h-9 rounded-xl"
                  >
                    {seeding ? "Initializing..." : "Load Plans"}
                  </Button>
                )}
              </div>

              <Tabs
                value={selectedVersion}
                onValueChange={(v) => changeVersion(v as "versionA" | "versionB")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900/40 p-1 border border-zinc-800/40 rounded-2xl backdrop-blur-md">
                  <TabsTrigger value="versionA" className="rounded-xl py-2.5 text-xs font-bold text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Master Plan</TabsTrigger>
                  <TabsTrigger value="versionB" className="rounded-xl py-2.5 text-xs font-bold text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Detailed Plan</TabsTrigger>
                </TabsList>
              </Tabs>
            </header>

            {/* Today's Workout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-500/20 p-2.5 text-indigo-400 shadow-inner ring-1 ring-indigo-500/20">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-100 tracking-tight">{workoutDay?.title}</h2>
                </div>
                {workoutDay?.exercises.length === 0 && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase tracking-widest px-3">
                    Recovery
                  </Badge>
                )}
              </div>

              {workoutDay?.exercises.length ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-200">
                      <span>Live Progress</span>
                      <span className="text-indigo-400">{completedExercises.length} / {workoutDay.exercises.length} Completed</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-zinc-900/60 overflow-hidden rounded-full ring-1 ring-zinc-800/50">
                      <div className="h-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }} />
                    </Progress>
                  </div>

                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {workoutDay.exercises.map((exercise, idx) => {
                        const isCompleted = completedExercises.includes(exercise.name);
                        return (
                          <motion.div
                            key={exercise.name}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card
                              className={`group relative overflow-hidden border-zinc-800/40 bg-zinc-900/40 backdrop-blur-xl transition-all duration-500 hover:bg-zinc-800/40 active:scale-[0.98] rounded-[2rem] ${isCompleted ? 'opacity-50 grayscale border-indigo-500/10' : 'hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10'
                                }`}
                            >
                              {isCompleted && (
                                <div className="absolute inset-0 bg-indigo-900/10 z-0 pointer-events-none" />
                              )}

                              <div className="relative z-10 p-5 flex gap-5">
                                {/* Image Section */}
                                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-zinc-700/30 shadow-2xl group-hover:rotate-2 transition-transform duration-500">
                                  <Image
                                    src={exercise.image}
                                    alt={exercise.name}
                                    width={112}
                                    height={112}
                                    className="h-full w-full object-cover"
                                  />
                                  {isCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/60 backdrop-blur-sm">
                                      <CheckCircle2 className="h-10 w-10 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1" onClick={() => setSelectedExercise(exercise)}>
                                  <div>
                                    <h3 className="font-black text-white text-xl tracking-tight leading-snug group-hover:text-indigo-400 transition-colors cursor-pointer">
                                      {exercise.name}
                                    </h3>
                                    <p className="text-zinc-400 text-xs font-bold leading-relaxed mt-2 line-clamp-2">
                                      {exercise.description?.substring(0, 80)}...
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                      <Zap className="h-3 w-3 text-indigo-400" />
                                      {exercise.sets} × {exercise.reps}
                                    </span>
                                    {exercise.rest && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                        <Clock className="h-3 w-3 text-indigo-400" />
                                        {exercise.rest}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Check Button */}
                                <div className="flex flex-col justify-center pl-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExercise(exercise.name);
                                    }}
                                    className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${isCompleted
                                      ? 'bg-indigo-600 border-indigo-500 text-white scale-90'
                                      : 'bg-zinc-800/50 border-zinc-700/30 text-zinc-600 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-500 hover:scale-105'
                                      }`}
                                  >
                                    <CheckCircle2 className={`h-6 w-6 transition-all duration-300 ${isCompleted ? 'scale-110' : 'scale-90'}`} />
                                  </button>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <Card className="border-zinc-800/40 border-dashed bg-zinc-900/20 py-16 text-center backdrop-blur-md rounded-3xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),transparent)]" />
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <Calendar className="h-12 w-12" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-100 tracking-tight">Active Recovery</h3>
                      <p className="max-w-xs text-sm text-zinc-400 px-6 mt-1 font-medium leading-relaxed italic">
                        "Your muscles grow while you sleep, not while you're training."
                      </p>
                    </div>
                    <Button
                      onClick={() => toggleExercise("Rest Complete")}
                      className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl px-12 h-12 shadow-xl shadow-emerald-900/40 transition-all active:scale-95"
                    >
                      Complete Rest Day
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Nutrition Quick Tip */}
            <section className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-md overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                <Utensils className="h-20 w-20 text-indigo-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/20 p-2 rounded-xl ring-1 ring-indigo-500/30">
                  <Info className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/90">Daily Protocol</h3>
              </div>
              <p className="text-sm text-zinc-300 font-bold leading-relaxed tracking-wide">
                Hard Gainers: Consistency is King. Don't skip your <span className="text-indigo-400 decoration-indigo-400/50 underline underline-offset-4 decoration-2">Growth Shake</span> (Milk, Oats, PB, Banana) before bed!
              </p>
            </section>
          </motion.div>
        ) : activeTab === "philosophy" ? (
          <PhilosophyTab />
        ) : activeTab === "nutrition" ? (
          <NutritionTab />
        ) : activeTab === "calendar" ? (
          <CalendarTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            workoutDates={workoutDates}
            selectedDateWorkout={selectedDateWorkout}
            selectedDayPlan={selectedDayPlan}
            setSelectedExercise={setSelectedExercise}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl font-black bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 bg-clip-text text-transparent tracking-tighter">
                  {viewLibrary ? "Library" : "System"}
                </h2>
                <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em] pl-1 opacity-80">
                  {viewLibrary ? "All Exercises" : "Device Configuration"}
                </p>
              </div>
              {viewLibrary && (
                <Button
                  variant="ghost"
                  onClick={() => setViewLibrary(false)}
                  className="rounded-xl text-zinc-400 hover:text-white"
                >
                  Back
                </Button>
              )}
            </div>

            {viewLibrary ? (
              <div className="grid gap-4">
                {Object.entries(EXERCISE_DETAILS).map(([name, details]) => (
                  <Card
                    key={name}
                    className="border-zinc-800/40 bg-zinc-900/40 backdrop-blur-md p-5 rounded-3xl group hover:border-indigo-500/30 transition-all cursor-pointer"
                    onClick={() => setSelectedExercise({
                      name,
                      description: details.description,
                      focusMuscles: details.muscles,
                      image: (EXERCISE_IMAGES as any)[name] || "/assets/exercises/pushups.png",
                      sets: "–",
                      reps: "–",
                      tempo: "–",
                      rest: "–",
                      notes: ""
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden border border-zinc-800 group-hover:border-indigo-500/30 transition-all">
                          <Image
                            src={(EXERCISE_IMAGES as any)[name] || "/assets/exercises/pushups.png"}
                            alt={name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-black text-zinc-100">{name}</p>
                          <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{details.muscles}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-indigo-400 transition-all" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] pl-1">Configuration</h3>
                  <div className="grid gap-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between border-gray-500/40 bg-indigo-500/10 backdrop-blur-md hover:bg-indigo-500/20 h-20 rounded-3xl group transition-all duration-300"
                      onClick={() => setViewLibrary(true)}
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all shadow-inner">
                          <Dumbbell className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-zinc-100 text-lg tracking-tight">Exercise Library</p>
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">View all {Object.keys(EXERCISE_DETAILS).length} movements</p>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md hover:bg-zinc-800/60 h-20 rounded-3xl group transition-all duration-300"
                      onClick={resetProgress}
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                          <RotateCcw className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-zinc-100 text-lg tracking-tight">Reset Progress</p>
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Wipe all local records</p>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md hover:bg-zinc-800/60 h-20 rounded-3xl group transition-all duration-300"
                      onClick={handleSeed}
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                          <RotateCcw className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-zinc-100 text-lg tracking-tight">Refresh Plans</p>
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Re-sync exercise database</p>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-5 pt-4">
                  <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] pl-1">Build Manifest</h3>
                  <Card className="border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md p-7 space-y-5 rounded-[2.5rem] shadow-2xl">
                    {[
                      { label: "Architecture", value: "Next.js 15 PWA" },
                      { label: "Data Pipeline", value: "Local Storage Sync" },
                      { label: "Build Version", value: "1.3.0 (Seamless Update)" },
                      { label: "Origin", value: "Renwgade Terminal" }
                    ].map((info, i) => (
                      <div key={i} className="flex justify-between text-sm items-center group">
                        <span className="text-zinc-300 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-zinc-200 transition-colors">{info.label}</span>
                        <span className="text-zinc-100 font-black tracking-tight">{info.value}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Exercise Detail Drawer */}
      <Drawer open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DrawerContent className="bg-zinc-950 border-zinc-800/50 text-zinc-100 h-[85vh]">
          <div className="mx-auto w-full max-w-lg h-full flex flex-col">
            <div className="flex justify-center p-4">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>
            {selectedExercise && (
              <div className="flex-1 overflow-y-auto px-6 pb-32">
                <DrawerHeader className="px-0">
                  <DrawerTitle className="text-3xl font-black text-white tracking-tighter">{selectedExercise.name}</DrawerTitle>
                  <DrawerDescription className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                    Muscle Focus: {selectedExercise.focusMuscles || "Hypertrophy"}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-8 mt-4">
                  <div className="group relative aspect-video w-full overflow-hidden rounded-[2rem] border border-zinc-800/50 shadow-2xl cursor-pointer ring-1 ring-white/5" onClick={() => setIsImageFullscreen(true)}>
                    <Image
                      src={selectedExercise.image}
                      alt={selectedExercise.name}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Execution Protocol</h4>
                    <p className="text-zinc-200 text-sm font-bold leading-relaxed bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50 shadow-inner">
                      {selectedExercise.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-300 uppercase font-black tracking-widest mb-1">Volume</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.sets} × {selectedExercise.reps}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-300 uppercase font-black tracking-widest mb-1">Recovery</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.rest || "Auto"}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-300 uppercase font-black tracking-widest mb-1">Cadence</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.tempo || "3-0-1"}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-300 uppercase font-black tracking-widest mb-1">Target</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">Mass Gain</p>
                    </div>
                  </div>

                  {selectedExercise.notes && (
                    <div className="rounded-[2rem] bg-indigo-500/10 p-6 border border-indigo-500/30 relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Info className="h-10 w-10 text-indigo-400" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.3em] mb-2 drop-shadow-sm">Coach's Directive</p>
                        <p className="text-base text-zinc-100 font-bold italic leading-relaxed tracking-wide">"{selectedExercise.notes}"</p>
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900/50 flex gap-4">
              {selectedExercise && (
                <Button
                  className="flex-1 h-16 rounded-[1.25rem] text-lg font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-950/50 transition-all active:scale-95"
                  onClick={() => {
                    toggleExercise(selectedExercise.name);
                    setSelectedExercise(null);
                  }}
                >
                  {completedExercises.includes(selectedExercise.name) ? "Revert Progress" : "Mark as Done"}
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline" className="h-16 w-16 rounded-[1.25rem] p-0 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  ✕
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Bottom Navigation (PWA Seamless) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-900/50 bg-zinc-950/80 backdrop-blur-3xl z-50 safe-area-inset-bottom">
        <div className="mx-auto max-w-2xl px-6 h-20 flex items-center justify-between">
          {[
            { id: "workout", icon: Home, label: "Workout", color: "text-indigo-500" },
            { id: "philosophy", icon: BookOpen, label: "Rules", color: "text-amber-500" },
            { id: "nutrition", icon: Utensils, label: "Diet", color: "text-emerald-500" },
            { id: "calendar", icon: Calendar, label: "History", color: "text-rose-500" },
            { id: "settings", icon: Settings, label: "System", color: "text-zinc-400" }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-500 flex-1 group py-2 ${isActive ? item.color : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <div className={`relative transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105 opacity-80'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow-pwa"
                      className={`absolute inset-0 bg-current opacity-20 blur-xl rounded-full scale-150 pointer-events-none`}
                    />
                  )}
                  <item.icon className={`h-6 w-6 ${isActive ? 'drop-shadow-[0_0_12px_currentColor]' : ''}`} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-pwa"
                      className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_8px_currentColor]"
                    />
                  )}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Custom Styles for Animation and PWA */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        /* Mobile scrollbar hide */
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
