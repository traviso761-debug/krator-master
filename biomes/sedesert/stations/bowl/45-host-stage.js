// ================================================================= HOST — stage (station 2: the Bowl, PLAN-BOWL.md)
// The ideal-type host for THE BOWL, the south-eastern desert's abyssal salt basin: renderer, the light, the shore and its
// layout as DATA, the ground (core/terrain: KBASIN's old lake for the strandlines and the yardangs' silt, KRELIEF.river for
// the delta's water), the fields the kit reads and BIO.init. The kit's species, builders and fauna carry over (50-75);
// 56 and 66 change them for the air, the heat and the salt.
//
// THE SITE: the south shore of the Bowl's great salt lake at the Bowl river 2's delta, scale model px 866,826 (the owner,
// 2026-10-26). The lake's surface is -990 m (1.83 atm); the river (78 m3/s) comes in from the south. Mantis's oasis lies 50 km
// west along the shore (87-host-far.js: a far glimpse). THE RINGS ARE COMPRESSED into the station (the owner, 2026-10-26: a
// showcase): on the model the ochre rim is 10 km wide, the salt flat 16-28 km, the halophyte belt and the yardang fields
// beyond it; here each is a few hundred metres to a kilometre, in the same order from the water.
//
// THE MAP (x east, z south; R 3000):
//   z < zS(x)            THE LAKE: banded shallows (ochre, pink, teal by salinity: 89w), ochre salt ridges standing out
//                        of them (the rim), deepening to teal beyond the station
//   0 .. 1300 m south    THE SALT FLAT: white polygonal crust, efflorescence, soda crust; damp hollows with glasswort;
//                        the old shorelines (KBASIN strandlines) as faint benches and beach ridges
//   the delta            the Bowl river 2 from the south edge to an apex ~1.4 km from the water, then five distributaries
//                        braided across the flat to the lake, each on its own levees: reeds, tamarisk, palms, mesquite
//   1100 .. 2400 m       THE HALO: saline sand and silt, the halophyte belt (saltbush, saxaul woods, tamarisk, brine lamps)
//   x < -600             THE KALUTS: the old lake bed raised in the west (30 m), cut by the wind into yardangs along it
//   the south-east       DUNES downwind of the flat (the wind from the north-north-west), the reg's gravel between
//   beyond               87-host-far.js: the lake to the horizon, the shore east and west, Mantis, the rim far off
// The station's layout and its hooks for 46-host-land.js (the channels' grid, the bake, the fields' cache and the binding, shared by
// the Bowl's stations): STATION (its tags, boxes, lattice and LOD), groundH (the ground before the channels), extraH (what stands on
// it after them: the kaluts), fieldsAt and FNAMES (the fields), SPINE (the LOD spine).
const STATION={key:'bowl',tags:'sedesert-bowl',seed:2,chanBox:[-1700,-1800,1900,3550],grid:{N:640,M:2,win:{x:[-1150,1400],z:[-1500,3300]}},
 lod:{hero:520,mid:1150,far:2600,floor:[340,820]},water:[-1700,-1800,1900,3550],sun:[-900,600,700],mantisFar:true,heat:1,rainCover:false,   /* the ground's 16 texture units (src/89x-host-air.js) */
 budget:{tris:21000000,calls:150}};   /* the owner's ceiling for the Bowl's stations, 2026-10-26 */
