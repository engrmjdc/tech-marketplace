import type { Metadata } from "next";
import Navbar from "../components/ui/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Marketplace",
  description: "Freelance marketplace for technology professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}