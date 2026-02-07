"use client"

import { useState } from "react"
import { Trophy, Headphones, PenTool, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "overall" | "listen" | "write"

// Demo leaderboard data (will be replaced with real data when DB is connected)
const DEMO_USERS = [
  { name: "Batbold", listenWpm: 65, listenAcc: 90, writeWpm: 55, writeAcc: 88 },
  { name: "Oyunbileg", listenWpm: 50, listenAcc: 95, writeWpm: 60, writeAcc: 92 },
  { name: "Temuulen", listenWpm: 70, listenAcc: 80, writeWpm: 45, writeAcc: 85 },
  { name: "Munkhjin", listenWpm: 45, listenAcc: 88, writeWpm: 50, writeAcc: 90 },
  { name: "Enkhzul", listenWpm: 80, listenAcc: 72, writeWpm: 65, writeAcc: 78 },
  { name: "Sarantuya", listenWpm: 55, listenAcc: 92, writeWpm: 48, writeAcc: 94 },
  { name: "Ganzorig", listenWpm: 60, listenAcc: 85, writeWpm: 52, writeAcc: 82 },
  { name: "Altanshagai", listenWpm: 42, listenAcc: 96, writeWpm: 40, writeAcc: 97 },
  { name: "Dulguun", listenWpm: 75, listenAcc: 78, writeWpm: 70, writeAcc: 76 },
  { name: "Chinzorig", listenWpm: 58, listenAcc: 87, writeWpm: 55, writeAcc: 86 },
]

function computeScore(wpm: number, acc: number) {
  return (wpm + acc) / 2
}

function getRankedUsers(tab: Tab) {
  return [...DEMO_USERS]
    .map((u) => {
      const listenScore = computeScore(u.listenWpm, u.listenAcc)
      const writeScore = computeScore(u.writeWpm, u.writeAcc)
      const overallScore = (listenScore + writeScore) / 2

      return {
        ...u,
        listenScore: Math.round(listenScore * 10) / 10,
        writeScore: Math.round(writeScore * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
      }
    })
    .sort((a, b) => {
      if (tab === "listen") return b.listenScore - a.listenScore
      if (tab === "write") return b.writeScore - a.writeScore
      return b.overallScore - a.overallScore
    })
}

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "overall", label: "Overall", icon: Trophy },
  { id: "listen", label: "Listen", icon: Headphones },
  { id: "write", label: "Write", icon: PenTool },
]

export default function RankPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overall")
  const ranked = getRankedUsers(activeTab)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">Top performers ranked by combined score</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-center gap-1 rounded-lg border bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="mb-6 flex items-end justify-center gap-3">
        {[1, 0, 2].map((pos) => {
          const user = ranked[pos]
          if (!user) return null
          const rank = pos + 1
          const isFirst = rank === 1

          return (
            <div
              key={pos}
              className={cn(
                "flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm transition-all",
                isFirst ? "w-36 pb-6" : "w-28"
              )}
            >
              {isFirst && <Crown className="mb-1 h-6 w-6 text-primary" />}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full font-bold",
                  rank === 1
                    ? "bg-primary text-primary-foreground text-lg"
                    : rank === 2
                      ? "bg-muted text-foreground text-sm"
                      : "bg-muted text-foreground text-sm"
                )}
              >
                {rank}
              </div>
              <p className="mt-2 text-sm font-semibold text-card-foreground truncate max-w-full">
                {user.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeTab === "listen"
                  ? `${user.listenScore}`
                  : activeTab === "write"
                    ? `${user.writeScore}`
                    : `${user.overallScore}`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Full ranking table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
              {activeTab === "overall" && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Listen</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Write</th>
                </>
              )}
              {activeTab === "listen" && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">WPM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Accuracy</th>
                </>
              )}
              {activeTab === "write" && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">WPM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Accuracy</th>
                </>
              )}
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((user, i) => (
              <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      i === 0
                        ? "bg-primary/10 text-primary"
                        : i === 1
                          ? "bg-muted text-foreground"
                          : i === 2
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                  {user.name}
                </td>
                {activeTab === "overall" && (
                  <>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.listenScore}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.writeScore}
                    </td>
                  </>
                )}
                {activeTab === "listen" && (
                  <>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.listenWpm}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.listenAcc}%
                    </td>
                  </>
                )}
                {activeTab === "write" && (
                  <>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.writeWpm}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {user.writeAcc}%
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  {activeTab === "listen"
                    ? user.listenScore
                    : activeTab === "write"
                      ? user.writeScore
                      : user.overallScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
