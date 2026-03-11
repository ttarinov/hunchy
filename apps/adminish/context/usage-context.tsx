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
export type UsageEntry = {
  _key: string
  userId: string
  month: string
  computeSecondsUsed?: number
  requestsCount?: number
  lastUpdated?: number
}
type ContextValue = {
  usage: UsageEntry[]
  loading: boolean
  error: Error | undefined
  computeHoursByUser: Record<string, number>
  requestsByUser: Record<string, number>
  totalComputeHours: number
  totalRequests: number
  totalComputeHoursThisMonth: number
  totalRequestsThisMonth: number
}
const UsageContext = createContext<ContextValue>({
  usage: [],
  loading: true,
  error: undefined,
  computeHoursByUser: {},
  requestsByUser: {},
  totalComputeHours: 0,
  totalRequests: 0,
  totalComputeHoursThisMonth: 0,
  totalRequestsThisMonth: 0,
})
export function UsageContextProvider({ children }: { children: ReactNode }) {
  const { user, systemUser } = useAuth()
  const db = getDatabase()
  const [usage, setUsage] = useState<UsageEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  useEffect(() => {
    if (!user || !systemUser) {
      setLoading(false)
      setUsage([])
      return
    }
    const usageRef = ref(db, "usage")
    const unsubscribe = onValue(
      usageRef,
      (snapshot) => {
        const usageData: UsageEntry[] = []
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key as string
          userSnapshot.forEach((monthSnapshot) => {
            const month = monthSnapshot.key as string
            const data = monthSnapshot.val()
            usageData.push({
              _key: `${userId}-${month}`,
              userId,
              month,
              computeSecondsUsed: data.computeSecondsUsed,
              requestsCount: data.requestsCount,
              lastUpdated: data.lastUpdated,
            })
          })
        })
        setUsage(usageData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching usage:", err)
        setError(err as Error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [user, systemUser, db])
  const aggregations = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const computeHoursByUser: Record<string, number> = {}
    const requestsByUser: Record<string, number> = {}
    let totalComputeHours = 0
    let totalRequests = 0
    let totalComputeHoursThisMonth = 0
    let totalRequestsThisMonth = 0
    usage.forEach((entry) => {
      const computeSeconds = entry.computeSecondsUsed || 0
      const requests = entry.requestsCount || 0
      const computeHours = Math.round((computeSeconds / 3600) * 10) / 10
      computeHoursByUser[entry.userId] = (computeHoursByUser[entry.userId] || 0) + computeHours
      requestsByUser[entry.userId] = (requestsByUser[entry.userId] || 0) + requests
      totalComputeHours += computeHours
      totalRequests += requests
      if (entry.month === thisMonth) {
        totalComputeHoursThisMonth += computeHours
        totalRequestsThisMonth += requests
      }
    })
    return {
      computeHoursByUser,
      requestsByUser,
      totalComputeHours: Math.round(totalComputeHours * 10) / 10,
      totalRequests,
      totalComputeHoursThisMonth: Math.round(totalComputeHoursThisMonth * 10) / 10,
      totalRequestsThisMonth,
    }
  }, [usage])
  const value = useMemo(
    () => ({
      usage,
      loading,
      error,
      ...aggregations,
    }),
    [usage, loading, error, aggregations]
  )
  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
}
export const useUsage = () => useContext(UsageContext)
