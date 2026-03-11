"use client"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { auth, functions } from "@workspace/firebase-config/firebase"
import { ClientData } from "@workspace/functions/models"
type Props = {
  children?: ReactNode
}
type User = {
  uid: string
  email: string | null
  userData?: ClientData
}
type ContextValue = {
  auth: typeof auth
  loading: boolean
  signOut: () => Promise<boolean>
  user: User | undefined
  error: Error | undefined
  reloadUserData: () => Promise<void>
}
export const AuthContext = createContext<ContextValue | { [key: string]: never }>({})
export default function AuthContextProvider({ children }: Props) {
  const [firebaseUser, firebaseUserLoading, firebaseUserError] = useAuthState(auth)
  const [signOut] = useSignOut(auth)
  const [getUserData, getUserDataLoading, getUserDataError] = useHttpsCallable<void, ClientData>(functions, "apiV1GetUser")
  const [user, setUser] = useState<User | undefined>(undefined)
  const error = firebaseUserError || getUserDataError
  const uid = firebaseUser?.uid
  const loading = !!(firebaseUserLoading || getUserDataLoading || (firebaseUser && !user))
  const reloadUserData = async () => {
    if (firebaseUser) {
      try {
        const userDataResp = await getUserData()
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          userData: userDataResp?.data
        })
      } catch (e) {
        console.error("Error reloading user data", e)
      }
    }
  }
  useEffect(() => {
    if (uid) {
      reloadUserData()
    } else {
      setUser(undefined)
    }
  }, [uid])
  return useMemo(() => (
    <AuthContext.Provider value={{ 
      auth, 
      signOut, 
      loading, 
      user, 
      error, 
      reloadUserData
    }}>
      {children}
    </AuthContext.Provider>
  ), [user, loading, error, signOut, reloadUserData])
}
export function useAuth() {
  return useContext(AuthContext)
}
