"use client";

import { useState } from "react";
import { useWorkout, Exercise } from "@/hooks/useWorkout";
import { seedWorkoutData } from "@/lib/seed-data";
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
  Maximize2
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
    toggleExercise,
    changeVersion,
    setRestTimer
  } = useWorkout();

  const [seeding, setSeeding] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "philosophy" | "nutrition" | "history" | "settings">("workout");
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
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
        
        {activeTab === "workout" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
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
                    <div className="bg-primary/90 text-primary-foreground backdrop-blur-md rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/20">
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
                  <h1 className="text-3xl font-bold tracking-tight text-white">Muscle Gain 60kg</h1>
                  <p className="text-zinc-400">Day {currentDay} • {dayNames[displayDay - 1]}</p>
                </div>
                {!workoutDay && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSeed} 
                    disabled={seeding}
                    className="border-zinc-800 bg-zinc-900 text-xs text-zinc-500 hover:bg-zinc-800"
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
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1 border border-zinc-800 rounded-xl">
                  <TabsTrigger value="versionA" className="rounded-lg data-[state=active]:bg-zinc-800">Master Plan</TabsTrigger>
                  <TabsTrigger value="versionB" className="rounded-lg data-[state=active]:bg-zinc-800">Detailed Plan</TabsTrigger>
                </TabsList>
              </Tabs>
            </header>

            {/* Today's Workout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold">{workoutDay?.title}</h2>
                </div>
                {workoutDay?.exercises.length === 0 && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                    Recovery Day
                  </Badge>
                )}
              </div>

              {workoutDay?.exercises.length ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Today's Progress</span>
                      <span className="text-primary font-medium">{completedExercises.length} of {workoutDay.exercises.length}</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-zinc-900" />
                  </div>

                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {workoutDay.exercises.map((exercise, idx) => {
                        const isCompleted = completedExercises.includes(exercise.name);
                        return (
                          <motion.div
                            key={exercise.name}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                              delay: idx * 0.05 
                            }}
                          >
                            <Card 
                              className={`group relative overflow-hidden border-zinc-800 bg-zinc-900/50 transition-all active:scale-[0.98] ${
                                isCompleted ? 'opacity-40 border-primary/20' : 'hover:border-primary/30'
                              }`}
                            >
                              {isCompleted && (
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  className="absolute left-0 top-0 h-1 bg-primary/30"
                                />
                              )}
                              <div className="flex items-center p-4 gap-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800">
                                  <img 
                                    src={exercise.image} 
                                    alt={exercise.name}
                                    className="h-full w-full object-cover"
                                  />
                                  {isCompleted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
                                      <CheckCircle2 className="h-8 w-8 text-white" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0" onClick={() => setSelectedExercise(exercise)}>
                                  <h3 className="font-semibold text-zinc-100 truncate">{exercise.name}</h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                      <Zap className="h-3 w-3" /> {exercise.sets} × {exercise.reps}
                                    </span>
                                    {exercise.rest && (
                                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {exercise.rest}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExercise(exercise.name);
                                  }}
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                                    isCompleted 
                                      ? 'bg-primary border-primary text-white' 
                                      : 'border-zinc-700 bg-zinc-800 text-transparent hover:border-primary/50'
                                  }`}
                                >
                                  <CheckCircle2 className="h-6 w-6" />
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
                <Card className="border-dashed border-zinc-800 bg-transparent py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Calendar className="h-12 w-12 text-zinc-700" />
                    <h3 className="text-lg font-medium text-zinc-300">Rest & Recover</h3>
                    <p className="max-w-xs text-sm text-zinc-500 px-6">
                      Muscle grows during rest. Follow the nutrition guidelines to keep gaining.
                    </p>
                    <Button 
                      onClick={() => toggleExercise("Rest Complete")}
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8"
                    >
                      Mark Rest Day Complete
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Nutrition Quick Tip */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Nutrition Tip</h3>
              </div>
              <p className="text-sm text-zinc-400 italic">
                Hard Gainers: 4-5 meals mandatory. Don't skip your milk + banana + oats + peanut butter shake!
              </p>
            </section>
          </motion.div>
        )}

        {activeTab === "philosophy" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                Training Philosophy
              </h2>
              <p className="text-zinc-400 text-sm italic">Read once, remember forever.</p>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Progressive Overload", desc: "Muscle grows from progressive overload, not exhaustion.", icon: TrendingUp },
                { title: "Hypertrophy Range", desc: "You will train in the hypertrophy range (6–12 reps).", icon: Zap },
                { title: "Slow Negatives", desc: "Slow negatives (3–4 sec) increase muscle stimulus.", icon: Clock },
                { title: "Mandatory Rest", desc: "Rest days are mandatory for hard gainers.", icon: Calendar },
                { title: "Calories & Muscle", desc: "Calories drive scale weight; training shapes the muscle.", icon: Dumbbell },
              ].map((item, idx) => (
                <Card key={idx} className="border-zinc-800 bg-zinc-900/50 p-4 flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Progression & Deload Rules</h3>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
                <ul className="space-y-4 text-sm text-zinc-300">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">01.</span>
                    Add 1 rep per set weekly until top range.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">02.</span>
                    Then add 1 extra set OR slow tempo further.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">03.</span>
                    Deload every 6th week (reduce volume by 40%).
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">04.</span>
                    If bodyweight stalls 14 days → add calories.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "nutrition" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Utensils className="h-8 w-8 text-primary" />
                Hard Gainer Nutrition
              </h2>
              <p className="text-zinc-400 text-sm italic">Fuel your growth.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 uppercase font-bold">Daily Calories</p>
                <p className="text-xl font-bold text-primary">2600–2800 kcal</p>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 uppercase font-bold">Daily Protein</p>
                <p className="text-xl font-bold text-primary">90–100 g</p>
              </Card>
            </div>

            <Card className="border-zinc-800 bg-primary/10 p-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Daily Growth Shake
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Milk
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Banana
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Oats
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Peanut Butter
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <Utensils className="h-32 w-32" />
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Target Gains</h3>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                {[
                  { label: "Weekly Gain", value: "0.4–0.6 kg", sub: "Steady progress" },
                  { label: "Month 1 Target", value: "52–53 kg", sub: "Initial push" },
                  { label: "Month 3 Target", value: "55–56 kg", sub: "Building base" },
                  { label: "Month 6 Target", value: "58–60 kg", sub: "Transformation" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="font-bold text-zinc-200">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{item.sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Workout History</h2>
            <div className="space-y-4">
              {historyDays.length > 0 ? (
                historyDays.map((day) => {
                  const dayExercises = history[day] || [];
                  const isToday = day === currentDay;
                  return (
                    <Card key={day} className={`border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between ${isToday ? 'border-primary/50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isToday ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold">Day {day} {isToday && <span className="text-[10px] ml-1 uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded">Today</span>}</p>
                          <p className="text-xs text-zinc-500">{dayExercises.length} Exercises Completed</p>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {dayExercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="h-6 w-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            {ex.charAt(0)}
                          </div>
                        ))}
                        {dayExercises.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            +{dayExercises.length - 3}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-20 text-zinc-600">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No history yet. Start your first workout!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Settings</h2>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Account & Progress</h3>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-zinc-800 bg-zinc-900 hover:bg-zinc-800 h-14 rounded-xl"
                  onClick={resetProgress}
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-red-500" />
                    <span className="text-zinc-100">Reset All Progress</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-zinc-800 bg-zinc-900 hover:bg-zinc-800 h-14 rounded-xl"
                  onClick={handleSeed}
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-emerald-500" />
                    <span className="text-zinc-100">Refresh Workout Data</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600" />
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">App Info</h3>
              <Card className="border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Version</span>
                  <span className="text-zinc-300">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Storage</span>
                  <span className="text-zinc-300">Local + Cloud Sync</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Plan</span>
                  <span className="text-zinc-300">Muscle Gain 60kg</span>
                </div>
              </Card>
            </div>
          </div>
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
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl z-50">
        <div className="mx-auto max-w-2xl px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab("workout")}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${activeTab === "workout" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Workout</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("philosophy")}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${activeTab === "philosophy" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Rules</span>
          </button>

          <button 
            onClick={() => setActiveTab("nutrition")}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${activeTab === "nutrition" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Utensils className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Diet</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${activeTab === "history" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <History className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">History</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${activeTab === "settings" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
