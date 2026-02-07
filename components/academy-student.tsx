"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MorsePlayer, REVERSE_MORSE } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Play, Video, ClipboardList, Send, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

// Demo lessons and exams
const DEMO_LESSONS = [
  { id: 1, title: "Introduction to Morse Code", description: "The history and basics of Morse code communication", videoUrl: "" },
  { id: 2, title: "Learning Letters A-M", description: "Master the first half of the Morse alphabet", videoUrl: "" },
  { id: 3, title: "Learning Letters N-Z", description: "Complete the Morse alphabet", videoUrl: "" },
  { id: 4, title: "Numbers 0-9", description: "Encode and decode numbers in Morse", videoUrl: "" },
]

const DEMO_EXAMS = [
  { id: 1, title: "Basic Letters Exam", chars: "HELLO WORLD".split("").filter((c) => c !== " "), timeLimit: 120 },
  { id: 2, title: "Advanced Mixed Exam", chars: "MORSE123".split(""), timeLimit: 90 },
]

export function AcademyStudent() {
  const [view, setView] = useState<"lessons" | "exams" | "taking-exam">("lessons")
  const [selectedExam, setSelectedExam] = useState<typeof DEMO_EXAMS[0] | null>(null)
  const [currentBlock, setCurrentBlock] = useState(0)
  const [userInputs, setUserInputs] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [examDone, setExamDone] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<MorsePlayer | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    playerRef.current = new MorsePlayer()
    return () => {
      playerRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startExam = useCallback((exam: typeof DEMO_EXAMS[0]) => {
    setSelectedExam(exam)
    setCurrentBlock(0)
    setUserInputs([])
    setCurrentInput("")
    setExamDone(false)
    setTimeLeft(exam.timeLimit)
    setView("taking-exam")

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setExamDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const getBlockChars = useCallback(() => {
    if (!selectedExam) return []
    const start = currentBlock * 5
    return selectedExam.chars.slice(start, start + 5)
  }, [selectedExam, currentBlock])

  const totalBlocks = selectedExam ? Math.ceil(selectedExam.chars.length / 5) : 0

  const playBlock = useCallback(async () => {
    const blockChars = getBlockChars()
    if (!blockChars.length || !playerRef.current) return
    setIsPlaying(true)
    await playerRef.current.playSequence(blockChars, 12)
    setIsPlaying(false)
  }, [getBlockChars])

  const submitBlock = useCallback(() => {
    setUserInputs((prev) => [...prev, currentInput.toUpperCase()])
    setCurrentInput("")

    if (currentBlock + 1 >= totalBlocks) {
      setExamDone(true)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      setCurrentBlock((prev) => prev + 1)
    }
  }, [currentInput, currentBlock, totalBlocks])

  const submitExam = useCallback(() => {
    if (currentInput) {
      setUserInputs((prev) => [...prev, currentInput.toUpperCase()])
    }
    setExamDone(true)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [currentInput])

  const getScore = useCallback(() => {
    if (!selectedExam) return { correct: 0, total: 0 }
    const allInputChars = userInputs.join("").split("")
    let correct = 0
    selectedExam.chars.forEach((c, i) => {
      if (allInputChars[i]?.toUpperCase() === c) correct++
    })
    return { correct, total: selectedExam.chars.length }
  }, [selectedExam, userInputs])

  if (view === "taking-exam" && selectedExam) {
    const score = getScore()

    return (
      <div className="flex flex-col gap-6">
        {/* Timer */}
        <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">{selectedExam.title}</h2>
          <div className={cn("font-mono text-lg font-bold", timeLeft < 30 ? "text-destructive" : "text-foreground")}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        {!examDone ? (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-4 text-sm text-muted-foreground">
              Block {currentBlock + 1} of {totalBlocks}
            </p>

            <div className="mb-4 flex items-center gap-2">
              <Button onClick={playBlock} disabled={isPlaying} variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                {isPlaying ? "Playing..." : "Play Morse"}
              </Button>
              <Button onClick={playBlock} disabled={isPlaying} variant="ghost" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && submitBlock()}
                placeholder="Type what you hear..."
                className="w-full rounded-lg border bg-background px-4 py-3 font-mono text-lg uppercase tracking-widest placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitBlock} className="gap-2">
                <Send className="h-4 w-4" />
                {currentBlock + 1 < totalBlocks ? "Next Block" : "Finish"}
              </Button>
              <Button onClick={submitExam} variant="outline">
                Submit All
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-center text-xl font-bold text-card-foreground">Results</h3>
            <div className="mb-4 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{score.correct}/{score.total}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => setView("exams")} variant="outline">
                Back to Exams
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
        <button
          onClick={() => setView("lessons")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center",
            view === "lessons" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <Video className="h-4 w-4" />
          Lessons
        </button>
        <button
          onClick={() => setView("exams")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center",
            view === "exams" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Exams
        </button>
      </div>

      {view === "lessons" && (
        <div className="grid gap-4">
          {DEMO_LESSONS.map((lesson) => (
            <div key={lesson.id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Video className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground">{lesson.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{lesson.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "exams" && (
        <div className="grid gap-4">
          {DEMO_EXAMS.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
              <div>
                <h3 className="font-semibold text-card-foreground">{exam.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {exam.chars.length} characters | {Math.floor(exam.timeLimit / 60)} min
                </p>
              </div>
              <Button onClick={() => startExam(exam)} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
