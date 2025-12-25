"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Plus, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import TaskCard from "./TaskCard"
import CreateTaskModal from "./CreateTaskModal"
import TaskDetailModal from "./TaskDetailModal"
import QuickTaskInput from "./QuickTaskInput"
import EmptyState from "./EmptyState"

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
  order: number
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

interface Column {
  id: string
  name: string
  order: number
  tasks: Task[]
}

interface Project {
  id: string
  name: string
  columns: Column[]
}

interface KanbanBoardProps {
  project: Project
}

export default function KanbanBoard({ project }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(project.columns)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [labelFilter, setLabelFilter] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Get all unique labels for filter dropdown
  const allLabels = useMemo(() => {
    const labelMap = new Map<string, { id: string; name: string; color: string }>()
    columns.forEach((column) => {
      column.tasks.forEach((task) => {
        task.labels?.forEach((tl) => {
          if (tl.label && !labelMap.has(tl.label.id)) {
            labelMap.set(tl.label.id, tl.label)
          }
        })
      })
    })
    return Array.from(labelMap.values())
  }, [columns])

  // Filter tasks based on search, priority, and labels
  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        const matchesSearch =
          !searchQuery ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = !priorityFilter || task.priority === priorityFilter
        const matchesLabel = !labelFilter || task.labels?.some(tl => tl.label.id === labelFilter)
        return matchesSearch && matchesPriority && matchesLabel
      }),
    }))
  }, [columns, searchQuery, priorityFilter, labelFilter])

  const onDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const onDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false)
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) {
      return
    }

    const task = sourceColumn.tasks.find((t) => t.id === draggableId)
    if (!task) {
      return
    }

    // Optimistic update
    const newColumns = [...columns]
    const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId)
    const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId)

    // Remove from source
    newColumns[sourceColIndex].tasks.splice(source.index, 1)
    
    // Map column name to TaskStatus enum
    const statusMap: Record<string, string> = {
      "To Do": "TODO",
      "In Progress": "IN_PROGRESS",
      "In Review": "IN_REVIEW",
      "Done": "DONE",
    }
    const newStatus = statusMap[destColumn.name] || "TODO"
    
    // Add to destination
    newColumns[destColIndex].tasks.splice(destination.index, 0, {
      ...task,
      status: newStatus,
    })

    setColumns(newColumns)

    // Update in database
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${draggableId}`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: destination.droppableId,
          order: destination.index,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast.success("Task moved successfully!")
    } catch (error) {
      // Silently handle error - user already sees toast notification
      toast.error("Failed to move task. Reverting...")
      // Revert on error
      setColumns(project.columns)
    }
  }, [columns, project.columns])

  const handleCreateTask = useCallback((columnId: string) => {
    setSelectedColumn(columnId)
    setIsCreateModalOpen(true)
  }, [])

  const handleTaskCreated = useCallback((newTask: Task) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === selectedColumn) {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          }
        }
        return col
      })
    )
    toast.success("Task created successfully!")
  }, [selectedColumn])

  const handleTaskUpdated = useCallback(() => {
    // Refresh the board - for now use reload, but this could be optimized
    // to fetch only the updated task and update state
    window.location.reload()
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    // Set state immediately for instant modal display
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }, [])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      const searchInput = document.getElementById("task-search")
      searchInput?.focus()
    }
    if (e.key === "Escape") {
      setSearchQuery("")
      setPriorityFilter(null)
      setLabelFilter(null)
    }
  }, [])

  // Add keyboard shortcut listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="task-search"
              placeholder="Search tasks... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={priorityFilter || ""}
              onChange={(e) => setPriorityFilter(e.target.value || null)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            {allLabels.length > 0 && (
              <select
                value={labelFilter || ""}
                onChange={(e) => setLabelFilter(e.target.value || null)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Labels</option>
                {allLabels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </select>
            )}
            {(searchQuery || priorityFilter || labelFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setPriorityFilter(null)
                  setLabelFilter(null)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className={`flex gap-4 overflow-x-auto pb-4 ${isDragging ? "cursor-grabbing" : ""}`}>
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({column.tasks.length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateTask(column.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 ${
                      snapshot.isDraggingOver
                        ? "bg-primary/10 rounded-lg transition-colors"
                        : ""
                    }`}
                  >
                    {column.tasks.length === 0 && !searchQuery && !priorityFilter && !labelFilter ? (
                      <EmptyState
                        title="No tasks yet"
                        description="Get started by creating a new task"
                        actionLabel="Add task"
                        onAction={() => handleCreateTask(column.id)}
                      />
                    ) : column.tasks.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                        No tasks match your filters
                      </div>
                    ) : (
                      column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging
                                ? "opacity-50 rotate-2"
                                : ""
                            }`}
                          >
                            <TaskCard 
                              task={{
                                ...task,
                                labels: task.labels?.map(tl => tl.label) || []
                              }}
                              onClick={() => handleTaskClick(task)}
                            />
                          </div>
                        )}
                      </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                    <QuickTaskInput
                      projectId={project.id}
                      columnId={column.id}
                      onTaskCreated={handleTaskCreated}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-2"
                      onClick={() => handleCreateTask(column.id)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add with details
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isCreateModalOpen && selectedColumn && (
        <CreateTaskModal
          projectId={project.id}
          columnId={selectedColumn}
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedColumn(null)
          }}
          onTaskCreated={handleTaskCreated}
        />
      )}

      <TaskDetailModal
        task={selectedTask ? {
          ...selectedTask,
          labels: selectedTask.labels?.map(tl => ({ label: tl.label })) || []
        } : null}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false)
          setSelectedTask(null)
        }}
        onUpdate={handleTaskUpdated}
      />
    </>
  )
}

