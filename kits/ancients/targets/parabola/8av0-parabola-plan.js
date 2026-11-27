// ================================================================= PARABOLA — the Bowl's arcology: the plan (records)
// The owner's choice (2026-11-11), design A of openworld/ANCIENT-NETWORK.md section 8.11: "a city that was a solar furnace".
// A terraced paraboloid dish 1 800 m across and 320 m deep, tilted 30 degrees to face the noon sun, on three Cyclopean piers on
// the Bowl's south-west rim (scale model 5.1 px 970,1186); a receiver of bronze and blue glass at the focus on a tripod mast; a
// terminus hall at the dish's lowest point, inside the shell; about 120 000 people as built (targets/parabola/NOTES.md).
//
// THE FRAME
//   the dish     w = (u*u + v*v) / 4f in its own frame (u east, v across the tilt, w up the axis), f = R*R / 4*DEPTH. The axis leans
//                TILT degrees toward AZ (0: north, where Krator's noon sun stands at ~40 S), so it faces out over the Bowl
//   the contours a level plane cuts a tilted paraboloid in a CIRCLE about (u 0, v v0), v0 = 2f tan(tilt): the lowest point. That is
//                what makes the terraces level: each is a ring (low down) or an arc (once the circle meets the rim) of that circle
//   the terraces terrace k (1..K) is a riser of NS storeys behind a glazed front at contour radius rho(k), from y(k-1) to y(k), the
//                dwellings behind it, and its tread at y(k) out to the next riser: a farm on its roof. The lip of every tread (the top
//                of its riser) lies on the true paraboloid; the stepped face lies inside it. Terrace 0 is THE BASIN, a level plaza
//   the mirrors  a bank of panels on every lip, each TANGENT to the paraboloid where it stands, so light along the axis reflects to
//                the focus; on treads steeper than STEEP two more rows stand on posts up to the true surface (no farms there)
//   the shell    the Ancients' white seamed shell SHELL m behind the inner face (offset along the normal), on RIBS organic ribs from
//                a boss under the vertex to the rim; three Cyclopean PIERS stand under three of them, a bronze band at each landing
//   the focus    the receiver, a sphere RX.r in radius at the focus, on three legs from the inner face (the mast), each with a stair
//   the hall     the terminus, a vault under the basin at the lowest point, opening through the north lip onto a viaduct
//
// [G data]: no three.js, no DOM. Every choice is a function of the plan's seed and a record's own indices (core/rand: KRAND.hash),
// never of how many draws came before it. Records carry stable ids (pb.t.<k>.<s>, pb.m.<k>.<s>.<row>.<i>, pb.pier.<i>); the ruin
// is a set of deltas by those ids (PARABOLA.ruin). The drawing (8av1) decides nothing. Geometry is in metres, y up, -z north.
const PARABOLA={};
PARABOLA.DIM={R:900,DEPTH:320,TILT:30,AZ:0,STO:25.6/7,NS:6,LIT:16,SHELL:55,LOW:70,SEG:64,
 MIR:{pitch:6.4,w:5.6,h:3.2},STEEP:58,RIBS:24,RIB0:70,RINGS:12,RIBD:7,
 // the piers: under the rib at phi (degrees from north, clockwise), landing at r*R from the vertex; widths at the foot and the head
 PIERS:[{phi:180,r:.55,w0:130,w1:74},{phi:60,r:.78,w0:96,w1:60},{phi:300,r:.78,w0:96,w1:60}],
 MAST:{r:.5,phi:[0,120,240],leg:6},RX:{r:38},
 HALL:{len:320,w:64,h:30,under:6},VIA:{len:420,w:34,pitch:42},
 // the population: the lit depth behind each front (one-sided, LIT m), NS storeys, SHARE of it homes, M2 gross a person
 SHARE:.8,M2:45,
 // the ruin (owner's brief and answers, 2026-11-11: the west quarter windward): mirrors fallen, the windward quarter, the receiver's lean
 RUIN:{mirrors:.84,wind:270,quarter:90,breach:.45,lean:14,panes:.35,sandK:5,lake:6}};

PARABOLA.h=function(seed){return KRAND.unit(KRAND.hash.apply(null,arguments));};
PARABOLA.angDist=function(a,b){const d=Math.abs(((a-b)%360+540)%360-180);return d;};

