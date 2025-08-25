"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  Download,
  Folder,
  File,
  ExternalLink,
  ChevronRight,
  Home,
  ArrowLeft,
  FileVideo,
  FileImage,
  Music,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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

interface FolderContents {
  [folderId: string]: WorkDriveFile[]
}

export function RecordingsTab() {
  const [files, setFiles] = useState<WorkDriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [previewFile, setPreviewFile] = useState<WorkDriveFile | null>(null)
  const [showDownloadButtons, setShowDownloadButtons] = useState(false)
  const [folderContentsCache, setFolderContentsCache] = useState<FolderContents>({})
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set())

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

  const fetchFolderContentsForDropdown = async (folderId: string) => {
    if (folderContentsCache[folderId] || loadingFolders.has(folderId)) {
      return folderContentsCache[folderId] || []
    }

    setLoadingFolders((prev) => new Set(prev).add(folderId))

    try {
      const response = await fetch(`/api/workdrive/folder-contents?folderId=${folderId}`)
      const data = await response.json()

      if (!data.error && data.files) {
        const uniqueFiles = removeDuplicates(data.files)
        setFolderContentsCache((prev) => ({
          ...prev,
          [folderId]: uniqueFiles,
        }))
        return uniqueFiles
      }
    } catch (error) {
      console.error("Error fetching folder contents for dropdown:", error)
    } finally {
      setLoadingFolders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(folderId)
        return newSet
      })
    }

    return []
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

  const handleFileClick = (file: WorkDriveFile) => {
    if (file.attributes.is_folder) {
      navigateToFolder(file)
    } else {
      if (file.attributes.permalink) {
        window.open(file.attributes.permalink, "_blank", "noopener,noreferrer")
      }
    }
  }

  const BreadcrumbDropdown = ({ crumb, index }: { crumb: BreadcrumbItem; index: number }) => {
    const [dropdownContents, setDropdownContents] = useState<WorkDriveFile[]>([])
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenChange = async (open: boolean) => {
      setIsOpen(open)
      if (open && dropdownContents.length === 0) {
        const contents = await fetchFolderContentsForDropdown(crumb.id)
        setDropdownContents(contents)
      }
    }

    const handleItemClick = (file: WorkDriveFile) => {
      setIsOpen(false)
      handleFileClick(file)
    }

    return (
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateToBreadcrumb(index)}
            className="text-sm font-medium hover:text-blue-600 cursor-pointer truncate max-w-[200px] transition-colors"
            title={crumb.name}
          >
            {crumb.name}
          </button>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-50 transition-colors">
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
          {loadingFolders.has(crumb.id) ? (
            <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
          ) : dropdownContents.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">No items found</div>
          ) : (
            <>
              {dropdownContents
                .filter((file) => file.attributes.is_folder)
                .map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => handleItemClick(folder)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{folder.attributes.name}</span>
                  </DropdownMenuItem>
                ))}
              {dropdownContents.filter((file) => file.attributes.is_folder).length > 0 &&
                dropdownContents.filter((file) => !file.attributes.is_folder).length > 0 && <DropdownMenuSeparator />}
              {dropdownContents
                .filter((file) => !file.attributes.is_folder)
                .map((file) => (
                  <DropdownMenuItem
                    key={file.id}
                    onClick={() => handleItemClick(file)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {getFileIcon(file)}
                    <span className="truncate">{file.attributes.name}</span>
                  </DropdownMenuItem>
                ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        // year: "numeric",
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
      return <Folder className="w-5 h-5 text-blue-500" />
    }
    const extension = attributes.extn?.toLowerCase()
    const iconClass = attributes.icon_class || attributes.type

    if (
      extension === "mp4" ||
      extension === "avi" ||
      extension === "mov" ||
      extension === "wmv" ||
      iconClass === "video"
    ) {
      return <FileVideo className="w-5 h-5 text-purple-600" />
    }
    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png" ||
      extension === "gif" ||
      extension === "bmp" ||
      iconClass === "image"
    ) {
      return <FileImage className="w-5 h-5 text-pink-600" />
    }
    if (extension === "mp3" || extension === "wav" || extension === "flac" || extension === "aac") {
      return <Music className="w-5 h-5 text-green-600" />
    }

    switch (iconClass) {
      case "writer":
        return <FileText className="w-5 h-5 text-blue-600" />
      case "sheet":
        return <File className="w-5 h-5 text-green-600" />
      case "show":
        return <FileText className="w-5 h-5 text-orange-600" />
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
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
    if (attributes.type === "writer") return "DOCUMENT"
    if (attributes.type === "sheet") return "ZSHEET"
    if (attributes.type === "show") return "SHOW"
    if (attributes.extn) return attributes.extn.toUpperCase()
    return "FILE"
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

  const isAudioFile = (file: WorkDriveFile) => {
    const extension = file.attributes.extn?.toLowerCase()
    return extension === "mp3" || extension === "wav" || extension === "flac" || extension === "aac"
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
          <h1 className="text-xl md:text-2xl font-bold">Files & Recordings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Files and folders shared with you from Zoho WorkDrive
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchSharedFiles(currentFolderId || undefined)}
            variant="outline"
            size="sm"
            className="w-fit"
          >
            Refresh
          </Button>
        </div>
      </div>

      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToRoot}
            className="h-8 px-2 flex-shrink-0 hover:bg-background cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          <div className="flex items-center gap-2 overflow-hidden md:hidden">
            {breadcrumbs.length > 2 && (
              <>
                <span className="text-sm text-muted-foreground">...</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </>
            )}
            {breadcrumbs.slice(-2).map((crumb, index, arr) => (
              <div key={crumb.id} className="flex items-center gap-2">
                <BreadcrumbDropdown crumb={crumb} index={breadcrumbs.length - arr.length + index} />
                {index < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 overflow-hidden flex-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-2 min-w-0">
                <BreadcrumbDropdown crumb={crumb} index={index} />
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
            className="h-8 px-2 ml-auto flex-shrink-0 hover:bg-background cursor-pointer"
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
        <div className="grid gap-3">
          {files.map((file) => (
            <Card
              key={file.id}
              className="hover:shadow-lg transition-all duration-300 hover:border-blue-200 cursor-pointer group relative p-4"
              onClick={() => handleFileClick(file)}
            >
              {file.attributes.permalink && (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hover:bg-blue-50 p-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={file.attributes.permalink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0">{getFileIcon(file)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base leading-tight hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                    {file.attributes.display_html_name || file.attributes.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                    <Badge variant="secondary" className={`${getFileTypeColor(file)} text-xs px-2 py-0.5`}>
                      {getFileTypeLabel(file)}
                    </Badge>
                    {!file.attributes.is_folder &&
                      file.attributes.storage_info?.size &&
                      file.attributes.storage_info.size !== "0 byte" && (
                        <span className="text-xs">{file.attributes.storage_info.size}</span>
                      )}
                    {file.attributes.created_time && (
                      <span className="text-xs">Created {formatDate(file.attributes.created_time)}</span>
                    )}
                    {file.attributes.modified_time &&
                      file.attributes.modified_time !== file.attributes.created_time && (
                        <span className="text-xs">Modified {formatDate(file.attributes.modified_time)}</span>
                      )}
                  </div>
                </div>
              </div>

              {showDownloadButtons && file.attributes.download_url && !file.attributes.is_folder && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="hover:bg-gray-50 transition-colors bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={file.attributes.download_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
