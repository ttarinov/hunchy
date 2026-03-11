import type { IconSvgElement } from "@hugeicons/react"
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons"

export type NavItem = {
  title: string
  url: string
  icon: IconSvgElement
}

export type SidebarConfig = {
  title: string
  subtitle: string
  navigation: NavItem[]
}

export const sidebarConfig: SidebarConfig = {
  title: "Hunchy",
  subtitle: "Dashboard",
  navigation: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: DashboardSquare01Icon,
    },
  ],
}
