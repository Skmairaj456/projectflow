import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    )

    return NextResponse.json({ workspaces })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch workspaces"
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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createWorkspaceSchema.parse(body)

    const slug = generateSlug(validatedData.name)

    // Check if slug already exists
    const existingWorkspace = await prismaQuery(() =>
      prisma.workspace.findUnique({
        where: { slug },
      })
    )

    const finalSlug = existingWorkspace
      ? `${slug}-${Date.now()}`
      : slug

    const workspace = await prismaQuery(() =>
      prisma.workspace.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug: finalSlug,
          members: {
            create: {
              userId: currentUser.id,
              role: "OWNER",
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
        },
      })
    )

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to create workspace"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


