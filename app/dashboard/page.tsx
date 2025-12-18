import { prisma, prismaQuery } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import StatsCards from "@/components/dashboard/StatsCards"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const revalidate = 10 // Revalidate every 10 seconds

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!currentUser) {
    redirect("/auth/signin")
  }

  const userId = currentUser.id

  let workspaces: Array<{
    id: string
    name: string
    _count: { projects: number; members: number }
  }> = []
  let totalProjects = 0
  let totalTasks = 0
  let completedTasks = 0
  let teamMembers = 0
  let recentProjects: Array<{
    id: string
    name: string
    workspace: { name: string }
    _count: { tasks: number }
  }> = []
  let hasDbError = false
  let dbErrorMessage = ""

  try {
    // Get workspaces where the current user is a member
    workspaces = await prismaQuery(() =>
      prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          _count: {
            select: {
              projects: true,
              members: true,
            },
          },
        },
        take: 5,
        orderBy: {
          updatedAt: "desc",
        },
      })
    )

    const workspaceIds = workspaces.map((w) => w.id)

    if (workspaceIds.length > 0) {
      // Get statistics for the user's workspaces
      const [projectCount, taskCount, doneCount, allMembers] = await Promise.all([
        prismaQuery(() =>
          prisma.project.count({
            where: {
              workspaceId: { in: workspaceIds },
            },
          })
        ),
        prismaQuery(() =>
          prisma.task.count({
            where: {
              project: {
                workspaceId: { in: workspaceIds },
              },
            },
          })
        ),
        prismaQuery(() =>
          prisma.task.count({
            where: {
              project: {
                workspaceId: { in: workspaceIds },
              },
              status: "DONE",
            },
          })
        ),
        prismaQuery(() =>
          prisma.workspaceMember.findMany({
            where: {
              workspaceId: { in: workspaceIds },
            },
            select: {
              userId: true,
            },
          })
        ),
      ])

      totalProjects = projectCount
      totalTasks = taskCount
      completedTasks = doneCount

      // Count unique team members across all user's workspaces
      const uniqueUserIds = new Set(allMembers.map((m) => m.userId))
      teamMembers = uniqueUserIds.size

      recentProjects = await prismaQuery(() =>
        prisma.project.findMany({
          where: {
            workspaceId: { in: workspaceIds },
          },
          include: {
            workspace: true,
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 5,
        })
      )
    }
  } catch (error) {
    hasDbError = true
    dbErrorMessage =
      error instanceof Error
        ? error.message
        : "Database is not reachable. Check DATABASE_URL and Postgres."
    console.error("[DASHBOARD] Database error:", error)
  }

  return (
    <div className="space-y-6">
      {hasDbError && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/30 dark:text-amber-50 p-4">
          <p className="font-semibold">Database not reachable</p>
          <p className="text-sm mt-1">
            Please verify your DATABASE_URL in .env and ensure Postgres is running. Showing empty data until the database connection succeeds.
          </p>
          <p className="text-xs mt-2 opacity-80 break-all">Error: {dbErrorMessage}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Link href="/dashboard/workspaces/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        stats={{
          totalProjects,
          totalTasks,
          completedTasks,
          teamMembers,
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                  href={`/dashboard/workspaces/${workspace.id}`}
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

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Projects
          </h2>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No projects yet. Create a workspace and add your first project.
            </p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
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


