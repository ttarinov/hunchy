"use client"
import { useEffect, useRef } from "react"
export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)
    const gridSize = 40
    const dots: { x: number; y: number; opacity: number; speed: number }[] = []
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        dots.push({
          x,
          y,
          opacity: Math.random() * 0.5,
          speed: 0.001 + Math.random() * 0.002,
        })
      }
    }
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach((dot) => {
        dot.opacity += dot.speed
        if (dot.opacity > 0.5 || dot.opacity < 0) {
          dot.speed *= -1
        }
        ctx.fillStyle = `rgba(147, 112, 219, ${dot.opacity})`
        ctx.fillRect(dot.x, dot.y, 2, 2)
      })
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      window.removeEventListener("resize", setCanvasSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />
}
