import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";

export const metadata: Metadata={
 title:"FAQs · Franklyn's Baby Supplies",
 description:"Answers to common questions about ordering, delivery, repeat boxes, hire and returns at Franklyn's Baby Supplies.",
};

const FAQS=[
 {q:"How does delivery work?",a:"Enter your postcode at checkout or on the delivery preview to see sample time slots. If you're within Franklyn's own delivery area (London, Hertfordshire and Bedfordshire, inside the M25), he'll often deliver it himself; everywhere else in the UK goes out with a courier partner. You'll never need to choose between the two: you just pick a day and time that suits you."},
 {q:"Is slot booking guaranteed?",a:"Not yet. Selecting a delivery window today shows you what a real booking calendar will look like, but it doesn't reserve capacity. Your order and payment are real; the exact delivery time is confirmed separately once fulfilment is fully connected."},
 {q:"What's the difference between a one-off order, a repeat box and hire?",a:"A one-off order is a single purchase, delivered once. \"Repeat & top up\" puts everyday essentials like nappies and wipes on a schedule (every 2, 4 or 6 weeks) that you can skip or pause any time. \"Loved for a little while\" is a monthly hire plan for bigger items like prams and car seats, so you're not paying full price for something your little one will outgrow in months."},
 {q:"Do I need an account to order?",a:"No, checkout works as a guest; you just need a valid email address for your order confirmation and any returns."},
 {q:"How do I return or exchange something?",a:"Use \"Returns & replacements\" in the footer of any page. You'll need your order number and the email address you checked out with. See our full Returns & complaints policy for the details."},
 {q:"Is payment secure?",a:"Yes. Checkout and card payment are handled entirely by Stripe, a PCI-compliant payment provider used by millions of businesses. Franklyn's never sees or stores your card details."},
 {q:"Can I suggest a product you don't stock yet?",a:"Please do: use \"Suggest an idea\" in the footer. The most-voted suggestions directly shape what gets sourced next."},
];

export default function FaqPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page">
    <p className="kicker">FAQS</p>
    <h1>Questions, answered.</h1>
    <p className="legal-lead">The short version of everything below: real payment, real stock levels, illustrative delivery slots for now, and a real person behind every order.</p>
    <div className="faq-list">
     {FAQS.map(f=>
      <details key={f.q} className="faq-item">
       <summary>{f.q}</summary>
       <p>{f.a}</p>
      </details>
     )}
    </div>
   </main>
   <StaticFooter/>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity":FAQS.map(f=>({
     "@type":"Question",
     "name":f.q,
     "acceptedAnswer":{"@type":"Answer","text":f.a},
    })),
   })}}/>
  </div>
 );
}
