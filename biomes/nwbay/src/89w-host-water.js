// ================================================================= HOST - the bay, the terraced river, the pools and the outer water on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4: the bay, its lagoons and the lowland reach of the river are ONE open
// surface (BAY_WATER: the CDLOD mesh, a calm swell and a share of the shared wave field on the module clock, the bed baked from groundH,
// a shore grid flooded from the bay's middle so the water stops where the beach is and laps a white edge in the shallows, the bay's
// shallow-to-deep ramp, and over it a TINT field: the pale sand shoals, the pale rim at the beach, the pale lagoon round every stack and
// the river's colour in the fresh water, the weights the page's old plane carried in its vertex colours, 45 waterTintK). The river's
// descent is a WATER.terraces chain (RIVER_TERRACES: a still pool on every tread at its level, a fall fitted down every riser, drawn in
// four calls) above the lowland reach's flow (RIVER_LOW); the cenotes and the shelf pools are still water. The far country's water is a
// second, flat surface under it all (OUTER_WATER, masked off over the bay). The page's own plane, ribbon, foam cards and shader are gone
// (45-host-stage.js). The sky in the water is a capture of this page's dome and giant, given to the water only. CPU twins:
// WATER.heightAt, WATER.flowAt (the terraces answer for their risers).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a6a4a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WQ0=new URLSearchParams(location.search);
const WBOX=[CENTER[0]-TERR.R*1.1,CENTER[1]-TERR.R*1.1,CENTER[0]+TERR.R*1.1,CENTER[1]+TERR.R*1.1];   // the old plane's square
// ---- the bay
const PALE_L=lin(WATER_PALE).getHex(),FRESH_L=lin(RIVER_COL).getHex();
/* THE RIVER'S PLUME (core/water ext/61, tintFlow; BACKPORT.md section 5, nwbay in its list; the catch-up pass, 2026-11-03; ?plume=0 the old
   still tint): the travertine river's milky-green water carried out from the delta's mouth into the turquoise bay, a tongue that fans and
   thins over ~700 m on a current that runs out along the river's last reach and spreads across it, with eddies and filaments, never an edge.
   It shares the bay's tint with the shoals and the river's own fresh water (whichever is strongest). xanadu's lake is the worked shape */
const PLUME=WQ0.get('plume')!=='0'?(function(){const M=XZ(MOUTH_U,vR(MOUTH_U)),Q=XZ(MOUTH_U+80,vR(MOUTH_U+80)),dx=M[0]-Q[0],dz=M[1]-Q[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l;
 const loc=(x,z)=>{const rx=x-M[0],rz=z-M[1];return[rx*ux+rz*uz,-rx*uz+rz*ux];};
 return{col:lin(RIVER_COL.clone().lerp(WATER_PALE,.45)).getHex(),
  a:(x,z)=>{const q=loc(x,z),al=q[0],w=60+.5*Math.max(0,al);return .7*smooth(-80,40,al)*smooth(760,140,al)*Math.exp(-(q[1]*q[1])/(w*w));},
  v:(x,z)=>{const q=loc(x,z),al=q[0];if(al<-100||al>1100)return null;const s=.45*smooth(1100,80,al),w=60+.5*Math.max(0,al),sp=.35*Math.tanh(q[1]/w);return[(ux-uz*sp)*s,(uz+ux*sp)*s];}};})():null;
const BAY_WATER=WATER.open({name:'The bay',level:0,swell:[[.05,40,225,0,.035],[.03,16,200,1.3,.025]],field:.1,bounds:WBOX,
 bed:groundH,bedBox:WBOX,bedCell:12,shore:{seeds:{edge:true,depth:2,sides:'es',points:[[BAY.c[0],BAY.c[1]]]}},
 tint:{box:WBOX,cell:12,at:(x,z)=>{const k=waterTintK(x,z),pa=PLUME&&bayIn(x,z)<0?PLUME.a(x,z):0;if(pa>k[0]&&pa>k[1]&&pa>.01)return{c:PLUME.col,a:pa};
  if(k[0]<.01&&k[1]<.01)return null;return k[1]>=k[0]?{c:FRESH_L,a:k[1]}:{c:PALE_L,a:k[0]};}},
 ...(PLUME?{tintFlow:{v:PLUME.v,cell:24}}:{})});
/* the breakers: the bay is a sea and keeps them (BACKPORT.md, "No breakers on still water": a sea keeps them); ?breakers=0 draws the shore grid
   without them, for the owner to judge against the rings round the stacks' lagoons that still water showed elsewhere */
const BAY_DRAW=WATER.draw(BAY_WATER,{rain:true,renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.22,ramp:[1.2,9],pick:true,
 shallow:lin(WATER_SHALLOW),deep:lin(WATER_DEEP.clone().multiplyScalar(.8)),...(WQ0.get('breakers')==='0'?{breakers:false}:{})});
BAY_DRAW.mesh.userData.inspectLabel='The bay';
// ---- the outer water: the far country's sea, flat, 0.15 m under the bay's, drawn only where the bay's surface is not
const OUTER_BOX=[CENTER[0]-9000,CENTER[1]-9000,CENTER[0]+9000,CENTER[1]+9000];
const OUTER_WATER=WATER.open({name:'The outer water',level:-.15,swell:[],field:0,bounds:OUTER_BOX,
 mask:(function(){const c=50,nx=360,nz=360,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OUTER_BOX[0]+(i+.5)*c,z=OUTER_BOX[1]+(j+.5)*c;
   const inside=x>WBOX[0]+m+c&&x<WBOX[2]-m-c&&z>WBOX[1]+m+c&&z<WBOX[3]-m-c;d[j*nx+i]=inside?0:255;}
  return{x0:OUTER_BOX[0],z0:OUTER_BOX[1],cell:c,nx,nz,data:d};})()});
