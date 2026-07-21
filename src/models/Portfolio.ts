import mongoose, { Schema, models, model } from "mongoose";

const PortfolioSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    businessType: {
      type: String,
      enum: ["hotel", "restaurant", "jewellery", "hospital", "coaching", "gym", "salon", "other"],
      default: "other",
      index: true,
    },
    blurb: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    stack: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    isSeed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type PortfolioDoc = mongoose.InferSchemaType<typeof PortfolioSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Portfolio = models.Portfolio || model("Portfolio", PortfolioSchema);
