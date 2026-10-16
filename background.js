chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true}).catch(console.error);
const EDITOR_URL = chrome.runtime.getURL('editor.html');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_EDITOR') {
    chrome.tabs.create({url: EDITOR_URL});
    return;
  }
  if (message?.type !== 'EXPORT_PDF') return;
  (async () => {
    const tabId = sender.tab?.id;
    if (!tabId || sender.url !== EDITOR_URL) throw new Error('PDF export is only allowed from the editor.');
    const target = {tabId};
    let attached = false;
    try {
      await chrome.debugger.attach(target, '1.3');
      attached = true;
      await chrome.debugger.sendCommand(target, 'Page.enable');
      // Give fonts and image layout time to finish before printing.
      await wait(250);
      const options = {
        printBackground: true,
        displayHeaderFooter: false,
        preferCSSPageSize: true,
        landscape: false,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        transferMode: 'ReturnAsBase64'
      };
      const result = await chrome.debugger.sendCommand(target, 'Page.printToPDF', options);
      if (!result?.data) throw new Error('PDF engine returned no data.');
      const bytes = Uint8Array.from(atob(result.data), c => c.charCodeAt(0));
      const blob = new Blob([bytes], {type: 'application/pdf'});
      // Service workers cannot use URL.createObjectURL. Use a data URL instead.
      const filename = String(message.filename || 'Collected_Document')
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '').trim().slice(0, 120) || 'Collected_Document';
      await chrome.downloads.download({
        url: 'data:application/pdf;base64,' + result.data,
        filename: filename + '.pdf',
        saveAs: true
      });
      sendResponse({ok: true});
    } finally {
      if (attached) await chrome.debugger.detach(target).catch(() => {});
    }
  })().catch(err => sendResponse({ok: false, error: String(err.message || err)}));
  return true;
});

// On completion of a webpage navigation, dismiss the sidebar.
// A new Collect click opens it again. Browser support for close() starts in recent Chromium versions.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(changeInfo.status !== 'complete' || !/^https?:/.test(tab.url || '')) return;
  if(typeof chrome.sidePanel.close === 'function') {
    chrome.sidePanel.close({tabId}).catch(() => {});
  } else {
    chrome.runtime.sendMessage({type:'WEBCOLLECT_PAGE_LOADED',tabId}).catch(() => {});
  }
});
