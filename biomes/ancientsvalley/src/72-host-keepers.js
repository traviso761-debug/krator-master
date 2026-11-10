// ================================================================= HOST - the keepers (feral robots at a thousand-year routine)
// [web] PLAN.md section 6 and section 12's station-0 vision: "a keeper robot at its routine". kits/mechs read as a bundle (39k: the Ancients,
// culture `ancient`, built by the session valley-robots on 2026-11-09 from the robo folder: the porter of the Hoist's lineage, a crane that
// loads nothing; the hovering watcher; the lamplighter with its dead lantern; the sweeper; the spidery gardener; and the hunters, the stilt
// tripod among them). Each keeper walks a round of one avenue block near a view's eye and at its corners plays its ROUTINE (the kit's attack
// clip of a keeper variant: the sweep, the load of nothing, the lamp lit once, the pruning), then goes on; the tripod stalks a round by the
// lake. They come rusted from the seed (ANC.wear): avRust is for an Iziz machine only. The rounds are lattice records (the block's four
// avenue corners); the walk is the kit's gait on the page's ground. The feigners (a keeper's last variant, docile until the moment) are the
// game's to place.
/* THE WALKERS' WAY ROUND THINGS (the owner, 2026-11-09: "robots need to respect collision with things eg highway pillars"): one obstacle set for
   every walker on the page (the keepers here, the extraplanar hunters in 75), made on the first frame (the wrecks, 73, come after this fragment):
   the highway's and the pax line's standing piers, their fallen decks, the train cars and the wrecks as discs on core/space, the Engines as
   discs, the towers' plinths as their turned rectangles (STAGE.pads). AV_AVOID.steer(g, want, R) bends a heading away from what lies within the
   walker's reach ahead; AV_AVOID.push(g, R) puts a walker that ends inside something back out at its edge. R: the walker's body radius */
const AV_AVOID=(function(){let IX=null;const out={discs:0,
 index(){if(IX)return IX;IX=KSPACE.create({cell:60});const add=(x,z,r,kind)=>{IX.insert({x,z,r,kind},x,z,r);out.discs++;};const T=STAGE.transit;
  const deck=(S,w)=>{if(!S.fall)return;const n=Math.max(1,Math.ceil(S.len/6)),fx=Math.sin(S.fall.yaw),fz=Math.cos(S.fall.yaw);for(let i=0;i<n;i++){const t=(i+.5)/n-.5;add(S.fall.x+fx*t*S.len,S.fall.z+fz*t*S.len,w/2+.5,'deck');}};
  if(T){const lines=[T.highway].concat(T.highway?T.highway.ramps:[]).concat([T.pax]).filter(Boolean);
   lines.forEach(L=>{(L.piers||[]).forEach(p=>{if(p.state!=='none')add(p.x,p.z,L===T.pax?1.8:2.8,'pier');});(L.spans||[]).forEach(S=>deck(S,S.width||L.width||10));});
   (T.trains||[]).forEach(tr=>(tr.cars||[]).forEach(c=>{const n=Math.max(1,Math.ceil(c.len/4)),fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);for(let i=0;i<n;i++){const t=(i+.5)/n-.5;add(c.x+fx*t*c.len,c.z+fz*t*c.len,c.w/2+.3,'car');}}));}
  (STAGE.engines||[]).forEach(E=>add(E.x,E.z,E.r,'engine'));
  if(typeof AVW!=='undefined'&&AVW.records)AVW.records.forEach(r=>add(r.x,r.z,Math.max(r.w||2,r.d||4)/2,'wreck'));return IX;},
 /* the nearest point of everything within `reach` of (x, z), each as [px, pz, its own radius to subtract] */
 near(x,z,reach,acc){acc.length=0;const q=[];this.index().query(x,z,reach,q);for(const o of q)acc.push([o.x,o.z,o.r]);
  q.length=0;STAGE.pads.query(x,z,reach,q);for(const P of q){if(P.family==='engine')continue;const dx=x-P.x,dz=z-P.z,u=dx*P.c+dz*P.s,v=-dx*P.s+dz*P.c,cu=Math.max(-P.rx,Math.min(P.rx,u)),cv=Math.max(-P.rz,Math.min(P.rz,v));
   acc.push([P.x+cu*P.c-cv*P.s,P.z+cu*P.s+cv*P.c,0]);}return acc;},
 steer(g,want,R){const x=g.position.x,z=g.position.z,reach=R+14,A=this.near(x,z,reach,this._a||(this._a=[]));let vx=Math.sin(want),vz=Math.cos(want);
  for(const [px,pz,r] of A){const dx=x-px,dz=z-pz,d=Math.hypot(dx,dz)-r;if(d>=reach-R)continue;const ahead=-(dx*Math.sin(want)+dz*Math.cos(want));if(ahead<-r-2)continue;   /* behind: no matter */
   const w=2.2*(1-Math.max(0,d-R)/(reach-R)),l=Math.hypot(dx,dz)||1;vx+=dx/l*w;vz+=dz/l*w;}return Math.atan2(vx,vz);},
 push(g,R){const A=this.near(g.position.x,g.position.z,R+4,this._b||(this._b=[]));let n=0;for(const [px,pz,r] of A){const dx=g.position.x-px,dz=g.position.z-pz,l=Math.hypot(dx,dz),d=l-r;if(d<R&&l>1e-3){g.position.x+=dx/l*(R-d);g.position.z+=dz/l*(R-d);n++;}}return n;}};
 return out;})();
