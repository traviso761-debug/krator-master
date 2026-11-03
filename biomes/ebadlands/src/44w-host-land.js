// ================================================================= HOST — the land: the transect (the overview page)
// The stage's ground and its features, split from 45-host-stage.js in the final rebuild (2026-11-02) so that a STATION
// (stations/<name>/44w-host-land.js, PLAN-STATIONS.md) replaces this file and keeps everything else. THE CONTRACT, what
// 45-host-stage.js, 89w-host-water.js, 89z-host-build.js and 99-host-take.js read of a land:
//   TERR {R}                       the ground square's half side
//   terrainH(x,z), waterH(x,z)     the ground and the local water surface (-1e9: none)
//   fieldsAt(x,z,h,slope)          the kit's fields (BIOME-API.md) and the painter's: strata, crack, snow, pave (desert pavement),
//                                  polyg (mud polygons), talus (scree at a wall's foot), wash (a wadi's floor and bars)
//   VENTS {x,z,r} | null, POOLS [[x,z,r,depth]], POOLL [levels], poolD(x,z) -> [d in radii, i], TARN {x,z,r} | null, TARNL
//   RIVER_SPEC {pts:[[x,z,y]], width, speed} | null   (the river, a WATER.flow)
//   SPINE                          the LOD spine (BIO.init's origin)
//   STRATA                         the bedded rock (core/terrain KSTRATA through BIO.strata; ?strata=0 the legacy column)
//   ROCK                           KSTACKS bodies standing on the ground (domes, tors), drawn by 45
//   LAND {name, region, sky, fog, far(x,z), arcade, views(H), probes}   the page's words, views and test points
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 3400). One transect of the whole region compressed
// into 6.8 km, so every zone of the kit stands somewhere a camera can reach:
//   x < ESC(z)         THE BASIN, 150-230 m: painted badland mounds; in the north (z < -1200) the hot waste and,
//                      round VENTS (-2150,-2250), the sulphur flats and their pools; in the south the green badlands
//   x ~ ESC(z)         the ESCARPMENT, ~260 m of red cliff up to the plateau (it swings east in the north), TALUS at its foot
//   the plateau        470-540 m: sagebrush steppe and pinyon-juniper; THE CANYON cut 250 m into it (Zion); slickrock DOMES
//   z ~ zR(x)          THE RIVER, east to west: a V valley in the mountains, the canyon through the plateau,
//                      a braided wash across the basin; a dry WADI comes down to it across the hot basin from the north
//   x > 1300           THE RANGE rising to the outer rim: ponderosa and aspen, spruce-fir, the treeline (~1350 m),
//                      tundra and granite TORS, and the ice and bare rock of the crest past 1650 m, where nothing grows
//   (2620,-1180)       the TARN in its cirque, in the spruce-fir
// The fields are the host's own (this is a showcase): cold from height (and the north is hotter), wet from the
// south and the range's orographic rain, plus the river; geo round the vents; barren on the crest.
const TERR={R:3400};
const VENTS={x:-2150,z:-2250,r:760};
const POOLS=[[-2230,-2310,46,2.4],[-2090,-2190,30,1.8],[-2350,-2150,24,1.6],[-1990,-2380,36,2.0],[-2280,-2470,22,1.4],[-2130,-2050,18,1.2]];   // x, z, r, depth
const TARN={x:2620,z:-1180,r:150};
// the escarpment's line: it wanders, and swings east in the north, so the hot basin is wider there
function ESC(z){return -820+520*smooth(-900,-2700,z)+120*Math.sin(z*.0016+1)+45*Math.sin(z*.0051);}
// the river's centreline and its channel: half-width of the floor, the outer edge of the walls in floor half-widths
function zR(x){return 260*Math.sin(x*.0006+.9)+110*Math.sin(x*.0017-.4)+40*Math.sin(x*.0052)+180;}
const BEDK=[[-3800,112],[-3400,120],[-1000,196],[-700,205],[1300,300],[2300,520],[3400,980],[3800,1150]];
function bedY(x){for(let i=0;i<BEDK.length-1;i++){const a=BEDK[i],b=BEDK[i+1];if(x<=b[0]){const t=clamp((x-a[0])/(b[0]-a[0]),0,1);return lerp(a[1],b[1],t*t*(3-2*t)*.5+t*.5);}}return BEDK[BEDK.length-1][1];}
function onPlateau(x,z){return smooth(ESC(z)-60,ESC(z)+60,x)*smooth(1600,1100,x);}
function Wc(x,z){const p=onPlateau(x,z);return mix(70+20*Math.sin(x*.004),95+30*Math.sin(x*.0021+1),p)*(1+.6*smooth(1400,2600,x));}
function uOut(x,z){const p=onPlateau(x,z);return mix(mix(1.7,4.2,smooth(1300,2400,x)),1.28,p);}
function wallK(u,uo){if(u>=uo)return 0;const b=1+.5*(uo-1);return .58*smooth(uo,b,u)+.42*smooth(b+.12*(uo-1),1,u);}
function basinH(x,z){return 150+60*smooth(-3400,-1000,x)+18*(fbm(x*.0007+3,z*.0007-1,17,3)-.5);}
function plateauH(x,z){return 470+70*smooth(-700,1400,x)+14*(fbm(x*.0009-5,z*.0009+2,19,3)-.5);}
function rangeX(x,z){return x+190*Math.sin(z*.0012+.4)+70*Math.sin(z*.0037);}
function rangeH(x,z){const xm=rangeX(x,z),m=smooth(950,3500,xm);if(m<=0)return 0;
 const ridge=1-Math.abs(2*fbm(x*.0011+7,z*.0011-3,23,3)-1);
 return 1480*Math.pow(m,1.15)+smooth(1700,2700,xm)*(ridge-.55)*300+35*(fbm(x*.006,z*.006,29,2)-.5)*m;}
