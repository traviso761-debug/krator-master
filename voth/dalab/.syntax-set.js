
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
 cream:[0xe8dcc0,0xf0e6cc],
 skin:[0x6a9a4a,0x5a8a42,0x7aa852,0x4f7f3c,0x86b060],                   // photosynthetic green, every citizen
 robe:[0xe8dcc0,0xa8382a,0x2f9a8a,0xd8a838,0x3b3b4a,0xf0e8d8,0x8a6a3a],
 priest:[0xf0e8d8,0x2f9a8a,0xd8a838],                                   // white, turquoise, gold: the caste
 turf:[0x5f8a3a,0x6a9a44,0x557f36,0x6f9a48],
 god:0x9af0e0,                                                          // The God's light
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
// Mural: a COLOUR frieze, one 2 x 2 m tile. Stepped-fret borders top and bottom, and between them a procession of
// avatars of The God — square heads with one great eye, rayed headdresses (Sun Gate), staffs in each hand —
// alternating with heroes of Dalab (smaller, in profile, spear and shield). Red ochre, turquoise, gold, black
// on a cream lime wash; the paint is worn at the foot.
TEX.dMural=canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#e6d8b8';g.fillRect(0,0,w,h);
 const RED='#a8382a',TQ='#2f9a8a',GOLD='#d8a838',BLK='#2a2420',CREAM='#efe6cc';
 const fret=(y0,hh,col)=>{g.fillStyle=col;const s=hh/4;for(let x=0;x<w;x+=s*6){   // stepped key meander
  g.fillRect(x,y0,s*5,s);g.fillRect(x,y0+hh-s,s*5,s);g.fillRect(x,y0,s,hh);g.fillRect(x+s*2,y0+s,s*3,s);g.fillRect(x+s*4,y0+s,s,hh-s*2);g.fillRect(x+s*2,y0+s,s,hh-s*2-s);}};
 g.fillStyle=RED;g.fillRect(0,0,w,10);g.fillRect(0,h-10,w,10);fret(12,28,BLK);fret(h-40,28,BLK);
 g.fillStyle=TQ;g.fillRect(0,42,w,3);g.fillRect(0,h-45,w,3);
 const god=(cx,cy,s)=>{ // the avatar: rayed head, one eye, staffs
  g.fillStyle=GOLD;for(let k=0;k<9;k++){const a=Math.PI*(k/8);const rx=cx+Math.cos(a)*s*.95,ry=cy-s*.55-Math.sin(a)*s*.9;g.fillRect(rx-s*.06,ry-s*.14,s*.12,s*.28);g.fillStyle=k%2?RED:GOLD;}
  g.fillStyle=RED;g.fillRect(cx-s*.5,cy-s*.95,s,s*.8);                          // head
  g.fillStyle=BLK;g.fillRect(cx-s*.5,cy-s*.95,s,s*.08);g.fillRect(cx-s*.5,cy-s*.15,s,s*.05);
  g.fillStyle=CREAM;g.beginPath();g.arc(cx,cy-s*.55,s*.26,0,TAU);g.fill();      // the eye
  g.fillStyle=BLK;g.beginPath();g.arc(cx,cy-s*.55,s*.12,0,TAU);g.fill();
  g.fillStyle=TQ;g.fillRect(cx-s*.42,cy-s*.15,s*.84,s*.9);                       // tunic
  g.fillStyle=GOLD;for(let k=0;k<3;k++)g.fillRect(cx-s*.34,cy+s*(.05+k*.25),s*.68,s*.08);
  g.fillStyle=BLK;g.fillRect(cx-s*.72,cy-s*.7,s*.08,s*1.5);g.fillRect(cx+s*.64,cy-s*.7,s*.08,s*1.5);   // staffs
  g.fillStyle=RED;g.fillRect(cx-s*.78,cy-s*.78,s*.2,s*.14);g.fillRect(cx+s*.58,cy-s*.78,s*.2,s*.14);
  g.fillStyle=BLK;g.fillRect(cx-s*.36,cy+s*.75,s*.26,s*.22);g.fillRect(cx+s*.1,cy+s*.75,s*.26,s*.22);};  // feet
 const hero=(cx,cy,s,flip)=>{const f=flip?-1:1;
  g.fillStyle=BLK;g.fillRect(cx-s*.28,cy-s*.7,s*.56,s*.5);                        // head in profile
  g.fillStyle=RED;g.fillRect(cx-s*.28,cy-s*.86,s*.56,s*.16);g.fillRect(cx+f*s*.2,cy-s*.55,f*s*.22,s*.16);   // headband, nose
  g.fillStyle=GOLD;g.fillRect(cx-s*.36,cy-s*.2,s*.72,s*.8);                        // body
  g.fillStyle=TQ;g.fillRect(cx-s*.36,cy+s*.2,s*.72,s*.14);
  g.fillStyle=BLK;g.fillRect(cx+f*s*.5,cy-s*1.0,s*.07,s*1.9);                     // spear
  g.fillStyle=RED;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.3,0,TAU);g.fill();g.fillStyle=CREAM;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.12,0,TAU);g.fill();   // shield
  g.fillStyle=BLK;g.fillRect(cx-s*.3,cy+s*.6,s*.22,s*.34);g.fillRect(cx+s*.08,cy+s*.6,s*.22,s*.34);};
 god(64,132,34);hero(192,138,30,false);   // one 2 x 2 m tile: an avatar and a hero
 // worn lime wash: lighten with age, scuff the foot
 const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wear=clamp((fbm(x/40,y/40,6.6,3)-.42)*2.2,0,1)*.45+clamp((y/h-.7)*1.6,0,1)*.5*fbm(x/9,y/9,2.2,2);
  for(let c=0;c<3;c++)d[i+c]=d[i+c]+(214-d[i+c])*wear*.8;const gr=(fbm(x/5,y/5,1.7,1)-.5)*14;d[i]+=gr;d[i+1]+=gr;d[i+2]+=gr;}
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
kdef('dRelief',VBOX,MAT.dRelief);kdef('dReliefBat',VBATTER,MAT.dRelief);kdef('dReliefDrum',DDRUM,MAT.dRelief);
kdef('dStoneDrum',DDRUM,MAT.stone);kdef('dStoneDrumB',DDRUMB,MAT.stone);kdef('dStoneDome',DDOMELOW,MAT.stone);kdef('dStonePyr',VPYR,MAT.stone);
kdef('dMural',VPLANE,MAT.dMuralP);kdef('dMuralB',VBOX,MAT.dMural);
kdef('dBanner',VPLANE,MAT.dBanner);
kdef('dTurf',VBOX,MAT.dTurf);kdef('dTurfDome',DDOMELOW,MAT.dTurf);kdef('dTurfDrum',DDRUMB,MAT.dTurf);kdef('dTurfCone',DCONESH,MAT.dTurf);
kdef('dWoodDrum',DDRUM,MAT.woodV);kdef('dStaveDrum',new THREE.CylinderGeometry(1,1,1,18).translate(0,.5,0),MAT.woodV);
kdef('dConeSh',DCONESH,MAT.shingle);kdef('dConeT',DCONESH,MAT.thatch);kdef('dConeTile',DCONESH,MAT.dTile);kdef('dConeCu',DCONESH,MAT.verdigris);kdef('dConeScrap',DCONESH,MAT.corrugate);
kdef('dTile',VBOX,MAT.dTile);kdef('dGableTile',VGABLE,MAT.dTile);kdef('dHipTile',VHIP,MAT.dTile);kdef('dPyrTile',VPYR,MAT.dTile);
kdef('dMosaic',VBOX,MAT.dMosaic);kdef('dGilt',VBOX,MAT.dGilt);kdef('dGiltDome',VDOME,MAT.dGilt);kdef('dGiltBall',VBALL,MAT.dGilt);
kdef('dPanelDome',VDOME,MAT.white);kdef('dRustDome',VDOME,MAT.rust);kdef('dPanelDrum',DDRUM,MAT.white);kdef('dRustDrum',DDRUM,MAT.rust);
kdef('dGlow',VBOX,MAT.dGod);kdef('dGlowDay',VBOX,MAT.dGodDay);kdef('dGodBall',VBALL,MAT.dGod);kdef('dGlassBall',VBALL,MAT.darkGlass);kdef('dGodStrip',new THREE.BoxGeometry(1,.14,.14),MAT.dGod);kdef('dGodHalo',VPLANE,MAT.dGodGlow);
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
 kput('dGodHalo',[b[0],y-.2,b[1]],vQ(ry,0,0),[1.6,1.6,1],null);}
