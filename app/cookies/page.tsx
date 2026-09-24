import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {DraftNotice} from "@/components/draft-notice";
import {CookiePreferences} from "@/components/cookie-preferences";

export const metadata: Metadata={
 title:"Cookies policy · Franklyn's Baby Supplies",
 description:"What cookies and similar technologies this site uses, and why.",
};

export default function CookiesPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">COOKIES POLICY</p>
    <h1>A short, honest list.</h1>
    <p className="legal-lead">This site keeps cookies and similar storage to a minimum. Here's everything it actually uses today.</p>
    <DraftNotice/>

    <h2>Strictly necessary</h2>
    <p>A small number of items are stored in your browser to make the site work: your basket contents, your wishlist, whether you've completed or skipped the welcome questions, and which product ideas you've voted for. These use your browser's local storage rather than cookies, aren't sent to any third party, and can't be switched off individually since the site wouldn't function without them. Clearing your browser's site data removes them.</p>

    <h2>Trustpilot reviews</h2>
    <p>When enabled, the Trustpilot widget in the footer loads a script from Trustpilot to display reviews and may set its own cookies. This only loads once Trustpilot is configured on this site; until then, no request is made to Trustpilot at all.</p>

    <h2>Analytics</h2>
    <p>This site doesn't currently use any analytics or advertising cookies. If that changes, this page will be updated first and, where required, you'll be asked for consent before anything loads.</p>

    <h2>Managing cookies</h2>
    <p>Most browsers let you block or delete cookies through their settings. Since this site currently sets none of its own, there's nothing to opt out of beyond the third-party Trustpilot script described above. You can also change your choice for this site any time below.</p>
    <CookiePreferences/>
    <p className="legal-contact">Questions about this policy? Email <a href="mailto:hello@franklynsbabysupplies.co.uk">hello@franklynsbabysupplies.co.uk</a></p>
   </main>
   <StaticFooter/>
  </div>
 );
}
