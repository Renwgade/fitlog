"use client";

import { useState, useEffect } from "react";

export default function useRestTimer() {
    const [restTimer, setRestTimer] = useState<{
        active: boolean;
        seconds: number;
    }>({ active: false, seconds: 0 });

    useEffect(() => {
        let interval: any;

        if (restTimer.active && restTimer.seconds > 0) {
            interval = setInterval(() => {
                setRestTimer((prev) => ({
                    ...prev,
                    seconds: Math.max(prev.seconds - 1, 0),
                }));
            }, 1000);
        } else if (restTimer.seconds === 0) {
            setRestTimer((prev) => ({ ...prev, active: false }));
        }

        return () => clearInterval(interval);
    }, [restTimer.active, restTimer.seconds]);

    const startTimer = (seconds: number) => {
        setRestTimer({ active: true, seconds });
    };

    return { restTimer, startTimer, setRestTimer };
}
