// ---------------------------------------------------------------- ANCIENT IZIZ STYLE
// The Ancients' way of building the Iziz building families: drums, vaults, petal crowns and lattice domes on the
// Iziz house, tower, hall and civic types, plus the ruined and rehabilitated states made by wreck(), and the
// Ancient-kit variants Iziz invented: one TYPE cut out of a builder that lays several side by side (kitSection),
// a tower trimmed off its podium onto a small square plinth (measureKit + trimPlinths), Skyscraper D's rusted
// skin (izsRustSkin), and the tripod market hung from a reclaimed Skyscraper C (tripodMarket).
//
// Folded out of settlements/iziz (78-transplant.js and the city build) on 2026-09-30. Iziz VENDORS THIS FILE
// byte-identical as src/77z-iziz-style.js; edit it here and copy it across. It uses nothing from Iziz: the three
// Vernacular helpers it needed are carried as izsC, izsWorldUV and TEX.izsWood. Iziz's own original massing
// (izBlock and the Iziz halves of the families) stays in Iziz.
//
// A family is izsFamily(key, name, size, tall, fn(P,x,z)): fn builds one instance at x,z into group P.
// izsPlace(scene, key, mode, x, z, ry, scale, seed, y) places one: mode 'intact' | 'ruin' | 'rehab'.
// The `iziz-style` target shows every family in all three states and every variant.

// ---- carried from the Iziz Vernacular kit (69b-vern-mat.js), renamed so both can load together
function izsC(hex,k){const c=new THREE.Color(hex).convertSRGBToLinear();if(k!==undefined)c.multiplyScalar(k);return c;}
TEX.izsWood=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const bd=Math.floor(y/16);                                  // 0.25 m boards
  let v=178+(h3(bd*2.7,0,1.9)-.5)*34;                         // board-to-board tone
  v+=(fbm(x/22,y/2.5,4.8,2)-.5)*34;                           // grain along the board
  v+=(fbm(x/5,y/5,7.7,1)-.5)*8;
  if(y%16<1)v-=60;else if(y%16<2)v-=22;                       // shadow gap between boards
  if(((x+bd*37)%128)<2&&y%16>2)v-=30;                         // butt joints, staggered
  const knot=fbm(x/9,y/9,bd*1.3,2);if(knot>.72)v-=(knot-.72)*160;
  d[i]=v;d[i+1]=v*.93;d[i+2]=v*.84;d[i+3]=255;}
 g.putImageData(id,0,0);});
function izsWorldUV(mat,K){mat.userData.uvK=K;mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',
`#ifdef USE_UV
#ifdef USE_INSTANCING
mat4 _im=instanceMatrix;
vec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));
vec3 _an=abs(normal);
vec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));
vUv=uv*_sw*${K.toFixed(4)};
#else
vUv=uv;
#endif
#endif`);};return mat;}

// ---- palette, materials and the salvage items the rehabilitated state uses
const TPAL=[0xe9cb8c,0xdcb474,0xcf9d5b,0xe2ab5e,0xbf8a44,0xf1dba6,0xd8893c,0xc8a26a,0xe6bd7e,0xd4a05a];
const TPAL_BRUT=[0xb9a58a,0xa8957a,0xc7b294,0x9c8b70,0xd2bc9c];
const _tmc={};function tsand(hex,tex){const k=hex+'_'+(tex||'p');if(_tmc[k])return _tmc[k];const m=new THREE.MeshStandardMaterial({map:tex==='c'?TEX.concrete:TEX.panel,color:hex,metalness:tex==='c'?0:.3,roughness:tex==='c'?.9:.42,side:DS});_tmc[k]=m;return m;}
MAT.scrap=new THREE.MeshStandardMaterial({map:TEX.rust,color:0xffffff,roughness:.9,metalness:.2,side:DS});MAT.plank=new THREE.MeshStandardMaterial({map:TEX.izsWood,color:0xffffff,roughness:1,side:DS});izsWorldUV(MAT.plank,.5);
kdef('tscrap',new THREE.BoxGeometry(1,1,1),MAT.scrap);kdef('tplank',new THREE.BoxGeometry(1,1,1),MAT.plank);kdef('tpole',new THREE.CylinderGeometry(.12,.12,1,6),MAT.pipeRust);kdef('tbulb',new THREE.SphereGeometry(.22,6,5),MAT.dot);
// ---- the ruin / rehab pass
const TSCRAP=[0x8a3a2a,0x7a7a72,0x9a8a6a,0x5a6a3a,0x6a6a80],TPLANK=[0xb08a5a,0xc8a070,0x9a7a4a],TTARP=[0x2a5a8a,0xe07a2a,0x3a7a5a,0x8a3a3a,0xe0a030];
const _trm={};function rustify(m){if(!m||m===MAT.glass)return m;if(m===MAT.white)return MAT.rust;if(m.map===TEX.panel&&m!==MAT.white){const k='w'+m.color.getHex();if(!_trm[k])_trm[k]=new THREE.MeshStandardMaterial({map:TEX.rust,color:new THREE.Color(m.color).multiplyScalar(.85),roughness:.95,metalness:.15,side:DS});return _trm[k];}if(m===MAT.concrete)return MAT.concreteR;if(m===MAT.winIntact)return MAT.winDead;if(_trm[m.uuid])return _trm[m.uuid];
 const n=new THREE.MeshStandardMaterial({map:TEX.rust,color:new THREE.Color(m.color).multiplyScalar(.85),roughness:.95,metalness:.15,side:DS});_trm[m.uuid]=n;return n;}
const DEADNAME={winI:'winD',winBigI:'winBigD',winSmI:'winSmD',ovalI:'ovalD',mullW:'mullR',colW:'colR',strutW:'strutR',ringW:'ringR',pipe:'pipeR',boxW:'boxR',boxC:'boxCR',slabC:'slabCR',pane:'paneD',plateW:'plateR',arch:'archR',vaultRib:'vaultRibR',finial:null,lampI:null,tbulb:null,pierW:'pierR'};
// ---- generic post-build passes: 'ruin' and 'rehab' ---------------------------------------------------------------
// P is the (possibly transformed) group the pair built into; `root` is an IDENTITY group in the scene that receives
// the cut geometry (which is computed in world space). ranges = KIT.items lengths before the pair ran.
// SLIVERS (Travis: the Tyrell block read as see-through). The cut keeps or drops whole triangles, and a lathed shell's
// triangles are long and thin (the Tyrell's are 0.6 x 2.5 m): dropping one of a quad's pair left a vertical slit, and a
// shell full of them read as a basket of slats you could see through. Every triangle is split along its longest edge
// until no edge is over `maxE` metres, so holes come out as ragged blobs. (UVs are rebuilt in metres after the cut.)
function wreckRefine(p,maxE){const out=[];const m2=maxE*maxE;const st=[];
 for(let i=0;i<p.length;i+=9){st.push([p[i],p[i+1],p[i+2],p[i+3],p[i+4],p[i+5],p[i+6],p[i+7],p[i+8],0]);
  while(st.length){const t=st.pop();const e=[0,3,6].map(k=>{const a=k,b=(k+3)%9;return (t[a]-t[b])**2+(t[a+1]-t[b+1])**2+(t[a+2]-t[b+2])**2;});
   const k=e[0]>=e[1]&&e[0]>=e[2]?0:e[1]>=e[2]?1:2;if(e[k]<=m2||t[9]>=6){for(let j=0;j<9;j++)out.push(t[j]);continue;}
   const a=k*3,b=((k+1)%3)*3,c=((k+2)%3)*3,mx=(t[a]+t[b])/2,my=(t[a+1]+t[b+1])/2,mz=(t[a+2]+t[b+2])/2;
   st.push([t[a],t[a+1],t[a+2],mx,my,mz,t[c],t[c+1],t[c+2],t[9]+1],[mx,my,mz,t[b],t[b+1],t[b+2],t[c],t[c+1],t[c+2],t[9]+1]);}}
 return new Float32Array(out);}
