// ---------------------------------------------------------------- salvage (decay level 3)
// Everything a later people could cut, carry and nail up. It must never be
// mistaken for ancient fabric: the ancients built in panelled white metal,
// board-formed concrete and shaped glass, so salvage is corrugated sheet, sawn
// timber, torn tarpaulin and flat scrap — cruder, warmer, and visibly newer
// than the thing it is bolted to.
TEX.corrugate=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const rib=Math.cos(x/128*TAU*10);                     // ~0.8 m corrugations
  let v=150+rib*34;                                     // the profile's own shading
  v+=(fbm(x/9,y/9,3.3,2)-.5)*22;                        // galvanising mottle
  const dent=clamp((fbm(x/17,y/13,7.1,2)-.60)*4,0,1);v-=dent*26;
  const rust=clamp((fbm(x/6,y/40,5.5,3)-.42)*2.6,0,1)*clamp(y/h*1.5,0,1);
  d[i]=lerp(v,116+rust*40,rust);d[i+1]=lerp(v-2,62+rust*20,rust);d[i+2]=lerp(v-6,44,rust);d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.timber=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const bd=Math.floor(y/16);                            // 0.25 m sawn boards
  let v=132+(h3(bd*2.7,0,1.9)-.5)*26;
  v+=(fbm(x/26,y/3,4.8,2)-.5)*30;                       // grain, running along the board
  if(y%16<1)v-=34;                                      // the gap between boards
  d[i]=v;d[i+1]=v*.78;d[i+2]=v*.56;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.tarp=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const weave=((x%3)<1?-1:0)+((y%3)<1?-1:0);
  let v=158+weave*9+(fbm(x/21,y/21,6.4,2)-.5)*38;       // sun-bleached in patches
  d[i]=v*1.02;d[i+1]=v*.86;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.corrugate=new THREE.MeshStandardMaterial({map:TEX.corrugate,color:0xffffff,roughness:.72,metalness:.30,side:DS});
MAT.timber=new THREE.MeshStandardMaterial({map:TEX.timber,color:0xffffff,roughness:.94,metalness:0,side:DS});
MAT.tarp=new THREE.MeshStandardMaterial({map:TEX.tarp,color:0xc8b08a,roughness:.88,metalness:0,side:DS});
kdef('patchSheet',new THREE.PlaneGeometry(1,1),MAT.corrugate);
kdef('patchPlate',new THREE.PlaneGeometry(1,1),MAT.rust);
kdef('patchBoard',new THREE.PlaneGeometry(1,1),MAT.timber);
kdef('patchTarp',new THREE.PlaneGeometry(1,1),MAT.tarp);
kdef('shantyBox',new THREE.BoxGeometry(1,1,1),MAT.corrugate);
kdef('shantyRoof',new THREE.BoxGeometry(1,.09,1),MAT.tarp);
kdef('spipe',new THREE.CylinderGeometry(1,1,1,7),MAT.rust);
kdef('waterButt',new THREE.CylinderGeometry(1,1,1,10),MAT.corrugate);
kdef('planter',new THREE.BoxGeometry(1,1,1),MAT.timber);
kdef('plank',new THREE.BoxGeometry(1,1,1),MAT.timber);

// ---------------------------------------------------------------- FIRELIGHT
// The kit's lit window is CYAN — `litC`, `stripRing`, `MAT.strip` — because
// that is the Ancients' own electric light, and every intact structure in the
// showcase still carries it. Fire is the opposite signal: a later people
// burning things inside a building that has had no power for five thousand
// years. So it gets its own materials, its own kit items, and its own
// InstancedMeshes — which is also what makes the night state a two-line
// visibility toggle instead of a rebuild (see setNight in 92-camera.js).
//
// Everything here is UNLIT (MeshBasicMaterial): a scene light cannot make a
// window brighter than the sunlit wall around it — that is a standing kit-wide
// complaint (see Plymouth in KNOWN_ISSUES) — so the fire has to BE the light
// rather than receive it.
TEX.ember=canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const rad=Math.hypot(x-w/2,y-h/2)/(w/2);
  const a=Math.pow(clamp(1-rad,0,1),2.2)*(.72+.28*(fbm(x/7,y/7,3.7,2)-.5)*2);
  d[i]=255;d[i+1]=178;d[i+2]=96;d[i+3]=clamp(a,0,1)*255;}
 g.putImageData(id,0,0);});
