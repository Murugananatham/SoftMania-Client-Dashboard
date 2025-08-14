"use client"

import { useEffect, useState } from "react"
import { User, Mail, Calendar, MapPin, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  email: string
  name?: string
  avatar_url?: string
  organization?: string
  department?: string
  location?: string
  joined_date?: string
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user")
      const data = await response.json()

      if (data.error) {
        console.error("Error fetching user profile:", data.error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Unable to load user profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">User Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground">Your account information and details</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 md:w-20 md:h-20">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name || "User"} />
              <AvatarFallback className="text-lg md:text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(profile.name, profile.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg md:text-xl">{profile.name || "User"}</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground truncate">{profile.email}</p>
              {profile.department && (
                <Badge variant="secondary" className="mt-2">
                  {profile.department}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>

            {profile.organization && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Organization</p>
                  <p className="text-sm text-muted-foreground truncate">{profile.organization}</p>
                </div>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground truncate">{profile.location}</p>
                </div>
              </div>
            )}

            {profile.joined_date && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile.joined_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
