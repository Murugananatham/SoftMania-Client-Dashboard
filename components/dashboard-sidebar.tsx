"use client"

import { Calendar, FileText, GraduationCap, Mail, ExternalLink, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    title: 'Meetings',
    icon: Calendar,
    id: 'meetings'
  },
  {
    title: 'Recordings & Notes',
    icon: FileText,
    id: 'recordings'
  },
  {
    title: 'Course Material',
    icon: GraduationCap,
    id: 'courses'
  },
  {
    title: 'Mails',
    icon: Mail,
    id: 'mail'
  },
  {
    title: 'Reference Links',
    icon: ExternalLink,
    id: 'references'
  }
]

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userName: string
}

export function DashboardSidebar({ activeTab, onTabChange, userName }: DashboardSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Zoho Dashboard</h2>
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
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
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
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
