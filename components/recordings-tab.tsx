"use client"

import { useEffect, useState } from 'react'
import { FileText, Download, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Recording {
  id: string
  name: string
  type: string
  size: number
  created_time: string
  download_url?: string
  preview_url?: string
}

export function RecordingsTab() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/workdrive')
      const data = await response.json()
      setRecordings(data.files || [])
    } catch (error) {
      console.error('Error fetching recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="p-6">Loading recordings and notes...</div>
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recordings & Notes</h1>
        <Button onClick={fetchRecordings} variant="outline">
          Refresh
        </Button>
      </div>

      {recordings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No recordings or notes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordings.map((recording) => (
            <Card key={recording.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {recording.name}
                </CardTitle>
                <CardDescription>
                  {recording.type} • {formatFileSize(recording.size)} • 
                  Created {new Date(recording.created_time).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {recording.preview_url && (
                    <Button asChild size="sm" variant="outline">
                      <a href={recording.preview_url} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </a>
                    </Button>
                  )}
                  {recording.download_url && (
                    <Button asChild size="sm">
                      <a href={recording.download_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        Download
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
