import { cookies } from "next/headers"
import type { ZohoTokens, ZohoUser, DataCenter } from "./zoho-config"

export interface Session {
  user: ZohoUser
  tokens: ZohoTokens
  expiresAt: number
  dataCenter: DataCenter // Added data center information
  apiDomain?: string // API domain from token response
}

export async function createSession(user: ZohoUser, tokens: ZohoTokens, dataCenter: DataCenter, apiDomain?: string) {
  const session: Session = {
    user,
    tokens,
    expiresAt: Date.now() + tokens.expires_in * 1000,
    dataCenter,
    apiDomain,
  }

  const cookieStore = await cookies()
  cookieStore.set("zoho-session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expires_in,
    path: "/",
  })

  return session
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("zoho-session")

    if (!sessionCookie) {
      return null
    }

    const session: Session = JSON.parse(sessionCookie.value)

    if (Date.now() > session.expiresAt) {
      await clearSession()
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("zoho-session")
}
