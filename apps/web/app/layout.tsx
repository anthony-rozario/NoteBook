
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NoteBook",
  description: "AI-Powered Collaborative Learning",
  icons: {
    icon: "/n-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}