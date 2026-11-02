import * as THREE from 'three';

// An easter egg at the end of the dock: the OIIA cat. Click it, or
// type "oiia" anywhere on the island, and it spins on the spot while singing
// "OIIA OIIA". The voice is synthesised with Web Audio (a sawtooth through
// three vowel formants), so the site ships no audio file. With reduced
// motion the cat sings without spinning.

export const SPIN_SECONDS=2.2;
export const SPIN_TURNS=9;
export const LETTER_SECONDS=.9;
const RAMP_UP=.12,RAMP_DOWN=.32;
const LETTER_SIZE=.6;
const VOLUME=.4;
export const CAT_MODEL='/game/oiia-cat.glb';
// The model is scaled to fit this box (world units): a little shorter than the frog.
const CAT_FIT=[.7,.8,.7];

// Share of the spin completed at progress p (0..1). Angular speed ramps up,
// holds and winds down; the total is normalised, so the cat always comes to
// rest facing the sea again.
export function spinProgress(p) {
  p=Math.min(1,Math.max(0,p));
  const total=1-RAMP_UP/2-RAMP_DOWN/2;
  const done=p<RAMP_UP?p*p/(2*RAMP_UP):p<=1-RAMP_DOWN?p-RAMP_UP/2:total-(1-p)**2/(2*RAMP_DOWN);
  return done/total;
}

// Two phrases, the second a step higher with its last vowel held.
// [letter, start, end, pitch, falling to], in seconds and Hz.
const PHRASE=[['O',0,.15,540],['I',.15,.27,680],['I',.27,.39,760],['A',.39,.62,620,520]];
export const SONG=[[0,1,.62],[.8,1.06,.86]].flatMap(([start,lift,hold],phrase)=>PHRASE.map(([letter,at,end,hz,to],index)=>({
  letter,phrase,index,at:start+at,end:start+(index===3?hold:end),hz:hz*lift,to:to?to*lift:0,
})));
export const SONG_SECONDS=SONG.at(-1).end;
const joined=(a,b)=>Math.abs(a-b)<1e-6;

// Formant centres (Hz) and levels for a small, bright voice. The levels
// even out the vowels: a bright I passes far less of the sawtooth than O.
const VOWELS={
  O:[[560,.77],[950,.42],[2600,.09]],
  I:[[400,1.5],[2700,2.1],[3500,.85]],
  A:[[950,1.8],[1500,1.17],[2800,.32]],
};

export function sing(context,when=context.currentTime+.03) {
  const out=context.createGain(),voice=context.createOscillator(),vibrato=context.createOscillator(),depth=context.createGain(),envelope=context.createGain();
  out.gain.value=VOLUME;out.connect(context.destination);
  voice.type='sawtooth';vibrato.frequency.value=6.5;depth.gain.value=10;
  vibrato.connect(depth).connect(voice.frequency);
  envelope.gain.value=0;voice.connect(envelope);
  const formants=[6,9,12].map(q=> {
    const filter=context.createBiquadFilter(),level=context.createGain();
    filter.type='bandpass';filter.Q.value=q;
    envelope.connect(filter).connect(level).connect(out);
    return {filter,level};
  });
  SONG.forEach((note,i)=> {
    const t=when+note.at,before=SONG[i-1],after=SONG[i+1];
    const tied=!!before&&joined(before.end,note.at),glide=tied?.025:.004;
    // A phrase scoops up into its first note; the notes inside it glide.
    if(tied)voice.frequency.setTargetAtTime(note.hz,t,.03);
    else {voice.frequency.setValueAtTime(note.hz*.85,t);voice.frequency.setTargetAtTime(note.hz,t,.035);}
    if(note.to)voice.frequency.setTargetAtTime(note.to,t+(note.end-note.at)*.4,(note.end-note.at)*.3);
    VOWELS[note.letter].forEach(([hz,level],k)=> {
      formants[k].filter.frequency.setTargetAtTime(hz,t,glide);
      formants[k].level.gain.setTargetAtTime(level,t,glide);
    });
    // A repeated vowel is sung again after a short dip; a phrase ends in silence.
    if(!tied)envelope.gain.setTargetAtTime(1,t,.012);
    else if(before.letter===note.letter){envelope.gain.setTargetAtTime(.1,t-.035,.008);envelope.gain.setTargetAtTime(1,t,.012);}
    if(!after||!joined(after.at,note.end))envelope.gain.setTargetAtTime(0,when+note.end-.04,.02);
  });
  const stop=when+SONG_SECONDS+.3;
  voice.start(when);vibrato.start(when);voice.stop(stop);vibrato.stop(stop);
  voice.onended=()=>out.disconnect();
}

const LETTER_COLORS=['#e58a6b','#efbf4c','#6aae9f','#d47a9c'];
const backOut=x=>1+2.70158*(x-1)**3+1.70158*(x-1)**2;

