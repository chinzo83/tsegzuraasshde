"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getRandomChars, REVERSE_MORSE } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { PenTool, Play, RotateCcw, ArrowLeft, Minus, Circle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const EXAM_COUNT = 20

export default function WriteExamPage() {
  const [wpm, setWpm] = useState(15)
  const [chars, setChars] = useState<string[]>([])
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [morseInput, setMorseInput] = useState("")
  const [results, setResults] = useState<
    Array<{ char: string; input: string; decoded: string; correct: boolean }>
  >([])
  const [examStarted, setExamStarted] = useState(false)
  const [examComplete, setExamComplete] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startExam = useCallback(() => {
    const newChars = getRandomChars(EXAM_COUNT)
    setChars(newChars)
    setCurrentCharIndex(0)
    setMorseInput("")
    setResults([])
    setExamComplete(false)
    setExamStarted(true)
    setStartTime(Date.now())
  }, [])

  const addSymbol = useCallback(
    (symbol: "." | "-") => {
      if (examComplete) return
      setMorseInput((prev) => prev + symbol)

      if (gapTimerRef.current) clearTimeout(gapTimerRef.current)

      gapTimerRef.current = setTimeout(() => {
        setMorseInput((prev) => {
          const decoded = REVERSE_MORSE[prev] || "?"
          const expected = chars[currentCharIndex]
          const correct = decoded === expected

          setResults((r) => {
            const newResults = [
              ...r,
              { char: expected, input: prev, decoded, correct },
            ]

            if (currentCharIndex + 1 >= chars.length) {
              setExamComplete(true)
              setEndTime(Date.now())
            } else {
              setCurrentCharIndex((i) => i + 1)
            }

            return newResults
          })

          return ""
        })
      }, 1500)
    },
    [chars, currentCharIndex, examComplete]
  )

  // Keyboard support: q or . for dot, w or - for dash
  useEffect(() => {
    if (!examStarted || examComplete) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "." || e.key === "Q") {
        e.preventDefault()
        addSymbol(".")
      } else if (e.key === "w" || e.key === "-" || e.key === "W") {
        e.preventDefault()
        addSymbol("-")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [examStarted, examComplete, addSymbol])

  const accuracy =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.correct).length / results.length) * 100
        )
      : 0
  const timeSpent =
    endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : "0"
  const wpmScore =
    endTime && startTime
      ? Math.round(
          (results.filter((r) => r.correct).length /
            ((endTime - startTime) / 1000)) *
            12
        )
      : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <PenTool className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Write Exam</h1>
        <p className="mt-1 text-muted-foreground">
          Encode {EXAM_COUNT} characters in Morse code
        </p>
      </div>

      {!examStarted && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">
                Speed
              </span>
              <span className="font-mono text-sm text-primary">{wpm} WPM</span>
            </div>
            <Slider
              className="mt-3"
              min={1}
              max={90}
              step={1}
              value={[wpm]}
              onValueChange={(v) => setWpm(v[0])}
            />
          </div>
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground mb-6">
            <p className="font-medium text-foreground mb-1">Keyboard shortcuts</p>
            <p>
              <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">q</kbd> or{" "}
              <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">.</kbd> = dot
              &nbsp;&nbsp;
              <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">w</kbd> or{" "}
              <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">-</kbd> = dash
            </p>
            <p className="mt-1">No hints shown during exam. Rely on your Morse knowledge!</p>
          </div>
          <div className="flex justify-center">
            <Button onClick={startExam} className="gap-2">
              <Play className="h-4 w-4" />
              Begin Exam
            </Button>
          </div>
        </div>
      )}

      {examStarted && !examComplete && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {/* Progress */}
          <div className="mb-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(currentCharIndex / EXAM_COUNT) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {currentCharIndex + 1} / {EXAM_COUNT}
            </p>
          </div>

          {/* Current char - NO expected Morse shown (anti-cheat) */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-3xl font-bold text-primary">
              {currentCharIndex + 1}
            </div>
            <p className="text-xs text-muted-foreground">
              Character {currentCharIndex + 1} of {EXAM_COUNT}
            </p>
          </div>

          {/* Morse input display */}
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 min-w-[120px] items-center justify-center rounded-lg border bg-background px-4">
              <span className="font-mono text-2xl tracking-widest text-foreground">
                {morseInput || (
                  <span className="text-muted-foreground text-sm">...</span>
                )}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => addSymbol(".")}
              className="h-16 w-16 rounded-full text-2xl font-bold"
            >
              <Circle className="h-4 w-4 fill-current" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => addSymbol("-")}
              className="h-16 w-24 rounded-full text-2xl font-bold"
            >
              <Minus className="h-6 w-6" />
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pause to auto-submit &middot;{" "}
            <kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">q</kbd>/<kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">.</kbd> dot{" "}
            <kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">w</kbd>/<kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">-</kbd> dash
          </p>
        </div>
      )}

      {examComplete && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-center text-xl font-bold text-card-foreground">
            Exam Results
          </h2>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">
                {accuracy}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">
                {timeSpent}s
              </span>
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">
                {wpmScore}
              </span>
              <span className="text-xs text-muted-foreground">WPM</span>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-10 w-10 flex-col items-center justify-center rounded-lg border text-xs font-mono font-bold",
                  r.correct
                    ? "border-success bg-success/10 text-success"
                    : "border-destructive bg-destructive/10 text-destructive"
                )}
              >
                <span>{r.char}</span>
                {!r.correct && (
                  <span className="text-[9px] opacity-60">{r.decoded}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setExamStarted(false)
                setExamComplete(false)
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Link href="/write">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Practice
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
