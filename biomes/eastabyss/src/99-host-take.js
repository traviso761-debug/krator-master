// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// a view that finds its subject at build time: the hero (lv 2) of species `sp`
// nearest `anchor`, framed from `dist` m away and `h` m up, looking at a third of
// its height -- so the preset survives a reseed or a rezoning
function viewOfSpecies(sp,anchor,dist,h,az){return()=>{let best=null,bd=1e9;
 for(const T of (EASTABYSS.TREES||[])){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-anchor[0],T.z-anchor[1]);if(d<bd){bd=d;best=T;}}
 if(!best)return[anchor[0]+dist,h,anchor[1],anchor[0],4,anchor[1]];
 const a=az==null?.7:az,ty=best.y0+Math.min(best.H*.35,14);return[best.x+Math.cos(a)*dist,Math.max(terrainH(best.x+Math.cos(a)*dist,best.z+Math.sin(a)*dist)+2,best.y0+h),best.z+Math.sin(a)*dist,best.x,ty,best.z];};}
function viewOfBed(anchor,dist,h){return()=>{let best=null,bd=1e9;
 for(const B of (EASTABYSS.REEDBEDS||[])){if(B.n<120)continue;const d=Math.hypot(B.x-anchor[0],B.z-anchor[1]);if(d<bd){bd=d;best=B;}}
 if(!best)return[anchor[0]+dist,h,anchor[1],anchor[0],2,anchor[1]];return[best.x+dist*.7,h,best.z+dist*.7,best.x,1.5,best.z];};}
// the fauna (75) moves, so this preset is found when chosen: the frilled lizard nearest a flamingo flock, from a
// few metres behind it (inside 25 m, so its frill is open), looking past it at the flock
function viewOfFauna(){const L=EASTABYSS.FAUNA_LAYOUT||{},Fs=L.flocks||[],Zs=L.lizards||[],m=scene.getObjectByName('biome:frilledlizard');
 let bi=-1,bd=1e9,bf=null;Zs.forEach((Z,i)=>Fs.forEach(F=>{const d=Math.hypot(F.x-Z.x,F.z-Z.z);if(d<bd){bd=d;bi=i;bf=F;}}));
 if(bi<0||!m)return bf?[bf.x+40,6,bf.z+40,bf.x,.5,bf.z]:[1180,42,-260,-300,0,120];
 const M=new THREE.Matrix4();m.getMatrixAt(bi,M);const e=M.elements,x=e[12],y=e[13],z=e[14],d=Math.hypot(bf.x-x,bf.z-z)||1,ux=(x-bf.x)/d,uz=(z-bf.z)/d;
 return[x+ux*6.5-uz*1.5,y+1.5,z+uz*6.5+ux*1.5,bf.x,Math.max(terrainH(bf.x,bf.z),0)+.9,bf.z];}
// a skein's leader where it flies now, from below and behind its wing
function viewOfSkein(){const m=scene.getObjectByName('biome:flamingoflying');if(!m)return[1180,42,-260,-300,0,120];const M=new THREE.Matrix4();m.getMatrixAt(4,M);const e=M.elements;
 const fx=e[8],fz=e[10],l=Math.hypot(fx,fz)||1;return[e[12]-fx/l*14+fz/l*14,e[13]-6,e[14]-fz/l*14-fx/l*14,e[12]+fx/l*6,e[13],e[14]+fz/l*6];}
const VIEWS={
 'The salt lake':[1180,42,-260,-300,0,120],
 'Shore lycopsids':[690,9,-380,900,2,-300],
 'Marsh canopy from above':[1380,110,-160,1520,18,-330],
 'Calamophyton wash':[-1570,4,-290,-1440,2,-372],
 'Salt flats':[-1150,7,-140,-1500,4,180],
 'The river on the flats':[-1330,5,-290,-1460,2,-365],
 'The marsh':[1250,8,-120,1520,14,-330],
 'Marsh pools':[1180,5,70,1270,-.5,-5],
 'The east delta':[1110,22,540,800,4,300],
 'Flamingos and a frilled lizard':viewOfFauna,
 'Flamingos in flight':viewOfSkein,
 'Beard oaks':viewOfSpecies(18,[1700,0],42,7,.9),
 'Mat-reed beds':viewOfBed([1000,0],34,5),
 'Cordaites at the shore':viewOfSpecies(15,[900,-300],60,12,-.6),
 'Seal-trees':viewOfSpecies(14,[1400,100],55,12,2.4),
 'Rope araucarias':viewOfSpecies(17,[2950,200],60,16,.4),
 'Water palms':viewOfSpecies(19,[900,-150],26,5,-1.2),
 'Into the jungle':[2190,12,-80,2480,60,-180],
 'Under the scale-trees':[2560,10,160,2760,70,20],
 'The tower':[2130,30,-640,2560,110,-420],
 'Under the tower':[2620,58,-560,2560,120,-420],
 'The savannah':[3040,108,420,3260,150,160],
 'From the shelf foot':[3350,210,-60,0,20,0],
 'From afar':[-3000,260,-2300,0,40,0],
 // standing in the far ring (2 km south of the spine): the impostors up close -- the canopy
 // blobs, the small species' hulls, the sky scale-trees' iridescent boles
 'The far ring':[2060,150,1990,2400,110,2000],
 'Krator rising':[-600,30,600,1900,900,-2100],
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // a tree's volume names its species: show what it yields (biomes/FRUIT.md)
 const S=best&&EASTABYSS.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:11000000,calls:130},  // the ceiling the second pass was given (11M); measured ~7.4M before it (KNOWN_ISSUES)
 cls:{pass:8200000,host:900000},
 type:{'abyss/trees':'pass','abyss/reeds':'pass','abyss/floor':'pass','abyss/water':'pass','abyss/dress':'pass','abyss/fauna':'pass','host':'host'},
};
// species that yield something edible the kit does not draw as a catalog fruit (pith, palm heart, leaves...): named, not hidden
const FRUIT_NOT_DRAWN=['treefern','fanpalm','jade','araucaria','matreed'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // fruit: every fruiting species names a catalog piece (biomes/FRUIT.md), and fruit is drawn on the stage (the scalefruit
 // and fern-egg pods; the salt cones and tideheart heads are 'cone' items, shared with knees and whorls, so not counted)
 fruit(SP,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key),n=P.filter(p=>/:pod$/.test(p[3])).length;
  return{ok:!miss.length&&!untagged.length&&n>=100,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' pod instances drawn; catalog keys: '+EASTABYSS.FRUIT_KEYS.join(', ')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(EASTABYSS.SPECIES,P));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('a fruiting species with no catalog fruit',HCHK.fruit(EASTABYSS.SPECIES.map(S=>S.key==='seedfern'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 add('a species with no harvest tag',HCHK.fruit(EASTABYSS.SPECIES.map(S=>S.key==='skyscale'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),P));
 add('no fruit drawn',HCHK.fruit(EASTABYSS.SPECIES,P.filter(p=>!/:pod$/.test(p[3]))));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'eastabyss',title:'Krator biome — the eastern abyss',
 hint:'The eastern abyss: salt flats, salt marsh, abyssal jungle (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);if(typeof wallSky!=='undefined')wallSky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing,typeof wallSky!=='undefined'?wallSky:null]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
