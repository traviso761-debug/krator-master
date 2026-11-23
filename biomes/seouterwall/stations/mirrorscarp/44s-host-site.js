// ================================================================= HOST — the site (station 4: the Mirror-Slump Tarn)
// PLAN.md section 4, Oasis 3, and section 7.6: the model's tarn (53 cells at 4,120 m) west of its station pin, px 1134,1218 (the page's
// origin, on the east shore at the water's level): 4,120 m, 0.96 atm, ET, mean +4 °C, 392 mm; a flat floor, the walls 5-6 km out.
// THE TRENCH: a back-tilted slump block's sag pond between two scarps (biomes/wouterwall's slump terraces): to the SOUTH the block's
// uphill-facing fault MIRROR, 150 m of polished pseudotachylite (the friction melt of the slip: black glass over the breccia), facing north
// into the sun at 53 S and throwing its noon light on the tarn; to the NORTH the block's crest, a long ridge between the trench and the
// scarps that fall to the Bowl. Puya on the mirror's sunny talus, willow and silverthorn on the strand.
//   KRELIEF.scarp  the fault mirror (steep, smooth: run 70 m, rough .005; the plateau to the south), its talus
//   KRELIEF.range  the slump block's crest north of the trench
//   KRUBBLE.heap   the glass's spall at the mirror's foot
// The same interface as station 2's site (stations/gatetarn/44s-host-site.js).
const SITE={
 name:'mirrorscarp',title:'The Mirror-Slump Tarn',R:2000,step:10,seed:6401,
 tarn:'The Mirror-Slump Tarn',tarnColor:[.03,.07,.12],
 plan:{px:1134,py:1218,base:4120},
 // the rock: the cordillera's megabreccia; the mirror's face black glass (rock.basalt.titanium's dark, tinted by the breccia's blocks)
 rock:{contact:[-214000,0],lib:'rock.basalt',ref:0x6d6a66,max:1.25},
 crag:{amp:26,wave:170,from:.1,to:.38},
 // the fault mirror (KRELIEF.scarp): its rim west to east south of the trench; side 1: the block's raised side to the south
 wall:{pts:[[-3600,1500],[-1900,1050],[0,900],[1900,1050],[3400,1500]],side:1,h:150,run:70,power:1.1,talus:{h:10,reach:55},rough:.005,seed:6411},
 moraines:[{id:'crest',name:'The slump block\'s crest (the trench\'s north side, over the scarps to the Bowl)',a:[-3200,-1450],b:[2600,-1250],h:24,w:170,seed:6412}],
 melt:null,
 heaps:{n:4,foot:[18,40],x:[-1600,1600],z0:400,dir:[0,1],rx:[14,30],seed:6421},
 spine:[[-300,0],[0,700],[-1300,800],[1100,800]],
 need:['water','shore','moraine','crag','scree','puna'],
 snow:{autumn:[1000,1500],winter:[-2000,-1900],spring:[300,700],summer:[1600,2200]},
 eye:30,
 views:V=>{const H0=SITE_HEAPS&&SITE_HEAPS[1];const o={
  'The fault mirror over the tarn':V([-600,-500,4],[-200,950,60]),
  'The trench tarn from its east shore':V([-200,100,4],[-4500,200,0]),
  'Puya on the mirror\'s sunny talus':V([600,500,4],[700,850,10]),
  'Along the mirror\'s foot':V([1600,700,6],[-1600,800,30]),
  'North over the slump block\'s crest':V([-300,-900,24],[-600,-9000,-900]),
  'The trench from the mirror\'s top':V([300,1150,6],[-1800,-600,0]),
  'Willow on the strand':V([-650,-250,3],[-1100,-100,0])};
  if(H0)o['The mirror\'s spall']=V([H0.x+60,H0.z-160,5],[H0.x,H0.z,3]);
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
