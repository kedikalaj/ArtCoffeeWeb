"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns" // For formatting dates
import {
    AlertCircle,
    ArrowLeft,
    Coffee,
    Loader2,
    Package, // Icon for order
    ReceiptText, // Icon for details
    RefreshCw, // Icon for refreshing
} from "lucide-react"

// Shadcn UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton" // For loading state

import axiosInstance from "@/lib/axios"

// Your components
import { MainLayout } from "@/components/main-layout" // Assuming a main layout component
import { BottomNavigation } from "@/components/bottom-navigation"
import { useCafe } from "@/context/cafe-context" // To potentially show user info like beans

// Define the expected structure of an Order based on your backend response
// (Adjust based on the 'include' in your getUserOrders controller)
interface OrderItemCustomizationOption {
    id: number;
    name: string;
}
interface OrderItemCustomization {
    id: number;
    option: OrderItemCustomizationOption;
}
interface OrderItemProduct {
    id: number;
    name: string;
    imageUrl: string | null;
}
interface OrderItem {
    id: number;
    quantity: number;
    unitPrice: number;
    notes: string | null;
    product: OrderItemProduct;
    orderItemCustomizations: OrderItemCustomization[];
}
interface OrderTable {
    tableNumber: string;
}
interface Order {
    id: number;
    orderTime: string; // ISO date string
    orderType: "pickup" | "dine_in";
    status: "received" | "preparing" | "ready" | "completed" | "served" | "cancelled";
    totalAmount: number;
    pickupCode: string | null;
    orderItems: OrderItem[];
    table: OrderTable | null;
    // Add other fields returned by your API if needed (beanEarnAmount, etc.)
}

export default function OrderHistoryPage() {
    const router = useRouter()
    const { user } = useCafe() // Get user context if needed
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Function to fetch orders
    const fetchOrders = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Use your configured axios instance for authenticated requests
            const response = await axiosInstance.get<Order[]>('/api/orders') // Type the expected response data
            setOrders(response.data)
        } catch (err: any) {
            console.error("Failed to fetch orders:", err)
            setError(err.response?.data?.message || "Could not load your orders. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders()
    }, []) // Empty dependency array means run once on mount

    // Helper function to get badge variant based on status
    const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'received': return 'default' // Blue/Default
            case 'preparing': return 'outline' // Yellowish/Outline
            case 'ready': return 'secondary' // Green/Secondary
            case 'served': return 'secondary' // Green/Secondary
            case 'completed': return 'secondary' // Green/Secondary
            case 'cancelled': return 'destructive' // Red/Destructive
            default: return 'default'
        }
    }

    // Helper function to format status text
    const formatStatus = (status: Order['status']): string => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }

    // Render loading skeletons
    const renderSkeletons = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )

    return (
        <MainLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold text-amber-900">My Orders</h1>
                {/* Optional: Refresh button */}
                <Button variant="ghost" size="icon" onClick={fetchOrders} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && renderSkeletons()}

            {/* Error State */}
            {error && !isLoading && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Orders List */}
            {!isLoading && !error && (
                <div className="space-y-4 pb-20"> {/* Add padding-bottom */}
                    {orders.length === 0 ? (
                        <Card className="text-center">
                            <CardContent className="p-6">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                                <Button className="mt-4 bg-amber-800 hover:bg-amber-900 text-white" onClick={() => router.push('/menu')}>
                                    Start Ordering
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <CardTitle className="text-lg mb-1">
                                                Order #{order.id} {order.orderType === 'dine_in' && order.table ? `(Table ${order.table.tableNumber})` : order.orderType === 'pickup' && order.pickupCode ? `(Pickup: ${order.pickupCode})` : '(Pickup)'}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(order.orderTime), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize flex-shrink-0">
                                            {formatStatus(order.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    {/* Simple Item Summary */}
                                    <p className="text-sm text-muted-foreground mb-2 truncate">
                                        {order.orderItems.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                                    </p>
                                    <p className="text-md font-semibold">
                                        Total: ${order.totalAmount.toFixed(2)}
                                    </p>
                                </CardContent>
                                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 py-3 px-6 flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/status/${order.id}`)} // Link to specific order details page
                                        className="border-amber-700 text-amber-800 hover:bg-amber-100"
                                    >
                                        <ReceiptText className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full">
                {/* Make sure 'orders' is a valid item key in your BottomNavigation */}
                <BottomNavigation activeItem="scan" />
            </div>
        </MainLayout>
    )
}