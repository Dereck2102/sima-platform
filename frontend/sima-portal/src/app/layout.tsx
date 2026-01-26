import React from 'react';
import Dashboard from './pages/Dashboard';
import './globals.css';

export const metadata = {
  title: 'SIMA Platform - Production Portal',
  description: 'Enterprise asset management and IoT platform',
};

export default function RootLayout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Dashboard />
      </body>
    </html>
  );
}
