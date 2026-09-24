"use client";

import {useEffect,useState} from "react";
import {ArrowUp,Lightbulb,ArrowRight} from "lucide-react";

type Idea={id:number;title:string;details:string;votes:number;createdAt:string};

const VOTED_KEY="franklynsVotedIdeaIds";

function loadVoted():number[]{
 try{const raw=localStorage.getItem(VOTED_KEY);return raw?JSON.parse(raw):[]}catch{return []}
}
function saveVoted(ids:number[]){
 try{localStorage.setItem(VOTED_KEY,JSON.stringify(ids))}catch{}
}

export function FeedbackBoard(){
 const[ideas,setIdeas]=useState<Idea[]>([]);
 const[loading,setLoading]=useState(true);
 const[votedIds,setVotedIds]=useState<number[]>([]);
 const[title,setTitle]=useState("");
 const[details,setDetails]=useState("");
 const[submitting,setSubmitting]=useState(false);
 const[formError,setFormError]=useState("");

 useEffect(()=>{
  setVotedIds(loadVoted());
  fetch("/api/feedback").then(r=>r.json() as Promise<{ideas?:Idea[]}>).then(d=>{setIdeas(d.ideas||[]);setLoading(false)}).catch(()=>setLoading(false));
 },[]);

 async function vote(idea:Idea){
  const already=votedIds.includes(idea.id);
  const direction=already?"down":"up";
  setIdeas(old=>old.map(i=>i.id===idea.id?{...i,votes:Math.max(0,i.votes+(already?-1:1))}:i));
  const nextVoted=already?votedIds.filter(id=>id!==idea.id):[...votedIds,idea.id];
  setVotedIds(nextVoted);saveVoted(nextVoted);
  try{
   await fetch(`/api/feedback/${idea.id}/vote`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({direction})});
  }catch{}
 }

 async function submit(){
  if(submitting||!title.trim())return;
  setSubmitting(true);setFormError("");
  try{
   const res=await fetch("/api/feedback",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:title.trim(),details:details.trim()})});
   const data=await res.json() as {idea?:Idea;error?:string};
   if(!res.ok||!data.idea){setFormError(data.error||"Couldn't submit that. Try again.");setSubmitting(false);return}
   setIdeas(old=>[data.idea!,...old]);setTitle("");setDetails("");
  }catch{
   setFormError("Something went wrong. Try again.");
  }finally{
   setSubmitting(false);
  }
 }

 return (
  <section className="feedback-page">
   <div className="feedback-heading">
    <p className="kicker"><Lightbulb size={14}/> WHAT SHOULD WE STOCK NEXT</p>
    <h1>Your ideas, please.</h1>
    <p>Tell us what you're after and vote up other parents' suggestions. The most-loved ideas shape what we bring in next.</p>
   </div>
   <div className="feedback-form">
    <label>Your idea<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Organic weaning spoons" maxLength={120}/></label>
    <label>Details (optional)<textarea value={details} onChange={e=>setDetails(e.target.value)} rows={2} placeholder="A brand, a size, why it'd help…"/></label>
    {formError&&<p className="returns-error">{formError}</p>}
    <button className="detail-add" disabled={!title.trim()||submitting} onClick={submit}>{submitting?"Sending…":"Suggest it"} <ArrowRight size={17}/></button>
   </div>
   <div className="feedback-list">
    {loading&&<p className="feedback-empty">Loading ideas…</p>}
    {!loading&&!ideas.length&&<p className="feedback-empty">No ideas yet — be the first to suggest something.</p>}
    {ideas.map(idea=>
     <div className="feedback-row" key={idea.id}>
      <button className={`feedback-vote${votedIds.includes(idea.id)?" voted":""}`} onClick={()=>vote(idea)} aria-label={votedIds.includes(idea.id)?"Remove your vote":"Vote for this idea"}>
       <ArrowUp size={16}/><b>{idea.votes}</b>
      </button>
      <div><strong>{idea.title}</strong>{idea.details&&<p>{idea.details}</p>}</div>
     </div>
    )}
   </div>
  </section>
 );
}
