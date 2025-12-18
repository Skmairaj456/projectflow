import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Verify task exists and user has access
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

    // For now, store file info in database (in production, upload to S3/Cloudinary)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "tasks", taskId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/tasks/${taskId}/${fileName}`

    // Save attachment record
    const attachment = await prismaQuery(() =>
      prisma.taskAttachment.create({
        data: {
          taskId,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type,
        },
      })
    )

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: taskId } = await params

    const attachments = await prismaQuery(() =>
      prisma.taskAttachment.findMany({
        where: { 
          taskId,
          task: {
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
        },
        orderBy: {
          uploadedAt: "desc",
        },
      })
    )

    return NextResponse.json({ attachments })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch attachments"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



