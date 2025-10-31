import './styles/navbar.css';
import { initializeNavCustomizations } from './runtime/navInjection.js';
import { logAllListenerCounts } from './runtime/eventCounters.js';
import { state } from './runtime/state.js';
import { renderEntireDOM } from './runtime/domRenderers.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeNavCustomizations();
  logAllListenerCounts();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.openFolders.size > 0) {
    state.openFolders.clear();
    renderEntireDOM();
  }
});