// ================================================================= IZIZ TRANSPLANT — the Iziz building families (claude/iziz-transplant.html, r5) ported to this repo
// Per family two vocabularies: the ORIGINAL Iziz massing (izBlock etc.) and the Ancients TRANSPLANT (drums, vaults,
// petal crowns), and for each a post-build `wreck()` pass that makes the destroyed or the rehabilitated state.
// Names are prefixed t*/T* where the showcase's would collide with the vendored kit. The pair functions themselves
// are the showcase's, unchanged, so the buildings are the ones Travis approved.
//
// Placement contract (used by the city): TRANS.place(scene, kind, mode, x, z, ry, scale, seed, extraTags, y) — mode is
// 'orig' | 'ruin' | 'rehab' (Iziz original: intact / destroyed / rehabilitated) or 'anc' | 'ancruin' | 'ancrehab'
// (Ancients transplant). Pueblo is defined but EXCLUDED from placement (Travis). Palace is 'orig' only, temple and
// arena 'anc' only, one of each, placed by the city target. TRANS.bake() merges the one-off meshes per material.
const TPAL=[0xe9cb8c,0xdcb474,0xcf9d5b,0xe2ab5e,0xbf8a44,0xf1dba6,0xd8893c,0xc8a26a,0xe6bd7e,0xd4a05a];
const TPAL_BRUT=[0xb9a58a,0xa8957a,0xc7b294,0x9c8b70,0xd2bc9c];
const TTIMBER=0x5e3f28,TTIMBER2=0x74513a,TTRIM=0x6e5428;
const _tmc={};function tsand(hex,tex){const k=hex+'_'+(tex||'p');if(_tmc[k])return _tmc[k];const m=new THREE.MeshStandardMaterial({map:tex==='c'?TEX.concrete:TEX.panel,color:hex,metalness:tex==='c'?0:.3,roughness:tex==='c'?.9:.42,side:DS});_tmc[k]=m;return m;}
kdef('frus93',vnWedgeGeo(.93,.93),MAT.white);kdef('frus90',vnWedgeGeo(.9,.9),MAT.white);kdef('frus88',vnWedgeGeo(.88,.88),MAT.white);kdef('frus85',vnWedgeGeo(.85,.85),MAT.white);kdef('frus60',vnWedgeGeo(.6,.6),MAT.white);kdef('frusT',vnWedgeGeo(.42,.42),MAT.white);kdef('frusWd',vnWedgeGeo(.55,.1),MAT.white);kdef('frusPyr',vnWedgeGeo(.05,.05),MAT.white);kdef('frus82',vnWedgeGeo(.82,.82),MAT.white);
kdef('pent',new THREE.CylinderGeometry(.88,1,1,5).rotateY(Math.PI/5).translate(0,.5,0),MAT.white);kdef('hept',new THREE.CylinderGeometry(.8,1,1,7).translate(0,.5,0),MAT.white);
kdef('dome',new THREE.SphereGeometry(1,16,10,0,TAU,0,Math.PI/2),MAT.white);kdef('gable',vnWedgeGeo(1,.04),MAT.white);
kdef('lampI',new THREE.BoxGeometry(1,1,1),MAT.dot);
MAT.scrap=new THREE.MeshStandardMaterial({map:TEX.rust,color:0xffffff,roughness:.9,metalness:.2,side:DS});MAT.plank=new THREE.MeshStandardMaterial({map:TEX.wood,color:0xffffff,roughness:1,side:DS});vWorldUV(MAT.plank,.5);
kdef('tscrap',new THREE.BoxGeometry(1,1,1),MAT.scrap);kdef('tplank',new THREE.BoxGeometry(1,1,1),MAT.plank);kdef('tpole',new THREE.CylinderGeometry(.12,.12,1,6),MAT.pipeRust);kdef('tbulb',new THREE.SphereGeometry(.22,6,5),MAT.dot);
const TSCRAP=[0x8a3a2a,0x7a7a72,0x9a8a6a,0x5a6a3a,0x6a6a80],TPLANK=[0xb08a5a,0xc8a070,0x9a7a4a],TTARP=[0x2a5a8a,0xe07a2a,0x3a7a5a,0x8a3a3a,0xe0a030];
const _trm={};function rustify(m){if(!m||m===MAT.glass)return m;if(m===MAT.white)return MAT.rust;if(m.map===TEX.panel&&m!==MAT.white){const k='w'+m.color.getHex();if(!_trm[k])_trm[k]=new THREE.MeshStandardMaterial({map:TEX.rust,color:new THREE.Color(m.color).multiplyScalar(.85),roughness:.95,metalness:.15,side:DS});return _trm[k];}if(m===MAT.concrete)return MAT.concreteR;if(m===MAT.winIntact)return MAT.winDead;if(_trm[m.uuid])return _trm[m.uuid];
 const n=new THREE.MeshStandardMaterial({map:TEX.rust,color:new THREE.Color(m.color).multiplyScalar(.85),roughness:.95,metalness:.15,side:DS});_trm[m.uuid]=n;return n;}
