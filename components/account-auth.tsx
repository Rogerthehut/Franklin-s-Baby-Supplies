"use client";

import {useState} from "react";
import {ArrowRight} from "lucide-react";

type Customer={id:number;email:string;name:string|null};

export function AccountAuth({onAuthed}:{onAuthed:(customer:Customer)=>void}){
 const[mode,setMode]=useState<"login"|"signup">("login");
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[name,setName]=useState("");
 const[error,setError]=useState("");
 const[submitting,setSubmitting]=useState(false);

 async function submit(){
  if(submitting||!email.trim()||!password)return;
  setSubmitting(true);setError("");
  try{
   const res=await fetch(mode==="login"?"/api/account/login":"/api/account/signup",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(mode==="login"?{email:email.trim(),password}:{email:email.trim(),password,name:name.trim()}),
   });
   const data=await res.json() as {customer?:Customer;error?:string};
   if(!res.ok||!data.customer){setError(data.error||"Something went wrong. Try again.");setSubmitting(false);return}
   onAuthed(data.customer);
  }catch{
   setError("Something went wrong. Try again.");
  }finally{
   setSubmitting(false);
  }
 }

 const passwordOk=mode==="login"?password.length>0:password.length>=8;

 return (
  <div className="account-auth">
   <p className="kicker">{mode==="login"?"SIGN IN":"CREATE AN ACCOUNT"}</p>
   <h1>{mode==="login"?"Welcome back.":"Save your favourites, faster next time."}</h1>
   <p>{mode==="login"?"Sign in to see your favourites, resume your basket and view past orders.":"Your basket and favourites will be here whenever you come back, on any device."}</p>
   <div className="account-auth-form" onKeyDown={e=>{if(e.key==="Enter")submit()}}>
    {mode==="signup"&&<label>Name (optional)<input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?"/></label>}
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==="signup"?"At least 8 characters":"Your password"} autoComplete={mode==="login"?"current-password":"new-password"}/></label>
    {error&&<p className="returns-error">{error}</p>}
    <button className="detail-add" disabled={submitting||!email.trim()||!passwordOk} onClick={submit}>{submitting?"Please wait…":mode==="login"?"Sign in":"Create account"} <ArrowRight size={17}/></button>
   </div>
   <button className="account-auth-switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button>
   <p className="account-auth-guest">You don't need an account to shop; guest checkout is always available.</p>
  </div>
 );
}
