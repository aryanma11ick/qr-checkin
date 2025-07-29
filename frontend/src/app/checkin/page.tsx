'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CheckInPage() {
  const [phone, setPhone] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const lastDigit = parseInt(phone.slice(-1))

    if (isNaN(lastDigit)) {
      toast.error("Invalid phone number")
      return
    }

    if (lastDigit <= 4) {
      // Employee
      const now = new Date().toLocaleString()
      toast.success(`Employee check-in logged at ${now}`)
      // TODO: POST to backend log endpoint
    } else {
      // Visitor
      toast.info("Redirecting to visitor registration...")
      setTimeout(() => {
        router.push("/visitor/register")
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-bold mb-6">Check-In Portal</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Check In
        </Button>
      </form>
    </div>
  )
}
