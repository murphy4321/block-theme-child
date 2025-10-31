import { arraysEqual, isPrefix, normalizeOpenPaths } from './folderUtils.js';
import { state } from './state.js';

/**
 * computeOpenFolders - given the model and current openPaths, compute
 * which folders should be open (respecting selectedFilters)
 */
export function computeOpenFolders(arrayOfTrees, openPathFolders, openPaths, selectedFilters) {
  const rejectedFilterFolders = new Set();

  function walk(folder) {
    if (!folder) return false;
    if (folder.items && folder.items.some(item => selectedFilters.has(item.filter))) {
      return true;
    }
    if (!folder.items || folder.items.length === 0) {
      return folder.filter && selectedFilters.has(folder.filter);
    }
    let hasEligibleItem = false;
    for (const item of folder.items) {
      if (walk(item)) hasEligibleItem = true;
    }
    if (!hasEligibleItem) rejectedFilterFolders.add(folder.id);
    return hasEligibleItem;
  }

  const rootIds = openPaths.filter(pathArr => pathArr.length > 0).map(pathArr => pathArr[0]);
  const uniqueRootIds = new Set(rootIds);

  for (const rootId of uniqueRootIds) {
    const rootFolder = arrayOfTrees.find(folder => folder.id === rootId);
    if (rootFolder) walk(rootFolder);
  }

  const openFolders = new Set([...openPathFolders].filter(id => !rejectedFilterFolders.has(id)));
  return { openFolders, uniqueRootIds };
}

/**
 * Remove a path and its descendants; if no sibling exists, keep a truncated parent path.
 */
export function closeFolderWithTruncation(openPaths, path) {
  const parentPath = path.slice(0, -1);

  const hasSibling = openPaths.some(other =>
    other.length === path.length &&
    arraysEqual(other.slice(0, -1), parentPath) &&
    other[path.length - 1] !== path[path.length - 1]
  );

  let newRetainedPaths = openPaths.filter(p => {
    if (p.length > path.length && isPrefix(path, p)) return false;
    if (arraysEqual(p, path)) return false;
    return true;
  });

  if (!hasSibling && parentPath.length > 0) {
    const alreadyHasParent = newRetainedPaths.some(p => arraysEqual(p, parentPath));
    if (!alreadyHasParent) newRetainedPaths.push(parentPath);
  }
  return newRetainedPaths;
}

/**
 * Collect retained paths (siblings under same root and other roots with depth > x)
 */
export function calculateRetainedPathFolders(openPaths, toggledPath, folderId, x = 1, y = 0) {
  const siblingsToRetain = retainRootSiblingPaths(openPaths, toggledPath, folderId, y);
  const otherRootsToRetain = retainOtherRootPaths(openPaths, toggledPath, x);
  const newRetainedPaths = [
    ...siblingsToRetain,
    ...otherRootsToRetain,
    toggledPath.slice()
  ];
  const retainedPathFolders = new Set();
  newRetainedPaths.forEach(path => path.forEach(id => retainedPathFolders.add(id)));
  return { newRetainedPaths, retainedPathFolders };
}

export function retainRootSiblingPaths(openPaths, toggledPath, folderId, y = 0) {
  const navRootId = toggledPath[0];
  return openPaths.filter(path => {
    if (path[0] !== navRootId) return false;
    if (arraysEqual(path, toggledPath)) return false;

    let divergeIndex = 1;
    while (
      divergeIndex < toggledPath.length &&
      divergeIndex < path.length &&
      toggledPath[divergeIndex] === path[divergeIndex]
    ) {
      divergeIndex++;
    }
    if (divergeIndex >= toggledPath.length || divergeIndex >= path.length) return false;
    const edgesFromSiblingToLeaf = path.length - (divergeIndex + 1);
    return edgesFromSiblingToLeaf > y;
  });
}

export function retainOtherRootPaths(openPaths, toggledPath, x = 1) {
  const toggledRootId = toggledPath[0];
  return openPaths.filter(path =>
    path[0] !== toggledRootId && (path.length - 1) > x
  );
}