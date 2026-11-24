/* ============================== HOOK: THE MANGROVES AND THE JUNGLE (S4, [web]) ============================== */
/* The Ancient city's flora (the owner's site plan, S4: "mangroves and jungle, kept off the walled clearings and the
   cliffs"): the Ring Sea isles kit (biomes/ringisles, the Ring Sea's own flora, with the Throne's and the East Abyss's
   trees it borrows), sealed with core/biome in HK_FLORA (77h, build.py hkf_bundle) and bound here to Port Hook's ground.
   It decides nothing about the ruin: it reads the plan (77) and its drawing (90c) and plants round them.
   - THE GROUND is the drawn one (HOOK_RUIN_DRAW.meshH: the terrain grid's triangle), so no tree floats over a cell.
   - THE FIELDS the kit's zones read, rasterized once every FS m over the square it grows on and read bilinearly (the
     kit reads a dozen fields a candidate, a few million candidates): slope and rock (the cliffs: the kit plants nothing
     where both are high, the owner's rule), wet and upland (the kit's own fallback for its classes: low and wet, its
     abyssal rainforest XA), beach (the strand above the water), mangal (the site plan's swamp bands, lf_hook_swamp*, and
     the shallows round them and round the drowned downtown), garden (the walled peninsula's cleared blocks and the
     Glebe's fields: the kit keeps its wild out of a garden).
   - THE MASK: nothing in Port Hook's own zone (the town draws its own nature), on a walled clearing, or in water deeper
     than the mangroves stand; the walled ground's uncleared blocks at the wild share the plan gives them (picked clean).
   - THE OBSTACLES: every tower's footprint as it is drawn (a string of circles along a long one, a fallen one along its
     length), the heaps, the freeway's piers and its standing decks (a giant tree under a deck would pierce it), the
     wall and its gates, and the thirteen places (their ground kept for S5's hamlets and camps).
   - LOD: the kit's own, static by distance from a spine of points through the ruin (hero, mid, far impostors); the
     floor (grass, undergrowth) within floorR of the centre only.
   The ground under them is painted by 77k (mangrove mud, the forest floor).
   window._hookFlora holds what verify.py reads. */
