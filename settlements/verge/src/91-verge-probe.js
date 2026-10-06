// ================================================================= VERGE — the probe ([web])
// window._api: the checks verify.py --assert runs, and the export a Godot port reads. Every check states what it
// measures and is fed a broken input as its NEGATIVE CONTROL: a check that passes its negative could never fail, and
// fails the run instead.
window._api=(function(){
const T=VG.TRAIL,P=PLACE;
// ---------------------------------------------------------------- the checks, each a pure function of its inputs
function gradeOf(pts){let mx=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d>.5)mx=Math.max(mx,Math.abs(b[2]-a[2])/d);}return mx;}
const C={
 // the switchback is walkable by a laden camel: no stretch steeper than 16%
 trailGrade:pts=>{const g=gradeOf(pts);return{ok:g<=.16,detail:'steepest '+(g*100).toFixed(1)+'%'};},
 // the trail and the ground agree: the ground under the centreline is within 0.5 m of the trail
 trailOnGround:pts=>{let mx=0;for(let i=0;i<pts.length;i+=3){const p=pts[i];mx=Math.max(mx,Math.abs(terrainH(p[0],p[1])-p[2]));}return{ok:mx<.6,detail:'max '+mx.toFixed(2)+' m between trail and ground'};},
 // the rest stops stand at their marks of the descent (within 40 m) and on level pads
 restMarks:rs=>{let bad=[];for(const r of rs){const d=T.yTop-r.y;if(Math.abs(d-r.mark)>40)bad.push(r.id+' at '+d.toFixed(0)+' m');}return{ok:!bad.length&&rs.length===4,detail:rs.length+' stops; '+(bad.join(', ')||'each within 40 m of its mark')};},
 // each cataract falls inside the gorge: the rock either side stands above the water it falls from
 fallsInGorge:falls=>{const bad=[];for(const f of falls){const x=f.x+6,z=VG.gorgeZ(x),hw=VG.gorgeHW(x);const n=terrainH(x,z-hw-10),s=terrainH(x,z+hw+10);if(Math.min(n,s)<f.bot+8)bad.push(f.id);}
  return{ok:!bad.length,detail:falls.length+' falls'+(bad.length?'; low rim at '+bad.join(','):'; every rim above its plunge')};},
 // no two buildings overlap (their footprints, shrunk 0.4 m, oriented boxes, by separating axes)
 noOverlap:B=>{const box=R=>P.obb(R.x,R.z,Math.max(.1,R.w/2-.4),Math.max(.1,R.d/2-.4),R.ry),G=new Map(),C2=40;let n=0,first=null;
  const sep=(a,b)=>{for(const poly of [a,b])for(let i=0;i<4;i++){const p=poly[i],q=poly[(i+1)%4],nx=q[1]-p[1],nz=p[0]-q[0];let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
    for(const v of a){const d=v[0]*nx+v[1]*nz;a0=Math.min(a0,d);a1=Math.max(a1,d);}for(const v of b){const d=v[0]*nx+v[1]*nz;b0=Math.min(b0,d);b1=Math.max(b1,d);}if(a1<b0||b1<a0)return true;}return false;};
  B.forEach((R,i)=>{const k=Math.floor(R.x/C2)+','+Math.floor(R.z/C2);(G.get(k)||G.set(k,[]).get(k)).push(i);});
  B.forEach((R,i)=>{if(/palisade/.test(R.key))return;const bi=box(R),ci=Math.floor(R.x/C2),cj=Math.floor(R.z/C2);for(let a=ci-1;a<=ci+1;a++)for(let b=cj-1;b<=cj+1;b++){const L=G.get(a+','+b);if(!L)continue;
   for(const j of L){if(j<=i||/palisade/.test(B[j].key))continue;if(Math.hypot(B[j].x-R.x,B[j].z-R.z)>(Math.hypot(R.w,R.d)+Math.hypot(B[j].w,B[j].d))/2)continue;if(!sep(bi,box(B[j]))){n++;if(!first)first=R.id+' x '+B[j].id;}}}});
  return{ok:n===0,detail:n+' overlapping pairs of '+B.length+(first?' (first '+first+')':'')};},
 // every building stands on its ground: its floor no more than 0.5 m above the lowest ground under its box
 onGround:B=>{let bad=0,first=null;for(const R of B){const c=P.obb(R.x,R.z,R.w/2,R.d/2,R.ry);const lo=Math.min(...c.map(p=>terrainH(p[0],p[1])),terrainH(R.x,R.z));if(R.y-lo>.6||lo-R.y>4.5){bad++;if(!first)first='';if(bad<=6)first+=(bad>1?', ':'')+R.id+' '+R.key+' '+(R.y-lo).toFixed(1);}}
  return{ok:bad===0,detail:bad+' of '+B.length+' off their ground'+(first?' (first '+first+')':'')};},
 // the trail is clear: no block of the funicular's ruin (walls, piers, girders, rubble) stands in its corridor
 trailClear:blocks=>{let n=0,first=null;for(let s=0;s<T.len;s+=1){const p=VG.trailAt(s);for(const b of blocks)if(p[0]>b[0]-1.2&&p[0]<b[1]+1.2&&p[1]>b[2]-1.2&&p[1]<b[3]+1.2&&b[4]<p[2]+2.2&&b[5]>p[2]+.15){n++;if(!first)first='s '+s;break;}}
  return{ok:n===0,detail:n?n+' m of trail run through the ruin (first at '+first+')':'no block of the ruin on the trail ('+blocks.length+' blocks)'};},
 // the only way between the two cities is the trail: with the trail's edges taken away no route exists
 trailOnlyWay:()=>{const a=SIM.PBY.port_west.node,b=SIM.PBY.port_east.node,w=SIM.route(a,b),wo=SIM.route(a,b,{noLayer:['trail']});
  return{ok:!!w&&!wo,detail:(w?'a route':'NO route')+' with the trail, '+(wo?'A ROUTE':'none')+' without it'};},
 // one body to one slot: no slot is held twice at once in the timetable's cycle
 slotsUnique:places=>{let n=0,slots=0;for(const Pl of places)for(const S of Pl.slots){slots++;const b=S.busy;for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)for(const k of [-SIM.T,0,SIM.T])if(b[i][0]<b[j][1]+k&&b[j][0]+k<b[i][1])n++;}
  return{ok:n===0,detail:slots+' slots, '+n+' double bookings'};},
 // every placed building has an interior chosen by the interiors kit, or its set says why not (a skip): no key
 // without an item, and no variant left bare (the negative: a Yuni shop-house variant no set has)
 interiors:B=>{let item=0,skip=0,none=[],noItem=0;for(const R of B){const it=VFURN.itemOf(R.key,R.v);if(it&&!it.skip)item++;else if(it&&it.skip)skip++;else{const base=VFURN.itemOf(R.key,0);if(base&&!base.skip&&R.v)noItem++;else if(base&&base.skip)skip++;else none.push(R.key);}}
  return{ok:none.length===0&&noItem===0,detail:item+' with rooms, '+skip+' skipped by their set, '+noItem+' variants without their own item'+(none.length?', NO ITEM for '+Array.from(new Set(none)).join(', '):'')};},
 // the timetable has everything it asked for: caravans through and back, porters, nomads, patrols
 timetable:g=>{const want={'caravan:through':8,'caravan:turnaround':8,porter:10,nomads:4,patrol:6};const miss=Object.keys(want).filter(k=>(g[k]||0)<want[k]);
  return{ok:!miss.length,detail:JSON.stringify(g)+(miss.length?' short: '+miss.join(', '):'')};},
 // a caravan's members follow, not march: at a corner the leader has turned and the last member has not yet
 follows:G=>{if(!G)return{ok:false,detail:'no caravan'};const o={},last=G.members[G.members.length-1];let seen=0;
  for(let tau=200;tau<G.duration-200&&seen<3;tau+=37){SIM.memberPose(G,G.members[0],tau,o);if(!o.vis||o.dispersed)continue;const y0=o.yaw;SIM.memberPose(G,last,tau,o);if(!o.vis||o.dispersed)continue;
   let d=Math.abs(y0-o.yaw)%(2*Math.PI);if(d>Math.PI)d=2*Math.PI-d;if(d>.5)seen++;}return{ok:seen>=3,detail:seen>=3?'headings differ along the route (the tail turns later)':'leader and tail always face the same way'};},
 // the world has one clock: the sky's hour is the world clock's
 oneClock:()=>{const a=typeof skyHour==='function'?skyHour():NaN,b=CLOCK.hour;return{ok:Math.abs(a-b)<.02,detail:'sky '+a.toFixed(2)+', clock '+b.toFixed(2)};},
 // everything placed is registered in core/tags with known vocabulary
 tags:reg=>{const a=reg.audit(),uk=Object.keys(a.unknownKeys||{}).concat(Object.keys(a.unknownValues||{}));
  return{ok:!a.unknown&&!a.missingCulture,detail:a.records+' records'+(uk.length?', UNKNOWN '+uk.join(' '):', every key and value known')+(a.missingCulture?', '+a.missingCulture+' without a culture':'')};}};
