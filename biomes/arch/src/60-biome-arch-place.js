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
 const st={araucaria:0,gymnostoma:0,pycnandra:0,sedge:0,pitchers:0,limeshelf:0,verdigris:0,felt:0,fans:0},seed=KRAND.child(1000031,'arch/life'),
  keep=o.keep||(()=>1),heat=o.heat||(()=>28),ph=o.ph||(()=>6),soil=o.soil||((x,z)=>({ni:3000,pH:ph(x,z),caMg:.08}));
 const F=n=>(x,z)=>BIO.field(n,x,z),wet=F('wet'),rock=F('rock'),slope=F('slope');
 const Lv=BIO.LOD(),c0=BIO.center();
 const chem=(x,z)=>({pH:ph(x,z),T:heat(x,z),caMg:soil(x,z).caMg});
 const earth=(x,z)=>ARCH.earthOk(chem(x,z)),life=(x,z)=>ARCH.lifeAt(chem(x,z));
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const log=(it,x,z)=>ARCHB.LOG.push([it,x,z,life(x,z),ph(x,z),heat(x,z)]);
 // CANDELABRA ARAUCARIA: scattered over the maquis, more on the dome's crests (the drier, better-drained ground)
 cellPass(60,1,Lv.far,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.3*(1-smooth(.4,.7,rock(x,z)))*(.6+.6*BIO.field('upland',x,z))*q;if(rng()>a)return;
  const H=rr(8,20),tc=pickC(PAL.trunk,.02),rc=pickC(PAL.needles,.03),yaw=rr(0,TAU);BIO.put('artrunk',[x,y-.2,z],qEuler(rr(-.03,.03),yaw,rr(-.03,.03)),[(.15+H*.012)/.05,H,(.15+H*.012)/.05],tc);
  const tiers=Math.round(H/2.6);for(let t=0;t<tiers;t++){const hy=H*(.35+.6*t/Math.max(1,tiers-1)),n=t===tiers-1?0:ri(2,4),L=(1-t/tiers)*rr(1.6,3.6)+.6;
   for(let k=0;k<n;k++){const az=yaw+k/n*TAU+rr(-.3,.3);/* an arm out and turning up: a bowed stalk lying along its azimuth, its bow lifting the tip */
    BIO.put('arbough',[x,y+hy,z],qEuler(0,az,Math.PI/2-rr(.12,.3)),[2.2,L,2.2],rc);}}
  BIO.put('arbough',[x,y+H*.85,z],qEuler(0,yaw,0),[2.4,H*.2+1.5,2.4],rc);log('artrunk',x,z);st.araucaria++;});
 // MAQUIS SHE-OAK: the commonest shrub, everywhere Earth can grow, thinning on the steeps
 cellPass(9,2,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.5*(1-smooth(.45,.75,rock(x,z)))*q;if(rng()>a)return;const n=lv===2?ri(2,4):1;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.8,2.2):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||!earth(px,pz))continue;
   const s=rr(1.4,4.2)*ARCH.stunt(Object.assign({n:.15,p:.12},soil(px,pz)))*2.2;BIO.put('argymno',[px,Y(px,pz)-.1,pz],qEuler(0,rr(0,TAU),0),[s*.8,s,s*.8],pickC(PAL.casuar,.03));log('argymno',px,pz);st.gymnostoma++;}});
 // SEVE BLEUE: the wetter hollows of the laterite (the hoarder: its leaf nickel from ARCH.uptake, recorded)
 ARCHB.HOARD=[];
 cellPass(14,3,Lv.mid,(x,y,z,lv)=>{if(!earth(x,z))return;const a=.45*smooth(.45,.75,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;
  const s=rr(2.5,6),up=ARCH.uptake('pycnandra',soil(x,z));BIO.put('arpycntrunk',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[s*.6,s*.45,s*.6],pickC(PAL.trunk,.02));
  BIO.put('arpycn',[x,y+s*.35,z],qEuler(0,rr(0,TAU),0),[s*.55,s*.65,s*.55],pickC(PAL.glossy,.03));ARCHB.HOARD.push({x,z,leaf:up.leaf,latex:up.latex});log('arpycn',x,z);st.pycnandra++;});
 // MAQUIS SEDGE: tussocks between, on the bare laterite
 cellPass(4,4,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.35*(1-smooth(.4,.7,rock(x,z)))*q;if(rng()>a)return;const s=rr(.35,.75);
  BIO.put('arsedge',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.3),s],pickC(PAL.sedge,.03));log('arsedge',x,z);st.sedge++;});
 // PITCHER PLANTS: the seeps (wet laterite near the water, outside the aprons and the acid), in groups
 cellPass(6,5,Lv.floor[1],(x,y,z,lv)=>{if(!earth(x,z))return;const a=.5*smooth(.6,.85,wet(x,z))*(1-rock(x,z))*q;if(rng()>a)return;const n=lv===2?ri(3,8):ri(1,3);
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.15,.9):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||!earth(px,pz))continue;const s=rr(.05,.11);
   BIO.put('arpitch',[px,Y(px,pz)-.01,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*1.4,s],pickC(PAL.pitcher,.03));log('arpitch',px,pz);st.pitchers++;}});
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
