"use client"

import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import { useEffect, useState } from "react"

interface DataCenter {
  code: string
  name: string
}

export function DataCenterIndicator() {
  const [dataCenter, setDataCenter] = useState<DataCenter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          setDataCenter(data.dataCenter)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  if (loading || !dataCenter) {
    return null
  }

  const getRegionColor = (code: string) => {
    switch (code.toLowerCase()) {
      case "us":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "eu":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "au":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "jp":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "ca":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case "sa":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "uk":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getRegionColor(dataCenter.code)}`}>
      <Globe className="h-3 w-3" />
      <span className="text-xs font-medium">
        {dataCenter.code.toUpperCase()} - {dataCenter.name}
      </span>
    </Badge>
  )
}