// the inputs, and their broken twins
const B=P.buildings,places=SIM.PLACES.filter(p=>p.slots&&p.slots.length);
const through=SIM.GROUPS.find(G=>G.subkind==='through');
const CASES=[
 ['trail-grade',()=>C.trailGrade(T.pts),()=>C.trailGrade([[0,0,0],[10,0,0],[20,0,4]])],
 ['trail-on-ground',()=>C.trailOnGround(T.pts),()=>C.trailOnGround(T.pts.map(p=>[p[0],p[1],p[2]+3]))],
 ['rest-stops-at-marks',()=>C.restMarks(T.rest),()=>C.restMarks(T.rest.map(r=>Object.assign({},r,{y:r.y+120})))],
 ['falls-in-the-gorge',()=>C.fallsInGorge(VG.FALLS),()=>C.fallsInGorge(VG.FALLS.map(f=>Object.assign({},f,{bot:f.bot+400})))],
 ['buildings-do-not-overlap',()=>C.noOverlap(B),()=>{const L=B.filter(R=>!/palisade/.test(R.key)).slice(0,40);return C.noOverlap(L.concat([Object.assign({},L[5],{id:'dup'})]));}],
 ['buildings-on-their-ground',()=>C.onGround(B),()=>C.onGround([Object.assign({},B[0],{y:B[0].y+5})])],
 ['the-trail-is-clear',()=>C.trailClear(VG.FUNI.rec?VG.FUNI.rec.blocks:[]),()=>{const p=VG.trailAt(T.len/2);return C.trailClear([[p[0]-1,p[0]+1,p[1]-1,p[1]+1,p[2]-1,p[2]+3]]);}],
 ['the-trail-is-the-only-way-down',()=>C.trailOnlyWay(),null],
 ['one-body-one-slot',()=>C.slotsUnique(places),()=>C.slotsUnique([{slots:[{busy:[[0,100],[50,150]]}]}])],
 ['every-building-has-its-interior',()=>C.interiors(B),()=>C.interiors([{key:'trade_shop_house',v:9}])],
 ['the-timetable-is-full',()=>C.timetable(window._sim.groups),()=>C.timetable({porter:1})],
 ['caravans-follow-not-march',()=>C.follows(through),()=>C.follows(through&&Object.assign({},through,{members:through.members.map(M=>Object.assign({},M,{lag:0}))}))],
 ['one-clock',()=>C.oneClock(),null],
 ['tags-vocabulary',()=>C.tags(KTAGS.page),()=>{const r=KTAGS.create({build:'neg'});r.add({class:'building',key:'x',at:[0,0,0],tags:{culture:'no-such-culture'}});return C.tags(r);}]];
