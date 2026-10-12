import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://realpropertyprimetime.com'),
  title: {
    default: 'Real Property Prime Time | Karachi Luxury Real Estate & Advisory | Est. 1998',
    template: '%s | Real Property Prime Time',
  },
  description:
    'Established in 1998, Real Property Prime Time is Karachi’s trusted luxury real estate advisory led by Nadeem Sulemani. Curated residential masterpieces in DHA Phase 8, Emaar Crescent Bay, and confidential off-market acquisitions.',
  keywords: [
    'Karachi Luxury Real Estate',
    'DHA Phase 8 Karachi',
    'Emaar Crescent Bay Pearl Towers',
    'Nadeem Sulemani Real Estate',
    'Real Property Prime Time',
    'Khayaban-e-Ghalib Bungalow',
    'Khayaban-e-Faisal Waterfront',
    'Khayaban-e-Ittehad 1000 Yards',
    'Karachi Off-Market Property',
    'DHA Phase 6 7 8',
    'Luxury Villas Karachi',
  ],
  authors: [{ name: 'Nadeem Sulemani', url: 'https://realpropertyprimetime.com' }],
  creator: 'Real Property Prime Time',
  publisher: 'Real Property Prime Time',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon.svg' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://realpropertyprimetime.com',
    siteName: 'Real Property Prime Time',
    title: 'Real Property Prime Time | Karachi Luxury Real Estate & Advisory | Est. 1998',
    description:
      'Curated residential masterpieces in DHA Phase 8, Emaar Crescent Bay, and confidential off-market acquisitions in Karachi.',
    images: [
      {
        url: '/images/hero-mansion.jpg',
        width: 1200,
        height: 630,
        alt: 'Real Property Prime Time - Karachi Luxury Real Estate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Property Prime Time | Karachi Luxury Real Estate & Advisory',
    description:
      'Curated residential masterpieces in DHA Phase 8, Emaar Crescent Bay, and confidential off-market acquisitions in Karachi.',
    images: ['/images/hero-mansion.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${cinzel.variable} ${jakarta.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-[#0a0a0a] text-zinc-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
