"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  Logout01Icon,
  DashboardSquare01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const getUserName = () => {
    const email = user?.userData?.email || user?.email || ""
    if (!email) return "User"
    return email.split("@")[0]
  }
  const getUserInitials = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }
  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HugeiconsIcon icon={ComputerTerminal01Icon} size={24} className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Hunchy</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Integrations
            </a>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline-block text-sm font-medium">
                          {getUserName()}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{getUserName()}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.userData?.email || user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <HugeiconsIcon icon={DashboardSquare01Icon} size={16} className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <HugeiconsIcon icon={Logout01Icon} size={16} className="h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                    <Button variant="ghost" size="sm" asChild className="group hover:shadow-md transition-shadow">
                      <Link href="/login" className="flex items-center gap-2">
                        Sign In
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </Button>
                )}
          </div>
        </div>
      </div>
    </nav>
  )
}
