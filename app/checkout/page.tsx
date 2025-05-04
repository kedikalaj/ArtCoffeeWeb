"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CreditCard, Banknote, Gift } from "lucide-react"
import { useCafe } from "@/context/cafe-context"
import { MainLayout } from "@/components/main-layout"
import { PayItForwardModal } from "@/components/pay-it-forward-modal"

export default function Checkout() {
  const router = useRouter()
  const { cart, clearCart } = useCafe()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPayItForward, setShowPayItForward] = useState(false)
  console.log(cart)
  const subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handlePlaceOrder = () => {
    setIsProcessing(true)

    // Simulate order processing
    setTimeout(() => {
      clearCart()
      setIsProcessing(false)
      router.push("/order-status")
    }, 2000)
  }

  if (cart.items.length === 0) {
    router.push("/menu")
    return null
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/cart")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Checkout</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="font-medium mb-3">Delivery Method</h2>
          <RadioGroup defaultValue="pickup" className="mb-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Pickup at Counter</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="table" id="table" />
              <Label htmlFor="table">Deliver to Table</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2 mb-4">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea id="notes" placeholder="Any special requests or allergies..." className="resize-none" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="font-medium mb-3">Payment Method</h2>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit/Debit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center">
                <Banknote className="h-4 w-4 mr-2" />
                Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gift" id="gift" />
              <Label htmlFor="gift" className="flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                Gift Card
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "gift" && (
            <div className="space-y-2">
              <Label htmlFor="gift-card">Gift Card Number</Label>
              <Input id="gift-card" placeholder="Enter gift card number" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-3">
        <Button
          className="w-full bg-amber-800 hover:bg-amber-900 text-white"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>

        <Button
          variant="outline"
          className="w-full border-amber-800 text-amber-800 hover:bg-amber-100"
          onClick={() => setShowPayItForward(true)}
        >
          <Gift className="h-4 w-4 mr-2" />
          Pay It Forward
        </Button>
      </div>

      {showPayItForward && <PayItForwardModal onClose={() => setShowPayItForward(false)} />}
    </MainLayout>
  )
}
