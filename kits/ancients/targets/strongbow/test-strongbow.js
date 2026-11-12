// node kits/ancients/targets/strongbow/test-strongbow.js — Strongbow's plan in node (no browser): it is [G data].
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..','..');
const ctx={Math,console,JSON};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/strongbow/8aw0-strongbow-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.STRONGBOW=typeof STRONGBOW!=="undefined"?STRONGBOW:this.STRONGBOW;',ctx,{filename:f});
const C=ctx.STRONGBOW;let fails=0;
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const P=C.plan(),S=P.stats,F=P.frame,D=P.dim;
console.log(JSON.stringify(S));
ok(JSON.stringify(P,(k,v)=>typeof v==='function'?undefined:v)===JSON.stringify(C.plan(),(k,v)=>typeof v==='function'?undefined:v),'the plan is deterministic');
ok(S.pop>22000&&S.pop<30000,'about 26 000 people as built ('+S.pop+')');
ok(Math.abs(S.hull-462)<1,'the tower stands 462 m, from its crown down through the Nock deck ('+S.hull.toFixed(0)+' m)');
ok((F.top-F.lipY)/D.STO>=15,'the tower stands '+((F.top-F.lipY)/D.STO).toFixed(1)+' storeys above the lip (the owner: at least 15)');
ok(F.w(0)<D.BAY.w/2-20&&D.BAY.w<2*F.w(0)+90,'the bay fits the tower closely ('+D.BAY.w+' m bay, '+(2*F.w(0)).toFixed(0)+' m tower)');
ok(F.w(0)>F.w(1)&&[0,.25,.5,.75,1].every(t=>F.d(t)>1.4*2*F.w(t)),'the tower is a slender wedge, deeper than wide at every height and widest at the crown');
// unique ids over every record list
const lists=['storeys','stays','drums','galleries','helio','rotors','saucers'],ids=new Set();let n=0;
for(const l of lists)for(const r of P[l]){ids.add(r.id);n++;}
ok(ids.size===n,'unique ids ('+n+')');
// the hull fits the bay: at every storey the back corners are inside the bay's walls, and the hull's back on its back wall
let bad=0;for(const k of P.storeys){const w=F.w(k.t);if(w>D.BAY.w/2-8)bad++;}
ok(bad===0,'the Bow stands clear of the bay\'s side walls at every storey ('+bad+' too wide)');
ok(Math.abs(F.back-(-D.BAY.d+D.HULL.gap))<1e-9,'the Bow\'s back stands '+D.HULL.gap+' m off the bay\'s back wall');
// the prow bows: deepest below the middle, then tapers
ok(F.d(0)-F.d(1)<25&&F.d(1)>0,'the prow runs nearly plumb down the tower ('+F.d(0).toFixed(0)+' m deep at the crown, '+F.d(1).toFixed(0)+' at the Nock)');
// every anchor and string stay runs in front of the rock: sampled along its length, south of the face
let inRock=[];for(const st of P.stays){if(st.a==='mast')continue;for(let i=1;i<20;i++){const f=i/20,p=st.a.map((v,j)=>v+(st.b[j]-v)*f);
 const inBay=Math.abs(p[0])<D.BAY.w/2;if(!inBay&&p[2]<F.faceZ(p[0],p[1])-1){inRock.push(st.id);break;}}}
