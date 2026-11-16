// ================================================================= HOST — the site (station 3: the sturzstrom)
// PLAN.md section 7, station 3: a hummocky, grooved lobe, a fresh lobe beside an old one, megablocks, a small lake dammed behind the rim
// (the kit's), fellfield; the airless crest over all. On the scale model (5.1) the flagship lobe runs 36-42 km east from its headwall
// scar at px 310,872 (4,906 m); the page stands 20 km down it, px 320,871 (region/far.py): 4,989 m, 0.86 atm, Dfc, mean -2 °C, 282 mm.
// The wall rises to 7,075 m 64 km west, the airless rim beyond (region/crest.json: the far land holds it).
//
// THE LANDFORMS are core/terrain's (38c-core-landforms.js), composed on the model's lobe (which carries them at 1 km a cell):
//   KRELIEF.runout  OLD    a lobe from the west-north-west, its hummocks softened and its grooves filled (fresh: false), lichen and
//                          cushions over the rubble (the old lobe's zone: hummock)
//   KRELIEF.runout  FRESH  a younger lobe beside it from the west-south-west, sharp hummocks, grooves down its length, its distal rim
//                          standing up: bare angular rubble (the zone: runout); its rim dams a small lake beside it (the kit's)
//   MEGABLOCKS             KSTACKS buttes of the patchwork rock riding on both lobes (siteStacks): blocks the avalanche carried whole
// The dammed lake is carved here (the record's own lake stands at its centre's ground plus a depth, which on this flat lobe would
// stand over the ground round it): a basin under the lobe's flank, its level the lowest of its rim (it spills there).
const SITE={
 name:'sturzstrom',title:'The sturzstrom',R:1800,step:8,seed:5401,loess:0,warm:0,
 slots:['rock','rubble'],
 old:{a:[-3400,-1900],b:[2700,-600],w:1050,h:34},
 fresh:{a:[-3300,900],b:[1600,1500],w:760,h:30},
 // the dammed lake: beside the fresh lobe's flank at s (of its length), its radius and the basin's depth
 lake:{s:.66,side:-1,r:170,depth:14},
 megablocks:{n:9,seed:5411},
 // THE PERMAFROST'S EDGE (PLAN.md section 2; core/terrain KFROST, 47): a mean of -2 °C here, WOW.PERMA's line. Solifluction lobes creep
 // down the old lobe's flanks and the swells where the ground is frozen enough (the mean under -1.2 °C) and gently sloped; never on the
 // fresh rubble (it drains: nothing flows). Sorted polygons (a few metres) are under the 8 m ground grid: not laid
 frost:c=>({lobes:{cell:26,h:1.1,where:(x,z)=>{const P=sitePoint(x,z);if(P.runout==='fresh'||P.part==='lake'||P.part==='megablock')return 0;
  const g=c.grade(x,z).g;return smooth(.03,.07,g)*(1-smooth(.3,.45,g))*smooth(-1.2,-2.2,c.meanAt(x,z));}}}),
 snow:{autumn:[-150,250],winter:[-2000,-1900],spring:[-600,-300],summer:[1700,2400]},
 eye:30,
 spine:()=>[[-600,1000],[-400,-1100],[700,1300],[900,-500]],
 need:{zones:['runout','hummock','water'],keys:{'landform.megablock':4},larch:10,trees:20},
 views:V=>{const F=SITE_RO_AT('fresh',.72,0),Fr=SITE_RO_AT('fresh',.97,.1),O=SITE_RO_AT('old',.55,-.2),Lk=SITE_LAKE,M0=typeof PILLARS!=='undefined'&&PILLARS.length?PILLARS[0]:null;const o={
  'The fresh lobe\'s distal rim':V([Fr[0]+170,Fr[1]+30,4],[Fr[0]-60,Fr[1],12]),
  'Down the fresh lobe (hummocks and grooves)':V([F[0]-420,F[1]-60,6],[F[0]+200,F[1]+20,0]),
  'The old lobe\'s softened hummocks':V([O[0]-200,O[1]+140,3],[O[0]+150,O[1]-60,2]),
  'The fresh lobe beside the old':V([300,-1650,90],[-700,600,0]),
  'The lobes from above':V([1800,-1900,620],[-300,0,0]),
  'West to the scar and the airless crest':V([-1200,300,40],[-22000,200,1800])};
  if(Lk)o['The lake dammed behind the rim']=V([Lk.x+Lk.rx*1.5,Lk.z-Lk.rz*.9,5],[Lk.x,Lk.z,0]);
  if(M0)o['A megablock on the lobe']=V([M0.x+M0.R*3.2,M0.z+M0.R*2.2,3],[M0.x,M0.z,(M0.top-M0.y0)*.5]);
  return o;},
 checks:()=>[{name:'the two lobes drawn (lobe, rim, grooves, hummocks; one fresh, one old)',run:()=>SITE_PARTS_CHECK(SITE_PARTS())},
  {name:'the lake dammed behind the fresh lobe\'s flank, held by its rim',run:()=>SITE_LAKE_CHECK(SITE_LAKE_PROBE())},
  {name:'puya spikes on the dry bench',run:()=>SITE_PUYA_CHECK(window._biome&&window._biome.natives)},
  {name:'solifluction lobes on the frozen flanks (KFROST), none on the fresh rubble',run:()=>SITE_FROST_CHECK(SITE_FROST())}],
 negatives:()=>[{name:'no solifluction',run:()=>SITE_FROST_CHECK(Object.assign({},SITE_FROST(),{lobe:0}))},
  {name:'solifluction on the fresh rubble',run:()=>SITE_FROST_CHECK(Object.assign({},SITE_FROST(),{onFresh:5}))},
  {name:'no fresh lobe',run:()=>SITE_PARTS_CHECK(Object.assign({},SITE_PARTS(),{fresh:{}}))},
  {name:'the lake spilling over its rim',run:()=>SITE_LAKE_CHECK(Object.assign({},SITE_LAKE_PROBE(),{spill:9}))},
  {name:'no puya',run:()=>SITE_PUYA_CHECK({puya:0,bloom:0})}]
};
function siteSwell(x,z){return 3*(KRAND.fbm(x*.0014+1.3,z*.0014-7.7,0,3,5402)-.5)*2+.8*(KRAND.fbm(x*.01-4.4,z*.01+2.6,0,2,5406)-.5)*2;}
let SITE_RECS=null,SITE_LAKE=null;const SITE_SPRING=null,SITE_STREAM=null;
// THE RECORDS (45 calls siteBuild once the model's ground exists)
function siteBuild(ground){const O=SITE.old,Fr=SITE.fresh,Lk=SITE.lake;
 const old=KRELIEF.runout({a:O.a,b:O.b,w:O.w,h:O.h,fresh:false,blocks:{n:0},lobes:3,seed:SITE.seed+1});
 const fresh=KRELIEF.runout({a:Fr.a,b:Fr.b,w:Fr.w,h:Fr.h,fresh:true,blocks:{n:0},lobes:4,lake:{s:Lk.s,side:Lk.side,r:Lk.r,depth:Lk.depth},seed:SITE.seed+2});
 SITE_RECS={old,fresh};
 // the lake's level: the lowest point of its rim on the ground the lobes leave (where it spills), less half a metre
 const L=fresh.lake,g1=(x,z)=>{const a=ground(x,z),b=KRELIEF.shape(old,x,z,a);return KRELIEF.shape(fresh,x,z,b);};let lo=1e9;
 for(let k=0;k<32;k++){const a=k/32*Math.PI*2;lo=Math.min(lo,g1(L.x+Math.cos(a)*L.r*1.08,L.z+Math.sin(a)*L.r*1.08));}
 SITE_LAKE={x:L.x,z:L.z,rx:L.r,rz:L.r,ry:0,y:lo-.5,depth:Lk.depth};SITE_RECS.lake=SITE_LAKE;return SITE_RECS;}
