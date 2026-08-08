import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://appcarrier.cloud"),
  title: {
    default: "FPT-IS Next Gen Service — Cloud & AI Infrastructure",
    template: "%s · FPT-IS Next Gen Service",
  },
  description:
    "Đối tác Cloud & AI end-to-end cho doanh nghiệp. Tư vấn, triển khai, vận hành và tối ưu hạ tầng Cloud, DevSecOps, SRE, AIOps và AI Infrastructure.",
  icons: { icon: "/assets/appcarrier-icon.svg", apple: "/assets/appcarrier-icon.svg" },
  openGraph: {
    title: "FPT-IS Next Gen Service — Cloud & AI Infrastructure",
    description: "Your end-to-end Cloud & AI partner.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
