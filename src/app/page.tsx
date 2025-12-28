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
  Activity
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

  const historyDays = Object.keys(history)
    .map(Number)
    .sort((a, b) => b - a);

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            backgroundColor: 
              themeColor === "indigo" ? "rgba(99, 102, 241, 0.05)" : 
              themeColor === "amber" ? "rgba(245, 158, 11, 0.05)" : 
              themeColor === "emerald" ? "rgba(16, 185, 129, 0.05)" : 
              themeColor === "rose" ? "rgba(244, 63, 94, 0.05)" : "rgba(113, 113, 122, 0.05)"
          }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            backgroundColor: 
              themeColor === "indigo" ? "rgba(79, 70, 229, 0.03)" : 
              themeColor === "amber" ? "rgba(217, 119, 6, 0.03)" : 
              themeColor === "emerald" ? "rgba(5, 150, 105, 0.03)" : 
              themeColor === "rose" ? "rgba(225, 29, 72, 0.03)" : "rgba(82, 82, 91, 0.03)"
          }}
          className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] blur-[100px] rounded-full"
        />
      </div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isImageFullscreen && selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
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

      <div className="mx-auto max-w-2xl px-4 pt-8 space-y-8 md:px-8">
        {activeTab === "workout" ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
                    className="fixed top-4 left-4 right-4 z-[60] mx-auto max-w-sm"
                  >
                    <div className="bg-indigo-600/90 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2 animate-pulse">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Rest Timer</p>
                          <p className="text-2xl font-black tabular-nums">{formatTime(restTimer.seconds)}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-none"
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
                  <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    Muscle Gain 60kg
                  </h1>
                  <p className="text-zinc-400 font-medium">Day {currentDay} • {dayNames[displayDay - 1]}</p>
                </div>
                {!workoutDay && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSeed} 
                    disabled={seeding}
                    className="border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-400 hover:bg-indigo-500/20"
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
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <TabsTrigger value="versionA" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Master Plan</TabsTrigger>
                  <TabsTrigger value="versionB" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Detailed Plan</TabsTrigger>
                </TabsList>
              </Tabs>
            </header>

            {/* Today's Workout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">{workoutDay?.title}</h2>
                </div>
                {workoutDay?.exercises.length === 0 && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Recovery Day
                  </Badge>
                )}
              </div>

              {workoutDay?.exercises.length ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <span>Today's Progress</span>
                      <span className="text-indigo-400">{completedExercises.length} / {workoutDay.exercises.length}</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full" style={{ width: `${progress}%` }} />
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card 
                              className={`group relative overflow-hidden border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm transition-all hover:bg-zinc-900/60 active:scale-[0.98] ${
                                isCompleted ? 'opacity-50 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:border-indigo-500/30'
                              }`}
                            >
                              {isCompleted && (
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  className="absolute left-0 top-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                />
                              )}
                              <div className="flex items-center p-4 gap-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800 shadow-inner">
                                  <img 
                                    src={exercise.image} 
                                    alt={exercise.name}
                                    className="h-full w-full object-cover"
                                  />
                                  {isCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 backdrop-blur-[1px]">
                                      <CheckCircle2 className="h-8 w-8 text-white shadow-lg" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0" onClick={() => setSelectedExercise(exercise)}>
                                  <h3 className="font-bold text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">{exercise.name}</h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 flex items-center gap-1 bg-zinc-800/50 px-2 py-0.5 rounded-md">
                                      <Zap className="h-3 w-3 text-amber-500" /> {exercise.sets} × {exercise.reps}
                                    </span>
                                    {exercise.rest && (
                                      <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 flex items-center gap-1 bg-zinc-800/50 px-2 py-0.5 rounded-md">
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
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                                    isCompleted 
                                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                                      : 'border-zinc-800 bg-zinc-800/50 text-transparent hover:border-indigo-500/50 hover:bg-indigo-500/10'
                                  }`}
                                >
                                  <CheckCircle2 className={`h-6 w-6 ${isCompleted ? 'opacity-100' : 'opacity-20 group-hover:opacity-50 text-indigo-400'}`} />
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
                <Card className="border-dashed border-zinc-800 bg-zinc-900/20 py-12 text-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
                      <Calendar className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100">Rest & Recover</h3>
                    <p className="max-w-xs text-sm text-zinc-400 px-6 italic">
                      "Muscle grows during rest, not during the workout."
                    </p>
                    <Button 
                      onClick={() => toggleExercise("Rest Complete")}
                      className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-10 shadow-lg shadow-emerald-600/20"
                    >
                      Mark Rest Day Complete
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Nutrition Quick Tip */}
            <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Utensils className="h-12 w-12 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                  <Info className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/80">Growth Fuel</h3>
              </div>
              <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                Hard Gainers: 4-5 meals mandatory. Don't skip your <span className="text-indigo-400">milk + banana + oats + peanut butter</span> shake!
              </p>
            </section>
          </motion.div>
        ) : activeTab === "philosophy" ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                <div className="bg-amber-500/20 p-2 rounded-2xl text-amber-500">
                  <BookOpen className="h-8 w-8" />
                </div>
                Training Rules
              </h2>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest pl-1">The Iron Commandments</p>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Progressive Overload", desc: "Muscle grows from progressive overload, not exhaustion.", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "Hypertrophy Range", desc: "You will train in the hypertrophy range (6–12 reps).", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
                { title: "Slow Negatives", desc: "Slow negatives (3–4 sec) increase muscle stimulus.", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
                { title: "Mandatory Rest", desc: "Rest days are mandatory for hard gainers.", icon: Calendar, color: "text-orange-400", bg: "bg-orange-400/10" },
                { title: "Calories & Muscle", desc: "Calories drive scale weight; training shapes the muscle.", icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, idx) => (
                <Card key={idx} className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-4 flex gap-4 hover:border-amber-500/30 transition-all group">
                  <div className={`h-12 w-12 shrink-0 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-inner group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-snug">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Progression Protocol</h3>
              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-5 backdrop-blur-sm">
                {[
                  "Add 1 rep per set weekly until top range.",
                  "Then add 1 extra set OR slow tempo further.",
                  "Deload every 6th week (reduce volume by 40%).",
                  "If bodyweight stalls 14 days → add calories."
                ].map((rule, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-500">
                      0{i+1}
                    </span>
                    <p className="text-sm text-zinc-300 font-medium">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === "nutrition" ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                <div className="bg-emerald-500/20 p-2 rounded-2xl text-emerald-500">
                  <Utensils className="h-8 w-8" />
                </div>
                Growth Fuel
              </h2>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest pl-1">Eating for Size</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-zinc-800/50 bg-emerald-500/5 backdrop-blur-sm p-5 border-emerald-500/20">
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Daily Intake</p>
                <p className="text-2xl font-black text-white">2800 <span className="text-xs text-zinc-500">KCAL</span></p>
              </Card>
              <Card className="border-zinc-800/50 bg-teal-500/5 backdrop-blur-sm p-5 border-teal-500/20">
                <p className="text-[10px] text-teal-500 font-black uppercase tracking-widest mb-1">Protein Goal</p>
                <p className="text-2xl font-black text-white">100 <span className="text-xs text-zinc-500">G</span></p>
              </Card>
            </div>

            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-teal-600/10 p-6 relative overflow-hidden shadow-xl shadow-emerald-500/5">
              <div className="relative z-10 space-y-5">
                <h3 className="text-xl font-black flex items-center gap-2 text-emerald-400">
                  <Zap className="h-6 w-6 fill-emerald-500" />
                  The Growth Shake
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Whole Milk", amount: "400ml" },
                    { label: "Banana", amount: "1 Large" },
                    { label: "Rolled Oats", amount: "50g" },
                    { label: "Peanut Butter", amount: "2 Spoons" }
                  ].map((ing, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{ing.label}</p>
                        <p className="text-[10px] text-emerald-500/70 font-black">{ing.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                <Utensils className="h-40 w-40 text-emerald-500" />
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Target Milestones</h3>
              <div className="rounded-3xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden backdrop-blur-sm">
                {[
                  { label: "Weekly Gain", value: "0.5 kg", sub: "Steady growth", color: "text-emerald-400" },
                  { label: "Month 1 Target", value: "52 kg", sub: "Breaking plateaus", color: "text-emerald-400" },
                  { label: "Month 3 Target", value: "55 kg", sub: "Visible change", color: "text-teal-400" },
                  { label: "Month 6 Target", value: "60 kg", sub: "Full transformation", color: "text-emerald-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 border-b border-zinc-800/50 last:border-0 hover:bg-emerald-500/5 transition-colors">
                    <div>
                      <p className="font-bold text-zinc-100">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{item.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === "calendar" ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
                <div className="bg-rose-500/20 p-2 rounded-2xl text-rose-500">
                  <Calendar className="h-8 w-8" />
                </div>
                Consistency
              </h2>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest pl-1">Your Journey</p>
            </div>
            
            <Card className="border-zinc-800/50 bg-rose-500/5 backdrop-blur-sm p-6 flex justify-center border-rose-500/20 shadow-xl shadow-rose-500/5">
              <UICalendar
                mode="single"
                className="rounded-xl bg-transparent text-white"
                modifiers={{
                  workout: Object.keys(workoutDates).map(d => new Date(d + 'T00:00:00'))
                }}
                modifiersClassNames={{
                  workout: "bg-rose-600 text-white font-black rounded-full shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:bg-rose-500"
                }}
              />
            </Card>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Activity Feed</h3>
              <div className="grid gap-3">
                {Object.entries(workoutDates).length > 0 ? (
                  Object.entries(workoutDates)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 5)
                    .map(([date, data]) => (
                      <Card key={date} className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-4 flex items-center justify-between hover:border-rose-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shadow-inner">
                            <Activity className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-black text-zinc-100">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Day {data.day} • {data.exercises.length} Exercises Done</p>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-16 text-zinc-700 border-2 border-dashed border-zinc-800/50 rounded-3xl backdrop-blur-sm">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-10 animate-pulse" />
                    <p className="text-lg font-bold text-zinc-600">The first step is always the hardest.</p>
                    <p className="text-xs font-medium uppercase tracking-widest mt-2">Start your workout today</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 relative z-10"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black bg-gradient-to-r from-zinc-400 to-zinc-200 bg-clip-text text-transparent">Settings</h2>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest pl-1">Configuration</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Maintenance</h3>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 h-16 rounded-2xl group transition-all"
                  onClick={resetProgress}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-zinc-100">Reset All Progress</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 h-16 rounded-2xl group transition-all"
                  onClick={handleSeed}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-zinc-100">Refresh Workout Data</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">App Information</h3>
              <Card className="border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm p-5 space-y-4 rounded-3xl">
                {[
                  { label: "App Version", value: "1.2.0 (Colorful Update)" },
                  { label: "Data Storage", value: "Local Browser Sync" },
                  { label: "Current Plan", value: "Muscle Gain 60kg" },
                  { label: "Developer", value: "Orchids AI" }
                ].map((info, i) => (
                  <div key={i} className="flex justify-between text-sm items-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-tight text-[10px]">{info.label}</span>
                    <span className="text-zinc-100 font-black">{info.value}</span>
                  </div>
                ))}
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      {/* Exercise Detail Drawer */}
      <Drawer open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DrawerContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          {selectedExercise && (
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="text-2xl text-white">{selectedExercise.name}</DrawerTitle>
                <DrawerDescription className="text-zinc-400">
                  {workoutDay?.title}
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-6">
                <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl cursor-pointer" onClick={() => setIsImageFullscreen(true)}>
                  <img 
                    src={selectedExercise.image} 
                    alt={selectedExercise.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/20">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Sets & Reps</p>
                    <p className="text-lg font-bold text-primary">{selectedExercise.sets} × {selectedExercise.reps}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Rest Period</p>
                    <p className="text-lg font-bold text-primary">{selectedExercise.rest || "N/A"}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Tempo</p>
                    <p className="text-lg font-bold text-primary">{selectedExercise.tempo || "Normal"}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Focus</p>
                    <p className="text-lg font-bold text-primary">Muscle Gain</p>
                  </div>
                </div>

                {selectedExercise.notes && (
                  <div className="rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/20">
                    <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Trainer's Note</p>
                    <p className="text-sm text-zinc-300 italic">"{selectedExercise.notes}"</p>
                  </div>
                )}
              </div>
              <DrawerFooter className="flex flex-row gap-3">
                <Button 
                  className="flex-1 h-12 rounded-xl text-lg font-bold"
                  onClick={() => {
                    toggleExercise(selectedExercise.name);
                    setSelectedExercise(null);
                  }}
                >
                  {completedExercises.includes(selectedExercise.name) ? "Undo Complete" : "Mark as Done"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="h-12 w-12 rounded-xl p-0 border-zinc-800">
                    ✕
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-2xl z-50">
        <div className="flex items-center justify-between px-6 py-2 border-b border-zinc-900/50 bg-zinc-900/40">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            LIVE: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <Activity className="h-3 w-3 text-indigo-500 animate-bounce" />
            SESSION: <span className="text-zinc-300">{formatSessionTime(sessionTime)}</span>
          </div>
        </div>
        <div className="mx-auto max-w-2xl px-4 h-18 flex items-center justify-between pb-safe">
          {[
            { id: "workout", icon: Home, label: "Workout", color: "text-indigo-500", glow: "shadow-indigo-500/20" },
            { id: "philosophy", icon: BookOpen, label: "Rules", color: "text-amber-500", glow: "shadow-amber-500/20" },
            { id: "nutrition", icon: Utensils, label: "Diet", color: "text-emerald-500", glow: "shadow-emerald-500/20" },
            { id: "calendar", icon: Calendar, label: "Calendar", color: "text-rose-500", glow: "shadow-rose-500/20" },
            { id: "settings", icon: Settings, label: "Settings", color: "text-zinc-400", glow: "shadow-zinc-400/20" }
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 group py-3 ${isActive ? item.color : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow"
                    className={`absolute inset-x-2 inset-y-1 bg-current opacity-10 blur-xl rounded-full pointer-events-none`}
                  />
                )}
                <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
                  <item.icon className={`h-6 w-6 ${isActive ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full"
                    />
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
