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
 // the terraces: a step of `rise` m on the knolls' flanks, in patches (a field system round a few knolls, not every slope: refs/03),
 // each patch a KRELIEF.terraces record with its own circle and the band (page y) it is cut in; step: the ground's finer grid over each
 // patch (47: a KFIELD inset, so a 3.2 m step's riser is drawn, not smoothed into the 8 m grid's slope)
 terraces:{rise:3.2,riser:.3,band:[-140,60],step:2,patches:[[-700,1050,260],[150,880,230],[650,1250,300],[1250,1000,220],[-150,1500,240]]},
 // the cave houses' mouths (PLAN.md section 2, the Hayrant's yaodong; refs/07 for the turf cellars where the loess thins): a row of
 // vaulted rooms dug into the trunk's south wall (it faces north, into the sun at 40 S), on its dry floor above the spring; KCARVE
 // alcoves (47). u: where along the trunk (0 head .. 1 mouth); n rooms, gap m apart; hw, depth, h: each room's half-width, depth, height
 caves:{u:.32,n:5,gap:7.5,hw:1.9,depth:9,h:3.6,step:1},
 // the earth pillars (refs/05): loess columns under a capstone, on the trunk gully's dry upper floor
 pillars:{n:12,seed:5211},
 // the dust towers on the yuan (46: WOW.DUST's defaults; cell m, p a cell's chance)
 dust:{cell:110,p:.2},
 // the terraces' crops (88c; kits/crops' wouterwall records): each field one of the rotation, by weight; step: a card every step m
 crops:{step:2.4,rotation:[['dustmillet',3],['dust-lentil',2],['redstem',2],['bench-garlic',1],['wallhemp',1],['fallow',1]]},
 // the crops on the terraces (99): at least three of the rotation drawn, every field's crop fitting the crops kit's terrace zone
 checks:()=>[{name:'the Hayrant\'s crops on the terraced fields (kits/crops: the terrace zone)',run:()=>SITE_CROP_CHECK(window._crops)}],
 negatives:()=>[{name:'no crop on the terraces',run:()=>SITE_CROP_CHECK(Object.assign({},window._crops,{byCrop:{},plants:0}))},
  {name:'a crop that does not fit the terraces',run:()=>SITE_CROP_CHECK(Object.assign({},window._crops,{rotation:(window._crops?window._crops.rotation:[]).concat(['rice'])}))}],
 // what the checks want (99): the zones on the raster, the registered landforms
 need:{zones:['yuan','wall','floor','terrace','larch','steppe','gully'],keys:{'landform.pillar':6,'house.yaodong':3,'plant.dusttower':8},larch:150},
 snow:{autumn:[700,1200],winter:[-2000,-1900],spring:[-2000,-1900],summer:[2200,3000]},
 eye:30,
 views:V=>{const T=SITE_TRUNK_AT,P0=(typeof PILLARS!=='undefined'&&PILLARS[0])||null,a=T(.25),b=T(.45),s=SITE_SPRING||T(.65),c=SITE_BELOW_SPRING(260);const o={
  'The gully from its rim':V(SITE_RIM(.3,-1,6),[b[0],b[1],0]),
  'Down the gully to the spring':V([b[0],b[1],5],[s[0],s[1],2]),
  'The brook below the spring':V([c[0],c[1],5],[s[0],s[1],0]),
  'Larch on the shaded wall':V(SITE_RIM(.35,1,3),SITE_RIM(.38,-1,-40)),
  'Terraced knolls (mao)':V([150,600,30],[150,880,0]),
  'The yuan (feather-grass flat)':V([-600,-1100,2.2],[-100,-1500,0]),
  'The tablelands from above':V([0,-1700,480],[0,300,0]),
  'West to the wall':V([800,700,40],[-6000,-400,600])};
  if(typeof CAVES!=='undefined'&&CAVES.length){const C=CAVES[Math.floor(CAVES.length/2)];
   o['Cave houses in the gully wall']=V([C.c[0]+C.n[0]*30+C.n[1]*8,C.c[1]+C.n[1]*30-C.n[0]*8,5],[C.c[0]-C.n[0]*2,C.c[1]-C.n[1]*2,3]);}
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
 const TE=SITE.terraces,terr=TE.patches.map((c,i)=>KRELIEF.terraces({rise:TE.rise,riser:TE.riser,zone:{c:[c[0],c[1]],r:c[2]},fade:60,band:TE.band,seed:SITE.seed+5+i}));
 SITE_RECS={trunk,south,terr};
 // the spring: where the trunk's floor lies the loess's depth under the yuan (WOW.springAt), the first such point down the trunk
 const L=trunk.lines[0].pts;for(let i=0;i<L.length;i++){if(ground(L[i][0],L[i][1])-L[i][2]>=SITE.loess){SITE_SPRING=[L[i][0],L[i][1],i];break;}}
 return SITE_RECS;}