const DEADNAME={winI:'winD',winBigI:'winBigD',winSmI:'winSmD',ovalI:'ovalD',mullW:'mullR',colW:'colR',strutW:'strutR',ringW:'ringR',pipe:'pipeR',boxW:'boxR',boxC:'boxCR',slabC:'slabCR',pane:'paneD',plateW:'plateR',arch:'archR',vaultRib:'vaultRibR',finial:null,lampI:null,tbulb:null,pierW:'pierR'};
// ---- generic post-build passes: 'ruin' and 'rehab' ---------------------------------------------------------------
// P is the (possibly transformed) group the pair built into; `root` is an IDENTITY group in the scene that receives
// the cut geometry (which is computed in world space). ranges = KIT.items lengths before the pair ran.
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
  const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry).clone();g.applyMatrix4(m.matrixWorld);const p=g.attributes.position.array,uv=g.attributes.uv?g.attributes.uv.array:null;
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
  kput(plank?'tplank':'tscrap',[g[0]+g[3]*.15,g[1]+g[4]*.15,g[2]+g[5]*.15],q.multiply(qEuler(0,0,rr(-.2,.2))),[s*rr(.7,1.3),plank?s*.3:s*rr(.6,1.1),.18],vC(plank?TPLANK[Math.floor(rng()*3)]:TSCRAP[Math.floor(rng()*5)]));
  if(rng()<.08)kput('tbulb',[g[0]+g[3]*.6,g[1]+g[4]*.6+.4,g[2]+g[5]*.6],null,1,WARM);}
 // where a canopy pole can stand: walking in from radius r along bearing a to the first point with fabric within 1.5 m
 // horizontally and within 5 m of the kept top (the roof), so a pole never hangs in the air round a narrow crown
 const RV=[];for(const g of cutGeos){const pa=g.attributes.position.array;for(let i=0;i<pa.length;i+=9)if(pa[i+1]>topKept-5)RV.push(pa[i],pa[i+1],pa[i+2]);}
 const roofFoot=(a,r)=>{for(let rr2=r;rr2>=.5;rr2-=.75){const px=cx+Math.cos(a)*rr2,pz=cz+Math.sin(a)*rr2;let y=-1e9;for(let i=0;i<RV.length;i+=3)if(Math.abs(RV[i]-px)<1.5&&Math.abs(RV[i+2]-pz)<1.5&&RV[i+1]>y)y=RV[i+1];if(y>-1e8)return[px,pz,y-.2];}return[cx+Math.cos(a)*r,cz+Math.sin(a)*r,topKept-.3];};
 // the ROOF over the cut: a draped tarp on poles for a small building, a corrugated-sheet cap on more poles for a big one
 // (a rehabilitated building always gets its roof back — the old pass only scattered planks over anything past R 22)
 const tc=vC(TTARP[Math.floor(rng()*5)]);const tr=R*.7;const ty=topKept+1.6;const bigRoof=R>=22;
 {const K=.5;const roof=gridSurface((u,v)=>{const a=u*TAU,r=v*tr;return[cx+r*Math.cos(a),ty+(bigRoof?3.2-2.6*v:2.4-2.2*v*v)+.4*Math.sin(a*5)*(bigRoof?0:1),cz+r*Math.sin(a)];},bigRoof?40:24,bigRoof?6:5,{uS:tr*TAU*K,vS:tr*K,hole:bigRoof?null:(u,v)=>fbm(u*5+seed,v*4,3,2)<.3});
  const rm=new THREE.Mesh(roof,(bigRoof?MAT.corrugate:MAT.tarp).clone());if(!bigRoof)rm.material.color=tc;if(MAT.corrugate.onBeforeCompile)rm.material.onBeforeCompile=(bigRoof?MAT.corrugate:MAT.tarp).onBeforeCompile;root.add(rm);
  const np=bigRoof?Math.round(7+R*.35):7;for(let k=0;k<np;k++){const a=k/np*TAU+.3;const px=cx+Math.cos(a)*tr,pz=cz+Math.sin(a)*tr;const top=ty+.2;const ft=roofFoot(a,tr),px2=ft[0],pz2=ft[1],pb=ft[2];kput('tpole',[px2,(pb+top)/2,pz2],qEuler(rr(-.06,.06),0,rr(-.06,.06)),[1,top-pb,1],null);/* the canopy stands on the ROOF, not on poles up from the street (Travis) */kput('tplank',[px,top+.2,pz],qEuler(0,-a,0),[tr*2*Math.sin(Math.PI/np)*.9,.2,.35],vC(TPLANK[1]));}
  if(bigRoof)for(let k=0;k<Math.round(R*.5);k++){const a=rng()*TAU,r=rng()*tr*.9;kput('tscrap',[cx+Math.cos(a)*r,ty+3.3-2.6*(r/tr)+.15,cz+Math.sin(a)*r],qEuler(0,rng()*TAU,0),[rr(1,2.2),.08,rr(.8,1.6)],vC(TSCRAP[Math.floor(rng()*5)]));}}   // weights and patches
 if(H>18){for(let k=0;k<3;k++){const y=y0+H*rr(.15,.6);const a=rng()*TAU;kput('tbulb',[cx+Math.cos(a)*R*1.05,y,cz+Math.sin(a)*R*1.05],null,1,WARM);}KXF=kx0;return;}   // no ladders or scaffold up a tall block (Travis)
 const sa=rng()*TAU;const sx=cx+Math.cos(sa)*(R+1.0),sz=cz+Math.sin(sa)*(R+1.0);const lh=Math.min(topKept,y0+H*.8)-y0;
 for(const d of [-.25,.25]){const px=sx+(-Math.sin(sa))*d,pz=sz+Math.cos(sa)*d;kput('tpole',[px,y0+lh/2,pz],qEuler(-.08*Math.cos(sa),0,.08*Math.sin(sa)),[.8,lh,.8],null);}
 for(let y=y0+.3;y<y0+lh;y+=.3)kput('tplank',[sx,y,sz],qEuler(0,-sa,0),[.08,.06,.5],vC(TPLANK[0]));
 if(R>9){const ox=-Math.sin(sa),oz=Math.cos(sa);const bays=[-3.2,-1.2,1.2,3.2];
  for(const d of bays){for(const o of [0,1.1]){const px=sx+ox*d+Math.cos(sa)*o,pz=sz+oz*d+Math.sin(sa)*o;kput('tpole',[px,y0+lh/2,pz],null,[.9,lh,.9],null);}}
  for(let y=y0+2.2;y<y0+lh;y+=2.2){for(const d of bays)kput('tpole',[sx+ox*d+Math.cos(sa)*.55,y,sz+oz*d+Math.sin(sa)*.55],qEuler(Math.PI/2,0,0).premultiply(qEuler(0,-sa,0)),[.7,1.1,.7],null);
   for(let k=0;k<2;k++)kput('tplank',[sx+ox*(-2.2+k*4.4)+Math.cos(sa)*.55,y+.1,sz+oz*(-2.2+k*4.4)+Math.sin(sa)*.55],qEuler(0,-sa,0),[2.2,.08,.9],vC(TPLANK[1]));}}
 for(let k=0;k<3;k++){const y=y0+H*rr(.15,.6);const a=rng()*TAU;kput('tbulb',[cx+Math.cos(a)*R*1.05,y,cz+Math.sin(a)*R*1.05],null,1,WARM);}
 KXF=kx0;}

const tC=(hex,k)=>new THREE.Color(hex).multiplyScalar(k||1);
// --- Iziz primitives (originals) ------------------------------------------------------------------
function izBlock(x,y,z,w,h,d,ry,cc,o){o=o||{};const q=qEuler(0,ry,0);const col=tC(cc);kput('boxW',[x,y+h/2,z],q,[w,h,d],col);
 if(!o.plain){kput('boxW',[x,y+h-.4,z],q,[w+.6,.5,d+.6],tC(cc,1.12));kput('boxW',[x,y+h-1.2,z],q,[w+.3,.3,d+.3],tC(cc,.8));
  const n=Math.max(1,Math.round(w/2.2));for(let i=0;i<n;i++){const lx=((i+.5)/n-.5)*w*.8;for(const s of [-1,1]){const p=loc2(x,z,lx,s*(d/2+.05),ry);kput('finW',[p[0],y+h*.55,p[1]],q,[.7,h*.7,.3],null);}}}
 if(!o.noDoor){const p=loc2(x,z,0,d/2+.2,ry);kput('boxD',[p[0],y+1.5,p[1]],q,[1.6,3,.5],null);kput('boxW',[p[0],y+3.2,p[1]],q,[2.6,.35,.9],tC(0x8a6a3a));}
 if(o.roof){kput('boxW',[x+rr(-w*.2,w*.2),y+h+.6,z+rr(-d*.2,d*.2)],q,[1.2,1.2,1.2],tC(0x8a6a3a));}}
function loc2(x,z,lx,lz,ry){return[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];}
function izLamp(x,y,z){kput('lampI',[x,y+.5,z],null,[1.2,.7,1.2],WARM);}
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

// --- the pairs: fn(P, x, z, orig) builds one instance at x,z; original when `orig` true -----------------------------
const TPAIRS=[];const TBY={};
function tpair(key,name,size,tall,fn){const p={key,name,size,tall,fn};TPAIRS.push(p);TBY[key]=p;}
tpair('box','Box house',24,false,(P,x,z,orig)=>{const cc=TPAL[0];if(orig){izBlock(x,0,z,6,8,6,0,cc,{roof:true});izLamp(x+2,8,z+1);}
 else{acDrum(P,x,0,z,3.4,8,cc,{door:true,nw:8});}});
tpair('tier','Tiered house',24,false,(P,x,z,orig)=>{const cc=TPAL[1];if(orig){izBlock(x,0,z,6.5,5,6.5,0,cc,{});izBlock(x,5,z,4.2,3.6,4.2,0,cc,{noDoor:true});}
 else{acDrum(P,x,0,z,3.6,5,cc,{door:true,nw:8});acDrum(P,x,5,z,2.3,3.6,cc,{door:false,nw:6,flutes:6});acPetalCrown(P,x,8.6,z,2.3,2.4,cc,6);}});
tpair('domed','Domed house',24,false,(P,x,z,orig)=>{const cc=TPAL[2];if(orig){izBlock(x,0,z,6,5.6,6,0,cc,{});kput('dome',[x,5.6,z],null,[3,3.6,3],tC(cc));}
 else{acDrum(P,x,0,z,3.4,5.6,cc,{door:true,nw:8});acLatticeDome(P,x,5.6,z,3.2,cc);}});
tpair('barrel','Barrel house',26,false,(P,x,z,orig)=>{const cc=TPAL[3];if(orig){kput('boxW',[x,1.4,z],null,[7,2.8,9.6],tC(cc));kput('dome',[x,2.8,z],null,[3.6,3.2,4.8],tC(cc));kput('boxD',[x,1.4,z+4.9],null,[1.6,2.6,.4],null);}
 else{acVault(P,x,0,z,7.2,6,9.6,0,cc,{skylight:true,glassEnds:true,doorW:2.4,doorH:3.2});}});
