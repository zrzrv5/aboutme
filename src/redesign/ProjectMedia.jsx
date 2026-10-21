import React, {useEffect, useId, useRef, useState} from 'react';
import { ArrowUpRight } from 'lucide-react';
import { track } from '../site/analytics';
import './project-media.css';

export default function ProjectMedia({media, title, projectId}) {
  const [open,setOpen]=useState(false);
  const dialog=useRef(null);
  const heading=useId();
  useEffect(()=>{
    if(!dialog.current)return;
    if(open) dialog.current.showModal();
    else dialog.current.close();
  },[open]);
  if(!media)return null;
  return <div className="project-media">
    <button className="project-media-preview" aria-haspopup="dialog" aria-label={`View ${title} screenshots`} onClick={()=>{setOpen(true);track('media_open',{project_id:projectId??title});}}>
      <img src={media.preview} srcSet={`${media.preview} 1x, ${media.src} 2x`} width="600" height="300" alt={media.alt} loading="lazy" decoding="async"/>
      <span>View screenshots <span aria-hidden="true"><ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></span></span>
    </button>
    <dialog className="project-media-dialog" ref={dialog} aria-labelledby={heading} onClose={()=>setOpen(false)} onClick={event=>{
      if(event.target!==event.currentTarget)return;
      const box=event.currentTarget.getBoundingClientRect();
      if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)setOpen(false);
    }}>
      <header><h2 id={heading}>{title}</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Close screenshots">Close ×</button></header>
      {open?<img src={media.src} alt={media.alt} decoding="async"/>:null}
    </dialog>
  </div>;
}
