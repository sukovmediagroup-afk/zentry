// ARENA USA — TypeScript Edge AI Agents
//
// This module replaces the original Python AI news engine with a Vercel-
// compatible TypeScript implementation. All agents run on Edge Runtime
// (or Node.js runtime) inside Next.js route handlers — no separate Python
// worker needed. This keeps the entire project deployable on Vercel from
// a single GitHub repository.

import { CATEGORIES } from "./constants";

// ────────────────────────────────────────────────────────────
//  Shared types
// ────────────────────────────────────────────────────────────
export interface AgentInput {
  sourceName?: string;
  sourceUrl?: string;
  sourcePublishedAt?: string;
  rawTitle?: string;
  rawText: string;
  lang?: string;
}

export interface ClassifyResult {
  primary_category: string;       // category slug
  primary_category_name: string;
  secondary_categories: string[];
  subcategory: string;
  topic_tags: string[];
  editorial_confidence: number;   // 0..1
  sensitivity_flags: string[];
  moderation_recommendation: "publish" | "review" | "reject";
  reason_for_rejection?: string;
}

export interface SummarizeResult {
  proposed_title: string;
  concise_summary: string;
  key_claims: string[];
  supporting_evidence: string[];
  uncertainty_notes: string[];
  editorial_confidence: number;
  potential_duplicate: boolean;
  image_requirements: string;
}

export interface DedupeResult {
  is_duplicate: boolean;
  similarity: number;
  matched_id?: string;
  matched_title?: string;
  reason: string;
}

// ────────────────────────────────────────────────────────────
//  Keyword bank for rule-based classification (Phase 1).
//  Phase 2 will layer an LLM call on top via z-ai-web-dev-sdk.
// ────────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "politics": [
    "senate", "congress", "white house", "president", "election", "gop",
    "democrat", "policy", "governor", "federal", "legislation", "bill", "vote",
    "primary", "campaign", "supreme court", "state department",
  ],
  "investing-banking": [
    "stock", "stocks", "fed", "federal reserve", "interest rate", "inflation",
    "earnings", "ipo", "bond", "treasury", "bitcoin", "ethereum", "crypto",
    "s&p", "nasdaq", "dow", "wall street", "market", "commodity", "oil", "gold",
  ],
  "personal-finance": [
    "budget", "saving", "savings", "credit card", "credit score", "tax",
    "mortgage rate", "refinance", "401k", "ira", "insurance", "debt",
    "emergency fund", "financial advisor",
  ],
  "careers-learning": [
    "remote work", "job", "hiring", "layoff", "salary", "freelance", "freelancing",
    "course", "education", "bootcamp", "certification", "career", "promotion",
    "resume", "interview", "upskilling",
  ],
  "technology-ai": [
    "artificial intelligence", "ai", "openai", "anthropic", "claude", "gpt",
    "llm", "machine learning", "neural network", "software", "saas", "startup",
    "cybersecurity", "ransomware", "data breach", "cloud", "kubernetes",
  ],
  "sports-esports": [
    "nfl", "nba", "mlb", "nhl", "soccer", "premier league", "esports",
    "championship", "playoff", "super bowl", "world series", "stanley cup",
    "tournament", "trade", "draft",
  ],
  "electronics-gadgets": [
    "smartphone", "iphone", "android", "laptop", "macbook", "wearable",
    "apple watch", "smart home", "alexa", "google home", "review", "gadget",
    "tablet", "kindle", "headphones",
  ],
  "renting-housing": [
    "rent", "rental", "apartment", "landlord", "tenant", "lease", "eviction",
    "housing market", "mortgage", "zillow", "moving", "relocation",
  ],
  "home-interior": [
    "interior design", "diy", "renovation", "remodel", "furniture", "decor",
    "organization", "minimalism", "cleaning", "repair", "garage",
  ],
  "hobbies": [
    "photography", "knitting", "painting", "drawing", "pottery", "hiking",
    "gardening", "woodworking", "music", "guitar", "piano",
  ],
  "travel-usa": [
    "national park", "yosemite", "yellowstone", "grand canyon", "road trip",
    "vacation", "flight", "hotel", "airbnb", "travel", "city guide", "disney",
    "vegas", "florida", "california", "new york city",
  ],
  "pets": [
    "dog", "cat", "puppy", "kitten", "pet", "veterinary", "vet", "training",
    "adoption", "shelter", "grooming",
  ],
  "fashion-beauty": [
    "fashion", "outfit", "wardrobe", "skincare", "makeup", "hair", "styling",
    "nails", "perfume", "sneakers", "luxury",
  ],
  "food-nutrition": [
    "recipe", "cooking", "meal", "kitchen", "ingredient", "dinner", "lunch",
    "breakfast", "vegan", "vegetarian", "keto", "protein", "nutrition",
  ],
  "health-wellness": [
    "fitness", "workout", "exercise", "yoga", "meditation", "sleep", "wellness",
    "mental health", "anxiety", "depression", "therapy", "doctor", "medical",
    "vaccine", "cdc", "fda",
  ],
  "us-holidays-events": [
    "memorial day", "labor day", "thanksgiving", "christmas", "new year",
    "fourth of july", "independence day", "veterans day", "holiday", "parade",
    "festival", "observance", "federal holiday",
  ],
};

