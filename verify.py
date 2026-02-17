#!/usr/bin/env python3
import struct, hashlib, zstandard as zstd, sys, json
from pathlib import Path

CHUNK_BYTES = 1 << 22
SHA256_LEN = 32


def uleb128_decode(buf, off):
    val = 0
    shift = 0
    i = off
    while True:
        b = buf[i]
        i += 1
        val |= (b & 0x7f) << shift
        if b < 0x80:
            break
        shift += 7
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


def verify_pcmp(path: Path):
    info = {"file": str(path)}
    with path.open("rb") as f:
        hdr = f.read(16)
        info["magic"] = hdr[:4].decode("ascii", "replace")
        info["version"] = hdr[4]
        info["order"] = hdr[5]
        info["n"] = struct.unpack("<Q", hdr[8:16])[0]

        C = struct.unpack("<Q", f.read(8))[0]
        cbuf = f.read(C)

        dctx = zstd.ZstdDecompressor()
        raw = dctx.decompress(cbuf, info["n"] * 4)
        residuals = list(struct.unpack("<" + "I" * info["n"], raw))

        if info["order"] == 1:
            ordered = inv_order1(residuals)
        elif info["order"] == 2:
            ordered = inv_order2(residuals)
        else:
            raise ValueError("invalid order")

        violation = None
        for i in range(1, len(ordered)):
            if ordered[i] < ordered[i - 1]:
                violation = i
                break

        info["ordering_ok"] = violation is None
        info["ordering_violation_index"] = violation

        PC = struct.unpack("<Q", f.read(8))[0]
        pcb = f.read(PC)
        pd = dctx.decompress(pcb, info["n"] * 10)

        perm = []
        off = 0
        prev = 0
        for _ in range(info["n"]):
            v, used = uleb128_decode(pd, off)
            off += used
            diff = zigzag_decode(v)
            prev = (prev + diff) & 0xffffffffffffffff
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

    info.update({
        "compressed_data_bytes": C,
        "compressed_perm_bytes": PC,
        "raw_bytes": info["n"] * 4,
        "compression_ratio": C / (info["n"] * 4) if info["n"] else 0,
        "proof_type": proof_type,
        "total_n": total_n,
        "chunk_bytes": chunk_bytes,
        "num_chunks": num_chunks,
        "ordering_mode": ordering_mode,
        "stored_merkle_root": stored_root.hex(),
        "computed_merkle_root": computed_root.hex(),
        "merkle_match": stored_root == computed_root,
        "footer_magic": hex(footer_magic),
        "footer_version": footer_version,
        "permutation_ok": perm_ok,
    })

    info["valid"] = (
        info["magic"] == "PCMP" and
        info["version"] == 1 and
        info["ordering_ok"] and
        info["merkle_match"] and
        perm_ok
    )

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
        print("usage: verify.py [--info|--json] file.pcmp ...")
        sys.exit(1)

    for p in map(Path, args):
        info = verify_pcmp(p)
        if mode == "json":
            print(json.dumps(info, indent=2))
        elif mode == "info":
            print(f"\n=== {p} ===")
            for k, v in info.items():
                print(f"{k:24}: {v}")
        else:
            status = "OK" if info["valid"] else "FAIL"
            print(f"[{status}] {p}  n={info['n']}  order={info['order']}  ratio={info['compression_ratio']:.6f}")


if __name__ == "__main__":
    main()