function wreck(P,root,ranges,mode,cx,cz,seed){reseed(seed);const rehab=mode==='rehab';
 const bb=new THREE.Box3();P.updateMatrixWorld(true);const meshes=[];P.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(const m of meshes){m.geometry.computeBoundingBox();bb.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}
 for(const n in ranges){const it=KIT.items[n];for(let i=ranges[n];i<it.length;i++){const p=it[i].p;bb.expandByPoint(new THREE.Vector3(p[0],p[1],p[2]));}}
 if(!isFinite(bb.min.x))return;
 const H=Math.max(4,bb.max.y-bb.min.y),y0=bb.min.y;const R=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z)/2;
 const BIGSKIP=/^(win|oval|strip|dot|cell|mull|ring|pipe|finial|lamp|vine|moss|rubble|trunk|fig|hedge|tscrap|tplank|tpole|tbulb|v[A-Z])/;
 for(const n in ranges){const it=KIT.items[n];if(BIGSKIP.test(n))continue;const keep=it.slice(0,ranges[n]);for(let i=ranges[n];i<it.length;i++){const o=it[i];const sz=typeof o.s==='number'?[o.s,o.s,o.s]:o.s;
   if(Math.max(sz[0],sz[1],sz[2])<3){keep.push(o);continue;}
   // subdivide the shared unit geometry to ~1.5 m cells so the cut is ragged rather than whole faces vanishing: a
   // five-sided prism cut at its native two triangles a side left standing triangular sails (the pentagon block)
   const def=KIT.defs[n];let geo=def.geo;if(geo.type==='BoxGeometry'){geo=new THREE.BoxGeometry(1,1,1,Math.max(1,Math.round(sz[0]/1.5)),Math.max(1,Math.round(sz[1]/1.5)),Math.max(1,Math.round(sz[2]/1.5)));}
   else if(geo.type==='CylinderGeometry'&&geo.parameters){const P=geo.parameters;geo=new THREE.CylinderGeometry(P.radiusTop,P.radiusBottom,P.height,Math.max(P.radialSegments,Math.round(P.radialSegments*Math.ceil(Math.max(sz[0],sz[2])*2/(P.radialSegments*1.5)))),Math.max(1,Math.round(sz[1]/1.5)),P.openEnded,P.thetaStart,P.thetaLength);
    if(def.geo.boundingBox===null||true){const bb0=new THREE.Box3().setFromBufferAttribute(def.geo.attributes.position),bb1=new THREE.Box3().setFromBufferAttribute(geo.attributes.position);geo.translate(0,bb0.min.y-bb1.min.y,0);}}
   const m=new THREE.Mesh(geo,o.c?(()=>{const mm=def.mat.clone();mm.onBeforeCompile=def.mat.onBeforeCompile;mm.color=o.c.clone();return mm;})():def.mat);m.position.set(o.p[0],o.p[1],o.p[2]);if(o.q)m.quaternion.copy(o.q);m.scale.set(sz[0],sz[1],sz[2]);root.add(m);meshes.push(m);}
  KIT.items[n]=keep;}
 root.updateMatrixWorld(true);P.updateMatrixWorld(true);
 const cutF=rehab?rr(.55,.85):rr(.4,.75);const cut=y0+H*cutF;const jag=(x,z)=>(fbm(x*.08+seed,z*.08,seed*.3,2)-.5)*H*.3;
 const hf=clamp(2.6/R,.07,.5);const holeT=rehab?.17:.25;const hole=(x,y,z)=>fbm(x*hf+seed*.7,y*hf,z*hf,3)<holeT;let topKept=y0;
 const gone=[],cutGeos=[];
 for(const m of meshes){if(m.material===MAT.glass){m.parent.remove(m);continue;}
  const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry).clone();g.applyMatrix4(m.matrixWorld);const p=wreckRefine(g.attributes.position.array,2.4),uv=null;
  const np=[],nu=[];for(let i=0;i<p.length;i+=9){const x=(p[i]+p[i+3]+p[i+6])/3,y=(p[i+1]+p[i+4]+p[i+7])/3,z=(p[i+2]+p[i+5]+p[i+8])/3;
   const keep=y<cut+jag(x,z)&&!hole(x,y,z);
   if(keep){for(let k=0;k<9;k++)np.push(p[i+k]);for(let k=1;k<9;k+=3)if(p[i+k]>topKept&&Math.hypot(p[i+k-1]-cx,p[i+k+1]-cz)<R*.8)topKept=p[i+k];
    // world-metre UVs from the triangle's dominant axis: the materials' world-UV hook then tiles the cut fabric in metres
    {const ax=p[i+3]-p[i],ay=p[i+4]-p[i+1],az=p[i+5]-p[i+2],bx=p[i+6]-p[i],by=p[i+7]-p[i+1],bz=p[i+8]-p[i+2];const nx=Math.abs(ay*bz-az*by),ny=Math.abs(az*bx-ax*bz),nz=Math.abs(ax*by-ay*bx);
     const A=(ny>=nx&&ny>=nz)?[0,2]:(nx>=nz)?[2,1]:[0,1];for(let k=0;k<9;k+=3)nu.push(p[i+k+A[0]],p[i+k+A[1]]);}}
   else if(y<cut+jag(x,z)-1&&gone.length<600&&rng()<.25){const ax=p[i+3]-p[i],ay=p[i+4]-p[i+1],az=p[i+5]-p[i+2],bx=p[i+6]-p[i],by=p[i+7]-p[i+1],bz=p[i+8]-p[i+2];const n=new THREE.Vector3(ay*bz-az*by,az*bx-ax*bz,ax*by-ay*bx);const L=n.length();if(L>0.05)gone.push([x,y,z,n.x/L,n.y/L,n.z/L,Math.sqrt(L)]);}}
  m.parent.remove(m);if(!np.length)continue;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(np,3));ng.setAttribute('uv',new THREE.Float32BufferAttribute(nu,2));ng.computeVertexNormals();
  const rm=rustify(m.material),uk=(rm&&rm.userData&&rm.userData.uvK)||.125;{const a=ng.attributes.uv.array;for(let k=0;k<a.length;k++)a[k]*=uk;}   // metres -> the material's tile
  const nm=new THREE.Mesh(ng,rm);root.add(nm);cutGeos.push(ng);}
 const moves=[];for(const n in ranges){const it=KIT.items[n];const keep=it.slice(0,ranges[n]);for(let i=ranges[n];i<it.length;i++){const o=it[i];const p=o.p;
   const above=p[1]>cut+jag(p[0],p[2]);const lost=above||hole(p[0],p[1],p[2])||rng()<(rehab?.12:.25);
   if(lost){if(!above&&rng()<.2&&gone.length<600)gone.push([p[0],p[1],p[2],0,1,0,1.5]);continue;}
   if(p[1]+(typeof o.s==='number'?o.s:o.s[1])*.5>topKept&&Math.hypot(p[0]-cx,p[2]-cz)<R*.8)topKept=p[1]+(typeof o.s==='number'?o.s:o.s[1])*.5;
   let tn=n in DEADNAME?DEADNAME[n]:n;if(tn===null)continue;if(n==='strip'||n==='dot'||n==='cell'){o.c=(rehab&&rng()<.35)?WARM.clone().multiplyScalar(rr(.4,.9)):(rng()<.08?CYAN.clone().multiplyScalar(.6):DEAD);}
   else if(o.c){o.c=o.c.clone().multiplyScalar(.8);o.c.r*=1.05;o.c.b*=.85;}
   if(tn===n)keep.push(o);else moves.push([tn,o]);}
  KIT.items[n]=keep;}
 for(const [tn,o] of moves)KIT.items[tn].push(o);
 // decay dressing (world frame)
 const kx0=KXF;KXF=null;KOFF=[0,0,0];
 rubbleRing(cx,y0,cz,R*.6,R*1.6,rehab?18:Math.round(20+R*3),Math.min(2.5,.6+R*.08));scatterMoss(cx,y0,cz,R*.3,R*1.6,rehab?10:Math.round(10+R*2),Math.min(2,.5+R*.06));
 // vines hang off the CUT WALLS themselves (side faces of the new geometry), not off a ring in the air round the plot
 if(!rehab&&cutGeos.length){for(const f of sideFaces(cutGeos,Math.round(R*.6))){if(f.p[1]<y0+H*.3)continue;const L=Math.min(rr(3,H*.5),f.p[1]-y0-.3);
  kput('vine',[f.p[0]+f.n[0]*.2,f.p[1],f.p[2]+f.n[2]*.2],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[1.8,L,1.8],null);}}
 if(!rehab){KXF=kx0;return;}
 // ---- rehab: patchwork — scrap plates and planks over the holes, tarp roofs over the cut, scaffold poles, bulbs
 for(const g of gone){if(rng()>.75)continue;const q=qFacing([g[3],g[4],g[5]]);const s=clamp(g[6]*rr(.8,1.6),.6,3.2);const plank=rng()<.4;
  kput(plank?'tplank':'tscrap',[g[0]+g[3]*.15,g[1]+g[4]*.15,g[2]+g[5]*.15],q.multiply(qEuler(0,0,rr(-.2,.2))),[s*rr(.7,1.3),plank?s*.3:s*rr(.6,1.1),.18],izsC(plank?TPLANK[Math.floor(rng()*3)]:TSCRAP[Math.floor(rng()*5)]));
  if(rng()<.08)kput('tbulb',[g[0]+g[3]*.6,g[1]+g[4]*.6+.4,g[2]+g[5]*.6],null,1,WARM);}
 // where a canopy pole can stand: walking in from radius r along bearing a to the first point with fabric within 1.5 m
 // horizontally and within 5 m of the kept top (the roof), so a pole never hangs in the air round a narrow crown
 const RV=[];for(const g of cutGeos){const pa=g.attributes.position.array;for(let i=0;i<pa.length;i+=9)if(pa[i+1]>topKept-5)RV.push(pa[i],pa[i+1],pa[i+2]);}
 const roofFoot=(a,r)=>{for(let rr2=r;rr2>=.5;rr2-=.75){const px=cx+Math.cos(a)*rr2,pz=cz+Math.sin(a)*rr2;let y=-1e9;for(let i=0;i<RV.length;i+=3)if(Math.abs(RV[i]-px)<1.5&&Math.abs(RV[i+2]-pz)<1.5&&RV[i+1]>y)y=RV[i+1];if(y>-1e8)return[px,pz,y-.2];}return[cx+Math.cos(a)*r,cz+Math.sin(a)*r,topKept-.3];};
 // the ROOF over the cut: a draped tarp on poles for a small building, a corrugated-sheet cap on more poles for a big one
 // (a rehabilitated building always gets its roof back — the old pass only scattered planks over anything past R 22)
 const tc=izsC(TTARP[Math.floor(rng()*5)]);const tr=R*.7;const ty=topKept+1.6;const bigRoof=R>=22;
 {const K=.5;const roof=gridSurface((u,v)=>{const a=u*TAU,r=v*tr;return[cx+r*Math.cos(a),ty+(bigRoof?3.2-2.6*v:2.4-2.2*v*v)+.4*Math.sin(a*5)*(bigRoof?0:1),cz+r*Math.sin(a)];},bigRoof?40:24,bigRoof?6:5,{uS:tr*TAU*K,vS:tr*K,hole:bigRoof?null:(u,v)=>fbm(u*5+seed,v*4,3,2)<.3});
  const rm=new THREE.Mesh(roof,(bigRoof?MAT.corrugate:MAT.tarp).clone());if(!bigRoof)rm.material.color=tc;if(MAT.corrugate.onBeforeCompile)rm.material.onBeforeCompile=(bigRoof?MAT.corrugate:MAT.tarp).onBeforeCompile;root.add(rm);
  const np=bigRoof?Math.round(7+R*.35):7;for(let k=0;k<np;k++){const a=k/np*TAU+.3;const px=cx+Math.cos(a)*tr,pz=cz+Math.sin(a)*tr;const top=ty+.2;const ft=roofFoot(a,tr),px2=ft[0],pz2=ft[1],pb=ft[2];kput('tpole',[px2,(pb+top)/2,pz2],qEuler(rr(-.06,.06),0,rr(-.06,.06)),[1,top-pb,1],null);/* the canopy stands on the ROOF, not on poles up from the street (Travis) */kput('tplank',[px,top+.2,pz],qEuler(0,-a,0),[tr*2*Math.sin(Math.PI/np)*.9,.2,.35],izsC(TPLANK[1]));}
  if(bigRoof)for(let k=0;k<Math.round(R*.5);k++){const a=rng()*TAU,r=rng()*tr*.9;kput('tscrap',[cx+Math.cos(a)*r,ty+3.3-2.6*(r/tr)+.15,cz+Math.sin(a)*r],qEuler(0,rng()*TAU,0),[rr(1,2.2),.08,rr(.8,1.6)],izsC(TSCRAP[Math.floor(rng()*5)]));}}   // weights and patches
 if(H>18){for(let k=0;k<3;k++){const y=y0+H*rr(.15,.6);const a=rng()*TAU;kput('tbulb',[cx+Math.cos(a)*R*1.05,y,cz+Math.sin(a)*R*1.05],null,1,WARM);}KXF=kx0;return;}   // no ladders or scaffold up a tall block (Travis)
 const sa=rng()*TAU;const sx=cx+Math.cos(sa)*(R+1.0),sz=cz+Math.sin(sa)*(R+1.0);const lh=Math.min(topKept,y0+H*.8)-y0;
 for(const d of [-.25,.25]){const px=sx+(-Math.sin(sa))*d,pz=sz+Math.cos(sa)*d;kput('tpole',[px,y0+lh/2,pz],qEuler(-.08*Math.cos(sa),0,.08*Math.sin(sa)),[.8,lh,.8],null);}
 for(let y=y0+.3;y<y0+lh;y+=.3)kput('tplank',[sx,y,sz],qEuler(0,-sa,0),[.08,.06,.5],izsC(TPLANK[0]));
 if(R>9){const ox=-Math.sin(sa),oz=Math.cos(sa);const bays=[-3.2,-1.2,1.2,3.2];
  for(const d of bays){for(const o of [0,1.1]){const px=sx+ox*d+Math.cos(sa)*o,pz=sz+oz*d+Math.sin(sa)*o;kput('tpole',[px,y0+lh/2,pz],null,[.9,lh,.9],null);}}
  for(let y=y0+2.2;y<y0+lh;y+=2.2){for(const d of bays)kput('tpole',[sx+ox*d+Math.cos(sa)*.55,y,sz+oz*d+Math.sin(sa)*.55],qEuler(Math.PI/2,0,0).premultiply(qEuler(0,-sa,0)),[.7,1.1,.7],null);
   for(let k=0;k<2;k++)kput('tplank',[sx+ox*(-2.2+k*4.4)+Math.cos(sa)*.55,y+.1,sz+oz*(-2.2+k*4.4)+Math.sin(sa)*.55],qEuler(0,-sa,0),[2.2,.08,.9],izsC(TPLANK[1]));}}
 for(let k=0;k<3;k++){const y=y0+H*rr(.15,.6);const a=rng()*TAU;kput('tbulb',[cx+Math.cos(a)*R*1.05,y,cz+Math.sin(a)*R*1.05],null,1,WARM);}
 KXF=kx0;}

