(() => {
  function sendToTab(msg) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, msg);
    });
  }

  function setupToggle({ btnId, statusId, storageKey, msgType, defaultVal }) {
    const btn = document.getElementById(btnId);
    const status = document.getElementById(statusId);

    function apply(enabled) {
      btn.classList.toggle('off', !enabled);
      btn.textContent = enabled ? '비활성화' : '활성화';
      status.textContent = `현재 상태: ${enabled ? '활성화됨' : '비활성화됨'}`;
      sendToTab({ type: msgType, enabled });
    }

    chrome.storage.sync.get({ [storageKey]: defaultVal }, (res) => apply(res[storageKey]));

    btn.addEventListener('click', () => {
      chrome.storage.sync.get({ [storageKey]: defaultVal }, (res) => {
        const next = !res[storageKey];
        chrome.storage.sync.set({ [storageKey]: next }, () => apply(next));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupToggle({ btnId: 'toggle',      statusId: 'status',      storageKey: 'enabled',     msgType: 'TOGGLE_STATE', defaultVal: true });
    setupToggle({ btnId: 'toggle-rcnt', statusId: 'status-rcnt', storageKey: 'enabledRcnt', msgType: 'TOGGLE_RCNT',  defaultVal: true });
  });
})();
