import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WORLD_CENTER } from './world-layout.js';
import { SHORE } from './landscape.js';

// Panning stops at the shoreline's bounding box.
const BOUNDS=SHORE.reduce((b,[x,z])=>({minX:Math.min(b.minX,x),maxX:Math.max(b.maxX,x),minZ:Math.min(b.minZ,z),maxZ:Math.max(b.maxZ,z)}),{minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity});
const KEY_PAN=40; // pixels per key press

// Keep picking separate from the orbit gesture: releasing a drag or pinch must
// never open whatever happens to be under the pointer at the end of the gesture.
export function createWorldCamera(camera, canvas, { surface, reduced, view, onChange, onInteract, onGesture, onReset, onHoverClear, onPick }) {
  const controls = new OrbitControls(camera,surface);
  const overviewCenter=new THREE.Vector3(...WORLD_CENTER);
  controls.target.copy(overviewCenter);
  // Drag rotates; Shift-drag, the middle or right button and a two-finger
  // drag pan across the ground plane once the island is zoomed in.
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.panSpeed = .9;
  controls.enableDamping = !reduced.matches;
  controls.dampingFactor = .12;
  controls.rotateSpeed = .65;
  controls.zoomSpeed = .8;
  controls.minPolarAngle = Math.PI / 7;
  controls.maxPolarAngle = Math.PI * .39;
  controls.minZoom = .7;
  controls.maxZoom = 2.5;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.cursorStyle = 'grab';

  let width = 1, height = 1;
  let touched = view?.touched ?? false;
  let moved = false;
  const pointers = new Map();
  if (view) {
    camera.position.fromArray(view.position);
    if(view.target)controls.target.fromArray(view.target);
    camera.zoom = view.zoom;
    camera.updateProjectionMatrix();
    controls.update();
  }

  const clampTarget = () => {
    const t=controls.target,x=Math.min(BOUNDS.maxX,Math.max(BOUNDS.minX,t.x)),z=Math.min(BOUNDS.maxZ,Math.max(BOUNDS.minZ,t.z));
    if(Math.abs(x-t.x)<1e-6&&Math.abs(z-t.z)<1e-6)return false;
    // Slide camera and target together, so the orbit itself is untouched.
    camera.position.x+=x-t.x;camera.position.z+=z-t.z;t.x=x;t.z=z;
    return true;
  };
  const changed = () => {
    // Pull back to the whole island when leaving a focused region; while
    // zoomed in, keep the view's centre over the island.
    if(camera.zoom<=1.1&&controls.target.distanceTo(overviewCenter)>.01){
      camera.position.add(overviewCenter.clone().sub(controls.target));
      controls.target.copy(overviewCenter);
      controls.update();
    } else clampTarget();
    camera.updateMatrixWorld();
    onChange();
  };
  controls.addEventListener('change',changed);

  const defaultPosition = () => width / height < .85
    ? new THREE.Vector3(30,42,2).add(new THREE.Vector3(...WORLD_CENTER))
    : new THREE.Vector3(0,34,24).add(new THREE.Vector3(...WORLD_CENTER));

  // OrbitControls' state numbers: 0/3/6 rotate, 2/4/5 pan, 1 dolly.
  const GESTURES = ['rotate','zoom','pan','rotate','pan','pan','rotate'];
  function interact(kind = GESTURES[controls.state] ?? 'rotate') {
    touched = true;
    onInteract?.();
    onGesture?.(kind);
  }
  function down(event) {
    if (pointers.size === 0) moved = false;
    // OrbitControls must not capture a label's pointer and retarget its click
    // onto the surface. Native buttons keep their ordinary click behavior.
    if(event.target.closest?.('button')){event.stopPropagation();return;}
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (pointers.size > 1) moved = true;
    onHoverClear();
    canvas.style.cursor = 'grabbing';
  }
  function move(event, settling = false) {
    const start = pointers.get(event.pointerId);
    if (!start) return;
    const threshold = event.pointerType === 'touch' ? 10 : 6;
    if (Math.hypot(event.clientX-start.x,event.clientY-start.y) >= threshold) moved = true;
    if (!moved) return;
    // A release only settles the drag: by then a lifted second finger has
    // already put OrbitControls back into one-finger rotate state.
    if (settling) { touched = true; onInteract?.(); } else interact();
  }
  function up(event) {
    if (!pointers.has(event.pointerId)) return;
    move(event, true);
    pointers.delete(event.pointerId);
    if (event.type !== 'pointerup') moved = true;
    if (pointers.size === 0) canvas.style.cursor = 'grab';
  }
  function guardClick(event) {
    // detail=0 is a keyboard/assistive-technology activation, not a pointer tap.
    if (event.detail !== 0 && moved) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  function pick(event) {
    // Keyboard-accessible world buttons already have their own React handlers.
    if (!event.target.closest('button')) onPick(event);
  }
  function wheel() {
    interact('zoom');
    onHoverClear();
  }
  function reset() {
    // Flush residual damping before resetting, so the old gesture cannot pull
    // the camera away from its new starting position on the next frame.
    controls.enableDamping = false;
    controls.update();
    controls.target.fromArray(WORLD_CENTER);
    camera.position.copy(defaultPosition());
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
    controls.enableDamping = !reduced.matches;
    touched = false;
    changed();
    onReset?.();
  }
  function key(event) {
    if (event.target !== canvas || event.metaKey || event.ctrlKey || event.altKey) return;
    const pan = event.shiftKey;
    const actions = {
      ArrowLeft: () => pan ? controls.pan(KEY_PAN,0) : controls.rotateLeft(.15),
      ArrowRight: () => pan ? controls.pan(-KEY_PAN,0) : controls.rotateLeft(-.15),
      ArrowUp: () => pan ? controls.pan(0,KEY_PAN) : controls.rotateUp(.1),
      ArrowDown: () => pan ? controls.pan(0,-KEY_PAN) : controls.rotateUp(-.1),
      w: () => controls.pan(0,KEY_PAN),
      s: () => controls.pan(0,-KEY_PAN),
      a: () => controls.pan(KEY_PAN,0),
      d: () => controls.pan(-KEY_PAN,0),
      '+': () => controls.dollyIn(1 / 1.15),
      '=': () => controls.dollyIn(1 / 1.15),
      '-': () => controls.dollyOut(1 / 1.15),
      Home: reset,
    };
    const name = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (!actions[name]) return;
    event.preventDefault();
    onHoverClear();
    if (name !== 'Home') interact(/^[wasd]$/.test(name) || pan ? 'pan' : name.startsWith('Arrow') ? 'rotate' : 'zoom');
    actions[name]();
  }
  function motionPreference() {
    controls.enableDamping = !reduced.matches;
    controls.update();
  }

  surface.addEventListener('pointerdown',down,true);
  surface.ownerDocument.addEventListener('pointermove',move,true);
  surface.ownerDocument.addEventListener('pointerup',up,true);
  surface.addEventListener('pointercancel',up,true);
  surface.addEventListener('lostpointercapture',up,true);
  surface.addEventListener('click',guardClick,true);
  surface.addEventListener('click',pick);
  surface.addEventListener('wheel',wheel,{passive:true});
  surface.addEventListener('keydown',key);
  reduced.addEventListener('change',motionPreference);

  return {
    update: () => controls.update(),
    isInteracting: () => pointers.size > 0,
    getView: () => ({position:camera.position.toArray(),target:controls.target.toArray(),zoom:camera.zoom,touched}),
    focus(target,zoom=1.5) {
      controls.enableDamping=false;controls.update();
      const next=new THREE.Vector3(...target);
      camera.position.add(next.clone().sub(controls.target));
      controls.target.copy(next);
      camera.zoom=Math.max(controls.minZoom,Math.min(controls.maxZoom,zoom));
      camera.updateProjectionMatrix();
      touched = true;onInteract?.();onHoverClear();controls.update();
      controls.enableDamping=!reduced.matches;
      changed();
    },
    // Ease the view after a point (the walking frog) once it nears the edge of
    // the viewport, so a zoomed-in camera keeps it in sight without jumping.
    follow(point) {
      const ndc=point.clone().project(camera);
      if(Math.abs(ndc.x)<.55&&Math.abs(ndc.y)<.55)return;
      const shift=new THREE.Vector3(point.x-controls.target.x,0,point.z-controls.target.z).multiplyScalar(.06);
      controls.target.add(shift);camera.position.add(shift);
      if(!controls.update())changed();
    },
    reset,
    resize(w,h,inspecting) {
      width = w; height = h;
      if (!touched) camera.position.copy(defaultPosition());
      const aspect = width / height;
      // Include the rear ML terrace while preserving the user's adjusted zoom.
      const span = aspect < .85 ? Math.max(28,27/aspect) : Math.max(23.5,29/aspect);
      const lift = inspecting && height > width ? span*.13 : 0;
      camera.left = -span*aspect/2; camera.right = span*aspect/2;
      camera.top = span/2-lift; camera.bottom = -span/2-lift;
      camera.updateProjectionMatrix();
      controls.update();
      changed();
    },
    dispose() {
      controls.removeEventListener('change',changed);
      controls.dispose();
      surface.removeEventListener('pointerdown',down,true);
      surface.ownerDocument.removeEventListener('pointermove',move,true);
      surface.ownerDocument.removeEventListener('pointerup',up,true);
      surface.removeEventListener('pointercancel',up,true);
      surface.removeEventListener('lostpointercapture',up,true);
      surface.removeEventListener('click',guardClick,true);
      surface.removeEventListener('click',pick);
      surface.removeEventListener('wheel',wheel);
      surface.removeEventListener('keydown',key);
      reduced.removeEventListener('change',motionPreference);
      pointers.clear();
    },
  };
}
