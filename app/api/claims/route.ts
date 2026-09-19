import { NextRequest, NextResponse } from "next/server";
import {
  getClaims,
  addClaim,
  type Category,
  type ClaimStatus,
  type Platform,
} from "@/lib/db";

// ── GET /api/claims ────────────────────────────────────────────────────────
// Supports optional query params: ?category=Health&status=Unverified

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") as Category | null;
  const status = searchParams.get("status") as ClaimStatus | null;

  const validCategories: Category[] = [
    "Politics",
    "Health",
    "Finance",
    "Other",
  ];
  const validStatuses: ClaimStatus[] = [
    "Unverified",
    "Verified True",
    "Verified False",
    "Misleading",
  ];

  const filters: { category?: Category; status?: ClaimStatus } = {};

  if (category) {
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Valid values: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }
    filters.category = category;
  }

  if (status) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    filters.status = status;
  }

  const claims = getClaims(
    Object.keys(filters).length > 0 ? filters : undefined
  );
  return NextResponse.json({ claims });
}

// ── POST /api/claims ───────────────────────────────────────────────────────
// Body: { text, platform, category, sourceUrl? }

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, platform, category, sourceUrl } = body as {
    text?: string;
    platform?: string;
    category?: string;
    sourceUrl?: string;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Field 'text' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  const validPlatforms: Platform[] = ["WhatsApp", "X", "Instagram", "Other"];
  if (!platform || !validPlatforms.includes(platform as Platform)) {
    return NextResponse.json(
      {
        error: `Field 'platform' is required. Valid values: ${validPlatforms.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const validCategories: Category[] = [
    "Politics",
    "Health",
    "Finance",
    "Other",
  ];
  if (!category || !validCategories.includes(category as Category)) {
    return NextResponse.json(
      {
        error: `Field 'category' is required. Valid values: ${validCategories.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (text.trim().length > 2000) {
    return NextResponse.json(
      { error: "Field 'text' must not exceed 2000 characters." },
      { status: 400 }
    );
  }

  // ── Create ────────────────────────────────────────────────────────────────
  const claim = addClaim({
    text: text.trim(),
    platform: platform as Platform,
    category: category as Category,
    sourceUrl: sourceUrl?.trim() || undefined,
  });

  return NextResponse.json({ claim }, { status: 201 });
}
