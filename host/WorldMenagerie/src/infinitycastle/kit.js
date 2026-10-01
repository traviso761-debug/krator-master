// ---------- the kit: rooms, galleries, stairs and bridges, and the clusters they hang in ----------
// Fan work. The castle is a city of the same few pieces - ufotable's own account of building it is boxes, and
// layers added wherever looking up showed a gap, and stairs to sell the depth - so here too it is a kit:
//
//   room3, room4, room6   tatami rooms 3 by 2, 4 by 3 and 6 by 4 ken (a ken is 1.82 m, one tatami's length),
//                         open at the front onto an engawa, fusuma at the back, shoji down the sides, a plank
//                         ceiling, plaster over the lintels, and a lamp in the corner. With or without a hipped
//                         roof, lit or dark
//   gallery               a corridor eight ken long and one wide: shoji down one side, a balustrade down the
//                         other, a lean-to roof
//   stair                 one flight: sixteen open risers, 3.04 m up and 4.16 along, a rail on one side
//   landing               a square of floor between flights
//   bridge                two ken of plank bridge with rails; laid end to end across the hall
//   post                  a square post eight ken long, hung under a cluster or run up past it
//   stairW, landingW      the wide flight and its landing: boxed stringers, spindle rails, a lantern at the top
//   platform              seven metres of floor square, thick-edged, for stairs to go off every side of
//   door, doorD, doorF    sliding panels - lit shoji, dark shoji, fusuma - on the fronts of the rooms
//
// Every piece is built once, as one geometry per material, and every copy of it is an instance. A cluster is a
// group of pieces with one matrix - a house, a gallery, a flight of stairs to nowhere - and moving a cluster
// (biwa.js) rewrites its pieces' instance matrices and nothing else.
import {TEX_M} from './mats.js';

export const KEN=1.82;
const WOODY=new Set(['wood']);

// ---- a geometry builder: quads and boxes, UVs in texture repeats, one array per material ----
export class Builder{
  constructor(){this.g={};}
  arr(m){return this.g[m]||(this.g[m]={p:[],n:[],u:[]});}
  // a quad a-b-c-d (counter-clockwise seen from the side it faces); `out` flips it to face that way if given
  quad(m,a,b,c,d,out){
    let ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    if(out&&nx*out[0]+ny*out[1]+nz*out[2]<0){[b,d]=[d,b];nx=-nx;ny=-ny;nz=-nz;[ux,uy,uz,vx,vy,vz]=[vx,vy,vz,ux,uy,uz];}
    const tm=TEX_M[m]||[1,1],w=Math.hypot(ux,uy,uz),h=Math.hypot(vx,vy,vz);
    let uv;
    // wood grain runs up its canvas, so on anything longer than it is tall the texture is turned to run along it
    if(WOODY.has(m)&&w>h){const U=h/tm[0],V=w/tm[1];uv=[[0,0],[0,V],[U,V],[U,0]];}
    else{const U=w/tm[0],V=h/tm[1];uv=[[0,0],[U,0],[U,V],[0,V]];}
    const A=this.arr(m);
    for(const i of [0,1,2,0,2,3]){const P=[a,b,c,d][i];A.p.push(P[0],P[1],P[2]);A.n.push(nx,ny,nz);A.u.push(uv[i][0],uv[i][1]);}
  }
  box(m,x0,y0,z0,x1,y1,z1,skip){
    const f=(k,a,b,c,d,o)=>{if(!skip||!skip.includes(k))this.quad(m,a,b,c,d,o);};
    f('px',[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]);f('nx',[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]);
    f('pz',[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);f('nz',[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]);
    f('py',[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]);f('ny',[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]);
  }
  // a member from p to q with a w by h section (h in the vertical plane through it)
  beam(m,p,q,w,h){
    const d=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],L=Math.hypot(...d)||1;d[0]/=L;d[1]/=L;d[2]/=L;
    let s=[d[2],0,-d[0]];let sl=Math.hypot(...s);if(sl<1e-6){s=[1,0,0];sl=1;}s=s.map(v=>v/sl);
    const u=[s[1]*d[2]-s[2]*d[1],s[2]*d[0]-s[0]*d[2],s[0]*d[1]-s[1]*d[0]];
    const C=(e,a,b)=>[e[0]+s[0]*a*w/2+u[0]*b*h/2,e[1]+s[1]*a*w/2+u[1]*b*h/2,e[2]+s[2]*a*w/2+u[2]*b*h/2];
    const P=[C(p,-1,-1),C(p,1,-1),C(p,1,1),C(p,-1,1)],Q=[C(q,-1,-1),C(q,1,-1),C(q,1,1),C(q,-1,1)];
    const mid=[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2];
    const face=(a,b,c,dd)=>{const cx=(a[0]+c[0])/2-mid[0],cy=(a[1]+c[1])/2-mid[1],cz=(a[2]+c[2])/2-mid[2];this.quad(m,a,b,c,dd,[cx,cy,cz]);};
    for(let i=0;i<4;i++){const j=(i+1)%4;face(P[i],P[j],Q[j],Q[i]);}
    face(P[0],P[3],P[2],P[1]);face(Q[0],Q[1],Q[2],Q[3]);
  }
  geos(THREE){
    const out={};
    for(const [m,A] of Object.entries(this.g)){if(!A.p.length)continue;const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(A.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.n,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(A.u,2));g.computeBoundingSphere();out[m]=g;}
    return out;
  }
}

