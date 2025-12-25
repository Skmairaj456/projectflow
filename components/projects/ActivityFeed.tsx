"use client"

import { useState, useEffect } from "react"
import { Activity, User, MessageSquare, Paperclip, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import axios from "axios"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface ActivityFeedProps {
  projectId: string
  taskId?: string
}

const activityIcons = {
  TASK_CREATED: CheckCircle2,
  TASK_UPDATED: Activity,
  TASK_DELETED: XCircle,
  TASK_ASSIGNED: User,
  TASK_MOVED: ArrowRight,
  COMMENT_ADDED: MessageSquare,
  ATTACHMENT_ADDED: Paperclip,
}

const activityColors = {
  TASK_CREATED: "text-green-600 dark:text-green-400",
  TASK_UPDATED: "text-blue-600 dark:text-blue-400",
  TASK_DELETED: "text-red-600 dark:text-red-400",
  TASK_ASSIGNED: "text-purple-600 dark:text-purple-400",
  TASK_MOVED: "text-orange-600 dark:text-orange-400",
  COMMENT_ADDED: "text-indigo-600 dark:text-indigo-400",
  ATTACHMENT_ADDED: "text-pink-600 dark:text-pink-400",
}

export default function ActivityFeed({ projectId, taskId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, taskId])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/activities?projectId=${projectId}`
      if (taskId) url += `&taskId=${taskId}`
      if (sessionId) url += `&sessionId=${sessionId}`
      
      const response = await axios.get(url)
      setActivities(response.data.activities || [])
    } catch (error) {
      // Silently handle error - component will show empty state
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No activity yet. Activity will appear here as you work on tasks.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Activity
        const iconColor = activityColors[activity.type as keyof typeof activityColors] || "text-gray-600"

        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {activity.user.image ? (
                <img
                  src={activity.user.image}
                  alt={activity.user.name || ""}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {activity.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">
                      {activity.user.name || activity.user.email || "Unknown user"}
                    </span>{" "}
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


