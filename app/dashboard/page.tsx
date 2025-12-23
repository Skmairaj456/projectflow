import { prisma, prismaQuery } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import StatsCards from "@/components/dashboard/StatsCards"
import { Suspense } from "react"
import { StatsCardsSkeleton, WorkspacesSkeleton, ProjectsSkeleton } from "@/components/dashboard/DashboardSkeleton"

export const revalidate = 10 // Revalidate every 10 seconds

async function DashboardContent() {
  // No authentication required - public access

  // Optimize: Fetch workspaces and stats in parallel (all data, no user filtering)
  const [workspaces, stats] = await Promise.all([
    prismaQuery(() =>
      prisma.workspace.findMany({
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
    ),
    // Get stats in parallel (all data, no user filtering)
    (async () => {
      const allWorkspaces = await prismaQuery(() =>
        prisma.workspace.findMany({
          select: { id: true },
        })
      )

      const workspaceIds = allWorkspaces.map((w) => w.id)

      if (workspaceIds.length === 0) {
        return {
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          teamMembers: 0,
          recentProjects: [],
        }
      }

      // Fetch all stats in parallel
      const [projectCount, taskCount, doneCount, allMembers, recentProjects] = await Promise.all([
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
        prismaQuery(() =>
          prisma.project.findMany({
            where: {
              workspaceId: { in: workspaceIds },
            },
            include: {
              workspace: {
                select: {
                  name: true,
                },
              },
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
        ),
      ])

      const uniqueUserIds = new Set(allMembers.map((m) => m.userId))

      return {
        totalProjects: projectCount,
        totalTasks: taskCount,
        completedTasks: doneCount,
        teamMembers: uniqueUserIds.size,
        recentProjects,
      }
    })(),
  ])

  return (
    <>
      <div className="flex items-center justify-between animate-in fade-in duration-300">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Link href="/dashboard/workspaces/new" prefetch>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        stats={{
          totalProjects: stats.totalProjects,
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          teamMembers: stats.teamMembers,
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

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Projects
          </h2>
          {stats.recentProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No projects yet. Create a workspace and add your first project.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
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
    </>
  )
}

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <StatsCardsSkeleton />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <WorkspacesSkeleton />
              <ProjectsSkeleton />
            </div>
          </>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}