// a point on the trunk's rim at u, on the north (-1) or south (+1) side (the views): out from the thalweg till the cut is gone
function SITE_RIM(u,side,h){const L=SITE_RECS.trunk.lines[0].pts,i=Math.min(L.length-2,Math.round(u*(L.length-1))),a=L[i],b=L[i+1],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz)||1;
 let d=10;for(;d<300;d+=4){const x=a[0]-dz/n*side*d,z=a[1]+dx/n*side*d;if(sitePoint(x,z).cut<3)break;}
 return [a[0]-dz/n*side*(d+6),a[1]+dx/n*side*(d+6),h];}
// a point at u (0 head .. 1 mouth) along the trunk's thalweg (the views)
function SITE_TRUNK_AT(u){if(!SITE_RECS)return [0,0];const L=SITE_RECS.trunk.lines[0].pts,i=Math.min(L.length-1,Math.round(u*(L.length-1)));return [L[i][0],L[i][1]];}
/* a point on the thalweg up to `d` m below the spring, kept 250 m inside the near box: past it the mid ground's 220 m cells do not hold the
   gully, so an eye on the floor out there stands under the drawn mid mesh (GPU verify 2026-11-09: 'The brook below the spring' at u .8) */
function SITE_BELOW_SPRING(d){if(!SITE_RECS||!SITE_SPRING)return SITE_TRUNK_AT(.7);const L=SITE_RECS.trunk.lines[0].pts,lim=SITE.R-250;let k=SITE_SPRING[2],run=0;
 while(k+1<L.length&&run<d&&Math.max(Math.abs(L[k+1][0]),Math.abs(L[k+1][1]))<=lim){run+=Math.hypot(L[k+1][0]-L[k][0],L[k+1][1]-L[k][1]);k++;}return [L[k][0],L[k][1]];}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
// g0 the yuan (the model and its swells), then the trunk and the south system cut into it, then the terraces on what is left of the
// knolls (never on a gully's floor, head or wall: the loess stands sheer there)
const _sp={x:NaN,z:NaN,P:null};
const _cutPart=p=>p==='floor'||p==='head'||p==='wall'||p==='rim';
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),g0=m+siteSwell(x,z);
 const g1=KRELIEF.shape(R.trunk,x,z,g0),a1=KRELIEF.at(R.trunk,x,z,g0);
 const g2=KRELIEF.shape(R.south,x,z,g1),a2=KRELIEF.at(R.south,x,z,g1);
 const c1=!!(a1&&_cutPart(a1.part)),c2=!!(a2&&_cutPart(a2.part));
 let g3=g2,a3=null;if(!c1&&!c2)for(const T of R.terr){const zc=T.zone.c,r=T.zone.r;if(Math.abs(x-zc[0])>r||Math.abs(z-zc[1])>r)continue;
  g3=KRELIEF.shape(T,x,z,g2);a3=KRELIEF.at(T,x,z,g2);break;}
 // the part that wins: the deeper cut's (the trunk's where both cut), else the terraces', else the tops
 const A=c1&&(!c2||g0-g1>=g1-g2)?{rec:'trunk',a:a1}:c2?{rec:'south',a:a2}:null;
 const top=a2&&a2.part==='mao'?'mao':'yuan';
 const ord=A?R[A.rec].lines[A.a.line].order:-1;
 const P={g0,g2,y:g3,rel:g3-m,cut:Math.max(0,g0-g3),part:A?A.a.part:a3?a3.part:top,rec:A?A.rec:a3?'terr':null,order:ord,terrace:!!a3,top};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
