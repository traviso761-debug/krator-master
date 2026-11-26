// ================================================================= RHEOLITH — deterministic placement (PLAN.md sections 4, 5, 7)
// Places the four living subsurface guilds strictly inside RHEO_PHYS.windowAt({tempC, waterActivity, acidPh}).viable === true
// (180-550 degC, aw < 0.15, pH <= 3.8: the breached throat's inner walls and hot satellite fumarole mouths), and places the
// eight dead/dormant surface byproducts across the graben driven by RHEO_PHYS.byproductAt(...).
// Every random draw uses KRAND.cell or KRAND.hash; dynamic steam-fluttering throat-skins use BIO.dynamic.
(function(){
 const {TAU,clamp,smooth,qEuler,qUp}=BIO.fn;
 const C=RHEO.C,PAL=RHEO.PAL;
 const pickCol=(arr,u)=>C(arr[Math.min(arr.length-1,Math.floor(u*arr.length))]);

 RHEO.PLACED=[];

 RHEO.place=function(R,q,o){
  o=o||{};q=q==null?1:q;
  const gH=o.ground||BIO.host.terrainH,wH=BIO.host.waterH,seed=5180;
  const temp3=o.temp3||((x,y,z)=>26);
  const awAt=o.aw||((x,y,z)=>0.5);
  const phAt=o.ph||((x,z)=>5.5);
  const pit=o.pit||{x:0,z:0,r:26,throatR:7.4,floor:-21,rim:3.6};
  const vents=o.vents||[];
  const bench=o.bench||{x:76,z:-22,rx:44,rz:32};
  const wind=o.wind||[0.82,0.57];
  const wLen=Math.hypot(wind[0],wind[1])||1,wx=wind[0]/wLen,wz=wind[1]/wLen;

  RHEO.PLACED.length=0;
  const counts={
   chokecoral:0,wirevein:0,foamreef:0,fluxcreeper:0,
   staregg:0,throatcollar:0,bismuthnest:0,scarplug:0,
   bellblister:0,combplate:0,throatskin:0,etchhalo:0
  };
  const H=(i,k,s)=>KRAND.unit(KRAND.hash(seed,i,k,s==null?1:s));
  const rec=(kind,pos,live,tC,aw,ph)=>{
   RHEO.PLACED.push([kind,pos[0],pos[1],pos[2],live?1:0,+tC.toFixed(1),+aw.toFixed(3),+ph.toFixed(2)]);
   counts[kind]=(counts[kind]==null?0:counts[kind])+1;
  };
  const slopeN=o.normal||((x,z,span)=>{
   const e=span==null?.45:span,hx=gH(x+e,z)-gH(x-e,z),hz=gH(x,z+e)-gH(x,z-e);
   const nx=-hx,ny=2*e,nz=-hz,L=Math.hypot(nx,ny,nz)||1;
   return[nx/L,ny/L,nz/L];
  });
  const blendUp=(n,upW)=>{
   const wx=n[0]*(1-upW),wy=n[1]*(1-upW)+upW,wz=n[2]*(1-upW),L=Math.hypot(wx,wy,wz)||1;
   return[wx/L,wy/L,wz/L];
  };
  // Seats a footprint of radius rFoot onto curved rock along -nUse so convex rims never leave overhanging edges
  const seatPos=(x,z,rFoot,nrm,nUse,baseSink,maxSink)=>{
   const y0=gH(x,z),ux=nUse[0],uy=nUse[1],uz=nUse[2];
   let t1x=-uz,t1y=0,t1z=ux,tL=Math.hypot(t1x,t1z);
   if(tL<1e-3){t1x=1;t1y=0;t1z=0;}else{t1x/=tL;t1z/=tL;}
   const t2x=uy*t1z-uz*t1y,t2y=uz*t1x-ux*t1z,t2z=ux*t1y-uy*t1x;
   const denom=Math.max(.35,ux*nrm[0]+uy*nrm[1]+uz*nrm[2]);
   let need=0;
   if(rFoot>0){
    for(let k=0;k<6;k++){
     const th=k*1.04719755,c=Math.cos(th)*rFoot,s=Math.sin(th)*rFoot;
     const qx=x+c*t1x+s*t2x,qy=y0+c*t1y+s*t2y,qz=z+c*t1z+s*t2z;
     const gap=(qy-gH(qx,qz))*nrm[1]/denom;
     if(gap>need)need=gap;
    }
   }
   const sink=clamp((baseSink||0)+need,0,maxSink==null?.30:maxSink);
   return[x-ux*sink,y0-uy*sink,z-uz*sink];
  };

  // ================================================================ 1. LIVE SUBSURFACE GUILDS (strictly inside windowAt.viable)
  // 1a. Breached Throat inner shaft walls (r = 5.4..11.2 m, y = -18.8..-5.2 m, 210-490 degC, aw < 0.10)
  const nWall=Math.max(28,Math.round(96*q));
  for(let i=0;i<nWall;i++){
   const ang=H(i,1,11)*TAU,rr=pit.throatR*(.74+.76*H(i,2,11));
   const x=pit.x+Math.cos(ang)*rr,z=pit.z+Math.sin(ang)*rr,y=gH(x,z);
   if(y>-5.0||y<-19.0)continue;
   const tC=temp3(x,y,z),aw=awAt(x,y,z),ph=phAt(x,z);
   const win=RHEO_PHYS.windowAt({tempC:tC,waterActivity:aw,acidPh:ph});
   if(!win.viable)continue;
   const nrm=slopeN(x,z,.42),inAng=Math.atan2(pit.x-x,pit.z-z);
   const roll=H(i,3,11);
   if(roll<.38&&tC>=230&&tC<=470){
    const s=(.75+.75*H(i,4,11))*(.7+.4*win.k),nUse=blendUp(nrm,.24);
    const pos=seatPos(x,z,.24*s,nrm,nUse,.05,.22);
    BIO.put('rh_chokecoral',pos,qUp(nUse,inAng),[s,s*(.85+.3*H(i,7,11)),s],pickCol(PAL.coral,H(i,8,11)),{root:false});
    rec('chokecoral',pos,1,tC,aw,ph);
   }else if(roll<.68&&tC>=200&&tC<=515){
    const s=.85+.9*H(i,4,11),pos=seatPos(x,z,.14*s,nrm,nrm,.03,.15);
    BIO.put('rh_wirevein',pos,qUp(nrm,ang),[s,s,s],pickCol(PAL.wire,H(i,8,11)),{root:false});
    rec('wirevein',pos,1,tC,aw,ph);
   }else if(roll<.86&&tC>=220&&tC<=455){
    // Foam-Reef clinging to steep hot basalt ledges inside the upper shaft
    const s=.78+.60*H(i,4,11),pos=seatPos(x,z,.42*s,nrm,nrm,.03,.20);
    BIO.put('rh_foamreef',pos,qUp(nrm,H(i,5,11)*TAU),[s,s,s],pickCol(PAL.foam,H(i,8,11)),{root:false});
    rec('foamreef',pos,1,tC,aw,ph);
   }else if(tC>=185&&tC<=385){
    const s=.55+.65*H(i,4,11),pos=seatPos(x,z,.48*s,nrm,nrm,.02,.18);
    BIO.put('rh_fluxcreeper',pos,qUp(nrm,H(i,5,11)*TAU),[s,.85*s,s],pickCol(PAL.creeper,H(i,8,11)),{root:false});
    rec('fluxcreeper',pos,1,tC,aw,ph);
   }
  }

  // 1b. Satellite fumarole deep mouths (r < 2.2 m inside the hot throat depression where T >= 195 degC, aw < 0.12)
  for(let v=1;v<vents.length;v++){
   const V=vents[v],nM=Math.max(6,Math.round(14*q));
   for(let i=0;i<nM;i++){
    const ang=H(i,1,20+v)*TAU,rr=.45+1.45*H(i,2,20+v);
    const x=V.x+Math.cos(ang)*rr,z=V.z+Math.sin(ang)*rr,y=gH(x,z);
    const tC=temp3(x,y,z),aw=awAt(x,y,z),ph=phAt(x,z);
    const win=RHEO_PHYS.windowAt({tempC:tC,waterActivity:aw,acidPh:ph});
    if(!win.viable)continue;
    const nrm=slopeN(x,z,.38);
    if(V.graze>.5&&H(i,3,20+v)<.72){
     const s=.48+.45*H(i,4,20+v),pos=seatPos(x,z,.45*s,nrm,nrm,.02,.16);
     BIO.put('rh_fluxcreeper',pos,qUp(nrm,ang),[s,.82*s,s],pickCol(PAL.creeper,H(i,5,20+v)),{root:false});
     rec('fluxcreeper',pos,1,tC,aw,ph);
    }else if(H(i,3,20+v)<.58){
     const s=.55+.45*H(i,4,20+v),nUse=blendUp(nrm,.26),pos=seatPos(x,z,.22*s,nrm,nUse,.04,.18);
     BIO.put('rh_chokecoral',pos,qUp(nUse,ang+Math.PI),[s,s,s],pickCol(PAL.coral,H(i,5,20+v)),{root:false});
     rec('chokecoral',pos,1,tC,aw,ph);
    }else{
     const s=.6+.5*H(i,4,20+v),pos=seatPos(x,z,.12*s,nrm,nrm,.03,.14);
     BIO.put('rh_wirevein',pos,qUp(nrm,ang),[s,s,s],pickCol(PAL.wire,H(i,5,20+v)),{root:false});
     rec('wirevein',pos,1,tC,aw,ph);
    }
   }
  }

  // ================================================================ 2. EIGHT SURFACE BYPRODUCTS (dead/vitrified/dormant on the surface)
  // 2a. Throat-Collars seated along all 5 vent rim crests (raised sinter lip around the breached skylight & satellite hornitos)
  for(let v=0;v<vents.length;v++){
   const V=vents[v],isMain=v===0,rRing=isMain?pit.r*.98:(v===3?4.0:3.15),nC=isMain?14:7;
   for(let i=0;i<nC;i++){
    const a=i/nC*TAU+.16*H(i,1,30+v),rr=rRing*(.95+.12*H(i,2,30+v));
    const x=V.x+Math.cos(a)*rr,z=V.z+Math.sin(a)*rr,y=gH(x,z);
    if(wH(x,z)>y-.1)continue;
    const s=isMain?1.15+.52*H(i,3,30+v):.68+.32*H(i,3,30+v);
    const nrm=slopeN(x,z,.55),nUse=blendUp(nrm,.20),pos=seatPos(x,z,.56*s,nrm,nUse,.05,.34);
    BIO.put('rh_collar',pos,qUp(nUse,a),[s,s*(.8+.42*H(i,6,30+v)),s],pickCol(PAL.collar,H(i,7,30+v)),{root:false});
    rec('throatcollar',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
   }
  }

  // 2b. Shed Throat-Skins: dynamic fluttering amber skins in the hot steam halo (110-240 degC) + static brittle grey shards downslope
  const liveSkins=[];
  for(let v=0;v<vents.length;v++){
   const V=vents[v],isMain=v===0,r0=isMain?pit.r*.94:3.2,r1=isMain?pit.r*1.28:8.5,nS=Math.max(8,Math.round((isMain?26:14)*q));
   for(let i=0;i<nS;i++){
    const a=H(i,1,40+v)*TAU,d=r0+(r1-r0)*H(i,2,40+v);
    const x=V.x+Math.cos(a)*d,z=V.z+Math.sin(a)*d,y=gH(x,z);
    if(wH(x,z)>y-.1)continue;
    const tSurf=Math.max(temp3(x,y,z),V.T*smooth(r1*1.15,r0*.85,d));
    const s=.55+.62*H(i,3,40+v),nrm=slopeN(x,z,.45);
    if(tSurf>=110&&liveSkins.length<64){
     const pos=seatPos(x,z,.16*s,nrm,nrm,.03,.14);
     liveSkins.push({pos,baseQ:qUp(nrm,a+Math.PI*.5).clone(),s,phase:H(i,4,40+v)*TAU,col:pickCol(PAL.skinLive,H(i,5,40+v))});
     rec('throatskin',pos,0,tSurf,awAt(x,y,z),phAt(x,z));
    }else{
     // cool hydrolysed mica-like shard lying flush along the local scree slope
     const pos=seatPos(x,z,.26*s,nrm,nrm,.02,.15);
     const qShard=qUp(nrm,a).clone().multiply(qEuler(1.04+.08*H(i,4,40+v),0,(H(i,5,40+v)-.5)*.22));
     BIO.put('rh_throatskin',pos,qShard,[s*.85,s*.75,s*.85],pickCol(PAL.skinShard,H(i,6,40+v)),{root:false});
     rec('throatskin',pos,0,tSurf,awAt(x,y,z),phAt(x,z));
    }
   }
  }
  if(liveSkins.length){
   const skinGeo=RHEO.GEO.throatskin;
   const dyn=BIO.dynamic('rh_throatskin_flutter',skinGeo,RHEO.M.skin,liveSkins.length,{
    label:'Shed Throat-Skin (supple in >110 degC steam)',
    motion:{hz:12,loop:4,fade:[90,220]}
   });
   const T3=BIO.host.THREE,m4=new T3.Matrix4(),p3=new T3.Vector3(),sc3=new T3.Vector3(),qRun=new T3.Quaternion();
   const poseSkins=t=>{
    const surge=typeof window!=='undefined'&&window._throatState?window._throatState.heightScale:1;
    for(let i=0;i<liveSkins.length;i++){
     const sk=liveSkins[i],fl=(.14+.1*Math.min(2,surge))*Math.sin(t*3.14159+sk.phase);
     p3.set(sk.pos[0],sk.pos[1],sk.pos[2]);
     sc3.set(sk.s,sk.s,sk.s);
     qRun.copy(sk.baseQ).multiply(qEuler(.16+fl,0,fl*.55));
     m4.compose(p3,qRun,sc3);
     dyn.setMatrixAt(i,m4);
     if(t===0)dyn.setColorAt(i,sk.col);
    }
    dyn.instanceMatrix.needsUpdate=true;
    if(t===0&&dyn.instanceColor)dyn.instanceColor.needsUpdate=true;
   };
   poseSkins(0);
   BIO.tick(()=>{poseSkins(BIO.WIND?BIO.WIND.t:0);});
  }

  // 2c. Etch-Halo (white SiF4 silica frost + blood-red selenium rime) round grazed vents (especially west-rot)
  for(let v=0;v<vents.length;v++){
   const V=vents[v],flux=V.graze==null?0.15:V.graze;
   if(flux<.14)continue;
   const nF=Math.max(6,Math.round((10+28*flux)*q)),r0=v===0?pit.r*.95:3.1,r1=v===0?pit.r*1.32:12.5;
   for(let i=0;i<nF;i++){
    const a=H(i,1,50+v)*TAU,d=r0+(r1-r0)*H(i,2,50+v);
    const x=V.x+Math.cos(a)*d,z=V.z+Math.sin(a)*d,y=gH(x,z);
    if(wH(x,z)>y-.08)continue;
    const bp=RHEO_PHYS.byproductAt({distM:v===0?d-pit.r*.85:d,tempC:temp3(x,y,z),recentFlux:Math.max(flux,.35)});
    if(bp.etchhalo<.05)continue;
    const nrm=slopeN(x,z,.5),s=(.55+.85*H(i,3,50+v))*(.6+.6*bp.etchhalo);
    const pos=seatPos(x,z,.50*s,nrm,nrm,.02,.18);
    const isSel=H(i,4,50+v)<.32;
    BIO.put(isSel?'rh_selrime':'rh_etchfrost',pos,qUp(nrm,a),[s,.82*s,s],pickCol(isSel?PAL.selRime:PAL.frost,H(i,5,50+v)),{root:false});
    rec('etchhalo',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
   }
  }

  // 2d. Bismuth Hair-Nests around hot fumarole seams (especially south-fissure and breached pit rim ledges)
  for(let v=0;v<vents.length;v++){
   const V=vents[v],nB=Math.max(5,Math.round((v===3?18:9)*q)),r0=v===0?pit.throatR*1.64:3.0,r1=v===0?pit.r*.98:7.8;
   for(let i=0;i<nB;i++){
    const a=H(i,1,60+v)*TAU,d=r0+(r1-r0)*H(i,2,60+v);
    const x=V.x+Math.cos(a)*d,z=V.z+Math.sin(a)*d,y=gH(x,z);
    if(wH(x,z)>y-.1)continue;
    const nrm=slopeN(x,z,.45),s=.55+.65*H(i,3,60+v),pos=seatPos(x,z,.14*s,nrm,nrm,.03,.14);
    BIO.put('rh_bismuthwire',pos,qUp(nrm,a),[s,s,s],pickCol(PAL.wire,H(i,4,60+v)),{root:false});
    rec('bismuthnest',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
   }
  }

  // 2e. Glassy Scar-Plugs along the graben fault fissure trace and fumarole radial cracks
  const nScar=Math.max(18,Math.round(38*q));
  for(let i=0;i<nScar;i++){
   const along=(H(i,1,71)*2-1)*98,off=(H(i,2,71)*2-1)*5.5;
   const cs=Math.cos(0.34),sn=Math.sin(0.34);
   const x=6+off*cs+along*sn,z=10-off*sn+along*cs;
   if(Math.hypot(x-pit.x,z-pit.z)<pit.r*1.02)continue;
   const y=gH(x,z);if(wH(x,z)>y-.1)continue;
   const nrm=slopeN(x,z,.55),s=.65+.75*H(i,3,71),pos=seatPos(x,z,.62*s,nrm,nrm,.03,.20);
   BIO.put('rh_scarplug',pos,qUp(nrm,0.34+(H(i,4,71)-.5)*.35),[s,s,s],pickCol(PAL.scar,H(i,5,71)),{root:false});
   rec('scarplug',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
  }

  // 2f. Ringing Lava Blisters & shed Comb-Plates on the pahoehoe sill bench
  const nBl=Math.max(16,Math.round(34*q));
  for(let i=0;i<nBl;i++){
   const a=H(i,1,81)*TAU,rr=Math.sqrt(H(i,2,81))*.92;
   const x=bench.x+Math.cos(a)*bench.rx*rr,z=bench.z+Math.sin(a)*bench.rz*rr,y=gH(x,z);
   if(wH(x,z)>y-.1)continue;
   const bp=RHEO_PHYS.byproductAt({distM:40,tempC:temp3(x,y,z),crust:1,recentFlux:.22});
   if(bp.bellblister<.1)continue;
   const s=1.05+1.35*H(i,3,81),nrm=slopeN(x,z,.7),nUse=blendUp(nrm,.18);
   const pos=seatPos(x,z,.92*s,nrm,nUse,.04,.24);
   BIO.put('rh_blister',pos,qUp(nUse,a),[s,s*(.55+.35*H(i,6,81)),s],pickCol(PAL.blister,H(i,7,81)),{root:false});
   rec('bellblister',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
  }
  const nComb=Math.max(16,Math.round(36*q));
  for(let i=0;i<nComb;i++){
   const a=H(i,1,82)*TAU,rr=.68+.38*H(i,2,82);
   const x=bench.x+Math.cos(a)*bench.rx*rr,z=bench.z+Math.sin(a)*bench.rz*rr,y=gH(x,z);
   if(wH(x,z)>y-.1)continue;
   const nrm=slopeN(x,z,.45),s=.75+.75*H(i,3,82),pos=seatPos(x,z,.32*s,nrm,nrm,.02,.16);
   BIO.put('rh_combplate',pos,qUp(nrm,H(i,4,82)*TAU),[s,s,s],pickCol(PAL.foam,H(i,5,82)),{root:false});
   rec('combplate',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
  }

  // 2g. Split Star-Eggs across the downwind ballistic apron (28-171 m from the breached throat, concentrated SE along wind)
  const nEgg=Math.max(20,Math.round(44*q));
  for(let i=0;i<nEgg;i++){
   const spread=(H(i,1,91)*2-1)*1.35,baseAng=Math.atan2(wz,wx)+spread;
   const dist=28+143*Math.pow(H(i,2,91),.75);
   const x=pit.x+Math.cos(baseAng)*dist,z=pit.z+Math.sin(baseAng)*dist;
   if(Math.hypot(x,z)>R)continue;
   if(vents.some((V,vi)=>vi>0&&Math.hypot(x-V.x,z-V.z)<9.5))continue;
   const y=gH(x,z);if(wH(x,z)>y-.12)continue;
   const nrm=slopeN(x,z,.45);if(nrm[1]<.86)continue;
   const dx=(x-pit.x)/dist,dz=(z-pit.z)/dist,wDot=dx*wx+dz*wz;
   const bp=RHEO_PHYS.byproductAt({distM:dist,tempC:temp3(x,y,z),windDot:wDot});
   if(bp.staregg<.12)continue;
   const s=.42+.46*H(i,3,91),yaw=H(i,4,91)*TAU,nUse=blendUp(nrm,.18);
   const pos=seatPos(x,z,.44*s,nrm,nUse,.04,.20);
   const qRot=qUp(nUse,yaw).clone().multiply(qEuler((H(i,5,91)-.5)*.14,0,(H(i,6,91)-.5)*.14));
   BIO.put('rh_staregg_shell',pos,qRot,[s,s,s],pickCol(PAL.eggShell,H(i,7,91)),{root:false});
   BIO.put('rh_staregg_core',pos,qRot,[s,s,s],pickCol(PAL.eggCore,H(i,8,91)),{root:false});
   rec('staregg',pos,0,temp3(x,y,z),awAt(x,y,z),phAt(x,z));
  }

  return counts;
 };
})();
