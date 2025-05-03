"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Coffee, Gift, QrCode, Heart } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn === "true") {
      router.push("/home")
    }
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center text-center">
        <div className="relative w-40 h-40 mb-8">
          <Image
            src="/placeholder.svg?height=160&width=160"
            alt="Café Logo"
            width={160}
            height={160}
            className="rounded-full shadow-lg"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold mb-2 text-amber-900">Digital Café</h1>
        <p className="text-xl mb-12 text-amber-700">Your personal café companion</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-12">
          <Button
            size="lg"
            className="bg-amber-800 hover:bg-amber-900 text-white"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-amber-800 text-amber-800 hover:bg-amber-100"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-2">
              <Coffee className="h-6 w-6 text-amber-800" />
            </div>
            <p className="text-sm text-amber-800">Custom Orders</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-2">
              <Gift className="h-6 w-6 text-amber-800" />
            </div>
            <p className="text-sm text-amber-800">Gift Cards</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-2">
              <QrCode className="h-6 w-6 text-amber-800" />
            </div>
            <p className="text-sm text-amber-800">Table Scan</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-2">
              <Heart className="h-6 w-6 text-amber-800" />
            </div>
            <p className="text-sm text-amber-800">Pay It Forward</p>
          </div>
        </div>
      </div>
    </main>
  )
}
