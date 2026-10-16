const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
let browser;

after(async()=>{await browser?.close();});
async function editor(items=[]){
  browser ||= await chromium.launch({headless:true,channel:process.env.WEBCOLLECT_BROWSER_CHANNEL||undefined,executablePath:process.env.WEBCOLLECT_BROWSER_EXECUTABLE||undefined});
  const page=await browser.newPage();
  await page.route('https://webcollect.test/**',route=>{
    const file=path.basename(new URL(route.request().url()).pathname);
    if(!['editor.html','editor.js','editor.css'].includes(file))return route.abort();
    return route.fulfill({body:fs.readFileSync(path.join(root,file)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  await page.addInitScript(initial=>{
    window.testStorage={items:initial,documentTitle:''};
    window.changeListeners=[];
    window.chrome={storage:{local:{
      get:async defaults=>({...defaults,...window.testStorage}),
      set:async changes=>Object.assign(window.testStorage,JSON.parse(JSON.stringify(changes)))
    },onChanged:{addListener:fn=>window.changeListeners.push(fn)}},runtime:{sendMessage:async()=>({ok:true})}};
  },items);
  await page.goto('https://webcollect.test/editor.html');
  await page.waitForFunction(()=>document.getElementById('dynamicPrint'));
  return page;
}
test('manifest matches release and all declared runtime files exist',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8').replace(/^\uFEFF/,''));
  assert.equal(manifest.version,'1.0.0');
  assert.equal(manifest.manifest_version,3);
  for(const file of [manifest.background.service_worker,manifest.side_panel.default_path,...manifest.content_scripts.flatMap(s=>s.js)])assert.ok(fs.existsSync(path.join(root,file)),file);
  assert.equal(manifest.externally_connectable,undefined);
});
test('sanitizer removes active content, obfuscated URLs and resource CSS',async()=>{
  const page=await editor();
  try{
    const actual=await page.evaluate(()=>{
      const html=sanitizeHTML('<script>alert(1)</script><iframe srcdoc="bad"></iframe><svg onload="bad()"></svg><form>secret</form><a id="pdf" name="content" href="java&#10;script:alert(1)" onclick="bad()" ping="https://tracker.invalid">link</a><img src="data:text/html,bad" srcset="https://tracker.invalid/a 2x" onerror="bad()"><p style="color:red;list-style-image:url(https://tracker.invalid/a);background-image:url(https://tracker.invalid/b)">safe</p>');
      const doc=new DOMParser().parseFromString(html,'text/html');
      return {html,active:doc.querySelectorAll('script,iframe,svg,form').length,link:doc.querySelector('a').getAttribute('href'),id:doc.querySelector('a').id,src:doc.querySelector('img').getAttribute('src'),srcset:doc.querySelector('img').getAttribute('srcset'),style:doc.querySelector('p').getAttribute('style')};
    });
    assert.equal(actual.active,0);
    assert.equal(actual.link,null);
    assert.equal(actual.id,'');
    assert.equal(actual.src,null);
    assert.equal(actual.srcset,null);
    assert.doesNotMatch(actual.html,/\bonclick=|\bonerror=|\bping=/);
    assert.doesNotMatch(actual.style,/url/i);
    assert.match(actual.style,/color:\s*red/);
  }finally{await page.close();}
});
test('sanitizer preserves text, tables, supported images and links',async()=>{
  const page=await editor();
  try{
    const html=await page.evaluate(()=>sanitizeHTML('<p style="font-weight:700">Hello <b>world</b></p><table><tr><td>cell</td></tr></table><a href="https://example.com/a">source</a><img src="data:image/png;base64,AA==">'));
    assert.match(html,/<b>world<\/b>/);
    assert.match(html,/<td>cell<\/td>/);
    assert.match(html,/href="https:\/\/example.com\/a"/);
    assert.match(html,/noopener noreferrer/);
    assert.match(html,/src="data:image\/png;base64,AA=="/);
  }finally{await page.close();}
});
test('empty state, notes, persistence, ordering, export and sidebar sync',async()=>{
  const page=await editor();
  try{
    assert.equal(await page.locator('#pdf').isVisible(),false);
    await page.locator('#addText').click();
    assert.equal(await page.locator('#pdf').isVisible(),true);
    await page.locator('.body-content').fill('My note');
    await page.locator('#save').click();
    assert.match(await page.evaluate(()=>testStorage.items[0].html),/My note/);
    await page.locator('#addText').click();
    await page.locator('.body-content').nth(1).fill('Second note');
    await page.locator('.controls').nth(1).getByRole('button',{name:'↑',exact:true}).click();
    assert.match(await page.locator('.body-content').first().textContent(),/Second note/);
    const html=await page.evaluate(()=>htmlExport());
    assert.match(html,/Second note/);
    assert.doesNotMatch(html,/class="controls"/);
    await page.evaluate(()=>{for(const fn of changeListeners)fn({items:{newValue:[]}},'local');});
    assert.equal(await page.locator('.block').count(),0);
    assert.equal(await page.locator('#downloadHTML').isVisible(),false);
  }finally{await page.close();}
});
function background({url='chrome-extension://test/editor.html',fail=false}={}){
  let listener;const calls=[];
  const chrome={
    sidePanel:{setPanelBehavior:async()=>{}},
    runtime:{getURL:file=>'chrome-extension://test/'+file,onMessage:{addListener:fn=>listener=fn}},
    tabs:{onUpdated:{addListener:()=>{}},create:()=>{}},
    debugger:{attach:async()=>calls.push('attach'),sendCommand:async(_target,command)=>{calls.push(command);if(fail&&command==='Page.printToPDF')throw Error('print failed');return {data:'AA=='};},detach:async()=>calls.push('detach')},
    downloads:{download:async options=>calls.push(options.filename)}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root,'background.js'),'utf8'),{chrome,console,setTimeout:fn=>{fn();},Uint8Array,atob,Blob});
  return {calls,send:()=>new Promise(resolve=>listener({type:'EXPORT_PDF',filename:'bad/name'},{tab:{id:1},url},resolve))};
}
test('PDF request succeeds, sanitizes filename and detaches',async()=>{
  const bg=background();assert.equal((await bg.send()).ok,true);
  assert.deepEqual(bg.calls,['attach','Page.enable','Page.printToPDF','badname.pdf','detach']);
});
test('PDF failure detaches and reports error',async()=>{
  const bg=background({fail:true});assert.equal((await bg.send()).ok,false);
  assert.equal(bg.calls.at(-1),'detach');
});
test('PDF rejects editor URL prefixes and unrelated pages',async()=>{
  for(const url of ['chrome-extension://test/editor.html.evil','https://example.com/']){
    const bg=background({url});assert.equal((await bg.send()).ok,false);assert.deepEqual(bg.calls,[]);
  }
});


