import { state } from './state.js';
import { addEventListener_Counter, removeEventListener_Counter } from './eventCounters.js';

/* SVG render for filter badges */
export function filterToSVG(filter) {
  if (!filter) return '';
  if (filter === 'BDI') {
    return `<svg width="30" height="30" viewBox="0 0 30 30" style="vertical-align:-5px; margin-right:6px;"><rect x="3" y="3" width="24" height="24" rx="0" fill="#FFA756"/><text x="15" y="22" text-anchor="middle" font-size="18" fill="white" font-family="sans-serif" font-weight="900">B</text></svg>`;
  }
  if (filter === 'R') {
    return `<svg width="30" height="30" viewBox="0 0 30 30" style="vertical-align:-5px; margin-right:6px;"><rect x="3" y="3" width="24" height="24" rx="0" fill="#D90012"/><text x="15" y="22" text-anchor="middle" font-size="18" fill="white" font-family="sans-serif" font-weight="900">R</text></svg>`;
  }
  if (filter === 'D') {
    return `<svg width="30" height="30" viewBox="0 0 30 30" style="vertical-align:-5px; margin-right:6px;"><rect x="3" y="3" width="24" height="24" rx="0" fill="#0015BC"/><text x="15" y="22" text-anchor="middle" font-size="18" fill="white" font-family="sans-serif" font-weight="900">D</text></svg>`;
  }
  return '';
}

export function verticallyAlignFilteredInContent() {
  document.querySelectorAll('.header-nav-folder-item.candidate-filtered-in .header-nav-folder-item-content').forEach(content => {
    const parent = content.parentElement;
    parent.style.display = 'flex';
    parent.style.flexDirection = 'column';
    parent.style.justifyContent = 'center';
    parent.style.height = '100%';
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.justifyContent = 'flex-start';
    content.style.height = '100%';
    content.style.width = '100%';
  });
}

export function renderLeafCandidates(folder) {
  if (!folder) return;
  const contentElem = folder.querySelector('.header-nav-folder-content');
  if (!contentElem) return;
  const isLeafFolder = !contentElem.querySelector('.header-nav-item--folder');
  if (!isLeafFolder) return;
  const itemNodes = Array.from(contentElem.querySelectorAll('.header-nav-folder-item'));
  itemNodes.forEach(itemNode => {
    const filter = itemNode.dataset.filter;
    if (!filter) {
      itemNode.classList.remove('candidate-filtered-in','candidate-filtered-out');
      itemNode.style.display = '';
      return;
    }
    if (state.selectedFilters.has(filter)) {
      itemNode.classList.add('candidate-filtered-in');
      itemNode.classList.remove('candidate-filtered-out');
      itemNode.style.display = '';
    } else {
      itemNode.classList.add('candidate-filtered-out');
      itemNode.classList.remove('candidate-filtered-in');
      itemNode.style.display = 'none';
    }
    verticallyAlignFilteredInContent();
  });
}

export function renderFolder(folder) {
  if (!folder) return;
  const id = getFolderIdFromDOM(folder);
  const isOpen = state.openFolders.has(id);
  const content = folder.querySelector('.header-nav-folder-content');
  const title = folder.querySelector('.header-nav-folder-title');

  if (isOpen) {
    folder.classList.add('folder-open');
    if (content) {
      content.style.display = 'block';
      content.style.pointerEvents = 'auto';
      content.style.padding = '0.5em 0';
      content.style.backgroundColor = 'var(--siteBackgroundColor)';
      content.style.overflow = 'hidden';
      content.style.maxHeight = '0px';
      void content.offsetHeight;
      content.style.maxHeight = content.scrollHeight + 'px';
      content._closeHandlerSet = false;
    }
    if (title) title.setAttribute('aria-expanded', 'true');
  } else {
    folder.classList.remove('folder-open');
    if (content) {
      content.style.maxHeight = '0';
      content.style.pointerEvents = 'none';
      content.style.padding = '0';
      content.style.backgroundColor = 'transparent';
      content.style.overflow = 'hidden';
      if (!content._closeHandlerSet) {
        function closeHandler(e) {
          if (e.propertyName === 'max-height' && content.style.maxHeight === '0px') {
            content.style.display = 'none';
            removeEventListener_Counter('renderFolder', content, 'transitionend', closeHandler);
            content._closeHandlerSet = false;
          }
        }
        addEventListener_Counter('renderFolder', content, 'transitionend', closeHandler);
        content._closeHandlerSet = true;
      }
    }
    if (title) title.setAttribute('aria-expanded', 'false');
  }
}

function getFolderIdFromDOM(folder) {
  const title = folder.querySelector('.header-nav-folder-title');
  return title ? (title.getAttribute('aria-controls') || folder.dataset.accordionId || '') : (folder.dataset.accordionId || '');
}

export function renderArrayOfTrees() {
  const rootFolders = state.openPaths.filter(path => Array.isArray(path) && path.length > 0).map(path => path[0]);
  const uniqueRoots = Array.from(new Set(rootFolders));
  uniqueRoots.forEach(rootId => {
    const rootDom = document.getElementById(rootId);
    if (!rootDom) return;
    const contentNodes = [
      ...(rootDom.classList.contains('header-nav-folder-content') ? [rootDom] : []),
      ...rootDom.querySelectorAll('.header-nav-folder-content')
    ];
    contentNodes.forEach(contentEl => {
      const folder = contentEl.parentElement;
      renderLeafCandidates(folder);
      renderFolder(folder);
    });
  });
  updateNavBarWidth();
}

export function renderEntireDOM() {
  document.querySelectorAll('.header-nav-item--folder').forEach(folder => {
    if (folder.classList.contains('no-sibling-close')) return;
    renderLeafCandidates(folder);
    renderFolder(folder);
  });
}

export function updateBodyMargin() {
  const navBar = document.querySelector('.header-title-nav-wrapper .header-nav');
  if (navBar) {
    const width = navBar.offsetWidth;
    document.body.style.marginLeft = width + 'px';
  }
}

export function updateNavBarWidth() {
  // Placeholder: implement if needed
}