TEX.ember.wrapS=TEX.ember.wrapT=THREE.ClampToEdgeWrapping;
// The flame itself, seen through an opening: hot and pale in the middle, going
// to a deep ember at the edges, mottled so no two windows read the same.
TEX.flame=canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const fy=1-y/h;                                   // hotter low, where the fuel is
  let v=clamp(.30+.85*fy*fy+(fbm(x/9,y/6,5.1,3)-.5)*1.1,0,1);
  d[i]=255*clamp(v*1.25,0,1);d[i+1]=255*clamp(v*v*1.05,0,1);d[i+2]=255*clamp(v*v*v*.8,0,1);d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.flame.wrapS=TEX.flame.wrapT=THREE.ClampToEdgeWrapping;
MAT.flame=new THREE.MeshBasicMaterial({map:TEX.flame,color:0xffffff,side:DS});
MAT.ember=new THREE.MeshBasicMaterial({map:TEX.ember,color:0xffffff,transparent:true,
 blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:DS});
// Three quads crossed about the vertical, like the leaf card: a glow has to
// read from any bearing, and this kit has no billboard. Six triangles.
function crossGeo(){const P=[],N=[],U=[];
 for(let q=0;q<3;q++){const a=q*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
  const V=[[-c,-1,-s],[c,-1,s],[c,1,s],[-c,-1,-s],[c,1,s],[-c,1,-s]];
  const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);N.push(0,1,0);U.push(T[i][0],T[i][1]);}}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));return g;}
kdef('fireWin',new THREE.PlaneGeometry(1,1),MAT.flame);   // the opening, filled with fire
kdef('ember',new THREE.PlaneGeometry(1,1),MAT.ember);     // the spill out of it
kdef('emberB',crossGeo(),MAT.ember);                      // a glow seen from any bearing
const FIREKIT=['fireWin','ember','emberB'];               // what setNight() toggles

// FIRE TERRITORIES over (bay, storey).
//
// A 50% coin flip per cell renders as dither, and dither is exactly what this
// must not be. What has to read is that PARTICULAR PARTS of the building are
// occupied: contiguous blocks of bays and floors, with dark floors and dark
// bays between them, so the elevation says "these four storeys of this side,
// and that stack over there, and nothing in between" — different gangs, each
// holding a piece. So the mask is a handful of seeded rectangles, one per
// gang, frayed at their edges by an fbm so none of them is a clean lit
// rectangle and so a few rooms inside each are dark.
//
// Takes and restores the global PRNG, because it is called once in the middle
// of a builder and must not shift that builder's stream.
function fireTerritories(nBay,nSto,seed,n){const T=[],s0=_seed;reseed(seed);
 for(let i=0;i<n;i++)T.push({b:Math.floor(rng()*nBay),w:Math.round(rr(6,14)),
  y:Math.round(rr(-8,Math.max(1,nSto-6))),h:Math.round(rr(12,34)),k:rr(0,99)});
 _seed=s0;return T;}
function fireBurns(T,nBay,b,s){
 for(const t of T){const db=((b-t.b)%nBay+nBay)%nBay;if(db>=t.w)continue;
  const ds=s-t.y;if(ds<0||ds>=t.h)continue;
  const e=clamp(Math.min(Math.min(db,t.w-1-db)/(t.w*.42),Math.min(ds,t.h-1-ds)/(t.h*.40)),0,1);
  if(fbm(b*.42+t.k,s*.30,t.k,2)<.30+.52*e)return true;}
 return false;}
// THE ONE ENTRY POINT. Three buildings want this (Projects A, D and H) on three
// completely different window grids — A's 32 bays of cell windows, D's 28 bays
// of glazed ribbon, H's 20 slits on four flat faces — and the one thing this kit
// has been bitten by repeatedly is a helper reimplemented privately in two or
// three fragments (stripRing, the canopy blob). So the grid is the CALLER's and
// the mask is shared: hand it your bay and storey counts and a seed, get back a
// predicate. It keeps the tally too, because "roughly 50%" cannot be eyeballed
// on a clustered mask and has to be counted — window._projectFire, which
// verify.py prints in its counters line.
const PROJFIRE={};
window._projectFire=PROJFIRE;
function fireMask(key,nBay,nSto,seed,n){
 const T=fireTerritories(nBay,Math.max(1,nSto),seed,n);
 const rec=PROJFIRE[key]||(PROJFIRE[key]={lit:0,cells:0,pits:0});
 const f=(b,s)=>{const on=fireBurns(T,nBay,b,s);rec.cells++;if(on)rec.lit++;return on;};
 f.raw=(b,s)=>fireBurns(T,nBay,b,s);     // same question, asked off the record
 return f;}
