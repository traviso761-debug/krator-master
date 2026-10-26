// ================================================================= HOST — stage (station 3: the steppe fringe, PLAN-STEPPE.md)
// The half of the sedesert polygon that is desert-steppe (BSh, ~330 mm, ~670 m, ~1.5 atm). It inherits the Bowl's and Mantis's
// station code (station.json "base": "mantis") and writes its own layout, rock, flora, floor, build and views.
// THE SITE is provisional (the owner, 2026-10-26): the steppe has not been placed on the scale model yet; the sky stands at px
// ~800,690, north of the Bowl toward Arcbeam's rim, to be checked when the model is surveyed.
//
// THE MAP (x east, z south; R 3000). No lake (STATION.noLake): the shore functions keep the Bowl's contract and stand far off.
//   the plain        low rolling ground under bunchgrass, the steppe's trees scattered, the alien plants in drifts
//   THE KOPJES       four granite domes with tors (47-host-rock.js, core/terrain KSTACKS) on their tops, honeycomb (tafoni)
//                    in their faces, gnamma pools in their hollows
//   THE PAN          a shallow seasonal pan, cracked clay, a sheet of rain water in it, living stones on its gravel margin
//   THE WADI         a dry sandy wadi across the map (a channel with no water: STATION.dryChannels), its trees along it
//   THE PAVEMENT     the west: desert pavement, dark varnished pebbles; the old twoleafs (Welwitschia)
//   THE EDGE         the north-west: the kit's red desert, a mesa and hoodoos thinning out
//   FAIRY CIRCLES    three fields of bare discs in the grass, in a near-hexagonal lattice (the floor pass and 59 draw them)
// ---------------------------------------------------------------- the layout (data)
var SEDESERT_WATER={hue:.4};
const TERR={R:3000};
const LAKE={level:0,name:'(no lake on the steppe)'};
const SITE={px:800,py:690};
const WIND=(()=>{const x=.42,z=.9,l=Math.hypot(x,z);return[x/l,z/l];})();
function zS(x){return -1e6;}
const uOf=(x,z)=>z+1e6;
const H0=670;
const KOPJES=[{x:-650,z:-250,r:270,h:44},{x:1350,z:1250,r:210,h:31},{x:-1750,z:1450,r:190,h:27},{x:1750,z:-1450,r:240,h:37}].map((K,i)=>Object.assign(K,{i,name:'A kopje (a granite dome, its tors and honeycomb faces)'}));
const PAN={x:700,z:-900,r:430,depth:2.6,name:'The pan (a seasonal pan: cracked clay, rain water after the wet season)'};
const EDGE={x:-2500,z:-2350,name:'The desert edge (the kit\'s red desert, a mesa and hoodoos)'};
const FAIRY=[{x:-600,z:1000,r:430},{x:1500,z:450,r:380},{x:250,z:-1950,r:360}].map((F,i)=>Object.assign(F,{i,name:'Fairy circles (bare discs in a lattice through the grass)'}));
// a kopje's dome over the plain: steep sides, a rounded crown, its outline lobed; 0 off it
function domeAt(K,x,z){const dx=x-K.x,dz=z-K.z,d=Math.hypot(dx,dz),a=Math.atan2(dz,dx),R=K.r*(1+.14*Math.sin(3*a+K.i)+.08*Math.sin(7*a+2*K.i)+.05*(fbm(x*.01,z*.01,4501+K.i,2)-.5));
 if(d>R)return 0;const u=d/R;return K.h*Math.pow(1-u*u,.85)+3*(fbm(x*.03,z*.03,4511,2)-.5)*(1-u);}
const kopjeAt=(x,z)=>{let h=0,k=0;for(const K of KOPJES){const v=domeAt(K,x,z);if(v>h){h=v;k=K.i;}}return{h,k};};
const panK=(x,z)=>{const d=Math.hypot(x-PAN.x,(z-PAN.z)*1.25)*(1+.08*Math.sin(Math.atan2(z-PAN.z,x-PAN.x)*3));return smooth(PAN.r*1.15,PAN.r*.65,d);};
const paveK=(x,z)=>smooth(-1100,-2300,x+250*Math.sin(z*.0011))*(1-edgeK(x,z));
const edgeK=(x,z)=>smooth(-3000,-4300,x+z+200*Math.sin(x*.002));
function baseH(x,z){let h=H0+9*(fbm(x*.0005+3,z*.0005-1,4521,3)-.5)+3.2*(fbm(x*.0021,z*.0021,4522,2)-.5)+.4*(fbm(x*.02,z*.02,4523,2)-.5);
 h+=kopjeAt(x,z).h;
 const pk=panK(x,z);h-=PAN.depth*pk+.3*(fbm(x*.01,z*.01,4524,2)-.5)*(1-pk);
 h+=14*edgeK(x,z)*(.5+.5*fbm(x*.001,z*.001,4525,2));
 return h;}
