const ICONS = {
  "en|sv": { 16: "icons/icon16_ensv.png", 48: "icons/icon48_ensv.png", 128: "icons/icon128_ensv.png" },
  "sv|en": { 16: "icons/icon16_sven.png", 48: "icons/icon48_sven.png", 128: "icons/icon128_sven.png" },
  off:     { 16: "icons/icon16_off.png",   48: "icons/icon48_off.png",   128: "icons/icon128_off.png" }
};

function setIcon(enabled, direction) {
  chrome.action.setIcon({ path: enabled ? ICONS[direction] : ICONS.off });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ direction: "en|sv", enabled: true });
});

// Restore icon state on service worker startup
chrome.storage.local.get(["enabled", "direction"], ({ enabled, direction }) => {
  setIcon(enabled !== false, direction || "en|sv");
});
