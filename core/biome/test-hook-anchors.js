// node core/biome/test-hook-anchors.js: every core/biome material kind under every scene-wide layer, on three r128's real shader
// templates. A foliage hook replaces chunks by a silent String.replace; a KHOOK layer that runs after it THROWS when its anchor
// has gone, and that throw is inside the render loop. The gloss bark took <map_fragment> from atmos' cloudshade and every page
// with that bark failed (HANDOFF-REBUILD.md, core-crashes, 2026-11-02). Each kind below compiles under each layer (and all of
// them at once) on Lambert and on Standard, the layer's code still lands, the #includes still resolve. Each check has a negative.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
const fs=require('fs'),path=require('path'),vm=require('vm');
const F=require('./test-foliage.js'),R=require('../shader/r128.js');
const D=__dirname,KH=global.KHOOK;
let fails=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)fails++;console.log((r?'ok   ':'FAIL ')+n+(neg?'  (its negative passed)':''));};
const read=f=>fs.readFileSync(path.join(D,f),'utf8');
// the atmos layers on the real library, in the context the foliage runs in
const B=F.load(read('30-core-foliage.js')),ctx=B.__ctx,T=B.host.THREE;
ctx.KHOOK=KH;ctx.KCOLOR=global.KCOLOR;ctx.document={getElementById:()=>({})};
const ATM=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','sky/89-atmos-j-fog.js','host/89-atmos-c-hostbind.js','host/89-atmos-e-weatherhost.js','host/89-atmos-h-skyhost.js',
 'host/89-atmos-j-heightfog.js','fx/89-atmos-fx-raincover.js','fx/89-atmos-fx-snowcover.js','fx/89-atmos-fx-acid.js'];
vm.runInContext(fs.readFileSync(path.join(D,'..','rand','08-core-rand.js'),'utf8'),ctx);
vm.runInContext(ATM.map(f=>fs.readFileSync(path.join(D,'..','atmos',f),'utf8')).join('\n')+';this.ATMOS=ATMOS;',ctx);
const A=ctx.ATMOS,scene={add(){},fog:{color:new T.Color(.5,.5,.5),density:.0002}},camera={position:new T.Vector3(0,10,0),fov:50};
A.init({THREE:T,scene,camera,hour:()=>12,onFrame:()=>{},ground:()=>0,seed:3});
const U=()=>({value:0});A.skyUniforms={uNoise:U(),uCloud:U(),uCloudH:U(),uWind:U(),uTime:U(),uWet:U(),uSunDir:{value:new T.Vector3(0,1,0)},uSunC:{value:new T.Color(1,1,1)},uSunI:{value:1},uZen:{value:new T.Color(.3,.4,.6)}};A.cloudShadeGLSL=()=>'uniform float uWet;\nfloat atmCloudShade(vec3 p,vec3 l){return 1.0;}';
A.heightFog({});
const tex=new T.Texture();tex.biomeMean=.5;
const KINDS={leaf:()=>B.leafMat(tex,'l',{}),leafAN:()=>B.leafMat(tex,'n',{aN:true,irid:true}),leafWave:()=>B.leafMat(tex,'w',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 bark:()=>B.barkMat(tex),solid:()=>B.solidMat(tex),irid:()=>B.iridBarkMat(tex,'i'),gloss:()=>B.glossBarkMat(tex,'g',{alt:0x6a8a70,gloss:.06}),glossC2:()=>B.glossBarkMat(tex,'c',{gloss:.06,c2:true}),
 farIrid:()=>B.farMat({rule:'irid'}),farGloss:()=>B.farMat({}),hang:()=>B.hangMat(new T.MeshLambertMaterial(),'h',{swayA:.05})};
const LAYERS={cloudShade:{add:m=>A.cloudShade(m,{porosity:.4}),mark:/atmWetHere/},snow:{add:m=>A.snowOn(m,{}),mark:/atmSnowAlbedo\(/},acid:{add:m=>A.acidOn(m,{kind:'stone'}),mark:/atmAcidAlbedo\(/},fog:{add:m=>A.heightFogOn(m),mark:/atmFog\(/}};
const compile=m=>{const L=T.ShaderLib[{MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard'}[m.type]],sh={uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader};m.onBeforeCompile.call(m,sh,R.RENDERER);return sh;};
const resolves=sh=>{const res=s=>s.replace(/^[ \t]*#include +<([\w\d./]+)>/gm,(m,k)=>{const c=T.ShaderChunk[k];if(c==null)throw new Error('no chunk '+k);return res(c);});res(sh.vertexShader);res(sh.fragmentShader);return true;};
// ---------------------------------------------------------------- 1. every kind, every layer, each alone and all together
{const bad=[];
 for(const k of Object.keys(KINDS))for(const l of Object.keys(LAYERS)){try{const m=KINDS[k]();LAYERS[l].add(m);const sh=compile(m);resolves(sh);if(!LAYERS[l].mark.test(sh.fragmentShader))bad.push(k+'+'+l+': the layer left no mark');}catch(e){bad.push(k+'+'+l+': '+e.message);}}
 ok(Object.keys(KINDS).length+' material kinds under '+Object.keys(LAYERS).length+' layers, each alone',!bad.length);bad.slice(0,8).forEach(x=>console.log('     '+x));
 const bad2=[];for(const k of Object.keys(KINDS)){try{const m=KINDS[k]();for(const l of Object.keys(LAYERS))LAYERS[l].add(m);resolves(compile(m));}catch(e){bad2.push(k+': '+e.message);}}
 ok('...and all of them on one material',!bad2.length);bad2.slice(0,8).forEach(x=>console.log('     '+x));}
{const m=new T.MeshStandardMaterial();for(const l of Object.keys(LAYERS))LAYERS[l].add(m);const sh=compile(m);ok('a plain Standard material takes all of them',resolves(sh)&&/atmWetHere/.test(sh.fragmentShader),false);}
// ---------------------------------------------------------------- 2. the bark: the wet lands after its colour, before the alpha chunks, once
{const m=KINDS.gloss();A.cloudShade(m,{porosity:.4});const f=compile(m).fragmentShader,w=f.indexOf('diffuseColor.rgb*=1.0-0.38*atmWetHere'),c=f.indexOf('mix(vColor,uAlt,_bm)'),a=f.indexOf('#include <alphamap_fragment>');
 ok('the gloss bark takes the wet after its own colour, before <alphamap_fragment>',w>c&&c>0&&w<a,f.indexOf('#include <map_fragment>')>=0);}
// ---------------------------------------------------------------- 3. an untouched material's text is what cloudShade always wrote
{const m=new T.MeshLambertMaterial();A.cloudShade(m,{porosity:1});const f=compile(m).fragmentShader,M='#include <map_fragment>\nfloat atmWetHere=uWet;\ndiffuseColor.rgb*=1.0-0.38*atmWetHere*uPorosity;\n';
 ok('a material with its <map_fragment> keeps the wet right after it, as written before',f.indexOf(M)>0,f.indexOf('#include <map_fragment>')<0);}
// ---------------------------------------------------------------- 4. the negative: an anchor nothing supplies still throws
{const m=new T.MeshLambertMaterial();m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','').replace('#include <alphamap_fragment>','');};A.cloudShade(m,{porosity:1});
 let threw=false;try{compile(m);}catch(e){threw=/anchor/.test(e.message);}ok('a hook that removes both anchors still throws',threw,false);}
console.log(fails?'FAILED: '+fails:'OK');process.exit(fails?1:0);
