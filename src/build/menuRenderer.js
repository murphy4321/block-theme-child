import { filterToSVG } from '../runtime/domRenderers.js';

export function renderMenu(items, level = 0) {
  if (!items || !items.length) return '';
  let html = '';
  items.forEach((item) => {
    if (item.items && item.items.length) {
      html += `
        <div class="header-nav-item header-nav-item--folder custom-folder">
          <a class="header-nav-folder-title" href="#" aria-expanded="false" aria-controls="${item.id}">
            <span class="header-nav-folder-title-text">${item.label}</span>
            ${level === 0 ? `<span class="header-nav-folder-leafcount">(${item.leafCount})</span>` : ""}
          </a>
          <div class="header-nav-folder-content" id="${item.id}">
            ${renderMenu(item.items, level + 1)}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="header-nav-folder-item" data-filter="${item.filter || ''}">
          <a href="${item.primary_url || '#'}">
            <span class="header-nav-folder-item-content">
              ${filterToSVG(item.filter)}
              ${item.label}
              ${item.incumbent === "TRUE" ? `<span style="font-size:0.85em;color:black;vertical-align:super;margin-left:3px;">★</span>` : ''}
            </span>
          </a>
        </div>
      `;
    }
  });
  return html;
}