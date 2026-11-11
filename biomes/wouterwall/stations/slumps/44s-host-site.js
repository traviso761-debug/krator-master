// ================================================================= HOST — the site (station 2: the slump terraces)
// PLAN.md section 7, station 2: an uphill-facing scarp in the crater's patchwork rock, the trench lake under it, the next block's back tilted
// toward the wall, landslip pinnacles below a broken front, puya spikes on the dry slopes. On the scale model (5.1) the trench lake at
// 4,430 m (84 km², px 316.5-319.5 by 810-827) lies in the middle bench's sag trough; the page stands on the head scarp over its WEST
// shore, px 316,818 (region/far.py): 4,688 m, 0.89 atm, Dfc, mean -1 °C, 361 mm. The lake fills the page's east third.
//
// THE LANDFORMS are core/terrain's (38c-core-landforms.js), one record, composed on the model:
//   KRELIEF.slump  the scarp's metres: three back-tilted blocks stepping down east toward the lake under a head scarp, an uphill-facing
//                  (antithetic) scarp across each, sag ponds along their backs, a sackung trench behind the crown, a toe bulging out
//                  over the shore; their fronts broken, where the landslip pinnacles stand (KSTACKS spires: siteStacks)
// The model's lake is 45's MODEL_LAKE_AT (SITE.lake: its cells fitted, its shore lifted over the block's back east of it, which the
// model leaves 100 m under the level). No loess here (WOW.bench: gone above ~4.1 km): the walls are the patchwork rock (SITE.slots).
const SITE={
 name:'slumps',title:'The slump terraces',R:1800,step:8,seed:5301,loess:0,warm:0,
 // the ground's two station slots (47): the patchwork rock on the scarps (KSTRATA megabreccia on it), the talus under them
 slots:['rock','rubble'],
 // the slump: its crown a north-south line west of the page's middle, the blocks stepping down EAST (toward the lake) from it
 slump:{crown:[[-1250,2700],[-1180,900],[-1300,-900],[-1220,-2700]],n:3,bw:390,h:52,tilt:9,front:.16,face:20},
 // the model's trench lake, fitted (45): drawn to 20 km, its shore ring 700 m; probe a point in it (99's negatives)
 lake:{near:20000,ring:700,depth:45,lift:6,cell:100,name:'The trench lake (a sag pond 84 km² along the middle bench\'s head scarp, 4,430 m)',probe:[1500,0]},
 // the landslip pinnacles on the blocks' broken fronts (siteStacks)
 pinnacles:{n:16,seed:5311},
 snow:{autumn:[150,600],winter:[-2000,-1900],spring:[-500,-200],summer:[2400,3000]},
 eye:30,
 // the LOD spine (47): the blocks over the shore, the scarp's middle, the north and south ends
 spine:()=>[[-500,0],[-1000,-900],[-700,900],[100,-300]],
 need:{zones:['scarp','water','larch','steppe','shore'],keys:{'landform.pinnacle':6},larch:40,trees:60},
 views:V=>{const P0=typeof PILLARS!=='undefined'&&PILLARS.length?PILLARS[Math.floor(PILLARS.length/2)]:null,sh=SITE_SHORE(0),sh2=SITE_SHORE(-900),bl=SITE_BLOOM();const o={
  'The trench lake under the scarp':V([sh-40,0,4],[-700,150,40]),   /* on the beach, 40 m back from the water */
  'An uphill-facing scarp':V(SITE_ANTI(1,200,-70,3),SITE_ANTI(1,200,40,6)),
  'The block\'s back, tilted toward the wall':V(SITE_ANTI(2,-500,60,4),[-1100,-500,30]),
  'Across the lake to the next bench':V([sh2-120,-900,6],[6000,-1400,0]),
  'Sag ponds on the blocks':V(SITE_POND_VIEW(),SITE_POND_AT()),
  'The slumps from above':V([-2200,-1600,520],[400,300,0]),
  'West to the wall':V([-300,600,30],[-8000,-200,800])};
  if(P0)o['Landslip pinnacles below a broken front']=V(SITE_DRY(P0.x,P0.z,[[60,35],[-60,35],[60,-35],[-60,-35],[80,0],[0,80],[0,-80]],4),[P0.x,P0.z,(P0.top-P0.y0)*.55]);
  if(bl)o['Puya spikes on the dry slope']=V(SITE_DRY(bl[0],bl[1],[[22,14],[-22,14],[22,-14],[-22,-14]],3),[bl[0],bl[1],6]);
  return o;},
 // the station's own checks (99): the slump drawn (its parts on the ground), the lake held by its shore, the puya on the dry slopes
 checks:()=>[{name:'the slump\'s parts on the ground (head, blocks, uphill-facing scarps, fronts, ponds)',run:()=>SITE_PARTS_CHECK(SITE_PARTS())},
  {name:'the trench lake held by its shore (no water over the block east of it)',run:()=>SITE_LAKE_CHECK(SITE_LAKE_PROBE())},
  {name:'puya spikes on the dry bench',run:()=>SITE_PUYA_CHECK(window._biome&&window._biome.natives)}],
 negatives:()=>[{name:'no uphill-facing scarp',run:()=>SITE_PARTS_CHECK(Object.assign({},SITE_PARTS(),{anti:0}))},
  {name:'water over the block',run:()=>SITE_LAKE_CHECK(Object.assign({},SITE_LAKE_PROBE(),{over:7}))},
  {name:'no puya',run:()=>SITE_PUYA_CHECK({puya:0,bloom:0})}]
};
// the scarp's own roughness (a few metres), core/rand's noise, never a page fbm
function siteSwell(x,z){return 4*(KRAND.fbm(x*.0012+3.1,z*.0012-5.3,0,3,5302)-.5)*2+1.2*(KRAND.fbm(x*.008-2.2,z*.008+6.8,0,2,5306)-.5)*2;}
// THE RECORDS (made once the model's ground exists: 45 calls siteBuild): plain data, JSON-safe, the page's export carries them
let SITE_RECS=null;const SITE_SPRING=null,SITE_STREAM=null;
function siteBuild(ground){const S=SITE.slump;
 const slump=KRELIEF.slump({pts:S.crown,side:1,n:S.n,bw:S.bw,h:S.h,tilt:S.tilt,front:S.front,face:S.face,
  ponds:{every:420,p:.55,len:[60,180],w:[18,40],d:[2,5]},sackung:{d:S.bw*.45,w:50,depth:S.h*.25},toe:{h:S.h*.3,w:S.bw*.55},seed:SITE.seed+1});
 SITE_RECS={slump};SITE_RECS.ponds=KRELIEF.waters(slump,ground);return SITE_RECS;}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and the slump's part
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=MODEL(x,z),g0=m+siteSwell(x,z),S=SITE_RECS.slump;
 const g1=KRELIEF.shape(S,x,z,g0),a=KRELIEF.at(S,x,z,g0);
 const P={g0,g2:g1,y:g1,rel:g1-m,cut:0,part:a?a.part:'bench',rec:a?'slump':null,order:-1,terrace:false,top:'bench',k:a?a.k:-1,
  rubble:a&&(a.part==='toe'||a.part==='front')?.45:0};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