// the badland mounds: rounded ridges and rills in the basin, banded by the strata shader
function badK(x,z){return smooth(.44,.58,fbm(x*.00095+9,z*.00095+4,61,2))*smooth(ESC(z)-40,ESC(z)-260,x)*(1-smooth(500,180,Math.hypot(x-VENTS.x,z-VENTS.z)-VENTS.r*.6));}
function moundH(x,z){const n=fbm(x*.0056,z*.0056,62,3),r=1-Math.abs(2*n-1),n2=fbm(x*.013+4,z*.013-2,64,2);return 68*Math.pow(r,1.5)+14*Math.pow(1-Math.abs(2*n2-1),2)*r+3*Math.sin(x*.11+7*fbm(x*.01,z*.01,63,2))*smooth(.3,.8,r);}
function poolD(x,z){let best=1e9,pi=-1;for(let i=0;i<POOLS.length;i++){const P=POOLS[i],dx=x-P[0],dz=z-P[1],a=Math.atan2(dz,dx),d=Math.hypot(dx,dz)*(1+.14*Math.sin(3*a+i)+.07*Math.sin(5*a+2*i))/P[2];if(d<best){best=d;pi=i;}}return[best,pi];}
function tarnD(x,z){const dx=x-TARN.x,dz=z-TARN.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.1*Math.sin(3*a+1)+.06*Math.sin(5*a))/TARN.r;}
// THE BEDDED ROCK (core/terrain 35, KSTRATA; the final rebuild, BACKPORT.md ebadlands' row: "the strata showcase"; STRATA-PLAN.md section 7): two
// formations, the BADLAND recipe's thin clays and ash beds (pink, cream, gold, grey, maroon, mauve, green-grey, the rare teal; soft, never a bed on its
// own kind, the colour washing down the gentle slopes, the loose cover the clay's own popcorn) up to 330 m, the basin's mounds and the escarpment's foot,
// and the CANYON recipe's cross-bedded sandstones over it, the escarpment, the plateau's slickrock and Zion's walls. The painter reads the same beds
// (S.surface) as the shader draws, so the ground's colour and the rock's are one stratigraphy (the old page painted its own 7 m bands under a 120 m
// column: they did not line up). ?strata=0: the legacy column in the badland palette, as before
const STRATA=LQ.get('strata')==='0'?BIO.strata({seed:5813,columnM:120,
 palette:{sand:[0xc87868,0xe2d0b0,0xc8a050,0x9a8a8e,0xb06850,0xd8b0a0,0xcc8a62],shale:[0x7a3a3a,0x6a6670,0x8a4a48],bleach:[0xeee2c8,0xe8dcc0],
  mud:[0xa04a3a,0x8a3a34,0xb05a40],green:[0xb0a048,0x8a9a7a]}}):
 BIO.strata({formations:[{recipe:'badland',top:330},{recipe:'canyon'}],seed:5813,range:[0,1900],dip:[.6,-.8,.004],warp:[7,2],res:.25,dust:0xc4a084});
