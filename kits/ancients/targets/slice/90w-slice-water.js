// ================================================================= SLICE — water drawn on core/water & ruin watched on core/ruins
// Runs right after 90-scene.js has built both sites and baked all instanced meshes.
// Binds core/atmos waves + skylight to a dedicated water environment, draws the foreground gorge river, the sunken park
// reflecting canal, the amphitheatre & skylight mirror basins, and the cascades, and registers KRUINS.watch on the ruin.
ATMOS.init({
 THREE:THREE,scene:scene,camera:camera,
 hour:()=>(typeof NIGHT!=='undefined'&&NIGHT)?0:14,
 onFrame:fn=>TICKS.push(fn),
 ground:(x,z)=>terrainH(x,z),
 seed:12424,
 err:m=>console.warn(m),
 viewH:()=>innerHeight,
 pixelRatio:()=>renderer.getPixelRatio()
});
const SL_SKY=new THREE.Scene(),SL_ENV={environment:null};
SL_SKY.add(new THREE.Mesh(sky.geometry,skyMat));
{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(7000);SL_SKY.add(g);}
ATMOS.skylight({renderer:renderer,sky:SL_SKY,scene:SL_ENV,ground:()=>new THREE.Color(0x6b5644),key:()=>(typeof NIGHT!=='undefined'&&NIGHT)?'n':'d'});

{
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const tag=(o,label)=>{if(!o)return;o.userData.lodSkip=true;o.userData.probeSkip=false;o.userData.inspectLabel=label;};
 for(const site of SLWATER.sites){
  for(const S of site.still){
   const D=WATER.drawStill(S,{color:lin(0x1d5866),roughness:0.12,metalness:0.06,envMapIntensity:0.55,renderOrder:1});
   tag(D.mesh,S.name);
  }
  for(const S of site.basins){
   const D=WATER.drawStill(S,{color:lin(0x186658),roughness:0.08,metalness:0.04,opacity:0.86,envMapIntensity:0.62,renderOrder:1});
   tag(D.mesh,S.name);
  }
  for(const S of site.flow){
   const D=WATER.drawFlow(S,{shallow:lin(0x4b878d),deep:lin(0x194d59),color:0xffffff,roughness:0.12,metalness:0.05,envMapIntensity:0.5,step:24,across:6,margin:2});
   tag(D.mesh,S.name);
  }
  for(const F of site.fall){
   const S=F.rec;
   const D=WATER.drawFall(S,{color:lin(0xdaf0ee),opacity:0.9,rows:S.drop>100?46:20,cols:6,plungeY:F.plungeY,spray:false,lipK:0.85,footK:0.65,envMapIntensity:0.35});
   tag(D.mesh,S.name);tag(D.plunge,S.name+' plunge');
  }
 }
}

/* Watch the ruined site with core/ruins: zero floating pieces, every detached wreck seated cleanly on bench or shore ground */
{
 const R=SLWATER.sites.find(s=>s.d>0);
 if(R&&typeof KRUINS!=='undefined'){
  const GROUND_MATS=new Set([MAT.slColRock,MAT.slStratRock,MAT.slCaveShade,MAT.slTop,MAT.slBed]);
  KRUINS.watch(scene,{
   name:'Slice, the ruined cliff arcology',
   inside:(x,z)=>Math.abs(x-R.gx)<385&&(z-R.gz)>-510&&(z-R.gz)<255,
   ground:(x,z)=>SLWATER.ground(R,x,z),
   skip:(m,def)=>def==='slBoat'||GROUND_MATS.has(m.material)||!!(m.userData&&(m.userData.lodSkip||m.userData.decor))
  });
 }
}