tpair('tent','Tent house',26,false,(P,x,z,orig)=>{const cc=TPAL[4];if(orig){kput('frusPyr',[x,0,z],null,[9.6,5.6,9.6],tC(cc));kput('boxD',[x,1.3,z+4.6],null,[1.6,2.6,.4],null);}
 else{const m=tsand(cc);const W=9.6,H=6.4,D=9.2;for(const sd of [-1,1]){mesh(gridSurface((u,v)=>{const q=u*2-1;const lz=q*D/2*(1-.3*v)+.4*Math.sin(Math.PI*v)*q;const lx=sd*(W/2*(1-v)+.18*W*q*q*(1-v));return[x+lx,v*H+.15,z+lz];},20,14,{uS:5,vS:3}),m,P);
   mesh(gridSurface((u,v)=>{const q=u*2-1;const lz=q*D/2*(1-.3*v)+.4*Math.sin(Math.PI*v)*q;const lx=sd*(W/2*(1-v)+.18*W*q*q*(1-v))*.96;return[x+lx,v*H+.15,z+lz];},20,14,{}),MAT.dark,P);}
  for(const sd of [-1,1]){const g=new THREE.Shape();g.moveTo(-W/2,0);g.lineTo(W/2,0);g.lineTo(0,H*.98);g.lineTo(-W/2,0);mesh(new THREE.ShapeGeometry(g),MAT.glass,P,x,.15,z+sd*D/2*.7);for(let k=-1;k<=1;k++)kput('mullW',[x+k*W*.2,H*.35*(1-Math.pow(k/2.6,2)),z+sd*D/2*.7],null,[.4,H*.7*(1-Math.pow(k/2.6,2)),.4],tC(cc,.9));}
  kput('archOpen',[x,1.4,z+D/2*.7+.1],qFacing([0,0,1]),[.28,.34,1],null);kput('boxW',[x,H+.25,z],null,[.5,.5,D*.75],tC(cc,.85));kput('slab',[x,.15,z],null,[6.2,.3,6.2],tC(cc,1.05));stripRing(x,H*.6,z,1.4,0,6);}});
tpair('pyr','Pyramid house',26,false,(P,x,z,orig)=>{const cc=TPAL[5];if(orig){kput('frusPyr',[x,0,z],null,[7.5,8,7.5],tC(cc));kput('boxW',[x,7.2,z],null,[7.2,.8,7.2],tC(cc,1.1));kput('boxD',[x,1.4,z+3.6],null,[1.6,2.8,.4],null);}
 else{const m=tsand(cc);let w=7.5,y=0;for(let i=0;i<2;i++){const h=i?2.6:3.6;const w0=w;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=w0/2*se(th,3.5)*(1-.22*v)*(1+.06*Math.pow(.5+.5*Math.cos(th*12),3));return[x+r*Math.cos(th),y+v*h,z+r*Math.sin(th)];},72,6,{uS:8,vS:3}),m,P);
   kput('ringW',[x,y+h-.2,z],qEuler(Math.PI/2,0,0),[w0/2*.8,w0/2*.8,3],tC(cc,1.1));if(!i){mesh(lathe({rFn:()=>w0/2*.78*.95,H:1.2,nu:40,nv:1}),MAT.glass,P,x,y+h,z);mesh(lathe({rFn:()=>w0/2*.7,H:1.2,nu:24,nv:1}),MAT.dark,P,x,y+h,z);mullions(x,y+h,z,w0/2*.78,1.2,14,0);stripRing(x,y+h+.6,z,w0/2*.6,0,12);}
   y+=h+(i?0:1.2);w*=.72;}
  mesh(lathe({rFn:yy=>1.5*Math.pow(clamp(1-Math.pow(yy/2,2),0,1),.55),H:2,flutes:10,amp:.08,nu:32,nv:6,hole:(u,yy)=>Math.cos(u*TAU*10)<.3&&yy>.4&&yy<1.6}),tsand(0xf1dba6),P,x,y,z);mesh(lathe({rFn:yy=>1.4*Math.pow(clamp(1-Math.pow(yy/2,2),0,1),.55),H:2,nu:24,nv:5}),MAT.glass,P,x,y,z);kput('finial',[x,y+2.4,z],null,[.4,.7,.4],null);
  kput('archOpen',[x,1.5,z+3.6],qFacing([0,0,1]),[.28,.34,1],null);}});
tpair('setback','Setback tower',40,true,(P,x,z,orig)=>{const cc=TPAL[6];const w=7,h=40;if(orig){izBlock(x,0,z,w*.95,h,w*.95,0,cc,{});izBlock(x,h,z,w*.6,h*.28,w*.6,0,cc,{noDoor:true});izBlock(x,h*1.28,z,w*.32,h*.16,w*.32,0,cc,{noDoor:true,plain:true});kput('boxW',[x,h*1.44+4,z],null,[.5,8,.5],tC(0x8a6a3a));izLamp(x,h*1.44+8,z);}
 else{const rFn=yy=>{const t=clamp(yy/h,0,1);return 3.6+1.6*Math.pow(Math.abs(t-.4)/.6,1.6);};mesh(lathe({rFn,H:h,flutes:14,amp:.09,sharp:2.5,nu:72,nv:40}),tsand(cc),P,x,4,z);
  acStruts(P,x,0,z,7,rFn(0)*.95,4.5,10,cc,0);kput('slab',[x,4.2,z],null,[rFn(0),1,rFn(0)],tC(cc,.9));
  for(let yy=6;yy<h-4;yy+=3.4)for(let k=0;k<14;k++){const th=(k+.5)/14*TAU;kput('cell',[x+(rFn(yy)+.05)*Math.cos(th),4+yy,z+(rFn(yy)+.05)*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1,.9,1],rng()<.8?WARM.clone().multiplyScalar(rr(.5,1)):new THREE.Color(0x14283c));}
  glassBand(P,rFn,h*.55,2.4,0,x,4,z,20);for(let k=0;k<14;k++){const th=k/14*TAU;beam('strutW',[x+Math.cos(th)*rFn(h)*1.02,4+h-2,z+Math.sin(th)*rFn(h)*1.02],[x+Math.cos(th)*(rFn(h)+2.4),4+h+4,z+Math.sin(th)*(rFn(h)+2.4)],.6,.5,tC(cc,.9));}
  mesh(lathe({rFn:yy=>rFn(h)*(1+.3*yy/5)*(1-.2*Math.pow(yy/5,3)),H:5,nu:32,nv:6}),MAT.glass,P,x,4+h-1,z);kput('finial',[x,4+h+7,z],null,[.9,1.6,.9],null);kput('archOpen',[x,1.6,z+rFn(0)-.2],qFacing([0,0,1]),[.3,.36,1],null);}});
tpair('setback2','Setback tower (stepped)',40,true,(P,x,z,orig)=>{const cc=TPAL[6];const w=7,h=40;if(orig){izBlock(x,0,z,w*.95,h,w*.95,0,cc,{});izBlock(x,h,z,w*.6,h*.28,w*.6,0,cc,{noDoor:true});izBlock(x,h*1.28,z,w*.32,h*.16,w*.32,0,cc,{noDoor:true,plain:true});kput('boxW',[x,h*1.44+4,z],null,[.5,8,.5],tC(0x8a6a3a));izLamp(x,h*1.44+8,z);}
 else{const tiers=[[3.6,h*.62,14],[2.5,h*.24,10],[1.5,h*.16,8]];let y=0;tiers.forEach((t,i)=>{const [r,hh,fl]=t;mesh(lathe({rFn:yy=>r*(1-.06*yy/hh),H:hh,flutes:fl,amp:.1,sharp:2.5,nu:56,nv:Math.round(hh/2)}),tsand(cc),P,x,y,z);
   for(let yy=2.4;yy<hh-2;yy+=3.4)for(let k=0;k<fl;k++){const th=(k+.5)/fl*TAU;const rr0=r*(1-.06*yy/hh)+.1;if(i===0&&yy<4&&Math.abs(th-Math.PI/2)<.5)continue;kput('cell',[x+rr0*Math.cos(th),y+yy,z+rr0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1,.9,1],rng()<.8?WARM.clone().multiplyScalar(rr(.5,1)):new THREE.Color(0x14283c));}
   kput('ringW',[x,y+hh-.4,z],qEuler(Math.PI/2,0,0),[r*1.08,r*1.08,3],tC(cc,.85));kput('slab',[x,y+hh,z],null,[r*1.02,.4,r*1.02],tC(cc,1.08));
   if(i<2){const rn=tiers[i+1][0];mesh(lathe({rFn:()=>rn*1.12,H:1.8,nu:40,nv:1}),MAT.glass,P,x,y+hh,z);mesh(lathe({rFn:()=>rn*.95,H:1.8,nu:24,nv:1}),MAT.dark,P,x,y+hh,z);mullions(x,y+hh,z,rn*1.12,1.8,12,0);stripRing(x,y+hh+.9,z,rn*.9,0,12);
    for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*r*.98,y+hh-3,z+Math.sin(th)*r*.98],[x+Math.cos(th)*rn*1.15,y+hh+1.8,z+Math.sin(th)*rn*1.15],.5,.4,tC(cc,.9));}}
   y+=hh+(i<2?1.8:0);});
  for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*1.55,y-1,z+Math.sin(th)*1.55],[x+Math.cos(th)*2.4,y+4,z+Math.sin(th)*2.4],.5,.4,tC(cc,.9));}mesh(lathe({rFn:yy=>1.5*(1+.3*yy/3)*(1-.2*Math.pow(yy/3,3)),H:3,nu:24,nv:5}),MAT.glass,P,x,y-.5,z);kput('finial',[x,y+4.5,z],null,[.7,1.3,.7],null);
  kput('archOpen',[x,1.6,z+3.4],qFacing([0,0,1]),[.3,.36,1],null);}});
