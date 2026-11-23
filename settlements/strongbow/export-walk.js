// node settlements/strongbow/export-walk.js [out dir, default godot/data/strongbow] — Strongbow's walk (src/32-sb-walk.js) and its
// interiors (src/33-sb-rooms.js) as core/walk's export (format krator-walk), clipped to the regions the Godot test bakes
// (godot/tests/strongbow/strongbow_walk_test.gd): every door open but the locked ones (a shut door is left out of the blocks
// and listed under its region's `shut`, so the test's negative can put it back), the open ground at the foot as 4 m tiles.
//   foot: from the town's ground in front of the lobby, through its door, up the great stair into the first drum, up the
//         drums' switchbacks and the neck's flight to T1's plate, out by the neck's door and into a room of T1's ring
//   town: from the street into a three-storey scrap house on a slope (its stoop, its door, its stairs) to its top storey
//   lip:  from the stop of W5 on the lip, through the Sultanate's post and the yard, into the Order's gatehouse and up its
//         switchback to a room on its top storey
// Also lifts.json: every lift as its stops (a NavigationLink each way, for a host that rides them).
'use strict';
const fs=require('fs'),path=require('path'),T=require('./test-sb-rooms.js');
const ROOT=path.join(__dirname,'..','..'),OUT=process.argv[2]?path.resolve(process.argv[2]):path.join(ROOT,'godot','data','strongbow');
const {L,P,S,R}=T,ground=(x,z)=>P.frame.ground(x,z);
const W=KWALK.create(),RS=SB_WALK.register(W,S);for(const k in RS.doors)W.setBlock(RS.doors[k],false);
const RR=SB_ROOMS.register(W,R);for(const d of R.doors)if(RR.doors[d.id])W.setBlock(RR.doors[d.id],!!d.locked);
const PT={};for(const p of L.parts)PT[p.id]=p;
/* the town with its buildings' interiors (the scrap Xanadu set, SB_ROOMS.town): core/space, core/city, the crops and the town plan
   loaded here (test-sb-rooms loads the rest), the kit's boxes read off its defs as test-sb-town.js does */
const vm=require('vm'),loadF=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
['core/space/20-core-space.js'].concat(fs.readdirSync(path.join(ROOT,'core','city')).filter(f=>/^\d\d-city-.*\.js$/.test(f)&&!/host/.test(f)).sort().map(f=>'core/city/'+f),
 ['kits/crops/src/10-crop-core.js','kits/crops/src/20-crop-records.js','kits/crops/src/40-crop-query.js','settlements/strongbow/src/40-sb-town.js']).forEach(loadF);
