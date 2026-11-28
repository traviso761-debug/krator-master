// ================================================================= COMPASS HILLS — multipolar crustal remanence & magnetotropism ([G data])
// Pure functions on plain records: zero THREE, zero DOM, zero Math.random, zero sin-hash. Seeded draws from core/rand (KRAND).
// Runs identically in Node (tests/test-compasshills.js), on all 4 station pages, in 1:1 openworld/, and in Godot 4.7.2.
//
//   COMPASS_PHYS.fieldAt(x, z, site)         -> {bx, by, bz, bMagMt, bHorizMt, azimuthRad, dipRad, gradB2, inversionSeam01}
//   COMPASS_PHYS.leafAzimuthAt(x, z, s, u)   -> {bladeYawRad, alignment01, noonShadeGain01, bHorizMt, bMagMt}
//   COMPASS_PHYS.sandStreamAt(...)           -> {rippleYawRad, streakContrast01, ferroTuftMm}
//   COMPASS_PHYS.ferrousPullAt(...)          -> {forceN, wrenchTool, pinClimber, safeBronze}
//   COMPASS_PHYS.lightningScoreAt(c)         -> {strikeProb01, fulgurite01, irmpole01}
//   COMPASS_PHYS.cuestaAspectAt(c)           -> {moisture01, koppenLocal, pAtm, effTempC, zoneKey}
//   COMPASS_PHYS.CROPS_BIOME                 -> kits/crops registration for CROPS.BIOMES.compasshills
//   COMPASS_PHYS.FAUNA                       -> 6 Compass Hills fauna records with continuous 0..24h schedules
(function(root){
 'use strict';

 var TAU=Math.PI*2;
 var G_KRATOR=7.4;
 var RHO_MAGNETITE=5175;
 var RHO_IRON=7870;
 var MSAT_IRON=1.65e6;

 function cl(x,a,b){return x<a?a:x>b?b:x;}
 function dflt(v,d){return v==null?d:v;}
 function ss(a,b,x){
  var t=(x-a)/(b-a);
  t=t<0?0:t>1?1:t;
  return t*t*(3-2*t);
 }
 function wrapPi(a){
  while(a>Math.PI)a-=TAU;
  while(a<-Math.PI)a+=TAU;
  return a;
 }

 function resolveKey(site){
  if(!site)return 'foundry';
  if(typeof site==='string')return site;
  if(site.key)return site.key;
  if(site.id&&site.domainSeam)return 'cuesta';
  if(site.torSpires)return 'tors';
  if(site.river)return 'gorge';
  return 'foundry';
 }

 // Softened 3D dipole contribution at surface (y = 0) from buried pole at (px, -depthM, pz) with moment (mx, my, mz)
 // Returns [dbx, dby, dbz] in mT; softening core r0 >= 6 m guarantees C^infinity smoothness and zero NaN/singularities
 function addDipole(acc,x,z,px,pz,depthM,r0,mx,my,mz,scaleMt){
  var rx=x-px,ry=depthM,rz=z-pz;
  var r2=rx*rx+ry*ry+rz*rz+r0*r0;
  var r=Math.sqrt(r2);
  var invR=1/r;
  var ux=rx*invR,uy=ry*invR,uz=rz*invR;
  var mDotU=mx*ux+my*uy+mz*uz;
  var fall=(scaleMt*(depthM*depthM+r0*r0)*Math.sqrt(depthM*depthM+r0*r0))/(r2*r);
  acc[0]+=fall*(3*mDotU*ux-mx);
  acc[1]+=fall*(3*mDotU*uy-my);
  acc[2]+=fall*(3*mDotU*uz-mz);
 }

 // Raw vector B(x, z) in mT before finite-difference gradient evaluation
 function rawB(x,z,skey){
  var S=(root.COMPASS_SITES&&root.COMPASS_SITES[skey])||null;
  var acc=[0,0,0];
  var seam01=0;
  var i,v,ang,tx,tz;

  // Seamless 1:1 openworld evaluation when world coordinates (> 50 km) or site === 'world'
  if(skey==='world'||Math.abs(x)>50000||Math.abs(z)>50000){
   var lx=1058*2000,lz=224*2000;
   var dxL=x-lx,dzL=z-lz,dL=Math.hypot(dxL,dzL);
   var halo=Math.exp(-dL/140000);
   var phiL=Math.atan2(dzL,dxL);
   acc[0]+=-Math.sin(phiL)*2.4*halo+0.42;
   acc[1]+=0.65*halo+0.35;
   acc[2]+=Math.cos(phiL)*2.4*halo-0.28;
   if(root.KRAND){
    var cellM=2000,ix=Math.floor(x/cellM),iz=Math.floor(z/cellM);
    for(var jz=-1;jz<=1;jz++){
     for(var jx=-1;jx<=1;jx++){
      var cx=ix+jx,cz=iz+jz;
      var h0=root.KRAND.hash(910220,cx,cz,1);
      var h1=root.KRAND.hash(910220,cx,cz,2);
      var h2=root.KRAND.hash(910220,cx,cz,3);
      var px=(cx+0.18+0.64*root.KRAND.unit(h0))*cellM;
      var pz=(cz+0.18+0.64*root.KRAND.unit(h1))*cellM;
      var yaw=root.KRAND.unit(h2)*TAU;
      addDipole(acc,x,z,px,pz,65,24,Math.cos(yaw),0.35,Math.sin(yaw),14.0*halo+1.8);
     }
    }
   }
   return{bx:acc[0],by:acc[1],bz:acc[2],seam01:0};
  }

  if(skey==='cuesta'){
   // Station 3: Two opposing remanent sandstone-ironstone domains meeting along a 35-40 m domain-wall saddle (z ~ seamZ(x))
   var ds=(S&&S.domainSeam)||{z0:0,halfWidthM:18,northAzRad:-1.18,southAzRad:2.02,lobeMt:4.2};
   var seamZ=ds.z0+14*Math.sin(x*0.0055);
   var dz=z-seamZ;
   // Smooth tanh-like algebraic transition across halfWidthM (~18 m -> full 180 deg flip within 40 m!)
   var sDom=dz/Math.sqrt(dz*dz+ds.halfWidthM*ds.halfWidthM);
   var nWeight=0.5*(1-sDom),sWeight=0.5*(1+sDom);
   var nBx=Math.cos(ds.northAzRad)*ds.lobeMt,nBz=Math.sin(ds.northAzRad)*ds.lobeMt;
   var sBx=Math.cos(ds.southAzRad)*ds.lobeMt,sBz=Math.sin(ds.southAzRad)*ds.lobeMt;
   // Notice nBx + sBx ~ 0 and nBz + sBz ~ 0 at dz = 0 so |B_horiz| drops < 0.03 mT right in the domain-wall core,
   // while vertical remanence By = 0.58 mT keeps total |B| finite in [0.45, 18.5] mT!
   var cancelBx=0.5*(nBx+sBx),cancelBz=0.5*(nBz+sBz);
   var coreMask=Math.exp(-(dz*dz)/(9.5*9.5));
   acc[0]=nWeight*nBx+sWeight*sBx-cancelBx*coreMask*0.96;
   acc[2]=nWeight*nBz+sWeight*sBz-cancelBz*coreMask*0.96;
   acc[1]=0.58+1.15*sDom;
   // Far-edge cuesta caprock dipoles outside |z| > 110 m so distant tors still carry local structure
   addDipole(acc,x,z,-140,-165,28,12,Math.cos(ds.northAzRad),0.4,Math.sin(ds.northAzRad),12.5);
   addDipole(acc,x,z,135,172,28,12,Math.cos(ds.southAzRad),-0.4,Math.sin(ds.southAzRad),13.0);
   var bhC=Math.hypot(acc[0],acc[2]);
   seam01=cl(ss(0.45,0.05,bhC),0,1);
   return{bx:acc[0],by:acc[1],bz:acc[2],seam01:seam01};
  }

  if(skey==='tors'){
   // Station 2: High iron=180 cuesta scarp ambient remanence + 9 lightning-repoled summit magnetite spires
   acc[0]=1.45;acc[1]=-0.85;acc[2]=-1.10;
   var spires=(S&&S.torSpires)||[];
   for(i=0;i<spires.length;i++){
    v=spires[i];
    ang=i*1.05+0.4;
    addDipole(acc,x,z,v.x,v.z,9.5,6.5,Math.cos(ang)*0.65*v.polarity,0.92*v.polarity,Math.sin(ang)*0.65*v.polarity,v.strengthMt);
   }
   return{bx:acc[0],by:acc[1],bz:acc[2],seam01:cl(ss(0.18,0.03,Math.hypot(acc[0],acc[2])),0,1)};
  }

  if(skey==='gorge'){
   // Station 4: Banded-ironstone canyon palisades guiding magnetic flux along Ham-Tsek river narrows
   var st=(S&&S.river)?S.river.strike:0.22;
   acc[0]=Math.cos(st)*1.85;acc[1]=0.62;acc[2]=Math.sin(st)*1.85;
   var gd=(S&&S.gorgeDipoles)||[];
   for(i=0;i<gd.length;i++){
    v=gd[i];
    addDipole(acc,x,z,v.x,v.z,18.0,9.0,0.55*v.polarity,0.75*v.polarity,-0.45*v.polarity,v.strengthMt);
   }
   return{bx:acc[0],by:acc[1],bz:acc[2],seam01:cl(ss(0.16,0.03,Math.hypot(acc[0],acc[2])),0,1)};
  }

  // Station 1 (default: foundry): Buried cryo-magnet toroidal ring at R = 225 m + 6 collapsed quench-vent multipole throats!
  var Rring=(S&&S.toroidRadiusM)||225.0;
  var r=Math.hypot(x,z);
  var phi=Math.atan2(z,x);
  // Azimuthal Biot-Savart toroidal remanence + radial poloidal return flux around the ring moat
  var dRing=r-Rring;
  var ringBell=1/(1+(dRing*dRing)/(68*68));
  tx=-Math.sin(phi);tz=Math.cos(phi);
  acc[0]=tx*(0.85+4.8*ringBell)+0.52*Math.cos(phi)*ringBell;
  acc[2]=tz*(0.85+4.8*ringBell)+0.52*Math.sin(phi)*ringBell;
  acc[1]=0.55+2.6*(dRing/68)*ringBell;

  var vents=(S&&S.quenchVents)||[];
  for(i=0;i<vents.length;i++){
   v=vents[i];
   var vAng=Math.atan2(v.z,v.x)+0.55*v.polarity;
   addDipole(acc,x,z,v.x,v.z,7.2,5.8,Math.cos(vAng)*0.82*v.polarity,0.78*v.polarity,Math.sin(vAng)*0.82*v.polarity,v.strengthMt);
  }
  var bhF=Math.hypot(acc[0],acc[2]);
  seam01=cl(ss(0.18,0.03,bhF),0,1);
  return{bx:acc[0],by:acc[1],bz:acc[2],seam01:seam01};
 }

 function clampB(raw){
  var bx=raw.bx,by=raw.by,bz=raw.bz;
  var mag=Math.sqrt(bx*bx+by*by+bz*bz);
  if(!(mag>0)||!isFinite(mag)){
   return{bx:0.35,by:0.35,bz:0,mag:0.495,seam01:raw.seam01};
  }
  if(mag>118.0){
   var sHi=118.0/mag;
   bx*=sHi;by*=sHi;bz*=sHi;mag=118.0;
  }else if(mag<0.32){
   var sLo=0.32/mag;
   bx*=sLo;by*=sLo;bz*=sLo;mag=0.32;
  }
  return{bx:bx,by:by,bz:bz,mag:mag,seam01:raw.seam01};
 }

 function fieldAt(x,z,site){
  var px=dflt(x,0),pz=dflt(z,0);
  var skey=resolveKey(site);
  var r0=rawB(px,pz,skey);
  var c0=clampB(r0);
  // Central difference on unclamped field + exposed magnetite cleft pole-edge gradient (T^2/m)
  var eps=0.5;
  var rxP=rawB(px+eps,pz,skey),rxM=rawB(px-eps,pz,skey);
  var rzP=rawB(px,pz+eps,skey),rzM=rawB(px,pz-eps,skey);
  var mXP=rxP.bx*rxP.bx+rxP.by*rxP.by+rxP.bz*rxP.bz;
  var mXM=rxM.bx*rxM.bx+rxM.by*rxM.by+rxM.bz*rxM.bz;
  var mZP=rzP.bx*rzP.bx+rzP.by*rzP.by+rzP.bz*rzP.bz;
  var mZM=rzM.bx*rzM.bx+rzM.by*rzM.by+rzM.bz*rzM.bz;
  var db2dx=(mXP-mXM)*1e-6/(2*eps);
  var db2dz=(mZP-mZM)*1e-6/(2*eps);
  // Exposed banded-ironstone clefts & cryo-quench throats focus local flux over ~0.04 m pole edges when B >= 12 mT
  var rawMag=Math.sqrt(r0.bx*r0.bx+r0.by*r0.by+r0.bz*r0.bz);
  var cleftFocus=ss(11.0,38.0,rawMag);
  var db2dy=(c0.mag*c0.mag*1e-6)*(0.06+28.5*cleftFocus);
  var gradB2=Math.sqrt(db2dx*db2dx+db2dy*db2dy+db2dz*db2dz);

  var bHoriz=Math.hypot(c0.bx,c0.bz);
  var az=bHoriz>1e-6?Math.atan2(c0.bz,c0.bx):0;
  var dip=Math.atan2(-c0.by,Math.max(1e-6,bHoriz));
  var seam=cl(Math.max(c0.seam01,ss(0.14,0.035,bHoriz)),0,1);

  return{
   bx:+c0.bx.toFixed(4),
   by:+c0.by.toFixed(4),
   bz:+c0.bz.toFixed(4),
   bMagMt:+c0.mag.toFixed(4),
   bHorizMt:+bHoriz.toFixed(4),
   azimuthRad:+az.toFixed(5),
   declinationRad:+az.toFixed(5),
   dipRad:+dip.toFixed(5),
   gradB2:+gradB2.toFixed(7),
   inversionSeam01:+seam.toFixed(4)
  };
 }

 function leafAzimuthAt(x,z,site,jitterU){
  var F=fieldAt(x,z,site);
  var u=cl(dflt(jitterU,0.5),0,1);
  // Magnetosome Langevin alignment on horizontal flux B_horiz:
  // Inside inversionSeam01 (B_horiz < 0.05 mT), alignment drops < 0.16 and leaves splay radially;
  // For B_horiz >= 0.45 mT (outside domain wall), alignment >= 0.88 and bladeYaw locks within +-9 deg (< 12 deg) of azimuthRad!
  var bh=F.bHorizMt;
  var align=cl(0.06+0.90*ss(0.04,0.42,bh)*(1-0.86*ss(0.55,0.96,F.inversionSeam01)),0.04,0.96);
  var maxJitterRad=(1-align)*Math.PI*0.95+0.045;
  var yaw=bh<0.045?wrapPi((u-0.5)*TAU):wrapPi(F.azimuthRad+(u-0.5)*2*maxJitterRad);
  var shadeGain=cl(0.38+0.14*align,0.35,0.52);
  return{
   bladeYawRad:+yaw.toFixed(5),
   alignment01:+align.toFixed(4),
   noonShadeGain01:+shadeGain.toFixed(4),
   bHorizMt:F.bHorizMt,
   bMagMt:F.bMagMt
  };
 }

 function sandStreamAt(a,z,slope,ironByte,bMagMt,gradB2){
  var px,pz,sl,fe,bMt,gB2,siteKey;
  if(a&&typeof a==='object'){
   px=dflt(a.x,0);pz=dflt(a.z,0);
   sl=Math.max(0,dflt(a.slope,0.08));
   fe=cl(dflt(a.ironByte,160),0,255);
   bMt=a.bMagMt;gB2=a.gradB2;siteKey=a.site;
  }else{
   px=dflt(a,0);pz=dflt(z,0);
   sl=Math.max(0,dflt(slope,0.08));
   fe=cl(dflt(ironByte,160),0,255);
   bMt=bMagMt;gB2=gradB2;siteKey='foundry';
  }
  var F=(bMt==null||gB2==null)?fieldAt(px,pz,siteKey):null;
  var bm=bMt==null?F.bMagMt:bMt;
  var gb=gB2==null?F.gradB2:gB2;
  var az=F?F.azimuthRad:fieldAt(px,pz,siteKey).azimuthRad;

  // For strong B >= 1.5 mT, Fe3O4 grain chains align parallel to azimuthRad; weaker fields form wind-normal ripples
  var chainMode=bm>=1.5;
  var rippleYaw=wrapPi(chainMode?az:(az+Math.PI*0.5));
  var flatOk=1-ss(0.24,0.42,sl);
  var contrast=cl((fe/180)*ss(0.35,3.2,bm)*flatOk,0,1);

  // Ferro-tuft spike height (mm): grows where magnetic traction exceeds Krator 0.75 g weight on fine magnetite needles
  var tractionRatio=(gb*2.6e5)*(fe/180);
  var tuftMm=tractionRatio>1.0?cl(3.0+25.0*ss(1.0,12.0,tractionRatio),0,28.0):0;
  return{
   rippleYawRad:+rippleYaw.toFixed(5),
   streakContrast01:+contrast.toFixed(4),
   ferroTuftMm:+tuftMm.toFixed(2)
  };
 }

 function ferrousPullAt(a,z,toolIronKg,gradB2,material){
  var px,pz,kg,gb,mat,siteKey;
  if(a&&typeof a==='object'){
   px=dflt(a.x,0);pz=dflt(a.z,0);
   kg=Math.max(0,dflt(a.toolIronKg,2.0));
   gb=a.gradB2;
   mat=a.material||'iron';
   siteKey=a.site||'foundry';
  }else{
   px=dflt(a,0);pz=dflt(z,0);
   kg=Math.max(0,dflt(toolIronKg,2.0));
   gb=gradB2;
   mat=material||'iron';
   siteKey='foundry';
  }
  var isNonFerrous=(mat==='bronze'||mat==='tin-bronze'||mat==='copper'||mat==='nephrite'||mat==='jade'||mat==='wood'||mat==='ceramic');
  var F=gb==null?fieldAt(px,pz,siteKey):null;
  var gVal=gb==null?F.gradB2:Math.max(0,gb);
  var bNow=F?F.bMagMt:Math.min(115,Math.sqrt(gVal*3.2e6));

  if(isNonFerrous||kg<=0){
   // Cu-Sn tin-bronze & nephrite jade have |chi| < 1e-5 -> force < 0.01 N everywhere!
   var tinyF=kg*0.0012*cl(gVal*1e3,0,2);
   return{
    forceN:+tinyF.toFixed(5),
    wrenchTool:false,
    pinClimber:false,
    safeBronze:true
   };
  }

  // Ferromagnetic iron/steel: domain magnetization M_eff approaches Msat (1.65e6 A/m) above 25 mT;
  // |grad B| = grad(|B|^2) / (2 |B|), force F = V_Fe * M_eff * |grad B|
  var volM3=kg/RHO_IRON;
  var bTesla=Math.max(0.0005,bNow*1e-3);
  var gradBTPerM=gVal/(2*bTesla);
  var mEff=MSAT_IRON*cl(bNow/28.0,0.08,1.0);
  var forceN=volM3*mEff*gradBTPerM*1.35;

  return{
   forceN:+forceN.toFixed(3),
   wrenchTool:forceN>=180.0,
   pinClimber:forceN>=950.0,
   safeBronze:true
  };
 }

 function lightningScoreAt(c){
  c=c||{};
  var elevM=dflt(c.elevM,1392);
  var promM=Math.max(0,dflt(c.localProminenceM,20));
  var ironB=cl(dflt(c.ironByte,180),0,255);
  var bMt=Math.max(0,dflt(c.bMagMt,25));

  // Conductive magnetite/hematite spires on prominent cuesta crests focus upward streamer electric fields
  var condK=ss(50,175,ironB)*(0.55+0.45*ss(1.5,35.0,bMt));
  var promK=ss(4.0,38.0,promM)*(0.75+0.25*ss(850,1650,elevM));
  var strikeProb=cl(0.04+0.94*condK*promK,0,0.98);
  var fulgurite=strikeProb>=0.38?cl(ss(0.35,0.88,strikeProb),0,1):0;
  var irmpole=strikeProb>=0.30?cl(ss(0.28,0.82,strikeProb)*(ironB/180),0,1):0;
  return{
   strikeProb01:+strikeProb.toFixed(4),
   fulgurite01:+fulgurite.toFixed(4),
   irmpole01:+irmpole.toFixed(4)
  };
 }

 function cuestaAspectAt(c){
  c=c||{};
  var elevM=dflt(c.elevM,980);
  var nx=dflt(c.nx,0),nz=dflt(c.nz,-0.12);
  var rainMm=dflt(c.rainMmYr,863);
  var bMt=dflt(c.bMagMt,1.8);
  var seam01=cl(dflt(c.inversionSeam01,0),0,1);
  var riverDistM=dflt(c.riverDistM,9999);
  var trench01=cl(dflt(c.quenchTrench01,0),0,1);

  // Scale-height pressure in 0.75 g warm upland atmosphere: 1.43 atm at +876.5 m -> 1.34 atm at +1,392 m
  var pAtm=cl(1.43*Math.exp(-(elevM-876.5)/7850),1.18,1.50);
  var southAspect=cl(nz*0.85-nx*0.15,-1,1);
  var effTempC=24.0-0.0056*(elevM-876.5)+1.8*southAspect;
  var moist=cl((rainMm/1050)*(1-0.22*Math.max(0,southAspect))+0.38*ss(95,8,riverDistM),0.12,1.0);
  var koppen=(rainMm<800&&moist<0.68)?'Csa':'Cfa';

  var zone='cuestawood';
  if(riverDistM<85)zone='irongorge';
  else if(trench01>0.35)zone='quenchscar';
  else if(seam01>0.48)zone='inversionseam';
  else if(bMt>=12.0||elevM>=1460)zone='magnetor';

  return{
   moisture01:+moist.toFixed(4),
   koppenLocal:koppen,
   pAtm:+pAtm.toFixed(3),
   effTempC:+effTempC.toFixed(2),
   zoneKey:zone
  };
 }

 // kits/crops registration (PLAN.md section 4.2)
 var CROPS_BIOME={
  atm:2,
  zones:{
   cuesta:{warmth:[3,3],arid:[2,3]},
   dipslope:{warmth:[3,3],arid:[1,2]},
   ripgorge:{warmth:[3,4],arid:[3,3],wet:true},
   highcrag:{warmth:[2,2],arid:[2,2],atm:1}
  }
 };
 if(root.CROPS&&root.CROPS.BIOMES&&!root.CROPS.BIOMES.compasshills){
  root.CROPS.BIOMES.compasshills=CROPS_BIOME;
 }

 // 6 Compass Hills fauna records with continuous 0..24h schedules (PLAN.md section 5)
 var FAUNA=[
  {
   key:'ironcladbeetle',
   name:'Gunmetal Bark-Hexapod',
   clade:'hexapod',
   scaleM:0.22,
   biome:'compasshills',
   yields:['magnetite-elytra','chitin'],
   schedule:[[0,6,'CREVICE_SLEEP'],[6,13,'BROWSE_BARK'],[13,17,'CLING_TOR'],[17,21,'MATE_SPIRE'],[21,24,'CREVICE_SLEEP']]
  },
  {
   key:'fluxroller',
   name:'Vortex-Winged Cliff Roller',
   clade:'bird',
   scaleM:0.34,
   biome:'compasshills',
   yields:['feathers','small-fowl'],
   schedule:[[0,6,'NEST_SCARP'],[6,18,'HAWK_TOR'],[18,24,'NEST_SCARP']]
  },
  {
   key:'bronzehornibex',
   name:'Cuesta Copper-Horn Ibex',
   clade:'mammal',
   scaleM:0.95,
   biome:'compasshills',
   yields:['venison','horn','hide','tallow'],
   schedule:[[0,5,'ROOST_CRAG'],[5,10,'GRAZE_CUESTA'],[10,16,'SHADE_TOR'],[16,20,'LICK_IRON'],[20,24,'ROOST_CRAG']]
  },
  {
   key:'sandvelvet',
   name:'Ripple-Line Velvet-Hexapod',
   clade:'hexapod',
   scaleM:0.30,
   biome:'compasshills',
   yields:['chitin','venom-gland'],
   schedule:[[0,8,'PROWL_RIPPLE'],[8,17,'BURROW_SAND'],[17,24,'PROWL_RIPPLE']]
  },
  {
   key:'truffleboar',
   name:'Cuesta Oak-Rooter',
   clade:'mammal',
   scaleM:0.85,
   biome:'compasshills',
   yields:['pork','lard','bristle-hide'],
   schedule:[[0,4,'SLEEP_THICKET'],[4,9,'ROOT_OAK'],[9,17,'WALLOW_BROOK'],[17,23,'FORAGE_OLIVE'],[23,24,'SLEEP_THICKET']]
  },
  {
   key:'gorgeosprey',
   name:'Web-Cleaver Fish-Hawk',
   clade:'bird',
   scaleM:0.60,
   biome:'compasshills',
   yields:['feathers'],
   schedule:[[0,6,'ROOST_PINE'],[6,18,'FISH_NARROWS'],[18,24,'ROOST_PINE']]
  }
 ];

 var API={
  fieldAt:fieldAt,
  fluxAt:fieldAt,
  leafAzimuthAt:leafAzimuthAt,
  sandStreamAt:sandStreamAt,
  ferrousPullAt:ferrousPullAt,
  lightningScoreAt:lightningScoreAt,
  cuestaAspectAt:cuestaAspectAt,
  CROPS_BIOME:CROPS_BIOME,
  FAUNA:FAUNA
 };

 root.COMPASS_PHYS=API;
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
