"use client"

import { useState } from "react"

export function DashboardContent() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("meetings")
  const [meetings, setMeetings] = useState([])
  const [files, setFiles] = useState([])
  const [courses, setCourses] = useState([])
  const [mails, setMails] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [meetingsRes, workdriveRes, coursesRes, mailRes] = await Promise.allSettled([
        fetch("/api/meetings").then((res) => res.json()),
        fetch("/api/workdrive").then((res) => res.json()),
        fetch("/api/courses").then((res) => res.json()),
        fetch("/api/mail").then((res) => res.json()),
      ])

      // // Handle meetings
      // if (meetingsRes.status === "fulfilled" && !meetingsRes.value.error) {
      //   setMeetings(meetingsRes.value.meetings || [])
      // } else {
      //   console.error("Meetings API failed:", meetingsRes)
      //   setMeetings([])
      // }

      // Handle workdrive
      if (workdriveRes.status === "fulfilled" && !workdriveRes.value.error) {
        setFiles(workdriveRes.value.files || [])
      } else {
        console.error("WorkDrive API failed:", workdriveRes)
        setFiles([])
      }

      // Handle courses
      if (coursesRes.status === "fulfilled" && !coursesRes.value.error) {
        setCourses(coursesRes.value.courses || [])
      } else {
        console.error("Courses API failed:", coursesRes)
        setCourses([])
      }

      // Handle mail
      // if (mailRes.status === "fulfilled" && !mailRes.value.error) {
      //   setMails(mailRes.value.messages || [])
      // } else {
      //   console.error("Mail API failed:", mailRes)
      //   setMails([])
      // }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      // case "meetings":
      //   return (
      //     <div className="space-y-4">
      //       <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
      //       {meetings.length > 0 ? (
      //         meetings.map((meeting: any, index: number) => (
      //           <div key={index} className="p-4 border rounded-lg">
      //             <h4 className="font-medium">{meeting.title || "Meeting"}</h4>
      //             <p className="text-sm text-gray-600">{meeting.start_time || "Time TBD"}</p>
      //           </div>
      //         ))
      //       ) : (
      //         <div className="text-center py-8 text-gray-500">
      //           <p>No meetings found or API connection issue</p>
      //           <p className="text-sm mt-2">Check console for detailed error information</p>
      //         </div>
      //       )}
      //     </div>
      //   )

      case "recordings":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recordings & Notes</h3>
            {files.length > 0 ? (
              files.map((file: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{file.name || "File"}</h4>
                  <p className="text-sm text-gray-600">{file.type || "Document"}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No files found or API connection issue</p>
                <p className="text-sm mt-2">Check console for detailed error information</p>
              </div>
            )}
          </div>
        )

      case "courses":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Material</h3>
            {courses.length > 0 ? (
              courses.map((course: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{course.title || "Course"}</h4>
                  <p className="text-sm text-gray-600">{course.description || "No description"}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No courses found or API connection issue</p>
                <p className="text-sm mt-2">Check console for detailed error information</p>
              </div>
            )}
          </div>
        )

      // case "mail":
      //   return (
      //     <div className="space-y-4">
      //       <h3 className="text-lg font-semibold">Recent Mails</h3>
      //       {mails.length > 0 ? (
      //         mails.map((mail: any, index: number) => (
      //           <div key={index} className="p-4 border rounded-lg">
      //             <h4 className="font-medium">{mail.subject || "No Subject"}</h4>
      //             <p className="text-sm text-gray-600">{mail.from || "Unknown Sender"}</p>
      //           </div>
      //         ))
      //       ) : (
      //         <div className="text-center py-8 text-gray-500">
      //           <p>No emails found or API connection issue</p>
      //           <p className="text-sm mt-2">Mail API requires additional configuration</p>
      //         </div>
      //       )}
      //     </div>
      //   )

      // case "links":
      //   return (
      //     <div className="space-y-4">
      //       <h3 className="text-lg font-semibold">Reference Links</h3>
      //       <div className="space-y-2">
      //         <a
      //           href="https://meeting.zoho.in"
      //           target="_blank"
      //           rel="noopener noreferrer"
      //           className="block p-3 border rounded-lg hover:bg-gray-50"
      //         >
      //           <span className="font-medium">Zoho Meeting</span>
      //           <p className="text-sm text-gray-600">Access your meetings directly</p>
      //         </a>
      //         <a
      //           href="https://workdrive.zoho.in"
      //           target="_blank"
      //           rel="noopener noreferrer"
      //           className="block p-3 border rounded-lg hover:bg-gray-50"
      //         >
      //           <span className="font-medium">Zoho WorkDrive</span>
      //           <p className="text-sm text-gray-600">Access your files and documents</p>
      //         </a>
      //         <a
      //           href="https://learn.zoho.in"
      //           target="_blank"
      //           rel="noopener noreferrer"
      //           className="block p-3 border rounded-lg hover:bg-gray-50"
      //         >
      //           <span className="font-medium">Zoho Learn</span>
      //           <p className="text-sm text-gray-600">Access your courses and training</p>
      //         </a>
      //       </div>
      //     </div>
      //   )

      default:
        return <div>Select a tab to view content</div>
    }
  }
}
