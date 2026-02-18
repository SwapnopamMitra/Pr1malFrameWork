const terminal = document.getElementById("terminal-output");
const button = document.getElementById("simulate");

const ledgerList = document.getElementById("ledger-list");
const emptyState = document.querySelector(".ledger-empty");

const lines = [
  "[INFO] Parsing GQA_Attention_Node_Output.bin...",
  "[WARN] Divergence Detected: M4_MAX_HASH != NVIDIA_H100_HASH",
  "[ACTION] Applying PCMP Canonicalization...",
  "[SUCCESS] Canonical Merkle Root: 0x8dc860c7... [MATCH]",
  "[INFO] Standard Compliance: Samayuktam v1.0"
];

button.onclick = async () => {
  terminal.innerHTML = "";
  for (const line of lines) {
    terminal.innerHTML += line + "<br/>";
    await new Promise(r => setTimeout(r, 700));
  }
};

const LEDGER = [];

function renderLedger() {
  if (!ledgerList) return;

  ledgerList.innerHTML = "";

  if (LEDGER.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  LEDGER.forEach((entry, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="id">${entry.id}</span>
      <span class="name">${entry.name}</span>
      <span class="meta">${entry.date} | ${entry.version}</span>
    `;

    ledgerList.appendChild(li);
  });
}

renderLedger();
