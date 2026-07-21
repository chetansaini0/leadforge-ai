/**
 * CLI seed: inserts the reference portfolio set. Run with `npm run seed`.
 * User-scoped demo leads are seeded from the app via the "Load demo data" button.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Portfolio } from "../src/models/Portfolio";
import { SEED_PORTFOLIOS } from "../src/lib/ai/portfolio";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
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
  console.log(`Seeded ${SEED_PORTFOLIOS.length} portfolios.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
