// ================================================================= HOST — the water (Godshearth, station 1): the hot lake, the field's springs and geysers
// The springs, pools and geysers are the geyser kit's (65: WATER.spring and WATER.geyser). THE HOT LAKE is a WATER.open at its level (3,642 m; the page's
// datum) over every ground under it west of the shore, with a shore grid (4 m) flooded from the lake's middle: still water, no surf and no breakers (the
// owner's rule). Past the square the far field carries it flat and painted (44s: far.h, far.color). Its vents' thermal ramp (WATER.spring's, at the lake's
// bed) and its steam banks at dawn are owed (KNOWN_ISSUES.md).
const GH_LIN=c=>new THREE.Color(c).convertSRGBToLinear();
const LAKE_DRAW=(function(){const R=TERR.R*1.1,box=[-R,-R,Math.min(R,-120),R],seed=[-R+60,0];
 try{const W=WATER.open({name:GH_LAKE.name,level:GH_LAKE.level,field:.1,bounds:box,bed:terrainH,bedBox:box,
   shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>x>shoreX(z)+80}});
  const D=WATER.draw(W,{renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,
   shallow:GH_LIN(0x5aa8a0),deep:GH_LIN(0x1e6670)});   /* clear, warm and mineral: blue-green over the bead sand */
  D.mesh.userData.inspectLabel=GH_LAKE.name;D.mesh.userData.probeSkip=true;return D;}
 catch(e){reportErr('lake: '+e.stack);return null;}})();
window._water={creek:false,pools:0,poolMeshes:0,springs:LAYOUT.springs.length,lake:!!LAKE_DRAW};
