// ================================================================= HOST — the water (core/water; PLAN.md section 7)
// The spring line's seeps are WATER.still pools (one draw, no surf: the owner's rule for still water, 2026-11-02); the brook they feed is a WATER.flow
// running off north-west down the bench. Cold water, clear, a little brown off the rubble. CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is the
// stage's.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8070)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={};
{const pools=L.SEEPS.map(s=>{const poly=[];for(let k=0;k<28;k++){const a=k/28*TAU,r=s.r*(.95+.12*Math.sin(a*3+s.i));poly.push([s.x+Math.cos(a)*r,s.z+Math.sin(a)*r]);}
  return WATER.still({name:'A seep on the spring line',level:s.level,poly,gradient:{centre:lin(0x2e3a30).getHex(),rim:lin(0x8a8a6a).getHex(),power:1.2}});});
 if(pools.length){const D=WATER.drawPools(pools,{name:'The spring line\'s seeps',color:0xffffff,roughness:.05,metalness:.05,envMapIntensity:.55,renderOrder:1,pick:true});
  D.mesh.userData.inspectLabel='The spring line\'s seeps (cold water through the rubble)';}
 W_OUT.seeps=pools.length;
 const pts=L.brookL.map((p,i)=>[p[0],p[1],L.brookBed(i)+.35]);
 const BR=WATER.flow({name:'The seeps\' brook',pts,width:SITE.brook.w,speed:.7,rapids:[.0,.02]});
 const BD=WATER.drawFlow(BR,{shallow:lin(0x8a8a70),deep:lin(0x3a4a40),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.4,step:8,across:4,margin:.6,depthBias:1.5,renderOrder:2,pick:true});
 BD.mesh.userData.inspectLabel='The seeps\' brook';W_OUT.brook=pts.length;}
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
