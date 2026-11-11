// ================================================================= HOST — the valley's city stage: the towers on the ground, the tiers, the lines
// [web] What kits/metropolis's test stage (its 70-mp-stage.js) does on a flat plain, done here on the valley's ground: every tower of the station's
// plan (STAGE.plan, 41-av-field.js: a record with its own y) is a core/tags record; the shells and the impostors of the two shelled families are
// baked at load from the heroes (KSHELL, BIO.impostor); then each frame the nearest towers are heroes (a pool, the dither at 300 m), the rest to
// 1.4 km baked shells, past that impostors, with the ruins' rubble to 1 km and coarse to 3.2 km (PLAN-ANOMALIES.md section 13's tiers). A design
// with no shell (the Terrace, the Long Curve...) stands only as a hero, so the plan keeps them round the eye's start. The lines (the viaduct) are
// instanced piers and decks from AV.viaduct, drawn to the far field: the hand of man in every view (PLAN.md section 3).
const AVC={ready:false,keys:[].concat(...['spindle','ledger'].map(f=>MP.RUINS.map(s=>f+'.'+s))),hero:{},rec:{},slot:{},mesh:{},live:[],mode:null,bakeMs:0,towers:STAGE.plan.towers,tierGroups:new Map(),tierN:null};
/* the shelled families' tiers, and the designs': a design has no shell (kits/metropolis/KNOWN_ISSUES.md), so it is a hero to 800 m (the nearest
   AV_DHEROMAX) and an impostor past that, in two looks (intact, broken) */
/* the owner, 2026-11-08: the foreground towers looked low-res (a design's impostor, 96 px a view, stood where a hero should) and floors floated (the
   impostor's slabs seen apart from their skin at a near, steep angle): a design is a hero to 1.4 km, to 3.2 km seen steeply from above, the nearest
   48 of them; its impostor is 128 px a view */
/* 2026-11-09, the owner's fourth eye: a shell seen onto its top (the eye over the tower's roof) smears whatever the range, so such a tower is a hero to
   AV_NEAR_STEEP; a design is a hero to 1 km, the nearest 64 (past 48 within 1.4 km the rest were cards at 900 m) */
const AV_NEAR=600,AV_FAR=3200,AV_IMPFAR=3200,AV_RUBBLE=1000,AV_HEROMAX=64,AV_DNEAR=1000,AV_DHEROMAX=72;   /* the owner, 2026-11-09: a shell at 390 m still too close; the band to 600 m (510 with the dither), the budget 20 M */
/* the owner, 2026-11-09 ("a shell at close range again"): a pierced or round design's box shell is a dotted sheet at 300 m, so those families keep
   their heroes further out (their band is AV_NEAR times this), and a tower inside its band is a hero whatever the pool holds */
const AV_NEARK={pods:2,organ:1.8,reed:1.6,arcades:1.6,spiral:1.6,terrarium:1.5,cupola:1.3,swell:1.3,stalk:2,telescope:1.6,yoke:1.4};   /* the Stalk's and the Telescope's thin masts vanish in a 1 m texel: their crowns floated as shells (the owner, 2026-11-09) */
MP.NOSHELL=k=>/\.skeleton$/.test(k);
MP.mats();
/* THE FAR LOOKS (2026-11-09, the owner's fifth eye: floors hung in the air on the far impostors, shells drew over other models). A ruin at range
   is not its own hero baked to a card (the slabs read at a texel, the piers between them do not); it is the family's GUTTED hero cut at the
   state's height: a solid stub with a torn top. Five looks a family: intact, gutted, crown, broken, stump (a skeleton and a fallen tower share the
   stump's). Shells stand only for intact and gutted towers (the spike validated those), never for a tower whose roof the eye is above */
const AV_LOOK={intact:'intact',gutted:'gutted',crown:'crown',broken:'broken',stump:'stump',skeleton:'stump',fallen:'stump'};
const avImpKey=t=>t.family+'.'+AV_LOOK[t.state];
/* THE MIDDLE TIER FOR EVERY FAMILY (the owner, 2026-11-09: "make intermediate forms for the others"). The fourteen designs get a BOX shell record
   each (KSHELL's box mode: depth in from each face of the footprint's box; the polar mode holds the Spindle's own heights, the box mode holds
   nothing of the Ledger's), at a metre a texel (the mid range is 1 km and past: a 200 m tower is 150 px tall there), and every family's five
   looks are baked into shells at the boot, from the same rusted heroes the impostors are baked from, in as many 2048 atlases as they pack
   into. A tower's shell key is its family and look (a skeleton's and a fallen tower's shell is the stump's: a skeleton's bare frame bakes to
   nothing a heightfield can hold) */
MP.families().concat(Object.values(MP.FAMILY).filter(F=>F.design)).forEach(F=>{if(!F||F.shell)return;const fp=F.footprint||(F.footprint={});if(fp.w==null){fp.w=fp.d=(fp.r==null?30:fp.r)*2;}F.shell={mode:'box',inset:1.2,texel:1.0,ruinTexel:1.25,box:true};});
/* a fallen tower is a heap 12 to 18 m high: its look is the stump's (AV_LOOK), an upright 40 to 54 m stub, so it takes no shell and no impostor (Gemini's
   review, 8a, 2026-11-09): its hero to its band, its rubble past that */
const avCanShell=t=>!!t.skey&&t.state!=='skeleton'&&t.state!=='fallen';
/* the towers by position, keyed by the FLOAT32 values: the impostors' instance matrices are a Float32Array, so a key from the float64 coordinates never
   matched a lattice tower's (17 degrees), the lookup found no tower and no tower's impostor was ever hidden: every tower's billboard stood inside
   its own hero or shell, unseen in a solid one and showing through a skeleton's frame, over a fallen heap and above a broken top (2026-11-09) */
AVC.towerAt={};AVC.towers.forEach(t=>{AVC.towerAt[Math.fround(t.x)+','+Math.fround(t.z)]=t;t.shelled=AVC.keys.indexOf(t.key)>=0;t.ikey=avImpKey(t);t.skey=t.ikey;t.nearR=AV_NEAR*(AV_NEARK[t.family]==null?1:AV_NEARK[t.family]);});
AVC.skeys=[];{const seen=new Set();AVC.towers.forEach(t=>{if(!seen.has(t.skey)){seen.add(t.skey);AVC.skeys.push(t.skey);}});}
/* a hero flattened for the shell's bake (KSHELL.bake reads a hero's direct children at identity): every mesh of the tree with its world transform
   baked into a geometry copy, an instanced mesh with its instance matrices premultiplied */
function avFlat(H){H.updateMatrixWorld(true);const G=new THREE.Group(),I=new THREE.Matrix4(),M=new THREE.Matrix4();
 H.traverse(m=>{if(!m.isMesh||!m.geometry||!m.material||m.userData.door)return;const W=m.matrixWorld,id=W.equals(I);
  if(m.isInstancedMesh){const k=new THREE.InstancedMesh(m.geometry,m.material,m.count);if(id){k.instanceMatrix=m.instanceMatrix;}else{const a=new Float32Array(m.count*16);for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(W);M.toArray(a,i*16);}k.instanceMatrix=new THREE.InstancedBufferAttribute(a,16);}k.instanceColor=m.instanceColor;G.add(k);}
  else{const g=id?m.geometry:m.geometry.clone().applyMatrix4(W);if(!id)g.userData.avOwn=true;G.add(new THREE.Mesh(g,m.material));}});return G;}
/* the bake source of a shell key (the owner, 2026-11-08: no floors hanging in the air in any baked form). A ruin's hero is an open frame once its
   glass is gone (the Wedge's broken state: slabs and mullions), and a frame baked to a box or a card is dashes in the air at range, the mullions
   gone sub-pixel. So every look but intact bakes from the family's INTACT hero (its skin on), cut at the state's height (MP.ruin's cut; gutted
   uncut): a solid stub with a torn top. The heroes inside AV_NEAR are the real ruins; the switch at the band is from frame to skinned stub */
/* the height a ruin's stand-in is cut at (2026-11-09, Gemini's review, 8b): the HERO's skin stops at MP.ruin's `cut` (only a narrow core and fins reach
   `top`), so a shell or an impostor cut at `top` stood up to 22 m of full-width wall over the model it stands for; a gutted tower is cut too where its
   cut is under the tip (its lamp and needle gone) */
const avCutTop=(F,look)=>{try{const R=MP.ruin(F,look),tip=F.height&&F.height.tip?F.height.tip:Infinity;if(R.cut!=null&&(look!=='gutted'||R.cut<tip-.5))return Math.max(8,R.cut);
 if(look==='gutted')return Infinity;return Math.max(8,R.top!=null?R.top:8);}catch(e){return look==='gutted'?Infinity:20;}};
