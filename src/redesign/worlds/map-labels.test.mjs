import test from 'node:test';
import assert from 'node:assert/strict';
import {mapLabelLevel,placeMapLabels} from './map-labels.js';

test('map labels use distinct zoom thresholds when entering and leaving areas',()=>{
  assert.equal(mapLabelLevel(1),'overview');
  assert.equal(mapLabelLevel(1.3),'areas');
  assert.equal(mapLabelLevel(1.2,'areas'),'areas');
  assert.equal(mapLabelLevel(1.2,'overview'),'overview');
  assert.equal(mapLabelLevel(1.1,'areas'),'overview');
});
test('nearby map labels separate on screen and offscreen anchors stay hidden',()=>{
  const labels=placeMapLabels([
    {id:'study',name:'Academic',kind:'area',x:2,y:50},
    {id:'work',name:'Work',kind:'area',x:2,y:50},
    {id:'ml',name:'ML & AI',kind:'area',x:120,y:40,hidden:true},
  ],390,844);
  assert.ok(labels[0].x>2);
  assert.ok(Math.abs(labels[0].y-labels[1].y)*844/100>=48-1e-8);
  assert.equal(labels[2].hidden,true);
  assert.ok(placeMapLabels([{name:'Personal projects',kind:'region',x:50,y:50}],100,200)[0].hidden);
});
