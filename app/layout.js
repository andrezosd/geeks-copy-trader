import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Geeks Trader - Copy Trading System',
  description: 'Sistema profissional de copy trading para Tradovate',
  keywords: ['copy trading', 'tradovate', 'trading', 'forex', 'automation'],
  authors: [{ name: 'Geeks Trader Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
