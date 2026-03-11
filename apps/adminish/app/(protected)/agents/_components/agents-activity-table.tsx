"use client"
import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CommitData } from "@/context/commits-context"
import { UserWithStats } from "@/context/users-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, GitCommit, FileCode } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
type AgentsActivityTableProps = {
  commits: CommitData[]
  users: UserWithStats[]
  loading?: boolean
}
export function AgentsActivityTable({ commits, users, loading }: AgentsActivityTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const userMap = React.useMemo(() => {
    const map: Record<string, UserWithStats> = {}
    users.forEach((user) => {
      map[user._key] = user
    })
    return map
  }, [users])
  const columns: ColumnDef<CommitData>[] = React.useMemo(() => [
    {
      accessorKey: "userId",
      header: "User",
      cell: ({ row }) => {
        const user = userMap[row.original.userId]
        return (
          <div className="font-medium truncate max-w-[200px]">
            {user?.email || row.original.userId}
          </div>
        )
      },
    },
    {
      accessorKey: "message",
      header: "Commit Message",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate max-w-[300px]">{row.original.message}</span>
        </div>
      ),
    },
    {
      accessorKey: "files",
      header: "Changes",
      cell: ({ row }) => {
        const files = row.original.files
        const additions = row.original.additions
        const deletions = row.original.deletions
        if (!files && !additions && !deletions) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="flex items-center gap-2 text-sm">
            {files && (
              <Badge variant="outline" className="gap-1">
                <FileCode className="h-3 w-3" />
                {files}
              </Badge>
            )}
            {additions !== undefined && (
              <span className="text-green-600">+{additions}</span>
            )}
            {deletions !== undefined && (
              <span className="text-red-600">-{deletions}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "repository",
      header: "Repository",
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-[150px] block">
          {row.original.repository || "-"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
  ], [userMap])
  const table = useReactTable({
    data: commits,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const user = userMap[row.original.userId]
      const email = user?.email?.toLowerCase() || ""
      const message = row.original.message?.toLowerCase() || ""
      const searchValue = filterValue.toLowerCase()
      return email.includes(searchValue) || message.includes(searchValue)
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or message..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} commits
        </div>
      </div>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border/50 transition-colors hover:bg-primary/5">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <GitCommit className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No commits found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
