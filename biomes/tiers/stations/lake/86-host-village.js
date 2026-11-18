// ================================================================= HOST — STATION 1: THE LAKE VILLAGE (a Coyote fishing village; PLAN.md section 6)
// An NPC settlement, not a player outpost (the owner's rule). The lake towns and fishing villages on the upper lake's north shore (PLAN.md section 6,
// proposed: reed boats, fish weirs, the shelf-oak woods, terraced fields up the riser). Here as RECORDS FIRST: KHAMLET.village (core/hamlet 30,
// a fishing village of the Tierhounds, the Coyote Men of the Tiers) lays its census, its green, its lanes and its buildings as plain records keyed
// by stable ids, registered in core/tags before anything is drawn, then drawn as STAND-INS AT THEIR BOXES: core/hamlet has no Coyote row, so the
// culture is KHAMLET.pendingRow('coyote') (32-hamlet-platform.js) and every record is `pending` (a building kits/coyote does not have yet: the
// Tierhounds' stepped mud-brick rooms, flat roofs as terraces, the trickster's shrine). The stand-ins keep the plan's massing: flat-roofed
// mud-brick blocks with a parapet, the shrine a stepped cairn, the fish docks reed-roofed sheds. Owed with them (KNOWN_ISSUES.md): kits/coyote's
// buildings, the reed boats and the fish weirs (a landing row for the culture), core/simulation's books for the village.
// VILLAGE.build() runs first in the build (89z: LAND.prebuild), so the kit's trees keep clear of the boxes (BIO.obstacle).
const VILLAGE=(function(){
 const SITE_V={x:-700,z:380},LINK={x:-250,z:230};   /* the village point on the shore's bench, its main lane toward the stair road's foot */
 const ok=(x,z)=>{const h=terrainH(x,z);if(h<STATION.LV+2.5)return false;if(STATION.farmK(x,z)>0)return false;
  const e=3,s=Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);return s<.16&&STATION.roadD(x,z)>2.5;};
 let V=null,err=null;
 try{V=KHAMLET.village({id:'tiers-lake-village',world:6120,culture:KHAMLET.pendingRow('coyote'),focus:'fishing',popMax:160,site:SITE_V,link:LINK,
  dims:()=>null,ground:{ok},siteReach:500});if(V.error)err=V.error;}catch(e){err=String(e&&e.message||e);}
 const recs=V&&!err?V.records.slice():[];
 recs.forEach(r=>{r.y=terrainH(r.x,r.z);r.name=(r.key||'a building').replace(/^coyote-/,'').replace(/-/g,' ');r.name='The village\'s '+r.name+' (pending: kits/coyote)';});
 // ---------------------------------------------------------------- the drawing: stand-ins at the records' boxes, one merged mesh per surface
 const SURF={mud:{c:0x7a5a40,label:'Coyote mud brick (stand-in: kits/coyote, planned)'},roof:{c:0x5e4632,label:'Flat roofs and parapets (stand-in)'},
  reed:{c:0x8a7650,label:'Reed thatch (stand-in)'},stone:{c:0x5e5852,label:'Contour-carved stone (stand-in)'},wood:{c:0x6a4e36,label:'Poles and frames'}};
 const ACC={};for(const k in SURF)ACC[k]={pos:[],nor:[],idx:[]};
 const T=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Vv=new THREE.Vector3(),Sv=new THREE.Vector3(),N3=new THREE.Matrix3();
 function put(surf,geo,x,y,z,ry,sx,sy,sz){const A=ACC[surf],p=geo.attributes.position,n=geo.attributes.normal,o=A.pos.length/3;
  T.compose(Vv.set(x,y,z),Q.setFromEuler(E.set(0,ry,0)),Sv.set(sx,sy,sz));N3.getNormalMatrix(T);const v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(T);A.pos.push(v.x,v.y,v.z);v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(N3).normalize();A.nor.push(v.x,v.y,v.z);}
  if(geo.index)for(let i=0;i<geo.index.count;i++)A.idx.push(o+geo.index.getX(i));else for(let i=0;i<p.count;i++)A.idx.push(o+i);}
 const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,8,1).translate(0,.5,0);
 const PYR=new THREE.ConeGeometry(.72,1,4,1).rotateY(Math.PI/4).translate(0,.5,0);
 const foot=r=>{let m=terrainH(r.x,r.z);for(const [a,b] of [[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]]){const c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),dx=a*r.w,dz=b*r.d;m=Math.min(m,terrainH(r.x+dx*c+dz*s,r.z-dx*s+dz*c));}return m;};
 function draw(r){const yb=foot(r)-.4,y0=Math.max(r.y,foot(r)),top=y0+r.h;   /* each piece sunk to the lowest ground under its box: no gap on a slope */
  if(/shrine/.test(r.key)){for(let k=0;k<3;k++)put('stone',BOX,r.x,k?y0+k*1.1:yb,r.z,r.ry,r.w*(1-k*.28),k?1.1:y0+1.1-yb,r.d*(1-k*.28));put('stone',PYR,r.x,y0+3.3,r.z,r.ry,r.w*.3,1.2,r.d*.3);return;}
  if(/fish|dock|smoke|net/.test(r.key)){for(const [dx,dz] of [[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]])put('wood',CYL,r.x+dx*r.w*Math.cos(r.ry)+dz*r.d*Math.sin(r.ry),yb,r.z-dx*r.w*Math.sin(r.ry)+dz*r.d*Math.cos(r.ry),0,.22,top-yb,.22);
   put('reed',PYR,r.x,top-.2,r.z,r.ry,r.w*1.05,r.h*.5,r.d*1.05);put('mud',BOX,r.x,yb,r.z,r.ry,r.w*.5,y0+1.2-yb,r.d*.7);return;}
  put('mud',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);put('roof',BOX,r.x,top,r.z,r.ry,r.w+.3,.35,r.d+.3);   /* the flat roof's parapet */
  if(r.w>9)put('mud',BOX,r.x+Math.cos(r.ry)*r.w*.18,top+.35,r.z-Math.sin(r.ry)*r.w*.18,r.ry,r.w*.45,r.h*.55,r.d*.7);}   /* a stepped upper room on the larger */
 const MESHES=[],PP=[];   /* PP: one probe point a building, the middle of its box (a merged mesh's box centre is one sample: core/host's probe) */
 function build(){if(err){reportErr('the lake village: '+err);return{records:0,error:err};}
  recs.forEach(r=>{REGISTER({name:r.name,key:r.key,cls:'building',kind:'building',culture:'coyote',pending:true,id:r.id,x:r.x,z:r.z,y:foot(r)-.4,r:Math.hypot(r.w,r.d)*.5,h:r.h+1.2,
   tags:{settlement:'tiers-lake-village',role:r.role,culture:'coyote',pending:true}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1.5});draw(r);PP.push(r.x,Math.max(r.y,foot(r))+r.h*.5,r.z);});
  for(const k in ACC){const A=ACC[k];if(!A.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
   g.setAttribute('normal',new THREE.Float32BufferAttribute(A.nor,3));g.setIndex(A.idx);
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:SURF[k].c}));m.userData.host=true;m.userData.village=true;m.userData.inspectLabel=SURF[k].label;scene.add(m);MESHES.push(m);}
  if(MESHES.length)MESHES[0].userData.probePoints=new Float32Array(PP);
  return{records:recs.length,pop:V.census.pop,households:V.census.households,works:V.census.works.map(w=>w.key+' x'+w.n).join(', ')};}
 return{V,records:recs,build,meshes:MESHES,error:err,site:SITE_V};})();
