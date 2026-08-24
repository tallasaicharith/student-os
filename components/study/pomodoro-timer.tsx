"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePomodoroStore } from "@/stores/pomodoro.store";
import { cn } from "@/lib/utils";

export function PomodoroTimer() {
  const { mode, secondsLeft, isRunning, cycle, start, pause, reset, tick, nextMode } =
    usePomodoroStore();

  // Tick every second
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const modeLabel = { focus: "Focus", break: "Short Break", longBreak: "Long Break" }[mode];
  const modeColor = {
    focus: "text-blue-500",
    break: "text-green-500",
    longBreak: "text-purple-500",
  }[mode];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>⏱ Pomodoro</span>
          <Badge variant="outline" className={modeColor}>{modeLabel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <motion.div
          key={mode}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("font-mono text-4xl font-bold tracking-wider", modeColor)}
        >
          {mm}:{ss}
        </motion.div>

        <p className="text-xs text-muted-foreground">
          Cycle {cycle} / 4
        </p>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={isRunning ? pause : start}
            className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="outline" onClick={nextMode}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
