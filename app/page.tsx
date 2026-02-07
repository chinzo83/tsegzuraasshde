import Link from "next/link"
import {
  Headphones,
  PenTool,
  BookOpen,
  Trophy,
  GraduationCap,
  Radio,
  ArrowRight,
} from "lucide-react"

const FEATURES = [
  {
    icon: Headphones,
    title: "Listen",
    description: "Train your ear to decode Morse code signals at various speeds.",
    href: "/listen",
  },
  {
    icon: PenTool,
    title: "Write",
    description: "Practice sending Morse code by encoding characters with dots and dashes.",
    href: "/write",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Master the Morse alphabet step by step through structured lessons.",
    href: "/learn",
  },
  {
    icon: Trophy,
    title: "Rank",
    description: "Compete with other learners and climb the global leaderboard.",
    href: "/rank",
  },
  {
    icon: GraduationCap,
    title: "Academy",
    description: "Access video lessons and take formal exams from your teachers.",
    href: "/academy",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Radio className="h-8 w-8 text-primary" />
        </div>
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Master Morse Code with Confidence
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          An interactive platform for learning, practicing, and testing your
          Morse code skills. Listen, write, and earn your rank.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/listen"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Start Listening
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-3 text-sm font-semibold text-card-foreground shadow-sm transition-colors hover:bg-accent"
          >
            Begin Learning
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Morse Reference */}
      <section className="border-t bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Quick Reference</h2>
          <p className="mt-2 text-muted-foreground">
            The International Morse Code alphabet
          </p>
          <div className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-9">
            {Object.entries(
              (() => {
                const m: Record<string, string> = {}
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("").forEach((c) => {
                  const codes: Record<string, string> = {
                    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
                    F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
                    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
                    P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
                    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--",
                    Z: "--..", "0": "-----", "1": ".----", "2": "..---",
                    "3": "...--", "4": "....-", "5": ".....", "6": "-....",
                    "7": "--...", "8": "---..", "9": "----.",
                  }
                  m[c] = codes[c]
                })
                return m
              })()
            ).map(([char, code]) => (
              <div
                key={char}
                className="flex flex-col items-center rounded-lg border bg-card p-2"
              >
                <span className="text-sm font-bold text-foreground">{char}</span>
                <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
