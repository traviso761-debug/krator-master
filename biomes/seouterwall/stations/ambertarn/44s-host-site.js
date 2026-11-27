// ================================================================= HOST — the site (station 3: the Amber-Sinter Tarn)
// PLAN.md section 4, Oasis 2, and section 7.5: the model's geothermal tarn (build_425_master.py, whas / wlev: 53 cells at 3,940 m, about
// 8 x 6 km) on a broad basin floor between walls 5 km north and south; the model's station pin, px 1064,1272, stands on its east shore,
// 1 km from the water: 3,940 m, 0.98 atm, Csb, mean +13 °C (the model's geothermal boost), 408 mm. y = 0 is the tarn's level.
// A FAULT runs north-south under the east shore (the plan's Godthrone feeder dike meeting the megabreccia): its vents warm the ground
// (core/terrain KTHERM), two hot springs rise on it, and the one fed by the hottest vent spills west to the tarn down rimstone terraces of
// opaline sinter; the warm ground round the vents is the Hearths' (biomes/hearths, read in place: the hearth trees on 25-60 °C).
//
// THE LANDFORMS AND THE HEAT, plain data the shared fragments read:
//   SITE.heat     KTHERM's soil and vents (47 bakes it: F.heat; 89a keeps the snow off the warm ground; 89z places the hearths on it)
//   SITE.springs  the hot pools (89w: WATER.spring, sinter and iron ramps), dished into the ground here (siteSpring)
//   SITE.terraces the sinter terraces' line and its treads (levels descending to the tarn: siteTreads), the ground stepped under them
//                 (siteTerrace); 89w makes them core/water's (WATER.terraces) and draws them
//   SITE.hearths  the hearth field: its centre, reach, dress and the dead rings outside (89z: HEARTH.layout)
//   SITE.steam    the steam's mouths (89w: ATMOS.smoke)
const SITE={
 name:'ambertarn',title:'The Amber-Sinter Tarn',R:2000,step:8,seed:6301,
 tarn:'The Amber-Sinter Tarn',tarnColor:[.05,.16,.17],layer1:'ground.sinter',
 plan:{px:1064,py:1272,base:3940},
 rock:{contact:[-74000,0]},
 crag:{amp:24,wave:170,from:.1,to:.38},
 moraines:[],
 // the ground's heat: the country's soil (+2 °C: the plan's ambient +1, the basin's lee), the fault's line vent, the two springs' points
 heat:{soil:2,vents:[{id:'fault',kind:'line',pts:[[330,-760],[300,-300],[320,200],[360,620]],T:72,reach:230,decay:3},
  {id:'spring-amber',kind:'point',x:300,z:-350,T:92,reach:140,decay:3},{id:'spring-ochre',kind:'point',x:330,z:250,T:84,reach:110,decay:3}],
  detail:{amp:1.5,scale:.02,seed:6305},box:[-900,-1300,1300,1300],cell:4},
 // the hot springs (WATER.spring): the amber one feeds the terraces; the ochre one's iron stains its rim
 springs:[{key:'amber',name:'The amber spring (sinter: turquoise over its vent, amber and orange mats round its rim)',x:300,z:-350,r:11,temp:.86,mineral:'sinter',depth:1.6},
  {key:'ochre',name:'The ochre spring (iron: rust round its rim)',x:330,z:250,r:8,temp:.7,mineral:'iron',depth:1.2}],
 // the sinter terraces: the amber spring's outflow west to the tarn, its treads `n` steps down from the spring's rim to the tarn's level
 terraces:{name:'The sinter terraces (opaline and iron sinter: the amber spring\'s overflow to the tarn)',line:[[290,-350],[180,-330],[40,-300],[-140,-260],[-360,-215],[-600,-180],[-860,-150],[-1060,-130]],
  n:12,width:22,riser:4,dish:.3},
 // the hearth field (biomes/hearths, dress 'rim': broad fans, few, high; the dead broken and standing in rings outside)
 hearths:{at:[310,-60],R:420,dress:'rim',dead:[430,520],seed:6331},
 steam:{vents:[[300,-350],[330,250],[310,-650],[330,0],[350,480]],lake:[[-980,-140],[-1050,-60],[-1020,-220]]},
 heaps:null,
 melt:null,
 spine:[[200,-300],[-500,-200],[300,250],[600,-900]],
 need:['water','shore','hot','sinter','col'],
 plantsNeed:['puya','guyedstalk'],
 // a flat geothermal basin: few trees (the larch only in the odd lee, the creeping pine on the col's swells); the roots check's floor
 minTrees:20,
 snow:{autumn:[1300,1800],winter:[-2000,-1900],spring:[500,900],summer:[1900,2500]},
 eye:30,
 views:V=>{const o={
  'The amber spring':V([300+40,-350+30,4],[300,-350,0]),
  'Down the sinter terraces to the tarn':V([200,-330,4],[-1000,-140,0]),
  'The tarn from its terraced shore':V([-850,-120,3],[-4000,0,0]),
  'Hearth trees on the warm ground':V([520,-200,3],[320,-80,5]),
  'The fault\'s vents':V([620,-500,6],[320,-300,0]),
  'Across the tarn to the north wall':V([-700,600,4],[-3500,-5500,300]),
  'The basin from the east wall':V([1800,-400,60],[-1500,0,0]),
  'The ochre spring':V([330+30,250+25,4],[330,250,0])};
  return o;}
};
// the floor's swells and fine roughness: core/rand's noise, never a page fbm
function siteSwell(x,z){return 2*(KRAND.fbm(x*.0012+3.1,z*.0012-2.3,0,3,6302)-.5)*2+.8*(KRAND.fbm(x*.008-1.2,z*.008+5.8,0,2,6306)-.5)*2;}
function siteCragK(x,z){const C=SITE.crag,s=(MODEL(x+250,z)-MODEL(x-250,z))/500,t=(MODEL(x,z+250)-MODEL(x,z-250))/500;return smooth(C.from,C.to,Math.hypot(s,t));}
function siteCrag(x,z){const C=SITE.crag,k=siteCragK(x,z);if(k<=0)return 0;
 const r=1-Math.abs(2*KRAND.fbm(x/C.wave+4.3,z/C.wave-1.9,0,4,6303)-1),r2=1-Math.abs(2*KRAND.fbm(x/(C.wave*.37)+1.7,z/(C.wave*.37)-3.4,0,3,6304)-1);
 return C.amp*k*(Math.pow(r,2.2)*.8+Math.pow(r2,3)*.35-.32);}
