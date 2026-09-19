/**
 * Truth Lens — Risk Engine Test Suite (Corrected)
 * Run with: npx tsx src/lib/__tests__/riskEngine.test.ts
 *
 * Shouting rule: >50% of ALPHABETIC chars must be uppercase, AND text.length > 10.
 */

import { evaluateRiskFlags } from "../riskEngine";

// ── Test harness ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results: { name: string; pass: boolean; detail: string }[] = [];

function expect_flags(
  name: string,
  text: string,
  sourceUrl: string | undefined,
  expectedFlags: string[]
) {
  const actual = evaluateRiskFlags(text, sourceUrl);
  const actualSet = new Set(actual);
  const expectedSet = new Set(expectedFlags);

  const missingFlags = expectedFlags.filter((f) => !actualSet.has(f));
  const extraFlags = actual.filter((f) => !expectedSet.has(f));
  const pass = missingFlags.length === 0 && extraFlags.length === 0;

  const detail = pass
    ? `flags: [${actual.join(", ") || "none"}]`
    : [
        missingFlags.length > 0 ? `MISSING: [${missingFlags.join(", ")}]` : "",
        extraFlags.length > 0 ? `UNEXPECTED: [${extraFlags.join(", ")}]` : "",
        `GOT: [${actual.join(", ") || "none"}]`,
      ]
        .filter(Boolean)
        .join(" | ");

  results.push({ name, pass, detail });
  if (pass) passed++;
  else failed++;
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION 1: Sensational Flag
// ────────────────────────────────────────────────────────────────────────────

// "breaking" triggers Sensational; no URL → Unsourced; 2 flags → High Risk
expect_flags(
  "TC-01 | Sensational: 'breaking' keyword",
  "breaking news from the city council",
  undefined,
  ["Sensational", "Unsourced", "High Risk"]
);

// "shocking" (lowercase) triggers Sensational; with URL → no Unsourced; 1 flag → no High Risk
expect_flags(
  "TC-02 | Sensational: 'shocking' (lowercase, with sourceUrl)",
  "shocking revelations about the policy",
  "https://example.com/article",
  ["Sensational"]
);

// "share before deleted" phrase triggers Sensational
expect_flags(
  "TC-03 | Sensational: 'share before deleted' phrase",
  "Very important - share before deleted from the internet.",
  undefined,
  ["Sensational", "Unsourced", "High Risk"]
);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 2: Shouting Flag
// ────────────────────────────────────────────────────────────────────────────

// 100% uppercase alpha, no URL → Shouting + Unsourced + High Risk
expect_flags(
  "TC-04 | Shouting: all-caps text (>50% uppercase alpha)",
  "ALERT ALL CAPS MESSAGE HERE",
  undefined,
  ["Shouting", "Unsourced", "High Risk"]
);

// Mixed caps but majority lowercase → no Shouting
expect_flags(
  "TC-05 | No Shouting: majority lowercase",
  "This is a Normal sentence With Some Caps",
  "https://example.com",
  []
);

// Exactly on the boundary: text.length == 10 → Shouting check SKIPPED
expect_flags(
  "TC-06 | Shouting guard: text.length <= 10 skips check",
  "ALLCAPSOK",
  undefined,
  ["Unsourced"]
);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 3: Unsourced Flag
// ────────────────────────────────────────────────────────────────────────────

// No URL in text, no sourceUrl → Unsourced
expect_flags(
  "TC-07 | Unsourced: no URL anywhere",
  "The local community park will host an event.",
  undefined,
  ["Unsourced"]
);

// URL in text → NOT Unsourced
expect_flags(
  "TC-08 | NOT Unsourced: URL embedded in text",
  "Read more at https://example.com for full story.",
  undefined,
  []
);

// URL only in sourceUrl → NOT Unsourced (sourceUrl is checked alongside text)
expect_flags(
  "TC-09 | NOT Unsourced: URL in sourceUrl only",
  "No link in this body text.",
  "https://example.com/source",
  []  // sourceUrl has valid URL → Unsourced does NOT trigger
);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 4: High Risk Composite
// ────────────────────────────────────────────────────────────────────────────

// Exactly 2 base flags → High Risk added
expect_flags(
  "TC-10 | High Risk: exactly 2 flags (Sensational + Unsourced)",
  "shocking development in local politics",
  undefined,
  ["Sensational", "Unsourced", "High Risk"]
);

// Only 1 base flag → NO High Risk
expect_flags(
  "TC-11 | No High Risk: only 1 flag (Sensational only)",
  "BREAKING latest update https://example.com",
  undefined,
  ["Sensational"]
);

// All 3 base flags → High Risk added
expect_flags(
  "TC-12 | High Risk: all 3 base flags triggered",
  "BREAKING!! SHOCKING!! THE TRUTH IS OUT NOW!! SHARE BEFORE DELETED!!",
  undefined,
  ["Sensational", "Shouting", "Unsourced", "High Risk"]
);

// ────────────────────────────────────────────────────────────────────────────
// SECTION 5: Clean Claims (Zero Flags)
// ────────────────────────────────────────────────────────────────────────────

// Spec required test — zero flags
expect_flags(
  "TC-13 | Clean claim: zero risk flags (spec required)",
  "The local community park is opening a new playground next week https://example.com",
  undefined,
  []
);

// Calm text, no URL but no sensational/shouting → only Unsourced
expect_flags(
  "TC-14 | Calm claim: only Unsourced (no sensational, no shouting)",
  "Scientists publish new research on climate patterns in the Arctic region.",
  undefined,
  ["Unsourced"]
);

// ────────────────────────────────────────────────────────────────────────────
// Output
// ────────────────────────────────────────────────────────────────────────────

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  TRUTH LENS — RISK ENGINE TEST SUITE");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

let section = "";
for (const r of results) {
  const tcNum = parseInt(r.name.match(/TC-(\d+)/)?.[1] || "0");
  const newSection =
    tcNum <= 3 ? "Sensational" :
    tcNum <= 6 ? "Shouting" :
    tcNum <= 9 ? "Unsourced" :
    tcNum <= 12 ? "High Risk Composite" : "Clean Claims";
  if (newSection !== section) {
    section = newSection;
    console.log(`  ── ${section} ──`);
  }
  const icon = r.pass ? "✅" : "❌";
  console.log(`  ${icon}  ${r.name}`);
  console.log(`       → ${r.detail}`);
}

console.log(
  `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
);
console.log(
  `  RESULT: ${passed}/${passed + failed} passed  |  ${failed} failed`
);
console.log(
  `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
);

if (failed > 0) {
  process.exit(1);
}
