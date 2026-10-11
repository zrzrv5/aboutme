import * as THREE from 'three';
import { buildGilman } from './gilman';
import { campusPoint, CAMPUS_TRANSFORMS } from './world-layout';

// Hand-built campus miniatures, informed by the universities' own photographs:
// ISU: https://www.fpm.iastate.edu/maps/buildings/building.asp?id=19
// Gilman: https://www.fpm.iastate.edu/maps/buildings/building.asp?id=48
// Marston: https://historicexhibits.lib.iastate.edu/buildings/watertower.html
// WashU: https://source.washu.edu/2003/08/photos-of-brookings-hall/
// CUST: https://www.cust.edu.cn/xywh2026/xyfj2026/index.htm (理工门)
// The Gateway Arch is a separate St. Louis reference, not a WashU building.
export function buildCampuses({ group, box, cylinder, ball, mesh, register, roofGeometry, c }) {
  const place=(id,name,x,z)=>{const g=group(name,...campusPoint(id,[x,z]));g.rotation.y=CAMPUS_TRANSFORMS[id].turn;return g;};
  const enter=(g,id,title,stand)=> {
    const [x,z]=campusPoint(id,[stand[0],stand[2]]);
    return register(g,id,title,[x,stand[1],z]);
  };
  const stone = '#dfd6b9';
  const dark = '#355960';

  // Each campus has a bounded garden and an entrance onto the shared paths.
  // These are flush lawns, not stacked platforms. The gaps between them stay open.
  function garden(id,name,x,z,w,d,grass,entranceX=0,gate=1.1,notch=null) {
    const yard=place(id,name,x,z);
    if(notch) {
      const points=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[notch.x,d/2],[notch.x,notch.z],[-w/2,notch.z]];
      const shape=new THREE.Shape(points.map(([px,pz]) => new THREE.Vector2(px,-pz)));
      const ground=new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:false});
      ground.rotateX(-Math.PI/2);
      mesh(yard,ground,grass);
    } else box(yard,w,.018,d,grass,0,.002,0);
    const edge=(x1,z1,x2,z2,hedge=false) => {
      const length=Math.hypot(x2-x1,z2-z1);
      const wall=new THREE.Group(); wall.position.set((x1+x2)/2,0,(z1+z2)/2);
      wall.rotation.y=Math.atan2(x2-x1,z2-z1); yard.add(wall);
      box(wall,.17,.14,length,'#c2c4ac',0,.07,0,true);
      box(wall,.21,.045,length+.03,stone,0,.155,0);
      if(hedge) box(wall,.27,.20,Math.max(.2,length-.15),c.green,0,.26,0);
    };
    edge(-w/2,-d/2,w/2,-d/2,true);
    if(notch) {
      edge(-w/2,-d/2,-w/2,notch.z,true);
      edge(-w/2,notch.z,notch.x,notch.z,true);
      edge(notch.x,notch.z,notch.x,d/2-.25,true);
    } else edge(-w/2,-d/2,-w/2,d/2-.25,true);
    edge(w/2,-d/2,w/2,d/2-.25,true);
    edge(notch?.x ?? -w/2,d/2-.25,entranceX-gate/2,d/2-.25);
    edge(entranceX+gate/2,d/2-.25,w/2,d/2-.25);
    for(const side of [-1,1]) {
      box(yard,.24,.31,.24,stone,entranceX+side*gate/2,.155,d/2-.25,true);
    }
    return yard;
  }
  garden('wustl','WashU / enclosed quadrangle',-7.5,-5.60,4.4,5.2,'#b6c49a',0,1.25);
  garden('isu','Iowa State / compact campus',-1.4,-4.35,6.4,8.0,c.grassDark,1.9,1.15,{x:.85,z:.85});
  garden('cust','CUST / compact courtyard',-8.8,-.30,3.4,2.4,'#c9d0b6',-.05,.9);

  function rod(parent,a,b,r,color) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const bar=mesh(parent,new THREE.CylinderGeometry(r,r,start.distanceTo(end),6),color,start.clone().add(end).multiplyScalar(.5).toArray());
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
    return bar;
  }

  function archWall(parent,w,h,d,r,spring,color,x=0,y=0,z=0) {
    const shape = new THREE.Shape();
    shape.moveTo(-w/2,0); shape.lineTo(-w/2,h); shape.lineTo(w/2,h);
    shape.lineTo(w/2,0); shape.lineTo(r,0); shape.lineTo(r,spring);
    shape.absarc(0,spring,r,0,Math.PI,false); shape.lineTo(-r,0); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:8});
    geometry.translate(0,0,-d/2);
    return mesh(parent,geometry,color,[x,y,z],true);
  }

  function pane(parent,x,y,z,w=.18,h=.32) {
    box(parent,w+.07,h+.07,.035,stone,x,y,z);
    box(parent,w,h,.045,dark,x,y,z+.02);
    box(parent,.025,h,.055,'#b3c6bd',x,y,z+.04);
  }

  function clock(parent,x,y,z,size=.22) {
    mesh(parent,new THREE.CircleGeometry(size,20),'#faf2d7',[x,y,z]);
    mesh(parent,new THREE.TorusGeometry(size,.018,4,24),'#a2987d',[x,y,z+.01]);
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6;
      const tick=box(parent,.013,size*.15,.01,dark,x+Math.sin(a)*size*.8,y+Math.cos(a)*size*.8,z+.02);
      tick.rotation.z=-a;
    }
    box(parent,.018,size*.7,.018,dark,x,y+size*.23,z+.03);
    const hand=box(parent,size*.63,.018,.018,dark,x+size*.23,y,z+.035);
    hand.rotation.z=-.3;
  }

  // ISU: the narrow Campanile, clock faces, open belfry and slate roof.
  const isu=place('isu','Iowa State / campus',-1.9,-4.6);
  const bell=new THREE.Group(); bell.position.set(2.50,0,3.05); bell.scale.setScalar(.85); isu.add(bell);
  cylinder(bell,1.0,1.08,.10,c.path,0,.04,0,24);
  box(bell,1.16,.17,1.16,'#c2b799',0,.15,0,true);
  box(bell,.86,2.65,.86,'#b9a681',0,1.55,0,true);
  for(let y=.4;y<2.7;y+=.24) {
    box(bell,.89,.013,.89,'#c4b493',0,y,0);
  }
  for(const x of [-.39,.39]) for(const z of [-.39,.39]) box(bell,.12,3.45,.12,'#c7b993',x,1.92,z);
  box(bell,1,.10,1,stone,0,2.85,0,true);
  box(bell,1,.13,1,stone,0,3.67,0,true);
  for(let face=0;face<4;face++) {
    const side=new THREE.Group(); side.rotation.y=face*Math.PI/2; bell.add(side);
    for(const x of [-.28,0,.28]) archWall(side,.28,.73,.08,.085,.48,'#c6b795',x,2.90,.44);
    clock(side,0,2.49,.443,.20);
    box(side,.10,.34,.035,dark,0,1.04,.44);
  }
  const roof=mesh(bell,new THREE.ConeGeometry(.73,.95,4),'#384e55',[0,4.2,0],true);
  roof.rotation.y=Math.PI/4;
  for(const x of [-.43,.43]) for(const z of [-.43,.43]) {
    cylinder(bell,.035,.065,.35,stone,x,3.9,z,4);
    cylinder(bell,0,.075,.17,stone,x,4.16,z,4);
  }
  cylinder(bell,.018,.022,.26,dark,0,4.77,0,6);
  // Small entrance beside the tower, and a cardinal figurine inspired by Cy.
  archWall(bell,.44,.92,.26,.14,.45,'#c6b795',-.49,.23,.40);
  cylinder(bell,0,.35,.38,'#52636a',-.49,1.33,.40,4);
  const cy=new THREE.Group(); cy.position.set(.70,.12,.65); bell.add(cy);
  cylinder(cy,.34,.39,.16,stone,0,.08,0,10);
  const body=ball(cy,.25,'#a52c3e',0,.45,0); body.scale.set(.8,1.1,.72);
  ball(cy,.22,'#b93242',0,.78,.045);
  const crest=cylinder(cy,0,.115,.27,'#a92b3b',0,1.00,-.025,3); crest.rotation.x=-.4;
  const mask=ball(cy,.15,'#303e3e',0,.76,.20); mask.scale.set(1,.7,.36);
  const beak=cylinder(cy,0,.10,.19,'#e8bd50',0,.71,.29,4); beak.rotation.x=Math.PI/2;
  for(const x of [-.09,.09]) {
    ball(cy,.034,'#f8eecb',x,.80,.232);
    box(cy,.10,.035,.17,'#d6ac4e',x,.21,.09);
    const wing=ball(cy,.15,'#8c263a',x*2.5,.48,0); wing.scale.set(.4,1,.8);
  }

  // The connected laboratory wings follow the user's aerial footprint.
  const gilman=new THREE.Group();
  gilman.name='Gilman Hall / connected wings and open courts';
  gilman.position.set(.85,0,-1.70); isu.add(gilman);
  buildGilman(gilman,{box,cylinder,mesh});

  // Marston's tall cylindrical tank, conical cap, splayed legs and X bracing.
  const water=new THREE.Group(); water.position.set(-1.80,0,-1.10); isu.add(water);
  const steel='#526f70';
  const point=(i,y) => {
    const radius=.69-(y/3.05)*.35, angle=i*Math.PI/3;
    return [Math.cos(angle)*radius,y,Math.sin(angle)*radius];
  };
  for(let i=0;i<6;i++) {
    const foot=point(i,.10);
    box(water,.22,.10,.22,stone,foot[0],.05,foot[2]);
    rod(water,foot,point(i,3.05),.036,steel);
    for(const y of [.2,1.12,2.06]) {
      rod(water,point(i,y),point(i+1,y+.93),.012,steel);
      rod(water,point(i+1,y),point(i,y+.93),.012,steel);
      rod(water,point(i,y),point(i+1,y),.019,steel);
    }
  }
  cylinder(water,.41,.43,.15,steel,0,3.06,0,16);
  const underside=mesh(water,new THREE.SphereGeometry(.40,16,6,0,Math.PI*2,0,Math.PI/2),'#789393',[0,3.07,0],true);
  underside.rotation.z=Math.PI;
  cylinder(water,.41,.41,1.24,'#80999a',0,3.72,0,16);
  for(const y of [3.12,3.48,3.88,4.34]) cylinder(water,.43,.43,.038,'#4f7071',0,y,0,16);
  cylinder(water,.50,.50,.065,steel,0,4.37,0,16);
  cylinder(water,0,.51,.50,'#557b7c',0,4.65,0,16);
  cylinder(water,.014,.020,.16,steel,0,4.98,0,6);
  for(let i=0;i<14;i++) {
    const y=.2+i*.22;
    rod(water,[-.065,y,.53],[.065,y,.53],.009,steel);
  }
  for(const x of [-.065,.065]) rod(water,[x,.12,.53],[x,3.1,.53],.013,steel);
  // Marston occupies the west lawn beside Gilman; the Campanile sits southeast.
  // Short paths follow the compact parcel instead of crossing an empty lawn.
  box(isu,.50,.018,.60,c.path,.85,.018,.35);
  box(isu,1.65,.018,.48,c.path,1.675,.02,.60);
  box(isu,.50,.018,3.4,c.path,2.50,.018,2.30);
  box(isu,2.65,.018,.45,c.path,-.475,.02,.55);
  box(isu,.45,.018,1.65,c.path,-1.80,.02,-.275);
  enter(isu,'isu','ISU · Gilman, Campanile & Marston Water Tower',[.5,.35,-.15]);

  // WashU: broad red-granite wings, a real open archway and paired turrets.
  const washu=place('wustl','WashU / Brookings Hall',-7.5,-4.90);
  box(washu,.59,.018,1.35,c.path,0,.019,1.15);
  box(washu,.59,.018,1.6,c.path,0,.019,-1.30);
  box(washu,3.65,.12,1.9,c.path,0,.06,.10,true);
  for(let i=0;i<4;i++) box(washu,1.7-i*.1,.055,1.0-i*.17,stone,0,.1+i*.055,1.05-i*.06);
  const granite='#b9826b';
  for(const side of [-1,1]) {
    box(washu,1.08,1.32,1.05,granite,side*1.2,.88,0,true);
    mesh(washu,roofGeometry(1.14,.28,1.22),'#66716d',[side*1.2,1.55,0],true);
    for(const face of [-1,1]) {
      const wall=new THREE.Group(); wall.rotation.y=face<0?Math.PI:0; washu.add(wall);
      for(const x of [side*.96,side*1.43]) for(const y of [.62,1.19]) pane(wall,x,y,.54,.22,.34);
    }
    for(const y of [.33,.94,1.48]) box(washu,1.13,.055,1.10,stone,side*1.2,y,0);
  }
  archWall(washu,1.28,2.38,1.26,.37,.73,granite,0,.22,.08);
  box(washu,1.38,.11,1.34,stone,0,2.60,.08,true);
  for(const x of [-.53,.53]) {
    for(const z of [-.49,.66]) {
      cylinder(washu,.12,.15,2.65,stone,x,1.55,z,8);
      cylinder(washu,.17,.17,.11,'#c9b88e',x,2.88,z,8);
      cylinder(washu,.12,.15,.25,granite,x,3.04,z,8);
      cylinder(washu,0,.18,.23,stone,x,3.27,z,4);
    }
  }
  for(const x of [-.26,0,.26]) {
    pane(washu,x,1.82,.72,.15,.34);
    box(washu,.15,.19,.16,stone,x,2.75,.66);
    box(washu,.15,.19,.16,stone,x,2.75,-.50);
  }
  const rear=new THREE.Group(); rear.rotation.y=Math.PI; washu.add(rear);
  clock(rear,0,2.04,.56,.22);
  box(washu,1.12,.07,.10,stone,0,1.43,.74);
  // The city landmark sits behind Brookings on the same central axis.
  const arch=new THREE.Group(); arch.position.set(0,.1,-2.2); arch.scale.set(1.45,1.45,1.45); washu.add(arch);
  const vertices=[], indices=[], sections=32;
  for(let i=0;i<=sections;i++) {
    const t=-1+2*i/sections, shape=1.8, halfWidth=1.02, h=2.72;
    const y=h*(Math.cosh(shape)-Math.cosh(shape*t))/(Math.cosh(shape)-1);
    const dy=-h*shape*Math.sinh(shape*t)/(Math.cosh(shape)-1);
    const normal=new THREE.Vector2(-dy,halfWidth).normalize();
    const radius=.065+.085*Math.abs(t);
    for(let j=0;j<3;j++) {
      const a=j*Math.PI*2/3;
      vertices.push(t*halfWidth+normal.x*Math.cos(a)*radius,y+normal.y*Math.cos(a)*radius,Math.sin(a)*radius);
    }
    if(i<sections) for(let j=0;j<3;j++) {
      const a=i*3+j,b=i*3+(j+1)%3;
      indices.push(a,b,a+3,b,b+3,a+3);
    }
  }
  const archGeometry=new THREE.BufferGeometry();
  archGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  archGeometry.setIndex(indices); archGeometry.computeVertexNormals();
  mesh(arch,archGeometry,'#b8ced0',[0,0,0],true,{metalness:.45,roughness:.3,side:THREE.DoubleSide});
  for(const x of [-1.02,1.02]) box(arch,.35,.10,.45,stone,x,0,0);
  enter(washu,'wustl','WUSTL · Brookings Hall & St. Louis Arch',[-7.5,.35,-2.78]);

  // CUST: the grey entrance portals and red-tiled central teaching block.
  const cust=place('cust','CUST / Ligong Gate',-8.85,-.35);
  box(cust,3.8,.09,2.55,c.path,0,.045,.25,true);
  for(const side of [-1,1]) {
    box(cust,1.08,1.28,.78,'#d8dcd4',side*1.05,.78,-.35,true);
    box(cust,1.15,.08,.86,'#bac6c0',side*1.05,1.45,-.35);
    for(const x of [side*.79,side*1.30]) for(const y of [.45,.85,1.24]) pane(cust,x,y,.061,.19,.24);
    const back=new THREE.Group(); back.rotation.y=Math.PI; cust.add(back);
    for(const x of [side*.79,side*1.30]) for(const y of [.45,.85,1.24]) pane(back,x,y,.76,.19,.24);
  }
  box(cust,.98,1.6,.95,'#e4e5da',0,.91,-.29,true);
  mesh(cust,roofGeometry(1.22,.22,1.14),'#9e5a4b',[0,1.72,-.29],true);
  box(cust,1.24,.06,1.15,stone,0,1.73,-.29);
  for(const x of [-.27,0,.27]) {
    pane(cust,x,.68,.21,.15,.48);
    const opening=new THREE.Shape();
    opening.moveTo(-.07,0); opening.lineTo(.07,0); opening.lineTo(.07,.18); opening.absarc(0,.18,.07,0,Math.PI,false); opening.closePath();
    mesh(cust,new THREE.ShapeGeometry(opening),dark,[x,1.28,.20]);
  }
  box(cust,.98,.06,1.04,stone,0,1.10,-.29);
  mesh(cust,roofGeometry(.91,.14,.55),'#a5634b',[0,.43,.53],true);
  for(const side of [-1,1]) {
    box(cust,.26,.96,.30,'#b9c5c3',side*1.62,.56,1.04,true);
    box(cust,.77,.19,.37,'#cbd3cb',side*1.40,1.08,1.04,true);
  }
  box(cust,1.85,.42,.17,'#b4beb8',0,.31,1.21,true);
  for(let i=0;i<9;i++) {
    const shrub=ball(cust,.14,i%2?'#839f67':'#ad735f',-.94+i*.235,.16,1.5);
    shrub.scale.set(1,.7,.8);
  }
  // An original optical-prism sculpture references CUST's optics heritage.
  const optics=new THREE.Group(); optics.position.set(2.05,.13,.20); cust.add(optics);
  cylinder(optics,.57,.61,.13,stone,0,.06,0,12);
  const prism=cylinder(optics,.28,.28,.40,'#92c7cb',0,.49,0,3);
  prism.rotation.x=Math.PI/2;
  box(optics,.12,.22,.12,'#91a4a3',0,.24,0);
  const ray=(end,color) => {
    const a=new THREE.Vector3(.13,.49,0),b=new THREE.Vector3(...end);
    const beam=mesh(optics,new THREE.CylinderGeometry(.019,.019,a.distanceTo(b),5),color,a.clone().add(b).multiplyScalar(.5).toArray());
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());
  };
  ray([.53,.49,-.24],'#cf8a76'); ray([.58,.49,0],'#d6bb70'); ray([.53,.49,.24],'#6da599');
  const custModel=new THREE.Group();
  while(cust.children.length) custModel.add(cust.children[0]);
  custModel.scale.setScalar(.60);
  cust.add(custModel);
  enter(cust,'cust','长春理工 · 理工门 & optics',[-8.85,.35,1.10]);
}
