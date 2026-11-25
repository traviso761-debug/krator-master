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
// ---------------------------------------------------------------- 5. V8 (Stage 8, G-weather W1, 2026-11-24): the core's makers take the cloud shade, once
// Every kind the core makes calls BIO.cloudShade; it is hooked (ATMOS.cloudShade, porosity BIO.CLOUD.porosity) when the page shades
// its lit materials (ATMOS.cloudShadeScene), for one made before or after, in the scene or not; never twice. Until then, and on a
// page with no core/atmos, the text is what it was (the same SHA-1 as the kind made where there is no core/atmos).
try{const crypto=require('crypto'),sha=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,16);
 const csN=m=>KH.names(m).filter(n=>n.indexOf('atmos-cloudshade-')===0);
 const comp=(TT,m)=>{const L=TT.ShaderLib[{MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard'}[m.type]],sh={uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader};m.onBeforeCompile.call(m,sh,R.RENDERER);return sh;};
 const txt=(TT,m)=>{const s=comp(TT,m);return sha(s.vertexShader+'\n----\n'+s.fragmentShader);};
 const kinds=Bx=>{const TT=Bx.host.THREE,tx=new TT.Texture();tx.biomeMean=.5;return{leaf:()=>Bx.leafMat(tx,'l',{}),leafAN:()=>Bx.leafMat(tx,'n',{aN:true,irid:true}),bark:()=>Bx.barkMat(tx),solid:()=>Bx.solidMat(tx),
  irid:()=>Bx.iridBarkMat(tx,'i'),gloss:()=>Bx.glossBarkMat(tx,'g',{alt:0x6a8a70,gloss:.06}),farIrid:()=>Bx.farMat({rule:'irid'}),farGloss:()=>Bx.farMat({}),hang:()=>Bx.hangMat(new TT.MeshLambertMaterial(),'h',{swayA:.05})};};
 const B0=F.load(read('30-core-foliage.js')),K0=kinds(B0),K1=kinds(B);
 // (a) made, the page not shading yet: queued, unhooked, the text of a page with no core/atmos
 const made={};const diff=[];for(const k of Object.keys(K1)){const m=made[k]=K1[k]();if(csN(m).length||txt(T,m)!==txt(B0.host.THREE,K0[k]()))diff.push(k);}
 ok('every core kind made with core/atmos on the page but before it shades: no hook yet, the text of a page without core/atmos ('+Object.keys(K1).length+' kinds, SHA-1)',!diff.length&&B._shadeQ.length>=Object.keys(K1).length,diff.length>0);
 if(diff.length)console.log('     '+diff.join(' '));
 B.__ticks.forEach(f=>f(1/60));
 ok('...and a frame later still none: a page that keeps its materials unshaded (skyBiome o.shade false) draws what it drew',Object.values(made).every(m=>!csN(m).length),Object.values(made).some(m=>csN(m).length>0));
 // (b) the page shades: the scene's materials by their mesh, the queued ones (in the scene or not) at the plants' porosity, once
 const sc=new T.Scene(),gnd=new T.MeshLambertMaterial(),works=new T.MeshStandardMaterial(),fauna=new T.MeshLambertMaterial();fauna.customProgramCacheKey=()=>'biofauna|x';
 const mesh=(mat,ud)=>{const o=new T.Mesh(new T.BufferGeometry(),mat);Object.assign(o.userData,ud||{});sc.add(o);return o;};
 mesh(made.leaf,{biome:true});mesh(gnd);mesh(works,{host:true});mesh(fauna,{biome:true});
 A.cloudShadeScene(sc);
 const one=m=>csN(m).length===1;
 ok('ATMOS.cloudShadeScene: the ground at 1, the works at .6, the leaf in the scene at .4, the fauna left out',csN(gnd)[0]==='atmos-cloudshade-1'&&csN(works)[0]==='atmos-cloudshade-0.6'&&csN(made.leaf)[0]==='atmos-cloudshade-0.4'&&!csN(fauna).length,!!csN(fauna).length);
 ok('...and every core kind made before it, in the scene or not, takes it once at BIO.CLOUD.porosity (.4)',Object.values(made).every(m=>one(m)&&csN(m)[0]==='atmos-cloudshade-0.4')&&A.skyShadeOn===true&&!B._shadeQ.length,Object.values(made).some(m=>!csN(m).length));
 // (c) one made after it: hooked at the next frame, not before (its kit may still hook it as it builds: the cloud layer goes over that)
 const late=K1.gloss(),lateBark=K1.bark();lateBark.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n/*KIT*/');};
 const before=csN(late).length;B.__ticks.forEach(f=>f(1/60));
 ok('a core material made after the page shades is hooked at the next frame, once; a kit\'s hook set after it runs under the layer',before===0&&one(late)&&one(lateBark)&&/\/\*KIT\*\//.test(comp(T,lateBark).fragmentShader)&&/atmWetHere/.test(comp(T,lateBark).fragmentShader),before!==0);
 // (d) never twice: the scene pass again, BIO.cloudShade again, another porosity: one layer, one atmWetHere
 A.cloudShadeScene(sc);B.cloudShade(made.leaf);A.cloudShade(made.leaf,{porosity:1});B.__ticks.forEach(f=>f(1/60));
 const fl=comp(T,made.leaf).fragmentShader,vl=comp(T,made.leaf).vertexShader;
 ok('never twice: a second scene pass, a second BIO.cloudShade and an ATMOS.cloudShade at another porosity leave one layer, one wet term, one shade',
  Object.values(made).every(one)&&(fl.match(/float atmWetHere=/g)||[]).length===1&&(vl.match(/atmCloudShade\(atmWPos/g)||[]).length===1,(fl.match(/float atmWetHere=/g)||[]).length!==1);
 // (e) a page's porosity (batteredisle's .44) through the scene pass reaches the core's materials made after it
 const pb=B.CLOUD.porosity;A.cloudShadeScene(new T.Scene(),{biome:.44});const p44=K1.leaf();B.__ticks.forEach(f=>f(1/60));
 ok('cloudShadeScene({biome:.44}) sets BIO.CLOUD.porosity: a plant made after it takes .44',B.CLOUD.porosity===.44&&csN(p44)[0]==='atmos-cloudshade-0.44',csN(p44)[0]==='atmos-cloudshade-0.4');
 B.CLOUD.porosity=pb;
 // (f) BIO.CLOUD.on false: none; a material that is not lit (a basic one) is never queued
 B.CLOUD.on=false;const offM=K1.leaf();B.__ticks.forEach(f=>f(1/60));const offOk=!csN(offM).length;B.CLOUD.on=true;B.__ticks.forEach(f=>f(1/60));
 const basic=new T.MeshBasicMaterial();B.cloudShade(basic);B.__ticks.forEach(f=>f(1/60));
 ok('BIO.CLOUD.on false holds them (hooked once it is on again); an unlit material is never queued',offOk&&one(offM)&&!csN(basic).length,!offOk);
 // (g) a page with no core/atmos: the queue is let go at the first frame, nothing is hooked
 const B9=F.load(read('30-core-foliage.js')),m9=kinds(B9).leaf();B9.__ticks.forEach(f=>f(1/60));
 ok('a page without core/atmos: the material is queued, then let go at the first frame, no layer, no BIO.err',!KH.names(m9).length&&B9._shadeQ.length===0&&!(B9.__errs||[]).length,KH.names(m9).length>0);}
catch(e){ok('V8: the core makers\' cloud shade ('+e.message+')',false);}
console.log(fails?'FAILED: '+fails:'OK');process.exit(fails?1:0);
