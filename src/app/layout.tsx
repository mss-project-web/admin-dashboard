import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";
import { Providers } from "@/app/components/providers";


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
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anuphan.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
