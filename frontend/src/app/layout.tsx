// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'My Check-In App',
  description: 'Visitor check-in system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Optional: <Header /> */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