// ---------------------------------------------------------------- the layout (data)
const TERR={R:3000};
const LAKE={level:-990,name:'The Bowl lake (hypersaline; its surface 990 m under the sea)'};
const SITE={px:866,py:826};
// the prevailing wind, the way it blows (from the north-north-west): the yardangs run along it, the dunes cross it
const WIND=(()=>{const x=.34,z=.94,l=Math.hypot(x,z);return[x/l,z/l];})();
const W_AL=(x,z)=>x*WIND[0]+z*WIND[1],W_AC=(x,z)=>-x*WIND[1]+z*WIND[0];
// THE SHORE: z of the waterline at x; the delta has built its lobe out into the lake round the mouths
const DELTA={apex:[240,420],x:220,lobe:300,lobeW:950};
// beyond the station (87-host-far.js) the shore bends south toward Mantis's green pocket, 50 km west and 16 km south, and a
// little north to the east: zero inside 6 km, so the station's own shore is the formula above
function zS(x){const d=(x-DELTA.x)/DELTA.lobeW;return -950+110*Math.sin(x*.0009+.7)+45*Math.sin(x*.0031+2)-DELTA.lobe*Math.exp(-d*d)+14500*smooth(-6000,-52000,x)-2500*smooth(6000,50000,x);}
// u: metres south of the shore (negative in the lake)
const uOf=(x,z)=>z-zS(x);
// THE KALUTS' PLATEAU: the old lake bed raised in the west, 30 m over the flat
const platK=(x,z)=>smooth(-400,-2200,x+300*Math.sin(z*.0008))*smooth(150,1100,uOf(x,z));
// the delta's silt fan round the apex and the mouths (a low lobe)
const fanK=(x,z)=>{const dx=(x-DELTA.x)/1250,u=uOf(x,z);return Math.exp(-dx*dx)*smooth(-150,350,u)*smooth(2700,1300,u);};
// the dune field downwind of the flat (south-east)
const duneK=(x,z)=>smooth(400,1300,x)*smooth(1800,2600,uOf(x,z))*(1-platK(x,z));
// THE GROUND before the old lake's marks and the channels
function baseH(x,z){const u=uOf(x,z);
 if(u<0){const d=-u;let h=LAKE.level-.15-.55*smooth(0,900,d)-3.2*smooth(600,4200,d)-(fbm(x*.002,z*.002,1701,2)-.5)*.3*smooth(0,200,d);
  // THE OCHRE RIM: salt pressure ridges standing a hand's breadth out of the shallows, 80-900 m out
  const r=1-Math.abs(2*fbm(x*.0065+11,z*.0065-3,1702,2)-1);h+=.6*smooth(.962,.99,r)*smooth(-40,-160,u)*smooth(-1100,-600,u);   /* thin crests: the ridged term is near 1 wherever the noise is near its mean */
  return h;}
 const n1=fbm(x*.0008+3,z*.0008-1,1703,3)-.5,n2=fbm(x*.006,z*.006,1704,2)-.5,ld=smooth(0,300,u);
 let h=LAKE.level-.15+.6*smooth(0,90,u)+.0034*Math.min(u,1600)+.0105*Math.max(0,u-1600)+n1*1.3*ld+n2*.22*ld;
 // the damp hollows on the flat: shallow pans a few decimetres down (glasswort)
 h-=.35*smooth(.6,.74,fbm(x*.004-7,z*.004+5,1705,2))*smooth(80,300,u)*smooth(1600,1100,u);
 h+=32*platK(x,z)+1.4*fanK(x,z);
 const dk=duneK(x,z);if(dk>0){const a=W_AL(x,z),c=W_AC(x,z),L=140+30*Math.sin(c*.0021),s=a/L+.18*Math.sin(c*.0047+1.3)+.35*(fbm(x*.002,z*.002,1706,2)-.5),f=s-Math.floor(s);
  const H=(4+7*fbm(x*.003+2,z*.003,1707,2))*dk;h+=f<.8?H*f/.8:H*(1-f)/.2;}
 h+=(fbm(x*.003+5,z*.003,1708,2)-.5)*5*smooth(1800,2800,u)*(1-duneK(x,z));   // the reg's low swells
 return h;}

// THE OLD LAKE (core/terrain 40-core-basin, KBASIN): the Bowl's lake once stood at -930 m and fell slowly to today's -990,
// leaving its strandlines as benches and its silt, salt and the yardangs' ground by height. A dam lake (its own basin),
// drawn down 2 m a year at its full level, its sill 3 m under it; it covers the whole station.
const BASIN=KBASIN.create({seed:1709,age:9000,recession:7000,wind:WIND,strand:{top:7,bottom:1.6,jitter:.45,wmax:1.6,a:.7},yardang:{h:0},
 lakes:[{name:'The Bowl lake at its high stand',kind:'dam',level:-930,sill:-933,ring:2,remnant:LAKE.level,member:()=>1}]});
