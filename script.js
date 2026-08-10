"use strict";

const projects = [
  {
    key: "osuRequests",
    repo: "ValoCookie/osu-Requests",
    exactAsset: /^(?:osuStreamDeck|OsuRequests)\.exe$/i,
    statusIds: ["osu-status", "osu-status-detail"],
    buttonIds: ["osu-download", "osu-download-detail"],
    fallback: "https://github.com/ValoCookie/osu-Requests/releases"
  },
  {
    key: "streamFlight",
    repo: "ValoCookie/streamflight",
    exactAsset: /^StreamPreflight\.exe$/i,
    statusIds: ["flight-status", "flight-status-detail"],
    buttonIds: ["flight-download", "flight-download-detail"],
    fallback: "https://github.com/ValoCookie/streamflight/releases"
  }
];

function normalizeVersion(value) {
  return String(value || "").trim().replace(/^version\s*/i, "").replace(/^v/i, "");
}

function versionParts(value) {
  const match = normalizeVersion(value).match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return [Number(match[1] || 0), Number(match[2] || 0), Number(match[3] || 0)];
}

function compareVersions(a, b) {
  const av = versionParts(a);
  const bv = versionParts(b);
  if (!av && !bv) return 0;
  if (!av) return -1;
  if (!bv) return 1;
  for (let i = 0; i < 3; i += 1) {
    if (av[i] !== bv[i]) return av[i] > bv[i] ? 1 : -1;
  }
  return 0;
}

function displayVersion(value) {
  const normalized = normalizeVersion(value);
  return normalized ? `v${normalized}` : "";
}

function preferredAsset(project, release) {
  if (!Array.isArray(release?.assets)) return null;
  const files = release.assets.filter((asset) => asset?.name && !/checksum|sha256/i.test(asset.name));
  return files.find((asset) => project.exactAsset.test(asset.name))
    || files.find((asset) => /\.exe$/i.test(asset.name) && !/(?:setup|installer)/i.test(asset.name))
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

function renderProject(project, info) {
  const version = displayVersion(info?.version);
  if (!version) {
    setText(project.statusIds, "Latest release");
    setButtons(project.buttonIds, "Open releases", project.fallback);
    return;
  }

  setText(project.statusIds, `Latest release: ${version}`);
  setButtons(
    project.buttonIds,
    `Download ${version}`,
    info.downloadUrl || info.releaseUrl || project.fallback
  );
}

async function loadManifest() {
  try {
    const response = await fetch(`/updates.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return {};
    const data = await response.json();
    return data?.apps || {};
  } catch {
    return {};
  }
}

async function loadGitHubRelease(project) {
  try {
    const response = await fetch(`https://api.github.com/repos/${project.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) return null;

    const release = await response.json();
    const asset = preferredAsset(project, release);
    return {
      version: release.tag_name || release.name || "",
      releaseUrl: release.html_url || project.fallback,
      downloadUrl: asset?.browser_download_url || release.html_url || project.fallback
    };
  } catch {
    return null;
  }
}

function manifestInfo(project, apps) {
  const app = apps?.[project.key];
  if (!app) return null;
  return {
    version: app.version || "",
    releaseUrl: app.release_url || project.fallback,
    downloadUrl: app.download_url || app.release_url || project.fallback
  };
}

async function hydrateProject(project, apps) {
  const manifest = manifestInfo(project, apps);
  const github = await loadGitHubRelease(project);

  let chosen = manifest || github;
  if (manifest && github && compareVersions(github.version, manifest.version) > 0) {
    chosen = github;
  }

  renderProject(project, chosen);
}

(async () => {
  const apps = await loadManifest();
  await Promise.all(projects.map((project) => hydrateProject(project, apps)));
})();

for (const element of document.querySelectorAll("[data-year]")) {
  element.textContent = new Date().getFullYear();
}
