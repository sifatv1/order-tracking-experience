import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Track your order | Morrow",
  description: "A clearer way to follow every delivery update.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
