import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const zohoClient = new ZohoClient(session.tokens.access_token, session.dataCenter, session.apiDomain)
    const meetings = await zohoClient.getMeetings()

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
  }
}
