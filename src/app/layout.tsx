import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
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
    icon: "/icons/duck.png",
    apple: "/icons/duck.png",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() { document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark'); })();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered:', registration.scope);
                  }).catch(function(error) {
                    console.log('SW registration failed:', error);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${lexend.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}