import os
import torch
import numpy as np
import random
import hashlib
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

MODEL_NAME = "Salesforce/blip-image-captioning-base"
IMAGE_PATH = "test.jpg"

RUNS = 5
BATCH_SIZE = 32
USE_FP16 = False
DETERMINISTIC = True

os.environ["CUBLAS_WORKSPACE_CONFIG"] = ":4096:8"

torch.manual_seed(0)
np.random.seed(0)
random.seed(0)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

if DETERMINISTIC:
    torch.use_deterministic_algorithms(True)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
else:
    torch.backends.cudnn.benchmark = True

if DEVICE == "cuda":
    torch.cuda.manual_seed_all(0)

print("Running on:", DEVICE)
print("Deterministic mode:", DETERMINISTIC)
print("Batch size:", BATCH_SIZE)
print("FP16 enabled:", USE_FP16)

processor = BlipProcessor.from_pretrained(MODEL_NAME, use_fast=True)

model = BlipForConditionalGeneration.from_pretrained(
    MODEL_NAME,
    use_safetensors=True
).to(DEVICE)

if USE_FP16:
    model = model.half()

model.eval()

image = Image.open(IMAGE_PATH).convert("RGB")

images = [image] * BATCH_SIZE

inputs = processor(images=images, return_tensors="pt").to(DEVICE)

if USE_FP16:
    for k in inputs:
        if inputs[k].dtype == torch.float32:
            inputs[k] = inputs[k].half()

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