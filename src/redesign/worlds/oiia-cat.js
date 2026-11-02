import * as THREE from 'three';

// An easter egg at the end of the dock: the OIIA cat, cut from the original
// GIF (archive/original-assets/oiia-cat.gif). One click spins it to a single
// "oiia"; three quick clicks, or typing "oiia" anywhere on the island, play
// the full song, and a later click stops it. With reduced motion the cat
// stands still and only sings.

// public/game/oiia-cat.webp is the GIF as an 8 × 8 sheet of 128 px cells:
// cell 0 is the standing cat, cells 1-59 the spin, all cut from one box and
// bottom-aligned 4 px above the cell edge. The spin frames are lowered 48 px,
// so the spinning cat sits where the standing cat's feet were.
export const CAT_SHEET='/game/oiia-cat.webp';
// The original sounds, both normalised to -18 LUFS: `tap` is the first
// phrase of the short sound effect, `song` the full track. Sources are in
// archive/original-assets/.
export const CAT_SOUNDS={tap:'/game/oiia-tap.mp3',song:'/game/oiia-song.mp3'};
const COLUMNS=8,SPIN_FRAMES=59,FRAME_SECONDS=.03,FOOT=4/128;
const CAT_SIZE=1.45;              // sprite edge in world units; the standing cat is about 1.35 tall, taller than the frog
export const COMBO_TAPS=3;        // quick clicks that start the song…
export const COMBO_GAP=.6;        // …each within this many seconds of the last
export const SONG_GRACE=1.5;      // clicks this soon after the song starts are the combo's tail, not a stop
export const FALLBACK_SECONDS={tap:1.65,song:6}; // a run's length when its sound cannot play
export const LETTER_SECONDS=.9;
const BURST=[0,.15,.27,.39],BURST_EVERY=.8,LETTER_SIZE=.6;

// The "OIIA" letters on screen `elapsed` seconds into the song: a burst of
// four every BURST_EVERY seconds, none outliving the run. A burst is gone
// before the next but one begins, so two sets of four sprites suffice.
export function lettersAt(elapsed,length) {
  const notes=[],current=Math.floor(elapsed/BURST_EVERY);
  for(let burst=Math.max(0,current-1);burst<=current;burst++)BURST.forEach((offset,index)=> {
    const at=burst*BURST_EVERY+offset,age=elapsed-at;
    if(age>=0&&age<LETTER_SECONDS&&at+LETTER_SECONDS<=length)notes.push({letter:'OIIA'[index],index,burst,age});
  });
  return notes;
}

// Clicks to runs. A click on a still cat sings one "oiia"; more clicks during
// it count towards the combo, and the third quick one starts the song. Once
// the song is under way, a deliberate click stops it. `seconds(kind)` is the
// sound's length (Infinity while it plays: its end ends the run), or 0 when
// it cannot play.
export function createOiiaTimeline(seconds=()=>0) {
  let mode=null,started=0,lastTap=-Infinity,taps=0,quietUntil=-Infinity;
  const elapsed=now=>(now-started)/1000;
  const length=()=>mode?seconds(mode)||FALLBACK_SECONDS[mode]:0;
  const running=now=>mode!==null&&elapsed(now)<length();
  function begin(kind,now){mode=kind;started=now;if(kind==='song')taps=0;return kind;}
  return {
    elapsed,running,length,
    get mode(){return mode;},
    tap(now) {
      taps=(now-lastTap)/1000<=COMBO_GAP?taps+1:1;lastTap=now;
      // The rest of a double click that stopped the song changes nothing.
      if(now<quietUntil){quietUntil=now+COMBO_GAP*1000;return null;}
      const on=running(now)?mode:null;
      if(on==='song') {
        if(taps>1||elapsed(now)<SONG_GRACE)return null;
        mode=null;quietUntil=now+COMBO_GAP*1000;return 'stop';
      }
      if(taps>=COMBO_TAPS)return begin('song',now);
      return on?null:begin('tap',now);
    },
    song:now=>running(now)&&mode==='song'?null:begin('song',now),
    end(kind){if(!kind||kind===mode)mode=null;},
  };
}

