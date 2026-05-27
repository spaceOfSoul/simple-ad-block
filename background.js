const RULE_ID = 1;

const BLOCK_RULE = {
  id: RULE_ID,
  priority: 1,
  action: {
    type: 'block'
  },
  condition: {
    urlFilter: '*search-next.aim*',
    resourceTypes: ['script']
  }
};

function applyRule(enabled) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: enabled ? [BLOCK_RULE] : []
  });
}

chrome.storage.sync.get({ enabledRcnt: true }, ({ enabledRcnt }) => applyRule(enabledRcnt));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && 'enabledRcnt' in changes) {
    applyRule(Boolean(changes.enabledRcnt.newValue));
  }
});
