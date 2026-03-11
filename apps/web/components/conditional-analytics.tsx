"use client"
export function ConditionalAnalytics() {
  if (typeof window === "undefined") return null
  if (!process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return null
  }
  try {
    const { Analytics } = require("@vercel/analytics/next")
    return <Analytics />
  } catch {
    return null
  }
}
