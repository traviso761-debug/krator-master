// ================================================================= ARCH — placement (PLAN.md sections 3.5 and 7)
// ARCHB.buildArch(R, q, o): the Arch's life on a station's ground, every cell seeded from KRAND.cell(seed, ix, iz) (never from how many draws came before
// it). Every plant asks the chemistry first: o.ph(x, z) the ground's pH, o.heat(x, z) its temperature (degC: KTHERM's bake), o.soil(x, z) the soil
// record ARCH.uptake reads, o.keep(x, z) 0 where the host keeps the ground bare (the water). EARTH grows only where ARCH.earthOk says so; NATIVE only
// where ARCH.lifeAt is 'native' (or, for the verdigris cap, beside Earth's on the richest nickel); nothing where it is 'none'.
// ARCHB.curtains(meet, line, q): the curtain field along a meeting's dividing line, from the meeting's samples (42: ARCH.meeting): a wall wherever a
// sample says it can stand, none past the last; the young hems on the margins. Returns the counts and the placed curtains' records (for the verify).
// ARCHB.flames(list, q): the seep combs round the flame cleft. Reads the fields wet, rock, slope (BIO.field).
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=ARCHB.C,PAL=ARCHB.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
ARCHB.LOG=[];   /* every placed plant's chemistry check, for the verify: [item, x, z, life] */
ARCHB.buildArch=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;
 const st={araucaria:0,kauri:0,gymnostoma:0,pycnandra:0,phyllanthus:0,sedge:0,lepidosperma:0,dracophyllum:0,codia:0,grevillea:0,
  pitchers:0,drosera:0,treefern:0,paperbark:0,limeshelf:0,verdigris:0,felt:0,fans:0,ohia:0,rata:0,uluhe:0,nephrolepis:0,
  mangrove:0,avicennia:0,verdigrismangrove:0,casuarina:0,pandan:0,tamanu:0,hibiscus:0,naupaka:0,ipomoea:0,coconut:0,
  kelp:0,seagrass:0,byssus:0,oyster:0},seed=KRAND.child(1000031,'arch/life'),
  keep=o.keep||(()=>1),strand=o.strand||null,lava=o.lava||(()=>null),mud=o.mud||(()=>0),heat=o.heat||(()=>28),ph=o.ph||(()=>6),soil=o.soil||((x,z)=>({ni:3000,pH:ph(x,z),caMg:.08}));
 const F=n=>(x,z)=>BIO.field(n,x,z),wet=F('wet'),rock=F('rock'),slope=F('slope');
 const Lv=BIO.LOD(),c0=BIO.center();
 const chem=(x,z)=>({pH:ph(x,z),T:heat(x,z),caMg:soil(x,z).caMg,lavaAge:lava(x,z)});
 /* the maquis is serpentine ground's: never on the basalt of a flow, in the sound's mud, on cove's western basalt headland, or inside the +-7 m tide band */
 const cv=o.cove||null,lk=o.lakes||null,tKeep=(x,z)=>!cv||cv.treeKeep(x,z)>0;
 const earth=(x,z)=>!strand&&(!cv||(!cv.westBasalt(x,z)&&Y(x,z)>7.4))&&(!lk||lk.riparian(x,z)<.38)&&ARCH.earthOk(chem(x,z))&&lava(x,z)==null&&!mud(x,z);
 const pioneer=(x,z)=>lava(x,z)!=null&&ARCH.earthOk(chem(x,z)),life=(x,z)=>ARCH.lifeAt(chem(x,z));
 const leanDown=(x,z)=>{const e=3,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e);return gx||gz?Math.atan2(-gz,-gx):null;};
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const log=(it,x,z)=>ARCHB.LOG.push([it,x,z,life(x,z),ph(x,z),heat(x,z)]);
 // CANDELABRA ARAUCARIA: scattered over the maquis, more on the dome's crests (the drier, better-drained ground)
 cellPass(60,1,Lv.far,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const a=.3*(1-smooth(.4,.7,rock(x,z)))*(.6+.6*BIO.field('upland',x,z))*q;if(rng()>a)return;
  const H=rr(8,20),tc=pickC(PAL.araucBark,.02),rc=pickC(PAL.needles,.03),yaw=rr(0,TAU);
  ARCHB.recTree('araucaria',x,y,z,3.6,H);
  BIO.put('artrunk',[x,y-.2,z],qEuler(rr(-.03,.03),yaw,rr(-.03,.03)),[(.15+H*.012)/.05,H,(.15+H*.012)/.05],tc);
  const tiers=Math.round(H/2.6);for(let t=0;t<tiers;t++){const hy=H*(.35+.6*t/Math.max(1,tiers-1)),n=t===tiers-1?0:ri(2,4),L=(1-t/tiers)*rr(1.6,3.6)+.6;
   for(let k=0;k<n;k++){const az=yaw+k/n*TAU+rr(-.3,.3);/* an arm out and turning up: a bowed stalk lying along its azimuth, its bow lifting the tip */
    BIO.put('arbough',[x,y+hy,z],qEuler(0,az,Math.PI/2-rr(.12,.3)),[2.2,L,2.2],rc);}}
  BIO.put('arbough',[x,y+H*.85,z],qEuler(0,yaw,0),[2.4,H*.2+1.5,2.4],rc);log('artrunk',x,z);st.araucaria++;});
 // MAQUIS KAURI (Agathis): columnar spar conifers with weeping golden kauri-gum on laterite ridges and benches
 cellPass(68,31,Lv.far,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const a=.26*(1-smooth(.38,.68,rock(x,z)))*(.45+.55*wet(x,z))*q;if(rng()>a)return;
  const H=rr(7.5,16.5);ARCHB.growKauri(x,y,z,H,KRAND.hash(seed+301,Math.round(x*10),Math.round(z*10)),lv);log('arkauri_trunk',x,z);st.kauri++;});
 // MAQUIS SHE-OAK: the commonest shrub, everywhere Earth can grow, thinning on the steeps
 cellPass(9,2,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.48*(1-smooth(.45,.75,rock(x,z)))*q;if(rng()>a)return;const n=lv===2?ri(2,3):1;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.8,2.2):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||!earth(px,pz))continue;
   const s=rr(1.4,4.2)*ARCH.stunt(Object.assign({n:.15,p:.12},soil(px,pz)))*2.2;
   ARCHB.growGymnostoma(px,Y(px,pz),pz,s,KRAND.hash(seed+201,Math.round(px*10),Math.round(pz*10)+k),lv);log('argymno',px,pz);st.gymnostoma++;}});
 // SEVE BLEUE & PHYLLANTHUS: the wetter hollows & garnierite rims of the laterite (nickel hoarders recorded in ARCHB.HOARD)
 ARCHB.HOARD=[];
 cellPass(14,3,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const sl=soil(x,z);if((sl.ni||0)<1800)return;
  const a=.45*smooth(.45,.75,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;
  const s=rr(2.5,6),up=ARCH.uptake('pycnandra',sl),yaw=rr(0,TAU),cy=rr(0,TAU),tc=pickC(PAL.trunk,.02),lc=pickC(PAL.glossy,.03);
  if(!up.hyper)return;
  ARCHB.recTree('pycnandra',x,y,z,s*.35,s*.7);
  BIO.tree(x,z,()=>{BIO.put('arpycntrunk',[x,y-.12,z],qEuler(0,yaw,0),[1.05+s*.14,s*.48,1.05+s*.14],tc);
   BIO.put('arpycn',[x,y+s*.36,z],qEuler(0,cy,0),[s*.56,s*.58,s*.56],lc,{n:[0,1,0]});});
  ARCHB.HOARD.push({x,z,leaf:up.leaf,latex:up.latex});log('arpycn',x,z);st.pycnandra++;});
 cellPass(16,32,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const sl=soil(x,z);if((sl.ni||0)<2200)return;
  const a=.36*smooth(2200,3800,sl.ni)*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;
  const up=ARCH.uptake('phyllanthus',sl);if(!up.hyper)return;
  const s=rr(1.2,2.8);BIO.put('arphyllanthus',[x,y-.08,z],qEuler(0,rr(0,TAU),0),[s*.72,s*.68,s*.72],pickC(PAL.phyllanthus,.03),{n:[0,1,0]});
  ARCHB.HOARD.push({x,z,leaf:up.leaf,latex:up.latex});log('arphyllanthus',x,z);st.phyllanthus++;});
 // ULTRAMAFIC MAQUIS FLOWERING SHRUBS: Dracophyllum, Codia & Grevillea exul (PLAN.md section 7)
 cellPass(15,33,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.38*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;
  const s=rr(1.1,2.6);ARCHB.growDracophyllum(x,y,z,s,KRAND.hash(seed+333,Math.round(x*10),Math.round(z*10)),lv);log('ardracophyllum',x,z);st.dracophyllum++;});
 cellPass(14,34,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.36*(1-smooth(.48,.78,rock(x,z)))*q;if(rng()>a)return;
  const s=rr(1.0,2.3),yaw=rr(0,TAU);BIO.put('arcodia',[x,y-.08,z],qEuler(0,yaw,0),[s*.82,s*.68,s*.82],pickC(PAL.codia,.03),{n:[0,1,0]});
  if(lv>0&&rng()<.65){const bs=rr(.22,.36);BIO.put('arcodia_bloom',[x,y+s*.42,z],qEuler(0,yaw+.8,0),[bs,bs*.85,bs],pickC(PAL.codiaBloom,.02));}
  log('arcodia',x,z);st.codia++;});
 cellPass(15,35,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.36*(.35+.65*rock(x,z))*(1-smooth(.62,.86,slope(x,z)))*q;if(rng()>a)return;
  const s=rr(1.1,2.5),yaw=rr(0,TAU);BIO.put('argrevillea',[x,y-.08,z],qEuler(0,yaw,0),[s*.85,s*.72,s*.85],pickC(PAL.grevillea,.03),{n:[0,1,0]});
  if(lv>0&&rng()<.62){const bs=rr(.26,.42);BIO.put('argrevillea_bloom',[x,y+s*.46,z],qEuler(0,yaw+1.1,0),[bs,bs*.9,bs],pickC(PAL.grevBloom,.03));}
  log('argrevillea',x,z);st.grevillea++;});
 // WET GULLY UNDERSTOREY & BENCH TREES: Cyathea tree-fern, Melaleuca paperbark & Gorge rata
 cellPass(19,36,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const a=.44*smooth(.44,.78,wet(x,z))*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;
  const H=rr(2.6,5.8);ARCHB.growTreeFern(x,y,z,H,KRAND.hash(seed+361,Math.round(x*10),Math.round(z*10)),lv);log('artreefern_trunk',x,z);st.treefern++;});
 cellPass(28,37,Lv.far,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const a=.36*smooth(.38,.74,wet(x,z))*(1-smooth(.42,.72,rock(x,z)))*q;if(rng()>a)return;
  const H=rr(4.5,10.5);ARCHB.growPaperbark(x,y,z,H,KRAND.hash(seed+371,Math.round(x*10),Math.round(z*10)));log('arpaperbark_trunk',x,z);st.paperbark++;});
 cellPass(34,38,Lv.far,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z))return;const a=.30*(.18+.82*smooth(.12,.48,rock(x,z)))*(1-smooth(.65,.88,slope(x,z)))*q;if(rng()>a)return;
  const H=rr(6.0,13.5),flw=rng()<.42;ARCHB.growRata(x,y,z,H,KRAND.hash(seed+381,Math.round(x*10),Math.round(z*10)),flw);log('arrata_trunk',x,z);st.rata++;});
 // MAQUIS SEDGE (Costularia) & SWORD-SEDGE (Lepidosperma): tussocks on the bare laterite and drainage rims
 cellPass(4.2,4,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.34*(1-smooth(.4,.7,rock(x,z)))*q;if(rng()>a)return;const s=rr(.35,.75);
  BIO.put('arsedge',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.3),s],pickC(PAL.sedge,.03));log('arsedge',x,z);st.sedge++;});
 cellPass(6.5,39,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.36*(.4+.6*wet(x,z))*(1-smooth(.45,.75,rock(x,z)))*q;if(rng()>a)return;const s=rr(.55,1.15);
  BIO.put('arlepidosperma',[x,y-.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*.82,s*rr(1.15,1.5),s*.82],pickC(PAL.lepido,.03));log('arlepidosperma',x,z);st.lepidosperma++;});
 // PITCHER PLANTS & SUNDEWS: carnivory on the poorest wettest laterite seeps
 cellPass(6,5,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.5*smooth(.6,.85,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;const n=lv===2?ri(3,7):ri(1,3);
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.15,.9):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||!earth(px,pz))continue;const s=rr(.05,.11);
   BIO.put('arpitch',[px,Y(px,pz)-.01,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*1.4,s],pickC(PAL.pitcher,.03));log('arpitch',px,pz);st.pitchers++;}});
 cellPass(5.5,40,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.46*smooth(.58,.84,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;const n=lv===2?ri(2,5):ri(1,2);
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.12,.65):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||!earth(px,pz))continue;const s=rr(.08,.18);
   BIO.put('ardrosera',[px,Y(px,pz)+.01,pz],qEuler(0,rr(0,TAU),0),[s,s*.55,s],pickC(PAL.drosera,.03));log('ardrosera',px,pz);st.drosera++;}});
 // LIME SHELF: the travertine aprons (pH over 9.5, native ground), on the terraces' rims
 cellPass(3.2,6,Lv.floor[1],(x,y,z,lv)=>{if(life(x,z)!=='native'||ph(x,z)<9.5)return;const a=.5*(1-smooth(.5,.8,slope(x,z)))*q;if(rng()>a)return;const n=lv===2?ri(2,4):1;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.2,.8):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||ARCH.lifeAt(chem(px,pz))!=='native')continue;const s=rr(.12,.45);
   BIO.put('arlime',[px,Y(px,pz)+s*.1,pz],qEuler(rr(-.15,.15),rr(0,TAU),0),[s,s,s],pickC(PAL.lime,.02));log('arlime',px,pz);st.limeshelf++;}});
 // ACID FELT: the acid ground (pH under 4, under 70 degC), mats on the banks
 cellPass(3.2,7,Lv.floor[1],(x,y,z,lv)=>{const c=chem(x,z);if(ARCH.lifeAt(c)!=='native'||c.pH>4||c.T>70)return;const a=.5*q;if(rng()>a)return;const n=lv===2?ri(2,4):1;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.2,1.1):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||ARCH.lifeAt(chem(px,pz))!=='native')continue;const s=rr(.25,.9);
   BIO.put('arfelt',[px,Y(px,pz)+.01,pz],qEuler(0,rr(0,TAU),0),[s,s*.4,s],pickC(PAL.felt,.03));log('arfelt',px,pz);st.felt++;}});
 // STEAM FANS: ground at 45-90 degC (the solfatara's ring, the springs' boils)
 cellPass(2.5,8,Lv.floor[1],(x,y,z,lv)=>{const T=heat(x,z);if(T<45||T>88||ARCH.lifeAt(chem(x,z))!=='native')return;const a=.6*q;if(rng()>a)return;const s=rr(.18,.5);
  BIO.put('arfan',[x,y,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.8,s],pickC(PAL.fan,.03));log('arfan',x,z);st.fans++;});
 // VERDIGRIS CAP: native, beside the Earth hoarders on the richest nickel (the soil's nickel over 3,800 mg/kg), Earth's ground
 cellPass(9,9,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const sl=soil(x,z);if(sl.ni<3800)return;const a=.35*smooth(3800,4400,sl.ni)*(1-rock(x,z))*q;if(rng()>a)return;
  const s=rr(.3,1.6),hs=rr(.3,.7)*s;BIO.put('arverdstalk',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[s*.6,hs,s*.6],pickC(PAL.verdFlesh,.02));
  BIO.put('arverd',[x,y+hs*.95,z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[s,s,s],pickC(PAL.verd,.03));
  ARCHB.HOARD.push({x,z,leaf:ARCH.uptake('verdigris',sl).leaf,native:true});log('arverd',x,z);st.verdigris++;});
 // THE LAVA'S PIONEERS: ohia, uluhe and nephrolepis sword-fern on a flow older than their lag (ARCH.earthOk)
 cellPass(16,10,Lv.mid,(x,y,z,lv)=>{if(!pioneer(x,z))return;const a=.55*smooth(30,160,lava(x,z))*q;if(rng()>a)return;const H=rr(3.2,8.4),flw=rng()<.45;
  ARCHB.growOhia(x,y,z,H,KRAND.hash(seed+110,Math.round(x*10),Math.round(z*10)),flw);log('arohia',x,z);st.ohia++;});
 cellPass(5.2,11,Lv.floor[1],(x,y,z,lv)=>{if(!pioneer(x,z))return;const a=.58*smooth(20,120,lava(x,z))*q;if(rng()>a)return;
  const n=lv>0?ri(1,3):1;for(let k=0;k<n;k++){const ox=x+(k?rr(-1.3,1.3):0),oz=z+(k?rr(-1.3,1.3):0);if(k&&(!pioneer(ox,oz)||BIO.mask(ox,oz)<=0))continue;
   const s=rr(.95,1.85);BIO.put('aruluhe',[ox,Y(ox,oz)-.04,oz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.95,s],pickC(PAL.uluhe,.03));log('aruluhe',ox,oz);st.uluhe++;}});
 cellPass(6.2,41,Lv.floor[1],(x,y,z,lv)=>{if(!pioneer(x,z))return;const a=.52*smooth(18,90,lava(x,z))*q;if(rng()>a)return;
  const s=rr(.52,.98);BIO.put('arnephrolepis',[x,y-.03,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.92,s],pickC(PAL.nephro,.03));log('arnephrolepis',x,z);st.nephrolepis++;});
 // THE STRAND (the coast station: o.strand(x, z) 0..1): she-oak, coconut, pandanus, tamanu, sea-hibiscus, naupaka, ipomoea
 if(strand){const ok=(x,z)=>strand(x,z)>.05&&ARCH.earthOk(chem(x,z));
  cellPass(22,13,Lv.far,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.52*smooth(.2,.7,strand(x,z))*q;if(rng()>a)return;const H=rr(6.8,16.2);
   ARCHB.growCasuarina(x,y,z,H,KRAND.hash(seed+113,Math.round(x*10),Math.round(z*10)));log('arcastrunk',x,z);st.casuarina++;});
  cellPass(26,14,Lv.far,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.38*smooth(.35,.9,strand(x,z))*q;if(rng()>a)return;const H=rr(8,16.5),yaw=rr(0,TAU),lean=rr(.14,.36);
   ARCHB.growCoconut(x,y,z,H,yaw,lean,KRAND.hash(seed+114,Math.round(x*10),Math.round(z*10)),lv);log('arpalmtrunk',x,z);st.coconut++;});
  cellPass(20,42,Lv.mid,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.44*smooth(.12,.65,strand(x,z))*q;if(rng()>a)return;const H=rr(3.8,7.8);
   ARCHB.growPandan(x,y,z,H,KRAND.hash(seed+421,Math.round(x*10),Math.round(z*10)),leanDown(x,z),lv);log('arpandan_trunk',x,z);st.pandan++;});
  cellPass(32,43,Lv.far,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.34*smooth(.45,.92,strand(x,z))*q;if(rng()>a)return;const H=rr(7.5,14.5);
   ARCHB.growTamanu(x,y,z,H,KRAND.hash(seed+431,Math.round(x*10),Math.round(z*10)));log('artamanu_trunk',x,z);st.tamanu++;});
  cellPass(18,44,Lv.mid,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.42*smooth(.25,.75,strand(x,z))*q;if(rng()>a)return;const H=rr(3.2,6.2);
   ARCHB.growHibiscus(x,y,z,H,KRAND.hash(seed+441,Math.round(x*10),Math.round(z*10)));log('arhibiscus_fol',x,z);st.hibiscus++;});
  cellPass(6,15,Lv.mid,(x,y,z,lv)=>{if(!ok(x,z))return;const a=.5*smooth(.1,.5,strand(x,z))*q;if(rng()>a)return;const s=rr(.8,2);
   BIO.put('arnaupaka',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[s*1.2,s,s*1.2],pickC(PAL.naupaka,.03),{n:[0,1,0]});log('arnaupaka',x,z);st.naupaka++;});
  cellPass(3,16,Lv.floor[1],(x,y,z,lv)=>{const sa=o.sand?o.sand(x,z):0;if(sa<.3||!ARCH.earthOk(chem(x,z)))return;const a=.45*q;if(rng()>a)return;const n=lv===2?ri(2,5):1;
   for(let k=0;k<n;k++){const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2);if(BIO.mask(px,pz)<=0)continue;const s=rr(.2,.5);BIO.put('aripomoea',[px,Y(px,pz)+.01,pz],qEuler(0,rr(0,TAU),0),[s,s,s],pickC(PAL.ipomoea,.03));log('aripomoea',px,pz);st.ipomoea++;}});
  cellPass(8,45,Lv.floor[1],(x,y,z,lv)=>{if(y<2.5||strand(x,z)>.35||!ARCH.earthOk(chem(x,z)))return;const a=.38*(.3+.7*rock(x,z))*q;if(rng()>a)return;
   const s=rr(.55,1.0);BIO.put('arnephrolepis',[x,y-.03,z],qEuler(0,rr(0,TAU),0),[s,s*.9,s],pickC(PAL.nephro,.03));log('arnephrolepis',x,z);st.nephrolepis++;});}
 // THE MANGROVES: Rhizophora, outer Avicennia with pneumatophores, and Ni-rich Teal-Sap Prop-Wood (Rhizophora pycnandroides)
 cellPass(7.5,12,Lv.mid,(x,y,z,lv)=>{if(!mud(x,z)||!ARCH.earthOk(chem(x,z)))return;const a=.72*q;if(rng()>a)return;
  const r0=Math.max(y,BIO.host.waterH(x,z)),sl=soil(x,z),roll=rng();
  if((sl.ni||0)>=1800&&roll<.28){const up=ARCH.uptake('verdigrismangrove',sl);if(up.hyper){
   const H=rr(4.8,8.6);ARCHB.growVerdigrisMangrove(x,y,z,r0,H,KRAND.hash(seed+121,Math.round(x*10),Math.round(z*10)),lv);
   ARCHB.HOARD.push({x,z,leaf:up.leaf,latex:up.latex});log('arverdigris_fol',x,z);st.verdigrismangrove++;return;}}
  if(roll<.62){const H=rr(3.4,7.0);ARCHB.growAvicennia(x,y,z,r0,H,KRAND.hash(seed+122,Math.round(x*10),Math.round(z*10)),lv);log('aravicennia_fol',x,z);st.avicennia++;return;}
  const H=rr(3,7),yaw=rr(0,TAU),nP=lv>0?6:3;
  ARCHB.recTree('mangrove',x,r0,z,H*.45,H);
  BIO.tree(x,z,()=>{for(let k=0;k<nP;k++){const az=yaw+k/nP*TAU;BIO.put('armangroveprop',[x,r0+H*.32,z],qEuler(0,az,Math.PI-rr(.5,.8)),[1.2,H*.38,1.2],pickC(PAL.prop,.02));}
   BIO.put('armangrove',[x,r0+H*.45,z],qEuler(0,rr(0,TAU),0),[H*.55,H*.5,H*.55],pickC(PAL.mangrove,.02),{n:[0,1,0]});});log('armangrove',x,z);st.mangrove++;});
 // COVE WESTERN BASALT HEADLAND & SOUTHERN GJAR STREAM (strictly above +7.6 m and outside Arcoforte clearR)
 if(cv){const westOk=(x,z)=>cv.westBasalt(x,z)>0&&Y(x,z)>7.6&&tKeep(x,z)&&ARCH.earthOk(chem(x,z));
  cellPass(28,21,Lv.far,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.42*(1-smooth(.45,.75,rock(x,z)))*q;if(rng()>a)return;const H=rr(7.2,14.5);
   ARCHB.growCasuarina(x,y,z,H,KRAND.hash(seed+211,Math.round(x*10),Math.round(z*10)));log('arcastrunk',x,z);st.casuarina++;});
  cellPass(16,22,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.58*(1-smooth(.5,.82,rock(x,z)))*q;if(rng()>a)return;const H=rr(4.4,9.6),flw=rng()<.48;
   ARCHB.growOhia(x,y,z,H,KRAND.hash(seed+222,Math.round(x*10),Math.round(z*10)),flw);log('arohia',x,z);st.ohia++;});
  cellPass(25,23,Lv.far,(x,y,z,lv)=>{if(!westOk(x,z)||y>85)return;const a=.44*smooth(85,16,y)*(1-smooth(.45,.75,rock(x,z)))*q;if(rng()>a)return;const H=rr(6.5,13.5),yaw=rr(0,TAU),lean=rr(.12,.34);
   ARCHB.growCoconut(x,y,z,H,yaw,lean,KRAND.hash(seed+231,Math.round(x*10),Math.round(z*10)),lv);log('arpalmtrunk',x,z);st.coconut++;});
  cellPass(22,46,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z)||y>72)return;const a=.46*smooth(72,12,y)*(1-smooth(.52,.82,rock(x,z)))*q;if(rng()>a)return;const H=rr(3.8,7.6);
   ARCHB.growPandan(x,y,z,H,KRAND.hash(seed+461,Math.round(x*10),Math.round(z*10)),leanDown(x,z),lv);log('arpandan_trunk',x,z);st.pandan++;});
  cellPass(32,47,Lv.far,(x,y,z,lv)=>{if(!westOk(x,z)||y>68)return;const a=.36*smooth(68,14,y)*(1-smooth(.48,.78,rock(x,z)))*q;if(rng()>a)return;const H=rr(7.0,13.8);
   ARCHB.growTamanu(x,y,z,H,KRAND.hash(seed+471,Math.round(x*10),Math.round(z*10)));log('artamanu_trunk',x,z);st.tamanu++;});
  cellPass(30,48,Lv.far,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.34*(.3+.7*rock(x,z))*(1-smooth(.65,.88,slope(x,z)))*q;if(rng()>a)return;const H=rr(6.5,13.5);
   ARCHB.growRata(x,y,z,H,KRAND.hash(seed+481,Math.round(x*10),Math.round(z*10)),rng()<.45);log('arrata_trunk',x,z);st.rata++;});
  cellPass(20,49,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z)||y>52)return;const a=.40*smooth(52,12,y)*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;const H=rr(3.2,6.0);
   ARCHB.growHibiscus(x,y,z,H,KRAND.hash(seed+491,Math.round(x*10),Math.round(z*10)));log('arhibiscus_fol',x,z);st.hibiscus++;});
  cellPass(22,50,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.38*smooth(.45,.78,wet(x,z))*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;const H=rr(2.8,5.6);
   ARCHB.growTreeFern(x,y,z,H,KRAND.hash(seed+501,Math.round(x*10),Math.round(z*10)),lv);log('artreefern_trunk',x,z);st.treefern++;});
  cellPass(8.5,24,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.52*(1-smooth(.52,.82,rock(x,z)))*q;if(rng()>a)return;const s=rr(1.0,2.3);
   BIO.put('arnaupaka',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[s*1.25,s,s*1.25],pickC(PAL.naupaka,.03),{n:[0,1,0]});log('arnaupaka',x,z);st.naupaka++;});
  cellPass(5.5,25,Lv.mid,(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.60*(1-smooth(.5,.8,rock(x,z)))*q;if(rng()>a)return;
   const n=lv>0?ri(1,3):1;for(let k=0;k<n;k++){const ox=x+(k?rr(-1.4,1.4):0),oz=z+(k?rr(-1.4,1.4):0);if(k&&(!westOk(ox,oz)||BIO.mask(ox,oz)<=0))continue;
    const s=rr(1.05,2.05);BIO.put('aruluhe',[ox,Y(ox,oz)-.04,oz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.95,s],pickC(PAL.uluhe,.03));log('aruluhe',ox,oz);st.uluhe++;}});
  cellPass(7.0,51,Lv.floor[1],(x,y,z,lv)=>{if(!westOk(x,z))return;const a=.48*(1-smooth(.58,.85,rock(x,z)))*q;if(rng()>a)return;
   const s=rr(.55,1.05);BIO.put('arnephrolepis',[x,y-.03,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.92,s],pickC(PAL.nephro,.03));log('arnephrolepis',x,z);st.nephrolepis++;});
  /* Ultramafic gjar seep-stream margin (+8.2..+24 m): Teal-Sap Prop-Wood & Sea Hibiscus for the pitch/rope & smelt villages */
  cellPass(16,52,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z)||!tKeep(x,z)||y<8.2||y>28||wet(x,z)<.58)return;
   const sl=soil(x,z);if((sl.ni||0)<1800||rng()>.52*q)return;
   if(rng()<.58){const up=ARCH.uptake('verdigrismangrove',sl);if(!up.hyper)return;
    const H=rr(4.5,7.8);ARCHB.growVerdigrisMangrove(x,y,z,y,H,KRAND.hash(seed+521,Math.round(x*10),Math.round(z*10)),lv);
    ARCHB.HOARD.push({x,z,leaf:up.leaf,latex:up.latex});log('arverdigris_fol',x,z);st.verdigrismangrove++;}
   else{const H=rr(3.0,5.5);ARCHB.growHibiscus(x,y,z,H,KRAND.hash(seed+522,Math.round(x*10),Math.round(z*10)));log('arhibiscus_fol',x,z);st.hibiscus++;}});}
 if(lk){const ripOk=(x,z)=>lk.riparian(x,z)>.14&&lk.cobbles(x,z)<.58&&ARCH.earthOk(chem(x,z));
  /* Multi-storey Plaine des Lacs / Riviere Bleue alluvial tropical rainforest: emergent Agathis kauri & Calophyllum tamanu,
     closed broadleaf canopy (Metrosideros rata, Melaleuca paperbark, Casuarina, Ohia), mid-storey Cyathea tree-ferns, Pandanus & Hibiscus,
     and lush uluhe + Nephrolepis fern floor */
  cellPass(24,60,Lv.far,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.68*smooth(.22,.78,r)*(1-smooth(.42,.72,rock(x,z)))*q;if(rng()>a)return;
   const H=rr(13.5,24.5);ARCHB.growKauri(x,y,z,H,KRAND.hash(seed+601,Math.round(x*10),Math.round(z*10)),lv);log('arkauri_trunk',x,z);st.kauri++;});
  cellPass(19,61,Lv.far,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.66*smooth(.14,.68,r)*q;if(rng()>a)return;
   const H=rr(9.5,19.5);ARCHB.growCasuarina(x,y,z,H,KRAND.hash(seed+611,Math.round(x*10),Math.round(z*10)));log('arcastrunk',x,z);st.casuarina++;});
  cellPass(17,62,Lv.mid,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.64*smooth(.18,.74,r)*q;if(rng()>a)return;
   const H=rr(4.8,9.4);ARCHB.growPandan(x,y,z,H,KRAND.hash(seed+621,Math.round(x*10),Math.round(z*10)),leanDown(x,z),lv);log('arpandan_trunk',x,z);st.pandan++;});
  cellPass(20,63,Lv.far,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.68*smooth(.22,.78,r)*q;if(rng()>a)return;
   const H=rr(10.5,19.5);ARCHB.growTamanu(x,y,z,H,KRAND.hash(seed+631,Math.round(x*10),Math.round(z*10)));log('artamanu_trunk',x,z);st.tamanu++;});
  cellPass(16,64,Lv.mid,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.62*smooth(.16,.72,r)*q;if(rng()>a)return;
   const H=rr(4.0,7.4);ARCHB.growHibiscus(x,y,z,H,KRAND.hash(seed+641,Math.round(x*10),Math.round(z*10)));log('arhibiscus_fol',x,z);st.hibiscus++;});
  cellPass(17,65,Lv.far,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.68*smooth(.18,.74,r)*q;if(rng()>a)return;
   const H=rr(7.5,15.5);ARCHB.growPaperbark(x,y,z,H,KRAND.hash(seed+651,Math.round(x*10),Math.round(z*10)));log('arpaperbark_trunk',x,z);st.paperbark++;});
  cellPass(21,67,Lv.far,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.62*smooth(.24,.8,r)*q;if(rng()>a)return;
   const H=rr(9.0,17.5);ARCHB.growRata(x,y,z,H,KRAND.hash(seed+671,Math.round(x*10),Math.round(z*10)),rng()<.48);log('arrata_trunk',x,z);st.rata++;});
  cellPass(15,68,Lv.mid,(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.66*smooth(.2,.76,r)*q;if(rng()>a)return;
   const H=rr(3.8,7.6);ARCHB.growTreeFern(x,y,z,H,KRAND.hash(seed+681,Math.round(x*10),Math.round(z*10)),lv);log('artreefern_trunk',x,z);st.treefern++;});
  cellPass(6.2,66,Lv.floor[1],(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.68*smooth(.15,.7,r)*q;if(rng()>a)return;
   const s=rr(.65,1.25);BIO.put('arnephrolepis',[x,y-.03,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.95,s],pickC(PAL.nephro,.03));log('arnephrolepis',x,z);st.nephrolepis++;});
  cellPass(6.8,69,Lv.floor[1],(x,y,z,lv)=>{if(!ripOk(x,z))return;const r=lk.riparian(x,z),a=.64*smooth(.25,.78,r)*q;if(rng()>a)return;
   const s=rr(1.1,2.1);BIO.put('aruluhe',[x,y-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*.95,s],pickC(PAL.uluhe,.03));log('aruluhe',x,z);st.uluhe++;});}
 return st;};
