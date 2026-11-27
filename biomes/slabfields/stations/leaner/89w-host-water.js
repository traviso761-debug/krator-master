// ================================================================= HOST — the water: station 2, the Leaner (core/water; PLAN.md sections 7 and 3.6)
//   THE LAKE    the patera's warm spring lake: a WATER.open at its level (1,997 m) over the page's box with a shore grid (4 m) flooded from a seed in the
//               water, kept inside the patera's rim; still (no surf, no breakers: the owner's rule for still water), warm, green-grey off the marl
//               (biomes/firebliss's tarn, the same lines)
//   THE SPRINGS the live warm springs on the shelf, WATER.still pools in one draw (the dead ones are dry: 45 dishes them, 84 rings them with sulfur)
//   THE PONDS   the ramp's ponds, WATER.still: each pool's outline marched from its centre to where its tilted floor rises out of the water, so the water
//               lies in the low (SSE) end of its basin
// CPU twins: WATER.heightAt; BIO.waterH is the stage's (L.water).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8070)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={};
{const PT=SITE.patera,R=TERR.R*1.1,box=[-R,-R,R,R],seed=L.xz(PT.c[0],PT.c[1]+PT.shore-400);
 const LAKE=WATER.open({name:'The Leaner\'s patera lake',level:PT.level,field:.1,bounds:box,bed:terrainH,bedBox:box,
  shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>L.pr(x,z)>PT.r-20}});
 const D=WATER.draw(LAKE,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:lin(0x8a9a80),deep:lin(0x2e5a5c)});
 D.mesh.userData.inspectLabel='The Leaner\'s patera lake (warm, 90 m deep; it drifts north-west as the sill lifts the slab)';D.mesh.userData.probeSkip=true;W_OUT.lake=1;}
{const springs=L.SPRINGS.filter(q=>!q.dead).map(q=>{const poly=[];for(let k=0;k<20;k++){const a=k/20*TAU,r=q.r*(.93+.08*Math.sin(a*3+q.i));poly.push([q.x+Math.cos(a)*r,q.z+Math.sin(a)*r]);}
  return WATER.still({name:'A warm spring on the shelf',level:q.level,poly,gradient:{centre:lin(0x2a6a6a).getHex(),rim:lin(0xb4b08a).getHex(),power:1.4}});});
 const ponds=L.PONDS.map(p=>{const poly=[];for(let k=0;k<40;k++){const a=k/40*TAU,ca=Math.cos(a),sa=Math.sin(a);let d=0;
   while(d<p.r*1.6&&waterH(p.x+ca*(d+.5),p.z+sa*(d+.5))>-1e8)d+=.5;poly.push([p.x+ca*Math.max(.5,d),p.z+sa*Math.max(.5,d)]);}
  return WATER.still({name:'A tilted pond on the ramp',level:p.level,poly,gradient:{centre:lin(0x3e5450).getHex(),rim:lin(0x9a947a).getHex(),power:1.2}});});
 const pools=springs.concat(ponds);
 if(pools.length){const D=WATER.drawPools(pools,{name:'The springs and the ramp\'s ponds',color:0xffffff,roughness:.05,metalness:.05,envMapIntensity:.55,renderOrder:2,pick:true});
  D.mesh.userData.inspectLabel='The warm springs on the shelf and the ponds on the ramp';}
 W_OUT.springs=springs.length;W_OUT.ponds=ponds.length;}
if(WATER.breakupFlows)WATER.breakupFlows();
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
