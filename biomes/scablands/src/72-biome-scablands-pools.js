// ================================================================= SCABLANDS — the pools' own flora (the overlay's)
// The plants that mean nothing without the scour (biomes/nsemiarid/PLAN.md section 3: an overlay has only the flora that
// does): the potholes the flood drilled hold rain in a semiarid land, and the falls' foot keeps a seep where its spray
// fell. Their own kit registry ('scablands'), beside the n semiarid kit's; placed from records the stage hands over
// (SCABLANDS.place), every draw a core/rand hash of its place, nothing read from the host but through BIO.host.
//   kolk lilies     pads floating on a pothole's water, some in white flower (they need still, sheltered water)
//   pothole quills  stiff rosettes ringing the waterline (the rain rises and falls; they live on the line)
//   seep sedge      tufts on the wet rims and along the plunge lake's shore
//   spray ferns     fronds in the seeps at the foot of the falls' cliff
// Textured from this overlay's own pack (materials.json: whole sheets cut by cell here), plain colours without it.
const SCABLANDS={};
(function(){BIO.kit('scablands');const T=BIO.host.THREE,TAU=Math.PI*2,u=(h,k)=>KRAND.unit(KRAND.hash(h,k)),lr=(a,b,t)=>a+(b-a)*t;
 const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
 const HV=(wood,edible,medicinal,notes)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:null});
 const PK=(name,r,kp,items,travel,hv)=>({name,travel,tags:Object.assign(K('temperate','semiarid',r,kp),{harvest:hv}),items});
 SCABLANDS.PLANTS={
  kolklily:PK('Kolk lily','yes',['BSk','BSh'],['kolkPad','kolkBloom'],'seed',HV('none',['rhizome'],false,'Only in the potholes that hold rain: its seed sleeps in the dry mud of an empty one for years.')),
  quill:PK('Pothole quills','yes',['BSk','BSh'],['quillA','quillB'],'spores',HV('none',[],false,'A ring of stiff rosettes on the waterline; as the rain dries the ring is left standing on the rim.')),
  sedge:PK('Seep sedge','yes',['BSk','BSh','Csa'],['sedgeA','sedgeB'],'seed',HV('thatch',[],false,'')),
  sprayfern:PK('Spray fern','yes',['BSk','Csa'],['fernA','fernB'],'spores',HV('none',[],true,'In the seeps at the foot of the dry falls, where its spray once fell: the only fern for a hundred kilometres.'))};
 SCABLANDS.plantOfItem=item=>{for(const k in SCABLANDS.PLANTS)if(SCABLANDS.PLANTS[k].items.indexOf(item)>=0)return SCABLANDS.PLANTS[k];return null;};
 // ---- the geometry (deterministic: no draws)
 // a DISC in the xz plane, front up, its rim raised by `cup` (a rosette's leaves rise from the middle); uv over the cell
 // (the card's cell is in the uvs: cl = [i, j] of a 3 x 3 sheet, so every cell of a sheet shares one texture and one