// THE RELIEF (metres over the model)
function siteRelief(x,z){return sitePoint(x,z).rel;}
// the zones' site fields: the gully floor (the trunk's and the south system's main floors), a side gully (a branch's floor or head:
// silverthorn's), the yuan (its flat top)
function siteFloor(x,z){const P=sitePoint(x,z);return P.part==='floor'&&P.order===0?1:0;}
function siteGully(x,z){const P=sitePoint(x,z);return (P.part==='floor'||P.part==='head')&&P.order>0?1:0;}
function siteYuan(x,z){const P=sitePoint(x,z);return P.part==='yuan'?1:0;}
// THE STACKS (47 draws and registers them; core/terrain KSTACKS): the earth pillars (refs/05) on the trunk gully's dry upper floor, loess
// columns capped by a boulder that sheltered them while the gully ate the loess round them away (at 0.75 g they stand taller than Earth's:
// Bolzano's Erdpyramiden reach 30 m), where the ground is gentle enough to hold one, the foot under the lowest ground round it; and the
// DUST TOWERS on the yuan (the kit's own colonies, 46's WOW.DUST: KSTACKS mounds by cell, so any window gives the same towers)
function siteStacks(ctx){const T=SITE.pillars,L=[];if(T){const s=KRAND.stream(KRAND.hash(T.seed,1));
 const F0=SITE_RECS.trunk.lines[0].pts,n0=F0.length;
 for(let t=0;t<900&&L.length<T.n;t++){const q=F0[Math.floor(s.range(.08,.6)*n0)],x=q[0]+s.range(-30,30),z=q[1]+s.range(-30,30),r=s.range(2.2,4.6),H=s.range(9,30);
  const P=sitePoint(x,z);if(P.rec!=='trunk'||P.part!=='floor')continue;if(ctx.CAVES.some(Q=>Math.hypot(Q.c[0]-x,Q.c[1]-z)<Q.depth+r+12))continue;
  if(ctx.STREAM&&ctx.STREAM.near(x,z,40).d<14)continue;if(L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r+9))continue;
  const G=ctx.COARSE.grade(x,z);if(G.g>.75)continue;
  const B=KSTACKS.make({id:'pillar'+L.length,kind:'balanced',x,z,y0:ctx.footY(x,z,r),seed:T.seed+L.length,H,r,e:s.range(1,1.35),ry:s.range(0,TAU),taper:s.range(.3,.5),lean:s.range(0,.04)});
  B.name='An earth pillar (a loess column '+H.toFixed(0)+' m tall under its capstone)';B.key='landform.pillar';B.tex='rock.loess';L.push(B);}}
 if(SITE.dust)L.push(...WOW.dustTowers({world:SITE.seed,box:[-SITE.R,-SITE.R,SITE.R,SITE.R],ground:ctx.ground,accept:(x,z)=>sitePoint(x,z).part==='yuan'&&ctx.COARSE.grade(x,z).g<.09,
  avoid:(x,z,r)=>L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r+6)},SITE.dust));
 return L;}
// the brook: from the spring down the trunk's floor to its mouth (the record's floor never climbs downstream)
const SITE_STREAM={name:'The spring brook (it rises where the gully reaches the foot of the loess)',width:2.4,
 pts:()=>{if(!SITE_RECS||!SITE_SPRING)return [];return SITE_RECS.trunk.lines[0].pts.slice(SITE_SPRING[2]).map(p=>[p[0],p[1],p[2]]);}};
// the crops' check: three crops or more drawn in the season, and every crop in the rotation fits the crops kit's terrace zone
function SITE_CROP_CHECK(C){if(!C)return{ok:false,detail:'no crops pass'};const fit=new Set(CROPS.forBiome('wouterwall').filter(r=>r.zone==='terrace').map(r=>r.crop.id)),
 bad=(C.rotation||[]).filter(id=>id!=='fallow'&&!fit.has(id)),n=Object.keys(C.byCrop||{}).length,want=SEASON==='winter'?1:3;
 return{ok:n>=want&&!bad.length,detail:(C.plants||0)+' plants in '+(C.fields||0)+' fields ('+(C.fallow||0)+' fallow): '+Object.keys(C.byCrop||{}).map(k=>k+' '+C.byCrop[k]).join(', ')+(bad.length?'; not a terrace crop: '+bad.join(', '):'')};}
