"use client"
import { useEffect, useRef } from "react"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  useEffect(() => {
    document.documentElement.classList.add("lenis", "lenis-smooth")
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (anchor?.href) {
        const url = new URL(anchor.href)
        if (url.pathname === window.location.pathname && url.hash) {
          e.preventDefault()
          const targetElement = document.querySelector(url.hash)
          if (targetElement) {
            lenis.scrollTo(targetElement, {
              offset: -100, 
              duration: 1.5,
            })
          }
        }
      }
    }
    document.addEventListener("click", handleAnchorClick)
    return () => {
      lenis.destroy()
      document.removeEventListener("click", handleAnchorClick)
      document.documentElement.classList.remove("lenis", "lenis-smooth")
    }
  }, [])
  return <>{children}</>
}
