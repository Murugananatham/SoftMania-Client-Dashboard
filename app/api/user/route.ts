import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      user: session.user,
      dataCenter: {
        code: session.dataCenter.code,
        name: session.dataCenter.name,
      },
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}
