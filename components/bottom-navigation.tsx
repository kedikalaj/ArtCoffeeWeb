"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Coffee, Shell, Gift, User } from "lucide-react"

interface BottomNavigationProps {
  activeItem: "home" | "menu" | "scan" | "gift" | "profile"
}

export function BottomNavigation({ activeItem }: BottomNavigationProps) {
  const router = useRouter()

  const navItems = [
    { key: "home", icon: Home, label: "Home", path: "/home" },
    { key: "scan", icon: Shell, label: "Order", path: "/scan-table" },
    { key: "gift", icon: Gift, label: "Gift", path: "/gift-card" },
    { key: "profile", icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <div className="sticky bottom-0 border-t bg-white">
      <div className="container max-w-lg mx-auto p-2">
        <div className="flex justify-between">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.key

            return (
              <Button
                key={item.key}
                variant="ghost"
                className={`flex flex-col items-center h-auto py-2 ${
                  isActive ? "text-amber-800" : "text-muted-foreground"
                }`}
                onClick={() => router.push(item.path)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