// One burning window: the opening filled with flame, proud of the shell, and an
// additive card of spill over it. `n` is the outward normal, `q` its quaternion.
function fireWindow(p,n,q,w,h){const b=rr(.55,1);
 kput('fireWin',[p[0]+n[0]*.45,p[1],p[2]+n[2]*.45],q,[w,h,1],
  new THREE.Color().setHSL(rr(.035,.075),rr(.85,1),clamp(.30+b*.34,0,.72)));
 kput('ember',[p[0]+n[0]*.85,p[1]+h*.15,p[2]+n[2]*.85],q,[w*4.2,h*4.8,1],
  new THREE.Color().setHSL(rr(.035,.08),1,clamp(.14+b*.34,0,.46)));}
// A fire on a floor: a pool of light on the deck, the flame over it, and a
// halo over that. All three are the radial ember card — a flat quad of the
// FLAME texture laid horizontal read as a glowing rectangle of carpet, which
// is what the first cut of this looked like.
function firePit(key,x,y,z,s){
 if(PROJFIRE[key])PROJFIRE[key].pits++;
 kput('ember',[x,y+.15,z],qEuler(-Math.PI/2,rng()*TAU,0),[s*3.4,s*3.4,1],
  new THREE.Color().setHSL(rr(.04,.075),1,.32));
 kput('emberB',[x,y+s*.7,z],qEuler(0,rng()*TAU,0),[s*1.35,s*1.5,s*1.35],
  new THREE.Color().setHSL(rr(.03,.065),1,.50));
 kput('emberB',[x,y+s*1.5,z],qEuler(0,rng()*TAU,0),[s*2.8,s*2.3,s*2.8],
  new THREE.Color().setHSL(rr(.04,.09),1,.19));}
// FLICKER (towers QA, round 2). The frame hook `tick` (10-core.js) drives one
// shared time uniform; each fire instance takes its own phase from its own
// position (instanceMatrix), so no two windows pulse together and nothing is
// rebuilt. kbake re-attaches onBeforeCompile to its material clones, and the
// uniform object is shared, so one write per frame reaches every clone.
const FIRE_T={value:0};
function fireFlickerOBC(sh){sh.uniforms.uFT=FIRE_T;
 sh.vertexShader='uniform float uFT;\nvarying float vFl;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n#ifdef USE_INSTANCING\n vec3 fP=instanceMatrix[3].xyz;\n#else\n vec3 fP=vec3(0.);\n#endif\n'+
  ' float fPh=dot(fP,vec3(.131,.217,.173));\n vFl=.80+.13*sin(uFT*6.3+fPh)+.07*sin(uFT*15.7+fPh*2.3);');
 sh.fragmentShader='varying float vFl;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=vFl;');}
MAT.flame.onBeforeCompile=fireFlickerOBC;MAT.ember.onBeforeCompile=fireFlickerOBC;
// FIRELIGHT THAT LIGHTS SOMETHING. One PointLight per territory was the
// reason this was never done: every lit material recompiles per light. So a
// Project gets a FEW lights (n, 3 by default), at the centroids of clusters
// of its own fires — its burning windows and pits, taken from the kit items it
// placed since `fireLightMark()` — set a few metres off the facade. They are
// invisible by day, so day views pay nothing; at night the first switch
// compiles one extra program variant per material and every later switch
// reuses it. They flicker with the cards. No rng(): the clustering is
// deterministic and nothing in any builder's stream moves.
const FIRELIGHTS=[];
function fireLightMark(){return[KIT.items.fireWin.length,KIT.items.emberB.length,KOFF.slice()];}
function fireLights(M,n){n=n||3;const P=[];
 for(let i=M[0];i<KIT.items.fireWin.length;i++)P.push(KIT.items.fireWin[i].p);
 for(let i=M[1];i<KIT.items.emberB.length;i+=2)P.push(KIT.items.emberB[i].p);
 if(P.length<n)return;
 // farthest-point seeds, then a few Lloyd steps
 const C=[P[0].slice()];while(C.length<n){let bi=0,bd=-1;for(let i=0;i<P.length;i++){let m=1e18;for(const c of C)m=Math.min(m,(P[i][0]-c[0])**2+(P[i][1]-c[1])**2+(P[i][2]-c[2])**2);if(m>bd){bd=m;bi=i;}}C.push(P[bi].slice());}
 for(let it=0;it<6;it++){const S=C.map(()=>[0,0,0,0]);
  for(const p of P){let bi=0,bd=1e18;C.forEach((c,j)=>{const m=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(m<bd){bd=m;bi=j;}});S[bi][0]+=p[0];S[bi][1]+=p[1];S[bi][2]+=p[2];S[bi][3]++;}
  S.forEach((s,j)=>{if(s[3])C[j]=[s[0]/s[3],s[1]/s[3],s[2]/s[3]];});}
 // A cluster's centroid lies INSIDE a round tower (its windows wrap the
 // shell), so each light goes out along the cluster's mean bearing to the
 // cluster's mean radius, then 16 m beyond it: outside the skin it lights.
 const O=M[2],RR=C.map(()=>[0,0]);
 for(const p of P){let bi=0,bd=1e18;C.forEach((c,j)=>{const m=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(m<bd){bd=m;bi=j;}});RR[bi][0]+=Math.hypot(p[0]-O[0],p[2]-O[2]);RR[bi][1]++;}
 C.forEach((c,j)=>{const dx=c[0]-O[0],dz=c[2]-O[2],l=Math.hypot(dx,dz)||1,rm=(RR[j][1]?RR[j][0]/RR[j][1]:l)+16;
  const L=new THREE.PointLight(0xff7a32,0,190,2);L.position.set(O[0]+dx/l*rm,c[1]+4,O[2]+dz/l*rm);L.visible=false;scene.add(L);
  FIRELIGHTS.push({l:L,ph:j*1.9+c[0]*.01});});}
