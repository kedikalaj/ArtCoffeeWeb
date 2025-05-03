"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Gift } from "lucide-react"
import { MainLayout } from "@/components/main-layout"

export default function GiftCardSuccess() {
  const router = useRouter()

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-amber-900 mb-2">Gift Card Sent!</h1>
        <p className="text-muted-foreground mb-8">
          Your gift card has been sent successfully. The recipient will receive it via email.
        </p>

        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <Button className="bg-amber-800 hover:bg-amber-900 text-white" onClick={() => router.push("/menu")}>
            Back to Menu
          </Button>

          <Button
            variant="outline"
            className="border-amber-800 text-amber-800 hover:bg-amber-100"
            onClick={() => router.push("/gift-card")}
          >
            <Gift className="h-4 w-4 mr-2" />
            Send Another Gift Card
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
