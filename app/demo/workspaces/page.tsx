"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"

interface Workspace {
  id: string
  name: string
  description: string | null
  _count: {
    projects: number
    members: number
  }
}

function DemoWorkspaces() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session")
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
      return
    }

    fetch(`/api/demo/workspaces?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data.workspaces || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Workspaces
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your team workspaces and collaborate on projects.
                  </p>
                </div>
                <Link href={`/demo/workspaces/new?session=${sessionId}`}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Workspace
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No workspaces yet. Create your first workspace to get started.
                      </p>
                      <Link href={`/demo/workspaces/new?session=${sessionId}`}>
                        <Button>Create Workspace</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaces.map((workspace) => (
                    <Link
                      key={workspace.id}
                      href={`/demo/workspaces/${workspace.id}?session=${sessionId}`}
                      prefetch
                      className="block transition-transform hover:scale-[1.02]"
                    >
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle>{workspace.name}</CardTitle>
                          {workspace.description && (
                            <CardDescription>{workspace.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {workspace._count.projects} projects • {workspace._count.members} members
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemoWorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoWorkspaces />
    </Suspense>
  )
}






