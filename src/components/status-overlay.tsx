"use client";

import { useEffect, useState } from "react";

export default function StatusOverlay({ todaySeconds = 0 }: { todaySeconds?: number }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex justify-between items-center pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
      <div className="text-[10px] font-black tracking-widest text-zinc-200">
        {currentTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || ""}
      </div>
      <div className="text-[10px] font-black tracking-widest text-zinc-200">
        {formatSessionTime(todaySeconds)}
      </div>
    </div>
  );
}