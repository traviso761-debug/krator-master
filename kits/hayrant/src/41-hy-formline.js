// prefix: hy
// ================================================================= KANOPI PNW/TLINGIT + JOMON/AINU REGIONAL TOOLKIT (PLAN.md §3 & §4)
// Shared Utari-Kuran heritage from destroyed Kanopi arcology expressed strictly in Western Outer Wall (biomes/wouterwall)
// + Eternian suzerain materials (fur-larch, tarwood, loess, megabreccia, basalt, kaen, celadon, nephrite, alabaster, plaid,
// plain, bronze, silver, gold, lead, gunmetal) with mandatory Censorate closed/slitted eyes and >= 2.0 cm non-coplanar relief:
//   hyHeadTotemPole(x, y, z, yaw, o)              Sutar-Pira cyber-syncretic 3-5 tier totem pylons (3.8-9.8 m)
//   hyMonumentalCyberTotem(x, y, z, yaw, o)       Central-square monumental cyber-totem colossus pylons (14.5-20.5 m)
//   hyFormlineFrieze(x, y, z, w, h, yaw, o)       Censorate-compliant sleeping-eye formline gable/architrave boards
//   hyFormlineTympanum(x, y, z, w, rise, yaw, o)  Sleeping-eye triangular gable & yaodong arch tympanums
//   hyOvoidPortal(x, y, z, w, h, yaw, o)          Highland ovoid ancestor-collar doorway crowned by a closed-eye Eternian head
//   hyPuCache(x, y, z, w, d, yaw, o)              Elevated fur-larch pu store-box on basalt posts w/ megabreccia marmot baffles
//   hyGaleCobbleRoof(x, y, z, w, d, rise, yaw, o) Adzed fur-larch plank roof weighted with strapped katabatic gale-cobbles
//   hyInauCluster(x, y, z, yaw, o)                Shaved-willow inau spirit-wand clusters

const HY_TOTEM_MATS=['titanium','gold','silver','bronze','celadon','nephrite','alabaster','gunmetal','lead','kaen','tarwood'];

function hyTotemMatCol(mat){
 if((mat==='gold'||mat==='celadon'||mat==='terracotta'||mat==='titanium'||mat==='white')&&KIT_HAS(mat))return new THREE.Color(1,1,1);
 if(mat==='cyberForm'||mat==='cyberFormB'||mat==='cyberFormC')return KIT_HAS(mat)?new THREE.Color(0xf6f0ea):P('tarwood');
 if(mat==='cyberChassis'||mat==='cyberChassisB')return KIT_HAS(mat)?new THREE.Color(0xf6f0ea):P('gunmetal');
 if(mat==='alabaster')return new THREE.Color(1,1,1);
 if(mat==='basalt')return P('ashlar');
 return P(mat);
}

/* Single non-coplanar relief box on +z face: layerIdx * 2.0 cm step with 1.2 cm thickness -> >= 8 mm clear air gap between layers! */
function hyFormLayerBox(mk,x,y,zFace,layerIdx,w,h,col){
 if(w<.02||h<.016)return;
 const zMid=hyRigMath.formlineLayerZ(zFace,layerIdx);
 box(mk,x,y,zMid,w,h,.012,col==null?P(mk):col);
}

/* Censorate-compliant sleeping-eye formline ovoid:
   Layer 1: birch-tarred fur-larch (tarwood) primary ovoid with bevelled shoulder strips (disjoint in x by 6 mm)
   Layer 2: cave-madder red (kaen tinted madder) secondary inner eyelid ovoid
   Layer 3: celadon or emerald-nephrite tertiary eye-socket
   Layer 4: horizontal closed/slitted sleeping-eye bar (NEVER an open round pupil!) */
function hySleepingOvoid(x,y,zFace,w,h,o){
 o=o||{};
 const shoulderW=Math.min(w*.15,.13);
 const midW=w-2*shoulderW-.012;
 if(midW>.03){
  hyFormLayerBox('tarwood',x,y,zFace,1,midW,h,P('tarwood'));
  for(const sx of [-1,1]){
   hyFormLayerBox('tarwood',x+sx*(w/2-shoulderW/2),y+h*.13,zFace,1,shoulderW,h*.74,P('tarwood'));
  }
 }else{
  hyFormLayerBox('tarwood',x,y,zFace,1,w,h,P('tarwood'));
 }
 if(w>.22&&h>.16){
  hyFormLayerBox('kaen',x,y+h*.16,zFace,2,w*.68,h*.66,P('plaid'));
 }
 if(w>.30&&h>.22&&o.eye!==false){
  const tertMk=o.tertiary||'nephrite';
  const tertCol=tertMk==='celadon'&&KIT_HAS('celadon')?new THREE.Color(1,1,1):P(tertMk);
  hyFormLayerBox(tertMk,x,y+h*.25,zFace,3,w*.46,h*.42,tertCol);
  const slitMk=o.slitMk||'bronze';
  hyFormLayerBox(slitMk,x,y+h*.43,zFace,4,w*.32,Math.max(.024,h*.09),P(slitMk));
 }
}

