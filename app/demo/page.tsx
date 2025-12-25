"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate or retrieve session ID
    let id = sessionStorage.getItem("demoSessionId")
    
    if (!id) {
      // Generate a unique session ID
      id = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("demoSessionId", id)
    }

    setSessionId(id)
    setIsLoading(false)

    // Initialize demo session on server
    fetch("/api/demo/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    }).then(() => {
      // Redirect to demo dashboard
      router.push(`/demo/dashboard?session=${id}`)
    }).catch(() => {
      setIsLoading(false)
    })
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Setting up your demo session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Starting Demo Session</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please wait while we set up your demo workspace...
        </p>
      </Card>
    </div>
  )
}