// THE LANDFORMS (core/terrain 38, KRELIEF; 37, KSTACKS; the final rebuild, BACKPORT.md ebadlands' row; ?landforms=0 the ground before): TALUS banked
// at the escarpment's foot (a fifth of its 260 m, reaching out 90 m), A WADI, a dry braided wash off the hot waste's north that runs south 3 km across
// the basin to the river's braided reach (cobble floor, bars between its channels, cut banks on the outsides of its bends, a pool or two after rain),
// slickrock DOMES on the plateau (Zion's checkerboard country, the canyon recipe's beds) and granite TORS on the tundra. Records first (KRAND-hashed by
// slot), composed on the land, read by the painter and the placement as fields (talus, wash), not only as height (the review's second line)
const LANDF=(function(){if(LQ.get('landforms')==='0'||typeof KRELIEF==='undefined')return null;
 const TAL=KRELIEF.talus({h:52,reach:90,rough:.6,scale:.02,seed:5401,footD:(x,z)=>ESC(z)-60-x});
 const a=[-1080,-2960],b=[-1300,zR(-1300)-120];
 const WADI=KRELIEF.wadi({pts:KRELIEF.meander(a,b,{amp:90,wave:520,seed:5411}),ground:(x,z)=>basinH(x,z),w:11,bank:2.4,bankW:5,braids:2.4,pools:.35,fan:false,seed:5412});
 return{talus:TAL,wadi:WADI,
  apply(x,z,h){const dE=ESC(z)-60-x;if(dE>-40&&dE<160){const t=TAL(x,z);if(t>0)h=Math.max(h,basinH(x,z)+t);}return KRELIEF.shape(WADI,x,z,h);},
  at:(x,z,h)=>KRELIEF.at(WADI,x,z,h),talusK:(x,z)=>{const dE=ESC(z)-60-x;return dE<-10||dE>110?0:smooth(-10,10,dE)*smooth(110,40,dE);}};})();
const WADI_BOX=LANDF?(()=>{const P=LANDF.wadi.pts,r=LANDF.wadi.reach+4;return[Math.min(...P.map(p=>p.x))-r,Math.min(...P.map(p=>p.z))-r,Math.max(...P.map(p=>p.x))+r,Math.max(...P.map(p=>p.z))+r];})():null;
function inWadiBox(x,z){return WADI_BOX&&x>WADI_BOX[0]&&x<WADI_BOX[2]&&z>WADI_BOX[1]&&z<WADI_BOX[3];}
// the land without the channel
function landH(x,z){const e=ESC(z),step=smooth(e-70,e+70,x);
 let h=mix(basinH(x,z),plateauH(x,z),step)+rangeH(x,z);
 // the escarpment's face: a band of steep red rock, benched
 h+=8*Math.sin(clamp((x-e+70)/140,0,1)*Math.PI*3)*smooth(0,.3,step)*smooth(1,.7,step);
 const bk=badK(x,z);if(bk>0){h+=bk*moundH(x,z);
  /* the beds' differential erosion (KSTRATA's ledge pass, the owner 2026-11-03): where the mound's flank is steep, hard beds stand proud and soft ones ease back */
  if(STRATA.ledge&&LQ.get('ledges')!=='0'){const e=3,sl=bk*Math.hypot(moundH(x+e,z)-moundH(x-e,z),moundH(x,z+e)-moundH(x,z-e))/(2*e);if(sl>.4)h=STRATA.ledge(x,z,h,sl,{k:.75,bench:1.4,anchor:14});}}
 if(LANDF)h=LANDF.apply(x,z,h);
 // the vents' flat: a shallow basin, crusted
 const dv=Math.hypot(x-VENTS.x,z-VENTS.z);if(dv<VENTS.r*1.3)h=mix(h,basinH(x,z)-18+3*(fbm(x*.01,z*.01,77,2)-.5),smooth(VENTS.r*1.25,VENTS.r*.7,dv));
 // the tarn's cirque: a bowl in the range
 const td=tarnD(x,z);if(td<4){const lev=TARN.base;h=mix(h,lev+Math.max(0,td-.85)*28+.0,smooth(3.6,1.6,td));if(td<1.05)h-=7*smooth(1.05,.3,td);}
 return h;}
