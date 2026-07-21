export type Role = "admin" | "member";

export type BusinessType =
  | "hotel"
  | "restaurant"
  | "jewellery"
  | "hospital"
  | "coaching"
  | "gym"
  | "salon"
  | "other";

export type LeadPriority = "low" | "medium" | "high" | "hot";

export const PIPELINE_STAGES = [
  "new",
  "contacted",
  "interested",
  "meeting",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const SERVICE_OPTIONS = [
  "Website Development",
  "Hotel Website",
  "Restaurant Website",
  "Jewellery Website",
  "SEO Services",
  "AI Automation",
  "Digital Marketing",
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

export type WebsiteScores = {
  seo: number;
  mobile: number;
  speed: number;
  design: number;
  conversion: number;
  overall: number;
};

export type ProposalVariant =
  | "short"
  | "detailed"
  | "whatsapp"
  | "email"
  | "linkedin";