function dnGodPost(x,y,z,h){vPst('vPipe',x,y,z,.07,h,vC(0x2e2a26));vB('vIron',x,y+h,z,.5,.06,.5,0,vC(0x2e2a26));vBall('dGodBall',x,y+h-.2,z,.16);vBall('dGlassBall',x,y+h-.2,z,.16);
 kput('dGodHalo',[x,y+h-.2,z],vQ(0,0,0),[2,2,1],null);kput('dGodHalo',[x,y+h-.2,z],vQ(Math.PI/2,0,0),[2,2,1],null);}
function dnGodStrip(x,y,z,ry,L){const f=loc(x,z,0,.08,ry);kput('dGodStrip',[f[0],y,f[1]],vQ(ry,0,0),[L,1,1],null);kput('dGodHalo',[f[0],y,f[1]],vQ(ry,0,0),[L*1.1,.9,1],null);}
// Firelight in an opening: the kit's own flame + ember cards (69-mat-salvage). Night only. (x,z) ON the face.
function dnHearth(x,y,z,ry,w,h){const f=loc(x,z,0,.08,ry),g=loc(x,z,0,.4,ry);kput('fireWin',[f[0],y+h/2,f[1]],vQ(ry,0,0),[w,h,1],null);
 kput('ember',[g[0],y+h*.6,g[1]],vQ(ry,0,0),[w*3.4,h*3.6,1],null);}
function dnFirePit(x,y,z,s){for(let k=0;k<7;k++){const a=k/7*TAU;kput('vRock',[x+Math.cos(a)*s*.9,y+.12,z+Math.sin(a)*s*.9],qEuler(rng(),rng(),0),[s*.3,s*.22,s*.3],vC(0x6a625a));}
 for(let k=0;k<3;k++)kput('vPost',[x,y+.12,z],qEuler(0,k*1.1,Math.PI/2),[.09,s*1.2,.09],vC(0x3a2a1c));firePit('dalab',x,y+.1,z,s);}

// ---------------------------------------------------------------- relief, murals, banners, gates, steles
// Carved band proud of a face; (x,z) ON the face, ry outward. dRelief tiles 1 m cells.
function dnReliefBand(x,y,z,ry,w,h,c){const f=loc(x,z,0,.07,ry);vB('dRelief',f[0],y,f[1],w,h,.16,ry,c);}
// Painted frieze on a flat face (2 m tile of avatars and heroes).
function dnMuralBand(x,y,z,ry,w,h){const f=loc(x,z,0,.04,ry);vB('dMuralB',f[0],y,f[1],w,h,.06,ry);}
// The same frieze round a drum: flat facets tangent to the wall, one whole tile each.
function dnMuralRing(x,y,z,r,h,c){const n=Math.max(6,Math.round(TAU*r/2.1));for(let k=0;k<n;k++){const a=k/n*TAU;const p=dnOnRing(x,z,r+.05,a);vPl('dMural',p[0],y+h/2,p[1],TAU*(r+.05)/n-.04,h,a,c||null);}}
// A rammed-earth wall band painted in two colours (poor houses: no mural, just a red foot and a turquoise line).
function dnPaintRing(x,y,z,r,h,c){dnDrum('dEarthDrum',x,y,z,r+.03,h,c);}
// Banner hung from a crossbar at (x,y,z); the top is fixed, the foot free. ry = the direction it faces.
function dnBanner(x,y,z,ry,w,h,c){const q=vQ(ry,0,0);kput('dBanner',[x,y-h/2,z],q,[w,h,1],c||dCol(DPAL.red));vB('vWood',x,y-.04,z,w+.3,.08,.08,ry,vC(0x5a4632));}
// Tall pole with a crossbar and a banner beside it; ry = the direction the banner faces.
function dnBannerPole(x,y,z,ry,h,c){vPst('vPost',x,y,z,.09,h,vC(0x5a4632));const p=loc(x,z,.75,0,ry);vB('vWood',p[0],y+h-.3,p[1],1.5,.08,.08,ry,vC(0x5a4632));
 kput('dBanner',[p[0],y+h-.35-h*.2,p[1]],vQ(ry,0,0),[1.0,h*.4,1],c||dCol(DPAL.red));vBall('dGiltBall',x,y+h+.15,z,.14);}
