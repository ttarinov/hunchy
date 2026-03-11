"use client"
export function DotsSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex gap-1 ${className}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-cyan-400 animate-dots-1" />
      <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-cyan-400 animate-dots-2" />
      <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-blue-400 to-cyan-400 animate-dots-3" />
    </div>
  )
}