/* Non-coplanar U-form & split-U feather/fin relief in a single layer (sibling legs disjoint from cap by 6 mm). */
function hyUFormRelief(x,y,zFace,w,h,dir,layerIdx,mk,col,splitMk){
 if(w<.12||h<.12)return;
 const leg=Math.min(w,h)*.24;
 const c0=col==null?P(mk):col;
 if(dir==='up'||dir==='down'){
  const capY=dir==='up'?y+h-leg:y;
  hyFormLayerBox(mk,x,capY,zFace,layerIdx,w,leg,c0);
  const legY=dir==='up'?y:y+leg+.006,legH=h-leg-.006;
  if(legH>.02){
   for(const sx of [-1,1])hyFormLayerBox(mk,x+sx*(w/2-leg/2),legY,zFace,layerIdx,leg,legH,c0);
  }
  if(splitMk&&w>.30&&h>.26){
   hyFormLayerBox(splitMk,x,y+h*.22,zFace,layerIdx+1,w*.24,h*.50,hyTotemMatCol(splitMk));
  }
 }else{
  const capX=dir==='right'?x+w/2-leg/2:x-w/2+leg/2;
  hyFormLayerBox(mk,capX,y,zFace,layerIdx,leg,h,c0);
  const armW=w-leg-.006,armX=dir==='right'?x-leg/2-.003:x+leg/2+.003;
  if(armW>.02){
   hyFormLayerBox(mk,armX,y,zFace,layerIdx,armW,leg,c0);
   hyFormLayerBox(mk,armX,y+h-leg,zFace,layerIdx,armW,leg,c0);
  }
  if(splitMk&&w>.30&&h>.26){
   hyFormLayerBox(splitMk,x,y+h*.36,zFace,layerIdx+1,w*.48,h*.26,hyTotemMatCol(splitMk));
  }
 }
}

/* Shaved-willow inau spirit-wand cluster (kaen/basalt socket + angled fur-larch stems + pale willow-shaving curl cones). */
function hyInauCluster(x,y,z,yaw,o){
 o=o||{};
 const sc=o.scale==null?1.0:o.scale,n=o.count==null?3:o.count;
 const willowCol=new THREE.Color(0xede6d4);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   let y0=0;
   if(o.holder!==false){
    cyl('basalt',0,0,0,.11*sc,.09*sc,P('basaltD'),8);
    cyl('kaen',0,.09*sc,0,.085*sc,.11*sc,P('kaen'),8);
    y0=.20*sc;
   }
   for(let i=0;i<n;i++){
    const f=n===1?0:(i/(n-1)-.5)*2;
    const tilt=f*.24,stemH=(.62+.10*(1-Math.abs(f)))*sc;
    const bx=f*.07*sc,tx=f*.19*sc,tz=.04*sc*(1-Math.abs(f));
    pole('larch',[bx,y0,0],[tx,y0+stemH,tz],.016*sc,P('larch'),6);
    W(tx,y0+stemH*.72,tz,0,()=>{
     WX(0,0,0,0,0,-tilt,()=>{
      cone('plain',0,0,0,.072*sc,.18*sc,willowCol,7);
      cone('plain',0,.14*sc,0,.058*sc,.16*sc,willowCol,7);
     });
    });
   }
  });
 });
}

/* Open-ended pierced metallic Faraday cage sleeve (gcyl open=true -> zero end-cap coplanar overlap). */
function hyFaradayScreenCyl(x,y,z,r,h,seg){
 const m=TF(x,y,z);
 m.scale(new THREE.Vector3(r,h,r));
 emit('screen',gcyl(seg==null?8:seg,true),m,new THREE.Color(1,1,1),{su:Math.max(1,Math.round(TAU*r/1.6)),sv:Math.max(1,h/1.4)});
}

/* Ribbed Mirabilis high-voltage celadon & white porcelain pin-insulator stack; returns top brass terminal [x, y, z]. */
function hyPinInsulator(x,y,z,sc,alt){
 const s=sc==null?1:sc,sheds=hyRigMath.insulatorShedRadii(.066*s,3);
 let yy=y;
 for(let i=0;i<sheds.length;i++){
  const mk=(i+(alt|0))%2===0?'white':'celadon';
  cyl(mk,x,yy,z,sheds[i].shed,.034*s,hyTotemMatCol(mk),10,sheds[i].shed*.86);
  yy+=.034*s;
  cyl('iron',x,yy,z,sheds[i].neck*.72,.020*s,P('iron'),8);
  yy+=.020*s;
 }
 cyl('brass',x,yy,z,.026*s,.030*s,P('brass'),8);
 yy+=.030*s;
 box('glow',x,yy,z,.024*s,.022*s,.024*s,new THREE.Color(alt?0xffad3b:0x4ef6ff));
 return [x,yy-.012*s,z];
}

/* Stepped titanium/bronze HV crossarm studded with ribbed porcelain pin-insulators & draped catenary power jumpers. */
function hyInsulatorCrossarm(yArm,halfSpan,zArm,nPerSide,sc,spineZ){
 const s=sc==null?1:sc,np=Math.max(1,nPerSide|0),armH=.065*s,armD=.085*s;
 box('titanium',0,yArm,zArm,halfSpan*2,armH,armD,hyTotemMatCol('titanium'));
 for(const sx of [-1,1]){
  beam('bronze',[sx*halfSpan*.28,yArm-.12*s,zArm],[sx*halfSpan*.82,yArm,zArm],.024*s,P('bronze'),false,6);
 }
 let count=0;
 for(const sx of [-1,1]){
  let prevCap=null;
  for(let k=0;k<np;k++){
   const fx=np===1?.82:(.52+.38*(k/(np-1)));
   const ix=sx*halfSpan*fx;
   const cap=hyPinInsulator(ix,yArm+armH,zArm,s*.88,(k+(sx>0?1:0))&1);
   count++;
   if(prevCap){
    sagRope('brass',prevCap,cap,.07*s,.010*s,P('brass'),6);
   }else{
    sagRope('brass',cap,[sx*halfSpan*.18,yArm+.04*s,spineZ==null?zArm:spineZ],.08*s,.011*s,P('brass'),6);
   }
   prevCap=cap;
  }
 }
 return count;
}

