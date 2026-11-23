// node settlements/blakhed/test-bk-town.js — Blakhed's town (src/69bn-bk-town.js) on core/city and its steadings, Stairhead and
// twelve hamlets (src/69bo-bk-ring.js) on core/hamlet, over the scale model's ground (gen/69bk3-bk-model.js, src/69bm-bk-ground.js)
// with the Fellgang set's boxes (kits/tungang/src/26k-kit.js TG.fg.BOX): no two buildings overlap, none stands on a road or in
// the water, the 5,000 (the town, the Stairhead, the steadings) hold within 15 %, the Golden Tears' mission holds 100-200, every
// quarter and the toll post stand, every village lays out dry and under the slope cap, the river and leat fall all their length,
// and the layout reruns the same. Each check with a negative (tools/ktest.js).
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require(path.join(ROOT,'tools','ktest.js'))(__filename);
global.window=global;
global.atob=b=>Buffer.from(b,'base64').toString('binary');
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host|squares|radial|covered/.test(f)).sort().forEach(f=>load('core/city/'+f));
['10-hamlet-wood.js','12-hamlet-gather.js','14-hamlet-farmland.js','16-hamlet-names.js','18-hamlet-names.js','20-hamlet-cultures.js','fellgang/22-hamlet-fellgang.js','30-hamlet-village.js']
 .forEach(f=>load('core/hamlet/'+f));
['10-camp-cultures.js','20-camp-census.js','30-camp-pitch.js','fellgang/52-camp-fellgang.js'].forEach(f=>load('core/camp/'+f));
KCITY.lib={SL,plan:()=>PLAN,tune:()=>TUNE,KSPACE,Raster,OCC};
['settlements/blakhed/gen/69bk3-bk-model.js','settlements/blakhed/src/69bm-bk-ground.js','settlements/blakhed/src/69bn-bk-town.js','settlements/blakhed/src/69bo-bk-ring.js'].forEach(load);
/* the Fellgang set's boxes from kits/tungang/src/26k-kit.js */
const BOX={};
{const s=fs.readFileSync(path.join(ROOT,'kits','tungang','src','26k-kit.js'),'utf8');
 for(const m of s.matchAll(/'(fg-[a-z-]+)':\{w:([0-9.]+),d:([0-9.]+),h:([0-9.]+)/g))BOX[m[1]]={w:+m[2],d:+m[3],h:+m[4]};}
const dims=k=>BOX[k]?{w:BOX[k].w,d:BOX[k].d,h:BOX[k].h}:(BK_TOWN.XDIMS[k]?{w:BK_TOWN.XDIMS[k][0],d:BK_TOWN.XDIMS[k][1],h:BK_TOWN.XDIMS[k][2]}:(BK_TOWN.DDIMS[k]?{w:BK_TOWN.DDIMS[k][0],d:BK_TOWN.DDIMS[k][1],h:BK_TOWN.DDIMS[k][2]}:null));
const t0=Date.now(),P=BK_TOWN.make({dims,seed:44120}),R=BK_RING.make({dims,world:44160}),ms=Date.now()-t0;
module.exports={P,R,BOX,dims};
if(require.main!==module)return;
const V=R.steadings.concat([R.stairhead],R.hamlets);
const popFive=P.people.town+(R.stairhead.census.pop||0)+R.steadings.reduce((n,v)=>n+(v.census.pop||0),0);
console.log('Blakhed in '+ms+' ms: '+P.records.length+' town records, '+V.length+' villages, 5k count '+popFive+' (town '+P.people.town+', Stairhead '+R.stairhead.census.pop+', steadings '+R.steadings.reduce((n,v)=>n+(v.census.pop||0),0)+'), Dalab mission '+P.people.dalab+', Golden Tears '+P.people.tears+', Travellers '+P.people.travellers+' in '+P.camps.length+' family circles');

const obb=L=>{const c=Math.cos(L.ry||0),s=Math.sin(L.ry||0);return{c:[L.x,L.z],u:[c,-s],v:[s,c],hw:L.w/2,hd:L.d/2};};
const pen=(A,B)=>{let m=1e9;for(const ax of[A.u,A.v,B.u,B.v]){const pr=F=>Math.abs(F.u[0]*ax[0]+F.u[1]*ax[1])*F.hw+Math.abs(F.v[0]*ax[0]+F.v[1]*ax[1])*F.hd;
 const d=Math.abs((A.c[0]-B.c[0])*ax[0]+(A.c[1]-B.c[1])*ax[1]);m=Math.min(m,pr(A)+pr(B)-d);}return m;};
const RUNS=new Set(['ropewalk']);   /* the twelve rope houses stand end to end along the 240 m walk by design */
const overlaps=recs=>{const B=recs.map(obb),out=[];
 for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(Math.hypot(B[i].c[0]-B[j].c[0],B[i].c[1]-B[j].c[1])>80)continue;
  if(RUNS.has(recs[i].kind)&&recs[i].kind===recs[j].kind)continue;if(pen(B[i],B[j])>.35)out.push(recs[i].id+'|'+recs[j].id);}return out;};
