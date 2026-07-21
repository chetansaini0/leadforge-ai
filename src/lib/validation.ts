import { z } from "zod";
import { PIPELINE_STAGES } from "@/types";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const businessTypes = [
  "hotel",
  "restaurant",
  "jewellery",
  "hospital",
  "coaching",
  "gym",
  "salon",
  "other",
] as const;

export const leadCreateSchema = z.object({
  businessName: z.string().min(2).max(120),
  businessType: z.enum(businessTypes).default("other"),
  contactName: z.string().max(120).optional().default(""),
  email: z.string().email().or(z.literal("")).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  website: z.string().max(200).optional().default(""),
  city: z.string().max(80).optional().default(""),
  googleRating: z.number().min(0).max(5).optional().default(0),
  reviewsCount: z.number().min(0).optional().default(0),
  notes: z.string().max(2000).optional().default(""),
});

export const leadUpdateSchema = z.object({
  stage: z.enum(PIPELINE_STAGES).optional(),
  priority: z.enum(["low", "medium", "high", "hot"]).optional(),
  order: z.number().optional(),
  notes: z.string().max(2000).optional(),
  estimatedValue: z.number().min(0).optional(),
  closingProbability: z.number().min(0).max(100).optional(),
  suggestedServices: z.array(z.string()).optional(),
});

export const proposalSchema = z.object({
  leadId: z.string().min(1),
  variant: z.enum(["short", "detailed", "whatsapp", "email", "linkedin"]).default("detailed"),
  service: z.string().optional().default(""),
  timelineWeeks: z.number().min(0).optional().default(0),
  price: z.number().min(0).optional().default(0),
});

export const outreachSchema = z.object({
  leadId: z.string().min(1),
  channel: z.enum(["email", "whatsapp", "linkedin"]).default("email"),
  kind: z
    .enum(["cold", "seo_audit", "redesign", "automation", "followup", "closing"])
    .default("cold"),
  step: z.number().min(0).optional().default(0),
});

export const assistantSchema = z.object({
  message: z.string().min(1).max(2000),
  leadId: z.string().optional(),
});
