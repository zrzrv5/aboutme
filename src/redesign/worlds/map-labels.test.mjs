import test from 'node:test';
import assert from 'node:assert/strict';
import {mapLabelLevel,resolveMapLabels} from './map-labels.js';

test('map labels use distinct zoom thresholds when entering and leaving areas',()=>{
  assert.equal(mapLabelLevel(1),'overview');
  assert.equal(mapLabelLevel(1.3),'areas');
  assert.equal(mapLabelLevel(1.2,'areas'),'areas');
  assert.equal(mapLabelLevel(1.2,'overview'),'overview');
  assert.equal(mapLabelLevel(1.1,'areas'),'overview');
});
test('colliding labels fade instead of moving, and the visible one keeps its place',()=>{
  const label=(x,y,shown=false)=>({x,y,w:120,h:24,shown});
  assert.deepEqual(resolveMapLabels([label(200,300),label(230,305)],800,600),[true,false]);
  // The label already on screen wins, whatever its order.
  assert.deepEqual(resolveMapLabels([label(200,300),label(230,305,true)],800,600),[false,true]);
  assert.deepEqual(resolveMapLabels([label(200,300),label(600,300)],800,600),[true,true]);
});
test('labels near an edge, under the menu, offscreen or unmeasured stay hidden',()=>{
  const label=extra=>({x:400,y:300,w:120,h:24,...extra});
  assert.deepEqual(resolveMapLabels([label({x:30}),label({x:770,y:60}),label({offscreen:true}),label({w:0})],800,600),[false,false,false,false]);
  assert.equal(resolveMapLabels([label({x:66})],800,600)[0],true);
});
test('a hidden label needs extra room from its neighbours before it returns',()=>{
  const label=(x,shown)=>({x,y:300,w:120,h:24,shown});
  // 15px apart: enough for a label that is already visible, not for one coming back.
  assert.deepEqual(resolveMapLabels([label(200,true),label(335,true)],800,600),[true,true]);
  assert.deepEqual(resolveMapLabels([label(200,true),label(335,false)],800,600),[true,false]);
});
