"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Clock, Calendar, Dumbbell, BookOpen } from "lucide-react";

export default function PhilosophyTab() {
  return (
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
                {i + 1}
              </span>
              <p className="text-sm text-zinc-100 font-bold leading-relaxed pt-1 tracking-wide opacity-90">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}