function groundH(x,z){return baseH(x,z);}
function extraH(x,z,h){return 0;}
// the pan's rain water: a sheet a few hand-breadths deep over its floor
const PAN_POOL={x:PAN.x,z:PAN.z,r:PAN.r*.42,name:'The pan\'s rain water (it lasts a few weeks after the wet season)'};
PAN_POOL.level=baseH(PAN.x,PAN.z)+.45;
// THE WADI: a dry channel across the map from the north-west to the south-east, 24 m wide, its bed 1.5 m under the plain
const CHAN=(function(){const pts=[];for(let k=0;k<=240;k++){const t=k/240,x=-3250+6500*t,z=-1100+2900*t+180*Math.sin(t*Math.PI*4.2+.4)+70*Math.sin(t*Math.PI*11);pts.push([x,z]);}
 return[{key:'wadi',name:'The wadi (a dry sandy bed; it runs a day or two a year)',w:24,depth:1.5,pts}];})();
(function(){CHAN.forEach(C=>{const R=KRELIEF.river(C.pts,groundH,{depth:-.2,sample:10});C.y=R.map(p=>p.y);});})();
// THE FAIRY CIRCLES: a near-hexagonal lattice in each field, each disc's radius and jitter from its cell's hash (core/rand)
const FC_SPACE=15;
function fairyAt(x,z){let best=null;for(const F of FAIRY){const dF=Math.hypot(x-F.x,z-F.z);if(dF>F.r*1.1)continue;
  const q=(x-F.x)/FC_SPACE,r=(z-F.z)/(FC_SPACE*.866),j0=Math.round(r);
  for(let j=j0-1;j<=j0+1;j++){const off=(j&1)*.5;for(let i=Math.round(q-off)-1;i<=Math.round(q-off)+1;i++){const R=KRAND,h=k=>R.unit(R.hash(4530+F.i,i,j,k));
    const cx=F.x+(i+off+(h(0)-.5)*.35)*FC_SPACE,cz=F.z+(j+(h(1)-.5)*.35)*FC_SPACE*.866,rad=(2+3.2*h(2))*smooth(F.r*1.05,F.r*.55,Math.hypot(cx-F.x,cz-F.z));
    if(rad<1.2)continue;const d=Math.hypot(x-cx,z-cz);if(d<rad*1.45&&(!best||d/rad<best.u))best={x:cx,z:cz,r:rad,u:d/rad};}}}
 return best;}
// every disc of the fields, from the same lattice and hashes as fairyAt
function fairyDiscs(){const out=[];for(const F of FAIRY){const n=Math.ceil(F.r*1.1/FC_SPACE)+1;for(let j=-n*1.2|0;j<=n*1.2;j++){const off=(j&1)*.5;for(let i=-n-1;i<=n+1;i++){const R=KRAND,h=k=>R.unit(R.hash(4530+F.i,i,j,k));
  const cx=F.x+(i+off+(h(0)-.5)*.35)*FC_SPACE,cz=F.z+(j+(h(1)-.5)*.35)*FC_SPACE*.866,rad=(2+3.2*h(2))*smooth(F.r*1.05,F.r*.55,Math.hypot(cx-F.x,cz-F.z));if(rad>=1.2)out.push({x:cx,z:cz,r:rad});}}}
 return out;}
