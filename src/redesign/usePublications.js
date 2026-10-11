import { useEffect, useState } from 'react';
import { normalizePublications } from './content';

let cachedData=null,pending=null;
function initialPublications(seed){
  if(seed)return seed;
  if(cachedData)return cachedData;
  if(typeof document==='undefined')return null;
  try{return JSON.parse(document.getElementById('site-publications')?.textContent??'null');}catch{return null;}
}
function ready(data){return {list:normalizePublications(data),meta:data.metadata??null,status:'ready'};}
// The build embeds the same publication source in /about/ for a complete first
// paint; client-side view switches reuse one fetch instead of rebuilding the list.
export default function usePublications(initialData){
  const [state,setState]=useState(()=>{
    const seed=initialPublications(initialData);if(seed){cachedData=seed;return ready(seed);}
    return {list:[],meta:null,status:'loading'};
  });
  useEffect(()=>{
    let alive=true;
    const request=cachedData?Promise.resolve(cachedData):(pending??=fetch('/publications.json').then(response=>{if(!response.ok)throw new Error('Publications could not be loaded');return response.json();}).then(data=>{cachedData=data;return data;}).catch(error=>{pending=null;throw error;}));
    request.then(data=>{if(alive)setState(ready(data));}).catch(()=>{if(alive)setState({list:[],meta:null,status:'error'});});
    return ()=>{alive=false;};
  },[]);
  return state;
}
