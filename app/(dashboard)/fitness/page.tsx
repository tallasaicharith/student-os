"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Trophy, Calendar, Plus, RefreshCw, BarChart, Droplet,
  Sparkles, CheckCircle2, TrendingUp, Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function FitnessHubPage() {
  const [water, setWater] = useState(0); // ml

  const handleDrinkWater = () => {
    setWater((prev) => prev + 250);
    toast.success("Logged 250ml Water Intake! 💧");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="💪 Fitness Hub" description="Track workouts, running distance, protein target, and recovery">
        <Button variant="outline" className="gap-2" onClick={handleDrinkWater}>
          <Droplet className="w-4 h-4 text-blue-500 fill-blue-500/20" /> Log 250ml Water ({water}ml)
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
              <span className="text-3xl font-extrabold">0</span>
              <span className="text-xs text-muted-foreground">Goal: 2,700 kcal</span>
            </div>
            <Progress value={0} className="h-1.5 bg-orange-500/10" />
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
              <span className="text-3xl font-extrabold">0g</span>
              <span className="text-xs text-muted-foreground">Goal: 140g</span>
            </div>
            <Progress value={0} className="h-1.5 bg-blue-500/10" />
          </CardContent>
        </Card>

        {/* Running Mileage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Running Mileage</span>
              <span>🏃</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">0.0 km</span>
              <span className="text-xs text-muted-foreground">Goal: 20 km / wk</span>
            </div>
            <Progress value={0} className="h-1.5 bg-primary/10" />
          </CardContent>
        </Card>

        {/* Recovery Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground uppercase tracking-wider">
              <span>Recovery & Sleep</span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">0%</span>
              <span className="text-xs text-muted-foreground">Sleep: 0.0 hrs</span>
            </div>
            <Progress value={0} className="h-1.5 bg-emerald-500/10" />
          </CardContent>
        </Card>

      </div>

      {/* Chart: Weight logs */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Body Weight Tracker
          </CardTitle>
          <CardDescription>Weight log trend over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_WEIGHT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" domain={[65, 75]} unit="kg" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} kg`, "Weight"]}
              />
              <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row: Exercise routines & Diet log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workout split */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              Gym Workout Split routines
            </CardTitle>
            <CardDescription>Premium strength routines checklist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {WORKOUT_ROUTINES.map((routine, idx) => (
              <div key={idx} className="p-3 bg-muted/40 border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold">{routine.day} — {routine.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{routine.exercises}</p>
                </div>
                <Badge variant="outline">{routine.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Nutritional Diet log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Diet Log Checklist
            </CardTitle>
            <CardDescription>Daily balanced meals schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DIET_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/40 border rounded-lg">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <span className="text-[10px] text-muted-foreground">{item.calories} | {item.protein}</span>
                </div>
                <Badge variant="outline" className="text-muted-foreground border-border py-0.5">Not Logged</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

const MOCK_WEIGHT_DATA: any[] = [];

const WORKOUT_ROUTINES = [
  { day: "Mon / Thu", name: "Chest + Triceps", exercises: "Bench press, Incline Dumbbell, Skullcrushers", status: "Active" },
  { day: "Tue / Fri", name: "Back + Biceps", exercises: "Deadlifts, Lat Pull-downs, Bicep curls", status: "Active" },
  { day: "Wed / Sat", name: "Shoulders + Legs", exercises: "Barbell Squats, Overhead shoulder press", status: "Active" }
];

const DIET_ITEMS = [
  { name: "🍳 Breakfast: Eggs & Toast", calories: "450 kcal", protein: "24g Protein" },
  { name: "🍗 Lunch: Chicken breast & Rice", calories: "750 kcal", protein: "45g Protein" },
  { name: "🥤 Snack: Whey Protein shake", calories: "250 kcal", protein: "28g Protein" },
  { name: "🐟 Dinner: Fish curry & Roti", calories: "600 kcal", protein: "32g Protein" }
];
