# Video optimization instructions (for AI / ffmpeg)

These are the recommended targets for web usage in this project.

## Primary target (MP4 H.264)

- Container: MP4
- Video codec: H.264 (libx264)
- Pixel format: yuv420p (maximum compatibility)
- Audio codec: AAC (keep audio if present)
- Fast start: enabled (moov atom at the beginning)

### Recommended commands

#### 1080p max (recommended)

```bash
ffmpeg -i INPUT \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  OUTPUT.mp4
```

#### 720p max (lighter)

```bash
ffmpeg -i INPUT \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  OUTPUT.mp4
```

## Optional secondary target (WebM VP9)

```bash
ffmpeg -i INPUT \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libvpx-vp9 -b:v 0 -crf 33 \
  -c:a libopus -b:a 96k \
  OUTPUT.webm
```

## Notes

- If the video will auto-play, consider removing audio to reduce size.
- Keep short clips < 15s when possible.
- If transparency is required (rare): consider WebM VP9 with alpha.