tpair('tyrell','Tyrell block',40,true,(P,x,z,orig)=>{const cc=TPAL_BRUT[0];const bw=13,h=30;if(orig){kput('frusT',[x,0,z],null,[bw,h,bw],tC(cc));for(let k=1;k<=3;k++){const f=k/4,s=1-(1-.42)*f;kput('boxW',[x,h*f,z],null,[bw*s+.6,.7,bw*s+.6],tC(TTRIM));}izLamp(x,h+.2,z);kput('boxD',[x,1.7,z+bw/2-.3],null,[2.2,3.4,.5],null);}
 else{const m=tsand(cc,'c');mesh(gridSurface((u,v)=>{const th=u*TAU;const r=bw/2*se(th,5)*(1-.58*v)*(1-.05*Math.pow(.5+.5*Math.cos(th*8),3));return[x+r*Math.cos(th),v*h,z+r*Math.sin(th)];},64,12,{uS:12,vS:8}),m,P);
  for(let f=0;f<4;f++){const a=f*Math.PI/2;for(let k=-1;k<=1;k++){const off=bw/2*.71+.6;beam('strutW',[x+Math.cos(a)*(off+1)+(-Math.sin(a))*k*bw*.28,0,z+Math.sin(a)*(off+1)+Math.cos(a)*k*bw*.28],[x+Math.cos(a)*(bw/2*.42*.71+.5)+(-Math.sin(a))*k*bw*.12,h,z+Math.sin(a)*(bw/2*.42*.71+.5)+Math.cos(a)*k*bw*.12],1,.8,tC(cc,.85));}}
  for(let yy=3;yy<h-3;yy+=4.5)for(let f=0;f<4;f++){const a=f*Math.PI/2+Math.PI/4;const r=bw/2*se(a,5)*(1-.58*yy/h)+.1;for(let k=-1;k<=1;k+=2){kput('dot',[x+r*Math.cos(a)+(-Math.sin(a))*k*r*.4,yy,z+r*Math.sin(a)+Math.cos(a)*k*r*.4],qFacing([Math.cos(a),0,Math.sin(a)]),[.9,.5,.4],WARM);}}
  for(let k=0;k<12;k++){const th=k/12*TAU;const r=bw/2*.42*se(th,5);beam('strutW',[x+Math.cos(th)*r,h-1,z+Math.sin(th)*r],[x+Math.cos(th)*(r+1.5),h+4,z+Math.sin(th)*(r+1.5)],.5,.4,tC(cc,.9));}
  mesh(lathe({rFn:yy=>bw/2*.42*(1+.3*yy/4)*(1-.2*Math.pow(yy/4,3)),H:4,nu:24,nv:5}),MAT.glass,P,x,h-.5,z);kput('archOpen',[x,1.7,z+bw/2-.2],qFacing([0,0,1]),[.35,.4,1],null);}});
tpair('wedge','Wedge block',34,true,(P,x,z,orig)=>{const cc=TPAL_BRUT[2];const w=10,d=14,h=22;if(orig){kput('frusWd',[x,0,z],null,[w,h,d],tC(cc));kput('boxD',[x,1.5,z+d/2-.3],null,[1.8,3,.5],null);}
 else{const m=tsand(cc,'c');mesh(gridSurface((u,v)=>{const s=u*2-1;const lx=s*w/2*(1-.45*v);const lz=(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v);return[x+lx,v*h,z+lz];},20,12,{uS:6,vS:8}),m,P);
  mesh(gridSurface((u,v)=>{const s=u*2-1;const lx=s*w/2*(1-.45*v);return[x+lx,v*h,z-d/2*(1-.05*v)];},20,12,{uS:6,vS:8}),m,P);
  for(const s of [-1,1]){mesh(gridSurface((u,v)=>{const lz=lerp(-d/2*(1-.05*v),(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v),u);return[x+s*w/2*(1-.45*v),v*h,z+lz];},12,12,{uS:6,vS:8,hole:(u,v)=>{const cx=u*6,cy=v*9;return Math.abs((cx%1)-.5)<.3&&Math.abs((cy%1)-.5)<.3&&v>.08&&v<.92;}}),m,P);
   mesh(gridSurface((u,v)=>{const lz=lerp(-d/2*(1-.05*v),(d/2)*(1-.9*v)+.3*Math.sin(Math.PI*v),u);return[x+s*(w/2*(1-.45*v)-.4),v*h,z+lz];},12,12,{}),MAT.glass,P);}
  kput('slab',[x,h,z-d*.2],null,[w*.28,.5,d*.28],tC(cc,1.1));kput('archOpen',[x,1.6,z+d/2-.1],qFacing([0,0,1]),[.3,.36,1],null);stripRing(x,h*.5,z-d*.2,w*.2,0,8);}});
