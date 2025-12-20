"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={isTransitioning ? "opacity-0 transition-opacity duration-200" : "opacity-100 transition-opacity duration-300"}>
      {children}
    </div>
  )
}

