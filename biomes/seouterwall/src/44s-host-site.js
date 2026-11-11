// ================================================================= HOST — the site (station 1: the Godsgate saddle)
// PLAN.md section 5, station 1, and section 7.2: the drainage divide on the model's carved Godsgate (5.1), px 1027.5,1256: 3,672 m,
// 1.01 atm, Dsc, mean +4 °C, 282 mm. The corridor runs north-south here as a U-trough: its floor about 2 km wide within 30 m of the
// divide, falling 26 m in 4 km to the north (Guli rrija, to the Bowl) and 50 m in 4 km to the south (the Wadi al-Qamar, to the Catch);
// its west wall (the Godthrone's shoulder) 540 m up 3 km out, its east wall (the cordillera) 160-500 m; both on to 6-7.5 km.
//
// THE LANDFORMS, one record each (core/terrain), composed on the model:
//   crags          ribs on the walls: core/rand's ridged noise, scaled by the model's own slope (the floor stays smooth)
//   KRELIEF.range  the moraines: laterals along the foot of both walls, the divide moraine across the floor
//   KRELIEF.wadi   the dry braided channels down the floor from the divide, north and south (the snowmelt runs in them in early
//                  summer; 282 mm: dry by autumn), and the meltwater gully off the east wall with its brook and its fan
//   KRUBBLE.heap   the rockfall heaps at the foot of the west wall's crags (47)
//   the road       the Ancients' 30 m highway down the floor at a 4 % ruling grade (47: graded into the baked ground by KFIELD's
//                  flatten strokes, its pavement drawn on it; PLAN.md section 3.3)
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
const SITE={
 name:'godsgate',title:'The Godsgate saddle',R:2000,step:10,seed:6101,
 // the plan's station (PLAN.md section 5): its pixel and height; the page's own pixel is the corridor's divide (section 7.2)
 plan:{px:1031,py:1252,base:3620},
 // the crags: ridged noise (core/rand) on a wave of `wave` m, up to `amp` m, where the model's grade runs from `from` to `to`
 crag:{amp:42,wave:190,from:.1,to:.38},
 // the moraines (KRELIEF.range: a wall along a-b, h tall, w its half-width at the foot)
 moraines:[
  {id:'lateral-w',name:'The west lateral moraine',a:[-1480,-2500],b:[-1420,2500],h:19,w:115,seed:6113},
  {id:'lateral-e',name:'The east lateral moraine',a:[1200,250],b:[1260,2400],h:15,w:100,seed:6114},
  {id:'divide-w',name:'The divide moraine (its west arm)',a:[-1250,320],b:[-200,140],h:12,w:70,seed:6111},
  {id:'divide-e',name:'The divide moraine (its east arm)',a:[-200,140],b:[950,330],h:11,w:65,seed:6112}],
 // the dry channels from the divide (KRELIEF.wadi: braided cobble floor, cut banks, no fan): the heads of the two rivers
 dry:[{id:'north',name:'The head of Guli rrija (dry braided gravels: it runs to the Bowl in early summer)',a:[-470,-250],b:[-520,-2700],amp:90,wave:700,w:16,bank:1.4,bankW:6,braids:3,seed:6131},
      {id:'south',name:'The head of the Wadi al-Qamar (dry braided gravels: it runs to the Catch in early summer)',a:[-460,520],b:[-520,2700],amp:90,wave:700,w:16,bank:1.4,bankW:6,braids:3,seed:6132}],
 // the meltwater gully off the east wall's late snow to the wall's foot, its brook sinking into its fan spread down onto the floor
 melt:{a:[2700,-1950],b:[1560,-1080],amp:50,wave:520,w:6,bank:2.2,bankW:4,braids:2,fan:{r:500,slope:.05,spread:.8}},
 // the rockfall heaps (KRUBBLE.heap) at the foot of the west wall: n of them, walking `dir` from x0 along rows z (the ground `foot` m up)
 heaps:{n:5,foot:[55,95],x0:-1100,dir:[-1,0],z:[-1900,1900],rx:[22,46],seed:6121},
 // the Ancients' highway (PLAN.md section 3.3): its line down the floor's east half, its width and ruling grade (47 grades and draws it)
 road:{id:'godsgate-highway',name:'The Ancients\' Godsgate highway (30 m, a 4 % ruling grade: the surface road over the sealed Arcbeam-Stair tunnel)',
  pts:[[380,-2600],[330,-1500],[260,-400],[250,400],[300,1400],[400,2600]],w:30,grade:.04,shoulder:16},
 // the zones a check looks for on this station's near ground (99)
 need:['col','moraine','floor','fan','crag','scree','krummholz','puna','road'],
 snow:{autumn:[1300,1800],winter:[-2000,-1900],spring:[500,900],summer:[1900,2500]},
 eye:30,
 views:V=>{const M=SITE_MELT_AT,b=M(.7),a=M(.2),F=SITE_FAN(),H0=SITE_HEAPS&&SITE_HEAPS[2];const o={
  'The saddle from the divide moraine':V([-200,150,4],[-300,-2600,60]),
  'South down the Godsgate':V([-300,700,8],[-600,7000,200]),
  'North to the Bowl':V([-300,-600,8],[-500,-8000,300]),
  'The Ancients\' highway over the divide':V([330,-900,3],[260,600,2]),
  'West to the Godthrone\'s wall':V([200,300,8],[-6000,0,1600]),
  'East to the cordillera':V([-1000,0,8],[8000,-1500,1300]),
  'The meltwater gully':V([b[0]-80,b[1]+120,6],[a[0],a[1],0]),
  'The fan on the floor':V([F[0]-300,F[1]+300,10],[F[0],F[1],0]),
  'Krummholz on the moraine':V([-1250,-600,3],[-1500,-1400,10]),
  'The saddle from above':V([1500,2200,600],[-300,-800,0])};
  if(H0)o['Rockfall under the crags']=V([H0.x+170,H0.z+40,6],[H0.x,H0.z,4]);
  return o;}
};
// the floor's own swells (a few metres) and its fine roughness, under the landforms: core/rand's noise, never a page fbm
function siteSwell(x,z){return 4*(KRAND.fbm(x*.0012+2.1,z*.0012-6.3,0,3,6102)-.5)*2+1.2*(KRAND.fbm(x*.008-4.2,z*.008+1.8,0,2,6106)-.5)*2;}
// the crags: ridged noise, sharpened, scaled by the MODEL's grade (its 1 km cells: a slope, not a crag), so ribs stand on the walls
// and the floor stays smooth. Plain function of (x, z) and the model
function siteCragK(x,z){const C=SITE.crag,s=(MODEL(x+250,z)-MODEL(x-250,z))/500,t=(MODEL(x,z+250)-MODEL(x,z-250))/500;return smooth(C.from,C.to,Math.hypot(s,t));}
function siteCrag(x,z){const C=SITE.crag,k=siteCragK(x,z);if(k<=0)return 0;
 const r=1-Math.abs(2*KRAND.fbm(x/C.wave+5.3,z/C.wave-2.9,0,4,6103)-1),r2=1-Math.abs(2*KRAND.fbm(x/(C.wave*.37)-1.7,z/(C.wave*.37)+4.4,0,3,6104)-1);
 return C.amp*k*(Math.pow(r,2.2)*.8+Math.pow(r2,3)*.35-.32);}
