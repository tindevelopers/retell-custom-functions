import './globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from '../components/SessionProvider';

export const metadata = {
  title: 'Retell Functions Admin',
  description: 'Manage Retell custom function configurations',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider>
          <main className="max-w-5xl mx-auto p-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