// Tiwanaku cornice: a relief band, then stepped stone courses each further out, then a cap. Returns the top y.
function dnCornice(x,y,z,w,d,ry,c,steps){dnReliefBand(x,y,z+0,0,w,.9,c);   // front only is carved; the sides get the plain courses
 vB('vStone',x,y,z,w+.16,.9,d+.16,ry,c);let yy=y+.9;steps=steps||2;for(let k=0;k<steps;k++){const o=.22+.26*k;vB('vStone',x,yy,z,w+2*o,.36,d+2*o,ry,c);yy+=.36;}
 vB('vStone',x,yy,z,w+.2,.3,d+.2,ry,c.clone().multiplyScalar(1.06));return yy+.3;}
// Trilithon gate (the Gate of the Sun): two monolithic piers, a lintel carrying a relief frieze, a stepped crest.
function dnGate(x,y,z,ry,w,h,c){for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.5),0,ry);vB('vStone',p[0],y,p[1],1.0,h,1.3,ry,c);dnReliefBand(p[0]+0,y+.6,p[1],ry,.7,h-1.2,c);}
 vB('vStone',x,y+h,z,w+2.2,1.1,1.4,ry,c);const f=loc(x,z,0,.7,ry);dnReliefBand(f[0],y+h+.1,f[1],ry,w+1.6,.9,c);
 vB('vStone',x,y+h+1.1,z,w+1.4,.3,1.2,ry,c);vB('vStone',x,y+h+1.4,z,w*.5,.35,1.0,ry,c);vB('vStone',x,y+h+1.75,z,w*.22,.35,.9,ry,c);}
// A carved stele (Ponce monolith): a battered shaft with a relief front and a squared head.
function dnStele(x,y,z,ry,h,c){vB('vStone',x,y,z,1.0,h,.7,ry,c);const f=loc(x,z,0,.35,ry);dnReliefBand(f[0],y+.4,f[1],ry,.7,h-.9,c);vB('vStone',x,y+h,z,1.1,.3,.8,ry,c);
 const g=loc(x,z,0,.4,ry);vB('vDarkB',g[0],y+h-.55,g[1],.5,.25,.05,ry);}
// Altar: a stone table with a brazier (fire by night) in front of a temple door.
function dnAltar(x,y,z,ry,c){vB('vStone',x,y,z,2.2,1.0,1.2,ry,c);dnReliefBand(x,y+.15,z,ry,2.0,.7,c);vB('vStone',x,y+1.0,z,2.5,.2,1.5,ry,c);vPst('vPipe',x,y+1.2,z,.35,.6,vC(0x2e2a26));firePit('dalab',x,y+1.55,z,.7);}

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
 const dr=o.door!==undefined?o.door:0;const dp=dnOnRing(x,z,r,dr);vnDoor(dp[0],y,dp[1],dr,o.doorW||.95,o.doorH||1.9,o.frame||'vWood',wood,o.leafC||vC(0x6a5a48),false);
 (o.win||[]).forEach((wr,i)=>{const p=dnOnRing(x,z,r,wr);if(o.lit)dnGodWin(p[0],y+1.25,p[1],wr,.8,.7,o.frame||'vWood',wood);else vnWin(p[0],y+1.25,p[1],wr,.8,.7,o.winKind||'open',o.frame||'vWood',wood);
  if(o.hearth&&i===0)dnHearth(p[0],y+1.25,p[1],wr,.8,.7);});
 return y+h+rise;}

