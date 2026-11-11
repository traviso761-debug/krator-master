// ================================================================= OUTLANDS — the colonies placed: forms by role on the colony pass
// PLAN.md section 4, "Placement": (1) the colony records, seeded per cell and registered in core/tags before anything is drawn;
// (2) their territories, a weighted Voronoi clipped to each type's ground (OUTLCOL, 48); (3) the seams between them, kept clear;
// (4) each form placed inside its own colony's territory by its ROLE:
//   collector  spread through the territory           drinker  toward the wet side (into the fog, along the water)
//   breeder    toward the colony's centre             runner   at the cords' far end: ground the colony reaches but cannot feed on
//   warden     on the seam, its own colony's side     miner    on the ore (a copper or turquoise bed showing, the pit, the spoil)
// Every candidate comes from BIO.grid's cell form (KRAND by cell and salt, never draw order): adding a form moves nothing else.
// Each instance's inspector label names its colony (BIO.put's per-instance label), so a click says which organism it belongs to.
(function(){const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const PAL=OUTL.PAL,C=OUTL.C,FG=BIO.fung,T3=BIO.host.THREE;
// the top of a stalk H high leaning by its quaternion q: what stands on it (a cap, a fringe, the pods) is placed there, on the stalk as drawn
const topOf=(q,H)=>new T3.Vector3(0,H,0).applyQuaternion(q);
const Fd=n=>(x,z)=>BIO.field(n,x,z);
const fog=Fd('fog'),mast=Fd('mast'),dry=Fd('dry'),wadiX=Fd('wadiX'),oreX=Fd('oreX'),seep=Fd('seep'),rock=Fd('rock'),slope=Fd('slope'),band=Fd('band');
const Y=(x,z)=>BIO.terrainH(x,z);
const col=(set,k)=>{const c=C(pick(set));if(k!=null)c.multiplyScalar(k);c.offsetHSL((rng()-.5)*.03,(rng()-.5)*.06,(rng()-.5)*.05);return c;};

// ---------------------------------------------------------------- the ground each type may hold (PLAN.md section 3's zones on this slope)
// 2: the core (it feeds there), 1: the reach (its cords only), 0: not. The wadi's floor is the wadi colony's alone.
// The wadi's floor and banks are the wadi colony's alone (floor its core, banks its reach); its fan is shared ground. The mast and copper
// cores overlap a little (2.93-3.0 km), so the two meet in a seam, as the veil and mast cores do at the belt's foot.
// A later station (stations/<name>/45-host-stage.js) hands each of its types a ZONE field, z_<type> (0..1): over .5 the type's core, over .15
// its reach; a z_wadi over .15 is the wadi colony's alone. Station 1 hands none and keeps its own rule below.
const HF=()=>BIO.host.fields||{},hasZ=t=>typeof HF()['z_'+t]==='function';
const Z=(t,x,z)=>BIO.field('z_'+t,x,z);
function allowZ(t,x,z){if(t!=='wadi'&&hasZ('wadi')&&Z('wadi',x,z)>.15)return 0;const v=Z(t,x,z);return v>.5?2:v>.15?1:0;}
function allow(t,x,z){if(hasZ(t))return allowZ(t,x,z);const w=wadiX(x,z);
 if(t==='wadi')return w>=.99?2:w>=.5?1:0;
 if(w>=.5)return 0;
 if(t==='veil'){const f=fog(x,z);return f>.5?2:(f>.06||band(x,z)>=.9)?1:0;}
 if(t==='mast')return mast(x,z)>.28&&fog(x,z)<.62?2:0;
 if(t==='copper')return dry(x,z)>.35?2:0;
 return 0;}
OUTL.allow=allow;
// the station's colony types (the host may set OUTL.STATION_TYPES before the build; station 1's four by default) and its size factors
OUTL.STATION_TYPES=['veil','mast','copper','wadi'];
OUTL.SIZE={};

// OUTL.SEEDS (the host's): colonies seeded where a cell's chance cannot find their ground, [{id, x, z, type}] (the wadi colonies along
// their channels: a 10 m floor is rarely hit by a seed jittered in a 220 m cell). Each is a colony like the others, aged by hash.
// the colony map alone (no puts): the host's ground paints its seams from it before the build (84-host-ground.js)
OUTL.colonyMap=function(R){if(OUTL.COLONY&&OUTL.COLONY._R===R)return OUTL.COLONY;
 const SH=OUTL.SHARE||{},types=OUTL.STATION_TYPES.map(k=>({key:k,reach:(OUTL.REACH||{})[k]||OUTL.byType[k].reach,share:SH[k]!=null?SH[k]:k==='wadi'?3:1}));
 const M=OUTLCOL.create({seed:KRAND.child(BIO.host.seed>>>0,'outl:colonies'),box:[-R,-R,R,R],cell:OUTL.CELL||220,p:.8,types,allow,seamW:[2,8],warp:24,seeds:OUTL.SEEDS||[]});
 M._R=R;OUTL.COLONY=M;return M;};
OUTL.buildColonies=function(R,q,opt){opt=opt||{};
 const M=OUTL.colonyMap(R);
 // (1) the records, before anything is drawn: one core/tags feature per colony (kind 'colony'), at its seed, its reach its radius
 const inMap=M.colonies.filter(c=>Math.abs(c.x)<R+c.R&&Math.abs(c.z)<R+c.R);
 inMap.forEach(c=>{c.rec=BIO.record({kind:'colony',key:'colony:'+c.id,name:OUTL.byType[c.type].name+' '+c.id,x:c.x,y:Y(clamp(c.x,-R,R),clamp(c.z,-R,R)),z:c.z,r:c.R,h:60});});
 const A={},count={},forms=[];
 OUTL.PLACED=count;OUTL.INST=forms;
 const lab=(S,c)=>S.name+' (the '+OUTL.byType[c.type].name.toLowerCase()+' '+c.id+')';
 const note=(S,c,x,z,y,extra)=>{count[S.key]=(count[S.key]||0)+1;forms.push(Object.assign({key:S.key,role:S.role,type:c.type,colony:c.id,x,z,y},extra||{}));};
 // a role's candidates: inside its colony type's territory at the right level, off the seam by the form's own radius (r), or ON
 // it for a warden. score(x,z,A) the role's weight. Returns BIO.grid's count.
 function pass(S,cell,score,fn,o){o=o||{};const T=S.type,warden=S.role==='warden',lvl=S.role==='runner'?1:2,r=o.r||0;
  return BIO.grid('outl:'+S.key,cell,(x,z)=>{M.at(x,z,A);const c=A.c;if(!c||c.type!==T)return 0;
    if(warden){if(!A.seam||A.level!==2)return 0;}else{if(A.seam||A.gap<r+.5)return 0;if(!o.both&&A.level!==lvl)return 0;}
    return score(x,z,A);},
   (x,y,z,seed)=>{M.at(x,z,A);const c=A.c;if(!c)return;fn(x,y,z,c,A,seed);},Object.assign({box:[-R,-R,R,R],patch:o.patch==null?.4:o.patch},o.cliff?{cliff:true}:{},o.grid||{}));}
 const F=OUTL.byKey,Q=q==null?1:q,has=t=>OUTL.STATION_TYPES.indexOf(t)>=0;

 // ======================================================== THE VEIL COLONY (the fog wall)
 if(has('veil')){
 // the veil cap: drinker. Toward the wet side: the thickest fog; the old colonies' caps the tallest
 BIO.range=null;
 pass(F.veilcap,34/Math.sqrt(Q),(x,z,A)=>clamp((fog(x,z)-.45)*2.2,0,1)*(.55+.45*A.c.age),(x,y,z,c,A)=>{
  const H=rr(10,16)*(.8+.2*c.age),r=rr(.35,.55),cr=rr(2,3.5),L=rr(.35,.55)*H,y0=y-.3,ry=rr(0,TAU),q0=qEuler(rr(-.04,.04),ry,rr(-.04,.04)),S=F.veilcap,lb=lab(S,c);
  BIO.put('stalk',[x,y0,z],q0,[r/.08,H,r/.08],col(PAL.flesh),{label:lb});const tp=topOf(q0,H);
  BIO.put('vcap',[x+tp.x,y0+tp.y,z+tp.z],qEuler(rr(-.05,.05),ry,rr(-.05,.05)),[cr,cr*rr(.9,1.1),cr],OUTL.LIB.has('cap.violet')?col([0xf0e8f4,0xe8eef4]):col(PAL.veil),{label:lb});
  BIO.put('fringe',[x+tp.x,y0+tp.y-.02*cr,z+tp.z],qEuler(0,ry,0),[cr*.92,L,cr*.92],col(PAL.thread),{label:lb});
  BIO.put('crust',[x,y+.05,z],qEuler(0,ry,0),[cr*.85,1,cr*.85],col(PAL.pelt,.8),{label:S.name+' (its drip ring)'});
  note(S,c,x,z,y,{H,cr});},{r:3.6});
 // the lantern stalk: breeder, toward the centre, in the understorey
 pass(F.lantern,30/Math.sqrt(Q),(x,z,A)=>Math.pow(1-A.u,1.3)*clamp((fog(x,z)-.4)*2,0,1),(x,y,z,c,A)=>{
  const H=rr(4,7),r=rr(.12,.2),y0=y-.2,S=F.lantern,lb=lab(S,c);
  const qs=qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),tp=topOf(qs,H);
  BIO.put('stalk',[x,y0,z],qs,[r/.08,H,r/.08],col(PAL.flesh,1.05),{label:lb});
  for(const p of FG.pods({at:[0,0,0],n:ri(4,6),r:.45,size:[.22,.4],tilt:.55,seed:KRAND.hash(5541,Math.floor(x*4),Math.floor(z*4))}))
   BIO.put('pod',[x+tp.x+p.p[0],y0+tp.y+p.p[1],z+tp.z+p.p[2]],FG.Q(p.q),p.s,col(PAL.lantern),{label:lb});
  note(S,c,x,z,y,{H});},{r:1.2});
 // the fog pelt: collector, the colony's skin (near the eye; the ground's library layer carries it far)
 BIO.range=520;
 pass(F.fogpelt,13/Math.sqrt(Q),(x,z,A)=>clamp((fog(x,z)-.35)*2,0,1)*.8,(x,y,z,c,A)=>{const s=rr(.7,1.8);
  BIO.put('crust',[x,y+.04,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[s,1,s*rr(.7,1)],col(PAL.pelt),{label:lab(F.fogpelt,c)});note(F.fogpelt,c,x,z,y);},{r:.5,patch:.7});
 BIO.range=null;
 // the pleat column: RUNNER, at the cords' far end: the colony's reach (level 1), ground the fog does not feed, farther out the better
 pass(F.pleatcol,30/Math.sqrt(Q),(x,z,A)=>smooth(.25,.75,A.u)*(1-smooth(.1,.4,fog(x,z)))*(.4+.6*smooth(.1,.5,slope(x,z)))*.9,(x,y,z,c,A)=>{
  const H=rr(3,8)*(.75+.25*c.age),r=rr(.45,.9),S=F.pleatcol;
  /* sunk a sixth of its height into a root mat: the column's foot is the lathe's tip */
  BIO.put('crust',[x,y+.05,z],qEuler(0,rr(0,TAU),0),[r*2.6,1,r*2.4],col(PAL.pleat,.6),{label:S.name+' (its root mat)'});
  BIO.put('pleat',[x,y-H*.16,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[r,H/1.4,r],OUTL.LIB.has('pleat.skin')?col([0xe8ecf0,0xdde6ea]):col(PAL.pleat),{label:lab(S,c)});
  note(S,c,x,z,y,{H});},{r:1.2});

 }
 // ======================================================== THE MAST COLONY (the wet band under the belt)
 if(has('mast')){const mz=hasZ('mast')?((x,z)=>Z('mast',x,z)):mast,sz=OUTL.SIZE.mast||1;
 pass(F.deckcap,26/Math.sqrt(Q),(x,z,A)=>(.5+.5*mz(x,z))*(.6+.4*A.c.age),(x,y,z,c,A)=>{
  const H=rr(6,10)*sz,r=rr(.18,.3),y0=y-.25,n=ri(3,4),S=F.deckcap,lb=lab(S,c),bend=rr(-.04,.04);
  BIO.put('stalk',[x,y0,z],qEuler(bend,rr(0,TAU),rr(-.04,.04)),[r/.08,H,r/.08],col(PAL.deckStalk),{label:lb});
  for(let k=0;k<n;k++){const t=.45+.55*k/(n-1),cr=lerp(2.4,1.2,k/(n-1))*rr(.85,1.15)*Math.sqrt(sz);
   BIO.put('dcap',[x+bend*H*t*t,y0+H*t,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[cr,cr*rr(.75,1),cr],col(PAL.deck),{label:lb});}
  note(S,c,x,z,y,{H});},{r:2.6});
 // the curtain weed: drinker, on the wet rock of the seeps (it grows on faces)
 pass(F.curtain,16/Math.sqrt(Q),(x,z,A)=>clamp(seep(x,z)*1.6,0,1)*smooth(.25,.55,slope(x,z)),(x,y,z,c,A)=>{
  const L=rr(1.5,3.5),w=rr(.8,1.6),S=F.curtain;
  BIO.put('fringe',[x,y+L*.7,z],qEuler(0,rr(0,TAU),0),[w,L,w*.5],col(PAL.curtain),{label:lab(S,c)});note(S,c,x,z,y);},{r:.8,cliff:true});
 // the cap-shrub: breeder, toward the centre
 BIO.range=600;
 pass(F.capshrub,16/Math.sqrt(Q),(x,z,A)=>Math.pow(1-A.u,1.1)*.85,(x,y,z,c,A)=>{const S=F.capshrub,lb=lab(S,c),cc=col(PAL.capshrub);
  for(const p of FG.troop({n:ri(2,5),r:.9,size:[.28,.55],flat:[.9,1.2],tilt:.15,seed:KRAND.hash(5543,Math.floor(x*4),Math.floor(z*4))}))
   {if(BIO.mask(x+p.p[0],z+p.p[2])<=0)continue;   /* a troop's cap at the water's edge: none in the water */
   BIO.put('capsm',[x+p.p[0],Y(x+p.p[0],z+p.p[2])-.05,z+p.p[2]],FG.Q(p.q),p.s,cc.clone().offsetHSL(0,0,(p.u-.5)*.08),{label:lb});}
  note(S,c,x,z,y);},{r:1});
 BIO.range=null;
 // the comb mast: WARDEN, on the seam, in lines: every few metres along it, on its own colony's side
 pass(F.combmast,6/Math.sqrt(Math.min(1,Q)),(x,z,A)=>.55,(x,y,z,c,A)=>{
  const H=rr(8,14)*sz,r=rr(.16,.26)*Math.sqrt(sz),y0=y-.25,ry=rr(0,TAU),S=F.combmast,lb=lab(S,c);
  BIO.put('stalk',[x,y0,z],qEuler(rr(-.03,.03),ry,rr(-.03,.03)),[r/.08,H,r/.08*.9],col(PAL.mast),{label:lb});
  for(const p of FG.combs({a:[0,H*.25,0],b:[0,H*.98,0],n:ri(5,8),t0:0,t1:1,size:[2.4*sz,1.1*sz],seed:KRAND.hash(5545,Math.floor(x*4),Math.floor(z*4))}))
   BIO.put('comb',[x+p.p[0],y0+p.p[1],z+p.p[2]],FG.Q(p.q),p.s,col(PAL.comb),{label:lb});
  note(S,c,x,z,y,{H,seam:true,c2:A.c2?A.c2.id:null,c2type:A.c2?A.c2.type:null});});

 }
 // ======================================================== THE COPPER COLONY (the dry gem shoulder)
 if(has('copper')){
 BIO.range=900;
 pass(F.greenfan,20/Math.sqrt(Q),(x,z,A)=>.5*(1-wadiX(x,z))*(.6+.4*A.c.age),(x,y,z,c,A)=>{const S=F.greenfan,lb=lab(S,c),n=ri(1,3);
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,.9):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.45,.9);
   BIO.put(OUTL.LIB.lace?'fan':'bracket',[px,Y(px,pz)-.05,pz],qEuler(-Math.PI/2+rr(-.2,.2),rr(0,TAU),rr(-.15,.15)),[s,s,s*.8],OUTL.LIB.lace?col([0xc8e4d0,0xd4ecd8]):col(PAL.green),{label:lb});}
  note(S,c,x,z,y);},{r:1});
 pass(F.drums,34/Math.sqrt(Q),(x,z,A)=>(.35+.65*(1-A.u))*.8,(x,y,z,c,A)=>{const S=F.drums,lb=lab(S,c);
  BIO.put('crust',[x,y+.05,z],qEuler(0,rr(0,TAU),0),[rr(1.6,2.6),1,rr(1.4,2.2)],col(PAL.drum,.7),{label:S.name+' (its root mat)'});
  for(const p of FG.troop({n:ri(3,6),r:1.3,size:[.35,.75],flat:[.9,1.4],tilt:.08,seed:KRAND.hash(5547,Math.floor(x*4),Math.floor(z*4))}))
   BIO.put('drum',[x+p.p[0],Y(x+p.p[0],z+p.p[2])-.1,z+p.p[2]],FG.Q(p.q),p.s,col(p.u<.2?PAL.drumBand:PAL.drum),{label:lb});
  note(S,c,x,z,y);},{r:2});
 // the turquoise shelf: breeder, first onto new rock: the ore, the pit's faces and spoil, bare ledges
 pass(F.tqshelf,9/Math.sqrt(Q),(x,z,A)=>clamp(oreX(x,z)*1.2+rock(x,z)*.35,0,1)*.9,(x,y,z,c,A)=>{const S=F.tqshelf,lb=lab(S,c);
  for(const p of FG.troop({n:ri(2,5),r:.7,size:[.25,.5],flat:[.4,.6],tilt:.4,seed:KRAND.hash(5549,Math.floor(x*4),Math.floor(z*4))}))
   BIO.put('bracket',[x+p.p[0],Y(x+p.p[0],z+p.p[2])+.02,z+p.p[2]],FG.Q(p.q),p.s,col(PAL.tq),{label:lb});
  note(S,c,x,z,y);},{r:.8,cliff:true});
 BIO.range=650;
 // the lace crust: MINER, on the ore (the copper and turquoise beds where the rock shows; the pit's fresh faces and spoil)
 pass(F.lacecrust,5/Math.sqrt(Q),(x,z,A)=>oreX(x,z)>.2?.85:0,(x,y,z,c,A)=>{const s=rr(.6,1.5),S=F.lacecrust,e=2,
  gx=(Y(x+e,z)-Y(x-e,z))/(2*e),gz=(Y(x,z+e)-Y(x,z-e))/(2*e),n=[-gx,1,-gz];
  BIO.put(OUTL.LIB.lace?'lace':'crust',[x,y+.06,z],qUp(n),[s,1,s*rr(.6,1)],OUTL.LIB.lace?col([0xe4f0ec,0xd8eae4]):col(PAL.lace),{label:lab(S,c),n});note(S,c,x,z,y,{ore:oreX(x,z)});},{r:.4,cliff:true,patch:0});

 }
 // ======================================================== THE WADI COLONY (the dry channels)
 if(has('wadi')){BIO.range=650;
 pass(F.ribbon,6/Math.sqrt(Q),(x,z,A)=>wadiX(x,z)>=.99?.6:0,(x,y,z,c,A)=>{const S=F.ribbon;
  BIO.put('crust',[x,y+.04,z],qEuler(0,rr(-.4,.4)+Math.PI/2,0),[rr(.25,.45),1,rr(1.6,3)],col(PAL.ribbon),{label:lab(S,c)});note(S,c,x,z,y);},{r:.3,patch:.6});
 BIO.range=null;
 // the bell pools: drinker, on the lips of the pools the floods leave (the wadi records' pools, handed in by the host)
 (opt.pools||[]).forEach((P,k)=>{const S=F.bellpool;const n=Math.max(3,Math.round(P.r*1.3));
  for(let i=0;i<n;i++){const a=i/n*TAU+KRAND.unit(KRAND.hash(5551,k,i))*.4,x=P.x+Math.cos(a)*P.r*1.08,z=P.z+Math.sin(a)*P.r*1.08;
   M.at(x,z,A);if(!A.c||A.c.type!=='wadi'||A.seam||BIO.mask(x,z)<=0)continue;const y=Y(x,z),lb=lab(S,A.c);
   BIO.put('stalk',[x,y-.1,z],qEuler(0,0,0),[.6,.5,.6],col(PAL.flesh),{label:lb});
   for(const p of FG.pods({at:[0,0,0],n:ri(3,5),r:.35,size:[.18,.32],hang:true,tilt:.3,seed:KRAND.hash(5553,k,i)}))
    BIO.put('bell',[x+p.p[0],y+.42+p.p[1],z+p.p[2]],FG.Q(p.q),p.s,col(PAL.bell),{label:lb});
   note(S,A.c,x,z,y);}});
 // the stilt mound: RUNNER, on the banks and the fans (the wadi colony's reach), straddling the moving gravel
 pass(F.stilt,12/Math.sqrt(Q),(x,z,A)=>wadiX(x,z)>=.5&&wadiX(x,z)<.99?.8:0,(x,y,z,c,A)=>{
  const R0=rr(.6,1.1),H=rr(.6,1.1),S=F.stilt,lb=lab(S,c),legs=ri(5,7),ry=rr(0,TAU);
  BIO.put('sdome',[x,y+H,z],qEuler(0,ry,0),[R0,R0*rr(.8,1.1),R0],col(PAL.stilt),{label:lb});
  for(let k=0;k<legs;k++){const a=ry+k/legs*TAU,ex=x+Math.cos(a)*R0*1.25,ez=z+Math.sin(a)*R0*1.25,ey=Y(ex,ez)-.1,top=[x+Math.cos(a)*R0*.6,y+H+.05,z+Math.sin(a)*R0*.6];
   const dx=top[0]-ex,dy=top[1]-ey,dz=top[2]-ez,L=Math.hypot(dx,dy,dz);
   BIO.put('stalk',[ex,ey,ez],qUp([dx,dy,dz]),[.5,L,.5],col(PAL.stiltLeg),{label:lb});}
  note(S,c,x,z,y,{bank:wadiX(x,z)});},{r:1.6,both:true});

 }
 OUTL.placeMore(has,pass,M,A,lab,note,Q,opt);
 // ======================================================== THE SEAMS: dark crust patches on the seam's line, near the eye (the ground
 // paints the seam everywhere: 84-host-ground.js). Nothing else stands on a seam but the wardens
 BIO.range=380;
 let seams=0;BIO.grid('outl:seam',4,(x,z)=>{M.at(x,z,A);return A.seam?.7:0;},(x,y,z)=>{M.at(x,z,A);const s=rr(.5,1.1);
  BIO.put('crust',[x,y+.05,z],qEuler(0,rr(0,TAU),0),[s,1,s*rr(.5,.9)],col(PAL.seam),{label:'A seam ('+(A.c?A.c.id:'?')+' | '+(A.c2?A.c2.id:'?')+')'});seams++;},
  {box:[-R,-R,R,R],patch:.3,cliff:true});
 BIO.range=null;
 OUTL.SEAMS=seams;
 return{colonies:inMap.length,forms:forms.length,seams};};
})();
