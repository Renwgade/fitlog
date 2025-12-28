"use client";

import { useState, useEffect } from "react";
import { useWorkout, Exercise } from "@/hooks/useWorkout";
import { seedWorkoutData } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as UICalendar } from "@/components/ui/calendar";
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
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    toggleExercise,
    changeVersion,
    setRestTimer
  } = useWorkout();

  const [seeding, setSeeding] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "philosophy" | "nutrition" | "calendar" | "settings">("workout");
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionTime, setSessionTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getTabColor = () => {
    switch(activeTab) {
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
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionTimer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(sessionTimer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-x-hidden selection:bg-indigo-500/30">
      {/* Status Overlay (PWA Style) */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex justify-between items-center pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
        <div className="text-[10px] font-black tracking-widest text-zinc-300">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-[10px] font-black tracking-widest text-zinc-300">
          {formatSessionTime(sessionTime)}
        </div>
      </div>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            backgroundColor: 
              themeColor === "indigo" ? "rgba(99, 102, 241, 0.08)" : 
              themeColor === "amber" ? "rgba(245, 158, 11, 0.08)" : 
              themeColor === "emerald" ? "rgba(16, 185, 129, 0.08)" : 
              themeColor === "rose" ? "rgba(244, 63, 94, 0.08)" : "rgba(113, 113, 122, 0.08)"
          }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] blur-[140px] rounded-full transition-colors duration-700"
        />
        <motion.div 
          animate={{ 
            backgroundColor: 
              themeColor === "indigo" ? "rgba(79, 70, 229, 0.04)" : 
              themeColor === "amber" ? "rgba(217, 119, 6, 0.04)" : 
              themeColor === "emerald" ? "rgba(5, 150, 105, 0.04)" : 
              themeColor === "rose" ? "rgba(225, 29, 72, 0.04)" : "rgba(82, 82, 91, 0.04)"
          }}
          className="absolute top-[30%] -right-[5%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-700"
        />
      </div>

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
              <img 
                src={selectedExercise.image} 
                alt={selectedExercise.name}
                className="max-h-full max-w-full object-contain rounded-lg"
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
                    <div className="bg-indigo-600/90 text-white backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/20 ring-1 ring-white/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2 animate-pulse">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Next Set In</p>
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
                  <TabsTrigger value="versionA" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Master Plan</TabsTrigger>
                  <TabsTrigger value="versionB" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Detailed Plan</TabsTrigger>
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
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
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
                              className={`group relative overflow-hidden border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md transition-all duration-300 hover:bg-zinc-900/50 active:scale-[0.97] rounded-3xl ${
                                isCompleted ? 'opacity-40 grayscale-[0.2] border-indigo-500/20' : 'hover:border-indigo-500/40 shadow-xl shadow-black/20'
                              }`}
                            >
                              {isCompleted && (
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  className="absolute left-0 top-0 h-[3px] bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.6)]"
                                />
                              )}
                              <div className="flex items-center p-4 gap-4">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-800/50 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                  <img 
                                    src={exercise.image} 
                                    alt={exercise.name}
                                    className="h-full w-full object-cover"
                                  />
                                  {isCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/30 backdrop-blur-[1px]">
                                      <CheckCircle2 className="h-10 w-10 text-white drop-shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0" onClick={() => setSelectedExercise(exercise)}>
                                  <h3 className="font-black text-zinc-100 text-lg tracking-tight truncate group-hover:text-indigo-400 transition-colors">{exercise.name}</h3>
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/30 shadow-sm">
                                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> {exercise.sets} × {exercise.reps}
                                    </span>
                                    {exercise.rest && (
                                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/30 shadow-sm">
                                        <Clock className="h-3 w-3 text-indigo-400" /> {exercise.rest}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExercise(exercise.name);
                                  }}
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-xl ${
                                    isCompleted 
                                      ? 'bg-indigo-600 border-indigo-500 text-white scale-90' 
                                      : 'border-zinc-800 bg-zinc-800/40 text-transparent hover:border-indigo-500/60 hover:bg-indigo-500/20 active:scale-90'
                                  }`}
                                >
                                  <CheckCircle2 className={`h-7 w-7 ${isCompleted ? 'opacity-100 animate-in zoom-in-50' : 'opacity-10 group-hover:opacity-40 text-indigo-400'}`} />
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black flex items-center gap-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tighter">
                <div className="bg-amber-500/20 p-2.5 rounded-2xl text-amber-500 shadow-xl ring-1 ring-amber-500/20">
                  <BookOpen className="h-8 w-8" />
                </div>
                The Iron Code
              </h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1 opacity-80">Hypertrophy Foundations</p>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Progressive Overload", desc: "Muscle grows from progressive overload, not sheer exhaustion.", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "Hypertrophy Range", desc: "Train in the hypertrophy range (6–12 reps) for maximum size.", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
                { title: "Time Under Tension", desc: "Slow negatives (3–4 sec) increase muscle fiber stimulus.", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
                { title: "Mandatory Rest", desc: "Growth happens during rest. Hard gainers need recovery.", icon: Calendar, color: "text-orange-400", bg: "bg-orange-400/10" },
                { title: "Caloric Surplus", desc: "Calories drive scale weight; training shapes the muscle.", icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, idx) => (
                <Card key={idx} className="border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md p-5 flex gap-5 hover:border-amber-500/40 transition-all group rounded-3xl active:scale-[0.98]">
                  <div className={`h-14 w-14 shrink-0 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-2xl ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-black text-zinc-100 text-lg tracking-tight group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-zinc-400 font-bold leading-relaxed mt-0.5 opacity-90">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pl-1">Progression Protocol</h3>
              <div className="rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 p-8 space-y-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <TrendingUp className="h-60 w-60 text-amber-500" />
                </div>
                {[
                  "Add 1 rep per set weekly until you hit the top range.",
                  "Then add 1 extra set OR increase time under tension.",
                  "Deload every 6th week (reduce volume by 40%).",
                  "If bodyweight stalls for 14 days → Add 200 calories."
                ].map((rule, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <span className="flex-shrink-0 h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-[12px] font-black text-amber-500 ring-1 ring-amber-500/30 group-hover:bg-amber-500 group-hover:text-black transition-all">
                      {i+1}
                    </span>
                    <p className="text-sm text-zinc-200 font-bold leading-relaxed pt-1 tracking-wide opacity-90">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === "nutrition" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black flex items-center gap-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 bg-clip-text text-transparent tracking-tighter">
                <div className="bg-emerald-500/20 p-2.5 rounded-2xl text-emerald-500 shadow-xl ring-1 ring-emerald-500/20">
                  <Utensils className="h-8 w-8" />
                </div>
                Growth Fuel
              </h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1 opacity-80">Building blocks for mass</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md p-6 rounded-3xl shadow-xl">
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-2 opacity-80">Daily Intake</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white tracking-tighter">2800</p>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">KCAL</p>
                </div>
              </Card>
              <Card className="border-teal-500/30 bg-teal-500/5 backdrop-blur-md p-6 rounded-3xl shadow-xl">
                <p className="text-[10px] text-teal-500 font-black uppercase tracking-[0.2em] mb-2 opacity-80">Protein Goal</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-white tracking-tighter">100</p>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">GMS</p>
                </div>
              </Card>
            </div>

            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-600/30 via-emerald-700/10 to-transparent p-8 relative overflow-hidden shadow-2xl rounded-[2.5rem] group">
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3 text-emerald-400 tracking-tight">
                  <Zap className="h-7 w-7 fill-emerald-500 animate-pulse" />
                  The Growth Shake
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Whole Milk", amount: "400ml", icon: "🥛" },
                    { label: "Large Banana", amount: "1 Piece", icon: "🍌" },
                    { label: "Rolled Oats", amount: "50g", icon: "🌾" },
                    { label: "Peanut Butter", amount: "2 Spoons", icon: "🥜" }
                  ].map((ing, i) => (
                    <div key={i} className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl ring-1 ring-white/5 group-hover:ring-emerald-500/30 transition-all">
                      <div className="text-2xl">{ing.icon}</div>
                      <div>
                        <p className="text-xs font-black text-zinc-100 uppercase tracking-widest">{ing.label}</p>
                        <p className="text-lg font-black text-emerald-400/90 tracking-tighter">{ing.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Utensils className="h-64 w-64 text-emerald-500" />
              </div>
            </Card>

            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pl-1">Target Milestones</h3>
              <div className="rounded-[2.5rem] border border-zinc-800/40 bg-zinc-900/30 overflow-hidden backdrop-blur-md shadow-2xl">
                {[
                  { label: "Weekly Gain", value: "0.5 kg", sub: "Steady Lean Mass", color: "text-emerald-400" },
                  { label: "Month 1 Goal", value: "52 kg", sub: "Breaking Plateaus", color: "text-emerald-400" },
                  { label: "Month 3 Goal", value: "55 kg", sub: "Aesthetically Visible", color: "text-teal-400" },
                  { label: "Month 6 Goal", value: "60 kg", sub: "Full Transformation", color: "text-emerald-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 border-b border-zinc-800/50 last:border-0 hover:bg-emerald-500/5 transition-all group">
                    <div>
                      <p className="font-black text-zinc-100 text-lg tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-0.5 opacity-70 group-hover:text-emerald-400/70">{item.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tighter ${item.color}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === "calendar" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10 max-w-5xl mx-auto"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black flex items-center gap-4 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 bg-clip-text text-transparent tracking-tighter">
                <div className="bg-rose-500/20 p-2.5 rounded-2xl text-rose-500 shadow-xl ring-1 ring-rose-500/20">
                  <Calendar className="h-8 w-8" />
                </div>
                The Grind
              </h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1 opacity-80">Track your progress</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8 items-start">
              <Card className="border-rose-500/30 bg-rose-500/5 backdrop-blur-md p-6 flex flex-col items-center border-rose-500/20 shadow-2xl rounded-[2.5rem]">
                <UICalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-3xl bg-transparent"
                  classNames={{
                    day: "text-zinc-200 font-bold hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all",
                    selected: "bg-rose-600 text-white font-black rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.5)]",
                    today: "text-rose-400 font-black ring-1 ring-rose-500/50",
                    outside: "text-zinc-600 opacity-30",
                    caption_label: "text-zinc-100 font-black uppercase tracking-widest text-xs",
                    nav_button: "text-zinc-400 hover:text-white transition-colors",
                    head_cell: "text-zinc-500 font-black uppercase text-[10px] tracking-widest pb-4",
                  }}
                  modifiers={{
                    workout: Object.keys(workoutDates).map(d => new Date(d + 'T00:00:00'))
                  }}
                  modifiersClassNames={{
                    workout: "bg-rose-600/20 text-rose-400 font-black rounded-xl ring-1 ring-rose-500/30"
                  }}
                />
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-400">
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                    Completed Workout
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center px-4 leading-relaxed mt-2">
                    Select a date to view your workout performance
                  </p>
                </div>
              </Card>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a day"}
                  </h3>
                  {selectedDateWorkout && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black tracking-widest uppercase text-[9px] px-3">
                      Workout Logged
                    </Badge>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {selectedDateWorkout ? (
                    <motion.div
                      key={selectedDate?.toISOString()}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <Card className="border-zinc-800/40 bg-zinc-900/40 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500/50" />
                        <div className="flex items-center gap-5">
                          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 ring-1 ring-rose-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            <Activity className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-2xl font-black text-white tracking-tight">Day {selectedDateWorkout.day}</p>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                              {selectedDateWorkout.exercises.length} Exercises Completed
                            </p>
                          </div>
                        </div>
                      </Card>

                      <div className="grid gap-3">
                        {selectedDateWorkout.exercises.map((exName, idx) => (
                          <motion.div
                            key={exName}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/40 p-4 rounded-2xl flex items-center justify-between group hover:border-rose-500/30 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                              <span className="font-bold text-zinc-100 group-hover:text-rose-400 transition-colors">{exName}</span>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-60" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800/40 rounded-[2rem] backdrop-blur-md"
                    >
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-5 animate-pulse" />
                      <p className="text-xl font-black text-zinc-400 tracking-tight">No activity logged</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-2">Persistence builds results</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter">System</h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] pl-1 opacity-80">Device Configuration</p>
            </div>
            
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pl-1">Maintenance</h3>
              <div className="grid gap-4">
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
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Wipe all local records</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
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
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Re-sync exercise database</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Button>
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-zinc-900/50">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] pl-1">Build Manifest</h3>
              <Card className="border-zinc-800/40 bg-zinc-900/30 backdrop-blur-md p-7 space-y-5 rounded-[2.5rem] shadow-2xl">
                {[
                  { label: "Architecture", value: "Next.js 15 PWA" },
                  { label: "Data Pipeline", value: "Local Storage Sync" },
                  { label: "Build Version", value: "1.3.0 (Seamless Update)" },
                  { label: "Origin", value: "Orchids AI" }
                ].map((info, i) => (
                  <div key={i} className="flex justify-between text-sm items-center group">
                    <span className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-zinc-200 transition-colors">{info.label}</span>
                    <span className="text-zinc-100 font-black tracking-tight">{info.value}</span>
                  </div>
                ))}
              </Card>
            </div>
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
              <div className="flex-1 overflow-y-auto px-6 pb-24">
                <DrawerHeader className="px-0">
                  <DrawerTitle className="text-3xl font-black text-white tracking-tighter">{selectedExercise.name}</DrawerTitle>
                  <DrawerDescription className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Muscle Focus: Hypertrophy
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="space-y-8 mt-4">
                  <div className="group relative aspect-video w-full overflow-hidden rounded-[2rem] border border-zinc-800/50 shadow-2xl cursor-pointer ring-1 ring-white/5" onClick={() => setIsImageFullscreen(true)}>
                    <img 
                      src={selectedExercise.image} 
                      alt={selectedExercise.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Volume</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.sets} × {selectedExercise.reps}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Recovery</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.rest || "Auto"}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Cadence</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">{selectedExercise.tempo || "3-0-1"}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/50 shadow-inner group transition-all hover:border-indigo-500/30">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Target</p>
                      <p className="text-xl font-black text-indigo-400 tracking-tighter">Mass Gain</p>
                    </div>
                  </div>

                  {selectedExercise.notes && (
                    <div className="rounded-3xl bg-indigo-500/5 p-6 border border-indigo-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Info className="h-12 w-12 text-indigo-400" />
                      </div>
                      <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-2">Coach's Directive</p>
                      <p className="text-sm text-zinc-200 font-bold italic leading-relaxed tracking-wide">"{selectedExercise.notes}"</p>
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
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-500 flex-1 group py-2 ${isActive ? item.color : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <div className={`relative transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105 opacity-60'}`}>
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