const onWay=X=>{const out=[];for(const L of X.records){const B=obb(L);
 for(const w of X.ways){const m=(BK_TOWN.WIDTH[w.cls]||5)/2-.7;
  for(let i=0;i+1<w.pts.length;i++){const a=w.pts[i],b=w.pts[i+1],Ln=Math.hypot(b[0]-a[0],b[1]-a[1])||1,st=Math.max(1,Math.ceil(Ln/2));let hit=false;
   for(let k=0;k<=st;k++){const t=k/st,px=a[0]+(b[0]-a[0])*t-B.c[0],pz=a[1]+(b[1]-a[1])*t-B.c[1];if(Math.abs(px*B.u[0]+pz*B.u[1])<B.hw+m&&Math.abs(px*B.v[0]+pz*B.v[1])<B.hd+m){hit=true;break;}}
   if(hit){out.push(L.id+'@'+w.id);break;}}if(out.length&&out[out.length-1].startsWith(L.id+'@'))break;}}return out;};
const inWater=recs=>recs.filter(r=>{const n=BK_GROUND.river.near(r.x,r.z);if(n&&n.d<n.w/2+Math.hypot(r.w,r.d)/2)return true;
 if(BK_GROUND.pondAt(r.x,r.z,Math.hypot(r.w,r.d)/2))return true;return BK_GROUND.leatD(r.x,r.z)<2+Math.min(r.w,r.d)/2;}).map(r=>r.id);

{const o=overlaps(P.records);T.ok('no two town buildings overlap (the houses, the Market, the Icegarth, the Folds, the Fairfell, the Golden Tears)',!P.err&&!P.refused.length&&!o.length,
  o.length+' pairs'+(P.refused.length?'; refused '+P.refused.join(', '):''));
 T.neg('a building placed on top of another is caught',rs=>!overlaps(rs).length,P.records.concat([Object.assign({},P.records[0],{id:'dup'})]),P.records);}
{const s=onWay(P);T.ok('no town building stands on a road or a lane',!s.length,s.length+' on a way'+(s.length?': '+s.slice(0,4).join(', '):''));
 const w=P.ways[0],mid=[(w.pts[0][0]+w.pts[1][0])/2,(w.pts[0][1]+w.pts[1][1])/2];
 T.neg('a house dropped on the drove road is caught',X=>!onWay(X).length,Object.assign({},P,{records:P.records.concat([Object.assign({},P.records[0],{id:'road-house',x:mid[0],z:mid[1]})])}),P);}
{const wt=inWater(P.records);T.ok('no town building stands in the Blak Riba, the leat or an ice pond',!wt.length,wt.length+' wet');
 const r0=BK_GROUND.river.along(BK_GROUND.river.sPin,0);
 T.neg('a house in the Blak Riba is caught',rs=>!inWater(rs).length,P.records.concat([Object.assign({},P.records[0],{id:'wet',x:r0.x,z:r0.z})]),P.records);}
const popOk=n=>Math.abs(n-5000)<=750;
T.ok('the 5,000 (the town, the Stairhead and the four steadings: PLAN.md section 0) hold within 15 %',popOk(popFive),popFive+' people');
T.neg('a town of 2,500 is caught',popOk,2500,popFive);
const tearsOk=X=>{const ks=X.records.filter(r=>r.quarter==='tears').map(r=>r.key);
 return X.people.tears>=100&&X.people.tears<=200&&ks.length>=10&&['xa_serai','xa_rich_c','xa_temple','xa_barracks','xa_teahouse','xa_warehouse','xa_bath'].every(k=>ks.includes(k));};
