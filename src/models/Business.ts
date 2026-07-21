import mongoose, { Schema, models, model } from "mongoose";

/**
 * A Business is the raw discovered entity (from Lead Finder / manual entry).
 * A Lead references a Business and adds sales pipeline state.
 */
const BusinessSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, default: "" },
    type: {
      type: String,
      enum: ["hotel", "restaurant", "jewellery", "hospital", "coaching", "gym", "salon", "other"],
      default: "other",
      index: true,
    },
    website: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    googleRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    social: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "India" },
      placeId: { type: String, default: "" },
    },
    source: { type: String, enum: ["manual", "places", "import"], default: "manual" },
  },
  { timestamps: true },
);

BusinessSchema.index({ name: "text", "location.city": "text" });

export type BusinessDoc = mongoose.InferSchemaType<typeof BusinessSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Business = models.Business || model("Business", BusinessSchema);
