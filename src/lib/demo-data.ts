// Demo data for ARENA USA Phase 1.
// All values are clearly labeled DEMO and must be replaced by real
// RSS / API ingestion in Phase 2.
import { CATEGORIES, MARKET_TICKER_SYMBOLS, ZODIAC_SIGNS } from "./constants";

export interface DemoArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  categoryName: string;
  categoryColor: string;
  coverImageUrl: string;
  coverImageAlt: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;       // ISO
  readingMinutes: number;
  isBreaking: boolean;
  featured: boolean;
  keepForever: boolean;
  tags: string[];
  aiSummary: string;
  aiConfidence: number;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

export const DEMO_ARTICLES: DemoArticle[] = [
  {
    id: "demo_001",
    title: "Federal Reserve Holds Rates Steady as Inflation Cools to 2.4%",
    slug: "federal-reserve-holds-rates-steady-inflation-cools",
    excerpt:
      "The Federal Open Market Committee voted unanimously to maintain the federal funds rate at 4.50–4.75%, citing cooling inflation and a resilient labor market.",
    content: `The Federal Open Market Committee voted unanimously to maintain the federal funds rate target range at 4.50–4.75% at the conclusion of its two-day policy meeting.

In a statement, the Committee noted that inflation has continued to ease toward the central bank's 2% goal, with the personal consumption expenditures price index rising 2.4% year-over-year in the latest reading.

"Recent indicators suggest that economic activity has continued to expand at a solid pace," the statement read. "Job gains have remained strong, and the unemployment rate has stayed low."

Markets responded positively to the decision, with the S&P 500 gaining 0.6% in afternoon trading. Treasury yields slipped modestly across the curve.

Analysts at several major banks now expect one more rate cut before year-end, contingent on continued progress on inflation and stability in the labor market.

The next FOMC meeting is scheduled in six weeks, with updated economic projections and the Summary of Economic Projections dot plot.`,
    categorySlug: "investing-banking",
    categoryName: "Investing & Banking",
    categoryColor: "#4b9bc9",
    coverImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a723624?w=1200&auto=format&fit=crop",
    coverImageAlt: "Federal Reserve building exterior with classical columns",
    sourceName: "Federal Reserve Press Release",
    sourceUrl: "https://www.federalreserve.gov",
    publishedAt: hoursAgo(2),
    readingMinutes: 3,
    isBreaking: true,
    featured: true,
    keepForever: false,
    tags: ["Federal Reserve", "Interest Rates", "Inflation", "Markets"],
    aiSummary:
      "The Fed kept its benchmark rate at 4.50–4.75% as annual inflation cooled to 2.4%. Markets rallied; analysts expect one more cut in 2024.",
    aiConfidence: 0.92,
  },
  {
    id: "demo_002",
    title: "OpenAI Launches New Reasoning Model With 50% Lower Latency",
    slug: "openai-launches-new-reasoning-model-50-percent-lower-latency",
    excerpt:
      "The new o-series model reduces median response time from 8.4 seconds to 4.1 seconds while improving accuracy on graduate-level reasoning benchmarks.",
    content: `OpenAI today announced the launch of its latest reasoning-focused model, which the company says reduces median response latency by 50% while improving accuracy on graduate-level science and mathematics benchmarks.

According to internal benchmarks shared with the press, the new model achieves 89.4% accuracy on the GPQA Diamond benchmark — a graduate-level test of physics, biology, and chemistry reasoning — up from 83.2% on the previous generation.

"Reasoning is the foundation of useful AI," an OpenAI spokesperson said. "Today's release makes that capability faster and more reliable for developers building production applications."

The model is available immediately through the OpenAI API for tier-3 customers and above. Pricing is set at $15 per million input tokens and $60 per million output tokens.

Independent AI researchers welcomed the latency improvements, with several noting that response time has become a critical bottleneck for agentic applications that chain many model calls.

OpenAI also announced plans to release a smaller, distilled variant later this quarter aimed at on-device use cases.`,
    categorySlug: "technology-ai",
    categoryName: "Technology & AI",
    categoryColor: "#9b4bc9",
    coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop",
    coverImageAlt: "Abstract neural network visualization with glowing nodes",
    sourceName: "OpenAI Newsroom",
    sourceUrl: "https://openai.com/news",
    publishedAt: hoursAgo(5),
    readingMinutes: 3,
    isBreaking: false,
    featured: true,
    keepForever: true,
    tags: ["OpenAI", "AI Models", "Reasoning", "API"],
    aiSummary:
      "OpenAI released a new reasoning model that cuts latency by 50% and improves accuracy on graduate-level benchmarks, priced at $15/$60 per million input/output tokens.",
    aiConfidence: 0.95,
  },
  {
    id: "demo_003",
    title: "Tesla Delivers Record 521,000 Vehicles in Q3, Beats Expectations",
    slug: "tesla-delivers-record-521000-vehicles-q3-beats-expectations",
    excerpt:
      "Tesla reported 521,000 vehicle deliveries in the third quarter, exceeding analyst estimates of 487,000 and setting a new quarterly record.",
    content: `Tesla delivered a record 521,000 vehicles in the third quarter, the company announced this morning, surpassing Wall Street consensus estimates of 487,000 units.

The figure represents a 6.4% increase from the previous record set in Q4 2023. Production reached 529,000 vehicles, suggesting healthy demand and operational execution across Tesla's gigafactories.

Shares rose 4.2% in pre-market trading following the announcement.

Analysts at Wedbush raised their price target to $310 from $285, calling the delivery numbers "a clear positive signal" that demand for the refreshed Model 3 and the new Cybertruck is exceeding production capacity.

Tesla said it remains on track to deliver its more affordable next-generation vehicle in the first half of next year, with CEO Elon Musk confirming in a post on X that the vehicle is "fully tooled and entering pilot production."

The company will report full financial results in three weeks, with investors focused on automotive gross margin and energy storage growth.`,
    categorySlug: "investing-banking",
    categoryName: "Investing & Banking",
    categoryColor: "#4b9bc9",
    coverImageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&auto=format&fit=crop",
    coverImageAlt: "Tesla electric vehicles lined up at a delivery center",
    sourceName: "Tesla Investor Relations",
    sourceUrl: "https://ir.tesla.com",
    publishedAt: hoursAgo(8),
    readingMinutes: 2,
    isBreaking: false,
    featured: false,
    keepForever: false,
    tags: ["Tesla", "Electric Vehicles", "Earnings", "Stocks"],
    aiSummary:
      "Tesla delivered a record 521,000 vehicles in Q3, beating estimates of 487,000. Shares rose 4.2% pre-market; analysts raised price targets.",
    aiConfidence: 0.88,
  },
  {
    id: "demo_004",
    title: "Senate Passes Bipartisan Infrastructure Bill Focused on EV Charging",
    slug: "senate-passes-bipartisan-infrastructure-bill-ev-charging",
    excerpt:
      "The $14.2 billion bill would fund 500,000 public EV charging stations nationwide, with a focus on rural and underserved areas.",
    content: `The United States Senate today passed a $14.2 billion bipartisan infrastructure bill aimed at dramatically expanding the nation's electric vehicle charging network.

The legislation, which passed 78–22, would fund the construction of 500,000 public charging stations over the next seven years, with priority given to rural communities, low-income neighborhoods, and highway corridors currently underserved by private investment.

"For too long, the EV revolution has been a coastal phenomenon," said Senator Maria Cantwell (D-WA), one of the bill's lead sponsors. "Today's vote ensures that an American in rural Wyoming has the same access to clean transportation as one in San Francisco."

The bill now moves to the House, where leadership has indicated a vote could happen as early as next week. The White House has signaled support.

Industry groups including the Edison Electric Institute and the Alliance for Automotive Innovation praised the measure. The legislation also includes $2 billion for workforce training programs focused on EV maintenance and charging infrastructure installation.`,
    categorySlug: "politics",
    categoryName: "Politics",
    categoryColor: "#c93f4b",
    coverImageUrl: "https://images.unsplash.com/photo-1565043666747-6920a983b6e8?w=1200&auto=format&fit=crop",
    coverImageAlt: "US Capitol building at sunset",
    sourceName: "Senate Press Gallery",
    sourceUrl: "https://www.senate.gov",
    publishedAt: hoursAgo(11),
    readingMinutes: 3,
    isBreaking: false,
    featured: false,
    keepForever: false,
    tags: ["Senate", "Infrastructure", "Electric Vehicles", "Bipartisan"],
    aiSummary:
      "The Senate passed a $14.2B bipartisan bill funding 500,000 EV charging stations over 7 years, prioritizing rural and underserved areas. The bill now heads to the House.",
    aiConfidence: 0.9,
  },
  {
    id: "demo_005",
    title: "10 Remote Work Skills That Will Define 2026",
    slug: "10-remote-work-skills-that-will-define-2026",
    excerpt:
      "From async communication to AI literacy, here are the skills employers say they will prioritize in remote hiring decisions next year.",
    content: `As remote and hybrid work continues to evolve, employers are redefining what they look for in distributed talent. Here are ten skills recruiters say will dominate hiring decisions in 2026.

**1. Asynchronous communication.** Writing clearly across time zones is now a core competency, not a nice-to-have.

**2. AI literacy.** Workers who can prompt, evaluate, and orchestrate AI tools are increasingly in demand.

**3. Self-directed project management.** Remote workers must manage their own priorities without daily standups.

**4. Technical writing.** Documentation has become the nervous system of distributed teams.

**5. Cross-cultural collaboration.** Working effectively with colleagues from different cultures and time zones.

**6. Digital boundary setting.** Protecting focus time while remaining reachable.

**7. Lightweight video production.** Async video updates have replaced many meetings.

**8. Data storytelling.** Making numbers meaningful for non-technical stakeholders.

**9. Cybersecurity hygiene.** Personal responsibility for keeping company data safe.

**10. Continuous learning.** The half-life of technical skills continues to shrink.

Job postings mentioning at least three of these skills have grown 47% year-over-year, according to recent labor market data.`,
    categorySlug: "careers-learning",
    categoryName: "Careers & Learning",
    categoryColor: "#c98a4b",
    coverImageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop",
    coverImageAlt: "Person working on a laptop in a bright home office",
    sourceName: "ARENA USA Editorial",
    sourceUrl: "https://arena-usa.vercel.app",
    publishedAt: hoursAgo(14),
    readingMinutes: 4,
    isBreaking: false,
    featured: false,
    keepForever: true,
    tags: ["Remote Work", "Skills", "Careers", "Hiring"],
    aiSummary:
      "Asynchronous communication, AI literacy, and self-directed project management top the list of skills recruiters will prioritize in 2026 remote hiring.",
    aiConfidence: 0.85,
  },
  {
    id: "demo_006",
    title: "How to Build a $1,000 Emergency Fund on a Tight Budget",
    slug: "how-to-build-1000-emergency-fund-on-tight-budget",
    excerpt:
      "A practical, step-by-step plan for building your first $1,000 emergency cushion — even if you're starting from zero.",
    content: `Building a $1,000 emergency fund is the single most impactful financial step most Americans can take. Here is a practical plan that works even on a tight budget.

**Step 1: Automate $25 per paycheck.** Set up an automatic transfer to a separate high-yield savings account. You won't miss what you never see.

**Step 2: Sell one unused item per week.** Most households have $300–$500 of sellable items gathering dust.

**Step 3: Pick up one micro-gig.** Even $40 per week of extra income gets you to $1,000 in six months.

**Step 4: Pause one subscription.** The average American spends $219 per month on subscriptions. Cutting one saves $10–$20 monthly.

**Step 5: Bank your windfalls.** Tax refunds, cash gifts, and rebates go directly to the fund.

**Step 6: Use a high-yield savings account.** Current rates around 4–5% mean your $1,000 earns $40–$50 per year with no effort.

**Step 7: Define the rules.** "Emergency" means job loss, medical issue, or essential home/vehicle repair — not vacations or sales.

The goal is psychological: a $1,000 cushion turns most "emergencies" into inconveniences.`,
    categorySlug: "personal-finance",
    categoryName: "Personal Finance",
    categoryColor: "#4bc97a",
    coverImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop",
    coverImageAlt: "Piggy bank with growing stack of dollar coins",
    sourceName: "ARENA USA Editorial",
    sourceUrl: "https://arena-usa.vercel.app",
    publishedAt: hoursAgo(18),
    readingMinutes: 3,
    isBreaking: false,
    featured: true,
    keepForever: true,
    tags: ["Emergency Fund", "Savings", "Budgeting"],
    aiSummary:
      "Automate $25 per paycheck, sell unused items weekly, and bank windfalls to reach a $1,000 emergency cushion in 6–12 months — even on a tight budget.",
    aiConfidence: 0.91,
  },
  {
    id: "demo_007",
    title: "Yosemite National Park Reopens Tioga Road After Record Snowpack",
    slug: "yosemite-reopens-tioga-road-after-record-snowpack",
    excerpt:
      "The iconic high-elevation highway through Yosemite's backcountry reopened this weekend, two weeks later than usual after one of the snowiest winters on record.",
    content: `Yosemite National Park has reopened Tioga Road to vehicular traffic for the season, two weeks later than the historical average due to record Sierra Nevada snowpack.

The high-elevation highway, which crosses the park from east to west and reaches 9,945 feet at Tioga Pass, had been closed since October due to one of the snowiest winters in California's recorded history.

Park rangers reported snow depths of 12–18 feet still present at higher elevations, with Tuolumne Meadows only recently emerging from snow cover.

Visitors are advised that some facilities, including the Tuolumne Meadows Lodge, will not open until later this month. Backcountry permits are available now, though hikers should be prepared for snow travel on north-facing slopes above 9,000 feet.

The reopening completes the seasonal access restoration at Yosemite, with all major park roads now accessible to visitors. Reservation requirements remain in effect for peak-day entry through September.`,
    categorySlug: "travel-usa",
    categoryName: "Travel in the USA",
    categoryColor: "#4b7ac9",
    coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop",
    coverImageAlt: "Yosemite granite cliffs with snow-fed waterfall",
    sourceName: "National Park Service",
    sourceUrl: "https://www.nps.gov/yose",
    publishedAt: hoursAgo(22),
    readingMinutes: 2,
    isBreaking: false,
    featured: false,
    keepForever: false,
    tags: ["Yosemite", "National Parks", "California", "Travel"],
    aiSummary:
      "Yosemite's Tioga Road reopened this weekend, two weeks late after record snow. Some high-elevation facilities remain closed; backcountry permits are available.",
    aiConfidence: 0.93,
  },
  {
    id: "demo_008",
    title: "5-Minute Morning Yoga Routine for Better Posture",
    slug: "5-minute-morning-yoga-routine-better-posture",
    excerpt:
      "A short, beginner-friendly sequence to undo the damage of desk work and screen time — no equipment required.",
    content: `Sitting is the new smoking, as the saying goes. Here is a five-minute morning sequence to undo the postural damage of desk work.

**1. Cat-Cow (1 minute).** On hands and knees, alternate arching and rounding your spine. Coordinate with breath.

**2. Thread-the-Needle (1 minute).** From hands and knees, thread one arm under your body, opening the chest and shoulders. Repeat on both sides.

**3. Downward Dog (30 seconds).** Walk your hands forward from hands-and-knees, lift your hips, and pedal your heels gently.

**4. Standing Forward Fold (1 minute).** From standing, hinge at the hips and let gravity lengthen your spine. Bend your knees if needed.

**5. Chest-Opening Wall Stretch (1 minute).** Place your forearm on a wall, elbow at shoulder height, and rotate your chest away from the wall.

Do this sequence every morning for two weeks. Most people report measurably less neck and shoulder tension by day ten.`,
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    categoryColor: "#c94b4b",
    coverImageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop",
    coverImageAlt: "Person practicing yoga pose on a wooden floor",
    sourceName: "ARENA USA Editorial",
    sourceUrl: "https://arena-usa.vercel.app",
    publishedAt: hoursAgo(28),
    readingMinutes: 2,
    isBreaking: false,
    featured: false,
    keepForever: true,
    tags: ["Yoga", "Posture", "Morning Routine", "Wellness"],
    aiSummary:
      "A five-minute morning yoga sequence — cat-cow, thread-the-needle, downward dog, forward fold, and chest-opening wall stretch — can reverse desk-work posture damage.",
    aiConfidence: 0.87,
  },
  {
    id: "demo_009",
    title: "Best Smart Thermostats of 2026: Tested and Reviewed",
    slug: "best-smart-thermostats-of-2026-tested-reviewed",
    excerpt:
      "After testing nine leading models over six months, here are the three that delivered the best combination of energy savings, ease of use, and integration.",
    content: `We tested nine leading smart thermostats over six months in homes ranging from 1,200 to 3,800 square feet. Three stood out.

**Best Overall: EcoNest Pro (3rd Gen).** $249. Saved an average of 14% on heating bills across our test homes. Excellent geofencing, native Matter support, and the cleanest app in the category. The only thermostat that correctly identified our heat pump system on the first try.

**Best Value: Honeywell Home T6 Pro.** $169. Skips the learning features but nails the essentials: reliable scheduling, responsive app, and solid HomeKit/Alexa/Google support. Saved an average of 9% on heating bills.

**Best for Large Homes: Ecobee Premium.** $279. Comes with a remote sensor that dramatically improves comfort in multi-story homes. The remote sensor alone is worth the upgrade if your thermostat lives in a hallway that's always too warm.

Skip the cheap off-brand units — three of the four we tested under $100 failed within six months, and two sent obviously wrong temperature readings.`,
    categorySlug: "electronics-gadgets",
    categoryName: "Electronics & Gadgets",
    categoryColor: "#4bc9c9",
    coverImageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&auto=format&fit=crop",
    coverImageAlt: "Modern smart thermostat mounted on a wall with a clean display",
    sourceName: "ARENA USA Reviews",
    sourceUrl: "https://arena-usa.vercel.app",
    publishedAt: hoursAgo(34),
    readingMinutes: 4,
    isBreaking: false,
    featured: true,
    keepForever: true,
    tags: ["Smart Home", "Reviews", "Thermostats", "Energy"],
    aiSummary:
      "EcoNest Pro 3rd Gen ($249) is best overall with 14% energy savings; Honeywell T6 Pro ($169) wins on value; Ecobee Premium ($279) is best for large multi-story homes.",
    aiConfidence: 0.84,
  },
  {
    id: "demo_010",
    title: "Quick 20-Minute Sheet Pan Salmon With Roasted Vegetables",
    slug: "quick-20-minute-sheet-pan-salmon-roasted-vegetables",
    excerpt:
      "A complete, healthy dinner on one pan. Six ingredients, twenty minutes, minimal cleanup — perfect for busy weeknights.",
    content: `This sheet pan salmon is the weeknight dinner we make most often. Six ingredients, twenty minutes, one pan.

**Ingredients (serves 2):**
- 2 salmon fillets (6 oz each)
- 1 pound baby potatoes, halved
- 1 bunch asparagus, trimmed
- 2 tablespoons olive oil
- 1 lemon, sliced
- Salt, pepper, dried dill

**Method:**
1. Preheat oven to 425°F (220°C). Line a sheet pan with parchment.
2. Toss potatoes with 1 tablespoon oil, salt, and pepper. Spread on one side of the pan. Roast 10 minutes.
3. Push potatoes to one side. Add salmon fillets skin-side down. Arrange asparagus and lemon slices around the salmon. Drizzle remaining oil over everything. Sprinkle with dill.
4. Roast 10 more minutes, until salmon flakes easily and reaches 145°F internal.
5. Squeeze roasted lemon over salmon before serving.

**Notes:** Substitute broccoli or green beans for asparagus. Add cherry tomatoes for sweetness. For meal prep, double the recipe — salmon keeps refrigerated up to 3 days.

Nutrition per serving: ~520 calories, 32g protein, 28g carbs, 28g fat.`,
    categorySlug: "food-nutrition",
    categoryName: "Food & Nutrition",
    categoryColor: "#c96b4b",
    coverImageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&auto=format&fit=crop",
    coverImageAlt: "Sheet pan with roasted salmon, potatoes, and asparagus",
    sourceName: "ARENA USA Kitchen",
    sourceUrl: "https://arena-usa.vercel.app",
    publishedAt: hoursAgo(40),
    readingMinutes: 2,
    isBreaking: false,
    featured: false,
    keepForever: false,
    tags: ["Recipes", "Salmon", "Sheet Pan", "Weeknight"],
    aiSummary:
      "Sheet pan salmon with potatoes and asparagus: 6 ingredients, 20 minutes, ~520 calories per serving. Doubles well for meal prep.",
    aiConfidence: 0.89,
  },
  {
    id: "demo_011",
    title: "Memorial Day 2026: Federal Holiday Schedule and Closures",
    slug: "memorial-day-2026-federal-holiday-schedule-closures",
    excerpt:
      "Memorial Day falls on May 25, 2026. Here's what's open, what's closed, and what to expect for travel and shipping.",
    content: `Memorial Day 2026 will be observed on Monday, May 25. Here is what you need to know about closures, services, and travel.

**Federal offices and courts:** Closed. Most state and local government offices will also be closed.

**Postal Service:** No regular mail delivery; post offices closed. Priority Mail Express will be delivered.

**Banks and stock markets:** Closed. The NYSE and Nasdaq will be closed; resume trading Tuesday.

**Schools:** Most K-12 and universities closed. Some year-round districts in session.

**Public transit:** Most agencies run on Sunday/holiday schedules. Commuter rail typically reduced.

**Retail:** Most major retailers open, often with Memorial Day sales events. Malls typically open regular hours.

**Travel:** Memorial Day weekend kicks off the summer travel season. AAA projects 43.8 million Americans will travel 50+ miles from home — the highest since 2005. Expect heavy airport traffic Friday and Monday; book parking in advance.

**Trash pickup:** Many municipalities shift pickup one day later for the rest of the week.

Memorial Day honors U.S. military personnel who have died in service. Many communities hold parades and ceremonies at cemeteries and veterans' memorials.`,
    categorySlug: "us-holidays-events",
    categoryName: "US Holidays & Events",
    categoryColor: "#4bc97a",
    coverImageUrl: "https://images.unsplash.com/photo-1564507592333-c46077087145?w=1200&auto=format&fit=crop",
    coverImageAlt: "American flag displayed at a memorial ceremony",
    sourceName: "U.S. Office of Personnel Management",
    sourceUrl: "https://www.opm.gov",
    publishedAt: hoursAgo(46),
    readingMinutes: 3,
    isBreaking: false,
    featured: false,
    keepForever: true,
    tags: ["Memorial Day", "Federal Holiday", "Travel", "Schedule"],
    aiSummary:
      "Memorial Day 2026 falls Monday, May 25. Federal offices, banks, markets, and post offices close. AAA projects 43.8M Americans will travel 50+ miles.",
    aiConfidence: 0.94,
  },
];

