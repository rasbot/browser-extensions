const label = document.getElementById("direction-label");
const btn = document.getElementById("toggle-btn");
const enabledToggle = document.getElementById("enabled-toggle");
const enabledLabel = document.getElementById("enabled-label");

const labels = {
  "en|sv": "English → Swedish",
  "sv|en": "Swedish → English"
};

const ICONS = {
  "en|sv": { 16: "icons/icon16_ensv.png", 48: "icons/icon48_ensv.png", 128: "icons/icon128_ensv.png" },
  "sv|en": { 16: "icons/icon16_sven.png", 48: "icons/icon48_sven.png", 128: "icons/icon128_sven.png" },
  off:     { 16: "icons/icon16_off.png",   48: "icons/icon48_off.png",   128: "icons/icon128_off.png" }
};

let currentEnabled = true;
let currentDir = "en|sv";

function updateIcon() {
  chrome.action.setIcon({ path: currentEnabled ? ICONS[currentDir] : ICONS.off });
}

function updateEnabledUI(enabled) {
  currentEnabled = enabled;
  enabledToggle.checked = enabled;
  enabledLabel.textContent = enabled ? "ON" : "OFF";
  updateIcon();
}

chrome.storage.local.get(["direction", "enabled"], ({ direction, enabled }) => {
  currentDir = direction || "en|sv";
  if (enabled === undefined) enabled = true;
  label.textContent = labels[currentDir];
  updateEnabledUI(enabled);
});

enabledToggle.addEventListener("change", () => {
  const enabled = enabledToggle.checked;
  chrome.storage.local.set({ enabled }, () => {
    updateEnabledUI(enabled);
  });
});

btn.addEventListener("click", () => {
  chrome.storage.local.get("direction", ({ direction }) => {
    const next = direction === "en|sv" ? "sv|en" : "en|sv";
    currentDir = next;
    chrome.storage.local.set({ direction: next }, () => {
      label.textContent = labels[next];
      updateIcon();
    });
  });
});
