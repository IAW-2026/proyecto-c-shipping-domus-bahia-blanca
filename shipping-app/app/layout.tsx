import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { HeaderAuth } from "./components/headerAuth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "Domus",
  title: {
    default: "Domus",
    template: "%s",
  },
  description: "Gestion de turnos y visitas para agentes inmobiliarios.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Domus",
    title: "Domus",
    description: "Gestion de turnos y visitas para agentes inmobiliarios.",
  },
  twitter: {
    card: "summary",
    title: "Domus",
    description: "Gestion de turnos y visitas para agentes inmobiliarios.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <ClerkProvider>
          <header className="absolute right-0 top-0 z-20 flex items-center gap-4 p-4">
            <HeaderAuth />
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});



