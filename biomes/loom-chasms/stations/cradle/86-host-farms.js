// ================================================================= HOST — STATION 1: THE YUNI FARMS AND THEIR FIELDS (PLAN.md sections 4 and 5)
// THE VILLAGE is core/hamlet's (KHAMLET.village on the Yuni row, core/hamlet/ext/21: laid in 44w as data): every record registered in core/tags
// before anything is drawn, then drawn as a STAND-IN AT ITS BOX (each is `pending`: the Yuni kit's buildings draw through the Yuni engine, which this
// page does not carry), in the Yuni's banco adobe with the Tiebele bands, the Musgum houses as tall shells, the headman's tower-house as a tower.
// THE FIELDS: one crop a field (a terrace's field id: KRELIEF.terraces), picked from kits/crops' records for the Cradle's bands (CROPS.at: temperate,
// standard air, semiarid; the bucket by the field's hash, the crop by CROPS.pick seeded by the field's id), drawn by the kit (LOOM.drawCrop) in clumps
// on the core's cell lattice near the LOD spine; past it the ground's field layer carries them.
const CRADLE=(function(){const S=STATION,V=S.VILLAGE,W=99560;
 const R=(V&&V.records)||[];
 // ---------------------------------------------------------------- the crops (kits/crops, read in place)
 const BANDS={warmth:'temperate',atm:'standard',arid:'semiarid'};
 const RESULTS=CROPS.at(BANDS).filter(r=>r.how!=='trade'&&LOOM.CROP_ITEM[r.crop.card]);
 const BUCKETS=['grain','grain','grain','pulse','spinning','spice','dye'];
 const FIELD={};   /* field id -> {crop, bucket} */
 function cropOf(id){if(FIELD[id])return FIELD[id];const h=KRAND.hash(W,CROPS.strHash(id),0x71);let b=BUCKETS[h%BUCKETS.length],p=CROPS.pick(RESULTS,b,{seed:W,salt:id});
  if(!p){b='grain';p=CROPS.pick(RESULTS,'grain',{seed:W,salt:id});}return FIELD[id]={crop:p?p.crop:null,how:p?p.how:null,bucket:b};}
 // ---------------------------------------------------------------- the village: footprints (for the mask), records, stand-ins
 const RECT=R.map(r=>({x:r.x,z:r.z,c:Math.cos(r.ry),s:Math.sin(r.ry),w:r.w/2+2,d:r.d/2+2}));
 function occupied(x,z){for(const q of RECT){const dx=x-q.x,dz=z-q.z,lx=dx*q.c-dz*q.s,lz=dx*q.s+dz*q.c;if(Math.abs(lx)<q.w&&Math.abs(lz)<q.d)return true;}return false;}
 const COL={adobe:0xb88c5e,band:0x2e2622,mud:0xa0744e,thatch:0x9a8458,wood:0x6a4e36};
 const out={records:R.length,pending:0,crops:{},clumps:0};
 function build(){if(!V||V.error){reportErr('the farms: '+(V?V.error:'no village'));return out;}
  const acc={};const add=(k,g,M)=>{(acc[k]=acc[k]||[]).push({g,M});};
  const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),DOME=new THREE.SphereGeometry(.5,12,8,0,TAU,0,Math.PI/2).scale(1,2,1),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();
  const put=(k,g,x,y,z,ry,sx,sy,sz)=>add(k,g,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),Q.clone().setFromEuler(E.set(0,ry,0)),new THREE.Vector3(sx,sy,sz)));
  for(const r of R){const ys=[[0,0],[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]].map(o=>terrainH(r.x+o[0]*r.w*Math.cos(r.ry)+o[1]*r.d*Math.sin(r.ry),r.z-o[0]*r.w*Math.sin(r.ry)+o[1]*r.d*Math.cos(r.ry)));
   const y0=Math.min(...ys)-.4,top=Math.max(...ys)+r.h;r.y0=y0;
   REGISTER({name:(KHAMLET.CULTURES.yuni.pending[r.key]||{what:r.key}).what.replace(/ \(kits\/yuni.*\)$/,'')+' (the Yuni farms, '+r.role+')',key:r.id,x:r.x,z:r.z,y:y0,r:Math.hypot(r.w,r.d)*.5,h:top-y0+1.5,
    tags:{culture:'yuni',settlement:'cradle-farms',role:r.role,pending:!!r.pending,kit:'yuni:'+r.key}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1,y0:y0-1,y1:top});if(r.pending)out.pending++;}
  for(const r of R){const y0=r.y0,H=r.h+(Math.max(0,terrainH(r.x,r.z)-y0));
   if(r.key==='poor_musgum')put('adobe',DOME,r.x,y0,r.z,r.ry,r.w*.85,H,r.d*.85);
   else if(r.key==='rich_tower_house'){put('adobe',BOX,r.x,y0,r.z,r.ry,r.w*.7,H,r.d*.7);for(let k=1;k<5;k++)put('band',BOX,r.x,y0+H*k/5,r.z,r.ry,r.w*.7+.06,.5,r.d*.7+.06);}
   else if(r.key==='prop_granary'||r.key==='prop_hangar'){put('wood',BOX,r.x,y0,r.z,r.ry,r.w*.9,H*.75,r.d*.9);put('thatch',BOX,r.x,y0+H*.75,r.z,r.ry,r.w,H*.25,r.d);}
   else if(r.key==='prop_animal_pen'){for(const s of [-1,1]){put('wood',BOX,r.x+s*r.w*.5*Math.cos(r.ry),y0,r.z-s*r.w*.5*Math.sin(r.ry),r.ry,.15,1.4,r.d);put('wood',BOX,r.x+s*r.d*.5*Math.sin(r.ry),y0,r.z+s*r.d*.5*Math.cos(r.ry),r.ry,r.w,1.4,.15);}}
   else{put(r.role==='works'?'mud':'adobe',BOX,r.x,y0,r.z,r.ry,r.w,H,r.d);put('band',BOX,r.x,y0+H*.62,r.z,r.ry,r.w+.05,.45,r.d+.05);}}
  for(const k in acc){const L=acc[k];
   /* the dome and the box share a surface name: split them so each instanced mesh has one geometry */
   const byG=new Map();for(const e of L){if(!byG.has(e.g))byG.set(e.g,[]);byG.get(e.g).push(e.M);}
   for(const [g,Ms] of byG){const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:COL[k]}),Ms.length);Ms.forEach((M,i)=>m.setMatrixAt(i,M));m.userData.host=true;m.userData.post=true;
    m.userData.inspectLabel={adobe:'Banco adobe (a stand-in: the Yuni kit\'s)',band:'Tiebele band (a stand-in)',mud:'A farm compound\'s mud wall (a stand-in)',thatch:'Thatch',wood:'Poles and frames'}[k];scene.add(m);}}
  window._farms=out;return out;}
 // ---------------------------------------------------------------- the crops, planted after the kit's ground cover (89z: LAND.build)
 function plant(){const L=BIO.LOD(),c0=BIO.cur;BIO.cur='loom-chasms/fields';let n=0;
  try{BIO.grid('crops',2.2,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0])return 0;return S.farm(x,z)>.6&&!occupied(x,z)?.85:0;},(x,y,z,seed)=>{
    const a=S.terAt(x,z);if(!a||a.part!=='tread')return;const F=cropOf(a.field);if(!F.crop)return;
    n+=LOOM.drawCrop({x,z,crop:F.crop,seed,k:KRAND.unit(KRAND.hash(seed,1,0x72))});out.crops[F.crop.id]=(out.crops[F.crop.id]||0)+1;},
   {box:[-TERR.R,-TERR.R,TERR.R,TERR.R],patch:.15,noMask:true});}
  finally{BIO.cur=c0;}out.clumps=n;out.fields=Object.keys(FIELD).length;return out;}
 // ---------------------------------------------------------------- the dangers: the river and the spring (deep, cold), the wadis' floods (owed)
 function hazards(){const H=[{name:'The spring\'s pool (deep, cold)',kind:'drown',x:S.POOL.x,z:S.POOL.z,r:S.POOL.r,h:4,y:S.POOL.level-3,danger:.5,tell:{sign:'the dark water over the vent'}}];
  for(let i=4;i<S.RLEV.length;i+=10){const p=S.RLEV[i];if(Math.abs(p[0])<TERR.R&&Math.abs(p[1])<TERR.R)H.push({name:'Aina Bruk (a cold, fast river)',kind:'drown',x:p[0],z:p[1],r:S.RIVW*.6,h:3,y:p[2]-2,danger:.45,tell:{sign:'the current over the cobbles'}});}
  return H;}
 // ---------------------------------------------------------------- the station's checks, each with a broken input
 const CK={
  village(V){const ok=!!V&&!V.error&&V.records.length>8&&V.records.every(r=>r.pending)&&V.culture==='yuni';
   return{ok,detail:V&&!V.error?V.records.length+' Yuni records (pop '+V.census.pop+', '+V.census.households+' households), every one pending: drawn as stand-ins':'no village: '+(V?V.error:'none')};},
  crops(F){const ids=CROPS.at(BANDS).map(r=>r.crop.id),bad=Object.values(F).filter(f=>f.crop&&ids.indexOf(f.crop.id)<0),n=Object.keys(F).length;
   return{ok:n>0&&!bad.length,detail:bad.length?bad.length+' fields growing a crop the Cradle\'s bands do not ('+bad[0].crop.id+')':n+' fields, each a crop kits/crops gives the Cradle\'s bands: '+[...new Set(Object.values(F).map(f=>f.crop&&f.crop.id))].join(', ')};},
  water(L){let up=0;for(let i=1;i<L.length;i++)if(L[i][2]>L[i-1][2]+1e-6)up++;return{ok:L.length>2&&!up,detail:up?up+' places Aina Bruk climbs downstream':L.length+' points, the water never climbing downstream ('+L[0][2].toFixed(1)+' to '+L[L.length-1][2].toFixed(1)+' m)'};}};
 function checks(add){add('the Yuni farms are core/hamlet records (the Yuni row), pending stand-ins',CK.village(V));add('every field\'s crop fits the Cradle\'s bands (kits/crops)',CK.crops(FIELD));add('Aina Bruk runs downhill',CK.water(S.RLEV));}
 function negatives(add){add('a village with no culture row',CK.village(KHAMLET.village({id:'x',world:1,culture:'nonesuch',focus:'farming',site:{x:0,z:0}})));
  const hot=CROPS.LIST.find(c=>CROPS.at(BANDS).every(r=>r.crop.id!==c.id));add('a field of a crop from another climate',CK.crops({x:{crop:hot}}));
  add('a river climbing',CK.water([[0,0,10],[10,0,9],[20,0,11]]));}
 // ---------------------------------------------------------------- the views
 function views(H){const {look}=H,P=S.POOL,Vs=V&&V.site?V.site:{x:0,z:0},PX=S.PX,head=R.find(r=>r.key==='rich_tower_house')||R[0]||{x:Vs.x,z:Vs.z};
  const mid=S.RLEV[Math.floor(S.RLEV.length*.35)],mid2=S.RLEV[Math.floor(S.RLEV.length*.6)];
  return{
  'The spring of Aina Bruk':look(P.x-P.r*2.4,P.z+P.r*1.8,1.8,P.x+60,P.z-10,0),
  'The fields from the village':look(Vs.x+40,Vs.z-70,6,Vs.x+700,Vs.z-500,0),
  'The Yuni farms':look(head.x-90,head.z+70,4,head.x,head.z,6),
  'Along Aina Bruk':[mid[0]-40,mid[2]+4,mid[1]+30,mid2[0],mid2[2],mid2[1]],
  'The road east':look(PX(1558.6,1140.35)[0]-30,PX(1558.6,1140.35)[1]+12,1.8,PX(1559.5,1140.12)[0],PX(1559.5,1140.12)[1],2),
  'Down the dry wadi':look(S.APA[3][0],S.APA[3][1]+25,2,P.x,P.z,0),
  'The Stalker Range from the fan':look(-1500,-200,3,-120000,0,4000),
  'From afar':look(2700,2700,350,-200,-600,0)};}
 return{build,plant,occupied,hazards,checks,negatives,views,FIELD,RESULTS};})();
