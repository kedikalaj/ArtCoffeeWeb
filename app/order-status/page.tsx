"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check, Coffee, ShoppingBag } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { OrderStatusAnimation } from "@/components/order-status-animation"
import { mockOrderItems } from "@/lib/mock-data"

export default function OrderStatus() {
  const router = useRouter()
  const [orderStatus, setOrderStatus] = useState("placed")
  const [progress, setProgress] = useState(0)
  const [isPaidForward, setIsPaidForward] = useState(false)

  // Simulate order status updates
  useEffect(() => {
    const statusSequence = ["placed", "preparing", "ready"]
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++
        setOrderStatus(statusSequence[currentIndex])
        setProgress((currentIndex + 1) * 33.33)
      } else {
        clearInterval(interval)
      }
    }, 5000)

    // Randomly determine if order was paid forward
    const randomPaidForward = Math.random() > 0.7
    setIsPaidForward(randomPaidForward)

    return () => clearInterval(interval)
  }, [])

  const getStatusText = () => {
    switch (orderStatus) {
      case "placed":
        return "Order Placed"
      case "preparing":
        return "Preparing Your Order"
      case "ready":
        return "Ready for Pickup"
      default:
        return "Order Placed"
    }
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold text-amber-900 mb-4">Order Status</h1>

      {isPaidForward && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <h3 className="font-medium text-amber-900 mb-1">Your order was paid forward!</h3>
            <p className="text-sm text-amber-700">Someone anonymously paid for your order. Enjoy!</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <OrderStatusAnimation status={orderStatus} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-medium mb-4">{getStatusText()}</h2>
          <Progress value={progress} className="h-2 mb-4" />

          <div className="grid grid-cols-3 text-center">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${orderStatus !== "placed" ? "bg-amber-100 text-amber-800" : "bg-amber-800 text-white"}`}
              >
                {orderStatus !== "placed" ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1">Placed</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${orderStatus === "ready" ? "bg-amber-100 text-amber-800" : orderStatus === "preparing" ? "bg-amber-800 text-white" : "bg-muted text-muted-foreground"}`}
              >
                {orderStatus === "ready" ? <Check className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1">Preparing</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${orderStatus === "ready" ? "bg-amber-800 text-white" : "bg-muted text-muted-foreground"}`}
              >
                <Check className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="font-medium mb-3">Order #12345</h2>

          <div className="space-y-3">
            {mockOrderItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex items-center">
                  <span className="mr-2">{item.quantity}x</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.customization}</p>
                  </div>
                </div>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1 border-amber-800 text-amber-800 hover:bg-amber-100"
          onClick={() => router.push("/menu")}
        >
          Back to Menu
        </Button>
        <Button className="flex-1 bg-amber-800 hover:bg-amber-900 text-white" onClick={() => router.push("/profile")}>
          View Profile
        </Button>
      </div>
    </MainLayout>
  )
}
