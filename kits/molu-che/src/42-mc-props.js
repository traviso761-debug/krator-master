// prefix: mc
// ================================================================= MOLU-CHE STEPPE ROOFTOP, TALPATHERE, SEISMIC & BYPASS PROPS
// Signature cultural landmarks and equipment on sunken courtyards and yBench loess roof-terraces (all strictly svNoWalk
// with >= 2.5 cm plane offsets so zero fake floors or coplanar z-fights ever arise):
//   - mcVentHood          earthen vaulted Yaodong smoke & air-draft chimney hood on yBench
//   - mcSeismicStone      tuned dark-basalt & cast-bronze Seismic Way-Stone monolith + amber tapetum beacon
//   - mcCisternWell       sunken courtyard hydraulic-lime seepage cistern curb & cedar windlass
//   - mcTalpathereStall   ktrama-molu plough-mole stall, bronze/iron claw-shoe pegs, fodder manger & stamp-board
//   - mcCaravanSled       heavy bronze-shod Moleshelf overland freight sled (Kulanewa bullion, silk & halite loads)
//   - mcSteelyardAssay    monumental Claw-and-Salt Compact bullion/grain steelyard balance & seismic gong
//   - mcCapstanMill       Talpathere-drawn rotary basalt millstone capstan
//   - mcDowndraftKiln     sunken loess Cucuteni painted-ware / lime downdraft dome kiln with glowing firebox
//   - mcPortcullisGate    battered dolomite/basalt gorge-head gate arch with raised riveted iron portcullis
//   - mcDryingMats        rooftop woven reed mats drying pale luma-papa gallery-tubers, grain & mineral curds
//   - mcBanner            steppe wind-pole with fluttering Mapuche-Cucuteni tapestry or treaty safe-conduct flag

/* Earthen vaulted Yaodong smoke & air-exchange chimney hood rising from the yBench loess terrace. */
function mcVentHood(x,yBench,z,yaw,o){
 o=o||{};
 const s=o.scale==null?1:o.scale;
 W(x,yBench+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   box('kilnbrick',0,0,0,.92*s,.22*s,.92*s,P('kilnbrick'));
   box('loess',0,.22*s,0,.78*s,.72*s,.78*s,P('loess'));
   box('limewash',0,.94*s,0,.86*s,.28*s,.86*s,P('limewash'));
   /* Louvered bronze/terracotta spark vents on front & back */
   box('basalt',0,1.0*s,0,.44*s,.16*s,.9*s,P('basalt'));
   cone('terracotta',0,1.22*s,0,.52*s,.34*s,P('terracotta'),8);
   if(o.smoke){
    cyl('glow',0,1.04*s,0,.14*s,.08*s,P('flame'),8);
    haloAt(0,1.18*s,0,0xffad52,false);
    smokeAt(0,1.42*s,0,{r:.22,kind:'fire'});
   }
  });
 });
}

/* Tuned dark-basalt & cast-bronze Seismic Way-Stone monolith transmitting foot-stamp and pack-train vibrations through bedrock. */
function mcSeismicStone(x,y0,z,h,o){
 o=o||{};
 const hm=h==null?3.2:h;
 mcNoCut(()=>W(x,y0+.025,z,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   cyl('dolomite',0,0,0,.72,.22,P('dolomite'),8);
   cyl('basalt',0,.22,0,.52,.28,P('basalt'),8);
   /* Tapered octagonal tuned basalt monolith shaft */
   cone('basalt',0,.5,0,.38,hm-.82,P('basalt'),8);
   /* Cast-bronze harmonic collar rings & suspended seismic resonance disc */
   for(const fy of [.34,.66]){
    cyl('bronze',0,.5+(hm-.82)*fy,0,.36*(1-fy*.45),.08,P('bronze'),8);
   }
   cyl('bronze',0,.5+(hm-.82)*.5,.36,.2,.04,P('bronze'),10);
   if(o.lamp!==false){
    cyl('bronze',0,hm-.32,0,.22,.08,P('bronze'),8);
    cyl('glow',0,hm-.24,0,.14,.2,P('flame'),8);
    cone('bronze',0,hm-.04,0,.24,.2,P('bronze'),8);
    haloAt(0,hm-.14,0,0xffbe58,!!o.big);
   }
  });
 }));
}

/* Central sunken-courtyard seepage well & hydraulic-lime rain cistern curb with dark-cedar windlass. */
function mcCisternWell(x,yCourt,z,o){
 o=o||{};
 const r=o.r==null?.92:o.r;
 mcNoCut(()=>W(x,yCourt+.025,z,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   cyl('dolomite',0,0,0,r+.16,.18,P('dolomite'),8);
   cyl('limewash',0,.18,0,r,.48,P('limewash'),8);
   cyl('water',0,.44,0,r-.18,.08,P('water'),8);
   if(o.windlass!==false){
    for(const sx of [-r+.14,r-.14]){
     box('darkcedar',sx,.66,0,.12,1.18,.14,P('darkcedar'));
    }
    box('darkcedar',0,1.84,0,r*2+.16,.12,.22,P('darkcedar'));
    box('terracotta',0,1.96,0,r*2+.28,.1,.48,P('terracotta'));
    cyl('bronze',0,1.24,0,.16,.24,P('bronze'),8);
   }
  });
 }));
}