// material; 2026-10-23: a texture cloned per cell before its image had loaded never got it, and drew nothing)
 const CU=(cl,u,v)=>[(cl[0]+.015+u*.97)/3,(cl[1]+.015+v*.97)/3];
 function disc(n,cup,cl){const pos=[],nor=[],uv=[];for(let s=0;s<n;s++){const a0=s/n*TAU,a1=(s+1)/n*TAU,P=a=>[Math.cos(a)*.5,cup||0,Math.sin(a)*.5];
   [[0,0,0],P(a1),P(a0)].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(...CU(cl,.5+p[0],.5+p[2]));});}return BIO.geo._make(pos,nor,uv);}
 // a TUFT: three upright quads at 60 degrees, base at y 0, top y 1 (v 0 at the top: a card is not flipped)
 function tuft(cl){const pos=[],nor=[],uv=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.25,c=Math.cos(a),s=Math.sin(a);
   const Q=[[-.5,0,1],[.5,0,1],[.5,1,0],[-.5,1,0]].map(q=>[c*q[0],q[1],s*q[0],q[0]+.5,q[2]]);
   [0,1,2,0,2,3].forEach(i=>{const q=Q[i];pos.push(q[0],q[1],q[2]);nor.push(-s,0,c);uv.push(...CU(cl,q[3],q[4]));});}return BIO.geo._make(pos,nor,uv);}
 // ---- the materials: one a sheet (the cells are in the geometry's uvs)
 const LIB=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('scablands',n):null;
 function sheet(n){const L=LIB(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;return t;}
 const mat=(n,key,o)=>BIO.leafMat(sheet(n),key,Object.assign({swayW:'0.0',swayA:0,alphaTest:.4},o||{}));
 const M={lily:mat('card.lily','kolklily'),quill:mat('card.quill','quill'),sedge:mat('card.sedge','sedge',{swayW:'(position.y)',swayA:.08}),fern:mat('card.fern','sprayfern',{swayW:'(position.y)',swayA:.05})};
 BIO.def('kolkPad',disc(14,0,[1,0]),M.lily,{label:'Kolk lily pads'});
 BIO.def('kolkBloom',disc(14,0,[1,1]),M.lily,{label:'Kolk lilies in flower'});
 BIO.def('quillA',disc(10,.22,[0,0]),M.quill,{label:'Pothole quills'});
 BIO.def('quillB',disc(10,.22,[1,1]),M.quill,{label:'Pothole quills'});
 BIO.def('sedgeA',tuft([0,0]),M.sedge,{label:'Seep sedge'});
 BIO.def('sedgeB',tuft([2,1]),M.sedge,{label:'Seep sedge'});
 BIO.def('fernA',tuft([1,0]),M.fern,{label:'Spray ferns'});
 BIO.def('fernB',tuft([1,1]),M.fern,{label:'Spray ferns'});
 const inside=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const q=(yaw)=>new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw);
 const col=(h,base)=>{const v=lr(.86,1.06,u(h,50));return new T.Color(base[0]*v,base[1]*v,base[2]*v);};
 // PLACE. o: {potholes:[{x,z,level,poly}], lake:{x,z,level,poly}, cliff:[[x,z],...] (the falls' foot), ground(x,z)}.
 // Returns what it placed, by item, and the records the checks read (each instance's place and the water it answers)
 SCABLANDS.place=function(o){BIO.cur='scablands/pools';const g=o.ground,out={lily:[],quill:[],sedge:[],fern:[],count:{}},
  put=(name,p,qq,s,c)=>{BIO.put(name,p,qq,s,c);out.count[name]=(out.count[name]||0)+1;};
  o.potholes.forEach((P,pi)=>{const hp=KRAND.hash(6181,Math.round(P.x),Math.round(P.z));let rx=0;for(const v of P.poly)rx=Math.max(rx,Math.hypot(v[0]-P.x,v[1]-P.z));
   // lilies: the pads float, a few in flower; as many as the water holds (one a 6 m^2, 2 to 16)
   const area=Math.PI*rx*rx*.7,n=Math.max(2,Math.min(16,Math.round(area/6)));
   for(let k=0,tries=0;k<n&&tries<n*8;tries++){const h=KRAND.hash(hp,tries),a=u(h,1)*TAU,r=Math.sqrt(u(h,2))*rx*.9,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;
    if(!inside(P.poly,x,z)||g(x,z)>P.level-.15)continue;k++;const s=lr(.7,1.6,u(h,3)),bloom=u(h,4)<.3;
    put(bloom?'kolkBloom':'kolkPad',[x,P.level+.03,z],q(u(h,5)*TAU),[s,1,s],col(h,[1,1,1]));out.lily.push([x,P.level+.03,z,pi]);}
   // quills: on the waterline round the rim, a pace apart
   for(let k=0;k<P.poly.length;k++){const a=P.poly[k],b=P.poly[(k+1)%P.poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let t=0;t<L;t+=1.1){const h=KRAND.hash(hp,k,Math.round(t*10)),f=t/L,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f,dx=x-P.x,dz=z-P.z,dl=Math.hypot(dx,dz)||1,o2=lr(-.25,.5,u(h,1));
     const px=x+dx/dl*o2,pz=z+dz/dl*o2,y=g(px,pz);if(y<P.level-.25||y>P.level+.8)continue;const s=lr(.35,.75,u(h,2));
     put(u(h,3)<.5?'quillA':'quillB',[px,Math.max(y,P.level)+.02,pz],q(u(h,4)*TAU),[s,s*.8,s],col(h,[1,1,1]));out.quill.push([px,Math.max(y,P.level),pz,pi]);
     if(u(h,5)<.35){const o3=lr(.8,2.2,u(h,6)),sx=x+dx/dl*o3,sz=z+dz/dl*o3,sy=g(sx,sz);if(sy>P.level)put(u(h,7)<.5?'sedgeA':'sedgeB',[sx,sy-.05,sz],q(u(h,8)*TAU),[lr(.7,1.2,u(h,9)),lr(.6,1.1,u(h,10)),lr(.7,1.2,u(h,9))],col(h,[1,1,1])),out.sedge.push([sx,sy,sz]);}}}});
  // the plunge lake: sedge along its shore, quills in its shallows
  const Lk=o.lake;if(Lk)for(let k=0;k<Lk.poly.length;k++){const a=Lk.poly[k],b=Lk.poly[(k+1)%Lk.poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   for(let t=0;t<L;t+=3){const h=KRAND.hash(7331,k,Math.round(t)),f=t/L,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f,dx=x-Lk.x,dz=z-Lk.z,dl=Math.hypot(dx,dz)||1;
    if(u(h,1)<.7){const o2=lr(0,3,u(h,2)),sx=x+dx/dl*o2,sz=z+dz/dl*o2,sy=g(sx,sz);if(sy>Lk.level&&sy<Lk.level+2.5){put(u(h,3)<.5?'sedgeA':'sedgeB',[sx,sy-.05,sz],q(u(h,4)*TAU),[lr(.8,1.4,u(h,5)),lr(.7,1.3,u(h,6)),lr(.8,1.4,u(h,5))],col(h,[1,1,1]));out.sedge.push([sx,sy,sz]);}}
    if(u(h,7)<.3){const o2=lr(-1.2,.3,u(h,8)),px=x+dx/dl*o2,pz=z+dz/dl*o2,py=g(px,pz);if(py>Lk.level-.25&&py<Lk.level+.6){const s=lr(.35,.7,u(h,9));put(u(h,10)<.5?'quillA':'quillB',[px,Math.max(py,Lk.level)+.02,pz],q(u(h,11)*TAU),[s,s*.8,s],col(h,[1,1,1]));out.quill.push([px,Math.max(py,Lk.level),pz,-1]);}}}}
  // the spray ferns: clumps along the falls' foot, out of the water
  for(let k=0;k<o.cliff.length;k++){const c=o.cliff[k],h=KRAND.hash(9049,k);for(let m=0,n=4+Math.floor(u(h,1)*5);m<n;m++){const hm=KRAND.hash(h,m),x=c[0]+lr(-4,4,u(hm,1)),z=c[1]+lr(-4,4,u(hm,2)),y=g(x,z);
   if(o.water&&o.water(x,z)>-1e8)continue;const s=lr(1.4,2.8,u(hm,3));put(u(hm,4)<.5?'fernA':'fernB',[x,y-.05,z],q(u(hm,5)*TAU),[s*.8,s,s*.8],col(hm,[1,1,1]));out.fern.push([x,y,z,k]);}}
  BIO.cur=null;return out;};
 BIO.kitEnd(SCABLANDS);})();
