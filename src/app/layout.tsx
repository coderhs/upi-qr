import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UPI QR Code Generator",
  description: "Generate UPI QR codes with all available parameters for easy digital payments",
  keywords: "UPI, QR Code, Payment, India, Digital Payment, UPI QR Generator",
  authors: [{ name: "Harisankar P S", url: "https://hsps.in" }],
  creator: "Harisankar P S",
  publisher: "Harisankar P S",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