// ────────────────────────────────────────────────────────────
//  Market ticker (DEMO) — Phase 2 will replace with live API.
// ────────────────────────────────────────────────────────────
export const DEMO_MARKET_TICKS = MARKET_TICKER_SYMBOLS.map((s, i) => {
  // Pseudo-realistic values for demo only
  const base: Record<string, number> = {
    BTC: 67250, ETH: 3580, EURUSD: 1.085, OIL: 78.45, NG: 2.34,
    GOLD: 2380, SILVER: 28.45, SPX: 5670, TSLA: 248.50,
    GOOGL: 178.20, AMZN: 188.75, AAPL: 224.30, MSFT: 425.10,
    NVDA: 124.80, META: 502.40, NFLX: 612.30,
  };
  const price = base[s.symbol] ?? 100;
  const change = (Math.sin(i * 1.3) * 3.2).toFixed(2);
  return { ...s, price, change24h: parseFloat(change) };
});

// ────────────────────────────────────────────────────────────
//  Weather (DEMO — New York)
// ────────────────────────────────────────────────────────────
export const DEMO_WEATHER = {
  location: "New York, NY",
  today: { high: 72, low: 58, condition: "Partly Cloudy", icon: "cloud-sun" },
  tomorrow: { high: 75, low: 60, condition: "Sunny", icon: "sun" },
  week: [
    { day: "Mon", high: 72, low: 58, icon: "cloud-sun" },
    { day: "Tue", high: 75, low: 60, icon: "sun" },
    { day: "Wed", high: 78, low: 62, icon: "sun" },
    { day: "Thu", high: 74, low: 61, icon: "cloud" },
    { day: "Fri", high: 70, low: 58, icon: "cloud-rain" },
    { day: "Sat", high: 68, low: 56, icon: "cloud-rain" },
    { day: "Sun", high: 73, low: 59, icon: "cloud-sun" },
  ],
};

