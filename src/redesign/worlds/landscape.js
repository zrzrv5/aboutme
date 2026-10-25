import * as THREE from 'three';

export const GROUND=.35;
export const SHORE=[[-12.9,-2],[-13.1,-7.8],[-12.0,-12.6],[-10.0,-14.15],[-6,-14.6],[-.2,-14.25],[2.1,-14.15],[4.2,-14.4],[10.1,-14.4],[12,-12.5],[12.2,-8.4],[10.5,-4],[10,-1],[11.5,2.6],[9.2,6.2],[5,7.8],[1.3,7.4],[-2.8,8.7],[-7.1,6.5],[-9.8,3],[-10.4,0]];
// Carry the stream beyond the beveled cliff, then drop it into the sea.
function shoreIntersection(origin,direction,scale) {
  let nearest=Infinity,result;
  for(let i=0;i<SHORE.length;i++) {
    const a=SHORE[i].map(v=>v*scale),b=SHORE[(i+1)%SHORE.length].map(v=>v*scale);
    const edge=[b[0]-a[0],b[1]-a[1]],delta=[a[0]-origin[0],a[1]-origin[1]];
    const cross=(u,v)=>u[0]*v[1]-u[1]*v[0],den=cross(direction,edge);
    if(Math.abs(den)<1e-8)continue;
    const t=cross(delta,edge)/den,u=cross(delta,direction)/den;
    if(t>0&&u>=0&&u<=1&&t<nearest){nearest=t;result=[origin[0]+direction[0]*t,origin[1]+direction[1]*t];}
  }
  return result;
}
const outDirection=new THREE.Vector2(-2.7,3.6).normalize().toArray();
export const RIVER_OUTLET={at:shoreIntersection([.6,4.6],outDirection,1.045),tangent:outDirection};
export const RIVER_SOURCE=[2.4,-12.8];
export const RIVER_POINTS=[RIVER_SOURCE,[2.38,-10.7],[2.4,-8.5],[2.6,-5.5],[2.5,-3],[2.7,.5],[1.7,2.3],[.6,4.6],RIVER_OUTLET.at];
export const riverHeightAt=(x,z)=>GROUND+.033-Math.max(0,1-Math.max(0,(RIVER_OUTLET.at[0]-x)*RIVER_OUTLET.tangent[0]+(RIVER_OUTLET.at[1]-z)*RIVER_OUTLET.tangent[1])/.65)*.12;
export function waterfallGeometry(width=.56,offset=0) {
  const [x,z]=RIVER_OUTLET.at,[tx,tz]=RIVER_OUTLET.tangent,nx=tz,nz=-tx,y=riverHeightAt(x,z);
  const positions=[x-nx*width/2+tx*offset,y,z-nz*width/2+tz*offset,x+nx*width/2+tx*offset,y,z+nz*width/2+tz*offset,x-nx*width/2+tx*offset,-.79,z-nz*width/2+tz*offset,x+nx*width/2+tx*offset,-.79,z+nz*width/2+tz*offset];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex([0,2,1,1,2,3]);geometry.computeVertexNormals();return geometry;
}
export const riverCurve=new THREE.CatmullRomCurve3(RIVER_POINTS.map(([x,z])=>new THREE.Vector3(x,0,z)));
export const RIVER_BANK_WIDTH=.90;

