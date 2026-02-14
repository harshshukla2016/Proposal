# Audio & Video Setup Guide 🎵🎬

This guide explains how to add your custom audio and video files to the palace experience.

## File Structure

Create the following folders in your `public` directory:

```
public/
├── audio/
│   ├── palace-music.mp3
│   └── palace-music.ogg (optional, for better browser support)
└── video/
    ├── proposal-video.mp4
    └── proposal-video.webm (optional, for better browser support)
```

## Audio File (Palace Background Music) 🎵

**Location:** `public/audio/palace-music.mp3`

### Requirements:
- **Format:** MP3 (primary) or OGG (fallback)
- **Duration:** 2-5 minutes (it will loop automatically)
- **Type:** Romantic, ambient, or classical music
- **Volume:** Will auto-fade when heart is clicked

### Recommendations:
- Instrumental music works best
- Soft piano, strings, or ambient sounds
- No lyrics (unless romantic)
- Bitrate: 128-192 kbps

### How to Add:
1. Create folder: `public/audio/`
2. Place your music file as `palace-music.mp3`
3. (Optional) Add `palace-music.ogg` for Firefox support

## Video File (Proposal Video) 🎬

**Location:** `public/video/proposal-video.mp4`

### Requirements:
- **Format:** MP4 (H.264) or WebM
- **Resolution:** 1920x1080 (1080p) recommended
- **Duration:** 30 seconds to 3 minutes
- **Aspect Ratio:** 16:9

### Recommendations:
- Personal video message
- Photo slideshow with music
- Romantic montage
- Memory compilation
- Bitrate: 5-10 Mbps for good quality

### How to Add:
1. Create folder: `public/video/`
2. Place your video as `proposal-video.mp4`
3. (Optional) Add `proposal-video.webm` for better compression

## Behavior

### Audio Playback:
- ✅ **Starts:** Automatically when entering palace
- ✅ **Loops:** Continuously until heart is clicked
- ✅ **Fades:** Gradually fades out when heart is clicked
- ✅ **Stops:** Completely stops when leaving palace

### Video Playback:
- ✅ **Shows:** After clicking the heart (0.8s delay)
- ✅ **Autoplay:** Starts automatically
- ✅ **Controls:** Play/pause, volume, fullscreen
- ✅ **Close Button:** Pink × button in top-right corner
- ✅ **Overlay:** Dark background with pink glow

## File Conversion Tips

### Convert to MP3:
```bash
ffmpeg -i your-audio.wav -codec:a libmp3lame -b:a 192k palace-music.mp3
```

### Convert to MP4:
```bash
ffmpeg -i your-video.mov -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 192k proposal-video.mp4
```

### Convert to WebM (optional):
```bash
ffmpeg -i your-video.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus proposal-video.webm
```

## Testing

1. **Audio Test:**
   - Enter the palace
   - You should hear music immediately
   - Click the heart - music should fade out

2. **Video Test:**
   - Click the heart
   - Wait 0.8 seconds
   - Video should appear in center with controls
   - Click × to close

## Troubleshooting

### Audio Not Playing:
- Check file path: `public/audio/palace-music.mp3`
- Check browser console for errors
- Try clicking anywhere first (browsers block autoplay)
- Ensure file format is supported

### Video Not Playing:
- Check file path: `public/video/proposal-video.mp4`
- Check file size (keep under 50MB)
- Ensure H.264 codec for MP4
- Check browser console for errors

## Browser Support

| Browser | MP3 | OGG | MP4 | WebM |
|---------|-----|-----|-----|------|
| Chrome  | ✅  | ✅  | ✅  | ✅   |
| Firefox | ✅  | ✅  | ✅  | ✅   |
| Safari  | ✅  | ❌  | ✅  | ❌   |
| Edge    | ✅  | ✅  | ✅  | ✅   |

## Example Files

If you don't have files yet, you can use placeholder files:

### Create Silent Audio (for testing):
```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 10 -q:a 9 -acodec libmp3lame public/audio/palace-music.mp3
```

### Create Test Video (for testing):
```bash
ffmpeg -f lavfi -i testsrc=duration=10:size=1920x1080:rate=30 -pix_fmt yuv420p public/video/proposal-video.mp4
```

## Notes

- Files are loaded from the `public` folder
- No need to import them in code
- Paths start with `/` (e.g., `/audio/palace-music.mp3`)
- Audio loops automatically
- Video has standard HTML5 controls
- Both support multiple formats for browser compatibility

---

**Ready to add your files!** 🎉

Place your audio and video files in the correct folders and refresh the page!
