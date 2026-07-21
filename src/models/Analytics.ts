import mongoose, { Schema, models, model } from "mongoose";

/**
 * Daily rollup of activity per user. Kept as a time-series style collection so
 * the analytics dashboard can query ranges cheaply without scanning raw events.
 */
const AnalyticsSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    leadsAdded: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    repliesReceived: { type: Number, default: 0 },
    meetingsBooked: { type: Number, default: 0 },
    proposalsSent: { type: Number, default: 0 },
    dealsWon: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AnalyticsSchema.index({ owner: 1, date: 1 }, { unique: true });

export type AnalyticsDoc = mongoose.InferSchemaType<typeof AnalyticsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Analytics = models.Analytics || model("Analytics", AnalyticsSchema);
