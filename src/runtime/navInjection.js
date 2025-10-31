import { setupFilters } from './filterLogic.js';
import { renderEntireDOM } from './domRenderers.js';
import { bindFolders } from './bindFolders.js';
import { addEventListener_Counter } from './eventCounters.js';
import { state } from './state.js';
import { buildAllTrees } from '../build/treeBuilder.js';
import { renderMenu } from '../build/menuRenderer.js';
import customMenus from '../data/customMenus.js';

/**
 * Injects header/logo, arrow, filters, and menus into the DOM.
 * This function assumes the HTML container '.header-title-nav-wrapper .header-nav .header-nav-list' exists.
 */
export function injectNavCustomizations() {
  const headerNav = document.querySelector('.header-title-nav-wrapper .header-nav');
  if (!headerNav) {
    console.warn('[WARN] headerNav NOT FOUND, aborting injectNavCustomizations');
    return;
  }

  // Remove existing header if present
  const existingHeader = headerNav.querySelector('.navbar-header-row');
  if (existingHeader) existingHeader.remove();

  // Logo + arrow bar
  const logoBar = document.createElement('div');
  logoBar.className = 'navbar-header-row';
  logoBar.innerHTML = `
    <div class="navbar-logo-wrapper" style="flex:3 0 0%;">
      <a href="/" class="navbar-logo">
        <img src="https://static1.squarespace.com/static/689a5d913b853134341cd774/t/68af8e19e0957f15815f2014/1756335641147/logo+2.png" alt="Logo">
      </a>
    </div>
    <div class="navbar-arrow-wrapper" style="flex:1 0 0%; display:flex; align-items:center; justify-content:center;">
      <svg class="nav-arrow" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </div>
  `;
  headerNav.insertBefore(logoBar, headerNav.firstChild);

  const arrowWrapper = logoBar.querySelector('.navbar-arrow-wrapper');
  const arrowIcon = logoBar.querySelector('.nav-arrow');
  let navIsRetracted = headerNav.classList.contains('retracted');

  addEventListener_Counter('navBar retractArrow', arrowWrapper, 'click', function(e) {
    navIsRetracted = !navIsRetracted;
    headerNav.classList.toggle('retracted', navIsRetracted);
    arrowIcon.classList.toggle('flipped', navIsRetracted);
  });

  // Insert filter folder
  const filterFolder = document.createElement('li');
  filterFolder.className = 'header-nav-item header-nav-item--folder custom-folder';
  filterFolder.classList.add('no-sibling-close');
  filterFolder.id = 'blue-dog-filter-folder';
  filterFolder.innerHTML = `
    <div class="header-nav-folder-title" aria-controls="blue-dog-filter-folder-content" aria-expanded="false">Search filters</div>
    <div class="header-nav-folder-content" id="blue-dog-filter-folder-content">
      <ul class="header-nav-folder-filters">
        <li>
          <label class="header-nav-folder-filter-label">
            <input type="checkbox" class="animated-filter-checkbox" name="filter-incumbents" value="BDI" checked />
            <span>Blue Dog incumbents</span>
          </label>
        </li>
        <li>
          <label class="header-nav-folder-filter-label">
            <input type="checkbox" class="animated-filter-checkbox" name="filter-challengers" value="B" />
            <span>Blue Dog challengers</span>
          </label>
        </li>
        <li>
          <label class="header-nav-folder-filter-label">
            <input type="checkbox" class="animated-filter-checkbox" name="filter-republican-incumbents" value="R" />
            <span>Republican incumbents</span>
          </label>
        </li>
        <li>
          <label class="header-nav-folder-filter-label">
            <input type="checkbox" class="animated-filter-checkbox" name="filter-democratic-incumbents" value="D" checked/>
            <span>Democratic incumbents</span>
          </label>
        </li>
      </ul>
    </div>
  `;

  const navList = document.querySelector('.header-title-nav-wrapper .header-nav-list');
  if (navList) {
    navList.insertBefore(filterFolder, navList.children[2] || null);
  }

  // Build menus from data and inject
  state.arrayOfTrees = buildAllTrees(customMenus);
  if (Array.isArray(state.arrayOfTrees) && state.arrayOfTrees.length) {
    const navSelector = '.header-nav-list';
    const menuPositions = state.arrayOfTrees.map(menu => ({
      menu,
      insertBeforeSelector: '.header-nav-item:nth-child(4)'
    }));
    menuPositions.slice().reverse().forEach(({menu, insertBeforeSelector}) => {
      const html = renderMenu(menu.items, 0);
      const temp = document.createElement('div');
      temp.innerHTML = `
        <div class="header-nav-item header-nav-item--folder custom-folder">
          <a class="header-nav-folder-title" href="#" aria-expanded="false" aria-controls="${menu.id}">
            <span class="header-nav-folder-title-text">${menu.label}</span>
          </a>
          <div class="header-nav-folder-content" id="${menu.id}">
            ${html}
          </div>
        </div>
      `;
      const container = document.querySelector(navSelector);
      if (container) {
        const refNode = insertBeforeSelector ? container.querySelector(insertBeforeSelector) : null;
        Array.from(temp.children).forEach(child => container.insertBefore(child, refNode || null));
      }
    });
  }

  // initialize displays
  document.querySelectorAll('.header-nav-folder-content, .header-nav-folder-item').forEach(node => {
    node.style.display = 'none';
  });

  // Attach resize/transition handlers for navbar
  const navBar = document.querySelector('.header-title-nav-wrapper .header-nav');
  if (navBar) {
    addEventListener_Counter('mainBodyWidthReponder', navBar, 'transitionend', function(e) {
      if (e.propertyName === 'width') {
        // placeholder
      }
    });
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // placeholder: update body margin if needed
      }
    });
    resizeObserver.observe(navBar);
  }

  // Init filters and bindings
  setupFilters();
}

export function initializeNavCustomizations() {
  injectNavCustomizations();
  renderEntireDOM();
  bindFolders();
}