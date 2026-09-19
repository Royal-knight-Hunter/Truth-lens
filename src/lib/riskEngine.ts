/**
 * Truth Lens — Risk Flag Engine
 * Evaluates a claim's text (and optional source URL) for misinformation risk signals.
 */

/**
 * Evaluates risk flags for a given claim text and optional source URL.
 *
 * Flags returned:
 *  - "Sensational" : text contains trigger phrases (case-insensitive)
 *  - "Shouting"    : >50% of alphabetic characters are uppercase (only if text.length > 10)
 *  - "Unsourced"   : no valid http/https URL in text or sourceUrl
 *  - "High Risk"   : automatically added when 2 or more of the above flags are triggered
 *
 * @param text      The claim body text to evaluate.
 * @param sourceUrl Optional source URL provided separately by the submitter.
 * @returns         Array of flag strings (may be empty).
 */
export function evaluateRiskFlags(text: string, sourceUrl?: string): string[] {
  const flags: string[] = [];

  // ── Flag 1: Sensational ───────────────────────────────────────────────────
  const sensationalPatterns = [
    /breaking/i,
    /shocking/i,
    /share before deleted/i,
  ];
  const isSensational = sensationalPatterns.some((pattern) =>
    pattern.test(text)
  );
  if (isSensational) {
    flags.push("Sensational");
  }

  // ── Flag 2: Shouting ──────────────────────────────────────────────────────
  if (text.length > 10) {
    const alphabeticChars = text.replace(/[^a-zA-Z]/g, "");
    if (alphabeticChars.length > 0) {
      const uppercaseChars = text.replace(/[^A-Z]/g, "");
      const uppercaseRatio = uppercaseChars.length / alphabeticChars.length;
      if (uppercaseRatio > 0.5) {
        flags.push("Shouting");
      }
    }
  }

  // ── Flag 3: Unsourced ─────────────────────────────────────────────────────
  const urlPattern = /https?:\/\/[^\s]+/i;
  const hasUrlInText = urlPattern.test(text);
  const hasUrlInSource =
    typeof sourceUrl === "string" &&
    sourceUrl.trim().length > 0 &&
    urlPattern.test(sourceUrl.trim());

  if (!hasUrlInText && !hasUrlInSource) {
    flags.push("Unsourced");
  }

  // ── Composite: High Risk (2+ base flags) ──────────────────────────────────
  if (flags.length >= 2) {
    flags.push("High Risk");
  }

  return flags;
}