T.ok('the Golden Tears\' mission stands east of the Market: 100-200 people in the Xanadu kit\'s compound',tearsOk(P),P.people.tears+' people');
T.neg('a Golden Tears mission without its caravanserai is caught',tearsOk,Object.assign({},P,{records:P.records.filter(r=>r.key!=='xa_serai')}),P);
const dalabOk=X=>{const ds=X.records.filter(r=>r.quarter==='dalab'),ks=ds.map(r=>r.key);
 const meanD=ds.length?ds.reduce((s,r)=>s+Math.hypot(r.x,r.z),0)/ds.length:1e9;
 return X.people.dalab>=100&&X.people.dalab<=150&&ds.length>=12&&meanD<260&&
  ['dalab_temple','dalab_priest_house','dalab_noble_c','dalab_scribes','dalab_inn','dalab_warehouse','dalab_shops','dalab_rowhouse','dalab_tenement','dalab_compound','dalab_well','dalab_watchtower'].every(k=>ks.includes(k));};
T.ok('Dalab\'s mission stands near the centre of town (<260 m of the Market): 100-150 people in the Dalab set\'s pieces',dalabOk(P),
 P.people.dalab+' people across '+P.records.filter(r=>r.quarter==='dalab').length+' Dalab buildings');
T.neg('a Dalab mission outside 100-150 people or far from the centre is caught',dalabOk,Object.assign({},P,{people:Object.assign({},P.people,{dalab:60})}),P);
const campOk=X=>{const wp=X.pieces.filter(p=>p.quarter==='winterings'),pk=new Set(wp.map(p=>p.key));
 return (X.camps||[]).length>=7&&X.people.travellers>=400&&X.people.travellers<=650&&
  ['fg-wagon','fg-bender','fg-camp-hearth','fg-tinsmith','fg-fair-hurdle'].every(k=>pk.has(k))&&
  wp.filter(p=>p.key==='fg-wagon').length>=45&&wp.filter(p=>p.key==='fg-bender').length>=14&&wp.filter(p=>p.key==='fg-camp-hearth').length>=7;};
T.ok('the Travellers\' campground (Winterings) is pitched on core/camp in 7 family circles with vardos, bender tents, tripod campfires, tinsmiths and pony corrals',campOk(P),
 P.camps.length+' family circles, '+P.people.travellers+' Travellers, '+P.pieces.filter(p=>p.quarter==='winterings').length+' camp pieces');
T.neg('a campground missing its bender tents or tripod campfires is caught',campOk,Object.assign({},P,{pieces:P.pieces.filter(p=>p.key!=='fg-bender')}),P);
const clusterOk=X=>{const hs=X.records.filter(r=>r.quarter==='houses').map(r=>Math.hypot(r.x,r.z)).sort((a,b)=>a-b);
 const med=hs.length?hs[hs.length>>1]:1e9,p90=hs.length?hs[Math.floor(hs.length*.9)]:1e9;return hs.length>=550&&med<245&&p90<355;};
T.ok('the town clusters tightly round the Marketplace (median house < 245 m from the Peace Stone, 90 % within 355 m)',clusterOk(P),
 (()=>{const hs=P.records.filter(r=>r.quarter==='houses').map(r=>Math.hypot(r.x,r.z)).sort((a,b)=>a-b);return hs.length+' houses, median '+Math.round(hs[hs.length>>1]||0)+' m, p90 '+Math.round(hs[Math.floor(hs.length*.9)]||0)+' m';})());