function avStub(k){const p=k.split('.'),fam=p[0],look=p[1];if(look==='intact'){const H=AVC.hero[k];return H.userData.avFlat||(H.userData.avFlat=avFlat(H));}
 const F=MP.FAMILY[fam],ik=fam+'.intact',src=AVC.hero[ik]||(AVC.hero[ik]=heroOf(ik));let top=Infinity;
 top=avCutTop(F,look);
 const G=avFlat(src);if(top===Infinity)return G;const out=new THREE.Group(),M=new THREE.Matrix4();
 G.children.forEach(m=>{if(m.isInstancedMesh){const keep=[];for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);if(M.elements[13]<=top)keep.push(i);}if(!keep.length)return;
   const k2=new THREE.InstancedMesh(m.geometry,m.material,keep.length),C=m.instanceColor?new Float32Array(keep.length*3):null,ca=C?m.instanceColor.array:null;
   keep.forEach((i,j)=>{m.getMatrixAt(i,M);k2.setMatrixAt(j,M);if(C){C[j*3]=ca[i*3];C[j*3+1]=ca[i*3+1];C[j*3+2]=ca[i*3+2];}});if(C)k2.instanceColor=new THREE.InstancedBufferAttribute(C,3);out.add(k2);}
  else{m.updateMatrixWorld(true);const g=clipGeoY(m.geometry,m,top);if(g)out.add(new THREE.Mesh(g,m.material));}});return out;}
/* a geometry's triangles whose every vertex (in the mesh's world frame) lies under `top`, as a new non-indexed geometry; null when nothing is left */
function clipGeoY(g,m,top){const P=g.attributes.position,idx=g.index,n=idx?idx.count:P.count,v=new THREE.Vector3(),W=m.matrixWorld,keep=[];
 for(let t=0;t<n;t+=3){let ok=true;for(let j=0;j<3&&ok;j++){const i=idx?idx.getX(t+j):t+j;v.set(P.getX(i),P.getY(i),P.getZ(i)).applyMatrix4(W);if(v.y>top)ok=false;}if(ok)keep.push(t);}
 if(!keep.length)return null;if(keep.length*3===n&&!idx)return g;const out=new THREE.BufferGeometry();out.userData.avOwn=true;
 for(const name in g.attributes){const A=g.attributes[name],sz=A.itemSize,arr=new Float32Array(keep.length*3*sz);let o=0;for(const t of keep)for(let j=0;j<3;j++){const i=idx?idx.getX(t+j):t+j;for(let c=0;c<sz;c++)arr[o++]=A.array[i*sz+c];}out.setAttribute(name,new THREE.BufferAttribute(arr,sz));}
 return out;}
// ---------------------------------------------------------------- the rust (the owner, 2026-11-04: more rust)
// A thousand years of weather on the heroes' colours, once per hero key, before the shells and impostors are baked from them (the bake reads the
// vertex and instance colours): rust streaks running down from the panels' joints and a grime that deepens with the state, by core/rand's noise
// in the tower's own frame, so every clone and every tier agrees. Heavier where the ruin is older.
/* the owner, 2026-11-04, twice: "more rust", then "even more rust and war damage": a base of rust over everything, streaks to full rust, soot
   from the burning in black patches, and the grime; an intact tower is a stained one */
const AV_RUST={intact:.8,gutted:.95,crown:1,broken:1,stump:1,skeleton:1,fallen:1};
function avRust(H,key){if(H.userData.avRusted)return H;H.userData.avRusted=true;const st=key.split('.')[1],k=AV_RUST[st]==null?.8:AV_RUST[st],seed=KRAND.hash(1104,MP.idHash?MP.idHash(key):key.length,7);
 const S3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 /* the laser burns (the owner: "laser burns, fire damage"): two or three straight cuts through the tower at odd angles, each a plane in its frame,
    scorched black and glassy along a band; the fire: soot smeared upward from the burnt storeys */
 const CUTS=[];for(let i=0;i<3+Math.floor(KRAND.unit(KRAND.hash(seed,9,i))*3);i++){const a=KRAND.unit(KRAND.hash(seed,10,i))*Math.PI*2,b=(KRAND.unit(KRAND.hash(seed,11,i))-.5)*1.2,d=(KRAND.unit(KRAND.hash(seed,12,i))-.5)*60,h=20+KRAND.unit(KRAND.hash(seed,13,i))*160;
  CUTS.push({nx:Math.cos(a)*Math.cos(b),ny:Math.sin(b),nz:Math.sin(a)*Math.cos(b),d:d-h*Math.sin(b),w:1.5+KRAND.unit(KRAND.hash(seed,14,i))*3});}
 const T=[.46,.22,.10],T2=[.30,.16,.09],SOOT=[.05,.045,.04],PAL=[1.12,.80,.58],at=(x,y,z,c,o)=>{const s=KRAND.vnoise(x*.55+z*.55+y*.02,y*.07,0,seed),g=KRAND.vnoise(x*.12,y*.35+z*.12,3,seed+1),w=KRAND.vnoise(x*.04+7,y*.06+z*.04,5,seed+2),f=KRAND.vnoise(x*.09+3,y*.012+z*.09,8,seed+3);
  const run=S3(.22,.58,s)*(.75+.25*Math.max(0,.5-g)),r=Math.min(1,(.35+run)*k*(1.3-.5*Math.min(1,y/120))),dirt=1-k*(.36+.4*Math.max(0,g-.3));
  let soot=Math.min(1,(S3(.52,.76,w)+S3(.56,.82,f)*.9)*k);for(let i=0;i<CUTS.length;i++){const C=CUTS[i],e=Math.abs(x*C.nx+y*C.ny+z*C.nz-C.d);soot=Math.max(soot,S3(C.w*2.6,C.w*.5,e)*k);}
  {const l0=(c[o]*.3+c[o+1]*.59+c[o+2]*.11);if(l0<.22){const t=.7*S3(.22,.05,l0);c[o]=c[o]*(1-t)+.5*t;c[o+1]=c[o+1]*(1-t)+.48*t;c[o+2]=c[o+2]*(1-t)+.45*t;}}   /* a dark vertex colour lifted toward grey */
  const l=(c[o]*.3+c[o+1]*.59+c[o+2]*.11),tw=S3(.4,.6,g),R0=T[0]*(1-tw)+T2[0]*tw,R1=T[1]*(1-tw)+T2[1]*tw,R2=T[2]*(1-tw)+T2[2]*tw;
  c[o]=(c[o]*(1-r)+R0*(.6+l)*r)*dirt;c[o+1]=(c[o+1]*(1-r)+R1*(.6+l)*r)*dirt;c[o+2]=(c[o+2]*(1-r)+R2*(.6+l)*r)*dirt;
  /* the palette (the owner: a more uniform rust-shaded palette): every colour drawn half way to a rust-brown of its own brightness */
  const l2=(c[o]*.3+c[o+1]*.59+c[o+2]*.11);c[o]=c[o]*.35+l2*PAL[0]*.65;c[o+1]=c[o+1]*.35+l2*PAL[1]*.65;c[o+2]=c[o+2]*.35+l2*PAL[2]*.65;
  c[o]=c[o]*(1-soot)+SOOT[0]*soot;c[o+1]=c[o+1]*(1-soot)+SOOT[1]*soot;c[o+2]=c[o+2]*(1-soot)+SOOT[2]*soot;};
 const M=new THREE.Matrix4();
 /* the owner, 2026-11-08: the black tower (the Wedge's black curtain glass and dark piers) stood out; its dark materials are swapped for a grey like
    the others' before the rust goes on (one clone a material, shared by every hero), and a dark vertex colour is lifted toward grey the same way */
 const DK=AVC.darkSwap||(AVC.darkSwap=new Map());
 H.traverse(m=>{if(!m.isMesh||m.userData.door)return;const mt=m.material;if(mt&&mt.color&&!mt.transparent&&!mt.userData.mpWindow&&(mt.color.r*.3+mt.color.g*.59+mt.color.b*.11)<.2){let k=DK.get(mt);if(!k){k=mt.clone();k.color.setRGB(.58,.56,.52);k.roughness=.85;k.metalness=.12;if(mt.onBeforeCompile)k.onBeforeCompile=mt.onBeforeCompile;k.customProgramCacheKey=mt.customProgramCacheKey;DK.set(mt,k);}m.material=k;}});
 H.traverse(m=>{if(!m.isMesh||m.userData.door)return;
  if(m.isInstancedMesh&&m.instanceColor){const c=m.instanceColor.array,a=m.instanceMatrix.array;for(let i=0;i<m.count;i++)at(a[i*16+12],a[i*16+13],a[i*16+14],c,i*3);m.instanceColor.needsUpdate=true;}
  else{const g=m.geometry,col=g.attributes.color,p=g.attributes.position;if(!col||g.userData.avRusted)return;g.userData.avRusted=true;const c=col.array,q=p.array,n=Math.min(col.count,p.count);for(let i=0;i<n;i++)at(q[i*3],q[i*3+1],q[i*3+2],c,i*col.itemSize);col.needsUpdate=true;}});
 return H;}
