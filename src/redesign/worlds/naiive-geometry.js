import * as THREE from 'three';

// Original twelve vertices and thirty bonds from the NAIIVE logo.
export function createNAIIVEGeometry() {
  const phi=(1+Math.sqrt(5))/2,vertices=[];
  for(const a of [-1,1]) for(const b of [-1,1]) {
    for(const p of [[0,a,b*phi],[a,b*phi,0],[b*phi,0,a]]) vertices.push(new THREE.Vector3(...p).normalize());
  }
  const edges=[];
  for(let i=0;i<12;i++) for(let j=i+1;j<12;j++) if(vertices[i].distanceTo(vertices[j])<1.06) edges.push([i,j]);
  let face;
  for(const [i,j] of edges) {
    for(let k=0;k<12;k++) {
      if(k===i || k===j || vertices[i].distanceTo(vertices[k])>=1.06 || vertices[j].distanceTo(vertices[k])>=1.06) continue;
      const n=vertices[i].clone().add(vertices[j]).add(vertices[k]).normalize();
      if(Math.abs(Math.abs(n.x)-Math.abs(n.y))<1e-6 && Math.abs(Math.abs(n.y)-Math.abs(n.z))<1e-6) { face=[i,j,k]; break; }
    }
    if(face) break;
  }
  const ez=face.reduce((sum,i)=>sum.add(vertices[i]),new THREE.Vector3()).normalize();
  const ey=vertices[face[0]].clone().addScaledVector(ez,-vertices[face[0]].dot(ez)).normalize().negate();
  const ex=new THREE.Vector3().crossVectors(ey,ez);
  const points=vertices.map(v=>new THREE.Vector3(v.dot(ex),v.dot(ey),v.dot(ez)));
  const pick=(angle,front)=>points.map((p,i)=>({p,i})).filter(({p})=>front?p.z>.7:Math.hypot(p.x,p.y)>.85)
    .sort((a,b)=>Math.abs((THREE.MathUtils.radToDeg(Math.atan2(a.p.y,a.p.x))-angle+540)%360-180)-Math.abs((THREE.MathUtils.radToDeg(Math.atan2(b.p.y,b.p.x))-angle+540)%360-180))[0].i;
  const f270=pick(-90,true),f150=pick(150,true),f30=pick(30,true),o210=pick(-150,false);
  const key=(i,j)=>[i,j].sort((a,b)=>a-b).join(':');
  const rgb=new Map([[key(o210,f150),'#FF383C'],[key(f270,f150),'#32DB9A'],[key(f270,f30),'#0A84FF']]);
  const frontFace=[f270,f150,f30];
  const faceNormal=frontFace.reduce((sum,i)=>sum.add(points[i]),new THREE.Vector3()).normalize();
  // Keep the logo's initial presentation, independent of its rotation axis.
  const pose=new THREE.Quaternion().setFromUnitVectors(faceNormal,new THREE.Vector3(0,34,24).normalize());
  // The two outer silhouette tips in the 2D logo, matching d_scene.py's AXIS.
  // The lower RGB junction is an interior point, not the bottom silhouette tip.
  const poles=[pick(90,false),pick(-90,false)];
  const axis=points[poles[0]].clone().sub(points[poles[1]]).normalize();
  const worldAxis=axis.clone().applyQuaternion(pose);
  return {points,edges,rgb,key,axis,pose,worldAxis,frontFace,poles};
}
