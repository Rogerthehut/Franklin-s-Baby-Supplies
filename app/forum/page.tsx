import type {Metadata} from "next";
import {StaticHeader,StaticFooter} from "@/components/static-page-chrome";
import {ForumBoard} from "@/components/forum-board";

export const metadata: Metadata={
 title:"Community forum · Franklyn's Baby Supplies",
 description:"Ask a question, share what worked and swap notes with other Franklyn's parents.",
};

export default function ForumPage(){
 return (
  <div className="static-page">
   <StaticHeader/>
   <main className="legal-page forum-main">
    <ForumBoard/>
   </main>
   <StaticFooter/>
  </div>
 );
}
