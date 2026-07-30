const projects = [
  { repo: "ValoCookie/osu-Requests", statusIds: ["osu-status", "osu-status-detail"], buttonIds: ["osu-download", "osu-download-detail"], fallback: "https://github.com/ValoCookie/osu-Requests/releases" },
  { repo: "ValoCookie/streamflight", statusIds: ["flight-status", "flight-status-detail"], buttonIds: ["flight-download", "flight-download-detail"], fallback: "https://github.com/ValoCookie/streamflight/releases" },
];
function preferredAsset(release) {
  if (!release?.assets?.length) return null;
  const files = release.assets.filter((asset) => !/checksum|sha256/i.test(asset.name));
  return files.find((asset) => /setup.*\.exe$/i.test(asset.name)) || files.find((asset) => /installer.*\.exe$/i.test(asset.name)) || files.find((asset) => /\.exe$/i.test(asset.name)) || files.find((asset) => /\.zip$/i.test(asset.name)) || null;
}
function setText(ids, text) { ids.forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = text; }); }
function setButtons(ids, text, href) { ids.forEach((id) => { const el = document.getElementById(id); if (!el) return; el.textContent = text; el.href = href; }); }
async function hydrateRelease(project) {
  try {
    const response = await fetch(`https://api.github.com/repos/${project.repo}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const release = await response.json();
    const asset = preferredAsset(release);
    const version = release.tag_name || release.name || "Latest release";
    const href = asset?.browser_download_url || release.html_url || project.fallback;
    setText(project.statusIds, version);
    setButtons(project.buttonIds, asset ? `Download ${version}` : `View ${version}`, href);
  } catch (error) {
    setText(project.statusIds, "GitHub releases");
    setButtons(project.buttonIds, "View releases", project.fallback);
  }
}
projects.forEach(hydrateRelease);
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
