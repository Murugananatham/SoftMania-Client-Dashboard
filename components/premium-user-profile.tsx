"use client"

import { useState, useEffect } from "react"
import { User, Mail, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface UserData {
  display_name: string
  email_id: string
  avatar_url?: string
  zid: string
  edition?: string
}

export function PremiumUserProfile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/workdrive/user-info")
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.attributes) {
          setUser({
            display_name: data.data.attributes.display_name,
            email_id: data.data.attributes.email_id,
            avatar_url: data.data.attributes.avatar_url,
            zid: data.data.attributes.zid,
            edition: data.data.attributes.edition,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-auto p-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md rounded-lg"
          >
            <Avatar className="w-6 h-6 ring-2 ring-blue-100 dark:ring-blue-900">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
                {getInitials(user.display_name)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-0">
          
          <div className="p-2">
            <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              Account Details
            </DropdownMenuLabel>

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Profile</p>
                <p className="text-xs text-gray-500 truncate">{user.display_name}</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
              <Mail className="w-4 h-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-gray-500 truncate">{user.email_id}</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              className="flex items-center gap-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
