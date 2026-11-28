// ================================================================= SOUTHWEST BAY - endemic floor, spring, cliff & masonry builders
// Draws the 12 own-page endemics declared in 53-biome-swbay-endemic-species.js without altering 50-75 or moving any draw of the 14 tree species.
(function(){if(!SWBAY||!SWBAY.PLANTS)return;
 const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
 const T3=BIO.host.THREE,EP=SWBAY.ENDEMIC_PAL,PAL=SWBAY.PAL,zones=SWBAY.zones,blocked=SWBAY.blocked;
 const {bright,shade,vary}=SWBAY;
 const Y=(x,z)=>BIO.terrainH(x,z);
 const tone=(set,k)=>bright(vary(pick(set),.03,.09,.06),k==null?1.15:k);
 const slopeAt=(x,z)=>{const e=2.0;return Math.max(Math.abs(Y(x+e,z)-Y(x-e,z)),Math.abs(Y(x,z+e)-Y(x,z-e)))/(2*e);};

 // ---------------------------------------------------------------- own-pack materials & instanced defs
 const TX=SWBAY.TEX||{},ph=()=>new T3.DataTexture(new Uint8Array([255,255,255,255]),1,1,T3.RGBAFormat);
 const hasOwn=n=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed&&!!KMAT.packed('swbay-own',n);
 const ownMat=(slot,fb,opt)=>BIO.leafMat(hasOwn(slot)?ph():(fb||TX.under),slot,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.38,backlit:.25},opt||{}));
 const EM={
  seagrape:ownMat('seagrape',TX.under,{swayA:.04}),
  beachvine:ownMat('beachvine',TX.moss,{swayW:'0.0',swayA:0,alphaTest:.35}),
  spiderlily:ownMat('spiderlily',TX.bloom,{swayA:.05,backlit:.32}),
  springgrass:ownMat('springgrass',TX.reed,{swayA:.14,backlit:.3}),
  dripveil:ownMat('dripveil',TX.beard,{swayW:'(1.0-position.y)',swayA:.04,alphaTest:.35}),
  bromeliad:ownMat('bromeliad',TX.under,{swayA:.02,backlit:.28}),
  orchid:ownMat('orchid',TX.bloom,{swayA:.05,backlit:.34}),
  staraloe:ownMat('staraloe',TX.bloom,{swayA:.03,backlit:.25}),
  samphire:ownMat('samphire',TX.clubmoss,{swayA:.02,alphaTest:.38})
 };
 if(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)SWBAY.OWN_LIB=BIO.libSwap('swbay-own',EM);

 /* a hung curtain quad (origin at top y=0, hanging down to y=-1, uv top at v=0) for drip-cap mucilage fringes */
 function hangQuad(){const pos=[],uv=[],nor=[];
  for(let k=0;k<2;k++){const a=k*Math.PI*.5+.25,ca=Math.cos(a),sa=Math.sin(a),P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]];
   [0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(ca*q[0],q[1],sa*q[0]);uv.push(q[0]+.5,-q[1]);nor.push(-sa,0,ca);});}
  return BIO.geo._make(pos,nor,uv);}
 const G_TUFT=SWBAY.G.tuft,G_MAT=BIO.geo.mat;
 BIO.def('seagrape',G_TUFT(),EM.seagrape,{label:'Ring-Sea sea-grape salt-glazed foliage'});
 BIO.def('caperbush',G_TUFT(),EM.seagrape,{label:'Skarn cliff-caper foliage',cliff:true});
 BIO.def('beachvine',G_MAT(),EM.beachvine,{label:'Coquina beach-bean runners'});
 BIO.def('spiderlily',G_TUFT(),EM.spiderlily,{label:'Surf spider-lily and caper blossoms',cliff:true});
 BIO.def('arumspathe',G_TUFT(),SWBAY.MAT.bloom,{label:'Turquoise spring-arum spathes'});
 BIO.def('springgrass',G_TUFT(),EM.springgrass,{label:'Karst ribbon-weed tufts'});
 BIO.def('dripveil',hangQuad(),EM.dripveil,{label:'Drip-cap shelf-fungoid weeping fringes',cliff:true});
 BIO.def('bromeliad',G_TUFT(),EM.bromeliad,{label:'Crimson cistern-urn rosettes'});
 BIO.def('orchid',G_TUFT(),EM.orchid,{label:'Violet cane-orchid sprays'});
 BIO.def('gingertorch',SWBAY.G.rosette(),SWBAY.MAT.rosette,{label:'Bay torch-ginger crimson bracts'});
 BIO.def('staraloe',G_TUFT(),EM.staraloe,{label:'Termite star-aloe flower torches'});
 BIO.def('samphire',G_TUFT(),EM.samphire,{label:'Copper-seam rock-samphire tufts',cliff:true});

 // ---------------------------------------------------------------- species builders
 const tuft=(item,x,y,z,h,w,col,tilt)=>{const t=tilt==null?.07:tilt;BIO.put(item,[x,y-.04,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);};
 function seaGrape(x,z,st,lv){const y=Y(x,z),n=lv===2?ri(2,4):2,R=rr(.65,1.35);
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.25,R*.55):0,sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,sy=Y(sx,sz),h=rr(.75,1.55);
   if(lv===2)BIO.beam('rod',[x,y-.06,z],[sx,sy+h*.55,sz],.045,.024,shade(vary(0x7c6e5e,.02,.06,.05),-.2));
   tuft('seagrape',sx,sy+h*.18,sz,h*.85,h*1.05,tone(EP.seagrape,1.18),.12);
   if(lv===2&&rng()<.45)BIO.put('bloom',[sx,sy+h*.42,sz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.12,.22),tone([0x6e2852,0x823064],1.1));}
  st.bayseagrape++;}
 function coquinaVine(x,z,st,lv){const n=lv===2?ri(2,4):2;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.35,1.25):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(k&&BIO.mask(px,pz)<=0)continue;
   const py=Y(px,pz),e=1.0,nrm=[-(Y(px+e,pz)-Y(px-e,pz))/(2*e),1,-(Y(px,pz+e)-Y(px,pz-e))/(2*e)],s=rr(.55,1.15);
   BIO.put('beachvine',[px,py+.03,pz],qUp(nrm),[s,1,s*rr(.85,1.15)],tone(EP.beachvine,1.12));
   if(lv===2&&rng()<.5)BIO.put('bloom',[px+rr(-.2,.2),py+.09,pz+rr(-.2,.2)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.1,.18),tone(EP.vineBloom,1.2));}
  st.coquinavine++;}
 function sprayCrinum(x,z,st,lv){const y=Y(x,z),L=rr(.65,1.15),m=lv===2?ri(5,7):4,a0=rr(0,TAU);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU+rr(-.18,.18);BIO.put('paddle',[x,y+.08,z],qEuler(rr(-.06,.06),-a,rr(.32,.78)),[L,L*.55,L*.42],tone(EP.beachvine,1.18));}
  const H=rr(.55,1.05);if(lv===2)BIO.beam('rod',[x,y-.03,z],[x,y+H*.72,z],.022,.014,tone(EP.beachvine,.85));
  tuft('spiderlily',x,y+H*.42,z,rr(.36,.58),rr(.42,.66),tone(EP.crinum,1.12),.08);
  st.spraycrinum++;}
 function karstArum(x,z,st,lv){const y=Y(x,z),L=rr(.75,1.35),m=lv===2?ri(4,6):3,a0=rr(0,TAU);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU+rr(-.2,.2);BIO.put('paddle',[x,y+.12,z],qEuler(rr(-.08,.08),-a,rr(.42,.88)),[L,L*.78,L*.65],tone(EP.arumLeaf,1.2));}
  for(let s=0,ns=lv===2?ri(1,3):1;s<ns;s++){const ox=rr(-.18,.18),oz=rr(-.18,.18),H=rr(.45,.88);
   if(lv===2)BIO.beam('rod',[x+ox,y-.03,z+oz],[x+ox,y+H*.75,z+oz],.018,.01,tone(EP.arumLeaf,.82));
   tuft('arumspathe',x+ox,y+H*.52,z+oz,rr(.24,.4),rr(.22,.34),tone(EP.arumSpathe,1.15),.06);}
  st.karstarum++;}
 function springStrap(x,z,st,lv){const n=lv===2?ri(2,5):2;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.25,1.1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz),h=rr(.42,.98);
   tuft('springgrass',px,py,pz,h,h*.95,tone(EP.springStrap,1.18),.1);}
  st.springstrap++;}
 function dripCapAt(x,y,z,nrm,scale,st){const nb=ri(2,4),c=tone(EP.dripCap,1.12),vc=tone(EP.dripVeil,1.1);
  for(let k=0;k<nb;k++){const ox=rr(-.22,.22)*scale,oy=rr(-.12,.22)*scale,oz=rr(-.22,.22)*scale,sb=rr(.26,.58)*scale;
   const q=SWBAY.shelfQ?SWBAY.shelfQ(nrm,rr(-.2,.2),rr(0,TAU),rr(-.2,.2)):qEuler(0,rr(0,TAU),0);
   const ss=SWBAY.shelfS?SWBAY.shelfS(sb):[sb,sb*.45,sb];
   BIO.put('fungus',[x+ox,y+oy,z+oz],q,ss,bright(c,rr(.9,1.12)));
   BIO.put('dripveil',[x+ox,y+oy-.02,z+oz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[sb*1.15,sb*rr(.85,1.45),sb*1.15],vc);}
  if(st)st.dripcap++;}
 function dripCapFloor(x,z,st){const y=Y(x,z),e=1.5,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),nrm=[-gx,2*e,-gz];
  BIO.put('boulder',[x,y+.22,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[rr(.55,.95),rr(.38,.65),rr(.55,.95)],SWBAY.tint(pick(PAL.rock),SWBAY.means().rock,.48));
  dripCapAt(x,y+.42,z,nrm,1.0,st);}
 function tankBromeliad(x,z,st,lv){const y=Y(x,z),n=lv===2?ri(1,3):1;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.28,.75):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(k&&BIO.mask(px,pz)<=0)continue;
   const py=Y(px,pz),h=rr(.48,.95);tuft('bromeliad',px,py,pz,h,h*1.12,tone(EP.bromeliad,1.18),.08);
   if(lv===2&&rng()<.6)BIO.put('bloom',[px,py+h*.68,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),rr(.14,.24),tone(EP.gingerTorch,1.2));}
  st.tankbromeliad++;}
 function prismOrchid(x,z,st,lv){const y=Y(x,z),nc=lv===2?ri(2,4):2;
  for(let k=0;k<nc;k++){const a=rr(0,TAU),d=rr(.04,.22),sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,H=rr(.42,.88),lx=Math.cos(a)*H*.24,lz=Math.sin(a)*H*.24;
   if(lv===2)BIO.beam('rod',[sx,y-.03,sz],[sx+lx,y+H*.68,sz+lz],.016,.009,tone([0x8c8442,0x7a7438],1));
   tuft('orchid',sx+lx*.7,y+H*.36,sz+lz*.7,rr(.34,.56),rr(.36,.58),tone(EP.orchid,1.16),.14);}
  st.prismorchid++;}
 function torchGinger(x,z,st,lv){const y=Y(x,z),nc=lv===2?ri(3,5):2,nt=lv===2?ri(2,3):1;
  for(let k=0;k<nc;k++){const a=k/nc*TAU+rr(-.2,.2),H=rr(1.15,1.95),lx=Math.cos(a)*H*.32,lz=Math.sin(a)*H*.32;
   if(lv===2)BIO.beam('rod',[x,y-.04,z],[x+lx,y+H*.72,z+lz],.024,.012,tone(EP.gingerCane,.9));
   BIO.put('paddle',[x+lx*.65,y+H*.58,z+lz*.65],qEuler(rr(-.08,.08),-a,rr(.25,.6)),[rr(.75,1.2),rr(.55,.85),rr(.55,.8)],tone(EP.gingerCane,1.2));}
  for(let t=0;t<nt;t++){const a=rr(0,TAU),d=rr(.12,.38),tx=x+Math.cos(a)*d,tz=z+Math.sin(a)*d,th=rr(.55,1.05);
   BIO.beam('rod',[tx,y-.03,tz],[tx,y+th,tz],.02,.014,tone(EP.gingerTorch,.75));
   BIO.put('gingertorch',[tx,y+th-.04,tz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[.18,.28,.18],tone(EP.gingerTorch,1.22));}
  st.torchginger++;}
 function savAloe(x,z,st,lv){const y=Y(x,z),R=rr(.38,.78);
  BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.82,R],tone(EP.aloeLeaf,1.1));
  const H=rr(.52,1.15);if(lv===2)BIO.beam('rod',[x,y,z],[x,y+H*.68,z],.022,.012,shade(vary(0x7a5c42,.02,.06,.05),-.15));
  tuft('staraloe',x,y+H*.38,z,rr(.38,.66),rr(.36,.62),tone(EP.starAloe,1.16),.07);
  st.savaloe++;}
 function epidoteCaper(x,z,st,lv){const y=Y(x,z),e=1.5,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),gl=Math.hypot(gx,gz)||1,dx=-gx/gl,dz=-gz/gl,n=lv===2?ri(2,4):2;
  for(let k=0;k<n;k++){const s=rr(.45,.95),ox=dx*s*.32+rr(-.22,.22),oz=dz*s*.32+rr(-.22,.22);
   if(lv===2)BIO.beam('rod',[x,y-.04,z],[x+ox,y+s*.28,z+oz],.022,.01,shade(vary(0x746c62,.02,.05,.05),-.15));
   tuft('caperbush',x+ox,y-.02,z+oz,s*.72,s*.95,tone(EP.caperLeaf,1.12),.18);
   if(lv===2&&rng()<.65)tuft('spiderlily',x+ox*1.1,y+s*.18,z+oz*1.1,rr(.22,.36),rr(.26,.42),tone(EP.crinum,1.15),.14);}
  st.epidotecaper++;}
 function chalcoSamphire(x,z,st,lv){const n=lv===2?ri(2,4):2;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.18,.68):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(k&&BIO.mask(px,pz)<=0)continue;
   const py=Y(px,pz),h=rr(.24,.52);tuft('samphire',px,py,pz,h,h*1.08,tone(EP.samphire,1.15),.08);
   if(lv===2&&rng()<.55)BIO.put('bloom',[px,py+h*.78,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),rr(.08,.15),tone(EP.samphireUmbel,1.15));}
  st.chalcosamphire++;}

 // ---------------------------------------------------------------- passes (bay & raised skarn-marble coast)
 SWBAY.buildEndemics=function(R,q){reseed(720531);q=q==null?1:q;R=R||2400;
  const st={bayseagrape:0,coquinavine:0,spraycrinum:0,karstarum:0,springstrap:0,dripcap:0,tankbromeliad:0,prismorchid:0,torchginger:0,savaloe:0,epidotecaper:0,chalcosamphire:0};
  const cx=(BIO.host.center&&BIO.host.center[0])||0,cz=(BIO.host.center&&BIO.host.center[1])||0;
  const box=[cx-R,cz-R,cx+R,cz+R],nearR=SWBAY.LOD?SWBAY.LOD.floor:800,midR=SWBAY.LOD?SWBAY.LOD.floorMid:1200;
  const lvAt=(x,z)=>BIO.lodD(x,z)<nearR?2:1,inMid=(x,z)=>BIO.lodD(x,z)<=midR;
  const ok=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
  /* 1-3: coastal strand & raised fossil wave-cut shelf (Ring Sea shore + Almua T1/carbonate-shelf platform) */
  const strandW=(x,z)=>{const Z=zones(x,z);if(Z.h<.4)return 0;const sl=slopeAt(x,z);if(sl>.65)return 0;
   return clamp(Z.shore*.78+smooth(.25,.18,Z.up)*smooth(.28,.44,Z.wet)*smooth(.45,.12,sl)*.42,0,1);};
  BIO.grid('endemic-seagrape',24,(x,z)=>inMid(x,z)?q*strandW(x,z)*.62:0,(x,y,z)=>{if(ok(x,z,1.2))seaGrape(x,z,st,lvAt(x,z));},{box,patch:.52,patchScale:.014,pad:1,lod:midR});
  BIO.grid('endemic-beachvine',18,(x,z)=>BIO.lodD(x,z)<=nearR?q*strandW(x,z)*.68:0,(x,y,z)=>{if(ok(x,z,.6))coquinaVine(x,z,st,lvAt(x,z));},{box,patch:.48,patchScale:.018,pad:.5,lod:nearR});
  BIO.grid('endemic-crinum',20,(x,z)=>{if(!inMid(x,z))return 0;const Z=zones(x,z);return q*clamp(strandW(x,z)*.52+Z.flow*.38*(Z.h>.3?1:0),0,1);},
   (x,y,z)=>{if(ok(x,z,.7))sprayCrinum(x,z,st,lvAt(x,z));},{box,patch:.5,patchScale:.016,pad:.6,lod:midR});
  /* 4-5: gin-clear carbonate-shelf karst springs & river riffles */
  BIO.grid('endemic-karstarum',14,(x,z)=>{if(!inMid(x,z))return 0;const Z=zones(x,z);return Z.h>.15&&slopeAt(x,z)<.7?q*clamp(Z.flow*.82,0,1):0;},
   (x,y,z)=>{if(ok(x,z,.6))karstArum(x,z,st,lvAt(x,z));},{box,patch:.3,patchScale:.025,pad:.5,lod:midR});
  BIO.grid('endemic-springstrap',7.5,(x,z)=>{if(BIO.lodD(x,z)>nearR)return 0;const Z=zones(x,z);return Z.h>.05&&slopeAt(x,z)<.8?q*clamp(Z.flow*.9+smooth(.68,.84,Z.wet)*(1-Z.hyper)*.75,0,1):0;},
   (x,y,z)=>{if(ok(x,z,.3))springStrap(x,z,st,lvAt(x,z));},{box,patch:0,pad:.25,lod:nearR});
  /* 6-9: bay hyperjungle, damp shaded cove rock & rainforest glades */
  BIO.grid('endemic-dripcap',24,(x,z)=>{if(BIO.lodD(x,z)>nearR)return 0;const Z=zones(x,z),sl=slopeAt(x,z);if(Z.h<.5||sl>.85)return 0;
    return q*clamp((Z.hyper*.48+Z.rain*.42)*(smooth(.12,.45,sl)*.7+.3),0,1);},
   (x,y,z)=>{if(ok(x,z,.8))dripCapFloor(x,z,st);},{box,patch:.55,patchScale:.016,pad:.7,lod:nearR});
  BIO.grid('endemic-bromeliad',19,(x,z)=>{if(!inMid(x,z))return 0;const Z=zones(x,z);return Z.h>.5&&slopeAt(x,z)<.68?q*clamp(Z.hyper*.62+Z.rain*.46,0,1):0;},
   (x,y,z)=>{if(ok(x,z,.6))tankBromeliad(x,z,st,lvAt(x,z));},{box,patch:.5,patchScale:.015,pad:.5,lod:midR});
  BIO.grid('endemic-orchid',19,(x,z)=>{if(BIO.lodD(x,z)>nearR)return 0;const Z=zones(x,z);return Z.h>.5&&slopeAt(x,z)<.72?q*clamp(Z.hyper*.44+Z.rain*.55,0,1):0;},
   (x,y,z)=>{if(ok(x,z,.5))prismOrchid(x,z,st,lvAt(x,z));},{box,patch:.52,patchScale:.018,pad:.5,lod:nearR});
  BIO.grid('endemic-ginger',21,(x,z)=>{if(!inMid(x,z))return 0;const Z=zones(x,z);return Z.h>.4&&slopeAt(x,z)<.62?q*clamp(Z.hyper*.42+Z.rain*.48+Z.flow*.4,0,1):0;},
   (x,y,z)=>{if(ok(x,z,.8))torchGinger(x,z,st,lvAt(x,z));},{box,patch:.54,patchScale:.014,pad:.7,lod:midR});
  /* 10: parasol savannah & dry coastal upland crown */
  BIO.grid('endemic-savaloe',22,(x,z)=>{if(!inMid(x,z))return 0;const Z=zones(x,z),sl=slopeAt(x,z);if(Z.h<1||sl>.6)return 0;
    return q*clamp(Z.sav*.58+smooth(.25,.34,Z.up)*smooth(.48,.34,Z.wet)*.52,0,1);},
   (x,y,z)=>{if(ok(x,z,.7))savAloe(x,z,st,lvAt(x,z));},{box,patch:.54,patchScale:.013,pad:.6,lod:midR});
  /* 11-12: Almua contact-marble quarry treads, epidote-magnetite skarn seams & rocky coastal bluffs */
  const skarnW=(x,z)=>{const Z=zones(x,z);if(Z.h<.5)return 0;const sl=slopeAt(x,z);
   return clamp(smooth(.16,.48,sl)*smooth(.94,.62,sl)*(Z.up>.14?.68:.35)+Z.shore*.24,0,1);};
  BIO.grid('endemic-caper',18,(x,z)=>inMid(x,z)?q*skarnW(x,z)*.62:0,(x,y,z)=>{if(ok(x,z,.6))epidoteCaper(x,z,st,lvAt(x,z));},{box,patch:.46,patchScale:.018,pad:.5,cliff:true,lod:midR});
  BIO.grid('endemic-samphire',16,(x,z)=>BIO.lodD(x,z)<=nearR?q*skarnW(x,z)*.68:0,(x,y,z)=>{if(ok(x,z,.4))chalcoSamphire(x,z,st,lvAt(x,z));},{box,patch:.44,patchScale:.022,pad:.4,cliff:true,lod:nearR});
  return st;};

 /* PLAN-FLORA.md item 27: drip-cap shelf-fungoids weeping from the Girder tower & stone jetty masonry */
 function wallShells(geos){if(!geos.some(g=>g&&g.geos))return geos;
  return geos.filter(g=>(g&&g.geos?g.geos:[g]).some(q=>{const p=q.attributes.position,ix=q.index?q.index.array:null,n=ix?ix.length:p.count;
   for(let i=0;i<n;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;
    const ux=p.getX(b)-p.getX(a),uy=p.getY(b)-p.getY(a),uz=p.getZ(b)-p.getZ(a),vx=p.getX(c)-p.getX(a),vy=p.getY(c)-p.getY(a),vz=p.getZ(c)-p.getZ(a);
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz);if(l>1e-9&&Math.abs(ny/l)<.35)return true;}
   return false;}));}
 SWBAY.dressEndemics=function(geos,opt){if(!geos||!geos.length||typeof BIO.sideFaces!=='function')return;
  const wg=wallShells(geos);if(!wg.length)return;
  reseed(720539+((opt&&opt.seed)||0));
  const r0=BIO.range;BIO.range=(opt&&opt.range)||SWBAY.LOD.dress;
  const want=opt&&opt.walls&&opt.walls.n?Math.max(10,Math.round(opt.walls.n*.1)):20;
  BIO.sideFaces(wg,want).forEach(f=>{if(f&&f.p&&f.n)dripCapAt(f.p[0]+f.n[0]*.04,f.p[1]+f.n[1]*.04,f.p[2]+f.n[2]*.04,f.n,.75,null);});
  BIO.range=r0;};

 /* Own-page post-bake alignment (runs only from swbay's own host 88-host-build.js; zero effect on external vendors):
    1. Gives unmapped linear vertex-colored bio meshes (far, fauna, termites) a neutral 2x2 white CanvasTexture so BIO.sootItems
       does not misread pre-linearized vertex colors as sRGB soot.
    2. Snaps stem-held twig clumps (settled at .2*size+.3 in 2026-11-08) onto their nearest same-tier branch surface within .08 m. */
 function closestTri(x,y,z,a,b,c,out){
  const abx=b.x-a.x,aby=b.y-a.y,abz=b.z-a.z,acx=c.x-a.x,acy=c.y-a.y,acz=c.z-a.z,apx=x-a.x,apy=y-a.y,apz=z-a.z;
  const d1=abx*apx+aby*apy+abz*apz,d2=acx*apx+acy*apy+acz*apz;if(d1<=0&&d2<=0){out[0]=a.x;out[1]=a.y;out[2]=a.z;return Math.hypot(apx,apy,apz);}
  const bpx=x-b.x,bpy=y-b.y,bpz=z-b.z,d3=abx*bpx+aby*bpy+abz*bpz,d4=acx*bpx+acy*bpy+acz*bpz;if(d3>=0&&d4<=d3){out[0]=b.x;out[1]=b.y;out[2]=b.z;return Math.hypot(bpx,bpy,bpz);}
  const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0){const v=d1/((d1-d3)||1e-12);out[0]=a.x+abx*v;out[1]=a.y+aby*v;out[2]=a.z+abz*v;return Math.hypot(x-out[0],y-out[1],z-out[2]);}
  const cpx=x-c.x,cpy=y-c.y,cpz=z-c.z,d5=abx*cpx+aby*cpy+abz*cpz,d6=acx*cpx+acy*bpy*0+acy*cpy+acz*cpz;if(d6>=0&&d5<=d6){out[0]=c.x;out[1]=c.y;out[2]=c.z;return Math.hypot(cpx,cpy,cpz);}
  const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0){const w=d2/((d2-d6)||1e-12);out[0]=a.x+acx*w;out[1]=a.y+acy*w;out[2]=a.z+acz*w;return Math.hypot(x-out[0],y-out[1],z-out[2]);}
  const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0){const w=(d4-d3)/(((d4-d3)+(d5-d6))||1e-12);out[0]=b.x+(c.x-b.x)*w;out[1]=b.y+(c.y-b.y)*w;out[2]=b.z+(c.z-b.z)*w;return Math.hypot(x-out[0],y-out[1],z-out[2]);}
  const dn=1/((va+vb+vc)||1e-12),v=vb*dn,w=vc*dn;out[0]=a.x+abx*v+acx*w;out[1]=a.y+aby*v+acy*w;out[2]=a.z+abz*v+acz*w;return Math.hypot(x-out[0],y-out[1],z-out[2]);}
 SWBAY.postBakeOwn=function(scene,ground){if(!scene||typeof KSPACE==='undefined')return;
  const wTex=BIO.canvasTex(2,2,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);});
  scene.traverse(m=>{const mt=m.material;if(mt&&!Array.isArray(mt)&&mt.userData&&mt.userData.bio&&mt.vertexColors&&!mt.map&&!mt.emissiveMap){mt.map=wTex;mt.needsUpdate=true;}});
  if(!ground)return;
  const gFn=BIO.drawnGround?BIO.drawnGround(ground):ground,LE=new Map();for(const e of BIO.lodMeshes)LE.set(e.mesh,e);
  const lodMr=(m,i,vert)=>{const e=LE.get(m);return e?e.minRange||0:0;};
  const kindOf=m=>{const u=m.material&&m.material.userData;return u&&u.bio&&u.bio.kind;};
  const defOf=m=>{const R=BIO.kits[m.userData.kit||''];return R&&R.defs[(m.name||'').replace(/^biome:/,'')];};
  const fol=[],str=[];
  scene.traverse(m=>{if(!m.isMesh)return;const u=m.userData||{};if(u.probeSkip)return;const k=kindOf(m);
   if(u.biome&&m.isInstancedMesh&&(k==='leaf'||k==='hang')){const df=defOf(m),lc=df&&df.mat&&df.mat.userData&&df.mat.userData.libCard;
    if(df&&df.fit&&lc&&lc.stems&&df.raw&&df.raw.userData.card&&df.raw.userData.card.kind==='clump')fol.push(m);}
   else if(k!=='far'&&k!=='impostor')str.push(m);});
  if(!fol.length)return;
  const M4=new T3.Matrix4(),P=new T3.Vector3(),Q=new T3.Quaternion(),S3=new T3.Vector3(),A=new T3.Vector3(),B=new T3.Vector3(),C=new T3.Vector3(),qOut=[0,0,0];
  const CELL=8,cf=v=>Math.floor(v/CELL),key=(a,b)=>a*1048576+b,want=new Set(),wl=[],smp=[],REACH=5.5;
  let wa0=1/0,wa1=-1/0,wb0=1/0,wb1=-1/0;
  const wantAdd=(a,b)=>{const k=key(a,b);if(want.has(k))return;want.add(k);wl.push(a,b);if(a<wa0)wa0=a;if(a>wa1)wa1=a;if(b<wb0)wb0=b;if(b>wb1)wb1=b;};
  for(const m of fol){const mr=lodMr(m,0,false),arr=m.instanceMatrix.array;
   for(let i=0;i<m.count;i++){const o=i*16,x=arr[o+12],y=arr[o+13],z=arr[o+14];
    const sx=Math.hypot(arr[o],arr[o+1],arr[o+2]),sy=Math.hypot(arr[o+4],arr[o+5],arr[o+6]),sz=Math.hypot(arr[o+8],arr[o+9],arr[o+10]),s=Math.max(sx,sy,sz),up=y-gFn(x,z);
    if(!(up>=2)||up<=.75*s+.5)continue;
    const p={x,y,z,m,i,mr,d:1e9,qx:x,qy:y,qz:z};smp.push(p);
    const r=Math.ceil(REACH/CELL),cx=cf(x),cz=cf(z);for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)wantAdd(cx+a,cz+b);}}
  if(!smp.length)return;
  const wantIn=(a0,a1,b0,b1)=>{if(a1<wa0||a0>wa1||b1<wb0||b0>wb1)return false;if(a0<wa0)a0=wa0;if(a1>wa1)a1=wa1;if(b0<wb0)b0=wb0;if(b1>wb1)b1=wb1;
   if((a1-a0+1)*(b1-b0+1)>wl.length/2){for(let i=0;i<wl.length;i+=2){const a=wl[i],b=wl[i+1];if(a>=a0&&a<=a1&&b>=b0&&b<=b1)return true;}return false;}
   for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)if(want.has(key(a,b)))return true;return false;};
  const SP=KSPACE.create({cell:CELL}),near=[];
  for(const p of smp)SP.insert(p,p.x,p.z,REACH);
  for(const m of str){const geo=m.geometry,pa=geo&&geo.attributes&&geo.attributes.position;if(!pa)continue;m.updateMatrixWorld();const mr=lodMr(m,0,false);
   if(m.isInstancedMesh){if(!geo.boundingBox)geo.computeBoundingBox();const bb=geo.boundingBox,cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2,r0=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2;
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M4);M4.premultiply(m.matrixWorld);A.set(cx,bb.min.y,cz).applyMatrix4(M4);B.set(cx,bb.max.y,cz).applyMatrix4(M4);
     M4.decompose(P,Q,S3);const r=r0*Math.max(Math.abs(S3.x),Math.abs(S3.z));
     if(r<CELL/4&&!want.has(key(cf(A.x),cf(A.z)))&&!want.has(key(cf(B.x),cf(B.z)))&&A.distanceTo(B)<CELL)continue;
     const hx=(B.x-A.x)/2,hz=(B.z-A.z)/2;SP.query(A.x+hx,A.z+hz,Math.hypot(hx,hz)+r,near);
     const dx=B.x-A.x,dy=B.y-A.y,dz=B.z-A.z,L2=dx*dx+dy*dy+dz*dz;
     for(const p of near){if(p.mr!==mr)continue;let t=L2>0?((p.x-A.x)*dx+(p.y-A.y)*dy+(p.z-A.z)*dz)/L2:0;t=t<0?0:t>1?1:t;
      const sx=A.x+dx*t,sy=A.y+dy*t,sz=A.z+dz*t,ux=p.x-sx,uy=p.y-sy,uz=p.z-sz,ll=Math.hypot(ux,uy,uz),d=ll-r;
      if(d<p.d){p.d=d;const k=ll>1e-6?r/ll:0;p.qx=sx+ux*k;p.qy=sy+uy*k;p.qz=sz+uz*k;}}}}
   else{const W=m.matrixWorld,id=W.equals(new T3.Matrix4()),ix=geo.index,nt=Math.floor((ix?ix.count:pa.count)/3),Vt=[A,B,C],vi=[0,0,0];
    for(let t=0;t<nt;t++){for(let k=0;k<3;k++){vi[k]=ix?ix.getX(t*3+k):t*3+k;Vt[k].fromBufferAttribute(pa,vi[k]);if(!id)Vt[k].applyMatrix4(W);}
     const x0=Math.min(A.x,B.x,C.x),x1=Math.max(A.x,B.x,C.x),z0=Math.min(A.z,B.z,C.z),z1=Math.max(A.z,B.z,C.z);
     if(!wantIn(cf(x0),cf(x1),cf(z0),cf(z1)))continue;SP.query((x0+x1)/2,(z0+z1)/2,Math.max(x1-x0,z1-z0)/2,near);if(!near.length)continue;
     for(const p of near){if(p.mr!==mr)continue;const d=closestTri(p.x,p.y,p.z,A,B,C,qOut);if(d<p.d){p.d=d;p.qx=qOut[0];p.qy=qOut[1];p.qz=qOut[2];}}}}}
  const dirty=new Set();
  for(const p of smp){if(p.d>.12&&p.d<REACH){const ux=p.x-p.qx,uy=p.y-p.qy,uz=p.z-p.qz,ll=Math.hypot(ux,uy,uz)||1,arr=p.m.instanceMatrix.array,o=p.i*16;
   arr[o+12]=p.qx+ux*(.06/ll);arr[o+13]=p.qy+uy*(.06/ll);arr[o+14]=p.qz+uz*(.06/ll);dirty.add(p.m);}}
  dirty.forEach(m=>{m.instanceMatrix.needsUpdate=true;});};

 const _build=SWBAY.build;
 SWBAY.build=function(opt){const out=_build(opt);
  if(SWBAY.buildEndemics){BIO.cur='bay/floor';out.endemics=SWBAY.buildEndemics(out.R,out.quality);BIO.cur=null;}
  return out;};
 const _dress=SWBAY.dress;
 SWBAY.dress=function(geos,opt){_dress(geos,opt);
  if(SWBAY.dressEndemics){BIO.cur='bay/dress';SWBAY.dressEndemics(geos,opt||{});BIO.cur=null;}};
})();
