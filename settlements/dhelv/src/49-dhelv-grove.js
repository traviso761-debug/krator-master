// prefix: dhg
// ================================================================= DHELV: THE SHELF'S OLD GROWTH, STANDARDIZED (the owner: "replace hero trees with 2-3
// standardized trees to cut down on load time, and LOD"). [draw] The hyperjungle's own builder grows a few trees ONCE, alone,
// on a flat stage at the origin (HYPERJUNGLE.make, .grow: biomes/WORLD.md, "trees as variants"), and what it wrote is gathered
// into one mesh per material (a PROTOTYPE); the shelf's forest is those prototypes drawn as instances. Three HERO hypertrees
// (each grown near, lv 2, and as the kit's far impostor, lv 0), scaled to about half the kit's size so the giants stand 80 to
// 140 m over the shelf, a dozen of them; and three SAPLINGS (immature hypertrees, about 1k triangles each) as the canopy round
// them. Instances are cut into DHG.CELL cells (DH_CELLS, 90): a cell's heroes are drawn near within DH_CELLS.treeNear of the
// camera and as impostors beyond. The kit's floor pass (its understory) still runs as the kit does it.
// harvest(), worldMat() and leafHook() are openworld/little-demo/src/84-world-nursery.js's, copied: keep them in step.
const DHG={CELL:200,CELL_FAR:400,SAP_NEAR:300,SEED:7101,HERO:[{sp:3,v:0},{sp:4,v:0},{sp:1,v:0}],SAP:[{sp:0,v:0},{sp:2,v:1},{sp:5,v:2}],HERO_S:[.45,.55],HERO_GAP:230,SAP_GAP:28,
 protos:{},heroes:[],saps:[],groups:[],ms:0,tris:{}};
// ---------------------------------------------------------------- materials for instancing (84-world-nursery.js)
const DHG_WMAT=new Map();
function dhgLeafHook(o){return function(sh){
 sh.uniforms.uWindT=BIO.WIND.t;if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vFlWP;varying float vFlD;\n'+
   (o.aN?'attribute vec3 aN;varying vec3 vFlN;\n':'')+(o.irid?'attribute vec3 aC2;varying vec3 vFlC2;\n':''))
  .replace('#include <project_vertex>',['vec4 mvPosition=vec4(transformed,1.0);float _ph=0.0;vec3 _nr='+(o.aN?'aN':'vec3(0.0,1.0,0.0)')+';',
   '#ifdef USE_INSTANCING','mvPosition=instanceMatrix*mvPosition;_ph=dot(instanceMatrix[3].xyz,vec3(0.131,0.073,0.117));_nr=mat3(instanceMatrix)*_nr;','#endif',
   'float _wg=clamp(position.y/9.0,0.0,1.6);',
   'mvPosition.xyz+=_wg*vec3(sin(uWindT*0.9+_ph)+0.45*sin(uWindT*2.3+_ph*1.7+position.x*0.6),0.25*sin(uWindT*1.6+_ph*0.6),cos(uWindT*0.7+_ph*1.3)+0.45*sin(uWindT*2.9+_ph+position.z*0.6))*'+(o.swayA==null?.06:o.swayA).toFixed(3)+';',
   'vFlWP=(modelMatrix*mvPosition).xyz;'+(o.aN?'vFlN=normalize(_nr);':'')+(o.irid?'vFlC2=aC2;':''),
   'mvPosition=modelViewMatrix*mvPosition;vFlD=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;'].join('\n'));
 if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>',['vec3 _an=aN;','#ifdef USE_INSTANCING','_an=mat3(instanceMatrix)*_an;','#endif','vec3 transformedNormal=normalize(normalMatrix*_an);'].join('\n'));
 else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0));transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform vec3 uSunDir;varying vec3 vFlWP;varying float vFlD;\n'+(o.aN?'varying vec3 vFlN;\n':'')+(o.irid?'varying vec3 vFlC2;\n':''))
  .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a*=1.0+clamp(vFlD/650.0,0.0,1.1);')
  .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
  .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
 if(o.irid)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
  '{vec3 _V=normalize(cameraPosition-vFlWP);vec3 _N=normalize('+(o.aN?'vFlN':'vec3(0.0,1.0,0.0)')+');float _fr=1.0-abs(dot(_N,_V));float _sf=dot(_N,uSunDir)*0.5+0.5;',
  ' float _sh=0.16*sin(uWindT*0.8+dot(vFlWP,vec3(0.045,0.083,0.037)))+0.08*sin(uWindT*1.9+dot(vFlWP,vec3(-0.21,0.13,0.17)));',
  ' float _k=smoothstep(0.22,0.78,_sf*1.15-_fr*0.80+0.30+_sh);diffuseColor.rgb*=mix(vFlC2,vColor,_k)/max(vColor,vec3(0.004));}'].join('\n'));};}
