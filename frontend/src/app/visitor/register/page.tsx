// app/visitor/register/page.tsx
"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

export default function VisitorRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    whom_to_meet: "",
    purpose: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Send to backend
    toast.success("Visitor Registered!")

    setFormData({ name: "", phone: "", email: "", whom_to_meet: "", purpose: "" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Visitor Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.phone} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="whom_to_meet">Whom to Meet</Label>
              <Input id="whom_to_meet" name="whom_to_meet" value={formData.purpose} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Input id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
