// ================================================================= HOST — the site (station 1: the Godsgate saddle)
// PLAN.md section 5, station 1, and section 7.2: the saddle at px 1031,1252 on the scale model (5.1): 3,620 m, 1.02 atm, Dsc, mean
// +4 °C, 282 mm. The model pins the pixel (build_425_master.py, seow_station_pins) in a closed hollow about 2 km across, 7.5 km east of
// the Godsgate's carved corridor: its floor within 60 m of the pin, its rim 140 m up 2 km north, 100-200 m to the south, its slopes
// climbing to the cordillera (6.3-7.5 km) 6-12 km out. The station draws that hollow as it is: the saddle's outwash flat, scoured by
// the glacier that once crossed the divide, where the north slope's meltwater runs out on a fan and sinks into the gravel.
//
// THE LANDFORMS, one record each (core/terrain), composed on the model:
//   crags          megabreccia ribs on the slopes: core/rand's ridged noise, scaled by the model's own slope (the flat stays smooth)
//   KRELIEF.range  the moraines: a recessional ridge across the flat at the divide, laterals along the foot of the east and west slopes
//   KRELIEF.wadi   the meltwater gully down the north slope, braided, its fan spread on the flat (the brook sinks into it)
//   KRUBBLE.heap   the rockfall heaps at the foot of the north slope's crags (47: the heaps are meshes on the ground, not in its height)
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
const SITE={
 name:'godsgate',title:'The Godsgate saddle',R:2000,step:10,seed:6101,
 // the crags: ridged noise (core/rand) on a wave of `wave` m, up to `amp` m, where the model's grade runs from `from` to `to`
 crag:{amp:42,wave:190,from:.1,to:.38},
 // the moraines (KRELIEF.range: a wall along a-b, h tall, w its half-width at the foot): the recessional ridge across the flat (two arms
 // meeting at the divide, bowed north: the ice came down from the north slope), the laterals at the foot of the west and east slopes
 moraines:[
  {id:'divide-w',name:'The divide moraine (its west arm)',a:[-1250,180],b:[-150,-70],h:13,w:75,seed:6111},
  {id:'divide-e',name:'The divide moraine (its east arm)',a:[-150,-70],b:[1250,140],h:12,w:70,seed:6112},
  {id:'lateral-w',name:'The west lateral moraine',a:[-1500,-1500],b:[-1380,1650],h:19,w:115,seed:6113},
  {id:'lateral-e',name:'The east lateral moraine',a:[1380,-1350],b:[1560,1600],h:16,w:105,seed:6114}],
 // the meltwater gully: from the north slope's snow patches down to the slope's break (KRELIEF.wadi: braided cobble floor, cut banks),
// its fan spread from there into the hollow's low (the flat falls ~20 m to it: the fan's gravel fills it)
 melt:{a:[180,-2250],b:[300,-1080],amp:60,wave:520,w:6,bank:2.2,bankW:4,braids:2,fan:{r:380,slope:.045,spread:.8}},
 // the rockfall heaps (KRUBBLE.heap) at the foot of the north slope: n of them, along the slope's foot (the ground `foot` m over the flat)
 heaps:{n:5,foot:[40,85],x:[-1100,1250],rx:[22,46],seed:6121},
 snow:{autumn:[1300,1800],winter:[-2000,-1900],spring:[500,900],summer:[1900,2500]},
 eye:30,
 views:V=>{const M=SITE_MELT_AT,a=M(.15),b=M(.7),F=SITE_FAN(),H0=SITE_HEAPS&&SITE_HEAPS[1];const o={
  'The saddle from the divide moraine':V([-150,-40,4],[-150,-2400,120]),
  'South down the Godsgate':V([200,-600,6],[600,6000,200]),
  'West to the Godthrone\'s wall':V([-900,400,8],[-12000,0,2600]),
  'East to the cordillera':V([1100,0,8],[12000,-2000,2500]),
  'The meltwater gully':V([b[0]+60,b[1]+120,6],[a[0],a[1],0]),
  'The fan on the outwash flat':V([F[0]-260,F[1]+380,10],[F[0],F[1],0]),
  'Krummholz in the lee of the moraine':V([-1180,-200,3],[-1460,-900,10]),
  'The saddle from above':V([0,1900,520],[0,-600,0]),
  'North to the Bowl\'s rim':V([0,600,6],[0,-6000,1400])};
  if(H0)o['Rockfall under the crags']=V([H0.x+60,H0.z+170,6],[H0.x,H0.z,4]);
  return o;}
};
// the flat's own swells (a few metres) and its fine roughness, under the landforms: core/rand's noise, never a page fbm
function siteSwell(x,z){return 4*(KRAND.fbm(x*.0012+2.1,z*.0012-6.3,0,3,6102)-.5)*2+1.2*(KRAND.fbm(x*.008-4.2,z*.008+1.8,0,2,6106)-.5)*2;}
// the crags: ridged noise, sharpened, scaled by the MODEL's grade (its 1 km cells: a slope, not a crag), so ribs stand on the slopes
// and the flat stays smooth. Plain function of (x, z) and the model
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
 const melt=KRELIEF.wadi({pts:KRELIEF.meander(M.a,M.b,{amp:M.amp,wave:M.wave,seed:SITE.seed+7}),ground:g1,w:M.w,bank:M.bank,bankW:M.bankW,braids:M.braids,pools:0,fan:M.fan,seed:SITE.seed+8});
 SITE_RECS={moraines:SITE.moraines,melt};
 return SITE_RECS;}
// the moraines' height at a point: the tallest counts (KRELIEF.join: a junction is a knot, not a stack)
function siteMoraine(x,z){if(!SITE_MORAINE_FN.length)return 0;const hs=[];for(const f of SITE_MORAINE_FN)hs.push(f(x,z));return KRELIEF.join(hs);}
// a point at u (0 source .. 1 the fan's apex) along the meltwater gully's floor (the views)
function SITE_MELT_AT(u){if(!SITE_RECS)return [0,0];const P=SITE_RECS.melt.pts,i=Math.min(P.length-1,Math.round(u*(P.length-1)));return [P[i].x,P[i].z];}
// the fan's middle: a third of its radius down its axis from the apex
function SITE_FAN(){if(!SITE_RECS||!SITE_RECS.melt.fan)return SITE_MELT_AT(1);const F=SITE_RECS.melt.fan;return [F.x+Math.cos(F.dir)*F.r*.35,F.z+Math.sin(F.dir)*F.r*.35];}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// g0 the model and its swells, the crags on the slopes, the moraines on the flat; then the meltwater gully cut into it (and its fan laid on it)
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),cr=siteCrag(x,z),mo=siteMoraine(x,z),g0=m+siteSwell(x,z)+cr+mo;
 const g1=KRELIEF.shape(R.melt,x,z,g0),a1=KRELIEF.at(R.melt,x,z,g0);
 const P={g0,y:g1,rel:g1-m,crag:cr,moraine:mo,melt:a1?a1.part:null,cobble:a1?a1.cobble:0,fan:a1&&a1.part==='fan'?a1.active:0};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
// THE RELIEF (metres over the model)
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the brook: from the gully's head down its floor to the fan's apex, where it sinks into the gravel (the floor never climbs downstream)
const SITE_STREAM={name:'The meltwater brook (off the north slope\'s snow; it sinks into the fan\'s gravel on the flat)',width:1.8,
 pts:()=>{if(!SITE_RECS)return [];return SITE_RECS.melt.pts.slice(2).map(p=>[p.x,p.z,p.y]);}};
