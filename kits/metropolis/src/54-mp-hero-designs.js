// ================================================================= METROPOLIS — the other fourteen: heroes, intact  [draw]
// MP.heroDesign(F, state, lite) -> a Group, from MP.DESIGNS (46). A small massing kit every builder shares (MP.DK): a strip of quads round any profile (round or
// polygonal, about any centre, over any arc), a storeyed facade on such a ring or on a rectangle that leans, twists and widens storey by storey, tubes between two
// points; then one short function a building. The facade is the Spindle's and the Ledger's language: a spandrel, the glass set back with its reveals, a head, a pier
// every bay (instanced panels). Intact, close up, without interiors: the ruins, the shells and the impostors wait on the shells' review (HANDOFF-SHELL.md).
const DK=MP.DK={};
(function(){const PI2=Math.PI*2,WALL=[.97,.97,.95],DARK=[.1,.1,.11],BR=[.62,.47,.32];DK.WALL=WALL;DK.DARK=DARK;DK.BR=BR;
// a quad, its normal from its corners (anticlockwise seen from the side it faces)
DK.q=function(B,m,a,b,c,d,o){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;B.quad(m,a,b,c,d,[nx/l,ny/l,nz/l],o);};
// a polygon's radius factor at angle t (n sides, a corner at angle 0): 1 at a corner, cos(pi/n) mid-face
DK.polyK=function(t,n){if(!n)return 1;const s=PI2/n,u=((t%s)+s)%s;return Math.cos(Math.PI/n)/Math.cos(u-Math.PI/n);};
// a strip round an axis from (r0, y0) to (r1, y1): flat quads, so a polygon's faces are flat. o: cx, cz, a0, a1, seg, sides, flip, col
DK.strip=function(B,m,y0,r0,y1,r1,o){const cx=o.cx==null?0:o.cx,cz=o.cz==null?0:o.cz,a0=o.a0==null?0:o.a0,a1=o.a1==null?PI2:o.a1,n=o.seg,A=(t,r,y)=>{const k=DK.polyK(t,o.sides);return [cx+Math.cos(t)*r*k,y,cz+Math.sin(t)*r*k];};
 for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n;if(o.skip&&o.skip((t0+t1)/2))continue;const a=A(t1,r0,y0),b=A(t0,r0,y0),c=A(t0,r1,y1),d=A(t1,r1,y1);if(o.flip)DK.q(B,m,a,d,c,b,{col:o.col,uv:o.uv});else DK.q(B,m,a,b,c,d,{col:o.col,uv:o.uv});}};
// one surface of a ring: a lathe when round (smooth normals), a strip when polygonal
/* a lathe's flip turns its normals, not its triangles: an inward surface (a court's wall) runs its profile the other way instead, so it is not culled from the court */
DK.surf=function(B,m,y0,r0,y1,r1,o){if(o.sides)return DK.strip(B,m,y0,r0,y1,r1,o);B.lathe(m,o.flip?[[r1,y1],[r0,y0]]:[[r0,y0],[r1,y1]],o.seg,{cx:o.cx,cz:o.cz,a0:o.a0,a1:o.a1,col:o.col?()=>o.col:null,uv:o.uv,mod:o.mod,skip:o.skip?(t=>o.skip(t)):null});};
// a storeyed facade on a ring: o.r(y) the face's radius; storeys of sh from y0 to y1; seg bays round (or over a0..a1); sill, head (shares of a storey); dep the glass's
// set-back; pier the pier's width (0: none), every pierEvery bays; inward: the face looks at the axis (a court); blank(i, y0, y1): a solid storey;
// skip0(t): bays of the first storey left open (a door's, drawn by its caller)
DK.ring=function(B,o){const R=o.r,inw=o.inward?-1:1,dep=o.dep==null?.5:o.dep,seg=o.seg,full=o.a1==null,a0=o.a0==null?0:o.a0,a1=o.a1==null?PI2:o.a1,cx=o.cx==null?0:o.cx,cz=o.cz==null?0:o.cz,
  S={cx:o.cx,cz:o.cz,a0:o.a0,a1:o.a1,seg,sides:o.sides,flip:!!o.inward,col:o.col,uv:o.uv},m=o.mat||'white',g=o.glass||'glass',n=Math.max(1,Math.round((o.y1-o.y0)/o.sh)),hh=(o.y1-o.y0)/n;
 const S1=S;for(let i=0;i<n;i++){const y0=o.y0+i*hh,y1=y0+hh,S=i===0&&o.skip0?Object.assign({},S1,{skip:o.skip0}):S1;
  if(o.blank&&o.blank(i,y0,y1)){DK.surf(B,m,y0,R(y0),y1,R(y1),S);continue;}
  const yS=y0+hh*(o.sill==null?.26:o.sill),yT=y0+hh*(o.head==null?.8:o.head),rS=R(yS),rT=R(yT),d=inw*dep;
  DK.surf(B,m,y0,R(y0),yS,rS,S);DK.surf(B,m,yS,rS,yS,rS-d,S);DK.surf(B,g,yS,rS-d,yT,rT-d,S);DK.surf(B,m,yT,rT-d,yT,rT,S);DK.surf(B,m,yT,rT,y1,R(y1),S);
  if(o.pier!==0){const pw=o.pier==null?.55:o.pier,ym=(yS+yT)/2,rm=(rS+rT)/2-d/2,nb=full?seg:seg+1,ev=(o.pierEvery==null?1:o.pierEvery);
   for(let j=0;j<nb;j+=ev){const t=a0+(a1-a0)*j/seg,k=DK.polyK(t,o.sides);if(S.skip&&S.skip(t)&&S.skip(t-(a1-a0)/seg))continue;B.panel(cx+Math.cos(t)*rm*k,ym,cz+Math.sin(t)*rm*k,Math.PI/2-t+(o.inward?Math.PI:0),pw,yT-yS,dep,o.pierCol||WALL);}}}};
// a storeyed facade on a rectangle: o.rect(y) -> {cx, cz, hw, hd, yaw}, so a storey can lean, twist and widen; bay the bays' width; faces (0 +z, 1 +x, 2 -z, 3 -x);
// curtain: the glass flush, mullions and a transom a storey; inward: the faces look into the rectangle (a court); roof: a cap at y1
DK.slab=function(B,o){const rect=o.rect,dep=o.dep==null?.6:o.dep,m=o.mat||'white',g=o.glass||'glass',n=Math.max(1,Math.round((o.y1-o.y0)/o.sh)),hh=(o.y1-o.y0)/n,faces=o.faces||[0,1,2,3],FY=[0,Math.PI/2,Math.PI,-Math.PI/2],inw=o.inward?-1:1,col=o.col;
 const P=(f,t,y,e)=>{const r=rect(y),hw=r.hw,hd=r.hd;e*=inw;let x,z;if(f===0){x=t*hw;z=hd-e;}else if(f===1){x=hw-e;z=-t*hd;}else if(f===2){x=-t*hw;z=-(hd-e);}else{x=-(hw-e);z=t*hd;}const c=Math.cos(r.yaw==null?0:r.yaw),s=Math.sin(r.yaw==null?0:r.yaw);return [r.cx+x*c+z*s,y,r.cz-x*s+z*c];};
 const Q=(mm,a,b,c,d)=>o.inward?DK.q(B,mm,b,a,d,c,{col,uv:o.uv}):DK.q(B,mm,a,b,c,d,{col,uv:o.uv});
 for(let i=0;i<n;i++){const y0=o.y0+i*hh,y1=y0+hh,blank=o.blank&&o.blank(i,y0,y1),yS=y0+hh*(o.sill==null?.26:o.sill),yT=y0+hh*(o.head==null?.8:o.head),ym=(yS+yT)/2,r=rect(ym);
  faces.forEach(f=>{const L=(f%2===0?r.hw:r.hd)*2,nb=Math.max(1,Math.round(L/(o.bay==null?3:o.bay))),face=(mm,ya,yb,ea,eb)=>Q(mm,P(f,-1,ya,ea),P(f,1,ya,ea),P(f,1,yb,eb),P(f,-1,yb,eb)),yaw=(r.yaw==null?0:r.yaw)+FY[f]+(o.inward?Math.PI:0);
   if(blank||o.solid){face(m,y0,y1,0,0);return;}
   if(o.curtain){face(g,y0,y1,0,0);for(let j=0;j<nb;j++){const p=P(f,-1+2*j/nb,(y0+y1)/2,-.12);B.panel(p[0],(y0+y1)/2,p[2],yaw,.14,hh,.26,o.pierCol||DARK);}const p=P(f,0,y0+.1,-.1);B.panel(p[0],y0+.1,p[2],yaw,L,.2,.22,o.pierCol||DARK);return;}
   face(m,y0,yS,0,0);Q(m,P(f,-1,yS,0),P(f,1,yS,0),P(f,1,yS,dep),P(f,-1,yS,dep));face(g,yS,yT,dep,dep);Q(m,P(f,-1,yT,dep),P(f,1,yT,dep),P(f,1,yT,0),P(f,-1,yT,0));face(m,yT,y1,0,0);
   if(o.pier!==0)for(let j=0;j<=nb;j++){const p=P(f,-1+2*j/nb,ym,dep/2);B.panel(p[0],ym,p[2],yaw,o.pier==null?.5:o.pier,yT-yS,dep,o.pierCol||WALL);}});}
 if(o.roof!==false&&!o.inward){const r=rect(o.y1),c=Math.cos(r.yaw==null?0:r.yaw),s=Math.sin(r.yaw==null?0:r.yaw),C=(x,z)=>[r.cx+x*c+z*s,o.y1,r.cz-x*s+z*c];DK.q(B,o.roofMat||'concrete',C(-r.hw,r.hd),C(r.hw,r.hd),C(r.hw,-r.hd),C(-r.hw,-r.hd),{uv:3});}};
// a tube from a to b, radius r, seg sides, open ends unless caps
DK.tube=function(B,m,a,b,r,seg,o){o=o||{};const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d);d[0]/=L;d[1]/=L;d[2]/=L;let u=Math.abs(d[1])>.9?[1,0,0]:[d[2],0,-d[0]];const ul=Math.hypot(...u);u=u.map(x=>x/ul);
 const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],R=(p,t)=>[p[0]+(u[0]*Math.cos(t)+v[0]*Math.sin(t))*r,p[1]+(u[1]*Math.cos(t)+v[1]*Math.sin(t))*r,p[2]+(u[2]*Math.cos(t)+v[2]*Math.sin(t))*r];
 for(let i=0;i<seg;i++){const t0=i/seg*PI2,t1=(i+1)/seg*PI2;DK.q(B,m,R(a,t0),R(a,t1),R(b,t1),R(b,t0),{col:o.col,uv:o.uv});}};
