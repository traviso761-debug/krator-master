// ================================================================= HOST — the site (station 2: the Tarn of the Gate-Bell)
// PLAN.md section 4, Oasis 1, and section 7.4. The plan's pixel is px 1016,1236 (the model pins it at 3,680 m), but the model's tarn
// (build_425_master.py, whas / wlev: 45 cells at 3,680 m, about 7 km across) lies 3-9 km west of it on a flat cirque floor ringed by
// walls 4-8 km out. The station stands on the tarn's north-east shore, px 1014.5,1234.5 (region/far.py): 3,695 m, 1.01 atm, Dsc, mean
// +7 °C, 408 mm; the water 15 m under the page's y = 0, its shore 300-700 m to the south-west, the cirque floor rising gently north.
// West of the Godsgate's corridor (25 km east of here), so the rock is the Godthrone's: black titanium-basalt flows with orange glass-bead
// beds, gone ochre palagonite (KSTRATA's `tibasalt`, the lateral side of the column: SITE.rock).
//
// THE LANDFORMS, one record each (core/terrain), composed on the model:
//   KRELIEF.scarp  the cirque's headwall: a horseshoe of basalt, 140 m, bowed north across the near box, a hanging bench above it, talus
//                  at its foot, buttresses on its face
//   KRELIEF.wadi   the brook: off the hanging bench, over the wall's lip (core/water finds the fall on its line: WATER.fallsOf), across
//                  the floor to the tarn
//   KRELIEF.range  the moraine damming the tarn's east shore (black basalt till: section 4's "terminal moraine")
//   KRUBBLE.heap   the rockfall heaps at the headwall's foot (47)
// The same interface as station 1's site (src/44s-host-site.js): SITE, siteBuild, sitePoint, siteRelief, SITE_STREAM, SITE_MELT_AT, SITE_FAN.
const SITE={
 name:'gatetarn',title:'The Tarn of the Gate-Bell',R:2000,step:10,seed:6201,
 tarn:'The Tarn of the Gate-Bell',fallName:'The Gate-Bell fall',
 // the plan's station (PLAN.md section 5): its pixel and height; the page's own pixel is the tarn's shore (section 7.4)
 plan:{px:1016,py:1236,base:3680},
 // the rock: the Godsgate's corridor (KSTRATA's contact, megabreccia east of it) is 25 km east of this page's origin
 rock:{contact:[25000,0],lib:'rock.basalt'},
 crag:{amp:28,wave:170,from:.1,to:.38},
 // the headwall (KRELIEF.scarp): its rim west to east, bowed north; side -1: the hanging bench on the north (n = (-uz, ux) points south)
 wall:{pts:[[-3600,-700],[-2100,-1450],[-300,-1700],[1500,-1550],[3300,-750]],side:-1,h:140,run:120,power:1.3,
  buttresses:{sp:260,w:.28,amp:22},talus:{h:16,reach:75},rough:.02,seed:6211},
 // the moraine damming the tarn's east shore, and a recessional ridge behind it
 moraines:[
  {id:'dam',name:'The tarn\'s moraine dam (black basalt till)',a:[-150,350],b:[-500,2300],h:16,w:90,seed:6212},
  {id:'inner',name:'An older moraine (the ice\'s stand behind the dam)',a:[700,200],b:[400,1900],h:10,w:70,seed:6213}],
 // the brook: from the hanging bench's snowfields, over the lip, across the floor to the tarn (no fan: it reaches the water)
 melt:{pts:[[420,-2600],[300,-2100],[260,-1760],[230,-1600],[60,-1250],[-300,-900],[-700,-500],[-1050,-150]],w:3.2,bank:1.6,bankW:3,braids:1,fan:false},
 // the rockfall heaps at the headwall's foot (the ground there, metres over the origin)
 heaps:{n:4,foot:[24,40],x:[-1700,1500],rx:[18,36],seed:6221},
 // the LOD spine (47: the floor's dense band round each point): the shore, the fall's foot, the headwall's foot west and east
 spine:[[-300,-250],[230,-1450],[-1200,-1300],[900,-1250]],
 // the zones a check looks for on this station's near ground (99)
 need:['water','shore','moraine','crag','scree','larch','puna'],
 snow:{autumn:[1200,1700],winter:[-2000,-1900],spring:[400,800],summer:[1800,2400]},
 eye:30,
 views:V=>{const T=SITE_MELT_AT,L=SITE_LIP(),H0=SITE_HEAPS&&SITE_HEAPS[1];const o={
  'The tarn from its north-east shore':V([-300,-250,4],[-3500,2500,0]),
  'The fall over the headwall':V([L[0]-140,L[1]+520,12],[L[0],L[1],-60]),
  'Up the brook to the wall':V([-760,-420,3],[L[0],L[1],-40]),
  'The headwall\'s basalt and its orange beds':V([-1200,-900,6],[-1700,-1500,60]),
  'Larch in the cirque\'s lee':V([900,-700,3],[1300,-1300,20]),
  'Across the moraine dam':V([400,900,6],[-2400,1600,0]),
  'The cirque from the hanging bench':V([600,-2200,20],[-1500,1500,0]),
  'South to the Godthrone\'s shoulder':V([0,0,10],[-6000,12000,1200])};
  if(H0)o['Rockfall under the headwall']=V([H0.x+50,H0.z+170,6],[H0.x,H0.z,4]);
  return o;}
};
// the floor's swells and fine roughness: core/rand's noise, never a page fbm
function siteSwell(x,z){return 3*(KRAND.fbm(x*.0012+3.1,z*.0012-2.3,0,3,6202)-.5)*2+1*(KRAND.fbm(x*.008-1.2,z*.008+5.8,0,2,6206)-.5)*2;}
// the crags: ridged noise scaled by the MODEL's grade (station 1's rule): ribs on the slopes, the floor smooth
function siteCragK(x,z){const C=SITE.crag,s=(MODEL(x+250,z)-MODEL(x-250,z))/500,t=(MODEL(x,z+250)-MODEL(x,z-250))/500;return smooth(C.from,C.to,Math.hypot(s,t));}
function siteCrag(x,z){const C=SITE.crag,k=siteCragK(x,z);if(k<=0)return 0;
 const r=1-Math.abs(2*KRAND.fbm(x/C.wave+1.3,z/C.wave-6.9,0,4,6203)-1),r2=1-Math.abs(2*KRAND.fbm(x/(C.wave*.37)+2.7,z/(C.wave*.37)-0.4,0,3,6204)-1);
 return C.amp*k*(Math.pow(r,2.2)*.8+Math.pow(r2,3)*.35-.32);}
