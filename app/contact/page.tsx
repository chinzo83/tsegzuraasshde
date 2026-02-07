"use client"

import { useState } from "react"
import { Mail, Phone, Facebook, Instagram, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormState({ name: "", email: "", message: "" })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Get in touch with the Tsegzraas team
        </p>
      </div>

      {/* Top row: Map + Contact Info */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Map */}
        <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
          <iframe
            title="Academy Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2674.5!2d106.9177016!3d47.9184676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d969243bfba2b59%3A0x5009a234eee6b0f4!2sUlaanbaatar%2C%20Mongolia!5e0!3m2!1sen!2s!4v1700000000000"
            width="100%"
            height="280"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Contact Info */}
        <div className="flex flex-1 flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">
            Contact Information
          </h2>
          <div className="flex flex-col gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-5 w-5 text-primary" />
              Facebook Page
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-5 w-5 text-primary" />
              Instagram
            </a>
            <a
              href="mailto:info@tsegzraas.mn"
              className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-5 w-5 text-primary" />
              info@tsegzraas.mn
            </a>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="h-5 w-5 text-primary" />
              +976 9999 0000
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              Ulaanbaatar, Mongolia
            </div>
          </div>
        </div>
      </div>

      {/* Feedback form */}
      <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">
          Send us a message
        </h2>

        {submitted && (
          <div className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">
            Thank you! Your message has been sent.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                required
                placeholder="Your name"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                required
                placeholder="you@example.com"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <textarea
              id="contact-message"
              required
              rows={5}
              placeholder="Write your message..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formState.message}
              onChange={(e) =>
                setFormState({ ...formState, message: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="self-start gap-2">
            <Send className="h-4 w-4" />
            Send Message
          </Button>
        </form>
      </div>
    </div>
  )
}
