// ================================================================= HOST — the site (station 5: the Jade-Karst Polje)
// PLAN.md section 4, Oasis 4, and section 7.6: the model's tarn (53 cells at 4,380 m) west of its station pin, px 1208,1254 (the page's
// origin, on the east shore at the water's level): 4,380 m, 0.93 atm, ET, mean +3 °C, 392 mm; a flat floor, the walls 5-6 km out.
// THE POLJE: a raft of reef limestone carried whole into the crater's rim, dissolved by snowmelt into a sunken amphitheatre: its
// LIMESTONE CLIFFS ring the polje's north and east, and at their foot the resurgence (a spring out of a cave, +9 °C all year) runs as a
// brook across the floor into the jade tarn (the dissolved carbonate's milky green). Blocks fallen from the cliffs lie at their foot.
//   KRELIEF.scarp  the polje's limestone cliffs (north and east, the plateau outside), buttressed, their talus
//   KRELIEF.wadi   the resurgence brook from the cliff's foot to the tarn
//   KRUBBLE.heap   the cliffs' fallen blocks
// The same interface as station 2's site (stations/gatetarn/44s-host-site.js). The cave (KKARST) and the ponor are owed (KNOWN_ISSUES.md).
const SITE={
 name:'jadecrest',title:'The Jade-Karst Polje',R:2000,step:10,seed:6501,
 tarn:'The jade tarn (the Jade-Karst Polje)',tarnColor:[.05,.20,.15],
 plan:{px:1208,py:1254,base:4380},
 // the rock: the reef limestone (rock.limestone.karst), tinted by the megabreccia column's limestone blocks
 rock:{contact:[-362000,0],lib:'rock.limestone.karst',ref:0xbdb6a6,max:1.3},
 crag:{amp:22,wave:170,from:.1,to:.38},
 // the polje's cliffs (KRELIEF.scarp): north, then turning down the east; side -1: the plateau outside (north, then east)
 wall:{pts:[[-3400,-1600],[-1500,-1800],[300,-1650],[1500,-1000],[1850,200],[1600,1500],[1000,2400]],side:-1,h:110,run:80,power:1.2,
  buttresses:{sp:200,w:.3,amp:18},talus:{h:12,reach:60},rough:.02,seed:6511},
 moraines:[],
 // the resurgence brook: from the cave's mouth at the cliff's foot (north-east) across the floor to the tarn
 melt:{name:'The resurgence (a karst spring out of the cliff\'s foot, +9 °C all year, to the jade tarn)',pts:[[640,-1240],[480,-1080],[200,-850],[-120,-560],[-300,-300],[-380,-90]],w:3,bank:1.4,bankW:3,braids:1,fan:false,width:2.4},
 heaps:{n:5,foot:[18,34],x:[-1800,900],rx:[12,26],seed:6521},
 spine:[[-300,-200],[600,-1300],[-1200,-1450],[1300,-200]],
 need:['water','shore','crag','scree'],
 snow:{autumn:[900,1400],winter:[-2000,-1900],spring:[250,600],summer:[1500,2100]},
 eye:30,
 views:V=>{const H0=SITE_HEAPS&&SITE_HEAPS[2];const o={
  'The jade tarn from its shore':V([-500,-150,3],[-4500,300,0]),
  'The resurgence at the cliff\'s foot':V([350,-950,5],[700,-1450,6]),
  'Down the resurgence to the tarn':V([520,-1180,4],[-1050,-120,0]),
  'The polje\'s limestone cliffs':V([-300,-700,6],[-800,-1800,70]),
  'The east cliffs':V([700,300,6],[1900,300,60]),
  'The polje from its rim':V([600,-2100,15],[-1500,600,0])};
  if(H0)o['Blocks under the cliffs']=V([H0.x+40,H0.z+160,5],[H0.x,H0.z,3]);
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
