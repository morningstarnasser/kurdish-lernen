import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ferheng - Kurdisch Lernen",
  description:
    "Lerne Kurdisch (Badini) spielerisch mit Ferheng. Interaktive Lernspiele, umfangreiches Wörterbuch und Fortschrittsverfolgung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${nunito.variable} font-nunito antialiased`}>
        {children}
      </body>
    </html>
  );
}