tpair('pent','Pentagon block',30,true,(P,x,z,orig)=>{const cc=TPAL_BRUT[1];const w=10,h=20;if(orig){kput('pent',[x,0,z],null,[w*1.3,h,w*1.3],tC(cc));kput('boxW',[x,h-.8,z],null,[w*1.3*.86+.6,.9,w*1.3*.86+.6],tC(TTRIM));kput('boxD',[x,1.5,z+w*.62],null,[1.8,3,.5],null);return;}
 mesh(lathe({rFn:yy=>w/2*(1-.12*yy/h),H:h,flutes:5,amp:.32,sharp:1,nu:60,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let s=0;s<5;s++){const y=s*4;mesh(lathe({rFn:()=>w/2*(1-.12*(y+3.4)/h)*1.08,H:.6,flutes:5,amp:.34,sharp:1,nu:60,nv:1}),tsand(cc,'c'),P,x,y+3.4,z);
  for(let k=0;k<5;k++){const th=k/5*TAU+.2;const r=w/2*(1-.12*(y+2)/h)*1.32+.1;kput('winSmI',[x+r*Math.cos(th),y+1.9,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.3,1],null);}}
 kput('slab',[x,h,z],null,[w*.5,.5,w*.5],tC(cc,1.1));acPetalCrown(P,x,h,z,w*.42,3.5,cc,5);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
tpair('hept','Heptagon block',30,true,(P,x,z,orig)=>{const cc=TPAL_BRUT[3];const w=10,h=18;if(orig){kput('hept',[x,0,z],null,[w*1.3,h,w*1.3],tC(cc));kput('boxW',[x,h-.8,z],null,[w*1.3*.8+.6,.9,w*1.3*.8+.6],tC(TTRIM));kput('boxD',[x,1.5,z+w*.62],null,[1.8,3,.5],null);return;}
 mesh(lathe({rFn:yy=>w/2*(1-.2*yy/h),H:h,flutes:7,amp:.3,sharp:1,nu:70,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let yy=3;yy<h-2;yy+=4)for(let k=0;k<7;k++){const th=k/7*TAU;const r=w/2*(1-.2*yy/h)*1.3+.1;kput('ovalI',[x+r*Math.cos(th),yy,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.9,.8],null);}
 for(let yy=6;yy<h-2;yy+=6)kput('ringW',[x,yy,z],qEuler(Math.PI/2,0,0),[w/2*(1-.2*yy/h)*1.32,w/2*(1-.2*yy/h)*1.32,2],tC(cc,.85));
 mesh(lathe({rFn:yy=>w/2*.8*Math.sqrt(clamp(1-Math.pow(yy/2.5,2),0,1)),H:2.5,nu:28,nv:5}),tsand(cc,'c'),P,x,h-.2,z);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
tpair('hall','Deco long hall',36,false,(P,x,z,orig)=>{const cc=TPAL[7];const L=18,Wd=11,h=10;if(orig){izBlock(x,0,z,L,h,Wd,0,cc,{noDoor:true});kput('gable',[x,h,z],null,[L+1.2,h*.55,Wd+1.2],tC(TTIMBER2));kput('boxW',[x,h+h*.55,z],null,[L+1.4,.4,.5],tC(TTIMBER));
  for(const s of [-1,1]){kput('boxW',[x+s*L*.5,h+h*.55+1,z],null,[.5,2.2,.5],tC(TTIMBER));}kput('boxD',[x,1.5,z+Wd/2+.3],null,[2.2,3,.5],null);kput('boxW',[x,3.6,z+Wd/2+1.5],null,[8,.4,3],tC(TTIMBER2));for(let k=-1;k<=1;k+=2)kput('boxW',[x+k*3.5,1.6,z+Wd/2+2.8],null,[.4,3.2,.4],tC(TTIMBER));
  kput('dot',[x+L*.3,h*.6,z+Wd/2+.3],null,[3,.8,.3],new THREE.Color(0x3ee0ff));}
 else{acVault(P,x,0,z,Wd+1,h+2,L,Math.PI/2,cc,{skylight:true,glassEnds:true,doorW:4,doorH:6});
  for(let k=-1;k<=1;k++){beam('strutW',[x+k*4,0,z+Wd/2+4.5],[x+k*3,h*.7,z+Wd/2+.4],.6,.5,tC(cc,.9));}kput('strutW',[x,h*.7,z+Wd/2+2.4],qEuler(-.2,0,0),[10,.35,5],tC(cc,1.05));
  kput('archOpen',[x,2,z+Wd/2+.3],qFacing([0,0,1]),[.42,.45,1],null);}});
tpair('stave','Stave hall with tower',40,false,(P,x,z,orig)=>{const cc=TPAL[8];const L=15,Wd=15,h=12;if(orig){izBlock(x,0,z,L,h,Wd,0,cc,{noDoor:true});kput('gable',[x,h,z],null,[L+1,h*.55,Wd+1],tC(TTIMBER2));kput('gable',[x,h+h*.72,z],qEuler(0,Math.PI/2,0),[L*.62,h*.55,Wd*.75],tC(TTIMBER2));
  izBlock(x,h,z,Wd*.36,h*1.2,Wd*.36,0,cc,{noDoor:true,plain:true});kput('gable',[x,h*2.2,z],null,[Wd*.46,h*.55,Wd*.46],tC(TTIMBER));kput('boxW',[x,h*2.75+1.5,z],null,[.4,3,.4],tC(TTIMBER));izLamp(x,h*2.75+3,z);kput('boxD',[x,1.5,z+Wd/2+.3],null,[2.2,3,.5],null);}
 else{acVault(P,x,0,z,Wd+1,h+1,L,Math.PI/2,cc,{skylight:false,glassEnds:true,doorW:4,doorH:6});acVault(P,x,0,z,Wd*.75,h*.85,L*.62,0,cc,{skylight:true,glassEnds:false,doorW:.1,doorH:.1});
  acNeedle(P,x,h+.5,z,2.2,h*1.8,cc);kput('archOpen',[x,2,z+Wd/2+.3],qFacing([0,0,1]),[.42,.45,1],null);}});
tpair('compound','Walled compound',30,false,(P,x,z,orig)=>{const ac=0xc98f5c,cc=TPAL[9];const W2=7.5,D2=7.5,h=6;if(orig){[[0,-D2,W2*2,1],[-W2,0,1,D2*2],[W2,0,1,D2*2],[-W2*.55,D2,W2*.9,1],[W2*.55,D2,W2*.9,1]].forEach(wl=>kput('boxW',[x+wl[0],1.1,z+wl[1]],null,[wl[2],2.2,wl[3]],tC(ac)));
  kput('frusPyr',[x,0,z],qEuler(0,.15,0),[W2*1.1*1.6,h*.7,D2*1.1*1.6],tC(cc));kput('boxW',[x-W2*.55,h*.3,z-D2*.5],null,[3,h*.6,3],tC(ac));kput('dome',[x-W2*.55,h*.6,z-D2*.5],null,[1.5,1.5,1.5],tC(ac));kput('boxD',[x,1.3,z+D2*.55],null,[1.6,2.6,.4],null);}
 else{const m=tsand(ac);for(let k=0;k<20;k++){const th=k/20*TAU;const r=W2*1.35*se(th,4);if(Math.abs(th-Math.PI/2)<.2)continue;kput('colW',[x+r*Math.cos(th),0,z+r*Math.sin(th)],null,[.8,3,.8],tC(ac,.9));}
  mesh(gridSurface((u,v)=>{const th=u*TAU;const r=W2*1.35*se(th,4);return[x+r*Math.cos(th),2.8+v*.7,z+r*Math.sin(th)];},64,1,{uS:20}),m,P);
  const Q=new THREE.Group();Q.position.set(x,0,z);P.add(Q);petalRing(Q,6,3.6,h*.9,4.2,1.2,.5,0,0,13,tsand(cc),null);mesh(lathe({rFn:yy=>3*Math.pow(clamp(1-Math.pow(yy/3,2),0,1),.6),H:3,nu:20,nv:5}),MAT.glass,Q,0,h*.6,0);
  mesh(lathe({rFn:yy=>1.6*(1-.05*Math.pow(yy/3.6,6)),H:3.6,nu:20,nv:4}),m,P,x-W2*.55,0,z-D2*.5);mesh(lathe({rFn:yy=>1.7*Math.sqrt(clamp(1-Math.pow(yy/1.4,2),0,1)),H:1.4,nu:20,nv:4}),m,P,x-W2*.55,3.5,z-D2*.5);
  kput('archOpen',[x,1.3,z+W2*1.35],qFacing([0,0,1]),[.25,.3,1],null);}});
tpair('midrise','Midrise',30,true,(P,x,z,orig)=>{const cc=TPAL[3];const w=7,h=22;if(orig){izBlock(x,0,z,w*1.15,h*.55,w*1.15,0,cc,{});izBlock(x,h*.55,z,w*.85,h*.3,w*.85,0,cc,{noDoor:true});izBlock(x,h*.85,z,w*.5,h*.15,w*.5,0,cc,{noDoor:true,plain:true,roof:true});}
 else{const R=4.2;const lobe=(th,yy)=>R*(1-.25*yy/h)*(1+.3*(.5+.5*Math.cos(8*th)));mesh(lathe({rFn:yy=>R*(1-.25*yy/h),H:h,flutes:8,amp:.3,sharp:1,nu:72,nv:20}),tsand(cc),P,x,0,z);
  for(let s=0;s<5;s++){const y=s*4.2;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th,y+3.4)*.97,lobe(th,y+3.4)*1.1,v);return[x+r*Math.cos(th),y+3.6,z+r*Math.sin(th)];},72,2,{}),tsand(cc),P);
   for(let k=0;k<8;k++){const th=k/8*TAU;const r=lobe(th,y+1.8)+.1;kput('winSmI',[x+r*Math.cos(th),y+1.8,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.4,1],null);}if(s%2===0)stripRing(x,y+2.4,z,R*(1-.25*y/h)*.85,0,16);}
  kput('slab',[x,h+.2,z],null,[R*.8,.5,R*.8],tC(cc,1.1));acPetalCrown(P,x,h,z,R*.8,3,cc,8);kput('archOpen',[x,1.6,z+lobe(Math.PI/2,1)-.2],qFacing([0,0,1]),[.3,.36,1],null);}});
tpair('stall','Market stall',14,false,(P,x,z,orig)=>{if(orig){[[-2.4,-1.7],[2.4,-1.7],[-2.4,1.7],[2.4,1.7]].forEach(p=>kput('boxW',[x+p[0],1.4,z+p[1]],null,[.25,2.8,.25],tC(TTIMBER)));kput('frusPyr',[x,2.8,z],null,[5.6,1.2,4.2],tC(0xe07a2a));kput('boxW',[x,.5,z+1.2],null,[4.4,1,1],tC(TTIMBER2));}
 else{mesh(lathe({rFn:yy=>.5*Math.sqrt(1+3*Math.pow((yy-1.6)/1.6,2)),H:3.2,nu:16,nv:6}),tsand(TPAL[6]),P,x,0,z);const Q=new THREE.Group();Q.position.set(x,3,z);P.add(Q);petalRing(Q,5,.4,1.2,3.2,3,1.4,0,0,17,tsand(0xe07a2a),null);
  kput('slab',[x,.5,z+1.4],null,[2.2,1,2.2],tC(TPAL[6],.9));stripRing(x,2.6,z,2,0,8);}});
tpair('fountain','Fountain',18,false,(P,x,z,orig)=>{if(orig){kput('slab',[x,.3,z],null,[5,.6,5],tC(TPAL[7]));kput('slab',[x,1.4,z],null,[1.6,1.6,1.6],tC(TPAL[7],.9));kput('slab',[x,2.6,z],null,[2.8,.4,2.8],tC(TPAL[7]));kput('slab',[x,3.6,z],null,[.8,1.6,.8],tC(TPAL[7],.9));kput('slab',[x,4.6,z],null,[1.6,.3,1.6],tC(TPAL[7]));izLamp(x,4.8,z);}
 else{mesh(lathe({rFn:yy=>5*Math.sqrt(clamp(1-Math.pow(yy/1.2,2),0,1))+.4,H:1.2,flutes:8,amp:.08,nu:48,nv:4}),tsand(TPAL[7]),P,x,0,z);for(let k=0;k<8;k++){const th=k/8*TAU;beam('strutW',[x+Math.cos(th)*3.6,1,z+Math.sin(th)*3.6],[x+Math.cos(th)*.8,5,z+Math.sin(th)*.8],.35,.3,tC(TPAL[7],.9));}
  kput('finial',[x,5.4,z],null,[.9,1.5,.9],null);stripRing(x,1.3,z,3.8,0,16);}});
tpair('temple','Temple — pyramid on legs',110,true,(P,x,z,orig)=>{const tm=0xd9924a,tmD=0xb8742e;const LEG=18,BASE=52;const m=tsand(tm),mD=tsand(tmD);
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
tpair('palace','Palace fortress',150,true,(P,x,z,orig)=>{const sm=0xd4a05a,sl=0xe6bd7e;
 // RECESSED windows (Travis): a dark reveal set into the face, a warm pane at its back (the citadel is lit), and a proud
 // sandstone surround — two jambs, a lintel with a deco drip band, a sill — so each opening reads as cut into the mass
 const izOne=(px,py,pz,nx,nz,ww,wh)=>{const q=qEuler(0,Math.atan2(nx,nz),0),tx=nz,tz=-nx;
  kput('boxD',[px,py,pz],q,[ww,wh,1.0],null);kput('dot',[px-nx*.35,py,pz-nz*.35],q,[ww/1.5,wh/.8,.3],WARM.clone().multiplyScalar(.75));
  for(const sd of[-1,1])kput('boxW',[px+tx*sd*(ww/2+.3)+nx*.35,py,pz+tz*sd*(ww/2+.3)+nz*.35],q,[.6,wh+.4,.7],tC(sl));
  kput('boxW',[px+nx*.4,py+wh/2+.35,pz+nz*.4],q,[ww+1.4,.7,.8],tC(sl));kput('boxW',[px+nx*.55,py+wh/2+.85,pz+nz*.55],q,[ww+.6,.25,.5],tC(sm,.9));
  kput('boxW',[px+nx*.45,py-wh/2-.25,pz+nz*.45],q,[ww+1.0,.5,.9],tC(sl));};
 const izWin=(cx,cz,w,d,taper,h,y0,rowY,n,ww,wh,skip)=>{const f=(rowY-y0)/h,hw=w/2*(1-(1-taper)*f),hd=d/2*(1-(1-taper)*f);for(let i=0;i<n;i++){const u=((i+.5)/n-.5)*1.7;
   if(!(skip&&skip(cx+u*hw)))izOne(x+cx+u*hw,rowY,z+cz+hd,0,1,ww,wh);izOne(x+cx+u*hw,rowY,z+cz-hd,0,-1,ww,wh);izOne(x+cx+hw,rowY,z+cz+u*hd,1,0,ww,wh);izOne(x+cx-hw,rowY,z+cz+u*hd,-1,0,ww,wh);}};
 // tiers 1-2 solid; tier 3 is built in parts round the HALL (the old hangar, hollow now): rear mass, two flanks, a lintel
 kput('frus93',[x,0,z],null,[96,14,84],tC(sm));kput('frus90',[x+4,14,z-4],null,[68,14,58],tC(sm));
 kput('frus88',[x+8,28,z-15],null,[46,22,26],tC(sm));kput('frus88',[x-12.5,28,z+5],null,[5,22,14],tC(sm));kput('frus88',[x+19.5,28,z+5],null,[23,22,14],tC(sm));kput('frus88',[x-1,39,z+5],null,[18,11,14],tC(sm));
 kput('frus85',[x+16,50,z-10],null,[20,30,20],tC(sm));kput('frus85',[x+16,80,z-10],null,[14,11,14],tC(sl));kput('frus60',[x+16,91,z-10],null,[8,7,8],tC(sm));kput('frusPyr',[x+16,98,z-10],null,[5,6,5],tC(sl));
 kput('boxW',[x,12.6+.75,z],null,[91,1.5,80],tC(sl));kput('boxW',[x+4,26.6+.75,z-4],null,[63,1.5,54],tC(sl));kput('boxW',[x+8,48.6+.75,z-8],null,[42,1.5,37],tC(sl));kput('boxW',[x+16,78.8+.7,z-10],null,[18.5,1.4,18.5],tC(sl));
 izWin(0,0,96,84,.93,14,0,7,9,3,4);izWin(4,-4,68,58,.9,14,14,20,6,3,4);izWin(8,-8,46,40,.88,22,28,34,6,2.2,4,xx=>xx>-11&&xx<9);izWin(8,-8,46,40,.88,22,28,43,6,2.2,3,xx=>xx>-11&&xx<9);for(let i=0;i<3;i++)izWin(16,-10,20,20,.85,30,50,56+i*8,2,3,3);
 // THE HALL (Travis): the hangar converted for entertaining Izani and foreign nobles — 18 x 14 m, 11 m high, open to the
 // terrace: a lit floor, two rows of pale columns, a coffered ceiling of warm lamps, a great doorway into the palace at the back
 {const hy=28.1,hx=x-1,hz=z+5;kput('slab',[hx,hy-.05,hz],null,[9.6,.3,9.6],tC(0xe6d6b0));                      // the floor medallion
  for(const sx of[-6.5,6.5])for(const zz of[-3.2,1.2,5.6])kput('colW',[hx+sx,hy,hz+zz],null,[.9,10.9,.9],tC(sl));
  for(let i=-1;i<=1;i++)for(let j=0;j<3;j++)kput('dot',[hx+i*5,hy+10.6,hz-4.5+j*4.5],qEuler(Math.PI/2,0,0),[1.6,1.6,1],WARM);   // ceiling lamps
  kput('boxD',[hx,hy,z-1.9],null,[7,8,.6],null);kput('boxW',[hx,hy+8,z-1.9],null,[8.4,.9,1.2],tC(sl));for(const sx of[-4.6,4.6])kput('boxW',[hx+sx,hy,z-1.9],null,[1.2,8.6,1.2],tC(sl));   // the great door to the palace
  for(const sx of[-4.6,4.6])kput('dot',[hx+sx,hy+6.5,z-1.4],null,[1,1.4,.5],WARM);
  for(const sx of[-8.3,8.3])for(const zz of[1,7])kput('dot',[hx+sx,hy+5,hz+zz],null,[.5,1.2,1],WARM);              // wall sconces
  kput('boxW',[hx,39.2,z+12.3],null,[19.6,1.2,1.6],tC(sl));for(const sx of[-9.6,9.6])kput('boxW',[hx+sx,hy-.1,z+12.3],null,[1.4,11.4,1.4],tC(sl));   // the hall's frame: lintel and jambs, kept inside the tier's corners
  for(let i=-4;i<=4;i++)kput('dot',[hx+i*2.1,hy-.05,z+13.1],null,[1.2,.25,.5],WARM);                                  // the lit threshold
  // the GREAT AWNING: orange cloth from the lintel out over the terrace on two stone poles, tie rods back to the wall
  kput('vClothB',[hx,50.1-Math.tan(.36)*5.2,z+17.6],qEuler(.36,0,0),[25,.16,11.2],vC(0xe07a2a));
  for(const sx of[-11.5,11.5]){kput('vPostS',[hx+sx,28.1,z+21.4],null,[.55,18.4,.55],tC(sl));kput('vBall',[hx+sx,46.7,z+21.4],null,[.5,.5,.5],vC(0x8a6a2a));beam('vIron',[hx+sx,46.4,z+21.2],[hx+sx*.8,50.4,z+12.4],.06,.06,vC(0x2e2a26));}
  for(let i=0;i<6;i++)kput('vCloth',[hx-10.4+i*4.16,45.6,z+22.9],qEuler(0,0,0),[3.6,1.4,1],vC(i%2?0xd8893c:0xc9442a));}   // the valance
 // THE GARDEN TERRACE on the second tier's roof, either side of the hall's approach: balustrade, planters and hedges,
 // benches, lamp posts, two stairs down to the first tier's roof garden
 {const ty=28.1,front=z+22.4;kput('boxW',[x+4,ty+1.1,front],null,[63,.35,.6],tC(sl));for(let i=0;i<=14;i++)kput('boxW',[x+4-31.5+i*4.5,ty,front],null,[.5,1.1,.5],tC(sl));
  for(const sx of[-27,-19,-11,12,20,28]){vnPlanter(x+sx,ty,z+18,5.2,1.8,0,vC(0x8a6a46));kput('hedge',[x+sx,ty+.6,z+14.6],null,[5.2,1.2,1.2],vC(0x3f6a34));}
  for(const sx of[-23,-15,16,24])kput('vWood',[x+sx,ty+.25,z+16.3],null,[2.4,.5,.6],vC(0x6a4a30));
  for(const sx of[-29,-13,11,27])vnLampPost(x+sx,ty,z+20.6,3.4);
  for(const s of[-1,1]){for(let k=0;k<8;k++)kput('boxW',[x+4+s*33.5,14+k*1.75,z+8-k*1.05],null,[3.2,1.75,1.1],tC(sl));}   // stairs down the flanks
  kput('slab',[x-1,ty-.05,z+16],null,[3.2,.25,3.2],tC(0xe6d6b0));}
 // roof-garden on the first tier's roof: hedges along the parapet, lamp posts; crenellated parapets on both lower tiers
 {const ty=14.1;for(let i=0;i<10;i++){const sx=-40+i*8.9;if(Math.abs(sx-4)<12)continue;kput('hedge',[x+sx,ty+.6,z+36],null,[4.6,1.2,1.4],vC(0x3f6a34));}
  for(const sx of[-40,-24,32,44])vnLampPost(x+sx,ty,z+38.6,3.2);
  for(let i=0;i<22;i++)kput('boxW',[x-44+i*4.2,ty+1.1,z+39.4],null,[1.6,1.0,1.0],tC(sl));for(let i=0;i<15;i++)kput('boxW',[x+4-30+i*4.3,28.1+1.1,z-4-26.4],null,[1.6,1.0,1.0],tC(sl));}
 // banner poles and lamp columns along the front of the base tier
 for(let i=0;i<7;i++){const sx=-42+i*14;vnBannerPole(x+sx,0,z+44.5,0,9,vC(i%2?0xe07a2a:0xc9442a));}
 for(const sx of[-36,-12,12,36])vnLampPost(x+sx,0,z+46,4.2);
 // pyramidal roofs and pavilions on the terrace tops, the beacon (from the Iziz Ancients Mix palace)
 // the terrace pavilions (Travis: develop the bare pyramids and cubes): each PYRAMID becomes an open pavilion — a paved
 // floor, four columns, an architrave, the pyramid roof lifted onto it with a lantern — and each CUBE a belvedere — a
 // windowed room with a cornice, a pyramid cap and a banner. The two that sat inside the hall's masses are gone.
 const izPav=(px,py,pz)=>{kput('slab',[x+px,py+.15,z+pz],null,[6.2,.3,6.2],tC(0xe6d6b0));for(const a of[-1,1])for(const b of[-1,1])kput('colW',[x+px+a*4,py+.3,z+pz+b*4],null,[.55,5.4,.55],tC(sl));
  for(const a of[-1,1]){kput('boxW',[x+px,py+6,z+pz+a*4],null,[9.4,.9,.9],tC(sl));kput('boxW',[x+px+a*4,py+6,z+pz],null,[.9,.9,9.4],tC(sl));}
  kput('frusPyr',[x+px,py+6.45,z+pz],null,[10,6.5,10],tC(sl));kput('boxW',[x+px,py+6.4,z+pz],null,[10.4,.3,10.4],tC(sm,.9));kput('lampI',[x+px,py+4.6,z+pz],null,[.6,.8,.6],WARM);
  for(const a of[-1,1])vnPlanter(x+px+a*5.8,py,z+pz+5.6,2.2,.8,0,vC(0x8a6a46));kput('vWood',[x+px,py+.55,z+pz],null,[2.6,.5,.7],vC(0x6a4a30));};
 const izBelv=(px,py,pz,i)=>{kput('boxW',[x+px,py+4,z+pz],null,[9,8,7.4],tC(sm));kput('boxW',[x+px,py+.4,z+pz],null,[9.8,.8,8.2],tC(sl));
  for(const a of[-1,1]){for(const k of[-2.6,0,2.6])izOne(x+px+k,py+4.6,z+pz+a*3.72,0,a,1.3,2.6);izOne(x+px+a*4.52,py+4.6,z+pz,a,0,1.3,2.6);}
  kput('boxW',[x+px,py+8.2,z+pz],null,[10.2,.6,8.6],tC(sl));kput('boxW',[x+px,py+8.7,z+pz],null,[9.4,.4,7.8],tC(sm,.9));kput('frusPyr',[x+px,py+8.9,z+pz],null,[8.6,5,7],tC(sl));
  vnBannerPole(x+px+4.2,py+8.9,z+pz+3.4,0,5,vC(i%2?0xe07a2a:0xc9442a));};
 [[-36,14,-30],[36,14,-32],[-38,14,-12],[-6,50,-20]].forEach(p=>izPav(p[0],p[1],p[2]));
 [[-38,14,4],[38,14,4],[-4,50,4]].forEach((p,i)=>izBelv(p[0],p[1],p[2],i));
 kput('lampI',[x+16,105,z-10],null,[1.4,2,1.4],WARM);});
tpair('arena','Arena',130,true,(P,x,z,orig)=>{const cc=0xd4a05a,ccL=0xe6bd7e;const A0=48,B0=40;const m=tsand(cc),mL=tsand(ccL);
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=1-.12*v+.05*Math.sin(Math.PI*v);return[x+A0*s*Math.cos(th)*(1+.03*Math.pow(.5+.5*Math.cos(th*24),3)),v*21,z+B0*s*Math.sin(th)];},144,10,{uS:40,vS:6,hole:(u,v)=>Math.abs(((u*24)%1)-.5)<.18&&v>.12&&v<.62}),m,P);
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=.86;return[x+A0*s*Math.cos(th),2+v*17,z+B0*s*Math.sin(th)];},96,2,{}),MAT.dark,P);
 for(let k=0;k<36;k++){const th=k/36*TAU;beam('strutW',[x+(A0+8)*Math.cos(th),0,z+(B0+7)*Math.sin(th)],[x+A0*.9*Math.cos(th),21,z+B0*.9*Math.sin(th)],1.6,1.3,tC(cc,.85));}
 mesh(gridSurface((u,v)=>{const th=u*TAU;const s=lerp(.88,.98,v);return[x+A0*s*Math.cos(th),21+v*4,z+B0*s*Math.sin(th)];},96,2,{uS:40}),mL,P);
 for(let k=0;k<24;k++){const th=(k+.5)/24*TAU;kput('strip',[x+A0*.93*Math.cos(th),24.6,z+B0*.93*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[6,1,1],CYAN);}
 for(let k=0;k<6;k++){const a=A0-9-k*3.1,b=B0-8-k*2.7;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(a-3.1,a,v);return[x+r*Math.cos(th),12-k*2+(v<.5?2:0),z+r*b/a*Math.sin(th)];},96,2,{}),mL,P);}
 for(let k=0;k<8;k++){const th=(k+.5)/8*TAU;const px=x+A0*.72*Math.cos(th),pz=z+B0*.72*Math.sin(th);mesh(lathe({rFn:yy=>.5*Math.sqrt(1+2*Math.pow((yy-5)/5,2)),H:10,nu:12,nv:4}),mL,P,px,22,pz);
  const Q=new THREE.Group();Q.position.set(px,31,pz);Q.rotation.y=-th;P.add(Q);petalRing(Q,3,.4,3,8,9,1.6,0,0,20+k,tsand(0xf1dba6),null);}
 kput('slab',[x,.2,z],null,[A0-28,.4,B0-24],tC(0xd8c090));for(let k=0;k<4;k++){const th=k/4*TAU+Math.PI/4;kput('archOpen',[x+A0*.98*Math.cos(th),5,z+B0*.98*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.1,2],null);}});
