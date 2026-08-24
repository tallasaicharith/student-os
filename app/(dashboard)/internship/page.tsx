"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, Plus, Calendar, Mail, FileText, CheckCircle2,
  AlertCircle, DollarSign, MapPin, Search, PlusCircle, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
  const [applications, setApplications] = useState<Application[]>([]);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Application["status"]>("Wishlist");
  const [location, setLocation] = useState("");
  const [stipend, setStipend] = useState("");

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    const newApp: Application = {
      id: Math.random().toString(),
      company,
      role,
      status,
      location: location || "Remote",
      stipend: stipend || undefined,
      referral: "None",
      date: "Today",
    };

    setApplications((prev) => [newApp, ...prev]);
    setCompany("");
    setRole("");
    setLocation("");
    setStipend("");
    setOpen(false);
    toast.success(`Added application for ${company}! 🚀`);
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
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Application</DialogTitle></DialogHeader>
            <form onSubmit={handleAddApp} className="space-y-4">
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
                  <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Status</label>
                  <select className="w-full bg-background border rounded-lg p-2 text-sm" value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="Wishlist">Wishlist</option>
                    <option value="Applied">Applied</option>
                    <option value="OA">OA (Online Assessment)</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Location</label>
                  <Input placeholder="e.g. Remote" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Monthly Stipend</label>
                <Input placeholder="e.g. ₹50,000/mo" value={stipend} onChange={e => setStipend(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Save Application</Button>
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
              <span className="text-muted-foreground">Scored: 0 / 100</span>
              <span className="text-muted-foreground">Unrated</span>
            </div>
            <Progress value={0} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">Upload your resume to evaluate resume strength.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Interview Prep Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">LeetCode Top 150 (0 solved)</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">Behavioral responses (0 stories ready)</span></div>
            <div className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-muted-foreground/30" /> <span className="text-muted-foreground">System Design Basics (Unstarted)</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              Dream Companies Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between"><span>Atlassian</span> <Badge variant="outline">0 Alumni Found</Badge></div>
            <div className="flex justify-between"><span>Stripe</span> <Badge variant="outline">0 HR Contacted</Badge></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm tracking-tight">{app.company}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{app.role}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(app.status)}>
                  {app.status}
                </Badge>
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
                <Button variant="ghost" size="sm" className="h-6 text-[10px] p-1 text-muted-foreground hover:text-primary">
                  View Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