const DIMS={};for(const f of ['kits/xanadu/src/87u-xs-build.js','kits/xanadu/src/87v-xs-poor.js']){const s=fs.readFileSync(path.join(ROOT,f),'utf8');
 for(const m of s.matchAll(/XA\.def\(\{key:'(xa_scrap_[a-z_]+)'.*?,w:([\d.]+),d:([\d.]+),h:([\d.]+)/g))DIMS[m[1]]={w:+m[2],d:+m[3],h:+m[4]};}
const TOWN=SB_TOWN.make({layout:L,plan:P,dims:(k,v)=>DIMS[k]?{key:k,v:v||0,w:DIMS[k].w,d:DIMS[k].d,h:DIMS[k].h}:null});
const IX=global.KratorInteriors=require(path.join(ROOT,'kits','interiors','dist','interiors-core.js'));(0,eval)(fs.readFileSync(path.join(ROOT,'kits','interiors','sets','xanadu-scrap.js'),'utf8'));
const RT=SB_ROOMS.town(W,TOWN,IX,ground);for(const b of SB_ROOMS.solids(TOWN,RT.ids))W.block(b.box,'sb.town.solid');
const ctr=rm=>{const P=rm.poly;let x=0,z=0;for(const q of P){x+=q[0];z+=q[1];}return [x/P.length,rm.y,z/P.length];};
/* the regions */
const T1=PT['sb.T1'],t1c=[T1.shape[1],T1.shape[2]],t1r=T1.shape[3],LB=P.foot.lobby,t1y=T1.y+1.6;
const t1rooms=R.rooms.filter(r=>r.part==='sb.T1'&&r.kind!=='corridor'&&r.poly),goalA=ctr(t1rooms[Math.floor(t1rooms.length/2)]);
const W5=S.lifts.find(l=>l.id==='W5'),w5top=W5.stops[W5.stops.length-1],startB=[w5top.gate.at[0]+w5top.side[0]*1.5,w5top.y,w5top.gate.at[1]+w5top.side[1]*1.5];
const gh=PT['sb.lip.gatehouse'],ghTop=R.rooms.filter(r=>r.part==='sb.lip.gatehouse'&&r.level===(gh.st|0)-1&&r.kind!=='corridor'&&r.poly),goalB=ctr(ghTop[0]);
const yard=PT['sb.lip.yard'].shape,post=PT['sb.lip.post'].shape,st0=S.route[0].at,startA=[st0[0],ground(st0[0],st0[1]),st0[1]];
const regions=[
 {id:'foot',box:[t1c[0]-t1r-4,-3,Math.min(t1c[1]-t1r,LB.at[2]-60)-4,t1c[0]+t1r+4,t1y+8,Math.max(t1c[1]+t1r,startA[2])+6],from:startA,to:goalA,
  shut:['sb.door.lobby'],note:'the town to a room of T1\'s ring, on foot'},
 {id:'lip',box:[gh.shape[1]-6,P.frame.lipY-5,Math.min(yard[3],gh.shape[3],post[3])-6,Math.max(yard[2],post[2],startB[0])+8,gh.y+gh.h+3,Math.max(yard[4],gh.shape[4],post[4],startB[2])+8],from:startB,to:goalB,
  shut:R.doors.filter(d=>!d.locked&&!d.open&&/^sb\.room\.door\./.test(d.id)&&/gatehouse/.test(d.id)).map(d=>d.id),note:'W5\'s top stop to a room on the gatehouse\'s top storey (the negative shuts both its doors, the yard\'s and the ramp\'s)'}];
/* town: the three-storey scrap house nearest the lobby that stands over its street (it has a stoop): from the street below its
   stoop, up the stoop, through its door, up its stairs to a room on the top storey. The negative: its doorways blocked */
{const lb=[LB.at[0],LB.at[2]],cand=RT.placed.filter(q=>q.item==='xa_scrap_house'&&W.floors.some(F=>(F.name||'').startsWith(q.id+'.stoop.')))
  .sort((a,b)=>Math.hypot(a.inst.x-lb[0],a.inst.z-lb[1])-Math.hypot(b.inst.x-lb[0],b.inst.z-lb[1])),q=cand[0];
 const own=W.floors.filter(F=>(F.name||'').startsWith(q.id+'.')),top=own.filter(F=>F.kind==='poly'&&/\.floor\.2(\.|$)/.test(F.name)).sort((a,b)=>Math.abs(b.pts.reduce((s,p,i,A)=>s+p[0]*A[(i+1)%A.length][1]-A[(i+1)%A.length][0]*p[1],0))-Math.abs(a.pts.reduce((s,p,i,A)=>s+p[0]*A[(i+1)%A.length][1]-A[(i+1)%A.length][0]*p[1],0)))[0];
 const tc=top.pts.reduce((s,p)=>[s[0]+p[0]/top.pts.length,s[1]+p[2]/top.pts.length,s[2]+p[1]/top.pts.length],[0,0,0]),from=q.steps[0];
 const b=[1e9,-1e9,1e9,-1e9];for(const F of own)for(const p of (F.kind==='poly'?F.pts:F.kind==='strip'?[F.a,F.b]:[]))b[0]=Math.min(b[0],p[0]),b[1]=Math.max(b[1],p[0]),b[2]=Math.min(b[2],p[1]),b[3]=Math.max(b[3],p[1]);
 const c=Math.cos(q.inst.ry),s=Math.sin(q.inst.ry),DR=IX.sets.byName['xanadu-scrap'].doors.xa_scrap_house;
 regions.push({id:'town',box:[b[0]-10,from[1]-4,b[2]-10,b[1]+10,tc[1]+5,b[3]+10],from,to:tc,ground:true,
  shut:DR.map((R0,k)=>({id:q.id+'.door.'+k,box:(()=>{const x=q.inst.x+R0[0]*c+R0[2]*s,z=q.inst.z-R0[0]*s+R0[2]*c;return [x-1.2,x+1.2,z-1.2,z+1.2,q.y-1.5,q.y+3];})()})),
  note:'the street to the top storey of '+q.id+' ('+q.item+', on a slope: '+q.steps.length+' stoop(s)), on foot'});}
/* the waypoints a path should pass (the test reports how near it came to each: where a failing path stops) */
const sp=(id,e)=>{const s=R.stairs.find(q=>q.id===id);return s?[s[e][0],s[e][2],s[e][1]]:null;},sd=id=>{const d=S.doors.find(q=>q.id===id)||R.doors.find(q=>q.id===id);return d?[d.at[0],d.y,d.at[1]]:null;};
const low=(x,z)=>{const f=W.floorsAt(x,z).filter(q=>q[0]<3);return f.length?f[0][0]:ground(x,z);},r1=S.route[1].at,r2=S.route[2].at;
regions[0].via=[["the plaza's steps",[r1[0],low(r1[0],r1[1]),r1[1]]],["before the lobby's door",[r2[0],low(r2[0],r2[1]),r2[1]]],["the lobby's door",sd('sb.door.lobby')],["the great stair's foot",sp('sb.room.lobby.stair.0','a')],["its top",sp('sb.room.lobby.up','a')],["the first drum",sp('sb.room.lobby.up','b')],
 ["the first drum's top storey",sp('sb.sp.6.1.stair.'+(((L.parts.find(p=>p.id==="sb.sp.6.1").st|0)||2)-2),'b')],["the neck to the second drum",sp('sb.sp.6.1.neck','a')],["the second drum",sp('sb.sp.6.1.neck','b')],["the neck flight's foot",sp('sb.sp.6.0.neck.up','a')],["T1's plate",sp('sb.sp.6.0.neck.up','b')],["the neck's door",sd('sb.door.neck')]].filter(v=>v[1]).map(([name,at])=>({name,at}));
regions[1].via=[["the post's door to the yard",sd('sb.door.post.n')],["the gatehouse's door",sd(regions[1].shut.find(id=>/yard/.test(id)))],["the hall's first flight",sp('sb.lip.gatehouse.stair.0','a')],["its last",sp('sb.lip.gatehouse.stair.'+((gh.st|0)-2),'b')]].filter(v=>v[1]).map(([name,at])=>({name,at}));
const inBox=(b,x,y,z)=>x>=b[0]&&x<=b[3]&&y>=b[1]&&y<=b[4]&&z>=b[2]&&z<=b[5];
const EX=W.export({hazards:false}),floors=[],blocks=[],seenF=new Set(),seenB=new Set();
/* the walk's own floors get the stairwells the rooms' have (SB_ROOMS.stairwells): a flight's top is not under a ceiling */
{const strips=EX.floors.filter(f=>f.kind==='strip').map(f=>({a:f.a,b:f.b,w:f.w}));
 const conv=EX.floors.map((f,i)=>f.kind==='rect'?{id:'#'+i,y:f.y,pts2:[[f.rect[0],f.rect[2]],[f.rect[1],f.rect[2]],[f.rect[1],f.rect[3]],[f.rect[0],f.rect[3]]],src:f}:
  f.kind==='poly'&&f.pts.every(q=>Math.abs(q[2]-f.pts[0][2])<1e-6)?{id:'#'+i,y:f.pts[0][2],pts2:f.pts.map(q=>[q[0],q[1]]),src:f}:{id:'#'+i,src:f});
 const cut=SB_ROOMS.stairwells(conv,strips);let n=0;
 EX.floors=cut.map(c=>{if(!c.pts2)return c.src;if(c.id.indexOf('~')<0&&c.pts2.length===4&&c.src.kind==='rect'){const xs=c.pts2.map(q=>q[0]),zs=c.pts2.map(q=>q[1]);
   if(Math.min(...xs)===c.src.rect[0]&&Math.max(...xs)===c.src.rect[1]&&Math.min(...zs)===c.src.rect[2]&&Math.max(...zs)===c.src.rect[3])return c.src;}
  n++;return {kind:'poly',pts:c.pts2.map(q=>[q[0],q[1],c.y]),name:c.src.name+(c.id.indexOf('~')>=0?c.id.slice(c.id.indexOf('~')):''),tag:c.src.tag};});
 console.log('stairwells: '+n+' floors rewritten as polygons');}
const fpts=f=>f.kind==='rect'?[[f.rect[0],f.y,f.rect[2]],[f.rect[1],f.y,f.rect[3]]]:f.kind==='poly'?f.pts.map(p=>[p[0],p[2],p[1]]):[[f.a[0],f.a[2],f.a[1]],[f.b[0],f.b[2],f.b[1]]];
for(const g of regions){const b=g.box;
 EX.floors.forEach((f,i)=>{if(seenF.has(i))return;const P=fpts(f),x0=Math.min(...P.map(p=>p[0])),x1=Math.max(...P.map(p=>p[0])),y0=Math.min(...P.map(p=>p[1])),y1=Math.max(...P.map(p=>p[1])),z0=Math.min(...P.map(p=>p[2])),z1=Math.max(...P.map(p=>p[2]));
  if(x1>=b[0]&&x0<=b[3]&&z1>=b[2]&&z0<=b[5]&&y1>=b[1]&&y0<=b[4]){seenF.add(i);floors.push(f);}});   /* by its bounds (the plaza's corners lie outside the region) */
 EX.blocks.forEach((k,i)=>{if(seenB.has(i)||k.off)return;const q=k.box;if(q[1]>=b[0]&&q[0]<=b[3]&&q[3]>=b[2]&&q[2]<=b[5]&&q[5]>=b[1]&&q[4]<=b[4]){seenB.add(i);blocks.push(k);}});
 /* the open ground: 4 m tiles at the ground's height wherever no floor is within 2 m above it */
 if(g.id==='foot'||g.ground)for(let x=b[0];x<b[3];x+=4)for(let z=b[2];z<b[5];z+=4){const y=ground(x+2,z+2);if(W.floorsAt(x+2,z+2).some(q=>q[0]>y-.3&&q[0]<y+2))continue;floors.push({kind:'rect',rect:[x,x+4,z,z+4],y,name:'ground',tag:'ground'});}
 /* the shut doors' blocks, which the negative puts back */
 g.shut=g.shut.map(id=>{if(typeof id==='object')return id;const d=S.doors.find(q=>q.id===id)||R.doors.find(q=>q.id===id),rec=RS.doors[id]||RR.doors[id];return rec?{id,box:rec.box.slice()}:{id,box:null};});}
const lifts=S.lifts.map(l=>({id:l.id,stops:l.stops.map(s=>({y:s.y,at:[s.gate.at[0]+s.side[0]*1.2,s.y,s.gate.at[1]+s.side[1]*1.2],gate:s.gate.id}))}));
fs.mkdirSync(OUT,{recursive:true});
const walk={format:EX.format,version:EX.version,convention:EX.convention,floors,blocks,zones:[],regions};
fs.writeFileSync(path.join(OUT,'walk.json'),JSON.stringify(walk),{encoding:'utf8'});
fs.writeFileSync(path.join(OUT,'lifts.json'),JSON.stringify({lifts},null,1),{encoding:'utf8'});
console.log('walk.json: '+floors.length+' floors, '+blocks.length+' blocks, regions '+regions.map(g=>g.id+' ['+g.box.map(v=>v.toFixed(0)).join(',')+'] '+g.shut.map(s=>s.id+(s.box?'':' (none)')).join(' ')).join('; '));
