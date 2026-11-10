// ================================================================= FIREBLISS — placement (every station)
// FIREBLISS.build(R, q): what grows and lies on the warm floors and the ash, by the host's fields (BIO.field: floor, meadow, grove, ash, shore, wet,
// rock, slope, therm, hollow; the geyser kit's sinter, dead, acid and film where the station has a thermal layout). New placement throughout: every
// cell is seeded from KRAND.cell(seed + salt, ix, iz), never from how many draws came before it. The geyser kit's trees stand already (89z builds it
// first) and are obstacles: nothing here roots in their crowns.
//   THE KIN        Firebliss pines in the lee band (grove) and scattered up the lower ash; Bliss tree ferns on the warm wet floor by the springs and
//                  the shore. Each a lattice cell, grown by the Throne's builder (BIO.kin), its far tier the Throne's own impostor
//   THE MEADOW     grass, ferns, highland flowers, fireweed on the warm floor; none on the sinter, the mats' film, hot ground (over ~38 degC) or water
//   THE REEDS      the warm margins of the water
//   THE ASH        tussock, pumice, obsidian and scoria on the ash slopes; fireweed where the ash is new
//   THE SULPHUR    crusts round the fumaroles' throats (the host hands their places: FIREBLISS.SITE.fumaroles)
//   THE BIRDS      a few dead birds in each gas hollow (the hollow field over .5)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const PAL=FIREBLISS.PAL,C=FIREBLISS.C,vary=FIREBLISS.vary;
const Y=(x,z)=>BIO.terrainH(x,z),F=n=>(x,z)=>{const f=BIO.host&&BIO.host.fields&&BIO.host.fields[n];return f?f(x,z):0;};   /* read at the call: the host swaps a field for the water's own (89z) after this loads */
const floor=F('floor'),meadow=F('meadow'),grove=F('grove'),ash=F('ash'),shore=F('shore'),wet=F('wet'),rock=F('rock'),slope=F('slope'),therm=F('therm'),hollow=F('hollow'),
 snow=F('snow'),ice=F('ice'),sinter=F('sinter'),dead=F('dead'),acid=F('acid'),film=F('film'),gheat=F('heat');
