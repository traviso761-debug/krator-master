// ---------- the kit the Oldest House is built from ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used.
//
// One Builder takes every static surface in the building as quads in world metres, one array per material key,
// with UVs in texture repeats (TEX_M). Quads are cut into cells (about five metres) so that light can be BAKED
// into their vertex colours: every fitting that gives light registers itself (light()), and once everything is
// built, bake() lights each vertex from the fittings near it - a pool under each fluorescent panel, the Furnace's
// gold, the Panopticon's teal - with no runtime lights at all. Then toMeshes() makes one mesh per key.
// Keys with a ':ceil' suffix (any material: 'ceiling:ceil', 'concrete:ceil') are ceilings: their own meshes,
// flagged, so the cutaway can lift them and the building reads like the Bureau's blueprints from above.
//
// Coordinates: x east, z south, y up; north is -z. A transform (B.at / B.pop) places furniture by yaw.
//
// The furniture and fittings below are functions of the builder: desks, chairs, filing cabinets, shelves of
// files, cubicles, terminals, the Bureau's fluted concrete piers, rails, stairs, pipes, light panels, plants.
import {TEX_M,MAT_DEF,makeMaterial} from './mats.js';

export class Builder{
  constructor(cell=5){this.g={};this.cell=cell;this.tf=null;this.stack=[];}
  arr(m){return this.g[m]||(this.g[m]={p:[],n:[],u:[]});}
  // a local frame: x,y,z the origin, yaw about +y (counter-clockwise seen from above, toward -z from +x)
  at(x,y,z,yaw=0){this.stack.push(this.tf);const c=Math.cos(yaw),s=Math.sin(yaw);
    const p=this.tf;if(!p){this.tf=[x,y,z,c,s];return this;}
    // compose with the frame we are already in
    const [px,py,pz,pc,ps]=p;this.tf=[px+pc*x+ps*z,py+y,pz-ps*x+pc*z,pc*c-ps*s,ps*c+pc*s];return this;}
  pop(){this.tf=this.stack.pop()||null;return this;}
  T(P){const t=this.tf;if(!t)return P;const [x,y,z]=P;return [t[0]+t[3]*x+t[4]*z,t[1]+y,t[2]-t[4]*x+t[3]*z];}
  // a quad a-b-c-d; `out` (a direction, local) flips it to face that way; cut into cells for the light bake
  quad(m,a,b,c,d,out){
    a=this.T(a);b=this.T(b);c=this.T(c);d=this.T(d);
    if(out&&this.tf){const t=this.tf;out=[t[3]*out[0]+t[4]*out[2],out[1],-t[4]*out[0]+t[3]*out[2]];}
    let ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    if(out&&nx*out[0]+ny*out[1]+nz*out[2]<0){[b,d]=[d,b];nx=-nx;ny=-ny;nz=-nz;}
    const base=m.split(':')[0],tm=TEX_M[{concreteDark:'concrete',concreteWarm:'concrete',panelDark:'panel',carpetDark:'carpet',carpetGrey:'carpet',curtain:'carpet',woodDark:'wood',
      rockBlack:'rock',rockRed:'rock',tileGreen:'tile',brick:'panel',brickDark:'panel',leaf:'needle',leafDark:'needle'}[base]||base]||[2,2];
    const w=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),h=Math.hypot(d[0]-a[0],d[1]-a[1],d[2]-a[2]);
    /* coarse: one cell, for long thin things the light need not vary along (window strips, rails) */
    const nu=this.coarse?1:Math.max(1,Math.min(40,Math.ceil(w/this.cell))),nv=this.coarse?1:Math.max(1,Math.min(40,Math.ceil(h/this.cell)));
    const A=this.arr(m),P=(i,j)=>{const u=i/nu,v=j/nv;return [a[0]+(b[0]-a[0])*u+(d[0]-a[0])*v+(c[0]-b[0]-d[0]+a[0])*u*v,
      a[1]+(b[1]-a[1])*u+(d[1]-a[1])*v+(c[1]-b[1]-d[1]+a[1])*u*v,a[2]+(b[2]-a[2])*u+(d[2]-a[2])*v+(c[2]-b[2]-d[2]+a[2])*u*v];};
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const q=[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],uv=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([x,y])=>[x/nu*w/tm[0],y/nv*h/tm[1]]);
      for(const k of [0,1,2,0,2,3]){A.p.push(q[k][0],q[k][1],q[k][2]);A.n.push(nx,ny,nz);A.u.push(uv[k][0],uv[k][1]);}}
  }
  // a box, faces outward; skip: faces to leave off ('px','nx','py','ny','pz','nz')
  box(m,x0,y0,z0,x1,y1,z1,skip){const f=(k,a,b,c,d,o)=>{if(!skip||!skip.includes(k))this.quad(m,a,b,c,d,o);};
    f('px',[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]);f('nx',[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);
    f('pz',[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);f('nz',[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]);
    f('py',[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0]);f('ny',[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]);}
  // a box given by centre and size, faces outward: the commonest call
  blk(m,x,y,z,w,h,d,skip){this.box(m,x-w/2,y,z-d/2,x+w/2,y+h,z+d/2,skip);}
  // a room: floor, walls and ceiling facing in. gaps: {n:[[u0,u1,h]...], s:..., e:..., w:...} doorways in each
  // wall, u measured along it from its west (n,s) or north (e,w) end; above each gap a lintel up to the ceiling
  room(mat,x0,y0,z0,x1,y1,z1,gaps={},o={}){const fl=mat.floor,wl=mat.wall,cl=mat.ceil;
    if(fl&&!o.noFloor)this.quad(fl,[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,1,0]);
    if(cl&&!o.noCeil)this.quad(cl,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,-1,0]);
    const side=(key,P0,P1,inward)=>{const L=Math.hypot(P1[0]-P0[0],P1[2]-P0[2]),ux=(P1[0]-P0[0])/L,uz=(P1[2]-P0[2])/L,g=(gaps[key]||[]).slice().sort((a,b)=>a[0]-b[0]);let u=0;
      const wallQ=(ua,ub,ya,yb)=>{if(ub-ua<0.01||yb-ya<0.01)return;this.quad(wl,[P0[0]+ux*ua,ya,P0[2]+uz*ua],[P0[0]+ux*ub,ya,P0[2]+uz*ub],[P0[0]+ux*ub,yb,P0[2]+uz*ub],[P0[0]+ux*ua,yb,P0[2]+uz*ua],inward);};
      for(const [g0,g1,gh] of g){wallQ(u,g0,y0,y1);wallQ(g0,g1,y0+(gh||y1-y0),y1);u=g1;}wallQ(u,L,y0,y1);};
    side('n',[x0,0,z0],[x1,0,z0],[0,0,1]);side('s',[x0,0,z1],[x1,0,z1],[0,0,-1]);side('w',[x0,0,z0],[x0,0,z1],[1,0,0]);side('e',[x1,0,z0],[x1,0,z1],[-1,0,0]);}
  // a member from p to q, w by h
  beam(m,p,q,w,h){const was=this.coarse;if(w<0.6&&h<0.6)this.coarse=true;this._beam(m,p,q,w,h);this.coarse=was;}   /* thin members: one light cell a face */
  _beam(m,p,q,w,h){p=p.slice();q=q.slice();const d=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],L=Math.hypot(...d)||1;d[0]/=L;d[1]/=L;d[2]/=L;
    let s=[d[2],0,-d[0]];let sl=Math.hypot(...s);if(sl<1e-6){s=[1,0,0];sl=1;}s=s.map(v=>v/sl);
    const u=[s[1]*d[2]-s[2]*d[1],s[2]*d[0]-s[0]*d[2],s[0]*d[1]-s[1]*d[0]];
    const C=(e,a,b)=>[e[0]+s[0]*a*w/2+u[0]*b*h/2,e[1]+s[1]*a*w/2+u[1]*b*h/2,e[2]+s[2]*a*w/2+u[2]*b*h/2];
    const P=[C(p,-1,-1),C(p,1,-1),C(p,1,1),C(p,-1,1)],Q=[C(q,-1,-1),C(q,1,-1),C(q,1,1),C(q,-1,1)],mid=[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2];
    const face=(a,b,c,dd)=>{this.quad(m,a,b,c,dd,[(a[0]+c[0])/2-mid[0],(a[1]+c[1])/2-mid[1],(a[2]+c[2])/2-mid[2]]);};
    for(let i=0;i<4;i++){const j=(i+1)%4;face(P[i],P[j],Q[j],Q[i]);}face(P[0],P[3],P[2],P[1]);face(Q[0],Q[1],Q[2],Q[3]);}
  // a cylinder or cone frustum about a vertical axis; inward: faces in (a round room); caps: top and bottom discs
  cyl(m,cx,y0,cz,r0,r1,h,seg=16,o={}){const a0=o.a0||0,a1=o.a1==null?Math.PI*2:o.a1;
    for(let i=0;i<seg;i++){const a=a0+(a1-a0)*i/seg,b=a0+(a1-a0)*(i+1)/seg,ma=(a+b)/2;
      const P=(r,an,y)=>[cx+Math.cos(an)*r,y,cz+Math.sin(an)*r];
      this.quad(m,P(r0,a,y0),P(r0,b,y0),P(r1,b,y0+h),P(r1,a,y0+h),o.inward?[-Math.cos(ma),0,-Math.sin(ma)]:[Math.cos(ma),0,Math.sin(ma)]);
      if(o.caps){this.quad(m,[cx,y0+h,cz],[cx,y0+h,cz],P(r1,b,y0+h),P(r1,a,y0+h),[0,1,0]);this.quad(m,[cx,y0,cz],[cx,y0,cz],P(r0,b,y0),P(r0,a,y0),[0,-1,0]);}}}
  // a flat ring (annulus) at height y, facing up (or down)
  ring(m,cx,y,cz,r0,r1,seg=24,down=false,a0=0,a1=Math.PI*2){for(let i=0;i<seg;i++){const a=a0+(a1-a0)*i/seg,b=a0+(a1-a0)*(i+1)/seg;
      const P=(r,an)=>[cx+Math.cos(an)*r,y,cz+Math.sin(an)*r];this.quad(m,P(r0,a),P(r0,b),P(r1,b),P(r1,a),[0,down?-1:1,0]);}}
  // a flight of stairs going from (x,y,z) along +u (the frame's x), width across, n steps of rise and run
  stairs(m,x,y,z,yaw,width,rise,run,n,side){this.at(x,y,z,yaw);for(let i=0;i<n;i++)this.box(m,i*run,0,-width/2,(i+1)*run,(i+1)*rise,width/2,['ny']);
    if(side)for(const s of [-1,1])this.beam(side,[0,rise+1,s*width/2],[n*run,n*rise+1,s*width/2],0.1,0.1);this.pop();}
}

