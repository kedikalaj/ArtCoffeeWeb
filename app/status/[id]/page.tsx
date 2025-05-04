"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation" // Import useParams
import { format } from "date-fns"
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Coffee, // Preparing icon
    Loader2,
    Package, // Ready icon (or use Utensils?)
    ReceiptText, // Placed icon
    RefreshCw,
    ShoppingBag, // Generic order icon
    XCircle, // Cancelled icon
} from "lucide-react"

import axiosInstance from "@/lib/axios"

// Shadcn UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton" // For loading state
import { Badge } from "@/components/ui/badge" // To show status clearly

// Your components
import { MainLayout } from "@/components/main-layout" // Assuming a main layout component
import { BottomNavigation } from "@/components/bottom-navigation" // Assuming BottomNav is needed here too
import { OrderStatusAnimation } from "@/components/order-status-animation" // Keep animation if desired

// Define the detailed structure based on getOrderDetails include
interface OrderDetailCustomizationOption {
    id: number;
    name: string;
    priceImpact: number;
    // Include parent customization if needed for display logic
    // customization: { id: number; name: string; type: string; }
}
interface OrderDetailItemCustomization {
    id: number;
    priceImpactAtOrder: number;
    option: OrderDetailCustomizationOption;
}
interface OrderDetailItemProduct {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    basePrice: number;
}
interface OrderDetailItem {
    id: number;
    quantity: number;
    unitPrice: number; // Price including customizations at order time
    notes: string | null;
    product: OrderDetailItemProduct;
    orderItemCustomizations: OrderDetailItemCustomization[];
}
interface OrderDetailTable {
    id: number;
    tableNumber: string;
}
interface OrderDetailUser {
    id: number;
    name: string | null;
    email: string;
}
// Main Order Detail Type
interface OrderDetail {
    id: number;
    orderTime: string; // ISO date string
    orderType: "pickup" | "dine_in";
    status: "received" | "preparing" | "ready" | "completed" | "served" | "cancelled";
    totalAmount: number;
    pickupCode: string | null;
    estimatedCompletionTime: string | null; // ISO date string or null
    beanEarnAmount: number;
    beanRedeemAmount: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    userId: number;
    tableId: number | null;
    user: OrderDetailUser;
    orderItems: OrderDetailItem[];
    table: OrderDetailTable | null;
    // Add promotions etc. if included in your API response
}

// Define polling interval (in milliseconds)
const POLLING_INTERVAL = 2000;

