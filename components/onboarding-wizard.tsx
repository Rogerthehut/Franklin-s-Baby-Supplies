"use client";

import {useState} from "react";
import {Baby,ArrowRight} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";

export type BabyProfile={stage:string;gender:string};

const STAGES=["Newborn","Infant","Toddler"];
const GENDERS=["Girl","Boy","Prefer not to say"];

export function OnboardingWizard({open,onOpenChange,onComplete}:{open:boolean;onOpenChange:(open:boolean)=>void;onComplete:(profile:BabyProfile)=>void}){
 const[step,setStep]=useState(0);
 const[stage,setStage]=useState("");
 const[gender,setGender]=useState("");

 function finish(profile:BabyProfile|null){
  onOpenChange(false);
  if(profile)onComplete(profile);
  setTimeout(()=>{setStep(0);setStage("");setGender("")},300);
 }

 return (
  <Dialog open={open} onOpenChange={o=>{if(!o)finish(null)}}>
   <DialogContent className="onboarding-dialog">
    <DialogHeader>
     <p className="kicker"><Baby size={14}/> A QUICK HELLO</p>
     <DialogTitle>{step===0?"What stage is your little one at?":"And are they a…"}</DialogTitle>
     <DialogDescription>We'll tailor the shop to their stage, nothing else. Skip any time.</DialogDescription>
    </DialogHeader>
    <div className="onboarding-progress"><span className={step>=0?"filled":""}/><span className={step>=1?"filled":""}/></div>
    {step===0?
     <div className="onboarding-choices">
      {STAGES.map(s=><button key={s} className={`wizard-choice${stage===s?" selected":""}`} onClick={()=>{setStage(s);setStep(1)}}>{s}</button>)}
     </div>
     :
     <div className="onboarding-choices">
      {GENDERS.map(g=><button key={g} className={`wizard-choice${gender===g?" selected":""}`} onClick={()=>{setGender(g);finish({stage,gender:g})}}>{g}</button>)}
     </div>
    }
    <div className="onboarding-actions">
     {step===1&&<button className="onboarding-back" onClick={()=>setStep(0)}>Back</button>}
     <button className="onboarding-skip" onClick={()=>finish(null)}>Skip for now <ArrowRight size={14}/></button>
    </div>
   </DialogContent>
  </Dialog>
 );
}
