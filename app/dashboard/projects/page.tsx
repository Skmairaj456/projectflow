import { prisma, prismaQuery } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 10 // Revalidate every 10 seconds

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get projects for authenticated user (exclude demo workspaces)
  const projects = await prismaQuery(() =>
    prisma.project.findMany({
      where: {
        workspace: {
          demoSessionId: null, // Exclude demo workspaces
          members: {
            some: {
              user: {
                email: session.user.email,
              },
            },
          },
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    })
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and track all your projects in one place.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No projects yet. Create a workspace and add your first project.
              </p>
              <Link href="/dashboard/workspaces" prefetch>
                <Button>Go to Workspaces</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/dashboard/projects/${project.id}`}
              prefetch
              className="block transition-transform hover:scale-[1.02]"
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
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{project._count.tasks}</span>{" "}
                      tasks
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {project.workspace.name}
                    </div>
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


