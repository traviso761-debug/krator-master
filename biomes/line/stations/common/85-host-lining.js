// ================================================================= HOST — the builder and the lining
// LB: a small geometry builder for the Line's drawn works (quads, boxes and polygons into one bucket a family and a 100 m chunk, vertex colours
// linear, UVs in metres so the library's maps lie at their scale with no shader hook). It is this build's until KTRANSIT.draw takes the line kind
// (PLAN.md section 12: the transit kit's B.sweep and the subway's swept bore are its model).
//
// THE LINING (PLAN.md section 3): precast segments 0.6 m thick in rings 2 m long, drawn as the inner face of the window's section at each ring
// (LINE.sectionAt / profileAt): each ring a little different in tone (core/rand by its index), its joint a dark groove; a bronze band where the
// structure transfers, every 3.6 m (the Ancients' storey); the openings (LINE.openings: niches, doors, a branch's mouth) left in the walls with
// their jambs; an end wall where the section changes (the gallery into a station's cavern); no ring where the window has none (a fall), and a
// ragged edge where LINE.liningCut says a segment is gone. The face is `concrete.ancient` until `concrete.lining.segment` comes (section 41).
const LB=(function(){
 const lin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
 const rgb=h=>[lin(((h>>16)&255)/255),lin(((h>>8)&255)/255),lin((h&255)/255)];
 const FAM={lining:{rough:.88,metal:0},guide:{rough:.7,metal:0},conc:{rough:.85,metal:0},road:{rough:.9,metal:0},metal:{rough:.6,metal:.35},
  bronze:{rough:.45,metal:.6},grate:{rough:.6,metal:.4},glow:{basic:true},paint:{rough:.7,metal:.1},rubble:{rough:.95,metal:0},white:{rough:.5,metal:.15},glass:{rough:.15,metal:.3}};
 const MATS={};
 function mat(f){if(MATS[f])return MATS[f];const o=FAM[f]||FAM.conc;let m;
  if(o.basic)m=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
  else{const P=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('line',f):null,X=P?KMAT.textures(P,{aniso:8}):{};
   if(P&&P.scale)[X.map,X.normalMap,X.roughnessMap].forEach(t=>{if(t)t.repeat.set(1/P.scale[0],1/P.scale[1]);});
   m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough,metalness:o.metal,side:THREE.DoubleSide,map:X.map||null,normalMap:X.normalMap||null,roughnessMap:X.roughnessMap||null});}
  m.name='line:'+f;return MATS[f]=m;}
 function B(chunk){const buckets=new Map(),CH=chunk||100;let tris=0;
  const bk=(f,z)=>{const k=f+'|'+Math.floor(z/CH);let b=buckets.get(k);if(!b){b={f,p:[],n:[],c:[],u:[]};buckets.set(k,b);}return b;};
  function tri(f,a,b,c,col,ua,ub,uc){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
   const K=bk(f,(a[2]+b[2]+c[2])/3);for(const [p,u] of [[a,ua],[b,ub],[c,uc]]){K.p.push(p[0],p[1],p[2]);K.n.push(nx,ny,nz);K.c.push(col[0],col[1],col[2]);K.u.push(u[0],u[1]);}tris++;}
  function uvOf(p,n){const ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);return ay>=ax&&ay>=az?[p[0],p[2]]:ax>=az?[p[2],p[1]]:[p[0],p[1]];}
  function quad(f,a,b,c,d,col,uv){let u=uv;if(!u){const n=[(b[1]-a[1])*(d[2]-a[2])-(b[2]-a[2])*(d[1]-a[1]),(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]),(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0])];u=[a,b,c,d].map(p=>uvOf(p,n));}
   tri(f,a,b,c,col,u[0],u[1],u[2]);tri(f,a,c,d,col,u[0],u[2],u[3]);}
  function box(f,x0,x1,y0,y1,z0,z1,col,noTop){
   if(!noTop)quad(f,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],col);
   quad(f,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],col);quad(f,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],col);
   quad(f,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col);quad(f,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col);}
  /* a flat polygon in the plane z = const (an end wall), outer with holes, [[x, y]] each, triangulated by three's ShapeUtils */
  function polyZ(f,z,outer,holes,col){const V=v=>new THREE.Vector2(v[0],v[1]),O=outer.map(V),H=(holes||[]).map(h=>h.map(V)),all=O.concat(...H);
   const T=THREE.ShapeUtils.triangulateShape(O,H);for(const t of T){const a=all[t[0]],b=all[t[1]],c=all[t[2]];tri(f,[a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z],col,[a.x,a.y],[b.x,b.y],[c.x,c.y]);}}
  /* a top-down polygon at height y (a platform's top, a chamber's floor patch): [[x, z]], a fan from its first point (convex) */
  function polyY(f,y,pts,col){for(let i=1;i+1<pts.length;i++){const a=pts[0],b=pts[i],c=pts[i+1];tri(f,[a[0],y,a[1]],[b[0],y,b[1]],[c[0],y,c[1]],col,[a[0],a[1]],[b[0],b[1]],[c[0],c[1]]);}}
  function finish(name,o){const g=new THREE.Group();g.name=name;
   buckets.forEach(b=>{if(!b.p.length)return;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));
    geo.computeBoundingSphere();const m=new THREE.Mesh(geo,mat(b.f));m.receiveShadow=true;m.userData.lineFam=b.f;m.userData.inspectLabel=(o&&o.label&&o.label[b.f])||name;g.add(m);});
   g.userData.tris=tris;return g;}
  return {tri,quad,box,polyZ,polyY,finish,get tris(){return tris;}};}
 return {B,rgb,mat};})();

