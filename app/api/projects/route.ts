import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace ID is required"),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    const where: any = {
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
    }

    if (workspaceId) {
      where.workspaceId = workspaceId
    }

    const projects = await prismaQuery(() =>
      prisma.project.findMany({
        where,
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

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
        },
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch projects"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Verify workspace exists AND user is a member/owner (exclude demo workspaces)
    const workspace = await prismaQuery(() =>
      prisma.workspace.findFirst({
        where: {
          id: validatedData.workspaceId,
          demoSessionId: null, // Exclude demo workspaces
          members: {
            some: {
              user: {
                email: session.user?.email as string,
              },
            },
          },
        },
      })
    )

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found or access denied" },
        { status: 404 }
      )
    }

    const project = await prismaQuery(() =>
      prisma.project.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          color: validatedData.color || "#3b82f6",
          workspaceId: validatedData.workspaceId,
          columns: {
            create: [
              { name: "To Do", order: 0 },
              { name: "In Progress", order: 1 },
              { name: "In Review", order: 2 },
              { name: "Done", order: 3 },
            ],
          },
        },
        include: {
          workspace: true,
          columns: {
            orderBy: {
              order: "asc",
            },
          },
        },
      })
    )

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to create project"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


