"use client"

import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MeetingsTab } from "@/components/meetings-tab"
import { RecordingsTab } from "@/components/recordings-tab"
import { CoursesTab } from "@/components/courses-tab"
import { MailTab } from "@/components/mail-tab"
import { ReferencesTab } from "@/components/references-tab"
import { UserProfile } from "@/components/user-profile" // Added user profile import
import { Button } from "@/components/ui/button" // Added Button import
import { Menu } from "lucide-react" // Added Menu import
import { PremiumUserProfile } from "@/components/premium-user-profile" // Added premium user profile import

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("meetings")
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Added mobile menu state

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        redirect("/login")
      }
    } catch (error) {
      console.error("Session check failed:", error)
      redirect("/login")
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      // case "meetings":
      //   return <MeetingsTab />
      case "recordings":
        return <RecordingsTab />
      case "courses":
        return <CoursesTab />
      // case "mail":
      //   return <MailTab />
      // case "references":
      //   return <ReferencesTab />
      case "profile": // Added profile tab case
        return <UserProfile />
      default:
        return <RecordingsTab />
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen) // Added mobile menu toggle function
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect("/login")
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userName={user.name}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={toggleMobileMenu}
        />

        <div className="flex-1 flex flex-col">
          <div className="sm:hidden flex items-center justify-between p-4 border-b bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
              <span className="ml-2">Menu</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">
                <span className="text-green-600">Soft</span>
                <span className="text-gray-800">Mania</span>
              </div>
              <PremiumUserProfile />
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-end p-4 border-b bg-background">
            <PremiumUserProfile />
          </div>

          {/* Main content */}
          <SidebarInset className="flex-1">{renderTabContent()}</SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
