import { analyticsMode, createTracker, linkEvent, safeUrl, campaignParams } from './analytics-core.js';
import {readSiteRoute,VIEW_PATHS,VIEW_TITLES,SITE_ORIGIN} from './routes';

const ID=import.meta.env.VITE_GA_ID||'G-BPBV7R290N';
let initialized=false,enabled=false,mode='off',choice=null;
const tracker=createTracker({isEnabled:()=>enabled,send:(name,fields)=>{
  if(mode==='debug')console.debug('[site analytics]',JSON.stringify({event:name,...fields}));
  else {
    if(name==='page_view')window.gtag?.('set',{page_title:fields.page_title,page_location:fields.page_location,page_referrer:fields.page_referrer,site_view:fields.site_view});
    window.gtag?.('event',name,{...fields,send_to:ID});
  }
}});
export function analyticsAllowed(){
  if(typeof navigator==='undefined')return false;
  try{return localStorage.getItem('portfolio-analytics')!=='off'&&!navigator.globalPrivacyControl;}catch{return !navigator.globalPrivacyControl;}
}
export function setAnalyticsAllowed(allowed){
  choice=allowed;
  try{localStorage.setItem('portfolio-analytics',allowed?'on':'off');}catch{/* Storage is optional. */}
  window[`ga-disable-${ID}`]=!allowed;
  if(!allowed){enabled=false;window.gtag?.('consent','update',{analytics_storage:'denied'});}
  else window.location.reload();
}
export function initAnalytics(){
  if(initialized)return;initialized=true;
  const url=new URL(window.location.href);
  mode=analyticsMode({production:import.meta.env.PROD,hostname:url.hostname,debug:url.searchParams.get('analytics')==='debug',optedOut:!(choice??analyticsAllowed())});
  if(mode==='off'||!/^G-[A-Z0-9]+$/.test(ID))return;
  enabled=true;
  if(mode==='live') {
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('set',{page_location:safeUrl(url.href),page_referrer:safeUrl(document.referrer)});
    window.gtag('config',ID,{...campaignParams(url.search),send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    const tag=document.createElement('script');tag.async=true;tag.src=`https://www.googletagmanager.com/gtag/js?id=${ID}`;document.head.append(tag);
  }
  const initial=readSiteRoute(url);
  if(!initial.notFound)tracker.page(initial.view,VIEW_TITLES[initial.view],SITE_ORIGIN+VIEW_PATHS[initial.view],document.referrer);
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[href]');if(!a)return;
    const content=a.closest('[data-project-id]');
    const value=linkEvent({href:a.href,origin:location.origin,publication:a.dataset.analytics==='publication',projectId:content?.dataset.projectId});
    if(value)tracker.event(...value);
  });
  window.addEventListener('beforeprint',()=>tracker.once('page_print','print',{}));
  // Script failures, once per distinct message, so a broken island shows up in the same report as its load time.
  const fail=(kind,detail)=>tracker.once('app_error',kind+':'+detail,{error_kind:kind,error_message:detail});
  window.addEventListener('error',event=>fail('uncaught',String(event.message||'').slice(0,100)));
  window.addEventListener('unhandledrejection',event=>fail('rejection',String(event.reason?.message||event.reason||'').slice(0,100)));
  const observeVitals=()=>import('web-vitals').then(({onCLS,onINP,onLCP})=>{
    const report=({name,value,rating,id})=>tracker.event('web_vital',{metric_name:name,metric_value:Math.round(value*1000)/1000,metric_rating:rating,metric_id:id,entry_view:readSiteRoute(url).view});
    onCLS(report);onINP(report);onLCP(report);
  }).catch(()=>{});
  if(document.readyState==='complete')observeVitals();else window.addEventListener('load',observeVitals,{once:true});
}
export const track=(name,fields)=>tracker.event(name,fields);
export const trackOnce=(name,key,fields)=>tracker.once(name,key,fields);
export const trackPage=(view,title,url)=>tracker.page(view,title,url,document.referrer);
