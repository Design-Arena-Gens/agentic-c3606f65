import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Ad Poster Maker",
  description: "Create stunning ad posters from product images using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
