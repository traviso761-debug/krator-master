// ================================================================ DAM BASINS — the flood's debris (PLAN.md, D1)
// What the dam's break tore loose and the flood dropped across the bed: torn ship plating twisted like paper, cargo
// containers half sunk in the silt, and rotting I-beams out of the dockside sheds, the buildings and the dam's own works
// (the owner, 2026-10-23). Small and many, so they are drawn MERGED: one mesh a material for the whole bed.
//   DBF.records(o)   the pieces as RECORDS, cell-seeded on core/rand (a cell's pieces are a hash of the seed, the cell and
//                    an index), placed by o.accept (how welcome a piece is at a point: the page's bands) and thickened
//                    in debris fields (a coarse hash: the flood dropped its load in drifts, not evenly)
//   DBF.draw(T, recs, o)  every piece into a few merged meshes (o: ground(x,z), materials {rust, paint, dark}); each
//                    record learns its lowest and highest point (rec.lo, rec.hi: the checks' "half buried")
// Engine-neutral but for draw (it takes THREE as T): no port-kit helper, no DOM. The page binds it (91b-db-flotsam.js).
const DBF=(function(){
 const R=KRAND,u=(h,k)=>R.unit(R.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
 const KINDS=[['plate',.5],['beam',.32],['container',.18]];
 const pickW=(list,t)=>{let s=0;for(const e of list)s+=e[1];let a=t*s;for(const e of list){if(a<e[1])return e[0];a-=e[1];}return list[list.length-1][0];};
 // faded container paint (sRGB-ish, multiplied by the rust map): oxide red, blue, green, orange, grey, cream
 const PAINT=[[.62,.26,.18],[.26,.36,.48],[.3,.44,.34],[.74,.44,.2],[.52,.52,.5],[.72,.68,.56]];
 // RECORDS. o: {x0,z0,x1,z1, cell (m), seed, ground(x,z), accept(x,z,h) -> 0..1, avoid(x,z) -> true to skip}
 function records(o){const out=[],c=o.cell||70,F=o.field||8;
  for(let j=Math.floor(o.z0/c);j<=Math.floor(o.z1/c);j++)for(let i=Math.floor(o.x0/c);i<=Math.floor(o.x1/c);i++){
   // the debris field: a coarse cell (F cells a side) is a drift or it is not; a drift's middle the thickest
   const fi=Math.floor(i/F),fj=Math.floor(j/F),fh=R.hash(o.seed||1,fi,fj,7),fx=(fi+.2+.6*u(fh,1))*F*c,fz=(fj+.2+.6*u(fh,2))*F*c;
   const drift=u(fh,3)<.45?Math.max(0,1-Math.hypot((i+.5)*c-fx,(j+.5)*c-fz)/(F*c*.55)):0,field=.15+.85*drift;
   for(let n=0;n<3;n++){const h=R.hash(o.seed||1,i,j,n);
    const x=(i+u(h,1))*c,z=(j+u(h,2))*c;if(x<o.x0||x>o.x1||z<o.z0||z>o.z1||(o.avoid&&o.avoid(x,z)))continue;
    const g=o.ground(x,z),a=o.accept(x,z,g)*field;if(!(u(h,3)<a))continue;
    const kind=pickW(KINDS,u(h,4)),r={id:'flotsam:'+i+':'+j+':'+n,kind,x,z,h:g,yaw:u(h,5)*TAU,seed:h};
    if(kind==='plate'){r.w=lr(1.2,5,u(h,6));r.l=lr(1,3.5,u(h,7));r.curl=lr(-.5,.5,u(h,8));r.twist=lr(-1.1,1.1,u(h,9));
     r.edge=u(h,10)<.16;   // on edge, jutting from the silt
     r.pitch=r.edge?lr(1.05,1.4,u(h,11)):lr(-.35,.35,u(h,11));r.roll=lr(-.35,.35,u(h,12));r.sink=r.edge?lr(.25,.45,u(h,13)):lr(.05,.3,u(h,13));}
    else if(kind==='beam'){r.L=lr(4,14,u(h,6));r.d=lr(.25,.7,u(h,7));r.b=r.d*lr(.45,.75,u(h,8));r.kink=lr(.25,.75,u(h,9));
     r.bend=u(h,10)<.6?lr(.15,.7,u(h,11))*(u(h,12)<.5?-1:1):0;r.rot=lr(.1,.45,u(h,13));
     r.jut=u(h,14)<.33;   // one end in the silt, the other in the air
     r.pitch=r.jut?lr(.35,.95,u(h,15)):lr(-.06,.06,u(h,15));r.roll=u(h,16)<.5?Math.PI/2:0;r.roll+=lr(-.2,.2,u(h,17));
     r.sink=r.jut?lr(.3,.55,u(h,18)):lr(.25,.6,u(h,18));}
    else{r.L=u(h,6)<.65?6.06:12.19;r.W=2.44;r.H=2.59;r.side=u(h,7)<.2;r.bury=lr(.45,.8,u(h,8));
     r.pitch=lr(-.22,.22,u(h,9));r.roll=(r.side?Math.PI/2:0)+lr(-.25,.25,u(h,10));r.paint=Math.floor(u(h,11)*PAINT.length);
     r.open=u(h,12)<.35;r.dent=u(h,13)<.5?lr(.1,.45,u(h,14)):0;r.rust=lr(.2,.8,u(h,15));}
    out.push(r);}}
  return out;}
 // ---- drawing: triangles in WORLD space, a buffer a material; the pose (yaw, pitch, roll as three's 'YXZ') about the
 // piece's centre, then the centre placed
 function Buf(){const P=[],U=[],C=[];return{P,U,C};}
 function poser(yaw,pitch,roll,cx,cy,cz,rec){const cy_=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cr=Math.cos(roll),sr=Math.sin(roll);
  return p=>{let x=p[0]*cr-p[1]*sr,y=p[0]*sr+p[1]*cr,z=p[2];          // roll (about z)
   const y2=y*cp-z*sp,z2=y*sp+z*cp;y=y2;z=z2;                        // pitch (about x): +pitch lifts +z
   const x3=x*cy_+z*sy,z3=-x*sy+z*cy_;const w=[x3+cx,y+cy,z3+cz];if(w[1]<rec.lo)rec.lo=w[1];if(w[1]>rec.hi)rec.hi=w[1];return w;};}
 function tri(B,X,a,b,c,ua,ub,uc,k){const A=X(a),Bq=X(b),Cq=X(c);B.P.push(...A,...Bq,...Cq);B.U.push(...ua,...ub,...uc);for(let i=0;i<3;i++)B.C.push(k[0],k[1],k[2]);}
 function quad(B,X,a,b,c,d,ua,ub,uc,ud,k){tri(B,X,a,b,c,ua,ub,uc,k);tri(B,X,a,c,d,ua,uc,ud,k);}
 function box(B,X,cx,cy,cz,sx,sy,sz,k){const x0=cx-sx/2,x1=cx+sx/2,y0=cy-sy/2,y1=cy+sy/2,z0=cz-sz/2,z1=cz+sz/2,q=(a,b,c,d)=>quad(B,X,a,b,c,d,[0,0],[.1,0],[.1,.1],[0,.1],k);
  q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]);q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]);
  q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]);q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]);}
 // a TWISTED PLATE: a sheet bent across, twisted along, crumpled, its edges torn (cells dropped at the rim)
 function plate(r,bufs,g){const hh=r.seed,nu=6,nv=4,V=[];
  for(let j=0;j<=nv;j++){const row=[];for(let i=0;i<=nu;i++){const s=i/nu-.5,t=j/nv-.5,x=s*r.w,z0=t*r.l,a=r.twist*s;
    let y=r.curl*4*s*s*r.w*.35+(u(R.hash(hh,i,j),20)-.5)*.16*Math.min(r.w,r.l);
    row.push([x,y*Math.cos(a)-z0*Math.sin(a),y*Math.sin(a)+z0*Math.cos(a)]);}V.push(row);}
  const ym=g(r.x,r.z),cy=r.edge?ym+r.l*.5*Math.sin(r.pitch)*(1-2*r.sink):ym-r.sink;
  const X=poser(r.yaw,r.pitch,r.roll,r.x,cy,r.z,r),sh=.48+.24*u(hh,21);
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const rim=i===0||j===0||i===nu-1||j===nv-1;if(u(R.hash(hh,i,j,1),22)<(rim?.32:.05))continue;
   const v=sh*(.85+.25*u(R.hash(hh,i,j,2),23));
   quad(bufs.rust,X,V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i],[i*r.w/nu/4,j*r.l/nv/4],[(i+1)*r.w/nu/4,j*r.l/nv/4],[(i+1)*r.w/nu/4,(j+1)*r.l/nv/4],[i*r.w/nu/4,(j+1)*r.l/nv/4],[v,v*.88,v*.8]);}}
 // an I-BEAM: its section swept along z, kinked at r.kink (a bend about x), its flanges rotted through in places
 function beam(r,bufs,g){const hh=r.seed,b=r.b/2,d=r.d/2,tf=Math.max(.025,r.d*.07),tw=Math.max(.02,r.d*.05)/2;
  // the outline, round: top flange, web, bottom flange (index 0..11); 0-3 and 6-9 are flange faces
  const S=[[-b,d],[b,d],[b,d-tf],[tw,d-tf],[tw,-d+tf],[b,-d+tf],[b,-d],[-b,-d],[-b,-d+tf],[-tw,-d+tf],[-tw,d-tf],[-b,d-tf]];
  const N=Math.max(4,Math.round(r.L/.9)),zk=(r.kink-.5)*r.L,P=[];
  for(let i=0;i<=N;i++){const z=(i/N-.5)*r.L;P.push(S.map(p=>{if(z<=zk||!r.bend)return[p[0],p[1],z];const dz=z-zk,c=Math.cos(r.bend),s=Math.sin(r.bend);return[p[0],p[1]*c-dz*s,zk+p[1]*s+dz*c];}));}
  const ym=g(r.x,r.z);let cy;
  if(r.jut)cy=ym+r.L*(.5-r.sink)*Math.sin(r.pitch);else cy=ym+(r.roll>1?b:d)*(1-2*r.sink);   // sink: the fraction in the silt
  const X=poser(r.yaw,r.pitch,r.roll,r.x,cy,r.z,r),sh=.62+.3*u(hh,30);
  for(let i=0;i<N;i++)for(let k=0;k<12;k++){const flange=k<3||(k>=5&&k<9)||k===11;
   if(flange&&u(R.hash(hh,i,k),31)<r.rot*.6)continue;
   const v=sh*(.8+.3*u(R.hash(hh,i,k,1),32)),a=P[i][k],bq=P[i][(k+1)%12],c=P[i+1][(k+1)%12],dq=P[i+1][k],z0=i/N*r.L/4,z1=(i+1)/N*r.L/4;
   quad(bufs.rust,X,a,bq,c,dq,[z0,0],[z0,.1],[z1,.1],[z1,0],[v,v*.86,v*.76]);}}
 // a CONTAINER: corrugated sides and ends, a roof (dented), doors at +z (gone on an open one: its dark inside shows);
 // paint faded and rusting from the bottom up and the edges in
 function container(r,bufs,g){const hh=r.seed,W=r.W/2,H=r.H/2,L=r.L/2,Hf=r.side?r.W:r.H,ym=g(r.x,r.z);
  const X=poser(r.yaw,r.pitch,r.roll,r.x,ym+Hf*(.5-r.bury),r.z,r),P=PAINT[r.paint];
  const col=(y,s)=>{const t=Math.min(1,Math.max(0,r.rust*(.6+.8*(.5-y/(2*H)))+(u(s,40)-.5)*.3));return[lr(P[0],.42,t),lr(P[1],.27,t),lr(P[2],.2,t)];};
  const NZ=Math.round(r.L/.42),cw=.05;
  for(const sd of [1,-1])for(let i=0;i<NZ;i++){const z0=-L+i/NZ*r.L,z1=-L+(i+1)/NZ*r.L,x0=sd*(W+(i%2?cw:0)),x1=sd*(W+((i+1)%2?cw:0));
   for(let j=0;j<2;j++){const y0=-H+j*H,y1=y0+H,k=col((y0+y1)/2,R.hash(hh,i,j,sd));
    if(sd>0)quad(bufs.paint,X,[x0,y0,z0],[x1,y0,z1],[x1,y1,z1],[x0,y1,z0],[z0/4,y0/4],[z1/4,y0/4],[z1/4,y1/4],[z0/4,y1/4],k);
    else quad(bufs.paint,X,[x0,y0,z0],[x0,y1,z0],[x1,y1,z1],[x1,y0,z1],[z0/4,y0/4],[z0/4,y1/4],[z1/4,y1/4],[z1/4,y0/4],k);}}
  for(let i=0;i<NZ;i++){const z0=-L+i/NZ*r.L,z1=-L+(i+1)/NZ*r.L,dn=t=>H-r.dent*Math.sin(Math.PI*t)*Math.sin(Math.PI*(i+.5)/NZ),k=col(H,R.hash(hh,i,9));
   quad(bufs.paint,X,[-W,dn(0),z0],[-W,dn(0),z1],[0,dn(.5),z1],[0,dn(.5),z0],[0,z0/4],[0,z1/4],[.3,z1/4],[.3,z0/4],k);
   quad(bufs.paint,X,[0,dn(.5),z0],[0,dn(.5),z1],[W,dn(1),z1],[W,dn(1),z0],[.3,z0/4],[.3,z1/4],[.6,z1/4],[.6,z0/4],k);}
  // the closed end (-z), corrugated across
  const NX=6;for(let i=0;i<NX;i++){const x0=-W+i/NX*r.W,x1=-W+(i+1)/NX*r.W,za=-L-(i%2?cw:0),zb=-L-((i+1)%2?cw:0),k=col(0,R.hash(hh,i,11));
   quad(bufs.paint,X,[x0,-H,za],[x0,H,za],[x1,H,zb],[x1,-H,zb],[x0/4,0],[x0/4,.6],[x1/4,.6],[x1/4,0],k);}
  if(!r.open){const k=col(0,R.hash(hh,12));quad(bufs.paint,X,[-W,-H,L],[W,-H,L],[W,H,L],[-W,H,L],[0,0],[.6,0],[.6,.65],[0,.65],k);
   for(const bx of [-.6,-.2,.2,.6])box(bufs.rust,X,bx*W,0,L+.04,.05,r.H*.96,.05,[.5,.4,.34]);}   // the locking bars
  else{quad(bufs.dark,X,[-W*.98,-H*.98,L-.06],[W*.98,-H*.98,L-.06],[W*.98,H*.98,L-.06],[-W*.98,H*.98,L-.06],[0,0],[1,0],[1,1],[0,1],[1,1,1]);
   if(u(hh,13)<.5)box(bufs.paint,X,W+.9,-H+.05,L+.4,1.1,.06,r.H*.9,col(0,R.hash(hh,14)));}}   // a door torn off, lying by it
 const WHO={plate:'Torn plating',beam:'A rotting I-beam',container:'A cargo container, half buried'};
 // how far a piece must stand out of the silt, and sit in it (m): a plate's torn edge, a beam's flange, a container's roof
 const OUT={plate:.22,beam:.15,container:.6},IN=.08;
 function draw(T,recs,o){const bufs={rust:Buf(),paint:Buf(),dark:Buf()},G=new T.Group();
  for(const r of recs){r.lo=1e9;r.hi=-1e9;const at={};for(const k in bufs)at[k]=bufs[k].P.length;
   (r.kind==='plate'?plate:r.kind==='beam'?beam:container)(r,bufs,o.ground);
   // HALF BURIED, always: the pose's draws can sink a thin plate whole, or set a piece on a hump with daylight under it;
   // then the piece moves up or down (all of it, as one) until it is both in the silt and out of it at its middle
   const g=o.ground(r.x,r.z);let dy=0;if(r.hi<g+OUT[r.kind])dy=g+OUT[r.kind]-r.hi;else if(r.lo>g-IN)dy=g-IN-r.lo;
   if(dy){for(const k in bufs){const P=bufs[k].P;for(let i=at[k]+1;i<P.length;i+=3)P[i]+=dy;}r.lo+=dy;r.hi+=dy;r.dy=dy;}}
  for(const k in bufs){const b=bufs[k];if(!b.P.length)continue;const geo=new T.BufferGeometry();
   geo.setAttribute('position',new T.Float32BufferAttribute(b.P,3));geo.setAttribute('uv',new T.Float32BufferAttribute(b.U,2));
   geo.setAttribute('color',new T.Float32BufferAttribute(b.C,3));geo.computeVertexNormals();
   const m=new T.Mesh(geo,o.materials[k]);m.userData.inspectLabel='The flood\'s debris ('+(k==='paint'?'containers':k==='dark'?'open containers':'plating and beams')+')';G.add(m);}
  // a marker a piece for the probe (it samples 3000 vertices of a merged mesh, too few to find a plate among 1,400
  // pieces, but every instance of an instanced one): no triangles, never drawn (KNOWN_ISSUES.md)
  const mk=new T.InstancedMesh(new T.BufferGeometry(),o.materials.rust,recs.length),M=new T.Matrix4();
  recs.forEach((r,i)=>{mk.setMatrixAt(i,M.makeTranslation(r.x,(r.lo+r.hi)/2,r.z));});mk.visible=false;mk.userData.probeMarker=true;G.add(mk);
  return G;}
 return {KINDS,records,draw,WHO};})();
