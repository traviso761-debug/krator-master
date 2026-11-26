// ================================================================= HOST — stage (Farside, station 1: FARPORT'S KELP COAST)
// The STATION (the page's shell is 44z-host-shell.js): its landform and its say (STAGE), which
// 47-host-land.js (the same for every station) turns into the height, the fields, the ground and the binding. Each station's
// stations/<name>/45-host-stage.js replaces this file.
//
// WHERE (PLAN.md sections 1 and 6; map 5.1, biomes/STATIONS-MAP-5.1.md "Farside, the tsunami and Farport"): the coast under FARPORT.
// THE TSUNAMI REACHES FARSIDE (the owner, 2026-11-01): Farport's old city (the important buildings) moved up onto the near-shore plateau
// (5.1 px 294,588, 212 m: DATA.tsunami_farside), out of the wave's reach; the harbour stays below at the water, in it. Two km apart on the
// model; here compressed onto one page (KNOWN_ISSUES.md): the sea, the harbour in Ling-Ma's drowned estuary, the scour bench the waves
// planed (bleached bedrock to 65 m, chevron ridges and backwash chutes, a perched saline lagoon), the bluff, the plateau at ~212 m. The
// city itself is a settlement build (kits/eternian; the owner: works only on a biome page): here its site is held clear and registered.
// DATA.tsunami_farside: crest 50 m (35-55 along the headlands), scour bench to 65 m, chevrons to 38 m, run-up ceiling 100 m.
//
// THE MAP (x east, z south, y up from the sea; R 1600). u runs inland (south-east, down the wind), v along the coast:
//   THE SEA          north-west of the shoreline (u < ~ -650), its bed falling to 12 m and more
//   THE HARBOUR      Ling-Ma's drowned estuary (the river grades to the sea at 0 m on 5.1): an arm of still water at sea level cut
//                    through the bench, the bluff and the plateau along u at v ~ -260; the quays, the jetties and the slip on it
//   THE SCOUR BENCH  the shore to ~700 m in, 3 to ~55 m: wave-planed and salt-bleached bedrock, V-shaped chevron ridges pointing
//                    inland, backwash chutes between them, a perched saline lagoon (the plunge pool); the sea's strand flora on it
//   THE BLUFF        ~650-1,000 m in, up to ~208 m; the run-up ceiling (100 m) crosses it: below it the kelp is young (the trimline)
//   THE PLATEAU      past ~1,000 m, 210-220 m: the old city's site (held clear, registered), its terraces and fold; the kelp coast
//   THE WORKS        kelp kilns and wrack on the strand, lime kilns by the coral, the harbour's quays, jetties and slip, the
//                    tsunami stones along the run-up line, terraces and a fold on the plateau (86-host-works.js: Eternian furniture)
// ---------------------------------------------------------------- the coast (u inland, v along it)
const SQ=Math.SQRT1_2;
const UV=(x,z)=>[(x+z)*SQ,(z-x)*SQ],XZ=(u,v)=>[(u-v)*SQ,(u+v)*SQ];
// the tsunami (DATA.tsunami_farside on map 5.1; heights in metres over the sea)
const TSU={crest:50,bench:65,chevron:38,runup:100,farportH:212};
// the shoreline's u at v: a gentle wander, a headland to the north-east (no cove: the harbour is the estuary)
const shoreU=v=>-650+55*Math.sin(v*.0021+.5)+22*Math.sin(v*.0067+1.3)-170*Math.exp(-Math.pow((v-760)/260,2));
// signed distance inland from the shoreline (negative in the sea; u-distance, near enough on a coast this gentle)
const coastD=(x,z)=>{const p=UV(x,z);return p[0]-shoreU(p[1]);};
// THE HARBOUR: Ling-Ma's drowned estuary along u. Its axis wanders a little; its half-width narrows from the mouth (~120 m) inland
const EST={v:-260,u0:-700,bed0:-12,bed1:-6.5};
const estV=u=>EST.v+38*Math.sin(u*.0031+.7)+14*Math.sin(u*.009+2.1),estW=u=>lerp(118,46,smooth(-650,900,u));
// the share of the estuary's water (1 in it) and of its valley (the banks falling to it), by the distance off its axis
const estDv=(x,z)=>{const p=UV(x,z);return [Math.abs(p[1]-estV(p[0]))-estW(p[0]),p[0]];};
const estK=(x,z)=>{const e=estDv(x,z);return smooth(8,-12,e[0])*smooth(EST.u0-40,EST.u0+40,e[1]);};
const estValley=(x,z)=>{const e=estDv(x,z);return smooth(190,0,e[0])*smooth(EST.u0-60,EST.u0+60,e[1]);};
// THE SPRAY CORAL's terraces: either side of the harbour mouth, from the waterline to ~300 m in, stepping up in 2.6 m treads
const coralK=(x,z,d)=>{const p=UV(x,z),near=Math.exp(-Math.pow((p[1]-EST.v)/520,2));
 return smooth(-4,6,d)*smooth(330,190,d)*smooth(.25,.45,near+.25*(fbm(x*.006+3,z*.006-5,401,2)-.5))*(1-estValley(x,z));};
