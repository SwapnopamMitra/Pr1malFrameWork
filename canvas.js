/* ═══════════════════════════════════════════════════════════
   SAMAYUKTAM · canvas.js
   Background: Hex Grid + Floating Data Streams
═══════════════════════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, animFrame;

  /* ── DATA STREAMS (falling bytes) ──────────────────────── */
  const STREAM_COUNT = 28;
  const streams = [];

  const CHARS = "01アイウエオカキクケコサシスセソタチツテト∂∇Σ∏∆0x38ffa1c7de02bf9481e6cd";

  class DataStream {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x      = Math.random() * W;
      this.y      = init ? Math.random() * H : -40;
      this.speed  = 0.7 + Math.random() * 1.4;
      this.len    = 8 + Math.floor(Math.random() * 18);
      this.chars  = Array.from({ length: this.len }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      );
      this.opacity = 0.04 + Math.random() * 0.07;
      this.color   = Math.random() < 0.7 ? "0,153,255" : "0,255,110";
      this.size    = 9 + Math.floor(Math.random() * 5);
    }

    update() {
      this.y += this.speed;
      if (Math.random() < 0.04) {
        const idx = Math.floor(Math.random() * this.chars.length);
        this.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      if (this.y - this.len * this.size > H) this.reset();
    }

    draw() {
      for (let i = 0; i < this.len; i++) {
        const fade = (i + 1) / this.len;
        ctx.globalAlpha = this.opacity * fade;
        ctx.fillStyle   = `rgba(${this.color},1)`;
        ctx.font        = `${this.size}px 'JetBrains Mono', monospace`;
        ctx.fillText(this.chars[i], this.x, this.y - i * this.size);
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ── HEX GRID ───────────────────────────────────────────── */
  const HEX_R   = 36;
  const HEX_PAD = 4;
  let hexes     = [];

  function hexPoints(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  function buildHexGrid() {
    hexes = [];
    const rH   = HEX_R * Math.sqrt(3);
    const rV   = HEX_R * 1.5;
    const cols  = Math.ceil(W / rH) + 2;
    const rows  = Math.ceil(H / rV) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offset = row % 2 === 0 ? 0 : rH / 2;
        const cx = col * rH + offset;
        const cy = row * rV;
        hexes.push({ cx, cy, pulse: Math.random(), speed: 0.002 + Math.random() * 0.005 });
      }
    }
  }

  function drawHexGrid() {
    for (const h of hexes) {
      h.pulse += h.speed;
      if (h.pulse > 1) h.pulse = 0;
      const alpha = 0.018 + 0.012 * Math.sin(h.pulse * Math.PI * 2);
      const pts   = hexPoints(h.cx, h.cy, HEX_R - HEX_PAD);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,153,255,${alpha})`;
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }
  }

  /* ── NODES ──────────────────────────────────────────────── */
  const NODES = [];
  const NODE_COUNT = 24;

  class Node {
    constructor() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.18;
      this.vy   = (Math.random() - 0.5) * 0.18;
      this.r    = 1.5 + Math.random() * 2;
      this.life = Math.random();
      this.green = Math.random() < 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life += 0.004;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      const alpha = 0.1 + 0.1 * Math.sin(this.life * Math.PI * 2);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.green
        ? `rgba(0,255,110,${alpha})`
        : `rgba(0,153,255,${alpha})`;
      ctx.fill();
    }
  }

  function drawEdges() {
    const MAX_DIST = 160;
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const dx   = NODES[i].x - NODES[j].x;
        const dy   = NODES[i].y - NODES[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = 0.025 * (1 - dist / MAX_DIST);
          ctx.beginPath();
          ctx.moveTo(NODES[i].x, NODES[i].y);
          ctx.lineTo(NODES[j].x, NODES[j].y);
          ctx.strokeStyle = `rgba(0,153,255,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    streams.length = 0;
    for (let i = 0; i < STREAM_COUNT; i++) streams.push(new DataStream());

    buildHexGrid();

    NODES.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) NODES.push(new Node());
  }

  /* ── ANIMATE ────────────────────────────────────────────── */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    drawHexGrid();
    drawEdges();

    for (const n of NODES) { n.update(); n.draw(); }
    for (const s of streams) { s.update(); s.draw(); }

    animFrame = requestAnimationFrame(animate);
  }

  init();
  animate();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animFrame);
    init();
    animate();
  });
})();