tick((dt,t)=>{FIRE_T.value=t%1000;const on=!!NIGHT;
 for(const F of FIRELIGHTS){F.l.visible=on;if(on)F.l.intensity=1.7*(.84+.10*Math.sin(t*5.1+F.ph)+.06*Math.sin(t*13.3+F.ph*1.7));}});

// THE REPAIRED PASS.
//
// Runs over a FINISHED structure — the group the builder returned — rather than
// inside the builder, so all 33 types get rehabilitated from one function and
// not one edit each. `faceSamples` walks the group and bakes each mesh's
// transform, so nothing has to be handed over.
//
// Two populations: patches riveted onto the near-vertical faces, and accretion
// standing on anything flat. Every piece goes through the kit, so the whole
// pass costs draw calls in the low tens rather than thousands.
function repairPass(G,d){
 // Scale the dressing to the structure. A fixed count buries a 12 m house under
 // the same amount of salvage it takes to read on a 420 m tower, and the brief
 // is "slightly worn": the ancient form has to stay the thing you see first.
 const bb=new THREE.Box3().setFromObject(G);
 if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min),18,620);
 const nSide=Math.round(clamp(sz*.62,16,340)),nUp=Math.round(clamp(sz*.40,12,240));
 const PATCH=['patchSheet','patchPlate','patchBoard','patchTarp'];
 for(const f of sideFaces(G,nSide)){
  if(rng()<.42)continue;
  const n=f.n,w=rr(2,7.5),h=rr(1.6,5);
  // proud of the shell and a few degrees off the panel grid: salvage is never
  // flush and never square with what it is covering
  const q=qFacing(n).multiply(qEuler(0,0,rr(-.24,.24)));
  kput(PATCH[(rng()*4)|0],[f.p[0]+n[0]*.25,f.p[1]+n[1]*.25,f.p[2]+n[2]*.25],q,[w,h,1],null);
  // a warm lamp by one patch in ten. The ancient cyan strips stay dead — that
  // contrast is the whole point: new light, old building.
  if(rng()<.09)kput('dot',[f.p[0]+n[0]*.6,f.p[1]+n[1]*.6+h*.35,f.p[2]+n[2]*.6],q,[1.2,1.2,1],WARM);}
 for(const f of upFaces(G,nUp,.62)){
  const p=f.p,r=rng();
  if(r<.32){const w=rr(2.5,6.5),hh=rr(2,3.8),dp=rr(2.5,6);const yaw=rng()*TAU;
   kput('shantyBox',[p[0],p[1]+hh/2,p[2]],qEuler(0,yaw,0),[w,hh,dp],null);
   kput('shantyRoof',[p[0],p[1]+hh+.2,p[2]],qEuler(rr(.08,.26),yaw,0),[w*1.3,1,dp*1.3],null);
   if(rng()<.45)kput('spipe',[p[0]+w*.28,p[1]+hh+1.4,p[2]],null,[.28,3,.28],null);}
  else if(r<.50)kput('waterButt',[p[0],p[1]+1.15,p[2]],null,[1.15,2.3,1.15],null);
  else if(r<.73){kput('planter',[p[0],p[1]+.35,p[2]],qEuler(0,rng()*TAU,0),[rr(1.6,4.2),.7,rr(1,2.2)],null);
   for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.3,1.3),p[1]+.95,p[2]+rr(-.9,.9)],null,[.75,.5,.75],new THREE.Color().setHSL(rr(.26,.34),.55,.28));}
  else if(r<.87)kput('plank',[p[0],p[1]+.12,p[2]],qEuler(0,rng()*TAU,0),[rr(2,6),.22,rr(.5,1.3)],null);
  else if(rng()<.5)kput('dot',[p[0],p[1]+1.7,p[2]],qEuler(0,rng()*TAU,0),[1.2,1.2,1],WARM);}}
