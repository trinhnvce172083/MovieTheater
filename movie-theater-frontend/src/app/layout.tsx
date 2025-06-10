import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components'

export const metadata: Metadata = {
  title: 'Movie Theater - Rạp Chiếu Phim',
  description: 'Hệ thống quản lý rạp chiếu phim',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-gray-50">
        <Header
          user={{
            name: "Alexa Rowles",
            email: "alexa.rowles@gmail.com"
          }}
        />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 