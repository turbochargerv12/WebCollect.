const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');

const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
const out=process.env.WEBCOLLECT_STORE_OUTPUT;
if(!out)throw Error('Set WEBCOLLECT_STORE_OUTPUT to an output directory.');
fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};
const record=name=>{report.checks.push(name);console.log('PASS: '+name);};
const fixture='<!doctype html><html><head><title>Research notes — sample collection</title><style>body{font:18px Arial;max-width:800px;margin:60px auto;color:#222;background:#fff}h1{font-size:40px}section{padding:20px;border:1px solid #ddd;margin:16px 0}table{border-collapse:collapse}td,th{padding:12px;border:1px solid #ddd}</style></head><body><h1>A small guide to focused research</h1><p>Sample content created for WebCollect testing and screenshots.</p><section id="capture-one"><h2>Make room for useful ideas</h2><p>Collect a passage when it answers a question. Keep its context, add a short note, and bring related ideas together in one document.</p><ul><li>Choose a clear research question.</li><li>Capture only the details you need.</li><li>Review your notes before exporting.</li></ul></section><section id="capture-two"><h2>From reading to a finished document</h2><table><tr><th>Step</th><th>Purpose</th></tr><tr><td>Collect</td><td>Keep useful passages</td></tr><tr><td>Edit</td><td>Connect ideas with your own notes</td></tr><tr><td>Export</td><td>Save a readable document</td></tr></table></section></body></html>';

(async()=>{

const url='http://localhost:8765/';
const context=await chromium.launchPersistentContext(process.env.WEBCOLLECT_BROWSER_PROFILE_DIR||'',{
  executablePath:process.env.WEBCOLLECT_BROWSER_EXECUTABLE,
  headless:true,acceptDownloads:true,downloadsPath:path.join(out,'browser-downloads'),viewport:{width:1280,height:800},
  ignoreDefaultArgs:['--disable-extensions'],
  args:['--disable-extensions-except='+repo,'--load-extension='+repo]
});
try{
let worker=context.serviceWorkers()[0];
if(!worker)worker=await context.waitForEvent('serviceworker',{timeout:15000});
const id=new URL(worker.url()).host;
assert.match(worker.url(),/background\.js$/);
record('Installed extension service worker loaded');
worker=await context.newPage();await worker.goto('chrome-extension://'+id+'/editor.html');
const page=await context.newPage();await page.route(url,route=>route.fulfill({body:fixture,contentType:'text/html'}));await page.goto(url);
await page.waitForTimeout(500);
const tabId=await worker.evaluate(async target=>{const tabs=await chrome.tabs.query({});return tabs.find(tab=>tab.url===target)?.id;},url);
assert.ok(tabId);
let state=await worker.evaluate(id=>chrome.tabs.sendMessage(id,{type:'WEBCOLLECT_SET_SELECTING',selecting:true}),tabId);
assert.equal(state.selecting,true);
await page.locator('#capture-one').click({position:{x:8,y:8}});
await page.locator('#capture-two').click({position:{x:8,y:8}});
await worker.waitForFunction(async()=>((await chrome.storage.local.get('items')).items||[]).length===2,{},{timeout:8000});
const items=await worker.evaluate(async()=> (await chrome.storage.local.get('items')).items);
assert.equal(items.length,2);
assert.match(items[0].html,/Make room/);
record('Real content script collected two sample sections');
await page.keyboard.press('Escape');
state=await worker.evaluate(id=>chrome.tabs.sendMessage(id,{type:'WEBCOLLECT_STATUS'}),tabId);
assert.equal(state.selecting,false);record('Escape stops collection');
const editor=await context.newPage();
await editor.goto('chrome-extension://'+id+'/editor.html');
await editor.waitForSelector('.block');
assert.equal(await editor.locator('.block').count(),2);
await editor.locator('#filename').fill('Focused research');
await editor.locator('#save').click();
await editor.screenshot({path:path.join(out,'screenshot-1-editor-1280x800.png')});
record('Editor renders real stored captures; screenshot saved');
await editor.locator('#addText').click();
await editor.locator('.body-content').last().fill('My notes: keep the useful details, connect the ideas, and make something worth revisiting.');
await editor.locator('.controls').last().getByRole('button',{name:'↑',exact:true}).click();
await editor.locator('#save').click();
await editor.screenshot({path:path.join(out,'screenshot-2-notes-1280x800.png')});
record('Notes can be edited, reordered and saved');
const htmlDownload=editor.waitForEvent('download',{timeout:10000});
await editor.locator('#downloadHTML').click();
const html=await htmlDownload;
try{await html.saveAs(path.join(out,'sample-export.html'));}catch(err){report.errors.push('HTML download save failed: '+err.message);fs.writeFileSync(path.join(out,'sample-export.html'),await editor.evaluate(()=>htmlExport()));}
assert.match(fs.readFileSync(path.join(out,'sample-export.html'),'utf8'),/My notes/);
record('HTML export markup contains edited note');
const pdfDownload=editor.waitForEvent('download',{timeout:12000}).catch(()=>null);
await editor.locator('#pdf').click();
const pdf=await pdfDownload;
if(pdf){
 try{await pdf.saveAs(path.join(out,'sample-export.pdf'));}catch(err){report.errors.push('PDF download save failed: '+err.message);}
 assert.equal(fs.readFileSync(path.join(out,'sample-export.pdf')).subarray(0,5).toString(),'%PDF-');
 record('Actual debugger PDF export downloaded a PDF');
}else{
 const status=await editor.locator('#status').textContent();
 report.errors.push('PDF download not observed: '+status);
}
await editor.pdf({path:path.join(out,'sample-print-layout.pdf'),printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
record('Browser print engine generated sample PDF for layout checks');
const side=await context.newPage();await side.goto('chrome-extension://'+id+'/sidepanel.html');
await side.waitForSelector('.item');
assert.equal(await side.locator('.item').count(),3);
await side.locator('.remove-item').first().click();
await editor.waitForFunction(()=>document.querySelectorAll('.block').length===2);
record('Sidebar deletion synchronizes with editor');
console.log('RESULT: '+JSON.stringify(report));process.exitCode=report.errors.length?2:0;
}finally{
await context.close();
fs.writeFileSync(path.join(out,'browser-test-results.json'),JSON.stringify(report,null,2));
}
})().catch(err=>{report.errors.push(String(err.stack||err));fs.writeFileSync(path.join(out,'browser-test-results.json'),JSON.stringify(report,null,2));console.error(err);process.exitCode=1;});

