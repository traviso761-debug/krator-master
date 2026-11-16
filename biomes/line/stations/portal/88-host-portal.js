// ================================================================= HOST — the portal's works: the land, the portal face, the fallen stretch, the shaft head
// PLAN.md section 5, station 7. The land: LINE.groundAt baked through KFIELD (2 m) and meshed here (the Line's pages had no ground: every other
// station is under rock), its flat on the wet tableland's turf, its cuttings' faces on the rift fill (MAT_ROCK, KGROUND's layer), holed over the
// light wells; the portal's headwall (the section's opening in a concrete face, its parapet); the fallen stretch's rubble and lining slabs at the
// cutting's sides; the Tungangs' shaft head over the well at z 420 (stand-ins for the tungang kit's winch house, ice store and hooded lamp).
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,PROF=LK.profileOf(SEC,36),CX=(SEC.x0+SEC.x1)/2;
 const C={wall:rg(0xa8a49a),wallD:rg(0x8e8a82),rubble:rg(0x7a7268),slab:rg(0x9a968c),post:rg(0x5a4a38),hut:rg(0x7e766a),roof:rg(0x5e5446),turf:rg(0x5a6a3a),ice:rg(0xc8d4dc),rope:rg(0xa08a60)};
 const u=(a,b,c)=>KRAND.unit(KRAND.hash(SITE.world,a,b,c));
 /* THE LAND */
 const LAND=(function(){const F=KFIELD.bake(LINE.groundAt,[-140,-150,140,1050],2,{name:'the portal\'s land'}),nx=F.nx,nz=F.nz;
  const P=new Float32Array(nx*nz*3),Cg=new Float32Array(nx*nz*3),grass=[],rock=[];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=F.x0+i*F.step,z=F.z0+j*F.step,y=F.at(i,j);P[k*3]=x;P[k*3+1]=y;P[k*3+2]=z;
   const n=KRAND.fbm(x/40,0,z/40,2,SITE.world+7),t=.75+.5*n;Cg[k*3]=.07*t;Cg[k*3+1]=.105*t;Cg[k*3+2]=.045*t;}
  const holed=(x,z)=>LINE.WELLS.some(w=>Math.hypot(x-w.x,z-w.z)<w.r+1);
  for(let j=0;j+1<nz;j++)for(let i=0;i+1<nx;i++){const a=j*nx+i,b=a+1,c=a+nx+1,d=a+nx,x=F.x0+(i+.5)*F.step,z=F.z0+(j+.5)*F.step;if(holed(x,z))continue;
   const dy=Math.max(Math.abs(P[b*3+1]-P[a*3+1]),Math.abs(P[d*3+1]-P[a*3+1]),Math.abs(P[c*3+1]-P[a*3+1]))/F.step;(dy>.7?rock:grass).push(a,d,c,a,c,b);}
  const geo=idx=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(Cg,3));
   g.setAttribute('aVein',new THREE.BufferAttribute(new Float32Array(nx*nz),1));g.setAttribute('aGyp',new THREE.BufferAttribute(new Float32Array(nx*nz),1));g.setIndex(idx);g.computeVertexNormals();return g;};
  const MAT_TURF=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0});MAT_TURF.name='line:turf';
  const mG=new THREE.Mesh(geo(grass),MAT_TURF),mR=new THREE.Mesh(geo(rock),MAT_ROCK);mG.userData.inspectLabel='The wet tableland\'s turf over the fill';mR.userData.inspectLabel='The cuttings\' faces (the rift fill)';
  mG.receiveShadow=mR.receiveShadow=true;mG.userData.host=mR.userData.host=true;scene.add(mG);scene.add(mR);
  return {field:F,meshes:[mG,mR],tris:(grass.length+rock.length)/3};})();
 /* THE PORTAL'S HEADWALL: a concrete face across the escarpment's foot with the section's opening, its parapet and wing ends */
 {const z=LINE.PORTAL,top=LINE.groundAt(CX,z-4)+.8,x0=CX-34,x1=CX+34,hole=PROF.map(p=>[p[0],p[1]]);
  try{B.polyZ('lining',z,[[x0,0],[x1,0],[x1,top],[x0,top]],[hole],C.wall);B.polyZ('lining',z-1.2,[[x0,0],[x1,0],[x1,top],[x0,top]],[hole],C.wallD);}catch(e){reportErr('portal face: '+e.message);}
  B.box('conc',x0-.3,x1+.3,top,top+1.1,z-1.5,z+.3,C.wallD);B.box('conc',x0-.3,x0+1,0,top,z-1.5,z+.3,C.wallD);B.box('conc',x1-1,x1+.3,0,top,z-1.5,z+.3,C.wallD);
  for(let i=0;i+1<hole.length;i++){const p=hole[i],q=hole[i+1];B.quad('lining',[p[0],p[1],z-1.2],[q[0],q[1],z-1.2],[q[0],q[1],z],[p[0],p[1],z],C.wallD);}}
 /* THE FALLEN STRETCH: rubble heaps and slabs at the cutting's sides, a few on the strip */
 for(let i=0;i<60;i++){const side=u(i,95,0)<.45?-1:u(i,95,0)<.9?1:0,x=side<0?SEC.x0-3.2*u(i,95,1)-.2:side>0?SEC.x1+.2+3.2*u(i,95,1):-2+4*u(i,95,1),z=LINE.FALL[0]+4+(LINE.FALL[1]-LINE.FALL[0]-8)*u(i,95,2),y=side?.3:SEC.strip.y;
  if(u(i,95,3)<.5){const s=.4+1.3*u(i,95,4);B.box('rubble',x-s,x+s,y,y+s*.8,z-s*.9,z+s,C.rubble);}
  else{const a=u(i,95,5)*6.28,w=1+1.4*u(i,95,6),l=1.4+1.4*u(i,95,7),t=.3+.9*u(i,95,8),ca=Math.cos(a),sa=Math.sin(a),P=(dx,dz,dy)=>[x+dx*ca-dz*sa,y+.1+dy,z+dx*sa+dz*ca];B.quad('lining',P(-w/2,-l/2,0),P(-w/2,l/2,t),P(w/2,l/2,t),P(w/2,-l/2,0),C.slab);}}
 /* THE SHAFT HEAD: an A-frame winch over the well, its drum and rope, a stone hut, the ice store's turfed mound, the hooded lamp */
 {const w=LINE.head.well,g=LINE.groundAt(w.x,w.z),post=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],n=6;for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;B.box('metal',a[0]+dx*t0-.12,a[0]+dx*t0+.12,a[1]+dy*t0,a[1]+dy*t1,a[2]+dz*t0-.12,a[2]+dz*t0+.12,C.post);}};
  for(const s of [-1,1]){post([w.x-2.4,g,w.z+s*2.2],[w.x-.2,g+4.6,w.z+s*.4]);post([w.x+2.4,g,w.z+s*2.2],[w.x+.2,g+4.6,w.z+s*.4]);}
  B.box('metal',w.x-.5,w.x+.5,g+4.4,g+4.9,w.z-1.2,w.z+1.2,C.post);B.box('paint',w.x-.02,w.x+.02,g+.5,g+4.4,w.z-.02,w.z+.02,C.rope);
  for(const [dx,dz] of [[-2,-2],[2,-2],[-2,2],[2,2]])B.box('conc',w.x+dx-.2,w.x+dx+.2,g-.2,g+.5,w.z+dz-.2,w.z+dz+.2,C.wallD);
  const hx=w.x+8,hg=LINE.groundAt(hx,w.z);B.box('rubble',hx-2.5,hx+2.5,hg-.3,hg+2.4,w.z-3,w.z+3,C.hut);B.box('paint',hx-2.8,hx+2.8,hg+2.4,hg+2.6,w.z-3.3,w.z+3.3,C.roof);B.box('paint',hx-2.55,hx-2.5,hg,hg+1.9,w.z-.5,w.z+.5,C.roof);
  const ix=w.x-9,ig=LINE.groundAt(ix,w.z+6);B.box('rubble',ix-3,ix+3,ig-.3,ig+1.6,w.z+3,w.z+9,C.turf);B.box('white',ix-.6,ix+.6,ig,ig+1.3,w.z+2.9,w.z+3.0,C.ice);
  const lx=w.x-3,lg=LINE.groundAt(lx,w.z-4);B.box('metal',lx-.08,lx+.08,lg,lg+3,w.z-4.08,w.z-3.92,C.post);B.box('paint',lx-.35,lx+.35,lg+2.9,lg+3.15,w.z-4.35,w.z-3.65,C.roof);B.box('glow',lx-.15,lx+.15,lg+2.7,lg+2.9,w.z-4.15,w.z-3.85,rg(0xfff4dc));}
 const g=B.finish('the portal\'s works',{label:{lining:'The portal\'s headwall and the fallen lining\'s slabs',conc:'The headwall\'s parapet and wings, the winch\'s footings',rubble:'Rubble; the hut\'s stone; the ice store\'s turf',metal:'The winch\'s frame and the lamp\'s post',paint:'Rope, roofs',white:'The ice store\'s door',glow:'The hooded lamp'}});
 scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=[CX,8,LINE.PORTAL-.6,CX,1,300,LINE.head.well.x+8,LINE.groundAt(LINE.head.well.x+8,LINE.head.well.z)+1,LINE.head.well.z].concat(...LINE.WELLS.map(w=>[w.x+w.r*.7,SEC.crown+3,w.z]));
 return {group:g,tris:B.tris+LAND.tris,land:LAND};})();
