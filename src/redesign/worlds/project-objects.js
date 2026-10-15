import * as THREE from 'three';
import { createNAIIVEGeometry } from './naiive-geometry';
import { createHologramMaterial } from './hologram';
import { mountainHeightAt } from './landscape';

// Project souvenirs and the user-supplied AmiiBot model share the world's lighting,
// picking, geometry disposal and reduced-motion clock.
export function buildProjectObjects({ group, box, cylinder, mesh, screen, register, animations, c, isActive, loadModel, ownMaterial=material=>material }) {
  const dark='#354c54', silver='#b7c9c2', ivory='#fff2d7', gold='#c9a15d';
  const part=(parent,x=0,y=0,z=0)=> {
    const g=new THREE.Group(); g.position.set(x,y,z); parent.add(g); return g;
  };
  const sphere=(parent,r,color,x=0,y=0,z=0,scale=[1,1,1])=> {
    const m=mesh(parent,new THREE.SphereGeometry(r,12,8),color,[x,y,z]);
    m.scale.set(...scale); return m;
  };
  function link(parent,a,b,r,color) {
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b);
    const m=mesh(parent,new THREE.CylinderGeometry(r,r,p.distanceTo(q),8),color,p.clone().add(q).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.sub(p).normalize());
    return m;
  }
  function tube(parent,points,r,color) {
    return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,6,false),color);
  }
  function rounded(parent,w,h,d,r,color,position=[0,0,0]) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:4});
    g.translate(0,0,-d/2);
    return mesh(parent,g,color,position,true);
  }
  function ring(parent,r,y,color,t=.025) {
    const m=mesh(parent,new THREE.TorusGeometry(r,t,6,40),color,[0,y,0]);
    m.rotation.x=-Math.PI/2; return m;
  }
  function plinth(parent,r) {
    cylinder(parent,r,r+.08,.12,c.sand,0,.06,0,16);
  }

  // NAIIVE: regular ico cage and the exact three logo bonds. The frame and
  // edge identities follow app-store-creative/d_scene.py from the reference.
  const naiive=group('NAIIVE / RGB icosahedron',4.8,-3.6);
  plinth(naiive,1.65);
  cylinder(naiive,1.05,1.27,.24,dark,0,.22,0,12);
  cylinder(naiive,.88,.95,.07,silver,0,.38,0,12);
  ring(naiive,.73,.425,'#72bca8');
  const ico=part(naiive,0,2.2,0); ico.userData.dynamic=true;
  const cage=part(ico); cage.userData.dynamic=true;
  const {points,edges,rgb,key,axis,pose}=createNAIIVEGeometry();
  ico.quaternion.copy(pose);
  const hologramTime={value:0},hologramMaterials=new Map();
  const project=(model,color='#389daa',strength=1)=> {
    const key=color+strength;
    if(!hologramMaterials.has(key))hologramMaterials.set(key,ownMaterial(createHologramMaterial(color,hologramTime,strength)));
    model.material=hologramMaterials.get(key);model.castShadow=false;model.receiveShadow=false;
    return model;
  };
  for(const [i,j] of edges) {
    const color=rgb.get(key(i,j));
    project(link(cage,points[i].clone().multiplyScalar(1.52).toArray(),points[j].clone().multiplyScalar(1.52).toArray(),color ? .062 : .032,color ?? '#389daa'),color ?? '#389daa',color?1.25:.85);
  }
  points.forEach(p=>project(sphere(cage,.10,'#83d6e4',...p.clone().multiplyScalar(1.52).toArray())));
  const shell=new THREE.BufferGeometry().setFromPoints(points.map(p=>p.clone().multiplyScalar(1.52)));
  const faces=[];
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)for(let k=j+1;k<points.length;k++)if(points[i].distanceTo(points[j])<1.06&&points[j].distanceTo(points[k])<1.06&&points[k].distanceTo(points[i])<1.06){const outward=points[j].clone().sub(points[i]).cross(points[k].clone().sub(points[i])).dot(points[i])>0;faces.push(i,outward?j:k,outward?k:j);}
  shell.setIndex(faces);shell.computeVertexNormals();
  project(mesh(cage,shell,'#83d6e4'),'#83d6e4',.08);
  project(mesh(naiive,new THREE.CylinderGeometry(1.2,.22,1.65,24,1,true),'#83d6e4',[0,1.28,0]),'#83d6e4',.035);
  const scanRing=project(ring(naiive,1.45,2.2,'#83d6e4',.012),'#83d6e4',.32);
  scanRing.userData.dynamic=true;
  const control=part(naiive,0,.52,1.12); control.rotation.x=-.65;
  rounded(control,1.24,.50,.12,.08,dark);
  for(let i=0;i<3;i++) {
    rounded(control,.22,.15,.025,.025,['#FF383C','#32DB9A','#0A84FF'][i],[-.38+i*.38,.03,.075]);
    if(i<2) box(control,.16,.02,.026,silver,-.19+i*.38,.03,.078);
  }
  register(naiive,'naiive','NAIIVE',[4.8,.35,-1.75]);
  animations.push(t=> {
    // The outer top and bottom logo tips stay fixed; rotate around their line.
    cage.quaternion.setFromAxisAngle(axis,(t*Math.PI/12)%(Math.PI*2));
    hologramTime.value=t;
    const sweep=Math.sin(t*.55);scanRing.position.y=2.2+sweep*1.2;scanRing.scale.setScalar(Math.sqrt(1-sweep*sweep*.65));
  });

  // AmiiBot: the user's original figurine rotates on the reader while the
  // phone, chip card and contactless symbol make NFC visible at island scale.
  const amiibot=group('AmiiBot / NFC scanning station',6.1,3.55);
  plinth(amiibot,1.08);
  cylinder(amiibot,.98,1.02,.20,dark,-.22,.22,0,24);
  cylinder(amiibot,.88,.94,.08,silver,-.22,.36,0,24);
  const turntable=part(amiibot,-.22,.42,0); turntable.userData.dynamic=true;
  turntable.name='WinnieTheFrog3D / rotating figure';
  const loadingTag=part(turntable,0,.65,0); loadingTag.userData.dynamic=true;
  rounded(loadingTag,.73,1.05,.10,.12,ivory);
  rounded(loadingTag,.30,.32,.015,.03,gold,[0,0,.065]);
  for(const y of [-.07,.07]) box(loadingTag,.25,.018,.018,dark,0,y,.075);
  loadModel(turntable,'/game/WTF.glb',{fit:[1.80,2.15,1.35],onReady:()=>{loadingTag.visible=false;}});

  const phone=part(amiibot,1.28,1.12,-.04);
  phone.rotation.set(-.42,-.16,.10);
  rounded(phone,.84,1.66,.14,.16,silver);
  rounded(phone,.73,1.51,.04,.12,dark,[0,0,.09]);
  rounded(phone,.25,.043,.018,.02,silver,[0,.64,.118]);
  rounded(phone,.26,.025,.02,.012,ivory,[0,-.63,.119]);
  // A chip plus three radiating arcs is visible on both the screen and card.
  rounded(phone,.23,.31,.022,.035,gold,[-.20,.06,.122]);
  for(const y of [-.01,.12]) box(phone,.18,.014,.01,dark,-.20,y,.138);
  box(phone,.014,.28,.01,dark,-.2,.06,.138);
  for(const radius of [.17,.27,.37]) {
    const arc=mesh(phone,new THREE.TorusGeometry(radius,.027,6,22,Math.PI*.7),'#92d1b8',[-.08,.06,.137]);
    arc.rotation.z=-Math.PI*.35;
  }
  rounded(phone,.39,.055,.018,.02,'#92d1b8',[0,-.41,.122]);

  const tag=part(amiibot,-.64,.19,.88); tag.rotation.set(-Math.PI/2,0,-.22);
  rounded(tag,.58,.76,.04,.055,ivory);
  for(const inset of [0,.075]) {
    const antenna=new THREE.Shape(); const w=.46-inset,h=.64-inset;
    antenna.moveTo(-w/2,-h/2); antenna.lineTo(w/2,-h/2); antenna.lineTo(w/2,h/2); antenna.lineTo(-w/2,h/2); antenna.lineTo(-w/2,-h/2);
    const points=antenna.getPoints().map(p=>[p.x,p.y,.028]);
    tube(tag,points,.012,'#a59a6b');
  }
  rounded(tag,.18,.22,.02,.025,gold,[0,0,.035]);
  box(tag,.14,.015,.015,dark,0,0,.05);
  const scan=part(amiibot,-.22,0,0);
  const pulses=[0,1].map(i=>ring(scan,.95,.42+i*.12,'#86bd9e',.022));
  register(amiibot,'amiibot','AmiiBot',[6.1,.35,5.0]);
  animations.push(t=> {
    turntable.rotation.y=(t*Math.PI/14)%(Math.PI*2);
    pulses.forEach((pulse,i)=> {
      const phase=(t*.40+i*.5)%1;
      pulse.scale.setScalar(1+phase*.20);
      pulse.position.y=.42+phase*.30;
    });
  });

  // TotK: a miniature sky island. The stone underside and its separated
  // satellite make the floating silhouette visible without any building.
  const totk=group('TotK Companion / sky island',2.9,2.7);
  const floating=part(totk,0,1.65,0); floating.userData.dynamic=true;
  cylinder(floating,1.20,.18,.92,'#a9a98b',0,-.47,0,7);
  cylinder(floating,1.24,1.20,.12,'#8fa86c',0,.04,0,7);
  cylinder(floating,.48,.57,.27,'#a9b7a4',-.25,.19,0,6);
  const sword=part(floating,-.25,.3,0); sword.rotation.z=-.10;
  const blade=new THREE.Shape(); blade.moveTo(-.10,0); blade.lineTo(.10,0); blade.lineTo(.13,.94); blade.lineTo(0,1.17); blade.lineTo(-.13,.94); blade.closePath();
  mesh(sword,new THREE.ExtrudeGeometry(blade,{depth:.055,bevelEnabled:false}),'#bfdcdb',[0,0,0],true);
  box(sword,.025,.82,.012,ivory,0,.47,.064);
  box(sword,.60,.09,.16,'#567e85',0,1.13,.03,true);
  box(sword,.105,.37,.12,'#507875',0,1.35,.03,true);
  sphere(sword,.115,gold,0,1.58,.03);
  const map=part(floating,.65,.19,.40); map.rotation.x=-Math.PI/2; map.rotation.z=-.2;
  rounded(map,.63,.70,.025,.04,ivory);
  tube(map,[[-.20,-.23,.024],[-.12,-.08,.024],[.1,.03,.024],[.17,.25,.024]],.018,'#759c9d');
  sphere(map,.04,'#b77853',.1,.03,.045);
  const satellite=part(totk,-1.02,.84,-.72); satellite.userData.dynamic=true;
  cylinder(satellite,.34,.035,.46,'#a4a68d',0,0,0,5);
  cylinder(satellite,.36,.34,.06,'#9bb17a',0,.25,0,5);
  register(totk,'totk','TotK Companion',[2.7,.35,4.15]);
  animations.push(t=> { floating.position.y=1.65+Math.sin(t*.8)*.09; satellite.position.y=.84+Math.sin(t*.8+.8)*.065; });

  // L!NG: a watch resting flat on the grass, with its timetable facing upward.
  const ling=group('L!NG / timetable watch',4.55,6.0);
  const watch=part(ling,0,.155,0); watch.rotation.set(-Math.PI/2,0,-.13);
  for(const side of [-1,1]) {
    rounded(watch,.73,1.08,.16,.16,'#789e9c',[0,side*1.10,-.02]);
    for(let i=0;i<3;i++) rounded(watch,.14,.04,.012,.015,'#4f7778',[0,side*(1.05+i*.16),.073]);
  }
  rounded(watch,1.30,1.53,.28,.28,silver);
  rounded(watch,1.12,1.35,.055,.23,'#26414c',[0,0,.17]);
  // Timetable face redrawn from L!NG's own screens in the island palette.
  screen(watch,'/game/ling-screen.webp',1.02,1.25,.18,[0,0,.2]);
  const crown=cylinder(watch,.115,.115,.15,gold,.73,.20,0,12); crown.userData.dynamic=true; crown.rotation.z=Math.PI/2;
  box(watch,.055,.23,.09,dark,.68,-.20,0,true);
  rounded(watch,.83,.10,.035,.03,'#aac1ba',[0,-1.59,.095]);
  register(ling,'ling','L!NG',[4.55,.35,7.2]);
  animations.push(t=> { crown.rotation.y=isActive(ling)?t*.8:0; });

  // Small projects are working objects at a smaller scale than the four
  // landmarks. Each keeps its original project identity and click behavior.
  const car=group('LaneLoaf / dashcam car',8.6,1.8);
  const carBody=part(car); carBody.rotation.y=-.35;
  rounded(carBody,1.05,.37,.60,.13,'#d1a16e',[0,.40,0]);
  box(carBody,.56,.28,.53,'#92afb0',-.07,.69,0,true);
  box(carBody,.055,.31,.55,ivory,-.22,.7,0);
  for(const x of [-.35,.35]) for(const z of [-.34,.34]) {
    const wheel=cylinder(carBody,.16,.16,.10,dark,x,.22,z,12); wheel.rotation.x=Math.PI/2;
    const hub=cylinder(carBody,.074,.074,.11,silver,x,.22,z,10); hub.rotation.x=Math.PI/2;
  }
  for(const z of [-.19,.19]) box(carBody,.025,.10,.13,ivory,.54,.43,z);
  box(carBody,.14,.10,.14,dark,.17,.86,0,true);
  register(car,'laneloaf','LaneLoaf',[8.1,.35,2.3]);

  const gas=group('Gas MinMax / fuel pump',2.35,5.55);
  plinth(gas,.40);
  rounded(gas,.57,.96,.39,.09,'#a9bca2',[0,.57,0]);
  rounded(gas,.43,.32,.028,.035,dark,[0,.78,.215]);
  for(let i=0;i<3;i++) box(gas,.07,.12,.015,'#cfddb4',-.12+i*.12,.78,.24);
  box(gas,.22,.055,.02,ivory,0,.43,.219);
  tube(gas,[[.26,.86,0],[.57,.76,0],[.58,.21,0],[.39,.24,.04],[.35,.62,.08]],.032,dark);
  const nozzle=box(gas,.08,.25,.09,silver,.37,.66,.08); nozzle.rotation.z=-.2;
  register(gas,'gas','Gas MinMax',[1.8,.35,5.8]);

  const fuji=group('Fujifilm remote / camera',7.5,5.8);
  const camera=part(fuji,0,.55,0); camera.rotation.y=-.23;
  rounded(camera,.96,.59,.36,.07,dark);
  box(camera,.97,.12,.38,silver,0,.26,0,true);
  box(camera,.23,.13,.28,silver,-.12,.36,0,true);
  const lens=cylinder(camera,.25,.28,.32,dark,.08,0,.31,20); lens.rotation.x=Math.PI/2;
  const glass=cylinder(camera,.20,.20,.035,'#75a8b0',.08,0,.49,20); glass.rotation.x=Math.PI/2;
  sphere(camera,.07,ivory,.015,.075,.52,[1,1,.12]);
  cylinder(camera,.09,.09,.07,gold,.30,.365,0,12);
  tube(camera,[[-.48,.18,0],[-.7,-.15,-.05],[-.55,-.4,-.08],[.45,-.4,-.08],[.62,-.15,0],[.48,.18,0]],.025,'#9b805e');
  register(fuji,'fuji','Fujifilm remote',[7.1,.35,6.4]);

  // S.L.O.P. is an open research bench, with the cluster and evaluation
  // stations as independently clickable neighbors on the same terrace.
  const runtime=group('S.L.O.P. / agent research bench',0,0);
  box(runtime,2.45,.10,1.32,c.sand,0,.05,0,true);
  for(const x of [-.92,.92]) for(const z of [-.38,.38]) cylinder(runtime,.065,.085,.66,dark,x,.43,z,8);
  rounded(runtime,2.3,.15,1.16,.07,silver,[0,.82,0]);
  const terminal=part(runtime,0,1.35,-.32); terminal.rotation.x=-.12;
  rounded(terminal,1.22,.78,.12,.09,dark);
  rounded(terminal,1.08,.64,.025,.055,'#688f90',[0,0,.075]);
  const nodes=[[-.32,.13],[-.04,-.12],[.31,.12]];
  for(let i=0;i<2;i++) link(terminal,[...nodes[i],.105],[...nodes[i+1],.105],.02,'#d2e4cc');
  nodes.forEach(([x,y],i)=>rounded(terminal,.17,.14,.035,.025,[ivory,'#d0b477','#8dbea6'][i],[x,y,.115]));
  box(runtime,.88,.07,.31,dark,0,.94,.28,true);
  for(let i=0;i<5;i++) box(runtime,.1,.015,.06,ivory,-.30+i*.15,.984,.29);
  for(const side of [-1,1]) {
    const agent=part(runtime,side*.84,1.03,.10);
    rounded(agent,.36,.28,.28,.075,ivory,[0,.25,0]);
    box(agent,.25,.085,.02,dark,0,.28,.157);
    for(const x of [-.06,.06]) box(agent,.038,.035,.015,'#91bfac',x,.28,.175);
    cylinder(agent,.10,.14,.18,'#799f94',0,.06,0,8);
    link(agent,[-.15,.08,0],[-.23,-.08,.12],.027,gold);
    link(agent,[.15,.08,0],[.23,-.08,.12],.027,gold);
  }
  register(runtime,'slop','S.L.O.P.');

  const robot=group('DPMetal / GPU compute robot',0,0);
  plinth(robot,.66);
  box(robot,.6,.75,.45,'#8eaaa5',0,.87,0,true);
  rounded(robot,.69,.48,.52,.07,'#b7ccc3',[0,1.49,0]);
  for(const x of [-.17,.17]) box(robot,.095,.10,.025,dark,x,1.54,.273);
  // The exposed chip identifies native inference as its work.
  box(robot,.29,.29,.05,dark,0,.94,.26,true);
  box(robot,.16,.16,.025,'#8dbd9f',0,.94,.297);
  for(const side of [-1,1]) {
    box(robot,.23,.6,.23,'#79948e',side*.47,.94,0,true);
    box(robot,.22,.34,.26,'#718b89',side*.2,.34,0,true);
    for(const y of [.84,.94,1.04]) box(robot,.055,.025,.02,gold,side*.19,y,.297);
  }
  register(robot,'dpmetal','DPMetal');

  const workflow=group('S.L.O.P. / workflow connections',0,0);
  workflow.position.y=0;
  for(const points of [
    [[8.33,-10.85],[8.75,-10.70],[9.4,-10.75],[9.55,-10.50]],
    [[9.82,-10.15],[10.2,-9.8],[10.22,-8.6],[9.65,-8.1]],
  ]) {
    const route=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)));
    const grounded=Array.from({length:49},(_,i)=>{const p=route.getPoint(i/48);return [p.x,mountainHeightAt(p.x,p.z)+.055,p.z];});
    tube(workflow,grounded,.022,'#719c95');
  }

  const typeshi=group('TypeSHI / atom classifier',3.5,-.9);
  plinth(typeshi,.49);
  const atoms=[[-.23,.40,0],[.20,.60,0],[.03,.33,.28]];
  link(typeshi,atoms[0],atoms[1],.035,silver); link(typeshi,atoms[1],atoms[2],.035,silver);
  atoms.forEach((p,i)=>sphere(typeshi,.16,['#caa778','#8badb0','#99af7b'][i],...p));
  const lensFrame=part(typeshi,.28,.97,.20); lensFrame.rotation.set(-.45,0,-.25);
  mesh(lensFrame,new THREE.TorusGeometry(.23,.045,6,20),gold);
  link(lensFrame,[.14,-.17,0],[.38,-.46,0],.055,dark);
  register(typeshi,'typeshi','TypeSHI',[3.35,.35,-.2]);

  const traj=group('Quick TrajView / trajectory viewer',6.85,-1.05);
  box(traj,.75,.06,.44,silver,0,.04,0,true);
  box(traj,.11,.25,.10,dark,0,.20,0);
  const display=part(traj,0,.64,0); display.rotation.x=-.20;
  rounded(display,.96,.66,.10,.07,dark);
  rounded(display,.82,.52,.025,.025,'#6e9a9b',[0,0,.065]);
  tube(display,[[-.32,-.11,.1],[-.18,.13,.1],[.02,-.05,.1],[.22,.15,.1]],.022,ivory);
  for(const [x,y] of [[-.32,-.11],[-.18,.13],[.02,-.05],[.22,.15]]) sphere(display,.042,'#e4c886',x,y,.11);
  register(traj,'trajview','Quick TrajView',[6.5,.35,-.3]);

  const cluster=group('DSH-SLOP / cluster queue',8.35,-3.65);
  for(let i=0;i<3;i++) {
    rounded(cluster,.58,.30,.52,.035,'#607d81',[0,.21+i*.32,0]);
    box(cluster,.37,.035,.025,dark,-.02,.21+i*.32,.28);
    sphere(cluster,.025,'#c4d987',.20,.27+i*.32,.29);
  }
  const ticket=box(cluster,.28,.31,.015,ivory,.14,1.11,.29); ticket.rotation.z=-.13;
  register(cluster,'dshslop','DSH-SLOP',[7.9,.35,-2.9]);

  const bench=group('GradBench / evaluation scales',3.75,-6.1);
  plinth(bench,.47);
  cylinder(bench,.055,.075,.74,gold,0,.47,0,8);
  const beam=part(bench,0,.88,0); beam.userData.dynamic=true;
  box(beam,.94,.055,.07,gold);
  for(const side of [-1,1]) {
    link(beam,[side*.39,0,0],[side*.39,-.34,0],.017,dark);
    cylinder(beam,.21,.10,.07,silver,side*.39,-.35,0,10);
    sphere(beam,.10,side<0?'#8eada0':'#d0ac76',side*.39,-.23,0);
  }
  register(bench,'gradbench','GradBench',[3.8,.35,-5.4]);
  animations.push(t=> { beam.rotation.z=isActive(bench)?Math.sin(t*1.7)*.11:0; });
}
