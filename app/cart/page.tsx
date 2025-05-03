"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCafe } from "@/context/cafe-context"
import { MainLayout } from "@/components/main-layout"

export default function Cart() {
  const router = useRouter()
  const { cart, updateCartItemQuantity, removeFromCart } = useCafe()

  const subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/menu")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-amber-900">Your Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Image
            src="/placeholder.svg?height=120&width=120"
            alt="Empty cart"
            width={120}
            height={120}
            className="mb-4 opacity-50"
          />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart to get started</p>
          <Button onClick={() => router.push("/menu")} className="bg-amber-800 hover:bg-amber-900 text-white">
            Browse Menu
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/menu")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Your Cart</h1>
      </div>

      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <Card key={`${item.id}-${JSON.stringify(item.customizations)}`}>
            <CardContent className="p-4 flex items-center">
              <Image
                src={item.image || "/placeholder.svg?height=80&width=80"}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md mr-4 h-20 w-20 object-cover"
              />

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {item.customizations?.size && <span className="capitalize">{item.customizations.size}</span>}
                  {item.customizations?.milk && <span>, {item.customizations.milk} milk</span>}
                  {item.customizations?.extras && item.customizations.extras.length > 0 && (
                    <span>, {item.customizations.extras.join(", ")}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateCartItemQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateCartItemQuantity(item, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item)} className="ml-2">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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

      <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white" onClick={handleCheckout}>
        Proceed to Checkout
      </Button>
    </MainLayout>
  )
}
