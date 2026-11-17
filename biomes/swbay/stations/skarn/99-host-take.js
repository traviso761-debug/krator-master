// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// (station 3, the skarn-marble cliffs, raised) As the bay's page (src/99): the camera, the loop, the panel and window._api are core/host's;
// this fragment says what this page has. THE PLAN'S VIEW opens the page: the eye on the raised sea stack at the plan's spot (px 734,998),
// 14 m over the platform it stands on, looking NNW (az 338) and 4 degrees up: the spring's outfall over the old visor in the left
// foreground, the headland's quarried marble (a former sea cliff) across the fossil cove, the raised platforms falling to the right.
const VIEW_AZ=338,VIEW_PITCH=4;
const dirOf=(az,pitch)=>{const a=az*Math.PI/180,p=pitch*Math.PI/180;return[Math.sin(a)*Math.cos(p),Math.sin(p),-Math.cos(a)*Math.cos(p)];};
const lookAz=(eye,az,pitch,far)=>{const d=dirOf(az,pitch);return[eye[0],eye[1],eye[2],eye[0]+d[0]*far,eye[1]+d[1]*far,eye[2]+d[2]*far];};
const AB=(a,b,dy)=>{const p=xzOf(a,b);return[p[0],HL.h(p[0],p[1])+dy,p[1]];};
const EYE=[0,terrainH(0,0)+1.7,0];
const VIEWS={
 'The raised cliffs from the stack':lookAz(EYE,VIEW_AZ,VIEW_PITCH,400),
 'The spring outfall':(function(){const S=SPRING,dx=S.lip[0]-S.x,dz=S.lip[1]-S.z,l=Math.hypot(dx,dz),ex=S.lip[0]+dx/l*26+dz/l*9,ez=S.lip[1]+dz/l*26-dx/l*9,tx=S.lip[0]-dx/l*6,tz=S.lip[1]-dz/l*6;
  return[ex,HL.h(ex,ez)+3.2,ez,tx,HL.h(tx,tz)+1,tz];})(),
 'The quarry face':(function(){const e=AB(560,-200,24),t=AB(830,-60,55);return e.concat(t);})(),   /* from the raised platform, 280 m off the stepped flank */
 'The headland from the platform':(function(){const e=AB(640,-330,12),t=AB(1000,-260,50);return e.concat(t);})(),
 'Along the visor':(function(){const e=AB(40,30,2.2),t=AB(250,62,2);return e.concat(t);})(),
 'Cut blocks on the raised bench':(function(){const e=AB(735,-15,3),t=AB(800,25,-1);const u=Uat(e[0],e[2]);e[1]=Math.max(e[1],u+38);t[1]=Math.max(t[1],u+35);return e.concat(t);})(),
 'The crown and its baobabs':(function(){const e=AB(760,260,4),t=AB(900,100,10);return e.concat(t);})(),
 'Monkey puzzles on the treads':(function(){const T=(window._ledgeTrees||[]).find(o=>o.key==='puzzle');if(!T)return AB(800,-200,40).concat(AB(830,70,80));
  const d=[T.x-0,T.z-0],l=Math.hypot(d[0],d[1]);return[T.x-d[0]/l*70,T.y+10,T.z-d[1]/l*70,T.x,T.y+4,T.z];})(),
 'The raised platforms and the sea':lookAz(EYE,50,-1.5,3000),
 'Over the raised platforms':(function(){const e=AB(260,-520,140),t=AB(800,60,60);return e.concat(t);})(),
 'Up the coast toward Almua':lookAz(EYE,348,1.2,2000),
 'The Throne plume to the NNE':lookAz(EYE,THRONE.bearing,2.2,2000),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the rock: its bed from the strata's data half (KSTRATA, the GPU draws the same bed), and its height over the old shoreline
 if(GROUND_MESHES.indexOf(o)>=0){const B=STRATA.at(p.x,p.y,p.z);name+='\nbed: '+B.recipe+' / '+B.kind+' (hardness '+B.hard.toFixed(2)+'); '+(p.y-Uat(p.x,p.z)).toFixed(0)+' m over the old shoreline';}
 const S=best&&SWBAY.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+
  '  ('+(SITE.seaAbs+p.y).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the station's own checks (verify.py --assert)
const BUDGET={showcase:{tris:12000000,calls:500,rendered:9000000},cls:{pass:7500000,host:3000000},
 type:{'bay/trees':'pass','bay/floor':'pass','bay/dress':'pass','bay/fauna':'pass','host':'host'}};
// heights over the old shoreline (U, 45's Uat): every profile check reads them, so they hold wherever the model puts U
const relH=(h,x,z)=>h(x,z)-Uat(x,z);
const atAD=(a,d)=>{let lo=-900,hi=900;for(let i=0;i<40;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<d)lo=b;else hi=b;}return xzOf(a,(lo+hi)/2);};
// the station's checks: each takes its inputs, so a broken input can be handed in and must fail (hostNegatives)
const SK={
 // THE BEDS: the quarried face is contact-marble with its skarn selvages in the column it shows, the shelf's front carbonate-shelf
 beds(S){const face=xzOf(820,0),fb=S.at(face[0],UO+60,face[1]),shelf=xzOf(80,60),sb=S.at(shelf[0],UO+2,shelf[1]);
  const kinds=new Set();for(let y=UO+34;y<UO+95;y+=.25)kinds.add(S.at(face[0],y,face[1]).kind);const sk=['epidote','garnet','magnetite'].filter(k=>kinds.has(k));
  return{ok:fb.recipe==='contact-marble'&&sb.recipe==='carbonate-shelf'&&sk.length>=2,
   detail:'quarry face 60 m over the old shore: '+fb.recipe+' / '+fb.kind+'; shelf front 2 m over it: '+sb.recipe+' / '+sb.kind+'; skarn selvages in the face: '+(sk.join(', ')||'none')};},
 // THE PROFILE over the old shoreline: the raised wave-cut bench at +34 m, the crown 80-130 m, the shelf a few metres, T1 at the cliff's
 // foot, T0 ~38 m below it past T1's edge
 profile(h){const a=820,d0=quarryD0(a),bp=atAD(a,d0-6),bench=relH(h,bp[0],bp[1]);let crown=-1e9;for(let d=d0;d<d0+300;d+=6){const p=atAD(a,d);crown=Math.max(crown,relH(h,p[0],p[1]));}
  const sp=atAD(150,30),shelf=relH(h,sp[0],sp[1]),t1p=atAD(150,-150),t1=relH(h,t1p[0],t1p[1]),t0p=atAD(150,-T1W(150)-60),t0=relH(h,t0p[0],t0p[1]);
  return{ok:Math.abs(bench-34)<1.5&&crown>80&&crown<130&&shelf>2.5&&shelf<9&&t1>-6&&t1<1.5&&t0<-25&&t0>-50,
   detail:'over the old shoreline: the raised bench '+bench.toFixed(1)+' m, the crown '+crown.toFixed(0)+' m, the shelf '+shelf.toFixed(1)+' m, T1 '+t1.toFixed(1)+' m, T0 '+t0.toFixed(1)+' m'};},
 // ROOTED: every tree the kit and the host placed stands on drawn ground gentler than 1.2 (no tree on a cliff face), none in the pools
 rooted(trees){const bad=trees.filter(T=>!T.cut&&(HL.slope(T.x,T.z)>1.2||Math.hypot(T.x-POOL.x,T.z-POOL.z)<POOL.r));
  return{ok:trees.length>0&&!bad.length,detail:trees.length+' trees; '+(bad.length?bad.length+' on a cliff face or in a pool, first at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0):'none on a face')};},
 // THE SPRING: its pool over its lip, its curtain dropping at least 2.5 m into the plunge pool on the platform
 spring(D){if(!D)return{ok:false,detail:'no spring drawn'};return{ok:D.level>=D.lip&&D.FALL.drop>=2.5,detail:'pool '+D.level.toFixed(2)+' m, lip '+D.lip.toFixed(2)+' m, drop '+D.FALL.drop.toFixed(2)+' m'};},
 // THE EYE: on the raised stack, 14 m over its platform (+1.7 m eye), looking NNW (az 338) as the plan puts it
 eye(v){const az=(Math.atan2(v[3]-v[0],-(v[5]-v[2]))*180/Math.PI+360)%360,y=v[1]-STACK.base;return{ok:Math.abs(az-VIEW_AZ)<1&&Math.abs(y-15.7)<.6,detail:'eye '+y.toFixed(2)+' m over the platform, az '+az.toFixed(1)};},
 // THE SITE: the plan's spot exactly, and the platform the stack stands on within 20 m of the model's height there
 site(R,px,py){if(!R)return{ok:false,detail:'no region'};const m=R.y0+R.h(0,0)-SITE.seaAbs,q=xzOf(0,-40),g=groundH(q[0],q[1]),dp=Math.hypot(px-SITE.plan[0],py-SITE.plan[1]);
  return{ok:dp<.01&&Math.abs(g-m)<20,detail:'px '+px+','+py+' ('+dp.toFixed(1)+' px from the plan\'s spot); the platform '+g.toFixed(0)+' m, the model '+m.toFixed(0)+' m over the sea'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('beds: contact-marble face, carbonate-shelf foreshore',SK.beds(STRATA));
 add('profile: raised bench at +34, crown, platforms T1 and T0',SK.profile(groundH));
 add('trees rooted, none on a cliff face',SK.rooted(SWBAY.TREES));
 add('the spring spills over the visor',SK.spring(SPRING_DRAW));
 add('the plan eye on the raised stack',SK.eye(VIEWS['The raised cliffs from the stack']));
 add('the site on map 5.1',SK.site(REGION,SITE.px,SITE.py));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('the beds with no lateral change (marble down to the old shore everywhere)',SK.beds(KSTRATA.create({seed:1,formations:[{recipe:'contact-marble',top:UO+189},{recipe:'carbonate-shelf',base:UO+189,top:UO+340}],range:[UO-80,UO+340]})));
 add('a coast with the raised bench at 20 m',SK.profile((x,z)=>{const h=groundH(x,z),r=h-Uat(x,z);return r>30&&r<40?h-14:h;}));
 add('a tree on the quarry face',SK.rooted(SWBAY.TREES.concat([(function(){const q=atAD(820,quarryD0(820)+8);return{x:q[0],z:q[1]};})()])));
 add('a spring with no drop',SK.spring(SPRING_DRAW&&Object.assign({},SPRING_DRAW,{FALL:{drop:.2}})));
 add('an eye looking WNW',SK.eye(lookAz(EYE,300,4,400)));
 add('a site 10 px off the spot',SK.site(REGION,SITE.plan[0]-10,SITE.plan[1]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
window.EXPORT_BOX=(function(){const p=xzOf(820,260);return[Math.round(p[0]-150),Math.round(p[1]-150),Math.round(p[0]+150),Math.round(p[1]+150)];})();   /* verify.py's export profile: the crown's savannah */
KHOST.take({build:'swbay-skarn',title:'Krator biome — the southwest bay: the Almua skarn-marble cliffs, raised (showcase station 3)',
 hint:'Showcase station 3 at map 5.1 px 734,998, 260 m over the Ring Sea: the land has risen. Former sea cliffs of contact marble (epidote, garnet and magnetite seams), quarried in steps, over a raised wave-cut bench and raised platforms; the carbonate shelf, its old visor and a karst spring in front; the eye on a raised sea stack',
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
