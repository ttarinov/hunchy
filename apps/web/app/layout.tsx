import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { ConditionalAnalytics } from "@/components/conditional-analytics"
import AuthContextProvider from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
export const metadata: Metadata = {
  title: "Hunchy - Smart Commit Intelligence",
  description: "Automatically generate semantic commits with AI-powered explanations and task tracking",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthContextProvider>
            <SmoothScrollProvider>
              {children}
            </SmoothScrollProvider>
          </AuthContextProvider>
          <Toaster />
          <ConditionalAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
