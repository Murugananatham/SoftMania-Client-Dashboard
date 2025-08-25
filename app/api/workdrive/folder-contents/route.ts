import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ZohoClient } from "@/lib/zoho-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.tokens?.access_token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    const zohoClient = new ZohoClient(session.tokens.access_token, session.dataCenter, session.apiDomain)

    // Get folder contents
    const files = await zohoClient.getFolderContents(folderId)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("WorkDrive folder contents error:", error)
    return NextResponse.json({ error: "Failed to fetch folder contents" }, { status: 500 })
  }
}
