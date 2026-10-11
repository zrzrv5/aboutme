import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera } from 'three';
import { createWorldCamera } from './world-camera.js';

// Exercise the real OrbitControls event handlers and camera math without WebGL.
// The surface supplies only the DOM geometry and pointer-capture contract.
class Surface extends EventTarget {
  style = {};
  clientWidth = 800;
  clientHeight = 600;
  ownerDocument = new EventTarget();
  captures = new Set();
  getRootNode() { return this.ownerDocument; }
  getBoundingClientRect() { return {left:0,top:0,width:this.clientWidth,height:this.clientHeight}; }
  setPointerCapture(id) { this.captures.add(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  closest() { return null; }
}

function setup({reduce = false, view} = {}) {
  const surface = new Surface();
  const reduced = new EventTarget();
  reduced.matches = reduce;
  const camera = new OrthographicCamera(-15,15,11.25,-11.25,.1,100);
  camera.position.set(0,34,24);
  camera.lookAt(0,0,0);
  let picks = 0;
  let changes = 0;
  const orbit = createWorldCamera(camera,surface,{
    surface,reduced,view,onChange:()=>changes++,onHoverClear:()=>{},onPick:()=>picks++,
  });
  orbit.resize(800,600,false);
  function event(target,type,props = {}) {
    const value = new Event(type,{cancelable:true});
    Object.assign(value,{pointerId:1,pointerType:'mouse',button:0,clientX:400,clientY:300,pageX:400,pageY:300,detail:1,...props});
    target.dispatchEvent(value);
    return value;
  }
  const down = (x=400,y=300,id=1,touch=false) => event(surface,'pointerdown',{clientX:x,clientY:y,pageX:x,pageY:y,pointerId:id,pointerType:touch?'touch':'mouse'});
  const move = (x,y,id=1,touch=false) => event(surface.ownerDocument,'pointermove',{clientX:x,clientY:y,pageX:x,pageY:y,pointerId:id,pointerType:touch?'touch':'mouse'});
  const up = (x=400,y=300,id=1,touch=false) => event(surface.ownerDocument,'pointerup',{clientX:x,clientY:y,pageX:x,pageY:y,pointerId:id,pointerType:touch?'touch':'mouse'});
  return {surface,reduced,camera,orbit,event,down,move,up,picks:()=>picks,changes:()=>changes};
}

test('a drag rotates the world without opening a place; the next tap still opens it', () => {
  const h = setup();
  const before = h.camera.position.clone();
  h.down(); h.move(550,340); h.up(550,340);
  const click = h.event(h.surface,'click',{clientX:550,clientY:340});
  assert.ok(h.camera.position.distanceTo(before) > 1);
  assert.ok(click.defaultPrevented);
  assert.equal(h.picks(),0);
  assert.equal(h.orbit.isInteracting(),false);
  h.down(); h.up(); h.event(h.surface,'click');
  assert.equal(h.picks(),1);
  h.orbit.dispose();
});

test('returning a drag to its starting point does not turn it back into a tap', () => {
  const h = setup();
  h.down(); h.move(520,300); h.move(400,300); h.up();
  h.event(h.surface,'click');
  assert.equal(h.picks(),0);
  h.orbit.dispose();
});

test('a two-finger pinch zooms; cancel and release leave no active gesture or accidental click', () => {
  const h = setup();
  h.down(300,300,1,true); h.down(500,300,2,true);
  h.move(250,300,1,true); h.move(550,300,2,true);
  assert.ok(h.camera.zoom > 1.2);
  h.event(h.surface,'pointercancel',{pointerId:1,pointerType:'touch',clientX:250,pageX:250});
  h.up(550,300,2,true);
  h.event(h.surface,'click');
  assert.equal(h.picks(),0);
  assert.equal(h.orbit.isInteracting(),false);
  h.down(); h.up(); h.event(h.surface,'click');
  assert.equal(h.picks(),1);
  h.orbit.dispose();
});

test('resizing, opening a dialogue and changing art preserve an adjusted view; reset removes inertia', () => {
  const h = setup();
  h.down(); h.move(550,330); h.up(550,330);
  for (let i=0;i<150;i++) h.orbit.update();
  h.event(h.surface,'keydown',{key:'+'});
  const view = h.orbit.getView();
  h.orbit.resize(375,812,true);
  assert.ok(h.camera.position.distanceTo({x:view.position[0],y:view.position[1],z:view.position[2]}) < .001);
  const replacement = setup({view});
  assert.ok(Math.abs(replacement.camera.zoom-view.zoom) < .001);
  assert.ok(replacement.camera.position.distanceTo(h.camera.position) < .001);
  h.orbit.reset();
  const reset = h.camera.position.clone();
  for (let i=0;i<30;i++) h.orbit.update();
  assert.ok(h.camera.position.distanceTo(reset) < .001);
  assert.equal(h.camera.zoom,1);
  h.orbit.dispose(); replacement.orbit.dispose();
});

test('zoom and tilt stay bounded; reduced motion has no trailing drift; disposal removes handlers', () => {
  const h = setup({reduce:true});
  for (let i=0;i<40;i++) h.event(h.surface,'keydown',{key:'+'});
  assert.equal(h.camera.zoom,2.5);
  for (let i=0;i<40;i++) h.event(h.surface,'keydown',{key:'-'});
  assert.equal(h.camera.zoom,.7);
  h.down(); h.move(440,1400); h.up(440,1400);
  const position = h.camera.position.clone();
  assert.ok(position.y > 0);
  for (let i=0;i<30;i++) h.orbit.update();
  assert.ok(position.distanceTo(h.camera.position) < .001);
  h.orbit.dispose();
  const changes = h.changes();
  h.event(h.surface,'keydown',{key:'ArrowRight'});
  h.down(); h.move(600,300); h.up(600,300); h.event(h.surface,'click');
  assert.equal(h.changes(),changes);
  assert.equal(h.picks(),0);
});
