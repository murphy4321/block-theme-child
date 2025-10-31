export function getFolderId(folder) {
  const controls = folder?.querySelector('.header-nav-folder-title')?.getAttribute('aria-controls');
  if (controls) return controls;
  if (!folder.dataset.accordionId) {
    folder.dataset.accordionId = 'folder-' + Math.random().toString(36).substr(2,9);
  }
  return folder.dataset.accordionId;
}

export function getParentFolder(folder) {
  return folder.parentElement?.closest('.header-nav-item--folder') || null;
}

export function getParentFolderId(folder) {
  const parent = getParentFolder(folder);
  return parent ? getFolderId(parent) : null;
}

export function getPathToRoot(folder) {
  const path = [];
  let current = folder;
  while (current) {
    path.unshift(getFolderId(current));
    current = getParentFolder(current);
  }
  return path;
}

export function isPrefix(prefix, arr) {
  if (!prefix || !arr) return false;
  if (prefix.length > arr.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== arr[i]) return false;
  }
  return true;
}

export function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function normalizeOpenPaths(paths) {
  // Remove paths that are strict prefixes of other paths
  return paths.filter((path, idx, arr) =>
    !arr.some((other, jdx) =>
      jdx !== idx &&
      other.length > path.length &&
      other.slice(0, path.length).every((id, i) => id === path[i])
    )
  );
}