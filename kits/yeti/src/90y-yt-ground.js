// ================================================================= THE SHEET'S GROUND, HOLED: the sunk floors and trenches open to the sky
// 90-scene.js (vendored) lays one flat plane at y = 0. This kit sinks its floors 0.5 to 1.2 m and digs its entries and
// tunnels into the ground (PLAN.md sections 2 and 3), so that plane would cut through every room. A def that digs declares
// holes(o): shapes in its local frame, each lined by the builder's own pit or trench walls (a shape's edge runs along the
// middle of its wall, so the edge never shows):
//   {poly: [[x,z], ...]}            any outline
//   {circle: [x, z, r]}             a round pit (a dome's, a junction's)
//   {run: [ax, az, bx, bz, hw]}     a straight trench hw either side of its centre line, square at the ends
// Shapes may overlap: the hole is their union. So the plane is rebuilt with each digging site's box cut out, and each box
// is refilled by a fine grid of cells (YT_GROUND_CELL) that keeps every cell whose centre lies outside the union. The
// world pages cut their ground on core/terrain instead (KNOWN_ISSUES.md, "The sheet's ground").
const YT_GROUND_CELL=.12;
/* is the world point (x,z) inside one of the shapes (already in world coordinates) */
function ytHoleHit(S,x,z){for(const s of S){
 if(s.circle){const c=s.circle;if((x-c[0])**2+(z-c[1])**2<c[2]*c[2])return true;}
 else if(s.run){const r=s.run,dx=r[2]-r[0],dz=r[3]-r[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,px=x-r[0],pz=z-r[1],al=px*ux+pz*uz,ac=-px*uz+pz*ux;if(al>=0&&al<=L&&Math.abs(ac)<=r[4])return true;}
 else if(s.poly){const P=s.poly;let inn=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))inn=!inn;}if(inn)return true;}}
 return false;}
function ytGroundHoles(){const G=GROUND_SIZE/2,V=(x,y)=>new THREE.Vector2(x,y);
 const sh=new THREE.Shape([V(-G,-G),V(G,-G),V(G,G),V(-G,G)]),fills=[];
 for(const Si of SITES){const D=DEFS[Si.key];if(!D||!D.holes)continue;const c=Math.cos(Si.ry||0),s=Math.sin(Si.ry||0);
  /* local (x,z) to world (X,Z), as place() turns a def */
  const W=(x,z)=>[Si.x+x*c+z*s,Si.z-x*s+z*c];
  const S=D.holes(Si.o||{}).map(h=>Array.isArray(h)?{poly:h}:h).map(h=>{
   if(h.poly)return {poly:h.poly.map(p=>W(p[0],p[1]))};
   if(h.circle){const p=W(h.circle[0],h.circle[1]);return {circle:[p[0],p[1],h.circle[2]]};}
   const a=W(h.run[0],h.run[1]),b=W(h.run[2],h.run[3]);return {run:[a[0],a[1],b[0],b[1],h.run[4]]};});
  if(!S.length)continue;
  /* the box round the shapes, snapped out to the cell, cut from the plane and refilled cell by cell */
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const grow=(x,z,r)=>{x0=Math.min(x0,x-r);x1=Math.max(x1,x+r);z0=Math.min(z0,z-r);z1=Math.max(z1,z+r);};
  for(const h of S){if(h.poly)h.poly.forEach(p=>grow(p[0],p[1],0));else if(h.circle)grow(h.circle[0],h.circle[1],h.circle[2]);else{grow(h.run[0],h.run[1],h.run[4]);grow(h.run[2],h.run[3],h.run[4]);}}
  const C=YT_GROUND_CELL;x0=Math.floor(x0/C-2)*C;z0=Math.floor(z0/C-2)*C;x1=Math.ceil(x1/C+2)*C;z1=Math.ceil(z1/C+2)*C;
  sh.holes.push(new THREE.Path([V(x0,-z0),V(x0,-z1),V(x1,-z1),V(x1,-z0)]));fills.push({S,x0,z0,x1,z1});}
 if(!fills.length)return 0;
 const g=new THREE.ShapeGeometry(sh),Pa=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<Pa.count;i++)uv.setXY(i,(Pa.getX(i)+G)/(2*G),(Pa.getY(i)+G)/(2*G));uv.needsUpdate=true;
 groundM.geometry.dispose();groundM.geometry=g;
 /* the refills: one mesh of kept cells per site, in world coordinates, with the plane's UVs and material */
 for(const F of fills){const C=YT_GROUND_CELL,nx=Math.round((F.x1-F.x0)/C),nz=Math.round((F.z1-F.z0)/C),pos=[],nor=[],uvs=[],idx=[];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=F.x0+i*C,z=F.z0+j*C;if(ytHoleHit(F.S,x+C/2,z+C/2))continue;const b=pos.length/3;
   for(const [dx,dz] of [[0,0],[C,0],[C,C],[0,C]]){pos.push(x+dx,0,z+dz);nor.push(0,1,0);uvs.push((x+dx+G)/(2*G),(-(z+dz)+G)/(2*G));}
   idx.push(b,b+2,b+1,b,b+3,b+2);}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));fg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  fg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));fg.setIndex(idx);
  const m=new THREE.Mesh(fg,groundMat);m.receiveShadow=true;m.userData.isGround=true;scene.add(m);}
 return fills.length;}
const YT_GROUND_HOLES=ytGroundHoles();
