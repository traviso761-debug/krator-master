// node settlements/nulab/test-nl-town.js — Nulab's town (src/41-nl-town.js) on core/city, its near ring (src/42-nl-ring.js) on
// core/hamlet's opt-in Dalab row, and the sim's records (data/nulab-sim.js), with the Dalab set's boxes (its dDef lines in
// settlements/dalab/src, read here as a table) and the town's pending boxes: no two buildings overlap, none stands on a street
// or in the water but the harbour's own, the town holds the owner's 20,000, the quarters' great pieces stand, the ring's villages
// lay out on dry ground with their fields, the Dalab row's negatives, the food balance of PLAN.md section 5, the layout reruns
// the same. Each check with a negative (tools/ktest.js).
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host|squares|radial|covered/.test(f)).sort().forEach(f=>load('core/city/'+f));
['10-hamlet-wood.js','12-hamlet-gather.js','14-hamlet-farmland.js','16-hamlet-names.js','18-hamlet-names.js','20-hamlet-cultures.js','dalab/23-hamlet-dalab.js','30-hamlet-village.js'].forEach(f=>load('core/hamlet/'+f));
/* the page's KCITY.lib (settlements/nulab/build.py's bundle names the same things from inside its closure) */
KCITY.lib={SL,plan:()=>PLAN,tune:()=>TUNE,KSPACE,Raster,OCC,obb,obbCorners,segDist,polySegDist,resample,clamp,inPoly,cg:()=>CG};
['settlements/nulab/src/39n-nl-model.js','settlements/nulab/src/40-nl-ground.js','settlements/nulab/src/41-nl-town.js','settlements/nulab/src/42-nl-ring.js'].forEach(load);
/* the Dalab set's boxes, from its defs (dDef({key:'dalab_x', ..., w:, d:, h:, build})), and the pending boxes */
const DIMS={};
for(const f of fs.readdirSync(path.join(ROOT,'settlements','dalab','src')).filter(f=>/^7.*dalab.*\.js$/.test(f))){const s=fs.readFileSync(path.join(ROOT,'settlements','dalab','src',f),'utf8');
 for(const m of s.matchAll(/dDef\(\{key:'(dalab_[a-z0-9_]+)'/g)){const seg=s.slice(m.index,m.index+700),g=k=>{const q=seg.match(new RegExp('[,{]'+k+':([0-9.]+)'));return q?+q[1]:null;};
  if(!DIMS[m[1]]&&g('w'))DIMS[m[1]]={w:g('w'),d:g('d'),h:g('h')||8};}}
for(const k in NL_TOWN.PENDING)DIMS[k]=NL_TOWN.PENDING[k];
const dims=(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h,fw:DIMS[k].w,fd:DIMS[k].d}:null;
const t0=Date.now(),K=NL_TOWN.make({dims}),ms=Date.now()-t0;
const t1=Date.now(),TF=NL_RING.townFarms({town:K}),RG=NL_RING.make({dims}),ms2=Date.now()-t1;
module.exports={K,TF,RG,DIMS,dims};
if(require.main!==module)return;
console.log('the town in '+ms+' ms: '+K.census.buildings+' buildings, '+K.census.people+' people, '+K.census.cropPlots+' infill crop plots, '+K.census.pending+' pending boxes; '+K.ways.length+' ways');
console.log('  by quarter: '+JSON.stringify(K.census.byQuarter));
console.log('  notes: '+JSON.stringify(K.notes.town.slice(-6)));
console.log('  town farms: '+TF.map(f=>f.id.replace('nl.townfarm.','')+' '+(f.farm.error||(f.farm.parcels.length+' parcels, '+f.farm.inCropHa+' ha in crop, '+f.records.length+' farmsteads'))).join('; '));
console.log('the ring in '+ms2+' ms: '+RG.map(v=>v.id.replace('nl.ring.','')+' '+(v.error?'ERROR '+v.error:(v.census&&v.census.pop)+' people, '+v.records.length+' records'+(v.farm?', '+(v.farm.error||(v.farm.parcels.length+' parcels, '+v.farm.inCropHa+' ha in crop')):''))).join('; '));
const box=L=>{const c=Math.cos(L.ry),s=Math.sin(L.ry);return {c:[L.x,L.z],u:[c,-s],v:[s,c],hw:(L.fw||L.w)/2,hd:(L.fd||L.d)/2};};
const pen=(A,B)=>{let m=1e9;for(const ax of [A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const overlaps=X=>{const all=X.lots.concat(X.extra).concat(X.cropPlots||[]),B=all.map(box),out=[];
 for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])>110)continue;if(pen(B[i],B[j])>.3)out.push(all[i].id+'|'+all[j].id);}return out;};
const onStreet=X=>{const out=[];for(const L of X.lots.concat(X.cropPlots||[])){if(L.cls==='landmark')continue;const B=box(L);
 for(const w of X.ways){const m=w.w/2-.6;if(w.pts.some(p=>{const dx=p[0]-B.c[0],dz=p[1]-B.c[1];return Math.abs(dx*B.u[0]+dz*B.u[1])<B.hw+m&&Math.abs(dx*B.v[0]+dz*B.v[1])<B.hd+m;})){out.push(L.id+'@'+w.id);break;}}}return out;};
const WATERY=new Set(['harbour']);
const inWater=X=>X.lots.concat(X.extra).filter(L=>!WATERY.has(L.kind)&&(NL_GROUND.h(L.x,L.z)<NL_GROUND.LAKE+.6)).map(L=>L.id);
{const o=overlaps(K);T.ok('no two buildings overlap (the lots, the landmarks, the harbour, the works, the Line quarter)',!o.length,o.length+' pairs'+(o.length?': '+o.slice(0,4).join(', '):''));
 const bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'copy'})])});T.neg('a building set on another is caught',X=>!overlaps(X).length,bad,K);}
{const s=onStreet(K);T.ok('no building stands on a street',!s.length,s.length+' on a street'+(s.length?': '+s.slice(0,3).join(', '):''));
 const w=K.ways.find(w=>w.cls==='avenue'),p=w.pts[Math.floor(w.pts.length/2)],bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots.find(l=>l.cls!=='landmark'),{id:'on-street',x:p[0],z:p[1]})])});
 T.neg('a house set on the harbour road is caught',X=>!onStreet(X).length,bad,K);}
{const l=inWater(K);T.ok('nothing but the harbour\'s pieces stands in the lake or the river',!l.length,l.length+' wet'+(l.length?': '+l.slice(0,4).join(', '):''));
 const bad=Object.assign({},K,{lots:K.lots.concat([Object.assign({},K.lots[0],{id:'afloat',x:3000,z:-2500})])});T.neg('a house in the bay is caught',X=>!inWater(X).length,bad,K);}
