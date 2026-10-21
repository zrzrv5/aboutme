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
  const gestures = [];
  const orbit = createWorldCamera(camera,surface,{
    surface,reduced,view,onChange:()=>changes++,onHoverClear:()=>{},onPick:()=>picks++,onGesture:kind=>gestures.push(kind),
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
  return {surface,reduced,camera,orbit,event,down,move,up,picks:()=>picks,changes:()=>changes,gestures};
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

test('region zoom preserves orientation and survives resize, then zooming out restores the overview',()=>{
  const near=(actual,expected)=>actual.forEach((value,axis)=>assert.ok(Math.abs(value-expected[axis])<.001));
  const h=setup({reduce:true});
  const before=h.orbit.getView();
  h.orbit.focus([-5.1,0,-3.8],1.5);
  const focused=h.orbit.getView();
  near(focused.target,[-5.1,0,-3.8]);
  assert.equal(focused.zoom,1.5);
  assert.equal(h.picks(),0);
  for(let axis=0;axis<3;axis++)assert.ok(Math.abs((focused.position[axis]-focused.target[axis])-(before.position[axis]-before.target[axis]))<.001);
  h.orbit.resize(390,844,true);
  near(h.orbit.getView().target,focused.target);
  const restored=setup({reduce:true,view:focused});
  near(restored.orbit.getView().target,focused.target);
  for(let i=0;i<3;i++)h.event(h.surface,'keydown',{key:'-'});
  near(h.orbit.getView().target,before.target);
  h.orbit.reset();assert.equal(h.camera.zoom,1);
  h.orbit.dispose();restored.orbit.dispose();
});

test('Shift-drag, a two-finger drag and WASD pan the zoomed-in view, and stop at the shoreline',()=>{
  const near=(actual,expected)=>actual.forEach((value,axis)=>assert.ok(Math.abs(value-expected[axis])<.001,`${value} != ${expected[axis]}`));
  const h=setup({reduce:true});
  h.orbit.focus([0,0,-2.4],1.6);
  const start=h.orbit.getView();
  // Shift-drag pans: target and camera move together, no place opens.
  h.event(h.surface,'pointerdown',{shiftKey:true});h.move(480,300);h.up(480,300);
  const panned=h.orbit.getView();
  assert.ok(Math.hypot(panned.target[0]-start.target[0],panned.target[2]-start.target[2])>.5,'Shift-drag should pan');
  assert.ok(Math.abs(panned.target[1]-start.target[1])<1e-6,'panning stays on the ground plane');
  for(let axis=0;axis<3;axis++)assert.ok(Math.abs((panned.position[axis]-panned.target[axis])-(start.position[axis]-start.target[axis]))<.001);
  h.event(h.surface,'click');assert.equal(h.picks(),0);
  // A plain drag still rotates about the panned target.
  h.down();h.move(470,300);h.up(470,300);
  near(h.orbit.getView().target,panned.target);
  // Two fingers moving together pan on touch.
  const beforeTouch=h.orbit.getView();
  h.down(300,300,1,true);h.down(500,300,2,true);h.move(300,380,1,true);h.move(500,380,2,true);h.up(300,380,1,true);h.up(500,380,2,true);
  const afterTouch=h.orbit.getView();
  assert.ok(Math.hypot(afterTouch.target[0]-beforeTouch.target[0],afterTouch.target[2]-beforeTouch.target[2])>.3,'two-finger drag should pan');
  assert.ok(Math.abs(afterTouch.zoom-beforeTouch.zoom)<.01);
  // Keys pan too, and however long you hold one the centre stays over the island.
  const beforeKeys=h.orbit.getView();
  h.event(h.surface,'keydown',{key:'d'});
  assert.ok(h.orbit.getView().target[0]!==beforeKeys.target[0]);
  for(let i=0;i<400;i++)h.event(h.surface,'keydown',{key:'d'});
  assert.ok(h.orbit.getView().target[0]<=12.2+1e-6,'target left the island');
  for(let i=0;i<400;i++)h.event(h.surface,'keydown',{key:'ArrowUp',shiftKey:true});
  assert.ok(h.orbit.getView().target[2]>=-14.6-1e-6);
  // Zooming back out restores the overview centre as before.
  for(let i=0;i<4;i++)h.event(h.surface,'keydown',{key:'-'});
  near(h.orbit.getView().target,[0,0,-2.4]);
  h.orbit.dispose();
});

test('follow eases the view toward a point only once it nears the edge',()=>{
  const h=setup({reduce:true});
  h.orbit.focus([0,0,-2.4],1.8);
  const start=h.orbit.getView();
  h.orbit.follow({x:0,y:.35,z:-2,clone(){return new (Object.getPrototypeOf(h.camera.position).constructor)(this.x,this.y,this.z);}});
  assert.deepEqual(h.orbit.getView().target,start.target);
  const far={x:12,y:.35,z:-2.4,clone(){return new (Object.getPrototypeOf(h.camera.position).constructor)(this.x,this.y,this.z);}};
  for(let i=0;i<40;i++)h.orbit.follow(far);
  const after=h.orbit.getView();
  assert.ok(after.target[0]>3&&after.target[0]<=12.2,'the view should have moved toward the point without overshooting');
  h.orbit.dispose();
});

test('each gesture reports its kind once it really moves the camera, and region focus reports none',()=>{
  const h=setup({reduce:true});
  h.orbit.focus([0,0,-2.4],1.6);
  assert.deepEqual(h.gestures,[]);
  h.down();h.move(470,300);h.up(470,300);
  assert.equal(h.gestures.at(-1),'rotate');
  h.event(h.surface,'pointerdown',{shiftKey:true});h.move(480,300);h.up(480,300);
  assert.equal(h.gestures.at(-1),'pan');
  h.event(h.surface,'wheel');
  assert.equal(h.gestures.at(-1),'zoom');
  h.event(h.surface,'keydown',{key:'d'});assert.equal(h.gestures.at(-1),'pan');
  h.event(h.surface,'keydown',{key:'ArrowLeft'});assert.equal(h.gestures.at(-1),'rotate');
  h.event(h.surface,'keydown',{key:'-'});assert.equal(h.gestures.at(-1),'zoom');
  h.down(300,300,1,true);h.down(500,300,2,true);h.move(300,380,1,true);h.move(500,380,2,true);h.up(300,380,1,true);h.up(500,380,2,true);
  assert.equal(h.gestures.at(-1),'pan');
  // A tap that never moves is not a gesture.
  const before=h.gestures.length;h.down();h.up();assert.equal(h.gestures.length,before);
  h.orbit.dispose();
});
