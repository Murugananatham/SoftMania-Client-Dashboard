import { ZOHO_CONFIG, type ZohoTokens, type ZohoUser } from "./zoho-config"

export interface ZohoMeetingUser {
  zsoid: number
  primaryEmail: string
  fullName: string
  displayName: string
  orgName: string
  meetingRedirectionServer: string
  featureAvailability: {
    meeting: {
      meetingRecording: boolean
      files: boolean
      [key: string]: any
    }
  }
}

export interface ZohoMeeting {
  sessionKey: string
  topic: string
  startTime: string
  duration: number
  status: string
  participants?: any[]
  recordings?: any[]
}

export class ZohoClient {
  private accessToken: string
  private meetingUserInfo: ZohoMeetingUser | null = null

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async makeRequest(fullUrl: string, options: RequestInit = {}) {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: fullUrl,
      })
      throw new Error(`Zoho API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  private async getMeetingUserInfo(): Promise<ZohoMeetingUser> {
    if (this.meetingUserInfo) {
      return this.meetingUserInfo
    }

    try {
      // Try Indian region first
      let baseUrl = "https://meeting.zoho.in"
      let response = await fetch(`${baseUrl}/api/v2/user.json`, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      // If Indian region fails, try global region
      if (!response.ok && (response.status === 404 || response.status === 405)) {
        console.log("Indian region failed, trying global region...")
        baseUrl = "https://meeting.zoho.com"
        response = await fetch(`${baseUrl}/api/v2/user.json`, {
          method: "GET",
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok && response.status === 405) {
        console.log("Trying without .json extension...")
        response = await fetch(`${baseUrl}/api/v2/user`, {
          method: "GET",
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok && response.status === 405) {
        console.log("Trying POST method without .json...")
        response = await fetch(`${baseUrl}/api/v2/user`, {
          method: "POST",
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Meeting user info request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        throw new Error(`Failed to get meeting user info: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.meetingUserInfo = data.userDetails || data
      console.log("Meeting user info received:", {
        zsoid: this.meetingUserInfo?.zsoid,
        server: this.meetingUserInfo?.meetingRedirectionServer,
      })

      return this.meetingUserInfo
    } catch (error) {
      console.error("Error in getMeetingUserInfo:", error)
      throw error
    }
  }

  // User Details
  async getUserDetails(): Promise<ZohoUser> {
    try {
      const response = await fetch("https://accounts.zoho.in/oauth/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("User details request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: response.url,
        })
        throw new Error(`Failed to get user details: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log("User details received:", data)

      return {
        email: data.email,
        name: data.display_name || data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        id: data.user_id || data.id,
      }
    } catch (error) {
      console.error("Error in getUserDetails:", error)
      throw error
    }
  }

  async getMeetings() {
    try {
      const userInfo = await this.getMeetingUserInfo()
      const baseUrl = userInfo.meetingRedirectionServer.includes("zoho.in")
        ? "https://meeting.zoho.in"
        : "https://meeting.zoho.com"

      const params = new URLSearchParams({
        listtype: "all",
        index: "1",
        count: "100",
      })

      const response = await fetch(`${baseUrl}/api/v2/${userInfo.zsoid}/sessions.json?${params}`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      if (!response.ok) {
        console.error("Failed to get meetings:", response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log("Meetings API response:", data)
      const sessions = data.session || []

      return sessions.map((session: any) => ({
        meetingKey: session.meetingKey,
        topic: session.topic,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        durationInHours: session.durationInHours,
        joinLink: session.joinLink,
        presenterFullName: session.presenterFullName,
        presenterEmail: session.presenterEmail,
        presenterZuid: session.presenterZuid,
        creatorZuid: session.creatorZuid,
        timezone: session.timezone,
        meetingEmbedUrl: session.meetingEmbedUrl,
        pwd: session.pwd,
        encryptPwd: session.encryptPwd,
        sysId: session.sysId,
        eventTime: session.eventTime,
        isRecurring: session.isRecurring,
        sDate: session.sDate,
        sTime: session.sTime,
        timePeriod: session.timePeriod,
        startTimeMillis: session.startTimeMillis,
        startTimeMillisec: session.startTimeMillisec,
      }))
    } catch (error) {
      console.error("Error fetching meetings:", error)
      return []
    }
  }

  async getMeetingDetails(sessionKey: string) {
    try {
      const userInfo = await this.getMeetingUserInfo()
      const baseUrl = userInfo.meetingRedirectionServer.includes("zoho.in")
        ? "https://meeting.zoho.in"
        : "https://meeting.zoho.com"

      const response = await fetch(`${baseUrl}/api/v2/${userInfo.zsoid}/sessions/${sessionKey}.json`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      if (!response.ok) {
        console.error("Failed to get meeting details:", response.status, response.statusText)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching meeting details:", error)
      return null
    }
  }

  async getMeetingParticipants(sessionKey: string) {
    try {
      const userInfo = await this.getMeetingUserInfo()
      const baseUrl = userInfo.meetingRedirectionServer.includes("zoho.in")
        ? "https://meeting.zoho.in"
        : "https://meeting.zoho.com"

      const response = await fetch(`${baseUrl}/api/v2/${userInfo.zsoid}/sessions/${sessionKey}/participants.json`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      if (!response.ok) {
        console.error("Failed to get meeting participants:", response.status, response.statusText)
        return []
      }

      const data = await response.json()
      return data.participants || []
    } catch (error) {
      console.error("Error fetching meeting participants:", error)
      return []
    }
  }

  async getMeetingRecordings() {
    try {
      const userInfo = await this.getMeetingUserInfo()
      const baseUrl = userInfo.meetingRedirectionServer.includes("zoho.in")
        ? "https://meeting.zoho.in"
        : "https://meeting.zoho.com"

      const response = await fetch(`${baseUrl}/meeting/api/v2/${userInfo.zsoid}/recordings.json`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      if (!response.ok) {
        console.error("Failed to get recordings:", response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log("Recordings API response:", data)
      return data.recordings || []
    } catch (error) {
      console.error("Error fetching recordings:", error)
      return []
    }
  }

  async getSharedRecordings() {
    try {
      const userInfo = await this.getMeetingUserInfo()
      const baseUrl = userInfo.meetingRedirectionServer.includes("zoho.in")
        ? "https://meeting.zoho.in"
        : "https://meeting.zoho.com"

      let response = await fetch(`${baseUrl}/meeting/api/v2/${userInfo.zsoid}/sharedrecordings.json`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      // If that fails, try without the /meeting/ prefix
      if (!response.ok && response.status === 404) {
        response = await fetch(`${baseUrl}/api/v2/${userInfo.zsoid}/sharedrecordings.json`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
            "Content-Type": "application/json;charset=UTF-8",
          },
        })
      }

      if (!response.ok) {
        console.error("Failed to get shared recordings:", response.status, response.statusText)
        return []
      }

      const data = await response.json()
      console.log("Shared recordings API response:", data)
      return data.recordings || data.sharedRecordings || []
    } catch (error) {
      console.error("Error fetching shared recordings:", error)
      return []
    }
  }

  getRecordingDownloadUrl(erecordingId: string, region = "in"): string {
    const baseUrl = region === "in" ? "https://download-accl.zoho.com" : "https://download-accl.zoho.com"
    return `${baseUrl}/webdownload?event-id=${erecordingId}&x-service=meetinglab&x-cli-msg=`
  }

  async getWorkDriveUserInfo() {
    try {
      // Try Indian region first
      let response = await fetch("https://www.zohoapis.in/workdrive/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      // If Indian region fails, try global region
      if (!response.ok && response.status === 404) {
        console.log("Indian region failed for WorkDrive, trying global region...")
        response = await fetch("https://www.zohoapis.com/workdrive/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("WorkDrive user info request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        throw new Error(`Failed to get WorkDrive user info: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("WorkDrive user info received:", data)
      return data
    } catch (error) {
      console.error("Error in getWorkDriveUserInfo:", error)
      throw error
    }
  }

  async getWorkDrivePrivateSpace(userId: string) {
    try {
      // Try Indian region first
      let response = await fetch(`https://www.zohoapis.in/workdrive/api/v1/users/${userId}/privatespace`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      // If Indian region fails, try global region
      if (!response.ok && response.status === 404) {
        console.log("Indian region failed for WorkDrive privatespace, trying global region...")
        response = await fetch(`https://www.zohoapis.com/workdrive/api/v1/users/${userId}/privatespace`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("WorkDrive privatespace request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
        throw new Error(`Failed to get WorkDrive privatespace: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("WorkDrive privatespace received:", data)
      return data
    } catch (error) {
      console.error("Error in getWorkDrivePrivateSpace:", error)
      throw error
    }
  }

  async getSharedFiles(privatespaceId: string) {
    try {
      const sharedFiles: any[] = []
      const sharedFolders: any[] = []

      // Try Indian region first
      let baseUrl = "https://www.zohoapis.in"

      // Get shared files (incomingfiles)
      try {
        let response = await fetch(`${baseUrl}/workdrive/api/v1/privatespace/${privatespaceId}/incomingfiles`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })

        // If Indian region fails, try global region
        if (!response.ok && response.status === 404) {
          console.log("Indian region failed for shared files, trying global region...")
          baseUrl = "https://www.zohoapis.com"
          response = await fetch(`${baseUrl}/workdrive/api/v1/privatespace/${privatespaceId}/incomingfiles`, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          })
        }

        if (response.ok) {
          const filesData = await response.json()
          sharedFiles.push(...(filesData.data || []))
        }
      } catch (error) {
        console.error("Error fetching shared files:", error)
      }

      // Get shared folders (incomingfolders)
      try {
        const response = await fetch(`${baseUrl}/workdrive/api/v1/privatespace/${privatespaceId}/incomingfolders`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const foldersData = await response.json()
          sharedFolders.push(...(foldersData.data || []))
        }
      } catch (error) {
        console.error("Error fetching shared folders:", error)
      }

      // Return the raw API response structure for detailed display
      const allItems = [...sharedFiles, ...sharedFolders]
      console.log("Shared files and folders received:", allItems)
      return allItems
    } catch (error) {
      console.error("Error in getSharedFiles:", error)
      return []
    }
  }

  async getFolderContents(folderId: string) {
    try {
      // Try Indian region first
      let baseUrl = "https://www.zohoapis.in"

      let response = await fetch(`${baseUrl}/workdrive/api/v1/files/${folderId}/files`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      // If Indian region fails, try global region
      if (!response.ok && response.status === 404) {
        console.log("Indian region failed for folder contents, trying global region...")
        baseUrl = "https://www.zohoapis.com"
        response = await fetch(`${baseUrl}/workdrive/api/v1/files/${folderId}/files`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Folder contents request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          folderId,
        })
        throw new Error(`Failed to get folder contents: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Folder contents received:", data)
      return data.data || []
    } catch (error) {
      console.error("Error in getFolderContents:", error)
      return []
    }
  }

  async getWorkDriveFiles() {
    try {
      const data = await this.makeRequest("https://www.zohoapis.in/workdrive/api/v1/files")
      return data.data || []
    } catch (error) {
      console.error("Error fetching WorkDrive files:", error)
      return []
    }
  }

  async getLearnCourses() {
    try {
      const data = await this.makeRequest("https://learn.zoho.in/api/v1/courses")
      return data.courses || []
    } catch (error) {
      console.error("Error fetching Learn courses:", error)
      return []
    }
  }

  async getMailMessages() {
    try {
      // First get account information
      const accountsResponse = await fetch("https://mail.zoho.in/api/accounts", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!accountsResponse.ok) {
        console.error("Failed to get mail accounts:", accountsResponse.status, accountsResponse.statusText)
        return []
      }

      const accountsData = await accountsResponse.json()
      const accounts = accountsData.data || []

      if (accounts.length === 0) {
        console.log("No mail accounts found")
        return []
      }

      // Use the first account to fetch messages
      const accountId = accounts[0].accountId
      const data = await this.makeRequest(`https://mail.zoho.in/api/accounts/${accountId}/messages/view`)
      return data.data || []
    } catch (error) {
      console.error("Error fetching mail messages:", error)
      return []
    }
  }
}

export async function exchangeCodeForTokens(code: string): Promise<ZohoTokens> {
  const response = await fetch(ZOHO_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: ZOHO_CONFIG.clientId,
      client_secret: ZOHO_CONFIG.clientSecret,
      redirect_uri: ZOHO_CONFIG.redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Token exchange failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    })
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const tokens = await response.json()
  console.log("Token exchange successful:", {
    hasAccessToken: !!tokens.access_token,
    tokenType: tokens.token_type,
  })
  return tokens
}
