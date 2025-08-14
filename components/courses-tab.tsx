"use client"

import { ExternalLink, FileText, Folder, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CoursesTab() {
  const documentsUrl = "https://public-documents.softmania.in/k?view=shared"

  const openDocuments = () => {
    window.open(documentsUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Shared documents and resources</p>
        </div>
        <Button onClick={openDocuments} className="bg-blue-600 hover:bg-blue-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Documents
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Documents Card */}
          <Card className="mb-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Shared Document Library</CardTitle>
              <CardDescription className="text-base">
                Access your shared documents, resources, and files
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Click the button below to open the document library in a new tab. This ensures the best viewing
                experience and full functionality.
              </p>
              <Button onClick={openDocuments} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Document Library
              </Button>
            </CardContent>
          </Card>
          
          {/* Info Note */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Opens in New Tab</h4>
                <p className="text-sm text-amber-700">
                  For security reasons, the document library opens in a separate tab. This ensures full functionality
                  and the best user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
