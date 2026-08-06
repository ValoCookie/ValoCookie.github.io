"use strict";

const projects = [
  {
    repo: "ValoCookie/osu-Requests",
    currentVersion: "v1.4.2",
    statusIds: ["osu-status", "osu-status-detail"],
    buttonIds: ["osu-download", "osu-download-detail"],
    fallback: "https://github.com/ValoCookie/osu-Requests/releases"
  },
  {
    repo: "ValoCookie/streamflight",
    currentVersion: "v1.1.1",
    statusIds: ["flight-status", "flight-status-detail"],
    buttonIds: ["flight-download", "flight-download-detail"],
    fallback: "https://github.com/ValoCookie/streamflight/releases"
  }
];

function normalizeVersion(value) {
  return String(value || "").trim().toLowerCase().replace(/^version\s*/i, "").replace(/^v/, "");
}

function preferredAsset(release) {
  if (!Array.isArray(release?.assets)) return null;
  const files = release.assets.filter((asset) => asset?.name && !/checksum|sha256/i.test(asset.name));
  return files.find((asset) => /setup.*\.exe$/i.test(asset.name))
    || files.find((asset) => /installer.*\.exe$/i.test(asset.name))
    || files.find((asset) => /\.exe$/i.test(asset.name))
    || files.find((asset) => /\.zip$/i.test(asset.name))
    || null;
}

function setText(ids, text) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  }
}

function setButtons(ids, text, href) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element) continue;
    element.textContent = text;
    element.href = href;
  }
}

async function hydrateRelease(project) {
  setText(project.statusIds, `Latest release: ${project.currentVersion}`);
  setButtons(project.buttonIds, `Get ${project.currentVersion}`, project.fallback);

  try {
    const response = await fetch(`https://api.github.com/repos/${project.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) return;

    const release = await response.json();
    const releaseVersion = release.tag_name || release.name || "";
    const asset = preferredAsset(release);

    if (normalizeVersion(releaseVersion) === normalizeVersion(project.currentVersion) && asset?.browser_download_url) {
      setButtons(project.buttonIds, `Download ${project.currentVersion}`, asset.browser_download_url);
    }
  } catch {
    // The release-page fallback remains usable when the GitHub API is unavailable or rate-limited.
  }
}

for (const project of projects) hydrateRelease(project);
for (const element of document.querySelectorAll("[data-year]")) element.textContent = new Date().getFullYear();
