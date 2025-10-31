import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'MyFundAction Projects Dashboard',
  description: 'Live project tracking dashboard for MyFundAction NGO with real-time updates',
  keywords: 'NGO, project management, MyFundAction, Malaysia, volunteer management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
