import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens, ZohoClient } from "@/lib/zoho-client"
import { createSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  try {
    console.log("Starting OAuth callback with code:", code.substring(0, 20) + "...")

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    console.log("Tokens received, attempting to get user details...")

    // Get user details
    const zohoClient = new ZohoClient(tokens.access_token)
    const user = await zohoClient.getUserDetails()
    console.log("User details retrieved:", { email: user.email, name: user.name })

    // Create session
    await createSession(user, tokens)
    console.log("Session created successfully")

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("OAuth callback error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: code?.substring(0, 20) + "...",
    })
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }
}
