chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ direction: "en|sv" });
});
