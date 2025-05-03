"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Gift, QrCode, Heart } from "lucide-react"
import { useCafe } from "@/context/cafe-context"

export default function Onboarding() {
  const router = useRouter()
  const { user } = useCafe()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Welcome to Digital Café",
      description:
        "Your personal café companion that makes ordering and enjoying your favorite drinks easier than ever.",
      icon: <Coffee className="h-12 w-12 text-amber-800" />,
    },
    {
      title: "Customize Your Orders",
      description: "Create and save your favorite drink combinations for quick ordering.",
      icon: <Coffee className="h-12 w-12 text-amber-800" />,
    },
    {
      title: "Send Digital Gift Cards",
      description: "Share the joy of coffee with friends and family through digital gift cards.",
      icon: <Gift className="h-12 w-12 text-amber-800" />,
    },
    {
      title: "Scan & Order at Table",
      description: "Scan the QR code at your table to place an order without waiting in line.",
      icon: <QrCode className="h-12 w-12 text-amber-800" />,
    },
    {
      title: "Pay It Forward",
      description: "Spread kindness by paying for someone else's order anonymously.",
      icon: <Heart className="h-12 w-12 text-amber-800" />,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/home")
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md mb-8">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="bg-amber-100 p-6 rounded-full mb-6">{steps[currentStep].icon}</div>
            <h2 className="text-2xl font-bold mb-2 text-amber-900">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>

            <Button onClick={handleNext} className="w-full bg-amber-800 hover:bg-amber-900 text-white">
              {currentStep < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-amber-800" : "bg-amber-200"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
