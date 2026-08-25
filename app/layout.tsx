import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StudentOS", template: "%s | StudentOS" },
  description:
    "Your personal command center for academic excellence. Track habits, study, projects, and career goals.",
  keywords: ["student", "productivity", "study tracker", "habit tracker"],
  authors: [{ name: "StudentOS" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "StudentOS — Academic Command Center",
    description: "Track everything. Achieve everything.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="font-sans">
        <body className="font-sans antialiased bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
