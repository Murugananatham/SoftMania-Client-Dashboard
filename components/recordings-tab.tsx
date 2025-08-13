"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  Download,
  Play,
  Folder,
  File,
  Calendar,
  ExternalLink,
  ChevronRight,
  Home,
  ArrowLeft,
  Eye,
  FileVideo,
  FileImage,
  Music,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WorkDriveFile {
  id: string
  type: string
  attributes: {
    name: string
    display_html_name?: string
    is_folder: boolean
    type: string
    extn?: string
    storage_info?: {
      size?: string
      size_in_bytes?: number
    }
    created_time?: string
    modified_time?: string
    created_by?: string
    modified_by?: string
    creator_avatar_url?: string
    download_url?: string
    permalink?: string
    thumbnail_url?: string
    icon_class?: string
    lib_info?: {
      name?: string
    }
  }
}

interface BreadcrumbItem {
  id: string
  name: string
}

export function RecordingsTab() {
  const [files, setFiles] = useState<WorkDriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    fetchSharedFiles()
  }, [])

  const fetchSharedFiles = async (folderId?: string) => {
    setLoading(true)
    try {
      const url = folderId ? `/api/workdrive/folder-contents?folderId=${folderId}` : "/api/workdrive/shared-files"

      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        console.error("Error fetching files:", data.error)
        setFiles([])
      } else {
        const uniqueFiles = removeDuplicates(data.files || [])
        setFiles(uniqueFiles)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const removeDuplicates = (fileList: WorkDriveFile[]): WorkDriveFile[] => {
    const seen = new Set<string>()
    return fileList.filter((file) => {
      if (seen.has(file.id)) {
        return false
      }
      seen.add(file.id)
      return true
    })
  }

  const navigateToFolder = async (folder: WorkDriveFile) => {
    if (!folder.attributes.is_folder) return

    setCurrentFolderId(folder.id)
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.attributes.name }])
    await fetchFolderContents(folder.id)
  }

  const fetchFolderContents = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workdrive/folder-contents?folderId=${folderId}`)
      const data = await response.json()

      if (data.error) {
        console.error("Error fetching folder contents:", data.error)
        setFiles([])
      } else {
        const uniqueFiles = removeDuplicates(data.files || [])
        setFiles(uniqueFiles)
      }
    } catch (error) {
      console.error("Error fetching folder contents:", error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const navigateToBreadcrumb = async (index: number) => {
    const targetBreadcrumbs = breadcrumbs.slice(0, index + 1)
    setBreadcrumbs(targetBreadcrumbs)

    if (targetBreadcrumbs.length === 0) {
      setCurrentFolderId(null)
      fetchSharedFiles()
    } else {
      const targetFolderId = targetBreadcrumbs[targetBreadcrumbs.length - 1].id
      setCurrentFolderId(targetFolderId)
      fetchFolderContents(targetFolderId)
    }
  }

  const navigateBack = () => {
    if (breadcrumbs.length === 0) return

    const newBreadcrumbs = breadcrumbs.slice(0, -1)
    setBreadcrumbs(newBreadcrumbs)

    if (newBreadcrumbs.length === 0) {
      setCurrentFolderId(null)
      fetchSharedFiles()
    } else {
      const parentFolderId = newBreadcrumbs[newBreadcrumbs.length - 1].id
      setCurrentFolderId(parentFolderId)
      fetchFolderContents(parentFolderId)
    }
  }

  const navigateToRoot = () => {
    setCurrentFolderId(null)
    setBreadcrumbs([])
    fetchSharedFiles()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getFileIcon = (file: WorkDriveFile) => {
    const { attributes } = file

    if (attributes.is_folder) {
      return <Folder className="w-6 h-6 text-blue-500" />
    }

    const extension = attributes.extn?.toLowerCase()
    const iconClass = attributes.icon_class || attributes.type

    // Video files
    if (
      extension === "mp4" ||
      extension === "avi" ||
      extension === "mov" ||
      extension === "wmv" ||
      iconClass === "video"
    ) {
      return <FileVideo className="w-6 h-6 text-purple-600" />
    }

    // Image files
    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "gif" ||
      extension === "bmp" ||
      iconClass === "image"
    ) {
      return <FileImage className="w-6 h-6 text-pink-600" />
    }

    // Audio files
    if (extension === "mp3" || extension === "wav" || extension === "flac" || extension === "aac") {
      return <Music className="w-6 h-6 text-green-600" />
    }

    // Document types
    switch (iconClass) {
      case "writer":
        return <FileText className="w-6 h-6 text-blue-600" />
      case "sheet":
        return <File className="w-6 h-6 text-green-600" />
      case "show":
        return <Play className="w-6 h-6 text-orange-600" />
      case "pdf":
        return <FileText className="w-6 h-6 text-red-600" />
      default:
        return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const getFileTypeColor = (file: WorkDriveFile) => {
    const { attributes } = file

    if (attributes.is_folder) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"

    const extension = attributes.extn?.toLowerCase()
    const iconClass = attributes.icon_class || attributes.type

    if (extension === "mp4" || extension === "avi" || extension === "mov" || iconClass === "video") {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    }

    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "gif" ||
      iconClass === "image"
    ) {
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    }

    switch (iconClass) {
      case "writer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "sheet":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "pdf":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getFileTypeLabel = (file: WorkDriveFile) => {
    const { attributes } = file

    if (attributes.is_folder) return "Folder"
    if (attributes.type === "writer") return "Document"
    if (attributes.type === "sheet") return "Spreadsheet"
    if (attributes.type === "show") return "Presentation"
    if (attributes.extn) return attributes.extn.toUpperCase()
    return "File"
  }

  const isVideoFile = (file: WorkDriveFile) => {
    const extension = file.attributes.extn?.toLowerCase()
    return (
      extension === "mp4" ||
      extension === "avi" ||
      extension === "mov" ||
      extension === "wmv" ||
      file.attributes.icon_class === "video"
    )
  }

  const isImageFile = (file: WorkDriveFile) => {
    const extension = file.attributes.extn?.toLowerCase()
    return (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "gif" ||
      extension === "bmp" ||
      file.attributes.icon_class === "image"
    )
  }

  const isDocumentFile = (file: WorkDriveFile) => {
    const iconClass = file.attributes.icon_class || file.attributes.type
    return iconClass === "writer" || iconClass === "sheet" || iconClass === "show" || iconClass === "pdf"
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shared files and folders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Recordings & Notes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Files and folders shared with you from Zoho WorkDrive
          </p>
        </div>
        <Button
          onClick={() => fetchSharedFiles(currentFolderId || undefined)}
          variant="outline"
          size="sm"
          className="w-fit"
        >
          Refresh
        </Button>
      </div>

      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToRoot}
            className="h-8 px-2 flex-shrink-0 hover:bg-background"
          >
            <Home className="w-4 h-4" />
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          {/* Mobile: Show only last 2 breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden md:hidden">
            {breadcrumbs.length > 2 && (
              <>
                <span className="text-sm text-muted-foreground">...</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </>
            )}
            {breadcrumbs.slice(-2).map((crumb, index, arr) => (
              <div key={crumb.id} className="flex items-center gap-2">
                <button
                  onClick={() => navigateToBreadcrumb(breadcrumbs.length - arr.length + index)}
                  className="text-sm font-medium hover:text-blue-600 cursor-pointer truncate max-w-[120px]"
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
                {index < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Desktop: Show all breadcrumbs with truncation */}
          <div className="hidden md:flex items-center gap-2 overflow-hidden flex-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-sm font-medium hover:text-blue-600 cursor-pointer truncate max-w-[200px]"
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            className="h-8 px-2 ml-auto flex-shrink-0 hover:bg-background"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      )}

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No shared files or folders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Files shared with you in Zoho WorkDrive will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-all duration-200 hover:border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {file.attributes.thumbnail_url ? (
                        <div className="relative">
                          <img
                            src={file.attributes.thumbnail_url || "/placeholder.svg"}
                            alt={file.attributes.name || "File"}
                            className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                          <div className="hidden">{getFileIcon(file)}</div>
                        </div>
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle
                        className={`text-base md:text-lg leading-tight ${
                          file.attributes.is_folder ? "cursor-pointer hover:text-blue-600 transition-colors" : ""
                        }`}
                        title={file.attributes.name}
                        onClick={() => file.attributes.is_folder && navigateToFolder(file)}
                      >
                        <span className="line-clamp-2">
                          {file.attributes.display_html_name || file.attributes.name}
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className={`${getFileTypeColor(file)} text-xs`}>
                          {getFileTypeLabel(file)}
                        </Badge>
                        {!file.attributes.is_folder &&
                          file.attributes.storage_info?.size &&
                          file.attributes.storage_info.size !== "0 byte" && (
                            <span className="text-xs md:text-sm text-muted-foreground">
                              {file.attributes.storage_info.size}
                            </span>
                          )}
                        {file.attributes.lib_info?.name && (
                          <Badge variant="outline" className="text-xs">
                            {file.attributes.lib_info.name.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm">
                  {file.attributes.created_by && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-4 h-4 md:w-5 md:h-5">
                        <AvatarImage src={file.attributes.creator_avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {file.attributes.created_by
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">Created by {file.attributes.created_by}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    {formatDate(file.attributes.created_time)}
                  </span>
                  {file.attributes.modified_time && file.attributes.modified_time !== file.attributes.created_time && (
                    <span className="text-muted-foreground hidden sm:inline">
                      Modified {formatDate(file.attributes.modified_time)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  {file.attributes.is_folder && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => navigateToFolder(file)}
                      className="hover:bg-blue-600 transition-colors"
                    >
                      <Folder className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Open Folder</span>
                      <span className="sm:hidden">Open</span>
                    </Button>
                  )}
                  {file.attributes.permalink && (
                    <Button asChild size="sm" variant="default" className="hover:bg-blue-600 transition-colors">
                      <a href={file.attributes.permalink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Open in WorkDrive</span>
                        <span className="sm:hidden">WorkDrive</span>
                      </a>
                    </Button>
                  )}
                  {file.attributes.download_url && !file.attributes.is_folder && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="hover:bg-gray-50 transition-colors bg-transparent"
                    >
                      <a href={file.attributes.download_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                  {/* File-type-specific preview/play buttons */}
                  {!file.attributes.is_folder && (
                    <>
                      {isVideoFile(file) && file.attributes.thumbnail_url && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="hover:bg-purple-50 transition-colors bg-transparent"
                        >
                          <a href={file.attributes.thumbnail_url} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </a>
                        </Button>
                      )}
                      {isImageFile(file) && file.attributes.thumbnail_url && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="hover:bg-pink-50 transition-colors bg-transparent"
                        >
                          <a href={file.attributes.thumbnail_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </a>
                        </Button>
                      )}
                      {isDocumentFile(file) && file.attributes.thumbnail_url && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50 transition-colors bg-transparent"
                        >
                          <a href={file.attributes.thumbnail_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </a>
                        </Button>
                      )}
                    </>
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
