import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";


const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
});


export const metadata: Metadata = {
  title: "MSS - Admin dashboard",
  description: "MSS - Admin dashboard",
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
      </body>
    </html>
  );
}
