// ================================================================= HOST - STATION 3's water on core/water: the seasonal lake, the river, the black-water creek, their confluence
// THE LAKE (H7, core/water README "Seasonal still water"): one still over the lake and the várzea, its level low + (high - low) x the
// clock's wet season (lagging the rains by 60 days: the flood pulse comes down the rivers after them), stepped every frame; the ground
// is drawn to the high water's line, so at high water the forest stands in it and at low water its floor is dry mud. The sky lilies
// and the floating meadows ride the level. THE RIVER (white water: silty, tan) and THE CREEK (black water, tea-dark) as WATER.flow
// ribbons at their levels (45), and where the creek meets the river ONE surface, a confluence (core/water ext/55: the shore from the
// ground, one blended current, foam only along the real banks). The sky in the water is core/atmos's skylight (as src/89w).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4232)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
// the lake: east of the várzea's back edge out past the far field's lake (KFAR draws it flat at low water beyond the square)
const LAKE_POLY=[[-2100,-14000],[14000,-14000],[14000,14000],[-2100,14000]];
const LAKE=window._lake=WATER.still({name:'The lake (the várzea\'s flood)',poly:LAKE_POLY,seasonal:{low:LOW,high:HIGH,lagD:60,sharp:1.5}});
const LAKE_DRAW=WATER.drawStill(LAKE,{color:lin(0x2e3a26).getHex(),roughness:.08,metalness:.1,envMapIntensity:.6});   /* the material takes the colour as linear: a white-water lake's olive-tan, dark under the sky's sheen */
LAKE_DRAW.mesh.userData.probeSkip=true;LAKE_DRAW.mesh.userData.inspectLabel='The lake (its level follows the season: low '+LOW+' m, high '+HIGH+' m)';
// the channels, their levels from the foot up (45: lvl), a point every 40 m
const flowOf=(R,name,speed)=>{const P=[];for(let s=0;s<=R.L.len;s+=40){const t=s/R.L.len,i=Math.min(R.L.pts.length-1,Math.round(t*(R.L.pts.length-1)));
  const q=dl(R.L,R.L.pts[i][0],R.L.pts[i][1]);P.push([R.L.pts[i][0],R.L.pts[i][1],lvl(R,q.t)]);}
 const e=R.L.pts[R.L.pts.length-1];P.push([e[0],e[1],lvl(R,1)]);return WATER.flow({name,pts:P,width:R.w,speed});};
const RIVER_F=flowOf(RIVER,'The river (white water)',1.1),CREEK_F=flowOf(CREEK,'The black-water creek',.6);
const RIVER_OPT={shallow:lin(0x6a5a3a),deep:lin(0x3e3222),color:0xffffff,roughness:.25,metalness:.05,envMapIntensity:.3,step:40,across:4,margin:1};
const CREEK_OPT={shallow:lin(0x3a2614),deep:lin(0x120a04),color:0xffffff,roughness:.12,metalness:.1,envMapIntensity:.5,step:40,across:4,margin:1};
const RIVER_DRAW=WATER.drawFlow(RIVER_F,RIVER_OPT),CREEK_DRAW=WATER.drawFlow(CREEK_F,CREEK_OPT);
[[RIVER_DRAW,'The river (white water: silt off the hills)'],[CREEK_DRAW,'The black-water creek (an igarapé)']].forEach(([D,n])=>{D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=n;});
// THE CONFLUENCE: the river first; at the creek's foot (?confluence=0 draws the two ribbons crossing, as before core/water ext/55)
if(WATER.confluence&&new URLSearchParams(location.search).get('confluence')!=='0'){try{
 const CF=window._confluence=WATER.confluence({name:'Where the black water meets the white',flows:[RIVER_F,CREEK_F],at:JOIN,ground:terrainH});
 const CD=WATER.drawConfluence(CF,RIVER_OPT);if(CD&&CD.mesh){CD.mesh.userData.probeSkip=true;CD.mesh.userData.inspectLabel='Where the black water meets the white';}
 WATER.fadeRibbons(CF,[RIVER_DRAW,CREEK_DRAW]);}catch(e){reportErr('confluence: '+e.stack);}}
// THE LEVEL, every frame: the lake to the clock's season, and the floating plants with it (they were placed at low water)
const FLOATERS=[];scene.traverse(o=>{if(o.isMesh&&/^biome:(skylily|skyflower|floatgrass|floattuft)$/.test(o.name||''))FLOATERS.push(o);});
function stepLake(){if(typeof KHOST==="undefined"||!KHOST.host)return;WATER.stepSeasons(KHOST.host.clock);const dy=LAKE.level-LOW;for(const o of FLOATERS)o.position.y=dy;}
tick(stepLake);
