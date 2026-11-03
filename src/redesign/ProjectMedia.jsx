import React, {useEffect, useId, useRef, useState} from 'react';
import { ArrowUpRight } from 'lucide-react';
import { track } from '../site/analytics';
import './project-media.css';

const KINDS={
  video:{open:title=>`Play the ${title} demo video`,label:'Watch the demo',close:'Close video'},
  screenshots:{open:title=>`View ${title} screenshots`,label:'View screenshots',close:'Close screenshots'},
  figure:{open:title=>`Enlarge the ${title} figure`,label:null,close:'Close figure'},
};

// label overrides the visible text under the preview; null hides it (figures carry their own caption).
export default function ProjectMedia({media, title, projectId, label}) {
  const [open,setOpen]=useState(false);
  const dialog=useRef(null);
  const heading=useId();
  useEffect(()=>{
    if(!dialog.current)return;
    if(open) dialog.current.showModal();
    else dialog.current.close();
  },[open]);
  if(!media)return null;
  const kind=KINDS[media.video?'video':media.kind??'screenshots'];
  const text=label===undefined?kind.label:label;
  const size=media.width?{width:media.width,height:media.height,style:{aspectRatio:`${media.width}/${media.height}`}}:{width:600,height:300};
  return <div className={`project-media${media.kind?` project-media-${media.kind}`:''}`}>
    <button className="project-media-preview" aria-haspopup="dialog" aria-label={kind.open(title)} onClick={()=>{setOpen(true);track('media_open',{project_id:projectId??title});}}>
      <img src={media.preview} srcSet={media.width?undefined:`${media.preview} 1x, ${media.src} 2x`} {...size} alt={media.alt} loading="lazy" decoding="async"/>
      {text?<span>{text} <span aria-hidden="true"><ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></span></span>:null}
    </button>
    <dialog className="project-media-dialog" ref={dialog} aria-labelledby={heading} onClose={()=>setOpen(false)} onClick={event=>{
      if(event.target!==event.currentTarget)return;
      const box=event.currentTarget.getBoundingClientRect();
      if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)setOpen(false);
    }}>
      <header><h2 id={heading}>{title}</h2><button type="button" onClick={()=>setOpen(false)} aria-label={kind.close}>Close ×</button></header>
      {open?media.video?<video src={media.video} poster={media.src} controls autoPlay muted playsInline aria-label={media.alt}/>:<img src={media.src} alt={media.alt} decoding="async"/>:null}
      {media.credit?<p className="project-media-credit">{media.credit}</p>:null}
    </dialog>
  </div>;
}
