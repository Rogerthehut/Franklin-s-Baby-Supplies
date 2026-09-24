"use client";

import {useEffect,useRef,useState} from "react";
import {getCookieConsent,setCookieConsent} from "@/lib/cookie-consent";

export function CookieBanner(){
 const[visible,setVisible]=useState(false);
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{setVisible(!getCookieConsent())},[]);

 // Being fixed-position, the banner would otherwise sit on top of the
 // footer and swallow clicks on whatever's underneath it (e.g. the footer's
 // own links) until dismissed. Push the page content up by its real
 // rendered height instead, so nothing ends up hidden behind it.
 useEffect(()=>{
  if(!visible){document.body.style.paddingBottom="";return}
  const el=ref.current;
  if(!el)return;
  const update=()=>{document.body.style.paddingBottom=`${el.offsetHeight}px`};
  update();
  const observer=new ResizeObserver(update);
  observer.observe(el);
  return()=>{observer.disconnect();document.body.style.paddingBottom=""};
 },[visible]);

 if(!visible)return null;

 function choose(value:"all"|"necessary"){
  setCookieConsent(value);
  setVisible(false);
 }

 return (
  <div className="cookie-banner" ref={ref} role="dialog" aria-label="Cookie preferences" aria-describedby="cookie-banner-copy">
   <p id="cookie-banner-copy">A few essentials keep the site working (your basket, wishlist, saved preferences); nothing is sent elsewhere for these. If you accept, we also switch on the Trustpilot reviews widget, which sets its own cookie. See the <a href="/cookies">cookies policy</a> for details.</p>
   <div className="cookie-banner-actions">
    <button onClick={()=>choose("necessary")}>Necessary only</button>
    <button className="cookie-accept" onClick={()=>choose("all")}>Accept all</button>
   </div>
  </div>
 );
}