const SENSITIVE_TRIGGERS = [
  "mass shooting", "terror", "suicide", "overdose", "murder", "kidnap",
  "sexual", "exploit", "conspiracy theory", "deepfake",
];

// ────────────────────────────────────────────────────────────
//  classifyAgent — maps free text → category + moderation signal
// ────────────────────────────────────────────────────────────
export async function classifyAgent(input: AgentInput): Promise<ClassifyResult> {
  const text = `${input.rawTitle ?? ""} ${input.rawText}`.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += kw.includes(" ") ? 2 : 1;
    }
    if (score > 0) scores[slug] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primarySlug = sorted[0]?.[0] ?? "technology-ai";
  const primaryCategory = CATEGORIES.find((c) => c.slug === primarySlug)!;
  const secondary = sorted.slice(1, 3).map(([s]) => s);

  // Sensitivity detection
  const sensitivity_flags: string[] = [];
  const lowerText = text.toLowerCase();
  if (SENSITIVE_TRIGGERS.some((t) => lowerText.includes(t))) {
    sensitivity_flags.push("sensitive_content");
  }
  if (["politics", "investing-banking", "health-wellness"].includes(primarySlug)) {
    sensitivity_flags.push(`${primarySlug}_sensitive`);
  }

  // Confidence — simple heuristic based on score margin
  const totalScore = sorted.reduce((acc, [, s]) => acc + s, 0);
  const topScore = sorted[0]?.[1] ?? 0;
  const confidence = totalScore > 0
    ? Math.min(0.95, 0.4 + (topScore / totalScore) * 0.5 + Math.min(0.1, topScore * 0.01))
    : 0.3;

  const moderation_recommendation: ClassifyResult["moderation_recommendation"] =
    sensitivity_flags.includes("sensitive_content")
      ? "reject"
      : confidence < 0.55
        ? "review"
        : "publish";

  // Subcategory guess — pick first subcategory whose name appears in text
  const subcategory =
    primaryCategory.subcategories.find((s) => text.includes(s.toLowerCase())) ??
    primaryCategory.subcategories[0] ??
    "General";

  // Topic tags
  const topic_tags = primaryCategory.subcategories
    .filter((s) => text.includes(s.toLowerCase()))
    .slice(0, 5);

  return {
    primary_category: primarySlug,
    primary_category_name: primaryCategory.name,
    secondary_categories: secondary,
    subcategory,
    topic_tags,
    editorial_confidence: confidence,
    sensitivity_flags,
    moderation_recommendation,
    reason_for_rejection:
      moderation_recommendation === "reject"
        ? "Sensitive content detected — manual editorial review required"
        : undefined,
  };
}

