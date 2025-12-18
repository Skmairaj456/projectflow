"use client"

import { useState, useMemo, memo } from "react"
import { formatDate } from "@/lib/utils"
import { Calendar, MessageSquare, Paperclip, User, Clock, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface Label {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  assignee: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  labels?: Label[]
  _count: {
    comments: number
    attachments: number
  }
}

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Memoize date calculations to avoid recreating on every render
  const { dueDate, isOverdue, isDueSoon } = useMemo(() => {
    const due = task.dueDate ? new Date(task.dueDate) : null
    const now = new Date()
    const overdue = due && due < now && task.status !== "DONE"
    const dueSoon = due && due > now && due <= new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return { dueDate: due, isOverdue: overdue, isDueSoon: dueSoon }
  }, [task.dueDate, task.status])

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm transition-all cursor-pointer border",
        isHovered 
          ? "shadow-lg border-primary/50 scale-[1.02]" 
          : "border-gray-200 dark:border-gray-600 hover:border-primary/30",
        isOverdue && "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"
      )}
    >
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              priorityColors[task.priority as keyof typeof priorityColors] ||
                priorityColors.MEDIUM
            )}
          >
            {task.priority}
          </span>

          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isOverdue
                  ? "text-red-600 dark:text-red-400"
                  : isDueSoon
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {isOverdue ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              {formatDate(task.dueDate)}
              {isOverdue && " (Overdue)"}
              {isDueSoon && " (Due soon)"}
            </div>
          )}

          {task.labels && task.labels.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${label.color}20`,
                    borderColor: label.color,
                    color: label.color,
                  }}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            {task.assignee ? (
              <div className="flex items-center gap-1">
                {task.assignee.image ? (
                  <img
                    src={task.assignee.image}
                    alt={task.assignee.name || ""}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {task.assignee.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-400" />
              </div>
            )}

            {task._count.comments > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-3 w-3" />
                {task._count.comments}
              </div>
            )}

            {task._count.attachments > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Paperclip className="h-3 w-3" />
                {task._count.attachments}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(TaskCard, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate?.getTime() === nextProps.task.dueDate?.getTime() &&
    prevProps.task.assignee?.id === nextProps.task.assignee?.id &&
    prevProps.task._count.comments === nextProps.task._count.comments &&
    prevProps.task._count.attachments === nextProps.task._count.attachments &&
    JSON.stringify(prevProps.task.labels) === JSON.stringify(nextProps.task.labels)
  )
})
