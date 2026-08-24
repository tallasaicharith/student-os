"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, Plus, Calendar, Mail, FileText, CheckCircle2,
  AlertCircle, DollarSign, MapPin, Search, Trash2, Edit3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { toast } from "sonner";

interface Application {
  id: string;
  company: string;
  role: string;
  status: "Wishlist" | "Applied" | "OA" | "Interview" | "Offer" | "Rejected";
  stipend?: string;
  location: string;
  referral: string;
  date: string;
}

export default function InternshipHubPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<Application[]>([
    { id: "app1", company: "Google", role: "Software Engineer Intern", status: "Interview", location: "Bangalore", stipend: "₹1,00,000/mo", referral: "Self Applied", date: "Yesterday" },
    { id: "app2", company: "Microsoft", role: "SDE Intern 2026", status: "OA", location: "Hyderabad", stipend: "₹85,000/mo", referral: "Alumni Referral", date: "3 days ago" },
    { id: "app3", company: "Atlassian", role: "Backend Engineering Intern", status: "Applied", location: "Remote", stipend: "₹90,000/mo", referral: "Self Applied", date: "1 week ago" }
  ]);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Application["status"]>("Applied");
  const [location, setLocation] = useState("Remote");
  const [stipend, setStipend] = useState("");

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    const newApp: Application = {
      id: Math.random().toString(),
      company: company.trim(),
      role: role.trim(),
      status,
      location: location.trim() || "Remote",
      stipend: stipend.trim() || undefined,
      referral: "Self Applied",
      date: "Just now",
    };

    setApplications((prev) => [newApp, ...prev]);
    setCompany("");
    setRole("");
    setLocation("");
    setStipend("");
    setOpen(false);
    toast.success(`Added application for ${company}! 🚀`);
  };

  const handleUpdateStatus = (id: string, newStatus: Application["status"]) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus, date: "Just now" } : app))
    );
    toast.success(`Updated status to ${newStatus}`);
  };

  const handleDeleteApp = (id: string, companyName: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.success(`Removed ${companyName} application`);
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Wishlist": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "Applied": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "OA": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Interview": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Offer": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const filtered = applications.filter((app) =>
    app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader title="🎯 Internship Hub" description="Track placement applications, resumes, and interview timelines">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" /> Add Internship Application
              </DialogTitle>
              <DialogDescription>Track job applications, online assessments, and interviews.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddApp} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Company Name</label>
                <Input placeholder="e.g. Google" value={company} onChange={e => setCompany(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Role Title</label>
                <Input placeholder="e.g. Software Engineer Intern" value={role} onChange={e => setRole(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Stage</label>
                  <Select value={status} onValueChange={(val) => setStatus(val as Application["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wishlist">Wishlist</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="OA">OA (Online Assessment)</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Location</label>
                  <Input placeholder="e.g. Remote / Bangalore" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Monthly Stipend</label>
                <Input placeholder="e.g. ₹80,000/mo" value={stipend} onChange={e => setStipend(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Application
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* ATS & Preparation Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              ATS Resume Strength
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Scored: 85 / 100</span>
              <span className="text-emerald-500">Strong</span>
            </div>
            <Progress value={85} className="h-1.5 bg-emerald-500/10" />
            <p className="text-[10px] text-muted-foreground">Resume format optimized for tech ATS screeners.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Applications Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold">{applications.length}</span>
              <span className="text-xs text-muted-foreground">Target: 20 Apps</span>
            </div>
            <Progress value={Math.min(100, (applications.length / 20) * 100)} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              Interview Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Active Interviews</span>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                {applications.filter((a) => a.status === "Interview").length} Active
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Offers Received</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                {applications.filter((a) => a.status === "Offer").length} Offers
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter by company or role..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Board Pipeline view */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground italic">
          No applications match your filter. Click "Add Application" to track your job search!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{app.company}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{app.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteApp(app.id, app.company)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{app.location}</span>
                  </div>
                  {app.stipend && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{app.stipend}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Referral: <strong className="text-foreground">{app.referral}</strong></span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3 text-[10px] text-muted-foreground font-medium">
                  <span>Updated: {app.date}</span>
                  
                  {/* Stage Switcher */}
                  <Select value={app.status} onValueChange={(val) => handleUpdateStatus(app.id, val as Application["status"])}>
                    <SelectTrigger className="h-6 text-[10px] w-28 py-0 px-2">
                      <SelectValue placeholder="Update Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wishlist">Wishlist</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="OA">OA</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
