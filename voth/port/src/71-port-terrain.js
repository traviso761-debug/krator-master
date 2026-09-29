// ================================================================ PORT TERRAIN
// The natural coast, the declarative stamp system, terrainH, the terrain mesh
// and the sea. Everything here runs BEFORE any builder: the scene collects
// every placed segment's stamps, calls portBuildTerrain(), and only then runs
// the builders, so terrainH() already answers with the final ground.
//
// ---------------------------------------------------------------- the natural coast
// Land rises gently inland (-z), a sand beach crosses y=0 near z=0, and the
// seabed falls to PORT.SEABED (-30 m) by ~500 m offshore. The shoreline
// wanders +/-18 m along x and the land carries low hills, so a long run of
// coast is not a ruled line. Continuous and C1 everywhere.
function portShore(x){return 110*(fbm(x/1400+3.7,1.3,.7,3)-.5)+14*(fbm(x/170,4.1,2.2,2)-.5);}
function portNatH(x,z){
 const zz=z-portShore(x);                        // + seaward of the natural waterline
 if(zz>=0){const q=Math.pow(zz/260,1.6),f=1-Math.exp(-q);
  return .6+(PORT.SEABED-.6)*f+(fbm(x/140,z/140,4.1,2)-.5)*2.2*clamp(zz/80,0,1);}
 const t=-zz;
 if(t<70){const s=t/70;return .6+3.9*s*s*(3-2*s);}  // the beach and its dunes
 const u=t-70;
 return 4.5+u*.022+(fbm(x/420,z/420,1.9,3)-.5)*16*clamp(u/260,0,1)+(fbm(x/60,z/60,7.7,2)-.5)*1.2*clamp(u/40,0,1);}

// ---------------------------------------------------------------- stamps
// A stamp reshapes the ground over a rect {x0,z0,x1,z1} or a polygon
// {poly:[[x,z],...]} given in the segment's LOCAL frame (the scene moves it
// to world). Kinds:
//   flat  set the ground to y                      (land aprons)
//   dig   lower the ground to y where it is higher (berths, basins, slips)
//   fill  raise the ground to y where it is lower  (moles, reclaimed land)
//   ramp  set the ground to a y that runs linearly from ya at the low end of
//         `axis` ('x' or 'z') to yb at the high end (slipways, graded banks)
// soft  falloff distance (m) outside the shape back to what was there
// paint optional ground colour inside the shape: 'pave' (default for a flat
//       at deck level), 'soil', 'sand', 'mud', 'grass', 'rock'
// dry   true: no sea surface is drawn over the shape (a dry dock pit)
//
// COMPOSITION, in this defined order (API.md "Stamp order"):
//  1. start from the natural coast;
//  2. SOFT RINGS: every stamp's falloff ring (outside its shape) is blended in,
//     in stamp order - placement order along the layout, then each segment's
//     array order - each toward its target computed on the height so far;
//  3. HARD SHAPES: every stamp whose shape strictly contains the point is
//     applied in the same order, each op on the result of the one before, so
//     the LATER stamp wins (a fill after a dig raises it again);
//  4. BOUNDARIES: a point lying ON a shape's edge (within 5 cm) takes the
//     LOWEST height found 12 cm to either side of it along x and z. That puts
//     every land/water cliff on the HIGH side of the line, where a quay wall's
//     thickness hides it, while two raised areas that abut stay flush.
// The terrain grid has vertices exactly on every rect edge and 0.3 m either
// side, so a rect-edged cliff is at most 0.3 m wide. Polygon edges are NOT
// grid-aligned: use polygons for soft shaping, rects under walls.
const PORT_ST={list:[],bk:new Map(),BK:100,EPS:.05,PROBE:.12,grid:null};
function portStampAdd(s,gx,gz,owner){
 const o=Object.assign({},s,{owner});o.soft=Math.max(0,+s.soft||0);
 if(s.poly){o.poly=s.poly.map(p=>[p[0]+gx,p[1]+gz]);
  o.x0=Math.min(...o.poly.map(p=>p[0]));o.x1=Math.max(...o.poly.map(p=>p[0]));
  o.z0=Math.min(...o.poly.map(p=>p[1]));o.z1=Math.max(...o.poly.map(p=>p[1]));}
 else{o.x0=Math.min(s.x0,s.x1)+gx;o.x1=Math.max(s.x0,s.x1)+gx;o.z0=Math.min(s.z0,s.z1)+gz;o.z1=Math.max(s.z0,s.z1)+gz;}
 if(['flat','dig','fill','ramp'].indexOf(o.kind)<0){reportErr('stamp from '+owner+': unknown kind '+o.kind);return;}
 if(o.kind==='ramp'){if(!isFinite(o.ya)||!isFinite(o.yb)){reportErr('ramp stamp from '+owner+' needs ya, yb');return;}o.axis=o.axis==='x'?'x':'z';}
 else if(!isFinite(o.y)){reportErr('stamp from '+owner+' has no y');return;}
 if(o.paint===undefined&&o.kind==='flat'&&o.y>=PORT.DECK-.5)o.paint='pave';
 o.i=PORT_ST.list.length;PORT_ST.list.push(o);
 const b0=Math.floor((o.x0-o.soft-1)/PORT_ST.BK),b1=Math.floor((o.x1+o.soft+1)/PORT_ST.BK);
 for(let b=b0;b<=b1;b++){let L=PORT_ST.bk.get(b);if(!L)PORT_ST.bk.set(b,L=[]);L.push(o);}}
