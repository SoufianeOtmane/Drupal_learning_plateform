import type { Metadata } from "next";
import AuthGate from "@/components/auth-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drupal Mentor — Learn by building",
  description:
    "A strict, adaptive learning workspace for becoming a production-ready Drupal 7 developer.",
  icons: {
    icon: "/images/drupalmentor-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
