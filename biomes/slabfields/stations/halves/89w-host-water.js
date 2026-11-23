// ================================================================= HOST — the water: station 3, the Halves (core/water; PLAN.md sections 7 and 3.5)
//   THE POOL    the patera's warm spring pool: a WATER.open at its level (3,102 m) over the page's box with a shore grid (4 m) flooded from a seed in the
//               water, kept inside the patera's rim; still (no surf, no breakers), green-grey over the old crust (station 2's lines)
//   THE SPRINGS the warm springs on the south shore and the pits' cold seeps, WATER.still pools in one draw
// CPU twins: WATER.heightAt; BIO.waterH is the stage's (L.water).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8070)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={};
{const PT=SITE.patera,R=TERR.R*1.1,box=[-R,-R,R,R],seed=[PT.c[0],PT.c[1]+PT.shore-500];
 const LAKE=WATER.open({name:'The Halves\' patera pool',level:PT.level,field:.1,bounds:box,bed:terrainH,bedBox:box,
  shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>L.pr(x,z)>PT.r-20}});
 const D=WATER.draw(LAKE,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:lin(0x7a8a7a),deep:lin(0x2a4e56)});
 D.mesh.userData.inspectLabel='The Halves\' patera pool (warm, 40 m deep, between the split slab\'s halves)';D.mesh.userData.probeSkip=true;W_OUT.lake=1;}
{const springs=L.SPRINGS.filter(q=>!q.dead).map(q=>{const poly=[];for(let k=0;k<20;k++){const a=k/20*TAU,r=q.r*(.93+.08*Math.sin(a*3+q.i));poly.push([q.x+Math.cos(a)*r,q.z+Math.sin(a)*r]);}
  return WATER.still({name:q.pit!=null?'A seep on a pit\'s floor':'A warm spring on the shore',level:q.level,poly,gradient:q.pit!=null?{centre:lin(0x2e3a30).getHex(),rim:lin(0x6a6a5a).getHex(),power:1.2}:{centre:lin(0x2a6a6a).getHex(),rim:lin(0xb4b08a).getHex(),power:1.4}});});
 if(springs.length){const D=WATER.drawPools(springs,{name:'The springs and the pits\' seeps',color:0xffffff,roughness:.05,metalness:.05,envMapIntensity:.55,renderOrder:2,pick:true});
  D.mesh.userData.inspectLabel='The warm springs on the shore and the seeps in the pits';}
 W_OUT.springs=springs.length;W_OUT.seeps=L.SPRINGS.filter(q=>q.pit!=null).length;}
if(WATER.breakupFlows)WATER.breakupFlows();
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