/* Cyber-Formline Crest Wing-Board: Cyber-Hayrant sleeping-eye PCB-trace wing-plate with titanium wing-tip bracket, >= 2.0 cm z-stepped
   cyberForm/B/C & maze/B/C gold & cyan PCB circuit-trace ovoids, backlit nephrite/alabaster capacitor cells & sleeping-eye diode bar! */
function hyCyberWingBoard(wx,wy,wingSpan,wingH,sx,tierIdx){
 const plateMk=tierIdx%3===0?'cyberForm':tierIdx%3===1?'cyberFormB':'cyberFormC';
 const tipW=Math.min(.095,wingSpan*.16),coreW=Math.max(.12,wingSpan-tipW-.008);
 const coreX=wx-sx*(tipW+.008)*.5,tipX=wx+sx*(wingSpan*.5-tipW*.5);
 box(plateMk,coreX,wy,-.024,coreW,wingH,.048,hyTotemMatCol(plateMk));
 box('titanium',tipX,wy+wingH*.08,-.024,tipW,wingH*.84,.056,hyTotemMatCol('titanium'));

 const zF=0,ovW=coreW*.84,ovH=wingH*.76,ovY=wy+wingH*.12;
 const mzMk=(tierIdx+(sx>0?1:2))%3===0?'cyberForm':(tierIdx+(sx>0?1:2))%3===1?'cyberFormB':'cyberFormC';
 const mzCol=hyTotemMatCol(mzMk);
 const shW=Math.min(ovW*.15,.11),midW=ovW-2*shW-.014;
 if(midW>.04){
  hyFormLayerBox(mzMk,coreX,ovY,zF,1,midW,ovH,mzCol);
  for(const qx of [-1,1]){
   hyFormLayerBox('brass',coreX+qx*(ovW*.5-shW*.5),ovY+ovH*.12,zF,1,shW,ovH*.76,P('brass'));
  }
 }else{
  hyFormLayerBox(mzMk,coreX,ovY,zF,1,ovW,ovH,mzCol);
 }
 if(ovW>.20&&ovH>.16){
  const capMk=tierIdx%2===0?'nephrite':'alabaster';
  hyFormLayerBox(capMk,coreX,ovY+ovH*.18,zF,2,ovW*.66,ovH*.64,hyTotemMatCol(capMk));
  hyFormLayerBox('cyberChassis',coreX,ovY+ovH*.28,zF,3,ovW*.44,ovH*.42,hyTotemMatCol('cyberChassis'));
  /* Horizontal sleeping-eye bus-bar diode (strictly slitted — zero open round pupils!) */
  const glowCol=new THREE.Color(tierIdx%2===0?0x4ef6ff:0xffad3b);
  const zSlit=hyRigMath.formlineLayerZ(zF,4);
  box('glow',coreX,ovY+ovH*.45,zSlit,ovW*.32,Math.max(.024,ovH*.095),.012,glowCol);
 }
 /* Rear (-z) PCB trace U-form relief stepped >= 2.0 cm clear behind -0.048 back face (cycles maze/mazeB/mazeC) */
 const rearMz=tierIdx%3===0?'maze':tierIdx%3===1?'mazeB':'mazeC';
 W(coreX,ovY,-.048,PI,()=>{
  hyUFormRelief(0,0,0,coreW*.78,ovH*.90,sx<0?'right':'left',1,rearMz,tierIdx%2===0?P('maze'):P('mazeB'),tierIdx%2===0?'celadon':'nephrite');
 });
}

/* Framed CRT / Terminal Ancestor Face Housing: cyberChassis & gunmetal bezel, cyan-lit etFaceScreen, screen Faraday vents & status strips. */
function hyCyberTerminalHousing(x,yBot,zCenter,wScr,hScr,dBox,faceSeed,cyanPrimary){
 const bw=wScr+.16,bh=hScr+.22,zF=zCenter+dBox*.5;
 const chMk=(faceSeed&1)===0?'cyberChassis':'cyberChassisB';
 box(chMk,x,yBot,zCenter,bw,bh,dBox,hyTotemMatCol(chMk));
 box('gunmetal',x,yBot+.03,zF+.014,wScr+.06,hScr+.16,.016,P('gunmetal'));
 const yMid=yBot+.11+hScr*.5;
 const cell=ET_FACE_CALM[(faceSeed>>>0)%ET_FACE_CALM.length];
 etFaceScreen(x,yMid,zF+.038,wScr-.02,hScr-.02,cell);
 box('glow',x,yMid+hScr*.5+.018,zF+.032,wScr*.82,.022,.012,new THREE.Color(cyanPrimary?0x4ef6ff:0xffad3b));
 box('glow',x,yBot+.042,zF+.032,wScr*.66,.018,.012,new THREE.Color(cyanPrimary?0xffad3b:0x4ef6ff));
 /* Side pierced screen Faraday vents stepped 2.8 cm clear outside +/-x cheeks */
 for(const sx of [-1,1]){
  W(x+sx*(bw*.5+.028),yBot+.05,zCenter,sx*PI*.5,()=>{
   const m=TF(0,(bh-.10)*.5,0);
   m.scale(new THREE.Vector3(dBox*.72,bh-.10,1));
   emit('screen',gplane(),m,new THREE.Color(1,1,1),{su:1,sv:1});
  });
 }
 haloAt(x,yMid,zF+.16,0x4ef6ff,false);
}

