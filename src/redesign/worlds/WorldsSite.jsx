import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { readSiteRoute, writeSiteRoute, VIEW_TITLES, VIEW_PATHS, SITE_ORIGIN } from '../../site/routes';
import { track, trackOnce, trackPage } from '../../site/analytics';

import MarginsSite from '../margins/MarginsSite';
const FunWorld=lazy(()=>import('./FunWorld'));

function Loading({world}) {
  return <div className="site-loading" role="status"><p>{world?'Opening the island…':'Opening the portfolio…'}</p>{world?<a href="/">Read the 2D portfolio</a>:null}</div>;
}
export default function WorldsSite({initialRoute, initialPublications}) {
  const [route,setRoute]=useState(()=>initialRoute??readSiteRoute(window.location));
  const [shift,setShift]=useState(null);
  const timers=useRef([]),switching=useRef(false),lastPointer=useRef(null);
  useEffect(()=>{
    const pending=timers.current;
    window.history.scrollRestoration='manual';
    const initial=readSiteRoute(window.location);
    if(initial.focus)trackOnce('entry_focus',initial.focus,{content_id:initial.focus});
    const focusFrame=requestAnimationFrame(()=>setRoute(initial));
    const keepHome=window.location.pathname==='/'&&!window.location.search;
    if(!initial.notFound)writeSiteRoute(initial.view,initial.focus,{replace:true,home:keepHome});
    const pop=()=>{
      timers.current.forEach(clearTimeout);switching.current=false;setShift(null);
      const next=readSiteRoute(window.location);
      if(!next.notFound)trackPage(next.view,VIEW_TITLES[next.view],SITE_ORIGIN+VIEW_PATHS[next.view]);
      setRoute(next);window.scrollTo({top:0});
    };
    const pointer=e=>{lastPointer.current={x:e.clientX,y:e.clientY};};
    window.addEventListener('popstate',pop);window.addEventListener('pointerdown',pointer,true);
    return ()=>{cancelAnimationFrame(focusFrame);pending.forEach(clearTimeout);window.removeEventListener('popstate',pop);window.removeEventListener('pointerdown',pointer,true);};
  },[]);
  useEffect(()=>{
    document.body.classList.toggle('ws-fun',route.view==='world'&&!route.notFound);
    document.title=route.notFound?'Page not found · Rui Zhou':VIEW_TITLES[route.view];
    const canonical=document.querySelector('link[rel="canonical"]');
    if(canonical)canonical.href=SITE_ORIGIN+(route.notFound?'/404.html':VIEW_PATHS[route.view]);
    if(!route.notFound)trackPage(route.view,VIEW_TITLES[route.view],SITE_ORIGIN+VIEW_PATHS[route.view]);
    return ()=>document.body.classList.remove('ws-fun');
  },[route.view,route.notFound]);
  const go=useCallback((view,focus)=>{
    if(switching.current)return;
    track('view_switch',{from_view:route.view,to_view:view});
    const apply=()=>{trackPage(view,VIEW_TITLES[view],SITE_ORIGIN+VIEW_PATHS[view]);setRoute({view,focus});writeSiteRoute(view,focus);window.scrollTo({top:0});};
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){apply();return;}
    switching.current=true;setShift({phase:'in',origin:lastPointer.current});
    timers.current.push(setTimeout(()=>{apply();setShift(current=>({...current,phase:'out'}));},260),setTimeout(()=>{setShift(null);switching.current=false;},580));
  },[route.view]);
  if(route.notFound)return <main className="site-recovery"><h1>Page not found</h1><p>This address does not lead to a page on my site.</p><a href="/world/">Explore the island</a><a href="/">View my portfolio</a></main>;
  return <div className="rz-worlds">
    <a className="site-skip" href={route.view==='world'?'#world-menu':'#main-content'}>{route.view==='world'?'Skip to island menu':'Skip to content'}</a>
    {route.view==='world'?<Suspense fallback={<Loading world/>}><FunWorld key={`world-${route.focus}`} focusId={route.focus} onSwitch={at=>go('resume',at)}/></Suspense>:<MarginsSite initialPublications={initialPublications} key={`resume-${route.focus}`} focusId={route.focus} onSwitch={at=>go('world',at)}/>}
    {shift?<div className={`ws-shift ws-shift-${shift.phase}`} aria-hidden="true" style={{'--origin':shift.origin?`${shift.origin.x}px ${shift.origin.y}px`:'50% 50%'}}/>:null}
  </div>;
}
