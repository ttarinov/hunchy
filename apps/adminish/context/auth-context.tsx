"use client"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Auth } from "firebase/auth"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"
import { useRouter, usePathname } from "next/navigation"
import { auth, functions, database } from "@workspace/firebase-config/firebase"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { SystemUserData } from "@workspace/functions/models"
import { ref, update } from "firebase/database"
type ContextValue = {
  auth: Auth
  loading: boolean
  signOut: () => Promise<void>
  user: User | undefined
  error: Error | undefined
  isAdmin: boolean
  systemUser?: SystemUserData
}
type User = {
  uid: string
  email?: string | null
}
export const AuthContext = createContext<ContextValue | { [key: string]: never }>(
  {}
)
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [firebaseUser, firebaseLoading, firebaseError] = useAuthState(auth)
  const [signOut] = useSignOut(auth)
  const [systemUser, setSystemUser] = useState<SystemUserData | undefined>()
  const [getSystemUser, getSystemUserLoading, getSystemUserError] =
    useHttpsCallable<void, SystemUserData | null>(functions, "apiV1GetSystemUser")
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    const updateActiveStatus = async () => {
      if (firebaseUser) {
        try {
          const currentTime = Date.now()
          const userRef = ref(database, `systemUsers/${firebaseUser.uid}`)
          await update(userRef, {
            lastActiveTime: currentTime,
          })
        } catch (error) {
          console.error("Failed to update active status:", error)
        }
      }
    }
    if (firebaseUser && !firebaseLoading) {
      updateActiveStatus()
      intervalId = setInterval(updateActiveStatus, 60000)
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [firebaseUser, firebaseLoading])
  useEffect(() => {
    const checkSystemUser = async () => {
      const isAuthPage = pathname?.startsWith("/auth")
      if (!firebaseUser) {
        setSystemUser(undefined)
        if (!isAuthPage) {
          router.replace("/auth/")
        }
        return
      }
      try {
        const result = await getSystemUser()
        setSystemUser(result?.data || undefined)
        if (result?.data) {
          try {
            const currentTime = Date.now()
            const userRef = ref(database, `systemUsers/${firebaseUser.uid}`)
            await update(userRef, {
              lastActiveTime: currentTime,
            })
          } catch (error) {
            console.error("Failed to update active status:", error)
          }
        }
        if (isAuthPage && result?.data) {
          router.replace("/dashboard/")
        } else if (!isAuthPage && !result?.data) {
          router.replace("/auth/")
        }
      } catch (error) {
        console.error("System user verification failed:", error)
        setSystemUser(undefined)
        if (!isAuthPage) {
          router.replace("/auth/")
        }
      }
    }
    if (!firebaseLoading) {
      checkSystemUser()
    }
  }, [firebaseUser, firebaseLoading, pathname, router, getSystemUser])
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (firebaseUser) {
        try {
          const userRef = ref(database, `systemUsers/${firebaseUser.uid}`)
          await update(userRef, {
            lastActiveTime: Date.now(),
          })
        } catch (error) {
          console.error("Failed to update active status on page unload:", error)
        }
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [firebaseUser])
  const value = useMemo(() => {
    const user = firebaseUser
      ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        }
      : undefined
    const loading = firebaseLoading || getSystemUserLoading
    const error = firebaseError || getSystemUserError
    return {
      auth,
      loading,
      signOut: async () => {
        await signOut()
        setSystemUser(undefined)
        router.replace("/auth/")
      },
      user,
      error,
      isAdmin: !!systemUser,
      systemUser,
    }
  }, [
    firebaseUser,
    firebaseLoading,
    firebaseError,
    getSystemUserLoading,
    getSystemUserError,
    signOut,
    router,
    systemUser,
  ])
  return (
    <AuthContext.Provider value={value as ContextValue}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
