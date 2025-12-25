import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  columnId: z.string().min(1, "Column ID is required"),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

    // Verify project exists and user has access (exclude demo workspaces)
    const project = await prismaQuery(() =>
      prisma.project.findFirst({
        where: {
          id: validatedData.projectId,
          workspace: {
            demoSessionId: null, // Exclude demo workspaces
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
          columns: {
            where: {
              id: validatedData.columnId,
            },
          },
        },
      })
    )

    if (!project || project.columns.length === 0) {
      return NextResponse.json(
        { error: "Project or column not found or access denied" },
        { status: 404 }
      )
    }

    // Get max order in column
    const maxOrder = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          columnId: validatedData.columnId,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      })
    )

    const task = await prismaQuery(() =>
      prisma.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          dueDate: validatedData.dueDate
            ? new Date(validatedData.dueDate)
            : null,
          projectId: validatedData.projectId,
          columnId: validatedData.columnId,
          order: (maxOrder?.order ?? -1) + 1,
          status: "TODO",
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
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      })
    )

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to create task"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