TARN.base=(function(){const h0=TARN.x,z0=TARN.z;const e=ESC(z0);return mix(basinH(h0,z0),plateauH(h0,z0),smooth(e-70,e+70,h0))+rangeH(h0,z0)-25;})();
function floorC(x){return bedY(x);}
function WL(x){return floorC(x)-1.2;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){
 let h=landH(x,z);
 const dC=Math.abs(z-zR(x)),w=Wc(x,z),u=dC/w,uo=uOut(x,z),wall=wallK(u,uo);
 if(wall>0){const fl=floorC(x)+(fbm(x*.02,z*.02,88,2)-.5)*.8;h=mix(h,fl,wall)-2.6*smooth(16,5,dC)*smooth(.9,1,wall);}
 const pd=poolD(x,z);if(pd[0]<2.2){const P=POOLS[pd[1]];h-=P[3]*1.6*smooth(1.6,.5,pd[0]);}
 return h;}
// the canyon's wall as a field (1 the floor .. 0 beyond the walls)
function canyonAt(x,z){const dC=Math.abs(z-zR(x)),u=dC/Wc(x,z);return wallK(u,uOut(x,z));}
// the pools' and the tarn's levels
const POOLL=POOLS.map(P=>{let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(P[0]+Math.cos(a)*P[2]*1.15,P[1]+Math.sin(a)*P[2]*1.15));}return lo-.5;});
const TARNL=TARN.base+.8;
function waterH(x,z){const dC=Math.abs(z-zR(x));if(dC<Wc(x,z)*1.05)return WL(x);
 const pd=poolD(x,z);if(pd[0]<1.4)return POOLL[pd[1]];if(tarnD(x,z)<1.3)return TARNL;return -1e9;}
