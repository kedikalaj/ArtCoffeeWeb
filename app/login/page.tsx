"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCafe } from "@/context/cafe-context"

export default function Login() {
  const router = useRouter()
  const { setUser } = useCafe()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login API call
    setTimeout(() => {
      // Set mock user data
      setUser({
        id: "user123",
        name: "Alex Johnson",
        email: email,
        loyaltyPoints: 230,
        favorites: ["Cappuccino", "Croissant"],
        giftCards: [{ id: "gc1", amount: 25, from: "Sarah", message: "Happy Birthday!" }],
      })

      // Store login state
      localStorage.setItem("isLoggedIn", "true")

      setIsLoading(false)
      router.push("/home")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-amber-50 to-amber-100">
      <Link href="/" className="flex items-center text-amber-800 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </Link>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-amber-900">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your Digital Café account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-amber-800 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-amber-800 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