const tC=(hex,k)=>new THREE.Color(hex).multiplyScalar(k||1);
function loc2(x,z,lx,lz,ry){return[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];}
// ---- Ancients primitives (transplants)
// --- Ancients primitives (transplants) ------------------------------------------------------------
function acDrum(P,x,y,z,r,h,cc,o){o=o||{};const m=tsand(cc);const n=o.n||3.2;const fl=o.flutes||10;const g=gridSurface((u,v)=>{const th=u*TAU;const rr0=r*se(th,n)*(1+.06*Math.pow(.5+.5*Math.cos(th*fl),2))*(1-(o.taper||0)*v);return[x+rr0*Math.cos(th),y+v*h,z+rr0*Math.sin(th)];},64,4,{uS:r*2,vS:h/4});
 mesh(g,m,P);kput('ringW',[x,y+h-.3,z],qEuler(Math.PI/2,0,0),[r*1.06,r*1.06,4],tC(cc,.85));kput('ringW',[x,y+h-1.4,z],qEuler(Math.PI/2,0,0),[r*1.03,r*1.03,2.5],tC(cc,1.1));
 kput('slab',[x,y+h,z],null,[r*.98*(1-(o.taper||0)),.4,r*.98*(1-(o.taper||0))],tC(cc,1.08));
 const nw=o.nw||Math.max(4,Math.round(r*1.4));for(let yy=2.2;yy<h-1.5;yy+=3.4)for(let k=0;k<nw;k++){const th=(k+.5)/nw*TAU;if(o.door&&Math.abs(th-Math.PI/2)<.5&&yy<4)continue;const rr0=r*se(th,n)*(1-(o.taper||0)*yy/h)+.1;kput('winSmI',[x+rr0*Math.cos(th),y+yy,z+rr0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1,1.2,1],null);}
 if(o.door!==false){const rr0=r*se(Math.PI/2,n)-.1;kput('archOpen',[x,y+1.6,z+rr0],qFacing([0,0,1]),[.28,.36,1],null);}
 if(o.strip!==false)stripRing(x,y+h-2.2,z,r*.9,0,Math.round(r*2));}
function acPetalCrown(P,x,y,z,r,h,cc,n){const Q=new THREE.Group();Q.position.set(x,y,z);P.add(Q);petalRing(Q,n||6,r*.6,h,r*.7,r*.25,.6,0,0,7,tsand(cc),null);
 mesh(lathe({rFn:yy=>r*.55*Math.pow(clamp(1-Math.pow(yy/(h*.6),2),0,1),.6),H:h*.6,nu:24,nv:6}),MAT.glass,Q,0,.3,0);kput('finial',[x,y+h*.75,z],null,[.6,1,.6],null);}
function acLatticeDome(P,x,y,z,r,cc){mesh(lathe({rFn:yy=>r*Math.pow(clamp(1-Math.pow(yy/(r*.9),2),0,1),.55),H:r*.9,flutes:12,amp:.08,nu:48,nv:12,hole:(u,yy)=>Math.cos(u*TAU*12)<.3&&yy>r*.15&&yy<r*.75}),tsand(cc),P,x,y,z);
 mesh(lathe({rFn:yy=>r*.94*Math.pow(clamp(1-Math.pow(yy/(r*.9),2),0,1),.55),H:r*.9,nu:32,nv:8}),MAT.glass,P,x,y,z);kput('finial',[x,y+r*.95,z],null,[.5,.9,.5],null);}
function acVault(P,x,y,z,W,Hh,L,ry,cc,o){o=o||{};const m=tsand(cc);const q=qEuler(0,ry,0);const nr=Math.max(3,Math.round(L/4));
 for(let i=0;i<=nr;i++){const t=(i/nr-.5)*L;const p=loc2(x,z,0,t,ry);const rib=mesh(arcShape(W,Hh,W*.05,.5),m,P,p[0],y,p[1]);rib.rotation.y=ry;}
 const sk=gridSurface((u,v)=>{const lx=(u-.5)*(W-.4);const lz=(v-.5)*L;const p=loc2(x,z,lx,lz,ry);return[p[0],y+(Hh-.25)*(1-Math.pow(2*lx/(W-.4),2)),p[1]];},24,8,{uS:W/2,vS:L/2,hole:o.skylight?(u,v)=>Math.abs(u-.5)<.06:null});mesh(sk,m,P);
 if(o.skylight)mesh(gridSurface((u,v)=>{const lx=(u-.5)*W*.14;const lz=(v-.5)*L;const p=loc2(x,z,lx,lz,ry);return[p[0],y+(Hh-.3)*(1-Math.pow(2*lx/(W-.4),2)),p[1]];},4,8,{}),MAT.glass,P);
 for(const s of [-1,1]){const p=loc2(x,z,0,s*L/2,ry);const e=mesh(paraFill(W,Hh,o.doorW||W*.3,o.doorH||Hh*.55),m,P,p[0],y,p[1]);e.rotation.y=ry;
  if(o.glassEnds){const g=mesh(paraFill(o.doorW||W*.3,o.doorH||Hh*.55,0,0),MAT.glass,P,p[0],y,p[1]);g.rotation.y=ry;}
  for(let k=-2;k<=2;k++){const pp=loc2(x,z,k*W*.18,s*L/2,ry);kput('mullW',[pp[0],y+Hh*.28,pp[1]],q,[.7,Hh*.55*(1-Math.pow(k/2.8,2)),.7],tC(cc,.9));}}
 for(let i=0;i<Math.round(L/5);i++){const p=loc2(x,z,0,(i+.5)/Math.round(L/5)*L-L/2,ry);kput('strip',[p[0],y+Hh-.6,p[1]],q,[W*.5,1,1],CYAN);}}
function acStruts(P,x,y,z,r0,r1,h,n,cc,ry){for(let k=0;k<n;k++){const th=k/n*TAU+(ry||0);beam('strutW',[x+Math.cos(th)*r0,y,z+Math.sin(th)*r0],[x+Math.cos(th)*r1,y+h,z+Math.sin(th)*r1],.9,.7,tC(cc,.9));}}
function acNeedle(P,x,y,z,r,h,cc){mesh(lathe({rFn:yy=>r*(1-.55*yy/h)+.15,H:h,flutes:6,amp:.25,sharp:1.5,twist:.15,nu:24,nv:14}),tsand(cc),P,x,y,z);
 for(let yy=h*.3;yy<h-2;yy+=h*.3)kput('ringW',[x,y+yy,z],qEuler(Math.PI/2,0,0),[r*(1-.55*yy/h)*1.6,r*(1-.55*yy/h)*1.6,2],tC(cc,.85));kput('finial',[x,y+h+.6,z],null,[.5,.9,.5],null);}

