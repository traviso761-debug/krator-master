// ================================================================= STONEBOW — core/atmos, core/water & core/ruins host
// Binds core/atmos + skylight reflection onto SB_ENV (keeping the kit's tuned concrete/metal materials unchanged),
// draws every Ching-Ma river, plunge pool & cataract record from SBWATER (8av2), and registers the ruined Stonebow site
// with KRUINS.watch so verify.py asserts zero floating pieces and properly seated canyon-floor wreckage.
ATMOS.init({
 THREE,scene,camera,
 hour:()=>(typeof NIGHT!=='undefined'&&NIGHT)?0:13,
 onFrame:fn=>TICKS.push(fn),
 ground:(x,z)=>terrainH(x,z),
 seed:12407,
 err:m=>console.warn(m),
 viewH:()=>innerHeight,
 pixelRatio:()=>renderer.getPixelRatio()
});
const SB_SKY=new THREE.Scene(),SB_ENV={environment:null};
SB_SKY.add(new THREE.Mesh(sky.geometry,skyMat));
{
 const g=giant.clone();
 g.position.copy(giantDir).multiplyScalar(7000);
 SB_SKY.add(g);
}
ATMOS.skylight({
 renderer,sky:SB_SKY,scene:SB_ENV,
 ground:()=>new THREE.Color(0x584638),
 key:()=>(typeof NIGHT!=='undefined'&&NIGHT)?'n':'d'
});
{
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const tag=(o,label)=>{if(!o)return;o.userData.lodSkip=true;o.userData.inspectLabel=label;};
 for(const site of SBWATER.sites){
  for(const S of site.still){
   const D=WATER.drawStill(S,{color:lin(0x286678),roughness:0.10,metalness:0.05,envMapIntensity:0.48,renderOrder:1});
   tag(D.mesh,S.name);
  }
  for(const S of site.flow){
   const D=WATER.drawFlow(S,{shallow:lin(0x5fa09c),deep:lin(0x245866),color:0xffffff,roughness:0.11,metalness:0.05,envMapIntensity:0.48,step:10,across:6,margin:1.5});
   tag(D.mesh,S.name);
  }
  for(const S of site.fall){
   const D=WATER.drawFall(S,{color:lin(0xd8ecf0),opacity:0.92,rows:24,cols:8,plungeY:1.5,spray:true,lipK:0.85,footK:0.65,envMapIntensity:0.32});
   tag(D.mesh,S.name);
   tag(D.plunge,S.name+': plunge');
  }
 }
}
// Watch the ruined Stonebow site with core/ruins: nothing floats, and fallen Tourist Center slabs rest on canyon floor groundAt
{
 const R=SBWATER.sites.find(s=>s.mode==='ruined');
 if(R&&typeof KRUINS!=='undefined'){
  const GROUND_MATS=new Set([MAT.sbCanyon,MAT.rock,MAT.ground,MAT.mud,MAT.lawn]);
  KRUINS.watch(scene,{
   name:'Stonebow, cataclysm ruin',
   inside:(x,z)=>Math.abs(x-R.gx)<800&&Math.abs(z-R.gz)<750,
   ground:(x,z)=>SBWATER.ground(R,x,z),
   skip:m=>GROUND_MATS.has(m.material)||!!(m.userData&&m.userData.lodSkip)
  });
 }
}
