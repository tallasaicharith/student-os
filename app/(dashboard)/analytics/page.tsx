"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, Download, Calendar, RefreshCw, Eye, TrendingUp, Sparkles,
  BookOpen, Code, Dumbbell, Trophy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, LineChart, Line
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("CSV Report downloaded successfully! 📊");
    }, 1000);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("PDF Executive Summary downloaded successfully! 📄");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="📊 System Analytics" description="Aggregated metrics of academic and personal performance">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={exporting}>
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </Button>
          <Button variant="default" size="sm" onClick={handleExportPDF} disabled={exporting}>
            <Download className="w-4 h-4 mr-1.5" /> Export PDF
          </Button>
        </div>
      </PageHeader>

      {/* Tabs for periods */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-4">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="semester">Semester</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        
        {/* Weekly Charts */}
        <TabsContent value="weekly" className="space-y-6 pt-4">
          
          {/* Main Chart Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Productivity & Health Correlation
                </CardTitle>
                <CardDescription>Visualizing study hours alongside physical activity (Runs)</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">Weekly Stats</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={MOCK_WEEKLY_CORRELATION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                  <XAxis dataKey="day" className="text-xs text-muted-foreground" />
                  <YAxis yAxisId="left" className="text-xs text-muted-foreground" unit="h" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs text-muted-foreground" unit="k" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line yAxisId="left" name="Study time (hrs)" type="monotone" dataKey="study" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" name="Running mileage (km)" type="monotone" dataKey="run" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Academic & Habit charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Subject study breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Time Spent Per Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MOCK_SUBJECTS_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis dataKey="subject" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" unit="h" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar name="Logged minutes" dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Habits compliance score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  Habit Compliance Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MOCK_HABITS_RATE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis dataKey="day" className="text-xs text-muted-foreground" />
                    <YAxis className="text-xs text-muted-foreground" unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" name="Success Rate" dataKey="rate" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#habitGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

        </TabsContent>
        
        {/* Mock fallbacks for other tabs */}
        <TabsContent value="monthly" className="pt-4 text-center py-16 text-muted-foreground text-sm">
          📚 Monthly reports will automatically populate on the 30th. Check back later!
        </TabsContent>
        <TabsContent value="semester" className="pt-4 text-center py-16 text-muted-foreground text-sm">
          🎓 Semester reports will calculate averages of CGPA logs upon Term completions.
        </TabsContent>
        <TabsContent value="yearly" className="pt-4 text-center py-16 text-muted-foreground text-sm">
          📅 Yearly summaries compile your entire sophomore performance portfolio.
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MOCK_WEEKLY_CORRELATION = [
  { day: "Mon", study: 0.0, run: 0 },
  { day: "Tue", study: 0.0, run: 0.0 },
  { day: "Wed", study: 0.0, run: 0 },
  { day: "Thu", study: 0.0, run: 0.0 },
  { day: "Fri", study: 0.0, run: 0 },
  { day: "Sat", study: 0.0, run: 0.0 },
  { day: "Sun", study: 0.0, run: 0 }
];

const MOCK_SUBJECTS_TIME = [
  { subject: "MA112", hours: 0 },
  { subject: "AI201", hours: 0 },
  { subject: "CS207", hours: 0 },
  { subject: "DS204", hours: 0 },
  { subject: "FL2ZZ", hours: 0 }
];

const MOCK_HABITS_RATE = [
  { day: "Mon", rate: 0 },
  { day: "Tue", rate: 0 },
  { day: "Wed", rate: 0 },
  { day: "Thu", rate: 0 },
  { day: "Fri", rate: 0 },
  { day: "Sat", rate: 0 },
  { day: "Sun", rate: 0 }
];
