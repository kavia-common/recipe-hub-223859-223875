import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Recipe Hub (Retro)",
  description:
    "A retro-themed recipe app with browsing, favorites, CRUD, and shopping lists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="retro-app">
          <AuthProvider>
            <TopNav />
            <main className="retro-main">
              <div className="retro-container">{children}</div>
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