// Pueblo: defined for completeness, EXCLUDED from placement (Travis, round 2).
tpair('pueblo','Pueblo (adobe stack)',26,false,(P,x,z,orig)=>{const ac=0xd6a06a;const w=6,d=6,h1=6,h2=4.5;kput('boxW',[x,h1/2,z],null,[w*1.9,h1,d*1.9],tC(ac));kput('boxW',[x,h1-.3,z],null,[w*1.9+.3,.6,d*1.9+.3],tC(ac,1.1));
 kput('boxW',[x-w*.3,h1+h2/2,z-d*.35],null,[w*1.2,h2,d*1.1],tC(ac));kput('boxD',[x+w*.2,1.2,z+d*.95+.1],null,[1.5,2.4,.4],null);});
const TRANS_EXCLUDE={pueblo:1};
// footprint half-extents of each kind at scale 1 (from the Mix's REFHALF), used by the city to fit lots
const TREFHALF={box:[3.4,3.4],tier:[3.6,3.6],domed:[3.4,3.4],barrel:[3.6,4.8],tent:[4.8,4.6],pyr:[3.75,3.75],setback:[7,7],setback2:[3.7,3.7],tyrell:[7,7],wedge:[5,7],pent:[6.6,6.6],hept:[6.6,6.6],hall:[9,7.5],stave:[7.5,7.5],compound:[10.2,10.2],midrise:[5.5,5.5],stall:[3,2.4],fountain:[5.4,5.4],temple:[42,52],palace:[52,46],arena:[56,48]};
const TKINDS={dwelling:['box','tier','domed','barrel','tent','pyr'],tall:['setback','setback2','tyrell','wedge','pent','hept','midrise'],hall:['hall','stave','compound']};
// ---- placement -----------------------------------------------------------------------------------------------------
MAT.tGlassO=new THREE.MeshStandardMaterial({color:0x2a4a66,metalness:.55,roughness:.18,emissive:0x0a1a2a,emissiveIntensity:.5,side:DS});
const TRANS={groups:[],root:null,
 place(scene,kind,mode,x,z,ry,scale,seed,extraTags,y){y=y||0;const p=TBY[kind];if(!p||TRANS_EXCLUDE[kind]){reportErr('TRANS.place: '+kind+' not placeable');return null;}
  if(!TRANS.root){TRANS.root=new THREE.Group();scene.add(TRANS.root);}
  if(kind==='pent'||kind==='hept'){mode=mode==='orig'?'anc':mode==='ruin'?'ancruin':mode==='rehab'?'ancrehab':mode;}   // Travis: only the transplant versions of these two
  const orig=mode==='orig'||mode==='ruin'||mode==='rehab';const wmode=mode==='ruin'||mode==='ancruin'?'ruin':(mode==='rehab'||mode==='ancrehab')?'rehab':null;
  scale=scale||1;ry=ry||0;reseed(seed);const ranges={};for(const n in KIT.items)ranges[n]=KIT.items[n].length;
  const P=new THREE.Group();P.position.set(x,y,z);P.rotation.y=ry;P.scale.setScalar(scale);scene.add(P);P.updateMatrixWorld(true);
  KOFF=[0,0,0];useGroupXF(P);if(scale!==1)KXF.s=scale;
  try{p.fn(P,0,0,orig);}catch(e){reportErr('transplant '+kind+' '+e.stack);}
  endGroupXF();
  if(wmode){try{wreck(P,TRANS.root,ranges,wmode,x,z,seed+1);}catch(e){reportErr('wreck '+kind+' '+e.stack);}}
  P.traverse(m=>{if(m.isMesh&&m.material===MAT.glass)m.material=MAT.tGlassO;});
  TRANS.groups.push(P);
  const isDw=TKINDS.dwelling.includes(kind),isTall=TKINDS.tall.includes(kind);
  const type=kind==='temple'?['religious','civic']:kind==='palace'?['civic','military']:kind==='arena'?['civic']:kind==='hall'?['tavern/inn']:kind==='stall'?['market/shop']:kind==='fountain'?['civic']:isTall?['multi-family dwelling']:kind==='compound'?['single-family dwelling']:kind==='stave'?['civic']:['single-family dwelling'];
  const state=wmode==='ruin'?'destroyed':wmode==='rehab'?'rehabilitated':'intact';
  REG.push({name:p.name+(orig?' — Iziz original':' — Ancients transplant')+(wmode?' — '+state:''),x,y,z,r:p.size*.45*scale,h:p.size*1.2*scale,cls:'building',key:'trans_'+kind,
   tags:Object.assign({culture:orig?'iziz-old':'ancients-transplant',type,wealth:isTall?'middle':'middle',state,lit:wmode!=='ruin'},extraTags||{})});
  return P;},
 // merge every one-off mesh in the placed groups by material into one draw call each (the Mix's ANC.bake)
 bake(scene){const groups=TRANS.groups.slice();if(TRANS.root)groups.push(TRANS.root);const byMat=new Map();const list=[];
  for(const G of groups){G.updateMatrixWorld(true);G.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)list.push(o);});}
  for(const m of list){const k=m.material.uuid;if(!byMat.has(k))byMat.set(k,{mat:m.material,geos:[]});const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry).clone();geo.applyMatrix4(m.matrixWorld);if(!geo.attributes.normal)geo.computeVertexNormals();else geo.computeVertexNormals();if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));byMat.get(k).geos.push(geo);m.parent.remove(m);}
  const out=new THREE.Group();scene.add(out);let calls=0;
  for(const e of byMat.values()){let nv=0;for(const g of e.geos)nv+=g.attributes.position.count;const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2);let o=0;
   for(const g of e.geos){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;}
   const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));
   const mm=new THREE.Mesh(G,e.mat);mm.frustumCulled=false;out.add(mm);calls++;}
  window._transMerged=calls;return out;},
 kinds:Object.keys(TBY).filter(k=>!TRANS_EXCLUDE[k]),TKINDS,TREFHALF,by:TBY};
