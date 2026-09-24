import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {DraftNotice} from "@/components/draft-notice";

export const metadata: Metadata={
 title:"Terms of use · Franklyn's Baby Supplies",
 description:"The terms and conditions for using this site and buying from Franklyn's Baby Supplies.",
};

export default function TermsPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">TERMS OF USE</p>
    <h1>The short, plain version.</h1>
    <p className="legal-lead">These terms apply whenever you use this site or place an order with [COMPANY NAME] ("we", "us"). By ordering, you're agreeing to them.</p>
    <DraftNotice/>

    <h2>Orders and contract formation</h2>
    <p>Adding an item to your basket doesn't create a contract. A contract is formed once we've taken payment and confirmed your order by email. We reserve the right to decline an order, for example if an item is out of stock after all.</p>

    <h2>Pricing and payment</h2>
    <p>All prices are shown in GBP and include VAT where applicable. Payment is taken in full at checkout via Stripe. We take reasonable care to make sure prices are correct, but if a pricing error is obvious, we'll contact you before dispatching rather than honour the incorrect price.</p>

    <h2>Delivery</h2>
    <p>We deliver within London, Hertfordshire and Bedfordshire (inside the M25) using our own delivery, and elsewhere in the UK via a courier partner; you'll only ever be asked to choose a delivery slot, not the delivery method. Delivery windows shown before fulfilment is fully connected are illustrative and don't constitute a reserved booking.</p>

    <h2>Cancellations and returns</h2>
    <p>Your right to cancel and return an order is set out in full in our <a href="/returns-policy">returns &amp; complaints policy</a>, which forms part of these terms.</p>

    <h2>Repeat deliveries</h2>
    <p>Repeat & top up boxes can be paused, skipped or cancelled at any time before the relevant cut-off shown at checkout. Each delivery in a repeat plan is charged and confirmed individually.</p>

    <h2>Hire items</h2>
    <p>Hire items (prams, car seats and similar) are supplied under a monthly rolling plan. A deposit, condition check and full hire terms are confirmed before a hire booking is finalised; these terms will be provided separately.</p>

    <h2>Product suggestions</h2>
    <p>Suggesting a product idea doesn't guarantee we'll stock it. We may use suggestions, without attribution, to inform what we source.</p>

    <h2>Liability</h2>
    <p>We're liable for losses you suffer as a foreseeable result of us breaking these terms or acting negligently, up to the value of your order. We don't exclude or limit liability for death or personal injury caused by our negligence, or for fraud.</p>

    <h2>Governing law</h2>
    <p>These terms are governed by the law of England and Wales, and any dispute will be handled by the courts of England and Wales.</p>

    <p className="legal-contact">Contact: <a href="mailto:hello@franklynsbabysupplies.co.uk">hello@franklynsbabysupplies.co.uk</a>, [REGISTERED ADDRESS]</p>
   </main>
   <StaticFooter/>
  </div>
 );
}
