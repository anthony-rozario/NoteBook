// apps/web/app/layout.tsx
import Navbar from "../components/Navbar/Navbar";
import "./globals.css"; // Double check this path!
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}
       cz-shortcut-listen="true"
      >
        <Navbar />
        {children}
        </body>
    </html>
  );
}