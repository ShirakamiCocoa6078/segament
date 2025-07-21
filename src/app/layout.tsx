import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider'; // 수정된 AuthProvider import
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Segament',
  description: '당신의 리듬 게임 동반자.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* AuthProvider로 children을 감싸줍니다. */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}