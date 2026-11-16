// ================================================================= THEODIGA — the water drawn by core/water, the ruin watched by core/ruins
// After the scene (90-scene.js: the builders, the kit baked). core/atmos (its clock, the wave chunk and the sky's light) is
// bound as the Ancient Port kit binds it (kits/port 90-scene.js): the frame loop (92-camera.js) runs TICKS; the skylight
// captures the page's dome and giant and is given to the water only (THEO_ENV), so the kit's tuned materials are unchanged.
// Then every record THEOWATER.dam made (77c) is drawn: still water, flows and falls, kept out of the kit's LOD (lodSkip).
ATMOS.init({THREE,scene,camera,hour:()=>(typeof NIGHT!=='undefined'&&NIGHT)?0:13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:9271,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const THEO_SKY=new THREE.Scene(),THEO_ENV={environment:null};
THEO_SKY.add(new THREE.Mesh(sky.geometry,skyMat));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(7000);THEO_SKY.add(g);}
ATMOS.skylight({renderer,sky:THEO_SKY,scene:THEO_ENV,ground:()=>new THREE.Color(0x5a4636),key:()=>(typeof NIGHT!=='undefined'&&NIGHT)?'n':'d'});
{const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 const tag=(o,label)=>{if(!o)return;o.userData.lodSkip=true;o.userData.inspectLabel=label;};
 for(const site of THEOWATER.sites){
  for(const S of site.still){const D=WATER.drawStill(S,{color:lin(site.d>0?0x3d6e74:0x2f6a86),roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1});tag(D.mesh,S.name);}
  for(const S of site.flow){const D=WATER.drawFlow(S,{shallow:lin(0x6a9a96),deep:lin(0x2f5e66),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,step:8,across:6,margin:1.5});tag(D.mesh,S.name);}
  for(const S of site.fall){const D=WATER.drawFall(S,{color:lin(0xd4e6ea),opacity:.92,rows:S.drop>100?60:16,cols:8,plungeY:site.d>0?1.1:2,spray:true,lipK:.85,footK:.6,envMapIntensity:.3});
   tag(D.mesh,S.name);tag(D.plunge,S.name+': the plunge');}}}
// THE RUIN WATCHED (core/ruins, the default for every ruined structure): nothing of the ruined dam and its dome may float, and
// what fell lies on its lowest points on the ground under it (the lake bed upstream, the canyon floor downstream: 77c's ground).
// The canyon's rock, the lake bed and the canyon floor's mud are the ground itself, and the water is not a structure.
{const R=THEOWATER.sites.find(s=>s.d>0);
 if(R&&typeof KRUINS!=='undefined'){const c=R.c,GROUND=new Set([MAT.rock,MAT.mud,MAT.lawn]);
  KRUINS.watch(scene,{name:'Theodiga, the ruin',inside:(x,z)=>Math.abs(x-c.gx)<c.SPAN/2+40&&z-c.gz>-700&&z-c.gz<640,
   ground:(x,z)=>THEOWATER.ground(R,x,z),skip:m=>GROUND.has(m.material)||!!(m.userData&&m.userData.lodSkip)||/^theodiga:town/.test(m.name||'')});}}   // the town on the rim (theodiga-today) is no wreckage
