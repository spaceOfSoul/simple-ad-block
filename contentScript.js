const SELECTOR = '[class*=adsbygoogle], [id*=google_ads_iframe], [id*=_fs-ad-iframe-container], [id*=adVideoElement]';

// data-async-type="folsrch" : AI 개요 동적 로딩 식별자
// id^="folsrch"             : ID 기반 variant
// data-subtree~="aimc"      : post-hydration 마커
const SELECTOR_AI = '[data-async-type="folsrch"], [id^="folsrch"], [data-subtree~="aimc"]';

function findAIOverview() {
  const targets = new Set();
  document.querySelectorAll(SELECTOR_AI).forEach(el => {
    // #rcnt 또는 #rso의 직계 자식까지 올라가 해당 블록 전체를 숨김
    let node = el;
    while (node.parentElement) {
      if (node.parentElement.id === 'rcnt' || node.parentElement.id === 'rso') {
        targets.add(node);
        return;
      }
      node = node.parentElement;
    }
    targets.add(el);
  });
  return targets;
}

function makeBlocker(finder) {
  let observer = null;

  function start() {
    if (observer) return;
    observer = new MutationObserver(() => {
      finder().forEach(el => { el.style.display = 'none'; });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    finder().forEach(el => { el.style.display = 'none'; });
  }

  function stop() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    finder().forEach(el => { el.style.removeProperty('display'); });
  }

  return { start, stop, apply(enabled) { if (enabled) start(); else stop(); } };
}

const adBlocker  = makeBlocker(() => document.querySelectorAll(SELECTOR));
const rcntBlocker = makeBlocker(findAIOverview);

chrome.storage.sync.get({ enabled: true, enabledRcnt: true }, ({ enabled, enabledRcnt }) => {
  adBlocker.apply(enabled);
  rcntBlocker.apply(enabledRcnt);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  if (Object.prototype.hasOwnProperty.call(changes, 'enabled')) {
    adBlocker.apply(Boolean(changes.enabled.newValue));
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'enabledRcnt')) {
    rcntBlocker.apply(Boolean(changes.enabledRcnt.newValue));
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.type === 'TOGGLE_STATE') adBlocker.apply(!!msg.enabled);
  if (msg.type === 'TOGGLE_RCNT')  rcntBlocker.apply(!!msg.enabled);
});