// ---------------------------------------------------------------- the earth mound
// A dome-shaped ceremonial mound: a turfed lathe (real mesh) whose profile is a smoothstep from the foot radius r
// to a flat plateau of radius rt at height h — flat at the foot and the top, steepest half way, walkable. A stone
// stair with kerbs climbs the front (bearing ry) from an apron to the plateau. Optional o.terrace={r,h}: a lower,
// broader terrace ring round the foot. Returns {top:h, prof(rho)}.
function dnMoundProfile(r,rt,h){return rho=>{if(rho<=rt)return h;if(rho>=r)return 0;const t=1-(rho-rt)/(r-rt);return h*t*t*(3-2*t);};}
function dnMound(x,z,r,rt,h,ry,o){o=o||{};const G=VERN.cur.G;const prof=dnMoundProfile(r,rt,h);
 const mk=(R,RT,H,pf)=>{const pts=[];const N=22;for(let k=0;k<=N;k++){const rho=R-(R-RT)*k/N;pts.push(new THREE.Vector2(rho*(1+(fbm(k*.7,R,3.3,2)-.5)*.02),pf(rho)));}
  pts.push(new THREE.Vector2(RT*.6,H),new THREE.Vector2(0,H));const g=new THREE.LatheGeometry(pts,72);g.computeVertexNormals();return g;};
 mesh(mk(r,rt,h,prof),MAT.dTurfMesh,G,x,-.05,z);
 if(o.terrace){const T=o.terrace;const pf=dnMoundProfile(T.r,r-2,T.h);mesh(mk(T.r,r-2,T.h,pf),MAT.dTurfMesh,G,x,-.06,z);}
 const stC=o.stoneC||dCol(DPAL.stone);
 // the stair: treads every ~0.85 m of radius from an apron outside the foot to the plateau lip
 {const r0=r+2.5,r1=rt-1.0;const n=Math.round((r0-r1)/.85);const base=o.terrace?0:0;
  for(let k=0;k<=n;k++){const rho=r0-(r0-r1)*k/n;const yy=(o.terrace&&rho>r?dnMoundProfile(o.terrace.r,r-2,o.terrace.h)(rho):prof(rho))+(o.terrace&&rho<=r?0:0);
   const p=dnOnRing(x,z,rho,ry);vB('vStone',p[0],Math.max(0,yy-.2),p[1],3.6,.5,1.1,ry,stC);
   if(k%2===0)for(const s of[-1,1]){const q=loc(x,z,s*2.05,rho,ry);vB('vStone',q[0],Math.max(0,yy-.1),q[1],.5,.7,1.0,ry,stC.clone().multiplyScalar(.9));}}
  for(const s of[-1,1]){const q=loc(x,z,s*2.6,r0+.8,ry);dnStele(q[0],0,q[1],ry,3.2,stC);const t=loc(x,z,s*2.6,r1-.6,ry);dnStele(t[0],h,t[1],ry,2.6,stC);}
  const ap=loc(x,z,0,r0+3.2,ry);vnPaving(ap[0],.02,ap[1],7,4,ry,stC,10);}
 return{top:h,prof};}
// A ring earthwork (the High Priest's wall): a turf bank of width w and height h at radius r, open for gapW at gapRy;
// the bank ends are faced with rammed earth. A shallow ditch band outside it.
function dnRingBank(x,z,r,h,w,gapRy,gapW,o){const G=VERN.cur.G;const ga=gapW/(2*r);
 const pts=[new THREE.Vector2(r-w/2,0),new THREE.Vector2(r-w*.3,h*.85),new THREE.Vector2(r-w*.12,h),new THREE.Vector2(r+w*.12,h),new THREE.Vector2(r+w*.3,h*.85),new THREE.Vector2(r+w/2,0)];
 const g=new THREE.LatheGeometry(pts,140,gapRy+ga,TAU-2*ga);g.computeVertexNormals();mesh(g,MAT.dTurfMesh,G,x,-.05,z);
 for(const s of[-1,1]){const a=gapRy+s*ga;const p=dnOnRing(x,z,r,a);kput('dEarthBat',[p[0],0,p[1]],qEuler(0,-a+Math.PI/2,0),[1.4,h+.2,w*.9],dCol(DPAL.earth));
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
  if(o.lintel!==false){const p=loc(x,z,0,d/2,ry);vB('vWood',p[0],y+h+.9,p[1],gate+2.8,.4,t+.6,ry,dCol(DPAL.wood));}
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
 arm(-S*.30,S*1.42,0,Math.PI-.28);arm(S*.30,S*1.42,0,-(Math.PI-.28));
 if(arms>=4){arm(-S*.30,S*1.18,-1.2,Math.PI-.5);arm(S*.30,S*1.18,-1.2,-(Math.PI-.5));}
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
  kput('dConeSh',[0,Y0+3.0-2.0,0],null,[R+2.9,4.5,R+2.9],sh.clone().multiplyScalar(.9));dnDrum('dStoneDrum',0,Y0+2.9,0,R+2.4,.25,st);}
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
  kput('vConeT',[0,2.7-1.6,0],null,[R+3.2,3.4,R+3.2],th.clone().multiplyScalar(.92));}
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