// ---- the frame ----------------------------------------------------------------------------------------------------
// o.ground(x, z): the ground's height (default 0: the kit page's plain). The dish's lowest point stands LOW over the ground there.
PARABOLA.frame=function(o){o=o||{};const D=PARABOLA.DIM,R=D.R,f=R*R/(4*D.DEPTH),t=D.TILT*Math.PI/180,az=D.AZ*Math.PI/180;
 const ct=Math.cos(t),st=Math.sin(t),d=[Math.sin(az),0,-Math.cos(az)],X=[Math.cos(az),0,Math.sin(az)];
 const A=[st*d[0],ct,st*d[2]],E=[ct*d[0],-st,ct*d[2]];
 const v0=2*f*Math.tan(t),drop=f*st*Math.tan(t),g=o.ground||(()=>0);
 const Ox=-D.DEPTH*A[0],Oz=-D.DEPTH*A[2];                       // the rim's centre stands over x = z = 0
 const w0=v0*v0/(4*f),lx=Ox+w0*A[0]+v0*E[0],lz=Oz+w0*A[2]+v0*E[2];
 const ymin=g(lx,lz)+D.LOW,Oy=ymin+drop;
 const F={R,f,t,ct,st,v0,ymin,drop,X,A,E,O:[Ox,Oy,Oz],low:[lx,ymin,lz],H:D.NS*D.STO,ground:g};
 F.at=(u,v,w)=>[Ox+u*X[0]+v*E[0]+w*A[0],Oy+v*E[1]+w*A[1],Oz+u*X[2]+v*E[2]+w*A[2]];
 F.surf=(u,v)=>F.at(u,v,(u*u+v*v)/(4*f));
 F.height=(u,v)=>Oy+(u*u+v*v)/(4*f)*ct-v*st;
 // the unit normal into the dish (toward the focus side)
 F.normal=(u,v)=>{let a=-u/(2*f),b=-v/(2*f),c=1;const l=Math.sqrt(a*a+b*b+c*c);a/=l;b/=l;c/=l;
  return[a*X[0]+b*E[0]+c*A[0],b*E[1]+c*A[1],a*X[2]+b*E[2]+c*A[2]];};
 F.outer=(u,v,off)=>{const p=F.surf(u,v),n=F.normal(u,v),s=off==null?D.SHELL:off;return[p[0]-n[0]*s,p[1]-n[1]*s,p[2]-n[2]*s];};
 F.rho=y=>Math.sqrt(Math.max(0,4*f*(y-ymin)/ct));
 F.uvC=(rho,a)=>[rho*Math.sin(a),v0+rho*Math.cos(a)];          // contour polar (a = 0 toward the north lip) -> dish uv
 F.inRim=(u,v)=>u*u+v*v<=R*R+1e-6;
 F.phi=(u,v)=>{const p=Math.atan2(u,v)*180/Math.PI;return p<0?p+360:p;};
 // the part of the contour circle of radius rho inside the rim: [a0, a1] (through the south), or null
 F.arc=rho=>{if(rho<=0)return null;const c=(R*R-rho*rho-v0*v0)/(2*rho*v0);if(c>=1)return[0,2*Math.PI];if(c<=-1)return null;const a=Math.acos(c);return[a,2*Math.PI-a];};
 F.focus=F.at(0,0,f);
 return F;};

