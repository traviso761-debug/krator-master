// ================================================================= HOST — Hau-Gel: the main channel and its braids (core/water)
// Each a WATER.flow along its graded line (45: 1,424.0 m at the south edge to 1,422.8 m at the north, Spider Lake's way), drawn as its
// ribbon inside its carved channel (the main one 120 m: three of the ground's cells and more, so the ribbon never bridges the cells: the
// survey's "flickering ponds"); the braids sit 6 cm under the main surface where they meet it, and are cut where they lie inside it.
// Grey-green with the walls' silt, white where the bed steepens. The sky in the water is core/atmos's skylight.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a52)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const RIVER_PTS=RIV.map(p=>[p[0],p[1],LVL(p[1])]);   /* WATER.flow's points are [x, z, y] */
const FLOWS=[{name:'Hau-Gel (the main channel)',pts:RIVER_PTS,w:MAIN_W*.86}].concat(BRAIDS.map((B,i)=>({name:'Hau-Gel (a braid)',w:B.w*.86,
 pts:B.pts.filter(p=>nearLine(RIV,rivIdx,p[0],p[1],400).d>MAIN_W/2-10).map(p=>[p[0],p[1],LVL(p[1])-.06])})));
const FLOW_DRAWS=FLOWS.filter(F=>F.pts.length>=3).map(F=>{const S=WATER.flow({name:F.name,pts:F.pts,width:F.pts.map(()=>F.w),speed:1.6});
 const d=WATER.drawFlow(S,{rapids:[.12,.3],shallow:lin(0x7a8a74),deep:lin(0x3e5450),color:0xffffff,roughness:.22,metalness:.05,envMapIntensity:.4,step:8,across:4,margin:1.6,renderOrder:2});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=F.name;return{F,S,d};});
window._water={flows:FLOW_DRAWS.length};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
// ---------------------------------------------------------------- THE OUTBURST FLOOD (87's record, on its cycle)
// one still surface over the floor (core/water), at the bank's level plus the flood's depth x k
const FLOOD_D=7.5,FLOOD_L0=LVL(0)+1.6;
const FLOOD_DRAW=(function(){if(!HAZ.flood||!WATER.drawPools)return null;const R=TERR.R*1.1;
 const S=WATER.still({name:'The outburst flood',level:FLOOD_L0,poly:[[-R,-R],[R,-R],[R,R],[-R,R]]});
 const D=WATER.drawPools([S],{color:new THREE.Color(0x6a5e48).convertSRGBToLinear(),roughness:.35,metalness:.02,envMapIntensity:.25,renderOrder:3,pick:true,name:'The outburst flood'});
 D.mesh.userData.inspectLabel='The outburst flood (the lake breaking through)';D.mesh.userData.probeSkip=true;D.mesh.visible=false;
 tick(()=>{const k=floodK();D.mesh.visible=k>.005;D.mesh.position.y=FLOOD_D*k-.5;window._flood={k:+k.toFixed(3),state:KHAZ.state(HAZ.flood,floodT()).state};});
 return D;})();
