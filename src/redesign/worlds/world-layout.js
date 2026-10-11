import { ML_SITES, mountainHeightAt } from './landscape.js';

// Map geography is separate from the plain site's subject taxonomy.
// Left: experience (study / skills / work). Right: personal projects
// (everyday apps / visualization / ML & AI). Heights are world-space meters.
const hill=(id,scale,stand)=>({at:[ML_SITES[id].x,ML_SITES[id].height,ML_SITES[id].z],scale,stand:[stand[0],mountainHeightAt(...stand),stand[1]]});
export const STUDY_OFFSET_Z=-4.8;
export const CAMPUS_TRANSFORMS={
  isu:{origin:[-1.9,-4.6],at:[-1.9,-9.4],turn:0},
  wustl:{origin:[-7.5,-4.9],at:[-7.85,-9.7],turn:0},
  cust:{origin:[-8.85,-.35],at:[-8.45,-4.95],turn:Math.PI/2},
};
export function campusPoint(id,[x,z]) {
  const {origin,at,turn}=CAMPUS_TRANSFORMS[id],dx=x-origin[0],dz=z-origin[1];
  return [at[0]+dx*Math.cos(turn)+dz*Math.sin(turn),at[1]-dx*Math.sin(turn)+dz*Math.cos(turn)];
}
export const PLAZA_LAYOUT={
  center:[-2.7,-1.5],radius:3.2,
  mirror:{at:[-2.7,.35,-1.5],scale:1.18,stand:[-2.7,.35,.05]},
  skills:{at:[-5.05,.35,-2.05],scale:1.22,stand:[-4.75,.35,-.65]},
  journal:{at:[-.7,.35,.65],scale:1,stand:[-.7,.35,1.6]},
};
export const WORLD_CENTER=[0,0,-2.4];
export const PROJECT_LAYOUT={
  naiive:{at:[4.8,.35,-2.6],scale:1.07,stand:[4.8,.35,-.48]},
  trajview:{at:[8.1,.35,-1.35],scale:.70,stand:[7.8,.35,-.65]},
  slop:hill('slop',1,[7.2,-9.8]),
  dshslop:hill('dshslop',1.18,[9.2,-9.4]),
  gradbench:hill('gradbench',1.1,[9.65,-6.95]),
  typeshi:hill('typeshi',1.08,[4.7,-7.95]),
  dpmetal:hill('dpmetal',1,[6.85,-6.95]),
  amiibot:{at:[6.1,.35,3.2],scale:.82,stand:[6.1,.35,4.45]},
  totk:{at:[3.65,.35,2.85],scale:.86,stand:[3.65,.35,4.15]},
  ling:{at:[5.25,.35,5.7],scale:.74,stand:[6.35,.35,5.9]},
  laneloaf:{at:[8.05,.35,2.2],scale:.5,stand:[7.7,.35,2.7]},
  gas:{at:[3.1,.35,5.7],scale:.5,stand:[2.7,.35,5.95]},
  fuji:{at:[7.4,.35,5.8],scale:.5,stand:[7.1,.35,6.25]},
};

export const GAME_AREAS=[
  {id:'study',name:'Learning',plain:'Experience · Education',parent:'experience',home:'isu',anchor:[-5.0,.4,-6.5],fallback:{x:30,y:42},plainFocus:'biome:research',members:['cust','wustl','isu','phd'],description:'Undergraduate study at CUST, a master’s at WUSTL, and doctoral research at Iowa State.'},
  {id:'work',name:'Work',plain:'Experience · Industry',parent:'experience',home:'sunwoda',anchor:[-5.4,.4,4.5],fallback:{x:30,y:70},plainFocus:'biome:research',members:['sunwoda','seagate','patents'],description:'Battery simulation at Sunwoda and storage-materials research at Seagate. The field kit between work and study follows the skills acquired along the way.'},
  {id:'apps',name:'Everyday inventions',plain:'Personal projects · Life',parent:'projects',home:'amiibot',anchor:[5.0,.4,6.8],fallback:{x:67,y:78},plainFocus:'biome:apps',members:['amiibot','totk','ling','laneloaf','gas','fuji'],description:'Apps for collections, games and everyday life, with smaller experiments along the paths.'},
  {id:'software',name:'Visualization',plain:'Personal projects · Visualization',parent:'projects',home:'naiive',anchor:[6.35,.4,-.1],fallback:{x:70,y:55},plainFocus:'biome:software',members:['naiive','trajview'],description:'NAIIVE’s molecular workspace and Quick TrajView’s lightweight trajectory previews.'},
  {id:'ml',name:'ML / AI Hills',plain:'Personal projects · Machine learning & AI',parent:'projects',home:'slop',anchor:[8.1,mountainHeightAt(8.1,-6.65),-6.65],fallback:{x:72,y:25},plainFocus:'biome:software',members:['slop','dshslop','gradbench','typeshi','dpmetal'],description:'S.L.O.P.’s research runtime, persistent cluster workflows and evaluation tools, alongside atom classification and native ML-potential inference.'},
];
export const gameAreaById=Object.fromEntries(GAME_AREAS.map(area=>[area.id,area]));