/* the design families' ruin heroes stand at their full height (MP.ruinDesign cuts glass and floors, not the frame: an Organ stump 240 m tall
   against its record's 47), while their shell frames, impostors and the plan read the record (MP.ruin's top): the hero/shell switch popped by
   the difference, the owner's "models appear and disappear at different zoom levels". Found 2026-11-09: a design's crown, broken and stump heroes
   are cut at the record's top here, walls and slabs by triangle, panels by instance; the debris heaps are left as they lie */
const AV_RUINY={crown:1,broken:1,stump:1},_cM=new THREE.Matrix4();
function avClipHero(H,top){H.updateMatrixWorld(true);const kill=[];H.traverse(m=>{if(!m.isMesh||!m.geometry||/debris|rubble/.test(m.name||''))return;
  if(m.isInstancedMesh){const keep=[];for(let i=0;i<m.count;i++){m.getMatrixAt(i,_cM);_cM.premultiply(m.matrixWorld);if(_cM.elements[13]<=top)keep.push(i);}if(keep.length===m.count)return;if(!keep.length){kill.push(m);return;}
   const a=new Float32Array(keep.length*16),A0=m.instanceMatrix.array,C=m.instanceColor?new Float32Array(keep.length*3):null,C0=C?m.instanceColor.array:null;
   keep.forEach((i,j)=>{for(let q=0;q<16;q++)a[j*16+q]=A0[i*16+q];if(C){C[j*3]=C0[i*3];C[j*3+1]=C0[i*3+1];C[j*3+2]=C0[i*3+2];}});m.instanceMatrix=new THREE.InstancedBufferAttribute(a,16);if(C)m.instanceColor=new THREE.InstancedBufferAttribute(C,3);m.count=keep.length;return;}
  const g=clipGeoY(m.geometry,m,top);if(g===m.geometry)return;if(!g){kill.push(m);return;}m.geometry=g;});kill.forEach(m=>{if(m.parent)m.parent.remove(m);});return H;}
/* a ruined farm building keeps no piece that touches nothing (the owner, 2026-11-10: "water tower has floating geometry and flora"): the kit's
   check lets a ruin keep loose remnants (kits/metropolis 70f, "remnants loose"), the crown water tower's gallery among them, and the roof trees took
   the loose ring for its roof. As the kit measures it (MPF.measure): each mesh's connected pieces (triangles sharing corners to 1 cm) and each
   instance a piece; a piece stands when a chain of pieces touching within 0.5 m reaches the ground (under 0.6 m); the rest are cut out (their
   triangles off the index, their instances zeroed). Returns how many were dropped */
const avDropFloaters=H=>{H.updateMatrixWorld(true);const P=[],v=new THREE.Vector3(),M=new THREE.Matrix4();
 H.traverse(m=>{if(!m.isMesh||!m.geometry||m.name==='a door leaf'||/debris|rubble/i.test(m.name||''))return;const g=m.geometry;
  if(m.isInstancedMesh){if(!g.boundingBox)g.computeBoundingBox();for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);if(M.elements[0]===0&&M.elements[5]===0)continue;P.push({m,inst:i,b:g.boundingBox.clone().applyMatrix4(M).applyMatrix4(m.matrixWorld)});}return;}
  const Ps=g.attributes.position,I=g.index,n=I?I.count:Ps.count,at=q=>I?I.getX(q):q,id=new Map(),par=[],vk=[],find=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a];}return a;};
  for(let q=0;q<n;q++){const i=at(q),k=Math.round(Ps.getX(i)*100)+','+Math.round(Ps.getY(i)*100)+','+Math.round(Ps.getZ(i)*100);let x=id.get(k);if(x==null){x=par.length;par.push(x);id.set(k,x);}vk.push(x);}
  for(let t=0;t+2<vk.length;t+=3){const a=find(vk[t]);par[find(vk[t+1])]=a;par[find(vk[t+2])]=a;}
  const by=new Map();for(let t=0;t+2<vk.length;t+=3){const r=find(vk[t]);let e=by.get(r);if(!e){e={m,tris:[],b:new THREE.Box3()};by.set(r,e);}e.tris.push(t);for(let c=0;c<3;c++)e.b.expandByPoint(v.fromBufferAttribute(Ps,at(t+c)).applyMatrix4(m.matrixWorld));}
  by.forEach(e=>P.push(e));});
 const E=.5,touch=(a,b)=>a.min.x-E<=b.max.x&&b.min.x-E<=a.max.x&&a.min.y-E<=b.max.y&&b.min.y-E<=a.max.y&&a.min.z-E<=b.max.z&&b.min.z-E<=a.max.z;
 const on=P.map(p=>p.b.min.y<.6);let grew=true;while(grew){grew=false;for(let i=0;i<P.length;i++){if(on[i])continue;for(let j=0;j<P.length;j++)if(on[j]&&touch(P[i].b,P[j].b)){on[i]=true;grew=true;break;}}}
 const cut=new Map();let n=0;P.forEach((p,i)=>{if(on[i])return;n++;if(p.inst!=null){p.m.setMatrixAt(p.inst,M.makeScale(0,0,0));p.m.instanceMatrix.needsUpdate=true;return;}let s=cut.get(p.m);if(!s){s=new Set();cut.set(p.m,s);}p.tris.forEach(t=>s.add(t));});
 cut.forEach((s,m)=>{const g=m.geometry,I=g.index,n0=I?I.count:g.attributes.position.count,keep=[];for(let t=0;t+2<n0;t+=3){if(s.has(t))continue;for(let c=0;c<3;c++)keep.push(I?I.getX(t+c):t+c);}
  const G=g.clone();G.setIndex(keep);G.userData=Object.assign({},g.userData,{avOwn:true});m.geometry=G;});
 return n;};
const heroOf=(key,lite)=>{const p=key.split('.'),F=MP.FAMILY[p[0]];let H=MP.hero(p[0],p[1],lite);if(F&&F.design&&AV_RUINY[p[1]]){let top=null;try{top=MP.ruin(F,p[1]).top;}catch(e){}if(top!=null)avClipHero(H,top+.5);}
 if(AV_TWO_SIDED.has(p[0])&&p[1]!=='intact'){try{H.userData.avDropped=avDropFloaters(H);}catch(e){}}return avRust(H,key);};
/* the measured shape of a look: the drawn hero's horizontal extent in 6 m bands up its height, in the tower's own frame (x, z about the axis,
   y from the base). The creepers (71) hang and the roof trees (88) stand on THIS, not on the family's footprint: a spindle's footprint is 46 m
   and its shaft 15 m across at its break, so a curtain hung at the footprint's radius 140 m up floated 30 m off the ruin (the owner,
   2026-11-09: floating flora at the Overlook). A band holds its largest radius and its box; `at(h)` is the band at h or the nearest full one
   below it; `top` the highest full band's ceiling (the hero is clipped at the record's top, so this is the drawn top) */
