// ================================================================= THE PILE — the drawing (records in, geometry out)
// buildArcpile draws the plan (8at0) as the Ancients built it (d = 0) and as the Rift has left it (d = 1: the plan with
// ARCPILE.ruin's deltas). Everything placed is registered in core/tags first (the pile a building; its blocks, cores and
// stairs parts; the gardens' trees flora, its people life), then drawn from the record. Nothing here decides where a
// thing goes: what is not in a record (a balcony, a band of the skin) is hashed from its block's id with KRAND.
//
// The blocks are quads in one merged buffer per material (gridSurface, world-scale UVs: the dwelling map's storey lines
// stay level and on the 25.6/7 m storey); the cores are instanced cylinders; the small things are kit instances.
const AP_SITE={};
kdef('apCore',new THREE.CylinderGeometry(1,1,1,24),MAT.acKit);
// the capstone's glass: a dark, glossy box; instanceColor carries the tint (night lamps are panes in front of it)
MAT.apGlass=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.18,metalness:.6,side:DS});
kdef('apGlass',new THREE.BoxGeometry(1,1,1),MAT.apGlass);
// a polytunnel: a half cylinder along local x, scaled [length, height, half-width]
MAT.apTunnel=new THREE.MeshStandardMaterial({color:0xe8ecea,roughness:.5,metalness:0,transparent:true,opacity:.62,side:DS});
kdef('apTunnel',new THREE.CylinderGeometry(1,1,1,10,1,true,0,Math.PI).rotateZ(Math.PI/2),MAT.apTunnel);
// the same glass as one merged wall (the capstone's bands, which the atria notch): its colour on the material
MAT.apGlassI=new THREE.MeshStandardMaterial({color:0x2a3a46,roughness:.18,metalness:.6,side:DS});
MAT.apGlassR=new THREE.MeshStandardMaterial({color:0x1a1d22,roughness:.4,metalness:.4,side:DS});
// the crown in the ruin is lived in: the weathered wall with its lit cells, a few lamps behind the glass
MAT.apCrownR=new THREE.MeshStandardMaterial({map:TEX.acResR,roughnessMap:TEX.concreteRM,color:0xb0a690,emissive:0xffffff,emissiveMap:TEX.acResE,emissiveIntensity:.22,roughness:1,metalness:0,side:DS});

