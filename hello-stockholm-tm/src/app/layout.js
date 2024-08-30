import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ÅM',
  description: 'ÅM',
  icons: {
    icon: './favicon.ico', // /public path
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel='icon' href='/favicon.ico' />
      <body className={inter.className}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
