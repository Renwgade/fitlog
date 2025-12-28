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
  Zap
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
    toggleExercise,
    changeVersion
  } = useWorkout();

  const [seeding, setSeeding] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "history" | "settings">("workout");

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
      <div className="mx-auto max-w-2xl px-4 pt-8 space-y-8 md:px-8">
        
        {activeTab === "workout" && (
          <>
            {/* Header */}
            <header className="flex flex-col gap-4">
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className={`group relative overflow-hidden border-zinc-800 bg-zinc-900/50 transition-all active:scale-[0.98] ${isCompleted ? 'opacity-60' : ''}`}>
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
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Workout History</h2>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium">Day {currentDay - (i + 1)}</p>
                      <p className="text-xs text-zinc-500">Completed on Dec {28 - (i + 1)}, 2025</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500">Syncing...</Badge>
                </Card>
              ))}
              <p className="text-center text-sm text-zinc-500 py-8">
                History tracking will be fully enabled after Firebase configuration.
              </p>
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
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
                  <img 
                    src={selectedExercise.image} 
                    alt={selectedExercise.name}
                    className="h-full w-full object-cover"
                  />
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
        <div className="mx-auto max-w-2xl px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab("workout")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "workout" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Workout</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "history" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <History className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "settings" ? 'text-primary' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
