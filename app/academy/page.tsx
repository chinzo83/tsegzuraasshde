"use client"

import { useState } from "react"
import { GraduationCap, BookOpen, ClipboardList, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AcademyStudent } from "@/components/academy-student"
import { AcademyTeacher } from "@/components/academy-teacher"

type Role = "student" | "teacher" | null

export default function AcademyPage() {
  const [role, setRole] = useState<Role>(null)

  if (role === "student") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setRole(null)}>
            Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">Student Dashboard</h1>
        </div>
        <AcademyStudent />
      </div>
    )
  }

  if (role === "teacher") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setRole(null)}>
            Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">Teacher Dashboard</h1>
        </div>
        <AcademyTeacher />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Academy</h1>
        <p className="mt-1 text-muted-foreground">
          Access lessons and exams from your academy
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setRole("student")}
          className="group flex flex-col items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 text-left"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Student</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch video lessons and take exams assigned by your teacher.
          </p>
          <div className="mt-3 flex items-center gap-1 text-sm text-primary">
            <span>Enter</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setRole("teacher")}
          className="group flex flex-col items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 text-left"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Teacher</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload video lessons, create exams, and manage student results.
          </p>
          <div className="mt-3 flex items-center gap-1 text-sm text-primary">
            <span>Enter</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  )
}
