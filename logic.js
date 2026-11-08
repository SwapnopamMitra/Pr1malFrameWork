/* ═══════════════════════════════════════════════════════════
   SAMAYUKTAM · logic.js
   Terminal Simulation · SPCMP Verification · Ledger
═══════════════════════════════════════════════════════════ */

/* ─── DOM REFS ──────────────────────────────────────────── */
const terminalOutput = document.getElementById("terminal-output");
const btnSimulate    = document.getElementById("simulate");
const btnSpcmp       = document.getElementById("btn-spcmp");
const tbStatus       = document.getElementById("tb-status");
const ledgerList     = document.getElementById("ledger-list");
const emptyState     = document.querySelector(".ledger-empty");
const blockCounter   = document.getElementById("block-counter");

/* ─── AUDIT SEQUENCES ───────────────────────────────────── */
const PCMP_AUDIT_LINES = [
  { text: "[INIT] pcmp-audit v1.0 — Samayuktam Protocol Suite", color: "muted" },
  { text: "[INFO] Loading stream: GQA_Attention_Node_Output.bin", color: "muted", delay: 500 },
  { text: "[INFO] Float count: 10,712,448 × float32", color: "muted", delay: 400 },
  { text: "[WARN] Divergence detected: M4_MAX_HASH ≠ H100_HASH", color: "warn", delay: 700 },
  { text: "       M4 MAX  : 0x3f800000 (exponent bias variant)", color: "warn", delay: 200 },
  { text: "       H100    : 0x3f800001 (FMA-fused accumulation)", color: "warn", delay: 200 },
  { text: "[STEP] Applying SPCMP preprocessing — CVD enforcement...", color: "info", delay: 600 },
  { text: "       NaN canonicalization  → 0x7FC00000 ✓", color: "ok", delay: 350 },
  { text: "       Signed-zero collapse  → 0x00000000 ✓", color: "ok", delay: 250 },
  { text: "       Subnormal passthrough → unchanged ✓", color: "ok", delay: 250 },
  { text: "[STEP] Applying PCMP canonical mapping...", color: "info", delay: 500 },
  { text: "       Float ordering mapped (unsigned comparison)", color: "ok", delay: 350 },
  { text: "       Predictive delta encoding applied", color: "ok", delay: 300 },
  { text: "       LZ-compression ratio: 4.17x", color: "ok", delay: 300 },
  { text: "[STEP] Computing Merkle tree (chunk=4096 bytes)...", color: "info", delay: 600 },
  { text: "[SUCCESS] Canonical Merkle Root: 0x8dc860c7a3f21e90  ✓  MATCH", color: "success", delay: 700 },
  { text: "[INFO] Standard compliance: Samayuktam PCMP v1.0 · SPCMP Profile 0x01", color: "muted", delay: 400 },
  { text: "[DONE] All verifications passed. Artifact anchored.", color: "success", delay: 500 },
];

const SPCMP_LINES = [
  { text: "[SPCMP] Initiating strict profile verification...", color: "muted" },
  { text: "[STEP 1] Validating PCMP header v1.0  ✓", color: "ok", delay: 400 },
  { text: "[STEP 2] Validating SPCMP profile indicator: 0x01  ✓", color: "ok", delay: 400 },
  { text: "[STEP 3] Decompressing payload (LZ4)...", color: "info", delay: 500 },
  { text: "         Decompressed: 42,849,792 bytes  ✓", color: "ok", delay: 300 },
  { text: "[STEP 4] Validating element count: 10,712,448  ✓", color: "ok", delay: 350 },
  { text: "[STEP 5] Computing hash over decompressed predictive data...", color: "info", delay: 550 },
  { text: "[STEP 6] Validating hash: 0x8dc860c7a3f21e90  ✓", color: "ok", delay: 500 },
  { text: "[STEP 7] Applying inverse predictor...", color: "info", delay: 400 },
  { text: "[STEP 8] Validating canonical ordering (unsigned compare)  ✓", color: "ok", delay: 400 },
  { text: "[STEP 9] Applying inverse permutation...  ✓", color: "ok", delay: 350 },
  { text: "[STEP 10] Validating all values within CVD...", color: "info", delay: 500 },
  { text: "          NaN payload violations: 0  ✓", color: "ok", delay: 300 },
  { text: "          Signed-zero violations: 0  ✓", color: "ok", delay: 250 },
  { text: "[SPCMP] VERIFICATION COMPLETE — ARTIFACT CONFORMANT", color: "success", delay: 700 },
];

