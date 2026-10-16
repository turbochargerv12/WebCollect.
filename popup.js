document.getElementById('open').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('editor.html')});