dDef({key:'dalab_tavern',name:'Tavern',family:'trade',tags:{type:['tavern/inn'],wealth:'middle',lit:false},w:26,d:26,h:14,build:buildDalabTavern});
dDef({key:'dalab_market_small',name:'Market (small)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:28,d:28,h:6,build:buildDalabMarketSmall});
dDef({key:'dalab_market_large',name:'Market (large)',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:64,d:64,h:8,build:buildDalabMarketLarge});
dDef({key:'dalab_granaries',name:'Granaries',family:'infrastructure',tags:{type:['farm','infrastructure'],wealth:'peasant',lit:false},w:17,d:14,h:8,build:buildDalabGranaries});
dDef({key:'dalab_warehouse',name:'Warehouse',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false},w:28,d:20,h:9,build:buildDalabWarehouse});
dDef({key:'dalab_smithy',name:'Scrap smithy',family:'industry',tags:{type:['industry'],wealth:'peasant',lit:false},w:20,d:14,h:7,build:buildDalabSmithy});
dDef({key:'dalab_workshop',name:'Workshop',family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:17,d:12,h:7,build:buildDalabWorkshop});
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
// Historians' embassy: the Order's Djenne manners — a battered laterite hall with pilaster buttresses and pinnacles,
// toron rows, a mosaic string course, a great drum under a tile cone with a lantern; blue banners
function buildDalabEmbassyHist(G,o){reseed(8531+(o.v|0));const CW=30,CD=26;const lat=dCol(DPAL.laterite),latD=lat.clone().multiplyScalar(.8),wood=vC(0x4a3626);
 vnReg("Historians' embassy",0,0,12,18);dnEmbassyCompound(CW,CD,"Historians' embassy");
 const W=13,D=10,H=4.6,Y0=.5,hz=-2;
 vB('vStone',0,-.05,hz,W+1,Y0+.05,D+1,0,latD);
 kput('dEarthBat',[0,Y0,hz],null,[W,H,D],lat);
 for(const s of[-1,1])for(const x of[-W/2+.8,-W/6,W/6,W/2-.8]){vB('dEarth',x,Y0,hz+s*(D/2*.93),.8,H+.9,.5,0,lat);kput('dStonePyr',[x,Y0+H+.9,hz+s*(D/2*.93)],null,[1.0,.8,1.0],latD);}   // pilasters + pinnacles
 for(const s of[-1,1])for(let k=0;k<8;k++)kput('vPost',[-W/2+1.2+k*(W-2.4)/7,Y0+2.6,hz+s*(D/2*.93+.3)],qEuler(Math.PI/2,0,0),[.08,.9,.08],wood);   // toron
 vB('dMosaic',0,Y0+H-.9,hz,W*.87+.2,.6,D*.87+.2,0,null);vB('dEarth',0,Y0+H,hz,W*.87+.4,.4,D*.87+.4,0,latD);
 // the drum, tile cone and lantern
 dnDrum('dEarthDrum',0,Y0+H+.4,hz,4.6,3.2,lat);vB('dMosaic',0,Y0+H+3.3,hz,9.6,.4,9.6,0,null);for(let k=0;k<8;k++){const a=k/8*TAU;const p=dnOnRing(0,hz,4.6,a);dnDrum('dRelief',p[0],Y0+H+1.4,p[1],.9,.9,latD);const q=dnOnRing(0,hz,4.66,a);vB('vDarkB',q[0],Y0+H+1.55,q[1],.5,.6,.1,a);}
 kput('dConeTile',[0,Y0+H+3.5,hz],null,[5.6,4.4,5.6],vC(0x8a5a3a));dnDrum('dEarthDrum',0,Y0+H+7.4,hz,1.2,1.6,lat);for(let k=0;k<6;k++){const a=k/6*TAU;const p=dnOnRing(0,hz,1.2,a);dnGodWin(p[0],Y0+H+7.7,p[1],a,.5,.9,'vWood',wood);}
 kput('dConeTile',[0,Y0+H+9.0,hz],null,[1.7,1.4,1.7],vC(0x8a5a3a));
 // the porch: nested archivolts of earth, a God-lit door
 vB('dEarth',0,Y0,hz+D/2*.93+.6,4.4,H-.6,1.2,0,lat);vB('dEarth',0,Y0,hz+D/2*.93+1.0,3.2,H-1.4,1.0,0,latD);
 vnDoor(0,Y0,hz+D/2*.93+1.5,0,1.5,2.6,'vWood',wood,vC(0x3a2a1c));vnStairs(0,0,hz+D/2*.93+2.4,0,3,Y0,3,'vStone',latD);
 for(const x of[-4.2,4.2])dnGodWin(x,Y0+1.6,hz+D/2*.93,0,1.0,1.4,'vWood',wood);for(const s of[-1,1])for(const z of[-2.6,2.6])dnGodWin(s*W/2*.93,Y0+1.6,hz+z,s*Math.PI/2,1.0,1.3,'vWood',wood);
 for(const s of[-1,1])dnBannerPole(s*(W/2+2),0,hz+D/2+2,0,6,vC(0x2a5aa8));
 vB('dEarth',5.5,0,hz+D/2+5,2.4,1.0,2.4,0,lat);vB('dMosaic',5.5,1.0,hz+D/2+5,2.6,.3,2.6,0,null);   // a mosaic dais
 vnFolk(0,hz+D/2+7,2,1.2);}

// the Halls of Reformation: a circular stone wall; inside, the genepriests' halls — stone drums under Ancient panel
// domes, a cable pylon, tanks and pipe, God's-light strips, a giant guard pair at the gate. Half the Voth Monastery.
function buildDalabHalls(G,o){reseed(8541+(o.v|0));const R=34;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),iron=vC(0x2e2a26);
 vnReg('Halls of Reformation',0,0,R+2,22,{landmark:true});vnReg('Halls wall',0,0,R+1,5,{part:'wall'});
 dnRingWall(0,0,0,R,4.4,0,6,'vStone',st,1.2);dnGate(0,0,R+.4,0,5,5.2,st);
 vnPaving(0,.02,0,R*1.6,R*1.6,0,st.clone().multiplyScalar(.92),90);
 // the central hall: a great stone drum, relief and mural bands, a panel dome with a rust seam, a light ring
 {const HR=10,HH=7;dnDrum('dStoneDrumB',0,0,0,HR,HH,st);dnDrum('dReliefDrum',0,.5,0,HR+.05,1.2,st);dnMuralRing(0,HH-2.4,0,HR-.25,1.6);
  vB('vStone',0,HH,0,HR*2+1,.6,HR*2+1,0,stD);dnDrum('dStoneDrum',0,HH+.6,0,HR-.4,.6,st);
  kput('dPanelDome',[0,HH+1.2,0],null,[HR-.6,HR*.7,HR-.6],null);
  for(let k=0;k<12;k++){const a=k/12*TAU;const p=dnOnRing(0,0,HR-.9,a);kput('vIron',[p[0],HH+1.2+HR*.35,p[1]],vQ(a,0,0),[.3,HR*.7,.3],iron);}   // ribs
  for(let k=0;k<16;k++){const a=(k+.5)/16*TAU;const p=dnOnRing(0,0,HR,a);dnGodStrip(p[0],HH-.5,p[1],a,TAU*HR/16-.6);}
  dnDrum('dRustDrum',0,HH+1.2+HR*.7-.4,0,1.4,2.2,null);vBall('dGodBall',0,HH+1.2+HR*.7+2.0,0,.5);vBall('dGlassBall',0,HH+1.2+HR*.7+2.0,0,.5);   // the lantern
  dnGate(0,0,HR+.2,0,2.4,3.8,st);vnDoor(0,0,HR,0,2.2,3.6,'vStone',st,vC(0x2a2a30),false);
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU;if(k===3||k===4)continue;const p=dnOnRing(0,0,HR,a);dnGodWin(p[0],3.2,p[1],a,1.0,1.6,'vStone',st);}
  dnGiant(-3.2,0,HR+3.5,.25,4,{spear:true});dnGiant(3.2,0,HR+3.5,-.25,4,{spear:true});vnStairs(0,0,HR+2,0,4,0,1,'vStone',st);}
 // the wing halls: two stone drums with rust domes, pipe to the centre, tanks
 for(const s of[-1,1]){const wx=s*20,wz=-6,WR=6,WH=5;dnDrum('dStoneDrumB',wx,0,wz,WR,WH,st);dnDrum('dReliefDrum',wx,.4,wz,WR+.05,.9,st);vB('vStone',wx,WH,wz,WR*2+.8,.5,WR*2+.8,0,stD);
  kput(s<0?'dRustDome':'dPanelDome',[wx,WH+.5,wz],null,[WR-.3,WR*.6,WR-.3],null);for(let k=0;k<6;k++){const a=k/6*TAU+.2;const p=dnOnRing(wx,wz,WR,a);if(k===1)continue;dnGodWin(p[0],2.2,p[1],a,.9,1.3,'vStone',st);}
  const dp=dnOnRing(wx,wz,WR,-s*Math.PI/2);vnDoor(dp[0],0,dp[1],-s*Math.PI/2,1.4,2.6,'vStone',st,vC(0x2a2a30),false);
  vBeam([wx-s*WR,WH-.5,wz],[s*10*.98,6,-1],.35,null,'vPipeR');vBeam([wx-s*WR,WH-1.5,wz+1],[s*10*.98,4.5,0],.25,null,'vPipe');
  vPst('vTankW',wx+s*3,0,wz+9,2.0,4.5,null);vPst('vTankR',wx-s*2,0,wz+9.5,1.5,3.2,null);vB('vIron',wx+s*3,4.5,wz+9,4.4,.1,4.4,0,iron);
  for(let k=0;k<3;k++)kput('vPipe',[wx+s*(1.5-k*.6),0,wz+9+k*.7],null,[.12,rr(2,4),.12],iron);}
 // the pylon: a latticed iron mast with cables to the centre dome and the wall — the priests' antenna to The God
 {const px=0,pz=-24;for(const sx of[-1,1])for(const sz of[-1,1])vBeam([px+sx*1.6,0,pz+sz*1.6],[px+sx*.3,26,pz+sz*.3],.18,iron,'vIron');
  for(let y=3;y<26;y+=3.5){const w=1.6-(1.3*y/26);vB('vIron',px,y,pz,w*2+.3,.12,.12,0,iron);vB('vIron',px,y,pz,.12,.12,w*2+.3,0,iron);}
  vB('vIron',px,26,pz,2.4,.2,2.4,0,iron);vBall('dGodBall',px,27,pz,.4);vBall('dGlassBall',px,27,pz,.4);kput('dGodHalo',[px,27,pz],vQ(0,0,0),[3,3,1],null);
  vBeam([px,25.5,pz],[0,7+1.2+10*.7+2.4,0],.05,vC(0x3a3a3a),'vRope');vBeam([px,25.5,pz],[-20,5.5,-6],.05,vC(0x3a3a3a),'vRope');vBeam([px,25.5,pz],[20,5.5,-6],.05,vC(0x3a3a3a),'vRope');
  vB('vStone',px,0,pz,4.4,1.2,4.4,0,stD);}
 // steles round the court, God-posts, priests, supplicants
 for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;const p=dnOnRing(0,0,R-4,a);dnStele(p[0],0,p[1],a+Math.PI,3.4,st);}
 for(const a of[.45,-.45,Math.PI*.5,-Math.PI*.5])dnGodPostAt(0,0,R-8,a,4.4);
 dnPriest(-4,0,14,.4);dnPriest(4,0,14,-.4);dnFolk(0,20,5,4);dnFolk(0,R+5,4,2.5);}
