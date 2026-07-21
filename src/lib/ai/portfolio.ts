import type { BusinessType } from "@/types";

export type SeedPortfolio = {
  slug: string;
  name: string;
  businessType: BusinessType;
  blurb: string;
  liveUrl: string;
  githubUrl: string;
  stack: string[];
  highlights: string[];
};

/**
 * Real shipped work — used for portfolio matching in proposals/outreach.
 * Only genuine projects. No fabricated case studies.
 */
export const SEED_PORTFOLIOS: SeedPortfolio[] = [
  {
    slug: "krishan-shudhama-palace",
    name: "Krishan Shudhama Palace",
    businessType: "hotel",
    blurb:
      "Hotel marketing site with direct Razorpay booking, room inventory, banquet leads, and an admin panel — live on a custom domain near Khatu Shyam Ji.",
    liveUrl: "https://www.krishanshudhamapalace.com",
    githubUrl: "https://github.com/chetansaini0/krishan-shudhama-palace-site",
    stack: ["Next.js", "MongoDB", "Razorpay", "TypeScript"],
    highlights: ["Direct booking + payments", "Room & banquet inventory", "Admin dashboard", "Custom domain live"],
  },
  {
    slug: "mb-jewellers",
    name: "MB Jewellers",
    businessType: "jewellery",
    blurb:
      "Luxury jewellery showcase with appointment lead capture and a Postgres-backed admin — production on Vercel.",
    liveUrl: "https://mb-jewellers-beta.vercel.app",
    githubUrl: "https://github.com/chetansaini0/mb_jewellers",
    stack: ["Next.js", "Prisma", "PostgreSQL", "TypeScript"],
    highlights: ["Premium catalog UI", "Appointment lead capture", "Admin management", "SEO-ready"],
  },
  {
    slug: "reviewflow-ai",
    name: "ReviewFlow AI",
    businessType: "other",
    blurb:
      "SaaS for QR-based Google review collection — Clerk auth, MongoDB, OpenAI drafts, analytics, and Razorpay billing.",
    liveUrl: "https://reviewflow-ai-lime.vercel.app",
    githubUrl: "https://github.com/chetansaini0/reviewflow-ai",
    stack: ["Next.js", "Clerk", "MongoDB", "OpenAI", "Razorpay"],
    highlights: ["QR review funnel", "AI review drafts", "Analytics", "Subscription billing"],
  },
  {
    slug: "docuextract",
    name: "DocuExtract",
    businessType: "other",
    blurb:
      "AI document extraction SaaS — invoices/receipts/contracts to structured data with export + REST API.",
    liveUrl: "https://docuextract-sandy.vercel.app",
    githubUrl: "https://github.com/chetansaini0/docuextract",
    stack: ["Next.js", "Supabase", "OpenAI", "Razorpay"],
    highlights: ["AI extraction pipeline", "Excel/CSV/JSON export", "Developer API", "Usage billing"],
  },
];

/**
 * Pick the most relevant portfolio pieces for a given lead's business type.
 * Falls back to the strongest general SaaS work when there's no exact match.
 */
export function matchPortfolios(type: BusinessType, limit = 2): SeedPortfolio[] {
  const exact = SEED_PORTFOLIOS.filter((p) => p.businessType === type);
  if (exact.length >= limit) return exact.slice(0, limit);
  const rest = SEED_PORTFOLIOS.filter((p) => p.businessType !== type);
  return [...exact, ...rest].slice(0, limit);
}
