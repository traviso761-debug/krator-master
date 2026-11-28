// node core/atmos/test-volclouds.js: the volumetric clouds' contract (W6), what needs no GPU. tools/ktest.js: every negative fails
// on a fault and passes on the fix. The GPU half (the look, the GPU ms, the compile time) is core/atmos/wxdemo/verify.py.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const T=require('../../tools/ktest.js')(__filename);
const ROOT=path.join(__dirname,'..','..');
global.window=global;
const rd=f=>fs.readFileSync(f,'utf8');
eval([path.join(ROOT,'core','rand','08-core-rand.js'),path.join(ROOT,'core','shader','06-core-khook.js'),path.join(ROOT,'core','shader','06b-core-kcolor.js'),
 path.join(__dirname,'89-atmos-0-core.js'),path.join(__dirname,'89-atmos-0p-presets.js'),path.join(__dirname,'sky','89-atmos-e-skymodel.js'),
 path.join(__dirname,'sky','89-atmos-f-skypresets.js'),path.join(__dirname,'sky','89-atmos-g-sky.js')].map(rd).join('\n')+';global.ATMOS=ATMOS;global.KRAND=KRAND;');
const A=ATMOS;
const skyBefore=A.skyGLSL(),shadeBefore=A.cloudShadeGLSL();
eval(rd(path.join(__dirname,'sky','89-atmos-m-volclouds.js')));
const sha=b=>crypto.createHash('sha256').update(Buffer.from(b.buffer||b)).digest('hex').slice(0,16);

// ---- the sky's chunk: unchanged on a page without the volumes; with them, the flat cumulus's switch and the shadows' height
T.ok('without the volumes file the sky and the shade chunks have no uVolOn or uVolMidH',skyBefore.indexOf('uVolOn')<0&&shadeBefore.indexOf('uVolMidH')<0);
T.ok('with it, the sky steps its flat cumulus aside on uVolOn and the shade meets the field at uVolMidH',
 A.skyGLSL().indexOf('&&uVolOn<0.5')>0&&A.cloudShadeGLSL().indexOf('(uCloudH.x+uVolMidH-P.y)')>0);

// ---- the detail volume: deterministic, every byte from KRAND, full range, and it tiles
const n=32,D1=A.skyDetailVolume(n),D2=A.skyDetailVolume(n);
T.ok('the detail volume is the same twice ('+sha(D1)+')',sha(D1)===sha(D2)&&D1.length===n*n*n*4);
{let mn=255,mx=0;for(let i=0;i<D1.length;i+=4){mn=Math.min(mn,D1[i]);mx=Math.max(mx,D1[i]);}T.ok('the Worley spans most of its range (R '+mn+'..'+mx+')',mn<40&&mx>215);}
// tiling: the step across the wrap (x n-1 to 0) is no bigger than the steps inside
const at=(D,x,y,z,c)=>D[(((z%n)*n+(y%n))*n+(x%n))*4+c];
const seam=D=>{let inside=0,wrap=0;for(let c=0;c<3;c++)for(let z=0;z<n;z++)for(let y=0;y<n;y++){wrap=Math.max(wrap,Math.abs(at(D,n-1,y,z,c)-at(D,0,y,z,c)));for(let x=1;x<n-2;x++)inside=Math.max(inside,Math.abs(at(D,x,y,z,c)-at(D,x+1,y,z,c)));}return wrap<=inside;};
{const broken=Uint8Array.from(D1);for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let c=0;c<3;c++)broken[((z*n+y)*n+0)*4+c]=255-at(D1,n-1,y,z,c);
 T.neg('the detail volume tiles: no seam across the wrap',seam,broken,D1);}

// ---- the passes' shaders: the march and the mask read no texture() inside their loops (Direct3D unrolls a loop with derivatives:
// the first cut took minutes to compile); the march reads the volumes and the mask; the composite writes the clouds' depth
const loopsClean=src=>{const body=src.slice(src.indexOf('void main'));const fns=src.slice(0,src.indexOf('void main'));
 return !/\btexture\(/.test(body)&&!/\w+ atmV\w+\([^)]*\)\{[^}]*\btexture\(/.test(fns);};
T.neg('the march reads every texture with textureLod or texelFetch',loopsClean,A.volGLSL.march().replace('textureLod(uMask,uv,0.0)','texture(uMask,uv)'),A.volGLSL.march());
T.ok('the march marches the noise volume, the detail volume and the mask',/uNoise/.test(A.volGLSL.march())&&/uDetail/.test(A.volGLSL.march())&&/uMask/.test(A.volGLSL.march()));
T.ok('the mask reads the sky\'s own field at the shadows\' three octaves',/atmCloudField\(xz,3\)/.test(A.volGLSL.mask()));
T.ok('the composite writes the clouds\' depth (gl_FragDepth), the log depth buffer too',/gl_FragDepth=uLogFC>0\.0\?log2/.test(A.volGLSL.composite()));
T.ok('the resolve clamps the history to the new neighbourhood',/clamp\(atmVHist\(puv,zh\),mn,mx\)/.test(A.volGLSL.resolve()));
// the packing: depth in steps of 8 m in the integer part, the opacity in the fraction, read back within a step and 1/1000
{const pack=(z,a)=>Math.floor(z/8)+Math.min(a,.999),unz=v=>Math.floor(v)*8,una=v=>v-Math.floor(v);
 const f32=x=>Math.fround(x);let worst=0;for(const z of[0,37,999,12345,59999])for(const a of[.01,.5,.999]){const v=f32(pack(z,a));worst=Math.max(worst,Math.abs(una(v)-Math.min(a,.999)));if(Math.abs(unz(v)-z)>8)worst=9;}
 T.ok('a texel packs the depth and the opacity in one float32 (opacity within 0.01 at 60 km)',worst<.01,worst);}
T.ok('the tiers are off, layers and volumes',A.volTiers.join()==='off,layers,volumes');
T.done();
