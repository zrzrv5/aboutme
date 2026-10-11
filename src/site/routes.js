import { byId, itemById, normalizeFocus } from '../redesign/worlds/data.js';

export const SITE_ORIGIN='https://me.1sec.plus';
export const VIEW_PATHS={world:'/world/',resume:'/'};
export const VIEW_TITLES={world:'Rui Zhou · Explore my world',resume:'Rui Zhou · Materials & software'};
const AREAS=new Set(['study','work','apps','software','ml','research']);
export function validSiteFocus(value) {
  const id=normalizeFocus(value);
  if(!id || id==='home')return null;
  if(byId[id] || (id.startsWith('item:')&&itemById[id.slice(5)]) || (id.startsWith('biome:')&&AREAS.has(id.slice(6))))return id;
  return null;
}
export function readSiteRoute(location) {
  const q=new URLSearchParams(location.search),path=location.pathname.replace(/\/+$/,'')||'/';
  const legacy={'/academic':'library','/industry':'sunwoda','/developer':'biome:apps'};
  const resumeRequested=path==='/about'||legacy[path]||['margins','plain','wall'].includes(q.get('v'))||q.get('w')==='plain';
  const worldRequested=path==='/world'||q.get('w')==='fun';
  const view=!resumeRequested&&worldRequested?'world':'resume';
  return {view,focus:validSiteFocus(q.get('at')||legacy[path]),notFound:!['/','/about','/world',...Object.keys(legacy)].includes(path)};
}
export function siteUrl(view,focus=null) {
  const at=validSiteFocus(focus);
  return VIEW_PATHS[view]+(at?`?at=${encodeURIComponent(at)}`:'');
}
export function writeSiteRoute(view,focus,{replace=false,home=false}={}) {
  const url=home&&!focus?'/':siteUrl(view,focus);
  if(window.location.pathname+window.location.search===url)return;
  window.history[replace?'replaceState':'pushState']({siteView:view},'',url);
}
export function marginTarget(focus) {
  const id=validSiteFocus(focus);
  if(!id)return 'profile';
  if(id.startsWith('item:'))return 'skills';
  const aliases={library:'papers',phd:'isu',photo:'isu',job:'profile','biome:study':'education','biome:work':'experience','biome:research':'experience','biome:software':'projects','biome:ml':'projects','biome:apps':'software'};
  return aliases[id]??id;
}
