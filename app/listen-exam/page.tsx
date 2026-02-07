"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { MorsePlayer, getRandomChars } from "@/lib/morse"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Headphones, Play, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const CHARS_PER_BLOCK = 5
const TOTAL_BLOCKS = 20
const TOTAL_CHARS = CHARS_PER_BLOCK * TOTAL_BLOCKS // 100

export default function ListenExamPage() {
  const [wpm, setWpm] = useState(15)
  const [allChars, setAllChars] = useState<string[]>([])
  const [currentBlock, setCurrentBlock] = useState(0)
  const [blockInput, setBlockInput] = useState("")
  const [blockResults, setBlockResults] = useState<
    Array<Array<{ char: string; input: string; correct: boolean }>>
  >([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [blockTypingPhase, setBlockTypingPhase] = useState(false)
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

  const getCurrentBlockChars = useCallback(() => {
    const start = currentBlock * CHARS_PER_BLOCK
    return allChars.slice(start, start + CHARS_PER_BLOCK)
  }, [allChars, currentBlock])

  const playBlock = useCallback(
    (blockIndex: number, chars: string[]) => {
      setIsPlaying(true)
      setBlockTypingPhase(false)
      setBlockInput("")

      setTimeout(() => {
        const blockChars = chars || getCurrentBlockChars()
        playerRef.current
          ?.playSequence(blockChars, wpm)
          .then(() => {
            setIsPlaying(false)
            setBlockTypingPhase(true)
            inputRef.current?.focus()
          })
      }, 400)
    },
    [wpm, getCurrentBlockChars]
  )

  const startExam = useCallback(() => {
    const newChars = getRandomChars(TOTAL_CHARS)
    setAllChars(newChars)
    setCurrentBlock(0)
    setBlockInput("")
    setBlockResults([])
    setExamComplete(false)
    setExamStarted(true)
    setStartTime(Date.now())

    // Play first block
    const firstBlockChars = newChars.slice(0, CHARS_PER_BLOCK)
    setIsPlaying(true)
    setBlockTypingPhase(false)

    setTimeout(() => {
      playerRef.current
        ?.playSequence(firstBlockChars, wpm)
        .then(() => {
          setIsPlaying(false)
          setBlockTypingPhase(true)
          inputRef.current?.focus()
        })
    }, 500)
  }, [wpm])

  const submitBlock = useCallback(() => {
    const blockChars = getCurrentBlockChars()
    const results = blockChars.map((c, i) => ({
      char: c,
      input: (blockInput[i] || "").toUpperCase(),
      correct: (blockInput[i] || "").toUpperCase() === c,
    }))

    const newBlockResults = [...blockResults, results]
    setBlockResults(newBlockResults)

    const nextBlock = currentBlock + 1
    if (nextBlock >= TOTAL_BLOCKS) {
      // Exam finished
      setEndTime(Date.now())
      setExamComplete(true)
      setBlockTypingPhase(false)
    } else {
      setCurrentBlock(nextBlock)
      setBlockInput("")
      // Play next block
      const nextBlockChars = allChars.slice(
        nextBlock * CHARS_PER_BLOCK,
        (nextBlock + 1) * CHARS_PER_BLOCK
      )
      playBlock(nextBlock, nextBlockChars)
    }
  }, [getCurrentBlockChars, blockInput, blockResults, currentBlock, allChars, playBlock])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length > CHARS_PER_BLOCK) return
    setBlockInput(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && blockTypingPhase) {
      submitBlock()
    }
  }

  // Calculate stats
  const allResults = blockResults.flat()
  const accuracy =
    allResults.length > 0
      ? Math.round(
          (allResults.filter((r) => r.correct).length / allResults.length) * 100
        )
      : 0
  const timeSpent =
    endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : "0"
  const wpmScore =
    endTime && startTime
      ? Math.round(
          (allResults.filter((r) => r.correct).length /
            ((endTime - startTime) / 1000)) *
            12
        )
      : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Listen Exam</h1>
        <p className="mt-1 text-muted-foreground">
          {TOTAL_BLOCKS} blocks of {CHARS_PER_BLOCK} characters ({TOTAL_CHARS}{" "}
          total)
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
          <div className="rounded-lg bg-muted p-4 mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">
              How it works
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                Each block plays {CHARS_PER_BLOCK} Morse characters
              </li>
              <li>
                After the audio, type what you heard
              </li>
              <li>
                Click &quot;Next&quot; or press Enter to advance
              </li>
              <li>
                {TOTAL_BLOCKS} blocks total
              </li>
            </ul>
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
          {/* Block progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Block {currentBlock + 1} of {TOTAL_BLOCKS}
              </span>
              <span className="text-xs text-muted-foreground">
                {blockResults.length * CHARS_PER_BLOCK}/{TOTAL_CHARS} characters
                done
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(currentBlock / TOTAL_BLOCKS) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Block indicator - hidden characters during playback */}
          <div className="mb-6 flex items-center justify-center gap-3">
            {Array.from({ length: CHARS_PER_BLOCK }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-12 w-12 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-bold",
                  isPlaying
                    ? "border-border bg-muted animate-pulse"
                    : blockInput[i]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                )}
              >
                {isPlaying ? "" : blockInput[i] || "?"}
              </div>
            ))}
          </div>

          {isPlaying && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Listening... focus on the sounds
            </p>
          )}

          {blockTypingPhase && (
            <div className="flex flex-col items-center gap-4">
              <input
                ref={inputRef}
                type="text"
                maxLength={CHARS_PER_BLOCK}
                value={blockInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type what you heard..."
                className="w-full max-w-xs rounded-lg border bg-background px-4 py-3 text-center font-mono text-xl uppercase tracking-[0.3em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {blockInput.length}/{CHARS_PER_BLOCK} characters
                </p>
              </div>
              <Button onClick={submitBlock} className="gap-2">
                {currentBlock + 1 < TOTAL_BLOCKS ? (
                  <>
                    Next Block
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  "Finish Exam"
                )}
              </Button>
            </div>
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
              <span className="text-2xl font-bold text-foreground">
                {accuracy}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">
                {timeSpent}s
              </span>
              <span className="text-xs text-muted-foreground">Total Time</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted p-4">
              <span className="text-2xl font-bold text-foreground">
                {wpmScore}
              </span>
              <span className="text-xs text-muted-foreground">WPM</span>
            </div>
          </div>

          {/* Block-by-block results */}
          <div className="mb-6 space-y-3">
            {blockResults.map((block, blockIdx) => (
              <div key={blockIdx} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Block {blockIdx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {block.filter((r) => r.correct).length}/{block.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {block.map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex h-9 w-9 flex-col items-center justify-center rounded-md border text-xs font-mono font-bold",
                        r.correct
                          ? "border-success bg-success/10 text-success"
                          : "border-destructive bg-destructive/10 text-destructive"
                      )}
                    >
                      <span>{r.char}</span>
                      {!r.correct && (
                        <span className="text-[8px] opacity-60">
                          {r.input || "_"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
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
