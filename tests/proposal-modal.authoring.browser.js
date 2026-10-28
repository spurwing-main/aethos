(async()=>{
 const results=[];const test=async(name,fn)=>{try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};const assert=(c,m)=>{if(!c)throw Error(m);};
 const section=document.querySelector('#proposal-form'),link=document.querySelector('#authored-link'),rich=document.querySelector('[data-proposal-modal-content]'),image=document.querySelector('.proposal_media');
 const originalHTML=link.outerHTML,originalClass=rich.className,originalDisplay=getComputedStyle(section.querySelector('.proposal')).display,originalImageDisplay=getComputedStyle(image).display;
 await test('authored link is the only trigger and stays unchanged',()=>{aethos.functions.proposalModal();assert(document.querySelectorAll('[data-proposal-modal-open]').length===1,'generated an extra button');assert(link.outerHTML===originalHTML,'rewrote author link');});
 await test('author image and layout stay intact',()=>{assert(getComputedStyle(image).display===originalImageDisplay,'image hidden');assert(getComputedStyle(section.querySelector('.proposal')).display===originalDisplay,'layout changed');});
 await test('hidden rich text becomes visible only within modal',()=>{const click=new MouseEvent('click',{button:0,bubbles:true,cancelable:true});link.dispatchEvent(click);assert(click.defaultPrevented,'link navigated');assert(!document.querySelector('.proposal-modal').hidden,'link failed to open');assert(rich.getClientRects().length&&getComputedStyle(rich).display!=='none','form stayed hidden');assert(rich.className===originalClass,'changed author hidden class');document.querySelector('.proposal-modal_close').click();assert(document.activeElement===link,'focus did not return to link');});
 window.proposalAuthoringResults=results;return results;
})()