// ---- the light: fittings register here; bake() lights every vertex from the ones near it ----
export function createLights(){const L=[],ambient=[];
  return {list:L,ambient,
    // a fitting: position, colour, how bright, how far it reaches (metres), and whether it lights all round
    // (point) or only downward/outward along a direction (dir)
    add(p,color,i,r,dir){L.push({p,c:[(color>>16&255)/255,(color>>8&255)/255,(color&255)/255],i,r,dir});},
    // the light that is just there in a region: an axis-aligned box and a colour (0..1)
    zone(min,max,color,k){ambient.push({min,max,c:[(color>>16&255)/255,(color>>8&255)/255,(color&255)/255],k:k==null?1:k});}};}

export function bake(B,lights,base=[0.16,0.16,0.17]){
  const G=40,cells=new Map(),key=(i,j)=>i+','+j;
  for(const l of lights.list){const r=l.r,i0=Math.floor((l.p[0]-r)/G),i1=Math.floor((l.p[0]+r)/G),j0=Math.floor((l.p[2]-r)/G),j1=Math.floor((l.p[2]+r)/G);
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=key(i,j);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(l);}}
  for(const m in B.g){const A=B.g[m],d=MAT_DEF[m.split(':')[0]];if(d&&d[2]&&d[2].emissive)continue;   /* what shines is not lit */const n=A.p.length/3,col=new Float32Array(n*3);
    for(let v=0;v<n;v++){const x=A.p[v*3],y=A.p[v*3+1],z=A.p[v*3+2],nx=A.n[v*3],ny=A.n[v*3+1],nz=A.n[v*3+2];
      let r=base[0],g=base[1],b=base[2];
      for(const a of lights.ambient)if(x>=a.min[0]&&x<=a.max[0]&&y>=a.min[1]&&y<=a.max[1]&&z>=a.min[2]&&z<=a.max[2]){r=r*(1-a.k)+a.c[0]*a.k;g=g*(1-a.k)+a.c[1]*a.k;b=b*(1-a.k)+a.c[2]*a.k;}
      const ls=cells.get(key(Math.floor(x/G),Math.floor(z/G)));
      if(ls)for(const l of ls){const dx=l.p[0]-x,dy=l.p[1]-y,dz=l.p[2]-z,d=Math.hypot(dx,dy,dz);if(d>=l.r)continue;
        // light reaches a face from in front of it; a little wraps round so edges are not black
        let lam=(dx*nx+dy*ny+dz*nz)/(d||1);lam=Math.max(0,lam*0.8+0.2);
        if(l.dir){const dd=-(dx*l.dir[0]+dy*l.dir[1]+dz*l.dir[2])/(d||1);lam*=Math.max(0,dd*0.85+0.15);}
        const f=(1-d/l.r);const k=l.i*lam*f*f;r+=l.c[0]*k;g+=l.c[1]*k;b+=l.c[2]*k;}
      col[v*3]=Math.min(1.6,r);col[v*3+1]=Math.min(1.6,g);col[v*3+2]=Math.min(1.6,b);}
    A.col=col;}
}

