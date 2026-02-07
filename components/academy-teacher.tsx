"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Video, ClipboardList, Plus, Users, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "lessons" | "exams" | "results"

const DEMO_RESULTS = [
  { student: "Batbold", exam: "Basic Letters Exam", score: 90, time: "1:45" },
  { student: "Oyunbileg", exam: "Basic Letters Exam", score: 85, time: "2:10" },
  { student: "Temuulen", exam: "Advanced Mixed Exam", score: 72, time: "1:30" },
  { student: "Munkhjin", exam: "Basic Letters Exam", score: 95, time: "1:20" },
]

export function AcademyTeacher() {
  const [activeTab, setActiveTab] = useState<Tab>("lessons")
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)

  const TABS: { id: Tab; label: string; icon: typeof Video }[] = [
    { id: "lessons", label: "Lessons", icon: Video },
    { id: "exams", label: "Exams", icon: ClipboardList },
    { id: "results", label: "Results", icon: Users },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lessons management */}
      {activeTab === "lessons" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Video Lessons</h2>
            <Button size="sm" onClick={() => setShowLessonForm(!showLessonForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </div>

          {showLessonForm && (
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lesson-title">Lesson Title</Label>
                  <Input id="lesson-title" placeholder="e.g., Introduction to Morse Code" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lesson-desc">Description</Label>
                  <Input id="lesson-desc" placeholder="Brief description of the lesson" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Video File</Label>
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Click or drag to upload video</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Button variant="outline" onClick={() => setShowLessonForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              No lessons uploaded yet. Click "Add Lesson" to create your first lesson.
            </p>
          </div>
        </div>
      )}

      {/* Exam management */}
      {activeTab === "exams" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Exams</h2>
            <Button size="sm" onClick={() => setShowExamForm(!showExamForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </div>

          {showExamForm && (
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exam-title">Exam Title</Label>
                  <Input id="exam-title" placeholder="e.g., Week 1 Assessment" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="exam-time">Time Limit (minutes)</Label>
                  <Input id="exam-time" type="number" placeholder="5" min={1} max={60} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Exam Text (Excel File)</Label>
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Upload .xlsx file with exam text</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowExamForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              No exams created yet. Click "Create Exam" to set up your first exam.
            </p>
          </div>
        </div>
      )}

      {/* Student results */}
      {activeTab === "results" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Student Results</h2>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Exam</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...DEMO_RESULTS]
                  .sort((a, b) => b.score - a.score)
                  .map((result, i) => (
                    <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                        {result.student}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{result.exam}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        {result.score}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {result.time}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
