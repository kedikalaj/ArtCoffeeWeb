"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Coffee, DollarSign, LogOut, ShoppingBag, Users } from "lucide-react"
import { mockAdminOrders, mockAdminStats, mockAdminProducts } from "@/lib/mock-data"

export default function Admin() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex border-b bg-white">
        <div className="container flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-amber-900">Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-amber-800" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">${mockAdminStats.totalSales}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <ShoppingBag className="h-6 w-6 text-amber-800" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold">{mockAdminStats.ordersToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-amber-800" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{mockAdminStats.activeUsers}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Products
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {mockAdminOrders.map((order, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.time} • Table {order.table}
                          </p>
                        </div>
                        <Badge
                          className={
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Preparing"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1 mb-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      {index < mockAdminOrders.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Menu Items</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {mockAdminProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                          <Coffee className="h-5 w-5 text-amber-800" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart3 className="h-40 w-40 text-muted-foreground" />
                </div>
                <p className="text-center text-muted-foreground">Sales analytics visualization would appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
