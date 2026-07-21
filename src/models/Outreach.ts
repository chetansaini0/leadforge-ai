import mongoose, { Schema, models, model } from "mongoose";

const OutreachSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    businessName: { type: String, default: "" },
    channel: { type: String, enum: ["email", "whatsapp", "linkedin"], default: "email" },
    kind: {
      type: String,
      enum: ["cold", "seo_audit", "redesign", "automation", "followup", "closing"],
      default: "cold",
    },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    sequenceStep: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "opened", "replied", "bounced"],
      default: "draft",
      index: true,
    },
    sentAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
    openCount: { type: Number, default: 0 },
    repliedAt: { type: Date, default: null },
    generatedBy: { type: String, enum: ["ai", "template"], default: "template" },
  },
  { timestamps: true },
);

export type OutreachDoc = mongoose.InferSchemaType<typeof OutreachSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Outreach = models.Outreach || model("Outreach", OutreachSchema);
