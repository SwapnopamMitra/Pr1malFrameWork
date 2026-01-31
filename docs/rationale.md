# Rationale: Why PCMP Exists

---

PCMP exists to eliminate ambiguity under adversarial conditions.

It is not a convenience format, an optimization layer, or a compression scheme. It exists because, without a canonical representation, verification of floating‑point data produced by untrusted systems is impossible in practice.

Modern systems routinely produce large float datasets under parallelism, heterogeneous hardware, and undefined ordering semantics. Existing formats preserve values, but not claims. They allow producers to reorder, re‑encode, or subtly manipulate floating‑point bit patterns while remaining numerically plausible. Once this happens, independent verification collapses.

PCMP solves exactly one problem: it forces a hostile producer to commit to a single, bit‑exact, canonical ordering of IEEE‑754 binary32 values, or fail verification.

---

## Guaranteed Failures Without PCMP

If PCMP is not used, the following failures are guaranteed:

- Reordering attacks that preserve multisets but alter meaning  
- Exploitation of NaN payloads, signed zero, and subnormal ambiguity  
- Divergent results across languages, compilers, and runtimes  
- Silent corruption introduced by compression or transport  
- Plausible deniability for malicious or negligent producers

---

## Threat Model Summary

PCMP assumes hostile inputs, non‑cooperative producers, untrusted storage and transport, and independent verifiers implemented without shared code or context. Verification may occur years later by parties who do not trust the original system.

PCMP defends against reordering, non‑canonical encodings, bit‑level manipulation, and silent corruption. It does not provide confidentiality, authenticity, or correctness of the underlying computation. If the computation is wrong, PCMP will faithfully preserve that wrongness.

---

## The Boundary of Accountability

PCMP is not the system.

It is the boundary where computation ends and accountability begins. It is the point where claims about data become irreversible commitments.

This document is intentionally not part of the specification. The specification defines what must be done. This document explains why deviation is not an option.

**Trust is explicitly rejected.**