/* Sutar-Pira Cyber-Syncretic Totem Pylon (3.8-9.8 m):
   octagonal megabreccia/basalt base collared with Kanopi cyberChassisB arcology Busbar housings + dorsal pneumatic/busbar
   cyber-spine; 3-5 stacked closed-eye/veiled cyber-wired Eternian ancestor heads & framed cyan CRT ancestor face screens;
   cyber-formline PCB wing-boards; Mirabilis HV porcelain-insulator crossarms; and electrified Faraday/halo/arrestor crowns! */
function hyHeadTotemPole(x,y,z,yaw,o){
 o=o||{};
 const poleH=clamp(o.h==null?5.6:o.h,3.8,9.8);
 const nHeads=clamp(o.heads==null?(poleH>=7.2?5:poleH>=5.0?4:3):o.heads,3,5)|0;
 const r=o.r==null?clamp(poleH*.058,.24,.42):o.r;
 const seed=o.seed==null?etSeedAt(x,y,z,41):o.seed;
 const crowns=['faraday','arrestor','ibex','halo'];
 const rawCrown=o.crown||crowns[(seed>>>3)%crowns.length];
 const crownKind=rawCrown==='kaen'?'faraday':rawCrown==='eagle'?'arrestor':rawCrown==='sundisc'?'halo':rawCrown;
 const mats=Array.isArray(o.materials)&&o.materials.length?o.materials:null;
 const termIdx=o.terminal===false?-1:(o.terminalIdx!=null?o.terminalIdx:(nHeads>=4?1:((seed&1)===0?1:-1)));

 W(x,y,z,yaw||0,()=>{
  const yBase=.54,crownH=Math.min(1.12,poleH*.17);
  const bodyH=Math.max(2.1,poleH-yBase-crownH);
  const tierH=Math.max(.5,bodyH/nHeads);
  const tiers=hyRigMath.totemTierY(yBase,nHeads,bodyH/nHeads);
  const usedMats=[];
  let veiledCount=0,insulatorCount=0,circuitWingCount=0,screenCount=0;
  const cyberSpines=3;

  svNoWalk(()=>{
   /* 1. Octagonal megabreccia/basalt plinth collared with titanium & cyberChassisB Kanopi arcology Busbar housings */
   cyl('megabreccia',0,0,0,r*2.12,.20,P('megabreccia'),8);
   cyl('basalt',0,.20,0,r*1.72,.17,P('basalt'),8);
   cyl('titanium',0,.37,0,r*1.44,.10,hyTotemMatCol('titanium'),8);
   cyl('nephrite',0,.47,0,r*1.24,.07,P('nephrite'),8);
   for(const sx of [-1,1]){
    const bx=sx*r*1.36,bz=-r*.12,bw=r*.50,bh=.23,bd=r*.58;
    const pedCf=sx<0?'cyberForm':'cyberFormB';
    box('cyberChassisB',bx,.20,bz,bw,bh,bd,hyTotemMatCol('cyberChassisB'));
    hyFormLayerBox(pedCf,bx,.23,bz+bd*.5,1,bw*.76,bh*.68,hyTotemMatCol(pedCf));
    box('glow',bx,.38,bz+bd*.5+.026,bw*.52,.024,.014,new THREE.Color(sx<0?0x4ef6ff:0xffad3b));
   }

   /* 2. Core adzed totemWood shaft + dorsal cyberChassis busbar channel, twin ribbed bronze/gunmetal conduits & braided brass cables */
   const zSpine=-r*.64;
   cyl('totemWood',0,yBase,-.16*r,r*.62,bodyH,P('totemWood'),12,r*.54);
   box('cyberChassis',0,yBase,-r*.88,r*.42,bodyH,r*.20,hyTotemMatCol('cyberChassis'));
   for(const sx of [-1,1]){
    cyl(sx<0?'bronze':'gunmetal',sx*r*.56,yBase-.07,zSpine,.044,bodyH+.07,P(sx<0?'bronze':'gunmetal'),8);
    cyl('brass',sx*r*.30,yBase-.07,-r*1.04,.022,bodyH+.07,P('brass'),6);
   }

   for(let i=0;i<nHeads;i++){
    const ty=tiers[i],rTier=r*(1-.035*i);
    const mat=mats?mats[i%mats.length]:HY_TOTEM_MATS[(seed+i*3)%HY_TOTEM_MATS.length];
    usedMats.push(mat);
    const isTerminal=(i===termIdx)&&(o.veiledIdx!==i);
    const isVeiled=!isTerminal&&(o.veiledIdx===i||(o.veiled===true&&i===nHeads-1)||mat==='gunmetal');
    if(isVeiled)veiledCount++;

    /* Dorsal conduit compression clamps at each tier */
    for(const sx of [-1,1]){
     ring('brass',sx*r*.56,ty+.06,zSpine,.062,.018,P('brass'),0,0,0,10);
    }

    /* Sculptural kaen/celadon/titanium dielectric collar */
    const collarH=Math.min(.22,tierH*.20);
    const colMk=i%2===0?'celadon':'kaen';
    const colVal=hyTotemMatCol(colMk);
    lathe(colMk,0,0,[[rTier*.90,ty+.004],[rTier*1.18,ty+collarH*.66],[rTier*1.02,ty+collarH]],14,colVal);
    ring('titanium',0,ty+collarH*.82,0,rTier*1.12,.024,hyTotemMatCol('titanium'),0,0,0,14);

    /* Syncretic shaved-willow inau curls on base tier + HV porcelain-insulator crossarms */
    if(i===0&&o.inau!==false){
     for(const sx of [-1,1]){
      hyInauCluster(sx*rTier*1.12,ty+collarH*.55,rTier*.50,sx*.42,{scale:.44,count:2,holder:false});
     }
    }
    if(o.insulators!==false&&(i===0||i===nHeads-1||(nHeads>=5&&i===2))){
     const armSpan=Math.min(r*2.45,rTier*2.25);
     insulatorCount+=hyInsulatorCrossarm(ty+collarH*.22,armSpan,-rTier*.44,2,.82,zSpine);
    }

    /* Circuit-Maze Formline Crest Wing-Boards on +/-x */
    if(o.wings!==false){
     const wingSpan=o.wingSpan==null?rTier*(i===nHeads-1?2.18:1.76):o.wingSpan*(1-.05*i);
     const wingH=Math.min(.68,(tierH-collarH)*.68);
     const wy=ty+collarH+(tierH-collarH-wingH)*.46;
     for(const sx of [-1,1]){
      const wx=sx*(rTier*.98+wingSpan*.5);
      hyCyberWingBoard(wx,wy,wingSpan,wingH,sx,i);
      circuitWingCount++;
     }
    }

    /* Stacked Cyber-Ancestor Tier: either framed cyan CRT face housing OR cyber-wired faceted closed-eye/veiled head */
    const isTop=i===nHeads-1;
    const headH=Math.max(.46,(tierH-collarH)*(isTop?.74:.82));
    if(isTerminal){
     const wScr=Math.min(rTier*1.46,headH*.78),hScr=headH*.72;
     hyCyberTerminalHousing(0,ty+collarH+.04,rTier*.36,wScr,hScr,rTier*.52,seed+i*17,(i&1)===0);
     screenCount++;
    }else{
     const hds=['step','fan','ring','none'];
     const hd=(isVeiled||isTop)?'none':hds[(seed+i)%3===2?'none':(seed+i)%3];
     const hp=etHeadParams(seed+i*37+11,{eyes:'closed',headdress:hd,neck:true});
     const zHead=rTier*.26,yHead=ty+collarH+headH*.14;
     const hScale=isVeiled?[headH*.84,headH*.92,headH*.84]:[headH*.90,headH*.94,headH*.88];
     etEmitGeo(mat,etHeadGeo(hp),0,yHead,zHead,hScale,0,hyTotemMatCol(mat));
     if(isVeiled){
      etEmitGeo('bronze',etVeilGeo({seed:seed+i*53+19}),0,yHead,zHead,[headH*.96,headH*.96,headH*.94],0,new THREE.Color(P('bronze')).multiplyScalar(.66));
     }
     /* Cybernetic brass/titanium temple-jacks, neural halo-ring & forehead third-eye/visor diode */
     ring(i%2===0?'titanium':'brass',0,yHead+headH*.46,zHead-headH*.14,headH*.52,.020,i%2===0?hyTotemMatCol('titanium'):P('brass'),.34,0,0,16);
     for(const sx of [-1,1]){
      const jx=sx*headH*.41,jy=yHead+headH*.34,jz=zHead+.02;
      pole('brass',[jx*.82,jy,jz],[jx*1.12,jy,jz],.024,P('brass'),8);
      tube('gunmetal',t=>[lerp(jx*1.08,sx*r*.56,t),jy-.04*Math.sin(PI*t),lerp(jz,zSpine,t)],t=>[.016,.016],6,5,P('gunmetal'),{caps:false});
     }
     if(!isVeiled){
      box('glow',0,yHead+headH*.46,zHead+headH*.43,headH*.22,.024,.022,new THREE.Color(i%2===0?0x4ef6ff:0xffad3b));
     }
    }
    if(CURREC&&!PLACE_DRY){
     (CURREC.heads=CURREC.heads||[]).push({
      kind:'head',metal:isTerminal?'faces':mat,eyes:isVeiled?'veiled':'closed',veiled:isVeiled,totem:true,terminal:isTerminal
     });
    }
   }

   /* 5. Electrified Cyber-Crowns */
   const yApex=yBase+bodyH;
   cyl('titanium',0,yApex,0,r*1.10,.08,hyTotemMatCol('titanium'),10);
   if(crownKind==='arrestor'){
    const yC=yApex+.08,ch=Math.max(.56,crownH-.08);
    cyl('totemWood',0,yC,0,r*.76,ch*.72,P('totemWood'),10,r*.58);
    for(const sx of [-1,1]){
     const crCf=sx<0?'cyberFormB':'cyberFormC';
     box('cyberChassis',sx*r*.84,yC+ch*.08,-.04,.10,ch*.62,r*.98,hyTotemMatCol('cyberChassis'));
     W(sx*(r*.84+.052),yC+ch*.14,-.04,sx*PI/2,()=>{
      hyFormLayerBox(crCf,0,0,0,1,r*.72,ch*.44,hyTotemMatCol(crCf));
     });
     box('glow',sx*r*.32,yC+ch*.54,r*.76,r*.24,.026,.022,new THREE.Color(0x4ef6ff));
    }
    box('bronze',0,yC+ch*.36,r*.84,r*.32,ch*.20,r*.44,P('bronze'));
    /* Tri-prong porcelain-insulator lightning arrestor */
    insulatorCount+=1;
    hyPinInsulator(0,yC+ch*.72,0,.78,0);
    for(const sx of [-1,1]){
     pole('bronze',[sx*r*.24,yC+ch*.68,0],[sx*r*.68,yC+ch*.98,0],.020,P('bronze'),6);
     box('glow',sx*r*.69,yC+ch*.98,0,.034,.034,.034,new THREE.Color(0x4ef6ff));
    }
   }else if(crownKind==='ibex'){
    const yC=yApex+.08,ch=Math.max(.54,crownH-.08);
    cyl('titanium',0,yC,0,r*.72,ch*.56,hyTotemMatCol('titanium'),10,r*.56);
    for(const sx of [-1,1]){
     box('glow',sx*r*.28,yC+ch*.38,r*.70,r*.22,.026,.022,new THREE.Color(0xffad3b));
     tube('bronze',t=>[sx*r*(.32+.42*t),yC+ch*(.50+.44*Math.sin(PI*.78*t)),r*(.18-.70*t)],t=>[.056-.024*t,.068-.028*t],8,6,P('bronze'),{caps:true});
     ring('white',sx*r*.48,yC+ch*.76,-r*.10,.085,.022,hyTotemMatCol('white'),.4,sx*.3,0,10);
    }
    cyl('glow',0,yC+ch*.56,0,r*.24,ch*.26,new THREE.Color(0x4ef6ff),8);
    hyFaradayScreenCyl(0,yC+ch*.57,0,r*.42,ch*.25,8);
   }else if(crownKind==='halo'){
    const yC=yApex+.08,rDisc=Math.max(.32,r*1.12);
    box('nephrite',0,yC,0,r*1.12,.14,r*.72,P('nephrite'));
    const yMid=yC+.14+rDisc+.04;
    ring('titanium',0,yMid,0,rDisc,.044,hyTotemMatCol('titanium'),0,PI/2,0,18);
    ring('gold',0,yMid,0,rDisc*.78,.034,hyTotemMatCol('gold'),.52,.35,0,16);
    cyl('glow',0,yMid-.12,0,.12,.24,new THREE.Color(0x4ef6ff),10);
    haloAt(0,yMid,0,0x4ef6ff,false);
   }else{
    /* 'faraday' arc-lantern Faraday cage over celadon kaen base */
    const yC=yApex+.08,ch=Math.max(.56,crownH-.08);
    cyl('celadon',0,yC,0,r*.84,ch*.26,hyTotemMatCol('celadon'),12,r*.72);
    const yCage=yC+ch*.26,hCage=ch*.52;
    cyl('glow',0,yCage+.02,0,r*.34,hCage-.04,new THREE.Color(0x4ef6ff),10);
    hyFaradayScreenCyl(0,yCage+.01,0,r*.64,hCage-.02,8);
    cyl('titanium',0,yCage+hCage,0,r*.74,.08,hyTotemMatCol('titanium'),10,r*.48);
    pole('brass',[0,yCage+hCage+.08,0],[0,yC+ch+.04,0],.018,P('brass'),6);
    haloAt(0,yCage+hCage*.5,0,0x4ef6ff,false);
   }
  });
  if(o.wallBlock!==false)hyWallBlock(0,0,0,r*3.8,Math.min(2.6,poleH),r*3.8);
  if(CURREC&&!PLACE_DRY){
   (CURREC.totemPoles=CURREC.totemPoles||[]).push({
    h:+poleH.toFixed(2),heads:nHeads,openEyes:0,veiled:veiledCount,crown:crownKind,
    materials:usedMats,monumental:false,
    cyberSpines,insulators:insulatorCount,circuitWings:circuitWingCount,terminalScreens:screenCount
   });
  }
 });
 return y+poleH;
}

