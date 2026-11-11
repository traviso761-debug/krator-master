// ================================================================= HOST — the water (core/water; PLAN.md sections 1 and 8)
// The plateau's water is the melt's, seasonal only (no river record crosses the polygon on 5.1): the wash's pools and the playa's sheets stand in the
// melt and the bloom and are dry the rest of the year (WATER.still, seasonal: its level moved by the bloom's calendar, 89z), the canyon's melt stream
// runs on its floor (WATER.flow), and the cliff town's seeps (WATER.spring, cool and clear) come out at each alcove's back. The flash flood is a hazard
// record (84, PAINTED_HAZ.flood). CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is the stage's (WATER_AT).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x9a8a78)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const P=[];for(let k=0;k<n;k++){const a=k/n*TAU;P.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return P;};
let BIGW=null,BIG_DRAW=null;const W_OUT={},MELT=[];
// a melt pool: drawn at its full level, hidden under the ground (its mesh lowered) when the calendar says dry
function meltPool(name,x,z,r,level){const S=WATER.still({name,level,poly:circ(x,z,r,20),gradient:{centre:lin(0x6a7a70).getHex(),rim:lin(0xb8b0a0).getHex(),power:1.2}});
 const D=WATER.drawPools([S],{name,color:0xffffff,roughness:.05,metalness:.05,envMapIntensity:.5,renderOrder:1,pick:true});D.mesh.userData.inspectLabel=name;
 MELT.push({S,D,x,z,r,level,y0:D.mesh.position.y});return S;}
if(SKEY==='stripes'){/* the wash's pools (KRELIEF.wadi's own: the scour holes the melt fills) */
 L.WADI.pools.forEach((p,i)=>meltPool('A melt pool in the wash',p.x,p.z,Math.max(3,p.r*.8),p.y));W_OUT.pools=L.WADI.pools.length;}
if(SKEY==='bloom'){/* the playa's sheets after the melt, in its lowest hollows: a few centimetres of water over the clay */
 const P=SITE.playa;[[P.x-500,P.z+150,160],[P.x+380,P.z-260,120],[P.x+900,P.z+300,90],[P.x-120,P.z+520,70]].forEach(q=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,terrainH(q[0]+Math.cos(a)*q[2]*.5,q[1]+Math.sin(a)*q[2]*.5));}
  meltPool('A melt sheet on the playa',q[0],q[1],q[2],lo+.04);});W_OUT.pools=MELT.length;}
if(SKEY==='canyon'){const K=SITE.canyon,pts=[];for(let x=-2860;x<=2860;x+=20)pts.push([x,L.cz(x)]);
 const FL=WATER.flow({name:'The canyon\'s melt stream',pts:pts.map(p=>[p[0],p[1],L.fl(p[0])+.35]),width:K.w,speed:1.4,rapids:[.01,.05]});
 const FD=WATER.drawFlow(FL,{shallow:lin(0xa89878),deep:lin(0x6a5a48),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
 FD.mesh.userData.inspectLabel='The canyon\'s melt stream (brown with the beds\' clay)';W_OUT.stream=true;
 WATER_AT=(x,z)=>Math.abs(z-L.cz(x))<K.w/2?L.fl(x)+.35:-1e9;}
if(SKEY==='cliff'){/* the seeps at the alcoves' backs: cool, clear, a little lime (the clay's), each a small pool on the alcove's floor */
 SEEPS.forEach((s,i)=>{const S=WATER.spring({key:'seep'+i,name:'A seep at the alcove\'s back (the water stopped by the clay)',x:s.x,z:s.z,r:2.2,level:s.y+.05,temp:.04,mineral:'sinter',milky:.1,boil:0,steam:0});
  const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:new Map(),renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel='A seep (an alcove\'s spring)';});
 W_OUT.seeps=SEEPS.length;}
/* the stage's waterH: the stills the calendar has filled (a dry pool is no water), the stream */
if(MELT.length){const W0=WATER_AT;WATER_AT=(x,z)=>{for(const m of MELT)if(m.S.level>m.level-.5&&Math.hypot(x-m.x,z-m.z)<m.r&&m.S.contains(x,z))return m.S.level;return W0?W0(x,z):-1e9;};}
/* the melt's water by the calendar: full in the melt and the early bloom, gone by midsummer (89z calls it each frame with the bloom's record) */
function meltWater(B){const wet=Math.max(B.melt,B.green*(1-B.seed)*.8);for(const m of MELT){m.S.level=m.level-(1-smooth(.05,.35,wet))*1.2;m.D.mesh.position.y=m.y0+(m.S.level-m.level);m.D.mesh.visible=wet>.05;}}
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
