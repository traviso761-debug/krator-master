// ================================================================= HOST — the Bowl's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the
// station has. The frame is the heat pass's (86: the shared sky, the world, the shimmer and the mirage).
const gh=(x,z,dy)=>Math.max(terrainH(x,z),waterH(x,z))+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z,minH){const sp=SEDESERT.SPECIES.indexOf(SEDESERT.byKey[key]);return SEDESERT.nearestTree(sp,x,z,minH)||{x,z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.8),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
// a registered halophyte tree (66 registers the heroes) nearest a point
function nearReg(key,x,z){let b=null,bd=1e9;for(const r of REG){if(r.key!==key)continue;const d=Math.hypot(r.x-x,r.z-z);if(d<bd){bd=d;b=r;}}return b||{x,z,y:gh(x,z),r:3,h:5};}
const atReg=(R,d,az)=>{const cx=R.x+Math.cos(az)*d,cz=R.z+Math.sin(az)*d;return[cx,gh(cx,cz,1.7),cz,R.x,R.y+R.h*.5,R.z];};
const D2=CHAN[3],D2M=D2.pts[Math.floor(D2.pts.length*.55)];
const TAM=nearReg('tamarisk',D2M[0]+60,D2M[1]),SAX=nearReg('saxaul',-300,zS(-300)+1700);
const VIEWS={
 'The shore at the delta':look(DELTA.x+520,zS(DELTA.x+520)+60,9,DELTA.x+300,zS(DELTA.x+300)-700,0),
 'The banded shallows':[-500,LAKE.level+70,zS(-500)+260,-250,LAKE.level,zS(-250)-1100],
 'The ochre salt rim':look(-950,zS(-950)+25,2.2,-1000,zS(-1000)-700,0),
 'The salt flat':look(-1500,zS(-1500)+560,2.4,-1900,zS(-1900)-300,0),
 'Mantis across the mirage':[-2700,gh(-2700,zS(-2700)+90,2.2),zS(-2700)+90,MANTIS.x,FAR.farH(MANTIS.x,MANTIS.z)+25,MANTIS.z],
 'The delta from the apex':[DELTA.apex[0]+120,terrainH(DELTA.apex[0]+120,DELTA.apex[1]+260)+30,DELTA.apex[1]+260,DELTA.apex[0]-60,LAKE.level,zS(DELTA.apex[0])-200],
 'A distributary':look(D2M[0]+38,D2M[1]+30,1.7,D2.pts[D2.pts.length-15][0],D2.pts[D2.pts.length-15][1],1),
 'Tamarisk on the levee':atReg(TAM,16,2.4),
 'Saxaul woods':atReg(SAX,22,1.2),
 'The halophyte belt':look(-300,zS(-300)+1750,1.8,-500,zS(-500)+500,0),
 'The kaluts':look(-2000,1300,5,-2000-WIND[0]*900,1300-WIND[1]*900,6),
 'Kaluts from the air':look(-900,2100,180,-2200,600,10),
 'Dense-air dragon trees':atTree(nearTree('dragon',-600,2200),38,.8),
 'A bottle tree the size of a baobab':atTree(nearTree('bottle',300,2500),30,2.6),
 'Dunes downwind of the flat':look(1250,1900,6,2300,2700,4),
 'From afar':[2900,LAKE.level+620,3400,-300,LAKE.level,-200],
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&SEDESERT.plantOfItem(item),S=best&&best.key&&SEDESERT.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 if(tg)name+='\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+(tg.habit?' ('+tg.habit+')':'')+
  (tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'');
 const u=uOf(p.x,p.z);
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(u<0?(-u).toFixed(0)+' m out in the lake':u.toFixed(0)+' m from the water')+')  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the station's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:150},   // measured on this station (KNOWN_ISSUES.md, "The Bowl"), not a target
 cls:{pass:7000000,host:900000},
 type:{'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;const n=(M.name||'').replace(/^biome:/,'');for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,n]);}});return o;};
const itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
// what may stand in the water: the salt reeds (the channels' shallows), the salt lumps (the ochre rim), the animals
const WET_OK=/^(saltreed|saltlump|kite|swift|strider|striderleg|lizard|deer|coyote)/;
const HALO_ITEMS={saltbush:200,glasswort:400,brinelamp:60,tamarisk:60,saxtwig:100,saltreed:200,rankgrass:100};
const HCHK={
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras over the ground'};},
 // each channel's water lies in its banks: no vertex over the ground 1.6 half-widths out either side, none under its bed
 banks(list,name){let over=0,under=0,n=0,worst=-1e9;for(const C of list){const P=C.pts,hw=C.w/2;
   for(let k=1;k<P.length-1;k++){const x=P[k][0],z=P[k][2],y=P[k][1];if(uOf(x,z)<40)continue;n++;
    const tx=P[k+1][0]-P[k-1][0],tz=P[k+1][2]-P[k-1][2],tl=Math.hypot(tx,tz)||1,nx=-tz/tl,nz=tx/tl;
    /* a bank point inside another channel (at the apex, where they part) is that channel's bed, not this one's bank */
    const side=s=>{const bx=x+s*nx*hw*1.6,bz=z+s*nz*hw*1.6,o=chanAt(bx,bz);return o.id!==C.id&&o.u<1.6?1e9:terrainH(bx,bz);},bank=Math.min(side(1),side(-1));if(bank>1e8)continue;if(y>bank+.05){over++;worst=Math.max(worst,y-bank);}if(y<terrainH(x,z)-.02)under++;}}
  return{ok:n>0&&!over&&!under,detail:name+': '+n+' vertices; '+over+' over a bank'+(over?' (worst '+worst.toFixed(2)+' m)':'')+', '+under+' under the bed'};},
 // nothing rooted under the water but what may stand in it
 dry(P,name){const bad=P.filter(p=>!WET_OK.test(p[3])&&waterH(p[0],p[2])>terrainH(p[0],p[2])+.3&&p[1]<waterH(p[0],p[2])-.2);
  return{ok:!bad.length,detail:bad.length?bad.length+' '+name+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none under the water'};},
 // the halophytes are drawn, each at least so many times, and each item names a tagged plant
 halo(N){const low=Object.keys(HALO_ITEMS).filter(k=>!(N[k]>=HALO_ITEMS[k])),untagged=Object.keys(HALO_ITEMS).filter(k=>{const P=SEDESERT.plantOfItem(k);return!P||!P.tags.harvest;});
  return{ok:!low.length&&!untagged.length,detail:Object.keys(HALO_ITEMS).map(k=>k+' '+(N[k]||0)).join(', ')+(low.length?'; TOO FEW: '+low.join(', '):'')+(untagged.length?'; untagged: '+untagged.join(', '):'')};},
 // every built tree of a dense-air species is in its habit's band (the mesquite sizes itself by the delta: left out)
 habit(TR){const A=SEDESERT.ABYSSAL,bad=[];let n=0;for(const T of TR){const S=SEDESERT.SPECIES[T.sp],a=A[S.key];if(!a||S.key==='mesquite')continue;n++;
   if(T.H>S.H[1]*a.H*1.001||T.H<S.H[0]*a.H*.999||T.rb>S.rb[1]*a.rb*1.001||T.rb<S.rb[0]*a.rb*.999)bad.push(S.key);}
  return{ok:n>0&&!bad.length,detail:n+' dense-air trees'+(bad.length?'; OUT OF THE HABIT: '+[...new Set(bad)].join(', ')+' ('+bad.length+')':', all in their habit')};}};
// the channels' lines as [x, y, z] (the flow record's points are [x, z, y])
const chanLines=()=>CHAN.map((C,ci)=>{const P=[];for(let k=0;k<C.pts.length;k++){if(uOf(C.pts[k][0],C.pts[k][1])<-25)break;P.push([C.pts[k][0],C.y[k],C.pts[k][1]]);}return{id:ci,w:C.w,pts:P};});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('preset-cameras-over-the-ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('delta: the water in its banks',HCHK.banks(chanLines(),'the delta'));
 add('nothing rooted under the water',HCHK.dry(P,'plants'));
 add('halophytes drawn and tagged',HCHK.halo(itemCounts()));
 add('dense-air habit',HCHK.habit(SEDESERT.TREES));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a camera under the salt',HCHK.camerasOut([{view:'buried',x:0,y:terrainH(0,500)-2,z:500}]));
 add('the delta raised 1.5 m over its banks',HCHK.banks(chanLines().map(C=>({id:C.id,w:C.w,pts:C.pts.map(p=>[p[0],p[1]+1.5,p[2]])})),'raised'));
 add('a saltbush out in the lake',HCHK.dry([[0,LAKE.level-1,zS(0)-600,'saltbush']],'saltbush'));
 add('no brine lamps drawn',HCHK.halo(Object.assign(itemCounts(),{brinelamp:0})));
 add('a dragon tree in its plain form',HCHK.habit([{sp:SEDESERT.SPECIES.indexOf(SEDESERT.byKey.dragon),H:SEDESERT.byKey.dragon.H[1],rb:SEDESERT.byKey.dragon.rb[1]}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
KHOST.take({build:'sedesert-bowl',title:'Krator biome — the Bowl (the eastern desert, station 2)',
 hint:'The Bowl: the south shore of the abyssal salt lake at the Bowl river 2\'s delta, 990 m under the sea (1.83 atm): the banded shallows, the ochre rim, the salt flat, the delta, the halophytes, the kaluts',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:SKY_HOUR0},draw:(s,c,dt)=>HEAT.render(dt),   /* the heat pass: the shared sky, the world, the shimmer (86) */
 clampCam(cp){const g=Math.max(terrainH(cp.x,cp.z),LAKE.level)+1.6;if(cp.y<g)cp.y=g;},
 inspect:describe,stats:()=>'inst '+window._instances+(HEAT.active?'\nheat '+HEAT.U.uK.value.toFixed(2):''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'far country':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The Bowl'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
