"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { X, Calendar, User, MessageSquare, Paperclip, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import axios from "axios"
import toast from "react-hot-toast"

// Lazy load heavy components for faster initial render
const LabelPicker = lazy(() => import("./LabelPicker"))
const FileAttachments = lazy(() => import("./FileAttachments"))

interface Label {
  id: string
  name: string
  color: string
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  assignee: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  labels?: Array<{
    label: Label
  }>
  _count: {
    comments: number
    attachments: number
  }
}

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  IN_REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [taskLabels, setTaskLabels] = useState<Label[]>([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setTaskLabels(task.labels?.map(tl => tl.label) || [])
    }
  }, [task])

  // Cleanup body scroll lock when modal closes
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !task) return null

  const handleSave = async () => {
    try {
      await axios.patch(`/api/tasks/${task.id}`, {
        title,
        description,
      })
      toast.success("Task updated successfully")
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setIsDeleting(true)
    try {
      await axios.delete(`/api/tasks/${task.id}`)
      toast.success("Task deleted successfully")
      document.body.style.overflow = 'unset'
      onClose()
      onUpdate()
    } catch (error) {
      toast.error("Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    document.body.style.overflow = 'unset'
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        style={{ animation: 'slideUp 0.15s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white"
              autoFocus
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
          )}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status as keyof typeof statusColors] || statusColors.TODO}`}>
              {task.status.replace("_", " ")}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM}`}>
              {task.priority}
            </span>
          </div>

          {/* Labels */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </h3>
            <Suspense fallback={
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading labels...</span>
              </div>
            }>
              <LabelPicker
                taskId={task.id}
                selectedLabels={taskLabels}
                onLabelsChange={(labels) => {
                  setTaskLabels(labels)
                  onUpdate()
                }}
              />
            </Suspense>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
            )}

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assigned to
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee.name || task.assignee.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Suspense fallback={
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading attachments...</span>
              </div>
            }>
              <FileAttachments taskId={task.id} />
            </Suspense>
          </div>

          {/* Comments */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-semibold">{task._count.comments} comments</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comments feature coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

