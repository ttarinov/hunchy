"use client"
import { useUsers } from "@/context/users-context"
import { useUsage } from "@/context/usage-context"
import { UsersTable } from "./_components/users-table"
export default function UsersPage() {
  const { users, loading: usersLoading } = useUsers()
  const { commitsByUser, loading: usageLoading } = useUsage()
  const usersWithCommits = users.map((user) => ({
    ...user,
    commitsCount: commitsByUser[user._key] || 0,
  }))
  const loading = usersLoading || usageLoading
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Users
        </h1>
        <p className="text-muted-foreground">
          Manage and view all platform users
        </p>
      </div>
      <UsersTable users={usersWithCommits} loading={loading} />
    </div>
  )
}
