// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// (station 3, the skarn-marble cliffs) As the bay's page (src/99): the camera, the loop, the panel and window._api are core/host's; this
// fragment says what this page has. THE PLAN'S VIEW opens the page: the eye on the mole head, 14 m over the sea (-1,485 m), looking
// NNW (az 338) and 4 degrees up, the spring's outfall in the left foreground, the headland's quarried marble across the harbour.
const VIEW_AZ=338,VIEW_PITCH=4;
const dirOf=(az,pitch)=>{const a=az*Math.PI/180,p=pitch*Math.PI/180;return[Math.sin(a)*Math.cos(p),Math.sin(p),-Math.cos(a)*Math.cos(p)];};
const lookAz=(eye,az,pitch,far)=>{const d=dirOf(az,pitch);return[eye[0],eye[1],eye[2],eye[0]+d[0]*far,eye[1]+d[1]*far,eye[2]+d[2]*far];};
const AB=(a,b,dy)=>{const p=xzOf(a,b);return[p[0],Math.max(0,HL.h(p[0],p[1]))+dy,p[1]];};
const VIEWS={
 'The harbour cliffs from the mole':lookAz([0,terrainH(0,0)+1.7,0],VIEW_AZ,VIEW_PITCH,400),
 'The spring outfall':(function(){const S=SPRING,dx=S.lip[0]-S.x,dz=S.lip[1]-S.z,l=Math.hypot(dx,dz),e=[S.lip[0]+dx/l*26+dz/l*9,3.2,S.lip[1]+dz/l*26-dx/l*9];return[e[0],e[1],e[2],S.lip[0]-dx/l*6,2.6,S.lip[1]-dz/l*6];})(),
 'The quarry face':(function(){const e=AB(560,-200,24),t=AB(830,-80,105);e[1]=24;return e.concat(t);})(),   /* from the harbour water, 280 m off the stepped flank */
 'The headland from the sound':(function(){const e=AB(640,-560,18),t=AB(1000,-260,90);return e.concat(t);})(),
 'Along the visor':(function(){const e=AB(40,30,2.2),t=AB(250,62,2);return e.concat(t);})(),
 'Cut blocks on the harbour bench':(function(){const e=AB(735,-15,3),t=AB(800,25,-1);e[1]=Math.max(e[1],38);t[1]=Math.max(t[1],35);return e.concat(t);})(),
 'The crown and its baobabs':(function(){const e=AB(760,260,4),t=AB(900,100,10);return e.concat(t);})(),
 'Monkey puzzles on the upper treads':(function(){const T=(window._ledgeTrees||[]).find(o=>o.key==='puzzle');if(!T)return AB(800,-200,60).concat(AB(830,70,150));
  const d=[T.x-0,T.z-0],l=Math.hypot(d[0],d[1]);return[T.x-d[0]/l*70,T.y+10,T.z-d[1]/l*70,T.x,T.y+4,T.z];})(),
 'The outer breakwater':(function(){const e=AB(700,-640,9),t=AB(900,-420,2);return e.concat(t);})(),
 'Over the sound':(function(){const e=AB(260,-520,160),t=AB(800,60,120);return e.concat(t);})(),
 'Up the coast toward Almua':lookAz([0,terrainH(0,0)+1.7,0],348,1.2,2000),
 'The Throne plume to the NNE':lookAz([0,terrainH(0,0)+1.7,0],THRONE.bearing,2.2,2000),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the rock: its bed from the strata's data half (KSTRATA, the GPU draws the same bed)
 if(GROUND_MESHES.indexOf(o)>=0){const B=STRATA.at(p.x,p.y,p.z);name+='\nbed: '+B.recipe+' / '+B.kind+' (hardness '+B.hard.toFixed(2)+')';}
 const S=best&&SWBAY.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+
  '  ('+(SITE.seaAbs+p.y).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the station's own checks (verify.py --assert)
const BUDGET={showcase:{tris:12000000,calls:500,rendered:9000000},cls:{pass:7500000,host:3000000},
 type:{'bay/trees':'pass','bay/floor':'pass','bay/dress':'pass','bay/fauna':'pass','host':'host'}};
// the station's checks: each takes its inputs, so a broken input can be handed in and must fail (hostNegatives)
const SK={
 // THE BEDS: the quarried face is contact-marble (and its skarn selvages are in the column it shows), the shelf's front carbonate-shelf,
 // the crown the platform's carbonate-shelf
 beds(S){const face=xzOf(820,0),fb=S.at(face[0],120,face[1]),shelf=xzOf(80,60),sb=S.at(shelf[0],2,shelf[1]),crown=xzOf(820,200),cb=S.at(crown[0],235,crown[1]);
  const kinds=new Set();for(let y=36;y<189;y+=.25)kinds.add(S.at(face[0],y,face[1]).kind);const sk=['epidote','garnet','magnetite'].filter(k=>kinds.has(k));
  return{ok:fb.recipe==='contact-marble'&&sb.recipe==='carbonate-shelf'&&cb.recipe==='carbonate-shelf'&&sk.length>=2,
   detail:'quarry face at 120 m: '+fb.recipe+' / '+fb.kind+'; shelf front at 2 m: '+sb.recipe+' / '+sb.kind+'; crown at 235 m: '+cb.recipe+'; skarn selvages in the face: '+(sk.join(', ')||'none')};},
 // THE PROFILE: the harbour bench at 34 m (-1,465), the cliff's crown over 225 m (the plan's -1,260 at ~240), the shelf a few metres up
 profile(h){const a=820,d0=quarryD0(a),pb=xzOf(a,0);let lo=-300,hi=900;for(let i=0;i<36;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<d0-6)lo=b;else hi=b;}
  const bp=xzOf(a,(lo+hi)/2),bench=h(bp[0],bp[1]);let crown=0;for(let b=0;b<700;b+=10){const p=xzOf(a,b);crown=Math.max(crown,h(p[0],p[1]));}
  const sp=xzOf(150,90),shelf=h(sp[0],sp[1]);
  return{ok:Math.abs(bench-34)<1.5&&crown>225&&crown<300&&shelf>2.5&&shelf<9,detail:'bench '+bench.toFixed(1)+' m, crown '+crown.toFixed(0)+' m over the sea, the shelf '+shelf.toFixed(1)+' m'+(pb?'':'')};},
 // ROOTED: every tree the kit and the host placed stands on land over 0.5 m, on drawn ground gentler than 1.2 (no tree on a cliff face)
 rooted(trees){const bad=trees.filter(T=>!T.cut&&(HL.h(T.x,T.z)<.5||HL.slope(T.x,T.z)>1.2));
  return{ok:trees.length>0&&!bad.length,detail:trees.length+' trees; '+(bad.length?bad.length+' on a cliff or in the sea, first at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0):'none on a face')};},
 // THE SPRING: its pool over its lip, its curtain dropping at least 2.5 m into the sound
 spring(D){if(!D)return{ok:false,detail:'no spring drawn'};return{ok:D.level>=D.lip&&D.lip>=2.5&&D.FALL.drop>=2.5,detail:'pool '+D.level.toFixed(2)+' m, lip '+D.lip.toFixed(2)+' m, drop '+D.FALL.drop.toFixed(2)+' m'};},
 // THE EYE: on the mole head 14 m over the sea, looking NNW (az 338) as the plan puts it
 eye(v){const az=(Math.atan2(v[3]-v[0],-(v[5]-v[2]))*180/Math.PI+360)%360,y=v[1];return{ok:Math.abs(az-VIEW_AZ)<1&&Math.abs(y-14)<.3,detail:'eye at '+y.toFixed(2)+' m, az '+az.toFixed(1)};},
 // THE SITE: the model's shore (REGION's height at the origin within 30 m of the sea) and within 7 px (14 km) of the plan's spot (the
 // nearest shore to 734,998 on today's raster is ~5.5 px off it)
 site(R,px,py){if(!R)return{ok:false,detail:'no region'};const y=R.y0+R.h(0,0)-SITE.seaAbs,dp=Math.hypot(px-SITE.plan[0],py-SITE.plan[1]);
  return{ok:Math.abs(y)<30&&dp<=7,detail:'model at the origin '+y.toFixed(1)+' m over the sea; '+dp.toFixed(1)+' px from the plan\'s '+SITE.plan.join(',')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('beds: contact-marble face, carbonate-shelf foreshore',SK.beds(STRATA));
 add('profile: bench at -1465, crown near -1260',SK.profile(groundH));
 add('trees rooted, none on a cliff face',SK.rooted(SWBAY.TREES));
 add('the spring spills over the visor',SK.spring(SPRING_DRAW));
 add('the plan eye on the mole',SK.eye(VIEWS['The harbour cliffs from the mole']));
 add('the site on map 5.1',SK.site(REGION,SITE.px,SITE.py));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('the beds with no lateral change (marble down to the sea everywhere)',SK.beds(KSTRATA.create({seed:1,formations:[{recipe:'contact-marble',base:-16,top:189},{recipe:'carbonate-shelf',base:189,top:330}],range:[-16,330]})));
 add('a coast with the bench at 20 m',SK.profile((x,z)=>{const h=groundH(x,z);return h>30&&h<40?20:h;}));
 add('a tree on the quarry face',SK.rooted(SWBAY.TREES.concat([(function(){const p=xzOf(820,0);let lo=-300,hi=900;for(let i=0;i<36;i++){const b=(lo+hi)/2,q=xzOf(820,b);if(SDF(q[0],q[1])<quarryD0(820)+8)lo=b;else hi=b;}const q=xzOf(820,(lo+hi)/2);return{x:q[0],z:q[1]};})()])));
 add('a spring whose lip is at the sea',SK.spring(SPRING_DRAW&&Object.assign({},SPRING_DRAW,{lip:.2,FALL:{drop:.2}})));
 add('an eye looking WNW',SK.eye(lookAz([0,14,0],300,4,400)));
 add('a site 10 px inland',SK.site(REGION,SITE.plan[0]-10,SITE.plan[1]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
window.EXPORT_BOX=(function(){const p=xzOf(820,260);return[Math.round(p[0]-150),Math.round(p[1]-150),Math.round(p[0]+150),Math.round(p[1]+150)];})();   /* verify.py's export profile: the crown's savannah */
KHOST.take({build:'swbay-skarn',title:'Krator biome — the southwest bay: the Almua skarn-marble harbour cliffs (showcase station 3)',
 hint:'Showcase station 3: the Almua-Voth coast at map 5.1 px 739.6,995. Contact marble with epidote, garnet and magnetite seams, quarried in steps; the carbonate shelf, its tidal visor and a karst spring in front',
 scene,camera,renderer,ground:terrainH,clear:1.7,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
if(SWBAY_LOOK.season&&BIO.bindSeason)BIO.bindSeason(null,{sharp:2});
