// node settlements/strongbow/test-sb-rooms.js — the arcology's interiors (src/33-sb-rooms.js) on core/walk: every room of every part
// the layout's open ways join to the walk up is reached by a walker with core/host's rules (a 0.7 m step, a body 0.25 m round),
// every door open but the locked ones; no room of a part the layout keeps shut is; no stair is steeper than a walker climbs; the
// walls are solid (a wall line has no gap but its doors). Then the negatives: a locked door opened lets the walker into the sealed
// drums; a stair taken away cuts off what is above it.
// The flood runs a window at a time (a storey, a deck: SB_ROOMS.audit), seeded at the town's ground-level doors and at the lifts'
// stops (the walk up proves those: test-sb-walk.js). -v lists every part's rooms reached.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/rand/08-core-rand.js','core/walk/20-core-walk.js','kits/ancients-interiors/src/10-ai-core.js','kits/ancients-interiors/src/35-ai-plates.js',
 'kits/ancients/targets/strongbow/8aw0-strongbow-plan.js','settlements/strongbow/src/20-sb-census.js','settlements/strongbow/src/30-sb-layout.js',
 'settlements/strongbow/src/31-sb-rules.js','settlements/strongbow/src/32-sb-walk.js','settlements/strongbow/src/33-sb-rooms.js'].forEach(load);
const verbose=process.argv.includes('-v');
const L=sbLayout(),P=STRONGBOW.plan({seed:1647}),S=SB_WALK.plan(L,P),ground=(x,z)=>P.frame.ground(x,z);
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
/* the world: the walk's records and the rooms', every door open but the locked ones (o.lock: ids to keep shut, o.open: to open,
   o.drop: stairs to leave out) */
function world(R,o){o=o||{};const W=KWALK.create(),RS=SB_WALK.register(W,S);for(const k in RS.doors)W.setBlock(RS.doors[k],false);
 const R2=o.drop?Object.assign({},R,{stairs:R.stairs.filter(s=>o.drop.indexOf(s.id)<0)}):R,RR=SB_ROOMS.register(W,R2);
 for(const d of R.doors){const shut=(d.locked&&(o.open||[]).indexOf(d.id)<0)||(o.lock||[]).indexOf(d.id)>=0;if(RR.doors[d.id])W.setBlock(RR.doors[d.id],shut);}return W;}
/* the seeds: the town's doors at ground level (the foot is open ground: the walk up crosses it), and every lift stop */
function starts(R){const st=[[0,.25,140]];for(const l of S.lifts)for(const s of l.stops){const g=s.gate.at;st.push([g[0]+s.side[0]*1.2,s.y,g[1]+s.side[1]*1.2]);}
 for(const d of R.doors)if(!d.locked&&d.y<3&&Math.abs(ground(d.at[0],d.at[1])-d.y)<.6)st.push([d.at[0],d.y,d.at[1]]);return st;}
/* a room is reached when any of its floors is: its polygon (or a piece of it, id~k, where a stairwell cuts it) or a sector (id.k) */
function run(R,o){const W=world(R,o),A=SB_ROOMS.audit(W,R,{starts:starts(R),ground});A.base=new Set();for(const n of A.reached){A.base.add(n);A.base.add(n.replace(/~\d+$/,'').replace(/\.\d+$/,''));}return A;}
const byPart=(R,A)=>{const out={};for(const rm of R.rooms){const k=rm.part;out[k]=out[k]||[0,0];out[k][1]++;
 if(A.base.has(rm.id))out[k][0]++;}return out;};

const R=SB_ROOMS.plan(L,P,S);
if(require.main!==module){module.exports={L,P,S,R,run,byPart};return;}
console.log('plan: '+R.storeys.length+' storeys, '+R.rooms.length+' rooms, '+R.floors.length+' floors, '+R.stairs.length+' stairs, '+R.walls.length+' wall blocks, '+R.doors.length+' doors');
for(const w of R.warn)console.log('  warn: '+w);
ok(!R.warn.length,'every flight found its place ('+R.warn.length+' warnings)');
/* the stairs: none steeper than a walker climbs (core/host: 0.7 m a step; the audit samples every 0.6 m) */
{const steep=R.stairs.filter(s=>{const run=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),rise=Math.abs(s.b[2]-s.a[2]);return rise>.01&&rise/Math.max(run,.01)>.75;});
 ok(!steep.length,'no stair rises more than 0.75 m a metre ('+R.stairs.length+' stairs'+(steep.length?'; steep: '+steep.slice(0,5).map(s=>s.id).join(', '):'')+')');}