// ---- the families (the Ancient halves of the Iziz building families; temple and arena are Ancient only)
const IZS_FAMILIES=[];const IZS_BY={};
function izsFamily(key,name,size,tall,fn){const p={key,name,size,tall,fn};IZS_FAMILIES.push(p);IZS_BY[key]=p;}
izsFamily('box','Box house',24,false,(P,x,z)=>{const cc=TPAL[0];{acDrum(P,x,0,z,3.4,8,cc,{door:true,nw:8});}});
izsFamily('tier','Tiered house',24,false,(P,x,z)=>{const cc=TPAL[1];{acDrum(P,x,0,z,3.6,5,cc,{door:true,nw:8});acDrum(P,x,5,z,2.3,3.6,cc,{door:false,nw:6,flutes:6});acPetalCrown(P,x,8.6,z,2.3,2.4,cc,6);}});
izsFamily('domed','Domed house',24,false,(P,x,z)=>{const cc=TPAL[2];{acDrum(P,x,0,z,3.4,5.6,cc,{door:true,nw:8});acLatticeDome(P,x,5.6,z,3.2,cc);}});
izsFamily('barrel','Barrel house',26,false,(P,x,z)=>{const cc=TPAL[3];{acVault(P,x,0,z,7.2,6,9.6,0,cc,{skylight:true,glassEnds:true,doorW:2.4,doorH:3.2});}});
izsFamily('tent','Tent house',26,false,(P,x,z)=>{const cc=TPAL[4];{const m=tsand(cc);const W=9.6,H=6.4,D=9.2;for(const sd of [-1,1]){mesh(gridSurface((u,v)=>{const q=u*2-1;const lz=q*D/2*(1-.3*v)+.4*Math.sin(Math.PI*v)*q;const lx=sd*(W/2*(1-v)+.18*W*q*q*(1-v));return[x+lx,v*H+.15,z+lz];},20,14,{uS:5,vS:3}),m,P);
   mesh(gridSurface((u,v)=>{const q=u*2-1;const lz=q*D/2*(1-.3*v)+.4*Math.sin(Math.PI*v)*q;const lx=sd*(W/2*(1-v)+.18*W*q*q*(1-v))*.96;return[x+lx,v*H+.15,z+lz];},20,14,{}),MAT.dark,P);}
  for(const sd of [-1,1]){const g=new THREE.Shape();g.moveTo(-W/2,0);g.lineTo(W/2,0);g.lineTo(0,H*.98);g.lineTo(-W/2,0);mesh(new THREE.ShapeGeometry(g),MAT.glass,P,x,.15,z+sd*D/2*.7);for(let k=-1;k<=1;k++)kput('mullW',[x+k*W*.2,H*.35*(1-Math.pow(k/2.6,2)),z+sd*D/2*.7],null,[.4,H*.7*(1-Math.pow(k/2.6,2)),.4],tC(cc,.9));}
  kput('archOpen',[x,1.4,z+D/2*.7+.1],qFacing([0,0,1]),[.28,.34,1],null);kput('boxW',[x,H+.25,z],null,[.5,.5,D*.75],tC(cc,.85));kput('slab',[x,.15,z],null,[6.2,.3,6.2],tC(cc,1.05));stripRing(x,H*.6,z,1.4,0,6);}});
izsFamily('pyr','Pyramid house',26,false,(P,x,z)=>{const cc=TPAL[5];{const m=tsand(cc);let w=7.5,y=0;for(let i=0;i<2;i++){const h=i?2.6:3.6;const w0=w;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=w0/2*se(th,3.5)*(1-.22*v)*(1+.06*Math.pow(.5+.5*Math.cos(th*12),3));return[x+r*Math.cos(th),y+v*h,z+r*Math.sin(th)];},72,6,{uS:8,vS:3}),m,P);
   kput('ringW',[x,y+h-.2,z],qEuler(Math.PI/2,0,0),[w0/2*.8,w0/2*.8,3],tC(cc,1.1));if(!i){mesh(lathe({rFn:()=>w0/2*.78*.95,H:1.2,nu:40,nv:1}),MAT.glass,P,x,y+h,z);mesh(lathe({rFn:()=>w0/2*.7,H:1.2,nu:24,nv:1}),MAT.dark,P,x,y+h,z);mullions(x,y+h,z,w0/2*.78,1.2,14,0);stripRing(x,y+h+.6,z,w0/2*.6,0,12);}
   y+=h+(i?0:1.2);w*=.72;}
  mesh(lathe({rFn:yy=>1.5*Math.pow(clamp(1-Math.pow(yy/2,2),0,1),.55),H:2,flutes:10,amp:.08,nu:32,nv:6,hole:(u,yy)=>Math.cos(u*TAU*10)<.3&&yy>.4&&yy<1.6}),tsand(0xf1dba6),P,x,y,z);mesh(lathe({rFn:yy=>1.4*Math.pow(clamp(1-Math.pow(yy/2,2),0,1),.55),H:2,nu:24,nv:5}),MAT.glass,P,x,y,z);kput('finial',[x,y+2.4,z],null,[.4,.7,.4],null);
  kput('archOpen',[x,1.5,z+3.6],qFacing([0,0,1]),[.28,.34,1],null);}});
izsFamily('setback','Setback tower',40,true,(P,x,z)=>{const cc=TPAL[6];const w=7,h=40;{const rFn=yy=>{const t=clamp(yy/h,0,1);return 3.6+1.6*Math.pow(Math.abs(t-.4)/.6,1.6);};mesh(lathe({rFn,H:h,flutes:14,amp:.09,sharp:2.5,nu:72,nv:40}),tsand(cc),P,x,4,z);
  acStruts(P,x,0,z,7,rFn(0)*.95,4.5,10,cc,0);kput('slab',[x,4.2,z],null,[rFn(0),1,rFn(0)],tC(cc,.9));
  for(let yy=6;yy<h-4;yy+=3.4)for(let k=0;k<14;k++){const th=(k+.5)/14*TAU;kput('cell',[x+(rFn(yy)+.05)*Math.cos(th),4+yy,z+(rFn(yy)+.05)*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1,.9,1],rng()<.8?WARM.clone().multiplyScalar(rr(.5,1)):new THREE.Color(0x14283c));}
  glassBand(P,rFn,h*.55,2.4,0,x,4,z,20);for(let k=0;k<14;k++){const th=k/14*TAU;beam('strutW',[x+Math.cos(th)*rFn(h)*1.02,4+h-2,z+Math.sin(th)*rFn(h)*1.02],[x+Math.cos(th)*(rFn(h)+2.4),4+h+4,z+Math.sin(th)*(rFn(h)+2.4)],.6,.5,tC(cc,.9));}
  mesh(lathe({rFn:yy=>rFn(h)*(1+.3*yy/5)*(1-.2*Math.pow(yy/5,3)),H:5,nu:32,nv:6}),MAT.glass,P,x,4+h-1,z);kput('finial',[x,4+h+7,z],null,[.9,1.6,.9],null);kput('archOpen',[x,1.6,z+rFn(0)-.2],qFacing([0,0,1]),[.3,.36,1],null);}});
izsFamily('setback2','Setback tower (stepped)',40,true,(P,x,z)=>{const cc=TPAL[6];const w=7,h=40;{const tiers=[[3.6,h*.62,14],[2.5,h*.24,10],[1.5,h*.16,8]];let y=0;tiers.forEach((t,i)=>{const [r,hh,fl]=t;mesh(lathe({rFn:yy=>r*(1-.06*yy/hh),H:hh,flutes:fl,amp:.1,sharp:2.5,nu:56,nv:Math.round(hh/2)}),tsand(cc),P,x,y,z);
   for(let yy=2.4;yy<hh-2;yy+=3.4)for(let k=0;k<fl;k++){const th=(k+.5)/fl*TAU;const rr0=r*(1-.06*yy/hh)+.1;if(i===0&&yy<4&&Math.abs(th-Math.PI/2)<.5)continue;kput('cell',[x+rr0*Math.cos(th),y+yy,z+rr0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1,.9,1],rng()<.8?WARM.clone().multiplyScalar(rr(.5,1)):new THREE.Color(0x14283c));}
   kput('ringW',[x,y+hh-.4,z],qEuler(Math.PI/2,0,0),[r*1.08,r*1.08,3],tC(cc,.85));kput('slab',[x,y+hh,z],null,[r*1.02,.4,r*1.02],tC(cc,1.08));
   if(i<2){const rn=tiers[i+1][0];mesh(lathe({rFn:()=>rn*1.12,H:1.8,nu:40,nv:1}),MAT.glass,P,x,y+hh,z);mesh(lathe({rFn:()=>rn*.95,H:1.8,nu:24,nv:1}),MAT.dark,P,x,y+hh,z);mullions(x,y+hh,z,rn*1.12,1.8,12,0);stripRing(x,y+hh+.9,z,rn*.9,0,12);
    for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*r*.98,y+hh-3,z+Math.sin(th)*r*.98],[x+Math.cos(th)*rn*1.15,y+hh+1.8,z+Math.sin(th)*rn*1.15],.5,.4,tC(cc,.9));}}
   y+=hh+(i<2?1.8:0);});
  for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*1.55,y-1,z+Math.sin(th)*1.55],[x+Math.cos(th)*2.4,y+4,z+Math.sin(th)*2.4],.5,.4,tC(cc,.9));}mesh(lathe({rFn:yy=>1.5*(1+.3*yy/3)*(1-.2*Math.pow(yy/3,3)),H:3,nu:24,nv:5}),MAT.glass,P,x,y-.5,z);kput('finial',[x,y+4.5,z],null,[.7,1.3,.7],null);
  kput('archOpen',[x,1.6,z+3.4],qFacing([0,0,1]),[.3,.36,1],null);}});
