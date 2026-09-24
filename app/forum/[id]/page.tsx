import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {ForumThread} from "@/components/forum-thread";

export const metadata: Metadata={
 title:"Forum topic · Franklyn's Baby Supplies",
 description:"A community forum topic on Franklyn's Baby Supplies.",
};

export default async function ForumThreadPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page forum-main">
    <ForumThread id={Number(id)}/>
   </main>
   <StaticFooter/>
  </div>
 );
}
