import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "LeadForge AI — AI lead gen, outreach & CRM for freelancers",
    template: "%s · LeadForge AI",
  },
  description:
    "Find clients, analyze their websites, generate personalized proposals and outreach, and manage your pipeline — an AI sales OS for web developers and agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