// THE RECORDS (made once the model's ground exists: 45 calls siteBuild): each plain data, JSON-safe, the page's export carries them
let SITE_RECS=null,SITE_HEAPS=null;
const SITE_MORAINE_FN=[];   /* each moraine record's KRELIEF.range function (the record is the data; the function draws it) */
function siteBuild(ground){const M=SITE.melt;
 SITE.moraines.forEach(m=>SITE_MORAINE_FN.push(KRELIEF.range({a:m.a,b:m.b,h:m.h,w:m.w,crest:.55,toe:.25,serr:.18,seed:m.seed})));
 const g1=(x,z)=>ground(x,z)+siteCrag(x,z)+siteMoraine(x,z);
 const dry=SITE.dry.map(D=>Object.assign(KRELIEF.wadi({pts:KRELIEF.meander(D.a,D.b,{amp:D.amp,wave:D.wave,seed:D.seed}),ground:g1,w:D.w,bank:D.bank,bankW:D.bankW,braids:D.braids,pools:0,fan:false,seed:D.seed+1}),{id:D.id,name:D.name}));
 const melt=KRELIEF.wadi({pts:KRELIEF.meander(M.a,M.b,{amp:M.amp,wave:M.wave,seed:SITE.seed+7}),ground:g1,w:M.w,bank:M.bank,bankW:M.bankW,braids:M.braids,pools:0,fan:M.fan,seed:SITE.seed+8});
 SITE_RECS={moraines:SITE.moraines,dry,melt,road:SITE.road};
 return SITE_RECS;}
// the moraines' height at a point: the tallest counts (KRELIEF.join: a junction is a knot, not a stack)
function siteMoraine(x,z){if(!SITE_MORAINE_FN.length)return 0;const hs=[];for(const f of SITE_MORAINE_FN)hs.push(f(x,z));return KRELIEF.join(hs);}
// a point at u (0 source .. 1 the fan's apex) along the meltwater gully's floor (the views)
function SITE_MELT_AT(u){if(!SITE_RECS)return [0,0];const P=SITE_RECS.melt.pts,i=Math.min(P.length-1,Math.round(u*(P.length-1)));return [P[i].x,P[i].z];}
// the fan's middle: a third of its radius down its axis from the apex
function SITE_FAN(){if(!SITE_RECS||!SITE_RECS.melt.fan)return SITE_MELT_AT(1);const F=SITE_RECS.melt.fan;return [F.x+Math.cos(F.dir)*F.r*.35,F.z+Math.sin(F.dir)*F.r*.35];}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// g0 the model and its swells, the crags on the walls, the moraines on the floor; then the dry channels and the meltwater gully cut into
// it (the gully's fan laid on it); the last cut that holds the point names its part
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),cr=siteCrag(x,z),mo=siteMoraine(x,z),g0=m+siteSwell(x,z)+cr+mo;
 let g=g0,part=null,cob=0,fan=0;
 for(const D of R.dry){const a=KRELIEF.at(D,x,z,g);g=KRELIEF.shape(D,x,z,g);if(a){part=a.part;cob=a.cobble||0;}}
 const a1=KRELIEF.at(R.melt,x,z,g),g1=KRELIEF.shape(R.melt,x,z,g);if(a1){part=a1.part;cob=a1.cobble||0;fan=a1.part==='fan'?a1.active:0;}
 const P={g0,y:g1,rel:g1-m,crag:cr,moraine:mo,melt:part,cobble:cob,fan,wall:null};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
// THE RELIEF (metres over the model)
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the brook: from the gully's head down its floor to the fan's apex, where it sinks into the gravel (the floor never climbs downstream)
const SITE_STREAM={name:'The meltwater brook (off the east wall\'s late snow; it sinks into its fan\'s gravel on the floor)',width:1.8,
 pts:()=>{if(!SITE_RECS)return [];return SITE_RECS.melt.pts.slice(2).map(p=>[p.x,p.z,p.y]);}};
