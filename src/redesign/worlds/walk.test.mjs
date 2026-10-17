import test from 'node:test';
import assert from 'node:assert/strict';
import { walkTarget, planWalk, insideShore, riverDistance, onBridge, WALK_SPEED, HOP_LENGTH } from './walk.js';
import { GROUND, CROSSINGS, RIVER_POINTS, ML_SITES, mountainHeightAt } from './landscape.js';

test('the frog may be sent onto the lawn, the hillside and the bridges, but not into water or off the island',()=>{
  assert.deepEqual(walkTarget(-3,2),[-3,GROUND,2]);
  // A clearing on the ML hill stands on its plateau height.
  const site=ML_SITES.gradbench;
  assert.deepEqual(walkTarget(site.x,site.z),[site.x,site.height,site.z]);
  assert.ok(mountainHeightAt(site.x,site.z)>GROUND);
  // The river itself is out, the bridge deck across it is in.
  for(const [x,z] of RIVER_POINTS.slice(1,-1))assert.equal(walkTarget(x,z),null,`river at ${x},${z}`);
  const deck=CROSSINGS.visualization.center;
  assert.ok(onBridge(...deck));assert.ok(riverDistance(...deck)<.3);
  assert.deepEqual(walkTarget(...deck),[deck[0],GROUND,deck[1]]);
  // Just off the deck, on the water, is still refused.
  const aside=[deck[0]+CROSSINGS.visualization.tangent[0]*.9,deck[1]+CROSSINGS.visualization.tangent[1]*.9];
  assert.equal(walkTarget(...aside),null);
  // The sea, the beach bevel and a point past the shoreline are refused.
  assert.equal(walkTarget(-20,0),null);assert.equal(walkTarget(-12.6,-2),null);
  assert.ok(insideShore(0,0));assert.ok(!insideShore(13,0));
});

test('walks keep a constant speed in whole hops; a short hop keeps the old high arc',()=>{
  const short=planWalk([0,0,0],[.8,0,.4]);
  assert.equal(short.hops,1);assert.equal(short.duration,550);assert.equal(short.height,1.25);
  const long=planWalk([0,0,0],[9,0,12]);
  assert.equal(long.distance,15);assert.equal(long.hops,Math.round(15/HOP_LENGTH));
  assert.ok(Math.abs(long.duration-15/WALK_SPEED*1000)<1e-6);assert.ok(long.height<short.height);
  // Retargeting from anywhere plans from the current spot, never from the old start.
  assert.ok(planWalk([5,0,5],[9,0,12]).duration<long.duration);
});
