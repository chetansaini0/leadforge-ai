import mongoose, { Schema, models, model } from "mongoose";

const ProposalSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    businessName: { type: String, required: true },
    variant: {
      type: String,
      enum: ["short", "detailed", "whatsapp", "email", "linkedin"],
      default: "detailed",
    },
    service: { type: String, default: "" },
    timelineWeeks: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    portfolioRefs: [{ type: Schema.Types.ObjectId, ref: "Portfolio" }],
    content: { type: String, required: true },
    generatedBy: { type: String, enum: ["ai", "template"], default: "template" },
  },
  { timestamps: true },
);

export type ProposalDoc = mongoose.InferSchemaType<typeof ProposalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Proposal = models.Proposal || model("Proposal", ProposalSchema);
