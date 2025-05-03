"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    image?: string
    category: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <Image
        src={product.image || "/placeholder.svg?height=120&width=200"}
        alt={product.name}
        width={200}
        height={120}
        className="w-full h-32 object-cover"
      />
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{product.description}</p>
        <p className="font-bold text-sm">${product.price.toFixed(2)}</p>
      </CardContent>
    </Card>
  )
}
