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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      initAnalytics();
      const handleStartRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const result = await window.electron.transcribeAudio(base64Audio);
            if (result.success) {
              console.log('Transcription:', result.text);
            }
          };
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current.start();
      };
      const handleStopRecording = () => {
        mediaRecorderRef.current?.stop();
      };
      ipcRenderer.on('start-audio-recording-frontend', handleStartRecording);
      ipcRenderer.on('stop-audio-recording-frontend', handleStopRecording);
      return () => {
        ipcRenderer.removeAllListeners('start-audio-recording-frontend');
        ipcRenderer.removeAllListeners('stop-audio-recording-frontend');
      };
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


