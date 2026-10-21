export const EVENT_FIELDS={
  page_view:['page_title','page_location','page_referrer'],
  view_switch:['from_view','to_view'],
  content_open:['content_id','content_type'],
  content_section:['content_id','section_id'],
  section_view:['section_id'],
  skill_select:['skill_id'],
  skill_milestone:['skill_id','place_id','skill_level','status'],
  contact_click:['contact_method'],
  document_open:['document_id','file_extension'],
  project_link:['project_id','link_kind','link_domain'],
  publication_click:['publication_id','link_domain'],
  outbound_click:['link_domain'],
  notes_toggle:['visible'],
  world_ready:['load_ms'],
  world_error:['error_kind'],
  web_vital:['metric_name','metric_value','metric_rating','metric_id','entry_view'],
  entry_focus:['content_id'],
  scroll_depth:['percent'],
  content_close:['content_id','dwell_s'],
  media_open:['project_id'],
  world_gesture:['gesture'],
  world_performance:['frame_ms','pointer_type','pixel_ratio'],
  page_print:[],
  app_error:['error_kind','error_message'],
};
export function analyticsMode({production,hostname,debug=false,optedOut=false}) {
  if(optedOut)return 'off';
  if(production&&hostname==='me.1sec.plus')return 'live';
  return debug?'debug':'off';
}
export function safeUrl(raw,base='https://me.1sec.plus') {
  if(!raw)return '';
  try{const url=new URL(raw,base);return /^https?:$/.test(url.protocol)?url.origin+url.pathname:'';}catch{return '';}
}
export function linkEvent({href,origin,publication=false,projectId=null}) {
  let url;try{url=new URL(href,origin);}catch{return null;}
  if(url.protocol==='mailto:')return ['contact_click',{contact_method:'email'}];
  if(!/^https?:$/.test(url.protocol))return null;
  if(url.origin===origin&&/\.pdf$/i.test(url.pathname))return ['document_open',{document_id:/resume/i.test(url.pathname)?'resume':'cv',file_extension:'pdf'}];
  if(publication)return ['publication_click',{publication_id:url.pathname.slice(0,100),link_domain:url.hostname}];
  if(projectId){
    const kind=/\.(png|jpe?g|webp|svg)$/i.test(url.pathname)?'image':/\.(mp4|webm|mov)$/i.test(url.pathname)?'video':url.hostname==='apps.apple.com'?'app_store':url.hostname==='testflight.apple.com'?'testflight':url.hostname==='github.com'?'github':['lnkd.in','www.linkedin.com','linkedin.com'].includes(url.hostname)?'linkedin_post':'website';
    return ['project_link',{project_id:projectId,link_kind:kind,link_domain:url.hostname}];
  }
  if(url.hostname==='www.linkedin.com'||url.hostname==='linkedin.com')return ['contact_click',{contact_method:'linkedin'}];
  if(url.origin===origin)return null;
  return ['outbound_click',{link_domain:url.hostname}];
}
export function createTracker({send,isEnabled=()=>true}) {
  let view='resume',lastPage=null;
  const seen=new Set();
  function event(name,fields={}) {
    if(!isEnabled()||!Object.hasOwn(EVENT_FIELDS,name))return;
    const clean={site_view:view};
    for(const key of EVENT_FIELDS[name]) {
      const value=fields[key];
      if(typeof value==='number'&&Number.isFinite(value))clean[key]=value;
      else if(typeof value==='boolean')clean[key]=value;
      else if(typeof value==='string')clean[key]=value.slice(0,key.startsWith('page_')?300:100);
    }
    send(name,clean);
  }
  return {
    event,
    once(name,key,fields){const id=name+':'+key;if(seen.has(id)||!isEnabled())return;seen.add(id);event(name,fields);},
    page(next,title,location,referrer='') {
      view=next;const clean=safeUrl(location),key=next+':'+clean;
      if(key===lastPage)return;
      const previous=lastPage?.slice(lastPage.indexOf(':')+1)||safeUrl(referrer);
      lastPage=key;event('page_view',{page_title:title,page_location:clean,page_referrer:previous});
    },
  };
}

export function campaignParams(search) {
  const query=new URLSearchParams(search),params={};
  for(const [key,field] of [['utm_source','campaign_source'],['utm_medium','campaign_medium'],['utm_campaign','campaign_name']]) {
    const value=query.get(key);
    if(value&&/^[a-zA-Z0-9_. -]{1,100}$/.test(value))params[field]=value;
  }
  return params;
}
