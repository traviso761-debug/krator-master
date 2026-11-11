// node core/terrain/test-ground.js — the ground shader's contract (43-core-ground.js, KGROUND): its JS twins and the hook's
// shader edits, each check with a broken input that must fail. (The GLSL itself compiles on the GPU in each pilot's verify.)
const fs=require('fs'),path=require('path');
global.window=global;
const proto={customProgramCacheKey:function(){return 'default';}};global.THREE={Material:{prototype:proto}};
eval(fs.readFileSync(path.join(__dirname,'..','shader','06-core-khook.js'),'utf8'));eval(fs.readFileSync(path.join(__dirname,'43-core-ground.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const G=KGROUND,F=G.fn;

// ---- the hex grid: weights on a triangle, summing to one; its three vertices a triangle round the point
let wBad=0,inBad=0;for(let q=0;q<4000;q++){const x=(q*.6180339)%7-3,y=(q*.4142135)%5-2,t=F.tri(x,y),s=t.w[0]+t.w[1]+t.w[2];
  if(Math.abs(s-1)>1e-9||t.w.some(w=>w<-1e-9||w>1+1e-9))wBad++;
  const k=new Set(t.v.map(v=>v.join(',')));if(k.size!==3)inBad++;}
ok('hex weights are barycentric (4000 points: '+wBad+' off) on three distinct vertices ('+inBad+' not)',wBad===0&&inBad===0,false);
{const a=F.tri(.3,.2),b=F.tri(.3+1e-7,.2);ok('the weights are continuous across the plane',Math.max(...a.w.map((w,i)=>Math.abs(w-b.w[i])))<1e-5,false);}
{const hs=new Set();for(let i=-20;i<20;i++)for(let j=-20;j<20;j++){const h=F.hash(i,j);hs.add(h[0].toFixed(4)+','+h[1].toFixed(4));}
  ok('the cell hash spreads ('+hs.size+' distinct of 1600) and is the same each time',hs.size>1500&&F.hash(3,-7).join()===F.hash(3,-7).join(),false);}
ok('the GLSL holds no sine hash (fract(sin(...)*43758))',!/fract\(\s*sin/.test(G.glsl())&&!/43758/.test(G.glsl()),/fract\(\s*sin/.test('fract(sin(x)*43758.5)')===false);

// ---- the height lerp: the endpoints, a plain mix at contrast 0, the higher layer winning a near tie
ok('the height lerp keeps its endpoints (0 at t 0, 1 at t 1)',F.heightLerp(0,.5,.9,.2)===0&&Math.abs(F.heightLerp(1,.5,.9,.2)-1)<1e-9,false);
ok('at contrast 0 it is the plain mix the pages had',F.heightLerp(.37,.2,.9,0)===.37,F.heightLerp(.37,.2,.9,.2)===.37);
ok('a tall pebble wins a near tie, a low one loses it',F.heightLerp(.5,.5,.9,.1)>.9&&F.heightLerp(.5,.5,.1,.1)<.1,F.heightLerp(.5,.5,.5,.1)!==.5);
ok('it rises with t at any heights',(()=>{for(const h of [[.2,.8],[.8,.2],[.5,.5]]){let p=-1;for(let t=0;t<=1.0001;t+=.05){const v=F.heightLerp(t,h[0],h[1],.15);if(v<p-1e-9)return false;p=v;}}return true;})(),false);

// ---- the distance scale: level 0 to d0, one per doubling past it, capped
ok('the distance scale: 0 inside 60 m, 1 at 120, 2 at 240, capped at the levels',F.lod(30,60,3)===0&&Math.abs(F.lod(120,60,3)-1)<1e-12&&Math.abs(F.lod(240,60,3)-2)<1e-12&&F.lod(1e5,60,3)===3,F.lod(120,60,3)===0);

// ---- the hook: wraps the page's hook, puts the layers at the marker, skips missing layers, keys the program
const fake=()=>({vertexShader:'#include <common>\nvoid main() {\n#include <project_vertex>\n}',fragmentShader:'#include <common>\nvoid main() {\n#include <map_fragment>\n/*KGROUND*/\n#include <aomap_fragment>\n}',uniforms:{}});
let prevRan=false;const mat={userData:{},customProgramCacheKey:proto.customProgramCacheKey,onBeforeCompile:function(sh){prevRan=true;sh.uniforms.uPage={value:1};}};
const L1={map:{id:1},k:1/3,w:'vGL.x',amt:.7,gain:1.25,tint:'diffuse',name:'mulch'},L2={map:{id:2},k:1/3.2,w:'vGL.y',amt:.75,name:'meadow'};
G.hook(mat,{layers:[L1,null,L2,{map:null,w:'1.0'}]});const sh=fake();mat.onBeforeCompile(sh);
ok('the page\'s hook runs first and its uniforms stay',prevRan&&sh.uniforms.uPage&&sh.uniforms.uKG0&&sh.uniforms.uKG1&&!sh.uniforms.uKG2,false);
ok('the layers go in at the marker, in order, with their weights',sh.fragmentShader.indexOf('/*KGROUND*/')<0&&sh.fragmentShader.indexOf('vGL.x')<sh.fragmentShader.indexOf('vGL.y')&&sh.fragmentShader.indexOf('vGL.y')<sh.fragmentShader.indexOf('#include <aomap_fragment>'),false);
ok('missing layers are skipped (two drawn: '+mat.userData.kground.join(', ')+')',mat.userData.kground.join()==='mulch,meadow',false);
ok('the world position is the vertex\'s, instanced or not',/kgWP=\(modelMatrix\*kgW4\)\.xyz/.test(sh.vertexShader)&&/USE_INSTANCING/.test(sh.vertexShader),false);
ok('the program key keeps the default\'s source and adds the layers',/kground--2-/.test(mat.customProgramCacheKey()),false);
{const m2={userData:{},customProgramCacheKey:proto.customProgramCacheKey,onBeforeCompile:null};G.hook(m2,{layers:[L1]});const s2=fake();s2.fragmentShader=s2.fragmentShader.replace('/*KGROUND*/\n','');m2.onBeforeCompile(s2);
  ok('without a marker the layers follow #include <map_fragment>',s2.fragmentShader.indexOf('#include <map_fragment>\n{vec3 kgDx')>=0,false);}
{const m3={userData:{},customProgramCacheKey:proto.customProgramCacheKey,onBeforeCompile:null};G.hook(m3,{layers:[null]});
  ok('with no layer (no pack) the material is untouched',m3.onBeforeCompile===null&&m3.customProgramCacheKey===proto.customProgramCacheKey,false);}
{const a=G.code({},[L1]),b=G.code({blend:0,far:false},[L1]),c=G.glsl({hex:false});
  ok('blend 0 and far false give the plain mix at one scale',/kgHL\([^;]*,0\.0000\)/.test(b)&&/float kgLv=0\.0;/.test(b)&&!/kgLv=0\.0;/.test(a),false);
  ok('hex false samples once',!/kgTri\(st,w/.test(c.split('vec4 kgHex')[1])&&/kgTri\(st,w/.test(G.glsl().split('vec4 kgHex')[1]),false);}
ok('KGROUND.layer is null without the library',G.layer('nhighlands','ground.mulch')===null,false);

// ---- the defaults are frozen: with no kind asked, the library, the layer code and the hooked shaders are byte for byte
// what they were before the kinds (2026-10-26, the hashes of 43-core-ground.js at 71bed9f4d)
const crypto=require('crypto'),sha=x=>crypto.createHash('sha1').update(x).digest('hex').slice(0,16);
const FROZEN={glsl:'c8172f17c7a34804',glslNoHex:'a9e67aa4ceb6fedc',code:'cc45db7207dae11f',codePlain:'05e620a5ea7bd641',fs:'099817c7e920ca2b',vs:'5fecc5c7883e02f0',key:'|kground-k-2-789'};
const freeze=(layers)=>{const F1={map:{id:1},k:1/3,w:'vGL.x',amt:.7,gain:1.25,tint:'diffuse',name:'mulch'},F2={map:{id:2},k:1/3.2,w:'vGL.y',amt:.75,name:'meadow',h:{from:'a'},lin:false};
  const LL=layers||[F1,F2],m={userData:{},customProgramCacheKey:proto.customProgramCacheKey,onBeforeCompile:null};G.hook(m,{layers:LL,key:'k'});const s=fake();m.onBeforeCompile(s);
  return {glsl:sha(G.glsl()),glslNoHex:sha(G.glsl({hex:false})),code:sha(G.code({},LL)),codePlain:sha(G.code({blend:0,far:false},[LL[0]])),fs:sha(s.fragmentShader),vs:sha(s.vertexShader),key:m.customProgramCacheKey()};};
{const now=freeze(),diff=Object.keys(FROZEN).filter(k=>now[k]!==FROZEN[k]);
  const kinded=freeze([{map:{id:1},k:1/3,w:'vGL.x',amt:.7,gain:1.25,tint:'diffuse',name:'mulch'},{kind:'sand',w:'vGL.y',name:'sand'}]);
  ok('with no kind asked every output is the frozen one ('+(diff.join(', ')||'all 7 equal')+')',diff.length===0,kinded.fs===FROZEN.fs||kinded.code===FROZEN.code);}

// ---- the kinds' twins
{const hs=new Set();let out=0;for(let i=-15;i<15;i++)for(let j=-15;j<15;j++){const h=F.hash3(i,j,3);if(h.some(v=>v<0||v>=1))out++;hs.add(h.map(v=>v.toFixed(4)).join());}
  ok('hash3 is in [0,1) and spreads ('+hs.size+' distinct of 900) and repeats',out===0&&hs.size>880&&F.hash3(4,-2,7).join()===F.hash3(4,-2,7).join(),F.hash3(4,-2,7).join()===F.hash3(4,-2,8).join());}
ok('the kinds\' GLSL holds no sine hash',!/sin\(/.test(G.kindsGlsl())&&!/43758/.test(G.kindsGlsl()),false);
// F1 against a brute force over 5x5(x5) cells (the shader searches 3x3(x3)); the edge distance 0 where the two nearest tie
const brute2=(x,y,jit,sd)=>{let b=9;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const cx=Math.floor(x)+i,cy=Math.floor(y)+j,h=F.hash3(cx,cy,sd),dx=cx+.5+jit*(h[0]-.5)-x,dy=cy+.5+jit*(h[1]-.5)-y;b=Math.min(b,Math.hypot(dx,dy));}return b;};
const brute3=(x,y,z,jit,sd)=>{let b=9;for(let k=-2;k<=2;k++)for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const cx=Math.floor(x)+i,cy=Math.floor(y)+j,cz=Math.floor(z)+k,h=F.hash3(cx+sd,cy+sd*1.7,cz+sd*2.3);
  b=Math.min(b,Math.hypot(cx+.5+jit*(h[0]-.5)-x,cy+.5+jit*(h[1]-.5)-y,cz+.5+jit*(h[2]-.5)-z));}return b;};
{let b2=0,b3=0,neg=0,eNeg=0,idBad=0;for(let q=0;q<1500;q++){const x=(q*.7548777)%41-20,y=(q*.5698403)%37-18,z=(q*.3247)%13-6;
  const v=F.vor2(x,y,.9,5),w=F.vor3(x,y,z,.9,5);if(Math.abs(v.f1-brute2(x,y,.9,5))>1e-9)b2++;if(Math.abs(w.f1-brute3(x,y,z,.9,5))>1e-9)b3++;
  if(v.e<-1e-9||w.e<-1e-9)eNeg++;const h=F.hash3(v.id[0],v.id[1],5);if(Math.abs(v.id[0]+.5+.9*(h[0]-.5)-(x+v.rel[0]))>1e-9)idBad++;
  if(Math.abs(F.vor2(x,y,.9,6).f1-brute2(x,y,.9,5))>1e-9)neg++;}
  ok('Voronoi: the nearest point is the brute force\'s (2D '+b2+' off, 3D '+b3+' off of 1500), the edge distance >= 0 ('+eNeg+'), the cell and offset name the point ('+idBad+')',
    b2===0&&b3===0&&eNeg===0&&idBad===0,neg<100);}
{let worst=0;for(let q=0;q<4000;q++){const x=(q*.61803)%23,y=(q*.41421)%19,v=F.vor2(x,y,.9,2);if(v.e<.002){
    const d=[];for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const cx=Math.floor(x)+i,cy=Math.floor(y)+j,h=F.hash3(cx,cy,2);d.push(Math.hypot(cx+.5+.9*(h[0]-.5)-x,cy+.5+.9*(h[1]-.5)-y));}
    d.sort((a,b)=>a-b);worst=Math.max(worst,d[1]-d[0]);}}
  ok('on an edge (e under .002) the two nearest points are near equidistant (worst gap '+worst.toFixed(4)+')',worst<.005,false);}
ok('the ripple: 0 in the trough, 1 at the crest, one wavelength a period, the lee steeper than the stoss',
  F.ripple(0,.8)===0&&Math.abs(F.ripple(.8,.8)-1)<1e-12&&Math.abs(F.ripple(3.37,.8)-F.ripple(.37,.8))<1e-9&&(1-F.ripple(.9,.8))>(1-F.ripple(.7,.8)),
  Math.abs((1-F.ripple(.6,.5))-(1-F.ripple(.4,.5)))>1e-9);
{let lo=1,hi=0,jump=0;for(let q=0;q<3000;q++){const x=q*.0137,y=Math.sin(q)*3,v=F.vnoise(x,y,4);lo=Math.min(lo,v);hi=Math.max(hi,v);jump=Math.max(jump,Math.abs(F.vnoise(x+1e-6,y,4)-v));}
  ok('the value noise is in [0,1] ('+lo.toFixed(3)+'..'+hi.toFixed(3)+') and continuous',lo>=0&&hi<=1&&jump<1e-4&&hi-lo>.5,false);}

// ---- the kinds in the shader
const kmat=()=>({userData:{},customProgramCacheKey:proto.customProgramCacheKey,onBeforeCompile:null});
{const KC={kind:'clast',w:'vCrest',name:'breccia',seed:12},KS={kind:'sand',map:{id:7},k:1/2,w:'vSand',name:'black sand',seed:3},KP={kind:'polygon',w:'vPoly',name:'wedges',edgeTint:'vec3(1.3)'};
  const m=kmat();G.hook(m,{layers:[L1,KC,KS,KP],key:'kinds'});const s=fake();m.onBeforeCompile(s);const fsk=s.fragmentShader;
  ok('a procedural kind is drawn without a map; only maps get samplers (uKG0 and uKG2 of four layers)',m.userData.kground.join()==='mulch,breccia,black sand,wedges'&&
    /uniform sampler2D uKG0;uniform sampler2D uKG2;\n/.test(fsk)&&!/uKG1;|uKG3;/.test(fsk)&&s.uniforms.uKG0&&s.uniforms.uKG2&&!s.uniforms.uKG1&&!s.uniforms.uKG3,false);
  ok('the kinds\' library comes once, after the common one, and only with a kind',fsk.split('vec2 kgVor3(').length===2&&fsk.indexOf('float kgLum')<fsk.indexOf('vec3 kgHash3')&&
    m.userData.kgroundKinds.join()===',clast,sand,polygon',(()=>{const m2=kmat();G.hook(m2,{layers:[L1]});const s2=fake();m2.onBeforeCompile(s2);return /kgHash3/.test(s2.fragmentShader)||!!m2.userData.kgroundKinds;})());
  ok('each kind is drawn only where its weight is above 0, in the page\'s order',/kgA0=clamp\(vCrest[^;]*;if\(kgA0>0\.0\)/.test(fsk)&&fsk.indexOf('vCrest')<fsk.indexOf('vSand')&&fsk.indexOf('vSand')<fsk.indexOf('vPoly'),false);
  const br=t=>{let d=0;for(const c of t){if(c==='{'||c==='(')d++;if(c==='}'||c===')')d--;if(d<0)return false;}return d===0;};
  const variants=[KC,{...KC,proj:'xz'},{...KC,map:{id:1},proj:'xz'},{...KC,map:{id:1}},{...KC,map:{id:1},palette:G.BRECCIA},{...KC,sub:0,fleck:0},{...KC,colorFn:'myStrata'},
    KS,{...KS,map:null},{...KS,ripple:0,glint:0},{...KS,h:{from:'a'}},KP,{...KP,map:{id:3}},{...KP,rim:.05}];
  const bad2=variants.filter(v=>!br(G.code({},[v])));
  ok('every variant\'s code closes its brackets ('+variants.length+' variants, '+bad2.length+' not)',bad2.length===0&&br(G.kindsGlsl()),br(G.code({},[KC]).slice(0,-1)));}
{const c=G.code({},[{kind:'clast',w:'1.0'}]),x=G.code({},[{kind:'clast',w:'1.0',proj:'xz'}]),m=G.code({},[{kind:'clast',w:'1.0',map:{id:1}}]);
  ok('clast: 3D cells by default, plane cells with proj xz; the map read on three planes in 3D, one on the plane',/kgVor3\(kgWP\*kgS,/.test(c)&&!/kgVor2/.test(c)&&/kgVor2\(kgWP\.xz\*kgS,/.test(x)&&!/kgVor3/.test(x)&&
    (m.match(/KG_GRAD\(uKG0/g)||[]).length===3&&(G.code({},[{kind:'clast',w:'1.0',map:{id:1},proj:'xz'}]).match(/KG_GRAD\(uKG0/g)||[]).length===1,/KG_GRAD/.test(c));
  ok('clast: the breccia palette without a map (its eight colours, linear), a page\'s colorFn when given',(c.match(/kgQ\.x<0\.\d+\?vec3/g)||[]).length===7&&c.indexOf('vec3('+[0x4a,0x4a,0x4c].map(v=>Math.pow(v/255,2.2).toFixed(4)).join()+')')>=0&&
    /myStrata\(kgWP\+kgR\*12\.0000,kgQ\.x\)/.test(G.code({},[{kind:'clast',w:'1.0',colorFn:'myStrata'}])),/kgQ\.x<0/.test(m));
  const c0=G.code({},[{kind:'clast',w:'1.0',sub:0,fleck:0}]);
  ok('clast: sub 0 and fleck 0 leave out the second generation and the flecks',!/kgS2/.test(c0)&&!/kgFc/.test(c0)&&/kgS2/.test(c)&&/kgFc/.test(c),/kgS2/.test(c0));}
{const s1=G.code({},[{kind:'sand',w:'1.0'}]),s0=G.code({},[{kind:'sand',w:'1.0',ripple:0,glint:0}]),su=G.code({},[{kind:'sand',w:'1.0',sun:'uSunDir',wind:[0,2]}]);
  ok('sand: ripples and glints by default, neither at 0; the page\'s sun and wind (normalised) taken',/kgRipple\(kgU/.test(s1)&&/reflect\(/.test(s1)&&!/kgRipple|reflect/.test(s0)&&/normalize\(uSunDir\)/.test(su)&&/kgRd=vec2\(0\.0000,1\.0000\)/.test(su),/reflect/.test(s0));
  ok('sand: the ripples and glints fade where a pixel covers more than they show (.15-.5 wavelength, .5-1.5 grain)',/smoothstep\(0\.0180,0\.0600,kgFp\)/.test(s1)&&/smoothstep\(0\.0150,0\.0450,kgFp\)/.test(s1),false);}
{const p=G.code({},[{kind:'polygon',w:'1.0',size:20,width:.05}]),pm=G.code({},[{kind:'polygon',w:'1.0',map:{id:1}}]);
  ok('polygon: plane cells of its size (the lookup warped), troughs about its width, tinted ground or the map in them',/kgPw=kgWP\.xz\*0\.0500;kgPw\+=0\.1200\*/.test(p)&&/kgWv=0\.0500\*/.test(p)&&/smoothstep\(kgWv-kgFp/.test(p)&&/diffuseColor\.rgb\*\(vec3\(0\.6\)\)/.test(p)&&/kgSample\(uKG0/.test(pm),/kgSample/.test(p));}
{let threw='';try{G.code({},[{kind:'dunes',w:'1.0'}]);}catch(e){threw=e.message;}
  ok('an unknown kind is an error that names it ('+threw+')',/dunes/.test(threw),false);}
ok('a seed is taken below 997 (12 and 1009 the same cells)',G.code({},[{kind:'polygon',w:'1.0',seed:12}])===G.code({},[{kind:'polygon',w:'1.0',seed:1009}])&&G.code({},[{kind:'polygon',w:'1.0',seed:12}])!==G.code({},[{kind:'polygon',w:'1.0',seed:13}]),false);

// ---- the Godot twin's golden (godot/shaders/lib/kground_kinds.gdshaderinc, checked by
// godot/tests/shaders/kground_kinds_gpu_check.gd): `node core/terrain/test-ground.js --golden` rewrites it. Each row is a
// Godot expression and the JS twin's value; the Voronoi points are kept off their edges (e > .05), so fp32 picks the same cell
{const G2=[],fx=v=>(+v).toFixed(4),n=(x)=>{const s=fx(x);return s.indexOf('.')<0?s+'.0':s;};
  [[3,-7,12.5],[431,-12,5.3]].forEach(p=>{const h=F.hash3(...p);[0,1,2].forEach(c=>G2.push(['kg_hash3(vec3('+p.map(n)+')).'+'xyz'[c],h[c]]));});
  [[12.37,-4.81,5],[-120.7,33.6,17],[3.6,7.5,2]].forEach(p=>{const v=F.vor2(p[0],p[1],.9,p[2]);if(v.e<.05)throw new Error('golden vor2 point on an edge: '+p);
    G2.push(['v2f('+n(p[0])+','+n(p[1])+','+n(p[2])+')',v.f1],['v2e('+n(p[0])+','+n(p[1])+','+n(p[2])+')',v.e]);});
  [[1.3,2.7,-.4,12],[55.1,-3.3,8.8,3],[-6.2,0.4,2.9,7]].forEach(p=>{const v=F.vor3(p[0],p[1],p[2],.9,p[3]);if(v.e<.05)throw new Error('golden vor3 point on an edge: '+p);
    G2.push(['v3f(vec3('+p.slice(0,3).map(n)+'),'+n(p[3])+')',v.f1],['v3e(vec3('+p.slice(0,3).map(n)+'),'+n(p[3])+')',v.e]);});
  [[3.21,-7.7,4],[100.3,20.9,2]].forEach(p=>G2.push(['kg_vn(vec2('+n(p[0])+','+n(p[1])+'),'+n(p[2])+')',F.vnoise(...p)]));
  [[3.37,.8],[.95,.8],[-1.2,.7]].forEach(p=>G2.push(['kg_ripple('+n(p[0])+','+n(p[1])+')',F.ripple(...p)]));
  const gp=path.join(__dirname,'..','..','godot','tests','shaders','kground_kinds_golden.json'),txt=JSON.stringify({made:'node core/terrain/test-ground.js --golden',rows:G2},null,1)+'\n';
  if(process.argv.includes('--golden'))fs.writeFileSync(gp,txt);
  ok('the Godot twin\'s golden is current ('+G2.length+' values; --golden rewrites it)',fs.existsSync(gp)&&fs.readFileSync(gp,'utf8')===txt,false);}

// ---- relief and triplanar (opt-in, 2026-11-03, GROUND.md): absent, nothing changes (FROZEN above); asked, the right edits land
{const stdFake=()=>{const s=fake();s.vertexShader=s.vertexShader.replace('void main() {','void main() {\n#include <beginnormal_vertex>');
    s.fragmentShader=s.fragmentShader.replace('#include <aomap_fragment>','#include <normal_fragment_begin>\n#include <normal_fragment_maps>\n#include <aomap_fragment>');return s;};
  const run=(o,sf)=>{const m=kmat();G.hook(m,Object.assign({layers:[L1]},o));const s=(sf||fake)();m.onBeforeCompile(s);return {m,s,key:m.customProgramCacheKey()};};
  const off=run({}),onS=run({relief:true},stdFake),onL=run({relief:true}),tr=run({tri:true});
  ok('relief on a Standard material bumps the lit normal and occludes the summed light',/normal=kgBump\(/.test(onS.s.fragmentShader)&&/reflectedLight\.indirectDiffuse\*=kgOcc/.test(onS.s.fragmentShader),
    /kgBump|kgOcc/.test(off.s.fragmentShader));
  ok('relief on a Lambert material (no normal_fragment_maps) scales the sun by the bumped facing instead',!/normal=kgBump/.test(onL.s.fragmentShader)&&/directionalLights\[0\]\.direction/.test(onL.s.fragmentShader),
    /directionalLights/.test(onS.s.fragmentShader));
  ok('relief and tri change the program key; without them it is the old key',onS.key!==off.key&&tr.key!==off.key&&/-r10$/.test(onS.key)&&/-r01$/.test(tr.key),/-r/.test(off.key));
  ok('tri samples the side planes where the ground is steep, from a world normal varying',/kgTS\(uKG0/.test(tr.s.fragmentShader)&&/kgWN=normalize/.test(tr.s.vertexShader)&&/varying vec3 kgWN/.test(tr.s.fragmentShader),
    /kgTS|kgWN/.test(off.s.fragmentShader+off.s.vertexShader));
  const ms=run({relief:{mesh:.8}});
  ok('relief.mesh reads the cavity attribute aKGAO through a varying',/attribute float aKGAO/.test(ms.s.vertexShader)&&/vKGAO=aKGAO/.test(ms.s.vertexShader)&&/vKGAO,0\.0,1\.0/.test(ms.s.fragmentShader),
    /aKGAO/.test(onL.s.vertexShader));
  const st=run({relief:{strata:.3}}),stk=run({relief:{strata:.3}},()=>{const s=fake();s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uKSBed;');return s;});
  ok('the bed relief is drawn only on the core strata path (uKSBed); elsewhere it is left out, so the shader still links',
    /ksRelief\(vSWP/.test(stk.s.fragmentShader)&&/float ksRelief/.test(stk.s.fragmentShader)&&!/ksRelief|kgSF/.test(st.s.fragmentShader),/ksRelief/.test(onL.s.fragmentShader));
  ok('the switch ?kgrelief=1 does nothing without the query (node has no location)',!off.m.userData.kgroundRelief,!onS.m.userData.kgroundRelief);}
// ---- the mesh's cavities: a hollow reads deeper than a crest, a plane reads 0, the result is deterministic
{const N=41,pos=new Float32Array(N*N*3),nrm=new Float32Array(N*N*3),idx=[];const h=(x,z)=>-6*Math.exp(-((x-10)*(x-10)+(z-20)*(z-20))/40)+6*Math.exp(-((x-30)*(x-30)+(z-20)*(z-20))/40);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i;pos[k*3]=i;pos[k*3+1]=h(i,j);pos[k*3+2]=j;nrm[k*3+1]=1;}
  for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){const a=j*N+i,b=a+N;idx.push(a,b,a+1,b,b+1,a+1);}
  const c=G.cavity({pos,index:new Uint32Array(idx),normal:nrm,count:N*N}),at=(i,j)=>c[j*N+i];
  ok('a hollow reads as a cavity ('+at(10,20).toFixed(2)+'), a crest as open ('+at(30,20).toFixed(2)+')',at(10,20)>.3&&at(30,20)<.02,at(30,20)>at(10,20));
  const flat=new Float32Array(pos);for(let k=0;k<N*N;k++)flat[k*3+1]=0;const cf=G.cavity({pos:flat,index:new Uint32Array(idx),normal:nrm,count:N*N});
  ok('a plane reads 0 everywhere (interior)',Math.max(...Array.from(cf).filter((v,k)=>{const i=k%N,j=(k/N)|0;return i>20&&i<N-20&&j>20&&j<N-20;}))<1e-9,false);
  const c2=G.cavity({pos,index:new Uint32Array(idx),normal:nrm,count:N*N});ok('the cavity bake is deterministic',c2.every((v,k)=>v===c[k]),false);
  ok('the cavity stays in 0..1',c.every(v=>v>=0&&v<=1),[-.1,1.2].every(v=>v>=0&&v<=1));}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
