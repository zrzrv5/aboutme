import * as THREE from 'three';

// Procedural hardware miniatures. Their silhouettes identify each workplace
// without signs: an EV cell for Sunwoda and an open hard drive for Seagate.
export function buildWorkplaces({ group, box, cylinder, mesh, register, animations, c }) {
  function roundedCase(w,h,d,r=.16) {
    const shape=new THREE.Shape();
    const x=-w/2,y=-h/2;
    shape.moveTo(x+r,y);
    shape.lineTo(x+w-r,y); shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r); shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h); shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r); shape.quadraticCurveTo(x,y,x+r,y);
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1,curveSegments:3});
    geometry.translate(0,0,-d/2);
    return geometry;
  }

  const battery=group('Sunwoda / battery cell',-6.25,3.05);
  const cell=new THREE.Group(); cell.rotation.y=-.16; battery.add(cell);
  box(battery,2.65,.10,1.48,c.sand,0,.05,0,true);
  mesh(cell,roundedCase(2.30,2.2,1.06),'#689d87',[0,1.37,0],true);
  mesh(cell,roundedCase(2.35,.22,1.10,.09),'#d4d5b9',[0,.28,0],true);
  mesh(cell,roundedCase(2.35,.26,1.10,.09),'#d9dfc9',[0,2.40,0],true);
  // A pair of chunky terminals makes this read as a prismatic battery cell.
  for(const side of [-1,1]) {
    cylinder(cell,.20,.23,.065,'#526c68',side*.75,2.57,0,12);
    cylinder(cell,.14,.14,.20,side<0?'#bd8660':'#637d7c',side*.75,2.69,0,12);
    box(cell,.13,.017,.030,c.trim,side*.75,2.80,0);
    if(side<0) box(cell,.030,.017,.13,c.trim,side*.75,2.80,0);
  }
  const bolt=new THREE.Shape();
  bolt.moveTo(.10,.62); bolt.lineTo(-.34,-.02); bolt.lineTo(-.02,-.02);
  bolt.lineTo(-.14,-.48); bolt.lineTo(.36,.20); bolt.lineTo(.06,.20); bolt.closePath();
  mesh(cell,new THREE.ExtrudeGeometry(bolt,{depth:.04,bevelEnabled:false}),'#f2df9a',[0,1.40,.55],true);
  box(cell,1.55,.26,.042,'#426e60',0,.67,.56);
  for(const x of [-.46,0,.46]) box(cell,.35,.12,.025,'#d0db9f',x,.67,.59);
  for(const side of [-1,1]) for(const z of [-.28,0,.28]) {
    box(cell,.035,1.28,.035,'#a9c2a5',side*1.175,1.36,z);
  }
  box(cell,1.65,1.45,.035,'#588573',0,1.4,-.56);
  for(const y of [.95,1.18,1.41,1.64,1.87]) box(cell,1.20,.035,.025,'#80a996',0,y,-.59);
  register(battery,'sunwoda','Simulation engineer @ Sunwoda',[-6.25,.35,4.2]);

  const drive=group('Seagate / open hard drive',-3.45,3.0);
  box(drive,2.08,.11,1.22,c.sand,0,.055,0,true);
  for(const x of [-.65,.65]) box(drive,.33,.20,.67,'#566e74',x,.17,.05,true);
  const casing=new THREE.Group(); casing.position.y=1.37; casing.rotation.x=-.30; drive.add(casing);
  mesh(casing,roundedCase(1.92,2.36,.38),'#8caaa8',[0,0,0],true);
  mesh(casing,roundedCase(1.66,2.11,.07,.11),'#4c666e',[0,0,.235],true);
  // Small screws and a warm connector strip frame the exposed mechanism.
  for(const x of [-.80,.80]) for(const y of [-1.02,1.02]) {
    const screw=mesh(casing,new THREE.CylinderGeometry(.056,.056,.018,8),'#d7dfcf',[x,y,.31]);
    screw.rotation.x=Math.PI/2;
    box(casing,.055,.012,.012,'#667f83',x,y,.326);
  }
  box(casing,1.06,.15,.12,'#354f58',-.14,-1.09,.31);
  for(let i=0;i<7;i++) box(casing,.074,.10,.015,'#d4b77c',-.56+i*.14,-1.09,.38);
  for(const y of [-.65,-.42,-.19,.04,.27,.50,.73]) box(casing,.93,.035,.028,'#5e7d80',0,y,-.22);

  const platter=new THREE.Group(); platter.userData.dynamic=true; platter.position.set(-.10,.32,.35); casing.add(platter);
  const disk=mesh(platter,new THREE.CylinderGeometry(.70,.70,.055,40),'#bdd0cb');
  disk.rotation.x=Math.PI/2;
  for(const radius of [.24,.47,.64]) mesh(platter,new THREE.TorusGeometry(radius,.009,4,48),'#789fa2',[0,0,.032]);
  mesh(platter,new THREE.RingGeometry(.19,.675,32,1,.3,.78),'#e5e8d5',[0,0,.034]);
  mesh(platter,new THREE.RingGeometry(.19,.675,32,1,Math.PI+.3,.48),'#95b6b8',[0,0,.035]);
  const spindle=mesh(platter,new THREE.CylinderGeometry(.16,.16,.08,16),'#637e86',[0,0,.052]);
  spindle.rotation.x=Math.PI/2;
  const hub=mesh(platter,new THREE.CylinderGeometry(.082,.082,.015,12),'#e1e4ce',[0,0,.10]);
  hub.rotation.x=Math.PI/2;
  animations.push(t=> { platter.rotation.z=t*.22; });

  const pivot=[.51,-.68,.46];
  mesh(casing,new THREE.RingGeometry(.20,.38,16,1,Math.PI*.6,Math.PI*.8),'#c59365',pivot);
  const arm=new THREE.Group(); arm.userData.dynamic=true; arm.position.set(...pivot); casing.add(arm);
  const armShape=new THREE.Shape();
  armShape.moveTo(-.12,0); armShape.lineTo(.12,0); armShape.lineTo(.065,.89);
  armShape.lineTo(.035,1.12); armShape.lineTo(-.055,1.12); armShape.lineTo(-.075,.91); armShape.closePath();
  mesh(arm,new THREE.ExtrudeGeometry(armShape,{depth:.045,bevelEnabled:false}),'#e0debd',undefined,true);
  box(arm,.045,.70,.025,'#bb9a65',0,.46,.054);
  box(arm,.13,.13,.08,'#435e68',-.015,1.10,.045,true);
  const bearing=mesh(casing,new THREE.CylinderGeometry(.155,.155,.07,16),'#a6bab5',[.51,-.68,.51]);
  bearing.rotation.x=Math.PI/2;
  const pin=mesh(casing,new THREE.CylinderGeometry(.065,.065,.04,12),'#d7dfcb',[.51,-.68,.57]);
  pin.rotation.x=Math.PI/2;
  animations.push(t=> { arm.rotation.z=.70+Math.sin(t*.5)*.075; });
  // Keep the miniature's scale inside the registered group so hover scaling
  // cannot restore the full-size drive.
  const driveModel=new THREE.Group();
  while(drive.children.length) driveModel.add(drive.children[0]);
  driveModel.scale.setScalar(.68); drive.add(driveModel);
  register(drive,'seagate','Intern @ Seagate',[-3.45,.35,4.0]);
}
