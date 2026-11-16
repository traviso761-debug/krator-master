// ================================================================= THEODIGA TODAY — the works below the rim, drawn from their records
// thWorksDraw(gx, gz, ctx, W) draws what TH_WORKS.make (src/42-th-works.js, [G data]) laid out and thTownDraw did not (it drew the
// yards' buildings and the field huts with the town's): the salvage heaps (core/terrain KRUBBLE's own mesh, one mesh a heap, its
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
 // ---- THE TRACK AND THE FIELDS, laid on their grounds ------------------------------------------------------------------------------
 {const pos=[],col=[],C3=new THREE.Color(),quad=(a,b,c,d,hex,G,lift)=>{C3.setHex(hex).convertSRGBToLinear();
   for(const p of [a,b,c,a,c,d]){pos.push(p[0]+gx,G(p[0],p[1])+(lift||.08),p[1]+gz);col.push(C3.r,C3.g,C3.b);}};
  const T=W.track,hw=T.w/2;
  TG.child(B,{'class':'feature',kind:'track',key:'th.works.track',name:'the yard track',at:[(T.a[0]+T.b[0])/2+gx,ctx.floor((T.a[0]+T.b[0])/2,T.a[1]),T.a[1]+gz],tags:{work:'salvage'}});
  for(let x=T.b[0];x<T.a[0]-.01;x+=6){const x1=Math.min(T.a[0],x+6);quad([x,T.a[1]-hw],[x1,T.a[1]-hw],[x1,T.a[1]+hw],[x,T.a[1]+hw],0x8c7d66,ctx.floor,.1);}
  const CROP={grain:0xc8b46a,pulse:0x7f9a4c,tuber:0x5f7a3c,fodder:0x8a9a52,fallow:0x8a7454};
  for(const f of W.fields){const K=f.corners,c=CROP[f.bucket||f.crop]||0x8a9a52;
   TG.child(B,{'class':'feature',kind:'field',key:f.id,at:[(K[0][0]+K[2][0])/2+gx,ctx.bed((K[0][0]+K[2][0])/2,(K[0][1]+K[2][1])/2),(K[0][1]+K[2][1])/2+gz],tags:{work:'silt fields',crop:f.crop}});
   for(let k=0;k<6;k++){const t0=k/6,t1=(k+1)/6,l=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
    quad(l(K[0],K[1],t0),l(K[0],K[1],t1),l(K[3],K[2],t1),l(K[3],K[2],t0),k%2?c:(c&0xf0f0f0)-0x101008,ctx.bed,.12);}}
  if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
   const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
   m.name='theodiga:town works: the track and the fields';m.receiveShadow=true;m.userData.probeSkip=true;m.userData.lodSkip=true;scene.add(m);O.meshes++;O.tris+=pos.length/9;}}
 return O;}