const AV_PROF={},AV_PROF_N=36;function avProfile(key){if(AV_PROF[key])return AV_PROF[key];const H=AVC.hero[key]||(AVC.hero[key]=heroOf(key));H.updateMatrixWorld(true);const BAND=6,B=[],v=new THREE.Vector3(),M=new THREE.Matrix4();
 /* each band also keeps its outermost radius in AV_PROF_N directions (Gemini's review, 8c: one radius and one box a band made a courtyard, the Crescent's
    chord, the Pods' gap and the Yoke's arch solid, so creepers hung in air): a direction with no wall at that height reads 0 */
 const NA=AV_PROF_N,take=(x,y,z)=>{const i=Math.floor(y/BAND);if(i<0||i>150)return;const b=B[i]||(B[i]={y0:i*BAND,r:0,x0:1e9,x1:-1e9,z0:1e9,z1:-1e9,n:0,ang:new Float32Array(NA)});b.n++;const r=Math.hypot(x,z);if(r>b.r)b.r=r;if(x<b.x0)b.x0=x;if(x>b.x1)b.x1=x;if(z<b.z0)b.z0=z;if(z>b.z1)b.z1=z;
  const k=Math.min(NA-1,Math.floor((Math.atan2(z,x)+Math.PI)/(2*Math.PI)*NA));if(r>b.ang[k])b.ang[k]=r;};
 H.traverse(m=>{if(!m.isMesh||!m.geometry||/debris|rubble/.test(m.name||''))return;const P=m.geometry.attributes.position;if(!P)return;
  if(m.isInstancedMesh){for(let k=0;k<m.count;k++){m.getMatrixAt(k,M);M.premultiply(m.matrixWorld);take(M.elements[12],M.elements[13],M.elements[14]);}return;}
  const st=Math.max(1,Math.floor(P.count/6000));for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);take(v.x,v.y,v.z);}});
 let top=0;for(let i=B.length-1;i>=0;i--)if(B[i]&&B[i].n>=6){top=B[i].y0+BAND;break;}
 /* the outermost radius toward angle a at height h (0: no wall that way there); the roof cells at height h: the 4 m cells (in the tower's frame) under an
    upward face whose height is within 3 m under to 1.5 m over h, from the hero's triangles, made the first time they are asked for */
 const roofs={};
 const P={band:BAND,B,top,at(h){let i=Math.min(B.length-1,Math.floor(h/BAND));for(;i>=0;i--){const b=B[i];if(b&&b.n>=6)return b;}return null;},
  rAt(h,a){const b=this.at(h);if(!b||!b.ang)return 0;const k=Math.min(NA-1,Math.floor((((a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI))/(2*Math.PI)*NA));return b.ang[k];},
  roofAt(h){const key=Math.round(h);if(roofs[key])return roofs[key];const S=new Set(),C=4,a=new THREE.Vector3(),b2=new THREE.Vector3(),c=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),nn=new THREE.Vector3();
   H.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||/debris|rubble/.test(m.name||''))return;const Pp=m.geometry.attributes.position,I=m.geometry.index,n=I?I.count:Pp.count,W=m.matrixWorld;
    for(let t=0;t+2<n;t+=3){const i0=I?I.getX(t):t,i1=I?I.getX(t+1):t+1,i2=I?I.getX(t+2):t+2;a.fromBufferAttribute(Pp,i0).applyMatrix4(W);b2.fromBufferAttribute(Pp,i1).applyMatrix4(W);c.fromBufferAttribute(Pp,i2).applyMatrix4(W);
     const yc=(a.y+b2.y+c.y)/3;if(yc<h-3||yc>h+1.5)continue;nn.crossVectors(e1.subVectors(b2,a),e2.subVectors(c,a));const L=nn.length();if(L<1e-6||Math.abs(nn.y)/L<.6)continue;
     const st=Math.max(2,Math.ceil(Math.max(a.distanceTo(b2),b2.distanceTo(c),c.distanceTo(a))/C));for(let u=0;u<=st;u++)for(let w=0;w+u<=st;w++){const p=u/st,q=w/st,x=a.x+(b2.x-a.x)*p+(c.x-a.x)*q,z=a.z+(b2.z-a.z)*p+(c.z-a.z)*q;S.add(Math.floor(x/C)+','+Math.floor(z/C));}}});
   S.cell=C;return roofs[key]=S;},
  onRoof(h,x,z){const S=this.roofAt(h),C=S.cell;return S.has(Math.floor(x/C)+','+Math.floor(z/C));}};return AV_PROF[key]=P;}
/* THE DRAWN SURFACE, BY RAYS (the owner, 2026-11-10: "still seeing a fair amount of floating foliage"): the profile's bearings and roof cells place
   the creepers and the roof trees, and a ray at the hero itself confirms each one, in the tower's own frame. The roof cells are 4 m and take any
   upward face, so a tree stood on a rim or a beam and hung over the drop (the probe found the floating crowns roof oaks on a broken Wedge and on the
   Pods' crown). side(h, a, r0): the first face a ray in from r0 m out on the bearing a meets at the height h, its distance from the axis, or null;
   down(x, z, y0, y1): the first surface a ray down from y0 meets above y1, its height, or null. Debris and rubble are left out, as avProfile does */
/* The merged walls and slabs only (the instanced detail, windows and mullions in their thousands, holds no creeper or tree; the roof finder in 88
   skips it too), as triangles in the tower's frame bucketed by 3 m band (the sideways rays) and 4 m cell (the downward ones), so a ray tests its
   bucket and not the whole hero: three's raycaster on the whole heroes took the boot from 100 s to 350 s. avSurfaceFree() lets the buckets go
   after the boot (the check builds them again as it asks) */
const AV_SURF={},AV_SB=3,AV_SC=4;function avSurfaceFree(){for(const k in AV_SURF)delete AV_SURF[k];}
function avSurface(key){if(AV_SURF[key])return AV_SURF[key];const H=AVC.hero[key]||(AVC.hero[key]=heroOf(key));H.updateMatrixWorld(true);
 const T=[],v=new THREE.Vector3();H.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||/debris|rubble/.test(m.name||''))return;const P=m.geometry.attributes.position,I=m.geometry.index,n=I?I.count:P.count;
  for(let k=0;k+2<n;k+=3)for(let j=0;j<3;j++){v.fromBufferAttribute(P,I?I.getX(k+j):k+j).applyMatrix4(m.matrixWorld);T.push(v.x,v.y,v.z);}});
 const TA=new Float32Array(T),nt=TA.length/9,band=new Map(),cell=new Map(),put=(M,k,t)=>{let a=M.get(k);if(!a)M.set(k,a=[]);a.push(t);};
 for(let t=0;t<nt;t++){const q=t*9,x0=Math.min(TA[q],TA[q+3],TA[q+6]),x1=Math.max(TA[q],TA[q+3],TA[q+6]),y0=Math.min(TA[q+1],TA[q+4],TA[q+7]),y1=Math.max(TA[q+1],TA[q+4],TA[q+7]),z0=Math.min(TA[q+2],TA[q+5],TA[q+8]),z1=Math.max(TA[q+2],TA[q+5],TA[q+8]);
  for(let b=Math.floor(y0/AV_SB);b<=Math.floor(y1/AV_SB);b++)put(band,b,t);
  for(let i=Math.floor(x0/AV_SC);i<=Math.floor(x1/AV_SC);i++)for(let j=Math.floor(z0/AV_SC);j<=Math.floor(z1/AV_SC);j++)put(cell,i+','+j,t);}
 /* Moller-Trumbore: the distance along (dx, dy, dz) from (ox, oy, oz) to triangle t, or -1 */
 const hit=(t,ox,oy,oz,dx,dy,dz)=>{const q=t*9,ax=TA[q],ay=TA[q+1],az=TA[q+2],e1x=TA[q+3]-ax,e1y=TA[q+4]-ay,e1z=TA[q+5]-az,e2x=TA[q+6]-ax,e2y=TA[q+7]-ay,e2z=TA[q+8]-az;
  const px=dy*e2z-dz*e2y,py=dz*e2x-dx*e2z,pz=dx*e2y-dy*e2x,det=e1x*px+e1y*py+e1z*pz;if(Math.abs(det)<1e-9)return -1;const inv=1/det,tx=ox-ax,ty=oy-ay,tz=oz-az,u=(tx*px+ty*py+tz*pz)*inv;if(u<0||u>1)return -1;
  const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x,w=(dx*qx+dy*qy+dz*qz)*inv;if(w<0||u+w>1)return -1;const s=(e2x*qx+e2y*qy+e2z*qz)*inv;return s>1e-4?s:-1;};
 return AV_SURF[key]={tris:nt,side(h,a,r0){const c=Math.cos(a),s=Math.sin(a),L=band.get(Math.floor(h/AV_SB));if(!L)return null;let best=1e9;for(const t of L){const d=hit(t,c*r0,h,s*r0,-c,0,-s);if(d>=0&&d<best)best=d;}return best<r0?r0-best:null;},
  down(x,z,y0,y1){const L=cell.get(Math.floor(x/AV_SC)+','+Math.floor(z/AV_SC));if(!L)return null;let best=1e9;for(const t of L){const d=hit(t,x,y0,z,0,-1,0);if(d>=0&&d<best)best=d;}return best<=y0-y1?y0-best:null;},
  /* a tree's footing: the centre and four points 1.5 m round it all meet a surface within 1.2 m of one another: a slab under the trunk, not a beam */
  footing(x,z,y0,y1){const yc=this.down(x,z,y0,y1);if(yc==null)return null;for(let k=0;k<4;k++){const a=k*Math.PI/2,y=this.down(x+Math.cos(a)*1.5,z+Math.sin(a)*1.5,y0,y1);if(y==null||Math.abs(y-yc)>1.2)return null;}return yc;}};}
// the towers as records before anything is drawn: the family's name, its footprint, the state
AVC.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family];if(!F)return;const r=F.footprint?(F.footprint.r||Math.max(F.footprint.w||0,F.footprint.d||0)/2):30;
 REGISTER({name:F.name+' ('+T.state+')',kind:'tower',x:T.x,z:T.z,y:T.y,r:r,h:T.state==='intact'||T.state==='gutted'?F.height.tip:F.height.tip*.6,tags:{kind:'tower',family:T.family,state:T.state,zone:T.kind}});});