izsFamily('tyrell','Tyrell block',40,true,(P,x,z)=>{const cc=TPAL_BRUT[0];const bw=13,h=30;{const m=tsand(cc,'c');mesh(gridSurface((u,v)=>{const th=u*TAU;const r=bw/2*se(th,5)*(1-.58*v)*(1-.05*Math.pow(.5+.5*Math.cos(th*8),3));return[x+r*Math.cos(th),v*h,z+r*Math.sin(th)];},64,12,{uS:12,vS:8}),m,P);
  for(let f=0;f<4;f++){const a=f*Math.PI/2;for(let k=-1;k<=1;k++){const off=bw/2*.71+.6;beam('strutW',[x+Math.cos(a)*(off+1)+(-Math.sin(a))*k*bw*.28,0,z+Math.sin(a)*(off+1)+Math.cos(a)*k*bw*.28],[x+Math.cos(a)*(bw/2*.42*.71+.5)+(-Math.sin(a))*k*bw*.12,h,z+Math.sin(a)*(bw/2*.42*.71+.5)+Math.cos(a)*k*bw*.12],1,.8,tC(cc,.85));}}
  for(let yy=3;yy<h-3;yy+=4.5)for(let f=0;f<4;f++){const a=f*Math.PI/2+Math.PI/4;const r=bw/2*se(a,5)*(1-.58*yy/h)+.1;for(let k=-1;k<=1;k+=2){kput('dot',[x+r*Math.cos(a)+(-Math.sin(a))*k*r*.4,yy,z+r*Math.sin(a)+Math.cos(a)*k*r*.4],qFacing([Math.cos(a),0,Math.sin(a)]),[.9,.5,.4],WARM);}}
  for(let k=0;k<12;k++){const th=k/12*TAU;const r=bw/2*.42*se(th,5);beam('strutW',[x+Math.cos(th)*r,h-1,z+Math.sin(th)*r],[x+Math.cos(th)*(r+1.5),h+4,z+Math.sin(th)*(r+1.5)],.5,.4,tC(cc,.9));}
  mesh(lathe({rFn:yy=>bw/2*.42*(1+.3*yy/4)*(1-.2*Math.pow(yy/4,3)),H:4,nu:24,nv:5}),MAT.glass,P,x,h-.5,z);kput('archOpen',[x,1.7,z+bw/2-.2],qFacing([0,0,1]),[.35,.4,1],null);}});
izsFamily('wedge','Wedge block',34,true,(P,x,z)=>{const cc=TPAL_BRUT[2];const w=10,d=14,h=22;{const m=tsand(cc,'c');mesh(gridSurface((u,v)=>{const s=u*2-1;const lx=s*w/2*(1-.45*v);const lz=(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v);return[x+lx,v*h,z+lz];},20,12,{uS:6,vS:8}),m,P);
  mesh(gridSurface((u,v)=>{const s=u*2-1;const lx=s*w/2*(1-.45*v);return[x+lx,v*h,z-d/2*(1-.05*v)];},20,12,{uS:6,vS:8}),m,P);
  for(const s of [-1,1]){mesh(gridSurface((u,v)=>{const lz=lerp(-d/2*(1-.05*v),(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v),u);return[x+s*w/2*(1-.45*v),v*h,z+lz];},12,12,{uS:6,vS:8,hole:(u,v)=>{const cx=u*6,cy=v*9;return Math.abs((cx%1)-.5)<.3&&Math.abs((cy%1)-.5)<.3&&v>.08&&v<.92;}}),m,P);
   mesh(gridSurface((u,v)=>{const lz=lerp(-d/2*(1-.05*v),(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v),u);return[x+s*(w/2*(1-.45*v)-.4),v*h,z+lz];},12,12,{}),MAT.glass,P);}
  kput('slab',[x,h,z-d*.2],null,[w*.28,.5,d*.28],tC(cc,1.1));kput('archOpen',[x,1.6,z+d/2-.1],qFacing([0,0,1]),[.3,.36,1],null);stripRing(x,h*.5,z-d*.2,w*.2,0,8);}});
izsFamily('pent','Pentagon block',30,true,(P,x,z)=>{const cc=TPAL_BRUT[1];const w=10,h=20;;
 mesh(lathe({rFn:yy=>w/2*(1-.12*yy/h),H:h,flutes:5,amp:.32,sharp:1,nu:60,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let s=0;s<5;s++){const y=s*4;mesh(lathe({rFn:()=>w/2*(1-.12*(y+3.4)/h)*1.08,H:.6,flutes:5,amp:.34,sharp:1,nu:60,nv:1}),tsand(cc,'c'),P,x,y+3.4,z);
  for(let k=0;k<5;k++){const th=k/5*TAU+.2;const r=w/2*(1-.12*(y+2)/h)*1.32+.1;kput('winSmI',[x+r*Math.cos(th),y+1.9,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.3,1],null);}}
 kput('slab',[x,h,z],null,[w*.5,.5,w*.5],tC(cc,1.1));acPetalCrown(P,x,h,z,w*.42,3.5,cc,5);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
izsFamily('hept','Heptagon block',30,true,(P,x,z)=>{const cc=TPAL_BRUT[3];const w=10,h=18;;
 mesh(lathe({rFn:yy=>w/2*(1-.2*yy/h),H:h,flutes:7,amp:.3,sharp:1,nu:70,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let yy=3;yy<h-2;yy+=4)for(let k=0;k<7;k++){const th=k/7*TAU;const r=w/2*(1-.2*yy/h)*1.3+.1;kput('ovalI',[x+r*Math.cos(th),yy,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.9,.8],null);}
 for(let yy=6;yy<h-2;yy+=6)kput('ringW',[x,yy,z],qEuler(Math.PI/2,0,0),[w/2*(1-.2*yy/h)*1.32,w/2*(1-.2*yy/h)*1.32,2],tC(cc,.85));
 mesh(lathe({rFn:yy=>w/2*.8*Math.sqrt(clamp(1-Math.pow(yy/2.5,2),0,1)),H:2.5,nu:28,nv:5}),tsand(cc,'c'),P,x,h-.2,z);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
izsFamily('hall','Deco long hall',36,false,(P,x,z)=>{const cc=TPAL[7];const L=18,Wd=11,h=10;{acVault(P,x,0,z,Wd+1,h+2,L,Math.PI/2,cc,{skylight:true,glassEnds:true,doorW:4,doorH:6});
  for(let k=-1;k<=1;k++){beam('strutW',[x+k*4,0,z+Wd/2+4.5],[x+k*3,h*.7,z+Wd/2+.4],.6,.5,tC(cc,.9));}kput('strutW',[x,h*.7,z+Wd/2+2.4],qEuler(-.2,0,0),[10,.35,5],tC(cc,1.05));
  kput('archOpen',[x,2,z+Wd/2+.3],qFacing([0,0,1]),[.42,.45,1],null);}});
izsFamily('stave','Stave hall with tower',40,false,(P,x,z)=>{const cc=TPAL[8];const L=15,Wd=15,h=12;{acVault(P,x,0,z,Wd+1,h+1,L,Math.PI/2,cc,{skylight:false,glassEnds:true,doorW:4,doorH:6});acVault(P,x,0,z,Wd*.75,h*.85,L*.62,0,cc,{skylight:true,glassEnds:false,doorW:.1,doorH:.1});
  acNeedle(P,x,h+.5,z,2.2,h*1.8,cc);kput('archOpen',[x,2,z+Wd/2+.3],qFacing([0,0,1]),[.42,.45,1],null);}});
izsFamily('compound','Walled compound',30,false,(P,x,z)=>{const ac=0xc98f5c,cc=TPAL[9];const W2=7.5,D2=7.5,h=6;{const m=tsand(ac);for(let k=0;k<20;k++){const th=k/20*TAU;const r=W2*1.35*se(th,4);if(Math.abs(th-Math.PI/2)<.2)continue;kput('colW',[x+r*Math.cos(th),0,z+r*Math.sin(th)],null,[.8,3,.8],tC(ac,.9));}
  mesh(gridSurface((u,v)=>{const th=u*TAU;const r=W2*1.35*se(th,4);return[x+r*Math.cos(th),2.8+v*.7,z+r*Math.sin(th)];},64,1,{uS:20}),m,P);
  const Q=new THREE.Group();Q.position.set(x,0,z);P.add(Q);petalRing(Q,6,3.6,h*.9,4.2,1.2,.5,0,0,13,tsand(cc),null);mesh(lathe({rFn:yy=>3*Math.pow(clamp(1-Math.pow(yy/3,2),0,1),.6),H:3,nu:20,nv:5}),MAT.glass,Q,0,h*.6,0);
  mesh(lathe({rFn:yy=>1.6*(1-.05*Math.pow(yy/3.6,6)),H:3.6,nu:20,nv:4}),m,P,x-W2*.55,0,z-D2*.5);mesh(lathe({rFn:yy=>1.7*Math.sqrt(clamp(1-Math.pow(yy/1.4,2),0,1)),H:1.4,nu:20,nv:4}),m,P,x-W2*.55,3.5,z-D2*.5);
  kput('archOpen',[x,1.3,z+W2*1.35],qFacing([0,0,1]),[.25,.3,1],null);}});
izsFamily('midrise','Midrise',30,true,(P,x,z)=>{const cc=TPAL[3];const w=7,h=22;{const R=4.2;const lobe=(th,yy)=>R*(1-.25*yy/h)*(1+.3*(.5+.5*Math.cos(8*th)));mesh(lathe({rFn:yy=>R*(1-.25*yy/h),H:h,flutes:8,amp:.3,sharp:1,nu:72,nv:20}),tsand(cc),P,x,0,z);
  for(let s=0;s<5;s++){const y=s*4.2;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th,y+3.4)*.97,lobe(th,y+3.4)*1.1,v);return[x+r*Math.cos(th),y+3.6,z+r*Math.sin(th)];},72,2,{}),tsand(cc),P);
   for(let k=0;k<8;k++){const th=k/8*TAU;const r=lobe(th,y+1.8)+.1;kput('winSmI',[x+r*Math.cos(th),y+1.8,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.4,1],null);}if(s%2===0)stripRing(x,y+2.4,z,R*(1-.25*y/h)*.85,0,16);}
  kput('slab',[x,h+.2,z],null,[R*.8,.5,R*.8],tC(cc,1.1));acPetalCrown(P,x,h,z,R*.8,3,cc,8);kput('archOpen',[x,1.6,z+lobe(Math.PI/2,1)-.2],qFacing([0,0,1]),[.3,.36,1],null);}});
izsFamily('stall','Market stall',14,false,(P,x,z)=>{{mesh(lathe({rFn:yy=>.5*Math.sqrt(1+3*Math.pow((yy-1.6)/1.6,2)),H:3.2,nu:16,nv:6}),tsand(TPAL[6]),P,x,0,z);const Q=new THREE.Group();Q.position.set(x,3,z);P.add(Q);petalRing(Q,5,.4,1.2,3.2,3,1.4,0,0,17,tsand(0xe07a2a),null);
  kput('slab',[x,.5,z+1.4],null,[2.2,1,2.2],tC(TPAL[6],.9));stripRing(x,2.6,z,2,0,8);}});
izsFamily('fountain','Fountain',18,false,(P,x,z)=>{{mesh(lathe({rFn:yy=>5*Math.sqrt(clamp(1-Math.pow(yy/1.2,2),0,1))+.4,H:1.2,flutes:8,amp:.08,nu:48,nv:4}),tsand(TPAL[7]),P,x,0,z);for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*3.6,1,z+Math.sin(th)*3.6],[x+Math.cos(th)*.8,5,z+Math.sin(th)*.8],.35,.3,tC(TPAL[7],.9));}
  kput('finial',[x,5.4,z],null,[.9,1.5,.9],null);stripRing(x,1.3,z,3.8,0,16);}});
