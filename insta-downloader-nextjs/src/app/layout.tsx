import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ig image downloader',
  description: 'ig image downloader',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <head>
        <link rel="icon" type="image/png" href="/favicon.png" sizes="any" />
      </head> */}

      <body className={inter.className}>{children}</body>
    </html>
  );
}
