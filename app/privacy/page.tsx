import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {DraftNotice} from "@/components/draft-notice";

export const metadata: Metadata={
 title:"Privacy policy · Franklyn's Baby Supplies",
 description:"How Franklyn's Baby Supplies collects, uses and protects your personal data.",
};

export default function PrivacyPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">PRIVACY POLICY</p>
    <h1>What we collect, and why.</h1>
    <p className="legal-lead">[COMPANY NAME] ("we", "us") is the data controller for personal data collected through this site. This policy explains what we collect, why, and your rights over it, under UK GDPR and the Data Protection Act 2018.</p>
    <DraftNotice/>

    <h2>What we collect</h2>
    <ul>
     <li><strong>Order details:</strong> name, delivery address, email and payment information, collected during checkout. Card details are entered directly into Stripe and never reach our own systems.</li>
     <li><strong>Delivery preferences:</strong> the postcode and delivery slot you choose, used to route your order to the right fulfilment method.</li>
     <li><strong>Returns requests:</strong> your order number, email and the reason you give when starting a return.</li>
     <li><strong>Product suggestions:</strong> the idea, any details, and an email address if you give one when suggesting or voting on a product idea.</li>
     <li><strong>Baby profile:</strong> the stage and gender you select during onboarding is stored only in your own browser, to personalise the catalogue. It's never sent to our servers.</li>
    </ul>

    <h2>Why we use it, and our legal basis</h2>
    <p>We process order and delivery data to fulfil a contract with you (taking and delivering your order). We process returns and complaint data for the same reason, and to meet our legal obligations under consumer protection law. Product suggestions are processed with your consent, on the basis of our legitimate interest in improving what we stock.</p>

    <h2>Who we share it with</h2>
    <p>We share what's needed to fulfil your order with: Stripe, our payment processor, for taking payment; our courier partner, for deliveries outside Franklyn's own delivery area; and Trustpilot, if enabled, for collecting your review after an order (only your email, and only if you agree at the time).</p>

    <h2>How long we keep it</h2>
    <p>We keep order records for as long as required by UK tax law (currently 6 years), and other data (returns requests, product suggestions) for as long as it's relevant, or until you ask us to delete it.</p>

    <h2>International transfers</h2>
    <p>Stripe may process payment data outside the UK. Where that happens, it's covered by Stripe's own standard contractual clauses and adequacy protections.</p>

    <h2>Your rights</h2>
    <p>You can ask us to access, correct, delete or export your personal data, or to stop processing it, at any time. Contact us using the details below. If you're not satisfied with our response, you can complain to the Information Commissioner's Office (ico.org.uk).</p>

    <h2>Cookies</h2>
    <p>Details of what's stored in your browser are in our <a href="/cookies">cookies policy</a>.</p>

    <p className="legal-contact">Contact: <a href="mailto:hello@franklynsbabysupplies.co.uk">hello@franklynsbabysupplies.co.uk</a>, [REGISTERED ADDRESS]</p>
   </main>
   <StaticFooter/>
  </div>
 );
}
