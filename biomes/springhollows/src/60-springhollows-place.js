// ================================================================= SPRINGHOLLOWS — deterministic cell-seeded placement ([G data])
// Pure deterministic placement of all 25 native, karst-spring, dolomite-glade, shut-in, gossan, Weeping-border & Carnelian species
// across all 5 stations (spring, shutin, fenestre, glade, porphyryrelict):
//   - Woody upland & calciphile trees (chinkapinoak, porphyrypine, redbudkarst, whorlolive, weepingamberstorax, dolomitehornbeam,
//     springtupelo, fenestrespicebush, karstwildtea) strictly above river/spring channels (py > wy + 0.42 m); springcypress stands
//     on shallow spring margins with grounded fluted buttresses & knees, beside emergent artesianwatercress & submerged springsponge
//   - porphyrypine strictly confined to inDike === true; chinkapinoak & calciphile trees strictly inBleachBelt === false
//   - tufabryum strictly confined to humid twilight cave-mouths & skylight throats (0.04 <= skyOpenness01 <= 0.42); dark cavern halls
//     fruit fenestreglowmush & karstalecap; wet tufa lips & shaded fenestre overhangs hold travertinemaidenhair
//   - 25% Red Porphyry-Knob Crazy-Quilt: carnelian_organpipe, erythra_veil, agate_window & blood_strangler crown Station 5
//     porphyryrelict and colonize sun-baked purple-red porphyry-dike knobs on Station 2 (shutin) & Station 4 (glade), while
//     blood_strangler, bleachfireweed & stranglervine contest Station 4 glade's geometric Bleach-Scar seam
//   - calaminefern + zincviolet over MVT zinc = 90 porphyry-dolomite gossan contacts; karstsaffron, whorlolive & karstwildtea on terraces
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=SPRINGHOLLOWS.C,PAL=SPRINGHOLLOWS.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.22,rr(-j,j)*0.7,rr(-j,j)*0.7);
  return c;
 };

 // Keep foliage crowns clear of preset camera eye coordinates across all 5 stations
 const CAM_CLEAR={
  spring:[[120,-135],[-16,-36],[82,34],[-54,-24],[-48,24],[165,-38]],
  shutin:[[134,-34],[-118,-132],[-24,-28],[-56,46],[28,68],[8,-72],[-138,-32]],
  fenestre:[[-48,-54],[-115,-118],[-18,-26],[28,-32],[0,0],[22,22],[44,-18]],
  glade:[[-125,-128],[-14,-52],[-16,-24],[-38,-36],[-148,112],[-98,74],[118,-98]],
  porphyryrelict:[[-118,-112],[-34,-46],[56,48],[-92,22],[-58,-32],[-96,-72]]
 };

 SPRINGHOLLOWS.placeAll=function(opt){
  opt=opt||{};
  const rawKey=opt.station||'spring';
  const skey=rawKey==='labyrinth'?'glade':rawKey;
  const site=HOLLOW_SITES[skey]||HOLLOW_SITES.spring;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?630:opt.R;
  const seedBase=opt.seed==null?7417:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;
  const cavern=opt.cavern||null;
  const F=opt.field||(typeof FIELD!=='undefined'?FIELD:null);
  const fRock=(F&&F.rock)?F.rock:()=>0.2;
  const fWet=(F&&F.wet)?F.wet:(x,z)=>{const w=W(x,z);return w>-1e5?smooth(4.5,-0.2,Y(x,z)-w):0;};

  SPRINGHOLLOWS.PLACED.length=0;
  SPRINGHOLLOWS.CROWNS.length=0;

  const st={boulders:0,cavernFungi:0};
  for(let i=0;i<SPRINGHOLLOWS.SPECIES.length;i++){
   st[SPRINGHOLLOWS.SPECIES[i].key]=0;
  }

  const cams=CAM_CLEAR[skey]||[];
  const nearCam=(x,z,rad)=>{
   for(let i=0;i<cams.length;i++){
    if(Math.hypot(x-cams[i][0],z-cams[i][1])<rad)return true;
   }
   return false;
  };
  const free=(x,z,r)=>!sp||!sp.some(x,z,r,it=>Math.hypot(x-it.x,z-it.z)<it.r+r);
  const claim=(kind,x,z,r)=>{if(sp)sp.insert({kind:kind,x:x,z:z,r:r},x,z,r);};

  const inReserveCore=(x,z)=>{
   if(!site.reserves||!site.reserves.length)return false;
   for(let i=0;i<site.reserves.length;i++){
    const rv=site.reserves[i];
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.82)return true;
   }
   return false;
  };
  const inCavernHole=(x,z)=>{
   if(cavern&&cavern.C&&cavern.C.holeAt(x,z))return true;
   if(site.cavern&&site.cavern.portal){
    const pr=site.cavern.kind==='resurgence'?18.0:(site.cavern.skylightDiamM*0.72+4.0);
    if(Math.hypot(x-site.cavern.portal[0],z-site.cavern.portal[1])<pr)return true;
   }
   return false;
  };

  const seed=KRAND.child(seedBase,'springhollows/'+skey);
  const IMP=SPRINGHOLLOWS.IMP;
  const NEAR_TREE_R=195.0;
  const hasKF=typeof KFRONTIER!=='undefined';

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   SPRINGHOLLOWS.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
   st[speciesKey]=(st[speciesKey]==null?0:st[speciesKey])+1;
  }

  // ---------------------------------------------------------------- 1. TWILIGHT TUFABRYUM, MAIDENHAIR & DARK-CAVERN MUSHROOMS
  // tufabryum strictly confined to 0.04 <= skyOpenness01 <= 0.42 (PLAN.md section 7.3 #3)
  if(site.cavern){
   const cv=site.cavern,px0=cv.portal[0],pz0=cv.portal[1];
   const nCurt=cv.kind==='resurgence'?44:38;
   const ringR=cv.kind==='resurgence'?13.5:(cv.skylightDiamM*0.52);
   for(let i=0;i<nCurt;i++){
    reseed(KRAND.hash(seed+110,i,1));
    const ang=cv.kind==='resurgence'?lerp(-1.32,1.32,i/(nCurt-1))+rr(-0.06,0.06):(i/nCurt)*TAU+rr(-0.08,0.08);
    const rad=ringR*rr(0.84,1.16);
    const tx=cv.kind==='resurgence'?(px0+Math.cos(ang)*rad*0.55):(px0+Math.cos(ang)*rad);
    const tz=pz0+Math.sin(ang)*rad;
    const surfY=Y(tx,tz);
    const skyOpen=lerp(0.08,0.36,rr(0,1));
    const glow=HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01:skyOpen,springHumidity01:0.88,isNight:true});
    if(glow.bryoCover01<=0)continue;
    const archY=cv.kind==='resurgence'?(cv.floorY+11.5+6.5*Math.cos(ang*0.9)+rr(-1.2,1.2)):(surfY-rr(1.8,5.8));
    const len=rr(1.1,2.8);
    const OwnPrev=BIO.owner;BIO.owner=[tx,tz];
    BIO.put('sh_tufa_curtain',[tx,archY,tz],qEuler(Math.PI,rr(0,TAU),0),[0.45+0.18*len,len,0.45+0.18*len],pickC(PAL.tufa,0.03));
    BIO.put('sh_tufa_cone',[tx,archY+0.15,tz],qEuler(Math.PI,rr(0,TAU),0),[0.55,0.48,0.55],pickC(PAL.tufaMoss,0.03));
    BIO.owner=OwnPrev;
    recordPlaced('tufabryum',tx,archY,tz,'fenestrecavern',{skyOpenness01:+skyOpen.toFixed(3),biolum01:glow.biolumRadiance01});
   }
   // Wet tufa lip & shaded fenestre overhang travertinemaidenhair fans rooted on damp rim shelves
   for(let i=0;i<20;i++){
    reseed(KRAND.hash(seed+125,i,1));
    const ang=(i/20)*TAU+rr(-0.1,0.1),rad=ringR+rr(2.8,8.5);
    const mx=px0+Math.cos(ang)*rad,mz=pz0+Math.sin(ang)*rad;
    if(nearCam(mx,mz,4.2)||inCavernHole(mx,mz))continue;
    const my=Y(mx,mz),wy=W(mx,mz);
    if(wy>-1e5&&my<=wy+0.20)continue;
    const sc=rr(0.38,0.72);
    BIO.put('sh_maidenhair',[mx,my-0.02,mz],qEuler(0,rr(0,TAU),0),[sc,sc*0.85,sc],pickC(PAL.maidenhair,0.03));
    recordPlaced('travertinemaidenhair',mx,my,mz,'fenestrecavern',{wet01:0.86,shadedRim:true});
   }
   if(reg){
    reg({
     tagId:'springhollows:tufabryum-'+skey,
     name:'Twilight Calcifying Tufabryum Curtain Colony (495 nm Dusk Glow)',
     tagClass:'flora',
     x:px0,y:cv.floorY+2,z:pz0,r:ringR+8,h:22,
     tags:{biome:'springhollows',species:'tufabryum',skyOpenBand:'0.04..0.42'}
    });
   }

   // Subterranean dark-zone fenestreglowmush & karstalecap colonies on cavern floor (skyOpenness01 < 0.03)
   const hx=cv.hall[0],hz=cv.hall[1];
   for(let i=0;i<26;i++){
    reseed(KRAND.hash(seed+140,i,2));
    const a=rr(0,TAU),rad=rr(4.5,Math.min(cv.hallRx,cv.hallRz)*0.68);
    const mx=hx+Math.cos(a)*rad,mz=hz+Math.sin(a)*rad;
    const wy=W(mx,mz);
    const fy=cavern&&cavern.floorH?cavern.floorH(mx,mz):(cv.floorY+0.2);
    if(wy>-1e5&&fy<wy+0.25)continue;
    const isGlow=i%2===0;
    const sc=rr(0.28,0.62);
    if(isGlow){
     BIO.put('sh_glow_mush',[mx,fy-0.02,mz],qEuler(0,rr(0,TAU),0),[sc,sc*1.15,sc],pickC(PAL.glowMush,0.04));
     BIO.put('sh_glowmush_card',[mx+rr(-0.35,0.35),fy-0.02,mz+rr(-0.35,0.35)],qEuler(0,rr(0,TAU),0),[sc*1.15,sc*1.15,sc*1.15],pickC(PAL.glowMush,0.03));
     recordPlaced('fenestreglowmush',mx,fy,mz,'fenestrecavern',{skyOpenness01:0.01,crop:'glow-mushroom'});
    }else{
     BIO.put('sh_alecap',[mx,fy-0.02,mz],qEuler(0,rr(0,TAU),0),[sc,sc*1.15,sc],pickC(PAL.alecap,0.04));
     BIO.put('sh_alecap_card',[mx+rr(-0.35,0.35),fy-0.02,mz+rr(-0.35,0.35)],qEuler(0,rr(0,TAU),0),[sc*1.15,sc*1.15,sc*1.15],pickC(PAL.alecap,0.03));
     recordPlaced('karstalecap',mx,fy,mz,'fenestrecavern',{skyOpenness01:0.01,crop:'alecap'});
    }
    st.cavernFungi++;
   }
  }

  // ---------------------------------------------------------------- 2. SAPPHIRE SPRING-RUN CYPRESS, TUPELO, WATERCRESS & SPONGES
  if(skey==='spring'||skey==='shutin'||skey==='porphyryrelict'){
   const nCells=Math.ceil((R*2)/15);
   for(let iz=0;iz<nCells;iz++)for(let ix=0;ix<nCells;ix++){
    const cx=-R+(ix+0.5)*15,cz=-R+(iz+0.5)*15;
    if(Math.hypot(cx,cz)>R*0.92)continue;
    reseed(KRAND.cell(seed+210,ix,iz));
    const px=cx+rr(-5.5,5.5),pz=cz+rr(-5.5,5.5);
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,8.5))continue;
    const py=Y(px,pz),wy0=W(px,pz);
    const wy=wy0>-1e5?wy0:Math.max(W(px+9,pz),W(px-9,pz),W(px,pz+9),W(px,pz-9));
    if(wy<-1e5)continue;
    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    if((skey==='shutin'||skey==='porphyryrelict')&&dk.inDike)continue;
    const relY=py-wy;
    const inChan=wy0>-1e5;
    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+210,ix,iz);

    // Bald-cypress & buttress-tupelo stands on shallow spring shoal shelves & levees (0.42 .. 2.45 m above +18 C spring water)
    if(skey!=='porphyryrelict'&&(!inChan||py>wy0+0.42)&&relY>=0.42&&relY<=2.45&&free(px,pz,5.2)&&rng()<=0.74*q){
     if(relY>0.72&&rng()<0.42){
      claim('tupelo',px,pz,4.8);
      const sc=rr(0.84,1.14);
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('springtupelo',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.tupelo,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('springtupelo',px,py,pz,'springrun',{relWaterM:+relY.toFixed(2),inBleachBelt:false});
     }else{
      claim('cypress',px,pz,5.6);
      const sc=rr(0.86,1.14);
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('springcypress',px,py,pz,tSeed,sc,{wetFeet:relY<1.05});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.cypress,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('springcypress',px,py,pz,'springrun',{relWaterM:+relY.toFixed(2)});
     }
     if(relY<=0.85&&rng()<0.65){
      const wx=px+rr(-2.4,2.4),wz=pz+rr(-2.4,2.4),wySurf=W(wx,wz),wpy=Y(wx,wz);
      if(wySurf>-1e5&&wpy>=wySurf-0.45&&wpy<=wySurf+0.42){
       const wsc=rr(0.32,0.58);
       BIO.put('sh_watercress',[wx,wpy-0.02,wz],qEuler(0,rr(0,TAU),0),[wsc,wsc*0.85,wsc],pickC(PAL.watercress,0.03));
       recordPlaced('artesianwatercress',wx,wpy,wz,'springrun',{relWaterM:+(wpy-wySurf).toFixed(2)});
      }
     }
    }else if((!inChan||py>wy0+0.45)&&relY>2.45&&relY<=3.25&&free(px,pz,4.6)&&rng()<0.52*q){
     // Artesian buttress-tupelo along moist spring levees & calm dolomite pool banks (strictly py > wy0 + 0.42 m!)
     claim('tupelo',px,pz,4.6);
     const sc=rr(0.82,1.12);
     if(dCam<NEAR_TREE_R||!IMP){
      SPRINGHOLLOWS.growTree('springtupelo',px,py,pz,tSeed,sc,{});
     }else{
      BIO.impostorPut('sh_imp_trees',IMP.tupelo,[px,py,pz],rr(0,TAU),sc,null);
     }
     recordPlaced('springtupelo',px,py,pz,'springrun',{relWaterM:+relY.toFixed(2),inBleachBelt:false});
    }else if(inChan&&relY>=-0.45&&relY<=0.42&&rng()<0.72*q){
     // Emergent +18 C sapphire spring-boil artesianwatercress clumps
     const sc=rr(0.32,0.62);
     BIO.put('sh_watercress',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[sc,sc*0.85,sc],pickC(PAL.watercress,0.03));
     recordPlaced('artesianwatercress',px,py,pz,'springrun',{relWaterM:+relY.toFixed(2)});
    }else if(inChan&&relY>=-1.15&&relY<=-0.08&&rng()<0.55*q){
     // Submerged emerald-turquoise springsponge cushions on +18 C chert gravel bars
     const sc=rr(0.24,0.52);
     BIO.put('sh_springsponge',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[sc*1.3,sc*0.55,sc*1.3],pickC(PAL.sponge,0.04));
     recordPlaced('springsponge',px,py,pz,'springrun',{submerged:true});
    }
   }
  }

  // Ensure every station has springsponge representation around karst seeps/sumps
  if(st.springsponge===0&&site.cavern){
   const hx=site.cavern.hall[0],hz=site.cavern.hall[1];
   for(let i=0;i<14;i++){
    reseed(KRAND.hash(seed+235,i,1));
    const px=hx+rr(-12,18),pz=hz+rr(-10,16),py=cavern&&cavern.floorH?cavern.floorH(px,pz):site.cavern.floorY;
    const sc=rr(0.24,0.48);
    BIO.put('sh_springsponge',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[sc*1.2,sc*0.5,sc*0.5+0.7*sc],pickC(PAL.sponge,0.03));
    recordPlaced('springsponge',px,py,pz,'springrun',{submerged:true});
   }
  }

  // ---------------------------------------------------------------- 3. HIGH-RIA SAFFRON, WHORL-OLIVE & WILD-TEA DRY-STONE TERRACES
  const terrList=(site.terraces&&site.terraces.length)?site.terraces:[{x:-136,z:94,r:38}];
  for(let t=0;t<terrList.length;t++){
   const tr=terrList[t];
   if(reg&&site.terraces&&site.terraces.length){
    reg({
     tagId:'springhollows:terrace-'+skey+'-'+t,
     name:'High-Ria Terraced Whorl-Olive, Saffron & Wild-Tea Bench',
     tagClass:'flora',
     x:tr.x,y:Y(tr.x,tr.z),z:tr.z,r:tr.r,h:12,
     tags:{biome:'springhollows',culture:'ria',crops:'whorl-olive,saffron,tea'}
    });
   }
   const step=11.0,nr=Math.ceil((tr.r*1.6)/step);
   for(let j=-nr;j<=nr;j++)for(let i=-nr;i<=nr;i++){
    const px=tr.x+i*step+0.8*(i%2),pz=tr.z+j*step;
    if(Math.hypot(px-tr.x,pz-tr.z)>tr.r*0.92)continue;
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,6.5))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.45)continue;
    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    const scar=HOLLOW_PHYS.ecocideScarAt(px,pz,site);
    if(dk.inDike||scar.inBleachBelt)continue;
    reseed(KRAND.hash(seed+310+t*31,i+50,j+50));
    if((i+j)%2===0&&free(px,pz,3.8)){
     claim('olive',px,pz,3.8);
     SPRINGHOLLOWS.growTree('whorlolive',px,py,pz,KRAND.hash(seed+320,i+50,j+50),rr(0.85,1.12),{});
     recordPlaced('whorlolive',px,py,pz,'dolomitebench',{crop:'whorl-olive',inBleachBelt:false});
    }else if(free(px,pz,2.4)&&rng()<0.62*q){
     claim('wildtea',px,pz,2.4);
     SPRINGHOLLOWS.growTree('karstwildtea',px,py,pz,KRAND.hash(seed+325,i+50,j+50),rr(0.84,1.16),{});
     recordPlaced('karstwildtea',px,py,pz,'dolomitebench',{crop:'tea',inBleachBelt:false});
    }
    for(let s=0;s<3;s++){
     const sx=px+rr(-3.2,3.2),sz=pz+rr(-3.2,3.2),sy=Y(sx,sz),swy=W(sx,sz);
     if(swy>-1e5&&sy<=swy+0.45)continue;
     if(HOLLOW_PHYS.ecocideScarAt(sx,sz,site).inBleachBelt)continue;
     const sc=rr(0.30,0.50);
     BIO.put('sh_saffron_tuft',[sx,sy-0.03,sz],qEuler(0,rr(0,TAU),0),[sc,sc*0.85,sc],pickC(PAL.saffron,0.03));
     recordPlaced('karstsaffron',sx,sy,sz,'dolomitebench',{crop:'saffron',inBleachBelt:false});
    }
   }
  }

  // ---------------------------------------------------------------- 4. PLATEAU WOODLAND, WEEPING-BORDER STORAX & PORPHYRY CRAZY-QUILT
  {
   const cell=18.0,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.96)continue;
    reseed(KRAND.cell(seed+410,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,8.0))continue;
    const py=Y(px,pz),wy=W(px,pz);
    // Strict upland channel exclusion: woody trees stay > +0.42 m above any river/spring surface!
    if(wy>-1e5&&py<=wy+0.42)continue;
    const sl=fRock(px,pz);
    if(sl>0.78)continue;

    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    const scar=HOLLOW_PHYS.ecocideScarAt(px,pz,site);
    // Exclude mature canopy & calciphile trees from sterilized Ancient defoliant bleach-belt hardpan core (PLAN.md section 7.3 #4)
    if(scar.inBleachBelt)continue;

    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+410,ix,iz);

    if(dk.inDike){
     // 25% Red Edaphic Porphyry-Knob Crazy-Quilt:
     //   - Station 5 (porphyryrelict): high purple-red porphyry knob (> +15.5 m) crowned in Carnelian Erythrophyll clades
     //   - Station 2 (shutin) & Station 4 (glade): sun-baked porphyry-dike knobs carry edaphic relict Carnelian pockets
     if(hasKF&&(skey==='porphyryrelict'||skey==='shutin'||skey==='glade')){
      const rq=HOLLOW_PHYS.porphyryRelictQuiltAt(px,pz,py,site);
      const knobCar=(skey==='porphyryrelict'&&rq.biosphere==='carnelian'&&py>15.5)
       ||(skey==='shutin'&&rq.biosphere==='carnelian'&&py>20.5&&rng()<0.42)
       ||(skey==='glade'&&rq.biosphere==='carnelian'&&py>16.0&&rng()<0.46);
      if(knobCar){
       if(rng()>0.74*q||!free(px,pz,3.6))continue;
       claim('carnelian',px,pz,3.6);
       const sc=rr(0.84,1.18),kfCfg={bucket:'sh_chitin',skelBucket:'sh_chitin',prefix:'sh_kf',sunAzimuthRad:0.65};
       if(rng()<0.38&&dCam<225){
        KFRONTIER.growErythraVeil(BIO,kfCfg,px,py,pz,tSeed,sc);
        recordPlaced('erythra_veil',px,py,pz,'porphyryglade',{inDike:true,biosphere:'carnelian',clade:'erythra-veil'});
       }else{
        KFRONTIER.growOrganPipe(BIO,kfCfg,px,py,pz,tSeed,sc,{});
        recordPlaced('carnelian_organpipe',px,py,pz,'porphyryglade',{inDike:true,biosphere:'carnelian',clade:'carnelian-organpipe'});
       }
       continue;
      }
     }
     // Shut-In Red-Rock Pine strictly confined to inDike === true!
     if(rng()>0.58*q||!free(px,pz,4.2))continue;
     claim('pine',px,pz,4.2);
     const sc=rr(0.82,1.16);
     if(dCam<NEAR_TREE_R||!IMP){
      SPRINGHOLLOWS.growTree('porphyrypine',px,py,pz,tSeed,sc,{});
     }else{
      BIO.impostorPut('sh_imp_trees',IMP.pine,[px,py,pz],rr(0,TAU),sc,null);
     }
     recordPlaced('porphyrypine',px,py,pz,'porphyryglade',{inDike:true});
    }else{
     if(skey==='porphyryrelict'&&site.mistPylon&&Math.hypot(px-site.mistPylon.x,pz-site.mistPylon.z)<18.0)continue;
     if(rng()>0.66*q||!free(px,pz,4.6))continue;
     const uSp=rng();
     const warmWest=px<45?0.08:0.0;
     if(dCam<165&&uSp<0.10&&(fWet(px,pz)>0.12||py<14.0)){
      claim('spicebush',px,pz,2.8);
      SPRINGHOLLOWS.growTree('fenestrespicebush',px,py,pz,tSeed,rr(0.85,1.18),{});
      recordPlaced('fenestrespicebush',px,py,pz,'fenestrecavern',{inBleachBelt:false});
     }else if(dCam<175&&uSp>=0.10&&uSp<0.24){
      claim('redbud',px,pz,3.2);
      SPRINGHOLLOWS.growTree('redbudkarst',px,py,pz,tSeed,rr(0.84,1.16),{});
      recordPlaced('redbudkarst',px,py,pz,'dolomitebench',{inBleachBelt:false});
     }else if(uSp>=0.24&&uSp<0.40+warmWest){
      claim('storax',px,pz,4.6);
      const sc=rr(0.86,1.16);
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('weepingamberstorax',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.storax,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('weepingamberstorax',px,py,pz,'dolomitebench',{inBleachBelt:false,amberResin:true});
     }else if(uSp>=0.40+warmWest&&uSp<0.58+warmWest){
      claim('hornbeam',px,pz,4.2);
      const sc=rr(0.84,1.15);
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('dolomitehornbeam',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.hornbeam,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('dolomitehornbeam',px,py,pz,'dolomitebench',{inBleachBelt:false});
     }else{
      claim('oak',px,pz,4.8);
      const sc=rr(0.84,1.16);
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('chinkapinoak',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.oak,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('chinkapinoak',px,py,pz,'dolomitebench',{inBleachBelt:false});
     }
    }
   }
  }

  // ---------------------------------------------------------------- 5. GOSSAN METALLOPHYTES, BLEACH-SCAR SEAM & PORPHYRY BALDS
  {
   const cell=13.0,N=Math.ceil((R*1.6)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.8+(ix+0.5)*cell,cz=-R*0.8+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.82)continue;
    reseed(KRAND.cell(seed+510,ix,iz));
    const px=cx+rr(-0.44,0.44)*cell,pz=cz+rr(-0.44,0.44)*cell;
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,4.2))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.22)continue;

    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    const scar=HOLLOW_PHYS.ecocideScarAt(px,pz,site);

    // Ancient bleach-belt seam (Station 4 glade): stranglervine + Carnelian blood_strangler + vanguard bleachfireweed!
    if(scar.stranglerFront01>0.24&&!scar.inBleachBelt){
     if(scar.stranglerFront01>0.38&&rng()<0.78*q){
      const sc=rr(0.85,1.65);
      BIO.put('sh_strangler_arch',[px,py-0.08,pz],qEuler(rr(-0.2,0.2),rr(0,TAU),rr(-0.2,0.2)),[sc,sc*1.35,sc],pickC(PAL.strangler,0.04));
      BIO.put('sh_strangler_pod',[px+rr(-0.4,0.4),py+0.35,pz+rr(-0.4,0.4)],qEuler(0,rr(0,TAU),0),[sc*0.55,sc*0.55,sc*0.55],pickC(PAL.strangler,0.04));
      recordPlaced('stranglervine',px,py,pz,'bleachscar',{stranglerFront01:scar.stranglerFront01});
      if(hasKF&&rng()<0.58){
       const bx=px+rr(-1.6,1.6),bz=pz+rr(-1.6,1.6),by=Y(bx,bz);
       KFRONTIER.putBloodStrangler(BIO,'sh_kf',bx,by,bz,KRAND.hash(seed+522,ix,iz),rr(0.75,1.25));
       recordPlaced('blood_strangler',bx,by,bz,'bleachscar',{biosphere:'carnelian',clade:'blood-strangler',stranglerFront01:scar.stranglerFront01});
      }
      if(rng()<0.62){
       const fx=px+rr(-2.0,2.0),fz=pz+rr(-2.0,2.0),fy=Y(fx,fz);
       const fSc=rr(0.55,1.05);
       BIO.put('sh_fireweed',[fx,fy-0.03,fz],qEuler(0,rr(0,TAU),0),[fSc,fSc*1.15,fSc],pickC(PAL.fireweed,0.03));
       recordPlaced('bleachfireweed',fx,fy,fz,'bleachscar',{stranglerFront01:scar.stranglerFront01});
      }
      continue;
     }else if(rng()<0.64*q){
      const fSc=rr(0.55,1.08);
      BIO.put('sh_fireweed',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*1.15,fSc],pickC(PAL.fireweed,0.03));
      recordPlaced('bleachfireweed',px,py,pz,'bleachscar',{stranglerFront01:scar.stranglerFront01});
      continue;
     }
    }
    if(scar.inBleachBelt){
     if(rng()<0.18){
      const rSc=rr(0.45,1.15);
      BIO.put('sh_rock_dolomite',[px,py-rSc*0.35,pz],qEuler(rr(-0.15,0.15),rr(0,TAU),0),[rSc*1.2,rSc*0.65,rSc],C(0xebe7dc));
      st.boulders++;
     }
     continue;
    }

    // Station 5 (porphyryrelict): blood_strangler & bleachfireweed along the lower porphyry mist-pylon kill-line transition
    if(skey==='porphyryrelict'&&Math.abs(dk.signedDistM)<16.0&&py>=9.5&&py<=18.5&&rng()<0.54*q){
     if(hasKF&&dk.inDike){
      KFRONTIER.putBloodStrangler(BIO,'sh_kf',px,py,pz,KRAND.hash(seed+530,ix,iz),rr(0.75,1.22));
      recordPlaced('blood_strangler',px,py,pz,'bleachscar',{inDike:true,biosphere:'carnelian',clade:'blood-strangler'});
     }else{
      const fSc=rr(0.52,1.02);
      BIO.put('sh_fireweed',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*1.15,fSc],pickC(PAL.fireweed,0.03));
      recordPlaced('bleachfireweed',px,py,pz,'bleachscar',{mistPoolTransition:true});
     }
     continue;
    }

    // Calamine fern + sky-blue sori + zincviolet over mineralized MVT Pb-Zn porphyry-dolomite contact
    if(Math.abs(dk.signedDistM)<34.0&&rng()<0.60*q){
     const fSc=rr(0.42,0.78);
     BIO.put('sh_calaminefern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc,fSc],pickC(PAL.calamine,0.03));
     BIO.put('sh_sori_cluster',[px,py+0.04,pz],qEuler(0,rr(0,TAU),0),[fSc*0.38,fSc*0.22,fSc*0.38],pickC(PAL.soriBlue,0.02));
     recordPlaced('calaminefern',px,py,pz,'shutingorge',{dikeDistM:+Math.abs(dk.signedDistM).toFixed(1),zinc:90});
     if(rng()<0.52){
      const vx=px+rr(-1.2,1.2),vz=pz+rr(-1.2,1.2),vy=Y(vx,vz);
      if(wy<-1e5||vy>wy+0.25){
       const vSc=rr(0.28,0.52);
       BIO.put('sh_zincviolet',[vx,vy-0.02,vz],qEuler(0,rr(0,TAU),0),[vSc*1.15,vSc*0.75,vSc*1.15],pickC(PAL.zincviolet,0.03));
       recordPlaced('zincviolet',vx,vy,vz,'shutingorge',{dikeDistM:+Math.abs(dk.signedDistM).toFixed(1),zinc:90});
      }
     }
     if(rng()<0.35){
      const oSc=rr(0.28,0.58);
      BIO.put('sh_ore_galena',[px+rr(-0.5,0.5),py-oSc*0.25,pz+rr(-0.5,0.5)],qEuler(0.1,rr(0,TAU),0),[oSc,oSc*0.8,oSc],pickC(PAL.galena,0.02));
     }
    }else if(dk.inDike){
     const sunKnob=(skey==='porphyryrelict'&&py>14.5)||(skey==='shutin'&&py>16.5)||(skey==='glade'&&py>14.0);
     if(hasKF&&sunKnob&&rng()<(skey==='porphyryrelict'?0.64:0.42)*q){
      KFRONTIER.putAgateWindow(BIO,'sh_kf',px,py,pz,KRAND.hash(seed+545,ix,iz),rr(0.75,1.35),false);
      recordPlaced('agate_window',px,py,pz,'porphyryglade',{inDike:true,biosphere:'carnelian',clade:'agate-window'});
     }else if(rng()<0.48*q){
      const gSc=rr(0.48,0.92);
      BIO.put('sh_gladegrass',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[gSc,gSc*0.9,gSc],pickC(PAL.gladegrass,0.04));
     }
     if(rng()<0.24*q){
      const bSc=rr(0.85,2.35);
      BIO.put('sh_rock_porphyry',[px,py-bSc*0.34,pz],qEuler(rr(-0.14,0.14),rr(0,TAU),rr(-0.14,0.14)),[bSc*1.15,bSc*0.88,bSc],pickC(PAL.porphyry,0.03));
      st.boulders++;
     }
    }else{
     const wetVal=fWet(px,pz);
     if(wetVal>0.40&&rng()<0.36*q){
      const mhSc=rr(0.38,0.70);
      BIO.put('sh_maidenhair',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[mhSc,mhSc*0.85,mhSc],pickC(PAL.maidenhair,0.03));
      recordPlaced('travertinemaidenhair',px,py,pz,'fenestrecavern',{wet01:+wetVal.toFixed(3)});
     }else if(rng()<0.42*q){
      const fSc=rr(0.46,0.88);
      BIO.put('sh_floorfern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*0.85,fSc],pickC(PAL.floorfern,0.04));
     }
     if(wetVal>0.35&&rng()<0.44*q){
      const mSc=rr(0.65,1.25);
      BIO.put('sh_moss',[px,py+0.01,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.moss,0.03));
     }
     if(wetVal>0.30&&rng()<0.10*q){
      const lLen=rr(2.2,4.4),lRad=rr(0.75,1.25);
      BIO.put('sh_log',[px,py+0.12*lRad,pz],qEuler(Math.PI*0.5,rr(0,TAU),rr(-0.08,0.08)),[lRad,lLen,lRad],C(0x6e5844));
     }
     if(rng()<0.14*q){
      const dSc=rr(0.75,1.95);
      BIO.put('sh_rock_dolomite',[px,py-dSc*0.35,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[dSc*1.15,dSc*0.78,dSc],pickC(PAL.dolomite,0.02));
      st.boulders++;
     }
    }
   }
  }

  if(skey==='porphyryrelict'){
   if(st.springsponge===0){
    for(let i=0;i<12;i++){
     reseed(KRAND.hash(seed+580,i,1));
     const px=-88+rr(-10,10),pz=-24+rr(-10,10),py=Y(px,pz),sc=rr(0.24,0.46);
     BIO.put('sh_springsponge',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[sc*1.2,sc*0.5,sc*1.2],pickC(PAL.sponge,0.03));
     recordPlaced('springsponge',px,py,pz,'springrun',{submerged:true});
    }
   }
   if(reg){
    reg({
     tagId:'springhollows:porphyry-carnelian-crown',
     name:'High Purple-Red Porphyry Carnelian Erythrophyll Sky-Island Refuge',
     tagClass:'flora',
     x:12,y:Y(12,8)-4,z:8,r:56,h:28,
     tags:{biome:'springhollows',biosphere:'carnelian',lithology:'porphyry-dike'}
    });
   }
  }

  if(skey==='glade'&&reg&&site.bleachScar){
   reg({
    tagId:'springhollows:ancient-bleach-scar',
    name:'Ancient Incomplete-Ecocide Defoliant Bleach-Belt & Strangler-Front',
    tagClass:'feature',
    x:site.bleachScar.cx,y:Y(site.bleachScar.cx,site.bleachScar.cz),z:site.bleachScar.cz,
    r:site.bleachScar.halfWidthM*1.4,h:14,
    tags:{biome:'springhollows',origin:'ancient-ecocide',yearsPostCataclysm:site.yearsPostCataclysm}
   });
  }

  return st;
 };
})();
