import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if we're in demo mode (client-side)
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/demo')
}

/**
 * Get the session ID from URL (client-side)
 */
export function getDemoSessionId(): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('session')
}

/**
 * Get the API base path based on demo mode
 */
export function getApiBasePath(): string {
  return isDemoMode() ? '/api/demo' : '/api'
}

/**
 * Build API URL with session ID if in demo mode
 */
export function buildApiUrl(endpoint: string, includeSession: boolean = true): string {
  const basePath = getApiBasePath()
  const url = `${basePath}${endpoint}`
  
  if (includeSession && isDemoMode()) {
    const sessionId = getDemoSessionId()
    if (sessionId) {
      const separator = endpoint.includes('?') ? '&' : '?'
      return `${url}${separator}sessionId=${sessionId}`
    }
  }
  
  return url
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}


