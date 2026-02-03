# Symmetries

A browser-based image composition tool for combining, blending, and manipulating photos.

## Features

### Current (v0.1)
- Load multiple images via drag-and-drop or file picker
- Drag images to position them
- Resize images with corner handles
- Zoom and pan the canvas
- Arrow keys for fine positioning (Shift+Arrow for larger steps)
- Delete/Backspace to remove selected image

### Planned
- Flip and rotate individual images
- Blend overlapping images by percentage
- Draggable cut-line for precise edge positioning
- Export at full resolution for print

## Development

No build system required — open `index.html` in a browser.

```bash
# Or run a local server
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- [Konva.js](https://konvajs.org/) for canvas manipulation

## License

MIT
