import { prisma, prismaQuery } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const { id } = await params
  const workspace = await prismaQuery(() =>
    prisma.workspace.findFirst({
      where: {
        id: id,
        demoSessionId: null, // Exclude demo workspaces
        members: {
          some: {
            user: {
              email: session.user?.email as string,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        projects: {
          include: {
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    })
  )

  if (!workspace) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
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
        <Link href={`/dashboard/workspaces/${workspace.id}/projects/new`} prefetch>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              {workspace._count.projects} total projects
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {workspace._count.members} team members
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Projects
        </h2>
        {workspace.projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No projects yet. Create your first project.
                </p>
                <Link href={`/dashboard/workspaces/${workspace.id}/projects/new`} prefetch>
                  <Button>Create Project</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspace.projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} prefetch className="block transition-transform hover:scale-[1.02]">
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
                      <span className="font-medium">{project._count.tasks}</span>{" "}
                      tasks
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Team Members
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workspace.members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          {member.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.user.image}
                              alt={member.user.name || ""}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {member.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


