import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";
import { CatalogHeader } from "@/modules/catalog/components/CatalogHeader";
import { Footer } from "@/modules/home/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zarely - Catálogo Web & Tienda Online",
  description: "Explora nuestro catálogo de útiles, productos escolares, mercería y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-fuchsia-500 selection:text-white bg-slate-50 min-h-screen flex flex-col`}
      >
        {/* 🚀 TOASTER CON Z-INDEX ALTO Y ESTILOS ENFÁTICOS */}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          style={{ zIndex: 99999 }}
        />

        <CatalogHeader />

        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}