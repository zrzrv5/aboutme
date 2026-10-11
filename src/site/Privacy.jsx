import React,{useState} from 'react';
import {analyticsAllowed,setAnalyticsAllowed} from './analytics';
export default function Privacy(){
  const [allowed,setAllowed]=useState(analyticsAllowed);
  const restricted=typeof navigator!=='undefined'&&navigator.globalPrivacyControl;
  return <details className="site-privacy"><summary>Privacy</summary><p>This site uses Google Analytics on me.1sec.plus to understand which projects people explore and how well the site runs. Contact messages, hover activity and camera movements are not recorded. Advertising personalization is disabled.</p>{restricted?<p>Usage analytics is off, following your browser’s privacy preference.</p>:<button onClick={()=>{setAllowed(!allowed);setAnalyticsAllowed(!allowed);}}>{allowed?'Turn off usage analytics':'Enable usage analytics'}</button>}</details>;
}
