import { connectDB } from "@/lib/db";
import { Portfolio } from "@/models/Portfolio";
import { Business } from "@/models/Business";
import { Lead } from "@/models/Lead";
import { requireAuth, ok, fail } from "@/lib/api";
import { SEED_PORTFOLIOS } from "@/lib/ai/portfolio";
import { analyzeWebsite, detectOpportunity } from "@/lib/ai/analysis";
import type { BusinessType } from "@/types";

const DEMO_LEADS: Array<{
  name: string;
  type: BusinessType;
  contact: string;
  website: string;
  city: string;
  rating: number;
  reviews: number;
  stage: string;
}> = [
  { name: "Sunrise Grand Hotel", type: "hotel", contact: "Rakesh", website: "", city: "Jaipur", rating: 4.1, reviews: 320, stage: "new" },
  { name: "Spice Villa Restaurant", type: "restaurant", contact: "Meena", website: "http://spicevilla.example", city: "Jaipur", rating: 3.8, reviews: 190, stage: "contacted" },
  { name: "Royal Gems & Jewellers", type: "jewellery", contact: "", website: "", city: "Sikar", rating: 4.5, reviews: 88, stage: "interested" },
  { name: "FitZone Gym", type: "gym", contact: "Amit", website: "http://fitzone.example", city: "Jaipur", rating: 4.0, reviews: 140, stage: "new" },
  { name: "Glow Salon & Spa", type: "salon", contact: "Neha", website: "", city: "Jaipur", rating: 4.3, reviews: 210, stage: "proposal" },
  { name: "BrightMind Coaching", type: "coaching", contact: "Sir Verma", website: "http://brightmind.example", city: "Kota", rating: 4.6, reviews: 512, stage: "meeting" },
];

export async function POST() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();

    // Seed portfolios once (global reference set).
    for (const p of SEED_PORTFOLIOS) {
      await Portfolio.updateOne(
        { name: p.name },
        {
          $setOnInsert: {
            name: p.name,
            businessType: p.businessType,
            blurb: p.blurb,
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl,
            stack: p.stack,
            highlights: p.highlights,
            isSeed: true,
          },
        },
        { upsert: true },
      );
    }

    // Only seed demo leads if this user has none yet.
    const existing = await Lead.countDocuments({ owner: auth.sub });
    let created = 0;
    if (existing === 0) {
      for (const d of DEMO_LEADS) {
        const business = await Business.create({
          owner: auth.sub,
          name: d.name,
          ownerName: d.contact,
          type: d.type,
          website: d.website,
          city: d.city,
          googleRating: d.rating,
          reviewsCount: d.reviews,
          location: { city: d.city, country: "India" },
          source: "manual",
        });
        const { scores, issues } = analyzeWebsite({ website: d.website, googleRating: d.rating, reviewsCount: d.reviews });
        const opp = detectOpportunity({ businessType: d.type, scores, issues, googleRating: d.rating, reviewsCount: d.reviews });
        await Lead.create({
          owner: auth.sub,
          business: business._id,
          businessName: d.name,
          businessType: d.type,
          contactName: d.contact,
          website: d.website,
          city: d.city,
          stage: d.stage,
          priority: opp.priority,
          scores,
          issues,
          suggestedServices: opp.suggestedServices,
          estimatedValue: opp.estimatedValue,
          closingProbability: opp.closingProbability,
          aiReasoning: opp.reasoning,
        });
        created++;
      }
    }

    return ok({ portfolios: SEED_PORTFOLIOS.length, demoLeadsCreated: created });
  } catch (err) {
    console.error(err);
    return fail("Seed failed. Is the database configured?", 500);
  }
}
