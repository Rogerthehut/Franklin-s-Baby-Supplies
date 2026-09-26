"use client";

import {useEffect,useRef,useState} from "react";
import {getCookieConsent,onCookieConsentChange} from "@/lib/cookie-consent";

const BUSINESS_UNIT_ID=import.meta.env.VITE_TRUSTPILOT_BUSINESS_UNIT_ID as string|undefined;
const REVIEW_URL=import.meta.env.VITE_TRUSTPILOT_REVIEW_URL as string|undefined;

declare global{interface Window{Trustpilot?:{loadFromElement:(el:Element,forceReload?:boolean)=>void}}}

// Mini TrustBox: Trustpilot's fixed public template id for this widget style,
// the same for every business, not an account-specific value.
const TEMPLATE_ID="53aa8807dec7e10d38f59f32";

export function TrustpilotWidget(){
 const ref=useRef<HTMLDivElement>(null);
 const[consented,setConsented]=useState(()=>getCookieConsent()==="all");
 useEffect(()=>onCookieConsentChange(value=>setConsented(value==="all")),[]);
 useEffect(()=>{
  if(!BUSINESS_UNIT_ID||!consented)return;
  const scriptId="trustpilot-bootstrap";
  const init=()=>{if(ref.current&&window.Trustpilot)window.Trustpilot.loadFromElement(ref.current,true)};
  if(window.Trustpilot){init();return}
  if(document.getElementById(scriptId)){
   document.getElementById(scriptId)!.addEventListener("load",init,{once:true});
   return;
  }
  const script=document.createElement("script");
  script.id=scriptId;
  script.src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
  script.async=true;
  script.onload=init;
  document.body.appendChild(script);
 },[consented]);

 if(!BUSINESS_UNIT_ID||!consented)return null;

 return (
  <div
   className="trustpilot-widget"
   ref={ref}
   data-locale="en-GB"
   data-template-id={TEMPLATE_ID}
   data-businessunit-id={BUSINESS_UNIT_ID}
   data-style-height="24px"
   data-style-width="100%"
   data-theme="light"
  >
   <a href={REVIEW_URL||"https://www.trustpilot.com"} target="_blank" rel="noopener noreferrer">Trustpilot</a>
  </div>
 );
}
