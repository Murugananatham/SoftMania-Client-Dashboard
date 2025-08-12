"use client"

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { MeetingsTab } from '@/components/meetings-tab'
import { RecordingsTab } from '@/components/recordings-tab'
import { CoursesTab } from '@/components/courses-tab'
import { MailTab } from '@/components/mail-tab'
import { ReferencesTab } from '@/components/references-tab'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('meetings')
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        redirect('/login')
      }
    } catch (error) {
      console.error('Session check failed:', error)
      redirect('/login')
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'meetings':
        return <MeetingsTab />
      case 'recordings':
        return <RecordingsTab />
      case 'courses':
        return <CoursesTab />
      case 'mail':
        return <MailTab />
      case 'references':
        return <ReferencesTab />
      default:
        return <MeetingsTab />
    }
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
    redirect('/login')
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          userName={user.name}
        />
        <SidebarInset className="flex-1">
          {renderTabContent()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
