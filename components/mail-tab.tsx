"use client"

import { useEffect, useState } from 'react'
import { Mail, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MailMessage {
  id: string
  subject: string
  from: string
  date: string
  preview: string
  read: boolean
  url: string
}

export function MailTab() {
  const [messages, setMessages] = useState<MailMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/mail')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading mail...</div>
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mail</h1>
        <Button onClick={fetchMessages} variant="outline">
          Refresh
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No recent messages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id} className={message.read ? 'opacity-75' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{message.subject}</CardTitle>
                  {!message.read && <Badge>New</Badge>}
                </div>
                <CardDescription>
                  From: {message.from} • {new Date(message.date).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {message.preview}
                </p>
                
                <Button asChild size="sm" variant="outline">
                  <a href={message.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open in Zoho Mail
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
