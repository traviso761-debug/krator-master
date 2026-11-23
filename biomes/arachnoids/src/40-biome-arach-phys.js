// ================================================================= ARACHNOID CANYONS — pure [G data] physics, crops & fauna
// Engine-neutral volcano-tectonic radial dike & ring-graben geometry, inverted slot-canyon thermodynamics, 0.75 g (7.4 m/s2)
// communal bridge-web catenary mechanics, ATMOS wind-pinning, fumarole sinter zoning, and 0.88 atm frost-rim krummholz shear.
// Zero THREE, zero DOM, zero Math.random, zero getImageData; deterministic on core/rand (KRAND) and core/mask (KMASK).
(function(root){
 'use strict';
 var R=root.KRAND;
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

 var CONST={
  G_KRATOR:7.4,
  G_EARTH:9.80665,
  P_SEA_ATM:1.60,
  SCALE_H_M:8000.0,
  SPAN_MIN_M:30.0,
  SPAN_MAX_M:92.0,
  WEB_MAX_ASL_M:1450.0,
  WEB_MIN_WATER_CLEAR_M:12.0,
  ANCHOR_MAX_GAP_M:0.15,
  SCALD_TEMP_C:58.0
 };

 // Exact segment distance & closest point
 function segDist2D(ax,az,bx,bz,x,z){
  var dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
  var t=l2>1e-9?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0;
  var px=ax+dx*t,pz=az+dz*t;
  return{d:Math.hypot(x-px,z-pz),px:px,pz:pz,t:t};
 }

 // Deterministic CPU fracture-corridor raster via core/mask (KMASK.distance + KMASK.distanceHash; zero getImageData, zero canvas 2D)
 var _maskCache={};
 function getFractureFields(site){
  if(!site||!site.key)return null;
  if(_maskCache[site.key])return _maskCache[site.key];
  var KM=root.KMASK;
  if(!KM||typeof KM.distance!=='function')return null;
  var W=192,S=960.0,mPerPx=S/W;
  var dikes=site.dikes||[];
  var rings=site.rings||[];

  var spokeDist=KM.distance({width:W,height:W},{inside:function(ix,iz){
   var wx=((ix+0.5)/W-0.5)*S,wz=((iz+0.5)/W-0.5)*S;
   for(var i=0;i<dikes.length;i++){
    var dk=dikes[i];
    if(segDist2D(dk.a[0],dk.a[1],dk.b[0],dk.b[1],wx,wz).d<=0.5*nz(dk.thickM,9.0))return true;
   }
   return false;
  }});

  var ringDist=KM.distance({width:W,height:W},{inside:function(ix,iz){
   var wx=((ix+0.5)/W-0.5)*S,wz=((iz+0.5)/W-0.5)*S;
   for(var j=0;j<rings.length;j++){
    var rg=rings[j];
    var rr=Math.hypot(wx-nz(rg.cx,0),wz-nz(rg.cz,0));
    if(Math.abs(rr-nz(rg.rM,170.0))<=0.5*nz(rg.widthM,44.0))return true;
   }
   return false;
  }});

  var rec={
   W:W,
   S:S,
   mPerPx:mPerPx,
   spokeDist:spokeDist,
   ringDist:ringDist,
   spokeHash:typeof KM.distanceHash==='function'?KM.distanceHash(spokeDist):1,
   ringHash:typeof KM.distanceHash==='function'?KM.distanceHash(ringDist):1
  };
  _maskCache[site.key]=rec;
  return rec;
 }

 // 1. Radial arch-rift-basalt dike boxwork & concentric ring-graben distance fields
 function fissureNetAt(x,z,site){
  x=nz(x,0);z=nz(z,0);
  site=site||{};
  var dikes=site.dikes||[
   {a:[-360,-230],b:[360,210],thickM:11.0,heightM:142.0},
   {a:[-340,245],b:[355,-225],thickM:10.5,heightM:138.0}
  ];
  var rings=site.rings||[{cx:40,cz:-30,rM:168.0,widthM:42.0,depthM:35.0}];

  var d1=1e9,d2=1e9,bestH=120.0,bestThick=10.0;
  for(var i=0;i<dikes.length;i++){
   var dk=dikes[i];
   var sd=segDist2D(dk.a[0],dk.a[1],dk.b[0],dk.b[1],x,z);
   var edgeD=Math.max(0,sd.d-0.5*nz(dk.thickM,10.0));
   if(edgeD<d1){
    d2=d1;d1=edgeD;
    bestH=nz(dk.heightM,120.0);
    bestThick=nz(dk.thickM,10.0);
   }else if(edgeD<d2){
    d2=edgeD;
   }
  }

  var rBest=1e9,lipNx=0,lipNz=-1;
  for(var j=0;j<rings.length;j++){
   var rg=rings[j];
   var rx=x-nz(rg.cx,0),rz=z-nz(rg.cz,0);
   var rr=Math.hypot(rx,rz);
   var rd=Math.max(0,Math.abs(rr-nz(rg.rM,170.0))-0.5*nz(rg.widthM,42.0));
   if(rd<rBest){
    rBest=rd;
    if(rr>1e-6){
     // Point radially AWAY from the deep chasm ring center / chasm trough
     var signOut=(rr<nz(rg.rM,170.0))?-1:1;
     // On Station 4 frostrim, chasm lies at +z (southward into graben), so away-from-lip points -z / radially outward
     if(site.key==='frostrim'){
      var dzLip=z-135.0;
      lipNx=clamp(x*0.002,-0.45,0.45);
      lipNz=dzLip<=0?-1.0:1.0;
      var lL=Math.hypot(lipNx,lipNz);
      lipNx/=lL;lipNz/=lL;
     }else{
      lipNx=(rx/rr)*signOut;
      lipNz=(rz/rr)*signOut;
     }
    }
   }
  }

  // Blend exact analytic distance with KMASK CPU distance field when inside station mask window
  var mf=getFractureFields(site);
  if(mf&&Math.abs(x)<mf.S*0.48&&Math.abs(z)<mf.S*0.48){
   var px=(x/mf.S+0.5)*mf.W,pz=(z/mf.S+0.5)*mf.W;
   var mSpoke=mf.spokeDist.sample(px,pz)*mf.mPerPx;
   var mRing=mf.ringDist.sample(px,pz)*mf.mPerPx;
   if(isFinite(mSpoke))d1=0.65*d1+0.35*mSpoke;
   if(isFinite(mRing))rBest=0.65*rBest+0.35*mRing;
  }

  // Star-junction nexus score peaks where >= 2 radial dike spokes intersect near a ring-graben
  var spokeCross=smooth(95.0,8.0,d1)*smooth(125.0,14.0,d2);
  var ringCross=smooth(90.0,10.0,d1)*smooth(110.0,12.0,rBest);
  var nexusScore01=clamp(Math.max(spokeCross,0.85*ringCross),0,1);

  var baseSlot=nz(site.slotHalfW,45.0)*2.0;
  var slotWidthM=clamp(lerp(baseSlot*1.55,Math.max(32.0,baseSlot*0.62),Math.max(nexusScore01,smooth(75.0,6.0,d1))),32.0,220.0);
  var dikeHeightM=+(bestH*(0.35+0.65*smooth(48.0,0.0,d1))*(1.0+0.22*nexusScore01)).toFixed(2);
  // Chilled obsidian-vitrophyre dike selvage peaks along dike contact margins (spokeDistM < 6 m)
  var vitrophyre01=clamp(smooth(14.0,1.2,d1)*(0.65+0.35*smooth(0.0,3.5,d1)),0,1);
  var lipAzimuthRad=Math.atan2(lipNx,lipNz);

  return{
   ringDistM:+rBest.toFixed(2),
   spokeDistM:+d1.toFixed(2),
   secondSpokeDistM:+(d2>1e8?999.0:d2).toFixed(2),
   dikeThickM:bestThick,
   slotWidthM:+slotWidthM.toFixed(2),
   dikeHeightM:dikeHeightM,
   nexusScore01:+nexusScore01.toFixed(4),
   vitrophyre01:+vitrophyre01.toFixed(4),
   lipAzimuthRad:+lipAzimuthRad.toFixed(4),
   lipNx:+lipNx.toFixed(4),
   lipNz:+lipNz.toFixed(4)
  };
 }

 // 2. Vertical microclimate inversion: warm humid convective/geothermal slot bottoms vs dry Csa ledges & sub-zero ET frost-rims
 function inversionAt(x,z,y,site){
  x=nz(x,0);z=nz(z,0);
  site=site||{};
  var yBed=nz(site.bedY,-12.0);
  var yRim=nz(site.rimY,195.0);
  y=nz(y,yBed+5.0);

  var fn=fissureNetAt(x,z,site);
  var hAboveBed=Math.max(0,y-yBed);
  var spanH=Math.max(40.0,yRim-yBed);
  var normZ=clamp(hAboveBed/spanH,0,1.4);

  // Sky-view factor psi_sky in [0.08, 1.0]: narrow deep slots (< 0.25) trap longwave heat & river mist; rims (> 0.80) radiate to sky
  var narrowFactor=smooth(160.0,38.0,fn.slotWidthM);
  var skyView01=clamp(lerp(0.11+0.14*(1.0-narrowFactor),0.96,smooth(0.08,0.82,normZ)),0.08,1.0);

  var baseElevM=nz(site.elevM,660.6);
  var aslM=baseElevM+(y-yBed);
  var pAtm=CONST.P_SEA_ATM*Math.exp(-Math.max(0,aslM)/CONST.SCALE_H_M);

  // Local fumarole contribution if on thermal trough
  var fum=fumaroleAt(x,z,site);
  var fumAirBoost=fum.steam01*3.2*smooth(90.0,5.0,hAboveBed);

  // Inverted temperature profile: deep slot floor holds warm river + geothermal heat; upper rim drops >= 9..13 C across canyon wall!
  var slotFloorTempC=nz(site.tempMeanC,24.0)+nz(site.geothermalBoostC,3.0)*smooth(0.45,0.12,skyView01);
  if(site.key==='ledges'){
   // Station 3 is anchored at +1,629 m mid-wall, while the abyss bed (-165 m local) is warm humid slot below and rim (+135 m) is cool dry Csa
   slotFloorTempC=23.5;
  }else if(site.key==='frostrim'){
   // Station 4 plateau lip is +4,784 m (-2.0 C), while radial chasm 2 km below sends rising rime-plumes
   slotFloorTempC=9.5;
  }
  var rimCoolingC=lerp(0.0,12.4,smooth(0.12,0.86,normZ));
  var tempC=slotFloorTempC-rimCoolingC+fumAirBoost;
  if(site.key==='frostrim'&&normZ>=0.75){
   tempC=lerp(1.5,nz(site.tempMeanC,-2.0)-1.6*smooth(0.85,1.2,normZ),smooth(0.75,0.98,normZ));
  }

  // Relative humidity & canyon mist lid: saturated on slot floor (0.90..0.98), stripped dry on sun-baked Csa / alpine ET rims (0.36..0.52)
  var slotRh=clamp(0.91+0.06*narrowFactor+0.03*fum.steam01,0.85,0.99);
  var rimRh=site.key==='frostrim'?0.46:(site.koppen==='Csa'?0.38:0.50);
  var rh01=clamp(lerp(slotRh,rimRh,smooth(0.14,0.78,normZ)),0.22,0.99);

  var mistLid=smooth(0.62,0.16,normZ)*(0.65+0.35*narrowFactor);
  var mistDensity01=clamp(mistLid*smooth(0.68,0.94,rh01)+0.25*fum.steam01*smooth(65.0,0.0,hAboveBed),0,0.96);

  // Thermal chimney updraft: accelerates through narrow basalt dike notches (nexusScore01) and surges out over chasm lips (normZ ~ 0.7..1.0)
  var notchVenturi=1.0+0.85*fn.nexusScore01+0.45*narrowFactor;
  var lipSurge=smooth(0.45,0.92,normZ)*(site.key==='frostrim'?1.65:1.15);
  var baseWind=site.wind?Math.hypot(site.wind[0],site.wind[1]):4.2;
  var updraftMs=clamp((1.65+0.32*baseWind)*notchVenturi*(0.72+0.58*lipSurge),1.2,11.5);

  // Frost index: strictly 0 in warm slot bottoms & below +2,400 m; >= 0.72 on ET Station 4 frostrim
  var frost01=0;
  if(tempC<2.5&&aslM>2400.0){
   frost01=clamp(smooth(2.5,-2.8,tempC)*smooth(2600.0,4200.0,aslM),0,1);
  }

  var zoneBand='slotfloor';
  if(frost01>=0.55||aslM>=3400.0)zoneBand='frostrim';
  else if(rh01<0.52&&aslM>=1450.0)zoneBand='dryrim';
  else if(normZ>=0.36||aslM>=1150.0)zoneBand='ledgewood';

  return{
   tempC:+tempC.toFixed(2),
   rh01:+rh01.toFixed(4),
   mistDensity01:+mistDensity01.toFixed(4),
   updraftMs:+updraftMs.toFixed(2),
   frost01:+frost01.toFixed(4),
   skyView01:+skyView01.toFixed(4),
   pAtm:+pAtm.toFixed(4),
   aslM:+aslM.toFixed(1),
   zoneBand:zoneBand
  };
 }

 // 3. 0.75 g (g = 7.4 m/s2) catenary bridge-web mechanics: y(s) = a * (cosh(s/a) - 1)
 function solveCatenarySag(spanM,aParam){
  var halfS=0.5*spanM;
  var aSafe=Math.max(12.0,aParam);
  return aSafe*(Math.cosh(halfS/aSafe)-1.0);
 }

 function webSpanAt(anchorA,anchorB,gKrator,opt){
  anchorA=anchorA||[-25,28,0];
  anchorB=anchorB||[25,28,0];
  opt=opt||{};
  var g=nz(gKrator,CONST.G_KRATOR);
  var dx=nz(anchorB[0],0)-nz(anchorA[0],0);
  var dy=nz(anchorB[1],0)-nz(anchorA[1],0);
  var dz=nz(anchorB[2],0)-nz(anchorA[2],0);
  var horizSpanM=Math.hypot(dx,dz);
  var chordSpanM=Math.hypot(horizSpanM,dy);

  // Braided Tsek-Ma structural hawser bundle: linear mass lambda = 0.24 kg/m, pre-tension H0 scales with span
  var lambdaKgM=0.24;
  var horizTensionN=1650.0+32.0*horizSpanM;
  // Catenary parameter a = H0 / (lambda * g) -> inversely proportional to gravity g!
  var aKrator=horizTensionN/Math.max(1e-4,lambdaKgM*g);
  var aEarth=horizTensionN/Math.max(1e-4,lambdaKgM*CONST.G_EARTH);

  var sagM=solveCatenarySag(horizSpanM,aKrator);
  var sag1gM=solveCatenarySag(horizSpanM,aEarth);
  // Peak anchor tension T_max = H0 * cosh(L / (2*a))
  var tensionN=horizTensionN*Math.cosh((0.5*horizSpanM)/Math.max(12.0,aKrator));

  var midLinearY=0.5*(nz(anchorA[1],0)+nz(anchorB[1],0));
  var lowestY=midLinearY-sagM;
  var waterY=nz(opt.waterY,-13.0);
  var clearAboveWaterM=lowestY-waterY;
  var updraftMs=nz(opt.updraftMs,3.8);
  var frost01=nz(opt.frost01,0);
  var aslM=nz(opt.aslM,685.0);
  var gapAM=Math.max(0,nz(opt.anchorGapAM,0.0));
  var gapBM=Math.max(0,nz(opt.anchorGapBM,0.0));

  var tierCount=horizSpanM<46.0?2:horizSpanM<72.0?3:4;
  var validSpan=(
   horizSpanM>=CONST.SPAN_MIN_M&&
   horizSpanM<=CONST.SPAN_MAX_M&&
   updraftMs>=1.8&&
   frost01===0&&
   aslM<=CONST.WEB_MAX_ASL_M&&
   clearAboveWaterM>=CONST.WEB_MIN_WATER_CLEAR_M&&
   gapAM<=CONST.ANCHOR_MAX_GAP_M&&
   gapBM<=CONST.ANCHOR_MAX_GAP_M
  );

  return{
   spanM:+horizSpanM.toFixed(3),
   chordM:+chordSpanM.toFixed(3),
   sagM:+sagM.toFixed(4),
   sag1gM:+sag1gM.toFixed(4),
   sagRatio01:sag1gM>1e-6?+(sagM/sag1gM).toFixed(4):0.7546,
   catenaryAM:+aKrator.toFixed(2),
   tensionN:+tensionN.toFixed(1),
   tierCount:tierCount,
   lowestY:+lowestY.toFixed(3),
   clearAboveWaterM:+clearAboveWaterM.toFixed(3),
   updraftMs:+updraftMs.toFixed(2),
   frost01:frost01,
   anchorGapMaxM:+Math.max(gapAM,gapBM).toFixed(4),
   validSpan:validSpan
  };
 }

 // ATMOS silk pin-weight & deterministic displacement mirror (0.000 m anchor drift at u=0 and u=1!)
 function silkPinWeight(kind,u,v){
  u=clamp(nz(u,0),0,1);
  v=clamp(nz(v,0.5),0,1);
  if(u<=1e-6||u>=1.0-1e-6)return 0.0;
  var spanEnv=Math.sin(Math.PI*u);
  if(kind==='guycable')return +(0.55*spanEnv).toFixed(5);
  // Multi-tier horizontal capture sheet: zero at both basalt dike walls, gentle cross-sheet belly
  var crossEnv=0.65+0.35*Math.sin(Math.PI*v);
  return +(spanEnv*crossEnv).toFixed(5);
 }

 function displaceSilk(wx,wy,wz,fx,fy,fz,timeS,windX,windZ,gustAmp){
  var pin=Math.hypot(nz(fx,0),nz(fy,0),nz(fz,0));
  if(pin<=1e-6)return[0,0,0];
  var t=nz(timeS,0),wx0=nz(windX,4.0),wz0=nz(windZ,-2.0),ga=nz(gustAmp,0.6);
  var wMag=Math.hypot(wx0,wz0)*(1.0+0.25*ga*Math.sin(t*0.7+wx*0.02));
  var inv=wMag>1e-5?1.0/Math.hypot(wx0,wz0):0;
  var dx=wx0*inv,dz=wz0*inv;
  var ph1=(wx*dx+wz*dz)*2.2-t*(2.5+0.5*wMag)+wy*1.5;
  var wave=Math.sin(ph1);
  return[
   +(wx0*0.24*pin+fx*wave*(0.30+0.38*wMag)).toFixed(5),
   +(0.05*wMag*(0.5+0.5*wave)*pin+fy*wave*(0.30+0.38*wMag)).toFixed(5),
   +(wz0*0.24*pin+fz*wave*(0.30+0.38*wMag)).toFixed(5)
  ];
 }

 // 4. Ring-fault hydrothermal fumarole & sinter-apron zoning (Station 2)
 function fumaroleAt(x,z,site){
  x=nz(x,0);z=nz(z,0);
  site=site||{};
  var vents=site.vents||[];
  var ambientSoilC=nz(site.tempMeanC,24.0);
  if(!vents.length){
   return{groundTempC:+ambientSoilC.toFixed(2),steam01:0,sinterRim01:0,sulfurCrust01:0,hazardScald:false};
  }
  var excess=0,maxVentT=ambientSoilC;
  for(var i=0;i<vents.length;i++){
   var v=vents[i];
   var d=1e9;
   if(v.kind==='line'&&v.pts&&v.pts.length>=2){
    for(var k=0;k<v.pts.length-1;k++){
     var sd=segDist2D(v.pts[k][0],v.pts[k][1],v.pts[k+1][0],v.pts[k+1][1],x,z);
     if(sd.d<d)d=sd.d;
    }
   }else{
    d=Math.hypot(x-nz(v.x,0),z-nz(v.z,0));
   }
   var reach=Math.max(1.0,nz(v.reach,48.0));
   if(d>=reach)continue;
   var dec=nz(v.decay,2.7);
   var q=d/reach;
   var sh=dec>0?(Math.exp(-dec*q)-Math.exp(-dec))/(1.0-Math.exp(-dec)):(1.0-q);
   var vT=nz(v.T,62.0);
   if(vT>ambientSoilC){
    excess+=(vT-ambientSoilC)*sh;
    if(vT>maxVentT)maxVentT=vT;
   }
  }
  var capped=Math.min(excess,Math.max(0,maxVentT-ambientSoilC));
  var noiseJit=(R&&capped>0.5)?1.2*(2.0*R.fbm(x*0.025,z*0.025,0.5,2,5911)-1.0)*Math.min(1.0,capped/10.0):0;
  var groundTempC=clamp(ambientSoilC+capped+noiseJit,ambientSoilC,72.0);
  var steam01=clamp(smooth(33.0,64.0,groundTempC),0,1);
  // Sinter-mat thermophiles peak at +34..+60 C; above +62 C pure white silica sinter & yellow sulfur sublimate dominate
  var sinterRim01=clamp(smooth(32.5,41.0,groundTempC)*(1.0-0.35*smooth(61.0,70.0,groundTempC)),0,1);
  var sulfurCrust01=clamp(smooth(51.0,64.0,groundTempC),0,1);
  var hazardScald=groundTempC>=CONST.SCALD_TEMP_C;

  return{
   groundTempC:+groundTempC.toFixed(2),
   steam01:+steam01.toFixed(4),
   sinterRim01:+sinterRim01.toFixed(4),
   sulfurCrust01:+sulfurCrust01.toFixed(4),
   hazardScald:hazardScald
  };
 }

 // 5. High-rim 0.88 atm ET updraft-sheared krummholz mechanics (Station 4 frostrim)
 function krummholzShearAt(x,z,site){
  x=nz(x,0);z=nz(z,0);
  site=site||{key:'frostrim',elevM:4784.3,bedY:-220,rimY:24,tempMeanC:-2.0,wind:[8.8,-3.2]};
  var fn=fissureNetAt(x,z,site);
  var inv=inversionAt(x,z,nz(site.rimY,24.0),site);
  // Thin 0.88 atm air + >= 3.0 m/s rising canyon-lip gale shears conifers into horizontal banners pointing radially away from chasm lip
  var thinBoost=clamp(smooth(1.18,0.82,inv.pAtm),0,1);
  var windShear=clamp(smooth(2.6,7.8,inv.updraftMs)*(0.55+0.45*thinBoost),0,1);
  var prostrateH=lerp(2.45,0.52,windShear);
  var bannerLenM=lerp(0.95,3.65,windShear);

  return{
   updraftMs:inv.updraftMs,
   pAtm:inv.pAtm,
   shear01:+windShear.toFixed(4),
   prostrateH:+prostrateH.toFixed(3),
   bannerLenM:+bannerLenM.toFixed(3),
   yawRad:fn.lipAzimuthRad,
   lipNx:fn.lipNx,
   lipNz:fn.lipNz,
   flaggedOk:(windShear>=0.45&&prostrateH<=1.95&&bannerLenM>=1.75)
  };
 }

 // 6. kits/crops registration (PLAN.md section 6.1)
 var CROPS_SPEC={
  atm:1,
  zones:{
   slotfloor:{warmth:[3,4],arid:[3,3],wet:true,heated:true,atm:2},
   ledgewood:{warmth:[2,3],arid:[1,3],atm:1},
   dryrim:{warmth:[2,3],arid:[1,2],atm:1},
   frostrim:{warmth:[0,1],arid:[1,2],atm:0}
  },
  signature:['rice','wild-rice','taro','steambed-yam','sweet-potato','helix-bean','mulberry','tea','emmer','frostoat','basin-amaranth','tepary-bean','murnong','painted-camas','pinyon','acorn','whorl-olive','canyon-grape','saffron','frostroot','pale-fungi','glow-mushroom']
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.arachnoids={atm:CROPS_SPEC.atm,zones:CROPS_SPEC.zones};
 }

 // 7. Native & gorge fauna records ([G data], PLAN.md section 5.1; continuous 0..24h schedules)
 var FAUNA=[
  {key:'bridgearachnid',name:'Chasm-Weaver (Tsek-Ma)',clade:'arachnid',spanM:0.45,massKg:1.8,biome:['arachnoids'],zones:['slotfloor'],
   aggression:0.08,yields:['wild-chasm-silk','venom-reagent'],
   schedule:[[0,5,'CULL_SWARM'],[5,9,'REEL_DEW_SILK'],[9,17,'CROUCH_DIKE_JOINT'],[17,22,'SPIN_BRIDGE_SHEET'],[22,24,'CULL_SWARM']]},
  {key:'dikegecko',name:'Column-Claw Glide-Saurian',clade:'reptile',spanM:0.48,biome:['arachnoids'],zones:['slotfloor','ledgewood'],
   aggression:0.0,yields:['scale-hide','small-meat'],
   schedule:[[0,7,'CREVICE_TORPOR'],[7,11,'BASK_BASALT'],[11,18,'GLIDE_FORAGE'],[18,24,'CREVICE_TORPOR']]},
  {key:'ventloach',name:'Sinter-Pool Armor-Loach',clade:'fish',spanM:0.35,biome:['arachnoids'],zones:['slotfloor'],
   aggression:0.0,yields:['fish','fish-oil'],
   schedule:[[0,24,'GRAZE_WEIR']]},
  {key:'nitreswift',name:'Echo-Clicking Nitre-Swiftlet',clade:'bird',spanM:0.22,clickKhz:7.0,biome:['arachnoids'],zones:['slotfloor','ledgewood'],
   aggression:0.0,yields:['guano-nitre','feathers'],
   schedule:[[0,5,'ROOST_ALCOVE'],[5,8,'DAWN_SPIRAL'],[8,18,'HAWK_RIM'],[18,24,'ROOST_ALCOVE']]},
  {key:'columnargoral',name:'Hex-Step Cliff Goral',clade:'ungulate',spanM:0.90,biome:['arachnoids'],zones:['ledgewood','dryrim','frostrim'],
   aggression:0.05,yields:['venison','wool-undercoat','horn'],
   schedule:[[0,6,'BED_ALCOVE'],[6,11,'BROWSE_LEDGE'],[11,16,'RUMINATE_DIKE'],[16,20,'CLIMB_SCARP'],[20,24,'BED_ALCOVE']]},
  {key:'vitrophyremarmot',name:'Obsidian-Whistler',clade:'mammal',spanM:0.55,whistleKhz:3.2,biome:['arachnoids'],zones:['frostrim'],
   aggression:0.0,yields:['pelt','tallow','meat'],
   schedule:[[0,7,'BURROW_HUDDLE'],[7,17,'FORAGE_CUSHION'],[17,24,'BURROW_HUDDLE']]}
 ];

 // 8. Data-driven hazards (PLAN.md section 5.2)
 var HAZARDS=[
  {id:'arachnoids:webtrap',kind:'mire',stations:['nexus'],triggerDistM:3.5},
  {id:'arachnoids:fumarole',kind:'heat',stations:['fumarole'],triggerTempC:58.0},
  {id:'arachnoids:slotflood',kind:'current',stations:['nexus','fumarole'],dischargeM3s:1295.0},
  {id:'arachnoids:updraftdrop',kind:'fall',stations:['ledges','frostrim'],triggerUpdraftMs:5.5}
 ];

 var API={
  version:1,
  CONST:CONST,
  getFractureFields:getFractureFields,
  fissureNetAt:fissureNetAt,
  inversionAt:inversionAt,
  webSpanAt:webSpanAt,
  silkPinWeight:silkPinWeight,
  displaceSilk:displaceSilk,
  fumaroleAt:fumaroleAt,
  krummholzShearAt:krummholzShearAt,
  CROPS:CROPS_SPEC,
  FAUNA:FAUNA,
  HAZARDS:HAZARDS
 };

 root.ARACH_PHYS=API;
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
