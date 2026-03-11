export type Commit = {
  title: string
  time: string
  complexity: "Low" | "Medium" | "High"
  files: number
}
export type PR = {
  id: number
  title: string
  description: string
  commits: Commit[]
  totalTime: string
  complexity: "Low" | "Medium" | "High"
}
export type Plan = "free" | "starter" | "pro" | "enterprise"
