"use client"

import { Bell, Search, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "./ThemeToggle"
import { signOut } from "next-auth/react"

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const displayUser = user || { name: "Demo User", email: "demo@projectflow.com", image: null }
  
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Search projects, tasks..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />

          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-2">
              {displayUser.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-8 w-8 rounded-full"
                  src={displayUser.image}
                  alt={displayUser.name || "User"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {displayUser.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                  {displayUser.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden lg:block">
                  {displayUser.email}
                </p>
              </div>
            </div>

            {user ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                title="Sign out"
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}


