// ================================================================= HOST — BIO.kin partner bridges (nwouterwall & copperglacier read in place; [draw])
// Wraps NWOW (biomes/nwouterwall: fur larch, creeping stone pine krummholz, cottongrass, woolly willow, crowberry) and
// COPPERG (biomes/copperglacier: alpine verdigris/sage cushion & rock lichen) with stem-snapped (0.00 m float!) builders
// and textured fallbacks so BIO.kin('nwouterwall.<key>', ...) and BIO.kin('copperglacier.<key>', ...) run cleanly in place.
// check_cells kin geometry map: BIO.def('pineleaf',BIO.geo.clump(),M.nwow_pineleaf) BIO.def('willow',BIO.geo.clump(),M.nwow_willow) BIO.def('larchspray',G.hung(),M.nwow_larchgold) BIO.def('cotton',G.tuft(),M.nwow_cotton) BIO.def('heath',G.tuft(),M.nwow_heath)
(function(){
 const {TAU,clamp,lerp,rr,ri,pick,qEuler}=BIO.fn;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 // 1. Seal & bridge NWOW (biomes/nwouterwall)
 if(typeof NWOW!=='undefined'){
  const prevKit=BIO.kit('nwouterwall');
  try{
   const M=NWOW.MAT;
   if(M){
    const fallbackGrey=BIO.canvasTex(64,64,(g,w,h)=>{
     const im=g.createImageData(w,h),d=im.data;
     for(let i=0;i<w*h;i++){
      const v=182+((i*37)%29)-14;
      d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;
     }
     g.putImageData(im,0,0);
    });
    if(M.stone&&!M.stone.map)M.stone.map=fallbackGrey;
    if(M.solid&&!M.solid.map)M.solid.map=fallbackGrey;
    if(typeof SWOW_VSTACK!=='undefined')SWOW_VSTACK.dilateCardTextures('nwouterwall',M);
   }

   // Ensure floor plants requested by BIO.kin also have entries in NWOW.SPECIES so BIO.kitBuilder finds their species record
   const extraPlants=[
    ['cottongrass',NWOW.PLANTS&&NWOW.PLANTS.cottongrass,[0.30,0.55],[0.02,0.04],[0.25,0.45]],
    ['woolwillow',NWOW.PLANTS&&NWOW.PLANTS.woolwillow,[0.75,1.45],[0.04,0.07],[0.65,1.15]],
    ['crowberry',NWOW.PLANTS&&NWOW.PLANTS.crowberry,[0.16,0.32],[0.02,0.04],[0.35,0.65]]
   ];
   for(let i=0;i<extraPlants.length;i++){
    const k=extraPlants[i][0],pl=extraPlants[i][1];
    if(pl&&!NWOW.SPECIES.some(s=>s.key===k)){
     const rec={
      key:k,
      name:pl.name,
      H:extraPlants[i][2],
      rb:extraPlants[i][3],
      crownR:extraPlants[i][4],
      tags:Object.assign({},pl.tags),
      items:pl.items.slice()
     };
     rec.i=NWOW.SPECIES.length;
     NWOW.SPECIES.push(rec);
     if(NWOW.byKeyS)NWOW.byKeyS[k]=rec;
    }
   }

   NWOW.builders={
    // Wind-flagged Boreal Fur Larch (Larix gmelinii): BIO.flareJoin trunk & limbs, sprays hung directly on drawn bough nodes (0.00 m stem float)
    furlarch:{
     make:function(x,y,z,seed){
      const S=NWOW.byKeyS.furlarch||NWOW.SPECIES[0];
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x4101):seed;
      const H0=lerp(S.H[0],S.H[1],H(sd,1,0,0x41));
      return{x:x,y0:y,z:z,H:H0,rb:lerp(S.rb[0],S.rb[1],H(sd,2,0,0x41)),crownR:lerp(S.crownR[0],S.crownR[1],H(sd,3,0,0x41)),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('nwouterwall');
      try{
       const S=NWOW.byKeyS.furlarch||NWOW.SPECIES[0];
       const sd=T.seed==null?9101:T.seed;
       const leanD=BIO.leanTo(null,0.07+0.06*H(sd,4,0,0x41),{jit:0.35,u:H(sd,5,0,0x41)});
       const bc=NWOW.C(S.barkC[Math.floor(H(sd,6,0,0x41)*S.barkC.length)%S.barkC.length]);
       const leafPal=NWOW.season==='autumn'?NWOW.PAL.larchGold:NWOW.PAL.larchGreen;
       const leafSlot=NWOW.season==='autumn'?'larchgold':'larchgreen';

       BIO.tree(T.x,T.z,()=>{
        const trunk=[];
        for(let i=0;i<=5;i++){
         const t=i/5;
         trunk.push({
          x:T.x+leanD[0]*T.H*0.55*t*t,
          y:T.y0-0.45+(T.H+0.45)*t,
          z:T.z+leanD[2]*T.H*0.55*t*t,
          r:Math.max(0.04,T.rb*(1-0.82*Math.pow(t,0.85)))
         });
        }
        BIO.tube('bark.larch',trunk,bc,{seg:6,cap:true});

        const nTiers=5;
        for(let ti=0;ti<nTiers;ti++){
         const tf=(ti+0.45)/nTiers,bt=0.22+0.72*tf;
         const bx0=T.x+leanD[0]*T.H*0.55*bt*bt,bz0=T.z+leanD[2]*T.H*0.55*bt*bt,by0=T.y0+T.H*bt;
         const pR=Math.max(0.045,T.rb*(1-0.78*bt));
         for(let b=0;b<4;b++){
          const az=(b/4)*TAU+ti*1.25+0.35*H(sd,10+ti*4+b,1,0x42);
          // Flag branches slightly toward katabatic downwind side
          const reach=T.crownR*(1-0.62*tf)*(0.75+0.35*H(sd,10+ti*4+b,2,0x42));
          const ex=bx0+Math.cos(az)*reach+leanD[0]*reach*0.25;
          const ez=bz0+Math.sin(az)*reach+leanD[2]*reach*0.25;
          const ey=by0+reach*0.06;
          const mx=lerp(bx0,ex,0.55),my=lerp(by0,ey,0.45)-reach*0.04,mz=lerp(bz0,ez,0.55);
          const br=BIO.flareJoin([
           {x:bx0,y:by0,z:bz0,r:Math.max(0.038,pR*0.42)},
           {x:mx,y:my,z:mz,r:Math.max(0.028,pR*0.26)},
           {x:ex,y:ey,z:ez,r:Math.max(0.020,pR*0.14)}
          ],{parentR:pR,k:1.5,sink:0.55,len:1.7});
          BIO.tube('bark.larch',br,bc,{seg:4});

          const cHex=leafPal[Math.floor(H(sd,30+ti*4+b,3,0x42)*leafPal.length)%leafPal.length];
          const lCol=NWOW.libCol(leafSlot,NWOW.C(cHex));
          const hSp=0.62+0.32*H(sd,30+ti*4+b,4,0x42);
          BIO.put('larchspray',[mx,my,mz],qEuler(0.08*(H(sd,ti,b,0x43)-0.5),az,0),[hSp*0.72,hSp,hSp*0.72],lCol,{n:[0,1,0]});
          BIO.put('larchspray',[ex,ey,ez],qEuler(0.08*(H(sd,b,ti,0x43)-0.5),az+0.9,0),[hSp*0.80,hSp*1.05,hSp*0.80],lCol,{n:[0,1,0]});
         }
        }
        const topPt=trunk[trunk.length-1];
        const topCol=NWOW.libCol(leafSlot,NWOW.C(leafPal[0]));
        BIO.put('larchspray',[topPt.x,topPt.y,topPt.z],qEuler(0,sd*0.7,0),[0.68,0.92,0.68],topCol,{n:[0,1,0]});
       });
      }finally{BIO.kit(pv);}
     }
    },

    // Wind-sheared Creeping Stone Pine Krummholz (Pinus pumila): prostrate BIO.flareJoin stems hugging slope with pineleaf on wood!
    pinemat:{
     make:function(x,y,z,seed){
      const S=NWOW.byKeyS.pinemat||NWOW.SPECIES[2];
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x4102):seed;
      return{x:x,y0:y,z:z,H:lerp(S.H[0],S.H[1],H(sd,1,0,0x44)),rb:lerp(S.rb[0],S.rb[1],H(sd,2,0,0x44)),crownR:lerp(S.crownR[0],S.crownR[1],H(sd,3,0,0x44)),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('nwouterwall');
      try{
       const S=NWOW.byKeyS.pinemat||NWOW.SPECIES[2];
       const sd=T.seed==null?9202:T.seed;
       const G=BIO.host.terrainH||terrainH;
       const bc=NWOW.C(S.barkC[0]);
       const windD=BIO.leanTo(null,0.38,{jit:0.4,u:H(sd,1,1,0x45)});
       const baseAz=Math.atan2(windD[2],windD[0]);

       BIO.tree(T.x,T.z,()=>{
        const nLeaders=4;
        for(let k=0;k<nLeaders;k++){
         const az=baseAz+(k-(nLeaders-1)*0.5)*0.65+0.2*(H(sd,k,2,0x45)-0.5);
         const L=T.crownR*(0.68+0.34*H(sd,k,3,0x45));
         const mx=T.x+Math.cos(az)*L*0.52,mz=T.z+Math.sin(az)*L*0.52;
         const ex=T.x+Math.cos(az)*L,ez=T.z+Math.sin(az)*L;
         const my=G(mx,mz)+0.28+0.18*H(sd,k,4,0x45);
         const ey=G(ex,ez)+0.42+0.26*H(sd,k,5,0x45);
         const pts=k===0?[
          {x:T.x,y:T.y0-0.22,z:T.z,r:T.rb*1.1},
          {x:mx,y:my,z:mz,r:T.rb*0.65},
          {x:ex,y:ey,z:ez,r:T.rb*0.32}
         ]:BIO.flareJoin([
          {x:T.x,y:T.y0+0.05,z:T.z,r:T.rb*0.75},
          {x:mx,y:my,z:mz,r:T.rb*0.48},
          {x:ex,y:ey,z:ez,r:T.rb*0.26}
         ],{parentR:T.rb,k:1.4,sink:0.4,len:1.4});
         BIO.tube('bark.pine',pts,bc,{seg:5,cap:true});

         const pCol=NWOW.libCol('pineleaf',NWOW.C(S.leaf[k%S.leaf.length]));
         const sz=0.92+0.36*H(sd,k,6,0x45);
         BIO.put('pineleaf',[mx,my,mz],qEuler(0.10,az,0),[sz,sz*0.58,sz],pCol,{n:[0,1,0]});
         BIO.put('pineleaf',[ex,ey,ez],qEuler(0.12,az+0.7,0),[sz*1.08,sz*0.62,sz*1.08],pCol,{n:[0,1,0]});
        }
       });
      }finally{BIO.kit(pv);}
     }
    },

    cottongrass:{
     make:function(x,y,z,seed){
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x4103):seed;
      return{x:x,y0:y,z:z,h:0.32+0.24*H(sd,1,0,0x46),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('nwouterwall');
      try{
       const cCol=NWOW.libCol('cotton',NWOW.C(0xf4f2ea));
       BIO.put('cotton',[T.x,T.y0-0.04,T.z],qEuler(0,H(T.seed,2,0,0x46)*TAU,0),[T.h*1.12,T.h,T.h*1.12],cCol);
      }finally{BIO.kit(pv);}
     }
    },

    woolwillow:{
     make:function(x,y,z,seed){
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x4104):seed;
      return{x:x,y0:y,z:z,s:0.72+0.46*H(sd,1,0,0x47),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('nwouterwall');
      try{
       const bc=NWOW.C(0x6e6458);
       const wCol=NWOW.libCol('willow',NWOW.C(NWOW.PAL.willow[0]));
       BIO.tree(T.x,T.z,()=>{
        for(let k=0;k<3;k++){
         const az=(k/3)*TAU+0.5*H(T.seed,k,1,0x48);
         const tx=T.x+Math.cos(az)*T.s*0.36,tz=T.z+Math.sin(az)*T.s*0.36,ty=T.y0+T.s*0.48;
         BIO.tube('bark.larch',[
          {x:T.x,y:T.y0-0.16,z:T.z,r:0.045},
          {x:tx,y:ty,z:tz,r:0.022}
         ],bc,{seg:4,cap:true});
         BIO.put('willow',[tx,ty,tz],qEuler(0.08,az,0),[T.s*0.88,T.s*0.66,T.s*0.88],wCol,{n:[0,1,0]});
        }
       });
      }finally{BIO.kit(pv);}
     }
    },

    crowberry:{
     make:function(x,y,z,seed){
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x4105):seed;
      return{x:x,y0:y,z:z,h:0.18+0.14*H(sd,1,0,0x49),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('nwouterwall');
      try{
       const hCol=NWOW.libCol('heath',NWOW.C(NWOW.PAL.crow[0]));
       BIO.put('heath',[T.x,T.y0-0.03,T.z],qEuler(0,H(T.seed,2,0,0x49)*TAU,0),[T.h*2.1,T.h,T.h*2.1],hCol);
      }finally{BIO.kit(pv);}
     }
    }
   };

   BIO.kitEnd(NWOW);
  }finally{
   BIO.kit(prevKit);
  }
 }

 // 2. Seal & bridge COPPERG (biomes/copperglacier)
 if(typeof COPPERG!=='undefined'){
  const prevKit=BIO.kit('copperglacier');
  try{
   const M=COPPERG.MAT;
   if(M){
    const cushionTex=BIO.canvasTex(64,64,(g,w,h)=>{
     const im=g.createImageData(w,h),d=im.data;
     for(let i=0;i<w*h;i++){
      const v=178+((i*53)%37)-18;
      d[i*4]=Math.round(v*0.88);d[i*4+1]=v;d[i*4+2]=Math.round(v*0.82);d[i*4+3]=255;
     }
     g.putImageData(im,0,0);
    });
    if(M.solid&&!M.solid.map)M.solid.map=cushionTex;
    if(typeof SWOW_VSTACK!=='undefined')SWOW_VSTACK.dilateCardTextures('copperglacier',M);
   }

   COPPERG.SPECIES=[
    {key:'cushion',name:COPPERG.PLANTS.cushion.name,H:[0.18,0.42],rb:[0.2,0.5],crownR:[0.25,0.65],tags:Object.assign({},COPPERG.PLANTS.cushion.tags),items:['cushion']},
    {key:'lichen',name:COPPERG.PLANTS.lichen.name,H:[0.02,0.05],rb:[0.15,0.4],crownR:[0.2,0.55],tags:Object.assign({},COPPERG.PLANTS.lichen.tags),items:['lichen']}
   ];
   COPPERG.SPECIES.forEach((s,i)=>{s.i=i;});

   COPPERG.builders={
    cushion:{
     make:function(x,y,z,seed){
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x5101):seed;
      return{x:x,y0:y,z:z,r:0.26+0.34*H(sd,1,0,0x51),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('copperglacier');
      try{
       const pal=COPPERG.PAL.cushion;
       const col=COPPERG.C(pal[Math.floor(H(T.seed,2,0,0x51)*pal.length)%pal.length]);
       BIO.put('cushion',[T.x,T.y0-0.04,T.z],qEuler(0,H(T.seed,3,0,0x51)*TAU,0),[T.r,T.r*0.58,T.r],col);
      }finally{BIO.kit(pv);}
     }
    },
    lichen:{
     make:function(x,y,z,seed){
      const sd=seed==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x5102):seed;
      return{x:x,y0:y,z:z,r:0.32+0.42*H(sd,1,0,0x52),seed:sd};
     },
     grow:function(T){
      const pv=BIO.kit('copperglacier');
      try{
       const pal=COPPERG.PAL.lichen;
       const col=COPPERG.C(pal[Math.floor(H(T.seed,2,0,0x52)*pal.length)%pal.length]);
       BIO.put('lichen',[T.x,T.y0+0.02,T.z],qEuler(0,H(T.seed,3,0,0x52)*TAU,0),[T.r,1,T.r],col);
      }finally{BIO.kit(pv);}
     }
    }
   };

   BIO.kitEnd(COPPERG);
  }finally{
   BIO.kit(prevKit);
  }
 }
})();