// ---- the plan -----------------------------------------------------------------------------------------------------
PARABOLA.plan=function(o){o=o||{};const D=PARABOLA.DIM,S=o.seed==null?9710:o.seed,F=PARABOLA.frame(o),H=F.H,R=D.R;
 const P={id:'parabola',seed:S,dim:D,frame:F,terraces:[],segs:[],mirrors:[],ribs:[],panels:[],piers:[],legs:[]};
 const xz=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
 const back=F.height(0,-R);
 // the terraces and their segments
 for(let k=1;F.ymin+(k-1)*H<back-1;k++){const y1=F.ymin+k*H,y0=y1-H,rho=F.rho(y1),rhoN=F.rho(y1+H),arc=F.arc(rho);
  if(!arc)break;
  const T={id:'pb.t.'+k,k,y0,y1,rho,rhoN,a0:arc[0],a1:arc[1],segs:[]};
  // the lip's length, sampled, then cut into segments of about SEG m
  const lipAt=a=>{const q=F.uvC(rho,a);return F.surf(q[0],q[1]);};
  let L=0;const NS0=96;for(let i=0;i<NS0;i++)L+=xz(lipAt(arc[0]+(arc[1]-arc[0])*i/NS0),lipAt(arc[0]+(arc[1]-arc[0])*(i+1)/NS0));
  const n=Math.max(1,Math.round(L/D.SEG));
  for(let s=0;s<n;s++){const a0=arc[0]+(arc[1]-arc[0])*s/n,a1=arc[0]+(arc[1]-arc[0])*(s+1)/n,am=(a0+a1)/2;
   let len=0;for(let i=0;i<8;i++)len+=xz(lipAt(a0+(a1-a0)*i/8),lipAt(a0+(a1-a0)*(i+1)/8));
   const q=F.uvC(rho,am),qN=F.uvC(rhoN,am),lip=F.surf(q[0],q[1]),foot=F.surf(qN[0],qN[1]);
   const tw=xz(lip,foot),nrm=F.normal(q[0],q[1]),slope=Math.acos(Math.min(1,nrm[1]))*180/Math.PI;
   const floor=len*Math.min(D.LIT,tw)*D.NS;
   const G={id:'pb.t.'+k+'.'+s,k,s,a0,a1,rho,rhoN,y0,y1,len,tw,slope,use:slope>D.STEEP?'mirror':'farm',phi:F.phi(q[0],q[1]),
    mid:[lip[0],y1,lip[2]],floor,pop:Math.round(floor*D.SHARE/D.M2)};
   P.segs.push(G);T.segs.push(G.id);
   // the mirror bank on the lip (row 0), and on a steep tread two more rows on posts up to the true surface
   const rows=G.use==='mirror'?3:1;
   for(let r=0;r<rows;r++){const rr=rho+(rhoN-rho)*r/3,m=Math.max(1,Math.floor(len*(rr/rho)/D.MIR.pitch));
    for(let i=0;i<m;i++){const a=a0+(a1-a0)*(i+.5)/m,qq=F.uvC(rr,a);if(!F.inRim(qq[0],qq[1]))continue;
     const p=F.surf(qq[0],qq[1]),nn=F.normal(qq[0],qq[1]);
     P.mirrors.push({id:'pb.m.'+k+'.'+s+'.'+r+'.'+i,k,s,r,i,at:[p[0]+nn[0]*.4,p[1]+nn[1]*.4,p[2]+nn[2]*.4],n:nn,a,post:r?p[1]-y1:0});}}}
  P.terraces.push(T);}
 P.K=P.terraces.length;
 // THE BASIN: the level plaza at the lowest point out to the first riser, closed on the north by the rim's parapet.
 // Its outline: the first contour's arc inside the rim, then the rim's arc inside the contour (through the north)
 {const rho=F.rho(F.ymin+H),arc=F.arc(rho),poly=[],uv=[];const N=64;
  for(let i=0;i<=N;i++){const q=F.uvC(rho,arc[0]+(arc[1]-arc[0])*i/N);uv.push(q);}
  const cb=(R*R+F.v0*F.v0-rho*rho)/(2*R*F.v0),b0=cb>=1?0:Math.acos(Math.max(-1,cb));
  for(let i=1;i<N;i++){const b=-b0+2*b0*i/N;uv.push([R*Math.sin(b),R*Math.cos(b)]);}
  for(const q of uv){const p=F.surf(q[0],q[1]);poly.push([p[0],p[2]]);}
  P.basin={id:'pb.basin',y:F.ymin,rho,uv,poly,parapet:F.height(0,R)-F.ymin};}
 // the ribs and the shell's panels (between ribs, in rings from the boss to the rim)
 for(let j=0;j<D.RIBS;j++){const phi=j*360/D.RIBS,pier=D.PIERS.findIndex(p=>Math.abs(p.phi-phi)<1e-6);
  P.ribs.push({id:'pb.rib.'+j,j,phi,r0:D.RIB0,r1:R,d:D.RIBD,w:pier>=0?16:9,pier:pier>=0?'pb.pier.'+pier:null});}
 for(let j=0;j<D.RIBS;j++)for(let i=0;i<D.RINGS;i++){const r0=D.RIB0+(R-D.RIB0)*i/D.RINGS,r1=D.RIB0+(R-D.RIB0)*(i+1)/D.RINGS;
  P.panels.push({id:'pb.sh.'+j+'.'+i,j,i,phi0:j*360/D.RIBS,phi1:(j+1)*360/D.RIBS,r0,r1});}
 P.boss={id:'pb.boss',r:D.RIB0};
 // the piers: vertical, from the ground to the underside of the rib they carry
 D.PIERS.forEach((p,i)=>{const r=p.r*R,a=p.phi*Math.PI/180,u=r*Math.sin(a),v=r*Math.cos(a);
  const top=F.outer(u,v,D.SHELL+D.RIBD),g=F.ground(top[0],top[2]);
  P.piers.push({id:'pb.pier.'+i,i,phi:p.phi,r,uv:[u,v],at:[top[0],g,top[2]],top,h:top[1]-g,w0:p.w0,w1:p.w1,rib:'pb.rib.'+Math.round(p.phi/(360/D.RIBS))});});
 // the mast's legs: from the treads they stand on to the receiver's skin
 const FO=F.focus,rx=D.RX.r;
 D.MAST.phi.forEach((ph,i)=>{const r=D.MAST.r*R,a=ph*Math.PI/180,u=r*Math.sin(a),v=r*Math.cos(a),p=F.surf(u,v);
  const k=Math.max(0,Math.floor((p[1]-F.ymin)/H+1e-9)),y=F.ymin+k*H,foot=[p[0],y,p[2]];
  const dx=FO[0]-foot[0],dy=FO[1]-foot[1],dz=FO[2]-foot[2],l=Math.sqrt(dx*dx+dy*dy+dz*dz);
  P.legs.push({id:'pb.mast.'+i,i,phi:ph,foot,k,head:[FO[0]-dx/l*rx,FO[1]-dy/l*rx,FO[2]-dz/l*rx],r:D.MAST.leg,stair:true,len:l-rx});});
 P.receiver={id:'pb.rx',at:FO.slice(),r:rx};
 // the terminus hall: under the basin at the lowest point, its north end the portal through the north lip
 {const Hd=D.HALL,lip=F.outer(0,R),y1=F.ymin-Hd.under,z0=lip[2];
  P.hall={id:'pb.hall',x0:F.low[0]-Hd.w/2,x1:F.low[0]+Hd.w/2,z0,z1:z0+Hd.len,y0:y1-Hd.h,y1,portal:[F.low[0],y1-Hd.h,z0],
   platforms:[-1,1].map((sd,i)=>({id:'pb.hall.plat.'+i,x:F.low[0]+sd*13,w:8,z0:z0+20,z1:z0+Hd.len-20}))};
  const V=D.VIA,n=Math.round(V.len/V.pitch);
  P.viaduct={id:'pb.via',x:F.low[0],w:V.w,z0:z0-V.len,z1:z0,y:P.hall.y0,spans:[]};
  for(let i=0;i<n;i++)P.viaduct.spans.push({id:'pb.via.'+i,i,z0:z0-(i+1)*V.pitch,z1:z0-i*V.pitch,pier:[F.low[0],0,z0-(i+1)*V.pitch]});}
 // the stats
 const pop=P.segs.reduce((s,g)=>s+g.pop,0),floor=P.segs.reduce((s,g)=>s+g.floor,0);
 const farm=P.segs.filter(g=>g.use==='farm').reduce((s,g)=>s+g.len*g.tw,0);
 P.stats={terraces:P.K,segs:P.segs.length,mirrors:P.mirrors.length,pop,floor,farm,height:back+0,lip:F.height(0,R),focus:FO[1],
  span:back-F.ymin,piers:P.piers.map(p=>Math.round(p.h))};
 return P;};

