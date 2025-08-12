import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { ZohoClient } from '@/lib/zoho-client'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const zohoClient = new ZohoClient(session.tokens.access_token)
    const courses = await zohoClient.getLearnCourses()
    
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