// ────────────────────────────────────────────────────────────
//  summarizeAgent — generates a concise original summary
//  Phase 1: extractive (first sentences + key sentences).
//  Phase 2 will upgrade to an LLM call via z-ai-web-dev-sdk.
// ────────────────────────────────────────────────────────────
export async function summarizeAgent(input: AgentInput): Promise<SummarizeResult> {
  const text = input.rawText.trim();
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  // Pick the first sentence and the longest "substance" sentence as the summary
  const first = sentences[0] ?? text.slice(0, 280);
  const keySentence = sentences
    .slice(1)
    .sort((a, b) => b.length - a.length)[0];

  const concise_summary = [first, keySentence].filter(Boolean).join(" ").slice(0, 360);

  // Proposed title — first 8 words of the first sentence, capitalized
  const proposed_title = (input.rawTitle ?? first)
    .replace(/[.!?]+$/, "")
    .split(/\s+/)
    .slice(0, 12)
    .join(" ")
    .slice(0, 110);

  // Key claims — top 3 substantive sentences (not the first)
  const key_claims = sentences
    .slice(1)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3)
    .map((s) => s.length > 200 ? s.slice(0, 197) + "..." : s);

  return {
    proposed_title,
    concise_summary,
    key_claims,
    supporting_evidence: [], // Phase 2 will populate from source URL citations
    uncertainty_notes: key_claims.length === 0
      ? ["Source text was very short — confidence limited"]
      : [],
    editorial_confidence: key_claims.length >= 2 ? 0.78 : 0.55,
    potential_duplicate: false, // set by dedupeAgent
    image_requirements:
      "Vertical 2:3 Pinterest creative, warm dark editorial palette, no fabricated brand marks",
  };
}

// ────────────────────────────────────────────────────────────
//  dedupeAgent — uses content hash + fuzzy title match
// ────────────────────────────────────────────────────────────
export async function dedupeAgent(
  input: AgentInput,
  existing: { id: string; title: string; contentHash?: string | null }[] = [],
): Promise<DedupeResult> {
  const titleNorm = (input.rawTitle ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const existingNorm = existing.map((e) => ({
    ...e,
    titleNorm: e.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(),
  }));

  // Exact title match — strong duplicate
  const exactMatch = existingNorm.find((e) => e.titleNorm === titleNorm && titleNorm.length > 10);
  if (exactMatch) {
    return {
      is_duplicate: true,
      similarity: 1.0,
      matched_id: exactMatch.id,
      matched_title: exactMatch.title,
      reason: "exact title match",
    };
  }

  // Token overlap (Jaccard)
  const titleTokens = new Set(titleNorm.split(/\s+/).filter((t) => t.length > 2));
  let bestSim = 0;
  let bestMatch: typeof existingNorm[number] | undefined;
  for (const e of existingNorm) {
    const tokens = new Set(e.titleNorm.split(/\s+/).filter((t) => t.length > 2));
    if (tokens.size === 0) continue;
    const intersection = [...titleTokens].filter((t) => tokens.has(t)).length;
    const union = new Set([...titleTokens, ...tokens]).size;
    const sim = union > 0 ? intersection / union : 0;
    if (sim > bestSim) {
      bestSim = sim;
      bestMatch = e;
    }
  }

  const is_duplicate = bestSim >= 0.6;
  return {
    is_duplicate,
    similarity: bestSim,
    matched_id: bestMatch?.id,
    matched_title: bestMatch?.title,
    reason: is_duplicate
      ? `high title similarity (${(bestSim * 100).toFixed(0)}%)`
      : `low similarity (${(bestSim * 100).toFixed(0)}%)`,
  };
}

// ────────────────────────────────────────────────────────────
//  contentHashFor — stable idempotency key
// ────────────────────────────────────────────────────────────
export async function contentHashFor(input: AgentInput): Promise<string> {
  const text = `${input.sourceUrl ?? ""}|${input.rawTitle ?? ""}|${input.rawText.slice(0, 1024)}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Buffer.from(new Uint8Array(buf)).toString("hex");
}
