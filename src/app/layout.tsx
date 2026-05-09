import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "@/styles/globals.css";

/* ─── Fonts ─── */

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* ─── Metadata ─── */

export const metadata: Metadata = {
  title: {
    default: "FRUYAÇAÍ — Cardápio",
    template: "%s | FRUYAÇAÍ",
  },
  description: "Açaí premium direto da Amazônia.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ─── Layout ─── */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-surface text-white font-body antialiased">
        <QueryProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
          >
            Ir para o conteúdo
          </a>
          <main id="main-content">{children}</main>
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: "#221638",
                border: "1px solid #3a2658",
                color: "#fff",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
