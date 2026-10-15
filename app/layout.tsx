
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Betty | 3D Packaging Studio",
  description:
    "Design, customize, and preview product packaging in 3D with Betty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
