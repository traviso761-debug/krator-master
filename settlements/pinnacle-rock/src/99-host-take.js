// ================================================================= HOST — Pinnacle Rock's views, inspector words and checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment says what
// this page has. PLAN.md section 4 names the views; the ones for what is not built yet (the roosts, the town, the farms'
// fields) come with their stages.
const _fin=id=>ROCK.find(B=>B.id===id),_top=MESA_B.top;
const VIEWS=(function(){const V={},n0=_fin('fin-n0'),e1=_fin('fin-e1');
 V['Overview from the south-east, above the canopy']=[1500,560,1750,0,170,0];
 V['From afar (the knoll and the Inner Wall behind it)']=[2600,700,9000,0,600,-30000];
 if(n0)V['The north fins at roost height, over the gorge']=[n0.x+60,n0.top+20,-860,n0.x,n0.top-25,n0.z];
 if(e1)V['The east fins from the east']=[e1.x+330,e1.top+10,e1.z+90,e1.x,e1.top-30,e1.z];
 V['The Garden\'s mesa from the Crown']=[0,_top+14,-300,0,_top+90,0];
 if(GARDEN_B)V['Among the pinnacles (on the Garden\'s mesa)']=[70,GARDEN_B.top+8,95,-10,GARDEN_B.top+110,-30];
 V['The south nose (where the Stair comes down)']=[220,90,1000,0,140,560];
 V['The farm ring from the forest gate']=[0,12,PR.GATE.z+30,0,140,0];
 V['The gorge under the north rim']=[420,-20,PR.GORGE.z(420),-200,40,-700];
 V['The Inner Wall, north']=[0,_top+30,-560,0,1500,-40000];
 return V;})();

// ---------------------------------------------------------------- the inspector's words: the rock, the zone of the top or
// the floor (the settled plan), a plant's species and harvest
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item)));
 const onTop=KSTACKS.at([MESA_B],p.x,p.z)&&p.y>_top-6,Z=onTop?PR.topZoneAt(p.x,p.z):PR.zoneAt(p.x,p.z);
 const hv=PLT&&PLT.tags?PLT.tags.harvest:null;
 return(PLT?PLT.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  '\n'+(onTop?'the top: ':'the floor: ')+Z.name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the page's checks (verify.py --assert)
const BUDGET={
 showcase:{tris:16000000,calls:240},
 cls:{pass:7000000,host:1600000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
// the plan's numbers (PLAN.md section 1, the settled layout)
const HCHK={
 // the mesa: 250 m over its south foot, about 1.2 km north-south by 0.8 km
 mesa(B){const b=B.beds[B.beds.length-1],S=a=>{let m=0;for(let k=-6;k<=6;k++)m=Math.max(m,KSTACKS.footR(b,a+k*.03)*(1-b.ch));return m;};   // the widest near each axis: a gully is not the mesa's size
  const ns=S(Math.PI/2)+S(-Math.PI/2),ew=S(0)+S(Math.PI),over=B.top-floorH(0,650);
  return{ok:over>240&&over<260&&ns>1050&&ns<1350&&ew>680&&ew<920,detail:'top '+over.toFixed(0)+' m over the south foot; '+ns.toFixed(0)+' m north-south by '+ew.toFixed(0)+' m'};},
 // the fins: ten, each wholly on the top at least 12 m in from the edge, 40-90 m over it, and SPREAD round the rim (the
 // owner, 2026-10-19: not clustered): at least five of the eight compass sectors hold one, and no 250 m circle holds
 // more than three
 fins(F){const bad=[];F.forEach(B=>{const b=B.beds[0];for(let i=0;i<24;i++){const a=i/24*TAU,R=KSTACKS.footR(b,a),A=KSTACKS.at([MESA_B],b.cx+Math.cos(a)*R,b.cz+Math.sin(a)*R);
   if(!A||A.d>-12){bad.push(B.id+' near the edge');break;}}const h=B.top-_top;if(h<38||h>95)bad.push(B.id+' '+h.toFixed(0)+' m');});
  const sec=new Set(F.map(B=>Math.floor(((Math.atan2(B.z,B.x)+TAU)%TAU)/(TAU/8))));
  let crowd=0;F.forEach(A=>{crowd=Math.max(crowd,F.filter(B=>Math.hypot(A.x-B.x,A.z-B.z)<250).length);});
  return{ok:F.length===10&&!bad.length&&sec.size>=5&&crowd<=3,detail:F.length+' fins; '+sec.size+' of 8 sectors; at most '+crowd+' within 250 m'+(bad.length?'; '+bad.join(', '):'')};},
 // the Garden: a smaller, lower mesa in the middle of the top (40-70 m over it, 350-480 m across), its pinnacles on it,
 // fourteen or more, tallest at the centre (the owner, 2026-10-19: even larger): those within 100 m of its middle 180 m or
 // more on average over its top, the outer ones lower; four carry roost rings
 garden(G,GB){const gtop=GB?GB.top:0,b=GB?GB.beds[GB.beds.length-1]:null,across=b?KSTACKS.footR(b,0)+KSTACKS.footR(b,Math.PI):0,rise=GB?GB.top-_top:0;
  const on=G.filter(B=>GB&&B.y0>gtop-10),h=B=>B.top-B.y0,avg=L=>L.length?L.reduce((s,B)=>s+h(B),0)/L.length:0;
  const pin=on.filter(B=>B.kind==='spire'),inner=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)<100),outer=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)>=100),hi=avg(inner),lo=avg(outer);
  return{ok:!!GB&&rise>40&&rise<70&&across>350&&across<480&&on.length>=14&&G.filter(B=>B.ring).length===4&&hi>=180&&hi>lo+20,
   detail:'the Garden\'s mesa '+rise.toFixed(0)+' m over the top, '+across.toFixed(0)+' m across; '+on.length+' stacks on it ('+pin.length+' pinnacles); the centre\'s '+hi.toFixed(0)+
    ' m on average, the outer '+lo.toFixed(0)+' m; '+G.filter(B=>B.ring).length+' with rings'};},
 // no tree on the top (the town's ground) past its 12 m rim band, except on the Garden's stacks
 noTrees(T){const on=T.filter(t=>{const S=KSTACKS.at(ROCK,t.x,t.z);return !!S&&TOWN_GROUND.indexOf(S.S)>=0&&S.d<=-12;});
  return{ok:on.length===0,detail:on.length+' trees on the town\'s ground ('+T.length+' trees on the page)'};},
 // the forest keeps out of the farms and the bands' grounds: no hyperjungle geometry inside the palisade or a hedge
 cleared(pts){let n=0,ex=null;for(const p of pts){const Z=PR.zoneAt(p[0],p[1]).zone;if(Z==='farms'||Z==='pasture'||Z==='camp'||Z==='hedged'||Z==='fair'){n++;ex=ex||Z;}}
  return{ok:n===0&&pts.length>1000,detail:n+' forest points in the farms or a band\'s ground'+(ex?' (first in '+ex+')':'')+' of '+pts.length+' sampled'};},
 // the land is the scale model's: the page's floor at the knoll's middle and edge against WORLD.H (42)
 model(){const d=[[0,0],[1800,0],[-1800,0],[0,1800],[0,-1500]].map(q=>Math.abs(floorH(q[0],q[1])-(WORLD.H(q[0],q[1])-WORLD_H0)));
  const wall=WORLD.H(0,-48000)-WORLD_H0;
  return{ok:Math.max(...d)<.01&&wall>2500,detail:'floor = the model ('+Math.max(...d).toFixed(3)+' m off); the Inner Wall '+wall.toFixed(0)+' m over the knoll 48 km north'};}};
