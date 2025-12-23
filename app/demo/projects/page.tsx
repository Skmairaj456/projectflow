"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  workspace: {
    name: string
  }
  _count: {
    tasks: number
  }
}

function DemoProjects() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
      return
    }

    fetch(`/api/demo/projects?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || [])
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
                    Projects
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    All your projects in one place.
                  </p>
                </div>
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
              ) : projects.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No projects yet. Create your first project!
                      </p>
                      <Link href={`/demo/dashboard?session=${sessionId}`}>
                        <Button>Back to Dashboard</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/demo/projects/${project.id}?session=${sessionId}`}
                      prefetch
                    >
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <CardTitle>{project.name}</CardTitle>
                          </div>
                          {project.description && (
                            <CardDescription>{project.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {project._count.tasks} tasks • {project.workspace.name}
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

export default function DemoProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoProjects />
    </Suspense>
  )
}

