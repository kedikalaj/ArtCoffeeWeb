"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coffee, Gift, LogOut, Star, User } from "lucide-react"
import { useCafe } from "@/context/cafe-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { mockOrderHistory, mockRewards } from "@/lib/mock-data"

export default function Profile() {
  const router = useRouter()
  const { user, logout } = useCafe()
  const [activeTab, setActiveTab] = useState("profile")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <div className="flex-1 px-4 py-6 pb-28 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-amber-900">Profile</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-100 rounded-full p-4 mr-4">
              <User className="h-8 w-8 text-amber-800" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="giftcards" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Gift Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="mb-6">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Loyalty Points</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 mr-2 fill-amber-500" />
                    <span className="font-bold text-2xl">{user.loyaltyPoints}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-800 text-amber-800 hover:bg-amber-100"
                    onClick={() => setActiveTab("rewards")}
                  >
                    View Rewards
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Order History</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {mockOrderHistory.map((order, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <Badge
                          className={
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1 mb-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      {index < mockOrderHistory.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="mt-0">
            <Card className="mb-6">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Your Points</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-amber-500 mr-2 fill-amber-500" />
                  <span className="font-bold text-2xl">{user.loyaltyPoints}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn 10 points for every $1 spent. Redeem points for free drinks and food items.
                </p>
              </CardContent>
            </Card>

            <h3 className="font-medium mb-3">Available Rewards</h3>
            <div className="space-y-3">
              {mockRewards.map((reward, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <Coffee className="h-5 w-5 text-amber-800" />
                      </div>
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">{reward.points} points</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-800 text-amber-800 hover:bg-amber-100"
                      disabled={user.loyaltyPoints < reward.points}
                    >
                      Redeem
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="giftcards" className="mt-0">
            <div className="grid gap-4">
              <Button
                className="bg-amber-800 hover:bg-amber-900 text-white"
                onClick={() => router.push("/gift-card")}
              >
                <Gift className="h-5 w-5 mr-2" />
                Send a Gift Card
              </Button>

              <h3 className="font-medium mt-2">Your Gift Cards</h3>
              {user.giftCards && user.giftCards.length > 0 ? (
                <div className="space-y-3">
                  {user.giftCards.map((card, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Gift Card</h4>
                          <Badge className="bg-amber-100 text-amber-800">${card.amount}</Badge>
                        </div>
                        <p className="text-sm mb-1">From: {card.from}</p>
                        <p className="text-sm italic">"{card.message}"</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">You don&apos;t have any gift cards yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation activeItem="profile" />
    </div>
  )
}
