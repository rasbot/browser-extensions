const label = document.getElementById("direction-label");
const btn = document.getElementById("toggle-btn");

const labels = {
  "en|sv": "English → Swedish",
  "sv|en": "Swedish → English"
};

chrome.storage.local.get("direction", ({ direction }) => {
  direction = direction || "en|sv";
  label.textContent = labels[direction];
});

btn.addEventListener("click", () => {
  chrome.storage.local.get("direction", ({ direction }) => {
    const next = direction === "en|sv" ? "sv|en" : "en|sv";
    chrome.storage.local.set({ direction: next }, () => {
      label.textContent = labels[next];
    });
  });
});
