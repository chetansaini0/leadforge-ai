/**
 * One-off cleanup: removes a user's leads/businesses and related records
 * (proposals, outreach, meetings) so the account starts clean.
 * Usage: npx tsx --env-file=.env.local scripts/clear-demo.ts you@example.com
 */
import mongoose from "mongoose";
import { User } from "../src/models/User";
import { Lead } from "../src/models/Lead";
import { Business } from "../src/models/Business";
import { Proposal } from "../src/models/Proposal";
import { Outreach } from "../src/models/Outreach";
import { Meeting } from "../src/models/Meeting";

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Pass an email: npx tsx scripts/clear-demo.ts you@example.com");

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  const user = await User.findOne({ email: email.toLowerCase() }).lean<{ _id: mongoose.Types.ObjectId } | null>();
  if (!user) throw new Error(`No user found for ${email}`);

  const owner = user._id;
  const [leads, businesses, proposals, outreach, meetings] = await Promise.all([
    Lead.deleteMany({ owner }),
    Business.deleteMany({ owner }),
    Proposal.deleteMany({ owner }),
    Outreach.deleteMany({ owner }),
    Meeting.deleteMany({ owner }),
  ]);

  console.log(`Cleared for ${email}:`);
  console.log(`  leads:      ${leads.deletedCount}`);
  console.log(`  businesses: ${businesses.deletedCount}`);
  console.log(`  proposals:  ${proposals.deletedCount}`);
  console.log(`  outreach:   ${outreach.deletedCount}`);
  console.log(`  meetings:   ${meetings.deletedCount}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