/* Timber-and-dolomite Talpathere (ktrama-molu) plough-mole stall with fodder manger, stamp-code sounding plank & claw-shoes. */
function mcTalpathereStall(x,y0,z,yaw,o){
 o=o||{};
 const w=o.w==null?3.2:o.w,d=o.d==null?2.4:o.d;
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Packed earth bedding pad & heavy side stall partitions */
   box('earth',0,0,0,w-.16,.06,d-.16,P('earth'));
   for(const sx of [-w/2+.1,w/2-.1]){
    box('dolomite',sx,0,0,.2,.32,d,P('dolomite'));
    box('darkcedar',sx,.32,0,.14,.86,d-.08,P('darkcedar'));
   }
   /* Rear stone fodder & salt-lick manger */
   box('dolomite',0,.06,-d/2+.28,w-.44,.48,.48,P('dolomite'));
   box('halite',-.48,.54,-d/2+.28,.28,.16,.26,P('halite'));
   box('reedmat',.36,.54,-d/2+.28,.68,.12,.34,P('reedmat'));
   /* Foot-stamp acoustic cedar sounding board + hanging tin-bronze claw-shoes */
   box('carvedwood',0,.06,d/2-.32,1.18,.07,.54,P('carvedwood'));
   for(const sx of [-.36,.36]){
    cone('bronze',sx,.74,-d/2+.1,.085,.24,P('bronze'),6);
   }
  });
 });
}

/* Bronze-runner Moleshelf overland freight sled loaded with Kulanewa valge-vask bullion, amber casks or Spider Lake silk bales. */
function mcCaravanSled(x,y0,z,yaw,o){
 o=o||{};
 const kind=o.load||'bullion';
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Twin upturned tin-bronze & dark-cedar sled runners */
   for(const sx of [-.68,.68]){
    box('bronze',sx,0,0,.12,.08,2.95,P('bronze'));
    box('darkcedar',sx,.08,0,.14,.16,2.82,P('darkcedar'));
    beam('bronze',[sx,.06,1.42],[sx,.42,1.76],.09,P('bronze'));
   }
   /* Cross-bolsters & plank bed */
   for(const sz of [-1.05,0,1.05])box('darkcedar',0,.24,sz,1.56,.1,.16,P('darkcedar'));
   box('cedar',0,.34,0,1.5,.07,2.64,P('cedar'));
   if(kind==='bullion'){
    for(const sz of [-.62,.48]){
     box('iron',0,.41,sz,1.16,.52,.82,P('iron'));
     box('nickel',0,.42,sz,.28,.54,.86,P('nickel'));
    }
   }else if(kind==='silk'){
    box('molefelt',0,.41,-.48,1.24,.56,.96,P('feltOchre'));
    box('tapestry',0,.41,.58,1.18,.52,.92,P('tapestryIndigo'));
    box('rope',0,.42,.04,1.28,.58,.14,P('rope'));
   }else{
    for(const sx of [-.36,.36])for(const sz of [-.56,.56]){
     cyl('terracotta',sx,.41,sz,.28,.64,P('terracotta'),10);
     cyl('limewash',sx,1.05,sz,.22,.06,P('limewash'),10);
    }
   }
  });
 });
}

/* Monumental Claw-and-Salt Compact bullion & grain steelyard balance beam with suspended bronze seismic gong. */
function mcSteelyardAssay(x,y0,z,yaw,span,o){
 o=o||{};
 const sp=span==null?2.4:span;
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const sx of [-sp*.38,sp*.38]){
    box('basalt',sx,0,0,.44,.28,.54,P('basalt'));
    box('darkcedar',sx,.28,0,.22,2.45,.22,P('darkcedar'));
   }
   box('darkcedar',0,2.73,0,sp+.28,.2,.28,P('darkcedar'));
   /* Asymmetric bronze steelyard lever & counterweight */
   box('bronze',0,2.32,0,sp*.86,.08,.09,P('bronze'));
   cyl('nickel',-sp*.34,1.88,0,.16,.28,P('nickel'),8);
   /* Suspended weighing pan on +x and cast-bronze compact gong in center */
   cyl('iron',sp*.32,1.12,0,.38,.06,P('iron'),10);
   beam('iron',[sp*.32,2.3,0],[sp*.32,1.18,0],.03,P('iron'));
   cyl('bronze',0,1.68,.18,.28,.06,P('bronze'),12);
  });
 });
}

