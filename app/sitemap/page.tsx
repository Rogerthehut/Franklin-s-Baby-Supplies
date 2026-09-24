import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {Home,ShoppingBasket,HelpCircle,RotateCcw,Lock,Cookie,FileText,Users} from "lucide-react";

export const metadata: Metadata={
 title:"Sitemap · Franklyn's Baby Supplies",
 description:"Every page on Franklyn's Baby Supplies, in one place.",
};

const SITEMAP_GROUPS=[
 {
  heading:"Shop",
  links:[
   {href:"/",label:"Home",description:"Nappies, feeding, clothing, prams and more.",icon:Home},
   {href:"/#catalogue",label:"Shop all products",description:"Jump straight to the full catalogue.",icon:ShoppingBasket},
  ],
 },
 {
  heading:"Community",
  links:[
   {href:"/forum",label:"Community forum",description:"Ask a question and swap notes with other parents.",icon:Users},
  ],
 },
 {
  heading:"Support & policies",
  links:[
   {href:"/faq",label:"FAQs",description:"Answers to common questions about delivery, repeat boxes and hire.",icon:HelpCircle},
   {href:"/returns-policy",label:"Returns & complaints",description:"Your right to cancel, and how refunds and exchanges work.",icon:RotateCcw},
   {href:"/privacy",label:"Privacy policy",description:"What we collect, and why.",icon:Lock},
   {href:"/cookies",label:"Cookies policy",description:"The short, honest list of cookies we use.",icon:Cookie},
   {href:"/terms",label:"Terms of use",description:"The plain terms for shopping with us.",icon:FileText},
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
      <div className="sitemap-grid">
       {g.links.map(l=>
        <a key={l.href} href={l.href} className="sitemap-card">
         <span className="sitemap-icon"><l.icon size={20}/></span>
         <span><b>{l.label}</b><small>{l.description}</small></span>
        </a>
       )}
      </div>
     </div>
    )}
   </main>
   <StaticFooter/>
  </div>
 );
}
