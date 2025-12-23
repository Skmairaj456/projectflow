"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, ExternalLink, LogOut } from "lucide-react"
import DemoDashboardContent from "@/components/demo/DemoDashboardContent"

function DemoDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session")
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
      return
    }

    // Verify session is valid
    fetch(`/api/demo/verify?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setIsValid(true)
        } else {
          setIsValid(false)
        }
      })
      .catch(() => setIsValid(false))
  }, [sessionId, router])

  if (isValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Session Expired</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your demo session has expired. Start a new demo to continue.
          </p>
          <Link href="/demo">
            <Button>Start New Demo</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Demo Mode:</strong> This is a temporary session. All data will be deleted when you close your browser or after 2 hours of inactivity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/signup">
              <Button size="sm" variant="outline">
                Sign Up Free
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem("demoSessionId")
                router.push("/")
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <DemoDashboardContent sessionId={sessionId!} />
    </div>
  )
}

export default function DemoDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoDashboard />
    </Suspense>
  )
}


