import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const updateLabelSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateLabelSchema.parse(body)

    const label = await prismaQuery(() =>
      prisma.label.update({
        where: { id },
        data: validatedData,
      })
    )

    return NextResponse.json({ label })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to update label"
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

    const { id } = await params

    await prismaQuery(() =>
      prisma.label.delete({
        where: { id },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete label"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