// a solid of revolution from profile points [[r, y], ...] about (cx, cz)
DK.lathe=function(B,m,pts,seg,o){o=o||{};B.lathe(m,pts,seg,{cx:o.cx,cz:o.cz,col:o.col?()=>o.col:null,uv:o.uv,mod:o.mod,flip:o.flip});};
DK.cone=function(B,m,x,z,y0,r,h,seg,col){B.lathe(m,[[r,y0],[0,y0+h]],seg,{cx:x,cz:z,col:col?()=>col:null,uv:2});};
// a horizontal ledge on a rectangle between insets e0 and e1 at y, facing up or down (its corners are turned to face as asked, whichever inset comes first: a soffit
// facing up was culled from below, the Wedge's sky lobby seen from the street)
DK.rectLedge=function(B,m,rect,y,e0,e1,up){const r=rect(y),c=Math.cos(r.yaw==null?0:r.yaw),s=Math.sin(r.yaw==null?0:r.yaw),C=(x,z)=>[r.cx+x*c+z*s,y,r.cz-x*s+z*c];
 for(let f=0;f<4;f++){const k=[[1,1],[1,-1],[-1,-1],[-1,1]],p=k[f],q=k[(f+1)%4],A=(e,k2)=>C(k2[0]*(r.hw-e),k2[1]*(r.hd-e)),a=A(e0,p),b=A(e0,q),cc=A(e1,q),d=A(e1,p);
  const ny=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]);if((ny>0)===!!up)DK.q(B,m,a,b,cc,d,{uv:2});else DK.q(B,m,a,d,cc,b,{uv:2});}};
// ---- the way in. A door: a screen across a chord of the glass line, A to Bp ([x, z]), its outward away from (cx, cz): bronze posts, fixed sidelights, a head, glass over
// it to top, and a pair of sliding leaves (MP.doorLeaves, pushed to doors). Every lobby records its ground outline and its doors' gaps (B.walk) for the walk's blocks
const DXH=3.82,DH=2.9;DK.DOOR=DXH;
DK.door=function(B,doors,A,Bp,top,cx,cz,y0){y0=y0==null?0:y0;const C=[(A[0]+Bp[0])/2,(A[1]+Bp[1])/2],dx=Bp[0]-A[0],dz=Bp[1]-A[1],L=Math.hypot(dx,dz),d=[dx/L,dz/L];let n=[d[1],-d[0]];if((C[0]-cx)*n[0]+(C[1]-cz)*n[1]<0)n=[-n[0],-n[1]];
 const yaw=Math.atan2(n[0],n[1]),hw=L/2,at=x=>[C[0]+d[0]*x,C[1]+d[1]*x];
 [-hw+.15,-1.8,1.8,hw-.15].forEach(x=>{const p=at(x);B.obox('bronze',p[0],y0+DH/2,p[1],yaw,.3,DH,.3,{uv:2});});
 if(hw-.3-1.95>.1)[-1,1].forEach(k=>{const p=at(k*(1.95+hw-.3)/2);B.obox('glass',p[0],y0+DH/2,p[1],yaw,hw-.3-1.95,DH,.04,{uv:4});});
 B.obox('bronze',C[0],y0+DH+.2,C[1],yaw,2*hw,.4,.36,{uv:2});
 if(top>DH+.5){const a=at(-hw),b=at(hw),P=(q,y)=>[q[0],y,q[1]];DK.q(B,'glass',P(b,y0+DH+.4),P(a,y0+DH+.4),P(a,y0+top),P(b,y0+top));if(n[0]*(d[1])-n[1]*(d[0])<0)DK.q(B,'glass',P(a,y0+DH+.4),P(b,y0+DH+.4),P(b,y0+top),P(a,y0+top));}
 doors.push({x:C[0],z:C[1],y:y0,yaw,w:3.3,h:DH});return {x:C[0],z:C[1],hw};};
