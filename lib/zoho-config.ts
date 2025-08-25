export const ZOHO_DATA_CENTERS = {
  US: {
    code: "us",
    name: "United States",
    accounts: "https://accounts.zoho.com",
    api: "https://www.zohoapis.com",
    meeting: "https://meeting.zoho.com",
    learn: "https://learn.zoho.com",
    mail: "https://mail.zoho.com",
    workdrive: "https://www.zohoapis.com",
  },
  EU: {
    code: "eu",
    name: "Europe",
    accounts: "https://accounts.zoho.eu",
    api: "https://www.zohoapis.eu",
    meeting: "https://meeting.zoho.eu",
    learn: "https://learn.zoho.eu",
    mail: "https://mail.zoho.eu",
    workdrive: "https://www.zohoapis.eu",
  },
  IN: {
    code: "in",
    name: "India",
    accounts: "https://accounts.zoho.in",
    api: "https://www.zohoapis.in",
    meeting: "https://meeting.zoho.in",
    learn: "https://learn.zoho.in",
    mail: "https://mail.zoho.in",
    workdrive: "https://www.zohoapis.in",
  },
  AU: {
    code: "au",
    name: "Australia",
    accounts: "https://accounts.zoho.com.au",
    api: "https://www.zohoapis.com.au",
    meeting: "https://meeting.zoho.com.au",
    learn: "https://learn.zoho.com.au",
    mail: "https://mail.zoho.com.au",
    workdrive: "https://www.zohoapis.com.au",
  },
  JP: {
    code: "jp",
    name: "Japan",
    accounts: "https://accounts.zoho.jp",
    api: "https://www.zohoapis.jp",
    meeting: "https://meeting.zoho.jp",
    learn: "https://learn.zoho.jp",
    mail: "https://mail.zoho.jp",
    workdrive: "https://www.zohoapis.jp",
  },
  CA: {
    code: "ca",
    name: "Canada",
    accounts: "https://accounts.zohocloud.ca",
    api: "https://www.zohoapis.ca",
    meeting: "https://meeting.zohocloud.ca",
    learn: "https://learn.zohocloud.ca",
    mail: "https://mail.zohocloud.ca",
    workdrive: "https://www.zohoapis.ca",
  },
  SA: {
    code: "sa",
    name: "Saudi Arabia",
    accounts: "https://accounts.zoho.sa",
    api: "https://www.zohoapis.sa",
    meeting: "https://meeting.zoho.sa",
    learn: "https://learn.zoho.sa",
    mail: "https://mail.zoho.sa",
    workdrive: "https://www.zohoapis.sa",
  },
  UK: {
    code: "uk",
    name: "United Kingdom",
    accounts: "https://accounts.zoho.uk",
    api: "https://www.zohoapis.uk",
    meeting: "https://meeting.zoho.uk",
    learn: "https://learn.zoho.uk",
    mail: "https://mail.zoho.uk",
    workdrive: "https://www.zohoapis.uk",
  },
} as const

export type DataCenterCode = keyof typeof ZOHO_DATA_CENTERS
export type DataCenter = (typeof ZOHO_DATA_CENTERS)[DataCenterCode]

export const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  redirectUri: process.env.ZOHO_REDIRECT_URI!,
  // Use global accounts endpoint for initial auth - will redirect to user's DC
  authUrl: "https://accounts.zoho.com/oauth/v2/auth",
  tokenUrl: "https://accounts.zoho.com/oauth/v2/token",
  scope:
    "WorkDrive.files.ALL,ZohoSearch.securesearch.READ,WorkDrive.team.READ,profile,ZohoMeeting.meeting.READ,ZohoMeeting.manageOrg.READ,ZohoMeeting.meetinguds.READ,ZohoFiles.files.READ,ZohoMeeting.recording.READ,WorkDrive.teamfolders.READ,ZohoMail.messages.READ",
  apiBaseUrl: "https://www.zohoapis.com", // Default to global, will be updated per user
}

export function getDataCenterByCode(code: string): DataCenter | null {
  const dcCode = code.toUpperCase() as DataCenterCode
  return ZOHO_DATA_CENTERS[dcCode] || null
}

export function getDataCenterByUrl(url: string): DataCenter | null {
  for (const dc of Object.values(ZOHO_DATA_CENTERS)) {
    if (url.includes(dc.accounts.replace("https://", "").replace("accounts.", ""))) {
      return dc
    }
  }
  return null
}

export async function getServerInfo(): Promise<Record<string, string>> {
  try {
    const response = await fetch("https://accounts.zoho.com/oauth/serverinfo")
    if (!response.ok) {
      throw new Error("Failed to fetch server info")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching server info:", error)
    return {}
  }
}

export interface ZohoTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface ZohoUser {
  email: string
  name: string
  id: string
}

export interface ZohoMeetingUser {
  zsoid: number
  meetingRedirectionServer: string
  primaryEmail: string
  fullName: string
  displayName: string
  orgName: string
  featureAvailability: {
    meeting: {
      meetingRecording: boolean
      recordingStorage: boolean
      [key: string]: any
    }
  }
}

export interface ZohoMeeting {
  meetingKey: string
  topic: string
  startTime: string
  endTime: string
  duration: number
  durationInHours: string
  joinLink: string
  presenterFullName: string
  presenterEmail: string
  isRecurring: boolean
  eventTime: string
  sysId: string
}

export interface ZohoRecording {
  erecordingId: string
  recordingId: string
  topic: string
  datenTime: string
  duration: number
  durationInMins: number
  fileSize: string
  downloadUrl: string
  transcriptionDownloadUrl?: string
  playUrl: string
  shareUrl: string
  creatorName: string
  meetingKey: string
  status: string
  isTranscriptGenerated: boolean
}

export interface ZohoWorkDriveUser {
  id: string
  display_name: string
  email_id: string
  privatespace: {
    id: string
    related_url: string
  }
}

export interface ZohoWorkDriveFile {
  id: string
  type: string
  attributes: {
    name: string
    created_time: string
    modified_time: string
    size_in_bytes: number
    file_size: string
    extension?: string
    is_folder: boolean
    shared_time?: string
    shared_by?: string
  }
  relationships?: {
    download?: {
      links?: {
        related?: string
      }
    }
  }
}
