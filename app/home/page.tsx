"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Coffee, CloudSun, Sparkles, Plus, Loader2, Receipt } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useCafe } from "@/context/cafe-context"
import axiosInstance from "@/lib/axios" // *** Adjust this import path ***

// --- Updated Interfaces based on Actual API Response ---
interface ProductInfo {
  id: number; // Is number in API
  name: string;
  imageUrl: string | null; // Is base64 string or null in API
}

interface OptionInfo {
    id: number; // Is number in API
    name: string;
}

interface OrderItemCustomization {
    id: number; // Is number in API
    orderItemId: number; // Is number in API
    optionId: number; // Is number in API
    priceImpactAtOrder: number;
    option: OptionInfo;
}

interface OrderItem {
  id: number; // Is number in API
  orderId: number; // Is number in API
  productId: number; // Is number in API
  quantity: number;
  unitPrice: number;
  notes: string | null;
  product: ProductInfo;
  orderItemCustomizations: OrderItemCustomization[];
}

interface Order {
  id: number; // Is number in API
  userId: number; // Is number in API
  orderTime: string; // ISO date string
  orderType: string;
  status: string;
  totalAmount: number;
  beanEarnAmount: number;
  beanRedeemAmount: number;
  tableId: number | null;
  pickupCode: string | null;
  estimatedCompletionTime: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  table: { tableNumber: number } | null; // Match API structure
}

// Updated Interface for the transformed "Usual" item
interface Usual {
  orderId: number; // Use order ID (number)
  name: string; // Generated name
  productId: number; // Add productId for cart functionality
  productName: string;
  customizations: string[]; // Array of option names
  optionIds: number[]; // Add optionIds for cart functionality
  imageUrl: string | null; // base64 string or null
}

// --- Mock Data (Only for parts *not* fetched from API yet) ---
const mockContextualSuggestions = [
 {
    productId: "cold-brew", // Keep using slugs or IDs as needed for linking
    productName: "Iced Cold Brew",
    description: "Perfectly brewed for a hot day.",
    imageUrl: "/images/coldbrew.png", // Use relative paths for mock/static images
  },
  {
    productId: "strawberry-lemonade",
    productName: "Strawberry Lemonade",
    description: "Refreshing and sweet.",
    imageUrl: "/images/lemonade.png",
  },
]

const mockWeatherData = { condition: "sunny", iconUrl: "/icons/sunny.png" }
// --- Component ---

