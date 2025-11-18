import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/error-boundary'
import './globals.css'
import LanguageProvider from '@/components/language-provider'
import LanguageSwitcher from '@/components/language-switcher'

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'الخدمات الأكاديمية | Academic Services Platform',
  description: 'Premier academic services platform for Saudi Arabian students. Essay writing, research papers, tutoring, and exam preparation services with 24-hour guarantee.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`${geist.style} antialiased`}>
        <ErrorBoundary>
          <LanguageProvider>
            <div className="fixed top-4 left-4 z-50">
              <LanguageSwitcher />
            </div>
            {children}
          </LanguageProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
