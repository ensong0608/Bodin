# Private-ish Multi-Page Anniversary Website

This project is a static, mobile-first, accessible love-story site with a lightweight passphrase gate.

## Project Structure

- `index.html` - Home + passphrase gate
- `timeline.html` - Timeline page (protected)
- `gallery.html` - Gallery page with lightbox (protected)
- `letter.html` - Letter page (protected)
- `assets/css/styles.css` - Shared styles
- `assets/js/main.js` - Gate logic, rendering, timeline reveal, gallery lightbox
- `assets/data/content.json` - Main editable content source
- `assets/images/` - Place your photos here

## Important Privacy Note

This gate is only a **lightweight privacy layer** using `sessionStorage` in the browser. It is **not true security** and should not be used to protect sensitive/private data.

## Edit Website Content

All major content comes from `assets/data/content.json`.

Edit these sections:

- `site.brand`, `site.homeTitle`, `site.homeIntro`, `site.homeSummary`
- `site.anniversaryDateISO`, `site.anniversaryDateText`
- `site.passphrase` (the unlock passphrase)
- `timeline.events` (array of `{ "label", "text" }`)
- `gallery.items` (array of `{ "src", "alt", "caption" }`)
- `letter.title`, `letter.greeting`, `letter.paragraphs`, `letter.signature`

## Add Real Photos

1. Put image files into `assets/images/`.
2. Update each `gallery.items[].src` in `assets/data/content.json`.
3. Use relative paths, for example:
   - `assets/images/our-first-trip.jpg`
   - `assets/images/valentines-2026.png`
4. Add meaningful `alt` text for accessibility.

## Run Locally

Use a tiny local static server so `assets/data/content.json` loads correctly.

### Option A: Python (no build tools)

1. Open a terminal in the project folder.
2. Run:
   - `python -m http.server 8000`
3. Open:
   - `http://localhost:8000/index.html`

### Option B: VS Code Live Server

1. Open the folder in VS Code.
2. Start Live Server.
3. Open `index.html` from the served URL.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Open repository **Settings** > **Pages**.
3. Under **Build and deployment** set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Save and wait for publish.
5. Visit the generated site URL.

## Notes

- No frameworks, no external libraries, no CDNs.
- All page links are local relative links.
- Gallery lightbox supports keyboard navigation (`Left`, `Right`, `Escape`) and focus trapping.
- Non-home pages redirect to `index.html` if the session is locked.
