const $=id=>document.getElementById(id);
let blocks=[];
let busy=false;
const escapeName=s=>String(s||'Collected_Document').replace(/[\\/:*?"<>|\x00-\x1f]/g,'').trim().slice(0,120)||'Collected_Document';
function sanitizeHTML(html){
  const doc=new DOMParser().parseFromString(String(html),'text/html');
  doc.querySelectorAll('script,iframe,object,embed,form,input,button,textarea,select,video,audio,svg,math,canvas,link,style,meta,base,template').forEach(el=>el.remove());
  doc.body.querySelectorAll('*').forEach(el=>{
    for(const attr of [...el.attributes]){
      const name=attr.name.toLowerCase(), value=attr.value.trim();
      if(name.startsWith('on')||['srcdoc','formaction','action','ping','srcset','background','poster','data','is','autofocus','contenteditable','id','name'].includes(name)){
        el.removeAttribute(attr.name);
        continue;
      }
      if(['href','src','xlink:href'].includes(name)){
        const normalized=value.replace(/[\u0000-\u0020\u007f]/g,'');
        const safeLink=name==='href'&&el.tagName==='A'&&/^(https?:|mailto:|tel:|#)/i.test(normalized);
        const safeImage=name==='src'&&el.tagName==='IMG'&&/^(https?:|data:image\/(?:png|jpeg|gif|webp|avif);base64,)/i.test(normalized);
        if(!safeLink&&!safeImage)el.removeAttribute(attr.name);
      }
      if(name==='style'){
        // Keep captured formatting, removing CSS declarations that fetch resources.
        for(const property of [...el.style]){
          if(/url\s*\(|image-set\s*\(|expression\s*\(|@import|\\/i.test(el.style.getPropertyValue(property)))el.style.removeProperty(property);
        }
      }
    }
    if(el.tagName==='A')el.setAttribute('rel','noopener noreferrer');
  });
  return doc.body.innerHTML;
}
function sync(){document.querySelectorAll('.body-content').forEach((el,i)=>{if(blocks[i])blocks[i].html=sanitizeHTML(el.innerHTML);});}
async function save(){sync();await chrome.storage.local.set({items:blocks});$('status').textContent='Saved';}
function updatePrintStyle(){
  const paper=$('paper').value;
  $('sheet').classList.toggle('long',paper==='long');
  const scale=Number($('docScale').value)/100;
  $('scaleText').textContent=Math.round(scale*100)+'%';
  $('content').style.zoom=String(scale);
  let style=$('dynamicPrint');
  if(!style){style=document.createElement('style');style.id='dynamicPrint';document.head.append(style);}
  const pageSize=paper==='long'?'322.75mm 1086.08mm':'A4';
  style.textContent=`@media print{@page{size:${pageSize};margin:8mm}#content{zoom:${scale}!important}}`;
}
function slider(label,key,min,max,step,unit,block,content){
  const wrap=document.createElement('label'),input=document.createElement('input'),display=document.createElement('span');
  wrap.append(label+' ');input.type='range';input.min=min;input.max=max;input.step=step;input.value=block[key]??(key==='height'?0:100);
  function apply(){content.style.width=(block.width??100)+'%';content.style.height=block.height?block.height+'px':'auto';content.style.overflow=block.height?'auto':'visible';content.style.zoom=(block.scale??100)/100;}
  const show=()=>display.textContent=(key==='height'&&!Number(input.value))?'Auto':input.value+unit;
  input.oninput=()=>{block[key]=Number(input.value);apply();show();};show();apply();wrap.append(input,display);return wrap;
}
function render(){
  $('empty').hidden=blocks.length>0;
  $('downloadHTML').hidden=blocks.length===0;
  $('pdf').hidden=blocks.length===0;
  $('content').replaceChildren();
  blocks.forEach((block,index)=>{
    const section=document.createElement('section');section.className='block';
    const controls=document.createElement('div');controls.className='controls';
    const content=document.createElement('div');content.className='body-content';content.innerHTML=sanitizeHTML(block.html);
    controls.append(slider('Width','width',20,100,5,'%',block,content),slider('Height','height',0,1500,10,'px',block,content),slider('Scale','scale',50,200,5,'%',block,content));
    const addBelow=document.createElement('button');addBelow.textContent='+ Text below';addBelow.title='Insert a text block after this element';addBelow.onclick=()=>insertText(index+1);
    const edit=document.createElement('button');edit.textContent=block.type==='text'?'Edit note':'Edit text';edit.onclick=()=>{const enabled=content.contentEditable==='true';content.contentEditable=String(!enabled);edit.textContent=enabled?'Edit text':'Finish editing';if(enabled)block.html=sanitizeHTML(content.innerHTML);};
    content.oninput=()=>{block.html=sanitizeHTML(content.innerHTML);};content.addEventListener('focusout',()=>{block.html=sanitizeHTML(content.innerHTML);save().catch(()=>{});});
    const up=document.createElement('button');up.textContent='↑';up.onclick=()=>move(index,-1);
    const down=document.createElement('button');down.textContent='↓';down.onclick=()=>move(index,1);
    const del=document.createElement('button');del.textContent='Delete';del.onclick=()=>{sync();blocks.splice(index,1);render();save().catch(err=>$('status').textContent=err.message);};
    controls.append(addBelow,edit,up,down,del);section.append(controls,content);if(block.type==='text'){section.classList.add('text-block');content.contentEditable='true';edit.textContent='Finish editing';}$('content').append(section);
  });
}
function insertText(at){sync();const note={id:crypto.randomUUID(),type:'text',label:'Text block',html:'<p>Write your text here…</p>',title:$('filename').value,source:'',width:100,height:0,scale:100};blocks.splice(at,0,note);render();const node=$('content').children[at]?.querySelector('.body-content');if(node){node.focus();const range=document.createRange();range.selectNodeContents(node);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}save().catch(err=>$('status').textContent='Save failed: '+err.message);}
function move(i,d){sync();const j=i+d;if(j<0||j>=blocks.length)return;[blocks[i],blocks[j]]=[blocks[j],blocks[i]];render();save().catch(err=>$('status').textContent=err.message);}
function htmlExport(){sync();const pageSize=$('paper').value==='long'?'322.75mm 1086.08mm':'A4';const scale=Number($('docScale').value)/100;
  const sections=blocks.map(b=>`<section style="width:${b.width??100}%;height:${b.height?b.height+'px':'auto'};zoom:${(b.scale??100)/100};margin-bottom:10px">${sanitizeHTML(b.html)}</section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeName($('filename').value)}</title><style>@page{size:${pageSize};margin:8mm}body{font-family:Arial;margin:0;zoom:${scale}}img{max-width:100%;height:auto}pre{white-space:pre-wrap}table{max-width:100%;border-collapse:collapse}</style></head><body>${sections}</body></html>`;
}
function downloadHTML(){if(!blocks.length)return;const blob=new Blob([htmlExport()],{type:'text/html'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=escapeName($('filename').value)+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
async function pdf(){if(busy||!blocks.length)return;busy=true;const button=$('pdf');button.disabled=true;$('status').textContent='Generating selectable-text PDF…';
  try{sync();await save();document.title=escapeName($('filename').value);updatePrintStyle();document.querySelectorAll('.body-content').forEach(el=>el.contentEditable='false');
    document.documentElement.classList.add('pdf-exporting');
    await document.fonts.ready;
    await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,5000);}))); 
    const response=await chrome.runtime.sendMessage({type:'EXPORT_PDF',filename:escapeName($('filename').value)});
    if(!response?.ok)throw Error(response?.error||'PDF export failed');
    $('status').textContent='PDF ready — choose save location';
  }catch(err){$('status').textContent='Error: '+err.message;}finally{document.documentElement.classList.remove('pdf-exporting');busy=false;button.disabled=false;}
}
async function init(){const data=await chrome.storage.local.get({items:[],documentTitle:''});blocks=data.items.map(b=>({...b}));$('filename').value=data.documentTitle||blocks[0]?.title||'Collected_Document';render();updatePrintStyle();}
$('addText').onclick=()=>insertText(blocks.length);
$('paper').onchange=updatePrintStyle;$('docScale').oninput=updatePrintStyle;
$('save').onclick=async()=>{await save();await chrome.storage.local.set({documentTitle:$('filename').value});};
$('downloadHTML').onclick=downloadHTML;$('pdf').onclick=pdf;
$('filename').onchange=()=>chrome.storage.local.set({documentTitle:$('filename').value});
$('clear').onclick=async()=>{if(!confirm('Delete every collected element?'))return;blocks=[];await save();render();};
init();

// Keep open editor tabs in sync when an item is deleted or added in the sidebar.
// Retain local edits on surviving blocks; never resurrect removed items.
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area!=='local'||!changes.items)return;
  const latest=changes.items.newValue||[];
  const currentIds=blocks.map(b=>b.id).join('\u0000');
  const latestIds=latest.map(b=>b.id).join('\u0000');
  if(currentIds===latestIds)return;
  const existing=new Map(blocks.map(b=>[b.id,b]));
  blocks=latest.map(b=>existing.get(b.id)||{...b});
  render();
  $('status').textContent='Collection updated';
});
