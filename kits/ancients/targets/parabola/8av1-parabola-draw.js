// ================================================================= PARABOLA — the drawing (records in, geometry out)
// buildParabola draws the plan (8av0) as the Ancients built it (d = 0) and as the Bowl has left it (d = 1: the plan with
// PARABOLA.ruin's deltas). Everything placed is registered in core/tags first (the dish a building; its terraces, piers, ribs,
// mast, receiver and hall parts; the mirror banks fixtures; the beds and the orchard flora; the post and serai buildings), then
// drawn from the record. What is not in a record (a vine, a course of a pier's stones, a stair landing) is hashed from its
// record's id with KRAND (PARABOLA.h), or drawn on the kit's reseed() stream (the plain's trees and rubble rings).
//
// Surfaces are gridSurface quads merged per material (world-scale UVs: the dwelling map's storey lines stay level on the
// 25.6/7 m storey); the small things are kit instances. The rain lake is drawn after the scene by 90p (core/water).
const PB_SITE={};
MAT.pbBronze=new THREE.MeshStandardMaterial({color:0xa8743c,roughness:.36,metalness:.8,side:DS});
MAT.pbBronzeR=new THREE.MeshStandardMaterial({color:0x5f7258,roughness:.7,metalness:.35,side:DS});
MAT.pbGlass=new THREE.MeshStandardMaterial({color:0x2c6f9e,emissive:0x0b2a44,emissiveIntensity:.6,roughness:.12,metalness:.55,side:DS});
MAT.pbGlassR=new THREE.MeshStandardMaterial({color:0x29506a,roughness:.3,metalness:.45,side:DS});
// the mirrors: a bright, glossy silver (no environment map in the kit, so not fully metal or it renders black)
MAT.pbMirror=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.1,metalness:.55,side:DS});
MAT.pbCyan=new THREE.MeshStandardMaterial({color:0x0e4248,emissive:0x34e8e8,emissiveIntensity:.95,roughness:.4,metalness:0,side:DS});
MAT.pbSand=new THREE.MeshStandardMaterial({color:0xcfae80,roughness:1,metalness:0,side:DS});
kdef('pbMirror',new THREE.BoxGeometry(1,1,1),MAT.pbMirror);
kdef('pbCyl',new THREE.CylinderGeometry(1,1,1,16),MAT.acKit);
kdef('pbBronzeCyl',new THREE.CylinderGeometry(1,1,1,24,1,true),MAT.pbBronze);
kdef('pbDune',new THREE.SphereGeometry(1,20,8,0,Math.PI*2,0,Math.PI/2),MAT.pbSand);

