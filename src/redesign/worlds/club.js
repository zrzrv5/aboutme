import * as THREE from 'three';

// The OIIA song's night club. While the full song plays, the island fades to
// night, the sky light washes through club colours bar by bar, searchlights
// sweep up from the dock, and a mirror ball turns over the cat, throwing
// sparkles and a pool of light at its feet. Everything moves on the song's own
// beat grid and hits harder in the two drops. The rig is built on first use,
// so visitors who never find the cat pay nothing for it. With reduced motion
// the club is a still scene: its colours and lights without sweeps or pulses.
// Beat pulses stay gentle and below three a second.

export const BPM=150;
export const FIRST_BEAT=.315;     // seconds into public/game/oiia-song.mp3
// Loudness of that file in half-second steps, from 0 (quiet) to 9 (the drops).
// Measured from the encoded song; measure again if the file changes.
const ENERGY='0005552234544224645122555322465533355533345555566666646410000433434999999999999999999999999789999999999999999999999887710000225522656643676563476665324342432201000443333211001053443553434444444444444435400000423333899988998899999988998885569988998899889988998899755300';
const FADE_SECONDS=.8;
const WASH=['#ff4fb0','#38d6ff','#9d6bff','#ffb340'].map(hex=>new THREE.Color(hex));
// Night is a dark indigo; the club colours come mostly from the lights.
const NIGHT={background:new THREE.Color('#0d0a1c'),sky:new THREE.Color('#2b2f63'),ground:new THREE.Color('#120d22'),intensity:.42,sun:.1};
const WHITE=new THREE.Color('#fff4e0');
const smooth=(x,a=0,b=1)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

export function songEnergy(t) {
  const at=Math.min(ENERGY.length-1,Math.max(0,t*2)),i=Math.floor(at),j=Math.min(ENERGY.length-1,i+1);
  return (Number(ENERGY[i])*(1-(at-i))+Number(ENERGY[j])*(at-i))/9;
}

// Where `t` falls on the beat grid: `pulse` is 1 on a beat and decays before
// the next; colours change by the bar of four beats.
export function beatAt(t) {
  const beats=(t-FIRST_BEAT)*BPM/60;
  if(beats<0)return {beat:-1,pulse:0,bar:0,inBar:0};
  const beat=Math.floor(beats);
  return {beat,pulse:Math.exp(-(beats-beat)*4.5),bar:Math.floor(beat/4),inBar:beats/4%1};
}

