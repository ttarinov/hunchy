"use client"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ref, onValue, getDatabase } from "firebase/database"
import { useAuth } from "./auth-context"
import { ClientData } from "@workspace/functions/models"
export type UserWithStats = ClientData & {
  computeHoursUsed?: number
  requestsCount?: number
}
type ContextValue = {
  users: UserWithStats[]
  loading: boolean
  error: Error | undefined
  totalUsers: number
  activeUsers: number
  paidUsers: number
  monthlyActiveUsers: number
  dailyActiveUsers: number
}
const UsersContext = createContext<ContextValue>({
  users: [],
  loading: true,
  error: undefined,
  totalUsers: 0,
  activeUsers: 0,
  paidUsers: 0,
  monthlyActiveUsers: 0,
  dailyActiveUsers: 0,
})
export function UsersContextProvider({ children }: { children: ReactNode }) {
  const { user, systemUser } = useAuth()
  const db = getDatabase()
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  useEffect(() => {
    if (!user || !systemUser) {
      setLoading(false)
      setUsers([])
      return
    }
    const usersRef = ref(db, "users")
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const usersData: UserWithStats[] = []
        snapshot.forEach((child) => {
          usersData.push({
            _key: child.key as string,
            ...child.val(),
          } as UserWithStats)
        })
        setUsers(usersData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching users:", err)
        setError(err as Error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [user, systemUser, db])
  const stats = useMemo(() => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const totalUsers = users.length
    const activeUsers = users.filter((u) => u.updatedAt && u.updatedAt > thirtyDaysAgo).length
    const paidUsers = users.filter(
      (u) => u.plan && u.plan !== "free" && u.planExpiresAt && u.planExpiresAt > now
    ).length
    const monthlyActiveUsers = users.filter(
      (u) => u.updatedAt && u.updatedAt > thirtyDaysAgo
    ).length
    const dailyActiveUsers = users.filter(
      (u) => u.updatedAt && u.updatedAt > oneDayAgo
    ).length
    return {
      totalUsers,
      activeUsers,
      paidUsers,
      monthlyActiveUsers,
      dailyActiveUsers,
    }
  }, [users])
  const value = useMemo(
    () => ({
      users,
      loading,
      error,
      ...stats,
    }),
    [users, loading, error, stats]
  )
  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}
export const useUsers = () => useContext(UsersContext)