function siteFloor(){return 0;}
function siteGully(){return 0;}
function siteYuan(){return 0;}
function SITE_TRUNK_AT(){return [-600,0];}
// THE SAG PONDS (47 holds them as still water: waterH, the zones, 89w draws them): the slump's, each an ellipse at its spill level
function sitePools(){return (SITE_RECS.ponds||[]).map((p,i)=>({id:'pond'+i,x:p.x,z:p.z,rx:p.rx,rz:p.rz,ry:p.ry,y:p.y,name:'A sag pond on a slumped block\'s back'}));}
// THE STACKS (47 draws them): landslip pinnacles on the blocks' broken fronts (the Storr's kind: the front edge of a slumped block
// breaking into spires of the patchwork rock), the foot under the lowest ground round each
function siteStacks(ctx){const T=SITE.pinnacles,s=KRAND.stream(KRAND.hash(T.seed,1)),L=[];
 for(let t=0;t<4000&&L.length<T.n;t++){const x=s.range(-1300,400),z=s.range(-SITE.R*.9,SITE.R*.9),P=sitePoint(x,z);if(P.part!=='front')continue;
  const r=s.range(3,7),H=s.range(16,42);if(L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r+14))continue;if(MODEL_LAKE_AT&&MODEL_LAKE_AT.dist(x,z)<60)continue;
  const B=KSTACKS.make({id:'pinnacle'+L.length,kind:'spire',x,z,y0:ctx.footY(x,z,r),seed:T.seed+L.length,H,r,e:s.range(1.1,1.8),ry:s.range(0,TAU),taper:s.range(.4,.6),lean:s.range(0,.07),crown:s.range(.35,.6)});
  B.name='A landslip pinnacle ('+H.toFixed(0)+' m of the patchwork rock, left standing as the block\'s front broke away)';B.key='landform.pinnacle';B.tex='rock.megabreccia';L.push(B);}
 return L;}
