import mongoose, { Schema, models, model } from "mongoose";

const MeetingSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    leadName: { type: String, default: "" },
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    durationMins: { type: Number, default: 30 },
    provider: {
      type: String,
      enum: ["google_meet", "zoom", "phone", "in_person"],
      default: "google_meet",
    },
    joinUrl: { type: String, default: "" },
    calendarUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export type MeetingDoc = mongoose.InferSchemaType<typeof MeetingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Meeting = models.Meeting || model("Meeting", MeetingSchema);
