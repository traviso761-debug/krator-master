// ================================================================= SIPHON PITS — placement (PLAN.md sections 3, 4 and 7)
// Every cell seeded from KRAND.cell(seed, ix, iz), every record from KRAND.hash (never from how many draws came before it). Reads the fields wet, rock,
// slope, cold, flat, deck (BIO.field); o.heat(x, z) the ground's temperature (KTHERM's bake), o.keep(x, z) 0 where the host keeps the ground bare
// (the water, the road, the camp, the farmsteads). Returns the counts.
//   SIPHON.buildPit(R, q, o)       station 3: the woolly siphon groves (the kin, capped: o.cap), their pelts, the felt, the galls (o.galls: wall points)
//   SIPHON.buildCold(R, q, o)      stations 2 and 4 (and the terraces' edges): cushion moss, rock lichen, scree sedge; never a tree
//   SIPHON.buildTerraces(R, q, o)  station 1: the crops on the terraces' treads (o.fieldAt(x, z) -> {crop, rows} or null), the willow by the braids
//                                  (o.braid(x, z) the distance to the water, from core/mask's distance field), sedge on the risers
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler,qUp}=BIO.fn,C=SIPHON.C,PAL=SIPHON.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
const band=(t,a,b,f)=>smooth(a-f,a+f,t)*smooth(b+f,b-f,t);
const F=n=>(x,z)=>BIO.field(n,x,z);
// a pass over a square of cells: fn(x, y, z, lv) with lv 2 near, 1 mid, 0 far; skipped past maxD from the LOD's centres
function cellPass(R,seed,cell,salt,maxD,keep,fn){const Lv=BIO.LOD(),c0=BIO.center(),N=Math.ceil(R*2/cell);
 for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.abs(x-c0[0])>R||Math.abs(z-c0[1])>R)continue;
  const ld=BIO.lodD(x,z);if(ld>maxD)continue;reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}}

