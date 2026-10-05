// ---------- the ground's colours, and the water: the sea, the lakes and moats, the rivers ----------
// Fan work: Hyrule and Breath of the Wild belong to Nintendo, and every shape here is this project's own.
//
// The engine colours its terrain from four colours by height and slope, which suits a city. Hyrule wants a painter:
// soft greens across the fields, darker in the woods; the Gerudo Desert's sand; snow on Hebra, the Gerudo Highlands,
// Mount Lanayru and the mountains at the edge of the world; Death Mountain's dark rock reddening towards the crater;
// Akkala's autumn; Faron's deep jungle green; pale sand at the coast; grey rock wherever the ground is steep. This
// repaints the terrain's vertex colours once, from the plan's regions.
//
// The water is the page's too: the sea (the engine's sheet, with a clear rippled material), and the lakes, the
// moats and the rivers, which are not at sea level and so are drawn here at their own levels.

export function paint(api){
  const {THREE,ctx,scene,animHooks}=api;
  const PL=ctx.plan;if(!PL)return;
  const RG=PL.regions||{};
  const inR=(k,x,z)=>{const r=RG[k];if(!r)return 0;const dx=(x-r[0][0])/r[1],dz=(z-r[0][1])/r[2],d=Math.sqrt(dx*dx+dz*dz);return d>=1?0:1-d*d;};
  const C=h=>new THREE.Color(h);
  const COL={grass:C(0x8fb556),grass2:C(0x6f9a46),meadow:C(0xa8c068),forest:C(0x4e7a38),sand:C(0xe6cf94),dune:C(0xd8b878),
    snow:C(0xf4f6f8),rock:C(0x8a8478),rock2:C(0x6e6a62),ash:C(0x4a403a),lava:C(0xc0442a),autumn:C(0xc8823a),autumn2:C(0xb05a30),
    jungle:C(0x3e7a3a),beach:C(0xe8dcae),bed:C(0x6a7a72)};
  const c=new THREE.Color(),tmp=new THREE.Color();
  // broad, soft variation - hundreds of metres across, like brush strokes; anything finer reads as a checkerboard
  const n=(x,z)=>Math.sin(x/610+Math.cos(z/730)*1.3)*0.55+Math.sin(z/470-x/890+0.7)*0.45;
  scene.traverse(o=>{if(!o.isMesh||o.name!=='terrain'||!o.geometry.attributes.color)return;
    const P=o.geometry.attributes.position,N=o.geometry.attributes.normal,K=o.geometry.attributes.color;
    for(let k=0;k<P.count;k++){const x=P.getX(k),y=P.getY(k),z=P.getZ(k),ny=N?N.getY(k):1,v=n(x,z);
      // grass by default, varied, paler on the high meadows
      c.copy(COL.grass).lerp(COL.grass2,0.35+0.3*v);if(y>180)c.lerp(COL.meadow,Math.min(1,(y-180)/300)*0.6);
      // regions
      const de=inR('desert',x,z),dm=inR('deathmountain',x,z),ak=inR('akkala',x,z),fa=inR('faron',x,z);
      if(fa>0)c.lerp(COL.jungle,Math.min(1,fa*1.6));
      if(ak>0)c.lerp(v>0?COL.autumn:COL.autumn2,Math.min(1,ak*1.4)*0.75);
      if(de>0&&y<260)c.lerp(v>0.2?COL.dune:COL.sand,Math.min(1,de*2.5));
      // steep ground is rock; Death Mountain is ash and rock, red towards the crater
      const steep=Math.max(0,Math.min(1,(0.86-ny)/0.22));
      if(steep>0)c.lerp(v>0?COL.rock:COL.rock2,steep);
      if(dm>0){c.lerp(COL.ash,Math.min(1,dm*1.8));if(y>650)c.lerp(COL.lava,Math.min(1,(y-650)/300)*0.35*dm);}
      // snow: the cold north and west lie lower than the rest
      const cold=Math.max(inR('hebra',x,z),inR('gerudo_high',x,z)),line=dm>0.1?99999:(cold>0.05?560:z<-3800||x<-5000?650:760);
      if(y>line)c.lerp(COL.snow,Math.min(1,(y-line)/90)*(steep>0.6?0.55:1));
      // the coast's sand, and what is under the water
      if(y<5&&y>0.5)c.lerp(COL.beach,Math.min(1,(5-y)/3));
      if(y<=0.5)c.copy(COL.bed).lerp(tmp.set(0x2c4a5a),Math.min(1,(0.5-y)/20));
      K.setXYZ(k,c.r,c.g,c.b);}
    K.needsUpdate=true;});

  // ---- the water material: a little transparent, rippled, glinting (the same water as Beach City's) ----
  const R=(()=>{let s=1987;return ()=>(s=(s*16807)%2147483647)/2147483647;})();
  const ripple=(()=>{const N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),img=g.createImageData(N,N);
    const W=[];for(let k=0;k<40;k++){const f=3+Math.floor(R()*30),a=R()*Math.PI*2;W.push([Math.round(Math.cos(a)*f),Math.round(Math.sin(a)*f),R()*6.28,1/Math.pow(f,0.9)]);}
    const H=(i,j)=>{const x=i/N*Math.PI*2,y=j/N*Math.PI*2;let h=0;for(const [a,b,p,amp] of W)h+=Math.sin(x*a+y*b+p)*amp;return h;};
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=H((i+1)%N,j)-H((i+N-1)%N,j),dy=H(i,(j+1)%N)-H(i,(j+N-1)%N),s=5.5,nx=-dx*s,ny=-dy*s,l=Math.hypot(nx,ny,1),k=(j*N+i)*4;
      img.data[k]=(nx/l*0.5+0.5)*255;img.data[k+1]=(ny/l*0.5+0.5)*255;img.data[k+2]=(1/l*0.5+0.5)*255;img.data[k+3]=255;}
    g.putImageData(img,0,0);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;})();
  const waterM=(col,op)=>new THREE.MeshPhongMaterial({color:col,specular:0xd8f0ff,shininess:90,transparent:true,opacity:op,normalMap:ripple,
    normalScale:new THREE.Vector2(0.45,0.45),polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
  const seaM=waterM(0x2a7fae,0.82),lakeM=waterM(0x3a90b0,0.8),riverM=waterM(0x4a9cb8,0.78);riverM.side=THREE.DoubleSide;
  const uvWorld=(g,s)=>{const P=g.attributes.position,uv=new Float32Array(P.count*2);for(let k=0;k<P.count;k++){uv[2*k]=P.getX(k)/s;uv[2*k+1]=P.getZ(k)/s;}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));};
  scene.traverse(o=>{if(o.isMesh&&o.name==='river'&&o.geometry&&o.geometry.attributes.position){uvWorld(o.geometry,160);o.material=seaM;o.renderOrder=1;}});
  // the lakes, each flat at its own level
  for(const L of (PL.lakes||[])){const sh=new THREE.Shape(L.poly.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ShapeGeometry(sh,4).rotateX(-Math.PI/2);uvWorld(g,120);
    const m=new THREE.Mesh(g,lakeM);m.position.y=L.level;m.renderOrder=1;m.receiveShadow=true;m.userData.wireCat='water';m.userData.noFingerprint=true;scene.add(m);}
  for(const M of (PL.moats||[])){const g=new THREE.RingGeometry(M.r0,M.r1,64,1).rotateX(-Math.PI/2);g.translate(M.x,0,M.z);uvWorld(g,120);
    const m=new THREE.Mesh(g,lakeM);m.position.y=M.level;m.renderOrder=1;m.userData.wireCat='water';m.userData.noFingerprint=true;scene.add(m);}
  // the rivers: a ribbon down each, at the level the generator gave it, falling downstream
  for(const Rv of (PL.rivers||[])){const pts=[];
    for(let k=0;k+1<Rv.pts.length;k++){const [ax,az,ay]=Rv.pts[k],[bx,bz,by]=Rv.pts[k+1],L=Math.hypot(bx-ax,bz-az),n_=Math.max(1,Math.round(L/20));
      for(let s=0;s<n_;s++)pts.push([ax+(bx-ax)*s/n_,az+(bz-az)*s/n_,ay+(by-ay)*s/n_]);}
    pts.push(Rv.pts[Rv.pts.length-1]);
    const pos=[],idx=[],hw=Rv.width*0.6;
    pts.forEach(([x,z,y],k)=>{const a=pts[Math.max(0,k-1)],b=pts[Math.min(pts.length-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;
      pos.push(x+nx,y,z+nz,x-nx,y,z-nz);if(k)idx.push(2*k-2,2*k-1,2*k, 2*k-1,2*k+1,2*k);});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();uvWorld(g,80);
    const m=new THREE.Mesh(g,riverM);m.renderOrder=1;m.userData.wireCat='water';m.userData.noFingerprint=true;scene.add(m);}
  animHooks.push(now=>{const t=now/1000;ripple.offset.set((t*0.012)%1,(t*0.007)%1);});
}
