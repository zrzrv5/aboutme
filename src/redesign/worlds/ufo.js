import * as THREE from 'three';

// Glorp on a UFO, hovering high off the west shore where a sailboat used to
// be. The saucer is island geometry; glorp is the original picture
// (public/game/glorp.webp), a camera-facing sprite in the cockpit under a
// glass bubble. Until the picture loads the saucer flies empty.
export const GLORP='/game/glorp.webp';
const HOVER=2.3,SEA=-.78,SCALE=1.25,BULBS=10;
// The bubble is tall enough to hold glorp, antennae and all, from the island camera.
const DOME={radius:.52,height:.86,floor:.2};

// Glass: nearly clear face-on and brighter towards the outline, so the bubble
// reads against the water and glorp shows through it.
function glassMaterial() {
  return new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color('#c8f6ff')},face:{value:.1},rim:{value:.8}},
    vertexShader:'varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 tint;uniform float face,rim;varying vec3 vNormal;
      void main(){
        float edge=pow(1.-abs(normalize(vNormal).z),2.);
        gl_FragColor=vec4(mix(tint,vec3(1.),edge*.5),face+rim*edge);
        #include <colorspace_fragment>
      }`,
    transparent:true,depthWrite:false,
  });
}

export function buildUfo({group,mesh,animations,ownMaterial,ownGeometry,ownTexture,redraw,at}) {
  const ufo=group('glorp on a UFO',at[0],at[1]);
  ufo.position.y=HOVER;ufo.scale.setScalar(SCALE);ufo.userData.dynamic=true;
  // The saucer turns on its own, so it is a batching root of its own.
  const saucer=new THREE.Group();saucer.userData.dynamic=true;ufo.add(saucer);
  // A curved two-tone hull (the toon shading bands give it depth), a metal
  // rim and collar, panel seams across the upper shell and a ring of bulbs
  // that chase round the rim.
  const lathe=points=>new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),32);
  mesh(saucer,lathe([[0,-.2],[.26,-.22],[.5,-.17],[.7,-.08],[.85,0]]),'#7c8b93',[0,0,0],true);
  // The upper shell darkens towards the rim, so it reads as curved even
  // where the toon shading would paint it a single tone.
  const shell=lathe([[.85,0],[.8,.06],[.72,.12],[.62,.17],[.52,.2],[0,.2]]),shade=[],rim=new THREE.Vector2();
  for(let i=0;i<shell.attributes.position.count;i++){const r=rim.set(shell.attributes.position.getX(i),shell.attributes.position.getZ(i)).length(),v=1-.38*Math.min(1,Math.max(0,(r-.52)/.33));shade.push(v,v,v);}
  shell.setAttribute('color',new THREE.Float32BufferAttribute(shade,3));
  mesh(saucer,shell,'#c3d0d6',[0,0,0],true,{vertexColors:true});
  mesh(saucer,new THREE.TorusGeometry(.85,.04,8,48).rotateX(Math.PI/2),'#55636c');
  mesh(saucer,new THREE.TorusGeometry(DOME.radius,.05,8,48).rotateX(Math.PI/2),'#55636c',[0,DOME.floor,0]);
  for(let i=0;i<8;i++) {
    const a=(i+.5)/8*Math.PI*2,seam=new THREE.Group();
    seam.rotation.y=-a;saucer.add(seam);
    const strip=mesh(seam,new THREE.BoxGeometry(.27,.012,.014),'#76858d',[.69,.12,0]);strip.rotation.z=-.58;strip.castShadow=false;
  }
  const bulb=ownGeometry(new THREE.SphereGeometry(.05,8,6));
  const lit=['#ffd166','#7ee0c3'].map(color=>ownMaterial(new THREE.MeshBasicMaterial({color,toneMapped:false})));
  for(let i=0;i<BULBS;i++) {
    const a=i/BULBS*Math.PI*2,light=new THREE.Mesh(bulb,lit[i%2]);
    light.position.set(Math.cos(a)*.84,0,Math.sin(a)*.84);saucer.add(light);
  }
  // Glorp sits on the cockpit floor, face clear of the rim when seen from
  // above. The picture's cropped chin and right side fade out, and its soft
  // fur edge is kept, so glorp does not read as a cut-out card.
  const picture=new THREE.TextureLoader().load(GLORP,()=>{pilot.visible=true;redraw();});
  picture.colorSpace=THREE.SRGBColorSpace;ownTexture(picture);
  const pilot=new THREE.Sprite(ownMaterial(new THREE.SpriteMaterial({map:picture,alphaTest:.02,depthWrite:false,toneMapped:false})));
  pilot.center.set(.5,0);pilot.scale.set(.7,.7,1);pilot.position.y=DOME.floor;pilot.renderOrder=1;pilot.visible=false;
  ufo.add(pilot);
  // The glass bubble, drawn after glorp, with a highlight along its upper-left edge.
  const dome=new THREE.Mesh(ownGeometry(new THREE.SphereGeometry(DOME.radius,28,14,0,Math.PI*2,0,Math.PI/2)),ownMaterial(glassMaterial()));
  dome.scale.y=DOME.height/DOME.radius;dome.position.y=DOME.floor;dome.renderOrder=2;ufo.add(dome);
  const glint=new THREE.Mesh(ownGeometry(new THREE.SphereGeometry(DOME.radius*1.012,10,4,-.55,.5,.18,.3)),
    ownMaterial(new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.6,depthWrite:false,toneMapped:false})));
  glint.renderOrder=3;dome.add(glint);
  // A faint tractor beam, strongest under the hull and fading out towards the water.
  const reach=(HOVER-SEA)/SCALE-.2;
  const cone=ownGeometry(new THREE.CylinderGeometry(.2,.65,reach,24,1,true).translate(0,-reach/2-.2,0));
  const fade=[];for(let i=0;i<cone.attributes.position.count;i++)fade.push(1,1,1,cone.attributes.position.getY(i)>-.21?1:0);
  cone.setAttribute('color',new THREE.Float32BufferAttribute(fade,4));
  const beam=new THREE.Mesh(cone,ownMaterial(new THREE.MeshBasicMaterial({color:'#b8ffc9',vertexColors:true,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false})));
  beam.renderOrder=1;ufo.add(beam);
  const colors=lit.map(material=>material.color.clone());
  animations.push(t=> {
    ufo.position.y=HOVER+Math.sin(t*1.1)*.08;
    ufo.rotation.z=Math.sin(t*.7)*.05;ufo.rotation.x=Math.sin(t*.5)*.04;
    saucer.rotation.y=t*.6;
    // The two sets of bulbs take turns, so the light seems to run round the rim.
    const swap=Math.floor(t*4)%2;
    lit.forEach((material,i)=>material.color.copy(colors[(i+swap)%2]));
    beam.material.opacity=.26+.08*Math.sin(t*2.2);
  });
  return ufo;
}
