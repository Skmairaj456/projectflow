"use client"

import { useState, KeyboardEvent } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import axios from "axios"

interface QuickTaskInputProps {
  projectId: string
  columnId: string
  onTaskCreated: (task: any) => void
  placeholder?: string
}

export default function QuickTaskInput({
  projectId,
  columnId,
  onTaskCreated,
  placeholder = "Add a task... (Press Enter to save)",
}: QuickTaskInputProps) {
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setIsExpanded(false)
      return
    }

    setIsLoading(true)
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await axios.post(url, {
        title: title.trim(),
        projectId,
        columnId,
        priority: "MEDIUM",
      })

      if (response.data.task) {
        onTaskCreated(response.data.task)
        setTitle("")
        setIsExpanded(false)
        toast.success("Task created!")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      setTitle("")
      setIsExpanded(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        {placeholder}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task title..."
        autoFocus
        disabled={isLoading}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim()}
          className="flex-1"
        >
          {isLoading ? "Adding..." : "Add Task"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setTitle("")
            setIsExpanded(false)
          }}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}











