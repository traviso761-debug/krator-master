// ---------------------------------------------------------------- textures
// All procedural, all generated once at load, all in world-ish units: a texture
// tile is about 8 m across, because `lathe` sets uS = rFn(0)*TAU/8 and vS = cut/8.
// At 512 px that is 64 px per metre, which is what the panel and board sizes
// below are picked against — change the tile size and they stop meaning anything.
//
// Painting waits until something first reads the texture's `.image`, which three.js does when it uploads the
// texture for a draw: a page pays only for the textures it shows. Painting every texture up front was ~11 s of
// each Ancients page's load, before its first frame. Pass eager=true when fn draws from rng(): deferring it would
// shift every later draw in the seeded stream (Screamers' flBarkTex). The pixels are the same either way.
function canvasTex(w,h,fn,rep,eager){const c=document.createElement('canvas');c.width=w;c.height=h;
 let paint=()=>{paint=null;fn(c.getContext('2d'),w,h);};if(eager)paint();
 const t=new THREE.CanvasTexture(c);
 if(paint)Object.defineProperty(t,'image',{configurable:true,enumerable:true,
  get(){if(paint)paint();return c;},
  set(v){paint=null;Object.defineProperty(t,'image',{value:v,writable:true,configurable:true,enumerable:true});}});
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;if(rep)t.repeat.set(rep,rep);return t;}
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
