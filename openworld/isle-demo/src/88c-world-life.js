// ================================================================= ISLE DEMO — the towns lived in (M7): the sim on the world's clock, citizens, the canoe line
// [web] The towns' simulation (declared by 48t-world-towns.js) runs on the world's clock (HOST.clock, core/clock: the
// 72-minute day, held unless ?time=run or the button below runs it): each frame the sim steps whole minutes until it
// reaches the clock's minute, within `budget` ms a frame (more while it is far behind), so a sim that is behind catches
// up over some frames and never in one burst; a clock set back holds the sim until the clock passes it. On load the
// clock reads 11:30 and the sim starts at midnight, so the towns' morning plays out first; ?simAt=minute (88t ran the
// sim there) sets the clock to that minute instead. Between minutes the people move on (their poses are read at the
// motion time plus the minute's fraction: SIM.pose is a function of time).
//   - the citizens: the people of the town the camera looks at (the ground point it looks at, within 400 m), within
//     `radius` of that point, the nearest `cap`, nobody indoors, as the city page's stand-ins (a body and a head,
//     coloured by what they do: settlements/isle-demo 59 ISLE.citizens.colourOf), chosen every `every` ms, posed each frame.
//   - the canoe line: one vessel per carrier (kits/ringsea through RINGSEA), docked at its berth in the town it is at
//     (a second carrier at the same stop lies astern), or under way along the sea route between the two canoe stops
//     (ISLE_TOWNS_W.seaPath: open water and the reef's passes) at the fraction of its passage the clock has run.
//   window._isleLife: {stats, follow(budget), citizens(), canoes(), poseT(), checks for verify.py}
var ISLE_LIFE;LATE.push(()=>{ISLE_LIFE=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,CL=HOST.clock,W=ISLE_TOWNS_W,S=ISLE.SIM,TS=ISLE.TUNE.sim;
const st={budget:6,catchUp:14,ran:0,behind:0,frac:0,errors:[],ms:0};
if(!S||!CL){st.errors.push(!S?'no sim on the page':'no world clock (core/clock)');window._isleLife={stats:st};return{stats:st};}
const t0=performance.now(),spm=TS.clock.secPerMinute,q=new URLSearchParams(location.search);
const clockMin=()=>(CL.day*24+CL.hour)*60;
if(q.has('simAt')){const m=S.clock.m;CL.day=Math.floor(m/1440);CL.set((m%1440+.5)/60);}   /* the export's moment: the clock at the sim's minute */
/* ---------------------------------------------------------------- the sim follows the clock */
function follow(budget){const want=Math.floor(clockMin());st.behind=want-S.clock.m;
 if(st.behind>0){const b=budget==null?(st.behind>60?st.catchUp:st.budget):budget,s0=performance.now();let n=0;
  while(S.clock.m<want&&performance.now()-s0<b){ISLE.simRun(1);n++;}st.ran+=n;st.behind=want-S.clock.m;}
 st.frac=st.behind>0?0:Math.min(.999,Math.max(0,clockMin()-S.clock.m));}
const poseT=()=>SIM.time()+st.frac*spm;
/* ---------------------------------------------------------------- the citizens */
const CIT={cap:200,radius:300,every:500,at:-1e9,sel:[],town:null,focus:null,stats:{near:0,hidden:0,chosen:0}};
const body=new THREE.CylinderGeometry(.2,.26,1.35,7).translate(0,.675,0),head=new THREE.SphereGeometry(.17,8,6).translate(0,1.52,0);
CIT.mesh=new THREE.InstancedMesh(body,new THREE.MeshLambertMaterial({color:0xffffff}),CIT.cap);
CIT.head=new THREE.InstancedMesh(head,new THREE.MeshLambertMaterial({color:0x8a5a3a}),CIT.cap);
CIT.mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(CIT.cap*3).fill(1),3);
[CIT.mesh,CIT.head].forEach(m=>{m.count=0;m.frustumCulled=false;m.name='citizens';scene.add(m);});
const v3=new THREE.Vector3();
function focus(){const P=camera.position,d=camera.getWorldDirection(v3),agl=P.y-WORLD.H(P.x,P.z),t=d.y<-.05?Math.min(400,agl/-d.y):150;
 return{x:P.x+d.x*t,z:P.z+d.z*t,agl};}
function choose(){const f=CIT.focus=focus(),P=f.agl<800?W.at(f.x,f.z):null;CIT.town=P?P.town:null;CIT.sel=[];CIT.stats={near:0,hidden:0,chosen:0};
 if(P){const s=TS.towns[P.town].id,t=poseT(),cand=[];
  SIM.all('actor').forEach(a=>{if(a.driven||SIM.settlementOf(a)!==s)return;const p=SIM.pose(a,t,{cheap:true}),d=Math.hypot(p.x-f.x,p.z-f.z);if(d>CIT.radius)return;
   CIT.stats.near++;if(p.hidden){CIT.stats.hidden++;return;}cand.push({a,d});});
  cand.sort((p,q)=>p.d-q.d||(p.a.id<q.a.id?-1:1));CIT.sel=cand.slice(0,CIT.cap).map(c=>c.a);}
 CIT.stats.chosen=CIT.sel.length;const col=new THREE.Color();CIT.sel.forEach((a,i)=>{col.setHex(ISLE.citizens.colourOf(a));CIT.mesh.setColorAt(i,col);});
 CIT.mesh.instanceColor.needsUpdate=true;CIT.t=null;pose();}
const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),UP=new THREE.Vector3(0,1,0),ONE=new THREE.Vector3(1,1,1),ZERO=new THREE.Vector3(0,0,0),PP=new THREE.Vector3();
function pose(){const t=poseT();if(CIT.t===t)return;CIT.t=t;
 CIT.sel.forEach((a,i)=>{const p=SIM.pose(a,t);PP.set(p.x,p.y,p.z);Q.setFromAxisAngle(UP,p.h||0);M4.compose(PP,Q,p.hidden?ZERO:ONE);CIT.mesh.setMatrixAt(i,M4);CIT.head.setMatrixAt(i,M4);});
 CIT.mesh.count=CIT.head.count=CIT.sel.length;CIT.mesh.instanceMatrix.needsUpdate=true;CIT.head.instanceMatrix.needsUpdate=true;}