/* COVE 14 m MACROTIDAL ZONATION ([-7 m, +7 m]): shoal kombu kelp, ribbon seagrass & giant sea-byssus mussel beds (-6.6..-0.5 m),
   coralline-oyster visor (-0.5..+2.6 m), and upper-littoral barnacle crust (+2.6..+6.8 m) — real species, zero arhem/arlime stand-ins */
ARCHB.intertidal=function(cove,R,q){q=q==null?1:q;R=R==null?2450:R;
 const st={total:0,kelpByssus:0,corallineOyster:0,barnacle:0,kelp:0,seagrass:0,byssus:0,oyster:0,pts:[]},seed=KRAND.child(1000037,'arch/intertidal'),c0=BIO.center(),Lv=BIO.LOD(),cell=7.5,N=Math.ceil(R*2/cell);
 const rk=x=>BIO.field('rock',x[0],x[1]);
 for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;
  if(Math.hypot(x-c0[0],z-c0[1])>R||BIO.lodD(x,z)>Lv.mid)continue;
  reseed(KRAND.cell(seed,ix,iz));const px=x+rr(-.45,.45)*cell,pz=z+rr(-.45,.45)*cell;if(!cove.intertidal(px,pz))continue;
  const y=Y(px,pz);if(y<-6.6||y>6.8||rng()>.58*q)continue;
  const n=ri(1,3);for(let k=0;k<n;k++){const ox=px+rr(-1.4,1.4),oz=pz+rr(-1.4,1.4),oy=Y(ox,oz);if(oy<-6.6||oy>6.8)continue;
   if(oy<-.45){
    const roll=rng(),sheltered=oy>-4.2&&rk([ox,oz])<.48;
    if(sheltered&&roll<.34){const s=rr(.42,.85);BIO.put('arseagrass',[ox,oy-.03,oz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*1.25,s],pickC(PAL.seagrass,.03));st.seagrass++;}
    else if(oy<-1.0&&roll<.68){const s=rr(.36,.68);BIO.put('arbyssus',[ox,oy-.02,oz],qEuler(rr(-.14,.14),rr(0,TAU),rr(-.14,.14)),[s,s,s],pickC(PAL.byssus,.03));st.byssus++;}
    else{const stH=rr(.35,.75),bL=rr(.85,1.85),yaw=rr(0,TAU);
     BIO.put('arkelp_stipe',[ox,oy-.04,oz],qEuler(0,yaw,0),[1.1,stH,1.1],pickC(PAL.mangroveBark,.02));
     BIO.put('arkelp',[ox,oy+stH*.92,oz],qEuler(rr(-.25,.25),yaw,.35),[bL*.42,bL,bL*.42],pickC(PAL.kelp,.03));st.kelp++;}
    st.kelpByssus++;}
   else if(oy<2.6){const s=rr(.22,.48);BIO.put('aroyster',[ox,oy-.02,oz],qEuler(rr(-.15,.15),rr(0,TAU),0),[s,s*.82,s],pickC(PAL.oyster,.02));st.corallineOyster++;st.oyster++;}
   else{const s=rr(.22,.48);BIO.put('arbarnacle',[ox,oy+.01,oz],qEuler(rr(-.18,.18),rr(0,TAU),rr(-.18,.18)),[s,s*.55,s],pickC(PAL.barnacle,.02));st.barnacle++;st.oyster++;}
   st.total++;if(st.pts.length<600)st.pts.push([ox,oy,oz]);}}
 return st;};
