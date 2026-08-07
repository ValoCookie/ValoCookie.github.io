# ValoCookie Streamer Tools

Official GitHub Pages website for **osuStreamDeck** and **StreamFlight**.

🌐 https://valocookie.github.io/

## Apps

### osuStreamDeck — v1.5.0

Windows Twitch → osu! request manager and stream-side toolkit for **osu!stable** and **osu!lazer**.

Version **1.5.0** expands the app into a broader **osu! Overlays** toolkit. Alongside the Twitch request queue and request Browser Sources, osuStreamDeck now includes separately editable overlays for the Key Overlay, PP Counter, PP Graph, Now Playing, Score Stats, Map Timeline and Ranked Play. Gameplay overlays support transparent OBS backgrounds and customizable presentation.

The app also includes queue/review controls, optional map filters, `!np`, viewer `!myq`, editable `!skin`, customizable osu! request-message formatting, cleaner mod delivery, improved Twitch mentions/reminders and portable in-place updates.

- Website: https://valocookie.github.io/osu-requests/
- Repository: https://github.com/ValoCookie/osu-Requests
- Releases: https://github.com/ValoCookie/osu-Requests/releases

### StreamFlight — v1.1.1

Windows pre-stream workspace for ordered application startup, optional delays, background helpers, global access hotkeys, websites, reusable checklists, profiles, readiness status and end-of-session cleanup.

- Website: https://valocookie.github.io/streamflight/
- Repository: https://github.com/ValoCookie/streamflight
- Releases: https://github.com/ValoCookie/streamflight/releases

## Automatic release display

The website reads `/updates.json` (maintained by the ValoCookie Release Manager) and also checks GitHub Releases. The newest valid version is displayed automatically and the download button points to the matching release asset.

The HTML contains the current release as a safe initial/fallback value, so the page still shows a sensible version before JavaScript finishes loading.

## Publishing

The site is a static GitHub Pages project published from `main` and `/(root)`.

`updates.json` should continue to be managed by the Release Manager rather than manually overwritten during ordinary website edits.

© 2026 ValoCookie. All rights reserved.
