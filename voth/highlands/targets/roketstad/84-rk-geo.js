// ================================================================= ROKETSTAD — geometry (target: roketstad)
// Everything about WHERE things are: the town hill and its wall, the gates, the spaceport rise and its pentagon, the
// highways, the terrain function. Metres; x east, z south (north is -z).
//
// THE PLACE (Travis's brief). Roketstad — once an Ancient spaceport, a munitions hub of the Izani Empire, and since the
// Mutiny of the 3rd Legion a forge town of the Iron Republic, ~5 000 souls. It stands on a hill on a broad shelf of the
// Inner Wall's outer rim; the mountains rise far off to the E/NE/SE. The town is walled and chaotic, medieval: a main
// square at the top (town hall, barracks, mustering ground), highways out N, S and E (to the spaceport), a market square
// and a temple square with main roads between them, wealth falling away from the squares; a forge district on the east
// side. Outside each gate a straggle of poor houses, an inn, shops — thickest on the spaceport road, with scrap
// smithies. On another rise to the east, the ruined spaceport: a pentagon of five Launch Arcology sites (four launched —
// the pads stand empty — and one that never went, ruined), the Ancients' Starport in the middle, tanks, fuel centres,
// helipads, and scrapyards and scrap smithies among them; the Scavengers' Guild by the spaceport. Farms along the N and
// S highways. Forest (the NW-lowlands biome, humid-subtropical tract) on everything not built or ploughed.
window.CITY=true;
const RK={
 WORLD:3400,                        // side of the terrain square
 // round 9 (Travis: "make Roketstad the capital ... double its size such that the walls stretch east to encompass
 // Scraptown"): the wall is a lumpy OVAL about TOWN (semi-axes A east-west, B north-south) — twice the old area —
 // whose west half is the old hill town (HILL: the summit, the main square) and whose east end reaches the port table.
 TOWN:{x:-330,z:10,H:34,A:640,B:395,R:520},
 HILL:{x:-620,z:0,H:34,R:350},
 PORT:{x:640,z:-30,H:20,top:480,P:268,s:.17,starS:.3},   // the spaceport rise: flat top radius, pentagon radius, arcology + starport scales
 GATES:{N:-2.1,E:.02,S:2.06,W:Math.PI},                  // bearings (rad, atan2(z,x)) from the wall's centre; N and S open off the hill, W at the west end
 SQUARE_R:48,                       // the main square
 MARKET:{a:-2.35,r:175,R:30},       // market square (NW of centre), temple square (SW)
 TEMPLE:{a:2.45,r:170,R:32},
 REPUBLIC:{x:-230,z:95,R:40},       // the capital's square: the Hall of the Republic on its north side
 SCRAP:{x:190,z:32,R:17},           // Scraptown's plaza, on the port table's west rim
 INDUSTRY_X:-120,                   // the scrap and industrial district: everything east of this, inside the wall
 QUALITY:1,
 FOREST:2.2,FOREST_LOD:1.7,        // forest stocking (x the biome showcase) and the LOD stretch it is paid for with
};
const FRAME_HOOKS_PRE=[];
const SEED_RK=7331;
function polar(x,z){return{r:Math.hypot(x,z),t:Math.atan2(z,x)};}
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
function angDiff(a,b){let d=Math.abs(a-b)%TAU;return d>Math.PI?TAU-d:d;}
const TC=RK.TOWN,PC=RK.PORT;
// town-local polar coordinates
const tpol=(x,z)=>polar(x-TC.x,z-TC.z);
// the wall: a lumpy ring (a medieval wall follows the hill, not a compass), flush round each gatehouse
const HILL=RK.HILL;
function wallRaw(t){const c=Math.cos(t),s=Math.sin(t),e=TC.A*TC.B/Math.sqrt((TC.B*c)*(TC.B*c)+(TC.A*s)*(TC.A*s));
 const k=.35+.65*smoothstep(.25,1.1,angDiff(t,0));   // lumps damped toward the east end, which runs close by the launch pads
 return e+k*(26*Math.sin(3*t+.7)+16*Math.sin(5*t+2.1)+8*Math.sin(9*t+.4));}