const STATION={key:'steppe',tags:'sedesert-steppe',seed:4,chanBox:[-3300,-3300,3300,3300],grid:{N:640,M:1,win:{x:[0,0],z:[0,0]}},
 lod:{hero:560,mid:1250,far:2700,floor:[360,860]},water:[-3300,-3300,3300,3300],sun:[-900,600,700],mantisFar:false,heat:.8,hour:16.8,
 air:{pressure:1.5,humidity:.3,turbidity:1.1,dustK:.45},clouds:{cover:.25,cumulus:.7},
 noLake:true,dryChannels:true,habitKey:'STEPPE',strata:false,layerPack:'steppe',chanReach:130,
 groundLayers:['yard','playa','popcorn'],   /* the kopjes' granite, the pan's clay; with the grass and the pavement: 5 layers */
 paint:{GRASS:0xb0a068,GRASS2:0x8e8a58,LITTER:0x948472,BARE:0xb89070,GRANITE:0xb4a89e,GRAV:0x9a7a62,GRAV2:0x8a6a54,SAND:0xb89a7a,SAND2:0xa88a6a},
 pools:[{x:PAN_POOL.x,z:PAN_POOL.z,r:PAN_POOL.r,level:PAN_POOL.level,name:PAN_POOL.name}],
 pool:(x,z)=>Math.hypot(x-PAN_POOL.x,z-PAN_POOL.z)<PAN_POOL.r*1.25?PAN_POOL.level:-1e9,
 halo:{bunch:3000,stipa:300,twoleaf:15,whistle:100,lantern:60},   /* items counted (the rock figs and pebble plants are kit parts: 99 counts them) */
 budget:{tris:21000000,calls:170},cls:{pass:11000000,host:900000}};
// ---------------------------------------------------------------- the fields (cached in 46; these are the definitions)
// The kit's, the Bowl's (the halophyte floor reads them: the pan's margin is its damp ground) and the steppe's own: lush (the
// grass: the ground's grass slot), forest (here the pavement: the ground's second slot), granite (the kopjes' bare rock), bare
// (the pan's floor and the wadi's sand), kopje, pan, wadi, pave, edge, circles (a fairy field)
function fieldsAt(x,z,h,slope){const C=CHG.at(x,z,_ch),kj=kopjeAt(x,z),pk=panK(x,z),pv=paveK(x,z),eg=edgeK(x,z);
 const wadi=C.id===255?0:smooth(1.3,.85,C.u),bank=C.id===255?0:smooth(5.5,1.2,C.u)*(1-wadi);
 const kop=smooth(.5,4,kj.h),granite=clamp(kop*smooth(.08,.35,slope)+smooth(14,22,kj.h),0,1);
 let circ=0;for(const F of FAIRY)circ=Math.max(circ,smooth(F.r*1.05,F.r*.6,Math.hypot(x-F.x,z-F.z)));
 const bare=clamp(Math.max(pk*smooth(.35,.8,pk),wadi*.9),0,1);
 const lush=clamp((1-pv*.85)*(1-eg)*(1-granite)*(1-bare)*(1-pk*.6),0,1);
 const damp=smooth(.25,.6,pk)*smooth(.95,.7,pk);
 const wet=clamp(.16+.5*pk+.3*bank+.2*kop*smooth(.2,.05,slope),0,1);
 return{wet,flow:0,upland:0,canyon:wadi,rim:0,rock:clamp(Math.max(granite*.8,smooth(.55,.9,slope)*.7),0,1),dune:0,oasis:0,slope,abyss:0,
  lake:0,shore:0,flat:0,salt:pk*.35,delta:0,halo:0,reg:clamp(Math.max(pv*.7,eg),0,1),yard:0,damp,fan:0,ridge:0,strand:0,plat:0,
  lush,forest:pv*(1-eg),granite,bare,kopje:kop,pan:pk,wadi:Math.max(wadi,bank*.6),pave:pv,edge:eg,circles:circ};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','lake','shore','flat','salt','delta','halo','reg','yard','damp','fan','ridge','strand','plat',
 'lush','forest','granite','bare','kopje','pan','wadi','pave','edge','circles'];
// the LOD spine: a lattice over the plain, the kopjes, the pan, the fairy fields, the wadi
const SPINE=[];for(let z=-2400;z<=2400;z+=1200)for(let x=-2400;x<=2400;x+=1200)SPINE.push([x,z]);
KOPJES.forEach(K=>SPINE.push([K.x,K.z]));SPINE.push([PAN.x,PAN.z]);FAIRY.forEach(F=>SPINE.push([F.x,F.z]));CHAN[0].pts.filter((p,k)=>k%30===0).forEach(p=>SPINE.push([p[0],p[1]]));