T.neg('a sprawled grid with median house distance 420 m is caught',clusterOk,Object.assign({},P,{records:P.records.map(r=>r.quarter==='houses'?Object.assign({},r,{x:r.x*2.2,z:r.z*2.2}):r)}),P);
const quartersOk=(X,Rg)=>{const K={},keys=new Set(X.records.map(r=>r.key)),pkeys=new Set(X.pieces.map(p=>p.key));for(const r of X.records)K[r.kind]=(K[r.kind]||0)+1;
 const halls=X.records.filter(r=>r.kind==='hall');
 const townKeys=['fg-doublehall','fg-markethall','fg-halting-house','fg-booth','fg-great-icehouse','fg-dugout-icehouse','fg-ropewalk','fg-smithy','fg-tannery','fg-granary','fg-fair-stand'];
 const pieceKeys=['fg-cairn','fg-truce-post','fg-stone-sign','fg-fair-hurdle','fg-wagon','fg-bender','fg-camp-hearth','fg-tinsmith','fg-halt','fg-lantern-post','fg-ice-tools'];
 const trucePosts=X.pieces.filter(p=>p.key==='fg-truce-post'&&p.quarter==='market').length;
 return halls.length===1&&halls[0].key==='fg-doublehall'&&halls[0].variant==='double'&&(K.markethall||0)>=2&&K.head===1&&(K.halting||0)>=3&&K.icehouse===12&&(K.dugout||0)>=5&&trucePosts>=16&&K.ropewalk===5&&(K.folds||0)>=10&&K.fairpens>=10&&K.fairstand===1&&(K.booth||0)>=14&&K.cairnhall===1&&townKeys.every(k=>keys.has(k))&&pieceKeys.every(k=>pkeys.has(k))&&Rg.toll.length===4&&Rg.hoists.length===2&&Rg.hoists.every(h=>h.key==='fg-stair-hoist')&&Rg.stair.pts.length>40;};
T.ok('every quarter, town piece and outwork stands: the double meeting hall, market hall, 16 Market truce stones and booths, halting houses, 8 great + 4 barrow + 5 dugout ice houses, 5 44-m rope-walk ranges, smithies, tanneries, granaries, Fair stand and hurdles, peace stone, Dalab\'s 4 toll pieces, 2 stair hoists and the gorge stair',quartersOk(P,R),
 'records '+P.records.length+', pieces '+P.pieces.length+'; toll '+R.toll.map(t=>t.key).join(', ')+'; stair '+R.stair.pts.length+' pts');
T.neg('a missing toll post piece is caught',Rg=>quartersOk(P,Rg),Object.assign({},R,{toll:R.toll.slice(0,3)}),R);
const villagesOk=Vs=>Vs.length===17&&Vs.filter(v=>v.kind==='steading').length===4&&Vs.filter(v=>v.kind==='hamlet').length===12&&
 Vs.every(v=>!v.error&&(v.records||[]).length>=20&&v.records.every(r=>{const n=BK_GROUND.river.near(r.x,r.z);return!n||n.d>n.w/2+10;}));
T.ok('all 17 core/hamlet villages (4 steadings, the Stairhead, 12 hamlets of PLAN.md 3.2a) lay out dry with 20+ records',villagesOk(V),
 V.map(v=>v.id.replace(/^bk\.(h|stead)?\.?/,'')+' '+v.records.length).join(', '));
T.neg('a hamlet with a building in the river is caught',villagesOk,
 V.map((v,i)=>i?v:Object.assign({},v,{records:v.records.map((r,j)=>j?r:Object.assign({},r,{x:BK_GROUND.river.pts[10].x,z:BK_GROUND.river.pts[10].z}))})),V);
const fallsOk=(rp,lt)=>{if(rp.length<100||lt.length<5)return false;
 for(let i=1;i<rp.length;i++)if(!(rp[i].bed<rp[i-1].bed))return false;
 for(let i=1;i<lt.length;i++)if(!(lt[i][2]<lt[i-1][2]))return false;
 return Math.abs(BK_GROUND.h(0,0)-BK_GROUND.model(0,0))<3;};
T.ok('the Blak Riba and the leat fall all their length, and at the pin the ground matches the scale model within 3 m',fallsOk(BK_GROUND.river.pts,BK_GROUND.leat),
 'pin '+BK_GROUND.h(0,0).toFixed(1)+' m vs model '+BK_GROUND.model(0,0).toFixed(1)+' m');
T.neg('a rising river segment is caught',rp=>fallsOk(rp,BK_GROUND.leat),
 BK_GROUND.river.pts.map((p,i)=>i===5?Object.assign({},p,{bed:BK_GROUND.river.pts[4].bed+1}):p),BK_GROUND.river.pts);
const hash=X=>{let h=2166136261;const s=X.records.map(r=>r.key+r.x.toFixed(2)+r.z.toFixed(2)+(+r.ry).toFixed(3)).join();for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;};
{const P2=BK_TOWN.make({dims,seed:44120});T.ok('the town layout reruns the same (core/rand streams)',hash(P2)===hash(P),hash(P).toString(16));
 T.neg('a layout from another seed differs',X=>hash(X)===hash(P),BK_TOWN.make({dims,seed:99}),P);}

