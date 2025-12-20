"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Listen to route changes
    window.addEventListener('beforeunload', handleStart)
    
    return () => {
      window.removeEventListener('beforeunload', handleStart)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
      <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
    </div>
  )
}

