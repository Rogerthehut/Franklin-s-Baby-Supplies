"use client";

import {useEffect,useState} from "react";
import {MessageCircle,ArrowRight,Users} from "lucide-react";
import {FORUM_CATEGORIES} from "@/lib/forum-categories";
import {loadForumName,saveForumName} from "@/lib/forum-name";

type Thread={id:number;category:string;title:string;body:string;authorName:string;replyCount:number;createdAt:string};

function formatForumDate(iso:string){
 try{return new Date(iso.includes("T")?iso:`${iso}Z`).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch{return iso}
}

export function ForumBoard(){
 const[category,setCategory]=useState<string>("All");
 const[threads,setThreads]=useState<Thread[]>([]);
 const[loading,setLoading]=useState(true);
 const[formOpen,setFormOpen]=useState(false);
 const[name,setName]=useState("");
 const[newCategory,setNewCategory]=useState<string>(FORUM_CATEGORIES[0]);
 const[title,setTitle]=useState("");
 const[body,setBody]=useState("");
 const[submitting,setSubmitting]=useState(false);
 const[formError,setFormError]=useState("");

 useEffect(()=>{setName(loadForumName())},[]);

 useEffect(()=>{
  setLoading(true);
  const url=category==="All"?"/api/forum/threads":`/api/forum/threads?category=${encodeURIComponent(category)}`;
  fetch(url).then(r=>r.json() as Promise<{threads?:Thread[]}>).then(d=>{setThreads(d.threads||[]);setLoading(false)}).catch(()=>setLoading(false));
 },[category]);

 async function submit(){
  if(submitting||!name.trim()||!title.trim()||!body.trim())return;
  setSubmitting(true);setFormError("");
  saveForumName(name.trim());
  try{
   const res=await fetch("/api/forum/threads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({category:newCategory,title:title.trim(),body:body.trim(),authorName:name.trim()})});
   const data=await res.json() as {thread?:Thread;error?:string};
   if(!res.ok||!data.thread){setFormError(data.error||"Couldn't post that. Try again.");setSubmitting(false);return}
   setThreads(old=>category==="All"||category===data.thread!.category?[data.thread!,...old]:old);
   setTitle("");setBody("");setFormOpen(false);
  }catch{
   setFormError("Something went wrong. Try again.");
  }finally{
   setSubmitting(false);
  }
 }

 return (
  <section className="forum-page">
   <p className="kicker"><Users size={14}/> PARENTS TALKING TO PARENTS</p>
   <h1>The community forum.</h1>
   <p className="legal-lead">Ask a question, share what worked and swap notes with other Franklyn's parents.</p>
   <div className="forum-filters" role="group" aria-label="Filter by category">
    <button className={category==="All"?"selected":""} onClick={()=>setCategory("All")}>All topics</button>
    {FORUM_CATEGORIES.map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}</button>)}
   </div>
   {!formOpen?
    <button className="forum-start" onClick={()=>setFormOpen(true)}>Start a new topic <ArrowRight size={17}/></button>
   :
    <div className="forum-form">
     <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="How should we show your name?" maxLength={60}/></label>
     <label>Category<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{FORUM_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
     <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What's your topic?" maxLength={120}/></label>
     <label>Your post<textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="Share the details…"/></label>
     {formError&&<p className="returns-error">{formError}</p>}
     <div className="forum-form-actions">
      <button onClick={()=>setFormOpen(false)}>Cancel</button>
      <button className="detail-add" disabled={!name.trim()||!title.trim()||!body.trim()||submitting} onClick={submit}>{submitting?"Posting…":"Post topic"} <ArrowRight size={17}/></button>
     </div>
    </div>
   }
   <div className="forum-list">
    {loading&&<p className="forum-empty">Loading topics…</p>}
    {!loading&&!threads.length&&<p className="forum-empty">No topics here yet — be the first to start one.</p>}
    {threads.map(t=>
     <a className="forum-row" href={`/forum/${t.id}`} key={t.id}>
      <div>
       <span className="forum-category-pill">{t.category}</span>
       <strong>{t.title}</strong>
       <small>{t.authorName} · {formatForumDate(t.createdAt)}</small>
      </div>
      <span className="forum-reply-count"><MessageCircle size={15}/> {t.replyCount}</span>
     </a>
    )}
   </div>
  </section>
 );
}
