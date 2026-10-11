import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { batchWorld } from './batch-world.js';
import { createNAIIVEGeometry } from './naiive-geometry.js';
import { buildGilman } from './gilman.js';
import { RIVER_POINTS,RIVER_OUTLET,riverHeightAt,ribbonGeometry,waterfallGeometry } from './landscape.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
test('Gilman light-well walls face into the courtyard and leave the roof opening clear',()=>{
  const campus=new THREE.Group(),walls=[],owned=[],material=new THREE.MeshBasicMaterial();
  const mesh=(parent,geometry,_color,position=[0,0,0])=>{
    const model=new THREE.Mesh(geometry,material);model.position.fromArray(position);parent.add(model);owned.push(geometry);
    if(geometry.type==='ExtrudeGeometry')walls.push(model);
    return model;
  };
  const box=(p,w,h,d,c,x=0,y=0,z=0)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,[x,y,z]);
  const cylinder=(p,a,b,h,c,x=0,y=0,z=0,n=12)=>mesh(p,new THREE.CylinderGeometry(a,b,h,n),c,[x,y,z]);
  try {
    buildGilman(campus,{box,cylinder,mesh});campus.updateMatrixWorld(true);
    // Trace from the empty court toward each wall using ordinary front-face
    // culling. The same visibility must hold for the foundation, brick and roof.
    for(const y of [.04,.7,1.018])for(const [direction,distance] of [
      [[1,0,0],.146],[[-1,0,0],.146],[[0,0,1],.330],[[0,0,-1],.330],
    ]) {
      const ray=new THREE.Raycaster(new THREE.Vector3(-.014,y,.826),new THREE.Vector3(...direction));
      const hit=ray.intersectObjects(walls)[0];
      assert.ok(hit,`Missing courtyard wall at height ${y}, direction ${direction}`);
      near(hit.distance,distance);assert.ok(hit.face.normal.dot(ray.ray.direction)<-.99);
    }
    const sky=new THREE.Raycaster(new THREE.Vector3(-.014,3,.826),new THREE.Vector3(0,-1,0));
    assert.equal(sky.intersectObject(campus,true).length,0,'A roof or accessory closes the light well');
  } finally {owned.forEach(g=>g.dispose());material.dispose();}
});

test('batching preserves geometry, picking roots and independently animated transforms',()=>{
  const scene=new THREE.Scene(),campus=new THREE.Group(),spinner=new THREE.Group(),owned=new Set();
  campus.userData={id:'isu'};campus.position.set(-2,.35,-5);scene.add(campus);
  spinner.userData.dynamic=true;spinner.position.set(3,1,0);campus.add(spinner);
  const mat=new THREE.MeshBasicMaterial({color:'#fff'}),sources=[];
  for(const parent of [campus,spinner])for(const x of [-.7,.7]){
    const g=new THREE.BoxGeometry(1,1,1),m=new THREE.Mesh(g,mat);owned.add(g);m.position.x=x;parent.add(m);sources.push(g);
  }
  let freed=0;for(const g of sources)g.addEventListener('dispose',()=>freed++);
  scene.updateMatrixWorld(true);const before=new THREE.Box3().setFromObject(campus);
  batchWorld(scene,owned);scene.updateMatrixWorld(true);
  const after=new THREE.Box3().setFromObject(campus);
  before.min.toArray().forEach((v,i)=>near(v,after.min.toArray()[i]));before.max.toArray().forEach((v,i)=>near(v,after.max.toArray()[i]));
  assert.equal(freed,4);assert.equal(owned.size,2);assert.equal(spinner.parent,campus);assert.equal(spinner.matrixAutoUpdate,true);
  const ray=new THREE.Raycaster(new THREE.Vector3(-2.7,5,-5),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(campus,true)[0];assert.ok(hit);assert.equal(hit.object.parent.userData.id,'isu');
  const old=new THREE.Box3().setFromObject(spinner);spinner.rotation.y=Math.PI/2;scene.updateMatrixWorld(true);const rotated=new THREE.Box3().setFromObject(spinner);assert.ok(old.max.x-rotated.max.x>.5);
  owned.forEach(g=>g.dispose());mat.dispose();
});

test('NAIIVE spins around the outer top and bottom tips of the 2D logo',()=>{
  const {points,edges,rgb,axis,pose,worldAxis,frontFace,poles}=createNAIIVEGeometry();
  assert.equal(points.length,12);assert.equal(edges.length,30);assert.equal(rgb.size,3);
  const [top,bottom]=poles.map(i=>points[i]);
  near(top.y,Math.max(...points.map(p=>p.y)));near(bottom.y,Math.min(...points.map(p=>p.y)));
  near(top.x,0);near(bottom.x,0);assert.ok(top.clone().add(bottom).length()<1e-8);
  assert.ok(poles.every(i=>!frontFace.includes(i)),'The RGB junction must not be mistaken for an outer tip');
  for(const angle of [0,.73,Math.PI,Math.PI*2]) {
    const spin=new THREE.Quaternion().setFromAxisAngle(axis,angle);
    assert.ok(axis.clone().applyQuaternion(spin).applyQuaternion(pose).distanceTo(worldAxis)<1e-8);
    for(const p of [top,bottom])assert.ok(p.clone().applyQuaternion(spin).applyQuaternion(pose).distanceTo(p.clone().applyQuaternion(pose))<1e-8);
  }
  const rgbJunction=points[frontFace[0]];
  assert.ok(rgbJunction.clone().applyAxisAngle(axis,Math.PI/2).distanceTo(rgbJunction)>1,'RGB bonds should turn around the fixed silhouette tips');
  // Opposite vertices define the icosahedron's fivefold symmetry axis.
  for(const p of points){const turned=p.clone().applyAxisAngle(axis,Math.PI*2/5);assert.ok(points.some(v=>v.distanceTo(turned)<1e-8));}
});

test('the full river lip meets the waterfall without a height or width gap',()=>{
  const river=ribbonGeometry(RIVER_POINTS,.56,riverHeightAt),fall=waterfallGeometry();
  const positions=river.attributes.position,lip=fall.attributes.position;
  const last=[new THREE.Vector3().fromBufferAttribute(positions,positions.count-7),new THREE.Vector3().fromBufferAttribute(positions,positions.count-1)];
  for(let i=0;i<2;i++){const corner=new THREE.Vector3().fromBufferAttribute(lip,i);assert.ok(last.some(p=>p.distanceTo(corner)<1e-4));}
  near(lip.getY(0),riverHeightAt(...RIVER_OUTLET.at));assert.ok(lip.getY(2)<-.78);
  river.dispose();fall.dispose();
});
