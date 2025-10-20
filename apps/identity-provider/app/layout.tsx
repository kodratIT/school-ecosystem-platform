import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Identity Provider - School Ecosystem',
  description: 'Centralized authentication for School Ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
