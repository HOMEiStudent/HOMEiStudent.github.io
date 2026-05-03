# Hero Videos

Drop your hero phone-mockup videos in this folder.

## Required filenames

- `hero-1.mp4` — first slide (was Dashboard)
- `hero-2.mp4` — second slide (was Shopping List)
- `hero-3.mp4` — third slide (was Money Tracking)

## Recommended specs

- **Format:** MP4 (H.264 codec) — best browser support
- **Aspect ratio:** 9:19.5 (portrait, matches an iPhone screen)
- **Resolution:** 750 × 1624 px is ideal (or higher, e.g. 1080 × 2340)
- **Length:** 4–6 seconds each (the carousel rotates every 6 seconds)
- **File size:** Aim for under 1 MB per video for fast loading
- **Audio:** None needed — videos play muted on the page

## Optimisation tips

- Compress with [HandBrake](https://handbrake.fr/) or `ffmpeg`
- Example ffmpeg command:
  ```
  ffmpeg -i input.mov -vcodec libx264 -crf 28 -preset slow -an -vf "scale=750:-2" hero-1.mp4
  ```
- The `-an` flag strips audio (not used)
- Lower `-crf` = higher quality but bigger file (23 = high, 28 = balanced, 32 = small)

## How it works

- Videos autoplay, are muted, and loop while active
- The carousel rotates between videos every 6 seconds
- Inactive videos pause and rewind to save bandwidth
