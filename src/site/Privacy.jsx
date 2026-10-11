import React,{useState,useSyncExternalStore} from 'react';
import {analyticsAllowed,setAnalyticsAllowed} from './analytics';
const subscribe=()=>()=>{};
export default function Privacy(){
  const saved=useSyncExternalStore(subscribe,analyticsAllowed,()=>true);
  const [choice,setAllowed]=useState(null);
  const allowed=choice??saved;
  const restricted=useSyncExternalStore(subscribe,()=>Boolean(navigator.globalPrivacyControl),()=>false);
  return <details className="site-privacy"><summary>Privacy</summary><p>This site uses Google Analytics on me.1sec.plus to understand which projects people explore and how well the site runs. Contact messages, hover activity and camera movements are not recorded. Advertising personalization is disabled.</p>{restricted?<p>Usage analytics is off, following your browser’s privacy preference.</p>:<button onClick={()=>{setAllowed(!allowed);setAnalyticsAllowed(!allowed);}}>{allowed?'Turn off usage analytics':'Enable usage analytics'}</button>}</details>;
}
