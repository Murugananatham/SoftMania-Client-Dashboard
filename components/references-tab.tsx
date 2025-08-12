"use client"

import { ExternalLink, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const referenceLinks = [
  {
    id: '1',
    title: 'Company Handbook',
    description: 'Complete guide to company policies and procedures',
    url: 'https://example.com/handbook',
    category: 'Documentation'
  },
  {
    id: '2',
    title: 'Training Resources',
    description: 'Additional learning materials and tutorials',
    url: 'https://example.com/training',
    category: 'Learning'
  },
  {
    id: '3',
    title: 'Support Portal',
    description: 'Get help and submit support tickets',
    url: 'https://example.com/support',
    category: 'Support'
  },
  {
    id: '4',
    title: 'Team Directory',
    description: 'Contact information for all team members',
    url: 'https://example.com/directory',
    category: 'Directory'
  }
]

export function ReferencesTab() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reference Links</h1>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>

      <div className="grid gap-4">
        {referenceLinks.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <CardTitle className="text-lg">{link.title}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Category: {link.category}
                </span>
                <Button asChild size="sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Link
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
