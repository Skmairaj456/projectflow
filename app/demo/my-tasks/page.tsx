"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"

function DemoMyTasks() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
    }
  }, [sessionId, router])

  if (!sessionId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header 
          user={undefined} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Tasks
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage and track all your assigned tasks in one place.
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Task management is available in the main application.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      In demo mode, you can explore workspaces and projects.
                    </p>
                    <Link href={`/demo/dashboard?session=${sessionId}`} prefetch>
                      <Button>Back to Dashboard</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemoMyTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoMyTasks />
    </Suspense>
  )
}

