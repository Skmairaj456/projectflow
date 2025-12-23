"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import KanbanBoard from "@/components/projects/KanbanBoard"
import ActivityFeed from "@/components/projects/ActivityFeed"

function DemoProjectDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = params.id as string
  const sessionId = searchParams.get("session")
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
      return
    }

    // Fetch project details
    fetch(`/api/demo/projects?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        const foundProject = data.projects?.find((p: any) => p.id === projectId)
        if (foundProject) {
          // Fetch full project with columns and tasks
          fetch(`/api/demo/projects/${projectId}?sessionId=${sessionId}`)
            .then((res) => res.json())
            .then((projectData) => {
              setProject(projectData.project || foundProject)
              setIsLoading(false)
            })
            .catch(() => {
              setProject(foundProject)
              setIsLoading(false)
            })
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => setIsLoading(false))
  }, [projectId, sessionId, router])

  if (!sessionId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Header user={undefined} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-6">
                <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Header user={undefined} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This project doesn't exist or is not part of your demo session.
                </p>
                <Link href={`/demo/dashboard?session=${sessionId}`}>
                  <Button>Back to Dashboard</Button>
                </Link>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header user={undefined} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {project.columns ? (
                    <KanbanBoard project={project} />
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Kanban board loading...
                      </p>
                    </Card>
                  )}
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-20">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Activity
                      </h2>
                      {project.id ? (
                        <ActivityFeed projectId={project.id} />
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No activity yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemoProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoProjectDetail />
    </Suspense>
  )
}