// the river (core/water's flow, 45): along zR(x) at WL(x), from the east end to the west (it descends that way), 24 m wide, every 20 m
const RIVER_SPEC={pts:(function(){const o=[];for(let x=TERR.R*1.1;x>=-TERR.R*1.1;x-=20)o.push([x,zR(x),WL(x)]);return o;})(),width:24,speed:1.2};
// ---------------------------------------------------------------- the climate fields (cached by 45; these are the definitions)
function fieldsAt(x,z,h,slope){const can=canyonAt(x,z),dC=Math.abs(z-zR(x)),wd=waterH(x,z);
 const pd=poolD(x,z)[0],td=tarnD(x,z),dv=Math.hypot(x-VENTS.x,z-VENTS.z);
 const geo=smooth(VENTS.r,VENTS.r*.55,dv*(1+.25*(fbm(x*.004,z*.004,131,2)-.5)))*smooth(.3,.5,fbm(x*.006+2,z*.006,132,2)+.25);
 const cold=clamp((h-140)/1480-.16*smooth(-600,-2800,z)+.05*(fbm(x*.002,z*.002,133,2)-.5),0,1);
 const near=Math.max(smooth(60,8,dC-Wc(x,z)*.2),smooth(2.2,1.05,td)*.9,smooth(2.4,1.1,pd)*.6);
 let wet=.08+.5*smooth(-1800,2400,z)+.22*smooth(500,1100,h)-.1*geo;
 wet=Math.max(wet,can*.92*(1-slope*.3),near*.95);
 const flow=Math.max(smooth(48,7,dC),smooth(2.1,1.05,td)*.8,smooth(2,1.05,pd)*.5)*(h-Math.max(wd,-1e8)<3.5?1:.4);
 const bad=badK(x,z),esc=smooth(.3,.62,slope)*smooth(ESC(z)+160,ESC(z)+20,x)*smooth(ESC(z)-200,ESC(z)-20,x);
 const barren=smooth(1620,1720,h);
 // the range is granite: its rock is crags in patches on its steepest ground, the forest takes the rest
 const crag=smooth(.56,.7,fbm(x*.005+5,z*.005-7,135,2)),hi=smooth(650,900,h),rock=clamp(Math.max(bad*.85,smooth(.32,.66,slope)*.92*(1-hi)+smooth(.9,1,slope)*crag*.9*hi,esc,barren*smooth(.6,.9,slope)),0,1);
 const plat=onPlateau(x,z),rim=can<.05&&dC<Wc(x,z)*uOut(x,z)*1.5?smooth(uOut(x,z)*.95,uOut(x,z)*1.05,dC/Wc(x,z))*plat:0;
 // the landforms as fields: the talus apron, the wadi's floor (its bars and channels: 'wash'), and where the hot waste's flat lies as desert pavement
 // (varnished stones packed on the reg) or as mud polygons (the playa's cracked clay): placement and the ground's layers read them
 const tal=LANDF?LANDF.talusK(x,z)*smooth(.15,.3,slope):0;
 let wash=0;if(inWadiBox(x,z)){const a=LANDF.at(x,z,h);wash=a&&(a.part==='floor'||a.part==='bar'||a.part==='pool')?1:a&&a.part==='bank'?.5:0;}
 const hot=smooth(.2,.02,cold),flat=smooth(.22,.08,slope),dry=smooth(.3,.12,wet);
 const pave=hot*flat*dry*(1-bad)*(1-geo)*smooth(.45,.6,fbm(x*.0021+3,z*.0021-6,136,2))*(1-wash);
 const polyg=hot*flat*smooth(.25,.1,wet)*(1-bad)*(1-geo)*smooth(.6,.45,fbm(x*.0021+3,z*.0021-6,136,2))*smooth(.5,.62,fbm(x*.0013-2,z*.0013+5,137,2))*(1-wash);
 return{wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland:clamp((h-400)/1300,0,1),canyon:can*smooth(12,40,landH(x,z)-floorC(x)),rim,
  rock:Math.max(rock,tal*.6),dune:0,oasis:0,slope,abyss:0,salt:0,cold,geo,barren,
  // the painter's own fields: how much strata shows, the mud cracks, the vents' crust, snow; the landforms'
  strata:Math.max(smooth(.15,.6,bad)*.9,smooth(.35,.7,slope)*(1-smooth(620,760,h))),
  crack:Math.max(smooth(.2,.7,geo)*.7,smooth(.4,.1,wet)*smooth(.25,.05,cold)*(1-bad)*.6*(1-polyg)),
  snow:Math.max(barren,smooth(.88,1,cold)*smooth(.7,.35,slope)*smooth(.45,.6,fbm(x*.004,z*.004,134,2))),
  pave,polyg,talus:tal,wash};}
// ---------------------------------------------------------------- the LOD spine: the transect's showplaces
const SPINE=[[VENTS.x,VENTS.z],[-2500,-900],[-2600,1500],[-1700,2600],[-1200,zR(-1200)]];
for(let x=-600;x<=2900;x+=700)SPINE.push([x,zR(x)]);
SPINE.push([300,-900],[600,1500],[1700,-300],[2050,900],[TARN.x,TARN.z],[2900,-200],[3150,700]);
// ---------------------------------------------------------------- the bodies (KSTACKS): slickrock domes on the plateau, granite tors in the tundra
// each from a KRAND-hashed slot on a coarse lattice, kept where its zone is, its foot on the ground; 45 draws them and keeps the flora off them
const ROCK=(function(){if(LQ.get('landforms')==='0'||typeof KSTACKS==='undefined')return[];const out=[];
 for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const h0=KRAND.hash(5501,i,j,0x31),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x32)),x=(i+u(1))*520,z=(j+u(2))*520;
  if(Math.abs(x)>TERR.R-300||Math.abs(z)>TERR.R-300)continue;const h=landH(x,z),dC=Math.abs(z-zR(x));if(dC<Wc(x,z)*uOut(x,z)*1.4+40)continue;
  const plat=onPlateau(x,z),cold=clamp((h-140)/1480,0,1);
  if(plat>.95&&x>ESC(z)+220&&u(3)<.55)out.push(KSTACKS.make({id:'dome'+out.length,kind:'dome',x,z,ground:landH,H:22+30*u(4),seed:h0,sink:.15,
    strata:STRATA.at&&STRATA.hardnessAt?(xx,yy,zz)=>{const a=STRATA.at(xx,yy,zz);return{h:null,hard:a.hard};}:null}));
  else if(cold>.78&&cold<.95&&u(3)<.7)out.push(KSTACKS.make({id:'tor'+out.length,kind:'tor',x,z,ground:landH,H:4+6*u(4),seed:h0}));}
 out.forEach(B=>{B.name=B.kind==='dome'?'A slickrock dome (Navajo sandstone, cross-bedded)':'A granite tor';});return out;})();