// a lobby round a ring: the ground storey as a storefront (a curb, the glass set back dep, piers, a head band), gapped at each door (angles, snapped to a bay line; as many
// bays either side as a 7.6 m screen needs), a floor and a ceiling. o: r(y), cx, cz, h, seg, sides, a0, a1, doors, mat, glass, dep, pier
DK.lobbyRing=function(B,o,doors){const R=o.r,h=o.h,dep=o.dep==null?.5:o.dep,cx=o.cx==null?0:o.cx,cz=o.cz==null?0:o.cz,a0=o.a0==null?0:o.a0,a1=o.a1==null?PI2:o.a1,seg=o.seg,W=(a1-a0)/seg,m=o.mat||'white',full=o.a1==null;
 const rg=y=>R(y)-dep,k=Math.max(1,Math.ceil(Math.asin(Math.min(.99,(DXH+.1)/rg(0)))/W)),D=(o.doors||[]).map(a=>a0+Math.round((a-a0)/W)*W),ad=(t,a)=>Math.abs(((t-a)%PI2+PI2*1.5)%PI2-Math.PI),isD=t=>D.some(a=>ad(t,a)<k*W-1e-6);
 const hT=h-.8,S={cx:o.cx,cz:o.cz,a0:o.a0,a1:o.a1,seg,sides:o.sides,col:o.col,skip:t=>isD(t)},P=(t,r)=>{const q=DK.polyK(t,o.sides);return [cx+Math.cos(t)*r*q,cz+Math.sin(t)*r*q];};
 DK.surf(B,m,0,R(0),.3,R(.3),S);DK.surf(B,m,.3,R(.3),.3,rg(.3),S);DK.surf(B,o.glass||'glass',.3,rg(.3),hT,rg(hT),S);
 const S2=Object.assign({},S,{skip:null});DK.surf(B,m,hT,rg(hT),hT,R(hT),S2);DK.surf(B,m,hT,R(hT),h,R(h),S2);
 const nb=full?seg:seg+1;for(let j=0;j<nb;j++){const t=a0+j*W;if(isD(t)&&D.every(a=>ad(t,a)>k*W-1e-6?true:ad(t,a)<k*W-1e-6?false:true)&&D.some(a=>ad(t,a)<k*W-1e-6))continue;const p=P(t,(R(h/2)+rg(h/2))/2);B.panel(p[0],(.3+hT)/2,p[1],Math.PI/2-t,o.pier==null?.6:o.pier,hT-.3,dep,DK.WALL);}
 /* the floor and the ceiling: a disc, or over an arc the band from rIn (a sector's would fan out from its far centre) */
 const ri=o.rIn==null?0:o.rIn,ci=o.ceilIn==null?ri:o.ceilIn;DK.surf(B,o.ceil||'white',h-.05,ci,h-.05,rg(h),Object.assign({},S2,{seg:Math.max(8,seg)}));DK.surf(B,'concrete',.03,rg(0),.03,ri,Object.assign({},S2,{seg:Math.max(8,seg)}));
 const gaps=D.map(a=>DK.door(B,doors,P(a-k*W,rg(0)),P(a+k*W,rg(0)),hT,cx,cz));
 const pts=[];for(let i=0;i<=seg*3;i++){const t=a0+(a1-a0)*i/(seg*3);pts.push(P(t,R(0)-dep*.4));}(B.walk=B.walk||[]).push({pts,doors:gaps,closed:full});};
// a lobby on a rectangle {cx, cz, hw, hd, yaw}: the same storefront on each face, doors at [face, t] (t -1..1 along it)
DK.lobbySlab=function(B,o,doors){const r=o.rect,h=o.h,dep=o.dep==null?.6:o.dep,m=o.mat||'white',g=o.glass||'glass',hT=h-.8,c=Math.cos(r.yaw==null?0:r.yaw),s=Math.sin(r.yaw==null?0:r.yaw),FY=[0,Math.PI/2,Math.PI,-Math.PI/2];
 const P=(f,t,y,e)=>{let x,z;if(f===0){x=t*r.hw;z=r.hd-e;}else if(f===1){x=r.hw-e;z=-t*r.hd;}else if(f===2){x=-t*r.hw;z=-(r.hd-e);}else{x=-(r.hw-e);z=t*r.hd;}return [r.cx+x*c+z*s,y,r.cz-x*s+z*c];};
 const gaps=[];
 for(let f=0;f<4;f++){const L=(f%2===0?r.hw:r.hd),ds=(o.doors||[]).filter(q=>q[0]===f).map(q=>q[1]).sort((a,b)=>a-b),ht=DXH/L,cuts=[-1];ds.forEach(t=>{cuts.push(t-ht,t+ht);});cuts.push(1);
  const face=(mm,t0,t1,ya,yb,ea,eb)=>DK.q(B,mm,P(f,t0,ya,ea),P(f,t1,ya,ea),P(f,t1,yb,eb),P(f,t0,yb,eb));
  for(let i=0;i+1<cuts.length;i+=2){const t0=cuts[i],t1=cuts[i+1];if(t1-t0<1e-3)continue;face(m,t0,t1,0,.3,0,0);DK.q(B,m,P(f,t0,.3,0),P(f,t1,.3,0),P(f,t1,.3,dep),P(f,t0,.3,dep));face(g,t0,t1,.3,hT,dep,dep);
   const nb=Math.max(1,Math.round((t1-t0)*L/(o.bay==null?3:o.bay)));for(let j=0;j<=nb;j++){const t=t0+(t1-t0)*j/nb,p=P(f,t,(.3+hT)/2,dep/2);B.panel(p[0],(.3+hT)/2,p[2],(r.yaw==null?0:r.yaw)+FY[f],o.pier==null?.5:o.pier,hT-.3,dep,o.pierCol||DK.WALL);}}
  DK.q(B,m,P(f,-1,hT,dep),P(f,1,hT,dep),P(f,1,hT,0),P(f,-1,hT,0));face(m,-1,1,hT,h,0,0);
  ds.forEach(t=>{const a=P(f,t-ht,0,dep),b=P(f,t+ht,0,dep);gaps.push(DK.door(B,doors,[a[0],a[2]],[b[0],b[2]],hT,r.cx,r.cz));});}
 const C=(x,z,y)=>[r.cx+x*c+z*s,y,r.cz-x*s+z*c],iw=r.hw-dep,id=r.hd-dep;DK.q(B,o.ceil||'white',C(-iw,-id,h-.05),C(iw,-id,h-.05),C(iw,id,h-.05),C(-iw,id,h-.05));DK.q(B,'concrete',C(-iw,id,.03),C(iw,id,.03),C(iw,-id,.03),C(-iw,-id,.03));
 const pts=[];[[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]].forEach((k,i,A)=>{if(!i)return;const p=A[i-1],n=Math.max(2,Math.ceil(Math.hypot((k[0]-p[0])*r.hw,(k[1]-p[1])*r.hd)/.5));for(let j=0;j<n;j++){const u=j/n,x=(p[0]+(k[0]-p[0])*u)*(r.hw-dep*.4),z=(p[1]+(k[1]-p[1])*u)*(r.hd-dep*.4);pts.push([r.cx+x*c+z*s,r.cz-x*s+z*c]);}});
 (B.walk=B.walk||[]).push({pts,doors:gaps,closed:true});};
// a doorway into a sloped wall (the Spiral's cone) at angle t from a centre at the origin, its sill at y: an adobe frame standing 0.9 m proud of the slope's foot rf (jambs
// and a head reaching back into the slope, so the opening stays upright), an opening 1.9 by 2.6 at rf closed by two bronze leaves set
// 0.3 m back in the reveal, a bronze lintel strip, a sill out to the tread's edge re
DK.portal=function(B,t,y,rf,re){const yaw=Math.PI/2-t,c=Math.cos(t),s=Math.sin(t),at=(x,z)=>[c*z+s*x,-c*x+s*z],bx=(m,x,yy,z,w,h,d,o)=>{const p=at(x,z);B.obox(m,p[0],yy,p[1],yaw,w,h,d,o);};
 [-1,1].forEach(k=>bx('adobe',k*1.3,y+1.8,rf-1.05,.7,3.6,3.9,{uv:3}));bx('adobe',0,y+3.1,rf-1.05,1.9,1,3.9,{uv:3});
 [-1,1].forEach(k=>bx('bronze',k*.48,y+1.27,rf-.3,.92,2.54,.08,{uv:1,col:[.6,.48,.36]}));bx('bronze',0,y+2.68,rf+.86,2.2,.22,.1,{uv:2});bx('adobe',0,y+.05,(rf+re)/2+.1,1.9,.12,re-rf+.2,{uv:3});};
// a closed or open outline to block that is not a lobby (a wall on the ground with no door)
DK.walkLine=function(B,pts,closed){(B.walk=B.walk||[]).push({pts,doors:[],closed:!!closed});};
})();

MP.heroDesign=function(F,state,lite){const B=MP.builder(lite),W=DK.WALL,PI2=Math.PI*2,u=(i,j)=>MP.u(MP.idHash(F.id)&0xffff,i,j),doors=[];(MP.DESIGN_BUILD[F.id])(F,B,{W,PI2,u,doors});
 /* the doors' leaves are a placed hero's own meshes; the ground outline and its doors' gaps go with the hero for the walk's blocks (56, towerBlocks) */
 const G=B.finish(F,state);if(!lite)MP.doorLeaves(G,doors);G.userData.walk=B.walk||[];G.userData.strips=B.strips||[];
 /* storeys and a core (59), from the drawn shape */
 /* a design with plans (46c) opens its storeys on demand (56); the rest take the floor plates */
 if(!lite&&!(MP.FAMILY[F.id]&&MP.FAMILY[F.id].design)){const Fl=MP.floors(G,{sh:F.sh,top:F.height.roof,y0:F.floorsY0,floors:F.floors,maxY:F.floorsMaxY,roofAccess:F.roofAccess});if(Fl){G.add(Fl);G.userData.floors=Fl.userData;}}
 return G;};
