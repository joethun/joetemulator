import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { ButtonMouseFocusGuard } from "@/components/ButtonMouseFocusGuard";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joe T Emulator",
  description: "A web based frontend for EmulatorJS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Joe T Emulator",
  },
  icons: {
    icon: [
      { url: "/icons/duck.svg", type: "image/svg+xml" },
      { url: "/icons/duck-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/duck-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/duck-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});`,
          }}
        />
      </head>
      <body className="antialiased">
        <ButtonMouseFocusGuard />
        {children}
      </body>
    </html>
  );
}