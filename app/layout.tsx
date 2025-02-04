'use client'

import { useEffect, useState } from 'react'
import { Noto_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ar'
import 'dayjs/locale/de'
import 'dayjs/locale/en'
import 'dayjs/locale/es'
import 'dayjs/locale/fa'
import 'dayjs/locale/fr'
import 'dayjs/locale/hi'
import 'dayjs/locale/id'
import 'dayjs/locale/it'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/nl'
import 'dayjs/locale/pl'
import 'dayjs/locale/sv'
import 'dayjs/locale/th'
import 'dayjs/locale/tr'
import 'dayjs/locale/uk'
import 'dayjs/locale/vi'
import 'dayjs/locale/zh'
import { LayoutProps } from '@/types/component'
import './globals.css'

dayjs.extend(localizedFormat)

const notoSans = Noto_Sans({
  variable: '--noto-sans',
  fallback: ['sans-serif', 'arial', 'system-ui', 'monospace'],
  weight: ['100', '200', '300', '600', '700', '800'],
  subsets: ['latin'],
  display: 'fallback',
})

export default function RootLayout({ children }: LayoutProps) {
  const [locale, setLocale] = useState('en')
  
  useEffect(() => setLocale(navigator.language), [])
  useEffect(() => {
    dayjs.locale(locale)
  }, [locale])
  
  return (
    <html>
      <meta name='darkreader-lock' content='true' />
      <link rel='shortcut icon' href='/favicon.ico'></link>
      <link rel='apple-touch-icon' href='/apple-touch-icon.png'></link>
      <body className={`antialiased ${notoSans.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
