import mongoose, { Schema, models, model } from "mongoose";

const CampaignSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    service: { type: String, default: "" },
    targetType: { type: String, default: "other" },
    channel: { type: String, enum: ["email", "whatsapp", "linkedin"], default: "email" },
    status: { type: String, enum: ["draft", "active", "paused", "completed"], default: "draft" },
    leads: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    stats: {
      sent: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
      meetings: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export type CampaignDoc = mongoose.InferSchemaType<typeof CampaignSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Campaign = models.Campaign || model("Campaign", CampaignSchema);
