import * as THREE from 'three';

// An easter egg at the end of the dock: the OIIA cat, cut from the original
// GIF (archive/original-assets/oiia-cat.gif). One click spins it briefly to
// the start of the song; three quick clicks, or typing "oiia" anywhere on the
// island, play the whole thing. With reduced motion the cat stands still and
// only sings.

// public/game/oiia-cat.webp is the GIF as an 8 × 8 sheet of 128 px cells:
// cell 0 is the standing cat, cells 1-59 the spin, all cut from one box and
// bottom-aligned 4 px above the cell edge. The spin frames are lowered 48 px,
// so the spinning cat sits where the standing cat's feet were.
export const CAT_SHEET='/game/oiia-cat.webp';
// The original sound. It loads on first contact with the cat; without the
// file the cat simply spins in silence.
export const CAT_SOUND='/game/oiia.mp3';
const COLUMNS=8,SPIN_FRAMES=59,FRAME_SECONDS=.03,FOOT=4/128;
const CAT_SIZE=1.45;              // sprite edge in world units; the standing cat is about 1.35 tall, taller than the frog
const SONG_LEVEL=.8;
export const TAP_SECONDS=.9;      // one click: a short spin
export const COMBO_TAPS=3;        // quick clicks that start the full egg…
export const COMBO_GAP=.6;        // …each within this many seconds of the last
export const FULL_SECONDS=4;      // the full egg's length until the song has loaded
export const LETTER_SECONDS=.9;
const BURST=[0,.15,.27,.39],BURST_EVERY=.8,LETTER_SIZE=.6;

// "OIIA" bursts from `from` seconds, ending before the egg does. A burst is
// gone before the next but one begins, so two sets of four sprites suffice.
export function letterSchedule(from,length) {
  const notes=[];
  for(let burst=0,start=from;start+BURST.at(-1)+LETTER_SECONDS<=length+1e-9;burst++,start+=BURST_EVERY)
    BURST.forEach((at,index)=>notes.push({letter:'OIIA'[index],index,burst,at:start+at}));
  return notes;
}

// Clicks to runs. A click on a still cat starts a short spin; clicks that
// follow keep it going; the third quick click turns it into the full egg,
// which then plays out. `clipSeconds` is the song's length once loaded.
export function createOiiaTimeline(clipSeconds=()=>0) {
  let started=null,length=0,full=null,lastTap=-Infinity,taps=0;
  const elapsed=now=>(now-started)/1000;
  const running=now=>started!==null&&elapsed(now)<length;
  function goFull(now) {
    const at=elapsed(now),clip=clipSeconds();
    full=at;length=clip?Math.max(clip,at+2):at+FULL_SECONDS;taps=0;
  }
  return {
    elapsed,running,
    get length(){return length;},
    get fullAt(){return full;},
    tap(now) {
      taps=(now-lastTap)/1000<=COMBO_GAP?taps+1:1;lastTap=now;
      const fresh=!running(now);
      if(fresh){started=now;length=TAP_SECONDS;full=null;}
      else if(full!==null)return null;
      if(taps>=COMBO_TAPS){goFull(now);return {kind:'oiia',fresh};}
      if(!fresh)length=Math.max(length,elapsed(now)+TAP_SECONDS);
      return {kind:fresh?'tap':'more',fresh};
    },
    full(now) {
      const fresh=!running(now);
      if(!fresh&&full!==null)return null;
      if(fresh)started=now;
      goFull(now);
      return {kind:'oiia',fresh};
    },
    end(){started=null;full=null;},
  };
}

