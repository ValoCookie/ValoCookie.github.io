const projects = [
  {
    key: "osuRequests",
    repo: "ValoCookie/osu-Requests",
    defaultVersion: "1.2.6",
    statusIds: ["osu-status", "osu-status-detail"],
    buttonIds: ["osu-download", "osu-download-detail"],
    fallback: "https://github.com/ValoCookie/osu-Requests/releases"
  },
  {
    key: "streamFlight",
    repo: "ValoCookie/streamflight",
    defaultVersion: "1.1.0",
    statusIds: ["flight-status", "flight-status-detail"],
    buttonIds: ["flight-download", "flight-download-detail"],
    fallback: "https://github.com/ValoCookie/streamflight/releases"
  },
];

function preferredAsset(release) {
  if (!release?.assets?.length) return null;
  const files = release.assets.filter((asset) => !/checksum|sha256/i.test(asset.name));
  return (
    files.find((asset) => /setup.*\.exe$/i.test(asset.name)) ||
    files.find((asset) => /installer.*\.exe$/i.test(asset.name)) ||
    files.find((asset) => /\.exe$/i.test(asset.name)) ||
    files.find((asset) => /\.zip$/i.test(asset.name)) ||
    null
  );
}

function normalizeVersion(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^version\s*/i, "")
    .replace(/^v/, "");
}

function withV(value) {
  const clean = normalizeVersion(value);
  return clean ? `v${clean}` : "";
}

function setText(ids, text) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

function setButtons(ids, text, href) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.href = href;
  });
}

async function fetchManifest() {
  try {
    const response = await fetch(`/updates.json?_=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Manifest ${response.status}`);
    const manifest = await response.json();
    return manifest?.apps || {};
  } catch (_error) {
    return {};
  }
}

async function hydrateRelease(project, manifestApps) {
  const manifestEntry = manifestApps[project.key] || {};
  const version = normalizeVersion(manifestEntry.version || project.defaultVersion);
  const displayVersion = withV(version);
  const releaseUrl = manifestEntry.release_url || project.fallback;
  const manifestDownload = manifestEntry.download_url || "";

  setText(project.statusIds, `Current build ${displayVersion}`);

  // The Release Manager writes a direct asset URL only after the upload
  // succeeds. When present, this is the fastest and most reliable path.
  if (manifestDownload && manifestDownload !== releaseUrl) {
    setButtons(project.buttonIds, `Download ${displayVersion}`, manifestDownload);
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${project.repo}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const release = await response.json();
    const releaseVersion = release.tag_name || release.name || "";
    const asset = preferredAsset(release);

    if (normalizeVersion(releaseVersion) === version && asset) {
      setButtons(project.buttonIds, `Download ${displayVersion}`, asset.browser_download_url);
      return;
    }
  } catch (_error) {
    // Fall through to the official release page.
  }

  setButtons(project.buttonIds, `Get ${displayVersion}`, releaseUrl || project.fallback);
}

(async function hydrateSite() {
  const manifestApps = await fetchManifest();
  projects.forEach((project) => hydrateRelease(project, manifestApps));
})();

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
