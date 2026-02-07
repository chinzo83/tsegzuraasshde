"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MORSE_CODE, REVERSE_MORSE, MorsePlayer, ENGLISH_LETTERS, NUMBERS } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { BookOpen, Volume2, Check, Lock, ChevronRight, Circle, Minus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Category = "english" | "numbers"
type LearnStep = "show" | "listen" | "write" | "type" | "done"

const CATEGORIES: { id: Category; label: string; chars: string[] }[] = [
  { id: "english", label: "English Letters", chars: ENGLISH_LETTERS },
  { id: "numbers", label: "Numbers", chars: NUMBERS },
]

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [unlockedIndices, setUnlockedIndices] = useState<Record<Category, number>>({
    english: 0,
    numbers: 0,
  })
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [step, setStep] = useState<LearnStep>("show")
  const [morseInput, setMorseInput] = useState("")
  const [typeInput, setTypeInput] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const playerRef = useRef<MorsePlayer | null>(null)
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    playerRef.current = new MorsePlayer()
    return () => playerRef.current?.stop()
  }, [])

  const currentChars = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)?.chars || []
    : []
  const currentChar = currentChars[currentLetterIndex] || ""
  const currentMorse = MORSE_CODE[currentChar] || ""

  const playCurrentChar = useCallback(() => {
    if (playerRef.current && currentChar) {
      playerRef.current.playChar(currentChar, 12)
    }
  }, [currentChar])

  const handleWriteSymbol = useCallback(
    (symbol: "." | "-") => {
      setMorseInput((prev) => prev + symbol)
      if (gapTimerRef.current) clearTimeout(gapTimerRef.current)

      gapTimerRef.current = setTimeout(() => {
        setMorseInput((prev) => {
          const decoded = REVERSE_MORSE[prev]
          if (decoded === currentChar) {
            setFeedback("correct")
            setTimeout(() => {
              setFeedback(null)
              setStep("type")
              setMorseInput("")
            }, 800)
          } else {
            setFeedback("wrong")
            setTimeout(() => {
              setFeedback(null)
              setMorseInput("")
            }, 800)
          }
          return prev
        })
      }, 1500)
    },
    [currentChar]
  )

  const handleTypeSubmit = useCallback(() => {
    if (typeInput.toUpperCase() === currentChar) {
      setFeedback("correct")
      setTimeout(() => {
        setFeedback(null)
        setStep("done")
        if (selectedCategory) {
          setUnlockedIndices((prev) => ({
            ...prev,
            [selectedCategory]: Math.max(prev[selectedCategory], currentLetterIndex + 1),
          }))
        }
      }, 600)
    } else {
      setFeedback("wrong")
      setTimeout(() => {
        setFeedback(null)
        setTypeInput("")
      }, 600)
    }
  }, [typeInput, currentChar, selectedCategory, currentLetterIndex])

  const startLetter = useCallback((index: number) => {
    setCurrentLetterIndex(index)
    setStep("show")
    setMorseInput("")
    setTypeInput("")
    setFeedback(null)
  }, [])

  const nextLetter = useCallback(() => {
    if (currentLetterIndex + 1 < currentChars.length) {
      startLetter(currentLetterIndex + 1)
    }
  }, [currentLetterIndex, currentChars.length, startLetter])

  if (!selectedCategory) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Learn Morse Code</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a category and learn one character at a time
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="group flex flex-col items-start rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 text-left"
            >
              <h3 className="text-lg font-semibold text-card-foreground">{cat.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {cat.chars.length} characters to learn
              </p>
              <div className="mt-3 flex items-center gap-1 text-sm text-primary">
                <span>Start learning</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
          Back
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
        </h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Letter tree */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-card-foreground">Progress</h2>
            <div className="flex flex-wrap gap-2">
              {currentChars.map((c, i) => {
                const unlocked = i <= unlockedIndices[selectedCategory]
                const completed = i < unlockedIndices[selectedCategory]
                const active = i === currentLetterIndex

                return (
                  <button
                    key={c}
                    disabled={!unlocked}
                    onClick={() => unlocked && startLetter(i)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all",
                      active
                        ? "border-2 border-primary bg-primary/10 text-primary"
                        : completed
                          ? "bg-success/10 text-success border border-success/30"
                          : unlocked
                            ? "border bg-card text-card-foreground hover:bg-accent"
                            : "border bg-muted text-muted-foreground/30 cursor-not-allowed"
                    )}
                  >
                    {unlocked ? c : <Lock className="h-3 w-3" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Learning area */}
        <div className="flex-1 rounded-xl border bg-card p-6 shadow-sm">
          {step === "show" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-primary bg-primary/5 text-5xl font-bold text-primary">
                {currentChar}
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl tracking-widest text-foreground">{currentMorse}</p>
                <p className="mt-1 text-sm text-muted-foreground">Morse code for {currentChar}</p>
              </div>
              <Button onClick={() => { playCurrentChar(); setStep("listen") }} className="gap-2">
                <Volume2 className="h-4 w-4" />
                Listen
              </Button>
            </div>
          )}

          {step === "listen" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-primary bg-primary/5 text-5xl font-bold text-primary">
                {currentChar}
              </div>
              <p className="font-mono text-2xl tracking-widest text-foreground">{currentMorse}</p>
              <Button variant="outline" onClick={playCurrentChar} className="gap-2">
                <Volume2 className="h-4 w-4" />
                Play Again
              </Button>
              <Button onClick={() => setStep("write")} className="gap-2">
                Now Write It
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === "write" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <p className="text-sm text-muted-foreground">
                Encode <span className="font-bold text-foreground">{currentChar}</span> in Morse
              </p>

              <div
                className={cn(
                  "flex h-14 min-w-[140px] items-center justify-center rounded-lg border px-4 transition-colors",
                  feedback === "correct"
                    ? "border-success bg-success/10"
                    : feedback === "wrong"
                      ? "border-destructive bg-destructive/10"
                      : "bg-background"
                )}
              >
                <span className="font-mono text-2xl tracking-widest text-foreground">
                  {morseInput || <span className="text-muted-foreground text-sm">...</span>}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleWriteSymbol(".")}
                  className="h-14 w-14 rounded-full"
                >
                  <Circle className="h-4 w-4 fill-current" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleWriteSymbol("-")}
                  className="h-14 w-20 rounded-full"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>

              {feedback === "wrong" && (
                <p className="text-sm text-destructive">
                  Try again! Expected: <span className="font-mono">{currentMorse}</span>
                </p>
              )}
            </div>
          )}

          {step === "type" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <p className="text-sm text-muted-foreground">
                Type the letter for <span className="font-mono font-bold text-foreground">{currentMorse}</span>
              </p>

              <input
                type="text"
                maxLength={1}
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTypeSubmit()}
                className={cn(
                  "h-16 w-16 rounded-lg border text-center text-3xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                  feedback === "correct"
                    ? "border-success bg-success/10 text-success"
                    : feedback === "wrong"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "bg-background text-foreground"
                )}
                autoFocus
              />

              <Button onClick={handleTypeSubmit} disabled={!typeInput}>
                Submit
              </Button>

              {feedback === "wrong" && (
                <p className="text-sm text-destructive">
                  That is not correct. Try again!
                </p>
              )}
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                You learned {currentChar}!
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startLetter(currentLetterIndex)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Review
                </Button>
                {currentLetterIndex + 1 < currentChars.length && (
                  <Button onClick={nextLetter} className="gap-2">
                    Next Letter
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
