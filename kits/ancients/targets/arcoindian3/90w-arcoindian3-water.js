// ================================================================= ARCOINDIAN III — water drawn on core/water & ruin watched on core/ruins
// Runs right after 90-scene.js has built both sites and baked all instanced meshes.
// Binds core/atmos waves + skylight to a dedicated water environment (matching targets/theodiga/90w-theodiga-water.js),
// draws the gorge river, the emerald-jade mosaic pools and the spring cascades, and registers KRUINS.watch on the ruin.
ATMOS.init({
 THREE:THREE,scene:scene,camera:camera,
 hour:()=>(typeof NIGHT!=='undefined'&&NIGHT)?0:14,
 onFrame:fn=>TICKS.push(fn),
 ground:(x,z)=>terrainH(x,z),
 seed:12409,
 err:m=>console.warn(m),
 viewH:()=>innerHeight,
 pixelRatio:()=>renderer.getPixelRatio()
});
const A3_SKY=new THREE.Scene(),A3_ENV={environment:null};
A3_SKY.add(new THREE.Mesh(sky.geometry,skyMat));
{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(7000);A3_SKY.add(g);}
ATMOS.skylight({renderer:renderer,sky:A3_SKY,scene:A3_ENV,ground:()=>new THREE.Color(0x6e4e3a),key:()=>(typeof NIGHT!=='undefined'&&NIGHT)?'n':'d'});

{
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const tag=(o,label)=>{if(!o)return;o.userData.lodSkip=true;o.userData.probeSkip=false;o.userData.inspectLabel=label;};
 for(const site of A3WATER.sites){
  for(const S of site.still){
   const D=WATER.drawStill(S,{color:lin(0x1f5f6b),roughness:0.12,metalness:0.06,envMapIntensity:0.55,renderOrder:1});
   tag(D.mesh,S.name);
  }
  /* Emerald-green translucent water over the green ceramic mosaic basins (Reference 3) */
  for(const S of site.emerald){
   const D=WATER.drawStill(S,{color:lin(0x176953),roughness:0.08,metalness:0.04,opacity:0.84,envMapIntensity:0.62,renderOrder:1});
   tag(D.mesh,S.name);
  }
  for(const S of site.flow){
   const D=WATER.drawFlow(S,{shallow:lin(0x4f8e92),deep:lin(0x1b525e),color:0xffffff,roughness:0.12,metalness:0.05,envMapIntensity:0.5,step:24,across:6,margin:2});
   tag(D.mesh,S.name);
  }
  for(const S of site.fall){
   const plungeY=S.drop>100?(ARCO3.DIM.WSY+0.15):(S.drop>40?305.2:(ARCO3.DIM.WSY+0.12));
   const D=WATER.drawFall(S,{color:lin(0xdaf0ee),opacity:0.9,rows:S.drop>100?48:20,cols:6,plungeY:plungeY,spray:false,lipK:0.85,footK:0.65,envMapIntensity:0.35});
   tag(D.mesh,S.name);tag(D.plunge,S.name+' plunge');
  }
 }
}

/* Watch the ruined site with core/ruins: zero floating pieces, every detached wreck seated on the shore ground */
{
 const R=A3WATER.sites.find(s=>s.d>0);
 if(R&&typeof KRUINS!=='undefined'){
  const GROUND_MATS=new Set([MAT.a3Rock,MAT.a3Top,MAT.a3Shade,MAT.a3Bed]);
  KRUINS.watch(scene,{
   name:'Arcoindian III, the ruined cliff arcology',
   inside:(x,z)=>Math.abs(x-R.gx)<340&&(z-R.gz)>-232&&(z-R.gz)<205,
   ground:(x,z)=>A3WATER.ground(R,x,z),
   skip:(m,def)=>def==='a3Boat'||GROUND_MATS.has(m.material)||!!(m.userData&&(m.userData.lodSkip||m.userData.decor))
  });
 }
}
