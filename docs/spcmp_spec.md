# SPCMP — Samayuktam Profile for PCMP v1
**Version 1 (Frozen Semantics)**

---

## 0. Relationship to PCMP v1 (Normative)

SPCMP is a strict profile of PCMP v1.

SPCMP does not alter PCMP v1 canonical ordering, permutation, prediction, compression, or hashing rules.

SPCMP introduces a mandatory preprocessing phase that transforms **raw IEEE-754 inputs** into a restricted canonical value domain prior to PCMP processing.

All PCMP v1 requirements apply unchanged after preprocessing.

An SPCMP artifact is not a PCMP v1 artifact unless the preprocessing phase is explicitly applied.

**Clarification:** For the avoidance of doubt, SPCMP inherits PCMP v1 semantics as applied to post-preprocessing values only; any behavior of PCMP v1 prior to preprocessing is explicitly out of scope.

---

## 1. Scope & Non-Goals (Normative)

### 1.1 Scope

This specification defines a deterministic, portable, and verifiable encoding for finite sequences of IEEE-754 binary32 values intended for heterogeneous CPU/GPU verification.

SPCMP applies to:
- IEEE-754 binary32 values
- Little-endian byte representation
- Systems with non-deterministic NaN payloads or signed-zero behavior

### 1.2 Explicit Non-Goals

SPCMP does **NOT** guarantee:
- Preservation of NaN payloads
- Preservation of signed zero
- Bit-identity with raw producer output
- Suitability for cryptographic bit-for-bit archival
- Float64 or mixed-precision behavior

---

## 2. Terminology & Normative Language

All RFC 2119 keywords apply.

**Definitions**

**Preprocessing Canonicalization**  
A deterministic transformation applied to raw IEEE-754 binary32 inputs prior to PCMP v1 canonical mapping.

**Canonical Value Domain (CVD)**  
The subset of IEEE-754 binary32 bit patterns permitted as SPCMP preprocessing output.

**Producer**  
An implementation emitting SPCMP artifacts.

**Verifier**  
An implementation validating SPCMP artifacts.

---

## 3. Input Model (Normative)

### 3.1 Raw Input

Input is a finite ordered sequence of 32-bit values.

Each element SHALL be interpreted as an IEEE-754 binary32 value.

Input MAY contain:
- NaNs (any payload)
- Signed zeros
- Infinities
- Subnormals

### 3.2 Preprocessing Requirement

A conforming SPCMP implementation MUST apply the preprocessing canonicalization defined in Section 4 to every input element, exactly once, prior to PCMP v1 processing.

Skipping or partially applying preprocessing SHALL cause verification failure.

---

## 4. Preprocessing Canonicalization (Critical, Normative)

### 4.1 Canonicalization Rules

Let *u* be the raw 32-bit IEEE-754 binary32 bit pattern.

Each element SHALL be transformed as follows:

**NaN Canonicalization**  
If *u* encodes any NaN (quiet or signaling, any payload):
```
u' = 0x7FC00000
```

**Signed Zero Canonicalization**  
If *u* == 0x80000000 (−0.0):
```
u' = 0x00000000
```

**All Other Values**  
Preserve the bit pattern exactly:
```
u' = u
```

### 4.2 Canonical Value Domain (CVD)

After preprocessing:
- All NaNs are represented by a single canonical quiet NaN
- Only +0.0 exists
- All other IEEE-754 binary32 values remain unchanged

The preprocessing mapping is:
- Deterministic
- Idempotent
- Many-to-one
- Explicitly non-invertible outside the CVD

This loss of information is intentional and normative.

### 4.3 Observability Guarantee (Normative)

Preprocessing canonicalization SHALL be observationally irreversible.

Any SPCMP artifact that validates successfully SHALL be provably indistinguishable, at the byte and hash level, from one produced by applying preprocessing prior to prediction, ordering, compression, and hashing.

A producer that skips preprocessing but emits values within the Canonical Value Domain is considered conforming only if the resulting artifact is bit-identical to one produced by correct preprocessing.

---

## 5. Canonical Ordering (Inherited, Normative)