izsFamily('temple','Temple — pyramid on legs',110,true,(P,x,z)=>{const tm=0xd9924a,tmD=0xb8742e;const LEG=18,BASE=52;const m=tsand(tm),mD=tsand(tmD);
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(c=>{beam('strutW',[x+c[0]*33,0,z+c[1]*33],[x+c[0]*22,LEG+1,z+c[1]*22],5.5,4.5,tC(tmD));beam('strutW',[x+c[0]*30,0,z+c[1]*36],[x+c[0]*21,LEG+1,z+c[1]*23],2.4,2,tC(tmD));beam('strutW',[x+c[0]*36,0,z+c[1]*30],[x+c[0]*23,LEG+1,z+c[1]*21],2.4,2,tC(tmD));});
 mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(BASE/2+5)*se(th,4)*(1-.04*v);return[x+r*Math.cos(th),LEG-2+v*3.5,z+r*Math.sin(th)];},96,2,{uS:30,vS:2}),mD,P);
 mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(BASE/2+5)*se(th,4)*v;return[x+r*Math.cos(th),LEG+1.5,z+r*Math.sin(th)];},48,4,{}),m,P);
 for(let i=-3;i<=3;i++){kput('strip',[x+i*7,LEG-2.2,z+BASE/2+5.2],null,[3,1,1],CYAN);kput('strip',[x+BASE/2+5.2,LEG-2.2,z+i*7],qEuler(0,Math.PI/2,0),[3,1,1],CYAN);}
 let w=BASE,y=LEG+1.5;for(let i=0;i<3;i++){const h=10;const w0=w;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=w0/2*se(th,3.5)*(1-.16*v)*(1+.05*Math.pow(.5+.5*Math.cos(th*16),3));return[x+r*Math.cos(th),y+v*h,z+r*Math.sin(th)];},112,8,{uS:24,vS:5}),m,P);
  kput('ringW',[x,y+h-.4,z],qEuler(Math.PI/2,0,0),[w0/2*.86,w0/2*.86,5],tC(0xf1dba6));if(i<2){const yy=y+h;mesh(lathe({rFn:()=>w0/2*.8*.98,H:2.2,nu:64,nv:1}),MAT.glass,P,x,yy,z);mesh(lathe({rFn:()=>w0/2*.76,H:2.2,nu:32,nv:1}),MAT.dark,P,x,yy,z);mullions(x,yy,z,w0/2*.8,2.2,24,0);stripRing(x,yy+1.2,z,w0/2*.7,0,24);}
  for(let k=0;k<12;k++){const th=(k+.5)/12*TAU;const r=w0/2*se(th,3.5)*(1-.08)+.1;kput('winI',[x+r*Math.cos(th),y+h*.5,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.7,1],null);}
  y+=h+(i<2?2.2:0);w*=.72;}
 mesh(lathe({rFn:yy=>7*Math.pow(clamp(1-Math.pow(yy/9,2),0,1),.55),H:9,flutes:16,amp:.06,nu:48,nv:10,hole:(u,yy)=>Math.cos(u*TAU*16)<.3&&yy>1.5&&yy<7}),tsand(0xf1dba6),P,x,y,z);mesh(lathe({rFn:yy=>6.6*Math.pow(clamp(1-Math.pow(yy/9,2),0,1),.55),H:9,nu:32,nv:8}),MAT.glass,P,x,y,z);kput('finial',[x,y+10.5,z],null,[1.6,2.6,1.6],null);
 kput('archOpen',[x,y+3,z+6.6],qFacing([0,0,1]),[.7,.7,1],null);
 kput('slab',[x,.3,z],null,[24,.5,24],tC(0xf1dba6));mesh(lathe({rFn:yy=>4.5*(1-.15*yy/2.4),H:2.4,flutes:8,amp:.1,nu:32,nv:3}),mD,P,x,.5,z);kput('finial',[x,5,z],null,[1.6,1.6,1.6],null);kput('tube',[x,3.5,z],null,[.3,2,.3],null);
 for(let r=12;r<=20;r+=4)for(let i=0;i<Math.round(r*1.3);i++){const t=i/Math.round(r*1.3)*TAU;kput('boxW',[x+r*Math.cos(t),.85,z+r*Math.sin(t)],qEuler(0,-t,0),[2.4,.7,1],tC(tmD));}
 const top=[0,LEG+1.5+32,11.5],bot=[0,-.4,52];const rise=top[1]-bot[1],run=bot[2]-top[2];const th=Math.atan2(rise,run),Lr=Math.hypot(rise,run);kput('strutW',[x,bot[1]+rise/2,z+top[2]+run/2],qEuler(th,0,0),[9,1.2,Lr],tC(0xf1dba6));
 for(let k=1;k<6;k++){const t=k/6;const py=bot[1]+rise*t,pz=bot[2]-run*t;if(pz<BASE/2+5)continue;for(const s of [-1,1])beam('strutW',[x+s*6,0,z+pz+6],[x+s*3.6,py-.6,z+pz],1,.8,tC(tmD));}
 for(let k=0;k<10;k++){const t=(k+.5)/10;kput('strip',[x+4.6,bot[1]+rise*t+.2,z+bot[2]-run*t],null,[.4,1,1],CYAN);kput('strip',[x-4.6,bot[1]+rise*t+.2,z+bot[2]-run*t],null,[.4,1,1],CYAN);}});
izsFamily('arena','Arena',130,true,(P,x,z)=>{const cc=0xd4a05a,ccL=0xe6bd7e;const A0=48,B0=40;const m=tsand(cc),mL=tsand(ccL);
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=1-.12*v+.05*Math.sin(Math.PI*v);return[x+A0*s*Math.cos(th)*(1+.03*Math.pow(.5+.5*Math.cos(th*24),3)),v*21,z+B0*s*Math.sin(th)];},144,10,{uS:40,vS:6,hole:(u,v)=>Math.abs(((u*24)%1)-.5)<.18&&v>.12&&v<.62}),m,P);
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=.86;return[x+A0*s*Math.cos(th),2+v*17,z+B0*s*Math.sin(th)];},96,2,{}),MAT.dark,P);
 for(let k=0;k<36;k++){const th=k/36*TAU;beam('strutW',[x+(A0+8)*Math.cos(th),0,z+(B0+7)*Math.sin(th)],[x+A0*.9*Math.cos(th),21,z+B0*.9*Math.sin(th)],1.6,1.3,tC(cc,.85));}
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=lerp(.88,.98,v);return[x+A0*s*Math.cos(th),21+v*4,z+B0*s*Math.sin(th)];},96,2,{uS:40}),mL,P);
 for(let k=0;k<24;k++){const th=(k+.5)/24*TAU;kput('strip',[x+A0*.93*Math.cos(th),24.6,z+B0*.93*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[6,1,1],CYAN);}
 for(let k=0;k<6;k++){const a=A0-9-k*3.1,b=B0-8-k*2.7;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(a-3.1,a,v);return[x+r*Math.cos(th),12-k*2+(v<.5?2:0),z+r*b/a*Math.sin(th)];},96,2,{}),mL,P);}
 for(let k=0;k<8;k++){const th=(k+.5)/8*TAU;const px=x+A0*.72*Math.cos(th),pz=z+B0*.72*Math.sin(th);mesh(lathe({rFn:yy=>.5*Math.sqrt(1+2*Math.pow((yy-5)/5,2)),H:10,nu:12,nv:4}),mL,P,px,22,pz);
  const Q=new THREE.Group();Q.position.set(px,31,pz);Q.rotation.y=-th;P.add(Q);petalRing(Q,3,.4,3,8,9,1.6,0,0,20+k,tsand(0xf1dba6),null);}
 kput('slab',[x,.2,z],null,[A0-28,.4,B0-24],tC(0xd8c090));for(let k=0;k<4;k++){const th=k/4*TAU+Math.PI/4;kput('archOpen',[x+A0*.98*Math.cos(th),5,z+B0*.98*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.1,2],null);}});