function dhgWorldMat(m){if(DHG_WMAT.has(m))return DHG_WMAT.get(m);let w=null;const b=m.userData&&m.userData.bio;
 if(b&&b.kind==='leaf'){const o=b.opts||{};w=new THREE.MeshLambertMaterial({map:m.map,alphaTest:m.alphaTest||.42,side:THREE.DoubleSide,vertexColors:true});
  w.onBeforeCompile=dhgLeafHook(o);const ck='wleaf|'+(o.aN?1:0)+(o.irid?1:0)+'|'+(o.swayA==null?.06:o.swayA);w.customProgramCacheKey=()=>ck;w.userData.kind='leaf';w.userData.opts=o;}
 else if(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshBasicMaterial){
  w=m.clone();w.vertexColors=true;
  if(m.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile)w.onBeforeCompile=m.onBeforeCompile;
  if(m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey){const k=m.customProgramCacheKey();w.customProgramCacheKey=()=>'w|'+k;}
  w.userData.kind=b?b.kind:'plain';}
 DHG_WMAT.set(m,w);return w;}
/* what the kit wrote into its items and buckets, as one geometry per material (the registry emptied after) */
function dhgHarvest(kn){const R=BIO.kits[kn],G=new Map(),_m=new THREE.Matrix4(),_nm=new THREE.Matrix3(),_v=new THREE.Vector3(),_n=new THREE.Vector3();
 const grp=m=>{const w=dhgWorldMat(m);if(!w)return null;let g=G.get(w);if(!g){g={mat:w,P:[],N:[],U:[],C:[],AN:[],AC:[]};G.set(w,g);}return g;};
 for(const name of R.order){const it=R.items[name];if(!it.count)continue;const def=R.defs[name],g=grp(def.mat);
  if(g){const geo=def.geo,P=geo.attributes.position.array,N=geo.attributes.normal?geo.attributes.normal.array:null,U=geo.attributes.uv?geo.attributes.uv.array:null,VC=geo.attributes.color?geo.attributes.color.array:null,nv=geo.attributes.position.count;
   const hasN=def.attrs&&def.attrs.indexOf('aN')>=0,hasC2=def.attrs&&def.attrs.indexOf('aC2')>=0;
   const IM=it.m.a,IC=it.c.a,INN=it.n.a,IC2=it.c2.a;
   for(let i=0;i<it.count;i++){_m.fromArray(IM,i*16);_nm.getNormalMatrix(_m);
    for(let k=0;k<nv;k++){_v.set(P[k*3],P[k*3+1],P[k*3+2]).applyMatrix4(_m);g.P.push(_v.x,_v.y,_v.z);
     if(N){_n.set(N[k*3],N[k*3+1],N[k*3+2]).applyMatrix3(_nm).normalize();g.N.push(_n.x,_n.y,_n.z);}else g.N.push(0,1,0);
     g.U.push(U?U[k*2]:0,U?U[k*2+1]:0);
     const r=IC[i*3],gg=IC[i*3+1],b=IC[i*3+2];if(VC)g.C.push(r*VC[k*3],gg*VC[k*3+1],b*VC[k*3+2]);else g.C.push(r,gg,b);
     g.AN.push(hasN?INN[i*3]:0,hasN?INN[i*3+1]:1,hasN?INN[i*3+2]:0);g.AC.push(hasC2?IC2[i*3]:r,hasC2?IC2[i*3+1]:gg,hasC2?IC2[i*3+2]:b);}}}
  it.m=new BIO.F32();it.c=new BIO.F32();it.n=new BIO.F32();it.c2=new BIO.F32();for(const a in it.x)it.x[a]=new BIO.F32();it.k=[];it.count=0;}
 for(const fam in R.buckets){const K=R.buckets[fam];if(!K.pos.length)continue;const g=grp(K.mat);
  if(g){const P=K.pos.a,N=K.nor.a,U=K.uv.a,C=K.col.a,n=K.pos.length/3;
   for(let k=0;k<n;k++){g.P.push(P[k*3],P[k*3+1],P[k*3+2]);g.N.push(N[k*3],N[k*3+1],N[k*3+2]);g.U.push(U[k*2],U[k*2+1]);g.C.push(C[k*3],C[k*3+1],C[k*3+2]);
    g.AN.push(N[k*3],N[k*3+1],N[k*3+2]);g.AC.push(C[k*3],C[k*3+1],C[k*3+2]);}}
  K.pos=new BIO.F32();K.nor=new BIO.F32();K.uv=new BIO.F32();K.col=new BIO.F32();K.k=[];K.tris=0;}
 const parts=[];let tris=0,top=0,rad=0;
 for(const g of G.values()){if(!g.P.length)continue;const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(g.P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(g.N,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.U,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(g.C,3));
  if(g.mat.userData.kind==='leaf'){if(g.mat.userData.opts.aN)geo.setAttribute('aN',new THREE.Float32BufferAttribute(g.AN,3));if(g.mat.userData.opts.irid)geo.setAttribute('aC2',new THREE.Float32BufferAttribute(g.AC,3));}
  geo.computeBoundingSphere();tris+=g.P.length/9;
  for(let k=0;k<g.P.length;k+=3){if(g.P[k+1]>top)top=g.P[k+1];const d=Math.hypot(g.P[k],g.P[k+2]);if(d>rad)rad=d;}
  parts.push({geo,mat:g.mat});}
 return {parts,tris,top,radius:rad};}
/* a sapling's far stand-in: a six-sided bole to the crown's foot and a lumpy crown over the bounds of its leaves, in their mean
   colour (about 100 triangles against the grown one's 500). The canopy past DHG.SAP_NEAR of the camera is these */
function dhgSapFar(pr,seed){let lo=1e9,hi=-1e9,rx=0,n=0;const lc=[0,0,0],bc=[0,0,0];let nb=0;
 for(const part of pr.parts){const P=part.geo.attributes.position.array,C=part.geo.attributes.color.array,leaf=part.mat.userData.kind==='leaf';
  for(let k=0;k<P.length;k+=3){if(leaf){lo=Math.min(lo,P[k+1]);hi=Math.max(hi,P[k+1]);rx=Math.max(rx,Math.hypot(P[k],P[k+2]));lc[0]+=C[k];lc[1]+=C[k+1];lc[2]+=C[k+2];n++;}
   else{bc[0]+=C[k];bc[1]+=C[k+1];bc[2]+=C[k+2];nb++;}}}
 if(!n)return null;const L=lc.map(v=>v/n*.62),B=nb?bc.map(v=>v/nb*.55):[.25,.2,.16],pos=[],col=[],R=KRAND.stream(seed);
 const bole=(r,y1)=>{for(let i=0;i<6;i++){const a=i/6*TAU,b=(i+1)/6*TAU,p=[[Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(b)*r,0,Math.sin(b)*r],[Math.cos(b)*r*.6,y1,Math.sin(b)*r*.6],[Math.cos(a)*r*.6,y1,Math.sin(a)*r*.6]];
  for(const q of [p[0],p[2],p[1],p[0],p[3],p[2]]){pos.push(...q);col.push(...B);}}};
 bole(Math.max(.25,pr.H*.025),lo+(hi-lo)*.3);
 const ico=new THREE.IcosahedronGeometry(1,1).toNonIndexed(),IP=ico.attributes.position.array,cy=(lo+hi)/2,ry=(hi-lo)/2,rr=Math.max(rx*.8,ry);
 for(let k=0;k<IP.length;k+=3){const x=IP[k],y=IP[k+1],z=IP[k+2],w=.85+.3*KRAND.h3(Math.round(x*50),Math.round(y*50),Math.round(z*50),seed);
  pos.push(x*rr*w,cy+y*ry*w,z*rr*w);const sh=.75+.3*(y*.5+.5);col.push(L[0]*sh,L[1]*sh,L[2]*sh);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();geo.computeBoundingSphere();
 return {parts:[{geo,mat:DHG.farMat||(DHG.farMat=new THREE.MeshLambertMaterial({vertexColors:true}))}],tris:pos.length/9,top:hi,radius:rr,H:pr.H};}
// ---------------------------------------------------------------- growing: alone, on a flat stage at the origin
function dhgGrow(sp,sapling,lv,seed){const H=BIO.host,keep={t:H.terrainH,m:H.mask,o:H.obstacles,w:H.waterH};H.terrainH=()=>0;H.mask=()=>1;H.obstacles=[];
 try{BIO.fn.reseed(seed);const T=HYPERJUNGLE.make(sp,0,0,0,sapling);HYPERJUNGLE.grow(T,lv);const h=dhgHarvest('hyperjungle');return Object.assign(h,{H:T.H,cr:T.crownR||T.cr||5,rb:T.rb||1});}
 catch(e){reportErr('grove '+sp+'/'+lv+': '+(e.stack||e));return {parts:[],tris:0,H:1,cr:1,rb:1};}
 finally{H.terrainH=keep.t;H.mask=keep.m;H.obstacles=keep.o;H.waterH=keep.w;}}
/* the shelf's forest: the variants grown, placed on its top (DHB.mask: 10 m back from the edge, off the openings), drawn as
   instances in cells. A seeded stream, so the same forest every load */
function dhgGrove(){const t0=performance.now(),R=KRAND.stream(DHG.SEED),P=DHG.protos;DHG.heroes.length=0;DHG.saps.length=0;DHG.tris={};
 DHG.groups.forEach(g=>scene.remove(g));DHG.groups.length=0;
 DHG.HERO.forEach((v,i)=>{P['hn'+i]=dhgGrow(v.sp,false,2,DHG.SEED+i*31);P['hf'+i]=dhgGrow(v.sp,false,0,DHG.SEED+i*31);});
 DHG.SAP.forEach((v,i)=>{P['s'+i]=dhgGrow(v.sp,true,1,DHG.SEED+900+i*17);P['sf'+i]=dhgSapFar(P['s'+i],DHG.SEED+950+i);});
 /* the giants: one to a jittered cell of HERO_GAP, where the shelf lets a tree root */
 const g=DHG.HERO_GAP,B=DHB.G;for(let x=B.x0;x<B.x1;x+=g)for(let z=B.z0;z<B.z1;z+=g){const px=x+R.range(.2,.8)*g,pz=z+R.range(.2,.8)*g;if(DHB.mask(px,pz)<.6)continue;
  const i=Math.floor(R.next()*DHG.HERO.length),s=R.range(DHG.HERO_S[0],DHG.HERO_S[1]);DHG.heroes.push({x:px,z:pz,y:DH.groundY(px,pz)-.4,v:i,s,ry:R.range(0,TAU),rb:P['hn'+i].rb*s,H:P['hn'+i].H*s});}
 /* the canopy: a sapling to a jittered cell of SAP_GAP, clear of a giant's trunk */
 const s=DHG.SAP_GAP;for(let x=B.x0;x<B.x1;x+=s)for(let z=B.z0;z<B.z1;z+=s){const px=x+R.range(.1,.9)*s,pz=z+R.range(.1,.9)*s;if(DHB.mask(px,pz)<.3)continue;
  if(DHG.heroes.some(h=>Math.hypot(h.x-px,h.z-pz)<h.rb*2.2+10))continue;const i=Math.floor(R.next()*DHG.SAP.length);
  const sc=R.range(.8,1.2);DHG.saps.push({x:px,z:pz,y:DH.groundY(px,pz)-.3,v:i,s:sc,ry:R.range(0,TAU),H:P['s'+i].H*sc});}
 /* the kit's floor pass keeps its plants off these boles and stems (its records of trees, as its own pass would leave them) */
 HYPERJUNGLE.TREES.length=0;HYPERJUNGLE.SAPLINGS.length=0;
 DHG.heroes.forEach(h=>HYPERJUNGLE.TREES.push({x:h.x,z:h.z,y0:h.y,sp:DHG.HERO[h.v].sp,H:h.H,rb:h.rb,crownR:P['hn'+h.v].cr*h.s,hero:false}));
 DHG.saps.forEach(t=>HYPERJUNGLE.SAPLINGS.push({x:t.x,z:t.z,y0:t.y,H:t.H,sp:DHG.SAP[t.v].sp,cr:P['s'+t.v].cr*t.s}));
 /* the instances, by cell and level */
 const cells={},put=(key,lod,proto,t,cs)=>{cs=cs||DHG.CELL;const k=Math.floor(t.x/cs)+','+Math.floor(t.z/cs),id=key+'|'+lod+'|'+proto+'|'+k;(cells[id]||(cells[id]={key,lod,proto,k,list:[]})).list.push(t);};
 DHG.heroes.forEach(h=>{put('h','near','hn'+h.v,h);put('h','far','hf'+h.v,h,DHG.CELL_FAR);});DHG.saps.forEach(t=>{put('s','snear','s'+t.v,t);put('s','sfar','sf'+t.v,t,DHG.CELL_FAR);});
 const M=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),TC=new THREE.Color();
 for(const id in cells){const C=cells[id],pr=P[C.proto];if(!pr||!pr.parts.length)continue;const grp=new THREE.Group();grp.userData.cell='grove '+id;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9,tris=0;
  /* each cell its own geometry over the prototype's attributes, its bounds the cell's spread (three r128 culls an instanced
     mesh by its geometry's sphere) */
  for(const t of C.list){x0=Math.min(x0,t.x);x1=Math.max(x1,t.x);z0=Math.min(z0,t.z);z1=Math.max(z1,t.z);y0=Math.min(y0,t.y);y1=Math.max(y1,t.y+pr.top*t.s);}
  const pad=pr.radius*1.25,sph=new THREE.Box3(new THREE.Vector3(x0-pad,y0-2,z0-pad),new THREE.Vector3(x1+pad,y1+2,z1+pad)).getBoundingSphere(new THREE.Sphere());
  for(const part of pr.parts){const cg=new THREE.BufferGeometry();for(const a in part.geo.attributes)cg.setAttribute(a,part.geo.attributes[a]);cg.boundingSphere=sph;
   const im=new THREE.InstancedMesh(cg,part.mat,C.list.length);
   C.list.forEach((t,j)=>{M.compose(new THREE.Vector3(t.x,t.y,t.z),q.setFromAxisAngle(Y,t.ry),new THREE.Vector3(t.s,t.s,t.s));im.setMatrixAt(j,M);
    const h=KRAND.h3(Math.round(t.x*10),0,Math.round(t.z*10),DHG.SEED),k=.88+.2*h;im.setColorAt(j,TC.setRGB(k*(.97+.06*h),k,k*(1.03-.06*h)));});   /* a tint each, so the same three trees do not read as clones */
   im.castShadow=C.lod==='near'||C.lod==='snear';im.receiveShadow=true;im.frustumCulled=true;im.userData.biome=true;grp.add(im);tris+=part.geo.attributes.position.count/3*C.list.length;}
  scene.add(grp);DHG.groups.push(grp);const c=new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),r=Math.hypot(x1-x0,y1-y0,z1-z0)/2+pr.radius*DHG.HERO_S[1];
  DH_CELLS.list.push({k:'grove '+id,g:grp,c,r,under:false,bio:true,lod:C.lod,tris});DHG.tris[C.lod||'sap']=(DHG.tris[C.lod||'sap']||0)+tris;}
 DHG.ms=Math.round(performance.now()-t0);
 return {heroes:DHG.heroes.length,saplings:DHG.saps.length,ms:DHG.ms,tris:DHG.tris,protoTris:Object.fromEntries(Object.entries(P).map(e=>[e[0],Math.round(e[1].tris)]))};}