export default function HomePage() {
  const { user } = useCafe()
  const router = useRouter()

  const [usuals, setUsuals] = useState<Usual[]>([])
  const [isLoadingUsuals, setIsLoadingUsuals] = useState(true)
  const [errorUsuals, setErrorUsuals] = useState<string | null>(null)

  useEffect(() => {
    const fetchLastOrdersAsUsuals = async () => {
      setIsLoadingUsuals(true)
      setErrorUsuals(null)
      try {
        // Fetch orders (backend sorts newest first)
        const response = await axiosInstance.get<Order[]>("/api/orders/user")
        const orders = response.data

        // Get the last 2 orders
        const lastTwoOrders = orders.slice(0, 2)

        // Transform orders into the "Usual" format
        const transformedUsuals = lastTwoOrders
          .map((order): Usual | null => {
            if (!order.orderItems || order.orderItems.length === 0) {
              return null;
            }
            const firstItem = order.orderItems[0];

            // Extract customization names and Option IDs
            const customizationNames = firstItem.orderItemCustomizations.map(
                (cust) => cust.option.name
            );
            const customizationOptionIds = firstItem.orderItemCustomizations.map(
                (cust) => cust.option.id
            );

            return {
              orderId: order.id, // Use order ID (number)
              name: `Recent ${firstItem.product.name}`, // Generate name
              productId: firstItem.product.id, // Store product ID
              productName: firstItem.product.name,
              customizations: customizationNames, // Store names for display
              optionIds: customizationOptionIds, // Store IDs for cart
              imageUrl: firstItem.product.imageUrl, // Store base64 image URL
            }
          })
          .filter((usual): usual is Usual => usual !== null);

        setUsuals(transformedUsuals);
      } catch (err: any) {
        console.error("Failed to fetch orders for usuals:", err)
        setErrorUsuals(err.response?.data?.message || "Could not load your recent orders.")
      } finally {
        setIsLoadingUsuals(false)
      }
    }

     if (user) {
        fetchLastOrdersAsUsuals()
    } else {
        setIsLoadingUsuals(false);
        setUsuals([]);
        setErrorUsuals(null);
    }
  }, [user])

  // Placeholder function for adding item to cart
  const handleAddToCart = (usual: Usual) => {
    console.log("Adding to cart (data available):", {
        productId: usual.productId,
        optionIds: usual.optionIds,
        productName: usual.productName // For context/confirmation
    });
    // --- Implementation Needed ---
    // Use a cart context or state management library:
    // Example: addToCart({ productId: usual.productId, optionIds: usual.optionIds, quantity: 1 });
    // Optionally show a toast notification or navigate to cart:
    // toast({ title: `${usual.productName} added to cart` })
    // router.push('/cart');
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
          {/* ... Header JSX ... (no changes needed here) */}
          <div className="flex justify-between items-center max-w-lg mx-auto">
              <div className="flex items-center">
                  <div className="w-8 h-8 mr-2 relative">
                      <Image
                          src="/placeholder.svg?height=32&width=32" // Your logo
                          alt="Digital Café Logo"
                          fill
                          className="object-contain"
                      />
                  </div>
                  <h1 className="text-xl font-semibold text-amber-900">Digital Café</h1>
              </div>
              {user && (
                  <div className="flex items-center">
                      <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
                          <Coffee className="h-4 w-4 mr-1" />
                          {user.beanBalance ?? 0} Beans
                      </div>
                  </div>
              )}
          </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full pb-20">
        <section className="mb-6">
            {/* ... Welcome section JSX ... (no changes needed here) */}
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-amber-900">Welcome, {user?.name || "Guest"}</h2>
                 <div className="flex items-center text-amber-700">
                     <CloudSun className="h-5 w-5 mr-1" />
                     <span className="text-sm">{mockWeatherData.condition}</span>
                 </div>
             </div>
        </section>


        {/* Your Usuals Section - Updated */}
        {user && (
            <section className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-amber-900">Your Usuals</h3>
                 <Link href="/orders" className="text-sm text-amber-700 hover:underline">
                  All Orders
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Loading State */}
                {isLoadingUsuals && (
                  <div className="col-span-1 md:col-span-2 flex items-center justify-center text-amber-700 py-4">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading recent orders...
                  </div>
                )}
                {/* Error State */}
                {errorUsuals && !isLoadingUsuals && (
                  <div className="col-span-1 md:col-span-2 text-red-600 text-sm bg-red-100 p-3 rounded-md">
                    Error: {errorUsuals}
                  </div>
                )}
                {/* Empty State */}
                {!isLoadingUsuals && !errorUsuals && usuals.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center text-amber-700 text-sm bg-amber-100 p-3 rounded-md">
                    No recent orders to show here yet!
                  </div>
                )}
                {/* Data Loaded State */}
                {!isLoadingUsuals && !errorUsuals && usuals.map((usual) => (
                  // Use usual.orderId as key (it's unique)
                  <Card key={usual.orderId} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center">
                         {/* Use base64 data URI directly if available */}
                        {usual.imageUrl ? (
                             <div className="w-12 h-12 relative rounded-full overflow-hidden mr-3 flex-shrink-0 bg-amber-100">
                             <Image
                                src={usual.imageUrl} // Base64 data URI works here
                                alt={usual.productName}
                                fill
                                className="object-cover"
                                sizes="48px" // Optimize image loading size
                             />
                             </div>
                        ) : (
                            // Fallback icon if no image
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                               <Coffee className="h-6 w-6 text-amber-700" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-amber-900 truncate">{usual.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {usual.productName}
                            {/* Display customizations only if they exist */}
                            {usual.customizations.length > 0 && ` • ${usual.customizations.join(", ")}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                          onClick={() => handleAddToCart(usual)} // Pass the specific usual
                          aria-label={`Add ${usual.name} to cart`}
                         >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
        )}

        {/* Contextual Suggestions Section */}
         <section className="mb-6">
            {/* ... Contextual suggestions JSX ... (no changes needed here) */}
             <div className="flex items-center mb-3">
                 <CloudSun className="h-5 w-5 mr-2 text-amber-700" />
                 <h3 className="text-lg font-medium text-amber-900">Try something new</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {mockContextualSuggestions.map((item) => (
                     <Link href={`/product/${item.productId}`} key={item.productId}>
                         <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                             <div className="relative h-32 w-full">
                                 <Image
                                     src={item.imageUrl || "/placeholder.svg?height=128&width=256"} // Use static path or placeholder
                                     alt={item.productName}
                                     fill
                                     className="object-cover"
                                     sizes="(max-width: 768px) 50vw, 100vw"
                                 />
                             </div>
                             <CardContent className="p-3 flex-1">
                                 <h4 className="font-medium text-amber-900">{item.productName}</h4>
                                 <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                             </CardContent>
                         </Card>
                     </Link>
                 ))}
             </div>
         </section>


        {/* Feeling Unsure Quiz Section */}
         <section className="mb-6">
            {/* ... Quiz JSX ... (no changes needed here) */}
              <Card className="bg-gradient-to-r from-amber-100 to-amber-200 border-none">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-amber-900 mb-1 truncate">Feeling Unsure?</h3>
                          <p className="text-sm text-amber-700 truncate">Take our quick quiz</p>
                      </div>
                      <Button
                          className="bg-white text-amber-900 hover:bg-amber-50 flex-shrink-0"
                          onClick={() => router.push("/aichat")}>
                          <Sparkles className="h-4 w-4 md:mr-2 text-amber-500" />
                          <span className="hidden md:inline">Start Quiz</span>
                          <span className="md:hidden">Quiz</span>
                      </Button>
                  </CardContent>
              </Card>
          </section>


        {/* Quick Access Buttons Section */}
        <section className="grid grid-cols-2 gap-3 mb-6">
            {/* ... Buttons JSX ... (no changes needed here) */}
             <Button
                 variant="outline"
                 className="w-full border-amber-200 text-amber-800 hover:bg-amber-100 h-16 flex flex-col justify-center items-center"
                 onClick={() => router.push('/menu')}
             >
                 <Coffee className="h-5 w-5 mb-1" />
                 <span>Browse Menu</span>
             </Button>
             <Button
                 variant="outline"
                 className="w-full border-amber-200 text-amber-800 hover:bg-amber-100 h-16 flex flex-col justify-center items-center"
                 onClick={() => router.push('/orders')}
             >
                 <Receipt className="h-5 w-5 mb-1" />
                 <span>My Orders</span>
             </Button>
         </section>

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeItem="home" />
    </div>
  )
}