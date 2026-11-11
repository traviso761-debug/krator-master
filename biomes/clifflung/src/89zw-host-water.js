// ================================================================= HOST — the wells: each mouth's pool on core/water (PLAN.md section 6, "The mouths and the wells")
// The condensate a mouth weeps (LUNG.yield: 4-20 m3 a day, a spring and not a river) runs off the collar into a pool dug beside it (45: WELLS) and out
// of it downhill as a thread: core/water's karst spring (ext/54 W.karstSpring: a still pool with the spring look and its thread, a flow), drawn by
// ext/54b. A husk's well is dry rock: only a live mouth's pool holds water. The water's sky is core/atmos's skylight, a capture of this page's dome.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a5a44)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const WELL_DRAW=WELLS.filter(W=>W.live&&WATER.karstSpring).map((W,i)=>{const M=W.mouth,dx=W.x-M.x,dz=W.z-M.z,dl=Math.hypot(dx,dz)||1,dir=[dx/dl,dz/dl];
 const line=[];let yc=W.l;for(let k=0;k<=10;k++){const t=k/10,x=W.x+dir[0]*(W.r*.8+t*26),z=W.z+dir[1]*(W.r*.8+t*26);yc=Math.min(yc,terrainH(x,z)+.15);line.push([x,z,yc]);}
 const K=WATER.karstSpring({name:'The well (uelos) of '+M.lung,at:[W.x,W.z,W.l],r:W.r,dir,line,width:.8,speed:.4,seed:0x1A60+i});
 const G=K.pool.gradient;if(G)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(G.centre).getHex(),rim:lin(G.rim).getHex(),power:G.power});
 const P=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true}));
 const F=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:2,across:3,margin:.4,envMapIntensity:.4,renderOrder:2,pick:true}));
 P.mesh.userData.inspectLabel='The well (uelos) of '+M.lung+': '+M.yield+' m3 of condensate a day';
 REGISTER({name:'The well (uelos) of '+M.lung+': '+M.yield+' m3 a day, the hamlet\'s water',x:W.x,z:W.z,y:W.l-3,r:W.r*1.2,h:6,well:M.id});probeAt(W.x,W.z,.3);
 return{K,P,F,W};});
window._water={wells:WELL_DRAW.length};
if(WATER.breakupAll&&new URLSearchParams(location.search).get('breakup')!=='0'){try{WATER.breakupAll();}catch(e){reportErr('breakup: '+e.stack);}}