function buildParabola(scene,gx,gz,d){reseed(9920+d);KOFF=[gx,0,gz];
 const dd=d>0?1:0,P=PARABOLA.plan({seed:9710}),F=P.frame,D=P.dim,H=F.H,R=D.R,RU=dd?PARABOLA.ruin(P):null,DR=dd?[]:PARABOLA.dress(P);
 const h=(a,b,c,e)=>PARABOLA.h(9710,a,b,c,e==null?0:e),G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const gone=new Set(RU?RU.gone:[]),shellGone=new Set(RU?RU.shell:[]),ribBreak=new Map(RU?RU.ribs.map(r=>[r.id,r.at]):[]);
 // the far plane past the dish (980 m tall, seen from 3 km), and the sun moved to the north where Krator's noon sun stands
 // (the kit's sun is in the south-west; the dish faces north, so its inner face would be lit only by the fill)
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof sun!=='undefined')sun.position.set(-700,1100,-1000);
 const ST=dd?'ruined':'intact',W=a=>[a[0]+gx,a[1],a[2]+gz];

 // ---- core/tags: one record per placed thing, before anything is drawn -------------------------------------------
 {const T=KTAGS.parabola||(KTAGS.parabola=KTAGS.create({build:'ancients-parabola'})),pre=(dd?'ruin':'intact')+'/';
  const B=T.add({id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:parabola',name:'Parabola',at:[gx,0,gz],r:R,h:P.stats.height,
   tags:{culture:'ancient',types:['dwelling-multi','farm','civic','infrastructure'],state:ST,landmark:true}});
  const part=(id,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind,key:id,at:W(at)},o||{}));
  for(const g of P.segs)if(!gone.has(g.id)){part(g.id,'terrace',g.mid,{tags:{level:g.k,role:g.use}});
   T.child(B.id,{'class':'fixture',kind:'mirror-bank',key:g.id+'.mirrors',at:W(g.mid),tags:{state:ST}});}
  for(const p of P.piers)part(p.id,'pier',p.at,{h:p.h,r:p.w0/2});
  for(const r of P.ribs)part(r.id,'rib',F.outer(0,0),{tags:{role:r.pier?'bearing':'shell'}});
  for(const l of P.legs)part(l.id,'mast-leg',l.foot,{h:l.len});
  part(P.receiver.id,'receiver',P.receiver.at,{r:P.receiver.r});
  part(P.hall.id,'terminus-hall',[(P.hall.x0+P.hall.x1)/2,P.hall.y0,(P.hall.z0+P.hall.z1)/2],{size:[P.hall.x1-P.hall.x0,P.hall.y1-P.hall.y0,P.hall.z1-P.hall.z0]});
  part(P.basin.id,'basin',F.low);
  T.child(B.id,{'class':'infrastructure',kind:'viaduct',key:P.viaduct.id,at:W([P.viaduct.x,P.viaduct.y,(P.viaduct.z0+P.viaduct.z1)/2])});
  for(const g of DR)if(g.kind==='bed')T.child(B.id,{'class':'flora',kind:'crop',key:g.id,at:W(F.surf(0,0))});else T.child(B.id,{'class':'life',kind:'person',key:g.id,at:W(g.at)});
  if(RU){for(const t of RU.orchard)T.child(B.id,{'class':'flora',kind:'tree',key:t.id,at:W(t.at),h:t.h});
   T.child(B.id,{'class':'feature',kind:'lake',key:RU.lake.id,at:W(F.low),name:'the rain lake'});
   const Pz=RU.post,Pt={culture:'iziz',state:'reclaimed'};
   T.child(B.id,{'class':'building',kind:'customs-post',key:Pz.house.id,name:'Izani customs post (proposed)',at:W(Pz.house.at),tags:Object.assign({types:['civic']},Pt)});
   T.child(B.id,{'class':'building',kind:'caravanserai',key:Pz.serai.id,name:'caravanserai (proposed)',at:W([(Pz.serai.rect[0]+Pz.serai.rect[1])/2,Pz.serai.y,(Pz.serai.rect[2]+Pz.serai.rect[3])/2]),tags:Object.assign({types:['inn','market']},Pt)});}}

 REGISTER({name:'Parabola ('+STATE(d)+')',x:0,z:0,r:R*1.05,y:0,h:P.stats.height+20});
 REGISTER({name:'Parabola — the receiver',x:P.receiver.at[0],z:P.receiver.at[2],r:P.receiver.r+12,y:P.receiver.at[1]-P.receiver.r-14,h:2*P.receiver.r+20});
 REGISTER({name:'Parabola — the terminus hall',x:(P.hall.x0+P.hall.x1)/2,z:(P.hall.z0+P.hall.z1)/2,r:(P.hall.x1-P.hall.x0)/2,y:P.hall.y0,h:P.hall.y1-P.hall.y0});
 for(const p of P.piers)REGISTER({name:'Parabola — the '+['south','north-east','north-west'][p.i]+' pier',x:p.at[0],z:p.at[2],r:p.w0/2+4,y:p.at[1],h:p.h});

 // ---- helpers ------------------------------------------------------------------------------------------------------
 const cp=(rho,a,y)=>{const q=F.uvC(rho,a),p=F.surf(q[0],q[1]);return[p[0],y==null?p[1]:y,p[2]];};
 const rimRho=a=>{const c=Math.cos(a),v0=F.v0;return -v0*c+Math.sqrt(Math.max(0,v0*v0*c*c-v0*v0+R*R));};
 const uvShift=(g,dv)=>{const a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+dv);return g;};
 const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],nrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
 const crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const qUp=dir=>new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dir[0],dir[1],dir[2]).normalize());
 const qBasis=(x,z)=>{const y=crs(z,x);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...x),new THREE.Vector3(...y),new THREE.Vector3(...z)));};
 const RISE=[],TREAD=[],DECK=[],CYANS=[],SHELL=[],RIBS=[],BRONZE=[],PIER=[],FRAB=[],PAVE=[],SHADE=[],FRAME=[],GLASS=[];
 const inWind=phi=>RU&&PARABOLA.angDist(phi,RU.wind)<D.RUIN.quarter/2;
 const segAt=(u,v)=>{const y=F.height(u,v),k=Math.floor((y-F.ymin)/H+1e-9);if(k<1||k>P.K)return null;const T=P.terraces[k-1];
  let a=Math.atan2(u,v-F.v0);if(a<0)a+=TAU;if(a<T.a0||a>T.a1)return null;return T.segs[Math.min(T.segs.length-1,Math.floor((a-T.a0)/(T.a1-T.a0)*T.segs.length))];};

 // ---- the terraces: risers of homes behind glazed fronts, treads farmed (or mirror-clad where steep) --------------
 for(const g of P.segs){if(gone.has(g.id))continue;const nu=Math.max(2,Math.round(g.len/10)),y0=g.y0,y1=g.y1;
  RISE.push(uvShift(gridSurface((u,v)=>cp(g.rho,lerp(g.a0,g.a1,u),lerp(y0,y1,v)),nu,1,{uS:g.len/25.6,vS:H/25.6}),y0/25.6));
  (g.use==='farm'?TREAD:DECK).push(gridSurface((u,v)=>{const a=lerp(g.a0,g.a1,u),sm=Math.max(g.rho,Math.min(g.rhoN,rimRho(a)));return cp(lerp(g.rho,sm,v),a,y1);},
   nu,Math.max(1,Math.round(g.tw/14)),{uS:g.len/18,vS:g.tw/18}));
  // the cyan strip under the lip (dark in the ruin)
  CYANS.push(gridSurface((u,v)=>cp(g.rho-.05,lerp(g.a0,g.a1,u),y1-1.6+.7*v),nu,1,{}));}
 // the basin: the level plaza at the lowest point, out to the first riser and the rim's parapet
 PAVE.push(gridSurface((u,v)=>{const a=u*TAU,s=Math.min(P.basin.rho,rimRho(a))*v;return cp(s,a,F.ymin);},96,14,{uS:P.basin.rho/6,vS:P.basin.rho/12}));
 // the rim: a parapet wall inside, from the true surface down to the step it closes, and the band over to the shell
 const breachRim=b=>{if(!RU)return false;const phi=b*180/Math.PI,y=F.height(R*Math.sin(b),R*Math.cos(b));
  return inWind(phi)&&PARABOLA.angDist(phi,RU.wind)<D.RUIN.quarter/2-3&&(y-F.ymin)/H>Math.round(D.RUIN.breach*P.K)+1;};
 const portal=p=>Math.abs(p[0]-F.low[0])<(P.hall.x1-P.hall.x0)/2+2&&p[1]<P.hall.y1+3&&p[2]<P.hall.z0+60;
 FRAME.push(gridSurface((u,v)=>{const b=u*TAU,t=F.surf(R*Math.sin(b),R*Math.cos(b)),yb=F.ymin+Math.floor((t[1]-F.ymin)/H)*H;return[t[0],lerp(yb,t[1],v),t[2]];},
  720,1,{uS:R*TAU/12,vS:2,hole:(u,v)=>breachRim(u*TAU)}));
 FRAME.push(gridSurface((u,v)=>{const b=u*TAU,a=F.surf(R*Math.sin(b),R*Math.cos(b)),o=F.outer(R*Math.sin(b),R*Math.cos(b));return[lerp(a[0],o[0],v),lerp(a[1],o[1],v),lerp(a[2],o[2],v)];},
  720,3,{uS:R*TAU/12,vS:5,hole:(u,v)=>{const b=u*TAU,a=F.surf(R*Math.sin(b),R*Math.cos(b)),o=F.outer(R*Math.sin(b),R*Math.cos(b));
   return breachRim(b)||portal([lerp(a[0],o[0],v),lerp(a[1],o[1],v),lerp(a[2],o[2],v)]);}}));

 // ---- the mirrors: tangent panels on the lips (and on posts over the steep treads); in the ruin most have fallen ----
 const fallenAt=new Map(RU?RU.fallen.map(f=>[f.id,f]):[]),MW=D.MIR.w,MH=D.MIR.h;
 for(const m of P.mirrors){if(gone.has('pb.t.'+m.k+'.'+m.s))continue;const f=fallenAt.get(m.id);
  if(f){const s=.45+.4*h(402,m.k,m.s,m.r*4096+m.i);kput('pbMirror',f.at,qEuler(Math.PI/2+f.tilt,f.ry,f.tilt*.4),[MW*s,MH*s,.18],new THREE.Color(0x8a9298));continue;}
  const t=nrm([m.n[2],0,-m.n[0]]),c=dd?new THREE.Color(0xa8b0b4).multiplyScalar(.8+.2*h(403,m.k,m.s,m.i)):new THREE.Color(0xe6eef2);
  kput('pbMirror',m.at,qBasis(t,m.n),[MW,MH,.22],c);
  if(m.post>1)kput('pbCyl',[m.at[0],m.at[1]-m.post/2,m.at[2]],null,[.22,m.post,.22],new THREE.Color(dd?0x6a665e:0xbdb6a8));}

 // ---- the outer face: the white seamed shell on its ribs, the boss under the vertex --------------------------------
 const NB=D.RIBS,dR=(R-D.RIB0)/D.RINGS;
 SHELL.push(gridSurface((u,v)=>{const ph=u*TAU,r=lerp(D.RIB0,R,v);return F.outer(r*Math.sin(ph),r*Math.cos(ph));},NB*8,D.RINGS*4,
  {uS:R*TAU/14,vS:(R-D.RIB0)/14,hole:(u,v)=>{const j=Math.min(NB-1,Math.floor(u*NB)),i=Math.min(D.RINGS-1,Math.floor(v*D.RINGS));return shellGone.has('pb.sh.'+j+'.'+i);}}));
 FRAME.push(gridSurface((u,v)=>{const ph=u*TAU,r=D.RIB0*v,b=1-v*v;return F.outer(r*Math.sin(ph),r*Math.cos(ph),D.SHELL+16*b);},48,8,{uS:20,vS:4}));
 // where the windward shell is down and the terraces still stand, the dark fabric behind them shows, broken
 if(RU)FRAB.push(gridSurface((u,v)=>{const ph=(RU.wind-D.RUIN.quarter/2+u*D.RUIN.quarter)*Math.PI/180,r=lerp(D.RIB0+dR,R,v);return F.outer(r*Math.sin(ph),r*Math.cos(ph),D.SHELL*.45);},
  48,40,{uS:40,vS:40,hole:(u,v)=>{const ph=(RU.wind-D.RUIN.quarter/2+u*D.RUIN.quarter)*Math.PI/180,r=lerp(D.RIB0+dR,R,v),uu=r*Math.sin(ph),vv=r*Math.cos(ph);
   const j=Math.floor(((ph*180/Math.PI+360)%360)/(360/NB)),i=Math.floor((r-D.RIB0)/dR),s=segAt(uu,vv);
   return !shellGone.has('pb.sh.'+j+'.'+Math.min(D.RINGS-1,i))||(s&&gone.has(s))||h(404,Math.floor(u*48),Math.floor(v*40))<.12;}}));
 // the ribs: swelling where a pier carries them, bulging in a slow wave along their length (Gaudi), tapering to the rim
 for(const rb of P.ribs){const ph=rb.phi*Math.PI/180,sn=Math.sin(ph),cs=Math.cos(ph),pr=rb.pier?P.piers.find(p=>p.id===rb.pier).r:-1e9;
  const r1=ribBreak.has(rb.id)?ribBreak.get(rb.id):rb.r1;
  const at=(r,th)=>{const n=F.normal(r*sn,r*cs),p=F.outer(r*sn,r*cs),m=nrm(sub(F.outer((r+1)*sn,(r+1)*cs),F.outer((r-1)*sn,(r-1)*cs))),b=nrm(crs(n,m));
   const sw=1+.7*Math.exp(-Math.pow((r-pr)/70,2))+.14*Math.sin(r/41+rb.j*1.7),tp=r>R-60?.55+.45*(R-r)/60:1,w=rb.w*sw*tp/2,dp=rb.d*sw*tp;
   return[p[0]-n[0]*dp*Math.sin(th)+b[0]*w*Math.cos(th),p[1]-n[1]*dp*Math.sin(th)+b[1]*w*Math.cos(th),p[2]-n[2]*dp*Math.sin(th)+b[2]*w*Math.cos(th)];};
  RIBS.push(gridSurface((u,v)=>at(lerp(rb.r0*.7,r1,u),v*Math.PI),Math.max(8,Math.round((r1-rb.r0)/14)),6,{uS:(r1-rb.r0)/14,vS:1}));
  // the bronze band where the rib lands on its pier
  if(rb.pier)BRONZE.push(gridSurface((u,v)=>{const p=at(pr-14+28*u,v*TAU);const n=F.normal(pr*sn,pr*cs),q=F.outer(pr*sn,pr*cs);
   const k=1.12;return[q[0]+(p[0]-q[0])*k,q[1]+(p[1]-q[1])*k,q[2]+(p[2]-q[2])*k];},4,16,{}));
  if(ribBreak.has(rb.id)){const e=at(r1,Math.PI/2);for(let j=0;j<8;j++)kput('rubble',[e[0]+(h(405,rb.j,j)-.5)*14,e[1]+(h(406,rb.j,j)-.5)*10,e[2]+(h(407,rb.j,j)-.5)*14],
   qEuler(h(408,rb.j,j)*3,h(409,rb.j,j)*3,0),[3+h(410,rb.j,j)*5,2+h(411,rb.j,j)*3,3+h(412,rb.j,j)*4],new THREE.Color(0xd8d2c4));}}

 // ---- the piers: Cyclopean courses of great polygonal stones, each course turned and set in a little, a flared head ----
 for(const p of P.piers){const nC=Math.max(6,Math.round(p.h/18)),hc=(p.h-30)/nC,x=p.at[0],z=p.at[2],y0=p.at[1];
  for(let c=0;c<nC;c++){const ya=y0+c*hc,yb=ya+hc,ra=lerp(p.w0,p.w1,c/nC)/2*(.97+.05*h(420,p.i,c)),rbb=lerp(p.w0,p.w1,(c+1)/nC)/2*(.95+.04*h(421,p.i,c)),rot=h(422,p.i,c)*.35;
   PIER.push(gridSurface((u,v)=>{const a=rot+u*TAU,k=Math.cos(Math.PI/8)/Math.cos(((a-rot)%(TAU/8))-Math.PI/8),r=lerp(ra,rbb,v)*k;return[x+r*Math.cos(a),lerp(ya,yb,v),z+r*Math.sin(a)];},
    16,1,{uS:p.w0*TAU/2/16,vS:hc/16}));}
  // the head: four arms branching up to the rib, the bronze collar at their root
  const yh=y0+nC*hc,ph=p.phi*Math.PI/180;
  for(const [dr,db] of [[-46,0],[46,0],[0,-26],[0,26]]){const r=p.r+dr,o=F.outer(r*Math.sin(ph)+db*Math.cos(ph),r*Math.cos(ph)-db*Math.sin(ph),D.SHELL+D.RIBD);
   beam('acBox',[x,yh-4,z],o,p.w1*.32,p.w1*.32,new THREE.Color(dd?0x8e8676:0xece6d8));}
  kput('pbBronzeCyl',[x,yh-2,z],null,[p.w1/2+1.2,7,p.w1/2+1.2],dd?new THREE.Color(0x6f7c62):null);
  kput('pbBronzeCyl',[x,y0+8,z],null,[p.w0/2+1,5,p.w0/2+1],dd?new THREE.Color(0x6f7c62):null);
  if(dd)for(let j=0;j<10;j++){const a=h(423,p.i,j)*TAU,r=p.w0/2+.4;kput('stain',[x+Math.cos(a)*r,y0+20+h(424,p.i,j)*p.h*.6,z+Math.sin(a)*r],qFacing([Math.cos(a),0,Math.sin(a)]),[8+h(425,p.i,j)*10,40,1],null);}}

 // ---- the mast and the receiver ------------------------------------------------------------------------------------
 const RX=P.receiver,rxR=RX.r,seat=[RX.at[0],RX.at[1]-rxR,RX.at[2]];
 let MX=null;if(RU){const L=RU.receiver,ax=new THREE.Vector3(-L.dir[2],0,L.dir[0]).normalize();
  MX=new THREE.Matrix4().makeTranslation(seat[0],seat[1]-L.drop,seat[2]).multiply(new THREE.Matrix4().makeRotationAxis(ax,L.lean*Math.PI/180)).multiply(new THREE.Matrix4().makeTranslation(-seat[0],-seat[1],-seat[2]));}
 const mx=p=>{if(!MX)return p;const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(MX);return[v.x,v.y,v.z];};
 for(const l of P.legs){const dir=nrm(sub(l.head,l.foot)),L=l.len,col=new THREE.Color(dd?0x8a8476:0xe8e2d4);
  kput('pbCyl',[(l.foot[0]+l.head[0])/2,(l.foot[1]+l.head[1])/2,(l.foot[2]+l.head[2])/2],qUp(dir),[l.r,L,l.r],col);
  kput('pbCyl',[l.foot[0],l.foot[1]+6,l.foot[2]],null,[l.r*2.2,12,l.r*2.2],col);
  // the stair: a landing every 24 m, turning round the leg (gone in the ruin but for its lowest flights)
  const side=nrm(crs(dir,[0,1,0])),side2=crs(dir,side);
  for(let j=1;j*24<L-10;j++){if(dd&&j>2)break;const t=j*24/L,a=j*Math.PI/2,o=[side[0]*Math.cos(a)+side2[0]*Math.sin(a),side[1]*Math.cos(a)+side2[1]*Math.sin(a),side[2]*Math.cos(a)+side2[2]*Math.sin(a)];
   const c=[lerp(l.foot[0],l.head[0],t)+o[0]*(l.r+2.4),lerp(l.foot[1],l.head[1],t)+o[1]*(l.r+2.4),lerp(l.foot[2],l.head[2],t)+o[2]*(l.r+2.4)];
   kput('acBox',c,null,[4.4,.5,4.4],new THREE.Color(dd?0x6e675a:0xc8c0b0));}}
 // the ties between the legs
 for(const t of [.42,.72])for(let i=0;i<3;i++){const a=P.legs[i],b=P.legs[(i+1)%3],pa=a.foot.map((v,k)=>lerp(v,a.head[k],t)),pb=b.foot.map((v,k)=>lerp(v,b.head[k],t));
  if(dd&&t>.5&&i===0)continue;beam('acBox',pa,pb,2.4,2.4,new THREE.Color(dd?0x7e7868:0xe0d9ca));}
 // the sphere: blue glass in a bronze frame; in the ruin a third of its panes gone, a gash, and the whole leaning in its seat
 {const nu=32,nv=16,sp=(u,v)=>{const a=u*TAU,b=v*Math.PI;return mx([RX.at[0]+rxR*Math.sin(b)*Math.cos(a),RX.at[1]-rxR*Math.cos(b),RX.at[2]+rxR*Math.sin(b)*Math.sin(a)]);};
  const lost=(u,v)=>{if(!RU)return false;const i=Math.floor(u*nu),j=Math.floor(v*nv),ca=RU.receiver.crack.at;
   return h(430,i,j)<RU.receiver.panes||(Math.abs(u-ca)<.05&&v>.3&&v<.85);};
  GLASS.push(gridSurface(sp,nu,nv,{uS:8,vS:4,hole:lost}));
  const BZ=dd?new THREE.Color(0x6f7c62):new THREE.Color(0xb07a40);
  for(let i=0;i<nu;i+=2)for(let j=0;j<nv;j++){if(RU&&Math.abs(i/nu-RU.receiver.crack.at)<.04&&j>5&&j<13)continue;beam('acBox',sp(i/nu,j/nv),sp(i/nu,(j+1)/nv),.9,.9,BZ);}
  for(let j=2;j<nv;j+=2)for(let i=0;i<nu;i++)beam('acBox',sp(i/nu,j/nv),sp((i+1)/nu,j/nv),.8,.8,BZ);
  // the seat: a bronze cradle where the legs meet the sphere
  const sc=mx([RX.at[0],RX.at[1]-rxR*.72,RX.at[2]]);kput('pbBronzeCyl',sc,MX?new THREE.Quaternion().setFromRotationMatrix(MX):null,[rxR*.72,6,rxR*.72],dd?BZ:null);
  if(!dd)kput('finial',[RX.at[0],RX.at[1]+rxR+6,RX.at[2]],null,[3,6,3],null);}

 // ---- the terminus hall, its portal and the viaduct -----------------------------------------------------------------
 {const Hl=P.hall,cx=(Hl.x0+Hl.x1)/2,hw=(Hl.x1-Hl.x0)/2,ys=Hl.y0+16;
  PAVE.push(gridSurface((u,v)=>[lerp(Hl.x0,Hl.x1,u),Hl.y0+.05,lerp(Hl.z0,Hl.z1,v)],4,16,{uS:hw/6,vS:(Hl.z1-Hl.z0)/12}));
  for(const sx of [-1,1])SHADE.push(gridSurface((u,v)=>[cx+sx*hw,lerp(Hl.y0,ys,v),lerp(Hl.z0,Hl.z1,u)],16,1,{uS:20,vS:2}));
  SHADE.push(gridSurface((u,v)=>{const a=lerp(-1,1,u)*1.05,rr=hw/Math.sin(1.05),cy=ys-rr*Math.cos(1.05);return[cx+rr*Math.sin(a),cy+rr*Math.cos(a),lerp(Hl.z0,Hl.z1,v)];},16,16,{uS:12,vS:24}));
  SHADE.push(gridSurface((u,v)=>[lerp(Hl.x0,Hl.x1,u),lerp(Hl.y0,Hl.y1+5,v),Hl.z1],4,2,{uS:6,vS:3}));
  for(const pl of Hl.platforms)kput('acBox',[pl.x,Hl.y0+.6,(pl.z0+pl.z1)/2],null,[pl.w,1.2,pl.z1-pl.z0],new THREE.Color(dd?0x6a6355:0xcfc6b2));
  for(let z=Hl.z0+30;z<Hl.z1-10;z+=40){for(const sx of [-1,1])kput('acPane',[cx+sx*(hw-.3),Hl.y0+9,z],qFacing([-sx,0,0]),[16,4,1],new THREE.Color(0xffc488).multiplyScalar(dd?.04:.5));}
  // the portal through the north lip: jambs, a lintel, the bronze band over it
  for(const sx of [-1,1])kput('acBox',[cx+sx*(hw+3),(Hl.y0+Hl.y1)/2+4,Hl.z0+2],null,[6,Hl.y1-Hl.y0+8,8],new THREE.Color(dd?0x8e8676:0xf0eade));
  kput('acBox',[cx,Hl.y1+5,Hl.z0+2],null,[2*hw+12,6,8],new THREE.Color(dd?0x8e8676:0xf0eade));
  kput('acBox',[cx,Hl.y1+1.6,Hl.z0-2.2],null,[2*hw+6,1.4,.6],dd?new THREE.Color(0x5f7258):new THREE.Color(0xb07a40));
  // the viaduct: deck, parapets, two tracks and the road, piers every span
  const V=P.viaduct,Lv=V.z1-V.z0;
  kput('acBox',[V.x,V.y-1.6,(V.z0+V.z1)/2],null,[V.w,3.2,Lv],new THREE.Color(dd?0x7a7264:0xd8d0be));
  for(const sx of [-1,1])kput('acBox',[V.x+sx*(V.w/2-.4),V.y+.7,(V.z0+V.z1)/2],null,[.8,1.4,Lv],new THREE.Color(dd?0x6e675a:0xe8e1d2));
  for(const tx of [-11,-5])for(const rx of [-.75,.75])kput('acBox',[V.x+tx+rx,V.y+.12,(V.z0+V.z1)/2],null,[.15,.24,Lv],new THREE.Color(0x4a4640));
  kput('acBox',[V.x+8,V.y+.05,(V.z0+V.z1)/2],null,[14,.1,Lv],new THREE.Color(dd?0x3e3a34:0x2e2c2a));
  for(const s of V.spans){kput('acBox',[s.pier[0],V.y/2-1.6,s.pier[2]],null,[10,V.y-3.2,7],new THREE.Color(dd?0x7a7264:0xcfc6b2));
   if(!dd)kput('strip',[V.x+V.w/2,V.y+1.5,(s.z0+s.z1)/2],qEuler(0,Math.PI/2,0),[s.z1-s.z0-4,3,3],CYAN);}}

 // ---- as built: the crops on the treads, people on the basin -------------------------------------------------------
 const CROP=[0xc9a94a,0xb59a3c,0x6f8f34,0x587a2c,0x8aa043,0x7b5a34,0x9c8a52,0x4f7a3e];
 for(const g of DR){if(g.kind==='figure'){kput('figB',g.at,qEuler(0,g.ry,0),1,new THREE.Color().setHSL(h(440,Math.round(g.at[0]),0)*.1,.35,.4));kput('figH',g.at,null,1,new THREE.Color(0xc9a17e));continue;}
  const n=4;for(let i=0;i<n;i++){const a0=lerp(g.a0,g.a1,(i+.06)/n),a1=lerp(g.a0,g.a1,(i+.94)/n);if(g.rr>rimRho(a0)-2||g.rr>rimRho(a1)-2)continue;
   const A=cp(g.rr,a0,g.y),B=cp(g.rr,a1,g.y),L=Math.hypot(B[0]-A[0],B[2]-A[2]);
   kput('acBox',[(A[0]+B[0])/2,g.y+.3,(A[2]+B[2])/2],qEuler(0,-Math.atan2(B[2]-A[2],B[0]-A[0]),0),[L,.55,g.wid],new THREE.Color(CROP[g.crop]).multiplyScalar(.85+.25*h(441,g.k,g.s,i)));}}

 // ---- the ruin's pieces ---------------------------------------------------------------------------------------------
 if(RU){
  // the orchard: wild trees on the standing treads
  for(const t of RU.orchard){const u=h(450,Math.round(t.at[0]),Math.round(t.at[2]));
   kput('trunk',t.at,qEuler(0,u*6.28,0),[t.h*.15,t.h*.62,t.h*.15],new THREE.Color().setHSL(.07,.3,.2));
   const s0=t.h*(.42+.12*u);kput('leafCard',[t.at[0],t.at[1]+t.h*.62,t.at[2]],qEuler(0,u*6.28,0),[s0,s0*(.8+.3*u),s0],new THREE.Color().setHSL(.2+.1*u,.32+.15*u,.17+.09*u));}
  // vines and stains down the fronts
  for(const g of P.segs){if(gone.has(g.id)||g.use!=='farm')continue;for(let j=0;j<2;j++){const a=lerp(g.a0,g.a1,h(451,g.k,g.s,j)),p=cp(g.rho-.4,a,g.y1-.5);
   kput('vine',p,qEuler(0,h(452,g.k,g.s,j)*6,0),[1.4,4+h(453,g.k,g.s,j)*14,1.4],null);
   if(h(454,g.k,g.s,j)<.5)kput('stain',[p[0],g.y1-8,p[2]],qFacing(nrm([F.low[0]-p[0],0,F.low[2]-p[2]])),[4+h(455,g.k,g.s,j)*6,14,1],null);}}
  // the slump: rubble on the highest standing treads under the breach
  for(const id of RU.gone){const g=P.segs.find(q=>q.id===id),T=P.terraces[g.k-2];if(!T)continue;const below=T.segs.find(sid=>{const q=P.segs.find(x=>x.id===sid);return !gone.has(sid)&&Math.abs(((q.a0+q.a1)/2)-((g.a0+g.a1)/2))<.2;});
   if(!below)continue;const q=P.segs.find(x=>x.id===below);for(let j=0;j<3;j++){const p=cp(lerp(q.rho,q.rhoN,.3+.5*h(456,g.k,g.s,j)),lerp(q.a0,q.a1,h(457,g.k,g.s,j)),q.y1);
    kput('rubble',[p[0],p[1]+1,p[2]],qEuler(h(458,g.k,g.s,j)*3,h(459,g.k,g.s,j)*3,0),[4+6*h(460,g.k,g.s,j),2+3*h(461,g.k,g.s,j),3+5*h(462,g.k,g.s,j)],new THREE.Color(0xb0a898));}}
  // the fan below the breach: shell plates, slabs, glass
  for(const f of RU.fan){const q=qEuler((h(463,f.id.length,Math.round(f.s*10))-.5)*.5,f.ry,(h(464,Math.round(f.at[0]),0)-.5)*.5);
   if(f.kind==='shell')kput('acBox',[f.at[0],f.at[1]+.6,f.at[2]],q,[f.s,1.1,f.s*.62],new THREE.Color(0xd6d0c2));
   else if(f.kind==='slab')kput('rubble',[f.at[0],f.at[1]+f.s*.15,f.at[2]],q,[f.s,f.s*.38,f.s*.7],new THREE.Color(0x9a9282));
   else kput('pbMirror',[f.at[0],f.at[1]+.2,f.at[2]],qEuler(Math.PI/2,f.ry,0),[f.s*.3,f.s*.2,.15],new THREE.Color(0x8a9298));}
  // the sand: drifts on the low decks, in the hall's mouth and on the viaduct
  for(const s of RU.sand){const yaw=s.on===P.hall.id||s.on===P.viaduct.id?Math.PI/2:-(s.a+Math.PI/2);
   kput('pbDune',[s.at[0],s.at[1],s.at[2]],qEuler(0,yaw,0),[s.len/2,s.h,s.w/2],new THREE.Color(0xd2b083).multiplyScalar(.9+.15*h(470,Math.round(s.at[0]),Math.round(s.at[2]))));}
  // proposed: the Izani customs post at the portal and the caravanserai in the hall
  {const Pz=RU.post,y=P.hall.y0,cloth=[0xa83a2a,0xd8a040,0x2a5a8a,0xe8dcc0];
   kput('acBox',[Pz.gate.at[0],y+1.1,Pz.gate.at[2]],null,[Pz.gate.w,.35,.35],new THREE.Color(0xb8382a));
   for(const sx of [-1,1])kput('acBox',[Pz.gate.at[0]+sx*Pz.gate.w/2,y+.8,Pz.gate.at[2]],null,[.5,1.6,.5],new THREE.Color(0x6a5034));
   const hs=Pz.house.size;kput('acBox',[Pz.house.at[0],y+hs[1]/2,Pz.house.at[2]],null,hs,new THREE.Color(0xc89a62));
   kput('acBox',[Pz.house.at[0],y+hs[1]+.3,Pz.house.at[2]],null,[hs[0]+1.6,.6,hs[2]+1.6],new THREE.Color(0x7a5a3a));
   kput('acBox',[Pz.house.at[0],y+hs[1]+3.5,Pz.house.at[2]],null,[.3,6,.3],new THREE.Color(0x5a4630));
   kput('acBox',[Pz.house.at[0]+1.6,y+hs[1]+5.6,Pz.house.at[2]],null,[3,1.8,.08],new THREE.Color(0xe06a1a));
   Pz.serai.stalls.forEach((s,i)=>{const c=new THREE.Color(cloth[i%4]);kput('acBox',[s.at[0],y+3.4,s.at[2]],qEuler(0,s.ry,.12),[8,.15,6],c);
    for(const o of [[-3.6,-2.6],[3.6,-2.6],[-3.6,2.6],[3.6,2.6]])kput('acBox',[s.at[0]+o[1],y+1.7,s.at[2]+o[0]],null,[.18,3.4,.18],new THREE.Color(0x5a4630));
    kput('acBox',[s.at[0],y+.5,s.at[2]],null,[3,1,2],new THREE.Color(0x8a6a44));});
   for(const b of Pz.serai.beasts){kput('figB',b.at,qEuler(Math.PI/2,b.ry,0),[2.2,1.6,2.2],new THREE.Color(0x7a5a3a));}
   for(let i=0;i<18;i++){const x=(Pz.serai.rect[0]+Pz.serai.rect[1])/2+(h(471,i,0)-.5)*40,z=lerp(Pz.serai.rect[2],Pz.serai.rect[3],h(471,i,1));
    kput('figB',[x,y,z],qEuler(0,h(471,i,2)*6.28,0),1,new THREE.Color().setHSL(.05+.08*h(471,i,3),.4,.35));kput('figH',[x,y,z],null,1,new THREE.Color(0xa87a56));}}
  rubbleRing(0,.4,0,R*.7,R*1.25,160,10);
  trees(0,0,R+80,R+700,90);}
 else trees(0,0,R+120,R+700,60);

 // ---- merge -----------------------------------------------------------------------------------------------------------
 meshMerged(RISE,dd?MAT.acResR:MAT.acRes,G);
 meshMerged(TREAD,dd?MAT.whGrassR:MAT.whGrass,G);
 meshMerged(DECK,dd?MAT.acDeckR:MAT.acDeck,G);
 meshMerged(CYANS,dd?MAT.acShadeR:MAT.pbCyan,G);
 meshMerged(SHELL,dd?MAT.whiteWorn:MAT.white,G);
 meshMerged(RIBS,dd?MAT.acFrameR:MAT.acFrame,G);
 meshMerged(FRAME,dd?MAT.acFrameR:MAT.acFrame,G);
 meshMerged(BRONZE,dd?MAT.pbBronzeR:MAT.pbBronze,G);
 meshMerged(PIER,dd?MAT.whStoneR:MAT.whStone,G);
 meshMerged(FRAB,MAT.acBreak,G);
 meshMerged(PAVE,dd?MAT.acPaveR:MAT.acPave,G);
 meshMerged(SHADE,dd?MAT.acShadeR:MAT.acShade,G);
 meshMerged(GLASS,dd?MAT.pbGlassR:MAT.pbGlass,G);
 PB_SITE[d]={x:gx,z:gz,d,low:F.low,ymin:F.ymin,R,focus:F.focus,receiver:{at:mx(RX.at),r:rxR},stats:P.stats,
  hall:{x0:P.hall.x0,x1:P.hall.x1,z0:P.hall.z0,z1:P.hall.z1,y0:P.hall.y0,y1:P.hall.y1},viaduct:{x:P.viaduct.x,y:P.viaduct.y,z0:P.viaduct.z0},
  piers:P.piers.map(p=>({id:p.id,at:p.at,h:p.h,w0:p.w0})),legs:P.legs.map(l=>({id:l.id,foot:l.foot})),basin:{y:P.basin.y,rho:P.basin.rho},
  back:F.surf(0,-R),wind:RU?RU.wind:null,lake:RU?RU.lake:null,gone:RU?RU.gone.length:0,
  // the treads for the open world's flora pass: the ruin's farmed treads that stand are the Bowl rim's orchard ground
  treads:P.segs.filter(g=>!gone.has(g.id)).map(g=>({id:g.id,k:g.k,a0:g.a0,a1:g.a1,rho:g.rho,rhoN:g.rhoN,y:g.y1,use:g.use,orchard:!!dd&&g.use==='farm'})),
  tags:KTAGS.parabola?KTAGS.parabola.audit():null};
 KOFF=[0,0,0];return G;}
