import { create } from "zustand";

type PomodoroMode = "focus" | "break" | "longBreak";

interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  cycle: number;
  totalMinutesLogged: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  nextMode: () => void;
}

const DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "focus",
  secondsLeft: DURATIONS.focus,
  isRunning: false,
  cycle: 1,
  totalMinutesLogged: 0,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () =>
    set((state) => ({
      isRunning: false,
      secondsLeft: DURATIONS[state.mode],
    })),

  tick: () => {
    const { secondsLeft, nextMode, totalMinutesLogged, mode } = get();
    if (secondsLeft <= 1) {
      nextMode();
      if (mode === "focus") {
        set({ totalMinutesLogged: totalMinutesLogged + 25 });
      }
    } else {
      set({ secondsLeft: secondsLeft - 1 });
    }
  },

  nextMode: () => {
    const { mode, cycle } = get();
    let nextMode: PomodoroMode;
    let nextCycle = cycle;

    if (mode === "focus") {
      nextMode = cycle % 4 === 0 ? "longBreak" : "break";
      nextCycle = cycle + 1;
    } else {
      nextMode = "focus";
    }

    set({
      mode: nextMode,
      secondsLeft: DURATIONS[nextMode],
      isRunning: false,
      cycle: nextCycle,
    });
  },
}));