/* ─── LINE COLORS ───────────────────────────────────────── */
const LINE_COLORS = {
  muted:   "rgba(160,170,187,0.55)",
  info:    "#33bbff",
  warn:    "#ffcc00",
  ok:      "#00ff6e",
  success: "#00ff6e",
  error:   "#ff3246",
};

/* ─── TERMINAL PRINT ────────────────────────────────────── */
let isRunning = false;

async function printLines(lines) {
  if (isRunning) return;
  isRunning = true;
  terminalOutput.innerHTML = "";
  tbStatus.textContent     = "RUNNING";
  tbStatus.classList.add("running");

  for (const line of lines) {
    await sleep(line.delay || 0);
    const span = document.createElement("span");
    span.style.color   = LINE_COLORS[line.color] || LINE_COLORS.muted;
    span.style.display = "block";

    // Typewriter for success lines
    if (line.color === "success") {
      span.style.fontWeight = "600";
      await typewrite(span, line.text, 18);
    } else {
      span.textContent = line.text;
    }

    terminalOutput.appendChild(span);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  tbStatus.textContent = "DONE";
  tbStatus.classList.remove("running");

  // Add to ledger if successful
  addLedgerEntry();
  isRunning = false;
}

async function typewrite(el, text, speed = 22) {
  for (const char of text) {
    el.textContent += char;
    await sleep(speed);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ─── BUTTONS ───────────────────────────────────────────── */
if (btnSimulate) {
  btnSimulate.addEventListener("click", () => printLines(PCMP_AUDIT_LINES));
}

if (btnSpcmp) {
  btnSpcmp.addEventListener("click", () => printLines(SPCMP_LINES));
}

/* ─── VERIFICATION LEDGER ───────────────────────────────── */
const LEDGER = [];
let blockNum  = 1;

const DUMMY_IDS = [
  "0x8dc860c7", "0x3a91f4e2", "0xbf20ac71", "0xd9e130c4",
  "0x5f7ab2d8", "0x1c4e89a3", "0x77f3d20b", "0x42ea9c61",
];

const MODELS = [
  "BLIP/GQA_Attn", "Llama3/FFN_Out", "Mistral/LogitHead",
  "Phi3/Embedding", "Gemma/Attn_K", "Custom/MoE_Gate",
];

function addLedgerEntry() {
  const id    = DUMMY_IDS[LEDGER.length % DUMMY_IDS.length];
  const model = MODELS[Math.floor(Math.random() * MODELS.length)];
  const now   = new Date();
  const ts    = now.toISOString().slice(11, 19) + " UTC";

  LEDGER.unshift({ id, model, ts, block: blockNum });
  blockNum++;

  renderLedger();
}

function renderLedger() {
  if (!ledgerList) return;
  ledgerList.innerHTML = "";

  if (LEDGER.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  LEDGER.forEach((entry, idx) => {
    const li = document.createElement("li");
    li.style.cssText = `
      display:flex; align-items:center; gap:0.6rem;
      padding:0.5rem 1rem; font-size:0.7rem;
      border-bottom:1px solid rgba(255,255,255,0.04);
      animation: fade-in-row 0.3s ease both;
    `;

    li.innerHTML = `
      <span style="color:rgba(0,153,255,0.6);font-size:0.6rem;min-width:18px">#${entry.block}</span>
      <span style="color:#00ff6e;font-family:var(--font-mono);letter-spacing:0.04em;min-width:80px">${entry.id}</span>
      <span style="color:rgba(160,170,187,0.7);flex:1">${entry.model}</span>
      <span style="color:rgba(160,170,187,0.4);font-size:0.64rem">${entry.ts}</span>
    `;

    ledgerList.appendChild(li);
  });

  if (blockCounter) {
    blockCounter.textContent = `BLOCK #${String(blockNum).padStart(5, "0")}`;
  }
}

renderLedger();

/* ─── DIVERGENCE SIMULATION (problem section) ───────────── */
function runDivergenceSim() {
  const hashM4   = document.getElementById("hash-m4");
  const hashH100 = document.getElementById("hash-h100");
  const hashPcmp = document.getElementById("hash-pcmp");
  const markM4   = document.getElementById("mark-m4");
  const markH100 = document.getElementById("mark-h100");
  const ddStatus = document.getElementById("dd-status");
  const ddFooter = document.getElementById("dd-footer-text");

  if (!hashM4) return;

  const m4Hashes    = ["0x3f800000", "0x3f7fffff", "0x3f800002", "0x3f7fffe0"];
  const h100Hashes  = ["0x3f800001", "0x3f800003", "0x3f7ffffc", "0x3f800008"];
  const pcmpRoot    = "0x8dc860c7…";

  let tick = 0;

  setInterval(() => {
    tick++;
    const m4  = m4Hashes[tick  % m4Hashes.length];
    const h100 = h100Hashes[tick % h100Hashes.length];

    if (hashM4)   hashM4.textContent   = m4;
    if (hashH100) hashH100.textContent = h100;
    if (hashPcmp) hashPcmp.textContent = pcmpRoot;

    if (markM4)   { markM4.textContent  = "≠"; markM4.style.color  = "var(--red)"; }
    if (markH100) { markH100.textContent = "≠"; markH100.style.color = "var(--red)"; }

    if (ddStatus) {
      ddStatus.textContent = tick % 3 === 0 ? "DIVERGENCE ACTIVE" : "CANONICALIZING…";
      ddStatus.style.color = tick % 3 === 0 ? "var(--red)" : "var(--yellow)";
    }

    if (ddFooter) {
      const msgs = [
        "SPCMP preprocessing normalizing divergent values…",
        "Mapping to Canonical Value Domain…",
        "Merkle root converging across hardware…",
        "Canonical artifact: bit-identical ✓",
      ];
      ddFooter.textContent = msgs[tick % msgs.length];
    }
  }, 1800);
}

runDivergenceSim();

/* ─── MATRIX GRID BUILD ─────────────────────────────────── */
function buildMatrix() {
  const grid = document.getElementById("matrix-grid");
  if (!grid) return;

  for (let i = 0; i < 32; i++) {
    const cell       = document.createElement("div");
    cell.className   = "matrix-cell";
    cell.textContent = "✓";
    cell.style.animationDelay = `${(i * 0.08).toFixed(2)}s`;
    grid.appendChild(cell);
  }
}

buildMatrix();

/* ─── LIVE TICKER ───────────────────────────────────────── */
function runTicker() {
  const ticker = document.getElementById("live-ticker");
  if (!ticker) return;

  const states = [
    "ROOT: 0x8dc860c7…",
    "BLOCK #00001 · ANCHORED",
    "SPCMP PROFILE: 0x01",
    "10,712,448 LOGITS CANONICAL",
    "MERKLE DEPTH: 14",
  ];

  let i = 0;
  setInterval(() => {
    ticker.textContent = states[i % states.length];
    i++;
  }, 3000);
}

runTicker();

/* ─── VERIFY.PY DOWNLOAD ────────────────────────────────── */
// Embed verify.py content for download
const VERIFY_PY_CONTENT = `#!/usr/bin/env python3
"""
verify.py — Samayuktam PCMP + SPCMP Reference Verifier v1.0
============================================================
Usage:
  python verify.py artifact.pcmp               # summary output
  python verify.py --info artifact.pcmp        # detailed field dump
  python verify.py --json artifact.pcmp        # machine-readable JSON

Requires: pip install zstandard
"""
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
    return leaves[0] if leaves else b"\\x00" * 32


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
        expected_chunks = math.ceil(len(raw) / CHUNK_BYTES)
        meta_ok = (
            proof_type == 1 and
            total_n == info["n"] and
            ordering_mode == info["order"] and
            chunk_bytes == CHUNK_BYTES and
            num_chunks == expected_chunks and
            footer_magic == 0x50434D50 and
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
            print(f"\\n=== {p} ===")
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
`;

function downloadVerifyPy() {
  const blob = new Blob([VERIFY_PY_CONTENT], { type: 'text/x-python' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'verify.py';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── VERIFY DEMO PANEL ─────────────────────────────────── */
const VERIFY_DEMO_OUTPUTS = {
  summary: `$ python verify.py blip_gqa_attention_canonical.pcmp

[OK] blip_gqa_attention_canonical.pcmp n=10712448 order=2`,

  info: `$ python verify.py --info blip_gqa_attention_canonical.pcmp

=== blip_gqa_attention_canonical.pcmp ===
file                      : blip_gqa_attention_canonical.pcmp
valid                     : True
error                     : None
magic                     : PCMP
version                   : 1
order                     : 2
n                         : 10712448
ordering_ok               : True
ordering_violation_index  : None
permutation_ok            : True
cvd_ok                    : True
cvd_violation_index       : None
cvd_violation_reason      : None
meta_ok                   : True
proof_type                : 1
ordering_mode             : 2
chunk_bytes               : 4194304
total_n                   : 10712448
num_chunks                : 11
stored_merkle_root        : 8dc860c7a3f21e90b54da1c2...
computed_merkle_root      : 8dc860c7a3f21e90b54da1c2...
merkle_match              : True
footer_magic              : 0x50434d50
footer_version            : 1`,

  json: `$ python verify.py --json blip_gqa_attention_canonical.pcmp

{
  "file": "blip_gqa_attention_canonical.pcmp",
  "valid": true,
  "error": null,
  "magic": "PCMP",
  "version": 1,
  "order": 2,
  "n": 10712448,
  "ordering_ok": true,
  "ordering_violation_index": null,
  "permutation_ok": true,
  "cvd_ok": true,
  "cvd_violation_index": null,
  "cvd_violation_reason": null,
  "meta_ok": true,
  "proof_type": 1,
  "ordering_mode": 2,
  "chunk_bytes": 4194304,
  "total_n": 10712448,
  "num_chunks": 11,
  "stored_merkle_root": "8dc860c7a3f21e90...",
  "computed_merkle_root": "8dc860c7a3f21e90...",
  "merkle_match": true,
  "footer_magic": "0x50434d50",
  "footer_version": 1
}`
};

let currentVerifyMode = 'summary';

function showVerifyDemo(mode) {
  currentVerifyMode = mode;
  document.querySelectorAll('.vdp-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  const pre = document.getElementById('vdp-pre');
  if (pre) {
    pre.textContent = '';
    pre.style.color = mode === 'summary' ? '#00ff6e' : mode === 'json' ? '#33bbff' : '#dde4f0';
  }
  // Reset steps
  document.querySelectorAll('.vsm-step').forEach(s => {
    s.classList.remove('done', 'active');
    s.querySelector('.vsm-mark').textContent = '○';
  });
}

let demoRunning = false;

async function runVerifyDemo() {
  if (demoRunning) return;
  demoRunning = true;
  const btn = document.getElementById('btn-run-verify-demo');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Verifying…'; }

  // Reset output
  const pre = document.getElementById('vdp-pre');
  if (pre) pre.textContent = '';

  // Animate steps
  const steps = document.querySelectorAll('.vsm-step');
  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.add('active');
    steps[i].querySelector('.vsm-mark').textContent = '⏳';
    await sleep(220 + Math.random() * 150);
    steps[i].classList.remove('active');
    steps[i].classList.add('done');
    steps[i].querySelector('.vsm-mark').textContent = '✓';
  }

  // Typewrite output
  if (pre) {
    const output = VERIFY_DEMO_OUTPUTS[currentVerifyMode];
    pre.style.color = currentVerifyMode === 'summary' ? '#00ff6e'
                    : currentVerifyMode === 'json' ? '#33bbff' : '#dde4f0';
    for (const char of output) {
      pre.textContent += char;
      if (char !== '\n') await sleep(4);
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = '▶ Run Demo Verification'; }
  demoRunning = false;
}

// Init demo panel
(function() {
  const pre = document.getElementById('vdp-pre');
  if (pre) {
    pre.textContent = '$ python verify.py --help\n\nusage: verify.py [--info|--json] file1.pcmp ...\n\nClick "Run Demo Verification" to simulate.';
    pre.style.color = 'rgba(160,170,187,0.6)';
  }
})();

/* ═══════════════════════════════════════════════════════════
   SAMAYUKTAM INFERENCE — Client-side Simulator
   Mirrors app.py logic exactly (no server required)
═══════════════════════════════════════════════════════════ */

const SPCMP_CANONICAL_NAN   = 0x7FC00000;
const SPCMP_CANONICAL_NZERO = 0x00000000;
const STEP                  = 1 << 14;
const FNV_OFFSET            = 0x811C9DC5;
const FNV_PRIME             = 0x01000193;
const UINT32_MASK           = 0xFFFFFFFF;

function spcmpPreprocess(u) {
  u = u >>> 0;
  const exp = u & 0x7F800000;
  const man = u & 0x007FFFFF;
  if (exp === 0x7F800000 && man !== 0) return SPCMP_CANONICAL_NAN;
  if (u === 0x80000000) return SPCMP_CANONICAL_NZERO;
  return u;
}

function pcmpMap(u) {
  u = u >>> 0;
  if (u & 0x80000000) return (~u) >>> 0;
  return (u | 0x80000000) >>> 0;
}

function pcmpInverse(m) {
  m = m >>> 0;
  if (m & 0x80000000) return (m & 0x7FFFFFFF) >>> 0;
  return (~m) >>> 0;
}

const _buf32 = new ArrayBuffer(4);
const _f32   = new Float32Array(_buf32);
const _u32   = new Uint32Array(_buf32);

function floatToBits(f) {
  _f32[0] = f;
  return _u32[0] >>> 0;
}

function bitsToFloat(u) {
  _u32[0] = u >>> 0;
  return _f32[0];
}

function canonicalizeValue(u) {
  u = u >>> 0;
  const pre    = spcmpPreprocess(u);
  const mapped = pcmpMap(pre);
  const snapped = (Math.floor(mapped / STEP) * STEP) >>> 0;
  return spcmpPreprocess(pcmpInverse(snapped));
}

function fnv32Hash(bitsList) {
  let h = FNV_OFFSET;
  for (let i = 0; i < bitsList.length; i++) {
    const u      = bitsList[i] >>> 0;
    const mapped = pcmpMap(spcmpPreprocess(u));
    const snapped = (Math.floor(mapped / STEP) * STEP) >>> 0;
    h = (h ^ (snapped & 0xFF))         >>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
    h = (h ^ ((snapped >>> 8) & 0xFF)) >>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
    h = (h ^ ((snapped >>> 16) & 0xFF))>>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
    h = (h ^ ((snapped >>> 24) & 0xFF))>>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

function bucketOf(u) {
  return Math.floor(pcmpMap(spcmpPreprocess(u >>> 0)) / STEP);
}

// Simple seeded RNG (mulberry32)
function makeRng(seed) {
  let s = seed >>> 0;
  return {
    next() { s += 0x6D2B79F5; let t = Math.imul(s^(s>>>15),1|s); t ^= t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; },
    gauss(mu=0, sigma=1) {
      const u = Math.max(1e-10, this.next()), v = this.next();
      return mu + sigma * Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
    },
    randint(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); },
    sample(n, k) {
      const arr = Array.from({length:n},(_,i)=>i);
      for (let i=0;i<k;i++){const j=i+Math.floor(this.next()*(n-i));[arr[i],arr[j]]=[arr[j],arr[i]];}
      return arr.slice(0,k);
    }
  };
}

function generateLogits(profile, n, seed=1337) {
  const rng = makeRng(seed);
  const floats = [];

  if (profile === 'gpt2') {
    for (let i=0;i<n;i++) floats.push(rng.gauss(0,2.5));
    const k = rng.randint(5,30);
    for (let i=0;i<k;i++) floats[rng.randint(0,n-1)] += rng.gauss(6,1.5);
  } else if (profile === 'bert') {
    for (let i=0;i<n;i++) floats.push(rng.gauss(0,1.2));
    const k = rng.randint(1,5);
    for (let i=0;i<k;i++) floats[rng.randint(0,n-1)] += rng.gauss(10,0.8);
  } else if (profile === 'llama') {
    for (let i=0;i<n;i++) { const sign = rng.next()<0.5?-1:1; floats.push(sign*Math.exp(rng.gauss(0.5,2))); }
  } else if (profile === 't5') {
    for (let i=0;i<n;i++) floats.push(rng.gauss(0,0.8));
    for (let i=0;i<n;i+=20) floats[i]=0;
  } else if (profile === 'uniform') {
    for (let i=0;i<n;i++) floats.push(rng.next()*10-5);
  } else if (profile === 'sparse') {
    for (let i=0;i<n;i++) floats.push(0);
    const k = Math.max(10,Math.floor(n/20));
    for (let i=0;i<k;i++) floats[rng.randint(0,n-1)] = rng.gauss(0,4);
  } else if (profile === 'mixtral') {
    for (let i=0;i<n;i++) floats.push(rng.next()<0.3 ? rng.gauss(8,2) : rng.gauss(-1,1.5));
  } else {
    for (let i=0;i<n;i++) floats.push(rng.gauss(0,1));
  }

  return floats.map(f => floatToBits(Math.max(-3.4e38, Math.min(3.4e38, f))));
}

function injectIntraBucket(bitsA, fraction=0.15) {
  const bitsB = [...bitsA];
  const rng = makeRng(42);
  const n = bitsA.length;
  const targets = rng.sample(n, Math.max(1, Math.floor(n * fraction)));
  let count = 0;
  for (const i of targets) {
    const u       = bitsA[i] >>> 0;
    const pre     = spcmpPreprocess(u);
    const mappedA = pcmpMap(pre);
    const offset  = mappedA % STEP;
    const room    = STEP - 1 - offset;
    if (room > 2) {
      const shift   = rng.randint(1, Math.min(room, STEP >> 2));
      const mappedB = (mappedA + shift) >>> 0;
      bitsB[i] = pcmpInverse(mappedB & UINT32_MASK);
      count++;
    }
  }
  return [bitsB, count];
}

function injectSignedZeros(bitsA) {
  const bitsB = [...bitsA]; let count = 0;
  for (let i=0;i<bitsA.length;i++) { if ((bitsA[i]>>>0)===0x00000000){bitsB[i]=0x80000000;count++;} }
  return [bitsB, count];
}

function injectNanPayloads(bitsA) {
  const variants = [0x7F800001,0x7FC00001,0xFF800001,0xFFC00001,0x7FFFFFFF,0xFF800002,0x7FC01234,0xFFC0BEEF];
  const bitsB = [...bitsA]; let count=0;
  for (let i=0;i<bitsA.length;i++) {
    const u = bitsA[i]>>>0;
    if ((u&0x7F800000)===0x7F800000&&(u&0x007FFFFF)!==0){bitsB[i]=variants[i%variants.length];count++;}
  }
  return [bitsB, count];
}

function injectInterBucket(bitsA, fraction=0.10) {
  const bitsB = [...bitsA];
  const rng = makeRng(99);
  const n = bitsA.length;
  const targets = rng.sample(n, Math.max(1, Math.floor(n*fraction)));
  let count=0;
  for (const i of targets) {
    const u      = bitsA[i]>>>0;
    const pre    = spcmpPreprocess(u);
    const mapped = pcmpMap(pre);
    const bkt    = Math.floor(mapped/STEP);
    const newBkt = bkt < 0xFFFFF ? bkt+1 : bkt-1;
    bitsB[i] = pcmpInverse((newBkt*STEP) & UINT32_MASK);
    count++;
  }
  return [bitsB, count];
}

function simulateInference(bitsList, numLayers) {
  let t = bitsList.map(b => canonicalizeValue(b));
  for (let l=0;l<numLayers;l++) {
    t = t.map(b => canonicalizeValue(b));
    t = t.map(b => floatToBits(bitsToFloat(b) + 0.0001));
    t = t.map(b => canonicalizeValue(b));
  }
  t = t.map(b => canonicalizeValue(b));
  t = t.map(b => canonicalizeValue(b));
  return t;
}

const PRESETS = {
  distributed_llm: { profile:'gpt2', divergence:'intra_bucket', num_layers:12, vocab_size:512 },
  nan_resilience:  { profile:'bert', divergence:'nan_payload',   num_layers:12, vocab_size:256 },
  padding_tokens:  { profile:'t5',   divergence:'signed_zero',   num_layers:12, vocab_size:256 },
  inter_bucket_fail: { profile:'gpt2', divergence:'inter_bucket', num_layers:8, vocab_size:256 },
  sparse_moe:      { profile:'mixtral', divergence:'intra_bucket', num_layers:12, vocab_size:512 },
};

function loadPreset(id) {
  const p = PRESETS[id]; if (!p) return;
  document.getElementById('sim-profile').value    = p.profile;
  document.getElementById('sim-divergence').value = p.divergence;
  document.getElementById('sim-layers').value     = String(p.num_layers);
  const vocabSel = document.getElementById('sim-vocab');
  const vocabStr = String(p.vocab_size);
  [...vocabSel.options].forEach(o => { if(o.value===vocabStr) o.selected=true; });
}

function toHex8(u) { return '0x' + (u>>>0).toString(16).toUpperCase().padStart(8,'0'); }

async function runInferenceSim() {
  const btn = document.getElementById('btn-run-sim');
  btn.disabled = true; btn.textContent = '⏳ Running…';

  const profile    = document.getElementById('sim-profile').value;
  const divergence = document.getElementById('sim-divergence').value;
  const numLayers  = parseInt(document.getElementById('sim-layers').value);
  const vocabSize  = parseInt(document.getElementById('sim-vocab').value);

  // Yield to browser
  await new Promise(r => setTimeout(r, 10));

  const t0 = performance.now();
  const bitsA = generateLogits(profile, vocabSize, 1337);
  let bitsB, intraCount=0, interCount=0;

  if (divergence === 'intra_bucket') { [bitsB, intraCount] = injectIntraBucket(bitsA, 0.15); }
  else if (divergence === 'signed_zero') { [bitsB, intraCount] = injectSignedZeros(bitsA); }
  else if (divergence === 'nan_payload') {
    bitsB = [...bitsA];
    const nanPos = [...Array(Math.min(20, vocabSize)).keys()];
    for (const i of nanPos) { bitsA[i]=SPCMP_CANONICAL_NAN; bitsB[i]=0x7F800001; intraCount++; }
  } else if (divergence === 'inter_bucket') { [bitsB, interCount] = injectInterBucket(bitsA, 0.10); }
  else if (divergence === 'mixed') {
    let ic,sc; [bitsB, ic] = injectIntraBucket(bitsA, 0.08); [bitsB, sc] = injectSignedZeros(bitsB); intraCount=ic+sc;
  } else { bitsB = [...bitsA]; }

  const hashAPreNum = fnv32Hash(bitsA);
  const hashBPreNum = fnv32Hash(bitsB);
  const preDiffs = bitsA.filter((b,i)=>b!==bitsB[i]).length;
  const actualIntra = bitsA.filter((b,i)=>b!==bitsB[i]&&bucketOf(b)===bucketOf(bitsB[i])).length;
  const actualInter = bitsA.filter((b,i)=>b!==bitsB[i]&&bucketOf(b)!==bucketOf(bitsB[i])).length;

  const outA = simulateInference(bitsA, numLayers);
  const outB = simulateInference(bitsB, numLayers);

  const hashAPost = fnv32Hash(outA);
  const hashBPost = fnv32Hash(outB);
  const postDiffs = outA.filter((b,i)=>b!==outB[i]).length;
  const converged = hashAPost===hashBPost && postDiffs===0;

  const bktsA = bitsA.map(b=>bucketOf(b));
  const uniqueBuckets = new Set(bktsA).size;
  const elapsed = (performance.now()-t0).toFixed(1);

  // Render
  const results = document.getElementById('sim-results');
  results.classList.remove('hidden');

  const verdictBar  = document.getElementById('sim-verdict-bar');
  const verdictIcon = document.getElementById('sim-verdict-icon');
  const verdictText = document.getElementById('sim-verdict-text');

  if (converged) {
    verdictBar.className = 'sim-result-header verdict-pass';
    verdictIcon.textContent = '✓';
    verdictText.textContent = 'CONVERGED — Hashes identical after canonicalization';
  } else {
    verdictBar.className = 'sim-result-header verdict-fail';
    verdictIcon.textContent = '✗';
    verdictText.textContent = 'DIVERGED — Real inter-bucket difference detected';
  }

  document.getElementById('sim-pre-hash-a').textContent   = toHex8(hashAPreNum);
  document.getElementById('sim-pre-hash-b').textContent   = toHex8(hashBPreNum);
  document.getElementById('sim-pre-diffs').textContent    = preDiffs;
  document.getElementById('sim-intra').textContent        = actualIntra;
  document.getElementById('sim-inter').textContent        = actualInter;
  document.getElementById('sim-post-hash-a').textContent  = toHex8(hashAPost);
  document.getElementById('sim-post-hash-b').textContent  = toHex8(hashBPost);
  document.getElementById('sim-post-diffs').textContent   = postDiffs;
  document.getElementById('sim-buckets').textContent      = uniqueBuckets;
  document.getElementById('sim-elapsed').textContent      = elapsed + ' ms';

  // Color hashes
  const postHashA = document.getElementById('sim-post-hash-a');
  const postHashB = document.getElementById('sim-post-hash-b');
  postHashA.style.color = converged ? 'var(--green)' : 'var(--red)';
  postHashB.style.color = converged ? 'var(--green)' : 'var(--red)';

  // Sample table
  const tbody = document.getElementById('sim-sample-tbody');
  tbody.innerHTML = '';
  const sample = Math.min(16, vocabSize);
  for (let i=0;i<sample;i++) {
    const fa   = bitsToFloat(bitsA[i]).toFixed(5);
    const fb   = bitsToFloat(bitsB[i]).toFixed(5);
    const foA  = bitsToFloat(outA[i]).toFixed(5);
    const foB  = bitsToFloat(outB[i]).toFixed(5);
    const sameBkt = bucketOf(bitsA[i])===bucketOf(bitsB[i]);
    const conv = outA[i]===outB[i];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td class="mono">${fa}</td>
      <td class="mono ${bitsA[i]!==bitsB[i]?'cell-warn':''}">${fb}</td>
      <td class="${sameBkt?'cell-ok':'cell-fail'}">${sameBkt?'✓':'✗'}</td>
      <td class="mono">${foA}</td>
      <td class="mono ${conv?'cell-ok':'cell-fail'}">${foB}</td>
      <td class="${conv?'cell-ok':'cell-fail'}">${conv?'✓':'✗'}</td>
    `;
    tbody.appendChild(tr);
  }

  btn.disabled = false; btn.innerHTML = '<span class="btn-icon">▶</span> Run Simulation';
}

// Animate the live hash in the inference diagram
(function() {
  const el = document.getElementById('inf-live-hash');
  if (!el) return;
  const hashes = ['0x8dc860c7…','0x3a91f4e2…','0xbf20ac71…','0xd9e130c4…'];
  let i=0; setInterval(()=>{el.textContent=hashes[i++%hashes.length];},5500);
})();
