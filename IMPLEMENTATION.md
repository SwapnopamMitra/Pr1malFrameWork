# Samayuktam Implementation Notes

## Value Canonicalization for GPU Verification

Samayuktam implements PCMP v1 with **value canonicalization** for practical GPU verification use cases.

### Design Decision

During input processing and verification, Samayuktam applies:
- NaN canonicalization: All NaN values → `0x7FC00000` (canonical quiet NaN)
- Zero canonicalization: Negative zero → positive zero

### Rationale

GPU hardware produces non-deterministic NaN payloads and handles signed zeros inconsistently across:
- Different GPU architectures (e.g., RTX 3090 vs. RTX 4090)
- Different CUDA versions
- CPU vs. GPU execution
- Different compiler optimizations

Without canonicalization, verification would fail across heterogeneous systems despite numerical equivalence.

### Tradeoff

**Lost:** Bit-exact preservation of NaN payloads (PCMP v1 Section 3 strict compliance)

**Gained:** Portable, deterministic verification across all IEEE-754 hardware

### Use Case Alignment

This design choice optimizes for:
- ✅ Distributed AI training verification (heterogeneous GPU clusters)
- ✅ Cross-platform reproducibility (cloud providers, different hardware)
- ✅ Compliance-grade audit trails (numerical correctness matters, not payload bits)

**Not optimized for:**
- ❌ Cryptographic applications requiring bit-exact NaN preservation
- ❌ Low-level hardware debugging of specific NaN payloads

### Relationship to PCMP v1 Specification

The [PCMP v1 specification](link) defines the canonical format and ordering semantics.

Samayuktam implements these semantics with the value canonicalization extension documented here.

Applications requiring strict bit-preservation of NaN payloads should note this implementation choice.

---

## Validation

All validation results (4000 adversarial test cases) reflect this canonicalization behavior.

Binary reconstruction achieves 100% accuracy with canonicalized values, enabling portable verification across:
- CPU (i5, x86-64)
- GPU (NVIDIA CUDA)
- Different test runs
- Different hardware configurations
