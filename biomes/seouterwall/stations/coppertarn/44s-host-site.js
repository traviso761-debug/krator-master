// ================================================================= HOST — the site (station 6: the Copper-Vein Tarn)
// PLAN.md section 4, Oasis 5, and section 7.6: the model's tarn (53 cells at 3,820 m) west of its station pin, px 1288,1184 (the page's
// origin, on the east shore at the water's level): 3,820 m, 0.99 atm, Dsc, mean +6 °C, 408 mm, the wettest of the five (Waita Guli's moist
// air from the Yuni valley); a flat floor, the walls 5-6 km out.
// THE CIRQUE: a megabreccia headwall cut by a copper skarn vein (malachite, azurite, chalcopyrite), its fall stained peacock-blue and
// verdigris down the vein, into a tarn of the same colours; the headwaters of Waita Guli. Larch and stone pine in the cirque's lee.
//   KRELIEF.scarp  the headwall (north, bowed, the hanging bench above), buttressed, its talus
//   KRELIEF.wadi   the brook off the bench, over the lip (its fall: WATER.fallsOf), to the tarn
//   KRELIEF.range  the moraine damming the tarn's east shore
//   KRUBBLE.heap   rockfall at the headwall's foot
// The same interface as station 2's site (stations/gatetarn/44s-host-site.js). The Geomancers' winch and the Stalkers are owed (KNOWN_ISSUES.md).
const SITE={
 name:'coppertarn',title:'The Copper-Vein Tarn',R:2000,step:10,seed:6601,
 tarn:'The Copper-Vein Tarn',tarnColor:[.02,.17,.19],fallName:'The Copper-Vein fall',fallColor:0xbfe2dc,
 plan:{px:1288,py:1184,base:3820},
 // the rock: the cordillera's megabreccia (rock.megabreccia); the vein's copper is the water's and the fall's colour
 rock:{contact:[-522000,0]},
 crag:{amp:30,wave:170,from:.1,to:.38},
 wall:{pts:[[-3400,-900],[-1800,-1500],[0,-1750],[1700,-1500],[3300,-700]],side:-1,h:150,run:115,power:1.3,
  buttresses:{sp:240,w:.28,amp:24},talus:{h:16,reach:75},rough:.02,seed:6611},
 moraines:[{id:'dam',name:'The tarn\'s moraine dam',a:[-250,400],b:[-650,2300],h:14,w:85,seed:6612}],
 melt:{name:'The head of Waita Guli (off the hanging bench\'s snow, over the copper headwall, into the tarn)',pts:[[300,-2600],[200,-2100],[160,-1800],[130,-1640],[-40,-1250],[-280,-880],[-420,-480],[-400,-110]],w:3.4,bank:1.6,bankW:3,braids:1,fan:false},
 heaps:{n:4,foot:[24,42],x:[-1700,1600],rx:[16,34],seed:6621},
 spine:[[-300,-250],[130,-1500],[-1200,-1350],[1000,-1300]],
 need:['water','shore','moraine','crag','scree','larch'],
 snow:{autumn:[1200,1700],winter:[-2000,-1900],spring:[400,800],summer:[1800,2400]},
 eye:30,
 views:V=>{const L=SITE_LIP(),H0=SITE_HEAPS&&SITE_HEAPS[1];const o={
  'The Copper-Vein fall':V([L[0]-140,L[1]+520,12],[L[0],L[1],-60]),
  'The peacock tarn from its shore':V([-300,-250,4],[-4500,600,0]),
  'Up the brook to the headwall':V([-800,-440,3],[L[0],L[1],-40]),
  'Larch in the cirque\'s lee':V([900,-800,3],[1300,-1400,20]),
  'Across the moraine dam':V([300,1000,6],[-2400,1600,0]),
  'The cirque from the hanging bench':V([500,-2200,20],[-1500,1500,0]),
  'East to the Stalker Range':V([500,0,10],[12000,1500,1500])};
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
 const melt=M?KRELIEF.wadi({pts:siteResample(M.pts,8),ground:g1,w:M.w,bank:M.bank,bankW:M.bankW,braids:M.braids,pools:0,fan:false,seed:SITE.seed+8}):null;
 SITE_RECS={wall,moraines:SITE.moraines,melt};
 return SITE_RECS;}
// a polyline resampled every `step` m (KRELIEF.wadi takes its points as they are: its bed is linear between them, so it must be dense to
// follow the headwall's face down)
function siteResample(P,step){const out=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
 for(let k=0;k<n;k++){const t=k/n;out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}out.push(P[P.length-1].slice());return out;}
function siteMoraine(x,z){if(!SITE_MORAINE_FN.length)return 0;const hs=[];for(const f of SITE_MORAINE_FN)hs.push(f(x,z));return KRELIEF.join(hs);}
function SITE_MELT_AT(u){if(!SITE_RECS||!SITE_RECS.melt)return [0,0];const P=SITE_RECS.melt.pts,i=Math.min(P.length-1,Math.round(u*(P.length-1)));return [P[i].x,P[i].z];}
function SITE_FAN(){return SITE_MELT_AT(1);}
// the fall's lip: the brook's point nearest the wall's rim (the views)
function SITE_LIP(){if(!SITE_RECS||!SITE_RECS.melt)return SITE.wall.pts[Math.floor(SITE.wall.pts.length/2)];let b=null,bd=1e9;for(const p of SITE_RECS.melt.pts){const a=KRELIEF.at(SITE_RECS.wall,p.x,p.z);const d=a?Math.abs(a.d):1e9;if(d<bd){bd=d;b=[p.x,p.z];}}return b||[0,-1600];}
// ---------------------------------------------------------------- one record a point (memo of the last)
// g0 the model, its swells and crags, the headwall over them, the moraines on the floor; then the brook's bed cut into it
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),cr=siteCrag(x,z),mo=siteMoraine(x,z);
 const gw=KRELIEF.shape(R.wall,x,z,m+siteSwell(x,z)+cr),aw=KRELIEF.at(R.wall,x,z),g0=gw+mo;
 const g1=R.melt?KRELIEF.shape(R.melt,x,z,g0):g0,a1=R.melt?KRELIEF.at(R.melt,x,z,g0):null;
 const P={g0,y:g1,rel:g1-m,crag:cr,moraine:mo,melt:a1?a1.part:null,cobble:a1?a1.cobble:0,fan:0,wall:aw?aw.part:null};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the brook (SITE.melt): its whole line to the tarn; a fall is found on it where it drops over the wall (WATER.fallsOf: 89w)
const SITE_STREAM=SITE.melt?{name:SITE.melt.name,width:SITE.melt.width==null?2.2:SITE.melt.width,
 pts:()=>{if(!SITE_RECS||!SITE_RECS.melt)return [];return SITE_RECS.melt.pts.map(p=>[p.x,p.z,p.y]);}}:null;
