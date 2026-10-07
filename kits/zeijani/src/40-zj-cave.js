// prefix: cv
// ================================================================= THE CAVERN HOST: carved defs' void plans -> core/terrain/39-core-cavern.js
// A carved def's builder declares its VOID PLAN in its own frame (origin at the foot of its front, the rock behind it at -z),
// as it draws its front: cvMass (its block of host rock, on the kit sheet), cvRoom, cvTube, cvStair, cvShaft, cvTrench,
// cvMonolith, cvDoor (where a void meets the air through a face), cvWell (through the ground), cvFixture (carved furniture:
// a core/walk block). Each call turns the local plan into world metres through the running matrix (CM) and adds it to the
// page's cavern (CVC); the cavern writes the floors and blocks to core/walk (KWALK) when the world is built (cvFinish), and
// is meshed by chunk (surface nets) into CV_GROUP. The plan is the one source: rock, floors, furniture rooms and tags.
// Ids are local to the def: cvRoom({id:'hall'}) is '<site>.hall' in the cavern; `joins` name local ids too.
// Material (PLAN.md 6.1): every surface takes its primitive's rock and finish (tuff raw/hewn/plastered/polished, basalt raw
// or polished); the basalt tubes and halls blend the glazed lining low on the walls into the oxidised breakdown above it,
// the rare colours (magenta-purple, blue-violet, teal) where the cavern's slow field rises, and white crusts down drip lines.
// Triplanar over the library sets (Godot: one .gdshader with the same weights, or StandardMaterial3D uv1_triplanar).
let CVC=null;                    // the page's KCAVERN (cvNew on every world build)
const CV_GROUP=new THREE.Group(); // the chunk meshes
const CV_SITE=[];                // per cavern primitive (by index): the placement record it belongs to (cut-away, inspector)
let CV_STATS={chunks:0,tris:0,ms:0};
const CV_WELLSITE=[];             /* per well opening: its centre, its reach (radius, rim and a cell) and its placement record */
function cvNew(){CVC=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:.5,chunk:16,seed:7001,walk:KWALK,minRock:.8});CV_SITE.length=0;CV_WELLSITE.length=0;}
const cvTmp=new THREE.Vector3();
function cvW(x,y,z){cvTmp.set(x,y,z).applyMatrix4(CM);return [+cvTmp.x.toFixed(4),+cvTmp.y.toFixed(4),+cvTmp.z.toFixed(4)];}
function cvXZ(P){return P.map(p=>{const w=cvW(p[0],0,p[1]);return [w[0],w[2]];});}
function cvY(y){return cvW(0,y,0)[1];}
function cvSite(){return CURREC?(CURREC.tid||CURREC.key+'@'+REG.length):'sheet';}
function cvId(id){return cvSite()+'.'+id;}
function cvAdd(kind,o,Q){Q.id=cvId(o.id);Q.owner=cvSite();if(o.joins)Q.joins=o.joins.map(cvId);const P=CVC[kind](Q);CV_SITE[P.i]=CURREC;return P;}
function cvCopy(o,skip){const Q={};for(const k in o)if(skip.indexOf(k)<0)Q[k]=o[k];return Q;}
function cvMass(o){return cvAdd('mass',o,Object.assign(cvCopy(o,['id','poly','y0','y1','joins']),{poly:cvXZ(o.poly),y0:cvY(o.y0),y1:cvY(o.y1)}));}
function cvMonolith(o){return cvAdd('monolith',o,Object.assign(cvCopy(o,['id','poly','y0','y1','joins']),{poly:cvXZ(o.poly),y0:cvY(o.y0),y1:cvY(o.y1)}));}
function cvRoom(o){return cvAdd('room',o,Object.assign(cvCopy(o,['id','poly','y','joins']),{poly:cvXZ(o.poly),y:cvY(o.y||0)}));}
function cvTrench(o){return cvAdd('trench',o,Object.assign(cvCopy(o,['id','poly','y0','y1','joins']),{poly:cvXZ(o.poly),y0:cvY(o.y0),y1:cvY(o.y1)}));}
function cvTube(o){return cvAdd('tube',o,Object.assign(cvCopy(o,['id','pts','joins']),{pts:o.pts.map(p=>cvW(p[0],p[1],p[2]))}));}
function cvHall(o){const c=cvW(o.c[0],o.c[1],o.c[2]);const T=o.throat?Object.assign({},o.throat,{top:cvY(o.throat.top)}):undefined;
 return cvAdd('hall',o,Object.assign(cvCopy(o,['id','c','throat','joins']),{c,throat:T}));}
