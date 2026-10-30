import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PROJECT_DEFAULTS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-geist-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata({});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5efe8" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1410" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
