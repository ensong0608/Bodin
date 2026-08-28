# Bodin + Ensong · 25th-Anniversary Website

This project is a static, mobile-first, accessible love-story site.

## Project Structure

- `index.html` - Home page
- `gallery.html` - Gallery page with lightbox
- `letter.html` - Letter page
- `birthday-letter.html` - Preserved original birthday letter
- `songs.html` - Songs page with lyrics and download dropdowns
- `assets/css/styles.css` - Shared styles
- `assets/js/main.js` - Rendering, gallery lightbox, and music player
- `assets/data/content.json` - Main editable content source
- `assets/images/` - Place your photos here

## Edit Website Content

All major content comes from `assets/data/content.json`.

Edit these sections:

- `site.brand`, `site.homeTitle`, `site.homeIntro`, `site.homeSummary`
- `site.relationshipStartISO`, `site.anniversaryDateISO`, `site.anniversaryDateText`
- `site.enableLyrics` (`true` or `false` to show/hide lyrics panel)
- `site.musicTracks` (array of songs for the player; each song can include `title`, `src`, and `lyrics`)
- `gallery.featuredItems` (the new 25-photo anniversary collection)
- `gallery.items` (the complete gallery)
- `letter.date`, `letter.title`, `letter.greeting`, `letter.paragraphs`, `letter.signature`
- `birthdayLetter` - the preserved original birthday letter

## Add Real Photos

1. Put image files into `assets/images/`.
2. Update each `gallery.items[].src` in `assets/data/content.json`.
3. Use relative paths, for example:
   - `assets/images/our-first-trip.jpg`
   - `assets/images/anniversary-2026.png`
4. Add meaningful `alt` text for accessibility.

## Add the 25th-Anniversary Photos

The anniversary layout is already prepared for your photos:

1. **Then and now:** in `index.html`, replace the two image `src` values inside the `then-now-grid` section. The current early-date and recent cutouts will remain as fallbacks until you do.
2. **25 featured memories:** place the selected photos in `assets/images/anniversary/`, then add them to `gallery.featuredItems` in `assets/data/content.json`.
3. Each featured item should look like:

```json
{
  "src": "assets/images/anniversary/01-our-beginning.jpg",
  "alt": "Bodin and Ensong together near the beginning of their relationship",
  "caption": "2001 — The beginning of our beautiful trouble.",
  "memory": "anniversary-01"
}
```

Featured items automatically appear first in the full gallery. The home page uses the first three as its anniversary preview. Add up to 25 without changing any JavaScript.

## Song Gallery + Lyrics

- Home now includes a **Song Gallery** section that lists songs from `site.musicTracks`.
- Selecting a song loads lyrics from its `lyrics` path and shows them in the lyrics panel.
- Keep lyrics files in `assets/Song/lyrics/` and ensure each track entry has a matching `lyrics` value.

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
