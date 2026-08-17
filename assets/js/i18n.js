const MAWAHUB_LANG_KEY='mawahub_language';
export const LANGUAGES={en:'English',sw:'Kiswahili',fr:'Français',pt:'Português',ar:'العربية'};
const FALLBACK='en';
let messages={};
export async function loadLanguage(lang){
  const code=LANGUAGES[lang]?lang:FALLBACK;
  const response=await fetch(`/content/i18n/${code}.json`,{credentials:'same-origin'});
  if(!response.ok)throw new Error(`language_load_failed:${code}`);
  messages=await response.json();
  document.documentElement.lang=code;
  localStorage.setItem(MAWAHUB_LANG_KEY,code);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(key&&messages[key]!==undefined)el.textContent=messages[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key=el.getAttribute('data-i18n-placeholder');
    if(key&&messages[key]!==undefined)el.setAttribute('placeholder',messages[key]);
  });
  window.dispatchEvent(new CustomEvent('mawahub:language-changed',{detail:{lang:code}}));
  return code;
}
export function t(key,fallback=key){return messages[key]??fallback;}
export function getSavedLanguage(){return localStorage.getItem(MAWHUB_LANG_KEY)||navigator.language?.slice(0,2)||FALLBACK;}
export function initLanguageSelector(selector='[data-language-selector]'){
  const select=document.querySelector(selector); if(!select)return;
  select.innerHTML=Object.entries(LANGUAGES).map(([code,name])=>`<option value="${code}">${name}</option>`).join('');
  select.value=getSavedLanguage() in LANGUAGES?getSavedLanguage():FALLBACK;
  select.addEventListener('change',()=>loadLanguage(select.value).catch(console.error));
  return loadLanguage(select.value).catch(()=>loadLanguage(FALLBACK));
}
