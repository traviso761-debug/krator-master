
// ---------------------------------------------------------------- error panel
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));

// ---------------------------------------------------------------- rng + noise
let _seed=1234567;
function reseed(s){_seed=s>>>0;}
function rng(){_seed|=0;_seed=_seed+0x6D2B79F5|0;let t=Math.imul(_seed^_seed>>>15,1|_seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(a,b){return a+(b-a)*rng();}
function h3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
 const sm=t=>t*t*(3-2*t);const u=sm(xf),v=sm(yf),w=sm(zf);const l=(a,b,t)=>a+(b-a)*t;
 return l(l(l(h3(xi,yi,zi),h3(xi+1,yi,zi),u),l(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v),
          l(l(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),l(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v),w);}
function fbm(x,y,z,o){o=o||3;let a=0,f=1,s=0;for(let i=0;i<o;i++){a+=vnoise(x*f,y*f,z*f)/f;s+=1/f;f*=2.03;}return a/s;}
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, TAU=Math.PI*2;

// GROUND HEIGHT HOOK. Flat everywhere for now — the whole kit stands on y=0 —
// but every piece of code that meets the ground asks here instead of assuming
// zero, so the Krator terrain pass replaces this one function and the aprons,
// the trees and the fallen fragments all follow the ground without a builder
// being touched. Keep it cheap: it is called per tree and per rubble block.
function terrainH(x,z){return 0;}

// ---------------------------------------------------------------- per-type accounting
// One global tally, filled while the builders run. 90-scene.js sets TSTAT.cur
// to the site key ('skyA/1' = Skyscraper A, ruined) before each builder call
// and clears it after, so every mesh and every instanced item is charged to the
// type that made it. This is what makes the per-type triangle budgets in
// verify.py --assert measurable at all: the kit shares one InstancedMesh per
// item across all 33 types, so after kbake() there is no way to tell whose
// triangles are whose.
//
// Nothing here emits geometry or draws from the PRNG, so switching it on does
// not move a single rock. Keep it that way.
const TSTAT={cur:null,by:{},bad:[]};
function tcur(){const k=TSTAT.cur;if(k==null)return null;return TSTAT.by[k]||(TSTAT.by[k]={tris:0,inst:0,meshes:0});}
function triOf(g){if(!g)return 0;if(g.index)return g.index.count/3;const p=g.attributes&&g.attributes.position;return p?p.count/3:0;}
const _KTRI={};
function ktri(name){if(_KTRI[name]===undefined){const def=KIT.defs[name];_KTRI[name]=def?triOf(def.geo):0;}return _KTRI[name];}
function finite3(a){return !!a&&isFinite(a[0])&&isFinite(a[1])&&isFinite(a[2]);}
// ---------------------------------------------------------------- textures
// All procedural, all generated once at load, all in world-ish units: a texture
// tile is about 8 m across, because `lathe` sets uS = rFn(0)*TAU/8 and vS = cut/8.
// At 512 px that is 64 px per metre, which is what the panel and board sizes
// below are picked against — change the tile size and they stop meaning anything.
function canvasTex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;if(rep)t.repeat.set(rep,rep);return t;}
// A roughness/metalness map is DATA, not colour. Leaving it sRGB-encoded (which
// canvasTex does, correctly, for albedo) bends every value through a gamma curve
// and the surface comes back wrong.
//
// r128's MeshStandardMaterial reads roughnessMap from the GREEN channel and
// metalnessMap from the BLUE, so one texture assigned to both slots carries
// both. Both MULTIPLY the material's scalar `roughness`/`metalness`, so those
// are set to 1 and the map does all the work.
//
// This is the single biggest thing missing from the first-pass materials: with
// one flat roughness value, every panel on a 420 m tower has an identical
// highlight and the whole thing reads as moulded plastic. Breaking roughness up
// per panel and along the seams is what makes it read as metal.
function rmTex(w,h,fn){const t=canvasTex(w,h,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;const v=fn(x,y);
  d[i]=0;d[i+1]=clamp(v[0],0,1)*255|0;d[i+2]=clamp(v[1],0,1)*255|0;d[i+3]=255;}
 g.putImageData(id,0,0);});
 t.encoding=THREE.LinearEncoding;return t;}

// Panel grid: 2 m x 1 m sheets at 64 px/m.
const PANW=128,PANH=64;
function panTone(x,y){return h3(Math.floor(x/PANW)*1.7,Math.floor(y/PANH)*2.3,5.1);}
function panSeam(x,y){const fx=x%PANW,fy=y%PANH;return Math.min(fx,PANW-1-fx,fy,PANH-1-fy);}
function panBolt(x,y){const fx=x%PANW,fy=y%PANH;
 return Math.hypot(Math.min(fx,PANW-1-fx)-7,Math.min(fy,PANH-1-fy)-7);}

const TEX={};
TEX.panel=canvasTex(512,512,(g,w,h)=>{ // white metal: panel sheets, recessed seams, fasteners
 const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=228+(panTone(x,y)-.5)*13;                       // sheet-to-sheet tone
  v+=(fbm(x/70,y/70,1.7,3)-.5)*15;                      // slow weathering drift
  v+=(fbm(x/3,y/30,4.4,2)-.5)*7;                        // brushed grain, running vertically
  const sd=panSeam(x,y);
  if(sd<1)v-=54; else if(sd<2)v-=25; else if(sd<4)v+=7; // groove, then its lit lip
  const bd=panBolt(x,y);
  if(bd<1.7)v-=28; else if(bd<2.7)v+=11;                // fastener at each sheet corner
  d[i]=v;d[i+1]=v-1;d[i+2]=v-7;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.panelRM=rmTex(512,512,(x,y)=>{
 const t=panTone(x,y),sd=panSeam(x,y);
 let r=.30+(t-.5)*.11+(fbm(x/60,y/60,9.2,2)-.5)*.14;
 let m=.38+(t-.5)*.10;                                  // NOTE: modest. There is no
 if(sd<2){r+=.40;m-=.22;}                               // envMap in this scene, so a
 r+=(fbm(x/8,y/42,3.3,2)-.5)*.10;                       // near-1 metalness renders
 return[r,m];});                                        // almost black.

TEX.rust=canvasTex(512,512,(g,w,h)=>{ // tarnished steel, rust running down from every ledge
 const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  // t is 0 at the top of the tile and 1 at the bottom. With world-unit UVs a
  // tile is roughly a storey, so the bottom of the tile is the underside of a
  // ledge: where water collects and where the staining is always worst. That is
  // how "keyed to overhangs" is approximated without knowing the geometry.
  const t=y/h;
  const base=fbm(x/70,y/70,4.2,3), streak=fbm(x/10,y/190,9.1,3);
  const run=clamp((streak-.40)*3,0,1)*clamp(t*1.7,0,1); // runs widen downward
  const ledge=clamp((t-.74)/.26,0,1);                   // the dark band under the ledge
  let r=126+(base-.5)*52,gg=118+(base-.5)*48,b=108+(base-.5)*44;   // dull tarnished silver
  const ru=clamp(run+ledge*.75,0,1);
  r=lerp(r,114+streak*52,ru);gg=lerp(gg,60+streak*30,ru);b=lerp(b,38+streak*16,ru);
  const dark=ledge*.42+clamp((fbm(x/40,y/150,2.2,2)-.62)*3,0,1)*.22;
  r*=1-dark;gg*=1-dark;b*=1-dark;
  if(panSeam(x,y)<1){r*=.74;gg*=.74;b*=.74;}            // the panel grid still ghosts through
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.rustRM=rmTex(512,512,(x,y)=>{const t=y/512;
 const ru=clamp(clamp((fbm(x/10,y/190,9.1,2)-.40)*3,0,1)*clamp(t*1.7,0,1)+clamp((t-.74)/.26,0,1)*.75,0,1);
 return[lerp(.55,.97,ru)+(fbm(x/25,y/25,6.6,2)-.5)*.12,lerp(.30,.04,ru)];});

// Verdigris is its own material now. It used to be blended into the rust map,
// which put copper patina on rusting STEEL everywhere in the kit — two metals
// that do not weather alike. Use MAT.verdigris only on parts meant to read as
// copper or bronze.
TEX.verdigris=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const p=fbm(x/34,y/34,3.7,3),run=fbm(x/8,y/90,6.1,2),t=y/h;
  const a=clamp(clamp((p-.34)*2.4,0,1)*.72+clamp((run-.45)*2.6,0,1)*clamp(t*1.4,0,1)*.5,0,1);
  const sh=clamp((fbm(x/12,y/12,8.8,2)-.5)*.42,-.2,.2);
  d[i]=lerp(150,68,a)*(1+sh);d[i+1]=lerp(98,152,a)*(1+sh);d[i+2]=lerp(62,130,a)*(1+sh);d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.verdigrisRM=rmTex(256,256,(x,y)=>{const t=y/256;
 const a=clamp(clamp((fbm(x/34,y/34,3.7,2)-.34)*2.4,0,1)*.72+clamp((fbm(x/8,y/90,6.1,2)-.45)*2.6,0,1)*clamp(t*1.4,0,1)*.5,0,1);
 return[lerp(.32,.90,a),lerp(.34,.05,a)];});

// Water-staining decal. Grayscale and MULTIPLY-blended, so it darkens whatever
// wall it lands on rather than painting a grey rectangle over it — the same
// streak has to work on white metal, rust, concrete and brick.
TEX.stain=canvasTex(64,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const t=y/h;                                     // 0 at the ledge, 1 at the bottom
  const run=fbm(x/7,y/40,5.3,3);
  const edge=1-Math.abs(x/w*2-1);                  // fade out at the sides
  const a=clamp(edge*1.6,0,1)*clamp(1.25-t,0,1)*clamp((run-.30)*2.2,0,1);
  const v=255-a*118;
  d[i]=v;d[i+1]=v-3;d[i+2]=v-8;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.ground=canvasTex(1024,1024,(g,w,h)=>{ // painted later, once the sites are known
 g.fillStyle='#8a4a34';g.fillRect(0,0,w,h);});
// ---------------------------------------------------------------- materials
const DS=THREE.DoubleSide;
const MAT={
 // metalness/roughness come from the packed map (G=rough, B=metal); the scalars
 // are 1 so the map is not scaled down. See rmTex in 20-textures.js.
 white:new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 rust:new THREE.MeshStandardMaterial({map:TEX.rust,roughnessMap:TEX.rustRM,metalnessMap:TEX.rustRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 verdigris:new THREE.MeshStandardMaterial({map:TEX.verdigris,roughnessMap:TEX.verdigrisRM,metalnessMap:TEX.verdigrisRM,color:0xffffff,metalness:1,roughness:1,side:DS}),
 glass:new THREE.MeshStandardMaterial({color:0x3f9fe6,transparent:true,opacity:.48,metalness:.2,roughness:.08,emissive:0x0b2c4e,emissiveIntensity:.6,side:DS,depthWrite:false}),
 winIntact:new THREE.MeshStandardMaterial({color:0x143a5c,metalness:.6,roughness:.15,emissive:0x0a2238,emissiveIntensity:.8}),
 winDead:new THREE.MeshStandardMaterial({color:0x07090c,roughness:1}),
 dark:new THREE.MeshStandardMaterial({color:0x1a1d22,roughness:.95,side:DS}),
 guts:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.9,metalness:.4,side:DS}),
 pipe:new THREE.MeshStandardMaterial({color:0x7a4a2a,roughness:.55,metalness:.7}),
 pipeRust:new THREE.MeshStandardMaterial({color:0x4e3324,roughness:.9,metalness:.3}),
 strip:new THREE.MeshBasicMaterial({color:0xffffff}),
 dot:new THREE.MeshBasicMaterial({color:0xffffff}),
 moss:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),
 vine:new THREE.MeshStandardMaterial({color:0x2c4a22,roughness:1}),
 rubble:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),
 fig:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),
 ground:new THREE.MeshStandardMaterial({map:TEX.ground,roughness:1}),
 slab:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),
 stain:new THREE.MeshBasicMaterial({map:TEX.stain,transparent:true,blending:THREE.MultiplyBlending,depthWrite:false,side:DS}),
};
// GLASS FRESNEL. Real glass turns reflective and pale at grazing angles; a flat
// transparent colour reads as blue plastic, which is what these curtain walls
// were doing. Injected into the stock standard-material shader rather than
// replacing it, so lights, fog and tone mapping all still apply.
//
// r128 has no <output_fragment> chunk — that arrived later — so the anchor is
// the literal final assignment. Verified against the pinned three.min.js.
//
// The cube is written out rather than pow(): a negative base in pow() yields NaN,
// and SwiftShader silently swallows it, so it would look perfect in verify.py
// and blow up on a real GPU. Everything feeding it is clamped anyway.
MAT.glass.onBeforeCompile=sh=>{
 sh.fragmentShader=sh.fragmentShader.replace(
  'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
  ['float _fr = 1.0 - clamp( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 0.0, 1.0 );',
   '_fr = clamp( _fr, 0.0, 1.0 );',
   '_fr = _fr * _fr * _fr;',
   'vec3 _lit = outgoingLight + vec3( 0.30, 0.44, 0.58 ) * _fr * 0.85;',
   'gl_FragColor = vec4( _lit, clamp( diffuseColor.a + _fr * 0.42, 0.0, 1.0 ) );'].join('\n'));};
const SHELL=d=>d>0?MAT.rust:MAT.white;      // exterior skin by decay
const WIN=d=>d>0?MAT.winDead:MAT.winIntact;
const CYAN=new THREE.Color(0x7ff4ff), WARM=new THREE.Color(0xffd28a), DEAD=new THREE.Color(0x0a0c0e);

// ---------------------------------------------------------------- instancing kit
// `meshes` is filled by kbake: name -> the one InstancedMesh that item baked
// into. One kdef is one InstancedMesh, so anything that wants to switch a whole
// class of instanced detail on or off at run time (the firelight, at night) can
// do it with a single .visible, with no per-instance bookkeeping.
const KIT={defs:{},items:{},order:[],meshes:{}};
function kdef(name,geo,mat){KIT.defs[name]={geo,mat};KIT.items[name]=[];KIT.order.push(name);}
let KOFF=[0,0,0],KXF=null; // builder offset; optional {m,q} transform (leaning spire)
function kput(name,p,q,s,c){let P=p,Q=q;if(KXF){const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(KXF.m);P=[v.x,v.y,v.z];Q=(q?q.clone():new THREE.Quaternion()).premultiply(KXF.q);}
 const w=[P[0]+KOFF[0],P[1]+KOFF[1],P[2]+KOFF[2]];
 const t=tcur();if(t){t.inst++;t.tris+=ktri(name);}
 // A NaN here is invisible: the instance renders nowhere and takes the whole
 // InstancedMesh's bounding sphere with it. Catch it at the source, where we
 // still know which type and which kit item produced it.
 if(!finite3(w)||!(typeof s==='number'?isFinite(s):finite3(s)))TSTAT.bad.push({type:TSTAT.cur,item:name,p:w,s:s});
 KIT.items[name].push({p:w,q:Q,s,c});}
let KIT_BAKED=false;
function kbake(parent){KIT_BAKED=true;const m=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),q0=new THREE.Quaternion();let tot=0;
 for(const name of KIT.order){const it=KIT.items[name];if(!it.length)continue;const def=KIT.defs[name];
  // one material clone per InstancedMesh (r128 needs it for instanceColor), but
  // Material.copy() does NOT carry onBeforeCompile, so the glass fresnel has to
  // be re-attached by hand or every instanced pane and finial loses it.
  const _m=def.mat.clone();if(def.mat.onBeforeCompile)_m.onBeforeCompile=def.mat.onBeforeCompile;
  const im=new THREE.InstancedMesh(def.geo,_m,it.length);
  it.forEach((o,i)=>{pos.set(o.p[0],o.p[1],o.p[2]);const s=typeof o.s==='number'?sc.set(o.s,o.s,o.s):sc.set(o.s[0],o.s[1],o.s[2]);
   m.compose(pos,o.q||q0,s);im.setMatrixAt(i,m);if(o.c)im.setColorAt(i,o.c);});
  if(im.instanceColor){const W=new THREE.Color(0xffffff);it.forEach((o,i)=>{if(!o.c)im.setColorAt(i,W);});}
  if(im.instanceColor)im.instanceColor.needsUpdate=true;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;parent.add(im);KIT.meshes[name]=im;tot+=it.length;}
 window._instances=tot;}
// orientation helpers
const _M=new THREE.Matrix4(),_V0=new THREE.Vector3(),_UP=new THREE.Vector3(0,1,0),_X=new THREE.Vector3(1,0,0);
function qFacing(dir){ // quaternion whose local +z points along dir (dir horizontal-ish)
 const d=new THREE.Vector3(dir[0],dir[1],dir[2]).normalize();const up=Math.abs(d.y)>.95?_X:_UP;
 _M.lookAt(d,_V0,up);return new THREE.Quaternion().setFromRotationMatrix(_M);}
function qEuler(x,y,z){return new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));}
function qAxis(ax,ay,az,a){return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(ax,ay,az).normalize(),a);}

// ---------------------------------------------------------------- surfaces
// fn(u,v)->[x,y,z]; opt.hole(u,v)->bool drops that quad. UVs scaled by opt.uS/vS (world-ish units).
function gridSurface(fn,nu,nv,opt){opt=opt||{};const pos=[],uv=[],idx=[];const cols=nu+1;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const p=fn(u,v);pos.push(p[0],p[1],p[2]);uv.push(u*(opt.uS||1),v*(opt.vS||1));}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(opt.hole&&opt.hole((i+.5)/nu,(j+.5)/nv))continue;const a=j*cols+i,b=a+1,c=a+cols,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}
// Lathe with flutes, twist, jagged cut and holes.  o:{rFn(y),H,cut,jag,flutes,amp,sharp,twist,nu,nv,hole(u,y),seed}
function lathe(o){const H=o.H,cut=o.cut!=null?o.cut:H,seed=o.seed||0,nu=o.nu||64,nv=o.nv||48;
 const fn=(u,v)=>{const th=u*TAU;let top=cut;if(o.cut!=null&&o.jag)top=cut+o.jag*(fbm(u*7+seed,2.3,seed*.7,3)*2-1);
  const yy=v*top;let r=o.rFn(Math.min(yy,H));if(o.flutes)r*=1+(o.amp||.08)*Math.pow(.5+.5*Math.cos(th*o.flutes+(o.twist||0)*yy),o.sharp||2);
  return[r*Math.cos(th),yy,r*Math.sin(th)];};
 const opt={uS:o.rFn(0)*TAU/8,vS:cut/8};if(o.hole)opt.hole=(u,v)=>o.hole(u,v*cut);return gridSurface(fn,nu,nv,opt);}
// generic decay hole: more holes near a cut, controlled by d (0..1)
// HOLES scales every decay hole in the kit at once. Decay level 3 (repaired)
// wants the same builders with the same rusted materials but a fabric that is
// only part-eaten, and threading that through 33 builders would be 33 edits
// and 33 chances to miss one. The scene loop sets it per decay level.
let HOLES=1;
function holeFn(d,seed,cut,scale){d*=HOLES;if(!(d>0))return null;scale=scale||1;
 return(u,y)=>{const n=fbm(u*4.5*scale+seed*.31,y*.028*scale,seed,3);const near=cut!=null?clamp((y-(cut-45))/45,0,1):0;return n<.34*d+.4*near*d;};}
function mesh(geo,mat,parent,x,y,z){const m=new THREE.Mesh(geo,mat);if(x!==undefined)m.position.set(x,y,z);if(parent)parent.add(m);
 const t=tcur();if(t){t.meshes++;t.tris+=triOf(geo);}
 return m;}
// Merge geometries that share a material and a parent into one mesh.
//
// Draw calls are per mesh, and the close-up views are dominated by towers built
// one storey at a time - a 60-storey tower emitting two bands per floor is 120
// draw calls on its own. Merging is triangle-neutral and, because the per-vertex
// normals are copied rather than recomputed, pixel-neutral too.
//
// Only for OPAQUE materials: transparent meshes are depth-sorted per mesh, so
// merging glass would change the order things blend in.
function meshMerged(geos,mat,parent,x,y,z){
 const keep=geos.filter(g=>g&&g.attributes&&g.attributes.position&&g.attributes.position.count);
 if(!keep.length)return null;
 if(keep.length===1)return mesh(keep[0],mat,parent,x,y,z);
 let nv=0,ni=0;
 for(const g of keep){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2);
 const I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
 let vo=0,io=0;
 for(const g of keep){const A=g.attributes,c=A.position.count;
  P.set(A.position.array,vo*3);
  if(A.normal)N.set(A.normal.array,vo*3);
  if(A.uv)U.set(A.uv.array,vo*2);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}
  else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}
  vo+=c;}
 const G=new THREE.BufferGeometry();
 G.setAttribute('position',new THREE.BufferAttribute(P,3));
 G.setAttribute('normal',new THREE.BufferAttribute(N,3));
 G.setAttribute('uv',new THREE.BufferAttribute(U,2));
 G.setIndex(new THREE.BufferAttribute(I,1));
 return mesh(G,mat,parent,x,y,z);}
// Bounding box of an object and its children, measured in its PARENT's frame.
function fragBox(o,acc,bb){o.updateMatrix();const m=acc.clone().multiply(o.matrix);
 if(o.isMesh&&o.geometry){const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  if(g.boundingBox&&isFinite(g.boundingBox.min.x))bb.union(g.boundingBox.clone().applyMatrix4(m));}
 for(const c of o.children)fragBox(c,m,bb);
 return bb;}
// Drop a broken-off fragment so it rests where it actually fell.
//
// These geometries almost never have their origin at their own centre. The
// satellite dish's fallen panel is a patch of a paraboloid whose origin is the
// dish axis — 25 m to one side and 30 m below the panel itself — so no
// hand-picked y could put it on the ground, and it hung in the air. The fuel
// lobes, the government petal and the lab's broken spire had the same trap.
//
// Call it AFTER setting rotation. It measures the rotated piece, centres its
// footprint on the position the builder asked for, and sets the height so its
// lowest point sits just under `groundY` (default 0, the world floor).
function dropFragment(o,groundY,bury){const gy=groundY||0,b=bury===undefined?.4:bury;
 const bb=fragBox(o,new THREE.Matrix4(),new THREE.Box3());
 if(!isFinite(bb.min.y)||!isFinite(bb.min.x))return o;
 o.position.x+=o.position.x-(bb.min.x+bb.max.x)/2;
 o.position.z+=o.position.z-(bb.min.z+bb.max.z)/2;
 o.position.y+=gy-b-bb.min.y;
 return o;}
function arcShape(W,Hh,t,D){ // parabolic (catenary-ish) arch, origin at centre bottom, +z depth centred
 const s=new THREE.Shape();const N=24;const outer=[],inner=[];
 for(let i=0;i<=N;i++){const x=-W/2+W*i/N;outer.push([x,Hh*(1-Math.pow(2*x/W,2))]);}
 const Wi=W-2*t,Hi=Hh-t;for(let i=0;i<=N;i++){const x=-Wi/2+Wi*i/N;inner.push([x,Hi*(1-Math.pow(2*x/Wi,2))]);}
 s.moveTo(outer[0][0],0);outer.forEach(p=>s.lineTo(p[0],p[1]));s.lineTo(W/2,0);s.lineTo(Wi/2,0);
 for(let i=N;i>=0;i--)s.lineTo(inner[i][0],inner[i][1]);s.lineTo(-Wi/2,0);s.lineTo(-W/2,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false});g.translate(0,0,-D/2);return g;}
function paraFill(W,Hh,holeW,holeH){ // parabolic wall with an arched opening (ShapeGeometry, in xy plane)
 const s=new THREE.Shape();const N=24;s.moveTo(-W/2,0);for(let i=0;i<=N;i++){const x=-W/2+W*i/N;s.lineTo(x,Hh*(1-Math.pow(2*x/W,2)));}s.lineTo(W/2,0);
 if(holeW){const h=new THREE.Path();h.moveTo(-holeW/2,0);for(let i=0;i<=N;i++){const x=-holeW/2+holeW*i/N;h.lineTo(x,holeH*(1-Math.pow(2*x/holeW,2)));}h.lineTo(holeW/2,0);s.holes.push(h);}
 return new THREE.ShapeGeometry(s);}
function arcWindowGeo(w,h,dep){const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,-h/2);
 const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false});g.translate(0,0,-dep/2);return g;}
function hyperGeo(r0,h,k){return lathe({rFn:y=>r0*Math.sqrt(1+k*Math.pow((y-h/2)/(h/2),2)),H:h,nu:24,nv:10});}

// ---------------------------------------------------------------- kit definitions (shared geometry)
kdef('winI',arcWindowGeo(2.2,4.2,.7),MAT.winIntact); kdef('winD',arcWindowGeo(2.2,4.2,.7),MAT.winDead);
kdef('winBigI',arcWindowGeo(3,3.6,.7),MAT.winIntact); kdef('winBigD',arcWindowGeo(3,3.6,.7),MAT.winDead);
kdef('ovalI',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winIntact); kdef('ovalD',new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2),MAT.winDead);
kdef('archOpen',arcWindowGeo(6,9,1.2),MAT.dark);
kdef('mullW',new THREE.BoxGeometry(.5,1,.5),MAT.white); kdef('mullR',new THREE.BoxGeometry(.5,1,.5),MAT.rust);
kdef('finW',new THREE.BoxGeometry(1,1,1),MAT.dark);kdef('pierW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('pierR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('dot',new THREE.BoxGeometry(1.4,.7,.4),MAT.dot);
kdef('strip',new THREE.BoxGeometry(1,.18,.18),MAT.strip);
kdef('colW',hyperGeo(1,1,1.6),MAT.white); kdef('colR',hyperGeo(1,1,1.6),MAT.rust);
// A PLAIN POST. `colW`/`colR` are 480-triangle fluted lathes, which is right
// for a monumental column and ruinous for a stanchion, a railing upright or a
// specimen tank. The Forest Tower already carried a private 32-triangle post
// for exactly this reason, and Dalab's lab fit-out was spending 1.4M triangles
// on three colW per room. Eight sides, 32 triangles, same materials.
kdef('postW',new THREE.CylinderGeometry(1,1,1,8),MAT.white); kdef('postR',new THREE.CylinderGeometry(1,1,1,8),MAT.rust);
kdef('arch',arcShape(16,27,2.2,4),MAT.white); kdef('archR',arcShape(16,27,2.2,4),MAT.rust);
kdef('vaultRib',arcShape(92,56,2.6,3),MAT.white); kdef('vaultRibR',arcShape(92,56,2.6,3),MAT.rust);
kdef('pipe',new THREE.CylinderGeometry(1,1,1,10),MAT.pipe); kdef('pipeR',new THREE.CylinderGeometry(1,1,1,10),MAT.pipeRust);
kdef('slab',new THREE.CylinderGeometry(1,1,1,48),MAT.slab);
// The decorative bands read as a copper/bronze alloy, so their ruined form is
// the one part of the kit that goes verdigris. Everything else rusts. Keeping
// patina off the steel is the whole reason verdigris became its own material.
kdef('ringW',new THREE.TorusGeometry(1,.09,6,40),MAT.white); kdef('ringR',new THREE.TorusGeometry(1,.09,6,40),MAT.verdigris);
kdef('stain',new THREE.PlaneGeometry(1,1),MAT.stain);
// detail 0, not 1: 20 triangles instead of 80. A moss blob is ground cover a
// metre or two across, it is always squashed flat by its instance scale, and
// nothing in the kit ever gets close enough to count its facets. At detail 1
// it was the single heaviest line item in two types.
kdef('moss',new THREE.IcosahedronGeometry(1,0),MAT.moss);

// ---------------------------------------------------------------- THE LEAF CARD
// One shared tree, because four types independently failed to make one.
//
// The kit's canopy has always been a displaced icosahedron — `moss` at detail 1,
// which is EIGHTY triangles for one blob, and `VEG.tree` hangs three or four of
// them off a trunk. That is 240-320 triangles a tree, it is the top budget line
// in two types, and at ten metres it still reads as a bag of marbles, because a
// faceted ball is a faceted ball however you texture it. The Forest Tower and
// the Forest Ring each wrote their own displaced icosahedron and each logged the
// same complaint against it; Arcbeam duplicated the kit default rather than
// reach into a neighbour's fragment. Raising the displacement amplitude was
// tried twice and is not the answer.
//
// The answer is to stop making the silhouette out of geometry. Three quads
// crossed about the vertical axis, plus one laid near-flat for the view from
// above, carry an alpha-mapped leaf mass: EIGHT triangles
// instead of eighty, and the outline comes from the texture's alpha, which can
// be as ragged as a real canopy for free. `alphaTest`, never `transparent` —
// transparent would put every clump into the sorted pass and cost more in draw
// order than it ever saved in triangles.
//
// Normals point OUT FROM THE CENTRE, not along each quad's own face. Face
// normals light the three cards independently and the clump reads as three flat
// sheets; radial normals light it as one soft volume, which is the whole trick.
TEX.leafCard=canvasTex(128,128,(g,w,h)=>{
 g.clearRect(0,0,w,h);                       // alpha 0 outside the leaf mass
 const cx=w/2,cy=h/2;
 for(let i=0;i<150;i++){
  // biased toward the middle so the card has a dense heart and a ragged edge
  const a=Math.random()*TAU,rad=Math.pow(Math.random(),.62)*w*.47;
  const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;
  const L=w*(.10-.045*rad/(w*.47));          // leaves shrink toward the fringe
  g.save();g.translate(x,y);g.rotate(Math.random()*TAU);
  const lit=.55+.45*(1-rad/(w*.5));          // a crude self-shading gradient
  g.fillStyle='rgb('+Math.round(48*lit+26)+','+Math.round(104*lit+30)+','+Math.round(38*lit+18)+')';
  g.beginPath();g.ellipse(0,0,L,L*.52,0,0,TAU);g.fill();g.restore();}});
MAT.leafCard=new THREE.MeshStandardMaterial({map:TEX.leafCard,alphaTest:.45,
 roughness:1,metalness:0,side:DS});
function leafCardGeo(){
 const P=[],N=[],U=[],v=new THREE.Vector3();
 // unit RADIUS, matching IcosahedronGeometry(1,n), so this is a drop-in
 // replacement anywhere the kit used to place a `moss` blob
 for(let q=0;q<3;q++){const a=q*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
  const V=[[-c,-1,-s],[c,-1,s],[c,1,s],[-c,-1,-s],[c,1,s],[-c,1,-s]];
  const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);
   v.set(V[i][0],V[i][1]*.55,V[i][2]).normalize();N.push(v.x,v.y,v.z);
   U.push(T[i][0],T[i][1]);}}
 // A fourth quad, laid near-flat. Three vertical cards are fine in elevation
 // but from above — off a terrace, or anywhere the camera looks down into a
 // canopy — they present edge-on and the clump reads as a three-pointed star.
 // This one is what the viewer sees from overhead. Two more triangles.
 {const V=[[-1,.34,-1],[1,.34,-1],[1,.1,1],[-1,.34,-1],[1,.1,1],[-1,.1,1]];
  const T=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
  for(let i=0;i<6;i++){P.push(V[i][0],V[i][1],V[i][2]);
   v.set(V[i][0]*.25,1,V[i][2]*.25).normalize();N.push(v.x,v.y,v.z);
   U.push(T[i][0],T[i][1]);}}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 return g;}
kdef('leafCard',leafCardGeo(),MAT.leafCard);
kdef('vine',new THREE.CylinderGeometry(.05,.16,1,5).translate(0,-.5,0),MAT.vine);
kdef('rubble',new THREE.DodecahedronGeometry(1,0),MAT.rubble);
kdef('trunk',new THREE.CylinderGeometry(.18,.4,1,6).translate(0,.5,0),MAT.vine);
kdef('figB',new THREE.CylinderGeometry(.24,.2,1.5,6).translate(0,.75,0),MAT.fig);
kdef('figH',new THREE.SphereGeometry(.13,6,5).translate(0,1.62,0),MAT.fig);
kdef('finial',new THREE.IcosahedronGeometry(1,0),MAT.glass);

// ---------------------------------------------------------------- decoration helpers
function windowsOnLathe(o,d,yFrom,yTo,step,n,gx,gy,gz,big){ // arched windows in flute troughs
 const name=(big?'winBig':'win')+(d>0?'D':'I');
 for(let y=yFrom;y<yTo;y+=step)for(let k=0;k<n;k++){const u=(k+.5)/n;if(o.hole&&o.hole(u,y))continue;if(o.cut!=null&&y>o.cut-4)continue;
  const th=u*TAU,r=o.rFn(y)+.05;kput(name,[gx+r*Math.cos(th),gy+y,gz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);}}
// Ring of light-strip segments (all lit intact; few lit in ruin).
//
// TANGENT, not radial. `strip` is a BoxGeometry(1,.18,.18) scaled to [L,1,1],
// so its long axis is local +X — and qEuler(0,-th,0), which every other ring
// helper in this kit uses, points local +X straight OUT along the radius. Each
// segment is `L = arc length per bay` long, so a ring of them laid radially
// renders as a comb of spokes pointing at the camera rather than a line
// following the ring. The tangent is -th-PI/2.
//
// This was found independently by two builders, each of which wrote its own
// private tangential copy rather than touch the shared function (the Forest
// Tower's `TAN`/`lring`, Plymouth's `lring`). Fixing it here changes all 47
// call sites across 32 fragments, which is the point: they were all wrong.
function stripRing(gx,gy,gz,r,d,n){
 n=n||28;const L=TAU*r/n*.92;for(let k=0;k<n;k++){const th=(k+.5)/n*TAU;const lit=d>0?(rng()<.10):true;
  kput('strip',[gx+r*Math.cos(th),gy,gz+r*Math.sin(th)],qEuler(0,-th-Math.PI/2,0),[L,1,1],lit?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}}
function mullions(gx,gy,gz,r,h,n,d){for(let k=0;k<n;k++){const th=k/n*TAU;kput(d>0?'mullR':'mullW',[gx+r*Math.cos(th),gy+h/2,gz+r*Math.sin(th)],qEuler(0,-th,0),[1,h,1],null);}}
// `noStrip` suppresses the light-strip ring. The strips are an UNLIT material,
// so a dead segment renders at a fixed pale grey rather than going dark with
// the scene; on a building meant to have no power at all (The Project) that
// shows up at night as a row of glowing dashes. Every existing caller omits it.
function glassBand(parent,rFn,y0,h,d,gx,gy,gz,n,noStrip){ // gallery ring: glass drum (intact) or bare mullions round a dark drum (ruin)
 const o={rFn:y=>rFn(y0+y)*(1.09+.05*Math.sin(Math.PI*y/h)),H:h,nu:48,nv:6};
 if(d===0){mesh(lathe(o),MAT.glass,parent,0,y0,0);}
 mesh(lathe({rFn:y=>rFn(y0+y)*.97,H:h,nu:32,nv:2}),MAT.dark,parent,0,y0,0);
 mullions(gx,gy+y0,gz,rFn(y0+h/2)*1.1,h,n||36,d);
 if(!noStrip)stripRing(gx,gy+y0+h*.55,gz,rFn(y0+h/2)*.95,d,n||28);
 // ledge slab under the band
 kput('slab',[gx,gy+y0-.4,gz],null,[rFn(y0)*1.16,.8,rFn(y0)*1.16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));}
function floorSlabs(gx,gy,gz,rFn,y0,y1,step,d,cut){for(let y=y0;y<y1;y+=step){if(cut!=null&&y>cut+3)break;kput('slab',[gx,gy+y,gz],null,[rFn(y)*.93,.5,rFn(y)*.93],new THREE.Color(0x2a2c30));}}
function scatterMoss(gx,gy,gz,rMin,rMax,n,sMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax);const s=rr(.5,sMax);
 kput('moss',[gx+r*Math.cos(a),gy+s*.25,gz+r*Math.sin(a)],qEuler(0,rng()*TAU,0),[s*rr(.8,1.4),s*.38,s*rr(.8,1.4)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function mossOnRing(gx,gy,gz,r,n,sMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,s=rr(.6,sMax);kput('moss',[gx+r*Math.cos(a)*rr(.85,1.02),gy+s*.2,gz+r*Math.sin(a)*rr(.85,1.02)],null,[s*1.3,s*.4,s*1.3],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.05,.12)));}}
function vinesOnRing(gx,gy,gz,r,n,lMax){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,L=rr(4,lMax);kput('vine',[gx+r*Math.cos(a),gy,gz+r*Math.sin(a)],qEuler(rr(-.12,.12),0,rr(-.12,.12)),[rr(.8,1.6),L,rr(.8,1.6)],null);}}
// Rubble piles AGAINST the wall it fell from. The radius is biased hard toward
// rMin, blocks are largest there, and they bank up into a talus slope that
// thins to a scatter at the outer edge. A uniform annulus reads as a decorative
// ring laid round the building, which is exactly what this used to be.
function rubbleRing(gx,gy,gz,rMin,rMax,n,sMax){for(let i=0;i<n;i++){const a=rng()*TAU;
 const q=Math.pow(rng(),2.4);                       // 0 at the wall, 1 at the outer edge
 const r=rMin+(rMax-rMin)*q, s=rr(.6,sMax)*(1.25-.55*q);
 const bank=(1-q)*(1-q)*sMax*.55;
 kput('rubble',[gx+r*Math.cos(a),gy+bank+s*.4,gz+r*Math.sin(a)],qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.35),rr(.3,.55)));}}

// --- sampling a structure's own surfaces -------------------------------------
// Moss belongs on what faces the sky and vines hang off real ledges, so both
// need to know where a structure's horizontal surfaces actually are. This walks
// the triangles of geometries the builder has already made, keeps the ones
// lying flat, and samples points on them weighted by area.
//
// It tests |ny| rather than ny: these shells are DoubleSide and their winding is
// not reliably outward, so a balcony floor can come back with a downward normal
// while being visibly a floor. The cost is that a true soffit can be sampled
// too, which is rare in these shapes and cheaper than missing every ledge.
// `src` may be a geometry, an array of them, or a whole Object3D — in which
// case it is traversed and each mesh's transform is baked relative to the root,
// so a finished structure can be sampled without the builder handing anything
// over. That is what lets the repaired pass dress all 33 types from one place.
// Keeps faces whose |normal.y| lands in [lo,hi]; returns points and normals.
function faceSamples(src,count,lo,hi){
 const tri=[],cum=[],v=new THREE.Vector3();let tot=0;
 const add=(g,M)=>{const A=g&&g.attributes&&g.attributes.position;if(!A)return;
  const P=A.array,I=g.index?g.index.array:null,nT=I?I.length/3:A.count/3;
  for(let f=0;f<nT;f++){
   const a=(I?I[f*3]:f*3)*3,b=(I?I[f*3+1]:f*3+1)*3,c=(I?I[f*3+2]:f*3+2)*3;
   let ax=P[a],ay=P[a+1],az=P[a+2],bx=P[b],by=P[b+1],bz=P[b+2],cx=P[c],cy=P[c+1],cz=P[c+2];
   if(M){v.set(ax,ay,az).applyMatrix4(M);ax=v.x;ay=v.y;az=v.z;
         v.set(bx,by,bz).applyMatrix4(M);bx=v.x;by=v.y;bz=v.z;
         v.set(cx,cy,cz).applyMatrix4(M);cx=v.x;cy=v.y;cz=v.z;}
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,L=Math.hypot(nx,ny,nz);
   if(!(L>1e-9))continue;const up=Math.abs(ny/L);
   if(up<lo||up>hi)continue;
   tot+=L*.5;tri.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx/L,ny/L,nz/L]);cum.push(tot);}};
 if(src&&src.isObject3D){src.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(src.matrixWorld).invert();
  src.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)add(o.geometry,new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));});}
 else for(const g of (Array.isArray(src)?src:[src]))add(g,null);
 const out=[];if(!(tot>0))return out;
 for(let i=0;i<count;i++){const t=rng()*tot;let a=0,b=cum.length-1;
  while(a<b){const m=(a+b)>>1;if(cum[m]<t)a=m+1;else b=m;}
  const T=tri[a];let u=rng(),w=rng();if(u+w>1){u=1-u;w=1-w;}
  const x=T[0]+u*(T[3]-T[0])+w*(T[6]-T[0]),y=T[1]+u*(T[4]-T[1])+w*(T[7]-T[1]),z=T[2]+u*(T[5]-T[2])+w*(T[8]-T[2]);
  out.push({p:[x,y,z],n:[T[9],T[10],T[11]],r:Math.hypot(x,z)});}
 return out;}
function upFaces(src,count,minNY){return faceSamples(src,count,minNY,1.01);}
// The near-vertical faces: walls. Where patches get riveted on.
function sideFaces(src,count){return faceSamples(src,count,0,.34);}
// The outer band of the flat surfaces is where a ledge is: water leaves the
// building there, so that is where vines root and where stains start.
// `cx,cz` is the centre the radius is measured from, and it is NOT always the
// builder's origin. A crescent is drawn about a centre of curvature well off
// that origin (the Hotel's is 63 m away), so measuring from 0,0 ranks the two
// HORNS of the crescent as its outermost points and hangs every vine and every
// water stain off the two ends of the building instead of off its long face.
function ledgePoints(geos,n,frac,cx,cz){const s=upFaces(geos,n*4,.5);if(!s.length)return[];
 if(cx!==undefined)for(const f of s)f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);
 s.sort((a,b)=>b.r-a.r);return s.slice(0,Math.max(1,Math.round(s.length*(frac||.3))));}
function mossOnSurface(geos,gx,gy,gz,n,sMax){for(const f of upFaces(geos,biomeN(n),.55)){const s=rr(.5,sMax);
 kput('moss',[gx+f.p[0],gy+f.p[1]+s*.15,gz+f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.8,1.5),s*rr(.22,.42),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function vinesFromLedge(geos,gx,gy,gz,n,lMax,cx,cz){for(const f of ledgePoints(geos,biomeN(n),.3,cx,cz)){const L=rr(4,lMax);
 kput('vine',[gx+f.p[0],gy+f.p[1],gz+f.p[2]],qEuler(rr(-.14,.14),rng()*TAU,rr(-.14,.14)),[rr(.8,1.7),L,rr(.8,1.7)],null);}}
// Water-staining below each ledge: a multiply-blended streak, so it darkens
// whatever wall it lands on instead of painting a grey rectangle over it.
//
// Still radial, which is the standing complaint against it on a rectilinear
// plan — but it is now radial about `cx,cz` rather than always about the
// builder's origin. On the Hotel, whose crescent is struck from a centre 63 m
// behind the origin, the two are 43 degrees apart at the horns, so every
// streak at the ends of the building was laid across the facade instead of
// down it. Callers on a circular plan centred on their own origin pass nothing
// and are unchanged.
function stainsFromLedge(geos,gx,gy,gz,n,lMax,cx,cz){const ox=cx||0,oz=cz||0;
 for(const f of ledgePoints(geos,n,.45,cx,cz)){
 const L=rr(5,lMax),a=Math.atan2(f.p[2]-oz,f.p[0]-ox),o=1.004;
 kput('stain',[gx+ox+(f.p[0]-ox)*o,gy+f.p[1]-L*.5,gz+oz+(f.p[2]-oz)*o],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.5),L,1],null);}}

// VEGETATION HAND-OFF. The Krator flora pass is a separate project and will
// replace VEG.tree wholesale; everything in this kit that plants anything goes
// through it, so that swap is one assignment and touches no builder.
// y is the ground height at (x,z) — ask terrainH, do not assume 0.
// ---------------------------------------------------------------- THE BIOME
// One dial the whole kit's planting hangs off, so "overgrown" is a setting
// rather than 33 separate edits. `lush` multiplies every scattered population:
// 1 is the kit as designed, 3 is a site the plain has taken back.
//
// A builder is CROSS-COMPATIBLE with this when its own planting loops route
// their counts through BIOME.lush too — the shared helpers below already do,
// so a type that plants only via trees()/scatterMoss()/VEG.tree gets it free,
// and a type with a bespoke scatter (both forest types, Arcbeam, Arcoindian)
// has to opt in. That difference is exactly what the biome pass is testing.
//
// It is a GLOBAL and the builders run in sequence, so anything that sets it
// must put it back — see `withBiome`, which is the only sanctioned way in.
const BIOME={lush:1};
function withBiome(lush,fn){const was=BIOME.lush;BIOME.lush=lush;
 try{fn();}finally{BIOME.lush=was;}}
const biomeN=n=>Math.round(n*BIOME.lush);

// The hand-off point for flora. Every planting call in the kit goes through
// this, so changing it changes the forest everywhere at once — which is the
// point: see the LEAF CARD note in 34-kitdefs.js for why the four-icosahedra
// version had to go. Trunk + two or three crossed leaf cards is 36-42 triangles
// against the old 240-320, and it reads as foliage at eye level instead of as a
// bag of marbles. `species` picks the habit: odd is a narrow spire, even a
// broad dome, so a scatter of `i%3` gives a mixed stand rather than one tree
// repeated.
const VEG={
 tree(x,y,z,species,h){
  const spire=!!(species%2);
  kput('trunk',[x,y,z],null,[h*.20,h*(spire?.74:.62),h*.20],null);
  const n=spire?2:3;
  for(let k=0;k<n;k++){
   const s=h*(spire?rr(.22,.32):rr(.30,.44))*(1-k*.13);
   kput('leafCard',[x+rr(-.13,.13)*h,y+h*((spire?.66:.58)+k*.15),z+rr(-.13,.13)*h],
    qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),
    [s,s*(spire?rr(1.0,1.35):rr(.70,.95)),s],
    // The instance colour MULTIPLIES an already mid-green sRGB map, so the two
   // compound: .15-.30 lightness — the value the old icosahedra used against
   // no texture at all — came back as near-black shrubs.
   new THREE.Color().setHSL(rr(.22,.34),rr(.30,.52),rr(.40,.68)));}},
};
function trees(gx,gz,rMin,rMax,n){n=biomeN(n);for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax),h=rr(6,14);
 const x=gx+r*Math.cos(a),z=gz+r*Math.sin(a);VEG.tree(x,terrainH(x,z),z,i%3,h);}}
// APRON. Every structure meets the ground on a hard line without one. This lays
// a graded skirt from the foot of the mass out to the ground, so the two blend.
// cx,cz are local to the builder's group, like everything else a builder does.
function apron(parent,cx,cz,rIn,rOut,d,hIn){
 const wx=KOFF[0]+cx,wz=KOFF[2]+cz;
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rIn,rOut,v)*(1+.07*fbm(u*7,1.3,17,2));
  const x=r*Math.cos(th),z=r*Math.sin(th);
  return[x,lerp(hIn,0,Math.pow(v,.6))+terrainH(wx+x,wz+z),z];},64,6,{uS:rIn/6,vS:3}),
  d>0?MAT.mud:MAT.rock,parent,cx,0,cz);}
function figures(gx,gz,n,spread){for(let i=0;i<n;i++){const x=gx+rr(-spread,spread),z=gz+rr(-spread,spread);const c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
 kput('figB',[x,0,z],qEuler(0,rng()*TAU,0),1,c);kput('figH',[x,0,z],null,1,new THREE.Color(0xc9a17e));}}
function stats(){}

// ---------------------------------------------------------------- v2 helpers
kdef('strutW',new THREE.BoxGeometry(1,1,1),MAT.white); kdef('strutR',new THREE.BoxGeometry(1,1,1),MAT.rust);
kdef('cell',new THREE.BoxGeometry(1,1,.5),MAT.dot);
// The same cell on a LIT material. `cell` is MeshBasicMaterial, which is right
// for a window that is on and wrong for one that is off: a DEAD instance colour
// is 0x0a0c0e and an unlit material ignores the scene, so it renders at a fixed
// ~60/255 grey. In daylight that reads as a dark opening and nobody noticed.
// Put the scene into night for The Project and every dead window on the tower
// became a pale panel, brighter than the wall around it. This one goes black
// when the light does.
kdef('cellD',new THREE.BoxGeometry(1,1,.5),MAT.winDead);
kdef('winSmI',arcWindowGeo(1.1,2,.4),MAT.winIntact); kdef('winSmD',arcWindowGeo(1.1,2,.4),MAT.winDead);
function beam(name,a,b,w,dp,color){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.sqrt(dx*dx+dy*dy+dz*dz);
 const q=new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx,dy,dz).normalize());kput(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q,[w,L,dp],color||null);}
function hexR(R,th){const a=R*Math.cos(Math.PI/6);const f=((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3);return a/Math.cos(f-Math.PI/6);}
// petal shell: base on +x at radius Rb, rises Hp, tip leans outward by `lean`, cupped by `curl`
function petalGeo(Rb,Hp,W,lean,curl,hole){return gridSurface((u,v)=>{const s=u*2-1;const w=W*(.3+.7*Math.sin(Math.PI*Math.pow(v,.9)))*.5;
 const x=Rb+lean*v-curl*s*s*w;return[x,Hp*v,s*w];},14,22,{uS:2,vS:4,hole});}
function petalRing(parent,n,Rb,Hp,W,lean,curl,y,d,seed,mat,skipFn){for(let i=0;i<n;i++){if(skipFn&&skipFn(i))continue;const g=petalGeo(Rb,Hp,W,lean,curl,d>0?(u,v)=>fbm(u*3+i,v*5,seed+i,2)<.3*d:null);
 const m=mesh(g,mat,parent,0,y,0);m.rotation.y=-i/n*TAU;}}
// Luce-style hypar shell pair: two warped sheets leaning together over a glass gable
function luceShells(parent,xc,zc,Wb,Hs,Dd,d,seed,skin){[-1,1].forEach(side=>{const g=gridSurface((u,v)=>{const x=xc+(u-.5)*Wb*(1-.55*v);const z=zc+side*(Dd*(1-v)*(1-.35*Math.pow(u-.5,2)*4)+.6*(1-v)+.5*v);return[x,Hs*v*(1-.15*Math.pow((u-.5)*2,2)),z];},20,16,{uS:4,vS:3,hole:holeFn(d*.7,seed+side,null,2)});
 mesh(g,skin,parent);});
 if(d===0){const s=new THREE.Shape();s.moveTo(-Wb/2,0);s.lineTo(Wb/2,0);s.lineTo(0,Hs*.98);s.lineTo(-Wb/2,0);const gl=mesh(new THREE.ShapeGeometry(s),MAT.glass,parent,xc,0,zc+.2);}
 kput('archOpen',[xc,3,zc-Dd*.05],qFacing([0,0,1]),[.45,.45,1],null);}
function ribCurveGeo(pts,r){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],0))),28,r,8,false);}

// ---------------------------------------------------------------- v3: inspector registry + group transforms
const REG=[];function REGISTER(o){REG.push({name:o.name,x:o.x+KOFF[0],y:o.y||0,z:o.z+KOFF[2],r:o.r,h:o.h});}
function useGroupXF(P){P.updateMatrix();KXF={m:P.matrix.clone(),q:P.quaternion.clone()};}
function endGroupXF(){KXF=null;}
kdef('tube',new THREE.CylinderGeometry(1,1,1,8),MAT.dark);
kdef('boxD',new THREE.BoxGeometry(1,1,1),MAT.dark);
kdef('boxW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('boxR',new THREE.BoxGeometry(1,1,1),MAT.rust);
const STATE=d=>d===3?'repaired':d>0?'ruined':'intact';

// ---------------------------------------------------------------- v4: concrete, brick, glass panes
// Board-formed concrete: horizontal boards ~0.65 m deep, each poured a shade
// different, with the joint standing proud, a form-tie hole grid, a rust weep
// below each tie, and damp running down from every joint.
const BOARD=42;
TEX.concrete=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const bi=Math.floor(y/BOARD),fy=y%BOARD;
  let v=186+(h3(bi*3.1,0,2.2)-.5)*13;                       // board-to-board pour variation
  v+=(fbm(x/40,y/40,5.5,3)-.5)*24;                          // slow blotching
  v+=(fbm(x/4,y/4,8.1,1)-.5)*13;                            // aggregate speckle
  v+=Math.sin(x/9+bi*2.1)*2.2;                              // grain of the board itself
  if(fy<2)v-=46; else if(fy<4)v-=15; else if(fy>BOARD-3)v+=9;   // joint groove + lit lip
  const tx=(x+28)%128,ty=y%(BOARD*2),td=Math.hypot(tx-64,ty-BOARD);
  if(td<3.4)v-=44; else if(td<5)v-=16;                      // recessed form-tie hole
  if(td<10&&ty>BOARD)v-=clamp((10-td)/10,0,1)*15;           // rust weep below it
  v-=clamp((fbm(x/26,y/200,2.2,2)-.52)*4,0,1)*clamp(fy/BOARD*1.3,0,1)*30;   // damp under the joint
  d[i]=v;d[i+1]=v-2;d[i+2]=v-7;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.concreteRM=rmTex(256,256,(x,y)=>{const B=BOARD/2,fy=y%B;
 let r=.90+(fbm(x/20,y/20,4.1,2)-.5)*.10;
 if(fy<1)r=.97;                                             // the joint holds dirt
 return[clamp(r-clamp((fbm(x/13,y/100,2.2,2)-.52)*4,0,1)*clamp(fy/B*1.3,0,1)*.24,0,1),0];});
// Brick in common bond: five stretcher courses, then a header course. The old
// map was a plain running bond of randomly-toned rectangles with the background
// showing through as "mortar".
TEX.brick=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const CH=16,MJ=2.5;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const course=Math.floor(y/CH),header=(course%6)===5,BW=header?16:32;
  const off=header?((course%2)?8:0):((course%2)*BW/2);
  const bx=(x+off)%BW,by=y%CH,grain=(fbm(x/3,y/3,9.9,1)-.5);
  let r,gg,b;
  if(bx<MJ||by<MJ){const m=176+(fbm(x/5,y/5,7.7,1)-.5)*16;r=m;gg=m-4;b=m-10;}   // mortar
  else{const t=h3(Math.floor((x+off)/BW)*1.3,course*2.7,4.4);
   r=118+t*46+grain*16;gg=70+t*28+grain*10;b=54+t*22+grain*8;
   if(Math.min(bx-MJ,BW-1-bx,by-MJ,CH-1-by)<1.5){r*=.9;gg*=.9;b*=.9;}}          // arris shadow
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.concrete=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd2cec6,roughness:1,metalness:0,side:DS});
MAT.concreteR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7c746c,roughness:1,metalness:0,side:DS});
MAT.brick=new THREE.MeshStandardMaterial({map:TEX.brick,color:0xffffff,roughness:.95,metalness:0,side:DS});
const CONC=d=>d>0?MAT.concreteR:MAT.concrete;
kdef('boxC',new THREE.BoxGeometry(1,1,1),MAT.concrete);kdef('boxCR',new THREE.BoxGeometry(1,1,1),MAT.concreteR);
kdef('brick',new THREE.BoxGeometry(1,1,1),MAT.brick);
kdef('pane',new THREE.BoxGeometry(1,1,.12),MAT.glass);kdef('paneD',new THREE.BoxGeometry(1,1,.12),MAT.winDead);
kdef('slabC',new THREE.CylinderGeometry(1,1,1,48),MAT.concrete);kdef('slabCR',new THREE.CylinderGeometry(1,1,1,48),MAT.concreteR);
const BOXC=d=>d>0?'boxCR':'boxC', SLABC=d=>d>0?'slabCR':'slabC';
function se(th,n){return 1/Math.pow(Math.pow(Math.abs(Math.cos(th)),n)+Math.pow(Math.abs(Math.sin(th)),n),1/n);}
// `stand` forces the full-height branch whatever `d` is. The test is `d<2`,
// which is right for 0 and 1 and wrong for everything above 2: decay 3 falls
// into the TOPPLED branch and is built cut off at cutY, without the fallen
// upper body that is the only reason to cut it. That is why a rehabilitated
// tower is a stump in --target repaired, and why the Projects (decay 4) pass
// stand=true. Every existing caller omits it and is unchanged.
function bodyGroup(G,y0,d,dd,build,cutY,topR,stand){const P=new THREE.Group();P.position.set(0,y0,0);G.add(P);useGroupXF(P);if(d<2||stand)build(P,dd,y0,null,false);else build(P,1,y0,cutY,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,cutY,topR,(U)=>build(U,1,cutY,null,true),d);}

// ================================================================= DALAB — the ancient lab domes
// The genetic-engineering compound at the centre of Dalab: one great dome with
// a ring of smaller ones round it, joined by part-buried passageways, inside a
// low ruined wall. Heavily rusted and overgrown — this complex is never shown
// intact, because nobody alive built it.
//
// SCOPE: the ancient domes ONLY. No settlement, no mounds, no streets, no life
// layer. Those are laid out around this later.
//
// The domes are OPAQUE. Everywhere else in the kit an ancient shell reaches for
// blue glass; here it does not, and that is what makes the complex read as a
// facility rather than a temple. Gaudi ribs and a lantern at the apex, with the
// hard deliberate geometry of a 1999 arcology rather than a cathedral.
//
// OPEN: the great dome must be "wider and taller than the Voth palace" and that
// project's dimensions are not to hand. Built at DR=110 / DH=95, larger than
// anything in this kit but the megastructures. Rescale by DR/DH alone.
function dalabDome(C,R,H,d,sd,broken){
 const {SH,DK,G}=C;
 const prof=y=>R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.58);   // a dome, slightly shouldered
 // Where a dome is broken the hole predicate is not noise: it is one great bite
 // taken out of a quadrant, so the opening has an edge you can read a section
 // against instead of dissolving into lace.
 const bite=broken?(u,v)=>{const du=Math.abs(((u-broken.u+1.5)%1)-.5);
  return du<broken.w*(.35+.65*v)&&v>broken.y0;}:null;
 const hole=(u,y)=>{const v=y/H;
  return(bite&&bite(u,v))||(holeFn(d*.75,sd,null,1.25)||(()=>false))(u,y);};
 SH.push(lathe({rFn:prof,H,flutes:R>70?28:16,amp:.055,sharp:2,nu:R>70?128:72,nv:R>70?40:24,hole}).translate(C.x,0,C.z));
 // the inner skin: what you see across the void when a dome is opened up
 DK.push(lathe({rFn:y=>prof(y)*.93,H:H*.985,nu:48,nv:18,hole:(u,y)=>bite?bite(u,y/H):false}).translate(C.x,0,C.z));
 // ribs picked out along the meridians, and hoops round it
 for(let k=0;k<(R>70?28:16);k++){const th=k/(R>70?28:16)*TAU;
  if(broken&&bite(th/TAU,.6)&&rng()<.7)continue;
  const pts=[];for(let i=0;i<=9;i++){const y=H*i/9*.985;pts.push([prof(y)*1.02,y]);}
  for(let i=0;i<9;i++)beam(PLATE(d),[C.x+Math.cos(th)*pts[i][0],pts[i][1],C.z+Math.sin(th)*pts[i][0]],
   [C.x+Math.cos(th)*pts[i+1][0],pts[i+1][1],C.z+Math.sin(th)*pts[i+1][0]],R*.022,R*.030);}
 for(const t of [.22,.52,.80]){const r=prof(H*t)*1.03;
  kput(d>0?'ringR':'ringW',[C.x,H*t,C.z],qEuler(Math.PI/2,0,0),[r,r,R*.03],null);}
 // apex lantern — the one place light was meant to get in
 kput(SLABC(d),[C.x,H*.995,C.z],null,[R*.17,R*.03,R*.17],null);
 for(let k=0;k<10;k++){const th=k/10*TAU;
  kput(d>0?'colR':'colW',[C.x+Math.cos(th)*R*.14,H*.99,C.z+Math.sin(th)*R*.14],null,[R*.012,R*.09,R*.012],null);}
 kput(SLABC(d),[C.x,H*.99+R*.09,C.z],null,[R*.19,R*.025,R*.19],null);
 // overgrowth: this complex has stood open for a very long time
 // these counts are linear in R, so at 4x the dome they were 4x the scatter;
 // held back to roughly the density the 110 m dome had
 mossOnRing(C.x,H*.06,C.z,R*.97,Math.round(R*.20),R*.035);
 vinesOnRing(C.x,H*.45,C.z,prof(H*.45)*1.02,Math.round(R*.11),R*.5);
 rubbleRing(C.x,0,C.z,R*1.0,R*1.5,Math.round(R*.22),R*.035);
 return prof;}

// A cross-section of what was inside: floor plates cut off at the break, a
// double-loaded corridor, ward rooms and lab rooms, and service cores running
// the full height. This is the kit's first real interior — the original brief
// has wanted one behind every opening since the start, and this is the same
// machinery, so it is written to be reusable rather than fitted to one dome.
// `broken` is the same spec dalabDome() got. FLOOR HEIGHT IS NOT A SCALE
// FACTOR: FH stays at a real 4.6 m whatever the dome measures, so enlarging the
// dome ADDS STOREYS rather than stretching the ones that were there — 17 floors
// at the original 95 m, 72 at 390 m.
//
// That is also why the fit-out has to be gated. At the new radius the room ring
// wants ~106 rooms a floor, and 72 floors of that is ~38 000 instances for an
// interior you can only see through one bite out of one quadrant. The rooms are
// now laid only across the arc the break actually exposes (widened 1.6x, so the
// section does not visibly stop at the tear), which is a fifth of the ring.
function sectionInterior(C,R,H,d,sd,broken){
 const {SH,DK,G}=C;const FH=4.6;
 const seen=(u,v)=>{if(!broken)return true;
  const du=Math.abs(((u-broken.u+1.5)%1)-.5);
  return du<broken.w*(.35+.65*v)*1.6;};
 for(let f=1;f*FH<H*.86;f++){const y=f*FH,rr0=R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.58)*.9;
  if(rr0<R*.16)break;
  // THE PLATE IS PALE AND ITS SOFFIT IS DARK. Both used to go into DK, and a
  // dark plate seen edge-on across the void against the far inner skin — which
  // MAT.guts renders as mid-grey under this lighting, not black — read as a
  // pencil line. Pale concrete over a dark shadow band is what makes a stack of
  // floors legible in section; the Forest Tower's shear and Plymouth's slumped
  // flank both needed exactly this and neither worked without it.
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0*v;return[C.x+r*Math.cos(th),y,C.z+r*Math.sin(th)];},40,5,{uS:R/6,vS:3}));
  DK.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0*v;return[C.x+r*Math.cos(th),y-1.4,C.z+r*Math.sin(th)];},40,3,{uS:R/6,vS:3}));
  // a double-loaded corridor: rooms, gangway, rooms
  for(const ring of [.42,.80]){
   DK.push(lathe({rFn:()=>rr0*ring,H:FH*.82,nu:36,nv:2,
    hole:(u,y2)=>((u*22)%1)<.34}).translate(C.x,y,C.z));}
  // room fit-out, alternating wards and labs by floor
  const ward=(f%2)===0,n=Math.max(6,Math.round(rr0*.26));
  for(let k=0;k<n;k++){const th=(k+.5)/n*TAU,r=rr0*.61;
   if(!seen(th/TAU,y/H))continue;
   const px=C.x+r*Math.cos(th),pz=C.z+r*Math.sin(th),q=qEuler(0,-th,0);
   if(ward){ // beds in rows, a curtain rail over each
    for(const sg of [-1,1])kput('boxD',[px+Math.cos(th+1.57)*sg*rr0*.09,y+.5,pz+Math.sin(th+1.57)*sg*rr0*.09],q,[2.0,.9,.9],null);
    kput(d>0?'pipeR':'pipe',[px,y+2.4,pz],qEuler(0,-th,Math.PI/2),[.09,rr0*.26,.09],null);}
   else{     // benches, and a bank of specimen tanks against the corridor wall
    kput('boxD',[px,y+.9,pz],q,[rr0*.20,.22,1.1],null);
    for(let j=-1;j<=1;j++)kput(d>0?'postR':'postW',[px+Math.cos(th+1.57)*j*1.5,y+1.5,pz+Math.sin(th+1.57)*j*1.5],null,[.42,2.2,.42],null);}
   const lit=rng()<(d>0?.05:.5);
   kput('strip',[px,y+FH-.7,pz],q,[rr0*.18,1,1],lit?CYAN:DEAD);}
  // conduit bundles dropping through every floor
  for(let k=0;k<5;k++){const th=rng()*TAU,r=rr0*rr(.2,.9);
   kput(d>0?'pipeR':'pipe',[C.x+r*Math.cos(th),y+FH*.5,C.z+r*Math.sin(th)],null,[.28,FH,.28],null);}}
 // service cores: lift shafts and stairs, full height, the spine of the section
 for(let k=0;k<3;k++){const th=k/3*TAU+.7,r=R*.30;
  kput(BOXC(d),[C.x+r*Math.cos(th),H*.42,C.z+r*Math.sin(th)],qEuler(0,-th,0),[R*.12,H*.84,R*.12],null);
  kput('boxD',[C.x+r*Math.cos(th),H*.42,C.z+r*Math.sin(th)],qEuler(0,-th,0),[R*.10,H*.83,R*.10],null);}}

function buildDalab(scene,gx,gz,d){reseed(9330+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
// THE SCALE. The great dome was DR=110 / DH=95 — a guess, logged in
 // KNOWN_ISSUES as "wider and taller than the Voth palace" with no dimensions to
 // hand. It is now sized against the kit itself: the Forest Ring's lantern tops
 // out at 780 m and the great dome is half that. 390/95 = 4.105, and every
 // layout dimension in the compound goes through K, so the place keeps its
 // proportions instead of becoming one huge dome standing among small ones.
 const K=4.105;
 const DR=Math.round(110*K),DH=Math.round(95*K);       // 452 x 390
 REGISTER({name:'Dalab — the ancient lab ('+STATE(d)+')',x:0,z:0,r:300*K,h:DH+30*K});
 REGISTER({name:'Dalab — the great dome',x:0,z:0,r:DR+8*K,h:DH+22*K});
 const C={SH:[],DK:[],G,x:0,z:0};
 // the great dome, broken open on its south-east quarter
 // The bite is WIDER than it was, and starts lower. w=.115/y0=.10 was sized
 // against a 95 m dome with 17 floors in it; on a 390 m dome with 72 the same
 // proportions left the inner skin standing as a pale wall across four fifths
 // of the section, so the storeys the rescale exists to show were hidden
 // behind it. .20 opens 72 degrees at the crown and 29 at the springing.
 const BITE={u:.16,w:.11,y0:.10};   // DALAB: a narrower, higher gash (was .20/.04)
 dalabDome(C,DR,DH,d,9331,BITE);
 sectionInterior(C,DR,DH,d,9332,BITE);
 // the sunken chamber on the axis: cabinet banks and cable trunking converging
 // on a circle of floor. A plant room to a stranger, a shrine to a priest.
 kput(SLABC(d),[0,1.2,0],null,[DR*.30,2.4,DR*.30],null);
 for(let k=0;k<16;k++){const th=k/16*TAU;
  kput(BOXC(d),[Math.cos(th)*DR*.235,4.4,Math.sin(th)*DR*.235],qEuler(0,-th,0),[5.5,6.4,3.2],null);
  kput(d>0?'pipeR':'pipe',[Math.cos(th)*DR*.30,8.6,Math.sin(th)*DR*.30],qEuler(0,-th,Math.PI/2),[.5,DR*.14,.5],null);
  const lit=d>0?rng()<.06:true;
  kput('strip',[Math.cos(th)*DR*.218,7.4,Math.sin(th)*DR*.218],qEuler(0,-th,0),[4,1,1],lit?CYAN:DEAD);}
 kput(d>0?'ringR':'ringW',[0,2.6,0],qEuler(Math.PI/2,0,0),[DR*.19,DR*.19,1.6],null);
 // the satellite domes, no two the same, two of them also broken open
 const SAT=[[178,-52,46,42,1],[126,152,34,31,0],[-86,176,40,36,1],
            [-192,26,29,27,0],[-138,-148,37,33,0],[54,-186,24,23,0],[205,88,31,28,0]]
            .map(q=>[q[0]*K,q[1]*K,q[2]*K,q[3]*K,q[4]]);
 SAT.forEach((s,i)=>{const [sx,sz,sr,sh,brk]=s;
  const SC={SH:C.SH,DK:C.DK,G,x:sx,z:sz};
  REGISTER({name:'Dalab — dome '+(i+2),x:sx,z:sz,r:sr+6*K,h:sh+14*K});
  dalabDome(SC,sr,sh,d,9340+i*7,brk?{u:rr(0,1),w:.10,y0:.12}:null);
  if(brk)sectionInterior(SC,sr,sh,d,9350+i*5,{u:.5,w:.10,y0:.12});
  // the passageway in: part buried, ribbed, with a clerestory along the top
  const a=Math.atan2(sz,sx),L=Math.hypot(sx,sz)-sr*.9-DR*.9;
  if(L>10){const mx=Math.cos(a)*(DR*.9+L/2),mz=Math.sin(a)*(DR*.9+L/2);
   C.SH.push(lathe({rFn:()=>7.5*K,H:L,nu:14,nv:Math.round(L/(6*K)),hole:holeFn(d*.8,9360+i,null,1.6)})
    .rotateZ(Math.PI/2).rotateY(-a).translate(mx,5.5*K,mz));
   for(let k=0;k<Math.round(L/(9*K));k++){const t=(k+.5)/Math.round(L/(9*K));
    const px=Math.cos(a)*(DR*.9+L*t),pz=Math.sin(a)*(DR*.9+L*t);
    kput(d>0?'ringR':'ringW',[px,5.5*K,pz],qEuler(0,-a,Math.PI/2),[8.2*K,8.2*K,1.1*K],null);
    if(rng()<.5)kput(d>0?'winSmD':'winSmI',[px,12.4*K,pz],qFacing([0,1,0]),[2.4*K,2.4*K,1],null);}
   mossOnRing(mx,11.5*K,mz,L*.38,Math.round(L*.22/K),1.5*K);}});
 // the low ruined wall round the compound, breached in places
 for(let k=0;k<(typeof LAB_WALL_GAP!=='undefined'?0:200);k++){const th=k/200*TAU,r=(292+12*fbm(k*.14,2.2,9370,2))*K;   // DALAB: the block ring is replaced by a real ruined wall (90a)
  if(fbm(k*.09,1.1,9371,2)<.30)continue;                     // breaches
  if(typeof LAB_WALL_GAP!=='undefined'&&Math.abs(th-LAB_WALL_GAP.a)<LAB_WALL_GAP.w)continue;   // DALAB: the gate where the oak avenue enters
  kput(BOXC(d),[Math.cos(th)*r,rr(1.4,3.4)*K,Math.sin(th)*r],qEuler(0,-th,0),[rr(6,13)*K,rr(2.8,6.8)*K,rr(2.6,4.4)*K],null);}
 apron(G,0,0,300*K,352*K,d,1.6*K);
 scatterMoss(0,0,0,0,330*K,220,3.2*K);trees(0,0,150*K,420*K,150);
 rubbleRing(0,0,0,150*K,330*K,170,2.8*K);
 figures(0,260*K,14,60*K);figures(-210*K,-80*K,8,40*K);
 meshMerged(C.SH,skin,G);meshMerged(C.DK,MAT.guts,G);
 KOFF=[0,0,0];return G;}
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
// ================================================================= IZIZ VERNACULAR — materials + kit items
// What the Izani build today, in timber, reclaimed metal and (for the rich)
// stone. Every texture here is painted NEAR-GREY and WARM so that the per-
// instance colour does the tinting — one wood map serves grey driftwood and
// oiled dark hardwood alike, one stone map serves sand and orange ashlar. The
// exceptions are the salvage maps (corrugate/panel/rust), which come from the
// Ancients kit and carry their own colour: salvage is not tinted, it is what it is.
//
// Instance colours: hex values below are sRGB as a painter would pick them, and
// vC() converts once to linear at the write — r128 does not convert instance
// colours (lesson from the biome kit), so without this every tint renders pale.
function vC(hex,k){const c=new THREE.Color(hex).convertSRGBToLinear();if(k!==undefined)c.multiplyScalar(k);return c;}

// The old Iziz palette (sands and oranges) and the timber/adobe tones of the set.
const VPAL={
 sand:[0xe9cb8c,0xdcb474,0xcf9d5b,0xe2ab5e,0xf1dba6,0xe6bd7e,0xd4a05a,0xc8a26a],   // plaster, stone tints
 orange:[0xe07a2a,0xc4641e,0xf2a24a,0xd8893c],                                     // the wall colour of Iziz; stone accents, banners
 adobe:[0xc98f5c,0xd6a06a,0xb87d4c,0xe0b07a,0xa9713f],
 woodPoor:[0x9a8c78,0x8a7a66,0xa89a86,0x7c6e5e],                                   // grey, weathered
 woodMid:[0x9a6a42,0x8a5a36,0xa87a4e,0x7a4e30],                                    // sawn, some oil
 woodRich:[0x5a3a24,0x6a4630,0x4a2e1c,0x7a4e34],                                   // dark hardwood
 awning:[0xe07a2a,0xe07a2a,0xf2a24a,0xd8893c,0xc9442a,0xe0a030,0x2f8f8a,0xb8552a,0xe07a2a],   // orange-led (Travis): 5 of 9 draws are Iziz orange, teal is the accent
 trim:[0xe07a2a,0xd8893c,0xc4641e,0xb8552a],                                                   // painted timber trim: fascias, shutters, doors on middle/rich houses
 thatch:[0xb89a5a,0xa88a4e,0xc4a66a,0x9a7e46],
 stone:[0xd8b58a,0xcfa872,0xe0c096,0xc89a62],                                      // rich house ashlar (sandstone)
 stoneDark:[0xb07a48,0xa86e3e,0xc0885a],                                           // string courses / plinths
};
const vPick=a=>a[(rng()*a.length)|0];

// ---------------------------------------------------------------- textures (world units: a 128px tile = 2 m)
TEX.wood=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
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
// the same boards turned upright, for posts, staves and barrels (grain must run along the member)
TEX.woodV=canvasTex(128,128,(g,w,h)=>{g.save();g.translate(w/2,h/2);g.rotate(Math.PI/2);g.drawImage(TEX.wood.image,-w/2,-h/2);g.restore();});
TEX.stone=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // ashlar: 4 m tile, blocks 1.2 x 0.6 m, coursed
 const CH=38,BW=76,MJ=3;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const course=Math.floor(y/CH),off=(course%2)*BW/2,bx=Math.floor((x+off)/BW);
  const fx=(x+off)%BW,fy=y%CH;
  const joint=fx<MJ||fy<MJ;
  let v=196+(h3(bx*1.7,course*2.3,4.4)-.5)*30;                // block-to-block tone
  v+=(fbm(x/18,y/18,2.2,3)-.5)*22;                            // weathering mottle
  v+=(fbm(x/3,y/3,9.1,1)-.5)*10;                              // grit
  if(joint)v=118+(fbm(x/4,y/4,1.1,1)-.5)*20;                  // recessed mortar
  else if(fx<MJ+2||fy<MJ+2)v+=10;                             // lit arris
  const damp=clamp((fbm(x/20,y/120,5.5,2)-.5)*3,0,1)*clamp(fy/CH*1.2,0,1);v-=damp*18;
  d[i]=v;d[i+1]=v*.95;d[i+2]=v*.87;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.plaster=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=208+(fbm(x/30,y/30,3.3,3)-.5)*26+(fbm(x/4,y/4,6.6,1)-.5)*12;   // trowelled render
  const crack=fbm(x/12,y/12,2.1,2);if(Math.abs(crack-.5)<.006)v-=70;    // hairline cracks
  const patch=fbm(x/40,y/40,8.8,2);if(patch>.68)v-=14;                  // repaired patches a shade off
  d[i]=v;d[i+1]=v*.96;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.thatch=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const row=Math.floor(y/43),fy=y%43;                          // ~0.67 m courses of frond
  let v=172+(h3(Math.floor(x/2)*1.3,row,2.2)-.5)*52;           // strand to strand
  v+=(fbm(x/1.6,y/18,3.1,2)-.5)*36;                            // fibres running down
  v+=(fbm(x/20,y/20,7.7,2)-.5)*18;                             // patchy fading
  v-=clamp((fy-30)/13,0,1)*34;                                 // soft shadow under each course
  if(fy<2)v+=10;                                               // the lit edge of the course above
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.7;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.shingle=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // split timber shingles, 0.25 x 0.5 m
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const row=Math.floor(y/16),off=(row%2)*16,sx=Math.floor((x+off)/32),fx=(x+off)%32,fy=y%16;
  let v=170+(h3(sx*2.1,row*1.7,3.3)-.5)*46+(fbm(x/3,y/9,5.2,1)-.5)*16;
  if(fx<2)v-=40;if(fy>13)v-=50;else if(fy<1)v+=14;
  d[i]=v;d[i+1]=v*.92;d[i+2]=v*.8;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.stripes=canvasTex(128,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // awning cloth: 6 stripes, tinted colour alternates with off-white
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const on=Math.floor(x/(w/6))%2;
  const weave=((x%3)<1?-1:0)+((y%3)<1?-1:0);const v=(on?250:120)+weave*8+(fbm(x/20,y/20,4,2)-.5)*16;
  d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.dirt=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // ground: packed red-brown earth with grass, for the showcase
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/60,y/60,.7,3),n2=fbm(x/7,y/7,3.2,2),gr=clamp((fbm(x/40,y/40,5.5,2)-.5)*3,0,1);
  let r=118+(n-.5)*50+(n2-.5)*22,gg=82+(n-.5)*36+(n2-.5)*14,b=58+(n-.5)*26;
  r=lerp(r,70+n2*30,gr);gg=lerp(gg,98+n2*36,gr);b=lerp(b,40,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- world-unit UVs
// Instances share one geometry, so a box's 0..1 UVs would stretch one texture
// tile over a 20 m wall and squash it on a 0.2 m beam. This hook reads the
// instance scale in the vertex shader and picks, per face normal, the two axes
// that face spans, so every map tiles in metres whatever the instance size.
// K = 1 / (metres per texture tile). kbake() carries onBeforeCompile across
// its material clone.
function vWorldUV(mat,K){mat.userData.uvK=K;mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',
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
// A plain mesh keeps the UVs its geometry carries (the kit's lathes and grids are drawn in 8 m tile units, the
// vernacular ones in the material's own tile); only INSTANCES are re-tiled by their scale. Before this the hook
// re-scaled the kit's skyscraper shells by K too, so their panels tiled every 64 m and read as untextured.

// ---------------------------------------------------------------- materials
MAT.wood=new THREE.MeshStandardMaterial({map:TEX.wood,color:0xffffff,roughness:.92,metalness:0,side:DS});
MAT.woodV=new THREE.MeshStandardMaterial({map:TEX.woodV,color:0xffffff,roughness:.92,metalness:0,side:DS});
MAT.void=new THREE.MeshBasicMaterial({color:0x0b0907});   // openings: unlit so a doorway reads as a doorway in any light
MAT.stone=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xffffff,roughness:.96,metalness:0,side:DS});
MAT.plaster=new THREE.MeshStandardMaterial({map:TEX.plaster,color:0xffffff,roughness:.97,metalness:0,side:DS});
MAT.thatch=new THREE.MeshStandardMaterial({map:TEX.thatch,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.shingle=new THREE.MeshStandardMaterial({map:TEX.shingle,color:0xffffff,roughness:.95,metalness:0,side:DS});
MAT.cloth=new THREE.MeshStandardMaterial({map:TEX.stripes,color:0xffffff,roughness:.9,metalness:0,side:DS});
MAT.iron=new THREE.MeshStandardMaterial({color:0x2e2a26,roughness:.62,metalness:.55});
MAT.clay=new THREE.MeshStandardMaterial({color:0x9a5a38,roughness:.9,metalness:0});
MAT.warmPane=new THREE.MeshBasicMaterial({color:0xffcf8a});          // an electrically lit window: rich + civic only
MAT.bulb=new THREE.MeshBasicMaterial({color:0xfff3d6});
MAT.dirt=new THREE.MeshStandardMaterial({map:TEX.dirt,roughness:1});
vWorldUV(MAT.wood,.5);vWorldUV(MAT.woodV,.5);vWorldUV(MAT.stone,.25);vWorldUV(MAT.plaster,.5);vWorldUV(MAT.thatch,.5);vWorldUV(MAT.shingle,.5);vWorldUV(MAT.cloth,.5);
vWorldUV(MAT.corrugate,.5);vWorldUV(MAT.tarp,.5);vWorldUV(MAT.timber,.5);vWorldUV(MAT.white,.125);vWorldUV(MAT.rust,.125);vWorldUV(MAT.verdigris,.25);vWorldUV(MAT.clay,.5);

// ---------------------------------------------------------------- geometry
// Wedge: base 1x1 at y=0, top (tx x tz) at y=1. tz≈0 gives a gable roof with
// its ridge along local x; tx=tz≈0 gives a pyramid; 0.6/0.6 a battered block.
function vnWedgeGeo(tx,tz){const p=[],uv=[],idx=[];const c=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-tx/2,1,-tz/2],[tx/2,1,-tz/2],[tx/2,1,tz/2],[-tx/2,1,tz/2]];
 const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
 faces.forEach(f=>{const b=p.length/3;f.forEach((vi,i)=>{p.push(...c[vi]);uv.push(i===1||i===2?1:0,i>=2?1:0);});idx.push(b,b+1,b+2,b,b+2,b+3);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// A roof SLAB with world-ish UVs so the shingle/thatch courses run across it:
// 1 x 1 x 1 box whose uv is scaled by the caller through the instance? No —
// instances share one geometry, so the texture tiles per unit of scale; the
// maps are drawn at 2 m per tile so a 6 m slab shows 3 courses. Good enough.
const VBOX=new THREE.BoxGeometry(1,1,1);
const VPOST=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0);           // base at y=0
const VPOSTB=new THREE.CylinderGeometry(.85,1,1,8).translate(0,.5,0);        // tapering
const VDOME=new THREE.SphereGeometry(1,20,10,0,TAU,0,Math.PI/2);
const VBALL=new THREE.SphereGeometry(1,10,7);
const VCONE=new THREE.ConeGeometry(1,1,10).translate(0,.5,0);
const VPLANE=new THREE.PlaneGeometry(1,1);
const VGABLE=vnWedgeGeo(1,.02), VPYR=vnWedgeGeo(.04,.04), VBATTER=vnWedgeGeo(.86,.86), VHIP=vnWedgeGeo(.5,.04);

// ---------------------------------------------------------------- kit items
kdef('vWood',VBOX,MAT.wood);kdef('vStone',VBOX,MAT.stone);kdef('vPlaster',VBOX,MAT.plaster);kdef('vCorr',VBOX,MAT.corrugate);
kdef('vIron',VBOX,MAT.iron);kdef('vThatchB',VBOX,MAT.thatch);kdef('vShingleB',VBOX,MAT.shingle);kdef('vCopperB',VBOX,MAT.verdigris);
kdef('vPanelB',VBOX,MAT.white);kdef('vRustB',VBOX,MAT.rust);kdef('vClothB',VBOX,MAT.cloth);kdef('vTarpB',VBOX,MAT.tarp);kdef('vClayB',VBOX,MAT.clay);kdef('vDarkB',VBOX,MAT.void);
kdef('vSheet',VPLANE,MAT.corrugate);kdef('vBoard',VPLANE,MAT.wood);kdef('vPlate',VPLANE,MAT.rust);kdef('vPlateW',VPLANE,MAT.white);kdef('vTarp',VPLANE,MAT.tarp);kdef('vCloth',VPLANE,MAT.cloth);
kdef('vPost',VPOST,MAT.woodV);kdef('vPostB',VPOSTB,MAT.woodV);kdef('vPostS',VPOST,MAT.stone);kdef('vPipe',VPOST,MAT.iron);kdef('vPipeR',VPOST,MAT.rust);kdef('vPipeC',VPOST,MAT.verdigris);kdef('vClayPot',VPOSTB,MAT.clay);kdef('vBarrel',new THREE.CylinderGeometry(1,.9,1,10).translate(0,.5,0),MAT.woodV);kdef('vTank',VPOST,MAT.corrugate);kdef('vTankW',new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0),MAT.white);kdef('vTankR',new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0),MAT.rust);kdef('vStave',new THREE.CylinderGeometry(1,1,1,14).translate(0,.5,0),MAT.woodV);
kdef('vDomeS',VDOME,MAT.stone);kdef('vDomeC',VDOME,MAT.verdigris);kdef('vDomeP',VDOME,MAT.plaster);kdef('vBall',VBALL,MAT.iron);kdef('vGourd',VBALL,MAT.clay);kdef('vSack',VBALL,MAT.tarp);kdef('vLeaf',VBALL,MAT.moss);
kdef('vConeT',VCONE,MAT.thatch);kdef('vConeC',VCONE,MAT.verdigris);kdef('vConeI',VCONE,MAT.iron);
kdef('vGableS',VGABLE,MAT.shingle);kdef('vGableT',VGABLE,MAT.thatch);kdef('vGableC',VGABLE,MAT.corrugate);kdef('vGableCu',VGABLE,MAT.verdigris);kdef('vGableP',VGABLE,MAT.white);kdef('vGableW',VGABLE,MAT.wood);kdef('vGableSt',VGABLE,MAT.stone);kdef('vGablePl',VGABLE,MAT.plaster);
kdef('vPyrS',VPYR,MAT.stone);kdef('vPyrCu',VPYR,MAT.verdigris);kdef('vPyrT',VPYR,MAT.thatch);kdef('vPyrSh',VPYR,MAT.shingle);kdef('vPyrC',VPYR,MAT.corrugate);
kdef('vBatterS',VBATTER,MAT.stone);kdef('vBatterP',VBATTER,MAT.plaster);kdef('vBatterW',VBATTER,MAT.wood);
kdef('vHipS',VHIP,MAT.shingle);kdef('vHipT',VHIP,MAT.thatch);kdef('vHipCu',VHIP,MAT.verdigris);kdef('vHipC',VHIP,MAT.corrugate);
MAT.ember=new THREE.MeshBasicMaterial({color:0xff7a2a});               // forge/kiln fire — not electric, so allowed anywhere
kdef('vEmber',VBALL,MAT.ember);
kdef('vWinLit',VBOX,MAT.warmPane);kdef('vWinGlass',VBOX,MAT.darkGlass);kdef('vBulb',VBALL,MAT.bulb);kdef('vHoop',new THREE.TorusGeometry(1,.06,5,16),MAT.iron);
kdef('vRope',new THREE.CylinderGeometry(1,1,1,5).translate(0,.5,0),MAT.tarp);
kdef('vFlag',VBOX,MAT.stone);   // paving slabs, tinted
kdef('vRock',VBALL,MAT.stone);kdef('vFinial',VBALL,MAT.verdigris);kdef('vBallW',VBALL,MAT.slab);
// ================================================================= IZIZ VERNACULAR — registry + building blocks
// Every vernacular building is a named function build*(G,o) registered with
// VERN.def(). It builds in a LOCAL frame: origin at the plot centre on the
// ground, +z is the front (door side), y up, metres. VERN.place() sets up the
// group transform (position + yaw) and the kit transform (useGroupXF), so a
// builder never sees world coordinates and the same function serves a
// showcase row and a city lot.
//
// o = {w: 0 poor | 1 middle | 2 rich, v: variant index, lit: override}
const VERN={defs:{},order:[],cur:null,
 def(D){if(!D.key||!D.build)throw new Error('VERN.def needs key+build');D.tags=Object.assign({culture:'iziz-vernacular'},D.tags||{});D.cls=D.cls||'building';VERN.defs[D.key]=D;VERN.order.push(D.key);return D;},
 // key, world x/z, yaw, options. Returns the group. Registers nothing itself:
 // the builder calls vnReg() for its inspector volume(s).
 place(scene,key,x,z,ry,o){const D=VERN.defs[key];if(!D){reportErr('VERN.place: no such key '+key);return null;}
  o=Object.assign({w:1,v:0,scale:1,y:0},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
  KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;VERN.cur={D,G,x,z,ry:ry||0,o,r0:REG.length};
  try{D.build(G,o);}catch(e){reportErr(key+' '+e.stack);}
  endGroupXF();VERN.cur=null;return G;},
 wealthName:w=>['poor','middle','rich','civic'][w]||'poor',
};
// Inspector volume in the building's local frame (x,z = centre, r radius, h height). Honours o.scale.
function vnReg(name,lx,lz,r,h,tags){const c=VERN.cur;const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);
 REG.push({name,x:p[0],y:c.o.y||0,z:p[1],r:r*s,h:h*s,cls:c.D.cls,key:c.D.key,tags:Object.assign({},c.D.tags,tags||{})});}
// A builder that wraps an Ancients-kit builder (which calls REGISTER in its own local frame with KOFF) hands the
// REG entries it produced to this, which moves them into the world frame and stamps the project tags on them.
function vnAdoptREG(r0,nameFn,tags){const c=VERN.cur;const s=c.o.scale||1;for(let i=r0;i<REG.length;i++){const r=REG[i];const p=loc(c.x,c.z,r.x*s,r.z*s,c.ry);
 r.x=p[0];r.z=p[1];r.y=(r.y||0)*s+(c.o.y||0);r.r*=s;r.h*=s;r.cls=c.D.cls;r.key=c.D.key;r.tags=Object.assign({},c.D.tags,tags||{});if(nameFn)r.name=nameFn(r.name);}}
// kput with a uniform scale in the group transform (KXF.s): the vendored kit scales positions through the matrix
// but not the per-instance size, so the size is scaled here. Assignment, not redeclaration — build.py's rule.
// Nested group transforms. The vendored kit's useGroupXF/endGroupXF assume one level: several kit builders open a
// body group of their own (bodyGroup, the sky builders), which REPLACED the placer's transform and then nulled it,
// so a skyscraper placed at a plot rebuilt itself at the world origin at full size. Assignment, not redeclaration:
// the same functions, now a stack that composes the child's local matrix onto the parent's.
const _XFSTACK=[];
useGroupXF=function(P){P.updateMatrix();const parent=KXF;_XFSTACK.push(parent);
 if(parent){KXF={m:parent.m.clone().multiply(P.matrix),q:parent.q.clone().multiply(P.quaternion),s:(parent.s||1)*P.scale.x};if(KXF.s===1)delete KXF.s;}
 else{KXF={m:P.matrix.clone(),q:P.quaternion.clone()};if(P.scale.x!==1)KXF.s=P.scale.x;}};
endGroupXF=function(){KXF=_XFSTACK.length?_XFSTACK.pop():null;};
// Run a kit builder as if the ground were flat at the group's origin. Kit builders ask terrainH() for their aprons and
// fallen fragments in THEIR local frame; in a world with real terrain that returned the ground at the world origin
// (the city plateau, 18 m up) and floated every apron that far above the building.
function withFlatGround(fn){const t=terrainH;terrainH=function(){return 0;};try{return fn();}finally{terrainH=t;}}
const _kputBase=kput;
kput=function(name,p,q,s,c){if(KXF&&KXF.s&&KXF.s!==1){s=typeof s==='number'?s*KXF.s:[s[0]*KXF.s,s[1]*KXF.s,s[2]*KXF.s];}return _kputBase(name,p,q,s,c);};
// local (lx,lz) rotated by ry about Y, then translated — same convention as THREE's rotation.y
function loc(x,z,lx,lz,ry){return[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];}
// yaw, then a tilt about the piece's own x, then a roll about its own z
function vQ(ry,tx,rz){const q=qEuler(0,ry||0,0);if(tx)q.multiply(qEuler(tx,0,0));if(rz)q.multiply(qEuler(0,0,rz));return q;}
const vLit=()=>{const c=VERN.cur;return !!(c&&(c.o.lit!==undefined?c.o.lit:c.D.tags.lit));};   // the lighting rule: a def is tagged lit:true only if rich or civic

// ---------------------------------------------------------------- primitives (local frame; y = BASE of the piece)
function vB(item,x,y,z,w,h,d,ry,c){kput(item,[x,y+h/2,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);}          // box standing on y
function vBq(item,x,y,z,w,h,d,q,c){kput(item,[x,y,z],q||null,[w,h,d],c||null);}                                // box centred at y, any quaternion
function vPst(item,x,y,z,r,h,c,q){kput(item,[x,y,z],q||null,[r,h,r],c||null);}                                 // post/cylinder, base at y
function vPl(item,x,y,z,w,h,ry,c,tilt){kput(item,[x,y,z],vQ(ry,tilt||0,0),[w,h,1],c||null);}                   // plane centred at y, facing local +z
function vBall(item,x,y,z,r,c,sy){kput(item,[x,y,z],null,[r,sy||r,r],c||null);}
// a beam from a to b (local), timber unless another item is named
function vBeam(a,b,w,c,item){beam(item||'vWood',a,b,w,w,c||null);}

// ---------------------------------------------------------------- walls, frames, plinths
// Timber frame: corner posts, intermediate posts every ~2.4 m, sill and head rails on all four faces.
function vnFrame(x,y,z,w,h,d,ry,c,pr){pr=pr||.14;const nx=Math.max(1,Math.round(w/2.4)),nz=Math.max(1,Math.round(d/2.4));
 for(let i=0;i<=nx;i++){const lx=-w/2+w*i/nx;for(const s of[-1,1]){const p=loc(x,z,lx,s*d/2,ry);vPst('vPost',p[0],y,p[1],pr,h,c);}}
 for(let j=1;j<nz;j++){const lz=-d/2+d*j/nz;for(const s of[-1,1]){const p=loc(x,z,s*w/2,lz,ry);vPst('vPost',p[0],y,p[1],pr,h,c);}}
 for(const yy of[y+.12,y+h-.12]){   // sill and head rails on all four faces
  for(const s of[-1,1]){const p=loc(x,z,0,s*d/2,ry);vB('vWood',p[0],yy-.1,p[1],w+pr*2,.2,pr*2.2,ry,c);const q=loc(x,z,s*w/2,0,ry);vB('vWood',q[0],yy-.1,q[1],pr*2.2,.2,d+pr*2,ry,c);}}}
// Stilts under a raised floor: posts at the corners and along the long sides, with a diagonal brace on each face.
function vnStilts(x,y,z,w,d,h,ry,c,pr){pr=pr||.18;const nx=Math.max(1,Math.round(w/2.6)),nz=Math.max(1,Math.round(d/2.6));const pts=[];
 for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){if(i>0&&i<nx&&j>0&&j<nz&&rng()<.5)continue;const p=loc(x,z,-w/2+w*i/nx,-d/2+d*j/nz,ry);vPst('vPostB',p[0],y-.3,p[1],pr,h+.3,c);pts.push(p);}
 for(const s of[-1,1]){const a=loc(x,z,-w/2,s*d/2,ry),b=loc(x,z,w/2*.6,s*d/2,ry);vBeam([a[0],y+.2,a[1]],[b[0],y+h-.2,b[1]],.1,c);}
 // pad stones under the posts
 for(const p of pts)vB('vStone',p[0],y-.35,p[1],pr*3.2,.35,pr*3.2,ry,vC(0x9a8a78));}
// Battered stone/plaster plinth the wealthy build on (item vBatterS / vBatterP).
function vnPlinth(item,x,y,z,w,h,d,ry,c){kput(item,[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);vB(item==='vBatterS'?'vStone':'vPlaster',x,y+h-.05,z,w*.86+.3,.28,d*.86+.3,ry,c);}
// Mayan stepped cornice in the set's materials: `steps` overhanging bands, each further out, then a cap band set back.
function vnCornice(item,x,y,z,w,d,ry,c,steps,cap){steps=steps||2;let yy=y;for(let k=0;k<steps;k++){const o=.18+.22*k;vB(item,x,yy,z,w+2*o,.32,d+2*o,ry,c);yy+=.32;}
 if(cap!==false)vB(item,x,yy,z,w+.1,.26,d+.1,ry,c&&c.clone().multiplyScalar(1.08));return yy+.26;}
// deco vertical strip: a tall narrow recess with horizontal fins, the old Iziz motif carried into stone or timber
function vnStrip(x,y,z,ry,w,h,frameItem,c){const f=loc(x,z,0,.06,ry);vB('vDarkB',f[0],y,f[1],w,h,.12,ry);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.08),.1,ry);vB(frameItem,p[0],y-.1,p[1],.16,h+.2,.22,ry,c);}
 const n=Math.max(2,Math.round(h/.9));for(let k=1;k<n;k++){const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h*k/n-.05,p[1],w+.1,.1,.26,ry,c);}}
// Salvage patchwork over a face: n mismatched sheets, proud of the wall and a few degrees off square.
function vnPatch(x,y,z,ry,w,h,n){const ITEMS=['vSheet','vSheet','vPlate','vPlateW','vBoard'];
 for(let i=0;i<n;i++){const lx=rr(-w/2+.8,w/2-.8),ly=y+rr(.6,h-.6),pw=rr(1.2,2.8),ph=rr(.9,2.2);const p=loc(x,z,lx,.09+i*.012,ry);
  kput(vPick(ITEMS),[p[0],ly,p[1]],vQ(ry,0,rr(-.09,.09)),[pw,ph,1],null);}}

// ---------------------------------------------------------------- roofs (ridge along local x unless noted)
// Gable: a wall-material wedge closes the gable ends flush with the walls; two roof slabs sit on it and overhang.
function vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick){over=over===undefined?.9:over;thick=thick||.24;
 if(endItem)kput(endItem,[x,y,z],ry?qEuler(0,ry,0):null,[w,rise,d],endC||null);
 const a=Math.atan2(rise,d/2),ext=d/2+over,S=Math.hypot(ext,rise*ext/(d/2))+.15;
 for(const s of[-1,1]){const zc=s*ext/2,yc=y+(rise-over*rise/(d/2))/2;const p=loc(x,z,0,zc,ry);
  const q=vQ(ry,s*a,0);const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*.5);
  kput(slabItem,[p[0]+n.x,yc+n.y,p[1]+n.z],q,[w+2*over,thick,S],slabC||null);}
 vB('vWood',x,y+rise+thick*.35,z,w+2*over+.1,.22,.5,ry,slabC?slabC.clone().multiplyScalar(.8):vC(0x6a4a30));     // ridge cap
 for(const s of[-1,1]){const p=loc(x,z,0,s*(ext+.02),ry);vB('vWood',p[0],y-over*rise/(d/2)-.32+thick*.2,p[1],w+2*over,.28,.12,ry,vC(0x6a4a30));}}   // fascia
// Shed: one slab, high at the back (-z), low at the front (+z).
function vnShedRoof(x,y,z,w,d,rise,ry,item,c,over,thick){over=over===undefined?.7:over;thick=thick||.2;const a=Math.atan2(rise,d);const ext=d+2*over,S=ext/Math.cos(a);
 const p=loc(x,z,0,0,ry);const q=vQ(ry,a,0);const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*.5);
 kput(item,[p[0]+n.x,y+rise/2+n.y,p[1]+n.z],q,[w+2*over,thick,S],c||null);}
// Solid hipped / pyramidal roofs (the wedge items). `over` widens the base; the base drops a little so the wall top is buried.
function vnHipRoof(item,x,y,z,w,d,rise,ry,c,over){over=over===undefined?.8:over;kput(item,[x,y-.35,z],ry?qEuler(0,ry,0):null,[w+2*over,rise+.35,d+2*over],c||null);
 vB('vWood',x,y-.62,z,w+2*over+.06,.28,d+2*over+.06,ry,c?c.clone().multiplyScalar(.75):vC(0x5a3e2a));}   // eaves board
function vnPyrRoof(item,x,y,z,w,d,rise,ry,c,over){vnHipRoof(item,x,y,z,w,d,rise,ry,c,over);}
// A thatch cone on a round building; ragged eave by a second slightly larger, shorter cone.
function vnThatchCone(x,y,z,r,rise,c){kput('vConeT',[x,y-.3,z],null,[r*1.18,rise+.3,r*1.18],c||null);kput('vConeT',[x,y-.55,z],null,[r*1.28,.9,r*1.28],c?c.clone().multiplyScalar(.85):null);}

// ---------------------------------------------------------------- openings
// Window on a wall face. (x,z) is the point ON the face, ry the outward direction of the face.
// kind: 'lit' (electric, rich/civic only), 'glass' (dark glazing), 'open' (unglazed dark), 'shut' (boarded)
function vnWin(x,y,z,ry,w,h,kind,frameItem,c,shutters){const f=loc(x,z,0,.05,ry);
 if(kind==='lit')vB('vWinLit',f[0],y,f[1],w,h,.1,ry);else if(kind==='glass')vB('vWinGlass',f[0],y,f[1],w,h,.1,ry);else vB('vDarkB',f[0],y,f[1],w,h,.1,ry);
 if(kind==='shut'){const p=loc(x,z,0,.12,ry);for(let k=0;k<Math.round(h/.3);k++)vB('vWood',p[0],y+k*.3,p[1],w+.1,.26,.08,ry,c);}
 frameItem=frameItem||'vWood';const p=loc(x,z,0,.14,ry);
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.14,ry);vB(frameItem,q[0],y-.08,q[1],.14,h+.16,.16,ry,c);}
 vB(frameItem,p[0],y+h,p[1],w+.3,.14,.18,ry,c);vB(frameItem,p[0],y-.12,p[1],w+.34,.12,.28,ry,c);   // head, sill
 if(kind==='glass'||kind==='lit'){vB(frameItem,p[0],y,p[1],.06,h,.1,ry,c);vB(frameItem,p[0],y+h*.5,p[1],w,.06,.1,ry,c);}   // glazing bars
 if(shutters){for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.15+w*.22),.2,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry,0,0).multiply(qEuler(0,-s*.55,0)),[w*.48,h,.05],c||null);}}}
// Door: dark recess, board leaf, jambs + lintel, a threshold step. Optional electric lamp above (lit rule applies).
function vnDoor(x,y,z,ry,w,h,frameItem,c,leafC,step){frameItem=frameItem||'vWood';const f=loc(x,z,0,.03,ry);vB('vDarkB',f[0],y,f[1],w,h,.1,ry);
 const l=loc(x,z,-w*.06,.1,ry);kput('vWood',[l[0],y+h/2,l[1]],vQ(ry,0,0).multiply(qEuler(0,.22,0)),[w*.92,h-.05,.06],leafC||c||null);   // leaf, slightly ajar
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.09),.12,ry);vB(frameItem,q[0],y,q[1],.18,h+.18,.2,ry,c);}
 const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h+.06,p[1],w+.5,.2,.26,ry,c);
 if(step!==false){const s=loc(x,z,0,.5,ry);vB(frameItem==='vStone'?'vStone':'vWood',s[0],y-.18,s[1],w+.6,.18,.8,ry,c);}
 if(vLit()){vnLamp(x,y+h+.5,z,ry);}
 // pathing layer: every door is an agent target. World frame, recorded for the city's Paths overlay / life layer.
 if(window.DOORS&&VERN.cur){const c=VERN.cur,sc=c.o.scale||1;const wp=loc(c.x,c.z,x*sc,z*sc,c.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+c.ry,y:(c.o.y||0)+y*sc,key:c.D.key});}}
// Electric lamp: an iron bracket out of the wall and a bulb under a small hood. Only ever placed through vLit().
function vnLamp(x,y,z,ry){const a=loc(x,z,0,.05,ry),b=loc(x,z,0,.55,ry);vBeam([a[0],y,a[1]],[b[0],y+.02,b[1]],.05,vC(0x2e2a26),'vIron');
 vB('vIron',b[0],y-.02,b[1],.32,.06,.32,ry,vC(0x2e2a26));vBall('vBulb',b[0],y-.16,b[1],.11);}
// A lamp on a post (yards, drill grounds, gates) — electric.
function vnLampPost(x,y,z,h){vPst('vPipe',x,y,z,.07,h,vC(0x2e2a26));vB('vIron',x,y+h,z,.5,.08,.5,0,vC(0x2e2a26));vBall('vBulb',x,y+h-.16,z,.13);}

// ---------------------------------------------------------------- porches, stairs, yards
// Veranda deck on posts along the front; rail with balusters; posts carry up to `postH` for the roof above.
function vnVeranda(x,y,z,w,d,ry,deckH,postH,c,railC){const zc=d/2;vB('vWood',x,y+deckH-.22,z,w,.22,d,ry,c);
 const n=Math.max(2,Math.round(w/2.6));for(let i=0;i<=n;i++){const p=loc(x,z,-w/2+w*i/n,zc-.15,ry);vPst('vPost',p[0],y,p[1],.12,postH,c);
  if(i<n&&deckH>.3){const q=loc(x,z,-w/2+w*(i+.5)/n,zc-.15,ry);vB('vWood',q[0],y+deckH+.85,q[1],w/n-.28,.1,.1,ry,railC||c);   // rail
   for(let k=1;k<4;k++){const b=loc(x,z,-w/2+w*(i+k/4)/n,zc-.15,ry);vB('vWood',b[0],y+deckH,b[1],.06,.85,.06,ry,railC||c);}}}
 if(deckH>.3)for(let k=0;k<Math.round(w/2.6);k++){const p=loc(x,z,-w/2+.2,-d/2+d*(k+.5)/Math.round(w/2.6),ry);vPst('vPostB',p[0],y-.2,p[1],.13,deckH,c);}}
// Straight stair up to a deck: treads and two stringers. Rises `rise` over `steps` treads toward -z (into the building).
function vnStairs(x,y,z,ry,w,rise,steps,item,c){const run=steps*.32;for(let k=0;k<steps;k++){const t=(k+.5)/steps;const p=loc(x,z,0,run/2-run*t,ry);vB(item||'vWood',p[0],y+rise*k/steps,p[1],w,.08,.34,ry,c);}
 for(const s of[-1,1]){const a=loc(x,z,s*w/2,run/2,ry),b=loc(x,z,s*w/2,-run/2,ry);vBeam([a[0],y-.05,a[1]],[b[0],y+rise-.1,b[1]],.12,c);}}
function vnLadder(x,y,z,ry,h,c){const lean=.25;for(const s of[-1,1]){const p=loc(x,z,s*.3,0,ry);kput('vWood',[p[0],y+h/2,p[1]],vQ(ry,lean,0),[.08,h,.08],c||null);}
 for(let k=1;k<h/.36;k++){const t=k*.36;const p=loc(x,z,0,-Math.sin(lean)*(t-h/2),ry);vB('vWood',p[0],y+t*Math.cos(lean)-.03,p[1],.7,.06,.06,ry,c);}}
function vnBarrel(x,y,z,r,h,c){vPst('vBarrel',x,y,z,r,h,c);vBq('vHoop',x,y+h*.25,z,r*1.02,r*1.02,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));vBq('vHoop',x,y+h*.78,z,r*1.02,r*1.02,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));}
function vnWaterButt(x,y,z,r,h){vPst('vTank',x,y,z,r,h,null);vB('vIron',x,y+h,z,r*1.9,.08,r*1.9,0,vC(0x2e2a26));}
function vnCrate(x,y,z,s,ry,c){vB('vWood',x,y,z,s,s*.8,s*.9,ry,c||vC(vPick(VPAL.woodMid)));}
function vnSacks(x,y,z,n){for(let i=0;i<n;i++)kput('vSack',[x+rr(-.6,.6),y+.32+((i>2)?.45:0),z+rr(-.5,.5)],qEuler(0,rng()*TAU,0),[.42,.32,.36],vC(vPick([0xb8a080,0xa89070,0xc8b898])));}
function vnPlanter(x,y,z,w,d,ry,c){vB('vWood',x,y,z,w,.55,d,ry,c);for(let k=0;k<Math.max(1,Math.round(w*d/1.2));k++)kput('vLeaf',[x+rr(-w*.35,w*.35),y+.62,z+rr(-d*.3,d*.3)],null,[rr(.28,.5),rr(.22,.42),rr(.28,.5)],vC(vPick([0x3f7a34,0x4f9a3a,0x2f6a2a,0x6aa04a])));}
function vnDryingRack(x,y,z,ry,L){for(const s of[-1,1]){const p=loc(x,z,s*L/2,0,ry);vPst('vPost',p[0],y,p[1],.06,2.2,vC(0x8a7a66));}
 const a=loc(x,z,-L/2,0,ry),b=loc(x,z,L/2,0,ry);vBeam([a[0],y+2.1,a[1]],[b[0],y+2.1,b[1]],.03,vC(0xb8a888),'vRope');
 for(let k=0;k<Math.round(L/.9);k++){const p=loc(x,z,-L/2+.5+k*.9,0,ry);kput('vCloth',[p[0],y+1.55,p[1]],vQ(ry,0,0),[.6,1.05,1],vC(vPick(VPAL.awning)));}}
// Striped awning on two poles, sloping down and out from the wall at (x,z,ry-face).
function vnAwning(x,y,z,ry,w,out,c){const q=vQ(ry,.42,0);const p=loc(x,z,0,out/2,ry);const n=new THREE.Vector3(0,1,0).applyQuaternion(q);
 kput('vClothB',[p[0]+n.x*.03,y-Math.tan(.42)*out/2+.35,p[1]+n.z*.03],q,[w,.06,out/Math.cos(.42)],c||vC(vPick(VPAL.awning)));
 for(const s of[-1,1]){const pp=loc(x,z,s*(w/2-.1),out-.1,ry);vPst('vPost',pp[0],y-3,pp[1],.05,y-Math.tan(.42)*out+.3-(y-3),vC(0x6a5a48));}}
function vnBannerPole(x,y,z,ry,h,c){vPst('vPost',x,y,z,.08,h,vC(0x5a4632));const p=loc(x,z,.55,0,ry);vB('vWood',p[0],y+h-.2,p[1],1.1,.08,.08,ry,vC(0x5a4632));
 kput('vCloth',[p[0],y+h-1.6,p[1]],vQ(ry+Math.PI/2,0,0),[.7,2.7,1],c||vC(vPick(VPAL.orange)));}
function vnChimney(x,y,z,h,r,rusty){vPst(rusty?'vPipeR':'vPipe',x,y,z,r,h,null);vB('vIron',x,y+h+.1,z,r*3,.08,r*3,0,vC(0x2e2a26));for(const s of[-1,1])vB('vIron',x+s*r*1.1,y+h-.05,z,.06,.2,.06,0,vC(0x2e2a26));}
// Fence of posts and two rails around a rectangle (gap at the front centre of width `gate`).
function vnFence(x,y,z,w,d,ry,c,gate,h){h=h||1.3;const segs=[[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]];
 if(gate){segs.push([[-w/2,d/2],[-gate/2,d/2]],[[gate/2,d/2],[w/2,d/2]]);}else segs.push([[w/2,d/2],[-w/2,d/2]]);
 for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.max(1,Math.round(L/2.2));
  for(let i=0;i<=n;i++){const p=loc(x,z,s[0][0]+(s[1][0]-s[0][0])*i/n,s[0][1]+(s[1][1]-s[0][1])*i/n,ry);vPst('vPost',p[0],y,p[1],.07,h,c);}
  const a=loc(x,z,s[0][0],s[0][1],ry),b=loc(x,z,s[1][0],s[1][1],ry);for(const yy of[.5,1.1])vBeam([a[0],y+yy*h/1.3,a[1]],[b[0],y+yy*h/1.3,b[1]],.07,c);}}
// Palisade: close-set sharpened logs on a low earth bank, with a walkway rail behind.
function vnPalisade(x,y,z,w,d,ry,h,gate){const c=vC(0x7a5a3e);const segs=[[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]],[[-w/2,d/2],[-gate/2,d/2]],[[gate/2,d/2],[w/2,d/2]]];
 for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.round(L/.42);
  for(let i=0;i<=n;i++){const p=loc(x,z,s[0][0]+(s[1][0]-s[0][0])*i/n,s[0][1]+(s[1][1]-s[0][1])*i/n,ry);vPst('vPostB',p[0],y-.2,p[1],.2,h+rr(-.25,.25),c.clone().multiplyScalar(rr(.85,1.1)));kput('vConeI',[p[0],y+h-.15,p[1]],null,[.2,.5,.2],c);}
  const a=loc(x,z,s[0][0],s[0][1],ry),b=loc(x,z,s[1][0],s[1][1],ry);vBeam([a[0],y+h*.55,a[1]],[b[0],y+h*.55,b[1]],.14,c);}}
// A few townsfolk for scale (the kit's own figure items), tinted like Iziz robes.
function vnFolk(x,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,0,pz],qEuler(0,rng()*TAU,0),1,vC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0x8a6a3a])));kput('figH',[px,0,pz],null,1,vC(0xc9a17e));}}
// paved yard / threshold slabs
function vnPaving(x,y,z,w,d,ry,c,n){n=n||Math.round(w*d/4);for(let i=0;i<n;i++){const p=loc(x,z,rr(-w/2,w/2),rr(-d/2,d/2),ry);vB('vFlag',p[0],y-.06,p[1],rr(1.1,2.2),.1,rr(.9,1.8),ry+rr(-.1,.1),c||vC(vPick(VPAL.stoneDark)));}}
// ================================================================= DALAB — materials + kit items (prefix d / D)
// What the people of Dalab build: Cahokian monumentality in rammed earth, wood, stone and scrap. Circular plans,
// thatch and shingle cones, earth mounds turfed green, and — for the priest-caste and the wealthy — megalithic
// grey stone with carved relief bands and painted murals in a Tiwanaku / Mesoamerican / Amerindian-deco idiom.
// The only saturated colours are the mural paints (red ochre, turquoise, gold, black on cream) and The God's
// light, which is COLD: a teal-white, unlike Iziz's warm bulbs — an Ancient light, kept alive by the priests.
//
// Everything textured is painted near-grey and tinted per instance with vC() (69b), except the mural, the
// mosaic and the tile, which are colour textures and are placed untinted (white).
const DPAL={
 earth:[0xb5824f,0xa8763f,0xc4915c,0x9c6d3a,0xb98a5a,0xa07a48],         // rammed earth lifts, sun-dried
 earthDark:[0x8a5e34,0x7a5230,0x92663c],                                // wet foot of a wall, plinths
 stone:[0x8a8478,0x9a948a,0x7c766c,0xa29c92,0x8e8880],                  // andesite grey — the priests' stone
 stoneWarm:[0xa89a80,0xb8a888,0x9a8c72],                                // a sandstone band, steles
 wood:[0x8a6a44,0x7a5a38,0x9a7a50,0x6a4e30],                            // oak, oiled
 woodGrey:[0x9a8c78,0x8a7a66,0xa89a86,0x7c6e5e],                        // weathered
 thatch:[0xb0985a,0xa08a4e,0xc0a868,0x9a8248],
 shingle:[0x7a6448,0x6a563e,0x8a7454,0x5e4a36],
 red:[0xa8382a,0xb8442e,0x9a3020],                                      // red ochre paint
 turq:[0x2f9a8a,0x3aa896,0x2a8a7a],                                     // turquoise paint, copper-green
 gold:[0xd8a838,0xc89a30,0xe0b848],
 skin:[0x6a9a4a,0x5a8a42,0x7aa852,0x4f7f3c,0x86b060],                   // photosynthetic green, every citizen
 robe:[0xe8dcc0,0xa8382a,0x2f9a8a,0xd8a838,0x3b3b4a,0xf0e8d8,0x8a6a3a],
 priest:[0xf0e8d8,0x2f9a8a,0xd8a838],                                   // white, turquoise, gold: the caste
 turf:[0x5f8a3a,0x6a9a44,0x557f36,0x6f9a48],
 god:0x9af0e0,                                                          // The God's light
 // THE SACRED DECO (round 4, from the reference sheet): terracotta-red walls, cream trim, turquoise-inlaid fret,
 // gold finials — the Amerindian-deco of the temples, priests' houses, the palace and the compound chapels
 sacred:[0x9c4e3c,0xa85a44,0x8e4636,0xa2523e],
 cream:[0xe8dcc0,0xf0e6cc],
 trim:[0xdcbc8e,0xe4c69a,0xd4b284],
 tq:0x3f9a88,
 laterite:[0x8a4a2a,0x9a5630,0x7a4224],                                 // the Historians' Djenne earth
 vothStone:[0x7a7068,0x8a8078,0x6a625a],                                // Voth's cooler ashlar
};
const dPick=a=>a[(rng()*a.length)|0];
const dCol=(arr,k)=>vC(dPick(arr),k);

// ---------------------------------------------------------------- textures
// Rammed earth (Chan Chan / pisé): horizontal lifts ~0.35 m with a shadow line at each joint, form-board marks,
// grit, and a damp darkening toward the foot. 128 px = 2 m.
TEX.dRammed=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const lift=Math.floor(y/22),fy=y%22;
  let v=186+(h3(lift*1.7,0,3.1)-.5)*30;                       // lift to lift
  v+=(fbm(x/26,y/7,4.1,3)-.5)*26;                              // the tamping, streaky along the lift
  v+=(fbm(x/3,y/3,7.2,1)-.5)*12;                               // grit
  if(fy<1)v-=58;else if(fy<2)v-=22;else if(fy>20)v+=8;         // joint shadow, lit lip of the lift above
  if(((x+lift*53)%128)<1&&fy>2)v-=18;                          // form-board ends
  const pit=fbm(x/5,y/5,lift*.9,2);if(pit>.74)v-=(pit-.74)*140; // pock marks
  d[i]=v;d[i+1]=v*.94;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Carved relief: a stepped-fret meander (the Andean chakana / Mesoamerican xicalcoliuhqui key) cut into stone,
// raised faces lit from above, recesses in shadow. Grey, tinted. 256 px = 4 m; one motif cell = 1 m.
TEX.dRelief=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const CELL=64;
 // height field: nested stepped diamonds in each cell, alternating raised / recessed; a border groove round the cell
 const hf=(x,y)=>{const cx=x%CELL,cy=y%CELL;const bx=Math.floor(x/CELL),by=Math.floor(y/CELL);
  const u=Math.abs(cx-CELL/2),v=Math.abs(cy-CELL/2);const q=8;const su=Math.floor(u/q),sv=Math.floor(v/q);
  const ring=Math.max(su,sv);                                   // stepped square rings
  const spiral=((bx+by)%2)?((ring+ (su>sv?1:0))%2):(ring%2);    // alternate cells break the symmetry
  let z=spiral?1:0;
  if(cx<3||cy<3||cx>CELL-4||cy>CELL-4)z=0;                      // groove between cells
  if(ring===0)z=1;
  return z;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const z=hf(x,y);
  const up=hf(x,(y-2+h)%h),lf=hf((x-2+w)%w,y),dn=hf(x,(y+2)%h);
  let v=z?188:132;v+=(fbm(x/9,y/9,5.5,2)-.5)*18+(fbm(x/2.5,y/2.5,8.1,1)-.5)*8;
  if(z&&!up)v+=34;if(z&&!lf)v+=12;if(!z&&up)v-=30;if(!z&&dn)v+=6;     // lit top arris, shadow under a ledge
  d[i]=v;d[i+1]=v*.96;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Murals: COLOUR friezes, 2 x 2 m tiles, four variants (dMuralTex(v)). Stepped-fret borders top and bottom; between them
//   0  an avatar of The God (rayed head, one great eye, staffs) and a hero in profile (spear, shield)
//   1  a procession of three heroes with spears and banners, walking left
//   2  two avatars flanking the eye-in-the-sun, rays to the border — His watchful benevolence
//   3  the beasts of the fields: two lizards under a fret sky, a sheaf of maize between them — the peasant mural
// Red ochre, turquoise, gold, black on a cream lime wash; the paint worn at the foot.
function dMuralTex(v){return canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#e6d8b8';g.fillRect(0,0,w,h);
 const RED='#a8382a',TQ='#2f9a8a',GOLD='#d8a838',BLK='#2a2420',CREAM='#efe6cc';
 const fret=(y0,hh,col)=>{g.fillStyle=col;const s=hh/4;for(let x=0;x<w;x+=s*6){
  g.fillRect(x,y0,s*5,s);g.fillRect(x,y0+hh-s,s*5,s);g.fillRect(x,y0,s,hh);g.fillRect(x+s*2,y0+s,s*3,s);g.fillRect(x+s*4,y0+s,s,hh-s*2);g.fillRect(x+s*2,y0+s,s,hh-s*2-s);}};
 g.fillStyle=RED;g.fillRect(0,0,w,10);g.fillRect(0,h-10,w,10);fret(12,28,BLK);fret(h-40,28,BLK);
 g.fillStyle=TQ;g.fillRect(0,42,w,3);g.fillRect(0,h-45,w,3);
 const god=(cx,cy,s)=>{
  for(let k=0;k<9;k++){const a=Math.PI*(k/8);const rx=cx+Math.cos(a)*s*.95,ry=cy-s*.55-Math.sin(a)*s*.9;g.fillStyle=k%2?RED:GOLD;g.fillRect(rx-s*.06,ry-s*.14,s*.12,s*.28);}
  g.fillStyle=RED;g.fillRect(cx-s*.5,cy-s*.95,s,s*.8);
  g.fillStyle=BLK;g.fillRect(cx-s*.5,cy-s*.95,s,s*.08);g.fillRect(cx-s*.5,cy-s*.15,s,s*.05);
  g.fillStyle=CREAM;g.beginPath();g.arc(cx,cy-s*.55,s*.26,0,TAU);g.fill();g.fillStyle=BLK;g.beginPath();g.arc(cx,cy-s*.55,s*.12,0,TAU);g.fill();
  g.fillStyle=TQ;g.fillRect(cx-s*.42,cy-s*.15,s*.84,s*.9);g.fillStyle=GOLD;for(let k=0;k<3;k++)g.fillRect(cx-s*.34,cy+s*(.05+k*.25),s*.68,s*.08);
  g.fillStyle=BLK;g.fillRect(cx-s*.72,cy-s*.7,s*.08,s*1.5);g.fillRect(cx+s*.64,cy-s*.7,s*.08,s*1.5);
  g.fillStyle=RED;g.fillRect(cx-s*.78,cy-s*.78,s*.2,s*.14);g.fillRect(cx+s*.58,cy-s*.78,s*.2,s*.14);
  g.fillStyle=BLK;g.fillRect(cx-s*.36,cy+s*.75,s*.26,s*.22);g.fillRect(cx+s*.1,cy+s*.75,s*.26,s*.22);};
 const hero=(cx,cy,s,flip,banner)=>{const f=flip?-1:1;
  g.fillStyle=BLK;g.fillRect(cx-s*.28,cy-s*.7,s*.56,s*.5);
  g.fillStyle=RED;g.fillRect(cx-s*.28,cy-s*.86,s*.56,s*.16);g.fillRect(cx+f*s*.2,cy-s*.55,f*s*.22,s*.16);
  g.fillStyle=GOLD;g.fillRect(cx-s*.36,cy-s*.2,s*.72,s*.8);g.fillStyle=TQ;g.fillRect(cx-s*.36,cy+s*.2,s*.72,s*.14);
  g.fillStyle=BLK;g.fillRect(cx+f*s*.5,cy-s*1.0,s*.07,s*1.9);
  if(banner){g.fillStyle=banner;g.fillRect(cx+f*s*.5+(f>0?s*.07:-s*.5),cy-s*1.0,s*.5,s*.36);}
  else{g.fillStyle=RED;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.3,0,TAU);g.fill();g.fillStyle=CREAM;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.12,0,TAU);g.fill();}
  g.fillStyle=BLK;g.fillRect(cx-s*.3,cy+s*.6,s*.22,s*.34);g.fillRect(cx+s*.08,cy+s*.6,s*.22,s*.34);};
 const sun=(cx,cy,r)=>{for(let k=0;k<16;k++){const a=k/16*TAU;g.fillStyle=k%2?RED:GOLD;g.beginPath();g.moveTo(cx+Math.cos(a-.08)*r*1.05,cy+Math.sin(a-.08)*r*1.05);g.lineTo(cx+Math.cos(a)*r*1.8,cy+Math.sin(a)*r*1.8);g.lineTo(cx+Math.cos(a+.08)*r*1.05,cy+Math.sin(a+.08)*r*1.05);g.fill();}
  g.fillStyle=GOLD;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.fillStyle=CREAM;g.beginPath();g.ellipse(cx,cy,r*.62,r*.36,0,0,TAU);g.fill();g.fillStyle=BLK;g.beginPath();g.arc(cx,cy,r*.26,0,TAU);g.fill();};
 const liz=(cx,cy,s,f)=>{g.fillStyle=TQ;g.beginPath();g.ellipse(cx,cy,s*.9,s*.32,0,0,TAU);g.fill();   // body
  g.beginPath();g.moveTo(cx-f*s*.85,cy-s*.12);g.lineTo(cx-f*s*2.0,cy+s*.05);g.lineTo(cx-f*s*.85,cy+s*.2);g.fill();   // tail
  g.fillStyle=GOLD;for(let k=0;k<5;k++)g.fillRect(cx-s*.6+k*s*.3,cy-s*.16,s*.12,s*.32);                             // stripes
  g.fillStyle=TQ;g.fillRect(cx+f*s*.8,cy-s*.28,f*s*.55,s*.36);g.fillStyle=BLK;g.fillRect(cx+f*s*1.15,cy-s*.2,f*s*.1,s*.1);   // head, eye
  g.fillStyle=BLK;for(const lx of[-.45,.45]){g.fillRect(cx+lx*s-s*.06,cy+s*.2,s*.12,s*.5);g.fillRect(cx+lx*s-s*.18,cy+s*.62,s*.36,s*.08);}};
 if(v===0){god(64,132,34);hero(192,138,30,false);}
 else if(v===1){hero(48,138,28,true,GOLD);hero(128,138,28,true,TQ);hero(208,138,28,true,RED);}
 else if(v===2){god(40,136,26);sun(128,124,26);god(216,136,26);}
 else{liz(64,130,24,1);liz(196,130,24,-1);g.fillStyle=GOLD;for(let k=0;k<5;k++)g.fillRect(122+k*3,96+Math.abs(k-2)*8,3,60);g.fillStyle=TQ;g.fillRect(118,150,22,8);}
 const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wear=clamp((fbm(x/40,y/40,6.6+v,3)-.42)*2.2,0,1)*.45+clamp((y/h-.7)*1.6,0,1)*.5*fbm(x/9,y/9,2.2,2);
  for(let c=0;c<3;c++)d[i+c]=d[i+c]+(214-d[i+c])*wear*.8;const gr=(fbm(x/5,y/5,1.7,1)-.5)*14;d[i]+=gr;d[i+1]+=gr;d[i+2]+=gr;}
 g.putImageData(id,0,0);});}
TEX.dMural=dMuralTex(0);TEX.dMural1=dMuralTex(1);TEX.dMural2=dMuralTex(2);TEX.dMural3=dMuralTex(3);
// The same stepped-fret height field, in COLOUR: cream faces over turquoise recesses (the inlay of the deco temples).
TEX.dReliefTq=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const CELL=64;
 const hf=(x,y)=>{const cx=x%CELL,cy=y%CELL;const bx=Math.floor(x/CELL),by=Math.floor(y/CELL);
  const u=Math.abs(cx-CELL/2),v=Math.abs(cy-CELL/2);const q=8;const su=Math.floor(u/q),sv=Math.floor(v/q);const ring=Math.max(su,sv);
  const spiral=((bx+by)%2)?((ring+(su>sv?1:0))%2):(ring%2);let z=spiral?1:0;if(cx<3||cy<3||cx>CELL-4||cy>CELL-4)z=0;if(ring===0)z=1;return z;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const z=hf(x,y);const up=hf(x,(y-2+h)%h);
  let r,gg,b;if(z){r=226;gg=196;b=150;if(!up){r+=22;gg+=20;b+=16;}}else{r=56;gg=140;b=124;if(up){r-=18;gg-=30;b-=26;}}
  const n=(fbm(x/9,y/9,5.5,2)-.5)*16;r+=n;gg+=n;b+=n;d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// A tall deco panel (1 x 4): a turquoise field with a cream stylised avatar — the rayed head, the great eye, chevron
// body, three vertical lines — the pier ornament of the temples. Plain UVs; never tiles.
TEX.dDecoPanel=canvasTex(64,256,(g,w,h)=>{g.fillStyle='#3f9a88';g.fillRect(0,0,w,h);g.fillStyle='#e4c69a';
 g.fillRect(3,3,w-6,3);g.fillRect(3,h-6,w-6,3);g.fillRect(3,3,3,h-6);g.fillRect(w-6,3,3,h-6);
 for(let k=0;k<7;k++){const a=Math.PI*(k/6);g.fillRect(32+Math.cos(a)*22-2,44-Math.sin(a)*20-8,4,12);}   // rays
 g.fillRect(18,40,28,26);g.fillStyle='#3f9a88';g.fillRect(24,48,16,10);g.fillStyle='#e4c69a';g.fillRect(29,50,6,6);   // head, eye
 g.fillRect(14,72,36,4);for(let k=0;k<5;k++){g.fillRect(16+k*8,80,4,60);}                                   // shoulders, five lines
 for(let k=0;k<4;k++){const y=150+k*22;g.beginPath();g.moveTo(14,y);g.lineTo(32,y+10);g.lineTo(50,y);g.lineTo(50,y+5);g.lineTo(32,y+15);g.lineTo(14,y+5);g.fill();}   // chevrons
 g.fillRect(22,238,20,8);g.fillRect(28,232,8,6);});
TEX.dDecoPanel.wrapS=TEX.dDecoPanel.wrapT=THREE.ClampToEdgeWrapping;
// Diamond-checker tile, 2 m: ochre, turquoise and cream lozenges with dark grout.
TEX.dChecker=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=32;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/S,v=y/S;const a=Math.floor(u+v),b=Math.floor(u-v+64);const k=((a%2)+2*(((b%2)+2)%2));
  const fu=(u+v)%1,fv=(u-v+64)%1;const grout=fu<.06||fv<.06;const COL=[[204,140,72],[70,150,134],[228,206,166],[184,110,64]];let c=COL[k%4];
  const n=(fbm(x/7,y/7,3.3,2)-.5)*18;let r=c[0]+n,gg=c[1]+n,bb=c[2]+n;if(grout){r*=.45;gg*=.45;bb*=.45;}d[i]=r;d[i+1]=gg;d[i+2]=bb;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Banner: a hung cloth with the eye of The God as its device, GREY so the field takes the tint; the device stays pale.
TEX.dBanner=canvasTex(64,192,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/w-.5,v=y/h;let val=112+(fbm(x/6,y/6,2.2,2)-.5)*18+((x%3<1)?-6:0);
  const r=Math.hypot(u*2.2,(v-.36)*2.4);if(r<.34&&r>.24)val=236;if(r<.11)val=236;                       // the eye: ring + pupil
  for(let k=0;k<7;k++){const a=Math.PI*(k/6);const rx=Math.cos(a)*.42,ry=-.36-Math.sin(a)*.42*.45;if(Math.abs(u-rx)<.03&&Math.abs(v-ry+.36-.36)<.04)val=236;}   // rays
  if(v>.62&&v<.66)val=236;if(v>.70&&v<.74)val=236;                                                     // two bars
  if(v>.94&&((x%6)<3))val=0;if(v<.03)val=200;if(Math.abs(u)>.47)val*=.7;
  d[i]=val;d[i+1]=val;d[i+2]=val;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Turf: cropped grass over a mound, greyscale (tinted green per instance); mole-hills of bare earth.
TEX.dTurf=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let v=170+(fbm(x/30,y/30,1.9,3)-.5)*40+(fbm(x/4,y/4,4.4,2)-.5)*44;
  const bare=fbm(x/22,y/22,7.3,2);if(bare>.76)v=140+(bare-.76)*200;d[i]=v;d[i+1]=v*1.02;d[i+2]=v*.78;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Ground for the showcase: the SW lowlands — packed earth, grass, a hoof-worn plaza around each site.
TEX.dGround=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/60,y/60,.7,3),n2=fbm(x/7,y/7,3.2,2),gr=clamp((fbm(x/40,y/40,5.5,2)-.42)*3,0,1);
  let r=132+(n-.5)*50+(n2-.5)*22,gg=102+(n-.5)*36+(n2-.5)*14,b=70+(n-.5)*26;
  r=lerp(r,78+n2*30,gr);gg=lerp(gg,112+n2*36,gr);b=lerp(b,48,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Pantile (for the Vothic embassy hall) and blue-and-white mosaic (the Historians'): short re-descriptions of the
// Iziz ported kit's vp* maps, kept here so the Dalab kit needs nothing from 75/76.
TEX.dTile=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/19),fy=y%19,off=(row%2)*8,fx=(x+off)%16,tx=Math.floor((x+off)/16);
  const curve=Math.sin(fx/16*Math.PI);let v=150+curve*46+(h3(tx*1.7,row*2.3,3.1)-.5)*30+(fbm(x/9,y/9,4.4,2)-.5)*14;
  if(fy>16)v-=55;else if(fy<1)v+=8;if(fx<1)v-=30;d[i]=v;d[i+1]=v*.92;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.dMosaic=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const tx=Math.floor(x/8),ty=Math.floor(y/8),grout=(x%8<1)||(y%8<1);
  const u=(x/128)%.5,vv=(y/128);const diamond=Math.abs(u-.25)+Math.abs(vv-.5)<.24;const blue=diamond?(Math.abs(u-.25)+Math.abs(vv-.5)>.12):false;
  let r,gg,b;if(blue){r=42+h3(tx,ty,1)*30;gg=106+h3(tx,ty,2)*40;b=176+h3(tx,ty,3)*40;}else{r=236+h3(tx,ty,4)*14;gg=232+h3(tx,ty,5)*12;b=218+h3(tx,ty,6)*14;}
  if(diamond&&!blue){r=216;gg=150+h3(tx,ty,7)*30;b=48;}if(grout){r*=.55;gg*=.55;b*=.55;}d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// the showcase ground swaps to the lowlands map (MAT.dirt was made in 69b against TEX.dirt)
MAT.dirt.map=TEX.dGround;MAT.dirt.needsUpdate=true;

// ---------------------------------------------------------------- materials
MAT.dRammed=new THREE.MeshStandardMaterial({map:TEX.dRammed,color:0xffffff,roughness:.98,metalness:0,side:DS});vWorldUV(MAT.dRammed,.5);
MAT.dRelief=new THREE.MeshStandardMaterial({map:TEX.dRelief,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT.dRelief,.25);
MAT.dMural=new THREE.MeshStandardMaterial({map:TEX.dMural,color:0xffffff,roughness:.94,metalness:0,side:DS});vWorldUV(MAT.dMural,.5);   // boxes: a 2 m band shows the whole frieze and tiles along the wall
MAT.dMuralP=new THREE.MeshStandardMaterial({map:TEX.dMural,color:0xffffff,roughness:.94,metalness:0,side:DS});                          // planes: one whole tile stretched to the plane (round-house facets)
for(const v of[1,2,3]){MAT['dMural'+v]=new THREE.MeshStandardMaterial({map:TEX['dMural'+v],color:0xffffff,roughness:.94,metalness:0,side:DS});vWorldUV(MAT['dMural'+v],.5);MAT['dMuralP'+v]=new THREE.MeshStandardMaterial({map:TEX['dMural'+v],color:0xffffff,roughness:.94,metalness:0,side:DS});}
MAT.dReliefTq=new THREE.MeshStandardMaterial({map:TEX.dReliefTq,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.dReliefTq,.25);
MAT.dDecoPanel=new THREE.MeshStandardMaterial({map:TEX.dDecoPanel,color:0xffffff,roughness:.9,metalness:0,side:DS});
MAT.dChecker=new THREE.MeshStandardMaterial({map:TEX.dChecker,color:0xffffff,roughness:.7,metalness:0,side:DS});vWorldUV(MAT.dChecker,.5);
MAT.dBanner=new THREE.MeshStandardMaterial({map:TEX.dBanner,color:0xffffff,roughness:.9,metalness:0,side:DS});                          // plain UVs: the device must not tile
MAT.dTurf=new THREE.MeshStandardMaterial({map:TEX.dTurf,color:0xffffff,roughness:1,metalness:0,side:DS});vWorldUV(MAT.dTurf,.25);
// a mound is a real mesh (lathe), whose UVs are the geometry's 0..1: this copy tiles the turf across it by repeat
MAT.dTurfMesh=new THREE.MeshStandardMaterial({map:(()=>{const t=TEX.dTurf.clone();t.needsUpdate=true;t.repeat.set(24,8);return t;})(),color:vC(0x6a9a44),roughness:1,metalness:0,side:DS});   // a mesh has no instance tint: the colour lives on the material
MAT.dTile=new THREE.MeshStandardMaterial({map:TEX.dTile,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.dTile,.5);
MAT.dMosaic=new THREE.MeshStandardMaterial({map:TEX.dMosaic,color:0xffffff,roughness:.45,metalness:.05,side:DS});vWorldUV(MAT.dMosaic,1);
MAT.dGilt=new THREE.MeshStandardMaterial({color:0xd0a53c,roughness:.32,metalness:.75});
MAT.dGod=new THREE.MeshBasicMaterial({color:0x5fe0cc});                                              // The God's light: unlit, so it IS the light (night)
MAT.dGodDay=new THREE.MeshStandardMaterial({color:0x163a3a,metalness:.6,roughness:.3,side:DS});     // the same pane by day: dark green glass
// the spill of a light: a radial card, teal, additive — the same idea as the Ancients' ember card
TEX.dGlow=canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const rad=Math.hypot(x-w/2,y-h/2)/(w/2);const a=Math.pow(clamp(1-rad,0,1),2.4);d[i]=150;d[i+1]=240;d[i+2]=225;d[i+3]=clamp(a,0,1)*255;}
 g.putImageData(id,0,0);});
TEX.dGlow.wrapS=TEX.dGlow.wrapT=THREE.ClampToEdgeWrapping;
MAT.dGodGlow=new THREE.MeshBasicMaterial({map:TEX.dGlow,color:0xffffff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:DS});   // spill halo, night

// ---------------------------------------------------------------- geometry
const DDRUM=new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0);         // base at y=0, round enough for a house
const DDRUMB=new THREE.CylinderGeometry(.93,1,1,24).translate(0,.5,0);      // battered drum
const DRING=new THREE.TorusGeometry(1,.08,6,32);
const DCONESH=new THREE.ConeGeometry(1,1,24).translate(0,.5,0);
const DDOMELOW=new THREE.SphereGeometry(1,24,8,0,TAU,0,Math.PI/2);

// ---------------------------------------------------------------- kit items
kdef('dEarth',VBOX,MAT.dRammed);kdef('dEarthBat',VBATTER,MAT.dRammed);kdef('dEarthDrum',DDRUM,MAT.dRammed);kdef('dEarthDrumB',DDRUMB,MAT.dRammed);kdef('dEarthDome',DDOMELOW,MAT.dRammed);
kdef('dRelief',VBOX,MAT.dRelief);kdef('dReliefTq',VBOX,MAT.dReliefTq);kdef('dDecoPanel',VPLANE,MAT.dDecoPanel);kdef('dChecker',VBOX,MAT.dChecker);kdef('dReliefBat',VBATTER,MAT.dRelief);kdef('dReliefDrum',DDRUM,MAT.dRelief);
kdef('dStoneDrum',DDRUM,MAT.stone);kdef('dStoneDrumB',DDRUMB,MAT.stone);kdef('dStoneDome',DDOMELOW,MAT.stone);kdef('dStonePyr',VPYR,MAT.stone);
kdef('dMural',VPLANE,MAT.dMuralP);kdef('dMuralB',VBOX,MAT.dMural);for(const v of[1,2,3]){kdef('dMural'+v,VPLANE,MAT['dMuralP'+v]);kdef('dMuralB'+v,VBOX,MAT['dMural'+v]);}
const DMURALS=['dMural','dMural1','dMural2','dMural3'],DMURALBS=['dMuralB','dMuralB1','dMuralB2','dMuralB3'];
kdef('dBanner',VPLANE,MAT.dBanner);
kdef('dTurf',VBOX,MAT.dTurf);kdef('dTurfDome',DDOMELOW,MAT.dTurf);kdef('dTurfDrum',DDRUMB,MAT.dTurf);kdef('dTurfCone',DCONESH,MAT.dTurf);
kdef('dWoodDrum',DDRUM,MAT.woodV);kdef('dStaveDrum',new THREE.CylinderGeometry(1,1,1,18).translate(0,.5,0),MAT.woodV);
kdef('dConeSh',DCONESH,MAT.shingle);kdef('dConeT',DCONESH,MAT.thatch);kdef('dConeTile',DCONESH,MAT.dTile);kdef('dConeCu',DCONESH,MAT.verdigris);kdef('dConeScrap',DCONESH,MAT.corrugate);
kdef('dTile',VBOX,MAT.dTile);kdef('dGableTile',VGABLE,MAT.dTile);kdef('dHipTile',VHIP,MAT.dTile);kdef('dPyrTile',VPYR,MAT.dTile);
kdef('dMosaic',VBOX,MAT.dMosaic);kdef('dGilt',VBOX,MAT.dGilt);kdef('dGiltDome',VDOME,MAT.dGilt);kdef('dGiltBall',VBALL,MAT.dGilt);
kdef('dPanelDome',VDOME,MAT.white);kdef('dRustDome',VDOME,MAT.rust);kdef('dPanelDrum',DDRUM,MAT.white);kdef('dRustDrum',DDRUM,MAT.rust);
kdef('dGlow',VBOX,MAT.dGod);kdef('dGlowDay',VBOX,MAT.dGodDay);kdef('dGodBall',VBALL,MAT.dGod);kdef('dGlassBall',VBALL,MAT.darkGlass);kdef('dGodStrip',new THREE.BoxGeometry(1,.14,.14),MAT.dGod);kdef('dGodHalo',VPLANE,MAT.dGodGlow);
MAT.dHide=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:0});   // animal hide: tinted per instance
kdef('dHideBall',VBALL,MAT.dHide);kdef('dHideCone',VCONE,MAT.dHide);kdef('dHideBox',VBOX,MAT.dHide);kdef('dHideDrum',DDRUM,MAT.dHide);
kdef('dRing',DRING,MAT.iron);kdef('dRopeRing',DRING,MAT.tarp);
// what the hour toggles (see 94-dalab-light.js): The God's light and the hearth fires by night, dark glass by day
const DNIGHT_ITEMS=['dGlow','dGodBall','dGodStrip','dGodHalo','fireWin','ember','emberB'];
const DDAY_ITEMS=['dGlowDay','dGlassBall'];
// ================================================================= DALAB — building blocks (prefix dn, local frame, y = base)
// Everything here builds in the same LOCAL frame as the Iziz Vernacular helpers (69c): origin at the plot centre on
// the ground, +z the front, metres. A bearing `ry` on a round building means the OUTWARD direction of that point of
// the wall, so the same ry serves vnDoor / vnWin / vnLamp unchanged: the point on a drum of radius r at bearing ry
// is dnOnRing(x,z,r,ry) = loc(x,z,0,r,ry).
//
// Dalab registers through VERN (69c) so the inspector, labels, DOORS and the city placer all work unchanged; dDef
// stamps culture:'dalab'. Tags: type (project list), wealth (peasant|noble|priest|civic, plus the Iziz tiers where a
// building is what an outsider built), lit (true only for priest / noble / civic — The God's light is the priests'
// to give), caste.
function dDef(D){D.tags=Object.assign({culture:'dalab'},D.tags||{});return VERN.def(D);}
const dnOnRing=(x,z,r,ry)=>loc(x,z,0,r,ry);
const dRi=(a,b)=>a+Math.floor(rng()*(b-a+1));
function dnDrum(item,x,y,z,r,h,c){kput(item,[x,y,z],null,[r,h,r],c||null);}

// ---------------------------------------------------------------- The God's light (night) and hearth fire (night)
// A lit window is TWO panes at the same spot — the teal unlit pane the hour shows at night, the dark green glass by
// day — so the schedule in 94-dalab-light.js is a visibility flip, no rebuild. Only ever placed under vLit().
function dnGodWin(x,y,z,ry,w,h,frameItem,c){vnWin(x,y,z,ry,w,h,'glass',frameItem,c);const f=loc(x,z,0,.11,ry);
 vB('dGlow',f[0],y,f[1],w,h,.06,ry);vB('dGlowDay',f[0],y,f[1],w,h,.06,ry);
 const g=loc(x,z,0,.5,ry);kput('dGodHalo',[g[0],y+h/2,g[1]],vQ(ry,0,0),[w*2.4,h*2.2,1],null);}
function dnGodLamp(x,y,z,ry){const a=loc(x,z,0,.05,ry),b=loc(x,z,0,.6,ry);vBeam([a[0],y,a[1]],[b[0],y+.05,b[1]],.05,vC(0x2e2a26),'vIron');
 vB('vIron',b[0],y-.02,b[1],.3,.05,.3,ry,vC(0x2e2a26));vBall('dGodBall',b[0],y-.2,b[1],.14);vBall('dGlassBall',b[0],y-.2,b[1],.14);
 kput('dGodHalo',[b[0],y-.2,b[1]],vQ(ry,0,0),[1.6,1.6,1],null);const g=loc(x,z,0,1.2,ry);kput('dGodHalo',[g[0],.06,g[1]],qEuler(-Math.PI/2,0,0),[y*1.2,y*1.2,1],null);}
function dnGodPost(x,y,z,h){vPst('vPipe',x,y,z,.07,h,vC(0x2e2a26));vB('vIron',x,y+h,z,.5,.06,.5,0,vC(0x2e2a26));vBall('dGodBall',x,y+h-.2,z,.16);vBall('dGlassBall',x,y+h-.2,z,.16);
 kput('dGodHalo',[x,y+h-.2,z],vQ(0,0,0),[2,2,1],null);kput('dGodHalo',[x,y+h-.2,z],vQ(Math.PI/2,0,0),[2,2,1],null);kput('dGodHalo',[x,y+.06,z],qEuler(-Math.PI/2,0,0),[h*1.4,h*1.4,1],null);}
function dnGodStrip(x,y,z,ry,L){const f=loc(x,z,0,.08,ry);kput('dGodStrip',[f[0],y,f[1]],vQ(ry,0,0),[L,1,1],null);kput('dGodHalo',[f[0],y,f[1]],vQ(ry,0,0),[L*1.1,.9,1],null);}
// Firelight in an opening: the kit's own flame + ember cards (69-mat-salvage). Night only. (x,z) ON the face.
function dnHearth(x,y,z,ry,w,h){const f=loc(x,z,0,.08,ry),g=loc(x,z,0,.4,ry);kput('fireWin',[f[0],y+h/2,f[1]],vQ(ry,0,0),[w,h,1],null);
 kput('ember',[g[0],y+h*.6,g[1]],vQ(ry,0,0),[w*3.4,h*3.6,1],null);}
function dnFirePit(x,y,z,s){for(let k=0;k<7;k++){const a=k/7*TAU;kput('vRock',[x+Math.cos(a)*s*.9,y+.12,z+Math.sin(a)*s*.9],qEuler(rng(),rng(),0),[s*.3,s*.22,s*.3],vC(0x6a625a));}
 for(let k=0;k<3;k++)kput('vPost',[x,y+.12,z],qEuler(0,k*1.1,Math.PI/2),[.09,s*1.2,.09],vC(0x3a2a1c));firePit('dalab',x,y+.1,z,s);}

// ---------------------------------------------------------------- relief, murals, banners, gates, steles
// Carved band proud of a face; (x,z) ON the face, ry outward. dRelief tiles 1 m cells.
function dnReliefBand(x,y,z,ry,w,h,c){const f=loc(x,z,0,.1,ry);vB('dRelief',f[0],y,f[1],w,h,.16,ry,c);}
// Painted frieze on a flat face (2 m tile of avatars and heroes).
function dnMuralBand(x,y,z,ry,w,h,v){const f=loc(x,z,0,.04,ry);vB(DMURALBS[v==null?dRi(0,3):v],f[0],y,f[1],w,h,.06,ry);}
// The same frieze round a drum: flat facets tangent to the wall, one whole tile each.
function dnMuralRing(x,y,z,r,h,c,v){const n=Math.max(8,Math.round(TAU*r/1.5));const it=DMURALS[v==null?dRi(0,3):v];for(let k=0;k<n;k++){const a=k/n*TAU;const p=dnOnRing(x,z,r+.035,a);vPl(it,p[0],y+h/2,p[1],TAU*(r+.035)/n+.02,h,a,c||null);}}
// A rammed-earth wall band painted in two colours (poor houses: no mural, just a red foot and a turquoise line).
function dnPaintRing(x,y,z,r,h,c){dnDrum('dEarthDrum',x,y,z,r+.03,h,c);}
// Banner hung from a crossbar at (x,y,z); the top is fixed, the foot free. ry = the direction it faces.
function dnBanner(x,y,z,ry,w,h,c){const q=vQ(ry,0,0);kput('dBanner',[x,y-h/2,z],q,[w,h,1],c||dCol(DPAL.red));vB('vWood',x,y-.04,z,w+.3,.08,.08,ry,vC(0x5a4632));}
// Tall pole with a crossbar and a banner beside it; ry = the direction the banner faces.
function dnBannerPole(x,y,z,ry,h,c){vPst('vPost',x,y,z,.09,h,vC(0x5a4632));const p=loc(x,z,.75,0,ry);vB('vWood',p[0],y+h-.3,p[1],1.5,.08,.08,ry,vC(0x5a4632));
 kput('dBanner',[p[0],y+h-.35-h*.2,p[1]],vQ(ry,0,0),[1.0,h*.4,1],c||dCol(DPAL.red));vBall('dGiltBall',x,y+h+.15,z,.14);}
// Tiwanaku cornice: a relief band, then stepped stone courses each further out, then a cap. Returns the top y.
function dnCornice(x,y,z,w,d,ry,c,steps,tr){if(tr){const f=loc(x,z,0,d/2,ry);dnFretBand(f[0],y+.1,f[1],ry,w-.4,.7);}else dnReliefBand(x,y,z+0,0,w,.9,c);   // front only is carved; the sides get the plain courses
 vB('vStone',x,y,z,w+.16,.9,d+.16,ry,c);let yy=y+.9;steps=steps||2;for(let k=0;k<steps;k++){const o=.22+.26*k;vB('vStone',x,yy,z,w+2*o,.36,d+2*o,ry,tr||c);yy+=.36;}
 vB('vStone',x,yy,z,w+.2,.3,d+.2,ry,(tr||c).clone().multiplyScalar(1.06));return yy+.3;}
// Trilithon gate (the Gate of the Sun): two monolithic piers, a lintel carrying a relief frieze, a stepped crest.
function dnGate(x,y,z,ry,w,h,c,tr){for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.5),0,ry);vB('vStone',p[0],y,p[1],1.0,h,1.3,ry,c);const q=loc(p[0],p[1],0,.65,ry);if(tr)dnDecoPanel(q[0],y+.5,q[1],ry,.7,h-1.0);else dnReliefBand(p[0]+0,y+.6,p[1],ry,.7,h-1.2,c);}
 vB('vStone',x,y+h,z,w+2.2,1.1,1.4,ry,tr||c);const f=loc(x,z,0,.7,ry);if(tr)dnFretBand(f[0],y+h+.1,f[1],ry,w+1.6,.9);else dnReliefBand(f[0],y+h+.1,f[1],ry,w+1.6,.9,c);
 vB('vStone',x,y+h+1.1,z,w+1.4,.3,1.2,ry,c);vB('vStone',x,y+h+1.4,z,w*.5,.35,1.0,ry,c);vB('vStone',x,y+h+1.75,z,w*.22,.35,.9,ry,c);}
// A carved stele (Ponce monolith): a battered shaft with a relief front and a squared head.
function dnStele(x,y,z,ry,h,c,tq){vB('vStone',x,y,z,1.0,h,.7,ry,c);const f=loc(x,z,0,.35,ry);if(tq)dnFretBand(f[0],y+.4,f[1],ry,.7,h-.9);else dnReliefBand(f[0],y+.4,f[1],ry,.7,h-.9,c);vB('vStone',x,y+h,z,1.1,.3,.8,ry,c);
 const g=loc(x,z,0,.4,ry);vB('vDarkB',g[0],y+h-.55,g[1],.5,.25,.05,ry);}
// Altar: a stone table with a brazier (fire by night) in front of a temple door.
function dnAltar(x,y,z,ry,c){vB('vStone',x,y,z,2.2,1.0,1.2,ry,c);dnReliefBand(x,y+.15,z,ry,2.0,.7,c);vB('vStone',x,y+1.0,z,2.5,.2,1.5,ry,c);vPst('vPipe',x,y+1.2,z,.35,.6,vC(0x2e2a26));firePit('dalab',x,y+1.55,z,.7);}


// ---------------------------------------------------------------- the sacred deco (round 4)
// Fret band in colour (cream over turquoise inlay), proud of a face; (x,z) ON the face, ry outward.
function dnFretBand(x,y,z,ry,w,h){const f=loc(x,z,0,.1,ry);vB('dReliefTq',f[0],y,f[1],w,h,.16,ry);}
// A tall deco panel of the avatar on a pier: turquoise field, cream figure, a cream frame; (x,z) ON the face.
function dnDecoPanel(x,y,z,ry,w,h){const f=loc(x,z,0,.06,ry);kput('dDecoPanel',[f[0],y+h/2,f[1]],vQ(ry,0,0),[w,h,1],null);const tr=dCol(DPAL.trim);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.07),.1,ry);vB('vStone',p[0],y-.1,p[1],.14,h+.2,.18,ry,tr);}const p=loc(x,z,0,.1,ry);vB('vStone',p[0],y+h,p[1],w+.28,.14,.2,ry,tr);vB('vStone',p[0],y-.14,p[1],w+.28,.14,.2,ry,tr);}
// Stepped parapet crest (the ziggurat top of the reference facades): three cream-trimmed steps over a fret band,
// centred on (x,z), width w, ry the facing.
function dnCrest(x,y,z,w,ry,wallC){const tr=dCol(DPAL.trim);const W=[w,w*.62,w*.3],H=[.9,.8,.7];let yy=y;
 for(let k=0;k<3;k++){vB('vStone',x,yy,z,W[k],H[k],1.2,ry,wallC);vB('vStone',x,yy+H[k]-.16,z,W[k]+.24,.16,1.44,ry,tr);const f=loc(x,z,0,.6,ry);if(k<2)dnFretBand(f[0],yy+.2,f[1],ry,W[k]-.6,.5);yy+=H[k];}
 vBall('dGiltBall',x,yy+.2,z,.22);return yy;}
// Cream string course round a box (a horizontal band of trim).
function dnTrimBand(x,y,z,w,d,ry,h){vB('vStone',x,y,z,w+.2,h||.3,d+.2,ry,dCol(DPAL.trim));}
// Diamond-checker paving.
function dnChecker(x,y,z,w,d,ry){vB('dChecker',x,y-.06,z,w,.08,d,ry);}
// ---------------------------------------------------------------- the round house
// o: {wall:item, wallC, roof:'thatch'|'shingle'|'scrap'|'tile', rise, roofC, door:ry, win:[ry...], winKind, band:'mural'|'paint'|'relief'|null,
//     hearth:bool, finial:bool, wood:colour, foot:bool}
function dnRoundHouse(x,y,z,r,h,o){o=o||{};const wall=o.wall||'dEarthDrum',wc=o.wallC||dCol(DPAL.earth),wood=o.wood||dCol(DPAL.woodGrey);
 dnDrum(wall,x,y,z,r,h,wc);
 if(o.foot!==false)dnDrum(wall==='dStoneDrum'?'dStoneDrum':'dEarthDrum',x,y-.05,z,r+.1,.45,wall==='dStoneDrum'?wc.clone().multiplyScalar(.85):dCol(DPAL.earthDark));
 const rise=o.rise||r*1.05,rc=o.roofC;
 if(o.roof==='shingle'){kput('dConeSh',[x,y+h-.35,z],null,[r*1.22,rise+.35,r*1.22],rc||dCol(DPAL.shingle));dnDrum('vWood',x,y+h-.55,z,r*1.24,.22,wood);}
 else if(o.roof==='scrap'){kput('dConeScrap',[x,y+h-.3,z],null,[r*1.2,rise+.3,r*1.2],null);for(let k=0;k<Math.round(r*2);k++){const a=rng()*TAU,rr0=rr(r*.3,r*1.0);const t=rr0/(r*1.2);kput('vRock',[x+Math.cos(a)*rr0,y+h-.3+(rise+.3)*(1-t)+.1,z+Math.sin(a)*rr0],qEuler(rng(),rng(),0),[.3,.2,.28],vC(0x6a625a));}}
 else if(o.roof==='tile'){kput('dConeTile',[x,y+h-.35,z],null,[r*1.22,rise+.35,r*1.22],rc||null);dnDrum('vStone',x,y+h-.5,z,r*1.24,.2,wc);}
 else{vnThatchCone(x,y+h,z,r,rise,rc||dCol(DPAL.thatch));}
 if(o.finial!==false){vPst('vPost',x,y+h+rise-.4,z,.07,1.3,vC(0x5a4632));if(o.roof==='thatch'||!o.roof)kput('dConeT',[x,y+h+rise-.5,z],null,[.7,.9,.7],rc||dCol(DPAL.thatch));else vBall('dGiltBall',x,y+h+rise+.9,z,.16);}
 if(o.band==='mural')dnMuralRing(x,y+h-1.55,z,r,1.2);
 else if(o.band==='relief'){dnDrum('dReliefDrum',x,y+h-1.25,z,r+.06,.9,wc);}
 else if(o.band==='paint'){dnDrum('dEarthDrum',x,y+h-.5,z,r+.03,.22,dCol(DPAL.turq));dnDrum('dEarthDrum',x,y+.4,z,r+.03,.5,dCol(DPAL.red));}
 const dr=o.door!==undefined?o.door:0;const dp=dnOnRing(x,z,r+.06,dr);vnDoor(dp[0],y,dp[1],dr,o.doorW||.95,o.doorH||1.9,o.frame||'vWood',wood,o.leafC||vC(0x6a5a48),false);
 (o.win||[]).forEach((wr,i)=>{const p=dnOnRing(x,z,r+.06,wr);if(o.lit)dnGodWin(p[0],y+1.25,p[1],wr,.8,.7,o.frame||'vWood',wood);else vnWin(p[0],y+1.25,p[1],wr,.8,.7,o.winKind||'open',o.frame||'vWood',wood);
  if(o.hearth&&i===0)dnHearth(p[0],y+1.25,p[1],wr,.8,.7);});
 return y+h+rise;}

// ---------------------------------------------------------------- the earth mound
// A dome-shaped ceremonial mound: a turfed lathe (real mesh) whose profile is a smoothstep from the foot radius r
// to a flat plateau of radius rt at height h — flat at the foot and the top, steepest half way, walkable. A stone
// stair with kerbs climbs the front (bearing ry) from an apron to the plateau. Optional o.terrace={r,h}: a lower,
// broader terrace ring round the foot. Returns {top:h, prof(rho)}.
function dnMoundProfile(r,rt,h){return rho=>{if(rho<=rt)return h;if(rho>=r)return 0;const t=1-(rho-rt)/(r-rt);return h*t*t*(3-2*t);};}
// Every mound and ring bank goes into DMOUND_GEOS in WORLD space and 94-dalab-light merges them into one mesh
// (one draw call however many mounds a settlement has). Triangles are charged to the site through TSTAT here.
const DMOUND_GEOS=[];
function dnMoundGeo(geo,x,z){const c=VERN.cur;geo.translate(x,-.05,z);if(c)geo.applyMatrix4(c.G.matrix);DMOUND_GEOS.push(geo);const t=tcur();if(t){t.meshes++;t.tris+=triOf(geo);}}
function dnMound(x,z,r,rt,h,ry,o){o=o||{};const prof=dnMoundProfile(r,rt,h);
 const mk=(R,RT,H,pf)=>{const pts=[];const N=22;for(let k=0;k<=N;k++){const rho=R-(R-RT)*k/N;pts.push(new THREE.Vector2(rho*(1+(fbm(k*.7,R,3.3,2)-.5)*.02),pf(rho)));}
  pts.push(new THREE.Vector2(RT*.6,H),new THREE.Vector2(0,H));const g=new THREE.LatheGeometry(pts,72);g.computeVertexNormals();return g;};
 dnMoundGeo(mk(r,rt,h,prof),x,z);
 if(o.terrace){const T=o.terrace;const pf=dnMoundProfile(T.r,r-2,T.h);dnMoundGeo(mk(T.r,r-2,T.h,pf),x,z);}
 if(o.noStair){const stC0=o.stoneC||dCol(DPAL.stone);return{top:h,prof,stoneC:stC0};}
 const stC=o.stoneC||dCol(DPAL.stone);
 // the stair: a continuous ramp of tilted slabs following the profile (so no gaps where the slope is steep), kerb
 // stringers both sides, treads laid on the ramp every 0.3 m of rise, a landing every ~4 m of rise, steles at foot and top
 {const r0=r+3.0,r1=rt-1.2;const pf=rho=>(o.terrace&&rho>r?dnMoundProfile(o.terrace.r,r-2,o.terrace.h)(rho):prof(rho));
  const n=Math.round((r0-r1)/1.2);const W=3.6;
  for(let k=0;k<n;k++){const ra=r0-(r0-r1)*k/n,rb=r0-(r0-r1)*(k+1)/n;const ya=pf(ra),yb=pf(rb);const L=Math.hypot(ra-rb,yb-ya),a=Math.atan2(yb-ya,ra-rb);
   const p=dnOnRing(x,z,(ra+rb)/2,ry);const q=vQ(ry,a,0);
   kput('vStone',[p[0],(ya+yb)/2-.12,p[1]],q,[W,.4,L+.08],stC);
   for(const sd of[-1,1]){const kp=loc(x,z,sd*(W/2+.2),(ra+rb)/2,ry);kput('vStone',[kp[0],(ya+yb)/2+.18,kp[1]],q,[.42,.6,L+.08],stC.clone().multiplyScalar(.9));}}
  // treads: horizontal slabs on the ramp surface at every 0.3 m of rise
  {let yy=.3;let rho=r0;while(yy<h-.05&&rho>r1){while(rho>r1&&pf(rho)<yy)rho-=.05;const p=dnOnRing(x,z,rho,ry);vB('vStone',p[0],yy-.08,p[1],W-.1,.12,.5,ry,stC.clone().multiplyScalar(1.05));yy+=.3;}}
  // landings every ~4 m of rise
  for(let yl=4;yl<h-1;yl+=4){let rho=r0;while(rho>r1&&pf(rho)<yl)rho-=.05;const p=dnOnRing(x,z,rho-.6,ry);vB('vStone',p[0],yl-.1,p[1],W+.6,.3,2.0,ry,stC);
   for(const sd of[-1,1]){const q=loc(x,z,sd*(W/2+.6),rho-.6,ry);vB('vStone',q[0],yl,q[1],.6,1.0,.6,ry,stC);vBall('dGiltBall',q[0],yl+1.1,q[1],.14);}}
  for(const sd of[-1,1]){const q=loc(x,z,sd*2.8,r0+.8,ry);dnStele(q[0],0,q[1],ry,3.2,stC);const t=loc(x,z,sd*2.8,r1-.6,ry);dnStele(t[0],h,t[1],ry,2.6,stC);}
  const ap=loc(x,z,0,r0+3.2,ry);vnPaving(ap[0],.02,ap[1],7,4,ry,stC,10);}
 return{top:h,prof};}
// A straight stone flight from A to B (local frame, y = the walking surface): a tilted ramp slab with kerb stringers,
// treads every 0.3 m of rise, and a solid stone wall beneath it down to `floorY` (so a flight up a hillside never floats).
function dnFlight(ax,ay,az,bx,by,bz,W,c,floorY){c=c||dCol(DPAL.stone);const dx=bx-ax,dz=bz-az,run=Math.hypot(dx,dz),rise=by-ay;const ry=Math.atan2(dx,dz);const a=Math.atan2(rise,run),L=Math.hypot(run,rise);
 const mx=(ax+bx)/2,mz=(az+bz)/2,my=(ay+by)/2;const q=vQ(ry,-a,0);
 kput('vStone',[mx,my-.12,mz],q,[W,.4,L+.1],c);
 for(const sd of[-1,1]){const kp=loc(mx,mz,sd*(W/2+.2),0,ry);kput('vStone',[kp[0],my+.18,kp[1]],q,[.42,.6,L+.1],c.clone().multiplyScalar(.9));}
 const n=Math.max(1,Math.round(rise/.3));for(let k=0;k<=n;k++){const t=k/n;const p=loc(ax,az,0,run*t,ry);vB('vStone',p[0],ay+rise*t-.08,p[1],W-.1,.12,.5,ry,c.clone().multiplyScalar(1.05));}
 if(floorY!=null){const depth=Math.max(0,my-.3-floorY);if(depth>.3)vB('vStone',mx,floorY,mz,W+.2,depth,run+.4,ry,c.clone().multiplyScalar(.85));}
 return{ry,L};}
// A balustrade of stone posts and a rail along a local line from A to B.
function dnBalustrade(ax,ay,az,bx,by,bz,c){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const t=k/n;vPst('vPostS',ax+(bx-ax)*t,ay+(by-ay)*t,az+(bz-az)*t,.12,1.0,c);}vBeam([ax,ay+1.0,az],[bx,by+1.0,bz],.16,c,'vStone');}
// A cable with sag between two points (six segments of a parabola).
function dnCable(a,b,sag,w,c){const n=6;let prev=a;for(let k=1;k<=n;k++){const t=k/n;const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag*4*t*(1-t),a[2]+(b[2]-a[2])*t];vBeam(prev,p,w||.05,c||vC(0x3a3a3a),'vRope');prev=p;}}
// Windmill sails live in their own small group (two merged meshes) so 94-dalab-light can turn them: DWIND holds {grp,rate}.
const DWIND=[];
// A ring earthwork (the High Priest's wall): a turf bank of width w and height h at radius r, open for gapW at gapRy;
// the bank ends are faced with rammed earth. A shallow ditch band outside it.
function dnRingBank(x,z,r,h,w,gapRy,gapW,o){const ga=gapW/(2*r);
 const pts=[new THREE.Vector2(r-w/2,0),new THREE.Vector2(r-w*.3,h*.85),new THREE.Vector2(r-w*.12,h),new THREE.Vector2(r+w*.12,h),new THREE.Vector2(r+w*.3,h*.85),new THREE.Vector2(r+w/2,0)];
 const g=new THREE.LatheGeometry(pts,140,gapRy+ga,TAU-2*ga);g.computeVertexNormals();dnMoundGeo(g,x,z);
 for(const s of[-1,1]){const a=gapRy+s*ga;const p=dnOnRing(x,z,r,a);kput('dEarthBat',[p[0],0,p[1]],qEuler(0,-a+Math.PI/2,0),[2.2,h+.3,w*1.06],dCol(DPAL.earth));
  const q=dnOnRing(x,z,r,a+s*ga*.06);vB('dEarth',q[0],h-.1,q[1],3,.5,w*.9,a+Math.PI/2,dCol(DPAL.earthDark));}
 if(o&&o.palisade){const n=Math.round(TAU*r/.45);const c=vC(0x7a5a3e);for(let k=0;k<n;k++){const a=k/n*TAU;let d=Math.abs(((a-gapRy)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<ga+.02)continue;
  const p=dnOnRing(x,z,r,a);vPst('vPostB',p[0],h-.3,p[1],.16,2.4+rr(-.2,.2),c.clone().multiplyScalar(rr(.85,1.1)));}}}
// Battered rammed-earth platform (a noble's house stands on one).
function dnPlatform(x,y,z,w,d,h,ry,c){kput('dEarthBat',[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||dCol(DPAL.earth));vB('dEarth',x,y+h-.06,z,w*.88,.12,d*.88,ry,dCol(DPAL.earthDark));}
// Rectangular rammed-earth compound wall, battered, with a cap, drum buttresses at the corners, a gate in the front
// (+z) of width `gate` flanked by pylons; o.relief carves a band on the outer front; o.mural paints one instead.
function dnEarthWall(x,y,z,w,d,ry,h,gate,o){o=o||{};const c=o.c||dCol(DPAL.earth),t=o.t||1.1;
 const seg=(lx,lz,L,a)=>{const p=loc(x,z,lx,lz,ry);kput('dEarthBat',[p[0],y,p[1]],qEuler(0,ry+a,0),[L,h,t],c);vB('dEarth',p[0],y+h-.05,p[1],L+.1,.25,t*.86+.2,ry+a,dCol(DPAL.earthDark));};
 seg(0,-d/2,w,0);seg(-w/2,0,d,Math.PI/2);seg(w/2,0,d,Math.PI/2);
 if(gate){const L=(w-gate)/2-1.2;seg(-(gate/2+1.2+L/2),d/2,L,0);seg(gate/2+1.2+L/2,d/2,L,0);
  for(const s of[-1,1]){const p=loc(x,z,s*(gate/2+.7),d/2,ry);vB(o.stoneGate?'vStone':'dEarth',p[0],y,p[1],1.4,h+1.3,t+.8,ry,o.stoneGate?dCol(DPAL.stone):c);
   const f=loc(x,z,s*(gate/2+.7),d/2+t/2+.4,ry);dnReliefBand(f[0],y+.5,f[1],ry,1.0,h+.3,o.stoneGate?dCol(DPAL.stone):c);}
  if(o.lintel!==false){const p=loc(x,z,0,d/2,ry);vB('vWood',p[0],y+h+.6,p[1],gate+1.4,.4,t+.3,ry,dCol(DPAL.wood));}
  if(o.relief){for(const s of[-1,1]){const f=loc(x,z,s*(gate/2+1.2+L/2),d/2+t/2+.02,ry);dnReliefBand(f[0],y+h*.45,f[1],ry,L-.6,1.0,c);}}
  if(o.mural){for(const s of[-1,1]){const f=loc(x,z,s*(gate/2+1.2+L/2),d/2+t/2+.02,ry);dnMuralBand(f[0],y+h*.3,f[1],ry,L-.6,Math.min(2,h-.8));}}}
 else seg(0,d/2,w,0);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*w/2,sz*d/2,ry);dnDrum('dEarthDrumB',p[0],y,p[1],t*1.1,h+.5,c);}}
// A circular wall of box segments (stone or earth) with a gap of gapW at bearing gapRy; buttress drums every 1/8.
function dnRingWall(x,y,z,r,h,gapRy,gapW,item,c,t){t=t||1.0;const n=Math.round(TAU*r/2.6);const ga=gapW/(2*r);
 for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;let d=Math.abs(((a-gapRy)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<ga)continue;const p=dnOnRing(x,z,r,a);vB(item,p[0],y,p[1],TAU*r/n+.12,h,t,a,c);
  if(k%Math.round(n/8)===0)dnDrum(item==='vStone'?'dStoneDrumB':'dEarthDrumB',p[0],y,p[1],t*1.3,h+.4,c);}
 for(const s of[-1,1]){const p=dnOnRing(x,z,r,gapRy+s*ga);vB(item,p[0],y,p[1],1.6,h+1.2,t+.9,gapRy+s*ga,c);}}

// ---------------------------------------------------------------- people
// Green-skinned townsfolk (the photosynthesis mod is near-universal).
function dnFolk(x,z,n,spread,y){y=y||0;for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,dCol(DPAL.robe));kput('figH',[px,y,pz],null,1,dCol(DPAL.skin));}}
// A priest: white robe, gold head-dress, a staff.
function dnPriest(x,y,z,ry){kput('figB',[x,y,z],qEuler(0,ry,0),[1.05,1.1,1.05],dCol(DPAL.priest));kput('figH',[x,y,z],null,[1,1.1,1],dCol(DPAL.skin));vB('dGilt',x,y+1.72,z,.42,.14,.42,ry);
 const p=loc(x,z,.4,0,ry);vPst('vPost',p[0],y,p[1],.03,2.3,vC(0x5a4632));vBall('dGiltBall',p[0],y+2.35,p[1],.1);}
// A Giant of Dalab: 3.8 m, green, two or four arms, spear. Caste guards for the priests (arms=4) or the city watch (2).
function dnGiant(x,y,z,ry,arms,o){o=o||{};const skin=o.skin||dCol(DPAL.skin,.8);const S=o.s||2.3;
 kput('figB',[x,y,z],qEuler(0,ry,0),[S,S*1.08,S],skin);kput('figH',[x,y,z],null,[S*1.05,S*1.08,S*1.05],skin.clone().multiplyScalar(1.1));
 vB('vTarpB',x,y+S*.66,z,S*.55,S*.42,S*.5,ry,dCol(DPAL.red));                                            // loincloth
 vB('dGilt',x,y+1.62*S*1.08+.02,z,S*.32,.1,S*.32,ry);                                                     // gold circlet
 // arms: the figure cylinder rolled past the vertical so it hangs from the shoulder, splayed a little; the lower
 // pair of a four-armed guard reaches forward
 const arm=(lx,ly,tilt,roll)=>{const p=loc(x,z,lx,0,ry);kput('figB',[p[0],y+ly,p[1]],vQ(ry,tilt,roll),[S*.26,S*.62,S*.26],skin);};
 const hand=(lx,ly,lz)=>{const p=loc(x,z,lx,lz,ry);kput('figH',[p[0],y+ly-1.62*S*.16,p[1]],null,[S*.16,S*.16,S*.16],skin);};
 arm(-S*.30,S*1.42,0,Math.PI-.28);arm(S*.30,S*1.42,0,-(Math.PI-.28));hand(-S*.47,S*.82,0);hand(S*.47,S*.82,0);
 if(arms>=4){arm(-S*.30,S*1.18,-1.2,Math.PI-.5);arm(S*.30,S*1.18,-1.2,-(Math.PI-.5));hand(-S*.58,S*.98,S*.55);hand(S*.58,S*.98,S*.55);}
 if(o.spear!==false){const p=loc(x,z,S*.5,S*.18,ry);vPst('vPost',p[0],y,p[1],.045,S*2.3,vC(0x4a3a2a));kput('vConeI',[p[0],y+S*2.3,p[1]],null,[.14,.6,.14],vC(0x3a3a3a));}
 if(o.shield){const p=loc(x,z,-S*.5,S*.1,ry);kput('vStone',[p[0],y+S*1.0,p[1]],vQ(ry,0,0),[S*.6,S*.8,.08],dCol(DPAL.red));}}

// ---------------------------------------------------------------- furniture
// Market stall: counter, four posts, a thatch or cloth shed roof, goods.
function dnStall(x,z,ry,o){o=o||{};const wood=dCol(DPAL.woodGrey);const W=3.2,D=2.2;
 const c=loc(x,z,0,0,ry);vB('vWood',c[0],.8,c[1],W,.12,.9,ry,wood);for(const s of[-1,1]){const p=loc(x,z,s*(W/2-.2),.2,ry);vB('vWood',p[0],0,p[1],.3,.8,.6,ry,wood);}
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(W/2-.1),sz*(D/2-.1),ry);vPst('vPost',p[0],0,p[1],.06,2.3+(sz<0?.5:0),wood);}
 if(o.cloth){kput('vClothB',[...(()=>{const p=loc(x,z,0,0,ry);return[p[0],2.55,p[1]];})()],vQ(ry,.2,0),[W+.5,.05,D+.6],dCol([0xa8382a,0x2f9a8a,0xd8a838,0xe8dcc0]));}
 else vnShedRoof(x,2.3,z,W,D,.5,ry,'vThatchB',dCol(DPAL.thatch),.45,.28);
 const g=loc(x,z,0,-.2,ry);const kind=o.kind!==undefined?o.kind:dRi(0,3);
 if(kind===0)for(let k=0;k<5;k++)vBall('vGourd',g[0]+rr(-1.2,1.2),1.05,g[1]+rr(-.25,.25),.17,dCol([0xb08a4a,0x8a9a3a,0xc09a5a,0x6a9a4a]),.2);
 else if(kind===1)for(let k=0;k<4;k++)vPst('vClayPot',g[0]-1.1+k*.72,.92,g[1],.2,.45,dCol([0x9a5a38,0xa86a44,0x7a4a2a]));
 else if(kind===2)vnSacks(g[0],.92,g[1],3);
 else for(let k=0;k<3;k++)kput('vClothB',[g[0]-.8+k*.8,1.0,g[1]],null,[.6,.25,.5],dCol(DPAL.robe));
 if(o.folk!==false)dnFolk(x,z,1,.4);}
// Raised granary basket on stilts: a stave drum under a thatch cone, a ladder.
function dnGranary(x,y,z,r,h,o){o=o||{};const wood=dCol(DPAL.woodGrey);const FL=o.fl||1.6;
 for(let k=0;k<6;k++){const a=k/6*TAU;vPst('vPostB',x+Math.cos(a)*r*.8,y-.2,z+Math.sin(a)*r*.8,.14,FL+.2,wood);vB('vStone',x+Math.cos(a)*r*.8,y+FL-.1,z+Math.sin(a)*r*.8,.6,.1,.6,0,vC(0x9a8a78));}   // rat guards
 vB('vWood',x,y+FL,z,r*2.2,.16,r*2.2,0,wood);dnDrum('dStaveDrum',x,y+FL+.16,z,r,h,dCol(DPAL.wood));
 for(const yy of[.3,h*.5,h-.3])kput('dRopeRing',[x,y+FL+.16+yy,z],qEuler(Math.PI/2,0,0),[r*1.03,r*1.03,1],vC(0xb8a888));
 vnThatchCone(x,y+FL+.16+h,z,r,r*1.1,dCol(DPAL.thatch));kput('dConeT',[x,y+FL+.16+h+r*1.1-.4,z],null,[.6,.8,.6],dCol(DPAL.thatch));
 const dp=dnOnRing(x,z,r,o.door||0);vB('vDarkB',dp[0],y+FL+.6,dp[1],.7,.8,.1,o.door||0);vB('vWood',dp[0],y+FL+.6,dp[1]+0,.75,.8,.05,o.door||0,wood);
 const lp=dnOnRing(x,z,r+.9,o.door||0);vnLadder(lp[0],y,lp[1],(o.door||0)+Math.PI,FL+.9,wood);}
// A drying rack of maize / a stack of firewood / a water jar: peasant-yard clutter.
function dnJar(x,y,z,r){vPst('vClayPot',x,y,z,r,r*2.2,dCol([0x9a5a38,0xa86a44,0x7a4a2a]));vBall('vGourd',x,y+r*2.2,z,r*.7,vC(0x6a4a30),r*.3);}
function dnWoodpile(x,y,z,ry,L){for(let k=0;k<3;k++)for(let j=0;j<4-k;j++){const p=loc(x,z,0,-.45+j*.3+k*.15,ry);kput('vPost',[p[0],y+.15+k*.28,p[1]],vQ(ry,0,Math.PI/2),[.14,L,.14],dCol(DPAL.wood));}}
// Live-oak vault trees are the biome's job; the kit has none.

// ---------------------------------------------------------------- fauna (round 6)
// A registry of animal builders so a ranch, a farm or the life layer can ask for a kind by name and get whatever
// model the kit has for it today: DFAUNA.def('lizard',fn). fn(x,y,z,ry,s,opt) builds in the local frame, standing
// on y, facing ry, at scale s (1 = the species' normal size). Monsters register the same way when they exist.
const DFAUNA={defs:{},def(k,fn,meta){DFAUNA.defs[k]={fn,meta:meta||{}};},kinds:()=>Object.keys(DFAUNA.defs)};
function dnAnimal(kind,x,y,z,ry,s,opt){const D=DFAUNA.defs[kind];if(!D){reportErr('dnAnimal: no such kind '+kind);return;}D.fn(x,y,z,ry||0,s==null?1:s,opt||{});}
// the Dalab lizard: a fat-bodied, striped ground lizard the farms keep for meat and hide — 2.4 m nose to tail at s=1
DFAUNA.def('lizard',function(x,y,z,ry,s,opt){const hide=opt.c||dCol([0x6a8a3a,0x7a9a44,0x8a8a3a,0x5f7f36,0x9a8a4a]),st=dCol([0xd8a838,0xa8382a,0x3f9a88]);const L=(lx,lz)=>loc(x,z,lx,lz,ry);
 const B=.62*s;const b=L(0,0);kput('dHideBall',[b[0],y+B*.55,b[1]],vQ(ry,0,0),[B*.75,B*.55,B*1.2],hide);                                  // body
 for(let k=0;k<4;k++){const p=L(0,-B*.6+k*B*.4);kput('dHideBox',[p[0],y+B*1.05,p[1]],vQ(ry,0,0),[B*.7,B*.08,B*.14],st);}          // stripes
 const t1=L(0,-B*1.4),t2=L(0,-B*2.6);kput('dHideCone',[t1[0],y+B*.5,t1[1]],vQ(ry+Math.PI,Math.PI/2,0),[B*.4,B*1.3,B*.4],hide);   // tail
 kput('dHideCone',[t2[0],y+B*.4,t2[1]],vQ(ry+Math.PI,Math.PI/2,0),[B*.2,B*1.2,B*.2],hide.clone().multiplyScalar(.9));
 const hd=L(0,B*1.35);kput('dHideBall',[hd[0],y+B*.62,hd[1]],vQ(ry,0,0),[B*.42,B*.34,B*.6],hide);                                 // head
 for(const sd of[-1,1]){const e=L(sd*B*.3,B*1.5);vBall('vBall',e[0],y+B*.78,e[1],B*.07,vC(0x1a1a10));}                          // eyes
 for(const sd of[-1,1])for(const lz of[-B*.7,B*.7]){const p=L(sd*B*.85,lz);kput('dHideBox',[p[0],y+B*.28,p[1]],vQ(ry,0,sd*.9),[B*.16,B*.7,B*.16],hide);const f=L(sd*B*1.1,lz+B*.1);kput('dHideBox',[f[0],y+B*.05,f[1]],vQ(ry,0,0),[B*.34,B*.1,B*.3],hide.clone().multiplyScalar(.85));}   // legs, feet
 if(opt.frill){for(let k=0;k<5;k++){const p=L(0,B*.9-k*B*.12);kput('dHideCone',[p[0],y+B*.9,p[1]],null,[B*.06,B*.35,B*.06],st);}}},
 {name:'Dalab lizard',size:2.4,tags:{type:['livestock']}});
// ================================================================= DALAB — dwellings
// Peasants build ROUND: a rammed-earth or scrap drum under a thatch cone, a painted band, one door, a hearth
// window that glows at night. Nobles (the priest-caste's kin) build in grey megalithic stone with relief bands,
// Tiwanaku cornices, murals and banners, on rammed-earth platforms or inside earth-walled compounds, and they
// have The God's light. Front is +z.
const DTAG_SF={type:['single-family dwelling']},DTAG_MF={type:['multi-family dwelling']};

// ---------------------------------------------------------------- PEASANT
// A — round earth hut: rammed-earth drum, red foot and turquoise line, steep thatch cone, hearth window
function buildDalabHutA(G,o){reseed(8101+(o.v|0));const R=3.2,H=2.5;const wood=dCol(DPAL.woodGrey);
 vnReg('Round earth hut (peasant)',0,0,4.8,H+R*1.1+1.4);
 dnRoundHouse(0,0,0,R,H,{roof:'thatch',rise:R*1.15,door:0,win:[.95,-Math.PI*.75],band:'paint',hearth:true,wood});
 vnPaving(0,.02,R+1.6,3,2.4,0,dCol(DPAL.earthDark),4);
 dnJar(R+.9,0,1.2,.32);dnJar(R+1.5,0,.6,.26);dnWoodpile(-R-1.0,0,-.4,Math.PI/2,1.4);vnDryingRack(-1.2,0,R+2.6,0,3.0);
 for(let k=0;k<3;k++)vBall('vGourd',-R*.5+k*.9,H-.35,R+.55,.16,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.22);
 dnFolk(2.2,R+3.2,2,1.0);}
// B — scrap hut: a corrugate drum patched with Ancient plate, a corrugate cone weighted with stones, tarp lean-to
function buildDalabHutB(G,o){reseed(8111+(o.v|0));const R=3.0,H=2.4;const wood=dCol(DPAL.woodGrey);
 vnReg('Scrap hut (peasant)',0,0,5.2,H+R*.9+1);
 vB('vStone',0,-.05,0,R*2.4,.3,R*2.4,0,vC(0x9a8a78));
 dnRoundHouse(0,.25,0,R,H,{wall:'vTank',wallC:null,roof:'scrap',rise:R*.85,door:0,win:[Math.PI*.6],winKind:'shut',hearth:true,wood,foot:false,finial:false});
 // patches of plate over the corrugate, proud and a few degrees off
 for(let k=0;k<7;k++){const a=rr(.5,TAU-.5);const p=dnOnRing(0,0,R+.06+k*.01,a);kput(dPick(['vPlate','vPlateW','vPlate','vBoard']),[p[0],.25+rr(.6,H-.5),p[1]],vQ(a,0,rr(-.1,.1)),[rr(1.0,1.8),rr(.8,1.4),1],null);}
 // timber hoops holding the sheet
 for(const yy of[.7,H-.4])kput('dRopeRing',[0,.25+yy,0],qEuler(Math.PI/2,0,0),[R+.08,R+.08,1],vC(0x6a5a48));
 vnChimney(-R*.5,.25+H+R*.5,-R*.3,1.4,.12,true);
 // lean-to on the +x side
 for(const z of[-1.6,1.6])vPst('vPost',R+2.4,0,z,.07,2.0,wood);kput('vTarpB',[R+1.2,.25+H-.3,0],vQ(0,0,.3),[2.6,.05,3.6],vC(0xb0a080));
 vnBarrel(R+1.6,0,-1.0,.4,.95,wood);vnCrate(R+1.9,0,.7,.8,.2,wood);vnSacks(R+1.0,0,1.5,3);
 dnFolk(-2.6,R+3,2,1.0);}
// C — post house: an oval-ish timber post hall, board walls, shingle hip roof, veranda, a painted gable banner
function buildDalabHutC(G,o){reseed(8121+(o.v|0));const W=7.2,D=5.6,H=2.6,FL=.35;const wood=dCol(DPAL.woodGrey),sh=dCol(DPAL.shingle);
 vnReg('Post house (peasant)',0,0,6.2,FL+H+3.4);
 vB('dEarth',0,-.05,0,W+.8,FL+.05,D+.8,0,dCol(DPAL.earthDark));
 vnFrame(0,FL,0,W,H,D,0,wood,.14);vB('vWood',0,FL,0,W-.1,H,D-.1,0,wood.clone().multiplyScalar(.92));
 dnDrum('dEarthDrum',-W/2,FL,-D/2,1.0,H,dCol(DPAL.earth));dnDrum('dEarthDrum',W/2,FL,-D/2,1.0,H,dCol(DPAL.earth));   // round earth corners at the back
 vnHipRoof('vHipS',0,FL+H,0,W,D,2.6,0,sh,1.1);
 vnVeranda(0,0,D/2+1.0,W-1.2,2.0,0,FL,2.4,wood);vnShedRoof(0,FL+2.4,D/2+1.0,W-1.2,2.0,.5,0,'vShingleB',sh,.4,.24);
 vnDoor(-.8,FL,D/2-.05,0,.95,1.9,'vWood',wood,vC(0x6a5a48),false);
 vnWin(2.0,FL+1.2,D/2-.05,0,.9,.7,'open','vWood',wood,true);dnHearth(2.0,FL+1.2,D/2-.05,0,.9,.7);
 vnWin(-W/2+.05,FL+1.2,.2,-Math.PI/2,.8,.7,'shut','vWood',wood);
 dnMuralBand(0,FL+H-.45,-D/2+.05,Math.PI,W-1.6,.4);dnBanner(-W/2-.9,FL+H+.6,D/2-.6,Math.PI/2,.8,2.2,dCol(DPAL.turq));
 dnJar(W/2+1.0,0,.8,.3);dnWoodpile(W/2+1.1,0,-1.4,0,1.2);vnPlanter(-W/2+1.4,0,D/2+2.6,1.6,.7,0,wood);
 dnFolk(1.5,D/2+4,2,1.2);}
// D — family compound: a low earth wall round two huts and a granary, a shared hearth in the yard
function buildDalabCompound(G,o){reseed(8131+(o.v|0));const CW=17,CD=15;const wood=dCol(DPAL.woodGrey);
 vnReg('Family compound (peasant)',0,0,11.5,7);vnReg('Compound wall',0,0,11.8,1.8,Object.assign({part:'wall'},DTAG_MF));
 dnEarthWall(0,0,0,CW,CD,0,1.5,2.4,{t:.7,lintel:false});
 dnRoundHouse(-4.2,0,-2.6,2.8,2.3,{roof:'thatch',rise:3.0,door:.5,win:[1.5],band:'paint',hearth:true,wood});
 dnRoundHouse(4.0,0,-3.2,2.4,2.2,{roof:'thatch',rise:2.6,door:-.6,win:[Math.PI*1.3],band:'paint',wood});
 dnGranary(3.8,0,3.6,1.3,1.8,{door:Math.PI*.9});
 dnFirePit(-1.6,0,3.0,.7);for(let k=0;k<3;k++)vB('vWood',-3.4+k*1.6,.35,4.8,1.3,.1,.35,0,wood);   // benches
 dnJar(-6.2,0,3.8,.3);dnJar(-5.6,0,4.6,.26);dnWoodpile(6.6,0,-.5,Math.PI/2,1.3);vnDryingRack(-5.0,0,6.0,0,2.6);
 vnPaving(0,.02,CD/2+1.8,3.2,3,0,dCol(DPAL.earthDark),5);dnFolk(0,1.2,3,1.6);dnFolk(1.5,CD/2+3.4,2,1.2);}

// ---------------------------------------------------------------- NOBLE
// A — stone hall: two storeys of grey ashlar on a rammed-earth platform; relief plinth band, Tiwanaku cornices,
//     a trilithon door, a mural frieze, a round shingle-coned tower at one corner, banners; The God's light
function buildDalabNobleA(G,o){reseed(8201+(o.v|0));const W=14,D=11,H1=4.2,H2=3.4,Y0=1.0;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Stone hall (noble)',0,0,12.5,Y0+H1+H2+5);
 dnPlatform(0,0,0,W+8,D+7,Y0,0);vnStairs(0,0,D/2+3.5+1.0,0,4.0,Y0,4,'vStone',st);
 vB('vStone',0,Y0,0,W,H1,D,0,st);dnReliefBand(0,Y0+.3,D/2,0,W-1.0,1.1,st);for(const s of[-1,1])dnReliefBand(s*W/2,Y0+.3,0,s*Math.PI/2,D-1,1.1,st);
 const c1=dnCornice(0,Y0+H1,0,W,D,0,st,2);
 vB('vStone',0,c1,0,W-1.2,H2,D-1.2,0,st.clone().multiplyScalar(1.04));dnMuralBand(0,c1+.9,D/2-.6,0,W-3.2,2.0);
 const c2=dnCornice(0,c1+H2,0,W-1.2,D-1.2,0,st,3);vB('vStone',0,c2,0,W-1.0,.5,D-1.0,0,stD);   // parapet
 vnPyrRoof('vPyrSh',0,c2+.5,0,W-2.4,D-2.4,2.2,0,sh,.2);
 dnGate(0,Y0,D/2+.1,0,1.9,3.0,st);vnDoor(0,Y0,D/2,0,1.7,2.9,'vStone',st,vC(0x4a2e1c),false);
 for(const x of[-4.6,-2.8,2.8,4.6])dnGodWin(x,Y0+1.8,D/2,0,1.0,1.4,'vStone',st);for(const s of[-1,1])for(const z of[-3,0,3])dnGodWin(s*W/2,Y0+1.8,z,s*Math.PI/2,1.0,1.4,'vStone',st);
 for(const x of[-4,0,4])dnGodWin(x,c1+.9,-(D-1.2)/2,Math.PI,1.0,1.2,'vStone',st);for(const s of[-1,1])for(const z of[-2.4,2.4])dnGodWin(s*(W-1.2)/2,c1+.9,z,s*Math.PI/2,.9,1.2,'vStone',st);
 for(const x of[-2.2,2.2])dnGodLamp(x,Y0+3.5,D/2,0);
 // the tower
 {const tx=-W/2+1.6,tz=-D/2+1.6,TH=Y0+H1+H2+2.2;dnDrum('dStoneDrum',tx,Y0,tz,2.6,TH-Y0,st);dnDrum('dReliefDrum',tx,TH-2.2,tz,2.66,.9,st);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const p=dnOnRing(tx,tz,2.6,a);dnGodWin(p[0],TH-4.4,p[1],a,.7,1.2,'vStone',st);}
  kput('dConeSh',[tx,TH-.3,tz],null,[3.3,3.6,3.3],sh);vBall('dGiltBall',tx,TH+3.4,tz,.25);}
 for(const s of[-1,1])dnBannerPole(s*(W/2+2.2),Y0,D/2+2.6,0,7,dCol(s<0?DPAL.red:DPAL.turq));
 dnStele(-5.5,Y0,D/2+5.0,0,2.8,st);dnStele(5.5,Y0,D/2+5.0,0,2.8,st);
 vnPlanter(-3.2,Y0,D/2+4.2,2.2,.8,0,wood);vnPlanter(3.2,Y0,D/2+4.2,2.2,.8,0,wood);
 dnFolk(0,D/2+9,3,1.6);}
// B — great roundhouse: a stone drum on a turfed earth platform, ring veranda, shingle cone with a gilt finial,
//     mural frieze, The God's light at the door and in the windows; a round kitchen hut beside it
function buildDalabNobleB(G,o){reseed(8211+(o.v|0));const R=8,H=5,Y0=.9;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Great roundhouse (noble)',0,0,14,Y0+H+9);
 kput('dTurfDrum',[0,-.05,0],null,[R+7,Y0,R+7],dCol(DPAL.turf));dnDrum('dEarthDrum',0,Y0-.35,0,R+3.2,.35,dCol(DPAL.earthDark));
 vnStairs(0,0,R+7+.9,0,3.6,Y0,4,'vStone',st);
 dnRoundHouse(0,Y0,0,R,H,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:7,roofC:sh,door:0,doorW:1.6,doorH:2.7,frame:'vStone',win:[.7,-.7,Math.PI/2,-Math.PI/2,Math.PI*.75,-Math.PI*.75],lit:true,band:'mural',wood,leafC:vC(0x4a2e1c)});
 dnDrum('dReliefDrum',0,Y0+.3,0,R+.08,1.0,st);
 // ring veranda: stone posts carrying a shingle skirt
 {const n=18;for(let k=0;k<n;k++){const a=k/n*TAU;const p=dnOnRing(0,0,R+2.2,a);vPst('vPostS',p[0],Y0,p[1],.22,3.0,st);}
  kput('dConeSh',[0,Y0+2.95,0],null,[R+3.0,3.4,R+3.0],sh.clone().multiplyScalar(.9));dnDrum('vWood',0,Y0+2.8,0,R+2.5,.22,wood);}
 for(const a of[.35,-.35]){const p=dnOnRing(0,0,R,a);dnGodLamp(p[0],Y0+3.4,p[1],a);}
 for(const a of[Math.PI*.5,-Math.PI*.5]){const p=dnOnRing(0,0,R+4.4,a);dnBannerPole(p[0],Y0,p[1],a,6.5,dCol(a>0?DPAL.gold:DPAL.red));}
 dnRoundHouse(R+5.6,0,-3.5,2.4,2.3,{roof:'thatch',rise:2.6,door:-.9,band:'paint',wood:dCol(DPAL.woodGrey)});   // the kitchen
 dnFirePit(R+5.2,0,1.8,.6);dnJar(R+3.2,0,3.2,.3);
 dnStele(-2.8,0,R+9.5,0,3.0,st);dnStele(2.8,0,R+9.5,0,3.0,st);vnPaving(0,.02,R+9.4,3,3.6,0,st,6);
 dnFolk(0,R+12,3,1.6);}
// C — earth-walled manor: a rammed-earth compound with a relief gate; inside, a timber hall on a stone plinth
//     under a shingle gable, a stone drum tower, a shrine stele and a garden; The God's light on the hall
function buildDalabNobleC(G,o){reseed(8221+(o.v|0));const CW=26,CD=22;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle),earth=dCol(DPAL.earth);
 vnReg('Earth-walled manor (noble)',0,0,17,12);vnReg('Manor wall',0,0,17.5,3.2,Object.assign({part:'wall'},DTAG_SF));
 dnEarthWall(0,0,0,CW,CD,0,3.0,3.2,{c:earth,relief:true,stoneGate:true});
 // the hall, back of the court
 {const W=13,D=8,H=3.8,Y0=.7,hz=-CD/2+D/2+2.2;vB('vStone',0,0,hz,W+1.2,Y0,D+1.2,0,st);dnReliefBand(0,.1,hz+D/2+.6,0,W-1,.5,st);
  vnFrame(0,Y0,hz,W,H,D,0,wood,.18);vB('vWood',0,Y0,hz,W-.12,H,D-.12,0,wood.clone().multiplyScalar(.9));
  dnMuralBand(0,Y0+H-1.5,hz+D/2-.02,0,W-2,1.3);
  vnGableRoof(0,Y0+H,hz,W,D,3.0,0,'vGableS',sh,1.1,'vGableW',wood,.3);
  vnDoor(0,Y0,hz+D/2,0,1.4,2.4,'vWood',wood,vC(0x4a2e1c));vnStairs(0,0,hz+D/2+1.2,0,2.6,Y0,3,'vStone',st);
  for(const x of[-4.2,-2.2,2.2,4.2])dnGodWin(x,Y0+1.3,hz+D/2,0,1.0,1.2,'vWood',wood);for(const s of[-1,1])dnGodWin(s*W/2,Y0+1.3,hz,s*Math.PI/2,1.0,1.2,'vWood',wood);
  for(const x of[-3.4,3.4])dnGodLamp(x,Y0+3.0,hz+D/2,0);}
 // the tower, +x side
 {const tx=CW/2-4.2,tz=1.5,TH=9;dnDrum('dStoneDrumB',tx,0,tz,2.8,TH,st);dnDrum('dReliefDrum',tx,TH-1.4,tz,2.7,.9,st);
  for(let k=0;k<3;k++){const a=k*TAU/3+.5;const p=dnOnRing(tx,tz,2.65,a);dnGodWin(p[0],TH-3.6,p[1],a,.7,1.1,'vStone',st);}
  kput('dConeSh',[tx,TH-.3,tz],null,[3.4,3.4,3.4],sh);vBall('dGiltBall',tx,TH+3.2,tz,.22);
  const dp=dnOnRing(tx,tz,2.8,Math.PI*.5+.9);vnDoor(dp[0],0,dp[1],Math.PI*.5+.9,1.0,2.0,'vStone',st,vC(0x4a2e1c),false);}
 // garden: planters, a shrine stele, a round well
 vnPlanter(-CW/2+3.5,0,2,4,1.2,0,wood);vnPlanter(-CW/2+3.5,0,5.5,4,1.2,0,wood);vnPlanter(-CW/2+3.5,0,-2,4,1.2,0,wood);
 dnStele(-4.5,0,CD/2-3,0,2.6,st);dnDrum('dStoneDrum',3.5,0,CD/2-4,1.1,.9,st);dnDrum('vDarkB',3.5,.9,CD/2-4,.85,.1,null);
 vnPaving(0,.02,CD/2-6,3,8,0,st,10);vnPaving(0,.02,CD/2+2,3.4,3,0,st,5);
 dnGodPost(-2.8,0,CD/2+1.2,3.4);dnGodPost(2.8,0,CD/2+1.2,3.4);
 dnFolk(0,CD/2+4.5,3,1.6);dnFolk(0,-2,2,2);}

dDef({key:'dalab_hut_a',name:'Round earth hut',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:10,d:10,h:8,build:buildDalabHutA});
dDef({key:'dalab_hut_b',name:'Scrap hut',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:12,d:10,h:6,build:buildDalabHutB});
dDef({key:'dalab_hut_c',name:'Post house',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_SF),w:12,d:12,h:7,build:buildDalabHutC});
dDef({key:'dalab_compound',name:'Family compound',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:20,d:20,h:7,build:buildDalabCompound});
dDef({key:'dalab_noble_a',name:'Stone hall',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:28,d:26,h:17,build:buildDalabNobleA});
dDef({key:'dalab_noble_b',name:'Great roundhouse',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:34,d:34,h:15,build:buildDalabNobleB});
dDef({key:'dalab_noble_c',name:'Earth-walled manor',family:'dwelling',tags:Object.assign({wealth:'noble',lit:true},DTAG_SF),w:30,d:28,h:13,build:buildDalabNobleC});
// ================================================================= HIGHLANDS — textures
// The Highlands kit sits on top of the Iziz Vernacular helpers (69b/69c, vendored) and adds the materials of a
// temperate, wooden, mountain culture: round logs, split shingle and fish-scale slate, fieldstone socles, turf,
// bamboo, and — the signature of the style — PAINTED CARVING: formline crests, totem columns and fretwork lace.
//
// Two kinds of map, as in the vernacular set:
//  * near-grey + warm maps (logs, scale, rubble, turf, bamboo, lace) that the per-instance colour tints — one
//    log map serves raw pine, tarred spruce and red-painted boards;
//  * COLOUR-CARRYING maps (formline, totem, clock, wing) painted in their final palette and never tinted: the
//    black / red / teal of the carving is what it is, like salvage in the vernacular set.
// Canvas sizes are chosen at 64 px per metre for the world-UV maps (vWorldUV K = tiles per metre).

// ---------------------------------------------------------------- formline palette (NW-coast inspired)
const HFORM={black:'#171311',red:'#b3322a',teal:'#2e9488',tealD:'#1f6f68',white:'#efe7d6',cedar:'#b27a4c',cedarD:'#8a5634',ochre:'#d19a3a'};

// ---------------------------------------------------------------- wood: round logs (horizontal), 2 m tile, 6 courses
TEX.logs=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const LH=w/6;   // ~0.33 m logs
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/LH),fy=(y%LH)/LH;
  const round=Math.sin(Math.PI*fy);                                        // rounded log: lit crown, dark top/bottom
  let v=112+round*92+(h3(row*3.1,0,2.2)-.5)*30;
  v+=(fbm(x/26,y/2.2,row*1.7,2)-.5)*30;                                    // grain along the log
  if(fy<.08||fy>.94)v=58+(fbm(x/4,y/4,1,1)-.5)*16;                          // chinking (moss/clay) between courses
  const check=fbm(x/40,y/1.2,row*3.3,2);if(check>.7&&fy>.3&&fy<.6)v-=(check-.7)*140;   // drying checks
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.78;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fish-scale shingle / slate: 2 m tile, 0.25 m scales
TEX.scale=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/S),off=(row%2)*S/2;const sx=Math.floor((x+off)/S);
  const fx=((x+off)%S)/S-.5,fy=(y%S)/S;const r=Math.hypot(fx,(fy-.35)*1.1);   // round bottom of each scale
  let v=176+(h3(sx*2.3,row*1.9,4.1)-.5)*48+(fbm(x/4,y/4,2.2,1)-.5)*14;
  if(r>.46&&fy>.45)v-=70;else if(r>.4&&fy>.4)v-=26;                          // the shadowed rim of the scale above
  if(fy<.08)v-=30;
  d[i]=v;d[i+1]=v;d[i+2]=v*1.02;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- fieldstone (rubble) socle: 4 m tile
TEX.rubble=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const pts=[];for(let k=0;k<70;k++){const px=h3(k,1.3,2.7)*w,py=h3(k,4.1,.7)*h;for(const ox of[-w,0,w])for(const oy of[-h,0,h])pts.push([px+ox,py+oy,k]);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let d1=1e9,d2=1e9,id1=0;
  for(const p of pts){const dx=(x-p[0])*.8,dy=y-p[1];const dd=dx*dx+dy*dy;if(dd<d1){d2=d1;d1=dd;id1=p[2];}else if(dd<d2)d2=dd;}
  const edge=Math.sqrt(d2)-Math.sqrt(d1);let v;
  if(edge<3.2)v=92+(fbm(x/3,y/3,2,1)-.5)*20;                                 // deep mortar
  else{v=150+(h3(id1,7.7,1.1)-.5)*70+Math.min(20,edge*2)+(fbm(x/9,y/9,id1,2)-.5)*26;}
  const tint=h3(id1,2.2,9.9);d[i]=v*(1+(tint-.5)*.12);d[i+1]=v*.97;d[i+2]=v*(.92-(tint-.5)*.08);d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- turf (sod roofs): 2 m tile
TEX.turf=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/14,y/14,3.3,3),n2=fbm(x/2,y/5,7.1,2);
  const bare=clamp((fbm(x/30,y/30,9.1,2)-.58)*5,0,1);
  let r=90+n*50+n2*30,gg=120+n*60+n2*40,b=60+n*20;
  r=lerp(r,120+n2*30,bare);gg=lerp(gg,100+n2*20,bare);b=lerp(b,70,bare);
  d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- bamboo: culm (vertical, nodes every ~0.45 m) and woven mat
TEX.bambooV=canvasTex(64,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const fy=(y%29)/29;
  let v=196+(fbm(x/2,y/30,1.3,2)-.5)*30+Math.sin(x/w*TAU*4)*6;
  if(fy<.07)v=120;else if(fy<.14)v=222;                                      // node ring + its lit swelling
  d[i]=v*.96;d[i+1]=v*.93;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.bmat=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=16;   // 0.25 m weave
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const cx=Math.floor(x/S),cy=Math.floor(y/S);const over=(cx+cy)%2;
  const f=over?(x%S)/S:(y%S)/S;let v=180+Math.sin(f*Math.PI)*40+(fbm(x/3,y/3,5,1)-.5)*20;
  const e=over?(y%S):(x%S);if(e<1||e>S-2)v-=60;
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.66;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- the painted carving: formline primitives
// A formline design is built from a few units — OVOID, U-FORM, SPLIT-U, TRIGON negative spaces — joined by a
// heavy black primary line that swells and tapers, with red secondary and teal tertiary fills. These helpers draw
// them on a 2D canvas in canvas units (y down). Everything is symmetric: draw the left half, then hlMirror().
function hlOvoidPath(g,cx,cy,w,h){g.beginPath();
 g.moveTo(cx-w/2,cy+h*.1);
 g.bezierCurveTo(cx-w/2,cy-h*.62,cx+w/2,cy-h*.62,cx+w/2,cy+h*.1);             // domed top
 g.bezierCurveTo(cx+w/2,cy+h*.55,cx+w*.22,cy+h*.52,cx,cy+h*.36);             // concave underside rises to the centre
 g.bezierCurveTo(cx-w*.22,cy+h*.52,cx-w/2,cy+h*.55,cx-w/2,cy+h*.1);g.closePath();}
function hlOvoid(g,cx,cy,w,h,line,fill,lw){hlOvoidPath(g,cx,cy,w,h);if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw||Math.max(2,w*.14);g.strokeStyle=line;g.stroke();}}
function hlUForm(g,cx,cy,w,h,col,lw){g.beginPath();g.moveTo(cx-w/2,cy-h/2);g.bezierCurveTo(cx-w/2,cy+h*.7,cx+w/2,cy+h*.7,cx+w/2,cy-h/2);
 g.lineWidth=lw||w*.22;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function hlSplitU(g,cx,cy,w,h,col,lw){hlUForm(g,cx,cy,w,h,col,lw);g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx,cy+h*.12);g.lineWidth=(lw||w*.22)*.7;g.strokeStyle=HFORM.white;g.stroke();}
function hlEye(g,cx,cy,w,h,socket){   // eye socket (teal or red), lid ovoid in black, white eyeball, black pupil ovoid
 hlOvoid(g,cx,cy,w,h,HFORM.black,socket||HFORM.teal,w*.12);
 hlOvoid(g,cx,cy+h*.06,w*.64,h*.5,HFORM.black,HFORM.white,w*.07);
 hlOvoid(g,cx,cy+h*.08,w*.34,h*.3,null,HFORM.black);}
function hlSwoop(g,pts,col,lw){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i+2<pts.length+1;i+=3)g.bezierCurveTo(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],pts[i+2][0],pts[i+2][1]);
 g.lineWidth=lw;g.strokeStyle=col;g.lineCap='round';g.stroke();g.lineCap='butt';}
function hlTrigon(g,x,y,s,col){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+s*.5,y+s*.1,x+s,y);g.quadraticCurveTo(x+s*.6,y+s*.4,x+s*.5,y+s);g.quadraticCurveTo(x+s*.4,y+s*.4,x,y);g.fillStyle=col;g.fill();}
// draw fn(g) on the left half, then mirror it onto the right half
function hlMirror(g,w,h,cx,fn){g.save();fn(g);g.restore();g.save();g.translate(2*cx,0);g.scale(-1,1);fn(g);g.restore();}
// wood grain under a painted design (cedar), vertical or horizontal
function hlCedar(g,w,h,base,vert){g.fillStyle=base||HFORM.cedar;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=vert?fbm(x/2.5,y/40,3.3,2):fbm(x/40,y/2.5,3.3,2);const k=.82+n*.34;d[i]*=k;d[i+1]*=k;d[i+2]*=k;}
 g.putImageData(id,0,0);}
// A crest face (human/spirit). NOT used by default (Travis: too creepy) — kept for specific buildings later. o: {beak, teeth, ears, tongue, socket, brow, cheek}
function hlFace(g,cx,cy,W,H,o){o=o||{};const S=W/2;
 hlMirror(g,W,H,cx,g=>{
  // head outline: heavy black formline around the face, open at the chin
  hlSwoop(g,[[cx,cy-H*.5],[cx-S*.55,cy-H*.52],[cx-S*.98,cy-H*.36],[cx-S*.96,cy-H*.02],[cx-S*.95,cy+H*.25],[cx-S*.78,cy+H*.44],[cx-S*.5,cy+H*.48]],HFORM.black,W*.05);
  if(o.ears!==false){hlUForm(g,cx-S*.7,cy-H*.46,S*.36,H*.18,HFORM.red,S*.08);hlOvoid(g,cx-S*.7,cy-H*.5,S*.16,H*.08,null,HFORM.black);}
  // brow: a thick black arch over the eye
  hlSwoop(g,[[cx-S*.08,cy-H*.2],[cx-S*.22,cy-H*.34],[cx-S*.62,cy-H*.36],[cx-S*.8,cy-H*.18]],HFORM.black,H*.06);
  hlEye(g,cx-S*.43,cy-H*.1,S*.56,H*.2,o.socket);
  // cheek: red U-form under the eye, teal trigon in the cheek
  hlUForm(g,cx-S*.46,cy+H*.08,S*.5,H*.12,o.cheek||HFORM.red,S*.08);
  hlTrigon(g,cx-S*.82,cy+H*.02,S*.18,HFORM.teal);
  // flank: a small ovoid joint in the outer cheek
  hlOvoid(g,cx-S*.8,cy+H*.24,S*.2,H*.12,HFORM.black,HFORM.red,S*.04);
 });
 // nose / beak (on the axis)
 if(o.beak){g.beginPath();g.moveTo(cx-S*.16,cy-H*.12);g.quadraticCurveTo(cx+S*.02,cy+H*.02,cx+S*.02,cy+H*.4);g.quadraticCurveTo(cx-S*.02,cy+H*.46,cx-S*.08,cy+H*.38);
  g.quadraticCurveTo(cx,cy+H*.1,cx-S*.16,cy-H*.12);g.fillStyle=HFORM.black;g.fill();
  g.beginPath();g.moveTo(cx+S*.16,cy-H*.12);g.quadraticCurveTo(cx+S*.02,cy+H*.02,cx+S*.02,cy+H*.4);g.lineWidth=S*.05;g.strokeStyle=HFORM.black;g.stroke();
  hlSplitU(g,cx,cy-H*.02,S*.22,H*.14,HFORM.red,S*.06);}
 else{hlSplitU(g,cx,cy+H*.02,S*.3,H*.16,HFORM.red,S*.09);
  hlOvoid(g,cx-S*.1,cy+H*.14,S*.12,H*.07,null,HFORM.black);hlOvoid(g,cx+S*.1,cy+H*.14,S*.12,H*.07,null,HFORM.black);}
 // mouth: red lips around a black mouth, white teeth
 const mw=S*(o.beak?.6:.95),my=cy+H*.32;
 g.beginPath();g.ellipse(cx,my,mw*.62,H*.09,0,0,TAU);g.fillStyle=HFORM.red;g.fill();
 g.beginPath();g.ellipse(cx,my,mw*.5,H*.055,0,0,TAU);g.fillStyle=HFORM.black;g.fill();
 if(o.teeth!==false){g.fillStyle=HFORM.white;const n=6;for(let k=0;k<n;k++){const tx=cx-mw*.42+mw*.84*(k+.5)/n;g.fillRect(tx-mw*.05,my-H*.045,mw*.1,H*.03);g.fillRect(tx-mw*.05,my+H*.015,mw*.1,H*.03);}}
 if(o.tongue){g.beginPath();g.moveTo(cx-S*.06,my);g.quadraticCurveTo(cx,my+H*.22,cx+S*.06,my);g.fillStyle=HFORM.red;g.fill();}}

// ---------------------------------------------------------------- the animals (the kit's default subjects)
// Travis, round 1: the crest FACE (hlFace) read as creepy; the default carving is naturalistic animals in
// formline — salmon, orca, thunderbird, and on the poles eagle, bear and frog. hlFace stays in the kit for
// buildings that later ask for a specific (human/spirit) depiction; nothing uses it by default.
// Each animal draws in its own unit box (the numbers below), placed with hlIn(g,x,y,w,h, fn).
function hlIn(g,x,y,w,h,uw,uh,fn){g.save();g.translate(x,y);g.scale(w/uw,h/uh);fn(g);g.restore();}
function hlFill(g,col){g.fillStyle=col;g.fill();}
function hlLine(g,col,lw){g.lineWidth=lw;g.strokeStyle=col;g.lineJoin='round';g.stroke();}
// SALMON in profile facing +x, box 200 x 80: red body, black formline, teal gill ovoid
function hlSalmon(g){g.beginPath();g.moveTo(192,40);g.bezierCurveTo(172,14,96,8,44,28);g.lineTo(10,12);g.quadraticCurveTo(20,40,10,68);g.lineTo(44,52);g.bezierCurveTo(96,72,172,66,192,40);g.closePath();
 hlFill(g,HFORM.red);hlLine(g,HFORM.black,5);
 g.beginPath();g.moveTo(96,16);g.quadraticCurveTo(104,2,122,6);g.quadraticCurveTo(116,12,118,17);hlFill(g,HFORM.black);          // dorsal fin
 g.beginPath();g.moveTo(104,62);g.quadraticCurveTo(110,76,126,74);g.quadraticCurveTo(120,68,122,61);hlFill(g,HFORM.black);        // ventral fin
 hlOvoid(g,160,40,34,34,HFORM.black,HFORM.teal,5);hlOvoid(g,168,34,14,11,HFORM.black,HFORM.white,3);hlOvoid(g,169,35,6,5,null,HFORM.black);   // gill + eye
 g.beginPath();g.moveTo(192,40);g.lineTo(178,44);hlLine(g,HFORM.black,3);                                                          // mouth
 hlUForm(g,120,34,22,22,HFORM.black,5);hlUForm(g,90,36,20,20,HFORM.black,5);hlOvoid(g,62,40,16,12,HFORM.black,HFORM.teal,3);    // body formline
 hlSplitU(g,26,40,14,30,HFORM.black,5);}                                                                                           // tail
// ORCA in profile facing +x, box 200 x 100: black body, white belly and eye patch, tall dorsal fin, red formline
function hlOrca(g){g.beginPath();g.moveTo(196,58);g.bezierCurveTo(186,36,150,30,110,32);g.bezierCurveTo(76,34,46,40,30,50);
 g.quadraticCurveTo(16,40,4,30);g.quadraticCurveTo(12,52,6,74);g.quadraticCurveTo(18,64,32,58);g.bezierCurveTo(62,72,120,80,160,72);g.bezierCurveTo(180,68,192,64,196,58);g.closePath();hlFill(g,HFORM.black);
 g.beginPath();g.moveTo(98,34);g.quadraticCurveTo(90,16,84,2);g.quadraticCurveTo(108,12,122,32);hlFill(g,HFORM.black);          // dorsal fin
 g.beginPath();g.ellipse(142,68,32,6,.05,0,TAU);hlFill(g,HFORM.white);g.beginPath();g.ellipse(160,45,10,4,-.1,0,TAU);hlFill(g,HFORM.white);
 hlOvoid(g,176,49,10,8,null,HFORM.white);hlOvoid(g,177,50,5,4,null,HFORM.black);                                                   // eye
 g.beginPath();g.moveTo(196,58);g.quadraticCurveTo(186,62,172,60);hlLine(g,HFORM.red,3);                                          // mouth
 g.beginPath();g.moveTo(140,68);g.quadraticCurveTo(128,84,122,96);g.quadraticCurveTo(142,90,152,70);hlFill(g,HFORM.black);       // pectoral fin
 hlUForm(g,137,82,10,12,HFORM.red,3);hlOvoid(g,146,62,16,12,HFORM.red,HFORM.teal,3);                                                // fin joint
 hlUForm(g,100,48,22,18,HFORM.red,4);hlUForm(g,70,50,18,16,HFORM.red,4);hlSplitU(g,97,26,8,12,HFORM.red,3);hlSplitU(g,16,52,8,24,HFORM.red,3);}
// THUNDERBIRD, frontal with wings spread and the head turned in profile, box 200 x 100
function hlThunderbird(g){
 hlMirror(g,200,100,100,g=>{for(let k=0;k<5;k++){const x=12+k*15,y=64-k*5;hlUForm(g,x,y,13,34,k%2?HFORM.red:HFORM.black,3.6);}   // wing feathers
  hlSwoop(g,[[4,82],[16,34],[52,22],[86,38]],HFORM.black,7);hlOvoid(g,62,40,16,12,HFORM.black,HFORM.teal,3);                       // wing edge + shoulder joint
  hlUForm(g,90,90,8,16,HFORM.black,3);});                                                                                          // tail feathers
 hlOvoid(g,100,58,30,52,HFORM.black,HFORM.red,5);hlUForm(g,100,52,14,12,HFORM.black,4);hlUForm(g,100,68,12,10,HFORM.black,4);      // body
 for(const s of[-1,1]){g.beginPath();g.moveTo(100+s*6,82);g.lineTo(100+s*12,96);hlLine(g,HFORM.black,3);}                          // legs
 hlOvoid(g,100,22,26,22,HFORM.black,HFORM.white,4);hlOvoid(g,96,21,9,7,null,HFORM.black);                                          // head
 g.beginPath();g.moveTo(90,18);g.quadraticCurveTo(70,16,66,28);g.quadraticCurveTo(74,24,80,30);g.quadraticCurveTo(84,26,90,27);hlFill(g,HFORM.black);   // hooked beak (profile, to -x)
 g.beginPath();g.moveTo(104,12);g.quadraticCurveTo(112,0,122,4);g.quadraticCurveTo(114,8,110,14);hlFill(g,HFORM.red);}              // crest plume
// BEAR walking in profile facing +x, box 200 x 100
function hlBear(g){g.beginPath();g.moveTo(40,40);g.bezierCurveTo(60,20,120,18,150,30);g.quadraticCurveTo(160,24,172,30);g.lineTo(196,44);g.quadraticCurveTo(190,54,176,54);
 g.quadraticCurveTo(160,56,152,60);g.lineTo(156,94);g.lineTo(138,94);g.lineTo(134,68);g.quadraticCurveTo(100,74,70,68);g.lineTo(66,94);g.lineTo(48,94);g.lineTo(44,64);g.quadraticCurveTo(28,56,40,40);g.closePath();
 hlFill(g,HFORM.black);
 g.beginPath();g.arc(160,26,7,0,TAU);hlFill(g,HFORM.black);g.beginPath();g.arc(160,26,3.5,0,TAU);hlFill(g,HFORM.red);             // ear
 hlOvoid(g,172,38,10,8,null,HFORM.white);hlOvoid(g,173,39,5,4,null,HFORM.black);g.beginPath();g.arc(195,45,3,0,TAU);hlFill(g,HFORM.red);   // eye, nose
 hlOvoid(g,140,48,22,18,HFORM.red,HFORM.teal,3);hlOvoid(g,62,48,22,18,HFORM.red,HFORM.teal,3);                                     // shoulder and hip joints
 hlUForm(g,146,80,10,16,HFORM.red,3);hlUForm(g,57,80,10,16,HFORM.red,3);hlUForm(g,100,44,26,14,HFORM.red,4);
 for(const x of[138,48])for(let k=0;k<3;k++){g.beginPath();g.moveTo(x+4+k*5,94);g.lineTo(x+6+k*5,99);hlLine(g,HFORM.white,2);}}   // claws
function hlGround(g,w,h,white){if(white){g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);}else hlCedar(g,w,h,HFORM.cedar,false);}

// ---------------------------------------------------------------- crest panels (colour-carrying, plane UV 0..1)
// FORM_A: two salmon nose to nose round a teal ovoid, on cedar — façades, lintels, door boards.
TEX.formA=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);
 hlMirror(g,w,h,w/2,g=>hlIn(g,w*.03,h*.2,w*.44,h*.6,200,80,hlSalmon));hlOvoid(g,w/2,h*.52,h*.22,h*.2,HFORM.black,HFORM.teal,6);
 g.lineWidth=h*.03;g.strokeStyle=HFORM.black;g.strokeRect(h*.015,h*.015,w-h*.03,h-h*.03);});
// FORM_W: an orca on white over a band of waves — the bold painted house-fronts and the guild boards.
TEX.formW=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,true);hlIn(g,w*.08,h*.08,w*.84,h*.72,200,100,hlOrca);
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;hlUForm(g,cx,h*.86,w*.1,h*.12,k%2?HFORM.teal:HFORM.black,h*.03);}});
// FORM_V: a tall board (1:4) — a stack of ovoids and U-forms (abstract), for pilasters, jambs, menhirs
TEX.formV=canvasTex(128,512,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,true);
 for(let k=0;k<4;k++){const cy=h*(k+.5)/4;
  hlOvoid(g,w/2,cy-h*.03,w*.78,h*.12,HFORM.black,k%2?HFORM.teal:HFORM.red,w*.08);
  hlOvoid(g,w/2,cy-h*.02,w*.4,h*.06,HFORM.black,HFORM.white,w*.05);
  hlUForm(g,w/2,cy+h*.075,w*.7,h*.05,k%2?HFORM.red:HFORM.black,w*.08);}});
// FORM_T: the thunderbird, wings spread across the gable (2:1)
TEX.formT=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);hlIn(g,w*.02,h*.04,w*.96,h*.92,200,100,hlThunderbird);});
// FORM_B: a bear on cedar (2:1) — for the Republic's guild boards and the tribes' hunters
TEX.formB=canvasTex(512,256,(g,w,h)=>{hlGround(g,w,h,false);hlIn(g,w*.06,h*.06,w*.88,h*.84,200,100,hlBear);});
// FORM_F: frieze (4:1, repeats along x) — alternating ovoid and split-U, for eave boards and lintels
TEX.formF=canvasTex(256,64,(g,w,h)=>{hlCedar(g,w,h,HFORM.cedarD,false);
 for(let k=0;k<4;k++){const cx=w*(k+.5)/4;if(k%2){hlOvoid(g,cx,h*.52,w*.18,h*.6,HFORM.black,HFORM.teal,w*.02);hlOvoid(g,cx,h*.55,w*.08,h*.26,null,HFORM.black);}
  else{hlSplitU(g,cx,h*.4,w*.16,h*.52,HFORM.red,w*.035);}}
 g.fillStyle=HFORM.black;g.fillRect(0,0,w,h*.08);g.fillRect(0,h*.92,w,h*.08);});

// ---------------------------------------------------------------- totem column (colour-carrying, wraps a cylinder)
// u runs round the pole with u=0.5 at the FRONT (hTotem instances are yawed so this faces the street), v up.
// Three animals stacked: EAGLE at the top (a great hooked beak, wings folded down the sides), BEAR in the
// middle (round ears, muzzle, forepaws with claws), FROG at the foot (wide mouth, splayed legs).
function hlTotemEagle(g,cx,cy,W,H,sock){
 hlMirror(g,W,H,cx,g=>{g.beginPath();g.moveTo(cx-W*.16,cy-H*.02);g.bezierCurveTo(cx-W*.5,cy+H*.02,cx-W*.5,cy+H*.36,cx-W*.3,cy+H*.46);g.lineTo(cx-W*.12,cy+H*.46);g.closePath();hlFill(g,HFORM.black);   // folded wing
  for(let k=0;k<3;k++)hlUForm(g,cx-W*.34+k*W*.07,cy+H*(.22+k*.06),W*.07,H*.2,HFORM.red,W*.025);
  hlOvoid(g,cx-W*.3,cy+H*.08,W*.12,H*.08,HFORM.black,sock,W*.015);});
 g.beginPath();g.ellipse(cx,cy-H*.2,W*.3,H*.2,0,0,TAU);hlFill(g,HFORM.black);                                                        // head
 hlMirror(g,W,H,cx,g=>{hlOvoid(g,cx-W*.15,cy-H*.24,W*.16,H*.1,null,HFORM.white);hlOvoid(g,cx-W*.14,cy-H*.235,W*.08,H*.05,null,HFORM.black);});
 g.beginPath();g.moveTo(cx-W*.1,cy-H*.14);g.quadraticCurveTo(cx,cy-H*.2,cx+W*.1,cy-H*.14);g.quadraticCurveTo(cx+W*.16,cy+H*.14,cx+W*.02,cy+H*.28);   // beak, curling to a hook
 g.quadraticCurveTo(cx-W*.06,cy+H*.3,cx-W*.04,cy+H*.2);g.quadraticCurveTo(cx+W*.04,cy+H*.2,cx+W*.02,cy+H*.12);g.quadraticCurveTo(cx-W*.12,cy+H*.04,cx-W*.1,cy-H*.14);
 hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,W*.02);g.beginPath();g.ellipse(cx,cy+H*.36,W*.12,H*.08,0,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,W*.02);}   // chest
function hlTotemBear(g,cx,cy,W,H,sock){
 hlMirror(g,W,H,cx,g=>{g.beginPath();g.arc(cx-W*.28,cy-H*.34,W*.1,0,TAU);hlFill(g,HFORM.black);g.beginPath();g.arc(cx-W*.28,cy-H*.34,W*.05,0,TAU);hlFill(g,HFORM.red);});
 g.beginPath();g.ellipse(cx,cy-H*.1,W*.38,H*.26,0,0,TAU);hlFill(g,HFORM.black);                                                        // head
 hlMirror(g,W,H,cx,g=>{hlOvoid(g,cx-W*.17,cy-H*.17,W*.16,H*.1,HFORM.red,HFORM.white,W*.02);hlOvoid(g,cx-W*.16,cy-H*.16,W*.08,H*.05,null,HFORM.black);
  hlUForm(g,cx-W*.28,cy-H*.02,W*.1,H*.1,HFORM.red,W*.025);
  g.beginPath();g.ellipse(cx-W*.24,cy+H*.34,W*.13,H*.09,0,0,TAU);hlFill(g,HFORM.black);                                                // forepaws
  for(let k=0;k<4;k++){g.beginPath();g.moveTo(cx-W*.33+k*W*.055,cy+H*.4);g.lineTo(cx-W*.34+k*W*.055,cy+H*.46);hlLine(g,HFORM.white,W*.016);}});
 g.beginPath();g.ellipse(cx,cy+H*.02,W*.15,H*.12,0,0,TAU);hlFill(g,'#d9b48a');hlLine(g,HFORM.red,W*.02);                               // muzzle
 g.beginPath();g.ellipse(cx,cy-H*.05,W*.07,H*.04,0,0,TAU);hlFill(g,HFORM.black);
 g.beginPath();g.moveTo(cx-W*.08,cy+H*.06);g.quadraticCurveTo(cx,cy+H*.11,cx+W*.08,cy+H*.06);hlLine(g,HFORM.black,W*.02);
 g.beginPath();g.ellipse(cx,cy+H*.32,W*.12,H*.1,0,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,W*.02);}                          // belly between the paws
function hlTotemFrog(g,cx,cy,W,H,sock){
 hlMirror(g,W,H,cx,g=>{hlSwoop(g,[[cx-W*.2,cy+H*.1],[cx-W*.44,cy+H*.1],[cx-W*.46,cy+H*.34],[cx-W*.3,cy+H*.44]],HFORM.black,W*.07);    // legs
  for(let k=0;k<3;k++){g.beginPath();g.arc(cx-W*.36+k*W*.05,cy+H*.45,W*.025,0,TAU);hlFill(g,HFORM.black);}});
 g.beginPath();g.ellipse(cx,cy+H*.06,W*.34,H*.3,0,0,TAU);hlFill(g,'#3f8f5a');hlLine(g,HFORM.black,W*.03);                              // body
 hlMirror(g,W,H,cx,g=>{g.beginPath();g.arc(cx-W*.17,cy-H*.24,W*.1,0,TAU);hlFill(g,HFORM.white);hlLine(g,HFORM.black,W*.025);
  g.beginPath();g.arc(cx-W*.16,cy-H*.23,W*.05,0,TAU);hlFill(g,HFORM.black);hlOvoid(g,cx-W*.2,cy+H*.14,W*.1,H*.07,HFORM.black,HFORM.teal,W*.015);});
 g.beginPath();g.moveTo(cx-W*.26,cy-H*.04);g.quadraticCurveTo(cx,cy+H*.1,cx+W*.26,cy-H*.04);hlLine(g,HFORM.black,W*.035);            // the wide frog smile
 hlUForm(g,cx,cy+H*.22,W*.14,H*.1,HFORM.red,W*.03);}
function hlTotemTex(seed,cols){return canvasTex(256,1024,(g,w,h)=>{hlCedar(g,w,h,cols.base,true);
 const figs=[hlTotemEagle,hlTotemBear,hlTotemFrog];
 for(let k=0;k<3;k++){figs[k](g,w/2,h*(k+.5)/3,w*.62,h*.3,k===1?HFORM.red:cols.socket);
  g.fillStyle=HFORM.black;g.fillRect(0,h*(k+1)/3-h*.006,w,h*.012);}});}
TEX.totem=hlTotemTex(0,{base:HFORM.cedar,socket:HFORM.teal});
TEX.totemP=hlTotemTex(1,{base:'#d8cdb4',socket:HFORM.teal});   // painted ground (the Painted Men)
// a spread wing (thunderbird) with alpha, for crossarms and gable finials
TEX.wing=canvasTex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 g.beginPath();g.moveTo(0,h*.2);g.quadraticCurveTo(w*.5,-h*.1,w,h*.35);g.lineTo(w,h*.6);for(let k=0;k<6;k++){const x=w-(k+1)*w/6;g.quadraticCurveTo(x+w/12,h*(.95-k*.04),x,h*(.62-k*.03));}g.closePath();
 g.fillStyle=HFORM.white;g.fill();g.save();g.clip();
 for(let k=0;k<6;k++){const x=w-(k+.5)*w/6;hlUForm(g,x,h*.62,w*.13,h*.46,k%2?HFORM.red:HFORM.black,w*.03);}
 hlSwoop(g,[[0,h*.3],[w*.3,h*.05],[w*.7,h*.1],[w,h*.4]],HFORM.black,h*.1);hlEye(g,w*.16,h*.32,w*.14,h*.24,HFORM.teal);g.restore();});

// ---------------------------------------------------------------- fretwork lace (alpha-tested, tinted)
// LACE_V: carved valance — the Russian prichelina / nalichnik: a band with pierced holes and scalloped drops.
TEX.laceV=canvasTex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(0,0,w,h*.42);
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;g.beginPath();g.arc(cx,h*.42,w/16,0,Math.PI);g.fill();                    // scallops
  g.beginPath();g.moveTo(cx-3,h*.5);g.lineTo(cx,h*.98);g.lineTo(cx+3,h*.5);g.fill();}                                 // drops
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<8;k++){const cx=w*(k+.5)/8;g.beginPath();g.arc(cx,h*.22,h*.09,0,TAU);g.fill();g.beginPath();g.arc(cx,h*.5,h*.06,0,TAU);g.fill();
  g.beginPath();g.moveTo(cx+w/16,h*.08);g.lineTo(cx+w/16+5,h*.22);g.lineTo(cx+w/16,h*.36);g.lineTo(cx+w/16-5,h*.22);g.closePath();g.fill();}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h*.02,w,2);});
// LACE_B: alpine cut-out balustrade boards — each 0.2 m board carries a tulip/heart cut-out; repeats along x.
TEX.laceB=canvasTex(128,64,(g,w,h)=>{g.clearRect(0,0,w,h);const n=4,bw=w/n;
 for(let k=0;k<n;k++){const x0=k*bw;g.fillStyle='#fff';g.beginPath();g.moveTo(x0+1,0);g.lineTo(x0+bw-1,0);g.lineTo(x0+bw-1,h);g.lineTo(x0+1,h);g.fill();
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x0+bw-2,0,1,h);}
 g.globalCompositeOperation='destination-out';
 for(let k=0;k<n;k++){const cx=k*bw+bw;   // cut-outs straddle the joint, so two boards make one shape
  g.beginPath();g.moveTo(cx,h*.22);g.bezierCurveTo(cx-bw*.5,h*.1,cx-bw*.5,h*.5,cx,h*.78);g.bezierCurveTo(cx+bw*.5,h*.5,cx+bw*.5,h*.1,cx,h*.22);g.fill();}
 g.globalCompositeOperation='source-over';});
// ---------------------------------------------------------------- clock face (colour-carrying)
TEX.clock=canvasTex(256,256,(g,w,h)=>{const c=w/2;g.fillStyle='#1c1a1c';g.fillRect(0,0,w,h);
 g.beginPath();g.arc(c,c,c*.96,0,TAU);g.fillStyle='#c9a043';g.fill();g.beginPath();g.arc(c,c,c*.84,0,TAU);g.fillStyle='#f1e8d2';g.fill();
 g.strokeStyle='#1c1a1c';for(let k=0;k<60;k++){const a=k/60*TAU,L=k%5?c*.05:c*.13;g.lineWidth=k%5?2:6;g.beginPath();g.moveTo(c+Math.sin(a)*c*.8,c-Math.cos(a)*c*.8);g.lineTo(c+Math.sin(a)*(c*.8-L),c-Math.cos(a)*(c*.8-L));g.stroke();}
 g.beginPath();g.arc(c,c,c*.06,0,TAU);g.fillStyle='#b3322a';g.fill();});
// ---------------------------------------------------------------- cliff rock (fractured grey granite, strata and streaks): 8 m tile
TEX.rock=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/40,y/22,1.7,4),n2=fbm(x/6,y/6,4.4,2);
  let v=128+(n-.5)*90+(n2-.5)*30;
  const crack=Math.abs(fbm(x/30,y/90,8.1,3)-.5);if(crack<.02)v-=60*(1-crack/.02);                        // vertical joints
  const strat=Math.abs(Math.sin((y/h*5+fbm(x/50,y/50,2,2)*1.4)*Math.PI));if(strat<.06)v-=40;               // bedding planes
  const streak=clamp((fbm(x/5,y/70,6.6,2)-.55)*3,0,1);v-=streak*30;                                          // water streaks
  const lichen=clamp((fbm(x/12,y/12,3.9,2)-.62)*4,0,1);
  d[i]=v*(1-lichen*.1);d[i+1]=v*(1+lichen*.12);d[i+2]=v*(.98-lichen*.2);d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- meadow ground for the showcase: 8 m tile
TEX.meadow=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/50,y/50,.7,3),n2=fbm(x/5,y/5,3.2,2),bare=clamp((fbm(x/36,y/36,5.5,2)-.62)*4,0,1);
  let r=86+(n-.5)*40+(n2-.5)*26,gg=112+(n-.5)*46+(n2-.5)*30,b=58+(n-.5)*20;
  r=lerp(r,112+n2*30,bare);gg=lerp(gg,94+n2*24,bare);b=lerp(b,68,bare);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ================================================================= DALAB — trade and industry
// The tavern (a great round hall), the market (a ring of stalls round a stele — small for an outlying settlement,
// the large one three times the size for the main settlement's plaza), granaries, the warehouse, the scrap smithy
// and a workshop. All peasant/middle work: wood, earth, scrap, thatch; no God's light.

// tavern: a wide timber-stave drum on a rammed-earth foot under a great thatch cone with a smoke cap; a ring porch
function buildDalabTavern(G,o){reseed(8401+(o.v|0));const R=7.2,H=3.6;const wood=dCol(DPAL.wood),th=dCol(DPAL.thatch);
 vnReg('Tavern',0,0,11,H+R*1.05+2);
 dnDrum('dEarthDrum',0,-.05,0,R+.3,1.1,dCol(DPAL.earth));
 dnRoundHouse(0,1.0,0,R,H-1.0,{wall:'dStaveDrum',wallC:wood,roof:'thatch',rise:R*1.05,roofC:th,door:0,doorW:1.7,doorH:2.3,win:[.8,-.8,Math.PI*.55,-Math.PI*.55,Math.PI],hearth:true,band:'mural',wood,foot:false,finial:false});
 // smoke cap: a small second cone on posts over a vent
 vPst('vPost',0,H+R*1.05-1.4,0,.12,2.2,wood);kput('dConeT',[0,H+R*1.05+.3,0],null,[1.8,1.4,1.8],th);
 // porch ring: posts and a thatch skirt on the front half
 {const n=9;for(let k=0;k<n;k++){const a=-Math.PI*.55+k/(n-1)*Math.PI*1.1;const p=dnOnRing(0,0,R+2.4,a);vPst('vPostB',p[0],0,p[1],.16,2.7,wood);}
  kput('vConeT',[0,2.65,0],null,[R+3.2,3.0,R+3.2],th.clone().multiplyScalar(.92));dnDrum('vWood',0,2.5,0,R+2.6,.2,wood);}
 // benches, tables, barrels, a hitching rail, a banner
 for(const a of[.35,-.35,.85,-.85]){const p=dnOnRing(0,0,R+1.4,a);vB('vWood',p[0],.45,p[1],1.8,.1,.4,a,wood);for(const s of[-1,1]){const q=loc(p[0],p[1],s*.7,0,a);vB('vWood',q[0],0,q[1],.15,.45,.35,a,wood);}}
 vnBarrel(-R-.4,0,-3.2,.45,1.0,wood);vnBarrel(-R-1.3,0,-2.6,.42,.95,wood);vnBarrel(R+.6,0,-2.8,.45,1.0,wood);
 dnBannerPole(R+3.2,0,3.0,0,6,dCol(DPAL.gold));vB('vWood',-R-2.2,0,2.6,.12,1.1,.12,0,wood);vB('vWood',-R-2.2,1.0,4.4,.1,.1,3.8,0,wood);vB('vWood',-R-2.2,0,6.2,.12,1.1,.12,0,wood);
 vnPaving(0,.02,R+5,6,3,0,dCol(DPAL.earthDark),8);dnFolk(0,R+4.2,4,2.2);dnFolk(-3,R+1,2,1);}
// small market: a ring of eight stalls round a stele and a banner pole, a paved circle
function buildDalabMarketSmall(G,o){reseed(8411+(o.v|0));const R=9;const st=dCol(DPAL.stoneWarm);
 vnReg('Market (small)',0,0,R+4,6);
 vnPaving(0,.02,0,R*2+4,R*2+4,0,st.clone().multiplyScalar(.9),40);
 dnStele(0,0,0,0,3.4,st);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,0,1.6,a);dnBannerPole(p[0],0,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold,DPAL.red][k]));}
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;if(Math.abs(a-TAU)<.3||a<.35)continue;const p=dnOnRing(0,0,R,a);dnStall(p[0],p[1],a+Math.PI,{cloth:k%3===0,kind:k%4});}
 dnFolk(0,4,5,3.5);dnFolk(0,R+5,3,2);}
// large market: three rings of stalls round a raised stone platform with four banners and the market stele; 3x
function buildDalabMarketLarge(G,o){reseed(8421+(o.v|0));const st=dCol(DPAL.stoneWarm);
 vnReg('Market (large)',0,0,31,7);
 vnPaving(0,.02,0,60,60,0,st.clone().multiplyScalar(.9),120);
 vB('vStone',0,0,0,8,1.0,8,0,st);dnReliefBand(0,.15,4,0,7,.7,st);vnStairs(0,0,4.9,0,3,1.0,3,'vStone',st);
 dnStele(0,1.0,0,0,4.2,st);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,0,3.2,a);dnBannerPole(p[0],1.0,p[1],a,7,dCol([DPAL.red,DPAL.turq,DPAL.gold,DPAL.red][k]));}
 const RINGS=[[9,8],[16,14],[23,20]];
 RINGS.forEach((rg,i)=>{const [R,n]=rg;for(let k=0;k<n;k++){const a=k/n*TAU+i*.17;let d=Math.abs(a%TAU);if(d>Math.PI)d=TAU-d;if(d<.22*(3-i)/2+.12)continue;   // an aisle to the front
  if(i>0&&rng()<.18)continue;const p=dnOnRing(0,0,R,a);dnStall(p[0],p[1],a+Math.PI+(i===2?Math.PI:0),{cloth:rng()<.4,kind:dRi(0,3)});}});
 dnGate(0,0,27.5,0,4,4.2,st);dnFolk(0,10,8,6);dnFolk(0,20,6,5);dnFolk(-12,-8,4,4);dnFolk(12,8,4,4);}
// granaries: three raised baskets of different sizes on a beaten-earth pad, a threshing floor
function buildDalabGranaries(G,o){reseed(8431+(o.v|0));
 vnReg('Granaries',0,0,7.5,7.5);
 vB('dEarth',0,-.05,0,15,.25,12,0,dCol(DPAL.earthDark));
 dnGranary(-4.2,.2,-1.5,1.6,2.2,{door:.4});dnGranary(1.2,.2,-2.6,1.3,1.9,{door:-.3});dnGranary(4.6,.2,1.6,1.5,2.0,{door:.9});
 dnDrum('vStone',-2.2,.2,3.2,2.6,.2,dCol(DPAL.stoneWarm));vnSacks(-2.0,.4,3.2,5);   // threshing floor
 vnDryingRack(4.0,.2,4.6,0,3.0);dnFolk(-1,6,2,1.2);}
// warehouse: a long rammed-earth hall under a shingle gable, scrap-plate double doors, a loading platform, crates
function buildDalabWarehouse(G,o){reseed(8441+(o.v|0));const W=22,D=10,H=4.4;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Warehouse',0,0,14,H+4.5);
 vB('vStone',0,-.05,0,W+.6,.5,D+.6,0,vC(0x9a8a78));
 kput('dEarthBat',[0,.4,0],null,[W,H,D],earth);
 for(let k=-2;k<=2;k++)dnDrum('dEarthDrumB',k*(W/5),.4,-D/2*.93,.8,H+.3,earth);        // buttress drums along the back
 vnGableRoof(0,.4+H,0,W*.9,D*.9,3.0,0,'vGableS',sh,1.2,'vGableW',wood,.3);
 // double doors of Ancient plate on the front, a loading platform, a hoist
 {const dz=D/2*.94;vB('vDarkB',0,.4,dz,3.6,3.4,.12,0);for(const s of[-1,1])kput(s<0?'vPlateW':'vPlate',[s*.95,.4+1.7,dz+.12],vQ(0,0,0),[1.8,3.3,1],null);
  vB('vWood',0,.4+3.4,dz+.1,4.4,.3,.5,0,wood);vB('vWood',0,-.05,dz+1.9,7,.95,3.4,0,wood);vnStairs(-4.4,0,dz+1.9,Math.PI/2,1.2,.9,3,'vWood',wood);
  vPst('vPost',3.2,.4+H-1,dz+1.2,.1,3.4,wood);vB('vWood',3.2,.4+H+2.2,dz+1.9,.14,.14,2.6,0,wood);kput('vRope',[3.2,.4+H+.6,dz+2.8],null,[.03,1.6,.03],vC(0xb8a888));vnCrate(3.2,.4+H-.2,dz+2.8,.8,0,wood);}
 for(const x of[-7,7])vnWin(x,.4+2.6,D/2*.95,0,1.2,.8,'shut','vWood',wood);
 vnDoor(-W/2*.93,.4,0,-Math.PI/2,1.0,2.0,'vWood',wood,vC(0x6a5a48));
 vnCrate(-8,.95,D/2+2.2,.9,.2,wood);vnCrate(-6.8,.95,D/2+2.6,.8,.5,wood);vnSacks(-5,.95,D/2+2.2,4);vnBarrel(6.5,0,D/2+4.6,.45,1.0,wood);vnBarrel(7.4,0,D/2+4.0,.42,.95,wood);
 dnFolk(0,D/2+6,3,1.6);}
// scrap smithy: an open-sided shed of timber posts under a corrugate roof against a rammed-earth back wall;
// a kiln drum with a fire, an anvil block, a scrap heap, a chimney — fire is allowed anywhere
function buildDalabSmithy(G,o){reseed(8451+(o.v|0));const W=12,D=8,H=3.4;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Scrap smithy',0,0,9,H+3);
 vnPaving(0,.02,0,W+4,D+4,0,vC(0x8a7a6a),16);
 vB('dEarth',0,0,-D/2+.5,W,H,1.0,0,earth);for(const s of[-1,1])vB('dEarth',s*(W/2-.5),0,-1.0,1.0,H-.4,D-3,0,earth);
 for(let i=0;i<=4;i++){vPst('vPostB',-W/2+W*i/4,0,D/2-.2,.16,H+.6,wood);}
 vnShedRoof(0,H+.2,-.4,W+.6,D+.6,1.4,0,'vCorr',null,.9,.14);
 for(let k=0;k<6;k++){const zz=rr(-D/2+1,D/2-1);kput('vRock',[rr(-W/2,W/2),H+.2+1.4*(1-(zz+D/2)/D)+.16,zz],qEuler(rng(),rng(),0),[.32,.24,.3],vC(0x6a625a));}
 // kiln: a rammed-earth drum with a fire mouth, chimney
 dnDrum('dEarthDrumB',-3.4,0,-1.6,1.5,2.4,dCol(DPAL.earthDark));vB('vDarkB',-3.4,.3,-.2,.8,.7,.2,0);dnHearth(-3.4,.3,-.15,0,.8,.7);vnChimney(-3.4,2.4,-1.6,3.2,.22,true);
 vB('vStone',1.0,0,-.6,1.0,.8,.7,0,vC(0x6a625a));vB('vIron',1.0,.8,-.6,1.1,.25,.4,0,vC(0x2e2a26));   // anvil
 vnWaterButt(3.6,0,-1.8,.45,.9);vB('vWood',3.6,0,1.4,2.4,.9,.9,0,wood);for(let k=0;k<5;k++)kput('vPipeR',[3.0+k*.3,.9,1.4],qEuler(0,0,Math.PI/2),[.04,2.0,.04],null);
 // scrap heap outside: plates, pipe, rust
 for(let k=0;k<14;k++)kput(dPick(['vPlate','vPlateW','vRustB','vPipeR']),[W/2+2.2+rr(-1.2,1.2),rr(.05,.5),rr(-2.2,2.2)],qEuler(rng()*.6,rng()*TAU,rng()*.4),[rr(.4,1.0),rr(.3,.8),rr(.04,.14)],null);
 dnBanner(-W/2+1.2,H+.4,D/2+.3,0,.9,2.0,dCol(DPAL.red));dnFolk(0,D/2+3,2,1.2);dnFolk(-1,1,1,.6);}
// workshop: rammed-earth block with a salvage lean-to, shingle roof, racks, a banner — potters and weavers
function buildDalabWorkshop(G,o){reseed(8461+(o.v|0));const W=9,D=7,H=3.0;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Workshop',0,0,8,H+3.5);
 vB('vStone',0,-.05,0,W+.5,.35,D+.5,0,vC(0x9a8a78));kput('dEarthBat',[0,.3,0],null,[W,H,D],earth);
 dnDrum('dEarthDrumB',-W/2*.95,.3,-D/2*.95,.8,H+.3,earth);dnDrum('dEarthDrumB',W/2*.95,.3,-D/2*.95,.8,H+.3,earth);
 vnHipRoof('vHipS',0,.3+H,0,W*.9,D*.9,2.2,0,sh,1.0);
 vnDoor(-1.2,.3,D/2*.94,0,1.1,2.0,'vWood',wood,vC(0x6a5a48));vnWin(2.0,.3+1.2,D/2*.94,0,1.2,.8,'open','vWood',wood,true);dnHearth(2.0,.3+1.2,D/2*.94,0,1.2,.8);
 dnMuralBand(0,.3+H-.7,D/2*.94,0,W-2,.55);
 // salvage lean-to on the +x side: corrugate on poles, the drying racks under it
 for(const z of[-D/2+.4,D/2-.4])vPst('vPost',W/2+3.0,0,z,.08,2.4,wood);vnShedRoof(W/2+1.5,H-.2,0,3.4,D-.6,.9,Math.PI/2,'vCorr',null,.5,.12);
 vnDryingRack(W/2+1.8,0,-1.2,Math.PI/2,3.0);for(let k=0;k<5;k++)vPst('vClayPot',W/2+.9+k*.5,0,D/2-.9,.18,.4,dCol([0x9a5a38,0xa86a44]));
 vnPlanter(-W/2-1.0,0,D/2-1,.7,2.4,0,wood);dnBanner(W/2-1.0,.3+H+.4,D/2*.94+.2,0,.8,1.8,dCol(DPAL.turq));
 dnFolk(0,D/2+3,2,1.2);}

// shop row: three shops in one rammed-earth block with round ends, each with a counter window, an awning and a sign;
// the middle one two storeys, a mural over the counters
function buildDalabShops(G,o){reseed(8471+(o.v|0));const W=16,D=7,H=3.2;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg('Shop row',0,0,11,H+5);
 vB('vStone',0,-.05,0,W+.6,.4,D+.6,0,vC(0x9a8a78));
 kput('dEarthBat',[0,.3,0],null,[W-3,H,D],earth);dnDrum('dEarthDrumB',-W/2+1.6,.3,0,D/2,H,earth);dnDrum('dEarthDrumB',W/2-1.6,.3,0,D/2,H,earth);
 vnHipRoof('vHipS',0,.3+H,0,W-4,D*.9,2.0,0,sh,1.0);kput('dConeSh',[-W/2+1.6,.3+H-.3,0],null,[D/2*1.2,2.4,D/2*1.2],sh);kput('dConeSh',[W/2-1.6,.3+H-.3,0],null,[D/2*1.2,2.4,D/2*1.2],sh);
 // the tall middle shop
 vB('dEarth',0,.3+H,0,5,2.6,D-1.2,0,earth.clone().multiplyScalar(1.05));vnHipRoof('vHipS',0,.3+H+2.6,0,5,D-1.2,1.6,0,sh,.8);dnMuralBand(0,.3+H+.5,D/2-.6,0,4.2,1.6);
 // three counters with awnings, signs, goods
 [-5,0,5].forEach((x,i)=>{const dz=D/2*(i===1?.94:.9)+(i===1?0:.02);vnWin(x,.3+1.0,dz,0,2.0,1.1,'open','vWood',wood);vB('vWood',x,.3+.9,dz+.3,2.3,.1,.7,0,wood);
  vnAwning(x,.3+2.5,dz,0,2.6,1.4,dCol([0xa8382a,0x2f9a8a,0xd8a838]));vnDoor(x+1.9,.3,dz,0,.9,1.9,'vWood',wood,vC(0x6a5a48));
  for(let k=0;k<4;k++)vBall('vGourd',x-.8+k*.5,.3+1.1,dz+.3,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a,0x9a5a38]),.18);
  dnBanner(x-1.5,.3+H-.1,dz+.35,0,.5,1.2,dCol([DPAL.red,DPAL.turq,DPAL.gold][i]));});
 vnPaving(0,.02,D/2+2,W,2.5,0,dCol(DPAL.earthDark),12);dnFolk(0,D/2+3.5,4,3);}
// potter's workshop: a round earth workshop with a big beehive kiln, drying racks of pots, a clay pit
function buildDalabPotter(G,o){reseed(8476+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg("Potter's workshop",0,0,9,7);
 dnRoundHouse(-2.5,0,-1,3.6,2.8,{roof:'thatch',rise:3.4,door:.6,win:[Math.PI*.6,-Math.PI*.6],band:'paint',wood});
 // the kiln: a rammed-earth beehive with a fire mouth, a stone flue
 kput('dEarthDome',[4.5,0,-2.5],null,[2.4,2.6,2.4],dCol(DPAL.earthDark));vB('vDarkB',4.5,.2,-.2,.9,.8,.2,0);dnHearth(4.5,.2,-.15,0,.9,.8);vPst('vPostS',4.5,2.3,-2.5,.3,1.4,dCol(DPAL.stone));
 // pot racks under a thatch lean-to
 for(const z of[1.5,4.5])vPst('vPost',3.8,0,z,.08,2.4,wood);for(const z of[1.5,4.5])vPst('vPost',7.2,0,z,.08,2.0,wood);vnShedRoof(5.5,2.2,3,3.6,3.2,.4,Math.PI/2,'vThatchB',dCol(DPAL.thatch),.4,.26);
 for(let sh=0;sh<2;sh++){vB('vWood',5.5,.6+sh*.7,3,3.2,.06,2.8,0,wood);for(let k=0;k<12;k++)vPst('vClayPot',4.2+(k%6)*.55,.66+sh*.7,2.0+Math.floor(k/6)*1.6,rr(.14,.22),rr(.3,.55),dCol([0x9a5a38,0xa86a44,0x7a4a2a,0xb87a54]));}
 dnDrum('dEarthDrum',-5,-.3,4.5,1.6,.35,dCol(DPAL.earthDark));dnDrum('vDarkB',-5,.05,4.5,1.3,.05,null);   // clay pit
 vB('vWood',0,0,4.2,1.2,.7,1.2,0,wood);vPst('vClayPot',0,.7,4.2,.2,.4,dCol([0x9a5a38]));   // the wheel
 dnFolk(1,7,2,1.2);}
// weaver's workshop: a post hall open on one side, looms under it, dyed cloth drying on long lines
function buildDalabWeaver(G,o){reseed(8481+(o.v|0));const W=10,D=7,H=3.0;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle);
 vnReg("Weaver's workshop",0,0,10,H+4);
 vB('vStone',0,-.05,0,W+.6,.35,D+.6,0,vC(0x9a8a78));vB('dEarth',0,.3,-D/2+.5,W,H,1.0,0,earth);vB('dEarth',-W/2+.5,.3,0,1.0,H,D,0,earth);
 for(let i=0;i<=3;i++)vPst('vPostB',-W/2+W*i/3,0,D/2-.2,.15,H+.5,wood);for(let i=1;i<3;i++)vPst('vPostB',W/2-.2,0,-D/2+D*i/3,.15,H+.5,wood);
 vnHipRoof('vHipS',0,.3+H,0,W,D,2.4,0,sh,1.1);dnMuralBand(0,.3+H-.9,-D/2+1.0,0,W-2,.7);
 // looms: frames with warp threads
 for(const x of[-2.8,0.6]){vB('vWood',x,.3,-1,2.2,.15,.9,0,wood);for(const s of[-1,1])vPst('vPost',x+s*1.0,.3,-1,.06,2.2,wood);vB('vWood',x,2.3,-1,2.2,.1,.1,0,wood);
  for(let k=0;k<12;k++)kput('vRope',[x-.9+k*.16,.5,-1],null,[.012,1.8,.012],vC(0xd8c8a8));kput('vClothB',[x,1.0,-1],null,[2.0,.9,.05],dCol([0xa8382a,0x2f9a8a,0xd8a838]));}
 // drying lines out front
 for(const z of[D/2+2.5,D/2+4.5]){for(const x of[-5,5])vPst('vPost',x,0,z,.07,2.4,wood);vBeam([-5,2.3,z],[5,2.3,z],.03,vC(0xb8a888),'vRope');
  for(let k=0;k<7;k++)kput('vCloth',[-4.2+k*1.4,1.7,z],vQ(0,0,0),[1.1,1.2,1],dCol([0xa8382a,0x2f9a8a,0xd8a838,0xe8dcc0,0x3b3b4a]));}
 vnBarrel(W/2+1,0,-1,.42,.9,wood);vnSacks(W/2+1.2,0,1.2,3);dnFolk(0,D/2+7,2,1.5);}
// dyer's yard: vats of colour under a corrugate shed, a rammed-earth store, stained ground, cloth on frames
function buildDalabDyer(G,o){reseed(8486+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg("Dyer's yard",0,0,9,6);
 kput('dEarthBat',[-4,0,-2],null,[6,3.0,5],earth);vnHipRoof('vHipT',-4,3.0,-2,6,5,1.6,0,dCol(DPAL.thatch),.9);vnDoor(-4,0,.35,0,1.0,1.9,'vWood',wood,vC(0x6a5a48));
 for(const p of[[1,-4],[7,-4],[1,2],[7,2]])vPst('vPost',p[0],0,p[1],.09,2.6,wood);vnShedRoof(4,2.4,-1,6.6,6.6,.8,0,'vCorr',null,.6,.12);
 const DYES=[0xa8382a,0x2f9a8a,0xd8a838,0x3b3b4a,0x7a3d8a,0x2a5aa8];
 for(let k=0;k<6;k++){const x=1.6+(k%3)*2.2,z=-3+Math.floor(k/3)*3;vPst('vClayPot',x,0,z,.7,.9,dCol([0x9a5a38,0x7a4a2a]));dnDrum('vDarkB',x,.88,z,.6,.05,vC(DYES[k]));
  vB('vFlag',x,.01,z+1.0,1.6,.03,1.2,0,vC(DYES[k],.5));}   // the stain round each vat
 for(let k=0;k<4;k++){const x=-6.5+k*.01,z=2.5+k*1.2;vB('vWood',-6,0,z,.08,2.0,.08,0,wood);}vB('vWood',-6,2.0,4.3,.08,.08,3.8,0,wood);
 for(let k=0;k<3;k++)kput('vCloth',[-6,1.3,2.8+k*1.2],vQ(Math.PI/2,0,0),[1.0,1.3,1],vC(DYES[k+1]));
 vnWaterButt(8.6,0,-1,.5,1.0);dnFolk(3,5,2,1.4);}
// windmill: a tapered rammed-earth tower on a stone foot, a thatch cap with a tail pole, four sails of timber and cloth
// on an axle out of the cap; a millstone shed and sacks beside
function buildDalabWindmill(G,o){reseed(8491+(o.v|0));const R=3.0,H=9;const wood=dCol(DPAL.wood),earth=dCol(DPAL.earth),th=dCol(DPAL.thatch);
 vnReg('Windmill',0,0,8,H+8);
 dnDrum('vStone',0,-.05,0,R+.5,1.0,vC(0x9a8a78));kput('dEarthDrumB',[0,.9,0],null,[R,H,R],earth);dnDrum('dEarthDrum',0,.9+H-.6,0,R*.93+.06,.22,dCol(DPAL.turq));
 vnDoor(0,.9,R,0,1.0,2.0,'vWood',wood,vC(0x6a5a48));vnWin(0,.9+4,R*.96,0,.8,.8,'shut','vWood',wood);vnWin(0,.9+6.8,R*.94,0,.7,.7,'open','vWood',wood);
 // the cap: a thatch cone with a tail pole down the back
 kput('dConeT',[0,.9+H-.4,0],null,[R*.93*1.25,3.4,R*.93*1.25],th);kput('vRock',[0,.9+H+2.6,0],null,[.5,.5,.5],wood);
 vBeam([0,.9+H+.4,-R*.6],[0,1.2,-R-5],.14,wood);vPst('vPostB',0,0,-R-5,.12,1.4,wood);
 // axle, hub and four sails, tilted back 12 degrees. The sails are two merged meshes in their own group (DWIND) so the
 // frame loop can turn them: two draw calls per windmill, the price of a moving part in an instanced kit.
 {const hy=.9+H+.5,tilt=-.2;const q=vQ(0,tilt,0);const ax=new THREE.Vector3(0,0,1).applyQuaternion(q);
  const hub=[ax.x*(R+.8),hy+ax.y*(R+.8),ax.z*(R+.8)];kput('vPost',[0,hy,0],vQ(0,tilt+Math.PI/2,0),[.16,R+1.6,.16],wood);vBall('vBall',hub[0],hub[1],hub[2],.32,vC(0x2e2a26));
  const SG=new THREE.Group();SG.position.set(hub[0],hub[1],hub[2]);SG.quaternion.copy(q);G.add(SG);
  const stocks=[],cloths=[];const L=7.5;
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;stocks.push(new THREE.BoxGeometry(.16,L,.16).translate(0,L/2,0).rotateZ(a));stocks.push(new THREE.BoxGeometry(1.5,5.2,.06).translate(.7,4.6,0).rotateZ(a));
   cloths.push(new THREE.BoxGeometry(1.3,4.8,.03).translate(.7,4.6,.05).rotateZ(a));}
  meshMerged(stocks,new THREE.MeshStandardMaterial({map:TEX.wood,color:wood,roughness:.92,side:DS}),SG,0,0,0);
  meshMerged(cloths,new THREE.MeshStandardMaterial({map:TEX.stripes,color:dCol([0xe8dcc0,0xd8a838,0xa8382a]),roughness:.9,side:DS}),SG,0,0,0);
  DWIND.push({grp:SG,rate:.45+rng()*.3});}
 // millstone shed, sacks, a cart of grain
 vB('vStone',R+3.5,-.05,1.5,5,.35,4,0,vC(0x9a8a78));for(const p of[[R+1.5,-.2],[R+5.5,-.2],[R+1.5,3.2],[R+5.5,3.2]])vPst('vPost',p[0],0,p[1],.09,2.6,wood);vnShedRoof(R+3.5,2.4,1.5,5.2,4.2,.7,0,'vThatchB',th,.5,.26);
 dnDrum('vStone',R+3.5,.3,1.5,1.0,.35,dCol(DPAL.stone));dnDrum('vStone',R+3.5,.65,1.5,1.0,.3,dCol(DPAL.stone));vnSacks(R+4.8,.3,.4,5);vnSacks(R+2.2,.3,2.6,3);
 dnFolk(2,R+4,2,1.2);}

dDef({key:'dalab_tavern',name:'Tavern',family:'trade',tags:{type:['tavern/inn'],wealth:'middle',lit:false},w:26,d:26,h:14,build:buildDalabTavern});
dDef({key:'dalab_market_small',name:'Market (small)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:28,d:28,h:6,build:buildDalabMarketSmall});
dDef({key:'dalab_market_large',name:'Market (large)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:64,d:64,h:8,build:buildDalabMarketLarge});
dDef({key:'dalab_granaries',name:'Granaries',family:'infrastructure',tags:{type:['farm','infrastructure'],wealth:'peasant',lit:false},w:17,d:14,h:8,build:buildDalabGranaries});
dDef({key:'dalab_warehouse',name:'Warehouse',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false},w:28,d:20,h:9,build:buildDalabWarehouse});
dDef({key:'dalab_smithy',name:'Scrap smithy',family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:14,h:7,build:buildDalabSmithy});
dDef({key:'dalab_workshop',name:'Workshop',family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:17,d:12,h:7,build:buildDalabWorkshop});
dDef({key:'dalab_shops',name:'Shop row',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:20,d:14,h:10,build:buildDalabShops});
dDef({key:'dalab_potter',name:"Potter's workshop",family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:18,d:14,h:7,build:buildDalabPotter});
dDef({key:'dalab_weaver',name:"Weaver's workshop",family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:16,d:18,h:7,build:buildDalabWeaver});
dDef({key:'dalab_dyer',name:"Dyer's yard",family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:18,d:12,h:6,build:buildDalabDyer});
dDef({key:'dalab_windmill',name:'Windmill',family:'infrastructure',tags:{type:['farm','infrastructure','industry'],wealth:'middle',lit:false},w:18,d:18,h:18,build:buildDalabWindmill});
// ================================================================= HIGHLANDS — materials, geometry, kit items (prefix h)
// Palette. sRGB hex as a painter picks them; hC() = vC() (sRGB -> linear once, see 69b).
const hC=vC;
const HPAL={
 pine:[0xc08850,0xb07a44,0xc89a60,0xa87040],            // fresh-hewn logs and boards (Rustic, Republican poor/middle)
 aged:[0x8a7e70,0x7a6e60,0x958878,0x847462],            // silver-grey weathered timber (poor, tribal)
 tar:[0x4a3426,0x3a2a20,0x55392a,0x42302a],             // tarred / oiled dark timber (Norse halls, Republican rich)
 redwood:[0x5e2a1c,0x6a3020,0x542418,0x6e3624],         // the Peles red-brown of half-timber and loggias
 falu:[0x8a2e22,0x9a3a28,0x7e2a20],                     // red-painted boards (Rustic)
 stucco:[0xeee3c8,0xe8dcc0,0xf2ead6,0xe4d4b0],          // cream render (Republican middle/rich/civic)
 saxon:[0xe0b870,0xd8c0a0,0xc8d0b0,0xe4c89a,0xd8a888], // painted Transylvanian-Saxon render: ochre, sand, sage, apricot, rose
 ashlar:[0xd8d0bc,0xc8c0ac,0xe0d8c4,0xcfc4a8],          // limestone quoins, towers, civic fronts
 rubble:[0x9a948a,0x8a8478,0xa8a296,0x958d80],          // fieldstone socles
 slate:[0x565c66,0x4c525c,0x60666e,0x5a5a62],           // Peles slate
 roofGreen:[0x3f7f5f,0x2f7a6a,0x4a8a5a,0x357060],       // painted iron / glazed scale roofs (civic)
 roofRed:[0xa0402a,0x8a3424,0xb04a30],
 shingle:[0x9a8a78,0x8a7a68,0xa8987e,0xb0a28c],         // aspen / larch shingle, silvered
 bamboo:[0xc8b870,0xb8a860,0xa89850,0xd0c080],
 turf:[0xa0b080,0x90a070,0xb0b888],
 gold:[0xd4a03a,0xc89030,0xe0b048],
 // painted trim — the carving colours, NW-coast led: teal and red on black and white, with ochre and a Russian blue
 trim:[0x2e9488,0xb3322a,0xefe7d6,0x2e9488,0xb3322a,0x3a6aa8,0xd19a3a],
 teal:0x2e9488,red:0xb3322a,white:0xefe7d6,black:0x201a18,blue:0x3a6aa8,green:0x3f7a4a,ochre:0xd19a3a,
};

// ---------------------------------------------------------------- world UV with separate u/v tile sizes
// vWorldUV (69b) uses one K for both axes; the lace and frieze maps are not square, so they need Ku != Kv.
function hWorldUV(mat,Ku,Kv){mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',
`#ifdef USE_UV
#ifdef USE_INSTANCING
mat4 _im=instanceMatrix;
vec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));
vec3 _an=abs(normal);
vec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));
vUv=uv*_sw*vec2(${Ku.toFixed(4)},${Kv.toFixed(4)});
#else
vUv=uv;
#endif
#endif`);};return mat;}

// ---------------------------------------------------------------- materials
const hStd=(o)=>new THREE.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.92,metalness:0,side:DS},o));
MAT.logs=hStd({map:TEX.logs});MAT.scale=hStd({map:TEX.scale,roughness:.78});MAT.rubbleW=hStd({map:TEX.rubble,roughness:.97});
MAT.turf=hStd({map:TEX.turf,roughness:1});MAT.bamboo=hStd({map:TEX.bambooV,roughness:.7});MAT.bmat=hStd({map:TEX.bmat,roughness:.95});
MAT.paint=hStd({roughness:.72});                         // painted timber: trims, brackets, shutters — no grain, the colour is the point
MAT.gold=hStd({color:0xffffff,roughness:.38,metalness:.35,side:THREE.FrontSide});
MAT.formA=hStd({map:TEX.formA,roughness:.8});MAT.formW=hStd({map:TEX.formW,roughness:.8});MAT.formV=hStd({map:TEX.formV,roughness:.8});
MAT.formT=hStd({map:TEX.formT,roughness:.8});MAT.formB=hStd({map:TEX.formB,roughness:.8});MAT.formF=hStd({map:TEX.formF,roughness:.8});
MAT.totem=hStd({map:TEX.totem,roughness:.82,side:THREE.FrontSide});MAT.totemP=hStd({map:TEX.totemP,roughness:.82,side:THREE.FrontSide});
MAT.wing=hStd({map:TEX.wing,alphaTest:.5,roughness:.85});
MAT.laceV=hStd({map:TEX.laceV,alphaTest:.5,roughness:.75});MAT.laceB=hStd({map:TEX.laceB,alphaTest:.5,roughness:.8});
MAT.clock=hStd({map:TEX.clock,roughness:.6});
MAT.meadow=new THREE.MeshStandardMaterial({map:TEX.meadow,roughness:1});
MAT.rock=hStd({map:TEX.rock,roughness:1});                // cliff faces (plain mesh, UVs from the geometry)
vWorldUV(MAT.logs,.5);vWorldUV(MAT.scale,.5);vWorldUV(MAT.rubbleW,.25);vWorldUV(MAT.turf,.5);vWorldUV(MAT.bamboo,.5);vWorldUV(MAT.bmat,.5);
hWorldUV(MAT.formF,.5,2);          // frieze: 2 m x 0.5 m tile (boards 0.5 m tall show one band)
hWorldUV(MAT.laceV,.5,2);          // valance: 2 m x 0.5 m tile
hWorldUV(MAT.laceB,1.25,1);        // balustrade: 0.8 m x 1 m tile (four 0.2 m boards)

// ---------------------------------------------------------------- geometry
// onion dome: lathe, base radius 1 at y=0, tip at y=1 (instances scale [r,h,r])
const HONION=new THREE.LatheGeometry([[0,0],[1,0],[1.1,.1],[1.2,.24],[1.18,.36],[1.02,.5],[.72,.66],[.4,.8],[.16,.9],[.05,.97],[.02,1.0],[0,1.0]].map(p=>new THREE.Vector2(p[0],p[1])),16);
// helm / bulb for small cupolas: a squatter, fatter onion
const HBULB=new THREE.LatheGeometry([[0,0],[1,0],[1.25,.2],[1.3,.4],[1.1,.62],[.6,.82],[.2,.94],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),14);
// tented (shatior) roof and octagonal drum: 8 sides, a face (not a corner) toward +z
const HTENT=new THREE.CylinderGeometry(.015,1,1,8,1).translate(0,.5,0).rotateY(Math.PI/8);
const HOCT=new THREE.CylinderGeometry(1,1,1,8,1).translate(0,.5,0).rotateY(Math.PI/8);
// keel arch (kokoshnik / bochka): the Russian ogee, width 1 (x -.5..+.5), height 1 (y 0..1), extruded 1 along z (centred)
function hKeelShape(){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-.5,.3);s.bezierCurveTo(-.5,.66,-.16,.62,-.04,.86);s.quadraticCurveTo(0,.94,0,1);
 s.quadraticCurveTo(0,.94,.04,.86);s.bezierCurveTo(.16,.62,.5,.66,.5,.3);s.lineTo(.5,0);s.lineTo(-.5,0);return s;}
const HKEEL=new THREE.ExtrudeGeometry(hKeelShape(),{depth:1,bevelEnabled:false,curveSegments:10}).translate(0,0,-.5);
// log end: a short horizontal cylinder along local x (instances scale [length, r, r])
const HLOG=new THREE.CylinderGeometry(1,1,1,8).rotateZ(Math.PI/2);
// a pole (totem) — more sides than a post, so the carving reads
const HPOLE=new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0);
// curved roof tile for the "swept" eave corners and dougong arms: a quarter-round bracket profile, extruded (1 x 1 x 1)
function hArmShape(){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(1,0);s.lineTo(1,.55);s.quadraticCurveTo(.9,.95,.55,1);s.lineTo(0,1);s.lineTo(0,0);return s;}
const HARM=new THREE.ExtrudeGeometry(hArmShape(),{depth:1,bevelEnabled:false,curveSegments:5}).translate(-.5,-.5,-.5);

// ---------------------------------------------------------------- kit items
kdef('hLogB',VBOX,MAT.logs);kdef('hScaleB',VBOX,MAT.scale);kdef('hRubB',VBOX,MAT.rubbleW);kdef('hTurfB',VBOX,MAT.turf);kdef('hBMatB',VBOX,MAT.bmat);
kdef('hPaint',VBOX,MAT.paint);kdef('hGoldB',VBOX,MAT.gold);kdef('hGold',VBALL,MAT.gold);kdef('hPaintBall',VBALL,MAT.paint);
kdef('hFormA',VPLANE,MAT.formA);kdef('hFormW',VPLANE,MAT.formW);kdef('hFormV',VPLANE,MAT.formV);kdef('hFormT',VPLANE,MAT.formT);kdef('hFormB',VPLANE,MAT.formB);kdef('hFormF',VBOX,MAT.formF);
kdef('hLaceV',VPLANE,MAT.laceV);kdef('hLaceB',VPLANE,MAT.laceB);kdef('hWing',VPLANE,MAT.wing);kdef('hClock',VPLANE,MAT.clock);
kdef('hTotem',HPOLE,MAT.totem);kdef('hTotemP',HPOLE,MAT.totemP);
kdef('hBamboo',new THREE.CylinderGeometry(1,1,1,7).translate(0,.5,0),MAT.bamboo);kdef('hBambooC',new THREE.CylinderGeometry(.5,.5,1,7),MAT.bamboo);   // hBambooC is CENTRED (for beam(): w = diameter)
kdef('hLogEnd',HLOG,MAT.woodV);kdef('hLogX',HLOG,MAT.logs);   // log ends at notched corners; whole logs lying along x (beams, woodpiles, cliff struts)
kdef('hOnionG',HONION,MAT.gold);kdef('hOnionSc',HONION,MAT.scale);kdef('hOnionSh',HONION,MAT.shingle);
kdef('hBulbG',HBULB,MAT.gold);kdef('hBulbSc',HBULB,MAT.scale);kdef('hBulbSh',HBULB,MAT.shingle);
kdef('hTentSc',HTENT,MAT.scale);kdef('hTentSh',HTENT,MAT.shingle);kdef('hTentT',HTENT,MAT.thatch);
kdef('hOctP',HOCT,MAT.plaster);kdef('hOctL',HOCT,MAT.logs);kdef('hOctW',HOCT,MAT.wood);kdef('hOctS',HOCT,MAT.stone);kdef('hOctSh',HOCT,MAT.shingle);
kdef('hKeelSc',HKEEL,MAT.scale);kdef('hKeelW',HKEEL,MAT.wood);kdef('hKeelP',HKEEL,MAT.plaster);kdef('hKeelSh',HKEEL,MAT.shingle);kdef('hKeelG',HKEEL,MAT.gold);kdef('hKeelDark',HKEEL,MAT.void);
kdef('hGableSc',VGABLE,MAT.scale);kdef('hGableTurf',VGABLE,MAT.turf);kdef('hGableLog',VGABLE,MAT.logs);kdef('hGableBM',VGABLE,MAT.bmat);kdef('hGableRub',VGABLE,MAT.rubbleW);kdef('hGablePaint',VGABLE,MAT.paint);
kdef('hPyrSc',VPYR,MAT.scale);kdef('hHipSc',VHIP,MAT.scale);kdef('hHipTurf',VHIP,MAT.turf);kdef('hHipSh',VHIP,MAT.shingle);
kdef('hBatterRub',VBATTER,MAT.rubbleW);
kdef('hArm',HARM,MAT.paint);kdef('hArmW',HARM,MAT.wood);
kdef('hConeG',VCONE,MAT.gold);kdef('hConeSc',VCONE,MAT.scale);kdef('hConeSh',VCONE,MAT.shingle);
// ================================================================= HIGHLANDS — the motif library (round 2)
// Travis, round 2: keep the formline murals for the Tribes, but give the Republic and the Rustic villages a wider,
// more Norse and Celtic repertoire painted in the SAME palette (black / red / teal / ochre on cedar or white):
// Celtic knots and plaits, braided rings, the triskelion, the tree of life, Celtic cats, wolves, Thor's hammer,
// grain, rockets, moths, warriors, sun / moon / star and the gas giant — and the Republic's own emblem, three
// arms holding swords in a triskelion. Every shop gets a sign with its trade's symbol; totems outside the tribes
// become carved PILLARS showing the same repertoire stacked like a totem.
//
// Everything is drawn procedurally into canvases (colour-carrying, never tinted), in unit boxes placed with
// hlIn(g, x,y,w,h, uw,uh, fn) — see 70-hl-tex.js. Kit items (planes unless noted), all prefix hM:
//   hM_w_<name>  wide mural 2:1        hM_g_<name>  gable crest 2:1        hM_t_<name>  tall board 1:4
//   hM_d_<name>  roundel (alpha disc)  hM_sign_<symbol>  shop-sign roundel  hM_p_<k>  carved pillar (BOX, 1:4 faces)
//   hM_banner    Republic banner (cloth)
// Pick lists for the helpers are in HMOTIF.

// ---------------------------------------------------------------- Celtic drawing kit
// A ribbon: whatever path draw() builds, stroked black and then filled narrower in the strand colour.
function hlRibbon(g,draw,w,fill,edge){g.save();g.lineCap='round';g.lineJoin='round';draw();g.strokeStyle=edge||HFORM.black;g.lineWidth=w+Math.max(2,w*.5);g.stroke();
 g.strokeStyle=fill;g.lineWidth=w;g.stroke();g.restore();}
// PLAIT: knotwork in a c x r cell rectangle (cell s) — billiard strands at 45° bouncing off the border, woven
// over / under alternately along every strand. The traditional basis of Celtic interlace.
function hlPlait(g,x0,y0,c,r,s,w,fill,edge){const W=c*s,H=r*s,seen=new Set(),key=(x,y)=>Math.round(x*8)+','+Math.round(y*8);
 const starts=[];for(let k=0;k<c;k++){starts.push([s/2+k*s,0,1,1]);}for(let k=0;k<r;k++){starts.push([0,s/2+k*s,1,1]);}
 const loops=[];
 for(const st of starts){if(seen.has(key(st[0],st[1])))continue;let px=st[0],py=st[1],dx=st[2],dy=st[3];if(py===0)dy=1;if(px===0)dx=1;
  const pts=[];for(let n=0;n<400;n++){pts.push([px,py]);seen.add(key(px,py));const tx=dx>0?W-px:px,ty=dy>0?H-py:py,t=Math.min(tx,ty);px+=dx*t;py+=dy*t;
   if(tx<=ty+1e-6)dx=-dx;if(ty<=tx+1e-6)dy=-dy;if(Math.abs(px-st[0])<1e-6&&Math.abs(py-st[1])<1e-6)break;}
  loops.push(pts);}
 const rad=s*.42;g.save();g.translate(x0,y0);
 const pathOf=pts=>{g.beginPath();const n=pts.length;const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s0=m(pts[0],pts[1]);g.moveTo(s0[0],s0[1]);
  for(let i=1;i<=n;i++){const v=pts[i%n],nx=pts[(i+1)%n];g.arcTo(v[0],v[1],nx[0],nx[1],rad);}g.closePath();};
 for(const L of loops)hlRibbon(g,()=>pathOf(L),w,fill,edge);
 // over-crossings: redraw the over strand across every crossing (alternating along each strand)
 const e=Math.max(2,w*.5)/2,hb=(w/2+e)*1.25,hf=hb+w*.35;
 for(let i=1;i<2*c;i++)for(let j=1;j<2*r;j++){if((i-j)%2===0)continue;const x=i*s/2,y=j*s/2;const up=(i%2===0);const d=up?[1,1]:[1,-1];const k=Math.SQRT1_2;
  g.lineCap='butt';g.strokeStyle=edge||HFORM.black;g.lineWidth=w+e*2;g.beginPath();g.moveTo(x-d[0]*k*hb,y-d[1]*k*hb);g.lineTo(x+d[0]*k*hb,y+d[1]*k*hb);g.stroke();
  g.strokeStyle=fill;g.lineWidth=w;g.beginPath();g.moveTo(x-d[0]*k*hf,y-d[1]*k*hf);g.lineTo(x+d[0]*k*hf,y+d[1]*k*hf);g.stroke();}
 g.restore();}
// Braided ring: two strands round a circle, woven — the border of roundels and the tree of life.
function hlBraidRing(g,cx,cy,R,A,n,w,f1,f2){const S=(k,t)=>{const r=R+A*Math.sin(n*t+k*Math.PI);return[cx+r*Math.cos(t),cy+r*Math.sin(t)];};
 for(const k of[0,1])hlRibbon(g,()=>{g.beginPath();for(let i=0;i<=240;i++){const p=S(k,i/240*TAU);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.closePath();},w,k?f2:f1);
 for(let m=0;m<2*n;m++){const t0=m*Math.PI/n,k=m%2;const e=Math.max(2,w*.5)/2;
  for(const [lw,col,span] of[[w+e*2,HFORM.black,.16],[w,k?f2:f1,.24]]){g.beginPath();for(let i=0;i<=8;i++){const p=S(k,t0+(i/8-.5)*span*Math.PI/n*2);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);}g.lineWidth=lw;g.strokeStyle=col;g.lineCap='butt';g.stroke();}}}
// A spiral (for triskeles, cats' haunches, hammer heads)
function hlSpiral(g,cx,cy,r,turns,col,lw,a0,dir){g.beginPath();const N=60;for(let i=0;i<=N;i++){const t=i/N,a=(a0||0)+(dir||1)*t*turns*TAU,rr2=r*(.12+.88*t);const x=cx+Math.cos(a)*rr2,y=cy+Math.sin(a)*rr2;i?g.lineTo(x,y):g.moveTo(x,y);}
 g.lineWidth=lw;g.strokeStyle=col;g.lineCap='round';g.stroke();}
function hlStar4(g,x,y,r,col){g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,q=i%2?r*.3:r;i?g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):g.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();g.fillStyle=col;g.fill();}
function hlCircle(g,x,y,r,fill,line,lw){g.beginPath();g.arc(x,y,r,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(line){g.lineWidth=lw||2;g.strokeStyle=line;g.stroke();}}

// ---------------------------------------------------------------- motifs (unit box 100 x 100 unless noted)
function hlTriskele(g,cols){cols=cols||[HFORM.red,HFORM.teal,HFORM.ochre];
 for(let k=0;k<3;k++){const a=k*TAU/3-Math.PI/2,cx=50+Math.cos(a)*20,cy=50+Math.sin(a)*20;
  hlRibbon(g,()=>{g.beginPath();const N=50;for(let i=0;i<=N;i++){const t=i/N,ang=a+Math.PI*.2+t*2.3*Math.PI,r=2+t*17;const x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;i?g.lineTo(x,y):g.moveTo(x,y);}
   const b=a+TAU/3;g.quadraticCurveTo(50+Math.cos(b)*14,50+Math.sin(b)*14,50,50);},7,cols[k]);}
 hlCircle(g,50,50,6,HFORM.black);hlCircle(g,50,50,2.6,HFORM.white);}
function hlTreeOfLife(g){hlBraidRing(g,50,50,42,3.2,9,4.2,HFORM.red,HFORM.teal);
 const br=(pts,w)=>hlRibbon(g,()=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);},w,HFORM.cedarD);
 for(const s of[-1,1]){for(const [a,c1] of[[-.25,.5],[-.55,.4],[-.9,.25]]){const ta=-Math.PI/2+s*(Math.PI/2+a*Math.PI/2)*.9;const ex=50+Math.cos(ta)*40,ey=50+Math.sin(ta)*40;br([[50,48],[50+s*6,30],[ex-s*10,ey+8],[ex,ey]],4.2);}
  for(const a of[.3,.6]){const ta=Math.PI/2-s*a*Math.PI/2;const ex=50+Math.cos(ta)*40,ey=50+Math.sin(ta)*40;br([[50,62],[50+s*4,74],[ex-s*6,ey-6],[ex,ey]],4);}}
 hlRibbon(g,()=>{g.beginPath();g.moveTo(50,86);g.lineTo(50,40);},9,HFORM.cedarD);
 for(let i=0;i<22;i++){const a=-Math.PI*(.12+.76*h3(i,2,3)),r=16+22*h3(i,5,1);hlOvoid(g,50+Math.cos(a)*r,50+Math.sin(a)*r,6,4.6,HFORM.black,i%3?HFORM.teal:HFORM.ochre,1.2);}}
function hlCat(g){   // Celtic cat sitting, facing +x, tail curling into a spiral knot
 hlRibbon(g,()=>{g.beginPath();g.moveTo(34,88);g.bezierCurveTo(6,92,2,62,18,56);g.bezierCurveTo(32,50,34,70,22,72);g.bezierCurveTo(14,73,14,64,20,63);},5,HFORM.red);
 g.beginPath();g.moveTo(30,90);g.bezierCurveTo(22,70,26,48,44,40);g.quadraticCurveTo(52,34,56,30);g.lineTo(58,10);g.lineTo(65,19);g.lineTo(72,19);g.lineTo(79,10);g.lineTo(80,30);
 g.quadraticCurveTo(82,40,72,44);g.quadraticCurveTo(70,62,74,86);g.lineTo(76,92);g.lineTo(64,92);g.lineTo(62,70);g.quadraticCurveTo(56,82,52,92);g.closePath();hlFill(g,HFORM.black);
 hlSpiral(g,42,72,11,1.6,HFORM.red,3,0,1);hlOvoid(g,62,52,12,9,HFORM.red,HFORM.teal,2);hlUForm(g,50,56,10,8,HFORM.red,2.4);
 g.beginPath();g.ellipse(74,27,4,2.4,0,0,TAU);hlFill(g,HFORM.ochre);g.beginPath();g.ellipse(74,27,1,2.2,0,0,TAU);hlFill(g,HFORM.black);
 for(const s of[-1,1]){g.beginPath();g.moveTo(80,34);g.lineTo(92,32+s*3);hlLine(g,HFORM.white,.8);}}
function hlWolf(g){   // wolf loping, facing +x, box 200 x 100: long legs, deep chest, bushy tail held low
 g.beginPath();g.moveTo(48,40);g.bezierCurveTo(74,28,116,28,140,34);g.quadraticCurveTo(150,28,158,26);g.lineTo(162,10);g.lineTo(170,22);g.lineTo(176,22);g.lineTo(198,34);g.lineTo(194,38);g.lineTo(178,40);g.lineTo(188,46);
 g.lineTo(170,48);g.quadraticCurveTo(160,50,154,58);g.lineTo(168,88);g.lineTo(176,90);g.lineTo(174,95);g.lineTo(158,94);g.lineTo(140,62);g.quadraticCurveTo(106,64,80,58);
 g.lineTo(62,84);g.lineTo(40,92);g.lineTo(36,88);g.lineTo(52,78);g.lineTo(56,56);g.quadraticCurveTo(48,52,48,46);g.bezierCurveTo(30,50,18,62,8,76);g.bezierCurveTo(22,74,36,64,50,54);g.closePath();hlFill(g,HFORM.black);
 hlOvoid(g,146,44,20,15,HFORM.red,HFORM.teal,2.5);hlOvoid(g,66,46,20,15,HFORM.red,HFORM.teal,2.5);hlUForm(g,106,42,26,11,HFORM.red,3.5);hlUForm(g,156,74,7,12,HFORM.red,2.4);hlUForm(g,58,70,7,12,HFORM.red,2.4);
 hlOvoid(g,172,28,8,6,null,HFORM.white);hlOvoid(g,173,28.5,4,3,null,HFORM.black);g.beginPath();g.moveTo(184,42);g.lineTo(195,37);hlLine(g,HFORM.red,2);
 hlSplitU(g,26,64,7,12,HFORM.red,2.4);}
function hlHammer(g){   // Mjölnir with a plaited handle and spiral head
 g.save();g.beginPath();g.moveTo(42,54);g.lineTo(20,54);g.quadraticCurveTo(10,54,9,64);g.lineTo(12,82);g.quadraticCurveTo(30,74,50,94);g.quadraticCurveTo(70,74,88,82);g.lineTo(91,64);g.quadraticCurveTo(90,54,80,54);g.lineTo(58,54);
 g.lineTo(58,16);g.lineTo(42,16);g.closePath();hlFill(g,HFORM.black);g.clip();hlPlait(g,40,14,1,5,8.4,3.2,HFORM.ochre);g.restore();
 hlSpiral(g,22,66,9,1.5,HFORM.red,3,Math.PI,1);hlSpiral(g,78,66,9,1.5,HFORM.red,3,0,-1);hlOvoid(g,50,70,14,10,HFORM.ochre,HFORM.teal,2);
 hlRibbon(g,()=>{g.beginPath();g.arc(50,10,6,0,TAU);},3,HFORM.red);}
function hlGrain(g){   // a wheat sheaf tied with a red band
 for(let k=-3;k<=3;k++){const tx=50+k*9,ty=18+Math.abs(k)*4;g.beginPath();g.moveTo(50+k*2,86);g.quadraticCurveTo(50+k*2.5,60,tx,ty+14);hlLine(g,HFORM.black,2.2);
  for(let i=0;i<6;i++){const y=ty+i*4.4;for(const s of[-1,1]){g.beginPath();g.ellipse(tx+s*3,y+2,2.6,4.4,s*.5,0,TAU);g.fillStyle=HFORM.ochre;g.fill();g.lineWidth=1;g.strokeStyle=HFORM.black;g.stroke();}}
  g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+k*.6,ty-10);hlLine(g,HFORM.black,1);}
 g.beginPath();g.ellipse(50,68,14,5,0,0,TAU);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);g.beginPath();g.moveTo(40,68);g.lineTo(60,68);hlLine(g,HFORM.ochre,1.4);}
function hlRocket(g){   // a rocket climbing among stars — Raketstad's own sign
 for(const [x,y,r] of[[14,18,5],[84,24,6],[20,60,4],[86,70,5],[12,86,3]])hlStar4(g,x,y,r,HFORM.ochre);
 g.beginPath();g.moveTo(50,4);g.bezierCurveTo(64,16,64,40,62,70);g.lineTo(38,70);g.bezierCurveTo(36,40,36,16,50,4);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
 g.beginPath();g.moveTo(50,4);g.bezierCurveTo(58,10,60,16,61,22);g.lineTo(39,22);g.bezierCurveTo(40,16,42,10,50,4);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);
 for(const s of[-1,1]){g.beginPath();g.moveTo(50+s*11,52);g.quadraticCurveTo(50+s*24,62,50+s*24,80);g.lineTo(50+s*12,70);g.closePath();hlFill(g,HFORM.teal);hlLine(g,HFORM.black,2);}
 hlCircle(g,50,36,6.5,HFORM.teal,HFORM.black,3);hlCircle(g,50,36,2.6,HFORM.white);hlUForm(g,50,56,12,8,HFORM.red,2.6);
 g.beginPath();g.moveTo(40,70);g.quadraticCurveTo(50,100,60,70);hlFill(g,HFORM.ochre);g.beginPath();g.moveTo(44,70);g.quadraticCurveTo(50,90,56,70);hlFill(g,HFORM.red);}
function hlMoth(g){   // symmetric moth, formline eyespots
 hlMirror(g,100,100,50,g=>{g.beginPath();g.moveTo(48,38);g.bezierCurveTo(34,20,12,12,4,22);g.bezierCurveTo(2,34,8,46,47,54);g.closePath();hlFill(g,HFORM.teal);hlLine(g,HFORM.black,3);
  g.beginPath();g.moveTo(47,54);g.bezierCurveTo(24,56,12,70,20,82);g.bezierCurveTo(30,90,44,80,48,62);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,3);
  hlEye(g,24,32,16,11,HFORM.ochre);hlUForm(g,30,70,10,10,HFORM.black,2.4);hlTrigon(g,10,24,6,HFORM.white);
  g.beginPath();g.moveTo(48,26);g.quadraticCurveTo(44,10,34,6);hlLine(g,HFORM.black,1.6);hlCircle(g,34,6,1.8,HFORM.black);});
 g.beginPath();g.ellipse(50,52,4.5,24,0,0,TAU);hlFill(g,HFORM.black);hlCircle(g,50,26,5,HFORM.black);for(let i=0;i<4;i++){g.beginPath();g.moveTo(46,44+i*6);g.lineTo(54,44+i*6);hlLine(g,HFORM.ochre,1.4);}}
function hlWarrior(g,flip){   // a Norse warrior in profile: helm, round shield (triskele), spear — no face drawn
 g.save();if(flip){g.translate(100,0);g.scale(-1,1);}
 g.beginPath();g.moveTo(58,6);g.lineTo(58,94);hlLine(g,HFORM.black,2.4);g.beginPath();g.moveTo(58,2);g.lineTo(55,10);g.lineTo(58,14);g.lineTo(61,10);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,1.2);
 g.beginPath();g.moveTo(40,92);g.lineTo(46,62);g.lineTo(52,92);hlLine(g,HFORM.black,5);
 g.beginPath();g.moveTo(34,64);g.lineTo(38,34);g.lineTo(56,32);g.lineTo(60,64);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,2.4);
 g.beginPath();g.moveTo(38,34);g.quadraticCurveTo(20,50,24,74);g.lineTo(36,64);hlFill(g,HFORM.teal);hlLine(g,HFORM.black,2);
 g.beginPath();g.moveTo(55,40);g.lineTo(60,46);hlLine(g,HFORM.black,5);
 g.beginPath();g.arc(47,22,9,Math.PI,0);g.lineTo(56,28);g.lineTo(38,28);g.closePath();hlFill(g,HFORM.black);g.fillStyle=HFORM.ochre;g.fillRect(38,21,18,2.4);g.fillRect(52,21,2.4,9);
 g.beginPath();g.ellipse(47,31,7,5,0,0,Math.PI);hlFill(g,HFORM.cedarD);
 g.save();g.translate(42,50);g.scale(.36,.36);g.translate(-50,-50);hlCircle(g,50,50,48,HFORM.white,HFORM.black,6);hlTriskele(g,[HFORM.red,HFORM.teal,HFORM.black]);g.restore();
 g.restore();}
function hlSun(g){for(let i=0;i<16;i++){const a=i/16*TAU;g.save();g.translate(50,50);g.rotate(a);
  if(i%2){g.beginPath();g.moveTo(-6,-30);g.lineTo(0,-49);g.lineTo(6,-30);g.closePath();hlFill(g,HFORM.red);hlLine(g,HFORM.black,1.6);}
  else{hlUForm(g,0,-38,8,12,HFORM.ochre,2.6);}g.restore();}
 hlCircle(g,50,50,27,HFORM.ochre,HFORM.black,3.4);hlCircle(g,50,50,19,HFORM.black);hlCircle(g,50,50,15,HFORM.ochre);
 g.save();g.translate(50,50);g.scale(.26,.26);g.translate(-50,-50);hlTriskele(g,[HFORM.red,HFORM.teal,HFORM.red]);g.restore();}
// crescent path: the part of circle (cx,cy,R) outside circle (ox,oy,r)
function hlCrescent(g,cx,cy,R,ox,oy,r){const dx=ox-cx,dy=oy-cy,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;const a=(R*R-r*r+d*d)/(2*d),hh=Math.sqrt(Math.max(0,R*R-a*a));
 const bx=cx+ux*a,by=cy+uy*a,p1=[bx-uy*hh,by+ux*hh],p2=[bx+uy*hh,by-ux*hh];const t1=Math.atan2(p1[1]-cy,p1[0]-cx),t2=Math.atan2(p2[1]-cy,p2[0]-cx);
 const s1=Math.atan2(p1[1]-oy,p1[0]-ox),s2=Math.atan2(p2[1]-oy,p2[0]-ox);
 g.beginPath();g.arc(cx,cy,R,t2,t1,true);g.arc(ox,oy,r,s1,s2,false);g.closePath();}
function hlMoon(g){for(const [x,y,r] of[[78,22,6],[86,52,4],[70,82,5],[20,14,3]])hlStar4(g,x,y,r,HFORM.ochre);
 hlCrescent(g,44,50,38,62,40,31);hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
 g.save();hlCrescent(g,44,50,38,62,40,31);g.clip();hlSplitU(g,17,56,9,14,HFORM.teal,2.6);hlUForm(g,32,80,12,8,HFORM.red,2.6);hlOvoid(g,16,38,7,5,HFORM.black,HFORM.teal,1.4);g.restore();}
function hlStar8(g){g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU-Math.PI/2,r=i%2?26:46;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);
 for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2;g.save();g.translate(50+Math.cos(a)*30,50+Math.sin(a)*30);g.rotate(a+Math.PI/2);hlUForm(g,0,0,7,8,HFORM.red,2);g.restore();}
 hlCircle(g,50,50,17,HFORM.teal,HFORM.black,3);hlStar4(g,50,50,12,HFORM.white);}
function hlGasGiant(g){for(const [x,y,r] of[[10,12,4],[90,16,5],[86,86,4],[14,84,3],[62,8,3]])hlStar4(g,x,y,r,HFORM.ochre);
 const ring=(back)=>{g.beginPath();g.ellipse(50,52,46,11,-.28,back?Math.PI:0,back?TAU:Math.PI);g.lineWidth=5;g.strokeStyle=HFORM.black;g.stroke();g.lineWidth=2.6;g.strokeStyle=HFORM.ochre;g.stroke();};
 ring(true);g.save();g.beginPath();g.arc(50,52,30,0,TAU);g.clip();const B=['#9cc4a4','#5f927a','#c3dcb8',HFORM.teal,'#7aa888','#b4d0a4','#4f7e68','#8fb896'];   // the giant is greenish, as it hangs in the sky
 for(let i=0;i<B.length;i++){g.fillStyle=B[i];g.beginPath();const y0=22+i*7.6;g.moveTo(10,y0);for(let x=10;x<=90;x+=4)g.lineTo(x,y0+Math.sin(x*.14+i)*1.6);g.lineTo(90,y0+9);g.lineTo(10,y0+9);g.fill();}
 hlOvoid(g,62,60,10,6,HFORM.black,HFORM.tealD,1.4);g.restore();hlCircle(g,50,52,30,null,HFORM.black,3);ring(false);
 hlCircle(g,16,40,5,HFORM.white,HFORM.black,1.6);hlCircle(g,84,74,3.4,HFORM.teal,HFORM.black,1.4);}
// THE REPUBLIC: three arms in a triskelion. Each upper arm runs out from the centre, bends 90° at the elbow, and the
// fist holds its sword at a right angle to the forearm, blade out toward the rim (Travis's crest reference).
function hlEmblem(g,bg){hlCircle(g,50,50,48,bg||HFORM.ochre,HFORM.black,4);hlBraidRing(g,50,50,43,2.2,12,2.6,HFORM.red,HFORM.black);
 for(let k=0;k<3;k++){g.save();g.translate(50,50);g.rotate(k*TAU/3);g.scale(.86,.86);
  // sword first (the fist closes over the grip): blade radial, outward; guard across it; pommel below the fist
  g.fillStyle=HFORM.white;g.beginPath();g.moveTo(13.3,-25);g.lineTo(13.3,-43);g.lineTo(16,-48);g.lineTo(18.7,-43);g.lineTo(18.7,-25);g.closePath();g.fill();g.lineWidth=1.6;g.strokeStyle=HFORM.black;g.stroke();
  g.beginPath();g.moveTo(16,-27);g.lineTo(16,-42);hlLine(g,'#9aa6a8',1);
  g.fillStyle=HFORM.ochre;g.beginPath();g.moveTo(8,-26.5);g.quadraticCurveTo(16,-24,24,-26.5);g.lineTo(24,-23.5);g.quadraticCurveTo(16,-21,8,-23.5);g.closePath();g.fill();g.lineWidth=1.2;g.stroke();
  hlCircle(g,16,-14.5,2.6,HFORM.ochre,HFORM.black,1.2);
  hlRibbon(g,()=>{g.beginPath();g.moveTo(0,-2);g.lineTo(0,-20);g.lineTo(11,-20);},8.5,HFORM.red);                  // upper arm out, forearm bent 90°
  g.fillStyle=HFORM.teal;g.fillRect(8.5,-24.6,3.4,9.2);g.lineWidth=1.2;g.strokeStyle=HFORM.black;g.strokeRect(8.5,-24.6,3.4,9.2);   // cuff
  g.beginPath();g.ellipse(16,-20,4.6,5.4,0,0,TAU);hlFill(g,'#e8d2a8');hlLine(g,HFORM.black,1.6);                    // fist round the grip
  for(let i=0;i<3;i++){g.beginPath();g.moveTo(17.5,-23+i*2.6);g.lineTo(20.2,-23+i*2.6);hlLine(g,HFORM.black,.8);}
  g.restore();}
 hlCircle(g,50,50,8,HFORM.black);hlCircle(g,50,50,4,HFORM.ochre);}

// ---------------------------------------------------------------- shop-sign symbols (unit 100, drawn inside a roundel)
const HSIGN={
 tankard:g=>{g.beginPath();g.rect(28,30,34,50);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);g.beginPath();g.arc(66,54,12,-Math.PI/2,Math.PI/2);hlLine(g,HFORM.black,5);
  g.beginPath();g.moveTo(26,32);for(let i=0;i<5;i++)g.arc(30+i*8,28,5,Math.PI,0);g.lineTo(64,34);hlFill(g,HFORM.white);hlLine(g,HFORM.black,2);for(const y of[44,68]){g.fillStyle=HFORM.red;g.fillRect(28,y,34,4);}},
 key:g=>{hlRibbon(g,()=>{g.beginPath();g.arc(30,50,14,0,TAU);},6,HFORM.ochre);hlRibbon(g,()=>{g.beginPath();g.moveTo(44,50);g.lineTo(84,50);g.moveTo(74,50);g.lineTo(74,62);g.moveTo(82,50);g.lineTo(82,60);},6,HFORM.ochre);hlCircle(g,30,50,4,HFORM.red);},
 bread:g=>{g.beginPath();g.ellipse(50,56,36,20,0,0,TAU);hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);for(const x of[32,44,56,68]){g.beginPath();g.moveTo(x-5,48);g.lineTo(x+5,62);hlLine(g,HFORM.cedarD,3);}hlStar4(g,50,24,6,HFORM.red);},
 anvil:g=>{g.beginPath();g.moveTo(14,40);g.lineTo(80,40);g.quadraticCurveTo(90,40,88,50);g.lineTo(64,54);g.lineTo(60,68);g.lineTo(70,80);g.lineTo(30,80);g.lineTo(40,68);g.lineTo(36,54);g.quadraticCurveTo(18,52,14,40);hlFill(g,HFORM.black);
  g.save();g.translate(58,26);g.rotate(-.5);g.fillStyle=HFORM.red;g.fillRect(-4,-4,30,7);g.fillStyle=HFORM.ochre;g.fillRect(-12,-10,12,18);g.restore();},
 axe:g=>{g.beginPath();g.moveTo(30,86);g.lineTo(62,18);hlLine(g,HFORM.cedarD,6);g.beginPath();g.moveTo(52,20);g.quadraticCurveTo(76,6,86,26);g.quadraticCurveTo(76,34,64,40);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  g.save();g.translate(50,60);g.rotate(.6);g.fillStyle=HFORM.teal;g.fillRect(-30,-4,60,9);for(let i=0;i<10;i++){g.beginPath();g.moveTo(-30+i*6,5);g.lineTo(-27+i*6,10);g.lineTo(-24+i*6,5);hlFill(g,HFORM.black);}g.restore();},
 wheel:g=>{hlCircle(g,50,50,34,null,HFORM.black,9);hlCircle(g,50,50,34,null,HFORM.ochre,4);for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(50,50);g.lineTo(50+Math.cos(a)*32,50+Math.sin(a)*32);hlLine(g,HFORM.black,4);}hlCircle(g,50,50,8,HFORM.red,HFORM.black,3);},
 barrel:g=>{g.beginPath();g.moveTo(30,18);g.quadraticCurveTo(20,50,30,82);g.lineTo(70,82);g.quadraticCurveTo(80,50,70,18);g.closePath();hlFill(g,HFORM.cedar);hlLine(g,HFORM.black,3);
  for(const y of[28,72]){g.beginPath();g.moveTo(26,y);g.lineTo(74,y);hlLine(g,HFORM.black,5);}for(const x of[40,50,60]){g.beginPath();g.moveTo(x,20);g.lineTo(x,80);hlLine(g,HFORM.cedarD,1.5);}hlOvoid(g,50,50,14,10,HFORM.black,HFORM.teal,2);},
 scales:g=>{g.beginPath();g.moveTo(50,12);g.lineTo(50,80);g.moveTo(20,26);g.lineTo(80,26);g.moveTo(34,82);g.lineTo(66,82);hlLine(g,HFORM.black,4);
  for(const s of[-1,1]){g.beginPath();g.moveTo(50+s*30,26);g.lineTo(50+s*20,52);g.moveTo(50+s*30,26);g.lineTo(50+s*40,52);hlLine(g,HFORM.black,1.6);g.beginPath();g.arc(50+s*30,52,11,0,Math.PI);hlFill(g,s<0?HFORM.red:HFORM.teal);hlLine(g,HFORM.black,2);}},
 horse:g=>{g.beginPath();g.moveTo(34,88);g.quadraticCurveTo(30,50,46,30);g.lineTo(50,14);g.lineTo(56,26);g.quadraticCurveTo(72,30,86,56);g.lineTo(80,64);g.quadraticCurveTo(68,58,62,52);g.quadraticCurveTo(66,72,72,88);g.closePath();hlFill(g,HFORM.black);
  hlOvoid(g,60,38,8,6,null,HFORM.white);hlOvoid(g,61,38.5,4,3,null,HFORM.black);hlRibbon(g,()=>{g.beginPath();g.moveTo(44,32);g.quadraticCurveTo(30,50,34,80);},3,HFORM.red);hlUForm(g,54,66,10,10,HFORM.teal,2.6);},
 sack:g=>{g.beginPath();g.moveTo(40,24);g.quadraticCurveTo(18,50,26,82);g.lineTo(74,82);g.quadraticCurveTo(82,50,60,24);g.closePath();hlFill(g,'#d9b48a');hlLine(g,HFORM.black,3);
  g.beginPath();g.moveTo(38,24);g.lineTo(62,24);hlLine(g,HFORM.red,5);g.beginPath();g.moveTo(44,22);g.lineTo(40,10);g.moveTo(56,22);g.lineTo(60,10);hlLine(g,HFORM.black,2.4);hlStar4(g,50,58,10,HFORM.red);},
 gear:g=>{g.beginPath();for(let i=0;i<24;i++){const a=i/24*TAU,r=(i%2)?30:38;const x=50+Math.cos(a)*r,y=50+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();hlFill(g,HFORM.ochre);hlLine(g,HFORM.black,3);
  hlCircle(g,50,50,18,HFORM.teal,HFORM.black,3);hlCircle(g,50,50,6,HFORM.black);},
 flask:g=>{g.beginPath();g.moveTo(44,14);g.lineTo(44,40);g.quadraticCurveTo(20,52,24,72);g.quadraticCurveTo(30,90,50,90);g.quadraticCurveTo(70,90,76,72);g.quadraticCurveTo(80,52,56,40);g.lineTo(56,14);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  g.save();g.clip();g.fillStyle=HFORM.red;g.fillRect(0,62,100,40);g.restore();hlCircle(g,40,72,3,HFORM.ochre);hlCircle(g,56,78,4,HFORM.ochre);hlStar4(g,76,22,10,HFORM.ochre);hlStar4(g,24,26,6,HFORM.red);},
 sheaf:g=>hlGrain(g),
 swords:g=>{for(const s of[-1,1]){g.save();g.translate(50,52);g.rotate(s*.7);g.fillStyle=HFORM.white;g.beginPath();g.moveTo(-3,-38);g.lineTo(0,-44);g.lineTo(3,-38);g.lineTo(3,20);g.lineTo(-3,20);g.closePath();g.fill();g.lineWidth=1.6;g.strokeStyle=HFORM.black;g.stroke();
  g.fillStyle=HFORM.ochre;g.fillRect(-10,20,20,4);g.fillStyle=HFORM.cedarD;g.fillRect(-2.5,24,5,12);hlCircle(g,0,38,3.4,HFORM.red,HFORM.black,1);g.restore();}},
 boot:g=>{g.beginPath();g.moveTo(34,14);g.lineTo(58,14);g.lineTo(58,60);g.quadraticCurveTo(84,62,86,80);g.lineTo(30,80);g.closePath();hlFill(g,HFORM.cedarD);hlLine(g,HFORM.black,3);g.fillStyle=HFORM.black;g.fillRect(28,78,60,7);g.fillStyle=HFORM.red;g.fillRect(34,22,24,5);},
 shears:g=>{for(const s of[-1,1]){g.save();g.translate(50,54);g.rotate(s*.35);g.beginPath();g.moveTo(-3,0);g.lineTo(0,-44);g.lineTo(4,0);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,1.6);hlRibbon(g,()=>{g.beginPath();g.arc(0,16,8,0,TAU);},4,s<0?HFORM.red:HFORM.teal);g.restore();}},
 fish:g=>hlIn(g,4,22,92,56,200,80,hlSalmon),
 pig:g=>{g.beginPath();g.ellipse(46,54,32,20,0,0,TAU);hlFill(g,'#e0a898');hlLine(g,HFORM.black,3);g.beginPath();g.ellipse(80,50,8,9,0,0,TAU);hlFill(g,'#e0a898');hlLine(g,HFORM.black,2.4);
  for(const x of[28,40,56,66]){g.fillStyle=HFORM.black;g.fillRect(x,70,5,12);}g.beginPath();g.moveTo(68,36);g.lineTo(72,24);g.lineTo(76,38);hlFill(g,HFORM.red);hlOvoid(g,70,44,5,4,null,HFORM.black);hlSpiral(g,12,46,5,1.2,HFORM.black,2);},
 candle:g=>{g.fillStyle=HFORM.white;g.fillRect(40,38,20,48);g.lineWidth=3;g.strokeStyle=HFORM.black;g.strokeRect(40,38,20,48);g.beginPath();g.moveTo(50,14);g.quadraticCurveTo(62,28,50,36);g.quadraticCurveTo(38,28,50,14);hlFill(g,HFORM.ochre);hlLine(g,HFORM.red,2);g.fillStyle=HFORM.red;g.fillRect(34,84,32,6);},
 book:g=>{for(const s of[-1,1]){g.beginPath();g.moveTo(50,30);g.quadraticCurveTo(50+s*20,22,50+s*40,28);g.lineTo(50+s*40,78);g.quadraticCurveTo(50+s*20,72,50,80);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);
  for(let i=0;i<4;i++){g.beginPath();g.moveTo(50+s*8,40+i*8);g.lineTo(50+s*32,38+i*8);hlLine(g,i%2?HFORM.red:HFORM.teal,2);}}},
 mortar:g=>{g.beginPath();g.moveTo(22,46);g.lineTo(78,46);g.quadraticCurveTo(76,80,50,82);g.quadraticCurveTo(24,80,22,46);hlFill(g,HFORM.teal);hlLine(g,HFORM.black,3);g.beginPath();g.moveTo(52,46);g.lineTo(76,14);hlLine(g,HFORM.black,8);hlLine(g,HFORM.ochre,4);
  for(const s of[-1,1]){g.beginPath();g.ellipse(50+s*16,32,8,4,s*.5,0,TAU);hlFill(g,'#5f9a4a');hlLine(g,HFORM.black,1.4);}},
 hammer:g=>hlHammer(g),
 rocket:g=>hlRocket(g),
 star:g=>hlStar8(g),
 salvage:g=>{g.beginPath();g.moveTo(22,24);g.lineTo(70,18);g.lineTo(78,64);g.lineTo(30,74);g.closePath();hlFill(g,HFORM.white);hlLine(g,HFORM.black,3);   // an Ancient panel, a crowbar across it
  for(const [x,y] of[[28,30],[64,25],[71,58],[34,66]])hlCircle(g,x,y,2.2,HFORM.teal,HFORM.black,1);g.beginPath();g.moveTo(40,34);g.lineTo(62,31);g.moveTo(42,48);g.lineTo(66,44);hlLine(g,'#9aa6a8',2);
  g.save();g.translate(50,56);g.rotate(-.7);g.fillStyle=HFORM.red;g.fillRect(-36,-3.5,64,7);g.lineWidth=2;g.strokeStyle=HFORM.black;g.strokeRect(-36,-3.5,64,7);g.beginPath();g.moveTo(28,-3.5);g.quadraticCurveTo(40,-6,38,8);g.lineTo(32,6);g.quadraticCurveTo(33,2,28,3.5);hlFill(g,HFORM.red);hlLine(g,HFORM.black,2);g.restore();},
 bed:g=>{g.fillStyle=HFORM.cedarD;g.fillRect(14,52,72,18);g.fillRect(14,36,8,44);g.fillRect(78,46,8,34);g.fillStyle=HFORM.white;g.fillRect(24,44,20,10);g.fillStyle=HFORM.red;g.fillRect(40,46,38,8);hlStar4(g,70,22,8,HFORM.ochre);g.beginPath();g.arc(32,20,9,.5,5.5);g.arc(36,17,8,5.2,.9,true);hlFill(g,HFORM.white);},
};

// ---------------------------------------------------------------- composing the textures
const HMOTIF={wide:[],gable:[],tall:[],disc:[],sign:{},pillar:[]};
function hlMakeTex(w,h,fn,alpha){const t=canvasTex(w,h,(g,W,H)=>{if(alpha)g.clearRect(0,0,W,H);fn(g,W,H);});return t;}
function hlMotifItem(kind,name,tex,alpha,box){const m=hStd({map:tex,roughness:.8});if(alpha){m.alphaTest=.5;}const k='hM_'+kind+'_'+name;MAT[k]=m;kdef(k,box?VBOX:VPLANE,m);return k;}
const HBG={cedar:(g,w,h)=>hlCedar(g,w,h,HFORM.cedar,false),cedarV:(g,w,h)=>hlCedar(g,w,h,HFORM.cedar,true),white:(g,w,h)=>{g.fillStyle=HFORM.white;g.fillRect(0,0,w,h);},
 pale:(g,w,h)=>{g.fillStyle='#bfd9d2';g.fillRect(0,0,w,h);},dark:(g,w,h)=>hlCedar(g,w,h,HFORM.cedarD,false)};
const hlFrame=(g,w,h)=>{g.lineWidth=h*.035;g.strokeStyle=HFORM.black;g.strokeRect(h*.018,h*.018,w-h*.036,h-h*.036);};
// wide murals (512 x 256)
const HWIDE={
 wolves:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w*.01,h*.16,w*.35,h*.7,200,100,hlWolf);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.01,h*.16,w*.35,h*.7,200,100,hlWolf);g.restore();hlIn(g,w/2-h*.34,h*.16,h*.68,h*.68,100,100,hlTriskele);hlFrame(g,w,h);},
 cats:(g,w,h)=>{HBG.white(g,w,h);hlIn(g,w*.02,h*.14,h*.76,h*.76,100,100,hlCat);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.02,h*.14,h*.76,h*.76,100,100,hlCat);g.restore();hlIn(g,w/2-h*.4,h*.1,h*.8,h*.8,100,100,hlTreeOfLife);hlFrame(g,w,h);},
 knot:(g,w,h)=>{HBG.dark(g,w,h);hlPlait(g,w*.04,h*.1,12,3,w*.92/12,w*.022,HFORM.ochre);hlFrame(g,w,h);},
 knotRed:(g,w,h)=>{HBG.white(g,w,h);hlPlait(g,w*.05,h*.12,10,3,w*.9/10,w*.026,HFORM.red);hlFrame(g,w,h);},
 heavens:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);const f=[hlSun,hlMoon,hlStar8,hlGasGiant];f.forEach((fn,i)=>hlIn(g,w*(.02+i*.245),h*.14,w*.225,h*.72,100,100,fn));hlFrame(g,w,h);},
 grain:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w*.04,h*.1,h*.8,h*.8,100,100,hlGrain);hlIn(g,w-w*.04-h*.8,h*.1,h*.8,h*.8,100,100,hlGrain);hlIn(g,w/2-h*.42,h*.08,h*.84,h*.84,100,100,hlSun);hlFrame(g,w,h);},
 rocket:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);hlIn(g,w*.04,h*.1,h*.8,h*.8,100,100,hlGasGiant);hlIn(g,w/2-h*.45,h*.05,h*.9,h*.9,100,100,hlRocket);hlIn(g,w-w*.04-h*.8,h*.1,h*.8,h*.8,100,100,hlMoon);hlFrame(g,w,h);},
 warriors:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w*.1,h*.06,h*.9,h*.9,100,100,g=>hlWarrior(g,false));hlIn(g,w-w*.1-h*.9,h*.06,h*.9,h*.9,100,100,g=>hlWarrior(g,true));hlIn(g,w/2-h*.4,h*.1,h*.8,h*.8,100,100,hlHammer);hlFrame(g,w,h);},
 moth:(g,w,h)=>{HBG.white(g,w,h);hlIn(g,w/2-h*.5,h*.02,h,h*.96,100,100,hlMoth);for(const x of[.03,.83])hlPlait(g,w*x,h*.2,2,4,w*.07,w*.018,HFORM.red);hlFrame(g,w,h);},
 hammer:(g,w,h)=>{HBG.pale(g,w,h);hlPlait(g,w*.04,h*.28,4,1,w*.065,w*.02,HFORM.red);hlPlait(g,w*.7,h*.28,4,1,w*.065,w*.02,HFORM.red);hlPlait(g,w*.04,h*.56,4,1,w*.065,w*.02,HFORM.teal);hlPlait(g,w*.7,h*.56,4,1,w*.065,w*.02,HFORM.teal);
  hlIn(g,w/2-h*.45,h*.05,h*.9,h*.9,100,100,hlHammer);hlFrame(g,w,h);},
};
// gable crests (512 x 256, meant for the triangle of a gable end)
const HGABLE={
 risingSun:(g,w,h)=>{HBG.cedar(g,w,h);g.save();g.beginPath();g.rect(0,0,w,h*.8);g.clip();hlIn(g,w/2-h*.8,h*.02,h*1.6,h*1.6,100,100,hlSun);g.restore();hlPlait(g,0,h*.8,16,1,w/16,w*.014,HFORM.red);},
 moth:(g,w,h)=>{HBG.cedar(g,w,h);hlIn(g,w/2-h*.52,h*.02,h*1.04,h*.96,100,100,hlMoth);},
 tree:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w/2-h*.48,h*.02,h*.96,h*.96,100,100,hlTreeOfLife);for(const s of[-1,1])hlIn(g,w/2+s*h*.62-h*.3,h*.3,h*.6,h*.6,100,100,s<0?hlStar8:hlMoon);},
 triskele:(g,w,h)=>{HBG.dark(g,w,h);hlIn(g,w/2-h*.46,h*.04,h*.92,h*.92,100,100,hlTriskele);hlIn(g,w*.02,h*.35,w*.3,h*.6,200,100,hlWolf);g.save();g.translate(w,0);g.scale(-1,1);hlIn(g,w*.02,h*.35,w*.3,h*.6,200,100,hlWolf);g.restore();},
 giant:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);hlIn(g,w/2-h*.46,h*.04,h*.92,h*.92,100,100,hlGasGiant);hlIn(g,w*.16,h*.4,h*.5,h*.5,100,100,hlStar8);hlIn(g,w*.84-h*.5,h*.4,h*.5,h*.5,100,100,hlMoon);},
};
// tall boards (128 x 512)
const HTALL={
 knot:(g,w,h)=>{HBG.dark(g,w,h);hlPlait(g,w*.1,h*.03,2,8,w*.4,w*.1,HFORM.ochre);},
 knotTeal:(g,w,h)=>{HBG.cedarV(g,w,h);hlPlait(g,w*.1,h*.03,2,8,w*.4,w*.1,HFORM.teal);},
 heavens:(g,w,h)=>{g.fillStyle='#1d3b44';g.fillRect(0,0,w,h);[hlSun,hlStar8,hlMoon,hlGasGiant].forEach((fn,i)=>hlIn(g,w*.06,h*(.01+i*.25),w*.88,w*.88,100,100,fn));},
 tree:(g,w,h)=>{HBG.pale(g,w,h);hlIn(g,w*.04,h*.02,w*.92,w*.92,100,100,hlTreeOfLife);hlPlait(g,w*.1,h*.26,2,4,w*.4,w*.1,HFORM.red);hlIn(g,w*.04,h*.64,w*.92,w*.92,100,100,hlTriskele);},
};
// roundels (256, alpha outside the disc) — the medallion versions of every motif, for bosses and pillar tops
const HDISC={triskele:hlTriskele,tree:hlTreeOfLife,cat:hlCat,hammer:hlHammer,grain:hlGrain,rocket:hlRocket,moth:hlMoth,sun:hlSun,moon:hlMoon,star:hlStar8,giant:hlGasGiant,wolf:g=>hlIn(g,4,24,92,52,200,100,hlWolf),warrior:g=>hlWarrior(g,false)};
function hlRoundel(g,W,fn,bg,ring){const c=W/2;g.save();g.beginPath();g.arc(c,c,c*.98,0,TAU);g.clip();g.fillStyle=bg;g.fillRect(0,0,W,W);g.restore();
 hlIn(g,W*.16,W*.16,W*.68,W*.68,100,100,fn);hlIn(g,0,0,W,W,100,100,g=>hlBraidRing(g,50,50,44,2.4,ring||10,3,HFORM.red,HFORM.teal));hlCircle(g,c,c,c*.97,null,HFORM.black,W*.03);}
// carved pillars (256 x 1024 per face): four motifs stacked like a totem, with plaited bands between
function hlPillarTex(motifs,bgKind){return canvasTex(256,1024,(g,w,h)=>{(bgKind==='dark'?HBG.dark:HBG.cedarV)(g,w,h);const cell=h/4;
 motifs.forEach((fn,i)=>{const y=i*cell;hlIn(g,w*.08,y+cell*.14,w*.84,w*.84,100,100,fn);hlPlait(g,w*.02,y+cell-cell*.14,6,1,w*.96/6,w*.028,i%2?HFORM.red:HFORM.ochre);});
 g.fillStyle=HFORM.black;g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);});}

// ---------------------------------------------------------------- the textures and kit items
for(const n in HWIDE){HMOTIF.wide.push(hlMotifItem('w',n,hlMakeTex(512,256,HWIDE[n])));}
for(const n in HGABLE){HMOTIF.gable.push(hlMotifItem('g',n,hlMakeTex(512,256,HGABLE[n])));}
for(const n in HTALL){HMOTIF.tall.push(hlMotifItem('t',n,hlMakeTex(128,512,HTALL[n])));}
{const bgs=[HFORM.white,HFORM.cedar,'#bfd9d2',HFORM.ochre];let i=0;for(const n in HDISC){const b=bgs[i++%bgs.length];HMOTIF.disc.push(hlMotifItem('d',n,hlMakeTex(256,256,(g,W)=>hlRoundel(g,W,HDISC[n],b),true),true));}}
{const bgs=[HFORM.white,'#e6c98e','#bfd9d2',HFORM.cedar];let i=0;for(const n in HSIGN){const b=bgs[i++%bgs.length];HMOTIF.sign[n]=hlMotifItem('sign',n,hlMakeTex(256,256,(g,W)=>hlRoundel(g,W,HSIGN[n],b,8),true),true);}}
HMOTIF.emblem=hlMotifItem('d','emblem',hlMakeTex(256,256,(g,W)=>hlIn(g,0,0,W,W,100,100,hlEmblem),true),true);
// the wide crest version of the emblem: the arms on a red field between knot panels (over civic doors)
HMOTIF.emblemWide=hlMotifItem('w','emblem',hlMakeTex(512,256,(g,w,h)=>{g.fillStyle=HFORM.red;g.fillRect(0,0,w,h);hlPlait(g,w*.03,h*.14,3,3,h*.24,h*.07,HFORM.ochre);hlPlait(g,w-w*.03-h*.72,h*.14,3,3,h*.24,h*.07,HFORM.ochre);
 hlIn(g,w/2-h*.47,h*.03,h*.94,h*.94,100,100,hlEmblem);hlFrame(g,w,h);}));
HMOTIF.banner=hlMotifItem('b','republic',hlMakeTex(128,384,(g,w,h)=>{g.fillStyle=HFORM.red;g.fillRect(0,0,w,h);g.fillStyle=HFORM.teal;g.fillRect(0,0,w,h*.06);g.fillRect(0,h*.94,w,h*.06);
 hlIn(g,w*.08,h*.14,w*.84,w*.84,100,100,hlEmblem);hlPlait(g,w*.1,h*.52,2,5,w*.4,w*.1,HFORM.ochre);
 g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(0,h);g.lineTo(w/2,h*.9);g.lineTo(w,h);g.fill();g.globalCompositeOperation='source-over';},true));
MAT[HMOTIF.banner].side=DS;
HMOTIF.pillar=[[hlWolf2,hlHammer,hlTriskele,hlGrain],[hlTreeOfLife,hlCat,hlMoth,hlStar8],[hlSun,hlMoon,hlStar8,hlGasGiant],[hlTriskele,hlRocket,hlWolf2,hlMoon]].map((ms,i)=>hlMotifItem('p',''+i,hlPillarTex(ms,i===2?'dark':'cedar'),false,true));
function hlWolf2(g){hlIn(g,0,22,100,56,200,100,hlWolf);}
// ================================================================= DALAB — the town types (round 10: filling the grid)
// The kinds a full street grid needs between the huts and the civic set: dense dwellings (a terrace row, a stacked
// house), the small civic and trade that stand on every block (a well court, a bath house, a scribes' hall, a
// travellers' inn), the industry the walls are made from (the earth yard), an orchard plot, and the watch towers
// the giants stand at. Same rules as the rest of the kit: peasants build round in rammed earth under thatch, civic
// builds in grey stone with relief and murals and carries The God's light. Front is +z.

// ---------------------------------------------------------------- TERRACE ROW: three joined earth cells under one long thatch ridge
function buildDalabRowhouse(G,o){reseed(8801+(o.v|0));const N=3,CW=5.6,D=6.4,H=2.6;const W=N*CW;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Terrace row (peasant)',0,0,W/2+2,H+4.2);
 vB('dEarth',0,-.05,0,W+1.2,.4,D+1.2,0,dCol(DPAL.earthDark));                                         // the shared plinth
 vB('dEarth',0,.3,0,W,H,D,0,earth);
 for(let k=1;k<N;k++)vB('dEarth',-W/2+k*CW,.3,0,.5,H+.3,D+.5,0,dCol(DPAL.earthDark));                 // party walls stand proud
 for(let k=0;k<N;k++){const x=-W/2+CW/2+k*CW;const c=[DPAL.red,DPAL.turq,DPAL.gold][k%3];
  vnDoor(x-1.2,.3,D/2,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
  vnWin(x+1.3,.3+1.2,D/2,0,.8,.7,'open','vWood',wood,true);dnHearth(x+1.3,.3+1.2,D/2,0,.8,.7);
  vB('dEarth',x,.3+.1,D/2+.06,CW-.9,.5,.12,0,dCol(c));                                                 // each cell its own painted foot
  dnJar(x+2.2,.3,D/2+1.2,.28);}
 // one long thatch: a hip over the whole run, a timber ring beam, a smoke hole at each cell
 vnHipRoof('vHipT',0,.3+H,0,W,D,3.0,0,dCol(DPAL.thatch),1.0);vB('vWood',0,.3+H-.15,0,W+.6,.22,D+.6,0,wood);
 for(let k=0;k<N;k++)vnChimney(-W/2+CW/2+k*CW+1.0,.3+H+2.3,-1.2,1.0,.1,true);
 // the shared yard in front: paving, a drying line, a bench, a woodpile at the end
 vnPaving(0,.02,D/2+2.2,W-2,2.8,0,dCol(DPAL.earthDark),8);vnDryingRack(-W/2+4,0,D/2+3.6,0,4.5);
 vB('vWood',3.5,.35,D/2+2.4,2.4,.1,.4,0,wood);dnWoodpile(W/2+1.1,0,-.6,Math.PI/2,1.6);
 dnFolk(-1,D/2+4.2,3,1.8);}
// ---------------------------------------------------------------- STACKED HOUSE: two storeys of rammed earth, an outside stair to a gallery, three doors up
function buildDalabTenement(G,o){reseed(8811+(o.v|0));const W=11,D=8,H1=2.9,H2=2.6;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth);
 vnReg('Stacked house (peasant)',0,0,8,H1+H2+3.6);
 vB('dEarth',0,-.05,0,W+1.4,.4,D+1.4,0,dCol(DPAL.earthDark));
 kput('dEarthBat',[0,.3,0],null,[W,H1,D],earth);vB('dEarth',0,.3+H1-.1,0,W-.2,H2,D-.2,0,earth.clone().multiplyScalar(1.04));   // the ground floor battered, the upper straight
 vB('dEarth',0,.3+H1-.1,D/2-.05,W,.3,.16,0,dCol(DPAL.red));                                                      // the red string course
 vnDoor(-3.2,.3,D/2,0,1.0,2.0,'vWood',wood,vC(0x5a4a3a),false);vnDoor(2.6,.3,D/2,0,1.0,2.0,'vWood',wood,vC(0x5a4a3a),false);
 vnWin(-.4,.3+1.3,D/2,0,.8,.7,'open','vWood',wood,true);dnHearth(-.4,.3+1.3,D/2,0,.8,.7);
 // the gallery: a timber deck along the front at first-floor level on posts, a rail, the stair up its end
 const GY=.3+H1-.1;vB('vWood',0,GY,D/2+1.0,W+.6,.18,2.0,0,wood);for(const x of[-W/2,-W/4,0,W/4,W/2])vPst('vPost',x,0,D/2+1.9,.11,GY,wood);
 vB('vWood',0,GY+1.0,D/2+1.95,W+.6,.08,.08,0,wood);for(const x of[-W/2,-W/4,0,W/4,W/2])vB('vWood',x,GY+.18,D/2+1.95,.08,.85,.08,0,wood);
 vnStairs(W/2+1.2,0,D/2+1.0,Math.PI/2,1.0,GY,9,'vWood',wood);
 for(const x of[-3.6,0,3.6]){vnDoor(x,GY,D/2-.1,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);vnWin(x+1.6,GY+1.2,D/2-.1,0,.6,.6,'shut','vWood',wood);}
 for(const s of[-1,1])vnWin(s*W/2,.3+1.4,-1.5,s*Math.PI/2,.7,.7,'shut','vWood',wood);
 vnHipRoof('vHipT',0,.3+H1+H2-.1,0,W-.2,D-.2,2.6,0,dCol(DPAL.thatch),1.1);vB('vWood',0,.3+H1+H2-.25,0,W+.4,.22,D+.4,0,wood);
 dnMuralBand(0,.3+H1+H2-.9,-D/2+.05,Math.PI,W-2,.5);vnChimney(-2.5,.3+H1+H2+2.0,-1.5,1.0,.1,true);
 // the yard: jars, a rack of lines between two posts, folk
 dnJar(-W/2-.9,0,1.5,.3);dnJar(-W/2-1.5,0,.6,.26);vnDryingRack(-2,0,D/2+3.8,0,5);vnSacks(W/2+.6,0,-1.2,3);
 dnFolk(-1,D/2+4.6,3,1.6);}
// ---------------------------------------------------------------- WELL COURT: a paved court round a stone well-drum, a sweep pole, jars, the queue
function buildDalabWell(G,o){reseed(8821+(o.v|0));const st=dCol(DPAL.stone),wood=dCol(DPAL.woodGrey);
 vnReg('Well court',0,0,5,5);
 vnPaving(0,.02,0,8,8,0,st,14);dnDrum('dStoneDrum',0,0,0,1.3,1.1,st);dnDrum('dReliefDrum',0,.35,0,1.34,.5,st);dnDrum('vDarkB',0,1.05,0,1.05,.1,null);
 for(const s of[-1,1])vPst('vPostB',s*1.1,0,-1.4,.12,2.6,wood);vB('vWood',0,2.5,-1.4,2.6,.14,.14,0,wood);                 // the frame over the well
 kput('vPost',[1.6,2.0,-1.2],qEuler(0,.4,-.55),[.09,4.6,.09],wood);vB('vWood',2.9,3.3,-.7,.6,.6,.6,0,vC(0x4a3a2c));      // the sweep and its counterweight
 kput('vPost',[0,1.35,-1.4],qEuler(Math.PI/2,0,0),[.05,2.3,.05],vC(0x3a2a1c));vnBarrel(0,1.55,-1.4,.22,.4,wood);                  // the rope and the bucket
 vB('vStone',0,.05,2.6,3.0,.35,.8,0,st);dnJar(-2.6,0,1.6,.32);dnJar(2.4,0,1.2,.28);dnJar(2.9,0,2.0,.26);dnJar(-3.0,0,-1.8,.3);
 vnPlanter(-3.2,0,-3.2,1.8,.7,0,wood);dnStele(3.2,0,-3.2,0,1.8,st);
 dnFolk(0,2.2,3,1.4);dnFolk(-2,-1,2,.8);}
// ---------------------------------------------------------------- BATH HOUSE: a stone drum under a low dome, a steaming pool court behind an earth wall; The God's light
function buildDalabBathhouse(G,o){reseed(8831+(o.v|0));const R=5.2,H=3.8,CW=22,CD=18;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),earth=dCol(DPAL.earth);
 vnReg('Bath house',0,0,12,H+R*.7+1.5);vnReg('Bath house wall',0,0,12.5,2.4,{part:'wall',type:['civic']});
 dnEarthWall(0,0,0,CW,CD,0,2.2,3.0,{c:earth,relief:true,stoneGate:true});
 // the hot room, back of the court
 const hz=-CD/2+R+1.8;dnDrum('dStoneDrum',0,0,hz,R,H,st);dnDrum('dReliefDrum',0,.3,hz,R+.06,.9,st);dnMuralRing(0,H-1.3,hz,R+.05,1.0,st,2);
 kput('dStoneDome',[0,H,hz],null,[R+.3,R*.7,R+.3],st.clone().multiplyScalar(.9));vBall('dGiltBall',0,H+R*.7+.2,hz,.3);
 vnChimney(R*.5,H+R*.55,hz-R*.4,1.6,.16,false);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const p=dnOnRing(0,hz,R,a);dnGodWin(p[0],1.6,p[1],a,.9,1.1,'vStone',st);}
 const dp=dnOnRing(0,hz,R,0);dnGate(dp[0],0,dp[1]+.1,0,1.6,2.6,st);vnDoor(dp[0],0,dp[1],0,1.4,2.5,'vStone',st,vC(0x4a2e1c),false);for(const x of[-2,2])dnGodLamp(x,3.0,dp[1],0);
 // the pool: a stone-kerbed basin of dark water in the court, steam, benches, a colonnade of stone posts along one side
 {const pz=hz+R+4.4;vB('vStone',0,0,pz,9,.4,6,0,st);vB('vPanelB',0,.32,pz,8.2,.12,5.2,0,vC(0x3a8a80));   /* the pool reads teal, not black */
  for(let k=0;k<5;k++)kput('dGlow',[rr(-3.5,3.5),.7+rr(0,.5),pz+rr(-2,2)],null,[1.2,.5,1.2],vC(0xdfe8e4));                      // steam
  for(const x of[-7,7]){vB('vStone',x,0,pz,1.4,.5,5,0,st);for(const z of[-2,0,2])dnJar(x,.5,pz+z,.24);}
  for(let k=0;k<5;k++){vPst('vPostS',-CW/2+2.2,0,-CD/2+4+k*2.6,.24,3.0,st);}vB('vWood',-CW/2+2.2,3.0,-CD/2+4+5.2,.4,.25,12,0,wood);
  vnShedRoof(-CW/2+3.4,3.2,-CD/2+9.2,2.6,12,.7,Math.PI/2,'vShingleB',dCol(DPAL.shingle),.3,.2);}
 vnPaving(0,.02,CD/2-3,10,4,0,st,10);dnFirePit(CW/2-4,0,CD/2-4,.6);dnChecker(0,.03,hz+R+1.0,5,1.6,0);
 dnStele(-4.5,0,CD/2+1.6,0,2.4,st,true);dnStele(4.5,0,CD/2+1.6,0,2.4,st,true);
 dnFolk(0,CD/2+4,3,1.6);dnFolk(3,hz+R+4.4,2,1.2);}
// ---------------------------------------------------------------- SCRIBES' HALL: a long timber hall on a stone plinth, mural bands, God-lit windows, a stele court
function buildDalabScribes(G,o){reseed(8841+(o.v|0));const W=18,D=9,H=4.0,Y0=.9;const st=dCol(DPAL.stone),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg("Scribes' hall",0,0,12,Y0+H+4.5);
 vB('vStone',0,0,0,W+2,Y0,D+2,0,st);dnReliefBand(0,.15,D/2+1.0,0,W-1,.55,st);vnStairs(0,0,D/2+1.0+.6,0,3.4,Y0,3,'vStone',st);
 vnFrame(0,Y0,0,W,H,D,0,wood,.18);vB('vWood',0,Y0,0,W-.12,H,D-.12,0,wood.clone().multiplyScalar(.9));
 dnMuralBand(0,Y0+H-1.4,D/2-.02,0,W-3,1.2);dnMuralBand(0,Y0+H-1.4,-D/2+.02,Math.PI,W-3,1.2,1);
 vnGableRoof(0,Y0+H,0,W,D,3.2,0,'vGableS',sh,1.2,'vGableW',wood,.3);dnCrest(0,Y0+H+3.2,0,3,0,wood);
 vnDoor(0,Y0,D/2,0,1.5,2.5,'vWood',wood,vC(0x4a2e1c));
 for(const x of[-6.6,-4.4,-2.2,2.2,4.4,6.6])dnGodWin(x,Y0+1.3,D/2,0,1.0,1.3,'vWood',wood);for(const s of[-1,1])for(const z of[-2.4,2.4])dnGodWin(s*W/2,Y0+1.3,z,s*Math.PI/2,.9,1.2,'vWood',wood);
 for(const x of[-3.6,3.6])dnGodLamp(x,Y0+3.2,D/2,0);
 // the reading porch: a bench under a shingle skirt along the front, tablets stacked at its end
 vnVeranda(0,0,D/2+2.0,W-4,2.6,0,Y0,2.5,wood);vnShedRoof(0,Y0+2.5,D/2+2.0,W-4,2.6,.5,0,'vShingleB',sh,.4,.22);
 for(let k=0;k<6;k++)vB('vStone',-W/2+5.5+k*.35,Y0,D/2+.9,.3,rr(.5,.9),.7,0,st.clone().multiplyScalar(.9));
 // the stele court: four steles with the reformed word, a checker path
 for(const x of[-6,-2,2,6])dnStele(x,0,D/2+6.4,0,2.6,st,x<0);dnChecker(0,.03,D/2+4.6,W-6,1.4,0);
 dnGodPost(-W/2-1.6,0,D/2+3,3.6);dnGodPost(W/2+1.6,0,D/2+3,3.6);
 dnPriest(-4,0,D/2+5.2,Math.PI);dnFolk(3,D/2+5.4,4,1.6);}
// ---------------------------------------------------------------- TRAVELLERS' INN: an earth-walled court with lizard stalls, a stacked lodge at the back, the fire
function buildDalabInn(G,o){reseed(8851+(o.v|0));const CW=27,CD=24;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),st=dCol(DPAL.stone);
 vnReg("Travellers' inn",0,0,16,10);vnReg('Inn wall',0,0,16.5,2.8,{part:'wall',type:['market/shop']});
 dnEarthWall(0,0,0,CW,CD,0,2.6,4.2,{c:earth,t:.9});
 // the lodge along the back: two storeys, a gallery, a long thatch
 {const W=16,D=7,H1=2.8,H2=2.4,lz=-CD/2+D/2+1.2;kput('dEarthBat',[0,0,lz],null,[W,H1,D],earth);vB('dEarth',0,H1-.1,lz,W-.2,H2,D-.2,0,earth.clone().multiplyScalar(1.04));
  vB('dEarth',0,H1-.1,lz+D/2-.05,W,.3,.16,0,dCol(DPAL.turq));vnDoor(0,0,lz+D/2,0,1.6,2.2,'vWood',wood,vC(0x5a4a3a),false);
  for(const x of[-5,5]){vnWin(x,1.3,lz+D/2,0,.9,.8,'open','vWood',wood,true);dnHearth(x,1.3,lz+D/2,0,.9,.8);}
  const GY=H1-.1;vB('vWood',0,GY,lz+D/2+1.0,W,.18,2.0,0,wood);for(const x of[-W/2+.3,-W/4,0,W/4,W/2-.3])vPst('vPost',x,0,lz+D/2+1.9,.11,GY,wood);
  vB('vWood',0,GY+1.0,lz+D/2+1.95,W,.08,.08,0,wood);vnStairs(-W/2-.9,0,lz+D/2+1.0,-Math.PI/2,1.0,GY,9,'vWood',wood);
  for(const x of[-5,-1.7,1.7,5])vnDoor(x,GY,lz+D/2-.1,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
  vnHipRoof('vHipT',0,H1+H2-.1,lz,W-.2,D-.2,2.8,0,dCol(DPAL.thatch),1.1);vB('vWood',0,H1+H2-.25,lz,W+.4,.22,D+.4,0,wood);vnChimney(4,H1+H2+2.2,lz-1.5,1.0,.1,true);
  dnBanner(-W/2-.6,H1+H2+.4,lz+D/2-.3,Math.PI/2,.8,2.0,dCol(DPAL.red));}
 // the stalls: a lean-to along the +x wall, lizards tethered in them
 {const sx=CW/2-2.6;for(let k=0;k<4;k++){const z=-CD/2+5+k*3.6;vPst('vPost',sx-2.4,0,z,.11,2.2,wood);vB('vWood',sx-1.2,0,z+1.8,2.6,1.1,.12,0,wood);
   if(k<3)dnAnimal('lizard',sx-1.2,0,z,rr(-.4,.4)-Math.PI/2,rr(1.1,1.5),{c:dCol([0x8a4a2a,0x6a5a2a,0x4f4f36])});}
  vnShedRoof(sx-1.2,2.3,-CD/2+9.6,3.2,14.4,.7,Math.PI/2,'vShingleB',dCol(DPAL.shingle),.3,.2);vB('vWood',sx-2.4,2.2,-CD/2+9.6,.16,.16,14.4,0,wood);
  vB('vStone',sx-1.2,0,CD/2-4.6,2.4,.5,1.2,0,st);vB('vDarkB',sx-1.2,.42,CD/2-4.6,2.0,.1,.9,0,vC(0x2a4a48));}   // the trough
 // the yard: a fire, benches, crates and sacks unloaded, the well, folk and a priest passing through
 dnFirePit(-4,0,2,.8);for(let k=0;k<3;k++)vB('vWood',-4+Math.cos(k*2.1)*2.2,.35,2+Math.sin(k*2.1)*2.2,1.6,.1,.35,k*2.1,wood);
 vnCrate(-CW/2+3,0,4,1.0,.3,wood);vnCrate(-CW/2+3.4,0,5.4,.8,.1,wood);vnSacks(-CW/2+4.5,0,7,4);vnBarrel(-CW/2+2.6,0,7.5,.4,1.0,wood);
 dnDrum('dStoneDrum',5,0,5,1.0,.9,st);dnDrum('vDarkB',5,.85,5,.8,.1,null);dnJar(6.4,0,4.2,.3);
 vnPaving(0,.02,CD/2+2.2,6,3,0,dCol(DPAL.earthDark),6);dnGodPost(-3.2,0,CD/2+1.0,3.4);dnGodPost(3.2,0,CD/2+1.0,3.4);
 dnFolk(0,CD/2+3.6,3,1.6);dnFolk(-1,4,4,2.2);}
// ---------------------------------------------------------------- EARTH YARD: where the walls come from — block stacks, the mixing pit, drying racks, a ramming shed
function buildDalabEarthyard(G,o){reseed(8861+(o.v|0));const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),eD=dCol(DPAL.earthDark);
 vnReg('Earth yard',0,0,10,5);
 vnFence(0,0,0,18,13,0,wood,3.5,1.1);
 // the shed: an open post shed with a thatch hip over the ramming frames
 {const W=8,D=5,H=2.8,sx=-4.5,sz=-3;for(const c of[[-1,-1],[1,-1],[1,1],[-1,1]])vPst('vPostB',sx+c[0]*W/2,0,sz+c[1]*D/2,.14,H,wood);
  vnHipRoof('vHipT',sx,H,sz,W,D,2.0,0,dCol(DPAL.thatch),.9);
  for(let k=0;k<2;k++){const fx=sx-2+k*4;vB('vWood',fx,0,sz,1.4,1.2,.9,0,wood);vB('dEarth',fx,.1,sz,1.1,.9,.6,0,earth);for(const s of[-1,1])vPst('vPost',fx+s*.75,0,sz,.06,2.0,wood);}   // the ramming forms
  dnFolk(sx,sz+1.8,2,1.0);}
 // the block stacks: rammed blocks drying in rows, some under tarps
 for(let r=0;r<3;r++)for(let k=0;k<5;k++){const x=1.5+k*1.3,z=-4.5+r*1.6;const n=2+Math.floor(rng()*3);for(let j=0;j<n;j++)vB('dEarth',x+rr(-.05,.05),j*.42,z,1.1,.4,.55,rr(-.06,.06),j%2?earth:eD);}
 kput('vTarpB',[4.1,1.35,-4.5],vQ(0,0,.06),[6.6,.05,1.4],vC(0xa09070));
 // the mixing pit: a dark wet disc kerbed with stones, a pile of straw, water jars, a treading figure
 dnDrum('dEarthDrum',-4,-.02,4,2.6,.3,eD);vB('vDarkB',-4,.26,4,3.6,.08,3.6,0,vC(0x4a3a2a));for(let k=0;k<9;k++){const a=k/9*TAU;kput('vRock',[-4+Math.cos(a)*2.7,.15,4+Math.sin(a)*2.7],qEuler(rng(),rng(),0),[.5,.3,.5],vC(0x6a625a));}
 kput('vThatchB',[0,0,5],null,[2.2,1.3,2.2],vC(0xc8b060));dnJar(2.0,0,3.8,.34);dnJar(2.7,0,4.6,.3);dnJar(3.5,0,3.9,.3);
 vnDryingRack(5.5,0,3,Math.PI/2,5);dnWoodpile(7.6,0,0,Math.PI/2,1.6);vnCrate(-7.5,0,-.5,.9,.2,wood);
 vnPaving(0,.02,8.2,4,2.4,0,eD,4);dnFolk(-3.5,4,1,.4);dnFolk(0,8.4,2,1.2);}
// ---------------------------------------------------------------- ORCHARD PLOT: a fenced plot of manzanita and skirt palm in rows, a keeper's lean-to, a cistern
function buildDalabOrchard(G,o){reseed(8871+(o.v|0));const wood=dCol(DPAL.woodGrey),st=dCol(DPAL.stone);
 vnReg('Orchard plot',0,0,11,4);
 vnFence(0,0,0,20,18,0,wood,3.0,1.0);
 for(let r=0;r<3;r++)for(let k=0;k<3;k++){const x=-6+k*6,z=-5.5+r*5.5;if(r===1&&k===1)continue;dnTree(rng()<.7?'manzanita':'skirtpalm',x+rr(-.6,.6),0,z+rr(-.6,.6),{scale:rr(.55,.8)});}
 for(let k=0;k<7;k++)dnPlant(dPick(['agave','shrub','grass']),rr(-8,8),0,rr(-7.5,7.5),{});
 // the cistern in the middle, a keeper's lean-to at the gate, ladders and baskets
 dnDrum('dStoneDrum',0,0,0,1.4,.8,st);dnDrum('vDarkB',0,.75,0,1.15,.1,null);dnJar(1.9,0,.4,.3);
 for(const z of[-1.2,1.2])vPst('vPost',7.5,0,z,.08,2.0,wood);kput('vTarpB',[6.6,1.9,0],vQ(0,0,.3),[2.4,.05,3.0],vC(0xb0a080));vnSacks(6.4,0,.4,2);
 kput('vPost',[-2.4,.1,-5.6],qEuler(0,0,.35),[.07,3.2,.07],wood);kput('vPost',[-1.9,.1,-5.6],qEuler(0,0,.35),[.07,3.2,.07],wood);   // a ladder against a tree
 vnPaving(0,.02,10.4,3,2,0,dCol(DPAL.earthDark),3);dnFolk(2,-3,2,1.4);dnFolk(0,10.6,1,.6);}
// ---------------------------------------------------------------- WATCH TOWER: a tall battered earth tower with a timber lookout under a thatch cap; a giant at its foot
function buildDalabWatchtower(G,o){reseed(8881+(o.v|0));const R=2.6,H=11;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),st=dCol(DPAL.stone);
 vnReg('Watch tower',0,0,5,H+5);
 dnDrum('dStoneDrum',0,-.05,0,R+1.0,.6,st);kput('dEarthDrum',[0,.5,0],null,[R,H,R],earth);kput('dEarthDrum',[0,.5,0],null,[R+.12,1.2,R+.12],dCol(DPAL.earthDark));
 dnPaintRing(0,.5+H-1.6,0,R+.04,.5,dCol(DPAL.red));dnMuralRing(0,.5+H*.55,0,R+.04,.8,st,3);
 // the lookout: a timber deck wider than the drum on brackets, a rail, the thatch cap on posts, a bell of Ancient plate
 const DY=.5+H;vB('vWood',0,DY,0,R*2+2.6,.25,R*2+2.6,0,wood);vB('vWood',0,DY,0,R*2+2.6,.25,R*2+2.6,Math.PI/4,wood);
 for(let k=0;k<8;k++){const a=k/8*TAU;const p=dnOnRing(0,0,R+.9,a);kput('vPost',[p[0],DY-1.4,p[1]],qEuler(0,-a,.6),[.1,1.9,.1],wood);vPst('vPost',p[0],DY+.25,p[1],.09,1.0,wood);vPst('vPostB',p[0]*.85,DY+.25,p[1]*.85,.12,2.6,wood);}
 kput('dRopeRing',[0,DY+1.2,0],qEuler(Math.PI/2,0,0),[R+.95,R+.95,1],wood);
 kput('dConeT',[0,DY+2.7,0],null,[R+1.8,2.6,R+1.8],dCol(DPAL.thatch));vBall('dGiltBall',0,DY+5.3,0,.2);
 kput('vPlate',[0,DY+1.6,-R-.2],vQ(0,0,0),[.7,.9,1],null);
 // the door and the ladder-stair spiralling the drum; a brazier on the deck
 vnDoor(0,.5,R-.02,0,.9,1.9,'vWood',wood,vC(0x5a4a3a),false);
 for(let k=0;k<22;k++){const t=k/22;const a=Math.PI*.5+t*Math.PI*1.4;const p=dnOnRing(0,0,R+.45,a);vB('vWood',p[0],.5+.6+t*(H-1.6),p[1],.9,.08,.4,a,wood);}
 dnFirePit(0,DY+.25,0,.35);dnFolk(0,0,1,.1,DY+.25);
 dnGiant(2.6,0,R+2.4,-.3,2,{spear:true});dnGodPost(-2.4,0,R+2.2,3.4);
 vnPaving(0,.02,R+2.5,5,2.5,0,st,5);dnFolk(-1,R+4.5,2,1.2);}

dDef({key:'dalab_rowhouse',name:'Terrace row',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:20,d:14,h:7,build:buildDalabRowhouse});
dDef({key:'dalab_tenement',name:'Stacked house',family:'dwelling',tags:Object.assign({wealth:'peasant',lit:false},DTAG_MF),w:16,d:14,h:10,build:buildDalabTenement});
dDef({key:'dalab_well',name:'Well court',family:'infrastructure',tags:{type:['infrastructure'],wealth:'peasant',lit:false},w:10,d:10,h:5,build:buildDalabWell});
dDef({key:'dalab_bathhouse',name:'Bath house',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true},w:25,d:23,h:8,build:buildDalabBathhouse});
dDef({key:'dalab_scribes',name:"Scribes' hall",family:'civic',tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'scribes'},w:24,d:20,h:9,build:buildDalabScribes});
dDef({key:'dalab_inn',name:"Travellers' inn",family:'trade',tags:{type:['market/shop','multi-family dwelling'],wealth:'middle',lit:false},w:32,d:30,h:10,build:buildDalabInn});
dDef({key:'dalab_earthyard',name:'Earth yard',family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:15,h:5,build:buildDalabEarthyard});
dDef({key:'dalab_orchard',name:'Orchard plot',family:'farm',tags:{type:['farm'],wealth:'peasant',lit:false},w:22,d:22,h:5,build:buildDalabOrchard});
dDef({key:'dalab_watchtower',name:'Watch tower',family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:false},w:12,d:12,h:17,build:buildDalabWatchtower});
// ================================================================= DALAB — civic: the guard's barracks, the three embassies, the Halls of Reformation
// Civic buildings are the priests' and carry The God's light. Each embassy is a Dalab-built rammed-earth compound
// (relief gate, drum buttresses) round a hall in the visitor's own idiom: Iziz (sand plaster, orange awnings, deco
// strips, copper pyramid), Voth (grey ashlar, pantile, gilt dome, dark-red banners), the Order of Historians
// (laterite drum, tile cone and lantern, blue-and-white mosaic band, toron pegs, blue banners).

// barracks: a palisaded yard; a long rammed-earth hall with a giant-height door; a giant pair at the gate; racks
function buildDalabBarracks(G,o){reseed(8501+(o.v|0));const CW=30,CD=24;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),sh=dCol(DPAL.shingle),st=dCol(DPAL.stone);
 vnReg("Guard's barracks",0,0,19,10);vnReg('Barracks palisade',0,0,19.5,3.4,{part:'wall',type:['military']});
 vnPalisade(0,0,0,CW,CD,0,3.2,4.4);vB('dEarth',0,-.1,0,CW+1,.4,CD+1,0,dCol(DPAL.earthDark));
 // the hall, back of the yard: earth walls, a shingle gable, a door tall enough for a giant, God-lit
 {const W=18,D=8,H=4.8,hz=-CD/2+D/2+1.6;vB('vStone',0,0,hz,W+.6,.5,D+.6,0,vC(0x9a8a78));kput('dEarthBat',[0,.4,hz],null,[W,H,D],earth);
  for(let k=-2;k<=2;k++)dnDrum('dEarthDrumB',k*(W/5),.4,hz-D/2*.93,.8,H+.3,earth);
  vnGableRoof(0,.4+H,hz,W*.92,D*.92,3.2,0,'vGableS',sh,1.1,'vGableW',wood,.3);
  vnDoor(0,.4,hz+D/2*.94,0,2.2,4.0,'vWood',wood,vC(0x5a4632));for(const x of[-6,-3.5,3.5,6])dnGodWin(x,.4+2.4,hz+D/2*.94,0,1.0,1.0,'vWood',wood);
  dnMuralBand(0,.4+H-.9,hz+D/2*.94,0,W-3,.7);for(const x of[-2.2,2.2])dnGodLamp(x,.4+4.4,hz+D/2*.94,0);}
 // the giants' quarters: a round earth hut of giant scale, +x
 dnRoundHouse(CW/2-6,0,3,4.2,4.0,{roof:'thatch',rise:4.4,door:-Math.PI/2,doorW:1.6,doorH:3.4,win:[Math.PI*.8],band:'paint',wood});
 // drill posts, weapon racks, a fire, benches
 for(let k=0;k<4;k++)vPst('vPostB',-10+k*2.6,0,4.5,.22,2.4,wood);
 vB('vWood',-5,0,-1,3,1.4,.3,0,wood);for(let k=0;k<6;k++)vPst('vPost',-6.2+k*.5,.2,-1,.04,3.2,vC(0x4a3a2a));
 dnFirePit(2,0,2,.8);for(let k=0;k<2;k++)vB('vWood',-1.5+k*7,.35,-3,2.4,.1,.4,0,wood);
 // giants at the gate (city watch: two arms), a few soldiers
 dnGiant(-3.2,0,CD/2+1.2,.3,2,{shield:true});dnGiant(3.2,0,CD/2+1.2,-.3,2,{shield:true});
 dnFolk(-6,0,3,2);dnFolk(6,-5,2,1.5);dnGodPost(-4.6,0,CD/2-1.4,4);dnGodPost(4.6,0,CD/2-1.4,4);}

// the Dalab-built compound every embassy stands in: rammed-earth wall, relief, stone gate pylons, God-lit gate
function dnEmbassyCompound(CW,CD,name){vnReg(name+' compound wall',0,0,Math.hypot(CW,CD)/2+.5,3.4,{part:'wall'});
 dnEarthWall(0,0,0,CW,CD,0,3.2,3.6,{relief:true,stoneGate:true});vnPaving(0,.02,CD/2-4,3.6,7,0,dCol(DPAL.stoneWarm),9);
 dnGodPost(-3.2,0,CD/2+1.4,3.6);dnGodPost(3.2,0,CD/2+1.4,3.6);dnFolk(0,CD/2+4,3,1.8);}
// Izizian embassy: a plaster hall with exposed hardwood posts, wooden stepped cornice, deco strips, a copper pyramid
function buildDalabEmbassyIziz(G,o){reseed(8511+(o.v|0));const CW=30,CD=26;const wood=vC(vPick(VPAL.woodRich)),pl=vC(vPick(VPAL.sand)),st=vC(vPick(VPAL.stone)),cu=vC(0xffffff);
 vnReg('Izizian embassy',0,0,12,15);dnEmbassyCompound(CW,CD,'Izizian embassy');
 const W=14,D=11,H1=3.6,H2=3.2,Y0=.5,hz=-2;
 vB('vStone',0,-.05,hz,W+.6,Y0+.05,D+.6,0,vC(vPick(VPAL.stoneDark)));
 vB('vPlaster',0,Y0,hz,W,H1,D,0,pl);vB('vWood',0,Y0+H1,hz,W+.34,.3,D+.34,0,wood);vB('vPlaster',0,Y0+H1+.3,hz,W-1.6,H2,D-1.6,0,pl.clone().multiplyScalar(1.04));
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,hz+sz*(D/2-.02),.18,H1+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,hz,W-1.6,D-1.6,0,wood,2);kput('vPyrCu',[0,top+.3,hz],null,[W-.4,3.2,D-.4],cu);vBall('vFinial',0,top+3.6,hz,.3);
 vnDoor(0,Y0,hz+D/2,0,1.5,2.5,'vWood',wood,vC(0x6a4a30));vnStairs(0,0,hz+D/2+1.1,0,3,Y0,3,'vStone',st);
 for(const x of[-4.4,-2.4,2.4,4.4])vnWin(x,Y0+1.2,hz+D/2,0,1.2,1.4,'lit','vWood',wood);for(const s of[-1,1])for(const z of[-3,0,3])vnWin(s*W/2,Y0+1.2,hz+z,s*Math.PI/2,1.1,1.3,'lit','vWood',wood);
 for(const x of[-4,-1.4,1.4,4])vnStrip(x,Y0+H1+.9,hz+(D-1.6)/2,0,.75,2.0,'vWood',wood);
 vnAwning(-3.4,Y0+2.7,hz+D/2,0,2.2,1.3,vC(vPick(VPAL.awning)));vnAwning(3.4,Y0+2.7,hz+D/2,0,2.2,1.3,vC(vPick(VPAL.awning)));
 vnBannerPole(-W/2-1.6,0,hz+D/2+2,0,6,vC(0xe07a2a));vnBannerPole(W/2+1.6,0,hz+D/2+2,0,6,vC(0xe07a2a));
 vnPlanter(-5,0,hz+D/2+3.2,2.4,.9,0,wood);vnPlanter(5,0,hz+D/2+3.2,2.4,.9,0,wood);vnLampPost(-2.6,0,hz+D/2+4.6,3.2);vnLampPost(2.6,0,hz+D/2+4.6,3.2);
 vnFolk(0,hz+D/2+6,2,1.2);}
// Vothic embassy: grey-brown ashlar, a domed hall with a gilt dome and finial, pantile roofs, a tapered corner
// tower, dark-red banners — a clan compound's manners inside a Dalab wall
function buildDalabEmbassyVoth(G,o){reseed(8521+(o.v|0));const CW=30,CD=26;const st=dCol(DPAL.vothStone),stL=st.clone().multiplyScalar(1.15),wood=vC(0x4a3a2a),gilt=vC(0xffffff);
 vnReg('Vothic embassy',0,0,12,17);dnEmbassyCompound(CW,CD,'Vothic embassy');
 const W=13,D=11,H1=4.0,H2=3.2,Y0=.6,hz=-2;
 vB('vStone',0,-.05,hz,W+1.2,Y0+.05,D+1.2,0,st.clone().multiplyScalar(.8));
 vB('vStone',0,Y0,hz,W,H1,D,0,st);for(const s of[-1,1])for(const x of[-W/2+1.5,0,W/2-1.5])vB('vStone',x,Y0,hz+s*(D/2+.15),.9,H1+.6,.35,0,stL);   // pilaster buttresses
 vB('vStone',0,Y0+H1,hz,W+.5,.35,D+.5,0,stL);vB('vPlaster',0,Y0+H1+.35,hz,W-1.6,H2,D-1.6,0,vC(0xd8d0c0));vB('vStone',0,Y0+H1+.35+H2,hz,W-1.2,.35,D-1.2,0,stL);
 vnHipRoof('dHipTile',0,Y0+H1+.7+H2,hz,W-1.6,D-1.6,1.4,0,vC(0x6a4a3a),.9);
 // the drum and gilt dome
 dnDrum('dStoneDrum',0,Y0+H1+.7+H2+.9,hz,3.6,1.8,st);for(let k=0;k<10;k++){const a=k/10*TAU;const p=dnOnRing(0,hz,3.6,a);vB('vDarkB',p[0],Y0+H1+.7+H2+1.3,p[1],.5,.9,.2,a);}
 kput('dGiltDome',[0,Y0+H1+.7+H2+2.7,hz],null,[3.9,3.4,3.9],gilt);vBall('dGiltBall',0,Y0+H1+.7+H2+6.2,hz,.3);
 // the corner tower: tapering octagonal drums, banded, domed
 {const tx=W/2+2.4,tz=hz-D/2+2.2;let yy=0;for(let k=0;k<3;k++){const r=2.2-k*.35,h=3.6-k*.4;dnDrum('dStoneDrumB',tx,yy,tz,r,h,st);yy+=h;vB('vStone',tx,yy,tz,r*2+.4,.3,r*2+.4,0,stL);yy+=.3;}
  kput('dGiltDome',[tx,yy,tz],null,[1.7,1.5,1.7],gilt);for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const p=dnOnRing(tx,tz,1.5,a);dnGodWin(p[0],yy-2.6,p[1],a,.6,1.0,'vStone',st);}}
 dnGate(0,Y0,hz+D/2+.1,0,1.8,2.9,st);vnDoor(0,Y0,hz+D/2,0,1.6,2.8,'vStone',st,vC(0x3a2a1c),false);vnStairs(0,0,hz+D/2+1.3,0,3.2,Y0,3,'vStone',st);
 for(const x of[-4.4,-2.4,2.4,4.4])dnGodWin(x,Y0+1.4,hz+D/2,0,1.0,1.6,'vStone',st);for(const s of[-1,1])for(const z of[-3,0,3])dnGodWin(s*W/2,Y0+1.4,hz+z,s*Math.PI/2,1.0,1.5,'vStone',st);
 for(const x of[-3.6,0,3.6])dnGodWin(x,Y0+H1+1.2,hz+(D-1.6)/2,0,1.0,1.3,'vStone',st);
 for(const x of[-W/2-1.4,W/2+1.4])dnBanner(x,Y0+H1+.5,hz+D/2+.6,0,.9,3.0,vC(0x7a1e22));
 vB('vStone',-5.5,0,hz+D/2+4.5,1.0,3.2,1.0,0,st);kput('dStonePyr',[-5.5,3.2,hz+D/2+4.5],null,[1.2,.9,1.2],stL);   // shrine obelisk
 dnDrum('dStoneDrum',5.2,0,hz+D/2+4.2,1.2,.9,st);dnDrum('vDarkB',5.2,.9,hz+D/2+4.2,.9,.1,null);                      // well
 vnFolk(0,hz+D/2+6.5,2,1.2);}
// Yuni embassy: the Yuni set's manners as the Iziz chapterhouse port describes them — laterite drum halls under tile
// cones with lanterns, round relief-ringed windows, a curved arcaded gallery wing, a carved forecourt wall with a
// parabolic gate; deep-red banners. Built from the vp* kit (75/76), inside a Dalab compound.
function buildDalabEmbassyYuni(G,o){reseed(8531+(o.v|0));const CW=30,CD=26;const lat=vC(0x9a5a34),dk=vC(0x5a3620),tile=vC(0x8a5a3a),wood=vC(0x4a3626);
 vnReg('Yuni embassy',0,0,12,18);dnEmbassyCompound(CW,CD,'Yuni embassy');
 const hz=-3;
 // the great drum hall at the back, two lesser drums at the front corners of the court, a curved arcade between
 vpDrumHall(0,0,hz-2,6.2,7,lat,dk,tile);for(let k=0;k<6;k++){const a=k/6*TAU+.5;if(k===1)continue;const p=dnOnRing(0,hz-2,6.2,a);vpRoundWin(p[0],3.6,p[1],a,.8,dk,vLit());}
 const dp=dnOnRing(0,hz-2,6.2,0);vnDoor(dp[0],0,dp[1],0,1.5,2.7,'vStone',dk,vC(0x3a2a1c),false);dnGodLamp(dp[0],3.3,dp[1],0);
 for(const sd of[-1,1]){const px=sd*9.5,pz=hz+6;vpDrumHall(px,0,pz,3.2,4.6,lat,dk,tile);const w=dnOnRing(px,pz,3.2,sd*Math.PI/2+.4);vpRoundWin(w[0],2.4,w[1],sd*Math.PI/2+.4,.6,dk,vLit());
  const d=dnOnRing(px,pz,3.2,Math.PI);vnDoor(d[0],0,d[1],Math.PI,1.1,2.1,'vStone',dk,vC(0x3a2a1c),false);}
 // the arcade: a curved gallery of banco arches on a plinth, from drum to drum behind the court
 {const n=7;for(let k=0;k<=n;k++){const t=k/n;const x=-9.5+19*t,z=hz+6-Math.sin(t*Math.PI)*2.6;vPst('vpBancoPost',x,0,z,.32,3.2,lat);if(k<n){const x2=-9.5+19*(t+1/n),z2=hz+6-Math.sin((t+1/n)*Math.PI)*2.6;
   const mx=(x+x2)/2,mz=(z+z2)/2,ry=Math.atan2(x2-x,z2-z)+Math.PI/2;kput('vpBayArchB',[mx,0,mz],qEuler(0,ry,0),[1,1,1],lat);vB('vpTileB',mx,3.4,mz,Math.hypot(x2-x,z2-z)+.3,.3,1.6,ry,tile);}}
  vpTorons(-8,hz+6.3,8,hz+6.3,2.9,9,0,1,.8);}
 // relief-ringed forecourt: a mosaic dais, gilt finials on the wall corners, banners
 vB('dEarth',0,0,CD/2-5,3.4,.9,3.4,0,lat);vB('dMosaic',0,.9,CD/2-5,3.6,.3,3.6,0,null);
 for(const sd of[-1,1])vpBannerPole(sd*(CW/2-3),0,CD/2-3,0,6.5,vC(0x7a1e22));
 vnFolk(0,CD/2+6.5,2,1.2);}
// Republican embassy: a Peles villa from the Highlands kit's Republican set (74-rep-dwell.js, vendored), placed inside
// a Dalab compound through the Highlands' own sub-placer (hnSub), with a Republican flag on the compound's gate posts.
function buildDalabEmbassyRepublic(G,o){reseed(8536+(o.v|0));const CW=30,CD=26;
 vnReg('Republican embassy',0,0,12,24);dnEmbassyCompound(CW,CD,'Republican embassy');
 hnSub('hl_rep_house_rich_a',0,0,-2,0,{v:o.v|0,lit:true});
 for(const s of[-1,1])vnBannerPole(s*(CW/2-3),0,CD/2-3,0,6.5,vC(0x2a4a8a));
 vnFolk(0,CD/2+6.5,2,1.2);}
// the Order of Historians' chapterhouse, ported from the Yuni set through Iziz (76-port-chapterhouse.js, vendored)
function buildDalabChapterhouse(G,o){reseed(8538+(o.v|0));buildVpChapterhouse(G,o);}

// the Halls of Reformation: a circular stone wall (r 68, the Voth Monastery's half); inside, the genepriests' halls —
// the great drum under an Ancient panel dome at the centre, four wing halls with rust and panel domes, the cell
// blocks where the reformed convalesce, the archive drum, the vats under their sheds, tanks and pipe, two cable
// pylons, a gatehouse with a giant guard pair, steles, God's-light strips and posts.
function buildDalabHalls(G,o){reseed(8541+(o.v|0));const R=68;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),iron=vC(0x2e2a26),wood=dCol(DPAL.wood),sh=dCol(DPAL.shingle);
 vnReg('Halls of Reformation',0,0,R+2,44,{landmark:true});vnReg('Halls wall',0,0,R+1,5,{part:'wall'});
 dnRingWall(0,0,0,R,4.8,0,8,'vStone',st,1.3);
 // gatehouse: two stone drums flanking the gate, a lintel bridge with a relief, giants
 for(const s of[-1,1]){dnDrum('dStoneDrumB',s*5.6,0,R,2.6,8,st);dnDrum('dReliefDrum',s*5.6,6.4,R,2.62,1.0,st);kput('dConeSh',[s*5.6,7.8,R],null,[3.2,2.6,3.2],sh);}
 vB('vStone',0,5.6,R,9,1.4,2.4,0,st);dnReliefBand(0,5.8,R+1.2,0,7.5,1.0,st);vB('vStone',0,7.0,R,9.4,.3,2.8,0,stD);
 dnGiant(-3.4,0,R+3.2,.25,4,{spear:true});dnGiant(3.4,0,R+3.2,-.25,4,{spear:true});
 vnPaving(0,.02,0,R*1.7,R*1.7,0,st.clone().multiplyScalar(.92),260);
 // THE GREAT HALL OF REFORMATION: a two-course stepped base with a stair; the lower drum (r 18) ringed by sixteen
 // buttress piers with pyramid pinnacles, God windows between them, a fret plinth, a mural frieze and a light ring
 // under its cornice; a clerestory drum above with sixteen God windows; the Ancient panel dome on iron ribs with a
 // rust lantern and a mast; a colonnaded portico on the front axis with a trilithon door, and an apse on each of
 // the other three axes. Grey stone: the Halls are civic, not sacred — the priests work here, they do not pray.
 {const HR=18,HH=9.5,CR=HR-4.2,CH=4.2;const DY=HH+.9+CH+.9;   // DY: the dome springs here
  const tq=dCol(DPAL.sacred);
  dnDrum('dStoneDrum',0,-.05,0,HR+5,.7,stD);dnDrum('dStoneDrum',0,.65,0,HR+3,.7,stD);const Y0=1.35;
  vnStairs(0,0,HR+5+1.0,0,6,Y0,3,'vStone',st);
  dnDrum('dStoneDrumB',0,Y0,0,HR,HH,st);dnDrum('dReliefDrum',0,Y0+.5,0,HR+.05,1.3,st);dnMuralRing(0,Y0+HH-3.0,0,HR-.28,1.8);
  // the sixteen piers, each a battered stone block with a relief front and a pyramid pinnacle; God windows between
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,HR-.3,a);kput('dEarthBat',[p[0],Y0,p[1]],qEuler(0,-a,0),[1.6,HH+1.4,2.2],st);
   vB('vStone',p[0],Y0+HH+1.4,p[1],1.9,.3,2.5,-a,stD);kput('dStonePyr',[p[0],Y0+HH+1.7,p[1]],qEuler(0,-a,0),[1.7,1.3,1.7],st);
   const q=dnOnRing(0,0,HR-.3+1.15,a);dnReliefBand(q[0],Y0+1.9,q[1],a,1.1,HH-2.4,st);
   const b=(k+1)/16*TAU;if(k%4===3)continue;/* the door and the three apses */const w=dnOnRing(0,0,HR,b);dnGodWin(w[0],Y0+3.0,w[1],b,1.1,2.2,'vStone',st);}
  for(let k=0;k<32;k++){const a=(k+.5)/32*TAU;const p=dnOnRing(0,0,HR,a);dnGodStrip(p[0],Y0+HH-.6,p[1],a,TAU*HR/32-.5);}
  // cornice, the clerestory drum, its cornice
  vB('vStone',0,Y0+HH,0,HR*2+1.2,.9,HR*2+1.2,0,stD);dnDrum('dStoneDrum',0,Y0+HH+.9,0,CR,CH,st);dnDrum('dReliefDrum',0,Y0+HH+1.1,0,CR+.05,.9,st);
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,CR,a);dnGodWin(p[0],Y0+HH+2.3,p[1],a,.9,1.5,'vStone',st);}
  vB('vStone',0,Y0+HH+.9+CH,0,CR*2+1.0,.9,CR*2+1.0,0,stD);
  // the dome: Ancient panel over iron ribs, a rust seam, the lantern and the mast
  kput('dPanelDome',[0,Y0+DY,0],null,[CR-.3,CR*.72,CR-.3],null);
  {const t=.5,L=CR*.6;for(let k=0;k<16;k++){const a=k/16*TAU;const p=dnOnRing(0,0,CR-.9-L/2*Math.sin(t),a);kput('vIron',[p[0],Y0+DY+L/2*Math.cos(t),p[1]],vQ(a,-t,0),[.32,L,.32],iron);}}   // ribs lean in and lie on the dome
  kput('dRing',[0,Y0+DY+CR*.5,0],qEuler(Math.PI/2,0,0),[CR*.72,CR*.72,1],iron);
  const AP=Y0+DY+CR*.72;dnDrum('dRustDrum',0,AP-.5,0,2.2,3.2,null);for(let k=0;k<6;k++){const a=k/6*TAU;const p=dnOnRing(0,0,2.2,a);vB('vDarkB',p[0],AP+.4,p[1],.7,1.4,.1,a);}
  vBall('dGodBall',0,AP+3.6,0,.8);vBall('dGlassBall',0,AP+3.6,0,.8);vPst('vPipe',0,AP+2.7,0,.12,7,iron);vBall('dGodBall',0,AP+9.8,0,.35);vBall('dGlassBall',0,AP+9.8,0,.35);
  window._hallsApex=AP+3.6;
  // the portico: eight stone columns carrying a relief-fronted entablature and a stepped crest, over a checker floor
  {const PZ=HR+3.6,PW=17;vB('vStone',0,Y0-.4,PZ,PW+2,.48,7,0,stD);dnChecker(0,Y0+.10,PZ,PW,6,0);
   for(let i=0;i<3;i++)for(const sd of[-1,1]){const x=sd*(2.3+i*3.2);vPst('vPostS',x,Y0,PZ+2.6,.36,HH-1.4,st);vB('vStone',x,Y0+HH-1.4,PZ+2.6,1.0,.3,1.0,0,stD);}
   vB('vStone',0,Y0+HH-1.1,PZ,PW+2,1.4,7,0,st);dnReliefBand(0,Y0+HH-.9,PZ+3.5,0,PW,1.0,st);vB('vStone',0,Y0+HH+.3,PZ,PW+2.4,.4,7.4,0,stD);
   const tr=dCol(DPAL.trim);let yy=Y0+HH+.7;for(const w of[PW*.7,PW*.42,PW*.2]){vB('vStone',0,yy,PZ+2.2,w,.8,1.6,0,st);vB('vStone',0,yy+.66,PZ+2.2,w+.2,.14,1.8,0,tr);yy+=.8;}vBall('dGiltBall',0,yy+.2,PZ+2.2,.25);}
  dnGate(0,Y0,HR+.4,0,3.2,4.8,st);vnDoor(0,Y0,HR,0,3.0,4.6,'vStone',st,vC(0x2a2a30),false);for(const x of[-2.6,2.6])dnGodLamp(x,Y0+5.4,HR,0);
  // the three apses
  for(const a of[Math.PI/2,-Math.PI/2,Math.PI]){const p=dnOnRing(0,0,HR-1.5,a);dnDrum('dStoneDrumB',p[0],Y0,p[1],4.2,6.4,st);dnDrum('dReliefDrum',p[0],Y0+.4,p[1],4.24,.9,st);
   kput('dStoneDome',[p[0],Y0+6.4,p[1]],null,[4.0,2.4,4.0],stD);vBall('dGiltBall',p[0],Y0+8.9,p[1],.3);for(const d of[-.5,.5]){const w=dnOnRing(p[0],p[1],4.2,a+d);dnGodWin(w[0],Y0+2.6,w[1],a+d,.8,1.4,'vStone',st);}}
  dnGiant(-4.2,Y0+.08,HR+7.5,.25,4,{spear:true});dnGiant(4.2,Y0+.08,HR+7.5,-.25,4,{spear:true});dnPriest(-1.6,Y0+.08,HR+5,Math.PI);}
 // four wing halls on the diagonals, pipe to the centre
 [[1,1,'dRustDome'],[-1,1,'dPanelDome'],[1,-1,'dPanelDome'],[-1,-1,'dRustDome']].forEach((w,i)=>{const wx=w[0]*30,wz=w[1]*26,WR=7,WH=5.5;
  dnDrum('dStoneDrumB',wx,0,wz,WR,WH,st);dnDrum('dReliefDrum',wx,.4,wz,WR+.05,1.0,st);vB('vStone',wx,WH,wz,WR*2+.8,.5,WR*2+.8,0,stD);
  kput(w[2],[wx,WH+.5,wz],null,[WR-.3,WR*.6,WR-.3],null);const toC=Math.atan2(-wx,-wz);
  for(let k=0;k<7;k++){const a=k/7*TAU+.2;const p=dnOnRing(wx,wz,WR,a);let d=Math.abs(((a-toC)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<.5)continue;dnGodWin(p[0],2.4,p[1],a,.9,1.4,'vStone',st);}
  const dp=dnOnRing(wx,wz,WR,toC);vnDoor(dp[0],0,dp[1],toC,1.5,2.8,'vStone',st,vC(0x2a2a30),false);const lp=dnOnRing(wx,wz,WR,toC);dnGodLamp(lp[0],3.4,lp[1],toC);
  const ep=dnOnRing(wx,wz,WR-.2,toC);const cp=dnOnRing(0,0,17.6,Math.atan2(wx,wz));vBeam([ep[0],WH-.5,ep[1]],[cp[0],7.5,cp[1]],.35,null,'vPipeR');vBeam([ep[0],WH-1.6,ep[1]],[cp[0],5.8,cp[1]],.22,null,'vPipe');
  for(const t of[.3,.62]){const px=ep[0]+(cp[0]-ep[0])*t,pz=ep[1]+(cp[1]-ep[1])*t,py=(WH-.5)+(7.5-(WH-.5))*t;vPst('vPipe',px,0,pz,.12,py-.1,iron);vB('vIron',px,py-.35,pz,.7,.12,.7,0,iron);}   // pipe trestles
  vPst(i%2?'vTankW':'vTankR',wx+w[0]*4,0,wz+w[1]*10,2.0,4.6,null);vB('vIron',wx+w[0]*4,4.6,wz+w[1]*10,4.4,.1,4.4,0,iron);vPst('vTankR',wx+w[0]*9,0,wz+w[1]*8,1.4,3.2,null);
  for(let k=0;k<3;k++)kput('vPipe',[wx+w[0]*(6-k*.7),0,wz+w[1]*(9+k*.5)],null,[.12,rr(2,4),.12],iron);});
 // the cell blocks: two long stone ranges of small cells on the east and west, God-lit doors along a colonnade
 for(const s of[-1,1]){const bx=s*50,W=8,D=36,H=3.6;vB('vStone',bx,0,0,W,H,D,0,st);dnReliefBand(bx-s*W/2,.3,0,-s*Math.PI/2,D-1.5,.8,st);
  vnHipRoof('vHipS',bx,H,0,W,D,2.2,0,sh,.9);
  for(let k=0;k<7;k++){const z=-D/2+3+k*5;const f=bx-s*W/2;vnDoor(f,0,z,-s*Math.PI/2,.9,2.0,'vStone',st,vC(0x2a2a30),false);dnGodWin(f,1.3,z+2.2,-s*Math.PI/2,.7,.9,'vStone',st);
   vPst('vPostS',f-s*2.6,0,z,.22,3.0,st);}
  vB('vStone',bx-s*(W/2+1.5),3.0,0,3.4,.3,D+.4,0,stD);for(const z of[-D/2,D/2])dnDrum('dStoneDrumB',bx,0,z,1.6,H+.8,st);}
 // the archive drum (records of every lineage The God has touched), back of the court
 {const ax=0,az=-46,AR=7,AH=6;dnDrum('dStoneDrumB',ax,0,az,AR,AH,st);dnDrum('dReliefDrum',ax,AH-1.6,az,AR+.05,1.1,st);dnMuralRing(ax,1.2,az,AR,1.5);
  kput('dConeSh',[ax,AH-.3,az],null,[AR*1.2,5.5,AR*1.2],sh);vBall('dGiltBall',ax,AH+5.4,az,.35);vnDoor(ax,0,az+AR,0,1.4,2.6,'vStone',st,vC(0x2a2a30),false);dnGodLamp(ax,3.2,az+AR,0);
  for(let k=1;k<6;k++){const a=k/6*TAU;const p=dnOnRing(ax,az,AR,a);dnGodWin(p[0],2.6,p[1],a,.8,1.3,'vStone',st);}}
 // the vats: culture tanks under panel sheds either side of the archive
 for(const s of[-1,1]){const vx=s*22,vz=-48;for(const p of[[-5,-4],[5,-4],[-5,4],[5,4]])vPst('vPipe',vx+p[0],0,vz+p[1],.14,4.2,iron);vnShedRoof(vx,3.9,vz,11,9,.8,0,'vPanelB',null,.6,.14);
  for(let k=0;k<6;k++)vPst('vTankW',vx-4+(k%3)*4,0,vz-2+Math.floor(k/3)*4,1.3,2.6,null);for(let k=0;k<6;k++)vBall('dGodBall',vx-4+(k%3)*4,2.9,vz-2+Math.floor(k/3)*4,.22);for(let k=0;k<6;k++)vBall('dGlassBall',vx-4+(k%3)*4,2.9,vz-2+Math.floor(k/3)*4,.22);}
 // two pylons with cables to the centre dome, the wings and the wall
 for(const s of[-1,1]){const px=s*40,pz=40;for(const sx of[-1,1])for(const sz of[-1,1])vBeam([px+sx*1.6,0,pz+sz*1.6],[px+sx*.3,26,pz+sz*.3],.18,iron,'vIron');
  for(let y=3;y<26;y+=3.5){const w=1.6-(1.3*y/26);vB('vIron',px,y,pz,w*2+.3,.12,.12,0,iron);vB('vIron',px,y,pz,.12,.12,w*2+.3,0,iron);}
  vB('vIron',px,26,pz,2.4,.2,2.4,0,iron);vBall('dGodBall',px,27,pz,.4);vBall('dGlassBall',px,27,pz,.4);kput('dGodHalo',[px,27,pz],vQ(0,0,0),[3,3,1],null);
  dnCable([px,25.5,pz],[0,window._hallsApex||30,0],2.6);dnCable([px,25.5,pz],[s*30,6,26],3.2);dnCable([px,25.5,pz],[s*30,6,-26],4.5);
  vB('vStone',px,0,pz,4.4,1.2,4.4,0,stD);}
 // steles round the court, God-posts along the axis, priests, supplicants
 for(let k=0;k<12;k++){const a=k/12*TAU+Math.PI/12;const p=dnOnRing(0,0,R-5,a);dnStele(p[0],0,p[1],a+Math.PI,3.6,st);}
 for(const z of[32,40,48,56])for(const s of[-1,1])dnGodPost(s*5.5,0,z,4.4);
 for(const a of[Math.PI*.5,-Math.PI*.5,Math.PI])dnGodPostAt(0,0,R-10,a,4.4);
 dnPriest(-7,0,30,.4);dnPriest(7,0,30,-.4);dnPriest(-26,0,-2,1.2);dnFolk(0,30,6,5);dnFolk(0,R+6,4,3);dnFolk(-50,0,3,2);dnFolk(50,0,3,2);}
function dnGodPostAt(x,z,r,a,h){const p=dnOnRing(x,z,r,a);dnGodPost(p[0],0,p[1],h);}

dDef({key:'dalab_barracks',name:"Guard's barracks",family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:36,d:30,h:12,build:buildDalabBarracks});
dDef({key:'dalab_embassy_iziz',name:'Izizian embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'iziz'},w:34,d:32,h:15,build:buildDalabEmbassyIziz});
dDef({key:'dalab_embassy_voth',name:'Vothic embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'voth'},w:34,d:32,h:17,build:buildDalabEmbassyVoth});
dDef({key:'dalab_embassy_yuni',name:'Yuni embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'yuni'},w:34,d:32,h:18,build:buildDalabEmbassyYuni});
dDef({key:'dalab_embassy_republic',name:'Republican embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'republic'},w:34,d:32,h:25,build:buildDalabEmbassyRepublic});
dDef({key:'dalab_chapterhouse',name:"Historians' chapterhouse",family:'civic',tags:{culture:'yuni-order',type:['civic','religious'],wealth:'civic',lit:true,role:'chapterhouse'},w:40,d:38,h:22,build:buildDalabChapterhouse});
dDef({key:'dalab_halls',name:'Halls of Reformation',family:'civic',tags:{type:['civic','religious','industry'],wealth:'civic',lit:true,role:'halls',landmark:true},w:146,d:146,h:32,build:buildDalabHalls});
// ================================================================= HIGHLANDS — registry + structural helpers (prefix hn)
// The Highlands kit reuses the Iziz Vernacular registry (VERN, 69c) so that one placer (VERN.place), one inspector
// and one set of building blocks (vB vPst vnWin vnDoor vnGableRoof …) serve both kits. HL.def adds the kit's own
// fields: BRANCH (republican | rustic | tribal) and FAMILY (the showcase row it belongs to).
//
// Local frame as in the vernacular set: origin at the plot centre on the ground, +z is the FRONT (the door side),
// y up, metres; a builder never touches world coordinates.
const HL={branches:{republican:'Republican',rustic:'Rustic',tribal:'Tribal'},
 def(D){if(!HL.branches[D.branch])throw new Error('HL.def '+D.key+': branch must be republican|rustic|tribal');
  D.tags=Object.assign({culture:'highland-'+D.branch,kit:'highlands'},D.tags||{});D.family=D.family||'misc';return VERN.def(D);},
 keys(branch){return VERN.order.filter(k=>VERN.defs[k].branch===branch);},
 // families in definition order for one branch: [{family, keys:[…]}]
 families(branch){const out=[],idx={};for(const k of HL.keys(branch)){const f=VERN.defs[k].family;if(idx[f]===undefined){idx[f]=out.length;out.push({family:f,keys:[]});}out[idx[f]].keys.push(k);}return out;},
};
// Place a whole sub-building (another def) inside the builder that is running — a compound, a cliff village, a
// farm with its farmhouse. (lx,ly,lz,lry) are in the CURRENT builder's local frame. The child is placed in world
// space through VERN.place with the parent's transform composed by hand, then the parent's state is restored.
function hnSub(key,lx,ly,lz,lry,o){const P=VERN.cur;const s=P.o.scale||1;const p=loc(P.x,P.z,lx*s,lz*s,P.ry);
 const saveK=KXF,saveO=KOFF.slice();KXF=null;
 const G=VERN.place(P.G.parent||scene,key,p[0],p[1],P.ry+(lry||0),Object.assign({},o||{},{y:(P.o.y||0)+ly*s,scale:s*((o&&o.scale)||1)}));
 KXF=saveK;KOFF=saveO;VERN.cur=P;return G;}

// ---------------------------------------------------------------- vectors in the local frame
// rotate a local direction by yaw ry (the same convention as loc())
const hRot=(ry,v)=>[v[0]*Math.cos(ry)+v[2]*Math.sin(ry),v[1],-v[0]*Math.sin(ry)+v[2]*Math.cos(ry)];
const hAdd=(a,b,k)=>[a[0]+b[0]*(k===undefined?1:k),a[1]+b[1]*(k===undefined?1:k),a[2]+b[2]*(k===undefined?1:k)];
const hNorm=v=>{const L=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/L,v[1]/L,v[2]/L];};
const hCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
// An item placed with a full basis: its local x along X, its local z (a plane's face) toward Z. Z is
// re-orthogonalised against X. Use for braces that must lie flat on a wall, bargeboards along a rake, struts.
function hnOri(item,P,X,Z,s,c){const x=hNorm(X);let y=hNorm(hCross(Z,x));const z=hCross(x,y);
 const m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...x),new THREE.Vector3(...y),new THREE.Vector3(...z));
 kput(item,P,new THREE.Quaternion().setFromRotationMatrix(m),s,c||null);}
// a member from a to b (local points), section w x t, lying flat against a surface whose normal is N
function hnMember(item,a,b,w,t,N,c){const X=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...X);hnOri(item,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],X,N,[L,w,t],c);}
// local point on a face: (x,z,ry) is the face frame (ry = outward direction), u along the face, y up, o out
const hnOn=(x,y,z,ry,u,o)=>{const p=loc(x,z,u,o||0,ry);return[p[0],y,p[1]];};

// ---------------------------------------------------------------- walls
// Log walls (izba / Norse): a box of round-log courses and, at each corner, the crossed log ends of the saddle
// notch sticking out `ext` metres, alternating direction course by course.
function hnLogBox(x,y,z,w,h,d,ry,c,ext){ext=ext===undefined?.32:ext;vB('hLogB',x,y,z,w,h,d,ry,c);if(!ext)return;
 const LH=1/3,n=Math.floor(h/LH);const ce=c?c.clone().multiplyScalar(1.08):null;
 for(let k=0;k<n;k++){const yy=y+(k+.5)*LH;const alongX=k%2===0;
  for(const sx of[-1,1])for(const sz of[-1,1]){
   if(alongX){const p=loc(x,z,sx*(w/2+ext/2-.02),sz*(d/2-.12),ry);kput('hLogEnd',[p[0],yy,p[1]],qEuler(0,ry,0),[ext+.2,.16,.16],ce);}
   else{const p=loc(x,z,sx*(w/2-.12),sz*(d/2+ext/2-.02),ry);kput('hLogEnd',[p[0],yy,p[1]],qEuler(0,ry+Math.PI/2,0),[ext+.2,.16,.16],ce);}}}}
// Fieldstone socle with a dressed cap (the Peles base, the chalet ground storey, the Norse hall platform).
function hnSocle(x,y,z,w,h,d,ry,c,capC){vB('hRubB',x,y,z,w,h,d,ry,c||hC(vPick(HPAL.rubble)));vB('vStone',x,y+h-.12,z,w+.16,.16,d+.16,ry,capC||hC(vPick(HPAL.ashlar)));}
// Rendered masonry block with ashlar quoins at the four corners (cream stucco, limestone corners).
function hnStucco(x,y,z,w,h,d,ry,c,qC){vB('vPlaster',x,y,z,w,h,d,ry,c||hC(vPick(HPAL.stucco)));if(qC===false)return;const qc=qC||hC(vPick(HPAL.ashlar));
 const n=Math.floor(h/.6);for(let k=0;k<n;k++){const big=k%2===0;for(const sx of[-1,1])for(const sz of[-1,1]){
  const p=loc(x,z,sx*(w/2-(big?.28:.2)+.03),sz*(d/2+.03),ry);vB('vStone',p[0],y+k*.6,p[1],big?.62:.46,.56,.08,ry,qc);
  const q=loc(x,z,sx*(w/2+.03),sz*(d/2-(big?.2:.28)+.03),ry);vB('vStone',q[0],y+k*.6,q[1],.08,.56,big?.46:.62,ry,qc);}}}
// Half-timbering (Fachwerk) on ONE face: (x,z,ry) the face centre and outward direction, w the face width, h the
// storey. Posts every ~1.1 m, sill + head beams, windows in the bays listed in `wins` (bay indices; -1 = auto: every
// other bay). kind: window kind for vnWin ('lit' | 'glass' | 'shut' | 'open').
//
// Round 2 (Travis: "more elaborate", after Alemannic/Franconian and Tudor references): every building picks a STYLE
// once (VERN.cur.fach), and each bay draws a pattern from that style's pool, mirrored about the face centre:
//   alemannic  — the "Mann" (K-braces off both posts), curved crosses, lozenges; curved Feuerböcke and gilded
//                rosettes in the window aprons; red or brown timber on white (the Black Forest / Hessian house)
//   franconian — ogee (curved) St Andrew's crosses, stars (lozenge + cross), lozenges, crosses in every apron
//   tudor      — black timber on white: close studding, herringbone chevrons, quatrefoil rings and star panels
//   saxon      — the plain round-1 pattern (alternating straight braces), for the modest houses
const HFACH={alemannic:['mann','curvedX','raute','mann'],franconian:['curvedX','star','raute','X'],tudor:['close','herring','star','quatre'],saxon:['K','K','X']};
function hlFachStyle(){const c=VERN.cur;if(!c)return 'saxon';if(!c.fach){const b=c.D.branch,w=c.D.tags.wealth;
  c.fach=vPick(b==='rustic'?['alemannic','alemannic','saxon']:w==='poor'?['saxon','alemannic']:['alemannic','franconian','tudor','franconian','alemannic','tudor']);}return c.fach;}
kdef('hDisc',new THREE.CylinderGeometry(1,1,1,16),MAT.paint);kdef('hDiscG',new THREE.CylinderGeometry(1,1,1,16),MAT.gold);   // centred discs: rosettes, bosses
function hnFachFace(x,y,z,ry,w,h,c,wins,kind,winC){const st=hlFachStyle();if(st==='tudor')c=hC(vPick([0x2a221e,0x322822,0x3a2a22]));else c=c||hC(vPick(HPAL.redwood));
 const nb=Math.max(2,Math.round(w/1.15)),bw=w/nb,T=.07,N=hRot(ry,[0,0,1]),pool=HFACH[st];
 const isWin=i=>wins===-1?(i%2===1&&i<nb-1):(wins||[]).indexOf(i)>=0;
 const P=(u,yy)=>hnOn(x,yy,z,ry,u,T/2);const M=(a,b,wd)=>hnMember('vWood',P(a[0],a[1]),P(b[0],b[1]),wd||.13,T,N,c);
 const C=(a,b,k,wd,n)=>{n=n||4;let pv=a;for(let i=1;i<=n;i++){const t=i/n;const q=[(1-t)*(1-t)*a[0]+2*(1-t)*t*k[0]+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*k[1]+t*t*b[1]];M(pv,q,wd);pv=q;}};
 const rosette=(u,yy,r)=>{const p=hnOn(x,yy,z,ry,u,T+.02);kput('hDiscG',p,qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[r,.04,r],hC(HPAL.gold[0]));
  const q=hnOn(x,yy,z,ry,u,T+.05);kput('hDisc',q,qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[r*.45,.03,r*.45],hC(HPAL.red));};
 // a pattern inside the rectangle u0..u1 x ya..yb
 const pat=(p,u0,u1,ya,yb,mir)=>{const um=(u0+u1)/2,ym=(ya+yb)/2,W=u1-u0,H=yb-ya;
  if(p==='X'){M([u0,ya],[u1,yb]);M([u1,ya],[u0,yb]);}
  else if(p==='K'){if(mir){M([u0,ya+.1],[u1,ym]);M([u0,ym],[u1,yb-.1]);}else{M([u1,ya+.1],[u0,ym]);M([u1,ym],[u0,yb-.1]);}M([u0,ym],[u1,ym],.12);}
  else if(p==='mann'){const cu=mir?u1:u0,ou=mir?u0:u1;M([ou,ya+.1],[cu,ym+H*.12]);M([cu,ym-H*.05],[ou,yb-.1]);C([ou,ya+.1],[um,yb-.1],[ou,ym],.1,4);M([u0,ya+H*.3],[u1,ya+H*.3],.1);}
  else if(p==='curvedX'){C([u0,ya],[u1,yb],[u0+W*.2,ya+H*.75],.14,5);C([u1,ya],[u0,yb],[u1-W*.2,ya+H*.75],.14,5);}
  else if(p==='raute'){const iu=W*.12,iy=H*.1;M([um,ya+iy],[u1-iu,ym]);M([u1-iu,ym],[um,yb-iy]);M([um,yb-iy],[u0+iu,ym]);M([u0+iu,ym],[um,ya+iy]);M([u0,ym],[u1,ym],.1);}
  else if(p==='star'){pat('raute',u0,u1,ya,yb);M([u0,ya],[u1,yb],.1);M([u1,ya],[u0,yb],.1);}
  else if(p==='close'){M([u0,ym],[u1,ym],.12);const n=Math.max(2,Math.round(W/.36));for(let k=1;k<n;k++){const u=u0+W*k/n;M([u,ya],[u,yb],.1);}}
  else if(p==='herring'){const n=Math.max(2,Math.round(H/.55));for(let k=0;k<n;k++){const y0=ya+H*k/n+.08,y1=y0+H/n*.8;M([u0,y0],[um,y1],.1);M([um,y1],[u1,y0],.1);}}
  else if(p==='quatre'){const r=Math.min(W,H)*.36;let pv=null;for(let k=0;k<=8;k++){const a=k/8*TAU,rr2=r*(1-.22*Math.abs(Math.cos(2*a)));const q=[um+Math.cos(a)*rr2,ym+Math.sin(a)*rr2];if(pv)M(pv,q,.09);pv=q;}
   M([u0,ya],[um-r*.6,ym-r*.6],.1);M([u1,ya],[um+r*.6,ym-r*.6],.1);M([u0,yb],[um-r*.6,ym+r*.6],.1);M([u1,yb],[um+r*.6,ym+r*.6],.1);rosette(um,ym,r*.35);}};
 const apron=(u0,u1,ya,yb)=>{const um=(u0+u1)/2,H=yb-ya;
  if(st==='alemannic'){C([u0,ya],[um,yb],[u0,yb],.1,4);C([u1,ya],[um,yb],[u1,yb],.1,4);rosette(um,ya+H*.4,Math.min(.18,H*.25));}
  else if(st==='franconian'){pat('X',u0,u1,ya,yb);}
  else if(st==='tudor'){pat(rng()<.5?'quatre':'star',u0,u1,ya,yb);}
  else{M([u0,ya+.05],[um,yb],.1);M([u1,ya+.05],[um,yb],.1);}};
 M([-w/2,y+.1],[w/2,y+.1],.22);M([-w/2,y+h-.1],[w/2,y+h-.1],.2);                                       // sill, head
 for(let i=0;i<=nb;i++){const u=-w/2+i*bw;M([u,y],[u,y+h],.18);}                                             // posts
 for(let i=0;i<nb;i++){const u0=-w/2+i*bw,u1=u0+bw,um=(u0+u1)/2;const k=Math.min(i,nb-1-i),mir=i>=nb/2;
  if(isWin(i)){const wy=y+h*.36,wh=h*.42;M([u0,wy-.08],[u1,wy-.08],.14);M([u0,wy+wh+.1],[u1,wy+wh+.1],.14);
   const wp=loc(x,z,um,0,ry);vnWin(wp[0],wy,wp[1],ry,bw*.62,wh,kind||'glass','vWood',winC||c,false);
   apron(u0,u1,y+.2,wy-.14);if(st==='tudor'||st==='franconian')pat('X',u0,u1,wy+wh+.16,y+h-.18);}                // lintel panel over the window
  else pat(pool[k%pool.length],u0,u1,y+.2,y+h-.2,mir);}
 if(st!=='saxon')for(let i=0;i<=nb;i+=2){rosette(-w/2+i*bw,y+.1,.1);}}                                        // gilded bosses along the carved sill
// All four faces of a half-timbered storey on a plaster box. Front and back get windows every other bay.
function hnFachBox(x,y,z,w,h,d,ry,wallC,beamC,kind){const st=hlFachStyle();vB('vPlaster',x,y,z,w,h,d,ry,st==='tudor'?hC(0xf2eee4):(wallC||hC(vPick(HPAL.stucco))));beamC=beamC||hC(vPick(HPAL.redwood));
 for(const s of[1,-1]){const p=loc(x,z,0,s*d/2,ry);hnFachFace(p[0],y,p[1],ry+(s>0?0:Math.PI),w,h,beamC,-1,kind);}
 for(const s of[1,-1]){const p=loc(x,z,s*w/2,0,ry);hnFachFace(p[0],y,p[1],ry+s*Math.PI/2,d,h,beamC,d>5?-1:[],kind);}}
// A jettied upper storey: the floor above oversails the one below on carved joist ends.
function hnJetty(x,y,z,w,d,ry,c,out){out=out||.45;
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.1),sz*(d/2+out*.4),ry);kput('hArmW',[p[0],y-.55,p[1]],qEuler(0,ry+(sz>0?0:Math.PI),0).multiply(qEuler(0,Math.PI/2,0)),[.22,.7,out+.25],c);}   // carved corner consoles (Knaggen)
 const n=Math.round(w/.6);for(let i=0;i<=n;i++){for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/n,s*(d/2+out/2-.1),ry);
 vB('vWood',p[0],y-.26,p[1],.16,.24,out+.2,ry,c);}}
 vB('vWood',x,y-.06,z,w+.1,.12,d+2*out,ry,c);}

// ---------------------------------------------------------------- roofs
// Steep gable in any of the kit's slab items (ridge along local x). A thin wrapper so every branch pitches alike:
// `pitch` is rise/half-depth (1.2 ≈ 50°, the Norse/Russian norm; 0.55 the Alpine chalet).
function hnGable(x,y,z,w,d,pitch,ry,slabItem,slabC,over,endItem,endC){const rise=pitch*d/2;vnGableRoof(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC);return y+rise;}
// Tented roof (shatior) on an octagonal or square plan: 8-sided cone, optional lucarne band.
function hnTent(x,y,z,r,h,item,c){kput(item||'hTentSc',[x,y-.05,z],null,[r,h,r],c||null);return y+h;}
// Onion dome on a drum: drum (octagonal), a little neck, the onion, a gold ball and cross-less finial spike.
// kind: 'G' gold | 'Sc' scale (tinted) | 'Sh' aspen shingle
function hnOnion(x,y,z,r,kind,c,drumH,drumItem,drumC){let yy=y;if(drumH){kput(drumItem||'hOctP',[x,yy,z],null,[r*.8,drumH,r*.8],drumC||null);
  for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;vnWin(x+Math.sin(a)*r*.8,yy+drumH*.3,z+Math.cos(a)*r*.8,a,r*.22,drumH*.42,'open','hPaint',hC(HPAL.white));}
  vB('hPaint',x,yy+drumH,z,r*1.72,.16,r*1.72,0,hC(HPAL.white));yy+=drumH+.16;}
 kput('hOnion'+(kind||'G'),[x,yy,z],null,[r,r*2.1,r],c||null);yy+=r*2.1;
 vPst('vIron',x,yy-.05,z,.04,r*.9,hC(0x2e2a26));vBall('hGold',x,yy+r*.15,z,r*.12,hC(HPAL.gold[0]));return yy+r*.9;}
// Keel-arch gable (kokoshnik) stood on a wall top, facing +z of (ry): a keel-shaped board with a darker recess.
function hnKokoshnik(x,y,z,ry,w,h,item,c,recess){kput(item||'hKeelSc',[x,y,z],qEuler(0,ry,0),[w,h,.3],c||null);
 if(recess!==false){const p=loc(x,z,0,.16,ry);kput('hKeelP',[p[0],y+h*.06,p[1]],qEuler(0,ry,0),[w*.72,h*.72,.06],hC(HPAL.white));
  const q=loc(x,z,0,.2,ry);kput('hKeelDark',[q[0],y+h*.12,q[1]],qEuler(0,ry,0),[w*.36,h*.46,.04]);}}
// Bochka ("barrel") roof: the keel profile run along local x (ridge along x, like hnGable) — the Russian civic
// roof, often over a porch. w = ridge length, d = span, h = rise.
function hnBochka(x,y,z,w,d,h,ry,item,c){kput(item||'hKeelSc',[x,y-.1,z],qEuler(0,ry+Math.PI/2,0),[d,h,w],c||null);return y+h;}
// Pagoda tier: a hip roof whose eaves flare — the lower slab of a low wide hip plus upturned corner horns.
function hnTier(x,y,z,w,d,rise,ry,item,c,over,hornC){over=over===undefined?1.4:over;vnHipRoof(item||'hHipSc',x,y,z,w,d,rise,ry,c,over);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+over-.2),sz*(d/2+over-.2),ry);
  kput('hArm',[p[0],y-.25,p[1]],qEuler(0,ry+Math.atan2(sx,sz)+Math.PI/2,0),[.9,.6,.3],hornC||hC(HPAL.red));}}
// ================================================================= DALAB — the sacred: temples, priests' houses, the mounds, a shrine
// The priests commune with The God from the tops of dome-shaped earth mounds built in imitation of the Ancient
// domes. Each outlying settlement has one; the High Priest's is larger, ringed by an earthwork, and faces AWAY from
// the lab (the layout pass orients them; here the front is +z and the stair climbs it). On a mound stands a stone
// temple with a relief-carved trilithon door, a stepped cornice, a shingle pyramid, banners, an altar that burns at
// night, and two four-armed giant guards; beside it the priest's round stone house.

// the temple, at scale s, standing on the ground at (x,y,z) facing ry. Reusable by the mound builders.
function dnTemple(x,y,z,ry,s,o){o=o||{};const deco=o.deco!==false;const st=o.stoneC||(deco?dCol(DPAL.sacred):dCol(DPAL.stone)),tr=deco?dCol(DPAL.trim):null,sh=dCol(DPAL.shingle);const W=10*s,D=8*s,H=4.6*s;
 const L=(lx,lz)=>loc(x,z,lx,lz,ry);const plat=deco?dCol(DPAL.trim,.92):st.clone().multiplyScalar(.9);
 // stepped platform, three courses (cream when deco), stair down the front, checker paving on the top course
 let yy=y;for(let k=0;k<3;k++){const o2=(2-k)*1.1*s;vB('vStone',x,yy,z,W+2*o2+2*s,.45*s,D+2*o2+2*s,ry,plat);yy+=.45*s;}
 {const p=L(0,D/2+1.6*s+2.2*s);vnStairs(p[0],y,p[1],ry,3.4*s,yy-y,4,'vStone',plat);}
 if(deco){const p=L(0,D/2+1.0*s);dnChecker(p[0],yy+.02,p[1],W+1.6*s,2.0*s,ry);}
 vB('vStone',x,yy,z,W,H,D,ry,st);
 // bands: a fret plinth band (colour when deco), the mural frieze, a cream string course under it
 {const f=L(0,D/2);if(deco)dnFretBand(f[0],yy+.3*s,f[1],ry,W-3.2*s,1.0*s);else dnReliefBand(f[0],yy+.3*s,f[1],ry,W-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-1.7*s,f[1],ry,W-4.2*s,1.5*s,o.mural);}
 for(const sd of[-1,1]){const f=L(sd*W/2,0);if(deco)dnFretBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-3.2*s,1.0*s);else dnReliefBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-1.7*s,f[1],ry+sd*Math.PI/2,D-4.2*s,1.5*s,o.mural);}
 // deco piers with avatar panels flanking the door and at the corners
 // (piers sit at the corners, outside the window jambs and the plinth band; windows sit below the frieze)
 if(deco){for(const lx of[-W/2+.55*s,W/2-.55*s]){const f=L(lx,D/2);dnDecoPanel(f[0],yy+.5*s,f[1],ry,.9*s,H-.9*s);}
  for(const sd of[-1,1])for(const lz of[-D/2+.55*s,D/2-.55*s]){const f=L(sd*W/2,lz);dnDecoPanel(f[0],yy+.5*s,f[1],ry+sd*Math.PI/2,.9*s,H-.9*s);}}
 const c1=dnCornice(x,yy+H,z,W,D,ry,st,2,tr);vB('vStone',x,c1,z,W-.6*s,.5*s,D-.6*s,ry,tr||st.clone().multiplyScalar(.85));
 // the stepped crest on the front parapet (deco), then the shingle pyramid and its finial
 if(deco){const c=L(0,D/2-1.0*s);dnCrest(c[0],c1+.5*s,c[1],W*.6,ry,st);}
 kput('vPyrSh',[x,c1+.5*s,z],ry?qEuler(0,ry,0):null,[W-1.4*s,3.2*s,D-1.4*s],sh);vPst('vPost',x,c1+3.4*s,z,.1*s,1.6*s,vC(0x5a4632));vBall('dGiltBall',x,c1+5.0*s,z,.32*s);
 {const g=L(0,D/2+.1);dnGate(g[0],yy,g[1],ry,2.0*s,3.2*s,st,tr);const d=L(0,D/2);vnDoor(d[0],yy,d[1],ry,1.8*s,3.0*s,'vStone',tr||st,vC(0x2a2a30),false);
  for(const lx of[-3.0*s,3.0*s]){const w=L(lx,D/2);if(o.lit!==false)dnGodWin(w[0],yy+1.4*s,w[1],ry,1.0*s,1.4*s,'vStone',tr||st);else vnWin(w[0],yy+1.4*s,w[1],ry,1.0*s,1.4*s,'open','vStone',st);}
  for(const sd of[-1,1])for(const lz of[-2*s,2*s]){const w=L(sd*W/2,lz);if(o.lit!==false)dnGodWin(w[0],yy+1.4*s,w[1],ry+sd*Math.PI/2,1.0*s,1.4*s,'vStone',tr||st);}
  for(const lx of[-2.3*s,2.3*s]){const l=L(lx,D/2);if(o.lit!==false)dnGodLamp(l[0],yy+3.9*s,l[1],ry);}}
 // banners at the platform corners, the altar, the giant guards, the priest
 for(const sd of[-1,1]){const p=L(sd*(W/2+2.6*s),D/2+2.6*s);dnBannerPole(p[0],y,p[1],ry,6.5*s,dCol(sd<0?DPAL.gold:DPAL.turq));}
 {const a=L(0,D/2+4.4*s+2.6*s);dnAltar(a[0],y,a[1],ry,st);}
 for(const sd of[-1,1]){const g=L(sd*2.4*s,D/2+3.8*s+2.6*s);dnGiant(g[0],y,g[1],ry+sd*.25,4,{spear:true});}
 {const p=L(1.2*s,D/2+6.5*s+2.6*s);dnPriest(p[0],y,p[1],ry+Math.PI);}
 return{top:c1+5.2*s,plat:yy};}
// the priest's house: a round terracotta house with a cream fret band, a shingle cone with a gilt finial, God-lit
function dnPriestHouse(x,y,z,ry,r){r=r||3.4;const st=dCol(DPAL.sacred),tr=dCol(DPAL.trim);
 dnRoundHouse(x,y,z,r,2.9,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:r*1.1,door:ry,doorW:1.1,doorH:2.1,frame:'vStone',win:[ry+Math.PI*.6,ry-Math.PI*.6],lit:true,band:null,wood:tr,leafC:vC(0x2a2a30)});
 dnDrum('dStoneDrum',x,y+2.9-1.3,z,r+.04,.9,tr);for(let k=0;k<8;k++){const a=k/8*TAU+ry+.2;if(Math.abs(((a-ry)%TAU+TAU)%TAU)<.35)continue;const p=dnOnRing(x,z,r+.04,a);dnFretBand(p[0],y+2.9-1.2,p[1],a,.7,.7);}
 dnDrum('dStoneDrum',x,y+.35,z,r+.04,.28,tr);
 const p=dnOnRing(x,z,r,ry);dnGodLamp(p[0],y+2.5,p[1],ry);}

function buildDalabTemple(G,o){reseed(8601+(o.v|0));vnReg("Priests' temple",0,0,10,12);dnTemple(0,0,0,0,1,{});vnPaving(0,.02,12,6,4,0,dCol(DPAL.stone),8);dnFolk(0,15,3,2);}
function buildDalabPriestHouse(G,o){reseed(8611+(o.v|0));vnReg("Priest's house",0,0,5.5,8);dnPriestHouse(0,0,0,0,3.4);dnJar(4.6,0,1,.3);vnPaving(0,.02,5,2.6,2.4,0,dCol(DPAL.stone),4);dnPriest(1.5,0,6,Math.PI);}
// wayside shrine: a stele, a banner, an offering slab, a God-post
function buildDalabShrine(G,o){reseed(8621+(o.v|0));const st=dCol(DPAL.sacred);vnReg('Wayside shrine',0,0,3.5,5,{type:['religious']});
 vB('vStone',0,0,0,4,.4,4,0,dCol(DPAL.trim));dnChecker(0,.42,0,3.4,3.4,0);dnStele(0,.4,-.8,0,3.4,st,true);vB('vStone',0,.4,1.0,1.8,.5,.9,0,st);for(let k=0;k<4;k++)vBall('vGourd',-.6+k*.4,.9,1.0,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.18);
 dnBannerPole(-1.6,.4,-1.4,0,4.2,dCol(DPAL.red));dnGodPost(1.6,.4,-1.4,3.2);dnFolk(0,3.5,1,.5);}

// the ceremonial mound of an outlying settlement: r 30, plateau r 13, h 13; the temple and the priest's house on top;
// a stele-lined apron and a small plaza at the foot
function buildDalabMound(G,o){reseed(8631+(o.v|0));const R=30,RT=13,H=13;const st=dCol(DPAL.stone);
 vnReg('Ceremonial mound',0,0,R+4,H+14,{landmark:true});
 dnMound(0,0,R,RT,H,0,{stoneC:st});
 dnTemple(0,H,-3.5,0,.72,{stoneC:st});
 dnPriestHouse(-8.5,H,4.5,Math.PI*.6,2.6);
 for(let k=0;k<6;k++){const a=k/6*TAU+.3;if(Math.abs(a-Math.PI*.5)<.4||Math.abs(a-TAU+.3)<.5)continue;const p=dnOnRing(0,0,RT-.8,a);if(Math.abs(p[0])<3&&p[1]>4)continue;dnBannerPole(p[0],H,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold][k%3]));}
 // the plaza at the foot: paving, a stele pair, a fire, the folk gathering to watch the ceremony
 vnPaving(0,.02,R+9,16,8,0,st.clone().multiplyScalar(.92),18);dnFirePit(0,0,R+11,.9);dnFolk(0,R+9,6,4);dnPriest(0,H,RT+.5-1,0);}
// the High Priest's mound: r 46, plateau r 20, h 20 with a terrace ring; a greater temple and two halls on top; the
// ring earthwork (r 68, h 4.5, palisaded) with one entrance at the front
function buildDalabHighMound(G,o){reseed(8641+(o.v|0));const R=46,RT=20,H=20;const st=dCol(DPAL.stone);
 vnReg("High Priest's mound",0,0,R+4,H+18,{landmark:true,role:'high priest'});vnReg("High Priest's ring",0,0,74,6,{part:'wall',type:['religious','military']});
 dnMound(0,0,R,RT,H,0,{stoneC:st,terrace:{r:56,h:5}});
 dnTemple(0,H,-6,0,1.0,{stoneC:st});
 dnPriestHouse(-13,H,6,Math.PI*.55,3.2);dnPriestHouse(13,H,6,-Math.PI*.55,3.2);
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;const p=dnOnRing(0,0,RT-1.2,a);if(Math.abs(p[0])<5&&p[1]>8)continue;if(p[1]<-12)continue;dnStele(p[0],H,p[1],a+Math.PI,2.8,st);}
 dnRingBank(0,0,68,4.5,9,0,10,{palisade:true});
 for(const s of[-1,1]){dnStele(s*7.5,0,68+6,0,3.6,dCol(DPAL.sacred),true);dnGiant(s*4,0,68+3,s*.2,4,{spear:true});}
 vnPaving(0,.02,R+12,18,10,0,st.clone().multiplyScalar(.92),20);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);
 dnFolk(0,62,4,3);}

// the Palace mound: the High Priest's palace BUILT INTO the front of a mound. Three battered stone ranges are cut
// into the slope, each with its own paved landing and balustrade in front of it; the stair climbs the axis from the
// ground to the first landing, then a pair of side flights from each landing to the next (past the ends of the
// range above), and a last pair up to the plateau, where the palace hall (a greater temple) and two wings stand.
// The great trilithon door into the mound's heart is on the lowest range; the relief bands stop clear of the
// doors. The flanks are terraced gardens: contour beds behind low retaining walls, planted from the lowlands
// biome (skirt palms, ember manzanita, pompom cycads, young jacarandas and ringbarks; shrubs, azaleas, agaves,
// aloes, yuccas, golden grass, toyon, ferns).
function buildDalabPalaceMound(G,o){reseed(8651+(o.v|0));const R=42,RT=18,H=17;const st=dCol(DPAL.sacred),stD=dCol(DPAL.trim,.92),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),grey=dCol(DPAL.stone);
 vnReg("High Priest's palace mound",0,0,R+4,H+18,{landmark:true,role:'palace'});
 const M=dnMound(0,0,R,RT,H,0,{stoneC:grey,noStair:true});const pf=M.prof;
 // the terraces: [face radius, depth, height, width]; the landing in front of each is (range width + 9) wide
 const TERR=[[33.5,6.5,4.2,26],[29,6,4.0,20],[25,5.5,3.8,16]];
 const yfs=TERR.map(T=>pf(T[0]));const LW=TERR.map((T,i)=>i===0?T[3]+9:TERR[i-1][3]+9);const SX=TERR.map(T=>T[3]/2+2.6);
 const LD=3.8;                                                                        // landing depth
 // ground apron and the axial flight to the first landing
 vnPaving(0,.02,R+5,16,8,0,grey.clone().multiplyScalar(.92),18);dnChecker(0,.03,R+5,5,8,0);dnStele(-3.6,0,R+3.6,0,3.2,st,true);dnStele(3.6,0,R+3.6,0,3.2,st,true);
 dnFlight(0,0,R+3,0,yfs[0],TERR[0][0]+LD,4.6,grey,-1);
 TERR.forEach((T,i)=>{const [rf,depth,hh,ww]=T;const yf=yfs[i];const zc=rf-depth/2;const lw=LW[i];
  // the landing: a stone platform faced down to the slope, paved, with a balustrade on its front edge and ends
  const yb=pf(rf+LD+1.5)-1.2;vB('vStone',0,yb,rf+LD/2,lw,yf-yb,LD,0,grey.clone().multiplyScalar(.9));dnChecker(0,yf+.02,rf+LD/2,lw-1,LD-.6,0);
  const gaps=i===0?[[-2.6,2.6]]:[[-SX[i-1]-2.6,-SX[i-1]+2.6],[SX[i-1]-2.6,SX[i-1]+2.6]];
  let xs=-lw/2+.3;const zf=rf+LD-.2;for(const g of gaps){dnBalustrade(xs,yf,zf,g[0],yf,zf,tr);xs=g[1];}dnBalustrade(xs,yf,zf,lw/2-.3,yf,zf,tr);
  for(const sd of[-1,1])dnBalustrade(sd*(lw/2-.3),yf,zf,sd*(lw/2-.3),yf,rf-.5,tr);
  // the range: buried at the back, battered face, relief either side of the door, a colonnade, a corniced parapet
  vB('vStone',0,yf-.3,zc,ww,hh+.3,depth,0,st);
  for(const sd of[-1,1])dnFretBand(sd*(ww/4+1.4),yf+.4,rf,0,ww/2-3.2,1.0);for(const sd of[-1,1])dnDecoPanel(sd*(ww/2-1.1),yf+.4,rf,0,.9,hh-.8);
  const c=dnCornice(0,yf+hh,zc,ww,depth,0,st,2,tr);vB('vStone',0,c,zc,ww-.8,.5,depth-.8,0,stD);if(i===2)dnCrest(0,c+.5,zc,ww*.55,0,st);
  for(const sd of[-1,1])for(let k=0;k<3;k++){const x=sd*(3.4+k*3.6);if(Math.abs(x)>ww/2-1.2)continue;dnGodWin(x,yf+1.6,rf,0,1.0,1.5,'vStone',st);}
  for(const sd of[-1,1])for(let k=0;k<Math.floor((ww/2-3)/3.6)+1;k++){const x=sd*(3.6+k*3.6);if(Math.abs(x)>ww/2-1)continue;vPst('vPostS',x,yf,rf+1.6,.26,hh-.4,tr);}
  vB('vStone',0,yf+hh-.5,rf+1.0,ww+.4,.4,2.6,0,tr);
  for(const sd of[-1,1])dnGodLamp(sd*2.6,yf+3.2,rf,0);
  if(i===0){dnGate(0,yf,rf+.45,0,2.6,4.0,st,tr);vnDoor(0,yf,rf+.12,0,2.4,3.8,'vStone',st,vC(0x2a2a30),false);dnGiant(-4.6,yf,rf+2.6,.2,4,{spear:true});dnGiant(4.6,yf,rf+2.6,-.2,4,{spear:true});}
  else{vnDoor(0,yf,rf+.12,0,1.8,3.0,'vStone',tr,vC(0x2a2a30),false);vB('vStone',0,yf+3.0,rf+.14,2.6,.3,.5,0,tr);dnFretBand(0,yf+3.35,rf,0,2.8,.5);}
  for(const sd of[-1,1])dnBanner(sd*(ww/2-1.5),yf+hh-.2,rf+.3,0,.9,2.6,dCol(sd<0?DPAL.gold:DPAL.turq));
  // the side flights up to the next landing (or the plateau), on solid stone walls
  const sx=SX[i];const next=i<TERR.length-1?{y:yfs[i+1],z:TERR[i+1][0]+LD}:{y:H,z:RT-1.5};
  for(const sd of[-1,1])dnFlight(sd*sx,yf,rf+LD-2.2,sd*sx,next.y,next.z,4.0,grey,yf-1.2);});
 // the plateau: a rim balustrade across the front between the last flights, the palace hall and its wings
 {const sx=SX[2];dnBalustrade(-sx+2.4,H,RT-1.5,sx-2.4,H,RT-1.5,tr);for(const sd of[-1,1])vB('vStone',sd*(sx+2.2),H-.05,RT-1.6,1.0,1.4,1.0,0,tr),vBall('dGiltBall',sd*(sx+2.2),H+1.5,RT-1.6,.16);dnChecker(0,H+.02,RT-6,12,8,0);}
 dnTemple(0,H,-7,0,1.05,{stoneC:st});
 for(const sd of[-1,1]){const wx=sd*12.5,wz=-2;vB('vStone',wx,H,wz,7,4.4,12,0,st);dnFretBand(wx,H+.3,wz+6,0,5.5,.9);dnDecoPanel(wx-sd*3.5,H+.5,wz-4.5,-sd*Math.PI/2,.9,3.4);const c=dnCornice(wx,H+4.4,wz,7,12,0,st,2,tr);
  vnPyrRoof('vPyrSh',wx,c,wz,7,12,2.2,0,sh,.3);for(const z of[-1,3])dnGodWin(wx-sd*3.5,H+1.6,wz+z,-sd*Math.PI/2,1.0,1.4,'vStone',tr);
  vnDoor(wx-sd*3.5,H,wz+6-2.5,-sd*Math.PI/2,1.3,2.5,'vStone',tr,vC(0x2a2a30),false);}
 for(let k=0;k<6;k++){const a=k/6*TAU+.5;const p=dnOnRing(0,0,RT-1.4,a);if(p[1]>9&&Math.abs(p[0])<5)continue;dnBannerPole(p[0],H,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold][k%3]));}
 // THE GARDENS: contour beds on both flanks (bearings 42..142 degrees off the front), each a low retaining wall of
 // stone along the arc with a flat turf bed behind it, planted from the lowlands biome
 BIO.cur='lowlands/garden';
 const BEDS=[39.5,35.5,31.5,27.5,23.5];const wallC=grey.clone().multiplyScalar(.95);
 BEDS.forEach((rho,bi)=>{const yb=pf(rho);const inner=rho-2.8;
  for(const sd of[1]){const a0=.74,a1=TAU-.74;const n=Math.round((a1-a0)*rho/2.2);
   for(let k=0;k<n;k++){const a=sd*(a0+(a1-a0)*(k+.5)/n);const p=dnOnRing(0,0,rho+.25,a);const yw=pf(rho+1.4)-.3;vB('vStone',p[0],yw,p[1],(a1-a0)*rho/n+.1,yb+.55-yw,.5,a,wallC);   // retaining wall
    const q=dnOnRing(0,0,rho-1.4,a);vB('dTurf',q[0],yb-1.4,q[1],(a1-a0)*rho/n+.15,1.42,2.8,a,dCol(DPAL.turf));}                             // the bed
   // plants: a small tree every ~9 m of arc, ground plants every ~2.4 m
   const L=(a1-a0)*rho;const nt=Math.round(L/9),np=Math.round(L/2.4);const TREES=['skirtpalm','manzanita','pompom','jacaranda','ringbark','manzanita','skirtpalm'];const TS={skirtpalm:.75,manzanita:.8,pompom:.8,jacaranda:.42,ringbark:.55};
   for(let k=0;k<nt;k++){const a=sd*(a0+(a1-a0)*(k+.5)/nt+rr(-.04,.04));if(Math.abs(a-Math.PI)<.12)continue;/* the back flight */const p=dnOnRing(0,0,inner+1.1,a);const sp=TREES[(k+bi)%TREES.length];dnTree(sp,p[0],yb,p[1],{scale:TS[sp]*rr(.85,1.1)});}
   const PL=['shrub','azalea','agave','grassgold','aloe','toyon','yucca','fern','shrub','blooms','grass','pincushion'];
   for(let k=0;k<np;k++){const a=sd*(a0+(a1-a0)*(k+.3+rng()*.4)/np);const p=dnOnRing(0,0,inner+.6+rng()*1.6,a);const kind=PL[(k*5+bi*3)%PL.length];dnPlant(kind,p[0],yb+.02,p[1],{k:kind==='shrub'?.7:undefined});}}});
 BIO.cur=null;
 // garden stairs: a narrow flight on each flank from the ground to the lowest bed, and between beds
 for(const a of[1.62,-1.62,Math.PI]){let prevR=R+2.5,prevY=0;for(const rho of BEDS){const p0=dnOnRing(0,0,prevR,a),p1=dnOnRing(0,0,rho-1.2,a);dnFlight(p0[0],prevY,p0[1],p1[0],pf(rho)+.02,p1[1],1.6,grey,prevY-.6);prevR=rho-2.4;prevY=pf(rho)+.02;}}
 // the back flight ends at a small viewing platform on the plateau rim
 {const p=dnOnRing(0,0,RT-3,Math.PI);dnChecker(p[0],H+.02,p[1],5,4,0);dnBalustrade(p[0]-2.5,H,p[1]-2,p[0]+2.5,H,p[1]-2,tr);dnStele(p[0]-3,H,p[1],Math.PI,2.6,st,true);dnStele(p[0]+3,H,p[1],Math.PI,2.6,st,true);}
 vnPaving(0,.02,R+12,20,10,0,grey.clone().multiplyScalar(.92),22);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);dnPriest(0,H,RT-3,0);dnFolk(-6,yfs[0],TERR[0][0]+2,2,1.4);}
// a priests' compound at ground level: a stone ring wall round three priests' houses, a chapel drum, a stele court,
// a garden, God-posts; the priests who serve a settlement live here below the mound
function buildDalabPriestCompound(G,o){reseed(8661+(o.v|0));const R=22;const st=dCol(DPAL.stone),sc=dCol(DPAL.sacred),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),wood=dCol(DPAL.wood);
 vnReg("Priests' compound",0,0,R+2,12);vnReg("Priests' compound wall",0,0,R+1,4,{part:'wall'});
 dnRingWall(0,0,0,R,3.4,0,4.4,'vStone',sc,1.0);dnGate(0,0,R+.3,0,3.8,4.0,sc,tr);
 vnPaving(0,.02,0,R*1.5,R*1.5,0,st.clone().multiplyScalar(.92),50);dnChecker(0,.03,R-8,4.6,16,0);dnChecker(0,.03,9,14,4,0);
 dnPriestHouse(-11,0,-6,Math.PI*.35,3.4);dnPriestHouse(11,0,-6,-Math.PI*.35,3.4);dnPriestHouse(0,0,-14,0,3.0);
 // the chapel: a stone drum with a relief band, a shingle cone, an altar before it
 dnDrum('dStoneDrumB',0,0,2,4.6,5,sc);dnDrum('dStoneDrum',0,3.3,2,4.42,1.2,tr);for(let k=0;k<10;k++){const a=k/10*TAU+.3;const p=dnOnRing(0,2,4.44,a);dnFretBand(p[0],3.45,p[1],a,.9,.9);}dnMuralRing(0,1.0,2,4.6,1.3);dnDrum('dStoneDrum',0,.4,2,4.62,.3,tr);
 kput('dConeSh',[0,4.7,2],null,[5.6,4.6,5.6],sh);vBall('dGiltBall',0,9.2,2,.3);for(const sd of[-1,1]){const p=dnOnRing(0,2,4.62,sd*.55);dnDecoPanel(p[0],.8,p[1],sd*.55,.8,2.2);}
 vnDoor(0,0,6.6,0,1.4,2.6,'vStone',st,vC(0x2a2a30),false);dnGodLamp(-1.6,3.2,6.6,0);dnGodLamp(1.6,3.2,6.6,0);for(const a of[Math.PI*.5,-Math.PI*.5]){const p=dnOnRing(0,2,4.6,a);dnGodWin(p[0],2.2,p[1],a,.9,1.4,'vStone',st);}
 dnAltar(0,0,11,0,st);
 for(let k=0;k<6;k++){const a=k/6*TAU+.52;const p=dnOnRing(0,0,R-4,a);if(p[1]>R-8)continue;dnStele(p[0],0,p[1],a+Math.PI,3.0,sc,true);}
 vnPlanter(-12,0,6,5,1.4,0,wood);vnPlanter(12,0,6,5,1.4,0,wood);vnPlanter(-12,0,9.5,5,1.4,0,wood);vnPlanter(12,0,9.5,5,1.4,0,wood);
 dnGodPost(-4,0,15,4);dnGodPost(4,0,15,4);dnGodPost(-4,0,R+1.5,3.6);dnGodPost(4,0,R+1.5,3.6);
 dnPriest(-3,0,13,.5);dnPriest(3,0,9,-1.2);dnPriest(0,0,-8,Math.PI);dnFolk(0,R+5,3,2);}
// the healers' hall: where Dalab's prized healers treat the townsfolk — a long stone hall with a God-lit ward, a herb
// garden, a drum dispensary, a queue of the sick on benches
function buildDalabHealers(G,o){reseed(8671+(o.v|0));const W=20,D=9,H=4.4,Y0=.6;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),sh=dCol(DPAL.shingle),wood=dCol(DPAL.wood);
 vnReg("Healers' hall",0,0,15,H+8);
 dnPlatform(0,0,0,W+8,D+8,Y0,0);vnStairs(0,0,D/2+4+1.0,0,4,Y0,3,'vStone',st);
 vB('vStone',0,Y0,0,W,H,D,0,st);dnReliefBand(0,Y0+.3,D/2,0,W-1.5,.9,st);dnMuralBand(0,Y0+H-1.9,D/2,0,W-4,1.5);
 const c=dnCornice(0,Y0+H,0,W,D,0,st,2);vnHipRoof('vHipS',0,c,0,W,D,2.8,0,sh,.4);
 dnGate(0,Y0,D/2+.1,0,2.0,3.2,st);vnDoor(0,Y0,D/2,0,1.8,3.0,'vStone',st,vC(0x2a2a30),false);
 for(const x of[-8,-5.6,-3.2,3.2,5.6,8])dnGodWin(x,Y0+1.6,D/2,0,1.1,1.6,'vStone',st);for(const s of[-1,1])for(const z of[-2.5,2.5])dnGodWin(s*W/2,Y0+1.6,z,s*Math.PI/2,1.0,1.5,'vStone',st);
 for(const x of[-2.6,2.6])dnGodLamp(x,Y0+3.6,D/2,0);
 // the dispensary drum at one end, the herb garden at the other
 dnDrum('dStoneDrumB',W/2+3.2,Y0,-1,2.8,4.0,st);kput('dConeSh',[W/2+3.2,Y0+3.7,-1],null,[3.4,2.8,3.4],sh);const dp=dnOnRing(W/2+3.2,-1,2.8,.9);vnDoor(dp[0],Y0,dp[1],.9,1.0,2.0,'vStone',st,vC(0x2a2a30),false);
 for(let k=0;k<4;k++)vnPlanter(-W/2-3.2,Y0,-3+k*2.2,2.6,1.2,0,wood);
 // benches for the sick, a brazier, the healers in white
 for(let k=0;k<3;k++)vB('vWood',-4+k*4,Y0+.4,D/2+2.4,2.8,.1,.4,0,wood);dnFolk(-4,D/2+2.6,2,1.2,Y0);dnFolk(4,D/2+2.6,2,1.2,Y0);dnFirePit(-8,Y0,D/2+3,.6);
 dnPriest(1.2,Y0,D/2+1.6,Math.PI);dnPriest(-6,Y0,D/2+.8,-.6);dnGodPost(-6,0,D/2+6,3.6);dnGodPost(6,0,D/2+6,3.6);dnFolk(0,D/2+9,3,2);}

dDef({key:'dalab_temple',name:"Priests' temple",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true},w:26,d:30,h:14,build:buildDalabTemple});
dDef({key:'dalab_priest_house',name:"Priest's house",family:'sacred',tags:Object.assign({wealth:'priest',lit:true},{type:['single-family dwelling','religious']}),w:14,d:14,h:8,build:buildDalabPriestHouse});
dDef({key:'dalab_shrine',name:'Wayside shrine',family:'sacred',tags:{type:['religious'],wealth:'priest',lit:true},w:8,d:8,h:5,build:buildDalabShrine});
dDef({key:'dalab_mound',name:'Ceremonial mound',family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true},w:76,d:90,h:28,build:buildDalabMound});
dDef({key:'dalab_high_mound',name:"High Priest's mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'high priest'},w:160,d:170,h:40,build:buildDalabHighMound});
dDef({key:'dalab_palace_mound',name:"High Priest's palace mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'palace'},w:100,d:110,h:36,build:buildDalabPalaceMound});
dDef({key:'dalab_priest_compound',name:"Priests' compound",family:'sacred',tags:{type:['religious','single-family dwelling'],wealth:'priest',lit:true},w:52,d:52,h:12,build:buildDalabPriestCompound});
dDef({key:'dalab_healers',name:"Healers' hall",family:'civic',tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'healers'},w:36,d:28,h:13,build:buildDalabHealers});
// ================================================================= HIGHLANDS — the carved and painted vocabulary (prefix hn)
// Shared by all three branches; what varies is how much of it a building carries and in which material:
//   Republican — nalichnik window surrounds, keel gables, onion/tent/spire roofs, dougong under civic eaves,
//                formline boards at doors and gables, guild totems at the entrance;
//   Rustic     — carved bargeboards with crossed horns/dragon heads, alpine balconies with cut-out boards,
//                painted gable crests, a totem or two at the hall;
//   Tribal     — totems everywhere, whole painted house-fronts, wings, bamboo, raw logs.

// ---------------------------------------------------------------- totems and painted posts
// Totem pole: carved column (the crest map faces the building's front when ry is the front direction), an
// optional pair of spread wings (thunderbird crossarm) and a carved beak at the top figure.
function hnTotem(x,y,z,r,h,ry,o){o=o||{};if(hlNonTribal())return hnPillar(x,y,z,Math.max(.2,r*1.1),h,ry,{free:true});   // outside the tribes: a carved column
 kput(o.painted?'hTotemP':'hTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
 const f=loc(x,z,0,r*.9,ry);kput('vConeI',[f[0],y+h*.86,f[1]],vQ(ry,Math.PI/2,0),[r*.34,r*1.3,r*.34],hC(HPAL.black));   // the top figure's beak
 if(o.wings){const wy=y+h*(o.wingAt||.8);for(const s of[-1,1]){const p=loc(x,z,s*(r+o.wings*.5),r*.2,ry);kput('hWing',[p[0],wy,p[1]],vQ(ry,0,s*-.12),[s*o.wings,o.wings*.5,1],null);}}
 if(o.hat){for(let k=0;k<3;k++)vPst('hPaint',x,y+h+k*.16,z,r*(1-.12*k),.14,hC(k%2?HPAL.red:HPAL.black));}}
// A porch post carved as a short totem (the colonnades of civic fronts, the tribal houses).
function hnTotemPost(x,y,z,r,h,ry,painted){if(hlNonTribal())return hnPillar(x,y,z,Math.max(.16,r),h,ry,{});
 kput(painted?'hTotemP':'hTotem',[x,y,z],qEuler(0,ry+Math.PI,0),[r,h,r],null);
 vB('hPaint',x,y+h-.02,z,r*2.6,.2,r*2.6,ry,hC(HPAL.black));vB('vStone',x,y-.1,z,r*2.4,.22,r*2.4,ry,hC(vPick(HPAL.rubble)));}
// Formline board on a face: item hFormA (crest, 2:1) | hFormW (on white) | hFormV (tall board) | hFormT (gable bird).
// Republican and Rustic builders get the wider repertoire (round 2): the item is swapped for a pick from HMOTIF of the
// same shape — formline animals stay in the pool — and the first wide crest on a Republican CIVIC building is the
// Republic's emblem.
function hnForm(item,x,y,z,ry,w,h){if(hlNonTribal()){const C=VERN.cur;(C.murals||(C.murals=[])).push({item:hnMotifPick(item),x,y,z,ry,w,h});return;}   // fitted after the building (hlFlush)
 const p=loc(x,z,0,.07,ry);kput(item,[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);}
// Frieze band (hFormF) along a face — eave boards, lintels, the belt between storeys.
function hnFrieze(x,y,z,ry,w,h){const p=loc(x,z,0,.05,ry);vB('hFormF',p[0],y,p[1],w,h||.5,.1,ry);}

// ---------------------------------------------------------------- round 2: branch rules, pillars, signs, emblem
// Totems belong to the tribes only; the Republic and the Rustic villages carve PILLARS with the same stacked motifs.
const hlNonTribal=()=>{const c=VERN.cur;return !!(c&&c.D.branch&&c.D.branch!=='tribal');};
const hlRepCivic=()=>{const c=VERN.cur;return !!(c&&c.D.branch==='republican'&&c.D.tags.wealth==='civic');};
function hnMotifPick(item){const c=VERN.cur,rus=c.D.branch==='rustic';
 if(item==='hFormT')return vPick(HMOTIF.gable.concat(['hFormT']));
 if(item==='hFormV')return vPick(HMOTIF.tall.concat(['hFormV']));
 if(hlRepCivic()&&!c.emblemDone){c.emblemDone=true;return HMOTIF.emblemWide;}
 return vPick(HMOTIF.wide.filter(k=>!(rus&&k==='hM_w_rocket')).concat(['hFormA','hFormW','hFormB']));}
// Carved pillar: a square timber shaft whose four faces carry a stacked motif column (like a totem, but a column),
// on a stone plinth, under a painted capital (necking, echinus, abacus). {free:true} stands it alone with a painted
// roundel as finial; {item} forces a pillar map (hM_p_0..3). r = half the shaft width.
function hnPillar(x,y,z,r,h,ry,o){o=o||{};const s=r*2,stone=hC(vPick(HPAL.ashlar)),wood=hC(vPick(HPAL.tar));
 const bh=Math.min(.42,h*.1),ch=Math.min(.55,h*.13),sh=h-bh-.1-ch;
 vB('vStone',x,y,z,s*1.55,bh,s*1.55,ry,stone);vB('vStone',x,y+bh,z,s*1.25,.1,s*1.25,ry,stone);
 kput(o.item||vPick(HMOTIF.pillar),[x,y+bh+.1+sh/2,z],qEuler(0,ry,0),[s,sh,s],null);
 const cy=y+h-ch;vB('hPaint',x,cy,z,s*1.08,ch*.28,s*1.08,ry,hC(HPAL.black));vB('hPaint',x,cy+ch*.28,z,s*1.3,ch*.34,s*1.3,ry,hC(vPick([HPAL.red,HPAL.teal])));
 vB('vWood',x,cy+ch*.62,z,s*1.6,ch*.38,s*1.6,ry,wood);
 if(o.free){const k=o.disc||vPick(HMOTIF.disc),R=Math.max(.7,s*1.6);vPst('vIron',x,y+h,z,.04,R*.35,hC(0x2e2a26));
  kput(k,[x,y+h+R*.35+R/2,z],qEuler(0,ry,0),[R,R,1],null);vB('hGoldB',x,y+h+R*.35-.04,z,R*.36,.08,.12,ry,hC(HPAL.gold[0]));}}
// The Republic's emblem (three arms, three swords) as a painted roundel on a face, d across.
function hnEmblem(x,y,z,ry,d){const p=loc(x,z,0,.09,ry);kput(HMOTIF.emblem,[p[0],y,p[1]],qEuler(0,ry,0),[d,d,1],null);}
// Banners: on a Republican civic building every banner pole flies the Republic's banner.
const _hlBannerPole=vnBannerPole;
vnBannerPole=function(x,y,z,ry,h,c){if(!hlRepCivic())return _hlBannerPole(x,y,z,ry,h,c);
 vPst('vPost',x,y,z,.08,h,hC(0x5a4632));const p=loc(x,z,.55,0,ry);vB('vWood',p[0],y+h-.2,p[1],1.1,.08,.08,ry,hC(0x5a4632));vBall('hGold',x,y+h+.08,z,.12,hC(HPAL.gold[0]));
 kput(HMOTIF.banner,[p[0],y+h-1.62,p[1]],vQ(ry+Math.PI/2,0,0),[.9,2.7,1]);};
// Trade signs. Each shop-like def names its symbol here (a list = one per call, in order: a row of shops).
const HTRADE={hl_rep_tavern_a:'tankard',hl_rep_tavern_b:'tankard',hl_rep_tavern_c:'tankard',hl_rep_inn:'bed',hl_rep_shops:['bread','boot','shears','candle'],
 hl_rep_market_hall:'scales',hl_rep_workshop_a:'wheel',hl_rep_workshop_b:'barrel',hl_rep_smithy_small:'anvil',hl_rep_smithy_large:'anvil',hl_rep_stables:'horse',
 hl_rep_warehouse_a:'sack',hl_rep_warehouse_b:'sack',hl_rep_guild_merc:'swords',hl_rep_guild_alch:'flask',hl_rep_guild_farm:'sheaf',hl_rep_guild_smith:'hammer',
 hl_rep_guild_mech:'gear',hl_rep_guild_astro:'star',hl_rep_guild_scav:'salvage',hl_rep_hospital:'mortar',hl_rep_school:'book',hl_rep_forgehouse:'anvil',hl_rep_granary:'sheaf',hl_rep_windmill:'sheaf',hl_rep_watermill:'sheaf',
 hl_rus_shops:['bread','scales','fish'],hl_rus_tavern:'tankard',hl_rus_smithy:'anvil',hl_rus_mill:'sheaf',hl_rus_granary:'sheaf'};
function hlTradeSym(sym){if(sym)return sym;const c=VERN.cur;const t=c&&HTRADE[c.D.baseKey||c.D.key];if(!t)return 'scales';if(!Array.isArray(t))return t;c.signN=(c.signN||0);return t[c.signN++%t.length];}
// Hanging sign: an iron bracket out of the wall at (x,y,z) (ry = outward), a painted roundel hung across it.
function hnSign(x,y,z,ry,sym,s){s=s||1;const I=hC(0x2e2a26),k=HMOTIF.sign[hlTradeSym(sym)]||HMOTIF.sign.scales;const a=loc(x,z,0,.04,ry),b=loc(x,z,0,1.25*s,ry),m=loc(x,z,0,.62*s,ry);
 beam('vIron',[a[0],y,a[1]],[b[0],y,b[1]],.06,.06,I);beam('vIron',[a[0],y-.62*s,a[1]],[m[0],y,m[1]],.04,.04,I);vBall('hGold',b[0],y,b[1],.06,hC(HPAL.gold[0]));
 const p=loc(x,z,0,.72*s,ry),R=.9*s;for(const u of[-.25,.25]){const q=loc(x,z,0,(.72+u)*s,ry);vB('vIron',q[0],y-.14,q[1],.02,.14,.02,0,I);}
 kput(k,[p[0],y-.14-R/2,p[1]],qEuler(0,ry+Math.PI/2,0),[R,R,1],null);}
// Flat sign on a wall: a painted board with the trade roundel between two knotwork panels (y = bottom).
function hnSignBoard(x,y,z,ry,w,h,sym,bgC){const f=loc(x,z,0,.04,ry);vB('hPaint',f[0],y,f[1],w+.14,h+.14,.08,ry,hC(HPAL.black));const b=loc(x,z,0,.09,ry);vB('hPaint',b[0],y+.07,b[1],w,h,.03,ry,bgC||hC(HPAL.ochre));
 const d=Math.min(h*1.35,w*.5),c=loc(x,z,0,.12,ry);kput(HMOTIF.sign[hlTradeSym(sym)]||HMOTIF.sign.scales,[c[0],y+.07+h/2,c[1]],qEuler(0,ry,0),[d,d,1],null);
 const kw=(w-d)/2-.12;if(kw>.25)for(const s2 of[-1,1]){const p=loc(x,z,s2*(d/2+.06+kw/2),.115,ry);kput(vPick(['hM_w_knot','hM_w_knotRed']),[p[0],y+.07+h/2,p[1]],qEuler(0,ry,0),[kw,Math.min(h*.8,kw/2),1],null);}}

// ---------------------------------------------------------------- dougong (painted bracket sets under eaves)
// One set on a post head at (x,y,z): a dou block, a crossed pair of arms (one along the face, one projecting
// out toward ry), smaller blocks at the arm ends, a second longer arm and a purlin block. `s` scales the set
// (1 ≈ a 1.6 m-wide set for a civic eave). Teal arms, red blocks, white arrises — the East-Asian note in the kit.
function hnDougong(x,y,z,ry,s,armC,blockC){s=s||1;armC=armC||hC(HPAL.teal);blockC=blockC||hC(HPAL.red);const W=hC(HPAL.white);
 const P=(u,yy,o)=>{const p=loc(x,z,u*s,o*s,ry);return[p[0],y+yy*s,p[1]];};const q=qEuler(0,ry,0),qo=qEuler(0,ry+Math.PI/2,0);
 let p=P(0,.13,0);kput('hPaint',p,q,[.38*s,.26*s,.38*s],blockC);
 p=P(0,.36,0);kput('hPaint',p,q,[1.0*s,.2*s,.22*s],armC);kput('hPaint',P(0,.36,.12),q,[1.0*s,.03*s,.02*s],W);           // arm along the face
 p=P(0,.36,.3);kput('hArm',p,qo,[.2*s,.2*s,.95*s],armC);                                                                // projecting arm, curved nose
 for(const u of[-.44,.44,0])kput('hPaint',P(u,.54,0),q,[.22*s,.16*s,.24*s],blockC);kput('hPaint',P(0,.54,.66),q,[.22*s,.16*s,.24*s],blockC);
 kput('hPaint',P(0,.72,0),q,[1.6*s,.2*s,.22*s],armC);kput('hPaint',P(0,.72,.12),q,[1.6*s,.03*s,.02*s],W);
 p=P(0,.72,.55);kput('hArm',p,qo,[.2*s,.2*s,1.3*s],armC);
 kput('hPaint',P(0,.9,.4),q,[1.8*s,.16*s,1.2*s],blockC);}
// A row of sets along a face (between x0..x1 in the face frame), each on a painted post head / wall plate.
function hnBracketRow(x,y,z,ry,w,n,s,armC,blockC){const C=VERN.cur;if(C&&!C.flushing){(C.brows||(C.brows=[])).push([x,y,z,ry,w,n,s,armC,blockC]);return;}   // laid out round the windows after the building (hlFlush)
 hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,[]);}
function hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,gaps){const inGap=u=>gaps.some(g=>u>g[0]&&u<g[1]);for(let i=0;i<n;i++){const u=-w/2+w*(i+.5)/n;if(inGap(u))continue;const p=loc(x,z,u,0,ry);hnDougong(p[0],y,p[1],ry,s,armC,blockC);}
 const cuts=[-w/2];for(const g of gaps.slice().sort((a,b)=>a[0]-b[0])){cuts.push(Math.max(-w/2,g[0]),Math.min(w/2,g[1]));}cuts.push(w/2);
 for(let i=0;i+1<cuts.length;i+=2){const a=cuts[i],b=cuts[i+1];if(b-a<.25)continue;const p=loc(x,z,(a+b)/2,.08,ry);vB('hPaint',p[0],y-.18,p[1],b-a,.18,.3,ry,armC||hC(HPAL.teal));}}                                  // painted wall plate

// ---------------------------------------------------------------- bargeboards, gable finials, horns
// For a gable roof laid with vnGableRoof/hnGable at (x,y,z,w,d,rise,ry,over): carved lace bargeboards down both
// rakes at both gable ends, a hanging "towel" board at the apex, and a finial by style:
//   'lace'   Russian: lace bargeboards + towel + small spike
//   'horns'  Norse: the rake boards run on past the ridge and cross, ending in curled horns
//   'dragon' Norse, grander: crossed boards ending in carved heads with open jaws
//   'bird'   Tribal: a thunderbird (wing plane + beak) standing on the apex
function hnBarge(x,y,z,w,d,rise,ry,over,c,style,endOver){over=over===undefined?.9:over;c=c||hC(HPAL.white);style=style||'lace';const eo=endOver===undefined?over:endOver;
 const run=d/2+over,drop=over*rise/(d/2);
 for(const sx of[-1,1]){const gx=sx*(w/2+eo+.04);const N=hRot(ry,[sx,0,0]);
  const apex=[...loc(x,z,gx,0,ry)];const A=[apex[0],y+rise+.05,apex[1]];
  for(const sz of[-1,1]){const e=loc(x,z,gx,sz*run,ry);const E=[e[0],y-drop,e[1]];
   const mid=[(A[0]+E[0])/2,(A[1]+E[1])/2-.26,(A[2]+E[2])/2];const L=Math.hypot(E[0]-A[0],E[1]-A[1],E[2]-A[2]);
   if(style==='lace'||style==='bird'){let X=[E[0]-A[0],E[1]-A[1],E[2]-A[2]];if(hCross(N,hNorm(X))[1]<0)X=X.map(v=>-v);hnOri('hLaceV',mid,X,N,[L,.55,1],c);}   // keep the scallops hanging DOWN on both rakes
   else hnMember('hPaint',[A[0],A[1]-.12,A[2]],[E[0],E[1]-.12,E[2]],.34,.08,N,c);
   if(style==='horns'||style==='dragon'){   // the board carries on past the apex, crossing its twin
    const dir=hNorm([A[0]-E[0],A[1]-E[1],A[2]-E[2]]);const T=hAdd(A,dir,1.1);hnMember('hPaint',[A[0],A[1]-.12,A[2]],T,.3,.08,N,c);
    const up=hAdd(T,[dir[0]*.25,.6,dir[2]*.25]);hnMember('hPaint',T,up,.24,.08,N,c);
    if(style==='dragon'){const H=hAdd(up,[dir[0]*.3,.1,dir[2]*.3]);hnOri('hPaint',H,[dir[0],.3,dir[2]],N,[.7,.34,.14],c);
     kput('vConeI',hAdd(H,[dir[0]*.35,-.04,dir[2]*.35]),qFacing([dir[0],0,dir[2]]).multiply(qEuler(Math.PI/2,0,0)),[.1,.3,.1],hC(HPAL.red));}}}
  if(style==='lace'){hnOri('hPaint',[A[0],A[1]-.7,A[2]],hRot(ry,[0,0,1]),N,[.28,1.2,.08],c);hnOri('hLaceV',[A[0],A[1]-1.45,A[2]],hRot(ry,[0,0,1]),N,[.5,.3,1],c);
   vPst('vIron',A[0],A[1],A[2],.03,.9,hC(0x2e2a26));vBall('hGold',A[0],A[1]+.9,A[2],.1,hC(HPAL.gold[0]));}
  if(style==='bird'){const p=[A[0],A[1]+.55,A[2]];for(const s of[-1,1]){const q=loc(A[0],A[2],0,s*.8,ry);kput('hWing',[q[0],A[1]+.6,q[1]],qEuler(0,ry+sx*Math.PI/2,0),[s*1.6,.8,1],null);}
   kput('hPaintBall',p,null,[.22,.26,.22],hC(HPAL.black));kput('vConeI',hAdd(p,N,.28),qFacing(N).multiply(qEuler(Math.PI/2,0,0)),[.07,.3,.07],hC(HPAL.red));}}}

// ---------------------------------------------------------------- windows, porches, balconies
// Nalichnik: a window in a wide painted surround — side boards, a pediment (keel or small gable), a lace
// valance under the sill and painted shutters. The Russian/Republican window; the Rustic uses it plainer.
function hnNal(x,y,z,ry,w,h,kind,trimC,o){o=o||{};trimC=trimC||hC(HPAL.white);vnWin(x,y,z,ry,w,h,kind||'glass','hPaint',trimC,o.shutters?true:false);
 const f=(u,oo)=>loc(x,z,u,oo,ry);
 for(const s of[-1,1]){const p=f(s*(w/2+.2),.12);vB('hPaint',p[0],y-.2,p[1],.22,h+.45,.06,ry,trimC);}
 const pe=f(0,.14);if(o.keel)kput('hKeelW',[pe[0],y+h+.1,pe[1]],qEuler(0,ry,0),[w+.7,.7,.12],trimC);
 else{for(const s of[-1,1]){const a=hnOn(x,y+h+.12,z,ry,s*(w/2+.35),.14),b=hnOn(x,y+h+.52,z,ry,0,.14);hnMember('hPaint',a,b,.16,.08,hRot(ry,[0,0,1]),trimC);}
  vB('hPaint',pe[0],y+h+.08,pe[1],w+.7,.1,.14,ry,trimC);}
 const v=f(0,.12);kput('hLaceV',[v[0],y-.42,v[1]],qEuler(0,ry,0),[w+.4,.4,1],trimC);
 if(o.accent){const a=f(0,.16);vB('hPaint',a[0],y+h+.2,a[1],.3,.18,.04,ry,o.accent);}}
// Russian porch (kryltso): a stair to a raised door under a bochka roof on bulbous posts.
function hnKryltso(x,y,z,ry,w,rise,roofItem,roofC,postC){const run=Math.max(1.6,rise*1.3);const steps=Math.max(3,Math.round(rise/.2));
 const s=loc(x,z,0,run/2,ry);vnStairs(s[0],y,s[1],ry,w,rise,steps,'vWood',postC);
 const pl=loc(x,z,0,.5,ry);vB('vWood',pl[0],y+rise-.18,pl[1],w+.6,.18,1.2,ry,postC);
 for(const sx of[-1,1])for(const sz of[0,1]){const p=loc(x,z,sx*(w/2+.15),.1+sz*(run+.6),ry);const base=sz?y:y+rise;const H=(y+rise+2.4)-base;
  vPst('vPostB',p[0],base,p[1],.1,H,postC);kput('hPaintBall',[p[0],base+H*.45,p[1]],null,[.2,.3,.2],postC);}
 const rc=loc(x,z,0,(run+.6)/2+.1,ry);hnBochka(rc[0],y+rise+2.4,rc[1],run+1.3,w+.9,1.7,ry+Math.PI/2,roofItem||'hKeelSc',roofC);   // ridge runs down the stair
 vB('vWood',rc[0],y+rise+2.3,rc[1],w+.9,.14,run+1.3,ry,postC);}
// Alpine balcony: deck on angled brackets, cut-out-board balustrade on three sides, top rail, flower boxes.
function hnBalcony(x,y,z,ry,w,d,c,railC,flowers){c=c||hC(vPick(HPAL.tar));railC=railC||c;const N=hRot(ry,[0,0,1]);
 const dc=loc(x,z,0,d/2,ry);vB('vWood',dc[0],y-.14,dc[1],w,.14,d,ry,c);
 const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const u=-w/2+w*i/n;hnMember('vWood',hnOn(x,y-1.1,z,ry,u,.05),hnOn(x,y-.16,z,ry,u,d*.9),.14,.12,hRot(ry,[1,0,0]),c);}
 const fr=loc(x,z,0,d-.03,ry);kput('hLaceB',[fr[0],y+.5,fr[1]],qEuler(0,ry,0),[w-.1,.95,1],railC);vB('vWood',fr[0],y+.98,fr[1],w+.06,.1,.14,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.03),d/2,ry);kput('hLaceB',[p[0],y+.5,p[1]],qEuler(0,ry+Math.PI/2,0),[d,.95,1],railC);vB('vWood',p[0],y+.98,p[1],.14,.1,d,ry,c);}
 if(flowers!==false){const fb=loc(x,z,0,d+.12,ry);vB('vWood',fb[0],y+.9,fb[1],w-.4,.22,.22,ry,c);
  for(let k=0;k<Math.round(w*2.2);k++){const p=loc(x,z,rr(-w/2+.3,w/2-.3),d+.14,ry);kput('vLeaf',[p[0],y+1.14,p[1]],null,[rr(.14,.22),.14,.16],hC(0x3f7a34));
   kput('hPaintBall',[p[0]+rr(-.08,.08),y+1.24,p[1]+rr(-.05,.05)],null,[.08,.07,.08],hC(vPick([0xd0302a,0xe04a3a,0xc02848,0xf0f0f0])));}}}
// A plain wooden gallery (external stair landing / walkway): plank deck with post-and-rail balustrade.
function hnDeckRail(a,b,y,c,railH){railH=railH||1;const L=Math.hypot(b[0]-a[0],b[2]-a[2]);const n=Math.max(1,Math.round(L/1.4));
 for(let i=0;i<=n;i++){const t=i/n;vPst('vPost',lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t),.05,railH,c);}
 beam('vWood',[a[0],a[1]+railH,a[2]],[b[0],b[1]+railH,b[2]],.07,.07,c);beam('vWood',[a[0],a[1]+railH*.5,a[2]],[b[0],b[1]+railH*.5,b[2]],.05,.05,c);}

// ---------------------------------------------------------------- towers (Peles, clocktowers, wall towers)
// o: {shaft:'stucco'|'rubble'|'logs'|'oct', roof:'spire'|'tent'|'onion'|'helm'|'pyr', loggia:true, clock:true,
//     c (shaft colour), roofC, trimC, beamC, lit}
// Returns the y of the roof tip. The loggia is the Peles signature: a timber belt of arched openings and
// balustrade under the roof, in red-brown timber, on a stone shaft.
function hnTower(x,y,z,w,h,ry,o){o=o||{};const trimC=o.trimC||hC(HPAL.white),beamC=o.beamC||hC(vPick(HPAL.redwood));let top=y+h;
 if(o.shaft==='oct'){kput('hOctP',[x,y,z],qEuler(0,ry,0),[w*.54,h,w*.54],o.c||hC(vPick(HPAL.stucco)));}
 else if(o.shaft==='rubble')vB('hRubB',x,y,z,w,h,w,ry,o.c||hC(vPick(HPAL.rubble)));
 else if(o.shaft==='logs')hnLogBox(x,y,z,w,h,w,ry,o.c||hC(vPick(HPAL.pine)));
 else hnStucco(x,y,z,w,h,w,ry,o.c,o.qC);
 // string courses and a window per face per ~4 m
 for(let yy=y+4;yy<y+h-1;yy+=4)vB('vStone',x,yy,z,w+.14,.16,w+.14,ry,hC(vPick(HPAL.ashlar)));
 for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;for(let yy=y+2;yy<y+h-2.5;yy+=4){const p=loc(x,z,0,w/2,a);vnWin(p[0],yy,p[1],a,.7,1.5,o.lit?'lit':'glass','vStone',hC(vPick(HPAL.ashlar)));}}
 if(o.clock){for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,w/2+.08,a);kput('hClock',[p[0],y+h-w*.42,p[1]],qEuler(0,a,0),[w*.62,w*.62,1],null);}}
 if(o.loggia){const LH=2.6;vB('vWood',x,top,z,w+.8,.25,w+.8,ry,beamC);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const f=loc(x,z,0,(w+.8)/2,a);kput('hLaceB',[f[0],top+.7,f[1]],qEuler(0,a,0),[w+.7,.9,1],beamC);
   const n=Math.max(2,Math.round(w/1.4));for(let i=0;i<=n;i++){const p=loc(x,z,-(w+.8)/2+(w+.8)*i/n,(w+.8)/2-.08,a);vPst('vPost',p[0],top+.25,p[1],.09,LH,beamC);}
   for(let i=0;i<n;i++){const p=loc(x,z,-(w+.8)/2+(w+.8)*(i+.5)/n,(w+.8)/2-.08,a);kput('hKeelW',[p[0],top+LH-.55,p[1]],qEuler(0,a,0),[(w+.8)/n-.18,.6,.1],beamC);}}
  vB('vDarkB',x,top+.25,z,w-.3,LH,w-.3,ry);top+=LH+.25;vB('vWood',x,top,z,w+1.1,.2,w+1.1,ry,beamC);top+=.2;}
 const roof=o.roof||'spire',rc=o.roofC||hC(vPick(HPAL.slate));
 if(roof==='spire'){kput('hPyrSc',[x,top-.2,z],qEuler(0,ry,0),[w+1.2,w*2.1,w+1.2],rc);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,w*.42,a);vB('vPlaster',p[0],top+w*.35,p[1],w*.28,w*.3,.5,a,trimC);vnGableRoof(p[0],top+w*.35+w*.3,p[1],w*.28,.5,w*.22,a+Math.PI/2,'hGableSc',rc,.08);}
  const t=top-.2+w*2.1;vPst('vIron',x,t-.4,z,.07,w*.9,hC(0x2e2a26));vBall('hGold',x,t+w*.3,z,.16,hC(HPAL.gold[0]));top=t+w*.9;}
 else if(roof==='tent'){top=hnTent(x,top,z,w*.78,w*1.9,'hTentSc',rc);vPst('vIron',x,top-.3,z,.05,1.2,hC(0x2e2a26));vBall('hGold',x,top+.3,z,.14,hC(HPAL.gold[0]));top+=1;}
 else if(roof==='onion'){top=hnOnion(x,top,z,w*.4,o.onion||'G',o.onionC,w*.5,'hOctP',hC(vPick(HPAL.stucco)));}
 else if(roof==='helm'){kput('hBulbSc',[x,top-.1,z],null,[w*.62,w*.9,w*.62],rc);top+=w*.9;vPst('vIron',x,top-.1,z,.05,1.4,hC(0x2e2a26));top+=1.3;}
 else{vnPyrRoof('hPyrSc',x,top,z,w,w,w*.8,ry,rc,.5);top+=w*.8;}
 return top;}

// ---------------------------------------------------------------- bamboo (tribal and the poorest Republican/Rustic)
// Bamboo-frame wall: woven mat panels between culm posts and rails.
function hnBambooBox(x,y,z,w,h,d,ry,c,matC){vB('hBMatB',x,y,z,w,h,d,ry,matC||hC(vPick(HPAL.bamboo)));c=c||hC(vPick(HPAL.bamboo));
 const nx=Math.max(1,Math.round(w/1.2)),nz=Math.max(1,Math.round(d/1.2));
 for(let i=0;i<=nx;i++)for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/nx,s*(d/2+.04),ry);vPst('hBamboo',p[0],y,p[1],.07,h+.25,c);}
 for(let j=1;j<nz;j++)for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.04),-d/2+d*j/nz,ry);vPst('hBamboo',p[0],y,p[1],.07,h+.25,c);}
 for(const yy of[y+.1,y+h*.55,y+h-.1])for(const s of[-1,1]){const a=loc(x,z,-w/2-.1,s*(d/2+.1),ry),b=loc(x,z,w/2+.1,s*(d/2+.1),ry);beam('hBambooC',[a[0],yy,a[1]],[b[0],yy,b[1]],.12,.12,c);
  const e=loc(x,z,s*(w/2+.1),-d/2-.1,ry),f=loc(x,z,s*(w/2+.1),d/2+.1,ry);beam('hBambooC',[e[0],yy,e[1]],[f[0],yy,f[1]],.12,.12,c);}}
// Bamboo lashed railing between two points.
function hnBambooRail(a,b,c,h){h=h||1;const L=Math.hypot(b[0]-a[0],b[2]-a[2]);const n=Math.max(1,Math.round(L/1.1));c=c||hC(vPick(HPAL.bamboo));
 for(let i=0;i<=n;i++){const t=i/n;vPst('hBamboo',lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t),.045,h,c);}
 for(const yy of[h,h*.55])beam('hBambooC',[a[0],a[1]+yy,a[2]],[b[0],b[1]+yy,b[2]],.1,.1,c);}

// ---------------------------------------------------------------- cliff walkways (tribal cliff settlements)
// A walkway along a polyline of local points [x,y,z] (deck level) with the cliff face toward `back` (a local unit
// vector, usually [0,0,-1]): plank deck, bamboo rail on the open side, and raking struts from under the deck
// back and down into the rock. Consecutive points at different heights become flights of steps.
function hnCliffWalk(pts,w,back,c,railC){c=c||hC(vPick(HPAL.aged));back=back||[0,0,-1];
 for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dz);const yaw=Math.atan2(dx,dz);
  const out=[-back[0],0,-back[2]];const side=(dx*out[2]-dz*out[0])>0?1:-1;
  if(Math.abs(dy)<.3){beam('vWood',[a[0],a[1]-.08,a[2]],[b[0],b[1]-.08,b[2]],w,.14,c);}
  else{const n=Math.max(2,Math.round(Math.abs(dy)/.22));for(let k=0;k<n;k++){const t=(k+.5)/n;kput('vWood',[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.05,lerp(a[2],b[2],t)],qEuler(0,yaw,0),[w,.08,L/n+.06],c);}
   for(const s of[-1,1]){const o=[Math.cos(yaw)*w/2*s,0,-Math.sin(yaw)*w/2*s];beam('vWood',hAdd([a[0],a[1]-.2,a[2]],o),hAdd([b[0],b[1]-.2,b[2]],o),.08,.2,c);}}
  // rail on the open side
  const o=[out[0]*w/2,0,out[2]*w/2];hnBambooRail(hAdd(a,o),hAdd(b,o),railC,1.05);
  // struts: every ~2.5 m, from the deck's outer edge back and down to the rock
  const ns=Math.max(1,Math.round(L/2.5));for(let k=0;k<=ns;k++){const t=k/ns;const p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.14,lerp(a[2],b[2],t)];
   const edge=hAdd(p,o,.9);const foot=hAdd(hAdd(p,back,1.6),[0,-2.4,0]);beam('vWood',edge,foot,.12,.12,c);
   const under=hAdd(p,back,.1);beam('vWood',edge,hAdd(under,back,.6),.1,.1,c);}}}
// A plain rock face for the showcase cliff (a real settlement uses the terrain): a gridSurface with fbm relief,
// standing along local x at z=zc, facing +z, from y0 up to y1.
function hnCliffFace(G,x0,x1,zc,y0,y1,seed){const W=x1-x0,H=y1-y0;const geo=gridSurface((u,v)=>{const X=x0+u*W,Y=y0+v*H;
  const bulge=(fbm(u*3+seed,v*2.2,seed*.3,4)-.5)*6+(fbm(u*12,v*9,seed,2)-.5)*2.2;
  const ledge=Math.pow(Math.abs(Math.sin((v*H/9.5+fbm(u*2,v,seed,2)*1.5)*Math.PI)),6)*2.2;   // strata: shelves every ~9 m
  return[X,Y,zc+bulge+ledge-(1-v)*2.5];},Math.round(W/1.2),Math.round(H/1.2),{uS:W/8,vS:H/8});
 const m=mesh(geo,MAT.rock,G);m.material=MAT.rock.clone();m.material.color=hC(0x8a8680);return m;}

// ---------------------------------------------------------------- yard furniture of the highlands
function hnWoodpile(x,y,z,ry,w,h){const n=Math.round(h/.2);for(let k=0;k<n;k++)for(let i=0;i<Math.round(w/.2);i++){const p=loc(x,z,-w/2+.1+i*.2,0,ry);kput('hLogEnd',[p[0],y+.1+k*.19,p[1]],qEuler(0,ry+Math.PI/2,0),[.9,.09,.09],hC(vPick(HPAL.pine)));}
 vnShedRoof(x,y+h+.1,z,w+.2,1.1,.25,ry,'vShingleB',hC(vPick(HPAL.shingle)),.2,.08);}
function hnStoneChimney(x,y,z,h,w){vB('hRubB',x,y,z,w,h,w,0,hC(vPick(HPAL.rubble)));vB('vStone',x,y+h,z,w+.16,.14,w+.16,0,hC(vPick(HPAL.ashlar)));vB('vDarkB',x,y+h+.12,z,w*.5,.04,w*.5,0);}
function hnFirepit(x,y,z,r){for(let k=0;k<9;k++){const a=k/9*TAU;kput('vRock',[x+Math.cos(a)*r,y+.1,z+Math.sin(a)*r],null,[.25,.18,.22],hC(vPick(HPAL.rubble)));}
 for(let k=0;k<4;k++)kput('hLogEnd',[x,y+.12,z],qEuler(0,k*.8,0),[r*1.4,.07,.07],hC(0x3a2a20));vBall('vEmber',x,y+.14,z,r*.3,null,.12);}
// A standing stone (circles, boundary marks, the tribal sacred sites); `carved` paints a face on it.
function hnMenhir(x,y,z,ry,h,c,carved){kput('vRock',[x,y+h*.45,z],qEuler(rr(-.06,.06),ry,rr(-.06,.06)),[h*.24,h*.55,h*.16],c||hC(vPick(HPAL.rubble)));
 if(carved){const p=loc(x,z,0,h*.15,ry);kput('hFormV',[p[0],y+h*.55,p[1]],qEuler(0,ry,0),[h*.26,h*.6,1],null);}}

// ---------------------------------------------------------------- round 4: fitting murals and bracket rows (hlFlush)
// Travis: murals over entrances cut into the architecture (jetties, consoles, lintels — the Saxon buildings worst)
// and dougong wall-plates ran across windows (the Hall of the Republic). Both are now placed AFTER the building is
// complete, against a record of every instance it placed:
//   * a bracket row keeps its sets only between windows, and its painted wall-plate breaks at each opening;
//   * a Rustic/Republican mural is fitted into the clear space in front of its wall: it is tested (oriented-box
//     SAT) against everything that pokes through a thin slab just in front of the wall, and shrinks / slides
//     within its original rectangle until it is clear — or is left out.
const _hlKputRec=kput;
kput=function(name,p,q,s,c){const C=VERN.cur;if(C&&!C.noRec)(C.inst||(C.inst=[])).push([name,[p[0],p[1],p[2]],q?q.clone():null,s]);return _hlKputRec(name,p,q,s,c);};
const _HLBB={};function hlItemBB(name){let b=_HLBB[name];if(!b){const g=KIT.defs[name].geo;if(!g.boundingBox)g.computeBoundingBox();b=_HLBB[name]={c:g.boundingBox.getCenter(new THREE.Vector3()),e:g.boundingBox.getSize(new THREE.Vector3()).multiplyScalar(.5)};}return b;}
function hlOBB(rec){const [name,p,q,s]=rec,b=hlItemBB(name),S=typeof s==='number'?[s,s,s]:s,Q=q||new THREE.Quaternion();
 const c=new THREE.Vector3(b.c.x*S[0],b.c.y*S[1],b.c.z*S[2]).applyQuaternion(Q).add(new THREE.Vector3(p[0],p[1],p[2]));
 return{c,a:[new THREE.Vector3(1,0,0).applyQuaternion(Q),new THREE.Vector3(0,1,0).applyQuaternion(Q),new THREE.Vector3(0,0,1).applyQuaternion(Q)],e:[Math.abs(b.e.x*S[0]),Math.abs(b.e.y*S[1]),Math.abs(b.e.z*S[2])]};}
function hlSAT(A,B){const T=B.c.clone().sub(A.c);const ax=[...A.a,...B.a];for(const u of A.a)for(const v of B.a){const w=u.clone().cross(v);if(w.lengthSq()>1e-8)ax.push(w.normalize());}
 for(const L of ax){const rA=A.e[0]*Math.abs(A.a[0].dot(L))+A.e[1]*Math.abs(A.a[1].dot(L))+A.e[2]*Math.abs(A.a[2].dot(L));
  const rB=B.e[0]*Math.abs(B.a[0].dot(L))+B.e[1]*Math.abs(B.a[1].dot(L))+B.e[2]*Math.abs(B.a[2].dot(L));if(Math.abs(T.dot(L))>rA+rB)return false;}return true;}
const HLWINS=new Set(['vWinGlass','vWinLit','vDarkB','winSmD','hRAVoid']);
function hlFlush(){const C=VERN.cur;if(!C)return;const inst=C.inst||[];C.flushing=true;
 const near=(x,y,z,R)=>inst.filter(r=>{const p=r[1];return Math.abs(p[0]-x)<R&&Math.abs(p[2]-z)<R&&Math.abs(p[1]-y)<R+6;});
 for(const [x,y,z,ry,w,n,s,armC,blockC] of C.brows||[]){const U=hRot(ry,[1,0,0]),N=hRot(ry,[0,0,1]),gaps=[];
  for(const r of near(x,y,z,w/2+2)){if(!HLWINS.has(r[0]))continue;const B=hlOBB(r);const d=[B.c.x-x,B.c.y-y,B.c.z-z];
   const nd=d[0]*N[0]+d[2]*N[2],vd=d[1];if(Math.abs(nd)>1.2)continue;let hu=0,hv=0;for(let k=0;k<3;k++){hu+=B.e[k]*Math.abs(B.a[k].x*U[0]+B.a[k].z*U[2]);hv+=B.e[k]*Math.abs(B.a[k].y);}
   if(vd+hv<-.4||vd-hv>(s||1)*1.0)continue;const ud=d[0]*U[0]+d[2]*U[2];gaps.push([ud-hu-.14,ud+hu+.14]);}
  hnBracketRowNow(x,y,z,ry,w,n,s,armC,blockC,gaps);}
 let owed=false;const wide=it=>/^hM_[wg]_|^hForm[AWBT]$/.test(it);
 for(const m of C.murals||[]){if(owed&&wide(m.item)){m.item=HMOTIF.emblemWide;}const U=new THREE.Vector3(...hRot(m.ry,[1,0,0])),N=new THREE.Vector3(...hRot(m.ry,[0,0,1])),V=new THREE.Vector3(0,1,0);
  const candR=near(m.x,m.y+m.h/2,m.z,Math.max(m.w,m.h)+3),cand=candR.map(hlOBB);let placed=false;
  // search (Travis: keep it symmetric): first the mural centred where the builder put it, shrinking and sliding only
  // vertically; failing that, a mirrored PAIR either side of the axis (flanking a door lintel), same motif;
  // never a lone off-centre board.
  const fits=(cu,cy,w,h)=>{const c=loc(m.x,m.z,cu,0,m.ry);const slab={c:new THREE.Vector3(c[0],cy,c[1]).addScaledVector(N,.18),a:[U,V,N],e:[w/2,h/2,.075]};   // n .105–.255: clears beams, quoins, friezes on the wall
   return !cand.some(B=>hlSAT(slab,B));};
  const put=(cu,cy,w,h)=>{const p=loc(m.x,m.z,cu,.095,m.ry);kput(m.item,[p[0],cy,p[1]],qEuler(0,m.ry,0),[w,h,1],null);};
  const centred=ks=>{for(const k of ks){for(const fy of[0,-.25,.25,-.5,-.75,-1]){const w=m.w*k,h=m.h*k,cy=m.y+m.h/2+fy*m.h*.8;if(fits(0,cy,w,h)){put(0,cy,w,h);return true;}}}return false;};
  placed=centred([1,.86,.74]);   // a big centred board, else a full-size PAIR flanking the axis, else a small centred one
  if(!placed)for(const k of[.86,.74,.62]){for(const fy of[0,-.25,.25,-.5]){for(const fx of[.45,.6,.75,.9,1.05,1.2]){const w=m.w*k,h=m.h*k,cy=m.y+m.h/2+fy*m.h*.8,cu=fx*m.w;
    if(fits(cu,cy,w,h)&&fits(-cu,cy,w,h)){put(cu,cy,w,h);put(-cu,cy,w,h);placed=true;break;}}if(placed)break;}if(placed)break;}
  if(!placed)placed=centred([.62,.52]);
  const st=window._muralStats||(window._muralStats={placed:0,dropped:[]});if(placed){st.placed++;if(m.item===HMOTIF.emblemWide)owed=false;}else{st.dropped.push(C.D.key);if(m.item===HMOTIF.emblemWide)owed=true;}}   // a crowded emblem moves to the next wide mural
 C.flushing=false;C.inst=null;C.murals=null;C.brows=null;}
// VERN.place with the flush before the group transform closes (the vendored body, plus hlFlush()).
VERN.place=function(scene,key,x,z,ry,o){const D=VERN.defs[key];if(!D){reportErr('VERN.place: no such key '+key);return null;}
 o=Object.assign({w:1,v:0,scale:1,y:0},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
 KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;VERN.cur={D,G,x,z,ry:ry||0,o,r0:REG.length};
 try{D.build(G,o);hlFlush();}catch(e){reportErr(key+' '+e.stack);}
 endGroupXF();VERN.cur=null;return G;};
// ================================================================= DALAB — the ranch
// A livestock ranch the area of the Halls of Reformation (~120 m square): a rail fence round the whole, a ranch house
// (a post house on a rammed-earth plinth), a great thatch barn, a granary, four paddocks with troughs and hay, a
// stone-walled pen with a shade roof, a well, a windbreak of skirt palms, and the stock: whatever the fauna registry
// (DFAUNA, 69e) holds — Dalab lizards today, the monsters when they exist (the monster pen is the stone one).
function dnRailFence(x,z,w,d,ry,c,gate){vnFence(x,0,z,w,d,ry,c,gate,1.3);}
function dnTrough(x,y,z,ry){vB('vWood',x,y,z,2.4,.6,.8,ry,dCol(DPAL.woodGrey));vB('vDarkB',x,y+.5,z,2.2,.1,.6,ry);}
function dnHaystack(x,y,z,r){kput('dConeT',[x,y-.2,z],null,[r,r*1.6,r],dCol(DPAL.thatch));vPst('vPost',x,y,z,.06,r*1.9,vC(0x5a4632));}
function dnHerd(kind,x,z,w,d,n,s,opt){for(let i=0;i<n;i++){const px=x+rr(-w/2+1.5,w/2-1.5),pz=z+rr(-d/2+1.5,d/2-1.5);dnAnimal(kind,px,0,pz,rng()*TAU,(s||1)*rr(.7,1.15),opt);}}
function buildDalabRanch(G,o){reseed(8701+(o.v|0));const S=120;const wood=dCol(DPAL.woodGrey),earth=dCol(DPAL.earth),th=dCol(DPAL.thatch),st=dCol(DPAL.stone);
 vnReg('Ranch',0,0,S*.72,10,{type:['farm']});vnReg('Ranch fence',0,0,S*.72,1.5,{part:'wall',type:['farm']});
 dnRailFence(0,0,S,S,0,wood,6);
 vnPaving(0,.02,S/2-8,10,14,0,dCol(DPAL.earthDark),10);
 // the ranch house on its plinth, front of the yard; the barn behind; the granary; the well
 {const hx=-30,hz=34;vB('dEarth',hx,-.05,hz,14,.7,11,0,earth);const W=9.5,D=7,H=2.8,FL=.7;vnFrame(hx,FL,hz,W,H,D,0,wood,.15);vB('vWood',hx,FL,hz,W-.1,H,D-.1,0,wood.clone().multiplyScalar(.92));
  vnHipRoof('vHipT',hx,FL+H,hz,W,D,2.6,0,th,1.2);vnVeranda(hx,0,hz+D/2+1.0,W-1.2,2.0,0,FL,2.4,wood);vnShedRoof(hx,FL+2.4,hz+D/2+1.0,W-1.2,2.0,.5,0,'vThatchB',th,.4,.26);
  vnDoor(hx-1,FL,hz+D/2-.05,0,.95,1.9,'vWood',wood,vC(0x6a5a48),false);vnWin(hx+2.4,FL+1.2,hz+D/2-.05,0,.9,.7,'open','vWood',wood,true);dnHearth(hx+2.4,FL+1.2,hz+D/2-.05,0,.9,.7);
  dnMuralBand(hx,FL+H-.5,hz-D/2+.05,Math.PI,W-2,.45,3);dnJar(hx+6.2,0,hz+2,.3);dnWoodpile(hx-6.4,0,hz-1,Math.PI/2,1.4);vnDryingRack(hx+1,0,hz+6.5,0,3);}
 {const bx=-30,bz=8;const W=22,D=12,H=4.2;vB('vStone',bx,-.05,bz,W+.6,.35,D+.6,0,vC(0x9a8a78));for(let i=0;i<=5;i++)for(const sd of[-1,1])vPst('vPostB',bx-W/2+W*i/5,0,bz+sd*(D/2-.2),.2,H,wood);
  vB('dEarth',bx,.3,bz-D/2+.5,W,H-.6,1.0,0,earth);vnGableRoof(bx,H,bz,W,D,3.6,0,'vGableT',th,1.3,'vGableW',wood,.5);
  vB('vWood',bx,.3,bz,W-.4,H-.6,.14,0,wood);for(const sd of[-1,1])vB('vWood',bx+sd*(W/2-.1),.3,bz,.14,H-.6,D-.6,0,wood);   // board partitions
  vnSacks(bx-6,.3,bz+3,5);dnHaystack(bx+5,.3,bz+2,2.2);dnHaystack(bx+8.5,.3,bz-1,1.8);vnCrate(bx-8,.3,bz-2,.9,.2,wood);vnBarrel(bx+9,.3,bz+4,.42,1,wood);
  dnHerd('lizard',bx-2,bz-2,8,6,3,.9);}
 dnGranary(-12,0,44,1.5,2.0,{door:Math.PI});dnGranary(-8,0,40,1.3,1.8,{door:Math.PI*.8});
 dnDrum('dStoneDrum',-14,0,32,1.1,.9,st);dnDrum('vDarkB',-14,.9,32,.85,.1,null);vB('vWood',-14,0,32,.12,2.4,.12,0,wood);vB('vWood',-14,2.3,32,1.2,.1,.1,0,wood);
 // the paddocks: four rail-fenced fields on the east half and the south, each with a trough, a hay stack, a herd
 const PADS=[[30,30,50,44],[30,-12,50,36],[-25,-30,60,44],[30,-40,50,16]];
 PADS.forEach((P,i)=>{const[px,pz,pw,pd]=P;dnRailFence(px,pz,pw,pd,0,wood,3);dnTrough(px-pw/2+3,0,pz+pd/2-2.5,0);if(i<3)dnHaystack(px+pw/2-4,0,pz-pd/2+4,2.4);
  dnHerd('lizard',px,pz,pw-6,pd-6,i===3?4:7,1,{frill:i===1});});
 // the shade roof in the big paddock
 for(const p of[[-8,-18],[8,-18],[-8,-8],[8,-8]])vPst('vPostB',p[0],0,p[1],.16,2.8,wood);vnShedRoof(0,2.6,-13,18,12,.6,0,'vThatchB',th,.6,.3);
 // THE MONSTER PEN: a stone-walled ring pen with a heavy gate and a watch post — lizards for now
 {const mx=38,mz=-2,MR=13;dnRingWall(mx,0,mz,MR,3.2,-Math.PI/2,4,'vStone',st,1.0);for(const sd of[-1,1]){const p=dnOnRing(mx,mz,MR,-Math.PI/2+sd*.16);vB('vStone',p[0],0,p[1],1.2,4.2,1.2,-Math.PI/2,st);}
  const g=dnOnRing(mx,mz,MR,-Math.PI/2);vB('vWood',g[0],0,g[1],3.6,3.0,.2,-Math.PI/2,wood);for(let k=0;k<4;k++){const q=loc(g[0],g[1],-1.5+k,0,-Math.PI/2);vB('vIron',q[0],0,q[1],.08,3.0,.08,0,vC(0x2e2a26));}
  vPst('vPostB',mx,0,mz-MR-2.5,.2,5,wood);vB('vWood',mx,5,mz-MR-2.5,2,.15,2,0,wood);vnLadder(mx+1.2,0,mz-MR-2.5,Math.PI/2,5,wood);kput('figB',[mx,5.15,mz-MR-2.5],null,1,dCol(DPAL.robe));kput('figH',[mx,5.15,mz-MR-2.5],null,1,dCol(DPAL.skin));
  for(let i=0;i<5;i++){const a=rng()*TAU,r=rr(2,MR-3);dnAnimal('lizard',mx+Math.cos(a)*r,0,mz+Math.sin(a)*r,rng()*TAU,rr(1.2,1.7),{frill:true,c:dCol([0x8a4a2a,0x6a5a2a,0x4f4f36])});}
  dnFirePit(mx,0,mz+MR+4,.7);vnReg('Monster pen (lizards for now)',mx,mz,MR+1,5,{type:['farm'],part:'pen'});}
 // windbreak: skirt palms along the north fence; a few ranch hands and a rider's hitching rail
 BIO.cur='lowlands/ranch';for(let k=0;k<7;k++)dnTree('skirtpalm',-S/2+8+k*10,0,-S/2+6,{scale:rr(.8,1.1)});for(let k=0;k<4;k++)dnTree('manzanita',S/2-6,0,-S/2+12+k*16,{scale:.8});BIO.cur=null;
 dnFolk(-20,50,3,2);dnFolk(10,8,2,2);dnFolk(0,S/2+4,2,1.5);
 vB('vWood',8,0,S/2-6,.12,1.1,.12,0,wood);vB('vWood',12,0,S/2-6,.12,1.1,.12,0,wood);vB('vWood',10,1.0,S/2-6,4.2,.1,.1,0,wood);}

dDef({key:'dalab_ranch',name:'Ranch',family:'farm',tags:{type:['farm'],wealth:'middle',lit:false},w:126,d:126,h:12,build:buildDalabRanch});
// ================================================================= HIGHLANDS / REPUBLICAN — dwellings
// The Iron Republic's houses, three wealth tiers. Poor: the log izba of the hill towns — round logs, a steep
// shingle gable to the street, white-painted nalichniki, salvage sheet where the shingle has failed (the Iziz
// note). Middle: the Transylvanian-Saxon townhouse — fieldstone socle, rendered ground storey in a painted
// colour, a jettied half-timbered upper storey, steep scale roof gable-end to the street. Rich: the Peles villa —
// rubble socle, cream stucco with quoins, red-brown half-timber above, slate roofs and a loggia tower; electric.
// Seeds 20100–20399 (dwellings; 75-rep-trade.js uses 20400–20699).

// ---------------------------------------------------------------- R-A kit items and helpers (prefix hRA / hnRA)
// Round-arched frame (arcade bay, carriage gate): a U-shaped slab, width 1 x height 1, opening 70% of the width,
// its semicircular head drawn for a bay 1.2x as tall as wide (scale [bayW, H, depth]; H ≈ 1.2·bayW keeps it round).
// Origin at the bottom centre, depth centred on z.
function hnRAArchGeo(asp,ow,spring){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-ow/2,0);s.lineTo(-ow/2,spring);s.absarc(0,spring,ow/2,Math.PI,0,true);
 s.lineTo(ow/2,0);s.lineTo(.5,0);s.lineTo(.5,asp);s.lineTo(-.5,asp);s.lineTo(-.5,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:8});g.translate(0,0,-.5);g.scale(1,1/asp,1);return g;}
// "Eyelid" dormer (the eyes of Sibiu): a bell-shaped hump, width 1 x height 1, extruded 1 along z (centred), its
// front face (+z) carries the slit. Placed by hnRAEyelid so its back runs into the roof.
function hnRAEyeGeo(){const s=new THREE.Shape();const N=14;s.moveTo(-.5,0);for(let i=1;i<=N;i++){const x=-.5+i/N;s.lineTo(x,Math.pow(.5*(1+Math.cos(2*Math.PI*x)),.8));}s.lineTo(-.5,0);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}).translate(0,0,-.5);}
const HRA_ARCH=hnRAArchGeo(1.2,.7,.66);
kdef('hRAArchS',HRA_ARCH,MAT.stone);kdef('hRAArchP',HRA_ARCH,MAT.plaster);kdef('hRAArchW',HRA_ARCH,MAT.wood);
kdef('hRAEye',hnRAEyeGeo(),MAT.scale);kdef('hRAVoid',VBALL,MAT.void);
kdef('hRAKeelL',HKEEL,MAT.logs);kdef('hRAKeelPt',HKEEL,MAT.paint);   // keel boards in log and in paint

// A gable roof laid by hnGable(x0,Y,z0,len,span,p,ry,…): a point on one slope. side ±1 (the +z / −z slope of the
// ry frame), u along the ridge, t the horizontal distance out from the ridge, off the distance out of the slab
// (0 = on the slab's upper face). Returns {p:[x,y,z], q (a box lying on the slope), n (outward normal)}.
function hnRASlope(x0,Y,z0,ry,span,p,side,u,t,off){const a=Math.atan(p),ry2=ry+(side<0?Math.PI:0);const n=hRot(ry2,[0,Math.cos(a),Math.sin(a)]);
 const P=loc(x0,z0,u,side*t,ry);const k=.25+(off||0);return{p:[P[0]+n[0]*k,Y+p*(span/2-t)+n[1]*k,P[1]+n[2]*k],q:vQ(ry2,a,0),n,ry2};}
// A salvage sheet or a board patch lying on a slope (item a box: vCorr / vRustB / vShingleB / vWood)
function hnRARoofPatch(item,x0,Y,z0,ry,span,p,side,u,t,w,L,c){const S=hnRASlope(x0,Y,z0,ry,span,p,side,u,t,.03);
 kput(item,S.p,S.q.clone().multiply(qEuler(0,rr(-.06,.06),0)),[w,.05,L],c||null);}
// Eyelid dormer on a slope: front face at t from the ridge, width w, height h.
function hnRAEyelid(x0,Y,z0,ry,span,p,side,u,t,w,h,c){const a=Math.atan(p),ry2=ry+(side<0?Math.PI:0),L=h/p+.6;
 const ys=Y+p*(span/2-t)+.24/Math.cos(a)-.06;const P=loc(x0,z0,u,side*(t-L/2),ry);kput('hRAEye',[P[0],ys,P[1]],qEuler(0,ry2,0),[w,h,L],c||null);
 const F=loc(x0,z0,u,side*(t+.005),ry);kput('hRAVoid',[F[0],ys+h*.34,F[1]],qEuler(0,ry2,0),[w*.2,h*.13,.02]);}
// Gabled dormer on a slope: a rendered box with a window, its own little gable (ridge running up the roof).
function hnRADormer(x0,Y,z0,ry,span,p,side,u,t,w,h,wallC,roofC,trimC,kind){const ry2=ry+(side<0?Math.PI:0);const ys=Y+p*(span/2-t);const L=(h+.3)/p+.5;
 const P=loc(x0,z0,u,side*(t-L/2),ry);vB('vPlaster',P[0],ys-.3,P[1],w,h+.3,L,ry2,wallC);
 const F=loc(x0,z0,u,side*t,ry);vnWin(F[0],ys+.15,F[1],ry2,w*.5,h*.62,kind||'glass','hPaint',trimC);
 const R=loc(x0,z0,u,side*(t-L/2+.15),ry);vnGableRoof(R[0],ys+h,R[1],L+.3,w,w*.6,ry2+Math.PI/2,'hGableSc',roofC,.18,'vGablePl',wallC);}
// Painted shutters folded back beside a window placed by vnWin at (x,y,z,ry,w,h): two leaves in colour c with a
// lighter fielded panel (vnWin's own shutters take the frame colour, grey on stone frames).
function hnRAShutters(x,y,z,ry,w,h,c){const pc=c.clone().lerp(hC(HPAL.white),.35);for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.2+w*.24),.2,ry);const qq=vQ(ry,0,0).multiply(qEuler(0,-s*.5,0));
 kput('hPaint',[q[0],y+h/2,q[1]],qq,[w*.48,h,.05],c);const n=hRot(ry-s*.5,[0,0,1]);kput('hPaint',[q[0]+n[0]*.035,y+h/2,q[1]+n[2]*.035],qq,[w*.3,h*.7,.03],pc);}}
// Grand kryltso: a straight stair climbing to a landing in front of the door at (x,z) on the face ry (the landing
// at y+rise), carved bulbous posts, lace side boards, a bochka roof over the landing with a keel board on its face.
function hnRAKryltso(x,y,z,ry,w,rise,c,roofItem,roofC,trimC,postH){postH=postH||2.6;const steps=Math.max(3,Math.round(rise/.19)),run=steps*.32,LD=1.9;trimC=trimC||hC(HPAL.white);
 const lc=loc(x,z,0,LD/2,ry);vB('vWood',lc[0],y+rise-.22,lc[1],w+.9,.22,LD,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.3),LD-.15,ry);vPst('vPostB',p[0],y,p[1],.14,rise-.2,c);}
 const sc=loc(x,z,0,LD+run/2,ry);vnStairs(sc[0],y,sc[1],ry,w,rise,steps,'vWood',c);
 const N=hRot(ry,[1,0,0]);
 for(const s of[-1,1]){const a=hnOn(x,y+rise,z,ry,s*(w/2+.06),LD),b=hnOn(x,y,z,ry,s*(w/2+.06),LD+run);const X=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...X);
  hnOri('hLaceB',[(a[0]+b[0])/2,(a[1]+b[1])/2+.5,(a[2]+b[2])/2],X,N,[L,.85,1],trimC);beam('vWood',[a[0],a[1]+.95,a[2]],[b[0],b[1]+.95,b[2]],.09,.09,c);
  const f=loc(x,z,s*(w/2+.06),LD+run-.1,ry);vPst('vPostB',f[0],y,f[1],.1,1.15,c);kput('hPaintBall',[f[0],y+1.2,f[1]],null,[.14,.18,.14],trimC);}
 for(const sx of[-1,1])for(const sz of[0,1]){const p=loc(x,z,sx*(w/2+.3),.15+sz*(LD-.3),ry);vPst('vPostB',p[0],y+rise,p[1],.12,postH,c);
  kput('hPaintBall',[p[0],y+rise+postH*.36,p[1]],null,[.22,.32,.22],c);kput('hPaintBall',[p[0],y+rise+postH*.62,p[1]],null,[.18,.22,.18],trimC);}
 const rc=loc(x,z,0,LD/2+.1,ry);vB('vWood',rc[0],y+rise+postH-.12,rc[1],w+1.1,.14,LD+.7,ry,c);
 hnBochka(rc[0],y+rise+postH,rc[1],LD+.9,w+1.4,w*.8+.9,ry+Math.PI/2,roofItem||'hKeelSc',roofC);
 const f=loc(x,z,0,LD+.6,ry),f2=loc(x,z,0,LD+.66,ry),yk=y+rise+postH-.14;kput('hKeelP',[f[0],yk,f[1]],qEuler(0,ry,0),[w+1.8,w*.8+1.3,.06],trimC);
 kput('hKeelW',[f2[0],yk,f2[1]],qEuler(0,ry,0),[w+1.25,w*.8+.8,.06],c);
 const g=loc(x,z,0,LD+.71,ry);kput('hKeelDark',[g[0],yk+.3,g[1]],qEuler(0,ry,0),[w*.55,w*.42,.04]);
 return LD+run;}

// ---------------------------------------------------------------- POOR
// A — log izba: gable to the street, two nalichnik windows on the gable wall, door and a small porch on the side
function buildHlRepPoorA(G,o){reseed(20101+(o.v|0));const W=6.4,D=6.8,H=2.7,F=.45;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.82,.95)),trim=hC(vPick([HPAL.white,HPAL.white,HPAL.blue,HPAL.teal])),sh=hC(vPick(HPAL.shingle));
 vnReg('Log izba (poor)',0,0,5.4,F+H+4.2);
 vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));
 hnLogBox(0,F,0,W,H,D,0,log);
 const top=hnGable(0,F+H,0,D,W,1.25,Math.PI/2,'vShingleB',sh,.7,'vGableW',log.clone().multiplyScalar(.9));
 hnBarge(0,F+H,0,D,W,1.25*W/2,Math.PI/2,.7,trim,'lace');
 for(const s of[-1,1])hnNal(s*1.45,F+.95,D/2,0,.8,1.05,'shut',trim,{shutters:false});
 vnWin(0,F+H+.9,D/2+.02,0,.55,.6,'open','hPaint',trim);                                      // attic window in the gable
 vnDoor(W/2,F,1.3,Math.PI/2,.95,1.9,'vWood',log,hC(0x6a5040),false);
 vB('vWood',W/2+.8,F-.2,1.3,1.6,.2,1.9,0,log);vnStairs(W/2+1.9,0,1.3,Math.PI/2,1.1,F,3,'vWood',log);   // porch deck + steps
 for(const s of[-1,1])vPst('vPost',W/2+1.45,F,1.3+s*.85,.08,2.2,log);vnShedRoof(W/2+.9,F+2.2,1.3,1.8,2,.35,-Math.PI/2,'vShingleB',sh,.2,.1);
 if(rng()<.6){kput('vSheet',[-1.2,F+H+1.3,-1.1],vQ(Math.PI,-Math.atan(1.25),0),[2.2,1.6,1],null);}   // a salvage sheet over a leak (the Iziz note)
 hnStoneChimney(-1.2,F+H+.6,-.9,2.1,.6);
 hnWoodpile(-W/2-.8,0,-.6,Math.PI/2,2.6,1.4);vnBarrel(W/2+.9,0,-1.9,.35,.9,log);
 vnFence(0,0,1.2,W+6,D+6.5,0,hC(vPick(HPAL.aged)),2.2,1.1);vnFolk(1.5,D/2+2.2,1,1);}
// B — two-room log house with a lean-to workshop and a plank roof held by poles: the poorest urban housing
function buildHlRepPoorB(G,o){reseed(20111+(o.v|0));const W=8.2,D=5.4,H=2.6,F=.35;
 const log=hC(vPick(HPAL.aged)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.red])),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.9);
 vnReg('Two-room log house (poor)',0,0,6,F+H+3.6);
 vB('hRubB',0,0,0,W+.3,F,D+.3,0,hC(vPick(HPAL.rubble)));hnLogBox(0,F,0,W,H,D,0,log);
 hnGable(0,F+H,0,W,D,1.1,0,'vShingleB',sh,.6,'vGableW',log);
 for(let k=0;k<4;k++)beam('vWood',[-W/2-.4+k*(W+.8)/3,F+H+.35,-D/2-.5],[-W/2-.4+k*(W+.8)/3,F+H+.35,D/2+.5],.08,.08,log);   // roof poles laid over the plank
 vnDoor(-1.2,F,D/2,0,.95,1.9,'vWood',log,hC(0x5a4a3a),false);hnNal(1.4,F+.95,D/2,0,.75,.95,'shut',trim);hnNal(-3.1,F+.95,D/2,0,.7,.9,'open',trim);
 // lean-to workshop: board walls, salvage roof
 vnFrame(W/2+1.4,0,0,2.6,2.3,D-.6,0,log,.1);vB('vWood',W/2+1.4,0,-D/2+.4,2.6,2.2,.1,0,log);vnShedRoof(W/2+1.4,2.3,0,2.8,D-.2,.6,Math.PI/2,'vCorr',null,.3,.1);
 vnPatch(W/2+2.7,0,0,Math.PI/2,D-.8,2.1,2);vnCrate(W/2+1.2,0,1,.8,.2);vnBarrel(W/2+2,0,-.8,.3,.8,log);
 hnStoneChimney(2.6,F+H+.3,-.6,2.2,.55);vnDryingRack(-W/2-1.3,0,1.2,Math.PI/2,2.6);vnFolk(0,D/2+2.4,2,1.5);}

// ---------------------------------------------------------------- MIDDLE
// A — Saxon townhouse: gable to the street, painted render below, jettied half-timber above, scale roof
function buildHlRepMidA(G,o){reseed(20201+(o.v|0));const W=8,D=11,S=.7,H1=3.3,H2=2.9;
 const wall=hC(vPick(HPAL.saxon)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.slate])),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.ochre]));
 vnReg('Saxon townhouse (middle)',0,0,7.5,S+H1+H2+6.5);
 hnSocle(0,0,0,W,S,D,0);
 hnStucco(0,S,0,W,H1,D,0,wall,hC(vPick(HPAL.ashlar)));
 // the carriage gate: a tall arched opening with a boarded leaf, stone surround
 kput('winSmD',[1.6,S+1.35,D/2+.02],null,[1.9/1.1,2.7/2,.25]);vB('vStone',1.6,S,D/2+.05,2.4,.2,.25,0,hC(vPick(HPAL.ashlar)));
 kput('vWood',[1.6,S+1.1,D/2+.06],null,[1.7,2.2,.06],hC(vPick(HPAL.tar)));
 for(const u of[-2.3,-.6]){vnWin(u,S+1.1,D/2,0,.8,1.3,'glass','vStone',hC(vPick(HPAL.ashlar)),true);}
 hnForm('hFormA',1.6,S+2.75,D/2+.02,0,1.8,.9);                                                   // the painted crest over the gate
 for(const z of[-3,0,3])vnWin(W/2,S+1.1,z,Math.PI/2,.8,1.3,'glass','vStone',hC(vPick(HPAL.ashlar)),false);
 // jettied upper storey
 const y2=S+H1+.12;hnJetty(0,y2,0,W,D,0,beamC,.35);hnFachBox(0,y2,0,W+.1,H2,D+.7,0,hC(vPick(HPAL.stucco)),beamC,'glass');
 const y3=y2+H2;const top=hnGable(0,y3,0,D+.7,W+.1,1.55,Math.PI/2,'hGableSc',roof,.55,'vGablePl',hC(vPick(HPAL.stucco)));
 hnBarge(0,y3,0,D+.7,W+.1,1.55*(W+.1)/2,Math.PI/2,.55,trim,'lace');
 // gable: a hoist beam and loft door (the Saxon storage attic), a small crest board
 vnWin(0,y3+.5,(D+.7)/2+.02,0,1,1.4,'shut','vWood',beamC);vB('vWood',0,y3+2.1,(D+.7)/2+.5,.2,.2,1.2,0,beamC);
 hnForm('hFormT',0,y3+2.5,(D+.7)/2+.02,0,1.6,.8);
 // a dormer on the long side, a stone chimney through the ridge
 vB('vPlaster',W/2-.9,y3+.6,-1.5,1.6,1.2,1.6,0,hC(vPick(HPAL.stucco)));vnWin(W/2-.1,y3+.8,-1.5,Math.PI/2,.6,.7,'glass','vWood',trim);vnGableRoof(W/2-.9,y3+1.8,-1.5,1.6,1.8,.8,Math.PI/2,'hGableSc',roof,.15);
 hnStoneChimney(-.8,top-1.2,-2.8,1.9,.7);
 vnBarrel(-W/2-.6,0,D/2-1,.35,.9);vnFolk(0,D/2+2.5,2,2);}
// B — merchant's log house: a two-storey log house on a stone ground floor, a carved gallery (gulbishche) along
// the front and a kryltso porch; the Russian side of the Republic's middle class
function buildHlRepMidB(G,o){reseed(20211+(o.v|0));const W=10,D=8,S=2.6,H=3;
 const log=hC(vPick(HPAL.pine)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.blue])),roof=hC(vPick(HPAL.roofGreen)),stone=hC(vPick(HPAL.stucco));
 vnReg("Merchant's log house (middle)",0,0,8,S+H+5.5);
 hnStucco(0,0,0,W,S,D,0,stone);for(const u of[-3,0,3])vnWin(u,.9,D/2,0,.8,1,'shut','vStone',hC(vPick(HPAL.ashlar)));   // storerooms below
 hnLogBox(0,S,0,W,H,D,0,log);
 for(const u of[-3.1,-1,1.1,3.2])hnNal(u,S+.95,D/2,0,.8,1.15,'glass',trim,{shutters:u<0,keel:true});
 for(const z of[-1.6,1.6])hnNal(W/2,S+.95,z,Math.PI/2,.8,1.15,'glass',trim);
 hnGable(0,S+H,0,W,D,1.0,0,'hGableSc',roof,.7,'hGableLog',log);
 // side gallery on posts with a keel-arch kryltso porch at the +x end
 hnKryltso(W/2+1.3,0,.4,Math.PI/2,1.3,S,'hKeelSc',roof,log);
 hnFrieze(0,S+H-.4,D/2+.02,0,W,.4);
 vnFence(0,0,.8,W+5,D+6,0,log,2.4,1.4);hnWoodpile(-W/2-1.2,0,-1,Math.PI/2,3,1.5);vnFolk(-1,D/2+2,2,2);}

// ---------------------------------------------------------------- RICH
// A — Peles villa: rubble socle, stucco ground storey with quoins, half-timber upper storey, an oriel bay under a
// cross gable, slate roofs, a loggia tower with a spire, a porch on carved posts with dougong. Electric.
function buildHlRepRichA(G,o){reseed(20301+(o.v|0));const W=16,D=11,S=1.2,H1=3.8,H2=3.2;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),ash=hC(vPick(HPAL.ashlar)),lit=vLit()?'lit':'glass';
 vnReg('Villa (rich)',0,0,11,S+H1+H2+14);
 hnSocle(0,0,0,W,S,D,0);hnStucco(0,S,0,W,H1,D,0,cream,ash);
 vB('vStone',0,S+H1-.25,0,W+.3,.3,D+.3,0,ash);                                                    // cornice band
 for(const u of[-6,-3.5,3.5,6])vnWin(u,S+1.1,D/2,0,1,1.9,lit,'vStone',ash,false);
 for(const z of[-3,0,3])for(const s of[-1,1])vnWin(s*W/2,S+1.1,z,s*Math.PI/2,1,1.9,lit,'vStone',ash,false);
 // upper storey: half-timber
 const y2=S+H1;hnFachBox(0,y2,0,W,H2,D,0,cream,beamC,lit);
 const y3=y2+H2;hnGable(0,y3,0,W,D,1.3,0,'hGableSc',slate,.7,'vGablePl',cream);
 // oriel bay + cross gable over the entrance
 const oz=D/2+.6;vB('vWood',0,y2-.4,oz,5,.4,1.3,0,beamC);for(const s of[-1,0,1])hnMember('vWood',[s*2,y2-1.6,D/2+.05],[s*2,y2-.4,oz+.4],.2,.2,[0,0,1],beamC);
 hnFachBox(0,y2,oz-.6,5,H2+.4,2.6,0,cream,beamC,lit);
 hnGable(0,y2+H2+.4,oz-.6,2.6,5,1.4,Math.PI/2,'hGableSc',slate,.4,'vGablePl',cream);hnBarge(0,y2+H2+.4,oz-.6,2.6,5,3.5,Math.PI/2,.4,beamC,'lace');
 hnForm('hFormT',0,y2+H2+1.1,oz+.72,0,2.2,1.1);
 // entrance porch: carved totem posts, dougong under a small hip, crest board over the door
 vnDoor(0,S,D/2,0,1.5,2.5,'vStone',ash,hC(vPick(HPAL.tar)),false);hnForm('hFormA',0,S+2.65,D/2+.02,0,2.2,1.1);
 vB('vStone',0,0,D/2+1.6,4.2,S,3.2,0,ash);vnStairs(0,0,D/2+3.8,0,2.6,S,5,'vStone',ash);
 for(const s of[-1,1])hnTotemPost(s*1.8,S,D/2+2.8,.2,2.7,0);
 hnBracketRow(0,S+2.72,D/2+2.8,0,4.2,2,.5);vnHipRoof('hHipSc',0,S+3.62,D/2+1.9,4.6,2.8,1.2,0,slate,.4);   // brackets tucked under the eave
 // the corner tower (Peles): loggia and spire
 hnTower(-W/2+.6,0,D/2-1.2,4.4,S+H1+H2+2.4,0,{loggia:true,roof:'spire',roofC:slate,beamC,c:cream,lit:vLit()});
 hnStoneChimney(4.5,y3+1.4,-1.8,2.8,.9);hnStoneChimney(-3,y3+1.4,-1.8,2.8,.9);
 // garden wall with gate piers, lamps
 for(const s of[-1,1]){vB('hRubB',s*(W/2+2.5),0,D/2+5.5,.6,1.3,.6,0);vB('hRubB',s*(W/2+2.5)/2+s*2.1,0,D/2+5.5,(W/2+2.5)-2.6,.9,.45,0);}
 if(vLit())for(const s of[-1,1])vnLampPost(s*2.4,0,D/2+5.2,3.2);
 vnFolk(1,D/2+7,2,2);}

// C — bamboo row: three one-room cottages under one roof on a log sill, the poorest urban housing of the hill
// towns. Woven bamboo-mat walls on a culm frame, one unit re-faced in salvaged boards, shingle roof mended with
// corrugated sheet, stovepipes, small door hoods; a drying line, a hand cart, water butt.
function buildHlRepPoorC(G,o){reseed(20121+(o.v|0));const N=3,U=3.8,W=U*N,D=5,F=.42,H=2.6,P=.95;
 const log=hC(vPick(HPAL.aged)),bam=hC(vPick(HPAL.bamboo)),mat=hC(vPick(HPAL.bamboo)).multiplyScalar(rr(.85,1)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.85);
 vnReg('Bamboo row cottages (poor)',0,0,7.6,F+H+P*D/2+1.2);
 // the log sill on stones
 for(const s of[-1,1]){kput('hLogX',[0,F-.2,s*(D/2-.12)],null,[W+.5,.2,.2],log);kput('hLogX',[s*(W/2-.12),F-.2,0],qEuler(0,Math.PI/2,0),[D+.4,.19,.19],log);}
 for(let i=0;i<=6;i++)for(const s of[-1,1])kput('vRock',[-W/2+W*i/6,.08,s*(D/2-.12)],null,[.28,.16,.26],hC(vPick(HPAL.rubble)));
 hnBambooBox(0,F,0,W,H,D,0,bam,mat);
 // party walls read on the front as doubled posts; roof over all three
 for(const u of[-U/2,U/2])for(const s of[-1,1])vPst('vPost',u,F-.05,s*(D/2+.1),.1,H+.1,log);
 const Y=F+H,sp=D;hnGable(0,Y,0,W,sp,P,0,'vShingleB',sh,.5,'hGableBM',mat);
 for(let k=0;k<4;k++){const x=-W/2+.4+k*(W-.8)/3;for(const s of[-1,1]){const a=hnRASlope(0,Y,0,0,sp,P,s,x,.1,.05),b=hnRASlope(0,Y,0,0,sp,P,s,x,sp/2+.4,.05);beam('vWood',a.p,b.p,.08,.08,log);}}   // weight poles
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5),kind=(i+(o.v|0))%3;
  // unit fronts: 0 bare mat, 1 salvaged boards, 2 mat with sheet patches
  if(kind===1){for(let k=0;k<7;k++)vB('vWood',x-U/2+.3+k*(U-.6)/7+.25,F+.05,D/2+.06,(U-.6)/7-.03,H-.15,.05,0,log.clone().multiplyScalar(rr(.8,1.15)));}
  if(kind===2)vnPatch(x,F,D/2+.02,0,U,H,2);
  const dx=x-U*.22;vnDoor(dx,F,D/2+.08,0,.85,1.85,'vWood',bam,hC(vPick([0x6a5040,0x5a4a3a,HPAL.teal])),false);
  vB('vWood',dx,0,D/2+.45,1.1,F,.7,0,log);                                                        // plank step
  if(kind===0){vnShedRoof(x,F+1.82,D/2+.85,U-.4,1.7,.28,0,'vCorr',null,.08,.05);for(const s of[-1,1])vPst('hBamboo',x+s*(U/2-.35),0,D/2+1.6,.06,F+1.84,bam);   // a salvaged-sheet awning on culms
   vB('vWood',x+.5,0,D/2+1.1,1.4,.42,.36,0,log);}
  else{vnShedRoof(dx,F+2.02,D/2+.3,1.3,.42,.12,0,'hBMatB',mat,.08,.05);for(const s of[-1,1])beam('hBambooC',[dx+s*.55,F+1.45,D/2+.08],[dx+s*.55,F+2.02,D/2+.48],.06,.06,bam);}
  vnWin(x+U*.24,F+.9,D/2+.08,0,.75,.75,rng()<.5?'shut':'open','vWood',bam,rng()<.6);
  vnWin(x,F+.9,-D/2-.08,Math.PI,.6,.6,'shut','vWood',bam);
  if(i!==1){const c=hnRASlope(0,Y,0,0,sp,P,-1,x+.6,1.3,0);vnChimney(c.p[0],c.p[1]-.8,c.p[2],1.9,.1,true);}
  if(kind===2||(i===0&&rng()<.7))hnRARoofPatch('vCorr',0,Y,0,0,sp,P,1,x+rr(-.4,.4),rr(1.2,1.6),rr(1.8,2.6),rr(1.4,1.9));}
 hnRARoofPatch('vRustB',0,Y,0,0,sp,P,-1,rr(-2,2),1.5,2.2,1.6);
 // yard life: a drying line, hand cart, water butt, a bamboo lean-to store at the end
 vnDryingRack(1,0,-D/2-1.6,0,4);vnWaterButt(W/2+.6,0,D/2-.8,.38,.95);
 {const lx=-W/2-1.1;hnBambooBox(lx,0,0,1.9,2.1,D-1,0,bam,mat);vnShedRoof(lx,2.1,0,2.1,D-.6,.35,-Math.PI/2,'vCorr',null,.25,.08);hnWoodpile(lx-1.3,0,0,Math.PI/2,2.6,1.2);}
 {const cx=W/2+1.4,cz=1.2;vB('vWood',cx,.55,cz,1,.08,1.6,.25,log);for(const s of[-1,1]){const p=loc(cx,cz,s*.58,.2,.25);kput('vHoop',[p[0],.42,p[1]],qEuler(0,.25+Math.PI/2,0),[.42,.42,1.4],hC(0x3a3028));}
  for(const s of[-1,1]){const a=loc(cx,cz,s*.3,-.8,.25),b=loc(cx,cz,s*.3,-1.9,.25);beam('vWood',[a[0],.6,a[1]],[b[0],.15,b[1]],.05,.05,log);}}
 vnFolk(0,D/2+3.4,3,2.5);}

// C — the Saxon corner tenement: an arcaded ground floor (the Laube) of stone round arches with shops behind, a
// rendered first floor, a jettied half-timber second floor, a steep scale roof with a row of gabled dormers and
// eyelids above, and a stair tower with a spire serving the flats.
function buildHlRepMidC(G,o){reseed(20221+(o.v|0));const W=14,D=10,H1=3.6,H2=3.2,H3=2.9,AD=2.7,bays=4;
 const wall=hC(vPick(HPAL.saxon)),wall2=hC(vPick(HPAL.stucco)),ash=hC(vPick(HPAL.ashlar)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.roofRed,...HPAL.slate])),trim=hC(vPick([HPAL.teal,HPAL.green,HPAL.red,HPAL.blue]));
 vnReg('Arcaded tenement (middle)',0,0,9.5,H1+H2+H3+8.6);
 // the Laube: stone arches along the front and on the two ends, shop fronts set back behind them
 const bw=W/bays;for(let i=0;i<bays;i++)kput('hRAArchS',[-W/2+bw*(i+.5),0,D/2-.3],null,[bw,H1,.6],ash);
 for(const s of[-1,1])kput('hRAArchS',[s*(W/2-.3),0,D/2-AD/2],qEuler(0,Math.PI/2,0),[AD,H1,.6],ash);
 vB('vPlaster',0,0,-AD/2,W,H1,D-AD,0,wall);vB('vWood',0,H1-.24,D/2-AD/2,W-.2,.24,AD-.1,0,beamC);
 for(let k=0;k<=bays*2;k++)vB('vWood',-W/2+.4+(W-.8)*k/(bays*2),H1-.42,D/2-AD/2,.16,.2,AD-.7,0,beamC);   // arcade ceiling joists
 vnPaving(0,.02,D/2-AD/2,W-.8,AD-.4,0,hC(vPick(HPAL.rubble)),14);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5),zf=D/2-AD;
  vnDoor(x-.8,0,zf,0,1.0,2.2,'hPaint',trim,hC(vPick(HPAL.tar)),false);vnWin(x+.7,.8,zf,0,1.2,1.4,'glass','hPaint',trim,false);
  const sb=loc(x,zf,0,.06,0);vB('hPaint',sb[0],2.62,sb[1],bw-.8,.5,.08,0,trim);kput('hFormA',[sb[0],2.87,sb[1]+.05],null,[1.1,.44,1]);}
 // first floor: painted render, paired windows with painted shutters, a string course
 hnStucco(0,H1,0,W,H2,D,0,wall,ash);vB('vStone',0,H1-.05,0,W+.2,.2,D+.2,0,ash);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5);for(const s of[-1,1])vnWin(x+s*.55,H1+1,D/2,0,.7,1.35,'glass','vStone',ash,false);hnRAShutters(x,H1+1,D/2,0,1.8,1.35,trim);}
 for(const z of[-2.5,0,2.5])vnWin(-W/2,H1+1,z,-Math.PI/2,.7,1.35,'glass','vStone',ash,false);
 for(let i=0;i<bays;i++){const x=-W/2+bw*(i+.5);vnWin(x,H1+1,-D/2,Math.PI,.8,1.35,'glass','vStone',ash);                   // the courtyard side
  if(i%2)vnDoor(x,0,-D/2,Math.PI,1,2.2,'vStone',ash,hC(vPick(HPAL.tar)),true);else vnWin(x,1,-D/2,Math.PI,.9,1.2,'shut','vStone',ash);}
 // second floor: jettied half-timber
 const y3=H1+H2+.12;hnJetty(0,y3,0,W,D,0,beamC,.35);hnFachBox(0,y3,0,W+.1,H3,D+.7,0,wall2,beamC,'glass');
 // the roof: eaves to the street, a row of gabled dormers, eyelids above them
 const y4=y3+H3,span=D+.7,P=1.45;const top=hnGable(0,y4,0,W+.1,span,P,0,'hGableSc',roof,.55,'vGablePl',wall2);
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.12),y4+1.1,0,s*Math.PI/2,2.2,1.1);
 for(const u of[-4.5,0,4.5])hnRADormer(0,y4,0,0,span,P,1,u,span/2-1.1,1.3,1.5,wall2,roof,trim,'glass');
 for(const u of[-2.3,2.3])hnRAEyelid(0,y4,0,0,span,P,1,u,span/2-3.3,1.1,.55,roof);
 for(const u of[-3,3])hnRADormer(0,y4,0,0,span,P,-1,u,span/2-1.1,1.3,1.5,wall2,roof,trim,'glass');
 hnStoneChimney(-3.2,top-2.6,-.9,3,.7);hnStoneChimney(3.6,top-2.6,-.9,3,.7);
 // stair tower serving the flats, with a spire, and its street door
 const tx=W/2+1.35,tz=-1.4;hnTower(tx,0,tz,2.8,H1+H2+H3+2.6,0,{shaft:'stucco',roof:'spire',roofC:roof,c:wall2,qC:ash,trimC:trim});
 vnDoor(tx,0,tz+1.4,0,1,2.1,'vStone',ash,hC(vPick(HPAL.tar)),true);
 vnBarrel(-W/2-.7,0,D/2-1.2,.35,.9);vnCrate(-2.1,0,D/2-1.3,.7,.3);vnSacks(3.4,0,D/2-1.4,3);
 vnFolk(0,D/2+2.2,4,3);vnFolk(0,D/2-AD/2,2,4);}

// ---------------------------------------------------------------- RICH (cont.)
// B — the terem: stacked log volumes of different heights on a white stone storey (podklet) — a hall under a keel
// (bochka) roof with a kokoshnik face, a taller two-storey chamber wing under a steep scale gable, and a
// tent-roofed tower on an octagonal lantern; a grand kryltso climbs to the hall. Carved and painted throughout,
// dougong under the hall's keel, gold spikes. Electric.
function buildHlRepRichB(G,o){reseed(20311+(o.v|0));const S=2.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.9,1.05)),dark=hC(vPick(HPAL.redwood)),stone=hC(vPick(HPAL.stucco)),green=hC(vPick(HPAL.roofGreen)),red=hC(vPick(HPAL.roofRed)),
  trim=hC(HPAL.white),acc=hC(vPick([HPAL.red,HPAL.teal,HPAL.blue])),gold=hC(vPick(HPAL.gold)),lit=vLit()?'lit':'glass';
 const r1=rng()<.5,roofA=r1?green:red,roofB=r1?red:green;
 vnReg('Terem mansion (rich)',0,-1,12.5,19);
 const A={x:0,z:-1,w:10,d:8,h:3.6},B={x:-7.6,z:-.6,w:5.8,d:7.2,h:6.4},C={x:7.1,z:1.6,w:4.2,h:6.6};
 // podklet under everything: rendered stone with small deep windows
 for(const V of[A,B])hnStucco(V.x,0,V.z,V.w,S,V.d,0,stone,false);hnStucco(C.x,0,C.z,C.w,S,C.w,0,stone,false);
 for(const u of[-3,3])vnWin(u,.7,A.z+A.d/2,0,.6,.7,'glass','vStone',stone);vnWin(B.x,.7,B.z+B.d/2,0,.6,.7,'glass','vStone',stone);
 // A — the hall: logs, keel-arch nalichniki, a bochka roof with a kokoshnik face carried on dougong
 hnLogBox(A.x,S,A.z,A.w,A.h,A.d,0,log);const ya=S+A.h;
 for(const u of[-3.4,-1.9,1.9,3.4])hnNal(u,S+1.05,A.z+A.d/2,0,.8,1.3,lit,trim,{keel:true,accent:acc});
 for(const z of[-3,1])hnNal(A.w/2,S+1.05,A.z+z+1,Math.PI/2,.8,1.3,lit,trim,{keel:true});
 hnFrieze(0,ya-.55,A.z+A.d/2+.02,0,A.w,.5);
 hnBracketRow(0,ya-.62,A.z+A.d/2+.1,0,A.w-1,4,.62,hC(HPAL.teal),hC(HPAL.red));
 hnBochka(A.x,ya,A.z,A.d+1.8,A.w+1,5.6,Math.PI/2,'hKeelSc',roofA);
 // the kokoshnik face: a painted keel rim, a log-boarded infill, a darker inner keel round the gable window
 kput('hRAKeelPt',[A.x,ya-.02,A.z+A.d/2+.95],null,[A.w-.4,5.2,.3],trim);kput('hRAKeelPt',[A.x,ya+.1,A.z+A.d/2+1.08],null,[A.w-.9,4.75,.1],acc);
 kput('hRAKeelL',[A.x,ya+.2,A.z+A.d/2+1.12],null,[A.w-1.4,4.4,.06],log);kput('hKeelW',[A.x,ya+.55,A.z+A.d/2+1.16],null,[3.4,3.1,.04],dark);
 vnWin(A.x,ya+1.2,A.z+A.d/2+1.12,0,1.2,1.5,lit,'hPaint',trim);hnForm('hFormT',A.x,ya+3,A.z+A.d/2+1.16,0,1.8,.9);
 hnOnion(A.x,ya+5.1,A.z-1,.62,'Sc',roofB,.9,'hOctL',log);
 // B — the chamber wing: two log storeys, a steep scale gable to the front with lace, a small balcony
 hnLogBox(B.x,S,B.z,B.w,B.h,B.d,0,log);const yb=S+B.h;
 for(const y of[S+1.05,S+4.1])for(const u of[-1.3,1.3])hnNal(B.x+u,y,B.z+B.d/2,0,.75,1.2,lit,trim,{keel:y>S+2,accent:acc});
 for(const z of[-2,1.5])hnNal(B.x-B.w/2,S+4.1,B.z+z,-Math.PI/2,.75,1.2,lit,trim,{});
 hnGable(B.x,yb,B.z,B.d,B.w,1.55,Math.PI/2,'hGableSc',roofB,.7,'hGableLog',log);
 hnBarge(B.x,yb,B.z,B.d,B.w,1.55*B.w/2,Math.PI/2,.7,trim,'lace');
 hnBalcony(B.x,yb+.35,B.z+B.d/2+.05,0,2.4,.9,dark,trim,false);vnDoor(B.x,yb+.35,B.z+B.d/2+.02,0,.8,1.8,'hPaint',trim,dark,false);
 hnForm('hFormT',B.x,yb+2.5,B.z+B.d/2+.06,0,1.4,.7);
 // C — the tower: log shaft, an octagonal lantern with a ring of small kokoshniki, a tent and a gold spike
 hnLogBox(C.x,S,C.z,C.w,C.h,C.w,0,log);const yc=S+C.h;
 for(const y of[S+1.05,S+4])hnNal(C.x,y,C.z+C.w/2,0,.7,1.15,lit,trim,{keel:true});hnNal(C.x+C.w/2,S+4,C.z,Math.PI/2,.7,1.15,lit,trim,{keel:true});
 vB('vWood',C.x,yc,C.z,C.w+.8,.22,C.w+.8,0,dark);hnBracketRow(C.x,yc-.5,C.z+C.w/2+.05,0,C.w,2,.5);
 kput('hOctL',[C.x,yc+.22,C.z],null,[1.9,2.4,1.9],log);
 for(let k=0;k<8;k++){const a=k/8*TAU;vnWin(C.x+Math.sin(a)*1.76,yc+.8,C.z+Math.cos(a)*1.76,a,.5,1.1,lit,'hPaint',trim);
  kput('hKeelSc',[C.x+Math.sin(a)*1.72,yc+2.55,C.z+Math.cos(a)*1.72],qEuler(0,a,0),[1.35,1.1,.3],roofA);}
 vB('vWood',C.x,yc+2.5,C.z,3.6,.16,3.6,Math.PI/8,dark);
 const tt=hnTent(C.x,yc+2.6,C.z,2.15,6.2,'hTentSc',roofA);vPst('vIron',C.x,tt-.3,C.z,.05,1.6,hC(0x2e2a26));vBall('hGold',C.x,tt+.4,C.z,.2,gold);kput('hConeG',[C.x,tt+.6,C.z],null,[.08,.9,.08],gold);
 // the grand kryltso up to the hall door, totem posts at its foot, lamps
 vnDoor(0,S,A.z+A.d/2,0,1.3,2.2,'hPaint',trim,dark,false);
 const run=hnRAKryltso(0,0,A.z+A.d/2,0,2.4,S,dark,'hKeelSc',roofB,trim,2.7);
 for(const s of[-1,1])hnTotemPost(s*2.1,0,A.z+A.d/2+run+.6,.22,2.8,0,true);
 if(vLit())for(const s of[-1,1])vnLampPost(s*3.6,0,A.z+A.d/2+run+.4,3.2);
 // chimneys, a carved fence with a gate, a tall totem at the corner
 hnStoneChimney(-2.6,ya+2.6,-3.5,3.4,.8);hnStoneChimney(B.x+1,yb+1.8,B.z-2,3,.7);
 vnFence(0,0,1.4,A.w+B.w+C.w+6,A.d+14,0,dark,4.5,1.3);hnTotem(B.x-1.4,0,B.z+B.d/2+3.4,.34,7.5,0,{wings:1.6,painted:true});
 vnFolk(1,A.z+A.d/2+run+2.6,3,2.5);}
// C — the Saxon patrician house: an ashlar ground storey with an arched carriage gate, two rendered storeys with a
// corner oriel, a huge steep roof with rows of eyelid dormers (the eyes of Sibiu), crest boards and a formline
// frieze, and a walled courtyard behind. Electric.
function buildHlRepRichC(G,o){reseed(20321+(o.v|0));const W=16,D=12,H1=3.9,H2=3.3,P=1.7;
 const ash=hC(vPick(HPAL.ashlar)),wall=hC(vPick(HPAL.saxon)),roof=hC(vPick(HPAL.roofRed)).multiplyScalar(rr(.9,1.05)),
  tar=hC(vPick(HPAL.tar)),trim=hC(vPick([HPAL.teal,HPAL.green,HPAL.red,HPAL.blue])),sh=hC(vPick(HPAL.shingle)),lit=vLit()?'lit':'glass';
 vnReg('Patrician house (rich)',0,0,11,H1+2*H2+P*D/2+2.5);vnReg('Patrician house courtyard',1.5,-D/2-5,8,3.2);
 // ground storey: dressed stone, a plinth, the carriage gate and barred windows
 vB('vStone',0,0,0,W,H1,D,0,ash);vB('hRubB',0,0,0,W+.24,.7,D+.24,0,hC(vPick(HPAL.rubble)));
 const gx=W/2-3.4;kput('hRAArchS',[gx,0,D/2+.15],null,[4.2,H1-.1,.34],ash.clone().multiplyScalar(.93));
 vB('vWood',gx,0,D/2+.07,2.9,3.35,.1,0,tar);vB('vDarkB',gx+.6,0,D/2+.12,.8,1.9,.04,0);
 for(let k=0;k<5;k++)vB('vIron',gx,.5+k*.65,D/2+.13,2.8,.06,.03,0,hC(0x2e2a26));
 hnForm('hFormA',gx,H1-.82,D/2+.3,0,1.5,.75);
 for(const u of[-6,-3.6,-1.2]){vnWin(u,1.3,D/2,0,.9,1.5,lit,'vStone',ash);for(let k=0;k<4;k++)vB('vIron',u-.33+k*.22,1.3,D/2+.12,.04,1.5,.04,0,hC(0x2e2a26));}
 vnDoor(1.2,.2,D/2,0,1.2,2.4,'vStone',ash,tar,true);
 // two rendered storeys, windows in stone frames with painted shutters, a formline frieze between them
 hnStucco(0,H1,0,W,2*H2,D,0,wall,ash);vB('vStone',0,H1-.05,0,W+.25,.24,D+.25,0,ash);vB('vStone',0,H1+H2-.05,0,W+.15,.14,D+.15,0,ash);
 hnFrieze(0,H1+H2+.12,D/2+.02,0,W-1.2,.42);
 for(let f=0;f<2;f++)for(const u of[-6.2,-3.7,-1.2,1.3,3.8]){const y=H1+f*H2+.75;vnWin(u,y,D/2,0,.9,1.5,lit,'vStone',ash);hnRAShutters(u,y,D/2,0,.9,1.5,trim);}
 for(let f=0;f<2;f++)for(const z of[-3.5,0,3.5])for(const s of[-1,1])vnWin(s*W/2,H1+f*H2+.75,z,s*Math.PI/2,.9,1.5,lit,'vStone',ash,false);
 const y4=H1+2*H2;vB('vStone',0,y4-.3,0,W+.4,.3,D+.4,0,ash);
 // corner oriel on corbels, with its own little spire
 {const ox=W/2-1.3,oz=D/2+.6;for(let k=0;k<3;k++)vB('vStone',ox,H1+H2-.75+k*.25,oz-.35+k*.06,2.2-.4*(2-k),.25,.7+k*.2,0,ash);
  vB('vPlaster',ox,H1+H2,oz,2.4,H2-.1,1.3,0,wall);for(const u of[-.6,.6])vnWin(ox+u,H1+H2+.8,oz+.65,0,.6,1.4,lit,'vStone',ash);vnWin(ox+1.2,H1+H2+.8,oz,Math.PI/2,.5,1.4,lit,'vStone',ash);
  vnPyrRoof('hPyrSc',ox,y4-.2,oz,2.4,1.3,2.4,0,roof,.15);}
 // the roof: eaves to the street, three rows of eyelids on the front slope, two on the back
 const span=D+.4,top=hnGable(0,y4,0,W+.4,span,P,0,'hGableSc',roof,.42,'vGablePl',wall);
 const rows=[[span/2-1.2,[-6,-3,0,3,6]],[span/2-2.9,[-4.5,-1.5,1.5,4.5]],[span/2-4.5,[-3,0,3]]];
 for(const [t,us] of rows)for(const u of us)hnRAEyelid(0,y4,0,0,span,P,1,u,t,1.9,.8,roof);
 for(const [t,us] of rows.slice(0,2))for(const u of us)hnRAEyelid(0,y4,0,0,span,P,-1,u,t,1.9,.8,roof);
 for(const s of[-1,1]){hnForm('hFormT',s*(W/2+.03),y4+1.6,0,s*Math.PI/2,3,1.5);vnWin(s*W/2,y4+3.8,0,s*Math.PI/2,.8,1.1,'shut','vWood',tar);}
 hnStoneChimney(-4.5,top-3.8,-1.6,4.4,.9);hnStoneChimney(4,top-3.8,-1.6,4.4,.9);
 // the walled courtyard behind: rendered walls with a shingle coping, a well, a linden, a coach shed
 {const cz=-D/2-5,cw=W+3,cd=10,wh=3,cx=1.5,wc=wall.clone().multiplyScalar(.96);
  const segs=[[cx-cw/2,cz-cd/2,cx+cw/2,cz-cd/2],[cx-cw/2,cz-cd/2,cx-cw/2,-D/2],[cx+cw/2,cz-cd/2,cx+cw/2,D/2-2]];
  for(const [x0,z0,x1,z1] of segs){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0)+Math.PI/2;const mx=(x0+x1)/2,mz=(z0+z1)/2;
   vB('vPlaster',mx,0,mz,L,wh,.5,ry,wc);vnGableRoof(mx,wh,mz,L+.3,.7,.3,ry,'vShingleB',sh,.12);}
  vB('hRubB',cx+cw/2,0,D/2-2,1.2,wh+.7,1.2,0);vB('vStone',cx+cw/2,wh+.7,D/2-2,1.4,.2,1.4,0,ash);            // gate pier at the street
  vB('vPlaster',(W/2+cx+cw/2)/2,0,D/2-2,cx+cw/2-W/2,wh,.5,0,wc);vnGableRoof((W/2+cx+cw/2)/2,wh,D/2-2,cx+cw/2-W/2,.7,.3,0,'vShingleB',sh,.12);
  const wx=cx+3,wz=cz;for(let k=0;k<10;k++){const a=k/10*TAU;kput('vStone',[wx+Math.cos(a)*.75,.4,wz+Math.sin(a)*.75],qEuler(0,-a,0),[.3,.8,.5],ash);}
  for(const s of[-1,1])vPst('vPost',wx+s*.8,0,wz,.07,2.2,tar);vnGableRoof(wx,2.2,wz,1.9,1.2,.5,0,'vShingleB',sh,.2);
  vPst('vPost',cx-5,0,cz,.22,3.2,hC(0x5a4632));for(let k=0;k<6;k++)kput('vLeaf',[cx-5+rr(-1.6,1.6),rr(3.6,5.6),cz+rr(-1.6,1.6)],null,[rr(1.2,1.9),rr(1,1.5),rr(1.2,1.9)],hC(vPick([0x3f7a34,0x4f8a3a,0x356a2a])));
  vB('vWood',cx,0,cz-cd/2+1.7,7,2.6,2.8,0,tar);vnShedRoof(cx,2.6,cz-cd/2+1.7,7,2.8,.7,0,'vShingleB',sh,.3);}
 if(vLit()){vnLampPost(gx-3,0,D/2+1.6,3.2);vnLampPost(gx+3.2,0,D/2+1.6,3.2);}
 vnFolk(-2,D/2+2.6,3,3);}

const HTAG_SF={type:['single-family dwelling']},HTAG_MF={type:['multi-family dwelling']};
HL.def({key:'hl_rep_house_poor_a',name:'Log izba',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_SF),w:13,d:14,h:8,build:buildHlRepPoorA});
HL.def({key:'hl_rep_house_poor_b',name:'Two-room log house',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_MF),w:14,d:9,h:7,build:buildHlRepPoorB});
HL.def({key:'hl_rep_house_poor_c',name:'Bamboo row cottages',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'poor',lit:false},HTAG_MF),w:18,d:12,h:7,build:buildHlRepPoorC});
HL.def({key:'hl_rep_house_mid_a',name:'Saxon townhouse',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:9,d:13,h:13,build:buildHlRepMidA});
HL.def({key:'hl_rep_house_mid_b',name:"Merchant's log house",branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_SF),w:15,d:14,h:10,build:buildHlRepMidB});
HL.def({key:'hl_rep_house_mid_c',name:'Arcaded tenement',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'middle',lit:false},HTAG_MF),w:19,d:13,h:22,build:buildHlRepMidC});
HL.def({key:'hl_rep_house_rich_a',name:'Peles villa',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:22,d:20,h:24,build:buildHlRepRichA});
HL.def({key:'hl_rep_house_rich_b',name:'Terem mansion',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:28,d:24,h:22,build:buildHlRepRichB});
HL.def({key:'hl_rep_house_rich_c',name:'Patrician house',branch:'republican',family:'Dwellings',tags:Object.assign({wealth:'rich',lit:true},HTAG_SF),w:22,d:30,h:25,build:buildHlRepRichC});
// ================================================================= PORTED — the Voth Embassy (a Voth clan compound in Iziz)
// Re-description of Voth's `voth_bldg_clan_compound` + the townhouse kinds (hlaalu / velothi / domed) against the
// Iziz kit. Voth is a Venice/Vivec-like Dunmer city: grey-brown ashlar (cooler than Iziz's orange sandstone), pale
// plaster upper walls, dark pantile roofs, gilded domes and finials, deep-red and dark-blue clan banners. The
// compound: a curtain wall with pilaster buttresses, four tapered corner bastions, a gatehouse; inside a Velothi
// tower (tapering octagonal drums, banded, domed), a hlaalu house (stacked, shrinking, corniced flat blocks), a
// domed hall, a paved court with a shrine obelisk, a well and an emperor-mushroom sapling in a stone planter.
// Shared `vp*` textures / materials / kit items for both ported buildings (75 + 76) live at the top of this file.

// ---------------------------------------------------------------- textures (near-grey, tinted per instance; 128 px = 2 m unless noted)
TEX.vpTile=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // pantile: courses 0.3 m, tiles 0.25 m, each tile rounded across
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/19),fy=y%19,off=(row%2)*8,fx=(x+off)%16,tx=Math.floor((x+off)/16);
  const curve=Math.sin(fx/16*Math.PI);let v=150+curve*46+(h3(tx*1.7,row*2.3,3.1)-.5)*30+(fbm(x/9,y/9,4.4,2)-.5)*14;
  if(fy>16)v-=55;else if(fy<1)v+=8;if(fx<1)v-=30;d[i]=v;d[i+1]=v*.92;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpBanco=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // hand-smoothed mud plaster: sweeping horizontal trowel strokes, fine grit
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let v=200+(fbm(x/40,y/9,5.1,3)-.5)*30+(fbm(x/6,y/6,2.7,2)-.5)*16+(fbm(x/2,y/2,8.8,1)-.5)*8;
  const band=Math.sin(y/128*Math.PI*7+fbm(x/30,0,1.3,2)*3);v+=band*5;const crack=fbm(x/14,y/14,6.2,2);if(Math.abs(crack-.5)<.005)v-=50;
  d[i]=v;d[i+1]=v*.95;d[i+2]=v*.88;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpMosaic=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // COLOUR texture: blue-and-white tesserae, 1 m per tile; a diamond lattice in the Order's blue
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const tx=Math.floor(x/8),ty=Math.floor(y/8),grout=(x%8<1)||(y%8<1);
  const u=(x/128)%.5,vv=(y/128);const diamond=Math.abs(u-.25)+Math.abs(vv-.5)<.24;const blue=diamond?(Math.abs(u-.25)+Math.abs(vv-.5)>.12):false;
  let r,gg,b;if(blue){r=42+h3(tx,ty,1)*30;gg=106+h3(tx,ty,2)*40;b=176+h3(tx,ty,3)*40;}else{r=236+h3(tx,ty,4)*14;gg=232+h3(tx,ty,5)*12;b=218+h3(tx,ty,6)*14;}
  if(diamond&&!blue){r=216;gg=150+h3(tx,ty,7)*30;b=48;}   // a warm gold heart in each diamond
  if(grout){r*=.55;gg*=.55;b*=.55;}d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.vpBanner=canvasTex(64,160,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // a hung banner: dark field (takes the tint), a pale device, a fringed foot
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/w-.5,v=y/h;let val=118+(fbm(x/6,y/6,2.2,2)-.5)*18+((x%3<1)?-6:0);
  const r=Math.hypot(u*1.9,(v-.42)*1.9);if(r<.36&&r>.28)val=240;if(Math.abs(u)<.03&&v>.2&&v<.64)val=240;if(Math.abs(v-.42)<.02&&Math.abs(u)<.22)val=240;   // ring + cross device
  if(v>.93&&((x%6)<3))val=0;if(v<.03)val=200;if(Math.abs(u)>.47)val*=.7;
  d[i]=val;d[i+1]=val;d[i+2]=val;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- materials
MAT.vpTile=new THREE.MeshStandardMaterial({map:TEX.vpTile,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.vpTile,.5);
MAT.vpBanco=new THREE.MeshStandardMaterial({map:TEX.vpBanco,color:0xffffff,roughness:.98,metalness:0,side:DS});vWorldUV(MAT.vpBanco,.5);
MAT.vpMosaic=new THREE.MeshStandardMaterial({map:TEX.vpMosaic,color:0xffffff,roughness:.45,metalness:.05,side:DS});vWorldUV(MAT.vpMosaic,1);
MAT.vpGilt=new THREE.MeshStandardMaterial({color:0xd0a53c,roughness:.32,metalness:.75});
MAT.vpBanner=new THREE.MeshStandardMaterial({map:TEX.vpBanner,color:0xffffff,roughness:.9,metalness:0,side:DS});   // plain 0..1 UVs: the device must not tile
MAT.vpBrass=new THREE.MeshStandardMaterial({color:0xb08a3a,roughness:.4,metalness:.7});

// ---------------------------------------------------------------- geometry
const VPOCT=new THREE.CylinderGeometry(.86,1,1,8).translate(0,.5,0).rotateY(Math.PI/8);      // tapering octagonal drum, a FACE to the front
const VPOCTS=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0).rotateY(Math.PI/8);       // straight octagonal band
const VPDRUM=new THREE.CylinderGeometry(1,1,1,28).translate(0,.5,0);
const VPDISC=new THREE.CylinderGeometry(1,1,1,24).rotateX(Math.PI/2);                        // a disc facing ±z, thickness = scale z
const VPBANCO7=vnWedgeGeo(.93,.93), VPBANCO5=vnWedgeGeo(.55,.55), VPOBELISK=vnWedgeGeo(.42,.42);
// a wall slab W x H x T with a PARABOLIC opening ow x oh (Yuni's arch), base at y=0, centred in x and z
function vpArchGeo(W,H,T,ow,oh){const s=new THREE.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(W/2,H);s.lineTo(-W/2,H);s.lineTo(-W/2,0);
 const p=new THREE.Path();const n=18;p.moveTo(-ow/2,0);for(let i=1;i<n;i++){const x=-ow/2+ow*i/n;p.lineTo(x,oh*(1-Math.pow(2*x/ow,2)));}p.lineTo(ow/2,0);p.lineTo(-ow/2,0);s.holes.push(p);
 const g=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:false,curveSegments:8});g.translate(0,0,-T/2);g.computeVertexNormals();return g;}
// an ARCHIVOLT: the parabolic ring `t` thick round an opening ow x oh (a horseshoe polygon, so no hole touches the outline), extruded T
function vpArchRingGeo(ow,oh,t,T){const s=new THREE.Shape();const n=22,OW=ow+2*t,OH=oh+t;s.moveTo(-OW/2,0);for(let i=1;i<n;i++){const x=-OW/2+OW*i/n;s.lineTo(x,OH*(1-Math.pow(2*x/OW,2)));}s.lineTo(OW/2,0);s.lineTo(ow/2,0);
 for(let i=n-1;i>0;i--){const x=-ow/2+ow*i/n;s.lineTo(x,oh*(1-Math.pow(2*x/ow,2)));}s.lineTo(-ow/2,0);s.lineTo(-OW/2,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:false,curveSegments:8});g.translate(0,0,-T/2);g.computeVertexNormals();return g;}

// ---------------------------------------------------------------- kit items
kdef('vpTileB',VBOX,MAT.vpTile);kdef('vpTilePyr',VPYR,MAT.vpTile);kdef('vpTileHip',VHIP,MAT.vpTile);kdef('vpTileCone',VCONE,MAT.vpTile);
kdef('vpBancoB',VBOX,MAT.vpBanco);kdef('vpBanco7',VPBANCO7,MAT.vpBanco);kdef('vpBanco5',VPBANCO5,MAT.vpBanco);kdef('vpBancoCone',VCONE,MAT.vpBanco);
kdef('vpBancoPost',VPOST,MAT.vpBanco);kdef('vpDrumB',VPDRUM,MAT.vpBanco);kdef('vpDrumS',VPDRUM,MAT.stone);kdef('vpRingB',new THREE.TorusGeometry(1,.13,7,26),MAT.vpBanco);
kdef('vpDiscDark',VPDISC,MAT.void);kdef('vpDiscP',VPDISC,MAT.plaster);kdef('vpArchRingM',vpArchRingGeo(3.4,5.0,.55,.36),MAT.vpMosaic);kdef('vpArchRingB',vpArchRingGeo(3.4,5.0,.5,.3),MAT.vpBanco);kdef('vpDiscLit',VPDISC,MAT.warmPane);kdef('vpMosaicB',VBOX,MAT.vpMosaic);
kdef('vpGateArchB',vpArchGeo(7,6.5,1.6,3.4,5.0),MAT.vpBanco);kdef('vpBayArchB',vpArchGeo(3.2,4.0,.7,2.3,3.4),MAT.vpBanco);kdef('vpBayArchM',vpArchGeo(3.2,4.0,.7,2.3,3.4),MAT.vpMosaic);
kdef('vpOctS',VPOCT,MAT.stone);kdef('vpOctBand',VPOCTS,MAT.stone);kdef('vpObelisk',VPOBELISK,MAT.stone);
kdef('vpGilt',VBALL,MAT.vpGilt);kdef('vpGiltCone',VCONE,MAT.vpGilt);kdef('vpGiltDome',VDOME,MAT.vpGilt);kdef('vpBrassBell',new THREE.SphereGeometry(1,10,7,0,TAU,0,Math.PI*.62),MAT.vpBrass);
kdef('vpBanner',VPLANE,MAT.vpBanner);

// ---------------------------------------------------------------- local helpers (vp prefix)
// a hung banner: pole-less cloth `w` x `h` whose top edge is at y, facing `ry`, tinted
function vpHang(x,y,z,ry,w,h,c){kput('vpBanner',[x,y-h/2,z],vQ(ry,0,0),[w,h,1],c||null);}
// a banner on a pole: post, cross-arm, hung cloth turned across the arm
function vpBannerPole(x,y,z,ry,h,c){vPst('vPipe',x,y,z,.07,h,vC(0x3a2f22));const p=loc(x,z,.5,0,ry);vB('vIron',p[0],y+h-.25,p[1],1.0,.07,.07,ry,vC(0x3a2f22));vpHang(p[0],y+h-.3,p[1],ry+Math.PI/2,.85,2.6,c);}
// Voth window: a dark recess with a stone sill and a lintel; `lit` swaps the recess for a warm pane (electric)
function vpVWin(x,y,z,ry,w,h,c,lit){const f=loc(x,z,0,.04,ry);vB(lit?'vWinLit':'vDarkB',f[0],y,f[1],w,h,.12,ry);
 const s=loc(x,z,0,.16,ry);vB('vStone',s[0],y-.24,s[1],w+.55,.24,.42,ry,c);vB('vStone',s[0],y+h,s[1],w+.4,.2,.3,ry,c);
 if(lit){vB('vStone',f[0],y,f[1],.07,h,.14,ry,c);}}
// Voth door: recessed dark surround, leaf, stone lintel, one or two threshold steps, lamp if lit
function vpVDoor(x,y,z,ry,w,h,c,steps){const a=loc(x,z,0,.22,ry);vB('vStone',a[0],y,a[1],w+1.1,h+.8,.5,ry,c.clone().multiplyScalar(.82));
 const f=loc(x,z,0,.4,ry);vB('vDarkB',f[0],y,f[1],w,h,.2,ry);const l=loc(x,z,-w*.06,.5,ry);kput('vWood',[l[0],y+h/2,l[1]],vQ(ry,0,0).multiply(qEuler(0,.2,0)),[w*.9,h-.05,.07],vC(0x1c1a16));
 const t=loc(x,z,0,.3,ry);vB('vStone',t[0],y+h+.8,t[1],w+1.5,.35,.7,ry,c.clone().multiplyScalar(.8));
 for(let k=0;k<(steps||2);k++){const s=loc(x,z,0,.7+k*.4,ry);vB('vStone',s[0],y-(k+1)*.2,s[1],w+1.0-k*.2,.2,.8,ry,c.clone().multiplyScalar(.75));}
 if(vLit()){const q=loc(x,z,-(w/2+.9),0,ry);vnLamp(q[0],y+h+.3,q[1],ry);}}

// ---------------------------------------------------------------- the embassy
function buildVpEmbassy(G,o){reseed(7801+(o.v|0));
 const st=vC(vPick([0x8c8579,0x958e80,0x8b8069])),stD=st.clone().multiplyScalar(.78),cop=st.clone().multiplyScalar(.86),pl=vC(0xb8b0a2),tile=vC(vPick([0x5a4a48,0x4e4a52,0x6b5a58])),dome=vC(0xb08d3c),red=vC(0xa8241c),blue=vC(0x2f5a86),timber=vC(0x4a3a28),iron=vC(0x3a2f22);
 const CW=34,CD=30,WT=1.0,WH=4.8,Y0=.35;
 vnReg('Voth Embassy',0,0,25.5,24,{role:'embassy'});
 // raised stone pad the whole compound stands on
 vB('vStone',0,0,0,CW+1.2,Y0,CD+1.2,0,stD);
 // ---- curtain wall: back, sides, front halves; coping; pilaster buttresses outside; a walkway ledge inside
 const hx=CW/2-WT/2,hz=CD/2-WT/2,GAP=5.2;
 vB('vStone',0,Y0,-hz,CW-2*WT,WH,WT,0,st);vB('vStone',0,Y0+WH-.1,-hz,CW-2*WT+.3,.3,WT+.3,0,cop);
 for(const s of[-1,1]){vB('vStone',s*hx,Y0,0,WT,WH,CD-2*WT,0,st);vB('vStone',s*hx,Y0+WH-.1,0,WT+.3,.3,CD-2*WT+.3,0,cop);
  const L=(CW-2*WT-GAP)/2,cx=s*(GAP/2+L/2);vB('vStone',cx,Y0,hz,L,WH,WT,0,st);vB('vStone',cx,Y0+WH-.1,hz,L+.3,.3,WT+.3,0,cop);}
 for(const s of[-1,1]){vB('vStone',0,Y0+2.5,s*(hz+.06),CW-2*WT,.22,WT+.12,0,cop);vB('vStone',s*(hx+.06),Y0+2.5,0,WT+.12,.22,CD-2*WT,0,cop);}   // string course
 for(const px of[-11,-5.5,0,5.5,11])for(const s of[-1,1]){if(s>0&&Math.abs(px)<8)continue;vB('vStone',px,Y0,s*(hz+.5),1.3,WH-.5,1.0,0,st.clone().multiplyScalar(.93));vB('vStone',px,Y0+WH-.5,s*(hz+.5),1.5,.25,1.2,0,cop);}
 for(const pz of[-9,-3,3,9])for(const s of[-1,1]){vB('vStone',s*(hx+.5),Y0,pz,1.0,WH-.5,1.3,0,st.clone().multiplyScalar(.93));vB('vStone',s*(hx+.5),Y0+WH-.5,pz,1.2,.25,1.5,0,cop);}
 // wall-walk inside: a corbelled ledge along the inner faces and a stone stair up to it beside the gate
 for(const s of[-1,1]){vB('vStone',s*(hx-WT/2-.45),Y0+3.5,0,.9,.3,CD-2*WT-1,0,cop);for(let k=0;k<5;k++)vB('vStone',s*(hx-WT/2-.45),Y0+3.1,-CD/2+4+k*5.5,.6,.4,.5,0,stD);}
 vB('vStone',0,Y0+3.5,-(hz-WT/2-.45),CW-2*WT-1,.3,.9,0,cop);for(let k=0;k<6;k++)vB('vStone',-CW/2+4+k*5.2,Y0+3.1,-(hz-WT/2-.45),.5,.4,.6,0,stD);
 for(let i=0;i<8;i++)vB('vStone',-(hx-WT/2-.7),Y0+i*.44,hz-WT/2-2.2-i*.75,1.4,.44,.8,0,st.clone().multiplyScalar(.9));
 // ---- corner bastions: tapered square towers oversailing the wall, cornice, cap, slits, a red clan banner on each
 for(const p of[[-1,-1],[1,-1],[-1,1],[1,1]]){const tx=p[0]*hx,tz=p[1]*hz,BH=9.4;kput('vBatterS',[tx,Y0,tz],null,[4.6,BH,4.6],st.clone().multiplyScalar(.96));
  vB('vStone',tx,Y0+BH-.05,tz,4.5,.4,4.5,0,cop);vB('vStone',tx,Y0+BH+.35,tz,3.9,.8,3.9,0,st);
  for(const s of[-1,1]){vB('vDarkB',tx+s*1.98,Y0+5.6,tz,.24,1.3,.5,0);vB('vDarkB',tx,Y0+5.6,tz+s*1.98,.5,1.3,.24,0);vB('vDarkB',tx+s*1.7,Y0+BH+.5,tz+p[1]*1.98,.5,.55,.2,0);}
  vpBannerPole(tx,Y0+BH+1.15,tz,p[0]>0?-Math.PI/2:Math.PI/2,3.6,red);}
 // ---- gatehouse: a block across the wall line, dark arched-lintel passage, iron-studded leaves half open, lamps, banners red + blue
 {const gz=hz,GW=9.2,GD=4.2,GH=8.2;for(const s of[-1,1])vB('vStone',s*(GW/4+.9),Y0,gz,GW/2-1.8,4.6,GD,0,st);vB('vStone',0,Y0+4.6,gz,GW,GH-4.6,GD,0,st);   // piers + the storey over the passage: a REAL opening
  vB('vFlag',0,Y0-.02,gz,3.6,.06,GD+.4,0,cop);vB('vStone',0,Y0+GH-.1,gz,GW+.4,.4,GD+.4,0,cop);vB('vStone',0,Y0+GH+.3,gz,GW-1.4,.9,GD-1.2,0,st.clone().multiplyScalar(.95));
  for(let k=-2;k<=2;k++)vB('vStone',k*2.0,Y0+GH+1.2,gz+GD/2-.4,1.0,.7,.6,0,st);   // merlons on the front parapet
  vB('vStone',0,Y0+4.6,gz+GD/2+.1,5.2,.55,.9,0,cop);vB('vStone',0,Y0+4.6,gz-GD/2-.1,5.2,.55,.9,0,cop);vB('vStone',0,Y0+5.15,gz+GD/2+.05,4.4,.25,.5,0,st);
  for(const s of[-1,1]){vB('vStone',s*2.25,Y0,gz+GD/2+.1,.9,4.8,.7,0,st.clone().multiplyScalar(.9));vB('vStone',s*2.25,Y0,gz-GD/2-.1,.9,4.8,.7,0,st.clone().multiplyScalar(.9));
   kput('vWood',[s*1.2,Y0+2.2,gz+GD/2-1.1],vQ(0,0,0).multiply(qEuler(0,s*.95,0)),[1.85,4.3,.12],vC(0x2a221a));   // gate leaves, swung inward, seen from the street
   for(const yy of[1.0,2.3,3.6])kput('vIron',[s*1.2,Y0+yy,gz+GD/2-1.1],vQ(0,0,0).multiply(qEuler(0,s*.95,0)),[1.7,.1,.16],iron);
   vpVWin(s*3.0,Y0+5.6,gz+GD/2,0,.8,1.4,st,false);vpVWin(s*3.0,Y0+5.6,gz-GD/2,Math.PI,.8,1.4,st,vLit());
   vpBannerPole(s*3.6,Y0+GH+1.2,gz-.6,0,4.2,s<0?red:blue);
   if(vLit()){vnLamp(s*2.9,Y0+4.3,gz+GD/2,0);vnLamp(s*2.9,Y0+4.3,gz-GD/2,Math.PI);}}
  vpHang(0,Y0+GH-.4,gz+GD/2+.12,0,2.2,3.0,blue);vpHang(0,Y0+GH-.4,gz-GD/2-.12,Math.PI,2.2,3.0,red);          // the embassy's colours on the gate itself
  vB('vStone',0,0,gz+GD/2+.5,4.6,.175,1.1,0,stD);                                                               // a step down to the street
  for(const s of[-1,1])vnLampPost(s*3.6,0,gz+GD/2+.8,3.6);}
 // ---- Velothi tower, back-left: base, three tapering octagonal drums with bands, a gilt dome; porch, slits, bracketed balcony
 {const tx=-10,tz=-8.5;let y=Y0;const apo=Math.cos(Math.PI/8);const drums=[[3.6,8.0],[3.0,6.4],[2.35,3.6]];
  kput('vpOctBand',[tx,y,tz],null,[3.9,1.0,3.9],stD);y+=1.0;
  const faceAt=(r,h,t)=>(r*(1-.14*t/h))*apo;const face0=[];
  drums.forEach((d,i)=>{kput('vpOctS',[tx,y,tz],null,[d[0],d[1],d[0]],st.clone().multiplyScalar(1+i*.03));face0.push(y);
   const rt=d[0]*.86;y+=d[1];kput('vpOctBand',[tx,y,tz],null,[rt+.12,.45,rt+.12],cop);y+=.45;});
  kput('vpOctBand',[tx,y,tz],null,[2.15,.5,2.15],st);y+=.5;kput('vDomeP',[tx,y,tz],null,[2.0,1.7,2.0],dome);vBall('vpGilt',tx,y+1.85,tz,.4);vPst('vPipe',tx,y+1.6,tz,.05,1.4,iron);vpHang(tx+.35,y+2.9,tz,Math.PI/2,.6,1.4,red);
  // slit windows round the drums on the flats (k*45°, face 0 = +z front)
  drums.forEach((d,i)=>{const yb=face0[i];const rows=i===0?[2.6,5.6]:[d[1]*.5];for(const yy of rows)for(let k=0;k<8;k++){if(i===0&&k===0)continue;if(i===2&&k%2===0)continue;const a=k*Math.PI/4;const r=faceAt(d[0],d[1],yy)+.02;
    const p=[tx+Math.sin(a)*r,tz+Math.cos(a)*r];vpVWin(p[0],yb+yy-.7,p[1],a,k%2?.6:.95,1.4,st,vLit()&&i<2&&k%2===0);}});
  // porch on the front flat of the first drum
  {const g0=faceAt(drums[0][0],drums[0][1],1.6);const pz=tz+g0;vpVDoor(tx,Y0+1.0,pz,0,1.7,2.7,st,2);
   for(const s of[-1,1]){vPst('vpDrumS',tx+s*1.75,Y0+1.0,pz+.9,.28,3.9,st.clone().multiplyScalar(.9));vB('vStone',tx+s*1.75,Y0+4.9,pz+.9,.8,.3,.8,0,cop);}
   vB('vStone',tx,Y0+5.2,pz+.45,4.4,.4,1.6,0,cop);}
  // bracketed balcony over the porch on the second drum's front flat
  {const yb=face0[1]+1.3;const b0=tz+faceAt(drums[1][0],drums[1][1],1.3);vB('vStone',tx,yb,b0+.8,4.6,.3,1.7,0,cop);
   for(const ox of[-1.7,1.7])vBeam([tx+ox,yb,b0],[tx+ox,yb-1.1,b0+1.4],.3,timber);
   vB('vWood',tx,yb+.3,b0+1.55,4.6,.8,.14,0,timber);for(const ox of[-2.25,2.25])vB('vWood',tx+ox,yb+.3,b0+.8,.14,.8,1.6,0,timber);}
  // external stair up the left flank to a first-floor door, and a stone buttress at the back
  {const sx=tx-faceAt(drums[0][0],drums[0][1],2)-.5;for(let i=0;i<7;i++)vB('vStone',sx+.08*i,Y0+i*.6,tz-3.2+i*.9,1.5,.6,1.0,0,st.clone().multiplyScalar(.9));
   const fx=tx-faceAt(drums[0][0],drums[0][1],4.5);vB('vStone',(sx+fx)/2,Y0+4.2,tz-5.3,fx-sx+.6,.3,2.0,0,cop);vB('vDarkB',fx-.1,Y0+4.5,tz-5.3,.3,2.2,1.3,0);vB('vStone',fx-.15,Y0+6.7,tz-5.3,.4,.3,1.9,0,cop);vBeam([sx-.2,Y0+.9,tz-3.2],[sx+.5,Y0+5.4,tz+3.8],.08,timber,'vIron');
   kput('vBatterS',[tx,Y0,tz-4.4],null,[1.5,6.4,1.5],st.clone().multiplyScalar(.95));vB('vStone',tx,Y0+6.4,tz-4.4,1.7,.4,1.7,0,cop);}}
 // ---- hlaalu house, back-right: stacked shrinking flat blocks (stone below, pale plaster above), cornices, balcony, chimney
 {const lev=[];let jx=7.2,jz=-8.6,y=Y0,fw=12.5,fd=9.2;const hs=[6.0,4.8,3.6];
  vB('vStone',jx,Y0,jz,fw+.8,.4,fd+.8,0,stD);y+=.4;
  hs.forEach((fh,i)=>{if(i>0){jx+=rr(-.5,.5);jz+=rr(-.4,.2);}const item=i===0?'vStone':'vPlaster',c=i===0?st:pl;vB(item,jx,y,jz,fw,fh,fd,0,c);
   if(i>0)for(const sx of[-1,1])for(const sz of[-1,1])vB('vStone',jx+sx*(fw/2-.35),y,jz+sz*(fd/2-.35),.7,fh,.7,0,st.clone().multiplyScalar(.9));   // stone quoins on the plaster storeys
   vB('vStone',jx,y+fh-.28,jz,fw+.4,.36,fd+.4,0,cop);lev.push({x:jx,z:jz,y,w:fw,d:fd,h:fh});y+=fh;fw*=.8;fd*=.8;});
  const L0=lev[0],L1=lev[1],L2=lev[2];vB('vStone',L2.x,y,L2.z,L2.w*.9,.7,L2.d*.9,0,cop);
  // openings on every elevation
  const row=(L,side,ys,n,spread,ww,wh,lit)=>{for(let i=0;i<n;i++){const u=n===1?0:-spread+2*spread*i/(n-1);
   if(side===0)vpVWin(L.x+u,L.y+ys,L.z+L.d/2,0,ww,wh,st,lit);else if(side===1)vpVWin(L.x+u,L.y+ys,L.z-L.d/2,Math.PI,ww,wh,st,lit);
   else if(side===2)vpVWin(L.x+L.w/2,L.y+ys,L.z+u,Math.PI/2,ww,wh,st,lit);else vpVWin(L.x-L.w/2,L.y+ys,L.z+u,-Math.PI/2,ww,wh,st,lit);}};
  const lit=vLit();row(L0,0,1.5,2,3.9,1.3,1.8,lit);row(L0,0,4.2,3,4.2,1.1,1.3,false);row(L0,2,1.6,2,2.6,1.2,1.7,lit);row(L0,3,1.6,2,2.6,1.2,1.7,lit);row(L0,1,1.6,3,3.6,1.1,1.6,false);
  row(L1,0,1.4,3,3.4,1.2,1.7,lit);row(L1,2,1.4,2,2.2,1.1,1.5,lit);row(L1,3,1.4,2,2.2,1.1,1.5,false);row(L1,1,1.4,2,2.6,1.0,1.4,false);
  row(L2,0,1.1,2,2.0,1.0,1.4,lit);row(L2,1,1.1,1,0,1.0,1.3,false);row(L2,2,1.1,1,0,.9,1.3,false);
  vpVDoor(L0.x-2.4,L0.y,L0.z+L0.d/2,0,1.7,2.8,st,2);
  // first-floor balcony on timber brackets across the front
  {const by=L0.y+L0.h-.1,bz=L0.z+L0.d/2;vB('vStone',L0.x,by,bz+.7,6.6,.3,1.5,0,cop);for(const ox of[-2.6,2.6])vBeam([L0.x+ox,by,bz],[L0.x+ox,by-1.2,bz+1.3],.32,timber);
   vB('vWood',L0.x,by+.3,bz+1.38,6.6,.8,.14,0,timber);for(const ox of[-3.25,3.25])vB('vWood',L0.x+ox,by+.3,bz+.7,.14,.8,1.5,0,timber);for(let k=-5;k<=5;k++)vB('vWood',L0.x+k*.6,by+.3,bz+1.38,.07,.8,.07,0,timber);}
  // roof furniture: chimney, a drain pipe, a small dome-capped stair turret on the top block
  {const cx=L1.x+L1.w/2-1.1,cz=L1.z-L1.d/2+1.1;vB('vStone',cx,L1.y+L1.h,cz,.85,2.8,.85,0,stD);vB('vStone',cx,L1.y+L1.h+2.8,cz,1.15,.5,1.15,0,cop);vPst('vPipe',cx,L1.y+L1.h+3.3,cz,.22,.5,iron);}
  vPst('vPipe',L0.x+L0.w/2+.2,Y0+.4,L0.z+L0.d/2-.6,.11,L0.h+L1.h-.3,st.clone().multiplyScalar(.7));
  vPst('vpDrumS',L2.x-L2.w/2+1.3,y+.7,L2.z,1.0,1.2,st);kput('vDomeP',[L2.x-L2.w/2+1.3,y+1.9,L2.z],null,[1.05,.8,1.05],dome);vBall('vpGilt',L2.x-L2.w/2+1.3,y+2.8,L2.z,.18);
  }
 // ---- service range (kitchen / stable) against the right wall: stone, dark pantile hip roof, chimney, stable door
 {const rx=13,rz=4,RW=5.6,RD=6.4,RH=3.4;vB('vStone',rx,Y0,rz,RW,RH,RD,0,st.clone().multiplyScalar(.95));vB('vStone',rx,Y0+RH-.1,rz,RW+.3,.28,RD+.3,0,cop);
  vnHipRoof('vpTileHip',rx,Y0+RH+.55,rz,RW,RD,2.0,0,tile,.8);vB('vStone',rx-1.8,Y0+RH,rz-2.2,.7,2.4,.7,0,stD);vB('vStone',rx-1.8,Y0+RH+2.4,rz-2.2,.95,.4,.95,0,cop);
  vB('vDarkB',rx-RW/2-.02,Y0,rz+1.2,.2,2.4,1.8,0);kput('vWood',[rx-RW/2-.1,Y0+1.2,rz+1.2],qEuler(0,Math.PI/2,0),[1.7,2.3,.08],vC(0x2a221a));vpVWin(rx-RW/2,Y0+1.6,rz-1.6,-Math.PI/2,.9,1.0,st,false);vpVWin(rx,Y0+1.6,rz+RD/2,0,.9,1.0,st,false);
  vnBarrel(rx-RW/2-1.0,Y0,rz-2.4,.38,.9,timber);vnCrate(rx-RW/2-1.2,Y0,rz+2.8,.8,.3,timber);} // ---- domed hall (the embassy's audience room), left of the court: corniced stone block, ribbed drum, gilt-ochre dome, lucarnes, corner urns
 {const hx2=-11,hz2=4.5,HW=8.4,HD=7.0,HH=5.6;vB('vStone',hx2,Y0,hz2,HW+.6,.4,HD+.6,0,stD);vB('vStone',hx2,Y0+.4,hz2,HW,HH,HD,0,st);
  vB('vStone',hx2,Y0+.4+HH*.5,hz2,HW+.3,.26,HD+.3,0,cop);vB('vStone',hx2,Y0+.4+HH-.2,hz2,HW+.4,.4,HD+.4,0,cop);vB('vStone',hx2,Y0+.4+HH+.2,hz2,HW-.8,.5,HD-.8,0,st.clone().multiplyScalar(.95));
  const dy=Y0+.4+HH+.7;vPst('vpDrumS',hx2,dy,hz2,2.7,2.4,st.clone().multiplyScalar(1.04));
  for(let i=0;i<8;i++){const a=i/8*TAU;vB('vStone',hx2+Math.sin(a)*2.7,dy,hz2+Math.cos(a)*2.7,.3,2.4,.3,-a,cop);if(i%2===0)vB(vLit()?'vWinLit':'vDarkB',hx2+Math.sin(a)*2.68,dy+.7,hz2+Math.cos(a)*2.68,.9,1.2,.3,-a);}
  vB('vStone',hx2,dy+2.4,hz2,5.9,.3,5.9,0,cop);kput('vDomeP',[hx2,dy+2.7,hz2],null,[2.85,2.5,2.85],dome);vBall('vpGilt',hx2,dy+5.3,hz2,.36);
  for(const p of[[-1,-1],[1,-1],[-1,1],[1,1]]){const ux=hx2+p[0]*(HW/2-.6),uz=hz2+p[1]*(HD/2-.6);vB('vStone',ux,Y0+.4+HH+.2,uz,.9,.9,.9,0,cop);vBall('vpGilt',ux,Y0+.4+HH+1.4,uz,.32);}
  vpVDoor(hx2+HW/2,Y0+.4,hz2,Math.PI/2,1.6,2.6,st,1);   // door faces the court
  vpVWin(hx2+HW/2,Y0+1.9,hz2-2.4,Math.PI/2,1.2,1.7,st,vLit());vpVWin(hx2+HW/2,Y0+1.9,hz2+2.4,Math.PI/2,1.2,1.7,st,vLit());
  for(const z of[-2.2,0,2.2])vpVWin(hx2-HW/2,Y0+1.9,hz2+z,-Math.PI/2,1.1,1.6,st,false);for(const x of[-2.4,0,2.4]){vpVWin(hx2+x,Y0+1.9,hz2+HD/2,0,1.1,1.6,st,vLit());vpVWin(hx2+x,Y0+1.9,hz2-HD/2,Math.PI,1.1,1.6,st,false);}
  // a corbelled projecting bay on the front, as the domed townhouse has
  vB('vStone',hx2+2.4,Y0+3.2,hz2+HD/2+.7,2.8,2.4,1.4,0,st.clone().multiplyScalar(1.03));vB('vStone',hx2+2.4,Y0+5.6,hz2+HD/2+.7,3.1,.3,1.7,0,cop);vBeam([hx2+2.4,Y0+3.2,hz2+HD/2],[hx2+2.4,Y0+2.0,hz2+HD/2+1.2],.45,timber);
  vB('vDarkB',hx2+2.4,Y0+3.8,hz2+HD/2+1.42,1.7,1.4,.1,0);}
 // ---- the court: paving, a paved way from the gate to the house, a shrine obelisk on a stepped base, a well, the emperor-mushroom sapling in a stone planter, lamps
 vnPaving(0,Y0+.02,2,26,22,0,st.clone().multiplyScalar(.9),40);
 vB('vFlag',0,Y0+.03,8.4,3.4,.1,9.6,0,cop);vB('vFlag',2.6,Y0+.03,-1.6,7.6,.1,2.6,0,cop);
 {const ox=0,oz=1.5;for(let k=0;k<3;k++)vB('vStone',ox,Y0+k*.3,oz,3.6-k*.8,.3,3.6-k*.8,0,k%2?st:stD);kput('vpObelisk',[ox,Y0+.9,oz],null,[1.15,6.2,1.15],st.clone().multiplyScalar(1.05));
  kput('vPyrS',[ox,Y0+7.1,oz],null,[.5,.5,.5],cop);vBall('vpGilt',ox,Y0+7.7,oz,.16);for(let k=0;k<4;k++){const a=k*Math.PI/2;vB('vDarkB',ox+Math.sin(a)*.55,Y0+2.2,oz+Math.cos(a)*.55,.3,1.4,.06,-a);}
  if(vLit())for(const s of[-1,1]){vPst('vPipe',ox+s*1.35,Y0+.6,oz,.04,.5,iron);vBall('vBulb',ox+s*1.35,Y0+1.2,oz,.1);}}
 {const wx=8.5,wz=6.5;vPst('vpDrumS',wx,Y0,wz,1.5,.9,stD);vPst('vpDrumS',wx,Y0+.9,wz,1.3,.2,cop);vB('vDarkB',wx,Y0+1.1,wz,1.8,.06,1.8,0);
  for(const s of[-1,1])vPst('vPipe',wx+s*1.35,Y0+.9,wz,.09,2.4,iron);vB('vIron',wx,Y0+3.2,wz,2.9,.1,.1,0,iron);vPst('vRope',wx,Y0+1.3,wz,.02,1.9,vC(0x8a7a5a));vnBarrel(wx+.5,Y0+1.1,wz+.4,.2,.32,timber);}
 {const px=-4,pz=8.5;vB('vStone',px,Y0,pz,3.2,.9,3.2,0,st);vB('vStone',px,Y0+.9,pz,3.5,.2,3.5,0,cop);vB('vClayB',px,Y0+1.0,pz,2.7,.12,2.7,0,vC(0x4a3a2c));
  const fungus=vC(0x9a8aa2),gill=vC(0xe8dce4,1.4);vPst('vPostB',px,Y0+1.0,pz,.42,4.6,vC(0xc8c0c8));kput('vDomeP',[px,Y0+5.4,pz],null,[3.4,1.5,3.4],fungus);kput('vpDiscP',[px,Y0+5.36,pz],qEuler(Math.PI/2,0,0),[3.25,3.25,.14],gill);
  kput('vDomeP',[px,Y0+6.9,pz],null,[1.3,.7,1.3],fungus.clone().multiplyScalar(1.1));vPst('vPostB',px+.9,Y0+1.0,pz-.6,.14,1.6,vC(0xc8c0c8));kput('vDomeP',[px+.9,Y0+2.55,pz-.6],null,[.9,.45,.9],fungus);
  vPst('vPostB',px-1.0,Y0+1.0,pz+.7,.1,1.1,vC(0xc8c0c8));kput('vDomeP',[px-1.0,Y0+2.05,pz+.7],null,[.6,.3,.6],fungus);}
 for(const s of[-1,1])vnLampPost(s*6,Y0,11.5,3.4);vnLampPost(-3,Y0,-2,3.4);
 for(const x of[-13,13])vB('vWood',x,Y0,11.5,.5,.45,3.0,0,timber);   // benches along the front wall
 vnFolk(1,6,4,3);vnFolk(0,CD/2+4,3,2);}

VERN.def({key:'port_voth_embassy',name:'Voth Embassy',family:'ported',tags:{culture:'voth',type:['civic'],wealth:'rich',lit:true,role:'embassy'},w:36,d:34,h:24,build:buildVpEmbassy});
// ================================================================= PORTED — the Order of Historians' chapterhouse (from the Yuni set)
// Re-description of Yuni's `civic_chapter_house` ("Chapter house of the Historians": laterite drum halls under tile
// cones with lanterns, round relief-ringed windows, curved arcaded gallery wings, a carved forecourt wall with a
// parabolic gate) crossed with the Order's Djenne-type civic vocabulary (`civic_hall_records`, `civic_sankore_spire`:
// battered banco walls, pilaster-buttresses with pinnacles, toron rows, blue-and-white mosaic string courses) and the
// Locus Geomancers' chapterhouse's nested-archivolt porch. Ochre / laterite / dark-umber earth palette; the only
// saturated colour is the Order's blue in the mosaic bands and the electric light. Uses the shared vp* kit from 75.
//
// Programme, local frame (+z front): a walled forecourt with a parabolic gate between two pylons; two arcaded
// wings (the archive stacks, the scriptorium) with a drum pavilion at each front corner; the READING HALL across
// the back — a battered block whose great drum carries a tile cone and a lantern; the Order's bell tower (a
// Sankore-style pyramid bristling with toron) at the back corner. Electric lamps: the Order runs the Vault's cable.

// battered face: half-depth of a `vpBanco7` block (7 % taper) at height y above its base
const vpBat7=(D,H,y)=>D/2*(1-.07*clamp(y/H,0,1));
// Yuni window on a battered banco face: dark reveal + pane (lit if electric), a small banco sill; (x,z) ON the face
function vpYWin(x,y,z,ry,w,h,c,lit){const f=loc(x,z,0,.03,ry);vB('vDarkB',f[0],y-.06,f[1],w+.24,h+.12,.14,ry);const p=loc(x,z,0,.06,ry);vB(lit?'vWinLit':'vDarkB',p[0],y,p[1],w,h,.12,ry);
 const s=loc(x,z,0,.16,ry);vB('vpBancoB',s[0],y-.2,s[1],w+.5,.2,.36,ry,c);}
// round Order window: banco relief ring, dark socket, a pane that glows if electric. r = pane radius. Faces `ry`.
function vpRoundWin(x,y,z,ry,r,c,lit){const q=vQ(ry,0,0);const a=loc(x,z,0,.14,ry),b=loc(x,z,0,.02,ry),d=loc(x,z,0,-.04,ry);
 kput('vpRingB',[a[0],y,a[1]],q,[r*1.25,r*1.25,r*1.25],c);kput('vpDiscDark',[b[0],y,b[1]],q,[r*1.15,r*1.15,.16],null);kput(lit?'vpDiscLit':'vpDiscDark',[d[0],y,d[1]],q,[r,r,.3],null);}
// a row of toron (projecting timber posts) along a face: from (x0,z0) to (x1,z1) at height y, n posts, outward (nx,nz)
function vpTorons(x0,z0,x1,z1,y,n,nx,nz,len){const c=vC(0x4a3624);for(let i=0;i<n;i++){const t=(i+.5)/n;const x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;vBeam([x-nx*.3,y,z-nz*.3],[x+nx*(len||.95),y-.06,z+nz*(len||.95)],.17,c);}}
// pilaster-buttress with a pinnacle cone and a gilt ball: a battered post proud of a wall, base at (x,z)
function vpPinnacle(x,y,z,w,h,c,ry){kput('vpBanco7',[x,y,z],ry?qEuler(0,ry,0):null,[w,h,w],c);kput('vpBancoCone',[x,y+h-.05,z],null,[w*.42,w*1.1,w*.42],c);vBall('vpGilt',x,y+h+w*1.1+.12,z,.17);}
// drum pavilion: laterite drum, dark relief band, tile cone, 8-post lantern with a dark core, small cone, gilt ball. Returns the top.
function vpDrumHall(x,y,z,R,H,lat,dk,tile){vPst('vpDrumB',x,y,z,R,H,lat);vPst('vpDrumB',x,y+H-1.3,z,R+.08,.7,dk);vPst('vpDrumB',x,y+H-.3,z,R*1.04,.3,lat);
 const rb=R+.85,rt=R*.42,rh=R*.36;kput('vpTileCone',[x,y+H,z],null,[rb,rh+rt*.0+R*.02,rb],tile);   // the cone is a frustum in the source; a cone whose tip is buried under the lantern floor reads the same
 vPst('vpDrumB',x,y+H+rh*.7,z,rt+.3,.35,dk);const lr=rt*.82,lh=R*.3+.9;for(let i=0;i<8;i++){const a=i/8*TAU;vPst('vpBancoPost',x+Math.cos(a)*lr,y+H+rh*.7+.35,z+Math.sin(a)*lr,.16,lh,lat);}
 kput('vpDiscDark',[x,y+H+rh*.7+.35+lh/2,z],qEuler(Math.PI/2,0,0),[lr*.5,lr*.5,lh],null);kput('vpTileCone',[x,y+H+rh*.7+.35+lh,z],null,[rt+.9,R*.28+.6,rt+.9],tile.clone().multiplyScalar(.9));
 const top=y+H+rh*.7+.35+lh+R*.28+.6;vBall('vpGilt',x,top+.2,z,.24);return top;}

function buildVpChapterhouse(G,o){reseed(7811+(o.v|0));
 const och=vC(vPick([0xc89a62,0xbc8e58,0xd4a66e])),och2=och.clone().multiplyScalar(.9),dk=vC(0x8a6a48),lat=vC(vPick([0xb4683e,0xa85c36,0xc07448])),lat2=lat.clone().multiplyScalar(.8),tile=vC(vPick([0xb8633a,0xa85832,0xc47044])),pave=vC(0xd8cdb4),plank=vC(0x8a6c48),white=vC(0xf2eee2);
 const lit=vLit();const Y0=.45;
 vnReg('Chapterhouse of the Order of Historians',0,0,24.5,21,{role:'chapterhouse'});
 // plinth: a low battered banco platform the whole compound stands on, with a mosaic dado along its front
 kput('vpBanco7',[0,0,0],null,[36,Y0,30],dk);
 for(let k=0;k<12;k++){const x=-13.2+k*2.4;if(Math.abs(x)<3.6)continue;vB('vpMosaicB',x,.06,14.85,2.3,.32,.16,0,null);}
 // ================================================================ the reading hall (back), battered block with parapet, pilasters, toron, mosaic string course
 const HW=22,HD=11,HH=8.6,hz=-8.5;
 kput('vpBanco7',[0,Y0,hz],null,[HW,HH,HD],och);
 {const tw=vpBat7(HW,HH,HH)*2,td=vpBat7(HD,HH,HH)*2;vB('vpBancoB',0,Y0+HH-.05,hz,tw+.3,.5,td+.3,0,dk);                     // dark eaves band
  vB('vpBancoB',0,Y0+HH+.45,hz,tw+.1,.9,.6,0,och);vB('vpBancoB',0,Y0+HH+.45,hz-td/2+.3,tw+.1,.9,.6,0,och);              // parapet: front + back
  for(const s of[-1,1])vB('vpBancoB',s*(tw/2-.25),Y0+HH+.45,hz,.6,.9,td-.4,0,och);vB('vpBancoB',0,Y0+HH+.45,hz+td/2-.3,tw+.1,.9,.6,0,och);
  vB('vpBancoB',0,Y0+HH+.45,hz,tw-1.4,.12,td-1.4,0,vC(0xb89a6e));                                                             // roof deck
  for(let vx=0;vx<5;vx++)for(let vz=0;vz<2;vz++)vBall('vLeaf',-8+vx*4,Y0+HH+.95,hz-3+vz*6,.42,vC((vx+vz)%2?0xb8633a:0x98764e),.5);   // pots along the roof terrace
  // mosaic string course below the eaves and a whitewash band at the floor line: the Order's blue-and-white
  const my=Y0+HH-1.6,mw=vpBat7(HW,HH,HH-1.6)*2,md=vpBat7(HD,HH,HH-1.6)*2;vB('vpMosaicB',0,my,hz+md/2-.1,mw+.2,.5,.3,0,null);vB('vpMosaicB',0,my,hz-md/2+.1,mw+.2,.5,.3,0,null);
  for(const s of[-1,1])vB('vpMosaicB',s*(mw/2-.1),my,hz,.3,.5,md+.2,0,null);
  vB('vpBancoB',0,Y0+.02,hz,HW+.3,.9,HD+.3,0,white);}
 // pilaster-buttresses with pinnacles: 7 across the front (the middle three frame the porch), 7 behind, 3 each side, corners heavier
 {const zf=hz+HD/2,zb=hz-HD/2;for(let i=0;i<=6;i++){const x=-HW/2+HW*i/6,k=(i===0||i===6)?1.5:1.15;if(Math.abs(x)<4)continue;vpPinnacle(x,Y0,zf+.35,k,HH+1.4,och2);vpPinnacle(x,Y0,zb-.35,k,HH+1.4,och2);}
  for(let j=1;j<3;j++){const z=zb+HD*j/3;vpPinnacle(-HW/2-.35,Y0,z,1.15,HH+1.4,och2);vpPinnacle(HW/2+.35,Y0,z,1.15,HH+1.4,och2);}
  // toron rows between the pilasters, two heights, all four faces (the face recedes with height)
  for(const yy of[4.9,7.9]){const zf2=hz+vpBat7(HD,HH,yy),zb2=hz-vpBat7(HD,HH,yy),xw=vpBat7(HW,HH,yy);
   for(let i=0;i<6;i++){const x0=-HW/2+HW*i/6+.9,x1=-HW/2+HW*(i+1)/6-.9;if(Math.abs((x0+x1)/2)<4&&yy<6)continue;vpTorons(x0,zf2,x1,zf2,Y0+yy,3,0,1);vpTorons(x0,zb2,x1,zb2,Y0+yy,3,0,-1);}
   for(let j=0;j<3;j++){const z0=zb2+HD*j/3+.7,z1=zb2+HD*(j+1)/3-.7;vpTorons(xw,z0,xw,z1,Y0+yy,3,1,0);vpTorons(-xw,z0,-xw,z1,Y0+yy,3,-1,0);}}
  // the porch: three nested parabolic archivolts (banco · mosaic · banco) stepping in to the doors, between the two middle pilasters
  const pz=zf+vpBat7(HD,HH,0)-HD/2;   // = face at the base
  kput('vpBayArchB',[0,Y0,pz+1.9],null,[1.7,1.6,2.0],och2);kput('vpBayArchM',[0,Y0,pz+1.15],null,[1.45,1.42,1.2],null);kput('vpBayArchB',[0,Y0,pz+.45],null,[1.25,1.27,.9],och);
  vB('vpBancoB',0,Y0+6.4,pz+1.1,6.0,.5,2.8,0,dk);vB('vpBancoB',0,Y0+6.9,pz+1.1,5.4,.6,2.2,0,och2);vpRoundWin(0,Y0+7.5,pz+2.52,0,.5,och2,lit);
  for(const s of[-1,1])vpPinnacle(s*3.1,Y0,pz+2.6,1.1,7.3,och2);
  vB('vDarkB',0,Y0,pz-.3,2.9,3.9,.8,0);for(const s of[-1,1])kput('vWood',[s*.72,Y0+1.95,pz-.1],vQ(0,0,0).multiply(qEuler(0,s*.25,0)),[1.4,3.8,.08],plank);
  for(let i=0;i<3;i++)for(let j=0;j<5;j++)for(const s of[-1,1])vB('vIron',s*(.3+i*.42),Y0+.5+j*.75,pz+.02,.09,.09,.08,0,vC(0xb08a3a));   // brass studs
  vB('vpBancoB',0,Y0,pz+2.9,5.6,.14,1.4,0,dk);   // threshold slab
  if(lit){vnLamp(-2.5,Y0+4.4,pz+2.9,0);vnLamp(2.5,Y0+4.4,pz+2.9,0);}
  // windows: tall paired reading-hall windows either side of the porch, round windows above; sides and back likewise
  for(const s of[-1,1])for(const x of[5.4,9.2]){vpYWin(s*x,Y0+1.6,hz+vpBat7(HD,HH,1.6),0,1.0,2.6,och2,lit);vpRoundWin(s*x,Y0+6.2,hz+vpBat7(HD,HH,6.2),0,.5,och2,lit);}
  for(const s of[-1,1])for(const z of[-2.6,0,2.6]){vpYWin(s*vpBat7(HW,HH,1.6),Y0+1.6,hz+z,s*Math.PI/2,1.0,2.4,och2,lit);vpRoundWin(s*vpBat7(HW,HH,5.6),Y0+5.6,hz+z,s*Math.PI/2,.45,och2,lit);}
  for(const x of[-8,-4,0,4,8])vpYWin(x,Y0+1.8,hz-vpBat7(HD,HH,1.8),Math.PI,1.0,2.2,och2,false);for(const x of[-6,0,6])vpRoundWin(x,Y0+5.8,hz-vpBat7(HD,HH,5.8),Math.PI,.5,och2,lit);}
 // the great drum over the hall: laterite, round windows, tile cone, lantern
 {const top=vpDrumHall(0,Y0+HH+.5,hz,4.8,3.6,lat,dk,tile);
  for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;vpRoundWin(Math.sin(a)*4.8,Y0+HH+2.3,hz+Math.cos(a)*4.8,a,.5,lat2,lit);}
  for(let k=0;k<12;k++){const a=k/12*TAU;vBeam([Math.sin(a)*4.6,Y0+HH+3.0,hz+Math.cos(a)*4.6],[Math.sin(a)*5.5,Y0+HH+2.95,hz+Math.cos(a)*5.5],.16,vC(0x4a3624));}   // toron ring under the eaves
  void top;}
 // stair up to the roof terrace on the right flank, as a Yuni roof is living space
 {const sx=HW/2+1.2;for(let i=0;i<12;i++)vB('vpBancoB',sx,Y0+i*.7,hz+4.2-i*.72,1.3,.7,.75,0,och2);vB('vpBancoB',sx+.75,Y0,hz+.2,.25,HH+.9,9.0,0,och2);}
 // ================================================================ the wings: archive stacks (left), scriptorium (right) — battered ranges with parabolic arcades to the court
 for(const s of[-1,1]){const wx=s*15.3,WW=5.2,WD=11,wz=1.5,WH=4.6;kput('vpBanco7',[wx,Y0,wz],null,[WW,WH,WD],och);
  const tw=vpBat7(WW,WH,WH)*2,td=vpBat7(WD,WH,WH)*2;vB('vpBancoB',wx,Y0+WH-.05,wz,tw+.25,.4,td+.25,0,dk);vB('vpBancoB',wx,Y0+WH+.35,wz,tw,.6,td,0,och);vB('vpBancoB',wx,Y0+WH+.35,wz,tw-1.0,.7,td-1.0,0,vC(0xb89a6e));
  for(let j=0;j<=3;j++)vpPinnacle(wx+s*(WW/2+.3),Y0,wz-WD/2+WD*j/3,.95,WH+1.1,och2);
  for(const yy of[3.5]){const xo=wx+s*vpBat7(WW,WH,yy);for(let j=0;j<3;j++)vpTorons(xo,wz-WD/2+WD*j/3+.6,xo,wz-WD/2+WD*(j+1)/3-.6,Y0+yy,3,s,0);}
  for(const z of[-3.5,0,3.5])vpYWin(wx+s*vpBat7(WW,WH,2.0),Y0+1.3,wz+z,s*Math.PI/2,.8,1.5,och2,lit);   // outer face: small windows
  vB('vpMosaicB',wx+s*(vpBat7(WW,WH,WH-.3)),Y0+WH-.5,wz,.26,.4,td-.6,0,null);
  // arcade: 3 parabolic bays on the court side carrying a flat roof back to the wing; lit doors behind
  const ax=wx-s*(WW/2+1.6);for(let j=0;j<3;j++){const z=wz-WD/2+WD*(j+.5)/3;kput('vpBayArchB',[ax,Y0,z],qEuler(0,s*Math.PI/2,0),[WD/3/3.2*1.02,1.0,1.0],och2);
   const bx=wx-s*vpBat7(WW,WH,1.2);if(j===1){vB('vDarkB',bx,Y0,z,.3,2.5,1.6,0);kput('vWood',[bx+s*.02,Y0+1.25,z],qEuler(0,Math.PI/2,0),[1.5,2.4,.08],plank);if(lit)vnLamp(bx,Y0+3.0,z,-s*Math.PI/2);}
   else vpYWin(bx,Y0+1.5,z,-s*Math.PI/2,1.0,1.6,och2,lit);}
  vB('vpBancoB',(ax+wx)/2,Y0+4.0,wz,Math.abs(wx-ax)+.6,.45,WD+.2,0,och2);vB('vpBancoB',(ax+wx)/2,Y0+4.45,wz,Math.abs(wx-ax)+.2,.35,WD-.2,0,dk);
  for(let j=0;j<=3;j++)vpTorons(ax-s*.2,wz-WD/2+WD*j/3,ax-s*.2,wz-WD/2+WD*j/3,Y0+3.5,1,-s,0,.7);
  // drum pavilion at the wing's front end (the chapter house's paired drums flank the gate)
  const dz=wz+WD/2+3.0,dx=s*14.6;vpDrumHall(dx,Y0,dz,3.1,6.4,lat,dk,tile);
  for(const a of[0.55,1.2].map(v=>s<0?Math.PI-v:v))vpRoundWin(dx+Math.cos(a)*3.1,Y0+4.4,dz+Math.sin(a)*3.1,Math.PI/2-a,.55,lat2,lit);
  {const a=s<0?-.4:Math.PI+.4;vB('vDarkB',dx+Math.cos(a)*3.05,Y0,dz+Math.sin(a)*3.05,1.3,2.3,.3,Math.PI/2-a);kput('vWood',[dx+Math.cos(a)*2.98,Y0+1.15,dz+Math.sin(a)*2.98],qEuler(0,Math.PI/2-a,0),[1.2,2.2,.08],plank);}
  for(let k=0;k<10;k++){const a=k/10*TAU+.15;vBeam([dx+Math.cos(a)*2.95,Y0+2.6,dz+Math.sin(a)*2.95],[dx+Math.cos(a)*3.85,Y0+2.55,dz+Math.sin(a)*3.85],.15,vC(0x4a3624));}}
 // ================================================================ the forecourt wall and the gate
 {const gz=13.4,GW=7.0;for(const s of[-1,1]){const x0=s*(GW/2+.2),x1=s*11.4,L=Math.abs(x1-x0),cx=(x0+x1)/2;vB('vpBancoB',cx,Y0,gz,L,3.4,.7,0,och);vB('vpBancoB',cx,Y0+3.3,gz,L+.2,.35,.95,0,dk);
   // carved glyph panels with mosaic diamonds along the wall, as the source's forecourt wall carries
   for(let g=0;g<3;g++){const x=x0+(x1-x0)*(g+.5)/3;vB('vpBancoB',x,Y0+.5,gz+.4,1.9,2.3,.16,0,och2);kput('vpMosaicB',[x,Y0+1.65,gz+.52],vQ(0,0,Math.PI/4),[.9,.9,.1],null);vB('vpBancoB',x,Y0+.5,gz-.4,1.9,2.3,.16,0,och2);}}
  // gate: a parabolic arch slab between two pylons with pinnacles, a relief band and a round window above the arch; lamps
  kput('vpGateArchB',[0,Y0,gz],null,[1,1,1],och2);vB('vpBancoB',0,Y0+6.5,gz,7.4,.4,2.0,0,dk);vB('vpBancoB',0,Y0+6.9,gz,6.6,.7,1.6,0,och);
  kput('vpArchRingM',[0,Y0,gz+.95],null,[1,1,1],null);kput('vpArchRingB',[0,Y0,gz-.9],null,[1,1,1],dk);   // archivolts: mosaic to the street, dark banco to the court
  for(const s of[-1,1]){vpPinnacle(s*4.1,Y0,gz,1.7,7.6,och2);if(lit){vnLamp(s*2.6,Y0+4.2,gz+.8,0);}}
  for(let k=0;k<3;k++)vB('vpBancoB',0,Y0-(k+1)*.15,gz+1.2+k*.5,6.4-k*.4,.15,.6,0,dk);   // steps down to the street
  for(const s of[-1,1])vnLampPost(s*5.6,0,gz+2.4,3.6);
  vpHang(-4.1,Y0+6.2,gz+.92,0,1.1,2.6,vC(0x2a6ab0));vpHang(4.1,Y0+6.2,gz+.92,0,1.1,2.6,vC(0xffffff,1.6));}   // the Order's blue and white on the pylons
 // ================================================================ the court: paving, reflecting pool, a gnomon, planters, lamps, a bench, folk
 vnPaving(0,Y0+.02,4,20,16,0,pave,40);vB('vFlag',0,Y0+.03,6.5,3.6,.1,13,0,pave.clone().multiplyScalar(.92));
 {const px=-6,pz=5;vB('vpBancoB',px,Y0,pz,5.2,.55,5.2,0,lat);vB('vpBancoB',px,Y0+.55,pz,5.6,.15,5.6,0,dk);vB('vpMosaicB',px,Y0+.2,pz,4.4,.4,4.4,0,null);
  mesh(new THREE.BoxGeometry(4.3,.06,4.3),MAT.glass,G,px,Y0+.62,pz);}
 {const gx=6.5,gz2=5.5;vB('vpBancoB',gx,Y0,gz2,2.6,.5,2.6,0,och2);vB('vpBancoB',gx,Y0+.5,gz2,2.0,.4,2.0,0,dk);vBeam([gx,Y0+.9,gz2],[gx+1.1,Y0+3.6,gz2-.3],.1,vC(0xb08a3a),'vIron');
  for(let k=0;k<7;k++)vB('vpMosaicB',gx-1.2+k*.4,Y0+.5,gz2+1.3,.3,.06,.3,0,null);}
 for(const x of[-9,9]){vB('vpBancoB',x,Y0,10.5,2.6,.6,1.2,0,lat);for(let k=0;k<3;k++)kput('vLeaf',[x+rr(-.8,.8),Y0+.75,10.5+rr(-.3,.3)],null,[rr(.3,.5),rr(.3,.45),rr(.3,.5)],vC(vPick([0x5e7444,0x6a7e4c,0x7a8a58])));}
 for(const x of[-4,4])vB('vpBancoB',x,Y0,-1.6,3.0,.5,.8,0,och2);   // benches before the porch
 for(const s of[-1,1])vnLampPost(s*8.5,Y0,1,3.4);
 // ================================================================ the bell tower: Sankore-type pyramid bristling with toron, a second stage, cone and gilt ball, the bell in an opening
 {const tx=-15.2,tz=-11.2,TW=5.6,TH=13.5;kput('vpBanco5',[tx,Y0,tz],null,[TW,TH,TW],och);const hw=y=>TW/2*(1-.45*y/TH);
  kput('vpBanco5',[tx,Y0+TH,tz],null,[TW*.55,4.4,TW*.55],och2);const hw2=y=>TW*.55/2*(1-.45*y/4.4);
  kput('vpBancoCone',[tx,Y0+TH+4.3,tz],null,[.95,2.2,.95],och2);vBall('vpGilt',tx,Y0+TH+6.7,tz,.3);
  for(const q of[[-1,-1],[1,-1],[-1,1],[1,1]])kput('vpBancoCone',[tx+q[0]*(TW*.55/2+.35),Y0+TH-.1,tz+q[1]*(TW*.55/2+.35)],null,[.3,.9,.3],och2);
  for(let r=0;r<7;r++){const y=2.6+r*1.6,h=hw(y),n=Math.max(1,Math.floor(2*h/1.25));for(let i=0;i<n;i++){const o=(i-(n-1)/2)*1.15+((r%2)?.25:0)*(n>1?1:0);
   const c=vC(0x4a3624);vBeam([tx+o,Y0+y,tz+h-.3],[tx+o,Y0+y-.05,tz+h+.85],.16,c);vBeam([tx+o,Y0+y,tz-h+.3],[tx+o,Y0+y-.05,tz-h-.85],.16,c);vBeam([tx+h-.3,Y0+y,tz+o],[tx+h+.85,Y0+y-.05,tz+o],.16,c);vBeam([tx-h+.3,Y0+y,tz+o],[tx-h-.85,Y0+y-.05,tz+o],.16,c);}}
  for(let r=0;r<2;r++){const y=TH+1.2+r*1.5,h=hw2(y-TH);for(const nn of[[0,1],[0,-1],[1,0],[-1,0]])vBeam([tx+nn[0]*(h-.3),Y0+y,tz+nn[1]*(h-.3)],[tx+nn[0]*(h+.75),Y0+y-.05,tz+nn[1]*(h+.75)],.14,vC(0x4a3624));}
  // bell opening on the front face of the upper stage, with the bell
  {const y=TH+1.6,h=hw2(y-TH);vB('vDarkB',tx,Y0+y,tz+h-.2,1.1,1.5,.5,0);kput('vpBrassBell',[tx,Y0+y+.95,tz+h-.1],null,[.4,.5,.4],null);vB('vIron',tx,Y0+y+1.36,tz+h-.1,1.2,.08,.08,0,vC(0x3a2f22));}
  vB('vDarkB',tx,Y0+7.6,tz+hw(7.6)-.15,.5,1.1,.4,0);vB('vDarkB',tx+hw(4.5)-.15,Y0+4.5,tz,.4,1.1,.5,0);
  vB('vDarkB',tx,Y0,tz+hw(0)-.3,1.2,2.2,.8,0);kput('vWood',[tx,Y0+1.1,tz+hw(0)+.1],null,[1.1,2.1,.08],plank);vB('vpBancoB',tx,Y0+2.2,tz+hw(0)+.1,1.9,.3,.5,0,dk);
  if(lit)vnLamp(tx+1.1,Y0+2.7,tz+hw(0)+.02,0);}
 // a low archive annex behind the hall on the right (the stacks overflow), flat-roofed with pinnacles and a hatch
 {const ax=15.6,az=-9,AW=5.2,AD=7.4,AH=3.4;kput('vpBanco7',[ax,Y0,az],null,[AW,AH,AD],och2);vB('vpBancoB',ax,Y0+AH-.05,az,AW*.94,.4,AD*.94,0,dk);vB('vpBancoB',ax,Y0+AH+.3,az,AW*.9,.5,AD*.9,0,och2);
  for(const s of[-1,1])vpPinnacle(ax+AW/2+.2,Y0,az+s*(AD/2-.2),.9,AH+1.0,och2);vpTorons(ax+vpBat7(AW,AH,2.4),az-3.0,ax+vpBat7(AW,AH,2.4),az+3.0,Y0+2.4,5,1,0,.8);
  for(const z of[-2.2,2.2])vpYWin(ax+vpBat7(AW,AH,1.6),Y0+1.6,az+z,Math.PI/2,.8,1.0,och2,false);vB('vDarkB',ax-vpBat7(AW,AH,1.1)+.1,Y0,az+2.6,.3,2.2,1.1,0);}
 vnFolk(0,7,4,3);vnFolk(0,17.5,3,2);}

VERN.def({key:'port_order_chapterhouse',name:'Order Chapterhouse',family:'ported',tags:{culture:'yuni-order',type:['civic','religious'],wealth:'civic',lit:true,role:'chapterhouse'},w:38,d:34,h:21,build:buildVpChapterhouse});
// ================================================================= KratorSky — the Krator skybox module (from claude/krator-sky.html, verbatim logic)
// Canon (krator-notes): tidally-locked moon of a Neptune–Saturn-class giant, 24 h day, ~40° S, giant fixed at
// altitude 25° azimuth 66° (NE, over Korona), obliquity ~23°, eclipse seasons round each equinox.
// Coordinates: x = east, y = up, z = south (north is −z). Azimuth clockwise from north.
// A target that wants it calls KratorSky.attach(scene,R) once and KratorSky.update(camPos,hour,day,dens) per frame,
// then applies KratorSky.lighting() to its sun / hemi / fog. A target that does not call attach pays nothing.
const KratorSky=(function(){
 const D=Math.PI/180;const LAT=-40*D,OBL=23*D,YEAR=360;
 const GIANT_ALT=25*D,GIANT_AZ=66*D,GIANT_ANG=14*D;
 const giantDir=new THREE.Vector3(Math.sin(GIANT_AZ)*Math.cos(GIANT_ALT),Math.sin(GIANT_ALT),-Math.cos(GIANT_AZ)*Math.cos(GIANT_ALT));
 function sunDir(hour,day){const dec=OBL*Math.sin(2*Math.PI*(day-80)/YEAR);const H=(hour-12)*15*D;
  const e=-Math.cos(dec)*Math.sin(H),n=Math.sin(dec)*Math.cos(LAT)-Math.cos(dec)*Math.sin(LAT)*Math.cos(H),u=Math.sin(dec)*Math.sin(LAT)+Math.cos(dec)*Math.cos(LAT)*Math.cos(H);
  return new THREE.Vector3(e,u,-n).normalize();}
 function altAz(v){return{alt:Math.asin(v.y)/D,az:((Math.atan2(v.x,-v.z)/D)+360)%360};}
 const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{sun:{value:new THREE.Vector3(0,1,0)},giant:{value:giantDir.clone()},dens:{value:1.6},ecl:{value:0},night:{value:0}},
  vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 vP;uniform vec3 sun,giant;uniform float dens,ecl,night;
  void main(){vec3 d=normalize(vP);float h=clamp(d.y,-0.1,1.0);float sh=sun.y;
   float dayF=smoothstep(-0.12,0.18,sh);float dusk=exp(-pow((sh-0.02)/0.16,2.0));
   float thick=clamp(dens/1.6,0.3,1.6);
   vec3 zenDay=mix(vec3(0.20,0.36,0.62),vec3(0.36,0.46,0.66),clamp((thick-0.7)*1.2,0.,1.));
   vec3 horDay=mix(vec3(0.78,0.84,0.90),vec3(0.86,0.70,0.52),clamp(thick-0.5,0.,1.));
   vec3 zenNight=vec3(0.015,0.02,0.045);vec3 horNight=vec3(0.06,0.05,0.09)*thick;
   float hp=pow(1.0-h,2.2+1.2*thick);
   vec3 day=mix(zenDay,horDay,hp);vec3 nite=mix(zenNight,horNight,hp);
   vec3 c=mix(nite,day,dayF);
   float sd=max(dot(d,normalize(sun)),0.0);
   vec3 duskCol=vec3(1.0,0.45,0.18);c+=duskCol*dusk*pow(sd,3.0)*(0.55+0.5*hp)*(1.0-0.6*ecl);
   c+=vec3(1.0,0.9,0.75)*pow(sd,64.0)*dayF*0.9*(1.0-ecl);c+=vec3(1.0,0.85,0.6)*pow(sd,8.0)*dayF*0.18*thick;
   float gd=max(dot(d,giant),0.0);c+=vec3(0.55,0.5,0.7)*pow(gd,10.0)*(1.0-dayF)*0.12;
   c*=1.0-0.75*ecl*smoothstep(-0.05,0.3,h);
   c=mix(c,c*0.6+vec3(0.12,0.08,0.06)*thick,(1.0-dayF)*0.4*(1.0-h));
   gl_FragColor=vec4(c,1.0);}`});
 const giantTex=(function(){const c=document.createElement('canvas');c.width=64;c.height=512;const g=c.getContext('2d');
  const bands=[[0.00,'#7d8fb0'],[0.08,'#9aa8c4'],[0.15,'#c7c2b6'],[0.22,'#8a98b8'],[0.30,'#dcd4c2'],[0.36,'#7e8db0'],[0.45,'#b9b2a6'],[0.52,'#6f80a6'],[0.60,'#d8cfbb'],[0.68,'#8896b6'],[0.76,'#c4bdb0'],[0.84,'#7688aa'],[0.92,'#a9b0c2'],[1.0,'#6f80a2']];
  const grd=g.createLinearGradient(0,0,0,512);bands.forEach(b=>grd.addColorStop(b[0],b[1]));g.fillStyle=grd;g.fillRect(0,0,64,512);
  for(let i=0;i<200;i++){g.fillStyle='rgba(255,255,255,'+(h3(i,1,2)*.08)+')';g.fillRect(h3(i,2,3)*64,h3(i,3,4)*512,h3(i,4,5)*30+4,h3(i,5,6)*3+1);}
  g.fillStyle='rgba(230,225,215,.35)';g.beginPath();g.ellipse(40,300,9,4,0,0,6.28);g.fill();
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
 const giantMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,
  uniforms:{map:{value:giantTex},L:{value:new THREE.Vector3(0,0,1)},haze:{value:0.3},ring:{value:1},tilt:{value:0.35},t:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform sampler2D map;uniform vec3 L;uniform float haze,ring,tilt,t;
  void main(){vec2 p=(vUv-0.5)*2.0;
   float R=0.62;vec2 q=p/R;float r2=dot(q,q);vec3 col=vec3(0.);float a=0.;
   float cs=cos(tilt),sn=sin(tilt);vec2 rp=vec2(q.x,q.y/max(sn,0.08));float rr=length(rp);
   float inRing=ring*smoothstep(1.35,1.4,rr)*(1.0-smoothstep(2.1,2.2,rr))*(0.55+0.45*sin(rr*40.0));
   float behind=step(0.0,q.y)*step(rr,1.0);
   if(r2<1.0){vec3 n=vec3(q.x,q.y,sqrt(max(0.0,1.0-r2)));
    float lat=asin(clamp(n.y,-1.,1.));float lon=atan(n.x,n.z);
    vec3 base=texture2D(map,vec2(lon/6.2832+t*0.02,lat/3.1416+0.5)).rgb;
    float lit=clamp(dot(n,normalize(L)),-1.0,1.0);float day=smoothstep(-0.08,0.25,lit);
    float limb=pow(max(0.0,n.z),0.45);
    col=base*(0.05+0.95*day)*limb+vec3(0.35,0.3,0.4)*0.05*(1.0-day);
    a=1.0;}
   else{a=0.0;}
   vec3 ringCol=vec3(0.85,0.82,0.78);float ringA=inRing*(1.0-behind)*(r2<1.0?0.0:1.0);
   float ringLit=clamp(dot(vec3(0.,1.,0.),normalize(L))*0.5+0.6,0.15,1.0);
   col=mix(col,ringCol*ringLit,ringA*0.7);a=max(a,ringA*0.7);
   float front=step(q.y,0.0)*step(rr,1.0)*inRing;col=mix(col,ringCol*ringLit,front*0.6);
   a*=1.0-haze;
   gl_FragColor=vec4(col,a);}`});
 const giant=new THREE.Mesh(new THREE.PlaneGeometry(1,1),giantMat);
 const sunTex=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,235,1)');gr.addColorStop(0.18,'rgba(255,240,200,1)');gr.addColorStop(0.3,'rgba(255,200,120,0.35)');gr.addColorStop(1,'rgba(255,160,80,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
 const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:sunTex,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));
 const starGeo=new THREE.BufferGeometry();{const p=[],c=[];for(let i=0;i<2600;i++){const u=h3(i,7,1)*2-1,th=h3(i,8,2)*6.2832;const r=Math.sqrt(1-u*u);p.push(r*Math.cos(th),u,r*Math.sin(th));const k=h3(i,9,3);c.push(0.7+0.3*k,0.75+0.2*k,0.9);}
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));starGeo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));}
 const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:2.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0,fog:false,depthWrite:false}));
 const moon=new THREE.Sprite(new THREE.SpriteMaterial({map:(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#cfc8bc';g.beginPath();g.arc(32,32,28,0,6.28);g.fill();g.fillStyle='rgba(90,80,80,.35)';for(let i=0;i<8;i++){g.beginPath();g.arc(20+h3(i,1,9)*24,20+h3(i,2,9)*24,2+h3(i,3,9)*4,0,6.28);g.fill();}return new THREE.CanvasTexture(c);})(),fog:false,depthWrite:false,transparent:true}));
 const group=new THREE.Group();const dome=new THREE.Mesh(new THREE.SphereGeometry(1,48,24),skyMat);group.add(dome,giant,sun,stars,moon);group.traverse(o=>{o.userData.probeSkip=true;});
 const state={hour:12,day:200,dens:1.6,sun:new THREE.Vector3(),eclipse:0,ring:true};
 function attach(scene,R){group.scale.setScalar(R);group.userData.R=R;scene.add(group);return group;}
 function update(camPos,hour,day,dens){state.hour=hour;state.day=day;state.dens=dens;group.position.copy(camPos);
  const s=sunDir(hour,day);state.sun.copy(s);skyMat.uniforms.sun.value.copy(s);skyMat.uniforms.dens.value=dens;
  const ang=Math.acos(Math.max(-1,Math.min(1,s.dot(giantDir))));const ecl=s.y>0?Math.max(0,1-ang/GIANT_ANG):0;const eclF=ecl>0?Math.min(1,ecl*1.6):0;state.eclipse=eclF;skyMat.uniforms.ecl.value=eclF*0.9;
  giant.position.copy(giantDir).multiplyScalar(0.96);giant.lookAt(new THREE.Vector3(0,0,0));const size=2*0.96*Math.tan(GIANT_ANG)/0.62;giant.scale.set(size,size,1);
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();const upB=new THREE.Vector3().crossVectors(giantDir,right).normalize();
  giantMat.uniforms.L.value.set(s.dot(right),s.dot(upB),-s.dot(giantDir));giantMat.uniforms.haze.value=0.15+0.35*Math.max(0,dens-1)*0.7;giantMat.uniforms.ring.value=state.ring?1:0;giantMat.uniforms.t.value=hour/24;
  sun.position.copy(s).multiplyScalar(0.95);const ss=0.11*(1+0.5*Math.max(0,0.15-s.y)*6);sun.scale.set(ss,ss,1);sun.material.opacity=s.y>-0.08?1-eclF*0.85:0;
  const night=1-Math.min(1,Math.max(0,(s.y+0.1)/0.28));stars.material.opacity=night*0.9;stars.rotation.set(0,0,0);stars.rotateOnAxis(new THREE.Vector3(0,Math.sin(-LAT),Math.cos(-LAT)).normalize(),hour/24*6.2832);
  const ma=hour/6*6.2832;const md=new THREE.Vector3(Math.cos(ma)*0.9,0.25+0.2*Math.sin(ma*0.5),Math.sin(ma)*0.9).normalize();moon.position.copy(md).multiplyScalar(0.93);moon.scale.set(0.02,0.02,1);moon.material.opacity=md.y>0.05?0.9:0;
  return state;}
 function lighting(){const s=state.sun;const dayF=Math.min(1,Math.max(0,(s.y+0.12)/0.3));const dusk=Math.exp(-Math.pow((s.y-0.02)/0.16,2));const e=state.eclipse;
  const sunCol=new THREE.Color(1,0.96,0.9).lerp(new THREE.Color(1,0.55,0.3),dusk).multiplyScalar(1-0.85*e);
  const thick=Math.min(1.6,Math.max(0.3,state.dens/1.6));const hor=new THREE.Color(0.78,0.84,0.90).lerp(new THREE.Color(0.86,0.70,0.52),Math.min(1,Math.max(0,thick-0.5)));
  const fog=new THREE.Color(0.06,0.05,0.09).lerp(hor,dayF).lerp(new THREE.Color(1,0.5,0.25),dusk*0.5).multiplyScalar(1-0.6*e*dayF);
  return{sunDir:s.clone(),sunIntensity:1.7*dayF*(1-0.85*e),sunColor:sunCol,ambient:0.18+0.55*dayF*(1-0.6*e)+0.08*(1-dayF),fog,giantDir:giantDir.clone(),eclipse:e,isNight:dayF<0.05,dayF,dusk};}
 return{attach,update,lighting,sunDir,altAz,giantDir,state,GIANT_ANG};})();
window.KratorSky=KratorSky;
// ================================================================= DALAB CITY — geometry (target: city)
// WHERE things are: the world, the Ancient lab, the settlements, the river, the terrain function. Metres; x east,
// z south. The lab stands north of centre; the main settlement south of it; six outlying settlements on a ring
// round both, joined by the highway circuit; the river down the west edge with a channel to the main settlement.
window.CITY=true;
const CITY={
 WORLD:4400,                 // side of the terrain plane (the clearing; the forest closes in at the edge)
 LAB:{x:0,z:-720,scale:.4},  // the Ancient lab: 64-dalab.js at K=4.105 is 2.4 km across; .4 gives a 180 m dome and a 480 m compound
 MAIN:{x:0,z:420,r:520},     // the main settlement: its mound (the palace mound) sits at the south of the plaza and faces the lab
 RING:1560,                  // radius of the outlying ring (from the point between lab and main)
 RING_C:[0,-120],
 HIGHWAY_W:14,STREET_W:8,LANE_W:5.5,
 RIVER_X:-1980,              // the river runs N-S near the west edge
 FOREST_R:2050,              // beyond this the forest is dense
 QUALITY:1,
};
const SEED_CITY=515151;
const FRAME_HOOKS_PRE=[];
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
function angDiff(a,b){let d=Math.abs(a-b)%TAU;return d>Math.PI?TAU-d:d;}
// the six outlying settlements, on the ring at 60-degree spacing (offset so none sits on the lab's axis), each facing the lab
const SETTLE=[];
(function(){const L=CITY.LAB;
 for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;const x=CITY.RING_C[0]+Math.cos(a)*CITY.RING,z=CITY.RING_C[1]+Math.sin(a)*CITY.RING;
  SETTLE.push({key:'town'+(k+1),name:['Ashfold','Greenmarch','Reedholm','Oakhaven','Cornwell','Stonebrook'][k],x,z,r:170,main:false,face:Math.atan2(L.x-x,L.z-z),plazaR:30,moundR:30,streets:8,ringR:74,ringR2:118});}
 // the main settlement: 3x; its mound faces the lab (north); the palace mound is the High Priest's seat here
 SETTLE.push({key:'main',name:'Dalab',x:CITY.MAIN.x,z:CITY.MAIN.z,r:CITY.MAIN.r,main:true,face:Math.atan2(L.x-CITY.MAIN.x,L.z-CITY.MAIN.z),plazaR:64,moundR:42,streets:10,ringR:200,ringR2:330,ringR3:450});
})();
// the river: a gentle meander down the west edge; the main channel east to the main settlement; irrigation channels to
// the western towns and from the main channel to the eastern ones
function riverX(z){return CITY.RIVER_X+60*Math.sin(z*.0021+1.3)+24*Math.sin(z*.0067);}
const CHANNELS=[];   // [{pts,w}] painted as water and carved into the terrain
(function(){const M=CITY.MAIN;
 CHANNELS.push({pts:[[riverX(M.z-40),M.z-40],[-900,M.z-60],[M.x-M.r-30,M.z-40]],w:10,main:true});
 for(const S of SETTLE){if(S.main)continue;const rx=riverX(S.z);
  if(S.x<-600)CHANNELS.push({pts:[[rx,S.z+30],[(rx+S.x)/2,S.z+50],[S.x-S.r-20,S.z+30]],w:7});
  else{const mc=CHANNELS[0];const from=[-700,M.z-58];CHANNELS.push({pts:[from,[(from[0]+S.x)/2,(from[1]+S.z)/2+60],[S.x-(S.x>0?S.r+20:-(S.r+20)),S.z+40]],w:6});}}
})();
// meander: every channel polyline is resampled every ~25 m with a sinuous offset across its line
(function(){for(const C of CHANNELS){const out=[];for(let i=0;i<C.pts.length-1;i++){const a=C.pts[i],b=C.pts[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.round(L/25));const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
  for(let k=0;k<n;k++){const t=k/n;const w=Math.sin(t*Math.PI*(2+i))*(C.main?18:10)*Math.sin(t*Math.PI)+Math.sin(t*37+i)*3;out.push([a[0]+(b[0]-a[0])*t+nx*w,a[1]+(b[1]-a[1])*t+nz*w]);}}
 out.push(C.pts[C.pts.length-1]);C.pts=out;}})();
// the lab's domes as biome obstacles (nothing roots inside them; the compound's ground is the biome's to dress)
const LAB_WALL_GAP={a:Math.PI/2,w:.075};   // the ruined wall's south gate, where the oak avenue enters (a 75 m gap)
const LAB_OBST=(function(){const K=4.105*CITY.LAB.scale;const o=[{x:CITY.LAB.x,z:CITY.LAB.z,r:118*K}];
 for(const q of[[178,-52,46],[126,152,34],[-86,176,40],[-192,26,29],[-138,-148,37],[54,-186,24],[205,88,31]])o.push({x:CITY.LAB.x+q[0]*K,z:CITY.LAB.z+q[1]*K,r:q[2]*K+6});return o;})();
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
function channelD(x,z){let best=1e9,w=0;for(const C of CHANNELS){for(let i=0;i<C.pts.length-1;i++){const d=segD(x,z,C.pts[i],C.pts[i+1]);if(d<best){best=d;w=C.w;}}}return{d:best,w};}
function riverD(x,z){return Math.abs(x-riverX(z));}
// the terrain: flat lowland with a metre of roll, the river cut 3.5 m deep and 70 m wide, the channels 1.4 m deep
// the ground sits ~2.2 m above the datum: the biome reads anything under 0.3 m as water
terrainH=function(x,z){let h=2.2+.9*fbm(x*.0016+3,z*.0016-7,17,3)+.35*fbm(x*.009,z*.009,5,2)-.5;
 const rd=riverD(x,z);if(rd<60){const t=1-smoothstep(28,60,rd);h-=3.5*t;}
 const c=channelD(x,z);if(c.d<c.w){const t=1-smoothstep(c.w*.45,c.w,c.d);h-=1.4*t;}
 return h;};
const WATER_Y=1.25;
function isWater(x,z){return terrainH(x,z)<WATER_Y+.1;}
function nearestSettle(x,z){let best=null,bd=1e9;for(const S of SETTLE){const d=Math.hypot(x-S.x,z-S.z);if(d<bd){bd=d;best=S;}}return{S:best,d:bd};}
// ================================================================= DALAB CITY — the painted ground: albedo, buildable mask, classes, the road list
// Everything the layout decides is painted here first (the Iziz city's scheme); placement then READS these canvases
// and the ROADS list, and the terrain mesh wears the albedo. 2048 px over WORLD m ≈ 0.47 px/m.
const CS=2048,PXS=CS/CITY.WORLD,px=v=>(v+CITY.WORLD/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
const mv=document.createElement('canvas');mv.width=mv.height=CS;const mg=mv.getContext('2d');
const kv=document.createElement('canvas');kv.width=kv.height=CS;const kg=kv.getContext('2d');
const KL={none:0,plaza:1,park:2,highway:3,street:4,lane:5,avenue:6,farm:7,water:8,court:9,building:10,rock:11,field:12,mound:13};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];const PRECINCTS=[];
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),px(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#8a7a62',4:'#8f8068',5:'#8a8070',6:'#7a6a56'};   // packed earth; the highway a shade darker
// a road: albedo, blocked in the mask (a little wider), classed, and remembered
function road(pts,w,cls,opt){opt=opt||{};cstroke(cg,pts,w,opt.col||ROADCOL[cls]||'#8a7a62');if(cls===KL.highway||cls===KL.avenue){cstroke(cg,pts,w*.36,'#9a8a70');cstroke(cg,pts,w*.08,'#7a6a52');}else if(cls===KL.street){cstroke(cg,pts,w*.3,'#968670');}cstroke(mg,pts,w+2.4,'#000');cstroke(kg,pts,w+1.2,KLCOL(cls));   /* the mask is 2.15 m/px: a w+3 stroke ate the frontage's first metres (round 10) */
 const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null};ROADS.push(r);return r;}
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#5f8a3a':type==='court'?'#8a7a66':'#a89474'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='court'?KL.court:type==='mound'?KL.mound:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
function footprint(pts,col){cpoly(cg,pts,col||'rgba(70,52,34,.5)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
function inPrecinct(x,z,pad){for(const p of PRECINCTS)if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;return null;}
// a farm field: a quad polygon, painted in a crop colour with furrows, blocked, classed field (nothing builds or roots)
const CROPCOL=['#a08a3c','#8a9a38','#b89a48','#6f8a30','#c4a050','#7f9a44','#9a7a34'];
function field(pts,ci,ry){const col=CROPCOL[ci%CROPCOL.length];cpoly(cg,pts,col);cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.field));
 // furrows: stripes across the quad along its ry
 cg.save();cg.beginPath();pts.forEach((p,i)=>i?cg.lineTo(px(p[0]),px(p[1])):cg.moveTo(px(p[0]),px(p[1])));cg.closePath();cg.clip();
 const cx=pts.reduce((a,p)=>a+p[0],0)/pts.length,cz=pts.reduce((a,p)=>a+p[1],0)/pts.length;const R=Math.max(...pts.map(p=>Math.hypot(p[0]-cx,p[1]-cz)))+4;
 cg.strokeStyle='rgba(60,45,25,.28)';cg.lineWidth=Math.max(1,2.2*PXS);for(let d=-R;d<R;d+=7){const a=[cx+Math.cos(ry)*d-Math.sin(ry)*R,cz+Math.sin(ry)*d+Math.cos(ry)*R],b=[cx+Math.cos(ry)*d+Math.sin(ry)*R,cz+Math.sin(ry)*d-Math.cos(ry)*R];
  cg.beginPath();cg.moveTo(px(a[0]),px(a[1]));cg.lineTo(px(b[0]),px(b[1]));cg.stroke();}
 cg.restore();}
function water(pts,w){cstroke(cg,pts,w,'#2a4a44');cstroke(mg,pts,w+6,'#000');cstroke(kg,pts,w+4,KLCOL(KL.water));}
// ---- base paint: lowland grass and earth, a darker forest floor beyond the clearing ----
(function paintBase(){reseed(SEED_CITY+1);
 cg.fillStyle='#7f9a4c';cg.fillRect(0,0,CS,CS);mg.fillStyle='#fff';mg.fillRect(0,0,CS,CS);kg.fillStyle='#000';kg.fillRect(0,0,CS,CS);
 for(let i=0;i<5000;i++){cg.beginPath();cg.arc(rng()*CS,rng()*CS,rr(6,50),0,7);cg.fillStyle=vPick(['rgba(110,140,60,.35)','rgba(140,150,70,.3)','rgba(90,120,50,.35)','rgba(150,120,70,.22)','rgba(120,100,60,.2)']);cg.fill();}
 // the forest floor beyond the clearing: dark litter under the trees
 cg.save();cg.beginPath();cg.rect(0,0,CS,CS);cg.arc(px(0),px(-120),CITY.FOREST_R*PXS,0,7,true);cg.fillStyle='#3a4a26';cg.fill();cg.restore();
 // the river and the channels: water, blocked
 {const pts=[];for(let z=-CITY.WORLD/2;z<=CITY.WORLD/2;z+=40)pts.push([riverX(z),z]);water(pts,52);for(const C of CHANNELS)water(C.pts,C.w-1);}
})();
let mData=null,kData=null,cData=null;
function cityBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;cData=cg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>235;}   /* a pixel the stroke touched at all is blocked (round 10): a corner could sit a metre inside a lane at 200 */
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
function walkable(x,z){const k=klass(x,z);return k===1||k===2||(k>=3&&k<=6)||k===9;}
// ================================================================= BIOME CORE — head
// The engine-independent kit every Krator biome fragment is written against.
// Nothing below names a world's kit. The host hands in what a biome needs
// through BIO.init(...) (see BIOME-API.md) and everything else lives here.
var BIO={host:null,stats:{},cur:null,version:'eastabyss-1'};
// EVERYTHING BELOW IS LOCAL. The core declares no generic global (rng, clamp,
// TAU...): a world that already has those would be clobbered. Biome fragments
// pull what they need from BIO.fn at the top of their own closure.
(function(){
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, mix=lerp;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

// ---------------------------------------------------------------- PRNG
// The biome's OWN stream. A host that adds a biome must not see its rubble
// move, so the biome never draws from the host's generator.
let _bseed=1234567;
function reseed(s){_bseed=s>>>0;}
function rng(){_bseed|=0;_bseed=_bseed+0x6D2B79F5|0;let t=Math.imul(_bseed^_bseed>>>15,1|_bseed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function rr(a,b){return a+(b-a)*rng();}
function ri(a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(arr){return arr[Math.floor(rng()*arr.length)%arr.length];}

// ---------------------------------------------------------------- noise
function h3(x,y,z){const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);}
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
 const sm=t=>t*t*(3-2*t);const u=sm(xf),v=sm(yf),w=sm(zf);const l=(a,b,t)=>a+(b-a)*t;
 return l(l(l(h3(xi,yi,zi),h3(xi+1,yi,zi),u),l(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v),
          l(l(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),l(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v),w);}
function fbm(x,y,z,o){o=o||3;let a=0,f=1,s=0;for(let i=0;i<o;i++){a+=vnoise(x*f,y*f,z*f)/f;s+=1/f;f*=2.03;}return a/s;}

// ---------------------------------------------------------------- host binding
// host = { THREE, scene, terrainH(x,z), mask(x,z), obstacles[], ticks(fn), seed,
//          origin[x,z], err(msg), stat(key,tris,inst) }
BIO.init=function(h){
 if(!h||!h.THREE)throw new Error('BIO.init: host needs THREE');
 // scene may arrive later (a world that creates its scene after its kit loads
 // calls BIO.setScene before build); it is only needed at bake
 BIO.host={
  THREE:h.THREE,scene:h.scene||null,
  terrainH:h.terrainH||((x,z)=>0),
  mask:h.mask||((x,z)=>1),
  obstacles:h.obstacles||[],
  ticks:h.ticks||(fn=>{}),
  seed:h.seed==null?1:h.seed,
  // origin: [x,z] or a LIST of [x,z] -- the LOD curve is measured from the
  // nearest one, so a long showcase (a lake shore, a river) can keep detail
  // along a spine instead of round one point. center: the disc the grids
  // cover (default: the first origin).
  origin:(h.origin&&typeof h.origin[0]==='number')?[h.origin]:(h.origin||[[0,0]]),
  center:h.center||null,
  // fields: optional climate fields a multi-zone biome asks for, each
  // (x,z)->0..1. Missing ones fall back to BIO.fieldDefault. wet: 0 arid ..
  // 1 saturated; salt: 0 .. 1 crust; upland: 0 basin floor .. 1 the high edge.
  fields:h.fields||{},
  err:h.err||(m=>console.error(m)),
  stat:h.stat||null};
 reseed(BIO.host.seed*7919+11);
 return BIO;};
BIO.setScene=function(s){BIO.host.scene=s;};
BIO.err=function(m){if(BIO.host)BIO.host.err(m);else console.error(m);};
BIO.terrainH=function(x,z){return BIO.host?BIO.host.terrainH(x,z):0;};
BIO.mask=function(x,z){return BIO.host?BIO.host.mask(x,z):1;};
// distance from the LOD origin, for the detail curve
BIO.lodD=function(x,z){const O=BIO.host?BIO.host.origin:[[0,0]];let m=1e9;for(let i=0;i<O.length;i++){const d=Math.hypot(x-O[i][0],z-O[i][1]);if(d<m)m=d;}return m;};
BIO.center=function(){const h=BIO.host;return h?(h.center||h.origin[0]):[0,0];};
BIO.fieldDefault={wet:(x,z)=>BIO.terrainH(x,z)<2?1:.6,salt:(x,z)=>0,upland:(x,z)=>0};
BIO.field=function(n,x,z){const f=BIO.host&&BIO.host.fields[n];return f?f(x,z):BIO.fieldDefault[n](x,z);};
// LOD is a CURVE, not two steps: full detail under ~700 m, a quarter by 3 km.
BIO.lod=function(x,z){return clamp(1.18-BIO.lodD(x,z)/2600,.22,1);};

// ---------------------------------------------------------------- accounting
// Every instance and merged triangle is charged to BIO.cur ('jungle/hyper',
// 'jungle/floor'...), so a probe can assert per-pass budgets.
BIO.tally=function(tris,inst,meshes){const k=BIO.cur||'biome';
 const t=BIO.stats[k]||(BIO.stats[k]={tris:0,inst:0,meshes:0});
 t.tris+=tris||0;t.inst+=inst||0;t.meshes+=meshes||0;
 if(BIO.host&&BIO.host.stat)BIO.host.stat(k,tris||0,inst||0);};
BIO.totals=function(){let tris=0,inst=0,meshes=0;for(const k in BIO.stats){tris+=BIO.stats[k].tris;inst+=BIO.stats[k].inst;meshes+=BIO.stats[k].meshes;}return{tris,inst,meshes};};

BIO.fn={TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm};
})();
// ================================================================= BIOME CORE — kit
// Two ways to put geometry in the world, both cheap:
//   INSTANCED ITEMS   BIO.def(name,geo,mat) once, BIO.put(name,...) thousands of
//                     times, one InstancedMesh per item at bake. Per-instance
//                     colour, and optional per-instance extras (aN normal, aC2
//                     second colour) for the foliage shaders.
//   MERGED BUCKET     BIO.tri/quad/tube/lathe/surf write vertex-coloured
//                     triangles into a bucket per material family; one Mesh per
//                     family at bake. Boles, limbs, logs, boulders go here.
// Both are charged to BIO.cur by the accounting in 10-core-head.js.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm}=BIO.fn;
BIO.defs={};BIO.order=[];BIO.items={};
BIO.def=function(name,geo,mat,opt){opt=opt||{};
 if(BIO.defs[name])BIO.err('BIO.def: '+name+' defined twice');
 const g=geo.index?geo.toNonIndexed():geo;
 BIO.defs[name]={geo:g,mat,tris:g.attributes.position.count/3,attrs:opt.attrs||null,label:opt.label||name};
 BIO.items[name]={m:[],c:[],n:[],c2:[],count:0};BIO.order.push(name);};
const _bm=new (function(){return {}})();   // scratch holder, filled after THREE binds
BIO._scratch=function(){const T=BIO.host.THREE;if(!_bm.m){_bm.m=new T.Matrix4();_bm.q=new T.Quaternion();_bm.e=new T.Euler();_bm.p=new T.Vector3();_bm.s=new T.Vector3();_bm.c=new T.Color();_bm.up=new T.Vector3(0,1,0);_bm.v=new T.Vector3();}return _bm;};
// rotation helpers: qEuler(rx,ry,rz) or qFacing([nx,ny,nz]) (local +z toward n)
function qEuler(rx,ry,rz){const S=BIO._scratch();S.e.set(rx||0,ry||0,rz||0,'YXZ');return new BIO.host.THREE.Quaternion().setFromEuler(S.e);}
function qFacing(n){const T=BIO.host.THREE,v=new T.Vector3(n[0],n[1],n[2]).normalize();return new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),v);}
function qUp(n){const T=BIO.host.THREE,v=new T.Vector3(n[0],n[1],n[2]).normalize();return new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v);}
// put(name, [x,y,z], quat|null, [sx,sy,sz]|s, colour(hex|Color|null), extra{n:[..], c2:hex})
BIO.put=function(name,pos,q,sc,col,extra){
 const it=BIO.items[name];if(!it){BIO.err('BIO.put: no item '+name);return;}
 if(!(isFinite(pos[0])&&isFinite(pos[1])&&isFinite(pos[2]))){BIO.err('BIO.put: NaN position for '+name);return;}
 const S=BIO._scratch();
 S.p.set(pos[0],pos[1],pos[2]);
 if(typeof sc==='number')S.s.set(sc,sc,sc);else S.s.set(sc[0],sc[1],sc[2]);
 S.m.compose(S.p,q||S.q.set(0,0,0,1),S.s);
 const e=S.m.elements;for(let i=0;i<16;i++)it.m.push(e[i]);
 if(col==null)it.c.push(1,1,1);
 else{if(col.isColor)S.c.copy(col);else S.c.set(col);S.c.convertSRGBToLinear();it.c.push(S.c.r,S.c.g,S.c.b);}
 const def=BIO.defs[name];
 if(def.attrs){
  if(def.attrs.indexOf('aN')>=0){const n=(extra&&extra.n)||[0,1,0];it.n.push(n[0],n[1],n[2]);}
  if(def.attrs.indexOf('aC2')>=0){const c2=extra&&extra.c2;if(c2==null)it.c2.push(S.c.r,S.c.g,S.c.b);else{if(c2.isColor)S.c.copy(c2);else S.c.set(c2);S.c.convertSRGBToLinear();it.c2.push(S.c.r,S.c.g,S.c.b);}}}
 it.count++;BIO.tally(def.tris,1,0);};
// a beam of instanced item `name` (a unit cylinder along y, centred) from a to b
BIO.beam=function(name,a,b,r0,r1,col){const T=BIO.host.THREE,S=BIO._scratch();
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz);if(L<1e-4)return;
 S.v.set(dx/L,dy/L,dz/L);const q=new T.Quaternion().setFromUnitVectors(S.up,S.v);
 BIO.put(name,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q,[r0*2,L,(r1==null?r0:r1)*2],col);};

// ---------------------------------------------------------------- merged buckets
BIO.buckets={};
BIO.bucket=function(fam,mat,opt){opt=opt||{};
 if(!BIO.buckets[fam])BIO.buckets[fam]={mat,pos:[],nor:[],uv:[],col:[],tris:0,label:opt.label||fam,uvScale:opt.uvScale||[3,3]};
 return BIO.buckets[fam];};
const _lc={r:1,g:1,b:1};
// COLOURS ARE sRGB IN, LINEAR OUT. r128 sends instance and vertex colours to
// the shader untouched, and the renderer encodes its output to sRGB, so a raw
// hex would render a stop too bright. Everything passed here is a designer's
// sRGB colour (hex, Color, or [r,g,b] already linear) and is converted once.
function _col3(c){const S=BIO._scratch();if(c==null)return[1,1,1];if(Array.isArray(c))return c;
 if(c.isColor)S.c.copy(c);else S.c.set(c);S.c.convertSRGBToLinear();return[S.c.r,S.c.g,S.c.b];}
// one triangle, flat normal unless `n` is given; a,b,c CCW from outside
BIO.tri=function(fam,a,b,c,col,n){const K=BIO.buckets[fam];if(!K){BIO.err('BIO.tri: no bucket '+fam);return;}
 let nx,ny,nz;if(n){nx=n[0];ny=n[1];nz=n[2];}else{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  nx=uy*vz-uz*vy;ny=uz*vx-ux*vz;nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;}
 const cc=_col3(col);
 [a,b,c].forEach(p=>{K.pos.push(p[0],p[1],p[2]);K.nor.push(nx,ny,nz);K.uv.push(p[3]||0,p[4]||0);K.col.push(cc[0],cc[1],cc[2]);});
 K.tris++;BIO.tally(1,0,0);};
BIO.quad=function(fam,a,b,c,d,col){BIO.tri(fam,a,b,c,col);BIO.tri(fam,a,c,d,col);};
// TUBE along pts [{x,y,z,r,col?}], parallel-transport frames, constant texture
// repeat along the length (so a bole shows no shear bands where the radius
// changes). opt: seg, cap, rfn(i,ang,pt)->radius multiplier, vscale
BIO.tube=function(fam,pts,col,opt){opt=opt||{};const T=BIO.host.THREE,K=BIO.buckets[fam];if(!K){BIO.err('BIO.tube: no bucket '+fam);return 0;}
 const seg=opt.seg||8,sc=K.uvScale,n=pts.length;if(n<2)return 0;
 const Tn=[],N=[],Bn=[];
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];Tn.push(new T.Vector3(b.x-a.x,b.y-a.y,b.z-a.z).normalize());}
 const ref=Math.abs(Tn[0].y)>.9?new T.Vector3(1,0,0):new T.Vector3(0,1,0);
 N[0]=new T.Vector3().crossVectors(Tn[0],ref).normalize();Bn[0]=new T.Vector3().crossVectors(Tn[0],N[0]).normalize();
 for(let j=1;j<n;j++){const nn=N[j-1].clone().sub(Tn[j].clone().multiplyScalar(N[j-1].dot(Tn[j]))).normalize();N[j]=nn;Bn[j]=new T.Vector3().crossVectors(Tn[j],nn).normalize();}
 const rt=pts[Math.min(n-1,Math.floor(n*.3))].r||1;   // one u-repeat count for the whole tube
 const rings=[];let vAcc=0;
 for(let q=0;q<n;q++){if(q>0)vAcc+=Math.hypot(pts[q].x-pts[q-1].x,pts[q].y-pts[q-1].y,pts[q].z-pts[q-1].z);
  const ring=[];const urep=Math.max(1,Math.round(TAU*rt/sc[0]));
  for(let s=0;s<=seg;s++){const ang=s/seg*TAU,rad=pts[q].r*(opt.rfn?opt.rfn(q,ang,pts[q]):1);
   const cx=Math.cos(ang),sx=Math.sin(ang);const nx=N[q].x*cx+Bn[q].x*sx,ny=N[q].y*cx+Bn[q].y*sx,nz=N[q].z*cx+Bn[q].z*sx;
   ring.push({p:[pts[q].x+nx*rad,pts[q].y+ny*rad,pts[q].z+nz*rad],n:[nx,ny,nz],uv:[s/seg*urep,vAcc/(opt.vscale||sc[1])]});}
  rings.push(ring);}
 const pv=(v,c)=>{K.pos.push(v.p[0],v.p[1],v.p[2]);K.nor.push(v.n[0],v.n[1],v.n[2]);K.uv.push(v.uv[0],v.uv[1]);K.col.push(c[0],c[1],c[2]);};
 const cc=_col3(col);let tris=0;
 for(let r2=0;r2<n-1;r2++){const c0=pts[r2].col!=null?_col3(pts[r2].col):cc,c1=pts[r2+1].col!=null?_col3(pts[r2+1].col):cc;
  for(let s2=0;s2<seg;s2++){const a0=rings[r2][s2],a1=rings[r2][s2+1],b0=rings[r2+1][s2],b1=rings[r2+1][s2+1];
   pv(a0,c0);pv(b1,c1);pv(b0,c1);pv(a0,c0);pv(a1,c0);pv(b1,c1);tris+=2;}}
 if(opt.cap){[[0,-1],[n-1,1]].forEach(e=>{const ri2=rings[e[0]],ctr=[pts[e[0]].x,pts[e[0]].y,pts[e[0]].z];
  for(let s3=0;s3<seg;s3++){if(e[1]>0)BIO.tri(fam,ctr,ri2[s3].p,ri2[s3+1].p,opt.capCol!=null?opt.capCol:col);else BIO.tri(fam,ctr,ri2[s3+1].p,ri2[s3].p,opt.capCol!=null?opt.capCol:col);}});}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};
// LATHE from rings [{x,y,z,yy,col}], radius rad(ring,ang), ambient-occlusion aof(ring,ang);
// true surface normals so fluting and buttress fins shade
BIO.lathe=function(fam,rings,seg,rep,vs,rad,aof){const K=BIO.buckets[fam];if(!K){BIO.err('BIO.lathe: no bucket '+fam);return 0;}
 const n=rings.length,P=[];
 for(let i=0;i<n;i++){const row=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,r=rad(rings[i],a);row.push([rings[i].x+Math.cos(a)*r,rings[i].y,rings[i].z+Math.sin(a)*r]);}P.push(row);}
 const V=[];
 for(let i=0;i<n;i++){const vr=[],lc=_col3(rings[i].col);
  for(let s=0;s<=seg;s++){const s0=s%seg,pa=P[i][(s0+1)%seg],pb=P[i][(s0+seg-1)%seg],pu=P[Math.min(n-1,i+1)][s0],pd=P[Math.max(0,i-1)][s0];
   const ax=pa[0]-pb[0],ay=pa[1]-pb[1],az=pa[2]-pb[2],ux=pu[0]-pd[0],uy=pu[1]-pd[1],uz=pu[2]-pd[2];
   let nx=uy*az-uz*ay,ny=uz*ax-ux*az,nz=ux*ay-uy*ax;const nl=Math.hypot(nx,ny,nz)||1;const ao=aof?aof(rings[i],s0/seg*TAU):1;
   vr.push({p:P[i][s0],n:[nx/nl,ny/nl,nz/nl],u:s/seg*rep,v:rings[i].yy/vs,c:[lc[0]*ao,lc[1]*ao,lc[2]*ao]});}
  V.push(vr);}
 const pv=q=>{K.pos.push(q.p[0],q.p[1],q.p[2]);K.nor.push(q.n[0],q.n[1],q.n[2]);K.uv.push(q.u,q.v);K.col.push(q.c[0],q.c[1],q.c[2]);};
 let tris=0;
 for(let i=0;i<n-1;i++)for(let s=0;s<seg;s++){const a0=V[i][s],a1=V[i][s+1],b0=V[i+1][s],b1=V[i+1][s+1];pv(a0);pv(b1);pv(a1);pv(a0);pv(b0);pv(b1);tris+=2;}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};
// a parametric SURFACE fn(u,v)->[x,y,z] over nu x nv cells, smooth normals, uv scaled
BIO.surf=function(fam,fn,nu,nv,col,opt){opt=opt||{};const K=BIO.buckets[fam];if(!K){BIO.err('BIO.surf: no bucket '+fam);return 0;}
 const P=[];for(let i=0;i<=nu;i++){const row=[];for(let j=0;j<=nv;j++)row.push(fn(i/nu,j/nv));P.push(row);}
 const nrm=(i,j)=>{const a=P[Math.min(nu,i+1)][j],b=P[Math.max(0,i-1)][j],c=P[i][Math.min(nv,j+1)],d=P[i][Math.max(0,j-1)];
  const ux=a[0]-b[0],uy=a[1]-b[1],uz=a[2]-b[2],vx=c[0]-d[0],vy=c[1]-d[1],vz=c[2]-d[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;return[nx/l,ny/l,nz/l];};
 const cc=_col3(col),uS=opt.uS||1,vS=opt.vS||1;let tris=0;
 const pv=(i,j)=>{const p=P[i][j],n=nrm(i,j);const c=opt.colFn?_col3(opt.colFn(i/nu,j/nv,p)):cc;
  K.pos.push(p[0],p[1],p[2]);K.nor.push(n[0],n[1],n[2]);K.uv.push(i/nu*uS,j/nv*vS);K.col.push(c[0],c[1],c[2]);};
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){if(opt.hole&&opt.hole((i+.5)/nu,(j+.5)/nv))continue;
  pv(i,j);pv(i+1,j+1);pv(i+1,j);pv(i,j);pv(i,j+1);pv(i+1,j+1);tris+=2;}
 K.tris+=tris;BIO.tally(tris,0,0);return tris;};

// ---------------------------------------------------------------- bake
// Turns the stores into meshes. Call once per host after every biome has
// built; a second call only emits what arrived since the first.
BIO.baked=[];
BIO.bake=function(){const T=BIO.host.THREE,scene=BIO.host.scene;if(!scene)throw new Error('BIO.bake: no scene (BIO.init({scene}) or BIO.setScene first)');let calls=0,inst=0;
 for(const name of BIO.order){const it=BIO.items[name];if(!it.count)continue;const def=BIO.defs[name];
  const geo=def.geo.clone();
  if(def.attrs&&it.n.length)geo.setAttribute('aN',new T.InstancedBufferAttribute(new Float32Array(it.n),3));
  if(def.attrs&&it.c2.length)geo.setAttribute('aC2',new T.InstancedBufferAttribute(new Float32Array(it.c2),3));
  const im=new T.InstancedMesh(geo,def.mat,it.count);
  im.instanceMatrix.array.set(it.m);im.instanceMatrix.needsUpdate=true;
  im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(it.c),3);
  im.frustumCulled=false;im.userData.biome=true;im.userData.inspectLabel=def.label;im.name='biome:'+name;
  scene.add(im);BIO.baked.push(im);calls++;inst+=it.count;
  BIO.items[name]={m:[],c:[],n:[],c2:[],count:0};}
 for(const fam in BIO.buckets){const K=BIO.buckets[fam];if(!K.pos.length)continue;
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(K.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(K.nor,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(K.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(K.col,3));
  g.computeBoundingSphere();
  const m=new T.Mesh(g,K.mat);m.frustumCulled=false;m.userData.biome=true;m.userData.inspectLabel=K.label;m.name='biome:'+fam;
  scene.add(m);BIO.baked.push(m);calls++;
  K.pos=[];K.nor=[];K.uv=[];K.col=[];}
 BIO.lastBake={calls,inst};return BIO.lastBake;};

Object.assign(BIO.fn,{qEuler,qFacing,qUp});
})();
// ================================================================= BIOME CORE — foliage
// What makes a card read as leaves. Ported from Girder's 60-trees.js and the
// Hexahedron's 71b-flora.js, with the three lessons those cost:
//   - LAMBERT, never Standard: a Standard card keeps a 4% specular at any
//     roughness and goes white at grazing angles, i.e. from under the canopy.
//   - two-sided light MIX, not a flip: a leaf seen from below is a lit,
//     translucent leaf, not the ground-hemisphere shadow a flipped normal gives.
//   - low-alpha texels carry the species' MID colour, or mipmapping bleeds a
//     black fringe round every leaf at distance; and alpha is boosted with
//     distance, or the far canopy thins to lace.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
BIO.WIND={t:{value:0}};
BIO.SUN={value:null};                 // set by BIO.setSun([x,y,z]); defaults at first use
BIO.setSun=function(v){const T=BIO.host.THREE;if(!BIO.SUN.value)BIO.SUN.value=new T.Vector3();BIO.SUN.value.set(v[0],v[1],v[2]).normalize();};
BIO._windTicked=false;
BIO._tickWind=function(){if(BIO._windTicked)return;BIO._windTicked=true;BIO.host.ticks(dt=>{BIO.WIND.t.value+=dt;});};

// ---------------------------------------------------------------- alpha textures
// draw(g,S) paints GREYSCALE leaves on a transparent canvas; the material's
// per-instance colour tints them. fillRGB fills the transparent texels.
BIO.alphaTex=function(S,draw,fillRGB){const T=BIO.host.THREE;
 const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.clearRect(0,0,S,S);draw(g,S);
 const d=g.getImageData(0,0,S,S).data,out=new Uint8Array(S*S*4);
 for(let o=0;o<out.length;o+=4){const a=d[o+3];
  if(a<48){out[o]=fillRGB[0];out[o+1]=fillRGB[1];out[o+2]=fillRGB[2];}else{out[o]=d[o];out[o+1]=d[o+1];out[o+2]=d[o+2];}
  out[o+3]=a;}
 const t=new T.DataTexture(out,S,S,T.RGBAFormat);
 t.encoding=T.sRGBEncoding;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;
 t.anisotropy=4;t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
// a COLOUR canvas texture (bark, ground), repeat-wrapped
BIO.canvasTex=function(w,h,fn,rep){const T=BIO.host.THREE;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.encoding=T.sRGBEncoding;if(rep)t.repeat.set(rep,rep);return t;};
// drawing helpers for leaf textures
BIO.tex={
 grey(l){l=clamp(Math.round(l),0,255);return'rgb('+l+','+l+','+l+')';},
 leaf(g,x,y,len,wid,ang,lum,rib){g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.45,wid,len,0);g.quadraticCurveTo(len*.45,-wid,0,0);g.fill();
  if(rib){g.strokeStyle=BIO.tex.grey(lum*.72);g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(len*.92,0);g.stroke();}
  g.restore();},
 cl:[],
 clusters(S,n,k){BIO.tex.cl=[];for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.3,.3),r=S*.5*k*(i%3===0?rr(0,.35):rr(.55,1));BIO.tex.cl.push([S/2+Math.cos(a)*r,S/2+Math.sin(a)*r]);}},
 clPt(S,sd,lim){const c=pick(BIO.tex.cl),a=rr(0,TAU),r=sd*S*Math.sqrt(-2*Math.log(1-rng()*.98))*.6;
  let x=c[0]+Math.cos(a)*r,y=c[1]+Math.sin(a)*r;const d=Math.hypot(x-S/2,y-S/2),m=S*.5*lim;if(d>m){x=S/2+(x-S/2)*m/d;y=S/2+(y-S/2)*m/d;}
  return[x,y,Math.atan2(y-c[1],x-c[0])];},
 discPt(S,k){const a=rr(0,TAU),r=S*.5*k*Math.sqrt(rng());return[S/2+Math.cos(a)*r,S/2+Math.sin(a)*r,a];}
};

// ---------------------------------------------------------------- card geometries
BIO.geo={};
// leaf clump: a tripod of three tilted unit quads
BIO.geo.clump=function(){const T=BIO.host.THREE,pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const az=k/3*TAU+.3,tilt=.92,ca=Math.cos(az),sa=Math.sin(az);
  const n=[Math.sin(tilt)*ca,Math.cos(tilt),Math.sin(tilt)*sa],u=[-sa,0,ca],v=[-Math.cos(tilt)*ca,Math.sin(tilt),-Math.cos(tilt)*sa];
  const c=[n[0]*.10,n[1]*.10-.04,n[2]*.10];
  const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[c[0]+u[0]*q[0]+v[0]*q[1],c[1]+u[1]*q[0]+v[1]*q[1],c[2]+u[2]*q[0]+v[2]*q[1],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(n[0],n[1],n[2]);});}
 return BIO.geo._make(pos,nor,uv);};
BIO.geo._make=function(pos,nor,uv,col){const T=BIO.host.THREE,g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 if(col)g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;};
// hanging raceme / strand: two crossed quads, local y 0 (hung) .. -1
BIO.geo.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.4),sa=Math.sin(k*Math.PI/2+.4);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a hanging RIBBON: origin at the top, running down to y=-1 in nseg tapering
// quads, drifting in z so a curtain of them is not a plank; texture repeats
// once per segment so a long one reads as a chain of leaves
BIO.geo.ribbon=function(nseg,taper,drift){const pos=[],uv=[],nor=[];nseg=nseg||4;taper=taper==null?.55:taper;drift=drift==null?.18:drift;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.5*lerp(1,taper,t),z=Math.sin(t*3.1)*drift;P.push([-w,-t,z],[w,-t,z]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[c,0,1],[b,1,0],[b,1,0],[c,0,1],[d,1,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,0,1);});}
 return BIO.geo._make(pos,nor,uv);};
// an arching FROND: pinned at the origin, arching along +x to x=1 and down
BIO.geo.frond=function(nseg){const pos=[],uv=[],nor=[];nseg=nseg||3;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.16*Math.sin(t*Math.PI)*.9+.02,y=.32*Math.sin(t*2.2)-.22*t*t;P.push([t,y,-w],[t,y,w]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[b,1,0],[c,0,1],[b,1,0],[d,1,1],[c,0,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a MOSS MAT: a fan of quads in the xz plane, front face UP (winding matters:
// the Hexahedron lost 18k of these to a reversed fan). Flip pi about x for a soffit.
BIO.geo.mat=function(){const pos=[],uv=[],nor=[];const N=7;
 for(let s=0;s<N;s++){const a0=s/N*TAU,a1=(s+1)/N*TAU,r0=rr(.7,1),r1=rr(.7,1);
  const A=[0,0,0],B=[Math.cos(a0)*r0,rr(0,.08),Math.sin(a0)*r0],C=[Math.cos(a1)*r1,rr(0,.08),Math.sin(a1)*r1];
  [[A,.5,.5],[C,.5+C[0]*.5,.5+C[2]*.5],[B,.5+B[0]*.5,.5+B[2]*.5]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a BUSH LOBE: a squat 6-sided dome, origin at the ground
BIO.geo.lobe=function(){const T=BIO.host.THREE;const g=new T.SphereGeometry(1,7,4,0,TAU,0,Math.PI*.55);g.scale(1,.8,1);return g;};
// a BLOOM: a diamond of two quads, origin at the centre
BIO.geo.bloom=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2),sa=Math.sin(k*Math.PI/2);
  const P=[[-.5,0],[0,.5],[.5,0],[0,-.5]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a POD on its stalk: local y 0 (hung) .. -1, vertex-coloured (stalk dark, pod white)
BIO.geo.pod=function(){const T=BIO.host.THREE;
 const parts=[[new T.CylinderGeometry(.012,.012,.5,3,1,true).translate(0,-.25,0),.16],[new T.SphereGeometry(.15,6,4).scale(1,1.75,1).translate(0,-.735,0),1]];
 const pos=[],nor=[],col=[],uv=[];
 parts.forEach(p=>{const g=p[0].toNonIndexed(),a=g.attributes.position.array,b=g.attributes.normal.array,u=g.attributes.uv.array;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);
   const sh=p[1]===1?(.78+.22*Math.sin(Math.atan2(a[i+2],a[i])*5))*lerp(.72,1,clamp((a[i+1]+1)/.5,0,1)):p[1];col.push(sh,sh,sh);}
  for(let j=0;j<u.length;j++)uv.push(u[j]);});
 return BIO.geo._make(pos,nor,uv,col);};
// a unit cylinder along y, centred (for BIO.beam)
BIO.geo.rod=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.5,.5,1,n||7);};
// a tapering trunk from y=0 up to y=1
BIO.geo.trunk=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.16,.4,1,n||8).translate(0,.5,0);};

// ---------------------------------------------------------------- the foliage hook
// o: { aN:bool, irid:bool, swayW:'glsl expr', swayA:0.2, axis:0|1, dist:bool }
//   swayW  weight of the displacement per vertex: '1.0' for a clump, '(-position.y)'
//          for something hung from y=0, '(position.x)' for a frond pinned at x=0
//   axis   which instanceMatrix column sets the amplitude (1 for a long thin hang)
BIO.foliageHook=function(o){o=o||{};
 return function(sh){
  sh.uniforms.uWindT=BIO.WIND.t;
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);
  sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (o.aN?'attribute vec3 aN;\nvarying vec3 vFlN;\n':'')+(o.irid?'attribute vec3 aC2;\nvarying vec3 vFlC2;\n':''))
   .replace('#include <project_vertex>',[
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    'float _sc = 1.0; float _ph = 0.0;',
    '#ifdef USE_INSTANCING',
    '  mvPosition = instanceMatrix * mvPosition;',
    '  _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
    '  _sc = length(instanceMatrix['+(o.axis||0)+'].xyz);',
    '#endif',
    'float _wg = '+(o.swayW||'1.0')+';',
    'mvPosition.xyz += _wg * _sc * vec3(',
    '   sin(uWindT*0.9+_ph) + 0.45*sin(uWindT*2.3+_ph*1.7+position.x*5.0),',
    '   0.40*sin(uWindT*1.6+_ph*0.6+position.z*5.0),',
    '   cos(uWindT*0.7+_ph*1.3) + 0.45*sin(uWindT*2.9+_ph+position.y*5.0) ) * '+(o.swayA==null?.06:o.swayA).toFixed(3)+';',
    'vFlWP = (modelMatrix * mvPosition).xyz;',
    o.aN?'vFlN = aN;':'',o.irid?'vFlC2 = aC2;':'',
    'mvPosition = modelViewMatrix * mvPosition;',
    'vFlD = -mvPosition.z;',
    'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  // the lighting normal: the clump's own (aN, world space, so it shades as a
  // lit mass), or the card normal bent toward world-up for anything without one
  if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','vec3 transformedNormal = normalize(normalMatrix * aN);');
  else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n'+
   '{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0)); transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nuniform vec3 uSunDir;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (o.aN?'varying vec3 vFlN;\n':'')+(o.irid?'varying vec3 vFlC2;\n':''))
   .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a *= 1.0 + clamp(vFlD/650.0, 0.0, 1.1);')
   .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
   .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
  // IRIDESCENCE (prism gum): green facing the sun, the second colour away from
  // it and at grazing view angles, shimmering slowly in the wind
  if(o.irid)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',[
   '#include <color_fragment>',
   '{ vec3 _V = normalize(cameraPosition - vFlWP); vec3 _N = normalize('+(o.aN?'vFlN':'vec3(0.0,1.0,0.0)')+');',
   '  float _fr = 1.0 - abs(dot(_N,_V));',
   '  float _sf = dot(_N, uSunDir)*0.5 + 0.5;',
   '  float _sh = 0.16*sin(uWindT*0.8 + dot(vFlWP, vec3(0.045,0.083,0.037))) + 0.08*sin(uWindT*1.9 + dot(vFlWP, vec3(-0.21,0.13,0.17)));',
   '  float _k = smoothstep(0.22, 0.78, _sf*1.15 - _fr*0.80 + 0.30 + _sh);',
   '  diffuseColor.rgb *= mix(vFlC2, vColor, _k) / max(vColor, vec3(0.004)); }'].join('\n'));
 };};
// a foliage MATERIAL: Lambert, alpha-tested, double-sided, hooked. Each key
// compiles its own program (different hooks on different materials need
// different cache keys or three silently shares one).
BIO.leafMat=function(tex,key,o){const T=BIO.host.THREE;o=o||{};
 const m=new T.MeshLambertMaterial({color:0xffffff,map:tex||null,alphaTest:o.alphaTest==null?.42:o.alphaTest,side:T.DoubleSide,vertexColors:!!o.vertexColors});
 m.onBeforeCompile=BIO.foliageHook(o);m.customProgramCacheKey=function(){return'biofol|'+key;};
 BIO._tickWind();return m;};
// a BARK / WOOD material for merged buckets: Lambert, vertex-coloured, textured
BIO.barkMat=function(tex,col){const T=BIO.host.THREE;return new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,vertexColors:true,side:T.DoubleSide});};
// a plain material for instanced solids (rods, lobes, boulders)
BIO.solidMat=function(tex,col){const T=BIO.host.THREE;return new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,side:T.DoubleSide});};

})();
// ================================================================= BIOME CORE — placement
// Where things go. Ported from the Hexahedron's forest rebuild (the forest is
// PLACEMENT, not plants) and Girder's keep-clear tests.

// SPECIES COME IN STANDS. A per-tree random draw mixes species so evenly the
// eye integrates them back into one colour; an fbm patch field a few hundred
// metres across picks a dominant species with a fraction off-pattern.
// fbm is bell-shaped (mean .5, sd ~.11): splitting its raw value n ways gave
// 1/27/53/20 % for four species. The value is stretched through the middle of
// the bell first so the n bands come out roughly even.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
BIO.standAt=function(x,z,n,scale,seed){scale=scale||.0017;const f=fbm(x*scale+31,z*scale-19,seed||9483,2);
 const u=smooth(.30,.70,f);return clamp(Math.floor(u*n),0,n-1);};
BIO.stand=function(x,z,n,off,scale,seed){return rng()<(off==null?.26:off)?Math.floor(rng()*n):BIO.standAt(x,z,n,scale,seed);};

// A JITTERED GRID over a disc [rIn,rOut] round the origin: one candidate per
// cell, jittered, tested against the host mask, an fbm patch mask (the floor
// is patchy) and `accept(x,z,d)->0..1`. Even coverage with no clumps of
// rejection-sampling luck, and the count is predictable from the cell size.
BIO.grid=function(cell,rIn,rOut,accept,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),N=Math.ceil(rOut*2/cell);let n=0;
 const pk=opt.patch==null?.85:opt.patch,ps=opt.patchScale||.016;
 const B=opt.box;   // optional [x0,z0,x1,z1] window (a zone strip); cells outside it cost nothing
 let ix0=0,ix1=N-1,iz0=0,iz1=N-1;
 if(B){ix0=Math.max(0,Math.floor((B[0]-(o[0]-rOut))/cell));ix1=Math.min(N-1,Math.ceil((B[2]-(o[0]-rOut))/cell));iz0=Math.max(0,Math.floor((B[1]-(o[1]-rOut))/cell));iz1=Math.min(N-1,Math.ceil((B[3]-(o[1]-rOut))/cell));}
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){
  const x=o[0]-rOut+(ix+rng())*cell,z=o[1]-rOut+(iz+rng())*cell,u=rng();
  if(B&&(x<B[0]||z<B[1]||x>B[2]||z>B[3]))continue;
  const d=Math.hypot(x-o[0],z-o[1]);if(d<rIn||d>rOut)continue;
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*fbm(x*ps+7,z*ps-3,9484,2):1;
  const a=accept?accept(x,z,d):1;
  if(u>a*m*clamp(patch,0,1.15))continue;
  if(!BIO.clearOf(x,z,opt.pad||0))continue;
  fn(x,BIO.terrainH(x,z),z,d);n++;}
 return n;};
// POISSON-ish scatter of n points with a minimum spacing, area-uniform in the
// annulus, biased outward by `pow` (>1 pushes the crowd out)
BIO.scatter=function(n,rIn,rOut,minD,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),P=[];let tries=0;
 while(P.length<n&&tries++<n*40){const a=rng()*TAU,u=Math.pow(rng(),opt.pow||1);
  const r=Math.sqrt(lerp(rIn*rIn,rOut*rOut,u)),x=o[0]+Math.cos(a)*r,z=o[1]+Math.sin(a)*r;
  if(rng()>BIO.mask(x,z))continue;if(!BIO.clearOf(x,z,opt.pad||0))continue;
  let ok=true;for(const q of P)if(Math.hypot(x-q[0],z-q[1])<minD){ok=false;break;}
  if(!ok)continue;P.push([x,z]);fn(x,BIO.terrainH(x,z),z,r);}
 return P;};
// keep-clear: outside every host obstacle cylinder (plus pad), on the ground
BIO.clearOf=function(x,z,pad){const O=BIO.host.obstacles;pad=pad||0;
 for(let i=0;i<O.length;i++){const q=O[i];if(Math.hypot(x-q.x,z-q.z)<q.r+pad)return false;}return true;};
// keep-clear in 3D: a blob of horizontal radius rad, half-height vr at (x,y,z)
BIO.clearOf3=function(x,y,z,rad,vr){const O=BIO.host.obstacles;
 for(let i=0;i<O.length;i++){const q=O[i];if(q.y0!=null&&(y+vr<q.y0||y-vr>q.y1))continue;
  if(Math.hypot(x-q.x,z-q.z)<q.r+rad)return false;}return true;};

// ---------------------------------------------------------------- surface sampling
// For growing on a structure the host hands over as BufferGeometry[] in world
// space. Samples by triangle area, then filters by facing:
//   upFaces    normal.y > minUp   (ledges, treads, roofs)      -> moss, plants
//   downFaces  normal.y < -minDown (soffits, ceilings)          -> mats, curtains
//   sideFaces  |normal.y| < .35                                 -> vines, brackets
// Each sample: {p:[x,y,z], n:[nx,ny,nz], a:area}
BIO.faceSamples=function(geos,n,filt){const out=[];const F=[];let tot=0;
 for(const g of geos){const p=g.attributes.position;if(!p)continue;const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.count;
  for(let i=0;i<cnt;i+=3){const a=idx?idx[i]:i,b=idx?idx[i+1]:i+1,c=idx?idx[i+2]:i+2;
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   if(filt&&!filt(nx,ny,nz))continue;
   const ar=l*.5;tot+=ar;F.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,ar,tot]);}}
 if(!F.length)return out;
 for(let k=0;k<n;k++){const r=rng()*tot;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi)>>1;if(F[m][13]<r)lo=m+1;else hi=m;}
  const f=F[lo];let u=rng(),v=rng();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;
  out.push({p:[f[0]*w+f[3]*u+f[6]*v,f[1]*w+f[4]*u+f[7]*v,f[2]*w+f[5]*u+f[8]*v],n:[f[9],f[10],f[11]],a:f[12]});}
 return out;};
BIO.upFaces=function(geos,n,minUp){return BIO.faceSamples(geos,n,(nx,ny,nz)=>ny>(minUp==null?.62:minUp));};
BIO.downFaces=function(geos,n,minDown){return BIO.faceSamples(geos,n,(nx,ny,nz)=>ny<-(minDown==null?.62:minDown));};
BIO.sideFaces=function(geos,n){return BIO.faceSamples(geos,n,(nx,ny,nz)=>Math.abs(ny)<.35);};
// LEDGE POINTS: the outer edges of up-facing faces -- where a vine roots and
// hangs off. Found as up-face samples that have empty air just outboard of them
// (no up-face within `gap` metres in the direction away from the surface's centroid).
BIO.ledgePoints=function(geos,n,gap){gap=gap||2.5;const S=BIO.upFaces(geos,n*4,.62);if(!S.length)return[];
 let cx=0,cz=0;S.forEach(s=>{cx+=s.p[0];cz+=s.p[2];});cx/=S.length;cz/=S.length;
 const cell=gap,H={};const key=(x,y,z)=>(Math.floor(x/cell))+','+(Math.floor(y/(cell*2)))+','+(Math.floor(z/cell));
 S.forEach(s=>{H[key(s.p[0],s.p[1],s.p[2])]=1;});
 const out=[];
 for(const s of S){if(out.length>=n)break;const dx=s.p[0]-cx,dz=s.p[2]-cz,l=Math.hypot(dx,dz)||1;const ox=dx/l,oz=dz/l;
  if(!H[key(s.p[0]+ox*gap,s.p[1],s.p[2]+oz*gap)])out.push({p:s.p,n:[ox,0,oz]});}
 return out;};

})();
// ================================================================= DALAB — the biome host binding (southwestern lowlands)
// BIO.init must run after THREE exists and BEFORE the lowlands fragments (86-bio-50+), which build their textures
// against BIO.host.THREE at load. The scene arrives later (BIO.setScene in 94-dalab-light, which also bakes). The
// kit plants nothing by zone here: the gardens ask for species by name at explicit points (SWLOW.treeAt /
// SWLOW.plantAt), so the mask and the fields are constants. The wind tick is queued until FRAME_HOOKS exists.
const BIO_TICKS=[];
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>terrainH(x,z),mask:(x,z)=>1,obstacles:[],
 ticks:fn=>BIO_TICKS.push(fn),seed:31,origin:[[0,0]],center:[0,0],
 fields:{wet:(x,z)=>.55,tropic:(x,z)=>.35,dry:(x,z)=>.3,salt:(x,z)=>0,flow:(x,z)=>0,upland:(x,z)=>.2},
 err:m=>reportErr('biome: '+m),
 stat:(k,tris,inst)=>{const t=TSTAT.by['biome/'+k.replace('lowlands/','')]||(TSTAT.by['biome/'+k.replace('lowlands/','')]={tris:0,inst:0,meshes:0});t.tris+=tris;t.inst+=inst;}});
// local -> world for a builder planting in its own frame (VERN.cur carries the plot transform)
function dnWorld(lx,ly,lz){const c=VERN.cur;if(!c)return[lx,ly,lz];const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);return[p[0],(c.o.y||0)+ly*s,p[1]];}
// a garden tree registers through the biome's own REGISTER; the entry is adopted as flora of the site (cls 'flora' keeps
// it out of the labels but in the inspector and the tag audit)
function dnTree(species,lx,ly,lz,opt){const w=dnWorld(lx,ly,lz);if(opt&&opt.bias!=null)opt.bias+=VERN.cur?VERN.cur.ry:0;const r0=REG.length;let T=null;
 try{T=SWLOW.treeAt(species,w[0],w[1],w[2],opt);}catch(e){reportErr('tree '+species+': '+e.message);}
 const c=VERN.cur;for(let i=r0;i<REG.length;i++){const r=REG[i];r.cls='flora';if(c){r.key=c.D.key;r.tags=Object.assign({},c.D.tags,{type:['garden'],part:'garden'});}}return T;}
function dnPlant(kind,lx,ly,lz,opt){const w=dnWorld(lx,ly,lz);try{return SWLOW.plantAt(kind,w[0],w[1],w[2],opt);}catch(e){reportErr('plant '+kind+': '+e.message);return false;}}
// ================================================================= SOUTHWESTERN LOWLANDS — species (data + kit items)
// Krator's southwestern lowlands: the shore of the inland sea, a brief strip of
// rainforest and bayou, a broad humid-subtropical plain, and Mediterranean
// hills under the Outer Wall. A more terrestrial country than the hyperjungle
// or the abyss, and the plants are nearly ones we know -- live oak, banyan,
// willow, mangrove, cypress, manzanita, madrone, cork oak, fan palm -- but two
// things say this is not Earth:
//   WIDTH.  The mature trees are enormously WIDE rather than tall. A sprawl oak
//           is twenty-odd metres high and eighty across; its limbs run out along
//           the ground and rise again. You are small here by width.
//   BARK.   Brown, pale, and blood red, in every shade and finish: lacquered
//           red mangrove roots, charred-and-red manzanita, madrone and gum
//           flayed red over green-white, copper ringbark banded with pale
//           lenticels, cork oaks stripped to a raw orange-red.
// Everything here is DATA and kit definitions; no placement. Tags follow the
// project rule (climate / aridity / abyssal / riparian) and are honoured by
// the placement passes.
var SWLOW={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWLOW.TAGS={climate:'tropic..temperate',aridity:'semiarid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- the climate this biome reads
// Beyond the core's wet / salt / upland the lowlands zone themselves on
// tropic (frost-free heat), dry (summer drought) and flow. A world that binds
// none of them still gets a sensible default: humid subtropical everywhere.
// (Additive: the core's own defaults are left alone.)
const FD=BIO.fieldDefault;
if(!FD.tropic)FD.tropic=(x,z)=>0;
if(!FD.dry)FD.dry=(x,z)=>0;
if(!FD.flow)FD.flow=(x,z)=>0;

// ---------------------------------------------------------------- palettes
const PAL=SWLOW.PAL={
 // foliage, by habit
 oak:[0x2c4824,0x34522a,0x263f1f,0x3c5a2e,0x304a30],
 fig:[0x2d5a2a,0x386a30,0x264e28,0x42703a],
 mangrove:[0x2c5a30,0x366a36,0x244e2a,0x3e7040],
 kapok:[0x4e7c38,0x5a8a3e,0x426e32,0x6a9444],
 cypress:[0x5a7a34,0x66883c,0x4e6e2e,0x728e44],
 gum:[0x4a6a54,0x587460,0x40604e,0x5e7a58],          // a blue-grey-green, glaucous
 willow:[0x7a9c44,0x8aaa4c,0x6a8c3a,0x9ab658],
 ring:[0x4a6c30,0x567a36,0x3e602a],
 sycamore:[0x5a7c3a,0x688a42,0x4e6e34],
 manz:[0x788e6e,0x86a07a,0x6a8468,0x94aa84],          // grey-green, leathery
 madrone:[0x365a2a,0x40662e,0x2e5026,0x4a7034],
 cork:[0x3a4c36,0x44563c,0x32442e,0x4c5e42],
 palm:[0x5a7c52,0x68885a,0x4e6c48,0x7a9460,0x8aa4a8,0x9ab4b4],   // the last two: a silver-blue fan (Bismarck)
 needle:[0x2c4a3e,0x345444,0x284238,0x3c5a48],
 pineNeedle:[0x5a7a3a,0x668a42,0x4e6e34],
 crimson:[0x9a1e18,0xb02a1c,0x8a1a1a,0xc03a20,0xa82818],
 mimosa:[0x6a8a3a,0x7a9a44,0x5e7e34],
 glossy2:[0x3a6a30,0x447a36,0x325e2a,0x4e8440],
 stargum:[0x3e6a2e,0x4a7a34,0x5a8a3a,0x8a4a26,0x9a3a22],   // green with a flush of red stars
 bay:[0x4a5e3e,0x546a46,0x405436,0x5e7450],
 magnolia:[0x264622,0x2e5228,0x223e1e,0x365a2c],
 flame:[0xe8401c,0xf0501e,0xd83018,0xf07020],
 jacaranda:[0x8a70d8,0x9a80e0,0x7a60c8,0xa890e8],
 magWhite:[0xf6f2e6,0xf2ecdc,0xfaf6ee],
 cane:[0x3a7a3a,0x488a40,0x2e6a34,0x56943e],
 // a flush of new growth: bronze and red on the oaks, figs and madrones
 flush:[0x8a4a2a,0x9a5a30,0x7a3a26,0xa0643a],
 // understorey
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c],
 aroid:[0x2e6a34,0x3a7a3a,0x286030,0x468440],
 palmetto:[0x4a7a4a,0x5a8a50,0x3e6a42,0x6a9a5a],
 grassGreen:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44],
 grassGold:[0xb89a58,0xc8aa62,0xa88a4a,0xd0b46c,0x9a8448],
 chapRed:[0x8a3a24,0x9a4a2a,0x7a3020,0xa85a30],
 stipa:[0xd8d0a4,0xe4dcb4,0xccc294],
 mullein:[0xf0d030,0xf4dc48,0xe8c428],
 aloe:[0xf06a1c,0xf48a24,0xe85418],
 pincushion:[0xe8401c,0xf0601e,0xd83018],
 sage:[0x8a9a88,0x9aaa96,0x7a8a7a,0xa4b09c],
 chap:[0x3e4e30,0x4a5a36,0x36462c,0x546440],
 agave:[0x6a8a8a,0x7a9a96,0x5a7a7c,0x88a4a0],
 reed:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44,0x3e5a28],
 // blooms (Krator saturates them a notch)
 azalea:[0xe0508a,0xf06aa0,0xd8406c,0xf4f0f0,0xe87830],
 heliconia:[0xd8301c,0xe85a1c,0xf0b020,0xc81e3a],
 poppy:[0xf08a1c,0xf4a020,0xe8701a,0xf4c040],
 lupin:[0x6a50c0,0x7a60d0,0x5a44a8,0x8a70d8],
 blossom:[0xf4c8d4,0xf0b0c4,0xf8e4ea,0xe898b4],
 iris:[0x7a4ac8,0x6a3ab0,0x9a6ad8],
 hyacinth:[0x9a7ae0,0xaa8ae8,0x8a6ad0],
 cream:[0xf4ecd4,0xf0e4c4,0xe8dcb8],
 berry:[0xc82a1e,0xd8401e,0xb01c18],
 // everything else
 moss:[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a,0x557a3c],
 mossPale:[0x8a9a7a,0x9aa888,0x7a8a6e,0xa4ae92],       // Spanish moss: grey-green
 duckweed:[0x6a9a2a,0x7aaa32,0x5a8a24],
 pad:[0x3a6a3a,0x4a7a40,0x2e5a30,0x5a8a44],
 rock:[0x8a7a66,0x7a6c5a,0x9a8a74,0x6c5e4e],          // sandstone
 rockRed:[0x9a5a3e,0x8a4e36,0xa86a4a],
 litter:[0x4a3624,0x5a4028,0x3a2c1c,0x6a4a2e],
 fungus:[0xa08464,0x8d6a5e,0xb89a70,0xd8b878],
 deadwood:[0x6a5a4a,0x5a4c3e,0x7a6856,0x8a7a66],     // silvered
 vine:[0x3d5a2a,0x2f4a24,0x4a6a30],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bk the bark bucket, bark the
// designer's colours (what the bark should LOOK like: the material does the
// light rig's arithmetic), leaf the foliage set.
SWLOW.SPECIES=[
 /*0*/{key:'mangrove',name:'Lantern mangrove',H:[9,16],rb:[.45,.8],crownR:[9,15],bk:'bk_lacquer',bark:[0x8e2418,0x9a2e1a,0x7a1e16,0xa83a20],
  leaf:PAL.mangrove,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*1*/{key:'cypress',name:'Knee-cypress',H:[26,40],rb:[1.3,2.1],crownR:[14,22],bk:'bk_stringy',bark:[0x8a5a3e,0x7a4e36,0x9a6a4a],
  leaf:PAL.cypress,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*2*/{key:'kapok',name:'Parasol kapok',H:[48,66],rb:[2.2,3.2],crownR:[28,40],bk:'bk_pale',bark:[0xa8aa96,0x9aa08a,0xb4b4a0],
  leaf:PAL.kapok,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'no'}},
 /*3*/{key:'gum',name:'Ribbon gum',H:[38,56],rb:[1.1,1.8],crownR:[14,20],bk:'bk_strip',bark:[0xa03226,0xb03c2a,0x8a2a26,0x9a4a34],
  leaf:PAL.gum,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*4*/{key:'canepalm',name:'Lacquer cane palm',H:[5,12],rb:[.08,.14],crownR:[2.6,4.2],bk:'bk_cane',bark:[0xc8b040,0xb8a438,0xd4c050],
  crownshaft:[0xc81e14,0xd82818,0xb81810],leaf:PAL.cane,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*5*/{key:'sprawloak',name:'Sprawl oak',H:[28,38],rb:[2.5,3.8],crownR:[36,50],bk:'bk_furrow',bark:[0x4a3226,0x563a2a,0x40302a,0x5e3a2a],
  leaf:PAL.oak,moss:1,touch:.45,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*6*/{key:'pillarfig',name:'Pillar fig',H:[22,32],rb:[1.6,2.4],crownR:[26,40],bk:'bk_pale',bark:[0x9a9a8a,0x8e9082,0xa6a494],
  leaf:PAL.fig,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*7*/{key:'willow',name:'Veil willow',H:[14,22],rb:[.9,1.4],crownR:[12,18],bk:'bk_furrow',bark:[0x6a4a30,0x5a4030,0x7a5234],
  leaf:PAL.willow,twig:[0xd07a2a,0xe08a30,0xc86a24],tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*8*/{key:'ringbark',name:'Copper ringbark',H:[9,16],rb:[.35,.6],crownR:[8,13],bk:'bk_ring',bark:[0x8a3a22,0x9a4424,0x7a3020,0xa4502a],
  leaf:PAL.ring,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*9*/{key:'sycamore',name:'Ghost sycamore',H:[20,32],rb:[.9,1.5],crownR:[14,22],bk:'bk_mottle',bark:[0x8a8458,0x7a7a52,0x9a8e62],
  leaf:PAL.sycamore,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'yes'}},
 /*10*/{key:'manzanita',name:'Ember manzanita',H:[3,7],rb:[.12,.26],crownR:[3,6],bk:'bk_ember',bark:[0xb0301a,0xc03c1e,0x9a2a18,0xc84a24],
  leaf:PAL.manz,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*11*/{key:'madrone',name:'Flayed madrone',H:[13,22],rb:[.6,1.0],crownR:[10,16],bk:'bk_flay',bark:[0xb84a24,0xc4582a,0xa83e22],
  leaf:PAL.madrone,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*12*/{key:'corkoak',name:'Cork oak',H:[9,16],rb:[.7,1.1],crownR:[10,16],bk:'bk_cork',bark:[0x8a8274,0x7e766a,0x968c7c],
  stripped:[0xc4401e,0xb83818,0xd0521e,0x9a3a20],leaf:PAL.cork,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*13*/{key:'skirtpalm',name:'Skirt palm',H:[4,9],rb:[.45,.75],crownR:[5,8],bk:'bk_fibre',bark:[0x6a5a48,0x5e5040,0x7a6a54],
  leaf:PAL.palm,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*14*/{key:'coastoak',name:'Coast oak',H:[15,22],rb:[1.1,1.8],crownR:[16,28],bk:'bk_furrow',bark:[0x5a5048,0x4e463e,0x665a50],
  leaf:PAL.cork,moss:.25,touch:.15,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*15*/{key:'pompom',name:'Pompom cycad',H:[4,8],rb:[.35,.6],crownR:[2.4,3.6],bk:'bk_fibre',bark:[0x7a6a58,0x6a5c4c,0x86765e],
  leaf:[0x2e5a34,0x386a3a,0x2a5030,0x44703e],bloom:[0xc8201c,0xd8301e,0xb81818],tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*16*/{key:'cedar',name:'Tier cedar',H:[18,30],rb:[1.0,1.6],crownR:[16,26],bk:'bk_furrow',bark:[0x5a4a44,0x4e4240,0x66564c],
  leaf:PAL.needle,tiers:[4,6],item:'needle',tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*17*/{key:'pine',name:'Flatwood pine',H:[24,34],rb:[.42,.7],crownR:[6,10],bk:'bk_plate',bark:[0x9a4a2e,0x8a4230,0xa85a38],
  leaf:PAL.pineNeedle,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*18*/{key:'crimson',name:'Crimson ghost',H:[12,20],rb:[.7,1.1],crownR:[12,18],bk:'bk_crack',bark:[0xe2d8c2,0xd8ceb6,0xece2cc],
  leaf:PAL.crimson,tiers:[3,5],item:'glossy',tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*19*/{key:'rattlepod',name:'Rattle-pod',H:[8,14],rb:[.4,.7],crownR:[10,16],bk:'bk_furrow',bark:[0x5a4a3e,0x4e4036,0x66564a],
  leaf:PAL.mimosa,pod:[0x8a2a1c,0x9a3a22,0x7a2418,0xa84a2a],tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*20*/{key:'eyed',name:'Eyed beech',H:[16,26],rb:[.6,1.0],crownR:[10,15],bk:'bk_ocelli',bark:[0xb09a78,0xa48e6c,0xbca684],
  leaf:PAL.sycamore,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 // the crown-flowering trees: flowers at the branch ends, in the crown, as a flowering tree has them
 /*21*/{key:'flame',name:'Flame parasol',H:[10,15],rb:[.7,1.1],crownR:[16,24],bk:'bk_pale',bark:[0x9a948a,0x8e887e,0xa8a296],
  leaf:PAL.mimosa,flower:PAL.flame,bloomK:.45,pod:[0x3a2a1c,0x4a3424,0x2e2218],tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*22*/{key:'jacaranda',name:'Violet jacaranda',H:[12,18],rb:[.5,.85],crownR:[11,16],bk:'bk_furrow',bark:[0x6a5a4e,0x5e5046,0x76665a],
  leaf:PAL.mimosa,flower:PAL.jacaranda,bloomK:.72,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*23*/{key:'magnolia',name:'Lantern magnolia',H:[18,26],rb:[.7,1.1],crownR:[9,14],bk:'bk_pale',bark:[0x8e928a,0x82867e,0x9a9e94],
  leaf:PAL.magnolia,flower:PAL.magWhite,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 // canopy cover for the plain and the hills
 /*24*/{key:'sunburn',name:'Sunburn tree',H:[16,24],rb:[.9,1.4],crownR:[14,20],bk:'bk_lacquer',bark:[0xb0482a,0xa04028,0xc05a34,0x9a3c2a],
  leaf:PAL.glossy2,tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*25*/{key:'stargum',name:'Star gum',H:[24,34],rb:[.9,1.4],crownR:[12,18],bk:'bk_cork',bark:[0x8a8478,0x7e786e,0x968e80],
  leaf:PAL.stargum,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*26*/{key:'baylaurel',name:'Bay laurel',H:[14,22],rb:[.8,1.3],crownR:[12,20],bk:'bk_pale',bark:[0x8e948a,0x82887e,0x9aa094],
  leaf:PAL.bay,moss:.1,touch:.08,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(510011);
const TX={};
/* dense small elliptic leaves -- the oaks */
TX.oakleaf=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,12,.68);   // small leaves: a live oak's are a few cm, and a clump is 8 m across
 for(let i=0;i<1500;i++){const c=BIO.tex.clPt(S,.12,.94),lum=lerp(95,240,i/1500)+rr(-20,12);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(4.5,7),rr(2.5,4),rr(0,TAU),0,TAU);g.fill();}},[150,150,150]);
/* broad glossy ovate leaves in clusters -- figs, mangroves, madrones */
TX.glossy=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(105,242,i/60)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,58),rr(15,20),a0+(k-(n-1)/2)*.8,lum*rr(.9,1.05),true);}},[160,160,160]);
/* broad lobed leaves -- kapok, sycamore, ringbark */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<54;i++){const c=BIO.tex.clPt(S,.10,.72),lum=lerp(110,238,i/54)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(44,66),rr(16,22),a0+(k-(n-1)/2)*.75,lum*rr(.9,1.05),true);}},[165,165,165]);
/* feathery sprays -- the cypress */
TX.feather=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<78;i++){const p=BIO.tex.clPt(S,.09,.62),a=p[2]+rr(-.7,.7),L=rr(50,86),lum=lerp(110,235,i/78)+rr(-18,18);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=4;s<L;s+=3.4){const t=s/L,nl=lerp(14,5,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=1.8;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.15;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[130,130,130]);
/* hanging sickle leaves in loose bunches -- the flayed gum */
TX.lance=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<70;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/70)+rr(-15,12),n=ri(4,7);
  for(let k=0;k<n;k++){const a=Math.PI/2+rr(-.6,.6),L=rr(50,80),x=c[0]+rr(-8,8),y=c[1];g.fillStyle=BIO.tex.grey(lum*rr(.9,1.05));
   g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*L*.5+9,y+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-6,6),y+Math.sin(a)*L);g.quadraticCurveTo(x+Math.cos(a)*L*.5-4,y+Math.sin(a)*L*.5,x,y);g.fill();}}},[150,150,150]);
/* small leathery leaves on crooked twigs -- manzanita */
TX.manz=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.64);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.12,.8),a=c[2]+rr(-.8,.8),L=rr(40,80),lum=lerp(110,238,i/110);
  g.strokeStyle=BIO.tex.grey(70);g.lineWidth=2.4;g.beginPath();g.moveTo(c[0],c[1]);const ex=c[0]+Math.cos(a)*L,ey=c[1]+Math.sin(a)*L;g.lineTo(ex,ey);g.stroke();
  for(let s=6;s<L;s+=7){const bx=c[0]+Math.cos(a)*s,by=c[1]+Math.sin(a)*s;for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lum*rr(.88,1.06));
   g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.2)*6,by+Math.sin(a+sd*1.2)*6,8.5,5.5,a+sd*1.2,0,TAU);g.fill();}}}},[150,150,150]);
/* weeping willow: fine strands of narrow leaves, tileable top to bottom (v=0 at the top of a ribbon) */
TX.willow=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';   // a few strands with air between them: a veil, not a plank
 for(let k=0;k<8;k++){const x0=12+(k+rr(-.25,.25))*(S-24)/7,lum=lerp(115,238,rng());
  for(let off=-S;off<=S;off+=S){let x=x0,y=off;g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);
   const pts=[];while(y<off+S){const nx=x+rr(-3,3),ny=y+rr(8,14);g.lineTo(nx,ny);pts.push([nx,ny]);x=nx;y=ny;}g.stroke();
   pts.forEach(p=>{for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lum*rr(.88,1.08));g.beginPath();g.ellipse(p[0]+sd*3.5,p[1]+4,1.8,8,sd*.4,0,TAU);g.fill();}});}}},[150,150,150]);
/* cherry blossom: small five-petalled flowers in dense clusters */
TX.blossom=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<260;i++){const c=BIO.tex.clPt(S,.10,.9),lum=lerp(170,250,rng()),r=rr(6,10);
  for(let p=0;p<5;p++){const a=p/5*TAU+c[2];g.fillStyle=BIO.tex.grey(lum*rr(.92,1.02));g.beginPath();g.ellipse(c[0]+Math.cos(a)*r*.6,c[1]+Math.sin(a)*r*.6,r*.55,r*.38,a,0,TAU);g.fill();}
  g.fillStyle=BIO.tex.grey(lum*.72);g.beginPath();g.arc(c[0],c[1],r*.2,0,TAU);g.fill();}},[210,210,210]);
/* a pinnate palm frond along +x */
TX.palmfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-3,3));g.stroke();
  for(let x=6;x<S-4;x+=5){const t=x/S,L=lerp(30,10,Math.pow(t,1.2))*rr(.9,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,232,rng()));g.lineWidth=3.2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.35,y+sd*L*.55,x+L*.55,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a fan: a half-disc of radial ribs, base at the bottom centre (skirt palm, palmetto) */
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.96,n=34;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.96+rr(-.02,.02),L=S*.88*(.8+.2*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=rr(3.5,6);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();
  if(rng()<.5){g.lineWidth=1;g.strokeStyle=BIO.tex.grey(200);g.beginPath();g.moveTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.lineTo(bx+Math.cos(a)*L*1.06+rr(-4,4),by+Math.sin(a)*L*1.06+10);g.stroke();}}   // the filaments at the tips
 g.strokeStyle=BIO.tex.grey(90);g.lineWidth=4;g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-S*.32);g.stroke();},[150,150,150]);
/* an elephant-ear: one big heart-shaped leaf, base at the bottom centre */
TX.heart=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=BIO.tex.grey(170);
 g.beginPath();g.moveTo(cx,S*.98);g.bezierCurveTo(S*1.02,S*.72,S*.9,S*.02,cx,S*.2);g.bezierCurveTo(S*.1,S*.02,-S*.02,S*.72,cx,S*.98);g.fill();
 g.strokeStyle=BIO.tex.grey(215);g.lineWidth=3;g.beginPath();g.moveTo(cx,S*.95);g.lineTo(cx,S*.24);g.stroke();
 g.lineWidth=1.6;for(let k=0;k<7;k++){const y=lerp(S*.85,S*.3,k/6);for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sd*S*.18,y-S*.03,cx+sd*S*.34*Math.sin((k+1)/8*Math.PI),y-S*.1);g.stroke();}}},[160,160,160]);
/* stiff blades from the base: yucca, agave, iris, sawgrass (vertical tuft card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<20;k++){const a=-Math.PI/2+rr(-.75,.75),L=S*rr(.55,.95),w=rr(5,9),lum=lerp(110,235,rng()),x0=S/2+rr(-6,6);
 g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(x0-w/2,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.lineTo(x0+w/2,S);g.fill();}},[150,150,150]);
/* lupin: a spike of pea-flowers over a few palmate leaves (vertical tuft card) */
TX.lupin=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<5;k++){const x0=S/2+rr(-40,40),top=S*rr(.08,.3);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,top);g.stroke();
  for(let y=top;y<S*.62;y+=7){const w=lerp(4,13,(y-top)/(S*.62-top));for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lerp(170,240,rng()));g.beginPath();g.ellipse(x0+sd*w*.6,y,w*.55,4,0,0,TAU);g.fill();}}}},[150,150,150]);
/* reeds, grass, fern, generic understorey, bloom, moss, beard: the kit's common set */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
/* Spanish moss: stringy strands hanging (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<6;j++){const yy=rr(0,S*.9);g.beginPath();g.moveTo(x0+rr(-8,8),yy);g.lineTo(x0+rr(-16,16),yy+rr(6,18));g.stroke();}}},[150,150,150]);
/* needles in flat sprays -- cedar and pine pads */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<140;i++){const c=BIO.tex.clPt(S,.10,.8),lum=lerp(105,235,i/140),a0=rr(0,TAU);g.strokeStyle=BIO.tex.grey(lum*rr(.88,1.05));g.lineWidth=1.6;
  for(let k=0;k<14;k++){const a=a0+rr(-1.2,1.2),L=rr(14,26);g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*L,c[1]+Math.sin(a)*L);g.stroke();}}},[140,140,140]);
/* a forking fern (Dicranopteris): a frond that branches in pairs, along +x */
TX.forkfern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const arm=(x,y,a,L,dep)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(90);g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(dep>0){for(let s=4;s<L;s+=4){const bx=x+Math.cos(a)*s,by=y+Math.sin(a)*s;for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=BIO.tex.grey(lerp(140,235,rng()));g.lineWidth=2.2;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a+sd*1.3)*9,by+Math.sin(a+sd*1.3)*9);g.stroke();}}}
  if(dep<2){arm(ex,ey,a-.6,L*.8,dep+1);arm(ex,ey,a+.6,L*.8,dep+1);}};
 arm(4,S/2,0,S*.22,0);},[150,150,150]);
/* a staghorn fern: antler-forked lobes from a round shield at the bottom centre */
TX.staghorn=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';g.lineJoin='round';
 const lobe=(x,y,a,L,w,dep)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(lerp(150,220,rng()));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(dep<3){lobe(ex,ey,a-rr(.35,.6),L*.72,w*.72,dep+1);lobe(ex,ey,a+rr(.35,.6),L*.72,w*.72,dep+1);}};
 for(let k=0;k<5;k++)lobe(S/2,S*.8,-Math.PI/2+(k-2)*.5,S*.2,16,0);
 g.fillStyle=BIO.tex.grey(185);g.beginPath();g.ellipse(S/2,S*.82,S*.2,S*.14,0,0,TAU);g.fill();},[160,160,160]);
SWLOW.TEX=TX;

// ---------------------------------------------------------------- TWO-TONE BARK
// A bark canvas here carries TWO things: R = the relief (grey, normalised by
// its own mean in the shader so the vertex colour is the albedo), G = a MASK
// that swaps the vertex colour for the bucket's second colour. That is how a
// madrone is red with green-white flayed patches, a manzanita red with char
// streaks, a ringbark copper with pale lenticels, a cypress cinnamon with grey
// weathered strands -- one draw call per look, species colours per vertex.
// uGain folds in the light rig: sun + hemisphere render an albedo about twice
// as bright as it is written, so a designer's colour is multiplied down here
// and the palettes above stay what the bark should look like. uGloss adds a
// sun highlight (manzanita, lacquered mangrove, the ringbark's sheen).
function wrap9(W,H,fn){for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)fn(i*W,j*H);}
function blob(g,x,y,w,h,wob,sl){g.beginPath();const n=14,sd=w*1.7+h*.31;for(let k=0;k<=n;k++){const a=k/n*TAU,r=1+wob*(h3(sd,k%n,7)-.5)*2;   // shape from its size only: every wrapped copy is identical
 const px=Math.cos(a)*w*r,py=Math.sin(a)*h*r;const X=x+px+py*sl,Y=y+py;k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();g.fill();}
const PAINT={
 ember(L,M,W,H){   // smooth, twisting sheen; char streaks
  for(let i=0;i<8;i++){const x=rng()*W;L.fillStyle='rgba(190,190,190,.10)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,oy,rr(10,40),H));}
  for(let i=0;i<260;i++){const x=rng()*W,y=rng()*H,l=rng()<.5?'70,70,70':'200,200,200';L.strokeStyle='rgba('+l+','+rr(.08,.25).toFixed(2)+')';L.lineWidth=rr(.8,2);
   const len=rr(40,200),dx=rr(-10,10);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.quadraticCurveTo(x+ox+dx,y+oy+len*.5,x+ox+dx*.4,y+oy+len);L.stroke();});}
  M.fillStyle='#fff';for(let i=0;i<16;i++){const x=rng()*W,y=rng()*H,w=rr(5,26),h=rr(50,220),sl=rr(-.12,.12);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.45,sl));}
  M.strokeStyle='#fff';for(let i=0;i<30;i++){const x=rng()*W,y=rng()*H;M.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{M.beginPath();M.moveTo(x+ox,y+oy);M.lineTo(x+ox+rr(-6,6),y+oy+rr(20,70));M.stroke();});}},
 lacquer(L,M,W,H){   // smooth, faint ripples and lenticels; a little pale lichen
  for(let i=0;i<30;i++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.25)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(3,14)));}
  for(let i=0;i<90;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,.45)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(5,16),rr(1.5,3)));}
  M.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<10;i++){const x=rng()*W,y=rng()*H,r=rr(4,12);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.2,.5,0));}},
 flay(L,M,W,H){   // flame-shaped flakes peeling off red to a pale underbark (red dominant: the pale shows in flakes)
  for(let i=0;i<140;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba(110,110,110,.25)';L.lineWidth=1;wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-4,4),y+oy+rr(20,60));L.stroke();});}
  for(let i=0;i<17;i++){const x=rng()*W,y=rng()*H,w=rr(8,24),h=rr(30,100),sl=rr(-.35,.35),l=Math.round(rr(120,170));
   wrap9(W,H,(ox,oy)=>{M.fillStyle='#fff';blob(M,x+ox,y+oy,w,h,.35,sl);L.fillStyle='rgba('+l+','+l+','+l+',.6)';blob(L,x+ox,y+oy,w,h,.35,sl);
    L.strokeStyle='rgba(50,50,50,.55)';L.lineWidth=1.4;L.stroke();});}},
 mottle(L,M,W,H){   // sycamore jigsaw: rounder, more of the pale showing
  for(let i=0;i<46;i++){const x=rng()*W,y=rng()*H,w=rr(14,40),h=rr(18,60),l=Math.round(rr(115,175));
   const mf=rng()<.8?'#fff':'#888',sl=rr(-.2,.2);wrap9(W,H,(ox,oy)=>{M.fillStyle=mf;blob(M,x+ox,y+oy,w,h,.5,sl);L.fillStyle='rgba('+l+','+l+','+l+',.55)';blob(L,x+ox,y+oy,w,h,.5,sl);});}},
 ring(L,M,W,H){   // copper sheen banded with pale lenticels; peeling curls
  for(let i=0;i<20;i++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'125,125,125':'175,175,175')+',.3)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(4,18)));}
  for(let i=0;i<150;i++){const x=rng()*W,y=rng()*H,w=rr(10,46),h=rr(2,4);
   wrap9(W,H,(ox,oy)=>{L.fillStyle='rgba(70,70,70,.6)';L.fillRect(x+ox,y+oy+h*.6,w,h*.6);M.fillStyle='#fff';M.fillRect(x+ox,y+oy,w,h);});}
  for(let i=0;i<7;i++){const x=rng()*W,y=rng()*H,w=rr(20,60),h=rr(8,20);wrap9(W,H,(ox,oy)=>{M.fillStyle='rgba(255,255,255,.85)';blob(M,x+ox,y+oy,w,h,.6,0);L.fillStyle='rgba(60,60,60,.5)';L.fillRect(x+ox-w*.8,y+oy+h,w*1.6,2.5);});}},
 furrow(L,M,W,H){   // deep furrows, blocky ridges; grey-green lichen
  for(let i=0;i<34;i++){const x=rng()*W;L.strokeStyle='rgba(40,40,40,.75)';L.lineWidth=rr(3,7);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+rr(-14,14),oy+H*.33,x+ox+rr(-14,14),oy+H*.66,x+ox+rr(-6,6),oy+H+10);L.stroke();});}
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(45,45,45,.6)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(8,22),rr(2,4)));}
  for(let i=0;i<40;i++){const x=rng()*W;L.strokeStyle='rgba(185,185,185,.35)';L.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.lineTo(x+ox+rr(-8,8),oy+H);L.stroke();});}
  M.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){const x=rng()*W,y=rng()*H,r=rr(18,40);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.6,.6,0));}},   // lichen: a faint stain, never a pattern
 stringy(L,M,W,H){   // cypress: long fibres, weathered grey strands over cinnamon
  for(let i=0;i<300;i++){const x=rng()*W,d=rng();L.strokeStyle='rgba('+(d<.5?'55,55,55':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';L.lineWidth=d<.5?rr(2,5):rr(1,2);
   wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+rr(-10,10),oy+H*.33,x+ox+rr(-10,10),oy+H*.66,x+ox+rr(-8,8),oy+H+10);L.stroke();});}
  M.fillStyle='#fff';for(let i=0;i<50;i++){const x=rng()*W,y=rng()*H,w=rr(2,7),h=rr(60,300);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.3,rr(-.03,.03)));}},
 pale(L,M,W,H){   // smooth pale, horizontal lenticels, a bloom of green algae
  L.fillStyle='#9c9c9c';L.fillRect(0,0,W,H);
  for(let k=0;k<22;k++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'130,130,130':'175,175,175')+',.35)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(4,22)));}
  for(let i=0;i<120;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,'+(.3+rng()*.4).toFixed(2)+')';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(6,24),rr(1.5,3.5)));}
  M.fillStyle='rgba(255,255,255,.3)';for(let i=0;i<9;i++){const x=rng()*W,y=rng()*H,r=rr(14,40);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.8,.6,0));}},   // algae: a faint wash, not camouflage
 cork(L,M,W,H){   // thick spongy cork: a network of deep fissures with red-brown in their floors
  L.fillStyle='#9a9a9a';L.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H,r=rr(12,30),l=Math.round(rr(130,185));L.fillStyle='rgba('+l+','+l+','+l+',.5)';wrap9(W,H,(ox,oy)=>blob(L,x+ox,y+oy,r,r*1.4,.4,0));}
  const P=[];for(let i=0;i<34;i++)P.push([rng()*W,rng()*H]);
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>90||rng()<.4)continue;const lw=rr(4,9);
   wrap9(W,H,(ox,oy)=>{L.strokeStyle='rgba(35,35,35,.85)';L.lineWidth=lw;L.beginPath();L.moveTo(a[0]+ox,a[1]+oy);L.quadraticCurveTo((a[0]+b[0])/2+ox+rr(-10,10),(a[1]+b[1])/2+oy+rr(-10,10),b[0]+ox,b[1]+oy);L.stroke();
    M.strokeStyle='#fff';M.lineWidth=lw*.55;M.beginPath();M.moveTo(a[0]+ox,a[1]+oy);M.lineTo(b[0]+ox,b[1]+oy);M.stroke();});}},
 strip(L,M,W,H){   // ribbon gum: long vertical flames of red over white, some slanted
  for(let i=0;i<120;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba(110,110,110,.2)';L.lineWidth=1;wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-2,2),y+oy+rr(30,90));L.stroke();});}
  for(let i=0;i<22;i++){const x=rng()*W,y=rng()*H,w=rr(6,20),h=rr(120,300),sl=rr(-.12,.12),l=Math.round(rr(150,185));
   wrap9(W,H,(ox,oy)=>{M.fillStyle='#fff';blob(M,x+ox,y+oy,w,h,.3,sl);L.fillStyle='rgba('+l+','+l+','+l+',.6)';blob(L,x+ox,y+oy,w,h,.3,sl);L.strokeStyle='rgba(60,60,60,.35)';L.lineWidth=1;L.stroke();});}},
 ocelli(L,M,W,H){   // the eyed beech: smooth tan, dark ringed eyes and chevrons
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,.3)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(6,18),rr(1.5,3)));}
  const dx=42,dy=46;for(let j=-1;j<=H/dy+1;j++)for(let i=-1;i<=W/dx+1;i++){const x=i*dx+(j%2?dx/2:0)+rr(-5,5),y=j*dy+rr(-5,5),r=rr(9,15);if(rng()<.15)continue;
   M.fillStyle='#fff';M.beginPath();M.ellipse(x,y,r,r*1.15,0,0,TAU);M.fill();M.fillStyle='#000';M.beginPath();M.ellipse(x,y,r*.62,r*.72,0,0,TAU);M.fill();
   M.fillStyle='#fff';M.beginPath();M.ellipse(x,y,r*.28,r*.32,0,0,TAU);M.fill();L.fillStyle='rgba(90,90,90,.35)';L.beginPath();L.ellipse(x,y+2,r*1.05,r*1.2,0,0,TAU);L.fill();}},
 crack(L,M,W,H){   // the crimson ghost: cream bark split in a gold-orange network
  L.fillStyle='#9e9e9e';L.fillRect(0,0,W,H);
  const P=[];for(let i=0;i<40;i++)P.push([rng()*W,rng()*H]);
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dd=Math.hypot(a[0]-b[0],(a[1]-b[1])*.5);if(dd>70||rng()<.35)continue;const lw=rr(2.5,6),mx=rr(-8,8),my=rr(-8,8);
   wrap9(W,H,(ox,oy)=>{M.strokeStyle='#fff';M.lineWidth=lw;M.beginPath();M.moveTo(a[0]+ox,a[1]+oy);M.quadraticCurveTo((a[0]+b[0])/2+ox+mx,(a[1]+b[1])/2+oy+my,b[0]+ox,b[1]+oy);M.stroke();
    L.strokeStyle='rgba(70,70,70,.5)';L.lineWidth=lw*.35;L.stroke();});}},
 plate(L,M,W,H){   // flatwood pine: red plates, dark fissures, pale flaking edges
  L.fillStyle='#909090';L.fillRect(0,0,W,H);
  for(let j=0;j<16;j++)for(let i=0;i<5;i++){const x=i*W/5+rr(-8,8)+(j%2?W/10:0),y=j*H/16+rr(-5,5),w=W/5*rr(.8,.98),h=H/16*rr(.9,1.6),l=Math.round(rr(125,175));
   wrap9(W,H,(ox,oy)=>{L.fillStyle='rgba('+l+','+l+','+l+',.85)';blob(L,x+ox,y+oy,w*.5,h*.5,.25,0);M.fillStyle='rgba(255,255,255,.55)';M.fillRect(x+ox-w*.45,y+oy-h*.5,w*.9,2.5);});}
  for(let i=0;i<30;i++){const x=rng()*W;L.strokeStyle='rgba(30,30,30,.7)';L.lineWidth=rr(2,4);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.lineTo(x+ox+rr(-12,12),oy+H);L.stroke();});}},
 cane(L,M,W,H){   // a cane: fine vertical striations, two nodes per tile
  for(let i=0;i<90;i++){const x=rng()*W;L.strokeStyle='rgba('+(rng()<.5?'110,110,110':'170,170,170')+',.35)';L.lineWidth=rr(1,2.5);L.beginPath();L.moveTo(x,0);L.lineTo(x,H);L.stroke();}
  [0,H/2].forEach(y=>{L.fillStyle='rgba(50,50,50,.8)';L.fillRect(0,y,W,5);L.fillRect(0,y+H-1,W,1);L.fillStyle='rgba(200,200,200,.7)';L.fillRect(0,y+5,W,4);M.fillStyle='#fff';M.fillRect(0,y-3,W,10);});M.fillRect(0,H-3,W,3);},
 fibre(L,M,W,H){   // palm trunk: leaf-base scars in a lattice, fibres between
  for(let i=0;i<300;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba('+(rng()<.5?'60,60,60':'170,170,170')+','+(.3+rng()*.4).toFixed(2)+')';L.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-6,6),y+oy+rr(14,50));L.stroke();});}
  const dx=64,dy=64;for(let j=-1;j<=H/dy+1;j++)for(let i=-1;i<=W/dx+1;i++){const x=i*dx+(j%2?dx/2:0),y=j*dy;L.strokeStyle='rgba(40,40,40,.55)';L.lineWidth=3;L.beginPath();L.moveTo(x-dx*.45,y);L.quadraticCurveTo(x,y+dy*.25,x+dx*.45,y);L.stroke();}},
};
function barkTex2(kind){const W=256,H=512,cl=document.createElement('canvas'),cm=document.createElement('canvas');cl.width=cm.width=W;cl.height=cm.height=H;
 const L=cl.getContext('2d'),M=cm.getContext('2d');L.fillStyle='#8c8c8c';L.fillRect(0,0,W,H);M.fillStyle='#000';M.fillRect(0,0,W,H);
 PAINT[kind](L,M,W,H);
 const Ld=L.getImageData(0,0,W,H).data,Md=M.getImageData(0,0,W,H).data,out=L.createImageData(W,H),o=out.data;let s=0;
 for(let i=0;i<o.length;i+=4){o[i]=Ld[i];o[i+1]=Md[i];o[i+2]=Ld[i];o[i+3]=255;s+=Ld[i];}
 const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(out,0,0);
 const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=8;t.encoding=T3.LinearEncoding;t.biomeMean=s/(W*H)/255;return t;}   // r128 textures have no userData
SWLOW.barkMat2=function(tex,key,o){o=o||{};
 const m=new T3.MeshLambertMaterial({color:0xffffff,map:tex,vertexColors:true,side:T3.DoubleSide});
 const alt=C(o.alt==null?0x808080:o.alt).convertSRGBToLinear();
 m.onBeforeCompile=sh=>{
  sh.uniforms.uAlt={value:alt};sh.uniforms.uMean={value:tex.biomeMean||.55};sh.uniforms.uGain={value:o.gain==null?.52:o.gain};sh.uniforms.uGloss={value:o.gloss||0};
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uAlt,uSunDir;uniform float uMean,uGain,uGloss;varying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <map_fragment>','vec4 _bt=texture2D(map,vUv);float _bl=_bt.r/uMean;float _bm=_bt.g;')
   .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vColor,uAlt,_bm)*_bl*uGain;')
   .replace('#include <envmap_fragment>','{vec3 _V=normalize(cameraPosition-vBWP);vec3 _N=normalize(vBWN);if(dot(_N,_V)<0.0)_N=-_N;vec3 _H=normalize(uSunDir+_V);'+
    'float _sp=pow(max(dot(_N,_H),0.0),26.0)*step(0.0,dot(_N,uSunDir));outgoingLight+=uGloss*_sp*vec3(1.0,0.93,0.8)*(1.0-_bm*0.8)*_bl;}\n#include <envmap_fragment>');};
 m.customProgramCacheKey=function(){return'swlbark|'+key;};return m;};
const BK={ember:barkTex2('ember'),lacquer:barkTex2('lacquer'),flay:barkTex2('flay'),mottle:barkTex2('mottle'),ring:barkTex2('ring'),
 furrow:barkTex2('furrow'),strip:barkTex2('strip'),ocelli:barkTex2('ocelli'),crack:barkTex2('crack'),plate:barkTex2('plate'),stringy:barkTex2('stringy'),pale:barkTex2('pale'),cork:barkTex2('cork'),cane:barkTex2('cane'),fibre:barkTex2('fibre')};
SWLOW.BARKTEX=BK;
// greyscale canvases for the instanced small trunks and the logs/rocks (the kit's usual tint() path)
SWLOW.FIBRETEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
 for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}});
SWLOW.SMOOTHTEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.35)';g.fillRect(0,y,w,rr(4,26));}
 for(let i=0;i<110;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.4+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(6,26),rr(1.5,3.5));}});
SWLOW.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8a8074';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,52,44':'170,160,150')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
SWLOW.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=120+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24+8*Math.sin(y*.35+fbm(x/40,y/40,5,2)*8);d[i]=v;d[i+1]=v*.97;d[i+2]=v*.92;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FAN: one vertical quad, base at the origin, up to y=1, local +z its face
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a DROOPING FAN: the fan card bent in three bands so it arches out and hangs (the skirt palm's wide hanging leaves)
G.droop=function(){const pos=[],uv=[],nor=[];const R=[[0,0,0],[0,.22,.30],[0,.16,.62],[0,-.22,.84]];   // (x unused, y, z) of each row's spine: out, over, and down
 const rows=R.map((r,i)=>{const t=i/(R.length-1),w=.5*Math.min(1,.35+t*1.1);return[[-w,r[1],r[2],.5-w,1-t*1],[w,r[1],r[2],.5+w,1-t]];});
 for(let i=0;i<rows.length-1;i++){const a=rows[i][0],b=rows[i][1],c=rows[i+1][1],d=rows[i+1][0];
  [a,b,c,a,c,d].forEach(p=>{pos.push(p[0],p[1],p[2]);uv.push(p[3],p[4]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE: three tiers of fleshy bent leaves, vertex-coloured pale at the base (agave, bromeliad)
G.rosette=function(tiers){const pos=[],nor=[],uv=[],col=[];
 tiers=tiers||[[10,1.0,.30,.55],[8,.70,.55,.40],[6,.42,.85,.28]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R,Math.sin(el)*R*.9+.05,sa*R],mid=[ca*R*.5,Math.sin(el)*R*.35+.04,sa*R*.5],base=[ca*.08,.02,sa*.08];
   const W=wd*R;
   const q=[[base[0]-px*W*.25,base[1],base[2]-pz*W*.25],[base[0]+px*W*.25,base[1],base[2]+pz*W*.25],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.55);push(q[1],.55);push(q[2],.85);push(q[0],.55);push(q[2],.85);push(q[3],.85);
   push(q[3],.85);push(q[2],.85);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a LILY PAD: a flat disc with a notch, unit radius, vertex-coloured (lighter centre)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=11;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.92+.25,a1=((k+1)/n)*TAU*.92+.25;
  const r0=1+.06*Math.sin(k*3.1),r1=1+.06*Math.sin((k+1)*3.1);
  [[0,0,0,1.12],[Math.cos(a1)*r1,0,Math.sin(a1)*r1,.92],[Math.cos(a0)*r0,0,Math.sin(a0)*r0,.92]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: origin at the base (cypress knees, kapok spines, mangrove pneumatophores)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,6,1);g.translate(0,.5,0);return g;};
SWLOW.G=G;

// ---------------------------------------------------------------- materials
const M=SWLOW.MAT={
 bk:{
  ember:SWLOW.barkMat2(BK.ember,'ember',{alt:0x141110,gloss:.40}),
  lacquer:SWLOW.barkMat2(BK.lacquer,'lacquer',{alt:0x9a8a78,gloss:.32}),
  flay:SWLOW.barkMat2(BK.flay,'flay',{alt:0xc8d2b4,gloss:.18}),
  mottle:SWLOW.barkMat2(BK.mottle,'mottle',{alt:0xe8e6dc,gloss:.05}),
  ring:SWLOW.barkMat2(BK.ring,'ring',{alt:0xd8c498,gloss:.60}),
  furrow:SWLOW.barkMat2(BK.furrow,'furrow',{alt:0x5c5c4c,gloss:0}),
  stringy:SWLOW.barkMat2(BK.stringy,'stringy',{alt:0x9a968c,gloss:0}),
  pale:SWLOW.barkMat2(BK.pale,'pale',{alt:0x6a7a4e,gloss:.08}),
  cork:SWLOW.barkMat2(BK.cork,'cork',{alt:0x5a2a1c,gloss:0}),
  cane:SWLOW.barkMat2(BK.cane,'cane',{alt:0x4a4a26,gloss:.45}),
  fibre:SWLOW.barkMat2(BK.fibre,'fibre',{alt:0x404040,gloss:0}),
  strip:SWLOW.barkMat2(BK.strip,'strip',{alt:0xe6e6dc,gloss:.12}),
  ocelli:SWLOW.barkMat2(BK.ocelli,'ocelli',{alt:0x2a2018,gloss:.05}),
  crack:SWLOW.barkMat2(BK.crack,'crack',{alt:0xd88a2a,gloss:.15}),
  plate:SWLOW.barkMat2(BK.plate,'plate',{alt:0xc8b8a0,gloss:0})},
 wood:BIO.barkMat(SWLOW.WOODTEX),
 rock:BIO.barkMat(SWLOW.ROCKTEX),
 oakleaf:BIO.leafMat(TX.oakleaf,'swl-oakleaf',{aN:true,swayW:'1.0',swayA:.10}),
 glossy:BIO.leafMat(TX.glossy,'swl-glossy',{aN:true,swayW:'1.0',swayA:.12}),
 broad:BIO.leafMat(TX.broad,'swl-broad',{aN:true,swayW:'1.0',swayA:.14}),
 feather:BIO.leafMat(TX.feather,'swl-feather',{aN:true,swayW:'1.0',swayA:.12}),
 lance:BIO.leafMat(TX.lance,'swl-lance',{aN:true,swayW:'1.0',swayA:.16}),
 manz:BIO.leafMat(TX.manz,'swl-manz',{aN:true,swayW:'1.0',swayA:.05}),
 needle:BIO.leafMat(TX.needle,'swl-needle',{aN:true,swayW:'1.0',swayA:.08}),
 forkfern:BIO.leafMat(TX.forkfern,'swl-forkfern',{swayW:'(position.x)',swayA:.06}),
 staghorn:BIO.leafMat(TX.staghorn,'swl-staghorn',{swayW:'(position.y)',swayA:.03,alphaTest:.45}),
 pod:BIO.leafMat(null,'swl-pod',{swayW:'(-position.y)',swayA:.35,alphaTest:0,vertexColors:true}),
 blossom:BIO.leafMat(TX.blossom,'swl-blossom',{aN:true,swayW:'1.0',swayA:.10}),
 veil:BIO.leafMat(TX.willow,'swl-veil',{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.36}),
 palmfrond:BIO.leafMat(TX.palmfrond,'swl-palmfrond',{swayW:'(position.x)',swayA:.10}),
 fan:BIO.leafMat(TX.fan,'swl-fan',{swayW:'(position.y)',swayA:.08,alphaTest:.45}),
 droop:BIO.leafMat(TX.fan,'swl-droop',{swayW:'(position.z)',swayA:.10,alphaTest:.45}),
 heart:BIO.leafMat(TX.heart,'swl-heart',{swayW:'(position.y)',swayA:.07,alphaTest:.45}),
 spike:BIO.leafMat(TX.spike,'swl-spike',{swayW:'(position.y)',swayA:.03,alphaTest:.42}),
 lupin:BIO.leafMat(TX.lupin,'swl-lupin',{swayW:'(position.y)',swayA:.08,alphaTest:.42}),
 reed:BIO.leafMat(TX.reed,'swl-reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'swl-grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 frond:BIO.leafMat(TX.frond,'swl-frond',{swayW:'(position.x)',swayA:.07}),
 bigfrond:BIO.leafMat(TX.bigfrond,'swl-bigfrond',{swayW:'(position.x)',swayA:.09}),
 under:BIO.leafMat(TX.under,'swl-under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'swl-beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'swl-hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'swl-moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'swl-bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 rosette:BIO.leafMat(null,'swl-rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'swl-pad',{swayW:'1.0',swayA:.02,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
[['ember','Ember bark (manzanita)',[.9,2.4]],['lacquer','Lacquered bark (mangrove, stripped cork)',[2,4]],['flay','Flayed bark (madrone, gum)',[2.2,4.5]],
 ['mottle','Mottled bark (sycamore)',[3,5]],['ring','Ringbark',[1.4,2.4]],['furrow','Furrowed bark (oaks, willow)',[2.4,3.4]],['stringy','Stringy bark (cypress)',[2.4,5]],
 ['pale','Pale bark (kapok, fig)',[3,5]],['strip','Ribbon bark (gum)',[2.4,6]],['ocelli','Eyed bark',[2.2,2.6]],['crack','Cracked ghost bark',[2.2,3.2]],['plate','Plated bark (pine)',[1.8,3.4]],['cork','Cork',[1.8,2.4]],['cane','Cane-palm stems',[.5,.9]],['fibre','Palm trunks',[2,3]]]
 .forEach(b=>BIO.bucket('bk_'+b[0],M.bk[b[0]],{label:b[1],uvScale:b[2]}));
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('oakleaf',BIO.geo.clump(),M.oakleaf,{attrs:['aN'],label:'Oak foliage'});
BIO.def('glossy',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Glossy foliage (fig, mangrove, madrone)'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN'],label:'Broadleaf foliage'});
BIO.def('feather',BIO.geo.clump(),M.feather,{attrs:['aN'],label:'Cypress foliage'});
BIO.def('lance',BIO.geo.clump(),M.lance,{attrs:['aN'],label:'Gum foliage'});
BIO.def('manz',BIO.geo.clump(),M.manz,{attrs:['aN'],label:'Manzanita foliage'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Needle pads (cedar, pine)'});
BIO.def('forkfern',BIO.geo.frond(3),M.forkfern,{label:'Forking ferns'});
BIO.def('staghorn',G.fan(),M.staghorn,{label:'Staghorn ferns'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Seed pods'});
BIO.def('pompom',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Pompom cones'});
BIO.def('blossom',BIO.geo.clump(),M.blossom,{attrs:['aN'],label:'Blossom'});
BIO.def('veil',BIO.geo.ribbon(6,.45,.10),M.veil,{label:'Willow veils'});
BIO.def('palmfrond',BIO.geo.frond(4),M.palmfrond,{label:'Palm fronds'});
BIO.def('fan',G.fan(),M.fan,{label:'Fan fronds'});
BIO.def('droop',G.droop(),M.droop,{label:'Skirt-palm leaves'});
BIO.def('heart',G.fan(),M.heart,{label:'Elephant ears'});
BIO.def('spike',G.tuft(),M.spike,{label:'Blade leaves (yucca, iris, sawgrass)'});
BIO.def('lupin',G.tuft(),M.lupin,{label:'Lupins'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Giant fern fronds'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Spanish moss'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Agaves'});
BIO.def('brom',G.rosette([[12,1.0,.55,.26],[9,.72,.85,.22],[6,.45,1.15,.2]]),M.rosette,{label:'Bromeliads'});
BIO.def('pad',G.pad(),M.pad,{label:'Lily pads and hyacinths'});
BIO.def('cone',G.cone(),M.solid,{label:'Knees and spines'});
BIO.def('rod',BIO.geo.rod(6),M.solid,{label:'Roots and stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(SWLOW.FIBRETEX),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(SWLOW.SMOOTHTEX),{label:'Small trunks (smooth)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(SWLOW.ROCKTEX),{label:'Boulders (small)'});
})();
// ================================================================= SOUTHWESTERN LOWLANDS — trees
// The twenty-one tree species of the lowlands, each with its own builder (a
// few share one), placed by zone from the host's climate fields (wet / tropic
// / dry / salt / flow / upland) and terrainH. The zone weights are computed
// HERE from those fields, never from the host's map: a world that binds the
// same fields gets the same zoning. The wide species are what the biome is:
// a limb here is a long sinuous tube that can run out along the ground and
// rise again (limbPts), and the crowns sit on the limbs, not on a sphere.
// Beyond the LOD spine the canopy species become blob impostors in the 'far'
// bucket; the small species thin out with distance and stop.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=SWLOW.SPECIES,PAL=SWLOW.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWLOW.TREES=[];

// ---------------------------------------------------------------- zones from the fields
// Each weight 0..1. Aridity tags are honoured by which weight a species reads:
// the 'semiarid' species read med (summer-dry ground), the 'humid' ones rain,
// swamp or sub, never med's dry slopes.
const Y=(x,z)=>BIO.terrainH(x,z);
function zones(x,z){const wet=BIO.field('wet',x,z),tropic=BIO.field('tropic',x,z),dry=BIO.field('dry',x,z),salt=BIO.field('salt',x,z),flow=BIO.field('flow',x,z),up=BIO.field('upland',x,z),h=Y(x,z);
 const trop=smooth(.68,.86,tropic),fresh=1-smooth(.45,.8,salt);
 // patch fields: pine flatwoods in the subtropical plain; chaparral vs woodland in the hills
 const pineK=smooth(.54,.64,fbm(x*.0016+14,z*.0016-9,4401,2)),chapK=smooth(.46,.58,fbm(x*.0021-3,z*.0021+6,4402,2)+(.5-wet)*.6);
 return{wet,tropic,dry,salt,flow,up,h,pineK,chapK,
  rain:trop*smooth(.72,.86,wet)*fresh,
  swamp:smooth(.84,.94,wet)*smooth(3.2,1.2,h)*(1-dry)*fresh*smooth(.3,.6,tropic+.25),
  sub:(1-trop)*(1-dry)*smooth(.45,.65,wet),
  med:dry,
  mang:smooth(.25,.6,salt)*smooth(.4,.7,tropic),
  beach:smooth(.55,.9,salt)*smooth(-.2,.6,h)*(1-smooth(.4,.7,tropic)*.6),
  rip:flow*(1-smooth(.5,.8,salt))};}
SWLOW.zones=zones;

// ---------------------------------------------------------------- colour
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[.25,.25,.25];
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
// the sRGB tint that renders `hex` on a greyscale texture of linear mean m (the instanced small trunks, logs, rocks)
function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
 c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={fibre:texMean(SWLOW.FIBRETEX),smooth:texMean(SWLOW.SMOOTHTEX),wood:texMean(SWLOW.WOODTEX),rock:texMean(SWLOW.ROCKTEX)};return MEAN;}
Object.assign(SWLOW,{means,tint,bright,shade,vary});
// the two-tone bark buckets take the designer's colour as it should look (their material does the light arithmetic)
const barkC=(S,k)=>vary(C(S.bark[(k==null?ri(0,99):k)%S.bark.length]),.01,.05,.04);
// an untextured rod in a species' bark colour, a shade down for the rig
const rodCol=(hex)=>shade(vary(hex,.01,.05,.04),-.3);
const leafCol=(set,k)=>bright(vary(pick(set),.025,.10,.06),k==null?1.3:k);

// ---------------------------------------------------------------- keep-clear between trees
const HC=120,HASH={};
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+40;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blocked(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
// the floor asks only about the bole (rt); the trees ask about each other's ground (r)
function blockedTrunk(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<(o.rt||o.r)+pad)return true;}return false;}
SWLOW.blocked=blockedTrunk;SWLOW.blockedGround=blocked;
const clear3=(x,y,z,rad,vr)=>BIO.clearOf3(x,y,z,rad,vr);
const okPts=pts=>{for(let i=1;i<pts.length;i++)if(!clear3(pts[i].x,pts[i].y,pts[i].z,pts[i].r+1.5,pts[i].r+1.5))return false;return true;};

// ---------------------------------------------------------------- the LIMB
// A sinuous limb from o toward azimuth a at elevation el, len metres long,
// radius r0 -> r1 over n segments. sag bends it down with distance (a live
// oak's limbs run out level and droop); rise lifts the last part again; wig
// wanders it sideways. A limb that meets the ground RESTS on it -- the
// sprawl oak's limbs lie along the ground for metres and climb again.
function limbPts(o,a,el,len,r0,r1,n,sag,wig,rise){const ca=Math.cos(a),sa=Math.sin(a),ce=Math.cos(el),se=Math.sin(el),sx=-sa,sz=ca;
 const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,v1=rr(-1,1)*wig*.6,pts=[];let rested=0;
 for(let k=0;k<=n;k++){const t=k/n,hd=len*ce*t,lat=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
  let y=o.y+len*(se*t+sag*t*t)+(rise||0)*len*Math.pow(smooth(.5,1,t),2)+v1*len*Math.sin(t*TAU)*.5;
  const x=o.x+ca*hd+sx*lat,z=o.z+sa*hd+sz*lat,r=mix(r0,r1,Math.pow(t,.8));
  const gy=Y(x,z)+r*.75;if(k>0&&y<gy){y=gy;rested++;}
  pts.push({x,y,z,r});}
 pts.rested=rested;return pts;}
// a limb's direction at point i (for secondaries)
function limbDir(pts,i){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z;return Math.atan2(dz,dx);}

// ---------------------------------------------------------------- foliage and epiphytes
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.5,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao*1.3),{n:[nx/nn,ny/nn,nz/nn]});}
function frondAt(item,x,y,z,a,L,pitch,col,wid){BIO.put(item,[x,y,z],qEuler(rr(-.1,.1),-a,pitch),[L,L*rr(.85,1.05),L*(wid||rr(1.1,1.4))],col);}
// the foliage colour of a clump: the species' set, with the odd flush of bronze new growth
function crownCol(S,flush){return C(rng()<(flush||0)?pick(PAL.flush):pick(S.leaf));}
// Spanish moss off a limb point: how much depends on the species and how wet the ground is
function mossAt(p,k,wet,st,Lmax){const n=Math.round(rr(0,2.2)*k*smooth(.45,.9,wet));
 for(let i=0;i<n;i++){const L=rr(1.5,Lmax||7);BIO.put('beard',[p.x+rr(-.7,.7),p.y-(p.r||.3)*.6,p.z+rr(-.7,.7)],qEuler(0,rr(0,TAU),0),[rr(1,2.2),L,1],bright(vary(pick(PAL.mossPale),.02,.08,.06),1.02));st.moss++;}}
// a staghorn fern on a bole: a shield and antlers, facing out
function staghorn(x,y,z,a,R,s,st){const nx=Math.cos(a),nz=Math.sin(a);
 BIO.put('staghorn',[x+nx*(R+.05),y-s*.3,z+nz*(R+.05)],qFacing([nx,rr(-.1,.25),nz]),[s,s,1],leafCol(PAL.aroid,1.35));
 BIO.put('staghorn',[x+nx*(R+.1),y-s*.2,z+nz*(R+.1)],qFacing([nx,-.6,nz]),[s*.9,s*1.2,1],leafCol(PAL.aroid,1.3));st.epi++;}
// a bromeliad perched on a bough
// grey-green tank bromeliads and air plants only: a red rosette on a bough reads as a flower
// growing out of the bark, which is not how these trees flower
function brom(p,st){const R=rr(.35,.8),c=rng()<.5?vary(pick(PAL.mossPale),.02,.06,.05):vary(pick(PAL.aroid),.03,.1,.06);
 BIO.put('brom',[p.x,p.y+p.r*.8,p.z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R,R*1.1,R],bright(c,1.1));st.epi++;}
// ---------------------------------------------------------------- the crown, ON its branches
// A clump's centre sits within a third of its own size of a real branch point,
// a little above it: no foliage hangs in the air. twigs() sprouts short
// three-sided tips off a branch point where a crown needs more to carry.
function twigs(fam,S,p,a0,n,len,elLo,elHi,st,out){for(let k=0;k<n;k++){const a=a0+rr(-1.4,1.4),el=rr(elLo,elHi),L=len*rr(.7,1.2),r=Math.max(.05,(p.r||.2)*.5);
  const tip={x:p.x+Math.cos(a)*Math.cos(el)*L,y:p.y+Math.sin(el)*L,z:p.z+Math.sin(a)*Math.cos(el)*L,r:.04};
  if(!clear3(tip.x,tip.y,tip.z,1,1))continue;st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r},tip],barkC(S),{seg:3});out.push(tip);}}
function crownOn(item,spots,sz0,flat,colFn,T,cy,ex,ey,dens,st){let n=0;
 for(const p of spots){const m=Math.floor(dens)+(rng()<dens%1?1:0);
  for(let c=0;c<m;c++){const sz=sz0*rr(.85,1.2),a=rr(0,TAU),d=sz*.3*Math.sqrt(rng()),x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,y=p.y+sz*flat*rr(.1,.35);
   if(!clear3(x,y,z,sz*.5,sz*flat*.5))continue;clumpAt(item,x,y,z,sz,flat,colFn(),T.x,cy,T.z,ex,ey);st.clumps++;n++;}}
 return n;}
// a LEADER: an upright limb from the bole to the crown's top, so the top of a crown is carried
function leader(fam,S,T,from,top,r0,st,all){const el=Math.PI/2-rr(.1,.32),len=(top-from.y)/Math.sin(el);if(len<1.5)return null;
 const pts=limbPts({x:from.x,y:from.y,z:from.z},rr(0,TAU),el,len,r0,.1,4,-.02,.05,0);if(!okPts(pts))return null;
 st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});if(all)all.push(...pts);return pts;}
// an ARCH: a vault limb, parametrised by what it does -- out to `reach`, up to `peak` metres
// over its origin at fraction pT of the way, and down to `end` metres over the origin at the tip
function archPts(o,a,reach,peak,pT,end,r0,r1,n,wig){const ca=Math.cos(a),sa=Math.sin(a),sx=-sa,sz=ca,w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,lat=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*reach;
  const f=t<=pT?1-Math.pow(1-t/pT,2):1-(1-end/peak)*Math.pow((t-pT)/(1-pT),2);
  const x=o.x+ca*reach*t+sx*lat,z=o.z+sa*reach*t+sz*lat,r=mix(r0,r1,Math.pow(t,.8));let y=o.y+peak*f+Math.sin(t*9+w1*7)*reach*.012;
  const gy=Y(x,z)+r*.75;if(k>0&&y<gy)y=gy;pts.push({x,y,z,r});}
 return pts;}
function spread(T,pts){let s=T.crownR*.5;for(const p of pts){const d=Math.hypot(p.x-T.x,p.z-T.z);if(d>s)s=d;}return s;}
function reg(T,S){if(typeof REGISTER==='function')REGISTER({name:S.name,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:Math.max(T.spread||0,T.crownR*.6),h:T.H});}
// the bole: a lathe with a flared, lobed foot; closed at the top with a dome ring (never an open pipe)
function bole(fam,T,S,top,rb,flare,fh,lobes,seg,vs,lean){const nl=lobes||0,L=[],ti=T.seed%3;for(let k=0;k<nl;k++)L.push({a:k/nl*TAU+rr(-.3,.3),amp:rr(.5,1.1)});
 const lobeSum=ang=>{let s=0;for(const q of L){const c=Math.cos(ang-q.a);if(c>0)s+=q.amp*Math.pow(c,5);}return s;};
 const la=rr(0,TAU),lx=Math.cos(la)*(lean||0),lz=Math.sin(la)*(lean||0);
 const rAt=u=>rb*(1-.35*u)*(1+flare*Math.exp(-u*top/fh)),rings=[],step=Math.max(.8,Math.min(vs*.5,top/7));
 for(let yy=0;yy<top;yy+=(yy<fh*1.5?Math.min(step,fh*.5):step))rings.push({x:T.x+lx*yy,y:T.y0+yy,z:T.z+lz*yy,r:rAt(yy/top),yy:yy,col:barkC(S,Math.floor(yy/9)+ti)});
 const r1=rAt(1);rings.push({x:T.x+lx*top,y:T.y0+top,z:T.z+lz*top,r:r1,yy:top,col:barkC(S,1)},{x:T.x+lx*top,y:T.y0+top+r1*.8,z:T.z+lz*top,r:.05,yy:top+1,col:barkC(S,1)});
 const tris=BIO.lathe(fam,rings,seg,Math.max(1,Math.round(TAU*rb/3)),vs,(R,ang)=>R.r*(1+(nl?flare*.9*Math.exp(-R.yy/fh)*lobeSum(ang):0)+.03*Math.sin(5*ang+R.yy*.2)),
  nl?(R,ang)=>mix(1,.6+.4*clamp(lobeSum(ang),0,1),Math.exp(-R.yy/fh)):null);
 return{tris,top:{x:T.x+lx*top,y:T.y0+top,z:T.z+lz*top},rAt,lx,lz};}

// ---------------------------------------------------------------- the builders
// Each: (T, st, lv) where T={x,z,y0,sp,H,rb,crownR,seed,wet} and lv 2 near / 1 mid
const B=[];
// 5 / 14 the SPRAWL OAK (and the smaller coast oak): a short massive bole and a handful
// of enormous limbs of three habits. VAULT limbs climb steeply, arch over and come down
// at the tips: together they make the high tunnel of a live-oak avenue. SWEEP limbs run
// out low, rest on the ground and climb again. A few UPRIGHT limbs fill the top. The
// crown is carried on secondaries and twigs along all of them; Spanish moss hangs from
// every limb in the wet. An avenue oak (T.bias, the direction of the road) leans its
// vaults over the road and keeps its sweeping limbs off it.
B[5]=B[14]=B[26]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,coast=T.sp!==5,bias=T.bias;
 const hc=rr(3.5,6)*(coast?.75:1),bo=bole(fam,T,S,hc,rb,.7,1.4,ri(4,6),lv===2?12:8,3.4,bias==null?rr(0,.06):0);st.trunk+=bo.tris;
 const nL=lv===2?ri(6,9):ri(4,6),a0=bias==null?rr(0,TAU):bias,spots=[],all=[],hk=H/26;
 for(let k=0;k<nL;k++){const r=rng(),kind=r<(coast?.5:.6)?'vault':r<(coast?.68:.84)?'sweep':'up';
  let a=a0+k*GOLD+rr(-.25,.25);
  if(bias!=null){if(kind==='vault'&&rng()<.6)a=bias+rr(-.75,.75);if(kind==='sweep')a=bias+Math.PI+rr(-1.2,1.2);}
  const r0=rb*rr(.42,.58),o={x:bo.top.x+Math.cos(a)*rb*.45,y:T.y0+hc*rr(.75,1),z:bo.top.z+Math.sin(a)*rb*.45},n=lv===2?10:6;let pts;
  // an avenue oak keeps its vault tips high (the tunnel stays open to a rider); a wild one lets them come down
  if(kind==='vault')pts=archPts(o,a,T.crownR*rr(.8,1.05),rr(8,12.5)*hk*(coast?.75:1),rr(.38,.55),bias!=null?rr(5,9):rr(-2.5,3),r0,.14,n,.09);
  else if(kind==='sweep'){const rise=rng()<S.touch*1.6?rr(.25,.45):rr(0,.1);pts=limbPts(o,a,rr(.15,.35),T.crownR*rr(.7,.95),r0,.14,n,-rr(.7,1.0),.09,rise);}
  else pts=limbPts(o,a,rr(1.0,1.25),T.crownR*rr(.4,.55),r0*.8,.14,Math.max(4,n-3),-rr(.05,.15),.08,0);
  if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?(r0>.9?8:6):5,cap:true});all.push(...pts);st.limbs++;
  // secondaries out and a little up off the limb, twigs off those: the crown sits on them
  for(let i=2;i<pts.length;i+=lv===2?1:2){const p=pts[i],t=i/(pts.length-1),ad=limbDir(pts,i)+(rng()<.5?-1:1)*rr(.5,1.3),len2=Math.min(9,T.crownR*rr(.13,.22)*(1.2-t*.4));
   const sp=limbPts({x:p.x,y:p.y+p.r*.4,z:p.z},ad,rr(-.05,.55),len2,Math.max(.1,p.r*.55),.06,3,-.3,.14,.08);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});
   spots.push(sp[1],sp[2],sp[3]);if(lv===2&&i%2)twigs(fam,S,sp[3],ad,2,len2*.4,.05,.8,st,spots);
   if(lv>=1&&i%2)mossAt(sp[2],S.moss*.7,T.wet,st,coast?3:7);}
  for(let i=3;i<pts.length;i+=2){spots.push(pts[i]);if(lv>=1)mossAt(pts[i],S.moss*.6,T.wet,st,coast?3:8);}
  if(lv===2&&!coast){for(let i=2;i<pts.length;i+=3){BIO.put('frond',[pts[i].x,pts[i].y+pts[i].r*.8,pts[i].z],qEuler(rr(.1,.4),rr(0,TAU),0),[rr(.8,1.5),.8,1],leafCol(PAL.fern,1.5));}}}   // resurrection fern and bromeliads on the limbs
 // leaders carry the top of the crown to H
 for(let k=0;k<(lv===2?2:1);k++){const L=leader(fam,S,T,{x:bo.top.x,y:T.y0+hc,z:bo.top.z},T.y0+H-2.5,rb*.4,st,all);if(L){spots.push(L[2],L[3],L[4]);if(lv===2)twigs(fam,S,L[4],rr(0,TAU),3,4,-.1,.5,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.35,sz0=coast?rr(6,8):rr(7,9.5);
 if(!crownOn('oakleaf',spots,sz0,.58,()=>crownCol(S,.015),T,cy,ex,ey,lv===2?1.3:.8,st)){clumpAt('oakleaf',bo.top.x,T.y0+hc+2,bo.top.z,sz0,.55,crownCol(S),T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2&&!coast&&T.wet>.6&&rng()<.6){const a=rr(0,TAU);staghorn(T.x,T.y0+hc*.7,T.z,a,bo.rAt(.7),rr(1.2,2),st);}
 T.spread=spread(T,all);reg(T,S);};
// 6 the PILLAR FIG: a fused, fluted bole, level limbs, and roots dropping from the
// limbs to the ground to become new trunks -- one tree that is a grove
B[6]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.3,.42),bo=bole(fam,T,S,hc,rb,1.1,2.2,ri(6,9),lv===2?14:9,3.6,0);st.trunk+=bo.tris;
 const nL=lv===2?ri(7,10):ri(5,6),a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),el=rr(.05,.32),len=T.crownR*rr(.7,1.0),r0=rb*rr(.35,.5);
  const o={x:T.x+Math.cos(a)*rb*.5,y:T.y0+hc*rr(.75,1),z:T.z+Math.sin(a)*rb*.5},pts=limbPts(o,a,el,len,r0,.14,lv===2?9:6,-rr(.1,.3),.1,rr(.05,.2));
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);st.limbs++;
  for(let i=2;i<pts.length;i++){const p=pts[i],t=i/(pts.length-1);
   // the pillars: some thick, most thin, all straight down to the ground
   if(lv>=1&&t>.3&&rng()<(lv===2?.55:.3)){const gy=Y(p.x,p.z);if(p.y-gy>2&&BIO.clearOf(p.x,p.z,.5)){
    if(rng()<.35){const rr0=rr(.25,.8)*(1-t*.4);const col=barkC(S);st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:rr0*.7},{x:p.x+rr(-.2,.2),y:mix(p.y,gy,.5),z:p.z+rr(-.2,.2),r:rr0},{x:p.x,y:gy-.4,z:p.z,r:rr0*1.35}],col,{seg:lv===2?7:5});st.pillars++;}
    else{for(let j=0,m=ri(1,3);j<m;j++){const ox=rr(-.6,.6),oz=rr(-.6,.6);BIO.beam('rod',[p.x+ox,p.y,p.z+oz],[p.x+ox,gy-.2,p.z+oz],rr(.05,.14),null,rodCol(pick(S.bark)));}st.roots++;}}}
   if(lv===2&&rng()<.3)BIO.put('strand',[p.x,p.y-p.r,p.z],qEuler(0,rr(0,TAU),0),[rr(.2,.5),rr(2,6),1],rodCol(0x8a7a5a));
   // secondaries up into the dome
   if(i%2===0){const ad=limbDir(pts,i)+rr(-1,1),len2=len*rr(.2,.35),sp=limbPts({x:p.x,y:p.y,z:p.z},ad,rr(.5,1.1),len2,Math.max(.1,p.r*.55),.06,3,-.08,.1,0);
    if(okPts(sp)){st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],ad,2,len2*.4,.1,.9,st,spots);}}
   else spots.push(p);}}
 for(let k=0;k<(lv===2?3:1);k++){const L=leader(fam,S,T,{x:T.x+rr(-1,1),y:T.y0+hc,z:T.z+rr(-1,1)},T.y0+H-2.5,rb*.35,st,all);if(L){spots.push(L[2],L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),lv===2?4:2,T.crownR*.22,-.1,.4,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.3,sz0=rr(7.5,10),dens=lv===2?1.7:1;
 crownOn('glossy',spots,sz0,.6,()=>crownCol(S,.05),T,cy,ex,ey,dens,st);
 if(lv===2){for(let k=0,m=ri(1,3);k<m;k++)staghorn(T.x,T.y0+rr(3,hc*.9),T.z,rr(0,TAU),bo.rAt(.5),rr(1.2,2.2),st);}
 T.spread=spread(T,all);reg(T,S);};
// 2 the PARASOL KAPOK: a pale plank-buttressed column, spines, and at two thirds of its
// height a flat parasol of level boughs in two tiers, bromeliads along them
B[2]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.58,.66),bo=bole(fam,T,S,hc,rb,1.6,5.5,ri(4,6),lv===2?14:9,5,0);st.trunk+=bo.tris;
 if(lv===2){for(let k=0,m=ri(14,26);k<m;k++){const u=rr(.05,.6),a=rr(0,TAU),R=bo.rAt(u),yy=T.y0+hc*u;BIO.put('cone',[T.x+Math.cos(a)*R*.95,yy,T.z+Math.sin(a)*R*.95],qFacing([Math.cos(a),0,Math.sin(a)]).multiply(qEuler(Math.PI/2,0,0)),[.16,.35,.16],rodCol(pick(S.bark)));}}
 const spots=[],all=[],tiers=[[hc*rr(.95,1),ri(5,7),1],[H*rr(.74,.8),ri(3,5),.62]];
 tiers.forEach((tr,ti)=>{const a0=rr(0,TAU);for(let k=0;k<(lv===2?tr[1]:Math.min(4,tr[1]));k++){const a=a0+k/tr[1]*TAU+rr(-.3,.3),el=rr(.04,.22),len=T.crownR*tr[2]*rr(.75,1),r0=rb*(ti?.28:.38);
  const pts=limbPts({x:T.x+Math.cos(a)*rb*.3,y:T.y0+tr[0],z:T.z+Math.sin(a)*rb*.3},a,el,len,r0,.14,lv===2?7:5,-rr(.02,.12),.06,rr(.05,.15));
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);st.limbs++;
  for(let i=1;i<pts.length;i++){const p=pts[i];spots.push(p);if(lv===2&&i%2)twigs(fam,S,p,a,2,len*.15,.05,.45,st,spots);
   if(i%2===0){const ad=limbDir(pts,i)+rr(-1.2,1.2),len2=len*rr(.2,.32),sp=limbPts({x:p.x,y:p.y,z:p.z},ad,rr(.15,.45),len2,Math.max(.1,p.r*.5),.06,3,-.05,.08,0);
    if(okPts(sp)){st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);}}
   if(lv===2&&rng()<.22)brom(p,st);if(lv>=1)mossAt(p,.35,T.wet,st,5);}}});
 // a leader to the top of the parasol
 const lead=limbPts({x:T.x,y:T.y0+hc,z:T.z},0,Math.PI/2-.05,H-hc,rb*.3,.15,4,0,.03,0);if(okPts(lead)){st.limb+=BIO.tube(fam,lead,barkC(S),{seg:6,cap:true});spots.push(lead[3],lead[4]);twigs(fam,S,lead[4],rr(0,TAU),4,T.crownR*.2,-.05,.3,st,spots);}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.12,sz0=rr(8.5,12),dens=lv===2?1.4:.8;
 crownOn('broad',spots,sz0,.4,()=>crownCol(S),T,cy,ex,ey,dens,st);
 if(lv===2){for(let k=0,m=ri(3,7);k<m;k++){const a=rr(0,TAU),u=rr(.2,.9);BIO.put('strand',[T.x+Math.cos(a)*bo.rAt(u),T.y0+hc*u,T.z+Math.sin(a)*bo.rAt(u)],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.25,.5),rr(6,18),1],leafCol(PAL.vine,1.1));}
  for(let k=0,m=ri(1,3);k<m;k++)staghorn(T.x,T.y0+rr(8,hc*.8),T.z,rr(0,TAU),bo.rAt(.3),rr(1.4,2.4),st);}
 T.spread=spread(T,all);reg(T,S);};
// 3 the RIBBON GUM: a tall straight bole striped red over white, three or four
// ascending limbs, an open hanging crown; ribbons of shed bark hanging
B[3]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.45,.58),bo=bole(fam,T,S,hc,rb,.5,2.2,0,lv===2?11:8,6,rr(0,.04));st.trunk+=bo.tris;
 const nL=lv===2?ri(3,4):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.3,.3),len=(H-hc)*rr(.75,1.05),pts=limbPts(bo.top,a,rr(.95,1.25),len,rb*.55,.14,5,-.1,.07,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5,cap:true});all.push(...pts);
  for(let i=2;i<=5;i++){const p=pts[i],ad=a+rr(-1.2,1.2),len2=len*rr(.25,.4),sp=limbPts(p,ad,rr(.4,.9),len2,Math.max(.1,p.r*.55),.05,3,-.12,.1,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],ad,2,len2*.35,-.3,.4,st,spots);}
  if(lv===2)for(let j=0;j<ri(1,3);j++){const p=pts[ri(0,3)];BIO.put('strand',[p.x+rr(-.3,.3),p.y,p.z+rr(-.3,.3)],qEuler(0,rr(0,TAU),0),[rr(.3,.6),rr(2,5),1],shade(C(pick(S.bark)),-.2));}}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.2,sz0=rr(5,7);
 crownOn('lance',spots,sz0,.8,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 1 the KNEE-CYPRESS: a flaring, fluted foot (standing in the water as often as not),
// a flat-topped crown of feathery sprays, beards of moss, knees round the base
B[1]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.62,.78),bo=bole(fam,T,S,hc,rb,1.8,2.4,ri(5,8),lv===2?12:8,5,0);st.trunk+=bo.tris;
 const nL=lv===2?ri(6,9):ri(4,5),a0=rr(0,TAU),spots=[],all=[],beards=[];
 for(let k=0;k<nL;k++){const u=mix(.72,.98,(k+rr(0,.9))/nL),a=a0+k*GOLD+rr(-.3,.3),el=rr(-.02,.3),len=T.crownR*rr(.6,1.0)*(1.1-u*.3),r0=clamp(bo.rAt(u)*.4,.2,1);
  const pts=limbPts({x:T.x+Math.cos(a)*bo.rAt(u)*.6,y:T.y0+hc*u,z:T.z+Math.sin(a)*bo.rAt(u)*.6},a,el,len,r0,.1,4,-.15,.08,.05);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let s=1;s<=4;s++){spots.push(pts[s]);if(lv===2&&s>1)twigs(fam,S,pts[s],a,2,len*.2,-.1,.35,st,spots);if(s>1)beards.push(pts[s]);}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.95,bo.rAt(1)*.7,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.25,-.1,.2,st,spots);}}
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.15,sz0=rr(5,7);
 crownOn('feather',spots,sz0,.42,()=>crownCol(S),T,cy,ex,ey,lv===2?1.5:.7,st);
 if(lv>=1)beards.forEach(p=>{if(lv===1&&rng()<.5)return;mossAt(p,1.6,Math.max(T.wet,.9),st,10);});
 if(lv===2){for(let k=0,m=ri(5,12);k<m;k++){const a=rr(0,TAU),d=rb*rr(1.8,5),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z);if(y<-1.8||!BIO.clearOf(x,z,.5))continue;
   const h=rr(.5,1.6)+Math.max(0,-y);BIO.put('cone',[x,y-.25,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*.45,h+.25,h*.45],rodCol(pick(S.bark)));st.knees++;}}
 T.spread=spread(T,all);reg(T,S);};
// 0 the LANTERN MANGROVE: a short lacquer-red trunk on a cage of arching prop roots
// in the brackish shallows, drop roots from the boughs, a wide low dome of glossy leaves
B[0]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,gy=T.y0,base=Math.max(gy,0)+rr(.8,1.8);
 const T2=Object.assign({},T,{y0:base-.2});const hc=H*rr(.3,.42),bo=bole(fam,T2,S,hc,rb,.3,1.2,0,lv===2?8:6,3,rr(0,.06));st.trunk+=bo.tris;
 const nR=lv===2?ri(10,16):6;
 for(let k=0;k<nR;k++){const a=k/nR*TAU+rr(-.25,.25),R=rr(1.6,4.2)*(rb/.6),gx=T.x+Math.cos(a)*R,gz=T.z+Math.sin(a)*R,gyy=Math.min(Y(gx,gz),base-1),h0=base+rr(.3,2.2);
  const pts=[{x:T.x+Math.cos(a)*rb*.7,y:h0,z:T.z+Math.sin(a)*rb*.7,r:rb*.24},{x:T.x+Math.cos(a)*R*.3,y:h0+rr(.8,1.8),z:T.z+Math.sin(a)*R*.3,r:rb*.2},
   {x:T.x+Math.cos(a)*R*.62,y:h0+rr(.2,1),z:T.z+Math.sin(a)*R*.62,r:rb*.17},{x:T.x+Math.cos(a)*R*.88,y:mix(h0,gyy,.6),z:T.z+Math.sin(a)*R*.88,r:rb*.15},{x:gx,y:gyy-.4,z:gz,r:rb*.14}];
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4});st.roots++;}
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD,len=T.crownR*rr(.6,.95),pts=limbPts(bo.top,a,rr(.3,.7),len,rb*.4,.1,5,-.35,.1,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){spots.push(pts[i]);if(lv===2&&i%2)twigs(fam,S,pts[i],a,2,len*.18,0,.5,st,spots);
   if(lv===2&&rng()<.14){const p=pts[i];BIO.beam('rod',[p.x,p.y,p.z],[p.x+rr(-.2,.2),-.6,p.z+rr(-.2,.2)],rr(.025,.05),null,shade(C(0x5a2a1a),-.2));}}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.35,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.3,-.1,.3,st,spots);}}
 const cy=base+H*.7,ex=T.crownR,ey=H*.25,sz0=rr(4,5.5);
 crownOn('glossy',spots,sz0,.6,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);if(lv===2)reg(T,S);};
// 4 the LACQUER CANE PALM: a clump of slender ringed stems, yellow-green below and
// lipstick red at the crownshaft, each with a few arching pinnate fronds
B[4]=function(T,st,lv){const S=SP[T.sp],H=T.H,n=lv===2?ri(4,8):2;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,1.6):0,la=a,lk=rr(.02,.12)*(k?1:.3),h=H*(k?rr(.45,1):1),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=Y(x,z)-.2,r=rr(.07,.13);
  const cs=C(pick(S.crownshaft)),lo=vary(C(pick(S.bark)),.02,.08,.06),pts=[];
  for(let i=0;i<=5;i++){const u=i/5;pts.push({x:x+Math.cos(la)*lk*h*u*u,y:y+h*u,z:z+Math.sin(la)*lk*h*u*u,r:r*(1-.25*u),col:u>.8?cs:(u>.62?lo.clone().lerp(cs,.5):lo)});}
  st.limb+=BIO.tube('bk_cane',pts,lo,{seg:5,cap:true});
  const e=pts[5],nf=lv===2?ri(5,7):4,a0=rr(0,TAU),hc=vary(C(pick(S.leaf)),.02,.08,.05);
  for(let f=0;f<nf;f++){const af=a0+f/nf*TAU+rr(-.2,.2);frondAt('palmfrond',e.x,e.y,e.z,af,T.crownR*rr(.8,1.1),rr(-.95,-.25),bright(hc,1.4),1.1);}
  st.fronds+=nf;}};
// 7 the VEIL WILLOW: a short leaning bole, limbs rising and arching over, and a curtain
// of hanging strands from every limb almost to the ground (golden twigs among the green)
B[7]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const hc=H*rr(.25,.35),bo=bole(fam,T,S,hc,rb,.6,1.2,ri(3,5),lv===2?10:7,3,rr(.05,.2));st.trunk+=bo.tris;
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),len=T.crownR*rr(.8,1.15),pts=limbPts(bo.top,a,rr(.75,1.1),len,rb*.45,.08,6,-rr(.6,.9),.08,0);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  const nv=lv===2?ri(16,24):7;
  for(let v=0;v<nv;v++){const i=ri(2,pts.length-1),p=pts[i],px=p.x+rr(-1.8,1.8),pz=p.z+rr(-1.8,1.8),gy=Y(px,pz),L=Math.max(1.5,(p.y-gy)*rr(.55,.95));
   const col=rng()<.08?shade(vary(C(pick(S.twig)),.02,.08,.05),-.1):leafCol(S.leaf,1.25);
   BIO.put('veil',[px,p.y+rr(0,1),pz],qEuler(0,rr(0,TAU),0),[rr(.45,.85),L*rr(.7,1),1],col);st.veils++;}
  clumpAt('lance',pts[3].x,pts[3].y+1,pts[3].z,rr(4,6),.7,C(pick(S.leaf)),T.x,T.y0+H*.8,T.z,T.crownR,H*.3);st.clumps++;}
 T.spread=spread(T,all);reg(T,S);};
// 8 / 20 the VASE: several stems from the foot, leaning out and forking (copper
// ringbark: pale-banded, peeling, sometimes in blossom; eyed beech: ringed eyes)
B[8]=B[20]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,ring=T.sp===8,bloom=ring&&rng()<.35;
 const nS=lv===2?ri(3,5):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nS;k++){const a=a0+k/nS*TAU+rr(-.3,.3),len=H*rr(.5,.62),o={x:T.x+Math.cos(a)*rb*.4,y:T.y0,z:T.z+Math.sin(a)*rb*.4};
  const pts=limbPts(o,a,Math.PI/2-rr(.2,.45),len,rb*rr(.7,1),rb*.5,5,-.04,.06,0);if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?7:5});all.push(...pts);
  const e=pts[5];for(let f=0;f<(lv===2?3:2);f++){const af=a+rr(-1,1),len2=H*rr(.3,.45),sp=limbPts(e,af,rr(.5,1.1),len2,rb*.45,.07,4,-.12,.1,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:5,cap:true});all.push(...sp);spots.push(sp[2],sp[3],sp[4]);if(lv===2)twigs(fam,S,sp[4],af,2,len2*.3,.1,.8,st,spots);}
  if(lv===2&&ring)for(let j=0;j<ri(2,4);j++){const p=pts[ri(0,4)],aa=rr(0,TAU);BIO.put('strand',[p.x+Math.cos(aa)*p.r,p.y,p.z+Math.sin(aa)*p.r],qFacing([Math.cos(aa),0,Math.sin(aa)]),[rr(.2,.45),rr(.4,1.2),1],shade(C(0xb0906a),-.1));}}   // peeling curls
 const cy=T.y0+H*.8,ex=T.crownR,ey=H*.3,sz0=rr(5,7);
 const inBloom=bloom?spots.filter(()=>rng()<.7):[],inLeaf=bloom?spots.filter(p=>inBloom.indexOf(p)<0):spots;
 crownOn('broad',inLeaf,sz0,.65,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);if(bloom)crownOn('blossom',inBloom,sz0,.65,()=>C(pick(PAL.blossom)),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 9 / 11 the BROADLEAF: a leaning bole and sinuous limbs (ghost sycamore: mottled
// white; flayed madrone: red over green-white, cream panicles, red berries)
B[9]=B[11]=B[24]=B[25]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,mad=T.sp===11,sprawl=mad&&rng()<.3;
 const hc=H*(sprawl?rr(.15,.25):rr(.32,.45)),bo=bole(fam,T,S,hc,rb,.5,1.5,0,lv===2?10:7,4,sprawl?rr(.25,.45):rr(.04,.18));st.trunk+=bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.65,1.0)*(sprawl?1.2:1),el=sprawl?rr(.1,.5):rr(.45,.9);
  const pts=limbPts(bo.top,a,el,len,rb*.5,.1,6,-rr(.1,.35),.12,sprawl?rr(.2,.4):.05);if(!okPts(pts))continue;
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i+=lv===2?1:2){const p=pts[i],len2=len*rr(.22,.36),sp=limbPts(p,limbDir(pts,i)+rr(-1,1),rr(.3,.9),len2,Math.max(.08,p.r*.55),.05,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],limbDir(pts,i),2,len2*.35,.1,.7,st,spots);}}
 if(!sprawl){const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.4,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),3,T.crownR*.25,-.1,.4,st,spots);}}
 const cy=T.y0+H*.72,ex=T.crownR,ey=H*.3,sz0=mad?rr(5.5,7):rr(6.5,8.5),item=(mad||T.sp===24)?'glossy':'broad';
 crownOn(item,spots,sz0,.62,()=>crownCol(S,mad?.06:0),T,cy,ex,ey,lv===2?1.6:1,st);
 // the madrone's cream panicles and red berries, at the branch tips
 if(mad&&lv===2)spots.forEach(p=>{if(rng()>.22)return;const fl=rng()<.55,col=C(pick(fl?PAL.cream:PAL.berry));for(let j=0;j<ri(4,8);j++)BIO.put('bloom',[p.x+rr(-1,1)*sz0*.35,p.y+sz0*rr(.25,.5),p.z+rr(-1,1)*sz0*.35],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),fl?rr(.3,.5):rr(.15,.25),col);st.blooms++;});
 T.spread=spread(T,all);reg(T,S);};
// 10 the EMBER MANZANITA: a knot of crooked stems, smooth blood-red and charred
// black, small grey-green leaves, urn flowers and red berries
B[10]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,n=lv===2?ri(4,7):2,spots=[],a0=rr(0,TAU),seg=lv===2?4:3,all=[];
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.4,.4),len=H*rr(.55,.85),dead=rng()<.12,col=dead?C(0x2a2420):barkC(S);
  const pts=limbPts({x:T.x+rr(-.3,.3),y:T.y0+.1,z:T.z+rr(-.3,.3)},a,rr(.8,1.35),len,rb*rr(.7,1),rb*.35,4,-.12,.16,.05);
  st.limb+=BIO.tube('bk_ember',pts,col,{seg,cap:true});all.push(...pts);
  const e=pts[4];for(let f=0;f<(lv===2?2:0);f++){const len2=len*rr(.35,.55),sp=limbPts(pts[ri(2,3)],a+rr(-1.2,1.2),rr(.5,1.1),len2,rb*.35,.03,3,-.15,.18,0);
   st.limb+=BIO.tube('bk_ember',sp,col,{seg:3});if(!dead)spots.push(sp[3]);}
  if(!dead)spots.push(e);}
 const hc=C(pick(S.leaf)),sz0=T.crownR*rr(.7,.95);
 spots.push({x:T.x,y:T.y0+H*.6,z:T.z});
 spots.forEach(p=>{clumpAt('manz',p.x,p.y+sz0*.1,p.z,sz0*rr(.8,1.15),.75,hc,T.x,T.y0+H*.7,T.z,T.crownR,H*.4);st.clumps++;
  if(lv===2&&rng()<.3){const fl=rng()<.5,col=C(fl?0xf4dce0:pick(PAL.berry));for(let j=0;j<ri(3,6);j++)BIO.put('bloom',[p.x+rr(-.6,.6),p.y+rr(-.2,.4),p.z+rr(-.6,.6)],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.1,.2),col);}});
 T.spread=spread(T,all)+T.crownR*.3;if(lv===2&&rng()<.5)reg(T,S);};
// 12 the CORK OAK: thick grey cork, gnarled limbs, a dense dark rounded crown. Only a
// HARVESTED tree (T.stripped: a grove the host asked for) has its lower bole stripped
// to raw red-orange; a wild cork oak keeps its cork.
B[12]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,stripped=!!T.stripped;
 const hs=stripped?rr(1.8,3.2):0,hc=rr(3,5);let tris=0;
 if(stripped){const SS=Object.assign({},S,{bark:S.stripped});tris+=bole('bk_lacquer',T,SS,hs,rb,.3,1,0,lv===2?11:8,2.5,0).tris;}
 const T2=Object.assign({},T,{y0:T.y0+hs}),bo=bole('bk_cork',T2,S,hc-hs+.5,rb*1.18,stripped?.05:.3,1,ri(3,5),lv===2?11:8,2.2,0);st.trunk+=tris+bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.6,.95),pts=limbPts(bo.top,a,rr(.3,.75),len,rb*.55,.1,5,-.25,.14,.08);
  if(!okPts(pts))continue;st.limb+=BIO.tube('bk_cork',pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){const p=pts[i],len2=len*rr(.25,.4),sp=limbPts(p,limbDir(pts,i)+rr(-1,1),rr(.4,1),len2,Math.max(.08,p.r*.55),.05,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube('bk_cork',sp,barkC(S),{seg:4});spots.push(sp[2],sp[3],p);if(lv===2)twigs('bk_cork',S,sp[3],limbDir(pts,i),2,len2*.4,.1,.8,st,spots);}}
 {const L=leader('bk_cork',S,T,bo.top,T.y0+H*.9,rb*.45,st,all);if(L){spots.push(L[3],L[4]);twigs('bk_cork',S,L[4],rr(0,TAU),3,T.crownR*.3,-.1,.4,st,spots);}}
 const cy=T.y0+H*.7,ex=T.crownR,ey=H*.35,sz0=rr(5.5,7.5);
 crownOn('oakleaf',spots,sz0,.7,()=>crownCol(S),T,cy,ex,ey,lv===2?1.6:1,st);
 T.spread=spread(T,all);reg(T,S);};
// 13 the SKIRT PALM: short and stout, a skirt of dead leaves, and a head of wide
// fan leaves arching out and hanging (a quarter of them the silver-blue kind)
B[13]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12),blue=rng()<.25;
 const pts=[];for(let i=0;i<=4;i++){const u=i/4;pts.push({x:T.x+Math.cos(la)*lk*H*u*u,y:T.y0+H*u,z:T.z+Math.sin(la)*lk*H*u*u,r:rb*(1+.35*Math.exp(-u*6))*(1-.12*u)});}
 st.trunk+=BIO.tube('bk_fibre',pts,barkC(S),{seg:lv===2?9:6});
 const e=pts[4],set=blue?PAL.palm.slice(4):PAL.palm.slice(0,4),hc=vary(C(pick(set)),.02,.06,.05);
 // the skirt
 for(let k=0,m=lv===2?ri(14,24):8;k<m;k++){const a=rr(0,TAU),L=H*rr(.25,.6);BIO.put('ribbon',[e.x+Math.cos(a)*rb*1.05,e.y-.2,e.z+Math.sin(a)*rb*1.05],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1,1.8),L,1],bright(vary(C(0x9a8462),.02,.08,.08),1.1));}
 // the leaves: two tiers of drooping fans, a few upright spears in the middle
 const nf=lv===2?ri(16,24):10,a0=rr(0,TAU);
 for(let k=0;k<nf;k++){const a=a0+k*GOLD,up=k%2===0,L=T.crownR*rr(.85,1.15),yaw=Math.atan2(Math.cos(a),Math.sin(a));
  BIO.put('droop',[e.x,e.y+(up?.3:-.1),e.z],qEuler(up?rr(-.55,-.15):rr(.05,.45),yaw,rr(-.1,.1)),[L*.95,L*.8,L],bright(vary(hc,.02,.05,.05),1.4));}
 for(let k=0;k<(lv===2?4:2);k++){const a=rr(0,TAU);BIO.put('fan',[e.x,e.y+.2,e.z],qEuler(rr(-.3,-.05),Math.atan2(Math.cos(a),Math.sin(a)),0),[T.crownR*.5,T.crownR*.6,1],bright(shade(hc,.1),1.4));}
 if(lv===2&&rng()<.35)for(let k=0;k<ri(2,4);k++){const a=rr(0,TAU);BIO.put('strand',[e.x+Math.cos(a)*1.2,e.y,e.z+Math.sin(a)*1.2],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(.3,.6),rr(2,3.5),1],C(pick(PAL.cream)));}
 st.fronds+=nf;};
// 15 the POMPOM CYCAD: a shaggy trunk forking into a few arms, a stiff frond crown on
// each, and over each crown a red pompom on a stalk
B[15]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,hf=H*rr(.3,.5);
 const trunk=[{x:T.x,y:T.y0-.2,z:T.z,r:rb*1.3},{x:T.x,y:T.y0+hf*.5,z:T.z,r:rb},{x:T.x,y:T.y0+hf,z:T.z,r:rb*.9}];
 st.trunk+=BIO.tube('bk_fibre',trunk,barkC(S),{seg:lv===2?8:6});
 const n=ri(2,4),a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3),arm=limbPts(trunk[2],a,rr(.8,1.2),(H-hf)*rr(.8,1.1),rb*.7,rb*.55,4,-.05,.06,.15);
  st.limb+=BIO.tube('bk_fibre',arm,barkC(S),{seg:6,cap:true});const e=arm[4],hc=vary(C(pick(S.leaf)),.02,.08,.05),nf=lv===2?ri(10,16):7,f0=rr(0,TAU);
  for(let f=0;f<nf;f++)frondAt('palmfrond',e.x,e.y,e.z,f0+f/nf*TAU+rr(-.2,.2),T.crownR*rr(.8,1.1),rr(-.9,-.1),bright(hc,1.35),.8);
  const sh=rr(1,2.2);BIO.beam('rod',[e.x,e.y,e.z],[e.x,e.y+sh,e.z],.05,.04,rodCol(0x5a6a3a));
  BIO.put('pompom',[e.x,e.y+sh+.35,e.z],qEuler(0,rr(0,TAU),0),[rr(.4,.6),rr(.45,.7),rr(.4,.6)],bright(C(pick(S.bloom)),.8));
  if(lv===2)for(let j=0;j<ri(3,6);j++){const aa=rr(0,TAU);BIO.put('ribbon',[e.x+Math.cos(aa)*rb*.6,e.y-.3,e.z+Math.sin(aa)*rb*.6],qFacing([Math.cos(aa),0,Math.sin(aa)]),[rr(.6,1),rr(1,2.5),1],bright(C(0x8a7458),1.05));}
  st.fronds+=nf;}};
// 16 / 18 the TIERED tree: a column carrying level limbs in tiers, each limb bearing flat
// pads, the lowest tiers widest (tier cedar: blue-green needles; crimson ghost: cream
// bark cracked with gold, pads of crimson leaves)
B[16]=B[18]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,crim=T.sp===18;
 const bo=bole(fam,T,S,H*.88,rb,.5,1.6,crim?0:ri(3,5),lv===2?10:7,4,rr(0,.05));st.trunk+=bo.tris;
 const nT=ri(S.tiers[0],S.tiers[1]),all=[],hc=C(pick(S.leaf));
 for(let t=0;t<nT;t++){const f=t/(nT-1||1),yy=T.y0+H*mix(crim?.35:.28,.9,f),nL=lv===2?ri(3,5):3,a0=rr(0,TAU);
  for(let k=0;k<nL;k++){const a=a0+k/nL*TAU+rr(-.4,.4),len=T.crownR*mix(1,.4,Math.pow(f,1.2))*rr(.7,1),pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(-.02,.18),len,rb*mix(.45,.25,f),.08,4,-.06,.08,.1);
   if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4,cap:true});all.push(...pts);
   for(let i=1;i<pts.length;i++){const p=pts[i],sz=Math.max(4,len*rr(.38,.55))*(crim?1.15:1);if(!clear3(p.x,p.y+1,p.z,sz*.5,sz*.2))continue;
    for(let c=0;c<(lv===2?3:1);c++)clumpAt(S.item,p.x+rr(-1,1)*sz*.3,p.y+sz*rr(.05,.2),p.z+rr(-1,1)*sz*.3,sz*rr(.85,1.15),crim?.32:.26,crim?C(pick(S.leaf)):hc,T.x,p.y-1,T.z,T.crownR,H*.15);st.clumps+=lv===2?2:1;}}}
 clumpAt(S.item,bo.top.x,T.y0+H*.95,bo.top.z,T.crownR*.3,.35,hc,T.x,T.y0+H*.8,T.z,T.crownR,H*.2);st.clumps++;
 T.spread=spread(T,all);reg(T,S);};
// 17 the FLATWOOD PINE: a tall straight red-plated pole, a few stubs, a small crown of needle pads
B[17]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.92,rb,.25,1.2,0,lv===2?7:5,4,rr(0,.02));st.trunk+=bo.tris;
 const n=lv===2?ri(5,7):3,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k*GOLD,yy=T.y0+H*rr(.68,.9),len=T.crownR*rr(.6,1),pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(.1,.5),len,rb*.25,.06,3,-.1,.1,.2);
  st.limb+=BIO.tube(fam,pts,barkC(S),{seg:4,cap:true});
  for(let i=1;i<=3;i++)clumpAt('needle',pts[i].x,pts[i].y+.6,pts[i].z,rr(3.4,4.6),.6,C(pick(S.leaf)),T.x,T.y0+H*.9,T.z,T.crownR,H*.12);st.clumps+=2;}
 clumpAt('needle',bo.top.x,T.y0+H*.93,bo.top.z,rr(3,4),.8,C(pick(S.leaf)),T.x,T.y0+H*.9,T.z,T.crownR,H*.12);st.clumps++;
 if(lv===2)for(let k=0;k<ri(2,5);k++){const a=rr(0,TAU),yy=T.y0+H*rr(.3,.6);BIO.beam('rod',[T.x+bo.lx*(yy-T.y0),yy,T.z+bo.lz*(yy-T.y0)],[T.x+Math.cos(a)*rr(1,2.2),yy+rr(-.2,.4),T.z+Math.sin(a)*rr(1,2.2)],.07,.03,C(0x3a3430));}
 T.spread=T.crownR;if(lv===2)reg(T,S);};
// 19 the RATTLE-POD: a short trunk, rising limbs spread into a wide flat top of feathery
// leaves, clusters of long red pods hanging under it
B[19]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.35,rb,.4,1,0,lv===2?9:6,3,rr(.02,.12));st.trunk+=bo.tris;
 const nL=lv===2?ri(4,6):3,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.3,.3),len=T.crownR*rr(.75,1.05),pts=limbPts(bo.top,a,rr(.5,.85),len,rb*.5,.08,5,-.3,.08,.05);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){spots.push(pts[i]);if(lv===2)twigs(fam,S,pts[i],a,1,len*.2,.3,1,st,spots);}}
 const cy=T.y0+H*.9,sz0=rr(4.5,6),hc=C(pick(S.leaf));
 crownOn('feather',spots,sz0,.3,()=>hc,T,cy,T.crownR,H*.15,lv===2?1.5:1,st);
 spots.forEach(p=>{
  if(lv>=1&&rng()<.45){const pc=C(pick(S.pod));for(let j=0,m=ri(3,7);j<m;j++){const L=rr(.9,1.6);BIO.put('pod',[p.x+rr(-.8,.8),p.y-.2,p.z+rr(-.8,.8)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[L*.5,L,L*.5],bright(vary(pc,.02,.08,.06),.9));st.pods++;}}});
 T.spread=spread(T,all);reg(T,S);};

// 21 / 22 the FLOWERING PARASOL (flame parasol: scarlet; violet jacaranda: lilac): a
// short bole, limbs spreading out and low into a very wide flat dome of fine leaves,
// and the flowers where a flowering tree has them -- over the top of the crown, at the
// branch ends. The flame parasol hangs long dark pods under it.
B[21]=B[22]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb,flame=T.sp===21;
 const hc=H*rr(.25,.35),bo=bole(fam,T,S,hc,rb,.6,1.2,flame?ri(3,5):0,lv===2?10:7,3,rr(.02,.1));st.trunk+=bo.tris;
 const nL=lv===2?ri(5,7):4,a0=rr(0,TAU),spots=[],all=[];
 for(let k=0;k<nL;k++){const a=a0+k*GOLD+rr(-.25,.25),pts=archPts({x:bo.top.x+Math.cos(a)*rb*.4,y:T.y0+hc,z:bo.top.z+Math.sin(a)*rb*.4},a,T.crownR*rr(.8,1),(H-hc)*rr(.55,.8),rr(.45,.6),(H-hc)*rr(.2,.45),rb*.5,.08,lv===2?7:5,.1);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?6:5,cap:true});all.push(...pts);
  for(let i=2;i<pts.length;i++){const p=pts[i],sp=limbPts(p,limbDir(pts,i)+rr(-1.2,1.2),rr(.3,.9),T.crownR*rr(.15,.25),Math.max(.07,p.r*.55),.04,3,-.1,.12,0);
   if(!okPts(sp))continue;st.limb+=BIO.tube(fam,sp,barkC(S),{seg:4});spots.push(sp[2],sp[3]);if(lv===2)twigs(fam,S,sp[3],a,2,2.5,.2,.9,st,spots);}}
 {const L=leader(fam,S,T,bo.top,T.y0+H*.92,rb*.4,st,all);if(L){spots.push(L[3],L[4]);twigs(fam,S,L[4],rr(0,TAU),4,T.crownR*.25,0,.4,st,spots);}}
 // the flowers take the TOP of the crown: the highest share of the branch ends
 const ys=spots.map(p=>p.y).sort((a,b)=>a-b),cut=ys[Math.floor(ys.length*(1-S.bloomK))]||1e9;
 const inBloom=spots.filter(p=>p.y>=cut&&rng()<.85),inLeaf=spots.filter(p=>inBloom.indexOf(p)<0);
 const cy=T.y0+H*.85,ex=T.crownR,ey=H*.18,sz0=rr(5,6.5);
 crownOn('feather',spots,sz0,.32,()=>C(pick(S.leaf)),T,cy,ex,ey,lv===2?1.2:.8,st);
 crownOn('blossom',inBloom,sz0*.85,.3,()=>vary(C(pick(S.flower)),.01,.05,.04),T,cy,ex,ey,lv===2?1.3:.9,st);st.blooms+=inBloom.length;
 if(flame&&lv===2)inLeaf.forEach(p=>{if(rng()>.25)return;for(let j=0,m=ri(3,6);j<m;j++){const L=rr(1.2,2);BIO.put('pod',[p.x+rr(-.8,.8),p.y-.2,p.z+rr(-.8,.8)],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[L*.35,L,L*.35],C(pick(S.pod)));st.pods++;}});
 T.spread=spread(T,all);reg(T,S);};
// 23 the LANTERN MAGNOLIA: a straight grey column, short limbs up its length into a
// broad dome of big glossy leaves, and at the branch ends big cream-white flowers
// held upright like lanterns
B[23]=function(T,st,lv){const S=SP[T.sp],fam=S.bk,H=T.H,rb=T.rb;
 const bo=bole(fam,T,S,H*.8,rb,.4,1.4,0,lv===2?10:7,4,rr(0,.04));st.trunk+=bo.tris;
 const spots=[],all=[],nT=lv===2?ri(9,13):6;
 for(let k=0;k<nT;k++){const u=mix(.25,.85,k/(nT-1)),yy=T.y0+H*.8*u,a=k*GOLD+rr(-.3,.3),len=T.crownR*mix(1,.45,u)*rr(.75,1.05);
  const pts=limbPts({x:T.x+bo.lx*(yy-T.y0),y:yy,z:T.z+bo.lz*(yy-T.y0)},a,rr(.25,.7),len,rb*mix(.4,.22,u),.07,4,-.15,.1,.15);
  if(!okPts(pts))continue;st.limb+=BIO.tube(fam,pts,barkC(S),{seg:lv===2?5:4,cap:true});all.push(...pts);spots.push(pts[2],pts[3],pts[4]);
  if(lv===2)twigs(fam,S,pts[4],a,2,len*.25,.2,.9,st,spots);}
 spots.push(bo.top);
 crownOn('glossy',spots,rr(4.5,6),.65,()=>C(pick(S.leaf)),T,T.y0+H*.6,T.crownR,H*.4,lv===2?1.4:.9,st);
 // flowers at the branch ends, on the OUTSIDE of the dome where they are seen, cupped and facing up
 // each flower on its own twig, grown from the branch end outward and up to where it shows
 if(lv>=1)spots.forEach(p=>{if(rng()>(lv===2?.6:.3))return;const s=rr(.5,.8),dx=p.x-T.x,dz=p.z-T.z,dl=Math.hypot(dx,dz)||1,o=rr(2,3),tip={x:p.x+dx/dl*o,y:p.y+rr(1.2,2.2),z:p.z+dz/dl*o,r:.035};
  st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:Math.max(.05,(p.r||.1)*.6)},{x:mix(p.x,tip.x,.6),y:mix(p.y,tip.y,.45),z:mix(p.z,tip.z,.6),r:.05},tip],barkC(S),{seg:3});
  BIO.put('bloom',[tip.x,tip.y+s*.15,tip.z],qEuler(rr(-.35,.35)+Math.PI/2*.85,rr(0,TAU),rr(-.3,.3)),[s,s,s],bright(C(pick(S.flower)),1.05));st.blooms++;});
 T.spread=spread(T,all);reg(T,S);};

// ---------------------------------------------------------------- impostors (the far canopy)
// Blobs in the 'far' bucket. The wide species get flattened, overlapping blobs out
// to their real width, so the silhouette from the hills reads WIDE too.
let ICO=null;
function buildFar(T,fi,st){const K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;
 const S=SP[T.sp],cheap=BIO.lodD(T.x,T.z)>2200;let tris=0;
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2];
   const m=1+.20*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2)+.14*Math.sin(dy*6.3+k2+dx*2);
   const sh=(.50+.50*smooth(-.7,.8,dy))*(.9+.2*Math.sin(dx*9+dz*7+k1)),t=smooth(-.2,.7,dy+.3*Math.sin(dx*5+k2));
   const ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const bc=C(S.bark[fi%S.bark.length]).convertSRGBToLinear(),seg=cheap?4:6,shape={5:'wide',14:'wide',26:'wide',24:'wide',6:'wide',2:'parasol',1:'flat',16:'tier',18:'tier',17:'pine',19:'flat',7:'weep',21:'flat',22:'flat'}[T.sp]||'round';
 const top=T.y0+T.H*(shape==='wide'?.25:shape==='pine'?.9:.6),rings=[];
 [0,.06,.5,1].forEach(u=>{const y=T.y0+(top-T.y0)*u,r=Math.max(.4,T.rb*(1-.5*u)*(u<.08?1.5:1)),ring=[];for(let s=0;s<=seg;s++){const a=s/seg*TAU;ring.push([T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}rings.push(ring);});
 for(let r2=0;r2<rings.length-1;r2++)for(let s2=0;s2<seg;s2++){const A=rings[r2][s2],Bq=rings[r2][s2+1],D=rings[r2+1][s2],E=rings[r2+1][s2+1],sh=.45*(.7+.3*(r2/rings.length));
  [A,D,E,A,E,Bq].forEach(p=>vtx(p[0],p[1],p[2],p[3],.05,p[4],bc.r*sh,bc.g*sh,bc.b*sh));tris+=2;}
 const L=(S.flower&&T.sp!==23?S.flower:S.leaf).map(h=>bright(h,.85)),R=T.crownR,H=T.H,a0=(T.seed%628)/100,n=L.length;
 if(shape==='wide'){const m=cheap?3:5;blob(T.x,T.y0+H*.75,T.z,R*.55,H*.22,L[fi%n],L[(fi+2)%n],fi);
  for(let k=0;k<m;k++){const a=a0+k/m*TAU;blob(T.x+Math.cos(a)*R*.58,T.y0+H*mix(.5,.68,(k*7%5)/5),T.z+Math.sin(a)*R*.58,R*.42,H*.18,L[(k+fi)%n],L[(k+1)%n],fi+k);}}
 else if(shape==='parasol'){blob(T.x,T.y0+H*.85,T.z,R*.85,H*.09,L[fi%n],L[(fi+1)%n],fi);if(!cheap)blob(T.x,T.y0+H*.72,T.z,R*.55,H*.07,L[1%n],L[2%n],fi+3);}
 else if(shape==='tier'){for(let k=0;k<(cheap?2:3);k++)blob(T.x,T.y0+H*mix(.4,.88,k/2),T.z,R*mix(.9,.4,k/2),H*.06,L[(k+fi)%n],L[(k+1)%n],fi+k);}
 else if(shape==='pine'){blob(T.x,T.y0+H*.92,T.z,R*.8,H*.1,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='flat'){blob(T.x,T.y0+H*.86,T.z,R*.9,H*.12,L[fi%n],L[(fi+1)%n],fi);}
 else if(shape==='weep'){blob(T.x,T.y0+H*.55,T.z,R*.85,H*.42,L[fi%n],L[(fi+1)%n],fi);}
 else{blob(T.x,T.y0+H*.72,T.z,R*.85,H*.25,L[fi%n],L[(fi+2)%n],fi);}
 K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// the SMALL species far off: one 20-triangle blob in the leaf colour, so the chaparral
// and the palm groves still read at range instead of stopping at the band edge
let ICO0=null;
function buildFarSmall(T,st){const K=BIO.bucket('far');if(!ICO0)ICO0=new T3.IcosahedronGeometry(1,0).attributes.position.array;const S=SP[T.sp],ip=ICO0;
 const ca=bright(C(pick(S.leaf)),.85).convertSRGBToLinear(),cb=ca.clone().multiplyScalar(.55),R=T.crownR*.85,H=T.H,cy=T.y0+H*.62;
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],t=smooth(-.5,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
  K.pos.push(T.x+dx*R,cy+dy*Math.max(R*.6,H*.38),T.z+dz*R);K.nor.push(dx/nl,ny/nl,dz/nl);K.uv.push(0,0);K.col.push(mix(cb.r,ca.r,t),mix(cb.g,ca.g,t),mix(cb.b,ca.b,t));}
 const tris=ip.length/9;K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the pass
SWLOW.buildTrees=function(R,q,opt){opt=opt||{};
 reseed(550021);q=q==null?1:q;R=R||2850;means();
 const st={trunk:0,limb:0,far:0,limbs:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,knees:0,veils:0,pillars:0,roots:0,epi:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const TREES=SWLOW.TREES;TREES.length=0;for(const k in HASH)delete HASH[k];
 const mk=(x,y,z,sp)=>{const S=SP[sp];return{x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),wet:BIO.field('wet',x,z)};};
 // one species pass: a jittered grid over the whole disc, the zone weight as
 // acceptance; hero/mid say where it becomes an impostor (far:true) or stops.
 // inWater:[lo,hi] roots it on the bed between those heights, past the mask.
 // DENS: the showcase's overall stocking at q=1, measured against the budget (KNOWN_ISSUES);
 // the sprawl oaks are exempt -- they are what the lowlands are
 const DENS=.75;
 function pass(sp,cell,accept,opt){opt=opt||{};let n=0;const pad=opt.pad==null?4:opt.pad;
  BIO.grid(cell,0,R,(x,z,d)=>{const Z=zones(x,z);const a=accept(Z,x,z);if(a<=0)return 0;
    return a*(opt.lodK?lerp(1,BIO.lod(x,z),opt.lodK):1)*q*(opt.dens==null?DENS:opt.dens);},
   (x,y,z,d)=>{if(!opt.inWater&&y<.3)return;if(opt.inWater&&(y<opt.inWater[0]||y>opt.inWater[1]))return;
    if(blocked(x,z,pad))return;if(!BIO.clearOf(x,z,pad+2))return;
    const T=mk(x,y,z,sp),ld=BIO.lodD(x,z);T.lv=ld<opt.hero?2:(ld<opt.mid?1:0);
    if(T.lv===0&&!opt.far)return;
    TREES.push(T);hadd({x:x,z:z,r:(opt.own==null?T.rb*1.5+1:T.crownR*opt.own),rt:T.rb*1.6+.8});n++;},{patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale||.01,noMask:!!opt.inWater,pad:1});
  return n;}
 // AVENUES (allées) first: the host may ask for rows of a species along a path, e.g. a
 // live-oak avenue down a road. {path:[[x,z],...], spacing, offset, species}. Each tree
 // knows the road's direction (T.bias) and arches over it.
 (opt.avenues||[]).forEach(av=>{const P=av.path,sp=SP.findIndex(S=>S.key===(av.species||'sprawloak')),gap=av.spacing||22,off=av.offset||13;let carry=gap*.5;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;let d=carry;
   for(;d<L;d+=gap*rr(.9,1.1))[-1,1].forEach(side=>{const o=off+rr(-.8,1.8),dj=d+rr(-2,2),x=a[0]+ux*dj-uz*side*o,z=a[1]+uz*dj+ux*side*o,y=Y(x,z);
    if(y<.3||!BIO.clearOf(x,z,6)||blocked(x,z,3))return;const T=mk(x,y,z,sp);T.bias=Math.atan2(-side*ux,side*uz);
    const ld=BIO.lodD(x,z);T.lv=ld<1100?2:ld<1700?1:0;TREES.push(T);hadd({x,z,r:T.crownR*.4,rt:T.rb*1.6+.8});st.avenue=(st.avenue||0)+1;});
   carry=d-L;}});
 // GROVES: a planted, harvested stand. {center:[x,z], r, spacing, species, stripped}.
 // Rows on a jittered square grid (a planting, not a wild stand); stripped:true marks the
 // cork oaks as harvested -- the only stripped cork in the biome.
 (opt.groves||[]).forEach(gv=>{const sp=SP.findIndex(S=>S.key===(gv.species||'corkoak')),g=gv.spacing||16,r=gv.r||60,c=gv.center,ang=gv.angle||0,ca=Math.cos(ang),sa=Math.sin(ang);
  for(let i=-Math.ceil(r/g);i<=Math.ceil(r/g);i++)for(let j=-Math.ceil(r/g);j<=Math.ceil(r/g);j++){const u=i*g+rr(-1.5,1.5),v=j*g+rr(-1.5,1.5);if(Math.hypot(u,v)>r)continue;
   const x=c[0]+u*ca-v*sa,z=c[1]+u*sa+v*ca,y=Y(x,z);if(y<.3||BIO.mask(x,z)<=0||!BIO.clearOf(x,z,4)||blocked(x,z,2))continue;
   const T=mk(x,y,z,sp);T.stripped=!!gv.stripped;T.crownR*=.8;const ld=BIO.lodD(x,z);T.lv=ld<1100?2:ld<1700?1:0;TREES.push(T);hadd({x,z,r:g*.45,rt:T.rb*1.6+.8});st.grove=(st.grove||0)+1;}});
 // the giants first: they claim their ground (own: a share of the crown radius is kept clear of other giants)
 pass(2,170,Z=>Z.rain*.55,{hero:1100,mid:1800,far:true,pad:14,own:.55,patch:.2});                          // parasol kapok
 pass(5,105,Z=>Z.sub*(1-Z.pineK)*.56*smooth(.55,.8,Z.wet),{hero:800,mid:1500,far:true,pad:12,own:.5,patch:.3,dens:1}); // sprawl oak
 pass(6,150,Z=>(Z.sub*smooth(.25,.55,Z.tropic)+Z.rain*.25)*.7,{hero:1000,mid:1600,far:true,pad:14,own:.55,patch:.3}); // pillar fig
 pass(14,90,Z=>Z.med*(1-Z.chapK)*.42*smooth(.3,.5,Z.wet+.1),{hero:900,mid:1500,far:true,pad:9,own:.45,patch:.4});   // coast oak
 pass(16,110,Z=>Z.med*smooth(.3,.6,Z.up)*.55,{hero:1000,mid:1700,far:true,pad:10,own:.45,patch:.4});              // tier cedar
 pass(18,210,Z=>(Z.sub*.35+Z.med*.4)*(1-Z.chapK*.5),{hero:1000,mid:1700,far:true,pad:8,own:.4,patch:.2});         // crimson ghost: rare
 // the bayou and the shore
 pass(0,32,Z=>Z.mang*.85,{hero:900,mid:1400,far:true,pad:2,inWater:[-1.7,.3],own:.3,patch:.6});                 // lantern mangrove
 pass(1,52,Z=>Z.swamp*.45+Z.rain*smooth(.9,.97,Z.wet)*.18,{hero:900,mid:1400,far:true,pad:5,inWater:[-1.9,3.5],own:.35,patch:.5}); // knee-cypress
 pass(3,70,Z=>Z.rain*.4+Z.sub*smooth(.3,.6,Z.tropic)*.15,{hero:900,mid:1500,far:true,pad:6,patch:.4});          // ribbon gum
 pass(4,30,Z=>Z.rain*.5+Z.swamp*.25+Z.sub*smooth(.2,.5,Z.tropic)*.12,{hero:700,mid:1100,far:true,pad:1.5,lodK:.5});   // lacquer cane palm
 // the plain
 pass(7,40,Z=>(Z.rip*.7+smooth(.9,.97,Z.wet)*smooth(4,1.5,Z.h)*.3)*(1-Z.med*.7)*(1-Z.rain*.7),{hero:900,mid:1400,far:true,pad:4,own:.35});   // veil willow
 pass(17,34,Z=>Z.sub*Z.pineK*.6,{hero:800,mid:1400,far:true,pad:2,patch:.3});                                    // flatwood pine
 pass(20,80,Z=>Z.sub*.18*smooth(.6,.8,Z.wet),{hero:900,mid:1500,far:true,pad:5,patch:.5});                        // eyed beech
 pass(8,55,Z=>Z.sub*.14+Z.med*.12*smooth(.3,.5,Z.wet),{hero:850,mid:1300,far:true,pad:3,lodK:.5,patch:.5});     // copper ringbark
 // the hills
 pass(9,48,Z=>Z.rip*(Z.med+Z.sub*.4)*.7,{hero:900,mid:1500,far:true,pad:4});                                      // ghost sycamore
 pass(11,60,Z=>Z.med*(1-Z.chapK)*.45*smooth(.28,.45,Z.wet),{hero:900,mid:1500,far:true,pad:4,patch:.5});         // flayed madrone
 pass(12,64,Z=>Z.med*(1-Z.chapK*.7)*.35,{hero:900,mid:1500,far:true,pad:4,patch:.5});                             // cork oak
 pass(19,90,Z=>Z.med*.22*(1-Z.up)+Z.sub*.03,{hero:900,mid:1500,far:true,pad:5,patch:.5});                         // rattle-pod
 pass(13,32,Z=>Z.med*(Z.rip*.7+.05)+Z.sub*.03+Z.beach*.08,{hero:1000,mid:1600,far:true,pad:2.5,lodK:.4,patch:.6});// skirt palm
 pass(24,85,Z=>(Z.sub*smooth(.25,.6,Z.tropic)+Z.rain*.15)*.55,{hero:1000,mid:1700,far:true,pad:6,own:.35,patch:.4});   // sunburn tree
 pass(25,70,Z=>Z.sub*.3*smooth(.6,.8,Z.wet)*(1-Z.pineK),{hero:1000,mid:1700,far:true,pad:5,patch:.4});                 // star gum
 pass(26,70,Z=>Z.med*(1-Z.chapK*.6)*.5*smooth(.28,.5,Z.wet+.08),{hero:1000,mid:1700,far:true,pad:6,own:.35,patch:.4}); // bay laurel
 pass(21,95,Z=>(Z.sub*smooth(.3,.6,Z.tropic)+Z.rain*.12)*.4,{hero:1000,mid:1700,far:true,pad:6,own:.4,patch:.4});   // flame parasol
 pass(22,85,Z=>Z.sub*.1+Z.med*.14*smooth(.3,.5,Z.wet),{hero:1000,mid:1600,far:true,pad:5,own:.35,patch:.45});    // violet jacaranda
 pass(23,75,Z=>Z.sub*.22*smooth(.6,.8,Z.wet)*(1-Z.pineK),{hero:1000,mid:1600,far:true,pad:5,patch:.45});          // lantern magnolia
 pass(15,60,Z=>Z.med*Z.chapK*.28,{hero:800,mid:1200,far:true,pad:2,lodK:.5,patch:.6});                            // pompom cycad
 pass(10,20,Z=>Z.med*Z.chapK*.5,{hero:600,mid:1000,far:true,pad:.8,lodK:.6,patch:.35});                          // ember manzanita
 // build
 const trisS=SP.map(()=>0),cur=()=>{const t=BIO.stats[BIO.cur||'biome'];return t?t.tris:0;};
 const SMALL={4:1,8:1,10:1,13:1,15:1};
 TREES.forEach((T,i)=>{const t0=cur();if(T.lv===0){if(SMALL[T.sp])buildFarSmall(T,st);else buildFar(T,i,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;trisS[T.sp]+=cur()-t0;});
 return{trees:TREES.length,avenue:st.avenue||0,grove:st.grove||0,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),trisBySpecies:SP.map((S,i)=>S.key+':'+Math.round(trisS[i]/1000)+'k').join(' '),limbs:st.limbs,clumps:st.clumps,moss:st.moss,pillars:st.pillars,veils:st.veils,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
// ONE TREE AT A POINT. A world that plants a garden, a courtyard or a sacred grove asks for a
// species by key at an explicit (x,y,z): no zone, no mask, no LOD (always the hero build).
// opt.scale shrinks a species to a young or clipped specimen (H, rb, crownR all by it).
SWLOW.treeAt=function(species,x,y,z,opt){opt=opt||{};means();const sp=typeof species==='number'?species:SP.findIndex(S=>S.key===species);if(sp<0)return null;
 const S=SP[sp],k=opt.scale==null?1:opt.scale;if(opt.seed!=null)reseed(opt.seed);
 const st={trunk:0,limb:0,far:0,limbs:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,knees:0,veils:0,pillars:0,roots:0,epi:0,heroes:0,fars:0,byS:SP.map(()=>0)};
 const T={x:x,z:z,y0:y-.4,sp:sp,H:rr(S.H[0],S.H[1])*k,rb:rr(S.rb[0],S.rb[1])*k,crownR:rr(S.crownR[0],S.crownR[1])*k,seed:ri(0,999999),wet:opt.wet==null?.6:opt.wet,lv:2};
 if(opt.bias!=null)T.bias=opt.bias;SWLOW.TREES.push(T);hadd({x:x,z:z,r:T.crownR*.4,rt:T.rb*1.6+.8});B[T.sp](T,st,2);return T;};
SWLOW._canopyH=function(x,z){let h=0;for(const T of SWLOW.TREES){if(Math.hypot(x-T.x,z-T.z)<Math.max(40,T.crownR))h=Math.max(h,T.y0+T.H);}return h||10;};
})();
// ================================================================= SOUTHWESTERN LOWLANDS — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (SWLOW.zones):
//   the BEACH       sea oats and dune grass, beach vine with lilac flowers
//   the RAINFOREST  elephant ears, heliconias in red and gold, ferns and forking
//                   ferns, bromeliads on the ground, young cane palms, moss
//   the BAYOU       saw palmetto, ferns, purple flag iris, sedge, moss
//   the WATER       lily pads carpeting the still bayou, water hyacinth, duckweed,
//                   reeds in the shallows
//   the PLAIN       green glades, saw-palmetto carpets under the flatwood pines,
//                   ferns, azaleas in flower, leaf litter
//   the HILLS       chaparral (dark and red scrub, yuccas with tall flower stalks)
//                   in patches through golden grass with feather-grass tussocks,
//                   poppies, lupins, salvia, mullein spikes, sage, agaves, aloes,
//                   pincushion shrubs, sandstone and red rock
// Three LOD bands along the spine (near / mid / far) at 7 / 14 / 30 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SWLOW.PAL,zones=SWLOW.zones,blocked=SWLOW.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=SWLOW;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);
// patch fields local to the floor
const poppyK=(x,z)=>smooth(.5,.64,fbm(x*.0045-5,z*.0045+2,3131,2));
const lupinK=(x,z)=>smooth(.52,.66,fbm(x*.0051+9,z*.0051-3,3132,2));
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function groundMoss(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(set||PAL.moss,.95,.03));}
function blooms(x,y,z,r,n,set,sz,h){const c=bright(vary(pick(set),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.16,.34);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(.05,h==null?.4:h),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set,item){const hc=vary(pick(set||PAL.fern),.06,.14,.07);
 frondCrown(x,y-.1,z,rr(1.6,3.2)*(item==='forkfern'?1.3:1),lv===2?ri(5,7):lv===1?4:3,.05,.45,bright(hc,1.7),item);}
function giantFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.05,.14,.07),R=rr(3,5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');}
function shrub(x,y,z,lv,set,k){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.2,2.8)*(k||1);
 if(lv===2){if(rng()<.6)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1),Rs],shade(vary(hc,.03,.1,.05),-.15));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}}
 else{const s=Rs*1.7;card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));}
 return Rs;}
function palmetto(x,y,z,lv,st){const hc=vary(pick(PAL.palmetto),.03,.1,.06),n=lv===2?ri(5,9):lv===1?4:3,a0=rr(0,TAU),L=rr(1.1,2);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.3,.3);BIO.put('fan',[x+Math.cos(a)*.3,y-.1,z+Math.sin(a)*.3],qEuler(rr(.15,.9),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.1,.1)),[L*rr(.9,1.2),L*rr(.9,1.1),1],bright(vary(hc,.02,.06,.05),1.45));}st.palmettos++;}
function earCluster(x,y,z,lv,st){const n=lv===2?ri(3,6):2,hc=vary(pick(PAL.aroid),.03,.1,.06);
 for(let k=0;k<n;k++){const a=rr(0,TAU),L=rr(1,2.2),stem=rr(.4,1.2),px=x+Math.cos(a)*.3,pz=z+Math.sin(a)*.3;
  if(lv===2)BIO.beam('rod',[px,y,pz],[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],.03,.02,rodCol(0x4a6a3a));
  BIO.put('heart',[px+Math.cos(a)*.3,y+stem,pz+Math.sin(a)*.3],qEuler(rr(.5,1.1),Math.atan2(Math.cos(a),Math.sin(a)),rr(-.2,.2)),[L*.8,L,1],bright(vary(hc,.02,.08,.06),1.45));}st.ears++;}
function heliconia(x,y,z,lv,st){const h=rr(1.2,2.6),hc=vary(pick(PAL.aroid),.03,.1,.06);tuft('spike',x,y,z,h,h*.8,bright(hc,1.4));
 if(lv>=1){const col=C(pick(PAL.heliconia));for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),bx=x+Math.cos(a)*.3,bz=z+Math.sin(a)*.3,top=y+h*rr(.6,.95);
  if(lv===2)BIO.beam('rod',[bx,y,bz],[bx,top,bz],.025,.02,rodCol(0x4a6a3a));
  for(let j=0;j<ri(4,7);j++)BIO.put('bloom',[bx+rr(-.1,.1),top-j*.14,bz+rr(-.1,.1)],qEuler(rr(-.3,.3),rr(0,TAU),rr(.6,1.2)),rr(.22,.34),bright(vary(col,.02,.06,.05),1.1));}}st.helic++;}
function brom(x,y,z,st){const R=rr(.4,.9),c=rng()<.5?vary(pick(PAL.heliconia),.02,.1,.06):vary(pick(PAL.aroid),.03,.1,.06);
 BIO.put('brom',[x,y-.03,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[R,R*1.1,R],bright(c,1.1));st.brom++;}
function youngCane(x,y,z,lv,st){const S=SWLOW.SPECIES[4],n=ri(2,4);
 for(let k=0;k<n;k++){const px=x+rr(-.6,.6),pz=z+rr(-.6,.6),h=rr(1.2,3);BIO.beam('rod',[px,y-.1,pz],[px,y+h,pz],.05,.04,rodCol(pick(S.crownshaft)));
  frondCrown(px,y+h,pz,rr(1.2,2),ri(3,5),-.8,-.2,leafCol(S.leaf,1.4),'palmfrond');}st.canes++;}
function iris(x,y,z,lv,st){const h=rr(.7,1.2);tuft('spike',x,y,z,h,h*.6,leafCol(PAL.reed,1.35,.03));if(lv>=1)blooms(x,y+h*.75,z,.35,ri(2,4),PAL.iris,[.14,.24],.25);st.iris++;}
function reed(x,y,z,lv){const h=rr(1.4,2.8)*(lv===0?1.5:1),n=lv===2?ri(2,4):1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.6,2):0;tuft('reed',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(PAL.reed,1.35,.025));}}
function sedge(x,y,z,lv,set){const h=rr(.5,1.1)*(lv===0?1.5:1);tuft('grass',x,y,z,h,h*1.3,leafCol(set||PAL.grassGreen,1.35,.03));}
function grassTuft(x,y,z,lv,set,hk,k){const h=rr(.5,1.1)*(hk||1)*(lv===0?1.6:1),n=lv===2?(k||ri(2,4)):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,1.8):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(set,1.3,.03));}}
function azalea(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.shrub,.8);if(lv>=1)blooms(x,y+Rs*.6,z,Rs*.9,lv===2?ri(10,18):5,PAL.azalea,[.2,.34],Rs*.6);st.azaleas++;}
function yucca(x,y,z,lv,st){const h=rr(.8,1.4);tuft('spike',x,y,z,h,h*1.3,leafCol(PAL.agave,1.3,.02));
 if(lv>=1&&rng()<.5){const sh=rr(2.5,4.5),c=C(pick(PAL.cream));BIO.beam('rod',[x,y+h*.4,z],[x,y+sh,z],.05,.035,rodCol(0x7a6a4a));
  for(let j=0;j<(lv===2?ri(22,34):8);j++){const yy=y+sh*rr(.5,1),a=rr(0,TAU),d=(y+sh-yy)*.28+.12;BIO.put('bloom',[x+Math.cos(a)*d,yy,z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),rr(.2,.32),bright(c,1.15));}}st.yuccas++;}
function mullein(x,y,z,lv,st){const h=rr(1.2,2.4),c=C(pick(PAL.mullein));BIO.put('rosette',[x,y,z],qEuler(0,rr(0,TAU),0),[.45,.3,.45],leafCol(PAL.sage,1.1));
 if(lv>=1){BIO.beam('rod',[x,y,z],[x,y+h,z],.04,.03,rodCol(0x8a9a78));for(let j=0;j<(lv===2?12:5);j++){const yy=y+h*rr(.35,1),a=rr(0,TAU);BIO.put('bloom',[x+Math.cos(a)*.08,yy,z+Math.sin(a)*.08],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),rr(.1,.16),bright(c,1.1));}}st.spikes++;}
function aloe(x,y,z,lv,st){const h=rr(.5,.9);tuft('spike',x,y,z,h,h*1.5,leafCol(PAL.agave,1.25,.02));
 if(lv>=1){for(let k=0,m=ri(1,3);k<m;k++){const px=x+rr(-.3,.3),pz=z+rr(-.3,.3),sh=rr(.9,1.6),c=C(pick(PAL.aloe));BIO.beam('rod',[px,y,pz],[px,y+sh,pz],.03,.02,rodCol(0x6a5a3a));
  for(let j=0;j<ri(4,7);j++)BIO.put('bloom',[px+rr(-.06,.06),y+sh-j*.09,pz+rr(-.06,.06)],qEuler(rr(-.3,.3),rr(0,TAU),rr(.8,1.2)),rr(.12,.18),bright(c,1.1));}}st.aloes++;}
function agave(x,y,z,lv,st){const R=rr(.5,1.2);BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,R*.9,R],bright(vary(pick(PAL.agave),.02,.08,.05),1.05));st.agaves++;}
function pincushion(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.chap,.6);if(lv>=1){const c=C(pick(PAL.pincushion));for(let k=0;k<(lv===2?ri(5,10):3);k++){const a=rr(0,TAU),d=Rs*rr(.2,.8);
 BIO.put('pompom',[x+Math.cos(a)*d,y+Rs*rr(.6,1.1),z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),rr(.13,.2),bright(c,.85));}}st.shrubs++;}
function chaparral(x,y,z,lv,st){const red=rng()<.22,set=red?PAL.chapRed:PAL.chap,Rs=rr(1,2.2);
 if(lv===2){
  for(let i=0;i<3;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;BIO.put('manz',[x+Math.cos(a)*d,y+Rs*rr(.4,.7),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[Rs*1.5,Rs*1.1,Rs*1.5],bright(vary(pick(set),.03,.1,.06),1.4),{n:[0,1,0]});}}
 else BIO.put('manz',[x,y+Rs*.5,z],qEuler(0,rr(0,TAU),0),[Rs*1.9,Rs*1.3,Rs*1.9],bright(vary(pick(set),.03,.1,.06),1.35),{n:[0,1,0]});
 st.chap++;}
function boulder(x,y,z,lv,set,st){const n=lv===2?ri(1,3):1,Rb=rr(.8,2.6);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.5,.9);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set));st.boulders++;}}
function lily(x,z,lv,st,dense){const t=rng(),R=rr(.35,1.1);
 BIO.put('pad',[x,.04,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[R,1,R],bright(vary(pick(PAL.pad),.03,.1,.06),1.05));st.lilies++;
 if(lv===2&&rng()<.18)BIO.put('bloom',[x+rr(-.3,.3)*R,.2,z+rr(-.3,.3)*R],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),rr(.22,.4),bright(rng()<.6?C(0xf6f0e0):C(0xf4c0d0),1.1));
 for(let k=0,m=dense?ri(2,5):(rng()<.3?1:0);k<m;k++){const R2=R*rr(.5,1),a=rr(0,TAU),d=R*rr(1.3,2.6);BIO.put('pad',[x+Math.cos(a)*d,.035,z+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[R2,1,R2],bright(vary(pick(PAL.pad),.03,.1,.06),1.05));st.lilies++;}}
function hyacinth(x,z,lv,st){for(let k=0,m=ri(2,5);k<m;k++){const px=x+rr(-.8,.8),pz=z+rr(-.8,.8),R=rr(.25,.45);BIO.put('pad',[px,.08,pz],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[R,1,R],bright(vary(pick(PAL.aroid),.03,.1,.06),1.15));}
 if(lv>=1)blooms(x,.1,z,.6,ri(3,7),PAL.hyacinth,[.14,.24],.45);st.lilies++;}
function duckweed(x,z,st){BIO.put('mossmat',[x,.03,z],qEuler(0,rr(0,TAU),0),[rr(1.5,4),1,rr(1.5,4)],leafCol(PAL.duckweed,1.1,.02));st.duckweed++;}
// a fallen tree: a silvered tube with moss, ferns and bromeliads along its back
function log(x,y,z,st,tropical){const a=rr(0,TAU),L=rr(14,40),r0=rr(.6,1.4),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/7)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,1.5))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.55,t),col:tint(pick(PAL.deadwood),means().wood,rr(.55,.85)).lerp(C(PAL.moss[i%3]),rng()<.35?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:8,cap:true});st.logs++;
 for(let s=2;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(k<.45){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.75)frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(.8,1.6),5,.05,.4,leafCol(PAL.fern,1.7));
  else if(tropical)brom(px,py+r*.9,pz,st);
  else BIO.put('fungus',[px,py+r*.3,pz],qEuler(0,rr(0,TAU),0),[rr(.3,.6),rr(.12,.2),rr(.3,.6)],C(pick(PAL.fungus)));}
 return true;}

// ---------------------------------------------------------------- the understorey (under the crowns)
// A SAPLING: the next generation in the shade -- a thin stem and a few leaf clumps
function sapling(x,y,z,lv,set,st){const h=rr(1.8,4.5),r=h*.012+.03;
 BIO.put('trunk2',[x,y-.1,z],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[r/.4,h,r/.4],rodCol(0x6a5a48));
 for(let i=0,m=lv===2?ri(2,4):2;i<m;i++){const s=rr(1.2,2.2),a=rr(0,TAU),d=rr(0,.5);BIO.put('ucard',[x+Math.cos(a)*d,y+h*rr(.6,1),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.8,s],bright(vary(pick(set),.04,.1,.06),1.4));}
 st.saplings++;}
// a berry shrub for the dry woods (toyon-like): dark leaves, red berries
function toyon(x,y,z,lv,st){const Rs=shrub(x,y,z,lv,PAL.chap,.9);if(lv>=1)blooms(x,y+Rs*.7,z,Rs*.8,lv===2?ri(6,12):4,PAL.berry,[.1,.16],Rs*.5);st.shrubs++;}
// one understorey plant under a crown in zone Z: the shade layer, heavier than the open floor's mix
function underPlant(x,y,z,Z,lv,st){const t=rng();
 if(Z.rain>.4){if(t<.2)earCluster(x,y,z,lv,st);else if(t<.38){if(okGround(x,z,2))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}
  else if(t<.5){fern(x,y,z,lv,PAL.fern,'forkfern');st.ferns++;}else if(t<.62)heliconia(x,y,z,lv,st);
  else if(t<.76){shrub(x,y,z,lv,PAL.aroid,1.2);st.shrubs++;}else if(t<.88)sapling(x,y,z,lv,PAL.aroid,st);else if(lv>=1)youngCane(x,y,z,lv,st);else fern(x,y,z,lv);return;}
 if(Z.swamp>.4){if(t<.35)palmetto(x,y,z,lv,st);else if(t<.62){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
  else if(t<.78)iris(x,y,z,lv,st);else if(t<.9)sapling(x,y,z,lv,PAL.shrub,st);else{shrub(x,y,z,lv,PAL.shrub);st.shrubs++;}return;}
 if(Z.med>.5){if(t<.34)toyon(x,y,z,lv,st);else if(t<.52)chaparral(x,y,z,lv,st);else if(t<.66){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.6,1.2),shade(vary(pick(PAL.sage),.03,.08,.05),-.1));card(x,y+.6,z,1.6,1.1,leafCol(PAL.sage,1.25));st.shrubs++;}
  else if(t<.8)sapling(x,y,z,lv,PAL.cork,st);else if(t<.9){fern(x,y,z,lv);st.ferns++;}else yucca(x,y,z,lv,st);return;}
 // the plain
 if(t<.24){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}else if(t<.4)azalea(x,y,z,lv,st);
 else if(t<.56){shrub(x,y,z,lv,PAL.shrub,1.1);st.shrubs++;}else if(t<.7)sapling(x,y,z,lv,PAL.sycamore,st);
 else if(t<.82)palmetto(x,y,z,lv,st);else if(t<.9)earCluster(x,y,z,lv,st);else{groundMoss(x,y,z,rr(1.2,2.4));st.moss++;}}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantRain(x,y,z,Z,lv,st){const t=rng();
 if(t<.17){earCluster(x,y,z,lv,st);}
 else if(t<.29){if(lv>=1&&okGround(x,z,2.5))giantFern(x,y,z,lv);else fern(x,y,z,lv);st.ferns++;}
 else if(t<.40){fern(x,y,z,lv,PAL.fern,'forkfern');st.ferns++;}
 else if(t<.50){heliconia(x,y,z,lv,st);}
 else if(t<.57){brom(x,y,z,st);if(lv===2)fern(x+rr(-1,1),y,z+rr(-1,1),lv);}
 else if(t<.70){shrub(x,y,z,lv,PAL.aroid);st.shrubs++;}
 else if(t<.79){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.86){if(lv>=1)youngCane(x,y,z,lv,st);else earCluster(x,y,z,lv,st);}
 else if(t<.93){blooms(x,y,z,rr(.8,1.8),ri(3,8),PAL.heliconia);st.blooms++;if(lv===2)fern(x,y,z,lv);}
 else palmetto(x,y,z,lv,st);}
function plantSwamp(x,y,z,Z,lv,st){const t=rng();
 if(t<.24)palmetto(x,y,z,lv,st);
 else if(t<.42){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
 else if(t<.58)iris(x,y,z,lv,st);
 else if(t<.74){if(rng()<.5)reed(x,y,z,lv);else sedge(x,y,z,lv);st.tufts++;}
 else if(t<.86){if(lv>=1){groundMoss(x,y,z,rr(1.2,2.8));st.moss++;}else{sedge(x,y,z,lv);st.tufts++;}}
 else if(t<.93)earCluster(x,y,z,lv,st);
 else{blooms(x,y,z,rr(.6,1.4),ri(2,5),PAL.iris);st.blooms++;}}
function plantSub(x,y,z,Z,lv,st){const t=rng();
 if(Z.pineK>.5&&t<.55){palmetto(x,y,z,lv,st);if(lv===2&&rng()<.5)palmetto(x+rr(-2,2),y,z+rr(-2,2),1,st);return;}   // the flatwoods' palmetto carpet
 if(t<.30){grassTuft(x,y,z,lv,PAL.grassGreen,1,null);st.tufts++;}
 else if(t<.40)palmetto(x,y,z,lv,st);
 else if(t<.53){fern(x,y,z,lv,PAL.fern,rng()<.3?'forkfern':'frond');st.ferns++;}
 else if(t<.62)azalea(x,y,z,lv,st);
 else if(t<.72){groundMoss(x,y,z,rr(1.2,2.6),PAL.litter);st.litter++;}
 else if(t<.81){shrub(x,y,z,lv,PAL.shrub);st.shrubs++;}
 else if(t<.87){if(lv>=1&&dampK(x,z)>.5){groundMoss(x,y,z,rr(1,2.2));st.moss++;}else{grassTuft(x,y,z,lv,PAL.grassGreen);st.tufts++;}}
 else if(t<.94){blooms(x,y,z,rr(.6,1.5),ri(3,7),rng()<.5?PAL.azalea:PAL.lupin);st.blooms++;}
 else if(t<.97){earCluster(x,y,z,lv,st);}
 else boulder(x,y,z,lv,PAL.rock,st);}
function plantMed(x,y,z,Z,lv,st){const t=rng();
 if(rng()<Z.chapK*.9){   // the chaparral
  if(t<.62)chaparral(x,y,z,lv,st);
  else if(t<.74)yucca(x,y,z,lv,st);
  else if(t<.82){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.6,1.2),shade(vary(pick(PAL.sage),.03,.08,.05),-.1));card(x,y+.6,z,1.6,1.1,leafCol(PAL.sage,1.25));st.shrubs++;}
  else if(t<.9){grassTuft(x,y,z,lv,PAL.grassGold,1.1);st.tufts++;}
  else if(t<.95)pincushion(x,y,z,lv,st);
  else boulder(x,y,z,lv,rng()<.4?PAL.rockRed:PAL.rock,st);
  return;}
 const pk=poppyK(x,z),lk=lupinK(x,z);   // the golden grassland
 if(t<.40){grassTuft(x,y,z,lv,PAL.grassGold,1.1);st.tufts++;if(lv===2&&rng()<.5)grassTuft(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv,PAL.grassGold,1);}
 else if(t<.50){grassTuft(x,y,z,lv,PAL.stipa,.9,ri(3,5));st.tufts++;}             // feather-grass tussocks
 else if(t<.50+.14*pk+.02){blooms(x,y,z,rr(1,2.2),lv===2?ri(8,16):ri(3,6),PAL.poppy,[.12,.22],.25);st.blooms++;}
 else if(t<.66+.08*lk){const h=rr(.5,.9);tuft('lupin',x,y,z,h,h*.9,bright(vary(pick(rng()<.6?PAL.lupin:[0x8a4ab8,0x9a5ac8]),.03,.08,.06),1.25));st.spikes++;}
 else if(t<.74){BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),rr(.5,1),shade(vary(pick(PAL.sage),.03,.08,.05),-.05));st.shrubs++;}
 else if(t<.79)mullein(x,y,z,lv,st);
 else if(t<.84)agave(x,y,z,lv,st);
 else if(t<.88)aloe(x,y,z,lv,st);
 else if(t<.91)pincushion(x,y,z,lv,st);
 else if(t<.95){grassTuft(x,y,z,lv,PAL.grassGold,.8);st.tufts++;}
 else boulder(x,y,z,lv,rng()<.35?PAL.rockRed:PAL.rock,st);}
function plantBeach(x,y,z,Z,lv,st){const t=rng();
 if(t<.45){grassTuft(x,y,z,lv,PAL.stipa,1.3,ri(2,4));st.tufts++;}
 else if(t<.62){sedge(x,y,z,lv,PAL.grassGreen);st.tufts++;}
 else if(t<.8){for(let k=0,m=ri(2,5);k<m;k++){const R=rr(.2,.4);BIO.put('pad',[x+rr(-1.5,1.5),y+.05,z+rr(-1.5,1.5)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[R,1,R],leafCol(PAL.aroid,1.2));}
  if(lv>=1)blooms(x,y,z,1.5,ri(2,5),[0xc890e0,0xd8a0e8],[.12,.2],.1);st.vines++;}
 else if(t<.9)palmetto(x,y,z,lv,st);
 else boulder(x,y,z,lv,PAL.rock,st);}
function plantRip(x,y,z,Z,lv,st){const t=rng();
 if(t<.4){reed(x,y,z,lv);st.tufts++;}
 else if(t<.6){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.75){fern(x,y,z,lv);st.ferns++;}
 else if(t<.85)iris(x,y,z,lv,st);
 else{shrub(x,y,z,lv,PAL.shrub,.8);st.shrubs++;}}

// ---------------------------------------------------------------- the pass
SWLOW.buildFloor=function(R,q){
 reseed(600021);q=q==null?1:q;R=R||2850;means();
 const st={saplings:0,understorey:0,ferns:0,shrubs:0,tufts:0,blooms:0,moss:0,boulders:0,lilies:0,duckweed:0,logs:0,palmettos:0,ears:0,helic:0,brom:0,canes:0,iris:0,azaleas:0,yuccas:0,spikes:0,aloes:0,agaves:0,chap:0,litter:0,vines:0};
 const planters=[plantRain,plantSwamp,plantSub,plantMed,plantBeach,plantRip];
 function plant(x,y,z,lv){if(!okGround(x,z,.7))return;const Z=zones(x,z);
  const w=[Z.rain*1.3,Z.swamp*1.2,Z.sub*.95,Z.med*1.1,Z.beach*.6,Z.rip*.5];let tot=0;for(const v of w)tot+=v;if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  planters[k](x,y,z,Z,lv,st);}
 // three bands along the LOD spine (the spine runs NW-SE, so no box window: the disc is cheap to walk)
 const bands=[[10,560,0],[19,1400,560],[40,1e9,1400]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .56*q*(lv===0?.42:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.72,patchScale:.014,pad:.5});});
 // a second, cheap pass of grass: the ground cover of the hills and the glades (tufts are 6 triangles)
 [[5,480,0],[10,1200,480]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return q*.7;},(x,y,z,d)=>{if(blocked(x,z,.4))return;const Z=zones(x,z);
    const w=(Z.med*(1-Z.chapK*.6)+Z.sub*.4*(1-Z.pineK)+Z.beach*.3)*.75;if(rng()>w)return;
    const set=Z.med>.5?(rng()<.15?PAL.stipa:PAL.grassGold):PAL.grassGreen;grassTuft(x,y,z,1,set,Z.med>.5?1.1:.8);st.tufts++;},{patch:.6,patchScale:.02,pad:.3});});
 // the water: lily pads carpeting still fresh water, hyacinth, duckweed; reeds in the shallows. The sea gets none.
 [[8,560,0],[16,1400,560]].forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const h=Y(x,z);if(h>.3||h<-4)return 0;
    const Z=zones(x,z);if(Z.salt>.35)return 0;return q*(1-Z.flow*.85)*(.8*smooth(-4,-1,h)+.3*smooth(-.9,-.1,h));},
   (x,y,z,d)=>{if(!BIO.clearOf(x,z,1)||blocked(x,z,.5))return;const k=rng();
    if(y>-.5&&k<.35){reed(x,Math.max(y,-.4),z,lv);st.tufts++;}
    else if(k<.72)lily(x,z,lv,st,dampK(x,z)>.45);
    else if(k<.86)hyacinth(x,z,lv,st);else duckweed(x,z,st);},{patch:.8,patchScale:.02,noMask:true,pad:.4});});
 // THE UNDERSTOREY: under every near and mid crown, a shade layer scattered over the
 // ground the crown covers (clear of the bole), heavier than the open floor's mix. It
 // follows the trees, so it is thickest where the canopy is.
 for(const T of SWLOW.TREES){if(T.lv<1||T.crownR<5)continue;const Rc=Math.max(T.spread||T.crownR,T.crownR)*.85,area=Math.PI*Rc*Rc,n=Math.round(Math.min(T.lv===2?48:8,area*(T.lv===2?.011:.0018))*q);   // by the ground the crown covers
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=T.rb*2+.8+(Math.max(T.spread||T.crownR,T.crownR)*.85-T.rb*2)*Math.sqrt(rng()),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
   if(BIO.mask(x,z)<=0||!okGround(x,z,.7))continue;const y=Y(x,z);if(y<.3)continue;underPlant(x,y,z,zones(x,z),T.lv,st);st.understorey++;}}
 // fallen trees in the rainforest, the bayou and the plain
 BIO.grid(120,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1400)return 0;const Z=zones(x,z);return (Z.rain*.8+Z.swamp*.4+Z.sub*.35)*q;},
  (x,y,z,d)=>{const trop=zones(x,z).rain>.4;for(let t=0;t<4;t++)if(log(x+rr(-25,25),y,z+rr(-25,25),st,trop))break;},{patch:0,pad:3});
 return{under:st};};
// ONE PLANT AT A POINT, by name, for a world's gardens: the same small-plant builders the floor pass
// uses, at an explicit (x,y,z) with the near LOD. kinds: fern forkfern giantfern shrub azalea palmetto
// ears heliconia brom iris reed sedge grass grassgold yucca mullein aloe agave pincushion chaparral toyon
// sapling moss blooms boulder. opt.set names a palette for shrub/sapling/grass (PAL key), opt.k a size.
SWLOW.plantAt=function(kind,x,y,z,opt){opt=opt||{};means();const lv=opt.lv==null?2:opt.lv;if(opt.seed!=null)reseed(opt.seed);
 const st=new Proxy({},{get:(o,k)=>o[k]||0,set:(o,k,v)=>{o[k]=v;return true;}});const set=opt.set?PAL[opt.set]:null;
 switch(kind){
  case 'fern':fern(x,y,z,lv,set);break;case 'forkfern':fern(x,y,z,lv,set||PAL.fern,'forkfern');break;case 'giantfern':giantFern(x,y,z,lv);break;
  case 'shrub':shrub(x,y,z,lv,set,opt.k);break;case 'azalea':azalea(x,y,z,lv,st);break;case 'palmetto':palmetto(x,y,z,lv,st);break;
  case 'ears':earCluster(x,y,z,lv,st);break;case 'heliconia':heliconia(x,y,z,lv,st);break;case 'brom':brom(x,y,z,st);break;
  case 'iris':iris(x,y,z,lv,st);break;case 'reed':reed(x,y,z,lv);break;case 'sedge':sedge(x,y,z,lv,set);break;
  case 'grass':grassTuft(x,y,z,lv,set||PAL.grassGreen,opt.k);break;case 'grassgold':grassTuft(x,y,z,lv,PAL.grassGold,opt.k||1.1);break;
  case 'yucca':yucca(x,y,z,lv,st);break;case 'mullein':mullein(x,y,z,lv,st);break;case 'aloe':aloe(x,y,z,lv,st);break;case 'agave':agave(x,y,z,lv,st);break;
  case 'pincushion':pincushion(x,y,z,lv,st);break;case 'chaparral':chaparral(x,y,z,lv,st);break;case 'toyon':toyon(x,y,z,lv,st);break;
  case 'sapling':sapling(x,y,z,lv,set||PAL.shrub,st);break;case 'moss':groundMoss(x,y,z,opt.k||rr(1.2,2.4),set);break;
  case 'blooms':blooms(x,y+.3,z,opt.k||.6,ri(4,8),set||PAL.azalea,[.14,.24],.3);break;case 'boulder':boulder(x,y,z,lv,set,st);break;
  default:BIO.err('plantAt: unknown kind '+kind);return false;}
 return true;};
})();
// ================================================================= SOUTHWESTERN LOWLANDS — growth on structures
// What the lowlands do to a building left in them (the hyperjungle kit's pass,
// in this biome's palette): moss on the ledges, Spanish moss hanging off every
// edge and soffit, strangler figs rooting in the joints and sending their
// roots down the walls, staghorn ferns and bromeliads perched on the ledges,
// azalea and heliconia colour. The host hands over its shells as
// BufferGeometry[] in world space; this pass samples their faces (BIO.upFaces
// / downFaces / sideFaces / ledgePoints) and grows on them. It never touches
// the geometry -- a plant is never part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SWLOW.PAL;
const C=hex=>new BIO.host.THREE.Color(hex);
const vcol=()=>C(pick(PAL.vine)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.05,.05));
const mcol=()=>C(pick(PAL.moss)).offsetHSL(rr(-.03,.03),rr(-.08,.08),rr(-.06,.04));
const bloomCol=()=>C(pick(rng()<.5?PAL.azalea:PAL.heliconia));
const beardCol=()=>C(pick(PAL.mossPale)).multiplyScalar(rr(1.1,1.35));

// a MOSS PATCH lying on a surface with normal n (up for a ledge, down for a soffit)
function moss(p,n,r){const q=qUp(n);const s=r*rr(.7,1.3);
 BIO.put('mossmat',[p[0]+n[0]*.06,p[1]+n[1]*.06,p[2]+n[2]*.06],q,[s,1,s],mcol());}
// a HANGING CURTAIN off a point: 2-4 ribbons side by side across w, facing (dx,dz),
// a trailing strand, and the odd flower
function curtain(p,dx,dz,len,w,opt){opt=opt||{};const m=Math.hypot(dx,dz);
 if(m<1e-6){const a=rng()*TAU;dx=Math.cos(a);dz=Math.sin(a);}else{dx/=m;dz/=m;}
 const q=qFacing([dx,0,dz]),tx=-dz,tz=dx,nrb=2+Math.floor(rng()*3),c=opt.col||vcol();
 for(let i=0;i<nrb;i++){const o=(i-(nrb-1)/2)*w/nrb+rr(-.1,.1)*w,L=len*rr(.5,1);
  BIO.put('ribbon',[p[0]+tx*o+dx*rr(.05,.35),p[1]+rr(-.15,.05),p[2]+tz*o+dz*rr(.05,.35)],q,[w/nrb*rr(1,1.8),L,1],c.clone().multiplyScalar(rr(.82,1.12)));}
 if(rng()<.75){const o=rr(-w/2,w/2);BIO.put('strand',[p[0]+tx*o+dx*.4,p[1]-rr(0,.2),p[2]+tz*o+dz*.4],q,[rr(.14,.34),len*rr(.9,1.5),1],c.clone().multiplyScalar(.85));}
 if(opt.flowers&&rng()<.55){const fc=bloomCol();for(let b=0,nb=2+Math.floor(rng()*5);b<nb;b++){const s=rr(.3,.62);
  BIO.put('bloom',[p[0]+tx*rr(-.5,.5)*w+dx*.45,p[1]-rr(.2,len*.75),p[2]+tz*rr(-.5,.5)*w+dz*.45],qEuler(0,rng()*TAU,0),[s,s,s],fc);}}}
// AERIAL ROOTS off a ceiling: thin, long, hanging straight down
function roots(p,len,w){const q=qEuler(0,rng()*TAU,0),c=vcol();
 for(let i=0,n=1+Math.floor(rng()*3);i<n;i++)BIO.put('strand',[p[0]+rr(-w,w),p[1],p[2]+rr(-w,w)],q,[rr(.1,.3),len*rr(.6,1.2),1],c.clone().multiplyScalar(rr(.8,1.1)));}
// BRACKET FUNGUS on the side of something
function bracket(p,n,s){for(let b=0,nb=2+Math.floor(rng()*3);b<nb;b++){const sb=s*rr(.4,1);
 BIO.put('fungus',[p[0]+n[0]*.2+rr(-.6,.6)*s*(1-Math.abs(n[0])),p[1]+rr(0,2.2)*s,p[2]+n[2]*.2+rr(-.6,.6)*s*(1-Math.abs(n[2]))],
  qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}}
// a PLANT on a ledge: fern rosette, tuft or small bush
function plant(p,s){const k=rng();const y=p[1];
 if(k<.12){const c=C(pick(PAL.aroid));BIO.put('brom',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s*.4,s*.45,s*.4],c.clone().multiplyScalar(rr(.8,1)));}
 else if(k<.45){const n=5+Math.floor(rng()*3),c=C(pick(PAL.fern));for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.25,.25),L=s*rr(.85,1.4);
  BIO.put('frond',[p[0],y+s*.12,p[2]],qEuler(rr(.05,.30),-a,0),[L,L*rr(.7,1),L*rr(.7,1)],c.clone().multiplyScalar(rr(.82,1.2)));}}
 else if(k<.8){const c=C(pick(PAL.fern)).offsetHSL(rr(-.08,.08),0,rr(-.05,.08));
  BIO.put('ucard',[p[0],y+s*.35,p[2]],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),[s*1.2,s*.9,s*1.2],c);}
 else{const c=C(pick(PAL.fern)).offsetHSL(rr(-.1,.1),.05,.02);
  BIO.put('lobe',[p[0],y,p[2]],qEuler(0,rng()*TAU,0),[s,s*.7,s],c.clone().multiplyScalar(.82));
  for(let i=0;i<2;i++)BIO.put('ucard',[p[0]+rr(-.4,.4)*s,y+s*.5,p[2]+rr(-.4,.4)*s],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s*1.3,s,s*1.3],c.clone().multiplyScalar(rr(.9,1.2)));}}
// a SMALL TREE on a ledge: a tree fern, 4-12 m
function smallTree(p,h){const S=SWLOW.SPECIES[6],rb=h*.035+.2,rc=C(pick(S.bark)).multiplyScalar(.7);
 BIO.put('trunk2',[p[0],p[1],p[2]],qEuler(rr(-.08,.08),0,rr(-.08,.08)),[rb/.4,h,rb/.4],rc);
 for(let i=0,n=2+Math.floor(rng()*4);i<n;i++){const a=rng()*TAU,d=rr(.5,2.5);BIO.beam('rod',[p[0]+Math.cos(a)*d*.3,p[1]+h*rr(.4,.9),p[2]+Math.sin(a)*d*.3],[p[0]+Math.cos(a)*d,p[1]-.1,p[2]+Math.sin(a)*d],rr(.04,.1),null,rc);}
 const n=4+Math.floor(rng()*4),R=h*.35;
 for(let i=0;i<n;i++){const a=rng()*TAU,d=R*Math.sqrt(rng()),s=R*rr(.8,1.2);BIO.put('glossy',[p[0]+Math.cos(a)*d,p[1]+h*rr(.75,1.05),p[2]+Math.sin(a)*d],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[s,s*.6,s],C(pick(S.leaf)).multiplyScalar(rr(1.1,1.4)),{n:[0,1,0]});}}
// LEDGES: moss on the flat, plants toward the outer edge, lips and curtains off the edge
SWLOW.dressLedges=function(geos,opt){opt=opt||{};
 const nM=opt.moss||400,nP=opt.plants||300,nE=opt.edges||140;
 BIO.upFaces(geos,nM,.6).forEach(f=>moss(f.p,f.n,rr(1.2,opt.mossR||3.5)));
 BIO.upFaces(geos,nP,.6).forEach(f=>{if(rng()<.12)smallTree(f.p,rr(4,opt.treeH||12));else plant(f.p,rr(1,opt.size||3));});
 BIO.ledgePoints(geos,nE,2.5).forEach(l=>{const p=[l.p[0]+l.n[0]*.3,l.p[1]-.1,l.p[2]+l.n[2]*.3];
  moss([l.p[0],l.p[1],l.p[2]],[0,1,0],rr(1,2.2));
  if(rng()<.7)curtain(p,l.n[0],l.n[2],rr(4,opt.hang||16),rr(2,5),{flowers:rng()<.4});
  if(rng()<.6)for(let b=0,nb=1+Math.floor(rng()*3);b<nb;b++)BIO.put('beard',[p[0]+rr(-1,1),p[1],p[2]+rr(-1,1)],qEuler(0,rng()*TAU,0),[rr(1,2.2),rr(2,6),1],beardCol());});};
// SOFFITS: moss rolled over to face the ground, roots and beards hanging out of
// it, brackets, curtains where the rim is. Density rises toward the rim: the
// middle of a big underside is in permanent dark and grows almost nothing.
SWLOW.dressSoffits=function(geos,opt){opt=opt||{};
 const S=BIO.downFaces(geos,opt.n||400,.6);if(!S.length)return;
 let cx=0,cz=0;S.forEach(f=>{cx+=f.p[0];cz+=f.p[2];});cx/=S.length;cz/=S.length;
 let rMax=1e-6;S.forEach(f=>{f.r=Math.hypot(f.p[0]-cx,f.p[2]-cz);if(f.r>rMax)rMax=f.r;});
 S.forEach(f=>{const u=f.r/rMax,lit=.15+.85*Math.pow(u,1.4);const R=(opt.mossR||5)*(.35+.65*lit);
  const dn=[0,-1,0];moss(f.p,dn,rr(R*.6,R));
  for(let q=0,nq=1+Math.floor(rng()*3);q<nq;q++)moss([f.p[0]+rr(-1,1)*R,f.p[1]-rr(0,.2),f.p[2]+rr(-1,1)*R],dn,rr(R*.25,R*.8));
  if(rng()<lit*.85)roots([f.p[0],f.p[1]-.15,f.p[2]],rr(4,opt.hang||16)*(.35+.65*lit),rr(.5,2.2));
  if(rng()<lit*.6)BIO.put('beard',[f.p[0]+rr(-1,1),f.p[1]-.1,f.p[2]+rr(-1,1)],qEuler(0,rng()*TAU,0),[rr(1.2,2.4),rr(2,7)*(.4+.6*lit),1],beardCol());
  if(rng()<lit*.40)curtain([f.p[0],f.p[1]-.2,f.p[2]],f.p[0]-cx,f.p[2]-cz,rr(5,opt.hang||16),rr(2,6),{flowers:rng()<.5});
  if(rng()<.14)bracket([f.p[0],f.p[1]-rr(.5,2),f.p[2]],[0,0,0],rr(1,2.6));});};
// WALLS: vines climbing, brackets, moss streaks under the drips
SWLOW.dressWalls=function(geos,opt){opt=opt||{};
 BIO.sideFaces(geos,opt.n||160).forEach(f=>{const k=rng();
  if(k<.2){const q=qFacing([f.n[0],0,f.n[2]]);for(let r=0,nr=2+Math.floor(rng()*3);r<nr;r++)BIO.put('strand',[f.p[0]+f.n[0]*.2+rr(-1,1)*(1-Math.abs(f.n[0])),f.p[1]+rr(0,3),f.p[2]+f.n[2]*.2+rr(-1,1)*(1-Math.abs(f.n[2]))],q,[rr(.15,.35),rr(4,opt.hang||12),1],C(0x8a8a78).multiplyScalar(rr(.6,.85)));}
  else if(k<.45)curtain([f.p[0]+f.n[0]*.3,f.p[1],f.p[2]+f.n[2]*.3],f.n[0],f.n[2],rr(3,opt.hang||12),rr(1.5,4),{});
  else if(k<.7)bracket([f.p[0],f.p[1],f.p[2]],f.n,rr(.8,2.2));
  else moss([f.p[0]+f.n[0]*.05,f.p[1],f.p[2]+f.n[2]*.05],f.n,rr(.8,2));});};
SWLOW.dressGeos=function(geos,opt){opt=opt||{};reseed(650001+(opt.seed||0));
 SWLOW.dressLedges(geos,opt.ledges||{});SWLOW.dressSoffits(geos,opt.soffits||{});SWLOW.dressWalls(geos,opt.walls||{});};
})();
// ================================================================= SOUTHWESTERN LOWLANDS — build / dress / canopyH
// The biome's public surface (BIOME-API.md). The passes live in 55 (trees),
// 60 (floor) and 65 (dress); this file only orders them and reports.
SWLOW.build=function(opt){opt=opt||{};const R=opt.R||2850,q=opt.quality==null?1:opt.quality;
 const out={R,quality:q,trees:0,heroes:0,far:0};
 if(SWLOW.buildTrees){BIO.cur='lowlands/trees';Object.assign(out,SWLOW.buildTrees(R,q,opt));}
 if(SWLOW.buildFloor){BIO.cur='lowlands/floor';Object.assign(out,SWLOW.buildFloor(R,q));}
 BIO.cur=null;return out;};
SWLOW.dress=function(geos,opt){if(SWLOW.dressGeos){BIO.cur='lowlands/dress';SWLOW.dressGeos(geos,opt||{});BIO.cur=null;}};
SWLOW.canopyH=function(x,z){return SWLOW._canopyH?SWLOW._canopyH(x,z):10;};
// ================================================================= DALAB CITY — the layout: settlements, streets, the highway, the avenue, farms
// Streets are radial from each settlement's plaza (the plaza sits in front of the mound); a ring street ties the
// radials; the highway circuit joins the six outlying towns and leaves the map in the four cardinal directions; the
// live-oak avenue runs from the lab gate to the main plaza. A connectivity pass afterwards guarantees one network.
reseed(SEED_CITY+2);
function nearestRoadPt(x,z,filter){let best=null;for(const r of ROADS){if(filter&&!filter(r))continue;const P=r.pts;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
  const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,road:r,seg:i,t};}}return best;}
function connectRoad(x,z,w,cls,filter,zone){const n=nearestRoadPt(x,z,filter);if(!n||n.d<2)return n;road([[x,z],[n.x,n.z]],w,cls,{zone:zone||'link'});return n;}
// a road may not cross water except where a bridge is laid: split at the channel and lay a plank bridge (painted)
const BRIDGES=[];
function bridgeAt(x,z,ry,w){BRIDGES.push({x,z,ry,w});}
// ---- 1. the settlements: mound disc, plaza, radials, ring street(s) ----
for(const S of SETTLE){
 const f=S.face;const fd=[Math.sin(f),Math.cos(f)];                         // the mound's front direction (local +z rotated by face)
 S.mound={x:S.x,z:S.z,ry:f};
 const pc=[S.x+fd[0]*(S.moundR+10+S.plazaR),S.z+fd[1]*(S.moundR+10+S.plazaR)];S.plaza={x:pc[0],z:pc[1],r:S.plazaR};
 disc(S.x,S.z,S.moundR+6,'mound');precinct(S.x,S.z,S.moundR+8,S.name+' mound');
 disc(pc[0],pc[1],S.plazaR,'plaza');precinct(pc[0],pc[1],S.plazaR-2,S.name+' plaza');
 // radials from the plaza centre, skipping the mound's bearing; the first pair frame the mound
 S.radials=[];const n=S.streets;const back=Math.atan2(S.x-pc[0],S.z-pc[1]);   // bearing toward the mound (as ry: dir = sin,cos)
 for(let k=0;k<n;k++){const a=back+Math.PI+(k/n)*TAU;if(angDiff(a,back)<.45)continue;const L=S.main?420:118;
  const pts=[[pc[0]+Math.sin(a)*(S.plazaR-2),pc[1]+Math.cos(a)*(S.plazaR-2)],[pc[0]+Math.sin(a)*L,pc[1]+Math.cos(a)*L]];
  road(pts,S.main?CITY.STREET_W+2:CITY.STREET_W,KL.street,{zone:S.key+':radial'});S.radials.push({a,L,pts});}
 // ring street(s) round the plaza
 // a ring is painted in runs that skip a precinct (the outlying plaza ring would otherwise cut through the mound's foot)
 const ringClipped=(cx,cz,R,w,zone,skip)=>{let run=[];const flush=()=>{if(run.length>1)road(run,w,KL.lane,{zone});run=[];};
  for(let i=0;i<=72;i++){const a=i/72*TAU;const p=[cx+Math.sin(a)*R,cz+Math.cos(a)*R];if(skip(p[0],p[1]))flush();else run.push(p);}flush();};
 // the main settlement's full grid (Travis, round 10): half rings between the rings and half radials between the
 // radials from the first ring out, so every block is ~65 m deep; the two great compounds (the Halls, the ranch)
 // are precincts every ring and half radial stops at, and the build places them there by name
 S.radials2=[];S.big=[];if(S.main){const front=back+Math.PI;S.big=[{key:'dalab_halls',a:front-Math.PI*.3,d:335,r:82,name:'The Halls of Reformation'},{key:'dalab_ranch',a:front+Math.PI*.3,d:400,r:92,name:'The ranch'},{key:'dalab_priest_compound',a:back+.314,d:200,r:38,name:"The priests' compound"},{key:'dalab_priest_compound',a:back-.314,d:200,r:38,name:null}];
  for(const B of S.big){B.x=pc[0]+Math.sin(B.a)*B.d;B.z=pc[1]+Math.cos(B.a)*B.d;precinct(B.x,B.z,B.r,B.name);}}
 const skipBig=(x,z)=>Math.hypot(x-S.x,z-S.z)<S.moundR+12||S.big.some(B=>Math.hypot(x-B.x,z-B.z)<B.r+4);
 const ring=(R,w)=>ringClipped(pc[0],pc[1],R,w,S.key+':ring',skipBig);
 ring(S.ringR,CITY.LANE_W);if(S.ringR2)ring(S.ringR2,CITY.LANE_W);if(S.ringR3)ring(S.ringR3,CITY.LANE_W);
 if(S.main){for(const R of[(S.ringR+S.ringR2)/2,(S.ringR2+S.ringR3)/2])ring(R,CITY.LANE_W);
  for(let k=0;k<n;k++){const a=back+Math.PI+((k+.5)/n)*TAU;if(angDiff(a,back)<.5)continue;let run=[];const flush=()=>{if(run.length>1)road(run,CITY.STREET_W,KL.street,{zone:S.key+':radial2'});run=[];};
   for(let r=S.ringR;r<=S.ringR3+22;r+=6){const p=[pc[0]+Math.sin(a)*r,pc[1]+Math.cos(a)*r];if(skipBig(p[0],p[1]))flush();else run.push(p);}flush();S.radials2.push({a});}}
 // a lane round the back of the mound so the houses behind it connect
 // (a full ring: it meets the plaza in front of the mound, so it needs no connectors that could cut the mound's foot)
 ringClipped(S.x,S.z,S.moundR+22,CITY.LANE_W,S.key+':moundlane',(x,z)=>Math.hypot(x-pc[0],z-pc[1])<S.plazaR+2);
}
// ---- 2. the highway circuit through the outlying plazas, and the four spurs off the map ----
{const T=SETTLE.filter(S=>!S.main);const pts=T.map(S=>[S.plaza.x,S.plaza.z]);pts.push(pts[0]);
 // round the corners: a point outside each plaza on the way in and out, so the highway skirts the plaza edge rather than crossing the mound
 const P=[];for(let i=0;i<T.length;i++){const a=T[i],b=T[(i+1)%T.length];const A=[a.plaza.x,a.plaza.z],B=[b.plaza.x,b.plaza.z];P.push(A);const mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2;const ox=mx-CITY.RING_C[0],oz=mz-CITY.RING_C[1],m=Math.hypot(ox,oz);P.push([CITY.RING_C[0]+ox/m*(CITY.RING+40),CITY.RING_C[1]+oz/m*(CITY.RING+40)]);}
 P.push(P[0]);const HW=road(P,CITY.HIGHWAY_W,KL.highway,{zone:'highway'});HW.oak=true;   // the circuit is a live-oak vault, mound to mound
 // spurs: from the circuit's nearest point to each map edge
 const E=CITY.WORLD/2+80;for(const dir of[[0,-1],[1,0],[0,1],[-1,0]]){const far=[CITY.RING_C[0]+dir[0]*E,CITY.RING_C[1]+dir[1]*E];const n=nearestRoadPt(far[0],far[1],r=>r.zone==='highway');road([[n.x,n.z],far],CITY.HIGHWAY_W,KL.highway,{zone:'spur'});}
 // the main settlement joins the circuit by its three outward radials, extended
 const M=SETTLE.find(S=>S.main);for(const R of M.radials){if(angDiff(R.a,M.face)<1.2)continue;const e=R.pts[1];const n=nearestRoadPt(e[0],e[1],r=>r.zone==='highway');if(n&&n.d<900){R.oak=true;const OR=road([[M.plaza.x+Math.sin(R.a)*(M.plazaR-6),M.plaza.z+Math.cos(R.a)*(M.plazaR-6)],e,[n.x,n.z]],16,KL.avenue,{zone:'main:oak'});OR.oak=true;}}   // an oak avenue from the market out to the circuit
 window._highwayPts=P.length;}
// the oak vaults (Travis, round 7): the lab avenue and every road out of the main settlement to the circuit, planted by the biome
const OAK_ROADS=()=>ROADS.filter(r=>r.oak).map(r=>r.pts).concat([AVENUE]);
// ---- 3. the avenue: lab gate to the main plaza, a live-oak vault (the biome plants the oaks along AVENUE) ----
const M0=SETTLE.find(S=>S.main);
const LAB_GATE=[CITY.LAB.x,CITY.LAB.z+292*4.105*CITY.LAB.scale];   // the compound wall's south point
const AVENUE=[[LAB_GATE[0],LAB_GATE[1]-30],[LAB_GATE[0],LAB_GATE[1]+40],[M0.plaza.x,M0.plaza.z-M0.plazaR+8]];   // into the plaza, to the market's edge
{const AV=road(AVENUE,16,KL.avenue,{zone:'avenue'});AV.oak=true;}disc(LAB_GATE[0],LAB_GATE[1]+10,26,'plaza');
// the High Priest's mound, right outside the lab's main entrance, ringed, facing AWAY from the lab (south)
const HIGH_MOUND={x:-190,z:LAB_GATE[1]+120,ry:0};disc(HIGH_MOUND.x,HIGH_MOUND.z,76,'mound');precinct(HIGH_MOUND.x,HIGH_MOUND.z,80,"High Priest's mound");
road([[HIGH_MOUND.x,HIGH_MOUND.z+82],[HIGH_MOUND.x,HIGH_MOUND.z+140],[AVENUE[1][0]-20,AVENUE[1][1]+120]],CITY.STREET_W,KL.street,{zone:'highmound'});
// ---- 4. the farms: wedges of field between the radials, from the settlement's edge outward; a ring of them ----
const FIELDS=[];
(function farms(){reseed(SEED_CITY+3);
 for(const S of SETTLE){const R0=S.main?S.r-20:S.r-30,R1=S.main?S.r+330:S.r+240;const n=S.main?18:12;
  for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;const ci=Math.floor(rng()*CROPCOL.length);if(rng()<.18)continue;   // some fallow
   for(let r=R0;r<R1;r+=rr(60,95)){const r2=Math.min(R1,r+rr(55,90));const g=.028;const pts=[[S.plaza.x+Math.sin(a0+g)*r,S.plaza.z+Math.cos(a0+g)*r],[S.plaza.x+Math.sin(a1-g)*r,S.plaza.z+Math.cos(a1-g)*r],[S.plaza.x+Math.sin(a1-g)*r2,S.plaza.z+Math.cos(a1-g)*r2],[S.plaza.x+Math.sin(a0+g)*r2,S.plaza.z+Math.cos(a0+g)*r2]];
    // no fields on water, the avenue, the lab or the highway's line
    let ok=true;for(const p of pts){if(isWater(p[0],p[1])||Math.hypot(p[0]-CITY.LAB.x,p[1]-CITY.LAB.z)<292*4.105*CITY.LAB.scale+60||riverD(p[0],p[1])<50||channelD(p[0],p[1]).d<8)ok=false;}
    // a field is never bisected by a road: nine samples across the wedge must all be clear of the streets, avenues and the highway
    if(ok)for(let u=.12;u<1&&ok;u+=.38)for(let v=.12;v<1&&ok;v+=.38){const x=pts[0][0]+(pts[1][0]-pts[0][0])*u+(pts[3][0]-pts[0][0])*v,z=pts[0][1]+(pts[1][1]-pts[0][1])*u+(pts[3][1]-pts[0][1])*v;const n=nearestRoadPt(x,z,r=>r.cls!==KL.lane);if(n&&n.d<n.road.w/2+(n.road.oak?16:4))ok=false;}
    if(!ok)continue;field(pts,(ci+Math.round(r/80))%CROPCOL.length,(a0+a1)/2);FIELDS.push({pts,S:S.key,cx:pts.reduce((s,p)=>s+p[0],0)/4,cz:pts.reduce((s,p)=>s+p[1],0)/4});}}}
 window._fields=FIELDS.length;})();
// farm lanes: every other wedge boundary gets a lane from the ring street out to the fields' edge (the farm workers' way)
// (a lane never runs at the mound, and stops at the first precinct — another mound, the lab — it would enter)
for(const S of SETTLE){const n=S.main?18:12;const back=Math.atan2(S.x-S.plaza.x,S.z-S.plaza.z);for(let i=0;i<n;i+=2){const a=i/n*TAU;if(angDiff(a,back)<.55)continue;const R0=(S.main?S.ringR3:S.ringR)+4;let R1=(S.main?S.r+300:S.r+210);
 for(let r=R0;r<R1;r+=6){if(inPrecinct(S.plaza.x+Math.sin(a)*r,S.plaza.z+Math.cos(a)*r,10)){R1=r-6;break;}}if(R1-R0<30)continue;
 road([[S.plaza.x+Math.sin(a)*R0,S.plaza.z+Math.cos(a)*R0],[S.plaza.x+Math.sin(a)*R1,S.plaza.z+Math.cos(a)*R1]],CITY.LANE_W,KL.lane,{zone:S.key+':farmlane'});}}
// ---- 5. the connectivity pass: one network. Components by endpoint proximity; each minor component gets a link to the largest ----
function roadComponents(){const N=ROADS.length,par=[];for(let i=0;i<N;i++)par[i]=i;const find=i=>par[i]===i?i:(par[i]=find(par[i]));const uni=(a,b)=>{par[find(a)]=find(b);};
 for(let i=0;i<N;i++){const A=ROADS[i];for(const e of[A.pts[0],A.pts[A.pts.length-1]]){for(let j=0;j<N;j++){if(i===j)continue;const B=ROADS[j];for(let k=0;k<B.pts.length-1;k++){if(segD(e[0],e[1],B.pts[k],B.pts[k+1])<(A.w+B.w)/2+1.5){uni(i,j);break;}}}}}
 const comp={};for(let i=0;i<N;i++){const c=find(i);(comp[c]||(comp[c]=[])).push(i);}return Object.values(comp);}
(function connectAll(){let guard=0;while(guard++<12){const C=roadComponents().filter(c=>!c.every(i=>ROADS[i].dead));if(C.length<=1){window._roadComponents=1;return;}C.sort((a,b)=>b.length-a.length);const main=new Set(C[0]);
 for(let ci=1;ci<C.length;ci++){let best=null;for(const ri of C[ci]){for(const p of ROADS[ri].pts){const n=nearestRoadPt(p[0],p[1],r=>main.has(r.id));if(!n)continue;let clear=true;for(let t=0;t<=1;t+=.05){if(inPrecinct(p[0]+(n.x-p[0])*t,p[1]+(n.z-p[1])*t,4)){clear=false;break;}}if(clear&&(!best||n.d<best.d))best={p,n};}}
  if(best)road([best.p,[best.n.x,best.n.z]],CITY.LANE_W,KL.lane,{zone:'connect'});else{for(const ri of C[ci])ROADS[ri].dead=true;}}}   /* no clear link (a stub cut off by a precinct): it stays a dead end rather than a lane through the precinct (round 10) */
 window._roadComponents=roadComponents().filter(c=>!c.every(i=>ROADS[i].dead)).length;})();
// bridges wherever a road crosses a channel (painted as planks over the water)
(function bridges(){for(const R of ROADS){for(let i=0;i<R.pts.length-1;i++){const a=R.pts[i],b=R.pts[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(2,Math.ceil(L/6));
  for(let k=0;k<=n;k++){const t=k/n;const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;const c=channelD(x,z);if(c.d<c.w*.5){bridgeAt(x,z,Math.atan2(b[0]-a[0],b[1]-a[1]),R.w);k+=Math.ceil(c.w*2/(L/n));}}}}
 // one bridge per crossing: thin the list
 const B=[];for(const b of BRIDGES){if(!B.some(q=>Math.hypot(q.x-b.x,q.z-b.z)<18))B.push(b);}BRIDGES.length=0;B.forEach(b=>BRIDGES.push(b));window._bridges=BRIDGES.length;})();
cityBakeMasks();
// ================================================================= DALAB CITY — the placement engine
// Occupancy (rotated footprints in a spatial hash), ground tests against the painted mask (roads, plazas, fields
// and water are all blocked, so a building can never sit on a street), street-facing alignment (the front of every
// def is +z; ry is the outward normal of the nearest road), and the frontage walker that fills the streets.
reseed(SEED_CITY+4);
const OCC={cell:40,hash:{},list:[]};
function occKey(ix,iz){return ix+','+iz;}
function occCells(o){const R=Math.hypot(o.hx,o.hz)+(o.pad||0);const out=[];for(let iz=Math.floor((o.z-R)/OCC.cell);iz<=Math.floor((o.z+R)/OCC.cell);iz++)for(let ix=Math.floor((o.x-R)/OCC.cell);ix<=Math.floor((o.x+R)/OCC.cell);ix++)out.push(occKey(ix,iz));return out;}
function obbOverlap(a,b,pad){pad=pad||0;const axes=[[Math.cos(a.ry),-Math.sin(a.ry)],[Math.sin(a.ry),Math.cos(a.ry)],[Math.cos(b.ry),-Math.sin(b.ry)],[Math.sin(b.ry),Math.cos(b.ry)]];
 const dx=b.x-a.x,dz=b.z-a.z;
 for(const ax of axes){const proj=dx*ax[0]+dz*ax[1];
  const ra=Math.abs((Math.cos(a.ry)*ax[0]-Math.sin(a.ry)*ax[1]))*a.hx+Math.abs((Math.sin(a.ry)*ax[0]+Math.cos(a.ry)*ax[1]))*a.hz;
  const rb=Math.abs((Math.cos(b.ry)*ax[0]-Math.sin(b.ry)*ax[1]))*b.hx+Math.abs((Math.sin(b.ry)*ax[0]+Math.cos(b.ry)*ax[1]))*b.hz;
  if(Math.abs(proj)>ra+rb+pad)return false;}return true;}
function occFree(o,pad){const seen={};for(const k of occCells(o)){const L=OCC.hash[k];if(!L)continue;for(const q of L){if(seen[q.id])continue;seen[q.id]=1;if(obbOverlap(o,q,pad||0))return false;}}return true;}
function occAdd(o){o.id=OCC.list.length;OCC.list.push(o);for(const k of occCells(o))(OCC.hash[k]||(OCC.hash[k]=[])).push(o);return o;}
function obbCorners(o,grow){const g=grow||0;const c=Math.cos(o.ry),s=Math.sin(o.ry);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[o.x+k[0]*(o.hx+g)*c+k[1]*(o.hz+g)*s,o.z-k[0]*(o.hx+g)*s+k[1]*(o.hz+g)*c]);}
// ground test: buildable at the corners, edge midpoints and centre (a 3x3 inside too for big plots); not in a precinct; not water
function groundOK(o,opt){opt=opt||{};const g=opt.grow||0,hx=o.hx+g,hz=o.hz+g;const pts=[];const nx=Math.max(1,Math.ceil(hx/4)),nz=Math.max(1,Math.ceil(hz/4));   /* every plot sampled on a ~4 m grid, corners included: a lane's end used to slip between the corners and the edge midpoints (round 10) */
 for(let i=-nx;i<=nx;i++)for(let j=-nz;j<=nz;j++)pts.push(loc(o.x,o.z,i/nx*hx,j/nz*hz,o.ry));
 const W=CITY.WORLD/2-30;for(const p of pts){if(Math.abs(p[0])>W||Math.abs(p[1])>W)return false;if(!opt.ignoreMask&&!canBuild(p[0],p[1]))return false;if(!opt.ignoreOak&&inOakCorridor(p[0],p[1]))return false;if(!opt.ignorePrecinct&&inPrecinct(p[0],p[1],opt.ppad||0))return false;if(isWater(p[0],p[1]))return false;}
 return true;}
function groundY(o){let y=1e9;for(const p of obbCorners(o,-.5))y=Math.min(y,terrainH(p[0],p[1]));y=Math.min(y,terrainH(o.x,o.z));return y-.06;}
// STREET ALIGNMENT: the outward normal of the nearest road at the plot, so the door faces the street
// a plot under an oak vault is no plot: the corridor either side of every oak road (the oaks stand 12.5 m off the line)
function inOakCorridor(x,z,pad){const n=nearestRoadPt(x,z,r=>r.oak);return !!(n&&n.d<n.road.w/2+10+1.5+(pad||0));}
// the door faces a side street when one is near, the avenue only when nothing else is
function faceRoadRy(x,z,filter){let n=nearestRoadPt(x,z,r=>!r.oak&&(!filter||filter(r)));if(!n||n.d>45)n=nearestRoadPt(x,z,filter);if(!n)return 0;return Math.atan2(n.x-x,n.z-z);}
function findSpot(hx,hz,tx,tz,opt){opt=opt||{};const R=opt.R||90,step=opt.step||8;const tries=[[tx,tz]];
 for(let r=step;r<=R;r+=step){const n=Math.max(6,Math.round(TAU*r/step));for(let i=0;i<n;i++){const a=i/n*TAU+r*.37;tries.push([tx+r*Math.cos(a),tz+r*Math.sin(a)]);}}
 for(const t of tries){const ry=opt.ry!=null?opt.ry:faceRoadRy(t[0],t[1],opt.filter);const o={x:t[0],z:t[1],hx,hz,ry,pad:opt.pad==null?1.5:opt.pad};
  if(groundOK(o,opt)&&occFree(o,o.pad))return o;}return null;}
// ---------------------------------------------------------------- placing a def
const PLACED=[];const LANDMARKS=[];
function placeDef(key,o,opt){opt=opt||{};const D=VERN.defs[key];if(!D){reportErr('placeDef: no def '+key);return null;}const sc=opt.scale||1;o.hx=D.w/2*sc;o.hz=D.d/2*sc;const y=opt.y!=null?opt.y:groundY(o);
 TSTAT.cur=key+'/'+(opt.v|0);const r0=REG.length;const G=VERN.place(scene,key,o.x,o.z,o.ry,{v:opt.v|0,scale:sc,y,lit:opt.lit});TSTAT.cur=null;
 o.built=key;o.settle=opt.settle||null;occAdd(o);PLACED.push({key,o});footprint(obbCorners(o,.6));
 if(opt.landmark){LANDMARKS.push({name:opt.landmark,x:o.x,z:o.z});let best=null;for(let i=r0;i<REG.length;i++){const r=REG[i];if(!best||r.r>best.r)best=r;}if(best){best.tags=Object.assign({},best.tags,{landmark:true});best.name=opt.landmark;}}
 return G;}
// place near a target, facing the nearest street (ANTI-OVERLAP: spiral out until free); returns the OBB or null
function placeNear(key,tx,tz,opt){opt=opt||{};const D=VERN.defs[key];if(!D)return null;const sc=opt.scale||1;const o=findSpot(D.w/2*sc+(opt.grow||1),D.d/2*sc+(opt.grow||1),tx,tz,{R:opt.R||120,step:opt.step||9,ry:opt.ry,filter:opt.filter,pad:opt.pad,ppad:opt.ppad,ignoreMask:opt.ignoreMask,ignorePrecinct:opt.ignorePrecinct,ignoreOak:opt.ignoreOak});
 if(!o)return null;o.hx=D.w/2*sc;o.hz=D.d/2*sc;placeDef(key,o,opt);return o;}
// the FRONTAGE WALKER: along a road, every `pitch` metres, a lot on each side set back `setback` from the edge; the
// plot faces the road; picks a key from `pick(t,side)`; stops when `max` placed. Returns the count.
function frontage(R,pitch,setback,pick,max,opt){opt=opt||{};let n=0;const P=R.pts;let carry=pitch*rng();
 for(let i=0;i<P.length-1&&n<max;i++){const a=P[i],b=P[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
  for(let d=carry;d<L&&n<max;d+=pitch){for(const side of[-1,1]){if(n>=max)break;const key=pick(d/L,side);if(!key)continue;const D=VERN.defs[key];if(!D)continue;
   const hx=D.w/2,hz=D.d/2;const off=R.w/2+(R.oak?Math.max(setback,12):setback)+hz;/* an avenue's houses stand back past the oaks */const cx=a[0]+ux*d+(-uz)*side*off,cz=a[1]+uz*d+ux*side*off;
   const ry=Math.atan2((a[0]+ux*d)-cx,(a[1]+uz*d)-cz);   // face the road: the door toward the road's centreline
   const o={x:cx,z:cz,hx:hx+1,hz:hz+1,ry,pad:1.5};if(!groundOK(o,{ppad:2})||!occFree(o,1.5))continue;
   o.hx=hx;o.hz=hz;placeDef(key,o,Object.assign({settle:opt.settle},opt.each?opt.each(key):{}));n++;}}
  carry=(carry+Math.ceil((L-carry)/pitch)*pitch)-L;}
 return n;}
// a bridge: planks over the channel where a road crosses it
function dnBridge(b){const c=vC(0x6a5a44);const L=(channelD(b.x,b.z).w||8)+6;const y=terrainH(b.x+Math.sin(b.ry)*L,b.z+Math.cos(b.ry)*L);
 kput('vWood',[b.x,WATER_Y+.9,b.z],qEuler(0,b.ry,0),[Math.min(b.w,10),.3,L],c);for(const sd of[-1,1]){const p=loc(b.x,b.z,sd*Math.min(b.w,10)/2,0,b.ry);kput('vWood',[p[0],WATER_Y+1.5,p[1]],qEuler(0,b.ry,0),[.12,.9,L],c);}
 for(let k=-1;k<=1;k++){const p=loc(b.x,b.z,0,k*L*.4,b.ry);for(const sd of[-1,1]){const q=loc(p[0],p[1],sd*Math.min(b.w,10)*.45,0,b.ry);kput('vPostB',[q[0],WATER_Y-1,q[1]],null,[.16,2.2,.16],c);}}}
// ---------------------------------------------------------------- the Ancient lab, through a VERN wrapper (as Iziz wraps its Ancient guilds)
function buildDalabLab(G,o){reseed(8901);const r0=VERN.cur.r0;let H=null;const lush=BIOME.lush;BIOME.lush=0;   // no hypertree overgrowth: the lowlands biome dresses the compound
 try{H=withFlatGround(()=>buildDalab(G,0,0,1));}catch(e){reportErr('lab: '+e.stack);}finally{BIOME.lush=lush;KOFF=[0,0,0];}
 vnAdoptREG(r0,n=>n,{type:['civic','religious'],wealth:'civic',lit:true,ancient:true});
 // the great dome's registration becomes the landmark
 for(let i=r0;i<REG.length;i++)if(/great dome/.test(REG[i].name)){REG[i].tags.landmark=true;REG[i].name='The God — the Ancient lab';}
 return H;}
dDef({key:'dalab_lab',name:'The Ancient lab',family:'ancient',tags:{type:['civic','religious'],wealth:'civic',lit:true,landmark:true,ancient:true},w:600*4.105*.4/1,d:600*4.105*.4,h:390*4.105*.4,build:buildDalabLab});
// TARGET: city — the settlement. The showcase's SITES loop is skipped (window.CITY); 90b builds the world.
const TITLE='Dalab';
const GROUND_C=0;
const SITES=[];
// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8b090);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00055);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.3,6000);
scene.add(new THREE.HemisphereLight(0xffe8d0,0x4a3a2a,.7));
const sun=new THREE.DirectionalLight(0xfff0dc,1.6);sun.position.set(-600,700,400);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c8ff,.32);fill.position.set(500,300,-600);scene.add(fill);
// hooks the frame loop runs (city: sky/lighting update); the showcase adds none
const FRAME_HOOKS=[];
// sky dome (the Ancients kit's warm haze sky; the city target swaps in KratorSky and skips this block)
let sky,giant,groundM,LABELS;const SITE_GROUPS=[];
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

if(!window.CITY){
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=vec3(.84,.66,.48);vec3 zen=vec3(.30,.42,.66);vec3 c=mix(hz,zen,pow(h,.5));gl_FragColor=vec4(c,1.);}'});
sky=new THREE.Mesh(new THREE.SphereGeometry(5000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(1400,1400,1);giant.userData.probeSkip=true;scene.add(giant);

// ground: packed earth, tiled in world units
TEX.dirt.repeat.set(150,150);
groundM=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),MAT.dirt);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// ---------------------------------------------------------------- build every site the target lists
// SITES = [{key, x, z, ry, o, label}] from the target's 89z-rows.js
for(const S of SITES){const k=S.key+'/'+((S.o&&S.o.v)||0);TSTAT.cur=k;const r0=REG.length;
 const G=VERN.place(scene,S.key,S.x,S.z,S.ry||0,S.o);if(G)SITE_GROUPS.push({S,G});
 for(let i=r0;i<REG.length;i++)REG[i].type=S.key;TSTAT.cur=null;}
window._registered=REG.length;
kbake(scene);

// site labels come from src/93-labels.js (the atlas over REG)
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
}   // end showcase-only block
// ================================================================= DALAB CITY — the world: terrain, water, the lab, the mounds
// Runs after 90-scene (renderer/scene/camera/lights exist; the showcase block was skipped because window.CITY).
reseed(SEED_CITY+5);
const CITY_T0=performance.now();
scene.fog.density=.00013;
// the terrain: one plane, 8 m cells, the painted albedo (made at the END of 90b so the footprints are on it)
function cityTerrainMesh(){const N=Math.round(CITY.WORLD/8);const g=new THREE.PlaneGeometry(CITY.WORLD,CITY.WORLD,N,N);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const lx=p.getX(i),ly=p.getY(i);p.setZ(i,terrainH(lx,-ly));}
 g.computeVertexNormals();
 const tex=new THREE.CanvasTexture(gcv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=4;tex.minFilter=THREE.LinearMipmapLinearFilter;
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.96,metalness:0});
 groundM=new THREE.Mesh(g,m);groundM.rotation.x=-Math.PI/2;groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 window._terrainTex=tex;
 // the water: a strip down the river's course and a quad per channel segment, at WATER_Y (a world-wide plane just
 // under the ground z-fought the terrain at a distance)
 const geos=[];{const pts=[];for(let z=-CITY.WORLD/2;z<=CITY.WORLD/2;z+=60)pts.push([riverX(z),z]);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const g=new THREE.PlaneGeometry(150,Math.hypot(b[0]-a[0],b[1]-a[1])+2);g.rotateX(-Math.PI/2);g.rotateY(-Math.atan2(b[0]-a[0],b[1]-a[1]));g.translate((a[0]+b[0])/2,0,(a[1]+b[1])/2);geos.push(g);}
  for(const C of CHANNELS)for(let i=0;i<C.pts.length-1;i++){const a=C.pts[i],b=C.pts[i+1];const g=new THREE.PlaneGeometry(C.w*1.6,Math.hypot(b[0]-a[0],b[1]-a[1])+C.w);g.rotateX(-Math.PI/2);g.rotateY(-Math.atan2(b[0]-a[0],b[1]-a[1]));g.translate((a[0]+b[0])/2,0,(a[1]+b[1])/2);geos.push(g);}}
 const w=meshMerged(geos,new THREE.MeshStandardMaterial({color:0x2a5a52,roughness:.15,metalness:.2,transparent:true,opacity:.86,side:DS}),scene,0,WATER_Y,0);if(w){w.userData.probeSkip=true;w.name='water';}}
// ---------------------------------------------------------------- the Ancient lab, the High Priest's mound, the settlements' mounds
TSTAT.cur='dalab_lab/0';
placeDef('dalab_lab',{x:CITY.LAB.x,z:CITY.LAB.z,ry:0},{scale:CITY.LAB.scale,y:terrainH(CITY.LAB.x,CITY.LAB.z)-.4,landmark:'The Ancient lab',ignoreMask:true});
TSTAT.cur=null;
precinct(CITY.LAB.x,CITY.LAB.z,352*4.105*CITY.LAB.scale+24,'the lab and its apron');   // nothing of Dalab's stands on the Ancients' apron
placeDef('dalab_high_mound',{x:HIGH_MOUND.x,z:HIGH_MOUND.z,ry:HIGH_MOUND.ry},{y:terrainH(HIGH_MOUND.x,HIGH_MOUND.z),landmark:"High Priest's mound",ignoreMask:true,ignorePrecinct:true});
for(const S of SETTLE){const key=S.main?'dalab_palace_mound':'dalab_mound';const o={x:S.x,z:S.z,ry:S.face};
 placeDef(key,o,{y:terrainH(S.x,S.z),landmark:S.main?"High Priest's palace":S.name+' mound',ignoreMask:true,ignorePrecinct:true,settle:S.key});S.moundOBB=o;}

// ---------------------------------------------------------------- the ruined ancient wall round the compound
// A real wall in place of the kit's ring of blocks: a battered ghost-panel curtain ~9 m high and 3 m thick in 6 m
// bays on a concrete footing, its height eaten away by noise (down to stubs and to nothing), toppled bays lying as
// slabs outside it, rust seams, and clean openings wherever a road of the settlement crosses its line.
(function labWall(){reseed(SEED_CITY+8);const K=4.105*CITY.LAB.scale;const R=292*K,cx=CITY.LAB.x,cz=CITY.LAB.z;const n=Math.round(TAU*R/6);TSTAT.cur='dalab_lab/0';
 const bayW=TAU*R/n;let stubs=0,bays=0,gaps=0;
 for(let k=0;k<n;k++){const th=(k+.5)/n*TAU;const r=R+9*fbm(k*.11,3.1,9370,2);const x=cx+Math.cos(th)*r,z=cz+Math.sin(th)*r;const ry=-th+Math.PI/2;
  const road=nearestRoadPt(x,z);if(road&&road.d<road.road.w/2+7){gaps++;continue;}                          // an opening where a street passes
  const y=terrainH(x,z);const ruin=fbm(k*.06,7.7,9372,3);
  if(ruin<.30){if(rng()<.5)kput('vRustB',[x+Math.cos(th)*rr(4,14),y+.5,z+Math.sin(th)*rr(4,14)],qEuler(rr(-.2,.2),th+rr(-.4,.4),rr(-.15,.15)),[bayW*.9,1.1,rr(5,9)],null);continue;}   // fallen: a slab on the ground outside
  const h=ruin<.42?rr(1.2,3.5):3+11*smoothstep(.42,.85,ruin)+rr(-.6,.6);if(ruin<.42)stubs++;else bays++;
  kput('vPanelB',[x,y-.5,z],qEuler(0,ry,0),[bayW+.05,.9,3.6],null);                                          // footing
  kput('dEarthBat',[x,y+.3,z],qEuler(0,ry,0),[bayW+.02,h,3.0],vC(0xd8d4cc));                                // the battered bay (rammed-earth wedge geometry, tinted ghost-white)
  kput('vPanelB',[x,y+.3,z],qEuler(0,ry,0),[bayW-.3,h*.96,2.7],null);                                         // the panel skin
  if(h>6){kput('vRustB',[x,y+h-1.2,z],qEuler(0,ry,0),[bayW+.1,.5,3.1],null);kput('vPanelB',[x,y+h-.6,z],qEuler(0,ry,0),[bayW+.4,.7,3.4],null);}   // rust seam and coping
  if(rng()<.35)kput('vRustB',[x,y+rr(.5,Math.max(.6,h-1.5)),z],qEuler(0,ry,0),[rr(.8,2.2),rr(.6,1.4),3.2],null);   // rust bleeding through
  if(rng()<.4)kput('vRock',[x+Math.cos(th)*rr(2.5,6),y+.3,z+Math.sin(th)*rr(2.5,6)],qEuler(rng(),rng(),0),[rr(.6,1.4),rr(.5,1.0),rr(.6,1.4)],vC(0x9a968e));}   // rubble at the foot
 TSTAT.cur=null;REG.push({name:'The ancient wall (ruined)',x:cx,y:0,z:cz,r:R+6,h:14,cls:'building',key:'dalab_lab',tags:{culture:'dalab',type:['military','infrastructure'],wealth:'civic',lit:false,ancient:true,part:'wall'}});
 window._labWall={bays,stubs,gaps};})();
// ---------------------------------------------------------------- the horizon: cleared fields and forest going to the horizon (the brief), under the Krator sky
// An annulus from the terrain's edge out to 9 km painted with fields, hedges and forest blocks, and a merged mesh of
// far-tree blobs in the forest belt. KratorSky (81, attached in 94) gives the giant, its rings, the sun, stars and moon.
(function horizon(){reseed(SEED_CITY+7);const R0=CITY.WORLD/2-40,R1=9000;
 const cv=document.createElement('canvas');cv.width=cv.height=1024;const g=cv.getContext('2d');const S=R1*2/1024,pxh=v=>(v+R1)/S;
 g.fillStyle='#3a4a26';g.fillRect(0,0,1024,1024);
 // clearings with fields: a few dozen discs of farmland with strip fields, more toward the map
 for(let i=0;i<70;i++){const a=rng()*TAU,r=rr(R0*.9,R1*.85),x=Math.cos(a)*r,z=Math.sin(a)*r,rad=rr(260,900);g.save();g.beginPath();g.arc(pxh(x),pxh(z),rad/S,0,7);g.clip();
  g.fillStyle='#7f9a4c';g.fillRect(0,0,1024,1024);const ry=rng()*TAU;for(let k=0;k<30;k++){const d=(k-15)*rad*.09;g.fillStyle=vPick(['#a08a3c','#8a9a38','#b89a48','#6f8a30','#c4a050','#7f9a44']);g.save();g.translate(pxh(x),pxh(z));g.rotate(ry);g.fillRect(d/S,-rad/S,rad*.07/S,rad*2/S);g.restore();}
  g.restore();}
 for(let i=0;i<3000;i++){g.fillStyle=vPick(['rgba(30,50,26,.5)','rgba(60,80,40,.4)','rgba(40,60,30,.5)']);g.beginPath();g.arc(rng()*1024,rng()*1024,rr(2,9),0,7);g.fill();}
 const tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;
 const geo=new THREE.RingGeometry(R0,R1,96,1);geo.rotateX(-Math.PI/2);
 // the ring's UVs are polar; give it planar ones so the painting maps as a map
 {const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<pos.count;i++){uv.setXY(i,(pos.getX(i)+R1)/(2*R1),1-(pos.getZ(i)+R1)/(2*R1));}}
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,roughness:1,metalness:0}));m.position.y=terrainH(0,0)-.6;m.userData.probeSkip=true;m.name='horizon';scene.add(m);
 // far trees: blobs in the forest belt, one merged mesh
 const geos=[];const ico=new THREE.IcosahedronGeometry(1,0);for(let i=0;i<2600;i++){const a=rng()*TAU,r=rr(R0+60,R1*.7),x=Math.cos(a)*r,z=Math.sin(a)*r;const px=Math.floor(pxh(x)),pz=Math.floor(pxh(z));
  const d=g.getImageData(px,pz,1,1).data;if(d[1]>130&&d[0]>110)continue;   // not on a field
  const h=rr(14,30),w=rr(12,24);const gg=ico.clone();gg.scale(w,h,w);gg.translate(x,terrainH(0,0)-.6+h*.5,z);geos.push(gg);}
 const f=meshMerged(geos,new THREE.MeshStandardMaterial({color:vC(0x2e4a26),roughness:1,flatShading:true}),scene,0,0,0);if(f){f.userData.probeSkip=true;f.name='far forest';}
 window._horizon={trees:geos.length};})();
// ================================================================= DALAB CITY — the build: markets and civic on the plazas, nobles, the streets' frontage, farms, the biome, bakes
// Order per settlement: the market on the plaza; the civic set round the plaza (tavern, barracks, granaries,
// warehouse...); 2-3 noble houses on the radials nearest the mound; then the frontage walker fills every street with
// peasant houses, workshops and shops until the settlement's count is met. The main settlement gets 3x of all of it,
// the large market, the Halls, the ranch, the embassies, the chapterhouse, the healers, the priests' compounds, the
// windmills. Everything is placed facing its street and tested against the mask and the occupancy hash, so no
// building stands on a street or on another building. A final audit counts what slipped through (none should).
reseed(SEED_CITY+6);
const HUTS=['dalab_hut_a','dalab_hut_a','dalab_hut_b','dalab_hut_c','dalab_hut_c','dalab_compound'];
const TRADE=['dalab_shops','dalab_workshop','dalab_potter','dalab_weaver','dalab_dyer','dalab_smithy','dalab_warehouse','dalab_granaries'];
// the town types (round 10): what a full grid is made of between the huts and the civic set
const TOWN_DENSE=['dalab_rowhouse','dalab_rowhouse','dalab_tenement','dalab_tenement','dalab_compound'];
const TOWN_SMALL=['dalab_well','dalab_orchard','dalab_earthyard','dalab_hut_a','dalab_hut_c','dalab_rowhouse'];
const NOBLE=['dalab_noble_a','dalab_noble_b','dalab_noble_c'];
function placeSettlement(S){reseed(SEED_CITY+10+SETTLE.indexOf(S));const P=S.plaza;const k=S.main?3:1;const own=r=>r.zone&&r.zone.indexOf(S.key+':')===0;
 // the market on the plaza (the large one for the main settlement), a shrine beside it
 // (the plaza is reserved ground in the mask, so these two are let onto it by name)
 placeNear(S.main?'dalab_market_large':'dalab_market_small',P.x,P.z,{ry:S.face+Math.PI,R:20,step:6,ignorePrecinct:true,ignoreMask:true,ignoreOak:true,settle:S.key,landmark:S.main?'The great market':null});
 placeNear('dalab_shrine',P.x+Math.cos(S.face)*(P.r-6),P.z-Math.sin(S.face)*(P.r-6),{R:30,step:5,settle:S.key,ppad:-3,ignoreMask:true,ignorePrecinct:true,ignoreOak:true});
 // the civic set round the plaza's rim
 const rim=(key,a,opt)=>placeNear(key,P.x+Math.sin(a)*(P.r+22),P.z+Math.cos(a)*(P.r+22),Object.assign({R:110,step:9,settle:S.key,filter:own},opt||{}));
 const back=Math.atan2(S.x-P.x,S.z-P.z);
 for(let i=0;i<k;i++)rim('dalab_tavern',back+Math.PI+.5+i*.9,{landmark:i===0?(S.main?'The great tavern':null):null});
 rim('dalab_barracks',back+Math.PI-.9,{landmark:S.main?"The guard's barracks":null});
 for(let i=0;i<2*k;i++)rim('dalab_granaries',back+Math.PI+1.8+i*.45);
 for(let i=0;i<k;i++)rim('dalab_warehouse',back+Math.PI-1.7-i*.5);
 for(let i=0;i<k;i++)rim('dalab_smithy',back-2.3-i*.4,{R:160});
 rim('dalab_priest_house',back+.9,{R:60});rim('dalab_priest_house',back-.9,{R:60});
 rim('dalab_shops',back+Math.PI-.2,{R:120});rim('dalab_workshop',back+Math.PI+2.4,{R:140});if(!S.main){rim('dalab_windmill',back+Math.PI+.1,{R:220,ppad:2});rim('dalab_potter',back+Math.PI-2.6,{R:140});}
 // nobles on the radials nearest the mound, then the rest of the nobles further out
 const rads=S.radials.slice().sort((a,b)=>angDiff(a.a,back)-angDiff(b.a,back));
 for(let i=0;i<(S.main?8:2+Math.floor(rng()*2));i++){const R=rads[i%rads.length];const t=rr(.35,.8);const x=P.x+Math.sin(R.a)*(P.r+R.L*t),z=P.z+Math.cos(R.a)*(P.r+R.L*t);
  placeNear(NOBLE[i%3],x,z,{R:90,step:9,settle:S.key,filter:own});}
 // the main settlement's own: the Halls, the ranch, the embassies and the chapterhouse, the healers, the priests' compound, windmills
 if(S.main){
  const at=(key,a,d,opt)=>placeNear(key,P.x+Math.sin(a)*d,P.z+Math.cos(a)*d,Object.assign({R:160,step:12,settle:S.key},opt||{}));
  for(const Bg of S.big)placeDef(Bg.key,{x:Bg.x,z:Bg.z,ry:faceRoadRy(Bg.x,Bg.z)},{landmark:Bg.name,settle:S.key,ignoreMask:true,ignorePrecinct:true,ignoreOak:true});   // the Halls and the ranch at their precincts (the grid stopped at them)
  // the round-10 civic on the grid: bath houses, scribes' halls, travellers' inns at the avenues' ends, watch towers on the outer ring, earth yards at the edge
  for(let i=0;i<2;i++)at('dalab_bathhouse',back+Math.PI+(i?1.1:-1.1),165,{landmark:i?null:'The bath house'});
  for(let i=0;i<2;i++)at('dalab_scribes',back+(i?.95:-.95),235,{landmark:i?null:"The scribes' hall"});
  for(const R of S.radials.filter(r=>r.oak))at('dalab_inn',R.a,S.ringR3-30,{R:120,landmark:null});
  for(let i=0;i<7;i++)at('dalab_watchtower',back+Math.PI+(i-3)*.72,S.ringR3+6,{R:60,step:8});
  for(let i=0;i<3;i++)at('dalab_earthyard',back+Math.PI+(i-1)*1.9,S.ringR3-40,{R:90});
  at('dalab_healers',back+Math.PI+.1,120,{landmark:"The healers' hall"});
  const EMB=['dalab_embassy_iziz','dalab_embassy_voth','dalab_embassy_yuni','dalab_embassy_republic','dalab_chapterhouse'];
  EMB.forEach((key,i)=>at(key,back+Math.PI+1.35+i*.16,250,{landmark:VERN.defs[key].name}));
  for(let i=0;i<4;i++)at('dalab_windmill',back+Math.PI+(i-1.5)*.9,S.r+40,{R:200,ignorePrecinct:true});
  for(let i=0;i<3;i++)at('dalab_market_small',back+Math.PI+(i-1)*1.6,300,{R:120});
  for(let i=0;i<4;i++)at('dalab_workshop',back+Math.PI+(i-1.5)*.5,200,{R:120});for(let i=0;i<3;i++)at(TRADE[i+2],back+Math.PI+(i-1)*.7,340,{R:140});for(let i=0;i<3;i++)at('dalab_granaries',back+(i-1)*.6,260,{R:120});}
 // the frontage: peasant houses, with trade along the radials near the plaza; count target 15-20 (x3)
 const target=(S.main?720:32)+Math.floor(rng()*3);let n=0;   // the main settlement fills its grid (round 10); the walker stops when the streets are full
 const streets=ROADS.filter(r=>(own(r)&&r.zone!==S.key+':farmlane')||(S.main&&r.zone==='main:oak')).sort((a,b)=>(a.zone==='main:oak'?0:a.zone.indexOf('radial')>=0?1:2)-(b.zone==='main:oak'?0:b.zone.indexOf('radial')>=0?1:2));
 const pick=(t,side)=>{const r=rng();if(t<.35&&r<.28)return vPick(TRADE);if(r<.08)return 'dalab_compound';return vPick(HUTS);};
 // the main settlement's streets: dense dwellings and the town types mixed with the huts; trade toward the plaza
 const pickMain=(t,side)=>{const r=rng();if(t<.4&&r<.14)return vPick(TRADE);if(r<.30)return vPick(TOWN_DENSE);if(r<.34)return 'dalab_well';if(r<.37)return 'dalab_orchard';if(r<.39)return 'dalab_earthyard';return vPick(HUTS);};
 for(const R of streets){if(n>=target)break;n+=frontage(R,13,4.5,S.main?pickMain:pick,target-n,{settle:S.key});}
 // the main settlement's blocks: whatever the frontage left open inside the grid gets a small plot facing the nearest street
 if(S.main){let got=0,tries=0;while(got<160&&tries++<1400){const a=rng()*TAU,r=Math.sqrt(rng())*(S.ringR3+10);const x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;const rd=nearestRoadPt(x,z,q=>!q.oak);if(!rd||rd.d>40||rd.d<8)continue;
   if(placeNear(vPick(TOWN_SMALL),x,z,{R:12,step:6,settle:S.key,pad:2}))got++;}n+=got;S.infill=got;}
 // if the streets are full and the count is short, the lanes and the mound lane take the rest
 if(n<target)for(const R of ROADS.filter(r=>r.zone&&(r.zone===S.key+':farmlane'||r.zone===S.key+':moundlane'))){if(n>=target)break;n+=frontage(R,22,4.5,()=>vPick(HUTS),target-n,{settle:S.key});}
 S.houses=n;return n;}
for(const S of SETTLE)placeSettlement(S);
// the highway and the avenue frontage: a few wayside shrines and the odd hut
{reseed(SEED_CITY+20);for(const R of ROADS.filter(r=>r.zone==='highway'))frontage(R,260,6,()=>rng()<.5?'dalab_shrine':null,10,{});
 for(const R of ROADS.filter(r=>r.zone==='avenue'))frontage(R,120,9,(t,side)=>rng()<.6?'dalab_shrine':null,6,{});}
// bridges
for(const b of BRIDGES)dnBridge(b);
// ---------------------------------------------------------------- the audit: anything on a street or overlapping another (should be 0)
(function audit(){let onRoad=0,overlap=0;const who=[];for(const P of PLACED){const o=P.o;if(o.built==='dalab_lab')continue;const ROUND={dalab_halls:66,dalab_priest_compound:21,dalab_market_small:12,dalab_market_large:30};if(/mound/.test(o.built)||ROUND[o.built]){const r=ROUND[o.built]||VERN.defs[o.built].w/2-8;for(let k=0;k<16;k++){const a=k/16*TAU;if(isRoad(o.x+Math.cos(a)*r,o.z+Math.sin(a)*r)){onRoad++;who.push(o.built+'@'+Math.round(o.x)+','+Math.round(o.z));break;}}continue;}const c=obbCorners(o,-1);for(const p of c)if(isRoad(p[0],p[1])){onRoad++;who.push(o.built+'@'+Math.round(o.x)+','+Math.round(o.z));break;}
  for(const Q of PLACED){if(Q===P||Q.o.built==='dalab_lab')continue;if(obbOverlap(o,Q.o,-1)){overlap++;break;}}}
 window._audit={placed:PLACED.length,onRoad,overlap,who:who.slice(0,40)};})();
window._registered=REG.length;
// ---------------------------------------------------------------- the biome: the clearing, the residual stands, the forest, the avenue's live oaks, the river's willows
const ORIGINS=SETTLE.map(S=>[S.plaza.x,S.plaza.z]);ORIGINS.push([CITY.LAB.x,CITY.LAB.z+400]);
function standK(x,z){return smoothstep(.56,.68,fbm(x*.0019+11,z*.0019-4,9,3));}
function bioMaskFn(x,z){const W=CITY.WORLD/2-10;if(Math.abs(x)>W||Math.abs(z)>W)return 0;if(maskAt(x,z)[0]<200)return 0;
 const d=Math.hypot(x-0,z+120);const forest=smoothstep(CITY.FOREST_R-140,CITY.FOREST_R+60,d);
 const ns=nearestSettle(x,z);const town=1-smoothstep(ns.S.r-40,ns.S.r+30,ns.d);
 const labD=Math.hypot(x-CITY.LAB.x,z-CITY.LAB.z),labR=292*4.105*CITY.LAB.scale;const lab=1-smoothstep(labR-20,labR+30,labD);
 return Math.max(forest,standK(x,z)*(1-town*.6)*(1-lab)*.9,town*(ns.S.main?.30:.42),lab*.55);}   /* the main settlement's grid is full of buildings now: less green between them (round 10) */   // towns are green: trees and understorey between the houses (the mask keeps them off footprints and streets)   // the compound is heavily overgrown: the biome roots inside the ruined wall (the domes are obstacles)
function bioTreeMaskFn(x,z){const m=bioMaskFn(x,z);return m;}
BIO.host.mask=bioMaskFn;BIO.host.origin=ORIGINS;BIO.host.center=[0,-120];BIO.host.obstacles=LAB_OBST.concat(PLACED.filter(p=>p.key!=='dalab_lab').map(p=>({x:p.o.x,z:p.o.z,r:Math.max(p.o.hx,p.o.hz)*.9})));   // no tree in a building
BIO.host.fields={wet:(x,z)=>riverD(x,z)<120?.9:.58,tropic:(x,z)=>.32,dry:(x,z)=>.22,salt:(x,z)=>0,flow:(x,z)=>riverD(x,z)<70?1-riverD(x,z)/70:(channelD(x,z).d<14?.5:0),upland:(x,z)=>.15};
BIO.setScene(scene);
// level of detail (round 10): the biome's hero radius is measured from the plazas; with seven origins nearly every tree on
// the map was a hero. The distance is scaled so heroes stand within ~700 m of a plaza (a settlement and its fields) and
// the belts between the towns get the mid and far builds.
{const lodD0=BIO.lodD;BIO.lodD=function(x,z){return lodD0(x,z)*1.5;};}
(function lowlands(){const q=CITY.QUALITY*.98;/* the 11 M ceiling with a full grid (round 10): the buildings took the trees' share */const t0=performance.now();let T={};
 BIO.cur='lowlands/trees';try{T=SWLOW.build({R:CITY.WORLD*.72,quality:q,avenues:OAK_ROADS().map(P=>({path:P,spacing:P.length>6?18:14,offset:10,species:'madrone'}))   /* flayed madrone avenues (Travis, round 9): the oaks hid the buildings */,groves:[{center:[SETTLE[0].x+300,SETTLE[0].z],r:70,spacing:16,species:'corkoak',stripped:true}]});}catch(e){reportErr('lowlands: '+e.stack);}
 BIO.cur=null;window._biome={trees:T.trees,avenue:T.avenue,grove:T.grove,heroes:T.heroes,far:T.far,ms:Math.round(performance.now()-t0)};})();
// live oaks sprinkled round every settlement: a few sprawl oaks on open ground outside the streets (not on a field, a road or a plot)
(function oaks(){reseed(SEED_CITY+9);BIO.cur='lowlands/oaks';let n=0;for(const S of SETTLE){const want=S.main?14:5;let tries=0;let got=0;
 while(got<want&&tries++<300){const a=rng()*TAU,r=S.r*rr(.55,1.25);const x=S.plaza.x+Math.cos(a)*r,z=S.plaza.z+Math.sin(a)*r;
  if(!canBuild(x,z)||inPrecinct(x,z,20)||isWater(x,z)||inOakCorridor(x,z,6))continue;const rd=nearestRoadPt(x,z);if(rd&&rd.d<26)continue;let hit=false;for(const P of PLACED){if(Math.hypot(P.o.x-x,P.o.z-z)<Math.max(P.o.hx,P.o.hz)+24){hit=true;break;}}if(hit)continue;
  try{SWLOW.treeAt('sprawloak',x,terrainH(x,z),z,{scale:rr(.8,1.05)});got++;n++;}catch(e){}}}
 BIO.cur=null;window._oaks=n;})();
cityTerrainMesh();
kbake(scene);
window._cityMs=Math.round(performance.now()-CITY_T0);
// ---------------------------------------------------------------- probe (window._api) — same contract as the Ancients kit's, so verify.py runs unchanged
const BUDGET={
 showcase:{tris:3000000,calls:400},
 cls:{small:60000,medium:250000,sky:400000,mega:700000},
 type:{},   // every vernacular key defaults to 'medium'
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();const bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z])pts.push([x,y,z]);});
 return pts;}
function regOccupancy(){const BK=100,by={};REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}
function nanSweep(){const bad=[];scene.traverse(o=>{if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,at:i,n:a.length});break;}});
 return{meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}
function typeStats(){const out={};for(const k in TSTAT.by){const t=TSTAT.by[k],base=k.split('/')[0];const cls=BUDGET.type[base]||'medium';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
// tag audit: every registered volume must carry a classification and the project tags
function tagAudit(){const bad=REG.filter(r=>!r.cls||!r.tags||!r.tags.culture||!r.tags.type||!r.tags.wealth);return{bad:bad.length,first:bad.slice(0,6).map(r=>r.name)};}
window._api={BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}return{tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,tagAudit,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 defs:()=>VERN.order.map(k=>{const D=VERN.defs[k];return{key:k,name:D.name,family:D.family,tags:D.tags,w:D.w,d:D.d,h:D.h};})};
// TARGET: city — camera presets [cx,cy,cz,tx,ty,tz, hour?]
const M_=SETTLE.find(S=>S.main),T1=SETTLE[0],T4=SETTLE[3];
const VIEWS={
 'Opening — the avenue':[AVENUE[2][0]-40,26,AVENUE[2][1]+70,AVENUE[1][0],40,AVENUE[1][1]-200],
 'Overview':[0,2400,1900,0,0,-100],
 'The lab from the avenue':[AVENUE[2][0]+60,44,AVENUE[2][1]-20,LAB_GATE[0],90,LAB_GATE[1]-260],
 'The lab gate':[LAB_GATE[0]+2,2.6,LAB_GATE[1]+230,LAB_GATE[0],36,LAB_GATE[1]-120],
 "High Priest's mound":[HIGH_MOUND.x+60,40,HIGH_MOUND.z+220,HIGH_MOUND.x,20,HIGH_MOUND.z],
 'Main plaza':[M_.plaza.x-90,50,M_.plaza.z+160,M_.plaza.x,6,M_.plaza.z],
 'Main plaza — eye level':[M_.plaza.x+20,1.7,M_.plaza.z+58,M_.plaza.x,4,M_.plaza.z-40],
 'The palace from the plaza':[M_.plaza.x,4,M_.plaza.z+10,M_.x,22,M_.z],
 'Main settlement — overview':[M_.x-500,380,M_.z+700,M_.x,0,M_.z],
 'Main settlement — a street':(()=>{const R=M_.radials[2];const a=R.a;return[M_.plaza.x+Math.sin(a)*(M_.plazaR+30),1.7,M_.plaza.z+Math.cos(a)*(M_.plazaR+30),M_.plaza.x+Math.sin(a)*(M_.plazaR+180),3,M_.plaza.z+Math.cos(a)*(M_.plazaR+180)];})(),
 'Oak avenue into town':(()=>{const R=M_.radials.find(r=>r.oak)||M_.radials[0];const a=R.a;return[M_.plaza.x+Math.sin(a)*(M_.plazaR+300),3,M_.plaza.z+Math.cos(a)*(M_.plazaR+300),M_.plaza.x,6,M_.plaza.z];})(),
 'The ancient wall':[CITY.LAB.x+300,14,CITY.LAB.z+560,CITY.LAB.x+120,12,CITY.LAB.z+470],
 'The lab compound':[CITY.LAB.x+200,60,CITY.LAB.z+520,CITY.LAB.x,40,CITY.LAB.z],
 'The horizon':[M_.x,30,M_.z+300,M_.x+2000,120,M_.z+2600],
 'The Halls and the ranch':[M_.x+300,260,M_.z+700,M_.x+100,0,M_.z+250],
 'Ashfold — overview':[T1.x-260,200,T1.z+380,T1.x,0,T1.z],
 'Ashfold — the plaza':[T1.plaza.x-Math.sin(T1.face)*22+Math.cos(T1.face)*6,1.7,T1.plaza.z-Math.cos(T1.face)*22-Math.sin(T1.face)*6,T1.x,14,T1.z],
 'Ashfold — a street':(()=>{const R=T1.radials[1];const a=R.a;return[T1.plaza.x+Math.sin(a)*(T1.plazaR+10),1.7,T1.plaza.z+Math.cos(a)*(T1.plazaR+10),T1.plaza.x+Math.sin(a)*(T1.plazaR+120),3,T1.plaza.z+Math.cos(a)*(T1.plazaR+120)];})(),
 'Oakhaven — overview':[T4.x+260,200,T4.z+380,T4.x,0,T4.z],
 'The highway':[T1.x+200,30,T1.z+300,T1.x+600,8,T1.z+500],
 'The river':[riverX(400)+120,60,600,riverX(0),0,0],
 'Fields':[M_.x+500,120,M_.z+450,M_.x+800,0,M_.z+700],
 'Night — main plaza':[M_.plaza.x-90,50,M_.plaza.z+160,M_.plaza.x,6,M_.plaza.z,22],
 'Night — the avenue':[AVENUE[2][0]-40,26,AVENUE[2][1]+70,AVENUE[1][0],40,AVENUE[1][1]-200,21.5],
 'Dusk — Ashfold':[T1.x-260,200,T1.z+380,T1.x,0,T1.z,18.6],
};
// ---------------------------------------------------------------- camera, inspector, polygon tool, walk mode
const ctl={target:new THREE.Vector3(0,10,0),theta:0,phi:1.1,radius:120};
function setView(cx,cy,cz,tx,ty,tz){WALK.on=false;ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){if(WALK.on){camera.position.set(WALK.x,WALK.y,WALK.z);camera.rotation.set(0,0,0);camera.rotation.order='YXZ';camera.rotation.y=WALK.yaw;camera.rotation.x=WALK.pitch;return;}
 const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const gy=terrainH(camera.position.x,camera.position.z)+1.2;if(camera.position.y<gy)camera.position.y=gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');
const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden one-button-per-view list: verify.py drives the camera by clicking these
const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
function uiButton(label,on,fn){const b=document.createElement('button');b.textContent=label;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}

// ---- inspector: hover shows name · classification · tags (project rule); toggleable, on by default
const INSP={on:true,last:0};const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function regAt(p){let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}return best;}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!(h.object.userData&&h.object.userData.probeSkip)&&h.object!==groundM&&!(h.object.userData&&h.object.userData.isGround));
 if(!hits.length){insp.style.display='none';return;}const p=hits[0].point;const r=regAt(p);
 if(!r){insp.style.display='block';insp.innerHTML='<b>unregistered '+(hits[0].object.isInstancedMesh?'instance':'mesh')+'</b>\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);return;}
 const t=r.tags||{};const tagLines=Object.keys(t).map(k=>'<span class="tag">'+k+'</span>: '+(Array.isArray(t[k])?t[k].join(', '):t[k])).join('\n');
 insp.style.display='block';insp.innerHTML='<b>'+r.name+'</b>\n<span class="cls">'+(r.cls||'?')+'</span>'+(r.key?'  ·  '+r.key:'')+'\n'+tagLines+'\n<span style="opacity:.6">'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'</span>';}
uiButton('Inspector',true,()=>{INSP.on=!INSP.on;if(!INSP.on)insp.style.display='none';return INSP.on;});
uiButton('Labels',true,()=>{if(LABELS)LABELS.visible=!LABELS.visible;return LABELS?LABELS.visible:false;});

// ---- polygon tool: click the ground to lay out a polygon; copy-pasteable world coordinates
const POLY={on:false,pts:[],fmt:0,grp:new THREE.Group(),line:null};POLY.grp.userData.probeSkip=true;scene.add(POLY.grp);
const polyEl=document.getElementById('poly'),polyOut=document.getElementById('polyout');
const polyMat=new THREE.MeshBasicMaterial({color:0xff5060}),polyLineMat=new THREE.LineBasicMaterial({color:0xffe060});
function polyRedraw(){while(POLY.grp.children.length)POLY.grp.remove(POLY.grp.children[0]);
 for(const p of POLY.pts){const m=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,8),polyMat);m.position.set(p[0],terrainH(p[0],p[1])+1.5,p[1]);m.userData.probeSkip=true;POLY.grp.add(m);}
 if(POLY.pts.length>1){const g=new THREE.BufferGeometry().setFromPoints(POLY.pts.map(p=>new THREE.Vector3(p[0],terrainH(p[0],p[1])+.4,p[1])));const l=new THREE.Line(g,polyLineMat);l.userData.probeSkip=true;POLY.grp.add(l);}
 const f=p=>POLY.fmt?'{x:'+p[0].toFixed(1)+',z:'+p[1].toFixed(1)+'}':'['+p[0].toFixed(1)+','+p[1].toFixed(1)+']';
 polyOut.value='['+POLY.pts.map(f).join(',')+']';window._poly=POLY.pts.slice();}
function polyAdd(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);const pl=new THREE.Plane(new THREE.Vector3(0,1,0),0);const hit=new THREE.Vector3();
 const gh=ray.intersectObjects(scene.children,true).find(h=>h.object===groundM||(h.object.userData&&h.object.userData.isGround));if(gh){POLY.pts.push([gh.point.x,gh.point.z]);polyRedraw();}else if(ray.ray.intersectPlane(pl,hit)){POLY.pts.push([hit.x,hit.z]);polyRedraw();}}
uiButton('Polygon',false,()=>{POLY.on=!POLY.on;polyEl.style.display=POLY.on?'block':'none';return POLY.on;});
document.getElementById('polyundo').onclick=()=>{POLY.pts.pop();polyRedraw();};
document.getElementById('polyclear').onclick=()=>{POLY.pts=[];polyRedraw();};
document.getElementById('polyclose').onclick=()=>{if(POLY.pts.length>2){POLY.pts.push(POLY.pts[0].slice());polyRedraw();}};
document.getElementById('polyfmt').onclick=e=>{POLY.fmt^=1;e.target.textContent=POLY.fmt?'Format: {x,z}':'Format: [x,z]';polyRedraw();};
document.getElementById('polycopy').onclick=()=>{polyOut.select();try{navigator.clipboard.writeText(polyOut.value);}catch(e){document.execCommand('copy');}};

// ---- walk mode (F): eye height 1.7 m, WASD, drag to look. The set is meant to be judged from here.
const WALK={on:false,x:0,y:1.7,z:40,yaw:0,pitch:0};
uiButton('Walk (F)',false,()=>{toggleWalk();return WALK.on;});
function toggleWalk(){WALK.on=!WALK.on;if(WALK.on){const d=new THREE.Vector3();camera.getWorldDirection(d);WALK.yaw=Math.atan2(-d.x,-d.z);WALK.pitch=0;
 WALK.x=camera.position.x;WALK.z=camera.position.z;WALK.y=terrainH(WALK.x,WALK.z)+1.7;}else{setView(WALK.x-Math.sin(WALK.yaw)*-30,20,WALK.z-Math.cos(WALK.yaw)*-30,WALK.x-Math.sin(WALK.yaw)*10,4,WALK.z-Math.cos(WALK.yaw)*10);}
 for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Walk'))b.classList.toggle('on',WALK.on);}

setView(...VIEWS[Object.keys(VIEWS)[0]]);
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — hover to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move · F walk at eye height · Polygon to mark coordinates';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4){if(drag.b===0&&POLY.on)polyAdd(e.clientX,e.clientY);else if(drag.b===2&&POLY.on){POLY.pts.pop();polyRedraw();}else if(drag.b===0&&!INSP.on)inspectAt(e.clientX,e.clientY);}drag=null;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag){if(INSP.on&&performance.now()-INSP.last>90){INSP.last=performance.now();inspectAt(e.clientX,e.clientY);}return;}
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(WALK.on){WALK.yaw-=dx*.004;WALK.pitch=clamp(WALK.pitch-dy*.004,-1.4,1.4);return;}
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{if(WALK.on){WALK.speed=clamp((WALK.speed||6)*(e.deltaY>0?.85:1.18),1,40);}else ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),2,3000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='f')toggleWalk();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(WALK.on){const sp=(WALK.speed||6)*(keys.shift?2.5:1)*dt;const fw=new THREE.Vector3(-Math.sin(WALK.yaw),0,-Math.cos(WALK.yaw)),rt=new THREE.Vector3(Math.cos(WALK.yaw),0,-Math.sin(WALK.yaw));
  if(keys.w){WALK.x+=fw.x*sp;WALK.z+=fw.z*sp;}if(keys.s){WALK.x-=fw.x*sp;WALK.z-=fw.z*sp;}if(keys.d){WALK.x+=rt.x*sp;WALK.z+=rt.z*sp;}if(keys.a){WALK.x-=rt.x*sp;WALK.z-=rt.z*sp;}
  if(keys.e)WALK.y+=sp;if(keys.q)WALK.y-=sp;const ge=terrainH(WALK.x,WALK.z)+1.7;if(!keys.e&&!keys.q)WALK.y=ge;else WALK.y=Math.max(ge,WALK.y);}
 else{const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
  if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
  if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;}
 for(const f of FRAME_HOOKS)f(dt,now);
 applyCam();if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}${WALK.on?'  WALK':''}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}  reg ${REG.length}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
// ================================================================= DALAB CITY — dev tools: the Paths overlay, the budgets, window._api.city
BUDGET.showcase={tris:11000000,calls:900};   // the settlement's ceiling (Travis, round 9)
BUDGET.cls.city=20000000;for(const k in TSTAT.by){BUDGET.type[k.split('/')[0]]='city';}
const PATHS={on:false,tex:null};
function pathsTexture(){if(PATHS.tex)return PATHS.tex;const c=document.createElement('canvas');c.width=c.height=CS;const g=c.getContext('2d');
 const COL={0:'#26221e',1:'#c8a860',2:'#2e7a3a',3:'#e8e0d0',4:'#c8c0b0',5:'#b8a890',6:'#d8b880',7:'#6a6a3a',8:'#1a3a3a',9:'#a08868',10:'#4a2a2a',11:'#3a3430',12:'#6a5a2a',13:'#3a6a2a'};
 const img=g.createImageData(CS,CS);const d=img.data;
 for(let i=0;i<CS*CS;i++){const k=kData[i*4];const col=COL[k]||'#000';const r=parseInt(col.slice(1,3),16),gg=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);d[i*4]=r;d[i*4+1]=gg;d[i*4+2]=b;d[i*4+3]=255;}
 g.putImageData(img,0,0);
 if(window.DOORS){g.fillStyle='#ff4040';for(const D of window.DOORS){g.fillRect(px(D.x)-1.5,px(D.z)-1.5,3,3);}}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;PATHS.tex=t;return t;}
uiButton('Paths',false,()=>{PATHS.on=!PATHS.on;groundM.material.map=PATHS.on?pathsTexture():window._terrainTex;groundM.material.needsUpdate=true;return PATHS.on;});
uiButton('Trees',true,()=>{const v=!(BIO.baked[0]&&BIO.baked[0].visible);for(const m of BIO.baked)m.visible=v;return v;});
window._api.city={CITY,settlements:()=>SETTLE.map(S=>({key:S.key,name:S.name,x:Math.round(S.x),z:Math.round(S.z),houses:S.houses})),roads:()=>ROADS.length,components:()=>window._roadComponents,
 audit:()=>window._audit,placed:()=>{const by={};for(const p of PLACED)by[p.key]=(by[p.key]||0)+1;return by;},fields:()=>FIELDS.length,biome:()=>window._biome,life:()=>window._life,ms:()=>window._cityMs};
// ---------------------------------------------------------------- floating building labels (standard new-world package)
// One label per registered volume (REG), drawn once into a texture atlas and rendered as ONE mesh of camera-facing
// quads: a thousand labels cost one draw call. Labels keep a constant size on screen (150 px; landmarks 260 px)
// and fade out past 300 m, landmarks never. Toggled with the Labels button (they live in the LABELS group).
// A world that already made LABELS (the city) gets the atlas added to it; one that did not gets the group made here.
const LABEL_ATLAS={W:4096,H:4096,cw:409,ch:48};
function labelsBuild(){
 if(!LABELS){LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);}
 const cols=LABEL_ATLAS.W/LABEL_ATLAS.cw,rows=LABEL_ATLAS.H/LABEL_ATLAS.ch,max=cols*rows;
 // which volumes get a label: buildings, farms and furniture; not repeated wall segments (a name seen 8+ times)
 const count={};for(const r of REG)count[r.name]=(count[r.name]||0)+1;
 let list=REG.filter(r=>r.name&&count[r.name]<8&&(!r.cls||r.cls==='building'||r.cls==='farm'||r.cls==='furniture')&&!(r.tags&&r.tags.part==='wall'));
 const isBig=r=>!!(r.tags&&(r.tags.role||r.tags.landmark));
 list.sort((a,b)=>(isBig(b)-isBig(a))||(b.r-a.r));if(list.length>max)list=list.slice(0,max);
 const cv=document.createElement('canvas');cv.width=LABEL_ATLAS.W;cv.height=LABEL_ATLAS.H;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
 const pos=[],apos=[],uv=[],cell=[],big=[],idx=[];
 list.forEach((r,i)=>{const cx=(i%cols)*LABEL_ATLAS.cw,cy=Math.floor(i/cols)*LABEL_ATLAS.ch;const B=isBig(r);
  g.fillStyle=B?'rgba(20,12,6,.72)':'rgba(0,0,0,.55)';g.fillRect(cx+1,cy+1,LABEL_ATLAS.cw-2,LABEL_ATLAS.ch-2);
  g.font=(B?'bold 34px':'bold 28px')+' system-ui,sans-serif';g.fillStyle=B?'#ffe2b0':'#f4e8d4';g.textAlign='center';g.textBaseline='middle';
  let t=r.name;while(g.measureText(t).width>LABEL_ATLAS.cw-10&&t.length>4)t=t.slice(0,-2);if(t!==r.name)t=t.slice(0,-1)+'…';g.fillText(t,cx+LABEL_ATLAS.cw/2,cy+LABEL_ATLAS.ch/2+1);
  const y=(r.y||0)+r.h+3,b=i*4;
  for(const c of[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]){pos.push(c[0],c[1],0);apos.push(r.x,y,r.z);uv.push((cx+(c[0]+.5)*LABEL_ATLAS.cw)/LABEL_ATLAS.W,1-(cy+(0.5-c[1])*LABEL_ATLAS.ch)/LABEL_ATLAS.H);cell.push(0,0);big.push(B?1:0);}
  idx.push(b,b+1,b+2,b,b+2,b+3);});
 if(!list.length)return null;
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('aPos',new THREE.Float32BufferAttribute(apos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('aBig',new THREE.Float32BufferAttribute(big,1));geo.setIndex(idx);
 // the uv above already addresses the cell, so the shader only flips nothing: cell offsets are baked in
 const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:false,
  uniforms:{map:{value:tex},uPxToWorld:{value:1}},
  vertexShader:`attribute vec3 aPos;attribute float aBig;uniform float uPxToWorld;varying vec2 vUv;varying float vA;
   void main(){vec4 mv=modelViewMatrix*vec4(aPos,1.0);float dist=-mv.z;float w=aBig>0.5?240.0:170.0;float k=dist*uPxToWorld;
    mv.xy+=position.xy*vec2(w*k,w*k*48.0/409.0);vA=aBig>0.5?1.0:(1.0-smoothstep(320.0,560.0,dist));vUv=uv;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D map;varying vec2 vUv;varying float vA;void main(){vec4 c=texture2D(map,vUv);c.a*=vA;if(c.a<0.02)discard;gl_FragColor=c;}`});
 const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.userData.probeSkip=true;m.name='labels';m.renderOrder=10;LABELS.add(m);
 FRAME_HOOKS.push(()=>{mat.uniforms.uPxToWorld.value=2*Math.tan(camera.fov*Math.PI/360)/innerHeight;});
 window._labels=list.length;return m;}
labelsBuild();
// ================================================================= DALAB — the lighting system (the standard package)
// The Krator sky (81-sky.js, as the Iziz city runs it) drives the sun, fill, hemisphere and fog by the hour of day;
// an hour slider in the UI and a seventh element on a VIEWS preset set it (the Ancients kit's night-preset idea).
// Night is a visibility flip on whole InstancedMeshes (KIT.meshes, from 30-kit.js): The God's light and the hearth
// fires (DNIGHT_ITEMS) show after dusk, the dark day glass (DDAY_ITEMS) shows by day. Nothing is rebuilt.
//
// Lighting rule (canon, as Iziz): only priest, noble and civic buildings carry The God's light — vLit() answers the
// def's `lit` tag or the placer's o.lit — and it is COLD teal-white. Peasant and trade buildings have no light but
// their hearths and yard fires, which are fire, not power, and allowed anywhere.
const DSKY={hour:15.8,day:200,dens:1.35};const DSKY_DAY=15.8;   // a preset without an hour is a DAY preset (as an Ancients preset without the night flag)
{if(sky){scene.remove(sky);sky=null;}if(giant){scene.remove(giant);giant=null;}     // the showcase's static sky goes; KratorSky replaces it
 KratorSky.attach(scene,5000);scene.fog.density=window.CITY?.00013:.00045;}
if(!window.CITY)BUDGET.showcase.tris=10000000;   // the set's ceiling (Travis, round 7): room for level of detail
const dHemi=scene.children.find(o=>o.isHemisphereLight);
let DNIGHT=null;
function dalabNight(on){on=!!on;if(DNIGHT===on)return;DNIGHT=on;
 for(const n of DNIGHT_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const n of DDAY_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=!on;}
function dalabSkyTick(){KratorSky.update(camera.position,DSKY.hour,DSKY.day,DSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(dHemi){dHemi.intensity=L.ambient;dHemi.color.setHex(L.dayF>.5?0xffe8d0:0x3c4c6a);}
 scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);renderer.toneMappingExposure=1.0+.12*(1-L.dayF);
 if(typeof BIO!=='undefined'&&BIO.host)BIO.setSun([L.sunDir.x,L.sunDir.y,L.sunDir.z]);
 dalabNight(L.dayF<.45);}
FRAME_HOOKS.push(dalabSkyTick);
if(sun.target&&!sun.target.parent)scene.add(sun.target);
dalabSkyTick();
// a seventh preset element is the hour: setView(...VIEWS[k]) from the select, the hidden buttons and window._api all pass it
const _dSetView=setView;
setView=function(cx,cy,cz,tx,ty,tz,hour){_dSetView(cx,cy,cz,tx,ty,tz);DSKY.hour=hour!=null?hour:DSKY_DAY;dalabSkyTick();dalabHourUI();};
let dalabHourUI=()=>{};
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#c8f0e8';
 const lab=document.createElement('span');const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.style.width='120px';
 dalabHourUI=()=>{sl.value=DSKY.hour;lab.textContent='hour '+DSKY.hour.toFixed(1)+(DNIGHT?' · night':'');};
 sl.oninput=()=>{DSKY.hour=parseFloat(sl.value);dalabSkyTick();dalabHourUI();};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);dalabHourUI();}
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;if(e.key.toLowerCase()==='n'){DSKY.hour=DNIGHT?12:22;dalabSkyTick();dalabHourUI();}});
window._api.setHour=h=>{DSKY.hour=h;dalabSkyTick();dalabHourUI();};window._api.night=()=>DNIGHT;
// ---------------------------------------------------------------- the biome (gardens), the mounds, the windmills
// The builders planted through SWLOW.treeAt / plantAt into BIO's items during the SITES loop (90-scene); the scene
// is bound and baked here, after kbake, and the wind tick joins the frame loop.
{BIO.setScene(scene);try{const b=BIO.bake();window._biome=Object.assign(window._biome||{},{calls:b.calls,inst:b.inst});}catch(e){reportErr('biome bake: '+e.stack);}
 BIO._tickWind&&BIO._tickWind();for(const f of BIO_TICKS)FRAME_HOOKS.push(f);BIO_TICKS.length=0;
 // every mound and ring bank in one mesh
 if(DMOUND_GEOS.length){const m=meshMerged(DMOUND_GEOS,MAT.dTurfMesh,scene,0,0,0);m.name='mounds';window._mounds=DMOUND_GEOS.length;DMOUND_GEOS.length=0;}}
FRAME_HOOKS.push(dt=>{for(const w of DWIND)w.grp.rotateZ(w.rate*dt);});
WALK.speed=9;   // a little faster on foot (Travis, round 9); the wheel still scales it
// ================================================================= DALAB CITY — the life layer
// Everything that moves, in two draw calls (bodies, heads: one InstancedMesh each, rewritten per frame).
//   townsfolk     wander the road network: pick a node, walk the shortest path, idle, pick another (green-skinned)
//   farm workers  work their field: walk between points in the field, stop, hoe, move on
//   priests       by the hour: 8-17 on the mound top before the temple (the ceremony), else at the mound foot;
//                 they climb the stair (a straight line up the mound profile, not the road graph)
//   the High Priest  cycles the High Priest's mound top, the lab gate and the Halls of Reformation
//   giants        the city watch: threes on the streets of every settlement, two-armed
// Roads are a graph: every polyline vertex a node, endpoints snapped to the segments they end on, Dijkstra for paths.
reseed(SEED_CITY+30);
(function(){
 // ---- the road graph ----
 const NODES=[],EDGES=[];const nkey=(x,z)=>Math.round(x/3)+','+Math.round(z/3);const NMAP={};
 function node(x,z){const k=nkey(x,z);if(NMAP[k]!=null)return NMAP[k];const i=NODES.length;NODES.push({x,z,adj:[]});NMAP[k]=i;return i;}
 function edge(a,b){if(a===b)return;const L=Math.hypot(NODES[a].x-NODES[b].x,NODES[a].z-NODES[b].z);NODES[a].adj.push([b,L]);NODES[b].adj.push([a,L]);EDGES.push([a,b]);}
 // split every segment at the endpoints of other roads that land on it
 const ends=[];for(const R of ROADS){ends.push(R.pts[0],R.pts[R.pts.length-1]);}
 for(const R of ROADS){for(let i=0;i<R.pts.length-1;i++){const a=R.pts[i],b=R.pts[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const cuts=[];
  for(const e of ends){const t=((e[0]-a[0])*dx+(e[1]-a[1])*dz)/l2;if(t<=.01||t>=.99)continue;if(Math.hypot(e[0]-a[0]-dx*t,e[1]-a[1]-dz*t)<R.w/2+2)cuts.push(t);}
  cuts.sort((p,q)=>p-q);let prev=node(a[0],a[1]);for(const t of cuts){const n=node(a[0]+dx*t,a[1]+dz*t);edge(prev,n);prev=n;}edge(prev,node(b[0],b[1]));}}
 function dijkstra(s,t){const D=new Float64Array(NODES.length).fill(1e18),P=new Int32Array(NODES.length).fill(-1);D[s]=0;const Q=[[0,s]];
  while(Q.length){let bi=0;for(let i=1;i<Q.length;i++)if(Q[i][0]<Q[bi][0])bi=i;const [d,u]=Q[bi];Q[bi]=Q[Q.length-1];Q.pop();if(d>D[u])continue;if(u===t)break;
   for(const [v,L] of NODES[u].adj){const nd=d+L;if(nd<D[v]){D[v]=nd;P[v]=u;Q.push([nd,v]);}}}
  if(D[t]>=1e17)return null;const path=[];let u=t;while(u!==-1){path.push(u);u=P[u];}return path.reverse();}
 const nearNode=(x,z)=>{let b=-1,bd=1e9;for(let i=0;i<NODES.length;i++){const d=Math.hypot(NODES[i].x-x,NODES[i].z-z);if(d<bd){bd=d;b=i;}}return b;};
 const settleNodes={};for(const S of SETTLE)settleNodes[S.key]=NODES.map((n,i)=>i).filter(i=>Math.hypot(NODES[i].x-S.plaza.x,NODES[i].z-S.plaza.z)<S.r+60);
 const Y=(x,z)=>Math.max(terrainH(x,z),WATER_Y+.9)+.05;
 // ---- agents ----
 const A=[];const add=o=>{o.bob=rng()*TAU;o.hd=rng()*TAU;A.push(o);return o;};
 const walker=(kind,nodes,tint,s,sp)=>add({kind,nodes,tint,s:s||1,sp:sp||rr(1.1,1.7),path:null,pi:0,t:0,wait:rr(0,6),x:0,z:0,at:nodes[Math.floor(rng()*nodes.length)]});
 const Q=CITY.QUALITY;
 for(const S of SETTLE){const N=settleNodes[S.key];if(!N.length)continue;const n=Math.round((S.main?70:16)*Q);
  for(let i=0;i<n;i++){const w=walker('folk',N,0);w.x=NODES[w.at].x;w.z=NODES[w.at].z;}
  // giants: threes
  for(let g=0;g<(S.main?4:1);g++){const lead=walker('giant',N,3,2.2,rr(1.6,2.0));lead.x=NODES[lead.at].x;lead.z=NODES[lead.at].z;for(let k=1;k<3;k++)add({kind:'follow',lead,off:[(k===1?-1:1)*2.6,-2.4*k],tint:3,s:2.2,x:lead.x,z:lead.z});}
  // farm workers in this settlement's fields
  const F=FIELDS.filter(f=>f.S===S.key);for(let i=0;i<Math.round((S.main?36:12)*Q)&&F.length;i++){const f=F[Math.floor(rng()*F.length)];add({kind:'farmer',f,tint:1,s:1,x:f.cx,z:f.cz,tx:f.cx,tz:f.cz,wait:rng()*5,sp:rr(.8,1.2)});}
  // priests: two per mound; home at the mound foot on the plaza side, the ceremony spot on the plateau in front of the temple
  const M=S.moundOBB;const top=S.main?17:13,rt=S.main?18:13;const f=S.face;const fd=[Math.sin(f),Math.cos(f)];const R=S.main?42:30;
  const home=[S.x+fd[0]*(R+6),S.z+fd[1]*(R+6)],up=[S.x+fd[0]*(rt-3),S.z+fd[1]*(rt-3)],prof=dnMoundProfile(R,rt,top);
  for(let i=0;i<(S.main?4:2);i++)add({kind:'priest',home:[home[0]+rr(-3,3),home[1]+rr(-2,2)],up:[up[0]+rr(-4,4),up[1]],c:[S.x,S.z],R,prof,tint:2,s:1.02,x:home[0],z:home[1],t:0,sp:rr(.9,1.2)});}
 // the High Priest: the high mound top → the lab gate → the Halls → the high mound
 {const H=HIGH_MOUND;const halls=PLACED.find(p=>p.key==='dalab_halls');const stops=[[H.x,H.z+26,20],[H.x,H.z+50,0],[LAB_GATE[0],LAB_GATE[1]+8,0]];if(halls)stops.push([halls.o.x,halls.o.z+72,0]);
  add({kind:'high',stops,i:0,t:0,wait:20,tint:4,s:1.05,x:stops[0][0],z:stops[0][1],prof:dnMoundProfile(46,20,20),c:[H.x,H.z]});
  for(let k=0;k<2;k++)add({kind:'follow',lead:A[A.length-1-k],off:[(k?-1:1)*2.4,-2.6],tint:3,s:2.2,x:H.x,z:H.z});}
 const N=A.length;window._life={agents:N,nodes:NODES.length,edges:EDGES.length};if(!N)return;
 // ---- two instanced meshes ----
 const bg=new THREE.CylinderGeometry(.24,.2,1.5,6);bg.translate(0,.75,0);
 const bIM=new THREE.InstancedMesh(bg,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,metalness:0}),N);
 const hIM=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0}),N);
 [bIM,hIM].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
 const col=new THREE.Color();A.forEach((ag,i)=>{if(ag.tint===2||ag.tint===4)col.copy(dCol(DPAL.priest));else if(ag.tint===3)col.copy(dCol(DPAL.red));else col.copy(dCol(DPAL.robe));bIM.setColorAt(i,col);hIM.setColorAt(i,ag.tint===3?dCol(DPAL.skin,.8):dCol(DPAL.skin));});
 bIM.instanceColor.needsUpdate=true;hIM.instanceColor.needsUpdate=true;
 REG.push({name:'Dalab — the living ('+N+' on the move)',x:0,y:0,z:-120,r:2300,h:60,cls:'life',key:'life',tags:{culture:'dalab',type:['life'],wealth:'peasant'}});
 // ---- the tick ----
 const M4=new THREE.Matrix4(),QQ=new THREE.Quaternion(),PP=new THREE.Vector3(),SS=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
 function stepPath(ag,dt){if(!ag.path){const goal=ag.nodes[Math.floor(rng()*ag.nodes.length)];const p=dijkstra(ag.at,goal);if(!p||p.length<2){ag.wait=rr(2,6);ag.path=null;return false;}ag.path=p;ag.pi=0;ag.t=0;}
  const a=NODES[ag.path[ag.pi]],b=NODES[ag.path[ag.pi+1]];const L=Math.hypot(b.x-a.x,b.z-a.z)||1;ag.t+=ag.sp*dt/L;
  if(ag.t>=1){ag.pi++;ag.t=0;ag.at=ag.path[ag.pi];if(ag.pi>=ag.path.length-1){ag.path=null;ag.wait=rr(3,14);ag.x=b.x;ag.z=b.z;return false;}}
  const a2=NODES[ag.path[ag.pi]],b2=NODES[ag.path[ag.pi+1]];ag.x=a2.x+(b2.x-a2.x)*ag.t;ag.z=a2.z+(b2.z-a2.z)*ag.t;ag.hd=Math.atan2(b2.x-a2.x,b2.z-a2.z);return true;}
 function toward(ag,tx,tz,dt){const dx=tx-ag.x,dz=tz-ag.z,d=Math.hypot(dx,dz);if(d<.3)return false;const s=Math.min(d,ag.sp*dt);ag.x+=dx/d*s;ag.z+=dz/d*s;ag.hd=Math.atan2(dx,dz);return true;}
 FRAME_HOOKS.push((dt,now)=>{dt=Math.min(dt,.1);const hour=DSKY.hour;const day=hour>=8&&hour<17;
  for(let i=0;i<N;i++){const ag=A[i];let moving=false,y=null;
   if(ag.kind==='folk'||ag.kind==='giant'){if(ag.wait>0){ag.wait-=dt;}else moving=stepPath(ag,dt);}
   else if(ag.kind==='follow'){const L=ag.lead;const tx=L.x+Math.cos(L.hd)*ag.off[0]+Math.sin(L.hd)*ag.off[1],tz=L.z-Math.sin(L.hd)*ag.off[0]+Math.cos(L.hd)*ag.off[1];ag.sp=2.4;moving=toward(ag,tx,tz,dt);if(!moving)ag.hd=L.hd;}
   else if(ag.kind==='farmer'){if(ag.wait>0){ag.wait-=dt;ag.hd+=Math.sin(now*3)*.02;}else{moving=toward(ag,ag.tx,ag.tz,dt);if(!moving){const f=ag.f;const p=f.pts;const u=rng(),v=rng();ag.tx=p[0][0]+(p[1][0]-p[0][0])*u+(p[3][0]-p[0][0])*v;ag.tz=p[0][1]+(p[1][1]-p[0][1])*u+(p[3][1]-p[0][1])*v;ag.wait=rr(3,9);}}}
   else if(ag.kind==='priest'){const goal=day?ag.up:ag.home;moving=toward(ag,goal[0],goal[1],dt);const rho=Math.hypot(ag.x-ag.c[0],ag.z-ag.c[1]);y=ag.prof(rho)+.05;if(!moving&&day){ag.hd=Math.atan2(ag.c[0]-ag.x,ag.c[1]-ag.z)+Math.PI;ag.arms=Math.sin(now*.8);}}
   else if(ag.kind==='high'){if(ag.wait>0)ag.wait-=dt;else{const s=ag.stops[(ag.i+1)%ag.stops.length];moving=toward(ag,s[0],s[1],dt);if(!moving){ag.i=(ag.i+1)%ag.stops.length;ag.wait=rr(25,60);}}
    const rho=Math.hypot(ag.x-ag.c[0],ag.z-ag.c[1]);y=rho<48?ag.prof(rho)+.05:null;}
   if(y==null)y=Y(ag.x,ag.z);
   const bob=moving?Math.abs(Math.sin(now*.006+ag.bob))*.08:0;QQ.setFromAxisAngle(UP,ag.hd);SS.set(ag.s,ag.s,ag.s);
   PP.set(ag.x,y+bob,ag.z);M4.compose(PP,QQ,SS);bIM.setMatrixAt(i,M4);
   PP.set(ag.x,y+bob+1.62*ag.s,ag.z);M4.compose(PP,QQ,SS);hIM.setMatrixAt(i,M4);}
  bIM.instanceMatrix.needsUpdate=true;hIM.instanceMatrix.needsUpdate=true;});
})();
