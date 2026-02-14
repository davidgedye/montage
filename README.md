# Montage

A browser-based image composition tool for combining, blending, and manipulating photos.

## Features

- Load multiple images via drag-and-drop or file picker
- **HEIC/HEIF support** - iOS photos are automatically converted
- Drag images to position them
- Resize images with corner handles
- Flip (H/V) and rotate (L/R) images in 90° increments
- Blend modes for double-exposure effects (B to cycle, or right-click menu)
- Edge crop handles for non-destructive cropping
- Zoom and pan the canvas
- Arrow keys for fine positioning (Shift+Arrow for larger steps)
- Duplicate images (D)
- Bring to top (T)
- Save as JPG at full resolution
- Delete/Backspace to remove selected image

## Running

A local web server is required (for HEIC conversion via CDN scripts):

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Batch Export

Export all `.montage` files in a directory to JPGs using a headless browser.

**Prerequisites:** Node 18+, Playwright, and Edge browser.

```bash
npm install playwright
npx playwright install msedge
```

**Usage:**

```bash
node batch-export.js <input-dir> <output-dir>
```

**Example (WSL with Windows files):**

```bash
node batch-export.js "/mnt/c/Users/you/Pictures/montages/" ./exported/
```

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- [Konva.js](https://konvajs.org/) for canvas manipulation
- [heic-to](https://github.com/nicolo-ribaudo/heic-to) for iOS HEIC/HEIF conversion

## License

MIT
