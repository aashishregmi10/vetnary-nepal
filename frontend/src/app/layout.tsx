import type { Metadata } from "next";
import { Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { SITE } from "@/lib/seo";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Buy Pet Supplies Online in Nepal | PawMart",
    template: "%s | PawMart",
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: "Buy Pet Supplies Online in Nepal | PawMart",
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${karla.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg font-body text-text">
        <ChromeGate>{children}</ChromeGate>
      </body>
    </html>
  );
}
