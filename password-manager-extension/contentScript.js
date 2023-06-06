// Content Script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'hashSelectedText') {
    const selectedText = window.getSelection().toString();
    const hashedText = hashFunction(selectedText);
    sendResponse(hashedText);
  }
});

function hashFunction(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return crypto.subtle.digest('SHA-256', data).then((hash) => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashedContent = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return hashedContent;
  });
}

// Context Menu
chrome.contextMenus.create({
  id: 'hashSelectedText',
  title: 'Hash Selected Text',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'hashSelectedText') {
    chrome.tabs.sendMessage(tab.id, { action: 'hashSelectedText' }, function (response) {
      alert(response);
    });
  }
});
