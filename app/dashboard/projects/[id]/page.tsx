import { prisma, prismaQuery } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import KanbanBoard from "@/components/projects/KanbanBoard"
import ActivityFeed from "@/components/projects/ActivityFeed"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const revalidate = 10 // Revalidate every 10 seconds

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const project = await prismaQuery(() =>
    prisma.project.findFirst({
      where: {
        id: id,
        workspace: {
          members: {
            some: {
              user: {
                email: session.user?.email as string,
              },
            },
          },
        },
      },
      include: {
        workspace: true,
        columns: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
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
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })
  )

  if (!project) {
    notFound()
  }

  return (
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
          <KanbanBoard project={project} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <ActivityFeed projectId={project.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


