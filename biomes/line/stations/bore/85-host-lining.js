// ================================================================= HOST — the builder and the lining
// LB: a small geometry builder for the Line's drawn works (quads and boxes into one bucket a family and a 100 m chunk, vertex colours linear,
// UVs in metres so the library's maps lie at their scale with no shader hook). It is this page's until KTRANSIT.draw takes the line kind
// (PLAN.md section 12: the transit kit's B.sweep and the subway's swept bore are its model).
//
// THE LINING (PLAN.md section 3): precast segments 0.6 m thick in rings 2 m long, drawn as the inner face of the section (LINE.profile) ring by
// ring: each ring a little different in tone (core/rand by its index), its joint a dark groove; a bronze band where the structure transfers, every
// 3.6 m (the Ancients' storey); the niches' openings left in the east wall with their jambs. The face is `concrete.ancient` until the owed
// `concrete.lining.segment` comes (core/materials/PROMPTS-NEEDED.md section 41).
const LB=(function(){
 const lin=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);
 const rgb=h=>[lin(((h>>16)&255)/255),lin(((h>>8)&255)/255),lin((h&255)/255)];
 const FAM={lining:{rough:.88,metal:0},guide:{rough:.7,metal:0},conc:{rough:.85,metal:0},road:{rough:.9,metal:0},metal:{rough:.6,metal:.35},
  bronze:{rough:.45,metal:.6},grate:{rough:.6,metal:.4},glow:{basic:true},paint:{rough:.7,metal:.1},rubble:{rough:.95,metal:0}};
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
  /* planar UVs in metres by the face's dominant axis */
  function uvOf(p,n){const ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);return ay>=ax&&ay>=az?[p[0],p[2]]:ax>=az?[p[2],p[1]]:[p[0],p[1]];}
  function quad(f,a,b,c,d,col,uv){let u=uv;if(!u){const n=[(b[1]-a[1])*(d[2]-a[2])-(b[2]-a[2])*(d[1]-a[1]),(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]),(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0])];u=[a,b,c,d].map(p=>uvOf(p,n));}
   tri(f,a,b,c,col,u[0],u[1],u[2]);tri(f,a,c,d,col,u[0],u[2],u[3]);}
  /* an axis-aligned box, its five faces (no bottom) */
  function box(f,x0,x1,y0,y1,z0,z1,col,noTop){
   if(!noTop)quad(f,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],col);
   quad(f,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],col);quad(f,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],col);
   quad(f,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col);quad(f,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col);}
  function finish(name,o){const g=new THREE.Group();g.name=name;
   buckets.forEach(b=>{if(!b.p.length)return;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));
    geo.computeBoundingSphere();const m=new THREE.Mesh(geo,mat(b.f));m.receiveShadow=true;m.userData.lineFam=b.f;m.userData.inspectLabel=(o&&o.label&&o.label[b.f])||name;g.add(m);});
   g.userData.tris=tris;return g;}
  return {tri,quad,box,finish,get tris(){return tris;}};}
 return {B,rgb,mat};})();

const LINING=(function(){const P=LINE.profile(36),W=LINE.WIN,L=SEC.lining,B=LB.B(100),rg=LB.rgb;
 const base=rg(0xa8a49a),joint=rg(0x5a5852),band=rg(0x8a6a3c),stain=rg(0x8e8a80);
 const niche=z0=>LINE.niches.find(N=>N.z-N.w/2<z0+2&&N.z+N.w/2>z0);
 /* the face points toward the gallery's axis: the quads' winding does not matter (DoubleSide), the normal must face in */
 const inward=(a,b,c,d)=>{const cx=(a[0]+c[0])/2,cy=(a[1]+c[1])/2;return Math.hypot(SEC.cx-cx,7-cy);};
 let ring=0;
 for(let z=W.z0;z<W.z1-1e-6;z+=2,ring++){
  const h=KRAND.unit(KRAND.hash(SITE.world,ring,7)),k=.93+.12*h,col=[base[0]*k,base[1]*k,base[2]*k];
  const N=niche(z);
  for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1];
   /* the east wall's middle segment (the walkway's floor to the niches' heads) opens at a niche */
   const openSeg=N&&p[0]===SEC.x1&&q[0]===SEC.x1&&Math.min(p[1],q[1])>=N.y-1e-6&&Math.max(p[1],q[1])<=N.y+N.h+1e-6;
   const seg=(z0,z1,c)=>{B.quad('lining',[p[0],p[1],z0],[p[0],p[1],z1],[q[0],q[1],z1],[q[0],q[1],z0],c,[[z0,p[2]],[z1,p[2]],[z1,q[2]],[z0,q[2]]]);};
   seg(z,z+.05,joint);
   if(openSeg){seg(z+.05,N.z-N.w/2,col);seg(N.z+N.w/2,z+2,col);}
   else seg(z+.05,z+2,col);}
  /* the bronze band where the structure transfers (every 3.6 m: the band sits wherever a 3.6 m mark falls in this ring) */
  const m=Math.ceil(z/3.6)*3.6;if(m<z+2){for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1];if(p[1]<1.25&&q[1]<1.25)continue;
   const off=(pt)=>{const dx=SEC.cx-pt[0],dy=7-pt[1],l=Math.hypot(dx,dy)||1;return [pt[0]+dx/l*.025,pt[1]+dy/l*.025];},a=off(p),b=off(q);
   B.quad('bronze',[a[0],a[1],m-.06],[a[0],a[1],m+.06],[b[0],b[1],m+.06],[b[0],b[1],m-.06],band);}}}
 /* the niches' jambs through the lining's thickness, and their enamel number plates (cream, a red border) beside them */
 const cream=rg(0xe6dcc0),red=rg(0x8a2e24);
 LINE.niches.forEach(N=>{const x0=SEC.x1,x1=SEC.x1+L,z0=N.z-N.w/2,z1=N.z+N.w/2,y0=N.y,y1=N.y+N.h;
  B.quad('lining',[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],stain);B.quad('lining',[x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],stain);
  B.quad('lining',[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],stain);
  B.box('paint',x0-.03,x0-.01,y1-.55,y1-.2,z1+.2,z1+.65,red);B.box('paint',x0-.04,x0-.03,y1-.52,y1-.23,z1+.23,z1+.62,cream);});
 const g=B.finish('the lining',{label:{lining:'The lining: precast segments in 2 m rings (concrete.lining.segment owed; concrete.ancient stands in)',bronze:'A bronze band where the structure transfers (every 3.6 m)',paint:'An enamel plate: the niche\'s number'}});
 g.userData.lining=true;scene.add(g);
 /* the probe's points: one a niche (its opening's middle), so the merged lining's pieces count where they stand (core/host's regOccupancy) */
 if(g.children[0])g.children[0].userData.probePoints=LINE.niches.flatMap(N=>[SEC.x1+.3,N.y+1,N.z]);
 return {group:g,tris:B.tris,rings:ring};})();
