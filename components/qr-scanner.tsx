"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onCancel: () => void
}

export function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    // Simulate QR code scanning
    const timer = setTimeout(() => {
      setIsScanning(false)
      onScan("table-12")
    }, 3000)

    return () => clearTimeout(timer)
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-white font-medium">Scan QR Code</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
            <div className="absolute top-0 left-0 w-16 h-2 bg-amber-500 rounded-tl-lg" />
            <div className="absolute top-0 left-0 w-2 h-16 bg-amber-500 rounded-tl-lg" />

            <div className="absolute top-0 right-0 w-16 h-2 bg-amber-500 rounded-tr-lg" />
            <div className="absolute top-0 right-0 w-2 h-16 bg-amber-500 rounded-tr-lg" />

            <div className="absolute bottom-0 left-0 w-16 h-2 bg-amber-500 rounded-bl-lg" />
            <div className="absolute bottom-0 left-0 w-2 h-16 bg-amber-500 rounded-bl-lg" />

            <div className="absolute bottom-0 right-0 w-16 h-2 bg-amber-500 rounded-br-lg" />
            <div className="absolute bottom-0 right-0 w-2 h-16 bg-amber-500 rounded-br-lg" />

            {isScanning && (
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 bg-amber-500 animate-scan" />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center text-white">
          {isScanning ? "Scanning..." : "QR Code detected!"}
        </div>
      </div>

      <div className="p-4">
        <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
