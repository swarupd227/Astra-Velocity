import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Astra Velocity — Insurance Data Governance Platform",
  description:
    "Compose insurance data governance projects from Velocity Pack elements — best practices, standards, agents, and dashboards.",
};

/**
 * Dark is the default; the stored preference ("astra-theme") wins. This runs
 * inline as the first thing in <body> — before anything paints — so a light-
 * theme user never sees a dark flash (and vice versa). The <html> element is
 * rendered with the `dark` class, and this only ever removes it.
 */
const themeInitScript = `(function(){try{if(localStorage.getItem("astra-theme")==="light"){document.documentElement.classList.remove("dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
