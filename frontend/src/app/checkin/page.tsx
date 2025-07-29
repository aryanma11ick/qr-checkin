'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function CheckInPage() {
  const [phone, setPhone] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("phone", phone)
      .single()
    console.log("Fetched employee:", employee)
    console.error("Supabase error:", error)

    if (error || !employee) {
      // Not an employee
      toast.info("Redirecting to visitor registration...")
      setTimeout(() => {
        router.push("/visitor/register")
      }, 2000)
      return
    }

    // It's an employee — log check-in
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().split(" ")[0]

    const { error: insertError } = await supabase
      .from("employee_checkins")
      .insert([
        {
          employee_id: employee.id,
          checkin_date: date,
          checkin_time: time,
        },
      ])

    if (insertError) {
      toast.error("Failed to log check-in.")
      return
    }

    toast.success(`Employee check-in logged at ${time}`)
    setPhone("")
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
