const projects = [
  {
    repo: "ValoCookie/osu-Requests",
    statusId: "osu-status",
    buttonId: "osu-download",
    fallback: "https://github.com/ValoCookie/osu-Requests/releases",
  },
  {
    repo: "ValoCookie/streamflight",
    statusId: "flight-status",
    buttonId: "flight-download",
    fallback: "https://github.com/ValoCookie/streamflight/releases",
  },
];

function preferredAsset(release) {
  if (!release?.assets?.length) return null;
  const files = release.assets.filter((asset) => !asset.name.toLowerCase().includes("checksum"));
  return (
    files.find((asset) => /setup.*\.exe$/i.test(asset.name)) ||
    files.find((asset) => /installer.*\.exe$/i.test(asset.name)) ||
    files.find((asset) => /\.exe$/i.test(asset.name)) ||
    files.find((asset) => /\.zip$/i.test(asset.name)) ||
    null
  );
}

async function hydrateRelease(project) {
  const status = document.getElementById(project.statusId);
  const button = document.getElementById(project.buttonId);

  try {
    const response = await fetch(`https://api.github.com/repos/${project.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);

    const release = await response.json();
    const asset = preferredAsset(release);
    const version = release.tag_name || release.name || "Latest release";

    status.textContent = version;
    button.textContent = asset ? `Download ${version}` : `View ${version}`;
    button.href = asset?.browser_download_url || release.html_url || project.fallback;
  } catch (error) {
    status.textContent = "GitHub releases";
    button.textContent = "View releases";
    button.href = project.fallback;
  }
}

projects.forEach(hydrateRelease);
