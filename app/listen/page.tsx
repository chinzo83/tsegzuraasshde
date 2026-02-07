"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { MorsePlayer, getRandomChars, MORSE_CODE } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Headphones, Play, RotateCcw, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ListenPage() {
  const [wpm, setWpm] = useState(15)
  const [chars, setChars] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<Array<{ char: string; input: string; correct: boolean }>>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [roundComplete, setRoundComplete] = useState(false)
  const [started, setStarted] = useState(false)
  const playerRef = useRef<MorsePlayer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    playerRef.current = new MorsePlayer()
    return () => playerRef.current?.stop()
  }, [])

  const startRound = useCallback(() => {
    const newChars = getRandomChars(5)
    setChars(newChars)
    setCurrentIndex(-1)
    setUserInput("")
    setResults([])
    setRoundComplete(false)
    setStarted(true)
    setIsPlaying(true)

    setTimeout(() => {
      playerRef.current?.playSequence(newChars, wpm, (index) => {
        setCurrentIndex(index)
      }).then(() => {
        setIsPlaying(false)
        inputRef.current?.focus()
      })
    }, 300)
  }, [wpm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length > chars.length) return
    setUserInput(val)

    if (val.length === chars.length) {
      const newResults = chars.map((c, i) => ({
        char: c,
        input: val[i] || "",
        correct: val[i]?.toUpperCase() === c,
      }))
      setResults(newResults)
      setRoundComplete(true)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Listen</h1>
        <p className="mt-1 text-muted-foreground">Warm-up your Morse code listening skills</p>
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
            {/* Visual indicator */}
            <div className="mb-6 flex items-center justify-center gap-3">
              {chars.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold transition-all",
                    i === currentIndex && isPlaying
                      ? "border-primary bg-primary/10 text-primary scale-110"
                      : results[i]
                        ? results[i].correct
                          ? "border-success bg-success/10 text-success"
                          : "border-destructive bg-destructive/10 text-destructive"
                        : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {roundComplete ? c : i <= currentIndex ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {MORSE_CODE[c]}
                    </span>
                  ) : (
                    "?"
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            {!isPlaying && (
              <div className="flex flex-col items-center gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={chars.length}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={roundComplete}
                  placeholder="Type what you heard..."
                  className="w-full max-w-xs rounded-lg border bg-background px-4 py-3 text-center font-mono text-xl uppercase tracking-[0.3em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />

                {roundComplete && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                      {results.map((r, i) => (
                        <span
                          key={i}
                          className={cn(
                            "font-mono text-lg font-bold",
                            r.correct ? "text-success" : "text-destructive"
                          )}
                        >
                          {r.input || "_"}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {results.filter((r) => r.correct).length}/{results.length} correct
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
              </div>
            )}

            {isPlaying && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">
                Listening...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