// THE CURTAINS: along a meeting's dividing line, a wall every 1.2-2 m wherever the sample says it can stand; a few short side walls where the halves braid;
// the young hems on the margin of the stand. line(s, a) -> [x, z] the meeting's frame; level(s) the water's surface; the +z (white) face to the alkaline
// side (a < 0). Each placed curtain is recorded: {s, x, z, h, sample} (the verify asserts its sample can stand)
ARCHB.curtains=function(meet,line,level,q){q=q==null?1:q;const st={curtains:0,hems:0,list:[]},seed=KRAND.child(1000033,'arch/curtains'),U=meet.dir,yaw=Math.atan2(-U[1],U[0]);
 const sampleAt=s=>meet.samples[Math.max(0,Math.min(meet.samples.length-1,Math.round(s/10)))];
 let s=4,i=0;while(s<meet.L){const smp=sampleAt(s);if(!smp.stand){s+=2;i++;continue;}reseed(KRAND.hash(seed,i,1));
  const len=rr(1.2,2.1),a=rr(-.35,.35),p=line(s,a),y=level(s)-.25,h=rr(.6,1.0)+2.6*smooth(0,300,Math.min(s,meet.end-s))*rr(.5,1),tilt=rr(-.06,.06);
  if(rng()<q){BIO.put('arcurtain',[p[0],y,p[1]],qEuler(tilt,yaw+rr(-.12,.12),0),[len,h,1],C(0xffffff));
   BIO.put('arcurtainhem',[p[0],y+h*.97,p[1]],qEuler(0,yaw,0),[len,.07,.07],C(PAL.curtainHem[i%3]));st.curtains++;st.list.push({s,x:p[0],z:p[1],h,stand:smp.stand,pHa:smp.pHa,pHb:smp.pHb,v:smp.v});
   // a braid: a short side wall where the halves split again, every few metres, set off to one side
   if(rng()<.18){const sa=rr(2.5,4.5)*(rng()<.5?-1:1),p2=line(s+rr(-1,1),sa);BIO.put('arcurtain',[p2[0],y,p2[1]],qEuler(tilt,yaw+rr(-.2,.2),0),[len*rr(.6,1),h*rr(.4,.7),1],C(0xffffff));st.curtains++;
    st.list.push({s,x:p2[0],z:p2[1],h:h*.5,stand:smp.stand,pHa:smp.pHa,pHb:smp.pHb,v:smp.v,braid:true});}}
  s+=len+rr(0,.5);i++;}
 // the young hems: low frills on the line's last 30 m before the curtains end, and in the meet's mouth
 for(let k=0;k<60;k++){reseed(KRAND.hash(seed,k,2));const s2=rng()<.6?rr(Math.max(0,meet.end-30),meet.end-1):rr(0,8),smp=sampleAt(s2);if(!smp.stand)continue;const p=line(s2,rr(-.6,.6)),sz=rr(.12,.3);
  BIO.put('arhem',[p[0],level(s2)-.05,p[1]],qEuler(0,yaw+rr(-.4,.4),0),[sz,sz*.8,sz],C(PAL.hem[k%3]));st.hems++;}
 return st;};
// THE SEEP COMBS round the flames: cream combs on the cleft's lips, outside each flame's heat
ARCHB.combs=function(list,q){q=q==null?1:q;const st={combs:0},seed=KRAND.child(1000035,'arch/combs');
 list.forEach((f,i)=>{for(let k=0;k<10;k++){reseed(KRAND.hash(seed,i,k));if(rng()>q*.8)continue;const a=rr(0,TAU),d=rr(1.6,4),x=f.x+Math.cos(a)*d,z=f.z+Math.sin(a)*d,s=rr(.1,.3);
  BIO.put('arcomb',[x,Y(x,z)+s*.2,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s,s],pickC(PAL.comb,.02));st.combs++;}});
 return st;};
})();
