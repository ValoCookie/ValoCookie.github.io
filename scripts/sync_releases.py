#!/usr/bin/env python3
import json, re, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UPDATES = ROOT / "updates.json"
APPS = {
    "osuRequests": {
        "repo": "ValoCookie/osu-Requests",
        "assets": ["osuStreamDeck_Setup_", "osuStreamDeck.exe"],
        "display": "osu!StreamDeck",
    },
    "streamFlight": {
        "repo": "ValoCookie/streamflight",
        "assets": ["StreamPreflight_Setup_", "StreamPreflight.exe"],
        "display": "StreamFlight",
    },
}

def latest_release(repo):
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/releases/latest",
        headers={"Accept":"application/vnd.github+json","User-Agent":"ValoCookie-release-sync"},
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def version_from_tag(tag):
    tag = str(tag or "").strip()
    return tag[1:] if tag.lower().startswith("v") else tag

def sync():
    data = json.loads(UPDATES.read_text(encoding="utf-8"))
    changed = False
    for key, cfg in APPS.items():
        rel = latest_release(cfg["repo"])
        version = version_from_tag(rel.get("tag_name"))
        asset_url = None
        release_assets = rel.get("assets", [])
        for wanted in cfg["assets"]:
            wanted_lower = wanted.lower()
            for asset in release_assets:
                name = str(asset.get("name", ""))
                lower = name.lower()
                matches = lower == wanted_lower or (wanted_lower.endswith("_") and lower.startswith(wanted_lower) and lower.endswith(".exe"))
                if matches:
                    asset_url = asset.get("browser_download_url")
                    break
            if asset_url:
                break
        if not asset_url:
            asset_url = f"https://github.com/{cfg['repo']}/releases/latest"
        app = data.setdefault("apps", {}).setdefault(key, {})
        newvals = {
            "display_name": cfg["display"],
            "version": version,
            "release_url": rel.get("html_url") or f"https://github.com/{cfg['repo']}/releases/latest",
            "download_url": asset_url,
            "published_at": rel.get("published_at") or rel.get("created_at"),
        }
        for k,v in newvals.items():
            if v is not None and app.get(k) != v:
                app[k] = v; changed = True
    if changed:
        UPDATES.write_text(json.dumps(data, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    return changed

if __name__ == "__main__":
    print("changed=true" if sync() else "changed=false")
