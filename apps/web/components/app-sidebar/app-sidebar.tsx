"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/context/auth-context"
import { sidebarConfig } from "./sidebar-config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const getInitials = (email?: string | null) => {
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "US"
  }
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
            <HugeiconsIcon
              icon={ComputerTerminal01Icon}
              size={16}
              className="h-4 w-4"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {sidebarConfig.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {sidebarConfig.subtitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarSeparator className="bg-sidebar-border" />
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarConfig.navigation.map((item) => {
                const isActive =
                  pathname === item.url ||
                  pathname?.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2.5"
                      >
                        <HugeiconsIcon
                          icon={item.icon}
                          size={16}
                          className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                        />
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3 bg-sidebar-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-sidebar-accent group">
              <Avatar className="h-9 w-9 border border-sidebar-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[130px]">
                  {user?.userData?.displayName || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[130px]">
                  {user?.email}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            className="w-56 bg-popover border-border"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="text-foreground">
                  {user?.userData?.displayName || "User"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={signOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={16}
                className="mr-2 h-4 w-4"
              />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