// THE SURF ROCKS: knolls along the strand and in the shallows (off the harbour mouth's channel)
const rockK=(x,z,d)=>smooth(.6,.7,fbm(x*.011-2,z*.011+7,402,3))*smooth(-140,-15,d)*smooth(110,25,d)*(1-estValley(x,z));
// THE CHEVRONS AND CHUTES on the bench (5.1's tsunami coast): cells along the coast, in each a set of V-shaped ridges with the apex
// inland (the wave's run-up front, frozen as megaboulder ridges) and the backwash chutes between them; their phase as the model's
// (a ridge where it is positive, a chute where it is negative), wandered by a noise
const chevPhase=(x,z,d)=>{const p=UV(x,z),cw=360,vi=Math.round(p[1]/cw),dv=p[1]-vi*cw+40*(fbm(x*.004+5,z*.004,421,2)-.5);
 return Math.sin(TAU*(d+.55*Math.abs(dv))/112+1.8*(fbm(x*.003-7,z*.003+2,422,2)-.5)+vi*1.3);};
const benchK=d=>smooth(-2,30,d)*smooth(760,620,d);   /* the scoured bench: the shore to the bluff's foot */
const chevK=d=>smooth(60,170,d)*smooth(690,540,d);
// THE PERCHED SALINE LAGOON on the bench (5.1's plunge-pool lagoons, 7-12 m): an ellipse long along the coast, its water at 9 m
const LAG={u:-420,v:430,ru:70,rv:150,level:9,ang:.18};
const lagR=(x,z)=>{const p=UV(x,z),du=p[0]-LAG.u,dv=p[1]-LAG.v,c=Math.cos(LAG.ang),s=Math.sin(LAG.ang);return Math.hypot((du*c+dv*s)/LAG.ru,(-du*s+dv*c)/LAG.rv);};
// FARPORT'S SITE on the plateau (the old city: a settlement build, held clear here) and the factory quarter's by the harbour
const CITY={u:1220,v:260,r:250},FACTORY={u:-420,v:-110,r:70};
function landH(x,z,d){
 const n=fbm(x*.0016+4,z*.0016-2,403,3)-.5,n2=fbm(x*.006-1,z*.006+3,404,2)-.5;
 // the bench (planed: ~3 m at the beach's top to ~53 m at the bluff's foot), the bluff (to ~208 m) and the plateau (~212-220 m)
 let h=-.4+2.6*smooth(0,55,d)+50*Math.pow(smooth(30,720,d),.9)+155*smooth(640,1020,d)+7*smooth(1000,2400,d);
 h+=(3*n+1.2*n2)*smooth(40,200,d)*smooth(760,600,d)+(26*n+8*n2)*smooth(700,1100,d);   /* planed smooth on the bench, rougher above */
 const cp=chevPhase(x,z,d),ck=chevK(d);h+=ck*(13*Math.pow(Math.max(cp,0),1.8)-5.5*Math.pow(Math.max(-cp,0),2.2));
 const gully=Math.abs(fbm(x*.0021+9,z*.0021-6,405,2)-.5);h-=16*smooth(.06,0,gully)*smooth(620,760,d)*smooth(1300,1050,d);   /* the bluff's streams */
 return h;}
function groundH(x,z){const d=coastD(x,z);let h;
 if(d<0)h=-.4+.035*d-11*smooth(0,-420,d)+1.2*(fbm(x*.004,z*.004,406,2)-.5)*smooth(-10,-120,d);
 else h=landH(x,z,d);
 // the harbour: the estuary's bed (-12 m at the mouth to -6.5 m up the arm), its banks falling to quays a metre or two over the water
 const ev=estValley(x,z);if(ev>0){const e=estDv(x,z),bed=lerp(EST.bed0,EST.bed1,smooth(-650,1500,e[1])),bank=1.6+.012*Math.max(0,e[0]);
  const wall=Math.min(h,bank+Math.max(0,e[0]-60)*.9);h=mix(h,wall,ev);h=mix(h,bed,estK(x,z));}
 // the lagoon: a hollow on the bench, its water at 9 m, its floor 3 m under it, its rim eased into the bench
 const lr=lagR(x,z);if(lr<1.9){const bed=LAG.level-3.2*(1-Math.min(lr,1)*Math.min(lr,1));h=mix(h,Math.min(h,lr<1?bed:LAG.level+1+(lr-1)*9),smooth(1.9,1.2,lr));}
 const ck=coralK(x,z,d);if(ck>0){const t=Math.max(h,.3)/2.6,ti=Math.floor(t),step=(ti+smooth(.7,1,t-ti))*2.6+.35;h=mix(h,step,ck);}   /* the treads, a lip at each riser */
 const rk=rockK(x,z,d);if(rk>0)h+=rk*(5.5+4*fbm(x*.05,z*.05,407,2));
 return h;}
