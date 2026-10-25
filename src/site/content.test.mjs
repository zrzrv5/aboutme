import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {links,experienceById,patents,appById,appMedia,normalizePublications} from '../redesign/content.js';
import {LINKS,byId} from '../redesign/worlds/data.js';
import {readingFocus} from './reading-focus.js';
import {worldRenderSettings,createFrameGovernor} from '../redesign/worlds/render-settings.js';

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
  const row=[{id:'amiibot',top:150,bottom:550},{id:'ling',top:150,bottom:550}];
  assert.equal(readingFocus(row,800,'ling'),'ling');
  assert.equal(readingFocus(row,800,'naiive'),'amiibot');
});
test('coarse pointers have a bounded render budget while desktop quality is preserved',()=>{
  assert.deepEqual(worldRenderSettings({coarse:true,dpr:3,width:430,height:932}),{shadowSize:1024,pixelRatio:2});
  assert.deepEqual(worldRenderSettings({coarse:false,dpr:2}),{shadowSize:1536,pixelRatio:1.5});
  assert.equal(worldRenderSettings({coarse:true,dpr:1}).pixelRatio,1);
  const tablet=worldRenderSettings({coarse:true,dpr:3,width:1024,height:1366});
  assert.ok(1024*1366*tablet.pixelRatio**2<=2_000_001);
});
test('slow GPUs step down in resolution without dropping below a sharp floor',()=>{
  const base=worldRenderSettings({coarse:false,dpr:2,width:1280,height:800});
  const low=worldRenderSettings({coarse:false,dpr:2,width:1280,height:800,tier:2});
  assert.ok(low.pixelRatio<base.pixelRatio&&low.shadowSize<base.shadowSize);
  assert.equal(worldRenderSettings({dpr:1,width:1366,height:768,tier:2}).pixelRatio,.8);
  assert.ok(3840*2160*worldRenderSettings({dpr:1.5,width:3840,height:2160}).pixelRatio**2<=4_200_001);
  const governor=createFrameGovernor({frames:10});
  let now=0,slow=false;
  for(let i=0;i<12;i++)slow=governor.sample(now+=17,1000/60,0)||slow;
  assert.equal(slow,false,'a steady 60 fps keeps full quality');
  for(let i=0;i<12;i++)slow=governor.sample(now+=40,1000/60,0)||slow;
  assert.equal(slow,true,'frames at 25 fps step down');
  governor.reset();slow=false;
  for(let i=0;i<12;i++)slow=governor.sample(now+=(i%4?17:3000),1000/60,0)||slow;
  assert.equal(slow,false,'tab switches and loading hitches are ignored');
});
