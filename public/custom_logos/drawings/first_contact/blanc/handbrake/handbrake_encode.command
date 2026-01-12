#!/bin/zsh
set -euo pipefail

PRESET="Fast 1080p30"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

IN_DIR="$ROOT_DIR/videos"
OUT_DIR="$SCRIPT_DIR/output"

mkdir -p "$OUT_DIR"

if ! command -v HandBrakeCLI >/dev/null 2>&1; then
  echo "HandBrakeCLI not found. Install with: brew install handbrake"
  exit 1
fi

for f in "$IN_DIR"/*; do
  if [ ! -f "$f" ]; then
    continue
  fi
  name="$(basename "$f")"
  base="${name%.*}"
  out="$OUT_DIR/${base}.mp4"
  echo "Encoding: $name -> $(basename "$out")"
  HandBrakeCLI -i "$f" -o "$out" -Z "$PRESET" --optimize
done

echo "Done. Outputs in: $OUT_DIR"
