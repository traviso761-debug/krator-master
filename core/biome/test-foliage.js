// node core/biome/test-foliage.js: the foliage and bark shader hooks (30-core-foliage.js) on three r128's own Lambert
// templates, and the hex-cell dither (31-core-dither.js), each check with a negative.
// THE DEFAULTS ARE FROZEN: with no new option and no page-wide switch, every hook must write, character for character,
// the shader it wrote before the 2026-10-26 additions (spin, ground tint, gusts, alpha-to-coverage, back-light, the
// per-vertex bark colour, the cross-fade hook). FROZEN holds the SHA-1 of those shaders as core/biome at de751ca46
// wrote them (measured on that file, the same option sets): a change to a default shows here.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const D=__dirname,read=f=>fs.readFileSync(path.join(D,f),'utf8');
const THREE_JS=path.join(D,'..','..','kits','ancients','three.min.js');   /* the pinned r128 (tools/harness.py local_three) */
function load(foliageSrc){const ctx={console,Math,self:{}};ctx.window=ctx;vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(THREE_JS,'utf8'),ctx);const T=ctx.THREE||ctx.self.THREE;ctx.THREE=T;
 vm.runInContext(read('10-core-head.js')+'\nthis.BIO=BIO;',ctx);const B=ctx.BIO;
 B.kitName=null;B.kitKey=k=>B.kitName?B.kitName+'|'+k:k;   /* 20-core-kit's, as it is */
 Object.assign(B.fn,{qEuler:null,qFacing:null,qUp:null});
 B.host={THREE:T,ticks:fn=>{(B.__ticks=B.__ticks||[]).push(fn);},err:m=>{(B.__errs=B.__errs||[]).push(m);},clock:null,wind:null,lod:{}};
 vm.runInContext(foliageSrc,ctx);
 if(fs.existsSync(path.join(D,'31-core-dither.js')))vm.runInContext(read('31-core-dither.js'),ctx);
 B.__ctx=ctx;return B;}
// one compile: the hook run on the Lambert templates as three runs it (this = the material)
function compile(B,m){const L=B.host.THREE.ShaderLib.lambert,sh={uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader};
 if(m.onBeforeCompile)m.onBeforeCompile.call(m,sh);return sh;}
const sha=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
// the option sets the frozen hashes were measured on (every kind of hook, the options the kits pass)
const LEAF=[{},{aN:true},{irid:true},{aN:true,irid:true,swayW:'(position.x)',swayA:.05},{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.35},
 {swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true},{swayW:'(position.y)',swayA:.10,alphaTest:.4}];
function shaders(B){const T=B.host.THREE,tex=new T.Texture();tex.biomeMean=.5;const out={};
 LEAF.forEach((o,i)=>{const s=compile(B,B.leafMat(tex,'k'+i,o));out['leaf'+i]=s.vertexShader+'\n----\n'+s.fragmentShader;});
 const put=(k,m)=>{const s=compile(B,m);out[k]=s.vertexShader+'\n----\n'+s.fragmentShader;};
 put('gloss',B.glossBarkMat(tex,'g',{alt:0x6a8a70,gloss:.06}));put('irid',B.iridBarkMat(tex,'i'));
 put('farIrid',B.farMat({rule:'irid'}));put('farGloss',B.farMat({}));put('hang',B.hangMat(new T.MeshLambertMaterial(),'h',{swayA:.05}));
 put('bark',B.barkMat(tex));put('solid',B.solidMat(tex));return out;}
const FROZEN={"leaf0":"e275a1b4665e71f7","leaf1":"50e604d0f4f291c9","leaf2":"218f06314e33b0cc","leaf3":"33ef6b1c94c8cb6d","leaf4":"358e3cd2814d8e9f","leaf5":"b25908e7d1f4ec1c","leaf6":"80a85d6c88b20c00",
 "gloss":"baf389c4e3fe754a","irid":"58c2ac9315781983","farIrid":"ad1e2676948f9463","farGloss":"100a3205ff858e86","hang":"4c16c90ae4a1b2c4","bark":"7af29f0f88af2368","solid":"7af29f0f88af2368","dither":"e8376d7ac984b5c8"};
