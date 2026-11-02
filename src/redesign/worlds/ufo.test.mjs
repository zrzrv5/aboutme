import test from 'node:test';
import assert from 'node:assert/strict';
import { ufoPose, SPOTS } from './ufo.js';
import { insideShore } from './walk.js';

test('the UFO patrol never jumps and never flies over the island',()=>{
  let previous=ufoPose(0);
  for(let t=1/60;t<200;t+=1/60) {
    const pose=ufoPose(t);
    assert.ok(Math.hypot(pose.x-previous.x,pose.z-previous.z)<.25,`jump at ${t.toFixed(2)}s`);
    assert.ok(Math.abs(pose.spin-previous.spin)<.15&&Math.abs(pose.lift-previous.lift)<.05&&Math.abs(pose.beam-previous.beam)<.1,`snap at ${t.toFixed(2)}s`);
    assert.ok(!insideShore(pose.x,pose.z,1.08),`over the island at ${t.toFixed(2)}s (${pose.x.toFixed(1)}, ${pose.z.toFixed(1)})`);
    previous=pose;
  }
  for(const [x,z] of SPOTS)assert.ok(!insideShore(x,z,1.12));
});

test('lap boundaries are safe at any time',()=>{
  const cycle=7*5.6;
  for(const laps of [1,100,1e4,3.7e5])for(const nudge of [-1e-9,0,1e-9]) {
    const pose=ufoPose(laps*cycle-2+nudge);
    assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.z)&&Number.isFinite(pose.spin));
  }
});

test('the beam scans while the UFO hovers and goes out while it darts',()=>{
  const hovering=ufoPose(0),darting=ufoPose(2.8);
  assert.equal(hovering.speed,0);assert.ok(hovering.beam>.99);
  assert.ok(darting.speed>.9);assert.equal(darting.beam,0);assert.ok(darting.lift>.3);
});