// ---- the pieces ----
// A room: floor top at y=0, centred on x, the floor from z=-d/2 to d/2 and the engawa out to d/2+0.91 at the
// front (+z). Returns the lamps' positions as well, for the glows.
export function room(B,w,d,{lit=true,roof=true,rail=false,H=2.73}={}){
  const t=0.12,hw=w/2,hd=d/2,side=lit?'shojiLit':'shojiDim';
  B.box('wood',-hw,-0.45,-hd,hw,-0.06,hd);
  B.box('tatami',-hw+0.05,-0.06,-hd+0.05,hw-0.05,0,hd-0.05,['ny']);
  B.box('plank',-hw,-0.2,hd,hw,-0.12,hd+0.91);
  B.box('wood',-hw,-0.45,hd+0.8,hw,-0.2,hd+0.91);
  const posts=new Set();const post=(x,z,h=H)=>{const k=x.toFixed(2)+','+z.toFixed(2);if(posts.has(k))return;posts.add(k);B.box('wood',x-t/2,-0.06,z-t/2,x+t/2,h,z+t/2);};
  const nx=Math.round(w/KEN),nz=Math.round(d/KEN);
  for(let i=0;i<=nx;i++){const x=-hw+i*KEN;post(x,-hd);post(x,hd);}
  for(let j=0;j<=nz;j++){const z=-hd+j*KEN;post(-hw,z);post(hw,z);}
  // the fusuma along the back, shoji down the sides, and plaster over all of it
  B.quad('fusuma',[-hw,0,-hd+0.03],[hw,0,-hd+0.03],[hw,KEN,-hd+0.03],[-hw,KEN,-hd+0.03]);
  B.quad(side,[-hw+0.03,0,hd],[-hw+0.03,0,-hd],[-hw+0.03,KEN,-hd],[-hw+0.03,KEN,hd]);
  B.quad(side,[hw-0.03,0,-hd],[hw-0.03,0,hd],[hw-0.03,KEN,hd],[hw-0.03,KEN,-hd]);
  for(const [a,b,front] of [[[-hw,-hd],[hw,-hd]],[[-hw,hd],[-hw,-hd]],[[hw,-hd],[hw,hd]],[[-hw,hd],[hw,hd],true]]){
    // over the open front of a tall room the wall comes down only a little way, or it would hide the room
    const y0=front?Math.max(KEN+0.1,H-0.9):KEN+0.1;
    B.quad('plaster',[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],H,b[1]],[a[0],H,a[1]]);
    // the lintel (kamoi) and the rail over it (nageshi)
    B.beam('wood',[a[0],y0-0.05,a[1]],[b[0],y0-0.05,b[1]],0.13,0.1);
    B.beam('wood',[a[0],y0+0.2,a[1]],[b[0],y0+0.2,b[1]],0.15,0.1);}
  B.box('plank',-hw,H,-hd,hw,H+0.05,hd);
  B.box('wood',-hw-0.08,H+0.05,-hd-0.08,hw+0.08,H+0.25,hd+0.08);
  // the engawa's own posts, holding the eave
  for(let i=0;i<=nx;i+=2){post(-hw+i*KEN,hd+0.85,H+0.2);}post(hw,hd+0.85,H+0.2);
  B.beam('wood',[-hw-0.3,H+0.12,hd+0.85],[hw+0.3,H+0.12,hd+0.85],0.14,0.2);
  if(rail){for(let i=0;i<=nx*4;i++){const x=-hw+i*KEN/4;B.box('wood',x-0.025,-0.12,hd+0.87,x+0.025,0.72,hd+0.9);}
    B.box('wood',-hw,0.72,hd+0.85,hw,0.8,hd+0.91);}
  // the roof: hipped, tiled, over an overhang of half a ken all round; its soffit is boards
  const ey=H+0.25,ov=0.9,x0=-hw-ov,x1=hw+ov,z0=-hd-ov,z1=hd+0.91+ov;
  if(roof)hipRoof(B,x0,x1,z0,z1,ey);
  B.quad('plank',[x0,ey-0.01,z0],[x1,ey-0.01,z0],[x1,ey-0.01,z1],[x0,ey-0.01,z1],[0,-1,0]);
  for(const [a,b] of [[[x0,z0],[x1,z0]],[[x1,z0],[x1,z1]],[[x1,z1],[x0,z1]],[[x0,z1],[x0,z0]]])B.beam('wood',[a[0],ey-0.05,a[1]],[b[0],ey-0.05,b[1]],0.12,0.18);
  // the andon in the back corner
  const lx=-hw+0.45,lz=-hd+0.45;B.box('lamp',lx-0.15,0.1,lz-0.15,lx+0.15,0.62,lz+0.15);B.box('wood',lx-0.17,0,lz-0.17,lx+0.17,0.1,lz+0.17);
  return [[lx,0.4,lz,lit?1:0.55]];
}

