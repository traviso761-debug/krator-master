// ================================================================= HOST - the inland sea, the bayou and the river on core/water
// core/water (core/water/README.md), 2026-10-20, migration phase 3. The page's one plane (vertex colours by depth and place, ripples in its own shader) is two
// open surfaces at y=0 that share the map's box (2.2 R, the bed baked once at 8 m from terrainH): the inland sea (WATER.open with a shore grid flooded from
// its middle, the CDLOD mesh, a calm swell and a share of the shared wave field on the module clock, the bed's depth tint, surf where it is under 1.4 m,
// the sky in the water from core/atmos's skylight) over the cells off the inland water; and the INLAND water (the bayou pools and oxbows, the delta, the
// river's lowland reach and a short plume off the delta: a flat tea-dark surface of its own, drawn only over the cells that hold it). The two masks are
// complements, so no cell is drawn twice; the tint changes at the shore (the old plane blended it over 90 m: KNOWN_ISSUES.md). The river through the hills is RIVER's
// ribbon (45-host-stage.js). The sky in the water is a capture of this page's dome and giant, given to the water only (WENV: the page's own materials keep
// their lighting). CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a6a4a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// the river through the hills is a lowland river (the old ribbon had no rapids): foam only where it really steepens (the flow's own rapids band, 2026-10-21; it was a page-wide preset)
const WATER_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],WATER_CELL=8,WATER_NX=Math.ceil((WATER_BOX[2]-WATER_BOX[0])/WATER_CELL);
// the ground at the bed's cell centres, once: the shore grid and the masks read this array (bakeBed and shoreGrid sample at those centres)
const WATER_G=new Float32Array(WATER_NX*WATER_NX);
for(let j=0;j<WATER_NX;j++)for(let i=0;i<WATER_NX;i++)WATER_G[j*WATER_NX+i]=terrainH(WATER_BOX[0]+(i+.5)*WATER_CELL,WATER_BOX[1]+(j+.5)*WATER_CELL);
const waterBed=(x,z)=>WATER_G[Math.min(WATER_NX-1,Math.max(0,Math.floor((z-WATER_BOX[1])/WATER_CELL)))*WATER_NX+Math.min(WATER_NX-1,Math.max(0,Math.floor((x-WATER_BOX[0])/WATER_CELL)))];
// the inland water's cells (16 m): any of their four 8 m ground cells under 0.4 m, inland of the shore or in the delta's plume (within 45 m of a channel and 120 m off the shore)
const INLAND_MASK=(function(){const c=2*WATER_CELL,nx=WATER_NX>>1,d=new Uint8Array(nx*nx),G=WATER_G,N=WATER_NX;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=2*j*N+2*i,h=Math.min(G[k],G[k+1],G[k+N],G[k+N+1]);if(h>=.4)continue;
  const x=WATER_BOX[0]+(i+.5)*c,z=WATER_BOX[1]+(j+.5)*c,si=seaIn(x,z);
  if(si>=0||(si>-120&&riverD(x,z)<45))d[j*nx+i]=255;}
 return{x0:WATER_BOX[0],z0:WATER_BOX[1],cell:c,nx,nz:nx,data:d};})();
const SEA_MASK={x0:INLAND_MASK.x0,z0:INLAND_MASK.z0,cell:INLAND_MASK.cell,nx:INLAND_MASK.nx,nz:INLAND_MASK.nz,data:INLAND_MASK.data.map(v=>255-v)};
// the inland sea: calm (the old plane was flat with a ripple normal), the bed's shallows over sand, the deep beyond
const SEA_WATER=WATER.open({name:'The inland sea',level:0,swell:[[.06,45,300,0,.04],[.035,18,260,1.3,.03]],field:.12,bounds:WATER_BOX,
 bed:waterBed,bedBox:WATER_BOX,bedCell:WATER_CELL,shore:{seeds:[xzOf(-2600,0)]},mask:SEA_MASK});
const SEA_DRAW=WATER.draw(SEA_WATER,{renderOrder:1,roughness:.26,metalness:.05,envMapIntensity:.22,
 shallow:lin(SEA_SHALLOW.clone().lerp(SEA_MID,.3)),deep:lin(SEA_DEEP.clone().multiplyScalar(.75))});
