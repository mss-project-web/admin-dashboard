import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";


const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "MSS - Admin dashboard",
  description: "MSS - Admin dashboard",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MSS-Admin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anuphan.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
