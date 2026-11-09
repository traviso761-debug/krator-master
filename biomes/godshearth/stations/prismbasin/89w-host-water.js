// ================================================================= HOST — the water (Godshearth, station 1): the hot lake, the field's springs and geysers
// The springs, pools and geysers are the geyser kit's (65: WATER.spring and WATER.geyser). THE HOT LAKE is a WATER.open at its level (3,642 m; the page's
// datum) over every ground under it west of the shore (its vents 400 m out tint the water over them: the model's record, 47b's heat), with a shore grid (4 m) flooded from the lake's middle: still water, no surf and no breakers (the
// owner's rule). Past the square the far field carries it flat and painted (44s: far.h, far.color).
const GH_LIN=c=>new THREE.Color(c).convertSRGBToLinear();
const LAKE_DRAW=(function(){const R=TERR.R*1.1,box=[-R,-R,Math.min(R,-120),R],seed=[-R+60,0];
 try{const W=WATER.open({name:GH_LAKE.name,level:GH_LAKE.level,field:.1,bounds:box,bed:terrainH,bedBox:box,
   shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>x>shoreX(z)+80},
   /* THE LAKE'S SHORE VENTS (the model's record, 47b's heat): the water over them paler and greener, mineral and hot (core/water ext/61's tint) */
   tint:{box:[GH_SHORE_V.x-GH_SHORE_V.reach,GH_SHORE_V.z-GH_SHORE_V.reach,GH_SHORE_V.x+GH_SHORE_V.reach,GH_SHORE_V.z+GH_SHORE_V.reach],cell:6,
    at:(x,z)=>{const t=GH_HEAT(x,z)-GH_SOIL;if(t<4)return null;return{c:GH_LIN(t>45?0xd8ece0:0x9ad4c4),a:.25+.5*smooth(4,60,t)};}}});
  const D=WATER.draw(W,{renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,
   shallow:GH_LIN(0x5aa8a0),deep:GH_LIN(0x1e6670)});   /* clear, warm and mineral: blue-green over the bead sand */
  D.mesh.userData.inspectLabel=GH_LAKE.name;D.mesh.userData.probeSkip=true;return D;}
 catch(e){reportErr('lake: '+e.stack);return null;}})();
// THE TERRACES (44s: GH_TER): WATER.terraces on the spring's mound, the pools hot and blue at the centre, cream at the rims; thin curtains down the risers
const TER_DRAW=(function(){try{const T=WATER.terraces({name:GH_TER.name,line:[GH_TER.A,GH_TER.B],levels:GH_TER.levels,riser:GH_TER.riser,width:GH_TER.w,speed:.9,spread:2});
  return WATER.drawTerraces(T,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.5,renderOrder:1,gradient:{centre:GH_LIN(0x58b4c0).getHex(),rim:GH_LIN(0xe6e2d2).getHex(),power:1.4}},
   fall:{color:GH_LIN(0xeef2ee),opacity:.8,rowStep:1,cols:8,spray:false,plungeR:4,renderOrder:3}});}catch(e){reportErr('terraces: '+e.stack);return null;}})();
// the scalding water over the shore vents: a heat hazard on the one bake (KHAZ), where the water is over 45 degC
REGISTER({name:'The hot lake\'s shore vents (scalding water over them)',x:GH_SHORE_V.x,z:GH_SHORE_V.z,y:GH_LAKE.level-6,r:60,h:8,
 tags:{hazard:{kind:'heat',danger:.5,falloff:'linear',shape:{type:'cyl',r:45,h:7}}}});
window._water={lakeVents:GH_HEAT(GH_SHORE_V.x,GH_SHORE_V.z),terraces:!!TER_DRAW,creek:false,pools:0,poolMeshes:0,springs:LAYOUT.springs.length,lake:!!LAKE_DRAW};