let fails=0;const check=(name,ok,detail)=>{console.log((ok?'ok   ':'FAIL ')+name+(detail?'  ('+detail+')':''));if(!ok)fails++;};
if(require.main!==module){module.exports={load,compile,shaders,sha};return;}
const SRC=read('30-core-foliage.js');
// ---------------------------------------------------------------- 1. the defaults are what they were
{const B=load(SRC),S=shaders(B);const K=Object.keys(FROZEN).filter(k=>k!=='dither'),bad=K.filter(k=>sha(S[k])!==FROZEN[k]);
 check('every default hook writes the shader it wrote before (frozen SHA-1, '+K.length+' kinds)',bad.length===0,bad.join(' '));
 const B2=load(SRC),T=B2.host.THREE,s=compile(B2,B2.leafMat(new T.Texture(),'k0',{spin:true}));
 check('  negative: an option on changes the shader',sha(s.vertexShader+'\n----\n'+s.fragmentShader)!==FROZEN.leaf0);
 check('no hook leaves a target it replaces (project_vertex in a leaf)',!/#include <project_vertex>/.test(S.leaf0.split('----')[0]));}
// ---------------------------------------------------------------- 2. the spin
{const B=load(SRC),T=B.host.THREE,m=B.leafMat(null,'spin',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true,spin:true}),s=compile(B,m);
 check('spin: the vertices and normals turn by uSpin (BIO.SPIN)',/transformed\.xz = vec2\(transformed\.x\*_spc/.test(s.vertexShader)&&/objectNormal\.xz = vec2/.test(s.vertexShader)&&s.uniforms.uSpin===B.SPIN);
 const own={value:2},s2=compile(B,B.leafMat(null,'spin2',{spin:own}));check('spin: a uniform of the host\'s own is taken as given',s2.uniforms.uSpin===own);
 const s3=compile(B,B.leafMat(null,'nospin',{}));check('  negative: no spin, no turn and no uSpin',!/_spc/.test(s3.vertexShader)&&!s3.uniforms.uSpin);}
// ---------------------------------------------------------------- 3. the ground at the root
{const B=load(SRC),T=B.host.THREE;
 const tex=B.groundTex((x,z)=>x<0?[1,0,0]:0x00ff00,[-10,-10,10,10],4),d=tex.image.data;
 check('groundTex: the function is baked cell by cell, x along u and z along v',d[0]===255&&d[1]===0&&d[3*4+1]===255&&d[3*4]===0&&tex.image.width===4,
  'first '+[d[0],d[1],d[2]]+' last of row '+[d[12],d[13],d[14]]);
 check('  negative: setGround refuses a box of no size',B.setGround(tex,[0,0,0,5])===false&&B.GROUND.tex.value===null);
 const m=B.leafMat(new T.Texture(),'grass',{swayW:'(position.y)',swayA:.1,ground:{k:.8,gain:.3,fade:[450,650]}});
 const s0=compile(B,m);check('  negative: with no ground set, a ground card mixes nothing in and does not fade (k 0, no band)',s0.uniforms.uGK.value.x===0&&s0.uniforms.uGK.value.w===0);
 check('setGround takes a texture and a box',B.setGround(tex,[-10,-10,10,10])===true);
 const s=compile(B,m),k=s.uniforms.uGK.value;
 check('ground: the root reads the ground texture, the fragment takes it toward the root and dissolves past the band',
  /texture2D\(uGTex/.test(s.vertexShader)&&/vFlGT\.rgb/.test(s.fragmentShader)&&/diffuseColor\.a \*= 1\.0 - vFlGF/.test(s.fragmentShader)&&k.x===.8&&k.y===.3&&k.z===450&&k.w===650,
  [k.x,k.y,k.z,k.w].join(','));
 check('ground: sRGB decoded unless linear',/pow\(_gc, vec3\(2\.2\)\)/.test(s.vertexShader));
 B.setGround(tex,[-10,-10,10,10],{linear:true});check('  negative: a linear ground is not decoded',!/pow\(_gc/.test(compile(B,m).vertexShader));
 const sn=compile(B,B.leafMat(new T.Texture(),'plain',{}));check('  negative: a card without the option reads no ground',!/uGTex/.test(sn.vertexShader));}
// ---------------------------------------------------------------- 4. one wind field (core/atmos's gusts)
{const B=load(SRC),T=B.host.THREE;
 check('  negative: bindAtmosWind without core/atmos returns false and binds nothing',B.bindAtmosWind()===false&&B.GUST===null);
 const ctx=B.__ctx;vm.runInContext('var ATMOS={};',ctx);const A=ctx.ATMOS;
 Object.assign(A,{U:{wind:{value:new T.Vector2(.8,.35)},gustAmp:{value:.55}},PRESETS:{wind:{base:[.8,.35]}},clock:{t:7},
  GLSL_WIND:'float atmGust(float t,vec2 xz,vec2 w){return 0.0;}\nvec2 atmWind(float t,vec2 xz,vec2 w,float amp){return w;}'});
 check('bindAtmosWind with core/atmos binds its uniforms (not copies) and the clock',B.bindAtmosWind({gain:.8})===true&&B.GUST.w===A.U.wind&&B.GUST.amp===A.U.gustAmp&&B.GUST.k.value===.8);
 const w=B.host.wind();check('the host wind is atmos\'s base wind over its calm length (1 = calm)',Math.abs(w[0]-.8/Math.hypot(.8,.35))<1e-9&&Math.abs(Math.hypot(w[0],w[1])-1)<1e-9);
 B.__ticks.forEach(f=>f(1/60));check('the tick takes atmos\'s clock for the gusts',B.GUST.t.value===7);
 const s=compile(B,B.leafMat(new T.Texture(),'g',{}));
 check('a leaf compiled after the bind takes atmGust at its root and swells the sway and lean by it',/float atmGust/.test(s.vertexShader)&&/atmGust\(uGustT, _gi\.xz, uAtmW\)/.test(s.vertexShader)&&s.uniforms.uAtmW===A.U.wind);
 check('the program key says so (no program shared with an unbound page)',B.leafMat(null,'x',{}).customProgramCacheKey().endsWith('|gust'));}
// ---------------------------------------------------------------- 5. alpha-to-coverage
{const B=load(SRC),T=B.host.THREE,tex=new T.Texture();
 const a=B.leafMat(tex,'a',{alphaTest:.42}),z=B.leafMat(null,'z',{alphaTest:0}),n=B.leafMat(tex,'n',{alphaTest:0});
 const R=s=>({capabilities:{isWebGL2:true},getContext:()=>({SAMPLES:32937,getParameter:p=>p===32937?s:0})});
 check('  negative: no renderer, or one without MSAA, turns nothing on',B.setA2C(null)===false&&B.setA2C(R(0))===false&&!a.alphaToCoverage&&a.alphaTest===.42);
 check('setA2C on an MSAA WebGL2 renderer: coverage on, a 0.02 test kept, the cut-off in the shader',B.setA2C(R(4))===true&&a.alphaToCoverage&&a.alphaTest===.02&&a.userData.a2cCut===.42);
 const s=compile(B,a);check('the fragment sharpens alpha about the old cut-off by fwidth',/fwidth\(diffuseColor\.a\)/.test(s.fragmentShader)&&s.uniforms.uA2Cut.value===.42);
 check('  negative: an untextured or untested card is left alone',!z.alphaToCoverage&&!n.alphaToCoverage&&z.alphaTest===0);
 const late=B.leafMat(tex,'late',{});check('a card made after the switch takes it too',late.alphaToCoverage&&late.userData.a2cCut===.42);
 const WebGL1={capabilities:{isWebGL2:false},getContext:()=>({SAMPLES:1,getParameter:()=>4})};
 check('setA2C(r,false) restores the alpha test; a WebGL1 context never turns it on',B.setA2C(R(4),false)===false&&!a.alphaToCoverage&&a.alphaTest===.42&&B.setA2C(WebGL1)===false);}
// ---------------------------------------------------------------- 6. the back-light
{const B=load(SRC),T=B.host.THREE,s=compile(B,B.leafMat(new T.Texture(),'b',{backlit:.5}));
 check('backlit: the sun seen through a leaf adds light from both faces, fading by 450 m',/outgoingLight \+= uBacklit/.test(s.fragmentShader)&&s.uniforms.uBacklit.value===.5);
 check('  negative: backlit 0 adds nothing',!/uBacklit/.test(compile(B,B.leafMat(new T.Texture(),'b0',{backlit:0})).fragmentShader));}
// ---------------------------------------------------------------- 7. the per-vertex second bark colour
{const B=load(SRC),T=B.host.THREE,tex=new T.Texture();
 const off=compile(B,B.glossBarkMat(tex,'g',{alt:0x6a8a70,gloss:.06,c2:true}));
 check('  negative: o.c2 without buckets that carry aC2 changes nothing',sha(off.vertexShader+'\n----\n'+off.fragmentShader)===FROZEN.gloss);
 B.C2_BUCKETS=true;const m=B.glossBarkMat(tex,'g',{alt:0x6a8a70,gloss:.06,c2:true}),s=compile(B,m);
 check('o.c2 with aC2 buckets: the second colour is the vertex\'s own, the bucket\'s alt where it is 0',/attribute vec3 aC2/.test(s.vertexShader)&&/dot\(vBC2,vec3\(1\.0\)\)>0\.00001\?vBC2:uAlt/.test(s.fragmentShader)&&m.userData.bio.opts.c2==='aC2'&&m.customProgramCacheKey().indexOf('|c2')>0);}
// ---------------------------------------------------------------- 8. the cross-fade hook
{const B=load(SRC),T=B.host.THREE,tex=new T.Texture();
 B.FADE={uniforms:{uFadeX:{value:1}},vertexPars:'uniform float uFadeX;',vertex:'/*FADEV*/',fragmentPars:'/*FADEPF*/',fragment:'/*FADEF*/'};
 const all=shaders(B),miss=Object.keys(all).filter(k=>!(all[k].indexOf('/*FADEV*/')>0&&all[k].indexOf('/*FADEF*/')>0&&all[k].indexOf('/*FADEPF*/')>0));
 check('BIO.FADE goes into every leaf, bark, gloss, irid, far, hang and solid material',miss.length===0,miss.join(' '));
 const v=all.leaf0.split('----')[0];check('the vertex code sits before fog_vertex, the fragment code at the top of main()',v.indexOf('/*FADEV*/')<v.indexOf('#include <fog_vertex>')&&all.leaf0.indexOf('/*FADEF*/')>all.leaf0.indexOf('#include <clipping_planes_fragment>'));
 check('and the program keys say so',B.leafMat(tex,'q',{}).customProgramCacheKey().endsWith('|fade')&&B.barkMat(tex).customProgramCacheKey()==='biobark|fade');
 const B0=load(SRC);check('  negative: BIO.FADE null leaves the plain bark unhooked',B0.barkMat(tex).onBeforeCompile===B0.host.THREE.Material.prototype.onBeforeCompile);
 const B1=load(SRC);let kinds=[];B1.FADE=(sh,kind)=>kinds.push(kind);shaders(B1);check('a function BIO.FADE is called with each kind',['leaf','gloss','irid','far','hang','bark','solid'].every(k=>kinds.indexOf(k)>=0),kinds.join(','));}
// ---------------------------------------------------------------- 9. the hex-cell dither
{const B=load(SRC);
 check('BIO.DITHER is Korona\'s and Farside\'s text (frozen SHA-1)',sha(B.DITHER)===FROZEN.dither,sha(B.DITHER));
 check('  negative: one character off is caught',sha(B.DITHER.replace('0.57735027','0.57735028'))!==FROZEN.dither);
 check('the dither defines kdither, kditherW, kmacro and hashes with fract, never a sine hash',/vec4 kdither\(/.test(B.DITHER)&&/vec4 kditherW\(/.test(B.DITHER)&&/vec3 kmacro\(/.test(B.DITHER)&&!/sin\(dot/.test(B.DITHER));
 // the JS twin of the hex cell (the Godot port's check): three corners, weights cubed and normalised
 let ok=true,worst=0;for(let i=0;i<500;i++){const x=(i*7.31)%37-18,y=(i*3.17)%29-14,c=B.ditherCell(x,y,1.9);const s=c.w[0]+c.w[1]+c.w[2];worst=Math.max(worst,Math.abs(s-1));if(c.v.length!==3||c.w.some(w=>w<0))ok=false;}
 check('ditherCell: three corners, weights >= 0 summing to 1',ok&&worst<1e-12,'worst '+worst);
 const c0=B.ditherCell(0,0,1.9);check('ditherCell: on a lattice point one corner takes it all',Math.max(...c0.w)>.999999);
 const a=B.ditherCell(.3,.2,1.9),b=B.ditherCell(.3+1.9,.2,1.9);check('  negative: a point one cell over is in a different cell',a.v[0][0]!==b.v[0][0]||a.v[0][1]!==b.v[0][1]);}
// ---------------------------------------------------------------- 10. the season (H7): leaf drop and the dry colour
{const B=load(SRC),T=B.host.THREE,tex=new T.Texture();
 const pick=s=>s.vertexShader+'\n----\n'+s.fragmentShader;
 check('  negative: season false or null writes the default shader',sha(pick(compile(B,B.leafMat(tex,'k0',{season:false}))))===FROZEN.leaf0&&sha(pick(compile(B,B.leafMat(tex,'k0',{season:null}))))===FROZEN.leaf0);
 const s=compile(B,B.leafMat(tex,'dry',{vertexColors:true,ground:true,season:{drop:.8,colour:0xc8a860,k:.9}}));
 const u=s.uniforms.uSnK.value;
 check('season: the page-wide uniform is BIO.SEASON itself, the options a vec4 (drop, k, stagger)',s.uniforms.uSeasonDry===B.SEASON&&u.x===.8&&Math.abs(u.y-.9)<1e-12&&u.z===.5&&!!s.uniforms.uSnC);
 check('season: the instance hash at the root, the unswayed card position, no sine',/vSnH = bioSnHash\(instanceMatrix\[3\]\.xyz\)/.test(s.vertexShader)&&/vSnP = position;/.test(s.vertexShader)&&!/sin\(/.test(B.GLSL_SEASON_HASH));
 const F=s.fragmentShader,iG=F.indexOf('vFlGT.rgb'),iS=F.indexOf('_snH = vSnH'),iA=F.indexOf('#include <alphatest_fragment>');
 check('season: the colour gives way to the dry colour, the cards are discarded, after the ground tint and before the alpha test',/_snC \/ max\(vColor/.test(F)&&/discard;/.test(F)&&iG>0&&iS>iG&&iA>iS,[iG,iS,iA].join(' '));
 const c=compile(B,B.leafMat(tex,'col',{season:{colour:0xc8a860}})),d=compile(B,B.leafMat(tex,'drop',{season:{drop:.5}}));
 check('season: colour alone discards nothing; drop alone binds no colour',!/discard;/.test(c.fragmentShader)&&/_snC/.test(c.fragmentShader)&&!/_snC/.test(d.fragmentShader)&&!d.uniforms.uSnC&&/discard;/.test(d.fragmentShader));
 check('  negative: a leaf without the option reads no season',!/uSeasonDry/.test(pick(compile(B,B.leafMat(tex,'plain',{})))));
 // the shader's own formulas, run in the GLSL interpreter: the share of cards gone and the colour's share
 const {glslProgram}=require(path.join(D,'..','water','glsl-interp.js'));
 const fE=(F.match(/float _snF = ([^;]+);/)||[])[1],dE=(F.match(/float _snD = ([^;]+);/)||[])[1];
 const P=glslProgram(B.GLSL_SEASON_HASH+'\nfloat gone(float uSeasonDry,vec4 uSnK,float _snH){return '+fE+';}\nfloat dryk(float uSeasonDry,vec4 uSnK,float _snH){return '+dE+';}',{});
 const K=[.8,.9,.5,0],hs=[0,.01,.2,.5,.77,.999];
 check('season 0: no card gone and the colour untouched, at every hash',hs.every(h=>P.call('gone',0,K,h)===0&&P.call('dryk',0,K,h)===0));
 const g1=hs.map(h=>P.call('gone',1,[1,1,.5,0],h));
 check('full dry with drop 1: every instance gone; drop .8: the low hashes gone, the highest kept',g1.every(v=>v===1)&&P.call('gone',1,K,.05)===1&&P.call('gone',1,K,.999)===0,g1.join(','));
 check('half dry: lower hashes drop first (staggered, monotone)',hs.map(h=>P.call('gone',.5,K,h)).every((v,i,a)=>i===0||v<=a[i-1]));
 const hv=[];for(let i=0;i<200;i++)hv.push(P.call('bioSnHash',[i*1.7,3.1,-i*.9]));
 check('the hash is in 0..1 and spread (mean near .5)',hv.every(v=>v>=0&&v<1)&&Math.abs(hv.reduce((a,b)=>a+b,0)/hv.length-.5)<.08);
 check('setSeason clamps a number and reads a record\'s dry',B.setSeason(1.7)===1&&B.setSeason(-2)===0&&B.setSeason({dry:.25})===.25&&B.SEASON.value===.25);
 check('  negative: bindSeason without core/clock binds nothing',B.bindSeason({day:0,hour:0})===false);
 vm.runInContext(fs.readFileSync(path.join(D,'..','clock','20-core-clock.js'),'utf8'),B.__ctx);
 const C=B.__ctx.KCLOCK.make({hour:12,day:350-259+182});B.__ticks=[];
 check('bindSeason drives BIO.SEASON from the clock (southern midwinter: full dry)',B.bindSeason(C)===true&&Math.abs(B.SEASON.value-1)<1e-9);
 C.day=91;C.hour=0;B.__ticks.forEach(f=>f(1/60));check('...and follows it each frame (midsummer: no dry)',Math.abs(B.SEASON.value)<1e-9,B.SEASON.value);}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
