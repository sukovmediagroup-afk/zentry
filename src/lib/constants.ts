// Zentry / ARENA USA — domain constants

// 16 editorial categories. Slugs are URL-safe, used as primary identifiers.
// Order matters — this is the canonical left-nav order.
export interface CategoryDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;        // lucide-react icon name
  color: string;       // accent color hex
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "cat_politics",
    name: "Politics",
    slug: "politics",
    description: "Elections, government, public policy, political analysis.",
    icon: "Landmark",
    color: "#c93f4b",
    subcategories: ["Elections", "Government", "Public Policy", "Political Analysis"],
  },
  {
    id: "cat_investing",
    name: "Investing & Banking",
    slug: "investing-banking",
    description: "Stocks, crypto, banking, commodities, market analysis.",
    icon: "TrendingUp",
    color: "#4b9bc9",
    subcategories: ["Stocks", "Crypto", "Banking", "Commodities", "Market Analysis"],
  },
  {
    id: "cat_personal_finance",
    name: "Personal Finance",
    slug: "personal-finance",
    description: "Budgeting, saving, taxes, credit, insurance.",
    icon: "Wallet",
    color: "#4bc97a",
    subcategories: ["Budgeting", "Saving", "Taxes", "Credit", "Insurance"],
  },
  {
    id: "cat_careers",
    name: "Careers & Learning",
    slug: "careers-learning",
    description: "Remote work, jobs, education, freelancing.",
    icon: "Briefcase",
    color: "#c98a4b",
    subcategories: ["Remote Work", "Jobs", "Education", "Freelancing"],
  },
  {
    id: "cat_tech",
    name: "Technology & AI",
    slug: "technology-ai",
    description: "Artificial intelligence, software, startups, cybersecurity.",
    icon: "Cpu",
    color: "#9b4bc9",
    subcategories: ["Artificial Intelligence", "Software", "Startups", "Cybersecurity"],
  },
  {
    id: "cat_sports",
    name: "Sports & Esports",
    slug: "sports-esports",
    description: "Sports, esports, gaming news and analysis.",
    icon: "Trophy",
    color: "#c9c94b",
    subcategories: ["NFL", "NBA", "MLB", "Esports", "Gaming"],
  },
  {
    id: "cat_electronics",
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    description: "Smartphones, computers, wearables, smart home, reviews.",
    icon: "Smartphone",
    color: "#4bc9c9",
    subcategories: ["Smartphones", "Computers", "Wearables", "Smart Home", "Reviews"],
  },
  {
    id: "cat_housing",
    name: "Renting & Housing",
    slug: "renting-housing",
    description: "Apartments, rental market, tenant rights, moving.",
    icon: "Home",
    color: "#c97a4b",
    subcategories: ["Apartments", "Rental Market", "Tenant Rights", "Moving"],
  },
  {
    id: "cat_home",
    name: "Home & Interior",
    slug: "home-interior",
    description: "Interior design, DIY, repairs, organization.",
    icon: "Sofa",
    color: "#c94b8a",
    subcategories: ["Interior Design", "DIY", "Repairs", "Organization"],
  },
  {
    id: "cat_hobbies",
    name: "Hobbies",
    slug: "hobbies",
    description: "Arts, photography, crafts, outdoor activities.",
    icon: "Palette",
    color: "#7ac94b",
    subcategories: ["Arts", "Photography", "Crafts", "Outdoor"],
  },
  {
    id: "cat_travel",
    name: "Travel in the USA",
    slug: "travel-usa",
    description: "City guides, road trips, national parks, travel deals.",
    icon: "Plane",
    color: "#4b7ac9",
    subcategories: ["City Guides", "Road Trips", "National Parks", "Travel Deals"],
  },
  {
    id: "cat_pets",
    name: "Pets",
    slug: "pets",
    description: "Dogs, cats, pet care, training.",
    icon: "PawPrint",
    color: "#c9a04b",
    subcategories: ["Dogs", "Cats", "Pet Care", "Training"],
  },
  {
    id: "cat_fashion",
    name: "Fashion & Beauty",
    slug: "fashion-beauty",
    description: "Fashion, skincare, hair, product reviews.",
    icon: "Shirt",
    color: "#c94bc9",
    subcategories: ["Fashion", "Skincare", "Hair", "Product Reviews"],
  },
  {
    id: "cat_food",
    name: "Food & Nutrition",
    slug: "food-nutrition",
    description: "Recipes, meal planning, healthy eating.",
    icon: "UtensilsCrossed",
    color: "#c96b4b",
    subcategories: ["Recipes", "Meal Planning", "Healthy Eating"],
  },
  {
    id: "cat_health",
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Fitness, yoga, sleep, evidence-based health.",
    icon: "HeartPulse",
    color: "#c94b4b",
    subcategories: ["Fitness", "Yoga", "Sleep", "Evidence-Based Health"],
  },
  {
    id: "cat_holidays",
    name: "US Holidays & Events",
    slug: "us-holidays-events",
    description: "Federal holidays, observances, local events.",
    icon: "CalendarHeart",
    color: "#4bc97a",
    subcategories: ["Federal Holidays", "Observances", "Local Events"],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

// Project-wide defaults
export const PROJECT_DEFAULTS = {
  pollIntervalSeconds: 600,
  publicRetentionHours: 48,
  language: "en-US",
  requireSourceAttribution: true,
  publishWithoutReview: false,
  duplicateDetection: true,
  siteName: "ARENA USA",
  siteTagline: "What was yesterday — tomorrow will no longer matter.",
  siteDescription:
    "ARENA USA is an AI-powered American digital media platform. Trending news, finance, technology, lifestyle, and culture — curated by AI agents and reviewed by editors.",
  siteUrl: "https://arena-usa.vercel.app",
  siteLocale: "en_US",
  twitterHandle: "@arenausa",
};

// Symbols for the market ticker
export const MARKET_TICKER_SYMBOLS = [
  { symbol: "BTC",   name: "Bitcoin",     currency: "USD" },
  { symbol: "ETH",   name: "Ethereum",    currency: "USD" },
  { symbol: "EURUSD",name: "EUR/USD",     currency: "USD" },
  { symbol: "OIL",   name: "Crude Oil",   currency: "USD" },
  { symbol: "NG",    name: "Natural Gas", currency: "USD" },
  { symbol: "GOLD",  name: "Gold",        currency: "USD" },
  { symbol: "SILVER",name: "Silver",      currency: "USD" },
  { symbol: "SPX",   name: "S&P 500",     currency: "USD" },
  { symbol: "TSLA",  name: "Tesla",       currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet",    currency: "USD" },
  { symbol: "AMZN",  name: "Amazon",      currency: "USD" },
  { symbol: "AAPL",  name: "Apple",       currency: "USD" },
  { symbol: "MSFT",  name: "Microsoft",   currency: "USD" },
  { symbol: "NVDA",  name: "NVIDIA",      currency: "USD" },
  { symbol: "META",  name: "Meta",        currency: "USD" },
  { symbol: "NFLX",  name: "Netflix",     currency: "USD" },
];

// Donation defaults (admin-configurable; safe demo placeholders)
export const DEMO_DONATIONS = [
  { coin: "BTC",  network: "mainnet", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { coin: "ETH",  network: "ERC20",   address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
  { coin: "USDT", network: "TRC20",  address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE" },
  { coin: "USDC", network: "ERC20",   address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
];

// Zodiak signs for the horoscope sidebar widget
export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
