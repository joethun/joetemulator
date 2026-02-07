import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joe T Emulator",
  description: "A web based frontend for EmulatorJS",
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
      </head>
      <body className={`${lexend.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}