/* a walker's body radius: its plan box's half-width, a little under (a hunter's feet stand wide of its body) */
const avBodyR=g=>{const b=new THREE.Box3().setFromObject(g);return Math.max(1,Math.min(6,.42*Math.max(b.max.x-b.min.x,b.max.z-b.min.z)));};
const AV_KEEPERS=(function(){if(typeof KratorMechs==='undefined')return [];const L=STAGE.lattice,A=STAGE.avenueLines(),out=[];
 const toXZ=(u,v)=>[u*L.c-v*L.s,u*L.s+v*L.c],toUV=(x,z)=>[x*L.c+z*L.s,-x*L.s+z*L.c];
 /* the avenue block round (cx, cz): the two avenue lines about it each way, its four corners on dry ground; failing that, the next block out */
 const round=(cx,cz)=>{const uv=toUV(cx,cz);for(let tr=0;tr<6;tr++){const du=tr*L.pitch*3*(tr%2?1:-1),u=uv[0]+du,v=uv[1];
   let i=A.findIndex(a=>a>u);if(i<1)continue;const u0=A[i-1],u1=A[i];let j=A.findIndex(a=>a>v);if(j<1)continue;const v0=A[j-1],v1=A[j];
   const R=[toXZ(u0,v0),toXZ(u1,v0),toXZ(u1,v1),toXZ(u0,v1)];if(R.every(p=>Math.hypot(p[0],p[1])<STAGE.R-200&&terrainH(p[0],p[1])>STAGE.lakeY+2&&STAGE.F.scar(p[0],p[1])<.9))return R;}return null;};
 const mk=(key,cx,cz,seed,variant)=>{const route=round(cx,cz);if(!route)return;let g;try{g=KratorMechs.build(key,{seed,variant:variant|0,bare:true});}   /* bare: no rider, no regalia (the owner, 2026-11-09: these are the Ancients' machines, not the Iziz's) */catch(e){reportErr('keeper '+key+': '+(e.message||e));return;}
  if(/^iz_/.test(key))avRust(g,'keeper.broken');g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=!!MP.shadow;m.userData.host=true;m.userData.inspectLabel='a keeper at its round: '+g.userData.name;}});
  const i0=seed%4,p0=route[i0];g.position.set(p0[0],terrainH(p0[0],p0[1]),p0[1]);const p1=route[(i0+1)%4];g.rotation.y=Math.atan2(p1[0]-p0[0],p1[1]-p0[1]);scene.add(g);
  KratorMechs.update(g,0,{ground:terrainH});KratorMechs.setState(g,'walk');
  const cx0=(route[0][0]+route[2][0])/2,cz0=(route[0][1]+route[2][1])/2,gs=route.map(p=>terrainH(p[0],p[1])),g0=Math.min(...gs),g1=Math.max(...gs);REGISTER({name:'a keeper at its round: '+g.userData.name,kind:'keeper',x:cx0,z:cz0,y:g0-3,r:Math.hypot(route[0][0]-cx0,route[0][1]-cz0)+30,h:g1-g0+(g.userData.h==null?6:g.userData.h)+8,tags:{kind:'keeper',mech:key,corners:route.length}});
  const role=KratorMechs.roleOf?KratorMechs.roleOf(key,variant|0):null;out.push({g,key,role,route,i:(i0+1)%4,wait:0,seed,R:avBodyR(g),best:1e9,stall:0});};
 /* the porter (crane) on the Overlook's line of sight (800 m out), the watcher before the residential street's eye, the lamplighter on the shelf's
    south-east, the sweeper at the dead lobe's edge, the gardener in the park gone feral, the tripod on its round by the lake's war */
 const N=STAGE.near,PV=STAGE.views()['A park gone feral'];mk('an_porter',-300,700,11,0);mk('an_watcher',N.x-300,N.z+380,12,0);mk('an_lamplighter',900,900,13,0);mk('an_sweeper',1250,-120,14,0);
 if(PV)mk('an_gardener',PV[3],PV[5],15,0);mk('an_tripod',-600,1250,16,0);
 const clock={t:performance.now()};
 tick(function(){const now=performance.now(),dt=Math.min(.1,(now-clock.t)/1000);clock.t=now;if(dt<=0)return;
  for(const k of out){const g=k.g,T=k.route[k.i],dx=T[0]-g.position.x,dz=T[1]-g.position.z,d=Math.hypot(dx,dz);
   if(k.wait>0){k.wait-=dt;if(k.wait<=0)KratorMechs.setState(g,'walk');}
   else if(d<3+k.R*.5||k.stall>25){k.i=(k.i+1)%k.route.length;k.best=1e9;k.stall=0;let len=0;if(k.role==='keeper'&&KratorMechs.attack){try{const n=KratorMechs.attack(g);len=n==null?0:n;}catch(e){len=0;}}   /* the routine at the corner; a corner it cannot reach for 25 s (a pier stands on it) is given up */
    k.wait=len+3+4*KRAND.unit(KRAND.hash(k.seed,k.i,7,0));if(!len)KratorMechs.setState(g,'idle');}
   else{const want=AV_AVOID.steer(g,Math.atan2(dx,dz),k.R);let a=want-g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));g.rotation.y+=Math.max(-1.1*dt,Math.min(1.1*dt,a));
    const sp=KratorMechs.speed(g)*Math.max(0,Math.cos(a));g.position.x+=Math.sin(g.rotation.y)*sp*dt;g.position.z+=Math.cos(g.rotation.y)*sp*dt;
    if(d<k.best-.5){k.best=d;k.stall=0;}else k.stall+=dt;}
   AV_AVOID.push(g,k.R);g.position.y=terrainH(g.position.x,g.position.z);KratorMechs.update(g,dt,{ground:terrainH});}
  /* the follow mode (the owner, 2026-11-09): the camera rides behind and above the chosen keeper, through the host's own view setter */
  const F=AV_FOLLOW,rd=F.i!=null?F.riders()[F.i]:null;if(rd&&typeof KHOST!=='undefined'&&KHOST.setView){const g=rd.g,h=g.userData.h==null?6:g.userData.h,back=Math.max(14,h*3.2),up=h*1.3+3;
   const tx=g.position.x,ty=g.position.y+h*.55,tz=g.position.z,wx=tx-Math.sin(g.rotation.y)*back,wy=g.position.y+up,wz=tz-Math.cos(g.rotation.y)*back;
   if(!F.cam)F.cam=[wx,wy,wz];const k=Math.min(1,dt*2.5);F.cam[0]+=(wx-F.cam[0])*k;F.cam[1]+=(wy-F.cam[1])*k;F.cam[2]+=(wz-F.cam[2])*k;
   const gy=terrainH(F.cam[0],F.cam[2])+2;if(F.cam[1]<gy)F.cam[1]=gy;KHOST.setView(F.cam[0],F.cam[1],F.cam[2],tx,ty,tz);}});
 return out;})();
/* R rides with the next keeper (the first on the first press, none after the last); Escape, a drag or the wheel lets go. AV_FOLLOW.follow(i|null) does the same.
   The riders are the keepers, then whatever a later fragment pushes to AV_FOLLOW.more (75: the extraplanar hunters), each a {g} walking on the page */
const AV_FOLLOW={i:null,cam:null,more:[],riders(){return AV_KEEPERS.concat(this.more);},follow(i){const rd=this.riders();this.i=(i==null||!rd[i])?null:i;this.cam=null;if(this.i!=null)console.log('riding with '+rd[this.i].g.userData.name);return this.i;}};
window.addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='r'||e.key==='R'){const n=AV_FOLLOW.riders().length;if(!n)return;AV_FOLLOW.follow(AV_FOLLOW.i==null?0:(AV_FOLLOW.i+1<n?AV_FOLLOW.i+1:null));}else if(e.key==='Escape')AV_FOLLOW.follow(null);});
['pointerdown','wheel'].forEach(ev=>window.addEventListener(ev,e=>{if(AV_FOLLOW.i!=null&&e.target&&e.target.tagName==='CANVAS')AV_FOLLOW.follow(null);},{passive:true}));
