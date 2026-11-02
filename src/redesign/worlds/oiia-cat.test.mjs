import test from 'node:test';
import assert from 'node:assert/strict';
import { createOiiaTimeline, lettersAt, COMBO_GAP, SONG_GRACE, FALLBACK_SECONDS, LETTER_SECONDS } from './oiia-cat.js';

const ms=seconds=>seconds*1000;
const quick=COMBO_GAP-.1,slow=COMBO_GAP+.1;

test('one click sings one "oiia" and stops by itself; clicks during it do not restart it',()=>{
  const cat=createOiiaTimeline(kind=>kind==='tap'?1.6:0);
  assert.equal(cat.tap(0),'tap');assert.equal(cat.length(),1.6);
  assert.equal(cat.tap(ms(slow)),null);
  assert.ok(cat.running(ms(1.55)));assert.ok(!cat.running(ms(1.6)));
  assert.equal(cat.tap(ms(2.5)),'tap','A click after it ends sings again');
});

test('three quick clicks start the song, which plays out through the rest of the combo',()=>{
  const cat=createOiiaTimeline(kind=>kind==='song'?133:1.6);
  assert.equal(cat.tap(0),'tap');assert.equal(cat.tap(ms(quick)),null);
  assert.equal(cat.tap(ms(2*quick)),'song');assert.equal(cat.mode,'song');assert.equal(cat.length(),133);
  for(let i=3;i<7;i++)assert.equal(cat.tap(ms(i*quick)),null,'Mashing on is not a stop');
});

test('slow clicks never reach the song',()=>{
  const cat=createOiiaTimeline();
  for(let i=0;i<8;i++)assert.notEqual(cat.tap(ms(i*slow)),'song');
});

test('a deliberate click stops the song, and the rest of a double click does nothing',()=>{
  const cat=createOiiaTimeline(()=>133);
  assert.equal(cat.song(0),'song');assert.equal(cat.song(ms(1)),null,'Typing again changes nothing');
  assert.equal(cat.tap(ms(SONG_GRACE-.2)),null,'Too soon: still part of the combo');
  assert.equal(cat.tap(ms(10)),'stop');assert.ok(!cat.running(ms(10)));
  assert.equal(cat.tap(ms(10+quick)),null);
  assert.equal(cat.tap(ms(12)),'tap');
});

test('the song runs until it ends, and falls back to a short spin without sound',()=>{
  let seconds=Infinity;
  const streaming=createOiiaTimeline(kind=>kind==='song'?seconds:0);
  streaming.song(0);assert.ok(streaming.running(ms(60)),'Still loading its length');
  seconds=133;assert.ok(streaming.running(ms(132)));assert.ok(!streaming.running(ms(133)));
  streaming.end('tap');streaming.song(ms(200));streaming.end('tap');assert.ok(streaming.running(ms(201)),'Another sound ending does not stop the song');
  streaming.end('song');assert.ok(!streaming.running(ms(201)));
  const silent=createOiiaTimeline();
  silent.tap(0);assert.equal(silent.length(),FALLBACK_SECONDS.tap);
  silent.end();silent.song(0);assert.equal(silent.length(),FALLBACK_SECONDS.song);
});

test('OIIA letters come in order, at most two bursts at once, never outliving the run',()=>{
  let seen='';
  for(let t=0;t<20;t+=.01) {
    const notes=lettersAt(t,20);
    assert.ok(new Set(notes.map(note=>note.burst)).size<=2);
    for(const note of notes)if(note.age<.01)seen+=note.letter;
  }
  assert.ok(seen.startsWith('OIIAOIIAOIIA'),seen.slice(0,12));
  for(let t=0;t<5;t+=.01)for(const note of lettersAt(t,5))assert.ok(t-note.age+LETTER_SECONDS<=5+1e-9);
});
