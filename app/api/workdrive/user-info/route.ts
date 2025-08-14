import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.tokens?.access_token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const zohoClient = new ZohoClient(session.tokens.access_token)
    const userInfo = await zohoClient.getWorkDriveUserInfo()

    return NextResponse.json(userInfo)
  } catch (error) {
    console.error("Error fetching WorkDrive user info:", error)
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 })
  }
}