// ────────────────────────────────────────────────────────────
//  Horoscope (DEMO)
// ────────────────────────────────────────────────────────────
const HOROSCOPE_TEXTS = [
  "A creative breakthrough arrives when you stop forcing it. Let the mind wander today.",
  "A conversation you've been avoiding turns out to be simpler than expected. Initiate it.",
  "Financial clarity comes from a single uncomfortable question. Ask it.",
  "Rest is productive today. Your best idea will arrive in stillness, not motion.",
  "An old friend resurfaces with a timely perspective. Listen before responding.",
  "Small disciplined actions compound today. Don't wait for motivation.",
  "Your patience is being tested. The reward for staying the course is real.",
  "A boundary you've been considering is correct. Communicate it kindly.",
  "Curiosity opens an unexpected door today. Follow the unfamiliar thread.",
  "Energy returns. Use it for the task you've been postponing.",
  "Listen to your body. It has been telling you something for weeks.",
  "A piece of news reframes a long-standing assumption. Welcome the update.",
];

export const DEMO_HOROSCOPES = ZODIAC_SIGNS.map((sign, i) => ({
  sign,
  text: HOROSCOPE_TEXTS[i % HOROSCOPE_TEXTS.length],
}));

// ────────────────────────────────────────────────────────────
//  US events (DEMO)
// ────────────────────────────────────────────────────────────
export const DEMO_US_EVENTS = [
  { date: "2026-10-31", name: "Halloween", type: "observance" },
  { date: "2026-11-03", name: "Daylight Saving Time Ends", type: "observance" },
  { date: "2026-11-11", name: "Veterans Day", type: "federal_holiday" },
  { date: "2026-11-26", name: "Thanksgiving Day", type: "federal_holiday" },
  { date: "2026-12-25", name: "Christmas Day", type: "federal_holiday" },
  { date: "2027-01-01", name: "New Year's Day", type: "federal_holiday" },
  { date: "2027-01-18", name: "Martin Luther King Jr. Day", type: "federal_holiday" },
  { date: "2027-02-14", name: "Valentine's Day", type: "observance" },
  { date: "2027-02-15", name: "Presidents' Day", type: "federal_holiday" },
  { date: "2027-05-31", name: "Memorial Day", type: "federal_holiday" },
];

// Visitor count baseline (DEMO)
export const DEMO_VISITOR_COUNT = 1284;
