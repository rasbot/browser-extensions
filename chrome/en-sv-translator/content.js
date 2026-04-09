let currentDirection = "en|sv";

chrome.storage.local.get("direction", ({ direction }) => {
  currentDirection = direction || "en|sv";
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.direction) {
    currentDirection = changes.direction.newValue;
  }
});

async function translate(text, langpair) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  }
  throw new Error(data.responseDetails || "Translation error");
}

function getOrCreateTooltip() {
  let tip = document.getElementById("ensv-translator-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "ensv-translator-tooltip";
    tip.className = "ensv-translator-tooltip";
    document.body.appendChild(tip);
  }
  return tip;
}

function showTooltip(rect, html) {
  const tip = getOrCreateTooltip();
  tip.innerHTML = html;
  tip.style.display = "block";

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  let top = rect.bottom + scrollY + 8;
  let left = rect.left + scrollX + rect.width / 2;

  tip.style.left = left + "px";
  tip.style.top = top + "px";
  tip.style.transform = "translateX(-50%)";

  requestAnimationFrame(() => {
    const tr = tip.getBoundingClientRect();
    if (tr.right > window.innerWidth) {
      tip.style.left = (window.innerWidth - tr.width - 10 + scrollX) + "px";
      tip.style.transform = "none";
    }
    if (tr.left < 0) {
      tip.style.left = (10 + scrollX) + "px";
      tip.style.transform = "none";
    }
    if (tr.bottom > window.innerHeight) {
      tip.style.top = (rect.top + scrollY - tr.height - 8) + "px";
    }
  });
}

function hideTooltip() {
  const tip = document.getElementById("ensv-translator-tooltip");
  if (tip) tip.style.display = "none";
}

const dirLabels = { "en|sv": "EN → SV", "sv|en": "SV → EN" };

let debounceTimer = null;
let lastMousePos = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;
});

document.addEventListener("mouseup", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => handleSelection(), 300);
});

document.addEventListener("mousedown", (e) => {
  const tip = document.getElementById("ensv-translator-tooltip");
  if (tip && !tip.contains(e.target)) {
    hideTooltip();
  }
});

// Google Docs support: listen for Ctrl+C / Cmd+C and read clipboard
const isGoogleDocs = location.hostname === "docs.google.com";

if (isGoogleDocs) {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            handleClipboardText(text.trim());
          }
        } catch {
          // Clipboard permission denied — nothing we can do
        }
      }, 100);
    }
  });
}

async function handleClipboardText(text) {
  if (text.length > 500) {
    const rect = mouseRect();
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Selection too long (max 500 chars)`);
    return;
  }

  const rect = mouseRect();
  showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Translating...`);

  try {
    const result = await translate(text, currentDirection);
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>${result}`);
  } catch {
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Translation failed`);
  }
}

function mouseRect() {
  return {
    top: lastMousePos.y,
    bottom: lastMousePos.y,
    left: lastMousePos.x,
    width: 0
  };
}

async function handleSelection() {
  const sel = window.getSelection();
  const text = sel.toString().trim();
  if (!text) return;

  if (text.length > 500) {
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Selection too long (max 500 chars)`);
    return;
  }

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Translating...`);

  try {
    const result = await translate(text, currentDirection);
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>${result}`);
  } catch {
    showTooltip(rect, `<div class="ensv-dir">${dirLabels[currentDirection]}</div>Translation failed`);
  }
}
