import { state } from './state.js';
import { computeOpenFolders } from './folderLogic.js';
import { renderArrayOfTrees } from './domRenderers.js';
import { addEventListener_Counter } from './eventCounters.js';

export function setupFilters() {
  document.querySelectorAll('.header-nav-folder-filter-label input[type="checkbox"]').forEach(box => {
    addEventListener_Counter('checkBox clicks', box, 'change', function(e) {
      const val = e.target.value;
      if (e.target.checked) state.selectedFilters.add(val);
      else state.selectedFilters.delete(val);
      const result = computeOpenFolders(state.arrayOfTrees, state.openPathFolders, state.openPaths, state.selectedFilters);
      state.openFolders = result.openFolders;
      renderArrayOfTrees();
    });
  });
}