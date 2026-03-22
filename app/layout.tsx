import type { Metadata } from "next";
import { Libre_Baskerville, Inter } from "next/font/google";
import { PaperProvider } from "@/context/PaperContext";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Eido",
  description:
    "A dedicated space for deep reading and intelligent exploration. Turn complex manuscripts into actionable insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-800 font-sans">
        <PaperProvider>
          {children}
        </PaperProvider>
      </body>
    </html>
  );
}
