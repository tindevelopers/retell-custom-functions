import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Retell Functions Admin',
  description: 'Manage Retell custom function configurations',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}