// ---------------------------------------------------------------- the terraces' line (arc length) and its treads (plain data: WATER.terraces takes them as they are)
const _TL=(function(){const P=SITE.terraces.line,a=[0];for(let i=1;i<P.length;i++)a.push(a[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return {P,a,L:a[a.length-1]};})();
function _tProject(x,z){const P=_TL.P;let best=null;for(let i=0;i+1<P.length;i++){const ax=P[i][0],az=P[i][1],ex=P[i+1][0]-ax,ez=P[i+1][1]-az,l2=ex*ex+ez*ez||1e-9,u=clamp(((x-ax)*ex+(z-az)*ez)/l2,0,1),
  d=Math.hypot(x-(ax+ex*u),z-(az+ez*u));if(!best||d<best.d)best={d,s:_TL.a[i]+u*Math.sqrt(l2)};}return best;}
let SITE_RECS=null,SITE_HEAPS=null;
const SITE_MORAINE_FN=[];
// THE TREADS: the spring's rim (the ground there) to the tarn's level in n equal steps, each tread an equal share of the line less its risers
function siteBuild(ground){const T=SITE.terraces,n=T.n,rs=T.riser,room=_TL.L-(n-1)*rs,tw=room/n;
 const top=ground(T.line[0][0],T.line[0][1])+.4,bot=.25,treads=[];
 for(let i=0;i<n;i++){const s0=i*(tw+rs),y=top+(bot-top)*i/(n-1);treads.push({s0,s1:s0+tw,y});}
 SITE_RECS={moraines:[],melt:null,terraces:{name:T.name,line:T.line,treads,width:T.width},springs:SITE.springs.map(S=>Object.assign({},S,{level:ground(S.x,S.z)+.2}))};
 return SITE_RECS;}
function siteMoraine(){return 0;}
function SITE_MELT_AT(){return [0,0];}
function SITE_FAN(){return [0,0];}
// the ground under the terraces: each tread a pool dished `dish` m under its level, each riser falling to the next tread; a broad low
// apron of sinter (the terraces' own deposit) round the line, so the steps stand on the deposit and not in a ditch
function siteTerrace(x,z,g){const R=SITE_RECS&&SITE_RECS.terraces;if(!R)return g;const p=_tProject(x,z),w=R.width/2;if(!p||p.d>w+40)return g;
 const Tr=R.treads;let y=null;for(let i=0;i<Tr.length;i++){if(p.s<Tr[i].s0)break;if(p.s<=Tr[i].s1){y=Tr[i].y;break;}if(i+1<Tr.length&&p.s<Tr[i+1].s0){const t=(p.s-Tr[i].s1)/(Tr[i+1].s0-Tr[i].s1);y=Tr[i].y+(Tr[i+1].y-Tr[i].y)*t;break;}}
 if(y==null)return g;const surf=y-SITE.terraces.dish*(1-Math.pow(clamp(p.d/w,0,1),2)),rim=y+.12;
 if(p.d<=w)return surf;return g+(rim-g)*smooth(w+40,w,p.d)*(g<rim?1:.6);}
// the springs' pools: a bowl `depth` under the rim (the ground round the spring), its rim a low sinter lip
function siteSpring(x,z,g){const R=SITE_RECS&&SITE_RECS.springs;if(!R)return g;for(const S of R){const d=Math.hypot(x-S.x,z-S.z);if(d>S.r*2.2)continue;
  const lip=S.level+.15;if(d<=S.r)return lip-S.depth*(1-Math.pow(d/S.r,2))-.15;return g+(lip-g)*smooth(S.r*2.2,S.r,d);}return g;}
// ---------------------------------------------------------------- one record a point (memo of the last)
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=MODEL(x,z),cr=siteCrag(x,z),g0=m+siteSwell(x,z)+cr;
 const g1=siteTerrace(x,z,g0),g2=siteSpring(x,z,g1),tp=SITE_RECS?_tProject(x,z):null;
 const P={g0,y:g2,rel:g2-m,crag:cr,moraine:0,melt:null,cobble:0,fan:0,wall:null,sinter:tp&&tp.d<SITE.terraces.width/2+30?1-smooth(SITE.terraces.width/2,SITE.terraces.width/2+30,tp.d):0};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
// no brook at this station: the springs and the terraces are its water (89w)
const SITE_STREAM=null;
// the station's own water for the host's waterH (47): a spring's pool to its rim, a tread's pool to its level
function siteWaterAt(x,z){const R=SITE_RECS;if(!R)return null;for(const S of R.springs){if(Math.hypot(x-S.x,z-S.z)<S.r*.95)return S.level;}
 const p=_tProject(x,z);if(!p||p.d>R.terraces.width/2*.92)return null;for(const t of R.terraces.treads)if(p.s>=t.s0&&p.s<=t.s1)return t.y;return null;}
