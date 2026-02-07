import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

interface ScoreEntry {
  type: "listen" | "listen-exam" | "write" | "write-exam"
  accuracy: number
  wpm: number
  time: number
  date: string
  score: number
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const entry: ScoreEntry = {
      type: body.type,
      accuracy: body.accuracy,
      wpm: body.wpm || 0,
      time: body.time,
      date: new Date().toISOString(),
      score: body.score || Math.round((body.accuracy + Math.min(100, (body.wpm || 0))) / 2),
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = (user.publicMetadata as Record<string, unknown>) || {}
    const history = (meta.scoreHistory as ScoreEntry[]) || []

    history.push(entry)

    // Keep last 100 entries
    const trimmed = history.slice(-100)

    // Calculate max stats
    const listenScores = trimmed.filter((s: ScoreEntry) => s.type === "listen" || s.type === "listen-exam")
    const writeScores = trimmed.filter((s: ScoreEntry) => s.type === "write" || s.type === "write-exam")

    const maxListenAccuracy = listenScores.length > 0 ? Math.max(...listenScores.map((s: ScoreEntry) => s.accuracy)) : 0
    const maxWriteAccuracy = writeScores.length > 0 ? Math.max(...writeScores.map((s: ScoreEntry) => s.accuracy)) : 0
    const maxListenWpm = listenScores.length > 0 ? Math.max(...listenScores.map((s: ScoreEntry) => s.wpm)) : 0
    const maxWriteWpm = writeScores.length > 0 ? Math.max(...writeScores.map((s: ScoreEntry) => s.wpm)) : 0
    const maxScore = trimmed.length > 0 ? Math.max(...trimmed.map((s: ScoreEntry) => s.score)) : 0

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...meta,
        scoreHistory: trimmed,
        maxListenAccuracy,
        maxWriteAccuracy,
        maxListenWpm,
        maxWriteWpm,
        maxScore,
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Failed to save score:", error)
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = (user.publicMetadata as Record<string, unknown>) || {}

    return NextResponse.json({
      scoreHistory: meta.scoreHistory || [],
      maxListenAccuracy: meta.maxListenAccuracy || 0,
      maxWriteAccuracy: meta.maxWriteAccuracy || 0,
      maxListenWpm: meta.maxListenWpm || 0,
      maxWriteWpm: meta.maxWriteWpm || 0,
      maxScore: meta.maxScore || 0,
    })
  } catch (error) {
    console.error("Failed to get scores:", error)
    return NextResponse.json({ error: "Failed to get scores" }, { status: 500 })
  }
}
