"use client";

import {useEffect,useState} from "react";
import {getCookieConsent,setCookieConsent,type CookieConsent} from "@/lib/cookie-consent";

export function CookiePreferences(){
 const[consent,setConsent]=useState<CookieConsent|null>(null);
 useEffect(()=>{setConsent(getCookieConsent())},[]);

 function choose(value:CookieConsent){
  setCookieConsent(value);
  setConsent(value);
 }

 return (
  <div className="cookie-preferences">
   <p className="cookie-preferences-status">
    {consent==="all"?"Your current choice: accept all, including the Trustpilot cookie.":consent==="necessary"?"Your current choice: necessary cookies only.":"You haven't made a choice yet on this device."}
   </p>
   <div className="cookie-preferences-actions">
    <button className={consent==="necessary"?"selected":""} onClick={()=>choose("necessary")}>Necessary only</button>
    <button className={consent==="all"?"selected":""} onClick={()=>choose("all")}>Accept all</button>
   </div>
  </div>
 );
}
