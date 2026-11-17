// node settlements/strongbow/test-sb-sim.js — Strongbow's life as data (src/34-sb-sim.js, SB4a): the navigation layer the people
// walk. Built from the rooms (src/33-sb-rooms.js), the walk up (src/32-sb-walk.js, walked) and the town (src/40-sb-town.js with the
// scrap Xanadu set's interiors), it must join every room of every part the layout's open ways join to the town into one body
// with the town's streets, the plaza and the lip, and leave the parts the layout keeps shut off it (their locked doors and
// barred hatches cut); every town building's way in on that body; and the lifts are its 'lift' edges. The negatives: a lift
// taken out cuts what only it reaches; a door locked strands what lies behind it.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const T=require('./test-sb-rooms.js'),{L,P,S,R}=T,ground=(x,z)=>P.frame.ground(x,z);
const loadF=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/space/20-core-space.js'].concat(fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host/.test(f)).sort().map(f=>'core/city/'+f),
 ['kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/40-crop-query.js','settlements/strongbow/src/40-sb-town.js','settlements/strongbow/src/34-sb-sim.js']).forEach(loadF);
const DIMS={};for(const f of ['kits/xanadu/src/87u-xs-build.js','kits/xanadu/src/87v-xs-poor.js']){const s=fs.readFileSync(path.join(ROOT,f),'utf8');
 for(const m of s.matchAll(/XA\.def\(\{key:'(xa_scrap_[a-z_]+)'.*?,w:([\d.]+),d:([\d.]+),h:([\d.]+)/g))DIMS[m[1]]={w:+m[2],d:+m[3],h:+m[4]};}
const TOWN=SB_TOWN.make({layout:L,plan:P,dims:(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h}:null});
const IX=global.KratorInteriors=require(path.join(ROOT,'kits','interiors','dist','interiors-core.js'));(0,eval)(fs.readFileSync(path.join(ROOT,'kits','interiors','sets','xanadu-scrap.js'),'utf8'));
const WT=KWALK.create(),RT=SB_ROOMS.town(WT,TOWN,IX,ground);
const RUN=SB_WALK.run(KWALK.create(),S,{ground});
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const t0=Date.now(),N=SB_SIM.nav({R,S,P,L,path:RUN.path,events:RUN.events,town:TOWN,placed:RT.placed,ground});
if(require.main!==module){module.exports={L,P,S,R,TOWN,RT,RUN,N};return;}
console.log('nav: '+N.nodes.length+' nodes, '+N.edges.length+' edges ('+N.edges.filter(e=>e.kind==='lift').length+' lift, '+N.edges.filter(e=>e.kind==='stair').length+' stair, '+N.edges.filter(e=>e.kind==='street').length+' street), '+(Date.now()-t0)+' ms');
/* the bodies: the graph's connected parts, a locked door's node and a barred stair cut (o.drop: edge kinds or ids to leave out) */
function bodies(o){o=o||{};const idx=new Map();N.nodes.forEach((n,i)=>idx.set(n.id,i));const par=N.nodes.map((_,i)=>i),fnd=i=>{while(par[i]!==i)i=par[i]=par[par[i]];return i;};
 const lockedN=new Set(N.nodes.filter(n=>n.locked||(o.lockDoors||[]).some(d=>n.id==='D:'+d)).map(n=>n.id));
 for(const e of N.edges){if(e.locked||lockedN.has(e.a)||lockedN.has(e.b))continue;if(o.drop&&o.drop(e))continue;par[fnd(idx.get(e.a))]=fnd(idx.get(e.b));}
 return id=>fnd(idx.get(id));}
const main=B=>B(N.walk[0].id);
const B0=bodies(),M=main(B0);
/* the parts the open ways join (as test-sb-rooms.js reckons them) */
const open=new Set(['sb.plaza','sb.lobby']);{const lifts=new Set(S.lifts.map(l=>l.id).concat(S.lifts.flatMap(l=>l.ways)));let more=true;
 for(const p of L.parts)if(p.zone==='town')open.add(p.id);
 while(more){more=false;for(const w of L.ways){if(w.open===false)continue;if(w.kind==='lift'&&!lifts.has(w.id))continue;if(w.kind==='rope'||w.kind==='wall')continue;
  for(const [a,b] of [[w.a,w.b],[w.b,w.a]])if(open.has(a)&&!open.has(b)){open.add(b);more=true;}}}
 for(const p of L.parts)if(p.in&&open.has(p.in))open.add(p.id);if(open.has('sb.tower.order'))open.add('sb.crown');}
const by={};for(const rm of R.rooms){const nid=N.room[rm.id];if(!nid)continue;const k=rm.part;by[k]=by[k]||[0,0];by[k][1]++;if(B0(nid)===M)by[k][0]++;}
const short=Object.entries(by).filter(([k,[r,n]])=>open.has(k)&&r<n),leak=Object.entries(by).filter(([k,[r]])=>!open.has(k)&&r>0);
if(process.argv.includes('-v'))for(const k in by)console.log('  '+k.padEnd(26)+(by[k][0]+'/'+by[k][1]).padStart(10)+(open.has(k)?'':'   (shut)'));
ok(!short.length,'every room of the parts the open ways join is on the walk up\'s body ('+Object.entries(by).filter(([k])=>open.has(k)).reduce((s,[,v])=>s+v[1],0)+' rooms'+(short.length?'; short: '+short.map(([k,[r,n]])=>k+' '+r+'/'+n).join(', '):'')+')');
ok(!leak.length,'no room of a part the layout keeps shut is ('+Object.keys(by).filter(k=>!open.has(k)).length+' parts'+(leak.length?'; leaks: '+leak.map(([k,[r,n]])=>k+' '+r+'/'+n).join(', '):'')+')');
const fronts=Object.values(N.front),offF=fronts.filter(id=>B0(id)!==M);
ok(fronts.length>=RT.placed.length*.98&&!offF.length,'every town building\'s way in is on it ('+fronts.length+' of '+RT.placed.length+' buildings'+(offF.length?'; off: '+offF.slice(0,5).join(' '):'')+')');
const lifts=N.edges.filter(e=>e.kind==='lift');
ok(new Set(lifts.map(e=>e.lift)).size===S.lifts.length,'every lift is a ride on it ('+lifts.length+' rides: '+[...new Set(lifts.map(e=>e.lift))].join(' ')+')');
// ---- the negatives ------------------------------------------------------------------------------------------------------------
{const B=bodies({drop:e=>e.kind==='lift'&&e.lift==='W3'}),m=main(B),yard=N.walk[N.walk.length-1].id;
 ok(B(yard)!==m,'negative: W3 taken out, the lip is cut off from the town');}
{const d=R.doors.find(q=>/gatehouse/.test(q.id)&&/yard/.test(q.id)),d2=R.doors.find(q=>/ramp\.order/.test(q.id)),B=bodies({lockDoors:[d.id,d2.id]}),m=main(B);
 const gh=R.rooms.filter(r=>r.part==='sb.lip.gatehouse'&&N.room[r.id]),off=gh.filter(r=>B(N.room[r.id])!==m).length;
 ok(off===gh.length,'negative: the gatehouse\'s two doors locked, none of its '+gh.length+' rooms is on the body ('+off+' off)');}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