// ---------------------------------------------------------------- one record a point: the height, each lobe's part, the rubble
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),g0=m+siteSwell(x,z);
 const g1=KRELIEF.shape(R.old,x,z,g0),a1=KRELIEF.at(R.old,x,z,g0),g2=KRELIEF.shape(R.fresh,x,z,g1),a2=KRELIEF.at(R.fresh,x,z,g1);
 // the lake's basin: a bowl under its level, its floor `depth` under the rim at the middle
 // and a low lip of rubble round it (to 1.45 radii), so nothing outside the rim lies under its level where the ground falls away
 let y=g2,lake=false;const Lk=SITE_LAKE;if(Lk){const d=Math.hypot(x-Lk.x,z-Lk.z)/Lk.rx;if(d<1.05){y=Math.min(y,Lk.y+1.2-(Lk.depth+1.2)*Math.pow(Math.max(0,1-d*d),.7));lake=d<1;}
  else if(d<1.45)y=Math.max(y,Lk.y+1.2*(1-smooth(1.1,1.45,d)));}
 const f=a2&&a2.part!=='lake',o=a1&&a1.part!=='lake';
 const P={g0,g2:y,y,rel:y-m,cut:0,part:f?a2.part:o?a1.part:lake?'lake':'bench',rec:f?'fresh':o?'old':null,order:-1,terrace:false,top:'bench',
  rubble:f?1:o?.55:0,runout:f?'fresh':o?'old':null};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
function siteFloor(){return 0;}
function siteGully(){return 0;}
function siteYuan(){return 0;}
function SITE_TRUNK_AT(){return [0,0];}
// the dammed lake (47 holds it as still water)
function sitePools(){return SITE_LAKE?[{id:'dammed',x:SITE_LAKE.x,z:SITE_LAKE.z,rx:SITE_LAKE.rx*1.02,rz:SITE_LAKE.rz*1.02,ry:0,y:SITE_LAKE.y,
 name:'A lake dammed behind the fresh lobe\'s flank (the rubble holds the melt)'}]:[];}
