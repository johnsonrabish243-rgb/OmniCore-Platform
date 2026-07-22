import { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniCore | The Intelligent Workspace Platform",
  description:
    "Plateforme SaaS d'entreprise pour les organisations modernes. Gérez vos équipes, projets et opérations depuis un seul espace de travail intelligent.",
  keywords: [
    "SaaS",
    "Enterprise",
    "Workspace",
    "CRM",
    "Project Management",
    "HR",
    "OmniCore",
  ],
  authors: [{ name: "OmniCore" }],
  creator: "OmniCore Inc.",
  publisher: "OmniCore Inc.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "OmniCore",
    title: "OmniCore | The Intelligent Workspace Platform",
    description:
      "Plateforme SaaS d'entreprise pour les organisations modernes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniCore | The Intelligent Workspace Platform",
    description:
      "Plateforme SaaS d'entreprise pour les organisations modernes.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/*
          FOUC prevention is handled by next/script below.
          Using Next.js Script (strategy="beforeInteractive") avoids
          React 19's warning about inline <script> in component trees.
        */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (!theme) theme = 'system';
                var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch(e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
