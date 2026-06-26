import type { Metadata } from "next";
import { Inter, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VR Pumps — Industrial Pump Manufacturing & Water Solutions",
  description:
    "VR Pumps designs and manufactures high-performance pumps for domestic, agricultural, and industrial water systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} ${sora.variable} font-sans antialiased overscroll-y-none`}
      >
        {children}
      </body>
    </html>
  );
}
