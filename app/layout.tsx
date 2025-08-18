import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Softmania Client Dashboard",
  description:
    "Access your Zoho Learn documents, Zoho Meetings, Zoho WorkDrive shared files, and reference links — all in one place with Softmania Client Dashboard.",
  keywords: [
    "Softmania",
    "Client Dashboard",
    "Zoho Learn",
    "Zoho WorkDrive",
    "Zoho Meetings",
    "Shared Files",
    "Reference Links",
    "Team Collaboration",
    "Knowledge Base",
  ],
  authors: [{ name: "Softmania" }],
  creator: "Soft Mania",
  metadataBase: new URL("https://softmania.in"),
  alternates: {
    canonical: "https://splunklab.softmania.in",
  },

  openGraph: {
    title: "Softmania Client Dashboard",
    description:
      "Centralized access for clients — Zoho Learn docs, Zoho Meetings, Zoho WorkDrive shared files, and reference links in one dashboard.",
    url: "https://clients.softmania.in",
    siteName: "Softmania Client Dashboard",
    images: [
      {
        url: "https://clients.softmania.in/og-image.png", // replace with your logo/OG image
        width: 1200,
        height: 630,
        alt: "Softmania Client Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    "official:website": "https://softmania.in",
    "linkedin:company": "https://www.linkedin.com/company/softmania-tech/",
    "instagram:profile": "https://www.instagram.com/softmaniatech/",
    "youtube:channel": "https://www.youtube.com/@SoftManiaTech",
  },

  icons: {
    icon: "/favicon.ico",
    // apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
