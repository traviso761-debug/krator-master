// ================================================================= HOST — the site (station 1: Leng's forest-steppe)
// PLAN.md section 7, station 1: ~4.6 km, larch on the south-facing (shaded) slopes, plumegrass and furflowers on the north-facing
// (sunny) ones, an aufeis valley, sweetroot beds and snow-potato pockets, Leng's ruin on the horizon. The Three Gifts' country.
// On the scale model (4.22) at px 220,216 (region/far.py): 4,597 m, 0.90 atm, Dsc, mean +2 °C, ~300 mm; the model's ground is
// gentle here (the forest-steppe is a high rolling plateau), so the valley is the station's own: an east-west trough ~150 m deep
// cut into the plateau, so its north wall faces south (shaded at 28 S: the larch) and its south wall faces north (sunny: the
// steppe). Leng stands 16 km to the south on the same plateau (region/station-steppe.json "places").
//
// A site is DATA the stage (45) reads: its radius, seed, the relief added to the model (relief(x,z), metres, page y = 0 at the
// model's height at the pixel), the stream's line, the places the kit dresses (beds, pockets, burns), and its views.
const SITE={
 name:'steppe',title:'Leng\'s forest-steppe',R:2200,seed:4701,
 // the valley: its axis meanders round z = zc(x); the floor half-width and the walls; the floor falls east (the stream runs east,
 // toward the dam basins); the walls are cut with gullies (the silverthorn's), and a gravel terrace stands on the sunny side
 valley:{zc:x=>110*Math.sin(x*.00105+.7)+55*Math.sin(x*.0027+2.1)-40,floor:70,wallN:520,wallS:760,depth:150,fall:-.006,
  terrace:{from:90,to:300,h:7}},
 // the burn: a fire scar at the shaded wall's upper edge, where the fireweed (Ivan-chai) grows on the larch's edge (PLAN.md section 3)
 burns:[{x:-650,z:-560,r:190}],
 // the Three Gifts' plots (PLAN.md section 4): sweetroot beds on the sunny terrace's gravel, snow-potato pockets (stone-walled) on
 // the rocky upper slope of the sunny wall, goldroot in the cracks of the tors
 beds:{c:[260,235],len:180,wid:64,ang:-.08},pockets:{c:[-260,520],rad:170,n:26},
 gifts:['sweetroot','snowpotato','goldroot'],landforms:['aufeis'],
 tors:{n:9,seed:4711,ring:[600,1900],accept:(x,z)=>Math.abs(z-SITE.valley.zc(x))>SITE.valley.floor+SITE.valley.wallS*.85},
 // the snow's line by season (page metres: 89a): autumn's first snow on the ranges' tops round the plateau, spring's last patches
 // everywhere, summer's on the far peaks only
 snow:{autumn:[380,900],spring:[-2000,-1900],summer:[1600,2400]},
 // the LOD spine: the middle, the beds, the burn, the pockets
 spine:[[0,0],[260,150],[-650,-560],[-260,520]],
 eye:30,
 // the views (99): V([x, z, metres over the ground], [x, z, metres over the ground])
 views:V=>{const zc=SITE.valley.zc,L=NW_REGION.places.find(p=>p.name==='Leng'),T0=(typeof TORS!=='undefined'&&TORS[0])||null;const o={
  'Across the valley to Leng':V([-300,zc(-300)-660,40],L?[L.x,L.z,240]:[0,4000,0]),
  'The aufeis valley':V([-900,zc(-900)+25,6],[200,zc(200),2]),
  'Larch on the shaded wall':V([300,zc(300)-260,4],[380,zc(380)-420,14]),
  'Plumegrass on the sunny wall':V([-100,zc(-100)+430,2.2],[160,zc(160)+300,0]),
  'Sweetroot beds on the terrace':V([150,330,7],[300,230,0]),
  'Snow-potato pockets':V([-210,580,5],[-270,510,0]),
  'The burn (Ivan-chai)':V([-470,-470,5],[-660,-560,2]),
  'The valley from above':V([0,-1500,420],[0,250,0]),
  'The forest-steppe from afar':V([1800,-1800,320],[-400,600,0])};
  if(T0)o['A tor on the plateau']=V([T0.x+T0.R*3.2,T0.z+T0.R*2.2,3],[T0.x,T0.z,(T0.top-T0.y0)*.5]);
  return o;}
};
// THE RELIEF (metres over the model): the valley cut into the plateau, its gullies and terrace, the plateau's swells; nothing
// beyond the near ground but the swells and the valley running on, so the mid ground (to 20 km) is the model's own country
// a wall's width along the valley: spurs and bays, so the walls are not one sweep (north and south from their own noise)
const siteWall=(x,N)=>(N?SITE.valley.wallN:SITE.valley.wallS)*(.7+.6*KRAND.fbm(x*.0016+(N?5.1:-2.7),0,0,2,4705));
function siteRelief(x,z){const V=SITE.valley,zc=V.zc(x),d=z-zc,ad=Math.abs(d),N=d<0;
 const wall=siteWall(x,N),k=smooth(V.floor,V.floor+wall,ad),sw=k*k*(3-2*k);
 // the plateau: long swells and a little roughness (core/rand's noise, never a page fbm)
 const sw1=KRAND.fbm(x*.0009+7.1,z*.0009-3.3,0,3,4702),sw2=KRAND.fbm(x*.004-1.2,z*.004+8.8,0,2,4703);
 const sw3=1-Math.abs(2*KRAND.fbm(x*.0025+4.4,z*.0025-6.6,0,3,4706)-1);
 const plateau=38*(sw1-.5)*2+6*(sw2-.5)*2+16*(sw3-.55);   /* the swells, the roughness and low ridged knolls */
 // the gullies: shallow runnels down the walls every ~330 m, wandering; strongest mid-wall
 const gx=x/330+.9*(KRAND.fbm(x*.002,z*.002,0,2,4704)-.5)*2,gp=Math.abs(gx-Math.round(gx));
 const gully=-14*smooth(.22,0,gp)*Math.sin(Math.PI*clamp((ad-V.floor)/wall,0,1))*(N?.8:1);
 // the terrace: a gravel bench on the sunny (south) side, a few metres over the floor
 const T=V.terrace,tb=d>0?smooth(T.from-30,T.from+10,d)*smooth(T.to+60,T.to,d):0;
 const floorY=-V.depth+V.fall*x;
 let h=floorY+(V.depth+plateau)*sw;
 h=Math.max(h,floorY+T.h*tb);   /* the bench only raises the ground: no hollow behind it */
 return h+gully;}
