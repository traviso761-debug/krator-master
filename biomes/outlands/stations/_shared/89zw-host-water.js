// ================================================================= HOST — the water of a later station (core/water)
// STAGE.water: {
//   pools  [{x, z, r, l, name, poly}]       small still pools (WATER.still, one mesh: drawPools), turbid; a circle of r unless poly
//   lakes  [{name, level, box, seed [x,z], land(x,z), shallow, deep, look, label}]   WATER.open at its level over the ground under it, a shore
//          grid flooded from the seed; still water takes no surf or breakers; a look (core/water ext/54: 'brine') tints it by depth
//   flows  [{name, pts [[x,y,z]...], width [..], speed, shallow, deep}]   WATER.flow along a graded line, drawn as its ribbon
//   pans   [{name, poly | bounds, level}]   WATER.pan records (ext/54): the salt crust's polygons, for the colony and the export
// } The sky in the water is core/atmos's skylight. waterH (45) keeps every root out of all of it.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
const WAT=STAGE.water||{};
const POOL_STILLS=(WAT.pools||[]).map((P,i)=>WATER.still({name:P.name||('A pool '+(i+1)),level:P.l,poly:P.poly||circ(P.x,P.z,P.r*1.05,16)}));
const POOL_DRAW=POOL_STILLS.length?WATER.drawPools(POOL_STILLS,{color:lin(WAT.poolCol==null?0x5a5040:WAT.poolCol),roughness:.1,metalness:.04,envMapIntensity:.35,renderOrder:1,pick:true,name:'Pools'}):null;
if(POOL_DRAW)POOL_DRAW.mesh.userData.inspectLabel=WAT.poolLabel||'A pool';
const LAKE_DRAWS=(WAT.lakes||[]).map(L=>{const look=L.look&&WATER.lookTint?{tint:WATER.lookTint({look:L.look,box:L.box,cell:L.cell==null?8:L.cell,depth:(x,z)=>{const d=L.level-terrainH(x,z);return d>0?d:null;}})}:{};
 const W=WATER.open(Object.assign({name:L.name,level:L.level,field:L.field==null?.1:L.field,bounds:L.box,bed:terrainH,bedBox:L.box,shore:{cell:L.shoreCell==null?4:L.shoreCell,band:L.band==null?40:L.band,seeds:[L.seed],land:L.land||(()=>false)}},look));
 if(L.look&&WATER.withLook)WATER.withLook(W,L.look);
 const D=WATER.draw(W,Object.assign({renderOrder:1,roughness:L.roughness==null?.12:L.roughness,metalness:.05,envMapIntensity:.4,surf:false,breakers:false,pick:true,shallow:lin(L.shallow==null?0x6a8a84:L.shallow),deep:lin(L.deep==null?0x2a4a50:L.deep)},
  L.look&&WATER.lookDraw?WATER.lookDraw(L.look,'open',{}):{}));
 D.mesh.userData.inspectLabel=L.label||L.name;D.mesh.userData.probeSkip=true;return{L,W,D};});
const FLOW_DRAWS=(WAT.flows||[]).filter(F=>F.pts.length>=3).map(F=>{const S=WATER.flow({name:F.name,pts:F.pts,width:F.width,speed:F.speed==null?1.2:F.speed});
 const d=WATER.drawFlow(S,{rapids:[.12,.3],shallow:lin(F.shallow==null?0x7a8a74:F.shallow),deep:lin(F.deep==null?0x4a5a50:F.deep),color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.35,step:F.step==null?6:F.step,across:F.across==null?3:F.across,margin:F.margin==null?1.2:F.margin,renderOrder:2});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=F.name;return{F,S,d};});
const PANS=(WAT.pans||[]).map(P=>WATER.pan?WATER.pan(P):null).filter(Boolean);
window._water={pools:POOL_STILLS.length,lakes:LAKE_DRAWS.length,flows:FLOW_DRAWS.length,pans:PANS.length};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
