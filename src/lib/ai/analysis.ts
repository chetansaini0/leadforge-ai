import type { BusinessType, LeadPriority, WebsiteScores } from "@/types";

/**
 * Deterministic website analysis. In production this would call PageSpeed
 * Insights / Lighthouse; here we derive a stable pseudo-score from the lead's
 * signals so the demo is fully functional without external APIs.
 */
export function analyzeWebsite(input: {
  website: string;
  googleRating: number;
  reviewsCount: number;
}): { scores: WebsiteScores; issues: string[] } {
  const hasSite = Boolean(input.website && input.website.trim());
  const hasSsl = hasSite && input.website.startsWith("https://");

  // Seed a stable number from the domain string.
  const seed = hash(input.website || "no-site");
  const jitter = (min: number, max: number, salt: number) =>
    min + (Math.abs(seed + salt) % (max - min + 1));

  const scores: WebsiteScores = hasSite
    ? {
        seo: jitter(35, 78, 1),
        mobile: jitter(45, 88, 2),
        speed: jitter(30, 82, 3),
        design: jitter(40, 85, 4),
        conversion: jitter(28, 72, 5),
        overall: 0,
      }
    : { seo: 8, mobile: 10, speed: 12, design: 6, conversion: 5, overall: 0 };

  scores.overall = Math.round(
    (scores.seo + scores.mobile + scores.speed + scores.design + scores.conversion) / 5,
  );

  const issues: string[] = [];
  if (!hasSite) issues.push("No website found");
  if (hasSite && !hasSsl) issues.push("Missing SSL (not on HTTPS)");
  if (scores.seo < 55) issues.push("Weak on-page SEO");
  if (scores.speed < 55) issues.push("Slow loading speed");
  if (scores.mobile < 60) issues.push("Poor mobile experience");
  if (scores.conversion < 55) issues.push("No clear booking / lead capture");
  if (scores.design < 55) issues.push("Outdated UI / design");
  if (input.reviewsCount > 0 && input.googleRating < 4) {
    issues.push("Reputation gap — low Google rating");
  }
  return { scores, issues };
}

const SERVICE_BY_TYPE: Record<BusinessType, string[]> = {
  hotel: ["Hotel Website", "Booking System", "SEO Services"],
  restaurant: ["Restaurant Website", "Online Menu + Reservations", "Digital Marketing"],
  jewellery: ["Jewellery Website", "Catalog + Lead Capture", "SEO Services"],
  hospital: ["Website Development", "Appointment System", "SEO Services"],
  coaching: ["Website Development", "Lead Funnel", "Digital Marketing"],
  gym: ["Website Development", "Membership Funnel", "AI Automation"],
  salon: ["Website Development", "Booking System", "Digital Marketing"],
  other: ["Website Development", "SEO Services", "AI Automation"],
};

const BASE_VALUE: Record<BusinessType, number> = {
  hotel: 60000,
  restaurant: 35000,
  jewellery: 55000,
  hospital: 70000,
  coaching: 30000,
  gym: 28000,
  salon: 22000,
  other: 40000,
};

/**
 * Opportunity detector — turns scores + business signals into a priority,
 * suggested services, estimated value, and closing probability.
 */
export function detectOpportunity(input: {
  businessType: BusinessType;
  scores: WebsiteScores;
  issues: string[];
  googleRating: number;
  reviewsCount: number;
}): {
  priority: LeadPriority;
  suggestedServices: string[];
  estimatedValue: number;
  closingProbability: number;
  reasoning: string;
} {
  const painScore = 100 - input.scores.overall; // worse site = more need
  const demand = Math.min(100, input.reviewsCount / 5); // active business
  const raw = painScore * 0.6 + demand * 0.4;

  let priority: LeadPriority = "low";
  if (raw >= 75) priority = "hot";
  else if (raw >= 55) priority = "high";
  else if (raw >= 35) priority = "medium";

  const suggestedServices = SERVICE_BY_TYPE[input.businessType];
  const valueMultiplier = 1 + (painScore / 100) * 0.6;
  const estimatedValue = Math.round(
    (BASE_VALUE[input.businessType] * valueMultiplier) / 1000,
  ) * 1000;

  const closingProbability = Math.min(
    92,
    Math.round(30 + painScore * 0.4 + demand * 0.2),
  );

  const reasoning =
    `${cap(input.businessType)} business with an overall web score of ${input.scores.overall}/100. ` +
    (input.issues.length
      ? `Key gaps: ${input.issues.slice(0, 3).join(", ")}. `
      : "Site is decent but has upside. ") +
    (input.reviewsCount > 50
      ? `Strong demand signal (${input.reviewsCount} reviews) means revenue to protect. `
      : "Growing business that can benefit from a stronger online presence. ") +
    `Recommend leading with ${suggestedServices[0]}.`;

  return { priority, suggestedServices, estimatedValue, closingProbability, reasoning };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
