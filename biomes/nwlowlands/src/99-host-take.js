// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// Preset views. Most are FOUND, not typed: viewTree() looks up the nearest
// near-detail tree of a species to a point on the (s,t) axis and frames it from
// the sun side, so a view still lands on its subject when the placement moves.
const SUNH=(()=>{const l=Math.hypot(-1200,-600);return[-1200/l,-600/l];})();
function viewTree(key,s,t,dist,h,look,side){const sp=NWLOW.SPECIES.findIndex(S=>S.key===key),o=xzOf(s,t);let best=null,bd=1e9;
 for(const T of NWLOW.TREES){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-o[0],T.z-o[1]);if(d<bd){bd=d;best=T;}}
 if(!best)return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];
 const R=Math.max(best.spread||0,best.crownR),D=dist*R,a=Math.atan2(SUNH[1],SUNH[0])+(side||0),cx=best.x+Math.cos(a)*D,cz=best.z+Math.sin(a)*D;
 return[cx,terrainH(cx,cz)+h,cz,best.x,best.y0+best.H*look,best.z];}
function viewAxis(s0,t0,h0,s1,t1,h1){const a=xzOf(s0,t0),b=xzOf(s1,t1);return[a[0],terrainH(a[0],a[1])+h0,a[1],b[0],terrainH(b[0],b[1])+h1,b[1]];}
// a bamboo grove near (s,t): the point of highest grove weight within ~700 m.
// inside: stand in it looking along; edge: stand outside it looking in
function viewGrove(s0,t0,inside){let best=null,bw=.35;
 for(let ds=-700;ds<=700;ds+=25)for(let dt=-700;dt<=700;dt+=25){const p=xzOf(s0+ds,t0+dt),w=NWLOW.zones(p[0],p[1]).bamboo-Math.hypot(ds,dt)*.00015;if(w>bw&&terrainH(p[0],p[1])>.5){bw=w;best=p;}}
 if(!best){const o=xzOf(s0,t0);return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];}
 if(inside){const b2=[best[0]+25,best[1]+10];return[best[0],terrainH(best[0],best[1])+1.7,best[1],b2[0],terrainH(b2[0],b2[1])+19,b2[1]];}
 // walk out from the interior along the sun direction until the grove weight falls away, then back off
 let x=best[0],z=best[1];for(let k=0;k<60;k++){x+=SUNH[0]*8;z+=SUNH[1]*8;if(NWLOW.zones(x,z).bamboo<.02)break;}x+=SUNH[0]*75;z+=SUNH[1]*75;
 return[x,terrainH(x,z)+3,z,best[0],terrainH(best[0],best[1])+20,best[1]];}
const VIEWS={
 'The ghost-gum avenue':(()=>{const a=xzOf(-985,ROAD_T(-985)),b=xzOf(-800,ROAD_T(-800));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+22,b[1]];})(),
 'Glow-willow':viewTree('glowwillow',-500,0,1.9,3,.4,.3),
 'Among the lanterns':viewTree('glowwillow',-300,100,.45,1.7,.3,.9),
 'In a bamboo grove':viewGrove(-700,0,true),
 'A bamboo grove':viewGrove(-700,0,false),
 'Sky meranti':viewTree('meranti',-1500,0,.9,2,.7,.3),
 'The lake shore':viewTree('paperbark',-1850,-100,3.5,2.5,.35,.6),
 'Candle birches':viewTree('birch',-300,-200,2.5,1.8,.55,.3),
 'Spire cedars':viewTree('spire',-200,200,2.4,2,.6,.3),
 'Column kauri':viewTree('kauri',-900,-300,1.1,2,.65,.3),
 'Sea pens':viewTree('bluegum',-200,0,.8,1.3,.08,.5),
 'Tower ash':viewTree('towerash',1400,0,1.4,3,.7,.3),
 'Grass trees and banksia':viewTree('grasstree',1500,0,4,2,.5,.3),
 'Crag pines':viewTree('cragpine',1900,0,2.5,8,.6,.3),
 'The tower':[40-150,terrainH(-110,-560)+40,-470-90,40,110,-470],
 'From the foothills':viewAxis(2400,100,90,-1500,-100,0),
 'From afar':viewAxis(3000,2200,420,-400,0,0),
 'Krator rising':viewAxis(-400,-200,30,1200,1400,900),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // a tree's volume names its species: show what it yields (biomes/FRUIT.md)
 const S=best&&NWLOW.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 // held in memory (the heroes' and the groves' lite stand-ins included) / drawn at any one camera, with the
 // runtime LOD / draw calls (KNOWN_ISSUES, BUDGET). Measured Oct 2026: 9.59M held; 1.2-6.4M drawn at the presets
 // checked (renderer.info; BIO.lodShown counts the chunk meshes only, 0.2-5.7M over the 18 presets) in 89-284
 // calls. Before the LOD every camera drew all 9.9M in ~63 calls. `rendered` is tracked, not asserted by verify.py.
 showcase:{tris:10000000,calls:400,rendered:7500000},
 cls:{pass:7500000,host:900000},
 type:{'nwlow/trees':'pass','nwlow/floor':'pass','nwlow/dress':'pass','host':'host'},
};
// species that yield something edible the kit does not draw as a catalog fruit: named, not hidden. The wattle pods,
// ginkgo seeds and kauri cones are not drawn and have no catalog piece (biomes/FRUIT.md); the rest are hearts,
// shoots, fiddleheads, sap and nectar.
const FRUIT_NOT_DRAWN=['wattle','ginkgo','kauri','mistpalm','treefern','birch','grasstree','skybamboo'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // fruit: every fruiting species names a catalog piece (biomes/FRUIT.md), and fruit is drawn on the stage (the 'pompom'
 // items: the pandan key heads and the banksia candles, with the floor's ginger heads)
 fruit(SP,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key),n=P.filter(p=>/:pompom$/.test(p[3])).length;
  return{ok:!miss.length&&!untagged.length&&n>=100,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' pompom instances drawn; catalog keys: '+NWLOW.FRUIT_KEYS.join(', ')+'; not drawn: '+FRUIT_NOT_DRAWN.join(', ')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(NWLOW.SPECIES,P));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('a fruiting species with no catalog fruit',HCHK.fruit(NWLOW.SPECIES.map(S=>S.key==='pandan'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 add('a species with no harvest tag',HCHK.fruit(NWLOW.SPECIES.map(S=>S.key==='banksia'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),P));
 add('no fruit drawn',HCHK.fruit(NWLOW.SPECIES,P.filter(p=>!/:pompom$/.test(p[3]))));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'nwlowlands',title:'Krator Northwestern Lowlands',
 hint:'The northwestern lowlands: lake shore, rainforest strip, subtropical forest and bamboo groves, Mediterranean foothills (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);if(typeof wallSky!=='undefined')wallSky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing,typeof wallSky!=='undefined'?wallSky:null]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
