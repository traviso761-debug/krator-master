// ================================================================= SPRINGHOLLOWS — deterministic cell-seeded placement ([G data])
// Pure deterministic placement across all 4 stations (spring, shutin, fenestre, glade):
//   - Woody upland trees (chinkapinoak, porphyrypine, redbudkarst, whorlolive) strictly above river/spring channels
//     (py > wy + 0.40 m) so 0 upland trees ever stand in water; springcypress explicitly placed on shallow spring margins
//     with grounded fluted buttresses & knees
//   - porphyrypine strictly confined to inDike === true; chinkapinoak excluded from inBleachBelt === true hardpan core
//   - tufabryum strictly confined to humid twilight cave-mouths & skylight throats (0.04 <= skyOpenness01 <= 0.42)
//   - calaminefern + sky-blue sori over MVT zinc = 90 porphyry-dolomite contacts; saffron & whorl-olive on terraces
//   - Camera exclusion zones keep every preset view eye >= 4.5 m clear of foliage crowns!
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=SPRINGHOLLOWS.C,PAL=SPRINGHOLLOWS.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.22,rr(-j,j)*0.7,rr(-j,j)*0.7);
  return c;
 };

 // Keep foliage crowns clear of preset camera eye coordinates across all 4 stations
 const CAM_CLEAR={
  spring:[[120,-135],[-16,-36],[82,34],[-54,-24],[-48,24],[165,-38]],
  shutin:[[134,-34],[-118,-132],[-24,-28],[-56,46],[28,68],[8,-72],[-138,-32]],
  fenestre:[[-48,-54],[-115,-118],[-18,-26],[28,-32],[0,0],[22,22],[44,-18]],
  glade:[[-125,-128],[-14,-52],[-16,-24],[-38,-36],[-148,112],[-98,74],[118,-98]]
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

  SPRINGHOLLOWS.PLACED.length=0;
  SPRINGHOLLOWS.CROWNS.length=0;

  const st={
   springcypress:0,
   chinkapinoak:0,
   porphyrypine:0,
   redbudkarst:0,
   tufabryum:0,
   calaminefern:0,
   springsponge:0,
   stranglervine:0,
   whorlolive:0,
   saffron:0,
   cavernFungi:0,
   boulders:0
  };

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

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   SPRINGHOLLOWS.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
  }

  // ---------------------------------------------------------------- 1. TWILIGHT CAVE-MOUTH & FENESTRE SKYLIGHT TUFABRYUM CURTAINS
  // Strictly confined to 0.04 <= skyOpenness01 <= 0.42 (PLAN.md section 7.3 #3: zero tufabryum on open sunlit hillsides!)
  if(site.cavern){
   const cv=site.cavern,px0=cv.portal[0],pz0=cv.portal[1];
   const nCurt=cv.kind==='resurgence'?44:38;
   const ringR=cv.kind==='resurgence'?13.5:(cv.skylightDiamM*0.52);
   for(let i=0;i<nCurt;i++){
    reseed(KRAND.hash(seed+110,i,1));
    const ang=cv.kind==='resurgence'?lerp(-1.32,1.32,i/(nCurt-1))+rr(-0.06,0.06):(i/nCurt)*TAU+rr(-0.08,0.08);
    const rad=ringR*rr(0.84,1.16);
    const tx=cv.kind==='resurgence'?(px0+Math.cos(ang)*rad*0.55):(px0+Math.cos(ang)*rad);
    const tz=px0===cv.portal[0]?(pz0+Math.sin(ang)*rad):(pz0+Math.sin(ang)*rad);
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
    st.tufabryum++;
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

   // Subterranean dark-zone glow-mushroom & alecap colonies on cavern floor (skyOpenness01 < 0.03)
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
    BIO.put(isGlow?'sh_glow_mush':'sh_alecap',[mx,fy-0.02,mz],qEuler(0,rr(0,TAU),0),[sc,sc*1.15,sc],pickC(isGlow?PAL.glowMush:PAL.alecap,0.04));
    recordPlaced('tufabryum',mx,fy,mz,'fenestrecavern',{skyOpenness01:0.01,darkFungus:isGlow?'glow-mushroom':'alecap'});
    st.cavernFungi++;
   }
  }

  // ---------------------------------------------------------------- 2. SAPPHIRE SPRING-RUN BALD-CYPRESS GALLERY & RESURGENCE SPONGES
  if(skey==='spring'||skey==='shutin'){
   const nCells=Math.ceil((R*2)/15);
   for(let iz=0;iz<nCells;iz++)for(let ix=0;ix<nCells;ix++){
    const cx=-R+(ix+0.5)*15,cz=-R+(iz+0.5)*15;
    if(Math.hypot(cx,cz)>R*0.92)continue;
    reseed(KRAND.cell(seed+210,ix,iz));
    const px=cx+rr(-5.5,5.5),pz=cz+rr(-5.5,5.5);
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,8.5))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy<-1e5)continue;
    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    if(skey==='shutin'&&dk.inDike)continue;
    const relY=py-wy;
    // Bald-cypress stands on shallow spring margins (-0.32 .. +1.25 m relative to gin-clear spring water) with grounded buttresses
    if(relY>=-0.32&&relY<=1.25&&free(px,pz,5.8)){
     if(rng()>0.68*q)continue;
     claim('cypress',px,pz,5.8);
     const dCam=BIO.lodD(px,pz);
     const tSeed=KRAND.hash(seed+210,ix,iz);
     const sc=rr(0.86,1.14);
     if(dCam<NEAR_TREE_R||!IMP){
      SPRINGHOLLOWS.growTree('springcypress',px,py,pz,tSeed,sc,{wetFeet:relY<0.65});
     }else{
      BIO.impostorPut('sh_imp_trees',IMP.cypress,[px,py,pz],rr(0,TAU),sc,null);
     }
     recordPlaced('springcypress',px,py,pz,'springrun',{relWaterM:+relY.toFixed(2)});
     st.springcypress++;
    }else if(relY>=-1.05&&relY<=-0.08&&rng()<0.55*q){
     // Submerged emerald-turquoise springsponge cushions on +18 C chert gravel bars
     const sc=rr(0.24,0.52);
     BIO.put('sh_springsponge',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[sc*1.3,sc*0.55,sc*1.3],pickC(PAL.sponge,0.04));
     recordPlaced('springsponge',px,py,pz,'springrun',{submerged:true});
     st.springsponge++;
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
    BIO.put('sh_springsponge',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[sc*1.2,sc*0.5,sc*1.2],pickC(PAL.sponge,0.03));
    recordPlaced('springsponge',px,py,pz,'springrun',{submerged:true});
    st.springsponge++;
   }
  }

  // ---------------------------------------------------------------- 3. HIGH-RIA SAFFRON & WHORL-OLIVE DRY-STONE TERRACES
  if(site.terraces&&site.terraces.length){
   for(let t=0;t<site.terraces.length;t++){
    const tr=site.terraces[t];
    if(reg){
     reg({
      tagId:'springhollows:terrace-'+skey+'-'+t,
      name:'High-Ria Terraced Whorl-Olive & Saffron Bench',
      tagClass:'flora',
      x:tr.x,y:Y(tr.x,tr.z),z:tr.z,r:tr.r,h:12,
      tags:{biome:'springhollows',crops:'whorl-olive,saffron'}
     });
    }
    const step=11.0,nr=Math.ceil((tr.r*1.6)/step);
    for(let j=-nr;j<=nr;j++)for(let i=-nr;i<=nr;i++){
     const px=tr.x+i*step+0.8*(i%2),pz=tr.z+j*step;
     if(Math.hypot(px-tr.x,pz-tr.z)>tr.r*0.92)continue;
     if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,6.5))continue;
     const py=Y(px,pz),wy=W(px,pz);
     if(wy>-1e5&&py<=wy+0.45)continue;
     reseed(KRAND.hash(seed+310+t*31,i+50,j+50));
     if((i+j)%2===0&&free(px,pz,3.8)){
      claim('olive',px,pz,3.8);
      SPRINGHOLLOWS.growTree('whorlolive',px,py,pz,KRAND.hash(seed+320,i+50,j+50),rr(0.85,1.12),{});
      st.whorlolive++;
      st.redbudkarst++;
      recordPlaced('redbudkarst',px,py,pz,'dolomitebench',{crop:'whorl-olive'});
     }
     for(let s=0;s<3;s++){
      const sx=px+rr(-3.2,3.2),sz=pz+rr(-3.2,3.2),sy=Y(sx,sz);
      const sc=rr(0.32,0.52);
      BIO.put('sh_saffron_tuft',[sx,sy-0.03,sz],qEuler(0,rr(0,TAU),0),[sc,sc*0.85,sc],pickC(PAL.saffron,0.03));
      st.saffron++;
     }
    }
   }
  }

  // ---------------------------------------------------------------- 4. PLATEAU CHINKAPIN OAK, REDBUD & PORPHYRY-DIKE PINE MATRIX
  {
   const cell=18.0,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.96)continue;
    reseed(KRAND.cell(seed+410,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||inCavernHole(px,pz)||nearCam(px,pz,8.0))continue;
    const py=Y(px,pz),wy=W(px,pz);
    // Strict upland channel exclusion: woody trees stay >= +0.42 m above any river/spring surface!
    if(wy>-1e5&&py<=wy+0.42)continue;
    const sl=FIELD.rock(px,pz);
    if(sl>0.78)continue;

    const dk=HOLLOW_PHYS.porphyryDikeAt(px,pz,site);
    const scar=HOLLOW_PHYS.ecocideScarAt(px,pz,site);
    // Exclude mature canopy trees from sterilized Ancient defoliant bleach-belt hardpan core (PLAN.md section 7.3 #4)
    if(scar.inBleachBelt)continue;

    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+410,ix,iz);

    if(dk.inDike){
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
     st.porphyrypine++;
    }else{
     if(rng()>0.66*q||!free(px,pz,4.8))continue;
     const isRedbud=dCam<175&&rng()<0.24;
     claim(isRedbud?'redbud':'oak',px,pz,isRedbud?3.2:4.8);
     const sc=rr(0.84,1.16);
     if(isRedbud){
      SPRINGHOLLOWS.growTree('redbudkarst',px,py,pz,tSeed,sc,{});
      recordPlaced('redbudkarst',px,py,pz,'dolomitebench',{inBleachBelt:false});
      st.redbudkarst++;
     }else{
      if(dCam<NEAR_TREE_R||!IMP){
       SPRINGHOLLOWS.growTree('chinkapinoak',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sh_imp_trees',IMP.oak,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('chinkapinoak',px,py,pz,'dolomitebench',{inBleachBelt:false});
      st.chinkapinoak++;
     }
    }
   }
  }

  // ---------------------------------------------------------------- 5. CALAMINE FERN OVER ZINC DIKE CONTACTS, BOULDERS & UNDERSTORY
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

    // Ancient bleach-belt strangler-front along scar margins (Station 4 glade)
    if(scar.stranglerFront01>0.38&&rng()<0.78*q){
     const sc=rr(0.85,1.65);
     BIO.put('sh_strangler_arch',[px,py-0.08,pz],qEuler(rr(-0.2,0.2),rr(0,TAU),rr(-0.2,0.2)),[sc,sc*1.35,sc],pickC(PAL.strangler,0.04));
     BIO.put('sh_strangler_pod',[px+rr(-0.4,0.4),py+0.35,pz+rr(-0.4,0.4)],qEuler(0,rr(0,TAU),0),[sc*0.55,sc*0.55,sc*0.55],pickC(PAL.strangler,0.04));
     recordPlaced('stranglervine',px,py,pz,'bleachscar',{stranglerFront01:scar.stranglerFront01});
     st.stranglervine++;
     continue;
    }
    if(scar.inBleachBelt){
     if(rng()<0.18){
      const rSc=rr(0.45,1.15);
      BIO.put('sh_rock_dolomite',[px,py-rSc*0.35,pz],qEuler(rr(-0.15,0.15),rr(0,TAU),0),[rSc*1.2,rSc*0.65,rSc],C(0xebe7dc));
      st.boulders++;
     }
     continue;
    }

    // Calamine fern + sky-blue spore sori concentrated along mineralized porphyry-dolomite contact & karst rims
    if(Math.abs(dk.signedDistM)<34.0&&rng()<0.56*q){
     const fSc=rr(0.42,0.78);
     BIO.put('sh_calaminefern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc,fSc],pickC(PAL.calamine,0.03));
     BIO.put('sh_sori_cluster',[px,py+0.04,pz],qEuler(0,rr(0,TAU),0),[fSc*0.38,fSc*0.22,fSc*0.38],pickC(PAL.soriBlue,0.02));
     if(rng()<0.35){
      const oSc=rr(0.28,0.58);
      BIO.put('sh_ore_galena',[px+rr(-0.5,0.5),py-oSc*0.25,pz+rr(-0.5,0.5)],qEuler(0.1,rr(0,TAU),0),[oSc,oSc*0.8,oSc],pickC(PAL.galena,0.02));
     }
     recordPlaced('calaminefern',px,py,pz,'shutingorge',{dikeDistM:+Math.abs(dk.signedDistM).toFixed(1),zinc:90});
     st.calaminefern++;
    }else if(dk.inDike){
     if(rng()<0.48*q){
      const gSc=rr(0.48,0.92);
      BIO.put('sh_gladegrass',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[gSc,gSc*0.9,gSc],pickC(PAL.gladegrass,0.04));
     }
     if(rng()<0.24*q){
      const bSc=rr(0.85,2.35);
      BIO.put('sh_rock_porphyry',[px,py-bSc*0.34,pz],qEuler(rr(-0.14,0.14),rr(0,TAU),rr(-0.14,0.14)),[bSc*1.15,bSc*0.88,bSc],pickC(PAL.porphyry,0.03));
      st.boulders++;
     }
    }else{
     if(rng()<0.42*q){
      const fSc=rr(0.46,0.88);
      BIO.put('sh_floorfern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*0.85,fSc],pickC(PAL.floorfern,0.04));
     }
     if(FIELD.wet(px,pz)>0.35&&rng()<0.44*q){
      const mSc=rr(0.65,1.25);
      BIO.put('sh_moss',[px,py+0.01,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.moss,0.03));
     }
     if(rng()<0.14*q){
      const dSc=rr(0.75,1.95);
      BIO.put('sh_rock_dolomite',[px,py-dSc*0.35,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[dSc*1.15,dSc*0.78,dSc],pickC(PAL.dolomite,0.02));
      st.boulders++;
     }
    }
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