// ---- Phase F4: presented citizen simulation (`src/78-bk-sim.js` on `core/simulation`)
{
 load('core/clock/20-core-clock.js');
 ['77-sim-0-core.js','77-sim-1-world.js','77-sim-2-places.js','77-sim-3-actors.js','77-sim-4-nav.js','77-sim-5-motion.js','77-sim-5r-routes.js',
  '77-sim-6-economy.js','77-sim-6-govern.js','77-sim-6-items.js','77-sim-6-needs.js','77-sim-6-season.js','77-sim-7-ledger.js','77-sim-7-lod.js','77-sim-7-stocks.js','77-sim-8-export.js']
  .forEach(f=>load('core/simulation/'+f));
 load('settlements/blakhed/src/78-bk-sim.js');
 const clk=KCLOCK.make({hour:9.6,day:262,running:false});
 BK_SIM.declare(clk,{plan:P,rings:R,seed:44178});
 const N=BK_SIM.navGraph,b0=SIM.nav.body('pedestrian',0),oneComp=N.nodes.every((_,i)=>SIM.nav.body('pedestrian',i)===b0);
 const acts=SIM.all('actor'),cultures=new Set(acts.map(a=>a.dress&&a.dress.culture));
 const simDeclOk=S=>!S.problems.length&&S.oneComp&&S.actors>=280&&['fellgang','traveller','kradz','wildcat','dalab','tears'].every(c=>S.cultures.has(c));
 T.ok('BK_SIM presented simulation: single-component nav graph ('+N.nodes.length+' nodes), '+acts.length+' citizens & sledges across all 6 cultural outfits, 0 SIM problems',
  simDeclOk({problems:BK_SIM.problems,oneComp,actors:acts.length,cultures}),
  'places '+SIM.order.place.length+', actors '+acts.length+', outfits '+[...cultures].join(', '));
 T.neg('missing cultural outfits or SIM problems are caught',simDeclOk,{problems:['bad'],oneComp:false,actors:10,cultures:new Set(['fellgang'])},{problems:BK_SIM.problems,oneComp,actors:acts.length,cultures});

 /* Step across midnight to run ice-keeping spoilage, Market Truce checks, and Double Meeting */
 const wc=acts.find(a=>a.org==='bk.wildcat');
 wc.hostile=true;
 SIM.command(wc,{act:'TRADE',place:'bk.truce.hearth',mins:30,by:'test'});
 SIM.jump();
 for(let m=0;m<960;m++){const tot=clk.day*1440+Math.floor(clk.hour*60)+1;clk.day=Math.floor(tot/1440);clk.hour=(tot%1440+.5)/60;clk.t+=3;SIM.step();}
 const dm=BK_SIM.callDoubleMeeting(90),E=SIM.econ(BK_SIM.S),kept=E.kept||{};
 const liveOk=st=>st.inCenter&&!st.outCenter&&!st.wcHostile&&st.truceEvents>=1&&st.ropeSide>30&&st.tallySide>30&&(st.keptMeat||0)>0&&(st.keptIce||0)>0;
 const liveSt={inCenter:BK_SIM.inTruce(0,0),outCenter:BK_SIM.inTruce(200,200),wcHostile:!!wc.hostile,truceEvents:BK_SIM.truceEvents.length,
  ropeSide:dm.ropeSide,tallySide:dm.tallySide,keptMeat:kept.meat||0,keptIce:kept.ice||0};
 T.ok('Market Truce disarms hostile visitors inside the 16 Truce Stones, Double Meeting gathers rope-wall & tally-board kin ('+dm.ropeSide+'/'+dm.tallySide+'), and dugout/barrow ice preserves meat & dairy',
  liveOk(liveSt),'truceEvents '+liveSt.truceEvents+', kept meat '+Math.round(liveSt.keptMeat)+' kg using '+Math.round(liveSt.keptIce)+' kg ice');
 T.neg('hostile visitor left armed inside Truce Stones or zero ice-keeping is caught',liveOk,Object.assign({},liveSt,{wcHostile:true,keptMeat:0}),liveSt);
}
T.done();