const GATE_LIST=[['N',RK.GATES.N],['E',RK.GATES.E],['S',RK.GATES.S],['W',RK.GATES.W]];
function wallR(t){let r=wallRaw(t);for(const [,g] of GATE_LIST){const d=angDiff(t,g);if(d<.16){const k=1-smoothstep(.03,.16,d);r=r*(1-k)+wallRaw(g)*k;}}return r;}
function gatePos(g){const R=wallR(g);return[TC.x+R*Math.cos(g),TC.z+R*Math.sin(g)];}
function insideWall(x,z,margin){const p=tpol(x,z);return p.r<wallR(p.t)-(margin||0);}
function townPt(a,r){return[TC.x+r*Math.cos(a),TC.z+r*Math.sin(a)];}
function hillPt(a,r){return[HILL.x+r*Math.cos(a),HILL.z+r*Math.sin(a)];}
// the pentagon: vertex 0 points AWAY from the town (east), so the road from the west comes in between two pads
const PENT=[];for(let k=0;k<5;k++){const a=k*TAU/5;PENT.push({x:PC.x+PC.P*Math.cos(a),z:PC.z+PC.P*Math.sin(a),a,k});}
const PAD_R=668*PC.s;                                     // each site's berm toe at scale s
// ---------------------------------------------------------------- terrain
// a shelf of low hills (20-40 m), rising gently to the east toward the Inner Wall; the town hill and the port rise on it
const FLATS=[];const FLATCELL=64,FLATGRID={};
function cityFlat(x,z,r,apron,h){const f=[x,z,r,apron,h];FLATS.push(f);const R=r+apron;
 for(let i=Math.floor((x-R)/FLATCELL);i<=Math.floor((x+R)/FLATCELL);i++)for(let j=Math.floor((z-R)/FLATCELL);j<=Math.floor((z+R)/FLATCELL);j++)(FLATGRID[i+','+j]||(FLATGRID[i+','+j]=[])).push(f);}
function shelfH(x,z){return 22+16*fbm(x*.0022+3.1,z*.0022-1.7,5.3,4)+7*fbm(x*.009,z*.009,2.2,2)+26*smoothstep(700,2400,x+.35*z)   // east: toward the mountains
 -10*smoothstep(-900,-1700,x);}
function townHillK(x,z){const d=Math.hypot(x-HILL.x,z-HILL.z);return 1-smoothstep(0,HILL.R+230,d);}
function portK(x,z){const d=Math.hypot(x-PC.x,z-PC.z);return 1-smoothstep(PC.top,PC.top+300,d);}
// the shelf under the port and the town is levelled toward a reference height before the rise is added (a hill on a
// hill-noise would give the square a tilt and the pads a slope)
const TOWN_BASE=shelfH(HILL.x,HILL.z),PORT_BASE=shelfH(PC.x,PC.z);
function terrainBase(x,z){let h=shelfH(x,z);
 const tk=townHillK(x,z);h=h*(1-tk*.85)+(TOWN_BASE+HILL.H*Math.pow(tk,1.35))*tk*.85;   // the town hill: a smooth dome, the shelf noise fading on it
 const pk=portK(x,z);h=h*(1-pk)+(PORT_BASE+PC.H)*pk;                                  // the port rise: a level table
 return h;}
terrainH=function(x,z){let h=terrainBase(x,z);const L=FLATGRID[Math.floor(x/FLATCELL)+','+Math.floor(z/FLATCELL)];
 if(L)for(const f of L){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]+f[3]){const k=1-smoothstep(f[2],f[2]+f[3],d);h=h*(1-k)+f[4]*k;}}return h;};
const PORT_Y=PORT_BASE+PC.H;
// the main square and the two lesser squares are levelled
const SQUARES={main:{x:HILL.x,z:HILL.z,r:RK.SQUARE_R},market:(()=>{const p=hillPt(RK.MARKET.a,RK.MARKET.r);return{x:p[0],z:p[1],r:RK.MARKET.R};})(),
 temple:(()=>{const p=hillPt(RK.TEMPLE.a,RK.TEMPLE.r);return{x:p[0],z:p[1],r:RK.TEMPLE.R};})(),
 republic:{x:RK.REPUBLIC.x,z:RK.REPUBLIC.z,r:RK.REPUBLIC.R},scrap:{x:RK.SCRAP.x,z:RK.SCRAP.z,r:RK.SCRAP.R,industrial:true}};
for(const k in SQUARES){const S=SQUARES[k];S.y=terrainBase(S.x,S.z);cityFlat(S.x,S.z,S.r,26,S.y);}
// in the forge district? (the east sector of the town)
function inForge(x,z){return x>RK.INDUSTRY_X&&insideWall(x,z,0);}
// distance to the nearest square's rim — the wealth gradient reads it
function squareD(x,z){let d=1e9;for(const k in SQUARES){const S=SQUARES[k];if(S.industrial)continue;d=Math.min(d,Math.hypot(x-S.x,z-S.z)-S.r*(k==='main'||k==='republic'?1:.6));}return Math.max(0,d);}