AVC.boot=function(){if(AVC.ready)return true;if(window._texPending>0)return false;const t0=performance.now();
 try{AVC.engines();}catch(e){reportErr('engines: '+e.stack);}AVC.engineMs=Math.round(performance.now()-t0);
 /* the shell records: every look the plan uses (a skeleton's towers take the stump's); a family whose record fails has no shell (its towers are heroes then impostors) */
 AVC.shellKeys=[];AVC.stub={};AVC.skeys.forEach(k=>{const p=k.split('.'),F=MP.FAMILY[p[0]];if(!F||!F.shell)return;try{AVC.rec[k]=KSHELL.record(F,p[1]);AVC.hero[k]=AVC.hero[k]||heroOf(k);AVC.shellKeys.push(k);}catch(e){reportErr('shell record '+k+': '+(e.message||e));}});
 const size=/[?&]atlas=1024\b/.test(location.search)?1024:2048,steps=/[?&]steps=(\d+)/.test(location.search)?+RegExp.$1:32,pxOf=()=>2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);
 /* pack the records into atlases, each as full as it goes (KSHELL.pack throws when one does not fit: the rest start the next) */
 AVC.atlases=[];AVC.mats=[];AVC.atlasOf={};{let left=AVC.shellKeys.slice();while(left.length){let n=left.length,packed=null;while(n>0){try{packed=KSHELL.pack([].concat(...left.slice(0,n).map(k=>KSHELL.slots(AVC.rec[k]))),size);break;}catch(e){n=Math.floor(n*.7);packed=null;}}
  if(!packed||!n){reportErr('shells: '+left[0]+' fits no atlas');left.shift();continue;}const at=KSHELL.atlas(size,renderer),mat=KSHELL.material(at,{steps}),ai=AVC.atlases.length;AVC.atlases.push(at);AVC.mats.push(mat);
  packed.forEach(s=>{AVC.slot[s.id]=s;});left.slice(0,n).forEach(k=>{AVC.atlasOf[k]=ai;});left=left.slice(n);}}
 AVC.packed=Object.values(AVC.slot);
 /* a stub is a bake source only: once baked, its own geometries (the clipped and the moved copies, not the heroes' shared ones) are disposed and the stub
    dropped (Gemini's review, 10a: they were kept for the page's life, hundreds of MB of non-indexed arrays) */
 if(!/[?&]nobake/.test(location.search))AVC.shellKeys.forEach(k=>{const at=AVC.atlases[AVC.atlasOf[k]],H=AVC.stub[k]||(AVC.stub[k]=avStub(k));KSHELL.bake(at,AVC.rec[k],AVC.slot[k],H,AVC.slot[k+'.top'],AVC.slot[k+'.bot']);
  H.traverse(m=>{if(m.geometry&&m.geometry.userData.avOwn)m.geometry.dispose();});delete AVC.stub[k];const hk=AVC.hero[k];if(hk&&hk.userData.avFlat===H)delete hk.userData.avFlat;});
 if(!/[?&]nomip/.test(location.search))AVC.atlases.forEach(at=>KSHELL.finish(at));
 /* the shells fade in over the band their heroes fade out over (kits/metropolis 60, aBand: 2026-11-09): each family's own band (AV_NEARK), and the LOD scale
    the heroes' fade reads (BIO._lodU.s, the same uniform object); uBand.x stays AV_NEAR for a shell drawn without one */
 AVC.mats.forEach(m=>{m.userData.U.uPx.value=pxOf();m.userData.U.uBand.value.set(AV_NEAR,0,.15);if(BIO._lodU)m.userData.U.uBandS=BIO._lodU.s;});AVC.mat=AVC.mats[0];
 const capOf={},cap=Math.max(16,AVC.towers.length);AVC.towers.forEach(t=>{capOf[t.skey]=(capOf[t.skey]||0)+1;});
 if(!/[?&]noshell\b/.test(location.search))AVC.shellKeys.forEach(k=>{const at=AVC.atlases[AVC.atlasOf[k]],im=KSHELL.draw(at,AVC.rec[k],AVC.slot[k],AVC.mats[AVC.atlasOf[k]],new Array(Math.max(1,capOf[k]||1)).fill([0,0,0]),AVC.slot[k+'.top'],AVC.slot[k+'.bot'],AV_NEAR*(AV_NEARK[k.split('.')[0]]==null?1:AV_NEARK[k.split('.')[0]]));im.count=0;im.frustumCulled=false;scene.add(im);AVC.mesh[k]=im;});
 AVC.towers.forEach(t=>{if(!AVC.mesh[t.skey])t.skey=null;});
 AVC.debris={};AVC.debrisFar={};AVC.debrisTris={};AVC.keys.forEach(k=>{const p=k.split('.'),G=MP.debris(MP.FAMILY[p[0]],p[1]);if(!G)return;AVC.debrisTris[k]=G.userData.tris;
  AVC.debris[k]=G.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,cap);im.count=0;im.frustumCulled=false;im.name=m.name;im.castShadow=im.receiveShadow=!!MP.shadow;scene.add(im);return im;});
  const Gf=MP.debris(MP.FAMILY[p[0]],p[1],true);AVC.debrisFar[k]=Gf.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,cap);im.count=0;im.frustumCulled=false;im.name=m.name+'.far';scene.add(im);return im;});});
 AVC.bakeMs=Math.round(performance.now()-t0);
 /* the impostors: one set, a slot a family and state, from the hero's own meshes; the bake runs on the metro kit alone (the valley's forest is baked already: 88) */
 const S=BIO.impostorSet('av',{grid:8,cell:/[?&]impcell=(\d+)/.test(location.search)?+RegExp.$1:128,slots:14});AVC.impSet=S;const savedKits=BIO.kits;BIO.kit('metro');
 AVC.imp={};
 /* a hero's meshes, wherever they sit in its tree (a design's ruin pass nests groups), each with its matrix in the hero's frame */
 /* the owner, 2026-11-09: a ruin's impostor showed its floors as dashes hanging in the air (the slabs inside under the tear, and the storeys' plates,
    read at a texel while the piers between them do not): the impostor is baked without them, the skin and the frame alone */
 const heroMeshes=H=>{const out=[];H.updateMatrixWorld(true);H.traverse(m=>{if(!m.isMesh||!m.geometry||!m.material||m.userData.door)return;let o=m,skip=false;while(o&&o!==H){if(/slab|floor|storey|plate/i.test(o.name||''))skip=true;o=o.parent;}if(!skip)out.push(m);});return out;};
 const impOf=(k,S)=>{const pk=k.split('.'),fam=pk[0],look=pk[1],F=MP.FAMILY[fam];let top=Infinity;
  if(look!=='intact')top=avCutTop(F,look);
  const H=heroOf(look==='intact'?k:fam+'.intact',true),names=[];heroMeshes(H).forEach((m,i)=>{let g=m.geometry;if(top<Infinity&&!m.isInstancedMesh){g=clipGeoY(g,m,top);if(!g)return;}const n='av.'+k+'.'+i;BIO.def(n,g,m.material,{indexed:false});names.push([n,m]);});
  return BIO.impostor('av.'+k,function(){const M=new THREE.Matrix4(),W=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(function(e){const n=e[0],m=e[1];W.copy(m.matrixWorld);if(!m.isInstancedMesh){W.decompose(p,q,s);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(W).decompose(p,q,s);if(p.y>top)continue;if(m.instanceColor)m.getColorAt(i,c);else c.setRGB(1,1,1);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});};
 /* every look the plan uses, shelled families and designs alike, in sets of 14 (a set is one atlas pair and one draw call a chunk) */
 AVC.dkeys=[];{const seen=new Set();AVC.towers.forEach(t=>{if(!seen.has(t.ikey)){seen.add(t.ikey);AVC.dkeys.push(t.ikey);}});}
 AVC.dsets=[S];AVC.dset={};let slotLeft=0,cur=null;AVC.dkeys.forEach(k=>{if(!slotLeft){cur=AVC.dsets.length===1&&!AVC.dsets[0].used?S:BIO.impostorSet('avd'+AVC.dsets.length,{grid:8,cell:128,slots:14});cur.used=true;if(cur!==S)AVC.dsets.push(cur);slotLeft=14;BIO.impostorItem('avImp'+(AVC.dsets.length-1),cur,{label:'a far tower'});}
  AVC.imp[k]=impOf(k,cur);AVC.dset[k]='avImp'+(AVC.dsets.indexOf(cur));slotLeft--;});
 BIO.range=AV_IMPFAR;BIO.minRange=0;BIO.chunk=800;AVC.towers.forEach(T=>{BIO.impostorPut(AVC.dset[T.ikey],AVC.imp[T.ikey],[T.x,T.y,T.z],-(T.yaw||0),1);});BIO.range=null;BIO.minRange=0;BIO.chunk=null;
 {const mine={metro:BIO.kits.metro};BIO.kits=mine;try{BIO.bake();}finally{BIO.kits=savedKits;}}BIO.kit('');AVC.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;AVC.impN=0;
 AVC.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/avImp/.test(o.name||'')){AVC.impMeshes.push(o);o.userData.full=o.instanceMatrix.array.slice();}});AVC.impKeys=AVC.dkeys.length;
 AVC.bakeAllMs=Math.round(performance.now()-t0);AVC.impMs=0;AVC.ready=true;AVC.nextTier=0;return true;};
