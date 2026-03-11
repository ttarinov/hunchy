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
export type CommitData = {
  _key: string
  userId: string
  message: string
  files?: number
  additions?: number
  deletions?: number
  createdAt: number
  repository?: string
  branch?: string
}
type ContextValue = {
  commits: CommitData[]
  commitsByUser: Record<string, CommitData[]>
  loading: boolean
  error: Error | undefined
  totalCommits: number
  commitsToday: number
  commitsThisWeek: number
  commitsThisMonth: number
}
const CommitsContext = createContext<ContextValue>({
  commits: [],
  commitsByUser: {},
  loading: true,
  error: undefined,
  totalCommits: 0,
  commitsToday: 0,
  commitsThisWeek: 0,
  commitsThisMonth: 0,
})
export function CommitsContextProvider({ children }: { children: ReactNode }) {
  const { user, systemUser } = useAuth()
  const db = getDatabase()
  const [commits, setCommits] = useState<CommitData[]>([])
  const [commitsByUser, setCommitsByUser] = useState<Record<string, CommitData[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  useEffect(() => {
    if (!user || !systemUser) {
      setLoading(false)
      setCommits([])
      setCommitsByUser({})
      return
    }
    const commitsRef = ref(db, "commits")
    const unsubscribe = onValue(
      commitsRef,
      (snapshot) => {
        const allCommits: CommitData[] = []
        const byUser: Record<string, CommitData[]> = {}
        snapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key as string
          byUser[userId] = []
          userSnapshot.forEach((commitSnapshot) => {
            const commit: CommitData = {
              _key: commitSnapshot.key as string,
              userId,
              ...commitSnapshot.val(),
            }
            allCommits.push(commit)
            byUser[userId].push(commit)
          })
        })
        allCommits.sort((a, b) => b.createdAt - a.createdAt)
        setCommits(allCommits)
        setCommitsByUser(byUser)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching commits:", err)
        setError(err as Error)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [user, systemUser, db])
  const stats = useMemo(() => {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000
    const totalCommits = commits.length
    const commitsToday = commits.filter((c) => c.createdAt > oneDayAgo).length
    const commitsThisWeek = commits.filter((c) => c.createdAt > oneWeekAgo).length
    const commitsThisMonth = commits.filter((c) => c.createdAt > oneMonthAgo).length
    return {
      totalCommits,
      commitsToday,
      commitsThisWeek,
      commitsThisMonth,
    }
  }, [commits])
  const value = useMemo(
    () => ({
      commits,
      commitsByUser,
      loading,
      error,
      ...stats,
    }),
    [commits, commitsByUser, loading, error, stats]
  )
  return (
    <CommitsContext.Provider value={value}>{children}</CommitsContext.Provider>
  )
}
export const useCommits = () => useContext(CommitsContext)
