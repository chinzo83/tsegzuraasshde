export const MORSE_CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
}

export const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
)

export const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
export const NUMBERS = "0123456789".split("")
export const ALL_CHARS = [...ENGLISH_LETTERS, ...NUMBERS]

export function getRandomChars(count: number, pool: string[] = ALL_CHARS): string[] {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

export function wpmToUnitMs(wpm: number): number {
  // PARIS standard: 50 units per word
  if (wpm <= 0) return 1200
  return 1200 / wpm
}

export class MorsePlayer {
  private audioContext: AudioContext | null = null
  private isPlaying = false

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  async playChar(char: string, wpm: number): Promise<void> {
    const morse = MORSE_CODE[char.toUpperCase()]
    if (!morse) return

    const unitMs = wpmToUnitMs(wpm)
    const ctx = this.getContext()

    for (let i = 0; i < morse.length; i++) {
      const symbol = morse[i]
      const duration = symbol === "." ? unitMs : unitMs * 3

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = 650
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.005)

      oscillator.start()

      await new Promise((resolve) => setTimeout(resolve, duration))

      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.005)
      await new Promise((resolve) => setTimeout(resolve, 10))
      oscillator.stop()

      // Gap between symbols within a character: 1 unit
      if (i < morse.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, unitMs))
      }
    }
  }

  async playSequence(chars: string[], wpm: number, onCharStart?: (index: number) => void): Promise<void> {
    if (this.isPlaying) return
    this.isPlaying = true
    const unitMs = wpmToUnitMs(wpm)

    for (let i = 0; i < chars.length; i++) {
      if (!this.isPlaying) break
      onCharStart?.(i)
      await this.playChar(chars[i], wpm)
      // Gap between characters: 3 units
      if (i < chars.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, unitMs * 3))
      }
    }
    this.isPlaying = false
  }

  stop() {
    this.isPlaying = false
  }
}
