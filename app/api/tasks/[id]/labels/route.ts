import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const addLabelSchema = z.object({
  labelId: z.string().min(1, "Label ID is required"),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId } = await params
    const body = await request.json()
    const { labelId } = addLabelSchema.parse(body)

    // Verify task access
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
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
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      )
    }

    // Check if label already exists on task
    const existing = await prismaQuery(() =>
      prisma.taskLabel.findUnique({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      })
    )

    if (existing) {
      return NextResponse.json(
        { error: "Label already added to task" },
        { status: 400 }
      )
    }

    const taskLabel = await prismaQuery(() =>
      prisma.taskLabel.create({
        data: {
          taskId,
          labelId,
        },
        include: {
          label: true,
        },
      })
    )

    return NextResponse.json({ taskLabel }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to add label"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId } = await params
    const { searchParams } = new URL(request.url)
    const labelId = searchParams.get("labelId")

    if (!labelId) {
      return NextResponse.json(
        { error: "Label ID is required" },
        { status: 400 }
      )
    }

    // Verify task access
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: taskId,
          project: {
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
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      )
    }

    await prismaQuery(() =>
      prisma.taskLabel.delete({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to remove label"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




