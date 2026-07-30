# ValoCookie Streamer Tools — GitHub Pages site

Static landing page for:

- **osu!Requests** — https://github.com/ValoCookie/osu-Requests
- **StreamFlight** — https://github.com/ValoCookie/streamflight

## Recommended repository

Create a **public** repository named exactly:

`ValoCookie.github.io`

Upload the contents of this folder to the repository root.

Then open **Settings → Pages** and set:

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/ (root)`

The site should publish at:

`https://ValoCookie.github.io`

## Release buttons

`script.js` checks each public GitHub repository for its latest GitHub Release. If a release exists, the page displays the tag and prefers a Setup/installer `.exe` asset automatically. If no release exists, the button falls back to that project's Releases page.

That means the website does **not** need to be manually edited for every application update.

## Files

- `index.html` — page content
- `styles.css` — responsive dark/purple UI
- `script.js` — automatic GitHub Release lookup
- `.nojekyll` — serves the static files directly