// Each sound streams through its own <audio> element, so the two-minute song
// is never decoded into memory at once. A missing file, or a browser that
// refuses to play, leaves the cat spinning in silence.
function createPlayers(urls,onEnded) {
  const players={},refused=new Set();
  function player(kind) {
    if(!players[kind]&&typeof Audio==='function') {
      const audio=new Audio();
      audio.preload=kind==='tap'?'auto':'metadata';
      audio.addEventListener('ended',()=>onEnded(kind));
      audio.src=urls[kind];
      players[kind]=audio;
    }
    return players[kind];
  }
  const stop=()=>Object.values(players).forEach(audio=>audio.pause());
  return {
    stop,
    prepare:kind=>{player(kind);},
    // Called inside the click, as mobile browsers require.
    play(kind) {
      stop();
      const audio=player(kind);
      if(!audio)return;
      refused.delete(kind);
      try {audio.currentTime=0;} catch {/* Not seekable yet; it starts at 0 anyway. */}
      audio.play().catch(error=>{if(error.name!=='AbortError')refused.add(kind);});
    },
    // While a sound plays, its run lasts until 'ended', however late the
    // sound got going; a sound that cannot play leaves the fallback length.
    seconds(kind) {
      const audio=players[kind];
      return !audio||audio.error||refused.has(kind)||audio.paused||audio.ended?0:Infinity;
    },
    duration(kind) {
      const seconds=players[kind]?.duration;
      return Number.isFinite(seconds)?seconds:0;
    },
    dispose() {
      stop();
      Object.values(players).forEach(audio=>{audio.removeAttribute('src');audio.load();});
    },
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
  let ready=false,disposed=false,idle=true,timer=0,letters=null;
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

  // A sound that ends ends its run; one more frame puts the cat back.
  const players=createPlayers(CAT_SOUNDS,kind=>{timeline.end(kind);if(!disposed)redraw();});
  const timeline=createOiiaTimeline(players.seconds);
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
    idle=true;timeline.end();players.stop();show(0);
    letters?.forEach(sprite=>{sprite.visible=false;});
  }
  function act(kind,reduced) {
    if(!kind)return null;
    idle=false;clearTimeout(timer);
    if(kind==='stop'){players.stop();return kind;}
    players.play(kind);
    if(kind==='tap')players.prepare('song');
    else {
      letters??=makeLetters();
      parent.updateWorldMatrix(true,false);
      head.set(at[0],at[1]+CAT_SIZE*.9,at[2]).applyMatrix4(parent.matrixWorld);
    }
    // Without the animation loop, a silent run needs one more frame to end.
    if(reduced)timer=setTimeout(redraw,FALLBACK_SECONDS[kind]*1000+50);
    return kind;
  }
  return {
    ready:()=>ready,
    hit:raycaster=>ready&&raycaster.intersectObject(target,false).length>0,
    prefetch:()=>players.prepare('tap'),
    position:()=>cat.getWorldPosition(new THREE.Vector3()).toArray(),
    active:now=>timeline.running(now),
    // What a click did: 'tap', 'song' or 'stop'; null if it changed nothing.
    tap:(now,reduced)=>ready?act(timeline.tap(now),reduced):null,
    song:(now,reduced)=>ready?act(timeline.song(now),reduced):null,
    stop(){if(!idle)settle();},
    update(now,reduced) {
      if(idle)return;
      if(!timeline.running(now)){settle();return;}
      const elapsed=timeline.elapsed(now);
      show(reduced?0:1+Math.floor(elapsed/FRAME_SECONDS)%SPIN_FRAMES);
      if(!letters)return;
      letters.forEach(sprite=>{sprite.visible=false;});
      if(timeline.mode!=='song')return;
      // Letters rise from the cat's head in screen space, one per syllable,
      // and grow when zoomed out so they stay legible. Reduced motion shows
      // a single, still "OIIA" for as long as the song lasts.
      right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
      const grow=Math.max(1,1.6/camera.zoom);
      const notes=reduced?[0,1,2,3].map(index=>({index,burst:0,age:.4*LETTER_SECONDS})):lettersAt(elapsed,players.duration('song')||Infinity);
      for(const {index,burst,age} of notes) {
        const sprite=letters[(burst%2)*4+index],life=age/LETTER_SECONDS;
        const size=LETTER_SIZE*grow*(reduced?1:backOut(Math.min(1,age/.14)));
        sprite.visible=true;sprite.scale.set(size,size,1);
        sprite.position.copy(head).addScaledVector(right,(index-1.5)*.46*grow*(1+life*.6)).addScaledVector(up,(.3+1.1*(1-(1-life)**2))*grow);
        sprite.material.opacity=reduced?1:Math.min(1,(1-life)/.3);
      }
    },
    dispose() {
      disposed=true;clearTimeout(timer);players.dispose();
      letters?.forEach(sprite=>sprite.removeFromParent());
      owned.forEach(value=>value.dispose());
    },
  };
}
