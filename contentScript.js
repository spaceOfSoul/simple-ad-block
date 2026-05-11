const SELECTOR = '[class*=adsbygoogle], [id*=google_ads_iframe], [id*=_fs-ad-iframe-container]';
const SELECTOR_RCNT = 'div[data-attrid="AIOverview"], div[jsname="N760b"], #rcnt > div.bzXtMb.M8OgIe.dRpWwb, #rso > div:nth-child(3)';

function makeBlocker(selector) {
  let observer = null;

  function start() {
    if (observer) return;
    observer = new MutationObserver(() => {
      document.querySelectorAll(selector).forEach(el => { el.style.display = 'none'; });
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    document.querySelectorAll(selector).forEach(el => { el.style.display = 'none'; });
  }

  function stop() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    document.querySelectorAll(selector).forEach(el => { el.style.removeProperty('display'); });
  }

  return { start, stop, apply(enabled) { if (enabled) start(); else stop(); } };
}

const adBlocker = makeBlocker(SELECTOR);
const rcntBlocker = makeBlocker(SELECTOR_RCNT);

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
  if (msg.type === 'TOGGLE_RCNT') rcntBlocker.apply(!!msg.enabled);
});
