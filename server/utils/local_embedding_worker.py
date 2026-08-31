"""Long-lived CPU worker for the local sentence-transformers fallback.

The Node service starts this process once. Keeping it alive avoids loading the
MiniLM model for every request on small deployments such as Render Free.
"""

import json
import os
import sys

try:
    from sentence_transformers import SentenceTransformer

    model_name = os.environ.get("LOCAL_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    model = SentenceTransformer(model_name, device="cpu")
except Exception as exc:  # noqa: BLE001 - returned safely to the Node caller
    print(json.dumps({"error": f"Local Sentence Transformer unavailable: {exc}"}), flush=True)
    sys.exit(1)

for line in sys.stdin:
    try:
        request = json.loads(line)
        text = str(request.get("text", ""))
        vector = model.encode(
            [text],
            batch_size=1,
            convert_to_numpy=True,
            normalize_embeddings=False,
            show_progress_bar=False,
        )[0].tolist()
        print(json.dumps({"embedding": vector}), flush=True)
    except Exception as exc:  # noqa: BLE001 - keep the worker alive for later requests
        print(json.dumps({"error": str(exc)}), flush=True)