AVC.impTick=function(){if(!AVC.impQ||!AVC.impQ.length)return;const r=AVC.impQ.shift(),t0=performance.now();BIO.IMP.list.length=0;BIO.IMP.list.push(r);AVC.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;AVC.impMs+=Math.round(performance.now()-t0);};
// a hero placed on the ground: a clone that shares the geometry
/* the farm families are walked into (the Terraces' pods, vaults, halls): their walls are single strips facing out, so from inside their back faces were
   culled and the walls stood transparent (the owner, 2026-11-10: "it's pod walls that are transparent from inside"). Their hero templates take
   two-sided copies of the kit's materials, once per material, cloned as the fade clones are (the composed hook carried, its layers each run once) */
const AV_TWO_SIDED=new Set(MP.FARM_KEYS||[]),avTwoMats=new Map();
const avTwoSided=(H,key)=>{if(H.userData.avTwo||!AV_TWO_SIDED.has(key.split('.')[0]))return;H.userData.avTwo=true;
 H.traverse(m=>{if(!m.isMesh||!m.material||Array.isArray(m.material)||m.material.side===THREE.DoubleSide)return;let k=avTwoMats.get(m.material);
  if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);k.side=THREE.DoubleSide;avTwoMats.set(m.material,k);}m.material=k;});};
function avHero(key,x,y,z,yaw,fade,nearR){const H=AVC.hero[key]||(AVC.hero[key]=heroOf(key)),g=new THREE.Group();avTwoSided(H,key);H.children.forEach(m=>{let c;if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;c.frustumCulled=false;c.position.copy(m.position);c.quaternion.copy(m.quaternion);c.scale.copy(m.scale);c.userData=m.userData;}else c=m.clone();g.add(c);});
 /* fade: false, or the shell key whose frame the hero fades over (its own key, or the stump's for a skeleton) */
 g.position.set(x,y,z);g.rotation.y=-(yaw==null?0:yaw);if(MP.shadow)MP.shadow.cast(g);const fk=fade===true?key:fade;if(fk&&AVC.rec[fk])avFade(g,fk,x,y,z,yaw,nearR);g.userData.av={key,x,y,z,yaw:yaw==null?0:yaw};scene.add(g);AVC.live.push(g);return g;}
/* a broken tower's lean (AV.lean: up to 5 degrees, a direction by hash): one quaternion per tower, the heroes, the shells and the rubble share it.
   THE YAW'S SIGN (found by the lobbies session, 2026-11-10): a tower's yaw is the plan's, which turns its local x to (cos yaw, sin yaw) as the lattice,
   the plinth (46z padD) and the kerb placement read it; three.js's rotation.y turns local x to (cos, -sin), so every drawn form (the hero, its fade,
   the shells, the debris, the impostors, the creepers and the roof trees through this quaternion) turns by -yaw. Before, every slab family stood 34
   degrees askew to its street and plinth (17 degrees the lattice's turn, drawn the other way) */
const avQuat=(T)=>{if(T.q)return T.q;const Y=new THREE.Vector3(0,1,0),q=new THREE.Quaternion().setFromAxisAngle(Y,-(T.yaw||0));if(T.lean){const ax=new THREE.Vector3(Math.cos(T.leanDir||0),0,Math.sin(T.leanDir||0)),t=new THREE.Quaternion().setFromAxisAngle(ax,T.lean*Math.PI/180);q.premultiply(t);}T.q=q;return q;};
const avHalf=(key,yaw)=>{const r=AVC.rec[key];if(!r){const F=MP.FAMILY[key.split('.')[0]]||MP.DESIGNS[key.split('.')[0]],fp=F&&F.footprint||{},h=fp.r!=null?fp.r:Math.max(fp.w==null?40:fp.w,fp.d==null?40:fp.d)/2;return[h,h];}const f=r.frame,h=f.mode?[f.a,f.b]:[f.a*.6,f.a*.6];return Math.abs(Math.cos(yaw==null?0:yaw))<.5?[h[1],h[0]]:h;};
const avH=key=>{const r=AVC.rec[key];if(r)return r.frame.H;const p=key.split('.'),F=MP.FAMILY[p[0]]||MP.DESIGNS[p[0]];if(F&&F.ruins&&p[1]&&p[1]!=='intact'){try{return MP.ruin(F,p[1]).top;}catch(e){}}return F?F.height.tip:60;};
const avBoxDist=(T,e)=>{const h=avHalf(T.skey||T.key,T.yaw),dx=Math.max(Math.abs(e.x-T.x)-h[0],0),dz=Math.max(Math.abs(e.z-T.z)-h[1],0),dy=Math.max(e.y-T.y-avH(T.skey||T.key),Math.max(T.y-e.y,0),0);return Math.hypot(dx,dy,dz);};
function avFade(g,key,x,y,z,yaw,nearR){const h=avHalf(key,yaw),H=AVC.rec[key].frame.H,a=new Float32Array(12);
 a.set([x-h[0],z-h[1],x+h[0],z+h[1],y,y+H,0,-(nearR==null?AV_NEAR:nearR),1e9,1e9,1e9,1e9]);const cache=AVC.fadeMats||(AVC.fadeMats=new Map());
 g.traverse(m=>{if(!m.isMesh||!m.geometry)return;const S=m.geometry,G=new THREE.BufferGeometry(),buf=new THREE.InstancedInterleavedBuffer(a.slice(),12,Math.max(1,m.isInstancedMesh?m.count:1));for(const n in S.attributes)G.setAttribute(n,S.attributes[n]);G.setIndex(S.index);if(!S.boundingSphere)S.computeBoundingSphere();G.boundingSphere=S.boundingSphere;
  G.setAttribute('aLodA',new THREE.InterleavedBufferAttribute(buf,4,0));G.setAttribute('aLodB',new THREE.InterleavedBufferAttribute(buf,4,4));G.setAttribute('aLodC',new THREE.InterleavedBufferAttribute(buf,4,8));m.geometry=G;
  let k=cache.get(m.material);if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);delete k.userData._lodFade;BIO.lodFade(k);cache.set(m.material,k);}m.material=k;});BIO._lodU.f.value=BIO.LOD.fade;}
/* each shell instance carries its fade band (kits/metropolis 60, aBand): its family's band where the tower's hero is held (the two cross-fade), -1 where it
   is not (a tower past the hero pool's cap inside its band: an opaque shell, not a shell dithered half away with no hero behind it; Gemini's review, Q1) */
function avShells(list,held){const n={};AVC.shellKeys.forEach(k=>n[k]=0);const M=new THREE.Matrix4(),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const im=AVC.mesh[T.skey];if(!im)return;const i=n[T.skey]++;M.compose(p.set(T.x,T.y,T.z),avQuat(T),one);im.setMatrixAt(i,M);
  const B=im.geometry.attributes.aBand;if(B&&i<B.count)B.setX(i,held&&held.has(T.id)?(T.nearR==null?AV_NEAR:T.nearR):-1);});
 AVC.shellKeys.forEach(k=>{const im=AVC.mesh[k];if(!im)return;im.count=n[k];im.instanceMatrix.needsUpdate=true;if(im.geometry.attributes.aBand)im.geometry.attributes.aBand.needsUpdate=true;});}
function avDebris(list,far){const DB=far?AVC.debrisFar:AVC.debris,n={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const D=DB[T.key];if(!D)return;const i=n[T.key]=(n[T.key]||0);M.compose(p.set(T.x,T.y,T.z),Q.setFromAxisAngle(Y,-(T.yaw||0)),one);D.forEach(im=>im.setMatrixAt(i,M));n[T.key]++;});   /* the rubble lies on the ground: no lean */
 for(const k in DB)DB[k].forEach(im=>{im.count=n[k]||0;im.instanceMatrix.needsUpdate=true;});}
