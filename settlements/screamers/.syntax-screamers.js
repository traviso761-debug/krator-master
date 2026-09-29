
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


// ---------------------------------------------------------------- animation
// Anything that moves pushes a function here; 92-camera.js runs them all once
// a frame, each in its own try/catch so one bad tick cannot kill the render
// loop. Kept deliberately tiny: the kit is otherwise entirely static, and the
// things that need to move (a lift car, people walking) are few.
const TICKS=[];
function tick(fn){TICKS.push(fn);}
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
const KIT={defs:{},items:{},order:[]};
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
  if(im.instanceColor)im.instanceColor.needsUpdate=true;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;parent.add(im);tot+=it.length;}
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
kdef('arch',arcShape(16,27,2.2,4),MAT.white); kdef('archR',arcShape(16,27,2.2,4),MAT.rust);
kdef('vaultRib',arcShape(92,56,2.6,3),MAT.white); kdef('vaultRibR',arcShape(92,56,2.6,3),MAT.rust);
kdef('pipe',new THREE.CylinderGeometry(1,1,1,10),MAT.pipe); kdef('pipeR',new THREE.CylinderGeometry(1,1,1,10),MAT.pipeRust);
kdef('slab',new THREE.CylinderGeometry(1,1,1,48),MAT.slab);
// The decorative bands read as a copper/bronze alloy, so their ruined form is
// the one part of the kit that goes verdigris. Everything else rusts. Keeping
// patina off the steel is the whole reason verdigris became its own material.
kdef('ringW',new THREE.TorusGeometry(1,.09,6,40),MAT.white); kdef('ringR',new THREE.TorusGeometry(1,.09,6,40),MAT.verdigris);
kdef('stain',new THREE.PlaneGeometry(1,1),MAT.stain);
kdef('moss',new THREE.IcosahedronGeometry(1,1),MAT.moss);
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
function stripRing(gx,gy,gz,r,d,n){ // ring of light-strip segments (all lit intact; few lit in ruin)
 n=n||28;const L=TAU*r/n*.92;for(let k=0;k<n;k++){const th=(k+.5)/n*TAU;const lit=d>0?(rng()<.10):true;
  kput('strip',[gx+r*Math.cos(th),gy,gz+r*Math.sin(th)],qEuler(0,-th,0),[L,1,1],lit?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}}
function mullions(gx,gy,gz,r,h,n,d){for(let k=0;k<n;k++){const th=k/n*TAU;kput(d>0?'mullR':'mullW',[gx+r*Math.cos(th),gy+h/2,gz+r*Math.sin(th)],qEuler(0,-th,0),[1,h,1],null);}}
function glassBand(parent,rFn,y0,h,d,gx,gy,gz,n){ // gallery ring: glass drum (intact) or bare mullions round a dark drum (ruin)
 const o={rFn:y=>rFn(y0+y)*(1.09+.05*Math.sin(Math.PI*y/h)),H:h,nu:48,nv:6};
 if(d===0){mesh(lathe(o),MAT.glass,parent,0,y0,0);}
 mesh(lathe({rFn:y=>rFn(y0+y)*.97,H:h,nu:32,nv:2}),MAT.dark,parent,0,y0,0);
 mullions(gx,gy+y0,gz,rFn(y0+h/2)*1.1,h,n||36,d);
 stripRing(gx,gy+y0+h*.55,gz,rFn(y0+h/2)*.95,d,n||28);
 // ledge slab under the band
 kput('slab',[gx,gy+y0-.4,gz],null,[rFn(y0)*1.16,.8,rFn(y0)*1.16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));}
function floorSlabs(gx,gy,gz,rFn,y0,y1,step,d,cut){for(let y=y0;y<y1;y+=step){if(cut!=null&&y>cut+3)break;kput('slab',[gx,gy+y,gz],null,[rFn(y)*.93,.5,rFn(y)*.93],new THREE.Color(0x2a2c30));}}
function scatterMoss(gx,gy,gz,rMin,rMax,n,sMax){for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax);const s=rr(.5,sMax);
 kput('moss',[gx+r*Math.cos(a),gy+s*.25,gz+r*Math.sin(a)],qEuler(0,rng()*TAU,0),[s*rr(.8,1.4),s*.38,s*rr(.8,1.4)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function mossOnRing(gx,gy,gz,r,n,sMax){for(let i=0;i<n;i++){const a=rng()*TAU,s=rr(.6,sMax);kput('moss',[gx+r*Math.cos(a)*rr(.85,1.02),gy+s*.2,gz+r*Math.sin(a)*rr(.85,1.02)],null,[s*1.3,s*.4,s*1.3],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.05,.12)));}}
function vinesOnRing(gx,gy,gz,r,n,lMax){for(let i=0;i<n;i++){const a=rng()*TAU,L=rr(4,lMax);kput('vine',[gx+r*Math.cos(a),gy,gz+r*Math.sin(a)],qEuler(rr(-.12,.12),0,rr(-.12,.12)),[rr(.8,1.6),L,rr(.8,1.6)],null);}}
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
function ledgePoints(geos,n,frac){const s=upFaces(geos,n*4,.5);if(!s.length)return[];
 s.sort((a,b)=>b.r-a.r);return s.slice(0,Math.max(1,Math.round(s.length*(frac||.3))));}
function mossOnSurface(geos,gx,gy,gz,n,sMax){for(const f of upFaces(geos,n,.55)){const s=rr(.5,sMax);
 kput('moss',[gx+f.p[0],gy+f.p[1]+s*.15,gz+f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.8,1.5),s*rr(.22,.42),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}}
function vinesFromLedge(geos,gx,gy,gz,n,lMax){for(const f of ledgePoints(geos,n,.3)){const L=rr(4,lMax);
 kput('vine',[gx+f.p[0],gy+f.p[1],gz+f.p[2]],qEuler(rr(-.14,.14),rng()*TAU,rr(-.14,.14)),[rr(.8,1.7),L,rr(.8,1.7)],null);}}
// Water-staining below each ledge: a multiply-blended streak, so it darkens
// whatever wall it lands on instead of painting a grey rectangle over it.
function stainsFromLedge(geos,gx,gy,gz,n,lMax){for(const f of ledgePoints(geos,n,.45)){
 const L=rr(5,lMax),a=Math.atan2(f.p[2],f.p[0]),o=1.004;
 kput('stain',[gx+f.p[0]*o,gy+f.p[1]-L*.5,gz+f.p[2]*o],qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.5),L,1],null);}}

// VEGETATION HAND-OFF. The Krator flora pass is a separate project and will
// replace VEG.tree wholesale; everything in this kit that plants anything goes
// through it, so that swap is one assignment and touches no builder.
// y is the ground height at (x,z) — ask terrainH, do not assume 0.
const VEG={
 tree(x,y,z,species,h){kput('trunk',[x,y,z],null,[h*.26,h,h*.26],null);
  const n=species%2?3:4;
  for(let k=0;k<n;k++){const s=rr(.26,.46)*h*(1-k*.11);
   kput('moss',[x+rr(-.22,.22)*h,y+h*(.58+k*.12),z+rr(-.22,.22)*h],qEuler(rng(),rng(),rng()),[s,s*.7,s],new THREE.Color().setHSL(rr(.24,.36),rr(.35,.5),rr(.05,.13)));}},
};
function trees(gx,gz,rMin,rMax,n){for(let i=0;i<n;i++){const a=rng()*TAU,r=rr(rMin,rMax),h=rr(6,14);
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

// ================================================================= factory additions (called from buildFactory)
function factoryExtras(G,d,skin){
 // three lattice cooling hyperboloids (Babel skins) west of the hall
 [[-150,40],[-150,95],[-105,95]].forEach((p,i)=>{const Hc=70,cut=d>0&&i===1?Hc*.42:null;
  const lat=(u,y)=>{const a=u*TAU*10,b=y*.28;return Math.abs(Math.sin(a+b))>.28&&Math.abs(Math.sin(a-b))>.28;};
  const hole=(u,y)=>lat(u,y)||(d>0&&fbm(u*4,y*.05,60+i,2)<.3*d);
  const rFn=y=>13+9*Math.pow(Math.abs(y/Hc-.6)/.6,1.6);
  mesh(lathe({rFn,H:Hc,cut,jag:cut?4:0,nu:80,nv:40,hole,seed:60+i}),skin,G,p[0],6,p[1]);
  mesh(lathe({rFn:y=>rFn(y)*.88,H:Hc,cut,jag:cut?4:0,nu:32,nv:6,seed:60+i}),MAT.dark,G,p[0],6,p[1]);
  kput(d>0?'ringR':'ringW',[p[0],6+(cut||Hc),p[1]],qEuler(Math.PI/2,0,0),[rFn(cut||Hc)*1.02,rFn(cut||Hc)*1.02,10],null);
  for(let k=0;k<3;k++){const th=k/3*TAU+.3;kput(d>0?'pipeR':'pipe',[p[0]+rFn(0)*.7*Math.cos(th),6,p[1]+rFn(0)*.7*Math.sin(th)],null,[1.2,10,1.2],null);}
  if(cut)rubbleRing(p[0],6,p[1],10,30,60,2.5);});
 // pipe rack from the cooling towers to the hall
 for(let i=0;i<5;i++){const z=30+i*4;kput(d>0?'pipeR':'pipe',[-118,15+i%2*3,z],qEuler(0,0,Math.PI/2),[.9,60,.9],null);}
 for(let x=-140;x<=-95;x+=15)for(let i=0;i<2;i++)kput(d>0?'colR':'colW',[x,6,26+i*20],null,[1,10,1],null);
 kput(d>0?'strutR':'strutW',[-118,16.5,38],null,[50,.6,26],null);
 // tank farm + gantry crane east of the silos
 for(let i=0;i<6;i++){const tx=135+(i%2)*32,tz=10+Math.floor(i/2)*34;const R=11;const gone=d>0&&i===3;
  for(let k=0;k<4;k++){const th=(k+.5)*Math.PI/2;kput(d>0?'colR':'colW',[tx+7*Math.cos(th),6,tz+7*Math.sin(th)],null,[1.2,9,1.2],null);}
  if(!gone)mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(d*.8,70+i,null,2)}),skin,G,tx,15-R*.15,tz);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:32,nv:14,hole:holeFn(1,70+i,null,1.5)}),MAT.rust,G,tx+9,6,tz+6);fm.rotation.set(0.6,0,1.2);dropFragment(fm);}
  kput(d>0?'pipeR':'pipe',[tx,15,tz-R-2],qEuler(Math.PI/2,0,0),[.8,8,.8],null);}
 kput(d>0?'pipeR':'pipe',[150,10,-10],qEuler(0,0,Math.PI/2),[1,90,1],null);kput(d>0?'pipeR':'pipe',[105,10,0],qEuler(Math.PI/2,0,0),[1,60,1],null);
 [[112,-8],[112,96],[184,-8],[184,96]].forEach(p=>{beam(d>0?'strutR':'strutW',[p[0]-6,6,p[1]],[p[0],52,p[1]],3,3);beam(d>0?'strutR':'strutW',[p[0]+6,6,p[1]],[p[0],52,p[1]],3,3);});
 [-8,96].forEach(z=>kput(d>0?'strutR':'strutW',[148,53,z],null,[84,3.5,4],null));
 const cz=d>0?70:30;kput(d>0?'strutR':'strutW',[148,55.5,cz],null,[6,3,110],null);kput(d>0?'strutR':'strutW',[d>0?128:160,53,cz],null,[8,5,8],null);
 factorySilo(G,d,skin);
 // twin hypar furnace shells on the south apron
 luceShells(G,-40,96,60,42,24,d,90,skin);
 if(d>0)rubbleRing(-40,6,96,20,40,40,2.5);}

// ================================================================= OFFICES (two variants)
function buildOffices(scene,gx,gz,d){reseed(d>0?9501:9500);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // A — flared ring (Tange mushroom)
 {REGISTER({name:'Office A — flared ring ('+STATE(d)+')',x:0,z:0,r:55,h:42});const stem=y=>y<12?11+.04*Math.pow(12-y,2):(y<21?11+32*Math.pow((y-12)/9,1.6):43);
  mesh(lathe({rFn:stem,H:32,nu:72,nv:32,hole:holeFn(d*.7,201,null,1.4)}),skin,G);
  if(d>0)mesh(lathe({rFn:y=>stem(y)*.92,H:32,nu:32,nv:6}),MAT.dark,G);
  for(let k=0;k<32;k++){const th=k/32*TAU;if(d>0&&rng()<.35)continue;beam(d>0?'strutR':'strutW',[Math.cos(th)*20,20,Math.sin(th)*20],[Math.cos(th)*45,40,Math.sin(th)*45],2.6,2);
   for(let r=0;r<2;r++){const rr0=43.7;const t2=th+.1;kput(d>0?'winSmD':'winSmI',[Math.cos(t2)*rr0,25+r*5,Math.sin(t2)*rr0],qFacing([Math.cos(t2),0,Math.sin(t2)]),[5.5,2,1],null);}}
  kput('slab',[0,38.5,0],null,[44,1.2,44],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(0,30,0,41,d,48);stripRing(0,35,0,41,d,48);
  for(let k=0;k<20;k++){const th=k/20*TAU;if(d>0&&rng()<.2)continue;kput(d>0?'colR':'colW',[Math.cos(th)*36,0,Math.sin(th)*36],null,[1.4,19,1.4],null);}
  mesh(lathe({rFn:()=>52,H:1.2,nu:64,nv:1}),skin,G);kput('slab',[0,1.2,0],null,[52,.4,52],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  kput('archOpen',[11.5,4.8,0],qFacing([1,0,0]),[.6,.6,1],null);
  if(d>0){mossOnRing(0,1.6,0,48,50,2);vinesOnRing(0,38,0,44,30,18);rubbleRing(0,1.2,0,14,50,30,2);}}
 // B — lobed tower (Marina / Hilliard scallops)
 {const bx=190;REGISTER({name:'Office B — lobed tower ('+STATE(d)+')',x:bx,z:0,r:20,h:60});const B=new THREE.Group();B.position.set(bx,0,0);G.add(B);const R=13,H=52,cut=d>0?H*.72:null;
  const lobe=th=>R*(1+.32*(.5+.5*Math.cos(8*th)));
  mesh(lathe({rFn:()=>6,H:12,nu:24,nv:2}),skin,B);for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===4||k===11))continue;kput(d>0?'colR':'colW',[bx+Math.cos(th)*13.5,0,Math.sin(th)*13.5],null,[1.3,12,1.3],null);}
  const hole=holeFn(d,210,cut,1.8);
  mesh(lathe({rFn:()=>R,H:H-12,cut:cut?cut-12:null,jag:cut?3:0,flutes:8,amp:.32,sharp:1,nu:96,nv:40,hole,seed:210}),skin,B,0,12,0);
  if(d>0){mesh(lathe({rFn:()=>R*.88,H:H-12,cut:cut-12,jag:3,nu:32,nv:6,seed:210}),MAT.guts,B,0,12,0);floorSlabs(bx,12,0,()=>R*.95,4,(cut||H)-12,4,d,cut?cut-12:null);}
  const bBands=[];   // ten storeys of lobed banding in one mesh
  for(let s=0;s<Math.floor(((cut||H)-12)/4);s++){const y=12+s*4;
   const bh=d>0?(u,v)=>fbm(u*10+s,2,211+s,2)<.24*d:null;
   bBands.push(lathe({rFn:()=>R*1.09,H:1,flutes:8,amp:.34,sharp:1,nu:96,nv:1,hole:bh}).translate(0,y+3,0));
   bBands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th)*.97,lobe(th)*1.09,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},96,2,{hole:bh}));
   for(let k=0;k<8;k++)for(let j=-1;j<=1;j+=2){const th=k/8*TAU+j*.16;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y-12))continue;const r=lobe(th)+.1;
    kput(d>0?'winSmD':'winSmI',[bx+r*Math.cos(th),y+1.9,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.9,1.5,1],null);}
   if(s%3===0)stripRing(bx,y+2.5,0,R*.85,d,24);}
  meshMerged(bBands,skin,B);
  if(!cut){kput('slab',[bx,H+.2,0],null,[R*1.1,.6,R*1.1],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>7*Math.sqrt(clamp(1-Math.pow(y/6,2),0,1)),H:6,nu:24,nv:6}),skin,B,0,H+.5,0);}
  else{rubbleRing(bx,0,0,15,40,60,2.5);mossOnRing(bx,cut,0,R,10,1.5);}
  if(d>0){vinesOnRing(bx,12,0,R*1.05,20,10);scatterMoss(bx,0,0,15,45,40,2);}}
 officeC(G,d);figures(60,50,5,5);figures(190,22,3,3);KOFF=[0,0,0];return G;}

// ================================================================= STARPORT — "the Starfish"
function buildStarport(scene,gx,gz,d){reseed(d>0?9601:9600);KOFF=[gx,0,gz];REGISTER({name:'Starport — the Starfish ('+STATE(d)+')',x:0,z:0,r:360,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const RD=70,HD=40,NA=5,L=210;
 mesh(lathe({rFn:()=>RD*1.15,H:3,nu:96,nv:1}),skin,G);
 mesh(lathe({rFn:y=>RD*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:96,nv:24,hole:(u,y)=>{const sky=y>HD*.86;return sky||(holeFn(d,300,null,1.2)||(()=>false))(u,y);}}),skin,G,0,3,0);
 if(d===0)mesh(lathe({rFn:y=>RD*.98*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD,nu:48,nv:10,hole:(u,y)=>y<HD*.84}),MAT.glass,G,0,3,0);
 else mesh(lathe({rFn:y=>RD*.9*Math.pow(clamp(1-Math.pow(y/HD,2),0,1),.5),H:HD*.9,nu:48,nv:8}),MAT.dark,G,0,3,0);
 stripRing(0,10,0,RD*.85,d,48);stripRing(0,24,0,RD*.62,d,40);
 for(let i=0;i<NA;i++){const th=i/NA*TAU+.3;const cx=Math.cos(th),cz=Math.sin(th);const sx=-cz,sz=cx;
  const broken=d>0&&i===2;const hole=holeFn(d,310+i,null,1.4);
  const arm=(u,v)=>{const s=v*L;const t=s/L;const w=38*(1-.55*t);const h=(HD*.75)*(1-.6*t)+6;const q=(u-.5)*2;const x=RD*.6+s;const y=h*Math.pow(clamp(1-q*q,0,1),.55);
   return[x*cx+q*w*sx,y,x*cz+q*w*sz];};
  mesh(gridSurface(arm,40,60,{uS:8,vS:30,hole:(u,v)=>{const spine=Math.abs(u-.5)<.045&&v<.9;const gap=broken&&v>.5&&v<.64;return spine||gap||(hole&&hole(u*3+i,v*L));}}),skin,G);
  if(d===0)mesh(gridSurface((u,v)=>arm(.455+u*.09,v*.9),6,40,{}),MAT.glass,G);
  else mesh(gridSurface((u,v)=>{const p=arm(u,v);return[p[0]*.985,3+(p[1]-3)*.9,p[2]*.985];},20,30,{uS:8,vS:30,hole:(u,v)=>broken&&v>.5&&v<.64}),MAT.guts,G);
  for(let s=20;s<L-10;s+=20){const p=arm(.5,s/L);const lit=d>0?rng()<.1:true;kput('strip',[p[0],p[1]-2,p[2]],qEuler(0,-th,0),[14,1,1],lit?CYAN:DEAD);}
  if(broken){const p=arm(.5,.57);rubbleRing(p[0],0,p[2],5,40,90,3);}
  // landing pad at the arm's end
  const px=(RD*.6+L+52)*cx,pz=(RD*.6+L+52)*cz;kput('slab',[px,1.5,pz],null,[42,3,42],new THREE.Color(d>0?0x4a4038:0x8a8078));
  for(let k=0;k<24;k++){const a=k/24*TAU;const lit=d>0?rng()<.15:true;kput('strip',[px+40*Math.cos(a),3.2,pz+40*Math.sin(a)],qEuler(0,-a,0),[6,1,1],lit?new THREE.Color(0xffb060):DEAD);}
  kput('slab',[px,1.2,pz],qEuler(0,-th,0),[6,2.4,24],new THREE.Color(d>0?0x4a4038:0x8a8078));
  if(d>0){scatterMoss(px,3,pz,0,38,25,2);}}
 // control needle on the dome
 const NH=70,ncut=d>0?NH*.5:null;mesh(lathe({rFn:y=>4.5*(1-.5*y/NH)+ (y>NH-14?9*Math.pow((y-(NH-14))/14,1.4)*(1-.3*Math.pow((y-(NH-14))/14,4)):0),H:NH,cut:ncut,jag:ncut?2:0,flutes:6,amp:.2,nu:40,nv:30,hole:holeFn(d*.6,330,ncut,1)}),skin,G,0,HD-2,0);
 if(!ncut){kput('slab',[0,HD-2+NH,0],null,[13,.8,13],new THREE.Color(0xd8d4cc));stripRing(0,HD-2+NH-4,0,11,d,24);}
 for(let yy=14;yy<NH-16;yy+=14){if(ncut&&yy>ncut-3)break;kput(d>0?'ringR':'ringW',[0,HD-2+yy,0],qEuler(Math.PI/2,0,0),[5.2,5.2,5],null);}
 apron(G,0,0,RD*1.16,RD*1.7,d,1.6);
 if(d>0){scatterMoss(0,0,0,80,330,260,3);rubbleRing(0,3,0,60,120,80,2.5);trees(0,0,120,330,26);}
 figures(0,120,8,10);KOFF=[0,0,0];return G;}

// ================================================================= MILITARY BUNKER — "the Redoubt"
function buildBunker(scene,gx,gz,d){reseed(d>0?9701:9700);KOFF=[gx,0,gz];REGISTER({name:'Bunker — the Redoubt ('+STATE(d)+')',x:0,z:0,r:90,h:60});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // earth berm (hex), cyclopean hex mass, casemates
 const berm=lathe({rFn:y=>78-2.2*y,H:10,nu:6,nv:2});mesh(berm,MAT.mud,G);kput('slab',[0,10,0],null,[56,.4,56],new THREE.Color(0x7a4a34));
 const R0=54,R1=46,HM=16;const hole=holeFn(d*.9,400,null,1.2);
 mesh(lathe({rFn:y=>R0-(R0-R1)*y/HM,H:HM,nu:6,nv:8,hole:(u,y)=>hole&&hole(u,y)&&(u>.62&&u<.85)}),skin,G,0,10,0);
 if(d>0)mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.9,H:HM,nu:6,nv:2}),MAT.guts,G,0,10,0);
 kput('slab',[0,26,0],null,[R1*.98,.8,R1*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let f=0;f<6;f++){const fa=f/6*TAU+Math.PI/6;const n=[Math.cos(fa),0,Math.sin(fa)];const tang=[-n[2],0,n[0]];
  for(let k=-1;k<=1;k++){const y=20;const rr0=hexR(R0-(R0-R1)*(y-10)/HM,fa)+.3;const px=n[0]*rr0+tang[0]*k*13,pz=n[2]*rr0+tang[2]*k*13;
   kput('finW',[px,y,pz],qFacing(n),[6,1.8,1.6],null);}
  // cliff-face sawtooth ribs (Soleri)
  for(let k=-2;k<=2;k++){const rr0=hexR(R0,fa)+1.2;const px=n[0]*rr0+tang[0]*k*9.5,pz=n[2]*rr0+tang[2]*k*9.5;
   if(d>0&&rng()<.25)continue;beam(d>0?'strutR':'strutW',[px,10,pz],[px-n[0]*7,10+HM,pz-n[2]*7],3,2.5);}}
 // gate + ramp on face 0 (facing +z)
 const ga=Math.PI/2;kput('archOpen',[Math.cos(ga)*(hexR(R0,ga)-1),15,Math.sin(ga)*(hexR(R0,ga)-1)],qFacing([Math.cos(ga),0,Math.sin(ga)]),[1.6,1.6,4],null);
 kput(d>0?'strutR':'strutW',[0,5,hexR(R0,ga)+22],qEuler(-.2,0,0),[14,1.5,44],null);
 // observation cupola + gun-bay portico of leaning struts + petal sensor clusters
 const CH=22,ccut=d>0?CH*.6:null;
 mesh(lathe({rFn:y=>5*Math.sqrt(1+1.6*Math.pow((y-CH*.55)/(CH*.55),2))+(y>CH-6?7*Math.pow((y-(CH-6))/6,1.5):0),H:CH,cut:ccut,jag:ccut?2:0,nu:36,nv:20,hole:holeFn(d*.7,410,ccut,1.5)}),skin,G,0,26,0);
 if(!ccut){kput('slab',[0,26+CH,0],null,[13,1,13],new THREE.Color(0xd8d4cc));stripRing(0,26+CH-2.5,0,11,d,24);for(let k=0;k<8;k++){const th=k/8*TAU;kput('finW',[Math.cos(th)*12.3,26+CH-3,Math.sin(th)*12.3],qEuler(0,-th,0),[5,1.4,1],null);}}
 for(let k=0;k<5;k++){const th=(k/5)*TAU+.9;const fallen=d>0&&(k===1||k===3);
  const a=[Math.cos(th)*38,26.4,Math.sin(th)*38],b=[Math.cos(th)*9,26+CH*(ccut?.5:.85),Math.sin(th)*9];
  if(!fallen)beam(d>0?'strutR':'strutW',a,b,3.2,2.4);else beam('strutR',[a[0],27.6,a[2]],[a[0]*.3+rr(-6,6),28,a[2]*.3+rr(-6,6)],3.2,2.4);}
 if(!ccut){kput('slab',[0,26+CH+.6,0],null,[22,1.2,22],new THREE.Color(0xd8d4cc));aaBattery(G,d,0,26+CH+1.2,0,2.6);}else{aaBattery(G,d,0,26+ccut-2,0,2.6);}
 aaBattery(G,d,26,26.4,-24,3.2);aaBattery(G,d,-30,26.4,-10,3.2);
 if(d>0){mossOnRing(0,10.4,0,50,60,2.5);mossOnRing(0,26.3,0,30,30,2);vinesOnRing(0,26,0,R1*1.02,30,12);rubbleRing(0,10,0,50,72,60,2.5);trees(0,0,90,150,14);}
 figures(0,110,6,8);KOFF=[0,0,0];return G;}

// ================================================================= LIBRARY — "the Crown"
function buildLibrary(scene,gx,gz,d){reseed(d>0?9801:9800);KOFF=[gx,0,gz];REGISTER({name:'Library — the Crown ('+STATE(d)+')',x:0,z:0,r:60,h:65});REGISTER({name:'Library — reading hall',x:74,z:0,r:22,h:16});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 mesh(lathe({rFn:()=>42,H:2,nu:80,nv:1}),skin,G);kput('slab',[0,2,0],null,[42,.5,42],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 const pts=[[34,0],[27,12],[19,25],[15.5,34],[17.5,42],[23,50],[27,54]];
 kdef('ribLib'+(d>0?'R':'W'),ribCurveGeo(pts,1.5),d>0?MAT.rust:MAT.white);
 const NR=16;for(let k=0;k<NR;k++){const th=k/NR*TAU;const fallen=d>0&&(k===2||k===3||k===9||k===13);
  if(!fallen)kput('ribLib'+(d>0?'R':'W'),[0,2,0],qEuler(0,-th,0),1,null);
  else{kput('ribLib'+(d>0?'R':'W'),[Math.cos(th)*60,1.4,Math.sin(th)*60],qEuler(Math.PI/2,0,-th),[.9,.9,.9],null);rubbleRing(Math.cos(th)*45,2,Math.sin(th)*45,3,16,30,1.8);}}
 const rib=y=>{for(let i=1;i<pts.length;i++)if(y<=pts[i][1]){const t=(y-pts[i-1][1])/(pts[i][1]-pts[i-1][1]);return lerp(pts[i-1][0],pts[i][0],t);}return pts[pts.length-1][0];};
 if(d===0)mesh(lathe({rFn:y=>rib(y)-1.6,H:44,nu:64,nv:30}),MAT.glass,G,0,2,0);
 else mesh(lathe({rFn:y=>rib(y)-1.8,H:44,nu:48,nv:20,hole:(u,y)=>fbm(u*4,y*.06,500,2)<.55}),MAT.dark,G,0,2,0);
 kput(d>0?'ringR':'ringW',[0,36,0],qEuler(Math.PI/2,0,0),[16,16,10],null);
 kput('slab',[0,2.3,0],null,[30,.6,30],new THREE.Color(0x2a2c30));stripRing(0,6,0,28,d,40);stripRing(0,20,0,18,d,32);
 if(d===0)kput('finial',[0,60,0],null,[3,6,3],null);
 // reading-hall wing: low six-lobed block with arched windows, joined by a covered walk
 const wx=74;mesh(lathe({rFn:()=>15,H:9,flutes:6,amp:.35,sharp:1,nu:72,nv:6,hole:holeFn(d,510,null,2)}),skin,G,wx,0,0);
 if(d>0)mesh(lathe({rFn:()=>13,H:9,nu:24,nv:1}),MAT.dark,G,wx,0,0);
 kput('slab',[wx,9.2,0],null,[15.5,.5,15.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>16*Math.sqrt(clamp(1-Math.pow(y/5,2),0,1)),H:5,flutes:6,amp:.3,sharp:1,nu:72,nv:6,hole:holeFn(d*.8,511,null,2)}),skin,G,wx,9.4,0);
 for(let k=0;k<12;k++){const th=(k+.5)/12*TAU;const r=15*(1+.35*(.5+.5*Math.cos(6*th)))+.1;kput(d>0?'winBigD':'winBigI',[wx+r*Math.cos(th),4.5,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.8,.9,1],null);}
 for(let x=44;x<58;x+=6)for(let s=-1;s<=1;s+=2)kput(d>0?'colR':'colW',[x,2,s*4],null,[.7,5,.7],null);
 mesh(gridSurface((u,v)=>[42+u*18,7.2+.4*Math.sin(u*9),(v-.5)*10],16,4,{hole:d>0?(u,v)=>fbm(u*5,v*2,520,2)<.35:null}),skin,G);
 kput('archOpen',[34.5,4,0],qFacing([1,0,0]),[.5,.5,1],null);
 if(d>0){mossOnRing(0,2.4,0,36,40,2);scatterMoss(0,0,0,44,110,90,2);trees(0,0,60,120,12);vinesOnRing(0,36,0,16,12,20);}
 figures(0,60,6,8);KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- v3: inspector registry + group transforms
const REG=[];function REGISTER(o){REG.push({name:o.name,x:o.x+KOFF[0],y:o.y||0,z:o.z+KOFF[2],r:o.r,h:o.h});}
function useGroupXF(P){P.updateMatrix();KXF={m:P.matrix.clone(),q:P.quaternion.clone()};}
function endGroupXF(){KXF=null;}
kdef('tube',new THREE.CylinderGeometry(1,1,1,8),MAT.dark);
kdef('boxD',new THREE.BoxGeometry(1,1,1),MAT.dark);
kdef('boxW',new THREE.BoxGeometry(1,1,1),MAT.white);kdef('boxR',new THREE.BoxGeometry(1,1,1),MAT.rust);
const STATE=d=>d===3?'repaired':d>0?'ruined':'intact';

// ================================================================= SKYSCRAPERS — three variants, d: 0 intact, 1 ruined, 2 toppled
// each variant = plinth(G,d) + body(P,d,y0,y1) in local coords (local y=0 ⇔ absolute y0)
// `dir` is which way the upper body goes down: +1 (default) east, -1 west. It
// matters when a tower shares its plinth with something else — Skyscraper G's
// drum used to fall straight into its own block stack.
function toppledUpper(G,cx,cz,hc,r0,bodyFn,d,dir){const s=dir===-1?-1:1;const U=new THREE.Group();const ang=rr(-.5,.5);
 U.position.set(cx+s*Math.cos(ang)*(r0*1.6),r0*.82,cz+s*Math.sin(ang)*(r0*1.6));U.rotation.set(0,-ang,-s*Math.PI/2*.94);G.add(U);useGroupXF(U);bodyFn(U,1,hc,null,true);endGroupXF();
 rubbleRing(cx+s*Math.cos(ang)*(r0*2),0,cz+s*Math.sin(ang)*(r0*2),r0*.5,r0*3,140,3.5);}
function skyPlinth(G,d,R){mesh(lathe({rFn:()=>R,H:5,nu:96,nv:1}),SHELL(d),G);kput('slab',[0,5,0],null,[R,.6,R],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<48;k++){const th=k/48*TAU,r=R*.93;if(d>0&&rng()<.2)continue;kput(d>0?'colR':'colW',[r*Math.cos(th),5,r*Math.sin(th)],null,[1.8,12,1.8],null);}
 kput(d>0?'ringR':'ringW',[0,17.3,0],qEuler(Math.PI/2,0,0),[R*.94,R*.94,8],null);
 apron(G,0,0,R*1.02,R*1.5,d,1.4);   // graded skirt: the plinth met the ground on a hard line
 if(d>0){mossOnRing(0,5.3,0,R*.85,120,3);vinesOnRing(0,17.3,0,R*.94,40,14);scatterMoss(0,0,0,R+2,R+100,220,3.5);rubbleRing(0,0,0,R+2,R+80,120,3);trees(0,0,R+30,R+160,30);}}
// --- A: the Conocylinder (Soleri Babel IID) ---------------------------------------------------
function buildSkyA(scene,gx,gz,d){reseed(9100+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=420,Y0=64;const rFn=y=>{const t=clamp((y-Y0)/(H-Y0),0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);};
 REGISTER({name:'Skyscraper A — the Conocylinder ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:130,h:H+60});
 skyPlinth(G,dd,120);
 mesh(lathe({rFn:y=>22-4*y/Y0,H:Y0,nu:48,nv:6,hole:holeFn(dd*.5,3,null,1.5)}),skin,G,0,5,0);
 const NS=24;for(let k=0;k<NS;k++){const th=(k+.5)/NS*TAU;const gone=dd>0&&(k===5||k===13||k===19);
  const a=[Math.cos(th)*98,5,Math.sin(th)*98],b=[Math.cos(th)*rFn(Y0)*.96,Y0+6,Math.sin(th)*rFn(Y0)*.96];
  if(!gone)beam(dd>0?'strutR':'strutW',a,b,5.5,4);else{beam('strutR',[a[0],2.6,a[2]],[(a[0]+b[0])/2+rr(-8,8),3.2,(a[2]+b[2])/2+rr(-8,8)],5.5,4);}
  kput(dd>0?'strutR':'strutW',[b[0],b[1]-3,b[2]],qEuler(0,-th,0),[7,9,6],null);}
 kput('slab',[0,Y0+1,0],null,[rFn(Y0)*.97,3,rFn(Y0)*.97],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,Y0+3,0],qEuler(Math.PI/2,0,0),[rFn(Y0),rFn(Y0),10],null);
 const body=(P,dx,y0,y1,upper)=>{const top=y1!=null?y1:H;const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.86:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,7+(upper?1:0),cut!=null?L:null,1.1);
  const oo={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut!=null?10:0,flutes:32,amp:.07,sharp:2.5,nu:160,nv:110,hole,seed:7};
  mesh(lathe(oo),SHELL(dx),P,0,0,0);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.9,H:H-y0,cut:oo.cut,jag:oo.jag,nu:64,nv:40,seed:7}),MAT.guts,P);for(let y=8;y<L-2;y+=8)kput('slab',[0,y,0],null,[rFn(y+y0)*.93,.5,rFn(y+y0)*.93],new THREE.Color(0x2a2c30));
   for(let k=0;k<60;k++){const th=rng()*TAU,yy=rr(10,L-10),r=rFn(yy+y0)*.86;kput('pipeR',[r*Math.cos(th),yy,r*Math.sin(th)],null,[.5,rr(8,30),.5],null);}}
  for(let y=6;y<L-14;y+=4.2){for(let k=0;k<32;k++){const u=(k+.5)/32;if(hole&&hole(u,y))continue;if(rng()<.1)continue;const th=u*TAU,r=rFn(y+y0)+.1;
   const lit=dx>0?rng()<.03:rng()<.85;kput('cell',[r*Math.cos(th),y,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2.8,2.3,1],lit?WARM.clone().multiplyScalar(rr(.5,1)):(dx>0?DEAD:new THREE.Color(0x14283c)));}}
  for(let yy=25;yy<L-20;yy+=25)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,32);
  [.3,.62].forEach(f=>{const ya=Y0+(H-Y0)*f;const yl=ya-y0;if(yl<8||yl>L-10)return;glassBand(P,y=>rFn(y+y0),yl,7,dx,0,0,0,48);});
  if(cut==null){const NR=32;for(let k=0;k<NR;k++){const th=k/NR*TAU;const r0=rFn(H)*1.02;beam(dx>0?'strutR':'strutW',[Math.cos(th)*r0,L-6,Math.sin(th)*r0],[Math.cos(th)*(r0+25),L-6+41,Math.sin(th)*(r0+25)],3.2,2.4);}
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*(1+.35*y/40)*(1-.15*Math.pow(y/40,3)),H:40,nu:64,nv:12}),MAT.glass,P,0,L-4,0);mesh(lathe({rFn:y=>12*Math.sqrt(clamp(1-Math.pow(y/16,2),0,1)),H:16,nu:32,nv:8}),SHELL(dx),P,0,L+34,0);kput('finial',[0,L+56,0],null,[5,9,5],null);}}
  else if(!upper){for(let k=0;k<32;k++){const th=k/32*TAU;if(rng()<.5)continue;beam('strutR',[Math.cos(th)*rFn(cut)*1.02,L-6,Math.sin(th)*rFn(cut)*1.02],[Math.cos(th)*rFn(cut)*1.3,L-6+rr(8,26),Math.sin(th)*rFn(cut)*1.3],3.2,2.4);}}};
 const P=new THREE.Group();P.position.set(0,Y0,0);G.add(P);useGroupXF(P);
 if(d<2)body(P,dd,Y0,null,false);else body(P,1,Y0,Y0+70,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,Y0+70,rFn(Y0+70),(U,dx,y0)=>body(U,1,Y0+70,null,true),d);
 if(dd>0)vinesOnRing(0,Y0,0,rFn(Y0)*.98,60,40);
 figures(-110,140,7,6);KOFF=[0,0,0];return G;}
// --- B: the Scallop Stack (Goldberg lobes, widening upward) -------------------------------------
function buildSkyB(scene,gx,gz,d){reseed(9110+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=300,NL=12;const rFn=y=>26+10*Math.pow(clamp(y/H,0,1),1.4);const lobe=(th,y)=>rFn(y)*(1+.3*(.5+.5*Math.cos(NL*th)));
 REGISTER({name:'Skyscraper B — the Scallop Stack ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:120,h:H+40});
 skyPlinth(G,dd,110);
 // core + 12 lobed legs spreading out to the plinth
 mesh(lathe({rFn:y=>16,H:30,nu:32,nv:2}),skin,G,0,5,0);
 for(let k=0;k<NL;k++){const th=k/NL*TAU;const gone=dd>0&&(k===3||k===8);const a=[Math.cos(th)*70,5,Math.sin(th)*70],b=[Math.cos(th)*rFn(30)*1.15,32,Math.sin(th)*rFn(30)*1.15];
  if(!gone){kput(dd>0?'colR':'colW',[a[0],5,a[2]],null,[4.5,27,4.5],null);beam(dd>0?'strutR':'strutW',[a[0],31,a[2]],b,5,4);}else rubbleRing(a[0],5,a[2],2,16,30,2.2);}
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.8:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,17+(upper?1:0),cut!=null?L:null,1.5);
  mesh(lathe({rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,flutes:NL,amp:.3,sharp:1,nu:144,nv:60,hole,seed:17}),SHELL(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.85,H:H-y0,cut:cut!=null?L:null,jag:cut?4:0,nu:48,nv:12,seed:17}),MAT.guts,P);for(let y=5;y<L-2;y+=5)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  const bands=[];   // one mesh for the whole stack, not two per storey
  for(let s=0;s*5<L-4;s++){const y=s*5;const bh=dx>0?(u,v)=>fbm(u*10+s,2,18+s,2)<.25*dx:null;
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th,y+y0)*.97,lobe(th,y+y0)*1.1,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},144,2,{hole:bh}));
   bands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lobe(th,y+y0)*1.1;return[r*Math.cos(th),y+3.2+v*1.1,r*Math.sin(th)];},144,1,{uS:30,hole:bh}));
   for(let k=0;k<NL;k++)for(let j=-1;j<=1;j+=2){const th=k/NL*TAU+j*.13;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y))continue;const r=lobe(th,y+y0)+.1;
    kput(dx>0?'winSmD':'winSmI',[r*Math.cos(th),y+2,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2.6,2.2,1],null);}
   if(s%4===0)stripRing(0,y+2.6,0,rFn(y+y0)*.85,dx,36);}
  meshMerged(bands,SHELL(dx),P);
  if(cut==null){const Q=new THREE.Group();Q.position.set(0,L,0);P.add(Q);kput('slab',[0,L,0],null,[rFn(H)*1.1,1,rFn(H)*1.1],new THREE.Color(dx>0?0x5a4a40:0xd8d4cc));
   const CX=KXF;useGroupXF(Q);KXF={m:CX.m.clone().multiply(Q.matrix),q:CX.q.clone().multiply(Q.quaternion)};petalRing(Q,NL,rFn(H)*.75,42,16,6,1,0,dx,19,SHELL(dx),dx>0?(i=>i%4===1):null);KXF=CX;
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.72*Math.pow(clamp(1-Math.pow(y/30,2),0,1),.6),H:30,nu:48,nv:14}),MAT.glass,P,0,L+1,0);kput('finial',[0,L+38,0],null,[4,7,4],null);}}};
 const P=new THREE.Group();P.position.set(0,32,0);G.add(P);useGroupXF(P);if(d<2)body(P,dd,32,null,false);else body(P,1,32,32+55,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,87,rFn(87)*1.3,(U,dx,y0)=>body(U,1,87,null,true),d);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}
// --- C: the Tripod (three hyperboloid legs fusing into one fluted shaft) ---------------------------
function buildSkyC(scene,gx,gz,d){reseed(9120+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;const skin=SHELL(dd);
 const H=380,YM=150;REGISTER({name:'Skyscraper C — the Tripod ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:130,h:H+30});
 skyPlinth(G,dd,115);
 const legR=y=>15*Math.sqrt(1+1.2*Math.pow((y-YM*.5)/(YM*.5),2));
 for(let k=0;k<3;k++){const th=k/3*TAU+Math.PI/6;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*62,5,Math.sin(th)*62);const tilt=Math.atan2(62-20,YM);Lg.rotation.set(0,-th,0);Lg.rotateZ(tilt);G.add(Lg);useGroupXF(Lg);
  const LL=YM/Math.cos(tilt);mesh(lathe({rFn:legR,H:LL,flutes:10,amp:.1,sharp:2,nu:60,nv:30,hole:holeFn(dd*.8,27+k,null,1.5)}),skin,Lg);
  if(dd>0)mesh(lathe({rFn:y=>legR(y)*.85,H:LL,nu:24,nv:4}),MAT.guts,Lg);
  for(let y=8;y<LL-8;y+=6)for(let j=0;j<10;j++){const u=(j+.5)/10;const a=u*TAU,r=legR(y)+.1;kput(dd>0?'winSmD':'winSmI',[r*Math.cos(a),y,r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[1.6,2.4,1],null);}
  for(let yy=20;yy<LL-10;yy+=30)stripRing(0,yy,0,legR(yy)*.9,dd,20);endGroupXF();}
 // sky bridges between legs
 for(const yb of [60,110]){for(let k=0;k<3;k++){const t1=k/3*TAU+Math.PI/6,t2=(k+1)/3*TAU+Math.PI/6;const r=62-42*yb/YM;const gone=dd>0&&yb===60&&k===1;
  const a=[Math.cos(t1)*r,yb+5,Math.sin(t1)*r],b=[Math.cos(t2)*r,yb+5,Math.sin(t2)*r];if(!gone){beam(dd>0?'strutR':'strutW',a,b,3,4);beam('tube',[a[0],a[1]+2.5,a[2]],[b[0],b[1]+2.5,b[2]],2.6,2.6);}}}
 const rFn=y=>{const t=clamp((y-YM)/(H-YM),0,1);return 34*(1-.35*t)*(1+.12*Math.sin(Math.PI*t));};
 const body=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.9:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,37+(upper?1:0),cut!=null?L:null,1.2);
  const o={rFn:y=>rFn(y+y0),H:H-y0,cut:cut!=null?L:null,jag:cut?8:0,flutes:15,amp:.22,sharp:3,nu:120,nv:80,hole,seed:37};mesh(lathe(o),SHELL(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.88,H:H-y0,cut:o.cut,jag:o.jag,nu:48,nv:16,seed:37}),MAT.guts,P);for(let y=7;y<L-2;y+=7)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  windowsOnLathe({rFn:y=>rFn(y+y0),hole,cut:o.cut},dx,6,L-14,7,15,0,0,0,false);
  for(let yy=14;yy<L-16;yy+=21)stripRing(0,yy,0,rFn(yy+y0)*.9,dx,24);
  [.35,.7].forEach(f=>{const yl=(H-YM)*f-(y0-YM);if(yl<8||yl>L-10)return;glassBand(P,y=>rFn(y+y0),yl,8,dx,0,0,0,36);});
  if(cut==null){mesh(lathe({rFn:y=>rFn(H)*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12,hole:(u,y)=>Math.cos(u*TAU*15)<.2&&y>3}),SHELL(dx),P,0,L-1,0);
   if(dx===0){mesh(lathe({rFn:y=>rFn(H)*.95*(1+.5*y/26)*Math.sqrt(clamp(1-Math.pow(y/26,2),0,1)),H:26,nu:48,nv:12}),MAT.glass,P,0,L-1,0);kput('finial',[0,L+30,0],null,[4,8,4],null);}}};
 kput('slab',[0,YM+4,0],null,[42,4,42],new THREE.Color(dd>0?0x4a3f38:0xcfcac2));kput(dd>0?'ringR':'ringW',[0,YM+6,0],qEuler(Math.PI/2,0,0),[42,42,10],null);
 const P=new THREE.Group();P.position.set(0,YM+6,0);G.add(P);useGroupXF(P);if(d<2)body(P,dd,YM+6,null,false);else body(P,1,YM+6,YM+40,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,YM+40,rFn(YM+40),(U,dx,y0)=>body(U,1,YM+40,null,true),d);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}

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
function bodyGroup(G,y0,d,dd,build,cutY,topR){const P=new THREE.Group();P.position.set(0,y0,0);G.add(P);useGroupXF(P);if(d<2)build(P,dd,y0,null,false);else build(P,1,y0,cutY,false);endGroupXF();
 if(d===2)toppledUpper(G,0,0,cutY,topR,(U)=>build(U,1,cutY,null,true),d);}

// ================================================================= SKYSCRAPER D — "the Monolith" (bare concrete, Torre Velasca head)
function buildSkyD(scene,gx,gz,d){reseed(9130+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const H=340,Y0=14;REGISTER({name:'Skyscraper D — the Monolith ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:120,h:H+20});
 skyPlinth(G,dd,110);
 const rFn=y=>{const t=clamp(y/H,0,1);return 30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.76:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,47+(upper?1:0),cut!=null?L:null,1.2);
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const fy=((y+y0)%12)/12;const rec=fy>.62&&fy<.92?.94:1;const r=rFn(y+y0)*se(th,3.2)*rec;return[r*Math.cos(th),y,r*Math.sin(th)];},96,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.86,H:H-y0,cut:cut!=null?L:null,jag:6,nu:32,nv:8,seed:47}),MAT.guts,P);for(let y=6;y<L-2;y+=6)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  const dRib=[];   // the ruined ribbons merge; the intact ones are glass, which does not
  for(let y=12-((y0)%12);y<L-4;y+=12){const yy=y+y0;const r0=rFn(yy)*.95; // glass ribbon in each recess
   if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2);return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{}),MAT.glass,P);
   else dRib.push(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2)*.98;return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{hole:(u,v)=>hole&&hole(u,y)}));
   if(((yy/12)|0)%3===0)stripRing(0,y+9,0,r0*.9,dx,28);}
  meshMerged(dRib,MAT.dark,P);
  // lift-core spine on +x, Velasca props under the head
  kput(BOXC(dx),[rFn(y0+L*.5)*.9+2.5,L/2,0],null,[5,L,9],null);
  if(cut==null){const yh=H*.84-y0;for(let k=0;k<16;k++){const th=(k+.5)/16*TAU;const r1=rFn(H*.8)*se(th,3.2),r2=rFn(H*.9)*se(th,3.2)*1.02;
    beam(dx>0?'strutR':'strutW',[Math.cos(th)*r1*.98,yh-14,Math.sin(th)*r1*.98],[Math.cos(th)*r2,yh+8,Math.sin(th)*r2],2.4,2);}
   mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(rFn(H)+1.2)*se(th,3.2)*(1-v*.02);return[r*Math.cos(th),L+v*4,r*Math.sin(th)];},96,1,{uS:16}),CONC(dx),P);
   kput(BOXC(dx),[0,L+2,0],null,[rFn(H)*1.9,.8,rFn(H)*1.9],null);
   for(let k=0;k<6;k++){const a=k/6*TAU;kput(BOXC(dx),[Math.cos(a)*14,L+7,Math.sin(a)*14],qEuler(0,-a,0),[3,10,8],null);}
   if(dx===0)mesh(lathe({rFn:y=>9*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:6}),MAT.glass,P,0,L+4,0);}};
 bodyGroup(G,Y0,d,dd,build,Y0+60,rFn(Y0+60));
 if(dd>0)vinesOnRing(0,Y0+12,0,rFn(Y0)*1.0,30,20);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}

// ================================================================= SKYSCRAPER E — "the Sail" (shaped glass lens, diagrid, twisting)
// gy/noPlinth let this tower be stood somewhere other than the ground -- the
// Screamers' chief took the ruin of one and had it lashed to the promenade.
// kput adds all three components of KOFF, and bodyGroup already routes the
// instanced pieces through useGroupXF, so lifting both KOFF and the group
// moves the whole tower consistently.
function buildSkyE(scene,gx,gz,d,gy,noPlinth){reseed(9140+d);gy=gy||0;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=360,Y0=10;REGISTER({name:'Skyscraper E — the Sail ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:120,h:H+40});
 if(!noPlinth)skyPlinth(G,dd,105);
 const aF=y=>34*(1-.45*Math.pow(clamp(y/H,0,1),1.3)),bF=y=>13*(1-.3*clamp(y/H,0,1)),rot=y=>.8*clamp(y/H,0,1);
 const PT=(u,y,s)=>{const a=aF(y),b=bF(y),r=rot(y);const x=(u-.5)*2*a,z=s*b*(1-Math.pow(u*2-1,2));return[x*Math.cos(r)-z*Math.sin(r),y,x*Math.sin(r)+z*Math.cos(r)];};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.82:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.8,57+(upper?1:0),cut!=null?L:null,1.5);
  for(const s of [-1,1]){if(dx===0)mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0],v*L,p[2]];},40,Math.round(L/6),{}),MAT.glass,P);
   else mesh(gridSurface((u,v)=>{const p=PT(u,v*L+y0,s);return[p[0]*.93,v*L,p[2]*.93];},40,Math.round(L/6),{hole:(u,v)=>hole&&hole(u+s,v*L)}),MAT.guts,P);
   // diagrid mullions
   const step=12;for(let y=0;y<L-1;y+=step){const y2=Math.min(y+step,L);for(let j=0;j<8;j++){const u1=j/8,u2=(j+1)/8;if(dx>0&&hole&&hole((u1+u2)/2+s,y))continue;
    const A=PT(u1,y+y0,s),B=PT(u2,y2+y0,s),C=PT(u2,y+y0,s),D=PT(u1,y2+y0,s);
    beam(dx>0?'strutR':'strutW',[A[0],y,A[2]],[B[0],y2,B[2]],1.1,.9);beam(dx>0?'strutR':'strutW',[C[0],y,C[2]],[D[0],y2,D[2]],1.1,.9);}}}
  // concrete edge fins and floor slabs
  for(let y=0;y<L;y+=8){const y2=Math.min(y+8,L);const A=PT(0,y+y0,1),B=PT(0,y2+y0,1),C=PT(1,y+y0,1),D=PT(1,y2+y0,1);
   beam(BOXC(dx),[A[0],y,A[2]],[B[0],y2,B[2]],3.5,6);beam(BOXC(dx),[C[0],y,C[2]],[D[0],y2,D[2]],3.5,6);}
  for(let y=4;y<L-1;y+=4){const yy=y+y0;if(hole&&rng()<.15*dx)continue;kput('slab',[0,y,0],qEuler(0,-rot(yy),0),[aF(yy)*.95,.35,bF(yy)*.92],new THREE.Color(dx>0?0x2a2c30:0x8a8f98));if(y%24===4)stripRing(0,y+1.5,0,bF(yy)*.6,dx,12);}
  if(cut==null){for(const uu of [0,1]){const A=PT(uu,H,1);beam(BOXC(dx),[A[0],L,A[2]],[A[0]*1.1,L+34,A[2]*1.1],3,5);}
   if(dx===0){mesh(gridSurface((u,v)=>{const p=PT(u,H,1);const q=PT(u,H,-1);const z=lerp(q[2],p[2],v),x=lerp(q[0],p[0],v);return[x,L+.5,z];},20,6,{}),MAT.glass,P);kput('finial',[0,L+36,0],null,[3,6,3],null);}}};
 bodyGroup(G,Y0,d,dd,build,Y0+70,aF(Y0+70));
 if(!noPlinth)figures(-100,130,6,6);
 KOFF=[0,0,0];return G;}

// ================================================================= SKYSCRAPER F — "the Trays" (stacked concrete trays, glass between)
// gy/noPlinth let this tower be stood somewhere other than the ground -- the
// Screamers' chief took the ruin of one and had it lashed to the promenade.
// kput adds all three components of KOFF and bodyGroup routes the instanced
// pieces through useGroupXF, so lifting both KOFF and the group is consistent.
function buildSkyF(scene,gx,gz,d,gy,noPlinth,hcut){reseed(9150+d);gy=gy||0;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=290,Y0=10,TS=12;REGISTER({name:'Skyscraper F — the Trays ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:120,h:H+20});
 if(!noPlinth)skyPlinth(G,dd,105);
 const RT=y=>28*(1-.2*clamp(y/H,0,1))+6*Math.sin(Math.PI*clamp(y/H,0,1));
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*(hcut||.8):null);const L=(cut!=null?cut:H)-y0;
  mesh(lathe({rFn:()=>11,H:L,nu:32,nv:4,hole:holeFn(dx*.6,67,null,2)}),CONC(dx),P);if(dx>0)mesh(lathe({rFn:()=>9.5,H:L,nu:16,nv:1}),MAT.guts,P);
  const trays=[],darks=[];   // one mesh for the whole stack, not three per tray
  let k0=Math.round(y0/TS);for(let y=0;y+2<L;y+=TS){const k=k0+((y/TS)|0);const yy=y+y0;const R=RT(yy);const ang=k*.14;const fallen=dx>0&&(k%7===3);
   const trayR=th=>R*(1+.22*Math.cos(3*(th-ang)));
   if(!fallen){
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),y+TS-2.6,r*Math.sin(th)];},96,4,{uS:16,vS:2,hole:holeFn(dx*.7,68+k,null,2)}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th);return[r*Math.cos(th),y+TS-2.6+v*2.6,r*Math.sin(th)];},96,1,{uS:16}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),y+TS,r*Math.sin(th)];},96,2,{}));
    if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.82;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},96,1,{}),MAT.glass,P);
    else darks.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.72;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},64,1,{hole:(u,v)=>fbm(u*6,k,69,2)<.3}));
    for(let j=0;j<18;j++){const th=j/18*TAU;const r=trayR(th)*.82;kput(dx>0?'mullR':'mullW',[r*Math.cos(th),y+TS/2-1.3,r*Math.sin(th)],qEuler(0,-th,0),[.8,TS-2.9,.8],null);}
    stripRing(0,y+TS-3.3,0,R*.7,dx,20);}
   else{const fm=mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),0,r*Math.sin(th)];},64,3,{uS:16,vS:2,hole:holeFn(1,68+k,null,1.5)}),MAT.concreteR,P,6,y+TS-6,4);fm.rotation.set(.35,0,.25);}}
  meshMerged(trays,CONC(dx),P);meshMerged(darks,MAT.dark,P);
  if(cut==null){mesh(lathe({rFn:y=>13*Math.sqrt(clamp(1-Math.pow(y/10,2),0,1)),H:10,nu:32,nv:6}),CONC(dx),P,0,L,0);kput(dx>0?'ringR':'ringW',[0,L+3,0],qEuler(Math.PI/2,0,0),[15,15,4],null);if(dx===0)kput('finial',[0,L+13,0],null,[3,5,3],null);}};
 bodyGroup(G,Y0,d,dd,build,Y0+TS*5,RT(Y0+60));
 if(!noPlinth)figures(-100,130,6,6);
 KOFF=[0,0,0];return G;}

// ================================================================= MEGASTRUCTURE 2 — "the Gate" (cyclopean lattice arc with an apex tower)
function buildArc(scene,gx,gz,d){reseed(9996+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const SPAN=640,RISE=300;REGISTER({name:'Megastructure — the Gate ('+STATE(d)+')',x:0,z:0,r:400,h:RISE+140});
 const C=t=>[SPAN*(t-.5),RISE*(1-Math.pow(2*t-1,2))*(1+.06*Math.sin(t*9)),0];         // centreline, slight wobble
 const W=t=>42*(1+.5*Math.pow(Math.abs(2*t-1),3)),D=t=>34*(1+.4*Math.pow(Math.abs(2*t-1),3)); // section grows toward the feet
 const gone=t=>d>0&&t>.1&&t<.19;                                                             // ruined: gap in the west leg
 const N=96;const chords=[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1.3],[0,1.3]];
 chords.forEach((c,ci)=>{let pts=[];const flush=()=>{if(pts.length>1)mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,ci<4?5.5:3,8,false),skin,G);pts=[];};
  for(let i=0;i<=N;i++){const t=i/N;if(gone(t)){flush();continue;}const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);const nx=-tg[1]/L,ny=tg[0]/L;
   pts.push(new THREE.Vector3(p[0]+nx*c[0]*W(t)/2,p[1]+ny*c[0]*W(t)/2,c[1]*D(t)/2));}flush();});
 for(let i=0;i<N;i+=2){const t=(i+.5)/N;if(gone(t))continue;const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);const nx=-tg[1]/L,ny=tg[0]/L;
  const w=W(t)/2,dp=D(t)/2;const P4=(a,b)=>[p[0]+nx*a*w,p[1]+ny*a*w,b*dp];
  beam(d>0?'strutR':'strutW',P4(-1,-1),P4(1,1),2.2,2.2);beam(d>0?'strutR':'strutW',P4(1,-1),P4(-1,1),2.2,2.2);
  beam(d>0?'strutR':'strutW',P4(-1,-1),P4(-1,1),2.6,2.6);beam(d>0?'strutR':'strutW',P4(1,-1),P4(1,1),2.6,2.6);
  if(i%6===0){const dn=P4(-1,0);kput('strip',[dn[0],dn[1]-.5,dn[2]],qEuler(0,0,Math.atan2(ny,nx)+Math.PI/2),[dp*1.6,1,1],d>0?(rng()<.1?CYAN:DEAD):CYAN);}}
 // armour plating on all four faces of the box section: full when intact, knocked off in patches (painting) when ruined
 const frame=t=>{const p=C(t);const tg=[C(t+.001)[0]-p[0],C(t+.001)[1]-p[1]];const L=Math.hypot(tg[0],tg[1]);return{p,nx:-tg[1]/L,ny:tg[0]/L};};
 const plateGone=(u,v,f)=>gone(u)||(d>0?fbm(u*16+f*3,v*3,1300+f,3)<.53||fbm(u*40,v*6,1320+f,2)<.28:fbm(u*30,v*5,1300+f,2)<.08);
 const facesA=[[1,0],[-1,0],[0,1],[0,-1]];facesA.forEach((fc,f)=>{mesh(gridSurface((u,v)=>{const F=frame(u);const w=W(u)/2,dp=D(u)/2;let a,b;if(fc[0]){a=fc[0]*1.03;b=(v-.5)*2;}else{a=(v-.5)*2;b=fc[1]*1.03;}return[F.p[0]+F.nx*a*w,F.p[1]+F.ny*a*w,b*dp];},192,8,{uS:48,vS:3,hole:(u,v)=>plateGone(u,v,f)}),skin,G);});
 // plate seams: thin ribs every few metres along the extrados and intrados
 for(let i=0;i<N;i+=1){const t=(i+.5)/N;if(gone(t))continue;const F=frame(t);for(const a of [1.04,-1.04]){if(d>0&&plateGone(t,.5,a>0?0:1))continue;kput(PLATE(d),[F.p[0]+F.nx*a*W(t)/2,F.p[1]+F.ny*a*W(t)/2,0],qEuler(0,0,Math.atan2(F.ny,F.nx)),[1.2,.6,D(t)*1.06],null);}}
 // fallen plates scattered below the ruined arc
 if(d>0)for(let k=0;k<90;k++){const t=rr(.05,.95);const F=frame(t);const x=F.p[0]+rr(-60,60),z=rr(-80,80);kput('plateR',[x,rr(.5,2.5),z],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(6,16),.6,rr(5,12)],null);}
 // feet
 for(const t of [0,1]){const p=C(t);kput(BOXC(d),[p[0],14,0],null,[70,28,50],null);kput(BOXC(d),[p[0]+(t?1:-1)*40,8,0],qEuler(0,0,(t?-1:1)*.35),[60,14,44],null);
  for(let k=0;k<5;k++)kput(d>0?'colR':'colW',[p[0]+(t?1:-1)*(30+k*18),0,-40+k*20],null,[2.5,12,2.5],null);}
 // apex tower: fluted shaft with a cluster of spikes, offset toward one side like the painting
 const ap=C(.56);const TH=170,tcut=d>0?TH*.72:null;const T=new THREE.Group();T.position.set(ap[0],ap[1]-8,0);G.add(T);useGroupXF(T);
 mesh(lathe({rFn:y=>20*(1-.3*y/TH)+1,H:TH,cut:tcut,jag:tcut?4:0,flutes:8,amp:.2,sharp:1.5,nu:48,nv:40,hole:holeFn(d,1310,tcut,1.2)}),skin,T);
 if(d>0)mesh(lathe({rFn:y=>17*(1-.3*y/TH),H:TH,cut:tcut,jag:4,nu:20,nv:6}),MAT.guts,T);
 for(let y=10;y<(tcut||TH)-6;y+=6)for(let k=0;k<12;k++){const th=(k+.5)/12*TAU,r=20*(1-.3*y/TH)+1.1;kput(d>0?'winSmD':'winSmI',[r*Math.cos(th),y,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,2.6,1],null);}
 for(let yy=20;yy<(tcut||TH)-10;yy+=30)stripRing(0,yy,0,19*(1-.3*yy/TH),d,24);
 if(!tcut){for(let k=0;k<9;k++){const th=k/9*TAU;const r=rr(4,13),h=rr(20,50);beam(d>0?'strutR':'strutW',[Math.cos(th)*r,TH-4,Math.sin(th)*r],[Math.cos(th)*r*1.4,TH-4+h,Math.sin(th)*r*1.4],rr(1.2,2.6),rr(1.2,2.6));}
  if(d===0)kput('finial',[0,TH+30,0],null,[3,6,3],null);}
 endGroupXF();
 // ruined: the fallen leg section lying below the gap, rubble, moss
 if(d>0){const p=C(.15);const F=new THREE.Group();F.position.set(p[0]+30,10,40);F.rotation.set(.3,.4,1.35);G.add(F);
  for(const c of chords.slice(0,4))mesh(new THREE.CylinderGeometry(5.5,5.5,70,8).translate(c[0]*20,0,c[1]*16),MAT.rust,F);
  rubbleRing(p[0]+20,0,30,10,90,140,4);scatterMoss(0,0,0,0,420,220,3.5);trees(0,0,60,420,40);vinesOnRing(ap[0],ap[1]-20,0,20,20,40);}
 figures(0,120,6,14);KOFF=[0,0,0];return G;}

// ================================================================= MEGASTRUCTURE 3 — "Vashtir" (recursive spire)
// A pale pyramid-mountain grown, not stacked. One broad, shallow, many-sided
// tier is the seed form: a star-faceted cone with sharp vertical arrises, deep
// re-entrant valleys between them and a stepped, flaring shelf every third of
// its height. Out of the ridge crests on its shoulders grow smaller copies of
// the same form, tilted outward and up, and out of those smaller ones again,
// three levels deep. The trunk is a chain of six such tiers, each rooted low
// enough to emerge through the flank of the one below, so the whole reads as a
// single triangular mass that frays into spines and blade-fins at its edges.
//
// The plan radius and the profile are both PIECEWISE LINEAR, and the grid is
// sampled at 4-8 columns per facet (see NUF), so the facets stay flat and the
// arrises read as edges instead of averaging back into a smooth cone. That one
// change is the difference between a crystalline mass and a heap of witch hats.
//
// Every recursion node bakes its own transform into its geometry and is pushed
// into one array: the whole ~380-node hierarchy is ONE merged mesh per material,
// not one mesh per node. Blade fins, twig spikes, cable stays, the plinth and
// the buttress piers all go through the instancing kit.
kdef('spFinW',new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,-.5),new THREE.Vector2(1,-.05),new THREE.Vector2(1,.05),new THREE.Vector2(0,.5)])),MAT.white);
kdef('spFinR',new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,-.5),new THREE.Vector2(1,-.05),new THREE.Vector2(1,.05),new THREE.Vector2(0,.5)])),MAT.rust);
kdef('spSpikeW',new THREE.ConeGeometry(1,1,5).translate(0,.5,0),MAT.white);
kdef('spSpikeR',new THREE.ConeGeometry(1,1,5).translate(0,.5,0),MAT.rust);

function buildSpire(scene,gx,gz,d){reseed(9310+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const skin=SHELL(d);
 const BASE=330,TOP=512;                                   // ~660 m across, ~512 m tall
 REGISTER({name:'Vashtir — the Recursive Spire ('+STATE(d)+')',x:0,z:0,r:BASE+150,h:TOP+16});
 REGISTER({name:'Vashtir — plinth and buttressed feet ('+STATE(d)+')',x:0,z:0,r:BASE+100,h:24});
 REGISTER({name:'Vashtir — the crown ('+STATE(d)+')',x:0,z:0,r:130,y:258,h:262});

 // ---------------------------------------------------------------- the seed form
 // Plan: triangle wave between a crest radius R and a valley radius R*inner, so
 // every face is planar. Profile: a straight-ish taper with `shelf` flaring
 // bands, each cut back sharply at its top into a downward-facing ledge.
 const rOf=(R,sides,inner,pw,shelf,tw,th,t)=>{
  const f=(th+tw*t)*sides/TAU;
  const w=Math.abs(2*(f-Math.floor(f))-1);
  return R*Math.pow(1-t,pw)*(inner+(1-inner)*w)*(1+.16*((t*shelf)%1));};
 const tierGeo=(R,H,sides,inner,pw,shelf,tw,nu,nv,hole)=>gridSurface((u,v)=>{
  const th=u*TAU,t=v*.997,r=rOf(R,sides,inner,pw,shelf,tw,th,t);
  return[r*Math.cos(th),H*v,r*Math.sin(th)];},nu,nv,{uS:R*TAU/24,vS:H/24,hole});

 const shells=[],cores=[],tips=[];
 const INNER=[.60,.63,.67,.72],PW=[1.05,1.12,1.18,1.22],SHELF=[3,2,2,2];
 const NUF=[8,8,6,4],NV=[18,12,8,4];                       // grid columns per facet; rows
 const NK=[0,3,3,0];                                       // children a node at that depth spawns
 const FIN=d>0?'spFinR':'spFinW',SPK=d>0?'spSpikeR':'spSpikeW';
 const SNAP=[.05,.20,.42];                                 // ruined: chance a child is missing
 const T0=[.24,.30,.34],T1=[.72,.68,.64];                  // where on the parent children sprout
 const SLEN=[1.20,1.05,1.05];                              // how much more slender each child is

 const node=(M,R,H,sides,dep,nk,sd)=>{
  const inner=INNER[dep],shelf=SHELF[dep],tw=rr(-.05,.05);
  // jittering the profile exponent per node is what stops the recursion looking
  // like a screensaver: some tiers come out needle-sharp, some blunt and domed
  const pw=PW[dep]*rr(.78,1.30);
  const hf=holeFn(d*[.95,1.2,1.35,1.45][dep],9310+sd*3.7+dep*11,dep<=1?H:null,.7+dep*.5);
  const g=tierGeo(R,H,sides,inner,pw,shelf,tw,sides*NUF[dep],NV[dep],hf?(u,v)=>hf(u,v*H):null);
  g.applyMatrix4(M);shells.push(g);
  // CAP THE BASE. A tier is a surface, not a solid: where a tilted child's base
  // rim clears its parent's flank you were looking up inside the cone at its
  // DoubleSide backface, which the hemisphere light paints brown. Seating the
  // child deeper only hid most of it. The rim is a star, not a circle, so the
  // cap has to be swept from the same rOf() the shell uses.
  if(dep>0){const cap=gridSurface((u,v)=>{const th=u*TAU;
    const r=rOf(R,sides,inner,pw,shelf,tw,th,0)*v;
    return[r*Math.cos(th),H*.004,r*Math.sin(th)];},sides*NUF[dep],2,{uS:R/8,vS:1});
   cap.applyMatrix4(M);shells.push(cap);}
  // a dark core just inside the valley radius: it only shows through the holes
  if(dep===0){const gi=tierGeo(R*inner*.92,H*.9,sides,.9,pw,1,tw,sides*3,6,null);
   gi.applyMatrix4(M);cores.push(gi);}
  const MQ=new THREE.Quaternion().setFromRotationMatrix(M);
  const wp=(x,y,z)=>{const p=new THREE.Vector3(x,y,z).applyMatrix4(M);return[p.x,p.y,p.z];};
  const surf=(th,t,o)=>{const r=rOf(R,sides,inner,pw,shelf,tw,th,t)*(o||1);
   return wp(r*Math.cos(th),H*t,r*Math.sin(th));};
  // structural ribs picked out along every arris, one per shelf band: without
  // them the facets read as folded paper rather than as a panelled metal mass
  if(dep<=1)for(let a=0;a<sides;a++)for(let b=0;b<shelf;b++){
   if(d>0&&rng()<.30)continue;
   const tA=b/shelf+.015,tB=(b+1)/shelf-.025,th=a*TAU/sides-tw*(tA+tB)*.5;
   beam(PLATE(d),surf(th,tA,1.006),surf(th,tB,1.006),R*.030,R*.052);}
  // thin radiating blade-fins, hanging out of the flanks and under the shelves
  if(dep<=1){const nf=sides*(dep===0?3:2);
   for(let k=0;k<nf;k++){if(d>0&&rng()<.38)continue;
    const th=(k+.5)/nf*TAU+rr(-.06,.06),t=rr(.14,.80);
    const r=rOf(R,sides,inner,pw,shelf,tw,th,t)*.99;
    kput(FIN,wp(r*Math.cos(th),H*t,r*Math.sin(th)),
     MQ.clone().multiply(qEuler(0,-th,0)).multiply(qEuler(0,0,-rr(.12,.9))),
     [R*rr(.16,.38)*(1-.5*t),R*rr(.06,.17)*(1-.4*t),1],null);}}
  // twigs: a spike or two off the finest tiers
  if(dep===3)for(let k=0;k<2;k++){if(rng()<.38)continue;
   const th=rng()*TAU,t=rr(.4,.9),r=rOf(R,sides,inner,pw,shelf,tw,th,t);
   kput(SPK,wp(r*Math.cos(th),H*t,r*Math.sin(th)),
    MQ.clone().multiply(qEuler(0,-th,0)).multiply(qEuler(0,0,-rr(.45,1.15))),
    [R*rr(.10,.20),R*rr(.6,1.5),R*rr(.10,.20)],null);}
  if(dep>=3||nk<=0)return;
  // ---- children: smaller copies of the same form off the ridge crests ----
  for(let k=0;k<nk;k++){
   if(d>0&&rng()<SNAP[dep])continue;                       // snapped off and gone
   const big=dep===0&&k===0;                               // one companion spire per trunk tier
   const t=big?rr(.20,.38):rr(T0[dep],T1[dep]);
   const th=Math.round((k+rr(-.25,.25))/nk*sides)*TAU/sides-tw*t+rr(-.05,.05);
   const r=rOf(R,sides,inner,pw,shelf,tw,th,t);
   let s=(big?rr(.52,.68):rr(.32,.50))*(1-.22*t);   // fewer children, each larger:
   // the reference reads as pyramids nested inside pyramids, not as fuzz
   if(!big&&rng()<.16)s*=rr(.52,.78);                      // some are stunted
   const cR=R*s,cH=H*s*rr(.95,1.35)*SLEN[dep];
   const cM=M.clone().multiply(new THREE.Matrix4().compose(
    // seated well inside the parent: a child rooted on the surface leaves its
    // open base rim clear of the flank, and you see up into the shell's brown
    // backface through the gap
    new THREE.Vector3(r*Math.cos(th)*.72,H*t-cR*.30,r*Math.sin(th)*.72),
    qEuler(0,-th,0).multiply(qEuler(0,0,(big?-rr(.05,.20):-rr(.18,.50))-dep*.11)).multiply(qEuler(0,rng()*TAU,0)),
    new THREE.Vector3(1,1,1)));
   node(cM,cR,cH,Math.max(4,sides-1+(rng()<.3?1:0)),dep+1,NK[dep+1],sd*3+k+1);
   if(dep<=1){const tp=new THREE.Vector3(0,cH*.92,0).applyMatrix4(cM);
    tips.push({p:[tp.x,tp.y,tp.z],dep});}}
 };

 // ---------------------------------------------------------------- the trunk
 const CH=[[6,330,205,6,0,5],[48,258,265,6,.29,5],[148,168,235,6,.55,4],
           [262,96,180,5,.18,4],[358,46,120,5,.63,3],[440,18,72,4,.30,0]];
 let lx=0,lz=0;
 CH.forEach((c,i)=>{
  node(new THREE.Matrix4().compose(new THREE.Vector3(lx,c[0],lz),
   qEuler(rr(-.012,.012),c[4],rr(-.012,.012)),new THREE.Vector3(1,1,1)),
   c[1],c[2],c[3],0,c[5],i*17+3);
  lx+=rr(-4,4);lz+=rr(-4,4);});
 meshMerged(shells,skin,G);
 meshMerged(cores,d>0?MAT.guts:MAT.dark,G);

 // ---------------------------------------------------------------- infill webs
 // A membrane slung from each shoulder: it hangs taut off the arrises and sags
 // between them, so it scallops. Blue glass while it stands; a torn dark skin
 // once the glass is gone.
 CH.forEach((c,i)=>{if(i>3)return;
  const R=c[1],H=c[2],sides=c[3],inner=INNER[0],pw=PW[0];
  const tA=rr(.30,.44),drop=R*rr(.34,.52);
  const wg=gridSurface((u,v)=>{
   const th=u*TAU,f=th*sides/TAU,w=Math.abs(2*(f-Math.floor(f))-1);
   const rin=rOf(R,sides,inner,pw,SHELF[0],0,th,tA);
   const rv=rin*(1+.34*v);
   return[rv*Math.cos(th),c[0]+H*tA-drop*(1-w*.86)*Math.pow(v,1.25)-v*drop*.10,rv*Math.sin(th)];},
   sides*10,5,{uS:R/6,vS:2,hole:d>0?(u,v)=>fbm(u*11,v*4,9340+i,3)<.74:null});
  mesh(wg,d>0?MAT.guts:MAT.glass,G);});

 // ---------------------------------------------------------------- parasol fans
 // What makes the reference read the way it does is not its outline — it is that
 // it is TRANSLUCENT, so you see pyramids through pyramids, layer behind layer.
 // A solid white mass in the same silhouette reads as a mountain instead. These
 // are broad, shallow, scalloped glass fans thrown out horizontally from each
 // tier's shoulder: the structure now has something to be seen *through*.
 //
 // Left as separate meshes rather than merged: transparent geometry is sorted
 // per mesh, and eight fans at eight different heights want eight sort keys.
 // Eight extra draw calls on a structure that sits at 27 is a fair trade.
 CH.forEach((c,i)=>{if(i>4)return;
  const R=c[1],H=c[2],sides=c[3];
  for(let b=0;b<2;b++){
   const t=b?rr(.52,.66):rr(.16,.30);
   const rin=rOf(R,sides,INNER[0],PW[0],SHELF[0],0,0,t);
   const out=rin*(b?rr(1.35,1.75):rr(1.7,2.3));
   const fan=gridSurface((u,v)=>{
    const th=u*TAU,f=th*sides/TAU,w=Math.abs(2*(f-Math.floor(f))-1);
    // scalloped edge: reaches furthest on the arrises, cut back in the valleys
    const rr0=lerp(rOf(R,sides,INNER[0],PW[0],SHELF[0],0,th,t)*.96,out*(.62+.38*w),v);
    // and it droops as it goes out, so it is a parasol and not a dinner plate
    return[rr0*Math.cos(th),c[0]+H*t-Math.pow(v,1.7)*out*(.16+.10*(1-w)),rr0*Math.sin(th)];},
    sides*9,4,{uS:R/7,vS:2,hole:d>0?(u,v)=>fbm(u*13,v*5,9360+i*3+b,3)<.66:null});
   mesh(fan,d>0?MAT.guts:MAT.glass,G);}});
 // ---------------------------------------------------------------- cable stays
 tips.forEach(tp=>{if(rng()<(d>0?.74:.52))return;
  const p=tp.p,ay=Math.max(10,p[1]-rr(70,190));
  beam('boxD',p,[p[0]*.42,ay,p[2]*.42],.55,.55);});
 tips.filter(t=>t.dep===0&&t.p[1]<220).forEach(tp=>{if(rng()<(d>0?.7:.45))return;
  const s=1.12+rng()*.32;beam('boxD',tp.p,[tp.p[0]*s,3,tp.p[2]*s],.9,.9);});

 // ---------------------------------------------------------------- ground works
 kput(SLABC(d),[0,2,0],null,[BASE+72,4,BASE+72],null);       // outer terrace
 kput(SLABC(d),[0,6,0],null,[BASE+42,4,BASE+42],null);
 kput(SLABC(d),[0,10,0],null,[BASE+16,4,BASE+16],null);      // plinth the mass stands on
 for(let k=0;k<44;k++){const th=k/44*TAU;                             // massive kerb blocks round the rim
  kput(BOXC(d),[Math.cos(th)*(BASE+70),rr(2,5),Math.sin(th)*(BASE+70)],qEuler(0,-th,0),
   [rr(8,15),rr(4,9),rr(40,58)],null);}
 for(let k=0;k<6;k++){const th=k/6*TAU+.3,L=rr(130,270);              // a causeway out from each portal stair
  kput(BOXC(d),[Math.cos(th)*(BASE+66+L/2),2,Math.sin(th)*(BASE+66+L/2)],qEuler(0,-th,0),[L,4,rr(30,44)],null);
  for(const sg of[-1,1])kput(BOXC(d),[Math.cos(th)*(BASE+66+L/2)-Math.sin(th)*sg*20,4,Math.sin(th)*(BASE+66+L/2)+Math.cos(th)*sg*20],
   qEuler(0,-th,0),[L*.94,8,5],null);}                                // its parapet walls
 for(let k=0;k<16;k++){const th=(k+.5)/16*TAU+rr(-.04,.04);           // raking buttress piers
  const yT=rr(54,118),rO=BASE+rr(22,62);
  const rI=rOf(BASE,6,INNER[0],PW[0],SHELF[0],0,th,yT/205)*.94;
  beam(BOXC(d),[Math.cos(th)*rO,2,Math.sin(th)*rO],[Math.cos(th)*rI,yT,Math.sin(th)*rI],rr(11,21),rr(16,34));
  kput(BOXC(d),[Math.cos(th)*rO,rr(8,17),Math.sin(th)*rO],qEuler(0,-th,0),[rr(22,38),rr(16,34),rr(20,36)],null);}
 // The only human-scale thing anywhere on it: six portals at the foot, each with
 // a threshold slab and a flight of 0.5 m steps running down across the terraces.
 for(let k=0;k<6;k++){const th=k/6*TAU+.3,r=rOf(BASE,6,INNER[0],PW[0],SHELF[0],0,th,.05)*.985;
  kput('archOpen',[Math.cos(th)*r,16.5,Math.sin(th)*r],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);
  kput(BOXC(d),[Math.cos(th)*(r+13),13.2,Math.sin(th)*(r+13)],qEuler(0,-th,0),[24,2.4,32],null);
  for(let j=0;j<23;j++){const rs=BASE+17+j*3.3,ys=12-j*.52;if(ys<.4)break;
   kput(BOXC(d),[Math.cos(th)*rs,ys,Math.sin(th)*rs],qEuler(0,-th,0),[3.3,1.1,15],null);}}
 for(let i=0;i<3;i++)stripRing(0,CH[i][0]+CH[i][2]*.40,0,
  rOf(CH[i][1],CH[i][3],INNER[0],PW[0],SHELF[0],0,0,.40)*.86,d,Math.max(10,Math.round(CH[i][1]*.06)));

 // ---------------------------------------------------------------- ruin
 if(d>0){
  // snapped-off branches lying where they fell
  for(let k=0;k<3;k++){const F=new THREE.Group();
   const th=rng()*TAU,rad=rr(BASE*.80,BASE*1.34);
   F.position.set(Math.cos(th)*rad,0,Math.sin(th)*rad);
   F.rotation.set(rr(-.45,.45),rng()*TAU,rr(1.05,2.05));
   const R0=rr(48,86),H0=R0*rr(1.3,2.1),fg=[],hh=holeFn(1,9330+k,null,1.4);
   fg.push(tierGeo(R0,H0,5,.62,1.12,2,0,40,12,(u,v)=>hh(u,v*H0)));
   for(let c=0;c<2;c++){const g2=tierGeo(R0*rr(.30,.44),H0*rr(.34,.48),4,.66,1.18,1,0,24,7,null);
    g2.applyMatrix4(new THREE.Matrix4().compose(
     new THREE.Vector3(R0*rr(.35,.55)*Math.cos(c*2.4),H0*rr(.3,.55),R0*rr(.35,.55)*Math.sin(c*2.4)),
     qEuler(rr(-.5,.5),rng()*TAU,rr(.5,1.1)),new THREE.Vector3(1,1,1)));
    fg.push(g2);}
   meshMerged(fg,MAT.rust,F);G.add(F);dropFragment(F,0,rr(2,7));}
  rubbleRing(0,0,0,BASE*.88,BASE+165,210,4.5);
  scatterMoss(0,0,0,BASE*.45,BASE+250,200,4);
  mossOnRing(0,12,0,BASE+22,54,3);
  trees(0,0,BASE+110,BASE+340,28);
  vinesOnRing(0,20,0,BASE*.92,64,55);
  vinesOnRing(0,160,0,150,34,44);
 }
 // human scale: on the plain at the foot of three of the six stairs
 figures(Math.cos(.45)*(BASE+104),Math.sin(.45)*(BASE+104),8,22);
 figures(Math.cos(2.234)*(BASE+112),Math.sin(2.234)*(BASE+112),6,20);
 figures(Math.cos(4.629)*(BASE+98),Math.sin(4.629)*(BASE+98),5,18);
 KOFF=[0,0,0];return G;}
// ================================================================= ROBOTICS FACTORY — "the Assembler"
function buildRobotics(scene,gx,gz,d){reseed(9210+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Robotics factory — the Assembler ('+STATE(d)+')',x:0,z:0,r:230,h:90});
 kput(BOXC(d),[0,2,0],null,[400,4,300],null);
 // main hall: concrete shell with a north-light sawtooth roof of shaped glass
 const HW=200,HD=90,HH=22;kput(BOXC(d),[-40,4+HH/2,0],null,[HW,HH,HD],null);kput('boxD',[-40,4+HH/2,0],null,[HW-2,HH-2,HD-2],null);
 const NB=8;for(let b=0;b<NB;b++){const z0=-HD/2+b*(HD/NB),z1=z0+HD/NB;const gone=d>0&&(b===2||b===5);
  const roof=gridSurface((u,v)=>{const x=-40-HW/2+u*HW;const zz=lerp(z0,z1,v);const y=4+HH+(1-v)*9*(1-.15*Math.pow(u*2-1,2));return[x,y,zz];},40,6,{uS:20,vS:2,hole:holeFn(d*.7,1400+b,null,2)});mesh(roof,CONC(d),G);
  if(!gone&&d===0)mesh(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,4,{}),MAT.glass,G);
  else if(!gone)mesh(gridSurface((u,v)=>{const x=-40-HW/2+u*HW;return[x,4+HH+v*9*(1-.15*Math.pow(u*2-1,2)),z0+.2];},40,2,{hole:(u,v)=>fbm(u*8,b,1410,2)<.4}),MAT.dark,G);
  for(let k=0;k<=10;k++){const x=-40-HW/2+k*HW/10;kput(d>0?'mullR':'mullW',[x,4+HH+4.5,z0+.3],null,[1,9,1],null);}}
 for(let k=0;k<13;k++){const x=-40-HW/2+k*HW/12;kput(BOXC(d),[x,4+HH/2,HD/2+.6],null,[2.2,HH,2],null);kput(BOXC(d),[x,4+HH/2,-HD/2-.6],null,[2.2,HH,2],null);
  if(k%3===1){kput('archOpen',[x+8,10,HD/2+1.5],qFacing([0,0,1]),[1.4,1.2,2],null);}}
 for(let k=0;k<6;k++){const x=-120+k*32;const lit=d>0?rng()<.15:true;kput('strip',[x,4+HH-1,0],qEuler(0,Math.PI/2,0),[70,1,1],lit?CYAN:DEAD);}
 // vertical assembly tower: fluted concrete drum with open bays, gantry arm
 const tx=110,tz=-40,TH=70,tcut=d>0?TH*.85:null;
 mesh(lathe({rFn:y=>24+3*Math.sin(y*.3),H:TH,cut:tcut,jag:tcut?3:0,flutes:10,amp:.12,sharp:1.5,nu:64,nv:36,hole:(u,y)=>(Math.abs(((u*10)%1)-.5)<.22&&((y%14)>4&&(y%14)<12)&&y>8)||(holeFn(d*.7,1420,tcut,1.5)||(()=>false))(u,y)}),CONC(d),G,tx,4,tz);
 mesh(lathe({rFn:()=>20,H:TH,cut:tcut,jag:3,nu:24,nv:4}),MAT.dark,G,tx,4,tz);
 for(let y=12;y<(tcut||TH)-6;y+=14)for(let k=0;k<10;k++){const th=(k+.5)/10*TAU;const r=21;kput('boxD',[tx+r*Math.cos(th),4+y+2,tz+r*Math.sin(th)],qEuler(0,-th,0),[6,.6,10],null);
  const lit=d>0?rng()<.15:true;kput('strip',[tx+r*Math.cos(th),4+y+7,tz+r*Math.sin(th)],qEuler(0,-th,0),[5,1,1],lit?WARM:DEAD);}
 if(!tcut){kput(SLABC(d),[tx,4+TH+.4,tz],null,[27,.8,27],null);beam(d>0?'strutR':'strutW',[tx,4+TH,tz],[tx-60,4+TH+6,tz+40],3,3);kput('tube',[tx-50,4+TH+2,tz+34],null,[.4,40,.4],null);}
 else rubbleRing(tx,4,tz,26,50,50,3);
 // overhead conveyor from tower to hall
 for(let k=0;k<4;k++){const x=70-k*30;kput(d>0?'colR':'colW',[x,4,10],null,[1.2,26,1.2],null);}kput(d>0?'pipeR':'pipe',[40,31,10],qEuler(0,0,Math.PI/2),[2.2,150,2.2],null);
 // test yard: six mount frames (giant robot chassis on stands)
 for(let i=0;i<6;i++){const x=-140+i*50,z=110;const gone=d>0&&(i===1||i===4);kput(SLABC(d),[x,4.6,z],null,[14,1.2,14],null);
  if(gone){rubbleRing(x,5,z,2,12,20,1.6);continue;}const q=qEuler(0,rr(-.4,.4),d>0?rr(-.15,.15):0);
  kput(BOXC(d),[x,9,z],null,[3,8,3],null);kput('boxD',[x,16,z],q,[12,6,7],null);kput('boxD',[x,21,z],q,[6,4,5],null);
  for(const s of [-1,1]){kput('tube',[x+s*7.5,14,z],q,[1.2,10,1.2],null);kput('tube',[x+s*3.5,7,z+1],q,[1.4,8,1.4],null);}
  const lit=d>0?rng()<.2:true;kput('dot',[x,21,z+2.6],null,[2,.6,.4],lit?CYAN:DEAD);}
 for(let k=0;k<5;k++){const x=-165+k*50;kput(BOXC(d),[x,10,110],null,[2,12,2],null);}kput(BOXC(d),[-40,16.5,110],null,[250,1.6,3],null);
 // silos of parts, loading dock
 for(let i=0;i<4;i++){const x=-170,z=-90+i*30;mesh(lathe({rFn:y=>7*(1-.05*Math.pow(y/24,6)),H:24,nu:24,nv:6,hole:holeFn(d*.7,1430+i,null,2.5)}),skin,G,x,4,z);kput(d>0?'ringR':'ringW',[x,28,z],qEuler(Math.PI/2,0,0),[7.3,7.3,2],null);}
 kput(BOXC(d),[-40,5.5,-HD/2-14],null,[HW*.6,3,14],null);for(let k=0;k<6;k++)kput('archOpen',[-100+k*24,10,-HD/2-.8],qFacing([0,0,-1]),[.9,.9,1.5],null);
 if(d>0){scatterMoss(0,4,0,0,190,150,2.4);rubbleRing(-40,4,0,30,150,60,2.2);trees(0,0,210,290,22);vinesOnRing(-40,4+HH,0,HD/2,20,10);}
 figures(0,60,5,10);KOFF=[0,0,0];return G;}

// ================================================================= CANYON WORKS — "the Span"
// Colossal pipes bridge a gorge; structures hang beneath them on cables, like
// pendants on a chandelier. The pipes are the infrastructure and the dwellings
// are parasitic on it — nothing hanging here was part of the original works.
//
// MODULARITY. A pipe does not know what hangs from it. It is built from a spec
// array (see SPANS below), and every payload type is one entry in HANG. Adding
// a kind of structure is one function plus one line in a spec; moving one along
// the pipe, changing its drop or swapping it for another type is a data edit.
//
// Payload functions build in their OWN local frame with the cable attachment at
// the origin and the structure hanging below it, and return deferred geometry
// and kit placements. hangEmit() then applies one matrix to all of it. That
// indirection is what lets the same payload be hung from a pipe or lie smashed
// on the canyon floor without being written twice.
function hangParts(){return{s:[],g:[],k:[],i:[]};}
function hangPut(P,name,p,q,sc,c){P.i.push({name,p,q,s:sc,c});}
function hangEmit(P,M,SH,GL,DK){
 const q0=new THREE.Quaternion().setFromRotationMatrix(M),v=new THREE.Vector3();
 P.s.forEach(g=>SH.push(g.applyMatrix4(M)));
 P.g.forEach(g=>GL.push(g.applyMatrix4(M)));
 P.k.forEach(g=>DK.push(g.applyMatrix4(M)));
 P.i.forEach(o=>{v.set(o.p[0],o.p[1],o.p[2]).applyMatrix4(M);
  kput(o.name,[v.x,v.y,v.z],o.q?o.q.clone().premultiply(q0):q0.clone(),o.s,o.c);});}
// a sphere that can be eaten by holeFn, unlike IcosahedronGeometry
function hangBall(R,nu,nv,hole){return lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu,nv,hole});}

const HANG={
 // --- the reference's form: a geodesic pod with porthole lenses -------------
 pod(R,d,sd){const P=hangParts(),h=holeFn(d*.8,sd,null,1.4);
  P.s.push(hangBall(R,40,22,h).translate(0,-R*2.1,0));
  P.k.push(hangBall(R*.9,20,10,null).translate(0,-R*2.1,0));
  for(let k=0;k<5;k++){const y=-R*2.1+R*(.5+k*.32);
   for(let j=0;j<9;j++){const th=(j+(k%2)*.5)/9*TAU,r=R*Math.sqrt(clamp(1-Math.pow((y+R*2.1-R)/R,2),0,1));
    if(r<R*.35)continue;
    hangPut(P,d>0?'ovalD':'ovalI',[r*Math.cos(th)*1.01,y,r*Math.sin(th)*1.01],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.11,R*.08,1],null);}}
  hangPut(P,d>0?'ringR':'ringW',[0,-R*2.1+R,0],qEuler(Math.PI/2,0,0),[R*1.06,R*1.06,R*.14],null);
  return P;},
 // --- a cut diamond, hung point-down ---------------------------------------
 prism(R,d,sd){const P=hangParts(),H=R*2.6,h=holeFn(d*.7,sd+1,null,1.2);
  P.s.push(lathe({rFn:y=>R*(1-Math.abs(y/H*2-1))+.02,H,nu:6,nv:14,hole:h?(u,v)=>h(u,v*H):null}).translate(0,-R*3.0,0));
  P.g.push(lathe({rFn:y=>R*.82*(1-Math.abs(y/H*2-1))+.02,H,nu:6,nv:8}).translate(0,-R*3.0,0));
  for(let k=0;k<6;k++){const th=k/6*TAU;
   hangPut(P,d>0?'strutR':'strutW',[Math.cos(th)*R*.52,-R*3.0+H*.5,Math.sin(th)*R*.52],qEuler(0,-th,0),[R*.07,H*1.02,R*.07],null);}
  return P;},
 // --- a carousel: stacked drums with balcony rings --------------------------
 drum(R,d,sd){const P=hangParts();let y=-R*1.5;
  for(let k=0;k<3;k++){const r=R*(1-k*.18),hh=R*.62;
   P.s.push(lathe({rFn:()=>r,H:hh,nu:28,nv:5,hole:holeFn(d*.9,sd+k*3,null,1.6)}).translate(0,y,0));
   P.k.push(lathe({rFn:()=>r*.9,H:hh,nu:14,nv:2}).translate(0,y,0));
   hangPut(P,d>0?'ringR':'ringW',[0,y+hh,0],qEuler(Math.PI/2,0,0),[r*1.2,r*1.2,r*.1],null);
   for(let j=0;j<10;j++){const th=j/10*TAU;
    hangPut(P,d>0?'winSmD':'winSmI',[r*1.01*Math.cos(th),y+hh*.5,r*1.01*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[r*.16,r*.2,1],null);}
   y-=hh*1.18;}
  return P;},
 // --- a torus hung flat, cabins round its rim ------------------------------
 ring(R,d,sd){const P=hangParts();const y=-R*1.9;
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,ph=v*TAU,rr0=R*.34;
   const r=R+rr0*Math.cos(ph);return[r*Math.cos(th),y+rr0*Math.sin(ph),r*Math.sin(th)];},44,12,{uS:R/4,vS:2,hole:holeFn(d*.8,sd+2,null,1.3)}));
  for(let k=0;k<8;k++){const th=(k+.5)/8*TAU;
   hangPut(P,d>0?'boxR':'boxW',[R*Math.cos(th),y-R*.30,R*Math.sin(th)],qEuler(0,-th,0),[R*.30,R*.34,R*.22],null);
   hangPut(P,d>0?'winSmD':'winSmI',[R*1.16*Math.cos(th),y-R*.30,R*1.16*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.15,R*.15,1],null);}
  return P;},
 // --- the chandelier, explicitly: a hub with pendant arms ------------------
 cluster(R,d,sd){const P=hangParts();const y=-R*1.3;
  P.s.push(hangBall(R*.5,22,12,holeFn(d*.7,sd+4,null,2)).translate(0,y-R*.5,0));
  for(let k=0;k<5;k++){const th=k/5*TAU+.3,ar=R*rr(.85,1.25),dy=-R*rr(.5,1.5);
   const ax=Math.cos(th)*ar,az=Math.sin(th)*ar;
   hangPut(P,d>0?'strutR':'strutW',[ax*.5,y-R*.5,az*.5],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.06,R*.06,ar],null);
   hangPut(P,'boxD',[ax,y-R*.5+dy*.5,az],null,[R*.035,Math.abs(dy),R*.035],null);
   const sr=R*rr(.22,.40);
   P.s.push(hangBall(sr,18,10,holeFn(d*.9,sd+10+k,null,2)).translate(ax,y-R*.5+dy-sr*2,az));
   for(let j=0;j<5;j++){const t2=j/5*TAU;
    hangPut(P,d>0?'ovalD':'ovalI',[ax+sr*1.02*Math.cos(t2),y-R*.5+dy-sr,az+sr*1.02*Math.sin(t2)],qFacing([Math.cos(t2),0,Math.sin(t2)]),[sr*.3,sr*.24,1],null);}}
  return P;},
 // --- THE PRISON ------------------------------------------------------------
 // Alienating by refusing what every other payload offers. No gallery, no
 // balcony, no visible door. Its openings are slits, too high and far too few
 // for its size, and where the others glow warm its handful of lit cells are
 // cold. An external cage is clamped over it, plainly added and plainly not for
 // the benefit of whoever is inside. Beneath it hangs a dense bunch of cell
 // pods, each barely bigger than a person: the building is a thing that holds
 // other, smaller things.
 prison(R,d,sd){const P=hangParts();const H=R*2.3,y=-R*1.0;
  // a blunt mass that OVERHANGS as it descends — heavier at the bottom, so it
  // reads as bearing down rather than sitting
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,t=v;
   const r=R*(.62+.38*Math.pow(t,.7))*se(th,6);
   return[r*Math.cos(th),y-H*t,r*Math.sin(th)];},48,16,{uS:R/3,vS:6,hole:holeFn(d*.55,sd+5,null,1.1)}));
  P.k.push(gridSurface((u,v)=>{const th=u*TAU,t=v;const r=R*(.62+.38*Math.pow(t,.7))*se(th,6)*.93;
   return[r*Math.cos(th),y-H*t,r*Math.sin(th)];},24,6,{}));
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,r=R*se(th,6)*v;return[r*Math.cos(th),y-H,r*Math.sin(th)];},48,3,{uS:R/3,vS:2}));
  // the cage: ribs clamped over the shell, meeting at a collar
  for(let k=0;k<8;k++){const th=k/8*TAU;
   const r0=R*.62*se(th,6),r1=R*se(th,6);
   hangPut(P,d>0?'strutR':'strutW',[Math.cos(th)*(r0+r1)*.52,y-H*.5,Math.sin(th)*(r0+r1)*.52],
    qEuler(0,-th,0).multiply(qEuler(0,0,Math.atan2(r1-r0,H))),[R*.07,H*1.06,R*.10],null);}
  for(const t of [.30,.62,.92]){const r=R*(.62+.38*Math.pow(t,.7))*1.02;
   hangPut(P,d>0?'ringR':'ringW',[0,y-H*t,0],qEuler(Math.PI/2,0,0),[r,r,R*.10],null);}
  // slits: high, narrow, and far too few. Cold light, never warm.
  for(let k=0;k<10;k++){const th=rng()*TAU,t=rr(.12,.42);
   const r=R*(.62+.38*Math.pow(t,.7))*se(th,6)*1.01;
   hangPut(P,d>0?'winSmD':'winSmI',[r*Math.cos(th),y-H*t,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.035,R*.16,1],null);
   if(d===0&&rng()<.4)hangPut(P,'dot',[r*1.04*Math.cos(th),y-H*t,r*1.04*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.05,R*.05,1],CYAN);}
  // cell pods slung underneath in a bunch
  for(let k=0;k<14;k++){const th=rng()*TAU,rad=R*rr(.12,.78),cy=y-H-R*rr(.28,1.05),cr=R*rr(.075,.125);
   const cx=Math.cos(th)*rad,cz=Math.sin(th)*rad;
   hangPut(P,'boxD',[cx,(y-H+cy+cr)*.5,cz],null,[R*.016,Math.abs(y-H-cy-cr),R*.016],null);
   P.s.push(hangBall(cr,12,7,d>0?holeFn(1,sd+40+k,null,3):null).translate(cx,cy-cr,cz));
   hangPut(P,d>0?'winSmD':'winSmI',[cx,cy,cz+cr*1.02],qFacing([0,0,1]),[cr*.5,cr*.5,1],null);}
  // a winch where anything else would have a stair
  hangPut(P,d>0?'boxR':'boxW',[0,y+R*.16,0],null,[R*.5,R*.3,R*.5],null);
  hangPut(P,'tube',[0,y+R*.16,0],qEuler(0,0,Math.PI/2),[R*.12,R*.62,R*.12],null);
  return P;},
};

function buildCanyon(scene,gx,gz,d){reseed(9320+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Canyon works — the Span ('+(d===2?'fallen':STATE(d))+')',x:0,z:0,r:1250,h:600});
 // A gorge, not a trough: deep relative to its width. The first pass was
 // 1640 wide by 560 deep and read as two low mesas with a plain between them.
 const GAP=700,WALL=460,CH=900,LEN=1900;
 const SH=[],GL=[],DK=[];
 // ---------------------------------------------------------------- the gorge
 for(const s of [-1,1]){const CX=s*(GAP+WALL/2);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN,y=v*CH;
   const inner=-s*(WALL/2-52*fbm(u*11,v*7,9321+s,3)-34*(1-v)*(1-v)-18*fbm(u*29,v*3,9322,2));
   return[CX+inner,y,z];},70,26,{uS:46,vS:16}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN;return[CX+(v-.5)*WALL*1.6,CH+26*fbm(u*9,v*9,9323+s,2),z];},54,10,{uS:46,vS:22}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN;return[CX+s*WALL*.8,v*CH,z];},32,6,{}),MAT.rock,G);}
 mesh(gridSurface((u,v)=>{const x=(u-.5)*GAP*2.1,z=-LEN/2+v*LEN;
  return[x,2+9*fbm(u*7,v*7,9324,3)-4*Math.exp(-Math.pow(x/260,2)),z];},40,40,{uS:26,vS:26}),d>0?MAT.mud:MAT.rock,G);
 // ---------------------------------------------------------------- the spans
 // Each entry is a pipe and what hangs from it. Swapping a payload, moving it
 // along the pipe or changing its drop is an edit HERE and nowhere else.
 const SPANS=[
  // drop + the payload's own reach must clear the canyon floor. Reach below the
  // cable runs about 2.5R (ring) to 5.6R (prism); the prison is 4.4R and the
  // largest payload, so it gets the shortest drop of the three on its span.
  {y:780,z:-430,r:22,sag:30,hangs:[
   {t:'pod',    u:.20,drop:150,R:52,sd:11},
   {t:'cluster',u:.47,drop:120,R:66,sd:23},
   {t:'pod',    u:.74,drop:200,R:40,sd:31}]},
  {y:660,z:  40,r:26,sag:38,hangs:[
   {t:'drum',   u:.17,drop:110,R:54,sd:43},
   {t:'prison', u:.50,drop:120,R:92,sd:57},
   {t:'ring',   u:.83,drop:160,R:62,sd:67}]},
  {y:540,z: 470,r:18,sag:24,hangs:[
   {t:'prism',  u:.26,drop:120,R:46,sd:73},
   {t:'pod',    u:.58,drop: 90,R:36,sd:83},
   {t:'lift',   u:.86,drop:520,R:22,sd:91}]},
 ];
 const pipeY=(S,t)=>S.y-S.sag*4*t*(1-t);           // a dead-straight pipe reads as a prop
 const X0=-(GAP+8),X1=GAP+8;
 SPANS.forEach((S,si)=>{
  const broke=d===2&&si===1;                        // one pipe has parted
  for(let seg=0;seg<2;seg++){
   const a=seg?.54:0,b=seg?1:.46;
   if(broke&&seg===1)continue;
   SH.push(gridSurface((u,v)=>{const t=lerp(a,b,u),th=v*TAU;
    return[lerp(X0,X1,t),pipeY(S,t)+S.r*Math.sin(th),S.z+S.r*Math.cos(th)];},44,16,{uS:60,vS:S.r/2,
    hole:holeFn(d*.5,9325+si,null,1.5)}));}
  if(broke){  // the far half, torn loose and hanging off the wall
   const F=new THREE.Group();F.position.set(lerp(X0,X1,.78),pipeY(S,.78)-70,S.z);F.rotation.set(.12,0,-.52);G.add(F);
   mesh(gridSurface((u,v)=>{const t=u,th=v*TAU;return[t*430,S.r*Math.sin(th),S.r*Math.cos(th)];},22,14,{uS:60,vS:S.r/2,hole:holeFn(1,9326+si,null,1.2)}),MAT.rust,F);}
  // flanges and a walkway rail along the top
  for(let k=0;k<=18;k++){const t=k/18;if(broke&&t>.5)continue;
   kput(d>0?'ringR':'ringW',[lerp(X0,X1,t),pipeY(S,t),S.z],null,[S.r*1.1,S.r*1.1,S.r*.16],null);}
  for(let k=0;k<26;k++){const t=k/26,t2=(k+1)/26;if(broke&&t>.48)continue;
   beam(d>0?'strutR':'strutW',[lerp(X0,X1,t),pipeY(S,t)+S.r*1.02,S.z],[lerp(X0,X1,t2),pipeY(S,t2)+S.r*1.02,S.z],1.4,S.r*.5);}
  // ------------------------------------------------------------ the payloads
  S.hangs.forEach(o=>{
   const ax=lerp(X0,X1,o.u),ay=pipeY(S,o.u)-S.r,az=S.z;
   if(o.t==='lift'){liftTrack(G,SH,DK,ax,ay,az,o.drop,d);return;}
   const fallen=d===2&&(o.t==='pod'&&o.sd===31||o.t==='ring'||o.t==='prism');
   const P=HANG[o.t](o.R,d,o.sd);
   if(fallen){
    // cable snapped: the payload is on the canyon floor, broken open
    const F=new THREE.Group();F.position.set(ax+rr(-140,140),0,az+rr(-120,120));
    F.rotation.set(rr(-.5,.5),rng()*TAU,rr(.6,1.6));G.add(F);
    const fs=[],fg=[],fk=[];hangEmit(P,new THREE.Matrix4(),fs,fg,fk);
    meshMerged(fs,MAT.rust,F);meshMerged(fk,MAT.guts,F);
    dropFragment(F,0,o.R*.22);
    // the snapped cable still hanging from the pipe
    beam('boxD',[ax,ay,az],[ax+rr(-30,30),ay-o.drop*rr(.5,.9),az+rr(-30,30)],2.2,2.2);
    rubbleRing(F.position.x,0,F.position.z,o.R*.5,o.R*2.4,70,3);
    return;}
   // hung: slight sway when rusted, plumb when intact
   const tilt=d>0?rr(-.09,.09):0;
   const M=new THREE.Matrix4().compose(new THREE.Vector3(ax,ay-o.drop,az),
    qEuler(tilt,rng()*TAU,tilt*.7),new THREE.Vector3(1,1,1));
   hangEmit(P,M,SH,GL,DK);
   // the cables: one heavy pair, plus guys to steady it
   for(const sg of [-1,1])beam(d>0?'strutR':'strutW',[ax+sg*o.R*.10,ay,az],[ax+sg*o.R*.16,ay-o.drop,az],2.6,2.6);
   for(let k=0;k<3;k++){const th=k/3*TAU+.4;
    beam('boxD',[ax,ay-2,az],[ax+Math.cos(th)*o.R*.8,ay-o.drop+o.R*.2,az+Math.sin(th)*o.R*.8],1.1,1.1);}
   if(d>0){vinesOnRing(ax,ay-o.drop+o.R*.3,az,o.R*.95,Math.round(o.R*.5),o.R*1.3);
    mossOnRing(ax,ay-o.drop+o.R*.2,az,o.R*.9,Math.round(o.R*.4),o.R*.05);}});});
 meshMerged(SH,skin,G);meshMerged(DK,d>0?MAT.guts:MAT.dark,G);
 GL.forEach(g=>mesh(g,d>0?MAT.guts:MAT.glass,G));
 if(d>0){scatterMoss(0,0,0,0,GAP*1.6,180,3.4);trees(0,0,120,GAP*1.5,26);
  rubbleRing(0,0,0,GAP*.3,GAP*1.4,90,3);}
 figures(0,-300,8,120);figures(240,420,6,90);
 KOFF=[0,0,0];return G;}

// The climbing elevator. One hanger's cable is a TRACK: a heavy twin cable with
// a rack between, a guide rail, and a counterweight on the return side. There is
// no animation system in this kit, so the car is parked — but at a different
// height in each variant, so across the three it reads as a thing that moves.
function liftTrack(G,SH,DK,ax,ay,az,drop,d){
 const bot=4,H=ay-bot;
 for(const sg of [-1,1])beam(d>0?'strutR':'strutW',[ax+sg*5,ay,az],[ax+sg*5,bot,az],2.4,2.4);
 for(let k=0;k*9<H;k++)kput(d>0?'boxR':'boxW',[ax,ay-k*9,az],null,[9,1.1,1.6],null);   // rack teeth
 kput(d>0?'boxR':'boxW',[ax,ay+6,az],null,[26,10,18],null);                            // winch house
 kput('tube',[ax,ay+6,az],qEuler(0,0,Math.PI/2),[5,28,5],null);
 const cw=d===2?bot+30:ay-drop*.35;                                                     // counterweight
 kput('boxD',[ax+11,cw,az],null,[6,14,6],null);
 beam('boxD',[ax+11,ay,az],[ax+11,cw,az],1.2,1.2);
 // the car
 const cy=d===0?ay-drop*.45:d===1?ay-drop*.86:bot+9;
 const CR=13;
 const C=new THREE.Group();C.position.set(ax,cy,az);
 if(d===2)C.rotation.set(.5,.7,1.1);                                                    // crashed at the foot
 G.add(C);
 mesh(lathe({rFn:()=>CR,H:CR*1.5,nu:20,nv:5,hole:holeFn(d*.8,9328,null,2)}),SHELL(d),C,0,-CR*.75,0);
 mesh(lathe({rFn:()=>CR*.88,H:CR*1.5,nu:12,nv:2}),d>0?MAT.guts:MAT.dark,C,0,-CR*.75,0);
 for(let k=0;k<6;k++){const th=k/6*TAU;
  kput(d>0?'winSmD':'winSmI',[ax+CR*1.02*Math.cos(th),cy-CR*.75+CR*.75,az+CR*1.02*Math.sin(th)],
   qFacing([Math.cos(th),0,Math.sin(th)]),[CR*.3,CR*.34,1],null);}
 if(d===2){rubbleRing(ax,0,az,10,60,50,2.6);
  beam('boxD',[ax-5,ay,az],[ax-5+rr(-40,40),bot+rr(20,90),az+rr(-40,40)],2.4,2.4);}   // snapped track
 else kput('dot',[ax,cy-2,az+CR*1.05],qFacing([0,0,1]),[CR*.5,CR*.3,1],WARM);}
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
 mossOnRing(C.x,H*.06,C.z,R*.97,Math.round(R*.7),R*.035);
 vinesOnRing(C.x,H*.45,C.z,prof(H*.45)*1.02,Math.round(R*.35),R*.5);
 rubbleRing(C.x,0,C.z,R*1.0,R*1.5,Math.round(R*.7),R*.035);
 return prof;}

// A cross-section of what was inside: floor plates cut off at the break, a
// double-loaded corridor, ward rooms and lab rooms, and service cores running
// the full height. This is the kit's first real interior — the original brief
// has wanted one behind every opening since the start, and this is the same
// machinery, so it is written to be reusable rather than fitted to one dome.
function sectionInterior(C,R,H,d,sd){
 const {DK,G}=C;const FH=4.6;
 for(let f=1;f*FH<H*.86;f++){const y=f*FH,rr0=R*Math.pow(clamp(1-Math.pow(y/H,2),0,1),.58)*.9;
  if(rr0<R*.16)break;
  // floor plate
  DK.push(gridSurface((u,v)=>{const th=u*TAU,r=rr0*v;return[C.x+r*Math.cos(th),y,C.z+r*Math.sin(th)];},40,5,{uS:R/6,vS:3}));
  // a double-loaded corridor: rooms, gangway, rooms
  for(const ring of [.42,.80]){
   DK.push(lathe({rFn:()=>rr0*ring,H:FH*.82,nu:36,nv:2,
    hole:(u,y2)=>((u*22)%1)<.34}).translate(C.x,y,C.z));}
  // room fit-out, alternating wards and labs by floor
  const ward=(f%2)===0,n=Math.max(6,Math.round(rr0*.26));
  for(let k=0;k<n;k++){const th=(k+.5)/n*TAU,r=rr0*.61;
   const px=C.x+r*Math.cos(th),pz=C.z+r*Math.sin(th),q=qEuler(0,-th,0);
   if(ward){ // beds in rows, a curtain rail over each
    for(const sg of [-1,1])kput('boxD',[px+Math.cos(th+1.57)*sg*rr0*.09,y+.5,pz+Math.sin(th+1.57)*sg*rr0*.09],q,[2.0,.9,.9],null);
    kput(d>0?'pipeR':'pipe',[px,y+2.4,pz],qEuler(0,-th,Math.PI/2),[.09,rr0*.26,.09],null);}
   else{     // benches, and a bank of specimen tanks against the corridor wall
    kput('boxD',[px,y+.9,pz],q,[rr0*.20,.22,1.1],null);
    for(let j=-1;j<=1;j++)kput(d>0?'colR':'colW',[px+Math.cos(th+1.57)*j*1.5,y+1.5,pz+Math.sin(th+1.57)*j*1.5],null,[.42,2.2,.42],null);}
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
 const DR=110,DH=95;                       // the great dome — see the note above
 REGISTER({name:'Dalab — the ancient lab ('+STATE(d)+')',x:0,z:0,r:300,h:DH+30});
 REGISTER({name:'Dalab — the great dome',x:0,z:0,r:DR+8,h:DH+22});
 const C={SH:[],DK:[],G,x:0,z:0};
 // the great dome, broken open on its south-east quarter
 dalabDome(C,DR,DH,d,9331,{u:.16,w:.115,y0:.10});
 sectionInterior(C,DR,DH,d,9332);
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
            [-192,26,29,27,0],[-138,-148,37,33,0],[54,-186,24,23,0],[205,88,31,28,0]];
 SAT.forEach((s,i)=>{const [sx,sz,sr,sh,brk]=s;
  const SC={SH:C.SH,DK:C.DK,G,x:sx,z:sz};
  REGISTER({name:'Dalab — dome '+(i+2),x:sx,z:sz,r:sr+6,h:sh+14});
  dalabDome(SC,sr,sh,d,9340+i*7,brk?{u:rr(0,1),w:.10,y0:.12}:null);
  if(brk)sectionInterior(SC,sr,sh,d,9350+i*5);
  // the passageway in: part buried, ribbed, with a clerestory along the top
  const a=Math.atan2(sz,sx),L=Math.hypot(sx,sz)-sr*.9-DR*.9;
  if(L>10){const mx=Math.cos(a)*(DR*.9+L/2),mz=Math.sin(a)*(DR*.9+L/2);
   C.SH.push(lathe({rFn:()=>7.5,H:L,nu:14,nv:Math.round(L/6),hole:holeFn(d*.8,9360+i,null,1.6)})
    .rotateZ(Math.PI/2).rotateY(-a).translate(mx,5.5,mz));
   for(let k=0;k<Math.round(L/9);k++){const t=(k+.5)/Math.round(L/9);
    const px=Math.cos(a)*(DR*.9+L*t),pz=Math.sin(a)*(DR*.9+L*t);
    kput(d>0?'ringR':'ringW',[px,5.5,pz],qEuler(0,-a,Math.PI/2),[8.2,8.2,1.1],null);
    if(rng()<.5)kput(d>0?'winSmD':'winSmI',[px,12.4,pz],qFacing([0,1,0]),[2.4,2.4,1],null);}
   mossOnRing(mx,11.5,mz,L*.38,Math.round(L*.22),1.5);}});
 // the low ruined wall round the compound, breached in places
 for(let k=0;k<96;k++){const th=k/96*TAU,r=292+12*fbm(k*.14,2.2,9370,2);
  if(fbm(k*.09,1.1,9371,2)<.30)continue;                     // breaches
  kput(BOXC(d),[Math.cos(th)*r,rr(1.4,3.4),Math.sin(th)*r],qEuler(0,-th,0),[rr(6,13),rr(2.8,6.8),rr(2.6,4.4)],null);}
 apron(G,0,0,300,352,d,1.6);
 scatterMoss(0,0,0,0,330,300,3.2);trees(0,0,150,420,46);
 rubbleRing(0,0,0,150,330,150,2.8);
 figures(0,260,10,60);figures(-210,-80,6,40);
 meshMerged(C.SH,skin,G);meshMerged(C.DK,MAT.guts,G);
 KOFF=[0,0,0];return G;}
// ================================================================= HOUSES D/E/F
function buildHouses2(scene,gx,gz,d){reseed(9410+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 // D — apse house (Arcosanti): concrete quarter-sphere open to +z, glass front wall
 {REGISTER({name:'House D — apse house ('+STATE(d)+')',x:0,z:0,r:14,h:12});kput(SLABC(d),[0,.3,0],null,[12,.6,12],null);
  const R=9;mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:48,nv:16,hole:(u,y)=>Math.sin(u*TAU)>.05||(d>0&&fbm(u*6,y*.3,150,2)<.3)||(Math.hypot(u-.75,y/R-.5)<.07)}),CONC(d),G,0,.6,0);
  mesh(lathe({rFn:y=>R*.94*Math.sqrt(clamp(1-Math.pow(y/R,2),0,1)),H:R,nu:24,nv:8,hole:(u,y)=>Math.sin(u*TAU)>.05}),MAT.dark,G,0,.6,0);
  if(d===0)mesh(gridSurface((u,v)=>{const x=(u-.5)*R*1.9;const y=v*R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));return[x,.6+y,0];},20,6,{}),MAT.glass,G);
  for(let k=-3;k<=3;k++){const x=k*2.4;const h=R*.95*Math.sqrt(clamp(1-Math.pow(x/R,2),0,1));kput(d>0?'mullR':'mullW',[x,.6+h/2,0],null,[.6,h,.6],null);}
  kput('archOpen',[3,2.2,.1],qFacing([0,0,1]),[.35,.45,1],null);kput(SLABC(d),[3,.2,8],null,[2.5,.4,2.5],null);
  kput(BOXC(d),[-7,1.6,3],null,[4,.5,5],null);for(let k=0;k<6;k++){const a=Math.PI+(k+.5)/6*Math.PI;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*4.5,5,Math.sin(a)*4.5],qEuler(0,-a,0),[2,1,1],lit?CYAN:DEAD);}if(d>0){mossOnRing(0,.7,0,9,14,1.2);vinesOnRing(0,7,0,5,6,6);}}
 // E — bridge house: a glass box spanning two concrete piers
 {const bx=60;REGISTER({name:'House E — bridge house ('+STATE(d)+')',x:bx,z:0,r:16,h:12});
  for(const s of [-1,1]){mesh(lathe({rFn:y=>2.6*Math.sqrt(1+1.2*Math.pow((y-4)/4,2)),H:8,nu:20,nv:6,hole:holeFn(d*.5,160+s,null,3)}),CONC(d),G,bx+s*9,0,0);}
  kput(BOXC(d),[bx,8.3,0],null,[26,.7,8],null);kput(BOXC(d),[bx,12.2,0],null,[27,.7,9],null);
  if(d===0){for(const s of [-1,1])kput('pane',[bx,10.2,s*4],null,[24,3.2,1],null);for(const s of [-1,1])kput('pane',[bx+s*12.5,10.2,0],qEuler(0,Math.PI/2,0),[8,3.2,1],null);}
  else{kput('boxD',[bx,10.2,0],null,[22,3,6],null);}
  for(let k=-2;k<=2;k++)kput(d>0?'mullR':'mullW',[bx+k*6,10.2,4.1],null,[.5,3.4,.5],null);
  // stair up the east pier, door at the top
  for(let k=0;k<8;k++){const a=Math.PI/2-(7-k)*.7;kput(BOXC(d),[bx+9+4.5*Math.cos(a),k*1.05+.5,4.5*Math.sin(a)],qEuler(0,-a,0),[3,.4,1.6],null);}kput(BOXC(d),[bx+9,8.7,4.6],null,[3,.4,1.6],null);kput('archOpen',[bx+9,9.9,4.3],qFacing([0,0,1]),[.3,.36,1],null);
  stripRing(bx,11.6,0,3,d,8);if(d>0){mossOnRing(bx,.3,0,10,10,1.2);vinesOnRing(bx,12.5,0,12,8,8);}}
 // F — terrace house: three stepped concrete trays into a slope, glass fronts, planters
 {const fx=130;REGISTER({name:'House F — terrace house ('+STATE(d)+')',x:fx,z:0,r:16,h:12});
  mesh(lathe({rFn:y=>16-1.4*y,H:9,nu:6,nv:2}),MAT.rock,G,fx,0,-8);
  for(let t=0;t<3;t++){const y=t*3.6,z=6-t*5,w=16-t*3;kput(BOXC(d),[fx,y+.3,z],null,[w,.6,9],null);kput(BOXC(d),[fx,y+3.4,z-1],null,[w+1,.5,8],null);
   if(d===0)kput('pane',[fx,y+1.9,z+3.8],null,[w-2,2.6,1],null);else kput('boxD',[fx,y+1.9,z+1],null,[w-3,2.6,5],null);
   for(let k=-1;k<=1;k++)kput(d>0?'mullR':'mullW',[fx+k*(w/2-1.5),y+1.9,z+3.9],null,[.5,2.8,.5],null);
   kput('brick',[fx,y+1.9,z-3.6],null,[w,2.8,.5],null);for(const s of [-1,1])kput('brick',[fx+s*(w/2-.25),y+1.9,z],null,[.5,2.8,8.4],null);kput(BOXC(d),[fx-w/2+1.5,y+3.9,z+3],null,[3,.8,2],null);
   for(let k=0;k<3;k++)kput('moss',[fx-w/2+1+k*.8,y+4.4,z+3],null,[1,.5,1],new THREE.Color().setHSL(.28,.5,.2));}
  kput('archOpen',[fx+4,1.9,10.6],qFacing([0,0,1]),[.3,.36,1],null);for(let k=0;k<4;k++)kput(BOXC(d),[fx-7,1.2+k*.9,9-k*1.4],null,[2,.3,1.4],null);
  stripRing(fx,3,6,4,d,8);if(d>0){mossOnRing(fx,.6,6,8,14,1.3);}}
 figures(30,14,4,4);KOFF=[0,0,0];return G;}

// ================================================================= VELADIGA (after Soleri, 1965)
// Soleri's other dam arcology, and formally the opposite of Theodiga. Theodiga
// is a straight wall with a cruciform of fins stuck on its face. Veladiga is an
// ARC in plan, and its whole downstream elevation is a row of colossal
// shield-shaped bays — arched over the top, sides sloping in to a flat sill —
// each a recessed cliff packed with dwellings, divided by splayed faceted
// piers. Height 250 m, population 15 000, per the sheet.
//
// The bay shape is defined ONCE and used three ways: it punches the face, its
// complement punches the recessed panel 46 m behind, and walking its outline
// sweeps the reveal between the two. That is what makes the bays read as deep
// pockets rather than shapes painted on a wall, and the arch soffit falls out
// of it for free.
function buildVeladiga(scene,gx,gz,d){reseed(9380+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=SHELL(dd);
 // A DAM HAS TO REACH THE ROCK. At RA=760/A=1.0 the abutments stopped 130-220 m
 // short of the canyon walls and the reservoir would simply have flowed round
 // the ends. Half-span is now 841 against an inner rock face at 759-841, so the
 // arc dies into the cliff at both ends.
 const H=250,RA=1000,A=1.0,NB=12,HALF=RA*Math.sin(A);
 REGISTER({name:'Veladiga — dam arcology ('+(d===2?'breached':STATE(d))+')',x:0,z:230,r:1000,h:H+110});
 const th_=y=>34+120*(1-y/H);
 const fp=(t,y,back)=>{const a=lerp(-A,A,t),s=Math.sin(a),c=Math.cos(a),o=th_(y)-(back||0);
  return[RA*s-s*o,y,RA*(1-c)+c*o];};
 const nd=t=>{const a=lerp(-A,A,t);return[-Math.sin(a),0,Math.cos(a)];};
 // ---- the shield-shaped bay ----------------------------------------------
 const SW=.84,SB=.50,Y0=70,Ys=155,Y1=226;
 const shTop=s=>Ys+(Y1-Ys)*Math.sqrt(clamp(1-Math.pow(s/SW,2),0,1));
 const shBot=s=>{const as=Math.abs(s);return as<=SB?Y0:Y0+(as-SB)/(SW-SB)*(Ys-Y0);};
 const inBay=(s,y)=>Math.abs(s)<SW&&y>shBot(s)&&y<shTop(s);
 const bayS=t=>{const i=Math.floor(clamp(t,0,.9999)*NB);return 2*(t*NB-i)-1;};
 const outl=p=>{
  if(p<.50){const s=lerp(-SW,SW,p/.50);return[s,shTop(s)];}
  if(p<.62){const q=(p-.50)/.12;return[lerp(SW,SB,q),lerp(Ys,Y0,q)];}
  if(p<.88){const q=(p-.62)/.26;return[lerp(SB,-SB,q),Y0];}
  const q=(p-.88)/.12;return[lerp(-SB,-SW,q),lerp(Y0,Ys,q)];};
 // the bay's opening half-width at a given height — the piers are its complement
 const sOpen=y=>{if(y<=Y0||y>=Y1)return 0;
  if(y<=Ys)return SB+(y-Y0)/(Ys-Y0)*(SW-SB);
  return SW*Math.sqrt(clamp(1-Math.pow((y-Ys)/(Y1-Ys),2),0,1));};
 // ---- THE BREACH ----------------------------------------------------------
 // A hole in a full dam does not stay a hole. The head behind it is 200 m of
 // water, and the jet erodes upward and outward until the notch is open to the
 // crest — dam failures unzip to the top, widening as they go, and scour the
 // foundation out beneath. So this is a ragged notch, WIDER AT THE TOP, severing
 // the crest completely and cutting down almost to the riverbed.
 const BT=.355,BW=.052,BFLOOR=12;
 const blast=d===2?(t,y)=>{const rag=.34*fbm(t*22+y*.004,y*.045,9381,3)-.17;
  const w=BW*(.40+1.35*clamp(y/H,0,1))*(1+rag*1.5);
  return Math.abs(t-BT)<w&&y>BFLOOR+rag*46;}:()=>false;
 const bx0=fp(BT,60,0)[0],bz0=fp(BT,60,0)[2];        // where the water came out
 // the washout: everything downstream of the notch is gouged into a channel
 const scour=(x,z)=>{if(d!==2)return 0;
  const w=150+Math.max(0,z-bz0)*.42;
  return-30*Math.exp(-Math.pow((x-bx0)/w,2))*clamp((z-bz0+60)/220,0,1);};
 const REC=46,FACE=[],PANEL=[],REV=[],PIER=[],DK=[];
 // ---- face, recessed panels, reveals --------------------------------------
 FACE.push(gridSurface((u,v)=>fp(u,v*H,0),NB*18,76,{uS:64,vS:16,
  hole:(u,v)=>{const y=v*H;return inBay(bayS(u),y)||blast(u,y);}}));
 FACE.push(gridSurface((u,v)=>{const a=lerp(-A,A,u),s=Math.sin(a),c=Math.cos(a);
  return[RA*s,v*H,RA*(1-c)];},NB*7,28,{uS:64,vS:16,hole:(u,v)=>blast(u,v*H)}));
 PANEL.push(gridSurface((u,v)=>fp(u,v*H,REC),NB*13,60,{uS:44,vS:12,
  hole:(u,v)=>{const y=v*H;return !inBay(bayS(u),y)||blast(u,y);}}));
 for(let i=0;i<NB;i++)REV.push(gridSurface((p,w)=>{const o=outl(p);
  return fp((i+(o[0]+1)/2)/NB,o[1],w*REC);},112,3,{uS:24,vS:2,
  hole:d===2?(p,w)=>{const o=outl(p);return blast((i+(o[0]+1)/2)/NB,o[1]);}:null}));
 // ---- the dwelling mosaic -------------------------------------------------
 for(let i=0;i<NB;i++)for(let cy=Y0+7;cy<Y1-5;cy+=6)for(let cs=-SW+.05;cs<SW;cs+=.07){
  if(!inBay(cs,cy))continue;
  const t=(i+(cs+1)/2)/NB;if(blast(t,cy))continue;
  if(rng()<.12)continue;
  const p=fp(t,cy,REC-2.2);
  const lit=d===2?rng()<.03:rng()<.62;
  kput('cell',p,qFacing(nd(t)),[7,4.4,1],lit?(rng()<.55?WARM:CYAN).clone().multiplyScalar(rr(.4,.95)):(dd?DEAD:new THREE.Color(0x18293a)));}
 // ---- PIERS: swept faceted buttresses, not stacked boxes -------------------
 // Their width is the complement of the bay opening, so they pinch to a waist
 // where the arches spring and flare above and below — which is what makes two
 // neighbouring piers read as the X-shaped masonry of the sheet.
 const pierHW=y=>Math.max(.11,1-sOpen(y));
 const pierPR=y=>20+50*clamp(1-Math.abs(y-Ys)/158,0,1);
 const sec=(u,hw,pr)=>{const P=[[-hw,0],[-hw*.55,pr],[0,pr*1.2],[hw*.55,pr],[hw,0]];
  const q=clamp(u,0,1)*4,i0=Math.min(3,Math.floor(q)),f=q-i0;
  return[lerp(P[i0][0],P[i0+1][0],f),lerp(P[i0][1],P[i0+1][1],f)];};
 for(let i=0;i<=NB;i++){const ti=i/NB;
  PIER.push(gridSurface((u,v)=>{const y=v*H,c=sec(u,pierHW(y),pierPR(y));
   return fp(ti+c[0]/(2*NB),y,-c[1]);},26,62,{uS:12,vS:16,
   hole:d===2?(u,v)=>blast(ti,v*H):null}));}
 // ---- base: battered plinth, storage and automated industry ---------------
 FACE.push(gridSurface((u,v)=>fp(u,v*Y0,-22*(1-v)),NB*9,12,{uS:64,vS:6,
  hole:(u,v)=>blast(u,v*Y0)}));
 for(let i=0;i<NB*2;i++){const t=(i+.5)/(NB*2);if(blast(t,30))continue;
  const p=fp(t,26,-30),n=nd(t);
  kput(BOXC(dd),[p[0],26,p[2]],qFacing(n),[44,46,44],null);
  kput('boxD',[p[0],26,p[2]],qFacing(n),[42,44,42],null);
  const q=fp(t,8,-52),a=lerp(-A,A,t);
  for(let j=0;j<3;j++)kput('archOpen',[q[0]+(j-1)*13*Math.cos(a),8,q[2]+(j-1)*13*Math.sin(a)],qFacing(n),[1.2,1.05,1.7],null);}
 // ---- CREST ---------------------------------------------------------------
 // Everything up here used to hang in mid air: the highway band sat 16 m above
 // a crest deck only 34 m wide, and the promenade blocks stood 34 m BEYOND the
 // downstream face with nothing under them. The deck is now a real cantilever
 // out to 96 m, on corbels, and every block stands on it.
 FACE.push(gridSurface((u,v)=>fp(u,H,lerp(th_(H),-62,v)),NB*9,7,{uS:64,vS:7,
  hole:(u,v)=>blast(u,H)}));
 FACE.push(gridSurface((u,v)=>fp(u,H-lerp(0,9,v),-62),NB*9,2,{uS:64,vS:2,
  hole:(u,v)=>blast(u,H)}));                                    // the deck's edge beam
 for(let i=0;i<NB*4;i++){const t=(i+.5)/(NB*4);if(blast(t,H))continue;
  beam(BOXC(dd),fp(t,H-46,0),fp(t,H-6,-56),5,9);}               // corbels under the overhang
 for(let i=0;i<NB*3;i++){const t=(i+.5)/(NB*3);if(blast(t,H))continue;
  const n=nd(t),p=fp(t,H,-30);
  kput(BOXC(dd),[p[0],H+9,p[2]],qFacing(n),[24,18,26],null);
  if(i%3===0){const q=fp(t,H,-4);kput(BOXC(dd),[q[0],H+14,q[2]],qFacing(n),[28,28,30],null);
   kput(d>0?'ringR':'ringW',[q[0],H+29,q[2]],qEuler(Math.PI/2,0,0),[16,16,3],null);}
  const lit=d===2?rng()<.08:true;
  kput('strip',[p[0],H+19,p[2]],qFacing(n),[17,1,1],lit?CYAN:DEAD);}
 // the undulating highway band, sitting ON the deck
 FACE.push(gridSurface((u,v)=>{const p=fp(u,H,lerp(-30,-58,v));
  return[p[0],H+3+7*Math.sin(u*NB*Math.PI*2)+2*fbm(u*9,1.2,9382,2),p[2]];},NB*9,3,{uS:64,vS:3,
  hole:(u,v)=>blast(u,H)}));
 // ---- two circular pads on stalks, out over the water ---------------------
 for(const sg of [-1,1]){const t=.5+sg*.27,n=nd(t),bp=fp(t,H,0);
  const px=bp[0]-n[0]*250,pz=bp[2]-n[2]*250;
  kput(d>0?'colR':'colW',[px,0,pz],null,[10,H+30,10],null);
  mesh(lathe({rFn:y=>70*(1-.1*y/12),H:12,nu:9,nv:3,hole:holeFn(dd*.6,9383+sg,null,2)}),skin,G,px,H+24,pz);
  kput(SLABC(dd),[px,H+37,pz],null,[72,2.5,72],null);
  kput(dd>0?'ringR':'ringW',[px,H+50,pz],qEuler(Math.PI/2,0,0),[64,64,4],null);
  for(let k=0;k<9;k++){const a=k/9*TAU;
   kput(dd>0?'strutR':'strutW',[px+Math.cos(a)*61,H+44,pz+Math.sin(a)*61],qEuler(0,-a,0),[5,16,5],null);}
  if(sg>0)for(let k=0;k<5;k++){const a=k/5*TAU;
   beam(dd>0?'strutR':'strutW',[px+Math.cos(a)*32,H+39,pz+Math.sin(a)*32],[px,H+76,pz],4,4);}
  else mesh(lathe({rFn:y=>36*Math.sqrt(clamp(1-Math.pow(y/28,2),0,1)),H:28,nu:24,nv:8}),d===0?MAT.glass:MAT.dark,G,px,H+38,pz);
  for(let k=0;k<8;k++){const q=k/7,cx=lerp(bp[0],px,q),cz=lerp(bp[2],pz,q);
   kput(BOXC(dd),[cx,H+18,cz],qFacing(n),[15,3,36],null);
   if(k%2===0)kput(dd>0?'colR':'colW',[cx,0,cz],null,[5,H+17,5],null);}}   // the causeway now has piers
 // ---- reservoir, canyon, and the park -------------------------------------
 const WL=d===2?BFLOOR+16:H-24;
 mesh(gridSurface((u,v)=>{const a=lerp(-A,A,u),s=Math.sin(a),c=Math.cos(a);
  const w=clamp(RA*s*(1+v*.36),-820,820);
  return[w,WL,RA*(1-c)-v*820];},40,16,{}),MAT.water,G);
 for(const sg of [-1,1]){const CX=sg*1100;
  mesh(gridSurface((u,v)=>{const z=-980+u*2500,y=v*(H+170);
   const gully=32*Math.pow(Math.abs(fbm(u*17,v*3,9386+sg,3)-.5)*2,1.7);
   const strata=12*Math.sin(v*30+fbm(u*4,0,9387,2)*7);
   return[CX-sg*(330-40*fbm(u*12,v*7,9388+sg,4)-gully-strata),y,z];},96,36,{uS:44,vS:16}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-980+u*2500;return[CX+(v-.5)*660,H+170+28*fbm(u*8,v*8,9389+sg,2),z];},50,10,{uS:44,vS:22}),MAT.rock,G);}
 // the park: terraced down from the dam toe, with the outfall channel running
 // through it — and, when breached, gouged out by the washout
 // The park. Two things had to be got right here. The terraces and the outfall
 // channel are driven off ONE parameterisation, because when they had separate
 // v-ranges their steps fell out of phase and the water sat proud of the grass
 // it was supposed to be running through. And the whole surface stays above
 // y=0: the world ground plane sits at y=-0.05, so anything that dips below it
 // is simply occluded, which was the bare orange showing through the lawn.
 const pV=z=>clamp((z-150)/1340,0,1);
 const pTerr=z=>-Math.floor(pV(z)*7)*1.4;
 const pCh=z=>7-4*pV(z);
 const pY=(x,z)=>Math.max(.8,12+pTerr(z)-pCh(z)*Math.exp(-Math.pow((x-bx0*.35)/115,2))
   +3*fbm(x*.004+3,z*.004,9385,3)+scour(x,z));
 mesh(gridSurface((u,v)=>{const x=(u-.5)*2160,z=150+v*1340;return[x,pY(x,z),z];},54,42,{uS:32,vS:24}),
  d===2?MAT.mud:MAT.lawn,G);
 if(d!==2)mesh(gridSurface((u,v)=>{const x=(u-.5)*126+bx0*.35,z=170+v*1300;
  return[x,12+pTerr(z)-pCh(z)*.42,z];},10,34,{}),MAT.water,G);
 // ---- breach aftermath ----------------------------------------------------
 if(d===2){
  // The living-terrace floor plates, in section at the tear. These used to be
  // drawn as full-width shelves spanning the breach, which is the one thing
  // they would NOT do: a plate whose lateral span has been blown away is a
  // cantilever with nothing holding its free end. So each level keeps only a
  // stub off each edge of the tear, and the stub droops as it projects.
  const bhw=y=>BW*(.40+1.35*clamp(y/H,0,1));   // tear half-width in t at height y
  const ARC=RA*2*A;                            // metres per unit of t
  for(let y=Y0;y<Y1;y+=11){const hw=bhw(y);
   for(let si=0;si<2;si++){const sg=si?1:-1;
    // How far the stub survives, in METRES. Picking this as a fraction of the
    // tear width was the mistake: the tear is ~153 m half-width at the crest,
    // so a plausible-looking 0.5 fraction cantilevered the top plates 80 m into
    // the void and they read as black feathers. A few metres to ~16 is the
    // range a blown slab actually holds; under 2.5 the level went clean.
    const proj=17*fbm(y*.052,sg*3.1,9387,3)+5*rng()-3.4;
    if(proj<2.5)continue;
    const st=proj/(hw*ARC),span=.18+st,sag=proj*.42*(.5+rng());
    FACE.push(gridSurface((u,v)=>{
     const f=u*span,t=BT+sg*hw*(1.18-f);
     const g=clamp((f-.18)/Math.max(st,1e-3),0,1);  // 0 at the wall, 1 at the free end
     // droop, plus a slow warp across the depth so the slab is not a flat card
     const dy=-g*g*sag+.3*proj*g*Math.sin(v*2.3+y*.07)*fbm(u*4,v*4+y*.03,9388,2);
     return fp(t,y+dy,REC*(.15+v*1.75));},10,5,{
     // the free tip is broken, not sawn: rag it away with increasing bias
     hole:(u,v)=>{const g=clamp((u*span-.18)/Math.max(st,1e-3),0,1);
      return fbm(u*6+y*.02,v*5,9389,3)<.14+.44*g*g;}}));}}
  // plates that came down whole, lying in the scour fan
  for(let k=0;k<9;k++){const sp=Math.pow(rng(),.7);
   kput(BOXC(1),[bx0+rr(-200,200)*(.5+sp),rr(2,9),bz0+110+sp*560],
    qEuler(rr(-.5,.5),rng()*3,rr(-.5,.5)),[rr(20,46),rr(1.4,3),rr(16,40)],null);}
  rubbleRing(bx0,0,bz0+150,40,420,240,6);
  for(let k=0;k<44;k++){const sp=Math.pow(rng(),.6);            // blocks carried downstream
   kput(BOXC(1),[bx0+rr(-260,260)*(.4+sp),rr(1,11),bz0+80+sp*820],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(16,50),rr(11,30),rr(16,46)],null);}
  scatterMoss(bx0,0,bz0+240,0,520,180,3.4);
  trees(0,900,220,820,30);
  mossOnSurface(FACE,0,0,0,180,3);vinesFromLedge(FACE,0,0,0,80,30);stainsFromLedge(FACE,0,0,0,110,30);}
 else{for(let i=0;i<NB;i++){const t=(i+.5)/NB,p=fp(t,Y0-4,REC*.4);
   kput('strip',[p[0],p[1],p[2]],qFacing(nd(t)),[42,1,1],CYAN);}
  trees(0,980,240,800,26);}
 meshMerged(FACE,CONC(dd),G);meshMerged(PANEL,skin,G);
 meshMerged(REV,CONC(dd),G);meshMerged(PIER,CONC(dd),G);meshMerged(DK,MAT.guts,G);
 figures(0,760,12,150);figures(0,520,8,100);
 KOFF=[0,0,0];return G;}
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


// ================================================================= CULTURAL CENTRE — "the Wheel"
// Lifted out of Veladiga, where it sat in the park below the dam and read as a
// cluster of blocks at the wrong scale against a 250 m wall. On its own ground
// it can be what the sheet actually draws: a radial city — three concentric
// rings of halls on a stepped platform, radial spokes running out from a domed
// core, and a colonnaded plaza between them.
function buildCultural(scene,gx,gz,d){reseed(9390+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Cultural centre — the Wheel ('+STATE(d)+')',x:0,z:0,r:250,h:96});
 REGISTER({name:'Cultural centre — the great hall',x:0,z:0,r:78,h:96});
 const SH=[],DK=[];
 // Stepped platform. The terrace radii have to OVERLAP the ring they carry --
 // at 96/154/212 against rings at 104/156/208 each tier stopped short and the
 // overview showed bare ground in two annular gaps between the drums.
 const TIER=[[134,8.2],[190,5.6],[244,3.0]];
 TIER.forEach((T,k)=>{const [r,y]=T;
  kput(SLABC(d),[0,y-2.6,0],null,[r,5.2,r],new THREE.Color(d>0?0x6a5a4c:0xcfcac2));
  const nb=Math.round(r*.2);
  for(let j=0;j<nb;j++){const a2=j/nb*TAU;
   kput(BOXC(d),[Math.cos(a2)*r,y-4.4,Math.sin(a2)*r],qEuler(0,-a2,0),[7,4,3.2],null);}});
 // the domed great hall on the axis
 const CH=64,gr=y=>52*Math.pow(clamp(1-Math.pow(y/CH,2),0,1),.58);
 SH.push(lathe({rFn:gr,H:CH,flutes:18,amp:.07,sharp:2,nu:64,nv:20,
  hole:(u,y)=>(Math.cos(u*TAU*18)<.28&&y>6&&y<CH*.84)||(holeFn(d*.9,9391,null,1.3)||(()=>false))(u,y)}).translate(0,11,0));
 if(d===0)mesh(lathe({rFn:y=>gr(y)-3,H:CH,nu:40,nv:14}),MAT.glass,G,0,11,0);
 else DK.push(lathe({rFn:y=>gr(y)-5,H:CH,nu:32,nv:10,
  hole:(u,y)=>fbm(u*5,y*.09,9392,2)<.5}).translate(0,11,0));
 kput(SLABC(d),[0,11+CH,0],null,[12,2,12],null);
 if(d===0)kput('finial',[0,11+CH+8,0],null,[3.5,7,3.5],null);
 stripRing(0,20,0,50,d,30);stripRing(0,11+CH*.62,0,38,d,24);
 // Three concentric rings of halls, each ring turned against the last. Ring 1
 // renders behind the dome, so the variation that stops this reading as a tank
 // farm has to be in silhouette: every third hall is a campanile at twice the
 // height, and each drum takes a shallow dome cap rather than a flat lid.
 const RINGS=[[104,15,12,30,11],[156,19,16,26,7.4],[208,23,20,21,4]];
 RINGS.forEach((R,ri)=>{const [rad,bw,n,bh,py]=R;
  for(let k=0;k<n;k++){const a2=(k+(ri%2)*.5)/n*TAU;
   const bxp=Math.cos(a2)*rad,bzp=Math.sin(a2)*rad;
   if(d>0&&rng()<.28){rubbleRing(bxp,0,bzp,4,bw*1.6,26,2.3);continue;}
   const tall=(k%3===1),hh=bh*(tall?2.05:1)*(.88+rng()*.24),bwk=bw*(tall?.62:1);
   SH.push(lathe({rFn:()=>bwk,H:hh,flutes:6,amp:.22,sharp:1,nu:26,nv:6,
    hole:holeFn(d*.8,9393+ri*5+k,null,2)}).translate(bxp,py,bzp));
   const cap=bwk*(tall?.95:.42);
   SH.push(lathe({rFn:y=>bwk*1.04*Math.sqrt(clamp(1-Math.pow(y/cap,2),0,1)),H:cap,nu:20,nv:4,
    hole:holeFn(d*.7,9393+ri*5+k,null,1.4)}).translate(bxp,py+hh,bzp));
   if(d>0)DK.push(lathe({rFn:()=>bwk*.86,H:hh,nu:14,nv:2}).translate(bxp,py,bzp));
   for(let j=0;j<7;j++){const t2=j/7*TAU;
    kput(d>0?'winBigD':'winBigI',[bxp+bwk*1.02*Math.cos(t2),py+hh*.44,bzp+bwk*1.02*Math.sin(t2)],
     qFacing([Math.cos(t2),0,Math.sin(t2)]),[1.1,1.1,1],null);}
   if(d===0)kput('strip',[bxp,py+hh-2,bzp+bwk*1.03],qFacing([0,0,1]),[bwk*1.2,1,1],CYAN);
   // the spoke running back to the core
   beam(BOXC(d),[bxp*.42,py+2,bzp*.42],[bxp*.9,py+2,bzp*.9],6,3.4);}});
 // colonnade round the outer terrace
 for(let k=0;k<48;k++){const a=k/48*TAU;
  if(d>0&&rng()<.3)continue;
  kput(d>0?'colR':'colW',[Math.cos(a)*236,1.4,Math.sin(a)*236],null,[2.4,17,2.4],null);}
 for(let k=0;k<4;k++){const a=k/4*TAU+.4;
  kput('archOpen',[Math.cos(a)*232,9,Math.sin(a)*232],qFacing([Math.cos(a),0,Math.sin(a)]),[1.4,1.2,2],null);}
 apron(G,0,0,240,310,d,3);
 meshMerged(SH,skin,G);meshMerged(DK,MAT.guts,G);
 if(d>0){mossOnSurface(SH,0,0,0,150,2.4);vinesFromLedge(SH,0,0,0,60,16);stainsFromLedge(SH,0,0,0,50,12);
  scatterMoss(0,0,0,60,300,120,2.6);rubbleRing(0,0,0,240,330,80,2.6);trees(0,0,270,380,22);}
 figures(0,170,8,40);figures(120,-120,5,30);
 KOFF=[0,0,0];return G;}
// ================================================================= HEXAHEDRON — the double pyramid
// Soleri's sheet 28: 170 000 people, 1 100 m tall, 1 km span, the automated
// industries on a hexagon underneath. An upper pyramid and an inverted lower
// one meeting at a waist promenade, the whole mass held clear of the ground on
// a forest of vertical shafts.
//
// THE PLAN, which is the whole design. Two OBLONG isosceles triangles that
// share one base vertex, each one's base lying along one of the other's legs.
// With base angle TH the construction is exact and needs no fitting: put the
// shared vertex at the origin, send the upper triangle's leg along +x and the
// lower triangle's leg out at TH. Each base is then 2*cos(TH) long and runs up
// the other triangle's leg from that shared corner. The two are mirror partners
// about the bisector, so their tips stand well clear of one another while the
// bodies overlap across the middle.
//
// The consequence that drives the rest of the file: the two triangles do NOT
// share a centroid. Each pyramid therefore tapers about ITS OWN centre -- if
// both scaled about the world origin they would lean into each other -- so
// every plan point is (P.O + outline*s), never outline*s alone.
function buildHexahedron(scene,gx,gz,d){reseed(9430+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const SPAN=1000,YB=300,YW=620,YT=1100,SB=.17,ST=.14;
 REGISTER({name:'Hexahedron ('+STATE(d)+')',x:0,z:0,r:780,h:YT});
 REGISTER({name:'Hexahedron — the upper city',x:0,z:0,y:YW,r:740,h:YT-YW});
 REGISTER({name:'Hexahedron — the lower city',x:0,z:0,y:YB,r:740,h:YW-YB});
 REGISTER({name:'Hexahedron — the vertical structure',x:0,z:0,r:460,h:YB});
 REGISTER({name:'Hexahedron — automated industries',x:0,z:0,r:640,h:34});
 const SH=[],DK=[],GRD=[],ORCH=[],CHAM=.055;

 // ---- the two plans --------------------------------------------------------
 const TH=75*Math.PI/180,BL=2*Math.cos(TH);        // leg = 1, base = 2 cos(TH)
 const CT=Math.cos(TH),SN=Math.sin(TH);
 const triU=[[0,0],[1,0],[BL*CT,BL*SN]];           // shared vertex, apex, base corner
 const triL=[[0,0],[BL,0],[CT,SN]];                // shared vertex, base corner, apex
 const cen=T=>[(T[0][0]+T[1][0]+T[2][0])/3,(T[0][1]+T[1][1]+T[2][1])/3];
 const cU=cen(triU),cL=cen(triL),GC=[(cU[0]+cL[0])/2,(cU[1]+cL[1])/2];
 const mkPlan=(T,c)=>{const P=[];
  for(let i=0;i<3;i++){const A=[T[i][0]-c[0],T[i][1]-c[1]],B=[T[(i+1)%3][0]-c[0],T[(i+1)%3][1]-c[1]];
   P.push([lerp(A[0],B[0],CHAM),lerp(A[1],B[1],CHAM)]);
   P.push([lerp(A[0],B[0],1-CHAM),lerp(A[1],B[1],1-CHAM)]);}
  P.O=[c[0]-GC[0],c[1]-GC[1]];                     // this plan's centre, builder frame
  P.L=[0];let t=0;for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length];
   t+=Math.hypot(B[0]-A[0],B[1]-A[1]);P.L.push(t);}
  return P;};
 const PU=mkPlan(triU,cU),PL=mkPlan(triL,cL);
 // Sampled by ARC LENGTH. The legs are nearly twice the base, so an index walk
 // would crowd cells and texture on the base and stretch them along the legs.
 const pp=(P,p)=>{const L=P.L,tot=L[L.length-1],q=(p-Math.floor(p))*tot;
  let i=0;while(i<L.length-1&&L[i+1]<q)i++;
  const f=(q-L[i])/Math.max(1e-9,L[i+1]-L[i]);
  const A=P[i],B=P[(i+1)%P.length];return[lerp(A[0],B[0],f),lerp(A[1],B[1],f)];};
 // world xz of outline parameter p at taper scale s
 const W=(P,p,s)=>{const q=pp(P,p);return[(P.O[0]+q[0]*s)*SPAN,(P.O[1]+q[1]*s)*SPAN];};
 // True outward edge normal. Radial is a poor stand-in on a plan this
 // elongated -- the base edge's normal is nearly perpendicular to its radius.
 const pnorm=(P,p)=>{const a=pp(P,p-2e-4),b=pp(P,p+2e-4);
  let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  let nx=dz,nz=-dx;const m=pp(P,p);
  if(nx*m[0]+nz*m[1]<0){nx=-nx;nz=-nz;}
  return[nx,nz];};
 // outline radius along a unit direction, by ray/edge intersection
 const planR=(P,dx,dz)=>{const n=P.length;
  for(let i=0;i<n;i++){const A=P[i],B=P[(i+1)%n];
   const ex=B[0]-A[0],ez=B[1]-A[1],den=ex*dz-ez*dx;
   if(Math.abs(den)<1e-12)continue;
   const t=-(A[0]*dz-A[1]*dx)/den;
   if(t<-1e-9||t>1+1e-9)continue;
   const r=(A[0]+ex*t)*dx+(A[1]+ez*t)*dz;
   if(r>0)return r;}
  return 1;};
 // How far out a world xz point sits in the lower plan: 1.0 is on the outline.
 // Needed early, because the shafts have to be clamped under the mass and the
 // clusters are placed long before the plaza helpers are built.
 const lowRho=(x,z)=>{const vx=x/SPAN-PL.O[0],vz=z/SPAN-PL.O[1],m=Math.hypot(vx,vz);
  return m<1e-9?0:m/Math.max(1e-9,planR(PL,vx/m,vz/m));};
 const pullIn=(x,z,lim)=>{const r=lowRho(x,z);if(r<=lim)return[x,z];
  const f=lim/r;return[(PL.O[0]+(x/SPAN-PL.O[0])*f)*SPAN,(PL.O[1]+(z/SPAN-PL.O[1])*f)*SPAN];};

 // ---- decay ---------------------------------------------------------------
 // THE SCREAMERS' HEXAHEDRON. The collapse is low: it has eaten the lower city
 // from its truncated tip upward on one bearing and stopped three bands short
 // of the promenade, so the levels the tribe actually lives on are whole. The
 // upper pyramid keeps only a medium crater, punched out on the opposite side.
 // THE MAIN PLAZA, surveyed in-scene with the polygon tool. Everything inside
 // it is intact: the crater stops at its edge, nothing is scattered on it, and
 // the village lays grass and fruit trees over whatever it does not build on.
 const PLZ=[[-173.2,270.2],[-67.2,654.3],[117.6,103.1]];
 const inPlaza=(x,z)=>{let pos=0,neg=0;
  for(let i=0;i<3;i++){const A=PLZ[i],B=PLZ[(i+1)%3];
   const c=(B[0]-A[0])*(z-A[1])-(B[1]-A[1])*(x-A[0]);
   if(c>0)pos++;else neg++;}
  return pos===3||neg===3;};
 // LOWER-LEVEL DAMAGE IS OFF. Everything below the promenade -- the sheared
 // skin, the decks behind it, the interior cells, the soffit crater and the
 // failed shaft flank -- is gated on this one flag so it can be re-specified
 // from a clean slate. Set it true to bring the previous pass back.
 const LOWDMG=false;
 // ONE VERTICAL STRIP of the outer skin is torn away, top to bottom, so the
 // decks behind it are on show. Bearing -PI/2 puts it on the face the preset
 // cameras look at; it is narrow and ragged rather than a wedge, because the
 // point is to see INTO the lower city, not to remove a piece of it.
 const STRIPA=-1.5708,STRIPW=.075;
 const FAILA=1.92,wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
 const UCX=149,UCY=792,UCZ=-208,UCR=215;        // the chunk blown out up top
 // Perturbing the radius by fbm of world x,z gave a clean disc, because the
 // noise then varies with position ON the face rather than with direction
 // AROUND the hole. Two octaves in the crater's own bearing and elevation do
 // what was wanted.
 const ubite=(x,y,z)=>{if(d!==2)return false;
  const dx=x-UCX,dy=(y-UCY)*1.25,dz=z-UCZ,m=Math.hypot(dx,dy,dz);
  if(m>UCR*1.5)return false;
  const el=Math.atan2(dy,Math.hypot(dx,dz)||1e-6),bz=Math.atan2(dz,dx);
  const rag=.40*fbm(bz*2.1+3,el*2.4,9442,3)+.26*fbm(bz*7.3,el*6.1,9443,2)-.31;
  return m<UCR*(1+rag);};
 const pit=holeFn(d===2?.24:0,9433,null,.5);
 const cut=(u,y)=>(pit?pit(u,y):false);
 const cutQ=(Q,y)=>ubite(Q[0],y,Q[1]);
 const CRAT=132;

 // ---- the upper city: a stepped oblong pyramid ------------------------------
 // Setbacks are not uniform: every fifth level steps in about 2.4x as far and
 // carries no dwellings, cutting a promenade groove round the mass. Without
 // them the faces are a uniform corduroy at any distance.
 const NU=24,RU=(YT-YW)/NU,BAND=k=>k%5===0&&k>0;
 const SUL=[1];{let T=0;for(let k=1;k<=NU;k++)T+=BAND(k)?2.1:.86;
  const unit=(1-ST)/T;for(let k=1;k<=NU;k++)SUL.push(SUL[k-1]-unit*(BAND(k)?2.1:.86));}
 const su=k=>SUL[Math.min(k,NU)];
 const UP0=SH.length;
 for(let k=0;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,s0);return[Q[0],y0+v*RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>cut(u,y0+v*RU)||cutQ(W(PU,u,s0),y0+v*RU)}));
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(s0,s1,v));return[Q[0],y0+RU,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>cut(u,y0+RU)||cutQ(W(PU,u,lerp(s0,s1,v)),y0+RU)}));
  // Dwelling clusters on the tread. Heights come from ONE fbm walked along the
  // perimeter, so neighbours agree and the terrace reads as blocks of city
  // with streets cut through rather than as static.
  const nc=Math.max(7,Math.round(96*s0)),gap=Math.floor(fbm(k*.7,2.1,9438,2)*8);
  for(let j=0;j<nc;j++){const p=(j+.5)/nc;
   if(cut(p,y0+RU)||cutQ(W(PU,p,lerp(s0,s1,.5)),y0+RU))continue;
   const N=pnorm(PU,p),q=qFacing([N[0],0,N[1]]);
   if(BAND(k+1)){                                  // promenade level: parapet, no cells
    const Qe=W(PU,p,s1),Qi=W(PU,p,lerp(s0,s1,.06));
    if(j%2===0)kput(d>0?'colR':'colW',[Qe[0],y0+RU,Qe[1]],null,[2,6,2],null);
    kput(BOXC(d),[Qi[0],y0+RU+1.4,Qi[1]],q,[11,2.8,2.2],null);
    if(d!==2&&j%7===3)VEG.tree(Qi[0]-N[0]*9,y0+RU+2.8,Qi[1]-N[1]*9,j%3,rr(5,9));
    continue;}
   if(j%9===gap)continue;
   const nb=fbm(p*13,k*.29,9437,3);
   for(let row=0;row<3;row++){const Q=W(PU,p,lerp(s0,s1,.10+row*.30));
    const h=lerp(4,15,nb)*(row===0?1:.78)*rr(.86,1.14);
    kput(BOXC(d),[Q[0],y0+RU+h*.5,Q[1]],q,[rr(8,16),h,rr(6,12)],null);}
   // About a tenth of the balconies are orchards, each with its own door on to
   // the terrace. These are what the harvesters come up for.
   if(rng()<.10){const Qt=W(PU,p,lerp(s0,s1,.60)),th=rr(7,12);
    kput('trunk',[Qt[0],y0+RU,Qt[1]],null,[th*.16,th,th*.16],new THREE.Color(0x6e4e36));
    for(let b=0;b<2;b++)kput('leafy',[Qt[0]+rr(-.18,.18)*th,y0+RU+th*(.72+b*.2),Qt[1]+rr(-.18,.18)*th],
     qEuler(rng(),rng(),rng()),[th*.34,th*.26,th*.34],new THREE.Color(0x2f5a2a));
    for(let b=0;b<3;b++)kput('leafy',[Qt[0]+rr(-.26,.26)*th,y0+RU+th*rr(.64,.88),Qt[1]+rr(-.26,.26)*th],
     null,[th*.06,th*.06,th*.06],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
    const Qd=W(PU,p,s0);
    kput('doorD',[Qd[0]+N[0]*.55,y0+RU*.42,Qd[1]+N[1]*.55],q,[3.2,6,1],null);
    ORCH.push([Qt[0],y0+RU,Qt[1]]);}}
  // Windows belong to the terrace WALL -- the vertical riser below the tread.
  // They used to sit at the tread height but the riser radius, i.e. outside the
  // building, so they read as panes hung in the air among the balcony boxes.
  {const nw=Math.max(14,Math.round(255*s0)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    if(cut(p,y0+RU*.5)||cutQ(W(PU,p,s0),y0+RU*.5))continue;
    if(d>0&&rng()<.34)continue;
    const Q=W(PU,p,s0),N=pnorm(PU,p),q=qFacing([N[0],0,N[1]]);
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RU*(.20+row*.28),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}
  // sky bridges out to cantilevered pods off the promenade grooves
  if(BAND(k+1))for(let b=0;b<3;b++){const p=(b+.35)/3;
   if(cut(p,y0+RU)||cutQ(W(PU,p,s1),y0+RU))continue;
   const Q=W(PU,p,s1),N=pnorm(PU,p);
   const ex=Q[0]+N[0]*48,ez=Q[1]+N[1]*48;
   beam(BOXC(d),[Q[0],y0+RU+3,Q[1]],[ex,y0+RU+3,ez],5,2.4);
   kput(SLABC(d),[ex,y0+RU+3,ez],null,[15,2.4,15],null);
   kput(BOXC(d),[ex,y0+RU+9,ez],qFacing([N[0],0,N[1]]),[16,9,13],null);}}

 // ---- the summit: a ridge, not a point --------------------------------------
 // Elevation 3 draws a long flat top with the cultural centre running along it,
 // which only an oblong plan can carry. ST=0.14 leaves a ~200 m platform.
 {const Ap=[triU[1][0]-cU[0],triU[1][1]-cU[1]];
  const ang=Math.atan2(Ap[1],Ap[0]),RA=Math.hypot(Ap[0],Ap[1])*ST*SPAN;
  const CXs=PU.O[0]*SPAN,CZs=PU.O[1]*SPAN;
  SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(ST,0,v));return[Q[0],YT+lerp(0,7,Math.min(1,v*1.3)),Q[1]];},
   72,4,{uS:24,vS:4}));
  if(d!==2){for(let i=0;i<7;i++){const t=(i/6-.5)*1.5*RA;
    const h=22+16*Math.cos(i/6*Math.PI-Math.PI/2);
    kput(BOXC(d),[CXs+Math.cos(ang)*t,YT+7+h*.5,CZs+Math.sin(ang)*t],qEuler(0,-ang,0),
     [RA*.30,h,38-Math.abs(i-3)*4],null);}
   kput('finial',[CXs,YT+53,CZs],null,[7,18,7],null);}
  for(let i=0;i<3;i++){if(d===2&&i===1)continue;
   const C=[triU[i][0]-cU[0],triU[i][1]-cU[1]];
   kput(BOXC(d),[CXs+C[0]*ST*SPAN*.8,YT+52,CZs+C[1]*ST*SPAN*.8],null,[8,96,8],null);}}

 // ---- the lower city: the inverted pyramid ---------------------------------
 const NL=16,RL=(YW-YB)/NL,sl=k=>lerp(SB,1,Math.pow(k/NL,.80));
 // LIGHT damage only. The Screamers live in this thing: the lower city is
 // scarred, not broken. Panels sheared off the outer skin on the flank whose
 // shafts failed, over the lowest five bands only, strongest at the tip and
 // gone by 400 m. Nothing structural, and the promenade is untouched -- the
 // rest of the settlement is built on it.
 const LO0=SH.length;
 // The damaged zone has to reach ABOVE the shaft forest to be seen at all.
 // Measured: on this bearing the lower wall sits 49-144 m out from the plan
 // centre over bands 0-4, and the shaft bundle reaches ~233 m from its own
 // centre, so everything sheared down there is behind a screen of columns.
 // Bands 0-9 (300-500 m) put the upper half of the scar in clear air, which is
 // also the half the capping decks are there to close.
 const COLTOP=YB+10*RL;
 const TIPX=PL.O[0]*SPAN,TIPZ=PL.O[1]*SPAN;
 const strip=(x,z,y)=>{if(d!==2)return false;
  const ang=Math.atan2(z-TIPZ,x-TIPX);
  const rag=.34*fbm(y*.045,ang*3.1,9476,3)-.17;
  return Math.abs(wrapA(ang-STRIPA))<STRIPW*(1+rag*1.7);};
 const bite=(x,z,y)=>{if(!LOWDMG||d!==2||y>=COLTOP)return false;
  // A COHERENT wedge, not a per-quad noise threshold. Thresholding fbm reads as
  // extra windows at any distance: the damaged bands that clear the shaft
  // forest came out only 10-20% speckled and nothing was visible. This is one
  // bite out of one corner whose angular width closes as it rises, obvious low
  // down and gone by the top of the zone, where the capping decks meet it.
  const ang=Math.atan2(z-TIPZ,x-TIPX),da=Math.abs(wrapA(ang-FAILA));
  const rag=.34*fbm(ang*3.3,y*.02,9441,3)-.17;
  const f=Math.pow(1-(y-YB)/(COLTOP-YB),.85);
  return da<(.95*f+.13)*(1+rag);};
 // soffit height above a builder-frame plan point, via the true outline radius
 const soffitY=(px,pz)=>{const vx=px-PL.O[0],vz=pz-PL.O[1],m=Math.hypot(vx,vz);
  if(m<1e-6)return YB;
  const rho=m/Math.max(1e-6,planR(PL,vx/m,vz/m));
  return YB+(YW-YB)*Math.pow(clamp((rho-SB)/(1-SB),0,1),1.25);};
 // Centre of mass. Each pyramid's outline scales about its own centre, so that
 // centre IS its plan centroid and the only unknown is the mass ratio -- the
 // integral of s(y)^2 over each one's height. The two centres are antisymmetric
 // about the origin and the masses come out near equal, so the COM lands within
 // about 15 m of the builder origin, which is where the ground works already
 // are. The mass stays off balance; the nanomaterial spine carries it.
 let mU=0;for(let k=0;k<NU;k++){const sm2=(su(k)+su(k+1))*.5;mU+=sm2*sm2*RU;}
 let mL=0;for(let k=0;k<NL;k++){const sm2=(sl(k)+sl(k+1))*.5;mL+=sm2*sm2*RL;}
 const COM=[(PU.O[0]*mU+PL.O[0]*mL)/(mU+mL),(PU.O[1]*mU+PL.O[1]*mL)/(mU+mL)];
 // One function gives every cluster its plan position, so the soffit crater and
 // the shafts cannot drift apart. Hand-copying the failed cluster's coordinates
 // into the crater is precisely the class of bug this file keeps hitting.
 const clusterAt=c=>c===4?[COM[0]*SPAN,COM[1]*SPAN]
  :[(COM[0]+Math.cos(c/4*TAU+.35)*.155)*SPAN,(COM[1]+Math.sin(c/4*TAU+.35)*.155)*SPAN];
 // With the clusters drawn in onto the centre of mass they merge into one
 // bundle about 330 m across, and a single failed sub-cluster simply hides
 // inside it. The failure is a FLANK of the bundle instead: every shaft within
 // ~55 deg of FAILA went, and the crater sits over that sector.
 const _fc=pullIn((COM[0]+Math.cos(FAILA)*.115)*SPAN,(COM[1]+Math.sin(FAILA)*.115)*SPAN,.62);
 const CX=_fc[0],CZ=_fc[1];
 // The crater reaches across the plaza's southern edge, which measured at 79 m
 // inside it, so the plaza clips it rather than the other way round.
 const crater=(x,z)=>LOWDMG&&d===2&&!inPlaza(x,z)
  &&Math.hypot(x-CX,z-CZ)<CRAT*(.72+.5*fbm(x*.004,z*.004,9434,3));
 for(let k=0;k<NL;k++){const y0=YB+k*RL,s0=sl(k),s1=sl(k+1);
  SH.push(gridSurface((u,v)=>{const Q=W(PL,u,s1);return[Q[0],y0+v*RL,Q[1]];},
   112,2,{uS:52,vS:2,hole:u=>{const Q=W(PL,u,s1);return crater(Q[0],Q[1])||bite(Q[0],Q[1],y0+RL*.5)
    ||strip(Q[0],Q[1],y0+RL*.5);}}));
  // soffit, v running outward-to-inward so the normal points DOWN at the ground
  SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return[Q[0],y0,Q[1]];},
   112,2,{uS:52,vS:2,hole:(u,v)=>{const Q=W(PL,u,lerp(s1,s0,v));return crater(Q[0],Q[1]);}}));
  // DECKS behind the sheared skin. Shorn panels opened onto an empty shell; the
  // lower city has floors like anywhere else, and this is them in section. Only
  // generated where the skin actually went, tested at the OUTER radius so the
  // whole radial strip behind a missing panel is kept, and backed by a dark
  // inner wall so you are not looking clean through the building.
  // Decks behind the torn strip, on every band. Tested at the OUTER radius so
  // the whole radial slice behind a missing panel survives, and backed by a
  // dark wall so you are not looking clean through the building.
  if(d===2){const sk=u=>{const Q=W(PL,u,s1);return !strip(Q[0],Q[1],y0+RL*.5);};
   [0,.5].forEach(fr=>SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*.99,s1*.46,v));
    return[Q[0],y0+RL*fr,Q[1]];},88,3,{uS:34,vS:3,hole:sk})));
   DK.push(gridSurface((u,v)=>{const Q=W(PL,u,s1*.46);return[Q[0],y0+v*RL,Q[1]];},
    88,2,{uS:34,vS:2,hole:sk}));
   const nq=Math.max(10,Math.round(90*s1));
   for(let j=0;j<nq;j++){const p=(j+.5)/nq;if(sk(p))continue;
    const N=pnorm(PL,p),qq=qFacing([N[0],0,N[1]]);
    for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1*.92,s1*.58,row*.6+.1));
     const hh=rr(4,8);
     kput(BOXC(d),[Q[0],y0+RL*(row?.5:0)+hh*.5,Q[1]],qq,[rr(6,12),hh,rr(5,9)],null);}}}
  if(LOWDMG&&d===2&&y0<COLTOP){const keep=(u)=>{const Q=W(PL,u,s1);return !bite(Q[0],Q[1],y0+RL*.5);};
   [0,.5].forEach(fr=>{
    SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*.99,s1*.52,v));
     return[Q[0],y0+RL*fr,Q[1]];},96,3,{uS:34,vS:3,hole:keep}));});
   DK.push(gridSurface((u,v)=>{const Q=W(PL,u,s1*.52);return[Q[0],y0+v*RL,Q[1]];},
    96,2,{uS:34,vS:2,hole:keep}));
   // A solid deck right across the sheared sector at the TOP of each damaged
   // band, with no holes in it at all. This is what stops the scar reading as
   // one tall cavity: from above, from the side and from below you meet a floor
   // a band or two up rather than seeing the whole way in.
   SH.push(gridSurface((u,v)=>{const Q=W(PL,u,lerp(s1*1.0,s1*.50,v));
    return[Q[0],y0+RL*.99,Q[1]];},96,3,{uS:34,vS:3,
    hole:u=>{const Q=W(PL,u,s1);return !bite(Q[0],Q[1],y0+RL*.5);}}));
   const ni=Math.max(8,Math.round(70*s1));
   for(let j=0;j<ni;j++){const p=(j+.5)/ni;if(keep(p))continue;
    const N=pnorm(PL,p),qq=qFacing([N[0],0,N[1]]);
    for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1*.94,s1*.62,row*.55+.1));
     const hh=rr(4,8);
     kput(BOXC(d),[Q[0],y0+RL*(row?.5:0)+hh*.5,Q[1]],qq,[rr(6,13),hh,rr(5,10)],null);}}}
  const nc=Math.max(6,Math.round(86*s1));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc,N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
   for(let row=0;row<2;row++){const Q=W(PL,p,lerp(s1,s0,.12+row*.34));
    if(crater(Q[0],Q[1])||bite(Q[0],Q[1],y0))continue;
    const h=rr(4,9);
    kput(BOXC(d),[Q[0],y0-h*.5,Q[1]],q,[rr(7,14),h,rr(6,11)],null);}}
  {const nw=Math.max(12,Math.round(320*s1)),WIN=d===0?'pane':'paneD';
   for(let j=0;j<nw;j++){const p=(j+.5)/nw;
    const Q=W(PL,p,s1),N=pnorm(PL,p),q=qFacing([N[0],0,N[1]]);
    if(crater(Q[0],Q[1])||bite(Q[0],Q[1],y0+RL*.5))continue;
    if(d>0&&rng()<.34)continue;
    for(let row=0;row<3;row++)
     kput(WIN,[Q[0]+N[0]*.35,y0+RL*(.22+row*.27),Q[1]+N[1]*.35],q,[2.5,3.1,1],null);}}}

 // ---- foliage in the blown holes ---------------------------------------------
 // The crater in the upper city and the torn strip below have been open long
 // enough for the jungle to have taken them. Growth clings round both rims and
 // hangs down inside, which is most of what says the damage is old rather than
 // this morning's.
 if(d===2){
  // THE CRATER RIM, not the crater. The old pass sampled points on and inside
  // an ellipsoid and kept the ones where ubite was TRUE -- that is the VOID, so
  // most of the growth was hanging in mid-air. Growth needs surviving fabric to
  // root in, so this walks the terraces that pass the crater and plants only
  // where the skin is still there and the hole is close by.
  for(let k=0;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
   if(y0+RU<UCY-UCR*1.5||y0>UCY+UCR*1.5)continue;
   const np=Math.max(10,Math.round(130*s0));
   for(let j=0;j<np;j++){const p=(j+.5)/np;
    const Q=W(PU,p,lerp(s0,s1,.4));
    if(cut(p,y0+RU))continue;                    // no fabric here to grow on
    const dr=Math.hypot(Q[0]-UCX,(y0-UCY)*.8,Q[1]-UCZ);
    if(dr>UCR*1.45)continue;                     // only near the hole
    if(rng()<.35)continue;
    const N=pnorm(PU,p),sz=rr(3.5,11);
    kput('leafy',[Q[0],y0+RU+sz*.3,Q[1]],qEuler(rng(),rng(),rng()),[sz,sz*.62,sz],
     new THREE.Color().setHSL(rr(.23,.33),rr(.3,.5),rr(.09,.2)));
    if(rng()<.6){const R2=W(PU,p,s0);
     kput('vine',[R2[0]+N[0]*.6,y0+rr(.1,.9)*RU,R2[1]+N[1]*.6],
      qEuler(rr(-.15,.15),rng()*TAU,rr(-.15,.15)),[rr(1,2),rr(12,46),rr(1,2)],null);}}}
  for(let k=0;k<NL;k++){                        // and down the torn strip
   const y0=YB+k*RL,s1=sl(k+1),np=Math.round(120*s1);
   for(let j=0;j<np;j++){const p=(j+.5)/np;
    const Q=W(PL,p,s1);
    if(!strip(Q[0],Q[1],y0+RL*.5))continue;
    if(rng()<.45)continue;
    const N=pnorm(PL,p),yy=y0+rr(0,1)*RL,sz=rr(2.6,8);
    kput('leafy',[Q[0]-N[0]*rr(0,14),yy,Q[1]-N[1]*rr(0,14)],qEuler(rng(),rng(),rng()),
     [sz,sz*.6,sz],new THREE.Color().setHSL(rr(.23,.33),rr(.3,.5),rr(.09,.2)));
    if(rng()<.6)kput('vine',[Q[0]+N[0]*.6,yy,Q[1]+N[1]*.6],
     qEuler(rr(-.15,.15),rng()*TAU,rr(-.15,.15)),[rr(1,2),rr(12,44),rr(1,2)],null);}}}

 // ---- foliage on the upper half of the lower city ---------------------------
 // An inverted pyramid has no up-facing ledges: every step faces DOWN, which is
 // why the decor samplers only ever dressed the soffits and the upper bands
 // came out bare. This plants on the RISERS instead -- clumps rooted in the
 // joints with growth trailing below them.
 if(d>0)for(let k=Math.floor(NL/2);k<=NL-3;k++){
  const y0=YB+k*RL,s1=sl(k+1),np=Math.round(150*s1);
  for(let j=0;j<np;j++){const p=(j+.5)/np;
   if(rng()<.42)continue;
   const Q=W(PL,p,s1),N=pnorm(PL,p),yy=y0+rr(.08,.95)*RL,sz=rr(2.6,7.5);
   kput('leafy',[Q[0]+N[0]*sz*.45,yy,Q[1]+N[1]*sz*.45],qEuler(rng(),rng(),rng()),
    [sz,sz*.62,sz],new THREE.Color().setHSL(rr(.24,.33),rr(.32,.5),rr(.10,.20)));
   if(rng()<.5)kput('vine',[Q[0]+N[0]*.7,yy,Q[1]+N[1]*.7],
    qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.9,1.8),rr(8,28),rr(.9,1.8)],null);}}

 // ---- inside the upper crater ------------------------------------------------
 // A dark shell just inside the skin, kept only where the crater took the outer
 // one, plus each level's floor plates ragged in section. Same lesson as the
 // Veladiga breach: a cut has to read as a hollow city, not as the inside of
 // the back wall.
 if(d===2){for(let k=0;k<NU;k++){const y0=YW+k*RU;
   if(y0+RU<UCY-UCR*1.4||y0>UCY+UCR*1.4)continue;
   DK.push(gridSurface((u,v)=>{const Q=W(PU,u,su(k)*.90);return[Q[0],y0+v*RU,Q[1]];},
    72,1,{uS:28,vS:1,hole:(u,v)=>!cutQ(W(PU,u,su(k)),y0+v*RU)}));
   SH.push(gridSurface((u,v)=>{const Q=W(PU,u,lerp(su(k),su(k)*.62,v));return[Q[0],y0,Q[1]];},
    72,3,{uS:28,vS:3,hole:(u,v)=>!cutQ(W(PU,u,su(k)),y0)||fbm(u*9+k,v*6,9435,3)<.22+.5*v*v}));}}

 // ---- closing the pyramids --------------------------------------------------
 // Both were open shells: risers and treads on the upper, risers and soffits on
 // the lower, and nothing across either end. Where one plan reaches past the
 // other -- which is most of the perimeter, since they are turned 120 deg --
 // you could look straight up into the hollow cone, or down into the inverted
 // one. Three caps: the great soffit under the upper city, the deck over the
 // lower city, and the floor of its truncated apex. They sit 2 m apart rather
 // than coplanar so the overlap cannot z-fight.
 SH.push(gridSurface((u,v)=>{const Q=W(PU,u,1-v);return[Q[0],YW,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>cut(u,YW+2)}));
 SH.push(gridSurface((u,v)=>{const Q=W(PL,u,1-v);return[Q[0],YW-2,Q[1]];},
  112,6,{uS:52,vS:8,hole:(u,v)=>{const Q=W(PL,u,1-v);return crater(Q[0],Q[1]);}}));
 SH.push(gridSurface((u,v)=>{const Q=W(PL,u,SB*(1-v));return[Q[0],YB,Q[1]];},
  72,3,{uS:24,vS:3,hole:(u,v)=>{const Q=W(PL,u,SB*(1-v));return crater(Q[0],Q[1]);}}));
 // The lower city's roof is open sky wherever the upper pyramid does not cover
 // it, which on a 120 deg turn is most of one point. That is the park and
 // promenade level of the sheets, so it gets planted rather than left blank.
 for(let i=0;i<300;i++){
  const Q=W(PL,rng(),Math.sqrt(rng())*.97);
  const vx=Q[0]/SPAN-PU.O[0],vz=Q[1]/SPAN-PU.O[1],m=Math.hypot(vx,vz)||1e-6;
  if(m<planR(PU,vx/m,vz/m)*1.01)continue;          // roofed by the upper city
  if(crater(Q[0],Q[1])||inPlaza(Q[0],Q[1]))continue;
  if(rng()<.42){const h=rr(5,17);
   kput(BOXC(d),[Q[0],YW-2+h*.5,Q[1]],qEuler(0,rng()*TAU,0),[rr(10,26),h,rr(9,22)],null);}
  else if(d!==2)VEG.tree(Q[0],YW-2,Q[1],i%3,rr(5,10));}
 // coffer ribs across the great soffit, so it is not a blank 1 km plate
 for(let j=0;j<30;j++){const p=j/30,Q=W(PU,p,.99),Qi=W(PU,p+.5,.99);
  if(cut(p,YW+2))continue;
  beam(BOXC(d),[Q[0],YW-3,Q[1]],[Qi[0],YW-3,Qi[1]],4,6);}
 if(d===0)for(let j=0;j<40;j++){const p=(j+.5)/40,Q=W(PU,p,.62);
  kput('strip',[Q[0],YW-4,Q[1]],qEuler(0,rng()*TAU,0),[22,1,1],CYAN);}

 // ---- the waist: two overlapping promenade decks ---------------------------
 // Offsetting them in y rather than unioning the outlines is what makes the
 // crossing read: at the waist one triangular plate runs over the other.
 const deck=(P,y,out)=>{
  SH.push(gridSurface((u,v)=>{const Q=W(P,u,lerp(1,out,v));return[Q[0],y,Q[1]];},
   112,3,{uS:52,vS:3,hole:(u,v)=>{const Q=W(P,u,lerp(1,out,v));return crater(Q[0],Q[1]);}}));
  SH.push(gridSurface((u,v)=>{const Q=W(P,u,out);return[Q[0],y-v*11,Q[1]];},112,2,{uS:52,vS:1}));};
 deck(PU,YW+15,1.14);deck(PL,YW-17,1.12);
 for(let j=0;j<96;j++){const p=j/96,Q=W(PU,p,1.14);
  if(d>0&&rng()<.45)continue;
  kput(d>0?'colR':'colW',[Q[0],YW+15,Q[1]],null,[2.2,7,2.2],null);}
 if(d===0)for(let j=0;j<72;j++){const p=(j+.5)/72,Q=W(PL,p,1.12),N=pnorm(PL,p);
  kput('strip',[Q[0],YW-17.5,Q[1]],qEuler(0,-Math.atan2(-N[0],N[1]),0),[18,1,1],CYAN);}
 // heliport out on the upper deck's apex tip
 {const Q=W(PU,.380,1.05);   // p=.380 is the apex chamfer; .877 was the base edge
  kput(SLABC(d),[Q[0],YW+25,Q[1]],null,[50,3,50],null);
  for(let i=0;i<4;i++)kput(BOXC(d),[Q[0]+Math.cos(i/4*TAU+.7)*34,YW+20,Q[1]+Math.sin(i/4*TAU+.7)*34],null,[4,10,4],null);
  if(d===0)stripRing(Q[0],YW+27,Q[1],46,d,20);}

 // The ground works are declared here, ahead of the shafts, because the shaft
 // footings need plateY: a const used before its declaration is a temporal
 // dead zone throw, not a hoisted undefined.
 const HEXR=620,hx=(th,f)=>hexR(HEXR*f,th);
 // Seat every block on the terrace it actually stands on. Picking a y and a
 // height independently is how blocks end up floating or half-buried.
 const plateY=(x,z)=>12-2.2*Math.min(3,Math.floor(clamp(Math.hypot(x,z)/hexR(HEXR,Math.atan2(z,x)),0,.999)*4));

 // ---- the vertical structure ------------------------------------------------
 // Four clusters. Each shaft runs from the ground to whatever height the
 // inverted pyramid's soffit has actually reached above it, so they lengthen
 // toward the rim instead of all being cut to one line.
 // Where the soffit ACTUALLY is above a plan point. soffitY() inverts a
 // continuous curve; the built soffit is stepped, so the two disagree by up to
 // a whole band and shafts sized from the continuous value stopped short of the
 // plate they were meant to carry.
 const soffitStep=(px,pz)=>{const vx=px-PL.O[0],vz=pz-PL.O[1],m=Math.hypot(vx,vz);
  if(m<1e-6)return YB;
  const rho=m/Math.max(1e-6,planR(PL,vx/m,vz/m));
  if(rho<=SB)return YB;
  if(rho>=1)return YW;
  return YB+Math.min(NL-1,Math.floor(NL*Math.pow((rho-SB)/(1-SB),1.25)))*RL;};
 // An intact shaft runs all the way to the waist, not to the soffit it first
 // meets. The lower city is a closed shell now, so everything above that soffit
 // is enclosed and invisible -- which makes the connection true by construction
 // instead of true only if a height calculation happens to agree with a stepped
 // surface. The visible length still varies, because the soffit still does.
 const shaft=(x,z,w,broke)=>{
  const vis=soffitStep(x/SPAN,z/SPAN);
  const h=broke?vis*rr(.18,.42):YW+2;
  kput(BOXC(d),[x,h*.5,z],qEuler(0,rr(0,.4),0),[w,h,w*rr(.8,1.2)],null);
  for(let f=0;f<4;f++){const a=f/4*TAU+.4;
   kput(BOXC(d),[x+Math.cos(a)*w*.62,h*.5,z+Math.sin(a)*w*.62],qEuler(0,-a,0),[1.6,h*.98,w*.30],null);}
  // capital just under the soffit, and a footing seated on the ground terrace
  if(!broke){kput(BOXC(d),[x,vis-7,z],null,[w*1.6,13,w*1.6],null);
   for(let f=0;f<4;f++){const a=f/4*TAU+.8;
    beam(BOXC(d),[x+Math.cos(a)*w*.5,vis-26,z+Math.sin(a)*w*.5],
     [x+Math.cos(a)*w*1.05,vis-3,z+Math.sin(a)*w*1.05],3.4,3.4);}}
  kput(BOXC(d),[x,plateY(x,z)+5,z],qEuler(0,rr(0,.4),0),[w*1.5,14,w*1.5],null);
  if(broke)rubbleRing(x,0,z,w*.6,w*3.2,26,4.2);
  return vis;};
 for(let c=0;c<5;c++){
  const centre=c===4;
  const CC0=clusterAt(c),CC=pullIn(CC0[0],CC0[1],.62),cx=CC[0],cz=CC[1];
  const n=centre?11:8;
  for(let i=0;i<n;i++){
   const a=i/n*TAU+c*.7,rd=(i===0&&!centre)?0:rr(36,78);
   // Clamp every shaft under the soffit. The clusters sit a fixed 0.155 of
   // plan units from the centre of mass, but the lower plan's radius runs 0.18
   // toward +x and 0.64 toward the apex, so on the short side the bundle
   // walked out from under the mass entirely -- measured at rho 1.18 for the
   // cluster centre and 1.61 for its outermost shaft.
   const XZ=pullIn(cx+Math.cos(a)*rd,cz+Math.sin(a)*rd,.88),x=XZ[0],z=XZ[1];
   const broke=LOWDMG&&d===2&&Math.abs(wrapA(Math.atan2(z-COM[1]*SPAN,x-COM[0]*SPAN)-FAILA))<.95;
   const vis=shaft(x,z,rr(13,23),broke&&rng()<.82);
   // bracing only in the visible length, below the soffit
   if(i>0&&!broke)for(let b=1;b<=3;b++)
    beam(BOXC(d),[x,vis*b/4,z],[cx,vis*b/4,cz],3.4,3.4);}}
 if(LOWDMG&&d===2){for(let i=0;i<9;i++){const a=FAILA+rr(-1.1,1.1);
   beam(BOXC(1),[CX+Math.cos(a)*rr(30,150),rr(8,22),CZ+Math.sin(a)*rr(30,150)],
    [CX+Math.cos(a)*rr(160,380),rr(4,12),CZ+Math.sin(a)*rr(160,380)],rr(15,24),rr(15,24));}
  rubbleRing(CX,0,CZ,70,360,220,7);}

 // ---- the ground: automated industries on a hexagon --------------------------
 // A hexagon's inradius is only 0.87 of its circumradius, subtle enough that a
 // circular apron laid over it hid the shape entirely; mesa, rim and skirt all
 // follow hexR, and the retaining wall on the six edges is what sells it.
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,1)*v;
  return[r*Math.cos(th),12-2.2*Math.min(3,Math.floor(v*4)),r*Math.sin(th)];},96,12,{uS:40,vS:16}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,lerp(1,1.05,v));
  return[r*Math.cos(th),lerp(5.4,0,Math.pow(v,.7)),r*Math.sin(th)];},96,3,{uS:40,vS:2}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=hx(th,lerp(1.05,1.34,v))*(1+.035*fbm(u*9,1.1,9436,2));
  return[r*Math.cos(th),0,r*Math.sin(th)];},96,4,{uS:40,vS:4}));
 for(let e=0;e<6;e++){const a0=e/6*TAU,a1=(e+1)/6*TAU;
  const R0=hexR(HEXR,a0),R1=hexR(HEXR,a1);
  beam(BOXC(d),[R0*Math.cos(a0),9,R0*Math.sin(a0)],[R1*Math.cos(a1),9,R1*Math.sin(a1)],12,10);}
 // THE VILLAGE'S DWELLINGS. About two thirds of the ancient industry sheds are
 // gone -- fallen, or quarried for the wall. What survives does so in CLUSTERS
 // of six to ten neighbours, because a shed that still has its neighbours still
 // has their shared walls holding it up, and those are the ones the Screamers
 // could reoccupy. Two clusters per sector, on two different ranks.
 const IND=[[.43,7],[.57,9],[.70,11],[.83,12],[.93,14]];
 const CLUST=[],SHED=[];
 for(let e=0;e<6;e++){const a0=e/6*TAU-Math.PI/6+.045,a1=(e+1)/6*TAU-Math.PI/6-.045;
  const rA=Math.floor(rng()*5);let rB=Math.floor(rng()*5);if(rB===rA)rB=(rB+2)%5;
  [rA,rB].forEach(ri=>{const n=IND[ri][1],len=Math.min(n,6+Math.floor(rng()*5));
   const j0=Math.floor(rng()*(n-len+1));
   let sx=0,sz=0,cn=0,rad=0;
   for(let j=j0;j<j0+len;j++){const t=(j+.5)/n,a=lerp(a0,a1,t);
    const R=hexR(HEXR,a)*IND[ri][0]*(1+.018*fbm(a*3,ri,9439,2));
    const x=Math.cos(a)*R,z=Math.sin(a)*R;
    if(Math.hypot(x,z)<250)continue;
    const yy=plateY(x,z),tan=R*(a1-a0)/n*.80,dep=rr(26,46);
    const q0=qEuler(0,-a,0),nx=Math.cos(a),nz=Math.sin(a),tgx=-Math.sin(a),tgz=Math.cos(a);
    const big=Math.max(dep,tan),kind=Math.floor(rng()*3),bh=kind===1?rr(15,22):rr(9,16);
    // ANCIENT CUES, so these read as salvaged Ancient fabric rather than as
    // huts: a chamfered plinth under everything, a cornice slab, fluted
    // pilasters or a barrel vault or an apsidal end, and the Ancients' own
    // arched openings. The tribal work is only what sits ON them.
    kput(SLABC(d),[x,yy+1.2,z],q0,[big*.62,2.4,big*.62],null);
    if(kind===0){                                   // pilastered block + cornice
     kput(BOXC(d),[x,yy+2.4+bh*.5,z],q0,[dep,bh,tan],null);
     kput(SLABC(d),[x,yy+2.4+bh+1,z],q0,[big*.60,2,big*.60],null);
     for(let f=-1;f<=1;f+=2)for(let g=-1;g<=1;g+=2)
      // square piers, not the kit's colR: that item flares to a goblet and at
      // shed scale it read as a row of urns rather than as pilasters
      kput(BOXC(d),[x+nx*dep*.46*f+tgx*tan*.42*g,yy+2.4+bh*.5,
                    z+nz*dep*.46*f+tgz*tan*.42*g],q0,[2.8,bh,2.8],null);
    }else if(kind===1){                             // barrel-vaulted hall
     kput(BOXC(d),[x,yy+2.4+bh*.5,z],q0,[dep,bh,tan],null);
     beam(VAULTC(d),[x-nx*dep*.5,yy+2.4+bh,z-nz*dep*.5],
                    [x+nx*dep*.5,yy+2.4+bh,z+nz*dep*.5],tan*.99,tan*.99);
    }else{                                          // apsidal end
     kput(BOXC(d),[x-nx*dep*.16,yy+2.4+bh*.5,z-nz*dep*.16],q0,[dep*.68,bh,tan],null);
     SH.push(lathe({rFn:()=>tan*.5,H:bh,nu:16,nv:3})
      .translate(x+nx*dep*.34,yy+2.4,z+nz*dep*.34));
     kput(SLABC(d),[x+nx*dep*.34,yy+2.4+bh+.8,z+nz*dep*.34],null,[tan*.58,1.6,tan*.58],null);}
    {const na=Math.max(2,Math.round(dep/11));       // arcade down the long side
     for(let j=0;j<na;j++){const u=(j+.5)/na-.5;
      for(let sd=-1;sd<=1;sd+=2)
       kput(d>0?'paneD':'pane',[x+nx*u*dep*.9+tgx*tan*.52*sd,yy+2.4+bh*.45,
                                z+nz*u*dep*.9+tgz*tan*.52*sd],
        qFacing([tgx*sd,0,tgz*sd]),[2.6,3.4,1],null);}}
    kput('archOpen',[x+nx*dep*.5,yy+2.4+bh*.30,z+nz*dep*.5],qFacing([nx,0,nz]),[2.2,2.0,2.4],null);
    // and the tribe's own work on top of it
    if(rng()<.75)kput('thatchR',[x+tgx*tan*rr(-.2,.2),yy+2.4+bh+rr(2,5),z+tgz*tan*rr(-.2,.2)],
     qEuler(0,-a+rr(-.3,.3),0),[dep*rr(.40,.66),rr(7,12),tan*rr(.40,.62)],null);
    for(let q=0;q<2;q++)kput('postW',[x+nx*dep*.55+tgx*tan*(q?.4:-.4),yy+4,
      z+nz*dep*.55+tgz*tan*(q?.4:-.4)],null,[1.6,8,1.6],null);
    SHED.push({x:x,z:z,r:Math.max(dep,tan)*.62});
    sx+=x;sz+=z;cn++;rad=Math.max(rad,tan);}
   if(cn>=4)CLUST.push({x:sx/cn,z:sz/cn,n:cn,a:(a0+a1)*.5,r:rad*cn*.42});});}
 // Handed to the village builder, which runs next: it needs the cluster
 // centroids for the trails and the sheds, and the shaft bundle for the lobby.
  // Handed to the village. Two different surfaces get confused easily, so both
 // are named: the PROMENADE is the walkway ring round the foot of the upper
 // pyramid, only 45-100 m wide, and the PLAZA is the lower city's roof deck,
 // which is the only large open ground in the whole structure.
 const _ap=[triU[1][0]-cU[0],triU[1][1]-cU[1]],_am=Math.hypot(_ap[0],_ap[1]);
 const _lp=[triL[2][0]-cL[0],triL[2][1]-cL[1]],_lm=Math.hypot(_lp[0],_lp[1]);
 SCREAM_PROM={o:[PU.O[0]*SPAN,PU.O[1]*SPAN],y:YW+15,
  ax:[_ap[0]/_am,_ap[1]/_am],apex:_am*1.07*SPAN};
 // Exact containment for the lower roof: a point is on the deck when it is
 // inside the plan outline at full scale. halfAt() is only a linear
 // approximation along the apex axis and let furniture float off the edges.
 const onDeck=(x,z)=>{const vx=x/SPAN-PL.O[0],vz=z/SPAN-PL.O[1],m=Math.hypot(vx,vz);
  return m<1e-6||m<planR(PL,vx/m,vz/m);};
 // Where the upper city's base wall comes nearest the plaza's centroid: the
 // obvious place for the tribe to have cut a way through, and derived rather
 // than chosen.
 // The doorway has to sit FLUSH in the wall, which means using the wall's own
 // edge normal, not the radial direction to the plaza. On a plan this elongated
 // the two differ by tens of degrees -- the same mistake as the cell facings
 // earlier -- and the arch ended up skewed across the face. Walk the outline,
 // take the parameter nearest the plaza, and read pnorm there.
 const _pc=[(PLZ[0][0]+PLZ[1][0]+PLZ[2][0])/3,(PLZ[0][1]+PLZ[1][1]+PLZ[2][1])/3];
 let _bp=0,_bd=1e18;
 for(let i=0;i<360;i++){const pq=i/360,Qq=W(PU,pq,1);
  const dq=Math.hypot(Qq[0]-_pc[0],Qq[1]-_pc[1]);
  if(dq<_bd){_bd=dq;_bp=pq;}}
 const _dp2=W(PU,_bp,1),_dn=pnorm(PU,_bp);
 SCREAM_PLAZA={o:[PL.O[0]*SPAN,PL.O[1]*SPAN],y:YW-2,poly:PLZ,inPlaza:inPlaza,onDeck:onDeck,
  door:_dp2,doorAng:Math.atan2(_dn[1],_dn[0]),doorN:_dn,doorY:YW,
  ax:[_lp[0]/_lm,_lp[1]/_lm],apex:_lm*SPAN,
  // half-width of the plan at a station f along the apex axis, so anything
  // placed out there can be sized to the ground it actually has
  halfAt:f=>Math.max(0,(_lm*SPAN-f))*Math.tan(15*Math.PI/180)};
 SCREAM={clusters:CLUST,sheds:SHED,orchards:ORCH,com:[COM[0]*SPAN,COM[1]*SPAN],hexr:HEXR,plate:plateY,gx:gx,gz:gz};
 // the paved apron round the vertical structure
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(40,250,v);
  return[r*Math.cos(th),12.3,r*Math.sin(th)];},64,4,{uS:26,vS:10}));
 const ROADS=[];
 for(let s2=0;s2<6;s2++){const a=s2/6*TAU+Math.PI/6;
  beam(d>0?'boxR':'boxD',[0,7.2,0],[Math.cos(a)*HEXR*.96,7.2,Math.sin(a)*HEXR*.96],16,.6);
  ROADS.push([Math.cos(a),Math.sin(a),HEXR*.96]);}
 SCREAM.roads=ROADS;SCREAM.rim=HEXR;

 // ---- merge and dress --------------------------------------------------------
 meshMerged(SH,CONC(dd),G);meshMerged(GRD,d>0?MAT.mud:MAT.slab,G);
 if(DK.length)meshMerged(DK,MAT.guts,G);
 // OVERGROWTH. The hyperjungle has taken the whole mass except the level or
 // two either side of the promenade, which the Screamers keep cut back because
 // they live on it. SH is pushed in a known order, so the eligible bands are a
 // slice of it rather than a second pass over the geometry.
 const OVG=[];
 for(let k=2;k<NU;k++)OVG.push(SH[UP0+2*k],SH[UP0+2*k+1]);         // above the clean band
 for(let k=0;k<=NL-3;k++)OVG.push(SH[LO0+2*k],SH[LO0+2*k+1]);      // below it
 if(d>0){mossOnSurface(OVG,0,0,0,440,26);           // moss keeps its own scatter
  stainsFromLedge(OVG,0,0,0,200,28);
  // EVEN DISTRIBUTION. upFaces()/ledgePoints() sample by triangle AREA, so the
  // wide lower terraces took nearly all the trees and vines and the upper ones
  // came out bare. Walking each band and spacing by its own perimeter gives the
  // same count per metre of terrace wherever you are on the mass. Moss and the
  // balcony fruit trees are deliberately left on their own distributions.
  const bigTree=(x,y,z,h)=>{
   kput('trunk',[x,y,z],null,[h*.10,h,h*.10],new THREE.Color(0x6a4a34));
   for(let b=0;b<3;b++){const t=b/2,sz=h*.34*(1-.24*t);
    kput('leafy',[x+rr(-.14,.14)*h,y+h*(.62+t*.17),z+rr(-.14,.14)*h],
     qEuler(rng(),rng(),rng()),[sz,sz*.6,sz],
     new THREE.Color().setHSL(rr(.23,.33),rr(.30,.5),rr(.09,.19)));}};
  for(let k=2;k<NU;k++){const y0=YW+k*RU,s0=su(k),s1=su(k+1);
   const nt=Math.max(4,Math.round(30*s0));
   for(let j=0;j<nt;j++){const p=(j+rr(.15,.85))/nt;
    if(cut(p,y0+RU))continue;
    const Q=W(PU,p,lerp(s0,s1,rr(.18,.82)));
    bigTree(Q[0],y0+RU,Q[1],rr(22,54));}
   const nv2=Math.max(6,Math.round(48*s0));
   for(let j=0;j<nv2;j++){const p=(j+rr(.2,.8))/nv2;
    const Q=W(PU,p,s0),N=pnorm(PU,p);
    kput('vine',[Q[0]+N[0]*.6,y0+rr(.1,.9)*RU,Q[1]+N[1]*.6],
     qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(1,2),rr(10,46),rr(1,2)],null);}}
  for(let k=0;k<=NL-3;k++){const y0=YB+k*RL,s1=sl(k+1);
   const nv2=Math.max(6,Math.round(44*s1));
   for(let j=0;j<nv2;j++){const p=(j+rr(.2,.8))/nv2;
    const Q=W(PL,p,s1),N=pnorm(PL,p);
    kput('vine',[Q[0]+N[0]*.6,y0+rr(.05,.6)*RL,Q[1]+N[1]*.6],
     qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(1,2),rr(12,50),rr(1,2)],null);}}
  scatterMoss(0,0,0,180,HEXR,340,4);rubbleRing(0,0,0,HEXR*.4,HEXR,240,7);
  trees(0,0,HEXR*1.02,HEXR*1.9,220);}
 figures(CX,CZ,8,140);
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

// ---------------------------------------------------------------- Screamer retint
// The Hexahedron has stood open to a hyperjungle for a very long time. Nothing
// is removed here -- the geometry is exactly as built -- but every Ancient
// surface is re-tinted toward rust and weathered ochre, because pale grey
// concrete reads as recent and this damage is ancient. MAT.concreteR is the
// one material the whole ruin merges into, so it is the single lever.
MAT.concreteR.color.setHex(0x8a7156);
MAT.concreteR.roughness=1;
MAT.slab.color=new THREE.Color(0x8a7458);
if(MAT.white)MAT.white.color.setHex(0x9a8468);
if(MAT.winDead)MAT.winDead.color.setHex(0x2e2a24);

// Metals. Nothing here has been maintained in a very long time: the shine comes
// off, the colour goes to iron oxide, and the roughness goes up. Low metalness
// also matters because this scene has no envMap -- a high-metalness surface
// with nothing to reflect just goes black.
// MAXIMALLY rusted: iron oxide, fully rough, and metalness near zero. There is
// no envMap in this scene, so metalness has nothing to reflect -- raising it
// only darkens; the rust has to come from albedo and roughness instead.
MAT.rust.color.setHex(0x8f3f1c);MAT.rust.roughness=1;MAT.rust.metalness=.04;
if(MAT.corrugate){MAT.corrugate.color.setHex(0x86381a);MAT.corrugate.roughness=1;MAT.corrugate.metalness=.05;}
if(MAT.pipe){MAT.pipe.color.setHex(0x79381e);MAT.pipe.roughness=1;MAT.pipe.metalness=.06;}
if(MAT.scrap){MAT.scrap.color.setHex(0x8a3f1e);MAT.scrap.roughness=1;MAT.scrap.metalness=.06;}
if(MAT.strip)MAT.strip.color&&MAT.strip.color.setHex(0xffb060);
// ================================================================= HYPERTREE — imported from Mav's Refuge
// A single Ironbark hypertree, for scale. The numbers are that project's own
// SPECIES[0]: height 410-470 m, base radius 25-29 m, crown starting at half
// height and reaching 170-215 m across. The trunk profile and the buttress
// model below are ports of its trunkR()/butF()/lobeSum(); the branching keeps
// its shape rules (golden-angle boughs, alternating secondaries, twigs off
// those) but is re-expressed with this kit's instanced primitives, because
// the original is written against its own merged-bucket tube builder.
//
// Nothing else from that project is imported -- no platforms, bridges, lifts
// or buildings. Just the tree.
kdef('bough',new THREE.CylinderGeometry(.5,.5,1,7),MAT.timber);
kdef('frond',new THREE.IcosahedronGeometry(1,0),MAT.turf);
const LEAFC=[0x1f3d24,0x254a2a,0x1a3520,0x2c5230];     // Ironbark needle greens
function buildHypertree(scene,gx,gz,d){reseed(9450+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const H=452,RB=27.5,CROWN0=.50,CR=196;
 REGISTER({name:'Ironbark hypertree — '+H+' m (Mav’s Refuge, for scale)',x:0,z:0,r:CR,h:H});
 REGISTER({name:'Ironbark hypertree — the bole',x:0,z:0,r:RB*2.2,h:H*CROWN0});
 const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 // trunk radius, verbatim from the source's trunkR() for species 0-2
 const trunkR=yy=>{const u=clamp(yy/H,0,1);
  const t=u<.62?1-.42*u:lerp(.74,.07,sm(.62,1,u));
  return RB*t*(1+.80*Math.exp(-yy/15));};
 // buttresses: a handful of lobes that only exist in the bottom 45 m
 const NL=7,LOB=[];
 for(let k=0;k<NL;k++)LOB.push({a:k/NL*TAU+rr(-.22,.22),amp:rr(.55,1.2),p:rr(1.6,2.6)});
 const lobeSum=ang=>{let s=0;for(const L of LOB){const c=Math.cos(ang-L.a);if(c>0)s+=L.amp*Math.pow(c,L.p);}return s;};
 const butF=yy=>yy<45?.55*Math.exp(-yy/16)*clamp((45-yy)/18,0,1):0;

 // ---- the bole ------------------------------------------------------------
 // v is raised to a power so the rings crowd near the ground, where the
 // buttress flare is: spaced evenly they read as a smooth cone instead.
 const BOLE=[gridSurface((u,v)=>{const th=u*TAU,yy=Math.pow(v,.82)*H*.99;
  const r=trunkR(yy)*(1+butF(yy)*lobeSum(th)
   +.010*Math.sin(3*th+yy*.045)+.007*Math.sin(7*th-yy*.10));
  return[r*Math.cos(th),yy,r*Math.sin(th)];},52,64,{uS:16,vS:38})];
 meshMerged(BOLE,MAT.timber,G);

 // ---- surface roots, one off each buttress ---------------------------------
 LOB.forEach(L=>{const len=rr(45,120)*(.6+.4*L.amp),R0=trunkR(7)*(1+.19*L.amp);
  const r0=clamp(RB*.17*L.amp,1.6,5.2),wob=rr(0,TAU);
  let px=Math.cos(L.a)*R0*.72,pz=Math.sin(L.a)*R0*.72,py=r0*1.6+5;
  for(let k=1;k<=7;k++){const t=k/7,a=L.a+.32*Math.sin(wob+t*5.2)*t+.10*Math.sin(wob*2+t*11);
   const dist=R0*.72+len*t,r=lerp(r0,.4,Math.pow(t,.75));
   const nx=Math.cos(a)*dist,nz=Math.sin(a)*dist,ny=terrainH(gx+nx,gz+nz)+r*.22;
   beam('bough',[px,py,pz],[nx,ny,nz],r*2,r*2);
   px=nx;py=ny;pz=nz;}});

 // ---- boughs ---------------------------------------------------------------
 const FOL=[];
 // one bough: a gravity/phototropic curve with a sideways wiggle, as the source
 const grow=(o,dir,len,rA,rB,n,curve,wig)=>{
  const sx=-dir[2],sz=dir[0],sl=Math.hypot(sx,sz)||1;
  const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,P=[];
  for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;
   P.push([o[0]+dir[0]*len*t+sx/sl*w,o[1]+dir[1]*len*t+curve*len*t*t,
           o[2]+dir[2]*len*t+sz/sl*w,lerp(rA,rB,Math.pow(t,.8))]);}
  return P;};
 const skin=(P,seg)=>{for(let i=0;i<P.length-1;i++){
  const r=(P[i][3]+P[i+1][3])*.5;
  beam('bough',[P[i][0],P[i][1],P[i][2]],[P[i+1][0],P[i+1][1],P[i+1][2]],r*2,r*2);}};
 const side=(tx,ty,tz,s,a,b,c)=>{const sx=-tz*s,sz=tx*s,sl=Math.hypot(sx,sz)||1;
  const x=tx*a+sx/sl*b,y=ty*a+c,z=tz*a+sz/sl*b,l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];};
 const clump=(p,s)=>{FOL.push([p[0],p[1],p[2],s]);};

 const GOLD=2.399963,a0=rr(0,TAU);
 const limbs=[];
 const addBough=(u,ang,len,el,curve,rScale)=>{
  const y=H*u,r0=trunkR(y)*(u>.93?.6:1);
  const o=[Math.cos(ang)*Math.max(0,r0-1),y,Math.sin(ang)*Math.max(0,r0-1)];
  const dir=[Math.cos(ang)*Math.cos(el),Math.sin(el),Math.sin(ang)*Math.cos(el)];
  limbs.push(grow(o,dir,len,clamp(r0*rScale,.9,5.5),.5,8,curve,.06));};
 // SPECIES[0].crown0 is 0.50, i.e. the crown starts at half height. In the
 // source most of the lower crown hangs off the city's own structural
 // branches, which are not imported, so without a third tier here the trunk
 // stands bare to 72% and the tree reads as a palm.
 for(let k=0;k<8;k++) addBough(rr(.855,.955),a0+k*GOLD+rr(-.3,.3),CR*rr(.62,.92),rr(.22,.52),-.12,.62);
 for(let k=0;k<7;k++) addBough(rr(.72,.86),a0+1.2+k*GOLD+rr(-.3,.3),CR*rr(.62,.90),rr(.18,.42),-.16,.46);
 for(let k=0;k<7;k++) addBough(rr(.52,.70),a0+2.4+k*GOLD+rr(-.3,.3),CR*rr(.50,.78),rr(.02,.26),-.20,.40);
 // the crown lower bound, so no foliage hangs below where the source starts it
 const yMinFol=H*CROWN0-28;

 limbs.forEach(P=>{
  skin(P,8);
  const n=P.length;let s=-1;
  for(let i=2;i<n;i++){                      // secondaries, alternating sides
   const t=i/(n-1);
   const tx=P[i][0]-P[i-1][0],ty=P[i][1]-P[i-1][1],tz=P[i][2]-P[i-1][2];
   const tl=Math.hypot(tx,ty,tz)||1;s=-s;
   const len1=Math.max(14,CR*rr(.16,.26)*(1-.5*t));
   const d1=side(tx/tl,ty/tl,tz/tl,s,rr(.45,.8),rr(.7,1.1),.18+rr(-.12,.18));
   const rS=clamp(Math.min(P[i][3]*.62,len1*.032),.4,2.6);
   const sec=grow([P[i][0],P[i][1],P[i][2]],d1,len1,rS,.22,4,-.10,.07);
   skin(sec,5);
   const spr=clamp(len1*.26,8,20);
   for(let q=2;q<=4;q++)if(sec[q][1]>yMinFol)clump(sec[q],spr*(q===4?.9:1));
   let s2=-1;
   for(let j=1;j<=4;j++){                       // twigs off the secondary
    const ax=sec[j][0]-sec[j-1][0],ay=sec[j][1]-sec[j-1][1],az=sec[j][2]-sec[j-1][2];
    const al=Math.hypot(ax,ay,az)||1;s2=-s2;
    const len2=Math.max(8,len1*rr(.3,.5));
    const d2=side(ax/al,ay/al,az/al,s2,rr(.5,.9),rr(.6,1.0),.14+rr(-.15,.25));
    const tw=grow([sec[j][0],sec[j][1],sec[j][2]],d2,len2,Math.max(.25,sec[j][3]*.6),.12,2,-.10,.05);
    skin(tw,3);
    for(let q=1;q<=2;q++)if(tw[q][1]>yMinFol)clump(tw[q],clamp(len2*.42,6,13));}}});

 // ---- foliage --------------------------------------------------------------
 // Dark needle tiers. One blob per spot plus a couple of satellites, coloured
 // from the source's Ironbark leaf set.
 FOL.forEach(f=>{const n=2+Math.floor(rng()*3);
  for(let i=0;i<n;i++){const s=f[3]*rr(.55,1.05);
   kput('frond',[f[0]+rr(-.6,.6)*f[3],f[1]+rr(-.35,.35)*f[3],f[2]+rr(-.6,.6)*f[3]],
    qEuler(rng()*3,rng()*3,rng()*3),[s,s*.62,s],
    new THREE.Color(LEAFC[Math.floor(rng()*LEAFC.length)]));}});

 apron(G,0,0,RB*2.4,RB*7,d,2);
 scatterMoss(0,0,0,RB*1.2,CR*.7,90,3.2);
 figures(RB*2.2,0,6,40);
 KOFF=[0,0,0];return G;}
// ================================================================= SKYSCRAPER G — "the Ward" (SUNY: concrete block stack + dark glass drum)
function buildSkyG(scene,gx,gz,d){reseed(9160+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const H=210,Y0=6;REGISTER({name:'Skyscraper G — the Ward ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:150,h:H+30});
 skyPlinth(G,dd,130);
 // podium: long low concrete bar with a glass ribbon
 kput(BOXC(dd),[0,10,90],null,[240,10,30],null);kput(BOXC(dd),[0,17,90],null,[242,1.2,32],null);if(dd===0)kput('pane',[0,13,105.2],null,[236,4,1],null);else kput('boxD',[0,13,104],null,[236,4,1],null);
 for(let k=-8;k<=8;k++)kput(BOXC(dd),[k*14,13,105.4],null,[.8,5,.8],null);
 // the drum tower (dark glass, a few lit cells)
 const R=26;const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.85:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.8,77+(upper?1:0),cut!=null?L:null,1.3);
  const drum=lathe({rFn:()=>R,H:L,nu:64,nv:Math.round(L/4),hole:hole,seed:77});mesh(drum,dx>0?MAT.guts:MAT.darkGlass,P);
  if(dx>0){for(let y=4;y<L-2;y+=4)kput('slab',[0,y,0],null,[R*.95,.4,R*.95],new THREE.Color(0x2a2c30));mesh(lathe({rFn:()=>R*.6,H:L,nu:24,nv:2}),MAT.guts,P);}
  for(let y=6;y<L-4;y+=8)for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;if(hole&&hole(th/TAU,y))continue;if(rng()<.55)continue;const lit=dx>0?rng()<.04:true;kput('cell',[R*1.01*Math.cos(th),y,R*1.01*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[3,2.2,.5],lit?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}
  for(let y=0;y<L;y+=4)kput(dx>0?'ringR':'ringW',[0,y,0],qEuler(Math.PI/2,0,0),[R+.2,R+.2,1.5],null);
  if(cut==null){mesh(lathe({rFn:()=>R+1.5,H:8,nu:64,nv:1}),CONC(dx),P,0,L,0);kput(SLABC(dx),[0,L+8,0],null,[R+1.6,.8,R+1.6],null);kput(BOXC(dx),[0,L+11,0],null,[10,6,10],null);}};
 const CX=-70;const D=new THREE.Group();D.position.set(CX,Y0,0);G.add(D);useGroupXF(D);if(d<2)build(D,dd,Y0,null,false);else build(D,1,Y0,Y0+60,false);endGroupXF();
 // The drum falls WEST, away from its own block stack. Toppling it east dropped
 // 200 m of tower straight through the stack it is meant to stand beside.
 if(d===2)toppledUpper(G,CX,0,Y0+60,R,(U)=>build(U,1,Y0+60,null,true),d,-1);
 // block stack: 2×2 concrete blocks in two tiers on stilts, porthole strips, service cores between
 const BX=70,BW=42,BH=34,gap=10;const tiers=[[26,0],[26+BH+gap,1]];
 // Which blocks have come down. One gone out of eight read as barely touched;
 // the stack now loses most of its top tier, and a lower corner as well once
 // the tower itself has fallen. A lower block never goes without the one above
 // it, so nothing is left hanging in the air.
 const fallen=(tier,sx,sz)=>dd>0&&(tier===1?(sx>0||sz<0):(d===2&&sx>0&&sz<0));
 for(let k=0;k<8;k++){const x=BX+(k%4-1.5)*30,z=(k<4?-1:1)*30;kput(BOXC(dd),[x,Y0+13,z],null,[3.2,26,3.2],null);}
 tiers.forEach(t=>{const y=Y0+t[0];for(const sx of [-1,1])for(const sz of [-1,1]){const cx=BX+sx*(BW/2+gap/2),cz=sz*(BW/2+gap/2);const gone=fallen(t[1],sx,sz);
  if(gone){rubbleRing(cx+30,Y0,cz+20,5,40,50,3);continue;}
  const q=null;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=BW/2*se(th,5)*(1+.03*Math.sin(v*Math.PI));return[cx+r*Math.cos(th),y+v*BH,cz+r*Math.sin(th)];},64,8,{uS:12,vS:6,hole:holeFn(dd*.7,78,null,2)}),CONC(dd),G);
  kput(SLABC(dd),[cx,y+BH,cz],null,[BW/2*1.05,1,BW/2*1.05],null);kput('boxD',[cx,y+BH/2,cz],null,[BW-3,BH-2,BW-3],null);
  // porthole columns on the outer faces
  for(const f of [[sx,0],[0,sz]]){for(let r=0;r<6;r++)for(let c=-1;c<=1;c+=2){const px=cx+f[0]*(BW/2+.3)+(f[1]?c*7:0),pz=cz+f[1]*(BW/2+.3)+(f[0]?c*7:0);
   kput(dd>0?'ovalD':'ovalI',[px,y+5+r*5,pz],qFacing([f[0],0,f[1]]),[1.4,1.4,1],null);}}
  if(dd>0)mossOnRing(cx,y+BH+.5,cz,BW*.4,8,1.6);}
  // glass core between the four blocks
  if(dd===0)kput('pane',[BX,y+BH/2,0],null,[gap-1,BH,1],null);kput('boxD',[BX,y+BH/2,0],null,[gap-2,BH,gap-2],null);
  // bridges to the drum
  for(const bz of [-8,8]){const y1=y+BH*.55;if(dd>0&&t[1]===1&&bz===8)continue;
   if(d===2&&y1>Y0+60)continue;                     // the drum is cut at Y0+60; do not bridge to thin air
   kput(BOXC(dd),[(CX+R+BX-BW-gap/2)/2,y1-1.5,bz],null,[BX-BW-gap/2-CX-R,1,6],null);
   if(dd===0)kput('pane',[(CX+R+BX-BW-gap/2)/2,y1+1.5,bz+3],null,[BX-BW-gap/2-CX-R,4,1],null);else kput('boxD',[(CX+R+BX-BW-gap/2)/2,y1+1.5,bz],null,[BX-BW-gap/2-CX-R-2,3,4],null);
   for(let x=CX+R+4;x<BX-BW-gap/2;x+=5)kput(dd>0?'mullR':'mullW',[x,y1+1.5,bz+3.2],null,[.4,4,.4],null);}});
 kput('archOpen',[CX+R-1,Y0+5,0],qFacing([1,0,0]),[.7,.7,1],null);
 if(dd>0){vinesOnRing(CX,Y0+40,0,R,20,20);}
 figures(-100,140,6,6);KOFF=[0,0,0];return G;}

// ================================================================= FURNITURE
// Shared furniture models. Anything that goes inside or on top of a building
// lives here rather than being inlined where it is first needed, so the same
// piece can appear in a dwelling, on a terrace, and in the catalogue artifact
// without three slightly different versions drifting apart.
//
// Every piece takes (x,y,z,rot,s) with y the FLOOR it stands on and s a size
// multiplier, and every piece is built from instanced kit items so a hundred
// of them cost nothing. `FURN.list` is what the catalogue enumerates.
kdef('plank',new THREE.BoxGeometry(1,.09,.3),MAT.timber);
kdef('bowl',new THREE.SphereGeometry(1,10,6,0,TAU,Math.PI*.5,Math.PI*.5),MAT.rubble);
kdef('rope',new THREE.CylinderGeometry(.06,.06,1,5),MAT.lash||MAT.timber);

const FURN={
 // a sleeping platform on short legs, with a rolled mat
 // Five separate planks read as a pile of sticks at catalogue distance; the bed
 // is one slab with a frame, which is also what it actually is.
 bunk(x,y,z,rot,s){s=s||1;const q=qEuler(0,-rot,0);
  for(let i=-1;i<=1;i+=2)for(let j=-1;j<=1;j+=2)
   kput('postW',[x+Math.cos(rot)*i*1.6*s-Math.sin(rot)*j*.72*s,y+.36*s,
                 z+Math.sin(rot)*i*1.6*s+Math.cos(rot)*j*.72*s],null,[.28*s,.72*s,.28*s],null);
  kput(BOXC(1),[x,y+.78*s,z],q,[3.5*s,.2*s,1.6*s],new THREE.Color(0x7a6244));
  kput(BOXC(1),[x+Math.cos(rot)*1.62*s,y+1.06*s,z+Math.sin(rot)*1.62*s],q,
   [.28*s,.62*s,1.6*s],new THREE.Color(0x6a5238));
  kput('bowl',[x+Math.cos(rot)*1.0*s,y+.98*s,z+Math.sin(rot)*1.0*s],
   qEuler(1.5708,-rot,0),[.34*s,1.0*s,.34*s],new THREE.Color(0x8a7a52));},
 // a hammock slung between two points, as a shallow catenary of planks
 hammock(x,y,z,rot,s){s=s||1;const L=3.4*s;
  // overlapping slats that follow the sag, and tilt with it, so it reads as
  // slung cloth rather than a row of loose sticks
  for(let k=0;k<11;k++){const t=k/10-.5,sag=(.25-t*t)*1.9*s;
   kput(BOXC(1),[x+Math.cos(rot)*t*L,y-sag,z+Math.sin(rot)*t*L],qEuler(0,-rot,t*1.3),
    [L/10*1.3,.11*s,1.35*s],new THREE.Color(0x9a8a5e));}
  for(let i=-1;i<=1;i+=2)
   kput('rope',[x+Math.cos(rot)*i*L*.56,y+.46*s,z+Math.sin(rot)*i*L*.56],
    qEuler(0,0,i*.55),[s,1.9*s,s],null);},
 // a lidded chest
 chest(x,y,z,rot,s){s=s||1;const q=qEuler(0,-rot,0);
  kput(BOXC(1),[x,y+.42*s,z],q,[1.7*s,.85*s,1.0*s],new THREE.Color(0x6a5238));
  kput('plank',[x,y+.9*s,z],q,[1.8*s,s,1.1*s],null);
  for(let i=-1;i<=1;i+=2)
   kput('rope',[x-Math.sin(rot)*i*.42*s,y+.45*s,z+Math.cos(rot)*i*.42*s],
    qEuler(0,0,1.5708),[s,1.8*s,s],null);},
 // an open fruit basket
 // 'bowl' is the LOWER hemisphere, so it already opens upward; rotating it by
 // PI turned the basket into a dome with the fruit buried inside it.
 basket(x,y,z,rot,s){s=s||1;
  kput('bowl',[x,y+.62*s,z],qEuler(0,-rot,0),[.72*s,.8*s,.72*s],new THREE.Color(0x9a8450));
  for(let k=0;k<5;k++){const a=k/5*TAU+rot;
   kput('leafy',[x+Math.cos(a)*.26*s,y+.56*s,z+Math.sin(a)*.26*s],null,
    [.2*s,.2*s,.2*s],new THREE.Color(k%2?0xd08a2a:0xc25a3a));}},
 // a drying rack: two uprights and a run of poles
 rack(x,y,z,rot,s){s=s||1;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x+Math.cos(rot)*i*1.8*s,y+1.1*s,z+Math.sin(rot)*i*1.8*s],null,
    [.3*s,2.2*s,.3*s],null);
  for(let k=0;k<3;k++)
   kput('rope',[x,y+(1.2+k*.42)*s,z],qEuler(0,-rot,1.5708),[s,3.8*s,s],null);
  for(let k=0;k<6;k++)
   kput('plank',[x+Math.cos(rot)*(k/5-.5)*3*s,y+1.55*s,z+Math.sin(rot)*(k/5-.5)*3*s],
    qEuler(.6,-rot,0),[.7*s,s,.5*s],new THREE.Color(0x8a6a46));},
 // a cooking hearth: a ring of stones, ash, and a pot on a tripod
 hearth(x,y,z,rot,s){s=s||1;
  for(let k=0;k<9;k++){const a=k/9*TAU;
   kput('rubble',[x+Math.cos(a)*.95*s,y+.16*s,z+Math.sin(a)*.95*s],
    qEuler(rng(),rng(),rng()),[.34*s,.3*s,.34*s],null);}
  kput(SLABC(1),[x,y+.06*s,z],null,[.9*s,.12*s,.9*s],new THREE.Color(0x2a2420));
  for(let k=0;k<3;k++){const a=k/3*TAU+rot;
   kput('postW',[x+Math.cos(a)*.6*s,y+.9*s,z+Math.sin(a)*.6*s],
    qEuler(Math.cos(a)*.5,0,Math.sin(a)*.5),[.16*s,1.9*s,.16*s],null);}
  kput('bowl',[x,y+1.15*s,z],qEuler(Math.PI,0,0),[.5*s,.6*s,.5*s],new THREE.Color(0x44382e));},
 // a three-legged stool
 stool(x,y,z,rot,s){s=s||1;
  for(let k=0;k<3;k++){const a=k/3*TAU+rot;
   kput('postW',[x+Math.cos(a)*.34*s,y+.24*s,z+Math.sin(a)*.34*s],
    qEuler(Math.cos(a)*.22,0,Math.sin(a)*.22),[.14*s,.5*s,.14*s],null);}
  kput(SLABC(1),[x,y+.52*s,z],null,[.52*s,.1*s,.52*s],new THREE.Color(0x7a6244));},
 // a lashed ladder
 ladder(x,y,z,rot,s,h){s=s||1;h=h||4*s;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x-Math.sin(rot)*i*.36*s,y+h*.5,z+Math.cos(rot)*i*.36*s],null,
    [.17*s,h,.17*s],null);
  const n=Math.max(3,Math.round(h/(.5*s)));
  for(let k=1;k<n;k++)
   kput('rope',[x,y+k*h/n,z],qEuler(0,-rot,1.5708),[s,.82*s,s],null);},
 // a water jar
 // two hemispheres belly to belly, plus a neck: an egg needs a shoulder line
 jar(x,y,z,rot,s){s=s||1;const C=new THREE.Color(0x6e4a38);
  kput('bowl',[x,y+.56*s,z],qEuler(0,-rot,0),[.5*s,.58*s,.5*s],C);
  kput('bowl',[x,y+.56*s,z],qEuler(Math.PI,-rot,0),[.5*s,.5*s,.5*s],C);
  kput('postW',[x,y+1.1*s,z],null,[.19*s,.3*s,.19*s],C);
  kput(SLABC(1),[x,y+1.26*s,z],null,[.26*s,.07*s,.26*s],C);},
 // an upright loom with a part-woven web
 loom(x,y,z,rot,s){s=s||1;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x-Math.sin(rot)*i*1.1*s,y+1.3*s,z+Math.cos(rot)*i*1.1*s],null,
    [.24*s,2.6*s,.24*s],null);
  kput('rope',[x,y+2.5*s,z],qEuler(0,-rot,1.5708),[s,2.3*s,s],null);
  for(let k=0;k<9;k++)
   kput('rope',[x-Math.sin(rot)*(k/8-.5)*2*s,y+1.7*s,z+Math.cos(rot)*(k/8-.5)*2*s],
    null,[.5*s,1.7*s,.5*s],null);
  kput('plank',[x,y+.95*s,z],qEuler(0,-rot,0),[2.2*s,s,1.2*s],new THREE.Color(0x8a5a4a));},
};
FURN.list=['bunk','hammock','chest','basket','rack','hearth','stool','ladder','jar','loom'];

// ---------------------------------------------------------------- catalogue
// Lays every piece out on a lit plinth in a row, for the furniture artifact.
// One source for the models means the catalogue cannot drift from what is
// actually standing in the buildings.
function buildFurnCatalog(scene,gx,gz,d){reseed(9520+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const N=FURN.list.length,SP=11;
 REGISTER({name:'Furniture catalogue ('+N+' pieces)',x:(N-1)*SP*.5,z:0,r:N*SP*.6,h:12});
 mesh(gridSurface((u,v)=>[(u-.06)*(N*SP+10)-5,0,(v-.5)*26],4,4,{uS:12,vS:6}),MAT.slab,G);
 FURN.list.forEach((k,i)=>{const x=i*SP;
  kput(SLABC(0),[x,.5,0],null,[4.2,1,4.2],null);
  stripRing(x,1.1,0,4.0,0,14);
  REGISTER({name:'Furniture — '+k,x:x,z:0,r:4.4,h:9});
  FURN[k](x,1,0,0.6,1.6);});
 figures(-8,0,4,5);
 KOFF=[0,0,0];return G;}
// ================================================================= SKYSCRAPER H — "the Warden" (Elinhir: blank tapering keep with slits)
function buildSkyH(scene,gx,gz,d){reseed(9170+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const H=330,Y0=8;REGISTER({name:'Skyscraper H — the Warden ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:120,h:H+30});
 skyPlinth(G,dd,110);
 const half=y=>{const t=clamp(y/H,0,1);const step=Math.floor(t*5)/5;return 34*(1-.45*step)-2*(t*5-step*5)*.3;};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.7:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.9,87+(upper?1:0),cut!=null?L:null,1.1);
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const groove=Math.abs(Math.sin(2*th))>.995?.9:1;const r=half(y+y0)*se(th,7)*groove;return[r*Math.cos(th),y,r*Math.sin(th)];},128,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);if(dx>0){mesh(gridSurface((u,v)=>{const th=u*TAU,y=v*L;const r=half(y+y0)*.86*se(th,7);return[r*Math.cos(th),y,r*Math.sin(th)];},32,8,{}),MAT.guts,P);for(let y=6;y<L-2;y+=6)kput('slab',[0,y,0],null,[half(y+y0)*.9,.5,half(y+y0)*.9],new THREE.Color(0x2a2c30));}
  // setback ledges + corner turrets, slit windows sparse
  for(let s=1;s<5;s++){const ys=H*s/5-y0;if(ys<2||ys>L-2)continue;const h1=half(H*s/5-.1),h2=half(H*s/5+.1);kput(BOXC(dx),[0,ys,0],null,[h1*2+2,1.6,h1*2+2],null);
   for(const cx of [-1,1])for(const cz of [-1,1])kput(BOXC(dx),[cx*(h1-3),ys+4,cz*(h1-3)],null,[6,8,6],null);}
  for(let y=5;y<L-5;y+=9)for(let f=0;f<4;f++){const th=f*Math.PI/2;for(let k=-2;k<=2;k++){if(k===0||rng()<.5)continue;const r=half(y+y0)+.15;const u=((th+k*.12)/TAU+1)%1;if(hole&&hole(u,y))continue;
   const px=Math.cos(th)*r+(-Math.sin(th))*k*r*.32,pz=Math.sin(th)*r+Math.cos(th)*k*r*.32;kput(dx>0?'winSmD':'winSmI',[px,y,pz],qFacing([Math.cos(th),0,Math.sin(th)]),[.8,3.2,1],null);}}
  for(let yy=20;yy<L-10;yy+=40)stripRing(0,yy,0,half(yy+y0)*.9,dx,8);
  if(cut==null){const ht=half(H);kput(BOXC(dx),[0,L+1,0],null,[ht*2+3,2,ht*2+3],null);for(let k=0;k<12;k++){const a=k/12*TAU;const r=ht*se(a,7)+.5;kput(BOXC(dx),[r*Math.cos(a),L+4,r*Math.sin(a)],qEuler(0,-a,0),[2.5,5,3],null);}
   mesh(lathe({rFn:y=>ht*.55*(1-.3*y/30)+1.5*clamp((y-24)/6,0,1),H:30,flutes:4,amp:.15,sharp:2,nu:24,nv:10}),CONC(dx),P,0,L+2,0);kput('finial',[0,L+38,0],null,[3,5,3],null);stripRing(0,L+26,0,ht*.45,dx,12);}};
 bodyGroup(G,Y0,d,dd,build,Y0+80,half(Y0+80));
 if(dd>0)vinesOnRing(0,Y0+H/5,0,half(H/5)*1.05,20,30);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}

// ================================================================= THE SCREAMER VILLAGE
// Everything the tribe built, as opposed to everything it moved into. The
// vocabulary is Amazonian post-apocalyptic: lashed hardwood posts, palm thatch,
// and flattened sheet salvaged off the arcology, against a ruined Ancient wall
// they quarried out of the industry sheds that did not survive.
//
// buildHexahedron runs first (ROWS insertion order) and leaves SCREAM behind
// with the surviving dwelling clusters, the shaft bundle's centre and the
// ground-terrace height function. Nothing here recomputes any of that.
let SCREAM=null,SCREAM_PROM=null,SCREAM_PLAZA=null;
const wrapPiV=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};

TEX.thatch=canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#6b5a33';g.fillRect(0,0,w,h);
 for(let i=0;i<2600;i++){const x=rng()*w,y=rng()*h,L=6+rng()*22,a=(rng()-.5)*.5;
  g.strokeStyle='rgba('+(104+rng()*58|0)+','+(88+rng()*48|0)+','+(48+rng()*30|0)+','+(.25+rng()*.5).toFixed(2)+')';
  g.lineWidth=1+rng()*1.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(a)*3,y+L);g.stroke();}
 for(let i=0;i<9;i++){const y=i/9*h;g.strokeStyle='rgba(70,56,30,.30)';g.lineWidth=3;
  g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}},4);
TEX.lash=canvasTex(128,256,(g,w,h)=>{
 g.fillStyle='#6a5038';g.fillRect(0,0,w,h);
 for(let i=0;i<420;i++){const x=rng()*w;g.strokeStyle='rgba('+(110+rng()*70|0)+','+(82+rng()*50|0)+','+(52+rng()*36|0)+',.5)';
  g.lineWidth=1+rng()*3;g.beginPath();g.moveTo(x,0);g.lineTo(x+(rng()-.5)*8,h);g.stroke();}
 for(let k=0;k<4;k++){const y=(k+.5)/4*h;g.strokeStyle='rgba(188,170,120,.75)';g.lineWidth=5;
  g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}},3);
MAT.thatch=new THREE.MeshStandardMaterial({map:TEX.thatch,color:0xa8996f,roughness:1,metalness:0,side:DS});
MAT.lash  =new THREE.MeshStandardMaterial({map:TEX.lash,color:0xffffff,roughness:.96,metalness:0,side:DS});
MAT.scrap =new THREE.MeshStandardMaterial({map:TEX.corrugate||null,color:0x8a6a52,roughness:.72,metalness:.34,side:DS});
// Ironbark: fibrous red-brown, and much darker than the lashed-timber material
// the boles were borrowing -- against a jungle they were reading as bleached.
MAT.bark=new THREE.MeshStandardMaterial({map:TEX.lash,color:0x6a4030,roughness:1,metalness:0,side:DS});

kdef('thatchR',new THREE.ConeGeometry(.72,1,4,1).rotateY(Math.PI/4),MAT.thatch);
kdef('thatchH',new THREE.ConeGeometry(.72,1,6,1),MAT.thatch);
kdef('postW',new THREE.CylinderGeometry(.5,.62,1,7),MAT.lash);
kdef('doorD',new THREE.BoxGeometry(1,1,.3),MAT.dark);
kdef('scrapP',new THREE.BoxGeometry(1,1,.12),MAT.scrap);
// Ancient barrel vaults, used by the reoccupied ground-floor sheds. Declared
// here with the rest of the kdefs; buildHexahedron only needs them at call
// time, which is long after every fragment has loaded.
kdef('vaultW',new THREE.CylinderGeometry(.5,.5,1,14),MAT.concrete);
kdef('vaultR',new THREE.CylinderGeometry(.5,.5,1,14),MAT.concreteR);
const VAULTC=d=>d>0?'vaultR':'vaultW';
// A 20-triangle leaf blob. The kit's 'moss' is an Icosahedron(1,1) at 80, and
// at a hundred-odd balcony orchards plus the plaza planting that was the
// difference between fitting the mega budget and not.
// FOLIAGE, the way Girder does it. A clump is THREE CROSSED QUADS carrying an
// alpha-mapped leaf cluster -- six triangles -- instead of a solid low-poly
// blob at twenty. It is cheaper AND it reads as leaves: a faceted icosahedron
// on a stick reads as a boulder on a pole, which is exactly what this jungle
// looked like.
TEX.leaf=(function(){const S=256,c=document.createElement('canvas');c.width=c.height=S;
 const g=c.getContext('2d');g.clearRect(0,0,S,S);
 const leaf=(x,y,len,wid,ang,lum)=>{g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle='rgb('+(lum*.42|0)+','+(lum|0)+','+(lum*.40|0)+')';
  g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.45,wid,len,0);
  g.quadraticCurveTo(len*.45,-wid,0,0);g.fill();
  g.strokeStyle='rgba(20,40,16,.30)';g.lineWidth=1.2;
  g.beginPath();g.moveTo(0,0);g.lineTo(len*.92,0);g.stroke();g.restore();};
 for(let i=0;i<9;i++){const cx=S*rr(.16,.84),cy=S*rr(.16,.84),n=8+Math.floor(rng()*7);
  for(let k=0;k<n;k++)leaf(cx,cy,rr(S*.10,S*.23),rr(S*.024,S*.052),
   k/n*TAU+rr(-.25,.25),rr(78,196));}
 // RGB is filled in where alpha is low, or mipmapping bleeds a black fringe
 // round every leaf at distance
 const id=g.getImageData(0,0,S,S),d2=id.data;
 for(let o2=0;o2<d2.length;o2+=4)if(d2[o2+3]<48){d2[o2]=48;d2[o2+1]=104;d2[o2+2]=44;}
 g.putImageData(id,0,0);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;
 return t;})();
// alphaTest, not transparent: it renders in the opaque pass with correct depth,
// so tens of thousands of clumps need no sorting
MAT.leaf=new THREE.MeshStandardMaterial({map:TEX.leaf,alphaTest:.42,roughness:1,
 metalness:0,side:THREE.DoubleSide});
kdef('clump',(function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const az=k/3*TAU+.3,tilt=.92,ca=Math.cos(az),sa=Math.sin(az);
  const n=[Math.sin(tilt)*ca,Math.cos(tilt),Math.sin(tilt)*sa];
  const u=[-sa,0,ca],v=[-Math.cos(tilt)*ca,Math.sin(tilt),-Math.cos(tilt)*sa];
  const c2=[n[0]*.10,n[1]*.10-.04,n[2]*.10];
  const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>
   [c2[0]+u[0]*q[0]+v[0]*q[1],c2[1]+u[1]*q[0]+v[1]*q[1],c2[2]+u[2]*q[0]+v[2]*q[1],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);
   uv.push(P[i][3],P[i][4]);nor.push(n[0],n[1],n[2]);});}
 const g2=new THREE.BufferGeometry();
 g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g2.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 g2.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 return g2;})(),MAT.leaf);
kdef('leafy',new THREE.IcosahedronGeometry(1,0),MAT.turf);
// understorey vocabulary, in the Girder idiom: fern rosettes, palm crowns and
// shelf fungus, so the forest floor is not one blob repeated
kdef('fern',new THREE.ConeGeometry(1,1,7,1,true),MAT.turf);
kdef('frondL',new THREE.BoxGeometry(1,.06,.34),MAT.turf);
kdef('fungus',new THREE.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),MAT.rubble);

// A FLATIRON TOWER, in the Hexahedron's own language: a wedge plan with a
// rounded prow, stepped setbacks, dwelling cells on every tread and glazing on
// every riser, on a chamfered plinth under a crowning slab. The awnings are
// the tribe's, and they are allowed to cross the footprint.
function flatiron(G,cx,cz,y0,ang,L,Wd,H){
 const NF=15,RF=H/NF,TOPS=.34,ch=.10;
 const C=[[L*.60,0],[-L*.40,Wd*.5],[-L*.40,-Wd*.5]],P=[];
 for(let i=0;i<3;i++){const A=C[i],B=C[(i+1)%3];
  P.push([lerp(A[0],B[0],ch),lerp(A[1],B[1],ch)]);
  P.push([lerp(A[0],B[0],1-ch),lerp(A[1],B[1],1-ch)]);}
 const ca=Math.cos(ang),sa=Math.sin(ang);
 const pt=(p,s)=>{const n=P.length,q=(p-Math.floor(p))*n,i=Math.floor(q),f=q-i;
  const A=P[i],B=P[(i+1)%n];
  const lx=lerp(A[0],B[0],f)*s,lz=lerp(A[1],B[1],f)*s;
  return[cx+lx*ca-lz*sa,cz+lx*sa+lz*ca];};
 // outward normal from the outline tangent; the plan is wound CCW so it is
 // (dz,-dx), the same convention the Hexahedron uses
 const nrm=(p,s)=>{const A=pt(p-.004,s),B=pt(p+.004,s);
  const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1;return[dz/l,-dx/l];};
 const sc=k=>lerp(1,TOPS,Math.pow(k/NF,.95));
 const MF=[],big=Math.max(L,Wd);
 kput(SLABC(1),[cx,y0+2,cz],qEuler(0,-ang,0),[big*.60,4,big*.60],null);
 for(let k=0;k<NF;k++){const yy=y0+4+k*RF,s0=sc(k),s1=sc(k+1);
  MF.push(gridSurface((u,v)=>{const Q=pt(u,s0);return[Q[0],yy+v*RF,Q[1]];},60,2,{uS:22,vS:2}));
  MF.push(gridSurface((u,v)=>{const Q=pt(u,lerp(s0,s1,v));return[Q[0],yy+RF,Q[1]];},60,2,{uS:22,vS:2}));
  const nc=Math.max(6,Math.round(32*s0));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc,N=nrm(p,s0),qf=qFacing([N[0],0,N[1]]);
   const Q=pt(p,lerp(s0,s1,.30)),hh=rr(3,6.5);
   kput(BOXC(1),[Q[0],yy+RF+hh*.5,Q[1]],qf,[rr(5,9),hh,rr(4,7)],null);
   const R2=pt(p,s0);
   for(let row=0;row<2;row++)
    kput('paneD',[R2[0]+N[0]*.4,yy+RF*(.28+row*.38),R2[1]+N[1]*.4],qf,[2.2,2.8,1],null);}
  // AWNINGS shade an opening, or they are a shelf over blank wall -- which is
  // what they were, sitting above the top window row on a band with no door.
  // Each one now gets a door and a pair of windows under it, and the canopy
  // drops to just above their heads.
  if(k%4===2)for(let j=0;j<7;j++){const p=(j+.5)/7,N=nrm(p,s0),Q=pt(p,s0);
   const qf=qFacing([N[0],0,N[1]]);
   kput('doorD',[Q[0]+N[0]*.45,yy+RF*.30,Q[1]+N[1]*.45],qf,[3.4,6.4,1],null);
   for(let sd=-1;sd<=1;sd+=2)
    kput('paneD',[Q[0]+N[0]*.45-N[1]*sd*4.2,yy+RF*.34,Q[1]+N[1]*.45+N[0]*sd*4.2],
     qf,[2.6,3.4,1],null);
   const ex=Q[0]+N[0]*16,ez=Q[1]+N[1]*16;
   for(let sd=-1;sd<=1;sd+=2)
    beam('postW',[Q[0]-N[1]*sd*7,yy+RF*.62,Q[1]+N[0]*sd*7],
     [ex-N[1]*sd*6,yy+RF*.50,ez+N[0]*sd*6],1.5,1.5);
   kput('thatchR',[(Q[0]+ex)*.5,yy+RF*.60,(Q[1]+ez)*.5],qf,[18,4,16],null);}}
 // THE ENTRANCE. It did not meet anything before: the door panel started below
 // the plinth it stands on, the arch was a third its size and floated clear of
 // it, and the steps ran DOWN from the plinth top past the deck. The threshold
 // is the plinth top (y0+4), the arch frames the door rather than sitting
 // beside it, the posts stand on the plinth, and the steps land on the deck.
 {const N=nrm(.5,1),D=pt(.5,1),q=qFacing([N[0],0,N[1]]),TH=y0+4;
  const P=(o1,o2,yy)=>[D[0]+N[0]*o1-N[1]*o2,yy,D[1]+N[1]*o1+N[0]*o2];
  // porch slab on the plinth, projecting out under the door
  {const A=P(5,0,TH+.7);kput(SLABC(1),[A[0],A[1],A[2]],q,[22,1.4,13],null);}
  {const A=P(.4,0,TH+5);kput('doorD',[A[0],A[1],A[2]],q,[8.4,10,1],null);}
  {const A=P(1.1,0,TH+5.4);kput('archOpen',[A[0],A[1],A[2]],q,[4.6,4.4,4.2],null);}
  for(let s2=-1;s2<=1;s2+=2){const A=P(4.4,s2*7.2,TH+6.5);
   kput('postW',[A[0],A[1],A[2]],null,[2.6,13,2.6],null);}
  {const A=P(4.4,0,TH+13.4);kput('postW',[A[0],A[1],A[2]],qEuler(0,-Math.atan2(N[0],-N[1]),1.5708),[2.4,17,2.4],null);}
  // three steps from the porch down to the plaza deck at y0
  for(let j=0;j<3;j++){const A=P(11+j*3.4,0,TH-1.1-j*1.2);
   kput(SLABC(1),[A[0],A[1],A[2]],q,[19-j*2.4,1.5,8],null);}}
 const top=y0+4+NF*RF;
 kput(SLABC(1),[cx,top+2,cz],qEuler(0,-ang,0),[big*.24,4,big*.24],null);
 // The canopy sat at top+4 while the posts carrying it ran to top+15, so it
 // was inside its own frame. It sits on them now.
 for(let q=0;q<8;q++){const a2=q/8*TAU;
  kput('postW',[cx+Math.cos(a2)*big*.20,top+15,cz+Math.sin(a2)*big*.20],null,[2.4,28,2.4],null);}
 // the canopy stands clear above the platform rather than sitting on it, so the
 // top terrace is a usable lookout and not a crawlspace
 kput('thatchH',[cx,top+33,cz],qEuler(0,.3,0),[big*.38,24,big*.38],null);
 meshMerged(MF,MAT.concreteR,G);
 return top;}

// --------------------------------------------------------------------------
function buildVillage(scene,gx,gz,d){reseed(9470+d);KOFF=[gx,0,gz];
 if(!SCREAM){reportErr('village: buildHexahedron left no SCREAM handoff');return null;}
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const {clusters:CL,com:COM,hexr:HEXR,plate:plateY}=SCREAM;
 const WR=HEXR*1.16;                              // the wall stands outside the mesa
 REGISTER({name:'Screamer village — the wall',x:0,z:0,r:WR+30,h:16});
 REGISTER({name:'Screamer village — the lobby',x:COM[0],z:COM[1],r:300,h:64});
 const MER=[],MTH=[],MSC=[];
 // ANTI-OVERLAP PRIORITY. Streets and walls, then the ancient dwellings, then
 // the tribe's own sheds, then farms and furniture -- each tier is placed
 // first and registered in OCC, so every later tier has to fit round it. OCC
 // is declared up here rather than down with the siting code because the wall
 // and the trails go in before anything is rejection-sampled.
 const OCC=[];
 const claim=(x,z,r,tag)=>{OCC.push({x:x,z:z,r:r,tag:tag||'fixed'});};
 // The ANCIENTS' ground works were never in the occupancy list: six sector
 // roads running 595 m out from the middle and the hexagon's own rim wall.
 // Farms were being laid straight across both. Claim them first -- they are
 // older than anything the tribe built and they are tier 1.
 if(SCREAM.roads)SCREAM.roads.forEach(R=>{
  for(let t=.16;t<=1.001;t+=.055)
   claim(R[0]*R[2]*t,R[1]*R[2]*t,17,'road');});

 // ---- the wall: ruined Ancient fabric, hexagonal, cylindrical guard towers --
 // Quarried out of the sheds that fell, so it is the same concrete as the
 // arcology, laid in a line that follows the hexagon the Ancients set out.
 const corner=e=>{const a=e/6*TAU;const R=hexR(WR,a);return[Math.cos(a)*R,Math.sin(a)*R,a];};
 const GATE=[0,3];                                // two gates, on opposite flats
 for(let e=0;e<6;e++){const A=corner(e),B=corner((e+1)%6);
  const n=34,gate=GATE.indexOf(e)>=0;
  for(let j=0;j<n;j++){const t=(j+.5)/n;
   if(gate&&Math.abs(t-.5)<.075)continue;         // the gateway
   const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
   const ang=Math.atan2(B[1]-A[1],B[0]-A[0]);
   const y=plateY(x,z);
   // the parapet sags and breaks: this wall has stood a long time
   const hh=11*(.72+.5*fbm(t*7+e,1.3,9471,3))*(rng()<.06?.35:1);
   const seg=Math.hypot(B[0]-A[0],B[1]-A[1])/n*1.02;
   kput(BOXC(1),[x,y+hh*.5,z],qEuler(0,-ang,0),[seg,hh,rr(5.5,7)],null);
   claim(x,z,seg*.6,'wall');
   if(rng()<.30)kput(BOXC(1),[x,y+hh+1.1,z],qEuler(0,-ang,0),[seg*.8,2.2,4.4],null);
   // lashed hoarding along the walk, tribal work on an Ancient base
   if(rng()<.42)kput('postW',[x,y+hh+2.4,z],null,[1.3,rr(3,5),1.3],null);}
  // cylindrical guard tower on the corner
  const y=plateY(A[0],A[1]),TH2=rr(20,26);
  MER.push(lathe({rFn:yy=>10.5-1.6*clamp(yy/TH2,0,1)+.5*Math.sin(yy*.5),H:TH2,nu:26,nv:12,
   hole:holeFn(.55,9472+e,null,1.6)}).translate(A[0],y,A[1]));
  kput(SLABC(1),[A[0],y+TH2+1.2,A[1]],null,[12.5,2.4,12.5],null);
  kput('thatchH',[A[0],y+TH2+9,A[1]],qEuler(0,rng()*TAU,0),[17,15,17],null);
  for(let q=0;q<5;q++){const a2=q/5*TAU+e;
   kput('postW',[A[0]+Math.cos(a2)*10.5,y+TH2+5,A[1]+Math.sin(a2)*10.5],null,[1.4,7,1.4],null);}
  if(gate){ // gate posts and a lashed lintel on the flat this edge carries
   const mx=(A[0]+B[0])*.5,mz=(A[1]+B[1])*.5,ga=Math.atan2(B[1]-A[1],B[0]-A[0]);
   for(let q=-1;q<=1;q+=2){const px=mx-Math.sin(ga)*0+Math.cos(ga)*q*26,pz=mz+Math.sin(ga)*q*26;
    kput('postW',[px,plateY(px,pz)+11,pz],null,[4.5,22,4.5],null);}
   kput('postW',[mx,plateY(mx,mz)+23,mz],qEuler(0,-ga,1.5708),[3.2,56,3.2],null);}}

 // the wall circuit and the two gateways, handed on for the patrols and for
 // the warrior party that has to come in through one of them
 {const CIRC=[],GATES=[];
  for(let e=0;e<6;e++){const A=corner(e),B=corner((e+1)%6);
   CIRC.push([A[0],plateY(A[0],A[1])+8,A[1]]);
   if(GATE.indexOf(e)>=0){const mx=(A[0]+B[0])*.5,mz=(A[1]+B[1])*.5;
    GATES.push([mx,plateY(mx,mz)+.3,mz]);}}
  SCREAM.circuit=CIRC;SCREAM.gates=GATES;SCREAM.wallR=WR;}

 // ---- the lobby: a hexagon of doors round the foot of the shaft bundle ------
 // The Ancients left no way in at ground level, so the tribe cut one: a ring
 // wall against the bottom two storeys of the supports, with a door on every
 // face, and the whole thing roofed in thatch against the rains.
 {const LR=232,LH=46,cx=COM[0],cz=COM[1];
  for(let e=0;e<6;e++){const a0=e/6*TAU+.08,a1=(e+1)/6*TAU-.08;
   const n=16;
   for(let j=0;j<n;j++){const t=(j+.5)/n,a=lerp(a0,a1,t);
    const x=cx+Math.cos(a)*LR,z=cz+Math.sin(a)*LR,y=plateY(x,z);
    const seg=LR*(a1-a0)/n*1.03;
    kput(BOXC(1),[x,y+LH*.5,z],qEuler(0,-a,0),[7,LH,seg],null);
    if(j===Math.floor(n/2)||j===Math.floor(n/2)-3||j===Math.floor(n/2)+3)
     kput('doorD',[x+Math.cos(a)*3.6,y+7,z+Math.sin(a)*3.6],qFacing([Math.cos(a),0,Math.sin(a)]),[6,14,1],null);
    if(j%4===0)kput('postW',[x+Math.cos(a)*5,y+LH+3,z+Math.sin(a)*5],null,[2,7,2],null);}
   // thatch pitch over the walk, sloping out from the wall head
   const am=(a0+a1)*.5,mx=cx+Math.cos(am)*(LR+9),mz=cz+Math.sin(am)*(LR+9);
   kput('thatchR',[mx,plateY(mx,mz)+LH+11,mz],qEuler(0,-am,0),[32,22,LR*(a1-a0)*1.05],null);}
  stripRing(cx,LH+6,cz,LR+2,0,26);
  SCREAM.lobby=[cx+Math.cos(-1.9)*(LR+6),plateY(cx,cz)+.3,cz+Math.sin(-1.9)*(LR+6)];}

 // ---- foottrails, cluster to lobby -----------------------------------------
 // Beaten earth, not paving: a chain of trodden patches that wanders, because
 // nobody surveyed it. Each one runs from a cluster centroid to the nearest
 // point on the lobby ring rather than to its centre, which is where people
 // would actually walk to.
 CL.forEach((C,ci)=>{
  const a=Math.atan2(C.z-COM[1],C.x-COM[0]);
  const ex=COM[0]+Math.cos(a)*244,ez=COM[1]+Math.sin(a)*244;
  const n=Math.max(8,Math.round(Math.hypot(ex-C.x,ez-C.z)/13));
  for(let j=0;j<=n;j++){const t=j/n;
   const wob=Math.sin(t*Math.PI)*(fbm(t*4+ci,ci*.7,9473,2)-.5)*54;
   const x=lerp(C.x,ex,t)-Math.sin(a)*wob,z=lerp(C.z,ez,t)+Math.cos(a)*wob;
   kput(SLABC(1),[x,plateY(x,z)+.35,z],qEuler(0,rng()*TAU,0),[rr(5,8.5),.5,rr(5,8.5)],
    new THREE.Color(0x4a3524));
   claim(x,z,7,'trail');}});


 // ---- overlap bookkeeping ---------------------------------------------------
 // The ancient sheds have priority: they were here first, they keep their
 // positions AND their orientations, and everything the tribe put up since fits
 // round them. OCC starts as their footprints and grows as we build.
 SCREAM.sheds.forEach(q=>claim(q.x,q.z,q.r,'shed'));   // the ancient dwellings, tier 2
 // the lift is fixed infrastructure and cannot move, so it is claimed before
 // anything that CAN move gets a chance to take its ground
 {const PA=-1.5708,px=COM[0]+Math.cos(PA)*272,pz=COM[1]+Math.sin(PA)*272;claim(px,pz,34,'lift');}
 // ...and stay off the Ancients' rim wall, which the old 0.90 of WR did not
 const RIM=SCREAM.rim||620;
 const inWall=(x,z)=>{const m=Math.hypot(x,z);
  return m<hexR(WR,Math.atan2(z,x))*.90&&m<RIM*.93;};
 const free=(x,z,r,gap)=>{gap=gap==null?7:gap;
  if(!inWall(x,z))return false;
  if(Math.hypot(x-COM[0],z-COM[1])<288)return false;      // the lobby precinct
  for(const q of OCC)if(Math.hypot(x-q.x,z-q.z)<r+q.r+gap)return false;
  return true;};
 const siteNear=(C,r,rad)=>{for(let t=0;t<48;t++){
   const a=rng()*TAU,m=rad*(.7+.9*rng());
   const x=C.x+Math.cos(a)*m,z=C.z+Math.sin(a)*m;
   if(free(x,z,r)){claim(x,z,r,'built');return[x,z,a];}}
  return null;};
 // ConeGeometry(.72,1,4) rotated 45 deg is a square pyramid whose base corners
 // sit at 0.72*scale on each axis, so a footprint of L needs scale L/1.44.
 const pitch=(x,y,z,rot,L,Wd,h)=>kput('thatchR',[x,y,z],qEuler(0,-rot,0),[L/1.44,h,Wd/1.44],null);

 // ---- warehouses: big hexagons of lashed post, plank and salvaged sheet -----
 const warehouse=(x,z,rot,R)=>{const y=plateY(x,z),H=17;
  for(let k=0;k<6;k++){const am=(k+.5)/6*TAU+rot,av=k/6*TAU+rot;
   const mx=x+Math.cos(am)*R*.866,mz=z+Math.sin(am)*R*.866;
   kput('scrapP',[mx,y+H*.5,mz],qFacing([Math.cos(am),0,Math.sin(am)]),[R*1.02,H,1],null);
   kput('postW',[x+Math.cos(av)*R,y+H*.56,z+Math.sin(av)*R],null,[3.6,H*1.12,3.6],null);}
  // ConeGeometry sits centred on its origin: placing it at the wall head put
  // its base 12.8 m BELOW the head and swallowed the top of the walls. It has
  // to be lifted by half its own height.
  kput('thatchH',[x,y+H+R*.40,z],qEuler(0,-rot,0),[R*1.5,R*.8,R*1.5],null);
  kput('doorD',[x+Math.cos(rot)*R*.9,y+5.5,z+Math.sin(rot)*R*.9],qFacing([Math.cos(rot),0,Math.sin(rot)]),[8,11,1],null);
  for(let q=0;q<5;q++){const a2=rng()*TAU,m=R*(1.15+rng()*.5);   // stacked goods outside
   kput(BOXC(1),[x+Math.cos(a2)*m,y+rr(1,3),z+Math.sin(a2)*m],qEuler(0,rng()*TAU,0),[rr(3,7),rr(2,5),rr(3,7)],null);}};

 // ---- the captive's pen -----------------------------------------------------
 // Its own model, and it does not pretend to be anything else: a double ring of
 // sharpened posts with no gaps, one barred gate, a raised platform so a guard
 // can see the whole floor at once, and an open shelter with no walls.
 const captivePen=(x,z,rot,R)=>{const y=plateY(x,z);
  SCREAM.pen={x:x,z:z,y:y,r:R,rot:rot};
  REGISTER({name:"Screamer village — the captive's pen",x:x,z:z,r:R+14,h:26});
  for(let ring=0;ring<2;ring++){const rr2=R+ring*7,n=Math.round(rr2*.72);
   for(let k=0;k<n;k++){const a=k/n*TAU+ring*.09;
    if(ring===0&&Math.abs(wrapPiV(a-rot))<.20)continue;        // the gateway
    const px=x+Math.cos(a)*rr2,pz=z+Math.sin(a)*rr2;
    kput('postW',[px,y+rr(6,8),pz],qEuler(rr(-.05,.05),0,rr(-.05,.05)),[2.2,rr(12,16),2.2],null);
    kput('postW',[px,y+rr(13,16),pz],null,[1.4,3.4,1.4],null);}}   // sharpened heads
  // barred gate
  for(let q=0;q<4;q++)kput('postW',[x+Math.cos(rot)*R,y+3+q*3.2,z+Math.sin(rot)*R],
   qEuler(0,-rot,1.5708),[1.5,12,1.5],null);
  // open shelter, no walls
  pitch(x-Math.cos(rot)*R*.35,y+8,z-Math.sin(rot)*R*.35,rot+.4,R*.9,R*.65,7);
  for(let q=0;q<4;q++){const a2=q/4*TAU+rot;
   kput('postW',[x-Math.cos(rot)*R*.35+Math.cos(a2)*R*.4,y+4,z-Math.sin(rot)*R*.35+Math.sin(a2)*R*.4],null,[2,8,2],null);}
  // guard platform
  const gx2=x+Math.cos(rot+2.1)*(R+4),gz2=z+Math.sin(rot+2.1)*(R+4);
  for(let q=0;q<4;q++){const a2=q/4*TAU+.7;
   kput('postW',[gx2+Math.cos(a2)*4,y+9,gz2+Math.sin(a2)*4],null,[2.4,18,2.4],null);}
  kput(SLABC(1),[gx2,y+18.5,gz2],null,[8,1.4,8],null);
  kput('thatchH',[gx2,y+23,gz2],qEuler(0,rng()*TAU,0),[12,8,12],null);
  // fire pit and scatter
  kput(SLABC(1),[x,y+.4,z],null,[7,.8,7],new THREE.Color(0x30241c));
  rubbleRing(x,0,z,R*.3,R*.85,22,1.6);};

 // ---- longhouses ------------------------------------------------------------
 // FOUR walls and a proper gable. It had two long sides, no ends, and a hip
 // pyramid dropped on top of them -- which is what made it read as janky. The
 // roof is two real planes meeting at a ridge, built as geometry rather than a
 // cone, and the gable triangles close the ends under it.
 const longhouse=(x,z,rot,L,Wd)=>{const y=plateY(x,z),H=9,RH=7;
  const cr=Math.cos(rot),sr=Math.sin(rot);
  const at=(t,w,yy)=>[x+cr*t-sr*w,yy,z+sr*t+cr*w];
  for(let q=-1;q<=1;q+=2){                                  // the two long sides
   const P=at(0,q*Wd*.5,y+H*.5);
   kput('scrapP',[P[0],P[1],P[2]],qFacing([-sr*q,0,cr*q]),[L,H,1],null);}
  for(let q=-1;q<=1;q+=2){                                  // and the two ends
   const P=at(q*L*.5,0,y+H*.5);
   kput('scrapP',[P[0],P[1],P[2]],qFacing([cr*q,0,sr*q]),[Wd,H,1],null);}
  for(let j=0;j<=6;j++){const t=(j/6-.5)*L;                 // the post frame
   for(let q=-1;q<=1;q+=2){const P=at(t,q*Wd*.5,y+H*.62);
    kput('postW',[P[0],P[1],P[2]],null,[2,H*1.24,2],null);}}
  // the two roof planes, v=0 at the eave and v=1 at the ridge
  for(let sd=-1;sd<=1;sd+=2)
   MTH.push(gridSurface((u,v)=>{const t=(u-.5)*L*1.06,w=sd*(1-v)*Wd*.62;
    return at(t,w,y+H+v*RH);},14,3,{uS:L/3.2,vS:3}));
  // gable triangles, so there is no hole under the ridge at either end
  for(let q=-1;q<=1;q+=2)
   MSC.push(gridSurface((u,v)=>{const w=(u-.5)*Wd*(1-v);
    return at(q*L*.5,w,y+H+v*RH);},6,3,{uS:4,vS:3}));
  // the ridge pole, oversailing both gables
  {const A=at(-L*.56,0,y+H+RH),B=at(L*.56,0,y+H+RH);
   beam('postW',[A[0],A[1],A[2]],[B[0],B[1],B[2]],2.2,2.2);}
  const D=at(L*.5,0,y+4.4);
  kput('doorD',[D[0],D[1],D[2]],qFacing([cr,0,sr]),[5,8.4,1],null);};

 // ---- site them, near the clusters -----------------------------------------
 let nW=0,nL=0,penDone=false;
 CL.forEach(C=>{
  if(nW<4){const S=siteNear(C,36,C.r+78);
   if(S){nW++;
    if(!penDone&&nW===2){captivePen(S[0],S[1],S[2],30);penDone=true;}
    else warehouse(S[0],S[1],S[2],32);}}
  const want=1+(rng()<.5?1:0);
  for(let q=0;q<want&&nL<6;q++){const S=siteNear(C,26,C.r+62);
   if(S){nL++;longhouse(S[0],S[1],S[2],44,17);}}});
 if(!penDone&&CL.length){const S=siteNear(CL[0],34,CL[0].r+90);
  if(S)captivePen(S[0],S[1],S[2],30);}

 // ---- smithies and scrap heaps ----------------------------------------------
 // Where the salvaged sheet on every wall in this village comes from. Open-
 // sided sheds so the forge light gets out, a domed hearth with a stack, an
 // anvil, a quench trough, racks of stock, and the spoil heaps beside them.
 const scrapHeap=(hx,hz,R)=>{const y=plateY(hx,hz);
  for(let q=0;q<26;q++){const a=rng()*TAU,m=Math.sqrt(rng())*R;
   const px=hx+Math.cos(a)*m,pz=hz+Math.sin(a)*m;
   const lift=(1-m/R)*rr(1.5,5.5);
   if(rng()<.55)kput('scrapP',[px,y+lift,pz],qEuler(rr(-1.2,1.2),rng()*TAU,rr(-1.2,1.2)),
    [rr(3,9),rr(2,6),1],null);
   else kput(BOXC(1),[px,y+lift,pz],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(1.5,4),rr(1,3),rr(1.5,4)],new THREE.Color(rng()<.5?0x7a4a2e:0x5a4230));}};
 const smithy=(x,z,rot,R)=>{const y=plateY(x,z);
  REGISTER({name:'Screamer village — a smithy',x:x,z:z,r:R*1.6,h:20});
  (SCREAM.smithies=SCREAM.smithies||[]).push([x,y,z,rot]);
  for(let k=0;k<4;k++){const a=k/4*TAU+rot+.785;
   kput('postW',[x+Math.cos(a)*R,y+6,z+Math.sin(a)*R],null,[2.8,12,2.8],null);}
  pitch(x,y+14,z,rot,R*2.4,R*2.1,6.5);
  // the hearth, and its stack going up through the roof
  const fx=x+Math.cos(rot)*R*.42,fz=z+Math.sin(rot)*R*.42;
  MER.push(lathe({rFn:yy=>R*.40*Math.pow(clamp(1-Math.pow(yy/(R*.55),2),0,1),.5),
   H:R*.55,nu:20,nv:6}).translate(fx,y,fz));
  kput(BOXC(1),[fx,y+R*.55+R*.5,fz],null,[R*.22,R*1.05,R*.22],null);
  if(d===0)stripRing(fx,y+1.2,fz,R*.46,0,10);
  // anvil on a block, quench trough, stock rack
  const ax=x-Math.cos(rot)*R*.30,az=z-Math.sin(rot)*R*.30;
  kput(BOXC(1),[ax,y+.9,az],qEuler(0,-rot,0),[3.4,1.8,2.2],null);
  kput(BOXC(1),[ax,y+2.4,az],qEuler(0,-rot,0),[3.8,1.2,1.4],new THREE.Color(0x4a3a30));
  const tx=x-Math.sin(rot)*R*.6,tz=z+Math.cos(rot)*R*.6;
  kput(BOXC(1),[tx,y+1,tz],qEuler(0,-rot,0),[5,2,2.4],new THREE.Color(0x3e342c));
  for(let q=0;q<7;q++)
   kput('postW',[x+Math.sin(rot)*R*.72+Math.cos(rot)*(q/6-.5)*R*1.4,y+3,
                 z-Math.cos(rot)*R*.72+Math.sin(rot)*(q/6-.5)*R*1.4],
    qEuler(rr(-.25,.25),0,rr(-.25,.25)),[1,rr(5,9),1],null);
  figures(x+Math.cos(rot)*R*1.3,z+Math.sin(rot)*R*1.3,3,14);};
 {let ns=0;
  for(let t=0;t<900&&ns<3;t++){
   const a=rng()*TAU,m=Math.sqrt(rng())*WR*.66;
   const x=Math.cos(a)*m,z=Math.sin(a)*m,R=22;
   if(!free(x,z,R*1.7,8))continue;
   claim(x,z,R*1.7,'built');ns++;
   const rot=Math.atan2(COM[1]-z,COM[0]-x);
   smithy(x,z,rot,R);
   for(let q=0;q<2;q++){                       // spoil heaps beside each
    const a2=rot+2.0+q*1.3,hr=rr(10,16);
    const hx=x+Math.cos(a2)*(R*1.9+hr),hz=z+Math.sin(a2)*(R*1.9+hr);
    if(!free(hx,hz,hr,4))continue;
    claim(hx,hz,hr,'built');scrapHeap(hx,hz,hr);}}}

 // ---- the millipede ranch --------------------------------------------------
 // Krator's giant millipedes, penned. Tier 3, so it is placed before any field
 // and the farms have to work round it rather than the other way about.
 const millipede=(mx,my,mz,ang,L)=>{
  const seg=Math.max(6,Math.round(L/4));
  for(let i=0;i<seg;i++){const t=i/(seg-1)-.5;
   const wob=Math.sin(t*7+ang)*L*.06;
   const px=mx+Math.cos(ang)*t*L-Math.sin(ang)*wob,pz=mz+Math.sin(ang)*t*L+Math.cos(ang)*wob;
   const r=1.9*(1-.45*Math.abs(t*2));
   kput('moss',[px,my+r*.8,pz],qEuler(0,-ang,0),[r*1.25,r,r*1.15],
    new THREE.Color(i%3===0?0xb8683e:0x4a2e22));
   for(let sd=-1;sd<=1;sd+=2)                             // legs
    kput('postW',[px-Math.sin(ang)*sd*r*1.15,my+r*.35,pz+Math.cos(ang)*sd*r*1.15],
     qEuler(sd*.5,-ang,0),[.34,r*1.3,.34],new THREE.Color(0x3a241c));}};
 {let placed=false;
  for(let t=0;t<600&&!placed;t++){
   const a=rng()*TAU,m=Math.sqrt(rng())*WR*.7;
   const x=Math.cos(a)*m,z=Math.sin(a)*m,R=74;
   if(!free(x,z,R,10))continue;
   claim(x,z,R,'built');placed=true;SCREAM.ranch=[x,plateY(x,z),z,R];
   const y=plateY(x,z),rot=Math.atan2(COM[1]-z,COM[0]-x);
   REGISTER({name:'Screamer village — the millipede ranch',x:x,z:z,r:R+8,h:14});
   // a double stockade, because they climb
   for(let ring=0;ring<2;ring++){const rr2=R-ring*6,n=Math.round(rr2*.62);
    for(let k=0;k<n;k++){const a2=k/n*TAU;
     if(ring===0&&Math.abs(wrapPiV(a2-rot))<.16)continue;
     kput('postW',[x+Math.cos(a2)*rr2,y+rr(3.6,4.6),z+Math.sin(a2)*rr2],
      qEuler(rr(-.04,.04),0,rr(-.04,.04)),[1.5,rr(7,9.5),1.5],null);}}
   // feeding troughs laid radially, a long shelter, and the stock
   for(let k=0;k<5;k++){const a2=rot+(k/5-.5)*1.7,m2=R*.55;
    const tx=x+Math.cos(a2)*m2,tz=z+Math.sin(a2)*m2;
    kput(BOXC(1),[tx,y+1.2,tz],qEuler(0,-a2,0),[R*.5,2.4,5],new THREE.Color(0x5a4630));}
   pitch(x+Math.cos(rot+2.5)*R*.52,y+9,z+Math.sin(rot+2.5)*R*.52,rot,R*.62,R*.34,7.5);
   for(let k=0;k<4;k++){const a2=k/4*TAU+rot;
    kput('postW',[x+Math.cos(rot+2.5)*R*.52+Math.cos(a2)*R*.24,y+4.5,
                  z+Math.sin(rot+2.5)*R*.52+Math.sin(a2)*R*.24],null,[2,9,2],null);}
   // the stock itself is animated by the life layer, not placed here
   figures(x+Math.cos(rot)*R*1.15,z+Math.sin(rot)*R*1.15,4,18);}}

 // ---- the ground orchard ----------------------------------------------------
 // The terraces and the plaza have fruit; the ground needs some too, or the
 // harvesters coming out of the dwellings have nowhere to go. Tier 3, placed
 // before the fields.
 const GFRUIT=[];
 for(let t=0;t<900&&GFRUIT.length<46;t++){
  const a=rng()*TAU,m=Math.sqrt(rng())*WR*.78;
  const x=Math.cos(a)*m,z=Math.sin(a)*m;
  if(!free(x,z,13,4))continue;
  claim(x,z,13,'built');
  const y=plateY(x,z),h=rr(9,16);
  kput('trunk',[x,y,z],null,[h*.16,h,h*.16],new THREE.Color(0x6e4e36));
  for(let b=0;b<3;b++)kput('leafy',[x+rr(-.2,.2)*h,y+h*(.66+b*.17),z+rr(-.2,.2)*h],
   qEuler(rng(),rng(),rng()),[h*.38,h*.3,h*.38],new THREE.Color(0x2f5a2a));
  for(let q=0;q<4;q++)kput('leafy',[x+rr(-.3,.3)*h,y+h*rr(.6,.86),z+rr(-.3,.3)*h],null,
   [h*.055,h*.055,h*.055],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
  GFRUIT.push([x,y,z]);}
 REGISTER({name:'Screamer village — the orchard ('+GFRUIT.length+' trees)',x:0,z:0,r:WR*.8,h:18});

 // ---- the elevator pylon ----------------------------------------------------
 // The Ancients left no way up from the ground and the lobby only reaches the
 // bottom two storeys of the supports, so the tribe built a lashed lattice mast
 // with a counterweighted car that runs the whole 600 m to the plaza. It is the
 // first moving thing in this kit, and what the TICKS list was added for.
 {const PA=-1.5708,PX=COM[0]+Math.cos(PA)*272,PZ=COM[1]+Math.sin(PA)*272;
  const y0=plateY(PX,PZ),TOP=(SCREAM_PLAZA?SCREAM_PLAZA.y:618);
  REGISTER({name:'Screamer village — the elevator pylon',x:PX,z:PZ,r:26,h:TOP-y0+20});
  const legs=[[-9,-9],[9,-9],[9,9],[-9,9]];
  for(const L of legs)for(let yy=y0;yy<TOP;yy+=26)
   kput('postW',[PX+L[0],yy+13,PZ+L[1]],null,[3.4,27,3.4],null);
  for(let yy=y0+13;yy<TOP-13;yy+=26)for(let k=0;k<4;k++){
   const A=legs[k],B=legs[(k+1)%4];
   beam('postW',[PX+A[0],yy,PZ+A[1]],[PX+B[0],yy+13,PZ+B[1]],1.7,1.7);}
  kput(SLABC(1),[PX,TOP+2,PZ],null,[17,3,17],null);
  kput('thatchH',[PX,TOP+4,PZ],qEuler(0,.3,0),[24,12,24],null);

  const car=new THREE.Group();
  const cm=new THREE.Mesh(new THREE.BoxGeometry(12,9,12),MAT.lash);cm.position.y=4.5;car.add(cm);
  const rf=new THREE.Mesh(new THREE.ConeGeometry(9.5,4.5,4),MAT.thatch);
  rf.position.y=11.2;rf.rotation.y=Math.PI/4;car.add(rf);
  car.position.set(PX,y0+2,PZ);G.add(car);
  const LO=y0+2,HI=TOP-5,SPD=24,RUN=(HI-LO)/SPD,DWELL=7,PER=2*(RUN+DWELL);
  tick((dt,t)=>{const u=t%PER;let h;
   if(u<RUN)h=u/RUN;
   else if(u<RUN+DWELL)h=1;
   else if(u<2*RUN+DWELL)h=1-(u-RUN-DWELL)/RUN;
   else h=0;
   car.position.y=LO+(HI-LO)*h;});}

 // ---- farms and livestock pens fill what is left ----------------------------
 // Every plot's long axis points at the foot of the tower. That is the way the
 // trails run and the way people walk to work, and it is what stops a field
 // system laid down by eye from looking like scattered confetti. Tier 4, so
 // they take whatever the walls, trails, dwellings and sheds have left, and
 // they pack to a 3 m gap rather than 7.
 let fields=0,pens=0;
 for(let t=0;t<9000&&fields+pens<260;t++){
  const a=rng()*TAU,m=Math.sqrt(rng())*WR*.88;
  const x=Math.cos(a)*m,z=Math.sin(a)*m,R=rr(12,24);
  if(!free(x,z,R,2))continue;
  claim(x,z,R,'built');
  const y=plateY(x,z);
  const rot=Math.atan2(COM[1]-z,COM[0]-x);          // long axis toward the tower
  if(rng()<.74){                                    // a field
   fields++;
   const L=R*1.9,Wd=R*1.15,nf=Math.max(4,Math.round(Wd/3.2));
   kput(BOXC(1),[x,y+.3,z],qEuler(0,-rot,0),[L,.6,Wd],new THREE.Color(0x4a3a24));
   for(let j=0;j<nf;j++){const u=(j+.5)/nf-.5;
    kput(BOXC(1),[x-Math.sin(rot)*u*Wd,y+.8,z+Math.cos(rot)*u*Wd],qEuler(0,-rot,0),
     [L*.94,.6,Wd/nf*.55],new THREE.Color(rng()<.25?0x55642c:0x334f24));}
   if(rng()<.3)kput('postW',[x+Math.cos(rot)*L*.5,y+2.4,z+Math.sin(rot)*L*.5],null,[1.3,5,1.3],null);
  }else{                                            // a livestock pen
   pens++;
   const n=Math.round(R*.55);
   for(let k=0;k<n;k++){const a2=k/n*TAU;
    if(Math.abs(wrapPiV(a2-rot))<.24)continue;      // the gate faces the tower
    kput('postW',[x+Math.cos(a2)*R,y+2.6,z+Math.sin(a2)*R],null,[1.4,5.2,1.4],null);}
   pitch(x+Math.cos(rot+2.4)*R*.55,y+5,z+Math.sin(rot+2.4)*R*.55,rot,R*.7,R*.5,4.5);
   for(let q=0;q<3;q++){const a2=rng()*TAU,mm=rng()*R*.7;
    kput('figB',[x+Math.cos(a2)*mm,y,z+Math.sin(a2)*mm],qEuler(0,rng()*TAU,0),[1.6,1.2,2.2],
     new THREE.Color(0x7a6a52));}}}
 REGISTER({name:'Screamer village — the fields ('+fields+' plots, '+pens+' pens)',x:0,z:0,r:WR*.9,h:8});

 // ---- the plaza -------------------------------------------------------------
 // The PLAZA is the lower city's roof: the only large flat open ground in the
 // whole structure, and the only part of it not roofed by the upper pyramid is
 // one point of the lower triangle. That is where the tribe meets, so that is
 // where the hall stands -- on the lower pyramid's own midline, sized to the
 // width the plan actually has that far out rather than to a number I liked.
 if(SCREAM_PLAZA){const Z=SCREAM_PLAZA,ZY=Z.y;
  // The plaza has its own occupancy list: it is a different surface 618 m up,
  // and nothing on the ground can collide with it.
  const PFRUIT=[];
  const POCC=[],pfree=(x,z,r)=>{for(const q of POCC)if(Math.hypot(x-q.x,z-q.z)<r+q.r+4)return false;return true;};
  const f=Z.apex*.46,A=[Z.o[0]+Z.ax[0]*f,Z.o[1]+Z.ax[1]*f];
  const room=Math.min(Z.halfAt(f)*.78,150);
  const DR=Math.min(62,room*.62),DH=DR*.88;
  REGISTER({name:"Screamer village — the orchard workers' residence",x:A[0],y:ZY,z:A[1],r:room,h:DH+26});
  kput(SLABC(1),[A[0],ZY+.5,A[1]],null,[room,1,room],new THREE.Color(0x6b5a42));
  // THE ORCHARD WORKERS' RESIDENCE. The Ancients' domed hall, patched rather
  // than rebuilt, and given over to the people who work the terrace orchards --
  // it is the one roofed building on the plaza and it sits between the fruit
  // and the gate they carry it through.
  const dome=y=>DR*Math.pow(clamp(1-Math.pow(y/DH,2),0,1),.58);
  MER.push(lathe({rFn:dome,H:DH,flutes:14,amp:.06,sharp:2,nu:56,nv:22,
   hole:(u,y)=>fbm(u*6,y*.08,9474,3)<.30||(Math.cos(u*TAU*14)<.2&&y>7&&y<DH*.8)})
   .translate(A[0],ZY+1,A[1]));
  for(let q=0;q<30;q++){const a2=rng()*TAU,yy=rr(4,DH*.86),r2=dome(yy);
   kput('thatchR',[A[0]+Math.cos(a2)*r2*1.03,ZY+1+yy,A[1]+Math.sin(a2)*r2*1.03],
    qFacing([Math.cos(a2),0,Math.sin(a2)]),[rr(9,17),rr(4,7),rr(9,17)],null);}
  for(let q=0;q<14;q++){const a2=q/14*TAU;                 // lashed ribs
   beam('postW',[A[0]+Math.cos(a2)*DR*1.05,ZY+1,A[1]+Math.sin(a2)*DR*1.05],
    [A[0]+Math.cos(a2)*9,ZY+DH+4,A[1]+Math.sin(a2)*9],2.4,2.4);}
  kput('thatchH',[A[0],ZY+DH+1,A[1]],qEuler(0,.3,0),[30,18,30],null);
  for(let q=0;q<20;q++){const a2=q/20*TAU;                 // the post ring
   kput('postW',[A[0]+Math.cos(a2)*(DR+16),ZY+6,A[1]+Math.sin(a2)*(DR+16)],null,[2.8,13,2.8],null);}
  stripRing(A[0],ZY+3,A[1],DR+15,0,20);
  // it is lived in: bunks and hammocks round the wall, chests and baskets of
  // the day's picking, a hearth in the middle, racks, looms and water jars.
  // Every piece comes from the shared FURN set, so the catalogue artifact and
  // this room can never drift apart.
  {const R2=DR*.66;
   for(let k=0;k<10;k++){const a2=k/10*TAU+.2,px=A[0]+Math.cos(a2)*R2,pz=A[1]+Math.sin(a2)*R2;
    if(k%3===0)FURN.hammock(px,ZY+3.4,pz,a2+1.5708,1.5);
    else FURN.bunk(px,ZY+1,pz,a2+1.5708,1.5);}
   for(let k=0;k<7;k++){const a2=k/7*TAU+.9,px=A[0]+Math.cos(a2)*(R2*.62),pz=A[1]+Math.sin(a2)*(R2*.62);
    if(k%3===0)FURN.chest(px,ZY+1,pz,a2,1.6);
    else if(k%3===1)FURN.basket(px,ZY+1,pz,a2,1.7);
    else FURN.jar(px,ZY+1,pz,a2,1.6);}
   FURN.hearth(A[0],ZY+1,A[1],0,2.4);
   for(let k=0;k<3;k++){const a2=k/3*TAU+.4;
    FURN.stool(A[0]+Math.cos(a2)*5.5,ZY+1,A[1]+Math.sin(a2)*5.5,a2,1.6);}
   for(let k=0;k<4;k++){const a2=k/4*TAU+1.1;
    FURN.rack(A[0]+Math.cos(a2)*(DR*.88),ZY+1,A[1]+Math.sin(a2)*(DR*.88),a2+1.5708,1.7);}
   FURN.loom(A[0]+Math.cos(2.4)*(DR*.45),ZY+1,A[1]+Math.sin(2.4)*(DR*.45),2.4,1.7);
   for(let k=0;k<3;k++){const a2=k/3*TAU+2.0;
    FURN.ladder(A[0]+Math.cos(a2)*(DR*.95),ZY+1,A[1]+Math.sin(a2)*(DR*.95),a2+3.14,1.6,DH*.55);}}
  figures(A[0],A[1],14,Math.round(room*.5));
  POCC.push({x:A[0],z:A[1],r:DR+20});

  // --- THE CHIEF'S PALACE: the flatiron, on the plaza's prow ---------------
  // Sized to the plan, not to a number I liked. The lower plan tapers at 15
  // deg, so a wedge whose width grows 0.536 per unit of length sits exactly on
  // the prow instead of overhanging it; at the surveyed point the deck is only
  // 46 m across and a 150x74 tower hung 17 m off each side, so the centre sits
  // on the plan's own axis.
  {const FL=144,FW=FL*.536,FA=Math.atan2(Z.ax[1],Z.ax[0]);
   const FX=Z.o[0]-3.4,FZ=Z.o[1]+Z.apex-96;
   const ftop=flatiron(G,FX,FZ,ZY,FA,FL,FW,212);
   REGISTER({name:"Screamer village — the chief's palace (the flatiron)",
    x:FX,y:ZY,z:FZ,r:88,h:ftop-ZY+26});
   // it is a watchtower as much as a palace: a lit ring at the door, standards
   // along the prow, and the chief's own people on the terrace
   stripRing(FX,ZY+3.4,FZ,FW*.62,0,16);
   for(let q=0;q<7;q++){const t=(q/6-.5)*FL*.78;
    const px=FX+Math.cos(FA)*t,pz=FZ+Math.sin(FA)*t;
    kput('postW',[px,ZY+9,pz],null,[1.8,18,1.8],null);
    kput('thatchR',[px,ZY+19,pz],qEuler(0,rng()*TAU,0),[7,5,7],null);}
   figures(FX-Math.cos(FA)*FL*.3,FZ-Math.sin(FA)*FL*.3,8,34);
   POCC.push({x:FX,z:FZ,r:94});}

  // --- the way in from the upper city, and the helipad ---------------------
  if(Z.door){const DX=Z.door[0],DZ=Z.door[1],DA=Z.doorAng,DY=Z.doorY;
   REGISTER({name:'Screamer village — the upper city gate',x:DX,y:ZY,z:DZ,r:26,h:34});
   kput('archOpen',[DX,DY+9,DZ],qFacing([Math.cos(DA),0,Math.sin(DA)]),[9,9,7],null);
   for(let q=-1;q<=1;q+=2)
    kput('postW',[DX-Math.sin(DA)*q*13,DY+11,DZ+Math.cos(DA)*q*13],null,[4,24,4],null);
   kput('postW',[DX,DY+24,DZ],qEuler(0,-DA,1.5708),[3,28,3],null);
   for(let j=0;j<7;j++){const t=j/6;                       // steps down to the deck
    kput(SLABC(1),[DX+Math.cos(DA)*t*32,lerp(DY,ZY,t)+.7,DZ+Math.sin(DA)*t*32],
     qEuler(0,-DA,0),[27-j*1.3,1.4,27-j*1.3],null);}
   POCC.push({x:DX,z:DZ,r:34});
   const HX=DX+Math.cos(DA)*96,HZ=DZ+Math.sin(DA)*96;
   REGISTER({name:'Screamer village — the helipad',x:HX,y:ZY,z:HZ,r:34,h:7});
   kput(SLABC(1),[HX,ZY+1.3,HZ],null,[30,2.6,30],null);
   kput(SLABC(1),[HX,ZY+2.8,HZ],null,[22,.8,22],new THREE.Color(0x2a2a2a));
   for(let q=0;q<8;q++){const a2=q/8*TAU;
    kput('postW',[HX+Math.cos(a2)*31,ZY+2.5,HZ+Math.sin(a2)*31],null,[1.4,5,1.4],null);}
   stripRing(HX,ZY+3.4,HZ,32,0,14);
   POCC.push({x:HX,z:HZ,r:38});
   SCREAM.gate=[DX,ZY+.2,DZ];}
  // GRASS over the whole surveyed triangle, then fruit trees wherever nothing
  // is built. Sampled barycentrically so the planting follows the plan rather
  // than a bounding box that would spill off the deck.
  {const PP=Z.poly;
   mesh(gridSurface((u,v)=>{
    const x=lerp(lerp(PP[0][0],PP[1][0],u),PP[2][0],v);
    const z=lerp(lerp(PP[0][1],PP[1][1],u),PP[2][1],v);
    return[x,ZY+.4,z];},60,60,{uS:34,vS:34}),MAT.lawn,G);
   for(let t=0;t<420;t++){
    let b1=rng(),b2=rng();if(b1+b2>1){b1=1-b1;b2=1-b2;}
    const b0=1-b1-b2;
    const x=PP[0][0]*b0+PP[1][0]*b1+PP[2][0]*b2;
    const z=PP[0][1]*b0+PP[1][1]*b1+PP[2][1]*b2;
    if(!pfree(x,z,11))continue;
    POCC.push({x:x,z:z,r:11});
    const h=rr(9,17);
    kput('trunk',[x,ZY+.6,z],null,[h*.16,h,h*.16],new THREE.Color(0x6e4e36));
    for(let b=0;b<3;b++)kput('leafy',[x+rr(-.2,.2)*h,ZY+.6+h*(.68+b*.16),z+rr(-.2,.2)*h],
     qEuler(rng(),rng(),rng()),[h*.36,h*.28,h*.36],new THREE.Color(0x2f5a2a));
    for(let q=0;q<4;q++)
     kput('leafy',[x+rr(-.3,.3)*h,ZY+.6+h*rr(.62,.86),z+rr(-.3,.3)*h],null,
      [h*.055,h*.055,h*.055],new THREE.Color(rng()<.5?0xd08a2a:0xc25a3a));
    PFRUIT.push([x,ZY+.6,z]);}}
  SCREAM.plazaFruit=PFRUIT;
  // drying racks, hide frames and fire pits, on the deck but off the plaza
  for(let q=0;q<38;q++){const a2=rng()*TAU,m=room*(1.1+rng()*1.6);
   const px=A[0]+Math.cos(a2)*m,pz=A[1]+Math.sin(a2)*m;
   // halfAt() is a linear approximation along the apex axis; off-axis it said
   // yes well past the deck edge and furniture ended up floating. onDeck()
   // tests the real outline.
   if(!Z.onDeck(px,pz)||!Z.onDeck(px+14,pz)||!Z.onDeck(px-14,pz)
      ||!Z.onDeck(px,pz+14)||!Z.onDeck(px,pz-14))continue;
   if(Z.inPlaza(px,pz))continue;                           // the plaza stays clear
   if(rng()<.45){for(let k=0;k<4;k++)
     kput('postW',[px+Math.cos(k/4*TAU)*7,ZY+4,pz+Math.sin(k/4*TAU)*7],null,[1.6,8,1.6],null);
    pitch(px,ZY+9,pz,rng()*TAU,18,14,4);}
   else kput(SLABC(1),[px,ZY+.8,pz],null,[rr(5,11),1,rr(5,11)],new THREE.Color(0x2e241c));}}

 // ---- the anti-overlap audit ------------------------------------------------
 // Every rejection-sampled item was tested against everything claimed before
 // it, so this should report zero. It is a regression check, not a discovery:
 // it fails loudly the next time something is placed without being tested, and
 // it is the only way to know the pass actually ran rather than looking right.
 {let bad=0,worst=0,worstPair='';
  for(let i=0;i<OCC.length;i++){const a=OCC[i];
   if(a.tag!=='built')continue;
   for(let j=0;j<OCC.length;j++){if(i===j)continue;const b=OCC[j];
    const d2=Math.hypot(a.x-b.x,a.z-b.z),pen=a.r+b.r-d2;
    if(pen>1.5){bad++;if(pen>worst){worst=pen;worstPair=a.tag+'/'+b.tag;}}}}
  window._overlaps=bad;window._worstOverlap=Math.round(worst);
  if(bad)reportErr('anti-overlap: '+bad+' intersections, worst '+worst.toFixed(1)
   +' m ('+worstPair+')');}

 // ---- hand the life layer its routes ----------------------------------------
 // Pairs only ever join two points on the SAME surface. An agent that walked
 // from the ground to a terrace 600 m up would be flying, and the cheapest way
 // to make sure that never happens is to never build the pair.
 const PAIRS=[];
 CL.forEach(C=>{const y=plateY(C.x,C.z);
  for(let q=0;q<3;q++){const F=GFRUIT[Math.floor(rng()*GFRUIT.length)];
   if(F)PAIRS.push([[C.x,y+.2,C.z],[F[0],F[1]+.2,F[2]]]);}});
 for(let q=0;q<10;q++){const F=GFRUIT[Math.floor(rng()*GFRUIT.length)];
  const a=rng()*TAU;                                  // and some out of the lobby
  if(F)PAIRS.push([[COM[0]+Math.cos(a)*240,plateY(COM[0],COM[1])+.2,COM[1]+Math.sin(a)*240],
                   [F[0],F[1]+.2,F[2]]]);}
 SCREAM.pairs=PAIRS;
 meshMerged(MER,MAT.concreteR,G);meshMerged(MTH,MAT.thatch,G);meshMerged(MSC,MAT.scrap,G);
 KOFF=[0,0,0];return G;}

// ================================================================= THE HYPERJUNGLE
// The belt of forest the village has cleared its ground out of. Its own build
// type so it carries its own triangle budget rather than eating the village's,
// and it thickens with distance: scrub at the wall line, closed canopy by a
// kilometre out, with emergents standing well clear of it.
function buildJungle(scene,gx,gz,d){reseed(9480+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 if(!SCREAM){reportErr('jungle: no SCREAM handoff');return G;}
 const WR=SCREAM.hexr*1.16,OUT=3400;
 REGISTER({name:'The hyperjungle',x:0,z:0,r:OUT,h:150});
 // FOUR SPECIES, after Girder's own set. They differ in bark, in crown shape,
 // and in what hangs in them, which is what stops a forest reading as one tree
 // stamped a thousand times:
 //   0 Ironbark   fibrous red-brown bole, dark needle tiers, tall and narrow
 //   1 Ghostwood  near-white bark with dark flecks, airy yellow-green, and
 //                violet flower racemes hanging under the crown
 //   2 Prism gum  streaked multicoloured bark, broad iridescent violet-green
 //                canopy -- the canon XA canopy of this hemisphere
 //   3 Baobab     swollen grey-brown bottle trunk, sparse flat crown, orange pods
 const SPEC=[
  {bark:[.055,.34,.20],leaf:[.30,.42,.24],crown:.30,spread:.85,boughs:6,el:[.10,.42],hang:null},
  {bark:[.11,.10,.74],leaf:[.19,.52,.44],crown:.26,spread:1.05,boughs:5,el:[.28,.72],hang:0x9a6ad8},
  {bark:[.08,.30,.34],leaf:[.36,.46,.34],crown:.34,spread:1.25,boughs:7,el:[.05,.38],hang:null},
  {bark:[.09,.14,.40],leaf:[.24,.40,.30],crown:.22,spread:1.35,boughs:5,el:[-.05,.18],hang:0xe0862a}];
 const tree=(x,z,h,emerg,sp)=>{
  const S=SPEC[sp===undefined?Math.floor(rng()*4):sp];
  const y=terrainH(gx+x,gz+z);
  const bc=new THREE.Color().setHSL(S.bark[0],S.bark[1],S.bark[2]*rr(.82,1.18));
  if(S===SPEC[3]){                                   // the bottle trunk
   kput('trunk',[x,y,z],null,[h*.30,h*.62,h*.30],bc);
   kput('trunk',[x,y+h*.58,z],null,[h*.13,h*.44,h*.13],bc);
  }else kput('trunk',[x,y,z],null,[h*(emerg?.09:.13),h,h*(emerg?.09:.13)],bc);
  if(S===SPEC[1])for(let q=0;q<7;q++)                // ghostwood's dark flecks
   kput(BOXC(1),[x+rr(-.09,.09)*h,y+rr(.15,.85)*h,z+rr(-.09,.09)*h],
    qEuler(0,rng()*TAU,0),[h*.03,h*.012,h*.03],new THREE.Color(0x3a362e));
  if(S===SPEC[2])for(let q=0;q<6;q++)                // prism gum's streaks
   kput(BOXC(1),[x+rr(-.07,.07)*h,y+rr(.1,.9)*h,z+rr(-.07,.07)*h],
    qEuler(0,rng()*TAU,0),[h*.028,h*.09,h*.028],
    new THREE.Color([0x9a8f6a,0x6f9a6a,0xb8683e,0x5a6fa0,0x8a4f78,0xc2a24e][q]));
  // A real crown: boughs off the top of the bole with leaf clumps at their
  // ends, rather than lobes threaded up the trunk. LOD drops bough and clump
  // count with distance -- at 3 km the far trees are a canopy line, not
  // individuals, and the jungle was 87% of its own budget.
  const dd2=Math.hypot(x,z);
  const nb=Math.max(2,S.boughs+(emerg?1:0)-(dd2>2100?1:0)-(dd2>2900?1:0));
  const y0=y+h*(S===SPEC[3]?.90:emerg?.80:.60);
  for(let b=0;b<nb;b++){
   const a2=b*2.3999+rr(-.3,.3),el=rr(S.el[0],S.el[1]);
   const L=h*S.crown*S.spread*rr(.78,1.18);
   const ex=x+Math.cos(a2)*Math.cos(el)*L,ez=z+Math.sin(a2)*Math.cos(el)*L;
   const ey=y0+Math.sin(el)*L;
   beam('bough',[x,y0,z],[ex,ey,ez],h*.024,h*.024,bc);
   const nc=dd2>2100?2:3;
   for(let q=0;q<nc;q++){const sz=h*S.crown*rr(.72,1.08);
    kput('clump',[ex+rr(-.28,.28)*L,ey+rr(-.10,.22)*L,ez+rr(-.28,.28)*L],
     qEuler(rr(-.45,.45),rng()*TAU,rr(-.45,.45)),[sz,sz,sz],
     new THREE.Color().setHSL(S.leaf[0]+rr(-.03,.03),S.leaf[1]*rr(.85,1.15),S.leaf[2]*rr(.8,1.25)));}
   // what hangs in it: ghostwood racemes, baobab pods
   if(S.hang&&dd2<2400)for(let q=0;q<3;q++)
    kput('leafy',[ex+rr(-.3,.3)*L,ey-rr(.12,.34)*L,ez+rr(-.3,.3)*L],
     qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[h*.028,h*.055,h*.028],
     new THREE.Color(S.hang));}
  if(S!==SPEC[3])for(let q=0;q<(dd2>2400?1:2);q++){  // a skirt over the shoulder
   const sz=h*S.crown*.74*rr(.8,1.1);
   kput('clump',[x+rr(-.12,.12)*h,y0-h*.09,z+rr(-.12,.12)*h],
    qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sz,sz,sz],
    new THREE.Color().setHSL(S.leaf[0],S.leaf[1]*.9,S.leaf[2]*.85));}};
 // HYPERTREES. Girder's forest is not scrub -- the emergents are hundreds of
 // metres and they are what gives the canopy its scale. This is a cheap
 // background build of the same Ironbark profile the kit's buildHypertree uses
 // (fluted buttressed bole, golden-angle boughs), at about 1.7k triangles each
 // instead of 174k, because at this distance nobody can resolve the difference.
 const MJ=[];
 const hyper=(x,z,H)=>{
  const y=terrainH(gx+x,gz+z),RB=H*.060;
  const rad=yy=>{const u=clamp(yy/H,0,1);
   const t=u<.62?1-.42*u:lerp(.74,.07,(u-.62)/.38);
   return RB*t*(1+.80*Math.exp(-yy/(H*.034)));};
  MJ.push(gridSurface((u,v)=>{const th=u*TAU,yy=Math.pow(v,.85)*H*.99;
   const r=rad(yy)*(1+.16*Math.pow(.5+.5*Math.cos(th*7),2)*Math.exp(-yy/(H*.09)));
   return[x+r*Math.cos(th),yy+y,z+r*Math.sin(th)];},22,16,{uS:9,vS:22}));
  for(let k=0;k<9;k++){const a=k*2.3999+rr(-.3,.3),u0=rr(.60,.95);
   const y0=y+H*u0,r0=rad(H*u0),L=H*rr(.20,.38),el=rr(.02,.38);
   const ex=x+Math.cos(a)*(r0+Math.cos(el)*L),ez=z+Math.sin(a)*(r0+Math.cos(el)*L);
   const ey=y0+Math.sin(el)*L;
   beam('bough',[x+Math.cos(a)*r0,y0,z+Math.sin(a)*r0],[ex,ey,ez],H*.013,H*.013);
   // a crown of five reads as a twig; the emergents in Girder are dense
   const nfr=Math.hypot(x,z)>2200?7:13;
   for(let q=0;q<nfr;q++){const f=q/(nfr-1),sz=H*rr(.045,.105)*(1-.3*f);
    kput('frond',[ex+rr(-.55,.55)*L*(.4+f*.7),ey+rr(-.16,.26)*L,ez+rr(-.55,.55)*L*(.4+f*.7)],
     qEuler(rng(),rng(),rng()),[sz,sz*.5,sz],
     new THREE.Color().setHSL(rr(.25,.34),rr(.28,.48),rr(.07,.17)));}}
  // buttress roots
  for(let k=0;k<6;k++){const a=k/6*TAU+rr(-.2,.2);
   beam('bough',[x+Math.cos(a)*RB*.8,y+H*.05,z+Math.sin(a)*RB*.8],
    [x+Math.cos(a)*RB*3.4,y+.6,z+Math.sin(a)*RB*3.4],RB*.22,RB*.22);}};
 // free() belongs to buildVillage; the jungle keeps its own spacing list
 const HT=[];
 for(let t=0;t<900&&HT.length<26;t++){
  const a=rng()*TAU,r=WR*rr(1.15,2.9),x=Math.cos(a)*r,z=Math.sin(a)*r;
  let ok=true;
  for(const q of HT)if(Math.hypot(x-q[0],z-q[1])<190){ok=false;break;}
  if(!ok)continue;
  HT.push([x,z]);
  hyper(x,z,rr(230,430));}
 meshMerged(MJ,MAT.bark,G);

 let n=0;
 for(let t=0;t<9000&&n<1500;t++){
  const a=rng()*TAU;
  // sqrt keeps the sample area-uniform; the extra power pushes the crowd
  // outward so the first hundred metres past the wall stay open
  const u=Math.pow(rng(),.62);
  const r=WR*1.03+u*(OUT-WR*1.03);
  const x=Math.cos(a)*r,z=Math.sin(a)*r;
  const dens=.25+.75*u;                       // thin at the edge, closed beyond
  if(rng()>dens)continue;
  n++;
  const emerg=rng()<.045;
  const r2=rng();
  const sp=emerg?(r2<.45?2:r2<.8?0:1):(r2<.34?2:r2<.6?0:r2<.86?1:3);
  tree(x,z,emerg?rr(70,135):(sp===3?rr(16,30):rr(13,42)),emerg,sp);}
 // undergrowth in the cleared belt just outside the wall, where the canopy is
 // open enough for it
 for(let t=0;t<420;t++){
  const a=rng()*TAU,r=WR*rr(1.0,1.5),x=Math.cos(a)*r,z=Math.sin(a)*r;
  // Not one flat plate: flattening a single icosahedron turned the boulders
  // into lily pads. Three overlapping lobes of different size read as a bush.
  const s=rr(3,8),y=terrainH(gx+x,gz+z);
  const kind=rng();
  if(kind<.42){for(let b=0;b<3;b++){const sb=s*rr(.55,1);     // a bush
   kput('leafy',[x+rr(-.5,.5)*s,y+sb*rr(.3,.55),z+rr(-.5,.5)*s],
    qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[sb,sb*rr(.5,.8),sb],
    new THREE.Color().setHSL(rr(.22,.32),rr(.30,.48),rr(.13,.26)));}}
  else if(kind<.74){const nf=6+Math.floor(rng()*5);           // a fern rosette
   for(let b=0;b<nf;b++){const a2=b/nf*TAU+rr(-.2,.2),L=s*rr(.8,1.5);
    kput('frondL',[x+Math.cos(a2)*L*.5,y+s*.30+rr(0,.2)*s,z+Math.sin(a2)*L*.5],
     qEuler(rr(.1,.45),-a2,0),[L,1,L*.5],
     new THREE.Color().setHSL(rr(.24,.33),rr(.34,.52),rr(.14,.26)));}}
  else if(kind<.90){const th=s*rr(1.4,2.6);                   // a palm
   kput('trunk',[x,y,z],qEuler(rr(-.06,.06),0,rr(-.06,.06)),[th*.10,th,th*.10],
    new THREE.Color(0x6a5238));
   for(let b=0;b<7;b++){const a2=b/7*TAU,L=s*rr(1.1,1.8);
    kput('frondL',[x+Math.cos(a2)*L*.46,y+th*.96,z+Math.sin(a2)*L*.46],
     qEuler(rr(.15,.5),-a2,0),[L,1,L*.4],
     new THREE.Color().setHSL(rr(.25,.33),rr(.32,.5),rr(.15,.26)));}}
  else{for(let b=0;b<4;b++){const sb=s*rr(.18,.4);            // shelf fungus
   kput('fungus',[x+rr(-.6,.6)*s,y+rr(.1,1.1)*s,z+rr(-.6,.6)*s],
    qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[sb,sb*.45,sb],
    new THREE.Color(rng()<.5?0xa08464:0x8d6a5e));}}}
 REGISTER({name:'The hyperjungle — the cleared belt',x:0,z:0,r:WR*1.5,h:12});
 KOFF=[0,0,0];return G;}
// ================================================================= DATA CENTER — "the Vault" (cyclopean, windowless)
function buildDataCenter(scene,gx,gz,d){reseed(9220+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Data center — the Vault ('+STATE(d)+')',x:0,z:0,r:220,h:80});
 const W=260,Dp=140,H=62;
 // berm and the mass: battered box, 4 faces + roof
 mesh(lathe({rFn:y=>(190-3*y),H:8,nu:8,nv:2}),MAT.mud,G);
 const bat=.06;const face=(fx,fz)=>gridSurface((u,v)=>{const y=v*H;const sh=1-bat*v;let x,z;if(fx){x=fx*W/2*sh;z=(u-.5)*Dp*sh;}else{x=(u-.5)*W*sh;z=fz*Dp/2*sh;}return[x,8+y,z];},fx?40:80,16,{uS:fx?14:26,vS:6,hole:holeFn(d*.5,1700+fx+fz*2,null,1.4)});
 [[1,0],[-1,0],[0,1],[0,-1]].forEach(f=>mesh(face(f[0],f[1]),CONC(d),G));
 mesh(gridSurface((u,v)=>{const sh=1-bat;return[(u-.5)*W*sh,8+H,(v-.5)*Dp*sh];},20,10,{uS:26,vS:14,hole:holeFn(d*.7,1701,null,2)}),CONC(d),G);
 kput('boxD',[0,8+H/2,0],null,[W*.94,H,Dp*.94],null);
 // cooling fins: deep concrete ribs on the long faces, a few fallen in ruin
 for(let k=-9;k<=9;k++){const x=k*13;for(const s of [-1,1]){const gone=d>0&&rng()<.18;const z=s*(Dp/2*(1-bat/2)+2);if(!gone)kput(BOXC(d),[x,8+H/2,z],qEuler(-bat*s*.5,0,0),[4,H+2,7],null);else kput('boxCR',[x+rr(-6,6),9.5,z+s*rr(20,50)],qEuler(Math.PI/2*.9,rr(-.3,.3),0),[4,H*.8,7],null);
   const lit=d>0?rng()<.08:true;kput('strip',[x+6.5,8+H*.6,z-s*2.5],qEuler(Math.PI/2,0,0),[H*.5,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}}
 // roof chillers: 8 drums with dark grilles; exhaust stacks
 for(let i=0;i<8;i++){const x=-105+i*30,z=(i%2?1:-1)*22;const gone=d>0&&(i===2||i===5);mesh(lathe({rFn:y=>11*(1-.02*y),H:12,flutes:16,amp:.05,nu:40,nv:4,hole:holeFn(d*.7,1710+i,null,2.5)}),CONC(d),G,x,8+H,z);
  if(!gone)kput('slab',[x,8+H+12.2,z],null,[10.5,.4,10.5],new THREE.Color(0x1a1d22));else{rubbleRing(x,8+H,z,3,14,20,1.5);}
  kput(d>0?'pipeR':'pipe',[x,8+H+6,z+(i%2?-1:1)*14],qEuler(Math.PI/2,0,0),[1.2,14,1.2],null);}
 for(let i=0;i<3;i++){const x=-30+i*30;mesh(lathe({rFn:y=>4.5*(1-.2*y/40)+1.5*clamp((y-34)/6,0,1),H:40,cut:d>0&&i===1?22:null,jag:2,flutes:8,amp:.1,nu:24,nv:12}),CONC(d),G,x,8+H,-50);}
 // the slit entrance: a deep cut ramping down into the mass; substation yard
 kput('boxD',[0,8+9,Dp/2*.97-2],null,[9,18,16],null);kput(BOXC(d),[0,4,Dp/2+30],qEuler(.12,0,0),[12,1.5,50],null);for(const s of [-1,1])kput(BOXC(d),[s*7,6,Dp/2+30],qEuler(.12,0,0),[1.5,4,50],null);
 for(let i=0;i<6;i++){const x=W/2+30+(i%3)*18,z=-30+Math.floor(i/3)*30;kput('boxD',[x,4,z],null,[10,8,8],null);for(let k=0;k<3;k++)kput('tube',[x-3+k*3,10,z],null,[.6,4,.6],null);kput(d>0?'pipeR':'pipe',[x,9,z+10],qEuler(Math.PI/2,0,0),[.5,14,.5],null);}
 for(let k=0;k<4;k++)kput(d>0?'colR':'colW',[W/2+10+k*22,0,60],null,[1,12,1],null);kput(d>0?'pipeR':'pipe',[W/2+43,11,60],qEuler(0,0,Math.PI/2),[.8,70,.8],null);
 for(let k=-10;k<=10;k++)for(const sz of [-1,1]){const lit=d>0?rng()<.1:true;kput('strip',[k*12,8+H+.6,sz*Dp*.42],null,[8,1,1],lit?new THREE.Color(0x8fd0ff):DEAD);}
 if(d>0){scatterMoss(0,8,0,0,180,120,3);mossOnRing(0,8+H+.3,0,50,30,3);vinesOnRing(0,8+H,0,Dp/2*.9,30,30);rubbleRing(0,8,0,100,200,70,3);trees(0,0,200,290,20);}
 figures(0,120,4,8);KOFF=[0,0,0];return G;}

// ================================================================= WIND
// Ported from Girder's foliage sway (60-trees.js). Every leaf, frond, vine and
// trunk in the scene moves, and it costs nothing per frame but one uniform:
// the displacement is done in the vertex shader from a per-instance phase, so
// 30 000 plants animate without a single matrix being rewritten on the CPU.
//
// Three things this depends on, all verified in this kit before now:
//   - r128's project_vertex chunk is exactly the four lines replaced below;
//     the hook has to rebuild it rather than append, because the instance
//     matrix has to be applied BEFORE the displacement or every plant in a
//     cluster sways in lockstep.
//   - the phase comes from instanceMatrix[3].xyz -- the instance's own
//     translation -- so neighbours are out of step without any extra attribute.
//   - Material.clone() does NOT carry onBeforeCompile in r128, so these hooks
//     are applied to the shared materials themselves, not to copies.
//
// Amplitude scales with the instance's own scale (length of instanceMatrix[0]),
// or a 40 m canopy blob and a 3 m fern would move the same distance.
const WIND={t:{value:0}};
function windHook(mat,swayW,swayA,name){
 if(!mat)return;
 mat.onBeforeCompile=function(sh){
  sh.uniforms.uWindT=WIND.t;
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;')
   .replace('#include <project_vertex>',[
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    'float _sc = 1.0; float _ph = 0.0;',
    '#ifdef USE_INSTANCING',
    '  mvPosition = instanceMatrix * mvPosition;',
    '  _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
    '  _sc = length(instanceMatrix[0].xyz);',
    '#endif',
    'float _wg = '+swayW+';',
    'mvPosition.xyz += _wg * _sc * vec3(',
    '   sin(uWindT*0.9+_ph) + 0.45*sin(uWindT*2.3+_ph*1.7+position.x*5.0),',
    '   0.40*sin(uWindT*1.6+_ph*0.6+position.z*5.0),',
    '   cos(uWindT*0.7+_ph*1.3) + 0.45*sin(uWindT*2.9+_ph+position.y*5.0) ) * '+swayA.toFixed(3)+';',
    'mvPosition = modelViewMatrix * mvPosition;',
    'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
 };
 // different hooks on different materials need different cache keys, or three
 // will silently share one compiled program
 mat.customProgramCacheKey=function(){return 'wind_'+name;};
 mat.needsUpdate=true;
}
// MAT.vine backs both 'vine' (hangs from y=0 down to y=-1) and 'trunk' (stands
// from y=0 up to y=1). One weight of -position.y is correct for both: zero at
// the attached end, full at the free one.
windHook(MAT.vine,'(-position.y)',.085,'vine');
windHook(MAT.turf,'1.0',.050,'turf');
windHook(MAT.moss,'1.0',.022,'moss');
windHook(MAT.leaf,'1.0',.060,'leaf');
tick(function(dt){WIND.t.value+=dt;});
// ================================================================= POLICE STATION — "the Watch"
function buildPolice(scene,gx,gz,d){reseed(9230+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Police station — the Watch ('+STATE(d)+')',x:0,z:0,r:90,h:60});
 kput(SLABC(d),[0,.4,0],null,[80,.8,80],null);
 // main block: battered hex, two storeys, slit windows, a sally-port
 const R0=34,R1=30,HM=12;mesh(lathe({rFn:y=>R0-(R0-R1)*y/HM,H:HM,nu:6,nv:4,hole:holeFn(d*.7,1800,null,1.5)}),CONC(d),G,0,.8,0);mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.9,H:HM,nu:6,nv:1}),MAT.dark,G,0,.8,0);
 kput(SLABC(d),[0,.8+HM,0],null,[R1*.98,.8,R1*.98],null);
 for(let f=0;f<6;f++){const fa=f/6*TAU+Math.PI/6;const n=[Math.cos(fa),0,Math.sin(fa)];const tg=[-n[2],0,n[0]];for(let k=-2;k<=2;k++)for(const yy of [4.5,9.5]){const r=hexR(R0-(R0-R1)*(yy-.8)/HM,fa)+.2;kput(d>0?'winSmD':'winSmI',[n[0]*r+tg[0]*k*7,yy,n[2]*r+tg[2]*k*7],qFacing(n),[1.2,2.6,1],null);}
  for(let k=-2;k<=2;k++){const r=hexR(R0,fa)+1;beam(BOXC(d),[n[0]*r+tg[0]*k*8,.8,n[2]*r+tg[2]*k*8],[n[0]*(r-4.5)+tg[0]*k*8,.8+HM+2,n[2]*(r-4.5)+tg[2]*k*8],1.6,1.4);}}
 kput('archOpen',[0,4,hexR(R0,Math.PI/2)-.5],qFacing([0,0,1]),[1,1,3],null);kput(BOXC(d),[0,7,hexR(R0,Math.PI/2)+6],null,[16,1,12],null);
 // watch tower: lattice hyperboloid with cupola and light
 const TH=44,tcut=d>0?TH*.6:null;const tx=-22,tz=-18;const rFn=y=>4*Math.sqrt(1+2.5*Math.pow((y-TH*.6)/(TH*.6),2));
 for(let k=0;k<6;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=(tcut||TH);y+=3){const th=k/6*TAU+dir*y*.06;const r=rFn(y);const p=[tx+r*Math.cos(th),.8+HM+y,tz+r*Math.sin(th)];if(prev)beam(d>0?'strutR':'strutW',prev,p,.7,.7);prev=p;}}
 kput('tube',[tx,.8+HM+(tcut||TH)/2,tz],null,[1.6,(tcut||TH),1.6],null);
 if(!tcut){mesh(lathe({rFn:y=>8*Math.pow(clamp(1-Math.pow((y-4)/4,2),0,1),.5)+.01,H:8,nu:32,nv:8}),CONC(d),G,tx,.8+HM+TH-2,tz);kput('slab',[tx,.8+HM+TH+1.5,tz],null,[7,.6,7],new THREE.Color(0x1a1d22));stripRing(tx,.8+HM+TH+2,tz,6.5,d,16);kput('finial',[tx,.8+HM+TH+8,tz],null,[1.2,2,1.2],null);}
 // vehicle bays wing + perimeter wall with gate
 kput(BOXC(d),[42,5,-10],null,[30,10,50],null);kput('boxD',[42,5,-10],null,[28,9,48],null);for(let k=0;k<3;k++)kput('archOpen',[57.2,3.4,-26+k*16],qFacing([1,0,0]),[.9,.75,1.5],null);
 for(let k=0;k<3;k++){const lit=d>0?rng()<.2:true;kput('strip',[57.4,9.2,-26+k*16],qEuler(0,0,0),[10,1,1],lit?CYAN:DEAD);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2;for(let j=-1;j<=1;j+=2){if(k===0&&j===1)continue;kput(BOXC(d),[Math.cos(a)*44+ (-Math.sin(a))*j*22,2.5,Math.sin(a)*44+Math.cos(a)*j*22],qEuler(0,-a,0),[1.2,5,44],null);}}
 kput(BOXC(d),[46,6,44],null,[3,12,3],null);kput(BOXC(d),[-46,6,44],null,[3,12,3],null);kput('boxD',[0,3,44],null,[1,6,1],null);
 for(let k=0;k<6;k++){const x=-30+k*12;kput(BOXC(d),[x,.8,60],null,[5,.5,10],null);}
 if(d>0){mossOnRing(0,.8+HM+.5,0,26,20,2);rubbleRing(0,.8,0,36,60,40,2);vinesOnRing(0,.8+HM,0,R1,12,10);}
 figures(0,50,4,6);KOFF=[0,0,0];return G;}

// ================================================================= HOSPITAL — "the Cloister" (Prentice quatrefoil over a podium)
function buildHospital(scene,gx,gz,d){reseed(9240+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hospital — the Cloister ('+STATE(d)+')',x:0,z:0,r:120,h:90});
 // podium: 3 storeys, glass ribbons between concrete slabs
 const PW=170,PD=110,SH=5;for(let f=0;f<=3;f++){kput(BOXC(d),[0,f*SH,0],null,[PW,.8,PD],null);if(f<3){if(d===0){kput('pane',[0,f*SH+2.8,PD/2],null,[PW-2,3.6,1],null);kput('pane',[0,f*SH+2.8,-PD/2],null,[PW-2,3.6,1],null);kput('pane',[PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);kput('pane',[-PW/2,f*SH+2.8,0],qEuler(0,Math.PI/2,0),[PD-2,3.6,1],null);}
  kput('boxD',[0,f*SH+2.8,0],null,[PW-3,3.6,PD-3],null);for(let x=-PW/2+5;x<PW/2;x+=10)for(const s of [-1,1])kput(BOXC(d),[x,f*SH+2.8,s*PD/2],null,[.8,4,.8],null);
  for(let k=0;k<8;k++){const lit=d>0?rng()<.15:true;kput('strip',[-70+k*20,f*SH+4.4,PD/2-1],null,[12,1,1],lit?CYAN:DEAD);}}}
 kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+12],null,[30,.8,20],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+20],null,[1,5.5,1],null);
 // bed tower: four lobes cantilevered from a square core, oval windows in rows
 const CY=3*SH,TH=42;kput(BOXC(d),[0,CY+TH/2-4,0],null,[22,TH-8,22],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[24,TH+8,8],null);kput(BOXC(d),[0,CY+TH/2+4,0],null,[8,TH+8,24],null);
 const LR=26;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*24,cz=Math.sin(a)*24;const gone=d>0&&l===2;const hole=holeFn(d*.8,1900+l,null,2);
  if(gone){rubbleRing(cx*2.5,0,cz*2.5,10,40,50,3);continue;}
  mesh(lathe({rFn:y=>LR*(1-.35*Math.pow(clamp(1-y/8,0,1),2))*(1-.03*Math.pow(clamp((y-TH+6)/6,0,1),2)),H:TH,nu:48,nv:20,hole}),CONC(d),G,cx,CY+8,cz);
  mesh(lathe({rFn:()=>LR*.9,H:TH-2,nu:24,nv:2}),MAT.dark,G,cx,CY+9,cz);kput('slab',[cx,CY+8+TH,cz],null,[LR*.98,.8,LR*.98],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  for(let r=0;r<5;r++)for(let k=0;k<14;k++){const th=a-Math.PI*.55+k/13*Math.PI*1.1;const u=((th%TAU)+TAU)%TAU/TAU;const yy=12+r*6.5;if(hole&&hole(u,yy))continue;kput(d>0?'ovalD':'ovalI',[cx+LR*1.0*Math.cos(th),CY+8+yy,cz+LR*1.0*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.5,1.9,1],null);}
  if(r=>0)stripRing(cx,CY+8+TH-2,cz,LR*.85,d,24);if(d>0){vinesOnRing(cx,CY+8+TH,cz,LR,12,16);mossOnRing(cx,CY+8+TH+.4,cz,LR*.7,8,2);}}
 // helipad + plant on the core
 kput(SLABC(d),[0,CY+TH+5,0],null,[16,1,16],null);kput('boxD',[0,CY+TH+5.6,0],null,[1,.2,1],null);for(let k=0;k<12;k++){const a=k/12*TAU;const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*14,CY+TH+5.8,Math.sin(a)*14],qEuler(0,-a,0),[3,1,1],lit?new THREE.Color(0xffb060):DEAD);}
 for(let k=0;k<3;k++)kput(d>0?'pipeR':'pipe',[-6+k*6,CY+TH+8,0],null,[.8,6,.8],null);
 // ambulance apron
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);for(let k=0;k<5;k++)kput('boxD',[-40+k*20,.7,PD/2+42],null,[6,.1,12],null);
 if(d>0){scatterMoss(0,3*SH+.4,0,0,80,60,2.5);rubbleRing(0,.6,0,60,120,50,2.5);trees(0,0,100,150,10);}
 figures(0,90,5,10);KOFF=[0,0,0];return G;}

// ================================================================= HOTEL — "the Terraces"
function buildHotel(scene,gx,gz,d){reseed(9250+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hotel — the Terraces ('+STATE(d)+')',x:0,z:0,r:110,h:80});
 const NS=14,SH=4.2,R=90,a0=-.9,a1=.9;const depth=f=>34-f*1.9;   // crescent, each storey shallower (terraces step back uphill)
 const hConc=[],hBrick=[],hDark=[];   // one mesh per material for the whole crescent
 for(let f=0;f<=NS;f++){const y=f*SH;const D=depth(Math.min(f,NS-1));const gone=d>0&&f>=NS-2&&rng()<.6;if(gone)continue;
  hConc.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-D,R+1.5,v);return[Math.sin(a)*r,y,Math.cos(a)*r-R*.7];},80,3,{hole:d>0?(u,v)=>fbm(u*12,f,2000+f,2)<.14:null}));
  if(f<NS){const Dn=depth(f);const rf=R-.8;
   if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*rf,y+.5+v*(SH-.9),Math.cos(a)*rf-R*.7];},80,1,{}),MAT.glass,G);
   else hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*(rf-.5),y+.5+v*(SH-.9),Math.cos(a)*(rf-.5)-R*.7];},60,1,{hole:(u,v)=>fbm(u*9,f,2010,2)<.35}));
   hBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-Dn+1;return[Math.sin(a)*r,y+.5+v*(SH-.9),Math.cos(a)*r-R*.7];},60,1,{uS:20}));
   hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-Dn,R-1,v);return[Math.sin(a)*r,y+.4,Math.cos(a)*r-R*.7];},40,1,{}));
   for(let k=0;k<=24;k++){const a=lerp(a0,a1,k/24);kput(d>0?'mullR':'mullW',[Math.sin(a)*rf,y+SH/2,Math.cos(a)*rf-R*.7],qEuler(0,a,0),[.5,SH-.8,.5],null);
    if(k<24){const lit=d>0?rng()<.12:rng()<.7;kput('strip',[Math.sin(a+.035)*(rf-1.5),y+SH-.6,Math.cos(a+.035)*(rf-1.5)-R*.7],qEuler(0,a+.035,0),[4,1,1],lit?WARM:DEAD);}}
   // balcony parapet with planters; the terrace behind (roof of the storey below is the terrace of this one)
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);kput(BOXC(d),[Math.sin(a)*(R+1),y+.9,Math.cos(a)*(R+1)-R*.7],qEuler(0,a,0),[6.4,1,.4],null);
    if(d>0||rng()<.4)kput('hedge',[Math.sin(a)*(R+.4),y+1.3,Math.cos(a)*(R+.4)-R*.7],qEuler(0,a,0),[5.5,.7,.9],new THREE.Color().setHSL(rr(.25,.33),.45,d>0?.16:.28));}
   if(f>0&&f%2===0){for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);const r=R-Dn-4;kput('hedge',[Math.sin(a)*r,y+.9,Math.cos(a)*r-R*.7],qEuler(0,a,0),[10,1,2],new THREE.Color().setHSL(.3,.4,d>0?.15:.26));}}}}
 meshMerged(hConc,CONC(d),G);meshMerged(hBrick,MAT.brick,G);meshMerged(hDark,MAT.dark,G);
 if(d>0){mossOnSurface(hConc,0,0,0,170,2.2);vinesFromLedge(hConc,0,0,0,70,18);stainsFromLedge(hConc,0,0,0,52,12);}
 // core + lift towers at the horns, sky-lobby lens on top
 for(const s of [-1,1]){const a=s*(a1+.05);mesh(lathe({rFn:y=>7*Math.sqrt(1+.8*Math.pow((y-NS*SH/2)/(NS*SH/2),2)),H:NS*SH+6,nu:24,nv:10,hole:holeFn(d*.5,2020+s,null,2.5)}),CONC(d),G,Math.sin(a)*(R-14),0,Math.cos(a)*(R-14)-R*.7);}
 if(d===0){mesh(lathe({rFn:y=>22*Math.pow(clamp(1-Math.pow(y/10,2),0,1),.5)+.01,H:10,nu:48,nv:8}),MAT.glass,G,0,NS*SH,R*.3-R*.7+10);}
 else mesh(lathe({rFn:y=>21*Math.pow(clamp(1-Math.pow(y/10,2),0,1),.5)+.01,H:10,nu:48,nv:8,hole:(u,y)=>fbm(u*4,y*.3,2030,2)<.5}),MAT.dark,G,0,NS*SH,R*.3-R*.7+10);
 // porte-cochère + pool deck at the foot
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);kput('archOpen',[0,4,R-R*.7+2],qFacing([0,0,1]),[1,.9,2],null);
 kput(BOXC(d),[0,7.5,R-R*.7+18],null,[40,.8,24],null);for(let k=0;k<4;k++){const a=k/4*TAU;beam(BOXC(d),[Math.cos(a)*14,0,R-R*.7+18+Math.sin(a)*8],[Math.cos(a)*6,7,R-R*.7+18+Math.sin(a)*4],1.2,1.2);}
 kput('boxD',[-50,.4,-30],null,[30,.4,18],null);if(d===0)kput('pane',[-50,.5,-30],qEuler(Math.PI/2,0,0),[28,16,1],null);
 if(d>0){scatterMoss(0,.6,0,20,120,80,2.4);rubbleRing(0,.6,R*.3-R*.7,10,70,40,2.5);trees(0,0,110,160,12);}
 figures(0,60,6,12);KOFF=[0,0,0];return G;}

// ================================================================= UNIVERSITY v2 — "the Hill School" (one interconnected terrace structure)
function buildCampus(scene,gx,gz,d){reseed(9800+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'University — the Hill School ('+STATE(d)+')',x:-40,z:60,r:330,h:90});
 const hill=(x,z)=>{const t=clamp((330-z)/600,0,1);const ex=clamp((380-Math.abs(x))/120,0,1),ez=clamp((360-Math.abs(z))/60,0,1);const e=ex*ex*(3-2*ex)*ez*ez*(3-2*ez);return (58*t*t*(3-2*t)+4*fbm(x/60+3,z/60,1.5,2))*e;};
 const hm=gridSurface((u,v)=>{const x=(u-.5)*780,z=(v-.5)*740;return[x,hill(x,z),z];},90,86,{uS:30,vS:28});mesh(hm,d>0?MAT.turfR:MAT.turf,G);
 const SH=4.2,DEP=18,SB=3.2;const wings=[];const GREEN=new THREE.Color().setHSL(.29,.5,d>0?.14:.24);
 // wing: bar from p0→p1 (horizontal), floors nf, base y0, terraces stepping toward `up` (unit vector, uphill)
 function wing(p0,p1,nf,y0,up,name){const dx=p1[0]-p0[0],dz=p1[1]-p0[1];const L=Math.hypot(dx,dz);const ax=dx/L,az=dz/L;const ang=Math.atan2(az,ax);const q=qEuler(0,-ang,0);
  const mid=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2];wings.push({p0,p1,y0,nf,up});REGISTER({name,x:mid[0],z:mid[1],y:y0-8,r:L/2+10,h:nf*SH+14});
  // platform cut into the hill: retaining walls
  kput(BOXC(d),[mid[0]-up[0]*4,y0-6,mid[1]-up[1]*4,],q,[L+6,12,DEP+12],null);
  for(let f=0;f<=nf;f++){const y=y0+f*SH;const off=f*SB;const cx=mid[0]+up[0]*(off+DEP/2),cz=mid[1]+up[1]*(off+DEP/2);const gone=d>0&&f===nf&&rng()<.5;
   if(!gone){kput(BOXC(d),[cx,y,cz],q,[L+2,.6,DEP+1.5],null);
    // planted front edge on every terrace, parapet on the top
    for(let k=0;k<Math.round(L/6);k++){const t=(k+.5)/Math.round(L/6);const x=p0[0]+dx*t+up[0]*(off+.8),z=p0[1]+dz*t+up[1]*(off+.8);if(d>0&&rng()<.3)continue;if(rng()<.55)kput('hedge',[x,y+.7,z],q,[5.4,.9,1.6],GREEN);
     if(d>0)kput('vine',[x,y+.3,z-up[1]*.6],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[1.2,rr(3,SH*2),1.2],null);}
    if(f===nf){kput('brick',[cx+up[0]*(DEP/2-.5),y+.6,cz+up[1]*(DEP/2-.5)],q,[L+2,1.2,.5],null);for(let k=0;k<3;k++)kput('hedge',[mid[0]+up[0]*(off+DEP*.6)+ax*(k-1)*L*.3,y+1.1,mid[1]+up[1]*(off+DEP*.6)+az*(k-1)*L*.3],q,[8,1,3],GREEN);}}
   if(f<nf){const ff=f*SB;const fcx=mid[0]+up[0]*(ff+DEP/2),fcz=mid[1]+up[1]*(ff+DEP/2);
    kput('boxD',[fcx,y+SH/2,fcz],q,[L-1,SH-.8,DEP-2],null);
    // front: columns + spandrel brick + glass; back wall brick; ends brick
    const nx=Math.round(L/5);for(let k=0;k<=nx;k++){const t=k/nx;const x=p0[0]+dx*t+up[0]*(ff+1.2),z=p0[1]+dz*t+up[1]*(ff+1.2);if(d>0&&rng()<.06)continue;kput(BOXC(d),[x,y+SH/2,z],q,[.7,SH,.7],null);}
    kput('brick',[mid[0]+up[0]*(ff+1.4),y+.9,mid[1]+up[1]*(ff+1.4)],q,[L,1.2,.4],null);
    if(d===0)kput('pane',[mid[0]+up[0]*(ff+1.4),y+2.8,mid[1]+up[1]*(ff+1.4)],q,[L,2.8,1],null);else if(rng()<.5)kput('paneD',[mid[0]+up[0]*(ff+1.4),y+2.7,mid[1]+up[1]*(ff+1.4)],q,[L*.6,2.4,1],null);
    kput('brick',[mid[0]+up[0]*(ff+DEP-.6),y+SH/2,mid[1]+up[1]*(ff+DEP-.6)],q,[L+1,SH,.6],null);
    for(const s of [-1,1])kput('brick',[mid[0]+ax*s*(L/2)+up[0]*(ff+DEP/2),y+SH/2,mid[1]+az*s*(L/2)+up[1]*(ff+DEP/2)],q,[.6,SH,DEP-1],null);
    for(let k=0;k<Math.round(L/10);k++){const t=(k+.5)/Math.round(L/10);const lit=d>0?rng()<.1:true;kput('strip',[p0[0]+dx*t+up[0]*(ff+4),y+SH-.5,p0[1]+dz*t+up[1]*(ff+4)],q,[7,1,1],lit?CYAN:DEAD);}
    if(f===0){const t=.5;kput('archOpen',[p0[0]+dx*t+up[0]*(ff+1.3),y+2.4,p0[1]+dz*t+up[1]*(ff+1.3)],qFacing([-up[0],0,-up[1]]),[.45,.45,1],null);}}}
  // external stair down the front at one end
  for(let k=0;k<8;k++)kput(BOXC(d),[p1[0]-ax*3-up[0]*(2+k*1.5),y0-.4-k*.9,p1[1]-az*3-up[1]*(2+k*1.5)],q,[3,.4,1.5],null);
  if(d>0){for(let k=0;k<4;k++){const t=rng();kput('vine',[p0[0]+dx*t+up[0]*.8,y0+nf*SH,p0[1]+dz*t+up[1]*.8],null,[1.4,rr(6,nf*SH),1.4],null);}}}
 // the chain: zigzag up the hill (uphill = −z); each wing's base is the hill height at its downhill face
 const chain=[[[-190,230],[30,230],3,'Wing 1 — academic'],[[30,150],[30,230],3,'Wing 2 — link'],[[30,150],[-170,150],4,'Wing 3 — library floors'],[[-170,60],[-170,150],3,'Wing 4 — link'],[[-170,60],[70,60],4,'Wing 5 — laboratories'],[[70,-30],[70,60],3,'Wing 6 — link'],[[70,-30],[-130,-30],3,'Wing 7 — halls']];
 chain.forEach((c,i)=>{const isX=c[0][1]===c[1][1];const up=isX?[0,-1]:[(c[0][0]<0?1:-1),0];const zf=Math.max(c[0][1],c[1][1]);const y0=Math.round(hill((c[0][0]+c[1][0])/2,zf+2)+1);wing(c[0],c[1],c[2],y0,up,'Campus '+c[3]);});
 // courtyards between wings: big trees, paths, an atrium bridge across each
 [[-70,190,-190,150,30,230],[-70,105,-170,60,30,150],[-50,15,-130,-30,70,60]].forEach((c,i)=>{const [cx,cz,x0,z0,x1,z1]=c;const y=hill(cx,cz);REGISTER({name:'Campus courtyard '+(i+1),x:cx,z:cz,y:y-2,r:60,h:30});
  for(let k=0;k<5;k++){const x=rr(x0+20,x1-20),z=rr(z0+20,z1-20);const h=rr(18,30);kput('trunk',[x,y-2,z],null,[4,h,4],null);for(let j=0;j<4;j++){const s=rr(8,14);kput('moss',[x+rr(-4,4),y+h*.6+j*3,z+rr(-4,4)],qEuler(rng(),rng(),rng()),[s,s*.55,s],new THREE.Color().setHSL(rr(.25,.34),rr(.4,.55),rr(.15,.26)));}}
  for(let k=0;k<12;k++)kput('hedge',[rr(x0+8,x1-8),y+.4,rr(z0+8,z1-8)],qEuler(0,rng()*3,0),[rr(3,8),.8,rr(2,4)],GREEN);
  kput(BOXC(d),[cx,y+.1,cz],qEuler(0,rr(0,.6),0),[3,.3,Math.abs(z1-z0)-10],null);kput(BOXC(d),[cx,y+.1,cz],qEuler(0,rr(0,.6),0),[Math.abs(x1-x0)-10,.3,3],null);});
  // The atrium bridge that used to run diagonally over each courtyard is gone.
  // It cut across the one open void in the plan at a 0.5 rad angle that matched
  // nothing else on the hill, and closed the courtyards off from above.
  // Both rr() calls above are kept so the paths land where they always did.
 // curving concrete steps at the foot; a summit drum
 // (the rectangular lawn terrace that used to sit here is gone: a hard-edged
 //  260x140 slab of flat green laid across a rolling hill read as a decal, not
 //  as ground. The steps and the hill mesh carry the approach on their own.)
 for(let s=0;s<5;s++){const zb=280+s*14;mesh(gridSurface((u,v)=>{const x=-180+u*170;const z=zb+18*Math.sin(u*4+s*.6)+v*1.2-s*3*Math.sin(u*2);return[x,hill(x,z)+.4+s*.05,z];},60,1,{}),CONC(d),G);}
 for(let k=0;k<6;k++)kput(BOXC(d),[-40,hill(-40,330)+.3,330-k*2],null,[20,.4,1.6],null);
 {const cx=-40,cz=-110;const y=hill(cx,cz)+1;REGISTER({name:'Campus — summit hall',x:cx,z:cz,y:y-4,r:30,h:16});kput(SLABC(d),[cx,y-4,cz],null,[30,8,30],null);
  mesh(lathe({rFn:()=>24,H:11,nu:48,nv:4,hole:holeFn(d*.6,2100,null,2)}),MAT.brick,G,cx,y,cz);mesh(lathe({rFn:()=>22,H:11,nu:24,nv:1}),MAT.dark,G,cx,y,cz);
  kput(SLABC(d),[cx,y+11,cz],null,[25,.8,25],null);for(let k=0;k<20;k++){const th=(k+.5)/20*TAU;if(d===0)kput('pane',[cx+24.2*Math.cos(th),y+6,cz+24.2*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[5,4,1],null);kput(BOXC(d),[cx+24.4*Math.cos(th+.16),y+5.5,cz+24.4*Math.sin(th+.16)],qEuler(0,-th-.16,0),[1,11,1.4],null);}
  for(let k=0;k<8;k++)kput('hedge',[cx+18*Math.cos(k/8*TAU),y+12,cz+18*Math.sin(k/8*TAU)],qEuler(0,-k/8*TAU,0),[8,1,2.5],GREEN);kput('archOpen',[cx,y+2.6,cz+23.8],qFacing([0,0,1]),[.6,.6,1],null);stripRing(cx,y+9.5,cz,20,d,24);
  for(let k=0;k<6;k++)kput(BOXC(d),[cx+k*5,hill(cx+k*5,cz+40)+.4,cz+40],null,[4,.4,6],null);}
 // forest — big canopies, none on platforms/lawn
 for(let i=0;i<300;i++){const x=rr(-380,380),z=rr(-350,350);let on=z>240&&x>-200&&x<70;for(const w of wings){const minx=Math.min(w.p0[0],w.p1[0])-12,maxx=Math.max(w.p0[0],w.p1[0])+12,minz=Math.min(w.p0[1],w.p1[1])-12-(w.up[1]<0?DEP+w.nf*SB:0),maxz=Math.max(w.p0[1],w.p1[1])+12;const wx=w.up[0];const mx0=minx-(wx>0?0:DEP+w.nf*SB),mx1=maxx+(wx>0?DEP+w.nf*SB:0);if(x>mx0&&x<mx1&&z>minz&&z<maxz)on=true;}
  if(on||(Math.abs(x+40)<36&&Math.abs(z+110)<36))continue;const y=hill(x,z);const h=rr(16,34);kput('trunk',[x,y,z],null,[3.5,h,3.5],null);for(let k=0;k<4;k++){const s=(4-k)*2.6*(h/24);kput('moss',[x+rr(-2,2),y+h*.5+k*h*.14,z+rr(-2,2)],qEuler(0,rng()*TAU,0),[s,s*.65,s],new THREE.Color().setHSL(rr(.25,.35),rr(.35,.5),rr(.1,.2)));}}
 figures(-80,300,10,30);figures(-70,190,6,20);KOFF=[0,0,0];return G;}

// ================================================================= DAM ARCOLOGY — "Theodiga" (after Soleri)
function buildDam(scene,gx,gz,d){reseed(9260+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const H=400,SPAN=640,CH=440;REGISTER({name:'Dam arcology — Theodiga ('+STATE(d)+')',x:0,z:0,r:520,h:H+40});
 // canyon walls: two rock masses, rough, running upstream (−z) and downstream (+z)
 // The canyon was too smooth — a pair of soft banks rather than cut rock. It
 // now carries bedding planes, vertical gullies and a coarser base noise, at a
 // grid fine enough to show them, plus a talus of fallen blocks at the foot.
 // All six wall meshes merge into one: they always shared a material.
 const ROCK=[];
 for(const s of [-1,1]){const CX=s*(SPAN/2+150);
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300,y=v*CH;
   const strata=9*Math.sin(v*34+fbm(u*4,0,2205,2)*7);                        // bedding planes
   const gully=26*Math.pow(Math.abs(fbm(u*19,v*3,2206+s,3)-.5)*2,1.7);       // vertical gullies
   const inner=-s*(150-32*fbm(u*13,v*7,2200+s,4)-strata-gully-18*(1-v)*(1-v));
   const wob=1+.12*fbm(u*6,v*2,2210,2);return[CX+inner*wob,y,z];},118,38,{uS:40,vS:14}));
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300,x=CX+(v-.5)*2*300;
   return[x,CH+8*fbm(u*7,v*7,2220+s,2)+16*fbm(u*3,v*3,2221+s,2),z];},60,12,{uS:40,vS:20}));
  ROCK.push(gridSurface((u,v)=>{const z=-700+u*1300;const x=CX+s*300;return[x,v*CH,z];},40,6,{}));
  for(let k=0;k<70;k++){const z=-700+rng()*1300,t=Math.pow(rng(),1.8);
   const bx=CX-s*(150-34*fbm((z+700)/1300*13,.1,2200+s,4))*(1-t*.5)+s*t*70;
   const sc=rr(3,15)*(1-t*.45);
   kput('rubble',[bx,sc*.4+t*4,z],qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.09),rr(.1,.3),rr(.26,.44)));}}
 meshMerged(ROCK,MAT.rock,G);
 // the dam: arc in plan bulging upstream; downstream face battered, upstream face vertical
 const zc=x=>-140*(1-Math.pow(x/(SPAN/2),2));const th_=y=>50+110*(1-y/H);
 const dsFace=(u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)+th_(y)];};
 // LIGHT TUNNELS are chosen HERE, before the face is built, because the face
 // has to be punched where they break through it. Generating them afterwards
 // left every shaft behind an unbroken elevation — all that showed was the 2 m
 // of collar that protruded, so they read as blind bosses rather than openings.
 const TUNS=[];
 for(let k=-5;k<=5;k++){const tx=k*52;
  for(let j=0;j<3;j++){
   if(rng()<.18)continue;                                  // not a perfect grid
   TUNS.push({x:tx,y:96+j*82+rr(-9,9),R:rr(7.5,10.5),blocked:d>0&&rng()<.30});}}
 const tunHole=(x,y)=>{for(const t of TUNS){const dx=x-t.x,dy=y-t.y;
  if(dx*dx+dy*dy<t.R*t.R*.86)return true;}return false;};
 const fh=holeFn(d*.5,2300,null,1.6);
 const FACE=[gridSurface(dsFace,160,80,{uS:32,vS:20,hole:(u,v)=>
   tunHole((u-.5)*SPAN,v*H)||(fh?fh(u,v):false)}),
  gridSurface((u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)-2];},96,10,{uS:32,vS:20}),
  gridSurface((u,v)=>{const x=(u-.5)*SPAN;return[x,H,zc(x)+v*th_(H)];},96,4,{uS:32,vS:4})];
 meshMerged(FACE,CONC(d),G);
 if(d>0)mesh(gridSurface((u,v)=>{const x=(u-.5)*SPAN,y=v*H;return[x,y,zc(x)+th_(y)-6];},48,20,{}),MAT.guts,G);
 // crest: light wells (arc of slots), residential arc, public centre dome, cultural domes
 for(let k=-13;k<=13;k++){const x=k*22;const z=zc(x);const gone=d>0&&rng()<.15;kput(BOXC(d),[x,H+9,z+8],null,[15,18,28],null);kput('boxD',[x,H+18.2,z+8],null,[9,.4,20],null);kput(BOXC(d),[x,H+8,z+50],null,[18,16,22],null);for(let r=0;r<2;r++)for(let c=-1;c<=1;c++)kput(d>0?'winSmD':'winSmI',[x+c*5,H+5+r*6,z+61.2],qFacing([0,0,1]),[2,2.4,1],null);
  if(!gone){const lit=d>0?rng()<.12:true;kput('strip',[x,H+12.6,z+10],qEuler(0,Math.PI/2,0),[16,1,1],lit?CYAN:DEAD);}}
 mesh(lathe({rFn:y=>44*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,flutes:24,amp:.06,sharp:2,nu:96,nv:14,hole:(u,y)=>Math.cos(u*TAU*24)<.3&&y>3&&y<22||(d>0&&fbm(u*4,y*.1,2310,2)<.3)}),skin,G,0,H+12,zc(0)+20);
 if(d===0)mesh(lathe({rFn:y=>42*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}),MAT.glass,G,0,H+12,zc(0)+20);else mesh(lathe({rFn:y=>40*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}),MAT.dark,G,0,H+12,zc(0)+20);
 for(const s of [-1,1])for(let k=0;k<3;k++){const x=s*(90+k*40);mesh(lathe({rFn:y=>15*Math.pow(clamp(1-Math.pow(y/12,2),0,1),.5)+.01,H:12,flutes:12,amp:.08,nu:36,nv:8,hole:holeFn(d*.7,2320+k,null,2.5)}),skin,G,x,H+12,zc(x)+40);}
 // the cruciform on the downstream face: upper residential fins, learning-centre beam, lower splayed fins, central spine
 const zf=y=>zc(0)+th_(y);const fins=[];for(let k=-3;k<=3;k++)fins.push([k*46,244,H+10,30,d>0&&(k===2)]);for(let k=-2.5;k<=2.5;k++)fins.push([k*52,50,214,34,d>0&&(k===-1.5)]);
 fins.forEach((f,i)=>{const [x,y0,y1,w,broken]=f;const top=broken?lerp(y0,y1,.45):y1;const L=top-y0;const cy=(y0+top)/2;const zz=zf(cy);const splay=y0<100?.06:0;
  const q=qEuler(0,0,x>0?-splay:splay);const prot=y0<100?50:44;
  kput(BOXC(d),[x+(x>0?1:-1)*splay*20,cy,zz+prot/2-4],q,[w,L,prot],null);kput('boxD',[x+(x>0?1:-1)*splay*20,cy,zz+prot/2-4],q,[w-1.5,L+.5,prot-1.5],null);
  for(let yy=y0+4;yy<top-2;yy+=8)kput(BOXC(d),[x+(x>0?1:-1)*splay*20,yy,zz+prot/2-3],q,[w+1.5,.8,prot+1],null);
  // mosaic of cells on the fin faces (the Soleri hieroglyph texture)
  // MOSAIC. Cells used to be scattered by a flat coin-flip, which reads as
  // noise. Soleri's facades are a hieroglyph: cells clump into patches and run
  // in bands, with occasional double-height openings and whole blank panels.
  // fbm supplies the patches, a sine the banding, and the two are mixed.
  for(let yy=y0+6;yy<top-4;yy+=5)for(const s of [-1,1]){const n=Math.round(prot/5);
   const cv=(yy-y0)/Math.max(1,top-y0);
   for(let c=0;c<n;c++){const cu=(c+.5)/n;
    const patch=fbm(cu*3.4+i*2.3,cv*6.5,2340+i,3);
    const band=Math.abs(Math.sin(cv*Math.PI*5.5+fbm(cu*2.2,0,2341,2)*3.4));
    const m=patch*.70+band*.30;
    if(m<.47)continue;
    const tall=m>.745;                       // a taller opening where the mosaic is densest
    const lit=d>0?rng()<.05:rng()<.55;
    const z=zz-4+(c+.5)*prot/n,cx=x+s*(w/2+.15)+(x>0?1:-1)*splay*20;
    kput('cell',[cx,yy+(tall?1.1:0),z],qFacing([s,0,0]),[3.6,tall?5.2:3,1],
     lit?(m>.62?WARM:CYAN).clone().multiplyScalar(rr(.4,.95)):(d>0?DEAD:new THREE.Color(0x1a2a3a)));}}
  if(broken){rubbleRing(x*1.5,0,zf(0)+40+Math.abs(x)*.3,10,60,60,3);}else{kput(BOXC(d),[x,top+1,zz+prot/2-4],null,[w+2,2,prot+2],null);if(y0>100&&d===0)kput('finial',[x,top+6,zz+prot/2-4],null,[2.5,4,2.5],null);}});
 // LIGHT TUNNELS. A dam this deep has no daylight anywhere behind its face, so
 // shafts are driven back through the mass from the downstream elevation and up
 // to the crest. Each reads as a lit throat ringed by a collar on the face, with
 // its matching slot cut in the crest deck directly above.
 const TUN=[];
 TUNS.forEach(t=>{const tx=t.x,ty=t.y,R0=t.R;
  // the face BULGES: zc(x) runs from -140 at mid-span to 0 at the abutments, so
  // the tunnel z comes from zc(tx), not zf() which is only true at x=0.
  const tz=zc(tx)+th_(ty);
  // An OPEN tube: the kit's 'tube' is a CAPPED CylinderGeometry and built a
  // closed drum whose flat end cap was all you saw. lathe() is open-ended.
  TUN.push(lathe({rFn:()=>R0,H:34,nu:14,nv:2}).rotateX(-Math.PI/2).translate(tx,ty,tz+2));
  kput(d>0?'ringR':'ringW',[tx,ty,tz+1.2],null,[R0*1.22,R0*1.22,2.6],null);
  if(!t.blocked){const lit=d>0?rng()<.14:true;
   // recessed a little way inside the collar: a plate on the axis is only
   // visible looking straight down the bore, and nothing views this face square-on
   kput('dot',[tx,ty,tz-9],qFacing([0,0,1]),[R0*1.14,R0*2.29,1],
    lit?CYAN.clone().multiplyScalar(rr(.55,1)):DEAD);}
  kput('boxD',[tx,H+18.4,zc(tx)+8],null,[7.5,.6,26],null);});   // its slot on the crest
 meshMerged(TUN,d>0?MAT.guts:MAT.dark,G);
 // learning-centre beam (horizontal), and the spine
 const by=228;kput(BOXC(d),[0,by,zf(by)+18],null,[340,26,44],null);kput('boxD',[0,by,zf(by)+18],null,[338,24,42],null);
 for(let k=-16;k<=16;k++){if(k%2)continue;const lit=d>0?rng()<.1:true;kput('strip',[k*10,by+4,zf(by)+40.2],null,[8,1,1],lit?CYAN:DEAD);if(d===0)kput('pane',[k*10,by-3,zf(by)+40.3],null,[9,9,1],null);else if(rng()<.5)kput('paneD',[k*10,by-3,zf(by)+40.3],null,[9,9,1],null);}
 // (an empty loop body used to sit here: it computed a y and discarded it)
 mesh(gridSurface((u,v)=>{const y=v*(by-13);const w=14;return[(u-.5)*w,y,zf(y)+38];},4,40,{uS:2,vS:20,hole:holeFn(d*.7,2330,null,1.5)}),MAT.dark,G);
 for(let y=10;y<by-13;y+=9){const lit=d>0?rng()<.12:true;kput('strip',[0,y,zf(y)+38.3],null,[12,1,1],lit?CYAN:DEAD);}
 for(const s of [-1,1])kput(BOXC(d),[s*8,(by-13)/2,zf((by-13)/2)+36],qEuler(-Math.atan2(110,H),0,0),[2.5,by-13,6],null);
 // base: production/utilities blocks, outlets with waterfalls, the park in the canyon floor
 for(let k=-4;k<=4;k++){const x=k*48;if(Math.abs(k)<2)continue;kput(BOXC(d),[x,14,zf(14)+22],null,[38,28,48],null);kput('boxD',[x,14,zf(14)+22],null,[36,26,46],null);for(let j=0;j<3;j++)kput('archOpen',[x-12+j*12,6,zf(14)+46.5],qFacing([0,0,1]),[1,.9,1.5],null);
  kput(d>0?'pipeR':'pipe',[x,30,zf(30)+30],null,[1.2,40,1.2],null);}
 for(const s of [-1,1]){const x=s*40;kput('tube',[x,26,zf(26)+2],null,[9,12,9],null);
  if(d===0)mesh(gridSurface((u,v)=>{const y=lerp(26,2,v);return[x+(u-.5)*14*(1+v*.8),y,zf(26)+6+v*20+v*v*20];},8,12,{}),MAT.spray,G);}
 mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN-40),z=zf(0)+60+v*500;return[x,1.5+3*fbm(u*6,v*6,2400,2)+(z>zf(0)+120?0:-1.5),z];},40,30,{}),d>0?MAT.mud:MAT.lawn,G);
 mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN-60),z=zf(0)+56+v*520;return[x,-1+0*u,z];},4,4,{}),MAT.water,G).position.y=0;
 for(let i=0;i<60;i++){const x=rr(-280,280),z=zf(0)+rr(90,540);const h=rr(6,14);kput('trunk',[x,1,z],null,[2,h,2],null);kput('moss',[x,h,z],null,[6,3,6],new THREE.Color().setHSL(.3,.5,.2));}
 // reservoir behind (full when intact; drawn down and silted when ruined)
 const WL=d>0?250:378;mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN+80),z=-700+v*(700+zc(x)-6);return[x,WL,z];},32,16,{}),MAT.water,G);
 if(d>0)mesh(gridSurface((u,v)=>{const x=(u-.5)*(SPAN+40),z=-700+v*(700+zc(x)-2);return[x,WL-6+30*fbm(u*5,v*5,2500,2)*v*v,z];},32,16,{uS:20,vS:20}),MAT.mud,G);
 // ruin: cracks, moss on the face, rubble at the toe
 // decay read off the structure rather than sprayed in rings
 if(d>0){mossOnSurface(FACE,0,0,0,140,2.6);vinesFromLedge(FACE,0,0,0,60,26);stainsFromLedge(FACE,0,0,0,70,22);
  mossOnSurface(ROCK,0,0,0,120,3.4);
  scatterMoss(0,2,zf(0)+200,0,300,120,3);rubbleRing(0,2,zf(0)+70,20,220,120,4);vinesOnRing(0,H+12,zc(0)+10,60,20,60);for(let k=0;k<30;k++)kput('vine',[rr(-300,300),rr(120,H),zf(200)+2],qEuler(rr(-.05,.05),0,0),[1.5,rr(15,60),1.5],null);}
 figures(0,zf(0)+200,10,60);KOFF=[0,0,0];return G;}

// ================================================================= factory: great silo replaces the ring block
function factorySilo(G,d,skin){const ax=110,az=-60;REGISTER({name:'Factory — great silo',x:ax,z:az,r:45,h:150});
 const stem=y=>y<12?8+.03*Math.pow(12-y,2):(y<20?8+27*Math.pow((y-12)/8,1.6):35);
 mesh(lathe({rFn:stem,H:30,nu:64,nv:30,hole:holeFn(d*.6,80,null,1.5)}),skin,G,ax,6,az);if(d>0)mesh(lathe({rFn:y=>stem(y)*.92,H:30,nu:32,nv:6}),MAT.dark,G,ax,6,az);
 for(let k=0;k<28;k++){const th=k/28*TAU;if(d>0&&rng()<.4)continue;beam(d>0?'strutR':'strutW',[ax+Math.cos(th)*17,20,az+Math.sin(th)*17],[ax+Math.cos(th)*37,38,az+Math.sin(th)*37],2.2,1.8);
  const r=35.6;kput(d>0?'winSmD':'winSmI',[ax+Math.cos(th+.11)*r,31,az+Math.sin(th+.11)*r],qFacing([Math.cos(th+.11),0,Math.sin(th+.11)]),[5,1.6,1],null);}
 kput('slab',[ax,36.4,az],null,[36,1,36],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(ax,33,az,33,d,40);
 for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===3||k===9))continue;kput(d>0?'colR':'colW',[ax+Math.cos(th)*30,6,az+Math.sin(th)*30],null,[1.2,14,1.2],null);}
 // the silo proper: 8-lobed drum rising 110 m from the ring, domed cap, service ring
 const SH=110,cut=d>0?SH*.7:null;const sr=y=>26*(1-.12*y/SH);
 mesh(lathe({rFn:sr,H:SH,cut,jag:cut?5:0,flutes:8,amp:.22,sharp:1.2,nu:96,nv:50,hole:holeFn(d,85,cut,1.4),seed:85}),skin,G,ax,37,az);
 if(d>0)mesh(lathe({rFn:y=>sr(y)*.88,H:SH,cut,jag:5,nu:32,nv:8,seed:85}),MAT.guts,G,ax,37,az);
 for(let yy=12;yy<(cut||SH)-8;yy+=22)kput(d>0?'ringR':'ringW',[ax,37+yy,az],qEuler(Math.PI/2,0,0),[sr(yy)*1.05,sr(yy)*1.05,4],null);
 if(!cut){mesh(lathe({rFn:y=>sr(SH)*Math.sqrt(clamp(1-Math.pow(y/14,2),0,1)),H:14,nu:48,nv:8}),skin,G,ax,37+SH-.5,az);stripRing(ax,37+SH-3,az,sr(SH)*.95,d,32);}
 else rubbleRing(ax,6,az,38,70,60,3);
 for(let k=0;k<3;k++){const th=k/3*TAU+.5;kput(d>0?'pipeR':'pipe',[ax+Math.cos(th)*24,37,az+Math.sin(th)*24],null,[1.1,(cut||SH)*.9,1.1],null);}
 kput(d>0?'pipeR':'pipe',[ax-30,26,az+20],qEuler(0,.6,Math.PI/2),[1.6,60,1.6],null);}

// ================================================================= GOVERNMENT v2 — "the Assembly" (all round)
function buildGovernment(scene,gx,gz,d){reseed(9900+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Government — the Assembly ('+STATE(d)+')',x:0,z:0,r:150,h:120});
 const tiers=[[92,84,14],[66,60,14],[42,38,14]];let y=0;
 tiers.forEach((t,i)=>{const [a,b,h]=t;const hole=holeFn(d*(i===2?1:.5),600+i,null,1.3);
  mesh(lathe({rFn:yy=>a-(a-b)*yy/h,H:h,flutes:24-i*6,amp:.05,sharp:2,nu:120,nv:6,hole:hole?(u,yy)=>hole(u,yy+i*30)&&(u>.15&&u<.42):null}),skin,G,0,y,0);
  if(d>0)mesh(lathe({rFn:yy=>(a-(a-b)*yy/h)*.9,H:h,nu:48,nv:1}),MAT.guts,G,0,y,0);
  kput('slab',[0,y+h,0],null,[b*.99,.6,b*.99],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  const n=Math.round(a*.42);for(let k=0;k<n;k++)for(let row=0;row<2;row++){const th=(k+.5)/n*TAU;const yy=y+3.5+row*6;const r=a-(a-b)*(yy-y)/h+.2;const u=th/TAU;if(hole&&hole(u,yy+i*30))continue;
   if(i===0&&row===0&&Math.abs(th-Math.PI/2)<.5)continue;kput(d>0?'winD':'winI',[r*Math.cos(th),yy,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,.9,1],null);}
  stripRing(0,y+h-1.2,0,b*1.01,d,48);if(d>0)mossOnRing(0,y+h+.2,0,b*.9,Math.round(b*.8),2.2);y+=h;});
 // portico: a fan of leaning struts on the +z face, rising to a ring beam at tier 2, roofed by a curved shell that grows out of the tier wall
 const NP=11;const struts=[];for(let k=0;k<NP;k++){const a=Math.PI/2+(k-(NP-1)/2)*.11;const fallen=d>0&&(k===2||k===7);
  const A=[Math.cos(a)*130,0,Math.sin(a)*130],B=[Math.cos(a)*64,29,Math.sin(a)*64];struts.push([a,A,B]);
  if(!fallen)beam(d>0?'strutR':'strutW',A,B,4.5,3.5);else beam('strutR',[A[0],2,A[2]],[A[0]*.7+rr(-8,8),3,A[2]*.72],4.5,3.5);}
 const a0=Math.PI/2-(NP-1)/2*.11-.05,a1=Math.PI/2+(NP-1)/2*.11+.05;
 // ring beam on the strut tops, a light glass roof back to the tier-2 wall, and a comb of bone fins above the beam
 for(let k=0;k<NP-1;k++){const A=struts[k][2],B=struts[k+1][2];beam(d>0?'strutR':'strutW',[A[0],A[1]+1,A[2]],[B[0],B[1]+1,B[2]],3,3.5);}
 if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(40,64,v);return[Math.cos(a)*r,27+3.5*v,Math.sin(a)*r];},30,4,{}),MAT.glass,G);
 for(let k=0;k<NP-1;k++)for(let j=0;j<3;j++){const A=struts[k][2],B=struts[k+1][2];const t=(j+.5)/3;const x=lerp(A[0],B[0],t),z=lerp(A[2],B[2],t);if(d>0&&rng()<.4)continue;
  const a=Math.atan2(z,x);const h=rr(6,11);beam(d>0?'strutR':'strutW',[x,31,z],[x-Math.cos(a)*2,31+h,z-Math.sin(a)*2],1.2,.9);}
 for(let j=0;j<=6;j++){const a=lerp(a0,a1,j/6);beam(d>0?'strutR':'strutW',[Math.cos(a)*40,27,Math.sin(a)*40],[Math.cos(a)*64,30.5,Math.sin(a)*64],1,1.4);}
 for(let k=0;k<7;k++){const a=lerp(a0,a1,(k+.5)/7);const lit=d>0?rng()<.15:true;kput('strip',[Math.cos(a)*70,29.3,Math.sin(a)*70],qEuler(0,-a+Math.PI/2,0),[20,1,1],lit?CYAN:DEAD);}
 kput('archOpen',[0,8,91],qFacing([0,0,1]),[2.2,2.2,3],null);kput('slab',[0,.6,110],null,[40,1.2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<3;k++)kput(d>0?'boxR':'boxW',[0,.4+k*1.2,88+k*3],null,[30,1.2,3],null);
 // petal council chamber + spire
 const P=new THREE.Group();P.position.set(0,42,0);G.add(P);useGroupXF(P);
 petalRing(P,8,23,36,15,4,1,0,d,650,skin,d>0?(i=>i===1||i===4||i===6):null);
 if(d===0)mesh(lathe({rFn:yy=>19*Math.pow(clamp(1-Math.pow(yy/27,2),0,1),.6),H:27,nu:48,nv:14}),MAT.glass,P,0,1,0);
 else mesh(lathe({rFn:yy=>18*Math.pow(clamp(1-Math.pow(yy/27,2),0,1),.6),H:27,nu:48,nv:14,hole:(u,yy)=>fbm(u*3,yy*.1,660,2)<.5}),MAT.dark,P,0,1,0);
 stripRing(0,4,0,17,d,32);const SH=40,scut=d>0?SH*.45:null;mesh(lathe({rFn:yy=>3*(1-.6*yy/SH)+.4,H:SH,cut:scut,jag:scut?1.5:0,flutes:6,amp:.25,nu:24,nv:16}),skin,P,0,27,0);
 if(!scut)kput('finial',[0,27+SH+2,0],null,[3,5,3],null);endGroupXF();
 if(d>0){const fm=mesh(petalGeo(23,36,15,4,1,holeFn(1,661,null,1.5)),MAT.rust,G,-60,4,70);fm.rotation.set(0,1.2,Math.PI/2*.85);dropFragment(fm);rubbleRing(-60,0,70,5,30,50,2.5);
  scatterMoss(0,0,0,100,190,140,3);rubbleRing(0,0,0,96,150,70,2.5);trees(0,0,120,220,18);}
 figures(0,150,8,10);figures(-70,110,4,5);KOFF=[0,0,0];return G;}

// ================================================================= bunker: AA battery on the cupola
function aaBattery(G,d,x,y,z,s){s=s||1;kput(d>0?'boxR':'boxW',[x,y+1.2*s,z],null,[6*s,2.4*s,6*s],null);kput('tube',[x,y+3.6*s,z],null,[2.2*s,2.4*s,2.2*s],null);
 const yaw=rr(0,TAU),pitch=d>0?.1:.9;const q=qEuler(0,-yaw,0).multiply(qEuler(0,0,pitch));const bx=x+Math.cos(yaw)*1.5*s,bz=z+Math.sin(yaw)*1.5*s;
 kput(d>0?'boxR':'boxW',[bx,y+5.5*s,bz],q,[8*s,4*s,5*s],null);
 for(let i=0;i<2;i++)for(let j=0;j<4;j++){const off=new THREE.Vector3(0,(i-.5)*1.7*s,(j-1.5)*1.15*s).applyQuaternion(q);const tip=new THREE.Vector3(4.6*s,0,0).applyQuaternion(q);
  kput('tube',[bx+off.x+tip.x*.5,y+5.5*s+off.y+tip.y*.5,bz+off.z+tip.z*.5],q.clone().multiply(qEuler(0,0,-Math.PI/2)),[.7*s,8*s,.7*s],null);}
 kput('tube',[x,y+2.4*s,z],null,[.4*s,7*s,.4*s],null);kput(d>0?'boxR':'boxW',[x,y+6*s,z],qEuler(0,rng()*3,0),[3.5*s,1.6*s,.2*s],null);}

// ================================================================= HOUSES v2
function buildHouses(scene,gx,gz,d){reseed(9400+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // A — petal house: petals part at the front, a porch of two leaning struts marks the door
 {REGISTER({name:'House A — petal house ('+STATE(d)+')',x:0,z:0,r:14,h:14});
  const P=new THREE.Group();G.add(P);mesh(lathe({rFn:()=>9.5,H:1,nu:40,nv:1}),skin,P);kput('slab',[0,1,0],null,[9.5,.4,9.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  mesh(lathe({rFn:()=>5,H:5.5,nu:32,nv:3,hole:holeFn(d*.5,101,null,3)}),skin,P,0,1,0);if(d>0)mesh(lathe({rFn:()=>4.6,H:5.5,nu:16,nv:1}),MAT.dark,P,0,1,0);
  kput('archOpen',[0,3.2,5.1],qFacing([0,0,1]),[.4,.5,1],null);for(let k=1;k<4;k++){const th=k/4*TAU+Math.PI/2;kput(d>0?'winSmD':'winSmI',[Math.cos(th)*5.1,3.6,Math.sin(th)*5.1],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.4,1],null);}
  petalRing(P,8,6.6,11,5.2,1.6,.5,1,d,110,skin,i=>i===2||(d>0&&i===5));petalRing(P,8,3.8,13,3.6,-.6,.4,1,d,120,skin,d>0?(i=>i===6):null);
  beam(d>0?'strutR':'strutW',[-4,1,10],[-2,6,5.5],.8,.6);beam(d>0?'strutR':'strutW',[4,1,10],[2,6,5.5],.8,.6);kput(d>0?'boxR':'boxW',[0,6.2,7.5],qEuler(.3,0,0),[6,.4,5],null);
  kput('slab',[0,.2,14],null,[3,.4,3],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  if(d===0)mesh(lathe({rFn:y=>4.2*Math.sqrt(clamp(1-Math.pow(y/6,2),0,1)),H:6,nu:24,nv:6}),MAT.glass,P,0,6.5,0);
  if(d>0){const fm=mesh(petalGeo(6.6,11,5.2,1.6,.5,null),MAT.rust,P,14,.6,-6);fm.rotation.set(0,.9,Math.PI/2*.9);dropFragment(fm,0,.15);mossOnRing(0,1.4,0,8,14,1.2);}
  stripRing(0,5.5,0,4.3,d,12);}
 // B — hypar-shell house: a real room block inside the two shells, glass gables, door in the front gable
 {REGISTER({name:'House B — hypar-shell house ('+STATE(d)+')',x:70,z:0,r:14,h:14});kput('slab',[70,.5,0],null,[13,.5,13],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  luceShells(G,70,0,16,13,5,d,130,skin);
  kput(d>0?'boxR':'boxW',[70,3.5,0],null,[9,6,7],null);kput('boxD',[70,3.5,0],null,[8.6,5.6,6.6],null);
  kput('archOpen',[70,2.2,4.0],qFacing([0,0,1]),[.35,.4,1],null);kput('archOpen',[70,2.2,4.9],qFacing([0,0,1]),[.35,.4,1],null);
  for(let s=-1;s<=1;s+=2)for(let k=-1;k<=1;k+=2)kput(d>0?'winSmD':'winSmI',[70+k*2.5,4.2,s*3.6],qFacing([0,0,s]),[1.2,1.2,1],null);
  for(let k=-1;k<=1;k+=2)kput(d>0?'winSmD':'winSmI',[70+k*4.6,3.2,0],qFacing([k,0,0]),[1.4,1.6,1],null);
  kput('slab',[70,.2,10],null,[2.5,.4,2.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(70,8.5,0,2.2,d,8);if(d>0)mossOnRing(70,.9,0,8,10,1.1);}
 // C — lobed cluster house (Goldberg): kept, entry path added
 {REGISTER({name:'House C — lobed cluster house ('+STATE(d)+')',x:140,z:0,r:12,h:12});const P=new THREE.Group();P.position.set(140,0,0);G.add(P);
  mesh(lathe({rFn:()=>2.6,H:10,nu:20,nv:2}),skin,P);
  for(let l=0;l<3;l++){const a=l/3*TAU+.5,ox=Math.cos(a)*4.6,oz=Math.sin(a)*4.6;const gone=d>0&&l===1;
   kput(d>0?'colR':'colW',[140+ox,0,oz],null,[1.1,3.2,1.1],null);if(gone){rubbleRing(140+ox,0,oz,1,5,18,1.2);continue;}
   mesh(lathe({rFn:y=>3.6*(1-.05*Math.pow(y/7,6)),H:7,nu:28,nv:10,hole:holeFn(d,140+l,null,2.5)}),skin,P,ox,3,oz);if(d>0)mesh(lathe({rFn:()=>3.2,H:7,nu:14,nv:1}),MAT.dark,P,ox,3,oz);
   kput(d>0?'ringR':'ringW',[140+ox,10,oz],qEuler(Math.PI/2,0,0),[3.7,3.7,2],null);
   // floor and domed cap: each lobe was a bare tube on a single column, open
   // at the top and at the bottom.
   kput('slab',[140+ox,3,oz],null,[3.7,.5,3.7],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
   if(!(d>0&&l===2))mesh(lathe({rFn:y=>3.7*Math.sqrt(clamp(1-Math.pow(y/2.6,2),0,1)),H:2.6,nu:20,nv:6}),skin,P,ox,10,oz);
   for(let yy=1.5;yy<6;yy+=2.6)for(let k=-1;k<=1;k++){const th=a+k*.55;kput(d>0?'ovalD':'ovalI',[140+ox+3.6*Math.cos(th),3+yy,oz+3.6*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.55,.8,.8],null);}}
  kput('slab',[140,10.2,0],null,[2.8,.5,2.8],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));kput('archOpen',[140-2.6,1.8,0],qFacing([-1,0,0]),[.28,.36,1],null);kput('slab',[132,.2,0],null,[2.5,.4,2.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  stripRing(140,8,0,2.2,d,8);if(d>0)mossOnRing(140,.3,0,7,12,1.1);}
 figures(35,14,4,4);KOFF=[0,0,0];return G;}

// ================================================================= APARTMENTS — three variants
function buildApartments(scene,gx,gz,d){reseed(9950+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // A — midrise terrace stack: eight stacked lobed trays, each shifted and shrunk, on a hyperboloid stem
 {REGISTER({name:'Apartments A — terrace stack, midrise ('+STATE(d)+')',x:0,z:0,r:40,h:60});mesh(lathe({rFn:y=>7*Math.sqrt(1+1.5*Math.pow((y-20)/20,2)),H:40,nu:32,nv:12}),skin,G);
  const aSkin=[],aDark=[];   // one mesh per stack, not two or three per terrace
  for(let s=0;s<8;s++){const y=6+s*5.4;const ox=Math.sin(s*1.3)*5,oz=Math.cos(s*.9)*5;const R=24-s*1.6;const gone=d>0&&s===6;const hole=holeFn(d*.7,700+s,null,2.5);
   if(gone){rubbleRing(ox*3,0,oz*3,10,32,30,2);continue;}
   // floor and ceiling: each tray was an open-ended tube, so from above you
   // looked straight down through all eight of them to the ground.
   kput('slab',[ox,y,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   kput('slab',[ox,y+4.6,oz],null,[R*.99,.35,R*.99],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   aSkin.push(lathe({rFn:()=>R,H:4.6,flutes:6,amp:.28,sharp:1,nu:72,nv:3,hole}).translate(ox,y,oz));
   if(d>0)aDark.push(lathe({rFn:()=>R*.9,H:4.6,nu:24,nv:1}).translate(ox,y,oz));
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))*(1+v*.1);return[ox+r*Math.cos(th),y+4.6+.4*v,oz+r*Math.sin(th)];},72,1,{}));
   for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;const r=R*(1+.28*(.5+.5*Math.cos(6*th)))+.1;if(hole&&hole(k/18,y))continue;kput(d>0?'winSmD':'winSmI',[ox+r*Math.cos(th),y+2.3,oz+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[2,1.7,1],null);}
   if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);}
  meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);
  if(d>0){mossOnSurface(aSkin,0,0,0,90,1.8);vinesFromLedge(aSkin,0,0,0,40,12);stainsFromLedge(aSkin,0,0,0,30,9);}
  kput('archOpen',[7,3.5,0],qFacing([1,0,0]),[.5,.5,1],null);}
 // B — honeycomb wall: a long curved slab of hexagonal cells (Beksinski lattice), 12 storeys
 {const bx=150;REGISTER({name:'Apartments B — honeycomb wall, large ('+STATE(d)+')',x:bx,z:0,r:70,h:62});const R=110,a0=-.55,a1=.55,HW=60;
  const hexHole=(u,v)=>{const cx=u*30,cy=v*13;const rowOff=(Math.floor(cy)%2)*.5;const fx=((cx+rowOff)%1)-.5,fy=(cy%1)-.5;return Math.abs(fx)<.32&&Math.abs(fy)<.34&&Math.abs(fx)+Math.abs(fy)*1.2<.52;};
  const wall=(off)=>gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R+off;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},240,80,{uS:30,vS:13,hole:(u,v)=>hexHole(u,v)||(holeFn(d,710,null,1.5)||(()=>false))(u*3,v*HW)});
  mesh(wall(0),skin,G);mesh(wall(-12),skin,G);
  // cell floors between the skins, dark inner
  mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-6;return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},60,12,{}),MAT.dark,G);
  const bFloors=[];
  for(let f=0;f<13;f++){const y=f*HW/13;bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,y,Math.cos(a)*r-R*.8];},60,1,{hole:d>0?(u,v)=>fbm(u*12,f,720+f,2)<.2:null}));}
  // END WALLS AND ROOF. The block is a 12 m sandwich of two perforated skins;
  // without these it was open along both end elevations and across the whole
  // top, so you looked straight into thirteen storeys of floor slab from the
  // side. The skins are the long elevations, not the whole envelope.
  for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
   bFloors.push(gridSurface((u,v)=>{const r=lerp(R-12,R,u);return[bx+Math.sin(a)*r,v*HW,Math.cos(a)*r-R*.8];},10,44,{uS:6,vS:13,hole:d>0?(u,v)=>fbm(u*4+s*3,v*7,714+s,2)<.28:null}));}
  bFloors.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-12,R,v);return[bx+Math.sin(a)*r,HW,Math.cos(a)*r-R*.8];},60,4,{uS:20,vS:4,hole:d>0?(u,v)=>fbm(u*9,v*4,716,2)<.24:null}));
  meshMerged(bFloors,skin,G);
  for(let k=0;k<30;k++)for(let f=0;f<13;f++){if(rng()>.35)continue;const a=lerp(a0,a1,(k+.5)/30),y=f*HW/13+2.3;const lit=d>0?rng()<.06:true;
   kput('cell',[bx+Math.sin(a)*(R-5),y,Math.cos(a)*(R-5)-R*.8],qFacing([Math.sin(a),0,Math.cos(a)]),[2,1.6,1],lit?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}
  for(let k=0;k<7;k++){const a=lerp(a0,a1,(k+.5)/7);kput(d>0?'colR':'colW',[bx+Math.sin(a)*(R-6),0,Math.cos(a)*(R-6)-R*.8],null,[3,HW+3,3],null);}
  if(d>0){rubbleRing(bx,0,R*.2,10,60,50,2.5);}}
 // C — column cluster: five slim lobed towers (30–48 m) linked by sky bridges
 {const cx=340;REGISTER({name:'Apartments C — column cluster, large ('+STATE(d)+')',x:cx,z:0,r:60,h:52});const cols=[[0,0,48],[26,10,40],[-22,14,36],[8,-26,44],[-18,-18,30]];
  const cBands=[];   // the balcony rings of all five towers in one mesh
  cols.forEach((c,i)=>{const R=7.5,H=c[2];const cut=d>0&&i===1?H*.5:null;const hole=holeFn(d,730+i,cut,2);
   kput(d>0?'colR':'colW',[cx+c[0],0,c[1]],null,[4,10,4],null);
   mesh(lathe({rFn:()=>R,H:H-10,cut:cut?cut-10:null,jag:cut?2:0,flutes:6,amp:.3,sharp:1,nu:60,nv:24,hole,seed:730+i}),skin,G,cx+c[0],10,c[1]);
   if(d>0)mesh(lathe({rFn:()=>R*.85,H:H-10,cut:cut?cut-10:null,jag:2,nu:24,nv:4,seed:730+i}),MAT.guts,G,cx+c[0],10,c[1]);
   for(let s=0;s*4<(cut||H)-14;s++){const y=10+s*4;cBands.push(lathe({rFn:()=>R*1.08,H:.6,flutes:6,amp:.3,sharp:1,nu:60,nv:1,hole:d>0?(u,v)=>fbm(u*8+s,i,740+s,2)<.22:null}).translate(cx+c[0],y+3.4,c[1]));
    for(let k=0;k<6;k++){const th=k/6*TAU;const u=k/6;if(hole&&hole(u,y-10))continue;const r=R*1.3+.1;kput(d>0?'winSmD':'winSmI',[cx+c[0]+r*Math.cos(th),y+1.8,c[1]+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.6,1.6,1],null);}
    if(s%3===0)stripRing(cx+c[0],y+2.3,c[1],R*.85,d,12);}
   if(!cut){kput('slab',[cx+c[0],H+.2,c[1]],null,[R*1.1,.5,R*1.1],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>R*.6*Math.sqrt(clamp(1-Math.pow(y/3,2),0,1)),H:3,nu:20,nv:5}),skin,G,cx+c[0],H+.4,c[1]);}
   else rubbleRing(cx+c[0],0,c[1],9,24,40,2);});
  meshMerged(cBands,skin,G);
  [[0,1,22],[0,2,18],[0,3,26],[2,4,16],[1,3,24]].forEach(b=>{const A=cols[b[0]],B=cols[b[1]];if(b[2]>Math.min(A[2],B[2])-4)return;if(d>0&&b[0]===0&&b[1]===1)return;
   beam(d>0?'strutR':'strutW',[cx+A[0],b[2],A[1]],[cx+B[0],b[2],B[1]],2.4,3);beam('tube',[cx+A[0],b[2]+2,A[1]],[cx+B[0],b[2]+2,B[1]],2,2);});
  kput('slab',[cx,.3,0],null,[50,.6,50],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));if(d>0)scatterMoss(cx,.6,0,0,48,40,1.8);}
 figures(60,40,5,6);figures(300,60,4,5);KOFF=[0,0,0];return G;}

// ================================================================= AMPHITHEATER — "the Bowl"
function buildAmphitheater(scene,gx,gz,d){reseed(9960+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Amphitheater — the Bowl ('+STATE(d)+')',x:0,z:0,r:110,h:60});
 // SIGHTLINES. Two separate things decided whether a seat could see the stage.
 //
 // 1. THE SWEEP. The acoustic shell is a half-dome occupying z<0 and opening
 //    toward +z, so a seat looks INTO the shell only while its own z>0 — that
 //    is, while |a| < PI/2. The bowl used to sweep +/-2.2 rad (252 deg), which
 //    left the outer 29% of every row sitting behind the shell looking at its
 //    back. The sweep is now +/-1.5 rad (172 deg), a Roman semicircle: every
 //    seat is in front of the opening.
 //
 // 2. THE RAKE. A constant rise per row does NOT give a constant view. The
 //    clearance C — how far a row's sightline passes above the eye of the row
 //    in front — decays roughly as 1/n. With the old flat 1.5 m rise it was
 //    0.58 m at row 1 and 0.071 m by row 15, well under the ~0.12 m a person
 //    needs to see past the head in front, so the back third of the bowl was
 //    looking at the back of someone's skull. Solving
 //        E(n+1) = (D(n+1)/D(n)) * (E(n) + C)
 //    for a fixed C gives the classic parabolic rake, where the rise grows with
 //    the row. E is eye height above the focus, D is eye distance from it.
 //    Rescaled so the top row still lands at y=24 where the rim wall meets it,
 //    so the bowl keeps its old silhouette and the rim and struts still fit.
 const a0=-1.5,a1=1.5;
 const NR=16,TRD=4.2,R0=24,EYE=1.2,SEATIN=2,FOCR=24,FOCY=2.4,CVAL=.18;
 const rowR=t=>R0+t*TRD;                              // inner radius of row t
 const eyeD=t=>rowR(t)+SEATIN-FOCR;                   // eye distance from the focus
 const TH=[1.5];                                      // tread height, row by row
 for(let t=1;t<NR;t++)TH.push((eyeD(t)/eyeD(t-1))*(TH[t-1]+EYE-FOCY+CVAL)+FOCY-EYE);
 {const k=(24+EYE-FOCY)/(TH[NR-1]+EYE-FOCY);          // scale E, not the height
  for(let t=0;t<NR;t++)TH[t]=(TH[t]+EYE-FOCY)*k+FOCY-EYE;}
 // seating: one mesh for every tread and one for every riser, not two per row
 const treads=[],risers=[];
 for(let t=0;t<NR;t++){const r0=rowR(t),r1=r0+TRD;const yb=t?TH[t-1]:0,yt=TH[t];
  const hole=d>0?(u,v)=>fbm(u*6+t,2,800+t,2)<.16:null;
  treads.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(r0,r1-.3,v);return[Math.sin(a)*r,yt,Math.cos(a)*r];},80,1,{hole}));
  risers.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*r0,yb+v*(yt-yb),Math.cos(a)*r0];},80,1,{hole}));
  if(t%4===3)for(let k=0;k<12;k++){const a=lerp(a0,a1,(k+.5)/12);const lit=d>0?rng()<.12:true;kput('strip',[Math.sin(a)*(r0+2),yt+.1,Math.cos(a)*(r0+2)],qEuler(0,a,0),[2.5,1,1],lit?CYAN:DEAD);}}
 meshMerged(treads,CONC(d),G);meshMerged(risers,MAT.dark,G);
 // aisles: a ramp that follows the rake. The old one was a single straight box
 // laid across the bowl, which only sat on the steps while the rise was constant.
 const rakeY=r=>{const t=clamp((r-R0)/TRD,0,NR-1);const i=Math.min(Math.floor(t),NR-2);return lerp(TH[i],TH[i+1],t-i);};
 const aisles=[];
 for(let k=0;k<5;k++){const a=lerp(a0,a1,k/4);const ca=Math.cos(a),sa=Math.sin(a);
  aisles.push(gridSurface((u,v)=>{const r=lerp(R0,rowR(NR-1)+TRD,u),w=(v-.5)*3;
   return[sa*r+ca*w,rakeY(r)+.15,ca*r-sa*w];},48,1,{uS:20}));}
 meshMerged(aisles,skin,G);
 // outer rim: leaning struts and a flared rim wall (Tange). Strut count follows
 // the sweep, so they stay at the same spacing now the bowl is narrower.
 for(let k=0;k<16;k++){const a=lerp(a0,a1,(k+.5)/16);const fallen=d>0&&(k===3||k===11);const A=[Math.sin(a)*100,0,Math.cos(a)*100],B=[Math.sin(a)*88,27,Math.cos(a)*88];
  if(!fallen)beam(d>0?'strutR':'strutW',A,B,2.6,2.2);else beam('strutR',[A[0],1.5,A[2]],[A[0]*.8,2,A[2]*.8],2.6,2.2);}
 mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(88,92,v);return[Math.sin(a)*r,24+v*6,Math.cos(a)*r];},80,2,{uS:20,hole:holeFn(d*.7,820,null,2)}),CONC(d),G);
 // stage + petal acoustic shell
 kput('slab',[0,1.2,0],null,[24,2.4,24],new THREE.Color(d>0?0x4a4038:0xcfcac2));
 const AR=24;mesh(lathe({rFn:y=>AR*Math.sqrt(clamp(1-Math.pow(y/AR,2),0,1)),H:AR,nu:64,nv:20,hole:(u,y)=>Math.sin(u*TAU)>.02||(d>0&&fbm(u*5,y*.15,830,2)<.28)||[[.62,.5],[.8,.35],[.72,.75]].some(o=>Math.hypot((u-o[0])*4,y/AR-o[1])<.11)}),CONC(d),G,0,2.4,0);
 mesh(lathe({rFn:y=>AR*.94*Math.sqrt(clamp(1-Math.pow(y/AR,2),0,1)),H:AR,nu:32,nv:10,hole:(u,y)=>Math.sin(u*TAU)>.02}),MAT.dark,G,0,2.4,0);
 for(let k=0;k<5;k++){const a=Math.PI+(k-2)*.5;kput(BOXC(d),[Math.cos(a)*AR*.9,2.4+7,Math.sin(a)*AR*.9],qEuler(0,-a,0),[2,14,4],null);}
 kput(BOXC(d),[0,2.4+AR-2,-4],null,[30,1.2,10],null);
 stripRing(0,4,0,14,d,20);
 if(d>0){scatterMoss(0,0,0,30,120,120,2.2);rubbleRing(0,0,-40,5,60,50,2.2);trees(0,0,105,160,10);}
 figures(0,50,10,20);KOFF=[0,0,0];return G;}

// ================================================================= FUEL STATION — "the Well"
function buildFuelStation(scene,gx,gz,d){reseed(9970+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Fuel station — the Well ('+STATE(d)+')',x:0,z:0,r:60,h:30});
 kput('slab',[0,.3,0],null,[52,.6,52],new THREE.Color(d>0?0x4a4038:0x8a8078));
 // canopy: one hyperboloid mast, a lobed hovering disc with a hole, six pump bays under it
 mesh(lathe({rFn:y=>4*Math.sqrt(1+2*Math.pow((y-9)/9,2)),H:18,nu:32,nv:10}),skin,G);
 mesh(lathe({rFn:y=>lerp(30,34,Math.sin(Math.PI*y/3)),H:3,flutes:6,amp:.22,sharp:1,nu:96,nv:4,hole:(u,y)=>false}),skin,G,0,15,0);
 mesh(lathe({rFn:()=>6,H:3.2,nu:24,nv:1}),MAT.dark,G,0,14.9,0);
 if(d>0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(6,30*(1+.22*(.5+.5*Math.cos(6*th))),v);return[r*Math.cos(th),15,r*Math.sin(th)];},96,4,{hole:(u,v)=>fbm(u*5,v*3,900,2)>.55}),MAT.rust,G);
 for(let k=0;k<6;k++){const th=k/6*TAU;const r=20;const x=r*Math.cos(th),z=r*Math.sin(th);const lit=d>0?rng()<.2:true;
  kput('strip',[x,14.6,z],qEuler(0,-th,0),[9,1,1],lit?CYAN:DEAD);
  kput(d>0?'boxR':'boxW',[x,1.6,z],qEuler(0,-th,0),[1.2,2.6,3],null);kput('boxD',[x,2.5,z],qEuler(0,-th,0),[1.3,.8,1.6],null);
  kput('tube',[x,1.6,z+1.8],qEuler(.6,0,0),[.15,3,.15],null);}
 // three storage lobes behind, pipes to the mast
 for(let i=0;i<3;i++){const x=-42+i*16,z=-44;const R=7;const gone=d>0&&i===1;
  if(!gone)mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(d*.7,910+i,null,2)}),skin,G,x,1,z);
  else{const fm=mesh(lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu:28,nv:12,hole:holeFn(1,911,null,1.5)}),MAT.rust,G,x+3,1,z+4);fm.rotation.set(.5,0,.9);dropFragment(fm,0,1.2);}
  for(let k=0;k<3;k++){const th=k/3*TAU;kput(d>0?'colR':'colW',[x+4*Math.cos(th),0,z+4*Math.sin(th)],null,[.9,1.5,.9],null);}
  kput(d>0?'pipeR':'pipe',[x,1.2,z+22],qEuler(Math.PI/2,0,0),[.5,44,.5],null);}
 kput(d>0?'pipeR':'pipe',[-26,1.2,-44],qEuler(0,0,Math.PI/2),[.6,34,.6],null);
 // kiosk
 mesh(lathe({rFn:y=>5*Math.pow(clamp(1-Math.pow(y/7,2),0,1),.5),H:7,flutes:8,amp:.1,nu:32,nv:8,hole:holeFn(d*.6,920,null,2.5)}),skin,G,34,0,-20);
 kput('archOpen',[29.5,2,-20],qFacing([-1,0,0]),[.3,.35,1],null);stripRing(34,4,-20,3.5,d,10);
 if(d>0){scatterMoss(0,.6,0,0,50,50,1.6);rubbleRing(-42,0,-44,4,20,20,1.5);trees(0,0,60,100,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

// ================================================================= RADAR TOWER — "the Listener"
function buildRadarTower(scene,gx,gz,d){reseed(9980+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Radar tower — the Listener ('+STATE(d)+')',x:0,z:0,r:40,h:100});
 const H=80;const cut=d>0?H*.78:null;const rFn=y=>7*Math.sqrt(1+3*Math.pow((y-H*.6)/(H*.6),2));
 const lat=(u,y)=>{const a=u*TAU*8,b=y*.35;return Math.abs(Math.sin(a+b))>.3&&Math.abs(Math.sin(a-b))>.3;};
 const top=cut||H;for(let k=0;k<8;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=top;y+=4){const th=k/8*TAU+dir*y*.045;const r=rFn(y);const p=[r*Math.cos(th),2+y,r*Math.sin(th)];if(prev&&!(d>0&&fbm(k+dir,y*.05,1000,2)<.2))beam(d>0?'strutR':'strutW',prev,p,.9,.9);prev=p;}}
 mesh(lathe({rFn:()=>2.2,H:cut||H,nu:12,nv:2}),MAT.dark,G,0,2,0);
 for(let yy=10;yy<(cut||H)-4;yy+=14)kput(d>0?'ringR':'ringW',[0,2+yy,yy===10?0:0],qEuler(Math.PI/2,0,0),[rFn(yy),rFn(yy),3],null);
 kput('slab',[0,1,0],null,[16,2,16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 for(let k=0;k<3;k++){const th=k/3*TAU;beam(d>0?'strutR':'strutW',[Math.cos(th)*30,0,Math.sin(th)*30],[Math.cos(th)*rFn(20)*.9,22,Math.sin(th)*rFn(20)*.9],2.2,1.8);}
 if(!cut){kput('slab',[0,H+2,0],null,[12,1.2,12],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>9*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,nu:32,nv:6}),skin,G,0,H+2.6,0);
  // rotating bar antenna: two curved wings on a pedestal
  kput('tube',[0,H+9,0],null,[1.4,3,1.4],null);const ay=H+11;const yaw=rr(0,TAU);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,ay+v*4+.15*Math.pow(x/15,2)*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.dark,G);wm.rotation.y=yaw;
  kput('boxW',[0,ay+2,0],qEuler(0,-yaw,0),[30,.4,.6],null);stripRing(0,H+1,0,10,d,16);
  // small dish on the side
  const dish=gridSurface((u,v)=>{const a=u*TAU,r=v*5;return[r*Math.cos(a),r*r*.06,r*Math.sin(a)];},24,6,{});const dm=mesh(dish,skin,G,14,H-4,0);dm.rotation.set(-.4,0,-.9);kput('tube',[12,H-8,0],qEuler(0,0,.4),[.5,8,.5],null);}
 else{for(let k=0;k<8;k++){beam('strutR',[14+rr(-4,4),1,10+rr(-4,4)],[30+rr(-6,6),3,22+rr(-6,6)],.9,.9);}rubbleRing(22,0,16,3,20,40,1.8);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,v*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.dark,G,-10,.5,24);wm.rotation.set(Math.PI/2*.9,0,.4);dropFragment(wm,0,.2);}
 // service hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1010,null,2.5)}),skin,G,-22,0,8);kput('archOpen',[-16.5,1.8,8],qFacing([1,0,0]),[.3,.35,1],null);
 if(d>0){scatterMoss(0,0,0,10,60,50,1.8);vinesOnRing(0,2+cut,0,rFn(cut),8,20);trees(0,0,40,80,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

// ================================================================= SATELLITE DISH — "the Ear"
function buildDish(scene,gx,gz,d){reseed(9990+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Satellite dish — the Ear ('+STATE(d)+')',x:0,z:0,r:70,h:80});
 const R=44;kput('slab',[0,1,0],null,[40,2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 // pedestal: three leaning hyperboloid legs meeting at a yoke
 for(let k=0;k<3;k++){const th=k/3*TAU;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*26,2,Math.sin(th)*26);Lg.rotation.set(0,-th,0);Lg.rotateZ(Math.atan2(24,30));G.add(Lg);
  mesh(lathe({rFn:y=>3.2*Math.sqrt(1+1.5*Math.pow((y-19)/19,2)),H:38,nu:20,nv:8}),skin,Lg);}
 kput('tube',[0,32,0],null,[5,6,5],null);
 const D=new THREE.Group();D.position.set(0,36,0);const tilt=d>0?1.1:.55;D.rotation.set(tilt,0,0);G.add(D);useGroupXF(D);
 const dishF=(u,v)=>{const a=u*TAU,r=v*R;return[r*Math.cos(a),r*r/(R*2.2),r*Math.sin(a)];};
 mesh(gridSurface(dishF,72,18,{uS:12,vS:6,hole:d>0?(u,v)=>{const n=fbm(u*6,v*4,1100,2);return n<.32||(u>.62&&u<.8&&v>.55);}:null}),skin,D);
 mesh(gridSurface((u,v)=>{const p=dishF(u,v);return[p[0],p[1]-.6,p[2]];},72,18,{uS:12,vS:6,hole:d>0?(u,v)=>fbm(u*6,v*4,1100,2)<.32||(u>.62&&u<.8&&v>.55):null}),MAT.dark,D);
 for(let k=0;k<24;k++){const a=k/24*TAU;kput(d>0?'ringR':'ringW',[0,0,0],null,[.01,.01,.01],null);}
 for(let k=0;k<12;k++){const a=k/12*TAU;if(d>0&&k===7)continue;beam(d>0?'strutR':'strutW',[Math.cos(a)*4,0,Math.sin(a)*4],[Math.cos(a)*R*.95,R*R*.95*.95/(R*2.2),Math.sin(a)*R*.95],.9,1.2);}
 // feed on a tripod of thin struts
 const fy=R*.55;for(let k=0;k<3;k++){const a=k/3*TAU+.5;beam('tube',[Math.cos(a)*R*.7,R*R*.49/(R*2.2),Math.sin(a)*R*.7],[0,fy,0],.5,.5);}
 kput('finial',[0,fy,0],null,[2.5,3.5,2.5],null);
 kput(d>0?'ringR':'ringW',[0,R*R/(R*2.2)+.3,0],qEuler(Math.PI/2,0,0),[R,R,3],null);endGroupXF();
 if(d>0){const fm=mesh(gridSurface((u,v)=>{const p=dishF(u*.2+.62,v*.45+.55);return p;},14,8,{uS:12,vS:6}),MAT.rust,G,56,1,54);fm.rotation.set(1.3,.3,.9);dropFragment(fm,0,1.5);rubbleRing(0,0,20,10,40,40,2);scatterMoss(0,0,0,12,70,50,2);trees(0,0,50,90,8);}
 // control hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1110,null,2.5)}),skin,G,40,0,-10);kput('archOpen',[34.5,1.8,-10],qFacing([-1,0,0]),[.3,.35,1],null);
 kput(d>0?'pipeR':'pipe',[20,.6,-4],qEuler(0,-.3,Math.PI/2),[.4,36,.4],null);
 figures(0,40,3,4);KOFF=[0,0,0];return G;}

// ================================================================= MEGASTRUCTURE — "the Unnamed" (cyclopean, unclear purpose)
function buildMega(scene,gx,gz,d){reseed(9995+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Megastructure — the Unnamed ('+STATE(d)+')',x:0,z:0,r:320,h:300});
 // the mass: a leaning, slightly twisted slab-prism, 260 m tall, 300 × 110 in plan, skinned in a dense mosaic of cells
 const H=260,W=300,Dp=110;const lean=.12,twist=.25;
 const frame=y=>{const t=y/H;return{ox:lean*y,rot:twist*t*t,w:W*(1-.18*t)+40*Math.sin(Math.PI*t),dp:Dp*(1-.1*t)};};
 const P=(u,v,side)=>{const y=v*H;const f=frame(y);const s=u*2-1;const c=Math.cos(f.rot),sn=Math.sin(f.rot);let lx,lz;
  if(side===0){lx=s*f.w/2;lz=f.dp/2;}else if(side===1){lx=s*f.w/2;lz=-f.dp/2;}else if(side===2){lx=f.w/2;lz=s*f.dp/2;}else{lx=-f.w/2;lz=s*f.dp/2;}
  const bulge=1+.06*Math.sin(v*Math.PI*2.5+side);lx*=bulge;lz*=bulge;return[f.ox+lx*c-lz*sn,y,lx*sn+lz*c];};
 const cellHole=(u,v,side)=>{const cx=u*(side<2?46:17),cy=v*60;const fx=(cx%1)-.5,fy=(cy%1)-.5;const big=fbm(u*5+side,v*7,1200+side,2);const open=Math.abs(fx)<.3&&Math.abs(fy)<.28&&big>.38;
  return open||(d>0&&fbm(u*3+side*.7,v*5,1210+side,3)<.22);};
 for(let side=0;side<4;side++){mesh(gridSurface((u,v)=>P(u,v,side),side<2?230:90,130,{uS:side<2?40:15,vS:36,hole:(u,v)=>cellHole(u,v,side)}),skin,G);
  mesh(gridSurface((u,v)=>{const p=P(u,v,side);const f=frame(v*H);return[f.ox+(p[0]-f.ox)*.94,p[1],p[2]*.94];},side<2?60:24,40,{}),MAT.dark,G);
  const n=side<2?46:17;for(let j=0;j<60;j++)for(let i=0;i<n;i++){if(!cellHole((i+.5)/n,(j+.5)/60,side))continue;if(rng()>.5)continue;const p=P((i+.5)/n,(j+.5)/60,side);const q=P((i+.5)/n,(j+.5)/60+.001,side);
   const lit=d>0?rng()<.02:rng()<.35;const nrm=side===0?[Math.sin(frame(p[1]).rot),0,Math.cos(frame(p[1]).rot)]:side===1?[-Math.sin(frame(p[1]).rot),0,-Math.cos(frame(p[1]).rot)]:side===2?[Math.cos(frame(p[1]).rot),0,-Math.sin(frame(p[1]).rot)]:[-Math.cos(frame(p[1]).rot),0,Math.sin(frame(p[1]).rot)];
   kput('cell',[p[0]-nrm[0]*2,p[1],p[2]-nrm[2]*2],qFacing(nrm),[3.5,2.6,1],lit?new THREE.Color(0x9fd8ff).multiplyScalar(rr(.3,.8)):DEAD);}}
 // top: a shallow sagging roof and a forest of stubby fins
 mesh(gridSurface((u,v)=>{const f=frame(H);const s=u*2-1,t=v*2-1;const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;return[f.ox+lx*c-lz*sn,H-8*(1-s*s)*(1-t*t),lx*sn+lz*c];},40,14,{uS:30,vS:10,hole:holeFn(d*.6,1230,null,2)}),skin,G);
 for(let k=0;k<26;k++){const f=frame(H);const s=rr(-.9,.9),t=rr(-.8,.8);const c=Math.cos(f.rot),sn=Math.sin(f.rot);const lx=s*f.w/2,lz=t*f.dp/2;const x=f.ox+lx*c-lz*sn,z=lx*sn+lz*c;const h=rr(10,40);
  if(d>0&&rng()<.4)continue;kput(d>0?'strutR':'strutW',[x,H-2+h/2,z],qEuler(0,-f.rot,rr(-.1,.1)),[rr(3,7),h,rr(1.5,3)],null);}
 // the eye: a great circular void punched through the mass, ringed
 const ey=H*.62,ex=lean*ey;const ER=34;
 kput('tube',[ex,ey,0],qEuler(Math.PI/2,0,0),[ER,Dp*1.02,ER],null);kput(d>0?'ringR':'ringW',[ex,ey,Dp/2+1],null,[ER+4,ER+4,20],null);kput(d>0?'ringR':'ringW',[ex,ey,-Dp/2-1],null,[ER+4,ER+4,20],null);
 // the outrigger: a second, smaller block hung off the east face on three colossal struts, joined by a bridge
 const O=new THREE.Group();O.position.set(W/2*.85+90,120,20);O.rotation.set(.08,.5,-.15);G.add(O);useGroupXF(O);
 const OH=110,OW=90,OD=60;for(let side=0;side<4;side++)mesh(gridSurface((u,v)=>{const s=u*2-1,y=v*OH;const bul=1+.05*Math.sin(v*6);let x,z;if(side===0){x=s*OW/2;z=OD/2;}else if(side===1){x=s*OW/2;z=-OD/2;}else if(side===2){x=OW/2;z=s*OD/2;}else{x=-OW/2;z=s*OD/2;}return[x*bul,y-OH/2,z*bul];},side<2?70:40,60,{uS:20,vS:15,hole:(u,v)=>{const cx=u*(side<2?18:10),cy=v*22;return (Math.abs((cx%1)-.5)<.28&&Math.abs((cy%1)-.5)<.28&&fbm(u*4,v*4,1240+side,2)>.4)||(d>0&&fbm(u*3,v*3,1250,2)<.2);}}),skin,O);
 mesh(new THREE.BoxGeometry(OW*.92,OH*.98,OD*.92),MAT.dark,O);endGroupXF();
 for(let k=0;k<3;k++){const zz=-30+k*30;if(d>0&&k===1)continue;beam(d>0?'strutR':'strutW',[W/2*.8+8,40+k*10,zz],[W/2*.85+70,110+k*8,20+zz*.6],9,7);}
 beam(d>0?'strutR':'strutW',[W/2*.82+lean*180,182,0],[W/2*.85+62,175,15],6,8);beam('tube',[W/2*.82+lean*180,186,0],[W/2*.85+62,179,15],5,5);
 // roots: buttress ribs sinking into a mound
 mesh(lathe({rFn:y=>220*Math.pow(clamp(1-y/26,0,1),.6)+40,H:26,nu:48,nv:6}),MAT.mud,G,W*.1,0,0);
 for(let k=0;k<18;k++){const a=k/18*TAU;const f=frame(0);const r0=Math.abs(Math.cos(a))*f.w/2+Math.abs(Math.sin(a))*f.dp/2;beam(d>0?'strutR':'strutW',[Math.cos(a)*(r0+70),0,Math.sin(a)*(r0+70)],[Math.cos(a)*r0*.98,55,Math.sin(a)*r0*.98],rr(4,9),rr(3,6));}
 for(let yy=40;yy<H-20;yy+=44)stripRing(lean*yy,yy,0,1,d,1);
 if(d>0){rubbleRing(0,0,0,150,320,200,4);scatterMoss(0,0,0,160,380,220,3.5);trees(0,0,240,420,30);vinesOnRing(lean*H,H-2,0,60,40,60);}
 figures(0,240,6,8);KOFF=[0,0,0];return G;}

// ================================================================= 2. FACTORY — "the Foundry"
function buildFactory(scene,gx,gz,d){reseed(d>0?9201:9200);KOFF=[gx,0,gz];REGISTER({name:'Factory — the Foundry ('+STATE(d)+')',x:0,z:0,r:260,h:120});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // plinth
 const pl=new THREE.CylinderGeometry(190*Math.SQRT2,196*Math.SQRT2,6,4,1);pl.rotateY(Math.PI/4);pl.translate(0,3,0);pl.scale(1,1,.62);mesh(pl,skin,G,-10,0,0);
 // --- great catenary vault hall (ribs + skin) -------------------------------------------------
 const W=90,Hh=55,L=160,hx=-40,z0=-L/2;const yb=6;
 for(let i=0;i<=16;i++){if(d>0&&(i===5||i===6||i===11))continue;kput(d>0?'vaultRibR':'vaultRib',[hx,yb,z0+i*10],null,1,null);}
 const skinFn=(u,v)=>{const x=(u-.5)*(W-2);return[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2)),z0+v*L];};
 const ridge=(u)=>Math.abs(u-.5)<.045;
 const skH=holeFn(d,21,null,1.3);
 mesh(gridSurface(skinFn,60,64,{uS:12,vS:20,hole:(u,v)=>ridge(u)||(skH&&skH(u*4,v*L))}),skin,G);
 if(d===0)mesh(gridSurface((u,v)=>skinFn(.455+u*.09,v),8,32,{}),MAT.glass,G);
 if(d>0){mesh(gridSurface((u,v)=>{const p=skinFn(u,v);return[p[0]*.97+hx*.03,yb+(p[1]-yb)*.93,p[2]];},40,32,{uS:12,vS:20}),MAT.guts,G);
  for(let k=0;k<30;k++){const x=rr(-38,38),z=rr(z0+5,z0+L-5);kput('pipeR',[hx+x,yb+(Hh-1.2)*(1-Math.pow(2*x/(W-2),2))*.9,z],qEuler(Math.PI/2,0,0),[.6,rr(10,40),.6],null);}}
 // end walls with big arched glass openings
 [z0,z0+L].forEach((zz,i)=>{const g=paraFill(W,Hh,34,40);const m=mesh(g,skin,G,hx,yb,zz);
  if(d===0){const gl=mesh(paraFill(34,40,0,0),MAT.glass,G,hx,yb,zz+(i?-.3:.3));}
  mullions(hx,yb,zz,0,0,0,d);for(let k=-3;k<=3;k++)kput(d>0?'mullR':'mullW',[hx+k*4.8,yb+19,zz],null,[1,36*(1-Math.pow(k/3.6,2)),1],null);});
 // interior strips along the hall
 for(let k=0;k<12;k++){const z=z0+8+k*13;const lit=d>0?rng()<.12:true;kput('strip',[hx,yb+Hh-4,z],null,[60,1,1],lit?CYAN:DEAD);}
 // --- Goldberg clover silos on hyperboloid legs -----------------------------------------------
 function silo(cx,cz,tilt,seed){const S=new THREE.Group();S.position.set(cx,0,cz);if(tilt)S.rotation.x=tilt;G.add(S);
  const legH=15,lobeH=46,Rl=9.5;
  mesh(lathe({rFn:()=>6.5,H:legH+lobeH+2,nu:24,nv:4}),skin,S);
  for(let l=0;l<4;l++){const a=(l+.5)*Math.PI/2,ox=Math.cos(a)*10.5,oz=Math.sin(a)*10.5;
   kput(d>0?'colR':'colW',[cx+ox,0,cz+oz],null,[3.2,legH,3.2],null);
   const hole=holeFn(d,seed+l,null,1.6);const o={rFn:y=>Rl*(1-.04*Math.pow(clamp(y/lobeH,0,1),6)),H:lobeH,nu:36,nv:24,hole,seed};
   const lm=mesh(lathe(o),skin,S,ox,legH,oz);
   if(d>0)mesh(lathe({rFn:()=>Rl*.9,H:lobeH,nu:20,nv:2}),MAT.guts,S,ox,legH,oz);
   // rim + oval windows facing outward from the core
   kput(d>0?'ringR':'ringW',[cx+ox,legH+lobeH,cz+oz],qEuler(Math.PI/2,0,0),[Rl+.2,Rl+.2,3],null);
   for(let yy=4;yy<lobeH-3;yy+=5.5)for(let k=-2;k<=2;k++){const th=a+k*.42;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,yy))continue;
    kput(d>0?'ovalD':'ovalI',[cx+ox+Rl*Math.cos(th),legH+yy,cz+oz+Rl*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,1.4,1],null);}
   if(d>0)vinesOnRing(cx+ox,legH+lobeH,cz+oz,Rl,10,30);}
  kput('slab',[cx,legH+lobeH+2,cz],null,[7,1,7],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  if(d>0)mossOnRing(cx,legH+lobeH+2.3,cz,6,10,2);}
 silo(72,-58,0,31);silo(72,0,0,32);silo(72,58,0,33);
 // pipes silos → hall
 for(let i=0;i<3;i++){const z=-58+i*58;kput(d>0?'pipeR':'pipe',[30,34+i*3,z],qEuler(0,0,Math.PI/2),[1.6,70,1.6],null);
  if(d>0&&i===1)continue;kput(d>0?'pipeR':'pipe',[30,34+i*3,z+6],qEuler(0,0,Math.PI/2),[1.1,70,1.1],null);}
 // --- organic stacks (Parc Güell chimneys, industrial scale) ------------------------------------
 for(let i=0;i<4;i++){const cx=22,cz=-75+i*50,H=95+i*6;const cutF=d>0?[.55,null,.7,null][i]:null;const cut=cutF!=null?H*cutF:null;
  const rFn=y=>6.5*(1-.45*y/H)+2.2*clamp((y-H+14)/14,0,1);const hole=holeFn(d,41+i,cut,1.2);
  const o={rFn,H,cut,jag:cut?4:0,flutes:9,amp:.28,sharp:2.5,nu:54,nv:40,hole,seed:41+i};
  mesh(lathe(o),skin,G,cx,6,cz);if(d>0)mesh(lathe({rFn:y=>rFn(y)*.85,H,cut,jag:o.jag,nu:20,nv:8}),MAT.guts,G,cx,6,cz);
  if(cut==null){const rc=rFn(H)+1.2;mesh(lathe({rFn:y=>rc*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:8}),skin,G,cx,6+H-.5,cz);}
  else rubbleRing(cx,6,cz,8,22,50,2.5);
  for(let yy=15;yy<H*.9;yy+=22){if(cut&&yy>cut-6)break;kput(d>0?'ringR':'ringW',[cx,6+yy,cz],qEuler(Math.PI/2,0,0),[rFn(yy)*1.07,rFn(yy)*1.07,4],null);}}
 // --- viaduct (parabolic arcade) carrying the conveyor tube --------------------------------------
 const vz=-100;for(let i=0;i<19;i++){const x=-180+i*16;const gone=d>0&&(i===7||i===8||i===9);
  if(!gone)kput(d>0?'archR':'arch',[x,0,vz],null,1,null);else rubbleRing(x,0,vz,1,10,35,2.2);
  if(!gone||d===0)kput(d>0?'pipeR':'pipe',[x,29.5,vz],qEuler(0,0,Math.PI/2),[2.7,16.2,2.7],null);}
 kput(d>0?'pipeR':'pipe',[-180+18*16+8,29.5,vz],qEuler(0,0,Math.PI/2),[3.2,16,3.2],null);
 // conveyor bends into the hall's west wall
 kput(d>0?'pipeR':'pipe',[-172,29.5,vz+8],qEuler(Math.PI/2,0,0),[3.2,16,3.2],null);
 kput(d>0?'pipeR':'pipe',[-172,29.5,z0+40],qEuler(Math.PI/2,0,0),[3.2,84,3.2],null);
 kput(d>0?'pipeR':'pipe',[hx-38,29.5,z0+80],qEuler(0,0,Math.PI/2),[3.2,180,3.2],null);
 for(let x=-160;x<=-100;x+=20)kput(d>0?'colR':'colW',[x,6,z0+80],null,[1.5,22,1.5],null);
 if(d>0){const fx=-180+8*16;const fm=mesh(new THREE.CylinderGeometry(3.2,3.2,40,10),MAT.pipeRust,G,fx+4,2.6,vz+6);fm.rotation.set(.1,0,Math.PI/2+.08);dropFragment(fm,0,.8);}
 factoryExtras(G,d,skin);
 if(d>0){scatterMoss(-10,6,0,0,200,200,3);rubbleRing(0,6,0,20,190,90,2.5);trees(0,0,210,290,24);scatterMoss(0,0,0,205,300,120,3);}
 figures(-120,120,6,8);figures(40,-130,4,5);KOFF=[0,0,0];
 return G;}

// ================================================================= 3. LABORATORY — "the Reliquary"
function buildLab(scene,gx,gz,d){reseed(d>0?9301:9300);KOFF=[gx,0,gz];REGISTER({name:'Laboratory — the Reliquary ('+STATE(d)+')',x:0,z:0,r:40,h:125});REGISTER({name:'Laboratory — reactor hut',x:104,z:0,r:12,h:17});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 const SH=4.4,NS=6;const phase=s=>s*.55;
 const rW=(th,s)=>30+2.6*Math.sin(7*th+phase(s))+1.1*Math.sin(3*th-phase(s)*.7);
 const lSkin=[],lGuts=[];   // the six storeys become one mesh, not three or four each
 for(let s=0;s<NS;s++){const y0=s*SH;const hole=holeFn(d*(s>=4?1:.35),61+s,null,2);
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s);return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},112,6,{uS:28,vS:.6,hole:hole?(u,v)=>hole(u,y0+v*SH+s*40):null}));
  if(d>0)lGuts.push(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,s)*.9;return[r*Math.cos(th),y0+.3+v*(SH-.3),r*Math.sin(th)];},64,2,{}));
  // undulating balcony: floor annulus + fascia band
  const rB=th=>rW(th,s)+2.4+.9*Math.sin(7*th+phase(s)+1.2);
  const bHole=d>0?(u,v)=>fbm(u*9+s,3,61+s)<.22*d:null;
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rW(th,s)-.3,rB(th),v);return[r*Math.cos(th),y0+.3,r*Math.sin(th)];},112,3,{hole:bHole}));
  lSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=rB(th);return[r*Math.cos(th),y0+.3-.5+v*1.6,r*Math.sin(th)];},112,2,{uS:28,hole:bHole}));
  // windows / ground-floor arcade
  const n=s===0?14:21;for(let k=0;k<n;k++){const th=(k+.3)/n*TAU;const u=th/TAU;if(hole&&hole(u,y0+2+s*40))continue;const r=rW(th,s)+.1;
   if(s===0)kput('archOpen',[r*Math.cos(th),4.6,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.7,1],null);
   else kput(d>0?'winBigD':'winBigI',[r*Math.cos(th),y0+2.3,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),1,null);}
  if(s>0)stripRing(0,y0+3.9,0,rW(0,s)*.88,d,28);
  }
 meshMerged(lSkin,skin,G);meshMerged(lGuts,MAT.guts,G);
 apron(G,0,0,32,50,d,1.1);
 // Decay read off the building's own geometry rather than sprayed in rings:
 // moss only where a surface faces the sky, vines and staining only off the
 // outer edge of those surfaces, which is where the balcony ledges are.
 if(d>0){mossOnSurface(lSkin,0,0,0,150,2.0);vinesFromLedge(lSkin,0,0,0,54,16);stainsFromLedge(lSkin,0,0,0,44,13);}
 // roof slab + parapet
 const RY=NS*SH;const roofPts=[];for(let i=0;i<112;i++){const th=i/112*TAU,r=rW(th,NS-1);roofPts.push(new THREE.Vector2(r*Math.cos(th),-r*Math.sin(th)));}
 const roof=new THREE.ShapeGeometry(new THREE.Shape(roofPts));roof.rotateX(-Math.PI/2);mesh(roof,skin,G,0,RY+.3,0);
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=rW(th,NS-1)+.4;return[r*Math.cos(th),RY+.3+v*(1.3+.6*Math.sin(5*th)),r*Math.sin(th)];},112,2,{uS:28}),skin,G);
 if(d>0)mossOnRing(0,RY+.5,0,18,40,2.4);
 // twisted chimney sculptures with helmet caps
 for(let i=0;i<6;i++){const a=i/6*TAU+.4,r=22,cx=r*Math.cos(a),cz=r*Math.sin(a);const fallen=d>0&&(i===2||i===4);
  const ch=lathe({rFn:y=>1.4*(1-.25*y/7)+.6*clamp((y-5)/2,0,1),H:7,flutes:4,amp:.35,sharp:1.5,twist:.5,nu:24,nv:14});
  const m=mesh(ch,skin,G);
  if(!fallen){m.position.set(cx,RY+.3,cz);mesh(lathe({rFn:y=>2.2*Math.sqrt(clamp(1-Math.pow(y/2.4,2),0,1)),H:2.4,nu:16,nv:6}),skin,G,cx,RY+7.2,cz);}
  else{m.position.set(cx*1.1,RY+1.2,cz*1.1);m.rotation.set(0,-a,Math.PI/2*.95);dropFragment(m,RY+.3,.1);}}
 // lattice dome: ribbed outer shell with open panels, blue glass inner (intact)
 const R=17,Hd=22;const dR=y=>R*Math.pow(clamp(1-Math.pow(y/Hd,2),0,1),.62);
 const collapse=d>0?(u,y)=>fbm(u*3+.7,y*.06,77,2)>.62:null;
 const domeHole=(u,y)=>{const panel=Math.cos(u*TAU*24)<.35&&y<Hd*.82&&y>1.5;return panel||(collapse&&collapse(u,y));};
 mesh(lathe({rFn:dR,H:Hd,flutes:24,amp:.07,sharp:2,nu:120,nv:36,hole:domeHole}),skin,G,0,RY+.3,0);
 if(d===0)mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24}),MAT.glass,G,0,RY+.3,0);
 else{mesh(lathe({rFn:y=>dR(y)*.94,H:Hd,nu:64,nv:24,hole:(u,y)=>collapse(u,y)||fbm(u*5,y*.1,78,2)<.55}),MAT.dark,G,0,RY+.3,0);}
 kput('slab',[0,RY+.6,0],null,[R*.95,.4,R*.95],new THREE.Color(0x24262a));
 stripRing(0,RY+2,0,R*.85,d,32);stripRing(0,RY+9,0,dR(9)*.85,d,32);
 // antenna spire (Moebius needle) with rings
 const AH=72;const aR=y=>2.4*Math.pow(clamp(1-y/AH,0,1),.75)+.3;const acut=d>0?AH*.55:null;
 mesh(lathe({rFn:aR,H:AH,cut:acut,jag:acut?2:0,flutes:6,amp:.25,sharp:1.5,nu:24,nv:30,hole:holeFn(d*.6,81,acut,1)}),skin,G,0,RY+Hd-2,0);
 for(let yy=12;yy<AH-8;yy+=12){if(acut&&yy>acut-3)break;kput(d>0?'ringR':'ringW',[0,RY+Hd-2+yy,0],qEuler(Math.PI/2,0,0),[aR(yy)*2.2,aR(yy)*2.2,6],null);}
 if(d===0)kput('finial',[0,RY+Hd-2+AH+2,0],null,[1.8,2.8,1.8],null);
 else{const fm=mesh(lathe({rFn:y=>aR(acut+y),H:AH-acut,flutes:6,amp:.25,sharp:1.5,nu:20,nv:12}),MAT.rust,G,44,1.2,-38);fm.rotation.set(0,.8,Math.PI/2*.9);dropFragment(fm,0,.3);rubbleRing(46,0,-40,2,12,26,1.6);}
 // colonnaded porch → reactor hut
 for(let i=0;i<7;i++)for(let sgn=-1;sgn<=1;sgn+=2){const x=36+i*8.5,z=sgn*5.5;const gone=d>0&&i===3&&sgn>0;
  if(!gone)kput(d>0?'colR':'colW',[x,0,z],null,[.9,6.5,.9],null);else kput('colR',[x+2,.5,z+3],qEuler(Math.PI/2,.4,0),[.9,6.5,.9],null);}
 mesh(gridSurface((u,v)=>[34+u*56,6.6+.7*Math.sin(u*14)+.3*Math.sin(v*6),(v-.5)*14],40,8,{uS:6,vS:2,hole:d>0?(u,v)=>fbm(u*6,v*3,88,2)<.3:null}),skin,G);
 const hut=new THREE.Group();hut.position.set(104,0,0);G.add(hut);
 mesh(lathe({rFn:()=>10,H:5,nu:40,nv:2,hole:holeFn(d*.5,90,null,2)}),skin,hut);
 mesh(lathe({rFn:y=>10*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,flutes:12,amp:.08,nu:48,nv:16,hole:d>0?(u,y)=>fbm(u*3,y*.1,91,2)>.6:null}),skin,hut,0,5,0);
 if(d>0)mesh(lathe({rFn:y=>9.2*Math.pow(clamp(1-Math.pow(y/11,2),0,1),.6),H:11,nu:32,nv:8}),MAT.dark,hut,0,5,0);
 kput('archOpen',[104-10,4.5,0],qFacing([-1,0,0]),[.6,.6,1],null);
 stripRing(104,7,0,7,d,20);
 if(d>0){scatterMoss(0,0,0,34,120,160,2.4);rubbleRing(0,0,0,34,70,50,1.6);trees(0,0,70,150,18);}
 figures(-50,55,5,5);figures(60,22,3,3);KOFF=[0,0,0];
 return G;}

// TARGET: screamers — the village in the ruined Hexahedron.
//
// Setting: northern portion of the central crater, hyperjungle, the great
// volcano far to the SOUTH. This project takes +z as south (Krator canon: x
// east, z south), so the hero cameras sit north of the settlement and look
// back across it toward the mountain.
const TITLE='Hexahedron — village of the Screamers';
const GROUND_C=0;
const DECAYS=[2];                       // there is only the ruin
// Insertion order is build order: the Hexahedron runs first and hands the
// village its surviving dwelling clusters and the shaft bundle's centre.
const ROWS={
 hex :{z:0,s:0,r:1100,t:0},          // t:0 puts the ruin on the origin
 vill:{z:0,s:0,r:800,t:0},
 jung:{z:0,s:0,r:3400,t:0},
};
const RUINS=[[0,0,1100]];               // clears the jungle back round the village
const EXTRA_BUILDERS={hex:buildHexahedron,vill:buildVillage,jung:buildJungle};
// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb7c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
scene.add(new THREE.HemisphereLight(0xbcd0c8,0x3d3a26,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xaecfc4,.34);fill.position.set(800,400,900);scene.add(fill);
// Sky dome, BAKED. The volcano was a 3D shield inside the dome, which at 6 km
// through this fog wants to be almost pure haze anyway -- all cost and no read,
// and it kept fighting the dome for depth. Voth and Mav's Refuge paint theirs
// into an equirectangular canvas instead, so that is what this does.
//
// SphereGeometry puts u at phi = 270 - azimuth, so u = ((270-az)/360) mod 1.
// Azimuth 0 is north (-z), the same convention the gas giant below uses. The
// volcano is due SOUTH, az 180, so it lands at u = 0.25.
const skyTex=canvasTex(4096,2048,(g,w,h)=>{
 const HZ=h*.5,DEG=h/180;
 // --- the column: 1.9 atm, so a milky zenith and a thick haze band ---------
 const grd=g.createLinearGradient(0,0,0,h);
 grd.addColorStop(0.00,'#5d7ba2');grd.addColorStop(0.14,'#6f8aa9');
 grd.addColorStop(0.30,'#8fa4b7');grd.addColorStop(0.42,'#aebdc2');
 grd.addColorStop(0.478,'#ccd6c9');grd.addColorStop(0.497,'#dde3d2');
 grd.addColorStop(0.503,'#c9d3c0');grd.addColorStop(0.60,'#93a48c');
 grd.addColorStop(0.78,'#6d8068');grd.addColorStop(1.00,'#53664f');
 g.fillStyle=grd;g.fillRect(0,0,w,h);
 const wrapE=(x,y,rx,ry,f)=>{g.fillStyle=f;for(let k=-1;k<=1;k++){
  g.beginPath();g.ellipse(x+k*w,y,rx,ry,0,0,TAU);g.fill();}};
 // --- THE SUN, at the azimuth the directional light actually uses ----------
 // sun.position is (-1200,900,-600): azimuth 296.6, altitude 33.9. u follows
 // the dome's own mapping, u = ((270-az)/360) mod 1.
 const SUNU=((270-296.57)/360%1+1)%1, sx=w*SUNU, sy=HZ-33.85*DEG;
 {const gl=g.createRadialGradient(sx,sy,0,sx,sy,460);
  gl.addColorStop(0,'rgba(255,246,226,.95)');gl.addColorStop(.06,'rgba(255,238,200,.55)');
  gl.addColorStop(.22,'rgba(255,228,178,.20)');gl.addColorStop(1,'rgba(255,224,170,0)');
  g.fillStyle=gl;for(let k=-1;k<=1;k++)g.fillRect(sx-460+k*w,sy-460,920,920);
  wrapE(sx,sy,15,15,'rgba(255,252,240,1)');}
 // --- cumulus: flat-based heaps, crowded toward the horizon ----------------
 for(let ci=0;ci<150;ci++){
  const t=Math.pow(rng(),1.7);
  const cy=HZ-(4+t*58)*DEG, cx=rng()*w;
  const sc=.5+2.1*t+rr(0,.6), cw=rr(70,180)*sc, ch2=cw*rr(.15,.30);
  const ca=(.17+.30*rng())*(1-.32*t);
  wrapE(cx,cy+ch2*.12,cw*.92,ch2*.34,'rgba(146,160,166,'+(ca*.55).toFixed(3)+')');
  const nP=7+Math.floor(rng()*7);
  for(let p2=0;p2<nP;p2++){
   const px=cx+rr(-1,1)*cw*.78,k2=1-Math.abs(px-cx)/cw;
   const pr=ch2*(.45+.75*k2)*rr(.75,1.2);
   wrapE(px,cy-pr*.55,pr*1.5,pr,'rgba(250,250,244,'+(ca*rr(.55,1)).toFixed(3)+')');}}
 // --- humid veils -----------------------------------------------------------
 for(let i=0;i<46;i++)
  wrapE(rng()*w,HZ-rr(14,HZ*.72),rr(300,1100),rr(8,26),
   'rgba(240,246,238,'+(.025+.055*rng()).toFixed(3)+')');
 // --- two small moons, well off the giant ----------------------------------
 [[0.38,26,54,'rgba(226,222,214,'],[0.615,17,38,'rgba(214,198,192,']].forEach(M=>{
  const mx=w*M[0],my=HZ-M[1]*DEG;
  wrapE(mx,my,M[2],M[2],M[3]+'.55)');
  wrapE(mx-M[2]*.3,my-M[2]*.3,M[2]*.62,M[2]*.62,M[3]+'.28)');});
 // --- THE VOLCANO, due south -----------------------------------------------
 (function(){const vx=w*.25,base=HZ+9,vh=6.4*DEG,vw=345;
  const far=(t,a)=>'rgba('+Math.round(118+54*t)+','+Math.round(134+56*t)+','+Math.round(136+46*t)+','+a+')';
  const flank=(x0,x1,y1,zo)=>{const P=[];
   for(let i=0;i<=26;i++){const t=i/26;
    P.push([x0+(x1-x0)*t,base+(y1-base)*Math.pow(t,1.75)-(fbm(t*4.1+zo,zo,31,2)-.5)*9*Math.sin(t*Math.PI)]);}
   return P;};
  const apex=base-vh,wr=[vx-34,apex],fl=[vx-6,apex+8],er=[vx+30,apex+5];
  const wf=flank(vx-vw,wr[0],wr[1],.6),ef=flank(vx+vw*1.07,er[0],er[1],2.1).reverse();
  const trace=()=>{g.moveTo(vx-vw,base);wf.forEach(q=>g.lineTo(q[0],q[1]));
   g.lineTo(wr[0],wr[1]);g.lineTo(fl[0],fl[1]);g.lineTo(er[0],er[1]);
   ef.forEach(q=>g.lineTo(q[0],q[1]));g.lineTo(vx+vw*1.07,base);};
  [[-660,2.4,540],[600,2.7,600],[-220,3.1,470]].forEach(q=>{
   g.fillStyle=far(.74,.38);g.beginPath();g.moveTo(vx+q[0]-q[2],base);
   for(let k=0;k<=60;k++){const t=k/60,pr=1-Math.pow(Math.abs(t*2-1),1.6);
    g.lineTo(vx+q[0]-q[2]+2*q[2]*t,base-q[1]*DEG*pr-4*Math.sin(t*19.7)*pr);}
   g.lineTo(vx+q[0]+q[2],base);g.closePath();g.fill();});
  g.fillStyle=far(.44,.74);g.beginPath();trace();g.closePath();g.fill();
  g.save();g.beginPath();trace();g.closePath();g.clip();
  const lf=g.createLinearGradient(vx-24,0,vx+vw,0);
  lf.addColorStop(0,'rgba(230,236,240,0)');lf.addColorStop(.35,'rgba(230,236,240,.22)');
  lf.addColorStop(1,'rgba(230,236,240,.05)');
  g.fillStyle=lf;g.fillRect(vx-24,apex-6,vw+48,vh+20);
  const lg=g.createRadialGradient(fl[0],fl[1],2,fl[0],fl[1],34);
  lg.addColorStop(0,'rgba(255,170,110,.18)');lg.addColorStop(1,'rgba(255,170,110,0)');
  g.fillStyle=lg;g.fillRect(fl[0]-40,fl[1]-40,80,80);g.restore();
  for(let i=0;i<150;i++){const t=i/150;
   wrapE(fl[0]+t*t*330+rr(-22,22)*(.3+t),fl[1]-6-t*104-rr(0,17),
    10+t*54+rr(0,15),10+t*46+rr(0,13),
    'rgba(206,212,208,'+(.028*(1-t*.7)).toFixed(3)+')');}
  const vv=g.createLinearGradient(0,apex-20,0,base);
  vv.addColorStop(0,'rgba(200,214,200,.05)');vv.addColorStop(1,'rgba(200,214,200,.68)');
  g.fillStyle=vv;g.fillRect(vx-vw-1200,apex-20,2*(vw+1200),base-apex+20);})();
 // --- horizon haze and the far canopy --------------------------------------
 const hz=g.createLinearGradient(0,HZ-118,0,HZ+40);
 hz.addColorStop(0,'rgba(196,210,192,0)');hz.addColorStop(.6,'rgba(196,210,192,.44)');
 hz.addColorStop(1,'rgba(196,210,192,.86)');
 g.fillStyle=hz;g.fillRect(0,HZ-118,w,158);
 const canopy=(col,h0,h1,R,off,bump,em)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,HZ+20);
  for(let x=0;x<=w;x+=2){const an=(x%w)/w*TAU,cx2=Math.cos(an)*R,sz2=Math.sin(an)*R;
   const n=fbm(off+cx2,off+sz2,7,3),n2=fbm(off*3+cx2*6,off*3+sz2*6,11,2);
   let hh=h0+(h1-h0)*n+bump*(n2-.5);
   if(em){const e=fbm(off*7+cx2*2.2,off*7+sz2*2.2,13,2);
    hh+=em*Math.max(0,(e-.74)/.26);}                 // emergents over the line
   g.lineTo(x,HZ-hh*DEG);}
  g.lineTo(w,HZ+20);g.closePath();g.fill();};
 canopy('rgba(112,136,122,.95)',1.4,2.8,9,17.3,.4,1.1);
 canopy('rgba(76,102,90,.98)',.9,1.9,14,41.7,.55,.6);
 const gm=g.createLinearGradient(0,HZ-DEG*1.4,0,HZ+24);
 gm.addColorStop(0,'rgba(196,210,192,0)');gm.addColorStop(.3,'rgba(196,210,192,.32)');
 gm.addColorStop(1,'rgba(196,210,192,.95)');
 g.fillStyle=gm;g.fillRect(0,HZ-DEG*1.4,w,DEG*1.4+24);
});
skyTex.wrapS=THREE.RepeatWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,72,44),
 new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));
sky.userData.probeSkip=true;sky.renderOrder=-10;scene.add(sky);
// the gas giant, low in the north-east (Krator canon: altitude 25°, azimuth 66°)
// THE GAS GIANT Krator orbits, ported from Girder's sky as real geometry
// rather than a painted sprite. Canon: 30 degrees across at azimuth 67,
// altitude 25 -- sixty full moons wide.
//
// The band coordinates are computed in the FRAGMENT shader from the world-space
// normal against a world-space spin axis, so the mesh needs no rotation of its
// own and there is no local/world convention to get wrong. The axis lies in the
// PLANE OF THE SKY, tilted 23 degrees from the sky's own up: that is the only
// reading that gives both a tilted planet AND rings seen as a hairline. An axis
// literally 23 degrees off world-up would sit far out of the ring plane and the
// rings would be wide open.
const GIANT_DIST=6000,GIANT_R=GIANT_DIST*Math.tan(15*Math.PI/180);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180)).normalize();
const _gE1=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),giantDir).normalize();
const _gUp=new THREE.Vector3().crossVectors(giantDir,_gE1).normalize();
const GIANT_AXIS=_gUp.clone().multiplyScalar(Math.cos(23*Math.PI/180))
 .addScaledVector(_gE1,Math.sin(23*Math.PI/180)).normalize();
const GIANT_B1=new THREE.Vector3().crossVectors(GIANT_AXIS,giantDir).normalize();
const GIANT_B2=new THREE.Vector3().crossVectors(GIANT_AXIS,GIANT_B1).normalize();
const GU={
 uSunDir:{value:new THREE.Vector3().copy(sun.position).normalize()},
 uAxis:{value:GIANT_AXIS},uE1:{value:GIANT_B1},uE2:{value:GIANT_B2},
 uZone:{value:new THREE.Color(0x3c7e91)},uBelt:{value:new THREE.Color(0xd6c9a8)},
 uStormC:{value:new THREE.Color(0xb98a63)},uRimCol:{value:new THREE.Color(0x9fd4ea)},
 uNightC:{value:new THREE.Color(0x4b6f86)},uHazeC:{value:new THREE.Color(0xb7c4ae)},
 uSpin:{value:0},uRingLat:{value:.08},uHazeK:{value:.34}};
const giantMat=new THREE.ShaderMaterial({fog:false,depthWrite:false,uniforms:GU,
 vertexShader:[
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vN=normalize(mat3(modelMatrix)*normal);',
  ' vV=normalize(cameraPosition-wp.xyz);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:[
  'uniform vec3 uSunDir,uAxis,uE1,uE2,uZone,uBelt,uStormC,uRimCol,uNightC,uHazeC;',
  'uniform float uSpin,uRingLat,uHazeK;',
  'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
  'float oval(float lat,float lon,vec4 s){float dl=lat-s.x;',
  ' float dg=mod(lon-s.y+3.14159265,6.28318531)-3.14159265;',
  ' return (dg*dg)/(s.z*s.z)+(dl*dl)/(s.w*s.w);}',
  'void main(){vec3 N=normalize(vN),V=normalize(vV);',
  ' float sLat=clamp(dot(N,uAxis),-1.0,1.0), lat=asin(sLat);',
  ' float lon=atan(dot(N,uE2),dot(N,uE1))+uSpin;',
  ' float wav=0.42*sin(lon*3.0+lat*6.0)+0.24*sin(lon*7.0-2.1)+0.13*sin(lon*13.0+lat*3.0);',
  ' float b=sin(lat*10.0+wav);',
  ' vec3 col=mix(uZone,uBelt,smoothstep(-0.45,0.45,b));',
  ' col*=0.93+0.12*sin(lat*37.0+1.6*sin(lon*2.0+0.7));',
  ' col=mix(col,uZone*0.70,smoothstep(0.70,1.0,abs(sLat)));',
  ' col=mix(uStormC,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(-0.36,1.10,0.40,0.13))));',
  ' col=mix(uStormC*1.12,col,smoothstep(0.45,1.0,oval(lat,lon,vec4(0.21,4.05,0.26,0.085))));',
  ' col*=1.0-0.34*(1.0-smoothstep(0.0,0.075,abs(lat-uRingLat)));',
  // clamp not max: two unit vectors can dot a hair over 1.0 and pow() of a
  // negative base is undefined in GLSL
  ' float ndv=clamp(dot(N,V),0.0,1.0);',
  ' float limb=pow(max(ndv,0.0015),0.35);',
  ' float ndl=dot(N,uSunDir);',
  ' float day=smoothstep(-0.17,0.17,ndl);',
  ' vec3 outc=col*limb*(0.92*day)+col*limb*uNightC*0.11;',
  ' float fres=pow(max(1.0-ndv,0.0),3.2);',
  ' outc+=uRimCol*fres*0.16*mix(smoothstep(-0.35,0.45,ndl),1.0,0.15);',
  // extinction: the disc is 30 deg wide, so its lower limb sits a good deal
  // deeper in the air than its upper one
  ' float up=max(vSky.y,0.0);',
  // a floor under the extinction: at this distance even the zenith is looking
// through a lot of 1.9-atm air, and without it the night side punched a
// black hole in a daylit sky
' outc=mix(outc,uHazeC,clamp(0.30+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(outc,1.0);}'].join('\n')});
const giant=new THREE.Mesh(new THREE.SphereGeometry(GIANT_R,96,64),giantMat);
giant.renderOrder=-9;giant.userData.probeSkip=true;scene.add(giant);
// the rings, edge-on because the spin axis lies in the plane of the sky
const ringMat=new THREE.ShaderMaterial({fog:false,transparent:true,depthWrite:false,
 side:THREE.DoubleSide,uniforms:{uIn:{value:1.30},uOut:{value:2.12},
  uCol:{value:new THREE.Color(0xbcb09a)},uHazeC:GU.uHazeC,uHazeK:GU.uHazeK},
 vertexShader:['varying vec2 vUvR; varying vec3 vSky;',
  'void main(){vUvR=position.xy;vec4 wp=modelMatrix*vec4(position,1.0);',
  ' vSky=normalize(wp.xyz-cameraPosition);',
  ' gl_Position=projectionMatrix*viewMatrix*wp;}'].join('\n'),
 fragmentShader:['uniform float uIn,uOut,uHazeK;uniform vec3 uCol,uHazeC;',
  'varying vec2 vUvR; varying vec3 vSky;',
  'void main(){float r=length(vUvR);',
  ' float t=(r-uIn)/(uOut-uIn);',
  ' if(t<0.0||t>1.0)discard;',
  ' float a=0.62*(0.45+0.55*sin(t*34.0))*(1.0-smoothstep(0.86,1.0,t));',
  ' a*=smoothstep(0.0,0.06,t);',
  ' a*=1.0-0.55*smoothstep(0.40,0.46,t)*(1.0-smoothstep(0.46,0.52,t));',
  ' vec3 c=uCol*(0.8+0.3*sin(t*21.0));',
  ' float up=max(vSky.y,0.0);',
  ' c=mix(c,uHazeC,clamp(0.26+uHazeK*exp(-up/0.16),0.0,0.86));',
  ' gl_FragColor=vec4(c,a);}'].join('\n')});
const giantRing=new THREE.Mesh(new THREE.RingGeometry(GIANT_R*1.30,GIANT_R*2.12,256,1),ringMat);
giantRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),GIANT_AXIS);
giantRing.renderOrder=-9;giantRing.userData.probeSkip=true;scene.add(giantRing);
tick(function(dt){GU.uSpin.value+=dt*0.006;});

// Ground: hyperjungle floor. The original painter had red Tharnish soil with
// green patches where the ruins stand; here it is the other way round --
// canopy-dark jungle everywhere, opening to trodden red soil where the village
// has cleared it, which is exactly what RUINS already marks out.
(function paintGround(){const c=TEX.ground.image,g=c.getContext('2d'),w=c.width,h=c.height;const id=g.getImageData(0,0,w,h),d=id.data;const S=40000;
 const ruins=RUINS.map(s=>[(s[0]/S+.5)*w,((s[1]-GROUND_C)/S+.5)*h,s[2]*w/S]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),n3=fbm(x/12,y/12,3,1);
  let r=52+(n-.5)*34+(n2-.5)*16,gg=74+(n-.5)*46+(n2-.5)*18,b=40+(n-.5)*22;
  let gr=0;for(const R of ruins){const dx=x-R[0],dy=y-R[1];const dd=Math.sqrt(dx*dx+dy*dy)/R[2];gr=Math.max(gr,clamp(1.25-dd,0,1)*clamp((n3-.22)*2.2,0,1));}
  r=lerp(r,146+n2*34,gr);gg=lerp(gg,88+n2*26,gr);b=lerp(b,62,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);TEX.ground.needsUpdate=true;})();
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),MAT.ground);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// A target may add builders of its own by declaring EXTRA_BUILDERS in its
// 89z-rows.js fragment, so new work can live entirely in its own target and
// its own new src/ fragment without editing this file.
const BUILDERS=Object.assign({},typeof EXTRA_BUILDERS!=='undefined'?EXTRA_BUILDERS:{},{skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,mega:buildMega,fac:buildFactory,port:buildStarport,gov:buildGovernment,lib:buildLibrary,bunk:buildBunker,off:buildOffices,apt:buildApartments,amph:buildAmphitheater,fuel:buildFuelStation,radar:buildRadarTower,dish:buildDish,house:buildHouses,lab:buildLab,house2:buildHouses2,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,arc:buildArc,robo:buildRobotics,campus:buildCampus,skyG:buildSkyG,skyH:buildSkyH,dc:buildDataCenter,police:buildPolice,hosp:buildHospital,hotel:buildHotel,dam:buildDam});
// A target may choose which decay levels it shows by declaring DECAYS in its
// 89z-rows.js. 0 intact, 1 ruined, 2 toppled, 3 repaired. Level 3 is a whole
// showcase of its own, so it gets its own target rather than a third variant
// crowding the row.
const SITEX=(R,d)=>d===0?-R.s:d===1?R.s:d===2?R.t:0;
for(const k in ROWS){const R=ROWS[k];
 for(const d of (typeof DECAYS!=='undefined'?DECAYS:[0,1,2])){if(d===2&&R.t===undefined)continue;
 TSTAT.cur=k+'/'+d;const _r0=REG.length,_x=SITEX(R,d);
 HOLES=(d===3)?.55:1;            // repaired: the fabric is only part-eaten
 let _G=null;
 try{_G=BUILDERS[k](scene,_x,R.z,d);}catch(e){reportErr(k+' d='+d+' '+e.stack);}
 HOLES=1;
 // The repaired dressing runs on the group the builder returned, so it reaches
 // every type without a builder knowing level 3 exists.
 if(d===3&&_G){KOFF=[_x,0,R.z];try{repairPass(_G,d);}catch(e){reportErr(k+' repair '+e.stack);}KOFF=[0,0,0];}
 for(let i=_r0;i<REG.length;i++)REG[i].type=k;           // so --assert can name the owner of an empty volume
 TSTAT.cur=null;}}
window._registered=REG.length;
kbake(scene);

// ---------------------------------------------------------------- probe (window._api)
// Everything verify.py --assert measures from inside the page. Nothing here
// runs at load time except building the index: the expensive sweeps are
// functions, called only when the harness asks for them, so a normal page load
// pays nothing for them.
//
// Add an invariant here every time a bug costs more than one round to find.

// Per-type triangle budgets, from the brief. The number counted is scene
// content (every triangle a builder put in the world, instances expanded), NOT
// renderer.info.render.triangles, which depends on where the camera happens to
// be pointing. The two answer different questions; --assert checks both.
const BUDGET={
 showcase:{tris:6000000,calls:900},
 cls:{small:60000,medium:250000,sky:400000,mega:700000},
 type:{house:'small',house2:'small',fuel:'small',radar:'small',dish:'small',police:'small',
       skyA:'sky',skyB:'sky',skyC:'sky',skyD:'sky',skyE:'sky',skyF:'sky',skyG:'sky',skyH:'sky',
       mega:'mega',arc:'mega',dam:'mega',campus:'mega',spire:'mega',dalab:'mega',canyon:'mega',veladiga:'mega',hex:'mega',jung:'mega',vill:'sky',
       fac:'medium',port:'medium',gov:'medium',lib:'medium',bunk:'medium',off:'medium',
       apt:'medium',amph:'medium',lab:'medium',robo:'medium',dc:'medium',hosp:'medium',hotel:'medium'},
};

// --- sample points, one pass over the scene ---------------------------------
// An instanced item contributes its translation; a mesh contributes its world
// bounding-box centre and corners. Enough to answer "is there anything at all
// inside this registered volume", which is the question that catches a builder
// that registered a cylinder it never filled.
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 const bb=new THREE.Box3();
 scene.traverse(o=>{
  if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;
  bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z])pts.push([x,y,z]);
 });
 return pts;}

// --- invariant 1: every REGISTER volume actually contains something ---------
function regOccupancy(){
 const BK=250,by={};                                  // z-buckets, so this is not 80 x 200k
 REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);
  for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);
 for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;
  for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}

// --- invariant 2: nothing sitting at NaN ------------------------------------
// TSTAT.bad catches instanced items at the moment they are placed. This catches
// the other half: a surface whose fn() returned NaN for some (u,v), which shows
// up as a hole on a real GPU and as nothing at all under SwiftShader.
function nanSweep(){
 const bad=[];
 scene.traverse(o=>{
  if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;
  const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,at:i,n:a.length});break;}
 });
 return {meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}

// --- per-type totals ---------------------------------------------------------
function typeStats(){
 const out={};
 for(const k in TSTAT.by){const t=TSTAT.by[k],base=k.split('/')[0];
  const cls=BUDGET.type[base]||'medium';
  out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}
 return out;}

window._api={
 BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}
  return {tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),
 views:()=>Object.keys(VIEWS),
};
// This file loads AFTER 90-scene.js, so SCREAM is already populated and a
// preset can be aimed at something the builders actually placed rather than at
// a coordinate I guessed. Anything rejection-sampled -- the smithies, the
// ranch, the pen -- is looked up; the fixed geometry is written out.
const _S=(typeof SCREAM!=='undefined'&&SCREAM)?SCREAM:{};
// camera that stands off `d` metres from a point on bearing `b`, at height `h`
const AT=(p,b,d,h,ty)=>[p[0]+Math.cos(b)*d,h,p[2]+Math.sin(b)*d,p[0],ty==null?p[1]+8:ty,p[2]];
const _sm=(_S.smithies&&_S.smithies[0])||[300,12,300];
const _rn=_S.ranch||[-300,12,300,70];
const _pn=_S.pen?[_S.pen.x,_S.pen.y,_S.pen.z]:[-40,12,-330];
const _lb=_S.lobby||[0,12,-240];
const _gt=(_S.gates&&_S.gates[0])||[540,12,310];
const HALL=[-60,644,374], PALACE=[-63,620,626], PLZ=[-60,630,374];
const VIEWS={
 // --- the settlement -------------------------------------------------------
 'Hexahedron':[-300,620,-2600,180,470,240],
 'The village':[-1500,260,-1500,0,90,0],
 'Ground level':[-619,26,-760,0,60,0],
 'Main street':[-260,30,-470,120,40,120],
 'Plan from above':[60,2500,-950,180,480,240],
 // --- the life layer, aimed at what was actually placed --------------------
 'Arrival':AT(_gt,0.7,220,58,_gt[1]+6),
 'The gate':AT(_gt,0.5,95,26,_gt[1]+8),
 "The captives' pen":AT(_pn,-1.9,150,44,_pn[1]+10),
 'The ranch':AT(_rn,2.3,190,52,_rn[1]+8),
 'A smithy':AT(_sm,1.1,115,44,_sm[1]+8),   // 70 m at 22 m put the eye inside the roof
 'The lobby door':AT(_lb,-1.9,150,40,_lb[1]+14),
 'The lift':[260,180,-520,8,260,-262],
 'Harvest':[-480,44,120,-140,24,300],
 // --- the arcology ---------------------------------------------------------
 'The waist':[950,700,-1400,180,620,240],
 'The shear':[-266,470,640,-110,400,215],
 'The plaza':[-880,820,790,PLZ[0],PLZ[1],PLZ[2]],
 'The residence':[-430,690,520,HALL[0],HALL[1],HALL[2]],
 'Inside the residence':[-60,650,404,-60,646,374],
 "The chief's palace":[-440,700,900,PALACE[0],PALACE[1],PALACE[2]],
 // --- the sky and the country ---------------------------------------------
 'Krator rising':[-900,300,900,1900,900,-2100],
 'Volcano':[900,430,-2300,-900,560,2400],
 'The hyperjungle':[-2300,90,-2300,-300,120,-300],
 'From the forest':[1900,50,1500,200,300,300],
};
// ---------------------------------------------------------------- camera control
const ctl={target:new THREE.Vector3(0,100,0),theta:0,phi:1.1,radius:900};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 if(camera.position.y<2)camera.position.y=2;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object!==sky&&h.object!==giant);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point;let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}
 insp.textContent=(best?best.name:'unregistered '+(hits[0].object.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0);}
for(const k in VIEWS){if(false){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);ui.appendChild(b);}}
setView(...VIEWS[Object.keys(VIEWS)[0]]);   // first preset is the opening shot, whatever the target calls it
// 00-head.html is shared, so the target names itself here rather than shipping
// a second copy of the page shell.
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — click to inspect · Mark polygon to measure footprints · drag to orbit · wheel to zoom · right-drag / WASD to move';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),5,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 applyCam();sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);
 giantRing.position.copy(giant.position);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
// ================================================================= AUTHORING TOOLS
// Inspector, polygon tool and path tool, sharing one click handler and one
// panel. Siting anything in a scene this size by reading numbers off a render
// is guesswork, and this session has lost several rounds to cameras and
// structures aimed at coordinates that were arithmetic rather than measured.
// Everything here is measurement.
//
//   Inspect   click anything: which registered volume it belongs to, that
//             volume's centre, radius and height, and the exact hit point.
//   Polygon   click corners; the box prints a closed [[x,y,z],...] ring.
//   Path      the same but an open polyline, with a running length, and New
//             path starts another. For authoring walking routes.
//
// All three wrap inspectAt rather than adding more click handlers, so there is
// still exactly one place that decides what a click means.
(function(){
 const BST='background:rgba(20,16,14,.75);color:#f0e6d8;border:1px solid #8a6a50;'
  +'border-radius:4px;padding:4px 8px;cursor:pointer;font:11px/1.2 inherit';
 const ON=';background:rgba(70,200,230,.30);border-color:#46c8e6';
 // #ui is a flex ROW with wrap, so a child panel sits beside the view selector
 // and lands on top of the caption. The tools get their own fixed corner.
 const box=document.createElement('div');box.id='tools';
 box.style.cssText='position:fixed;left:10px;bottom:10px;width:250px;z-index:6;'
  +'display:flex;flex-wrap:wrap;gap:3px;background:rgba(20,16,14,.62);'
  +'padding:6px;border-radius:5px';
 const mk=(t,w)=>{const b=document.createElement('button');b.textContent=t;
  b.style.cssText=BST+(w?';flex:1 1 100%':'');box.appendChild(b);return b;};
 const bI=mk('Inspect'),bP=mk('Polygon'),bT=mk('Path');
 const bNew=mk('New path'),bU=mk('Undo'),bC=mk('Clear'),bS=mk('Select');
 // Girder has a rings on/off toggle in its sky panel and it is genuinely
 // useful -- the ring plane crosses the disc and you sometimes want it gone.
 const bRg=mk('Rings');
 const out=document.createElement('textarea');out.readOnly=true;
 out.style.cssText='display:none;width:100%;box-sizing:border-box;height:92px;margin-top:4px;'
  +'resize:vertical;font:10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace';
 box.appendChild(out);document.body.appendChild(box);

 let mode='inspect';
 const poly=[],paths=[[]];                    // paths[last] is the live one
 const G=new THREE.Group();G.userData.probeSkip=true;scene.add(G);
 const CM=new THREE.MeshBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});
 const PM=new THREE.MeshBasicMaterial({color:0xffb347,fog:false,depthTest:false});
 const CLN=new THREE.LineBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});
 const PLN=new THREE.LineBasicMaterial({color:0xffb347,fog:false,depthTest:false});

 const fmt=a=>'['+a.map(p=>'['+p.map(v=>v.toFixed(1)).join(',')+']').join(',\n ')+']';
 const draw=()=>{
  while(G.children.length)G.remove(G.children[0]);
  // markers scale with the orbit radius, or they vanish at 1 km and swamp the
  // screen at 20 m
  const sc=Math.max(.6,(typeof ctl!=='undefined'?ctl.radius:600)*.005);
  const dot=(p,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(sc,10,8),m);
   o.position.set(p[0],p[1],p[2]);o.renderOrder=999;o.userData.probeSkip=true;G.add(o);};
  const line=(pts,m,close)=>{if(pts.length<2)return;
   const v=(close?pts.concat([pts[0]]):pts).map(p=>new THREE.Vector3(p[0],p[1],p[2]));
   const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),m);
   l.renderOrder=999;l.userData.probeSkip=true;G.add(l);};
  poly.forEach(p=>dot(p,CM));line(poly,CLN,poly.length>2);
  paths.forEach(P=>{P.forEach(p=>dot(p,PM));line(P,PLN,false);});
  let txt='';
  if(mode==='polygon')txt=poly.length?fmt(poly):'';
  else if(mode==='path')txt=paths.filter(P=>P.length).map((P,i)=>'// path '+i+'\n'+fmt(P)).join('\n');
  out.value=txt;out.style.display=txt?'block':'none';};

 const setMode=m=>{mode=m;
  [[bI,'inspect'],[bP,'polygon'],[bT,'path']].forEach(function(e){
   e[0].style.cssText=BST+(mode===e[1]?ON:'');});
  bNew.style.display=(mode==='path')?'':'none';
  insp.textContent=mode==='inspect'?'inspector: click a structure'
   :(mode==='polygon'?'polygon: click corners':'path: click waypoints');
  draw();};
 bI.onclick=()=>setMode('inspect');bP.onclick=()=>setMode('polygon');bT.onclick=()=>setMode('path');
 bNew.onclick=()=>{if(paths[paths.length-1].length)paths.push([]);draw();};
 bU.onclick=()=>{if(mode==='polygon')poly.pop();
  else if(mode==='path'){const P=paths[paths.length-1];
   if(P.length)P.pop();else if(paths.length>1){paths.pop();paths[paths.length-1].pop();}}
  draw();};
 bC.onclick=()=>{poly.length=0;paths.length=0;paths.push([]);draw();};
 bS.onclick=()=>{out.focus();out.select();};

 const prev=inspectAt;
 inspectAt=function(cx,cy){
  const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);
  ray.setFromCamera(v,camera);
  const hits=ray.intersectObjects(scene.children,true)
   .filter(h=>!h.object.userData.probeSkip&&h.object!==sky&&h.object!==giant);
  if(!hits.length){insp.textContent=mode+': nothing under the cursor';return;}
  const p=hits[0].point,at=[p.x,p.y,p.z];
  if(mode==='polygon'){poly.push(at);draw();
   insp.textContent='polygon: '+poly.length+' point'+(poly.length===1?'':'s')+'\n'
    +at.map(q=>q.toFixed(1)).join(', ');return;}
  if(mode==='path'){const P=paths[paths.length-1];P.push(at);draw();
   let tot=0;for(let i=1;i<P.length;i++)
    tot+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]);
   insp.textContent='path '+(paths.length-1)+': '+P.length+' pt, '+tot.toFixed(0)+' m\n'
    +at.map(q=>q.toFixed(1)).join(', ');return;}
  // --- inspect: report the tightest registered volume containing the hit ----
  let best=null;
  for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}
  const o=hits[0].object;
  insp.textContent=(best?best.name:'unregistered '+(o.isInstancedMesh?'instance':'mesh'))
   +(best?'\nvolume  c '+best.x.toFixed(0)+','+best.y.toFixed(0)+','+best.z.toFixed(0)
     +'  r '+best.r.toFixed(0)+'  h '+best.h.toFixed(0):'')
   +'\nhit     '+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)
   +'\nrange   '+camera.position.distanceTo(p).toFixed(0)+' m';
  while(G.children.length)G.remove(G.children[0]);
  const sc=Math.max(.6,ctl.radius*.005);
  const m=new THREE.Mesh(new THREE.SphereGeometry(sc,10,8),PM);
  m.position.copy(p);m.renderOrder=999;m.userData.probeSkip=true;G.add(m);};

 if(typeof giantRing!=='undefined'&&giantRing){
  const RON=';background:rgba(188,176,154,.30);border-color:#bcb09a';
  const syncR=()=>{bRg.style.cssText=BST+(giantRing.visible?RON:'');};
  bRg.onclick=()=>{giantRing.visible=!giantRing.visible;syncR();
   insp.textContent='rings '+(giantRing.visible?'on':'off');};
  syncR();
 }else bRg.style.display='none';
 setMode('inspect');
 window._poly=poly;window._paths=paths;window._toolBtnStyle=BST;
})();
// ================================================================= LIFE LAYER
// Everything that moves. Four populations, one agent list, two draw calls.
//
//   harvesters  out of the dwellings, the lobby and the upper city's gate to
//               the orchards, pick, and back.
//   patrols     round the wall circuit, gate to gate, turning at the corners.
//   pen guards  standing over the captives' pen, pacing their post.
//   the party   a scripted arrival: warriors bring captives in through a gate
//               to the pen, and a little later an escort takes the captives to
//               the Hexahedron, where they go in and do not come out.
//
// Two rules that keep it honest rather than decorative:
//
//   Same surface only. A route only ever joins two points the builders handed
//   over as a pair, and they only pair points on one surface. An agent walking
//   from the ground to a terrace 600 m up would be flying, and the cheapest
//   guarantee is never to build the pair.
//
//   Two draw calls for the lot. Bodies and heads are one InstancedMesh each,
//   rewritten per frame. The kit's own instancing is baked and immutable by the
//   time this runs, so these are separate meshes.
//
// This fragment loads after 90-scene.js, so SCREAM is already populated.
reseed(9490);
(function(){
 if(typeof SCREAM==='undefined'||!SCREAM)return;
 const A=[];                                   // every agent
 const V3=(p)=>({x:p[0],y:p[1],z:p[2]});
 const add=o=>{o.bob=rng()*TAU;A.push(o);return o;};
 const lerp3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

 // ---- harvesters ------------------------------------------------------------
 const shuttle=(a,b,tint)=>add({kind:'shuttle',a:a,b:b,tint:tint,
  t:rng(),dir:rng()<.5?1:-1,wait:0,
  sp:rr(1.2,2.3)/Math.max(18,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]))});
 (SCREAM.pairs||[]).forEach(P=>shuttle(P[0],P[1],0));
 if(SCREAM.gate&&SCREAM.plazaFruit)
  SCREAM.plazaFruit.forEach((F,i)=>{if(i%2===0)shuttle(SCREAM.gate,F,0);});
 (SCREAM.orchards||[]).forEach((O,i)=>{if(i%3)return;
  const a=rng()*TAU,r=rr(26,60);
  shuttle([O[0],O[1]+.2,O[2]],[O[0]+Math.cos(a)*r,O[1]+.2,O[2]+Math.sin(a)*r],0);});

 // ---- wall patrols ----------------------------------------------------------
 // A closed loop round the corner list, so a patrol walks the whole circuit and
 // comes back rather than pacing one edge.
 const CIRC=SCREAM.circuit||[];
 if(CIRC.length>2){
  let tot=0;const cum=[0];
  for(let i=0;i<CIRC.length;i++){const a=CIRC[i],b=CIRC[(i+1)%CIRC.length];
   tot+=Math.hypot(b[0]-a[0],b[2]-a[2]);cum.push(tot);}
  for(let i=0;i<10;i++)add({kind:'patrol',loop:CIRC,cum:cum,tot:tot,
   u:rng()*tot,sp:rr(6,10),dir:rng()<.5?1:-1,tint:1});}

 // ---- guards on the pen -----------------------------------------------------
 const PEN=SCREAM.pen;
 if(PEN)for(let i=0;i<5;i++){const a=PEN.rot+(i/5-.5)*2.1;
  add({kind:'post',c:[PEN.x+Math.cos(a)*(PEN.r+9),PEN.y+.2,PEN.z+Math.sin(a)*(PEN.r+9)],
   r:rr(5,11),ph:rng()*TAU,sp:rr(.22,.5),tint:1});}

 // ---- the arriving party ----------------------------------------------------
 // Scripted rather than emergent: the whole point is that it is legible from
 // one camera in the first half minute. Phases are in seconds from load.
 const PARTY=[];
 if(PEN&&SCREAM.gates&&SCREAM.gates.length&&SCREAM.lobby){
  const GT=SCREAM.gates[0];
  const OUT=[GT[0]*1.9,GT[1],GT[2]*1.9];                    // off the map
  const PENDOOR=[PEN.x+Math.cos(PEN.rot)*(PEN.r+16),PEN.y+.2,PEN.z+Math.sin(PEN.rot)*(PEN.r+16)];
  const NCAP=1+Math.floor(rng()*3);                         // 1-3 captives
  const mk=(role,off)=>add({kind:'party',role:role,off:off,
   OUT:OUT,GT:GT,PEN:PENDOOR,LOB:SCREAM.lobby,tint:role==='captive'?2:1,p:[0,0,0]});
  for(let i=0;i<4;i++)PARTY.push(mk('warrior',[rr(-7,7),0,rr(-9,9)]));
  for(let i=0;i<NCAP;i++)PARTY.push(mk('captive',[rr(-4,4),0,rr(-5,5)]));
  for(let i=0;i<3;i++)PARTY.push(mk('escort',[rr(-8,8),0,rr(-10,10)]));}

 const N=A.length;if(!N)return;
 // ---- two instanced meshes for the lot --------------------------------------
 const bg=new THREE.BoxGeometry(1.15,3.3,.8);bg.translate(0,1.65,0);
 const bIM=new THREE.InstancedMesh(bg,
  new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,metalness:0,side:DS}),N);
 const hIM=new THREE.InstancedMesh(new THREE.SphereGeometry(.62,8,6),
  new THREE.MeshStandardMaterial({color:0xc9a17e,roughness:.92,metalness:0}),N);
 [bIM,hIM].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
 const col=new THREE.Color();
 A.forEach((ag,i)=>{
  if(ag.tint===2)col.setHSL(.08,.10,.62);             // captives, pale and unpainted
  else if(ag.tint===1)col.setHSL(rr(.98,1.04)%1,.42,.26);   // guards, red-brown
  else col.setHSL(rr(0,.11),rr(.18,.45),rr(.22,.42));       // everyone else
  bIM.setColorAt(i,col);});
 if(bIM.instanceColor)bIM.instanceColor.needsUpdate=true;
 REGISTER({name:'Screamer village — the living ('+N+' on the move)',x:0,z:0,r:1200,h:760});

 // ---- the party's timeline, in seconds --------------------------------------
 const T_IN=14,T_HOLD=18,T_LEAD=22,T_GONE=46,T_LOOP=210;
 const partyPos=(ag,t)=>{
  const u=t%T_LOOP;
  if(ag.role==='escort'){
   // the escort waits at the pen, then walks the captives in
   if(u<T_HOLD)return[ag.PEN,0];
   if(u<T_LEAD)return[ag.PEN,0];
   if(u<T_GONE)return[lerp3(ag.PEN,ag.LOB,(u-T_LEAD)/(T_GONE-T_LEAD)),1];
   return null;}
  if(u<T_IN)return[lerp3(ag.OUT,ag.GT,u/T_IN),1];          // in through the gate
  if(u<T_HOLD)return[lerp3(ag.GT,ag.PEN,(u-T_IN)/(T_HOLD-T_IN)),1];
  if(ag.role==='warrior'){
   if(u<T_GONE)return[lerp3(ag.PEN,ag.GT,(u-T_HOLD)/(T_GONE-T_HOLD)),1];
   return null;}
  // captives: held, then led to the Hexahedron, and they do not come out
  if(u<T_LEAD)return[ag.PEN,0];
  if(u<T_GONE)return[lerp3(ag.PEN,ag.LOB,(u-T_LEAD)/(T_GONE-T_LEAD)),1];
  return null;};

 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P=new THREE.Vector3();
 const S=new THREE.Vector3(1,1,1),S0=new THREE.Vector3(1e-4,1e-4,1e-4),UP=new THREE.Vector3(0,1,0);
 tick((dt,now)=>{
  for(let i=0;i<N;i++){const ag=A[i];
   let x,y,z,hd=ag.hd||0,moving=true,hide=false;
   if(ag.kind==='shuttle'){
    if(ag.wait>0)ag.wait-=dt;
    else{ag.t+=ag.dir*ag.sp*dt;
     if(ag.t>=1){ag.t=1;ag.dir=-1;ag.wait=rr(3,9);}
     else if(ag.t<=0){ag.t=0;ag.dir=1;ag.wait=rr(4,14);}}
    moving=ag.wait<=0;
    x=ag.a[0]+(ag.b[0]-ag.a[0])*ag.t;y=ag.a[1]+(ag.b[1]-ag.a[1])*ag.t;
    z=ag.a[2]+(ag.b[2]-ag.a[2])*ag.t;
    hd=Math.atan2(ag.b[2]-ag.a[2],ag.b[0]-ag.a[0])+(ag.dir<0?Math.PI:0);
   }else if(ag.kind==='patrol'){
    ag.u=(ag.u+ag.dir*ag.sp*dt+ag.tot)%ag.tot;
    let k=0;while(k<ag.cum.length-2&&ag.cum[k+1]<ag.u)k++;
    const a=ag.loop[k],b=ag.loop[(k+1)%ag.loop.length];
    const f=(ag.u-ag.cum[k])/Math.max(1e-6,ag.cum[k+1]-ag.cum[k]);
    x=a[0]+(b[0]-a[0])*f;y=a[1]+(b[1]-a[1])*f;z=a[2]+(b[2]-a[2])*f;
    hd=Math.atan2(b[2]-a[2],b[0]-a[0])+(ag.dir<0?Math.PI:0);
   }else if(ag.kind==='post'){
    const th=ag.ph+now*ag.sp;
    x=ag.c[0]+Math.cos(th)*ag.r;y=ag.c[1];z=ag.c[2]+Math.sin(th)*ag.r;
    hd=th+Math.PI/2;
   }else{                                              // party
    const r=partyPos(ag,now);
    if(!r){hide=true;x=y=z=0;}
    else{const p=r[0];x=p[0]+ag.off[0];y=p[1];z=p[2]+ag.off[2];moving=!!r[1];
     if(ag.lp){const dx=x-ag.lp[0],dz=z-ag.lp[2];
      if(dx*dx+dz*dz>1e-6)hd=Math.atan2(dz,dx);else hd=ag.hd||0;}
     ag.lp=[x,y,z];}}
   ag.hd=hd;
   if(hide){M.compose(P.set(0,-9999,0),Q,S0);bIM.setMatrixAt(i,M);hIM.setMatrixAt(i,M);continue;}
   const bob=moving?Math.abs(Math.sin(now*4.4+ag.bob))*.22:0;
   Q.setFromAxisAngle(UP,-hd+Math.PI/2);
   P.set(x,y+bob,z);M.compose(P,Q,S);bIM.setMatrixAt(i,M);
   P.set(x,y+bob+3.5,z);M.compose(P,Q,S);hIM.setMatrixAt(i,M);}
  bIM.instanceMatrix.needsUpdate=true;hIM.instanceMatrix.needsUpdate=true;});
 // ---- the millipede herd ----------------------------------------------------
 // A moving level of its own. Each animal is a chain of segments that follow
 // the head through a trail buffer, so the body genuinely snakes instead of
 // rotating rigidly: sample the head's own past at increasing lag and the tail
 // traces the path the head took.
 (function(){const RN=SCREAM.ranch;if(!RN)return;
  const NM=8,SEG=13,LAG=5;                       // frames of lag per segment
  const HIST=SEG*LAG+2;
  const herd=[];
  for(let i=0;i<NM;i++){
   const a0=rng()*TAU,r0=rng()*RN[3]*.6;
   herd.push({x:RN[0]+Math.cos(a0)*r0,z:RN[2]+Math.sin(a0)*r0,
    hd:rng()*TAU,sp:rr(2.2,4.6),turn:rr(-.4,.4),tt:0,
    len:rr(13,25),buf:[],bi:0});}
  const bodyG=new THREE.SphereGeometry(1,9,7);
  const legG=new THREE.BoxGeometry(.22,1,.22);legG.translate(0,-.5,0);
  const mBody=new THREE.InstancedMesh(bodyG,
   new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:.04}),NM*SEG);
  const mLeg=new THREE.InstancedMesh(legG,
   new THREE.MeshStandardMaterial({color:0x3a241c,roughness:.95,metalness:0}),NM*SEG*2);
  [mBody,mLeg].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
  {const c=new THREE.Color();
   for(let i=0;i<NM;i++)for(let k=0;k<SEG;k++){
    c.setHex(k%3===0?0xb8683e:0x4a2e22);mBody.setColorAt(i*SEG+k,c);}}
  if(mBody.instanceColor)mBody.instanceColor.needsUpdate=true;
  REGISTER({name:'Screamer village — the millipede herd ('+NM+')',
   x:RN[0],z:RN[2],r:RN[3]+10,h:8});
  const MM=new THREE.Matrix4(),QQ=new THREE.Quaternion(),PP=new THREE.Vector3(),
   SS=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);
  tick(function(dt){
   for(let i=0;i<NM;i++){const H=herd[i];
    H.tt-=dt;if(H.tt<=0){H.turn=rr(-.5,.5);H.tt=rr(1.5,4);}
    H.hd+=H.turn*dt;
    let nx=H.x+Math.cos(H.hd)*H.sp*dt,nz=H.z+Math.sin(H.hd)*H.sp*dt;
    // turn back at the stockade rather than walking through it
    const dx=nx-RN[0],dz=nz-RN[2],m2=Math.hypot(dx,dz);
    if(m2>RN[3]*.78){H.hd=Math.atan2(RN[2]-H.z,RN[0]-H.x)+rr(-.6,.6);
     nx=H.x+Math.cos(H.hd)*H.sp*dt;nz=H.z+Math.sin(H.hd)*H.sp*dt;}
    H.x=nx;H.z=nz;
    H.buf[H.bi]=[H.x,H.z,H.hd];H.bi=(H.bi+1)%HIST;
    for(let k=0;k<SEG;k++){
     const b=H.buf[(H.bi-1-k*LAG+HIST*3)%HIST]||[H.x,H.z,H.hd];
     const t=k/(SEG-1),r=H.len*.085*(1-.45*Math.abs(t*2-1));
     const idx=i*SEG+k;
     QQ.setFromAxisAngle(UPV,-b[2]);
     PP.set(b[0],RN[1]+r*.85,b[1]);SS.set(r*1.2,r,r*1.1);
     MM.compose(PP,QQ,SS);mBody.setMatrixAt(idx,MM);
     for(let sd=0;sd<2;sd++){
      const off=(sd?1:-1)*r*1.15;
      PP.set(b[0]-Math.sin(b[2])*off,RN[1]+r*.75,b[1]+Math.cos(b[2])*off);
      SS.set(r*.9,r*1.5,r*.9);
      QQ.setFromAxisAngle(UPV,-b[2]);
      MM.compose(PP,QQ,SS);mLeg.setMatrixAt(idx*2+sd,MM);}}}
   mBody.instanceMatrix.needsUpdate=true;mLeg.instanceMatrix.needsUpdate=true;});
  window._millipedes=NM;})();

 window._agents=N;window._life={agents:A,bodies:bIM};
})();
// ================================================================= PATH TRACKER
// Shows what the life layer is actually doing. Two overlays, toggled from the
// tools panel:
//
//   routes  the fixed geometry every agent is bound to -- shuttle legs, the
//           wall circuit, guard posts, and the arriving party's whole itinerary
//           -- colour-coded by population.
//   tracks  a rolling trail behind each agent, sampled a few times a second,
//           which is what tells you whether they are going where you think.
//
// One LineSegments for each, rebuilt in place, so the overlay costs two draw
// calls whether there are ten agents or a thousand.
reseed(9495);
(function(){
 const box=document.getElementById('tools');
 if(!box||typeof window._life==='undefined'||!window._life)return;
 const A=window._life.agents,N=A.length;
 const BST=window._toolBtnStyle||'';
 const ON=';background:rgba(255,179,71,.30);border-color:#ffb347';
 const mk=t=>{const b=document.createElement('button');b.textContent=t;b.style.cssText=BST;
  box.insertBefore(b,box.lastChild);return b;};
 const bR=mk('Routes'),bT=mk('Tracks');

 const COL={shuttle:0x7fe0a0,patrol:0xff7f7f,post:0xffb347,party:0xd76f9c};
 const mat=new THREE.LineBasicMaterial({vertexColors:true,fog:false,depthTest:false});
 const routeG=new THREE.BufferGeometry(),trackG=new THREE.BufferGeometry();
 const routes=new THREE.LineSegments(routeG,mat),tracks=new THREE.LineSegments(trackG,mat);
 [routes,tracks].forEach(o=>{o.renderOrder=998;o.userData.probeSkip=true;
  o.visible=false;scene.add(o);});

 // ---- the fixed routes ------------------------------------------------------
 {const P=[],C=[],c=new THREE.Color();
  const seg=(a,b,k)=>{c.setHex(COL[k]);
   P.push(a[0],a[1],a[2],b[0],b[1],b[2]);
   C.push(c.r,c.g,c.b,c.r,c.g,c.b);};
  for(const ag of A){
   if(ag.kind==='shuttle')seg(ag.a,ag.b,'shuttle');
   else if(ag.kind==='post'){
    let pv=null;
    for(let i=0;i<=16;i++){const th=i/16*TAU;
     const p=[ag.c[0]+Math.cos(th)*ag.r,ag.c[1],ag.c[2]+Math.sin(th)*ag.r];
     if(pv)seg(pv,p,'post');pv=p;}}
   else if(ag.kind==='party'){
    if(ag.role==='escort')seg(ag.PEN,ag.LOB,'party');
    else{seg(ag.OUT,ag.GT,'party');seg(ag.GT,ag.PEN,'party');
     if(ag.role==='captive')seg(ag.PEN,ag.LOB,'party');}}}
  // the patrol circuit once, not once per patrol
  const pat=A.find(a=>a.kind==='patrol');
  if(pat)for(let i=0;i<pat.loop.length;i++)
   seg(pat.loop[i],pat.loop[(i+1)%pat.loop.length],'patrol');
  routeG.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  routeG.setAttribute('color',new THREE.Float32BufferAttribute(C,3));}

 // ---- the rolling tracks ----------------------------------------------------
 const T=34,SAMPLE=.18;
 const hist=new Float32Array(N*T*3);let filled=0,head=0,acc=0;
 const tp=new Float32Array(N*(T-1)*2*3),tc=new Float32Array(N*(T-1)*2*3);
 {const c=new THREE.Color();
  for(let i=0;i<N;i++){c.setHex(COL[A[i].kind]||0xffffff);
   for(let j=0;j<(T-1)*2;j++){const o=(i*(T-1)*2+j)*3;
    tc[o]=c.r;tc[o+1]=c.g;tc[o+2]=c.b;}}}
 trackG.setAttribute('position',new THREE.BufferAttribute(tp,3));
 trackG.setAttribute('color',new THREE.BufferAttribute(tc,3));
 trackG.setDrawRange(0,0);

 const M=new THREE.Matrix4(),V=new THREE.Vector3();
 tick(dt=>{
  if(!tracks.visible)return;
  acc+=dt;if(acc<SAMPLE)return;acc=0;
  for(let i=0;i<N;i++){window._life.bodies.getMatrixAt(i,M);
   V.setFromMatrixPosition(M);const o=(i*T+head)*3;
   hist[o]=V.x;hist[o+1]=V.y;hist[o+2]=V.z;}
  head=(head+1)%T;if(filled<T)filled++;
  let n=0;
  for(let i=0;i<N;i++)for(let j=0;j<filled-1;j++){
   const a=(i*T+(head-filled+j+T*2)%T)*3,b=(i*T+(head-filled+j+1+T*2)%T)*3;
   // an agent that was hidden parks at y=-9999; do not draw the jump
   if(hist[a+1]<-5000||hist[b+1]<-5000)continue;
   tp[n*3]=hist[a];tp[n*3+1]=hist[a+1];tp[n*3+2]=hist[a+2];n++;
   tp[n*3]=hist[b];tp[n*3+1]=hist[b+1];tp[n*3+2]=hist[b+2];n++;}
  trackG.setDrawRange(0,n);
  trackG.attributes.position.needsUpdate=true;});

 const sync=()=>{bR.style.cssText=BST+(routes.visible?ON:'');
  bT.style.cssText=BST+(tracks.visible?ON:'');
  insp.textContent='tracker: routes '+(routes.visible?'on':'off')
   +' · tracks '+(tracks.visible?'on':'off')+'\n'
   +N+' agents — green shuttle, red patrol, amber post, pink party';};
 bR.onclick=()=>{routes.visible=!routes.visible;sync();};
 bT.onclick=()=>{tracks.visible=!tracks.visible;if(!tracks.visible){filled=0;head=0;}sync();};
 window._tracker={routes:routes,tracks:tracks};
})();