// ---- the as-built dress: crop strips on the farmed treads, people on the basin -------------------------------------
PARABOLA.dress=function(P){const out=[],F=P.frame,S=P.seed,h=PARABOLA.h;
 for(const g of P.segs){if(g.use!=='farm')continue;const nb=Math.max(1,Math.min(4,Math.floor((g.tw-3)/5)));
  for(let b=0;b<nb;b++){const f=(b+.6)/(nb+.4),rr=g.rho+(g.rhoN-g.rho)*f*.85+1.5;
   out.push({id:'pb.bed.'+g.k+'.'+g.s+'.'+b,kind:'bed',k:g.k,s:g.s,rr,a0:g.a0,a1:g.a1,y:g.y1,crop:Math.floor(h(S,201,g.k,g.s,b)*8),wid:Math.min(4,g.tw/(nb+1))});}}
 const B=P.basin;for(let i=0;i<70;i++){const a=h(S,202,i,0)*2*Math.PI,r=B.rho*(.15+.75*h(S,202,i,1)),q=F.uvC(r,a);
  if(!F.inRim(q[0],q[1]))continue;const p=F.surf(q[0],q[1]);out.push({id:'pb.fig.'+i,kind:'figure',at:[p[0],B.y,p[2]],ry:h(S,202,i,2)*6.28});}
 return out;};

