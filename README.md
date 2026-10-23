# PIXELMIND

A responsive browser-based drawing studio prototype built with HTML, CSS, and JavaScript.

## Run locally
Open `index.html` in a modern browser. For best results, serve the folder using a local static server.

## Deploy to GitHub Pages
1. Upload all files in this folder to a GitHub repository.
2. Open **Settings → Pages**.
3. Select the branch and root folder, then save.
4. Wait for GitHub Pages to publish the site.

## Features
- Responsive project dashboard and animated new-project dialog
- Canvas drawing with pen, highlighter, eraser, basic shapes, and text
- Brush size, opacity, color picker, gradient brush
- Undo/redo snapshots
- IndexedDB project persistence with LocalStorage fallback
- Project search, rename, duplicate, delete, and PDF export
- Liquid-glass floating dock with animated water-bubble control
- SVG icons and animated SVG four-finger gesture tutorial
- Fullscreen button and best-effort four-touch gesture recognition
- Reduced-motion support

## Important limitations
- Browser storage is local to the browser/device. It is not cloud sync. Export backups regularly.
- Four-finger gesture support varies by browser and operating system. Use the fullscreen button if the gesture is intercepted.
- The initial PDF export uses a client-side jsPDF library loaded from a CDN. An internet connection is required for that library unless you bundle it locally.
- The current drawing engine uses raster canvas snapshots for undo/redo. It is a functional starter implementation, not a full professional vector editor.
- Browser font loading depends on the external Google Fonts service unless fonts are bundled locally.