const OUTER_DRAW=WATER.draw(OUTER_WATER,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.5,color:lin(WATER_DEEP)});
OUTER_DRAW.mesh.userData.inspectLabel='The outer water';
// ---- the river: the terraces (downstream order: a tread is a run of samples on one step, k past .95; the rest is the lowland reach)
const RIVER_DOWN=RIVER_SM.slice().reverse(),TERR_K=.95;
let RIVER_TERRACES=null,RIVER_LOW=null;
(function(){const up=[],low=[];RIVER_DOWN.forEach(q=>(q.k>TERR_K?up:low).push(q));
 if(up.length>2){const line=up.map(q=>[q.x,q.z]),acc=[0];for(let i=1;i<up.length;i++)acc.push(acc[i-1]+Math.hypot(up[i].x-up[i-1].x,up[i].z-up[i-1].z));
  const treads=[];let run=null;
  up.forEach((q,i)=>{if(q.ramp){run=null;return;}
   if(run&&run.si===q.si){run.s1=acc[i];run.ys.push(q.y);run.ws.push(q.w);return;}
   run={si:q.si,s0:acc[i],s1:acc[i],ys:[q.y],ws:[q.w]};treads.push(run);});
  const T=treads.filter(t=>t.s1-t.s0>=4).map(t=>({s0:t.s0,s1:t.s1,y:t.ys.reduce((a,b)=>a+b,0)/t.ys.length,w:t.ws.reduce((a,b)=>a+b,0)/t.ws.length}));
  for(let i=1;i<T.length;i++)if(T[i].y>=T[i-1].y-.05){T[i-1].s1=T[i].s1;T.splice(i,1);i--;}   // a step that does not descend joins the one above
  for(let i=1;i<T.length;i++)if(T[i].s0-T[i-1].s1>1.5)T[i].s0=T[i-1].s1+1.5;   // each lower pool runs up to the riser's face (45 RISERS: the channel is drawn down under it), so the fall drops 1.5 m out down a face, not over a slope
  try{RIVER_TERRACES=WATER.terraces({name:'The river (terraced pools)',line,treads:T,speed:1.6,spread:.6,treadSpeed:.25});}catch(e){reportErr('terraces: '+e.message);}}
 if(low.length>2)RIVER_LOW=WATER.flow({name:'The river (the lowland reach)',pts:low.map(q=>[q.x,q.z,q.y]),width:low.map(q=>q.w*2),speed:.8,rapids:[.04,.12]});})();