// Both bridge decks and road endpoints derive from the same crossing.
function crossingAtZ(z) {
  let lo=0,hi=1;
  for(let i=0;i<36;i++) {
    const mid=(lo+hi)/2;
    if(riverCurve.getPoint(mid).z<z) lo=mid; else hi=mid;
  }
  const t=(lo+hi)/2,point=riverCurve.getPoint(t),tangent=riverCurve.getTangent(t).normalize();
  const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize();
  const end=sign=>[point.x+normal.x*1.13*sign,point.z+normal.z*1.13*sign];
  return {center:[point.x,point.z],normal:[normal.x,normal.z],tangent:[tangent.x,tangent.z],angle:Math.atan2(normal.x,normal.z),west:end(-1),east:end(1),length:1.78,width:1.02};
}
export const CROSSINGS={visualization:crossingAtZ(-4.7),life:crossingAtZ(3.15)};
// The dock starts inside the grassy shore and points along its outward normal.
const coastA=new THREE.Vector2(9.2,6.2).multiplyScalar(.945),coastB=new THREE.Vector2(5,7.8).multiplyScalar(.945);
const coastDirection=coastB.clone().sub(coastA),coastNormal=new THREE.Vector2(coastDirection.y,-coastDirection.x).normalize();
const landing=coastA.clone().lerp(coastB,.55).addScaledVector(coastNormal,-.20);
export const DOCK={landing:landing.toArray(),normal:coastNormal.toArray(),angle:Math.atan2(coastNormal.x,coastNormal.y)};

// Work areas are modest, separate clearings on a faceted hillside. The rear
// ridgeline rises above them; the front edge blends continuously into the lawn.
export const ML_SITES={
  slop:{x:7.2,z:-10.85,height:1.80,radius:1.52},
  dshslop:{x:9.55,z:-10.15,height:1.60,radius:.72},
  gradbench:{x:9.65,z:-7.6,height:1.00,radius:.80},
  typeshi:{x:4.7,z:-8.75,height:1.23,radius:.80},
  dpmetal:{x:6.85,z:-7.8,height:1.28,radius:1.05},
  mud:{x:5.0,z:-6.45,height:.80,radius:.62},
};
function desiredHeight(x,z) {
  const peak=(cx,cz,rx,rz,h)=>Math.max(0,1-Math.hypot((x-cx)/rx,(z-cz)/rz))*h;
  let height=GROUND+Math.max(peak(5.0,-12.65,3.1,5.2,3.1),peak(9.05,-12.6,3.1,6.9,3.55),peak(7.1,-9.5,4.3,4.6,1.9));
  for(const site of Object.values(ML_SITES)) {
    const distance=Math.hypot(x-site.x,z-site.z);
    if(distance<site.radius) return site.height;
    if(distance<site.radius+.65) {
      const weight=1-(distance-site.radius)/.65;
      height=THREE.MathUtils.lerp(height,site.height,weight);
    }
  }
  return height;
}
const rows=[[-14.0,4.5,9.7],[-13.2,3.55,10.55],[-12.05,2.9,11.25],[-10.8,2.75,11.55],[-9.45,2.75,11.55],[-8.15,2.9,11.1],[-6.9,3.15,10.65],[-5.65,3.6,10.0],[-5.0,4.25,9.45]];
const points=[];
for(let row=0;row<rows.length;row++) {
  const [z,left,right]=rows[row];
  for(let col=0;col<=8;col++) {
    const boundary=row===0 || row===rows.length-1 || col===0 || col===8;
    const x=THREE.MathUtils.lerp(left,right,col/8)+(boundary?0:Math.sin(row*7+col*3)*.20);
    const zz=z+(boundary?0:Math.sin(row*3+col*11)*.15);
    points.push([x,boundary?GROUND:desiredHeight(x,zz),zz]);
  }
}
// Insert flat clearing rings into the mesh, so desk legs and device bases
// sit on real planar ground rather than floating above a sampled height.
const surfacePoints=points.filter(([x,,z])=>Object.values(ML_SITES).every(site=>Math.hypot(x-site.x,z-site.z)>site.radius+.12));
for(const site of Object.values(ML_SITES)) {
  surfacePoints.push([site.x,site.height,site.z]);
  for(let i=0;i<16;i++) {
    const angle=i*Math.PI/8;
    surfacePoints.push([site.x+Math.cos(angle)*site.radius,site.height,site.z+Math.sin(angle)*site.radius]);
  }
}
function triangulate(vertices) {
  const n=vertices.length;
  const v=[...vertices,[-100,GROUND,-100],[100,GROUND,-100],[0,GROUND,100]];
  const triangle=(a,b,c)=> {
    const [ax,,ay]=v[a],[bx,,by]=v[b],[cx,,cy]=v[c];
    const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(d)<1e-9) return null;
    const aa=ax*ax+ay*ay,bb=bx*bx+by*by,cc=cx*cx+cy*cy;
    const x=(aa*(by-cy)+bb*(cy-ay)+cc*(ay-by))/d;
    const z=(aa*(cx-bx)+bb*(ax-cx)+cc*(bx-ax))/d;
    return {ids:[a,b,c],x,z,r:(ax-x)**2+(ay-z)**2};
  };
  let triangles=[triangle(n,n+1,n+2)];
  for(let i=0;i<n;i++) {
    const [x,,z]=v[i],edges=new Map(),keep=[];
    for(const t of triangles) {
      if((x-t.x)**2+(z-t.z)**2>t.r+1e-8) { keep.push(t); continue; }
      for(let e=0;e<3;e++) {
        const a=t.ids[e],b=t.ids[(e+1)%3],key=[a,b].sort((u,w)=>u-w).join(':');
        if(edges.has(key)) edges.delete(key); else edges.set(key,[a,b]);
      }
    }
    for(const [a,b] of edges.values()) { const next=triangle(a,b,i); if(next) keep.push(next); }
    triangles=keep;
  }
  return triangles.filter(t=>t.ids.every(id=>id<n)).map(t=> {
    const [a,b,c]=t.ids.map(id=>v[id]);
    return (b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0?[a,b,c]:[a,c,b];
  });
}
export const MOUNTAIN_TRIANGLES=triangulate(surfacePoints);
export function mountainHeightAt(x,z) {
  for(const [a,b,c] of MOUNTAIN_TRIANGLES) {
    const denominator=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);
    const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/denominator;
    const v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/denominator;
    if(u>=-1e-6 && v>=-1e-6 && u+v<=1+1e-6) return u*a[1]+v*b[1]+(1-u-v)*c[1];
  }
  return GROUND;
}

