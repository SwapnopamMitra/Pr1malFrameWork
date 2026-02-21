#!/usr/bin/env python3
import struct, hashlib, zstandard as zstd, sys, json, math
from pathlib import Path

CHUNK_BYTES = 1 << 22
SHA256_LEN = 32
MAX_COMPRESSED = 1 << 30
MAX_ELEMENTS = 1 << 28

CANONICAL_NAN = 0x7FC00000
NEGATIVE_ZERO = 0x80000000


def uleb128_decode(buf, off):
    val = 0
    shift = 0
    i = off
    while True:
        if i >= len(buf):
            raise ValueError("uleb128 overrun")
        b = buf[i]
        i += 1
        val |= (b & 0x7f) << shift
        if b < 0x80:
            break
        shift += 7
        if shift > 64:
            raise ValueError("uleb128 overflow")
    return val, i - off


def zigzag_decode(v):
    return (v >> 1) ^ -(v & 1)


def inv_order1(res):
    out = res[:]
    prev = out[0]
    for i in range(1, len(out)):
        out[i] = (prev + out[i]) & 0xffffffff
        prev = out[i]
    return out


def inv_order2(res):
    out = res[:]
    if len(out) >= 2:
        out[1] = (out[0] + out[1]) & 0xffffffff
    for i in range(2, len(out)):
        pred = (2 * out[i-1] - out[i-2]) & 0xffffffff
        out[i] = (pred + out[i]) & 0xffffffff
    return out


def inverse_pcmp_map(m):
    if m & 0x80000000:
        return m & 0x7fffffff
    return (~m) & 0xffffffff


def merkle_root(data):
    leaves = []
    for i in range(0, len(data), CHUNK_BYTES):
        leaves.append(hashlib.sha256(data[i:i+CHUNK_BYTES]).digest())
    while len(leaves) > 1:
        nxt = []
        for i in range(0, len(leaves), 2):
            if i + 1 < len(leaves):
                nxt.append(hashlib.sha256(leaves[i] + leaves[i+1]).digest())
            else:
                nxt.append(leaves[i])
        leaves = nxt
    return leaves[0] if leaves else b"\x00" * 32


def is_nan(u):
    return (u & 0x7f800000) == 0x7f800000 and (u & 0x007fffff) != 0


def validate_cvd(values):
    for i, u in enumerate(values):
        if u == NEGATIVE_ZERO:
            return False, i, "negative zero"
        if is_nan(u) and u != CANONICAL_NAN:
            return False, i, "non-canonical NaN"
    return True, None, None


def verify_pcmp(path: Path):
    info = {"file": str(path), "valid": False, "error": None}

    try:
        with path.open("rb") as f:
            hdr = f.read(16)
            if len(hdr) != 16:
                raise ValueError("short header")

            info["magic"] = hdr[:4].decode("ascii", "replace")
            info["version"] = hdr[4]
            info["order"] = hdr[5]
            info["n"] = struct.unpack("<Q", hdr[8:16])[0]

            if info["magic"] != "PCMP" or info["version"] != 1:
                raise ValueError("invalid magic or version")

            if info["n"] > MAX_ELEMENTS:
                raise ValueError("element count too large")

            C = struct.unpack("<Q", f.read(8))[0]
            if C > MAX_COMPRESSED:
                raise ValueError("compressed data too large")

            cbuf = f.read(C)
            raw = zstd.ZstdDecompressor().decompress(cbuf, info["n"] * 4)
            residuals = list(struct.unpack("<" + "I" * info["n"], raw))

            if info["order"] == 1:
                ordered = inv_order1(residuals)
            elif info["order"] == 2:
                ordered = inv_order2(residuals)
            else:
                raise ValueError("invalid predictor order")

            violation = next(
                (i for i in range(1, len(ordered)) if ordered[i] < ordered[i-1]),
                None
            )

            PC = struct.unpack("<Q", f.read(8))[0]
            pcb = f.read(PC)
            pd = zstd.ZstdDecompressor().decompress(pcb, info["n"] * 10)

            perm, off, prev = [], 0, 0
            for _ in range(info["n"]):
                v, used = uleb128_decode(pd, off)
                off += used
                prev = (prev + zigzag_decode(v)) & 0xffffffffffffffff
                perm.append(prev)

            proof_type = struct.unpack("<Q", f.read(8))[0]
            total_n = struct.unpack("<Q", f.read(8))[0]
            chunk_bytes = struct.unpack("<Q", f.read(8))[0]
            num_chunks = struct.unpack("<Q", f.read(8))[0]
            ordering_mode = struct.unpack("<I", f.read(4))[0]
            stored_root = f.read(SHA256_LEN)

            footer_magic, footer_version = struct.unpack("<II", f.read(8))

        computed_root = merkle_root(raw)

        perm_ok = (
            len(perm) == info["n"] and
            all(0 <= p < info["n"] for p in perm) and
            len(set(perm)) == info["n"]
        )

        unmapped = [inverse_pcmp_map(u) for u in ordered]
        cvd_ok, cvd_i, cvd_r = validate_cvd(unmapped)

        # ---- SPCMP METADATA INVARIANTS ----
        expected_chunks = math.ceil(len(raw) / CHUNK_BYTES)

        meta_ok = (
            proof_type == 1 and
            total_n == info["n"] and
            ordering_mode == info["order"] and
            chunk_bytes == CHUNK_BYTES and
            num_chunks == expected_chunks and
            footer_magic == 0x50434D50 and  # 'PCMP'
            footer_version == 1
        )

        info.update({
            "ordering_ok": violation is None,
            "ordering_violation_index": violation,
            "permutation_ok": perm_ok,
            "cvd_ok": cvd_ok,
            "cvd_violation_index": cvd_i,
            "cvd_violation_reason": cvd_r,
            "meta_ok": meta_ok,
            "proof_type": proof_type,
            "ordering_mode": ordering_mode,
            "chunk_bytes": chunk_bytes,
            "total_n": total_n,
            "num_chunks": num_chunks,
            "stored_merkle_root": stored_root.hex(),
            "computed_merkle_root": computed_root.hex(),
            "merkle_match": stored_root == computed_root,
            "footer_magic": hex(footer_magic),
            "footer_version": footer_version,
        })

        info["valid"] = (
            info["ordering_ok"] and
            info["merkle_match"] and
            perm_ok and
            cvd_ok and
            meta_ok
        )

    except Exception as e:
        info["error"] = str(e)

    return info
def main():
    args = sys.argv[1:]
    mode = "summary"

    if "--info" in args:
        mode = "info"
        args.remove("--info")

    if "--json" in args:
        mode = "json"
        args.remove("--json")

    if not args:
        print("usage: verify.py [--info|--json] file1.pcmp [file2.pcmp ...]")
        sys.exit(1)

    for p in map(Path, args):
        info = verify_pcmp(p)

        if mode == "json":
            print(json.dumps(info, indent=2))

        elif mode == "info":
            print(f"\n=== {p} ===")
            for k, v in info.items():
                print(f"{k:28}: {v}")

        else:
            status = "OK" if info.get("valid") else "FAIL"
            print(
                f"[{status}] {p} "
                f"n={info.get('n')} order={info.get('order')}"
            )


if __name__ == "__main__":
    main()
