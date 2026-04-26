import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Library System Management",
  description: "Library operations, borrowing records, and member access for Library System Management.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storedTheme = localStorage.getItem("library-theme");
                  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  var theme = storedTheme || systemTheme;
                  document.documentElement.dataset.theme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = "light";
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "rounded-2xl border shadow-[0_18px_50px_rgba(15,23,42,0.12)]",
              title: "text-sm font-semibold",
              description: "text-sm",
            },
          }}
        />
      </body>
    </html>
  );
}
