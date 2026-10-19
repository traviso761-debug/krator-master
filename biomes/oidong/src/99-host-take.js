// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has.
// the presets are FOUND on the map rather than typed: the best point of each zone near the spine, and a tree preset
// frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>OIDONG.SPECIES.indexOf(OIDONG.byKey[k]);
const SCORES={
 moss:(Z,ld)=>Z.moss-ld/3000,meadow:(Z,ld)=>Z.meadow-ld/3000,shore:(Z,ld)=>Z.shore-ld/3000,flats:(Z,ld)=>Z.flats-ld/3000,
 bamboo:(Z,ld)=>Z.bamboo-ld/3000,terrace:(Z,ld)=>Z.terrace*(1-Z.crag)-ld/3000,mist:(Z,ld)=>Z.mistZ-ld/3000,grove:(Z,ld)=>Z.grove*(Z.moss+Z.mistZ)-ld/3000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=50)for(let x=-2400;x<=2400;x+=50){if(Math.hypot(x,z)>2350)continue;if(BIO.mask(x,z)<=0)continue;const Z=OIDONG.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
function nearTree(key,x,z,minH){return OIDONG.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),Math.max(T.y0,waterH(cx,cz))+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const M0=POOLS[0],L1=POOLS[2];
const VIEWS={
 'The Mirror':(function(){const x=M0.x+M0.r*1.1,z=M0.z-M0.r*1.5;return[x,Math.max(gh(x,z,6),M0.l+48),z,M0.x-M0.r*.2,M0.l+1,M0.z+M0.r*.1];})(),
 'Giant lotuses':atTree(nearTree('giantlotus',L1.x,L1.z,6),22,2.2,5,.55),
 'The lotus pool from the rock':(function(){const x=KNOLL.x-30,z=KNOLL.z+KNOLL.r*.55;return[x,gh(x,z,5),z,L1.x,L1.l+1.5,L1.z];})(),
 'The moss garden':across(P.moss[0],P.moss[1],-1.2,50,2,4),
 'A sacred fig':atTree(nearTree('bodhi',P.meadow[0],P.meadow[1],14),30,.8,3,.55),
 'Cherry blossom':atTree(nearTree('cherry',P.shore[0],P.shore[1],7),16,2.4,2.5,.6),
 'The marble grove':atTree(nearTree('marblebirch',P.grove[0],P.grove[1],18),22,1.1,3,.45),
 'Chalice trees in the mist':atTree(nearTree('chalice',P.mist[0],P.mist[1],16),40,2.6,6,.7),
 'Bell-pod willows':atTree(nearTree('bellpod',P.shore[0],P.shore[1],4),9,.6,2,.6),
 'The bamboo grove':atTree(nearTree('bamboo',P.bamboo[0],P.bamboo[1],12),11,.4,2,.5),
 'Moss-ball trees':atTree(nearTree('mossball',P.moss[0],P.moss[1],7),16,-.5,3,.6),
 'Wisteria at the shore':atTree(nearTree('wisteria',P.shore[0],P.shore[1],6),14,1.8,2.5,.6),
 'A lotus trumpet':atTree(nearTree('lotustrumpet',P.shore[0],P.shore[1],10),20,2.9,4,.6),
 'The raked flats':(function(){const F=FANS[1];return look(F.x-F.rx*.7,F.z+F.rz*1.1,9,F.x+60,F.z-40,1);})(),
 'Cloud pines on the flats':atTree(nearTree('cloudpine',FANS[0].x,FANS[0].z,6),14,2.0,2.5,.6),
 'Peyote and stone-blooms':(function(){const x=P.flats[0],z=P.flats[1];return[x,gh(x,z,1.4),z,x+4,gh(x+4,z-3,.05),z-3];})(),
 'Sky poppies on the terraces':across(P.terrace[0],P.terrace[1],2.2,18,1.6,1.5),
 "Longsong's rock":look(KNOLL.x+KNOLL.r*2.6,KNOLL.z+KNOLL.r*1.6,18,KNOLL.x,KNOLL.z,KNOLL.h*.6),
 'The cataract':look(CATARACT.x-620,CATARACT.z+260,70,CATARACT.x,CATARACT.z,45),
 'From afar':look(-2300,axisZ(-2300)+900,240,600,axisZ(600),40),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&OIDONG.plantOfItem(item);
 const S=best&&best.key&&OIDONG.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const marks=tg?(tg.holy?' · HOLY':'')+(tg.alien?' · alien':'')+(tg.shared?' · shared with '+tg.shared:''):'';
 const cls=S||isItem?'flora · Oidong Valley'+marks:'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (S&&S.how?'\n'+S.how:'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nin the mist '+(FIELD.mist(p.x,p.z)*100|0)+'% · wet '+(FIELD.wet(p.x,p.z)*100|0)+'%\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:19500000,calls:130},   // a ceiling to measure against on this 5.2 km map, not a target
 cls:{pass:15500000,host:1200000},
 type:{'oidong/trees':'pass','oidong/floor':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// what may stand in or under the water: the pads, the flowers and seed heads on them, the reeds, and the stalks (rods)
// that run from the mud to the pads
const WATERY=/^biome:(rod|lilypad|giantpad|giantpadlo|giantcup|giantcuplo|cup|lily|lotuspod|giantpod|reed|thread)$/;
const satOf=hex=>{const c=new THREE.Color(hex),h={};c.getHSL(h);return h.s;};
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=OIDONG.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===OIDONG.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species and floor plant carries its tags, the Koppen classes inside the region's, and a harvest record
 tagged(SP,PL){const reg=Object.keys(OIDONG.KOPPEN),bad=[];
  for(const S of SP.concat(PL)){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||t.holy==null||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged, or tagged outside the region: '+bad.join(', '):SP.length+' species and '+PL.length+' floor plants tagged'};},
 // A CALM PALETTE: every species' leaf set and bark set sits low in saturation (the pastel rule); only the iridescent
 // second colours may be loud
 calm(SP){const bad=[];for(const S of SP){const s=S.leaf.concat(S.bark).reduce((a,h)=>a+satOf(h),0)/(S.leaf.length+S.bark.length);if(s>.5)bad.push(S.key+' '+s.toFixed(2));}
  return{ok:!bad.length,detail:bad.length?'too loud: '+bad.join(', '):SP.length+' species under .5 mean saturation'};},
 // the holy plants are here: at least one of each
 holy(C){const h=OIDONG.SPECIES.filter(S=>S.tags.holy),missing=h.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:h.length>=3&&!missing.length,detail:missing.length?'holy plants never placed: '+missing.join(', '):h.length+' holy species placed'};},
 // the giant lotuses stand in the water, and in nothing else
 lotus(T){const g=T.filter(t=>t.sp===SPI('giantlotus')),bad=g.filter(t=>BIO.depth(t.x,t.z)<.3);
  return{ok:g.length>0&&!bad.length,detail:bad.length?bad.length+' giant lotuses out of the water (first at '+[bad[0].x|0,bad[0].z|0]+')':g.length+' giant lotuses, every one in a pool'};},
 // THE STONES STAND IN ODD GROUPS: three, five or seven, never an even number
 odd(G){const bad=G.filter(g=>[3,5,7].indexOf(g.n)<0);return{ok:G.length>0&&!bad.length,detail:bad.length?bad.length+' groups of an even number':G.length+' groups, all of three, five or seven'};},
 // nothing is planted on Longsong's rock
 rock(T){const bad=T.filter(t=>Math.hypot(t.x-KNOLL.x,t.z-KNOLL.z)<150);return{ok:!bad.length,detail:bad.length?bad.length+' trees on the monastery\'s site':T.length+' trees, none on the rock'};},
 // nothing roots under the water but what belongs there
 dry(P){const bad=P.filter(p=>{if(WATERY.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a sheer rock face
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+OIDONG.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 // every catalogued fruit is drawn: the item that draws it has instances on the stage
 fruit(P){const keys=OIDONG.FRUIT_KEYS,items=Object.values(OIDONG.FRUIT_ITEM),missing=items.filter(it=>!P.some(p=>p[3]==='biome:'+it));
  return{ok:keys.length>=3&&!missing.length,detail:missing.length?'fruit never drawn: '+missing.join(', '):keys.length+' catalog fruit, each drawn'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),Pp=instPoints();
 add('every species placed',HCHK.placed(OIDONG.COUNTS||[]));
 add('every plant tagged, in the region, with a harvest',HCHK.tagged(OIDONG.SPECIES,Object.values(OIDONG.PLANTS)));
 add('a calm palette: every species pastel',HCHK.calm(OIDONG.SPECIES));
 add('the holy plants are here',HCHK.holy(OIDONG.COUNTS||[]));
 add('the giant lotuses stand in the water',HCHK.lotus(OIDONG.TREES));
 add('the stones stand in odd groups',HCHK.odd(OIDONG.STONES));
 add("nothing planted on Longsong's rock",HCHK.rock(OIDONG.TREES));
 add('nothing rooted under the water',HCHK.dry(Pp));
 add('no tree on a sheer rock face',HCHK.cliffs(OIDONG.TREES));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(Pp));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),Pp=instPoints();
 const C=(OIDONG.COUNTS||[]).slice();C[SPI('maple')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no harvest',HCHK.tagged(OIDONG.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:null})}):S),[]));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},OIDONG.SPECIES[0],{tags:Object.assign({},OIDONG.SPECIES[0].tags,{koppen:['Af']})})],[]));
 add('a loud species',HCHK.calm([Object.assign({},OIDONG.SPECIES[2],{leaf:[0xff2080,0xff0040,0xff3090],bark:[0xff4000]})]));
 const C2=(OIDONG.COUNTS||[]).slice();C2[SPI('bodhi')]=0;add('a holy plant never placed',HCHK.holy(C2));
 add('a giant lotus on dry land',HCHK.lotus([{sp:SPI('giantlotus'),x:FANS[1].x,z:FANS[1].z}]));
 add('a group of four stones',HCHK.odd([{x:0,z:0,n:4,r:3}]));
 add('a tree on the rock',HCHK.rock([{x:KNOLL.x,z:KNOLL.z,sp:0}]));
 add('a plant on the pool bed',HCHK.dry([[POOLS[0].x,POOLS[0].l-2.5,POOLS[0].z,'biome:fern']]));
 {let bx=KNOLL.x,bz=KNOLL.z,bs=-1;for(let z=KNOLL.z-220;z<=KNOLL.z+220;z+=4)for(let x=KNOLL.x-220;x<=KNOLL.x+220;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the rock\'s sheer face',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a catalogued fruit never drawn',HCHK.fruit(Pp.filter(p=>p[3]!=='biome:giantpod')));
 add('a camera under the Mirror',HCHK.camerasOut([{view:'under',x:POOLS[0].x,y:POOLS[0].l-5,z:POOLS[0].z}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'oidong',title:'Krator biome — the Oidong Valley',
 hint:"The Oidong Valley east of Xanadu: the History Monks' country, the safest ground on Krator. Still pools with giant lotuses, moss woods, cherry and haze blossom, a marble grove, chalice trees in the mist at the head, pale flats the wind rakes round standing stones; the holy plants and the monks' physic grow wild (ideal type)",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The Oidong Valley'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 stones:()=>OIDONG.STONES,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=OIDONG.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