// ---- the ruin: deltas by id ---------------------------------------------------------------------------------------
PARABOLA.ruin=function(P){const D=P.dim,RU=D.RUIN,F=P.frame,S=P.seed,h=PARABOLA.h,H=F.H,R=D.R;
 const inWind=phi=>PARABOLA.angDist(phi,RU.wind)<RU.quarter/2;
 const out={wind:RU.wind,gone:[],fallen:[],kept:0,shell:[],ribs:[],fan:[],sand:[],orchard:[],legs:P.legs.map(l=>l.id)};
 // THE WINDWARD QUARTER: the shell's panels there down (the boss's ring kept), the ribs broken, the upper terraces slumped
 for(const p of P.panels){const pm=(p.phi0+p.phi1)/2;if(inWind(pm)&&(p.i>=1||h(S,301,p.j,p.i)<.5))out.shell.push(p.id);}
 for(const r of P.ribs)if(inWind(r.phi)&&PARABOLA.angDist(r.phi,RU.wind)<RU.quarter/2-1)out.ribs.push({id:r.id,at:R*(.22+.3*h(S,302,r.j,0))});
 const Kb=Math.round(RU.breach*P.K);
 for(const g of P.segs)if(inWind(g.phi)&&g.k>Kb+Math.floor(3*h(S,303,g.k,g.s)))out.gone.push(g.id);
 const gone=new Set(out.gone);
 // THE MIRRORS: most fallen. Off a slumped terrace they went into the fan; near the rim's ends over into the scree; the rest
 // lie broken on the tread below their lip
 const segOf=new Map(P.segs.map(g=>[g.id,g]));
 for(const m of P.mirrors){if(h(S,304,m.k,m.s,m.r*4096+m.i)>=RU.mirrors){out.kept++;continue;}
  const g=segOf.get('pb.t.'+m.k+'.'+m.s),u1=h(S,305,m.k,m.s,m.r*4096+m.i),u2=h(S,306,m.k,m.s,m.r*4096+m.i);
  const ends=Math.min(m.a-P.terraces[m.k-1].a0,P.terraces[m.k-1].a1-m.a)<.06;let at,where;
  if(gone.has(g.id)||ends){const q=F.uvC(g.rho,m.a),rp=Math.hypot(q[0],q[1]),e=F.outer(q[0]*R/rp,q[1]*R/rp,0);
   const ox=e[0],oz=e[2],l=Math.max(1e-9,Math.hypot(ox,oz)),d=20+160*u1*u1;
   at=[e[0]+ox/l*d+(u2-.5)*40,0,e[2]+oz/l*d+(h(S,307,m.k,m.s,m.i)-.5)*40];at[1]=F.ground(at[0],at[2])+.3;where=gone.has(g.id)?'fan':'scree';}
  else{const q=F.uvC(g.rho-2-6*u1,m.a),p=F.surf(q[0],q[1]);at=[p[0],g.y0+.3,p[2]];where='tread';}
  out.fallen.push({id:m.id,at,ry:u2*6.28,tilt:(u1-.5)*.6,where});}
 // the slumped quarter's debris: shell plates, slabs and glass in a fan on the ground below the breach
 {const a=RU.wind*Math.PI/180,rim=F.surf(R*Math.sin(a),R*Math.cos(a));
  for(let i=0;i<180;i++){const sp=(h(S,308,i,0)-.5)*RU.quarter*Math.PI/180*1.2,d=10+360*Math.pow(h(S,308,i,1),1.6);
   const dir=[Math.sin(a+sp),-Math.cos(a+sp)],x=rim[0]+dir[0]*d,z=rim[2]+dir[1]*d,u=h(S,308,i,2);
   out.fan.push({id:'pb.fan.'+i,at:[x,F.ground(x,z),z],s:6+28*u*u,kind:u<.35?'shell':u<.85?'slab':'glass',ry:h(S,308,i,3)*6.28});}}
 // THE RECEIVER: cracked and leaning in its seat; the mast's stairs gone
 {const la=(30+20*h(S,309,0,0))*Math.PI/180;
  out.receiver={id:P.receiver.id,lean:RU.lean,dir:[Math.sin(la),0,-Math.cos(la)],drop:7,panes:RU.panes,crack:{at:h(S,309,1,0),w:.5}};}
 // THE LOWER DECKS DRIFTED: sand on the low treads' ends at the north lip, in the hall's mouth and on the viaduct by the portal
 for(const g of P.segs){if(g.k>RU.sandK)continue;const T=P.terraces[g.k-1],n=T.segs.length;if(g.s>1&&g.s<n-2)continue;
  const am=(g.a0+g.a1)/2,q=F.uvC((g.rho+g.rhoN)/2,am);if(!F.inRim(q[0],q[1]))continue;const p=F.surf(q[0],q[1]);
  out.sand.push({id:'pb.sand.'+g.k+'.'+g.s,on:g.id,at:[p[0],g.y1,p[2]],len:g.len*.8,w:Math.max(4,g.tw*.8),h:1.5+3*h(S,310,g.k,g.s),a:am});}
 {const Hl=P.hall;for(let i=0;i<7;i++){const z=Hl.z0+8+i*(D.HALL.len*.45/7),x=(Hl.x0+Hl.x1)/2+(h(S,311,i,0)-.5)*30;
   out.sand.push({id:'pb.sand.hall.'+i,on:Hl.id,at:[x,Hl.y0,z],len:22+20*h(S,311,i,1),w:16+14*h(S,311,i,2),h:1.2+3.2*(1-i/7),a:0});}
  for(let i=0;i<3;i++){const z=Hl.z0-12-i*30;out.sand.push({id:'pb.sand.via.'+i,on:P.viaduct.id,at:[P.viaduct.x,P.viaduct.y,z],len:24,w:P.viaduct.w*.7,h:1.6-.4*i,a:0});}}
 // THE INNER TERRACES WILD ORCHARD: trees on every farmed tread that stands, a few left as meadow
 for(const g of P.segs){if(g.use!=='farm'||gone.has(g.id))continue;if(h(S,312,g.k,g.s)<.18)continue;
  const n=Math.floor(g.len*Math.max(0,g.tw-4)/260);
  for(let i=0;i<n;i++){const a=g.a0+(g.a1-g.a0)*h(S,313,g.k,g.s,i),f=h(S,314,g.k,g.s,i),q=F.uvC(g.rho+(g.rhoN-g.rho)*(.12+.76*f),a);
   if(!F.inRim(q[0],q[1]))continue;const p=F.surf(q[0],q[1]);
   out.orchard.push({id:'pb.or.'+g.k+'.'+g.s+'.'+i,on:g.id,at:[p[0],g.y1,p[2]],h:4+7*h(S,315,g.k,g.s,i)});}}
 // THE RAIN LAKE: the basin flooded RU.lake m deep, held by the north parapet
 out.lake={id:'pb.lake',level:P.basin.y+RU.lake,poly:P.basin.poly.slice(),depth:RU.lake};
 // the Izani customs post at the portal and the caravanserai in the hall, where the road from Mantis ends (owner, 2026-11-11)
 {const Hl=P.hall,cx=(Hl.x0+Hl.x1)/2,z0=Hl.z0+D.HALL.len*.5,z1=Hl.z1-14,stalls=[];
  for(let i=0;i<14;i++){const side=i<7?-1:1,j=i%7;stalls.push({id:'pb.serai.stall.'+i,at:[cx+side*24,Hl.y0,z0+8+j*(z1-z0-16)/6],ry:side>0?-Math.PI/2:Math.PI/2});}
  const beasts=[];for(let i=0;i<10;i++)beasts.push({id:'pb.serai.beast.'+i,at:[cx+(h(S,316,i,0)-.5)*30,Hl.y0,z0+12+h(S,316,i,1)*(z1-z0-24)],ry:h(S,316,i,2)*6.28});
  out.post={owner:'2026-11-11',gate:{id:'pb.post.gate',at:[cx,Hl.y0,Hl.z0+3],w:Hl.x1-Hl.x0-6},house:{id:'pb.post.house',at:[cx+20,Hl.y0,Hl.z0+16],size:[14,7,12]},
   serai:{id:'pb.serai',rect:[cx-28,cx+28,z0,z1],y:Hl.y0,stalls,beasts}};}
 return out;};
