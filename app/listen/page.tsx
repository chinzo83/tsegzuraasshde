"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { MorsePlayer, getRandomChars } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Headphones, Play, RotateCcw, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const TYPING_TIME_SECONDS = 30

export default function ListenPage() {
  const [wpm, setWpm] = useState(15)
  const [chars, setChars] = useState<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<
    Array<{ char: string; input: string; correct: boolean }>
  >([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [roundComplete, setRoundComplete] = useState(false)
  const [started, setStarted] = useState(false)
  const [typingPhase, setTypingPhase] = useState(false)
  const [countdown, setCountdown] = useState(TYPING_TIME_SECONDS)
  const [typingStartTime, setTypingStartTime] = useState(0)
  const [typingEndTime, setTypingEndTime] = useState(0)
  const playerRef = useRef<MorsePlayer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    playerRef.current = new MorsePlayer()
    return () => {
      playerRef.current?.stop()
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const finishRound = useCallback(
    (input: string) => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      setTypingEndTime(Date.now())
      const newResults = chars.map((c, i) => ({
        char: c,
        input: input[i] || "",
        correct: (input[i] || "").toUpperCase() === c,
      }))
      setResults(newResults)
      setRoundComplete(true)
      setTypingPhase(false)
    },
    [chars]
  )

  const startRound = useCallback(() => {
    const newChars = getRandomChars(5)
    setChars(newChars)
    setUserInput("")
    setResults([])
    setRoundComplete(false)
    setStarted(true)
    setIsPlaying(true)
    setTypingPhase(false)
    setCountdown(TYPING_TIME_SECONDS)
    if (countdownRef.current) clearInterval(countdownRef.current)

    setTimeout(() => {
      playerRef.current
        ?.playSequence(newChars, wpm)
        .then(() => {
          setIsPlaying(false)
          setTypingPhase(true)
          setTypingStartTime(Date.now())
          setCountdown(TYPING_TIME_SECONDS)
          inputRef.current?.focus()

          countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                if (countdownRef.current) clearInterval(countdownRef.current)
                // Time's up - lock input and show results
                setUserInput((currentInput) => {
                  // Use a timeout to allow state to settle
                  setTimeout(() => {
                    finishRound(currentInput)
                  }, 0)
                  return currentInput
                })
                return 0
              }
              return prev - 1
            })
          }, 1000)
        })
    }, 300)
  }, [wpm, finishRound])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (roundComplete) return
    const val = e.target.value.toUpperCase()
    if (val.length > chars.length) return
    setUserInput(val)

    if (val.length === chars.length) {
      finishRound(val)
    }
  }

  const accuracy =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.correct).length / results.length) * 100
        )
      : 0

  const timeSpent =
    typingEndTime && typingStartTime
      ? ((typingEndTime - typingStartTime) / 1000).toFixed(1)
      : "0"

  const avgScore =
    results.length > 0
      ? Math.round(
          (accuracy +
            Math.max(
              0,
              100 -
                ((typingEndTime - typingStartTime) / 1000 / TYPING_TIME_SECONDS) *
                  100
            )) /
            2
        )
      : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Listen</h1>
        <p className="mt-1 text-muted-foreground">
          Warm-up your Morse code listening skills
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

      {/* Play area */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {!started ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">
              Press play to hear 5 random Morse characters
            </p>
            <Button onClick={startRound} className="gap-2">
              <Play className="h-4 w-4" />
              Play
            </Button>
          </div>
        ) : (
          <>
            {/* Playing phase - NO letters, NO morse shown */}
            {isPlaying && (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex items-center gap-3">
                  {chars.map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-lg border-2 border-border bg-muted animate-pulse"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                  Listening... focus on the sounds
                </p>
              </div>
            )}

            {/* Typing phase with countdown */}
            {typingPhase && !roundComplete && (
              <div className="flex flex-col items-center gap-4">
                {/* Countdown progress bar */}
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Time remaining</span>
                    <span
                      className={cn(
                        "font-mono text-sm font-bold",
                        countdown <= 5 ? "text-destructive" : "text-primary"
                      )}
                    >
                      {countdown}s
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        countdown <= 5 ? "bg-destructive" : "bg-primary"
                      )}
                      style={{
                        width: `${(countdown / TYPING_TIME_SECONDS) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  maxLength={chars.length}
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Type what you heard..."
                  className="w-full max-w-xs rounded-lg border bg-background px-4 py-3 text-center font-mono text-xl uppercase tracking-[0.3em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {userInput.length}/{chars.length} characters
                </p>
              </div>
            )}

            {/* Results */}
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

                {/* Character results */}
                <div className="flex items-center gap-3">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 font-mono font-bold",
                        r.correct
                          ? "border-success bg-success/10 text-success"
                          : "border-destructive bg-destructive/10 text-destructive"
                      )}
                    >
                      <span className="text-lg">{r.char}</span>
                      {!r.correct && (
                        <span className="text-[9px] opacity-60">
                          {r.input || "_"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  {results.filter((r) => r.correct).length}/{results.length}{" "}
                  correct
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={startRound} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    New Round
                  </Button>
                  <Link href="/listen-exam">
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
