import {ArrowLeft} from "lucide-react";

const LEGAL_LINKS=[
 {href:"/faq",label:"FAQs"},
 {href:"/returns-policy",label:"Returns"},
 {href:"/privacy",label:"Privacy policy"},
 {href:"/cookies",label:"Cookies policy"},
 {href:"/terms",label:"Terms of use"},
 {href:"/sitemap",label:"Sitemap"},
];

export function StaticHeader(){
 return (
  <header className="static-header">
   <a href="/" className="wordmark" aria-label="Franklyn's Baby Supplies home">
    <span className="wordmark-icon">f<span>·</span></span>
    <span>Franklyn's <span className="wordmark-sub">Baby Supplies</span></span>
   </a>
   <a href="/" className="static-back"><ArrowLeft size={15}/> Back to shop</a>
  </header>
 );
}

export function StaticFooter(){
 return (
  <footer className="static-footer">
   <nav aria-label="Legal and support">
    {LEGAL_LINKS.map(l=><a key={l.href} href={l.href}>{l.label}</a>)}
   </nav>
   <small>Baby Supplies Business Mock-up · Concept Two</small>
  </footer>
 );
}