// A gallery eight ken long along x, one wide: shoji at the back (z=-K/2), a balustrade at the front.
export function gallery(B,n=8){
  const L=n*KEN,hl=L/2,h=KEN/2,H=2.4,t=0.12;
  B.box('wood',-hl,-0.35,-h,hl,-0.06,h);B.box('plank',-hl,-0.06,-h,hl,0,h,['ny']);
  B.quad('shojiLit',[-hl,0,-h+0.03],[hl,0,-h+0.03],[hl,KEN,-h+0.03],[-hl,KEN,-h+0.03]);
  B.quad('plaster',[-hl,KEN+0.1,-h],[hl,KEN+0.1,-h],[hl,H,-h],[-hl,H,-h]);
  for(let i=0;i<=n;i++){const x=-hl+i*KEN;B.box('wood',x-t/2,0,-h-t/2,x+t/2,H,-h+t/2);B.box('wood',x-t/2,0,h-t/2,x+t/2,H,h+t/2);}
  B.beam('wood',[-hl,KEN+0.05,-h],[hl,KEN+0.05,-h],0.13,0.1);
  B.beam('wood',[-hl,H-0.1,h],[hl,H-0.1,h],0.14,0.2);
  for(let i=0;i<=n*6;i++){const x=-hl+i*KEN/6;B.box('wood',x-0.02,0,h-0.03,x+0.02,0.84,h+0.01);}
  B.box('wood',-hl,0.84,h-0.05,hl,0.92,h+0.03);B.box('wood',-hl,0.06,h-0.05,hl,0.12,h+0.03);
  B.box('plank',-hl,H,-h,hl,H+0.04,h);
  // a lean-to roof, high at the back, out over the rail
  B.quad('roof',[-hl-0.4,H+0.1,h+0.9],[hl+0.4,H+0.1,h+0.9],[hl+0.4,H+0.75,-h-0.3],[-hl-0.4,H+0.75,-h-0.3],[0,1,0]);
  B.quad('plank',[-hl-0.4,H+0.08,h+0.9],[hl+0.4,H+0.08,h+0.9],[hl+0.4,H+0.73,-h-0.3],[-hl-0.4,H+0.73,-h-0.3],[0,-1,0]);
  // lanterns hung from the ceiling down the middle, on cords, one to every two ken, as the atrium galleries have
  const lamps=[];for(let i=1;i<n;i+=2){const x=-hl+i*KEN;B.box('wood',x-0.01,2.05,-0.01,x+0.01,H,0.01);B.box('lamp',x-0.17,1.6,-0.17,x+0.17,2.05,0.17);lamps.push([x,1.82,0,0.9]);}
  return lamps;
}

