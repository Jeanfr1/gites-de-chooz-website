#!/usr/bin/env python3
"""Decode Drive downloads (saved by the Drive connector as JSON/base64 tool results)
into 10-photos-so-dream/<gite>/<title>, using manifest.json; removes each decoded tool result."""
import base64, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "10-photos-so-dream"
manifest = json.loads((OUT / "manifest.json").read_text())
where = {fid: (g, name) for g, files in manifest.items() if not g.startswith("_") for name, fid in files.items()}
done = 0
for src in sorted(Path(sys.argv[1]).glob("mcp-*download_file_content-*.txt")):
    try:
        d = json.loads(src.read_text())
    except Exception as e:
        print("skip", src.name, e); continue
    g, name = where.get(d.get("id"), ("_unsorted", Path(d.get("title", src.stem)).stem))
    dest = OUT / g / d.get("title", name + ".jpg")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(base64.b64decode(d["content"]))
    src.unlink(); done += 1
have = {g: len(list((OUT / g).glob("*.jpg"))) for g in manifest if not g.startswith("_")}
print("decoded", done, "| on disk:", have, "| total", sum(have.values()), "/", len(where))
