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
const LINING=(function(){const W=LINE.WIN,B=LB.B(100),rg=LB.rgb,ST=STATION.state||'kept';
 const base=rg(ST==='abandoned'?0x8e8a80:0xa8a49a),joint=rg(0x5a5852),band=rg(0x8a6a3c),stain=rg(0x8e8a80);
 const inward=(S,pt)=>{const cx=(S.x0+S.x1)/2,dx=cx-pt[0],dy=(S.spring+1)-pt[1],l=Math.hypot(dx,dy)||1;return [dx/l,dy/l];};
 /* the openings in a wall segment of this ring: the z spans to leave out where a segment lies within an opening's height on its wall */
 const gapsFor=(S,z,p,q)=>(LINE.openings||[]).filter(O=>{const wx=O.wall==='e'?S.x1:S.x0;return p[0]===wx&&q[0]===wx&&O.z1>z&&O.z0<z+2&&
  Math.min(p[1],q[1])>=O.y0-1e-6&&Math.max(p[1],q[1])<=O.y1+1e-6;}).map(O=>[Math.max(z,O.z0),Math.min(z+2,O.z1)]).sort((a,b)=>a[0]-b[0]);
 const outline=P=>P.map(p=>[p[0],p[1]]);
 let ring=0,prevKey=null,prevP=null;
 for(let z=W.z0;z<W.z1-1e-6;z+=2,ring++){
  const SS=SECS_AT(z+1),PS=SS.map(S=>LINE.profileAt(z+1,S)),key=SS.map(S=>S.key).join('+');
  /* the end wall where the sections change between two lined rings: the wider ring outside, the other ring's sections its holes (one gallery
     into a junction, a junction into twin bores); two sets of several sections side by side draw none (their step is the window's) */
  if(SS.length&&prevKey&&key!==prevKey&&prevP&&(SS.length===1||prevP.length===1)){const A=prevP.map(outline),Bo=PS.map(outline),span=L=>Math.max(...L.map(o=>o[o.length-1][0]))-Math.min(...L.map(o=>o[0][0]));
   const one=A.length===1&&(Bo.length>1||span(A)>span(Bo))?A:Bo,other=one===A?Bo:A;try{B.polyZ('lining',z,one[0],other,stain);}catch(e){reportErr('end wall at z '+z+': '+e.message);}}
  prevKey=SS.length?key:null;prevP=SS.length?PS:null;
  if(!SS.length)continue;
  const h=KRAND.unit(KRAND.hash(SITE.world,ring,7)),k=.93+.12*h,col=[base[0]*k,base[1]*k,base[2]*k];
  SS.forEach((S,si)=>{const P=PS[si];
  for(let i=0;i+1<P.length;i++){if(LINE.liningCut&&LINE.liningCut(z,i,P,S))continue;const p=P[i],q=P[i+1];
   const seg=(z0,z1,c)=>{if(z1-z0<1e-3)return;B.quad('lining',[p[0],p[1],z0],[p[0],p[1],z1],[q[0],q[1],z1],[q[0],q[1],z0],c,[[z0,p[2]],[z1,p[2]],[z1,q[2]],[z0,q[2]]]);};
   seg(z,z+.05,joint);
   let cur=z+.05;for(const g of gapsFor(S,z,p,q)){seg(cur,g[0],col);cur=Math.max(cur,g[1]);}seg(cur,z+2,col);}
  /* the bronze band where the structure transfers (every 3.6 m: wherever a 3.6 m mark falls in this ring), above the floors */
  const m=Math.ceil(z/3.6)*3.6;if(m<z+2){for(let i=0;i+1<P.length;i++){if(LINE.liningCut&&LINE.liningCut(z,i,P,S))continue;const p=P[i],q=P[i+1];if(p[1]<2&&q[1]<2)continue;
   const np=inward(S,p),nq=inward(S,q),a=[p[0]+np[0]*.025,p[1]+np[1]*.025],b=[q[0]+nq[0]*.025,q[1]+nq[1]*.025];
   B.quad('bronze',[a[0],a[1],m-.06],[a[0],a[1],m+.06],[b[0],b[1],m+.06],[b[0],b[1],m-.06],band);}}});}
 /* the openings' jambs through the lining's thickness, a sill where one opens above the floor, and a niche's enamel plate beside it */
 const cream=rg(0xe6dcc0),red=rg(0x8a2e24);
 (LINE.openings||[]).forEach(O=>{const S=O.sec||SECS_AT((O.z0+O.z1)/2)[0];if(!S)return;const L=S.lining||LK.SEC.lining,sx=O.wall==='e'?1:-1,x0=O.wall==='e'?S.x1:S.x0,x1=x0+sx*L,z0=O.z0,z1=O.z1,y0=O.y0,y1=O.y1;
  B.quad('lining',[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],stain);B.quad('lining',[x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],stain);
  B.quad('lining',[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],stain);if(y0>.05)B.quad('lining',[x0,y0,z0],[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],stain);
  if(O.kind==='niche'){const xa=x0-sx*.01,xb=x0-sx*.03;B.box('paint',Math.min(xa,xb),Math.max(xa,xb),y1-.55,y1-.2,z1+.2,z1+.65,red);
   B.box('paint',Math.min(x0-sx*.03,x0-sx*.04),Math.max(x0-sx*.03,x0-sx*.04),y1-.52,y1-.23,z1+.23,z1+.62,cream);}});
 const g=B.finish('the lining',{label:{lining:'The lining: precast segments in 2 m rings (concrete.lining.segment owed; concrete.ancient stands in)',bronze:'A bronze band where the structure transfers (every 3.6 m)',paint:'An enamel plate: the niche\'s number'}});
 g.userData.lining=true;scene.add(g);
 /* the probe's points: one an opening (its middle), so the merged lining's pieces count where they stand (core/host's regOccupancy) */
 if(g.children[0])g.children[0].userData.probePoints=(LINE.openings||[]).flatMap(O=>{const S=O.sec||SECS_AT((O.z0+O.z1)/2)[0]||LK.SEC;return [O.wall==='e'?S.x1+.3:S.x0-.3,(O.y0+O.y1)/2,(O.z0+O.z1)/2];});
 return {group:g,tris:B.tris,rings:ring};})();