ok(!inRock.length,'no stay passes through the rock ('+inRock.slice(0,4).join(' ')+')');
// sockets are on the rock outside the bay, clear of the galleries and the lower hull
const sk=P.stays.filter(s=>s.fan.indexOf('anchor')===0);
ok(sk.every(s=>Math.abs(s.b[0])>D.BAY.w/2+10&&s.b[1]>P.nock.y),'every anchor socket is in the face beside the bay, above the Nock');
ok(sk.every(s=>s.b[1]<P.nock.y-P.nock.th-4||s.b[1]>P.nock.y+4),'no anchor socket is under the Nock\'s wings');
// the string reaches the Nock's wings
const str=P.stays.filter(s=>s.fan==='string');ok(str.every(s=>Math.abs(s.b[0])>D.BAY.w/2&&Math.abs(s.b[0])<=P.nock.wx),'the string fans land on the Nock\'s wings');
// the lower hull hangs below the Nock's west wing, clear of the bay
const Q=P.quiver;ok(Math.abs(Q.x)-Q.W/2>D.BAY.w/2+10&&Q.top<P.nock.y-P.nock.th-20,'the lower hull hangs on the face west of the bay, under the Nock');
// THE SPINE: one column from the keel to the foot, its runs joined, a terrace at every turn, in the bay or before it
const SPN=P.spine,nd=SPN.nodes;
ok(Math.abs(nd[0][1]-F.tip)<3&&nd[0][1]<P.nock.y-P.nock.th+.5&&Math.abs(nd[nd.length-1][1]-(F.FL+D.TERM.h))<1e-6,'the Spine runs from the sail\'s keel to the terminus roof');
ok(SPN.runs.some(r=>r.slope)&&SPN.runs.some(r=>!r.slope)&&SPN.runs.every((r,i)=>i===0||r.slope!==SPN.runs[i-1].slope||!r.slope),'the Spine alternates plumb runs and sloping ones');
let gap=0;for(let i=1;i<P.drums.length;i++){const a=P.drums[i-1],b=P.drums[i];const g=a.at[1]-(b.at[1]+b.h);if(g<-.01||g>D.SPINE.necks+6.01)gap++;}
ok(gap===0,'every drum sits on a neck or a terrace on the one below it ('+P.drums.length+' drums)');
ok(SPN.terraces.length===nd.length-2&&SPN.terraces.every(t=>t.r>D.SPINE.r+10),'a terrace at every turn ('+SPN.terraces.length+')');
const inWall=P.drums.filter(d=>d.at[2]-d.r<0&&Math.abs(d.at[0])+d.r>D.BAY.w/2-2);
ok(!inWall.length,'no drum cuts the bay\'s side walls');
ok(P.drums.every(d=>d.at[2]-d.r>-D.BAY.d-1),'no drum cuts the bay\'s back wall');
ok(SPN.terraces.filter(t=>t.struts).every(t=>t.struts.every(st=>Math.abs(st.b[0])>D.BAY.w/2&&Math.abs(st.b[2]-F.faceZ(st.b[0],st.b[1]))<1e-6)),'the struts land on the face beside the bay');
ok(P.rotors.every(r=>Math.abs(r.hub[0])+r.r<D.BAY.w/2||r.hub[2]-12>F.faceZ(r.hub[0],r.hub[1])),'the rotors turn clear of the rock');
const foot=nd[nd.length-1],FT=P.foot,Lb=FT.lobby;
ok(Math.hypot(foot[0]-Lb.at[0],foot[2]-Lb.at[2])<1e-6&&Math.abs(foot[1]-Lb.y1)<1e-6,'the Spine stands on the lobby roof, centred on it');
ok(Lb.r>D.SPINE.r+15&&Lb.core<D.SPINE.r&&Lb.galleries.every(g=>g.r0>Lb.stair.r1+2&&g.r1<Lb.r&&g.y>Lb.y0&&g.y<Lb.y1),'the lobby galleries ring its wall, clear of the great stair round the core');
const over=(a,b)=>a[0]<b[1]-1&&b[0]<a[1]-1&&a[2]<b[3]-1&&b[2]<a[3]-1,rs=FT.rects;let ov=[];
for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++)if(i!==1&&j!==1&&over(rs[i],rs[j]))ov.push(i+'/'+j);
ok(!ov.length,'the hall, the wings and the plaza do not overlap ('+ov.join(' ')+')');
const inC=(x,z)=>Math.hypot(x-Lb.at[0],z-Lb.at[2])<Lb.r-1;
ok(FT.wings.concat([FT.hall]).every(w=>!inC(Math.max(w.x0,Math.min(Lb.at[0],w.x1)),Math.max(w.z0,Math.min(Lb.at[2],w.z1)))),'no wing or the hall cuts into the lobby');
ok(Math.abs(FT.plaza.z0-(Lb.at[2]+Lb.r))<1,'the plaza opens off the lobby south side');
const lineEnd=P.line.pts[P.line.pts.length-1],roadEnd=P.road.pts[P.road.pts.length-1];
ok(Math.abs(lineEnd[0]-FT.hall.x0)<1e-6&&lineEnd[2]>FT.hall.z0&&lineEnd[2]<FT.hall.z1,'the line came in at the terminus hall west mouth');
ok(Math.abs(roadEnd[0]-FT.plaza.x0)<1e-6&&roadEnd[2]>FT.plaza.z0&&roadEnd[2]<FT.plaza.z1,'the valley road ends on the plaza');
// the heliostats throw the noon sun onto the hull's middle: reflect the sun in each mirror's normal
let worst=0;const sun=D.HELIO.sun,aim=[0,F.FL+D.HELIO.aim[1],D.HELIO.aim[2]];
for(const m of P.helio){const d=m.n[0]*sun[0]+m.n[1]*sun[1]+m.n[2]*sun[2],r=m.n.map((v,j)=>2*d*v-sun[j]);
 const t=aim.map((v,j)=>v-m.at[j]),tl=Math.hypot(...t),c=(r[0]*t[0]+r[1]*t[1]+r[2]*t[2])/tl;worst=Math.max(worst,Math.acos(Math.min(1,c))*180/Math.PI);}