/* ---------------------------------------------------------------- the canoe line */
const stops={};
W.plans.forEach(P=>{const L=(P.R.landings||[])[0],F=P.G.frame;if(!L)return;
 stops[TS.towns[P.town].id]={town:P.town,sea:F.sea,berths:(L.berths||[]).map(B=>({key:B.key,x:B.x+F.x,z:B.z+F.z,h:B.heading}))};});
const order=W.plans.map(P=>TS.towns[P.town].id);   /* ISLE.TOWNS order: a route is found from the first town's stop to the second's */
const berthOf=(s,key)=>{const X=stops[s];return X?X.berths.find(B=>B.key===key)||X.berths[0]||null:null;};
const routeOf=key=>{const a=berthOf(order[0],key),b=berthOf(order[1],key);return a&&b?W.seaPath([a.x,a.z],[b.x,b.z]):null;};
const boats=[];
(TS.trade?TS.trade.lines:[]).forEach(L=>{const R=SIM.TRADE&&SIM.TRADE.routes[L.id];if(!R)return;
 R.carriers.forEach((C,k)=>{const r=typeof RINGSEA!=='undefined'?RINGSEA.make(L.vessel):null;if(!r){st.errors.push('no '+L.vessel+' build');return;}
  r.group.name=L.id+' '+k;scene.add(r.group);boats.push({line:L,R,k,key:L.vessel,g:r.group,where:null});});});
function canoes(){const m=S.clock.m+st.frac,dock={};
 boats.forEach(b=>{const C=b.R.carriers[b.k],g=b.g;let x,z,h,y=null;
  if(C.phase==='sail'&&C.from!=null&&C.to!=null){const from=b.R.stops[C.from].settlement,P=routeOf(b.key);
   if(P){const f=Math.min(1,Math.max(0,(m-C.departs)/Math.max(1,C.eta-C.departs))),A=W.along(P,f,from!==order[0]);x=A.x;z=A.z;h=A.h;y=stops[from].sea;
    b.where={phase:'sail',from,to:b.R.stops[C.to].settlement,f};}}
  else if(C.at!=null){const s=b.R.stops[C.at].settlement,B=berthOf(s,b.key);
   if(B){const n=dock[s+b.key]=(dock[s+b.key]||0)+1;x=B.x-Math.sin(B.h)*28*(n-1);z=B.z-Math.cos(B.h)*28*(n-1);h=B.h;y=stops[s].sea;b.where={phase:'docked',at:s,n};}}
  if(y==null){g.visible=false;b.where=null;return;}
  g.visible=true;g.position.set(x,y,z);g.rotation.y=h-Math.PI/2;});}
