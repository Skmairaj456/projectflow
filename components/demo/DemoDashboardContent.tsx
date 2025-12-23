"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderKanban, Users } from "lucide-react"

interface Workspace {
  id: string
  name: string
  description: string | null
  _count: {
    projects: number
    members: number
  }
}

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

export default function DemoDashboardContent({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDemoData()
  }, [sessionId])

  const fetchDemoData = async () => {
    try {
      const [workspacesRes, projectsRes] = await Promise.all([
        fetch(`/api/demo/workspaces?sessionId=${sessionId}`),
        fetch(`/api/demo/projects?sessionId=${sessionId}`),
      ])

      const workspacesData = await workspacesRes.json()
      const projectsData = await projectsRes.json()

      setWorkspaces(workspacesData.workspaces || [])
      setProjects(projectsData.projects || [])
    } catch (error) {
      console.error("Failed to fetch demo data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to ProjectFlow Demo! 👋
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Explore all features with sample data. Your changes are isolated and temporary.
            </p>
          </div>
          <Link href="/auth/signup">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Sign Up Free
            </Button>
          </Link>
        </div>

        {/* Workspaces */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workspaces
          </h2>
          {workspaces.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No workspaces found. Creating demo workspace...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/demo/workspaces/${workspace.id}?session=${sessionId}`}
                  prefetch
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
                        {workspace._count.projects} projects
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No projects yet. Create your first project!
                </p>
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
    </div>
  )
}