function cvStair(o){return cvAdd('stair',o,Object.assign(cvCopy(o,['id','a','b','joins']),{a:cvW(o.a[0],o.a[1],o.a[2]),b:cvW(o.b[0],o.b[1],o.b[2])}));}
function cvShaft(o){const c=cvW(o.c[0],0,o.c[1]);return cvAdd('shaft',o,Object.assign(cvCopy(o,['id','c','y0','y1','joins']),{c:[c[0],c[2]],y0:cvY(o.y0),y1:cvY(o.y1)}));}
function cvDoor(o){const c=cvW(o.c[0],0,o.c[1]);return CVC.opening({id:cvId(o.id),kind:'door',c:[c[0],c[2]],y:cvY(o.y||0),r:o.r||1.4,h:o.h});}
function cvWell(o){const c=cvW(o.c[0],0,o.c[1]);CV_WELLSITE.push({c:[c[0],c[2]],r:(o.r||1)+(o.rim===undefined?3:o.rim)+1.6,rec:CURREC});return CVC.opening({id:cvId(o.id),kind:'well',c:[c[0],c[2]],r:o.r,rim:o.rim});}
/* the floor a vertex's void stands on (the cut-away opens each void 2 m above it: a dollhouse at every level; a shaft opens whole); the rock's own
   faces (a mass, a monolith) take the site's ground */
function cvFloorOf(P,r){if(!P)return r.y;const k=P.kind;return k==='room'?P.y:k==='stair'?Math.min(P.a[1],P.b[1]):k==='hall'?P.c[1]:k==='shaft'?P.y0-2:k==='trench'?P.y0:
 k==='tube'&&P.pts?Math.min(...P.pts.map(p=>p[1])):r.y;}
function cvFixture(o){/* a carved bench, bed shelf or pillar: its local box [x0,x1,z0,z1,y0,y1] to a world box (quarter turns exact) */
 const b=o.box,P=[[b[0],b[2]],[b[1],b[2]],[b[0],b[3]],[b[1],b[3]]].map(p=>cvW(p[0],0,p[1]));
 return CVC.fixture({id:cvId(o.id),owner:cvSite(),tag:o.tag||'carved:'+(o.kind||'fixture'),
  box:[Math.min(...P.map(p=>p[0])),Math.max(...P.map(p=>p[0])),Math.min(...P.map(p=>p[2])),Math.max(...P.map(p=>p[2])),cvY(b[4]),cvY(b[5])]});}

