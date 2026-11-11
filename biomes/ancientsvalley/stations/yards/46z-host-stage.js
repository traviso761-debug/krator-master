// ================================================================= HOST — stage (the Ancient's Valley, station 2a: THE YARDS)
// [web] Each station's say about its ground (STAGE); 47-host-land.js draws it, the same for every station. It sorts after the metropolis kit's records (40-46f), whose footprints size the plinths.
// WHERE (PLAN.md section 12, 2a; region/site.py): px 470,921 on 5.1, 210 m, Af, the floor of a west-east trough in the shelf 38 km east-south-east of
// city1 and 14 km from the shore. The trough climbs from the core's floor toward Thera and Span, 1.4% along it: the freight line's grade inland.
// THE PAGE (x east, z south, y up from the model's height at the pixel; R 2,800 m; the lattice square to the trough, theta 0):
//   THE YARD          the cargo line along the trough at z -150, eight sidings fanning south off it from x -1,600 to -100 on a graded bench,
//                     wagons standing and overturned, a turntable and its roundhouse at the yard's east end, loading gantries over the tracks
//   THE INDUSTRY      two rows of 495 m superblocks either side of the yard (no roads inside them, avenues round them), the kit's twelve
//                     industrial buildings fronting the avenues, tank farms in bunds, a dish array, slag heaps, chimneys, pipe racks along the
//                     blocks' backs and across the yard, conveyors from the yard to the furnaces; three of the new Engines among them
//   THE FLANKS        north and south above z +-760: the shelf's residential rings on the ordinary lattice, an elevated highway along the north
//                     flank, the elevated passenger line along the south, the subway under the south row's avenue
//   THE GROUND        foul on the floor (spill grounds and toxic pools as dead ground, the scar), wild on the upper flanks; the oily rain the
//                     day's weather, the smog at its thickest in the trough
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {mix,smooth}=BIO.fn;   /* TAU, clamp and lerp are the Ancients kit's (10-core.js, read in place for the engines and the industry) */
const AVQ=new URLSearchParams(location.search),AVQ_ON=k=>AVQ.get(k)!=='0';
window.NWLOW_LOOK={backlit:true,culm:true,fung:true,lobes:true};
const STAGE=(function(){const RG=AV_REGION,BASE=RG.site.base,LAKE_Y=RG.lake.y,R=2800,SEED=KRAND.hash(1110,470,921),M=AV.model(RG.grid);
 const P=165,ct=1,snt=0,AVH=13+3.5,RDH=5.5+3.5,FRONT=AVH+3;   /* the lattice: pitch, no turn; an avenue's and a road's half width with its pavement; a plinth 3 m behind */
 const isAv=k=>((k%3)+3)%3===1,lineV=k=>(k+.5)*P;
 /* THE INDUSTRIAL ZONE in lattice metres: two rows of superblocks (N: w -742.5..-247.5, S: 247.5..742.5) between the avenues u -2227.5 and 1732.5,
    the yard's row between them; CROSS: the two u-avenues that run on across the yard's row (level crossings); the rest stop at its avenues */
 const IZ={u0:-2227.5,u1:1732.5,w0:-742.5,w1:742.5},MR={w0:-247.5,w1:247.5},CROSS=[-1732.5,1237.5],LINE_Z=-150;
 const inIZ=(x,z,m)=>x>IZ.u0-(m||0)&&x<IZ.u1+(m||0)&&z>IZ.w0-(m||0)&&z<IZ.w1+(m||0);
 const modelY=(x,z)=>M.at(x,z)-BASE;
 const slopeK=(x,z)=>{const s=(M.at(x+600,z)-M.at(x-600,z))/1200,t=(M.at(x,z+600)-M.at(x,z-600))/1200;return Math.hypot(s,t);};
 /* the model's height and slope on a 32 m lattice under the relief (41, AV.lattice: the model's cells are 2 km, so within 2 cm; its bicubic was most of
    what was left of the build's ground after the 4 m lattices, 2026-11-11); modelY itself stays exact for the far ground */
 const modelL=AV.lattice(modelY,{cell:32,half:R+1600,tol:1e9}).h,slopeL=AV.lattice(slopeK,{cell:32,half:R+1600,tol:1e9}).h;
 function land0(x,z){const m=modelL(x,z),st=slopeL(x,z),r=1-Math.abs(2*KRAND.fbm(x*.0013+3.7,z*.0013-9.1,0,4,SEED+1)-1),f=KRAND.fbm(x*.011+1.3,z*.011+2.2,0,3,SEED+2);
  return m+(14+260*Math.min(.5,st))*(r-.45)*smooth(LAKE_Y-30,LAKE_Y+6,m)+2.2*(f-.5);}
 /* THE BENCH: the yard's row graded level across (a long profile along x: the model's ground on the line, averaged over 600 m), eased into the flanks */
 const BENCH=(function(){const T=[];for(let x=-3800;x<=3800;x+=50){let s=0,n=0;for(let d=-300;d<=300;d+=50){s+=modelY(x+d,LINE_Z+60);n++;}T.push(s/n-1.5);}
  return x=>{const t=(Math.max(-3800,Math.min(3800,x))+3800)/50,i=Math.min(T.length-2,Math.floor(t));return mix(T[i],T[i+1],t-i);};})();
 const benchW=(x,z)=>smooth(300,170,Math.abs(z-(LINE_Z+90)))*smooth(R+200,R-200,Math.abs(x));
 /* the ground's lattices (41, AV.lattice; 2026-11-10: a build asked the model-and-noise ground 94 million times, the whole ground 16 million): the model's
    ground with its relief on a 4 m lattice under everything, and the whole ground on another that the fields and the kits read (BIO's terrainH, 47);
    the drawn ground, the towers and the roads keep the whole ground itself */
 const landL=AV.lattice(land0,{cell:4,half:R+1400}).h;
 function landGround(x,z){return mix(landL(x,z),BENCH(x),benchW(x,z));}
 /* the records of the yards' pieces that are ground (46f): the slag heaps, and the spill grounds and toxic pools (dead ground) */
 const SLAG=[MP.yards.slagHeap({x:-2060,z:420,rx:150,rz:70,h:26,yaw:.15,seed:SEED+201}),MP.yards.slagHeap({x:-1900,z:610,rx:115,rz:80,h:22,yaw:-.3,seed:SEED+202}),
  MP.yards.slagHeap({x:-2110,z:640,rx:90,rz:55,h:17,yaw:.6,seed:SEED+203}),MP.yards.slagHeap({x:-800,z:640,rx:70,rz:35,h:14,yaw:.05,seed:SEED+204})];
 const SPILL=[MP.yards.spill({x:-1985,z:25,rx:200,rz:130,yaw:.2,seed:SEED+211,y:0}),MP.yards.spill({pool:true,x:-2010,z:-10,rx:62,rz:34,yaw:.3,seed:SEED+212,y:0}),MP.yards.spill({pool:true,x:-1890,z:95,rx:40,rz:24,yaw:-.4,seed:SEED+213,y:0}),
  MP.yards.spill({x:-990,z:170,rx:140,rz:55,yaw:0,seed:SEED+214,y:0}),MP.yards.spill({pool:true,x:-1010,z:175,rx:48,rz:22,yaw:.1,seed:SEED+215,y:0}),
  MP.yards.spill({x:700,z:110,rx:230,rz:85,yaw:-.1,seed:SEED+216,y:0}),MP.yards.spill({pool:true,x:620,z:100,rx:55,rz:30,yaw:.4,seed:SEED+217,y:0}),MP.yards.spill({pool:true,x:800,z:140,rx:36,rz:20,yaw:-.2,seed:SEED+218,y:0})];
 const POOLS=SPILL.filter(s=>s.kind==='pool');
 /* THE CRATERS: a dozen strikes on the flanks (the district was a target too, but its blocks stand on their plinths): none in the industrial zone */
 const CRATERS=AV.craters({R:R+200,n:12,seed:SEED+13,rMin:35,rMax:120,ok:(x,z,r)=>!inIZ(x,z,r+60)&&Math.hypot(x,z)<R-r});
 const scorch=(x,z)=>AV.scorch(CRATERS,x,z,SEED);
 /* a pool sinks 0.4 m into its spill; a heap stands on the bench */
 const poolH=(x,z)=>{let h=0;for(const q of POOLS){const c=Math.cos(q.yaw),s=Math.sin(q.yaw),dx=x-q.x,dz=z-q.z,u=(dx*c+dz*s)/q.rx,v=(-dx*s+dz*c)/q.rz,r=u*u+v*v;if(r<1.3)h=Math.min(h,-.6*smooth(1.3,.8,r));}return h;};
 function rawGround(x,z){return landGround(x,z)+AV.craterH(CRATERS,x,z)+MP.yards.slagH(SLAG,x,z)+poolH(x,z);}
 const cities=RG.cities.map(c=>({n:c.n,x:c.x,z:c.z,h:c.h,theme:c.theme})),basins=RG.basins.map(b=>({n:b.n,x:b.x,z:b.z,r:b.r,kind:b.kind}));
 const scars=SPILL.map(s=>({x:s.x,z:s.z,rx:s.rx,rz:s.rz,yaw:s.yaw,k:s.kind==='pool'?1:.9})).concat(CRATERS.map(c=>({x:c.x,z:c.z,rx:c.r*1.25,rz:c.r*1.25,yaw:0,k:.85})));
 const F0=AV.fields({ground:rawGround,base:BASE,lakeY:LAKE_Y,cities,basins,scars,seed:SEED,R});
 /* the halves here: the floor is all foul (this is where the foul ground comes from: PLAN.md 12, 2a), the wild only on the upper flanks */
 const indK=(x,z)=>smooth(1150,760,Math.abs(z))*smooth(IZ.u1+500,IZ.u1,x)*smooth(IZ.u0-500,IZ.u0,x);
 const F=Object.assign({},F0,{wild:(x,z)=>F0.wild(x,z)*(1-indK(x,z)),foul:(x,z)=>{if(rawGround(x,z)<LAKE_Y+.5)return 0;return clamp(1-F0.wild(x,z)*(1-indK(x,z)),0,1);},industry:indK});
 /* THE LINES: the elevated highway along the north flank, the elevated passenger line along the south; the cargo line along the trough */
 const VIA=[[2750,1180],[900,1070],[-900,1110],[-2750,1220]],VIA2=[[-2750,-1180],[-900,-1080],[900,-1120],[2750,-1240]],VIAS=[VIA,VIA2];
 const CARGO_PTS=[[-2900,LINE_Z],[2900,LINE_Z]];
 const polyD=(LS,x,z)=>{let d=1e9;for(const L of LS)for(let k=0;k+1<L.length;k++){const a=L[k],b=L[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t;d=Math.min(d,Math.hypot(x-px,z-pz));}return d;};
 const railD=(x,z)=>polyD([CARGO_PTS],x,z),viaLineD=(x,z)=>polyD(VIAS,x,z);
 /* THE STREETS as intervals on the lattice's half lines: STREETS[axis][k] = [[a, b]...] along the line (axis 0: lines of constant x, running in z) */
 const STREETS=[{},{}];
 {const n=Math.ceil(R/P)+1,cut=(iv,a,b)=>{const out=[];for(const q of iv){if(b<=q[0]||a>=q[1]){out.push(q);continue;}if(a>q[0])out.push([q[0],a]);if(b<q[1])out.push([b,q[1]]);}return out;};
  for(let axis=0;axis<2;axis++)for(let k=-n;k<=n;k++){const v=lineV(k);if(Math.abs(v)>R-140)continue;const half=Math.sqrt((R-110)*(R-110)-v*v),av=isAv(k);let iv=[[-half,half]];
   if(axis===0){if(v>IZ.u0+1&&v<IZ.u1-1){if(!av)iv=cut(iv,IZ.w0,IZ.w1);else if(CROSS.indexOf(v)<0)iv=cut(iv,MR.w0,MR.w1);}}
   else if(!av&&v>IZ.w0&&v<IZ.w1)iv=cut(iv,IZ.u0,IZ.u1);
   iv=iv.filter(q=>q[1]-q[0]>40);if(iv.length)STREETS[axis][k]=iv;}}
 const streetAt=(axis,k,t)=>{const iv=STREETS[axis][k];if(!iv)return false;for(const q of iv)if(t>=q[0]-1&&t<=q[1]+1)return true;return false;};
 const lineOf=(v)=>{const k=Math.round(v/P-.5);return{k,d:Math.abs(v-lineV(k)),av:isAv(k)};};
 const streetD=(x,z)=>{const A=lineOf(x),B=lineOf(z);let d=1e9;if(streetAt(0,A.k,z))d=Math.min(d,A.d);if(streetAt(1,B.k,x))d=Math.min(d,B.d);return d;};
 const SW=6,AW=14;
 /* a plinth's reach into any street that runs there (AV.kerbPlace's own filter reads only the nearest line on each axis, so a wide slab slid to
    one street's kerb could overrun the street behind it): every line within its extent, against the street's interval */
 const inStreet=(T)=>{const p=P;let bad=0;for(let a=0;a<2;a++){const ang=T.yaw,ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang)),ex=[ca*T.rx+sa*T.rz,sa*T.rx+ca*T.rz],v=a===0?T.x:T.z,t=a===0?T.z:T.x;
   for(let k=Math.floor((v-ex[a])/p-.5)-1;k<=Math.ceil((v+ex[a])/p-.5)+1;k++){const lv=lineV(k);if(!STREETS[a][k])continue;const hw=isAv(k)?AVH:RDH,g=Math.abs(v-lv)-ex[a]-hw;if(g>=-.5)continue;
    /* the street must run where the plinth is: its interval against the plinth's extent along the line */
    if(STREETS[a][k].some(q=>q[0]-hw<t+ex[1-a]&&q[1]+hw>t-ex[1-a]))bad++;}}return bad;};
 const streetK=(x,z)=>{const A=lineOf(x),B=lineOf(z);let k=0;if(streetAt(0,A.k,z)){const h=A.av?AW:SW;k=Math.max(k,smooth(h+1.5,h-.5,A.d));}if(streetAt(1,B.k,x)){const h=B.av?AW:SW;k=Math.max(k,smooth(h+1.5,h-.5,B.d));}return k;};
 /* where no street runs (a superblock's inside, the yard's row between its crossings) the wrecks read as the corridor of a line (73) */
 const noStreet=(x,z)=>{const A=lineOf(x),B=lineOf(z);return !((A.d<AW+2&&streetAt(0,A.k,z))||(B.d<AW+2&&streetAt(1,B.k,x)));};
 const viaD=(x,z)=>Math.min(viaLineD(x,z),inIZ(x,z,0)&&noStreet(x,z)?0:1e9,railD(x,z)<30?0:1e9);
 /* THE ENGINES among the industry (kits/ancients targets/engines 8aj, the owner, 2026-11-10: cyclopean machines of unclear purpose among the
    industrial landscape): the Hive in a north block, the Star and the Iris in south blocks, each on a pad of its own in a superblock */
 const ENGINES=[{key:'hive',x:495,z:-495,yaw:.3},{key:'star',x:0,z:495,yaw:-.4},{key:'iris',x:1485,z:495,yaw:Math.PI*.9}].map(e=>Object.assign({},AV.ENGINES[e.key],e,{y:rawGround(e.x,e.z)}));
 const engineD=(x,z)=>{let d=1e9;for(const E of ENGINES)d=Math.min(d,Math.hypot(x-E.x,z-E.z)-E.r);return d;};
 const NEAR={x:-742.5,z:-1000,r:300,keys:[]};
 /* THE INDUSTRY: the kit's twelve industrial buildings (46b, 46e; MP.ANCIENTS), each fronting the avenue on its block's yard side, its plinth 3 m behind
    the pavement; a block of several packs them along that avenue. A record like a tower's (the city's machinery in 70 draws them: heroes, shells,
    impostors), its state by the ruin shares by hash, kind 'industry' */
 const BLK=(bi,row)=>{const u0=IZ.u0+bi*495;return{u0,u1:u0+495,uc:u0+247.5,row};};
 const INDUSTRY=[];
 const place=(bi,row,keys)=>{const B=BLK(bi,row),ex=keys.map(k=>{const A=MP.ANCIENTS[k],rot=A.footprint.d>A.footprint.w;return{k,A,rot,eu:(rot?A.footprint.d:A.footprint.w)/2+6,ew:(rot?A.footprint.w:A.footprint.d)/2+6};});
  const gap=18,tot=ex.reduce((s,e)=>s+2*e.eu,0)+gap*(ex.length-1);let u=B.uc-tot/2;
  ex.forEach((e,j)=>{const x=u+e.eu;u+=2*e.eu+gap;const z=row<0?MR.w0-FRONT-e.ew:MR.w1+FRONT+e.ew,i=bi+50,jj=(row<0?10:20)+j,g=KRAND.unit(KRAND.hash(SEED,i,jj,31));
   let si=0;while(si<AV.RUIN_CUTS.length-1&&g>=AV.RUIN_CUTS[si])si++;const st=AV.RUINS[si];
   INDUSTRY.push({id:'av.i.'+e.k+'.'+bi+'.'+j,key:e.k+'.'+st,family:e.k,state:st,x,z,y:rawGround(x,z),yaw:(e.rot?Math.PI/2:0)+(row<0?Math.PI:0),i,j:jj,kind:'industry',
    lean:AV.lean(SEED,i,jj,st),leanDir:KRAND.unit(KRAND.hash(SEED,i,jj,32))*Math.PI*2,kerb:{axis:1,side:row<0?1:-1,avenue:true,corner:false},block:[bi,row]});});};
 place(0,-1,['well','tankyard','spheres']);place(2,-1,['datacenter']);place(3,-1,['coolers','gantry']);place(4,-1,['stacks']);place(6,-1,['rig']);
 place(1,1,['foundry']);place(2,1,['furnace']);place(3,1,['robotics']);place(5,1,['works']);
 /* the industry's pieces that need a level pad (tank farms, the dish array): their blocks */
 const PIECE_PADS=[{key:'tankfarmA',x:-1485,z:-495,w:440,d:430},{key:'tankfarmB',x:990,z:495,w:420,d:420},{key:'dishes',x:1485,z:-495,w:300,d:300}];
 /* THE PLAN: the flanks' residential rings (the shelf's midrises) on the ordinary lattice, nothing in the industrial zone, the lines' corridors, the
    engines' pads or the craters; then the industry joins it, so the city's machinery (70) tiers them all alike */
 const PLAN=AV.plan({R:R+400,pitch:P,theta:0,seed:SEED+5,ground:rawGround,lakeY:LAKE_Y,F,
  coreKeys:['ledger','ledger','pods','terrace','crescent','cupola'],shelfKeys:['ledger','ledger','ledger','terrace','crescent','cupola','arcades','pods','spiral','terrarium'],
  skip:(x,z)=>inIZ(x,z,30)||viaLineD(x,z)<34||railD(x,z)<30||engineD(x,z)<90||CRATERS.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+30),
  kerb:{avenue:AVH,road:RDH,gap:3,corner:.35,R:R-110,lineMax:R-140,extent:fam=>{const F=MP.FAMILY[fam]||MP.DESIGNS[fam]||{},fp=F.footprint||{};return fp.r?[fp.r+6,fp.r+6]:[(fp.w==null?60:fp.w)/2+6,(fp.d==null?60:fp.d)/2+6];}}});
 /* the residential towers whose plinth still reaches a street (the far side of a wide slab) are not built here: a building does not stand in the street */
 PLAN.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family]||{},fp=F.footprint||{};if(fp.r){T.rx=T.rz=fp.r+6;}else{T.rx=(fp.w==null?60:fp.w)/2+6;T.rz=(fp.d==null?60:fp.d)/2+6;}});
 {const n0=PLAN.towers.length,keep=PLAN.towers.filter(T=>!inStreet(T));PLAN.towers.length=0;keep.forEach(T=>PLAN.towers.push(T));PLAN.streetDropped=n0-keep.length;}
 PLAN.residential=PLAN.towers.length;INDUSTRY.forEach(T=>PLAN.towers.push(T));PLAN.industry=INDUSTRY;
 const th=0;
 const PADS=KSPACE.create({cell:300});PLAN.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family]||MP.ANCIENTS[T.family]||{},fp=F.footprint||{};
  if(fp.r){T.rx=T.rz=fp.r+6;}else{T.rx=(fp.w==null?60:fp.w)/2+6;T.rz=(fp.d==null?60:fp.d)/2+6;}T.padR=Math.max(T.rx,T.rz);T.c=Math.cos(T.yaw);T.s=Math.sin(T.yaw);T.ease=T.kind==='industry'?24:14;PADS.insert(T,T.x,T.z,T.padR+(T.ease+2));});
 ENGINES.forEach(E=>{E.rx=E.rz=E.padR=E.r+20;E.c=1;E.s=0;E.ease=60;E.family='engine';PADS.insert(E,E.x,E.z,E.padR+64);});
 PIECE_PADS.forEach(Q=>{Q.y=rawGround(Q.x,Q.z);Q.rx=Q.w/2;Q.rz=Q.d/2;Q.padR=Math.max(Q.rx,Q.rz);Q.c=1;Q.s=0;Q.ease=20;Q.family='piece';PADS.insert(Q,Q.x,Q.z,Q.padR+22);});
 const DEBRIS=AV.debris({craters:CRATERS,R:R,n:160,seed:SEED+17,ok:(x,z)=>{if(inIZ(x,z,20)||viaLineD(x,z)<14||railD(x,z)<8||engineD(x,z)<40)return false;const dq=[];PADS.query(x,z,0,dq);for(let i=0;i<dq.length;i++){const T=dq[i],dx=x-T.x,dz=z-T.z,u=dx*T.c+dz*T.s,v=-dx*T.s+dz*T.c;if(Math.abs(u)<T.rx-4&&Math.abs(v)<T.rz-4)return false;}return true;}});
 const padD=(T,x,z)=>{const dx=x-T.x,dz=z-T.z,u=dx*T.c+dz*T.s,v=-dx*T.s+dz*T.c,mn=Math.min(T.rx,T.rz);return Math.hypot(u*mn/T.rx,v*mn/T.rz)-mn;};
 /* a rectangle's distance (an industrial plinth is a slab: its corners are corners, not the ellipse a round tower's plinth eases with) */
 const boxD=(T,x,z)=>{const dx=x-T.x,dz=z-T.z,u=Math.abs(dx*T.c+dz*T.s)-T.rx,v=Math.abs(-dx*T.s+dz*T.c)-T.rz;return u>0||v>0?Math.hypot(Math.max(u,0),Math.max(v,0)):Math.max(u,v);};
 const pD=(T,x,z)=>T.kind==='industry'||T.family==='piece'?boxD(T,x,z):padD(T,x,z);
 const _q=[];
 function relief(x,z){let h=rawGround(x,z);_q.length=0;PADS.query(x,z,0,_q);for(let i=0;i<_q.length;i++){const T=_q[i],d=pD(T,x,z);if(d<T.ease)h=mix(T.y,h,smooth(0,T.ease,d));}return h;}
 /* THE TRANSIT (kits/ancient-transit, read in place): the streets of STREETS as the kit's network (a road that stops at an avenue is a T), the war on
    them heaviest in the industrial zone, the highway on the north flank with three ramps, the passenger line on the south flank, the cargo line along
    the trough, the subway under the south row's avenue */
 const AVT={};
 {const defs=[],ix=[{},{}];for(let axis=0;axis<2;axis++)for(const ks in STREETS[axis]){const k=+ks,v=lineV(k),av=isAv(k);STREETS[axis][k].forEach((q,qi)=>{
   const a=axis===0?[v,q[0]]:[q[0],v],b=axis===0?[v,q[1]]:[q[1],v];defs.push({id:(axis?'w':'u')+(k<0?'m':'')+Math.abs(k)+(STREETS[axis][k].length>1?'.'+qi:''),pts:[a,b],kind:av?'avenue':'road',axis,k,av});(ix[axis][k]||(ix[axis][k]=[])).push(defs.length-1);});}
  AVT.defs=defs;AVT.ix=ix;}
 AVT.lakeD=()=>99999;AVT.lakeK=()=>0;AVT.waterCells=0;
 {const best=AVT.defs.find(d=>d.av&&d.axis===1&&Math.abs(lineV(d.k)-742.5)<1);const a=best.pts[0],b=best.pts[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),f=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  AVT.subway=KTRANSIT.subway([f(.06),f(.35),f(.65),f(.94)],{id:'sw',ground:relief,stations:[Math.round(L*.2),Math.round(L*.5),Math.round(L*.78)],stationStates:['ruined','collapsed','ruined'],seed:SEED+71});AVT.subwayLine=best.id;}
 let CRX=null;const crq=[];const AVT_T0=performance.now();
 const craterSum=(x,z)=>{if(!CRX)return 0;crq.length=0;CRX.query(x,z,0,crq);let h=0,rim=0;for(const c of crq){const d=Math.hypot(x-c.x,z-c.z);if(d>=c.r*1.6)continue;
  if(d<c.r){const q=d/c.r,t=1-q*q,v=-c.depth*t*t;if(v<h)h=v;}const u=d<c.r?(d-c.r)/(.35*c.r):(d-c.r)/(.6*c.r),w=Math.max(0,1-u*u),b=.16*c.depth*w*w;if(b>rim)rim=b;}return h+rim;};
 const SINKG=AV.sinkGate(AVT.subway);   /* the subway's drops only where one reaches (41, AV.sinkGate) */
 const carve=(x,z)=>(SINKG(x,z)?KTRANSIT.sinkholeH(AVT.subway,x,z):0)+Math.min(0,craterSum(x,z));
 AVT.net=KTRANSIT.network(AVT.defs,{ground:relief,carve});
 AVT.streets=AVT.defs.map((d,i)=>{const Rd=AVT.net.roads[i];return{id:d.id,pts:d.pts,width:Rd.width,pavement:Rd.pavement,ground:Rd.levelAt,av:d.av,axis:d.axis,k:d.k};});
 AVT.wars=AVT.streets.map((st,i)=>{const Rd=AVT.net.roads[i],ik=s=>{const q=Rd.path.at(s);return indK(q.x,q.z);},hi=Math.max(ik(0),ik(Rd.L*.5),ik(Rd.L));
  return KTRANSIT.war(st,{damage:s=>clamp(.2+.5*ik(s),0,1),military:hi>.6?.5:false,blockades:st.av&&hi>.6?true:undefined,network:AVT.net,road:i,seed:KRAND.hash(SEED,73,i,0)});});
 CRX=KSPACE.create({cell:60});AVT.wars.forEach(W=>W.craters.forEach(c=>CRX.insert(c,c.x,c.z,c.r*1.6)));AVT.craters=AVT.wars.reduce((a,W)=>a+W.craters.length,0);
 AVT.cargo=KTRANSIT.rail(CARGO_PTS,{id:'cargo',ground:relief,streets:AVT.streets,catenary:true,seed:SEED+75});
 const lineHnear=(x,z)=>{const ku=Math.round(x/P-.5),kw=Math.round(z/P-.5);let h=0;const iu=AVT.ix[0][ku],iw=AVT.ix[1][kw];
  if(iu)for(const i of iu)h+=KTRANSIT.lineH(AVT.net.roads[i],x,z);if(iw)for(const i of iw)h+=KTRANSIT.lineH(AVT.net.roads[i],x,z);return h;};
 function ground(x,z){let h=relief(x,z);h+=(SINKG(x,z)?KTRANSIT.sinkholeH(AVT.subway,x,z):0)+craterSum(x,z)+lineHnear(x,z)+KTRANSIT.lineH(AVT.cargo,x,z,{form:.45});return h;}
 {const HP=KTRANSIT.path(VIA2,{ground:relief,radius:80}),xs=[];AVT.defs.forEach((d,i)=>{if(!d.av)return;KTRANSIT.intersections(HP,d.pts).forEach(c=>xs.push({s:c.sP,road:i}));});xs.sort((a,b)=>a.s-b.s);
  const pick=f=>{let best=null;for(const c of xs){if(c.s<400||c.s>HP.L-400)continue;if(best==null||Math.abs(c.s-f*HP.L)<Math.abs(best.s-f*HP.L))best=c;}return best;};
  const r1=pick(.25),r2=pick(.5),r3=pick(.75),ramps=[];[[r1,1,'off'],[r2,-1,'on'],[r3,1,'off']].forEach(([c,side,dir])=>{if(c)ramps.push({s:Math.max(200,c.s-240),side,dir,road:c.road});});
  AVT.highway=KTRANSIT.highway(VIA2,{id:'h1',ground:ground,clearance:9,ramps,ruin:s=>({intact:.3,cracked:.35,collapsed:.2,gone:.15}),
   overgrowth:s=>{const q=HP.at(s);return 2*F.feral(q.x,q.z)*F.wild(q.x,q.z);},blockades:[Math.round(HP.L*.4)],seed:SEED+77});AVT.rampCrossings=ramps;AVT.highwayPath=HP;}
 if(KTRANSIT.joinRamps)try{AVT.rampJoins=KTRANSIT.joinRamps(AVT.net,AVT.highway);}catch(e){AVT.rampJoinErr=e.message||String(e);}
 {const PP=KTRANSIT.path(VIA,{ground:relief,radius:160});AVT.pax=KTRANSIT.rail(VIA,{id:'pax',ground:ground,elevated:true,stations:[1400,3800],overgrowth:s=>{const q=PP.at(Math.min(s,PP.L));return 2*F.feral(q.x,q.z)*F.wild(q.x,q.z);},seed:SEED+79});}
 /* THE RAIL YARD (MP.yards.railYard, 46f): eight sidings fanning south off the cargo line from x -1,600 to -100 (s along the line from its west end),
    each its own rail at grade on the bench; buffer stops at their ends; then the wagons, standing and overturned, on the sidings and the main line */
 const XS=x=>x-CARGO_PTS[0][0];
 const YARD=MP.yards.railYard({at:s=>AVT.cargo.path.at(Math.max(0,Math.min(AVT.cargo.L,s))),s0:XS(-1600),s1:XS(-100),side:1,n:8,spacing:5.5,fan:90,fanStep:22,ladder:30,seed:SEED+221});
 AVT.sidings=YARD.sidings.map(S=>KTRANSIT.rail(S.pts,{id:S.id,ground:relief,radius:90,catenary:false,maxGrade:.02,seed:KRAND.hash(SEED,222,S.k,0)}));
 const sid=k=>AVT.sidings[k-1],trainOn=(R,o)=>{try{return KTRANSIT.train(R,o);}catch(e){return null;}};
 AVT.trains=[trainOn(AVT.cargo,{id:'freight',s:XS(900),kind:'freight',cars:14,state:'derailed',from:5}),
  trainOn(sid(2),{id:'yard2',s:sid(2).L-40,kind:'freight',cars:['loco','box','box','tank','tank','tank','flat','box','box','flat','box','box'],state:'standing'}),
  trainOn(sid(3),{id:'yard3',s:sid(3).L-260,kind:'freight',cars:['tank','tank','tank','tank','tank','tank','tank','tank','tank','tank'],state:'derailed',from:3}),
  trainOn(sid(5),{id:'yard5',s:sid(5).L-90,kind:'freight',cars:['box','box','flat','flat','flat','box','box','box','tank','box','box','box','flat','box'],state:'standing'}),
  trainOn(sid(6),{id:'yard6',s:sid(6).L-520,kind:'freight',cars:['loco','flat','flat','flat','box','box','box','box'],state:'derailed',from:1}),
  trainOn(sid(8),{id:'yard8',s:sid(8).L-30,kind:'freight',cars:['box','box','box','box','box','box','tank','tank'],state:'standing'}),
  trainOn(AVT.subway,{id:'metro1',s:AVT.subway.stations[0].s+30,kind:'passenger',cars:4,state:'standing'}),
  trainOn(AVT.pax,{id:'pax1',s:2400,kind:'passenger',state:'fallen',from:2})].filter(Boolean);
 AVT.ms=Math.round(performance.now()-AVT_T0);
 const GRL=AV.lattice(ground,{cell:4,half:R+200}),yOf=GRL.h;
 /* THE PIECES as records (46f), each on the ground it stands on: the yard's turntable and loading gantries, the tank farms, the dish array, the chimneys,
    the pipe racks (along the blocks' backs and across the yard's row, a bent never in a street or on a track: the pipes span it), the conveyors from the
    yard to the foundry and the furnaces (their trestles off the streets), the pools (the spill grounds are ground only). Registered and drawn in 70y */
 const offStreet=(x,z)=>streetK(x,z)<.02&&streetD(x,z)>AW+2;
 const offTrack=(x,z)=>railD(x,z)>9&&!MP.yards.inside(YARD.outline,x,z,6);
 const PIECES=[];
 PIECES.push(MP.yards.turntable({x:60,z:-20,y:relief(60,-20),r:13,stalls:12,yaw:Math.PI/2,entry:-Math.PI*.75,seed:SEED+231,damage:.7}));
 [-1350,-950,-550].forEach((x,i)=>PIECES.push(MP.yards.gantry({x,z:LINE_Z+YARD.width/2-6,y:relief(x,LINE_Z+20),yaw:0,span:YARD.width+6,h:15,len:10,seed:SEED+240+i,damage:.6})));
 PIECES.push(MP.yards.tankFarm({x:-1485,z:-495,y:PIECE_PADS[0].y,w:430,d:420,r:13,spheres:.3,seed:SEED+250,damage:.6}));
 PIECES.push(MP.yards.tankFarm({x:990,z:495,y:PIECE_PADS[1].y,w:410,d:410,r:14,spheres:.65,seed:SEED+251,damage:.55}));
 PIECES.push(MP.yards.dishArray({x:1485,z:-495,y:PIECE_PADS[2].y,nu:3,nv:3,r:11,gap:42,az:-2.2,el:.8,seed:SEED+252,damage:.6}));
 [[-1640,640,110,4.6],[-1330,650,90,4],[-1060,560,96,3.6],[-940,600,80,3.2],[-860,560,70,3]].forEach((c,i)=>PIECES.push(MP.yards.chimney({x:c[0],z:c[1],ground:relief,h:c[2],r:c[3],seed:SEED+260+i,damage:.6})));
 PIECES.push(MP.yards.pipeRack({pts:[[-2190,-705],[-1250,-705],[-300,-705],[700,-705],[1700,-705]],h:8,n:5,tiers:2,ground:relief,seed:SEED+270,damage:.55,skip:(x,z)=>!offStreet(x,z)||engineD(x,z)<0}));
 PIECES.push(MP.yards.pipeRack({pts:[[-2190,705],[-1250,705],[-300,705],[700,705],[1700,705]],h:8,n:4,tiers:1,ground:relief,seed:SEED+271,damage:.6,skip:(x,z)=>!offStreet(x,z)||engineD(x,z)<0}));
 PIECES.push(MP.yards.pipeRack({pts:[[1040,-262],[1040,262]],h:10,n:4,tiers:2,ground:relief,seed:SEED+272,damage:.4,skip:(x,z)=>!offStreet(x,z)||!offTrack(x,z)}));
 [[-1485,-1460],[-990,-1000]].forEach((c,i)=>{const a=[c[0],relief(c[0],-92)+5,-92],b=[c[1],relief(c[1],300)+40,300];PIECES.push(MP.yards.conveyor(a,b,{ground:relief,seed:SEED+280+i,damage:.5,skip:(x,z)=>!offStreet(x,z)}));});
 POOLS.forEach(q=>{q.y=relief(q.x,q.z);PIECES.push(q);});
 const built=(x,z)=>{_q.length=0;PADS.query(x,z,0,_q);let k=0;for(let i=0;i<_q.length;i++){k=Math.max(k,smooth(10,-6,pD(_q[i],x,z)));}return k;};
 const street=(x,z)=>streetK(x,z)*smooth(.1,.3,F.density(x,z)+indK(x,z));
 const avenueLines=()=>{const n=Math.ceil((R+400)/P)+2,out=[];for(let k=-n;k<=n;k++)if(isAv(k))out.push(lineV(k));return out;};
 const slagK=(x,z)=>smooth(1,5,MP.yards.slagH(SLAG,x,z));
 const forest=(x,z)=>{const y=yOf(x,z);if(y<LAKE_Y+.6)return 0;const zn=F.zone(x,z),pk=F.park(x,z),sc=F.scar(x,z),w=F.wild(x,z),open=mix(zn==='floor'?.8+.2*pk:zn==='shelf'?.95+.05*pk:1,1,w);
  return clamp(open*(1-sc)*(1-.85*scorch(x,z))*(.08+.92*w)*(1-.9*indK(x,z))*(1-slagK(x,z)),0,1)*(1-.65*street(x,z)*(1-.4*w))*(1-built(x,z));};
 /* the checks of this station (99: STAGE.checkList replaces the Overlook's list) */
 return{key:'yards',name:'The Ancient\'s Valley: the Yards',title:'Krator biome — the Ancient\'s Valley: the Yards',
  hint:'The industrial district on the freight line (px 470,921, 210 m, Af): the rail yard, the halls, the tank farms and three Engines in the oily rain. Fly (W A S D, Q E, Shift), F to walk. R rides with a keeper (again for the next, Esc to let go).',
  R,px:[RG.site.px,RG.site.py],base:BASE,lakeY:LAKE_Y,air:{pressure:RG.site.atm,humidity:.86},
  /* the smog at its thickest (PLAN.md 12, 2a): the trough holds it; the fog thicker than the Overlook's, the mist deeper, the band lower */
  clouds:{cover:.85,cumulus:1.2,cirrus:.25,bank:.8,height:820,scale:1400,drift:.02,dark:.88,tint:[.38,.31,.27],turbulence:.75,turbKind:'violent',glow:.6,glowColour:[1,.5,.18]},
  cloudMood:{period:300,glowColour:[1,.5,.18]},airLook:{turbidity:3.4,dust:[.56,.47,.48]},fogDensity:.00052,
  smog:{colour:[.34,.29,.31],mix:.9,mist:{density:.0016,above:140,depth:150,noise:.85,day:1,field:true},band:{density:.004,y:[300,520],cover:.7,noise:1}},
  weather:'oily rain',seed:SEED,model:M,region:RG,
  ground,groundFast:yOf,groundLattice:GRL,rawGround,modelY,F,plan:PLAN,pads:PADS,engines:ENGINES,craters:CRATERS,debris:DEBRIS,scorch,viaduct:{pts:VIAS,deckY:(x,z)=>Math.max(rawGround(x,z)+16,-2),d:viaD},transit:AVT,relief,railD,near:NEAR,street,streetK,streetD,avenueLines,
  lattice:{c:ct,s:snt,pitch:P,AW,SW},built,forest,scars,cities,basins,
  yards:{IZ,MR,CROSS,LINE_Z,YARD,PIECES,SLAG,SPILL,POOLS,INDUSTRY,STREETS,streetAt,inStreet,offStreet,offTrack,PIECE_PADS,BLK,indK,noStreet},
  wreckAvoid:[{x:-850,z:-120,r:820},{x:60,z:-20,r:80}],wreckMax:420,
  water:{level:LAKE_Y,shallow:0x4f7a74,deep:0x1a3440,name:'The valley lake (14 km west and south: none on this page)'},
  floorLabel:(x,z,y)=>{if(POOLS.some(q=>Math.hypot((x-q.x)/q.rx,(z-q.z)/q.rz)<1))return 'a toxic pool: still, black, an oily sheen';if(F.scar(x,z)>.5)return 'dead ground: a spill (the scar)';if(slagK(x,z)>.5)return 'a slag heap';if(railD(x,z)<6||MP.yards.inside(YARD.outline,x,z,0))return 'the rail yard';if(street(x,z)>.5)return 'a street';if(built(x,z)>.5)return 'a plinth';if(indK(x,z)>.6)return 'the industrial floor: oily ground';const zn=F.zone(x,z);return zn==='shelf'?'the shelf: the residential rings':'the terraces';},
  fields:{wet:(x,z)=>clamp(.84+.08*F.park(x,z)-.12*F.density(x,z)*(1-F.park(x,z))+.08*F.wild(x,z)-.15*F.foul(x,z),0,.98),tropic:(x,z)=>.92,dry:(x,z)=>clamp(.1*F.density(x,z)+.5*F.scar(x,z)+.4*F.foul(x,z)+.3*indK(x,z),0,1),
   flow:(x,z)=>0,upland:(x,z)=>clamp((yOf(x,z)-LAKE_Y)/300,0,1),salt:(x,z)=>0},
  zone:(x,z)=>{const f=forest(x,z);return{sw:f,nw:f*.33,city:Math.max(F.density(x,z),indK(x,z))};},
  swAllow:null,swKeep:['gum'],nwAllow:['kauri','towerash','skybamboo','treefern','ginkgo','glowwillow','meranti','mistpalm','pandan','paperbark'],swQ:2.0,nwQ:1.2,
  layers:['ground.pave','ground.asphalt','ground.rubble','ground.glass','ground.rainfloor','ground.oaklitter','ground.mud'],
  weights:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),ik=indK(x,z),sc=F.scar(x,z),pk=F.park(x,z),st=street(x,z),b=built(x,z),fo=forest(x,z),sl=slagK(x,z),yd=MP.yards.inside(YARD.outline,x,z,8)?1:0;
   const sco=scorch(x,z),fl=F.foul(x,z),craterSc=CRATERS.some(c=>Math.hypot(x-c.x,z-c.z)<c.r*1.25)?sc:0,spillSc=sc-craterSc;
   const pave=clamp(Math.max(b,.1*d*(1-pk)*(1-.8*fo)*smooth(.3,.7,KRAND.fbm(x*.004+5,z*.004,0,2,SEED+8)),.35*ik*smooth(.4,.7,KRAND.fbm(x*.006+2,z*.006,0,2,SEED+18))),0,1)*(1-sc)*(1-st)*(1-sl)*(1-yd);
   const rub=clamp(Math.max(.45*d*(1-pk)*(1-.6*fo)*smooth(.3,.65,KRAND.fbm(x*.02,z*.02,0,2,SEED+9)),.9*sco,.7*fl*(1-fo),sl,yd*.85,.5*smooth(.15,.5,st)*(1-smooth(.6,.9,st))),0,1)*(1-sc)*(1-b);
   const soilNW=clamp(.5*pk+.25,0,1)*(1-pave)*(1-sc)*(1-ik),soilSW=clamp(.9-.5*pk,0,1)*(1-pave)*(1-sc)*(1-ik);
   /* a spill takes the rubble layer (dry crust over old oil, under the ochre paint), not the mud: wet mud under the oily rain read black, and the black pools vanished into it */
   return[pave,st*(1-sc),Math.max(rub,.9*spillSc),craterSc,soilNW,soilSW,Math.max(.1*spillSc,.3*ik*(1-b)*(1-st)*(1-sl))];},
  paint:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),ik=indK(x,z),sc=F.scar(x,z),pk=F.park(x,z),t=F.taint(x,z),fo=forest(x,z),sco=scorch(x,z),sl=slagK(x,z);let c=[.30,.33,.22];
   c=c.map((v,i)=>mix(v,[.44,.42,.38][i],.35*d*(1-pk)));c=c.map((v,i)=>mix(v,[.15,.24,.12][i],.75*fo));c=c.map((v,i)=>mix(v,[.11,.10,.09][i],.6*F.foul(x,z)*(1-fo)));
   c=c.map((v,i)=>mix(v,[.09,.085,.08][i],.6*ik));c=c.map((v,i)=>mix(v,[.26,.18,.28][i],.25*F.foul(x,z)*t));c=c.map((v,i)=>mix(v,[.21,.21,.20][i],.7*street(x,z)));
   c=c.map((v,i)=>mix(v,[.07,.065,.06][i],.9*sl));c=c.map((v,i)=>mix(v,[.09,.08,.07][i],.85*sco));
   /* the dead ground: a crater's melt glass dark, a spill stained the ochre of old oil (the pools, black, read against it) */
   const crK=CRATERS.some(q=>Math.hypot(x-q.x,z-q.z)<q.r*1.25)?1:0;c=c.map((v,i)=>mix(v,crK?[.05,.06,.05][i]:[.26,.20,.09][i],sc));return c;},
  views:()=>{const Y=(x,z)=>ground(x,z),V=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const V0={
    'The Yards from the north flank':V([-1237.5,-760],70,[-300,250],0),
    'The rail yard':V([-40,-88],8,[-900,-130],1),
    'The turntable and the roundhouse':V([60,125],22,[60,-30],2),
    'Among the halls':V([-742.5,-1000],1.8,[-742.5,600],40),
    'The tank farm':V([-1237.5,-247.5],16,[-1485,-520],6),
    'The foundry and its stacks':V([-1200,247.5],2,[-1500,470],60),
    'The dish array':V([1310,-420],12,[1485,-500],10),
    'The Hive':V([742.5,-247.5],3,[495,-495],140),
    'The Star':V([247.5,247.5],3,[0,495],100),
    'The Iris':V([1237.5,247.5],3,[1485,495],90),
    'A spill ground':V([-2160,-80],12,[-1990,10],0),
    'From the air':V([-1150,520],110,[-1460,280],40)};
   return Object.assign(V0,STAGE.extraViews||{});},
  start:'The Yards from the north flank',
  spine:(function(){const S=[[NEAR.x,NEAR.z]];for(let x=-2400;x<=2400;x+=800)for(let z=-2400;z<=2400;z+=800)S.push([x,z]);return S;})(),
  /* the factory kinds of the Ancients' keepers (kits/mechs culture ancient) on rounds of superblocks: the crane porter by the stacks, the lifter
     over the furnaces, the mender along the north row's racks, the courier by the works, the pallet porter by the tank farm (72: STAGE.keepers) */
  keepers:()=>[{key:'an_porter',x:-495,z:-495,seed:21,variant:0},{key:'an_lifter',x:-990,z:495,seed:22,variant:0},{key:'an_mender',x:-990,z:-495,seed:23,variant:0},
   {key:'an_courier',x:495,z:495,seed:24,variant:0},{key:'an_porter',x:-1485,z:-495,seed:25,variant:1}],
  budgetTris:20000000,budgetCalls:1200};})();
