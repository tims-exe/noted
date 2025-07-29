import type { Metadata } from 'next'
import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from '@/components/SessionProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Noted',
  description: 'Built for people who get things done.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="bottom-left"
          toastOptions={{
            className: poppins.className,
            style: {
              width: '150px',
              fontSize: '1rem',     
              lineHeight: '1.75rem', 
              border: '1px solid rgba(0, 0, 0, 0.4)'   
            },
            descriptionClassName: 'text-lg', 
          }}
        />
      </body>
    </html>
  )
}