/* Monumental Central-Square Cyber-Totem Colossus (14.5-20.5 m):
   stepped octagonal megabreccia + titanium + nephrite transformer dais w/ 4 radial cyberChassisB + cyber-formline switchgear cubicles;
   4-trunk dorsal/lateral pneumatic-and-busbar spines; 5-7 colossal tiers alternating 1.8-2.3 m closed-eye/veiled
   ancestor colossus heads with 4-face octagonal glowing cyan etFaceScreen public-address matrices; 5.0-6.8 m cantilevered
   cyber-formline great-wings studded with Mirabilis HV porcelain insulators; and a 3-ring Faraday telemetry & arrestor spire! */
function hyMonumentalCyberTotem(x,y,z,yaw,o){
 o=o||{};
 const poleH=clamp(o.h==null?18.4:o.h,14.5,20.5);
 const nTiers=clamp(o.tiers==null?(poleH>=18.0?6:5):o.tiers,5,7)|0;
 const maxSpan=clamp(o.span==null?(poleH>=18.0?6.2:5.1):o.span,4.6,6.8);
 const r=o.r==null?clamp(poleH*.040,.62,.78):o.r;
 const seed=o.seed==null?etSeedAt(x,y,z,73):o.seed;
 const colossusMats=o.materials||['gold','titanium','silver','bronze','gunmetal','celadon','nephrite'];

 W(x,y,z,yaw||0,()=>{
  const yBase=1.62,spireH=Math.min(3.15,poleH*.175);
  const bodyH=Math.max(9.2,poleH-yBase-spireH);
  const tierH=bodyH/nTiers;
  const tiers=hyRigMath.totemTierY(yBase,nTiers,tierH);
  const usedMats=[];
  let veiledCount=0,insulatorCount=0,circuitWingCount=0,screenCount=0,headRecords=0;
  const cyberSpines=4;

  svNoWalk(()=>{
   /* 1. Stepped octagonal megabreccia + titanium + nephrite + white arcology transformer dais */
   cyl('megabreccia',0,0,0,r*2.85,.42,P('megabreccia'),8);
   cyl('basalt',0,.42,0,r*2.42,.38,P('basalt'),8);
   cyl('titanium',0,.80,0,r*2.08,.34,hyTotemMatCol('titanium'),8);
   cyl('nephrite',0,1.14,0,r*1.82,.22,P('nephrite'),8);
   cyl('white',0,1.36,0,r*1.58,.26,hyTotemMatCol('white'),8);

   /* 4 radial HV switchgear cubicles with cyberChassisB housings, cyberForm/B/C panels & twin porcelain transformer bushings */
   for(let q=0;q<4;q++){
    const qa=q*PI*.5;
    const qCf=q===0?'cyberFormB':q===1?'cyberFormC':q===2?'cyberForm':'cyberFormB';
    W(Math.sin(qa)*r*1.92,.42,Math.cos(qa)*r*1.92,qa,()=>{
     box('cyberChassisB',0,0,0,r*.92,.84,r*.68,hyTotemMatCol('cyberChassisB'));
     hyFormLayerBox(qCf,0,.10,r*.34,1,r*.72,.62,hyTotemMatCol(qCf));
     box('glow',0,.62,r*.34+.028,r*.52,.032,.016,new THREE.Color(q%2===0?0x4ef6ff:0xffad3b));
     for(const sx of [-.24,.24]){
      const bCap=hyPinInsulator(sx*r,.84,0,1.22,q&1);
      insulatorCount++;
      sagRope('brass',bCap,[sx*r*.55,1.42,-r*.62],.12,.016,P('brass'),7);
     }
    });
   }

   /* 2. Octagonal carved adzed totemWood core pylon + 4 intercardinal pneumatic & busbar conduit spines */
   cyl('totemWood',0,yBase,0,r*.92,bodyH,P('totemWood'),8,r*.72);
   for(let k=0;k<4;k++){
    const ca=PI*.25+k*PI*.5,cx=Math.cos(ca)*r*1.04,cz=Math.sin(ca)*r*1.04;
    cyl(k%2===0?'bronze':'gunmetal',cx,yBase-.18,cz,.078,bodyH+.18,P(k%2===0?'bronze':'gunmetal'),8);
    cyl('brass',Math.cos(ca)*r*1.20,yBase-.18,Math.sin(ca)*r*1.20,.032,bodyH+.18,P('brass'),6);
   }

   /* 3. Stacked Colossal Ancestor Heads & 4-Face Public-Address CRT Terminal Matrices */
   let prevOuterL=null,prevOuterR=null;
   for(let i=0;i<nTiers;i++){
    const ty=tiers[i],tFrac=i/Math.max(1,nTiers-1),rTier=r*(1-.18*tFrac);
    const collarH=Math.min(.32,tierH*.16);
    const colMk=i%2===0?'titanium':'celadon';
    lathe(colMk,0,0,[[rTier*1.04,ty+.006],[rTier*1.32,ty+collarH*.65],[rTier*1.12,ty+collarH]],16,hyTotemMatCol(colMk));
    for(let k=0;k<4;k++){
     const ca=PI*.25+k*PI*.5;
     ring('brass',Math.cos(ca)*r*1.04,ty+collarH*.5,Math.sin(ca)*r*1.04,.105,.024,P('brass'),0,0,0,10);
    }

    /* Cantilevered Circuit-Maze PCB Great-Wings & HV Porcelain-Insulator Crossarms */
    const fullSpan=maxSpan*(1-.22*tFrac);
    const wingEach=Math.max(.95,(fullSpan-rTier*2.1)*.5);
    const wingH=Math.min(1.18,(tierH-collarH)*.68);
    const wy=ty+collarH+(tierH-collarH-wingH)*.42;
    for(const sx of [-1,1]){
     const wx=sx*(rTier*1.05+wingEach*.5);
     hyCyberWingBoard(wx,wy,wingEach,wingH,sx,i);
     circuitWingCount++;
    }
    const armHalf=fullSpan*.46;
    insulatorCount+=hyInsulatorCrossarm(ty+collarH*.18,armHalf,-rTier*.68,3,1.08,-rTier*.82);
    const curL=[-armHalf*.88,ty+collarH*.18+.22,-rTier*.68],curR=[armHalf*.88,ty+collarH*.18+.22,-rTier*.68];
    if(prevOuterL){
     sagRope('iron',prevOuterL,curL,.16,.014,P('iron'),7);
     sagRope('iron',prevOuterR,curR,.16,.014,P('iron'),7);
    }
    prevOuterL=curL;prevOuterR=curR;

    const availH=tierH-collarH;
    const isMatrix=(i%2===1)&&(i<nTiers-1);
    if(isMatrix){
     /* 4-way octagonal talking-head public-address CRT terminal matrix + Faraday cooling sleeve */
     const mH=availH*.78,mW=rTier*1.28;
     cyl('cyberChassis',0,ty+collarH+.04,0,rTier*.88,mH,hyTotemMatCol('cyberChassis'),8);
     hyFaradayScreenCyl(0,ty+collarH+.08,0,rTier*1.06,mH-.08,8);
     for(let f=0;f<4;f++){
      const fa=f*PI*.5;
      W(Math.sin(fa)*(rTier*1.12),ty+collarH+.06,Math.cos(fa)*(rTier*1.12),fa,()=>{
       hyCyberTerminalHousing(0,0,0,mW*.86,mH*.72,.16,seed+i*19+f*7,(f+i)%2===0);
      });
      screenCount++;
     }
     usedMats.push('faces');
     headRecords++;
     if(CURREC&&!PLACE_DRY){
      (CURREC.heads=CURREC.heads||[]).push({kind:'head',metal:'faces',eyes:'closed',veiled:false,totem:true,terminal:true});
     }
    }else{
     /* Colossal 1.8-2.3 m Cyber-Wired Closed-Eye / Veiled Eternian Ancestor Head */
     const mat=colossusMats[(i>>1)%colossusMats.length];
     usedMats.push(mat);
     const isVeiled=(mat==='gunmetal')||(o.veiledIdx===i);
     if(isVeiled)veiledCount++;
     const headH=Math.max(1.35,availH*.84);
     const hp=etHeadParams(seed+i*43+29,{eyes:'closed',headdress:isVeiled?'none':(i===nTiers-1?'mitre':'band'),neck:true});
     const zHead=rTier*.44,yHead=ty+collarH+headH*.12;
     etEmitGeo(mat,etHeadGeo(hp),0,yHead,zHead,[headH*.92,headH*.95,headH*.90],0,hyTotemMatCol(mat));
     if(isVeiled){
      etEmitGeo('bronze',etVeilGeo({seed:seed+i*61+7}),0,yHead,zHead,[headH*.97,headH*.97,headH*.95],0,new THREE.Color(P('bronze')).multiplyScalar(.66));
     }
     /* Twin colossal neural halo-rings, temple conduit trunks & blazing brow diode */
     ring('gold',0,yHead+headH*.48,zHead-headH*.12,headH*.56,.032,hyTotemMatCol('gold'),.30,0,0,20);
     ring('titanium',0,yHead+headH*.48,zHead-headH*.16,headH*.66,.024,hyTotemMatCol('titanium'),-.24,.28,0,20);
     for(const sx of [-1,1]){
      const jx=sx*headH*.42,jy=yHead+headH*.35,jz=zHead+.04;
      pole('titanium',[jx*.80,jy,jz],[jx*1.18,jy,jz],.042,hyTotemMatCol('titanium'),10);
      tube('bronze',t=>[lerp(jx*1.14,sx*r*.74,t),jy-.08*Math.sin(PI*t),lerp(jz,-r*.74,t)],t=>[.028,.028],7,6,P('bronze'),{caps:false});
     }
     if(!isVeiled){
      box('glow',0,yHead+headH*.46,zHead+headH*.44,headH*.26,.042,.032,new THREE.Color(i===nTiers-1?0x4ef6ff:0xffad3b));
     }
     headRecords++;
     if(CURREC&&!PLACE_DRY){
      (CURREC.heads=CURREC.heads||[]).push({kind:'head',metal:mat,eyes:isVeiled?'veiled':'closed',veiled:isVeiled,totem:true});
     }
    }
   }

   /* 4. Apex Multi-Ring Faraday Telemetry Halo & Tri-Prong Porcelain Lightning-Arrestor Spire */
   const yApex=yBase+bodyH;
   cyl('titanium',0,yApex,0,r*1.28,.16,hyTotemMatCol('titanium'),8);
   cyl('nephrite',0,yApex+.16,0,r*1.08,.14,P('nephrite'),8);
   const yCore=yApex+.30,coreH=spireH*.56;
   cyl('glow',0,yCore+.04,0,r*.44,coreH-.08,new THREE.Color(0x4ef6ff),12);
   hyFaradayScreenCyl(0,yCore+.02,0,r*.78,coreH-.04,8);
   const yOrb=yCore+coreH*.5;
   ring('gold',0,yOrb,0,r*1.58,.052,hyTotemMatCol('gold'),.38,.22,0,24);
   ring('titanium',0,yOrb,0,r*1.32,.042,hyTotemMatCol('titanium'),-.42,-.28,0,22);
   ring('bronze',0,yOrb,0,r*1.08,.036,P('bronze'),PI*.5,0,0,20);
   const yCap=yCore+coreH;
   cyl('titanium',0,yCap,0,r*.92,.14,hyTotemMatCol('titanium'),8,r*.56);
   const mastTop=yApex+spireH-.06;
   pole('gold',[0,yCap+.14,0],[0,mastTop,0],.042,hyTotemMatCol('gold'),8);
   box('glow',0,mastTop,0,.09,.09,.09,new THREE.Color(0x4ef6ff));
   for(let p=0;p<3;p++){
    const pa=p*TAU/3,px=Math.cos(pa)*r*.74,pz=Math.sin(pa)*r*.74;
    hyPinInsulator(px,yCap+.14,pz,1.15,p&1);
    insulatorCount++;
    pole('bronze',[px,yCap+.36,pz],[px*1.32,mastTop-.28,pz*1.32],.024,P('bronze'),6);
    box('glow',px*1.32,mastTop-.28,pz*1.32,.055,.055,.055,new THREE.Color(0xffad3b));
   }
   haloAt(0,yOrb,0,0x4ef6ff,true);
   haloAt(0,mastTop-.2,0,0xffad3b,false);
  });

  if(o.wallBlock!==false)hyWallBlock(0,0,0,r*5.2,3.2,r*5.2);
  if(CURREC&&!PLACE_DRY){
   (CURREC.totemPoles=CURREC.totemPoles||[]).push({
    h:+poleH.toFixed(2),heads:headRecords,openEyes:0,veiled:veiledCount,crown:'monumental-halo-arrestor',
    materials:usedMats,monumental:true,
    cyberSpines,insulators:insulatorCount,circuitWings:circuitWingCount,terminalScreens:screenCount
   });
  }
 });
 return y+poleH;
}
