import React,{useState,useSyncExternalStore} from 'react';
import {analyticsAllowed,setAnalyticsAllowed} from './analytics';
const subscribe=()=>()=>{};
// One plain sentence, always visible, with the switch inside it.
export default function Privacy(){
  const saved=useSyncExternalStore(subscribe,analyticsAllowed,()=>true);
  const [choice,setAllowed]=useState(null);
  const allowed=choice??saved;
  const restricted=useSyncExternalStore(subscribe,()=>Boolean(navigator.globalPrivacyControl),()=>false);
  const toggle=()=>{setAllowed(!allowed);setAnalyticsAllowed(!allowed);};
  if(restricted)return <p className="site-privacy">Usage analytics is off, following your browser’s privacy preference.</p>;
  if(!allowed)return <p className="site-privacy">Usage analytics is off in this browser. <button type="button" onClick={toggle}>Turn it back on</button>.</p>;
  return <p className="site-privacy">Google Analytics on me.1sec.plus counts which projects get explored and how well the site runs. No messages, hover trails or camera moves are recorded, and ad personalization is off. Prefer not to be counted? <button type="button" onClick={toggle}>Turn it off</button>.</p>;
}
