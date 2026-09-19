# Architecture Decision Log — Truth Lens

**Hackathon ID:** AZIS-T22ZVX  
**Project:** Truth Lens — Misinformation Triage Platform

---

## DP1 — Feed Order

**Decision:** Claims are sorted by **High Risk first**, then by **recency** (newest first).

**Rationale:**  
High-risk claims cause rapid harm; prioritizing them ensures fast triage before viral scaling. A claim flagged as both sensational and unsourced can spread exponentially within minutes on platforms like WhatsApp or X. Reviewers seeing the highest-danger claims first maximizes the harm-reduction impact of every review session.

---

## DP2 — Visibility of Unverified Claims

**Decision:** Unverified claims are **publicly visible** with an `Unverified` warning badge.

**Rationale:**  
Prevents an information vacuum while informing users early with neutral context. Hiding unverified claims entirely would create a blind spot — users would encounter the same claims on social media with no reference point. Showing them with a clearly styled `Unverified` badge sets expectations and primes readers to be cautious, even before a reviewer has acted.

---

## DP3 — Editing of Submitted Claims

**Decision:** Claims are **immutable** — no edits allowed after submission.

**Rationale:**  
Prevents moving-target claims and preserves audit integrity. If a claim could be edited post-submission, a bad actor could submit benign text, pass initial review, then mutate it to harmful content. Immutability ensures the risk flags and reviewer notes always correspond to the exact original claim text, maintaining a trustworthy audit trail.

---

_Last updated: 2026-09-19_
