let observer = null;

const SELECTOR = '[class*=adsbygoogle]';

function makeObserver() {
  return new MutationObserver(() => {
    const advertiseSections = document.querySelectorAll(SELECTOR);
    advertiseSections.forEach(section => {
      section.style.display = 'none';
    });
  });
}

function start() {
  if (observer) return;
  observer = makeObserver();
  const target = document.body || document.documentElement;
  observer.observe(target, { childList: true, subtree: true });

  const nodes = document.querySelectorAll(SELECTOR);
  nodes.forEach(node => {
    node.style.display = 'none';
  });
}

function stop() {
  if (!observer) return;
  observer.disconnect();
  observer = null;

  const nodes = document.querySelectorAll(SELECTOR);
  nodes.forEach(node => {
    node.style.removeProperty('display');
  });
}

function applyState(enabled) {
  if (enabled) start();
  else stop();
}

chrome.storage.sync.get({ enabled: true }, ({ enabled }) => applyState(enabled));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && Object.prototype.hasOwnProperty.call(changes, 'enabled')) {
    applyState(Boolean(changes.enabled.newValue));
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'TOGGLE_STATE') applyState(!!msg.enabled);
});