ok(worst<.01,P.helio.length+' heliostats each reflect the sun onto the hull (worst '+worst.toFixed(4)+' deg)');
ok(P.helio.every(m=>Math.hypot(m.at[0]-P.pad.at[0],m.at[2]-P.pad.at[2])>P.pad.r+8),'no mirror on the landing pad');
// the town keeps off the terminus, the line, the road and the heaped scree
const RU=C.ruin(P),T=P.term;
ok(RU.town.houses.length>40,'the town at the foot ('+RU.town.houses.length+' houses)');
ok(RU.town.houses.every(hs=>FT.rects.every(r=>!(hs.at[0]>r[0]-10&&hs.at[0]<r[1]+10&&hs.at[2]>r[2]-10&&hs.at[2]<r[3]+10))),'no house in the foot or on the plaza');
ok(RU.quiver.pieces.every(q=>q.at[0]<RU.foot.hallCut+20&&q.at[2]>FT.hall.z0&&q.at[2]<FT.hall.z1),'the fallen lower hull lies on the terminus hall crushed west half');
ok(RU.town.houses.every(h=>F.scree(h.at[0],h.at[2])<=16),'no house on the heaped scree');
// the ruin: half the stays (every anchor and all the string on the failed side, whose Nock wing fell; 2026-11-12), none on the other side
const all=P.stays.filter(s=>s.fan==='string'||s.fan.indexOf('anchor')===0),gone=new Set(RU.gone);
const share=all.filter(s=>gone.has(s.id)).length/all.length;
ok(share>.35&&share<=.5,'the ruin stands on half its stays ('+(100*share).toFixed(0)+'% of string and anchors gone)');
ok(all.filter(s=>gone.has(s.id)).every(s=>s.side===D.RUIN.side),'only the failed side\'s stays have snapped');
ok(Math.hypot(RU.lean.ax,RU.lean.az)>3&&Math.hypot(RU.lean.ax,RU.lean.az)<5,'the Bow leans a few degrees off the face');
const tipOut=S.hull*Math.sin(-RU.lean.ax*Math.PI/180);ok(tipOut>20&&tipOut<35,'its keel stands about 27 m out, off the Spine\'s head ('+tipOut.toFixed(0)+' m)');
ok(RU.quiver.pieces.length===3&&RU.quiver.pieces.every(p=>p.at[2]>0),'the lower hull lies in three pieces in the scree');
ok(RU.spineGone.length>0&&P.drums.filter(d=>RU.spineGone.indexOf(d.id)<0).length>P.drums.length*.7,'the Spine is broken at its head and stands below ('+RU.spineGone.length+' records gone)');
ok(RU.town.houses.every(hs=>RU.debris.every(q=>Math.hypot(q.at[0]-hs.at[0],q.at[2]-hs.at[2])>(q.r==null?40:q.r))),'no house under the fallen drums');
ok(JSON.stringify(RU)===JSON.stringify(C.ruin(C.plan())),'the ruin is deterministic');
// the open world's scarp: a lower face scales the hull and keeps it in the bay
const P2=C.plan({lip:700,floor:2463});ok(Math.abs(P2.frame.top-(2463+D.HULL.top*700/900))<1e-6&&P2.frame.tip>2463,'a passed lip and floor scale the frame');
console.log(fails?fails+' FAILED':'all passed');process.exitCode=fails?1:0;
