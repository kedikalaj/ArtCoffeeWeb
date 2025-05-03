"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Minus, Plus, ShoppingBag, EyeIcon as Eye3d, Coffee } from "lucide-react"
import Image from "next/image"
import { useCafe } from "@/context/cafe-context"
import { mockProducts } from "@/lib/mock-data"
import { ARView } from "@/components/ar-view"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useUser } from "@clerk/nextjs"

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { addToCart } = useCafe()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("medium")
  const [milk, setMilk] = useState("whole")
  const [extras, setExtras] = useState<string[]>([])
  const [showAR, setShowAR] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    // Find product by ID
    const foundProduct = mockProducts.find((p) => p.id === params.id)
    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      router.push("/menu")
    }
  }, [params.id, router])

  const handleAddExtra = (extra: string) => {
    if (extras.includes(extra)) {
      setExtras(extras.filter((e) => e !== extra))
    } else {
      setExtras([...extras, extra])
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const customizations = {
      size,
      milk,
      extras,
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      customizations,
    })

    router.push("/cart")
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-amber-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-amber-900">Customize Order</h1>
            </div>
            <div className="flex items-center">
              <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
                <Coffee className="h-4 w-4 mr-1" />
                {user?.loyaltyPoints || 0} Beans
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center h-[60vh]">
            <p>Loading product...</p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeItem="menu" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-amber-900">Customize Order</h1>
          </div>
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              {user?.loyaltyPoints || 0} Beans
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Rest of your product detail content */}
        <div className="relative mb-6">
          <Image
            src={product.image || "/placeholder.svg?height=300&width=400"}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
          />

          {product.category === "coffee" && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm"
              onClick={() => setShowAR(true)}
            >
              <Eye3d className="h-4 w-4 mr-2" />
              View in AR
            </Button>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-900">{product.name}</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Size</h3>
            <RadioGroup value={size} onValueChange={setSize} className="flex space-x-2 mb-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="size-small" />
                <Label htmlFor="size-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label htmlFor="size-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="size-large" />
                <Label htmlFor="size-large">Large</Label>
              </div>
            </RadioGroup>

            {product.category === "coffee" && (
              <>
                <Separator className="my-4" />

                <h3 className="font-medium mb-3">Milk</h3>
                <RadioGroup value={milk} onValueChange={setMilk} className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whole" id="milk-whole" />
                    <Label htmlFor="milk-whole">Whole Milk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skim" id="milk-skim" />
                    <Label htmlFor="milk-skim">Skim Milk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="almond" id="milk-almond" />
                    <Label htmlFor="milk-almond">Almond Milk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oat" id="milk-oat" />
                    <Label htmlFor="milk-oat">Oat Milk</Label>
                  </div>
                </RadioGroup>

                <Separator className="my-4" />

                <h3 className="font-medium mb-3">Extras</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra-shot"
                      checked={extras.includes("shot")}
                      onCheckedChange={() => handleAddExtra("shot")}
                    />
                    <Label htmlFor="extra-shot">Extra Shot</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra-vanilla"
                      checked={extras.includes("vanilla")}
                      onCheckedChange={() => handleAddExtra("vanilla")}
                    />
                    <Label htmlFor="extra-vanilla">Vanilla Syrup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra-caramel"
                      checked={extras.includes("caramel")}
                      onCheckedChange={() => handleAddExtra("caramel")}
                    />
                    <Label htmlFor="extra-caramel">Caramel Syrup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra-whip"
                      checked={extras.includes("whip")}
                      onCheckedChange={() => handleAddExtra("whip")}
                    />
                    <Label htmlFor="extra-whip">Whipped Cream</Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center">{quantity}</span>
            <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xl font-bold">${(product.price * quantity).toFixed(2)}</p>
        </div>

        <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white" onClick={handleAddToCart}>
          <ShoppingBag className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeItem="menu" />

      {showAR && <ARView product={product} onClose={() => setShowAR(false)} />}
    </div>
  )
}
