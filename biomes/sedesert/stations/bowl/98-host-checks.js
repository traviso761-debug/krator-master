// ================================================================= HOST — the inspector's words and the probe's checks (the Bowl's stations, shared)
// verify.py --assert runs hostChecks and hostNegatives (each negative must fail); a station's 99-host-take.js hands them to core/host
// with its views. STATION.halo (the halophytes a station must draw, and how many at least) and STATION.budget are the station's.
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
 showcase:STATION.budget||{tris:14000000,calls:150},   // measured on this station (KNOWN_ISSUES.md, "The Bowl"), not a target
 cls:STATION.cls||{pass:7000000,host:900000},
 type:Object.assign({'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','host':'host'},STATION.types||{}),
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;const n=(M.name||'').replace(/^biome:/,'');for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,n]);}});return o;};
const itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
// what may stand in the water: the salt reeds (the channels' shallows), the salt lumps (the ochre rim), the animals
const WET_OK=/^(saltreed|saltlump|kite|swift|strider|striderleg|lizard|deer|coyote)/;
const HALO_ITEMS=STATION.halo||{saltbush:200,glasswort:400,brinelamp:60,tamarisk:60,saxtwig:100,saltreed:200,rankgrass:100};
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
 habit(TR){const A=SEDESERT[STATION.habitKey||'ABYSSAL'],bad=[];let n=0;for(const T of TR){const S=SEDESERT.SPECIES[T.sp],a=A[S.key];if(!a||S.key==='mesquite')continue;n++;
   if(T.H>S.H[1]*a.H*1.001||T.H<S.H[0]*a.H*.999||T.rb>S.rb[1]*a.rb*1.001||T.rb<S.rb[0]*a.rb*.999)bad.push(S.key);}
  return{ok:n>0&&!bad.length,detail:n+' dense-air trees'+(bad.length?'; OUT OF THE HABIT: '+[...new Set(bad)].join(', ')+' ('+bad.length+')':', all in their habit')};}};
// the channels' lines as [x, y, z] (the flow record's points are [x, z, y])
const chanLines=()=>CHAN.map((C,ci)=>{const P=[];for(let k=0;k<C.pts.length;k++){if(uOf(C.pts[k][0],C.pts[k][1])<-25)break;P.push([C.pts[k][0],C.y[k],C.pts[k][1]]);}return{id:ci,w:C.w,pts:P};});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('preset-cameras-over-the-ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(!STATION.dryChannels)add('delta: the water in its banks',HCHK.banks(chanLines(),'the delta'));
 add('nothing rooted under the water',HCHK.dry(P,'plants'));
 add('halophytes drawn and tagged',HCHK.halo(itemCounts()));
 add('dense-air habit',HCHK.habit(SEDESERT.TREES));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a camera under the salt',HCHK.camerasOut([{view:'buried',x:0,y:terrainH(0,500)-2,z:500}]));
 if(!STATION.dryChannels)add('the delta raised 1.5 m over its banks',HCHK.banks(chanLines().map(C=>({id:C.id,w:C.w,pts:C.pts.map(p=>[p[0],p[1]+1.5,p[2]])})),'raised'));
 {const P=STATION.noLake&&STATION.pools&&STATION.pools[0];add(P?"a saltbush in the pan's water":'a saltbush out in the lake',HCHK.dry([P?[P.x,P.level-1,P.z,'saltbush']:[0,LAKE.level-1,zS(0)-600,'saltbush']],'saltbush'));}
 {const k=Object.keys(HALO_ITEMS)[0];add('none of the '+k+' drawn',HCHK.halo(Object.assign(itemCounts(),{[k]:0})));}
 add('a dragon tree in its plain form',HCHK.habit([{sp:SEDESERT.SPECIES.indexOf(SEDESERT.byKey.dragon),H:SEDESERT.byKey.dragon.H[1],rb:SEDESERT.byKey.dragon.rb[1]}]));
 return R;}
