import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FoodBridge — AI-Powered Food Waste Redistribution',
    template: '%s | FoodBridge',
  },
  description:
    'FoodBridge connects food donors with NGOs through AI-driven quality assessment, safety scoring, and real-time delivery tracking. Fighting hunger and food waste together.',
  keywords: ['food waste', 'food donation', 'NGO', 'AI', 'redistribution', 'SDG 2', 'zero hunger'],
  authors: [{ name: 'FoodBridge Team' }],
  openGraph: {
    title: 'FoodBridge — AI-Powered Food Waste Redistribution',
    description: 'Connect surplus food with people who need it. AI-scored, safely matched.',
    type: 'website',
  },
};

// Fix: Next.js App Router Server Components do not need to import React explicitly —
// JSX transform handles it. But the children type must be properly typed.
// ReactNode lives in 'react' — import it explicitly for TypeScript.
import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Providers will be added in Phase 4 (QueryClientProvider, ThemeProvider) */}
        {children}
      </body>
    </html>
  );
}