// the tiers each 150 ms: the nearest towers heroes from a pool; 300 m to 1.4 km shells (to 3.2 km seen steeply); the rest impostors
AVC.tiersTick=function(){if(!AVC.ready)return;const now=performance.now(),e=camera.position,L=AVC.lastEye;
 /* a jump of the eye (a view picked, the follow mode) retiers at once: a frame drawn with the last eye's tiers showed a far tower's impostor, its stalk lost, where its hero belonged (the owner, 2026-11-09: "floating structural elements") */
 const jumped=!L||Math.hypot(e.x-L[0],e.y-L[1],e.z-L[2])>60;if(!jumped&&now<(AVC.nextTier||0))return;AVC.nextTier=now+150;AVC.lastEye=[e.x,e.y,e.z];
 const T=AVC.towers,near=[],mid=[];
 /* a design (no shell) is a hero to AV_DNEAR, the nearest AV_DHEROMAX of them, then its impostor. Seen steeply from above (the owner, 2026-11-08: the
    shells' top maps smeared from the air) a shelled tower is a hero to AV_NEAR_STEEP, unfaded, and its shell starts there; the hero pool is wider */
 /* the owner, 2026-11-08: heroes and shells drew on top of each other from the air. The dither band (the shell from .85 nearR, the hero fading out
    over it) is for the walker's view, where the hero fades; from above the heroes are unfaded, so a shell starts only where the heroes stop */
 /* THE TIERS, plainly (the owner, 2026-11-08: "make intermediate forms for the others"). Every family and every look has a box shell now (KSHELL box
    mode, baked at the boot from the rusted heroes), so one rule serves all: a tower is a HERO inside AV_NEAR (the nearest AV_HEROMAX), its SHELL from
    .85 AV_NEAR (the dither band, where the hero fades out over it) to AV_FAR side-on, and its IMPOSTOR past that. A skeleton (no shell: its frame is
    open) and any tower whose roof the eye is above (the shells' top maps smear from the air) are heroes to AV_DNEAR, to AV_IMPFAR seen steeply, the
    nearest AV_DHEROMAX, then impostors: no shell is drawn for them. Outside the dither band exactly one form stands for a tower */
 const dnear=[],up=e.y-terrainH(e.x,e.z),steepEye=up>60;
 for(const t of T){const d=avBoxDist(t,e),hz=Math.hypot(e.x-t.x,e.z-t.z),H=avH(t.skey||t.key),steep=(e.y-t.y-H*.5)>.7*Math.max(hz,1),above=e.y>t.y+H+25;t.d=d;t.shell=false;t.above=above;
  const shellable=avCanShell(t)&&!above;t.shellable=shellable;
  if(!shellable){if(d<Math.max(AV_DNEAR,t.nearR==null?0:t.nearR)||(steep&&d<AV_IMPFAR))dnear.push(t);continue;}   /* a family whose band passes 1 km keeps its hero to its band (Gemini's review, 8e.2) */
  const nr=t.nearR==null?AV_NEAR:t.nearR;if(d<nr)near.push(t);if(d>=nr*.85&&(d<AV_FAR||(steep&&d<AV_IMPFAR))){mid.push(t);t.shell=true;}}
 near.sort((a,b)=>a.d-b.d);dnear.sort((a,b)=>a.d-b.d);
 /* every tower inside its band (before the dither) is a hero whatever the pool holds; the pool's cap falls on the band itself */
 const must=near.filter(t=>t.d<(t.nearR==null?AV_NEAR:t.nearR)*.85),rest=near.filter(t=>t.d>=(t.nearR==null?AV_NEAR:t.nearR)*.85),room=Math.max(0,AV_HEROMAX-must.length);
 const keep=must.concat(rest.slice(0,room)).concat(dnear.slice(0,AV_DHEROMAX)),G=AVC.tierGroups;
 const fadeOf=t=>t.shellable;
 G.forEach((g,id)=>{const t=keep.find(t=>t.id===id);if(!t||g.userData.fade!==fadeOf(t)){scene.remove(g);G.delete(id);AVC.live.splice(AVC.live.indexOf(g),1);}});
 /* a shellable hero fades over the band toward its shell's frame (the shell key's record); a skeleton's hero, whose shell is the stump's, fades to that */
 keep.forEach(t=>{if(!G.has(t.id)){const f=fadeOf(t),g=avHero(t.key,t.x,t.y,t.z,t.yaw,f?t.skey:false,t.nearR);g.userData.fade=f;if(t.lean){g.quaternion.copy(avQuat(t));
   /* the design heroes carry their rubble in the group: it lies on the ground, so it takes the lean back off (Gemini's review, 8d: tilted 5 degrees it
      lifted pieces 12 m into the air 140 m out) */
   const inv=new THREE.Matrix4().makeRotationFromQuaternion(avQuat(t).clone().invert());g.children.forEach(c=>{if(/debris|rubble/i.test(c.name||''))c.applyMatrix4(inv);});}G.set(t.id,g);}});
 /* a shellable tower past the hero pool's cap within 255 m stands as its shell (rare: the pool is the nearest 16 and shells begin at 255 m) */
 rest.slice(room).forEach(t=>{if(!t.shell){mid.push(t);t.shell=true;}});
 /* a hero the pool still holds past the dither band has no shell */
 {const held=new Set(keep.map(t=>t.id));for(let i=mid.length-1;i>=0;i--){const t=mid[i];if(held.has(t.id)&&t.d>=(t.nearR==null?AV_NEAR:t.nearR)){t.shell=false;mid.splice(i,1);}}}
 avShells(mid,G);avDebris(T.filter(t=>t.shelled&&t.d<AV_RUBBLE));avDebris(T.filter(t=>t.shelled&&t.d>=AV_RUBBLE&&t.d<AV_IMPFAR),true);
 /* a fallen tower's billboard (the stump's look) is hidden where its hero or its rubble draws; past the far rubble it stands squashed to the heap's
    height (16 m), so a fallen tower does not vanish from the far city (2026-11-09: once the impostors hid, 55 fallen towers past 3.2 km drew nothing) */
 AVC.impMeshes.forEach(o=>{const A=o.instanceMatrix.array,F=o.userData.full;for(let i=0,n=F.length/16;i<n;i++){const t=AVC.towerAt[F[i*16+12]+','+F[i*16+14]];
  const heap=!!t&&t.state==='fallen'&&!G.has(t.id)&&!(t.shelled&&t.d<AV_IMPFAR),nr=t?(t.shell||G.has(t.id)||(t.state==='fallen'&&!heap)):false;
  for(let k=0;k<16;k++)A[i*16+k]=nr?0:F[i*16+k];if(heap){const f=Math.min(1,16/Math.max(1,avH(t.skey||t.key)));A[i*16+4]*=f;A[i*16+5]*=f;A[i*16+6]*=f;}}o.instanceMatrix.needsUpdate=true;});
 AVC.tierN={heroes:keep.length,shells:mid.length,impostors:T.filter(t=>!t.shell&&!G.has(t.id)).length,towers:T.length,looks:AVC.impKeys,shellKeys:AVC.shellKeys.length,atlases:AVC.atlases.length,steep:steepEye};};
