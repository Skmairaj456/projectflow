import { prisma, prismaQuery } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get workspaces where the current user is a member
  const workspaces = await prismaQuery(() =>
    prisma.workspace.findMany({
      where: {
        members: {
          some: {
            user: {
              email: session.user?.email as string,
            },
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
          take: 3,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workspaces
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your team workspaces and collaborate on projects.
          </p>
        </div>
        <Link href="/dashboard/workspaces/new" prefetch>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No workspaces yet. Create your first workspace to get started.
              </p>
              <Link href="/dashboard/workspaces/new" prefetch>
                <Button>Create Workspace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/dashboard/workspaces/${workspace.id}`}
              prefetch
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                  {workspace.description && (
                    <CardDescription>{workspace.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        {workspace._count.projects}
                      </span>
                      <span className="ml-1">projects</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">
                        {workspace._count.members}
                      </span>
                      <span className="ml-1">members</span>
                    </div>
                    {workspace.members.length > 0 && (
                      <div className="flex items-center -space-x-2">
                        {workspace.members.map((member) => (
                          <div
                            key={member.id}
                            className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 bg-primary text-white flex items-center justify-center text-xs font-semibold"
                            title={member.user.name || member.user.email || ""}
                          >
                            {member.user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.user.image}
                                alt={member.user.name || ""}
                                className="h-full w-full rounded-full"
                              />
                            ) : (
                              member.user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