// ---------------------------------------------------------------- the page's words, views and test points
const LAND={name:'The eastern badlands (ideal type)',region:{name:'The eastern badlands (ideal type)',x:0,z:0,r:TERR.R,h:2200},arcade:true,
 build:()=>({chips:badlandChips({seed:5901})}),   /* the beds' chips on the painted badlands and the escarpment (44v) */
 // the shared sky's site (the polygon's middle on the old canvas: on scale model 5.1 that pixel lies in the abyss's rim at -1,648 m, but the sky reads
 // only latitude and the giant's bearing from it, which barely move; PLAN-STATIONS.md has the stations' own sites)
 sky:{px:1043,py:508},
 // HEIGHT FOG (89a): the dust haze thick at the ground, thinning with height, the range's crest out of it
 fog:{falloff:1/900,sun:.35,sky:.25},
 // the weather's climate (89a: dry, its haze the colour of dust; cold, so the crest's snow builds in a snowfall) and the snow line the lying snow keeps to
 climate:{dry:true,cold:true},snowLine:[1450,1650],
 // the far country (83): the abyss falling away west past the basin, the range rising east to the outer rim
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dx=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g+dx*.32*(1+.3*(fbm(x*.0007,z*.0007,411,3)-.5))-dw*.55*smooth(0,3000,dw)+120*(fbm(x*.0009,z*.0009,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 views:H=>{const {P,look,atTree,nearTree,gh}=H,CX=-200,rimN=(x,k)=>zR(x)-Wc(x,0)*(k==null?1.5:k),POOL0=POOLS[0];
  return{
 'Zion, the river in the canyon':look(150,zR(150)+30,3,-350,zR(-350),12),
 'From afar':look(-3300,3300,700,600,0,200),
 // from just outside the north wall's top, looking across and down to the floor on the far side
 'The canyon from the rim':[CX,gh(CX,rimN(CX,1.4),28),rimN(CX,1.4),CX-260,floorC(CX-260)+4,zR(CX-260)+Wc(CX-260,0)*.45],
 'Sulphur flats':[POOL0[0]-150,POOLL[0]+16,POOL0[1]+120,POOL0[0],POOLL[0]+1,POOL0[1]],
 // the Throne's brimstone reeds on the shore of the largest pool, the camera on its bank looking along the shore
 'Brimstone reeds at a sulphur pool':(function(){const P=POOL0,a=2.6,c=[P[0]+Math.cos(a)*P[2]*1.32,P[1]+Math.sin(a)*P[2]*1.32],t=[P[0]+Math.cos(a+.55)*P[2]*1.08,P[1]+Math.sin(a+.55)*P[2]*1.08];return[c[0],Math.max(gh(c[0],c[1],3),POOLL[0]+4),c[1],t[0],POOLL[0]+1.2,t[1]];})(),
 'Stilt pods at the vents':atTree(nearTree('stiltpod',VENTS.x,VENTS.z),26,.8,2),
 'Ember crowns and sunspires':atTree(nearTree('embercrown',P.waste[0],P.waste[1]),38,2.4,3),
 'Needle bloom stand':atTree(nearTree('needlebloom',P.waste[0],P.waste[1]),14,1.2,2),
 'Needle bloom close-up':(function(){const T=nearTree('needlebloom',P.waste[0],P.waste[1],6);return[T.x+Math.cos(1.2)*4.5,T.y0+T.H*.85,T.z+Math.sin(1.2)*4.5,T.x,T.y0+T.H*.85,T.z];})(),
 'Painted badlands':look(P.bad[0]-260,P.bad[1]+180,40,P.bad[0]+60,P.bad[1]-60,10),
 'Green badlands':look(P.green[0]-220,P.green[1]-160,30,P.green[0]+60,P.green[1]+40,6),
 'Sagebrush and pinyon-juniper':atTree(nearTree('juniper',P.steppe[0],P.steppe[1]),22,2.0,2.5),
 'Rose weepers and giant umbels':atTree(nearTree('weeper',P.vale[0],P.vale[1]),30,1.4,2.5),
 'Cottonwoods on the floodplain':atTree(nearTree('cottonwood',-1600,zR(-1600)),45,1.8,3),
 'Ponderosa and aspen':atTree(nearTree('ponderosa',P.pine[0],P.pine[1],20),48,3.2,3),
 'Aspen grove':atTree(nearTree('aspen',P.pine[0],P.pine[1]),22,.4,2),
 'Spruce close-up':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,16,a,3);})(),
 'Spruce-fir forest':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,75,a,12);})(),
 'The tarn':[TARN.x-TARN.r*1.15,Math.max(TARNL+5,gh(TARN.x-TARN.r*1.15,TARN.z+TARN.r*.75,3)),TARN.z+TARN.r*.75,TARN.x+TARN.r*.6,TARNL+30,TARN.z-TARN.r*.5],
 'The treeline, krummholz and bristlecones':atTree(nearTree('bristlecone',P.tundra[0],P.tundra[1]),22,3.4,2),
 'The hanging garden':(function(){const A=ARCADE,p=A.W(-6,-A.dep/2-16),t=A.W(1,0);return[p[0],A.y0+4.5,p[1],t[0],A.y0+6.5,t[1]];})(),
 'Hanging garden close-up':(function(){const A=ARCADE,p=A.W(-3,-A.dep/2-5),t=A.W(2,-A.dep/2-1);return[p[0],A.y0+3.2,p[1],t[0],A.y0+5.5,t[1]];})(),
 'Fruit: pinyon, juniper, prickly pear':atTree(nearTree('pinyon',P.steppe[0],P.steppe[1]),9,2.2,1.6),
 'The ice and the airless rim':look(2450,1100,320,3300,-400,0),
 // the final rebuild's landforms: the wadi's braided floor, the talus under the escarpment, a dome on the plateau
 ...(LANDF?{'The dry wash (a wadi)':(function(){const p=LANDF.wadi.pts,a=p[Math.floor(p.length*.45)],b=p[Math.floor(p.length*.6)];return[a.x+40,gh(a.x+40,a.z,14),a.z,b.x,gh(b.x,b.z,1),b.z];})(),
  'Talus under the escarpment':(function(){const z=-300,x=ESC(z)-150;return[x,gh(x,z,8),z,ESC(z)+40,gh(ESC(z)+40,z,-20),z+60];})()}:{}),
 ...(ROCK.some(B=>B.kind==='dome')?{'Slickrock domes on the plateau':(function(){const B=ROCK.find(B=>B.kind==='dome');return[B.x-B.R*3,gh(B.x-B.R*3,B.z+B.R,6),B.z+B.R,B.x,B.y0+(B.top-B.y0)*.5,B.z];})()}:{})};},
 // test points for the negatives: the steepest bedded face of the canyon's north wall at x=200 (found, not typed), the river's bed, the iciest crest point
 probes:{wall(){let bz=zR(200),bs=-1;for(let z=zR(200)-260;z<zR(200);z+=2){const s=FIELD.slope(200,z)*FIELD.strata(200,z);if(s>bs){bs=s;bz=z;}}return[200,bz];},
  bed(){const x=200;return[x,floorC(x)-2.8,zR(x)];},
  ice(){let ix=3000,iz=0,ib=-1;for(let z=-3000;z<=3000;z+=100)for(let x=2400;x<=3400;x+=50){const v=FIELD.barren(x,z);if(v>ib){ib=v;ix=x;iz=z;}}return[ix,iz];}}};
