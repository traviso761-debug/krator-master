// ================================================================= PHĒR — the build: every building of the plan, chunk by chunk
// The plan's records (89zp: both levels' lots, the civic pieces, the stalls on the avenue's turns) drawn with the Xanadu
// kit (VERN.place), each chunk baked into its own group and drawn while it is in view and in range (Qiblai's runtime LOD).
// A builder draws a record; it decides nothing. [web]: three.js.
reseed(PH.SEED+2);const PH_B0=performance.now();
const phD=(v,d)=>v==null?d:v;
const PH_CHUNK=300,PH_CHUNKS={};
for(const p of PH_PLACE){const k=p.kind==='civic'?'civic:'+p.level:p.kind==='stall'?(p.daily?'stall:daily':'stall:fair'):Math.floor(p.x/PH_CHUNK)+','+Math.floor(p.z/PH_CHUNK);(PH_CHUNKS[k]=PH_CHUNKS[k]||[]).push(p);}
const PH_GROUPS=[];let PH_INST=0;const PH_FAILS=[];
// a basement's door from the podium (89zp: core/city KCITY.hillside.basement, where the slope fits a whole storey under the
// floor): in the podium's face at its middle (the building's own footprint, fw x fd, not its plot), level with the ground
// there, a dark leaf in stone jambs under a timber lintel, a step of stone before it and two small barred windows beside
// it; set on the podium's battered face at the door's height (kits/xanadu xnFooting: an xBatS92 wedge, its base fw + 0.3
// drop wide, 92 % of that at the top), drawn in world metres
const PH_BDOOR={w:1.3,h:2.2},PH_BASE=[],PH_FLIGHTS=[];
function phBasementDoor(p){const D=p.basement.door,a=D.ry,ox=Math.sin(a),oz=Math.cos(a),dep=p.o.y-D.y,dr=Math.max(.1,p.o.drop),F=p.basement.foot||{hw:p.bo.hw,hd:p.bo.hd};
 /* core/city's door point is on the footprint's face (fw/2 out); the podium's face at the door's height stands out by its batter */
 const ux=p.bo.u[0],uz=p.bo.u[1],half=Math.abs(ox*ux+oz*uz)>.7?F.hw:F.hd,face=(2*half+.3*dr)/2*(1-.08*Math.max(0,1-dep/dr)),push=face-half+.04;
 const x=D.x+ox*push,z=D.z+oz*push,y=D.y,W=PH_BDOOR.w,Hh=PH_BDOOR.h,dark=xC(0x2a2018),stone=xC(xPick(XPAL.stone)),wood=xC(0x6a4a30);
 vB('vStone',x,y,z,W,Hh,.1,a,dark);
 for(const s of[-1,1])vB('vStone',x+Math.cos(a)*s*(W/2+.18),y,z-Math.sin(a)*s*(W/2+.18),.36,Hh+.1,.22,a,stone);
 vB('vStone',x,y+Hh+.05,z,W+.9,.26,.3,a,wood);
 vB('vStone',x+ox*.55,y-.22,z+oz*.55,W+1.1,.24,1.0,a,stone);
 const span=Math.abs(ox*ux+oz*uz)>.7?F.hd:F.hw;if(span>3.6)for(const s of[-1,1])vB('vStone',x+Math.cos(a)*s*2.6,y+1.25,z-Math.sin(a)*s*2.6,.55,.7,.1,a,dark);}
function phBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}catch(e){PH_FAILS.push(p.key+': '+(e&&e.message||e));}
  if(g)p.G=g;else PH_FAILS.push(p.id+' '+p.key+': not placed');
  p.reg=[r0,REG.length];if(g&&p.basement&&p.basement.door)PH_BASE.push(p);   /* its basement door waits for the flights (below) */
  for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,phD(p.o.y,0)-phD(p.drop,0));y1=Math.max(y1,phD(p.o.y,0)+phD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();PH_INST+=phD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key.startsWith('civic')?1e9:2600,n:list.length};PH_GROUPS.push(e);return e;}
for(const k of Object.keys(PH_CHUNKS).sort())phBakeChunk(k,PH_CHUNKS[k]);
window._instances=PH_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const phFr=new THREE.Frustum(),phPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();phPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);phFr.setFromProjectionMatrix(phPm);const P=camera.position;let shown=0;
 for(const e of PH_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&phFr.intersectsSphere(e.sphere)&&(e.key!=='stall:fair'||PH_FAIR_TODAY);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu biome over the town's mask (89zp: the ravine, the headland, the wall's grass, a tree in a yard),
