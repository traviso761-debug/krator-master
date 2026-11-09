// ================================================================= HOST — the site (station 1: the loess tablelands)
// PLAN.md section 7, station 1: a yuan (the tableland's flat top) cut by a deep, sheer-walled gully; south of it the tableland broken
// into knolls (mao), terraced fields contouring their flanks; earth pillars on the gully's floor; larch on the shaded (south-facing)
// walls, feather grass on the sunny slopes and the flat. On the scale model (5.1) at px 352,716 (region/far.py): 3,664 m, 1.01 atm,
// Dsb, mean +7 °C, 518 mm, in the Eternal State's half of the bench (the Hayrant's country); Mirabilis 20 km south, Yut-Ma's valley
// 17 km south. The model's bench falls south-east here (~25 m a km), so the station's gully drains ESE toward Yut-Ma, as its tributary.
//
// THE LANDFORMS are core/terrain's (38c-core-landforms.js, PLAN.md section 2's table), one record each, composed on the model:
//   KRELIEF.gully  tops 'yuan'  the trunk gully: 150 m deep at its mouth, sheer walls, an amphitheatre head, a few branches
//   KRELIEF.gully  tops 'mao'   the gully system to the south, shallower, its interfluves broken into round knolls
//   KRELIEF.terraces            contour terraces on the knolls (a zone and a height band), not on a gully's walls or floor
// The site is DATA the stage (45) reads: siteBuild(ground) makes the records once the model's ground exists; siteRelief(x, z) is then
// metres over the model; sitePoint(x, z) each record's part there (the zones' fields: 47).
const SITE={
 name:'tablelands',title:'The loess tablelands',R:1600,step:8,seed:5201,
 // the loess's depth here (m; PLAN.md section 2: 100-200 m on the lower bench). The trunk gully reaches its foot near the mouth: the spring
 loess:125,
 // the trunk gully: its thalweg from the head (west-north-west) to the mouth (east-south-east, past the box), meandering (KRELIEF.meander)
 trunk:{a:[-1500,-650],b:[2700,950],amp:110,wave:900,depth:150,w:18},
 // the knolls' gully system to the south: shallower, branchier, its tops mao
 south:{a:[-1300,820],b:[2700,1500],amp:80,wave:700,depth:85,w:10},
 // the terraces: a step of `rise` m on the knolls' flanks, inside the zone (a polygon south of the trunk) and the band (page y)
 terraces:{rise:3.2,riser:.3,zone:[[-1500,420],[1800,680],[1900,1900],[-1500,1900]],band:[-140,60]},
 // the earth pillars (refs/05): loess columns under a capstone, on the trunk gully's dry upper floor
 pillars:{n:12,seed:5211},
 snow:{autumn:[700,1200],winter:[-2000,-1900],spring:[-2000,-1900],summer:[2200,3000]},
 eye:30,
 views:V=>{const T=SITE_TRUNK_AT,P0=(typeof PILLARS!=='undefined'&&PILLARS[0])||null,a=T(.25),b=T(.45),s=SITE_SPRING||T(.65),c=T(.8);const o={
  'The gully from its rim':V([a[0]-30,a[1]-240,6],[b[0],b[1],-60]),
  'Down the gully to the spring':V([b[0],b[1],5],[s[0],s[1],2]),
  'The brook below the spring':V([c[0]+40,c[1]+30,5],[s[0],s[1],0]),
  'Larch on the shaded wall':V([a[0]+10,a[1]+120,4],[a[0],a[1]-60,30]),
  'Terraced knolls (mao)':V([200,560,14],[300,1200,0]),
  'The yuan (feather-grass flat)':V([-600,-1100,2.2],[-100,-1500,0]),
  'The tablelands from above':V([0,-1700,480],[0,300,0]),
  'West to the wall':V([800,700,40],[-6000,-400,600])};
  if(P0)o['Earth pillars on the gully floor']=V([P0.x+P0.R*6,P0.z+P0.R*4,3],[P0.x,P0.z,(P0.top-P0.y0)*.5]);
  return o;}
};
// the yuan's own swells (broad, a few metres) and its fine roughness, under the gullies: core/rand's noise, never a page fbm
function siteSwell(x,z){return 9*(KRAND.fbm(x*.0008+7.1,z*.0008-3.3,0,3,5202)-.5)*2+1.5*(KRAND.fbm(x*.006-1.2,z*.006+8.8,0,2,5206)-.5)*2;}
// THE RECORDS (made once the model's ground exists: 45 calls siteBuild): each plain data, JSON-safe, the page's export carries them
let SITE_RECS=null,SITE_SPRING=null;
function siteBuild(ground){const T=SITE.trunk,S=SITE.south;
 const trunk=KRELIEF.gully({pts:KRELIEF.meander(T.a,T.b,{amp:T.amp,wave:T.wave,seed:SITE.seed+1}),ground,depth:T.depth,w:T.w,tops:'yuan',seed:SITE.seed+2});
 const south=KRELIEF.gully({pts:KRELIEF.meander(S.a,S.b,{amp:S.amp,wave:S.wave,seed:SITE.seed+3}),ground,depth:S.depth,w:S.w,tops:'mao',knoll:150,seed:SITE.seed+4});
 const terr=KRELIEF.terraces({rise:SITE.terraces.rise,riser:SITE.terraces.riser,zone:{poly:SITE.terraces.zone},band:SITE.terraces.band,seed:SITE.seed+5});
 SITE_RECS={trunk,south,terr};
 // the spring: where the trunk's floor lies the loess's depth under the yuan (WOW.springAt), the first such point down the trunk
 const L=trunk.lines[0].pts;for(let i=0;i<L.length;i++){if(ground(L[i][0],L[i][1])-L[i][2]>=SITE.loess){SITE_SPRING=[L[i][0],L[i][1],i];break;}}
 return SITE_RECS;}
