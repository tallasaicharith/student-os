"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Trophy, Plus, Droplet, Trash2, TrendingUp, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

interface WorkoutItem {
  id: string;
  day: string;
  name: string;
  exercises: string;
}

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  logged: boolean;
}

export default function FitnessHubPage() {
  const [water, setWater] = useState(1250); // ml
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([
    { id: "w1", day: "Mon / Thu", name: "Chest + Triceps", exercises: "Bench press, Incline Dumbbell, Cable Flyes, Skullcrushers" },
    { id: "w2", day: "Tue / Fri", name: "Back + Biceps", exercises: "Barbell Deadlifts, Lat Pull-downs, Cable Rows, Bicep Curls" },
    { id: "w3", day: "Wed / Sat", name: "Legs + Shoulders", exercises: "Barbell Squats, Leg Press, Overhead Shoulder Press, Lateral Raises" }
  ]);

  const [meals, setMeals] = useState<MealItem[]>([
    { id: "m1", name: "🍳 Breakfast: Eggs & Toast", calories: 450, protein: 24, logged: true },
    { id: "m2", name: "🍗 Lunch: Chicken Breast & Rice", calories: 750, protein: 45, logged: true },
    { id: "m3", name: "🥤 Snack: Whey Protein Shake", calories: 250, protein: 28, logged: false },
    { id: "m4", name: "🐟 Dinner: Fish & Whole Grain Roti", calories: 600, protein: 35, logged: false }
  ]);

  // Dialog state for adding workout
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [wDay, setWDay] = useState("Mon / Thu");
  const [wName, setWName] = useState("");
  const [wExercises, setWExercises] = useState("");

  // Dialog state for adding meal
  const [mealOpen, setMealOpen] = useState(false);
  const [mName, setMName] = useState("");
  const [mCalories, setMCalories] = useState("400");
  const [mProtein, setMProtein] = useState("30");

  const handleDrinkWater = () => {
    setWater((prev) => prev + 250);
    toast.success("Logged +250ml Water! 💧");
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName.trim()) return;

    const newWorkout: WorkoutItem = {
      id: Math.random().toString(),
      day: wDay,
      name: wName.trim(),
      exercises: wExercises.trim() || "Custom exercises",
    };

    setWorkouts((prev) => [...prev, newWorkout]);
    setWName("");
    setWExercises("");
    setWorkoutOpen(false);
    toast.success(`Added workout split: ${newWorkout.name}! 🏋️`);
  };

  const handleDeleteWorkout = (id: string, name: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    toast.success(`Removed ${name} routine`);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;

    const newMeal: MealItem = {
      id: Math.random().toString(),
      name: mName.trim(),
      calories: parseInt(mCalories) || 300,
      protein: parseInt(mProtein) || 20,
      logged: true,
    };

    setMeals((prev) => [...prev, newMeal]);
    setMName("");
    setMealOpen(false);
    toast.success(`Logged meal: ${newMeal.name}! 🥗`);
  };

  const toggleMealLogged = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, logged: !m.logged } : m))
    );
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    toast.success("Meal entry removed");
  };

  // Calculations
  const loggedMeals = meals.filter((m) => m.logged);
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="💪 Fitness Hub" description="Track workouts, running distance, protein target, and recovery">
        <Button variant="outline" className="gap-2" onClick={handleDrinkWater}>
          <Droplet className="w-4 h-4 text-blue-500 fill-blue-500/20" /> Log 250ml Water ({water}ml / 3000ml)
        </Button>
      </PageHeader>

      {/* Stats Summary Rows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Calories Tracker */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Calories Consumed</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">{totalCalories}</span>
              <span className="text-xs text-muted-foreground">Goal: 2,500 kcal</span>
            </div>
            <Progress value={Math.min(100, (totalCalories / 2500) * 100)} className="h-1.5 bg-orange-500/10" />
          </CardContent>
        </Card>

        {/* Protein Tracker */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Protein Target</span>
              <Dumbbell className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">{totalProtein}g</span>
              <span className="text-xs text-muted-foreground">Goal: 140g</span>
            </div>
            <Progress value={Math.min(100, (totalProtein / 140) * 100)} className="h-1.5 bg-blue-500/10" />
          </CardContent>
        </Card>

        {/* Running Mileage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Water Hydration</span>
              <Droplet className="w-4 h-4 text-blue-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">{(water / 1000).toFixed(1)}L</span>
              <span className="text-xs text-muted-foreground">Goal: 3.0 L</span>
            </div>
            <Progress value={Math.min(100, (water / 3000) * 100)} className="h-1.5 bg-blue-400/20" />
          </CardContent>
        </Card>

        {/* Workout Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Workout Routines</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">{workouts.length}</span>
              <span className="text-xs text-muted-foreground">Active Splits</span>
            </div>
            <Progress value={Math.min(100, (workouts.length / 5) * 100)} className="h-1.5 bg-yellow-500/10" />
          </CardContent>
        </Card>

      </div>

      {/* Bottom Row: Exercise routines & Diet log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workout split */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-500" />
                Gym Workout Routines ({workouts.length})
              </CardTitle>
              <CardDescription>Manage your weekly strength & fitness splits</CardDescription>
            </div>

            <Dialog open={workoutOpen} onOpenChange={setWorkoutOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Routine
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Gym Workout Routine</DialogTitle>
                  <DialogDescription>Create a new workout split (e.g. Chest & Triceps, Leg Day).</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddWorkout} className="space-y-3 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Routine Name</label>
                    <Input placeholder="e.g. Push Day (Chest + Shoulders)" value={wName} onChange={(e) => setWName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Days Schedule</label>
                    <Input placeholder="e.g. Mon / Thu" value={wDay} onChange={(e) => setWDay(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Exercises List</label>
                    <Input placeholder="e.g. Bench press, Incline DB, Tricep pushdowns" value={wExercises} onChange={(e) => setWExercises(e.target.value)} />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Add Routine
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {workouts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No routines added. Click "Add Routine" above!</p>
            ) : (
              workouts.map((routine) => (
                <div key={routine.id} className="p-3 bg-muted/40 border rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold">{routine.day} — {routine.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{routine.exercises}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteWorkout(routine.id, routine.name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Nutritional Diet log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Diet & Meal Log ({meals.length})
              </CardTitle>
              <CardDescription>Log daily meals and track protein intake</CardDescription>
            </div>

            <Dialog open={mealOpen} onOpenChange={setMealOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                  <Plus className="w-3.5 h-3.5" /> Log Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Meal / Snack</DialogTitle>
                  <DialogDescription>Add calories and protein for nutrition tracking.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddMeal} className="space-y-3 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Meal Name</label>
                    <Input placeholder="e.g. Oatmeal & Banana" value={mName} onChange={(e) => setMName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Calories (kcal)</label>
                      <Input type="number" value={mCalories} onChange={(e) => setMCalories(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Protein (g)</label>
                      <Input type="number" value={mProtein} onChange={(e) => setMProtein(e.target.value)} required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Add Meal Log
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {meals.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No meals logged today.</p>
            ) : (
              meals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-muted/40 border rounded-lg">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">{item.name}</p>
                    <span className="text-[10px] text-muted-foreground">{item.calories} kcal | {item.protein}g Protein</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={item.logged ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px]"
                      onClick={() => toggleMealLogged(item.id)}
                    >
                      {item.logged ? "Logged ✓" : "Mark Eaten"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteMeal(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