const popOk=X=>Math.abs(X.census.people-20000)<=3000;
T.ok('the town holds about 20,000 (the owner, 2026-11-16; within 15 %)',popOk(K),K.census.people+' people in '+K.census.buildings+' buildings');
T.neg('a town of 10,000 is caught',popOk,{census:{people:10000}},K);
const MARKS=['nl.mound','nl.priests','nl.temple','nl.healers','nl.vats','nl.court','nl.scribes','nl.barracks.a','nl.barracks.b','nl.tithebarn','nl.market','nl.inn','nl.works.foundry','nl.extra.ferry','nl.extra.line.station'];
const marks=X=>MARKS.filter(id=>!X.lots.some(l=>l.id===id)&&!X.extra.some(l=>l.id===id));
{const m=marks(K);T.ok('the quarters\' great pieces stand: the mound, the priests, the gene-houses, the court, the garrison, the tithe barn, the market, the works, the ferry, the station\'s site',!m.length,m.length?'MISSING '+m.join(', '):MARKS.length+' pieces');
 T.neg('a town without its mound is caught',X=>!marks(X).length,Object.assign({},K,{lots:K.lots.filter(l=>l.id!=='nl.mound')}),K);}
{const q=Object.keys(K.census.byQuarter);T.ok('both core/city instances laid houses (the town and the copper works)',(K.census.byQuarter.Nulab||0)>12000&&(K.census.byQuarter['the copper works']||0)>1000,JSON.stringify(K.census.byQuarter));}
/* the coastal layout: palisaded mound set back, outer earthen mound, infill crop plots and surrounding town fields */
{const layoutOk=X=>!!(X.rings&&X.rings.precinct&&X.rings.precinct.palisade&&X.rings.outer&&X.rings.outer.runs.length>=4&&X.rings.outer.gates.length>=4&&(X.cropPlots||[]).length>=40);
 T.ok('the set-back palisaded mound, the outer earthen mound with its gates, and the infill crop plots stand',layoutOk(K),
  'precinct palisade '+!!(K.rings.precinct&&K.rings.precinct.palisade)+', outer runs '+K.rings.outer.runs.length+' ('+K.rings.outer.gates.length+' gates), '+K.cropPlots.length+' infill crop plots');
 T.neg('missing infill crop plots or outer earthen mound is caught',layoutOk,Object.assign({},K,{cropPlots:[]}),K);
 const tfOk=F=>F.length===3&&F.every(f=>f.farm&&!f.farm.error&&f.farm.parcels.length>=80);
 T.ok('the town\'s surrounding fields lay out round the outer earthen mound (south, west and north)',tfOk(TF),TF.map(f=>f.id.replace('nl.townfarm.','')+' '+(f.farm.error||f.farm.parcels.length)).join(', '));
 T.neg('a missing town field belt is caught',tfOk,TF.slice(0,2),TF);}
