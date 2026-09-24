"use client";

import {useState} from "react";
import {ArrowRight,RotateCcw,CircleCheck} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";

type OrderItem={id:number;orderId:number;productName:string;unitPriceCents:number;quantity:number};
type Order={id:number;customerEmail:string|null};

const REASONS=["No longer needed","Arrived faulty or damaged","Wrong item received","Changed my mind","Other"];

function money(cents:number){return `£${(cents/100).toFixed(2)}`}

export function ReturnsWizard({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
 const[step,setStep]=useState(0);
 const[orderId,setOrderId]=useState("");
 const[email,setEmail]=useState("");
 const[lookupError,setLookupError]=useState("");
 const[lookingUp,setLookingUp]=useState(false);
 const[order,setOrder]=useState<Order|null>(null);
 const[orderItems,setOrderItems]=useState<OrderItem[]>([]);
 const[selectedItemId,setSelectedItemId]=useState<number|null>(null);
 const[reason,setReason]=useState("");
 const[details,setDetails]=useState("");
 const[resolution,setResolution]=useState<"refund"|"exchange">("refund");
 const[submitting,setSubmitting]=useState(false);
 const[submitError,setSubmitError]=useState("");
 const[referenceId,setReferenceId]=useState<number|null>(null);

 function reset(){
  setStep(0);setOrderId("");setEmail("");setLookupError("");setOrder(null);setOrderItems([]);
  setSelectedItemId(null);setReason("");setDetails("");setResolution("refund");setSubmitError("");setReferenceId(null);
 }

 function close(){onOpenChange(false);setTimeout(reset,300)}

 async function lookupOrder(){
  if(lookingUp)return;
  setLookupError("");
  setLookingUp(true);
  try{
   const res=await fetch(`/api/orders/lookup?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
   const data=await res.json() as {order?:Order;items?:OrderItem[];error?:string};
   if(!res.ok||!data.order){setLookupError(data.error||"Order not found.");setLookingUp(false);return}
   setOrder(data.order);setOrderItems(data.items||[]);setStep(1);
  }catch{
   setLookupError("Something went wrong looking that up. Try again.");
  }finally{
   setLookingUp(false);
  }
 }

 async function submitReturn(){
  if(submitting||!order||!selectedItemId||!reason)return;
  setSubmitting(true);setSubmitError("");
  try{
   const res=await fetch("/api/returns",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({orderId:order.id,orderItemId:selectedItemId,email,reason,details,resolution})});
   const data=await res.json() as {returnRequest?:{id:number};error?:string};
   if(!res.ok||!data.returnRequest){setSubmitError(data.error||"Couldn't submit that. Try again.");setSubmitting(false);return}
   setReferenceId(data.returnRequest.id);setStep(3);
  }catch{
   setSubmitError("Something went wrong. Try again.");
  }finally{
   setSubmitting(false);
  }
 }

 const selectedItem=orderItems.find(i=>i.id===selectedItemId)||null;

 return (
  <Dialog open={open} onOpenChange={o=>{if(!o)close()}}>
   <DialogContent className="returns-dialog">
    <DialogHeader>
     <p className="kicker"><RotateCcw size={14}/> RETURNS & REPLACEMENTS</p>
     <DialogTitle>
      {step===0&&"Find your order"}
      {step===1&&"Which item?"}
      {step===2&&"Tell us why"}
      {step===3&&"Request received"}
     </DialogTitle>
     <DialogDescription>
      {step===0&&"Enter the order number and email you checked out with."}
      {step===1&&"Choose the item you'd like to return or exchange."}
      {step===2&&"A reason and whether you'd like a refund or exchange."}
      {step===3&&"We'll be in touch by email to arrange collection."}
     </DialogDescription>
    </DialogHeader>

    {step===0&&<div className="returns-step">
     <label>Order number<input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="e.g. 42" inputMode="numeric"/></label>
     <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/></label>
     {lookupError&&<p className="returns-error">{lookupError}</p>}
     <button className="detail-add" disabled={!orderId||!email||lookingUp} onClick={lookupOrder}>{lookingUp?"Looking up…":"Find my order"} <ArrowRight size={17}/></button>
    </div>}

    {step===1&&<div className="returns-step">
     <div className="returns-items">
      {orderItems.map(item=>
       <button key={item.id} className={`returns-item${selectedItemId===item.id?" selected-choice":""}`} onClick={()=>setSelectedItemId(item.id)}>
        <span>{item.productName} × {item.quantity}</span><b>{money(item.unitPriceCents*item.quantity)}</b>
       </button>
      )}
     </div>
     <button className="detail-add" disabled={!selectedItemId} onClick={()=>setStep(2)}>Continue <ArrowRight size={17}/></button>
    </div>}

    {step===2&&<div className="returns-step">
     {selectedItem&&<p className="returns-selected">Returning: <b>{selectedItem.productName}</b></p>}
     <label>Reason
      <select value={reason} onChange={e=>setReason(e.target.value)}>
       <option value="">Choose a reason…</option>
       {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
      </select>
     </label>
     <label>Details (optional)<textarea value={details} onChange={e=>setDetails(e.target.value)} rows={3} placeholder="Anything else that would help us."/></label>
     <div className="returns-resolution">
      <button className={`wizard-choice${resolution==="refund"?" selected":""}`} onClick={()=>setResolution("refund")}>Refund</button>
      <button className={`wizard-choice${resolution==="exchange"?" selected":""}`} onClick={()=>setResolution("exchange")}>Exchange</button>
     </div>
     {submitError&&<p className="returns-error">{submitError}</p>}
     <button className="detail-add" disabled={!reason||submitting} onClick={submitReturn}>{submitting?"Sending…":"Submit request"} <ArrowRight size={17}/></button>
    </div>}

    {step===3&&<div className="returns-step returns-confirm">
     <CircleCheck size={40}/>
     <p>Reference <b>#{referenceId}</b>. We've noted your {resolution} request for {selectedItem?.productName}.</p>
     <button className="detail-add" onClick={close}>Done <ArrowRight size={17}/></button>
    </div>}
   </DialogContent>
  </Dialog>
 );
}