// ---- placing one family: mode 'intact' | 'ruin' | 'rehab'. The same steps as Iziz's TRANS.place (reseed, build in a
// group under the nested transform, wreck() for the two decayed states, the dark-blue glass), plus a REG entry.
MAT.izsGlass=new THREE.MeshStandardMaterial({color:0x2a4a66,metalness:.55,roughness:.18,emissive:0x0a1a2a,emissiveIntensity:.5,side:DS});
let IZS_ROOT=null;
function izsPlace(scene,key,mode,x,z,ry,scale,seed,y){const p=IZS_BY[key];if(!p){reportErr('izsPlace: no family '+key);return null;}
 y=y||0;scale=scale||1;ry=ry||0;if(!IZS_ROOT){IZS_ROOT=new THREE.Group();scene.add(IZS_ROOT);}
 reseed(seed);const ranges={};for(const n in KIT.items)ranges[n]=KIT.items[n].length;
 const P=new THREE.Group();P.position.set(x,y,z);P.rotation.y=ry;P.scale.setScalar(scale);scene.add(P);P.updateMatrixWorld(true);
 const k0=KOFF;KOFF=[0,0,0];useGroupXF(P);if(scale!==1)KXF.s=scale;
 try{p.fn(P,0,0);}catch(e){reportErr('iziz style '+key+' '+e.stack);}
 endGroupXF();KOFF=k0;
 if(mode==='ruin'||mode==='rehab'){try{wreck(P,IZS_ROOT,ranges,mode,x,z,seed+1);}catch(e){reportErr('wreck '+key+' '+e.stack);}}
 P.traverse(m=>{if(m.isMesh&&m.material===MAT.glass)m.material=MAT.izsGlass;});
 REG.push({name:p.name+' — Ancient Iziz Style'+(mode==='ruin'?' (destroyed)':mode==='rehab'?' (rehabilitated)':' (intact)'),x,y,z,r:p.size*.45*scale,h:p.size*1.2*scale});
 return P;}

// ---- the Ancient-kit variants Iziz invented (moved from the Iziz city build unchanged)
const izsFlat=f=>typeof withFlatGround==='function'?withFlatGround(f):f();   // Iziz flattens its terrain while it measures
// one TYPE out of a kit builder that lays several side by side (apartments A/B/C, offices A/B/C, houses A-F): build the
// lot, then keep only what stands in the type's x-range of the builder's own frame (items, meshes, REG volumes)
function kitSection(fn,x0,x1){return function(G,gx,gz,d){const snap=kitSnapshot(),r0=REG.length;const inv=KXF?KXF.m.clone().invert():new THREE.Matrix4();
 const H=fn(G,gx,gz,d);const v=new THREE.Vector3();
 for(const n in KIT.items){const it=KIT.items[n];let w=snap[n]||0;for(let i=w;i<it.length;i++){v.set(it[i].p[0],it[i].p[1],it[i].p[2]).applyMatrix4(inv);if(v.x>=x0&&v.x<=x1)it[w++]=it[i];}it.length=w;}
 G.updateMatrixWorld(true);const gi=G.matrixWorld.clone().invert();const dead=[];
 G.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld).applyMatrix4(gi);const cx=(b.min.x+b.max.x)/2;if(cx<x0||cx>x1)dead.push(m);});
 for(const m of dead)m.parent.remove(m);
 for(let i=REG.length-1;i>=r0;i--)if(REG[i].x<x0||REG[i].x>x1)REG.splice(i,1);
 return H;};}
MAT.concRust=MAT.rust.clone();MAT.concRust.color=new THREE.Color(1,.93,.86);if(MAT.rust.onBeforeCompile)MAT.concRust.onBeforeCompile=MAT.rust.onBeforeCompile;
// Skyscraper D is bare concrete in the kit: its ruined and reclaimed skins go to rust-streaked steel (Travis)
function izsRustSkin(G){G.traverse(m=>{if(m.isMesh&&(m.material===MAT.concreteR||m.material===MAT.concrete))m.material=MAT.concRust;});}
// T: {awnings (array the caller bakes), post, ball, rope (kit item names), col (hex -> Color), stall(col) (builds
// one stall at the current group transform; the group is passed too), culture (REG tag), stalls (optional array: every
// stall's {x,y,z,face} is pushed to it — the life layer's market destinations), maxCanopies (default 90)}
// THE TRIPOD MARKET (Travis): a reclaimed Skyscraper C hangs a great awning from each side of its leg triangle, sloping out to
// a mast at the opposite point, so from above the legs' triangle and the three awnings make a six-pointed star; market
// stalls stand in the shade under each awning and in the open triangle between the legs.
// The legs' foot radius is read off the built tower: Skyscraper C's three leg groups stand at y=5 on its podium, 62 m out
// until the towers QA round 2, 50 m after it and 38 m since the restand (their heads still meet the shaft at r=20, 150 m up). Hardcoding 62 hung
// every awning, mast and stall 12 m off the legs once they moved.
function tripodLegR(G){let r=0;G.traverse(c=>{if(r||!c.isGroup||c===G||c.position.y!==5||!c.children.length)return;const h=Math.hypot(c.position.x,c.position.z);if(h>20&&h<120)r=h;});return r||62;}
// DENSER (Travis, round 4): the great awnings reach half again further out; their stalls stand on a lattice that fills the
// shade, not on one line; and a ring of smaller canopies — a sloping cloth on four poles over a stall each — fills the
// star's notches and the ground round it out to the lot's edge, clear of the leg feet, the masts and their guy ropes.
// The whole market registers as ONE market (type market/shop, tags.market, tags.destination 'market').
function tripodMarket(G,o,y,scale,ry,gx,gz,y0,T){const LR=tripodLegR(G),legAt=(k,ly)=>{const th=k/3*TAU+Math.PI/6,r=LR-(LR-20)*(ly-5)/150;return loc2(gx,gz,Math.cos(th)*r*scale,Math.sin(th)*r*scale,ry);};
 const hb=38,rb=LR-(LR-20)*(hb-5)/150;const Y=ly=>y0+ly*scale;const cols=[0xe07a2a,0xc9442a,0xe0a030];const yg=y+1.55;
 const tris=[],masts=[],feet=[0,1,2].map(k=>legAt(k,5));let nStall=0;
 // the legs are 22 m in radius at the foot (15*sqrt(2.2)): a stall or canopy nearer a foot than that stands INSIDE the
 // leg. With the feet at 62 or 50 the lattice never got there; at 38 (the restand) six stalls did. LF is the clearance.
 const LF=(15*Math.sqrt(2.2)+1.5)*scale;
 const stallAt=(x,z,face,c)=>{const Gs=new THREE.Group();Gs.position.set(x,yg,z);Gs.rotation.y=face;scene.add(Gs);useGroupXF(Gs);try{T.stall(c,Gs);}finally{endGroupXF();}
  nStall++;if(T.stalls)T.stalls.push({x,y:yg,z,face});};
 const clothQuad=(c,P)=>{const pos=[],uv=[],N=3;const at=(u,v)=>P(u,v);for(let i=0;i<N;i++)for(let j=0;j<N;j++){for(const[a,b]of[[0,0],[1,0],[0,1],[1,0],[1,1],[0,1]]){const q=at((i+a)/N,(j+b)/N);pos.push(...q);uv.push(q[0]*.5,q[2]*.5);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();T.awnings.push({g,c});};
 for(let k=0;k<3;k++){const a=legAt(k,hb),b=legAt((k+1)%3,hb);const tm=(k+.5)/3*TAU+Math.PI/6;const ap=loc2(gx,gz,Math.cos(tm)*rb*scale*1.5,Math.sin(tm)*rb*scale*1.5,ry);
  const ya=Y(hb),yp=y+6.5;tris.push([a,b,ap]);masts.push(ap);
  // the awning: a sagging cloth triangle, 8 x 8 subdivided so the fall line reads
  const pos=[],uv=[],N=8;const P=(u,v)=>{const w=1-u-v;const sag=-1.8*Math.sin(Math.PI*Math.min(1,u+v))*(1-Math.abs(u-v));return[a[0]*w+b[0]*u+ap[0]*v,ya*(w+u)+yp*v+sag,a[1]*w+b[1]*u+ap[1]*v];};
  for(let i=0;i<N;i++)for(let j=0;j<N-i;j++){const q=[[i,j],[i+1,j],[i,j+1]];const add=t=>{for(const[ii,jj]of t){const p=P(ii/N,jj/N);pos.push(...p);uv.push(p[0]*.5,p[2]*.5);}};add(q);if(i+j<N-1)add([[i+1,j],[i+1,j+1],[i,j+1]]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  T.awnings.push({g,c:cols[k]});
  // the mast at the point, guy ropes, a valance along the leading edges
  kput(T.post,[ap[0],y,ap[1]],null,[.35,yp-y+.4,.35],T.col(0xe2b676));kput(T.ball,[ap[0],yp+.5,ap[1]],null,[.4,.4,.4],T.col(0x8a6a2a));
  for(const s2 of[-1,1]){const g2=loc2(ap[0],ap[1],s2*3,0,tm);beam(T.rope,[ap[0],yp+.3,ap[1]],[g2[0]+(ap[0]-gx)*.15,y,g2[1]+(ap[1]-gz)*.15],.05,.05,T.col(0xa89878));}
  // stalls in the shade: a lattice over the awning's footprint, each facing along the fall line
  const face=Math.atan2(ap[0]-gx,ap[1]-gz)+Math.PI/2,L=6;
  for(let i=1;i<L;i++)for(let j=1;i+j<L;j++){const u=i/L,v=j/L,w=1-u-v;if(w<.1)continue;const x=a[0]*w+b[0]*u+ap[0]*v,z=a[1]*w+b[1]*u+ap[1]*v;
   if(feet.some(f=>Math.hypot(x-f[0],z-f[1])<LF))continue;if(Math.hypot(x-ap[0],z-ap[1])<5)continue;stallAt(x,z,face,T.col(cols[(k+i+j)%3]));}}
 // and the open triangle between the legs
 for(let t=0;t<3;t++){const th=t/3*TAU+Math.PI/2,r=rb*scale*.3;stallAt(o.x+Math.cos(th)*r,o.z+Math.sin(th)*r,-th,undefined);}
 // the ring of canopies: on rings 7.6 m apart from just outside the leg triangle to the lot's edge (or the star's reach
 // plus a margin, whichever is nearer), every 8 m round each ring; a canopy goes where none of its corners is under a
 // great awning, near a leg foot or a mast, or off the lot
 const inTri=(x,z,t)=>{const s=(p,q,r)=>(p[0]-r[0])*(q[1]-r[1])-(q[0]-r[0])*(p[1]-r[1]);const P=[x,z],d1=s(P,t[0],t[1]),d2=s(P,t[1],t[2]),d3=s(P,t[2],t[0]);return!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0));};
 const oc=Math.cos(o.ry||0),os=Math.sin(o.ry||0);const onLot=(x,z)=>{const dx=x-o.x,dz=z-o.z;return Math.abs(dx*oc-dz*os)<o.hx-1.5&&Math.abs(dx*os+dz*oc)<o.hz-1.5;};
 const reach=Math.min(Math.hypot(o.hx,o.hz),rb*scale*1.5+14),CW=3.4,CD=2.7,ccols=[0xe07a2a,0xc9442a,0xe0a030,0xd8623a,0xb8862a,0x3a7a5a];let nc=0;const maxC=T.maxCanopies||90;
 for(let R=rb*scale*.62+4;R<=reach&&nc<maxC;R+=7.6){const n=Math.max(6,Math.floor(TAU*R/8));const off=R*.37;
  for(let i=0;i<n&&nc<maxC;i++){const th=i/n*TAU+off,x=o.x+R*Math.cos(th),z=o.z+R*Math.sin(th),cry=Math.atan2(o.x-x,o.z-z);
   const cs=[[-CW,-CD],[CW,-CD],[CW,CD],[-CW,CD]].map(c=>loc2(x,z,c[0],c[1],cry));
   if(!cs.every(c=>onLot(c[0],c[1])))continue;
   if(cs.concat([[x,z]]).some(c=>tris.some(t=>inTri(c[0],c[1],t))))continue;
   if(feet.some(f=>Math.hypot(x-f[0],z-f[1])<CW+Math.max(4.5,LF)))continue;if(masts.some(m=>Math.hypot(x-m[0],z-m[1])<CW+5))continue;
   const c=ccols[(i+Math.round(R))%ccols.length],hi=yg+3.7,lo=yg+2.7;
   // the cloth: high on the side facing the tripod, low on the outside, a little sag
   clothQuad(c,(u,v)=>{const p=loc2(x,z,(u*2-1)*(CW+.3),(v*2-1)*(CD+.3),cry);return[p[0],lo+(hi-lo)*v-.25*Math.sin(Math.PI*u)*Math.sin(Math.PI*v),p[1]];});
   for(const q of cs){const h=(q===cs[2]||q===cs[3])?hi:lo;kput(T.post,[q[0],yg,q[1]],null,[.16,h-yg,.16],T.col(0xe2b676));}
   stallAt(x,z,cry+Math.PI,T.col(c));nc++;}}
 REG.push({name:'Tripod market',x:o.x,y:y,z:o.z,r:Math.max(rb*scale*1.6,reach),h:12,cls:'building',key:'city_tripod_market',
  tags:{culture:T.culture,type:['market/shop'],wealth:'middle',lit:true,market:true,destination:'market',stalls:nStall,canopies:nc,note:'awnings hung from a reclaimed Skyscraper C; a life-layer market destination'}});}
// an instanced item's world-space box: the def geometry's own bounds through the item's scale and rotation (a torus or
// cylinder is radius 1, a box half-size .5 — measuring by the scale alone got every ring half its real size)
const _defBB={};function itemBox(n,q){let bb=_defBB[n];if(!bb){const g=KIT.defs[n]&&KIT.defs[n].geo;if(!g){return null;}g.computeBoundingBox();bb=_defBB[n]=g.boundingBox.clone();}
 const sz=typeof q.s==='number'?[q.s,q.s,q.s]:q.s;const out=new THREE.Box3(),v=new THREE.Vector3();
 for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z]){v.set(x*sz[0],y*sz[1],z*sz[2]);if(q.q)v.applyQuaternion(q.q);out.expandByPoint(v.set(v.x+q.p[0],v.y+q.p[1],v.z+q.p[2]));}
 return out;}
