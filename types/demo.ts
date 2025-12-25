// Demo-specific type definitions

export interface DemoProject {
  id: string
  name: string
  description: string | null
  color: string
  workspace: {
    id: string
    name: string
    slug: string
  }
  columns?: Array<{
    id: string
    name: string
    order: number
    tasks: Array<{
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
    }>
  }>
  _count: {
    tasks: number
  }
}

export interface DemoWorkspace {
  id: string
  name: string
  description: string | null
  members?: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
  }>
  projects?: Array<{
    id: string
    name: string
    description: string | null
    color: string
    _count: {
      tasks: number
    }
  }>
  _count: {
    projects: number
    members: number
  }
}

