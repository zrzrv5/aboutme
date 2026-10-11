import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, byId, itemById } from './data.js';
import { skillAtExperience, skillJourney, skillsForExperience, nextSkillIndex } from './skills.js';

const stage = (id,place) => skillAtExperience(itemById[id],place);

test('DFT, MD and MLIP follow the user-confirmed progression', () => {
  for(const [id,places] of [['dft',['sunwoda','isu']],['md',['wustl','sunwoda','isu']],['mlip',['sunwoda','isu']]]) {
    places.forEach((place,index) => {
      assert.equal(stage(id,place).level,index+1);
      assert.equal(stage(id,place).status,index === 0 ? 'Acquired' : 'Level up');
    });
  }
});

test('Python and optimization retain their acquired level when applied later', () => {
  assert.equal(stage('python','cust').level,1);
  assert.equal(stage('python','sunwoda').level,2);
  for(const place of ['isu','seagate','typeshi']) {
    assert.equal(stage('python',place).level,2);
    assert.equal(stage('python',place).status,'Applied');
  }
  assert.equal(itemById.bo.found,'sunwoda');
  assert.equal(stage('bo','sunwoda').status,'Acquired');
  assert.equal(stage('bo','isu').status,'Applied');
  assert.equal(stage('bo','isu').level,stage('bo','sunwoda').level);
});

test('undergraduate and masters pages include learning and identified independent projects', () => {
  const undergrad=skillsForExperience('cust');
  for(const id of ['python','matlab','lab','swift']) assert.ok(undergrad.some(skill => skill.tool.id === id));
  assert.equal(stage('matlab','cust').level,1);
  assert.equal(stage('swift','cust').place,'ling');
  assert.equal(stage('swift','cust').independent,true);
  assert.equal(stage('slurm','wustl').level,1);
  for(const id of ['mems','fluent']) {
    assert.equal(stage(id,'wustl').status,'Acquired');
    assert.equal(stage(id,'wustl').level,1);
    assert.match(stage(id,'wustl').detail,/course project/);
    assert.ok(skillsForExperience('wustl').some(skill=>skill.tool.id===id));
  }
  assert.equal(stage('swift','wustl').place,'amiibot');
  assert.equal(stage('swift','wustl').independent,true);
  assert.deepEqual(skillsForExperience('unknown'),[]);
});

test('Swift and Metal milestones refer to the actual projects', () => {
  assert.deepEqual(skillJourney(itemById.swift).map(({place,level}) => [place,level]),[
    ['ling',1],['amiibot',2],['totk',3],['naiive',4],
  ]);
  assert.deepEqual(skillJourney(itemById.metal).map(({place,level}) => [place,level]),[['naiive',1],['dpmetal',1]]);
  assert.equal(stage('swift','isu').place,'naiive');
  assert.equal(stage('metal','isu').place,'naiive');
  assert.equal(stage('metal','dpmetal').status,'Applied');
  assert.ok(skillJourney(itemById.metal).every(entry=>entry.status!=='Level up'));
  assert.equal(stage('slurm','isu').place,'isu');
});

test('every skill has a consistent, navigable route and applications do not award levels', () => {
  for(const tool of ITEMS) {
    const journey=skillJourney(tool);
    assert.ok(journey.length > 0,tool.id);
    assert.equal(journey[0].place,tool.found);
    assert.equal(journey[0].status,'Acquired');
    let earned=0;
    for(const entry of journey) {
      assert.ok(byId[entry.place]);
      assert.ok([tool.found,...tool.used].includes(entry.place));
      assert.ok(entry.detail.length);
      if(entry.status === 'Applied') assert.equal(entry.level,earned);
      else { assert.equal(entry.level,earned+1); earned=entry.level; }
      for(const context of entry.contexts ?? []) {
        assert.ok(byId[context]?.roleLabel);
        assert.equal(entry.independent,true);
      }
    }
  }
});

test('keyboard navigation stays in the same column in the incomplete final row', () => {

  assert.equal(nextSkillIndex(0,'ArrowUp',14),12);
  assert.equal(nextSkillIndex(1,'ArrowUp',14),13);
  assert.equal(nextSkillIndex(12,'ArrowDown',14),0);
  assert.equal(nextSkillIndex(10,'ArrowDown',14),2);
  assert.equal(nextSkillIndex(13,'ArrowRight',14),0);
  for(let index=0;index<14;index++) for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End']) {
    const next=nextSkillIndex(index,key,14);
    assert.ok(next >= 0 && next < 14);
  }
  assert.equal(nextSkillIndex(0,'Enter',14),null);
});

test('GNN is acquired at ISU and applied at Seagate without an extra level',()=>{
  assert.equal(itemById.gnn.found,'isu');
  assert.deepEqual(skillJourney(itemById.gnn).map(({place,level,status})=>({place,level,status})),[
    {place:'isu',level:1,status:'Acquired'},
    {place:'seagate',level:1,status:'Applied'},
  ]);
});
