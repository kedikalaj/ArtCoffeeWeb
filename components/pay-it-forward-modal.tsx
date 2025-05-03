"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Gift, X, Check } from "lucide-react"

interface PayItForwardModalProps {
  onClose: () => void
}

export function PayItForwardModal({ onClose }: PayItForwardModalProps) {
  const [amount, setAmount] = useState("5")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)

      // Close modal after showing success
      setTimeout(() => {
        onClose()
      }, 2000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Pay It Forward</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {!isComplete ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="bg-amber-100 p-4 rounded-full mb-3">
                  <Gift className="h-6 w-6 text-amber-800" />
                </div>
                <p className="text-muted-foreground">Pay for someone else's order anonymously and spread kindness</p>
              </div>

              <div className="space-y-2">
                <Label>Contribution Amount</Label>
                <RadioGroup value={amount} onValueChange={setAmount} className="flex justify-between">
                  {["5", "10", "15", "20"].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`amount-${value}`} />
                      <Label htmlFor={`amount-${value}`}>${value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Contribute $${amount}`}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="bg-green-100 p-4 rounded-full mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-lg mb-1">Thank You!</h3>
              <p className="text-muted-foreground">Your contribution will make someone's day brighter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
