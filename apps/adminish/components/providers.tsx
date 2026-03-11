"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthContextProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      <AuthContextProvider>{children}</AuthContextProvider>
    </NextThemesProvider>
  )
}
