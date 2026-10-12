// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
const VIEWS={
 'Over the Vale':[260,520,-3000,-80,60,700],
 'The pleasure dome':[-760,150,-640,-1000,110,-380],
 'The sacred river':[520,40,-160,300,20,300],
 'The vale':[-120,90,-40,-300,50,700],
 'The river bend':[40,120,1300,-200,80,1620],
 'The chasm':[-560,190,2080,-900,150,2040],
 'The fountain':[-1100,240,1840,-1350,190,2010],
 'The green flank':[-1700,160,-420,-2300,120,-100],
 'The garden ridge':[-800,260,1150,-1150,200,900],
 'The eastern plateau':[1300,300,500,1800,230,1000],
 'The island':[420,40,-1480,160,20,-1680],
 'The lake shore':[-300,14,-620,100,6,-760],
 'The river mouth':[760,20,-280,620,6,-420],
 'From the mountains':[-900,900,2900,0,100,0],
 'Krator rising':[-900,30,-600,1890,1300,-610],
};
// views found in the built scene: along the river, at a fairy ring, down a hornbeam alley, at the lotus trumpets and the redwoods in the water
(function(){const G=(x,z)=>terrainH(x,z);
 const riv=(f)=>{const i=Math.round(f*(RIV.P.length-1)),p=RIV.P[i],q=RIV.P[Math.max(0,i-8)];return{p,q,y:RIV.bed[i]+.65};};
 {const a=riv(.27),b=riv(.2);VIEWS['The chasm']=[a.p[0],a.y+9,a.p[1],b.p[0],b.y+14,b.p[1]];}
 {const a=riv(.05);VIEWS['The fountain']=[a.p[0],a.y+22,a.p[1],RIV.P[0][0],RIV.bed[0]+34,RIV.P[0][1]];}
 {const a=riv(.78),b=riv(.9),dx=b.p[0]-a.p[0],dz=b.p[1]-a.p[1],l=Math.hypot(dx,dz);VIEWS['The sacred river']=[a.p[0]-dx/l*40,a.y+16,a.p[1]-dz/l*40,b.p[0],b.y+4,b.p[1]];}
 const near=(list,f)=>{let best=null,bd=1e9;list.forEach(o=>{if(f&&!f(o))return;const d=BIO.lodD(o.x,o.z);if(d<bd){bd=d;best=o;}});return best;};
 const R=near(XANADU.RINGS);if(R){const a=.7,cx=R.x+Math.cos(a)*R.r*2.6,cz=R.z+Math.sin(a)*R.r*2.6;VIEWS['A fairy ring']=[cx,G(cx,cz)+7,cz,R.x,G(R.x,R.z)+3,R.z];}
 const A=near(XANADU.ARCHES);if(A){const ux=Math.cos(A.a),uz=Math.sin(A.a),L=(A.n/2+.6)*9.5,cx=A.x-ux*L,cz=A.z-uz*L;VIEWS['The hornbeam arches']=[cx,G(cx,cz)+2.2,cz,A.x+ux*L,G(A.x+ux*L,A.z+uz*L)+11,A.z+uz*L];}
 // a specimen view: the most open-standing hero of the species, from the side whose sightline no other crown crosses
 const HT=new Map();XANADU.TREES.forEach(T=>{const k=Math.floor(T.x/50)+','+Math.floor(T.z/50);(HT.get(k)||HT.set(k,[]).get(k)).push(T);});
 const around=(x,z,r)=>{const o=[];for(let i=Math.floor((x-r)/50);i<=Math.floor((x+r)/50);i++)for(let j=Math.floor((z-r)/50);j<=Math.floor((z+r)/50);j++){const L=HT.get(i+','+j);if(L)L.forEach(T=>{if(Math.hypot(T.x-x,T.z-z)<r)o.push(T);});}return o;};
 const blockedLine=(T,cx,cz,me)=>{for(const O of around((T.x+cx)/2,(T.z+cz)/2,Math.hypot(T.x-cx,T.z-cz)/2+12)){if(O===me)continue;const dx=cx-T.x,dz=cz-T.z,l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((O.x-T.x)*dx+(O.z-T.z)*dz)/l2));if(Math.hypot(T.x+dx*t-O.x,T.z+dz*t-O.z)<(O.crownR||3)*.8+1)return true;}return false;};
 const specimen=(k,dist,h)=>{const C=XANADU.TREES.filter(T=>T.sp===k&&T.lv===2&&BIO.clearOf(T.x,T.z,25));let best=null;
  C.slice(0,400).forEach(T=>{const crowd=around(T.x,T.z,dist+10).length;if(best&&crowd>=best.crowd)return;
   for(let q=0;q<16;q++){const a=q/16*TAU,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(G(cx,cz)<.5||blockedLine(T,cx,cz,T))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,Math.max(G(best.cx,best.cz),0)+h,best.cz,T.x,T.y0+T.H*.5,T.z];};
 [[2,'The lotus trumpets',34,7],[9,'Wisteria',26,3],[3,'A cloud pine',22,5],[4,'Cushion trees',26,4],[6,'The agate tree',34,4],[20,"Traveller's palm",22,4],[10,'Persian ironwood',28,5],[18,'Haze blossom',24,4],[31,'Flame cypress',30,6],[32,'Strawberry tree',16,3],[1,'A ginkgo',30,5],[16,'A bottle palm',14,3]].forEach(v=>{const r=specimen(v[0],v[2],v[3]);if(r)VIEWS[v[1]]=r;});
 {const T=near(XANADU.TREES,T=>T.sp===0&&T.lv===2&&BIO.field('wet',T.x,T.z)>.84);if(T){const r=specimen(0,60,4);if(r)VIEWS['Dawn redwoods']=[r[0],r[1],r[2],T.x,T.y0+T.H*.45,T.z];}}
 {const x=-1000,z=-400,a=.9,cx=x+Math.cos(a)*95,cz=z+Math.sin(a)*95;VIEWS['The pleasure dome']=[cx,G(cx,cz)+26,cz,x,(DOME.y0||G(x,z))+9,z];}
 ['The vale','The lake shore','The garden ridge','The green flank'].forEach(k=>{const v=VIEWS[k];if(v)v[1]=Math.max(v[1],G(v[0],v[2])+(k==='The lake shore'?24:40));});
})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the harvest tag (biomes/FRUIT.md): a small plant's by its item, else the species of the tree it is under
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&XANADU.plantOfItem?XANADU.plantOfItem(item):null;
 const S=best&&XANADU.SPECIES?XANADU.SPECIES.find(s=>s.name===best.name):null,hv=PLT?PLT.tags.harvest:(S&&S.tags.harvest);
 if(PLT)name=PLT.name+'  ·  '+name;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:30000000,calls:600,rendered:14000000},   // held in memory (the hero trees' stand-ins included) / drawn at any one camera, with the runtime LOD (KNOWN_ISSUES)
 cls:{pass:19000000,host:900000},
 type:{'xanadu/trees':'pass','xanadu/floor':'pass','xanadu/dress':'pass','host':'host'},
};
// ---------------------------------------------------------------- the host's own checks (verify.py runs them), each with a broken input that must fail
// species and plants that yield something edible the kit does not draw as a catalog fruit (seeds, petals, nuts...): named, not hidden
const FRUIT_NOT_DRAWN=['ginkgo','lotustrumpet','ringbeech','wisteria','hyrcanoak','travelers','cloudfern','maquis'];
// the instanced items on the stage, by item name, counted
const itemCounts=()=>{const n={};scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;const k=(M.name||'').replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // drawn); every catalog fruit's item is on the stage, the olives and the lotus seed heads among them
 fruit(SP,PL,N){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key)
   .concat(Object.keys(PL).filter(k=>PL[k].tags.harvest&&PL[k].tags.harvest.edible.length&&!PL[k].tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(k)<0));
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const fr=SP.filter(S=>S.tags.harvest&&S.tags.harvest.fruit).map(S=>S.key).concat(Object.keys(PL).filter(k=>PL[k].tags.harvest&&PL[k].tags.harvest.fruit));
  const undrawn=fr.filter(k=>!(N[XANADU.FRUIT_ITEM[k]]>0));
  return{ok:!miss.length&&!untagged.length&&!undrawn.length&&fr.length>=9,
   detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(undrawn.length?'fruit not drawn: '+undrawn.join(', ')+'; ':'')+
    fr.length+' fruiting species and plants, '+XANADU.FRUIT_KEYS.length+' catalog keys; whorl olives '+(N.whorlolive||0)+', lotus seed heads '+(N.lotuspod||0)+', pods '+(N.pod||0)+', fruit balls '+(N.ball||0)+', pitaya '+(N.pitayafruit||0)+', catkins '+(N.catkin||0)}}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(XANADU.SPECIES,XANADU.PLANTS,itemCounts()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=itemCounts();
 add('a fruiting species with no catalog fruit',HCHK.fruit(XANADU.SPECIES.map(S=>S.key==='cacao'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),XANADU.PLANTS,N));
 add('no whorl olives drawn',HCHK.fruit(XANADU.SPECIES,XANADU.PLANTS,Object.assign({},N,{whorlolive:0})));
 add('a plant with no harvest tag',HCHK.fruit(XANADU.SPECIES,Object.assign({},XANADU.PLANTS,{lotus:{name:'Lotus',items:[],tags:{}}}),N));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'xanadu',title:'Krator biome — Xanadu',
 hint:'Xanadu, the Vale in the East Rift Highlands: an enclosed mountain lake, the sacred river from its chasm, ornamental wildwood, the Mediterranean uplands (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,itemCounts,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
