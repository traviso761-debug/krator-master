// ================================================================= HOST — the wadis' pools after rain (core/water)
// The wadi records' own pools (KRELIEF.wadi: a pool every ~300 m by chance, its level a little under the floor's) drawn as WATER.still,
// all in one mesh, a muddy turbid tint: the floods leave them and the bell pools on their lips hold the water after they are gone.
// waterH (45) keeps every root out of them. The sky in the water is core/atmos's skylight.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
const POOL_STILLS=POOLS.map((P,i)=>WATER.still({name:'A wadi pool '+(i+1),level:P.l,poly:circ(P.x,P.z,P.r*1.05,16)}));
const POOL_DRAW=POOL_STILLS.length?WATER.drawPools(POOL_STILLS,{color:lin(0x5a5040),roughness:.1,metalness:.04,envMapIntensity:.35,renderOrder:1,pick:true,name:'Wadi pools'}):null;
if(POOL_DRAW)POOL_DRAW.mesh.userData.inspectLabel='A wadi pool (the flood\'s leavings)';
window._water={pools:POOL_STILLS.length};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
