// ================================================================= HOST — stage (Farside, station 1: FARPORT'S KELP COAST)
// The STATION (the page's shell is 44z-host-shell.js): its landform and its say (STAGE), which
// 47-host-land.js (the same for every station) turns into the height, the fields, the ground and the binding. Each station's
// stations/<name>/45-host-stage.js replaces this file.
//
// WHERE (PLAN.md sections 1 and 6): the coast by Farport (scale model px 27,260; the city itself is a settlement build and
// off this page, the owner: works only), 2 to 10 km of the sea's flora behind it. Af/Cfa, ~3,500 mm, +24 degC, the sea fog
// most mornings, the north-west wind straight off the only ocean. The land rises from the strand to ~300 m within 3 km.
//
// THE MAP (x east, z south, y up from the sea; R 1600). u runs inland (south-east, down the wind), v along the coast:
//   THE SEA          north-west of the shoreline (u < ~ -650), its bed falling to 12 m and more
//   THE HARBOUR COVE a bite into the coast at v ~ -200: the SPRAY CORAL's terraces round it, whitewashed with their own lime
//   THE STRAND       the beach and its wrack line, surf rocks along it with sea palms and wrack
//   THE KELP COAST   the slopes behind, rising to ~300 m: the land kelp in stands on lime-stiffened stipes, wrack hung from
//                    everything, sea lettuce and anemones on its floor; goat-cropped clearings round the works
//   THE WORKS        kelp kilns on the strand, lime kilns on the terraces, wrack heaps and carts, walled terraces manured
//                    with wrack, a goat fold, drying racks (86-host-works.js: Eternian furniture)
// ---------------------------------------------------------------- the coast (u inland, v along it)
const SQ=Math.SQRT1_2;
const UV=(x,z)=>[(x+z)*SQ,(z-x)*SQ],XZ=(u,v)=>[(u-v)*SQ,(u+v)*SQ];
const COVE={v:-200,depth:240,w:330};
// the shoreline's u at v: a gentle wander, the harbour cove bitten in, a headland to the north-east
const shoreU=v=>-650+55*Math.sin(v*.0021+.5)+22*Math.sin(v*.0067+1.3)+COVE.depth*Math.exp(-Math.pow((v-COVE.v)/COVE.w,2))-170*Math.exp(-Math.pow((v-760)/260,2));
// signed distance inland from the shoreline (negative in the sea; u-distance, near enough on a coast this gentle)
const coastD=(x,z)=>{const p=UV(x,z);return p[0]-shoreU(p[1]);};
// THE SPRAY CORAL's terraces: round the cove, from the waterline to ~300 m in, stepping up in 2.6 m treads
const coralK=(x,z,d)=>{const p=UV(x,z),near=Math.exp(-Math.pow((p[1]-COVE.v)/560,2));
 return smooth(-4,6,d)*smooth(330,190,d)*smooth(.25,.45,near+.25*(fbm(x*.006+3,z*.006-5,401,2)-.5));};
// THE SURF ROCKS: knolls along the strand and in the shallows
const rockK=(x,z,d)=>smooth(.6,.7,fbm(x*.011-2,z*.011+7,402,3))*smooth(-140,-15,d)*smooth(110,25,d);
function landH(x,z,d){
 const n=fbm(x*.0016+4,z*.0016-2,403,3)-.5,n2=fbm(x*.006-1,z*.006+3,404,2)-.5;
 let h=-.4+2.6*smooth(0,55,d)+290*Math.pow(smooth(60,3000,d),1.25)+(95*n+16*n2)*smooth(120,800,d);
 const gully=Math.abs(fbm(x*.0021+9,z*.0021-6,405,2)-.5);h-=14*smooth(.06,0,gully)*smooth(200,700,d);   /* the streams' gullies */
 return h;}
