import { state } from './state.js';
import { getPathToRoot, getFolderId, arraysEqual, isPrefix } from './folderUtils.js';
import { computeOpenFolders, closeFolderWithTruncation, calculateRetainedPathFolders } from './folderLogic.js';
import { renderFolder, renderArrayOfTrees } from './domRenderers.js';
import { addEventListener_Counter, removeEventListener_Counter, logAllListenerCounts } from './eventCounters.js';

export function bindFolders() {
  let lastToggledFolder = null;
  document.querySelectorAll('.header-nav-item--folder').forEach(folder => {

    // Filter-folder isolation
    if (folder.classList.contains('no-sibling-close')) {
      const filterTitle = folder.querySelector('.header-nav-folder-title');
      const content = folder.querySelector('.header-nav-folder-content');
      if (!filterTitle || !content) return;
      content.style.display = 'none';
      content.style.maxHeight = '0';
      content.style.overflow = 'hidden';
      content.style.padding = '0';

      addEventListener_Counter('filterFolderPanel', filterTitle, 'click', function(e) {
        e.stopPropagation();
        const isOpen = folder.classList.toggle('folder-open');
        filterTitle.setAttribute('aria-expanded', isOpen);
        content.style.display = 'block';
        if (isOpen) {
          void content.offsetHeight;
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.pointerEvents = 'auto';
          content.style.padding = '0.5em 1em';
          content.style.backgroundColor = 'var(--siteBackgroundColor)';
          setTimeout(() => { renderArrayOfTrees(); }, 350);
        } else {
          content.style.maxHeight = '0';
          content.style.pointerEvents = 'none';
          content.style.padding = '0';
          content.style.backgroundColor = 'transparent';
          function filterFolderHandler(e) {
            if (e.propertyName === 'max-height') {
              content.style.display = 'none';
              removeEventListener_Counter('filterFolder', content, 'transitionend', filterFolderHandler);
            }
          }
          addEventListener_Counter('filterFolder', content, 'transitionend', filterFolderHandler);
        }
      });
      return;
    }

    const title = folder.querySelector('.header-nav-folder-title');
    const content = folder.querySelector('.header-nav-folder-content');
    const folderId = content ? content.id : null;
    if (!title || !content) return;
    let isAnimating = false;

    function onTransitionEnd(event) {
      if (event.propertyName === 'max-height') {
        isAnimating = false;
      }
    }
    addEventListener_Counter('navBar clicks', content, 'transitionend', onTransitionEnd);

    title.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      if (isAnimating) return;
      isAnimating = true;

      const path = getPathToRoot(folder);
      const isOpen = state.openFolders.has(folderId);

      if (!folderId) {
        isAnimating = false;
        return;
      }

      if (isOpen) {
        state.openPaths = closeFolderWithTruncation(state.openPaths, path);
      } else {
        const collector = calculateRetainedPathFolders(state.openPaths, path, folderId);
        state.openPaths = normalizePaths(collector.newRetainedPaths);
      }

      state.openPathFolders.clear();
      state.openPaths.forEach(pathArr => pathArr.forEach(id => state.openPathFolders.add(id)));
      const result = computeOpenFolders(state.arrayOfTrees, state.openPathFolders, state.openPaths, state.selectedFilters);
      state.openFolders = result.openFolders;

      if (state.openFolders.size === 0 && folderId) {
        const contentEl = document.getElementById(folderId);
        const folderEl = contentEl ? contentEl.parentElement : null;
        if (folderEl) renderFolder(folderEl);
      } else {
        renderArrayOfTrees();
      }

      // Close past trees if necessary (dom-level)
      // This was done in original via closeOpenTrees; simplified here and can be enhanced later.
      logAllListenerCounts();

      setTimeout(() => { isAnimating = false; }, 350);
    };
  });
}

function normalizePaths(paths) {
  // Remove strict-prefix paths (same behavior as normalizeOpenPaths)
  return paths.filter((path, idx, arr) =>
    !arr.some((other, jdx) =>
      jdx !== idx &&
      other.length > path.length &&
      other.slice(0, path.length).every((id, i) => id === path[i])
    )
  );
}