import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { ZOHO_CONFIG } from '@/lib/zoho-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  const authUrl = `${ZOHO_CONFIG.authUrl}?` + new URLSearchParams({
    response_type: 'code',
    client_id: ZOHO_CONFIG.clientId,
    scope: ZOHO_CONFIG.scope,
    redirect_uri: ZOHO_CONFIG.redirectUri,
    access_type: 'offline'
  }).toString()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in with your Zoho account to access your personalized dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <a href={authUrl}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Login with Zoho
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