MP.DESIGN_BUILD={
 // S2: five bronze pipes in a shallow arc, each its own storeys and a conical cap with a mouth; bronze bands bind them (the owner, 2026-11-03: no transit tube
 // stubs until a tube network joins buildings); a lobby
 // with two doors at each pipe's foot
 organ(F,B,X){
  F.pipes.forEach((p,k)=>{const [x,z,r,h]=p,R=()=>r;DK.lobbyRing(B,{r:R,cx:x,cz:z,h:F.sh,seg:20,doors:[Math.PI/2,-Math.PI/2],mat:'bronze',dep:.7,pier:.7},X.doors);
   DK.ring(B,{r:R,cx:x,cz:z,y0:F.sh,y1:h-6,sh:F.sh,seg:20,mat:'bronze',pier:.8,dep:.8,pierCol:DK.BR,sill:.3,head:.82,blank:(i,y0)=>((y0+F.sh*1.5)%36)<F.sh});
   /* the cap: a bronze cone with a dark mouth cut in its face, a finial */
   DK.lathe(B,'bronze',[[r+.6,h-6],[r+.6,h-5],[r*.92,h-4],[r*.35,h+2],[.3,h+5]],24,{cx:x,cz:z,uv:2});B.obox('dark',x,h-3.6,z+r*.86,0,r*.7,2.6,.4,{uv:2});
   DK.lathe(B,'bronze',[[.5,h+4.5],[.15,h+(k===2?F.height.tip-h:9)]],8,{cx:x,cz:z,uv:1});});
  /* the bands: a bronze collar round each pipe still standing at the band's height, a beam from pipe to pipe; the pipe's storey there is
     its plant floor (blank), the rooms inside left clear (they ran through a solid slab until the plans, batch 4) */
  F.bands.forEach(y=>{const live=F.pipes.filter(p=>p[3]>y+4);if(live.length<2)return;live.forEach(p=>B.lathe('bronze',[[p[2],y-1.2],[p[2]+1,y-1.2],[p[2]+1,y+1.2],[p[2],y+1.2]],24,{cx:p[0],cz:p[1],uv:2}));
   for(let i=0;i+1<live.length;i++){const a=live[i],b=live[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),s0=a[2]+.5,s1=l-b[2]-.5;B.obox('bronze',a[0]+dx/l*(s0+s1)/2,y,a[1]+dz/l*(s0+s1)/2,-Math.atan2(dz,dx),s1-s0,2.4,6,{uv:2});}});
  },
 // S3: a black glass frustum leaning in, one face steeper; a slot of sky lobby two thirds up, set 3 m in, lit
 wedge(F,B,X){const H=F.height.roof,b={hw:F.footprint.w/2,hd:F.footprint.d/2},T=F.top,rect=y=>{const t=y/H;return {cx:0,cz:F.lean*Math.pow(t,1.5),hw:b.hw+(T.hw-b.hw)*t,hd:b.hd+(T.hd-b.hd)*t};},sl=F.slot;
  DK.lobbySlab(B,{rect:rect(0),h:F.sh,doors:[[0,0],[2,0]],mat:'dark',glass:'glassBlack',pierCol:DK.DARK},X.doors);
  DK.slab(B,{rect,y0:F.sh,y1:sl[0],sh:F.sh,curtain:true,glass:'glassBlack',bay:3.2,roof:false});
  DK.slab(B,{rect:y=>{const r=rect(y);return Object.assign({},r,{hw:r.hw-3,hd:r.hd-3});},y0:sl[0],y1:sl[1],sh:sl[1]-sl[0],glass:'glass',mat:'dark',sill:.04,head:.92,dep:.4,bay:4,pier:.4,pierCol:DK.DARK,roof:false});
  DK.rectLedge(B,'dark',rect,sl[0],0,3,true);DK.rectLedge(B,'dark',rect,sl[1],3,0,false);
  const ins=y=>{const r=rect(y);return Object.assign({},r,{hw:r.hw-2.9,hd:r.hd-2.9});};DK.slab(B,{rect:ins,y0:sl[1]-.5,y1:sl[1]-.2,sh:.3,solid:true,mat:'cyan',roof:false});
  DK.slab(B,{rect,y0:sl[1],y1:H,sh:F.sh,curtain:true,glass:'glassBlack',bay:3.2,roofMat:'dark'});},
 // S4: two swollen legs joined over a 60 m through-arch; the upper body one mass (a superellipse of revolution) with a needle; pastel
 yoke(F,B,X){const L=F.legs,Bd=F.body,t=F.tints,legR=y=>L.r+L.swell*Math.sin(Math.PI*Math.min(1,y/L.y1)),bodyR=y=>{const v=Math.abs((y-Bd.y)/Bd.ry);return v>=1?0:Bd.rx*Math.pow(1-Math.pow(v,4),.25);},b0=Bd.y-Bd.ry,b1=Bd.y+Bd.ry;
  /* the legs' storeys run to the junction (yJ, a whole storey under the legs' tops), the body's from there (batch 5: the plans) */
  const yJ=Math.floor(L.y1/F.sh+1e-6)*F.sh;
  [-1,1].forEach((s,k)=>{DK.lobbyRing(B,{r:legR,cx:s*L.x,h:F.sh,seg:28,doors:[Math.PI/2,-Math.PI/2],col:t[k]},X.doors);DK.ring(B,{r:legR,cx:s*L.x,y0:F.sh,y1:yJ,sh:F.sh,seg:28,pier:.5,col:t[k],sill:.28,head:.78});});
  /* the body: solid where the profile turns over (its soffit over the arch to the junction, and its crown), storeys between; the soffit's bowl
     is left open where a leg passes up through it (its segments inside a leg skipped), so it never cuts a leg's rooms */
  const yA=yJ,yB=yJ+Math.floor((b1-12-yJ)/F.sh)*F.sh,inLeg=(t,y)=>{const r=bodyR(y),x=Math.cos(t)*r,z=Math.sin(t)*r;return [-1,1].some(s=>Math.hypot(x-s*L.x,z)<legR(y));};
  B.lathe('white',(()=>{const p=[];for(let i=0;i<=20;i++){const y=b0+(yA-b0)*i/20;p.push([Math.max(.01,bodyR(y)),y]);}return p;})(),192,{col:()=>t[2],uv:4,skip:inLeg});
  DK.ring(B,{r:bodyR,y0:yA,y1:yB,sh:F.sh,seg:48,pier:.5,pierEvery:2,col:t[2],sill:.3,head:.8});
  DK.lathe(B,'white',(()=>{const p=[];for(let i=0;i<=8;i++){const y=yB+(b1-yB)*i/8;p.push([Math.max(.01,bodyR(y)),y]);}return p;})(),48,{col:t[2]});
  DK.lathe(B,'bronze',[[2.4,b1-1],[1.4,b1+6],[.15,F.height.tip]],12,{uv:1});},
 // S5: a faceted slab turning 50 degrees over its height and widening to the top, a garden on its roof
 reed(F,B,X){const H=F.height.roof,hw=F.footprint.w/2,hd=F.footprint.d/2,rect=y=>{const t=Math.min(1,y/H),s=1+F.widen*t;return {cx:0,cz:0,hw:hw*s,hd:hd*s,yaw:F.twist*Math.PI/180*t};};
  DK.lobbySlab(B,{rect:rect(0),h:F.sh,doors:[[0,0],[2,0]]},X.doors);DK.slab(B,{rect,y0:F.sh,y1:H,sh:F.sh,bay:3,pier:.4,sill:.3,head:.86,roofMat:'green'});
  const r=rect(H),c=Math.cos(r.yaw),s=Math.sin(r.yaw);for(let i=0;i<14;i++){const x=(X.u(i,1)-.5)*1.7*r.hw,z=(X.u(i,2)-.5)*1.6*r.hd;DK.cone(B,'green',r.cx+x*c+z*s,r.cz-x*s+z*c,H,1.2+1.4*X.u(i,3),4+5*X.u(i,4),7);}
  DK.rectLedge(B,'white',rect,H,0,.6,true);},
 // S6: five telescoping octagonal stages of sand ceramic, small dark openings, a ledge at each, a ribbed onion cap
 telescope(F,B,X){const st=F.stages,hS=F.height.roof/st.length;
  st.forEach((r,k)=>{const y0=k*hS,y1=y0+hS,seg=48,arc=2*Math.PI*r/seg;if(!k)DK.lobbyRing(B,{r:()=>r,sides:8,h:F.sh,seg,doors:[Math.PI*5/8,Math.PI*13/8],mat:'adobe',dep:1,pier:arc*.6},X.doors);DK.ring(B,{r:()=>r,sides:8,y0:k?y0:F.sh,y1,sh:F.sh,seg,mat:'adobe',glass:'dark',sill:.42,head:.72,dep:1,pier:arc*.6,pierCol:[.8,.66,.5]});
   if(k+1<st.length)DK.strip(B,'adobe',y1,r+.6,y1,st[k+1],{seg:8,sides:8});DK.strip(B,'adobe',y1-.5,r+.6,y1,r+.6,{seg:8,sides:8});DK.strip(B,'adobe',y1-.5,r,y1-.5,r+.6,{seg:8,sides:8});});
  const y=F.height.roof,R=st[st.length-1],C=F.cap,pts=[[R,y],[C.r,y],[C.r*1.18,y+C.h*.25],[C.r*1.08,y+C.h*.45],[C.r*.7,y+C.h*.7],[C.r*.25,y+C.h*.9],[.3,y+C.h]];
  DK.lathe(B,'adobe',pts,48,{mod:t=>1-.06*(1-Math.abs(Math.cos(8*t))),col:[.82,.6,.42]});},
 // S7: a 16 m stalk of lifts and stairs carrying two saucers (a hotel ring at 104 m, an observatory at 150 m) and a needle to 236 m
 stalk(F,B,X){const S=F.stalk,tip=F.height.tip;DK.lobbyRing(B,{r:()=>S.r0+5,h:4.5,seg:24,doors:[Math.PI/2,-Math.PI/2]},X.doors);DK.lathe(B,'white',[[S.r0+5,4.5],[S.r0+1,8],[S.r0,12],[S.r1,170],[.6,tip]],24,{});
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;B.lathe('glass',[[S.r0+.06,8],[S.r1+.06,166]],2,{a0:a-.18,a1:a+.18,uv:4});}
  F.saucers.forEach((sc,k)=>{const y=sc.y,r=sc.r,t=sc.t,s0=S.r0+(S.r1-S.r0)*(y/170);
   /* the glazed band holds real storeys (46c: the hotel's two of 3 m, the observatory's one hall of 5 m), from 0.3 t under the saucer's middle to 0.2 t over it */
   DK.lathe(B,'white',[[s0,y-t*.5],[r*.55,y-t*.45],[r*.92,y-t*.36],[r,y-t*.3]],56,{});
   DK.ring(B,{r:yy=>r-(yy-(y-t*.3))*.25,y0:y-t*.3,y1:y+t*.2,sh:k?t*.5:t*.25,seg:56,pier:.4,pierEvery:2,sill:.12,head:.9,dep:.4});
   DK.lathe(B,'white',[[r-t*.125,y+t*.2],[r*.8,y+t*.32],[r*.5,y+t*.42],[s0,y+t*.48]],56,{});
   B.lathe('bronze',[[r+.05,y-t*.3],[r+.5,y-t*.3],[r+.5,y-t*.24],[r+.05,y-t*.24]],56,{uv:2});
   if(k===1){const dp=[];for(let i=0;i<=8;i++){const a=i/8*Math.PI/2;dp.push([r*.42*Math.cos(a),y+t*.42+r*.25*Math.sin(a)]);}DK.lathe(B,'glass',dp,32,{});}});},
 // S8: four swollen lobes round a core, a balcony every third storey, rust-red carved ledges, a dome over each lobe
 swell(F,B,X){const H=F.height.roof,Lb=F.lobes,lr=y=>Lb.r+Lb.swell*Math.pow(Math.sin(Math.PI*Math.min(1,y/H)),.6);
  /* the middle's drum only where it is outside, in the valleys between the lobes: inside one it would wall the middle off from the lobe (46c's
     plans open the lobes' corridors on its concourse) */
  {const n=Math.round(H/F.sh),W=Math.PI*2/48;for(let i=0;i<=n;i++){const y0=i*H/n,y1=i<n?(i+1)*H/n:H+2,ym=(y0+y1)/2;B.lathe('white',[[F.core,y0],[F.core,y1]],48,{skip:t=>{const tm=t+W/2,px=Math.cos(tm)*F.core,pz=Math.sin(tm)*F.core;for(let j=0;j<Lb.n;j++){const aj=Math.PI/4+j*2*Math.PI/Lb.n;if(Math.hypot(px-Math.cos(aj)*Lb.at,pz-Math.sin(aj)*Lb.at)<lr(ym)-.2)return true;}return false;}});}}
  for(let k=0;k<Lb.n;k++){const a=Math.PI/4+k*2*Math.PI/Lb.n,cx=Math.cos(a)*Lb.at,cz=Math.sin(a)*Lb.at;
   /* the lobes meet at mid-height (21 m round centres 30 m apart): each lobe's facade and balconies are drawn storey by storey, leaving out the
      bays inside another lobe or the middle (46c's plans keep their rooms out of them too) */
   const inside=(t,r,y)=>{const px=cx+r*Math.cos(t),pz=cz+r*Math.sin(t);if(Math.hypot(px,pz)<F.core-.2)return true;for(let j=0;j<Lb.n;j++){if(j===k)continue;const aj=Math.PI/4+j*2*Math.PI/Lb.n;if(Math.hypot(px-Math.cos(aj)*Lb.at,pz-Math.sin(aj)*Lb.at)<lr(y)-.2)return true;}return false;};
   DK.lobbyRing(B,{r:lr,cx,cz,h:F.sh,seg:24,doors:[a]},X.doors);
   const n=Math.round(H/F.sh);for(let i=1;i<n;i++){const y0=i*H/n,y1=(i+1)*H/n,ym=(y0+y1)/2,W=2*Math.PI/24;DK.ring(B,{r:lr,cx,cz,y0,y1,sh:y1-y0,seg:24,pier:.5,pierEvery:2,sill:.3,head:.8,skip0:t=>inside(t+W/2,lr(ym),ym)});}
   for(let i=F.balcony;i<n;i+=F.balcony){const y=i*H/n,r=lr(y),sk=t=>inside(t+Math.PI/24,r+1.3,y);B.lathe('white',[[r+2.6,y],[r+.05,y]],24,{cx,cz,uv:2,skip:sk});B.lathe('white',[[r+2.6,y-.32],[r+2.6,y]],24,{cx,cz,uv:2,skip:sk});B.lathe('white',[[r+.05,y-.32],[r+2.6,y-.32]],24,{cx,cz,uv:2,skip:sk});B.lathe('glass',[[r+2.5,y],[r+2.5,y+1]],24,{cx,cz,uv:2,skip:sk});}
   F.ledges.forEach(y=>{const r=lr(y)+.45;B.lathe('baroque',[[r,y-1.3],[r,y]],24,{cx,cz,uv:6});B.lathe('baroque',[[r,y],[r-.45,y]],24,{cx,cz,uv:2});});
   const dp=[];for(let i=0;i<=8;i++){const b=i/8*Math.PI/2;dp.push([lr(H)*Math.cos(b),H+lr(H)*.6*Math.sin(b)]);}DK.lathe(B,'white',dp,24,{cx,cz});}
  const dp=[];for(let i=0;i<=8;i++){const b=i/8*Math.PI/2;dp.push([F.core*Math.cos(b),H+2+F.core*.4*Math.sin(b)]);}DK.lathe(B,'baroque',dp,24,{uv:6});},
 // M2: five terraced rings round an open court, planted decks, a roof park
 terrace(F,B,X){const R=F.rings,hT=F.height.roof/R.length,PI2=Math.PI*2;
  /* the terraces (the owner, 2026-11-03: a workable roof on every terrace): each upper ring opens on the terrace below it by four glazed doors on
     the diagonals (two bays each, off the street doors' lines), and each terrace is a paved walk with a raised planter along its parapet; the
     top is the roof park, a paved ring inside the parapet round the lawn, reached by the core's head-house (MP.floors, roofAccess) */
  R.forEach((r,k)=>{const y0=k*hT,y1=y0+hT,sg=Math.round(2*Math.PI*r/4),W=PI2/sg,dA=[1,3,5,7].map(q=>Math.round(q*Math.PI/4/W)*W),isD=t=>dA.some(a=>{const d=Math.abs(((t-a)%PI2+PI2*1.5)%PI2-Math.PI);return d<W-1e-6;});
   if(!k)DK.lobbyRing(B,{r:()=>r,h:F.sh,seg:sg,doors:[0,Math.PI/2,Math.PI,Math.PI*1.5],pier:.45},X.doors);
   DK.ring(B,{r:()=>r,y0:k?y0:F.sh,y1,sh:F.sh,seg:sg,pier:.45,pierEvery:2,sill:.3,head:.82,skip0:k?isD:null});
   if(k)dA.forEach(a=>DK.door(B,X.doors,[Math.cos(a-W)*(r-.5),Math.sin(a-W)*(r-.5)],[Math.cos(a+W)*(r-.5),Math.sin(a+W)*(r-.5)],F.sh*.82,0,0,y0));
   const rn=k+1<R.length?R[k+1]:F.court,top=k+1===R.length,pl=r-1.7;
   B.lathe('white',[[r,y1],[r,y1+1.1]],64,{uv:2});B.lathe('white',[[r-.3,y1+1.1],[r-.3,y1]],64,{uv:2});B.lathe('white',[[r,y1+1.1],[r-.3,y1+1.1]],64,{uv:2});
   /* the planter along the parapet, 1.4 m wide and 0.45 high; then the paving (the whole terrace, or on the roof a 3 m ring round the lawn) */
   B.lathe('white',[[pl,y1+.45],[pl,y1]],64,{uv:2});DK.lathe(B,'green',[[r-.3,y1+.45],[pl,y1+.45]],64,{});
   if(top){DK.lathe(B,'concrete',[[pl,y1],[pl-3,y1]],64,{uv:3});DK.lathe(B,'green',[[pl-3,y1],[rn,y1]],64,{});}else DK.lathe(B,'concrete',[[pl,y1],[rn,y1]],64,{uv:3});});
  DK.ring(B,{r:()=>F.court,y0:0,y1:F.height.roof,sh:F.sh,seg:44,inward:true,pier:.45,sill:.3,head:.82});
  for(let i=0;i<18;i++){const a=X.u(i,1)*Math.PI*2,rr=F.court+3+(R[R.length-1]-F.court-10)*X.u(i,2);DK.cone(B,'green',Math.cos(a)*rr,Math.sin(a)*rr,F.height.roof,1+1.2*X.u(i,3),3.5+4*X.u(i,4),7);}},
 // M3: a dome on a banded drum: a transit hall under a scalloped dome, four portals
 cupola(F,B,X){const r=F.r,H=F.height.roof;
  /* the hall's ceiling a band round the atrium (46c: the galleries ring it), open over the hall's middle */
  const Fp=MP.FAMILY&&MP.FAMILY.cupola,rcA=Fp&&Fp.core.atrium?Fp.core.r:null;DK.lobbyRing(B,{r:()=>r,h:F.hall,seg:48,doors:[0,Math.PI/2,Math.PI,Math.PI*1.5],pier:1.2,dep:.8,ceilIn:rcA},X.doors);DK.ring(B,{r:()=>r,y0:F.hall,y1:H,sh:(H-F.hall)/3,seg:72,pier:.5,pierEvery:2,sill:.3,head:.8});
  [F.hall,H].forEach(y=>{B.lathe('bronze',[[r+.05,y-.6],[r+.6,y-.5],[r+.6,y+.3],[r+.05,y+.4]],72,{uv:2});});
  const dp=[];for(let i=0;i<=14;i++){const b=i/14*Math.PI/2;dp.push([r*Math.cos(b),H+(F.height.tip-H-3)*Math.sin(b)]);}DK.lathe(B,'white',dp,96,{mod:t=>1-.035*(1-Math.abs(Math.cos(F.scallops/2*t)))});
  const ly=F.height.tip-3;B.lathe('glass',[[F.lantern,ly],[F.lantern,ly+2.4]],24,{uv:4});DK.lathe(B,'bronze',[[F.lantern+.4,ly+2.4],[.2,ly+3.4]],24,{uv:2});
  for(let k=0;k<4;k++){const a=k*Math.PI/2,c=Math.cos(a),s=Math.sin(a),yaw=Math.PI/2-a;B.obox('bronze',c*(r+3),F.hall+.4,s*(r+3),yaw,14,.8,6,{uv:2});[-1,1].forEach(q=>B.obox('bronze',c*(r+5.5)-s*q*6.6,F.hall/2,s*(r+5.5)+c*q*6.6,yaw,.8,F.hall,.8,{uv:2}));}},
 // M4: a long curved slab with window ribbons, one end stepping down
 crescent(F,B,X){const R=F.R,w=F.width,cz=R,mid=-Math.PI/2,a0=mid-F.span/2,a1=mid+F.span/2,st=F.steps,cut=[a0,a0+F.span*F.stepAt];for(let i=1;i<st.length;i++)cut.push(cut[1]+(a1-cut[1])*i/(st.length-1));
  const rO=R+w/2,rI=R-w/2,radial=(a,y0,y1,dir)=>{const c=Math.cos(a),s=Math.sin(a),P=(r,y)=>[r*c,y,cz+r*s];if(dir>0)DK.q(B,'relief',P(rI,y0),P(rO,y0),P(rO,y1),P(rI,y1),{uv:6});else DK.q(B,'relief',P(rO,y0),P(rI,y0),P(rI,y1),P(rO,y1),{uv:6});};
  for(let i=0;i<st.length;i++){const b0=cut[i],b1=cut[i+1],h=st[i],seg=Math.max(2,Math.round((b1-b0)*R/4));
   if(!i)DK.lobbyRing(B,{r:()=>rO,rIn:rI+.6,cz,a0:b0,a1:b1,h:F.sh,seg,doors:[b0+(b1-b0)*.2,b0+(b1-b0)*.5,b0+(b1-b0)*.8],pier:.4},X.doors);DK.ring(B,{r:()=>rO,cz,a0:b0,a1:b1,y0:i?0:F.sh,y1:h,sh:F.sh,seg,pier:.4,sill:.3,head:.86});
   {const arcAt=r=>{const q=[];for(let m=0;m<=seg;m++){const t=b0+(b1-b0)*m/seg;q.push([Math.cos(t)*r,cz+Math.sin(t)*r]);}return q;};DK.walkLine(B,arcAt(rI),false);if(i)DK.walkLine(B,arcAt(rO),false);}DK.ring(B,{r:()=>rI,cz,a0:b0,a1:b1,y0:0,y1:h,sh:F.sh,seg:Math.max(2,Math.round(seg*rI/rO)),inward:true,pier:.4,sill:.3,head:.86});
   B.lathe('concrete',[[rO,h],[rI,h]],seg,{cz,a0:b0,a1:b1,uv:3});if(i===0){radial(b0,0,h,-1);DK.walkLine(B,[[Math.cos(b0)*rI,cz+Math.sin(b0)*rI],[Math.cos(b0)*rO,cz+Math.sin(b0)*rO]],false);}if(i+1<st.length)radial(b1,st[i+1],h,1);else{radial(b1,0,h,1);DK.walkLine(B,[[Math.cos(b1)*rI,cz+Math.sin(b1)*rI],[Math.cos(b1)*rO,cz+Math.sin(b1)*rO]],false);}}},
 // M5: a sphere on four splayed legs, its upper half a glass dome holding a forest
 terrarium(F,B,X){const S=F.sphere,cy=S.y,r=S.r,rr=y=>Math.sqrt(Math.max(0,r*r-(y-cy)*(y-cy))),bot=cy-r;
  DK.lathe(B,'white',(()=>{const p=[];for(let i=0;i<=6;i++){const y=bot+(8)*i/6;p.push([Math.max(.01,rr(y)),y]);}return p;})(),40,{});
  DK.ring(B,{r:rr,y0:bot+8,y1:cy,sh:(cy-bot-8)/5,seg:40,pier:.45,sill:.3,head:.8});B.lathe('bronze',[[rr(cy-.5),cy-.5],[r+.5,cy],[r+.5,cy+.4],[r,cy+.5]],48,{uv:2});
  const dp=[];for(let i=0;i<=12;i++){const b=i/12*Math.PI/2;dp.push([r*Math.cos(b),cy+.5+r*Math.sin(b)]);}DK.lathe(B,'glassClear',dp,48,{});
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2;B.lathe('bronze',dp.map(p=>[p[0]+.08,p[1]]),1,{a0:a-.012,a1:a+.012,uv:2});}
  /* the forest floor at the equator, the park storey's (46c); the trees stand clear of the stair and lift's head at the middle */
  B.lathe('green',[[r-.2,cy+.02],[0,cy+.02]],40,{uv:3});
  /* the core's head on the deck: a glazed kiosk over the stair and lift (open to the walk on +z), a bronze roof */
  B.lathe('glassClear',[[3.7,cy+3],[3.7,cy+.02]],32,{skip:t=>{let d=Math.abs(t-Math.PI/2);d=Math.min(d,Math.PI*2-d);return d<.26;}});B.lathe('bronze',[[4.1,cy+3],[4.1,cy+3.3],[0,cy+3.5]],32,{uv:2});
  /* the stand-in trees, only where the lowland kits are not on the page (MP.flora, 59d, plants the deck) */
  if(!(MP.flora&&MP.flora.ok()))for(let i=0;i<F.trees;i++){const a=X.u(i,1)*Math.PI*2,d=7+(r-13)*Math.sqrt(X.u(i,2)),h=6+10*X.u(i,3);DK.cone(B,'green',Math.cos(a)*d,Math.sin(a)*d,cy,1.6+2*X.u(i,4),Math.min(h,r*.85-d*.5),7,[.8+.3*X.u(i,5),1,.8]);}
  /* the service stalk: a lobby ring between the legs' feet (its doors on the four ways in), a drum up into the sphere holding the stair and lift */
  DK.lobbyRing(B,{r:()=>8,h:4.2,seg:24,doors:[0,Math.PI/2,Math.PI,-Math.PI/2],pier:.45},X.doors);DK.lathe(B,'white',[[8,4.2],[3.7,6.6],[3.7,bot+8]],24,{});
  /* the main entrance on +z: a canopy on two piers over the doors and a paved walk out to the plaza past the sphere */
  B.box('concrete',-4.2,4.2,4.2,4.55,7.6,13.2,{uv:3});[-3.6,3.6].forEach(x=>B.box('concrete',x-.25,x+.25,0,4.2,12.6,13.1,{uv:2}));B.box('concrete',-2.6,2.6,0,.05,8,36,{uv:4});
  const Lg=F.legs;for(let k=0;k<Lg.n;k++){const a=Math.PI/4+k*Math.PI*2/Lg.n,c=Math.cos(a),s=Math.sin(a);DK.tube(B,'white',[c*(Lg.foot-2),4.2,s*(Lg.foot-2)],[c*Lg.top,Lg.y,s*Lg.top],Lg.r,10);DK.lobbySlab(B,{rect:{cx:c*Lg.foot,cz:s*Lg.foot,hw:5,hd:5,yaw:Math.atan2(c,s)},h:4.2,doors:[[0,0]],dep:.4,bay:2.5},X.doors);DK.q(B,'concrete',[c*Lg.foot-5,4.2,s*Lg.foot+5],[c*Lg.foot+5,4.2,s*Lg.foot+5],[c*Lg.foot+5,4.2,s*Lg.foot-5],[c*Lg.foot-5,4.2,s*Lg.foot-5],{uv:3});}},
 // M6: great concrete arches round a court with a reflecting pool; relief walls above
 arcades(F,B,X){X.gaps=[];const hw=F.footprint.w/2,hd=F.footprint.d/2,cw=F.court.w/2,cd=F.court.d/2,H=F.height.roof,A=F.arch,ay=A.h;
  /* the arcade: on each outer face, piers every 12 m and an elliptical arch between them, the glass 3 m behind */
  const face=(f)=>{const L=(f%2===0?hw:hd),n=Math.max(1,Math.round(2*L/A.every)),sp=2*L/n,P=(t,y,e)=>{if(f===0)return [t,y,hd-e];if(f===1)return [hw-e,y,-t];if(f===2)return [-t,y,-(hd-e)];return [-(hw-e),y,t];};
   const D0=DK.DOOR;if(f%2===0){DK.q(B,'glass',P(-L,0,3),P(-D0,0,3),P(-D0,ay,3),P(-L,ay,3));DK.q(B,'glass',P(D0,0,3),P(L,0,3),P(L,ay,3),P(D0,ay,3));const a=P(-D0,0,3),b=P(D0,0,3);X.gaps.push(DK.door(B,X.doors,[a[0],a[2]],[b[0],b[2]],ay,0,0));}else DK.q(B,'glass',P(-L,0,3),P(L,0,3),P(L,ay,3),P(-L,ay,3));
   for(let i=0;i<=n;i++){const t=-L+i*sp,a=P(Math.max(-L,t-1.1),0,0),b=P(Math.min(L,t+1.1),0,0);const p=P(t,ay/2,1.5);B.obox('concrete',p[0],ay/2,p[2],[0,Math.PI/2,Math.PI,-Math.PI/2][f],2.2,ay,3,{uv:3});
    if(i<n){const c=t+sp/2,ar=sp/2-1.1,ns=12,yA=q=>4+(ay-1.2-4)*Math.sqrt(Math.max(0,1-q*q));for(let j=0;j<ns;j++){const qa=-1+2*j/ns,qb=-1+2*(j+1)/ns,xa=c+ar*qa,xb=c+ar*qb;
     DK.q(B,'concrete',P(xa,yA(qa),0),P(xb,yA(qb),0),P(xb,ay,0),P(xa,ay,0),{uv:3});DK.q(B,'concrete',P(xb,yA(qb),0),P(xa,yA(qa),0),P(xa,yA(qa),1.2),P(xb,yA(qb),1.2),{uv:3});}}}
   DK.q(B,'concrete',P(-L,ay-.02,3),P(L,ay-.02,3),P(L,ay-.02,0),P(-L,ay-.02,0),{uv:3});};
  [0,1,2,3].forEach(face);
  {const pts=[];[[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]].forEach(k=>pts.push([k[0]*(hw-3.2),k[1]*(hd-3.2)]));const fine=[];for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.5);for(let j=0;j<n;j++)fine.push([p[0]+(q[0]-p[0])*j/n,p[1]+(q[1]-p[1])*j/n]);}(B.walk=B.walk||[]).push({pts:fine,doors:X.gaps,closed:true});}
  DK.slab(B,{rect:()=>({cx:0,cz:0,hw,hd}),y0:ay,y1:H,sh:F.sh,mat:'relief',bay:6,pier:2.6,sill:.34,head:.72,dep:.9,pierCol:[.78,.77,.74],roof:false});
  DK.slab(B,{rect:()=>({cx:0,cz:0,hw:cw,hd:cd}),y0:0,y1:H,sh:F.sh,inward:true,bay:4,pier:.6,sill:.12,head:.84,dep:.6,roof:false});
  const C=(x,z)=>[x,H,z];DK.q(B,'concrete',C(-hw,hd),C(hw,hd),C(hw,cd),C(-hw,cd),{uv:3});DK.q(B,'concrete',C(-hw,-cd),C(hw,-cd),C(hw,-hd),C(-hw,-hd),{uv:3});DK.q(B,'concrete',C(cw,cd),C(hw,cd),C(hw,-cd),C(cw,-cd),{uv:3});DK.q(B,'concrete',C(-hw,cd),C(-cw,cd),C(-cw,-cd),C(-hw,-cd),{uv:3});
  DK.q(B,'glassBlack',[-cw+4,.12,cd-4],[cw-4,.12,cd-4],[cw-4,.12,-cd+4],[-cw+4,.12,-cd+4]);B.box('concrete',-cw+3.6,cw-3.6,0,.3,cd-4,cd-3.6,{uv:2});B.box('concrete',-cw+3.6,cw-3.6,0,.3,-cd+3.6,-cd+4,{uv:2});},
 // M7: two round pods on stalks joined by a glass tube, a third low dome
 pods(F,B,X){F.pods.forEach(p=>{const rr=y=>Math.sqrt(Math.max(0,p.r*p.r-(y-p.y)*(y-p.y))),b=p.y-p.r;
   DK.lobbyRing(B,{r:()=>7,cx:p.x,cz:p.z,h:4.2,seg:16,doors:[Math.PI/2]},X.doors);DK.lathe(B,'white',[[7,4.2],[4.2,b+2],[3.6,b+4]],16,{cx:p.x,cz:p.z});
   DK.lathe(B,'white',(()=>{const q=[];for(let i=0;i<=8;i++){const y=b+(p.y-6-b)*i/8;q.push([Math.max(.01,rr(y)),y]);}return q;})(),40,{cx:p.x,cz:p.z});
   DK.ring(B,{r:rr,cx:p.x,cz:p.z,y0:p.y-6,y1:p.y+6,sh:F.sh,seg:40,pier:.45,sill:.25,head:.84});
   DK.lathe(B,'white',(()=>{const q=[];for(let i=0;i<=8;i++){const y=p.y+6+(p.r-6)*i/8;q.push([Math.max(.01,rr(y)),y]);}return q;})(),40,{cx:p.x,cz:p.z});});
  const a=F.pods[0],b=F.pods[1],T=F.tube,x0=a.x+a.r*.92,x1=b.x-b.r*.92;DK.tube(B,'glass',[x0,T.y,a.z],[x1,T.y,b.z],T.r,14);for(let x=x0;x<=x1;x+=4)DK.tube(B,'bronze',[x-.2,T.y,a.z],[x+.2,T.y,a.z],T.r+.25,14);
  const D=F.dome;DK.lobbyRing(B,{r:y=>D.r*Math.sqrt(Math.max(0,1-Math.pow(y/D.h,2))),cx:D.x,cz:D.z,h:3.6,seg:36,doors:[Math.PI/2],pier:.45},X.doors);
  DK.lathe(B,'white',(()=>{const q=[];for(let i=0;i<=10;i++){const y=3.6+(D.h-3.6)*i/10;q.push([Math.max(.01,D.r*Math.sqrt(Math.max(0,1-Math.pow(y/D.h,2)))),y]);}return q;})(),36,{cx:D.x,cz:D.z});},
 // M8: an adobe cone wound by an outside ramp, five turns to a drum and a dome; dark doorways along the ramp; a lobby at its foot opposite the ramp's start
 spiral(F,B,X){const H=F.height.roof,R=y=>F.r0+(F.r1-F.r0)*Math.min(1,y/H),rw=F.ramp,n=Math.round(F.turns*64),ts=Math.PI+.5;
  DK.lobbyRing(B,{r:R,h:F.sh,seg:48,doors:[Math.PI],mat:'adobe',glass:'glassBlack',dep:.8,pier:1.4},X.doors);
  DK.lathe(B,'adobe',(()=>{const p=[];for(let i=0;i<=8;i++){const y=F.sh+(H-F.sh)*i/8;p.push([R(y),y]);}return p;})(),64,{uv:4});
  /* the gate: two adobe pylons outside the door's screen and a lintel with a bronze strip, under the ramp's first turn (the ramp starts beside it, ts, so it
     crosses the door only at that turn's 5.1 m soffit) */
  const g0=R(0),rg0=g0-.8,W=Math.PI*2/48,gk=Math.max(1,Math.ceil(Math.asin((DK.DOOR+.1)/rg0)/W)),gt=rg0*Math.sin(gk*W)+.75;
  [-1,1].forEach(k=>B.obox('adobe',-(g0-.2),2.4,k*gt,-Math.PI/2,1.5,4.8,2.6,{uv:3}));B.obox('adobe',-(g0+.5),4.5,0,-Math.PI/2,2*gt+1.5,.6,1.6,{uv:3});
  B.obox('bronze',-(g0+1.34),3.95,0,-Math.PI/2,2*gt-1.5,.3,.08,{uv:2});
  /* the ramp: a helix rw wide round the cone from beside the gate, rising H in the turns; its tread, its outer face and parapet, its underside; a portal into the cone
     where the tread passes each storey's floor (its plans, 46c; until those, every half turn), so a portal's sill is a floor */
  const P=(t,r,y)=>[Math.cos(t)*r,y,Math.sin(t)*r],Fp=MP.FAMILY&&MP.FAMILY.spiral,at=Fp?new Set(Fp.levels.filter(l=>l.k&&l.y>F.sh-.01).map(l=>Math.round((l.y-.6)*n/H))):null;
  for(let i=0;i<n;i++){const t0=ts+i/n*F.turns*Math.PI*2,t1=ts+(i+1)/n*F.turns*Math.PI*2,y0=H*i/n,y1=H*(i+1)/n,r0=R(y0),r1=R(y1),ra=r0+rw,rb=r1+rw;
   DK.q(B,'adobe',P(t0,ra,y0+.6),P(t1,rb,y1+.6),P(t1,r1,y1+.6),P(t0,r0,y0+.6),{uv:3});DK.q(B,'adobe',P(t0,ra,y0-.4),P(t0,ra,y0+1.5),P(t1,rb,y1+1.5),P(t1,rb,y1-.4),{uv:3});
   DK.q(B,'adobe',P(t0,r0,y0-.4),P(t1,r1,y1-.4),P(t1,rb,y1-.4),P(t0,ra,y0-.4),{uv:3});DK.q(B,'adobe',P(t0,ra-.4,y0+.6),P(t0,ra-.4,y0+1.5),P(t1,rb-.4,y1+1.5),P(t1,rb-.4,y1+.6),{uv:3});
   if(at?at.has(i):i%32===16&&y0>F.sh)DK.portal(B,t0,y0+.6,R(y0+.6),r0);
   /* the tread walked: a strip every eight steps along its middle (B.strips, 56's walk) */
   if(i%8===0){const j=Math.min(n,i+8),t2=ts+j/n*F.turns*Math.PI*2,y2=H*j/n,rm0=r0+rw/2,rm1=R(y2)+rw/2;(B.strips=B.strips||[]).push({a:[Math.cos(t0)*rm0,Math.sin(t0)*rm0,y0+.6],b:[Math.cos(t2)*rm1,Math.sin(t2)*rm1,y2+.6],w:rw-.6});}}
  const dp=[[F.r1,H],[F.r1-.6,H],[F.r1-.6,H+2.4]];for(let i=0;i<=8;i++){const b=i/8*Math.PI/2;dp.push([F.dome*Math.cos(b),H+2.4+F.dome*Math.sin(b)]);}DK.lathe(B,'adobe',dp,32,{col:[.86,.72,.56]});}

};
