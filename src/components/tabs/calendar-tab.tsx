"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import { Calendar, Activity, CheckCircle2 } from "lucide-react";

interface Props {
  selectedDate: Date | undefined;
  setSelectedDate: (d?: Date) => void;
  workoutDates: Record<string, { day: number; exercises: string[] }>;
  selectedDateWorkout: { day: number; exercises: string[] } | null;
  selectedDayPlan: { title: string; exercises: any[] } | null;
  setSelectedExercise: (ex: any) => void;
}

export default function CalendarTab({
  selectedDate,
  setSelectedDate,
  workoutDates,
  selectedDateWorkout,
  selectedDayPlan,
  setSelectedExercise,
}: Props) {
  return (
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
              outside: "text-zinc-500",
              caption_label: "text-zinc-100 font-black uppercase tracking-widest text-xs",
              nav_button: "text-zinc-400 hover:text-white transition-colors",
              head_cell: "text-zinc-500 font-black uppercase text-[10px] tracking-widest pb-4",
            }}
            modifiers={{
              workout: Object.keys(workoutDates).map((d) => new Date(d + "T00:00:00")),
            }}
            modifiersClassNames={{
              workout: "bg-rose-600/20 text-rose-400 font-black rounded-xl ring-1 ring-rose-500/30",
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
              {selectedDate
                ? selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
                : "Select a day"}
            </h3>
            {selectedDateWorkout && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black tracking-widest uppercase text-[9px] px-3">
                Workout Logged
              </Badge>
            )}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {selectedDayPlan ? (
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
                        <p className="text-2xl font-black text-white tracking-tight">
                          {selectedDateWorkout ? `Day ${selectedDateWorkout.day}` : selectedDayPlan.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-rose-500/10 text-rose-400 border-0 text-[10px] font-black uppercase tracking-widest">
                            {selectedDateWorkout
                              ? `${selectedDateWorkout.exercises.length} / ${selectedDayPlan.exercises.length} Done`
                              : "No activity"}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-bold">•</span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            {selectedDateWorkout ? "History Log" : "Planned Workout"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    {selectedDayPlan.exercises.length > 0 ? (
                      selectedDayPlan.exercises.map((exercise: any, idx: number) => {
                        const isDone = selectedDateWorkout?.exercises.includes(exercise.name);
                        return (
                          <motion.div
                            key={exercise.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedExercise(exercise)}
                            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                              isDone
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                : "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 opacity-60 hover:opacity-100 hover:border-rose-500/30"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                                  isDone
                                    ? "bg-rose-500 border-rose-400 text-white"
                                    : "bg-zinc-800 border-zinc-700 text-transparent"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div>
                                <p className={`font-bold transition-colors ${isDone ? "text-rose-400" : "text-zinc-300"}`}>{exercise.name}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                                  {exercise.sets} × {exercise.reps}
                                </p>
                              </div>
                            </div>
                            {isDone && <CheckCircle2 className="h-5 w-5 opacity-40 shrink-0" />}
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-zinc-400 text-sm">No workout scheduled.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-400 text-sm">
                  Select a date to view details.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}