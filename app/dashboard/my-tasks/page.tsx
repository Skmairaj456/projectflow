import { prisma, prismaQuery } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import TaskCard from "@/components/projects/TaskCard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const revalidate = 10 // Revalidate every 10 seconds

export default async function MyTasksPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get all tasks assigned to the current user
  const tasks = await prismaQuery(() =>
    prisma.task.findMany({
      where: {
        assignee: {
          email: session.user?.email as string,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 100,
    })
  )

  const now = new Date()
  const overdue = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE"
  )
  const dueToday = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate).toDateString() === now.toDateString() &&
      task.status !== "DONE"
  )
  const dueThisWeek = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) > now &&
      new Date(task.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
      task.status !== "DONE"
  )
  const completed = tasks.filter((task) => task.status === "DONE")

  const groupedTasks = {
    overdue,
    dueToday,
    dueThisWeek,
    completed,
    other: tasks.filter(
      (task) =>
        !overdue.includes(task) &&
        !dueToday.includes(task) &&
        !dueThisWeek.includes(task) &&
        !completed.includes(task)
    ),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Tasks
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage and track all your assigned tasks in one place.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{overdue.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{dueToday.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Due This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{dueThisWeek.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{completed.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {overdue.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Overdue ({overdue.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdue.map((task) => (
                <Link key={task.id} href={`/dashboard/projects/${task.projectId}`}>
                  <div className="relative">
                    <TaskCard
                      task={{
                        ...task,
                        labels: task.labels?.map(tl => tl.label) || [],
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                        title={task.project.name}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {dueToday.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Due Today ({dueToday.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueToday.map((task) => (
                <Link key={task.id} href={`/dashboard/projects/${task.projectId}`}>
                  <div className="relative">
                    <TaskCard
                      task={{
                        ...task,
                        labels: task.labels?.map(tl => tl.label) || [],
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                        title={task.project.name}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {dueThisWeek.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Due This Week ({dueThisWeek.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueThisWeek.map((task) => (
                <Link key={task.id} href={`/dashboard/projects/${task.projectId}`}>
                  <div className="relative">
                    <TaskCard
                      task={{
                        ...task,
                        labels: task.labels?.map(tl => tl.label) || [],
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                        title={task.project.name}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {groupedTasks.other.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Other Tasks ({groupedTasks.other.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTasks.other.map((task) => (
                <Link key={task.id} href={`/dashboard/projects/${task.projectId}`}>
                  <div className="relative">
                    <TaskCard
                      task={{
                        ...task,
                        labels: task.labels?.map(tl => tl.label) || [],
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.project.color }}
                        title={task.project.name}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No tasks assigned to you yet.
                </p>
                <Link href="/dashboard/projects">
                  <Button>Browse Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


