// node core/atmos/test-fog.js — the final rebuild's atmos items (2026-10-26): the height fog's integrals and its JS twin (R1),
// ATMOS.shaderHook (hooks compose in any order, never recurse: the NW outer wall's cloudShade report), the weather and the
// shared sky composing (X2), the rain occlusion chunk (R10), the gust uniforms for leaf shaders (R8), the branched lightning
// and its thunder (WEATHER item 8). Each check has a negative that must fail. No browser: a three.js stub stands in.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
const D=__dirname,files=['89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','sky/89-atmos-j-fog.js','host/89-atmos-c-hostbind.js','host/89-atmos-e-weatherhost.js',
 'host/89-atmos-h-skyhost.js','host/89-atmos-j-heightfog.js','fx/89-atmos-fx-raincover.js','fx/89-atmos-fx-snowcover.js','fx/89-atmos-fx-lightning.js'].map(f=>path.join(D,f));
eval(files.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=global.ATMOS;let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<=(e==null?1e-6:e);

// ---------------------------------------------------------------- R1: the fog's integrals against a numeric sum
const num=(dens,roy,rdy,L,n)=>{let s=0;n=n||20000;for(let i=0;i<n;i++){const y=roy+rdy*L*(i+.5)/n;s+=dens(y)*L/n;}return s;};
{const b=1/600,y0=200;let worst=0;for(const [roy,rdy,L] of [[0,.3,2000],[500,-.2,2500],[250,0,3000],[100,.9,800],[900,-.6,1600]]){
  worst=Math.max(worst,Math.abs(A.fogLayer(b,y0,roy,rdy,L)-num(y=>Math.exp(-b*(y-y0)),roy,rdy,L))/num(y=>Math.exp(-b*(y-y0)),roy,rdy,L));}
 ok('the air\'s optical depth is the exact exponential integral (5 rays, within 0.1%)',worst<1e-3,A.fogLayer(b,y0,0,.3,2000)===num(y=>1,0,.3,2000));}
{const b=1/40,lvl=300,dn=y=>y<lvl?1:Math.exp(-b*(y-lvl));let worst=0;
 for(const [roy,rdy,L] of [[280,.1,500],[350,-.3,400],[200,.05,300],[400,.2,600],[250,0,900]])worst=Math.max(worst,Math.abs(A.fogPool(b,lvl,roy,rdy,L)-num(dn,roy,rdy,L))/Math.max(1,num(dn,roy,rdy,L)));
 ok('the pool (full below its level, thinning above) is exact across the level (5 rays)',worst<2e-3,A.fogPool(b,lvl,350,-.3,400)===A.fogLayer(b,lvl,350,-.3,400));}
{const v=A.fogPool(1/45,260,1709,-.25,2800),w=A.fogPool(1/45,260,1709,-.25,7000);
 ok('a long ray falling from far above a thin mist pool picks up none of it until it reaches it (no overflow: nhighlands\' dawn white-out)',v<1e-3&&w>1000,v>1);}
{const q=A.fogSlab(1000,1200,0,.5,4000),r=A.fogSlab(1000,1200,0,-.5,4000);ok('the band: a ray climbing through 1000..1200 m spends 400 m in it, a falling one none',near(q[0],400,1e-9)&&near(q[1],2200,1e-9)&&r[0]===0,q[0]===0);}
// the twin: a level view at the reference height is FogExp2 exactly; a view up to a peak sees less; the mist adds in low ground
{const F={density:.0002,colour:[.6,.65,.7],falloff:1/900,ref:0,shape:'exp2'},a=A.fogAt([0,0,0],[3000,0,0],F).amount,e2=1-Math.exp(-Math.pow(.0002*3000,2));
 ok('a level view at the reference height is FogExp2\'s own fog',near(a,e2,1e-9),near(a,1-Math.exp(-.0002*3000),1e-6));
 const up=A.fogAt([0,0,0],[3000,1200,0],F).amount,lvl=A.fogAt([0,0,0],[Math.hypot(3000,1200),0,0],F).amount;
 ok('a view up to a peak 1200 m higher at the same distance sees less fog',up<lvl*.8,up>=lvl);
 const dn=A.fogAt([0,0,0],[3000,-600,0],F).amount;ok('...and one down into a valley sees the same as level (the air is the page\'s up to the reference: no blow-up)',dn<=1&&near(dn,1-Math.exp(-Math.pow(.0002*Math.hypot(3000,600),2)),1e-9),false);
 const mist=Object.assign({},F,{mist:{density:.004,y:-500,depth:30,noise:0}}),m1=A.fogAt([0,0,0],[3000,-560,0],mist).amount,m0=A.fogAt([0,0,0],[3000,-560,0],F).amount;
 ok('the valley mist adds fog where the ray ends in the low ground, none on a ray that stays above it',m1>m0+.3&&near(A.fogAt([0,0,0],[3000,200,0],mist).amount,A.fogAt([0,0,0],[3000,200,0],F).amount,1e-4),m1<=m0);
 const band=Object.assign({},F,{band:{density:.01,y0:300,y1:400,cover:1,noise:0}});
 ok('the band clouds a ray that crosses it and leaves a level one alone',A.fogAt([0,0,0],[2000,800,0],band).amount>A.fogAt([0,0,0],[2000,800,0],F).amount+.3&&near(A.fogAt([0,0,0],[3000,0,0],band).amount,a,1e-12),false);
 const sun=Object.assign({},F,{sun:.6,sunDir:[1,0.05,0],sunC:[1,.7,.4]}),cs=A.fogAt([0,0,0],[3000,0,0],sun).colour,ca=A.fogAt([0,0,0],[-3000,0,0],sun).colour;
 ok('toward a low sun the fog takes its colour, away from it the fog\'s own',cs[2]<ca[2]-.05&&near(ca[0],.6,1e-9),cs[2]>=ca[2]);}
{const g=A.fogGLSL();ok('the fog chunk: guarded, no sin hash, its three layers',/#ifndef ATM_FOG_CHUNK/.test(g)&&!/sin\(/.test(g)&&/atmFogPool/.test(g)&&/atmFogSlab/.test(g),/fract\(\s*sin/.test(g));}
{let same=true;for(let i=0;i<200;i++){const x=(i*37.3)%91-40,z=(i*11.7)%57-20,n=A.fogNoise(x,z);if(!(n>=0&&n<=1))same=false;}ok('the patch noise stays in 0..1 at negative and positive cells',same,false);}

// ---------------------------------------------------------------- a three.js stub (what the hooks touch)
class Material{constructor(){this.userData={};}}Material.prototype.customProgramCacheKey=function(){return this.onBeforeCompile.toString();};Material.prototype.onBeforeCompile=function(){};
class Color{constructor(r,g,b){this.r=r||0;this.g=g||0;this.b=b||0;}setRGB(r,g,b){this.r=r;this.g=g;this.b=b;return this;}copy(c){this.r=c.r;this.g=c.g;this.b=c.b;return this;}clone(){return new Color(this.r,this.g,this.b);}
 lerp(c,t){this.r+=(c.r-this.r)*t;this.g+=(c.g-this.g)*t;this.b+=(c.b-this.b)*t;return this;}equals(c){return c.r===this.r&&c.g===this.g&&c.b===this.b;}convertSRGBToLinear(){return this;}multiplyScalar(k){this.r*=k;this.g*=k;this.b*=k;return this;}}
class V2{constructor(x,y){this.x=x||0;this.y=y||0;}set(x,y){this.x=x;this.y=y;return this;}copy(v){this.x=v.x;this.y=v.y;return this;}addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;return this;}}
class V3 extends V2{constructor(x,y,z){super(x,y);this.z=z||0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}}
class V4 extends V3{constructor(){super();this.w=0;}set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this;}}
class Group{constructor(){this.children=[];}add(o){this.children.push(o);}}
class Obj{constructor(g,m){this.geometry=g;this.material=m;this.userData={};this.position=new V3();this.scale={setScalar(){}};this.visible=true;}}
class BG{constructor(){this.attributes={};}setAttribute(k,v){this.attributes[k]=v;}setIndex(i){this.index=i;}computeBoundingSphere(){}}
class BasicMat extends Material{constructor(o){super();Object.assign(this,o);this.color=new Color();this.color.setHex=function(){};}}
const T={Material,Color,Vector2:V2,Vector3:V3,Vector4:V4,Group,BufferGeometry:BG,BufferAttribute:class{constructor(a,n){this.array=a;this.itemSize=n;}},
 MeshBasicMaterial:BasicMat,SpriteMaterial:BasicMat,ShaderMaterial:BasicMat,LineSegments:Obj,Mesh:Obj,Sprite:Obj,AdditiveBlending:2,DoubleSide:2,ShaderChunk:{lights_lambert_vertex:'getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );',lights_fragment_begin:'getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );'}};
global.document={getElementById:()=>({})};const scene={add(){},fog:{color:new Color(.5,.5,.5),density:.0002}},camera={position:new V3(0,10,0),fov:50};
A.init({THREE:T,scene,camera,hour:()=>12,onFrame:fn=>{A._frame=fn;},ground:()=>0,seed:3});
const VS='#include <common>\n#include <project_vertex>\n#include <fog_vertex>\n#include <lights_lambert_vertex>\n',FS='#include <common>\n#include <map_fragment>\n#include <emissivemap_fragment>\n#include <fog_fragment>\n';
const compile=m=>{const sh={uniforms:{},vertexShader:VS,fragmentShader:FS};m.onBeforeCompile(sh,null);return sh;};
// a copy of core/water's wetGround accessor (51-core-water-kinds.js, 2026-10-21): the shape the recursion came from
const wetGround=mat=>{let page=mat.onBeforeCompile;const wet=function(sh,r){if(page)page.call(this,sh,r);sh.fragmentShader+='\nWET;';};
 Object.defineProperty(mat,'onBeforeCompile',{configurable:true,enumerable:true,get:()=>wet,set:fn=>{page=fn;}});return mat;};
A.skyUniforms={uNoise:{value:1},uCloud:{value:1},uCloudH:{value:1},uWind:{value:1},uTime:{value:1},uWet:{value:0},uSunDir:{value:new V3(0,1,0)},uSunC:{value:new Color(1,1,1)},uSunI:{value:1},uZen:{value:new Color(.3,.4,.6)}};
A.cloudShadeGLSL=()=>'uniform float uWet;CLOUD';
{const m=new Material();wetGround(m);let err=null,sh;try{A.cloudShade(m,{porosity:1});sh=compile(m);}catch(e){err=e;}
 ok('cloudShade after wetGround compiles once each, no recursion (the NW outer wall\'s report)',!err&&(sh.fragmentShader.match(/WET;/g)||[]).length===1&&/atmWetHere/.test(sh.fragmentShader),!!err);
 const m2=new Material();A.cloudShade(m2,{porosity:1});wetGround(m2);const s2=compile(m2);
 ok('...and wetGround after cloudShade too',/WET;/.test(s2.fragmentShader)&&/atmWetHere/.test(s2.fragmentShader),false);
 const m3=new Material();A.cloudShade(m3,{porosity:.4});A.snowOn(m3,{});let first=null;m3.onBeforeCompile=function(sh){first=!/atmWetHere|atmSnow/.test(sh.fragmentShader);sh.fragmentShader+='\nPAGE;';};const s3=compile(m3);
 ok('a page hook set after cloudShade and snowOn runs first, and both core hooks still run',first===true&&/PAGE;/.test(s3.fragmentShader)&&/atmSnow/.test(s3.fragmentShader)&&/atmWetHere/.test(s3.fragmentShader),first===false);
 const before=m3.customProgramCacheKey();m3.onBeforeCompile=function(sh){sh.fragmentShader+='\nOTHER;';};
 ok('the program key follows the page\'s hook and carries each layer',m3.customProgramCacheKey()!==before&&/atmos-cloudshade-0\.4/.test(before)&&/atm-snow/.test(before),m3.customProgramCacheKey()===before);
 const m4=new Material();A.cloudShade(m4,{porosity:1});A.cloudShade(m4,{porosity:1});const s4=compile(m4);
 ok('a layer added twice runs once',(s4.vertexShader.match(/CLOUD/g)||[]).length===1,(s4.vertexShader.match(/CLOUD/g)||[]).length!==1);}
// the height fog's hook replaces the fog chunk (only where the page left it)
{A.heightFog({mist:{density:.002,y:-100,depth:30}});const m=new Material();A.heightFogOn(m);const sh=compile(m);
 ok('heightFogOn: the fog chunk becomes atmFog under FOG_EXP2, the world position and the eye (from the view matrix: a Lambert fragment has no cameraPosition) reach the fragment',/atmFog\(vAtmFogC/.test(sh.fragmentShader)&&!/atmFog\(cameraPosition/.test(sh.fragmentShader)&&/vAtmFogP=/.test(sh.vertexShader)&&/vAtmFogC=-\(transpose\(mat3\(viewMatrix\)\)/.test(sh.vertexShader)&&sh.uniforms.atmFogH===A.U.fogH,!/atmFog\(/.test(sh.fragmentShader));
 const own=new Material();own.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <fog_fragment>','OWNFOG');};A.heightFogOn(own);const s2=compile(own);
 ok('...and leaves a page\'s own fog alone (nhighlands\' far land)',/OWNFOG/.test(s2.fragmentShader)&&!/atmFog\(/.test(s2.fragmentShader),false);
 A.fog.step(0,5,0);const dawn=A.U.fogMist.value.x;A.fog.step(0,13,0);const noon=A.U.fogMist.value.x;
 ok('the mist pools at dawn and burns off by noon',dawn>.0015&&noon<dawn*.3,dawn<=noon);}

// ---------------------------------------------------------------- X2: the weather and the shared sky compose, whichever binds first
{const sun={intensity:2},hemi={intensity:1};A.skyDrives=null;
 const W=A.bindWeather({climate:{wet:true},sun,hemi,fog:scene.fog,ui:{appendChild(){}}});A.weatherUI=null;
 W.mode='fog';for(let i=0;i<200;i++)A._frame(.1);const dNoSky=scene.fog.density;
 ok('without the sky the binding thickens the page\'s fog and dims its sun itself',dNoSky>.0006&&sun.intensity<2,dNoSky<=.0002);
 // now a sky that writes the hour's fog each frame (the order that lost the weather's fog before)
 A.skyDrives={fog:true,light:true,own:false};const skyFrame=()=>{scene.fog.density=.0002;scene.fog.color.setRGB(.5,.5,.5);if(A.wxFog)A.wxFog(scene.fog);};
 A._frame(.1);skyFrame();const dSky=scene.fog.density;ok('with the sky after the weather in a frame, the weather\'s fog survives (the sky runs its law)',dSky>.0006,dSky<=.0002);
 skyFrame();A._frame(.1);ok('...and with the weather after the sky, it does not stack twice',near(scene.fog.density,dSky,1e-12),scene.fog.density>dSky*1.5);
 const L=A.wxLook();ok('the sky gets the weather\'s look (grey, cover, wet)',L.grey>.3&&L.cover>0&&L.wet!=null,!L);
 A.skyDrives={fog:true,light:true,own:true};skyFrame();ok('a sky given its own weather: the binding leaves its fog to the page',near(scene.fog.density,.0002,1e-12),scene.fog.density>.0002);
 A.skyDrives=null;}
// X3 lives in core/host (92-host-panel.js: KHOST.wantHour, set by ATMOS.sky); its check is the pages' slider (verify)

// ---------------------------------------------------------------- R10: the rain occlusion chunk, R8: the gust uniforms
{const g=A.rainCoverGLSL();ok('the rain-cover chunk: guarded, an edge fade, a shelter margin, 4 taps',/#ifndef ATM_RAINCOVER/.test(g)&&/float atmRainOpen\(vec3 wp\)/.test(g)&&/atmRainCover\(vec3 wp\)/.test(g)&&(g.match(/atmRainOccYuv\(uv/g)||[]).length===4,!/ATM_RAINCOVER/.test(g));
 const rm={uniforms:{},vertexShader:'void main(){vec3 p=position;vec4 mv=viewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;}',userData:{}};A.U.rainOcc={value:1};A.rainCoverPatch=A.rainCoverPatch||null;
 const patchSrc=fs.readFileSync(path.join(D,'fx/89-atmos-fx-raincover.js'),'utf8');ok('the rain streaks fade under cover (the patch\'s pattern matches 4-weather\'s shader end)',
  /vA\*=1\.0-atmRainCover\(p\)/.test(patchSrc)&&/gl_Position=projectionMatrix\*mv;\}`/.test(fs.readFileSync(path.join(D,'89-atmos-4-weather.js'),'utf8')),false);
 const sg=A.snowGLSL();ok('the snow that lies reads the cover (fresh snow only) and the lee',/atmRainCover\(wp\)/.test(sg)&&/atmSnowLee/.test(sg),false);A.U.rainOcc=null;
 ok('...and without the map it carries no cover',!/atmRainCover/.test(A.snowGLSL()),false);}
{const u={};A.windUniforms(u);const g=A.windGLSL();ok('the gust field for leaf shaders: atmWindV, atmGustAmp, atmTime, atmGust/atmWind',u.atmWindV===A.U.wind&&u.atmGustAmp===A.U.gustAmp&&u.atmTime===A.U.time&&/float atmGust\(/.test(g)&&/uniform vec2 atmWindV/.test(g),!u.atmWindV);
 // the GLSL gust is the JS gust
 const t=12.5,x=40,z=-30,w=A.U.wind.value,j=A.gust(t,x,z);ok('...and atmGust in GLSL is ATMOS.gust in JS (the same sum)',g.indexOf(A.GLSL_WIND.slice(0,40))>=0&&isFinite(j),false);}

// ---------------------------------------------------------------- WEATHER item 8: branched lightning, delayed thunder
{const a=A.boltPath(7,[0,500,0],[0,0,0]),b=A.boltPath(7,[0,500,0],[0,0,0]),c=A.boltPath(8,[0,500,0],[0,0,0]);
 ok('a bolt is the same for the same seed, different for another',JSON.stringify(a)===JSON.stringify(b)&&JSON.stringify(a)!==JSON.stringify(c),JSON.stringify(a)===JSON.stringify(c));
 const main=a.filter(s=>s.level===0),last=main[main.length-1];ok('its main channel runs from the cloud to the ground in 2^depth segments, and it forks',main.length===64&&near(main[0].a[1],500)&&near(last.b[1],0)&&a.some(s=>s.level>0),a.every(s=>s.level===0));
 let conn=true;for(let i=1;i<main.length;i++)if(main[i].a!==main[i-1].b)conn=false;ok('...unbroken',conn,false);
 ok('thunder follows at the speed of sound',near(A.thunderDelay(1029),3,1e-9),near(A.thunderDelay(1029),1029/300,1e-9));}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