function dnGodPostAt(x,z,r,a,h){const p=dnOnRing(x,z,r,a);dnGodPost(p[0],0,p[1],h);}

dDef({key:'dalab_barracks',name:"Guard's barracks",family:'civic',tags:{type:['civic','military'],wealth:'civic',lit:true},w:36,d:30,h:12,build:buildDalabBarracks});
dDef({key:'dalab_embassy_iziz',name:'Izizian embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'iziz'},w:34,d:32,h:15,build:buildDalabEmbassyIziz});
dDef({key:'dalab_embassy_voth',name:'Vothic embassy',family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'voth'},w:34,d:32,h:17,build:buildDalabEmbassyVoth});
dDef({key:'dalab_embassy_hist',name:"Historians' embassy",family:'civic',tags:{type:['civic'],wealth:'civic',lit:true,role:'embassy',guest:'yuni-order'},w:34,d:32,h:18,build:buildDalabEmbassyHist});
dDef({key:'dalab_halls',name:'Halls of Reformation',family:'civic',tags:{type:['civic','religious','industry'],wealth:'civic',lit:true,role:'halls',landmark:true},w:76,d:76,h:28,build:buildDalabHalls});
// ================================================================= DALAB — the sacred: temples, priests' houses, the mounds, a shrine
// The priests commune with The God from the tops of dome-shaped earth mounds built in imitation of the Ancient
// domes. Each outlying settlement has one; the High Priest's is larger, ringed by an earthwork, and faces AWAY from
// the lab (the layout pass orients them; here the front is +z and the stair climbs it). On a mound stands a stone
// temple with a relief-carved trilithon door, a stepped cornice, a shingle pyramid, banners, an altar that burns at
// night, and two four-armed giant guards; beside it the priest's round stone house.

// the temple, at scale s, standing on the ground at (x,y,z) facing ry. Reusable by the mound builders.
function dnTemple(x,y,z,ry,s,o){o=o||{};const st=o.stoneC||dCol(DPAL.stone),sh=dCol(DPAL.shingle);const W=10*s,D=8*s,H=4.6*s;
 const L=(lx,lz)=>loc(x,z,lx,lz,ry);
 // stepped stone platform, three courses, stair down the front
 let yy=y;for(let k=0;k<3;k++){const o2=(2-k)*1.1*s;vB('vStone',x,yy,z,W+2*o2+2*s,.45*s,D+2*o2+2*s,ry,st.clone().multiplyScalar(.9));yy+=.45*s;}
 {const p=L(0,D/2+1.6*s+2.2*s);vnStairs(p[0],y,p[1],ry,3.4*s,yy-y,4,'vStone',st);}
 vB('vStone',x,yy,z,W,H,D,ry,st);
 {const f=L(0,D/2);dnReliefBand(f[0],yy+.3*s,f[1],ry,W-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry,W-2.6*s,1.5*s);}
 for(const sd of[-1,1]){const f=L(sd*W/2,0);dnReliefBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry+sd*Math.PI/2,D-2.6*s,1.5*s);}
 const c1=dnCornice(x,yy+H,z,W,D,ry,st,2);vB('vStone',x,c1,z,W-.6*s,.5*s,D-.6*s,ry,st.clone().multiplyScalar(.85));
 kput('vPyrSh',[x,c1+.5*s,z],ry?qEuler(0,ry,0):null,[W-1.4*s,3.2*s,D-1.4*s],sh);vPst('vPost',x,c1+3.4*s,z,.1*s,1.6*s,vC(0x5a4632));vBall('dGiltBall',x,c1+5.0*s,z,.32*s);
 {const g=L(0,D/2+.1);dnGate(g[0],yy,g[1],ry,2.0*s,3.2*s,st);const d=L(0,D/2);vnDoor(d[0],yy,d[1],ry,1.8*s,3.0*s,'vStone',st,vC(0x2a2a30),false);
  for(const lx of[-3.2*s,3.2*s]){const w=L(lx,D/2);if(o.lit!==false)dnGodWin(w[0],yy+1.6*s,w[1],ry,1.0*s,1.4*s,'vStone',st);else vnWin(w[0],yy+1.6*s,w[1],ry,1.0*s,1.4*s,'open','vStone',st);}
  for(const sd of[-1,1])for(const lz of[-2*s,2*s]){const w=L(sd*W/2,lz);if(o.lit!==false)dnGodWin(w[0],yy+1.6*s,w[1],ry+sd*Math.PI/2,1.0*s,1.4*s,'vStone',st);}
  for(const lx of[-2.3*s,2.3*s]){const l=L(lx,D/2);if(o.lit!==false)dnGodLamp(l[0],yy+3.9*s,l[1],ry);}}
 // banners at the platform corners, the altar, the giant guards, the priest
 for(const sd of[-1,1]){const p=L(sd*(W/2+2.6*s),D/2+2.6*s);dnBannerPole(p[0],y,p[1],ry,6.5*s,dCol(sd<0?DPAL.gold:DPAL.turq));}
 {const a=L(0,D/2+4.4*s+2.6*s);dnAltar(a[0],y,a[1],ry,st);}
 for(const sd of[-1,1]){const g=L(sd*2.4*s,D/2+3.8*s+2.6*s);dnGiant(g[0],y,g[1],ry+sd*.25,4,{spear:true});}
 {const p=L(1.2*s,D/2+6.5*s+2.6*s);dnPriest(p[0],y,p[1],ry+Math.PI);}
 return{top:c1+5.2*s,plat:yy};}
