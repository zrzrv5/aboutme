import * as THREE from 'three';
import { PLAZA_LAYOUT } from './world-layout';

// A shared public square: the mirror is its center, with skills at the west
// edge between education and work. All entrances remain open at ground level.
export function buildPlaza({group,box,cylinder,ball,mesh,register,roofGeometry,animations,c,isSelected}) {
  const pickXZ=layout=>[layout.at[0],layout.at[2]];
  const fit=(g,layout)=> {
    const model=new THREE.Group();
    while(g.children.length) model.add(g.children[0]);
    model.scale.setScalar(layout.scale); g.add(model);
  };
  const paving=group('central square',...PLAZA_LAYOUT.center);
  const r=PLAZA_LAYOUT.radius;
  const base=cylinder(paving,r,r,.04,c.sand,0,.005,0,32); base.castShadow=false;
  const floor=cylinder(paving,r-.16,r-.16,.02,c.path,0,.028,0,32); floor.castShadow=false;
  function groundRing(inner,outer,color,y) {
    const ring=mesh(paving,new THREE.RingGeometry(inner,outer,32),color,[0,y,0]);
    ring.rotation.x=-Math.PI/2; ring.castShadow=false;
  }
  groundRing(r-.15,r-.09,'#c7c5aa',.041);
  groundRing(1.35,1.42,'#d2c7a7',.042);
  // Shallow stone joints and a small compass inlay keep the center legible.
  for(let i=0;i<16;i++) {
    const a=i*Math.PI/8;
    const joint=box(paving,.025,.006,1.58,'#ded3b7',Math.sin(a)*2.22,.043,Math.cos(a)*2.22);
    joint.rotation.y=a; joint.castShadow=false;
  }
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4,tip=i%2?1.02:1.25;
    const geometry=new THREE.BufferGeometry();
    const rotate=(x,z)=>[x*Math.cos(a)+z*Math.sin(a),.047,-x*Math.sin(a)+z*Math.cos(a)];
    geometry.setAttribute('position',new THREE.Float32BufferAttribute([...rotate(-.13,.55),...rotate(0,tip),...rotate(.13,.55)],3));
    geometry.computeVertexNormals();
    mesh(paving,geometry,i%2?'#e6ddc3':'#b6bda9',undefined,false,{side:THREE.DoubleSide}).castShadow=false;
  }
  const bay=group('skills / stone apron',...pickXZ(PLAZA_LAYOUT.skills));
  cylinder(bay,1.36,1.36,.035,c.sand,0,.012,0,16).castShadow=false;
  cylinder(bay,1.23,1.23,.016,c.path,0,.032,0,16).castShadow=false;

  function plantedArc(start,end) {
    const shape=new THREE.Shape(),steps=12,inner=r-.04,outer=r+.35;
    for(let i=0;i<=steps;i++) {
      const a=start+(end-start)*i/steps;
      if(i===0) shape.moveTo(Math.cos(a)*outer,-Math.sin(a)*outer);
      else shape.lineTo(Math.cos(a)*outer,-Math.sin(a)*outer);
    }
    for(let i=steps;i>=0;i--) {const a=start+(end-start)*i/steps;shape.lineTo(Math.cos(a)*inner,-Math.sin(a)*inner);}
    shape.closePath();
    const stone=new THREE.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:false}); stone.rotateX(-Math.PI/2);
    mesh(paving,stone,'#c2c5ac',[0,.025,0],true);
    for(let i=0;i<7;i++) {
      const a=start+.045+(end-start-.09)*i/6;
      const bush=ball(paving,.18,i%2?c.green:c.leaf,Math.cos(a)*(r+.155),.28,Math.sin(a)*(r+.155));
      bush.scale.set(1,.65,1);
    }
  }
  plantedArc(-Math.PI*.50,-Math.PI*.365);
  plantedArc(Math.PI*.57,Math.PI*.68);
  // Menus have physical homes in the world: a chest, a noticeboard, a mirror.
  const chest=group('skills and tools',...pickXZ(PLAZA_LAYOUT.skills));
  box(chest,1.32,.55,.86,'#936642',0,.3,0,true);
  box(chest,1.38,.10,.92,'#644e39',0,.07,0,true);
  const lid=new THREE.Group(); lid.userData.dynamic=true; chest.add(lid);
  const lidShell=mesh(lid,new THREE.CylinderGeometry(.47,.47,1.36,12,1,false,0,Math.PI),'#b8844d',[0,.58,0],true);
  lidShell.rotation.z=Math.PI/2;
  [-.43,.43].forEach(x=> {
    box(chest,.09,.54,.90,'#d0ad62',x,.34,0);
    const band=mesh(lid,new THREE.TorusGeometry(.48,.04,5,16,Math.PI),'#d0ad62',[x,.58,0]);
    band.rotation.y=Math.PI/2;
  });
  box(chest,.22,.24,.09,'#e0c57d',0,.55,.48,true);
  box(chest,.055,.095,.02,'#594d3c',0,.56,.535);
  // A visible blade and a crossed-tool badge identify this as the field kit.
  const kitBlade=new THREE.Group(); kitBlade.position.set(-.52,.44,-.28); kitBlade.rotation.z=-.25; chest.add(kitBlade);
  box(kitBlade,.15,.95,.055,'#b9d9d6',0,.48,0,true);
  box(kitBlade,.32,.065,.085,'#c6a360',0,.12,0);
  box(kitBlade,.09,.22,.08,'#426e6d',0,-.03,0);
  const hammer=box(chest,.04,.35,.025,'#e5ca8e',-.24,.31,.465); hammer.rotation.z=-.6;
  const hammerHead=box(chest,.19,.075,.04,'#b9d1c2',-.32,.43,.477); hammerHead.rotation.z=-.6;
  const chisel=box(chest,.035,.31,.025,'#c2d9ca',-.25,.31,.485); chisel.rotation.z=.6;
  for(const x of [-.54,.54]) box(chest,.07,1.20,.07,'#8f7857',x,.60,-.60);
  box(chest,1.22,.08,.09,'#a78b61',0,1.22,-.60);
  for(const [i,color] of ['#85a9a1','#ccb16e','#bb8570'].entries()) {
    box(chest,.19,.27,.06,color,-.37+i*.37,1.01,-.55,true);
    box(chest,.035,.25,.04,'#dac9a1',-.37+i*.37,.78,-.53);
  }
  fit(chest,PLAZA_LAYOUT.skills);
  register(chest,'@items','Skills & tools',PLAZA_LAYOUT.skills.stand);
  animations.push(()=> { lid.rotation.x=THREE.MathUtils.lerp(lid.rotation.x,isSelected(chest)?-.28:0,.12); });

  const board=group('quest board',...pickXZ(PLAZA_LAYOUT.journal));
  [-.56,.56].forEach(x=>box(board,.13,1.65,.14,'#8d7250',x,.82,0,true));
  box(board,1.55,.94,.18,'#8b6b49',0,1.14,0,true);
  mesh(board,roofGeometry(1.8,.26,.45),'#668568',[0,1.63,0],true);
  [[-.43,1.16],[.03,1.22],[.47,1.07]].forEach(([x,y],i)=> {
    const paper=box(board,.34,.48,.026,i%2?'#e8d7a5':'#f5e8bb',x,y,.109);
    paper.rotation.z=(i-1)*.10;
    box(board,.20,.018,.012,'#ad936a',x,y+.08,.129);
    box(board,.15,.018,.012,'#ad936a',x,y-.01,.129);
  });
  register(board,'@quests','Quest board · read the journal',PLAZA_LAYOUT.journal.stand);

  const mirror=group('world mirror',...pickXZ(PLAZA_LAYOUT.mirror));
  cylinder(mirror,.84,.91,.16,c.sand,0,.08,0,14);
  [-.62,.62].forEach(x=>box(mirror,.23,1.5,.3,'#aebcad',x,.9,0,true));
  const arch=mesh(mirror,new THREE.TorusGeometry(.62,.13,6,16,Math.PI),'#c5cfb4',[0,1.65,0],true);
  arch.rotation.z=0;
  const glassShape=new THREE.Shape();
  glassShape.moveTo(-.49,.25); glassShape.lineTo(.49,.25); glassShape.lineTo(.49,1.65); glassShape.absarc(0,1.65,.49,0,Math.PI,false); glassShape.lineTo(-.49,.25);
  mesh(mirror,new THREE.ShapeGeometry(glassShape),'#7eafb9',[0,0,.035],false,{side:THREE.DoubleSide,roughness:.25});
  const glint=box(mirror,.025,.45,.012,'#eff2d4',.13,1.42,.055); glint.rotation.z=-.48;
  const glint2=box(mirror,.025,.19,.012,'#eff2d4',.04,1.13,.055); glint2.rotation.z=-.48;
  fit(mirror,PLAZA_LAYOUT.mirror);
  register(mirror,'@mirror','World mirror · open portfolio',PLAZA_LAYOUT.mirror.stand);
  return {chest,board,mirror};
}
