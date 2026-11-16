// ================================================================= THEODIGA TODAY — people and lamps, drawn from their records
// thLifeDraw(gx, gz, ctx, L) draws what TH_LIFE.make (src/45-th-life.js, [G data]) placed. The figures are the kit's figure, its
// body and head (src/34-kitdefs.js figB, figH), each robed by its role: the pilgrims in the Decree's saffron and maroon, the
// townsfolk in the scrap town's browns and dyed cloth, the salvagers grey, the farmers olive, the Rare Devisers in the licence's
// blue, their haulers in leather. A lamp is a post, a lantern head and a glow, the glow shown only at night; at night six
// lights at the lamps' spread light the town, and the town's windows are lit (the scrap set's glass, XAK.MAT.xGlass, takes a
// warm emissive while NIGHT is on).
// THE TOWN'S OWN INSTANCES (thInst, also the works' gear in 8ay3): drawn as the town's InstancedMeshes named 'theodiga:town ...'
// and not through the kit's kput, so core/ruins (90w, which skips the town by name) does not take a lamp on the rim or a derrick
// in the yards for wreckage of the dam. Called by thTownDraw; tagged in core/tags before drawing.
const TH_NIGHT=[];   /* what shows only at night, or switches: [{on(v)}] */
if(typeof tick==='function')tick(()=>{for(const N of TH_NIGHT)N.on(!!NIGHT);});
/* an InstancedMesh of one geometry and material at the dam group's offset: items [{p:[x,y,z], q, s (number or [sx,sy,sz]), c}] */
function thInst(name,geo,mat,items,gx,gz,shadow){if(!items.length)return null;
 const M=new THREE.InstancedMesh(geo,mat,items.length),m4=new THREE.Matrix4(),V=new THREE.Vector3(),S=new THREE.Vector3(),Q0=new THREE.Quaternion();let col=false;
 items.forEach((it,i)=>{const s=it.s==null?1:it.s;if(Array.isArray(s))S.set(s[0],s[1],s[2]);else S.set(s,s,s);V.set(it.p[0]+gx,it.p[1],it.p[2]+gz);m4.compose(V,it.q||Q0,S);M.setMatrixAt(i,m4);
  if(it.c){M.setColorAt(i,it.c);col=true;}});
 /* the page's three.js has no InstancedMesh bounds (its culling would take the geometry's, at the origin): never culled */
 if(col)M.instanceColor.needsUpdate=true;M.instanceMatrix.needsUpdate=true;M.frustumCulled=false;
 M.name='theodiga:town '+name;M.castShadow=!!shadow;M.receiveShadow=true;M.userData.probeSkip=true;scene.add(M);return M;}
const TH_GEO={figB:new THREE.CylinderGeometry(.24,.2,1.5,6).translate(0,.75,0),figH:new THREE.SphereGeometry(.13,6,5).translate(0,1.62,0),
 post:new THREE.CylinderGeometry(1,1,1,8),box:new THREE.BoxGeometry(1,1,1)};
