import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a common sans-serif, Geist is fine too
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";


const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans', // Changed to --font-sans to match common practice, or ensure Geist vars used if preferred
});

export const metadata: Metadata = {
  title: 'Resumaker.ai - AI Powered Resume Builder',
  description: 'Create a professional resume with AI assistance using Resumaker.ai.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
