import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";

export const metadata: Metadata={
 title:"Sitemap · Franklyn's Baby Supplies",
 description:"Every page on Franklyn's Baby Supplies, in one place.",
};

const SITEMAP_GROUPS=[
 {
  heading:"Shop",
  links:[
   {href:"/",label:"Home"},
   {href:"/#catalogue",label:"Shop all products"},
  ],
 },
 {
  heading:"Support & policies",
  links:[
   {href:"/faq",label:"FAQs"},
   {href:"/returns-policy",label:"Returns & complaints"},
   {href:"/privacy",label:"Privacy policy"},
   {href:"/cookies",label:"Cookies policy"},
   {href:"/terms",label:"Terms of use"},
  ],
 },
];

export default function SitemapPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">SITEMAP</p>
    <h1>Find your way around.</h1>
    <p className="legal-lead">Every page on the site, grouped and linked below. There's also a machine-readable version at <a href="/sitemap.xml">/sitemap.xml</a> for search engines.</p>
    {SITEMAP_GROUPS.map(g=>
     <div key={g.heading}>
      <h2>{g.heading}</h2>
      <ul>
       {g.links.map(l=><li key={l.href}><a href={l.href}>{l.label}</a></li>)}
      </ul>
     </div>
    )}
   </main>
   <StaticFooter/>
  </div>
 );
}
