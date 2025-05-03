"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Gift } from "lucide-react"
import { MainLayout } from "@/components/main-layout"

export default function GiftCard() {
  const router = useRouter()
  const [amount, setAmount] = useState("25")
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendGiftCard = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    // Simulate sending gift card
    setTimeout(() => {
      setIsSending(false)
      router.push("/gift-card/success")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Send a Gift Card</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col items-center">
          <div className="bg-amber-100 p-4 rounded-full mb-4">
            <Gift className="h-8 w-8 text-amber-800" />
          </div>
          <h2 className="text-lg font-medium mb-1">Digital Gift Card</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Send a Digital Café gift card to someone special
          </p>

          <div className="flex justify-center space-x-3 w-full mb-4">
            {["10", "25", "50", "100"].map((value) => (
              <Button
                key={value}
                variant={amount === value ? "default" : "outline"}
                className={
                  amount === value
                    ? "bg-amber-800 hover:bg-amber-900 text-white"
                    : "border-amber-800 text-amber-800 hover:bg-amber-100"
                }
                onClick={() => setAmount(value)}
              >
                ${value}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSendGiftCard} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <Input
                id="recipient-name"
                placeholder="Enter recipient's name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="Enter recipient's email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 text-white" disabled={isSending}>
              {isSending ? "Sending..." : `Send $${amount} Gift Card`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
