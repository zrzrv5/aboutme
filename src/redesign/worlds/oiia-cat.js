import * as THREE from 'three';

// An easter egg at the end of the dock: the OIIA cat, cut from the original
// GIF (archive/original-assets/oiia-cat.gif). One click spins it to a single
// "oiia"; three quick clicks, or typing "oiia" anywhere on the island, play
// the full song, which turns the island into a night club (club.js), and a
// later click stops it. With reduced motion the cat stands still.

// public/game/oiia-cat.webp is the GIF as an 8 × 8 sheet of 128 px cells:
// cell 0 is the standing cat, cells 1-59 the spin, all cut from one box and
// bottom-aligned 4 px above the cell edge. The spin frames are lowered 48 px,
// so the spinning cat sits where the standing cat's feet were.
export const CAT_SHEET='/game/oiia-cat.webp';
// The original sounds, both normalised to -26 LUFS: `tap` is the first
// phrase of the short sound effect, `song` the full track. Sources are in
// archive/original-assets/.
export const CAT_SOUNDS={tap:'/game/oiia-tap.mp3',song:'/game/oiia-song.mp3'};
const COLUMNS=8,SPIN_FRAMES=59,FRAME_SECONDS=.03,FOOT=4/128;
const CAT_SIZE=1.1;               // sprite edge in world units; the standing cat is about the frog's height
export const COMBO_TAPS=3;        // quick clicks that start the song…
export const COMBO_GAP=.6;        // …each within this many seconds of the last
export const SONG_GRACE=1.5;      // clicks this soon after the song starts are the combo's tail, not a stop
export const FALLBACK_SECONDS={tap:1.65,song:6}; // a run's length when its sound cannot play
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
    time(kind) {
      const audio=players[kind];
      return audio&&!audio.paused&&!audio.ended?audio.currentTime:null;
    },
    dispose() {
      stop();
      Object.values(players).forEach(audio=>{audio.removeAttribute('src');audio.load();});
    },
  };
}

// A camera-facing sprite, like the frog: the GIF's frames supply the spin.
// The root is its own batching root, so the sprite keeps updating.
export function buildOiiaCat(parent,{mesh,at,redraw=()=>{}}) {
  const cat=new THREE.Group();
  cat.name='OIIA cat at the end of the dock';
  cat.userData.dynamic=true;
  cat.position.fromArray(at);
  parent.add(cat);
  let ready=false,disposed=false,idle=true,timer=0;
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
  const owned=new Set([sheet,material]);
  function settle() {
    idle=true;timeline.end();players.stop();show(0);
  }
  function act(kind,reduced) {
    if(!kind)return null;
    idle=false;clearTimeout(timer);
    if(kind==='stop'){players.stop();return kind;}
    players.play(kind);
    if(kind==='tap')players.prepare('song');
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
    // Whether the full song is on, and how far into it: the clip's own clock
    // while it plays, so the club stays on the beat however late it started.
    partying:now=>timeline.mode==='song'&&timeline.running(now),
    songTime:now=>players.time('song')??timeline.elapsed(now),
    update(now,reduced) {
      if(idle)return;
      if(!timeline.running(now)){settle();return;}
      const elapsed=timeline.elapsed(now);
      show(reduced?0:1+Math.floor(elapsed/FRAME_SECONDS)%SPIN_FRAMES);
    },
    dispose() {
      disposed=true;clearTimeout(timer);players.dispose();
      owned.forEach(value=>value.dispose());
    },
  };
}