function groundH(x,z){const d=coastD(x,z);let h;
 if(d<0)h=-.4+.035*d-11*smooth(0,-420,d)+1.2*(fbm(x*.004,z*.004,406,2)-.5)*smooth(-10,-120,d);
 else h=landH(x,z,d);
 const ck=coralK(x,z,d);if(ck>0){const t=Math.max(h,.3)/2.6,ti=Math.floor(t),step=(ti+smooth(.7,1,t-ti))*2.6+.35;h=mix(h,step,ck);}   /* the treads, a lip at each riser */
 const rk=rockK(x,z,d);if(rk>0)h+=rk*(5.5+4*fbm(x*.05,z*.05,407,2));
 return h;}

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const STAGE={
 key:'kelpcoast',name:'Farside: Farport\'s kelp coast',R:1600,seed:2611,
 site:{px:27,py:260},air:{pressure:1.3,humidity:.95},clouds:{cover:.74},fogDensity:.00036,weather:'clear',
 ground:groundH,coastD,UV,XZ,sea:{level:0,seeds:[XZ(-1500,0),XZ(-1500,-900),XZ(-1500,900)]},
 // the fields (0..1). invade: the sea's flora's share (1 the kelp coast, 0 the land's own); spray: the salt it rides on;
 // front: the dead belt; native: where the land's forest stands (nwlowlands, read in place); graze: the goats' cropping
 fields:{
  spray:(x,z)=>{const d=coastD(x,z);return d<0?1:smooth(1600,0,d);},
  invade:(x,z)=>1,
  front:(x,z)=>0,native:(x,z)=>0,
  sand:(x,z)=>{const d=coastD(x,z);return smooth(75,18,d)*smooth(-6,2,d)*(1-coralK(x,z,d))*(1-rockK(x,z,d)*1.5);},
  coral:(x,z)=>coralK(x,z,coastD(x,z)),
  rock:(x,z)=>clamp(rockK(x,z,coastD(x,z))*1.6,0,1),
  strand:(x,z)=>{const d=coastD(x,z);return Math.exp(-Math.pow((d-16)/9,2))*(1-coralK(x,z,d));},   /* the wrack line */
  graze:(x,z)=>{const d=coastD(x,z);return smooth(.56,.66,fbm(x*.0042+11,z*.0042-4,408,2))*smooth(40,120,d);},
  burn:(x,z)=>0,
  fog:(x,z)=>.25,
  upland:(x,z)=>clamp(groundH(x,z)/320,0,1)},
 natives:null,                                  /* no native forest on this page (the kelp coast holds it all) */
 stream:null,
 // the far country: the coast running on north-east and south-west, the land climbing to the outer wall's foothills
 farLift:(x,z)=>{const p=UV(x,z);return 900*smooth(2500,9000,p[0])*(.7+.5*fbm(x*.0005,z*.0005,409,3))+300*smooth(1800,5000,p[0])*(fbm(x*.0012,z*.0012,410,2)-.3);},
 // the people's works (86-host-works.js), in coast coordinates: [kind, u, v, turn]
 works:[['kelpkiln',-560,380,.3],['kelpkiln',-575,520,-.2],['kelpkiln',-540,-560,.1],
  ['limekiln',-400,-60,0],['limekiln',-330,-330,.6],
  ['wrackheap',-600,450,0],['wrackheap',-610,600,.4],['wrackheap',-590,-620,-.3],['wrackcart',-540,440,.9],
  ['terraces',260,-480,.2],['fold',380,-260,0],['rack',-470,300,.2],['rack',-470,260,.2],['rack',-480,-520,-.4]],
 spine:[[-560,-200],[-300,250],[100,-150],[500,150]],   /* the LOD spine, in coast coordinates [u, v] */
 // the preset views [name, from u, v, height over the ground, to u, v, height] (99-host-take.js adds ones found from what was built)
 viewList:[['The kelp coast from the sea',-1050,-150,28,200,0,40],['The harbour cove (the spray coral terraces)',-640,-420,14,-430,-160,4],
  ['The strand and its wrack line',-640,640,5,-560,900,1],['Kelp stands up the slope',-150,420,40,500,300,60],
  ['The surf rocks',-700,250,6,-650,450,2],['The coral terraces from above',-300,-200,70,-450,-200,0],
  ['From the heights over the coast',1250,0,150,-700,-100,0],['Goat-cropped clearings',200,-500,30,380,-260,4]]};
