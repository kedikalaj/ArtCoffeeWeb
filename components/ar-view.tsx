"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ARViewProps {
  product: {
    id: string
    name: string
    image?: string
  }
  onClose: () => void
}

export function ARView({ product, onClose }: ARViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight * 0.7

    // Simulate AR loading
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Draw product in AR view
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = product.image || "/placeholder.svg?height=300&width=300"

      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw background
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw product image
        const imgWidth = img.width * 0.8
        const imgHeight = img.height * 0.8
        const x = (canvas.width - imgWidth) / 2
        const y = (canvas.height - imgHeight) / 2

        // Add shadow effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 10
        ctx.shadowOffsetY = 10

        // Draw the image
        ctx.drawImage(img, x, y, imgWidth, imgHeight)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Add product name
        ctx.font = "bold 18px sans-serif"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(product.name, canvas.width / 2, y + imgHeight + 30)

        // Add AR instructions
        ctx.font = "14px sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillText("Move your device to place the product", canvas.width / 2, 30)
      }

      // Simulate AR movement
      let offsetX = 0
      let offsetY = 0
      let direction = 1

      const animate = () => {
        if (!canvas) return

        // Subtle movement to simulate AR
        offsetX += 0.2 * direction
        offsetY += 0.1 * direction

        if (Math.abs(offsetX) > 10) {
          direction *= -1
        }

        // Redraw with offset
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const imgWidth = img.width * 0.8
        const imgHeight = img.height * 0.8
        const x = (canvas.width - imgWidth) / 2 + offsetX
        const y = (canvas.height - imgHeight) / 2 + offsetY

        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 10
        ctx.shadowOffsetY = 10

        ctx.drawImage(img, x, y, imgWidth, imgHeight)

        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.font = "bold 18px sans-serif"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(product.name, canvas.width / 2, y + imgHeight + 30)

        ctx.font = "14px sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillText("Move your device to place the product", canvas.width / 2, 30)

        requestAnimationFrame(animate)
      }

      const animation = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animation)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [product])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-white font-medium">AR View</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
            <div className="w-12 h-12 rounded-full border-4 border-amber-800 border-t-transparent animate-spin mb-4" />
            <p className="text-white">Initializing AR view...</p>
          </div>
        )}
      </div>

      <div className="p-4">
        <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white" onClick={onClose}>
          Close AR View
        </Button>
      </div>
    </div>
  )
}
