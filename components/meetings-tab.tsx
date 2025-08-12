"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, Users, Video, Download, Eye, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Meeting {
  meetingKey: string
  topic: string
  startTime: string
  endTime: string
  duration: number
  durationInHours: string
  joinLink: string
  presenterFullName: string
  presenterEmail: string
  eventTime: string
  sysId: string
  isRecurring: boolean
  pwd: string
}

interface Recording {
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

interface Participant {
  name: string
  email: string
  joinTime: string
  leaveTime?: string
  duration: number
}

export function MeetingsTab() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [sharedRecordings, setSharedRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [meetingsRes, recordingsRes, sharedRecordingsRes] = await Promise.allSettled([
        fetch("/api/meetings").then((res) => res.json()),
        fetch("/api/meetings/recordings").then((res) => res.json()),
        fetch("/api/meetings/shared-recordings").then((res) => res.json()),
      ])

      if (meetingsRes.status === "fulfilled" && !meetingsRes.value.error) {
        setMeetings(meetingsRes.value.meetings || [])
      }

      if (recordingsRes.status === "fulfilled" && !recordingsRes.value.error) {
        setRecordings(recordingsRes.value.recordings || [])
      }

      if (sharedRecordingsRes.status === "fulfilled" && !sharedRecordingsRes.value.error) {
        setSharedRecordings(sharedRecordingsRes.value.recordings || [])
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async (meetingKey: string) => {
    setLoadingParticipants(true)
    try {
      const response = await fetch(`/api/meetings/${meetingKey}/participants`)
      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error("Error fetching participants:", error)
      setParticipants([])
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleViewDetails = async (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    await fetchParticipants(meeting.meetingKey)
  }

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatRecordingDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Button onClick={fetchAllData} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="meetings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="recordings">My Recordings</TabsTrigger>
          <TabsTrigger value="shared">Shared Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No meetings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {meetings.map((meeting) => (
                <Card key={meeting.meetingKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                      <Badge variant={meeting.eventTime === "Later" ? "default" : "secondary"}>
                        {meeting.eventTime}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.durationInHours}
                      </span>
                      <span className="text-sm text-muted-foreground">by {meeting.presenterFullName}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {meeting.joinLink && (
                        <Button asChild size="sm">
                          <a href={meeting.joinLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(meeting)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedMeeting?.topic}</DialogTitle>
                            <DialogDescription>Meeting details and participants</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Meeting Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Start Time:</span>
                                  <p>{selectedMeeting?.startTime}</p>
                                </div>
                                <div>
                                  <span className="font-medium">End Time:</span>
                                  <p>{selectedMeeting?.endTime}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span>
                                  <p>{selectedMeeting?.durationInHours}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Presenter:</span>
                                  <p>{selectedMeeting?.presenterFullName}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Meeting ID:</span>
                                  <p>{selectedMeeting?.meetingKey}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Password:</span>
                                  <p>{selectedMeeting?.pwd}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Participants</h4>
                              {loadingParticipants ? (
                                <p className="text-sm text-muted-foreground">Loading participants...</p>
                              ) : participants.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {participants.map((participant, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <div>
                                        <p className="font-medium text-sm">{participant.name}</p>
                                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatRecordingDuration(participant.duration)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No participants data available</p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recordings" className="space-y-4">
          {recordings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recordings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recordings.map((recording) => (
                <Card key={recording.recordingId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recording.topic}</CardTitle>
                      <Badge variant="outline">{recording.status}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recording.datenTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {formatRecordingDuration(recording.durationInMins)}
                      </span>
                      <span className="text-sm text-muted-foreground">Size: {recording.fileSize}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm">
                        <a href={recording.playUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="w-4 h-4 mr-1" />
                          Watch
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={recording.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                      {recording.isTranscriptGenerated && recording.transcriptionDownloadUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a href={recording.transcriptionDownloadUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-1" />
                            Transcript
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <a href={recording.shareUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Share
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          {sharedRecordings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No shared recordings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sharedRecordings.map((recording) => (
                <Card key={recording.recordingId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recording.topic}</CardTitle>
                      <Badge variant="secondary">Shared</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recording.datenTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {formatRecordingDuration(recording.durationInMins)}
                      </span>
                      <span className="text-sm text-muted-foreground">by {recording.creatorName}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm">
                        <a href={recording.playUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="w-4 h-4 mr-1" />
                          Watch
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={recording.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                      {recording.isTranscriptGenerated && recording.transcriptionDownloadUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a href={recording.transcriptionDownloadUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-1" />
                            Transcript
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
