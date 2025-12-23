// Application constants
export const APP_NAME = "ProjectFlow"
export const APP_COMPANY = "ProjectPilot"
export const APP_DESCRIPTION = "Enterprise-grade project management with real-time collaboration"
export const APP_WEBSITE = "https://projectpilot.co.in"

// Task priorities
export const TASK_PRIORITIES = {
  LOW: { label: "Low", color: "bg-gray-500", textColor: "text-gray-700 dark:text-gray-300" },
  MEDIUM: { label: "Medium", color: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-300" },
  HIGH: { label: "High", color: "bg-orange-500", textColor: "text-orange-700 dark:text-orange-300" },
  URGENT: { label: "Urgent", color: "bg-red-500", textColor: "text-red-700 dark:text-red-300" },
} as const

// Task statuses
export const TASK_STATUSES = {
  TODO: { label: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 dark:bg-yellow-900" },
  DONE: { label: "Done", color: "bg-green-100 dark:bg-green-900" },
} as const

// Workspace roles
export const WORKSPACE_ROLES = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
} as const

// Project colors
export const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ef4444", // red
] as const

// Date formats
export const DATE_FORMATS = {
  SHORT: "MMM d, yyyy",
  LONG: "MMMM d, yyyy",
  DATETIME: "MMM d, yyyy 'at' h:mm a",
  TIME: "h:mm a",
} as const

