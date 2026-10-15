import test from 'node:test';
import assert from 'node:assert/strict';
import {readSiteRoute,siteUrl,marginTarget,validSiteFocus} from './routes.js';
import {analyticsMode,createTracker,linkEvent,safeUrl,campaignParams} from './analytics-core.js';
const route=path=>readSiteRoute(new URL(path,'https://me.1sec.plus'));

test('public routes and earlier shared links resolve to the intended view and content',()=>{
  assert.deepEqual(route('/'),{view:'resume',focus:null,notFound:false});
  assert.deepEqual(route('/world/'),{view:'world',focus:null,notFound:false});
  assert.deepEqual(route('/?utm_source=linkedin'),{view:'resume',focus:null,notFound:false});
  assert.deepEqual(route('/?at=wustl'),{view:'resume',focus:'wustl',notFound:false});
  assert.deepEqual(route('/about/?at=wustl'),{view:'resume',focus:'wustl',notFound:false});
  assert.deepEqual(route('/?v=worlds&w=fun&art=pixel&at=isu'),{view:'world',focus:'isu',notFound:false});
  assert.equal(route('/?v=margins').view,'resume');assert.equal(route('/?v=worlds&w=plain').view,'resume');
  assert.equal(route('/academic/').focus,'library');assert.equal(route('/industry/').focus,'sunwoda');assert.equal(route('/developer/').view,'resume');
  assert.equal(route('/missing/').notFound,true);
  assert.equal(siteUrl('resume','wustl'),'/?at=wustl');
  assert.equal(siteUrl('world','item:python'),'/world/?at=item%3Apython');
  assert.equal(siteUrl('resume','private@example.com'),'/');assert.equal(validSiteFocus('biome:orchard'),'biome:apps');
});
test('mirror targets land on real résumé sections instead of the removed plain view',()=>{
  for(const [focus,target] of [['item:md','skills'],['library','papers'],['phd','isu'],['photo','isu'],['biome:ml','projects'],['biome:work','experience'],['cust','cust']])assert.equal(marginTarget(focus),target);
});
test('analytics never sends from a development build, preview host, or opted-out visit',()=>{
  for(const hostname of ['localhost','127.0.0.1','preview.example.com','me.1sec.plus.evil.test'])assert.equal(analyticsMode({production:true,hostname}),'off');
  assert.equal(analyticsMode({production:false,hostname:'me.1sec.plus'}),'off');
  assert.equal(analyticsMode({production:true,hostname:'me.1sec.plus'}),'live');
  assert.equal(analyticsMode({production:true,hostname:'me.1sec.plus',optedOut:true}),'off');
  assert.equal(analyticsMode({production:true,hostname:'127.0.0.1',debug:true}),'debug');
});
test('page views deduplicate StrictMode while preserving switches, referrers and parameter allowlists',()=>{
  const events=[];let enabled=true;const tracker=createTracker({send:(...event)=>events.push(event),isEnabled:()=>enabled});
  tracker.page('world','Island','https://me.1sec.plus/world/?at=isu','https://example.com/?email=private');
  tracker.page('world','Island','https://me.1sec.plus/world/?at=wustl');
  tracker.page('resume','Résumé','https://me.1sec.plus/about/');
  tracker.page('world','Island','https://me.1sec.plus/world/');
  assert.equal(events.length,3);assert.equal(events[0][1].page_referrer,'https://example.com/');assert.equal(events[2][1].page_referrer,'https://me.1sec.plus/about/');
  tracker.event('contact_click',{contact_method:'email',email:'private@example.com',message:'private'});
  assert.deepEqual(events.at(-1),['contact_click',{site_view:'world',contact_method:'email'}]);
  tracker.once('world_ready','scene',{load_ms:123});tracker.once('world_ready','scene',{load_ms:145});assert.equal(events.filter(e=>e[0]==='world_ready').length,1);
  enabled=false;tracker.event('notes_toggle',{visible:false});assert.equal(events.length,5);
});
test('contact, documents, papers and project destinations are classified without sensitive URL values',()=>{
  const classify=href=>linkEvent({href,origin:'https://me.1sec.plus'});
  assert.deepEqual(classify('mailto:private@example.com?body=private'),['contact_click',{contact_method:'email'}]);
  assert.deepEqual(classify('/ZHOU_Rui_Resume_2025.pdf'),['document_open',{document_id:'resume',file_extension:'pdf'}]);
  assert.deepEqual(classify('/ZHOU_Rui_Resume.pdf'),['document_open',{document_id:'resume',file_extension:'pdf'}]);
  assert.deepEqual(classify('/ZHOU_Rui_CV.pdf'),['document_open',{document_id:'cv',file_extension:'pdf'}]);
  assert.deepEqual(classify('/ZHOU_Rui_CV-2026-Aug.pdf'),['document_open',{document_id:'cv',file_extension:'pdf'}]);
  assert.equal(classify('/about/'),null);assert.equal(classify('javascript:alert(1)'),null);
  assert.deepEqual(linkEvent({href:'https://testflight.apple.com/join/example?email=private',origin:'https://me.1sec.plus',projectId:'naiive'}),['project_link',{project_id:'naiive',link_kind:'testflight',link_domain:'testflight.apple.com'}]);
  assert.equal(safeUrl(''),'');
  assert.equal(safeUrl('https://doi.org/10.100/example?secret=value#private'),'https://doi.org/10.100/example');
});

test('traffic attribution retains campaign labels without forwarding arbitrary query values',()=>{
  assert.deepEqual(campaignParams('?utm_source=linkedin&utm_medium=profile&utm_campaign=fall-2026&email=private'),{campaign_source:'linkedin',campaign_medium:'profile',campaign_name:'fall-2026'});
  assert.deepEqual(campaignParams('?utm_source=private%40example.com&token=secret'),{});
});

test('project images and LinkedIn demos stay attributed to the project',()=>{
  const origin='https://me.1sec.plus';
  assert.deepEqual(linkEvent({href:'/images/mytimetable/app@3x.png',origin,projectId:'ling'}),['project_link',{project_id:'ling',link_kind:'image',link_domain:'me.1sec.plus'}]);
  assert.deepEqual(linkEvent({href:'https://lnkd.in/p/gGVtrd8x',origin,projectId:'dpmetal'}),['project_link',{project_id:'dpmetal',link_kind:'linkedin_post',link_domain:'lnkd.in'}]);
  assert.deepEqual(linkEvent({href:'https://www.linkedin.com/posts/example',origin,projectId:'dpmetal'}),['project_link',{project_id:'dpmetal',link_kind:'linkedin_post',link_domain:'www.linkedin.com'}]);
  assert.deepEqual(linkEvent({href:'https://www.linkedin.com/in/zrzrv5/',origin}),['contact_click',{contact_method:'linkedin'}]);
});
