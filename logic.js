const terminal = document.getElementById("terminal-output");
const button = document.getElementById("simulate");

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