/* Talpathere-drawn rotary basalt millstone capstan with radial cedar sweep-bars. */
function mcCapstanMill(x,y0,z,r,o){
 o=o||{};
 const rm=r==null?1.45:r;
 W(x,y0+.025,z,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   cyl('dolomite',0,0,0,rm,.46,P('dolomite'),14);
   cyl('basalt',0,.46,0,rm*.78,.28,P('basalt'),14);
   cyl('darkcedar',0,.74,0,.22,.92,P('darkcedar'),10);
   box('darkcedar',0,1.32,0,rm*2.45,.12,.16,P('darkcedar'));
   box('bronze',0,1.66,0,.3,.08,.3,P('bronze'));
  });
 });
}

/* Sunken-pit Cucuteni downdraft ceramic or karst-lime dome kiln with glowing firebox arch. */
function mcDowndraftKiln(x,y0,z,yaw,r,o){
 o=o||{};
 const rk=r==null?1.65:r;
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('dolomite',0,0,0,rk+.18,.28,P('dolomite'),12);
   cyl('kilnbrick',0,.28,0,rk,1.32,P('kilnbrick'),12);
   cone('loess',0,1.6,0,rk*.96,1.18,P('loess'),12);
   cyl('kilnbrick',0,2.78,0,.34,.68,P('kilnbrick'),10);
   /* Stoking firebox mouth on +z */
   box('basalt',0,.28,rk-.04,.86,.82,.26,P('basalt'));
   box('glow',0,.34,rk+.1,.52,.52,.05,P('flame'));
   haloAt(0,.62,rk+.24,0xff9e3d,true);
  });
 });
}

/* Battered stone-faced gorge-head bastion gate arch with raised riveted iron portcullis (leaves clear >= 2.6 m KWALK passage). */
function mcPortcullisGate(x,y0,z,yaw,wOpen,hOpen,o){
 o=o||{};
 const w=wOpen==null?3.0:wOpen,h=hOpen==null?3.4:hOpen,d=o.d==null?1.4:o.d;
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const px=s*(w/2+.55);
    box('basalt',px,0,0,1.1,.48,d+.16,P('basalt'));
    box('dolomite',px,.48,0,1.02,h+.72,d,P('dolomite'));
   }
   /* Heavy lintel, machicolation corbels & raised iron portcullis teeth above h - 0.35 */
   box('dolomite',0,h,0,w+2.2,1.2,d+.1,P('dolomite'));
   box('basalt',0,h+1.2,0,w+2.34,.18,d+.22,P('basalt'));
   box('iron',0,h-.32,0,w-.12,.32,.1,P('iron'));
   const nSp=Math.max(4,Math.floor(w/.42));
   for(let i=0;i<nSp;i++){
    const sx=lerp(-w/2+.22,w/2-.22,i/(nSp-1));
    cone('iron',sx,h-.54,0,.055,.22,P('iron'),6);
   }
   cyl('nickel',0,h+.58,d/2+.08,.24,.05,P('nickel'),10);
  });
  /* Wall blockers ONLY on the flanking stone gate piers, keeping the central w passage 100% clear! */
  for(const s of [-1,1])mcWallBlock(s*(w/2+.55),0,0,1.05,h+1.2,d,0);
  wkPad(0,0,w+.2,d+1.4,-.025);
 });
}

/* Steppe rooftop woven reed mats drying pale luma-papa gallery-tubers, amber grain, and mineral curds. */
function mcDryingMats(x,yBench,z,nx,nz,o){
 o=o||{};
 const cxN=nx==null?2:nx,czN=nz==null?1:nz;
 W(x,yBench+.028,z,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   for(let ix=0;ix<cxN;ix++)for(let iz=0;iz<czN;iz++){
    const mx=(ix-(cxN-1)/2)*1.55,mz=(iz-(czN-1)/2)*1.25;
    box('darkcedar',mx,0,mz,1.38,.05,1.08,P('darkcedar'));
    box('reedmat',mx,.05,mz,1.28,.035,.98,P('reedmat'));
    const cropCol=(ix+iz)%2===0?P('bone'):P('ochre');
    box('sand',mx,.085,mz,.96,.045,.68,cropCol);
   }
  });
 });
}

/* Steppe wind-pole carrying a live wind-fluttering Mapuche-Cucuteni tapestry or Claw-and-Salt safe-conduct pennant. */
function mcBanner(x,y0,z,yaw,h,palKey){
 const hb=h==null?3.4:h,col=P(palKey||'tapestry');
 const mk=(palKey==='flag'||palKey==='flagSalt')?'flag':'tapestry';
 W(x,y0+.025,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('basalt',0,0,0,.2,.14,P('basalt'),8);
   cyl('darkcedar',0,.14,0,.048,hb-.14,P('darkcedar'),8);
   box('bronze',0,hb-.12,.34,.06,.06,.72,P('bronze'));
   withCloth(clothHang(1.24,.08),()=>{
    quad(mk,0,hb-.78,.36,.58,1.24,col,0);
   });
  });
 });
}
