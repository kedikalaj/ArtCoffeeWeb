"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Coffee, ArrowLeft } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useCafe } from "@/context/cafe-context"

interface MainLayoutProps {
  children: ReactNode
  title?: string
  showBackButton?: boolean
  activeNavItem?: "home" | "menu" | "scan" | "gift" | "profile"
}

export function MainLayout({ children, title, showBackButton = true, activeNavItem }: MainLayoutProps) {
  const router = useRouter()
  const { user } = useCafe()

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <div className="flex items-center">
              {showBackButton && (
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl font-semibold text-amber-900">{title}</h1>
            </div>
            {user && (
              <div className="flex items-center">
                <div className="bg-amber-100 rounded-full px-3 py-1 text-sm font-medium text-amber-800 flex items-center">
                  <Coffee className="h-4 w-4 mr-1" />
                  {user.loyaltyPoints} Beans
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">{children}</main>

      {/* Bottom Navigation */}
      {activeNavItem && <BottomNavigation activeItem={activeNavItem} />}
    </div>
  )
}
