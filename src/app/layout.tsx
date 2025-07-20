import type {Metadata} from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from '@/components/auth/auth-provider';
import AuthRedirector from '@/components/auth/AuthRedirector';


export const metadata: Metadata = {
  title: 'Segament',
  description: '당신의 리듬 게임 동반자.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuthRedirector />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
