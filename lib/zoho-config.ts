export const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  redirectUri: process.env.ZOHO_REDIRECT_URI!,
  authUrl: "https://accounts.zoho.in/oauth/v2/auth",
  tokenUrl: "https://accounts.zoho.in/oauth/v2/token",
  scope:
    "ZohoMeeting.meeting.READ,ZohoMeeting.manageOrg.READ,ZohoMeeting.meetinguds.READ,ZohoFiles.files.READ,ZohoMeeting.recording.READ,WorkDrive.files.ALL,ZohoMail.messages.READ,profile",
  apiBaseUrl: "https://www.zohoapis.in",
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
