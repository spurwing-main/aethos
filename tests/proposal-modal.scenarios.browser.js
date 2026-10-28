(async()=>{
const results=[];const assert=(c,m)=>{if(!c)throw Error(m);};
for(const mode of ['css-missing','legacy','native','late','failure','busy','promotion','promotion-closing','namespace-reset','header-controls','dropdown-open','late-click','after-timeout']){
 const frame=document.createElement('iframe');frame.style='position:absolute;left:-10000px;width:800px;height:600px';frame.src='/tests/fixtures/proposal-modal.html?mode='+mode+'&v='+Date.now();document.body.append(frame);
 try {await new Promise((resolve,reject)=>{frame.onload=resolve;setTimeout(()=>reject(Error('fixture timed out')),3000);}); const w=frame.contentWindow;await new Promise(r=>setTimeout(r,200)); const d=w.document; w.aethos.functions.proposalModal();await new Promise(r=>setTimeout(r,100));
 if(['css-missing','native'].includes(mode))assert(!d.querySelector('.proposal-modal'),'unsafe enhancement');
 if(mode==='namespace-reset')assert(d.querySelectorAll('.proposal-modal').length===1&&d.querySelectorAll('[data-proposal-modal-open]').length===1,'site namespace reset duplicated pending controller');
 if(mode==='late-click'){const link=d.querySelector('[data-proposal-modal-open]');const e=new w.MouseEvent('click',{button:0,bubbles:true,cancelable:true});link.dispatchEvent(e);assert(e.defaultPrevented,'loading link navigated');await new Promise(r=>setTimeout(r,500));assert(w.aethos.proposalModal.open,'queued click did not open loaded form');w.location.hash='another-section';w.dispatchEvent(new w.HashChangeEvent('hashchange'));assert(!w.aethos.proposalModal.open,'queued state reopened for unrelated hash');}
 if(mode==='after-timeout'){assert(d.querySelector('.proposal-modal_fallback'),'timeout not exercised');await new Promise(r=>setTimeout(r,500));d.querySelector('[data-proposal-modal-open]').click();assert(w.aethos.proposalModal.ready&&w.aethos.proposalModal.open,'form stayed hidden after timeout');assert(!d.querySelector('.proposal-modal_fallback'),'fallback not cleared');}
 if(mode==='legacy')assert(w.aethos.proposalModal?.ready,'legacy embed was excluded');
 if(mode==='late')assert(w.aethos.proposalModal.ready,'late vendor form not enhanced');
 if(mode==='failure')assert(!d.querySelector('.proposal-modal')&&d.querySelector('.proposal-modal_fallback a')?.getAttribute('href')==='/contact','missing readable fallback');
 if(mode==='promotion-closing'){w.aethos.helpers.promoClosePromise=new Promise(resolve=>setTimeout(()=>{w.aethos.helpers.promoClosePromise=null;resolve();},10));d.querySelector('[data-proposal-modal-open]').click();assert(!w.aethos.proposalModal.open,'opened before promotion cleanup');await new Promise(r=>setTimeout(r,50));assert(w.aethos.proposalModal.open,'did not open after cleanup');}
 if(mode==='promotion'){d.querySelector('[data-proposal-modal-open]').click();await new Promise(r=>setTimeout(r,50));assert(w.aethos.proposalModal.open,'enquiry did not wait for promotion to close');}
 if(mode==='header-controls'){d.querySelector('[data-proposal-modal-open]').click();assert(w.aethos.proposalModal.open,'closed header controls blocked enquiry');}
 if(mode==='dropdown-open'){d.querySelector('[data-proposal-modal-open]').click();assert(!w.aethos.proposalModal.open,'opened over language dropdown');}
 if(mode==='busy'){d.querySelector('[data-proposal-modal-open]').click();assert(!w.aethos.proposalModal.open,'opened over navigation');}
 results.push({name:mode,pass:true});
 }catch(e){results.push({name:mode,pass:false,error:e.message});}finally{frame.remove();}
}
window.proposalScenarioTestResults=results;return results;
})()