const thQ=(x,y,z)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));
function thLifeDraw(gx,gz,ctx,L,opt){const O={people:0,lamps:0,lights:0};
 if(!L)return O;
 /* with the census walking (T-sim-2, 8ay9-th-walkers.js) the static figures stand down: only the lamps are drawn */
 if(opt&&opt.noPeople)L=Object.assign({},L,{people:[]});
 const TG=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'})),B='town/theodiga';
 const ROBE={pilgrim:[[.08,.75,.45],[.98,.55,.28]],townsfolk:[[.06,.35,.32],[.12,.3,.4]],salvager:[[.08,.06,.34],[.1,.1,.42]],farmer:[[.2,.3,.3],[.18,.25,.38]],
  deviser:[[.6,.5,.28],[.62,.45,.34]],hauler:[[.07,.4,.26],[.08,.35,.32]]};
 const SKIN=[0xc9a17e,0xa97c55,0x8a5f3c,0xd8b48e];
 const U=(id,s)=>KRAND.unit(KRAND.hash(2213,TH_LIFE.hid(id),s));
 /* one record for the people (by role) and one for the lamps: each figure is a pose, not a person of the census */
 const by={};for(const p of L.people)by[p.role]=(by[p.role]||0)+1;
 TG.child(B,{'class':'feature',kind:'people',key:'th.life.people',name:'the people out in Theodiga',at:[gx+300,440,gz],tags:Object.assign({n:L.people.length},by)});
 TG.child(B,{'class':'feature',kind:'lamps',key:'th.life.lamps',name:'the lamps of the town, the kora and the bore',at:[gx+300,440,gz],tags:{n:L.lamps.length}});
 const body=[],head=[];
 for(const p of L.people){const R=ROBE[p.role]||ROBE.townsfolk,h=R[0][0]+(R[1][0]-R[0][0])*U(p.id,1),s=R[0][1]+(R[1][1]-R[0][1])*U(p.id,2),l=R[0][2]+(R[1][2]-R[0][2])*U(p.id,3);
  const sc=.92+.16*U(p.id,4);
  body.push({p:[p.x,p.y,p.z],q:thQ(0,p.ry,0),s:sc,c:new THREE.Color().setHSL(h,s,l)});head.push({p:[p.x,p.y,p.z],s:sc,c:new THREE.Color(SKIN[Math.floor(U(p.id,5)*SKIN.length)])});O.people++;}
 const FIG=MAT.fig||new THREE.MeshStandardMaterial({roughness:.9});
 thInst('people',TH_GEO.figB,FIG,body,gx,gz,true);thInst('people\'s heads',TH_GEO.figH,FIG,head,gx,gz,false);
 /* the lamps: the post, the head, and the glow (night only) */
 const posts=[],heads=[],glows=[];
 for(const l of L.lamps){posts.push({p:[l.x,l.y+l.h/2,l.z],s:[.08,l.h,.08]});heads.push({p:[l.x,l.y+l.h+.18,l.z],s:[.32,.36,.32]});glows.push({p:[l.x,l.y+l.h-.05,l.z],s:[.9,.9,.9]});O.lamps++;}
 thInst('lamp posts',TH_GEO.post,MAT.rust||MAT.dark,posts,gx,gz,false);thInst('lamp heads',TH_GEO.box,MAT.dark,heads,gx,gz,false);
 const G=thInst('lamp glows',typeof crossGeo==='function'?crossGeo():TH_GEO.box,MAT.ember||new THREE.MeshBasicMaterial({color:0xffb35a}),glows,gx,gz,false);
 if(G){G.visible=false;G.userData.lodSkip=true;TH_NIGHT.push({on:v=>{G.visible=v;}});}
 /* six lights at night, at lamps picked farthest from one another (from the first), each a few metres over its lamp */
 if(L.lamps.length>=6){const P=[L.lamps[0]];
  while(P.length<6){let bi=0,bd=-1;L.lamps.forEach((l,i)=>{let m=1e18;for(const q of P)m=Math.min(m,(q.x-l.x)**2+(q.z-l.z)**2);if(m>bd){bd=m;bi=i;}});P.push(L.lamps[bi]);}
  for(const l of P){const Lt=new THREE.PointLight(0xffa850,0,260,2);Lt.position.set(l.x+gx,l.y+l.h+6,l.z+gz);Lt.visible=false;scene.add(Lt);
   TH_NIGHT.push({on:v=>{Lt.visible=v;Lt.intensity=v?1.6:0;}});O.lights++;}}
 /* the windows lit after dark */
 const XG=typeof XAK!=='undefined'&&XAK.MAT&&XAK.MAT.xGlass;
 if(XG&&XG.emissive){XG.emissive=new THREE.Color(0xffa850);XG.emissiveIntensity=0;TH_NIGHT.push({on:v=>{XG.emissiveIntensity=v?.85:0;}});}
 return O;}
