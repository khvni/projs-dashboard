import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyFundAction Projects Dashboard',
  description: 'Live project tracking dashboard for MyFundAction NGO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  )
}
