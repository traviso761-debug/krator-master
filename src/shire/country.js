// ---------- the country: hedges, trees, orchards, and what grazes ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// "More or less a Warwickshire village", Tolkien said, and what makes that country is the hedges: every field
// has one round it, with a tree standing in it every so often, and from any height the land is a net of dark
// lines. tools/make-shire.py traces them along the same lines it painted the fields between. Then the trees
// that are named or painted: the one on top of the Hill, the Party Tree in the field below it, the chestnut in
// flower by the Old Grange, "the avenue of trees going from Hobbiton to Bywater", the "leaning alder-trees"
// along the Water, orchards in blossom, copses. Sheep and cows stand in the fields the field map says are
// pasture.

export function country(api){
  const {THREE,ctx,scene,groundH}=api;
  const V=ctx.plan;if(!V)return;
  const R=mkR(1420);
  const o=new THREE.Object3D(),col=new THREE.Color();
  const merge=(list)=>{const pos=[],nor=[];for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;g.computeVertexNormals();pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;};
  const instanced=(geo,color,list,name,shadow)=>{if(!list.length)return null;
    const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),list.length);
    list.forEach((t,i)=>{o.position.set(t.x,t.y,t.z);o.rotation.set(t.rx||0,t.ry||0,t.rz||0);o.scale.set(t.sx,t.sy,t.sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);
      m.setColorAt(i,col.setHex(t.c!==undefined?t.c:color));});
    m.instanceColor.needsUpdate=true;m.castShadow=!!shadow;m.receiveShadow=true;m.frustumCulled=false;m.userData.wireCat='veg';m.name=name;scene.add(m);return m;};

  // ---- the shapes (unit size; scaled per tree) ----
  const broad=merge([new THREE.IcosahedronGeometry(0.34,0).translate(0,0.62,0),new THREE.IcosahedronGeometry(0.26,0).translate(0.2,0.72,0.08),
    new THREE.IcosahedronGeometry(0.25,0).translate(-0.17,0.7,-0.12),new THREE.IcosahedronGeometry(0.22,0).translate(0.02,0.86,0.05)]);
  const round=merge([new THREE.IcosahedronGeometry(0.42,1).translate(0,0.66,0)]);
  const poplar=new THREE.IcosahedronGeometry(0.5,0).scale(0.36,1,0.36).translate(0,0.58,0);
  const trunk=new THREE.CylinderGeometry(0.035,0.055,0.5,5).translate(0,0.25,0);
  const hedge=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);
  const lump=new THREE.IcosahedronGeometry(0.5,0).scale(1,0.7,1).translate(0,0.35,0);

  const TREE=[0x4e7a34,0x5a8438,0x466f30,0x68903e,0x3f6a2c,0x6f8f3a,0x557f36];
  const canopies=[],trunks=[],roundC=[],pops=[],hedges=[],hedgeLumps=[];
  const tree=(x,z,h,wk,kind,c,lean)=>{const y=groundH(x,z),w=h*wk;const ry=R()*6.28,rx=lean?lean[0]:0,rz=lean?lean[1]:0;
    const t={x,y:y-0.2,z,sx:w,sy:h,sz:w,ry,rx,rz,c:c!==undefined?c:TREE[Math.floor(R()*TREE.length)]};
    (kind==='round'?roundC:kind==='poplar'?pops:canopies).push(t);trunks.push({x,y:y-0.2,z,sx:w,sy:h,sz:w,ry,rx,rz,c:0x5a4a38});};

  // ---- hedges ----
  const HEDGE=[0x46723a,0x4a7a3c,0x3f6a34,0x528040];
  for(const h of V.hedges){
    for(let i=0;i+1<h.length;i++){const [ax,az]=h[i],[bx,bz]=h[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.5)continue;
      const n=Math.max(1,Math.round(L/6)),ang=Math.atan2(bz-az,bx-ax);
      for(let k=0;k<n;k++){const t=(k+0.5)/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=groundH(x,z);
        const hh=1.9+R()*0.9,c=HEDGE[Math.floor(R()*4)];
        hedges.push({x,y:y-0.3,z,sx:L/n+0.8,sy:hh,sz:1.8+R()*0.5,ry:-ang,c});
        if(R()<0.35)hedgeLumps.push({x:x+(R()-0.5)*3,y:y+hh-0.6,z:z+(R()-0.5)*1.2,sx:2.4+R()*1.6,sy:1.6+R()*1,sz:2+R(),ry:R()*6,c});
        if(R()<0.055)tree(x,z,12+R()*9,0.8,R()<0.5?'broad':'round');}}}

  // ---- copses ----
  for(const c of V.copses){const n=Math.round(c.r*c.r/180);for(let k=0;k<n;k++){const a=R()*6.28,r=Math.sqrt(R())*c.r;tree(c.x+Math.cos(a)*r,c.z+Math.sin(a)*r,11+R()*9,0.78,R()<0.6?'broad':'round');}}

  // ---- orchards: rows of small round trees in blossom ----
  const BLOSSOM=[0xf2eee6,0xf4dfe4,0xeaf0e0,0xe9d8de];
  for(const or of V.orchards){const c=Math.cos(or.rot),s=Math.sin(or.rot);
    for(let u=-or.w/2;u<=or.w/2;u+=8)for(let w=-or.d/2;w<=or.d/2;w+=8){const x=or.x+c*u-s*w,z=or.z+s*u+c*w;
      tree(x,z,4.5+R()*1.5,0.95,'round',R()<0.75?BLOSSOM[Math.floor(R()*4)]:0x7fa050);}}

  // ---- along the Water: alders and willows, leaning out over it ----
  const W=V.water;
  for(let i=0;i+1<W.length;i++){const a=W[i],b=W[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);let dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
    for(let s=R()*10;s<L;s+=7+R()*12){const t=s/L,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(Math.hypot(x-V.sites.bridge.x,z-V.sites.bridge.z)<30)continue;
      const sd=R()<0.5?-1:1,off=a[3]+3+R()*4,px=x-dz*sd*off,pz=z+dx*sd*off;
      // lean towards the water: tip about the axis along the bank
      const lean=0.12+R()*0.18;tree(px,pz,8+R()*6,0.7,R()<0.3?'round':'broad',R()<0.4?0x6f8a48:0x5a7a3a,[dx*sd*lean,-dz*sd*lean]);}}

  // ---- the avenue along the Bywater Road ----
  const bw=V.lanes.find(l=>l.n==='The Bywater Road');
  if(bw){const p=bw.p;for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],L=Math.hypot(bx-ax,bz-az);if(ax>1150)break;
    for(let s=10;s<L;s+=16){const t=s/L,x=ax+(bx-ax)*t,z=az+(bz-az)*t,nx=-(bz-az)/L,nz=(bx-ax)/L;for(const sd of [-1,1])tree(x+nx*sd*7,z+nz*sd*7,13+R()*3,0.62,'round',0x55803a);}}}

  // ---- poplars by the farms ----
  for(const [fx,fz] of V.farms)for(let k=0;k<5;k++){const a=R()*6.28;tree(fx+Math.cos(a)*(30+R()*25),fz+Math.sin(a)*(30+R()*25),16+R()*6,0.3,'poplar',0x4a7434);}

  // ---- the named trees ----
  const S=V.sites;
  // Over Bag End: the great oak. Tolkien paints one tree on top of the Hill; the films put a great oak right above
  // the door (on the set it was cut down near Matamata and rebuilt there with artificial leaves). It is both.
  const special=[];
  {const be=V.holes.find(h=>h.bagEnd);const fx=Math.sin(be.face),fz=Math.cos(be.face);
   const x=be.x-fx*16,z=be.z-fz*16,y=groundH(x,z);
   special.push({g:new THREE.CylinderGeometry(0.9,1.5,9,8).translate(0,4.5,0),c:0x5a4636,x,y:y-0.5,z});
   for(let k=0;k<5;k++){const a=k/5*6.28+0.4;special.push({g:new THREE.CylinderGeometry(0.35,0.7,8,6).translate(0,4,0).rotateZ(0.9).rotateY(a),c:0x5a4636,x,y:y+6,z});}
   for(let k=0;k<11;k++){const a=k/11*6.28,r=k<3?2:7+R()*4;special.push({g:new THREE.IcosahedronGeometry(1,1).scale(6+R()*2,3.6+R(),6+R()*2),c:[0x4a7430,0x557f36,0x3f6a2c][k%3],x:x+Math.cos(a)*r,y:y+12+R()*3+(k<3?4:0),z:z+Math.sin(a)*r});}}
  // The Party Tree: in the films a great Monterey pine in the open field below the Hill, by a little lake - a tall
  // bare trunk and a broad flat crown in layers, dark.
  {const x=S.partyTree.x,z=S.partyTree.z,y=groundH(x,z);
   special.push({g:new THREE.CylinderGeometry(1.0,1.6,16,8).translate(0,8,0),c:0x6a4a36,x,y:y-0.5,z});
   for(let k=0;k<4;k++){const a=k*1.7;special.push({g:new THREE.CylinderGeometry(0.3,0.55,10,6).translate(0,5,0).rotateZ(1.05).rotateY(a),c:0x6a4a36,x,y:y+12,z});}
   for(let k=0;k<14;k++){const a=k/14*6.28*1.7,r=3+R()*10;special.push({g:new THREE.IcosahedronGeometry(1,1).scale(7+R()*3,2.2+R(),7+R()*3),c:[0x2f5a2a,0x355f2c,0x2a5226][k%3],x:x+Math.cos(a)*r,y:y+17+R()*6,z:z+Math.sin(a)*r});}}
  // willows round the pond
  {const P=S.pond;for(let k=0;k<5;k++){const a=k/5*6.28+0.5;tree(P.x+Math.cos(a)*(P.rx+5),P.z+Math.sin(a)*(P.rz+5),9+R()*3,1.1,'round',0x8aa050,[Math.cos(a)*-0.12,Math.sin(a)*0.12]);}}
  {const byC=new Map();for(const sp of special){const m=new THREE.Mesh(sp.g,null);m.position.set(sp.x,sp.y,sp.z);if(!byC.has(sp.c))byC.set(sp.c,[]);byC.get(sp.c).push(m);}
   for(const [c,list] of byC){const g=api.mergeParts(list,new THREE.MeshLambertMaterial({color:c,flatShading:true}));if(g){g.castShadow=true;g.receiveShadow=true;g.userData.wireCat='veg';scene.add(g);}}}
  // the chestnut by the Grange, in flower
  {const x=S.grange.x+26,z=S.grange.z+22;tree(x,z,15,1.1,'round',0xdfe8d0);tree(x+4,z-3,13,0.9,'round',0x6f9a4a);}

  instanced(hedge,0x33552a,hedges,'hedges',false);
  instanced(lump,0x33552a,hedgeLumps,'hedge-tops',false);
  instanced(broad,0x4e7a34,canopies,'trees',true);
  instanced(round,0x4e7a34,roundC,'round-trees',true);
  instanced(poplar,0x4a7434,pops,'poplars',true);
  instanced(trunk,0x5a4a38,trunks,'trunks',false);

  // ---- livestock: in the fields the map says are pasture ----
  const img=new Image();img.src=V.fields.image;
  img.onload=()=>{try{
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data,F=V.fields;
    const pasture=(x,z)=>{const i=Math.floor((x-F.x0)/F.w*c.width),j=Math.floor((z-F.z0)/F.d*c.height);if(i<0||j<0||i>=c.width||j>=c.height)return false;
      const k=(j*c.width+i)*4;return d[k+3]===255&&d[k+1]>d[k]*1.25&&d[k+1]>d[k+2]*1.8&&d[k+1]>120;};
    const sheep=[],cows=[];const R2=mkR(77);
    for(let k=0;k<5000&&sheep.length+cows.length<700;k++){const x=F.x0+R2()*F.w,z=F.z0+R2()*F.d;if(!pasture(x,z))continue;
      const n=R2()<0.7?6+Math.floor(R2()*10):3+Math.floor(R2()*5),isCow=R2()<0.3;
      for(let m=0;m<n;m++){const px=x+(R2()-0.5)*40,pz=z+(R2()-0.5)*40;if(!pasture(px,pz))continue;const y=groundH(px,pz);
        (isCow?cows:sheep).push({x:px,y,z:pz,sx:isCow?2.2:1.2,sy:isCow?1.4:0.8,sz:isCow?0.9:0.7,ry:R2()*6.28,c:isCow?(R2()<0.5?0x5a3a28:0x2a2624):0xe8e4d8});}}
    const body=new THREE.BoxGeometry(1,1,1).translate(0,0.55,0);
    const head=new THREE.BoxGeometry(0.34,0.36,0.3).translate(0.62,0.95,0);
    const beast=merge([body,head]);
    instanced(beast,0xe8e4d8,sheep,'sheep',false);instanced(beast,0x5a3a28,cows,'cows',false);
    // haystacks, in the hay fields: rounded ricks in rows across the field
    const hayAt=(x,z)=>{const i=Math.floor((x-F.x0)/F.w*c.width),j=Math.floor((z-F.z0)/F.d*c.height);if(i<0||j<0||i>=c.width||j>=c.height)return false;
      const k=(j*c.width+i)*4,r=d[k],g=d[k+1],b=d[k+2];return d[k+3]!==255&&Math.abs(r-150)<22&&Math.abs(g-162)<22&&Math.abs(b-84)<22;};
    const stacks=[];for(let k=0;k<9000&&stacks.length<500;k++){const x=F.x0+R2()*F.w,z=F.z0+R2()*F.d;if(!hayAt(x,z))continue;
      stacks.push({x,y:groundH(x,z)-0.2,z,sx:2+R2()*0.6,sy:3+R2()*0.8,sz:2+R2()*0.6,ry:R2()*6,c:0xd4b460});}
    instanced(new THREE.SphereGeometry(0.5,10,7,0,Math.PI*2,0,Math.PI*0.62).translate(0,0.18,0).scale(1,1.1,1),0xd4b460,stacks,'haystacks',true);
    ctx.details=Object.assign(ctx.details||{},{sheep:sheep.length,cows:cows.length});
  }catch(e){api.report&&api.report('livestock',e);}};
  ctx.details=Object.assign(ctx.details||{},{hedgeBlocks:hedges.length,trees:canopies.length+roundC.length+pops.length});
}

function mkR(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