// signed distance to the shape: negative inside
function portSD(s,x,z){
 if(!s.poly){const dx=Math.max(s.x0-x,x-s.x1),dz=Math.max(s.z0-z,z-s.z1);
  return (dx<=0&&dz<=0)?Math.max(dx,dz):Math.hypot(Math.max(dx,0),Math.max(dz,0));}
 const P=s.poly;let inside=false,best=1e18;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i];
  if(((b[1]>z)!==(a[1]>z))&&(x<(a[0]-b[0])*(z-b[1])/(a[1]-b[1])+b[0]))inside=!inside;
  const ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez||1e-9;const t=clamp(((x-a[0])*ex+(z-a[1])*ez)/L2,0,1);
  const d=Math.hypot(x-a[0]-t*ex,z-a[1]-t*ez);if(d<best)best=d;}
 return inside?-best:best;}
function portOp(s,h,x,z){
 if(s.kind==='dig')return Math.min(h,s.y);
 if(s.kind==='fill')return Math.max(h,s.y);
 if(s.kind==='ramp'){const t=s.axis==='x'?clamp((x-s.x0)/Math.max(1e-6,s.x1-s.x0),0,1):clamp((z-s.z0)/Math.max(1e-6,s.z1-s.z0),0,1);return lerp(s.ya,s.yb,t);}
 return s.y;}
function portCands(x){return PORT_ST.bk.get(Math.floor(x/PORT_ST.BK))||null;}
// steps 1-3 at one point
function portHCore(x,z,C){let h=portNatH(x,z);if(!C)return h;
 for(const s of C){if(!s.soft)continue;const d=portSD(s,x,z);if(d>0&&d<s.soft){const t=d/s.soft,w=1-t*t*(3-2*t);h=lerp(h,portOp(s,h,x,z),w);}}
 for(const s of C){if(portSD(s,x,z)<0)h=portOp(s,h,x,z);}
 return h;}
// THE GROUND HOOK (10-core.js declares the flat stub; this replaces it).
// World coordinates in, final stamped height out.
terrainH=function(x,z){const C=portCands(x);if(!C)return portNatH(x,z);
 let edge=false;for(const s of C){if(Math.abs(portSD(s,x,z))<=PORT_ST.EPS){edge=true;break;}}
 if(!edge)return portHCore(x,z,C);
 const e=PORT_ST.PROBE;
 return Math.min(portHCore(x+e,z,portCands(x+e)),portHCore(x-e,z,portCands(x-e)),
                 portHCore(x,z+e,C),portHCore(x,z-e,C));};
// The paint at a point: the last stamp with a paint whose shape contains it.
function portPaint(x,z){const C=portCands(x);if(!C)return null;let p=null;
 for(const s of C)if(s.paint&&portSD(s,x,z)<-PORT_ST.EPS)p=s.paint;return p;}
function portDry(x,z){const C=portCands(x);if(!C)return false;
 for(const s of C)if(s.dry&&portSD(s,x,z)<PORT_ST.EPS)return true;return false;}

// ---------------------------------------------------------------- materials
TEX.pkGround=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=200+(fbm(x/22,y/22,2.2,3)-.5)*60+(fbm(x/3,y/3,6.1,1)-.5)*34;
  if(fbm(x/6,y/6,9.3,2)>.66)v-=26;                     // pebbles and tufts
  d[i]=v;d[i+1]=v;d[i+2]=v-4;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.pkGround=new THREE.MeshStandardMaterial({map:TEX.pkGround,vertexColors:true,roughness:1,metalness:0});
