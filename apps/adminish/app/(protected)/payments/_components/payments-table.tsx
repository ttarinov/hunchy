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
import { UserWithStats } from "@/context/users-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, AlertTriangle, CreditCard } from "lucide-react"
import { formatDate } from "@/lib/utils"
type PaymentsTableProps = {
  users: UserWithStats[]
  loading?: boolean
}
const planPrices: Record<string, number> = {
  starter: 9,
  pro: 29,
  enterprise: 99,
}
export function PaymentsTable({ users, loading }: PaymentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "planExpiresAt", desc: false },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const columns: ColumnDef<UserWithStats>[] = React.useMemo(() => [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "plan",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const plan = row.original.plan || "free"
        return (
          <Badge
            variant={
              plan === "enterprise"
                ? "default"
                : plan === "pro"
                ? "secondary"
                : "outline"
            }
          >
            {plan}
          </Badge>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const plan = row.original.plan || "free"
        const price = planPrices[plan] || 0
        return <span className="font-medium">${price}/mo</span>
      },
    },
    {
      accessorKey: "planStartedAt",
      header: "Started",
      cell: ({ row }) => {
        const startedAt = row.original.planStartedAt
        if (!startedAt) return <span className="text-muted-foreground">-</span>
        return <span>{formatDate(startedAt)}</span>
      },
    },
    {
      accessorKey: "planExpiresAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Expires
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const expiresAt = row.original.planExpiresAt
        if (!expiresAt) return <span className="text-muted-foreground">-</span>
        const isExpiringSoon = expiresAt < Date.now() + 7 * 24 * 60 * 60 * 1000
        const isExpired = expiresAt < Date.now()
        return (
          <div className="flex items-center gap-2">
            <span className={isExpired ? "text-destructive" : isExpiringSoon ? "text-yellow-600" : ""}>
              {formatDate(expiresAt)}
            </span>
            {isExpiringSoon && !isExpired && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "daysRemaining",
      header: "Days Left",
      cell: ({ row }) => {
        const expiresAt = row.original.planExpiresAt
        if (!expiresAt) return <span className="text-muted-foreground">-</span>
        const daysLeft = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
        if (daysLeft < 0) {
          return <Badge variant="destructive">Expired</Badge>
        }
        if (daysLeft <= 7) {
          return <Badge variant="outline" className="text-yellow-600 border-yellow-600">{daysLeft} days</Badge>
        }
        return <span className="text-muted-foreground">{daysLeft} days</span>
      },
    },
  ], [])
  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const email = row.original.email?.toLowerCase() || ""
      const searchValue = filterValue.toLowerCase()
      return email.includes(searchValue)
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
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No paid users yet</p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} subscribers
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
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getPageCount() > 1 && (
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
      )}
    </div>
  )
}
