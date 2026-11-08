Samayuktam: The PCMP Standard

Probabilistically Checkable and Mechanically Provable computation. The end of trust-by-authority. The beginning of accountability at machine speed.

---

## ⚔️ The Mission

We are at the end of an era defined by trust-by-authority. Modern computation—from machine learning to financial systems—is built on the assumption that results are honest because they come from powerful institutions or expensive hardware.

Samayuktam reframes computation from **"trust me" to "verify me"**. PCMP is not about making computation smarter; it is about making dishonesty impossible to hide.

---

## 🌪️ The Problem: Silent Failures

Today’s systems fail silently. Non-deterministic training artifacts and unverifiable inference paths collapse into one reality: **power without proof**.

- **IEEE-754 Ambiguity:** Bit-level floating-point ambiguity is an adversarial surface. Different CPUs and runtimes produce different bit patterns for the same numerical results.
- **Authority Over Truth:** When results cannot be independently verified, authority replaces truth.
- **Lack of Canonicality:** Without a canonical representation, verification of floating-point data from untrusted systems is impossible in practice.

---

## 🛡️ The Solution: PCMP

PCMP (Predictive Canonical Monotonic Permutation) solves exactly one problem: it forces a producer to commit to a single, bit-exact, canonical ordering of IEEE-754 binary32 values.

### Key Features

- **Bit-Exact Canonical Ordering:** Guarantees deterministic output for identical input bit patterns.
- **Hardware Agnostic:** Assumes no shared codebase or execution environment between producer and verifier.
- **Lossless Reversibility:** Reconstructs the original input order bit-for-bit via a defined permutation.
- **Fail-Closed Semantics:** On any violation, the verifier signals hard failure and emits no partial output.
- **Predictive Efficiency:** Uses first and second-order delta transforms to prepare data for optimal commitment.

---

## 📜 Documentation

For a deep dive into the architecture of Samayuktam, see the following:

- **The Manifesto:** The moral and philosophical necessity of verifiable computation.
- **SPECIFICATION.md:** The normative rules for V1 bit-exact representation.
- **THREAT_MODEL.md:** How Samayuktam survives in a hostile, non-cooperative environment.
- **WHY_PCMP_EXISTS.md:** Why deviation from this standard is not an option.

---

## 🚀 Quick Start

Samayuktam provides a boundary where computation ends and accountability begins.

1. **Canonicalize:** Use the Samayuktam Sorter to transform raw float data into a `.pcmp` artifact.
2. **Verify:** Run `verifier.py` to confirm the bit-level integrity and cryptographic binding of the data.
3. **Restore:** Losslessly revert the canonical data back to your original byte-exact sequence for local use.

---

## ⚖️ License & Patents

Copyright (c) 2026 Samayuktam. All rights reserved.

**PATENT PENDING.** This specification and reference verifier are provided for evaluation and audit purposes. Commercial use or production integration requires a formal license.

