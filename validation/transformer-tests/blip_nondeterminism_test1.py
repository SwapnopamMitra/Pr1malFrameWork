import os
import torch
import numpy as np
import random
import hashlib
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

# ============================
# HARD CUDA DETERMINISM
# ============================

os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":4096:8"

torch.manual_seed(0)
np.random.seed(0)
random.seed(0)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

torch.use_deterministic_algorithms(True)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

if DEVICE == "cuda":
    torch.cuda.manual_seed_all(0)

print("Running on:", DEVICE)

# ============================
# CONFIG
# ============================

MODEL_NAME = "Salesforce/blip-image-captioning-base"
IMAGE_PATH = "test.jpg"
RUNS = 3

# ============================
# LOAD MODEL
# ============================

processor = BlipProcessor.from_pretrained(MODEL_NAME, use_fast=True)
model = BlipForConditionalGeneration.from_pretrained(
    MODEL_NAME,
    use_safetensors=True
).to(DEVICE)
model.eval()

image = Image.open(IMAGE_PATH).convert("RGB")
inputs = processor(images=image, return_tensors="pt").to(DEVICE)

# ============================
# TEST LOOP
# ============================

hashes = []

for run in range(RUNS):
    print(f"\n=== RUN {run+1} ===")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            do_sample=False,
            num_beams=1,
            return_dict_in_generate=True,
            output_scores=True
        )

        # Collect raw generation scores (true generation path)
        scores = torch.stack(outputs.scores, dim=0)
        logits = scores.detach().cpu().numpy().astype(np.float32)

    sha = hashlib.sha256(logits.tobytes()).hexdigest()
    print("SHA256:", sha)
    hashes.append(sha)

print("\n=== HASH COMPARISON ===")
for i, h in enumerate(hashes):
    print(f"Run {i+1}: {h}")

if len(set(hashes)) == 1:
    print("\nRESULT: Bitwise deterministic under current conditions.")
else:
    print("\nRESULT: NON-DETERMINISM DETECTED.")