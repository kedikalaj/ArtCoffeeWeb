"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coffee, CloudSun, Sparkles, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useState } from "react"
import { useCafe } from "@/context/cafe-context"

// Mock data for the home screen
const mockHomeData = {
  userName: "Alex",
  beanBalance: 150,
  weather: { condition: "sunny", iconUrl: "/icons/sunny.png" },
  suggestions: {
    usuals: [
      { savedDrinkId: "SD001", name: "My Morning Brew", productName: "Latte", customizations: ["Large", "Oat Milk"] },
      {
        savedDrinkId: "SD002",
        name: "Post-Gym Shake",
        productName: "Protein Smoothie",
        customizations: ["Vanilla Protein", "Banana"],
      },
    ],
    contextual: [
      {
        productId: "PROD005",
        productName: "Iced Cold Brew",
        description: "Perfectly brewed for a hot day.",
        imageUrl: "/images/coldbrew.png",
      },
      {
        productId: "PROD010",
        productName: "Strawberry Lemonade",
        description: "Refreshing and sweet.",
        imageUrl: "/images/lemonade.png",
      },
    ],
  },
}

export default function HomePage() {
  const [data, setData] = useState(mockHomeData)
  const { user } = useCafe()

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 relative">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Digital Café Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-amber-900">Digital Café</h1>
          </div>
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              {user?.loyaltyPoints || data.beanBalance} Beans
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-amber-900">Welcome, {user?.name || data.userName}</h2>
            <div className="flex items-center text-amber-700">
              <CloudSun className="h-5 w-5 mr-1" />
              <span className="text-sm">Sunny</span>
            </div>
          </div>
        </section>

        {/* Your Usuals Section */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-amber-900">Your Usuals</h3>
            <Link href="/usuals" className="text-sm text-amber-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.suggestions.usuals.map((usual) => (
              <Card key={usual.savedDrinkId} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <Coffee className="h-6 w-6 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">{usual.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {usual.productName} • {usual.customizations.join(", ")}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contextual Suggestions */}
        <section className="mb-6">
          <div className="flex items-center mb-3">
            <CloudSun className="h-5 w-5 mr-2 text-amber-700" />
            <h3 className="text-lg font-medium text-amber-900">Perfect for a sunny day</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.suggestions.contextual.map((item) => (
              <Link href={`/product/${item.productId}`} key={item.productId}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <div className="relative h-32">
                    <Image
                      src="/placeholder.svg?height=128&width=256"
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-amber-900">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Feeling Unsure Quiz */}
        <section className="mb-6">
          <Card className="bg-gradient-to-r from-amber-100 to-amber-200 border-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-amber-900 mb-1">Feeling Unsure?</h3>
                <p className="text-sm text-amber-700">Take our quick quiz to find your perfect drink</p>
              </div>
              <Button className="bg-white text-amber-900 hover:bg-amber-50">
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Access Buttons */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/menu">
            <Button
              variant="outline"
              className="w-full border-amber-200 text-amber-800 hover:bg-amber-100 h-16 flex flex-col"
            >
              <Coffee className="h-5 w-5 mb-1" />
              <span>Browse Menu</span>
            </Button>
          </Link>
          <Link href="/orders">
            <Button
              variant="outline"
              className="w-full border-amber-200 text-amber-800 hover:bg-amber-100 h-16 flex flex-col"
            >
              <Coffee className="h-5 w-5 mb-1" />
              <span>My Orders</span>
            </Button>
          </Link>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeItem="home" />
    </div>
  )
}
