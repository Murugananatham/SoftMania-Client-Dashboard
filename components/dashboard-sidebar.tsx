"use client"

import { Calendar, FileText, GraduationCap, Mail, ExternalLink, LogOut, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
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

const menuItems = [
  {
    title: "Meetings",
    icon: Calendar,
    id: "meetings",
  },
  {
    title: "Files & Recordings",
    icon: FileText,
    id: "recordings",
  },
  {
    title: "Documents",
    icon: GraduationCap,
    id: "courses",
  },
  {
    title: "Mails",
    icon: Mail,
    id: "mail",
  },
  {
    title: "Reference Links",
    icon: ExternalLink,
    id: "references",
  },
]

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userName: string
  isMobileMenuOpen: boolean
  onMobileMenuToggle: () => void
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  userName,
  isMobileMenuOpen,
  onMobileMenuToggle,
}: DashboardSidebarProps) {
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId)
    if (isMobileMenuOpen) {
      onMobileMenuToggle()
    }
  }

  return (
    <>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={onMobileMenuToggle} />}

      <div
        className={`
        fixed sm:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        sm:transform-none
      `}
      >
        <Sidebar className="h-full border-r bg-background">
          <div className="sm:hidden absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <SidebarHeader>
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg font-bold">
                  <span className="text-green-600">Soft</span>
                  <span className="text-gray-800">Mania</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleTabChange(item.id)}
                        isActive={activeTab === item.id}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
                      >
                        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="group-hover:font-medium transition-all duration-200">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(true)}
              className="w-full cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-red-300 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="group-hover:font-medium transition-all duration-200">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