// One white letter with a dark outline; each sprite tints it.
function paintLetter(letter) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const g=canvas.getContext('2d');
  g.font='900 100px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  g.lineWidth=18;g.strokeStyle='#2e4038';g.strokeText(letter,64,70);
  g.fillStyle='#ffffff';g.fillText(letter,64,70);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

// The cat itself is the original OIIA model, loaded as a GLB like the
// AmiiBot figure. Its root is its own batching root, so it spins as one
// piece. Until the model arrives there is nothing to see or click.
export function buildOiiaCat(parent,{mesh,loadModel,layer,camera,at,redraw=()=>{}}) {
  const cat=new THREE.Group(),scale=1;
  cat.name='OIIA cat at the end of the dock';
  cat.userData.dynamic=true;
  cat.position.fromArray(at);
  parent.add(cat);
  const base=cat.position.y;
  let ready=false;
  loadModel(cat,CAT_MODEL,{fit:CAT_FIT,name:'the OIIA cat model',onReady:()=>{ready=true;}});
  // A generous, invisible target, so the cat is tappable on a phone.
  const target=mesh(cat,new THREE.CylinderGeometry(.42,.42,CAT_FIT[1]+.15,10),'#ffffff',[0,(CAT_FIT[1]+.15)/2,0]);
  target.visible=false;target.castShadow=target.receiveShadow=false;

  let started=null,timer=0,letters=null,audio=null;
  const head=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),owned=new Set();
  function makeLetters() {
    const textures={};
    return SONG.map(note=> {
      if(!textures[note.letter]){textures[note.letter]=paintLetter(note.letter);owned.add(textures[note.letter]);}
      const material=new THREE.SpriteMaterial({map:textures[note.letter],color:LETTER_COLORS[note.index],transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
      owned.add(material);
      const sprite=new THREE.Sprite(material);
      sprite.renderOrder=20;sprite.visible=false;layer.add(sprite);
      return sprite;
    });
  }
  function voice() {
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    try {
      audio??=new Context();
      audio.resume?.().catch(()=>{});
      sing(audio);
    } catch {/* The song is optional; the cat still spins. */}
  }
  function rest() {
    cat.rotation.y=0;cat.position.y=base;cat.scale.setScalar(scale);
    letters?.forEach(sprite=>{sprite.visible=false;});
  }
  return {
    ready:()=>ready,
    hit:raycaster=>ready&&raycaster.intersectObject(target,false).length>0,
    position:()=>cat.getWorldPosition(new THREE.Vector3()).toArray(),
    active:now=>started!==null&&now-started<SPIN_SECONDS*1000+100,
    // Returns false before the model loads or while a song is under way.
    start(now,reduced) {
      if(!ready||started!==null&&now-started<SPIN_SECONDS*1000)return false;
      rest();started=now;letters??=makeLetters();
      parent.updateWorldMatrix(true,false);
      head.set(at[0],at[1]+CAT_FIT[1]-.05,at[2]).applyMatrix4(parent.matrixWorld);
      voice();
      // Without the animation loop, one more frame clears the letters.
      clearTimeout(timer);if(reduced)timer=setTimeout(redraw,SONG_SECONDS*1000+50);
      return true;
    },
    update(now,reduced) {
      if(started===null)return;
      const elapsed=(now-started)/1000;
      if(elapsed>=(reduced?SONG_SECONDS:SPIN_SECONDS)){rest();started=null;return;}
      if(!reduced) {
        const p=elapsed/SPIN_SECONDS,swell=Math.sin(Math.PI*p);
        let beat=0;for(const note of SONG)if(elapsed>=note.at)beat=Math.exp(-(elapsed-note.at)*16);
        cat.rotation.y=spinProgress(p)*SPIN_TURNS*Math.PI*2;
        cat.position.y=base+.05*swell+.04*beat;
        cat.scale.set(scale*(1-.04*swell),scale*(1+.07*swell),scale*(1-.04*swell));
      }
      // Letters rise from the cat's head in screen space, one per syllable,
      // and grow when zoomed out so they stay legible.
      // Reduced motion shows a single, still "OIIA" while the song plays.
      right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
      const grow=Math.max(1,1.6/camera.zoom);
      SONG.forEach((note,i)=> {
        const sprite=letters[i],age=elapsed-note.at;
        sprite.visible=reduced?note.phrase===0:age>=0&&age<LETTER_SECONDS;
        if(!sprite.visible)return;
        const life=reduced?.4:age/LETTER_SECONDS,size=LETTER_SIZE*grow*(reduced?1:backOut(Math.min(1,age/.14)));
        sprite.scale.set(size,size,1);
        sprite.position.copy(head).addScaledVector(right,(note.index-1.5)*.46*grow*(1+life*.6)).addScaledVector(up,(.3+1.1*(1-(1-life)**2))*grow);
        sprite.material.opacity=reduced?1:Math.min(1,(1-life)/.3);
      });
    },
    dispose() {
      clearTimeout(timer);
      letters?.forEach(sprite=>sprite.removeFromParent());
      owned.forEach(value=>value.dispose());
      audio?.close().catch(()=>{});
    },
  };
}
