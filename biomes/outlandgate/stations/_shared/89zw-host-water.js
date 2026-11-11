// ================================================================= HOST — the water of a later station (core/water)
// STAGE.water: {
//   lakes     [{name, level, box, seed [x,z], land(x,z), shallow, deep, label}]   WATER.open at its level over the ground under it, its shore
//             grid flooded from the seed; still water takes no surf or breakers (the Upper Gate Tarn, Spider Lake's eastern bay)
//   flows     [{name, pts [[x, z, y]...], width [..], speed, shallow, deep}]   WATER.flow along a graded line, drawn as its ribbon
//   pools     [{x, z, r, l, name, poly}]   small still pools (WATER.still, one mesh: drawPools): the seeps' basins, the warm coves
//   terraces  [{name, line [[x,z]...], levels [y0, y1, ...] | treads, width, riser}]   WATER.terraces (ext 53): a seep's rimstone stair, its
//             pools and falls (WATER.drawTerraces)
// } The sky in the water is core/atmos's skylight. waterH (45) keeps every root out of all of it. THE OUTBURST FLOOD (87's record, on its
// cycle): one still surface over STAGE.flood's box at its level, raised by depth x k each frame.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a52)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
const WAT=STAGE.water||{};
const POOL_STILLS=(WAT.pools||[]).map((P,i)=>WATER.still({name:P.name||('A pool '+(i+1)),level:P.l,poly:P.poly||circ(P.x,P.z,P.r*1.05,16)}));
const POOL_DRAW=POOL_STILLS.length?WATER.drawPools(POOL_STILLS,{color:lin(WAT.poolCol==null?0x5a6a60:WAT.poolCol),roughness:.1,metalness:.04,envMapIntensity:.35,renderOrder:1,pick:true,name:'Pools'}):null;
if(POOL_DRAW){POOL_DRAW.mesh.userData.inspectLabel=WAT.poolLabel||'A pool';POOL_DRAW.mesh.userData.probeSkip=true;}
const LAKE_DRAWS=(WAT.lakes||[]).map(L=>{const W=WATER.open({name:L.name,level:L.level,field:L.field==null?.1:L.field,bounds:L.box,bed:terrainH,bedBox:L.box,
  shore:{cell:L.shoreCell==null?6:L.shoreCell,band:L.band==null?40:L.band,seeds:[L.seed],land:L.land||(()=>false)}});
 const D=WATER.draw(W,{renderOrder:1,roughness:L.roughness==null?.12:L.roughness,metalness:.05,envMapIntensity:.4,surf:false,breakers:false,pick:true,shallow:lin(L.shallow==null?0x6a8a84:L.shallow),deep:lin(L.deep==null?0x2a4a50:L.deep)});
 D.mesh.userData.inspectLabel=L.label||L.name;D.mesh.userData.probeSkip=true;return{L,W,D};});
const FLOW_DRAWS=(WAT.flows||[]).filter(F=>F.pts.length>=3).map(F=>{const S=WATER.flow({name:F.name,pts:F.pts,width:F.width,speed:F.speed==null?1.2:F.speed});
 const d=WATER.drawFlow(S,{rapids:[.12,.3],shallow:lin(F.shallow==null?0x7a8a74:F.shallow),deep:lin(F.deep==null?0x3e5450:F.deep),color:0xffffff,roughness:.22,metalness:.05,envMapIntensity:.4,step:F.step==null?6:F.step,across:F.across==null?3:F.across,margin:F.margin==null?1.4:F.margin,renderOrder:2});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=F.name;return{F,S,d};});
const TERRACE_DRAWS=(WAT.terraces||[]).map(T=>{const Tr=WATER.terraces({name:T.name,line:T.line,levels:T.levels,treads:T.treads,width:T.width==null?5:T.width,riser:T.riser==null?1.2:T.riser});
 const D=WATER.drawTerraces?WATER.drawTerraces(Tr,{pool:{color:lin(T.col==null?0x6aa6a0:T.col),roughness:.08,metalness:.04,envMapIntensity:.4,renderOrder:2},fall:{renderOrder:3}}):null;
 const mark=(o,dp)=>{if(!o||dp>3)return;if(o.isObject3D){o.traverse(m=>{if(m.isMesh){m.userData.probeSkip=true;m.userData.inspectLabel=T.name;}});return;}
  if(typeof o==='object'&&!Array.isArray(o)&&!o.isBufferGeometry&&!o.isMaterial)for(const k in o)mark(o[k],dp+1);};mark(D,0);
 return{T,Tr,D};});
window._water={pools:POOL_STILLS.length,lakes:LAKE_DRAWS.length,flows:FLOW_DRAWS.length,terraces:TERRACE_DRAWS.length};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
const FLOOD_DRAW=(function(){const F=STAGE.flood;if(!HAZ.flood||!F||!WATER.drawPools)return null;const b=F.box;
 const S=WATER.still({name:F.name,level:F.level,poly:[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]]});
 const D=WATER.drawPools([S],{color:lin(0x6a5e48),roughness:.35,metalness:.02,envMapIntensity:.25,renderOrder:3,pick:true,name:F.name});
 D.mesh.userData.inspectLabel=F.name;D.mesh.userData.probeSkip=true;D.mesh.visible=false;
 tick(()=>{const k=floodK();D.mesh.visible=k>.005;D.mesh.position.y=F.depth*k-.5;window._flood={k:+k.toFixed(3),state:KHAZ.state(HAZ.flood,floodT()).state};});
 return D;})();
