"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getRandomChars, MORSE_CODE, REVERSE_MORSE } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { PenTool, RotateCcw, ArrowRight, Minus, Circle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function WritePage() {
  const [wpm, setWpm] = useState(15)
  const [chars, setChars] = useState<string[]>([])
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [morseInput, setMorseInput] = useState("")
  const [results, setResults] = useState<
    Array<{ char: string; input: string; decoded: string; correct: boolean }>
  >([])
  const [started, setStarted] = useState(false)
  const [roundComplete, setRoundComplete] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startRound = useCallback(() => {
    const newChars = getRandomChars(5)
    setChars(newChars)
    setCurrentCharIndex(0)
    setMorseInput("")
    setResults([])
    setRoundComplete(false)
    setStarted(true)
    setStartTime(Date.now())
  }, [])

  const addSymbol = useCallback(
    (symbol: "." | "-") => {
      if (roundComplete) return
      setMorseInput((prev) => prev + symbol)

      if (gapTimerRef.current) clearTimeout(gapTimerRef.current)

      gapTimerRef.current = setTimeout(() => {
        setMorseInput((prev) => {
          const decoded = REVERSE_MORSE[prev] || "?"
          const expected = chars[currentCharIndex]
          const correct = decoded === expected

          setResults((r) => [
            ...r,
            { char: expected, input: prev, decoded, correct },
          ])

          if (currentCharIndex + 1 >= chars.length) {
            setRoundComplete(true)
            setEndTime(Date.now())
          } else {
            setCurrentCharIndex((i) => i + 1)
          }

          return ""
        })
      }, 1500)
    },
    [chars, currentCharIndex, roundComplete]
  )

  // Keyboard support: q or . for dot, w or - for dash
  useEffect(() => {
    if (!started || roundComplete) return

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
  }, [started, roundComplete, addSymbol])

  const accuracy =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.correct).length / results.length) * 100
        )
      : 0

  const timeSpent =
    endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : "0"

  const avgScore =
    results.length > 0
      ? Math.round(
          (accuracy +
            Math.min(100, (results.filter((r) => r.correct).length / ((endTime - startTime) / 1000)) * 20)) /
            2
        )
      : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <PenTool className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Write</h1>
        <p className="mt-1 text-muted-foreground">
          Practice encoding into Morse code
        </p>
      </div>

      {/* Speed slider */}
      <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
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

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {!started ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">
              System shows random characters. Encode each one in Morse code.
            </p>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Keyboard shortcuts</p>
              <p>
                <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">q</kbd> or{" "}
                <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">.</kbd> = dot
                &nbsp;&nbsp;
                <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">w</kbd> or{" "}
                <kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono border">-</kbd> = dash
              </p>
            </div>
            <Button onClick={startRound} className="gap-2">
              <PenTool className="h-4 w-4" />
              Start
            </Button>
          </div>
        ) : (
          <>
            {/* Character progress - NO expected char revealed, just progress indicator */}
            <div className="mb-6 flex items-center justify-center gap-3">
              {chars.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all",
                    i === currentCharIndex && !roundComplete
                      ? "border-primary bg-primary/10 text-primary scale-110"
                      : results[i]
                        ? results[i].correct
                          ? "border-success bg-success/10 text-success"
                          : "border-destructive bg-destructive/10 text-destructive"
                        : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {/* Only show the letter AFTER it's been answered */}
                  {results[i] ? (
                    <span>{c}</span>
                  ) : i === currentCharIndex ? (
                    <span className="text-sm">{i + 1}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground/40">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {!roundComplete && (
              <div className="flex flex-col items-center gap-4">
                {/* Current Morse input display */}
                <div className="flex h-12 min-w-[120px] items-center justify-center rounded-lg border bg-background px-4">
                  <span className="font-mono text-2xl tracking-widest text-foreground">
                    {morseInput || (
                      <span className="text-muted-foreground text-sm">...</span>
                    )}
                  </span>
                </div>

                {/* NO expected Morse hint - anti-cheat */}

                {/* Dot and Dash buttons */}
                <div className="flex items-center gap-4">
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

                <p className="text-xs text-muted-foreground">
                  Pause to auto-submit &middot;{" "}
                  <kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">q</kbd>/<kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">.</kbd> dot{" "}
                  <kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">w</kbd>/<kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono border">-</kbd> dash
                </p>
              </div>
            )}

            {roundComplete && (
              <div className="flex flex-col items-center gap-4">
                {/* Stats */}
                <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-muted p-3">
                    <span className="text-xl font-bold text-foreground">
                      {timeSpent}s
                    </span>
                    <span className="text-xs text-muted-foreground">Time</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-muted p-3">
                    <span className="text-xl font-bold text-foreground">
                      {accuracy}%
                    </span>
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-muted p-3">
                    <span className="text-xl font-bold text-foreground">
                      {avgScore}
                    </span>
                    <span className="text-xs text-muted-foreground">Avg Score</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "font-mono text-lg font-bold",
                          r.correct ? "text-success" : "text-destructive"
                        )}
                      >
                        {r.decoded}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.input}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {results.filter((r) => r.correct).length}/{results.length}{" "}
                  correct
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={startRound}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Round
                  </Button>
                  <Link href="/write-exam">
                    <Button className="gap-2">
                      Start Exam
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
