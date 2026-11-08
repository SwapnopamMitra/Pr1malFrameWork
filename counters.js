/* ═══════════════════════════════════════════════════════════
   SAMAYUKTAM · counters.js
   Live Animated Status Counters + Hash Rotation
═══════════════════════════════════════════════════════════ */

(function () {

  /* ─── LOGITS/SEC COUNTER ──────────────────────────────── */
  const counterLogits = document.getElementById("counter-logits");
  const counterHashes = document.getElementById("counter-hashes");

  let logitsBase  = 10_712_448;
  let hashCount   = 1;
  let logitJitter = 0;

  function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  }

  if (counterLogits) {
    setInterval(() => {
      logitJitter = Math.floor((Math.random() - 0.5) * 50_000);
      const displayed = logitsBase + logitJitter;
      counterLogits.textContent = formatNum(displayed);
    }, 1200);
  }

  if (counterHashes) {
    // Counts up slowly over time
    setInterval(() => {
      hashCount += Math.floor(Math.random() * 3) + 1;
      counterHashes.textContent = hashCount;
    }, 4000);
  }

  /* ─── LIVE HASH ROTATION ──────────────────────────────── */
  const liveHash = document.getElementById("live-hash");

  const hashPool = [
    "0x8dc860c7a3f21e90",
    "0x3a91f4e2b70dc851",
    "0xbf20ac71d9e130c4",
    "0xd9e130c45f7ab2d8",
    "0x5f7ab2d81c4e89a3",
    "0x8dc860c7a3f21e90", // repeat canonical to reinforce
  ];

  if (liveHash) {
    let hi = 0;
    setInterval(() => {
      liveHash.textContent = hashPool[hi % hashPool.length];
      hi++;
    }, 5500);
  }

  /* ─── SCROLL ENTRANCE ANIMATIONS ─────────────────────── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".section-block, .stat-strip, .threat-strip, .directives-block")
    .forEach((el) => {
      el.style.opacity           = "0";
      el.style.transform         = "translateY(20px)";
      el.style.transition        = "opacity 0.65s ease, transform 0.65s ease";
      el.style.animationPlayState = "paused";

      observer.observe(el);

      // Trigger via IntersectionObserver
      const io2 = new IntersectionObserver((ents) => {
        ents.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity   = "1";
            e.target.style.transform = "translateY(0)";
            io2.unobserve(e.target);
          }
        });
      }, observerOptions);
      io2.observe(el);
    });

  /* ─── STEP ITEM STAGGER ON SCROLL ────────────────────── */
  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const steps = entry.target.querySelectorAll(".step-item");
        steps.forEach((step, i) => {
          step.style.opacity    = "0";
          step.style.transform  = "translateX(-12px)";
          step.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
          requestAnimationFrame(() => {
            step.style.opacity   = "1";
            step.style.transform = "translateX(0)";
          });
        });
        stepObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".steps-list").forEach((el) => stepObs.observe(el));

  /* ─── PROTOCOL CARDS STAGGER ──────────────────────────── */
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(".proto-card");
        cards.forEach((card, i) => {
          card.style.opacity    = "0";
          card.style.transform  = "translateY(18px)";
          card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
          requestAnimationFrame(() => {
            card.style.opacity   = "1";
            card.style.transform = "translateY(0)";
          });
        });
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".protocol-cards").forEach((el) => cardObs.observe(el));

  /* ─── MATRIX CELL ANIMATION STAGGER ──────────────────── */
  const matrixObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cells = entry.target.querySelectorAll(".matrix-cell");
        cells.forEach((cell, i) => {
          cell.style.opacity   = "0";
          cell.style.transform = "scale(0.6)";
          cell.style.transition = `opacity 0.3s ease ${i * 0.04}s, transform 0.3s ease ${i * 0.04}s`;
          cell.style.animation = "none";
          setTimeout(() => {
            cell.style.opacity    = "";
            cell.style.transform  = "";
            cell.style.animation  = `cell-pulse 4s ease ${i * 0.13}s infinite`;
          }, i * 40 + 100);
        });
        matrixObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".matrix-grid").forEach((el) => matrixObs.observe(el));

})();
