// ================================================================= HOST — STATION 1, Ledge and the great lake (the W rift highland, the veiled rim)
// Scale model 5.1 (PLAN.md, "On scale model 5.1"): Ledge at px 437,1330 (world 874,2660 km), the cliff top at 1,563 m where Dalab's road
// comes down out of the tunnels; the great lake at 297 m below it (2,336 km², 556 m at its deepest on the model, 573 by 4.22's survey),
// its shore Csa, ~1,050 mm, +16.6 degC; Nulab on the south shore (443,1359); the outlet, Chimes Riba, leaving south-east for the gorge.
// The page compresses the site into 6 km (x east, z south; north is -z):
//   north    THE HIGHLAND over the cliff: Ledge's cliff top (~1,560 m, warm: the basin's air rises up the face), rising north and west into
//            the CLOUD BELT on the walls (1.9-3.4 km): mist frills, lobe larches, veil thread, mist cups and moor sponge in the fog
//   the cliff  THE NORTH CLIFF, ~1,260 m of rift fill (KSTRATA's `rift` recipe), cut into benches below Ledge's site (the Ancients'
//            terraces: the arcology's own build is a settlement's, PLAN.md section 12, answer 4)
//   south-west THE GREAT LAKE under the cliff: deep blue under the face, green-blue over the plain's shallows
//   east     THE BASIN PLAIN (300-600 m): Dalab's fields, cork-oak groves, bay-laurel hedges, veil willows on the shore, fan trees; the
//            outlet river leaving south-east toward the gorge (station 4); the walls rising again past the east edge
const STATION=(function(){const R=3000,LAKE=297;
 const cliffZ=x=>-650+120*Math.sin(x*.0009+.4)+55*Math.sin(x*.0031);          /* the cliff's edge (its top) */
 const footZ=x=>cliffZ(x)+300+40*Math.sin(x*.002+1.3);                        /* the cliff's foot, at the lake or the plain */
 const shoreX=z=>650+420*Math.sin(z*.00075+.6)+120*Math.sin(z*.0023);          /* the lake's east shore: the plain east of it */
 const riv=[];for(let t=0;t<=1.0001;t+=1/60){const z=mix(500,3350,t),x=mix(shoreX(500)-40,3300,Math.pow(t,1.1))+160*Math.sin(t*5.1);riv.push([x,z,LAKE-4.5*t]);}
 const RP=riv.map(p=>[p[0],p[1]]);
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const highland=(x,z)=>{const d=Math.max(0,cliffZ(x)-z);return 1562+d*.72*(1-.25*smooth(0,2400,d))+smooth(-1500,-3200,x)*(900+300*ridge(x,z,.0011,31))+90*(ridge(x,z,.0016,32)-.5)*smooth(0,400,d)+14*(fbm(x*.01,z*.01,33,2)-.5);};
 const plain=(x,z)=>LAKE+3+Math.max(0,x-shoreX(z))*.035+smooth(1800,3300,x)*smooth(-600,1800,-z+400)*180+smooth(2200,3200,z)*90+4*(fbm(x*.006,z*.006,34,2)-.5);
 // the benches below Ledge's site: the face cut into steps, every ~110 m of height a 14 m bench, within 650 m of x=0
 const bench=(h,x)=>{const k=smooth(700,350,Math.abs(x));if(k<=0)return h;const s=110,q=Math.floor(h/s)*s,f=(h-q)/s;return mix(h,q+s*smooth(.18,.32,f),k*.85);};
 function ground(x,z){const cz=cliffZ(x),fz=footZ(x);
  const top=highland(x,Math.min(z,cz)),inLake=x<shoreX(z);
  const sx=shoreX(z),dIn=sx-x,lakeBed=LAKE-Math.min(140,8+dIn*.11)-60*smooth(fz+40,fz+400,z)*smooth(0,200,dIn),bed=inLake?lakeBed:plain(x,z);
  let h;if(z<=cz)h=top;else if(z>=fz)h=bed;else{const u=(z-cz)/(fz-cz),f=1-Math.pow(1-u,1.7);h=mix(top,bed+(inLake?0:6),f)+18*(fbm(x*.02,z*.02,35,2)-.5)*Math.sin(u*Math.PI);h=bench(h,x);}
  // the shore: a beach of a few metres where the plain meets the lake, the plain's foot at the water
  if(!inLake&&z>fz){h=mix(LAKE-2,h,smooth(0,70,x-sx));}else if(inLake&&z>fz)h=Math.min(h,mix(LAKE+1,lakeBed,smooth(0,60,dIn)));
  // the outlet river's channel across the plain (Chimes Riba, ~90 m wide here)
  if(z>300){const n=nearLine(RP,x,z);if(n.d<110){const wl=mix(riv[n.i][2],riv[Math.min(riv.length-1,n.i+1)][2],n.u);h=mix(h,wl-3.2,smooth(110,35,n.d));}}
  return h;}
 const lakePoly=[[-3400,-1200],[shoreX(-900)+60,-1200]].concat(Array.from({length:30},(_,k)=>{const z=-900+k*150;return[shoreX(z)+60,z];}),[[-3400,3600]]);
 const L=rimLand({R,ground,
  lakes:[{name:'The great lake',kind:'deep',level:LAKE,poly:lakePoly,colour:0x1e4a66}],
  river:{pts:riv,width:90,name:'Chimes Riba (the outlet)',speed:.7},
  tm:(x,z,h)=>h<1600?16.6-2.0*(h-300)/1000:14-6.5*(h-1600)/1000,
  wet:(x,z,h)=>.45+.2*smooth(1500,2600,h)+.08*fbm(x*.0016,z*.0016,139,2),
  fog:(x,z,h)=>smooth(1750,2150,h)*smooth(3600,3150,h)*(.75+.35*fbm(x*.0012,z*.0012,141,2)),
  farm:(x,z)=>{const g=plain(x,z),k=smooth(80,240,x-shoreX(z))*smooth(.55,.6,fbm(x*.0025,z*.0025,143,2))*smooth(600,420,g);
   const n=nearLine(RP,x,z);return k*smooth(130,190,n.d)*smooth(fz0(x)+120,fz0(x)+260,z);},
  rockAt:(x,z,h,sl)=>smooth(.55,.85,sl),
  strataK:(x,z,h,sl)=>smooth(.5,.8,sl),
  snowAt:(x,z,h,sl)=>smooth(3300,3500,h)*smooth(.7,.35,sl),
  strata:BIO.strata({recipe:'rift',seed:6801,range:[-200,4200],res:.5,private:true}),
  spine:[[0,cliffZ(0)-120],[0,footZ(0)+200],[-1200,footZ(-1200)+500],[shoreX(400)+300,400],[1600,900],[2200,1800],[riv[30][0],riv[30][1]],
   [-2400,-1400],[-1200,-1900],[300,-2200],[1400,-1500],[-2600,600],[-1800,-700]]});
 function fz0(x){return footZ(x);}
 Object.assign(L,{cliffZ,footZ,shoreX,LAKE,riv,highland,plain});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}

const LAND={name:'Ledge and the great lake (riftrim station 1)',title:'Krator biome — the rift rim: Ledge and the great lake',
 hint:'Station 1 of the rift rim, the veiled rim (the W rift highland): Ledge\'s cliff over the great lake at 297 m, the basin plain with Dalab\'s fields and planted lowland stands, the outlet leaving for the gorge, the cloud belt on the walls (scale model 5.1, px 437,1330)',
 region:{name:'Ledge and the great lake (station 1)',x:0,z:0,r:TERR.R},rim:'w',wind:[1,.2],arcade:false,fruitMin:0,
 species:['mistfrill','lobelarch'],sky:{px:165,py:1000},atm:1.32,cloud:.45,dust:false,   /* the sky's frame is the old canvas's (core/atmos sky model refPx): 5.1 px less (272,330) */
 fog:{falloff:1/1100,sun:.3,sky:.4},climate:{cold:false,dry:false},wet:false,snowLine:[3300,3500],snowBase:0,groundN:560,
 groundLayers:['grass','sphagnum','field','needles','rift'],
 lakeLook:{deep:[0x1a4660,0x0e2c44],shallow:0x3a7a7a},riverLook:[0x4a8a88,0x2e6470],
 // the far country: the walls round the basin rising to the highland (the Outer Wall's crest over the north-west), the lake going on south-west
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),dw=Math.max(0,-S0-x),de=Math.max(0,x-S0),ds=Math.max(0,z-S0);
  const lake=x<STATION.shoreX(clamp(z,-S0,S0))&&z>-S0?1:0;
  return lake&&dn<1?Math.min(g,STATION.LAKE-2)+0*ds:g+dn*.55+dw*.45*smooth(0,3000,dw)+de*.3*smooth(0,4000,de)+260*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,900,1900,3300,4200],farLabel:'The walls round the great lake\'s basin',
 kin:[
  /* OWED: swlowlands.cedar (the tier cedar, Dalab's timber): its builder (swlowlands src/55, B[16]) jitters its 4 m pads up to 1.2 m off the limbs, and the attach audit failed at 2% here (4.4% of its needle cards); grown again once swlowlands holds them (BIO.holdTo). KNOWN_ISSUES.md */
  {ref:'swlowlands.corkoak',key:'corkoak',name:'Cork oak',cell:36,minR:3,accept:Z=>Z.shore*.3*Z.gentle*(1-Z.farm)*(1-Z.lake)},
  {ref:'swlowlands.baylaurel',key:'baylaurel',name:'Bay laurel',cell:20,minR:2,accept:(Z,x,z)=>Z.shore*Z.gentle*.6*smooth(.05,.3,BIO.field('farm',x+30,z)+BIO.field('farm',x-30,z)+BIO.field('farm',x,z+30))*(1-Z.farm)},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:22,minR:2.5,accept:Z=>Z.lake*.5*smooth(.35,.2,Z.cold)},
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark',cell:40,minR:3,accept:Z=>Z.shore*.08*smooth(.15,.28,Z.cold)+Z.montane*.06*(1-Z.fog)},
  {ref:'shigh.aloe',key:'spiralaloe',name:'Spiral aloe',cell:26,minR:1.5,accept:(Z,x,z)=>Z.shore*.2*smooth(.12,.3,Z.slope)*smooth(.7,.45,Z.slope)*smooth(-1200,-800,z)},
  {ref:'rift.stonepine',key:'stonepine',name:'Rift stone pine',cell:42,minR:3,accept:Z=>(Z.shore*.08+Z.montane*.1)*smooth(.6,.4,Z.wet)*smooth(.2,.45,Z.slope)},
  {ref:'rift.fantree',key:'fantree',name:'Fan tree',cell:40,minR:2.5,accept:Z=>Z.shore*.12*Z.gentle*(1-Z.farm)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,cz=S.cliffZ(0),fz=S.footZ(0);
  return{
  'Ledge\'s cliff over the great lake':[-900,S.LAKE+40,fz+1400,0,(S.highland(0,cz)+S.LAKE)/2,cz+120],
  'From Ledge\'s cliff top':[40,gh(40,cz-30,2),cz-30,-1400,S.LAKE,fz+1800],
  'The great lake':[S.shoreX(600)+90,S.LAKE+6,600,-2000,S.LAKE+30,1600],
  'The basin plain and Dalab\'s fields':look(P.farm[0]-220,P.farm[1]-160,25,P.farm[0]+120,P.farm[1]+60,2),
  'The outlet, toward the gorge':(function(){const r=S.riv;return[r[18][0]-160,gh(r[18][0]-160,r[18][1],18),r[18][1],r[40][0],r[40][2]+2,r[40][1]];})(),
  'Mist frills in the cloud belt':atTree(nearTree('mistfrill',P.cloud[0],P.cloud[1]),28,2.2,3),
  'Veil thread on a mist frill':atTree(nearTree('mistfrill',P.cloud[0],P.cloud[1],9),9,1.1,2),
  'Lobe larches':atTree(nearTree('lobelarch',P.cloud[0],P.cloud[1]),34,.6,4),
  'Mist cups and moor sponge':look(P.bog[0]-14,P.bog[1]+10,2,P.bog[0]+10,P.bog[1]-6,0),
  'From afar':look(2800,2800,500,-600,-600,600)};},
 probes:{bed(){const r=STATION.riv[20];return[r[0],terrainH(r[0],r[1])+.2,r[1]];},ice:null}};
