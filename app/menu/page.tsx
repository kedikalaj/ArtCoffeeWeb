"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Coffee, Search, ArrowLeft } from "lucide-react"
import { useCafe } from "@/context/cafe-context"
import { mockCategories, mockProducts } from "@/lib/mock-data"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Input } from "@/components/ui/input"

export default function Menu() {
  const router = useRouter()
  const { cart, user } = useCafe()
  const [activeCategory, setActiveCategory] = useState("coffee")
  const [products, setProducts] = useState(mockProducts.filter((p) => p.category === "coffee"))
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setProducts(mockProducts.filter((p) => p.category === activeCategory))
  }, [activeCategory])

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-amber-900">Menu</h1>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="relative mr-2" onClick={() => router.push("/cart")}>
              <ShoppingBag className="h-5 w-5 text-amber-900" />
              {cart.items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-800">
                  {cart.items.length}
                </Badge>
              )}
            </Button>
            <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              {user?.loyaltyPoints || 0} Beans
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-10 bg-white border-amber-200 focus-visible:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <Tabs defaultValue="coffee" className="w-full" onValueChange={setActiveCategory}>
          <TabsList className="bg-amber-100/50 p-1 mb-4 overflow-x-auto flex w-full justify-start">
            {mockCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm rounded-md"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {mockCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map((product) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex h-24">
                        <div className="relative w-24 h-full">
                          <Image
                            src={product.image || "/placeholder.svg?height=96&width=96"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-3 flex-1 flex flex-col justify-center">
                          <h3 className="font-medium text-amber-900">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                          <p className="font-bold text-amber-800 mt-1">${product.price.toFixed(2)}</p>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeItem="menu" />
    </div>
  )
}
