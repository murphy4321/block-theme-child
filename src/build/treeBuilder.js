export function buildOneTree(region) {
  function buildOneFolder(items, level = 0, parentId = region.label) {
    return items.map((item, index) => {
      const uniqueId = `${parentId}-${level+1}-${index}`;
      const childItems = item.items ? buildOneFolder(item.items, level + 1, uniqueId) : [];
      const leafCount = childItems.length
        ? childItems.reduce((sum, child) => sum + child.leafCount, 0)
        : 1;
      return {
        id: uniqueId,
        label: item.label,
        filter: item.filter || null,
        incumbent: item.incumbent || null,
        primary_url: item.primary_url || null,
        secondary_url: item.secondary_url || null,
        items: childItems,
        leafCount
      };
    });
  }
  return {
    id: region.label,
    label: region.label,
    items: buildOneFolder(region.items || [], 0, region.label)
  };
}

export function buildAllTrees(customMenus) {
  if (!Array.isArray(customMenus)) return [];
  return customMenus.map(region => buildOneTree(region));
}