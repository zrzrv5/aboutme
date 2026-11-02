import test from 'node:test';
import assert from 'node:assert/strict';
import { createOiiaTimeline, letterSchedule, TAP_SECONDS, COMBO_GAP, FULL_SECONDS, LETTER_SECONDS } from './oiia-cat.js';

const ms=seconds=>seconds*1000;

test('one click is a short spin that stops by itself',()=>{
  const cat=createOiiaTimeline();
  assert.deepEqual(cat.tap(0),{kind:'tap',fresh:true});
  assert.ok(cat.running(ms(TAP_SECONDS-.05)));assert.equal(cat.fullAt,null);
  assert.ok(!cat.running(ms(TAP_SECONDS)));
});

test('three quick clicks turn the short spin into the full egg, which then plays out',()=>{
  const cat=createOiiaTimeline(),step=COMBO_GAP-.1;
  cat.tap(0);
  assert.deepEqual(cat.tap(ms(step)),{kind:'more',fresh:false});
  assert.ok(cat.length>=step+TAP_SECONDS,'A second click keeps the cat spinning');
  assert.deepEqual(cat.tap(ms(2*step)),{kind:'oiia',fresh:false});
  assert.equal(cat.fullAt,2*step);assert.equal(cat.length,2*step+FULL_SECONDS);
  assert.equal(cat.tap(ms(2*step+.2)),null,'Clicks during the full egg change nothing');
  assert.ok(cat.running(ms(2*step+FULL_SECONDS-.05)));assert.ok(!cat.running(ms(2*step+FULL_SECONDS)));
});

test('slow clicks never reach the full egg',()=>{
  const cat=createOiiaTimeline(),step=COMBO_GAP+.1;
  for(let i=0;i<6;i++)assert.notEqual(cat.tap(ms(i*step))?.kind,'oiia');
});

test('the full egg lasts as long as the song once it has loaded; typing starts it at once',()=>{
  const cat=createOiiaTimeline(()=>5.5);
  assert.deepEqual(cat.full(0),{kind:'oiia',fresh:true});
  assert.equal(cat.fullAt,0);assert.equal(cat.length,5.5);
  assert.equal(cat.full(ms(1)),null);
  const late=createOiiaTimeline(()=>5.5);late.tap(0);late.tap(ms(.3));late.tap(ms(.6));
  assert.equal(late.length,5.5,'An upgrade keeps the song running to its end');
});

test('OIIA letters spell the song and are gone when the egg ends',()=>{
  const notes=letterSchedule(.8,4.8);
  assert.equal(notes.map(note=>note.letter).join(''),'OIIA'.repeat(notes.length/4));
  assert.ok(notes.length>=8);assert.equal(notes[0].at,.8);
  assert.ok(notes.every(note=>note.at+LETTER_SECONDS<=4.8+1e-9));
  // Two sprite sets: a burst ends before the next but one starts.
  for(const note of notes)for(const other of notes)if(other.burst===note.burst+2)assert.ok(other.at>=note.at+LETTER_SECONDS);
});