// where the run-up line crosses the ground at v: the first u inland where the ground stands at h (the estuary's valley skipped)
const contourU=(v,hh)=>{for(let u=shoreU(v);u<2200;u+=6){const p=XZ(u,v);if(estValley(p[0],p[1])>.05)return null;if(groundH(p[0],p[1])>=hh)return u;}return null;};
const benchAt=(x,z)=>{const d=coastD(x,z);if(d<-2)return 0;return smooth(TSU.bench+6,TSU.bench-6,groundH(x,z))*smooth(-2,12,d)*(1-estK(x,z));};

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const _city=(x,z)=>{const p=UV(x,z);return smooth(CITY.r+60,CITY.r-20,Math.hypot(p[0]-CITY.u,p[1]-CITY.v));};
const STAGE={
 key:'kelpcoast',name:'Farside: Farport\'s kelp coast',R:1600,seed:2611,
 /* the sky's pixel: Farport's plateau, 5.1 px 294,588 (the sky's frame is on the 4.23 canvas: 5.1 less 272,330) */
 site:{px:22,py:258},air:{pressure:1.3,humidity:.95},clouds:{cover:.74},fogDensity:.00036,weather:'clear',
 ground:groundH,coastD,UV,XZ,sea:{level:0,seeds:[XZ(-1500,0),XZ(-1500,-900),XZ(-1500,900)],
  /* the harbour is its own still arm (89w): the sea's shore grid stops at its mouth, so no breakers ring its quays */
  land:(x,z)=>estK(x,z)>.02&&UV(x,z)[0]>EST.u0+30},
 // THE HARBOUR (89w): Ling-Ma's drowned estuary, a still arm at sea level; the river's silt runs out of its mouth as a plume on the sea
 harbour:{level:0,at:(x,z)=>estK(x,z)>.02,mouth:XZ(shoreU(EST.v)-10,EST.v),axis:u=>XZ(u,estV(u)),u0:EST.u0,u1:2000,name:'Ling-Ma\'s drowned estuary (Farport\'s harbour)'},
 // THE PERCHED SALINE LAGOON (89w; the reflections switch's still)
 lagoon:{level:LAG.level,at:(x,z)=>lagR(x,z)<1.15,centre:XZ(LAG.u,LAG.v),r:LAG.rv*1.2,name:'The saline lagoon (a tsunami plunge pool on the bench)'},
 // THE TSUNAMI (47 draws its reach: the run-up line and the scour line over the ground, ?tsunami=0 none)
 tsunami:{runup:TSU.runup,bench:TSU.bench,crest:TSU.crest,contour:contourU,along:[-1500,1500]},
 // the fields (0..1). invade: the sea's flora's share (1 the kelp coast, 0 the land's own); spray: the salt it rides on;
 // front: the dead belt; native: where the land's forest stands (nwlowlands, read in place); graze: the goats' cropping;
 // bench: the scoured bedrock under 65 m (bleached, the strand's flora on it); trim: under the run-up ceiling (the kelp younger)
 fields:{
  spray:(x,z)=>{const d=coastD(x,z);return d<0?1:smooth(1600,0,d);},
  invade:(x,z)=>1,
  front:(x,z)=>0,native:(x,z)=>0,
  sand:(x,z)=>{const d=coastD(x,z);return smooth(75,18,d)*smooth(-6,2,d)*(1-coralK(x,z,d))*(1-rockK(x,z,d)*1.5)*(1-estValley(x,z));},
  coral:(x,z)=>coralK(x,z,coastD(x,z)),
  rock:(x,z)=>{const d=coastD(x,z),b=benchAt(x,z);   /* the surf rocks, and the bench's bare bedrock between its patches of weed */
   return clamp(Math.max(rockK(x,z,d)*1.6,b*smooth(.42,.6,fbm(x*.012+2,z*.012-9,423,2))*.85),0,1);},
  strand:(x,z)=>{const d=coastD(x,z);return Math.exp(-Math.pow((d-16)/9,2))*(1-coralK(x,z,d))*(1-estValley(x,z));},   /* the wrack line */
  graze:(x,z)=>{const d=coastD(x,z);return Math.max(smooth(.56,.66,fbm(x*.0042+11,z*.0042-4,408,2))*smooth(40,120,d),_city(x,z)*.9);},
  burn:(x,z)=>0,
  fog:(x,z)=>.25,
  bench:benchAt,
  trim:(x,z)=>{const d=coastD(x,z);return d<0?1:smooth(TSU.runup+8,TSU.runup-8,groundH(x,z));},
  city:_city,
  upland:(x,z)=>clamp(groundH(x,z)/320,0,1)},
 natives:null,                                  /* no native forest on this page (the kelp coast holds it all) */
 stream:null,
 // the far country: the coast running on north-east and south-west, the land climbing steeply to the outer wall (5.1: ~1,000 m within
 // 10 km of the sea, 1,500 m at 20 km), the estuary's valley running on inland
 farLift:(x,z)=>{const p=UV(x,z);return 1300*smooth(2500,12000,p[0])*(.7+.5*fbm(x*.0005,z*.0005,409,3))+300*smooth(1800,5000,p[0])*(fbm(x*.0012,z*.0012,410,2)-.3);},
 // the sites the settlement build places (registered, not drawn: 86-host-works.js)
 sites:[['Farport, the old city (moved up out of the tsunami\'s reach; a settlement build: kits/eternian)',CITY.u,CITY.v,CITY.r,'city'],
  ['Farport\'s factory quarter (the traders\' walled quarter by the quays, in the wave\'s reach; kits/eternian et_factory_quarter)',FACTORY.u,FACTORY.v,FACTORY.r,'quarter']],
 // the people's works (86-host-works.js), in coast coordinates: [kind, u, v, turn]; a u of null stands on the run-up line at v
 works:[['kelpkiln',-560,380,.3],['kelpkiln',-575,560,-.2],['kelpkiln',-540,-640,.1],
  ['limekiln',-470,-470,0],['limekiln',-470,-40,.6],
  ['wrackheap',-600,470,0],['wrackheap',-610,610,.4],['wrackheap',-590,-700,-.3],['wrackcart',-540,460,.9],
  /* the harbour: quays along both banks (turn PI/2: along the arm), two jetties out from the north bank and a slip on the south (across it) */
  ['quay',-560,estV(-560)+estW(-560)+3,Math.PI/2],['quay',-500,estV(-500)+estW(-500)+3,Math.PI/2],['quay',-440,estV(-440)+estW(-440)+3,Math.PI/2],['quay',-380,estV(-380)+estW(-380)+3,Math.PI/2],
  ['quay',-530,estV(-530)-estW(-530)-3,Math.PI/2],['quay',-470,estV(-470)-estW(-470)-3,Math.PI/2],
  ['pier',-470,estV(-470)+estW(-470)+1,0],['pier',-410,estV(-410)+estW(-410)+1,0],['slip',-330,estV(-330)-estW(-330)-2,Math.PI],
  /* the tsunami stones: on the run-up line (u found where the ground reaches 100 m at that v), the Eternian warning not to build below them */
  ['tsunamistone',null,-980,0],['tsunamistone',null,-640,0],['tsunamistone',null,60,0],['tsunamistone',null,520,0],['tsunamistone',null,980,0],
  ['terraces',1000,640,.2],['fold',1450,-20,0],['rack',-470,300,.2],['rack',-470,250,.2],['rack',-480,-600,-.4]],
 spine:[[-560,-200],[-300,250],[100,-150],[500,150],[1100,250]],   /* the LOD spine, in coast coordinates [u, v] */
 // the preset views [name, from u, v, height over the ground, to u, v, height] (99-host-take.js adds ones found from what was built)
 viewList:[['The kelp coast from the sea',-1050,-150,28,200,0,40],['Farport\'s harbour (Ling-Ma\'s drowned estuary)',-760,-420,16,-300,-250,2],
  ['The strand and its wrack line',-640,640,5,-560,900,1],['Kelp stands up the bluff',-150,420,40,500,300,60],
  ['The surf rocks',-700,250,6,-650,450,2],['The scour bench, its chevrons and chutes',-560,150,45,-250,300,0],
  ['The saline lagoon',-560,330,14,-420,430,0],['The run-up line and its stones (100 m)',-200,-760,30,140,-640,0],
  ['From the plateau over the harbour (the old city\'s site)',1050,150,40,-700,-250,0],['From the heights over the coast',1250,0,150,-700,-100,0]]};
