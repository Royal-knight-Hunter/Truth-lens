/**
 * Truth Lens — In-Memory Data Store
 * Manages claims with seed data, CRUD operations, and feed-order sorting.
 */

import { evaluateRiskFlags } from "./riskEngine";

// ── Types ──────────────────────────────────────────────────────────────────

export type Platform = "WhatsApp" | "X" | "Instagram" | "Other";
export type Category = "Politics" | "Health" | "Finance" | "Other";
export type ClaimStatus =
  | "Unverified"
  | "Verified True"
  | "Verified False"
  | "Misleading";

export interface Claim {
  id: string;
  text: string;
  platform: Platform;
  category: Category;
  sourceUrl?: string;
  flags: string[];
  status: ClaimStatus;
  reviewerNote?: string;
  createdAt: string; // ISO 8601
}

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `claim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const seedClaims: Claim[] = [
  {
    id: "claim_seed_001",
    text: "BREAKING: The government is secretly adding fluoride to vaccines to control the population. Share before this gets deleted!",
    platform: "WhatsApp",
    category: "Health",
    sourceUrl: undefined,
    flags: evaluateRiskFlags(
      "BREAKING: The government is secretly adding fluoride to vaccines to control the population. Share before this gets deleted!"
    ),
    status: "Unverified",
    reviewerNote: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  },
  {
    id: "claim_seed_002",
    text: "Shocking new report: The central bank plans to freeze all private savings accounts above $10,000 starting next month due to an undisclosed liquidity crisis.",
    platform: "X",
    category: "Finance",
    sourceUrl: undefined,
    flags: evaluateRiskFlags(
      "Shocking new report: The central bank plans to freeze all private savings accounts above $10,000 starting next month due to an undisclosed liquidity crisis."
    ),
    status: "Verified False",
    reviewerNote:
      "No credible financial institution or regulatory body has issued any such notice. Cross-checked with central bank official communications.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
  },
  {
    id: "claim_seed_003",
    text: "The opposition party candidate was confirmed to have accepted foreign campaign donations, according to the Election Commission's latest disclosure report.",
    platform: "Instagram",
    category: "Politics",
    sourceUrl: "https://www.electioncommission.gov/disclosures/2026-q3",
    flags: evaluateRiskFlags(
      "The opposition party candidate was confirmed to have accepted foreign campaign donations, according to the Election Commission's latest disclosure report.",
      "https://www.electioncommission.gov/disclosures/2026-q3"
    ),
    status: "Misleading",
    reviewerNote:
      "The disclosure report exists, but refers to legal overseas diaspora donations, not illegal foreign interference. Context is critically missing.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
];

// ── In-Memory Store ────────────────────────────────────────────────────────

let store: Claim[] = [...seedClaims];

// ── Sorting: High Risk first, then newest first ────────────────────────────

function sortClaims(claims: Claim[]): Claim[] {
  return [...claims].sort((a, b) => {
    const aHighRisk = a.flags.includes("High Risk") ? 1 : 0;
    const bHighRisk = b.flags.includes("High Risk") ? 1 : 0;

    if (bHighRisk !== aHighRisk) {
      return bHighRisk - aHighRisk; // High Risk first
    }

    // Then by recency (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Retrieve all claims, sorted by High Risk first then recency.
 * Optionally filter by category and/or status.
 */
export function getClaims(filters?: {
  category?: Category;
  status?: ClaimStatus;
}): Claim[] {
  let result = store;

  if (filters?.category) {
    result = result.filter((c) => c.category === filters.category);
  }
  if (filters?.status) {
    result = result.filter((c) => c.status === filters.status);
  }

  return sortClaims(result);
}

/**
 * Retrieve a single claim by ID.
 */
export function getClaimById(id: string): Claim | undefined {
  return store.find((c) => c.id === id);
}

/**
 * Add a new claim. Automatically evaluates risk flags.
 */
export function addClaim(input: {
  text: string;
  platform: Platform;
  category: Category;
  sourceUrl?: string;
}): Claim {
  const flags = evaluateRiskFlags(input.text, input.sourceUrl);

  const claim: Claim = {
    id: generateId(),
    text: input.text,
    platform: input.platform,
    category: input.category,
    sourceUrl: input.sourceUrl || undefined,
    flags,
    status: "Unverified",
    reviewerNote: undefined,
    createdAt: new Date().toISOString(),
  };

  store = [claim, ...store];
  return claim;
}

/**
 * Update the status and/or reviewer note for a claim.
 */
export function updateClaim(
  id: string,
  update: { status?: ClaimStatus; reviewerNote?: string }
): Claim | null {
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return null;

  store[index] = { ...store[index], ...update };
  return store[index];
}