/* ---------------------------------------------------------------- the panel: the clock and what the towns are doing */
const el=document.createElement('div');el.id='isleLife';
el.style.cssText='position:fixed;left:10px;bottom:10px;z-index:6;background:rgba(10,20,24,.78);color:#e8f2f0;padding:6px 9px;border-radius:5px;font:12px/1.45 ui-monospace,monospace;max-width:46vw';
const line=document.createElement('div'),bar=document.createElement('div'),runB=document.createElement('button'),spdB=document.createElement('button');
[runB,spdB].forEach(b=>{b.style.cssText='margin:4px 6px 0 0;background:#20363a;color:#e8f2f0;border:1px solid #4f8a86;border-radius:3px;padding:2px 7px;cursor:pointer;font:12px system-ui';bar.appendChild(b);});
const SPEEDS=[1,20,120];let sp=Math.max(0,SPEEDS.indexOf(CL.scale));
const showB=()=>{runB.textContent=CL.running?'hold time':'run time';spdB.textContent='speed x'+SPEEDS[sp];};
runB.onclick=()=>{CL.run();showB();};spdB.onclick=()=>{sp=(sp+1)%SPEEDS.length;CL.scale=SPEEDS[sp];showB();};
showB();el.appendChild(line);el.appendChild(bar);document.body.appendChild(el);
const hm=m=>{const d=Math.floor(m/1440),h=Math.floor((m%1440)/60),mm=Math.floor(m%60);return 'day '+d+' '+(h<10?'0':'')+h+':'+(mm<10?'0':'')+mm;};
let textAt=-1e9;
function text(now){if(now-textAt<400)return;textAt=now;
 const sea=boats.filter(b=>b.where&&b.where.phase==='sail').map(b=>b.line.id+' '+Math.round(b.where.f*100)+'% to '+b.where.to);
 line.textContent=hm(clockMin())+(st.behind>0?' · the towns at '+hm(S.clock.m)+', catching up':'')+(CIT.town?' · '+CIT.town+': '+CIT.sel.length+' people near':'')+(sea.length?' · at sea: '+sea.join(', '):'');}
/* ---------------------------------------------------------------- each frame */
HOST.TICKS.push((dt,ts)=>{const now=performance.now();
 try{follow();if(now-CIT.at>CIT.every){CIT.at=now;choose();}else if(CIT.sel.length)pose();canoes();if(typeof RINGSEA!=='undefined'&&RINGSEA.tick)RINGSEA.tick(ts);text(now);}
 catch(e){if(st.errors.length<5)st.errors.push(String(e&&e.stack?e.stack:e));}});
/* ---------------------------------------------------------------- verify.py's checks */
function citizensCheck(o){o=o||{};choose();const t=poseT(),M=new THREE.Matrix4(),P=new THREE.Vector3(),Qq=new THREE.Quaternion(),Sc=new THREE.Vector3(),f=CIT.focus;
 if(o.shift&&CIT.sel.length){CIT.mesh.getMatrixAt(0,M);M.decompose(P,Qq,Sc);P.x+=50;M.compose(P,Qq,Sc);CIT.mesh.setMatrixAt(0,M);}
 const bad=[];let far=0,hid=0;const n=CIT.mesh.count;
 for(let i=0;i<n;i++){const a=CIT.sel[i],p=SIM.pose(a,t);CIT.mesh.getMatrixAt(i,M);M.decompose(P,Qq,Sc);
  if(Math.hypot(P.x-p.x,P.y-p.y,P.z-p.z)>.5)bad.push(a.id);if(p.hidden||Sc.x===0)hid++;if(Math.hypot(P.x-f.x,P.z-f.z)>CIT.radius+1)far++;}
 if(o.shift){CIT.t=null;pose();}
 return{ok:n>0&&n<=CIT.cap&&!bad.length&&!far&&!hid,detail:(CIT.town||'no town')+': '+n+' drawn (cap '+CIT.cap+', '+CIT.stats.near+' within '+CIT.radius+' m, '+CIT.stats.hidden+' of them indoors)'+
  (bad.length?'; NOT AT THEIR POSE: '+bad.slice(0,3).join(', '):'')+(far?'; '+far+' beyond the radius':'')+(hid?'; '+hid+' hidden ones drawn':'')};}
