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


## Version 2 update notes
- Adds a first-run display-name window and editable profile chip; the chosen name is stored locally in this browser.
- Adds animated logo glow and refined liquid-glass water bubble/dock transitions.
- Adds canvas width/height controls and canvas zoom buttons.
- Shape settings now include outline width, fill mode and fill color.
- Text can be placed at the tapped canvas position when text is entered in the Text panel.
- Adds Spray and Stamp tool buttons; Stamp inserts a small star mark.

This remains a client-side drawing studio. Browser/device behavior and all gestures should be tested on the target phone before relying on it.


## Version 3 update notes
Files: `index.html`, `style.css`, `plus.css` (v3 styles), `app.js`, `plus.js` (v3 behaviour).
- Intro on every fresh open: PIXELMIND, then "Created By Shiv Yogi" (no skip button), then the display-name window on first visit.
- Draggable water-pebble dock: tap the bubble to pull the dock up; tap the arrow at the top of the dock to pull it down. The bubble then rolls to the nearest screen side like a water drop. Drag the bubble or the dock grip anywhere; they stretch and wobble like a pebble. Dock is transparent Liquid Glass with background blur.
- Expand button in the dock shows every tool at once (no swiping). On phones it folds back after you pick a tool so the tool settings stay visible.
- New tools: Canvas panel (presets such as HD, QHD, 4K wide, A4, Story, Banner; sliders up to 4000 px), custom background color or photo, Import image, Sign.
- Settings (gear icon, home and studio): draw or type a default signature. The Sign tool places it where you tap.
- Export PDF opens a sheet: optionally sign the painting (bottom right/left/center). PDF header order: project name, PIXELMIND, Created By Shiv Yogi. File name: `<Project> - PIXELMIND - Created By Shiv Yogi.pdf`.
- Enter/back animations for the project list and the drawing screen.
- Fix: Undo previously jumped back two steps; it now undoes one action at a time.

Limitations: background color/photo fills the blank paper area (use Undo to change it again); very large canvases use more memory on phones; PDF export still needs internet for the jsPDF library; four-finger gesture depends on the device.
