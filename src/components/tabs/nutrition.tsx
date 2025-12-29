"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Zap, Utensils } from "lucide-react";

export default function NutritionTab() {
  return (
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
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-0.5 opacity-100 group-hover:text-emerald-400/70">{item.sub}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black tracking-tighter ${item.color}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}