// the priest's house: a round stone house with a shingle cone, relief band, God-lit
function dnPriestHouse(x,y,z,ry,r){r=r||3.4;const st=dCol(DPAL.stone);
 dnRoundHouse(x,y,z,r,2.9,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:r*1.1,door:ry,doorW:1.1,doorH:2.1,frame:'vStone',win:[ry+Math.PI*.6,ry-Math.PI*.6],lit:true,band:'relief',wood:dCol(DPAL.wood),leafC:vC(0x2a2a30)});
 const p=dnOnRing(x,z,r,ry);dnGodLamp(p[0],y+2.5,p[1],ry);}

function buildDalabTemple(G,o){reseed(8601+(o.v|0));vnReg("Priests' temple",0,0,10,12);dnTemple(0,0,0,0,1,{});vnPaving(0,.02,12,6,4,0,dCol(DPAL.stone),8);dnFolk(0,15,3,2);}
function buildDalabPriestHouse(G,o){reseed(8611+(o.v|0));vnReg("Priest's house",0,0,5.5,8);dnPriestHouse(0,0,0,0,3.4);dnJar(4.6,0,1,.3);vnPaving(0,.02,5,2.6,2.4,0,dCol(DPAL.stone),4);dnPriest(1.5,0,6,Math.PI);}
// wayside shrine: a stele, a banner, an offering slab, a God-post
function buildDalabShrine(G,o){reseed(8621+(o.v|0));const st=dCol(DPAL.stone);vnReg('Wayside shrine',0,0,3.5,5,{type:['religious']});
 vB('vStone',0,0,0,4,.4,4,0,st.clone().multiplyScalar(.9));dnStele(0,.4,-.8,0,3.4,st);vB('vStone',0,.4,1.0,1.8,.5,.9,0,st);for(let k=0;k<4;k++)vBall('vGourd',-.6+k*.4,.9,1.0,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.18);
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
 for(const s of[-1,1]){dnStele(s*7.5,0,68+6,0,3.6,st);dnGiant(s*4,0,68+3,s*.2,4,{spear:true});}
 vnPaving(0,.02,R+12,18,10,0,st.clone().multiplyScalar(.92),20);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);
 dnFolk(0,62,4,3);}