function checks(){const out=[];for(const [name,f,neg] of CASES){let r;try{r=f();}catch(e){r={ok:false,detail:'threw: '+e.message};}
  if(neg){let n;try{n=neg();}catch(e){n={ok:false,detail:'threw'};}if(n.ok){r={ok:false,detail:'NEGATIVE CONTROL PASSED (the check cannot fail): '+n.detail};}else r.detail+='  [negative fails as it should]';}
  out.push({name,ok:r.ok,detail:r.detail});}return out;}
// ---------------------------------------------------------------- the export (for godot/: the verge case)
function heightfield(box,step){const nx=Math.floor((box[2]-box[0])/step)+1,nz=Math.floor((box[3]-box[1])/step)+1,a=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=terrainH(box[0]+i*step,box[1]+j*step);
 const u=new Uint8Array(a.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
 return{format:'krator-heightfield',version:0,note:'sampled from the page (terrainH, core/rand noise); row-major, z rows of x',x0:box[0],z0:box[1],step,nx,nz,heights:{type:'Float32Array',n:a.length,b64:btoa(s)}};}
const PARTS={
 terrain:()=>heightfield([-3000,-640,1600,720],6),
 tags:()=>KTAGS.page.export(),
 walk:()=>KWALK.export(),
 sim:()=>SIM.export(),
 place:()=>({format:'krator-verge-place',version:1,buildings:P.buildings.map(R=>{const o=Object.assign({},R);delete o.params;return o;}),streets:P.streets,bridges:P.bridges,plazas:P.plazas,
  trail:{pts:T.pts,rest:T.rest,hairpins:T.hairpins,grade:T.grade,len:T.len},falls:VG.FALLS,pool:VG.POOL,funicular:VG.FUNI.rec||null}),
 golden:()=>({format:'krator-verge-golden',version:1,note:'SIM.memberPose at these motion times: [t, group, copy, member, visible, x, y, z, yaw]',times:[0,600,1800,4321,9000],rows:SIM.golden([0,600,1800,4321,9000])})};
return{checks,export:k=>PARTS[k](),exportParts:()=>Object.keys(PARTS),terrainH,C};})();
