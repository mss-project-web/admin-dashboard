import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";
import { Providers } from "@/app/components/providers";
import { getSession } from "@/actions/auth";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "MSS - Admin dashboard",
    template: "%s | MSS - Admin dashboard",
  },
  description: "MSS - Admin dashboard",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSession();

  return (
    <html lang="en" className={anuphan.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers initialUser={sessionUser}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
