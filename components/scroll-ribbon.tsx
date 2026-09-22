"use client";

import {useEffect,useRef} from "react";

export function ScrollRibbon(){
 const ribbon=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const distance=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
   const progress=Math.min(1,Math.max(0,window.scrollY/distance));
   ribbon.current?.style.setProperty("--ribbon-width",`${progress*100}%`);
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();
  window.addEventListener("scroll",queue,{passive:true});
  window.addEventListener("resize",queue);
  const observer=new ResizeObserver(queue);
  observer.observe(document.documentElement);
  return()=>{
   window.removeEventListener("scroll",queue);
   window.removeEventListener("resize",queue);
   observer.disconnect();
   if(frame)cancelAnimationFrame(frame);
  };
 },[]);
 return <div className="scroll-ribbon" ref={ribbon} aria-hidden="true"><span className="scroll-ribbon-length"/></div>;
}
