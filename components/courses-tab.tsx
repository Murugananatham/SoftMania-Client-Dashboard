"use client"

import { useEffect, useState } from "react"
import { BookOpen, ExternalLink, Calendar, Clock, Award, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: string
  title: string
  description?: string
  instructor?: string
  progress?: number
  status: "enrolled" | "completed" | "in_progress"
  enrollmentDate?: string
  completionDate?: string
  duration?: string
  url?: string
  certificateUrl?: string
}

export function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()

      if (data.error) {
        console.error("Error fetching courses:", data.error)
        setCourses([])
      } else {
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "enrolled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "enrolled":
        return "Enrolled"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assigned courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Material</h1>
          <p className="text-muted-foreground">Your assigned courses from Zoho Learn</p>
        </div>
        <Button onClick={fetchCourses} variant="outline">
          Refresh
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No assigned courses found</p>
            <p className="text-sm text-muted-foreground mt-2">Courses assigned to you in Zoho Learn will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      {course.description && <CardDescription className="mt-1">{course.description}</CardDescription>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className={getStatusColor(course.status)}>
                          {getStatusLabel(course.status)}
                        </Badge>
                        {course.duration && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.progress !== undefined && course.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {course.instructor && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {course.instructor}
                    </span>
                  )}
                  {course.enrollmentDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Enrolled {formatDate(course.enrollmentDate)}
                    </span>
                  )}
                  {course.completionDate && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Completed {formatDate(course.completionDate)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {course.url && (
                    <Button asChild size="sm" variant="default">
                      <a href={course.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open Course
                      </a>
                    </Button>
                  )}
                  {course.certificateUrl && course.status === "completed" && (
                    <Button asChild size="sm" variant="outline">
                      <a href={course.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Award className="w-4 h-4 mr-1" />
                        View Certificate
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
