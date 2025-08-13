import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest, { params }: { params: { sessionKey: string } }) {
  try {
    const session = await getSession()

    if (!session?.tokens?.access_token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = new ZohoClient(session.tokens.access_token)
    const participants = await client.getMeetingParticipants(params.sessionKey)

    return NextResponse.json({ participants })
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch participants",
        participants: [],
      },
      { status: 500 },
    )
  }
}
