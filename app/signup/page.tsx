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

export default function Signup() {
  const router = useRouter()
  const { setUser } = useCafe()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate signup API call
    setTimeout(() => {
      // Set mock user data
      setUser({
        id: "user123",
        name: name,
        email: email,
        loyaltyPoints: 0,
        favorites: [],
        giftCards: [],
      })

      // Store login state
      localStorage.setItem("isLoggedIn", "true")

      setIsLoading(false)
      router.push("/onboarding")
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
            <CardTitle className="text-2xl text-center text-amber-900">Create Account</CardTitle>
            <CardDescription className="text-center">Join Digital Café and start ordering</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 text-white" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-800 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
