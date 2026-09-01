import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CartStoreProvider } from "@/providers/cart-store-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catálogo de Pijamas",
  description: "Catálogo de pijamas con pedidos por WhatsApp",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <CartStoreProvider>{children}</CartStoreProvider>
      </body>
    </html>
  );
}