// then baked with the builders' own plants (xaPlant: the houses' garden trees); its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1700,quality:.8,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
// ---------------------------------------------------------------- the entry flights: a door above its street gets its steps
// On the wall (7 degrees) core/city's 'high' stance sets a house's floor at its plot's highest corner, so a door on the
// downhill face stands above the ground in front of it (up to ~2 m): a walker cannot step up to it (the interiors' audit,
// tools/ix_reach_audit.js, steps 0.45 m). Every door of the town (KDOOR.list, the kit's doors, locked or not) whose sill is
// more than PH_FLIGHT_MIN over the ground 0.3 m in front of it gets a stone flight straight out from it: 0.17 m risers on
// 0.3 m treads down to the ground, as wide as the door and a little more. Drawn as one merged mesh (THREE boxes: a builder's
// drawing, not a placement decision: the door decides where), and each flight a rising strip in core/walk (KWALK.strip), so
// the walker and the audit go up it. window._pher.flights counts them.
const PH_FLIGHT_MIN=.3;
(function phFlights(){if(typeof KDOOR==='undefined'||!KDOOR.list)return;const boxes=[],T3=THREE;let n=0,tall=0;
 for(const D of KDOOR.list){const ox=Math.sin(D.yaw),oz=Math.cos(D.yaw),sx=D.at[0]+ox*.3,sz=D.at[2]+oz*.3;
  let gy=phH(sx,sz),rise=D.at[1]-gy;if(!(rise>PH_FLIGHT_MIN)||rise>4)continue;
  let run=rise/.17*.3;gy=phH(sx+ox*run,sz+oz*run);rise=D.at[1]-gy;if(!(rise>PH_FLIGHT_MIN)||rise>4)continue;run=rise/.17*.3;   // the foot's own ground
  const steps=Math.max(2,Math.round(rise/.17)),w=Math.max(1.2,(D.w==null?1:D.w)+.6);
  for(let k=0;k<steps;k++){const d=.3+(k+.5)*run/steps,h=rise*(steps-k)/steps;boxes.push([sx-ox*.3+ox*d,gy+h/2-.15,sz-oz*.3+oz*d,w,h+.3,run/steps+.02,D.yaw]);}
  if(typeof KWALK!=='undefined')KWALK.strip({a:[sx+ox*run,sz+oz*run,gy],b:[sx,sz,D.at[1]],w,name:'flight:'+D.id,tag:'pher.flight'});
  PH_FLIGHTS.push({a:[sx-ox*.3,sz-oz*.3],b:[sx+ox*run,sz+oz*run],w});
  n++;if(rise>1.2)tall++;}
 if(boxes.length){const geo=new T3.BoxGeometry(1,1,1),M=new T3.InstancedMesh(geo,new T3.MeshStandardMaterial({color:0x9a8f80,roughness:.9}),boxes.length),m4=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler();
  boxes.forEach((b,i)=>{q.setFromEuler(e.set(0,b[6],0));m4.compose(new T3.Vector3(b[0],b[1],b[2]),q,new T3.Vector3(b[3],b[4],b[5]));M.setMatrixAt(i,m4);});
  M.instanceMatrix.needsUpdate=true;M.name='entry flights';M.userData.probeSkip=true;scene.add(M);}
 window._pher.flights={n,tall,steps:boxes.length};})();
// ---------------------------------------------------------------- the basements' doors, after the flights
// The owner (2026-11-17): "basement doors shouldn't cut off stairs. if there is any question of an individual basement
// slipping into architecture or not aligning to the ground properly, chuck it from its podium". core/city kept a door only
// off its house's front, on ground that fits it, clear of other podiums and of stairs and paths; here the page drops it
// too when the door and the 2.5 m before it (3.6 m wide) meet an entry flight, when a kit door (any house's) stands within
// 3.5 m of it at its level or above, or when a registered part of its own house stands outside its plot near it (a stair,
// a porch, a balcony's posts). The podium stays whole: only the door goes. The rest are drawn into one group.
(function phBasements(){const why={flight:0,door:0,architecture:0};let drawn=0;
 const inZone=(q,D,out)=>{const dx=q[0]-D.x,dz=q[1]-D.z,o=dx*out[0]+dz*out[1],l=dx*out[1]-dz*out[0];return o>-.6&&o<2.5&&Math.abs(l)<1.8;};
 const G=new THREE.Group();G.name='basement doors';scene.add(G);
 for(const p of PH_BASE){const D=p.basement.door,out=[Math.sin(D.ry),Math.cos(D.ry)];let bad=null;
  for(const F of PH_FLIGHTS){if(bad)break;const L=Math.hypot(F.b[0]-F.a[0],F.b[1]-F.a[1])||1,n=Math.ceil(L/.4),ax=(F.b[0]-F.a[0])/L,az=(F.b[1]-F.a[1])/L;
   for(let k=0;k<=n&&!bad;k++)for(const s of[-1,0,1]){const t=k*L/n,q=[F.a[0]+ax*t-az*s*F.w/2,F.a[1]+az*t+ax*s*F.w/2];if(inZone(q,D,out)){bad='flight';break;}}}
  if(!bad&&typeof KDOOR!=='undefined'&&KDOOR.list)for(const K of KDOOR.list)if(Math.hypot(K.at[0]-D.x,K.at[2]-D.z)<3.5&&K.at[1]>D.y-.5){bad='door';break;}
  if(!bad&&p.reg){const b=p.bo,v=[-b.u[1],b.u[0]];for(let i=p.reg[0];i<p.reg[1]&&!bad;i++){const R=REG[i],dx=R.x-b.c[0],dz=R.z-b.c[1],lu=dx*b.u[0]+dz*b.u[1],lv=dx*v[0]+dz*v[1];
   if((Math.abs(lu)>b.hw+.3||Math.abs(lv)>b.hd+.3)&&Math.hypot(R.x-D.x,R.z-D.z)<4+(R.r||0))bad='architecture';}}
  if(bad){why[bad]++;p.basement.door=null;p.basement.why=bad;continue;}
  phBasementDoor(p);drawn++;}
 kbake(G);for(const n in KIT.items)KIT.items[n].length=0;G.userData.probeSkip=false;
 window._pher.basements={carved:PH_PLACE.filter(p=>p.basement).length,doors:drawn,dropped:why};})();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=PH_GROUPS.length;window._buildMs=Math.round(performance.now()-PH_B0);
Object.assign(window._pher,{day:PH_DAY,fairDay:PH_FAIR_TODAY,chunks:PH_GROUPS.length,fails:PH_FAILS.slice(0,20),failed:PH_FAILS.length,
 byKind:PH_PLACE.reduce((a,p)=>{a[p.kind]=phD(a[p.kind],0)+1;return a;},{}),byLevel:PH_PLACE.reduce((a,p)=>{a[p.level]=phD(a[p.level],0)+1;return a;},{})});
