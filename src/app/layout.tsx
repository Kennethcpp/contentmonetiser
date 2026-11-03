import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentMonetizer — Advertise • Promote • Earn",
  description:
    "The two-sided content monetization marketplace connecting advertisers with verified Facebook content creators. Guaranteed real reach at ₦5 per 1,000 views.",
  icons: {
    icon: "/images/01-primary-logo-concept.png",
    apple: "/images/01-primary-logo-concept.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/01-primary-logo-concept.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#EFEEE3] text-[#20043B] flex flex-col antialiased selection:bg-[#F0D8FF] selection:text-[#20043B]"
      >
        {children}
      </body>
    </html>
  );
}
