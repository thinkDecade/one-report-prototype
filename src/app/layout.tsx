import type { Metadata } from "next";
import "./globals.css";
import DemoBar from "@/components/DemoBar";
import JourneyBar from "@/components/JourneyBar";

export const metadata: Metadata = {
  title: "One Report · Ghana incident reporting portal (prototype)",
  description:
    "Concept prototype by CDABI: one report from a hacked mobile money or virtual asset business reaches every Ghanaian authority at once.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JourneyBar />
        {children}
        <DemoBar />
      </body>
    </html>
  );
}