function buildArcpile(scene,gx,gz,d){reseed(9690+d);KOFF=[gx,0,gz];
 const dd=d>0?1:0,P=ARCPILE.plan({seed:9690}),RU=dd?ARCPILE.ruin(P):null,GN=ARCPILE.dress(P,RU);
 const D=P.dim,TS=P.ts,STO=D.STO,YN=D.NECK*TS,DH=D.DEP/2,U=(a,b,c)=>ARCPILE.u(9690,a,b,c);
 const gone=new Set(RU?RU.gone:[]),coreCut=new Map(RU?RU.cores.map(c=>[c.id,c]):[]),stairCut=new Map(RU?RU.stairs.map(s=>[s.id,s]):[]);
 const crashed=new Map(RU?RU.crashed.map(c=>[c.id,c]):[]),cutEnd=new Map(RU?RU.cut.map(c=>[c.id,c.b]):[]);
 const piercedOf=id=>RU?RU.pierced.filter(x=>x.id===id):[];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // the Podium's fix (8aq3): a far plane past the fog, and the sky dome drawn first with its pow() kept off a negative,
 // or the band over the horizon comes out black
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');skyMat.needsUpdate=true;}

 // ---- core/tags: one record per placed thing, before anything is drawn -------------------------------------------
 {const T=KTAGS.arcpile||(KTAGS.arcpile=KTAGS.create({build:'ancients-arcpile'}));
  const pre=(dd?'ruin':'intact')+'/',W=a=>[a[0]+gx,a[1],a[2]+gz],st=dd?'ruined':'live-work';
  const B=T.add({id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:arcpile',name:'The Pile',at:[gx,0,gz],
   r:ARCPILE.half(0)*Math.SQRT2,h:P.stats.height,tags:{culture:'ancient',types:['dwelling-multi','civic'],state:dd?'ruined':'intact',landmark:true}});
  const part=(id,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:id,at:W(at),tags:{style:st}},o||{}));
  for(const b of P.blocks){if(gone.has(b.id))continue;const r=ARCPILE.ruinRect(b,RU);
   part(b.id,'block',[(r[0]+r[1])/2,b.y0,(r[2]+r[3])/2],{size:[r[1]-r[0],TS,r[3]-r[2]],tags:{style:st,level:b.k,role:b.crown?'crown':'base'}});}
  for(const c of P.cores)part(c.id,'core',[c.x,c.y0,c.z],{r:c.r,h:c.y1-c.y0,tags:{style:st,role:c.sys}});
  {const C=P.cap;part(C.id,'capstone',[0,C.y0,0],{size:[2*C.terraces[0].h,C.top-C.y0,2*C.terraces[0].h],tags:{style:st,role:'crown'}});}
  for(const s of P.stairs)part(s.id,'stair',[(s.x0+s.x1)/2,s.y1/2,0],{size:[Math.abs(s.x1-s.x0),s.y1,s.w]});
  for(const g of GN){if(g.kind==='tree')T.child(B.id,{'class':'flora',kind:'tree',key:g.id,at:W(g.at),h:g.h});
   else if(g.kind==='bed')T.child(B.id,{'class':'flora',kind:'crop',key:g.id,at:W(g.at)});
   else if(g.kind==='plot')T.child(B.id,{'class':g.sub==='shed'?'building':g.sub==='tank'?'fixture':'flora',kind:g.sub==='shed'?'shed':g.sub==='tank'?'tank':'crop',key:g.id,at:W(g.at),tags:{variant:g.sub}});
   else if(g.kind==='figure')T.child(B.id,{'class':'life',kind:'person',key:g.id,at:W(g.at),ry:g.ry});}
  if(RU)for(const br of RU.bridges)T.child(B.id,{'class':'infrastructure',kind:'bridge',key:br.id,at:W(br.from),tags:{variant:'rope'}});}

 REGISTER({name:'The Pile ('+STATE(d)+')',x:0,z:0,r:ARCPILE.half(0)*1.3,h:P.stats.height+20});
 REGISTER({name:'The Pile — the base (tiers 1-6)',x:0,z:0,r:ARCPILE.half(0)*1.3,y:0,h:YN});
 REGISTER({name:'The Pile — the crown (tiers 7-12)',x:0,z:0,r:ARCPILE.half(D.NECK)*1.3,y:YN,h:P.stats.height-YN});
 REGISTER({name:'The Pile — the capstone',x:0,z:0,r:P.cap.terraces[0].h*1.42,y:P.cap.y0,h:P.cap.top-P.cap.y0+36});
 for(const c of P.cores)if(c.sys==='great')REGISTER({name:'The Pile — great core '+(+c.id.split('.').pop()+1),x:c.x,z:c.z,r:c.r+4,y:0,h:c.y1});
 for(const s of P.stairs)REGISTER({name:'The Pile — the '+(s.sx>0?'east':'west')+' grand stair',x:(s.x0+s.x1)/2,z:0,r:Math.abs(s.x1-s.x0)/2,y:0,h:s.y1});

 // ---- materials and lists ----------------------------------------------------------------------------------------
 const WALL=[],WALLC=[],ROOF=[],ROOFC=[],SOFF=[],GRD=[],BRKG=[],MASG=[];
 const uvShift=(g,dv)=>{const a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+dv);return g;};
 const tone=(k,i)=>new THREE.Color().setHSL(.08+.03*U(9001,k,i),.06+.08*U(9002,k,i),dd?.30+.1*U(9003,k,i):.62+.16*U(9003,k,i));
 const winC=(p,k,i)=>U(9004,k,i)<p?new THREE.Color(0xffa957).multiplyScalar(.35+.4*U(9005,k,i)):new THREE.Color(0x080e16).multiplyScalar(.7+U(9006,k,i));

 // ---- the blocks -------------------------------------------------------------------------------------------------
 // four walls on the dwelling map, the roof a garden, the soffit painted shade (seen under a span or a cantilever)
 for(const b of P.blocks){if(gone.has(b.id))continue;
  const r=ARCPILE.ruinRect(b,RU),y0=b.y0,y1=b.y1,bi=P.blocks.indexOf(b),lit=!dd||b.crown;
  // THE RUIN: a block the corner tore off ends in a broken face; a crashed block is built in its own lists and turned
  // about its hinge; a block something crashed into has its roof holed over the impact
  const cr=crashed.get(b.id),torn=cutEnd.has(b.id),hits=piercedOf(b.id);
  const WL=cr?[]:(dd&&b.crown?WALLC:WALL),RF=cr?[]:(b.crown?ROOFC:ROOF),SF=cr?[]:SOFF,BK=cr?[]:BRKG;
  const side=(xa,za,xb,zb,list)=>{const L=Math.hypot(xb-xa,zb-za);
   (list||WL).push(uvShift(gridSurface((u,v)=>[lerp(xa,xb,u),lerp(y0,y1,v),lerp(za,zb,u)],Math.max(1,Math.round(L/25.6)),1,
    {uS:L/25.6,vS:TS/25.6}),y0/25.6));};
  side(r[0],r[2],r[1],r[2]);side(r[1],r[2],r[1],r[3],torn&&b.ax==='x'?BK:null);side(r[1],r[3],r[0],r[3],torn&&b.ax==='z'?BK:null);side(r[0],r[3],r[0],r[2]);
  const inHit=(x,z)=>hits.some(h=>x>h.rect[0]&&x<h.rect[1]&&z>h.rect[2]&&z<h.rect[3]);
  RF.push(gridSurface((u,v)=>[lerp(r[0],r[1],u),y1,lerp(r[2],r[3],v)],Math.max(2,Math.round((r[1]-r[0])/(hits.length?4:24))),Math.max(2,Math.round((r[3]-r[2])/(hits.length?4:24))),
   {uS:(r[1]-r[0])/18,vS:(r[3]-r[2])/18,hole:hits.length?(u,v)=>inHit(lerp(r[0],r[1],u),lerp(r[2],r[3],v)):null}));
  if(b.k>0)SF.push(gridSurface((u,v)=>[lerp(r[0],r[1],v),y0+.35,lerp(r[2],r[3],u)],2,2,{uS:(r[3]-r[2])/12,vS:(r[1]-r[0])/12}));
  if(cr){const al0=b.ax==='x',pv=al0?new THREE.Vector3(b.a,y0,b.c):new THREE.Vector3(b.c,y0,b.a);
   const q=new THREE.Quaternion().setFromAxisAngle(al0?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0),al0?-cr.angle:cr.angle);
   const M=new THREE.Matrix4().makeTranslation(pv.x,pv.y,pv.z).multiply(new THREE.Matrix4().makeRotationFromQuaternion(q)).multiply(new THREE.Matrix4().makeTranslation(-pv.x,-pv.y,-pv.z));
   for(const g of WL)WALL.push(g.applyMatrix4(M));for(const g of RF)ROOF.push(g.applyMatrix4(M));for(const g of SF)SOFF.push(g.applyMatrix4(M));
   // what came off it at the impact
   const ev=new THREE.Vector3(al0?b.b:b.c,y0,al0?b.c:b.b).applyMatrix4(M);
   rubbleRing(ev.x,ev.y,ev.z,4,DH+14,70,6);
   for(let j=0;j<16;j++)kput('rubble',[ev.x+(U(9600,bi,j)-.5)*40,ev.y+U(9601,bi,j)*8,ev.z+(U(9602,bi,j)-.5)*40],qEuler(U(9603,bi,j)*3,U(9604,bi,j)*3,0),[4+U(9605,bi,j)*8,1.2+U(9606,bi,j)*2,3+U(9607,bi,j)*6],new THREE.Color(0x8a8070));
   continue;}
  // the impact craters: the hole goes down through the floors, slabs hang into it, rubble on what is left
  for(const h of hits){const hr=h.rect,cx=(hr[0]+hr[1])/2,cz=(hr[2]+hr[3])/2,w=hr[1]-hr[0],dp=hr[3]-hr[2];
   kput('acDim',[cx,y1-h.depth/2,cz],null,[w-.4,h.depth,dp-.4],null);
   for(let s2=1;s2<D.ST;s2++){const yy=y1-s2*STO;if(y1-yy>h.depth)break;
    for(const sd of [-1,1])kput('acBox',[cx+sd*(w/2-2-U(9610,bi,s2+sd)*3),yy,cz],qEuler(0,0,sd*(.2+.3*U(9611,bi,s2))),[4+U(9612,bi,s2)*4,.6,dp*.8],new THREE.Color(0x9a9080));}
   rubbleRing(cx,y1-h.depth+1,cz,2,Math.min(w,dp)/2,40,5);}
  // a torn end: the floors stick out of the break
  if(torn){const ex=b.ax==='x'?r[1]:b.c,ez=b.ax==='x'?b.c:r[3],dx=b.ax==='x'?1:0,dz=b.ax==='x'?0:1;
   for(let s2=1;s2<D.ST;s2++)for(let j=0;j<3;j++){const L2=1+U(9620,bi,s2*3+j)*5,o=(j-1)*8+(U(9621,bi,s2*3+j)-.5)*4;
    kput('acBox',[ex+dx*L2/2+(dz?o:0),y0+s2*STO,ez+dz*L2/2+(dx?o:0)],null,dx?[L2,.6,6]:[6,.6,L2],new THREE.Color(0x9a9080));}}
  // the slab bands: every second storey a lip all round, and the parapet of the roof garden
  for(let s=2;s<=D.ST;s+=2){const y=y0+s*STO-.3,w=r[1]-r[0],dp=r[3]-r[2];
   if(dd&&!b.crown&&U(9010,bi,s)<.3)continue;
   kput('acBox',[(r[0]+r[1])/2,y,r[2]-.5],null,[w+1.2,.7,1.2],tone(bi,s));kput('acBox',[(r[0]+r[1])/2,y,r[3]+.5],null,[w+1.2,.7,1.2],tone(bi,s+1));
   kput('acBox',[r[0]-.5,y,(r[2]+r[3])/2],null,[1.2,.7,dp],tone(bi,s+2));kput('acBox',[r[1]+.5,y,(r[2]+r[3])/2],null,[1.2,.7,dp],tone(bi,s+3));}
  // balconies on the long sides: a 6.4 m frontage in three on every storey but the plinth
  const al=b.ax==='x',L=al?r[1]-r[0]:r[3]-r[2];
  for(let s=b.plinth?1:0;s<D.ST;s++)for(let f=0;f*6.4<L-4;f++){const h=U(9020+bi,s,f);if(h>(dd&&!b.crown?.12:.34))continue;
   const t=b.a+3.2+f*6.4,sd=h<.17?1:-1,y=y0+s*STO;
   const p=al?[t,y,b.c+sd*DH]:[b.c+sd*DH,y,t],dir=al?[0,0,sd]:[sd,0,0];
   kput('acBalc',p,qFacing(dir),[5.4,1.2,2.4],tone(bi,s*40+f));
   kput('acPane',[p[0]+dir[0]*.15,y+1.7,p[2]+dir[2]*.15],qFacing(dir),[4.2,2.2,1],lit?winC(dd?.06:.3,bi,s*40+f):winC(0,bi,0));}
  // the plinth storey of the crown's lowest tier: blind, with the tanks' vents
  if(b.plinth)for(let f=0;f*12<L-6;f++){const t=b.a+6+f*12;for(const sd of [-1,1]){
   const p=al?[t,y0+STO*.5,b.c+sd*(DH+.3)]:[b.c+sd*(DH+.3),y0+STO*.5,t];kput('acDim',p,qFacing(al?[0,0,sd]:[sd,0,0]),[7,1.4,.6],null);}}
  // the ruin: the base's walls weather and grow over
  if(dd&&!b.crown)for(let j=0;j<Math.round(L/14);j++){const t=b.a+U(9030,bi,j)*L,sd=U(9031,bi,j)<.5?1:-1;
   const p=al?[t,y1-1,b.c+sd*(DH+.4)]:[b.c+sd*(DH+.4),y1-1,t];
   kput('vine',p,qEuler(0,U(9032,bi,j)*6,0),[1.4,4+U(9033,bi,j)*20,1.4],null);
   if(U(9034,bi,j)<.4)kput('stain',[p[0],y1-8,p[2]],qFacing(al?[0,0,sd]:[sd,0,0]),[3+U(9035,bi,j)*5,14,1],null);}}

 // ---- the capstone -----------------------------------------------------------------------------------------------------
 // A terraced ziggurat on the tenth tier's roofs: every terrace a band of glass set back under a heavy fascia that slopes
 // up and in to a planted deck, and a glass pavilion on the summit under a flat roof and a mast. THE ATRIA (records,
 // 8at0) are cut through all of it: every surface is holed where an atrium passes, its walls are homes looking in, and
 // it is open at the bottom too, over the gap between the blocks below.
 {const C=P.cap,T=C.terraces,GB=7.4,GI=4,OV=1.6,CAPM=[],CAPS=[],CAPD=[],CAPG=[],CAPW=[];
  const inA=(x,z)=>ARCPILE.inAtrium(P,x,z,0);
  const ring=(list,ya,ha,yb,hb,tile)=>{const ca=[[-ha,-ha],[ha,-ha],[ha,ha],[-ha,ha]],cb=[[-hb,-hb],[hb,-hb],[hb,hb],[-hb,hb]];
   for(let s=0;s<4;s++){const a0=ca[s],a1=ca[(s+1)%4],b0=cb[s],b1=cb[(s+1)%4],L=2*Math.max(ha,hb),sl=Math.hypot(yb-ya,ha-hb);
    const at=(u,v)=>{const pa=[lerp(a0[0],a1[0],u),lerp(a0[1],a1[1],u)],pb=[lerp(b0[0],b1[0],u),lerp(b0[1],b1[1],u)];
     return[lerp(pa[0],pb[0],v),lerp(ya,yb,v),lerp(pa[1],pb[1],v)];};
    list.push(gridSurface(at,Math.max(4,Math.round(L/3)),Math.max(1,Math.round(Math.abs(ha-hb)/3)),
     {uS:L/tile,vS:Math.max(sl,1)/tile,hole:(u,v)=>{const p=at(u,v);return inA(p[0],p[2]);}}));}};
  // the underside, holed where the atria open down onto the gaps below
  CAPS.push(gridSurface((u,v)=>[lerp(-T[0].h+GI,T[0].h-GI,u),C.y0+.2,lerp(-T[0].h+GI,T[0].h-GI,v)],Math.round(T[0].h/1.5),Math.round(T[0].h/1.5),
   {uS:T[0].h/6,vS:T[0].h/6,hole:(u,v)=>inA(lerp(-T[0].h+GI,T[0].h-GI,u),lerp(-T[0].h+GI,T[0].h-GI,v))}));
  const gcol=new THREE.Color(dd?0x1a1d22:0x2a3a46);
  for(let i=0;i<T.length;i++){const t=T[i],h=t.h,hn=i+1<T.length?T[i+1].h-GI:C.pav.h,g=h-GI;
   // the glass, set back under the fascia (a wall, so an atrium can notch it), its mullions and its lamps
   ring(CAPG,t.y0,g,t.y0+GB,g,GB);
   for(let s=0;s<4;s++){const n=Math.round(2*g/6);for(let j=1;j<n;j++){const u=-g+j*2*g/n,o=g+.2;
     const p=[[u,-o],[o,u],[-u,o],[-o,-u]][s];if(inA(p[0],p[1]))continue;
     kput('acBox',[p[0],t.y0+GB/2,p[1]],null,s%2?[.5,GB,.4]:[.4,GB,.5],new THREE.Color(dd?0x5a5448:0xb8ae98));}
    if(!dd||i>=2)for(let j=0;j<Math.round(2*g/12);j++){const u=-g+6+j*12,o=g+.35,p=[[u,-o],[o,u],[-u,o],[-o,-u]][s];if(inA(p[0],p[1]))continue;
     kput('acPane',[p[0],t.y0+GB*.45,p[1]],qFacing([[0,0,-1],[1,0,0],[0,0,1],[-1,0,0]][s]),[11.4,GB*.5,1],new THREE.Color(0xffa957).multiplyScalar(dd?.18:.45));}}
   ring(CAPS,t.y0+GB,g,t.y0+GB,h+OV,12);                 // the soffit under the fascia
   ring(CAPM,t.y0+GB,h+OV,t.y1,h-5,8);                   // the fascia, sloping up and in
   ring(CAPD,t.y1,h-5,t.y1,hn,18);                       // the deck, planted
   // the atria's walls through this terrace: homes on the dwelling map, looking in, clipped to the terrace's glass line
   for(const a of C.atria){const r=a.rect,ic=ARCPILE.inter(r,[-g,g,-g,g]);if(!ic)continue;
    const wall=(xa,za,xb,zb)=>{const Lw=Math.hypot(xb-xa,zb-za);if(Lw<1)return;
     CAPW.push(uvShift(gridSurface((u,v)=>[lerp(xa,xb,u),lerp(t.y0,t.y1,v),lerp(za,zb,u)],Math.max(1,Math.round(Lw/25.6)),1,{uS:Lw/25.6,vS:(t.y1-t.y0)/25.6}),t.y0/25.6));};
    if(r[0]>-g)wall(r[0],ic[2],r[0],ic[3]);if(r[1]<g)wall(r[1],ic[2],r[1],ic[3]);
    if(r[2]>-g)wall(ic[0],r[2],ic[1],r[2]);if(r[3]<g)wall(ic[0],r[3],ic[1],r[3]);
    // a gallery at every deck level round the atrium, and planting hung over its rim
    for(const sd of [0,1]){const z=sd?ic[3]:ic[2];if((sd?r[3]:r[2])!==z)continue;
     kput('acBox',[(ic[0]+ic[1])/2,t.y1-.6,z+(sd?-1.2:1.2)],null,[ic[1]-ic[0],1.2,2.4],new THREE.Color(dd?0x6e675a:0xd8cfbc));
     for(let x=ic[0]+4;x<ic[1]-3;x+=7)kput('vine',[x,t.y1-1,z+(sd?-.4:.4)],null,[1.2,3+U(9500+i,Math.round(x),sd)*6,1.2],null);}}}

  // the pavilion on the summit
  const pv=C.pav;
  kput('apGlass',[0,(pv.y0+pv.y1-2)/2,0],null,[2*(pv.h-2),pv.y1-pv.y0-2,2*(pv.h-2)],gcol);
  kput('acBox',[0,pv.y1-1,0],null,[2*pv.h+6,2,2*pv.h+6],new THREE.Color(dd?0x6e675a:0xd8cfbc));
  for(const sx of [-1,1])for(const sz of [-1,1])kput('acBox',[sx*(pv.h-2),(pv.y0+pv.y1)/2,sz*(pv.h-2)],null,[1.4,pv.y1-pv.y0,1.4],new THREE.Color(dd?0x5e584c:0xc8bea8));
  if(!dd){beam('acBox',[0,pv.y1,0],[0,pv.y1+30,0],1.2,1.2,new THREE.Color(0xe8e1d2));kput('finial',[0,pv.y1+33,0],null,[2.2,5,2.2],null);
   kput('strip',[0,pv.y1+1.2,0],null,[2*pv.h+4,12,(2*pv.h+4)/.18],CYAN);}
  meshMerged(CAPM,dd?MAT.acMassR:MAT.acMass,G);
  meshMerged(CAPS,dd?MAT.acShadeR:MAT.acShade,G);
  meshMerged(CAPD,MAT.whGrass,G);
  meshMerged(CAPG,dd?MAT.apGlassR:MAT.apGlassI,G);
  meshMerged(CAPW,dd?MAT.apCrownR:MAT.acRes,G);}

 // ---- the gardens, from the records --------------------------------------------------------------------------------
 const CROP=dd?[0x5a6a2e,0x6c7a34,0x4c5e2a,0x7a7038,0x8a8a44,0x5f5230,0x6a7a3e,0x44582c]
              :[0xc9a94a,0xb59a3c,0x6f8f34,0x587a2c,0x8aa043,0x7b5a34,0x9c8a52,0x4f7a3e];
 for(const g of GN){const a=g.at,h3=U(9100,Math.round(a[0]),Math.round(a[2]));
  if(g.kind==='bed'){kput('acBox',[a[0],a[1]+.3,a[2]],g.ax==='x'?null:qEuler(0,Math.PI/2,0),[g.len,.55,g.wid],new THREE.Color(CROP[g.crop]).multiplyScalar(.85+.25*h3));
   if(h3<.2)kput('acBox',[a[0],a[1]+.5,a[2]],null,[.5,1,.5],new THREE.Color(0x6a5a40));}
  else if(g.kind==='tree'){const h=g.h;
   kput('trunk',[a[0],a[1],a[2]],qEuler(0,h3*6.28,0),[h*.16,h*.74,h*.16],new THREE.Color().setHSL(.07,.3,.2));
   const s0=h*(.28+.1*h3);
   kput('leafCard',[a[0],a[1]+h*.72,a[2]],qEuler(0,h3*6.28,0),[s0,s0*(.75+.3*h3),s0],new THREE.Color().setHSL(.2+.12*h3,.3+.15*h3,dd?.16+.08*h3:.22+.1*h3));}
  else if(g.kind==='plot'){const zq=g.ax==='x'?null:qEuler(0,Math.PI/2,0),al=g.ax==='x',L=g.len,Wd=g.wid;
   const off=(da,dc)=>al?[a[0]+da,0,a[2]+dc]:[a[0]+dc,0,a[2]+da];
   if(g.sub!=='shed'&&g.sub!=='tank')kput('acBox',[a[0],a[1]+.18,a[2]],zq,[L,.35,Wd],new THREE.Color(g.sub==='paddy'?0x3f5a52:0x4a3a26));
   if(g.sub==='rows'){const n=Math.floor(Wd/1.3);for(let i=0;i<n;i++){const o=off(0,-Wd/2+.65+i*1.3);
     kput('acBox',[o[0],a[1]+.55,o[2]],zq,[L-.6,.45,.6],new THREE.Color(CROP[g.crop]).multiplyScalar(.8+.3*U(9700,i,Math.round(a[0]+a[2]))));}}
   else if(g.sub==='orchard'){for(const da of [-L/4,L/4])for(const dc of [-Wd/4,Wd/4]){const o=off(da,dc),h=3.5+2.5*h3;
     kput('trunk',[o[0],a[1]+.3,o[2]],null,[h*.14,h*.6,h*.14],new THREE.Color().setHSL(.07,.3,.22));
     kput('leafCard',[o[0],a[1]+.3+h*.62,o[2]],qEuler(0,h3*6,0),[h*.42,h*.36,h*.42],new THREE.Color().setHSL(.24+.06*h3,.4,.22));}}
   else if(g.sub==='tunnel')kput('apTunnel',[a[0],a[1]+.3,a[2]],zq,[L-1,Wd*.42,Wd*.45],null);
   else if(g.sub==='paddy'){const n=Math.floor(Wd/1.6);for(let i=0;i<n;i++){const o=off(0,-Wd/2+.8+i*1.6);kput('acBox',[o[0],a[1]+.45,o[2]],zq,[L-1,.35,.35],new THREE.Color(0x6a9a44));}}
   else if(g.sub==='fallow'){for(let i=0;i<5;i++){const o=off((U(9701,i,1)-.5)*L,(U(9702,i,1)-.5)*Wd);kput('rubble',[o[0],a[1]+.4,o[2]],null,[.8,.4,.8],new THREE.Color(0x5a4630));}}
   else if(g.sub==='shed'){kput('acBox',[a[0],a[1]+1.6,a[2]],zq,[6,3.2,5],new THREE.Color(0x7a5a3a));
    kput('acBox',[a[0],a[1]+3.4,a[2]],g.ax==='x'?qEuler(.12,0,0):qEuler(.12,Math.PI/2,0),[6.8,.3,5.8],new THREE.Color(0x6a4a34));
    const o=off(4,0);kput('acBox',[o[0],a[1]+.8,o[2]],zq,[1.6,1.6,1.6],new THREE.Color(0x8a7050));}
   else if(g.sub==='tank'){kput('apCore',[a[0],a[1]+2.05,a[2]],null,[3,4,3],new THREE.Color(0x7a6a58));kput('apCore',[a[0],a[1]+4.25,a[2]],null,[3.2,.4,3.2],new THREE.Color(0x5e5244));}}
  else if(g.kind==='figure'){kput('figB',[a[0],a[1],a[2]],qEuler(0,g.ry,0),1,new THREE.Color().setHSL(h3*.1,.35,.4));
   kput('figH',[a[0],a[1],a[2]],null,1,new THREE.Color(0xc9a17e));}}

 // ---- the rope bridges ---------------------------------------------------------------------------------------------------
 // planks on a sagging deck between two roofs, two hand ropes, a hanger every third plank, a post pair at each end
 if(RU)for(const br of RU.bridges){const A=br.from,B=br.to,span=Math.hypot(B[0]-A[0],B[2]-A[2]),dir=[(B[0]-A[0])/span,0,(B[2]-A[2])/span];
  const qf=qFacing(dir),acr=[-dir[2],0,dir[0]],n=Math.ceil(span/1.1);
  const pt=(t,up,sd)=>[lerp(A[0],B[0],t)+acr[0]*sd,A[1]+.4-br.sag*4*t*(1-t)+up,lerp(A[2],B[2],t)+acr[2]*sd];
  for(let j=0;j<=n;j++){const t=j/n;kput('acBox',pt(t,0,0),qf,[1.7,.12,.8],new THREE.Color(0x6e5232).multiplyScalar(.8+.3*U(9800,j,span|0)));
   if(j%3===0)for(const sd of [-1,1])beam('acBox',pt(t,0,sd*.9),pt(t,1.15,sd*.9),.05,.05,new THREE.Color(0x4a3a28));}
  for(const sd of [-1,1])for(let j=0;j<n;j++){beam('acBox',pt(j/n,1.15,sd*.9),pt((j+1)/n,1.15,sd*.9),.07,.07,new THREE.Color(0x5a4630));
   beam('acBox',pt(j/n,-.05,sd*.85),pt((j+1)/n,-.05,sd*.85),.06,.06,new THREE.Color(0x5a4630));}
  for(const e of [A,B])for(const sd of [-1,1])kput('acBox',[e[0]+acr[0]*sd,e[1]+1,e[2]+acr[2]*sd],null,[.3,2,.3],new THREE.Color(0x5a4630));}

 // ---- the cores ------------------------------------------------------------------------------------------------------
 // round shafts of lifts and stairs: the four great cores ground to crown, base cores to the neck, crown cores from it.
 // A ring and a lit band at every tier; a cap over the roof they rise through.
 // a shaft never ends in a roof's plane (it z-fought the roof and its own cap): it stops 0.2 m over the roof under its cap,
 // or 0.4 m under the capstone's deck when it ends inside the capstone
 const topOf=c=>c.inCap?c.y1-.4:c.y1+.2;
 const shaft=(c,ya,yb,col)=>{if(yb-ya<1)return;kput('apCore',[c.x,(ya+yb)/2,c.z],null,[c.r,yb-ya,c.r],col);};
 for(const c of P.cores){const col=new THREE.Color(c.sys==='great'?(dd?0x8c8474:0xe6dfd0):(dd?0x7c7466:0xcfc6b4));
  const cut=coreCut.get(c.id);
  if(cut){shaft(c,c.y0,cut.breakY0,col);
   if(cut.how==='walled'){shaft(c,cut.breakY0,cut.breakY1,new THREE.Color(0x6e665a));shaft(c,cut.breakY1,topOf(c),col);
    for(let j=0;j<10;j++)kput('rubble',[c.x+(U(9200,j,1)-.5)*c.r*2,cut.breakY0+U(9201,j,1)*(cut.breakY1-cut.breakY0),c.z+(U(9202,j,1)-.5)*c.r*2],
     qEuler(U(9203,j,1)*3,U(9204,j,1)*3,0),[3+U(9205,j,1)*4,2+U(9206,j,1)*3,3+U(9207,j,1)*4],new THREE.Color(0x7a7062));}
   else if(cut.breakY1<c.y1&&c.sys==='great')shaft(c,cut.breakY1,topOf(c),col);
   const yb=cut.breakY0;for(let j=0;j<14;j++){const a2=j/14*TAU,rr2=c.r*(.8+.3*U(9210,j,2));
    kput('rubble',[c.x+Math.cos(a2)*rr2,yb+U(9211,j,2)*4,c.z+Math.sin(a2)*rr2],qEuler(U(9212,j,2)*3,U(9213,j,2)*3,0),[2+U(9214,j,2)*3,1.5+U(9215,j,2)*3,2+U(9216,j,2)*3],col.clone().multiplyScalar(.8));}}
  else shaft(c,c.y0,topOf(c),col);
  for(let y=c.y0+TS;y<c.y1;y+=TS){if(cut&&y>cut.breakY0-2&&(cut.how==='fell'?c.sys!=='great'||y<cut.breakY1+2:y<cut.breakY1+2))continue;
   kput('apCore',[c.x,y,c.z],null,[c.r+1.2,1.6,c.r+1.2],col.clone().multiplyScalar(.92));
   if(!dd||c.sys==='crown')kput('strip',[c.x,y+3,c.z],null,[c.r*2+2.6,12,(c.r*2+2.6)/.18],CYAN);}
  if((!cut||cut.how==='walled'||c.sys==='great')&&!c.inCap){kput('apCore',[c.x,c.y1+1.6,c.z],null,[c.r+2,3,c.r+2],col.clone().multiplyScalar(.85));
   if(c.sys==='great')kput('apCore',[c.x,c.y1+9,c.z],null,[c.r*.55,12,c.r*.55],col);}}

 // ---- the grand stairs -------------------------------------------------------------------------------------------------
 // From the plain up the slot in each face to the end of the crown's gate block, a storey over the sealed plinth: a deck
 // carried on piers every 36 m, its treads two metres apart, a balustrade, and the gate at the top.
 for(const s of P.stairs){const cut=stairCut.get(s.id),f1=cut?cut.from:1,run=s.x1-s.x0,rise=s.y1-s.y0;
  if(f1<=0)continue;                                     // the east stair went with the corner
  const at=f=>[s.x0+run*f,s.y0+rise*f,0];
  const A=at(0),B=at(f1);beam('acBox',[A[0],A[1]-1.5,0],[B[0],B[1]-1.5,0],3,s.w,new THREE.Color(dd?0x6e675a:0xbdb3a0));
  const n=Math.round(Math.hypot(run,rise)/2);
  for(let j=0;j<n;j++){const f=(j+.5)/n;if(f>f1)break;const p=at(f);kput('acBox',[p[0],p[1]-.2,0],null,[Math.abs(run/n)+.1,.4,s.w-1],new THREE.Color(dd?0x7a7264:0xd8cfbe));}
  for(const sz of [-1,1])beam('acBox',[A[0],A[1]+.6,sz*(s.w/2-.4)],[B[0],B[1]+.6,sz*(s.w/2-.4)],1.2,.6,new THREE.Color(dd?0x5e584c:0xa89e8c));
  for(let f=.12;f<f1;f+=36/Math.abs(run)){const p=at(f);kput('acBox',[p[0],(p[1]-3)/2,0],null,[5,p[1]-3,s.w*.7],new THREE.Color(dd?0x6a6355:0xb6ac9a));}
  if(!dd)for(let f=.05;f<1;f+=.08){const p=at(f);kput('strip',[p[0],p[1]+1.2,s.w/2],null,[8,12,12],CYAN);}
  // the gate, on the gate block's end
  const gt=at(1),gx2=s.x1;
  kput('acArch',[gx2+s.sx*.6,gt[1]+9,0],qFacing([s.sx,0,0]),[2.2,2,2],null);
  kput('acBox',[gx2+s.sx*1.2,gt[1]+21,0],qFacing([s.sx,0,0]),[24,3,2.4],new THREE.Color(dd?0x6e675a:0xe8e1d2));
  if(cut){const p=at(f1),q=[s.x1,s.y1,0];
   rubbleRing(s.x0+run*(f1+.15),.4,0,4,60,90,6);
   for(let j=0;j<4;j++){const f=f1+(1-f1)*(j+.5)/4,p2=at(f);
    kput('rubble',[s.x0+run*(f1+.1+.08*j)+(U(9300,j,3)-.5)*30,2+U(9301,j,3)*3,(U(9302,j,3)-.5)*40],qEuler(U(9303,j,3)*.6,U(9304,j,3)*3,U(9305,j,3)*.6),[18+U(9306,j,3)*10,3,s.w*.8],new THREE.Color(0x6e675a));}
   // the crown's people walled the landing: a parapet of salvage across the gate
   kput('acBox',[gx2+s.sx*3,gt[1]+3.5,0],null,[2.4,7,s.w],new THREE.Color(0x5e584c));}}

 // ---- the ground ---------------------------------------------------------------------------------------------------
 const H0=ARCPILE.half(0)+40;
 GRD.push(gridSurface((u,v)=>[lerp(-H0,H0,u),.12,lerp(-H0,H0,v)],24,24,{uS:H0/7,vS:H0/7}));
 for(let j=0;j<(dd?60:140);j++){const x=(U(9400,j,1)-.5)*2*(H0-30),z=(U(9400,j,2)-.5)*2*(H0-30);
  if(P.tiers[0].blocks.some(b=>{const r=ARCPILE.rect(b);return x>r[0]-6&&x<r[1]+6&&z>r[2]-6&&z<r[3]+6;}))continue;
  if(P.cores.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+6))continue;
  const h=6+8*U(9401,j,3);
  kput('trunk',[x,.1,z],null,[h*.16,h*.74,h*.16],new THREE.Color().setHSL(.07,.3,.2));
  kput('leafCard',[x,h*.72,z],qEuler(0,U(9402,j,4)*6,0),[h*.32,h*.28,h*.32],new THREE.Color().setHSL(.25,.35,dd?.18:.26));
  if(!dd&&U(9403,j,5)<.4){kput('figB',[x+4,.1,z+2],null,1,new THREE.Color().setHSL(.05,.3,.35));kput('figH',[x+4,.1,z+2],null,1,new THREE.Color(0xc9a17e));}}

 // ---- the ruin, on the ground: the blocks that fell -------------------------------------------------------------------
 // THE CORNER: the blocks that came down lie in a slope of torn slabs and rubble in the corner they fell from
 if(dd){for(const f of RU.fallen){const q=qEuler(f.tilt,f.yaw,f.tilt*.5);
   const SH=krShard({w:f.w,l:f.len,t:f.t,layers:Math.max(3,Math.round(f.t/STO/1.5)),brk:[1,1,1,1],bite:.25,tile:25.6,seg:12});
   const y=-SH.low(q)-3,M=new THREE.Matrix4().compose(new THREE.Vector3(f.x,y,f.z),q,new THREE.Vector3(1,1,1));
   if(SH.top)MASG.push(SH.top.applyMatrix4(M));if(SH.side)WALL.push(SH.side.applyMatrix4(M));
   if(SH.brk)BRKG.push(SH.brk.applyMatrix4(M));
   rubbleRing(f.x,.4,f.z,10,60,50,8);}
  for(let j=0;j<40;j++){const x=RU.corner/2+U(9900,j,1)*300+(U(9901,j,1)-.5)*200,z=RU.corner+ARCPILE.half(0)*.2-x+(U(9902,j,1)-.5)*260,s3=10+U(9903,j,1)*22;
   if(x+z<RU.corner+15)continue;kput('rubble',[x,s3*.25,z],qEuler(U(9904,j,1),U(9905,j,1)*3,0),[s3*1.6,s3*.7,s3*1.4],new THREE.Color().setHSL(.08,.08,.32+.1*U(9906,j,1)));}
  rubbleRing(0,.4,0,H0-40,H0+120,260,9);
  trees(0,0,H0+20,H0+700,120);}
 else trees(0,0,H0+60,H0+700,60);

 // ---- merge -----------------------------------------------------------------------------------------------------------
 meshMerged(WALL,dd?MAT.acResR:MAT.acRes,G);
 meshMerged(WALLC,MAT.apCrownR,G);
 meshMerged(ROOF,dd?MAT.whGrassR:MAT.whGrass,G);
 meshMerged(ROOFC,MAT.whGrass,G);
 meshMerged(SOFF,dd?MAT.acShadeR:MAT.acShade,G);
 meshMerged(GRD,dd?MAT.acPaveR:MAT.acPave,G);
 meshMerged(MASG,MAT.acMassR,G);
 meshMerged(BRKG,MAT.acBreak,G);
 AP_SITE[d]={x:gx,z:gz,d:d,TS:TS,NT:D.NT,NECK:D.NECK,YN:YN,H:P.stats.height,half:k=>ARCPILE.half(k),
  stats:P.stats,cores:P.cores.map(c=>({id:c.id,sys:c.sys,x:c.x,z:c.z,r:c.r,y1:c.y1})),
  stairs:P.stairs.map(s=>({id:s.id,sx:s.sx,x0:s.x0,x1:s.x1,y1:s.y1})),
  cap:{y0:P.cap.y0,top:P.cap.top,h0:P.cap.terraces[0].h},
  gate:(function(){const g=P.blocks.find(b=>b.gate);return {a:g.a,b:g.b,y0:g.y0};})(),
  fallen:RU?RU.fallen.slice(0,3):[],crashed:RU?RU.crashed.map(c=>{const b=P.blocks.find(q=>q.id===c.id);return {id:c.id,ax:b.ax,c:b.c,a:b.a,b:b.b,y0:b.y0};}):[],
  bridges:RU?RU.bridges:[],corner:RU?RU.corner:null,
  // the roofs for the settlement's flora (owner, 2026-10-27): in the ruin the base's roofs (overgrow) are left bare for
  // the Rift's plants; the crown's are farmed
  roofs:P.blocks.filter(b=>!gone.has(b.id)&&!crashed.has(b.id)).map(b=>({id:b.id,rect:ARCPILE.ruinRect(b,RU),y:b.y1,overgrow:!!dd&&!b.crown,farmed:!!dd&&b.crown})),
  tags:KTAGS.arcpile?KTAGS.arcpile.audit():null};
 KOFF=[0,0,0];return G;}
