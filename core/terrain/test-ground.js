// node core/terrain/test-ground.js — the ground shader's contract (43-core-ground.js, KGROUND): its JS twins and the hook's
// shader edits, each check with a broken input that must fail. (The GLSL itself compiles on the GPU in each pilot's verify.)
const fs=require('fs'),path=require('path');
global.window=global;
const proto={customProgramCacheKey:function(){return 'default';}};global.THREE={Material:{prototype:proto}};
eval(fs.readFileSync(path.join(__dirname,'43-core-ground.js'),'utf8'));
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

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