// one mesh per key; ceilings flagged for the cutaway
export function toMeshes(THREE,B,T,parent){const out=[],mcache={};
  for(const m in B.g){const A=B.g[m];if(!A.p.length)continue;const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(A.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.u,2));
    if(A.col)g.setAttribute('color',new THREE.BufferAttribute(A.col,3));g.computeBoundingSphere();
    const mat=mcache[m]||(mcache[m]=makeMaterial(THREE,T,m));const mesh=new THREE.Mesh(g,mat);mesh.name=m;
    mesh.userData.kind=m;if(m.endsWith(':ceil'))mesh.userData.ceiling=true;mesh.matrixAutoUpdate=false;mesh.updateMatrix();parent.add(mesh);out.push(mesh);}
  return out;}

// ---- furniture and fittings: functions of the builder, in its current frame ----
// (each takes a position and a yaw where it matters; heights in metres; returns nothing)
export function furnish(B,lights){
  const L=(x,y,z,c,i,r,dir)=>{const p=B.T([x,y,z]);lights.add(p,c,i,r,dir);};
  return {
    // a desk: walnut top on steel legs, a drawer pedestal, a lamp and papers
    desk(x,y,z,yaw=0,w=1.8,d=0.9){B.at(x,y,z,yaw);B.box('wood',-w/2,0.72,-d/2,w/2,0.76,d/2);B.box('woodDark',w/2-0.5,0,-d/2+0.05,w/2-0.05,0.72,d/2-0.05);
      for(const s of [-1]){B.box('steel',s*w/2+0.02,0,-d/2+0.05,s*w/2+0.08,0.72,-d/2+0.11);B.box('steel',s*w/2+0.02,0,d/2-0.11,s*w/2+0.08,0.72,d/2-0.05);}
      B.box('paper',-0.5,0.76,-0.2,-0.1,0.78,0.1);B.box('steelDark',0.2,0.76,-0.35,0.3,1.1,-0.25);B.pop();},
    chair(x,y,z,yaw=0){B.at(x,y,z,yaw);B.box('carpetGrey',-0.25,0.42,-0.25,0.25,0.5,0.25);B.box('carpetGrey',-0.25,0.5,0.2,0.25,0.95,0.26);B.box('steelDark',-0.03,0,-0.03,0.03,0.42,0.03);B.box('steelDark',-0.3,0,-0.03,0.3,0.04,0.03);B.box('steelDark',-0.03,0,-0.3,0.03,0.04,0.3);B.pop();},
    // a filing cabinet, four drawers
    cabinet(x,y,z,yaw=0){B.at(x,y,z,yaw);B.box('steel',-0.25,0,-0.32,0.25,1.32,0.32);for(let k=0;k<4;k++)B.box('steelDark',-0.08,0.2+k*0.32,0.32,0.08,0.24+k*0.32,0.34);B.pop();},
    // a wall of shelving packed with files and boxes
    shelves(x,y,z,yaw=0,w=3,h=2.4){B.at(x,y,z,yaw);B.box('woodDark',-w/2,0,-0.2,w/2,h,-0.18);for(const s of [-1,1])B.box('woodDark',s*w/2-0.03,0,-0.2,s*w/2+0.03,h,0.2);
      for(let k=0;k<=4;k++)B.box('woodDark',-w/2,k*h/4.4,-0.2,w/2,k*h/4.4+0.03,0.2);
      for(let k=0;k<4;k++){let u=-w/2+0.05;while(u<w/2-0.15){const bw=0.13+((u*97+k*13)%0.13+0.13)*0.5,bh=h/4.4-0.08-((u*31+k)%0.1);B.box(['paper','carpetGrey','woodDark','red','white'][Math.floor(Math.abs(u*53+k*7))%5],u,k*h/4.4+0.03,-0.17,u+bw,k*h/4.4+0.03+bh,0.15,['ny','nz']);u+=bw+0.01;}}
      B.pop();},
    // a Bureau cubicle: three low panels round a desk, a chair, a terminal
    cubicle(x,y,z,yaw=0){B.at(x,y,z,yaw);B.box('carpetGrey',-1.2,0,-1.2,1.2,1.4,-1.14);B.box('carpetGrey',-1.2,0,-1.2,-1.14,1.4,1.0);B.box('carpetGrey',1.14,0,-1.2,1.2,1.4,1.0);
      B.box('wood',-1.1,0.72,-1.1,1.1,0.76,-0.4);B.box('steelDark',-0.3,0.76,-1.0,0.3,1.2,-0.6);B.box('screen',-0.24,0.84,-0.6,0.24,1.14,-0.59);
      B.box('carpetGrey',-0.25,0.42,0.0,0.25,0.5,0.5);B.box('carpetGrey',-0.25,0.5,0.45,0.25,0.95,0.5);B.pop();},
    // the terminal on a pedestal (the Bureau's computers are old, beige, square-screened)
    terminal(x,y,z,yaw=0){B.at(x,y,z,yaw);B.box('panel',-0.3,0,-0.3,0.3,0.9,0.3);B.box('panel',-0.3,0.9,-0.3,0.3,1.3,0.1);B.box('screen',-0.2,0.95,0.1,0.2,1.25,0.11);B.pop();},
    // the Bureau's piers: tall slabs of concrete, fluted on their faces, as in the Central Executive
    pier(x,y,z,w,d,h,yaw=0,m='concrete'){B.at(x,y,z,yaw);B.box(m,-w/2,0,-d/2,w/2,h,d/2);B.box('concreteDark',-w/2-0.2,0,-d/2-0.2,w/2+0.2,0.4,d/2+0.2,['ny']);
      B.box('concreteDark',-w/2-0.1,h-0.3,-d/2-0.1,w/2+0.1,h,d/2+0.1);   /* a dark plinth it stands on, a shadow-line cap */const n=Math.max(2,Math.floor(w/0.6));
      for(const s of [-1,1])for(let k=0;k<n;k++){const u=-w/2+(k+0.5)*w/n;B.box(m,u-w/n*0.3,0.4,s*d/2,u+w/n*0.3,h-0.4,s*(d/2+0.08));}B.pop();},
    // a rail along a line: posts and a top bar
    rail(p,q,h=1.05,m='steelDark'){const L=Math.hypot(q[0]-p[0],q[2]-p[2]),n=Math.max(1,Math.ceil(L/1.6));
      const was=B.coarse;B.coarse=true;for(let k=0;k<=n;k++){const t=k/n,x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t,z=p[2]+(q[2]-p[2])*t;B.blk(m,x,y,z,0.05,h,0.05,['py','ny']);}B.coarse=was;
      B.beam(m,[p[0],p[1]+h,p[2]],[q[0],q[1]+h,q[2]],0.06,0.06);B.beam(m,[p[0],p[1]+h*0.5,p[2]],[q[0],q[1]+h*0.5,q[2]],0.03,0.03);},
    // a ceiling light panel: a glowing rectangle, and the light it gives
    panel(x,y,z,w=1.2,d=0.6,i=0.9,r=14,c=0xfff4e0){B.box('lightPanel',x-w/2,y-0.05,z-d/2,x+w/2,y,z+d/2,['py']);L(x,y-0.3,z,c,i,r);},
    // a strip of panels down a long ceiling
    panels(x0,z0,x1,z1,y,step=4,i=0.9,r=14,c){const L_=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L_/step));for(let k=0;k<=n;k++){const t=n?k/n:0;this.panel(x0+(x1-x0)*t,y,z0+(z1-z0)*t,1.2,0.6,i,r,c);}},
    // a lamp: a glowing shade on a post or on a desk
    lamp(x,y,z,c=0xffc880,i=0.8,r=6){B.blk('lightWarm',x,y,z,0.35,0.3,0.35);L(x,y,z,c,i,r);},
    // a pipe from p to q, radius r: as a square-sectioned run is enough at these sizes
    pipe(p,q,r=0.3,m='pipe'){B.beam(m,p,q,r*2,r*2);},
    // a potted plant: a concrete planter with a rim, soil, and long fronds that arch up and droop out over it
    plant(x,y,z,s=1){B.blk('concreteDark',x,y,z,0.7*s,0.6*s,0.7*s);B.blk('concreteDark',x,y+0.6*s,z,0.8*s,0.06*s,0.8*s,['ny']);B.blk('rockBlack',x,y+0.6*s,z,0.6*s,0.07*s,0.6*s,['ny']);
      const n=9,c=[x,y+0.62*s,z];for(let k=0;k<n;k++){const a=k*2.4+x*0.7+z*1.3,h=0.55+0.45*((k*37)%10)/10,ca=Math.cos(a),sa=Math.sin(a);
        const m=[x+ca*0.35*s,y+(0.62+0.7*h)*s,z+sa*0.35*s],e=[x+ca*(0.7+0.3*h)*s,y+(0.62+0.35*h)*s,z+sa*(0.7+0.3*h)*s];
        B.beam(k%2?'leaf':'leafDark',c,m,0.22*s,0.05*s);B.beam(k%2?'leaf':'leafDark',m,e,0.18*s,0.05*s);}},
    // a doorway's frame (the opening itself is the gap the room leaves)
    doorframe(x,y,z,yaw=0,w=1.6,h=2.6,m='woodDark'){B.at(x,y,z,yaw);B.box(m,-w/2-0.15,0,-0.12,-w/2,h+0.15,0.12);B.box(m,w/2,0,-0.12,w/2+0.15,h+0.15,0.12);B.box(m,-w/2,h,-0.12,w/2,h+0.15,0.12);B.pop();},
    light:L,
  };
}