// the gully a point is in (0..1), for the zones (the silverthorn's gullies: 46)
function siteGully(x,z){const V=SITE.valley,d=z-V.zc(x),ad=Math.abs(d),wall=siteWall(x,d<0);
 const gx=x/330+.9*(KRAND.fbm(x*.002,z*.002,0,2,4704)-.5)*2,gp=Math.abs(gx-Math.round(gx));
 return smooth(.16,.04,gp)*smooth(V.floor,V.floor+60,ad)*smooth(V.floor+wall*1.05,V.floor+wall*.7,ad);}
// the valley floor (0..1): the stream's gravel flats, where the aufeis builds
function siteFloor(x,z){const V=SITE.valley,ad=Math.abs(z-V.zc(x));return smooth(V.floor*1.1,V.floor*.55,ad);}
// THE LANDFORMS (core/terrain/42-core-frost.js, KFROST; PLAN.md section 6): the AUFEIS on the valley floor along the stream (a
// spring's full sheets, summer's and autumn's remnants), ICE-WEDGE POLYGONS where the ground is flat and frozen (the plateau's
// cold hollows, the shaded floor), SOLIFLUCTION LOBES creeping down the shaded north wall (it holds its snow and its permafrost).
// c: {stream:[[x,z]...], grade(x,z) -> {g, sunny}, meanAt(x,z) -> °C} from the stage (47)
SITE.frost=c=>({
 aufeis:[{id:'aufeis.valley',pts:c.stream,w:44,thick:2.4,seg:[220,560],gap:[140,420],cover:{spring:1,summer:.26,autumn:.14}[SEASON]}],
 polygons:{cell:14,trough:.32,rim:.07,width:.17,where:(x,z)=>{const G=c.grade(x,z);return smooth(.07,.025,G.g)*smooth(-.8,-2.2,c.meanAt(x,z));}},
 lobes:{cell:30,h:1.3,where:(x,z)=>{const V=SITE.valley,d=z-V.zc(x);return d<-V.floor-40&&d>-V.floor-V.wallN*.95?1:0;}},
 alases:[],pingos:[],rockGlaciers:[]});
// the stream: down the valley's axis, west to east, its bed on the floor
const SITE_STREAM={name:'The valley stream (an aufeis stream: it overflows and freezes all winter)',from:-SITE.R*1.15,to:SITE.R*1.15,step:14,width:4.5,
 at:x=>[x,SITE.valley.zc(x)+6*Math.sin(x*.012)]};
