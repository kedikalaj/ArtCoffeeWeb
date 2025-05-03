import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CafeProvider } from "@/context/cafe-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Digital Café Companion",
  description: "Your personal café companion app",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CafeProvider>{children}</CafeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
