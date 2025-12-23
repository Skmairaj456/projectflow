"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderKanban, Users } from "lucide-react"
import StatsCards from "@/components/dashboard/StatsCards"

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
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  })
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

      const workspacesList = workspacesData.workspaces || []
      const projectsList = projectsData.projects || []

      setWorkspaces(workspacesList)
      setProjects(projectsList)

      // Calculate stats
      const totalProjects = projectsList.length
      const totalTasks = projectsList.reduce((sum: number, p: Project) => sum + (p._count.tasks || 0), 0)
      // For demo, we'll estimate completed tasks (you can enhance this with actual task status)
      const completedTasks = Math.floor(totalTasks * 0.3) // Estimate 30% completed
      const teamMembers = workspacesList.reduce((sum: number, w: Workspace) => sum + (w._count.members || 0), 0)

      setStats({
        totalProjects,
        totalTasks,
        completedTasks,
        teamMembers,
      })
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
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in duration-300">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to ProjectFlow Demo! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore all features with sample data. Your changes are isolated and temporary.
          </p>
        </div>
        <Link href={`/demo/workspaces/new?session=${sessionId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      {/* Statistics Cards - Same as main dashboard */}
      <StatsCards
        stats={{
          totalProjects: stats.totalProjects,
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          teamMembers: stats.teamMembers,
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Workspaces - Same layout as main dashboard */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Workspaces
          </h2>
          {workspaces.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No workspaces yet. Create your first workspace to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/demo/workspaces/${workspace.id}?session=${sessionId}`}
                  prefetch
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workspace._count.projects} projects •{" "}
                        {workspace._count.members} members
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects - Same layout as main dashboard */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No projects yet. Create a workspace and add your first project.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/demo/projects/${project.id}?session=${sessionId}`}
                  prefetch
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.workspace.name} • {project._count.tasks} tasks
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


