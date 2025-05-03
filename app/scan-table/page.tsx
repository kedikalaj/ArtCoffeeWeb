"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, QrCode, Utensils } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { QRScanner } from "@/components/qr-scanner"

export default function ScanTable() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [tableNumber, setTableNumber] = useState<number | null>(null)

  const handleScan = (data: string) => {
    // Simulate QR code scan
    setIsScanning(false)

    // Extract table number from QR code data
    // In a real app, this would parse the actual QR code data
    const mockTableNumber = Math.floor(Math.random() * 20) + 1
    setTableNumber(mockTableNumber)
  }

  const handleManualEntry = (num: number) => {
    setTableNumber(num)
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/menu")} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-amber-900">Scan Table</h1>
      </div>

      {!isScanning && tableNumber === null && (
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="border-amber-800 text-amber-800 hover:bg-amber-100"
                  onClick={() => handleManualEntry(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isScanning && <QRScanner onScan={handleScan} onCancel={() => setIsScanning(false)} />}

      {tableNumber !== null && (
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
            onClick={() => setTableNumber(null)}
          >
            Change Table
          </Button>
        </div>
      )}
    </MainLayout>
  )
}
