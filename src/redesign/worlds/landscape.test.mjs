import test from 'node:test';
import assert from 'node:assert/strict';
import { CROSSINGS, RIVER_BANK_WIDTH, riverCurve, DOCK, SHORE, ML_SITES, mountainHeightAt, MOUNTAIN_TRIANGLES, MOUNTAIN_TRAILS, ribbonGeometry } from './landscape.js';
import { PROJECT_LAYOUT } from './world-layout.js';

const close=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);
const inside=(point,polygon)=> {
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [x,z]=point,[ax,az]=polygon[i],[bx,bz]=polygon[j];
    if((az>z)!==(bz>z) && x<(bx-ax)*(z-az)/(bz-az)+ax) result=!result;
  }
  return result;
};

test('bridges are perpendicular to the river and both ends reach dry banks',()=> {
  const [rear,front]=[CROSSINGS.visualization.center,CROSSINGS.life.center];
  assert.ok(front[1]-rear[1]>6,'school and life crossings need distinct river sections');
  for(const bridge of Object.values(CROSSINGS)) {
    close(bridge.normal[0]*bridge.tangent[0]+bridge.normal[1]*bridge.tangent[1],0);
    assert.ok(bridge.length>RIVER_BANK_WIDTH+.6);
    for(const end of [bridge.west,bridge.east]) {
      assert.ok(inside(end,SHORE.map(p=>p.map(v=>v*.945))));
      const distance=Math.min(...Array.from({length:1001},(_,i)=>{const p=riverCurve.getPoint(i/1000);return Math.hypot(p.x-end[0],p.z-end[1]);}));
      assert.ok(distance>RIVER_BANK_WIDTH/2+.2);
      assert.ok(Math.hypot(end[0]-bridge.center[0],end[1]-bridge.center[1])>bridge.length/2);
    }
  }
});

test('the dock starts on the grassy shore and extends out over water',()=> {
  assert.ok(inside(DOCK.landing,SHORE.map(p=>p.map(v=>v*.945))));
  const end=DOCK.landing.map((v,i)=>v+DOCK.normal[i]*1.8);
  assert.equal(inside(end,SHORE.map(p=>p.map(v=>v*1.025))),false);
});

test('ML objects have actual flat ground under their whole base',()=> {
  const feet={slop:[1.225,.66],dshslop:[.37,.34],gradbench:[.58,.52],typeshi:[.58,.52],mud:[.4,.4],dpmetal:[.74,.60]};
  for(const [id,[x,z]] of Object.entries(feet)) {
    const site=ML_SITES[id];
    for(const dx of [-x,0,x]) for(const dz of [-z,0,z]) close(mountainHeightAt(site.x+dx,site.z+dz),site.height);
    close(PROJECT_LAYOUT[id].at[1],site.height);
    const [sx,sy,sz]=PROJECT_LAYOUT[id].stand;
    close(sy,mountainHeightAt(sx,sz));
  }
});

test('mountain triangles face upward and remain finite',()=> {
  for(const [a,b,c] of MOUNTAIN_TRIANGLES) {
    assert.ok([...a,...b,...c].every(Number.isFinite));
    assert.ok((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>1e-9);
  }
});

test('hillside trail faces remain above the ground instead of cutting through ridges',()=> {
  for(const route of MOUNTAIN_TRAILS) {
    const geometry=ribbonGeometry(route,.38,(x,z)=>mountainHeightAt(x,z)+.045);
    const p=geometry.attributes.position,index=geometry.index;
    for(let i=0;i<index.count;i+=3) {
      const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];
      const x=ids.reduce((n,id)=>n+p.getX(id),0)/3,y=ids.reduce((n,id)=>n+p.getY(id),0)/3,z=ids.reduce((n,id)=>n+p.getZ(id),0)/3;
      assert.ok(y>mountainHeightAt(x,z)+.005,`buried trail near ${x},${z}`);
    }
    geometry.dispose();
  }
});
