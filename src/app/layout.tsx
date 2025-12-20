import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AC Portal - Dịch Vụ Cloud Chuyên Nghiệp & Blog Kỹ Thuật",
  description: "Dịch vụ Cloud chuyên nghiệp cho các team DevOps, SRE, và Platform Engineering. Kinh nghiệm thực tế từ môi trường production và giải pháp enterprise.",
  keywords: ["Cloud Services", "DevOps", "SRE", "Platform Engineering", "Kubernetes", "OpenShift", "Cloud Security", "Vietnam"],
  authors: [{ name: "AC Portal Team" }],
  creator: "AC Portal",
  publisher: "AC Portal",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" }
  },
  openGraph: {
    title: "AC Portal - Dịch Vụ Cloud Chuyên Nghiệp",
    description: "Chuyên gia Cloud & Platform Engineering với kinh nghiệm production thực tế",
    url: "https://ac-portal.com",
    siteName: "AC Portal",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AC Portal - Cloud Professional Services"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AC Portal - Dịch Vụ Cloud Chuyên Nghiệp",
    description: "Chuyên gia Cloud & Platform Engineering với kinh nghiệm production thực tế",
    images: ["/images/twitter-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
