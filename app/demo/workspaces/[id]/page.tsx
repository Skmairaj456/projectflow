"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, FolderKanban, AlertCircle } from "lucide-react"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import type { DemoWorkspace } from "@/types/demo"

function DemoWorkspaceDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const sessionId = searchParams.get("session")
  const [workspace, setWorkspace] = useState<DemoWorkspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
      return
    }

    // Fetch workspace details
    fetch(`/api/demo/workspaces?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data: { workspaces?: DemoWorkspace[] }) => {
        const foundWorkspace = data.workspaces?.find((w) => w.id === workspaceId)
        if (foundWorkspace) {
          // Fetch full workspace with projects
          fetch(`/api/demo/workspaces/${workspaceId}?sessionId=${sessionId}`)
            .then((res) => res.json())
            .then((workspaceData) => {
              setWorkspace(workspaceData.workspace || foundWorkspace)
              setIsLoading(false)
            })
            .catch(() => {
              setWorkspace(foundWorkspace)
              setIsLoading(false)
            })
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => setIsLoading(false))
  }, [workspaceId, sessionId, router])

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
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Header user={undefined} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Workspace Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  This workspace doesn't exist or is not part of your demo session.
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
                  {workspace.name}
                </h1>
                {workspace.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {workspace.description}
                  </p>
                )}
              </div>

              {/* Workspace Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Members
                  </CardTitle>
                  <CardDescription>
                    Team members in this workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workspace.members?.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No members yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {workspace.members?.map((member) => (
                        <div key={member.id} className="flex items-center gap-2">
                          {member.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.user.image}
                              alt={member.user.name || "User"}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                              {member.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.user?.name || "Demo User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.role || "Member"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Projects in Workspace */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5" /> Projects
                    </CardTitle>
                    <CardDescription>
                      Projects within this workspace.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {workspace.projects?.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No projects yet. Create your first project in this workspace.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {workspace.projects?.map((project) => (
                        <Link
                          key={project.id}
                          href={`/demo/projects/${project.id}?session=${sessionId}`}
                          prefetch
                          className="block transition-transform hover:scale-[1.02]"
                        >
                          <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: project.color || "#3b82f6" }}
                                />
                                <CardTitle>{project.name}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {project._count?.tasks || 0} tasks
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemoWorkspaceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoWorkspaceDetail />
    </Suspense>
  )
}






