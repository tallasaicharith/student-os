"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Bookmark, BookMarked, Sparkles, Quote, Trash2, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookItem {
  id: string;
  title: string;
  author: string;
  read: number;
  total: number;
  category: string;
}

export default function ReadingHubPage() {
  const [showGitaSection, setShowGitaSection] = useState(true);
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [reflections, setReflections] = useState("");
  const [logs, setLogs] = useState<{ id: string; chapter: number; verse: number; note: string }[]>([
    { id: "1", chapter: 2, verse: 47, note: "Focus on your duty without attachment to outcomes." }
  ]);

  const [books, setBooks] = useState<BookItem[]>([
    { id: "b1", title: "Atomic Habits", author: "James Clear", read: 120, total: 320, category: "Mindset" },
    { id: "b2", title: "Grokking Algorithms", author: "Aditya Bhargava", read: 80, total: 256, category: "Technical" },
    { id: "b3", title: "The 5 AM Club", author: "Robin Sharma", read: 45, total: 450, category: "Self-Help" }
  ]);

  // Dialog state for adding new book
  const [newBookOpen, setNewBookOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Technical");
  const [newTotalPages, setNewTotalPages] = useState("300");

  const handleLogGita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter || !verse) return;

    const newLog = {
      id: Math.random().toString(),
      chapter,
      verse,
      note: reflections || "Read and meditated.",
    };

    setLogs((prev) => [newLog, ...prev]);
    setReflections("");
    toast.success(`Logged progress: Chapter ${chapter}, Verse ${verse}! 🛐`);
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const book: BookItem = {
      id: Math.random().toString(),
      title: newTitle.trim(),
      author: newAuthor.trim() || "Unknown Author",
      category: newCategory,
      read: 0,
      total: parseInt(newTotalPages) || 200,
    };

    setBooks((prev) => [book, ...prev]);
    setNewTitle("");
    setNewAuthor("");
    setNewBookOpen(false);
    toast.success(`Added "${book.title}" to Reading Shelf! 📚`);
  };

  const handleAddPages = (id: string, pagesToAdd: number) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = Math.min(b.total, b.read + pagesToAdd);
          toast.success(`Logged +${pagesToAdd} pages for ${b.title}! 📖`);
          return { ...b, read: updated };
        }
        return b;
      })
    );
  };

  const handleDeleteBook = (id: string, title: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    toast.success(`Removed "${title}" from shelf`);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.success("Reflection entry removed");
  };

  const totalPagesRead = books.reduce((acc, b) => acc + b.read, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <PageHeader title="📖 Reading Hub" description="Track textbooks, self-help books, and spiritual reading progress" />
        
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              setShowGitaSection(!showGitaSection);
              toast.info(showGitaSection ? "Gita section hidden" : "Gita section shown");
            }}
          >
            {showGitaSection ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showGitaSection ? "Hide Gita Section" : "Show Gita Section"}
          </Button>

          <Dialog open={newBookOpen} onOpenChange={setNewBookOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Plus className="w-4 h-4" /> Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> Add Book to Reading Shelf
                </DialogTitle>
                <DialogDescription>Add a new textbook, technical manual, or self-help book to track.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddBook} className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Book Title</label>
                  <Input placeholder="e.g., Designing Data-Intensive Applications" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Author</label>
                  <Input placeholder="e.g., Martin Kleppmann" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Category</label>
                    <Input placeholder="e.g., Technical, Mindset, Research" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Total Pages</label>
                    <Input type="number" min={10} value={newTotalPages} onChange={(e) => setNewTotalPages(e.target.value)} required />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                  <Plus className="w-4 h-4" /> Add Book
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gita Progress Widget & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Optional Gita Card */}
        {showGitaSection && (
          <Card className="md:col-span-2 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-500">
                  🛐 Bhagavad Gita Study
                </CardTitle>
                <CardDescription>Daily spiritual wisdom check-in</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setShowGitaSection(false);
                  toast.info("Gita section hidden from view");
                }}
                title="Hide Gita section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogGita} className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Chapter</label>
                    <Input type="number" min={1} max={18} value={chapter} onChange={e => setChapter(Number(e.target.value))} required />
                  </div>
                  <div className="w-1/3">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Verse</label>
                    <Input type="number" min={1} max={78} value={verse} onChange={e => setVerse(Number(e.target.value))} required />
                  </div>
                  <div className="w-1/3 flex items-end">
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
                      <Bookmark className="w-4 h-4" /> Log Verse
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Personal Reflection / Notes</label>
                  <Textarea placeholder="What did you learn? How does it apply to your day?" value={reflections} onChange={e => setReflections(e.target.value)} />
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reading stats */}
        <Card className={cn(!showGitaSection && "md:col-span-3")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Reading Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Total Pages Read</span>
                <span className="text-blue-500">{totalPagesRead} Pages</span>
              </div>
              <Progress value={Math.min(100, (totalPagesRead / 500) * 100)} className="h-1.5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Active Books Shelf</span>
                <span className="text-emerald-500">{books.length} Books</span>
              </div>
              <Progress value={Math.min(100, (books.length / 5) * 100)} className="h-1.5" />
            </div>

            <div className="p-3 bg-muted/40 border rounded-lg text-xs leading-relaxed italic flex gap-2">
              <Quote className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                &ldquo;Focus on the process, not the outcome.&rdquo;
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Books queue and Gita Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Books Tracker */}
        <Card className={cn(!showGitaSection && "lg:col-span-2")}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-500" />
              General Reading Shelf ({books.length})
            </CardTitle>
            <CardDescription>Log pages read or remove finished books</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {books.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No books on your shelf yet. Click "Add New Book" above!</p>
            ) : (
              books.map((book) => {
                const pct = Math.round((book.read / book.total) * 100);
                return (
                  <div key={book.id} className="p-3 bg-muted/40 border rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold">{book.title}</h4>
                        <span className="text-[10px] text-muted-foreground">by {book.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{book.category}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteBook(book.id, book.title)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{book.read} / {book.total} pages ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleAddPages(book.id, 10)}>
                        +10 Pages
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => handleAddPages(book.id, 25)}>
                        +25 Pages
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Gita logs reflections list */}
        {showGitaSection && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Spiritual Gita Reflections ({logs.length})
              </CardTitle>
              <CardDescription>Historical review of read verses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No reflections logged yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted/40 border rounded-xl space-y-1 relative group">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-orange-500 font-mono">BG Ch {log.chapter}, Verse {log.verse}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground/95 italic">&ldquo;{log.note}&rdquo;</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
