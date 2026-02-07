"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { MorsePlayer, getRandomChars, MORSE_CODE } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Headphones, Play, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const EXAM_COUNT = 20

export default function ListenExamPage() {
  const [wpm, setWpm] = useState(15)
  const [chars, setChars] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<Array<{ char: string; input: string; correct: boolean }>>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [examComplete, setExamComplete] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const playerRef = useRef<MorsePlayer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    playerRef.current = new MorsePlayer()
    return () => playerRef.current?.stop()
  }, [])

  const startExam = useCallback(() => {
    const newChars = getRandomChars(EXAM_COUNT)
    setChars(newChars)
    setCurrentIndex(-1)
    setUserInput("")
    setResults([])
    setExamComplete(false)
    setExamStarted(true)
    setIsPlaying(true)
    setStartTime(Date.now())

    setTimeout(() => {
      playerRef.current?.playSequence(newChars, wpm, (index) => {
        setCurrentIndex(index)
      }).then(() => {
        setIsPlaying(false)
        inputRef.current?.focus()
      })
    }, 500)
  }, [wpm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length > chars.length) return
    setUserInput(val)

    if (val.length === chars.length) {
      const elapsed = Date.now()
      setEndTime(elapsed)
      const newResults = chars.map((c, i) => ({
        char: c,
        input: val[i] || "",
        correct: val[i]?.toUpperCase() === c,
      }))
      setResults(newResults)
      setExamComplete(true)
    }
  }

  const accuracy = results.length > 0
    ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
    : 0

  const timeSpent = endTime && startTime
    ? ((endTime - startTime) / 1000).toFixed(1)
    : "0"

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Listen Exam</h1>
        <p className="mt-1 text-muted-foreground">
          Decode {EXAM_COUNT} Morse characters as fast and accurately as you can
        </p>
      </div>

      {!examStarted && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">Speed</span>
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
                  width: `${((currentIndex + 1) / EXAM_COUNT) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {currentIndex + 1} / {EXAM_COUNT}
            </p>
          </div>

          {/* Character grid */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {chars.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-mono font-bold transition-all",
                  i === currentIndex && isPlaying
                    ? "border-primary bg-primary/10 text-primary scale-110"
                    : i < currentIndex
                      ? "border-muted bg-muted/50 text-muted-foreground"
                      : "border-border bg-background text-muted-foreground/40"
                )}
              >
                {i <= currentIndex && isPlaying ? (
                  <span className="text-[10px]">{MORSE_CODE[c]}</span>
                ) : (
                  "?"
                )}
              </div>
            ))}
          </div>

          {!isPlaying ? (
            <div className="flex flex-col items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                maxLength={chars.length}
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type all characters you heard..."
                className="w-full max-w-md rounded-lg border bg-background px-4 py-3 text-center font-mono text-xl uppercase tracking-[0.2em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {userInput.length}/{chars.length} characters entered
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Listening to Morse code...
            </p>
          )}
        </div>
      )}

      {examComplete && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-center text-xl font-bold text-card-foreground">
            Exam Results
          </h2>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">{accuracy}%</span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">{timeSpent}s</span>
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">{wpm}</span>
              <span className="text-xs text-muted-foreground">WPM</span>
            </div>
          </div>

          {/* Detailed results */}
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
                  <span className="text-[9px] opacity-60">{r.input || "_"}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setExamStarted(false); setExamComplete(false) }} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Link href="/listen">
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