function canoesCheck(o){o=o||{};canoes();if(o.shift&&boats.length)boats[0].g.position.x+=500;
 const bad=[],seen=[],m=S.clock.m+st.frac;
 boats.forEach(b=>{const C=b.R.carriers[b.k],g=b.g;if(!g.visible){bad.push(b.line.id+b.k+' not drawn');return;}
  if(C.phase==='sail'){const from=b.R.stops[C.from].settlement,P=routeOf(b.key),A=W.along(P,Math.min(1,Math.max(0,(m-C.departs)/Math.max(1,C.eta-C.departs))),from!==order[0]);
   const d=Math.hypot(g.position.x-A.x,g.position.z-A.z),wet=WORLD.lakeWater(g.position.x,g.position.z)-WORLD.H(g.position.x,g.position.z);
   if(d>1)bad.push(b.line.id+b.k+' '+d.toFixed(0)+' m off its route');if(!(wet>W.SEA.shoal))bad.push(b.line.id+b.k+' on land ('+wet.toFixed(1)+' m of water)');seen.push(b.line.id+b.k+' under way');}
  else{const s=b.R.stops[C.at].settlement,B=berthOf(s,b.key),d=Math.hypot(g.position.x-B.x,g.position.z-B.z);if(d>60)bad.push(b.line.id+b.k+' '+d.toFixed(0)+' m from its berth');seen.push(b.line.id+b.k+' docked at '+s);}});
 if(o.shift)canoes();
 return{ok:boats.length>=3&&!bad.length,detail:boats.length+' carriers: '+seen.join(', ')+(bad.length?'; WRONG: '+bad.join('; '):'')};}
function routeCheck(o){o=o||{};const out=[];Object.keys(stops).length&&boats.forEach(b=>{if(out.some(r=>r.key===b.key))return;const a=berthOf(order[0],b.key),c=berthOf(order[1],b.key);
  const P=o.straight?{pts:[[a.x,a.z],[c.x,c.z]],ok:true,len:Math.hypot(c.x-a.x,c.z-a.z)}:routeOf(b.key);let dry=0,n=0;
  for(let i=1;i<P.pts.length;i++){const p=P.pts[i-1],r=P.pts[i],L=Math.hypot(r[0]-p[0],r[1]-p[1]),k=Math.ceil(L/200);
   for(let j=1;j<k;j++){n++;const x=p[0]+(r[0]-p[0])*j/k,z=p[1]+(r[1]-p[1])*j/k;if(WORLD.lakeWater(x,z)-WORLD.H(x,z,W.SEA.cell)<=W.SEA.shoal)dry++;}}
  out.push({key:b.key,ok:P.ok,dry,n,len:P.len,straight:Math.hypot(c.x-a.x,c.z-a.z),legs:P.pts.length-1});});
 return{ok:out.length>0&&out.every(r=>r.ok&&!r.dry&&r.len<r.straight*1.8),detail:out.map(r=>r.key+': '+(r.len/1000).toFixed(1)+' km in '+r.legs+' legs (straight '+(r.straight/1000).toFixed(1)+' km), '+r.dry+' of '+r.n+' samples dry').join('; ')};}
function clockCheck(o){o=o||{};CL.set(CL.hour+.25);follow(Infinity);const want=Math.floor(clockMin())+(o.off?60:0);
 return{ok:S.clock.m===want,detail:'the clock at '+hm(clockMin())+', the towns at '+hm(S.clock.m)+(o.off?' (read an hour off)':'')+'; '+st.ran+' minutes run on the clock so far'};}
st.ms=Math.round(performance.now()-t0);
window._isleLife={stats:st,follow,poseT,citizens:()=>({town:CIT.town,sel:CIT.sel.length,stats:CIT.stats}),canoes:()=>boats.map(b=>({line:b.line.id,k:b.k,where:b.where})),
 checks:{citizens:citizensCheck,canoes:canoesCheck,route:routeCheck,clock:clockCheck}};
return{follow,poseT,boats,CIT,stats:st};})();});
