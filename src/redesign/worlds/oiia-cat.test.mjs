import test from 'node:test';
import assert from 'node:assert/strict';
import { createOiiaTimeline, COMBO_GAP, SONG_GRACE, FALLBACK_SECONDS } from './oiia-cat.js';
import { beatAt, songEnergy, BPM, FIRST_BEAT } from './club.js';

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

test('the club keeps the song\'s beat: gentle pulses, colours by the bar',()=>{
  const period=60/BPM;
  assert.equal(beatAt(FIRST_BEAT-.01).pulse,0);
  const first=beatAt(FIRST_BEAT),last=beatAt(FIRST_BEAT+period*.99);
  assert.equal(first.beat,0);assert.ok(Math.abs(first.pulse-1)<1e-9);assert.ok(last.pulse<.02);
  assert.equal(beatAt(FIRST_BEAT+period*4.01).bar,1);
  assert.ok(BPM/60<3,'Pulses must stay below three a second');
});

test('the drops are the loudest part of the song',()=>{
  const drop=songEnergy(45),intro=songEnergy(1),late=songEnergy(115);
  assert.ok(drop>.85&&late>.85);assert.ok(intro<.2);
  assert.equal(songEnergy(-5),songEnergy(0));assert.ok(songEnergy(999)>=0);
});
