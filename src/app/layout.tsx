import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latlas",
  description: "Education support platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