/* the sections at z: the window's LINE.sectionsAt(z) where a ring has more than one (twin bores), else its one LINE.sectionAt(z); a section's
   profile is LINE.profileAt(z, S) */
const SECS_AT=z=>LINE.sectionsAt?LINE.sectionsAt(z):(s=>s?[s]:[])(LINE.sectionAt(z));
/* THE LINING, THE WAY'S WORKS, THE GUIDEWAYS AND THE CROSSOVERS through the line kind's draw (KTRANSIT.draw.line, kits/ancient-transit 56c): the
   window of the one record (RIFT.window(...).local, the page's frame) with this page as its host: its sections (several a ring where bores run
   side by side), its profile, the lining it has lost (LINE.liningCut), its openings (niches, doors, windows, a branch's mouth: holes with jambs),
   the gallery's works where LINE.gallerySpans say, the cyan lit where LINE.cyanLit says; the station's own works stay its own. The page's
   materials (materials.json) by the kind's family names */
const LINING=(function(){const W=LINE.WIN,z0=W.z0,RW=RIFT.window(SITE.s0,W),M={tunnel:LB.mat('lining'),concrete:LB.mat('conc'),steel:LB.mat('metal'),asphalt:LB.mat('road'),line:LB.mat('paint'),
  glow:LB.mat('glow'),glass:LB.mat('glass'),rubble:LB.mat('rubble'),paint:LB.mat('paint'),pave:LB.mat('conc'),bronze:LB.mat('bronze'),white:LB.mat('white'),rust:LB.mat('metal')};
 const cyLit=z=>typeof LINE.cyanLit==='function'?!!LINE.cyanLit(z):!!LINE.cyanLit,spans=LINE.gallerySpans||[[W.z0,W.z1]];
 const host={sectionsAt:s=>SECS_AT(s+z0),profileAt:(s,S)=>LINE.profileAt(s+z0,S),cut:LINE.liningCut?(s,i,P,S)=>LINE.liningCut(s+z0,i,P,S):null,
  openings:(LINE.openings||[]).map(O=>({s0:O.z0-z0,s1:O.z1-z0,wall:O.wall,y0:O.y0,y1:O.y1,kind:O.kind,sec:O.sec})),
  works:s=>spans.some(([a,b])=>s+z0>=a&&s+z0<b),lit:s=>cyLit(s+z0)};
 const g=KTRANSIT.draw.line(RW.local,{host,mats:M,niches:false,shafts:false,branches:false,doors:false,stations:false});
 g.name='the lining and the way (KTRANSIT.draw.line)';g.userData.lining=true;g.children.forEach(m=>{m.userData.inspectLabel=m.userData.inspectLabel||('The Line: '+(m.userData.family||'')+' (the line kind\'s draw)');});scene.add(g);
 /* the probe's points: one an opening (its middle), so the merged lining's pieces count where they stand (core/host's regOccupancy) */
 if(g.children[0])g.children[0].userData.probePoints=(LINE.openings||[]).flatMap(O=>{const S=O.sec||SECS_AT((O.z0+O.z1)/2)[0]||LK.SEC;return [O.wall==='e'?S.x1+.3:S.x0-.3,(O.y0+O.y1)/2,(O.z0+O.z1)/2];});
 return {group:g,tris:g.userData.tris||0,rings:0,RW};})();
