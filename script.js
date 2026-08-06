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

async function hydrateRelease(project) {
  // Always show the actual current development version on the website.
  setText(project.statusIds, `Latest release: ${project.currentVersion}`);

  try {
    const response = await fetch(
      `https://api.github.com/repos/${project.repo}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } }
    );

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const release = await response.json();
    const releaseVersion = release.tag_name || release.name || "";
    const asset = preferredAsset(release);

    // Only label the button as a direct download when GitHub's latest
    // published Release matches the version advertised by the site.
    if (
      normalizeVersion(releaseVersion) === normalizeVersion(project.currentVersion) &&
      asset
    ) {
      setButtons(
        project.buttonIds,
        `Download ${project.currentVersion}`,
        asset.browser_download_url
      );
      return;
    }

    // The source/build may be newer than the latest formal GitHub Release.
    // Avoid sending visitors to an old build while calling it "current".
    setButtons(project.buttonIds, `Get ${project.currentVersion}`, project.fallback);
  } catch (error) {
    setButtons(project.buttonIds, `Get ${project.currentVersion}`, project.fallback);
  }
}

projects.forEach(hydrateRelease);

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