// a point at u (0 head .. 1 mouth) along the trunk's thalweg (the views)
function SITE_TRUNK_AT(u){if(!SITE_RECS)return [0,0];const L=SITE_RECS.trunk.lines[0].pts,i=Math.min(L.length-1,Math.round(u*(L.length-1)));return [L[i][0],L[i][1]];}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// g0 the yuan (the model and its swells), then the trunk and the south system cut into it, then the terraces on what is left of the
// knolls (never on a gully's floor, head or wall: the loess stands sheer there)
const _sp={x:NaN,z:NaN,P:null};
const _cutPart=p=>p==='floor'||p==='head'||p==='wall'||p==='rim';
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),g0=m+siteSwell(x,z);
 const g1=KRELIEF.shape(R.trunk,x,z,g0),a1=KRELIEF.at(R.trunk,x,z,g0);
 const g2=KRELIEF.shape(R.south,x,z,g1),a2=KRELIEF.at(R.south,x,z,g1);
 const c1=!!(a1&&_cutPart(a1.part)),c2=!!(a2&&_cutPart(a2.part));
 let g3=g2,a3=null;if(!c1&&!c2){g3=KRELIEF.shape(R.terr,x,z,g2);a3=KRELIEF.at(R.terr,x,z,g2);}
 // the part that wins: the deeper cut's (the trunk's where both cut), else the terraces', else the tops
 const A=c1&&(!c2||g0-g1>=g1-g2)?{rec:'trunk',a:a1}:c2?{rec:'south',a:a2}:null;
 const top=a2&&a2.part==='mao'?'mao':'yuan';
 const ord=A?R[A.rec].lines[A.a.line].order:-1;
 const P={g0,y:g3,rel:g3-m,cut:Math.max(0,g0-g3),part:A?A.a.part:a3?a3.part:top,rec:A?A.rec:a3?'terr':null,order:ord,terrace:!!a3,top};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
// THE RELIEF (metres over the model)
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the zones' site fields: the gully floor (the trunk's and the south system's main floors), a side gully (a branch's floor or head:
// silverthorn's), the yuan (its flat top)
function siteFloor(x,z){const P=sitePoint(x,z);return P.part==='floor'&&P.order===0?1:0;}
function siteGully(x,z){const P=sitePoint(x,z);return (P.part==='floor'||P.part==='head')&&P.order>0?1:0;}
function siteYuan(x,z){const P=sitePoint(x,z);return P.part==='yuan'?1:0;}
// the brook: from the spring down the trunk's floor to its mouth (the record's floor never climbs downstream)
const SITE_STREAM={name:'The spring brook (it rises where the gully reaches the foot of the loess)',width:2.4,
 pts:()=>{if(!SITE_RECS||!SITE_SPRING)return [];return SITE_RECS.trunk.lines[0].pts.slice(SITE_SPRING[2]).map(p=>[p[0],p[1],p[2]]);}};