// A hipped roof of tiles over x0..x1, z0..z1 with its eaves at height ey, the ridge along the longer side.
export function hipRoof(B,x0,x1,z0,z1,ey,k=0.36){
  const W=x1-x0,D=z1-z0,rh=Math.min(W,D)*k,cz=(z0+z1)/2,cx=(x0+x1)/2,up=[0,1,0];
  let r0,r1;if(W>=D){r0=[cx-(W-D)/2,ey+rh,cz];r1=[cx+(W-D)/2,ey+rh,cz];}else{r0=[cx,ey+rh,cz-(D-W)/2];r1=[cx,ey+rh,cz+(D-W)/2];}
  if(W>=D){B.quad('roof',[x0,ey,z1],[x1,ey,z1],r1,r0,up);B.quad('roof',[x1,ey,z0],[x0,ey,z0],r0,r1,up);
    B.quad('roof',[x0,ey,z0],[x0,ey,z1],r0,r0,up);B.quad('roof',[x1,ey,z1],[x1,ey,z0],r1,r1,up);}
  else{B.quad('roof',[x1,ey,z1],[x1,ey,z0],r0,r1,up);B.quad('roof',[x0,ey,z0],[x0,ey,z1],r1,r0,up);
    B.quad('roof',[x0,ey,z1],[x1,ey,z1],r1,r1,up);B.quad('roof',[x1,ey,z0],[x0,ey,z0],r0,r0,up);}
  B.beam('roof',r0,r1,0.3,0.25);
}

