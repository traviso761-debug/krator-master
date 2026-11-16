// ================================================================= THEODIGA TODAY — the ways down from the rim, drawn from their records
// thDescentDraw(gx, gz, ctx, town) draws what TH_DESCENT.make (src/41-th-descent.js, [G data]) lays out on the page's own wall:
// the Stair of Descent (its block and flights, from Gate Square to the crest), the Salvage Road (to the canyon floor) and the
// Silt Road (to the silt or the water), each one mesh of boxes in the colour of its part: the road's packed bed, the masonry
// body under it (tied back to the rock), a parapet on its open side, corbels under the outer lane, the landings at the turns;
// and the lead from each road's head on the plateau to the rim. Called by thTownDraw with the wall as buildDam draws it
// (ctx.wall, targets/theodiga/77-dam.js). Each way is registered (REGISTER, core/tags) before it is drawn.
function thDescentDraw(gx,gz,ctx,town,D0){const O={ways:0,boxes:0,tris:0,errors:[]};
 if(typeof TH_DESCENT==='undefined'||!ctx||!ctx.wall)return O;
 const GR=town.ground,W=ctx.wall;let D=D0;   /* D0: the plan thTownDraw already made (the works start where its roads end) */
 if(!D)try{D=TH_DESCENT.make({face:W,rim:z=>GR(W(z,440),z),rimY:440.25,floor:ctx.floor,bed:ctx.bed,WL:ctx.WL,crest:ctx.crest,
   heads:{salvage:town.heads.find(h=>/salvage/.test(h.id)),silt:town.heads.find(h=>/silt/.test(h.id))}});}
 catch(e){O.errors.push('the ways: '+(e&&e.message||e));return O;}
 const C3=new THREE.Color(),col=h=>{C3.setHex(h).convertSRGBToLinear();return [C3.r,C3.g,C3.b];};
 const ASH0=typeof XAK!=='undefined'&&XAK.MAT&&XAK.MAT.qAshlar&&XAK.MAT.qAshlar.map;   /* the stone multiplies these: paler tints over it */
 const ROAD=col(ASH0?0xb3a48c:0x9a8a70),BODY=col(ASH0?0xd9cbb4:0xa99377),PARA=col(ASH0?0xeadfca:0xb8a585),STEP=col(ASH0?0xf2e8d6:0xc9b799),
  BLOCK=col(ASH0?0xe4d6be:0xbfa98a),LAND=col(ASH0?0xcdbda2:0xa4937a);
 /* THE STONE (T-town-4, 2026-11-16): the library's dressed ashlar (stone.sandstone.ashlar, Qiblai's pack: XAK.MAT.qAshlar once
    XAK.bind has bound it), on world-scale uvs, 3 m a tile, each face mapped along its own plane; tinted by each part's colour.
    Without the pack the ways keep their plain colours */
 const ASH=typeof XAK!=='undefined'&&XAK.MAT&&XAK.MAT.qAshlar&&XAK.MAT.qAshlar.map?XAK.MAT.qAshlar:null;
 if(ASH)for(const k of ['map','normalMap','roughnessMap'])if(ASH[k]){ASH[k].wrapS=ASH[k].wrapT=THREE.RepeatWrapping;ASH[k].needsUpdate=true;}
 /* a box with sloping top and bottom: x0..x1 across, from end a to end b along z, each end its own top and bottom heights */
 const boxer=()=>{const pos=[],cs=[],uv=[];let n=0;
  const quad=(p,q,r,s,c)=>{const ax=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],bx=[r[0]-p[0],r[1]-p[1],r[2]-p[2]];
   const nx=Math.abs(ax[1]*bx[2]-ax[2]*bx[1]),ny=Math.abs(ax[2]*bx[0]-ax[0]*bx[2]),nz=Math.abs(ax[0]*bx[1]-ax[1]*bx[0]);
   for(const v of [p,q,r,p,r,s]){pos.push(v[0]+gx,v[1],v[2]+gz);cs.push(c[0],c[1],c[2]);
    if(nx>=ny&&nx>=nz)uv.push(v[2]/3,v[1]/3);else if(ny>=nz)uv.push(v[0]/3,v[2]/3);else uv.push(v[0]/3,v[1]/3);}};
  const add=(x0,x1,za,ta,ba,zb,tb,bb,c)=>{const A=[[x0,ba,za],[x1,ba,za],[x1,ta,za],[x0,ta,za]],B=[[x0,bb,zb],[x1,bb,zb],[x1,tb,zb],[x0,tb,zb]];
   quad(A[3],A[2],B[2],B[3],c);quad(A[0],B[0],B[1],A[1],c);quad(A[0],A[3],B[3],B[0],c);quad(A[1],B[1],B[2],A[2],c);quad(A[0],A[1],A[2],A[3],c);quad(B[0],B[3],B[2],B[1],c);n++;};
  return {add,mesh:(name)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
   const M=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93,flatShading:true,side:THREE.DoubleSide});
   if(ASH){M.map=ASH.map;M.normalMap=ASH.normalMap||null;M.roughnessMap=ASH.roughnessMap||null;M.roughness=1;}
   const m=new THREE.Mesh(g,M);m.name=name;m.castShadow=m.receiveShadow=true;
   O.boxes+=n;O.tris+=pos.length/9;return m;}};};
 const TG=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'}));
 const register=(P,name,kind)=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;
  for(const s of P.segs)for(const p of [s.a,s.b]){x0=Math.min(x0,p[0]-s.w);x1=Math.max(x1,s.inX+1);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);y0=Math.min(y0,p[1]-4);y1=Math.max(y1,p[1]+1);}
  if(P.block){x1=Math.max(x1,P.block.x1);y0=Math.min(y0,P.block.y0);}
  const x=(x0+x1)/2,z=(z0+z1)/2;
  REGISTER({name:'Theodiga — '+name,x,z,y:y0,r:Math.hypot(x1-x0,z1-z0)/2+2,h:y1-y0});
  TG.child('town/theodiga',{'class':'landmark',kind,key:'th.way.'+kind,name,at:[x+gx,(y0+y1)/2,z+gz],size:[x1-x0,y1-y0,z1-z0],
   tags:{culture:'xanadu-scrap',types:['infrastructure'],length:Math.round(P.length),grade:+P.grade.toFixed(3),drop:Math.round(P.drop)}});};
 /* a cliff road: its bed, the body under it back to the rock, the parapet on its open side, the corbels, the landings */
 const road=(P,B,isStair)=>{const thick=isStair?.25:.5,body=isStair?1.2:3;
  for(const s of P.segs){const xa=s.a[0],xb=s.b[0],xo=Math.min(xa,xb)-s.w/2,xi=Math.max(xa,xb)+s.w/2;
   /* the bed (a step's tread, for the stair: its top the higher end, the riser its front) */
   const ta=isStair?Math.max(s.a[1],s.b[1]):s.a[1],tb=isStair?Math.max(s.a[1],s.b[1]):s.b[1];
   B.add(xo,xi,s.a[2],ta,ta-thick,s.b[2],tb,tb-thick,isStair?STEP:ROAD);
   /* the body: under the inner lane back to the rock; under the outer lane its own width (and corbels to the rock away from the turns) */
   const back=s.lane===0&&!isStair?Math.max(s.inX,s.wall[0],s.wall[1])+1:xi;
   B.add(xo,back,s.a[2],ta-thick,ta-body,s.b[2],tb-thick,tb-body,BODY);
   if(s.corbel&&!isStair&&Math.round((s.a[2]+s.b[2])/2)%12<6)B.add((xa+xb)/2-.5,Math.max(s.inX,s.wall[0])+1,s.a[2],ta-body+.4,ta-body-1.6,s.b[2],tb-body+.4,tb-body-1.6,BODY);
   /* the parapet on the open side */
   B.add(xo,xo+.3,s.a[2],ta+.75,ta-thick,s.b[2],tb+.75,tb-thick,PARA);}
  for(const L of P.landings){const t=L.y,b=L.y-(isStair?1.2:3);B.add(L.x0,L.x1+1,L.z0,t,b,L.z1,t,b,LAND);B.add(L.x0,L.x0+.3,L.z0,t+.75,t-.25,L.z1,t+.75,t-.25,PARA);}};
 // ---- THE STAIR OF DESCENT -------------------------------------------------------------------------------------------------------
 {const P=D.stair,B=boxer(),K=P.block;register(P,'the Stair of Descent (Gate Square to the crest)','stair-of-descent');
  B.add(K.x0,K.x1,K.z0,K.y1,K.y0,K.z1,K.y1,K.y0,BLOCK);
  /* a parapet along the block's west edge but where the first flight leaves it */
  B.add(K.x0,K.x0+.3,K.z0+5,K.y1+.9,K.y1,K.z1,K.y1+.9,K.y1,PARA);
  road(P,B,true);scene.add(B.mesh('theodiga:town descent: the Stair of Descent'));O.ways++;}
 // ---- THE ROADS ------------------------------------------------------------------------------------------------------------------
 for(const [P,name,kind] of [[D.salvage,'the Salvage Road (down the east wall to the canyon floor)','salvage-road'],[D.silt,'the Silt Road (down the east wall to the silt flats)','silt-road']]){
  const B=boxer();register(P,name,kind);road(P,B,false);
  /* the lead from the head across the plateau to the top of the road, on the ground */
  const a=P.lead.a,b=P.lead.b,n=Math.max(2,Math.ceil(Math.abs(a[0]-b[0])/6));
  for(let k=0;k<n;k++){const x0=a[0]+(b[0]-a[0])*k/n,x1=a[0]+(b[0]-a[0])*(k+1)/n,yA=GR(x0,a[1])+.12,yB=GR(x1,a[1])+.12;
   const lo=Math.min(x0,x1),hi=Math.max(x0,x1);B.add(lo,hi,a[1]-2,Math.max(yA,yB),Math.min(yA,yB)-.4,a[1]+2,Math.max(yA,yB),Math.min(yA,yB)-.4,ROAD);}
  /* the Silt Road's landing at the water, where the silt is under it */
  if(P.landingAtWater){const s=P.segs[P.segs.length-1],x=s.b[0];B.add(x-8,x+3,s.b[2]-6,P.yEnd,ctx.WL-2,s.b[2]+6,P.yEnd,ctx.WL-2,LAND);}
  scene.add(B.mesh('theodiga:town descent: '+name));O.ways++;}
 O.stair={legs:D.stair.legs.length,steps:D.stair.segs.length,grade:+D.stair.grade.toFixed(3)};
 O.salvage={legs:D.salvage.legs.length,length:Math.round(D.salvage.length),grade:+D.salvage.grade.toFixed(3),bottom:+D.salvage.yEnd.toFixed(1)};
 O.silt={legs:D.silt.legs.length,length:Math.round(D.silt.length),grade:+D.silt.grade.toFixed(3),bottom:+D.silt.yEnd.toFixed(1),atWater:!!D.silt.landingAtWater};
 return O;}