/* the parts the layout's open ways join to the walk (its lifts the walk's own): every room of them reached, none of the others */
const open=new Set(['sb.plaza','sb.lobby']);{const lifts=new Set(S.lifts.map(l=>l.id).concat(S.lifts.flatMap(l=>l.ways)));let more=true;
 for(const p of L.parts)if(p.zone==='town')open.add(p.id);
 while(more){more=false;for(const w of L.ways){if(w.open===false)continue;if(w.kind==='lift'&&!lifts.has(w.id))continue;if(w.kind==='rope'||w.kind==='wall')continue;
  for(const [a,b] of [[w.a,w.b],[w.b,w.a]])if(open.has(a)&&!open.has(b)){open.add(b);more=true;}}}
 for(const p of L.parts)if(p.in&&open.has(p.in))open.add(p.id);
 /* the crown's deck is the Order's house's roof: the arc ramp lands on it */
 if(open.has('sb.tower.order'))open.add('sb.crown');}
const A=run(R),BP=byPart(R,A);
console.log('audit: '+A.windows+' windows, '+A.floods+' floods, '+A.nodes+' samples, '+A.ms+' ms');
const want=[],shut=[];for(const k in BP){const [r,n]=BP[k];if(verbose)console.log('  '+k.padEnd(26)+(r+'/'+n).padStart(10)+(open.has(k)?'':'   (shut)'));(open.has(k)?want:shut).push([k,r,n]);}
const short=want.filter(([k,r,n])=>r<n);
ok(!short.length,'every room of the '+want.length+' parts the open ways join is reached ('+want.reduce((s,q)=>s+q[2],0)+' rooms'+(short.length?'; short: '+short.map(([k,r,n])=>k+' '+r+'/'+n).join(', '):'')+')');
const leak=shut.filter(([k,r])=>r>0);
ok(!leak.length,'no room of the '+shut.length+' parts the layout keeps shut is reached ('+shut.map(q=>q[0]).join(', ')+(leak.length?'; leaks: '+leak.map(([k,r,n])=>k+' '+r+'/'+n).join(', '):'')+')');
/* the walls: a wall line's blocks leave no gap a walker passes but its doors (sampled: a walker pushed at each drum's skin from inside stays in) */
{const W=world(R);let out=0,n=0;for(const d of P.drums){const p=L.parts.find(q=>q.id===d.id);if(!p||p.state==='gone')continue;const y=d.at[1]+.05;
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2,x=d.at[0]+(d.r-.3)*Math.cos(a),z=d.at[2]+(d.r-.3)*Math.sin(a);n++;if(!W.blocked(x,y,z,.25,1.6))out++;}}
 ok(!out,'the drums\' glass is solid all round ('+n+' points on it, '+out+' open)');}
// ---- the negatives ---------------------------------------------------------------------------------------------------------------
const tag=(R2,o)=>byPart(R2,run(R2,o));
{const d=R.locked.find(q=>/sb\.sp\.5\.0\.neck\.up|sb\.sp\.4\.1\.neck\.dn/.test(q.id));
 const N=d?tag(R,{open:[d.id]}):null;ok(N&&N['sb.sp.4.1'][0]>0,'negative: the T2 hatch to the sealed drum opened, the walker gets into sb.sp.4.1'+(N?' ('+N['sb.sp.4.1'][0]+' rooms)':''));}
{const ids=R.stairs.filter(s=>/^sb\.foot\.w\.gov\.up\./.test(s.id)).map(s=>s.id);const N=tag(R,{drop:ids});
 ok(ids.length&&N['sb.foot.w.barracks'][0]===0,'negative: the stair from the offices to the barracks taken away, no barracks room is reached ('+ids.join(' ')+')');}
{const ids=R.stairs.filter(s=>/^sb\.room\.order\.shaft\.40$/.test(s.id)).map(s=>s.id);const N=tag(R,{drop:ids});
 ok(ids.length&&N['sb.nock.shed']&&N['sb.nock.shed'][0]===0,'negative: one flight of the Order\'s shaft taken away, the Nock\'s shed is not reached');}
{const N=tag(R,{lock:['sb.room.door.neck.T3']});ok(N['sb.T3'][0]>0&&N['sb.sp.2.1'][0]===0,'negative: the neck\'s door at T3 shut, the drums above are cut off (sb.sp.2.1 '+N['sb.sp.2.1'][0]+')');}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
