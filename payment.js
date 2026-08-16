(function(){
  const C=window.MAWH_PAYMENT_CONFIG||{};
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function methods(){return [...(C.kenya||[]),...(C.tanzania||[])].filter(x=>x.status==='active');}
  function open(){
    if(document.getElementById('mwPay')) return document.getElementById('mwPay').classList.add('show');
    const rows=methods().map(x=>`<div class="mw-payrow"><div><b>${esc(x.name)}</b><span>${esc(x.number)}</span><small>USSD: ${esc(x.ussd)}</small></div><div class="mw-payactions"><a class="mw-ussd" href="tel:${encodeURIComponent(x.ussd)}">Open menu</a><a href="tel:${x.number.replace(/[^+\d]/g,'')}">Call</a></div></div>`).join('');
    const placeholder=(C.kenya||[]).find(x=>x.id==='safaricom-ke');
    const modal=document.createElement('div'); modal.id='mwPay'; modal.className='mw-paymodal show';
    modal.innerHTML=`<div class="mw-paybox" role="dialog" aria-modal="true" aria-labelledby="mwPayTitle"><button class="mw-close" aria-label="Close">×</button><span class="pill">MAWAHUB DONATION</span><h2 id="mwPayTitle">Choose your mobile-money network</h2><p>Tap <b>Open menu</b> to launch your phone's USSD menu. You will enter the MawaHub recipient/payment details shown or supplied by MawaHub.</p>${rows}<div class="mw-payrow pending"><div><b>Safaricom M-PESA Kenya</b><span>Number / Till / PayBill to be added</span><small>${esc(placeholder?.ussd||'*334#')}</small></div><button disabled>Coming soon</button></div><div class="mw-note">Never share your mobile-money PIN with anyone. MawaHub will never ask for your PIN.</div><a class="mw-settings" href="https://github.com/benniepeter/Mawa-Hub/blob/main/payment-config.js" target="_blank" rel="noopener">Payment method settings →</a></div>`;
    document.body.appendChild(modal); modal.querySelector('.mw-close').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove()};
  }
  function bind(){document.querySelectorAll('a[href="#donate"],.navdonate,.fund').forEach(a=>{if(a.dataset.mwPayBound)return;a.dataset.mwPayBound='1';a.addEventListener('click',e=>{e.preventDefault();open()})});}
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true}); addEventListener('hashchange',()=>setTimeout(bind,30)); bind();
})();