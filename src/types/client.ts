import type { LeadPriority, PipelineStage, WebsiteScores } from "@/types";

export type ClientLead = {
  _id: string;
  businessName: string;
  businessType: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  stage: PipelineStage;
  priority: LeadPriority;
  order?: number;
  scores?: WebsiteScores;
  issues?: string[];
  suggestedServices?: string[];
  estimatedValue?: number;
  closingProbability?: number;
  aiReasoning?: string;
  notes?: string;
  createdAt?: string;
};

export type AnalyticsSummary = {
  totals: {
    leads: number;
    emailsSent: number;
    replies: number;
    proposals: number;
    meetings: number;
    conversionRate: number;
    revenue: number;
  };
  byStage: Record<string, number>;
  byType: Record<string, number>;
  trend: { label: string; leads: number }[];
};
