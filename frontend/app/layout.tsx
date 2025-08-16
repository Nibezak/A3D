'use client'
import './globals.css'
import type { Metadata } from 'next'
import { PostHogProvider } from './components/PostHogProvider'
import { initAnalytics } from './engine/utils/external/analytics'
import { Toaster } from 'sonner'
import { siteConfig } from '@/siteConfig'
console.log('layout.tsx')
import { useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';


export const metadata: Metadata = {
  title: siteConfig.productName,
  description: siteConfig.description,
  icons: {
    icon: '/img/favicon.ico',
  },
  // og
  openGraph: {
    images: '/img/og2.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      initAnalytics();
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch&display=swap" rel="stylesheet" />
      </head>
      <body className={`bg-black `}>
        <Toaster closeButton expand={true} richColors={true} />
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}




