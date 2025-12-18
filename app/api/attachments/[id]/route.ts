import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get attachment info before deleting and verify access
    const attachment = await prismaQuery(() =>
      prisma.taskAttachment.findFirst({
        where: { 
          id,
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
      })
    )

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found or access denied" },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), "public", attachment.fileUrl)
      await unlink(filePath)
    } catch (fileError) {
      // File might not exist, continue with database deletion
    }

    // Delete from database
    await prismaQuery(() =>
      prisma.taskAttachment.delete({
        where: { id },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete attachment"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

