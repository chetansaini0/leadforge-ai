import type { BusinessType } from "@/types";

export type LeadCandidate = {
  businessName: string;
  businessType: BusinessType;
  contactName?: string;
  website: string;
  phone: string;
  city: string;
  googleRating: number;
  reviewsCount: number;
  placeId?: string;
  source: "places" | "sample";
};

export function placesEnabled(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY);
}

const TYPE_KEYWORD: Record<BusinessType, string> = {
  hotel: "hotels",
  restaurant: "restaurants",
  jewellery: "jewellery stores",
  hospital: "hospitals",
  coaching: "coaching institutes",
  gym: "gyms",
  salon: "salons",
  other: "local businesses",
};

/**
 * Discover businesses. Uses the official Google Places API (Text Search) when a
 * key is configured; otherwise returns clearly-labeled sample candidates so the
 * module is fully usable for demos without external billing.
 */
export async function searchLeads(
  businessType: BusinessType,
  city: string,
  keyword: string,
): Promise<{ candidates: LeadCandidate[]; live: boolean }> {
  const query = [keyword || TYPE_KEYWORD[businessType], city ? `in ${city}` : ""].join(" ").trim();

  if (placesEnabled()) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY as string,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber",
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
      });
      if (res.ok) {
        const data = (await res.json()) as { places?: PlaceResult[] };
        const candidates = (data.places ?? []).map<LeadCandidate>((p) => ({
          businessName: p.displayName?.text ?? "Unknown",
          businessType,
          website: p.websiteUri ?? "",
          phone: p.nationalPhoneNumber ?? "",
          city: city || extractCity(p.formattedAddress ?? ""),
          googleRating: p.rating ?? 0,
          reviewsCount: p.userRatingCount ?? 0,
          placeId: p.id,
          source: "places",
        }));
        return { candidates, live: true };
      }
      console.error("[places] non-OK response", res.status);
    } catch (err) {
      console.error("[places] search failed, using samples", err);
    }
  }

  return { candidates: generateSamples(businessType, city), live: false };
}

type PlaceResult = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
};

function extractCity(address: string): string {
  const parts = address.split(",").map((s) => s.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? "";
}

const NAME_PARTS: Record<BusinessType, { prefix: string[]; suffix: string[] }> = {
  hotel: { prefix: ["Sunrise", "Royal", "Grand", "Heritage", "Palm", "Blue Orchid"], suffix: ["Hotel", "Grand", "Residency", "Inn", "Palace"] },
  restaurant: { prefix: ["Spice", "Tandoori", "Green Leaf", "Urban", "Curry", "Flavours"], suffix: ["Restaurant", "Kitchen", "Diner", "Bistro", "Dhaba"] },
  jewellery: { prefix: ["Royal", "Shree", "Golden", "Diamond", "Ratna", "Kalash"], suffix: ["Jewellers", "Gems", "Jewels", "Ornaments"] },
  hospital: { prefix: ["City", "LifeCare", "Apex", "Sunrise", "Wellness", "Aarogya"], suffix: ["Hospital", "Clinic", "Care", "Medical Centre"] },
  coaching: { prefix: ["BrightMind", "Apex", "Success", "Genius", "Vidya", "Target"], suffix: ["Academy", "Classes", "Institute", "Coaching"] },
  gym: { prefix: ["FitZone", "Iron", "Pulse", "Muscle", "Prime", "Flex"], suffix: ["Gym", "Fitness", "Studio", "Club"] },
  salon: { prefix: ["Glow", "Style", "Blush", "Mirror", "Trends", "Scissors"], suffix: ["Salon", "Spa", "Studio", "Beauty Lounge"] },
  other: { prefix: ["Prime", "Metro", "Nova", "Apex", "Urban", "Peak"], suffix: ["Services", "Solutions", "Enterprises", "Co"] },
};

function generateSamples(type: BusinessType, city: string): LeadCandidate[] {
  const { prefix, suffix } = NAME_PARTS[type];
  const out: LeadCandidate[] = [];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const name = `${prefix[i % prefix.length]} ${suffix[(i + 2) % suffix.length]}`;
    const hasSite = i % 3 !== 0;
    const rating = Math.round((3.4 + (i % 5) * 0.35) * 10) / 10;
    out.push({
      businessName: name,
      businessType: type,
      website: hasSite ? `http://${name.toLowerCase().replace(/[^a-z]+/g, "")}.example` : "",
      phone: `+91 9${(800000000 + i * 12345).toString().slice(0, 9)}`,
      city: city || "Jaipur",
      googleRating: rating,
      reviewsCount: 30 + ((i * 47) % 480),
      source: "sample",
    });
  }
  return out;
}