// A soft round spot, for the sparkles and the pool of light.
function spotTexture() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const g=canvas.getContext('2d'),fill=g.createRadialGradient(32,32,0,32,32,32);
  fill.addColorStop(0,'rgba(255,255,255,1)');fill.addColorStop(.35,'rgba(255,255,255,.55)');fill.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=fill;g.fillRect(0,0,64,64);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export function createClub({scene,sky,sun,renderer,at}) {
  const day={background:scene.background.clone(),sky:sky.color.clone(),ground:sky.groundColor.clone(),skyIntensity:sky.intensity,sunIntensity:sun.intensity};
  const owned=new Set(),own=value=>{owned.add(value);return value;};
  const glow=options=>own(new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,...options}));
  const rig=new THREE.Group();
  rig.name='OIIA night club';rig.position.fromArray(at);rig.visible=false;
  scene.add(rig);
  const spot=own(spotTexture());

  // Searchlights: open cones, brightest at the dock and fading upward.
  const cone=own(new THREE.CylinderGeometry(.7,.07,11,16,1,true).translate(0,5.5,0));
  const fade=[];for(let i=0;i<cone.attributes.position.count;i++)fade.push(1,1,1,cone.attributes.position.getY(i)<.01?.85:0);
  cone.setAttribute('color',new THREE.Float32BufferAttribute(fade,4));
  // From either side of the cat, so the beams never hide it.
  const beams=[[-1.7,-.3],[1.7,-.3],[-1.1,.8],[1.1,.8]].map(([x,z],i)=> {
    const beam=new THREE.Mesh(cone,glow({vertexColors:true,side:THREE.DoubleSide,color:WASH[i]}));
    beam.position.set(x,0,z);rig.add(beam);
    return beam;
  });

  // The mirror ball: flat facets in random greys, tinted by the wash.
  const facets=own(new THREE.IcosahedronGeometry(.3,1));facets.computeVertexNormals();
  const shades=[];for(let i=0;i<facets.attributes.position.count;i+=3){const v=.45+Math.random()*.55;for(let k=0;k<3;k++)shades.push(v,v,v);}
  facets.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  const ball=new THREE.Mesh(facets,own(new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false})));
  ball.position.y=2.6;rig.add(ball);
  const cord=new THREE.Mesh(own(new THREE.CylinderGeometry(.01,.01,3,4).translate(0,1.5+.3,0)),own(new THREE.MeshBasicMaterial({color:'#9a9aa8'})));
  ball.add(cord);

  // Sparkles thrown by the ball, turning with it.
  const sparkles=new THREE.Group();sparkles.position.y=ball.position.y;rig.add(sparkles);
  const points=[],tints=[];
  for(let i=0;i<56;i++) {
    const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=1.4+Math.random()*2.2,s=Math.sqrt(1-u*u);
    points.push(Math.cos(a)*s*r,u*r*.7,Math.sin(a)*s*r);
    const tint=WASH[i%WASH.length];tints.push(tint.r,tint.g,tint.b);
  }
  const cloud=own(new THREE.BufferGeometry());
  cloud.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  cloud.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));
  const sparkleMaterial=own(new THREE.PointsMaterial({map:spot,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  sparkles.add(new THREE.Points(cloud,sparkleMaterial));

  // A warm spotlight pool on the deck: the spinning cat turns in it.
  const pool=new THREE.Mesh(own(new THREE.CircleGeometry(1.05,32).rotateX(-Math.PI/2)),glow({map:spot}));
  pool.position.y=.015;rig.add(pool);

  const wash=new THREE.Color(),tint=new THREE.Color();
  let level=0,last=null;
  function restore() {
    scene.background.copy(day.background);
    sky.color.copy(day.sky);sky.groundColor.copy(day.ground);
    sky.intensity=day.skyIntensity;sun.intensity=day.sunIntensity;
    rig.visible=false;
  }
  return {
    active:()=>level>0,
    // `on`: the song is playing; `t`: seconds into it.
    update(on,t,now,reduced) {
      const step=last===null?0:Math.min(.1,(now-last)/1000);last=now;
      level=reduced?(on?1:0):Math.min(1,Math.max(0,level+(on?step:-step)/FADE_SECONDS));
      if(!level){if(rig.visible)restore();return;}
      rig.visible=true;
      const amount=smooth(level),still=reduced;
      const {pulse,bar,inBar}=still?{pulse:0,bar:0,inBar:0}:beatAt(t);
      const hit=pulse*(.3+.7*songEnergy(t));
      wash.copy(WASH[bar%4]).lerp(WASH[(bar+1)%4],smooth(inBar,.75,1));
      scene.background.copy(day.background).lerp(NIGHT.background,amount);
      tint.copy(NIGHT.sky).lerp(wash,.18+.22*hit);
      sky.color.copy(day.sky).lerp(tint,amount);
      sky.groundColor.copy(day.ground).lerp(NIGHT.ground,amount);
      sky.intensity=THREE.MathUtils.lerp(day.skyIntensity,NIGHT.intensity*(1+.3*hit),amount);
      sun.intensity=THREE.MathUtils.lerp(day.sunIntensity,NIGHT.sun,amount);
      // One sweep every eight beats, so the searchlights move with the music.
      const sweep=still?0:(t-FIRST_BEAT)*BPM/60/8*Math.PI*2;
      beams.forEach((beam,i)=> {
        const side=i%2?1:-1;
        beam.rotation.set(-.32+.18*Math.sin(sweep*.5+i),0,side*(.28+.42*Math.sin(sweep+i*1.3)));
        beam.material.color.copy(WASH[(bar+i)%4]);
        beam.material.opacity=amount*(.45+.4*hit);
      });
      ball.rotation.y=still?.4:t*1.4;
      ball.material.color.setRGB(1,1,1).lerp(wash,.35).multiplyScalar(.75+.5*hit);
      sparkles.rotation.y=ball.rotation.y*.6;
      sparkleMaterial.size=(6+5*hit)*renderer.getPixelRatio();
      sparkleMaterial.opacity=amount*(.55+.45*hit);
      pool.material.color.copy(WHITE).lerp(wash,.35);
      pool.material.opacity=amount*(.75+.25*hit);
    },
    dispose() {
      restore();rig.removeFromParent();
      owned.forEach(value=>value.dispose());
    },
  };
}