// THE RECORDS (made once the model's ground exists: 45 calls siteBuild)
let SITE_RECS=null,SITE_HEAPS=null;
const SITE_MORAINE_FN=[];
function siteBuild(ground){const W=SITE.wall,M=SITE.melt;
 const wall=KRELIEF.scarp({pts:W.pts,side:W.side,h:W.h,run:W.run,power:W.power,buttresses:W.buttresses,talus:W.talus,rough:W.rough,seed:W.seed});
 SITE.moraines.forEach(m=>SITE_MORAINE_FN.push(KRELIEF.range({a:m.a,b:m.b,h:m.h,w:m.w,crest:.55,toe:.25,serr:.18,seed:m.seed})));
 const g1=(x,z)=>KRELIEF.shape(wall,x,z,ground(x,z)+siteCrag(x,z))+siteMoraine(x,z);
 const melt=KRELIEF.wadi({pts:siteResample(M.pts,8),ground:g1,w:M.w,bank:M.bank,bankW:M.bankW,braids:M.braids,pools:0,fan:false,seed:SITE.seed+8});
 SITE_RECS={wall,moraines:SITE.moraines,melt};
 return SITE_RECS;}
// a polyline resampled every `step` m (KRELIEF.wadi takes its points as they are: its bed is linear between them, so it must be dense to
// follow the headwall's face down)
function siteResample(P,step){const out=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
 for(let k=0;k<n;k++){const t=k/n;out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}out.push(P[P.length-1].slice());return out;}
function siteMoraine(x,z){if(!SITE_MORAINE_FN.length)return 0;const hs=[];for(const f of SITE_MORAINE_FN)hs.push(f(x,z));return KRELIEF.join(hs);}
function SITE_MELT_AT(u){if(!SITE_RECS)return [0,0];const P=SITE_RECS.melt.pts,i=Math.min(P.length-1,Math.round(u*(P.length-1)));return [P[i].x,P[i].z];}
function SITE_FAN(){return SITE_MELT_AT(1);}
// the fall's lip: the brook's point nearest the wall's rim (the views)
function SITE_LIP(){if(!SITE_RECS)return [0,-1600];let b=null,bd=1e9;for(const p of SITE_RECS.melt.pts){const a=KRELIEF.at(SITE_RECS.wall,p.x,p.z);const d=a?Math.abs(a.d):1e9;if(d<bd){bd=d;b=[p.x,p.z];}}return b||[0,-1600];}
// ---------------------------------------------------------------- one record a point (memo of the last)
// g0 the model, its swells and crags, the headwall over them, the moraines on the floor; then the brook's bed cut into it
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),cr=siteCrag(x,z),mo=siteMoraine(x,z);
 const gw=KRELIEF.shape(R.wall,x,z,m+siteSwell(x,z)+cr),aw=KRELIEF.at(R.wall,x,z),g0=gw+mo;
 const g1=KRELIEF.shape(R.melt,x,z,g0),a1=KRELIEF.at(R.melt,x,z,g0);
 const P={g0,y:g1,rel:g1-m,crag:cr,moraine:mo,melt:a1?a1.part:null,cobble:a1?a1.cobble:0,fan:0,wall:aw?aw.part:null};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the brook: its whole line, the hanging bench to the tarn; the fall is found on it (WATER.fallsOf: 89w)
const SITE_STREAM={name:'The Gate-Bell brook (off the hanging bench\'s snow, over the headwall, into the tarn)',width:2.2,
 pts:()=>{if(!SITE_RECS)return [];return SITE_RECS.melt.pts.map(p=>[p.x,p.z,p.y]);}};