const _bs={};
// THE KALUTS: ridges along the wind on the plateau's old lake silt, blunt upwind and tapering downwind, one to a cell of a
// lattice along the wind (500 x 95 m), each drawn from its cell's hash (core/rand): where the silt is dry and fresh enough
// (KBASIN's yard field) and on the plateau
const YARD={seed:1710,along:520,across:95};
function yardRidge(i,j){const R=KRAND,h=(k)=>R.unit(R.hash(YARD.seed,i,j,k));if(h(0)<.28)return null;
 return{a:(i+.2+.6*h(1))*YARD.along,c:(j+.25+.5*h(2))*YARD.across,len:180+260*h(3),w:14+22*h(4),h:9+22*h(5)};}
function yardAt(x,z){const a=W_AL(x,z),c=W_AC(x,z),i0=Math.floor(a/YARD.along),j0=Math.floor(c/YARD.across);let h=0;
 for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++){const Y=yardRidge(i,j);if(!Y)continue;const da=a-Y.a,dc=c-Y.c;if(Math.abs(da)>Y.len||Math.abs(dc)>Y.w*1.7)continue;
  /* a flat-topped ridge with steep, fluted flanks (the wind's grooves along it), blunt upwind, tapering downwind */
  const fl=1+.18*Math.sin(dc*.45+da*.004)+.1*Math.sin(dc*1.3),t=da<0?smooth(-Y.len*.45,-Y.len*.15,da):smooth(Y.len,Y.len*.15,da),p=smooth(Y.w*1.2*fl,Y.w*.5,Math.abs(dc));h=Math.max(h,Y.h*p*Math.sqrt(t)*(.9+.1*Math.sin(da*.02)));}
 return h;}
const yardK=(x,z,h)=>{const pk=platK(x,z);if(pk<=.25)return 0;BASIN.sample(x,z,h,_bs);return _bs.yard*smooth(.25,.6,pk);};

// THE DELTA: the river from the station's south edge to the apex, then five distributaries across the flat to the lake.
// Polylines [[x,z],...] downstream; their water from KRELIEF.river (core/terrain 38: each vertex the lowest bed under the
// channel, the surface never climbing), held to the apex's level below it and to the lake's at the mouth.
const CHAN=(function(){const out=[],A=DELTA.apex;
 const line=(p0,p1,n,off)=>{const dx=p1[0]-p0[0],dz=p1[1]-p0[1],L=Math.hypot(dx,dz),px=-dz/L,pz=dx/L,P=[];
  for(let k=0;k<=n;k++){const t=k/n,o=off(t);P.push([p0[0]+dx*t+px*o,p0[1]+dz*t+pz*o]);}return P;};
 out.push({key:'main',name:'The Bowl river 2 (78 m3/s, from the south)',w:42,depth:1.6,pts:line([560,3260],A,160,t=>(70*Math.sin(t*Math.PI*3.2+.5)+22*Math.sin(t*Math.PI*9.4))*(1-.4*t)*smooth(1,.88,t))});   /* its meander held to 0 at its end: the line ends ON the apex (it stopped 50 m west of it, and the delta's water with it: 2026-10-27) */
 const ends=[-720,-300,160,560,980],amp=[-150,-70,10,70,150],   /* bowed outward, a fan: no two within 100 m past the apex */
  w=[14,20,28,18,12];
 ends.forEach((ex,i)=>{const e=[ex,zS(ex)-140];out.push({key:'d'+i,name:'A distributary of the delta',w:w[i],depth:.55+w[i]*.03,
  pts:line(A,e,110,t=>amp[i]*Math.sin(Math.PI*t)+(14*Math.sin(t*Math.PI*6+i*1.7)+6*Math.sin(t*Math.PI*15+i))*smooth(0,.08,t))});});   /* the wiggle from 0 at the apex: every distributary starts on it */
 return out;})();
// the channels' water: KRELIEF.river on the ground without them, then the apex's level and the lake's
(function(){const g=groundH;
 CHAN.forEach((C,ci)=>{const R=KRELIEF.river(C.pts,g,{depth:-.45,sample:8});   /* the water 0.45 m under the plain it crosses */C.y=R.map(p=>p.y);});
 const yA=CHAN[0].y[CHAN[0].y.length-1];
 CHAN.forEach((C,ci)=>{for(let k=0;k<C.y.length;k++){let y=C.y[k];if(ci)y=k?Math.min(y,yA):yA;   /* a distributary starts at the river's last level (the apex's confluence blends them: a step would show at its rim) */if(k)y=Math.min(y,C.y[k-1]);C.y[k]=Math.max(y,LAKE.level);}
  /* the mouth: down to the lake's level over its last 120 m */
  const n=C.pts.length;for(let k=n-1;k>=0;k--){const z=C.pts[k][1],u=uOf(C.pts[k][0],z);if(u>120)break;C.y[k]=Math.max(LAKE.level,Math.min(C.y[k],LAKE.level+Math.max(0,u)*.004));}});})();
