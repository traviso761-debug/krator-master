// ================================================================= HOUSES D/E/F
function buildHouses2(scene,gx,gz,d){reseed(9410+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // SPACING. D, E and F sat at x=0, 60 and 130 on a row whose sites are 120
 // apart, so the intact House F stood in the rehabilitated House D. They now sit
 // at 25, 65 and 105 (the presets aim at 65); D moves by its own group and KOFF.
 const DX=25;
 // D — apse house (Arcosanti): concrete quarter-sphere open to +z, glass front wall
 {KOFF=[gx+DX,0,gz];const Dg=new THREE.Group();Dg.position.x=DX;G.add(Dg);REGISTER({name:'House D — apse house ('+STATE(d)+')',x:0,z:0,r:14,h:12});kput(SLABC(d),[0,.3,0],null,[12,.6,12],null);
  const R=9;mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:48,nv:16,hole:(u,y)=>Math.sin(u*TAU)>.05||(d>0&&fbm(u*6,y*.3,150,2)<.3)||(Math.hypot(u-.75,y/R-.5)<.07)}),CONC(d),Dg,0,.6,0);
  mesh(lathe({rFn:y=>R*.94*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:24,nv:8,hole:(u,y)=>Math.sin(u*TAU)>.05}),MAT.dark,Dg,0,.6,0);
  if(d===0)mesh(gridSurface((u,v)=>{const x=(u-.5)*R*1.9;const y=v*R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));return[x,.6+y,0];},20,6,{}),MAT.glass,Dg);
  for(let k=-3;k<=3;k++){const x=k*2.4;const h=R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));kput(d>0?'mullR':'mullW',[x,.6+h/2,0],null,[.6,h,.6],null);}
  // round 2: a bone roll along the apse's open edge, knuckled at five joints
  mesh(domMould(t=>[R*1.005*Math.cos(Math.PI*(1-t)),.6+R*1.005*Math.sin(Math.PI*(1-t)),0],[0,0,1],.42,4,48),CONC(d),Dg);
  kput('archOpen',[3,2.2,.1],qFacing([0,0,1]),[.35,.45,1],null);kput(SLABC(d),[3,.2,8],null,[2.5,.4,2.5],null);
  // ruin: teeth of the glass front left in the bays between the mullions (not the door bay)
  if(d>0)domShards([0,.6,0],qFacing([0,0,1]),[[-6,2.4],[-3.6,2.4],[-1.2,2.4],[1.2,2.4],[6,2.4]],x=>R*.95*Math.sqrt(clamp(1-Math.pow((Math.abs(x)+1.2)/R,2),0,1)),2.4,.5);
  // the transoms the teeth hang from (the front had mullions only, so a tooth
  // at a pane's head hung in mid-air)
  if(d>0)for(let j=1;j<4;j++){const y=j*2.4,w=1.9*R*Math.sqrt(clamp(1-Math.pow(y/(R*.95),2),0,1));kput('mullR',[0,.6+y,0],qEuler(0,0,Math.PI/2),[.4,w,.4],null);}
  kput(BOXC(d),[-7,1.6,3],null,[4,.5,5],null);for(let k=0;k<6;k++){const a=Math.PI+(k+.5)/6*Math.PI;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*4.5,5,Math.sin(a)*4.5],qEuler(0,-a,0),[2,1,1],lit?CYAN:DEAD);}if(d>0){mossOnRing(0,.7,0,9,14,1.2);vinesOnRing(0,7,0,5,6,6);}KOFF=[gx,0,gz];}
 // E — bridge house: a glass box spanning two concrete piers
 {const bx=65;REGISTER({name:'House E — bridge house ('+STATE(d)+')',x:bx,z:0,r:16,h:12});
  for(const s of [-1,1]){mesh(lathe({rFn:y=>2.6*Math.sqrt(1+1.2*Math.pow((y-4)/4,2)),H:8,nu:20,nv:6,hole:holeFn(d*.5,160+s,null,3)}),CONC(d),G,bx+s*9,0,0);}
  // In the ruin the span has failed west of the middle: the floor has broken
  // off the stub still sitting on the west pier and hinged down to the ground,
  // the roof over it has come down beside the house, and the glass box is only
  // the east half. It used to be the intact box with dark glass.
  if(d===0){kput(BOXC(d),[bx,8.3,0],null,[26,.7,8],null);kput(BOXC(d),[bx,12.2,0],null,[27,.7,9],null);}
  else{kput(BOXC(d),[bx+6.5,8.3,0],null,[13,.7,8],null);kput(BOXC(d),[bx+5.5,12.2,0],null,[16,.7,9],null);
   kput(BOXC(d),[bx-9.5,8.3,0],null,[7,.7,8],null);
   const L=Math.hypot(6.5,7.4),an=Math.atan2(7.4,6.5);kput(BOXC(d),[bx-2.75,4.6,.3],qEuler(0,.05,-an),[L,.7,8],null);
   kput(BOXC(d),[bx-8,.9,9],qEuler(.08,.35,-.12),[11,.7,8],null);}
  if(d===0){for(const s of [-1,1])kput('pane',[bx,10.2,s*4],null,[24,3.2,1],null);for(const s of [-1,1])kput('pane',[bx+s*12.5,10.2,0],qEuler(0,Math.PI/2,0),[8,3.2,1],null);}
  else{kput('boxD',[bx+6,10.2,0],null,[11,3,6],null);
   // what is left of the glass box: teeth in the east bays, front and back
   for(const s of [-1,1])domShards([bx+6,8.65,s*4.1],qFacing([0,0,s]),[[-3,5.6],[3,5.6]],()=>3.2,3.2,.6);}
  for(let k=-2;k<=2;k++){if(d>0&&k<0)continue;kput(d>0?'mullR':'mullW',[bx+k*6,10.2,4.1],null,[.5,3.4,.5],null);}
  // stair up the east pier, door at the top
  for(let k=0;k<8;k++){const a=Math.PI/2-(7-k)*.7;kput(BOXC(d),[bx+9+4.5*Math.cos(a),k*1.05+.5,4.5*Math.sin(a)],qEuler(0,-a,0),[3,.4,1.6],null);}kput(BOXC(d),[bx+9,8.7,4.6],null,[3,.4,1.6],null);kput('archOpen',[bx+9,9.9,4.3],qFacing([0,0,1]),[.3,.36,1],null);
  stripRing(bx,11.6,0,3,d,8);if(d>0){mossOnRing(bx,.3,0,10,10,1.2);vinesOnRing(bx+6,12.5,0,6,8,8);}}
 // F — terrace house: three stepped concrete trays into a slope, glass fronts, planters
 {const fx=105;REGISTER({name:'House F — terrace house ('+STATE(d)+')',x:fx,z:0,r:16,h:12});
  mesh(lathe({rFn:y=>16-1.4*y,H:9,nu:6,nv:2}),MAT.rock,G,fx,0,-8);
  for(let t=0;t<3;t++){const y=t*3.6,z=6-t*5,w=16-t*3;
   // in the ruin the top tray has gone: its roof slab has slumped onto the tray
   // below and only a stub of its back wall stands
   if(d>0&&t===2){kput(BOXC(d),[fx+1.5,y+.9,z+1.5],qEuler(.22,.25,.12),[w,.5,7],null);kput('brick',[fx-w/4,y+1,z-3.6],null,[w/2,2,.5],null);continue;}
   kput(BOXC(d),[fx,y+.3,z],null,[w,.6,9],null);kput(BOXC(d),[fx,y+3.4,z-1],null,[w+1,.5,8],null);
   if(d===0)kput('pane',[fx,y+1.9,z+3.8],null,[w-2,2.6,1],null);else{kput('boxD',[fx,y+1.9,z+1],null,[w-3,2.6,5],null);
    domShards([fx,y+.6,z+3.8],qFacing([0,0,1]),[[-(w/4-.75),w/2-2],[w/4-.75,w/2-2]],()=>2.6,2.6,.6);}
   for(let k=-1;k<=1;k++)kput(d>0?'mullR':'mullW',[fx+k*(w/2-1.5),y+1.9,z+3.9],null,[.5,2.8,.5],null);
   kput('brick',[fx,y+1.9,z-3.6],null,[w,2.8,.5],null);for(const s of [-1,1])kput('brick',[fx+s*(w/2-.25),y+1.9,z],null,[.5,2.8,8.4],null);kput(BOXC(d),[fx-w/2+1.5,y+3.9,z+3],null,[3,.8,2],null);
   for(let k=0;k<3;k++)kput('moss',[fx-w/2+1+k*.8,y+4.4,z+3],null,[1,.5,1],new THREE.Color().setHSL(.28,.5,.2));}
  kput('archOpen',[fx+4,1.9,10.6],qFacing([0,0,1]),[.3,.36,1],null);for(let k=0;k<4;k++)kput(BOXC(d),[fx-7,1.2+k*.9,9-k*1.4],null,[2,.3,1.4],null);
  stripRing(fx,3,6,4,d,8);if(d>0){mossOnRing(fx,.6,6,8,14,1.3);}}
 figures(45,14,4,4);KOFF=[0,0,0];return G;}

