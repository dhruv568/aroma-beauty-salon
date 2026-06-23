import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aroma Beauty Salon — Enhancing Your Natural Beauty",
  description:
    "Indulge in a premium, luxury salon experience at Aroma Beauty Salon. Browse our exclusive hair, skin, bridal makeup, and nails services and book your instant appointment online without any registration.",
  keywords: [
    "Aroma Beauty Salon",
    "Luxury Salon",
    "Hair Spa",
    "Bridal Makeup",
    "Skin Treatment",
    "Salon Booking",
    "Hair Cut",
    "Keratin Treatment",
    "Nail Art",
    "Facial",
  ],
  authors: [{ name: "Aroma Beauty Salon Team" }],
  openGraph: {
    title: "Aroma Beauty Salon — Enhancing Your Natural Beauty",
    description:
      "Indulge in a premium, luxury salon experience at Aroma Beauty Salon. Browse services and book your instant appointment online.",
    url: "https://aromabeautysalon.com",
    siteName: "Aroma Beauty Salon",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable}`}
      style={{
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <body
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          backgroundColor: "var(--color-cream-light)",
          color: "var(--color-off-black)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