// where the forest STANDS, sampled: the hyperjungle's instances (every 7th) and its merged meshes' vertices within 4 m of the
// ground (a trunk's foot, a fern: a crown leaning over a hedge is not the forest inside it)
function _forestPts(){const out=[],v=new THREE.Vector3(),M=new THREE.Matrix4();
 scene.traverse(o=>{if(!o.userData||o.userData.kit!=='hyperjungle')return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i+=7){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);out.push([v.x,v.z]);}}
  else if(o.isMesh&&o.geometry&&o.geometry.attributes.position){const P=o.geometry.attributes.position;
   for(let i=0;i<P.count;i+=13){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(v.y-terrainH(v.x,v.z)<4)out.push([v.x,v.z]);}}});
 return out;}
const _fins=()=>ROCK.filter(B=>/^fin-/.test(B.id)),_garden=()=>ROCK.filter(B=>/^garden-/.test(B.id));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('the mesa: 250 m, 1.2 by 0.8 km',HCHK.mesa(MESA_B));
 add('ten fins on the rim, spread round it',HCHK.fins(_fins()));
 add('the Garden\'s mesa and its pinnacles',HCHK.garden(_garden(),GARDEN_B));
 add('no tree on the town\'s ground',HCHK.noTrees(NECANYONS.TREES||[]));
 add('the forest out of the farms and the grounds',HCHK.cleared(_forestPts()));
 add('the land is the scale model\'s',HCHK.model());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),F=_fins();
 add('the fins in one row on the north rim (as first drawn)',HCHK.fins(F.map((B,i)=>Object.assign({},B,{x:-270+i*60,z:-520}))));
 add('a fin over the edge',HCHK.fins(F.map((B,i)=>i?B:Object.assign({},B,{beds:[Object.assign({},B.beds[0],{cx:B.beds[0].cx*1.25,cz:B.beds[0].cz*1.25})]}))));
 add('a mesa 180 m high',HCHK.mesa(Object.assign({},MESA_B,{top:MESA_B.top-70})));
 add('the Garden all one height (no taller centre)',HCHK.garden(_garden().map(B=>Object.assign({},B,{top:B.y0+60})),GARDEN_B));
 add('no Garden\'s mesa (the pinnacles on the main top)',HCHK.garden(_garden(),null));
 add('a tree in the Crown',HCHK.noTrees((NECANYONS.TREES||[]).concat([{x:0,z:-300,y0:_top}])));
 add('a tree in the farms',HCHK.cleared(_forestPts().concat([[-400,800]])));   // in the fields west of the road
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'pinnacle-rock',title:'Pinnacle Rock',
 hint:'Pinnacle Rock: the Beast Riders\' roost town on a red sandstone mesa (the rock and the site; the town is to come)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},
  'the far land':{match:o=>!!(o.userData&&o.userData.far)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>({rock:KSTACKS.export(ROCK),plan:PR})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,far:()=>({rings:FAR.rings,around:FAR.around,water:FAR.water})}});
