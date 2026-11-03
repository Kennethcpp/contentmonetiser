export const AD_CATEGORIES = [
  "Tech & Gadgets",
  "Fashion & Beauty",
  "Education & Career",
  "Entertainment & Comedy",
  "Finance & Crypto",
  "Health & Wellness",
  "Food & Drinks",
  "Real Estate & Housing",
  "E-commerce & Retail",
  "Automotive & Travel",
  "Services & Freelancing",
  "General Lifestyle",
];

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  const keywords: Record<string, string[]> = {
    "Tech & Gadgets": ["phone", "tech", "laptop", "software", "app", "earbuds", "gadget", "device", "ai", "computer", "digital"],
    "Fashion & Beauty": ["dress", "shoes", "fashion", "skincare", "hair", "perfume", "clothes", "cosmetics", "style", "wear", "makeup"],
    "Education & Career": ["course", "learn", "bootcamp", "training", "school", "class", "degree", "skills", "tutoring", "job", "career"],
    "Entertainment & Comedy": ["movie", "skit", "music", "song", "comedy", "event", "concert", "show", "funny", "creator", "video"],
    "Finance & Crypto": ["money", "crypto", "bitcoin", "investment", "fintech", "loan", "bank", "wealth", "trading", "savings", "dollar", "naira"],
    "Health & Wellness": ["fitness", "gym", "health", "supplement", "weight", "diet", "medical", "herbal", "wellness", "doctor", "clinic"],
    "Food & Drinks": ["restaurant", "food", "snacks", "drinks", "chef", "catering", "bites", "coffee", "meal", "kitchen"],
    "Real Estate & Housing": ["property", "house", "apartment", "real estate", "land", "rent", "estate", "building", "duplex"],
    "E-commerce & Retail": ["shop", "store", "buy", "discount", "sale", "order", "delivery", "shopping", "ecommerce", "promo"],
    "Automotive & Travel": ["car", "cars", "auto", "vehicle", "travel", "flight", "tour", "hotel", "drive", "ride"],
  };

  for (const [cat, words] of Object.entries(keywords)) {
    for (const w of words) {
      if (lower.includes(w)) {
        return cat;
      }
    }
  }

  return "General Lifestyle";
}