// Component signature updated to accept params
export default function OrderStatusPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const orderId = params.id; // Get order ID from route params

    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPolling, setIsPolling] = useState(true); // Control polling

    // Ref to store interval ID for cleanup
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to fetch order details
    const fetchOrderDetails = useCallback(async () => {
        // Don't set loading to true on polling updates, only initial load
        // setIsLoading(true);
        // setError(null); // Keep previous error until successful fetch? Or clear always? Clearing is usually better.
        setError(null);

        if (!orderId || isNaN(parseInt(orderId))) {
            setError("Invalid Order ID.");
            setIsLoading(false);
            setIsPolling(false); // Stop polling if ID is invalid
            return;
        }

        try {
            const response = await axiosInstance.get<OrderDetail>(`/api/orders/${orderId}`)
            setOrder(response.data)

            // Stop polling if order is in a final state
            const finalStatuses: OrderDetail['status'][] = ['completed', 'served', 'cancelled'];
            if (finalStatuses.includes(response.data.status)) {
                setIsPolling(false);
                console.log(`Order ${orderId} reached final state (${response.data.status}). Stopping polling.`);
            }

        } catch (err: any) {
            console.error(`Failed to fetch order ${orderId}:`, err)
            setError(err.response?.data?.message || "Could not load order details. Please try again.")
            // Consider stopping polling on certain errors (e.g., 404 Not Found)
            if (err.response?.status === 404) {
                 setIsPolling(false);
            }
        } finally {
            // Only set loading to false after the *initial* fetch
            if (isLoading) {
                setIsLoading(false)
            }
        }
    }, [orderId]); // Include isLoading in dependencies to ensure it runs correctly after initial load toggle

    // Initial fetch and set up polling
    useEffect(() => {
        setIsLoading(true); // Set loading true for initial fetch
        fetchOrderDetails(); // Initial fetch

        // Cleanup function for component unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                console.log(`Cleared polling interval for order ${orderId}`);
            }
        };
    }, [fetchOrderDetails, orderId]); // Run when fetchOrderDetails function or orderId changes

    // Effect to manage the polling interval based on isPolling state
     useEffect(() => {
        if (isPolling && !isLoading) { // Start polling only if allowed and not in initial load
            pollingIntervalRef.current = setInterval(() => {
                console.log(`Polling for order ${orderId} status...`);
                fetchOrderDetails();
            }, POLLING_INTERVAL);
            console.log(`Started polling for order ${orderId}`);
        } else {
            // Clear interval if polling is stopped or component is still loading
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                 console.log(`Stopped polling for order ${orderId}`);
            }
        }

        // Cleanup interval on change of isPolling or isLoading, or unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
                 console.log(`Cleaned up polling interval for order ${orderId}`);
            }
        };
    }, [isPolling, isLoading, fetchOrderDetails, orderId]);


    // --- Helper Functions ---

    const getStatusProgress = (status: OrderDetail['status'] | undefined): number => {
        if (!status) return 0;
        switch (status) {
            case 'received': return 10; // Small progress for received
            case 'preparing': return 50;
            case 'ready': return 90; // Nearly complete when ready
            case 'completed':
            case 'served':
            case 'cancelled': return 100; // Complete
            default: return 0;
        }
    }

    const getStatusText = (status: OrderDetail['status'] | undefined): string => {
         if (!status) return "Loading Status...";
         switch (status) {
            case 'received': return "Order Received";
            case 'preparing': return "Preparing Your Order";
            case 'ready': return order?.orderType === 'dine_in' ? "Ready to Serve" : "Ready for Pickup";
            case 'served': return "Order Served";
            case 'completed': return "Order Completed";
            case 'cancelled': return "Order Cancelled";
            default: return "Unknown Status";
        }
    }

     // Helper function to get badge variant based on status
    const getStatusBadgeVariant = (status: OrderDetail['status'] | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return 'default';
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

    // --- Render Logic ---

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-between mb-6">
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"> <ArrowLeft className="h-5 w-5" /> </Button>
                     <h1 className="text-xl font-bold text-amber-900">Order Status</h1>
                     <Skeleton className="h-9 w-9 rounded-full" /> {/* Placeholder for refresh */}
                </div>
                <Skeleton className="h-4 w-1/2 mb-4" /> {/* Placeholder for status text */}
                <Skeleton className="h-2 w-full mb-6" /> {/* Placeholder for progress */}
                <Skeleton className="h-40 w-full mb-6" /> {/* Placeholder for animation/icons */}
                <Card>
                    <CardHeader> <Skeleton className="h-5 w-1/3" /> </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 {/* Add skeleton for BottomNav if it's part of MainLayout */}
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                 <div className="flex items-center justify-between mb-6">
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"> <ArrowLeft className="h-5 w-5" /> </Button>
                     <h1 className="text-xl font-bold text-amber-900">Order Status</h1>
                     <Button variant="ghost" size="icon" onClick={fetchOrderDetails}> <RefreshCw className="h-5 w-5" /> </Button>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                 <div className="mt-6">
                     <Button onClick={() => router.push('/orders')} variant="outline">View Order History</Button>
                 </div>
                 {/* Add BottomNav */}
                <div className="fixed bottom-0 left-0 w-full">
                     <BottomNavigation activeItem="scan" /> {/* Or appropriate item */}
                </div>
            </MainLayout>
        )
    }

    if (!order) {
         // This case might occur briefly or if fetch fails without setting error properly
        return (
             <MainLayout>
                 <div className="flex items-center justify-between mb-6">
                     <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"> <ArrowLeft className="h-5 w-5" /> </Button>
                     <h1 className="text-xl font-bold text-amber-900">Order Status</h1>
                     <Button variant="ghost" size="icon" onClick={fetchOrderDetails}> <RefreshCw className="h-5 w-5" /> </Button>
                </div>
                <p>Order details not found.</p>
                 {/* Add BottomNav */}
                <div className="fixed bottom-0 left-0 w-full">
                     <BottomNavigation activeItem="scan" /> {/* Or appropriate item */}
                </div>
            </MainLayout>
        )
    }

    // --- Main Render when order data is available ---
    const currentStatus = order.status;
    const progressValue = getStatusProgress(currentStatus);

    return (
        <MainLayout>
            {/* Header */}
             <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isLoading}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold text-amber-900">Order #{order.id} Status</h1>
                <Button variant="ghost" size="icon" onClick={fetchOrderDetails} disabled={isLoading || !isPolling} title={isPolling ? "Refresh Now" : "Updates Paused"}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className={`h-5 w-5 ${isPolling ? '' : 'text-muted-foreground'}`} />}
                </Button>
            </div>

            {/* Optional: Paid Forward message - Needs data from API */}
            {/* {order.wasPaidForward && ( ... Card ... )} */}

            {/* Animation */}
            <div className="mb-8">
                {/* Pass the current status from the fetched order */}
                <OrderStatusAnimation status={currentStatus} />
            </div>

            {/* Status Progress Card */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-medium">{getStatusText(currentStatus)}</h2>
                         <Badge variant={getStatusBadgeVariant(currentStatus)} className="capitalize">
                            {currentStatus.replace('_', ' ')}
                        </Badge>
                    </div>
                    <Progress value={progressValue} className="h-2 mb-4" />

                    {/* Visual Status Steps */}
                    <div className="grid grid-cols-3 text-center">
                        {/* Placed */}
                        <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${progressValue >= 10 ? "bg-amber-800 text-white" : "bg-muted text-muted-foreground"}`}>
                                <ReceiptText className="h-4 w-4" />
                            </div>
                            <span className={`text-xs mt-1 ${progressValue >= 10 ? 'font-medium' : 'text-muted-foreground'}`}>Placed</span>
                        </div>
                        {/* Preparing */}
                         <div className="flex flex-col items-center">
                             <div className={`rounded-full p-2 ${progressValue >= 100 && currentStatus !== 'cancelled' ? "bg-amber-100 text-amber-800" : progressValue >= 50 ? "bg-amber-800 text-white" : "bg-muted text-muted-foreground"}`}>
                                {progressValue >= 100 && currentStatus !== 'cancelled' ? <Check className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                            </div>
                            <span className={`text-xs mt-1 ${progressValue >= 50 ? 'font-medium' : 'text-muted-foreground'}`}>Preparing</span>
                        </div>
                        {/* Ready/Served/Completed/Cancelled */}
                        <div className="flex flex-col items-center">
                             <div className={`rounded-full p-2 ${currentStatus === 'cancelled' ? "bg-red-600 text-white" : progressValue >= 90 ? "bg-amber-800 text-white" : "bg-muted text-muted-foreground"}`}>
                                {currentStatus === 'cancelled' ? <XCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                             </div>
                             <span className={`text-xs mt-1 ${progressValue >= 90 ? 'font-medium' : 'text-muted-foreground'}`}>
                                 {currentStatus === 'cancelled' ? 'Cancelled' : currentStatus === 'served' ? 'Served' : currentStatus === 'completed' ? 'Completed' : 'Ready'}
                             </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                     <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.orderTime), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start gap-3">
                                <div className="flex items-start">
                                    <span className="mr-3 font-medium">{item.quantity}x</span>
                                    <div>
                                        <p className="font-medium leading-tight">{item.product.name}</p>
                                        {/* Display customizations */}
                                        {item.orderItemCustomizations.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {item.orderItemCustomizations.map(cust => cust.option.name).join(', ')}
                                            </p>
                                        )}
                                         {/* Display notes if they exist */}
                                        {item.notes && (
                                            <p className="text-xs text-amber-700 italic mt-1">Note: {item.notes}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Display unit price * quantity */}
                                <p className="font-medium flex-shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                     <hr className="my-4"/>
                     {/* Totals */}
                     <div className="space-y-1 text-sm">
                         {order.beanRedeemAmount > 0 && (
                              <div className="flex justify-between">
                                 <span className="text-muted-foreground">Beans Redeemed</span>
                                 <span>-{order.beanRedeemAmount} <Coffee className="inline h-3 w-3 ml-1"/></span>
                             </div>
                         )}
                         <div className="flex justify-between font-semibold text-md">
                             <span>Total Paid</span>
                             <span>${order.totalAmount.toFixed(2)}</span>
                         </div>
                          {order.beanEarnAmount > 0 && (
                              <div className="flex justify-between text-green-600">
                                 <span >Beans Earned</span>
                                 <span>+{order.beanEarnAmount} <Coffee className="inline h-3 w-3 ml-1"/></span>
                             </div>
                         )}
                     </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3 pb-20"> {/* Add padding-bottom */}
                <Button
                    variant="outline"
                    className="flex-1 border-amber-800 text-amber-800 hover:bg-amber-100"
                    onClick={() => router.push("/menu")}
                >
                    Order Again
                </Button>
                <Button
                    className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                    onClick={() => router.push("/orders")} // Link back to order history
                >
                    View All Orders
                </Button>
            </div>

             {/* Bottom Navigation */}
             <div className="fixed bottom-0 left-0 w-full">
                 {/* Decide which item should be active here, maybe 'orders' or 'profile' */}
                 <BottomNavigation activeItem="scan" />
             </div>
        </MainLayout>
    )
}