"use client"

import { useState, useEffect, useRef } from "react"
import { Paperclip, X, Download, File, Image as ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "axios"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedAt: string
}

interface FileAttachmentsProps {
  taskId: string
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return ImageIcon
  if (fileType.includes("pdf")) return FileText
  return File
}

export default function FileAttachments({ taskId }: FileAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const fetchAttachments = async () => {
    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${taskId}/attachments`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await axios.get(url)
      setAttachments(response.data.attachments || [])
    } catch (error) {
      // Silently handle error - component will show empty state
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/tasks/${taskId}/attachments`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setAttachments([response.data.attachment, ...attachments])
      toast.success("File uploaded successfully!")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to upload file"
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')
      const basePath = isDemo ? '/api/demo' : '/api'
      const sessionId = isDemo && typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('session')
        : null
      
      let url = `${basePath}/attachments/${attachmentId}`
      if (sessionId) url += `?sessionId=${sessionId}`
      
      await axios.delete(url)
      setAttachments(attachments.filter(a => a.id !== attachmentId))
      toast.success("File deleted successfully!")
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : "Failed to delete file"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Attachments ({attachments.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No attachments yet. Click "Upload File" to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.fileType)
            return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "p-2 rounded-lg",
                    attachment.fileType.startsWith("image/")
                      ? "bg-blue-100 dark:bg-blue-900/20"
                      : "bg-gray-100 dark:bg-gray-700"
                  )}>
                    <FileIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={attachment.fileUrl}
                    download={attachment.fileName}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </a>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


