import mongoose, { Schema, models, model } from "mongoose";
import { PIPELINE_STAGES } from "@/types";

const ScoresSchema = new Schema(
  {
    seo: Number,
    mobile: Number,
    speed: Number,
    design: Number,
    conversion: Number,
    overall: Number,
  },
  { _id: false },
);

const LeadSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true },

    // Denormalized snapshot for fast list/search without populate.
    businessName: { type: String, required: true, index: true },
    businessType: { type: String, default: "other", index: true },
    contactName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    city: { type: String, default: "" },

    stage: { type: String, enum: PIPELINE_STAGES, default: "new", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "hot"], default: "medium", index: true },
    order: { type: Number, default: 0 },

    scores: { type: ScoresSchema, default: undefined },
    issues: { type: [String], default: [] },
    suggestedServices: { type: [String], default: [] },
    estimatedValue: { type: Number, default: 0 },
    closingProbability: { type: Number, default: 0 },

    aiReasoning: { type: String, default: "" },
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
    lastContactedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type LeadDoc = mongoose.InferSchemaType<typeof LeadSchema> & { _id: mongoose.Types.ObjectId };

/** Plain-object shape returned by `.lean()` — used to type query results. */
export type LeanLead = {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  stage: string;
  priority: "low" | "medium" | "high" | "hot";
  scores?: { seo: number; mobile: number; speed: number; design: number; conversion: number; overall: number };
  issues?: string[];
  suggestedServices?: string[];
  estimatedValue?: number;
  closingProbability?: number;
  aiReasoning?: string;
  notes?: string;
  createdAt?: Date;
};

export const Lead = models.Lead || model("Lead", LeadSchema);
