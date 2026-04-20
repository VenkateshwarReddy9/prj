import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { AuthApiProvider } from '@/components/providers/AuthApiProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerCompass — AI-Powered Career Guidance',
  description:
    'Discover your ideal career path with AI-driven assessments, job matching, and personalized coaching.',
  keywords: ['career guidance', 'AI career coach', 'job matching', 'skill development'],
  openGraph: {
    title: 'CareerCompass',
    description: 'AI-Powered Career Guidance Platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <AuthApiProvider>
                <SocketProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </SocketProvider>
              </AuthApiProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