// The sea: one transparent sheet at y=0. There is no depth texture to tint by
// water depth, so the DEPTH TINT IS PAINTED ON THE SEABED instead (vertex
// colours go from sand to deep blue-green with depth) and the sheet itself is
// a constant, part-transparent colour: shallow sand shows through as
// turquoise, deep water reads dark. A rippled normal map gives the sun a
// glitter; a fresnel rim (same injection as MAT.glass, r128 anchor, no pow)
// pales it at grazing angles. The rim colour is a shared uniform that the
// night hook swings, or the sea would glow at night.
TEX.pkSeaN=(()=>{const W=256,hf=new Float32Array(W*W);
 // a sum of waves with INTEGER frequencies, so the tile wraps without a seam
 // (a non-periodic term here drew a hairline across the sea every 46 m)
 const WV=[];for(let k=0;k<22;k++){const a=h3(k,1.7,.3)*TAU,f=2+Math.floor(h3(k,5.1,.9)*14);
  WV.push([Math.round(Math.cos(a)*f),Math.round(Math.sin(a)*f),h3(k,8.8,2.2)*TAU,.9/Math.sqrt(f)]);}
 for(let y=0;y<W;y++)for(let x=0;x<W;x++){let v=0;for(const w of WV)v+=w[3]*Math.sin(TAU*(w[0]*x+w[1]*y)/W+w[2]);hf[y*W+x]=v;}
 const t=canvasTex(W,W,(g)=>{const id=g.createImageData(W,W),d=id.data;
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;
   const dx=hf[y*W+(x+1)%W]-hf[y*W+(x+W-1)%W],dy=hf[((y+1)%W)*W+x]-hf[((y+W-1)%W)*W+x];
   const nx=-dx*1.4,ny=-dy*1.4,nz=1,L=Math.hypot(nx,ny,nz);
   d[i]=(nx/L*.5+.5)*255;d[i+1]=(ny/L*.5+.5)*255;d[i+2]=(nz/L*.5+.5)*255;d[i+3]=255;}
  g.putImageData(id,0,0);});
 t.encoding=THREE.LinearEncoding;return t;})();
const PK_SEA_RIM={value:new THREE.Color(.26,.36,.44)};
MAT.pkSea=new THREE.MeshStandardMaterial({color:0x134a5c,transparent:true,opacity:.68,roughness:.16,metalness:.05,
 normalMap:TEX.pkSeaN,normalScale:new THREE.Vector2(.35,.35),depthWrite:false});
MAT.pkSea.onBeforeCompile=sh=>{sh.uniforms.u_rim=PK_SEA_RIM;
 sh.fragmentShader='uniform vec3 u_rim;\n'+sh.fragmentShader.replace(
  'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
  ['float _fr = 1.0 - clamp( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 0.0, 1.0 );',
   '_fr = clamp( _fr, 0.0, 1.0 );','_fr = _fr * _fr * _fr;',
   'gl_FragColor = vec4( outgoingLight + u_rim * _fr * 0.9, clamp( diffuseColor.a + _fr * 0.30, 0.0, 1.0 ) );'].join('\n'));};
PORT_NIGHT.push(on=>{PK_SEA_RIM.value.setRGB(on?.03:.26,on?.045:.36,on?.075:.44);MAT.pkSea.color.setHex(on?0x0b2430:0x134a5c);});

// UNDERWATER FADE. Everything below y=0 - quay walls, columns, hulls, the
// seabed - fades toward deep water with depth, so the sea has depth instead
// of being a tinted pane over a clear aquarium. Injected into every
// MeshStandardMaterial in MAT by portUnderwaterPatch() (90-scene.js calls it
// once, before anything renders; kbake carries it onto the instanced clones).
// Anchors are r128 chunk names; world y comes from a varying we add after
// <project_vertex>, through instanceMatrix when instanced. Each function has
// its own source text, which is what r128 keys its program cache on, so the
// glass variant and the plain variant never share a program. A material a
// builder makes itself with `new THREE.MeshStandardMaterial` is not patched:
// put it in MAT at top level, or call portUW on it.
const PK_UW={value:new THREE.Color(.018,.075,.095)};
function portUWsh(sh){sh.uniforms.u_uw=PK_UW;
 sh.vertexShader='varying float vUWy;\n'+sh.vertexShader.replace('#include <project_vertex>',
  '#include <project_vertex>\nvec4 _uwp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_uwp=instanceMatrix*_uwp;\n#endif\nvUWy=(modelMatrix*_uwp).y;');
 sh.fragmentShader='uniform vec3 u_uw;\nvarying float vUWy;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',
  'gl_FragColor.rgb=mix(gl_FragColor.rgb,u_uw,clamp(-vUWy/9.0,0.0,0.9));\n#include <tonemapping_fragment>');}
