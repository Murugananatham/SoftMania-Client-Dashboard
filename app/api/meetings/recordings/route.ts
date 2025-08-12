import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.tokens?.access_token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = new ZohoClient(session.tokens.access_token)
    const recordings = await client.getMeetingRecordings()

    return NextResponse.json({ recordings })
  } catch (error) {
    console.error("Error fetching recordings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recordings",
        recordings: [],
      },
      { status: 500 },
    )
  }
}
