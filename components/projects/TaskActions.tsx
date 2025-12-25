"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import axios from "axios"

interface TaskActionsProps {
  taskId: string
  onEdit: () => void
  onDelete: () => void
  onDuplicate?: () => void
  onComplete?: () => void
}

export default function TaskActions({
  taskId,
  onEdit,
  onDelete,
  onDuplicate,
  onComplete,
}: TaskActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsDeleting(true)
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${taskId}`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      await axios.delete(url)
      toast.success("Task deleted successfully!")
      onDelete()
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to delete task"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  const handleDuplicate = async () => {
    if (onDuplicate) {
      onDuplicate()
      setIsOpen(false)
    }
  }

  const handleComplete = async () => {
    if (onComplete) {
      onComplete()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
            )}
            {onComplete && (
              <button
                onClick={handleComplete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </button>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}