// The original clip, decoded once. Playback follows the cat's timeline: it
// starts with a run, fades out where the run ends, and a late arrival joins
// a run already under way at the right offset.
function createSong(url) {
  let loading=null,clip=null,context=null,source=null,gain=null,origin=0;
  function load() {
    const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    if(!Offline)return Promise.resolve(null);
    // Decoding offline needs no click, so the clip can load on hover.
    loading??=fetch(url)
      .then(response=>{if(!response.ok)throw new Error(String(response.status));return response.arrayBuffer();})
      .then(data=>new Offline(1,1,44100).decodeAudioData(data))
      .then(buffer=>{clip=buffer;return buffer;})
      .catch(()=>null);
    return loading;
  }
  // Called inside the click, so mobile browsers let the sound start later.
  function unlock() {
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    try {context??=new Context();context.resume?.().catch(()=>{});} catch {context=null;}
  }
  function stop() {
    if(!source)return;
    const old=source;source=null;
    try {old.stop();} catch {/* Already stopped. */}
    old.disconnect();
  }
  // Fade out by clip time `length`, unless the clip ends first.
  function fade(length) {
    const now=context.currentTime,end=origin+length,level=gain.gain;
    level.cancelScheduledValues(now);level.setValueAtTime(SONG_LEVEL,now);
    if(length<clip.duration){level.setValueAtTime(SONG_LEVEL,Math.max(now,end-.15));level.linearRampToValueAtTime(0,Math.max(now+.01,end));}
  }
  return {
    load,unlock,stop,
    seconds:()=>clip?.duration??0,
    // A fresh run restarts the clip; otherwise only its end moves.
    sync(elapsed,length,fresh) {
      if(fresh)stop();
      if(!clip||!context)return;
      if(source){fade(length);return;}
      if(elapsed>=Math.min(length,clip.duration))return;
      const player=context.createBufferSource();
      player.buffer=clip;gain=context.createGain();
      player.connect(gain).connect(context.destination);
      origin=context.currentTime-elapsed;player.start(context.currentTime,elapsed);
      player.onended=()=>{if(source===player)stop();};
      source=player;fade(length);
    },
    dispose(){stop();context?.close().catch(()=>{});},
  };
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

// A camera-facing sprite, like the frog: the GIF's frames supply the spin.
// The root is its own batching root, so the sprite keeps updating.
export function buildOiiaCat(parent,{mesh,layer,camera,at,redraw=()=>{}}) {
  const cat=new THREE.Group();
  cat.name='OIIA cat at the end of the dock';
  cat.userData.dynamic=true;
  cat.position.fromArray(at);
  parent.add(cat);
  let ready=false,disposed=false,idle=true,timer=0,letters=null,schedule=[];
  const sheet=new THREE.TextureLoader().load(CAT_SHEET,()=>{if(disposed)return;ready=true;figure.visible=true;redraw();});
  sheet.colorSpace=THREE.SRGBColorSpace;sheet.generateMipmaps=false;sheet.minFilter=THREE.LinearFilter;
  sheet.repeat.set(1/COLUMNS,1/COLUMNS);
  // Unlit and outside tone mapping, so the cat keeps the GIF's colours.
  const material=new THREE.SpriteMaterial({map:sheet,alphaTest:.1,toneMapped:false});
  const figure=new THREE.Sprite(material);
  figure.center.set(.5,FOOT);figure.scale.set(CAT_SIZE,CAT_SIZE,1);
  figure.visible=false;figure.userData.dynamic=true;
  cat.add(figure);
  const show=frame=>sheet.offset.set((frame%COLUMNS)/COLUMNS,1-(Math.floor(frame/COLUMNS)+1)/COLUMNS);
  show(0);
  // A generous, invisible target, so the cat is tappable on a phone.
  const target=mesh(cat,new THREE.CylinderGeometry(CAT_SIZE*.45,CAT_SIZE*.45,CAT_SIZE,10),'#ffffff',[0,CAT_SIZE/2,0]);
  target.visible=false;target.castShadow=target.receiveShadow=false;

  const song=createSong(CAT_SOUND),timeline=createOiiaTimeline(song.seconds);
  const head=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(),owned=new Set([sheet,material]);
  function makeLetters() {
    const textures={};
    return Array.from({length:8},(_,slot)=> {
      const letter='OIIA'[slot%4];
      if(!textures[letter]){textures[letter]=paintLetter(letter);owned.add(textures[letter]);}
      const tint=new THREE.SpriteMaterial({map:textures[letter],color:LETTER_COLORS[slot%4],transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
      owned.add(tint);
      const sprite=new THREE.Sprite(tint);
      sprite.renderOrder=20;sprite.visible=false;layer.add(sprite);
      return sprite;
    });
  }
  function settle() {
    idle=true;timeline.end();song.stop();show(0);schedule=[];
    letters?.forEach(sprite=>{sprite.visible=false;});
  }
  function apply(change,now,reduced) {
    if(!change)return null;
    idle=false;
    const elapsed=timeline.elapsed(now);
    if(change.kind==='oiia') {
      letters??=makeLetters();
      schedule=letterSchedule(timeline.fullAt,timeline.length);
      parent.updateWorldMatrix(true,false);
      head.set(at[0],at[1]+CAT_SIZE*.9,at[2]).applyMatrix4(parent.matrixWorld);
    } else if(change.fresh) schedule=[];
    song.unlock();
    song.sync(elapsed,timeline.length,change.fresh);
    // A song that arrives late joins the run at the right point.
    if(!song.seconds())song.load().then(()=> {
      const later=performance.now();
      if(!disposed&&timeline.running(later))song.sync(timeline.elapsed(later),timeline.length,false);
    });
    // Without the animation loop, one more frame puts the cat back.
    clearTimeout(timer);
    if(reduced)timer=setTimeout(redraw,(timeline.length-elapsed)*1000+50);
    return change.kind;
  }
  return {
    ready:()=>ready,
    hit:raycaster=>ready&&raycaster.intersectObject(target,false).length>0,
    prefetch:()=>{song.load();},
    position:()=>cat.getWorldPosition(new THREE.Vector3()).toArray(),
    active:now=>timeline.running(now),
    // What a click did: 'tap', 'more' or 'oiia'; null if it changed nothing.
    tap:(now,reduced)=>ready?apply(timeline.tap(now),now,reduced):null,
    full:(now,reduced)=>ready?apply(timeline.full(now),now,reduced):null,
    update(now,reduced) {
      if(idle)return;
      if(!timeline.running(now)){settle();return;}
      const elapsed=timeline.elapsed(now);
      show(reduced?0:1+Math.floor(elapsed/FRAME_SECONDS)%SPIN_FRAMES);
      if(!letters)return;
      letters.forEach(sprite=>{sprite.visible=false;});
      // Letters rise from the cat's head in screen space, one per syllable,
      // and grow when zoomed out so they stay legible. Reduced motion shows
      // a single, still "OIIA" for as long as the egg lasts.
      right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
      const grow=Math.max(1,1.6/camera.zoom);
      for(const note of schedule) {
        const age=elapsed-note.at;
        if(reduced?note.burst>0:age<0||age>=LETTER_SECONDS)continue;
        const sprite=letters[(note.burst%2)*4+note.index];
        const life=reduced?.4:age/LETTER_SECONDS,size=LETTER_SIZE*grow*(reduced?1:backOut(Math.min(1,age/.14)));
        sprite.visible=true;sprite.scale.set(size,size,1);
        sprite.position.copy(head).addScaledVector(right,(note.index-1.5)*.46*grow*(1+life*.6)).addScaledVector(up,(.3+1.1*(1-(1-life)**2))*grow);
        sprite.material.opacity=reduced?1:Math.min(1,(1-life)/.3);
      }
    },
    dispose() {
      disposed=true;clearTimeout(timer);song.dispose();
      letters?.forEach(sprite=>sprite.removeFromParent());
      owned.forEach(value=>value.dispose());
    },
  };
}
