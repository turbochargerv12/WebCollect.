(()=>{
if(window.__webCollectSidepanel)return;window.__webCollectSidepanel=true;
let selecting=false,hovered=null,previousOutline='';
function clearHover(){if(hovered){hovered.style.outline=previousOutline;hovered=null;}}
function setSelecting(value){selecting=!!value;clearHover();return {selecting};}
chrome.runtime.onMessage.addListener((message,_sender,reply)=>{if(message?.type==='WEBCOLLECT_STATUS'){reply({selecting});return;}if(message?.type==='WEBCOLLECT_SET_SELECTING'){reply(setSelecting(message.selecting));return;}});
document.addEventListener('mouseover',e=>{if(!selecting||hovered===e.target)return;clearHover();hovered=e.target;previousOutline=hovered.style.outline;hovered.style.outline='3px solid #20af03';},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setSelecting(false);},true);
document.addEventListener('click',async e=>{
if(!selecting)return;
e.preventDefault();e.stopImmediatePropagation();const element=e.target;clearHover();
if(element.matches('script,iframe,object,embed,form'))return;
const clone=element.cloneNode(true);const originals=[element,...element.querySelectorAll('*')];const copies=[clone,...clone.querySelectorAll('*')];
originals.forEach((orig,i)=>{const copy=copies[i];if(!copy)return;if(orig instanceof HTMLImageElement){copy.setAttribute('src',orig.currentSrc||orig.src);copy.removeAttribute('srcset');}if(orig instanceof HTMLAnchorElement)copy.setAttribute('href',orig.href);const computed=getComputedStyle(orig);const props=['color','background-color','font-family','font-size','font-weight','font-style','line-height','text-align','white-space','border','border-collapse','padding','margin','display','list-style-type','vertical-align','text-decoration','border-radius'];copy.setAttribute('style',props.map(p=>`${p}:${computed.getPropertyValue(p)}`).join(';'));for(const attr of [...copy.attributes])if(/^on/i.test(attr.name))copy.removeAttribute(attr.name);});
clone.querySelectorAll('script,iframe,object,embed,form,video,audio,svg,canvas,link,style').forEach(node=>node.remove());
const {items=[]}=await chrome.storage.local.get({items:[]});items.push({id:crypto.randomUUID(),label:(element.innerText||element.tagName).trim().slice(0,90),html:clone.outerHTML,title:document.title,source:location.href,width:100,height:0,scale:100});await chrome.storage.local.set({items});
},true);
})();
