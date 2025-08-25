import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.tokens?.access_token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const zohoClient = new ZohoClient(session.tokens.access_token, session.dataCenter, session.apiDomain)

    // Get user info to extract privatespace ID
    const userInfo = await zohoClient.getWorkDriveUserInfo()
    const userId = userInfo.data.id

    // Get privatespace info
    const privatespace = await zohoClient.getWorkDrivePrivateSpace(userId)
    const privatespaceId = privatespace.data[0].id

    // Get shared files and folders
    const files = await zohoClient.getSharedFiles(privatespaceId)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("WorkDrive shared files error:", error)
    return NextResponse.json({ error: "Failed to fetch shared files" }, { status: 500 })
  }
}
