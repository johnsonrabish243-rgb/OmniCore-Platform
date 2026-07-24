import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniCore | The Intelligent Workspace Platform",
  description: "Enterprise SaaS platform for modern organizations.",
  keywords: [
    "SaaS", "Enterprise", "Workspace", "CRM",
    "Project Management", "HR", "OmniCore",
  ],
  authors: [{ name: "OmniCore" }],
  creator: "OmniCore Inc.",
  publisher: "OmniCore Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OmniCore",
    title: "OmniCore | The Intelligent Workspace Platform",
    description: "Enterprise SaaS platform for modern organizations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniCore | The Intelligent Workspace Platform",
    description: "Enterprise SaaS platform for modern organizations.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/omnicore-logo.png", sizes: "120x120", type: "image/png" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head />
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
              try {
                var savedLocale = localStorage.getItem('omnicore_locale');
                if (savedLocale) document.documentElement.lang = savedLocale;
              } catch(e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