// the ground before the channels: the base and the old lake's strandlines (KBASIN.land: monotone in height, so it makes no hollows)
function groundH(x,z){return BASIN.land(x,z,baseH(x,z));}
// what stands on the ground after the channels are cut: the kaluts
function extraH(x,z,h){const yk=yardK(x,z,h);return yk>0?yk*yardAt(x,z):0;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The kit's (BIOME-API.md: wet, flow, upland, canyon, rim, rock, dune, oasis, slope, abyss; its zones read them: the delta's
// channels are its 'canyon' floor and banks, the kaluts its rock) and the Bowl's own: lake (under the water), shore (the
// waterline's band), flat (the salt flat), salt (the crust), delta (the green fingers), halo (the halophyte belt), reg (the
// gravel and sand beyond), yard (the kaluts' ground), damp (the flat's hollows), fan (the delta's silt), ridge (the ochre
// rim's crust out in the shallows), strand (an old shoreline's bench)
function fieldsAt(x,z,h,slope){const u=uOf(x,z),C=CHG.at(x,z,_ch),pl=platK(x,z),dk=duneK(x,z),fk=fanK(x,z);
 BASIN.sample(x,z,h,_bs);
 const lake=h<LAKE.level-.02&&u<260?1:0,ridge=u<0&&h>=LAKE.level-.02?1:0;
 const near=smooth(3.2,1.05,C.u)*(C.id===255?0:1),chan=smooth(1.15,.9,C.u)*(C.id===255?0:1);
 const delta=Math.max(near,smooth(5,1.8,C.u)*.5)*(1-lake);
 const yd=clamp(yardK(x,z,h)*smooth(1.5,6,yardAt(x,z)),0,1);
 const flat=smooth(-20,40,u)*smooth(1500,1050,u)*(1-pl)*(1-lake);
 const halo=smooth(950,1500,u)*smooth(2700,2050,u)*(1-pl*.8)*(1-dk*.7)*(1-lake);
 const reg=clamp(Math.max(smooth(2050,2700,u),pl*.85,dk)*(1-lake),0,1);
 const damp=smooth(LAKE.level+1.5,LAKE.level+.6,h)*(1-lake)*smooth(-10,60,u)+smooth(.6,.74,fbm(x*.004-7,z*.004+5,1705,2))*flat*.8;
 const salt=clamp(Math.max(flat*(1-delta*.85),ridge,_bs.salt*.4*flat)*(1-reg*.6),0,1);
 const rock=clamp(Math.max(yd*smooth(.25,.6,slope),smooth(.55,.9,slope)*.8),0,1);
 const wet=clamp(Math.max(delta*.9,damp*.7,lake),0,1);
 return{wet:Math.max(.05,wet),flow:chan*(1-lake),upland:0,canyon:smooth(4,1.3,C.u)*(C.id===255?0:1)*(1-lake),rim:0,rock,dune:dk,oasis:0,slope,abyss:0,
  lake,shore:smooth(80,0,Math.abs(u))*(1-ridge),flat,salt,delta,halo,reg,yard:yd,damp:clamp(damp,0,1),fan:fk,ridge,strand:_bs.strand*(1-reg)*(1-lake),plat:pl};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','lake','shore','flat','salt','delta','halo','reg','yard','damp','fan','ridge','strand','plat'];
// the LOD spine: along the shore and up the delta, the apex, the kaluts and the halo
const SPINE=[];for(let x=-2600;x<=2600;x+=650)SPINE.push([x,zS(x)+120]);
CHAN[0].pts.filter((p,k)=>k%40===0).forEach(p=>SPINE.push([p[0],p[1]]));SPINE.push(DELTA.apex,[-1700,600],[-1500,1500],[900,1700],[-300,1800],[1500,2400]);
