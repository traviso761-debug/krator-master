// ================================================================= THE LIGHTHOUSE ISLAND
// Skyscraper J (the Whorl, 89l-sky-j.js) re-proportioned as a lighthouse and
// set on a rocky island in its own sea. The tower keeps the Whorl's grammar —
// stacked undulating floor plates, each turned a little from the one below,
// bound by swept ribs that wrap diagonally round it and pinch together and
// part — but slimmer (a 21 m shaft tapering to 13 m) and 234 m tall rather
// than 436. Where the Whorl's ribs closed over a needle spire, these ribs
// carry on past a broad gallery and wrap the LANTERN in a spiralling cage that
// closes over a copper dome and a vent ball. Two bands of floor plates are
// dressed in red stone as a daymark, and a double-helix slot of glazing winds
// up the solid core: the stair.
//
// The island: ~300 m across, cliffs all round but for a cove on its south side
// (toward the row cameras) where a ravine runs down to a beach, a harbour mole,
// a stone jetty, a boathouse; skerries offshore. The kit has no water, so the
// builder makes its own SEA: an opaque surface at WL=2.5 m in a basin whose
// rim is a sand berm grading back into the red plain. Adjacent lighthouse
// sites share one sea: each builder only builds its own Voronoi cell of the
// row's union of basins, so the three sites at -320/0/+320 read as one channel
// with three islands, not three overlapping ponds.
//
// THE BEACON is the first moving thing in this kit: two long additive beams
// swept round by the frame hook in 10-core.js (`tick`). Night only. When the
// camera jumps to a preset the beams are re-aimed at LH_AIM off the line to
// the camera, so a single-frame screenshot always shows them the same way.
//
// Decay: 0 intact, lit. 1 ruined — lantern smashed and dark, lens in shards,
// ribs snapped, plates gone, the island overgrown, a steamer wrecked on a
// skerry. 2 toppled — broken at 88 m, the upper tower lies along the island,
// broken again at the cliff edge, and its head has slid over into the sea.
// 3 rehabilitated — the level-1 fabric at HOLES=.55, standing; the lantern is
// relit with a FIRE BASKET on the gallery (FIREKIT, so it burns at night) and
// repairPass dresses the tower and lodges (the island and sea sit in a sibling
// group, so it does not put shanties on the waves).
//
// Seeds: reseed(9790+d). Prefix LH/lh. The Whorl's helpers (sjGrid, sjSweep,
// sjPlate, SJ_PT, SJ_PM) and its materials are called, not copied.

// ------------------------------------------------------------- materials
function lhRockTex(){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const st=Math.sin(y/7+fbm(x/40,y/40,21,2)*6);                 // strata
  let v=178+(fbm(x/38,y/38,22,3)-.5)*70+(fbm(x/5,y/5,23,2)-.5)*44+st*9;
  if(fbm(x/11,y/3,24,2)<.3)v-=38;                                // cracks along the bedding
  D[i]=v;D[i+1]=v*.98;D[i+2]=v*.95;D[i+3]=255;}
 g.putImageData(id,0,0);});}
function lhWaterTex(){return canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const cr=Math.abs(Math.sin((x+18*fbm(x/40,y/40,31,2))/9+y/23))+Math.abs(Math.sin((y+14*fbm(y/30,x/30,32,2))/7-x/41));
  const v=212+(fbm(x/24,y/10,33,3)-.5)*30+(cr>1.7?10:0);         // chop, and the glints on its crests
  D[i]=v;D[i+1]=v;D[i+2]=v;D[i+3]=255;}
 g.putImageData(id,0,0);});}
// a beam: bright along its axis, soft across it, fading along its length
// (canvas row 0 is v=1, the far end, because of flipY)
function lhBeamTex(){return canvasTex(32,128,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=1-(y+.5)/h;
  const k=Math.exp(-Math.pow((u-.5)/.2,2))*Math.pow(1-v,1.4)*(.75+.25*Math.exp(-v*14));
  D[i]=255*k;D[i+1]=236*k;D[i+2]=190*k;D[i+3]=255;}
 g.putImageData(id,0,0);});}
