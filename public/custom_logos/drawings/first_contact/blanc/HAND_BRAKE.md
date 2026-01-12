# HandBrake (recommended) — Video optimization

## Option A: HandBrake app (GUI)

1. Open the video from the ZIP folder: `videos/`.
2. Choose preset:
   - `Fast 1080p30` (recommended)
   - or `Fast 720p30` (lighter)
3. In `Summary`, enable **Web Optimized**.
4. Export as `.mp4`.

## Option B: HandBrakeCLI (batch)

If you have HandBrakeCLI installed, run the script:

- `handbrake/handbrake_encode.command`

This will read `videos/*` and write optimized MP4s to `handbrake/output/`.

If HandBrakeCLI is not installed:

`brew install handbrake`

Notes:

- This project prefers MP4 H.264 + "Web Optimized".
- If you need autoplay backgrounds, consider removing audio to reduce size.
