import * as THREE from 'three';
import { createNAIIVEGeometry } from './naiive-geometry.js';

// The hologram's 16 s loop, after concept D of the NAIIVE App Store motion
// drafts: the logo icosahedron tilts out of its 3-fold view, grows twelve B–H
// bonds into closo-B12H12²⁻, becomes the body centre of the high-temperature
// Na2B12H12 cell (Im-3m, a = 7.96 Å) while Na⁺ hop between tetrahedral sites
// and corner anions reorient, then folds back into the logo.
export const NAIIVE_LOOP=16;
export const NAIIVE_LATTICE=7.96;
export const NAIIVE_RB=1.69;   // B–centre distance, Å
export const NAIIVE_BH=1.19;   // B–H bond, Å
export const NAIIVE_ICON_SCALE=.9; // scene units per Å while the cage is the logo

const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

// Phase scalars shared by the renderer and its tests. t wraps at NAIIVE_LOOP.
export function sampleNAIIVESequence(time) {
  const t=((time%NAIIVE_LOOP)+NAIIVE_LOOP)%NAIIVE_LOOP;
  // The anion shrinks to cell scale before any neighbour appears, and the
  // neighbours are gone before it grows back, so the hologram never reaches
  // past the projector at any point of the loop.
  const crystal=sstep(4.4,6.2,t)*(1-sstep(13.1,14.3,t));
  const hydrogen=sstep(2.4,4.0,t)*(1-sstep(13.3,14.3,t));
  return {
    t,
    icon:clamp(1-sstep(1.1,2.2,t)+sstep(14.3,15.3,t),0,1),
    tilt:.32*sstep(1.6,4.0,t)*(1-sstep(13.0,14.6,t)),
    hydrogen,
    crystal,
    // The growing hydrogens already shrink the cage so B12H12 fits the plinth;
    // the cell then shrinks it again.
    zoom:1-.41*Math.sqrt(hydrogen)-.42*crystal,
    cell:sstep(6.3,7.5,t)*(1-sstep(11.2,12.3,t)),
    spin:Math.PI*2*t/NAIIVE_LOOP,
  };
}
// Staggered appearance of one lattice member with stagger e in [0,1), entirely
// inside the window where the central anion is at cell scale.
export const memberPresence=(t,e)=>sstep(6.2+1.5*e,7.0+1.5*e,t)*(1-sstep(11.1+1.2*(1-e),11.9+1.2*(1-e),t));

export function createNAIIVECrystal() {
  const geometry=createNAIIVEGeometry();
  const {points,toIcon}=geometry;
  const a=NAIIVE_LATTICE,h=a/2,q=a/4;
  let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  // Reorientation axes: the four <111> directions, i.e. the anion's 3-fold axes.
  const c3=[[1,1,1],[1,1,-1],[1,-1,1],[-1,1,1]].map(v=>toIcon(new THREE.Vector3(...v)).normalize());
  const anions=[{centre:new THREE.Vector3(),central:true,axis:c3[0],state:0,jumps:[],e:0}];
  for(const sx of [-1,1]) for(const sy of [-1,1]) for(const sz of [-1,1]) {
    const jumps=[]; let tj=8.5+rnd()*1.0,sign=rnd()<.5?-1:1;
    while(tj<10.7) { jumps.push({t:tj,sign}); sign=-sign; tj+=1.2+rnd()*1.5; }
    anions.push({centre:toIcon(new THREE.Vector3(sx*h,sy*h,sz*h)),central:false,axis:c3[Math.floor(rnd()*4)],state:rnd()<.5?0:1,jumps,e:rnd()});
  }
  // Na⁺ on 8 of the 24 tetrahedral face sites (one third occupied, four per
  // cell), displaced 0.25 Å off-site. Three hop 2.81 Å to a vacant neighbour.
  const sites=[[h,q,0],[-h,-q,0],[0,h,q],[0,-h,-q],[q,0,h],[-q,0,-h],[h,0,-q],[-h,0,q]];
  const hops={0:{to:[h,0,q],t:8.8,out:[1,0,0]},2:{to:[q,h,0],t:9.6,out:[0,1,0]},4:{to:[0,q,h],t:10.4,out:[0,0,1]}};
  const sodium=sites.map((site,i)=>{
    const off=new THREE.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize().multiplyScalar(.25),hop=hops[i];
    return {site:toIcon(new THREE.Vector3(...site)),off,e:rnd(),hop:hop&&{to:toIcon(new THREE.Vector3(...hop.to)),t:hop.t,out:toIcon(new THREE.Vector3(...hop.out))}};
  });
  const corners=[];
  for(const x of [-h,h]) for(const y of [-h,h]) for(const z of [-h,h]) corners.push(toIcon(new THREE.Vector3(x,y,z)));
  const cellEdges=[[0,4],[0,2],[0,1],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
  return {...geometry,unit:points,anions,sodium,corners,cellEdges};
}

// Orientation of one anion at time t: its base state plus every completed or
// in-flight π/3 jump about its 3-fold axis. Returns a quaternion.
export function anionOrientation(anion,t,target=new THREE.Quaternion()) {
  let turns=anion.state;
  for(const jump of anion.jumps) turns+=jump.sign*ease(clamp((t-jump.t)/.3,0,1));
  return target.setFromAxisAngle(anion.axis,Math.PI/3*turns);
}
// Na⁺ position in Å (icon frame) at time t, including its hop arc.
export function sodiumPosition(ion,t,target=new THREE.Vector3()) {
  target.copy(ion.site);
  if(ion.hop) {
    const u=ease(clamp((t-ion.hop.t)/.6,0,1));
    target.lerp(ion.hop.to,u).addScaledVector(ion.hop.out,.4*Math.sin(Math.PI*u));
  }
  return target.add(ion.off);
}