function portUW(sh){portUWsh(sh);}
function portUWGlass(sh){portUWsh(sh);const g=MAT.glass.userData.fresnel;if(g)g(sh);}
function portUnderwaterPatch(){
 if(!MAT.glass.userData.fresnel){MAT.glass.userData.fresnel=MAT.glass.onBeforeCompile;MAT.glass.onBeforeCompile=portUWGlass;}
 for(const k in MAT){const m=MAT[k];if(!m||!m.isMeshStandardMaterial||m===MAT.glass||m===MAT.pkSea)continue;
  if(m.onBeforeCompile&&m.onBeforeCompile!==portUW&&m.onBeforeCompile.toString().indexOf('{}')<0)continue;   // someone else's: leave it
  m.onBeforeCompile=portUW;m.needsUpdate=true;}}
PORT_NIGHT.push(on=>PK_UW.value.setRGB(on?.004:.018,on?.012:.075,on?.02:.095));
// Ground colour at a vertex: seabed sand darkening to deep water green-blue,
// beach sand, then the red Tharnish soil with grass in patches; rock on steep
// ground; a stamp's paint overrides inside its shape.
const PK_GC={sand:[.78,.71,.56],deep:[.10,.21,.25],soil:[.50,.35,.25],grass:[.29,.37,.18],dry:[.55,.50,.33],rock:[.44,.40,.36],
 pave:[.60,.58,.55],mud:[.36,.29,.21],shelf:[.58,.56,.47]};
// cs = the local grid spacing: fine noise is faded out where the grid is
// coarse, or long thin far-field cells alias it into radial streaks.
function portGroundColor(x,z,h,slope,paint,cs){let c;const fa=clamp(1-((cs||10)-12)/30,0,1);
 const n=fbm(x/160,z/160,2.7,3),n2=(fbm(x/17,z/17,8.1,2)-.5)*fa+.5,n3=fbm(x/55,z/55,5.3,2);
 if(paint&&PK_GC[paint]){c=PK_GC[paint].slice();const k=.92+(n2-.5)*.18;c=c.map(v=>v*k);}
 else if(h<-.2){const t=clamp(-h/12,0,1)*.55,s=PK_GC.sand;c=[lerp(s[0],PK_GC.deep[0],t),lerp(s[1],PK_GC.deep[1],t),lerp(s[2],PK_GC.deep[2],t)];
  const k=.9+(n2-.5)*.25;c=c.map(v=>v*k);}
 else if(h<2.4){c=PK_GC.sand.map(v=>v*(.95+(n2-.5)*.14));
  if(h>1.5){const t=(h-1.5)/.9;c=c.map((v,i)=>lerp(v,PK_GC.dry[i],t*.8));}}
 else{// scrub: dry grass, green where it is damp, the red soil through it in patches
  const g=clamp((n-.38)*3,0,1),r=clamp((n3-.55)*4,0,1)*(1-g*.6);
  c=PK_GC.dry.map((v,i)=>lerp(lerp(v,PK_GC.grass[i],g),PK_GC.soil[i],r)*(.9+(n2-.5)*.24));
  if(h<4.2){const t=clamp((h-2.4)/1.8,0,1);c=c.map((v,i)=>lerp(PK_GC.dry[i]*1.05,v,t));}}
 if(slope>.55&&!paint){const t=clamp((slope-.55)*2.5,0,1);c=c.map((v,i)=>lerp(v,PK_GC.rock[i],t));}
 return c;}

