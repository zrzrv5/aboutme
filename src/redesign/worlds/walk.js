import { GROUND, SHORE, riverCurve, CROSSINGS, mountainHeightAt } from './landscape.js';

// Where the frog may be sent on foot: the lawn, the hillside and the bridge
// decks, never the water or the beach bevel. Heights come from the same
// functions that shaped the terrain, so the walk follows the ground.
export const WALK_SPEED=5.2;   // units per second
export const HOP_LENGTH=1.15;  // one hop of a multi-hop walk
const LAWN=.92;                // SHORE scale of walkable ground, inside the .945 grass edge
const RIVER_HALF=.7;              // keeps the frog off the sand bank as well as the water
const riverSamples=riverCurve.getSpacedPoints(96);

export function insideShore(x,z,scale=LAWN) {
  let inside=false;
  for(let i=0,j=SHORE.length-1;i<SHORE.length;j=i++) {
    const xi=SHORE[i][0]*scale,zi=SHORE[i][1]*scale,xj=SHORE[j][0]*scale,zj=SHORE[j][1]*scale;
    if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside;
  }
  return inside;
}
export function riverDistance(x,z) {
  let best=Infinity;
  for(let i=1;i<riverSamples.length;i++) {
    const a=riverSamples[i-1],b=riverSamples[i],dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;
    const t=len?Math.min(1,Math.max(0,((x-a.x)*dx+(z-a.z)*dz)/len)):0;
    best=Math.min(best,Math.hypot(x-(a.x+dx*t),z-(a.z+dz*t)));
  }
  return best;
}
export function onBridge(x,z) {
  return Object.values(CROSSINGS).some(c=> {
    const dx=x-c.center[0],dz=z-c.center[1];
    return Math.abs(dx*c.normal[0]+dz*c.normal[1])<=c.length/2&&Math.abs(dx*c.tangent[0]+dz*c.tangent[1])<=c.width/2;
  });
}
export const groundHeightAt=(x,z)=>Math.max(GROUND,mountainHeightAt(x,z));
// A ground point the frog can stand on, or null.
export function walkTarget(x,z) {
  if(!insideShore(x,z))return null;
  if(riverDistance(x,z)<RIVER_HALF&&!onBridge(x,z))return null;
  return [x,groundHeightAt(x,z),z];
}
// A walk is a straight line at constant speed made of whole hops. A single
// short hop keeps the original high arc; longer walks are a run of low hops.
export function planWalk(from,to) {
  const distance=Math.hypot(to[0]-from[0],to[2]-from[2]);
  const hops=Math.max(1,Math.round(distance/HOP_LENGTH));
  return {distance,hops,duration:hops===1?550:Math.max(550,distance/WALK_SPEED*1000),height:hops===1?1.25:.42};
}
