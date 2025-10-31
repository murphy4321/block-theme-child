export const listenerCounters = {};

/**
 * Safe wrapper to add event listeners and count them for debugging.
 * label: string identifier for this listener group
 */
export function addEventListener_Counter(label, target, eventType, handler, options) {
  if (!target || !target.addEventListener) {
    console.warn(`[Listener] Tried to attach ${label} to null target.`);
    return;
  }
  target.addEventListener(eventType, handler, options);
  listenerCounters[label] = (listenerCounters[label] || 0) + 1;
}

export function removeEventListener_Counter(label, target, eventType, handler) {
  if (!target || !target.removeEventListener) return;
  target.removeEventListener(eventType, handler);
  listenerCounters[label] = Math.max(0, (listenerCounters[label] || 1) - 1);
}

export function logAllListenerCounts() {
  console.log('--- Listener Attachments Summary ---');
  Object.entries(listenerCounters).forEach(([label, count]) => {
    console.log(`${label}: ${count}`);
  });
}