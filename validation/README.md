# Transformer Model Validation

Samayuktam tested on Salesforce BLIP image captioning model.

## Test Configuration

**Model:** BLIP (Salesforce/blip-image-captioning-base)
**Task:** Image captioning decoder logits
**Elements:** 10.7M float32 values per run

## Results

### CPU Execution
- 3 runs: Identical SHA256 hashes
- PCMP artifacts: Identical (80992D628A750766...)
- Reconstruction: Bit-perfect (cmp verified)

### GPU Execution  
- 3 runs: Identical SHA256 hashes
- PCMP artifacts: Deterministic (091E49EBFF6D239...)
- Reconstruction: Bit-perfect (cmp verified)

### Batch Processing (32 images)
- 5 runs: 100% deterministic
- Batch size: 32 concurrent inferences
- PCMP generation: Deterministic

## Verification

All PCMP artifacts validated:
- Merkle root: Matched
- Ordering: Preserved
- CVD: Compliant
- Reconstruction: Bit-perfect

This demonstrates Samayuktam works on production transformer inference, not just synthetic test cases.
