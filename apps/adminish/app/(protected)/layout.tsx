"use client"
import { AppSidebar } from "@/components/app-sidebar/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Providers } from "@/components/providers"
import { UsersContextProvider } from "@/context/users-context"
import { CommitsContextProvider } from "@/context/commits-context"
import { UsageContextProvider } from "@/context/usage-context"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <ProtectedRoute>
        <UsersContextProvider>
          <CommitsContextProvider>
            <UsageContextProvider>
              <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <div className="w-full p-2 flex items-center border-b md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="flex flex-1 flex-col">{children}</div>
              </SidebarInset>
            </SidebarProvider>
            </UsageContextProvider>
          </CommitsContextProvider>
        </UsersContextProvider>
      </ProtectedRoute>
    </Providers>
  )
}
