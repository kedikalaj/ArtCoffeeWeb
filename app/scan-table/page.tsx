"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, QrCode, Utensils } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { QRScanner } from "@/components/qr-scanner"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useCafe } from "@/context/cafe-context" // Adjust path if needed

export default function ScanTable() {
  const router = useRouter()
  const { orderType, tableNumber, setOrderType, setTableNumber } = useCafe() // Use context
  const [isScanning, setIsScanning] = useState(false)
  // Removed local tableNumber state: const [tableNumber, setTableNumber] = useState<number | null>(null)

  const handleScan = (data: string) => {
    setIsScanning(false)
    // TODO: Parse actual table number from QR data if needed
    const mockTableNumber = Math.floor(Math.random() * 20) + 1
    setOrderType("dine-in") // Set context
    setTableNumber(mockTableNumber) // Set context
  }

  const handleManualEntry = (num: number) => {
    setOrderType("dine-in") // Set context
    setTableNumber(num) // Set context
  }

  const handleSelectTakeout = () => {
    setOrderType("takeout") // Set context
    setTableNumber(null) // Ensure table number is null for takeout
    router.push("/menu")
  }

  const handleChangeTable = () => {
    setOrderType(null) // Reset context
    setTableNumber(null) // Reset context
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/menu")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Place Order</h1>
      </div>

      {/* Initial State: Show Scan/Manual/Takeout Options */}
      {!isScanning && orderType === null && (
        <>
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-full mb-4">
                <QrCode className="h-8 w-8 text-amber-800" />
              </div>
              <h2 className="text-lg font-medium mb-1">Scan Table QR Code</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Scan the QR code on your table to place an order directly to your table
              </p>
              <Button
                className="w-full bg-amber-800 hover:bg-amber-900 text-white mb-4"
                onClick={() => setIsScanning(true)}
              >
                Scan QR Code
              </Button>
              <p className="text-sm text-muted-foreground mb-2">Or enter table number manually</p>
              <div className="grid grid-cols-4 gap-2 w-full">
                {[...Array(12)].map((_, idx) => (
                  <Button
                    key={idx + 1}
                    variant="outline"
                    className="border-amber-800 text-amber-800 hover:bg-amber-100"
                    onClick={() => handleManualEntry(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Takeout Option */}
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-full mb-4">
                <Utensils className="h-8 w-8 text-amber-800" />
              </div>
              <h2 className="text-lg font-medium mb-1">Or Takeout</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Order now and pick it up when it’s ready!
              </p>
              <Button
                className="w-full bg-amber-800 hover:bg-amber-900 text-white"
                onClick={handleSelectTakeout} // Use specific handler
              >
                Continue to Menu
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Scanning State */}
      {isScanning && <QRScanner onScan={handleScan} onCancel={() => setIsScanning(false)} />}

      {/* Table Selected State */}
      {orderType === "dine-in" && tableNumber !== null && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-full mb-4">
                <Utensils className="h-8 w-8 text-amber-800" />
              </div>
              <h2 className="text-lg font-medium mb-1">Table {tableNumber}</h2>
              <p className="text-sm text-muted-foreground mb-6">Your order will be delivered to Table {tableNumber}</p>
              <Button
                className="w-full bg-amber-800 hover:bg-amber-900 text-white"
                onClick={() => router.push("/menu")}
              >
                Browse Menu & Order
              </Button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full border-amber-800 text-amber-800 hover:bg-amber-100"
            onClick={handleChangeTable} // Use specific handler
          >
            Change Table / Select Takeout
          </Button>
        </div>
      )}

      {/* (Optional) You could add a specific state/UI if orderType === 'takeout' was selected */}
      {/* For now, selecting takeout navigates directly to the menu */}


      <div className="fixed bottom-0 left-0 w-full">
        <BottomNavigation activeItem="scan" />
      </div>
    </MainLayout>
  )
}