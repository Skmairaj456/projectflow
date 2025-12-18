import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const labels = await prismaQuery(() =>
      prisma.label.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    )

    return NextResponse.json({ labels })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch labels"
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
    const validatedData = createLabelSchema.parse(body)

    const label = await prismaQuery(() =>
      prisma.label.create({
        data: validatedData,
      })
    )

    return NextResponse.json({ label }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to create label"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




