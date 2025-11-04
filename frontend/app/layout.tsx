import type { Metadata } from "next";
import { Zain } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/authContext";
import "leaflet/dist/leaflet.css";

const zain = Zain({
  subsets: ["latin"],
  weight: ["200", "300", "400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Sunyi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={zain.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