// ---------------------------------------------------------------- station 3: the groves, the felt, the galls
SIPHON.buildPit=function(R,q,o){o=o||{};q=q==null?1:q;const st={trees:0,pelts:0,felt:0,galls:0,cap:o.cap==null?250:o.cap,candidates:0},seed=KRAND.child(1000098,'siphon/pit'),keep=o.keep||(()=>1),heat=o.heat||(()=>18);
 const rock=F('rock'),wet=F('wet'),deck=F('deck'),Lv=BIO.LOD();
 // THE WOOLLY SIPHON: the Throne's siphon as a kin, a little taller, its pelt this kit's. Groves where the ground is warm (22-60 degC) under the deck,
 // gathered by a slow field (communal groves, not a scatter). Every candidate cell scored by its hash; the best `cap` stand (the plan's tree cap)
 const K=BIO.kin('throne.siphon',{key:'woollysiphon',name:'Woolly siphon',scale:{H:1.0,rb:1.15,crownR:.75},colour:{bark:[0x6e5a40,0x76603e,0x665238],leaf:[0x6a7a3a,0x5e6e34,0x76844a]},
  tags:{koppen:['Cfa'],aridity:'subhumid',climate:'temperate',stations:['pitfloor'],tree:true,native:true,heat:[22,60]}});
 SIPHON.KIN=K;if(!K){st.missing='throne.siphon (the Throne kit not on the page)';return st;}
 const cands=[],cell=24,N=Math.ceil(R*2/cell);
 for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const h=KRAND.hash(seed,ix,iz,0x51F),x=-R+(ix+KRAND.unit(KRAND.hash(seed,ix,iz,1)))*cell,z=-R+(iz+KRAND.unit(KRAND.hash(seed,ix,iz,2)))*cell;
  if(BIO.mask(x,z)<=0||keep(x,z)<=0||rock(x,z)>.25||deck(x,z)<.5)continue;const T=heat(x,z),grove=smooth(.45,.7,KRAND.fbm(x*.0035,.7,z*.0035,2,seed&0xffff));
  const sc=band(T,22,60,5)*grove;if(sc<.05)continue;cands.push({x,z,s:sc*KRAND.unit(h),ix,iz});}
 st.candidates=cands.length;cands.sort((a,b)=>b.s-a.s||a.ix-b.ix||a.iz-b.iz);
 const keepOut=[];for(const c of cands){if(st.trees>=st.cap)break;if(keepOut.some(k=>Math.hypot(k[0]-c.x,k[1]-c.z)<16))continue;keepOut.push([c.x,c.z]);
  const y=Y(c.x,c.z),ld=BIO.lodD(c.x,c.z),lv=ld<Lv.hero?2:ld<Lv.mid?1:0;reseed(KRAND.cell(seed+7,c.ix,c.iz));
  const T=K.make(c.x,y,c.z);BIO.cur='throne/trees';K.grow(T,lv);BIO.cur='siphon/pit';
  SIPHON.TREES.push({key:'woollysiphon',kin:'throne.siphon',x:T.x,z:T.z,y0:T.y0,H:T.H,rb:T.rb});st.trees++;
  // the pelt: sleeves up the chimney (the Throne's bole flares at its foot and its lip: the pelt sits between), and fleece hanging from each ring
  reseed(KRAND.hash(seed,c.ix,c.iz,0x7E1));const n=lv===2?ri(6,9):lv===1?4:2,col=pickC(PAL.fleece,.03);
  for(let k=0;k<n;k++){const t=.12+.68*k/Math.max(1,n-1),hy=T.y0+T.H*t,rad=T.rb*(1.25+.25*Math.sin(k*1.7))*(1+.2*smooth(.2,0,t)),seg=T.H*.72/n*1.25;
   BIO.put('spfleece',[T.x,hy,T.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[rad,seg,rad],col.clone().offsetHSL(0,0,rr(-.05,.05)));st.pelts++;
   if(lv>0){const L=rr(1.2,2.4);BIO.put('spfringe',[T.x,hy+seg*.9,T.z],qEuler(0,rr(0,TAU),0),[rad*1.08,L,rad*1.08],pickC(PAL.fleeceTip,.03));}}}
 // THE FELT: crusts everywhere on the floor's warm damp ground, hummocks near; thinning and browning toward 60 degC, gone over it
 cellPass(R,seed,3.8,11,Lv.floor[1],keep,(x,y,z,lv)=>{if(lv===0&&rng()<.75)return;const T=heat(x,z),a=deck(x,z)*(1-smooth(.3,.55,rock(x,z)))*smooth(62,48,T)*(.55+.45*wet(x,z))*q;if(rng()>a)return;
  const dry=smooth(40,58,T),s=rr(.6,1.6);BIO.put('spfelt',[x,y+.02,z],qEuler(0,rr(0,TAU),0),[s,s*rr(.6,1),s],pickC(dry>.5?PAL.feltDry:PAL.felt,.03));st.felt++;
  if(lv===2&&rng()<.35){const h=rr(.25,.6);BIO.put('spfelthum',[x+rr(-.4,.4),y-.05,z+rr(-.4,.4)],qEuler(0,rr(0,TAU),0),[h*1.4,h,h*1.4],pickC(PAL.felt,.03));}});
 // THE GALLS: rows of bulbs on the wall's foot (the host's points: the fractures where the condensate runs)
 (o.galls||[]).forEach((w,i)=>{reseed(KRAND.hash(seed,i,0x6A1));if(rng()>q)return;const n=ri(3,9);
  for(let k=0;k<n;k++){const s=rr(.18,.6)*(w.s==null?1:w.s),dy=rr(0,2.4),dx=rr(-1.2,1.2);
   BIO.put('spgall',[w.x+w.tx*dx+w.nx*.15,w.y+dy,w.z+w.tz*dx+w.nz*.15],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s,s*rr(.8,1.3),s],pickC(PAL.gall,.03));st.galls++;}});
 return st;};