dDef({key:'dalab_temple',name:"Priests' temple",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true},w:26,d:30,h:14,build:buildDalabTemple});
dDef({key:'dalab_priest_house',name:"Priest's house",family:'sacred',tags:Object.assign({wealth:'priest',lit:true},{type:['single-family dwelling','religious']}),w:14,d:14,h:8,build:buildDalabPriestHouse});
dDef({key:'dalab_shrine',name:'Wayside shrine',family:'sacred',tags:{type:['religious'],wealth:'priest',lit:true},w:8,d:8,h:5,build:buildDalabShrine});
dDef({key:'dalab_mound',name:'Ceremonial mound',family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true},w:76,d:90,h:28,build:buildDalabMound});
dDef({key:'dalab_high_mound',name:"High Priest's mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'high priest'},w:160,d:170,h:40,build:buildDalabHighMound});
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
// TARGET: set — the Dalab building kit laid out in rows by family, front (+z) toward the camera.
const TITLE='Dalab Building Kit';
const GROUND_C=500;          // z centre of the ground plane
const ROWDEF=[
 ['dalab_hut_a','dalab_hut_b','dalab_hut_c'],
 ['dalab_compound','dalab_granaries','dalab_shrine'],
 ['dalab_noble_a','dalab_noble_b','dalab_noble_c'],
 ['dalab_tavern','dalab_market_small'],
 ['dalab_warehouse','dalab_smithy','dalab_workshop'],
 ['dalab_market_large'],
 ['dalab_barracks','dalab_priest_house','dalab_temple'],
 ['dalab_embassy_iziz','dalab_embassy_voth','dalab_embassy_hist'],
 ['dalab_halls'],
 ['dalab_mound'],
 ['dalab_high_mound'],
];
const ROWZ=[0,40,90,150,210,290,370,440,540,690,920];
const SITES=[];
ROWDEF.forEach((row,ri)=>{const ws=row.map(k=>VERN.defs[k].w+10);const total=ws.reduce((a,b)=>a+b,0);let x=-total/2;
 row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:ROWZ[ri],ry:0,o:{v:0}});x+=ws[i];});});
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
// TARGET: set — camera presets. [cx,cy,cz,tx,ty,tz] and an optional SEVENTH element: the hour of day (see 94-dalab-light.js)
const RV=(ri,dist,h,ty,hour)=>{const v=[0,h,ROWZ[ri]+dist,0,ty,ROWZ[ri]];if(hour!=null)v.push(hour);return v;};
const SITEV=(key,dist,h,ty,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];if(hour!=null)v.push(hour);return v;};
const EYE=(key,dist,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];if(hour!=null)v.push(hour);return v;};
const VIEWS={
 'Opening':[-110,44,170,-4,8,60],
 'Overview':[-900,420,ROWZ[6]+60,0,10,ROWZ[6]],
 'Peasant huts':RV(0,40,20,3),'Earth hut — eye level':EYE('dalab_hut_a',14,5),'Scrap hut — eye level':EYE('dalab_hut_b',14,-5),'Post house — eye level':EYE('dalab_hut_c',16,5),
 'Compound, granaries, shrine':RV(1,46,24,4),'Compound — inside':EYE('dalab_compound',5.5,-1.5),'Granaries — eye level':EYE('dalab_granaries',14,4),
 'Noble houses':RV(2,70,36,6),'Stone hall — eye level':EYE('dalab_noble_a',26,7),'Great roundhouse — eye level':EYE('dalab_noble_b',30,-8),'Manor — gate':EYE('dalab_noble_c',24,3),
 'Tavern and market':RV(3,60,30,5),'Tavern — eye level':EYE('dalab_tavern',22,6),'Market — inside':EYE('dalab_market_small',4,2),
 'Warehouse, smithy, workshop':RV(4,52,26,5),'Smithy — eye level':EYE('dalab_smithy',16,6),
 'Large market':RV(5,80,44,6),'Large market — inside':EYE('dalab_market_large',8,3),
 'Barracks, priest house, temple':RV(6,66,34,6),'Barracks — gate':EYE('dalab_barracks',26,3),'Temple — eye level':EYE('dalab_temple',26,7),
 'Embassies':RV(7,74,38,8),'Izizian embassy — gate':EYE('dalab_embassy_iziz',24,4),'Vothic embassy — gate':EYE('dalab_embassy_voth',24,4),"Historians' embassy — gate":EYE('dalab_embassy_hist',24,4),
 'Halls of Reformation':RV(8,110,60,10),'Halls — gate':EYE('dalab_halls',46,4),'Halls — court':EYE('dalab_halls',16,-10),
 'Ceremonial mound':RV(9,120,60,12),'Mound — foot of the stair':EYE('dalab_mound',44,4),'Mound — top':[-14,13+1.7,ROWZ[9]+18,0,13+4,ROWZ[9]-4],
 "High Priest's mound":RV(10,200,100,18),'High mound — entrance':EYE('dalab_high_mound',82,5),'High mound — top':[-20,20+1.7,ROWZ[10]+22,0,20+5,ROWZ[10]-6],
 'Night — noble houses':RV(2,70,36,6,21.5),'Night — temple (eye level)':EYE('dalab_temple',26,7,22),'Night — Halls of Reformation':RV(8,110,60,10,22.5),'Night — peasant huts':EYE('dalab_hut_a',14,5,21),'Dusk — mound':RV(9,120,60,12,18.4),
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
if(!window.CITY){
 if(sky){scene.remove(sky);sky=null;}if(giant){scene.remove(giant);giant=null;}     // the showcase's static sky goes; KratorSky replaces it
 KratorSky.attach(scene,5000);scene.fog.density=.00045;}
const dHemi=scene.children.find(o=>o.isHemisphereLight);
let DNIGHT=null;
function dalabNight(on){on=!!on;if(DNIGHT===on)return;DNIGHT=on;
 for(const n of DNIGHT_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const n of DDAY_ITEMS)if(KIT.meshes[n])KIT.meshes[n].visible=!on;}
function dalabSkyTick(){KratorSky.update(camera.position,DSKY.hour,DSKY.day,DSKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(dHemi){dHemi.intensity=L.ambient;dHemi.color.setHex(L.dayF>.5?0xffe8d0:0x3c4c6a);}
 scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);renderer.toneMappingExposure=1.0+.12*(1-L.dayF);
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
