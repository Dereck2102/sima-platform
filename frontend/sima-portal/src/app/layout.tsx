import React from 'react';
import './globals.css';

export const metadata = {
  title: 'SIMA Platform - Production Portal',
  description: 'Enterprise asset management and IoT platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/uce-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
