import { NextRequest, NextResponse } from "next/server";
import { getClaimById, updateClaim, type ClaimStatus } from "@/lib/db";

// ── PATCH /api/claims/[id] ─────────────────────────────────────────────────
// Body: { status?, reviewerNote? }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check claim exists
  const existing = getClaimById(id);
  if (!existing) {
    return NextResponse.json(
      { error: `Claim with id '${id}' not found.` },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { status, reviewerNote } = body as {
    status?: string;
    reviewerNote?: string;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validStatuses: ClaimStatus[] = [
    "Unverified",
    "Verified True",
    "Verified False",
    "Misleading",
  ];

  if (status !== undefined && !validStatuses.includes(status as ClaimStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (
    reviewerNote !== undefined &&
    typeof reviewerNote !== "string"
  ) {
    return NextResponse.json(
      { error: "Field 'reviewerNote' must be a string." },
      { status: 400 }
    );
  }

  if (!status && reviewerNote === undefined) {
    return NextResponse.json(
      { error: "At least one of 'status' or 'reviewerNote' must be provided." },
      { status: 400 }
    );
  }

  // ── Update ────────────────────────────────────────────────────────────────
  const update: { status?: ClaimStatus; reviewerNote?: string } = {};
  if (status) update.status = status as ClaimStatus;
  if (reviewerNote !== undefined) update.reviewerNote = reviewerNote;

  const updated = updateClaim(id, update);

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update claim." },
      { status: 500 }
    );
  }

  return NextResponse.json({ claim: updated });
}

// ── GET /api/claims/[id] ───────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const claim = getClaimById(id);

  if (!claim) {
    return NextResponse.json(
      { error: `Claim with id '${id}' not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ claim });
}
