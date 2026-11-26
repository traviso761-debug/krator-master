// ================================================================= HOST - the tarn, the bog pools and the ravine streams on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4. The records stay where they were made (45-host-stage.js: TARN,
// TARNL, POOLS, RAV with ravX/rimZ); the drawing is here, after 89z-host-atmos.js has run ATMOS.init (hence the name). The tarn is a
// WATER.still with a gradient (dark middle, grey-green rim, the old fan's colours); the bog pools are WATER.still too, all in ONE mesh
// (drawPools) in a peat tint; each ravine's stream is a WATER.flow along the ravine's floor line (ravX), its surface a running minimum of
// the floor height so it only falls, the fall of the ravine its slope (the foam on the steep reach comes from that). It replaces the
// dark band painted in the ground shader and the host's own MAT_WATER discs. The sky in the water is core/atmos's skylight, a capture
// of this page's dome and giant given to the water only. waterH and terrainH are unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a5a44)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
// ---- the tarn
const TARN_STILL=WATER.still({name:'The tarn',level:TARNL,poly:circ(TARN.x,TARN.z,TARN.r*1.35,64),
 gradient:{centre:lin(0x1e2e2e).getHex(),rim:lin(0x4a5a4a).getHex(),power:1.2}});
const TARN_DRAW=WATER.drawStill(TARN_STILL,{roughness:.08,metalness:.08,envMapIntensity:.4,renderOrder:1,pick:true});
TARN_DRAW.mesh.userData.inspectLabel='The tarn';
// ---- the bog pools: peat-dark, one mesh
const BOG_STILLS=POOLS.map((P,i)=>WATER.still({name:'A bog pool '+(i+1),level:P.l,poly:circ(P.x,P.z,P.r*1.25,16)}));
const BOG_DRAW=BOG_STILLS.length?WATER.drawPools(BOG_STILLS,{color:lin(0x2a2a1c),roughness:.07,metalness:.05,envMapIntensity:.35,renderOrder:1,pick:true,name:'Bog pools'}):null;
if(BOG_DRAW)BOG_DRAW.mesh.userData.inspectLabel='A bog pool';
// ---- the ravine streams: from just above each head down the floor to the foot of the drawn ground (the deck's top)
const STREAM_FLOWS=RAV.map((R,i)=>{const pts=[],W=[];let y=1e9,s=0,px=0,pz=0;
 for(let z=R.head+60;z>R.foot-400;z-=14){const x=ravX(R,z),h=terrainH(x,z);if(h<CLOUD_Y+6)break;
  y=Math.min(y,h+.45);if(pts.length){s+=Math.hypot(x-px,z-pz);}px=x;pz=z;pts.push([x,z,y]);W.push([s,Math.min(1.5+s*.03,6.5)]);}
 if(pts.length<3)return null;
 const F=WATER.flow({name:'A ravine stream '+(i+1),pts,width:W,speed:1.4,rapids:[.04,.2]});
 const D=WATER.drawFlow(F,{shallow:lin(0x4a5a44),deep:lin(0x223430),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:10,across:5,margin:1.2,depthBias:1.5,renderOrder:2,pick:true});
 D.mesh.userData.inspectLabel='A ravine stream';return{F,D};}).filter(Boolean);
window._water={tarn:!!TARN_DRAW,pools:BOG_STILLS.length,streams:STREAM_FLOWS.length};
// ---- the breakup (core/water ext/56; the final rebuild, pair 12): the tarn's and the bog pools' glint broken into patches of ripples, not
// the still water's regular stripes (the streams keep their own ripples, advected along the current). ?breakup=0 none
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