// One flight: up along +z from (0,0,0), 1.2 m wide.
export const STAIR={rise:3.04,run:4.16};
export function stair(B){
  const n=16,r=0.19,g=0.26;
  for(let i=0;i<n;i++)B.box('plank',-0.6,(i+1)*r-0.05,i*g,0.6,(i+1)*r,i*g+0.3);
  for(const x of [-0.64,0.64])B.beam('wood',[x,-0.05,-0.12],[x,n*r+0.02,n*g+0.14],0.07,0.28);
  B.box('wood',0.6,0,-0.04,0.66,0.95,0.02);B.box('wood',0.6,n*r,n*g-0.04,0.66,n*r+0.95,n*g+0.02);
  B.beam('wood',[0.63,0.92,0],[0.63,n*r+0.92,n*g],0.05,0.06);
  return [];
}
export function landing(B){
  B.box('plank',-0.65,-0.06,0,0.65,0,1.3);B.box('wood',-0.68,-0.3,-0.03,0.68,-0.06,1.33);return [];
}
// A wide flight, as the castle's big stairs are: 2.4 m between heavy boxed stringers, closed risers, the underside
// boarded in, a rail of spindles on both sides, and a lantern on the post at the top. Up along +z from (0,0,0),
// the same rise and run as the narrow flight, so the two join the same landings.
export function stairWide(B){
  const n=16,r=0.19,g=0.26,hw=1.1;
  for(let i=0;i<n;i++){B.box('plank',-hw,(i+1)*r-0.05,i*g-0.02,hw,(i+1)*r,i*g+0.28);
    B.quad('plank',[-hw,i*r,i*g],[hw,i*r,i*g],[hw,(i+1)*r-0.05,i*g],[-hw,(i+1)*r-0.05,i*g],[0,0,-1]);}
  for(const x of [-1.2,1.2]){B.beam('wood',[x,-0.12,-0.2],[x,n*r+0.05,n*g+0.2],0.16,0.55);
    B.beam('wood',[x,1.0,0],[x,n*r+1.0,n*g],0.09,0.1);B.beam('wood',[x,0.35,0],[x,n*r+0.35,n*g],0.05,0.06);
    for(let i=1;i<n;i+=2)B.box('wood',x-0.025,(i+1)*r+0.15,i*g+0.1,x+0.025,(i+1)*r+0.95,i*g+0.15);
    B.box('wood',x-0.08,0,-0.08,x+0.08,1.15,0.08);B.box('wood',x-0.08,n*r,n*g-0.08,x+0.08,n*r+1.15,n*g+0.08);}
  B.quad('plank',[-1.12,-0.32,0],[1.12,-0.32,0],[1.12,n*r-0.32,n*g],[-1.12,n*r-0.32,n*g],[0,-0.8,0.6]);
  B.box('lamp',1.07,n*r+1.15,n*g-0.13,1.33,n*r+1.5,n*g+0.13);
  return [[1.2,n*r+1.32,n*g,0.9]];
}
// the landing the wide flights meet: 2.6 m square, a thick edge round it
export function landingWide(B){
  B.box('plank',-1.3,-0.08,0,1.3,0,2.6);B.box('wood',-1.34,-0.45,-0.04,1.34,-0.08,2.64);return [];
}
// a platform: a square of floor seven metres across, thick-edged, where stairs go off every side (the manga's
// Escher landings)
export function platform(B){
  const h=2*KEN;B.box('plank',-h,-0.1,-h,h,0,h);B.box('wood',-h-0.1,-0.7,-h-0.1,h+0.1,-0.1,h+0.1);
  for(const x of [-h,h])for(const z of [-h,h])B.box('wood',x-0.2,-3.3,z-0.2,x+0.2,-0.7,z+0.2);
  B.box('lamp',-0.2,0,-0.2,0.2,0.5,0.2);
  return [[0,0.3,0,1]];
}
// a short post, for the landings of the switchback stairs
export function post3(B){B.box('wood',-0.12,-3.04,-0.12,0.12,0,0.12,['py']);return [];}
// One sliding door: a panel half a ken wide and one tall, on the room's front track. Its frame is in the texture.
export function door(B,mat){B.box(mat,-0.455,0,-0.015,0.455,KEN,0.015);return [];}

// Two ken of bridge along +x from x=0.
export function bridge(B){
  const L=2*KEN;
  B.box('plank',0,-0.08,-0.65,L,0,0.65,['nx','px']);
  for(const z of [-0.66,0.66]){B.box('wood',0,-0.32,z-0.06,L,-0.08,z+0.06,['nx','px']);
    B.box('wood',0,0,z-0.04,0.08,1.0,z+0.04);B.box('wood',0,0.9,z-0.035,L,0.97,z+0.035,['nx','px']);
    B.box('wood',0,0.45,z-0.025,L,0.5,z+0.025,['nx','px']);}
  // a lantern on the post at the start of every length, the rows of them that run along every bridge in the films
  B.box('lamp',-0.09,1.0,0.54,0.13,1.3,0.78);
  return [[0.02,1.15,0.66,0.7]];
}
export function post(B){B.box('wood',-0.15,-8*KEN,-0.15,0.15,0,0.15,['py']);return [];}

