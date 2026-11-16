// ================================================================= THEODIGA TODAY — the works below the rim, drawn from their records
// thWorksDraw(gx, gz, ctx, W) draws what TH_WORKS.make (src/42-th-works.js, [G data]) laid out and thTownDraw did not (it drew the
// yards' buildings, the field huts and the Devisers' lodge with the town's): the bore to Stair's mouth (T-town-6), the salvage heaps (core/terrain KRUBBLE's own mesh, one mesh a heap, its
// mound in the kit's rubble and its loose pieces in the Ancients' worn white panels, the Dome's fallen shell, the hollows shaded),
// the yard track on the canyon floor, and the silt fields in furrows of their crop's colour on the silt. Each heap is registered
// (REGISTER, core/tags), the track and the fields tagged, before they are drawn. ctx: buildDam's grounds (targets/theodiga/77-dam.js).
function thWorksDraw(gx,gz,ctx,W){const O={meshes:0,tris:0,errors:[]};
 if(!W)return O;
 const TG=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'})),B='town/theodiga';
 const lin=h=>new THREE.Color(h).convertSRGBToLinear();
 /* the materials: the kit's own, library-bound (kits/ancients/materials.json rubbleK, whiteWorn), with vertex colours for the
    shade; one each for every heap */
 const mk=(src,hex)=>{const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,color:lin(hex)});
  if(src&&src.map){m.map=src.map;m.normalMap=src.normalMap||null;m.roughnessMap=src.roughnessMap||null;for(const t of [m.map,m.normalMap,m.roughnessMap])if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}}return m;};
 const MOUND=mk(MAT.rubbleK||MAT.rock,0x9b8f80),PIECE=mk(MAT.whiteWorn||MAT.white,0xe8e4dc);
 // ---- THE SALVAGE HEAPS ------------------------------------------------------------------------------------------------------------
 if(typeof KRUBBLE!=='undefined')for(const H of W.heaps){if(H.kind!=='heap')continue;
  REGISTER({name:'Theodiga — the salvage yards: a heap of the Dome\'s fallen panels',x:H.x,z:H.z,y:H.y0-.5,r:Math.max(H.rx,H.rz)+1,h:H.h+3});
  TG.child(B,{'class':'feature',kind:'salvage-heap',key:H.id,name:'a heap of the Dome\'s fallen panels',at:[H.x+gx,H.y0,H.z+gz],size:[2*H.rx,H.h,2*H.rz],tags:{culture:'xanadu-scrap',work:'salvage'}});
  const M=KRUBBLE.mesh(H,{cell:2}),n=M.pos.length/3;
  for(const [part,mat,uvK] of [[0,MOUND,1/4],[1,PIECE,1/2]]){const pos=[],col=[],uv=[];
   for(let t=0;t<M.idx.length;t+=3){const p0=M.part[M.idx[t]],want=part===0?p0===0:p0>0;if(!want)continue;
    for(let k=0;k<3;k++){const v=M.idx[t+k];pos.push(M.pos[v*3]+gx,M.pos[v*3+1],M.pos[v*3+2]+gz);const s=1-.55*M.occ[v];col.push(s,s,s);uv.push(M.uv[v*2]*uvK,M.uv[v*2+1]*uvK);}}
   if(!pos.length)continue;
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
   const m=new THREE.Mesh(g,mat);m.name='theodiga:town works: '+H.id+(part?' pieces':' mound');m.castShadow=m.receiveShadow=true;scene.add(m);O.meshes++;O.tris+=pos.length/9;}
  if(n===0)O.errors.push(H.id+': an empty heap');}
 // ---- THE BORE TO STAIR (T-town-6) -------------------------------------------------------------------------------------------------
 // The Ancients' headwall in their pale concrete, set into the east wall: its front at W.bore.x, its back past the farthest the
 // rock falls back there, so the rock's hole for the mouth (targets/theodiga/77-dam.js) is inside it. The bore's arch is cut
 // through it with a collar standing proud round the arch. The round bore runs east into the dark, lined in the same concrete,
 // to its drawn depth (an end cap). Its deck, the Devisers' lamps down the first stretch, and their licence gate across the bore
 // (corrugated sheet with a door) complete it. Registered and tagged first.
 O.bore=0;
 if(W.bore){const Bo=W.bore,R0=Bo.r,C=Bo.c,X0=Bo.x,Z0=Bo.z,HW=15,HH=26,T=Math.max(4,Bo.back-X0);
  const CONC=MAT.concrete||MAT.whiteWorn,DARK=MAT.dark||CONC,SHEET=MAT.corrugate||MAT.scrap||CONC,LAMP=new THREE.MeshBasicMaterial({color:0xffc47a});
  REGISTER({name:'Theodiga — the bore to Stair (the Ancients\' dead bore, held by the Rare Devisers)',x:X0+T/2,z:Z0,y:0,r:HW+1,h:HH});
  TG.child(B,{'class':'landmark',kind:'bore-portal',key:Bo.id,name:Bo.name,at:[X0+gx,0,Z0+gz],size:[T,HH,2*HW],tags:{culture:'ancient',work:'the bore',holder:Bo.holder,to:'Stair'}});
  TG.child(B,{'class':'feature',kind:'gatehouse',key:Bo.gate.id,name:Bo.gate.name,at:[X0+Bo.gate.at+gx,0,Z0+gz],tags:{culture:'xanadu-scrap',work:'the bore',holder:Bo.holder}});
  TG.child(B,{'class':'feature',kind:'lamps',key:Bo.id+'.lamps',name:'the Devisers\' lamps',at:[X0+Bo.gate.at/2+gx,C+2,Z0+gz],tags:{work:'the bore',holder:Bo.holder}});
  TG.child(B,{'class':'feature',kind:'track',key:Bo.id+'.spur',name:'the spur into the bore',at:[Bo.spur.pts[1][0]+gx,0,Bo.spur.pts[1][1]+gz],tags:{work:'the bore'}});
  const add=(g,mat,name,shadow)=>{const m=new THREE.Mesh(g,mat);m.name='theodiga:town works: the bore to Stair, '+name;m.castShadow=!!shadow;m.receiveShadow=true;scene.add(m);
   O.meshes++;O.bore++;O.tris+=(g.index?g.index.count:g.attributes.position.count)/3;return m;};
  /* a shape in the bore's cross-section (s along -z, y up) extruded east from x: its UVs at 8 m to the unit, the concrete's */
  const ext=(S,depth,x)=>{const g=new THREE.ExtrudeGeometry(S,{depth,bevelEnabled:false,curveSegments:1});const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);
   g.rotateY(Math.PI/2);g.translate(x+gx,0,Z0+gz);return g;};
  /* the bore's circle of radius r above the deck (y 0), from the deck's west edge over the crown to its east edge */
  const arch=(r,n)=>{const al=Math.asin(Math.min(1,C/r)),p=[];for(let k=0;k<=n;k++){const t=Math.PI+al-k*(Math.PI+2*al)/n;p.push([r*Math.cos(t),C+r*Math.sin(t)]);}return p;};
  {const S=new THREE.Shape(),A=arch(R0,40);S.moveTo(-HW,0);for(const p of A)S.lineTo(p[0],p[1]);S.lineTo(HW,0);S.lineTo(HW,HH-3);S.lineTo(HW-3,HH);S.lineTo(-HW+3,HH);S.lineTo(-HW,HH-3);S.closePath();
   add(ext(S,T,X0),CONC,'the headwall',true);}
  {const S=new THREE.Shape(),A=arch(R0+1.8,40),I=arch(R0,40).reverse();S.moveTo(A[0][0],A[0][1]);for(const p of A.slice(1))S.lineTo(p[0],p[1]);for(const p of I)S.lineTo(p[0],p[1]);S.closePath();
   add(ext(S,1.2,X0-1.2),CONC,'the collar',true);}
  /* the lining from the headwall's back to the drawn depth (the headwall's own arch is the lining through it), the deck, the cap */
  /* shaded toward the dark with depth (vertex colours over the concrete: 0.55 at the headwall's back, 0.08 at the cap), so the
     bore reads as a way into the dark, not a white tube */
  const DIM=CONC.clone();DIM.vertexColors=true;
  const shade=(g,x0)=>{const p=g.attributes.position,c=[];for(let i=0;i<p.count;i++){const t=Math.min(1,Math.max(0,(p.getX(i)-gx-x0)/(Bo.depth-(x0-X0)))),s=.6*Math.pow(1-t,1.6)+.06;c.push(s,s,s);}
   g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g;};
  /* the lining runs from 2 m inside the mouth (a hand's width inside the headwall's arch, which is as deep as the rock falls
     back there) to the drawn depth */
  {const x1=X0+2,L=Bo.depth-2,g=new THREE.CylinderGeometry(R0-.15,R0-.15,L,36,16,true);g.rotateZ(Math.PI/2);g.translate(x1+L/2+gx,C,Z0+gz);add(shade(g,x1),DIM,'the lining');
   const al=Math.asin(Math.min(1,C/R0)),dw=2*R0*Math.cos(al),d=new THREE.BoxGeometry(Bo.depth+1.2,.3,dw,24,1,1);d.translate(X0-1.2+(Bo.depth+1.2)/2+gx,0,Z0+gz);add(shade(d,x1),DIM,'the deck');
   const cap=new THREE.CircleGeometry(R0,36);cap.rotateY(-Math.PI/2);cap.translate(X0+Bo.depth+gx,C,Z0+gz);add(cap,DARK,'the dark beyond');}
  /* the licence gate: sheet across the bore with a door 3.2 m wide and 4.2 high */
  {const S=new THREE.Shape(),A=arch(R0-.05,36);S.moveTo(A[0][0],A[0][1]);for(const p of A.slice(1))S.lineTo(p[0],p[1]);S.lineTo(1.6,0);S.lineTo(1.6,4.2);S.lineTo(-1.6,4.2);S.lineTo(-1.6,0);S.closePath();
   add(ext(S,.4,X0+Bo.gate.at),SHEET,'the Devisers\' licence gate');}
  /* the lamps, on the bore's walls 2.5 m over its centre line, and two on the headwall either side of the collar */
  {const box=new THREE.BoxGeometry(.5,.7,.5),P=Bo.lamps.map(l=>[X0+l.at,C+2.5,Z0+l.side*(Math.sqrt(R0*R0-6.25)-.4)]).concat([[X0-.4,C+5,Z0-R0-3.5],[X0-.4,C+5,Z0+R0+3.5]]);
   const M=new THREE.InstancedMesh(box,LAMP,P.length),m4=new THREE.Matrix4();P.forEach((p,i)=>{m4.makeTranslation(p[0]+gx,p[1],p[2]+gz);M.setMatrixAt(i,m4);});
   M.name='theodiga:town works: the bore to Stair, the Devisers\' lamps';M.userData.probeSkip=true;scene.add(M);O.meshes++;O.bore++;O.tris+=12*P.length;}}
 // ---- THE TRACK AND THE FIELDS, laid on their grounds ------------------------------------------------------------------------------
 {const pos=[],col=[],C3=new THREE.Color(),quad=(a,b,c,d,hex,G,lift)=>{C3.setHex(hex).convertSRGBToLinear();
   for(const p of [a,b,c,a,c,d]){pos.push(p[0]+gx,G(p[0],p[1])+(lift||.08),p[1]+gz);col.push(C3.r,C3.g,C3.b);}};
  const T=W.track,hw=T.w/2;
  TG.child(B,{'class':'feature',kind:'track',key:'th.works.track',name:'the yard track',at:[(T.a[0]+T.b[0])/2+gx,ctx.floor((T.a[0]+T.b[0])/2,T.a[1]),T.a[1]+gz],tags:{work:'salvage'}});
  for(let x=T.b[0];x<T.a[0]-.01;x+=6){const x1=Math.min(T.a[0],x+6);quad([x,T.a[1]-hw],[x1,T.a[1]-hw],[x1,T.a[1]+hw],[x,T.a[1]+hw],0x8c7d66,ctx.floor,.1);}
  /* the spur on from the road's foot along the wall's foot and into the bore (on its deck past the headwall's front) */
  if(W.bore){const Bo=W.bore,P=Bo.spur.pts,sh=Bo.spur.w/2,G=(x,z)=>x>=Bo.x-1.2?.15:ctx.floor(x,z);
   for(let s=0;s<P.length-1;s++){const a=P[s],b=P[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L*sh,nz=(b[0]-a[0])/L*sh;
    for(let t=0;t<L-.01;t+=6){const t1=Math.min(L,t+6),p=[a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L],q=[a[0]+(b[0]-a[0])*t1/L,a[1]+(b[1]-a[1])*t1/L];
     quad([p[0]-nx,p[1]-nz],[q[0]-nx,q[1]-nz],[q[0]+nx,q[1]+nz],[p[0]+nx,p[1]+nz],0x8c7d66,G,.1);}}}
  const CROP={grain:0xc8b46a,pulse:0x7f9a4c,tuber:0x5f7a3c,fodder:0x8a9a52,fallow:0x8a7454};
  for(const f of W.fields){const K=f.corners,c=CROP[f.bucket||f.crop]||0x8a9a52;
   TG.child(B,{'class':'feature',kind:'field',key:f.id,at:[(K[0][0]+K[2][0])/2+gx,ctx.bed((K[0][0]+K[2][0])/2,(K[0][1]+K[2][1])/2),(K[0][1]+K[2][1])/2+gz],tags:{work:'silt fields',crop:f.crop}});
   for(let k=0;k<6;k++){const t0=k/6,t1=(k+1)/6,l=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    quad(l(K[0],K[1],t0),l(K[0],K[1],t1),l(K[3],K[2],t1),l(K[3],K[2],t0),k%2?c:(c&0xf0f0f0)-0x101008,ctx.bed,.12);}}
  if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
   const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
   m.name='theodiga:town works: the track and the fields';m.receiveShadow=true;m.userData.probeSkip=true;m.userData.lodSkip=true;scene.add(m);O.meshes++;O.tris+=pos.length/9;}}
 return O;}