tick(function(){if(!AVC.ready)AVC.boot();else{const px=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);AVC.mats.forEach(m=>{m.userData.U.uPx.value=px;});AVC.impTick();AVC.tiersTick();}});
// ---------------------------------------------------------------- the engines (kits/ancients 8ah, 8ai, read in place: the owner, 2026-11-04)
// A builder run once into a group of its own at decay 1 (the machine coming apart), the kit's instanced detail baked into that group, its pieces
// that touch nothing dropped (as kits/metropolis 55 does for its Ancients heroes), centred on its plan and stood on its pad. Always drawn: two
// on a page, each a few hundred metres across, are the sense of scale and cannot be let go at range. Built at the boot (the first frame): the
// kit's fragments (8ah, 8ai, its registry) sort after this one and before core/host's
let AV_ENGINES=[];
AVC.engines=function(){AV_ENGINES=STAGE.engines.map(E=>{const fn=window[E.fn];if(typeof fn!=='function'){reportErr('engine: the Ancients kit has no '+E.fn+' on this page');return null;}
 KIT.order.forEach(n=>{KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;const holder=new THREE.Group(),G=new THREE.Group(),r0=ANC_REG.length;
 try{fn(holder,0,0,1);}catch(e){reportErr('engine '+E.key+': '+e.stack);}
 (MP.ANCIENT_SKIP||[]).forEach(n=>{if(KIT.items[n])KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;kbake(holder);KIT.order.forEach(n=>{KIT.items[n].length=0;});
 const dropped=MP.ancientFloaters?MP.ancientFloaters(holder,true):0,S=MP.ancientSize?MP.ancientSize(holder):{cx:0,cz:0};holder.position.set(-S.cx,0,-S.cz);G.add(holder);
 /* the kit's own volumes (ANC_REG, in the builder's frame) become the page's records, moved with the engine */
 const c=Math.cos(E.yaw),s=Math.sin(E.yaw);ANC_REG.splice(r0).forEach(v=>{const lx=(v.x||0)-S.cx,lz=(v.z||0)-S.cz;REGISTER({name:v.name,kind:'engine',x:E.x+lx*c-lz*s,z:E.z+lx*s+lz*c,y:E.y+(v.y||0),r:v.r,h:v.h,tags:{kind:'engine',engine:E.key}});});
 G.position.set(E.x,E.y,E.z);G.rotation.y=E.yaw;G.name='engine.'+E.key;G.userData.inspectLabel=E.name;let tris=0;G.traverse(m=>{if(m.isMesh&&m.geometry){const g=m.geometry,n=g.index?g.index.count/3:g.attributes.position.count/3;tris+=n*(m.isInstancedMesh?m.count:1);}});G.userData.tris=Math.round(tris);
 if(MP.shadow)MP.shadow.cast(G);scene.add(G);return G;}).filter(Boolean);return AV_ENGINES;};
// ---------------------------------------------------------------- the lines: the viaduct (AV.viaduct's records drawn as instanced piers and decks)
let AV_LINES_GONE=0,AV_LAMPS=[];
const AV_LINES=(function(){const V={piers:[],decks:[],length:0};(STAGE.transit?[]:STAGE.viaduct.pts).forEach(L=>{   /* the transit kit draws the lines now (74); the boxes stay for a station without it */const v=AV.viaduct(L,{step:36,ground:terrainH,deckY:STAGE.viaduct.deckY});V.piers.push(...v.piers);V.decks.push(...v.decks);V.length+=v.length||0;});
 const P=KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('metropolis','concrete'):null,T=P?KMAT.textures(P,{aniso:8}):{};
 const mat=new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,roughnessMap:T.roughnessMap||null,color:0x9a968c,roughness:.95,metalness:0});
 const rail=new THREE.MeshStandardMaterial({color:0x5a5248,roughness:.6,metalness:.6});
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P3=new THREE.Vector3(),S3=new THREE.Vector3(),E=new THREE.Euler();
 /* the war damage on the line: a deck in fourteen is down (and the one after it half the time), its pier with it; a fallen deck lies tilted at the foot */
 const gone=V.decks.map((d,i)=>KRAND.unit(KRAND.hash(STAGE.seed,i,71))<.13||(i>0&&KRAND.unit(KRAND.hash(STAGE.seed,i-1,71))<.13&&KRAND.unit(KRAND.hash(STAGE.seed,i,72))<.6));
 const piers=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.piers.length);V.piers.forEach((p,i)=>{const h=Math.max(1,p.y1-p.y0),down=gone[i]&&gone[Math.max(0,i-1)];M.compose(P3.set(p.x,p.y0+(down?h*.25:h/2),p.z),Q.identity(),S3.set(3.2,down?h*.5:h,4.2));piers.setMatrixAt(i,M);});
 const decks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.decks.length);V.decks.forEach((d,i)=>{if(gone[i]){const g=terrainH(d.x,d.z);M.compose(P3.set(d.x+8,Math.max(g,STAGE.lakeY-1)+2,d.z-6),Q.setFromEuler(E.set(.5,-d.yaw+.4,.35,'YXZ')),S3.set(d.len*.9,2.4,11));}
  else M.compose(P3.set(d.x,d.y-1.2,d.z),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,2.4,11));decks.setMatrixAt(i,M);});
 const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),rail,V.decks.length*2);V.decks.forEach((d,i)=>{[-3.6,3.6].forEach((o,k)=>{const ox=-Math.sin(d.yaw)*o,oz=Math.cos(d.yaw)*o;if(gone[i])M.compose(P3.set(0,-1e4,0),Q.identity(),S3.set(.01,.01,.01));else M.compose(P3.set(d.x+ox,d.y+.3,d.z+oz),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,.6,.4));rails.setMatrixAt(i*2+k,M);});});
 AV_LINES_GONE=gone.filter(Boolean).length;
 /* THE DEBRIS (the owner's third pass): the craters' ejecta and the streets' fallen slabs (STAGE.debris, AV.debris), tilted concrete blocks in the
    same rusted grime as the towers, one instanced mesh; every record on the ground at its own height */
 const D=STAGE.debris,dm=new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,color:0x5a5048,roughness:.98,metalness:0}),deb=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),dm,D.length);
 D.forEach((d,i)=>{const g=terrainH(d.x,d.z);M.compose(P3.set(d.x,g+d.sy*.3,d.z),Q.setFromEuler(E.set(d.tilt*.6,d.yaw,d.tilt,'YXZ')),S3.set(d.sx,d.sy,d.sz));deb.setMatrixAt(i,M);});
 deb.frustumCulled=false;deb.userData.inspectLabel='fallen slabs';deb.userData.host=true;deb.castShadow=deb.receiveShadow=!!MP.shadow;scene.add(deb);
 STAGE.craters.forEach((c,i)=>REGISTER({name:'A blast crater ('+Math.round(c.r)+' m)',kind:'crater',x:c.x,z:c.z,y:terrainH(c.x,c.z)-2,r:c.r*2.4,h:c.depth+c.rim+6,tags:{kind:'crater',n:i+1}}));
 /* THE LAMP STANDARDS (the owner, 2026-11-08: the grid carried by rows the eye follows): along both kerbs of every avenue, one every 30 m, 7 m tall, a
    bracket and a head; a third of them bent, a sixth fallen, by hash; none on a plinth, a scar, the water or the viaduct's corridor */
 const LT=STAGE.lattice,lamps=[],lampQ=[];const toW=(lx,lz)=>[lx*LT.c-lz*LT.s,lx*LT.s+lz*LT.c];
 (STAGE.transit?[]:STAGE.avenueLines()).forEach((lv,li)=>{for(let s=-STAGE.R-300;s<=STAGE.R+300;s+=30){   /* the kit's dress replaces these lamps */[[lv+LT.AW+1.5,s,0],[lv-LT.AW-1.5,s,0],[s,lv+LT.AW+1.5,1],[s,lv-LT.AW-1.5,1]].forEach((e,q)=>{const w=toW(e[0],e[1]),x=w[0],z=w[1];
   if(Math.hypot(x,z)>STAGE.R)return;if(STAGE.F.density(x,z)<.3||STAGE.F.scar(x,z)>.3||STAGE.built(x,z)>.05||STAGE.viaduct.d(x,z)<16)return;const g=terrainH(x,z);if(g<STAGE.lakeY+2)return;
   const h=KRAND.hash(STAGE.seed,li,Math.round(s/30),q+50),u=KRAND.unit(h);lamps.push({x,z,y:g,yaw:e[2]?Math.PI/2:0,state:u<.17?'fallen':u<.5?'bent':'up',u:KRAND.unit(KRAND.hash(h,3))});});}});
 const lampMat=new THREE.MeshStandardMaterial({color:0x4a4038,roughness:.9,metalness:.5}),LP=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),lampMat,lamps.length*2);
 lamps.forEach((l,i)=>{const H=7;if(l.state==='fallen'){M.compose(P3.set(l.x+Math.cos(l.u*6.28)*3,l.y+.2,l.z+Math.sin(l.u*6.28)*3),Q.setFromEuler(E.set(0,l.u*6.28,Math.PI/2*.97,'YXZ')),S3.set(.3,H,.3));LP.setMatrixAt(i*2,M);M.compose(P3.set(0,-1e4,0),Q.identity(),S3.set(.01,.01,.01));LP.setMatrixAt(i*2+1,M);return;}
  const tilt=l.state==='bent'?(.25+.5*l.u):0;M.compose(P3.set(l.x,l.y+H/2,l.z),Q.setFromEuler(E.set(tilt*Math.cos(l.u*4),l.yaw,tilt*Math.sin(l.u*4),'YXZ')),S3.set(.3,H,.3));LP.setMatrixAt(i*2,M);
  const ax=Math.sin(l.yaw),az=Math.cos(l.yaw),bx=l.x-Math.sin(tilt*Math.sin(l.u*4))*H*.5,bz=l.z+Math.sin(tilt*Math.cos(l.u*4))*H*.5;M.compose(P3.set(bx+ax*1.2,l.y+H*(1-.15*tilt)-.3,bz+az*1.2),Q.setFromEuler(E.set(0,l.yaw,0,'YXZ')),S3.set(.25,.35,2.6));LP.setMatrixAt(i*2+1,M);});
 LP.frustumCulled=false;LP.userData.inspectLabel='a lamp standard';LP.userData.host=true;scene.add(LP);
 if(lamps.length)REGISTER({name:'The avenues\' lamp standards',kind:'line',x:0,z:0,r:STAGE.R,h:8,tags:{kind:'line',line:'lamps',count:lamps.length}});
 AV_LAMPS=lamps;
 [piers,decks,rails].forEach(m=>{m.frustumCulled=false;m.userData.inspectLabel='the transit viaduct';m.userData.host=true;m.castShadow=m.receiveShadow=!!MP.shadow;scene.add(m);});
 if(V.decks.length)REGISTER({name:'The transit viaduct',kind:'line',x:0,z:-800,r:3000,h:60,tags:{kind:'line',line:'viaduct',length:Math.round(V.length)}});
 return{V,piers,decks,rails,debris:deb,tris:(V.piers.length+V.decks.length*3+D.length)*12};})();