// ---------------------------------------------------------------- the rock material (triplanar library sets, per-vertex weights)
const CVU={uCut:ANIMU.uCut,uCam:ANIMU.uCam};
const CV_TEXKEYS=['tuff','tuffHewn','plaster','tuffPol','basalt','basaltPol','lining','oxide'];
const CV_HAS_LIB=KMAT.mode==='lib'&&CV_TEXKEYS.every(k=>ZJ_LIBTEX[k]&&ZJ_LIBTEX[k].map);
const cvRockMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92,metalness:0});
(function(){const lin=h=>new THREE.Color(h).convertSRGBToLinear(),v3=c=>'vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')';
 /* the procedural fallback colours (?mat=proc) and the rare-colour palette, PLAN.md section 10 */
 const C={tuff:lin(0xd9c8a6),hewn:lin(0xcdbb98),plaster:lin(0xe6dcc6),pol:lin(0xc9a28c),basalt:lin(0x5c6672),basPol:lin(0x2b2e34),lining:lin(0x5c6672),
  oxide:lin(0x9a3a3c),mag:lin(0x74406e),vio:lin(0x4a4e8a),teal:lin(0x4a9490),mineral:lin(0xdcd8d0)};
 const K=k=>(1/TILE[k]).toFixed(5);
 matHook(cvRockMat,'cave'+(CV_HAS_LIB?'L':'P'),sh=>{sh.uniforms.uCut=CVU.uCut;sh.uniforms.uCam=CVU.uCam;
  if(CV_HAS_LIB)CV_TEXKEYS.forEach(k=>{sh.uniforms['uT_'+k]={value:ZJ_LIBTEX[k].map};});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aCut;attribute vec3 aM;varying vec4 vW;varying vec4 vCut;varying vec3 vM;varying vec3 vCWP,vCWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW=aW;vCut=aCut;vM=aM;vCWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCWN=normalize(mat3(modelMatrix)*objectNormal);');
  /* aM: x the material (KCAVERN.MATS index), y the rare hue, z the occlusion */
  let decl='uniform float uCut;uniform vec3 uCam;varying vec4 vW;varying vec4 vCut;varying vec3 vM;varying vec3 vCWP,vCWN;';
  let body;
  if(CV_HAS_LIB){decl+='uniform sampler2D '+CV_TEXKEYS.map(k=>'uT_'+k).join(',')+';'+
    'vec3 cvTri(sampler2D t,vec3 p,vec3 n,float k){vec3 w=pow(abs(n),vec3(4.0));w/=w.x+w.y+w.z;return pow(texture2D(t,p.zy*k).rgb*w.x+texture2D(t,p.xz*k).rgb*w.y+texture2D(t,p.xy*k).rgb*w.z,vec3(2.2));}';
   body='vec3 n=normalize(vCWN),p=vCWP;float m=vM.x;vec3 c;'+
    'if(m<1.5){vec3 bs=m<0.5?cvTri(uT_basalt,p,n,'+K('basalt')+'):cvTri(uT_basaltPol,p,n,'+K('basaltPol')+');'+
     'c=mix(bs,cvTri(uT_lining,p,n,'+K('lining')+'),vW.x*(m<0.5?1.0:0.4));c=mix(c,cvTri(uT_oxide,p,n,'+K('oxide')+'),vW.y*(m<0.5?1.0:0.0));}'+
    'else if(m<2.5)c=cvTri(uT_tuff,p,n,'+K('tuff')+');else if(m<3.5)c=cvTri(uT_tuffHewn,p,n,'+K('tuffHewn')+');'+
    'else if(m<4.5)c=cvTri(uT_plaster,p,n,'+K('plaster')+');else c=cvTri(uT_tuffPol,p,n,'+K('tuffPol')+');';}
  else body='vec3 n=normalize(vCWN);float m=vM.x;vec3 c=m<0.5?mix(mix('+v3(C.basalt)+','+v3(C.lining)+',vW.x),'+v3(C.oxide)+',vW.y):m<1.5?'+v3(C.basPol)+':m<2.5?'+v3(C.tuff)+':m<3.5?'+v3(C.hewn)+':m<4.5?'+v3(C.plaster)+':'+v3(C.pol)+';';
  body+='{float h=vM.y;vec3 rc=h<0.5?mix('+v3(C.mag)+','+v3(C.vio)+',h*2.0):mix('+v3(C.vio)+','+v3(C.teal)+',h*2.0-1.0);'+
   'float L=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(c,rc*(0.55+L*1.6),vW.z*0.75);c=mix(c,'+v3(C.mineral)+'*(0.6+L),vW.w*0.6);}'+
   /* the library sets are normalised to a mean near 0.75 (tuff) or darker (basalt): lift the basalt, keep the tuff */
   'diffuseColor.rgb*=c*'+(CV_HAS_LIB?'(m<1.5?1.7:1.05)':'1.0')+';';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl)
   .replace('void main() {','void main() {\nif(uCut>.5&&vCut.w>.5&&vCWP.y>vCut.z+2.)discard;')
   .replace('#include <map_fragment>','#include <map_fragment>\n{'+body+'}')
   /* the polished finishes are smooth; the occlusion darkens the indirect light */
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nif(vM.x>4.5||(vM.x>0.5&&vM.x<1.5))roughnessFactor=0.42;')
   .replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectDiffuse*=vM.z;reflectedLight.indirectSpecular*=vM.z;');});})();

// ---------------------------------------------------------------- build: the plan to the walk registry, the chunks to meshes
function cvFinish(parent){const t0=performance.now();CVC.build();
 while(CV_GROUP.children.length){const m=CV_GROUP.children.pop();m.geometry.dispose();}
 let tris=0;
 for(const key of CVC.chunks){const ch=CVC.meshChunk(key);if(!ch.idx.length)continue;const nv=ch.pos.length/3;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  g.setAttribute('aW',new THREE.BufferAttribute(ch.w,4));
  const aM=new Float32Array(nv*3),aCut=new Float32Array(nv*4);
  for(let i=0;i<nv;i++){aM[i*3]=ch.mat[i];aM[i*3+1]=ch.hue[i];aM[i*3+2]=ch.occ[i];
   const r=ch.prim[i]<65535?CV_SITE[ch.prim[i]]:null;if(r){aCut[i*4]=r.x;aCut[i*4+1]=r.z;aCut[i*4+2]=cvFloorOf(CVC.prims[ch.prim[i]],r);aCut[i*4+3]=1;}
   /* the ground the cavern meshes inside a well's rim opens with the well's site */
   else if(ch.ground&&ch.ground[i]){const x=ch.pos[i*3],z=ch.pos[i*3+2],q=CV_WELLSITE.find(q=>Math.hypot(x-q.c[0],z-q.c[1])<q.r);if(q&&q.rec){aCut[i*4]=q.rec.x;aCut[i*4+1]=q.rec.z;aCut[i*4+2]=q.rec.y-3;aCut[i*4+3]=1;}}}
  g.setAttribute('aM',new THREE.BufferAttribute(aM,3));g.setAttribute('aCut',new THREE.BufferAttribute(aCut,4));
  g.setIndex(new THREE.BufferAttribute(ch.idx,1));g.computeBoundingSphere();
  const mesh=new THREE.Mesh(g,cvRockMat);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.cavern=key;CV_GROUP.add(mesh);tris+=ch.idx.length/3;}
 parent.add(CV_GROUP);
 /* the masses' footprints to the sheet's ground (90-scene.js): no ground under a block of rock */
 if(typeof ZJ_MASSES!=='undefined'){ZJ_MASSES.value.forEach(v=>v.set(0,0,0,0));let n=0;for(const P of CVC.prims){if(P.kind!=='mass'||n>=32)continue;const xs=P.poly.map(p=>p[0]),zs=P.poly.map(p=>p[1]);
  ZJ_MASSES.value[n++].set(Math.min(...xs)+.05,Math.max(...xs)-.05,Math.min(...zs)+.05,Math.max(...zs)-.05);}}
 /* ...and every well's hole (r + rim: inside it the cavern meshes the ground) */
 if(typeof ZJ_HOLES!=='undefined'){ZJ_HOLES.value.forEach(v=>v.set(0,0,0,0));let n=0;for(const O of CVC.openings){if(O.kind!=='well'||n>=32)continue;ZJ_HOLES.value[n++].set(O.c[0],O.c[1],O.r+O.rim-.05,0);}}
 CV_STATS={chunks:CV_GROUP.children.length,tris:Math.round(tris),ms:Math.round(performance.now()-t0),prims:CVC.prims.length};
 GSTAT.tris+=tris;}
/* the sheet's ground for the walker: the sheet's square less every mass's footprint (a block of rock is not walked through:
   its rooms are), as axis-aligned rects */
function cvGroundWalk(x0,x1,z0,z1){const M=CVC.prims.filter(P=>P.kind==='mass').map(P=>{const xs=P.poly.map(p=>p[0]),zs=P.poly.map(p=>p[1]);
  return [Math.min(...xs)-.3,Math.max(...xs)+.3,Math.min(...zs)-.3,Math.max(...zs)+.3];});
 /* and round each well (a kiva's hatch, a light well): no ground over the hole, so a walker goes down its ladder or stair */
 for(const O of CVC.openings)if(O.kind==='well')M.push([O.c[0]-O.r,O.c[0]+O.r,O.c[1]-O.r,O.c[1]+O.r]);
 let rects=[[x0,x1,z0,z1]];
 for(const m of M){const out=[];for(const r of rects){if(m[0]>=r[1]||m[1]<=r[0]||m[2]>=r[3]||m[3]<=r[2]){out.push(r);continue;}
   if(r[0]<m[0])out.push([r[0],m[0],r[2],r[3]]);if(m[1]<r[1])out.push([m[1],r[1],r[2],r[3]]);
   const a=Math.max(r[0],m[0]),b=Math.min(r[1],m[1]);if(r[2]<m[2])out.push([a,b,r[2],m[2]]);if(m[3]<r[3])out.push([a,b,m[3],r[3]]);}rects=out;}
 rects.forEach((r,i)=>KWALK.floor({rect:r,y:0,name:'the sheet\'s ground #'+i,tag:'ground'}));return rects.length;}
/* ---------------------------------------------------------------- a carved def's void plan from its interiors item
   kits/interiors/sets/zeijani.js holds, per carved def, its rooms (ROOM() data: poly, y, h, doors, fixtures; the cavern's own
   fields ceil, rise, round, finish, rock ride along, ignored by the interiors kit) and a `voids` list the interiors kit ignores:
   { kind:'stair'|'tube'|'hall'|'shaft'|'trench'|'monolith'|'mass'|'door'|'well'|'room'|'walk'|'floor'|'block', id, ... } in the def's frame. Carving
   from that one record keeps the rock, the walk floors, the rooms and their furniture in agreement. */
function cvFromItem(item,o){o=o||{};if(!item)return 0;let n=0;const fin=o.finish||'hewn';
 /* the order the cavern composes in: masses and pits (trenches) first, then the rock left standing in them (monoliths), then
    the rooms (carved into a monolith: Kailasa's sanctum), then every other void; `phase` on a void overrides (pillars left
    standing in a cloister after it is cut: a monolith with phase 3) */
 const PH={mass:0,trench:0,monolith:1},list=(item.voids||[]).map((v,i)=>({v,i,ph:v.phase!==undefined?v.phase:(PH[v.kind]!==undefined?PH[v.kind]:3)}));
 const doVoid=v=>{const k=v.kind,q=Object.assign({},v);delete q.kind;delete q.phase;if(!q.finish&&k!=='tube'&&k!=='hall')q.finish=fin;
  if(k==='stair')cvStair(q);else if(k==='tube')cvTube(q);else if(k==='hall')cvHall(q);else if(k==='shaft')cvShaft(q);else if(k==='trench')cvTrench(q);
  else if(k==='room')cvRoom(q);   /* a void room that is no interiors room (a kiva's bench terrace: floor:false keeps it off the walk map) */
  else if(k==='monolith')cvMonolith(q);else if(k==='mass')cvMass(q);else if(k==='door')cvDoor(q);else if(k==='well')cvWell(q);
  else if(k==='walk'){/* a built stair inside a void (the well's spiral): a floor strip only; the def draws its steps */
   const a=cvW(q.a[0],q.a[1],q.a[2]),b=cvW(q.b[0],q.b[1],q.b[2]);KWALK.strip({a:[a[0],a[2],a[1]],b:[b[0],b[2],b[1]],w:q.w,name:cvId(q.id),tag:'built:stair'});}
  else if(k==='floor'){/* a walk floor on rock left standing (a monolith's top: Kailasa's terrace), less its holes */
   const pts=q.poly.map(p=>cvXZ([p])[0]),holes=(q.holes||[]).map(h=>h.map(p=>cvXZ([p])[0]));zwMinusHoles(pts,holes).forEach((P2,j)=>KWALK.poly({pts:P2.map(p=>[p[0],p[1],cvY(q.y)]),name:cvId(q.id)+(j?'.'+j:''),tag:q.tag||'built:terrace'}));}   /* tag 'cavern:floor': on carved rock (the probe's walk-on-mesh samples it) */
  else if(k==='block'){/* a walk block (a monolith's edge the walker must not step off or walk into) */
   const c=[[q.box[0],q.box[2]],[q.box[1],q.box[3]]].map(p=>cvXZ([p])[0]);KWALK.block([Math.min(c[0][0],c[1][0]),Math.max(c[0][0],c[1][0]),Math.min(c[0][1],c[1][1]),Math.max(c[0][1],c[1][1]),cvY(q.box[4]),cvY(q.box[5])],'carved:edge');}
  else{reportErr('cvFromItem '+item.key+': no void kind '+k);return;}n++;};
 list.filter(e=>e.ph<2).sort((a,b)=>a.ph-b.ph||a.i-b.i).forEach(e=>doVoid(e.v));
 for(const r of item.rooms||[]){if(!(r.carved===true||(item.carved&&r.carved!==false)))continue;cvRoom({id:r.id,poly:r.poly,y:r.y||0,h:r.h||2.6,ceil:r.ceil||'flat',rise:r.rise||0,r:r.round||0,finish:r.finish||fin,rock:r.rock||o.rock||'tuff',joins:r.joins});n++;
  for(const f of r.fixtures||[]){if(f.kind==='ladder'||f.kind==='sipapu'||f.kind==='stair')continue;const hw=f.w/2,hd=f.d/2,q=Math.abs(Math.round((f.ry||0)/(PI/2)))%2===1;
   const ex=q?hd:hw,ez=q?hw:hd;cvFixture({id:r.id+'.'+(f.id||f.kind),kind:f.kind,box:[f.x-ex,f.x+ex,f.z-ez,f.z+ez,r.y||0,(r.y||0)+(f.h||.5)]});}}
 list.filter(e=>e.ph>=2).sort((a,b)=>a.ph-b.ph||a.i-b.i).forEach(e=>doVoid(e.v));
 return n;}
