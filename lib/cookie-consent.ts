export type CookieConsent="all"|"necessary";

const KEY="franklynsCookieConsent";
const EVENT="franklyns:cookie-consent";

export function getCookieConsent():CookieConsent|null{
 if(typeof window==="undefined")return null;
 try{
  const value=localStorage.getItem(KEY);
  return value==="all"||value==="necessary"?value:null;
 }catch{
  return null;
 }
}

export function setCookieConsent(value:CookieConsent){
 try{localStorage.setItem(KEY,value)}catch{}
 window.dispatchEvent(new CustomEvent(EVENT,{detail:value}));
}

export function onCookieConsentChange(handler:(value:CookieConsent)=>void){
 const listener=(event:Event)=>handler((event as CustomEvent<CookieConsent>).detail);
 window.addEventListener(EVENT,listener);
 return ()=>window.removeEventListener(EVENT,listener);
}
