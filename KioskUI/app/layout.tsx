import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATC Kiosk",
  description: "Hotel Self-Service Check-In Kiosk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