After preprocessing, the resulting 32-bit sequence SHALL be processed using PCMP v1 Section 4, without modification.

Specifically:
```c
if (u & 0x80000000)
    mapped = ~u;
else
    mapped = u | 0x80000000;
```

Ordering is unsigned integer comparison of *mapped*.

All guarantees of PCMP v1 ordering apply within the CVD.

**Clarification:** The ordering operation is defined solely by the resulting sorted sequence; stability of equal keys is not required and SHALL NOT be relied upon by verifiers.

---

## 6. Predictive Transform Semantics (Inherited)

Predictive transforms SHALL operate on the mapped uint32 sequence exactly as defined in PCMP v1 Section 5.

No modification, exception, or reinterpretation is permitted.

---

## 7. Binary Format (Normative)

### 7.1 Header Extension

SPCMP artifacts MUST set a **dedicated profile identifier field** in the PCMP header metadata.

The identifier value for SPCMP v1 SHALL be exactly:
```
0x01
```

If the PCMP container format does not define a dedicated profile field, SPCMP MUST NOT be used with that container.

This requirement removes ambiguity and prevents silent or misleading SPCMP declarations.

### 7.2 Payload Structure

Payload layout, compression, permutation encoding, and hashing are identical to PCMP v1.

---

## 8. Cryptographic Binding (Normative)

The cryptographic hash SHALL be computed over the **exact byte stream produced by PCMP v1 compression** of the post-preprocessing, post-prediction uint32 sequence.

The Merkle tree SHALL be constructed over fixed-size chunks of this compressed byte stream, with chunk size inherited from PCMP v1.

Hashes over raw floats, canonical floats, or per-element encodings SHALL NOT be considered SPCMP-conformant.

This ensures:
- Cross-hardware reproducibility
- Deterministic verification
- Stable audit artifacts

---

## 9. Verification Algorithm (Normative)

A verifier MUST perform the following steps in order:

1. Validate PCMP header and version  
2. Validate SPCMP profile indicator  
3. Decompress payload  
4. Validate element count  
5. Compute hash over decompressed predictive data  
6. Validate hash  
7. Apply inverse predictor  
8. Validate canonical ordering  
9. Apply inverse permutation  
10. Validate all values lie within the CVD  

Any failure SHALL cause immediate hard failure.

**Clarification:** Any value outside the Canonical Value Domain after inverse permutation SHALL indicate either malformed input or a non-conforming producer and MUST cause failure. This ensures detection of producers that falsely claim SPCMP compliance or fail preprocessing.

**Note:** Canonical ordering is validated on the inverse-predicted sequence prior to inverse permutation, as the permutation encodes original positions and does not affect sortedness.

---

## 10. Determinism & Threat Model (Normative)

### 10.1 Deterministic Fixed Point

Given:
- A deterministic producer
- SPCMP preprocessing
- PCMP v1 canonicalization

Then:
SPCMP artifacts are deterministic across:
- CPUs
- GPUs
- Compiler versions
- Driver versions

### 10.2 Adversarial Limitations

No adversary operating solely on SPCMP artifacts can:
- Recover original NaN payloads
- Distinguish −0.0 from +0.0
- Introduce alternative canonical orderings
- Create equivalent artifacts with different hashes

---

## 11. Versioning Rules (Normative)

SPCMP Version 1 is frozen forever.

Canonicalization rules MUST NOT change.

Any modification requires a new profile identifier.

Forward compatibility is disallowed.

---

## 12. Failure Semantics (Fail-Closed)

Identical to PCMP v1.

---

## 13. Security Considerations (Recommended)

SPCMP trades bit-pattern fidelity for deterministic verification.

This is a deliberate and visible tradeoff, not an implementation artifact.

Applications requiring bit-exact NaN preservation MUST use strict PCMP v1.

---

### Final Property (Satisfied)

A hostile, competent engineer implementing:
- SPCMP preprocessing
- PCMP v1 canonicalization
- Declared profile signaling

will produce bit-identical artifacts and hashes across heterogeneous hardware, or fail verification.

