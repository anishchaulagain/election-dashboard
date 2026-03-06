import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Nepal Election Intelligence Dashboard 2082",
  description:
    "Real-time election analytics, live results, and intelligence for Nepal General Election 2082. Track candidates, parties, constituencies with interactive dashboards.",
  keywords: "Nepal election, 2082, results, live, analytics, dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t py-6 text-center text-xs text-muted-foreground">
            <p>Nepal Election Intelligence Dashboard 2082 • Real-time election analytics</p>
            <p className="mt-1">Data source: Election Commission of Nepal</p>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
