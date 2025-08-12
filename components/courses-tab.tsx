"use client"

import { useEffect, useState } from 'react'
import { GraduationCap, BookOpen, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Course {
  id: string
  title: string
  description: string
  progress: number
  duration: string
  status: string
  url: string
  instructor?: string
}

export function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading courses...</div>
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Material</h1>
        <Button onClick={fetchCourses} variant="outline">
          Refresh
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No courses assigned</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  {course.instructor && (
                    <span>Instructor: {course.instructor}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{course.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="w-full" />
                </div>

                <Button asChild size="sm">
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Continue Learning
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
