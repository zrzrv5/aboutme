import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { batchWorld } from './batch-world.js';
import { spinProgress, SONG, SONG_SECONDS, SPIN_SECONDS, LETTER_SECONDS, CAT_MODEL, buildOiiaCat } from './oiia-cat.js';

test('the spin starts and stops at rest and always ends facing the sea',()=>{
  assert.equal(spinProgress(0),0);assert.equal(spinProgress(1),1);
  let previous=0,fastest=0;
  for(let i=1;i<=1000;i++){const p=i/1000,value=spinProgress(p);assert.ok(value>=previous);fastest=Math.max(fastest,value-previous);previous=value;}
  assert.ok(spinProgress(.002)<fastest&&1-spinProgress(.998)<fastest,'The cat jumps to full speed or stops dead');
});

test('the song spells OIIA twice, inside the spin',()=>{
  assert.equal(SONG.map(note=>note.letter).join(''),'OIIAOIIA');
  for(const [i,note] of SONG.entries()) {
    assert.ok(note.end>note.at);
    if(SONG[i+1]?.phrase===note.phrase)assert.equal(SONG[i+1].at,note.end,'A phrase is sung in one breath');
  }
  assert.ok(SONG[4].at>SONG[3].end,'The phrases need a rest between them');
  assert.ok(SONG_SECONDS<SPIN_SECONDS);
  assert.ok(SONG.every(note=>note.at+LETTER_SECONDS<=SPIN_SECONDS),'A letter outlives the spin');
});

test('the cat is only clickable once its model loads, and spins after batching',()=>{
  const scene=new THREE.Scene(),dock=new THREE.Group(),owned=new Set(),material=new THREE.MeshBasicMaterial();
  dock.position.set(6.4,.35,6.5);dock.rotation.y=.36;scene.add(dock);
  const mesh=(parent,geometry,_color,position=[0,0,0])=>{const model=new THREE.Mesh(geometry,material);model.position.fromArray(position);parent.add(model);owned.add(geometry);return model;};
  let loaded;
  const loadModel=(parent,url,{onReady})=>{assert.equal(url,CAT_MODEL);loaded=()=>{mesh(parent,new THREE.BoxGeometry(.5,.7,.4),'#fff',[0,.35,0]);onReady();};};
  const cat=buildOiiaCat(dock,{mesh,loadModel,layer:scene,camera:new THREE.OrthographicCamera(),at:[.24,.06,1.5]});
  batchWorld(scene,owned);scene.updateMatrixWorld(true);
  const [x,y,z]=cat.position(),ray=new THREE.Raycaster(new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0));
  assert.equal(cat.hit(ray),false);assert.equal(cat.start(0,false),false);
  loaded();scene.updateMatrixWorld(true);
  assert.equal(cat.ready(),true);assert.equal(cat.hit(ray),true);
  assert.equal(cat.hit(new THREE.Raycaster(new THREE.Vector3(x+1,5,z),new THREE.Vector3(0,-1,0))),false,'The click target spills off the dock');
  cat.dispose();owned.forEach(g=>g.dispose());material.dispose();
});
