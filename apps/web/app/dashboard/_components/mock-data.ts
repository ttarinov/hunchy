import { FlashIcon, SparklesIcon } from "@hugeicons/core-free-icons"
import type { PR, Plan } from "./types"
export const mockPRs: PR[] = [
  {
    id: 52,
    title: "Feature: User Authentication System",
    description: "Added OAuth2, form validation, and middleware",
    totalTime: "12.5h",
    complexity: "Medium",
    commits: [
      { title: "Add OAuth2 providers (Google, GitHub)", time: "4.5h", complexity: "Medium", files: 3 },
      { title: "Implement form validation with Zod", time: "3h", complexity: "Low", files: 2 },
      { title: "Add auth middleware for protected routes", time: "2.5h", complexity: "Low", files: 2 },
      { title: "Create login/signup UI components", time: "2h", complexity: "Low", files: 2 },
      { title: "Add session management and token refresh", time: "0.5h", complexity: "Low", files: 1 },
    ],
  },
  {
    id: 51,
    title: "Refactor: API Layer Architecture",
    description: "Restructured API endpoints with better error handling",
    totalTime: "18h",
    complexity: "High",
    commits: [
      { title: "Create base API service with interceptors", time: "5h", complexity: "High", files: 4 },
      { title: "Implement error handling middleware", time: "4h", complexity: "Medium", files: 3 },
      { title: "Add request/response type definitions", time: "3h", complexity: "Medium", files: 2 },
      { title: "Refactor existing endpoints to use new service", time: "4h", complexity: "High", files: 5 },
      { title: "Add API documentation and tests", time: "2h", complexity: "Low", files: 2 },
    ],
  },
  {
    id: 50,
    title: "Feature: Real-time Notifications",
    description: "Implemented WebSocket-based notification system",
    totalTime: "15h",
    complexity: "High",
    commits: [
      { title: "Set up WebSocket server infrastructure", time: "6h", complexity: "High", files: 5 },
      { title: "Create notification service and handlers", time: "4h", complexity: "Medium", files: 3 },
      { title: "Build notification UI components", time: "3h", complexity: "Low", files: 3 },
      { title: "Add notification preferences and settings", time: "2h", complexity: "Low", files: 2 },
    ],
  },
  {
    id: 49,
    title: "Fix: Performance Optimization",
    description: "Optimized database queries and reduced load times",
    totalTime: "9.5h",
    complexity: "Medium",
    commits: [
      { title: "Add database indexes for frequently queried fields", time: "3h", complexity: "Medium", files: 2 },
      { title: "Implement query result caching", time: "3.5h", complexity: "High", files: 3 },
      { title: "Optimize N+1 query patterns", time: "2h", complexity: "Medium", files: 4 },
      { title: "Add performance monitoring and metrics", time: "1h", complexity: "Low", files: 1 },
    ],
  },
  {
    id: 48,
    title: "Feature: Advanced Search",
    description: "Added full-text search with filters and sorting",
    totalTime: "11h",
    complexity: "Medium",
    commits: [
      { title: "Integrate Elasticsearch for search functionality", time: "4h", complexity: "High", files: 4 },
      { title: "Create search API endpoints", time: "3h", complexity: "Medium", files: 3 },
      { title: "Build search UI with filters", time: "2.5h", complexity: "Low", files: 3 },
      { title: "Add search result highlighting", time: "1.5h", complexity: "Low", files: 2 },
    ],
  },
  {
    id: 47,
    title: "Feature: Data Export",
    description: "Added CSV and JSON export functionality",
    totalTime: "7h",
    complexity: "Low",
    commits: [
      { title: "Create export service for CSV generation", time: "3h", complexity: "Medium", files: 2 },
      { title: "Add JSON export endpoint", time: "2h", complexity: "Low", files: 2 },
      { title: "Build export UI with format selection", time: "1.5h", complexity: "Low", files: 2 },
      { title: "Add export history and download tracking", time: "0.5h", complexity: "Low", files: 1 },
    ],
  },
  {
    id: 46,
    title: "Refactor: Component Library",
    description: "Extracted reusable components into shared library",
    totalTime: "14h",
    complexity: "Medium",
    commits: [
      { title: "Create shared component library structure", time: "3h", complexity: "Medium", files: 4 },
      { title: "Extract common UI components", time: "5h", complexity: "Medium", files: 8 },
      { title: "Update imports across codebase", time: "4h", complexity: "Low", files: 12 },
      { title: "Add component documentation", time: "2h", complexity: "Low", files: 3 },
    ],
  },
  {
    id: 45,
    title: "Feature: Dark Mode Support",
    description: "Implemented theme switching with system preference detection",
    totalTime: "8h",
    complexity: "Low",
    commits: [
      { title: "Add theme context and provider", time: "2.5h", complexity: "Low", files: 2 },
      { title: "Create dark mode color palette", time: "2h", complexity: "Low", files: 1 },
      { title: "Update all components for theme support", time: "2.5h", complexity: "Low", files: 15 },
      { title: "Add theme toggle in settings", time: "1h", complexity: "Low", files: 2 },
    ],
  },
]
export const currentPlan: Plan = "free"
export const planLimits = {
  free: {
    name: "Free",
    commits: 50,
    price: "$0",
    icon: FlashIcon,
  },
  starter: {
    name: "Starter",
    commits: 300,
    price: "$5",
    icon: SparklesIcon,
  },
  pro: {
    name: "Pro",
    commits: 800,
    price: "$10",
    icon: SparklesIcon,
  },
  enterprise: {
    name: "Enterprise",
    commits: "Unlimited",
    price: "Custom",
    icon: SparklesIcon,
  },
}
export const mockTokensData = [
  { date: "Jan 1", tokens: 1200 },
  { date: "Jan 8", tokens: 2100 },
  { date: "Jan 15", tokens: 1800 },
  { date: "Jan 22", tokens: 3200 },
  { date: "Jan 29", tokens: 2800 },
  { date: "Feb 5", tokens: 4100 },
  { date: "Feb 12", tokens: 3800 },
  { date: "Feb 19", tokens: 4500 },
  { date: "Feb 26", tokens: 5200 },
  { date: "Mar 5", tokens: 4800 },
  { date: "Mar 12", tokens: 6100 },
  { date: "Mar 19", tokens: 5800 },
]
export const chartConfig = {
  tokens: {
    label: "Tokens Used",
    color: "hsl(var(--chart-1))",
  },
}