// ---------------------------------------------------------------- the views' points and the station's checks
// the lake's west shore on a row: the first point east of the scarp where the drawn ground is under the lake's level
function SITE_SHORE(z){const lv=MODEL_LAKE_AT?MODEL_LAKE_AT.level:-1e9;for(let x=-400;x<2600;x+=10)if(terrainH(x,z)<lv)return x-30;return 900;}
// a point on block k's uphill-facing scarp at row z, `off` m along the downslope normal from it (east +)
function SITE_ANTI(k,z,off,h){for(let x=-1300;x<600;x+=4){const a=KRELIEF.at(SITE_RECS.slump,x,z,0);if(a&&a.part==='anti'&&a.k===k-1)return [x+off,z,h];}return [-600+off,z,h];}
// the views' eyes stand on the near ground's drawn triangles (inside its box, SITE.R*1.15) and out of the water: the first of the offsets
// round (x, z) that is, at h m over the ground
function SITE_DRY(x,z,offs,h){const lim=SITE.R*1.1;for(const o of offs){const X=x+o[0],Z=z+o[1];if(Math.max(Math.abs(X),Math.abs(Z))<lim&&!(waterH(X,Z)>terrainH(X,Z)-.5))return [X,Z,h];}
 return [x+offs[0][0],z+offs[0][1],h];}
// the sag pond the view looks at: the one nearest the page's middle
const SITE_POND=()=>{let b=null,bd=1e9;(SITE_RECS.ponds||[]).forEach(p=>{const d=Math.max(Math.abs(p.x),Math.abs(p.z));if(d<bd){bd=d;b=p;}});return b;};
const SITE_POND_AT=()=>{const p=SITE_POND();return p?[p.x,p.z,0]:[-800,0,0];};
const SITE_POND_VIEW=()=>{const p=SITE_POND();return p?SITE_DRY(p.x,p.z,[[70,40],[-70,40],[70,-40],[-70,-40],[90,0]],7):[-700,60,7];};
const SITE_BLOOM=()=>{const n=window._biome&&window._biome.natives;return n&&n.at&&n.at.length?n.at[0]:null;};
// the parts on the near ground's zone raster's points: each of the slump's parts must be drawn somewhere on the page
function SITE_PARTS(){const n={};for(let z=-SITE.R;z<=SITE.R;z+=20)for(let x=-SITE.R;x<=SITE.R;x+=20){const P=sitePoint(x,z);n[P.part]=(n[P.part]||0)+1;}return n;}
function SITE_PARTS_CHECK(n){const need=['head','block','anti','front','pond','trench'],lack=need.filter(p=>!(n[p]>0));
 return{ok:!lack.length,detail:need.map(p=>p+' '+(n[p]||0)).join(', ')+(lack.length?'; missing '+lack.join(', '):'')};}
// the lake: its level over the drawn ground east of the shore (in it) and none over the ring's lifted shore
function SITE_LAKE_PROBE(){const L=MODEL_LAKE_AT;if(!L)return{n:0,over:0,inLake:0};let over=0,inLake=0,n=0;
 for(let z=-6000;z<=6000;z+=100)for(let x=-1700;x<=6000;x+=50){const d=L.dist(x,z);if(d>L.ring)continue;n++;const w=waterH(x,z),g=groundH(x,z);
  if(d<=0&&w>g)inLake++;if(d>L.drawR+80&&w>g)over++;}return{n,over,inLake};}
function SITE_LAKE_CHECK(P){return{ok:P.inLake>20&&P.over===0,detail:P.n+' points near the lake: '+P.inLake+' under its water, '+P.over+' with water standing on the lifted shore'};}
function SITE_PUYA_CHECK(N){return{ok:!!N&&N.puya>=40&&N.bloom>=1,detail:N?N.puya+' puya rosettes, '+N.bloom+' in their century bloom':'no natives pass'};}