function kitSnapshot(){const s={};for(const n in KIT.items)s[n]=KIT.items[n].length;return s;}
function kitRestore(s){for(const n in KIT.items)KIT.items[n].length=s[n]||0;}
// build once into a throwaway group to learn the footprint (centre + half sizes) — then discard every trace of it.
// d picks the state measured (3 by default; the toppled tower is measured at 2 to find where its upper body lies).
function kitBuildParts(cat,d){const snap=kitSnapshot(),r0=REG.length,st=JSON.stringify(TSTAT.by),bad=TSTAT.bad.length,cur=TSTAT.cur;
 const G=new THREE.Group();KOFF=[0,0,0];HOLES=d===3?.55:1;TSTAT.cur='measure';useGroupXF(G);
 try{izsFlat(()=>cat.fn(G,0,0,d));}catch(e){reportErr('measure '+cat.name+' '+e.stack);}endGroupXF();HOLES=1;KOFF=[0,0,0];
 const parts=[];G.updateMatrixWorld(true);G.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();parts.push(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});
 for(const n in KIT.items){if(/^(trunk|leafCard|moss|vine|rubble|fig|hedge|stain)/.test(n))continue;const it=KIT.items[n];for(let i=snap[n]||0;i<it.length;i++){const o=it[i],p=o.p,sz=typeof o.s==='number'?[o.s,o.s,o.s]:o.s;
  const b=itemBox(n,o);if(b)parts.push(b);}}
 kitRestore(snap);REG.length=r0;TSTAT.by=JSON.parse(st);TSTAT.bad.length=bad;TSTAT.cur=cur;return parts;}
function measureKit(cat){if(cat.meas)return cat.meas;const parts=kitBuildParts(cat,3);const bb=new THREE.Box3();for(const b of parts)bb.union(b);
 // the CORE: what stands above the plinth line (the platforms and plazas the kit lays round a building are trimmed at
 // placement — Travis: shrink the plinths so more pack in). A skyscraper's core is its SHAFT (the upper half).
 const th=Math.min(10,.3*bb.max.y);const coreTh=cat.kind==='sky'?bb.max.y*(cat.coreFrac||.5):th;
 const core=new THREE.Box3();for(const b of parts)if(b.max.y>coreTh)core.union(b);if(!isFinite(core.min.x))core.copy(bb);
 // the shaft's foot: the lowest part that stands inside the core's footprint and rises past the plinth line
 // a tower's PODIUM top: the highest low part wider than the shaft. Everything at or under it is the kit's podium and goes;
 // the shaft is lowered so that level lands on the city's own square plinth.
 let baseY=0;if(cat.kind==='sky'){const cw=Math.max(core.max.x-core.min.x,core.max.z-core.min.z);for(const b of parts){if(b.max.y>bb.max.y*.12||b.max.y<0)continue;if(Math.max(b.max.x-b.min.x,b.max.z-b.min.z)<cw*1.1)continue;baseY=Math.max(baseY,b.max.y);}}
 // the SHAFT: everything above the podium, legs included (Skyscraper A's legs lean out past its core; a placer that must
 // keep them on the lot fits by this, measured about the core centre)
 const cxm=(core.min.x+core.max.x)/2,czm=(core.min.z+core.max.z)/2;let shx=0,shz=0;for(const b of parts){if(b.max.y<=baseY+1)continue;shx=Math.max(shx,Math.abs(b.min.x-cxm),Math.abs(b.max.x-cxm));shz=Math.max(shz,Math.abs(b.min.z-czm),Math.abs(b.max.z-czm));}
 cat.meas={cx:cxm,cz:czm,hx:Math.max(4,(core.max.x-core.min.x)/2),hz:Math.max(4,(core.max.z-core.min.z)/2),h:bb.max.y,th:cat.kind==='sky'?coreTh:th,baseY,
  full:{hx:(bb.max.x-bb.min.x)/2,hz:(bb.max.z-bb.min.z)/2},shaft:{hx:Math.max(4,shx),hz:Math.max(4,shz)}};return cat.meas;}
// drop what a kit builder laid BEYOND the plot below the plinth line (plinths, plazas, aprons, the colonnade round a
// tower's podium): an instanced item or a mesh goes when it is low and any part of it leaves the plot by more than 2 m.
// `keep` (an OBB, or a list of them) protects a region — the toppled tower's fallen body (both pieces of a broken one).
function trimPlinths(G,snap,o,y,scale,th,keep,podY){const c=Math.cos(o.ry),s=Math.sin(o.ry);const pod=podY!=null?podY:-1e9;
 const outOf=(wx,wz,e,B)=>{const dx=wx-B.x,dz=wz-B.z,cc=Math.cos(B.ry),ss=Math.sin(B.ry);const lx=cc*dx-ss*dz,lz=ss*dx+cc*dz;return Math.abs(lx)+e>B.hx+2||Math.abs(lz)+e>B.hz+2;};
 const K=keep?(Array.isArray(keep)?keep:[keep]):[];const kept=(wx,wz)=>K.some(B=>!outOf(wx,wz,0,B));const lowY=y+th*scale*.9;   // keep: one OBB or a list
 for(const n in KIT.items){const it=KIT.items[n];const a=snap[n]||0;if(it.length<=a)continue;let w=a;
  for(let i=a;i<it.length;i++){const q=it[i],b=itemBox(n,q);if(!b){it[w++]=q;continue;}const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,e=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2;
   if(((b.max.y<lowY&&outOf(cx,cz,e,o))||b.max.y<pod+.3)&&!kept(cx,cz))continue;it[w++]=q;}it.length=w;}
 const dead=[];G.updateMatrixWorld(true);G.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
  const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,e=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)/2;
  if(((b.max.y<lowY&&outOf(cx,cz,e,o))||b.max.y<pod+.3)&&!kept(cx,cz))dead.push(m);});
 for(const m of dead)m.parent.remove(m);}
function kitTris(){let t=0;for(const k in TSTAT.by)t+=TSTAT.by[k].tris;return t;}
