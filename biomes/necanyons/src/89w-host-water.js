// ================================================================= HOST — the creek and the rain pools on core/water
// The records are made in 47-host-land.js (WATER_RECS: the creek a flow line, each rain pool on the slickrock still water);
// drawn here once core/atmos is bound (89a-host-atmos.js: its clock on the host's hour, its wave chunk, the sky's light): the creek as its
// ribbon (the ripples carried down the current, white along the banks), the pools as one mesh of discs with one still
// material (WATER.stillMaterial: the sky in them, a faint ripple). The sky in the water is core/atmos's skylight: a capture
// of this page's dome and giant given to the water only (the page's own materials keep their lighting), taken again as
// the hour moves (89n-host-night.js tints the dome). Their CPU twins: WATER.heightAt, WATER.flowAt; core/export carries
// them to Godot (godot/krator/water_import.gd draws them). 2026-10-26 (core/water R9): both take the rain's rings (rain: true).
const WATER_DRAW=(function(){if(typeof ATMOS==='undefined'||!WATER_RECS)return null;try{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));env.add(giant.clone());
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3a2c22),key:()=>Math.round(NIGHT.f*8)});
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 const CREEK_OPT={shallow:lin(0x4a5a44),deep:lin(0x223430),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,step:12,across:6,margin:1.5,rain:true};
 if(WATER_RECS.creek){out.creek=WATER.drawFlow(WATER_RECS.creek,CREEK_OPT);out.creek.mesh.userData.inspectLabel=WATER_RECS.creek.name;}
 if(WATER_RECS.pools.length){const pos=[];WATER_RECS.pools.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
   for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.07,.11,.10),roughness:.08,metalness:.1,envMapIntensity:.35,rain:true}));
  m.userData.probeSkip=true;m.userData.inspectLabel='A rain pool on the slickrock';m.renderOrder=1;scene.add(m);out.pools=m;}
 /* THE WATER WORKS (47: WORKS, WATER_RECS.works; 2026-10-27, the final rebuild; ?springs=0 without them): the High Cap's spring fall, a
    thin white curtain down 300 m of wall following the talus into its pool (drawFall's plungeR sized to the pool, footK .8: white water
    to its foot, the Rift's tall falls), its pool and its stream, which meets the creek in one surface (WATER.confluence over the mouth,
    drawn with the creek's own options; both ribbons faded inside it), and the Bench's karst springs (the spring look's pool, the boil,
    the clear run). Colours linearised: this page's water takes linear colour */
 const Wk=WATER_RECS.works||(WATER_RECS.mkWorks&&(WATER_RECS.works=WATER_RECS.mkWorks()));
 if(Wk){
  if(Wk.fall){out.fall=WATER.drawFall(Wk.fall,{color:lin(0xd2ddd8),opacity:.85,rows:48,cols:4,margin:1,lipK:.85,spray:'drop',rain:true,envMapIntensity:.25,renderOrder:3,plungeR:WORKS.fall.pool.r*.8,footK:.8});
   out.fall.mesh.userData.inspectLabel=Wk.fall.name;if(out.fall.plunge)out.fall.plunge.userData.inspectLabel=Wk.fall.name;}
  if(Wk.pool){const C=WATER.LOOKS&&WATER.LOOKS.clear?lin(WATER.lookHex('clear',.4)):lin(0x2a4a44);
   out.pool=WATER.drawStill(Wk.pool,{color:C,roughness:.06,metalness:.1,envMapIntensity:.35,renderOrder:1,rain:true});out.pool.mesh.userData.inspectLabel=Wk.pool.name;}
  if(Wk.stream){out.stream=WATER.drawFlow(Wk.stream,Object.assign({},CREEK_OPT,{step:2,across:3,margin:.6,renderOrder:2}));out.stream.mesh.userData.inspectLabel=Wk.stream.name;
   if(WATER.confluence&&out.creek&&RQ.get('confluence')!=='0'){const e=Wk.stream.pts[Wk.stream.pts.length-1];
    try{const CF=WATER.confluence({name:"Where the fall's stream meets the creek",flows:[WATER_RECS.creek,Wk.stream],at:[e.x,e.z],ground:terrainH});
     out.confluence=WATER.drawConfluence(CF,CREEK_OPT);WATER.fadeRibbons(CF,[out.creek,out.stream]);}catch(e2){reportErr('confluence: '+(e2&&e2.stack||e2));}}}
  out.springs=(Wk.springs||[]).map(K=>{const G=K.pool.gradient;if(G)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(G.centre).getHex(),rim:lin(G.rim).getHex(),power:G.power});
   const P=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
   const F=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:2,across:3,margin:.5,envMapIntensity:.4,renderOrder:2,pick:true,rain:true}));
   return{P,F};});
  window._works={fall:!!out.fall,pool:!!out.pool,stream:!!out.stream,confluence:!!out.confluence,springs:out.springs.length};}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
// HEIGHT FOG (R1, here after 89n: its sky reads the night's hour; core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js, 2026-10-27): the air's fog up to the ground under the
// eye, thinning above it, so from the Bench's fins and the High Cap the canyons below lie in their haze while the caps stand clear;
// the morning mist pools along the creek and in the canyon floor's hollows (below 8 m over the floor). Dense air (~1.9 atm), its
// falloff long over the canyons' 300-450 m of relief. ?hfog=0 to compare
if(new URLSearchParams(location.search).get('hfog')!=='0'){ATMOS.heightFog({falloff:1/520,sun:.35,sky:.35,mist:{density:.0016,y:-2,depth:12,noise:.7}});ATMOS.heightFogScene(scene);}
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet ground or rings under the crowns and the overhangs
ATMOS.rainCover({renderer});
