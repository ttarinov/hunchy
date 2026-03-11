"use client"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { Loader } from "@/components/loader"
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, systemUser } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)
  useEffect(() => {
    if (!loading) {
      if (isInitializing) {
        setIsInitializing(false)
      }
    }
  }, [loading, isInitializing])
  if (loading || isInitializing) {
    return <Loader />
  }
  if (!user || !systemUser) {
    return null
  }
  return <>{children}</>
}