/* the ring */
const ringOk=R=>R.every(v=>!v.error&&v.records.length>=10&&v.records.every(r=>NL_GROUND.h(r.x,r.z)>=NL_GROUND.LAKE+.5||r.landing||/jetty|boatshed|fishracks/.test(r.key)));
T.ok('the near ring\'s eight villages lay out on dry ground (a fishing village\'s landing at the water)',RG.length===8&&ringOk(RG),RG.map(v=>v.id.replace('nl.ring.','')+' '+(v.error||v.records.length)).join(', '));
T.neg('a village laid in the bay is caught',ringOk,[Object.assign({},RG[0],{records:RG[0].records.concat([Object.assign({},RG[0].records[0],{x:3000,z:-2500})])})],RG);
const farmsOk=R=>R.filter(v=>v.focus==='farming').every(v=>v.farm&&!v.farm.error&&v.farm.parcels.length>20&&v.farm.inCropHa>=v.farm.target*.6);
T.ok('the farming villages have their fields (KHAMLET.farmland, fallow 0 on the flats, 1 on the dry plain)',farmsOk(RG),RG.filter(v=>v.farm).map(v=>v.id.replace('nl.ring.','')+' '+(v.farm.error||(v.farm.inCropHa+'/'+v.farm.target+' ha, fallow '+v.fallow))).join('; '));
T.neg('a farming village with no fields is caught',farmsOk,[Object.assign({},RG[0],{farm:{parcels:[],inCropHa:0,target:100}})],RG);
/* the Dalab row (core/hamlet/dalab) */
{const foci=Object.keys(KHAMLET.CULTURES.dalab.works),vs=foci.map(f=>KHAMLET.village({id:'nl.test.'+f,world:1,culture:'dalab',focus:f,site:{x:0,z:0},link:{x:200,z:0},popMax:200,dims}));
 T.ok('the Dalab row lays every focus without error ('+foci.join(', ')+'), a gene farm with its beds',vs.every(v=>!v.error&&v.records.length>=8)&&vs[foci.indexOf('gene')].records.some(r=>r.key==='nl_genebeds'),
  vs.map((v,i)=>foci[i]+' '+(v.error||v.records.length)).join(', '));
 const geneRows=C=>Object.keys(C).filter(k=>k!=='dalab'&&(C[k].works||{}).gene);
 T.ok('no other culture row has gene works (the focus is Dalab\'s)',!geneRows(KHAMLET.CULTURES).length,geneRows(KHAMLET.CULTURES).join(', ')||'none');
 T.neg('a Xanadu row given gene works is caught',C=>!geneRows(C).length,Object.assign({},KHAMLET.CULTURES,{xanadu:{works:{gene:[{key:'nl_genebeds'}]}}}),KHAMLET.CULTURES);
 const U=KHAMLET.village({id:'nl.test.u',world:1,culture:'dalab',focus:'pearling',site:{x:0,z:0},popMax:200,dims});
 T.ok('an unknown focus is refused',!!U.error,U.error||'NOT refused');}
/* determinism */
{const K2=NL_TOWN.make({dims}),h=X=>X.lots.map(l=>l.id+l.key+l.x.toFixed(2)+l.z.toFixed(2)).join('|');T.ok('the town reruns the same',h(K)===h(K2),K.lots.length+' lots');}
/* the sim's records (data/nulab-sim.js) */
if(fs.existsSync(path.join(__dirname,'data','nulab-sim.js'))){const S=require('./data/nulab-sim.js');
 const sumOk=X=>Math.abs(X.districts.reduce((a,d)=>a+d.people,0)-50000)<=500&&Math.abs(X.villages.reduce((a,v)=>a+v.n*v.people,0)+X.farmsteads-50000)<=2500;
 T.ok('the basin\'s districts and villages hold its 50,000 (PLAN.md section 4)',sumOk(S),S.districts.map(d=>d.id+' '+d.people).join(', '));
 T.neg('a basin of 60,000 is caught',sumOk,Object.assign({},S,{districts:S.districts.concat([{people:10000}])}),S);
 const fb=S.foodBalance();const fbOk=F=>Math.abs(F.surplus-3900)<=800&&F.net>F.home+F.exports;   /* PLAN.md section 0: 20,000 in the town, its farmers' wards' 1,900 hands with the basin's 12,000 */
 T.ok('the food balance (PLAN.md section 5.1): the basin feeds the town of 20,000, Ledge, Blakhed, the Union and the skarn, ~3,900 t over',fbOk(fb),JSON.stringify(fb));
 T.neg('a harvest a third short is caught',fbOk,S.foodBalance({yield:1.07}),fb);}
T.done();