// ---------------------------------------------------------------- stations 2 and 4: the cold ground's small life (no trees)
SIPHON.buildCold=function(R,q,o){o=o||{};q=q==null?1:q;const st={cushion:0,lichen:0,sedge:0},seed=KRAND.child(1000099,'siphon/cold'),keep=o.keep||(()=>1),Lv=BIO.LOD();
 const rock=F('rock'),cold=F('cold'),flat=F('flat'),slope=o.slope||F('slope'),shelter=o.shelter||(()=>1),grass=o.grass==null?1:o.grass;
 cellPass(R,seed,3.4,21,Lv.floor[1],keep,(x,y,z,lv)=>{const a=(lv===2?.5:.18)*(1-smooth(.45,.75,slope(x,z)))*shelter(x,z)*(1-.4*smooth(.8,1,cold(x,z)))*q;if(rng()>a)return;
  const s=rr(.12,.45);BIO.put('spcushion',[x,y-.03,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,s*rr(.5,.8),s],pickC(PAL.cushion,.03));st.cushion++;});
 cellPass(R,seed,3.2,22,Lv.floor[1],keep,(x,y,z,lv)=>{const sl=slope(x,z),a=(lv===2?.6:.3)*smooth(.25,.6,sl)*q;if(rng()>a)return;
  const nn=o.normal?o.normal(x,z):[0,1,0],s=rr(.12,.4);BIO.put('splichen',[x+nn[0]*.04,y+.02,z+nn[2]*.04],qUp(nn),[s,1,s],pickC(PAL.lichen,.04));st.lichen++;});
 cellPass(R,seed,3.2,23,Lv.floor[1],keep,(x,y,z,lv)=>{const a=grass*(lv===2?.5:.25)*(1-smooth(.4,.65,slope(x,z)))*(1-smooth(.75,1,cold(x,z)))*shelter(x,z)*q;if(rng()>a)return;
  const s=rr(.3,.65);BIO.put('spsedge',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.3),s],pickC(PAL.sedge,.03));st.sedge++;});
 return st;};

// ---------------------------------------------------------------- station 1: the crops, the willow, the sedge
SIPHON.buildTerraces=function(R,q,o){o=o||{};q=q==null?1:q;const st={crops:0,willow:0,sedge:0,byCrop:{}},seed=KRAND.child(1000097,'siphon/terraces'),keep=o.keep||(()=>1),Lv=BIO.LOD();
 const rock=F('rock'),slope=F('slope'),fieldAt=o.fieldAt||(()=>null),braid=o.braid||(()=>1e9);
 // THE CROPS: rows on each field's tread (the field's crop, kits/crops'), dense near, thinner to the floor's far tier
 cellPass(R,seed,1.6,31,Lv.floor[0]*1.4,keep,(x,y,z,lv)=>{const f=fieldAt(x,z);if(!f||!f.crop)return;const row=Math.abs(((x*Math.cos(f.rows)+z*Math.sin(f.rows))/1.1)%1);
  if(row>.45||rng()>.9*q*(lv===2?1:.4))return;const it=SIPHON.CROP_ITEMS[f.crop.bucket]||'spgrain',s=f.crop.bucket==='grain'?rr(.45,.75):rr(.3,.55);
  BIO.put(it,[x,y-.04,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s*(f.crop.bucket==='grain'?rr(1.1,1.5):rr(.7,1)),s],pickC(PAL[f.crop.bucket]||PAL.grain,.03));
  st.crops++;st.byCrop[f.crop.id]=(st.byCrop[f.crop.id]||0)+1;});
 // THE WILLOW: knee-high clumps on the banks and the bars, 5-42 m from the water (core/mask's distance field: o.braid)
 const wb=o.willow||[5,42];
 cellPass(R,seed,3.2,32,Lv.floor[1]*1.5,keep,(x,y,z,lv)=>{const d=braid(x,z),a=smooth(wb[0]-2,wb[0]+2,d)*smooth(wb[1],wb[0]+8,d)*.7*q;if(rng()>a)return;
  const n=lv===2?ri(2,4):1;for(let k=0;k<n;k++){const px=x+rr(-1,1),pz=z+rr(-1,1),s=rr(.5,1.1);BIO.put('spwillow',[px,Y(px,pz)-.06,pz],qEuler(0,rr(0,TAU),0),[s*1.2,s,s*1.2],pickC(PAL.willow,.03));st.willow++;}});
 // THE SEDGE: on the risers and the uncut ground (no field there)
 cellPass(R,seed,2.6,33,Lv.floor[1],keep,(x,y,z,lv)=>{if(fieldAt(x,z))return;const a=.35*(1-smooth(.45,.7,slope(x,z)))*q;if(rng()>a)return;
  const s=rr(.3,.6);BIO.put('spsedge',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.3),s],pickC(PAL.sedge,.03));st.sedge++;});
 return st;};
})();