// the hot, the crusted and the dead ground: nothing of this kit's roots there (the geyser kit's own heat, finer than the host's therm grid, as well)
const bare=(x,z)=>Math.max(smooth(.15,.35,therm(x,z)),smooth(.18,.36,gheat(x,z)),smooth(.2,.5,sinter(x,z)),smooth(.3,.6,dead(x,z)),smooth(.1,.3,acid(x,z)),smooth(.05,.2,film(x,z)));
// the ground's own slope at a point (4 m either side): the field grid's 14 m cells cannot see a gorge's walls, so the floor's cards test it here
const steepAt=(x,z)=>Math.hypot(Y(x+2,z)-Y(x-2,z),Y(x,z+2)-Y(x,z-2))/4;
FIREBLISS.build=function(R,q){q=q==null?1:q;R=R==null?2500:R;
 const st={pines:0,treeferns:0,grass:0,ferns:0,flowers:0,fireweed:0,reeds:0,ashgrass:0,pumice:0,obsidian:0,scoria:0,sulphur:0,birds:0},seed=KRAND.child(620029,'firebliss/'+BIO.host.tags);
 const L=BIO.LOD(),c0=BIO.center(),site=FIREBLISS.SITE||{};
 const CLR=site.clear||[],kept=(x,z)=>{for(const c of CLR)if((x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<c.r*c.r)return true;return false;};   /* the camps' ground, kept clear (65 pitches first) */
 const ok=(x,z)=>BIO.mask(x,z)>0&&ice(x,z)<.2&&!kept(x,z);
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(!ok(px,pz))continue;
  fn(px,Y(px,pz),pz,ld<L.floor[0]?2:ld<L.floor[1]?1:0);}};
 // ---- the kin: a lattice, every cell its own hash (as eastabyss' cousins: 87-host-kin.js there), clear of the obstacles (the geyser kit's trees)
 const S=KSPACE.create({cell:60});(BIO.host.obstacles||[]).forEach(o=>S.insert(o,o.x,o.z,o.r==null?2:o.r));
 const clear=(x,z,r)=>steepAt(x,z)<.55&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&Y(x,z)-BIO.waterH(x,z)>.5&&bare(x,z)<.2&&rock(x,z)<.5&&snow(x,z)<.4;
 const LT=900;   /* the kin's near trees to 900 m, the Throne's impostor past it */
 function lattice(Kn,cell,salt,accept,minR,key){if(!Kn)return 0;let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(4481,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
   const x=c0[0]+(i+u(1))*cell,z=c0[1]+(j+u(2))*cell;if(Math.abs(x-c0[0])>R||Math.abs(z-c0[1])>R)continue;
   if(u(3)>accept(x,z)*q)continue;if(!clear(x,z,minR))continue;
   reseed(h);const T=Kn.make(x,Y(x,z),z),ld=BIO.lodD(x,z),lv=ld<L.hero?2:1;
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;Kn.grow(T,lv);
   BIO.range=1e9;BIO.minRange=LT;Kn.grow(Object.assign({},T),0);
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   const rb=T.rb==null?.4:T.rb,TH=T.H==null?8:T.H;S.insert(T,x,z,rb*1.4+2);BIO.host.obstacles.push({x,z,r:rb*2+1.2,y0:T.y0-2,y1:T.y0+TH});
   BIO.register({name:Kn.name,kind:'tree',label:Kn.name,x,z,y:T.y0,r:T.crownR==null?4:T.crownR,h:TH});n++;}
  return n;}
 BIO.cur='firebliss/kin';
 // the pines: groves in the lee band, thinner up the lower ash (they stop where the snow lies)
 st.pines=lattice(FIREBLISS.KIN.pine,40,0x7f01,(x,z)=>Math.max(.55*grove(x,z),.1*ash(x,z)*smooth(.5,.2,slope(x,z))*(1-smooth(.2,.5,snow(x,z)))*(site.pinesUp||0)),3);
 // the tree ferns: the warm wet floor by the springs and the water (a little heat helps: warm ground, not hot)
 st.treeferns=lattice(FIREBLISS.KIN.fern,30,0x7f02,(x,z)=>.45*floor(x,z)*Math.max(smooth(.55,.85,wet(x,z)),smooth(.03,.1,therm(x,z))*smooth(.2,.12,therm(x,z)))*smooth(.6,.3,slope(x,z)),2);
 BIO.cur='firebliss/floor';
 // ---- the meadow: grass, ferns, flowers, fireweed
 cellPass(5.5,11,L.floor[1],(x,y,z,lv)=>{const m=meadow(x,z)*(1-bare(x,z))*(1-smooth(.4,.7,rock(x,z)));if(m<.05||steepAt(x,z)>.7)return;
  const a=.7*m*q*(lv===0?.35:1);if(rng()>a)return;const r=rng(),gw=grove(x,z);
  if(r<.6-gw*.25){const n=lv===2?ri(1,3):1;for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.3,1.2):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,h=rr(.35,.8);if(!ok(px,pz))continue;
    BIO.put('grass',[px,Y(px,pz)-.04,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*1.1,h,h*1.1],vary(C(pick(PAL.grass)).lerp(C(pick(PAL.grassAsh)),ash(x,z)*.6),.02,.05,.05));st.grass++;}}
  else if(r<.82){const h=rr(.5,1.1);BIO.put('fern',[x,y-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*1.3,h,h*1.3],vary(C(pick(PAL.fern)),.02,.05,.05));st.ferns++;}
  else if(r<.93){const h=rr(.25,.55);BIO.put('flower',[x,y-.03,z],qEuler(0,rr(0,TAU),0),[h*.8,h,h*.8],vary(C(pick(PAL.flower)),.03,.05,.05));st.flowers++;}
  else{const h=rr(.6,1.3);BIO.put('fireweed',[x,y-.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[h*.5,h,h*.5],vary(C(pick(PAL.fireweed)),.02,.05,.05));st.fireweed++;}});
 // ---- the reeds: the warm margins of the water
 cellPass(3.6,12,L.floor[1],(x,y,z,lv)=>{const s=shore(x,z)*floor(x,z)*(1-bare(x,z));if(s<.3||steepAt(x,z)>.6)return;if(rng()>.75*smooth(.3,.75,s)*q)return;
  const n=lv===2?ri(3,6):2,col=C(pick(PAL.reed));for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.2,1.2):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,h=rr(1.2,2.4);if(!ok(px,pz))continue;
   BIO.put('reed',[px,Y(px,pz)-.08,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.7,h,h*.7],vary(col,.02,.05,.05));st.reeds++;}});
 // ---- the ash: tussock, stones, fireweed on the new ash
 cellPass(7,13,L.floor[1],(x,y,z,lv)=>{const a=ash(x,z)*(1-floor(x,z)*.7)*(1-smooth(.5,.8,snow(x,z)))*(1-smooth(.55,.85,rock(x,z)))*(1-bare(x,z));if(a<.1||steepAt(x,z)>.8)return;
  if(rng()>.5*a*q*(lv===0?.5:1))return;
  if(rng()<.75){const n=lv===2?ri(1,3):1;for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.4,1.4):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,h=rr(.3,.7);if(!ok(px,pz))continue;
    BIO.put('ashgrass',[px,Y(px,pz)-.04,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*1.2,h,h*1.2],vary(C(pick(PAL.ashgrass)),.02,.05,.05));st.ashgrass++;}}
  else{const h=rr(.7,1.3);BIO.put('fireweed',[x,y-.03,z],qEuler(0,rr(0,TAU),0),[h*.5,h,h*.5],vary(C(pick(PAL.fireweed)),.02,.05,.05));st.fireweed++;}});
 cellPass(10,14,L.mid,(x,y,z,lv)=>{const a=ash(x,z)*(1-floor(x,z))*(1-smooth(.6,.9,snow(x,z)))*(1-bare(x,z)*.7);if(a<.1||rng()>.55*a*q)return;
  const k=rng(),it=k<.45?'pumice':k<.75?'scoria':'obsidian',r=it==='obsidian'?rr(.15,.6):rr(.2,1.1);
  BIO.put(it,[x,y+r*.12,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[r*rr(.9,1.4),r*.75,r*rr(.9,1.4)],vary(C(pick(PAL[it])),.01,.03,.05));st[it]++;});
 // ---- the lahar's boulder trains: the host's moraine field down a gorge's floor and ledges (station 3), grey with dried mud, in trains along the flow
 const mor=F('moraine'),canyon=F('canyon');
 cellPass(7,16,L.mid,(x,y,z,lv)=>{const m=mor(x,z)*canyon(x,z);if(m<.25||rng()>.6*m*q)return;const n=ri(1,3);
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(1,3.5):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,r=rr(.4,2.2);if(BIO.mask(px,pz)<=0)continue;
   BIO.put('scoria',[px,Y(px,pz)+r*.2,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],vary(C(0x6e6458),.02,.05,.06));st.lahar=(st.lahar||0)+1;}});
 // ---- the sulphur crusts round the fumaroles' throats (the host's list: the geyser layout's and a station's own)
 (site.fumaroles||[]).forEach((f,i)=>{reseed(KRAND.hash(4482,i,0,7));const n=ri(2,5);
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=rr(.4,2.4),x=f.x+Math.cos(a)*d,z=f.z+Math.sin(a)*d,s=rr(.25,.7)*(f.s==null?.6:f.s)*1.6;if(BIO.mask(x,z)<=0)continue;
   BIO.put('sulphur',[x,Y(x,z)-.05,z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[s,s*rr(.6,1.2),s],vary(C(pick(PAL.sulphur)),.02,.06,.05));st.sulphur++;}});
 // ---- the dead birds in the gas hollows
 cellPass(5,15,L.floor[1],(x,y,z,lv)=>{if(hollow(x,z)<.5||rng()>.22*q)return;const s=rr(.18,.3);
  BIO.put('bird',[x,y+.02,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s,s],vary(C(pick(PAL.bird)),.02,.05,.05));st.birds++;});
 BIO.cur=null;
 return st;};
})();
