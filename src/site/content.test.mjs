import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {links,experienceById,patents,appById,appMedia,normalizePublications} from '../redesign/content.js';
import {LINKS,byId} from '../redesign/worlds/data.js';
import {readingFocus} from './reading-focus.js';
import {worldRenderSettings} from '../redesign/worlds/render-settings.js';

test('career dates, documents and app destinations use the shared records',()=>{
  assert.equal(LINKS,links);
  for(const id of ['isu','seagate','sunwoda'])assert.equal(byId[id].period,experienceById[id].when);
  for(const id of Object.keys(appMedia)){
    assert.equal(byId[id].links,appById[id].links);
    for(const file of Object.values(appMedia[id]).filter(value=>value.startsWith('/')))assert.ok(existsSync(new URL('../../public'+file,import.meta.url)),file);
  }
  assert.ok(byId.naiive.links.some(link=>link.href.includes('apps.apple.com/us/app/naiive/')));
  for(const file of [links.cv,links.resume])assert.ok(existsSync(new URL('../../public'+file,import.meta.url)));
});
test('grant identifiers and dates distinguish grants from earlier filings',()=>{
  assert.equal(new Set(patents.map(p=>p.id)).size,4);
  for(const patent of patents){
    assert.match(patent.id,/^CN\d+B$/);
    assert.ok(patent.granted>patent.filed);
    assert.ok(byId.patents.list.some(entry=>entry.includes(patent.id)&&entry.includes(patent.granted)));
  }
  const papers=normalizePublications(JSON.parse(readFileSync(new URL('../../public/publications.json',import.meta.url))));
  assert.equal(papers.length,13);assert.equal(papers.filter(p=>p.firstAuthor).length,5);
});
test('scroll context chooses a visible entry and ignores out-of-view or invalid anchors',()=>{
  assert.equal(readingFocus([{id:'amiibot',top:1000,bottom:1300},{id:'naiive',top:150,bottom:500},{id:'totk',top:600,bottom:800}],900),'naiive');
  assert.equal(readingFocus([{id:'amiibot',top:-200,bottom:350},{id:'papers',top:-1400,bottom:-500}],800),'amiibot');
  assert.equal(readingFocus([{id:'papers',top:150,bottom:450}],800),'library');
  assert.equal(readingFocus([{id:'profile',top:100,bottom:500}],800),null);
});
test('coarse pointers have a bounded render budget while desktop quality is preserved',()=>{
  assert.deepEqual(worldRenderSettings({coarse:true,dpr:3}),{shadowSize:1024,pixelRatio:1.25});
  assert.deepEqual(worldRenderSettings({coarse:false,dpr:2}),{shadowSize:1536,pixelRatio:1.5});
  assert.equal(worldRenderSettings({coarse:true,dpr:1}).pixelRatio,1);
});
