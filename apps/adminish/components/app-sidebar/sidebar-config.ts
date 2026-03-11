import { LayoutDashboard, Users, Activity, CreditCard, LucideIcon } from "lucide-react"
export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}
export type SidebarConfig = {
  title: string
  subtitle: string
  navigation: NavItem[]
}
export const sidebarConfig: SidebarConfig = {
  title: "Adminish",
  subtitle: "Hunchy Admin",
  navigation: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Agents Activity",
      url: "/agents",
      icon: Activity,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CreditCard,
    },
  ],
}
