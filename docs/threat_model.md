# PCMP Threat Model

---

## Scope

This implementation of PCMP is written and reviewed under the assumption that it operates as a boundary component within a larger system (e.g., a game engine, simulation pipeline, or ML system), not as a complete application. The surrounding system is explicitly out of scope.

PCMP exists only to canonicalize, bind, and verify floating‑point data at the point where computation outputs become externally visible claims.

---

## Primary Threat: Hostile Producer

The primary threat is a malicious or non‑cooperative producer. The producer may intentionally reorder elements, exploit IEEE‑754 edge cases (NaNs, signed zero, subnormals), emit non‑canonical encodings, or rely on implementation‑defined behavior while remaining numerically plausible.

PCMP assumes the producer is competent, adversarial, and aware of the specification, and that any ambiguity left in the format will be exploited.

The system further assumes hostile re‑serialization. Data may be re‑encoded, compressed, chunked, transported, or stored by untrusted intermediaries. Any transformation that preserves “values” but alters bit patterns, ordering, or framing is considered an active attack.

PCMP therefore treats compression, permutation, and predictive transforms as part of the canonical form, not as optional transport details.

---

## Non‑Deterministic Hardware

Non‑deterministic hardware and implementation divergence are explicitly in scope. Different CPUs, GPUs, compilers, languages, optimization levels, and runtimes may produce identical numerical results while differing at the bit level.

PCMP assumes:
- No shared codebase between producer and verifier  
- No shared compiler toolchain  
- No shared execution environment  
- Verification may occur years later on unrelated hardware

Bit‑level floating‑point ambiguity is treated as an adversarial surface, not an accident. Signed zero, NaN payloads, infinities, and subnormals are not normalized away or “fixed”; they are preserved and ordered deterministically.

Any attempt to exploit IEEE‑754 latitude to create multiple plausible encodings of the same apparent data is rejected by construction.

---

## Out‑of‑Scope Threats

PCMP does **not** defend against:
- Incorrect computation  
- Malicious game logic or system logic  
- Fabricated data  
- False claims about how the data was generated

If the surrounding system is wrong, PCMP will faithfully and irreversibly preserve that wrongness. PCMP provides integrity and determinism, not truth.

---

> In short, PCMP assumes a hostile world, untrusted producers, and untrusted transports. Its sole security objective is to force a single, irreversible, bit‑exact commitment to floating‑point data. Anything less collapses verification into trust, which this system explicitly rejects.