export function mountainGeometry() {
  const positions=[],colors=[];
  MOUNTAIN_TRIANGLES.forEach((triangle,i)=> {
    const [a,b,c]=triangle.map(p=>new THREE.Vector3(...p));
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    const height=(a.y+b.y+c.y)/3;
    const rocky=normal.y<.64 || height>2.40;
    const palette=rocky?['#929f92','#b1b8a3','#9baa98','#bdc0aa']:['#abbf8d','#b2c894','#a5bb88','#c0ce9a'];
    const color=new THREE.Color(palette[i%palette.length]);
    for(const p of triangle) { positions.push(...p); colors.push(color.r,color.g,color.b); }
  });
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  return geometry;
}

export const MOUNTAIN_TRAILS=[
  [[9.4,-4.6],[9.65,-5.55],[10.0,-6.45],[8.85,-7.1],[8.55,-8.6],[7.6,-9.4],[7.2,-9.8]],
  [[8.55,-8.6],[9.0,-9.15],[9.2,-9.4]],
  [[8.85,-7.1],[9.65,-6.95]],
  [[7.6,-9.4],[6.25,-9.1],[5.3,-8.35],[4.7,-7.95]],
  [[6.25,-9.1],[6.2,-8.1],[6.85,-6.95]],
  [[5.0,-4.95],[5.0,-5.75]],
];

// Subdivide across the trail as well as along it: a wide quad can otherwise
// cut through a ridge even when its two outside edges are on the ground.
export function ribbonGeometry(points,width,height) {
  const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));
  const uneven=typeof height==='function',steps=uneven?192:64,strips=uneven?6:1;
  const positions=[],indices=[];
  for(let row=0;row<=steps;row++) {
    const t=row/steps,p=curve.getPoint(t),v=curve.getTangent(t);
    const nx=-v.z*width/2,nz=v.x*width/2;
    for(let col=0;col<=strips;col++) {
      const offset=1-2*col/strips,x=p.x+nx*offset,z=p.z+nz*offset;
      positions.push(x,uneven?height(x,z):height,z);
      if(row<steps && col<strips) {
        const a=row*(strips+1)+col,b=a+strips+1;
        indices.push(a,a+1,b,a+1,b+1,b);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
