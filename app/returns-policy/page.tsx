import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {DraftNotice} from "@/components/draft-notice";

export const metadata: Metadata={
 title:"Returns & complaints · Franklyn's Baby Supplies",
 description:"Our returns, exchange and complaints policy, including your legal right to cancel a distance sale.",
};

export default function ReturnsPolicyPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">RETURNS &amp; COMPLAINTS</p>
    <h1>Changed your mind, or something's wrong?</h1>
    <p className="legal-lead">Start a return any time from the "Returns &amp; replacements" link in the footer. You'll need your order number and the email address you checked out with.</p>
    <DraftNotice/>

    <h2>Your right to cancel</h2>
    <p>As an online (distance) sale, you have a legal right to cancel your order within <strong>14 days</strong> of receiving it, without giving a reason, under the Consumer Contracts Regulations 2013. Once you've told us you're cancelling, you then have a further <strong>14 days</strong> to send the item back to us.</p>

    <h2>Condition of returned goods</h2>
    <p>Items should be returned unused, in their original packaging where possible, and in a condition that lets us resell or restock them. Perishable or opened food and toiletry items can't be returned once opened, for hygiene reasons, unless faulty.</p>

    <h2>Who pays for return postage</h2>
    <p>You're responsible for the cost of returning an item unless it arrived faulty, damaged or wasn't what you ordered: in those cases we'll cover it or arrange collection.</p>

    <h2>Refunds</h2>
    <p>Once we've received and checked the returned item, we'll refund you within 14 days to your original payment method. We may make a deduction if the item's value has been reduced by handling beyond what's needed to check it.</p>

    <h2>Exchanges</h2>
    <p>Prefer a swap over a refund? Choose "Exchange" when you start your return and tell us what you'd like instead; we'll confirm availability by email.</p>

    <h2>Hire items</h2>
    <p>Prams, car seats and other hire items are inspected at the start and end of every hire period. Fair wear and tear is expected; damage beyond that may be charged for. Full hire terms (deposits, inspection process) are confirmed before a hire booking is finalised.</p>

    <h2>Complaints</h2>
    <p>If something's gone wrong that isn't covered above (a delivery issue, a billing question, anything else), email us and we'll aim to resolve it within 5 working days. If you're not happy with how we've handled a complaint, you can also refer it to an independent alternative dispute resolution (ADR) provider.</p>
    <p className="legal-contact">Email: <a href="mailto:hello@franklynsbabysupplies.co.uk">hello@franklynsbabysupplies.co.uk</a></p>
   </main>
   <StaticFooter/>
  </div>
 );
}
