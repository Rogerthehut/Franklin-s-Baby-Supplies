"use client";

import {useEffect,useState} from "react";
import {ArrowLeft,ArrowRight} from "lucide-react";
import {loadForumName,saveForumName} from "@/lib/forum-name";

type Thread={id:number;category:string;title:string;body:string;authorName:string;replyCount:number;createdAt:string};
type Reply={id:number;threadId:number;body:string;authorName:string;createdAt:string};

function formatForumDate(iso:string){
 try{return new Date(iso.includes("T")?iso:`${iso}Z`).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch{return iso}
}

export function ForumThread({id}:{id:number}){
 const[thread,setThread]=useState<Thread|null>(null);
 const[replies,setReplies]=useState<Reply[]>([]);
 const[loading,setLoading]=useState(true);
 const[notFound,setNotFound]=useState(false);
 const[name,setName]=useState("");
 const[body,setBody]=useState("");
 const[submitting,setSubmitting]=useState(false);
 const[formError,setFormError]=useState("");

 useEffect(()=>{
  setName(loadForumName());
  fetch(`/api/forum/threads/${id}`).then(r=>{if(!r.ok)throw new Error("not found");return r.json() as Promise<{thread?:Thread;replies?:Reply[]}>}).then(d=>{setThread(d.thread||null);setReplies(d.replies||[]);setLoading(false)}).catch(()=>{setNotFound(true);setLoading(false)});
 },[id]);

 async function submit(){
  if(submitting||!name.trim()||!body.trim())return;
  setSubmitting(true);setFormError("");
  saveForumName(name.trim());
  try{
   const res=await fetch(`/api/forum/threads/${id}/replies`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({body:body.trim(),authorName:name.trim()})});
   const data=await res.json() as {reply?:Reply;error?:string};
   if(!res.ok||!data.reply){setFormError(data.error||"Couldn't post that. Try again.");setSubmitting(false);return}
   setReplies(old=>[...old,data.reply!]);
   setThread(old=>old?{...old,replyCount:old.replyCount+1}:old);
   setBody("");
  }catch{
   setFormError("Something went wrong. Try again.");
  }finally{
   setSubmitting(false);
  }
 }

 if(loading)return <section className="forum-page"><p className="forum-empty">Loading topic…</p></section>;
 if(notFound||!thread)return (
  <section className="forum-page">
   <p className="forum-empty">That topic couldn't be found.</p>
   <a className="forum-back" href="/forum"><ArrowLeft size={15}/> Back to the forum</a>
  </section>
 );

 return (
  <section className="forum-page">
   <a className="forum-back" href="/forum"><ArrowLeft size={15}/> Back to the forum</a>
   <div className="forum-thread-header">
    <span className="forum-category-pill">{thread.category}</span>
    <h1>{thread.title}</h1>
    <small>{thread.authorName} · {formatForumDate(thread.createdAt)}</small>
    <p>{thread.body}</p>
   </div>
   <div className="forum-replies">
    <h2>{replies.length?`${replies.length} ${replies.length===1?"reply":"replies"}`:"No replies yet"}</h2>
    {replies.map(r=>
     <div className="forum-reply" key={r.id}>
      <strong>{r.authorName}</strong><small>{formatForumDate(r.createdAt)}</small>
      <p>{r.body}</p>
     </div>
    )}
   </div>
   <div className="forum-form">
    <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="How should we show your name?" maxLength={60}/></label>
    <label>Your reply<textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Add to the conversation…"/></label>
    {formError&&<p className="returns-error">{formError}</p>}
    <button className="detail-add" disabled={!name.trim()||!body.trim()||submitting} onClick={submit}>{submitting?"Posting…":"Post reply"} <ArrowRight size={17}/></button>
   </div>
  </section>
 );
}
