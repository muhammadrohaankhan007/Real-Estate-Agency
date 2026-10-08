import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'PRIME TIME | The DHA Phase 8 Collection | Karachi Luxury Real Estate',
  description: "A Curated Portfolio of Karachi's Finest Estates. Exclusive 500 & 1,000 Yards Architectural Masterpieces in DHA Phase 8.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${cinzel.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="bg-[#0a0a0a] text-zinc-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
