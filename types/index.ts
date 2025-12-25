// Shared type definitions

export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  order: number
  assignee: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  labels?: Array<{
    label: {
      id: string
      name: string
      color: string
    }
  }>
  _count: {
    comments: number
    attachments: number
  }
}

export interface Workspace {
  id: string
  name: string
  description: string | null
  _count: {
    projects: number
    members: number
  }
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  _count: {
    tasks: number
  }
}

// Prisma where clause types
import { Prisma } from "@prisma/client"

export type ActivityWhereInput = Prisma.ActivityWhereInput
export type ProjectWhereInput = Prisma.ProjectWhereInput
export type WorkspaceWhereInput = Prisma.WorkspaceWhereInput