SEA_DRAW.mesh.userData.inspectLabel='The inland sea';
// the inland water: three-centimetre ripples on a flat surface, one tea-dark colour between the bayou's and the river's
const INLAND_WATER=WATER.open({name:'The bayou and the river',level:0,swell:[[.015,6,35,0,.02],[.01,3.5,-50,1.3,.02]],field:0,bounds:WATER_BOX,mask:INLAND_MASK});
const INLAND_DRAW=WATER.draw(INLAND_WATER,{renderOrder:1,roughness:.14,metalness:.05,envMapIntensity:.35,color:lin(BAYOU_COL.clone().lerp(RIVER_COL,.5).multiplyScalar(.8))});
INLAND_DRAW.mesh.userData.inspectLabel='The bayou and the river';
// THE CLEAR-WATER LOOK (core/water ext/54; BACKPORT.md's row; ?clearwater=0 for the tea hue): below the springs the hills' river runs clear green over its bed; a station's river its own (ST.riverLook)
const WQ=new URLSearchParams(location.search),CLEAR=WQ.get('clearwater')!=='0'&&SPRINGS.length&&WATER.LOOKS&&WATER.LOOKS.clear;
const RIVER_SH=ST&&ST.riverLook?lin(ST.riverLook[0]):CLEAR?lin(WATER.lookHex('clear',.62)):lin(RIVER_COL),RIVER_DP=ST&&ST.riverLook?lin(ST.riverLook[1]):CLEAR?lin(WATER.lookHex('clear',.2)):lin(BAYOU_COL);
const RIVER_DRAW=WATER.drawFlow(RIVER,{rain:true,rapids:ST&&ST.rapids?ST.rapids:[.08,.3],shallow:RIVER_SH,deep:RIVER_DP,color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:24,across:6,margin:1.2,renderOrder:2,chute:ST&&ST.chute});
RIVER_DRAW.mesh.userData.inspectLabel='The river';
// a station's cataracts (ST.falls): every step of its river a fall, all their curtains one mesh and their plunge pools another (WATER.drawFalls), the spray by each fall's drop
if(ST&&ST.falls){const FS=WATER.fallsOf(RIVER,Object.assign({fit:true},ST.falls)).map(f=>WATER.fall(f));if(FS.length){const D=WATER.drawFalls(FS,{name:'The cataracts',color:lin(0xdce8e6),opacity:.9,envMapIntensity:.25,renderOrder:3,margin:1.2,spray:'drop'});D.mesh.userData.inspectLabel='The cataracts';if(D.plunge)D.plunge.userData.inspectLabel='The cataracts';}window._falls=FS.length;}
// a station's flood pulse (ST.flood; core/water's seasonal still, the hyperjungle lake's lines): the level on the world clock's wet season, stepped every frame
if(ST&&ST.flood){const FL=window._flood=WATER.still({name:'The flood on the bench',poly:ST.flood.poly(),seasonal:{low:ST.flood.low,high:ST.flood.high,lagD:ST.flood.lagD,sharp:ST.flood.sharp}});
 const D=WATER.drawStill(FL,{color:lin(RIVER_COL),roughness:.14,metalness:.05,envMapIntensity:.35,renderOrder:1,rain:true,pick:true});D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='The flood on the bench';tick(()=>{if(KHOST.host)WATER.stepSeasons(KHOST.host.clock);});}
// THE CLEAR SPRINGS (45 SPRINGS; core/water ext/54 W.karstSpring, swbay's lines): each a still pool with the spring look's gradient and the boil at its vent, and its run, a gin-clear flow from the pool's lip down
// its own bank to the river's edge, a quarter metre over the ground and never climbing
const SPRING_DRAW=SPRINGS.map((S,i)=>{const R=xzOf(S.s,RIVER_T(S.s)),tx=R[0]-S.x,tz=R[1]-S.z,tl=Math.hypot(tx,tz),dir=[tx/tl,tz/tl],lvl=S.y0-.1;
 const run=Math.max(8,tl-14),line=[];let yc=lvl;for(let k=0;k<=12;k++){const t=k/12,x=S.x+dir[0]*(S.r*.8+t*run),z=S.z+dir[1]*(S.r*.8+t*run);yc=Math.min(yc,terrainH(x,z)+.25);line.push([x,z,yc]);}
 const K=WATER.karstSpring({name:'The clear spring '+(i+1),at:[S.x,S.z,lvl],r:S.r,dir,line,width:3.4,speed:.7,seed:8150+i});
 const G=K.pool.gradient;if(G)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(G.centre).getHex(),rim:lin(G.rim).getHex(),power:G.power});
 const P=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
 const F=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:2,across:3,margin:.5,envMapIntensity:.4,renderOrder:2,pick:true,rain:true}));
 return{K,P,F};});
window._springs=SPRING_DRAW.length;
// one spring's run meets a station's river in one surface (WATER.confluence, BACKPORT.md section 5: the great gorge); ?confluence=0
if(ST&&SPRING_DRAW.length&&WQ.get('confluence')!=='0'){try{const K=SPRING_DRAW[0].K.flow,e=K.pts[K.pts.length-1],CF=WATER.confluence({name:'Where the spring meets the river',flows:[RIVER,K],at:[e.x,e.z],ground:terrainH});
 WATER.drawConfluence(CF,{shallow:RIVER_SH,deep:RIVER_DP,color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,renderOrder:2,rain:true});WATER.fadeRibbons(CF,[RIVER_DRAW,SPRING_DRAW[0].F]);window._confluence=1;}catch(e2){console.warn('confluence: '+(e2&&e2.message));window._confluence=0;}}
// COMB WEED in the clear river (core/water ext/54, 54b; BACKPORT.md's row; ?weed=0): the look with green weed on the flow's bed; one instanced mesh, swaying on the module clock
if(CLEAR&&WQ.get('weed')!=='0'&&WATER.LOOKS.clear.weed){const W_L=WATER.weed(RIVER,{look:'clear',seed:8160});if(W_L.length){const WD=WATER.drawWeed(W_L,{});if(WD&&WD.mesh)WD.mesh.userData.inspectLabel='Comb weed';window._weed=W_L.length;}}
// the sea's and the river's glints broken up (core/water ext/56, the eastabyss look: the owner's zigzag); ?breakup=0
if(WQ.get('breakup')!=='0'&&WATER.breakupAll){WATER.breakupAll();WATER.breakupFlows();}
