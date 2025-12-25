"use client"

import { useState, useEffect } from "react"
import { X, Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Label {
  id: string
  name: string
  color: string
}

interface LabelPickerProps {
  taskId: string
  selectedLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
}

const defaultColors = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
]

export default function LabelPicker({ taskId, selectedLabels, onLabelsChange }: LabelPickerProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState(defaultColors[0])

  useEffect(() => {
    fetchLabels()
  }, [])

  const fetchLabels = async () => {
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/labels`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await axios.get(url)
      setLabels(response.data.labels || [])
    } catch (error) {
      // Silently handle error - component will show empty state
    }
  }

  const handleAddLabel = async (labelId: string) => {
    if (selectedLabels.some(l => l.id === labelId)) {
      return
    }

    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${taskId}/labels`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      await axios.post(url, { labelId })
      const label = labels.find(l => l.id === labelId)
      if (label) {
        onLabelsChange([...selectedLabels, label])
        toast.success("Label added")
      }
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to add label"
      toast.error(errorMessage)
    }
  }

  const handleRemoveLabel = async (labelId: string) => {
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${taskId}/labels?labelId=${labelId}`
      if (sessionId) url += `&sessionId=${sessionId}`
      
      await axios.delete(url)
      onLabelsChange(selectedLabels.filter(l => l.id !== labelId))
      toast.success("Label removed")
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to remove label"
      toast.error(errorMessage)
    }
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error("Label name is required")
      return
    }

    setIsCreating(true)
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/labels`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await axios.post(url, {
        name: newLabelName.trim(),
        color: newLabelColor,
      })
      const newLabel = response.data.label
      setLabels([...labels, newLabel])
      setNewLabelName("")
      setIsCreating(false)
      await handleAddLabel(newLabel.id)
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to create label"
      toast.error(errorMessage)
      setIsCreating(false)
    }
  }

  const availableLabels = labels.filter(
    label => !selectedLabels.some(selected => selected.id === label.id)
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {selectedLabels.map((label) => (
          <button
            key={label.id}
            onClick={() => handleRemoveLabel(label.id)}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white",
              "hover:opacity-80 transition-opacity"
            )}
            style={{ backgroundColor: label.color }}
          >
            <Tag className="h-3 w-3" />
            {label.name}
            <X className="h-3 w-3" />
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Label
        </Button>
      </div>

      {isOpen && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3 bg-white dark:bg-gray-800">
          {availableLabels.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Existing Labels
              </p>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleAddLabel(label.id)}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium text-white",
                      "hover:opacity-80 transition-opacity"
                    )}
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Create New Label
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateLabel()
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      className={cn(
                        "w-6 h-6 rounded border-2 transition-all",
                        newLabelColor === color
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateLabel}
                  disabled={isCreating || !newLabelName.trim()}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