// THE MEGABLOCKS (47 draws them): buttes of the patchwork rock the avalanche carried whole, riding on the lobes (two-thirds on the fresh one),
// the foot under the lowest ground round each
function siteStacks(ctx){const T=SITE.megablocks,s=KRAND.stream(KRAND.hash(T.seed,1)),L=[];
 for(let t=0;t<3000&&L.length<T.n;t++){const which=s.next()<.65?'fresh':'old',R=SITE_RECS[which],sp=s.range(.25,.85),q=s.range(-.5,.5);
  const ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L,x=R.a[0]+ux*sp*R.L-uz*q*R.w,z=R.a[1]+uz*sp*R.L+ux*q*R.w;
  if(Math.max(Math.abs(x),Math.abs(z))>SITE.R*.92)continue;const P=sitePoint(x,z);if(P.rec!==which||P.part==='lake')continue;
  const r=s.range(14,38),H=s.range(12,34);if(L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r+40))continue;if(SITE_LAKE&&Math.hypot(x-SITE_LAKE.x,z-SITE_LAKE.z)<SITE_LAKE.rx+r+30)continue;
  const B=KSTACKS.make({id:'megablock'+L.length,kind:'butte',x,z,y0:ctx.footY(x,z,r),seed:T.seed+L.length,bed:[2.5,6],lobes:.24,weather:.35,
   tiers:[{h:H*.7,r,e:s.range(1,1.5),ry:s.range(0,TAU)},{h:H*.3,r:r*s.range(.55,.8),e:s.range(1,1.4),ry:s.range(0,TAU),dx:s.range(-.2,.2)*r,dz:s.range(-.2,.2)*r}]});
  B.name='A megablock ('+H.toFixed(0)+' m of the patchwork rock, carried whole on the '+(which==='fresh'?'fresh':'old')+' lobe)';B.key='landform.megablock';B.tex='rock.megabreccia';L.push(B);}
 return L;}
// ---------------------------------------------------------------- the views' points and the station's checks
// a point on a lobe at s (0 the breakaway's foot .. 1 the distal front) and q (across, of its half-width)
function SITE_RO_AT(which,s,q){const R=SITE_RECS[which],ux=(R.b[0]-R.a[0])/R.L,uz=(R.b[1]-R.a[1])/R.L;return [R.a[0]+ux*s*R.L-uz*q*R.w,R.a[1]+uz*s*R.L+ux*q*R.w];}
function SITE_PARTS(){const n={fresh:{},old:{}};for(let z=-SITE.R;z<=SITE.R;z+=16)for(let x=-SITE.R;x<=SITE.R;x+=16){const P=sitePoint(x,z);if(P.runout)n[P.runout][P.part]=(n[P.runout][P.part]||0)+1;}return n;}
function SITE_PARTS_CHECK(n){const need=['lobe','rim','groove','hummock'],lf=need.filter(p=>!(n.fresh[p]>0)),lo=['lobe','hummock'].filter(p=>!(n.old[p]>0));
 const d=w=>Object.keys(n[w]).map(p=>p+' '+n[w][p]).join(', ');
 return{ok:!lf.length&&!lo.length,detail:'fresh: '+d('fresh')+'; old: '+d('old')+(lf.length||lo.length?'; missing '+lf.concat(lo).join(', '):'')};}
// the lake: its water over its basin, none outside its rim
function SITE_LAKE_PROBE(){const L=SITE_LAKE;if(!L)return{n:0,inLake:0,spill:0};let inLake=0,spill=0,n=0;
 for(let a=0;a<64;a++)for(const k of [.2,.5,.8,1.25,1.5]){const x=L.x+Math.cos(a/64*TAU)*L.rx*k,z=L.z+Math.sin(a/64*TAU)*L.rz*k,w=waterH(x,z),g=terrainH(x,z);n++;
  if(k<1&&w>g)inLake++;if(k>1.2&&w>g)spill++;}return{n,inLake,spill};}
function SITE_LAKE_CHECK(P){return{ok:P.inLake>100&&P.spill===0,detail:P.n+' points round the lake: '+P.inLake+' under its water, '+P.spill+' outside its rim under water'};}
// the frost: the near grid's points on a solifluction lobe (its tread or its front), and any on the fresh lobe
function SITE_FROST(){const o={lobe:0,onFresh:0,n:0},S={};if(!FROST)return o;for(let z=-SITE.R;z<=SITE.R;z+=16)for(let x=-SITE.R;x<=SITE.R;x+=16){o.n++;
 FROST.sample(x,z,S);if(S.lobe>.3||S.front>.3){o.lobe++;if(sitePoint(x,z).runout==='fresh')o.onFresh++;}}return o;}
function SITE_FROST_CHECK(F){return{ok:F.lobe>=40&&F.onFresh===0,detail:F.lobe+' of '+F.n+' points on a solifluction lobe, '+F.onFresh+' on the fresh rubble'};}
function SITE_PUYA_CHECK(N){return{ok:!!N&&N.puya>=20&&N.bloom>=1,detail:N?N.puya+' puya rosettes, '+N.bloom+' in their century bloom':'no natives pass'};}