// ---- instancing: pieces, clusters, and the glow of their lamps ----
// kit.cluster(matrix) starts a cluster; kit.add(cluster, piece, localMatrix) puts a piece in it;
// kit.build(parent) makes one InstancedMesh per piece and material, and the Points for the lamps;
// kit.move(cluster, matrix) moves a cluster that has already been built.
export function createKit(THREE,mats,{dotTex}){
  const PIECES={};
  const def=(name,fn,...args)=>{const B=new Builder();const lamps=fn(B,...args)||[];PIECES[name]={geos:B.geos(THREE),lamps};};
  def('room3',room,3*KEN,2*KEN,{lit:true,roof:true});def('room3d',room,3*KEN,2*KEN,{lit:false,roof:false,rail:true});
  def('room4',room,4*KEN,3*KEN,{lit:true,roof:true,rail:true});def('room4d',room,4*KEN,3*KEN,{lit:false,roof:true});
  def('room6',room,6*KEN,4*KEN,{lit:true,roof:true});def('room6f',room,6*KEN,4*KEN,{lit:true,roof:false,rail:true});
  def('gallery',gallery,8);def('stair',stair);def('landing',landing);def('bridge',bridge);def('post',post);
  def('stairW',stairWide);def('landingW',landingWide);def('platform',platform);def('post3',post3);
  def('door',door,'shojiLit');def('doorD',door,'shojiDim');def('doorF',door,'fusuma');
  const clusters=[],lists={};   // lists[piece] = [{c, m}]
  const lamps=[];                // {c, local:Vector3, s}
  const M=THREE.Matrix4,V=THREE.Vector3;
  function cluster(matrix,o={}){const c={m:matrix.clone(),items:[],lamps:[],fixed:!!o.fixed,tint:o.tint||1,r:o.r||10,id:clusters.length};clusters.push(c);return c;}
  function add(c,piece,local){
    const L=(lists[piece]=lists[piece]||[]);const it={c,m:local.clone(),i:L.length,piece};L.push(it);c.items.push([piece,it]);
    for(const l of PIECES[piece].lamps){const p=new V(l[0],l[1],l[2]).applyMatrix4(local);const e={c,local:p,s:l[3],i:lamps.length};lamps.push(e);c.lamps.push(e);}
    return it;
  }
  const meshes={};let glowPts=null;
  const tmp=new M(),col=new THREE.Color();
  function build(parent){
    for(const [piece,L] of Object.entries(lists)){
      meshes[piece]=[];
      for(const [mat,geo] of Object.entries(PIECES[piece].geos)){
        const im=new THREE.InstancedMesh(geo,mats[mat],L.length);im.userData.kind=piece+':'+mat;
        L.forEach(it=>{im.setMatrixAt(it.i,tmp.multiplyMatrices(it.c.m,it.m));im.setColorAt(it.i,col.setScalar(it.c.tint));});
        im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
        // the bounds of a mesh whose instances are spread through the whole castle: never cull it whole
        im.frustumCulled=false;parent.add(im);meshes[piece].push(im);}
    }
    const pos=new Float32Array(lamps.length*3),cl=new Float32Array(lamps.length*3),v=new V();
    lamps.forEach((l,i)=>{v.copy(l.local).applyMatrix4(l.c.m);pos.set([v.x,v.y,v.z],i*3);const k=l.s*(0.8+0.4*((i*0.618)%1));cl.set([1.0*k,0.62*k,0.3*k],i*3);});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
    glowPts=new THREE.Points(g,new THREE.PointsMaterial({size:2.6,map:dotTex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
    glowPts.userData.kind='lamps';glowPts.frustumCulled=false;parent.add(glowPts);
    return {meshes,glow:glowPts};
  }
  const dirty=new Set();
  function move(c,matrix){
    c.m.copy(matrix);
    for(const [piece,it] of c.items)for(const im of meshes[piece]){im.setMatrixAt(it.i,tmp.multiplyMatrices(c.m,it.m));dirty.add(im.instanceMatrix);}
    const pa=glowPts.geometry.attributes.position,v=new V();
    for(const l of c.lamps){v.copy(l.local).applyMatrix4(c.m);pa.setXYZ(l.i,v.x,v.y,v.z);}dirty.add(pa);
  }
  // move one piece within its cluster (a door sliding along its track)
  function setLocal(it,local){it.m.copy(local);for(const im of meshes[it.piece]){im.setMatrixAt(it.i,tmp.multiplyMatrices(it.c.m,it.m));dirty.add(im.instanceMatrix);}}
  function flush(){for(const a of dirty)a.needsUpdate=true;dirty.clear();}
  return {PIECES,clusters,cluster,add,build,move,setLocal,flush,lamps};
}
