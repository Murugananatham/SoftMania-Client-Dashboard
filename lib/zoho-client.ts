import { ZOHO_CONFIG, ZOHO_DATA_CENTERS, type ZohoTokens, type ZohoUser, type DataCenter, type DataCenterCode, getDataCenterByCode } from "./zoho-config"

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
  private dataCenter: DataCenter // Added data center property
  private apiDomain?: string // Added API domain from token response

  constructor(accessToken: string, dataCenter: DataCenter, apiDomain?: string) {
    this.accessToken = accessToken
    this.dataCenter = dataCenter
    this.apiDomain = apiDomain
  }

  private async makeRequest(endpoint: string, service: 'api' | 'meeting' | 'learn' | 'mail' | 'workdrive' = 'api', options: RequestInit = {}) {
    // Use apiDomain from token response if available, otherwise use data center URL
    let baseUrl: string
    if (this.apiDomain && service === 'api') {
      baseUrl = this.apiDomain
    } else {
      baseUrl = this.dataCenter[service]
    }
    
    const fullUrl = `${baseUrl}${endpoint}`
    
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
        dataCenter: this.dataCenter.code
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
      const response = await fetch(`${this.dataCenter.meeting}/api/v2/user.json`, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Meeting user info request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          dataCenter: this.dataCenter.code
        })
        throw new Error(`Failed to get meeting user info: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.meetingUserInfo = data.userDetails || data
      console.log("Meeting user info received:", {
        zsoid: this.meetingUserInfo?.zsoid,
        server: this.meetingUserInfo?.meetingRedirectionServer,
        dataCenter: this.dataCenter.code
      })
      this.meetingUserInfo = (data.userDetails || data) as ZohoMeetingUser
      return this.meetingUserInfo
    } catch (error) {
      console.error("Error in getMeetingUserInfo:", error)
      throw error
    }
  }

  async getUserDetails(): Promise<ZohoUser> {
    try {
      const response = await fetch(`${this.dataCenter.accounts}/oauth/v2/userinfo`, {
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
          dataCenter: this.dataCenter.code
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
      
      const params = new URLSearchParams({
        listtype: "all",
        index: "1",
        count: "100",
      })

      const response = await fetch(`${this.dataCenter.meeting}/api/v2/${userInfo.zsoid}/sessions.json?${params}`, {
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
      
      const response = await fetch(`${this.dataCenter.meeting}/api/v2/${userInfo.zsoid}/sessions/${sessionKey}.json`, {
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
      
      const response = await fetch(`${this.dataCenter.meeting}/api/v2/${userInfo.zsoid}/sessions/${sessionKey}/participants.json`, {
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
      
      const response = await fetch(`${this.dataCenter.meeting}/meeting/api/v2/${userInfo.zsoid}/recordings.json`, {
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
      
      let response = await fetch(`${this.dataCenter.meeting}/meeting/api/v2/${userInfo.zsoid}/sharedrecordings.json`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
      })

      // If that fails, try without the /meeting/ prefix
      if (!response.ok && response.status === 404) {
        response = await fetch(`${this.dataCenter.meeting}/api/v2/${userInfo.zsoid}/sharedrecordings.json`, {
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

  getRecordingDownloadUrl(erecordingId: string): string {
    // Use data center specific download URL
    const downloadDomain = this.dataCenter.code === 'in' ? 'download-accl.zoho.com' : 'download-accl.zoho.com'
    return `https://${downloadDomain}/webdownload?event-id=${erecordingId}&x-service=meetinglab&x-cli-msg=`
  }

  async getWorkDriveUserInfo() {
    try {
      const response = await fetch(`${this.dataCenter.workdrive}/workdrive/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("WorkDrive user info request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          dataCenter: this.dataCenter.code
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
      const response = await fetch(`${this.dataCenter.workdrive}/workdrive/api/v1/users/${userId}/privatespace`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("WorkDrive privatespace request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          dataCenter: this.dataCenter.code
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

      // Get shared files (incomingfiles)
      try {
        const response = await fetch(`${this.dataCenter.workdrive}/workdrive/api/v1/privatespace/${privatespaceId}/incomingfiles`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const filesData = await response.json()
          sharedFiles.push(...(filesData.data || []))
        }
      } catch (error) {
        console.error("Error fetching shared files:", error)
      }

      // Get shared folders (incomingfolders)
      try {
        const response = await fetch(`${this.dataCenter.workdrive}/workdrive/api/v1/privatespace/${privatespaceId}/incomingfolders`, {
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
      const response = await fetch(`${this.dataCenter.workdrive}/workdrive/api/v1/files/${folderId}/files`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Folder contents request failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          folderId,
          dataCenter: this.dataCenter.code
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
      const data = await this.makeRequest("/workdrive/api/v1/files", 'workdrive')
      return data.data || []
    } catch (error) {
      console.error("Error fetching WorkDrive files:", error)
      return []
    }
  }

  async getLearnCourses() {
    try {
      const data = await this.makeRequest("/api/v1/courses", 'learn')
      return data.courses || []
    } catch (error) {
      console.error("Error fetching Learn courses:", error)
      return []
    }
  }

  async getMailMessages() {
    try {
      // First get account information
      const accountsResponse = await fetch(`${this.dataCenter.mail}/api/accounts`, {
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
      const data = await this.makeRequest(`/api/accounts/${accountId}/messages/view`, 'mail')
      return data.data || []
    } catch (error) {
      console.error("Error fetching mail messages:", error)
      return []
    }
  }
}

export async function exchangeCodeForTokens(code: string, location?: string): Promise<{ tokens: ZohoTokens, dataCenter: DataCenter, apiDomain?: string }> {
  // Determine which data center to use for token exchange
  let tokenUrl = ZOHO_CONFIG.tokenUrl
  let dataCenter: DataCenter = ZOHO_DATA_CENTERS.US // ✅ fallback US
  
  if (location) {
    const dc = getDataCenterByCode(location)
    if (dc) {
      tokenUrl = `${dc.accounts}/oauth/v2/token`
      dataCenter = dc
    }
  }

  const response = await fetch(tokenUrl, {
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
      dataCenter: dataCenter.code
    })
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const tokens = await response.json()
  console.log("Token exchange successful:", {
    hasAccessToken: !!tokens.access_token,
    tokenType: tokens.token_type,
    dataCenter: dataCenter.code,
    apiDomain: tokens.api_domain
  })
  
  return { 
    tokens, 
    dataCenter,
    apiDomain: tokens.api_domain 
  }
}