// ---------------------------------------------------------------- the terrain grid
// A TENSOR GRID: x lines and z lines, each at a base spacing near the port,
// growing geometrically out to the horizon, plus lines exactly on every stamp
// rect edge and 0.3 / 1.5 / 5 m either side of it. So a 22 m cliff at a quay
// line is resolved in 0.3 m while open ground costs almost nothing, and the
// mesh has no T-junctions to crack. It is cut into chunks along x so frustum
// culling works; normals come from the whole grid (minmod slopes: a plateau
// stays flat-shaded right up to its edge) so chunk seams do not show.
function portAxis(lo,hi,c0,c1,base,edges){const P=[];
 for(let v=c0;v<=c1+1e-6;v+=base)P.push([v,0]);
 // spacing grows 12% a line to 90 m, holds to 3.5 km out (the visible
 // hinterland and sea), then grows 35% a line to the horizon
 const grow=(s,d)=>d<3500?Math.min(s*1.12,90):s*1.35;
 let s=base,v=c0;while(v>lo){s=grow(s,c0-v);v-=s;P.push([Math.max(v,lo),0]);}
 s=base;v=c1;while(v<hi){s=grow(s,v-c1);v+=s;P.push([Math.min(v,hi),0]);}
 for(const e of edges){if(e<lo||e>hi)continue;P.push([e,2]);
  for(const o of [.3,1.5,5])P.push([e-o,1],[e+o,1]);}
 P.sort((a,b)=>a[0]-b[0]);const out=[];
 for(const p of P){const L=out[out.length-1];
  if(L&&p[0]-L[0]<.12){if(p[1]>L[1])out[out.length-1]=p;continue;}out.push(p);}
 return out.map(p=>p[0]);}
