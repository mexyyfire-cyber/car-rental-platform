import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata = {
  title: "Route 61 — Car Rental Platform",
  description: "Search, book, and manage car rentals in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable} ${plexMono.variable}`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <footer className="bg-asphalt text-paper/60 mt-24">
            <div className="lane-divider" />
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest2">
              <span>Route 61 — demo car rental platform</span>
              <span>Built with Next.js</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