// THE FINAL REBUILD'S WATER (2026-10-27; core/water W1, W4, R9): every water takes the rain's rings; the falls' curtains run 1.2 m a
// side past the lip, as wide as the pool's water, and fade at their sides (W1: margin, edge); each terrace pool shades from its deep
// turquoise middle to the pale cream at its rimstone (W4, Semuc's look; ?poolgrad=0 for the one colour). No spray: this page has no
// core/atmos particles (ATMOS.smoke), and its 5 m risers need none
const WQ=new URLSearchParams(location.search),POOL_GRAD=WQ.get('poolgrad')!=='0'?{centre:lin(POOL_COL.clone().lerp(WATER_DEEP,.35)).getHex(),rim:lin(POOL_COL.clone().lerp(POOL_PALE,.7)).getHex(),power:1.3}:null;
const RIVER_DRAW=RIVER_TERRACES?WATER.drawTerraces(RIVER_TERRACES,{pool:{color:lin(POOL_COL),roughness:.08,metalness:.1,envMapIntensity:.35,renderOrder:2,pick:true,rain:true,gradient:POOL_GRAD},
 fall:{color:lin(0xf4f8f6),opacity:.94,cols:6,rowStep:.6,renderOrder:3,pick:true,margin:1.2,edge:.6,rain:true,
  plungeR:S=>S.lipW*.55,plungeFade:.3}}):null;   /* the churn rings inside the pool's banks (the core's 2.4 x the lip ran over them: the owner, 2026-10-27), fading out over 70 % of the disc */
const RIVER_LOW_DRAW=RIVER_LOW?WATER.drawFlow(RIVER_LOW,{shallow:lin(RIVER_COL),deep:lin(RIVER_COL.clone().lerp(WATER_DEEP,.3)),color:0xffffff,roughness:.14,metalness:.05,
 envMapIntensity:.5,step:10,across:6,margin:1.2,depthBias:2,renderOrder:2,pick:true,rain:true}):null;
// WEED (core/water ext/54 W.weed, BACKPORT.md nwbay's row; ?weed=0 off): comb-weed and riverweed down the lowland reach's clear travertine
// water, denser where it runs. The row's kelp beds in the bay are not drawn: W.weed lays blades down a flow line, and the bay is open
// water with no line; a bed kind for open water (seagrass, kelp) would be a new core kind
const RIVER_WEED=RIVER_LOW&&WQ.get('weed')!=='0'&&WATER.weed&&WATER.drawWeed?WATER.drawWeed(WATER.weed(RIVER_LOW,{look:'clear',bed:groundH,seed:8131})):null;
// ---- the cenotes' pools: pale turquoise under the walls' overhang, deep at the middle (a still with a gradient)
const CENOTE_POOLS=SINKS.filter(S=>S.kind==='cenote').map(S=>{const poly=[];for(let s=0;s<40;s++){const a=s/40*TAU,r=sinkRad(S,a)*(1+S.bell+.05);poly.push([S.x+Math.cos(a)*r,S.z+Math.sin(a)*r]);}
 const P=WATER.still({name:S.name+' (its pool)',level:.04,poly,gradient:{centre:lin(WATER_DEEP.clone().lerp(WATER_MID,.4)).getHex(),rim:lin(WATER_PALE).getHex(),power:1.4}});
 WATER.drawStill(P,{roughness:.06,metalness:.1,envMapIntensity:.3,renderOrder:1,pick:true,rain:true});return P;});
// ---- the shelf pools: every rimstone pool a still at its level, all of them one mesh
const SHELF_STILLS=SHELF_POOLS.map((q,i)=>WATER.still({name:q.name+' '+(i+1),level:q.y,poly:q.pts}));
const SHELF_DRAW=SHELF_STILLS.length?WATER.drawPools(SHELF_STILLS,{color:lin(POOL_COL.clone().lerp(POOL_PALE,.5)),roughness:.06,metalness:.1,envMapIntensity:.35,renderOrder:1,pick:true,rain:true,gradient:POOL_GRAD,name:'Shelf pools'}):null;
window._water={plume:!!PLUME,bay:!!BAY_DRAW,terraces:RIVER_TERRACES?RIVER_TERRACES.pools.length:0,falls:RIVER_TERRACES?RIVER_TERRACES.falls.length:0,low:!!RIVER_LOW,weed:RIVER_WEED?(RIVER_WEED.count||RIVER_WEED.n||true):0,cenotes:CENOTE_POOLS.length,shelf:SHELF_STILLS.length};