function portBuildTerrain(scene,layout){
 let X0=1e9,X1=-1e9,Z0=-150,Z1=150;const xe=[],ze=[];
 for(const it of layout.items){const R=portRegOf(it.key);if(!R)continue;
  const w=R.W||PORT.W;X0=Math.min(X0,it.gx-w/2);X1=Math.max(X1,it.gx+w/2);
  if(!it.vessel){Z0=Math.min(Z0,it.gz-R.LAND);Z1=Math.max(Z1,it.gz+R.SEA);xe.push(it.gx-w/2,it.gx+w/2);ze.push(it.gz,it.gz-R.LAND,it.gz+R.SEA);}}
 if(X0>X1){X0=-500;X1=500;}
 for(const s of PORT_ST.list){if(s.poly){xe.push(s.x0,s.x1);ze.push(s.z0,s.z1);}else{xe.push(s.x0,s.x1);ze.push(s.z0,s.z1);}}
 const cx=(X0+X1)/2;
 const xs=portAxis(cx-11500,cx+11500,X0-420,X1+420,10,xe);
 const zs=portAxis(-9500,11500,Z0-260,Z1+260,10,ze);
 const nx=xs.length,nz=zs.length,H=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=terrainH(xs[i],zs[j]);
 PORT_ST.grid={xs,zs,H,nx,nz};
 const mm=(a,b)=>(a*b<=0)?0:(Math.abs(a)<Math.abs(b)?a:b);
 const NRM=new Float32Array(nx*nz*3),COL=new Float32Array(nx*nz*3);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,h=H[k];
  const sxm=i>0?(h-H[k-1])/(xs[i]-xs[i-1]):null,sxp=i<nx-1?(H[k+1]-h)/(xs[i+1]-xs[i]):null;
  const szm=j>0?(h-H[k-nx])/(zs[j]-zs[j-1]):null,szp=j<nz-1?(H[k+nx]-h)/(zs[j+1]-zs[j]):null;
  const gx=sxm===null?sxp:sxp===null?sxm:mm(sxm,sxp),gz=szm===null?szp:szp===null?szm:mm(szm,szp);
  const L=Math.hypot(gx,1,gz);NRM[k*3]=-gx/L;NRM[k*3+1]=1/L;NRM[k*3+2]=-gz/L;
  // slope for colour: the steeper one-sided slope, so a cut bank reads as rock
  const sl=Math.max(Math.abs(sxm||0),Math.abs(sxp||0),Math.abs(szm||0),Math.abs(szp||0));
  const cs=Math.max(i>0?xs[i]-xs[i-1]:0,i<nx-1?xs[i+1]-xs[i]:0,j>0?zs[j]-zs[j-1]:0,j<nz-1?zs[j+1]-zs[j]:0);
  const c=portGroundColor(xs[i],zs[j],h,Math.min(sl,3),portPaint(xs[i],zs[j]),cs);
  COL[k*3]=c[0];COL[k*3+1]=c[1];COL[k*3+2]=c[2];}
 const CH=96;const chunks=[];
 for(let i0=0;i0<nx-1;i0+=CH){const i1=Math.min(nx-1,i0+CH),cw=i1-i0+1;
  const P=new Float32Array(cw*nz*3),N=new Float32Array(cw*nz*3),C=new Float32Array(cw*nz*3),U=new Float32Array(cw*nz*2);
  for(let j=0;j<nz;j++)for(let i=i0;i<=i1;i++){const k=j*nx+i,q=j*cw+(i-i0);
   P[q*3]=xs[i];P[q*3+1]=H[k];P[q*3+2]=zs[j];
   for(let a=0;a<3;a++){N[q*3+a]=NRM[k*3+a];C[q*3+a]=COL[k*3+a];}
   U[q*2]=xs[i]/18;U[q*2+1]=zs[j]/18;}
  const I=new Uint32Array((cw-1)*(nz-1)*6);let n=0;
  for(let j=0;j<nz-1;j++)for(let i=0;i<cw-1;i++){const a=j*cw+i,b=a+1,c=a+cw,d=c+1;I[n++]=a;I[n++]=c;I[n++]=b;I[n++]=b;I[n++]=c;I[n++]=d;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));
  g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));
  g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(new THREE.BufferAttribute(I,1));
  g.computeBoundingSphere();
  const m=mesh(g,MAT.pkGround,scene);m.userData.probeSkip=true;m.name='terrain';chunks.push(m);}
 // THE SEA: one flat sheet at y=0 over the whole grid. It is drawn over land
 // too, where the terrain (above 0) simply hides it. Only a `dry` stamp cuts
 // it: rows crossing one are split into runs of non-dry cells. (Runs were
 // tried for every row, skipping dry land: the T-junctions between rows of
 // different extents showed as hairline cracks across the open sea.)
 const WP=[],WI=[];const anyDry=PORT_ST.list.some(s=>s.dry);
 const quad=(xa,xb,za,zb)=>{const b=WP.length/3;WP.push(xa,0,za, xb,0,za, xa,0,zb, xb,0,zb);WI.push(b,b+2,b+1,b+1,b+2,b+3);};
 if(!anyDry)quad(xs[0],xs[nx-1],zs[0],zs[nz-1]);
 else for(let j=0;j<nz-1;j++){const wet=i=>!portDry((xs[i]+xs[i+1])/2,(zs[j]+zs[j+1])/2);let i=0;
  while(i<nx-1){if(!wet(i)){i++;continue;}let e=i;while(e+1<nx-1&&wet(e+1))e++;quad(xs[i],xs[e+1],zs[j],zs[j+1]);i=e+1;}}
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(WP,3));
 const WU=[];for(let q=0;q<WP.length;q+=3)WU.push(WP[q]/46,WP[q+2]/46);
 wg.setAttribute('uv',new THREE.Float32BufferAttribute(WU,2));
 const WN=[];for(let q=0;q<WP.length;q+=3)WN.push(0,1,0);wg.setAttribute('normal',new THREE.Float32BufferAttribute(WN,3));
 wg.setIndex(WI);
 const sea=mesh(wg,MAT.pkSea,scene);sea.userData.probeSkip=true;sea.name='sea';sea.renderOrder=1;
 portNatureScatter(X0,X1);
 return {chunks,sea,nx,nz};}
// Scrub and trees on the NATURAL ground (outside every stamp and its soft
// ring), within ~700 m of the coast, in patches. Its own seed (19990) so it
// does not move with the builders; charged to 'env'.
function portNatureScatter(X0,X1){reseed(19990);const k0=KOFF;KOFF=[0,0,0];
 const n=Math.round((X1-X0+1600)*700/650);
 for(let i=0;i<n;i++){const x=rr(X0-800,X1+800),z=-rr(20,720);
  const zz=z-portShore(x);if(zz>-58)continue;
  const pa=fbm(x/260,z/260,6.2,2);if(pa<.47||rng()>clamp((pa-.47)*5,0,1))continue;
  const C=portCands(x);let ok=true;if(C)for(const s of C)if(portSD(s,x,z)<s.soft+6){ok=false;break;}if(!ok)continue;
  const h=portNatH(x,z);
  if(rng()<.62)VEG.tree(x,h,z,i%3,rr(5,13));
  else kput('leafCard',[x,h+.7,z],qEuler(0,rng()*TAU,0),[rr(1,2.2),rr(.7,1.2),rr(1,2.2)],new THREE.Color().setHSL(rr(.16,.3),rr(.3,.5),rr(.35,.55)));}
 KOFF=k0;}