function lhGlowTex(){return canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,r=Math.hypot(x+.5-w/2,y+.5-h/2)/(w/2);
  const k=Math.pow(clamp(1-r,0,1),2.2);D[i]=255*k;D[i+1]=232*k;D[i+2]=176*k;D[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.lhRock=lhRockTex();TEX.lhWater=lhWaterTex();TEX.lhBeam=lhBeamTex();TEX.lhGlow=lhGlowTex();
TEX.lhBeam.wrapS=TEX.lhBeam.wrapT=TEX.lhGlow.wrapS=TEX.lhGlow.wrapT=THREE.ClampToEdgeWrapping;
// polygonOffset: the berm's foot runs down to the plain at y=0 and would
// z-fight the ground plane (-.05) at distance into a 4 m sawtooth
MAT.lhIsle=new THREE.MeshStandardMaterial({map:TEX.lhRock,vertexColors:true,color:0xffffff,roughness:1,metalness:0,side:DS,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
// Lambert, not standard: any GGX sea (tried .2 and .5) mirrors the fill light
// as a white blaze across the cove at grazing angles, which read as a glow
MAT.lhSea=new THREE.MeshLambertMaterial({map:TEX.lhWater,vertexColors:true,color:0xffffff,side:DS});
// the daymark: the Whorl's laminated stone, dyed red
MAT.lhBand=new THREE.MeshStandardMaterial({map:TEX.sjStone,roughnessMap:TEX.concreteRM,color:0xc86a52,roughness:.62,metalness:.06,side:DS});
MAT.lhBandR=new THREE.MeshStandardMaterial({map:TEX.sjStoneR,roughnessMap:TEX.concreteRM,color:0xc08070,roughness:1,metalness:0,side:DS});
MAT.lhLens=new THREE.MeshStandardMaterial({color:0xe6f4e0,emissive:0xffe6b0,emissiveIntensity:.25,transparent:true,opacity:.72,roughness:.05,metalness:.1,side:DS,depthWrite:false});
MAT.lhBeam=new THREE.MeshBasicMaterial({map:TEX.lhBeam,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:DS});
MAT.lhGlow=new THREE.MeshBasicMaterial({map:TEX.lhGlow,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:DS});
// hulls: painted steel intact, rust as a wreck
MAT.lhHull=new THREE.MeshStandardMaterial({map:TEX.panel,color:0xe8e2d6,roughness:.7,metalness:.1,side:DS});

// ------------------------------------------------------------- the beacon
// Beams along +x from the lamp: three quads crossed about the axis, widening
// from w0 to w1 over length L. Reads as a shaft of light from any bearing.
function lhBeamGeo(L,w0,w1){const P=[],U=[];
 for(let q=0;q<3;q++){const a=q*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
  const V=[[0,-c*w0,-s*w0,0,0],[0,c*w0,s*w0,1,0],[L,c*w1,s*w1,1,1],[0,-c*w0,-s*w0,0,0],[L,c*w1,s*w1,1,1],[L,-c*w1,-s*w1,0,1]];
  for(const v of V){P.push(v[0],v[1],v[2]);U.push(v[3],v[4]);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 g.computeVertexNormals();return g;}
const LH_BEACONS=[];                // {g, glow, x, z, a}: one per lit lighthouse
const LH_W=TAU/14;                  // one sweep every 14 s
const LH_AIM=.72;                   // on a preset, the beam points this far off the line to the camera
let LH_CAMP=null,LH_TICKING=false;
function lhTick(dt){if(!LH_BEACONS.length||typeof camera==='undefined')return;
 const c=camera.position,jump=!LH_CAMP||LH_CAMP.distanceToSquared(c)>250*250;
 if(!LH_CAMP)LH_CAMP=c.clone();else LH_CAMP.copy(c);
 for(const b of LH_BEACONS){
  if(jump)b.a=Math.atan2(c.z-b.z,c.x-b.x)+LH_AIM;else b.a+=LH_W*dt;
  b.g.rotation.y=-b.a;              // the group's +x points along bearing b.a
  b.g.visible=b.glow.visible=!!NIGHT;}}
function lhLensOn(m){if(m)m.onBeforeRender=()=>{MAT.lhLens.emissiveIntensity=NIGHT?2.2:.25;};}

// ------------------------------------------------------------- hulls
// A hull from u0 to u1 of its length (0 stern transom, 1 bow): the section runs
// gunwale to keel to gunwale. `sink` is where the waterline would be.
function lhHull(L,B,D,u0,u1,hole){
 const bw=u=>B/2*Math.pow(Math.max(0,Math.sin(Math.PI*(.13+.87*u))),.55),kd=u=>D*(.55+.45*Math.pow(Math.sin(Math.PI*(.1+.9*u)),.5));
 return sjGrid((u,v)=>{const s=u0+(u1-u0)*u,a=Math.PI*v;return[(s-.5)*L,-kd(s)*Math.pow(Math.sin(a),.8)+.16*D*Math.pow(2*s-1,2),bw(s)*Math.cos(a)];},
  Math.max(4,Math.round(24*(u1-u0))),8,(u,v,p)=>[(u0+(u1-u0)*u)*L/8,v*B/8],hole);}
function lhDeck(L,B,D,u0,u1,hole){
 const bw=u=>B/2*Math.pow(Math.max(0,Math.sin(Math.PI*(.13+.87*u))),.55);
 return sjGrid((u,v)=>{const s=u0+(u1-u0)*u;return[(s-.5)*L,-.12*D+.16*D*Math.pow(2*s-1,2),bw(s)*(v*2-1)*.97];},
  Math.max(3,Math.round(16*(u1-u0))),2,(u,v)=>[(u0+(u1-u0)*u)*L/8,v*B/8],hole);}

// What the presets need: filled per decay by the builder.
const LH_SITE={};

function buildLighthouse(scene,gx,gz,d){reseed(9790+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // the island and its sea: a sibling of G, so repairPass dresses the buildings
 // and not the waves
 const I=new THREE.Group();I.position.set(gx,0,gz);scene.add(I);
 const dd=d>0?1:0,HO=dd*HOLES;
 const STONE=dd?MAT.sjStoneR:MAT.sjStone,BAND=dd?MAT.lhBandR:MAT.lhBand,WINM=dd?MAT.sjWinR:MAT.sjWin,PAVE=dd?MAT.sjPaveR:MAT.sjPave;
 const COPPER=MAT.verdigris;
 // ============================================================ THE ISLAND
 const WL=2.5,RS=270,YK=30,TH_C=Math.PI/2;           // sea level, basin radius, knoll, cove bearing (+z)
 const dA=(a,b)=>{let x=(a-b)%TAU;if(x>Math.PI)x-=TAU;if(x<-Math.PI)x+=TAU;return x;};
 const R0=th=>130*(1+.085*Math.cos(3*th+.7)+.06*Math.cos(5*th+2.1)+.03*Math.cos(9*th+.4));
 const cb=th=>Math.exp(-Math.pow(dA(th,TH_C)/.4,2));
 const shoreR=th=>R0(th)-58*cb(th);
 // the row's other lighthouse sites share this sea
 let SITES=[[0,0]];
 if(typeof ROWS!=='undefined'&&ROWS.lighthouse&&typeof SITEX==='function'){const R=ROWS.lighthouse;
  const ds=R.ds||(typeof DECAYS!=='undefined'?DECAYS:[0,1,2]);
  SITES=ds.filter(k=>(k!==2||R.t)&&(k!==4||R.j!=null)).map(k=>[SITEX(R,k)-gx,R.z-gz]);
  if(!SITES.some(s=>Math.abs(s[0])<1&&Math.abs(s[1])<1))SITES.push([0,0]);}
 const qB=(x,z)=>{let m=1e9;for(const s of SITES)m=Math.min(m,Math.hypot(x-s[0],z-s[1]));return m-RS;};
 // my Voronoi cell of the row (sites on one z): x from half-way to each neighbour
 let xL=-RS-60,xR=RS+60;
 for(const s of SITES){if(Math.abs(s[1])>1||Math.abs(s[0])<1)continue;if(s[0]<0)xL=Math.max(xL,s[0]/2);else xR=Math.min(xR,s[0]/2);}
 const zL=-RS-60,zR=RS+60;
 // skerries
 const ROCKS=[];for(let k=0;k<9;k++){let th=rr(0,TAU);if(Math.abs(dA(th,TH_C))<.6)th+=1.4;ROCKS.push([th,shoreR(th)+rr(12,48),rr(5,13),rr(2.5,9)]);}
 ROCKS.forEach(r=>{r.push(r[1]*Math.cos(r[0]),r[1]*Math.sin(r[0]));});
 for(let k=ROCKS.length-1;k>=0;k--)if(ROCKS[k][4]<xL+ROCKS[k][2]+4||ROCKS[k][4]>xR-ROCKS[k][2]-4)ROCKS.splice(k,1);   // keep them in my cell
 // the toppled tower's line, decided before the ground so the ground can take its trench
 const FANG=rr(-.35,.35);                             // falls east, away from the cove
 const top=(x,z)=>21+6*fbm(x/80+3,z/80+1,11,3)+2.2*(fbm(x/13,z/13,12,2)-.5);
 const islH=(x,z)=>{const r=Math.hypot(x,z),th=Math.atan2(z,x),c=cb(th);
  const sR=shoreR(th)+10*(fbm(x/26,z/26,13,2)-.5)*(1-c*.8),s=r-sR,tp=top(x,z);
  let h;
  if(s>=0)h=WL-.9-s*lerp(.35,.12,c);                 // off the cliff foot; the cove shelves gently
  else{const ramp=lerp(15,56,c),u=clamp(-s/ramp,0,1);
   const cliff=clamp((u-.03)/.42,0,1),slope=u*u*(3-2*u),f=lerp(Math.pow(cliff,.75),slope,c);
   h=lerp(WL-.9,tp,f);
   if(c<.5&&u>.04&&u<.5)h+=3*(fbm(x/7,z/7,14,2)-.5);}  // a broken cliff face
  // the knoll the tower stands on
  const kn=clamp((r-44)/22,0,1);h=lerp(YK,h,kn*kn*(3-2*kn));
  for(const k of ROCKS){const dr=Math.hypot(x-k[4],z-k[5])/k[2];if(dr<1)h=Math.max(h,WL-1+(k[3]+1)*Math.pow(1-dr*dr,.5)+1.5*(fbm(x/4,z/4,15,1)-.5));}
  return h;};
 // pads the buildings stand on (y from the bare ground at their centre)
 const PADS=[[-46,12,15],[46,30,10],[-16,78,9]].map(p=>p.concat([Math.max(WL+1.2,islH(p[0],p[1]))]));
 const PATH=[];for(let k=0;k<=22;k++){const t=k/22,z=40+t*36;PATH.push([7*Math.sin(t*3.1)-3*t,z]);}
 // the fallen tower (d=2): the trench it lies in, a straight line down from the knoll
 const FALL={};
 if(d===2){const Rsh=shoreR(FANG);FALL.D0=26;FALL.DE=Rsh-17;FALL.yE=Math.min(top(Math.cos(FANG)*FALL.DE,Math.sin(FANG)*FALL.DE),YK-2);}
 const landH=(x,z)=>{let h=islH(x,z);
  for(const p of PADS){const dr=Math.hypot(x-p[0],z-p[1]);if(dr<p[2]+10){const w=clamp((p[2]+10-dr)/10,0,1);h=lerp(h,p[3],w*w*(3-2*w));}}
  if(d===2){const ax=Math.cos(FANG),az=Math.sin(FANG),s=x*ax+z*az,o=Math.abs(-x*az+z*ax);
   if(s>FALL.D0-10&&s<FALL.DE+4&&o<30){const t=clamp((s-FALL.D0)/(FALL.DE-FALL.D0),0,1),y=lerp(YK,FALL.yE,t)-1.6,w=clamp((30-o)/12,0,1)*clamp((FALL.DE+4-s)/6,0,1);h=lerp(h,Math.min(h,y),w);}}
  return h;};
 // the berm: the basin's sand rim, grading back into the plain
 const bermH=q=>q<-45?-99:q<0?lerp(WL-1.2,WL+1.5,Math.pow((q+45)/45,1.6)):q<10?WL+1.5+.5*Math.sin(q/10*Math.PI/2):lerp(WL+2,0,Math.pow(clamp((q-10)/28,0,1),.8));   // 0 at q=38 (QE below)
 const H=(x,z)=>Math.max(landH(x,z),bermH(qB(x,z)));
 // ---- the ground mesh: my cell, 4 m, minus what is under the sea or is plain
 {const STEP=4,nx=Math.ceil((xR-xL)/STEP),nz=Math.ceil((zR-zL)/STEP),pos=[],col=[],uv=[],idx=[],hs=[],qs=[];
  // past the berm's foot a vertex is pulled onto the foot circle, so the kept
  // quads end on a smooth ring at y=0 instead of a 4 m staircase
  const QE=38;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let x=xL+(xR-xL)*i/nx,z=zL+(zR-zL)*j/nz;const q=qB(x,z);
   if(q>QE){let b=SITES[0],bd=1e9;for(const s of SITES){const e=Math.hypot(x-s[0],z-s[1]);if(e<bd){bd=e;b=s;}}const k=(RS+QE)/bd;x=b[0]+(x-b[0])*k;z=b[1]+(z-b[1])*k;}
   const h=H(x,z);pos.push(x,h,z);uv.push((x+z)*.08,h/9+(x-z)*.04);hs.push(h);qs.push(q);}
  const C=nx+1;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*C+i,b=a+1,c=a+C,e=c+1,m=Math.max(hs[a],hs[b],hs[c],hs[e]);
   if(m<WL-.7)continue;                                              // under the sea: never seen
   if(Math.min(qs[a],qs[b],qs[c],qs[e])>QE)continue;                  // the plain itself
   idx.push(a,c,b,b,c,e);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  const N=g.attributes.normal.array,cc=new THREE.Color();
  const SAND=new THREE.Color(0xcdb48c),SOIL=new THREE.Color(0xd4765a),ROCK=new THREE.Color(dd?0x77706a:0x8d867c),ROCK2=new THREE.Color(0x5e554c),
   GRASS=new THREE.Color(dd?0x55702f:0x7c8f4c),DRY=new THREE.Color(dd?0x6b7a38:0xa39a62);
  for(let v=0;v<hs.length;v++){const x=pos[v*3],z=pos[v*3+2],h=hs[v],q=qs[v],ny=N[v*3+1],n1=fbm(x/30,z/30,16,2),n2=fbm(x/8,z/8,17,1);
   if(landH(x,z)>=bermH(q)-.01&&q<-8){                              // the island
    if(ny<.72||h<WL+1.6&&cb(Math.atan2(z,x))<.4){cc.copy(ROCK).lerp(ROCK2,clamp((.72-ny)*1.5+(n2-.5),0,1)).multiplyScalar(.84+.16*Math.sin(h*1.1+n1*5));}   // bedding in the cliff
    else if(h<WL+3.5)cc.copy(SAND).lerp(ROCK,clamp((n2-.4)*2,0,.6));
    else cc.copy(GRASS).lerp(DRY,clamp(n1*1.6-.4,0,1)).lerp(ROCK,clamp((.86-ny)*4,0,1));}
   else cc.copy(SAND).lerp(SOIL,clamp((q-5)/14,0,1)).multiplyScalar(.92+.16*n2);   // soil well before the foot, where it z-fights the plain   // the berm into the plain
   col.push(cc.r,cc.g,cc.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  mesh(g,MAT.lhIsle,I);
  var ISLE=g;}
 // ---- the sea: my cell, 10 m, coloured by the depth it would have
 {const STEP=10,nx=Math.ceil((xR-xL)/STEP),nz=Math.ceil((zR-zL)/STEP),pos=[],col=[],uv=[],idx=[],ok=[];
  const DEEP=new THREE.Color(0x1f4c5c),SHAL=new THREE.Color(0x3f8e88),FOAM=new THREE.Color(0xcfe2d8),cc=new THREE.Color();
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=xL+(xR-xL)*i/nx,z=zL+(zR-zL)*j/nz,q=qB(x,z),h=Math.max(islH(x,z),bermH(q)),dep=WL-h;
   pos.push(x,WL,z);uv.push(x/40,z/40);
   ok.push(q<6&&h<WL+3);
   cc.copy(DEEP).lerp(SHAL,clamp(1-dep/7,0,1)).lerp(FOAM,clamp(1-dep/1.1,0,1)*.7);col.push(cc.r,cc.g,cc.b);}
  const C=nx+1;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*C+i,b=a+1,c=a+C,e=c+1;if(ok[a]||ok[b]||ok[c]||ok[e])idx.push(a,c,b,b,c,e);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();mesh(g,MAT.lhSea,I);}
 // ---- boulders at the cliff foot and on the skerries
 for(let k=0;k<150;k++){const th=rng()*TAU;if(cb(th)>.5)continue;const r=shoreR(th)+rr(-2,9),x=r*Math.cos(th),z=r*Math.sin(th),s=rr(1.2,4.5);
  kput('rubble',[x,clamp(islH(x,z),WL-.8,WL+3)+s*.3,z],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.8,1.5),s*rr(.6,1),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.06,.1),rr(.05,.18),rr(.3,.45)));}
 // ---- the harbour: a mole across the cove mouth, the jetty, the path
 const isl=[];                                        // stone on the island group
 // (it roots on the east side of the cove and curls west, leaving the entrance on the west)
 const RM=shoreR(TH_C)+54,M0=TH_C-.55,molePts=[];
 for(let k=0;k<=26;k++){const t=k/26,th=M0+.62*t,r=lerp(shoreR(M0)-5,RM,clamp(t/.35,0,1))+5*Math.sin(t*Math.PI);molePts.push([r*Math.cos(th),WL+.5,r*Math.sin(th)]);}
 isl.push(sjSweep(molePts,molePts.map(()=>4.6),molePts.map(()=>2.9),()=>[0,1,0],true,true));
 const mHead=molePts[molePts.length-1];
 // the jetty, out from the beach along the cove axis
 const JA=shoreR(TH_C)-6,JB=shoreR(TH_C)+44,jp=[];for(let k=0;k<=6;k++){const r=lerp(JA,JB,k/6);jp.push([3,WL+.7,r]);}
 isl.push(sjSweep(jp,jp.map(()=>3.6),jp.map(()=>1.8),()=>[0,1,0],true,true));
 for(let k=0;k<6;k++){if(dd&&rng()<.3*HO)continue;const r=lerp(JA+10,JB-2,k/5);for(const sx of[-.3,6.3])kput(dd?'postR':'postW',[sx,WL+3,r],null,[.35,1.2,.35],null);}
 // the path from the beach up the ravine to the knoll: flagstones on the ground
 const pave=[sjGrid((u,v)=>{const f=u*(PATH.length-1),i0=Math.min(PATH.length-2,Math.floor(f)),t=f-i0,a=PATH[i0],b=PATH[i0+1];
  const x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),nx=-(b[1]-a[1]),nz=b[0]-a[0],L=Math.hypot(nx,nz),w=(v-.5)*4.4;
  const px=x+nx/L*w,pz=z+nz/L*w;return[px,landH(px,pz)+.3,pz];},66,2,(u,v)=>[u*64/8*4,v*.55],dd?(u,v)=>fbm(u*30,v*3,41,2)<.45*HO:null)];
 // the knoll: paved round the tower
 pave.push(sjGrid((u,v)=>{const th=u*TAU,r=6+v*38;return[r*Math.cos(th),YK+.3,r*Math.sin(th)];},72,3,(u,v)=>[u*30,v*5],dd?(u,v)=>fbm(u*14,v*4,42,2)<.5*HO:null));
 pave.push(sjGrid((u,v)=>{const th=u*TAU;return[44*Math.cos(th),YK+.3-v*.6,44*Math.sin(th)];},72,1,(u,v)=>[u*30,v*.1]));
 // ---- boats at the jetty (intact and rehabilitated), sunk (ruined)
 const hulls=[],decks=[];
 const boat=(x,z,yaw,L,B,Dp,roll,y)=>{const M=new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(x,y,z)).multiply(new THREE.Matrix4().makeRotationX(roll));
  hulls.push(lhHull(L,B,Dp,0,1,null).applyMatrix4(M));decks.push(lhDeck(L,B,Dp,0,1,null).applyMatrix4(M));};
 if(d!==1&&d!==2){boat(-5.5,JB-14,Math.PI/2+.05,11,3.6,1.8,.03,WL+.9);boat(11.5,JB-26,Math.PI/2-.08,9,3,1.5,-.04,WL+.8);}
 else boat(-9,JB-8,Math.PI/2+.4,11,3.6,1.8,.5,WL-.6);
 // ---- the wreck (ruined): a steamer broken on the western skerry
 let WRECK=null;
 if(d===1){const wk=ROCKS.reduce((a,b)=>Math.abs(dA(b[0],Math.PI))<Math.abs(dA(a[0],Math.PI))?b:a),wx=wk[4],wz=wk[5],yaw=wk[0]+Math.PI/2+rr(-.3,.3);
  const WH=(u,v)=>fbm(u*9,v*3,43,2)<.33;
  const bow=new THREE.Matrix4().makeTranslation(wx,WL+2.2,wz).multiply(new THREE.Matrix4().makeRotationY(-yaw)).multiply(new THREE.Matrix4().makeRotationX(.34)).multiply(new THREE.Matrix4().makeRotationZ(.06));
  const stn=new THREE.Matrix4().makeTranslation(wx-Math.cos(yaw)*9,WL+.6,wz-Math.sin(yaw)*9).multiply(new THREE.Matrix4().makeRotationY(-yaw+.35)).multiply(new THREE.Matrix4().makeRotationX(-.22)).multiply(new THREE.Matrix4().makeRotationZ(-.09));
  const wr=[lhHull(52,11,7,.55,1,WH).applyMatrix4(bow),lhDeck(52,11,7,.55,1,WH).applyMatrix4(bow),lhHull(52,11,7,0,.5,WH).applyMatrix4(stn),lhDeck(52,11,7,0,.5,WH).applyMatrix4(stn)];
  meshMerged(wr,MAT.rust,I);
  // the bridge house and a snapped mast on the stern piece
  const bp=new THREE.Vector3(-8,3.2,0).applyMatrix4(stn);kput('boxR',[bp.x,bp.y,bp.z],qEuler(-.22,-yaw+.35,-.09),[9,6.5,8],null);
  const mp=new THREE.Vector3(18,0,0).applyMatrix4(bow);kput('postR',[mp.x,mp.y+7,mp.z],qEuler(.5,-yaw,.3),[.5,16,.5],null);
  rubbleRing(wx,WL-.4,wz,4,26,26,2.2);
  WRECK={x:wx,z:wz};REGISTER({name:'Lighthouse island — the wreck',x:wx,z:wz,r:30,h:24});}
 // ============================================================ THE TOWER
 const BS=5.4,YB=YK+2*BS,YS0=YB+5.2,HS=4.6,NP=35,YTOP=YS0+(NP-1)*HS;
 const LR=9.5,YL0=YTOP+.8,YL1=YTOP+15,YAP=YL1+10.5,YLP=YTOP+7.8,CUT=YK+58;
 const Et=y=>{const t=clamp((y-YS0)/(YTOP-YS0),0,1);return 13+6.5*Math.pow(1-t,1.2)+1.4*Math.sin(Math.PI*Math.pow(t,.8))+8*Math.exp(-Math.max(0,y-YB)/15)+4.5*Math.exp(-Math.pow((t-.99)/.05,2));};
 const phi=y=>(y-YS0)/HS*.1,psi=y=>1.3-(y-YS0)/HS*.045;
 const Rc=y=>{const u=clamp((y-YTOP)/(YAP-YTOP),0,1);if(u<.62){const s=clamp(u/.3,0,1);return lerp(Et(YTOP)+1,12.3,s*s*(3-2*s));}return 12.3*Math.sqrt(Math.max(0,1-Math.pow((u-.62)/.38,2)))+.5;};
 const Rb=th=>30*(1+.1*Math.cos(2*th)+.05*Math.cos(3*th+1));
 const bal=(th,s)=>Math.max(.8,2.8+1.8*Math.sin(2*th+s*1.3)+1*Math.sin(5*th-s*.8));
 // RIBS: six, a turn and a quarter up the shaft and on round the lantern
 const NR=6,YF=YB+42,KT=TAU*1.25/(YTOP-YS0),AW=Math.PI/NR*.85;
 const fade=y=>clamp((YTOP-y)/24,0,1);
 const ribTh=(i,y)=>{const a=TAU*(y-YS0)/46+Math.PI*i+.5*Math.sin(y/37+i*1.7),f=fade(y);
  const A=AW*(y<YB?.35:y<YF?lerp(.35,1,(y-YB)/(YF-YB)):1)*f;
  return{th:TAU*i/NR+KT*(y-YS0)+A*Math.sin(a),nd:Math.pow(Math.sin(a),2)*f};};
 const RL=[];for(let i=0;i<NR;i++){const th=ribTh(i,YB).th;RL.push(i%2===0?Rb(th)+bal(th,2)+2:Rb(th)-7);}
 const ribR=(i,y)=>{if(y>=YTOP)return Rc(y);const rt=Et(y);if(y>=YF)return rt;
  if(y>=YB){const s=(YF-y)/(YF-YB);return rt+(RL[i]-Et(YB))*s*s;}
  const q=(YB-y)/(YB-YK);return RL[i]+14*q-4*q*q;};
 const ribSc=y=>y<YF?1+.6*Math.pow((YF-Math.max(y,YK))/(YF-YK),1.5):y>YTOP?lerp(1,.42,clamp((y-YTOP)/(YAP-YTOP),0,1)):1;
 const ribW=(nd,sc)=>(2.0+1.5*nd)*sc;
 const ribPt=(i,y)=>{const t=ribTh(i,y),r=ribR(i,y);return[r*Math.cos(t.th),y,r*Math.sin(t.th)];};
 const ribGeo=(i,a,b,oy,M,c0,c1)=>{if(b-a<.8)return null;const n=Math.max(2,Math.ceil((b-a)/(a>=YTOP-.5?.55:2.2)));const P=[],W=[],Hh=[],v=new THREE.Vector3();
  for(let k=0;k<=n;k++){const y=a+(b-a)*k/n,p=ribPt(i,y),t=ribTh(i,y),sc=ribSc(y);v.set(p[0],p[1],p[2]);if(M)v.applyMatrix4(M);
   P.push([v.x,v.y+oy,v.z]);W.push(ribW(t.nd,sc));Hh.push((1.15+.35*t.nd)*sc);}
  return sjSweep(P,W,Hh,null,c0,c1);};
 // THE RUIN PLAN per rib (level 1): kept pieces [a,b,splay]
 const PLAN=[];
 for(let i=0;i<NR;i++){const y0=i%2===0?YK-1.5:YB+.4;
  if(d!==1){PLAN.push([[y0,YAP,0]]);continue;}
  const pcs=[];let a=y0;const tp=YTOP+rr(-26,20);
  if(rng()<.5){const g=rr(YB+40,YTOP-60),L=rr(12,30);pcs.push([a,g,0]);a=g+L;}
  if(rng()<.5){const yb=rr(Math.max(a+12,110),YTOP-10);pcs.push([a,yb,0]);if(rng()<.5)pcs.push([yb,yb+rr(20,40),rr(.35,.7)]);a=tp+1;}
  if(a<tp)pcs.push([a,tp,0]);
  PLAN.push(pcs);}
 const gone=k=>{if(!dd||k<0||k>=NP-1)return false;const y=YS0+k*HS,t=(y-YS0)/(YTOP-YS0);
  return h3(k*2.3,1.7,19.9)<HO*(.14+.45*Math.pow(t,1.2));};
 const rowY=j=>j<=0?YB:YS0+(j-1)*HS;
 const BANDK=k=>(k>=10&&k<=15)||(k>=24&&k<=29);
 // stair slot: a double helix of glazing up the solid core
 const slot=(u,y)=>{const f=((u-(y-YS0)/52)%.5+.5)%.5;return f<.045;};
 // -------------------------------------------------- the body between ya and yb
 // Geometry at absolute heights, dropped by oy0 (the group's own origin height).
 // crown: the gallery, lantern, dome and beacon ride with this piece.
 const body=(P,dx,ya,yb,oy0,crown)=>{const oy=-oy0,stone=[],band=[],win=[],dark=[],plates=[],glow=[],cage=[],metal=[],shards=[];
  for(let k=0;k<NP;k++){const y=YS0+k*HS,t=(y-YS0)/(YTOP-YS0),jag=(h3(k*1.9,3.1,15.7)-.5)*10,roof=k===NP-1;
   if(y<=ya+jag||y>yb+jag)continue;if(gone(k))continue;
   const E=Et(y),ph=phi(y),ps=psi(y),ter=roof||k%3===0;
   const rb=roof?th=>E*1.1*(1+.05*Math.cos(3*(th-ps))):ter?th=>E*(1+.17*Math.cos(2*(th-ph))+.07*Math.cos(3*(th-ps))+.03*Math.cos(5*th+k)):th=>E*(.95+.11*Math.cos(2*(th-ph-.35))+.04*Math.cos(3*(th-ps)));
   const RB=[];if(!roof)for(let i=0;i<NR;i++){const q=ribTh(i,y),r0=ribR(i,y),gap=r0-.4-rb(q.th);if(gap>0&&gap<.34*E)RB.push([q.th,gap*clamp((.34*E-gap)/(.12*E),0,1),ribW(q.nd,1)*1.5/r0]);}
   const re=th=>{let r=rb(th);for(const b of RB){let a=Math.abs(th-b[0])%TAU;if(a>Math.PI)a=TAU-a;r+=b[1]*Math.exp(-Math.pow(a/b[2],2));}return r;};
   const wv=roof?null:ter?th=>.8*Math.sin(2*(th-ph)+1.1)+.35*Math.sin(3*(th-ps)):th=>.45*Math.sin(2*(th-ph)+.4);
   const ri=roof?(()=>0):th=>Math.min(E*.6,re(th)-5);
   const hole=dx>0?(u,v)=>fbm(u*9+k*1.37,k*.61,71,2)<(.22+.26*t)*HO||(v>.3&&fbm(u*23+k,k*.3,72,2)<.36*HO):null;
   const g=sjPlate(y+oy,re,ri,ter?SJ_PT:SJ_PM,ter?88:64,hole,wv);(BANDK(k)?band:stone).push(g);plates.push(g);
   if(ter&&!dx&&!roof)glow.push(sjGrid((u,v)=>{const th=u*TAU,r=re(th)-1.25-v*.9;return[r*Math.cos(th),y+oy-1.37+wv(th),r*Math.sin(th)];},88,1,(u,v)=>[u,v]));}
  // THE CORE: solid stone, with the stair slot glazed; one row per storey so a row dies with its floors
  let j0=0,j1=NP;
  while(j1>1&&rowY(j1-1)>yb-2)j1--;while(j0<NP&&rowY(j0)<ya-2)j0++;
  if(j1>j0){const nv=j1-j0,yv=v=>rowY(j0+Math.round(v*nv)),rC=y=>Et(y)*.62*(1+.04*Math.cos(2*(y-YS0)/HS*.1));
   const lost=j=>gone(j-1)+gone(j);
   const cf=(u,v)=>{const th=u*TAU,y=yv(v),r=rC(y);return[r*Math.cos(th),y+oy,r*Math.sin(th)];},cuv=(u,v,p)=>[u*8,(p[1]-oy-YS0)/(4*HS)];
   const rowOf=v=>j0+Math.floor(v*nv);
   stone.push(sjGrid(cf,72,nv,cuv,(u,v)=>{const j=rowOf(v),y=rowY(j);if(slot(u,y+HS/2))return true;return dx>0&&(lost(j)===2||fbm(u*9+.3,y*.05,13,3)<(.3+.2*lost(j))*HO);}));
   win.push(sjGrid((u,v)=>{const p=cf(u,v),s=.985;return[p[0]*s,p[1],p[2]*s];},72,nv,cuv,(u,v)=>{const j=rowOf(v),y=rowY(j);if(!slot(u,y+HS/2))return true;return dx>0&&(lost(j)===2||fbm(u*7,y*.05,14,3)<.5*HO);}));
   if(dx>0)dark.push(sjGrid((u,v)=>{const th=u*TAU,y=rowY(j0)+v*(rowY(j1)-rowY(j0)),r=Et(y)*.3;return[r*Math.cos(th),y+oy,r*Math.sin(th)];},18,Math.max(1,Math.round((rowY(j1)-rowY(j0))/20)),(u,v)=>[u*3,v*6]));}
  // RIBS
  for(let i=0;i<NR;i++){const jr=(h3(i*4.1,2.2,16.6)-.5)*14;
   for(const pc of PLAN[i]){let a=Math.max(pc[0],ya+jr),b=Math.min(pc[1],yb+jr);
    if(!crown)b=Math.min(b,YTOP);
    if(b<=a)continue;
    let M=null;if(pc[2]){const p=ribPt(i,a),th=ribTh(i,a).th;
     M=new THREE.Matrix4().makeTranslation(p[0],p[1],p[2]).multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(-Math.sin(th),0,Math.cos(th)),-pc[2])).multiply(new THREE.Matrix4().makeTranslation(-p[0],-p[1],-p[2]));}
    const endCap=b<YAP-1;
    if(a<YTOP&&b>YTOP+1){const g1=ribGeo(i,a,YTOP,oy,M,a>YK,false),g2=ribGeo(i,YTOP,b,oy,M,false,endCap);if(g1)stone.push(g1);if(g2)cage.push(g2);}
    else{const g=ribGeo(i,a,b,oy,M,a>YK,endCap);if(g)(a>=YTOP?cage:stone).push(g);}}}
  // THE LANTERN
  let lens=null,glass=null;
  if(crown){
   stone.push(sjPlate(YL0+oy,th=>LR+.9,th=>LR-1.2,SJ_PM,48,null));                          // sill
   if(d!==1)stone.push(sjPlate(YL1+oy,th=>LR+1.3,th=>LR-.8,SJ_PM,48,dx?(u,v)=>fbm(u*6,1,75,2)<.5*HO:null));   // cornice
   // the dome: copper, with a vent ball and a needle
   // (the ruin's dome is gone: with no cornice and few astragals, what was
   // left of it floated. Its sheets lie on the gallery instead.)
   const domeH=dx?(u,v)=>fbm(u*5,v*3,76,2)<.35*HO:null;
   if(d===1)for(let k=0;k<5;k++){const th=rng()*TAU,r=rr(LR+1,LR+6),a=rr(.5,1.2),w=rr(2.5,4.5);
    const sh=sjGrid((u,v)=>{const b=(u-.5)*a,c=(v-.5)*1.1;return[Math.cos(c)*Math.cos(b)*w,Math.sin(c)*w*.6,Math.sin(b)*w];},6,5,(u,v)=>[u,v]);
    sh.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rr(-.4,.4),rng()*TAU,Math.PI/2+rr(-.3,.3)))).translate(r*Math.cos(th),YL0+.9+oy,r*Math.sin(th));metal.push(sh);}
   if(d!==1)metal.push(sjGrid((u,v)=>{const th=u*TAU,a=v*Math.PI/2,r=(LR+1)*Math.pow(Math.cos(a),.85);return[r*Math.cos(th),YL1+.6+Math.sin(a)*(YAP-YL1-1.4)+oy,r*Math.sin(th)];},40,10,(u,v)=>[u*8,v*2],domeH));
   if(d!==1){const s=new THREE.SphereGeometry(1.7,12,8);s.translate(0,YAP+oy,0);metal.push(s);
    const nd=new THREE.ConeGeometry(.45,9,8);nd.translate(0,YAP+5.5+oy,0);metal.push(nd);}
   // astragals: a diamond lattice of bronze helices round the glazing
   const NA=10;
   for(let s=-1;s<=1;s+=2)for(let q=0;q<NA;q++){if(dx&&h3(q*3.1,s,77)<(d===1?.6:.3))continue;
    const pts=[];for(let k=0;k<=10;k++){const t=k/10,th=TAU*q/NA+s*t*Math.PI/NA*2,y=YL0+.9+t*(YL1-YL0-.9);pts.push([(LR+.12)*Math.cos(th),y+oy,(LR+.12)*Math.sin(th)]);}
    metal.push(sjSweep(pts,pts.map(()=>.14),pts.map(()=>.16),null,false,false));}
   // gallery rail
   const RG=Et(YTOP)*1.1-1.2,rail=[];for(let k=0;k<=96;k++){const th=k/96*TAU;rail.push([RG*Math.cos(th),YTOP+1.9+oy,RG*Math.sin(th)]);}
   if(d!==1)metal.push(sjSweep(rail,rail.map(()=>.12),rail.map(()=>.12),()=>[0,1,0],false,false));
   for(let k=0;k<64;k++){if(dx&&rng()<(d===1?.55:.25))continue;const th=k/64*TAU;kput(dx?'postR':'postW',[RG*Math.cos(th),YTOP+1.2+oy,RG*Math.sin(th)],null,[.1,1.5,.1],null);}
   // glazing (intact; the rehabilitated tower keeps a few panes; the ruin none)
   if(d===0||d===3)glass=mesh(sjGrid((u,v)=>{const th=u*TAU;return[LR*Math.cos(th),YL0+.9+v*(YL1-YL0-.9)+oy,LR*Math.sin(th)];},40,4,(u,v)=>[u*6,v*2],d===3?(u,v)=>h3(Math.floor(u*20),Math.floor(v*4),78)<.8:null),MAT.glass,P);
   // THE LENS: a beehive of prism rings round the lamp
   if(d===0){const lg=sjGrid((u,v)=>{const th=u*TAU,r=4.4*Math.sin(Math.PI*(.1+.8*v))+.28*Math.abs(Math.sin(v*Math.PI*13));return[r*Math.cos(th),YTOP+2.4+v*11+oy,r*Math.sin(th)];},28,52,(u,v)=>[u*3,v*6]);
    lens=mesh(lg,MAT.lhLens,P);lhLensOn(lens);
    const ped=new THREE.CylinderGeometry(1.2,2,1.8,10);ped.translate(0,YL0+.9+oy,0);metal.push(ped);}
   if(d===1||d===2){                                  // the lens in shards on the gallery floor
    for(let k=0;k<7;k++){const th=rng()*TAU,r=rr(2,LR+3),s=rr(1.2,2.6);
     const sh=sjGrid((u,v)=>{const a=(u-.5)*1.1,y=(v-.5)*s*1.4;return[Math.cos(a)*s,y,Math.sin(a)*s+.2*Math.abs(Math.sin(v*9))];},6,5,(u,v)=>[u,v]);
     sh.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rr(1,1.5),rng()*TAU,rr(-.4,.4)))).translate(r*Math.cos(th),YL0+.6+oy,r*Math.sin(th));shards.push(sh);}}
   // THE FIRE BASKET (rehabilitated): an iron cage on the gallery, burning at night
   if(d===3){const by=YL0+.9+oy;const bb=new THREE.CylinderGeometry(1.6,2.4,1.6,10);bb.translate(0,by+.8,0);stone.push(bb);
    for(let k=0;k<10;k++){const a=k/10*TAU,b=a+.5;beam('postR',[1.6*Math.cos(a),by+1.6,1.6*Math.sin(a)],[3.6*Math.cos(b),by+5.4,3.6*Math.sin(b)],.18,.18,null);}
    for(let k=0;k<3;k++)kput('fireWin',[0,by+3.8,0],qEuler(0,k*Math.PI/3,0),[5,5.2,1],new THREE.Color().setHSL(.06,1,.62));
    kput('emberB',[0,by+4.5,0],qEuler(0,rng()*TAU,0),[7,6,7],new THREE.Color().setHSL(.06,1,.55));
    kput('emberB',[0,by+6,0],qEuler(0,rng()*TAU,0),[22,16,22],new THREE.Color().setHSL(.07,1,.26));}}
  meshMerged(stone,dx>0?MAT.sjStoneR:MAT.sjStone,P);meshMerged(band,dx>0?MAT.lhBandR:MAT.lhBand,P);meshMerged(cage,dx>0?MAT.sjStoneR:MAT.sjStone,P);
  meshMerged(win,dx>0?MAT.sjWinR:MAT.sjWin,P);meshMerged(dark,MAT.sjCore,P);sjGlowOn(meshMerged(glow,MAT.sjGlow,P));meshMerged(metal,COPPER,P);meshMerged(shards,MAT.lhLens,P);
  if(dx>0){mossOnSurface(plates,0,0,0,crown&&yb>YTOP?140:70,1.8);vinesFromLedge(plates,0,0,0,crown&&yb>YTOP?90:45,12);}
  return plates;};
 // -------------------------------------------------- the base block (the keeper's hall)
 const bStone=[],bWin=[],bDark=[],slabs=[],bGlow=[];
 for(let s=1;s<=2;s++){const y=YK+s*BS,g=sjPlate(y,th=>Rb(th)+bal(th,s),th=>s===2?0:Rb(th)-12,SJ_PT,110,dd?(u,v)=>fbm(u*11+s*2.1,s*.7,81,2)<.26*HO||(v>.3&&fbm(u*29+s,s,82,2)<.34*HO):null);bStone.push(g);slabs.push(g);
  if(!dd)bGlow.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)+bal(th,s)-1.25-v*.9;return[r*Math.cos(th),y-1.37,r*Math.sin(th)];},110,1,(u,v)=>[u,v]));}
 const bh=dd?(u,v)=>fbm(u*14,v*3,83,3)<.56*HO:null;
 bWin.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)-1.2;return[r*Math.cos(th),YK+BS+v*BS,r*Math.sin(th)];},110,2,(u,v)=>[u*12,.25+v*.25],bh));
 bWin.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)-7;return[r*Math.cos(th),YK+.3+v*(BS-.3),r*Math.sin(th)];},110,1,(u,v)=>[u*11,v*.25],bh));
 if(dd)bDark.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)*.5;return[r*Math.cos(th),YK+v*(YB-YK),r*Math.sin(th)];},36,1,(u,v)=>[u*8,v*2]));
 for(let k=0;k<44;k++){const th=(k+.5)/44*TAU,r=Rb(th)-2.5;if(dd&&rng()<.22*HO)continue;
  kput(dd?'postR':'postW',[r*Math.cos(th),YK+BS/2,r*Math.sin(th)],null,[.6,BS-.6,.6],dd?null:new THREE.Color(0xf1e2c6));}
 // -------------------------------------------------- the lodges: keeper's house, fog-signal house, boathouse
 const lodge=(p,R,nS,yaw,name)=>{const [x,z,,y0]=p,SH=3.8;
  const re=th=>R*(1+.14*Math.cos(2*(th-yaw))+.05*Math.cos(3*th+yaw));
  for(let s=1;s<=nS;s++){const y=y0+s*SH,roof=s===nS;const hole=dd?(u,v)=>fbm(u*8+s*3.3+x,s*.9,84,2)<(roof?.5:.3)*HO:null;
   const g=sjPlate(y,th=>re(th)+(roof?1.2:.6),roof?(()=>0):(th=>re(th)-5),roof?SJ_PT:SJ_PM,56,hole);g.translate(x,0,z);bStone.push(g);slabs.push(g);}
  const w=sjGrid((u,v)=>{const th=u*TAU,r=re(th)-1;return[x+r*Math.cos(th),y0+.2+v*(nS*SH-.2),z+r*Math.sin(th)];},56,nS,(u,v)=>[u*R*TAU/8/2,v*nS*SH/(4*HS)],dd?(u,v)=>fbm(u*10+x,v*3,85,2)<.5*HO:null);bWin.push(w);
  if(dd)bDark.push(sjGrid((u,v)=>{const th=u*TAU,r=re(th)*.45;return[x+r*Math.cos(th),y0+v*nS*SH,z+r*Math.sin(th)];},16,1,(u,v)=>[u*3,v]));
  // a floor, so the ruin is not a hollow ring
  bStone.push(sjGrid((u,v)=>{const th=u*TAU,r=v*(re(th)-.5);return[x+r*Math.cos(th),y0+.25,z+r*Math.sin(th)];},32,2,(u,v)=>[u*4,v*2]));
  // a chimney and a lamp by the door (also what the inspector's probe finds)
  kput(dd?'postR':'postW',[x+R*.35*Math.cos(yaw),y0+nS*SH+2.2,z+R*.35*Math.sin(yaw)],null,[.7,3.2,.7],null);
  if(!dd||d===3)kput('dot',[x+(re(TH_C)+.2)*Math.cos(TH_C),y0+2.6,z+(re(TH_C)+.2)*Math.sin(TH_C)],null,[.6,.6,.6],WARM);
  REGISTER({name:'Lighthouse island — '+name,x,z,y:y0-1,r:R*1.25+2,h:nS*SH+4});};
 lodge(PADS[0],12,2,.4,"the keeper's house");lodge(PADS[1],7.5,1,1.1,'the fog-signal house');lodge(PADS[2],7,1,-.3,'the boathouse');
 // the fog horn: a copper trumpet on the fog-signal house, facing the sea
 {const p=PADS[1],a=Math.atan2(p[1],p[0]),hn=sjGrid((u,v)=>{const th=u*TAU,r=.7+3.2*Math.pow(v,2.4);return[v*9,r*Math.cos(th),r*Math.sin(th)];},18,8,(u,v)=>[u*3,v*2],d===1?(u,v)=>fbm(u*5,v*3,86,2)<.4:null);
  hn.applyMatrix4(new THREE.Matrix4().makeRotationY(-a)).translate(p[0]+Math.cos(a)*4,p[3]+3.8+2.6,p[1]+Math.sin(a)*4);var HORN=hn;}
 // -------------------------------------------------- stand or fall
 const P=new THREE.Group();G.add(P);useGroupXF(P);
 const standPlates=body(P,dd,-99,d===2?CUT:YAP+20,0,d!==2);endGroupXF();
 const site={x:gx,z:gz,YK,YB,YTOP,YL1,YAP,YLP,CUT,WL,RS,cove:shoreR(TH_C),jetty:[JA,JB],mole:mHead,wreck:WRECK};
 // THE BEACON (intact only): two beams and the lamp's glow, swept by the frame hook
 if(d===0){const Bc=new THREE.Group();Bc.position.set(0,YLP,0);G.add(Bc);
  const b1=lhBeamGeo(640,1.8,58),b2=lhBeamGeo(640,1.8,58).rotateY(Math.PI);
  meshMerged([b1.rotateZ(-.03),b2.rotateZ(.03)],MAT.lhBeam,Bc);
  // (b2 was turned by Pi before its tilt, so both dip toward the sea)
  const gw=new THREE.Group();gw.position.set(0,YLP,0);G.add(gw);
  const cg=new THREE.BufferGeometry();{const Pp=[],U=[];for(let q=0;q<3;q++){const a=q*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
   const V=[[-c,-1,-s,0,0],[c,-1,s,1,0],[c,1,s,1,1],[-c,-1,-s,0,0],[c,1,s,1,1],[-c,1,-s,0,1]];for(const v of V){Pp.push(v[0]*22,v[1]*22,v[2]*22);U.push(v[3],v[4]);}}
   const Vh=[[-1,0,-1,0,0],[1,0,-1,1,0],[1,0,1,1,1],[-1,0,-1,0,0],[1,0,1,1,1],[-1,0,1,0,1]];for(const v of Vh){Pp.push(v[0]*22,0,v[2]*22);U.push(v[3],v[4]);}
   cg.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));cg.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));cg.computeVertexNormals();}
  mesh(cg,MAT.lhGlow,gw);
  Bc.visible=gw.visible=false;
  LH_BEACONS.push({g:Bc,glow:gw,x:gx,z:gz,a:0});
  if(!LH_TICKING&&typeof tick==='function'){tick(lhTick);LH_TICKING=true;}}
 if(d===2){
  // broken at CUT; the upper tower lies along the island (piece A), broke
  // again on the cliff edge, and its head (piece B, gallery and lantern) slid
  // over into the sea
  const ax=Math.cos(FANG),az=Math.sin(FANG),CB=Math.min(CUT+(FALL.DE-FALL.D0),YTOP-30);
  const lay=(ya,yb,D,yU,beta,crown)=>{const r0=Et(ya)*1.12;
   const U=new THREE.Group();U.rotation.set(0,-FANG,-(Math.PI/2+beta));
   // the underside at (D, yU): the axis sits r0 above it, perpendicular to the lie
   U.position.set(ax*(D+Math.sin(beta)*r0),yU+Math.cos(beta)*r0,az*(D+Math.sin(beta)*r0));G.add(U);
   useGroupXF(U);body(U,1,ya,yb,ya,crown);endGroupXF();return U;};
  const bA=Math.atan2(YK-FALL.yE,FALL.DE-FALL.D0);
  lay(CUT,CB,FALL.D0,YK-1.6,bA,false);
  const DB=FALL.DE+5,yB=Math.max(WL+2,FALL.yE-4),LB=YAP-CB;
  lay(CB,YAP+20,DB,yB,Math.atan2(yB-(WL-6),LB),true);
  for(let k=0;k<=5;k++){const s=FALL.D0+(FALL.DE-FALL.D0)*k/5,hh=lerp(YK,FALL.yE,k/5);rubbleRing(ax*s,hh,az*s,Et(CUT)*.8,Et(CUT)*1.7,26,3.2);}
  rubbleRing(0,YK,0,24,46,90,3.6);
  const mid=(FALL.D0+DB+LB)/2;REGISTER({name:'the Lighthouse — fallen tower',x:ax*mid,z:az*mid,r:(DB+LB-FALL.D0)/2+16,h:70});
  site.fall={ang:FANG,D0:FALL.D0,DE:FALL.DE,DB,LB};}
 else REGISTER({name:'the Lighthouse — lantern'+(d===1?' (smashed)':d===3?' (fire basket)':''),x:0,z:0,y:YTOP-3,r:Et(YTOP)*1.3,h:YAP+12-YTOP});
 if(HORN)meshMerged([HORN],COPPER,G);
 meshMerged(bStone,STONE,G);meshMerged(bWin,WINM,G);meshMerged(bDark,MAT.sjCore,G);sjGlowOn(meshMerged(bGlow,MAT.sjGlow,G));
 meshMerged(isl,STONE,I);meshMerged(pave,PAVE,I);
 meshMerged(hulls,d===1||d===2?MAT.rust:MAT.lhHull,I);meshMerged(decks,MAT.timber||MAT.sjPave,I);
 REGISTER({name:'Lighthouse '+(d===2?'(toppled)':'('+STATE(d)+')'),x:0,z:0,r:Rb(0)*1.3,h:d===2?CUT+6:YAP+14});
 REGISTER({name:'Lighthouse island — the harbour',x:0,z:shoreR(TH_C)+30,r:62,h:12});
 REGISTER({name:'Lighthouse island',x:0,z:0,r:RS,h:40});
 // -------------------------------------------------- life and decay on the island
 const clear=(x,z)=>{if(Math.hypot(x,z)<48)return false;for(const p of PADS)if(Math.hypot(x-p[0],z-p[1])<p[2]+5)return false;
  for(const p of PATH)if(Math.hypot(x-p[0],z-p[1])<6)return false;
  if(d===2){const s=x*Math.cos(FANG)+z*Math.sin(FANG),o=Math.abs(-x*Math.sin(FANG)+z*Math.cos(FANG));if(s>0&&s<FALL.DE+60&&o<28)return false;}
  return true;};
 const topF=upFaces(ISLE,dd?900:260,.8).filter(f=>f.p[1]>WL+5&&clear(f.p[0],f.p[2])&&Math.hypot(f.p[0],f.p[2])<RS-40);
 const nT=dd?(d===3?60:140):22;
 for(let k=0;k<Math.min(nT,topF.length);k++){const f=topF[k];VEG.tree(f.p[0],f.p[1]-.3,f.p[2],k%3,dd?rr(7,15):rr(5,9));}
 if(dd){for(let k=nT;k<topF.length;k++){const f=topF[k],s=rr(.8,2.6);
   kput('moss',[f.p[0],f.p[1]+s*.1,f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.9,1.6),s*rr(.25,.5),s*rr(.9,1.6)],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.07,.14)));}
  // vines down the cliffs
  for(const f of faceSamples(ISLE,160,.08,.5)){if(f.p[1]<WL+4)continue;const L=rr(4,12);kput('vine',[f.p[0],f.p[1],f.p[2]],qEuler(rr(-.14,.14),rng()*TAU,rr(-.14,.14)),[rr(.8,1.7),L,rr(.8,1.7)],null);}
  mossOnSurface(slabs,0,0,0,160,2.2);vinesFromLedge(slabs,0,0,0,70,8);
  rubbleRing(0,YK,0,32,48,d===2?40:70,2.6);}
 else{
  // keepers on the knoll and the jetty
  const fig=(x,y,z)=>{const c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,c);kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
  for(let k=0;k<12;k++){const th=rng()*TAU,r=rr(36,43);fig(r*Math.cos(th),YK+.3,r*Math.sin(th));}
  for(let k=0;k<5;k++)fig(rr(.5,5.5),WL+2.4,rr(JA+8,JB-4));
  for(let k=0;k<4;k++){const p=PATH[(rng()*PATH.length)|0];fig(p[0]+rr(-1,1),landH(p[0],p[1])+.3,p[1]);}
  for(let k=0;k<3;k++)fig(rr(-2,2),YTOP+.9,rr(-LR-4,-LR-1.5));}
 // the harbour light at the mole head: a warm lamp by night (FIREKIT), dark in a ruin
 kput(dd?'postR':'postW',[mHead[0],WL+6,mHead[2]],null,[.45,6,.45],null);
 if(d!==1&&d!==2){kput('emberB',[mHead[0],WL+9.6,mHead[2]],qEuler(0,rng()*TAU,0),[3,3,3],new THREE.Color().setHSL(.1,1,.55));
  kput('emberB',[mHead[0],WL+9.6,mHead[2]],qEuler(0,rng()*TAU,0),[9,8,9],new THREE.Color().setHSL(.1,1,.22));}
 {const x=4,z=58;site.lookUp=[x,landH(x,z)+1.7,z];}   // for the 'Looking up' preset: clear of the base block's lip
 LH_SITE[d]=site;
 KOFF=[0,0,0];return G;}
