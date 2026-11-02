import * as THREE from 'three';

// Glorp on a UFO, hovering off the west shore where a sailboat used to be.
// The saucer is island geometry; glorp is the original picture
// (public/game/glorp.webp), a camera-facing sprite in the cockpit under a
// glass dome. Until the picture loads the saucer flies empty.
export const GLORP='/game/glorp.webp';
const HOVER=1.1,BULBS=10;

export function buildUfo({group,mesh,animations,ownMaterial,ownGeometry,ownTexture,redraw,at}) {
  const ufo=group('glorp on a UFO',at[0],at[1]);
  ufo.position.y=HOVER;ufo.scale.setScalar(1.25);ufo.userData.dynamic=true;
  // The saucer turns on its own, so it is a batching root of its own.
  const saucer=new THREE.Group();saucer.userData.dynamic=true;ufo.add(saucer);
  // A flat lathed hull, a rim band and a ring of bulbs that chase round it.
  const profile=[[0,-.17],[.3,-.19],[.62,-.11],[.82,0],[.64,.08],[.4,.12],[0,.12]].map(([x,y])=>new THREE.Vector2(x,y));
  mesh(saucer,new THREE.LatheGeometry(profile,24),'#9aaab2',[0,0,0],true);
  mesh(saucer,new THREE.TorusGeometry(.82,.035,6,40).rotateX(Math.PI/2),'#5b6a73');
  mesh(saucer,new THREE.TorusGeometry(.5,.025,6,32).rotateX(Math.PI/2),'#6f8f86',[0,.105,0]);
  const bulb=ownGeometry(new THREE.SphereGeometry(.05,8,6));
  const lit=['#ffd166','#7ee0c3'].map(color=>ownMaterial(new THREE.MeshBasicMaterial({color,toneMapped:false})));
  for(let i=0;i<BULBS;i++) {
    const a=i/BULBS*Math.PI*2,light=new THREE.Mesh(bulb,lit[i%2]);
    light.position.set(Math.cos(a)*.84,0,Math.sin(a)*.84);saucer.add(light);
  }
  // Glorp sits on the cockpit floor, face clear of the rim when seen from above.
  const picture=new THREE.TextureLoader().load(GLORP,()=>{pilot.visible=true;redraw();});
  picture.colorSpace=THREE.SRGBColorSpace;ownTexture(picture);
  const pilot=new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({map:picture,alphaTest:.5,transparent:false,toneMapped:false})));
  pilot.center.set(.5,0);pilot.scale.set(.72,.72,1);pilot.position.y=.1;pilot.visible=false;
  ufo.add(pilot);
  const dome=new THREE.Mesh(ownGeometry(new THREE.SphereGeometry(.5,20,10,0,Math.PI*2,0,Math.PI/2)),ownMaterial(new THREE.MeshBasicMaterial({color:'#a6f5cf',transparent:true,opacity:.38,depthWrite:false})));
  dome.position.y=.1;dome.renderOrder=2;ufo.add(dome);
  // A faint tractor beam down to the water.
  const beam=new THREE.Mesh(ownGeometry(new THREE.CylinderGeometry(.22,.75,HOVER+.6,20,1,true).translate(0,-(HOVER+.6)/2-.12,0)),
    ownMaterial(new THREE.MeshBasicMaterial({color:'#b8ffc9',transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false})));
  beam.renderOrder=1;ufo.add(beam);
  const colors=lit.map(material=>material.color.clone());
  animations.push(t=> {
    ufo.position.y=HOVER+Math.sin(t*1.1)*.08;
    ufo.rotation.z=Math.sin(t*.7)*.05;ufo.rotation.x=Math.sin(t*.5)*.04;
    saucer.rotation.y=t*.6;
    // The two sets of bulbs take turns, so the light seems to run round the rim.
    const swap=Math.floor(t*4)%2;
    lit.forEach((material,i)=>material.color.copy(colors[(i+swap)%2]));
    beam.material.opacity=.1+.05*Math.sin(t*2.2);
  });
  return ufo;
}