// ================================================================= OFFICE C — "the Comb" (concrete brise-soleil bar)
function officeC(G,d){const cx=330;REGISTER({name:'Office C — the Comb ('+STATE(d)+')',x:cx,z:0,r:50,h:24});
 const R=60,a0=-.7,a1=.7,NS=4,SH=4.4;
 const cDeck=[],cBrick=[],cDark=[];   // the brise-soleil bar in three meshes, not thirteen
 for(let f=0;f<=NS;f++){const y=f*SH;cDeck.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-14,R+1,v);return[cx+Math.sin(a)*r,y+.3,Math.cos(a)*r-R*.6];},60,2,{hole:d>0?(u,v)=>fbm(u*10,f,1500+f,2)<.15:null}));}
 for(let k=0;k<=30;k++){const a=lerp(a0,a1,k/30);const x=cx+Math.sin(a)*(R+1.5),z=Math.cos(a)*(R+1.5)-R*.6;if(d>0&&rng()<.15)continue;kput(BOXC(d),[x,NS*SH/2,z],qEuler(0,a,0),[1.2,NS*SH+1,3.6],null);}
 for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);kput(BOXC(d),[cx+Math.sin(a)*(R-12),NS*SH/2,Math.cos(a)*(R-12)-R*.6],null,[1.4,NS*SH,1.4],null);}
 for(let f=0;f<NS;f++){const y=f*SH;if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-1.2;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},60,1,{}),MAT.glass,G);
  else cDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-3;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},40,1,{hole:(u,v)=>fbm(u*8,f,1510,2)<.35}));
  cBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-13;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},40,1,{uS:20}));
  for(let k=0;k<8;k++){const a=lerp(a0,a1,(k+.5)/8);const lit=d>0?rng()<.15:true;kput('strip',[cx+Math.sin(a)*(R-7),y+SH-.6,Math.cos(a)*(R-7)-R*.6],qEuler(0,a,0),[8,1,1],lit?CYAN:DEAD);}}
 // end walls: the bar was open along both end elevations, showing four floor
 // slabs in section from the side.
 for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
  cDeck.push(gridSurface((u,v)=>{const r=lerp(R-14,R+1,u);return[cx+Math.sin(a)*r,v*NS*SH+.3,Math.cos(a)*r-R*.6];},8,18,{uS:6,vS:8,hole:d>0?(u,v)=>fbm(u*4+s*3,v*5,1520+s,2)<.25:null}));}
 meshMerged(cDeck,CONC(d),G);meshMerged(cBrick,MAT.brick,G);meshMerged(cDark,MAT.dark,G);
 // roof pergola
 for(let k=0;k<12;k++){const a=lerp(a0,a1,(k+.5)/12);if(d>0&&rng()<.3)continue;beam(BOXC(d),[cx+Math.sin(a)*(R-14),NS*SH+.5,Math.cos(a)*(R-14)-R*.6],[cx+Math.sin(a)*(R+2),NS*SH+3.5,Math.cos(a)*(R+2)-R*.6],1,1.2);}
 kput('archOpen',[cx,3.8,R*.4-1],qFacing([0,0,1]),[.6,.6,1],null);
 if(d>0){mossOnRing(cx,NS*SH+.5,-R*.6,R*.7,20,2);vinesOnRing(cx,NS*SH,-R*.6,R-2,16,12);rubbleRing(cx,.3,-R*.6+R*.9,5,30,30,2);}}


// ---------------------------------------------------------------- v5 materials
MAT.rock=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x8a5a42,roughness:1,side:DS});
MAT.lawn=new THREE.MeshStandardMaterial({color:0x4f7a30,roughness:1,side:DS});
MAT.water=new THREE.MeshStandardMaterial({color:0x2a6a8a,roughness:.15,metalness:.3,transparent:true,opacity:.85,side:DS});
MAT.mud=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x6a4a34,roughness:1,side:DS});
MAT.turf=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x3a5a2a,roughness:1,side:DS});
MAT.turfR=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x2c4a24,roughness:1,side:DS});
MAT.spray=new THREE.MeshStandardMaterial({color:0xdaf0ff,transparent:true,opacity:.75,roughness:.2,side:DS});
MAT.darkGlass=new THREE.MeshStandardMaterial({color:0x0c1418,metalness:.7,roughness:.25,side:DS});
kdef('plateW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('plateR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('darkPane',new THREE.BoxGeometry(1,1,.3),MAT.darkGlass);
kdef('hedge',new THREE.BoxGeometry(1,1,1),MAT.vine);
const PLATE=d=>d>0?'plateR':'plateW';

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