const HOOK_FLORA={on:false,stats:null,ms:0,FS:20,R:2600,centre:[-200,-2300],q:.7,floorR:900};
(()=>{const F=typeof HK_FLORA!=='undefined'?HK_FLORA:null,R=typeof HOOK_RUIN!=='undefined'?HOOK_RUIN:null,D=typeof HOOK_RUIN_DRAW!=='undefined'?HOOK_RUIN_DRAW:null;
 if(!F||!R||!D||!D.meshH){window._hookFlora={on:false,why:!F?'no HK_FLORA':!R?'no ruin':'no drawing'};return;}
 const t0=performance.now(),B=F.BIO,RI=F.kits.ringisles,meshH=D.meshH,HF=HOOK_FLORA;
 const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const ZONE=((HOOK_SITE.districts||[]).find(d=>d.type==='zone')||{}).poly||null;
 /* ---- the plan's blocks by lattice cell (a merged block on every cell it covers) */
 const PITCH=R.PITCH,cx0=R.cx(0),cz0=R.cz(0),cells=new Map();
 for(const b of R.blocks)for(let a=0;a<b.si;a++)for(let c=0;c<b.sj;c++)cells.set((b.i+a)+','+(b.j+c),b);
 const blockAt=(x,z)=>cells.get(Math.round((x-cx0)/PITCH)+','+Math.round((cz0-z)/PITCH))||null;
 /* ---- the swamps and the drowned downtown (core/world 41l benches, in the world's frame) */
 const W=HOOK_WORLD,swamps=WLAND.benches.filter(b=>/^lf_hook_swamp/.test(b.id)),SUNK=WLAND.benches.find(b=>b.id==='lf_hook_sunk');
 const swampW=(x,z)=>{const w=W.toWorld(x,z);let m=0;for(const b of swamps){const d=WLAND.benchD(b,w[0],w[1]);if(d<80){m=Math.max(m,d===0?1:1-d/80);if(m>=1)break;}}return m;};
 const sunkNear=(x,z)=>{if(!SUNK)return 0;const w=W.toWorld(x,z),d=WLAND.benchD(SUNK,w[0],w[1]);return d<300?1-d/300:0;};
 /* ---- the raster: every FS m over the square, its margin a node each side */
 const FS=HF.FS,C=HF.centre,RR=HF.R,X0=C[0]-RR-FS,Z0=C[1]-RR-FS,N=Math.ceil((2*RR+2*FS)/FS)+1,NN=N*N;
 const RH=new Float32Array(NN),RS=new Float32Array(NN),RB=new Float32Array(NN),RM=new Float32Array(NN),RG=new Float32Array(NN),RK=new Uint8Array(NN);
 /* the ground's kind at a node: 0 open, 1 walled (picked clean), 2 a walled clearing or field, 3 the town */
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=X0+i*FS,z=Z0+j*FS,h=meshH(x,z);RH[k]=h;
  const e=3,s=Math.min(1,Math.hypot(meshH(x+e,z)-meshH(x-e,z),meshH(x,z+e)-meshH(x,z-e))/(2*e)*1.6);RS[k]=s;
  if(ZONE&&inPoly(x,z,ZONE)){RK[k]=3;continue;}
  const b=blockAt(x,z);if(b&&b.ground==='walled')RK[k]=b.use?2:1;
  RG[k]=RK[k]===2?1:0;
  if(RK[k]===2)continue;   /* a clearing: no mangal (the mangroves' pass reads its own depth, not the mask) */
  const sw=h<6&&h>-3?swampW(x,z):0,sh=sm(-2.2,-.9,h)*sm(1,.3,h),mg=Math.max(sw*sm(3,1.4,h),sh*Math.max(sw>0?1:0,sunkNear(x,z)));RM[k]=mg;
  RB[k]=sm(.15,.6,h)*sm(3.2,1.8,h)*(1-mg);}
 const at=(A,x,z)=>{let u=(x-X0)/FS,v=(z-Z0)/FS;if(u<0||v<0||u>=N-1||v>=N-1)return 0;const i=u|0,j=v|0;u-=i;v-=j;const k=j*N+i;
  return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+N]*(1-u)+A[k+N+1]*u)*v;};
 const kindAt=(x,z)=>{const i=Math.round((x-X0)/FS),j=Math.round((z-Z0)/FS);return i<0||j<0||i>=N||j>=N?0:RK[j*N+i];};
 const FIELDS={slope:(x,z)=>at(RS,x,z),rock:(x,z)=>sm(.5,.82,at(RS,x,z)),wet:()=>.78,upland:(x,z)=>Math.max(0,Math.min(1,meshH(x,z)/150)),
  beach:(x,z)=>at(RB,x,z),mangal:(x,z)=>{const k=kindAt(x,z);return k===2||k===3?0:at(RM,x,z);},garden:(x,z)=>at(RG,x,z),salt:()=>0};
 /* ---- the mask: off the town, the clearings, deep water; the walled ground's uncleared blocks at their wild share */
 const MANGAL_DEEP=-1.2;
 const mask=(x,z)=>{const k=kindAt(x,z);if(k===3||k===2)return 0;const h=meshH(x,z);if(h<MANGAL_DEEP)return 0;
  if(h<.15&&at(RM,x,z)<.3)return 0;   /* in the water only where the mangal stands */
  if(k===1){const b=blockAt(x,z);return b?Math.max(.1,b.wild):.3;}return 1;};
 /* ---- the obstacles: every drawn footprint, the freeway, the wall, the places */
 const OB=[];const line=(x0,z0,x1,z1,r,step)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let a=0;a<=n;a++)OB.push({x:x0+(x1-x0)*a/n,z:z0+(z1-z0)*a/n,r});};
 for(const t of D.towers){const s=Math.min(t.w,t.d),L=Math.max(t.w,t.d),r=s/2*1.15+3,ax=t.w>=t.d?[Math.cos(t.yaw),-Math.sin(t.yaw)]:[Math.sin(t.yaw),Math.cos(t.yaw)],h=Math.max(0,(L-s)/2);
  line(t.x-ax[0]*h,t.z-ax[1]*h,t.x+ax[0]*h,t.z+ax[1]*h,r,Math.max(4,s*.6));}
 for(const h of R.heaps)OB.push({x:h.x,z:h.z,r:(h.r||10)+2});
 for(const p of D.piers)OB.push({x:p.x,z:p.z,r:6});
 for(const s of R.spans)if(s.state!=='fallen')line(s.p0[0],s.p0[1],s.p1[0],s.p1[1],15,10);
 line(R.ramp.p0[0],R.ramp.p0[1],R.ramp.p1[0],R.ramp.p1[1],13,10);
 line(R.wall.p0[0],R.wall.p0[1],R.wall.p1[0],R.wall.p1[1],8,8);for(const g of R.gates)OB.push({x:g.x,z:g.z,r:22});
 for(const p of R.places)OB.push({x:p.x,z:p.z,r:p.kind==='hamlet'?70:p.kind==='camp'?40:25});
 /* ---- the LOD spine: the town's edge, the Crown, the Drowned Spire, the road in, the downtown's ring, the mainland */
 const SPINE=[[0,-400],[R.crown.x,R.crown.z],[R.spire.x,R.spire.z],[-1500,-2500],[1500,-2300],[-600,-4300],[2200,-900],[-2400,-800]];
 const group=new THREE.Group();group.name='hook-flora';scene.add(group);
 try{
  B.init({tags:'ringisles',THREE,scene:group,terrainH:(x,z)=>meshH(x,z),waterH:()=>0,mask,obstacles:OB,
   ticks:fn=>{let tt=0;PORT_FRAME.push(dt=>{const d=dt==null?.016:Math.min(.1,dt);tt+=d;fn(d,tt);});},
   seed:4171,origin:SPINE,center:C,fields:FIELDS,err:m=>console.warn('hook flora: '+m),
   eye:()=>[camera.position.x,camera.position.y,camera.position.z],lod:{hero:180,mid:520,far:RR*1.5,floor:[120,320]}});
  if(B.setSun)B.setSun([-.5,.76,.52]);
  F.reseed(4172);const TM=HF.times={raster:Math.round(performance.now()-t0)};let tk=performance.now();const lap=n=>{const t=performance.now();TM[n]=Math.round(t-tk);tk=t;};
  /* the kit's build in its parts (RINGISLES.build orders them so), each timed */
  const st={R:RR,quality:HF.q};RI.clearTrees();
  B.cur='ringisles/trees';Object.assign(st,RI.buildTrees(RR,HF.q));lap('trees');
  if(RI.buildDressing){B.cur='ringisles/dressing';st.dressing=RI.buildDressing(HF.q);lap('dressing');}
  /* the floor (grass and undergrowth, close-up detail) round the downtown's heart only: over the whole square it took 16 s */
  if(RI.buildFloor){B.cur='ringisles/floor';Object.assign(st,RI.buildFloor(HF.floorR,HF.q));lap('floor');}
  B.cur=null;st.bake=B.bake();lap('bake');if(B.lodTick)PORT_FRAME.push(()=>B.lodTick(camera));
  if(B.bakeImpostors&&typeof renderer!=='undefined'){try{B.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('hook flora impostors: '+(e&&e.message||e));}}lap('impostors');
  HF.on=true;HF.stats=st;}
 catch(e){reportErr('hook flora: '+(e&&e.stack||e));}
 HF.ms=Math.round(performance.now()-t0);HF.group=group;HF.fields=FIELDS;HF.mask=mask;HF.obstacles=OB;HF.kindAt=kindAt;
 /* the trees as placed, for the checks: the kit's list (RINGISLES.TREES: its own and the borrowed, grown by their kits) */
 const trees=(RI.TREES||[]).map(T=>({own:T.sp!=null&&!T.bo&&!T.kit,x:T.x,z:T.z,y:T.y0==null?(T.y==null?null:T.y):T.y0,H:T.H||0}));
 HF.trees=trees;
 window._hookFlora={on:HF.on,ms:HF.ms,times:HF.times,stats:HF.stats?{gardens:HF.stats.gardens,keys:Object.keys(HF.stats)}:null,trees:trees.length,obstacles:OB.length,raster:N+'x'+N+' at '+FS+' m'};})();
