"use client";

import {useEffect,useState} from "react";
import {getCookieConsent,setCookieConsent} from "@/lib/cookie-consent";

export function CookieBanner(){
 const[visible,setVisible]=useState(false);
 useEffect(()=>{setVisible(!getCookieConsent())},[]);

 if(!visible)return null;

 function choose(value:"all"|"necessary"){
  setCookieConsent(value);
  setVisible(false);
 }

 return (
  <div className="cookie-banner" role="dialog" aria-label="Cookie preferences" aria-describedby="cookie-banner-copy">
   <p id="cookie-banner-copy">A few essentials keep the site working (your basket, wishlist, saved preferences); nothing is sent elsewhere for these. If you accept, we also switch on the Trustpilot reviews widget, which sets its own cookie. See the <a href="/cookies">cookies policy</a> for details.</p>
   <div className="cookie-banner-actions">
    <button onClick={()=>choose("necessary")}>Necessary only</button>
    <button className="cookie-accept" onClick={()=>choose("all")}>Accept all</button>
   </div>
  </div>
 );
}
