(() => {
  const btn = document.getElementById('toggle');
  const status = document.getElementById('status');

  function apply(enabled) {
    btn.classList.toggle('on',  enabled);
    btn.classList.toggle('off', !enabled);
    btn.textContent = enabled ? '비활성화' : '활성화';
    status.textContent = `현재 상태: ${enabled ? '활성화됨' : '비활성화됨'}`;

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_STATE', enabled });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({ enabled: true }, ({ enabled }) => apply(enabled));
  });

  btn.addEventListener('click', () => {
    chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
      const next = !enabled;
      chrome.storage.sync.set({ enabled: next }, () => apply(next));
    });
  });
})();
