"use client";

import { useState } from "react";
import { useWorkout } from "@/hooks/useWorkout";
import { seedWorkoutData } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Dumbbell, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleSeed = async () => {
    setSeeding(true);
    await seedWorkoutData();
    setSeeding(false);
    window.location.reload();
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
    <div className="min-h-screen bg-zinc-950 p-4 pb-20 text-zinc-100 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Muscle Gain 60kg</h1>
              <p className="text-zinc-400">Day {currentDay} • {dayNames[displayDay - 1]}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSeed} 
              disabled={seeding}
              className="border-zinc-800 bg-zinc-900 text-xs text-zinc-500 hover:bg-zinc-800"
            >
              {seeding ? "Seeding..." : "Refresh Data"}
            </Button>
          </div>

          <Tabs 
            defaultValue={selectedVersion} 
            onValueChange={(v) => changeVersion(v as "versionA" | "versionB")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1 border border-zinc-800">
              <TabsTrigger value="versionA" className="data-[state=active]:bg-zinc-800">Master Plan</TabsTrigger>
              <TabsTrigger value="versionB" className="data-[state=active]:bg-zinc-800">Detailed Plan</TabsTrigger>
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
                  <span className="text-zinc-400">Progress</span>
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
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`overflow-hidden border-zinc-800 bg-zinc-900 transition-colors ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                          <div className="relative h-40 w-full overflow-hidden">
                            <img 
                              src={exercise.image} 
                              alt={exercise.name}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                              <Badge variant="outline" className="bg-black/50 backdrop-blur-md border-zinc-700 text-zinc-300">
                                {exercise.sets} Sets × {exercise.reps}
                              </Badge>
                              <div 
                                onClick={() => toggleExercise(exercise.name)}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                                  isCompleted 
                                    ? 'bg-primary border-primary text-white scale-110' 
                                    : 'border-zinc-600 bg-black/40 text-transparent hover:border-primary/50'
                                }`}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                            </div>
                          </div>
                          <CardHeader className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                                <CardDescription className="mt-1 flex gap-2 text-xs">
                                  {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                                  {exercise.rest && <span>• Rest: {exercise.rest}</span>}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          {exercise.notes && (
                            <CardContent className="px-4 pb-4 pt-0">
                              <p className="text-sm text-zinc-500 italic">Note: {exercise.notes}</p>
                            </CardContent>
                          )}
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
                <p className="max-w-xs text-sm text-zinc-500">
                  Muscle grows during rest. Follow the nutrition guidelines to keep gaining.
                </p>
                <Button 
                  onClick={() => toggleExercise("Rest Complete")}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  Mark Rest Day Complete
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Nutrition Tips */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Daily Nutrition</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-zinc-400">Calories</p>
              <p className="text-xl font-bold">2600-2800 kcal</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-400">Protein</p>
              <p className="text-xl font-bold">90-100 g</p>
            </div>
          </div>
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-400">
              <span className="text-primary font-medium italic">Hard Gainer Tip:</span> 4-5 meals mandatory. Drink your milk + banana + oats + peanut butter shake!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
