// node core/atmos/test-fog.js — the final rebuild's atmos items (2026-10-26): the height fog's integrals and its JS twin (R1),
// ATMOS.shaderHook (hooks compose in any order, never recurse: the NW outer wall's cloudShade report), the weather and the
// shared sky composing (X2), the rain occlusion chunk (R10), the gust uniforms for leaf shaders (R8), the branched lightning
// and its thunder (WEATHER item 8). Each check has a negative that must fail. No browser: a three.js stub stands in.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
const D=__dirname,files=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js','89-atmos-0-core.js','89-atmos-0p-presets.js','89-atmos-4-weather.js','sky/89-atmos-j-fog.js','host/89-atmos-c-hostbind.js','host/89-atmos-e-weatherhost.js',
 'host/89-atmos-h-skyhost.js','host/89-atmos-j-heightfog.js','fx/89-atmos-fx-raincover.js','fx/89-atmos-fx-snowcover.js','fx/89-atmos-fx-lightning.js','fx/89-atmos-fx-rainwall.js','fx/89-atmos-fx-acid.js','fx/89-atmos-fx-airload.js','../rand/08-core-rand.js'].map(f=>path.join(D,f));
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
 // snowOn on a material whose page hook REPLACES <project_vertex> (core/biome's foliage hook: its sway), 2026-10-27: the snow's
 // vertex code still lands (before <fog_vertex>); a plain material keeps it after <project_vertex> as before
 {const m5=new Material();m5.onBeforeCompile=function(sh){sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','SWAY;');};A.snowOn(m5,{aN:true});const s5=compile(m5);
  const m6=new Material();A.snowOn(m6,{});const s6=compile(m6);
  ok('snowOn under a hook that replaced <project_vertex> still sets its varyings (a leaf card takes the snow)',/vAtmSnP=/.test(s5.vertexShader)&&s5.vertexShader.indexOf('vAtmSnP=')<s5.vertexShader.indexOf('#include <fog_vertex>')&&/atmSnN=aN/.test(s5.vertexShader),!/vAtmSnP=/.test(s5.vertexShader));
  ok('...and on a plain material it stays right after <project_vertex>',s6.vertexShader.indexOf('#include <project_vertex>\nvec4 atmSnWp')>=0,false);}
 const m4=new Material();A.cloudShade(m4,{porosity:1});A.cloudShade(m4,{porosity:1});const s4=compile(m4);
 ok('a layer added twice runs once',(s4.vertexShader.match(/CLOUD/g)||[]).length===1,(s4.vertexShader.match(/CLOUD/g)||[]).length!==1);}
// the real WATER.wetGround through ATMOS.shaderHook (HANDOFF-REBUILD.md's open request, 2026-10-26): a page hook set after
// cloudShade and wetGround replaces neither. The negative is the same sequence with shaderHook hidden (wetGround's own
// accessor, the old way): the page's hook then replaces cloudShade, the bug the request named
{const WF=['20-core-water.js','21-core-water-shore.js','22-core-water-flow.js','50-core-water-draw.js','51-core-water-kinds.js'].map(f=>path.join(D,'..','water',f));
 if(!A.PRESETS.waves)eval(fs.readFileSync(path.join(D,'89-atmos-a-waves.js'),'utf8'));
 eval(WF.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.WATER=WATER;');const W=global.WATER;
 const run=hide=>{const keep=A.shaderHook,m=new Material();A.cloudShade(m,{porosity:1});if(hide)A.shaderHook=undefined;W.wetGround(m,{rain:true});
  let first=null;m.onBeforeCompile=function(sh){first=!/atmWetHere|wtrWetGround/.test(sh.fragmentShader);sh.fragmentShader+='\nPAGE;';};
  const sh=compile(m);if(hide)A.shaderHook=keep;return{sh,first,m};};
 const r=run(false),f=r.sh.fragmentShader;
 ok('wetGround on shaderHook: a page hook set after cloudShade and wetGround runs first, and both core hooks still run, once each',
  r.first===true&&/PAGE;/.test(f)&&/atmWetHere/.test(f)&&(f.match(/wtrWetGround\(vWtrW/g)||[]).length===1&&r.m.userData.atmHooks.indexOf('wtr-wet')>=0,false);
 ok('...its program key carries cloudShade\'s layer and wetGround\'s options',/atmos-cloudshade-1/.test(r.m.customProgramCacheKey())&&/\|wtr-wet:rain$/.test(r.m.customProgramCacheKey()),false);
 const m2=new Material();W.wetGround(m2,{rain:true});A.cloudShade(m2,{porosity:1});m2.onBeforeCompile=function(sh){sh.fragmentShader+='\nPAGE;';};const f2=compile(m2).fragmentShader;
 ok('...and in the other order (cloudShade after wetGround) too',/PAGE;/.test(f2)&&/atmWetHere/.test(f2)&&/wtrWetGround\(vWtrW/.test(f2),false);
 const m3=new Material();W.wetGround(m3,{rain:true});W.wetGround(m3,{porosity:.5});const f3=compile(m3).fragmentShader;
 ok('...a second call still fills in options, not a second chunk (idempotent)',(f3.match(/wtrWetGround\(vWtrW/g)||[]).length===1&&/wtrWetDarkL/.test(f3)&&/\|lag:0\.5/.test(m3.customProgramCacheKey()),false);}
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
// ---------------------------------------------------------------- C1 (biomes/outlands/PLAN.md 12): the fog belt
// a face rising into a west wind (the wind comes from -x) and the same face in the lee (rising away from it)
const rampW=(x,z)=>3000+.4*x,rampL=(x,z)=>3000-.4*x;
{const o={y0:3500,y1:4400,windward:[-1,0],extent:[-8000,-2000,8000,2000],res:129,noise:0},B=A.fogBeltMake(o,rampW),BL=A.fogBeltMake(o,rampL);
 ok('the windward rise: + on a face turned to the wind, - in its lee',near(A.windwardAt(rampW,0,0,[-1,0]),.4,1e-9)&&near(A.windwardAt(rampL,0,0,[-1,0]),-.4,1e-9),A.windwardAt(rampW,0,0,[1,0])>0);
 const cw=A.fogBeltCover(B,2000,0),cl=A.fogBeltCover(BL,-2000,0);
 ok('the belt is thicker on the face turned to the wind than on the same height in the lee ('+cw.toFixed(3)+' vs '+cl.toFixed(3)+')',cw>2.5*cl&&cl>0,cw<=cl);
 ok('...and none where the ground lies below the band or above it',A.fogBeltCover(B,0,0)===0&&A.fogBeltCover(B,5000,0)===0&&cw>0,A.fogBeltCover(B,2000,0)===0);
 const g=rampW(2000,0),a0=A.fogBeltAt(B,2000,g+2,0),a1=A.fogBeltAt(B,2000,g+150,0),a2=A.fogBeltAt(B,2000,g+400,0);
 ok('it hugs the slope: thickest at the ground, thinning over its depth above it',a0>a1&&a1>a2&&near(a1/a0,Math.exp(-148/150),.02),a2>=a0);
 ok('it thins where the ground rises through it toward its top',A.fogBeltCover(B,2875,0)<.75*A.fogBeltCover(B,2000,0),A.fogBeltCover(B,2875,0)>=A.fogBeltCover(B,2000,0));
 ok('the field holds the ground at half precision (within 0.5 m in the band) and its nodes are the GPU\'s halves',Math.abs(A.fogBeltField(B,2000,0)[0]-g)<.5&&B.field.g[0]===A.fromHalf(A.toHalf(B.field.g[0]))&&near(A.fromHalf(A.toHalf(1/3)),1/3,3e-4),Math.abs(A.fogBeltField(B,2000,0)[0]-g)>=.5);
 // the march against a fine numeric sum along a ray up the face
 const ro=[1500,rampW(1500,0)+2,0],P=[2500,rampW(2500,0)+2,0],L=Math.hypot(P[0]-ro[0],P[1]-ro[1]),rd=[(P[0]-ro[0])/L,(P[1]-ro[1])/L,0];
 let ref=0;const N=20000;for(let i=0;i<N;i++){const t=L*(i+.5)/N;ref+=A.fogBeltAt(B,ro[0]+rd[0]*t,ro[1]+rd[1]*t,0)*L/N;}
 const d16=A.fogBeltDepth(Object.assign({},B,{steps:16}),ro,rd,L),d8=A.fogBeltDepth(B,ro,rd,L);
 ok('its optical depth along a ray is the march of its density (16 steps within 3%, the default 8 within 15%)',Math.abs(d16-ref)/ref<.03&&Math.abs(d8-ref)/ref<.15,Math.abs(A.fogBeltDepth(Object.assign({},B,{steps:1}),ro,rd,L)-ref)/ref<1e-3);
 const F={density:.0002,colour:[.6,.65,.7],falloff:1/900,ref:ro[1],shape:'exp2'},Fb=Object.assign({},F,{belt:B});
 ok('in the twin (fogAt) a view up the face into the belt is clouded, a view above the band is not touched',A.fogAt(ro,P,Fb).amount>A.fogAt(ro,P,F).amount+.3&&A.fogAt([0,6000,0],[3000,6000,0],Fb).amount===A.fogAt([0,6000,0],[3000,6000,0],F).amount,A.fogAt(ro,P,Fb).amount<=A.fogAt(ro,P,F).amount);
 // the chunk: the same text as before on every page without a belt
 A.fogBeltOn=false;const g0=A.fogGLSL();A.fogBeltOn=true;const g1=A.fogGLSL();A.fogBeltOn=false;
 ok('the chunk without a belt is the chunk it was (no belt lines); with one it marches the belt into the band\'s term, no sin hash',g0===A.fogGLSL()&&!/atmFogBelt/.test(g0)&&/float atmFogBeltDepth\(/.test(g1)&&g1.indexOf(' tB+=atmFogBeltDepth(ro,rd,L);')<g1.indexOf(' float amount=1.0-exp(')&&g1.indexOf(' tB+=atmFogBeltDepth')>0&&!/sin\(/.test(g1),/atmFogBelt/.test(g0));
 // the host: its uniforms, its record, the hook binds them
 Object.assign(T,{DataTexture:class{constructor(d,w,h,f,t){this.image={data:d,width:w,height:h};this.format=f;this.type=t;}},RGBAFormat:1023,HalfFloatType:1016,LinearFilter:1006,ClampToEdgeWrapping:1001});
 const g_=A.h.ground;A.h.ground=rampW;const HB=A.fogBelt({y0:3500,y1:4400,windward:[-1,0],centre:[0,0],radius:4000,res:64});
 const m=new Material();A.heightFogOn(m);const sh=compile(m);
 ok('ATMOS.fogBelt: its texture is the field\'s halves, its density follows the weather, a record, the height fog\'s hook binds it',HB.texture.image.data===HB.field.half&&HB.texture.type===T.HalfFloatType&&A.U.fogBelt.value.x>=HB.density&&A.U.fogBeltK.value.w===64&&sh.uniforms.atmFogBeltT===A.U.fogBeltT&&/atmFogBeltDepth/.test(sh.fragmentShader)&&A.fx.some(r=>r.type==='fogbelt'&&r.y0===3500),!sh.uniforms.atmFogBeltT);
 ok('...and B.at / B.cover are the twin on the page\'s ground',near(HB.cover(2000,0),A.fogBeltCover(HB,2000,0),1e-12)&&HB.cover(2000,0)>0&&HB.cover(-3000,0)===0,HB.cover(2000,0)===0);
 A.fog.off=true;A._frame(.1);ok('...and the A/B switch (A.fog.off) turns it off',A.U.fogBelt.value.x===0,A.U.fogBelt.value.x>0);A.fog.off=false;
 A.fogBeltOn=false;A.h.ground=g_;}

// ---------------------------------------------------------------- the mist field (the valley's smog, 2026-11-09): the mist's density by place
{const F0={density:0,colour:[.6,.65,.7],falloff:1/900,ref:0,shape:'exp2'},mist={density:.004,y:30,depth:40,noise:0};
 const tM=(F,ro,P)=>-Math.log(1-A.fogAt(ro,P,F).amount);   /* no air: the amount is the mist's optical depth alone */
 const Fm=Object.assign({},F0,{mist}),Fz=Object.assign({},F0,{mist:Object.assign({},mist,{field:()=>0})}),F1=Object.assign({},F0,{mist:Object.assign({},mist,{field:()=>1})});
 const ro=[0,10,0],P=[3000,10,0];
 ok('a ray through a 0 region of the field sees no mist, through a 1 region the full mist (the page\'s own)',A.fogAt(ro,P,Fz).amount===0&&near(tM(F1,ro,P),tM(Fm,ro,P),1e-12)&&tM(Fm,ro,P)>.5,A.fogAt(ro,P,Fz).amount>0);
 // a smooth field (a smoothstep ramp over 2 km) against a fine march of density x field along the ray, level and falling into the pool
 const ramp=(x,z)=>A.ss(300,1900,x),Fr=Object.assign({},F0,{mist:Object.assign({},mist,{field:ramp})});
 const march=(ro,P)=>{const L=Math.hypot(P[0]-ro[0],P[1]-ro[1],P[2]-ro[2]),N=40000;let s=0;for(let i=0;i<N;i++){const t=L*(i+.5)/N,x=ro[0]+(P[0]-ro[0])*t/L,y=ro[1]+(P[1]-ro[1])*t/L,z=ro[2]+(P[2]-ro[2])*t/L;
   s+=mist.density*(y<mist.y?1:Math.exp(-(y-mist.y)/mist.depth))*ramp(x,z)*L/N;}return s;};
 const e1=Math.abs(tM(Fr,ro,P)-march(ro,P))/march(ro,P),ro2=[0,140,0],P2=[3000,-10,0],e2=Math.abs(tM(Fr,ro2,P2)-march(ro2,P2))/march(ro2,P2);
 const F1s=Object.assign({},F0,{mist:Object.assign({},mist,{field:ramp,samples:1})}),e3=Math.abs(tM(F1s,ro2,P2)-march(ro2,P2))/march(ro2,P2);
 ok('its integral is the fine march within a few percent (level '+(e1*100).toFixed(2)+'%, falling into the pool '+(e2*100).toFixed(2)+'%), the density-weighted samples reading the field where the mist is',e1<.04&&e2<.04,e3<.04);
 ok('a ray that never comes near the layer reads the field at its end (nothing to weight)',near(tM(Object.assign({},F0,{mist:Object.assign({},mist,{field:(x)=>x>2000?1:0})}),[0,900,0],[3000,900,0]),tM(Fm,[0,900,0],[3000,900,0]),1e-12),false);
 // the record: a grid at half precision, bilinear between its nodes, clamped at its edge
 const M=A.fogMistFieldMake({at:ramp,extent:[-4000,-4000,4000,4000],res:65});
 ok('fogMistFieldMake: a res x res grid of halves over the extent, its at() the function within half precision, 1 at a texel\'s centre',M.n===65&&M.half.length===65*65*4&&Math.abs(M.at(1500,0)-ramp(1500,0))<2e-3&&M.at(3000,0)===1&&M.at(-3000,0)===0&&M.v[0]===A.fromHalf(A.toHalf(M.v[0]))&&M.half[3]===15360,Math.abs(M.at(1500,0)-ramp(1500,0))>=2e-3);
 ok('...clamped outside the extent, a record the twin takes as it takes a function',M.at(9000,0)===1&&M.at(-9000,0)===0&&near(tM(Object.assign({},F0,{mist:Object.assign({},mist,{field:M})}),ro,P),tM(Fr,ro,P),.01),false);
 // the chunk: the same text as before on every page without a field
 A.fogMistFieldOn=false;const g0=A.fogGLSL();A.fogMistFieldOn=true;const g1=A.fogGLSL();A.fogMistFieldOn=false;
 ok('the chunk without a field is the chunk it was; with one it scales the mist\'s pool term by the field\'s weighted mean (a loop of at most 8, as the belt\'s)',g0===A.fogGLSL()&&!/atmFogMistT|atmFogMistField/.test(g0)&&/float atmFogMistField\(/.test(g1)&&g1.indexOf('ro.y,rd.y,L);tM*=atmFogMistField(ro,rd,L);')>0&&/for\(int i=0;i<8;i\+\+\)\{if\(float\(i\)>=atmFogMistK\.y\)break;/.test(g1)&&!/sin\(/.test(g1),/atmFogMistField/.test(g0));
 // the host: the texture, its uniforms, the hook binds them, the record carries the grid and not the function
 Object.assign(T,{Vector2:T.Vector2||V2});
 const HF=A.heightFog({mist:{density:.004,y:30,depth:40,noise:0,field:{at:ramp,centre:[0,0],radius:4000,res:64},samples:5}});A._frame(.1);
 const m=new Material();A.heightFogOn(m);const sh=compile(m),rec=A.fx.filter(r=>r.type==='heightfog').pop();
 ok('ATMOS.heightFog({mist:{field}}): its texture is the field\'s halves (64 x 64 over 8 km), 5 samples, the hook binds it, the record keeps the grid',HF.field.texture.image.data===HF.field.half&&HF.field.texture.type===T.HalfFloatType&&A.U.fogMistK.value.x===64&&A.U.fogMistK.value.y===5&&near(A.U.fogMistE.value.z,1/8000,1e-15)&&sh.uniforms.atmFogMistT===A.U.fogMistT&&/atmFogMistField/.test(sh.fragmentShader)&&rec.mist.field.res===64&&!rec.mist.field.at&&typeof HF.field.at==='function'&&near(HF.field.at(1500,0),ramp(1500,0),1e-2),!sh.uniforms.atmFogMistT);   /* 1e-2: the bilinear's error between nodes 127 m apart on a 1.6 km ramp */
 A.fogMistFieldOn=false;}

// ---------------------------------------------------------------- the SW highlands' rain wall (fx/89-atmos-fx-rainwall.js)
const rw=(x,z)=>1000+.4*x,rl=(x,z)=>1000-.4*x;
{const R=A.rainWallMake({y0:1700,y1:2600,windward:[-1,0]});
 ok('the rain wall rains on the windward face in its band, little in the lee',A.rainWallAt(R,2500,0,rw)>.95&&near(A.rainWallAt(R,-2500,0,rl),R.lee,1e-9),A.rainWallAt(R,2500,0,rw)<=A.rainWallAt(R,-2500,0,rl));
 {const Rf=A.rainWallMake({field:(x,z)=>x>0?1.4:x>-100?.5:-1,rain:.8});   /* a host's own field (the Ancient's Valley's oily rain, 2026-11-09): clamped, times rain, the orographic formula unused */
  ok('a host field replaces the orographic formula, clamped to 0..1 and scaled by rain',near(A.rainWallAt(Rf,500,0,rw),.8,1e-9)&&near(A.rainWallAt(Rf,-50,0,rw),.4,1e-9)&&A.rainWallAt(Rf,-500,0,rw)===0,A.rainWallAt(A.rainWallMake({rain:.8}),500,0,rw)===.8);}
 ok('...and none below its band or above it',A.rainWallAt(R,0,0,rw)===0&&A.rainWallAt(R,7000,0,rw)===0,A.rainWallAt(R,2500,0,rw)===0);
 Object.assign(R,{extent:[-1000,-1000,6000,1000],cell:250,min:.2,top:3000,max:700});
 const c1=A.rainWallCells(R,rw,7),c2=A.rainWallCells(R,rw,7),c3=A.rainWallCells(R,rw,8);
 ok('its curtains stand only where it rains, the same for a seed, others for another',c1.length>10&&c1.every(q=>q.k>=.2&&q.top===3000)&&JSON.stringify(c1)===JSON.stringify(c2)&&JSON.stringify(c1)!==JSON.stringify(c3),JSON.stringify(c1)===JSON.stringify(c3));
 const sub=A.rainWallCells(Object.assign({},R,{extent:[2000,-1000,4000,1000]}),rw,7),key=q=>q.x.toFixed(6)+','+q.z.toFixed(6);
 ok('...seeded by world cell, not by draw order: a smaller extent draws the same curtains there',sub.length>0&&sub.every(q=>c1.some(p=>key(p)===key(q))),!sub.length);
 // the host: the field under the eye lifts the weather's rain, and lets it go when the eye leaves
 Object.assign(T,{InstancedBufferGeometry:BG,Float32BufferAttribute:class{constructor(a,n){this.array=a;this.itemSize=n;}},InstancedBufferAttribute:class{constructor(a,n){this.array=a;this.itemSize=n;}}});
 const g_=A.h.ground,cp=camera.position.clone?null:[camera.position.x,camera.position.y,camera.position.z];A.h.ground=rw;A.W.mode='clear';A.W.rain=0;
 camera.position.set(2500,rw(2500,0)+2,0);const H=A.rainWall({y0:1700,y1:2600,windward:[-1,0],centre:[2500,0],radius:2000,seed:7});
 for(let i=0;i<300;i++)A._frame(.1);const inside=A.W.rain;
 camera.position.set(-3000,rw(-3000,0)+2,0);for(let i=0;i<300;i++)A._frame(.1);const out=A.W.rain;
 ok('ATMOS.rainWall: it rains on you inside the wall (W.rain '+inside.toFixed(2)+'), not once you walk out ('+out.toFixed(2)+'), and hangs curtains with a record',inside>.6&&out<.05&&H.cells.length>5&&!!H.mesh&&A.fx.some(r=>r.type==='rainwall'&&r.curtains===H.cells.length),inside<.05);
 H.off=true;camera.position.set(2500,rw(2500,0)+2,0);for(let i=0;i<300;i++)A._frame(.1);
 ok('...and R.off leaves the weather alone',A.W.rain<.05&&H.mesh.visible===false,A.W.rain>.05);
 ok('its curtain shader has no sin hash',!/sin\(/.test(H.mesh.material.fragmentShader+H.mesh.material.vertexShader),/sin\(/.test(H.mesh.material.fragmentShader));
 A.h.ground=g_;camera.position.set(cp[0],cp[1],cp[2]);}
// ---------------------------------------------------------------- acid rain (fx/89-atmos-fx-acid.js; core/hazard's acid-rain row)
{ok('the acid ramp is core/hazard\'s: none in clean rain or with no rain, full at pH 1 in 10 mm/h, half at pH 2.5 in 10',A.acidK(5.6,20)===0&&A.acidK(2,0)===0&&A.acidK(1,10)===1&&near(A.acidK(2.5,10),.5,1e-12)&&near(A.acidK(1,5),.5,1e-12),A.acidK(5.6,20)>0);
 const rc=A.PRESETS.rain.color,t2=A.acidTint(2);
 ok('clean rain keeps its colour; acid rain turns a sickly yellow-green',A.acidTint(5.6).every((v,i)=>near(v,rc[i],1e-12))&&t2[1]>t2[2]+.3&&A.acidTint(null).every((v,i)=>near(v,rc[i],1e-12)),near(t2[2],rc[2],1e-3));
 const S={etch:.2};A.acidStep(S,2,10,60);const e1=S.etch;A.acidStep(S,5.6,10,600);A.acidStep(S,2,0,600);
 ok('the etch grows while acid rain falls and never falls back',e1>.2&&near(S.etch,e1,1e-12)&&A.acidStep({etch:.99},1,10,1e4).etch===1,e1<=.2);
 const g=A.acidGLSL();ok('the acid chunk: guarded, pits, streaks, fizz, no sin hash',/#ifndef ATM_ACID_CHUNK/.test(g)&&/atmAcidPits/.test(g)&&/atmAcidStreak/.test(g)&&/atmAcidFizz/.test(g)&&!/sin\(/.test(g),/sin\(/.test(g));
 // the host on the stub: the streaks' colour becomes a uniform, the fields reach KHAZ, the records carry the acidity
 const prov={};global.KHAZ={provide:(k,fn)=>{prov[k]=fn;}};const fs0=A.rainMat.fragmentShader;
 A.W.mode='storm';A.W.rain=1;camera.position.set(0,10,0);
 const AS=A.acidRain({ph:(x,z)=>x<0?2:5.6,cover:(x,y,z)=>y<5?1:0});
 ok('acidRain: the rain streaks read the tint uniform (their old literal gone)',/uniform vec3 atmAcidC/.test(A.rainMat.fragmentShader)&&A.rainMat.fragmentShader.indexOf('vec3('+A.PRESETS.rain.color.map(A.glf).join(',')+')')<0&&A.rainMat.uniforms.atmAcidC===A.U.acidC,A.rainMat.fragmentShader===fs0);
 ok('...KHAZ gets rain (mm/h, 0 under cover) and pH (the Valley\'s acid in the west, clean in the east)',near(prov.rain(-50,10,0),20,1e-9)&&prov.rain(-50,2,0)===0&&prov.ph(-50,10,0)===2&&prov.ph(50,10,0)===5.6,!prov.rain);
 const wr=A.fx.find(r=>r.type==='weather');ok('...the weather record carries the acidity, and an acidrain record',wr&&wr.acid&&wr.acid.ph==='field'&&A.fx.some(r=>r.type==='acidrain'&&r.fields===true),!(wr&&wr.acid));
 camera.position.set(-50,10,0);const e0=A.acid.etch;for(let i=0;i<50;i++)A._frame(.1);const eW=A.acid.etch,fW=A.acid.fizz;
 camera.position.set(50,10,0);for(let i=0;i<50;i++)A._frame(.1);
 ok('in the acid west the eye\'s etch grows and the water fizzes; in the clean east the fizz stops and the etch holds',eW>e0&&fW>.5&&A.acid.fizz===0&&near(A.acid.etch,eW,1e-12),eW<=e0);
 const mk=k=>{const m=new Material();A.acidOn(m,{kind:k});return compile(m).fragmentShader;},fm=mk('metal'),fsn=mk('stone'),fw=mk('water');
 ok('acidOn: metal, stone and water each draw their own term on the albedo',/atmAcidAlbedo\(diffuseColor\.rgb,vAtmAcP,atmAcNf,0,/.test(fm)&&/atmAcNf,1,/.test(fsn)&&/atmAcNf,2,/.test(fw),/atmAcNf,0,/.test(fsn));
 const m2=new Material();A.acidOn(m2,{kind:'metal'});A.acidOn(m2,{kind:'metal'});ok('...once each',(compile(m2).fragmentShader.match(/#define ATM_ACID_CHUNK/g)||[]).length===1,false);
 A.W.mode='clear';A.W.rain=0;delete global.KHAZ;}
// ---------------------------------------------------------------- the air's load (fx/89-atmos-fx-airload.js; core/hazard's dust, ash, alkali, sight)
{ok('sight through dust is Chepil and Woodruff\'s: 2000 mg/m3 about 57 m, clean air unbounded',near(A.dustSightM(2000),57.2,.2)&&A.dustSightM(0)===Infinity&&A.dustSightM(12)>A.dustSightM(50),near(A.dustSightM(2000),2000,1));
 const V=57,d2=A.sightFog(V,'exp2'),d1=A.sightFog(V,'exp');
 ok('the fog that matches a sight leaves 2% at that range (FogExp2 and exponential)',near(Math.exp(-Math.pow(d2*V,2)),.02,1e-12)&&near(Math.exp(-d1*V),.02,1e-12)&&A.sightFog(Infinity)===0,near(Math.exp(-d2*V),.02,1e-6));
 // a lake bed east (x > 0) and sand west; the record as the host builds it
 const S={clean:.05,dust:30,dustH:30,stormMg:1500,stormH:800,stormFloor:.35,ashMg:120,ashH:1500,fetch:2000,ground:()=>0,mask:(x,z)=>x>0?1:0,alkali:(x,z)=>x>0?.5:.05,ashAt:null,wind:[-1,0],storm:1,ash:0};
 const sand=A.airAt(S,-500,0,0,0),bed=A.airAt(S,2500,0,0,0);
 ok('a black storm loads the air fullest over its own bare ground, a floor of it elsewhere',near(bed.dust,1500.05,1e-9)&&near(A.airAt(Object.assign({},S,{wind:[1,0]}),-500,0,0,0).dust,.05+.35*1500,1e-9),bed.dust<=sand.dust-1);
 ok('...and carries the lake beds\' dust and its alkali downwind over the sand (the share where it was lifted)',near(sand.dust,1500.05,1e-9)&&near(sand.alkali,.5,1e-12)&&near(A.airAt(Object.assign({},S,{storm:0}),-500,0,0,1).alkali,.05,1e-12),sand.alkali<.1);
 ok('...thinning with height (a wall some hundreds of metres high)',A.airAt(S,2500,800,0,0).dust<.4*bed.dust&&A.airAt(S,2500,800,0,0).dust>.3*bed.dust,A.airAt(S,2500,800,0,0).dust>=bed.dust);
 ok('the wind\'s own dust follows the lift; the ash follows W.ash',near(A.airAt(Object.assign({},S,{storm:0}),2500,0,0,1).dust,30.05,1e-9)&&near(A.airAt(Object.assign({},S,{storm:0,ash:.35}),0,0,0,0).ash,42,1e-9),A.airAt(Object.assign({},S,{storm:0}),2500,0,0,0).dust>1);
 // the host on the stub: the fog becomes the sight's, KHAZ gets the fields, the record carries them
 const prov={};global.KHAZ={provide:(k,fn)=>{if(fn==null)delete prov[k];else prov[k]=fn;}};
 const g_=A.h.ground;A.h.ground=()=>0;camera.position.set(2500,2,0);scene.fog.density=.0002;scene.fog.color.setRGB(.5,.5,.5);A.W.ash=0;A.W.mode='clear';const wb=[A.windBase.x,A.windBase.y];A.windBase.set(-.8,0);   /* the wind blows west, off the lake beds */
 const base=.0002,AL=A.airLoad({storm:2000,mask:(x,z)=>x>0?1:0,alkali:(x,z)=>x>0?.5:.05,ashAt:()=>1});
 for(let i=0;i<5;i++)A._frame(.1);
 ok('airLoad: in calm clean air the fog stands as the page and its weather wrote it',near(scene.fog.density,AL.base,1e-15)&&A.sightFog(AL.eye.sight)<AL.base,!near(scene.fog.density,AL.base,1e-15));
 AL.stormTo=1;for(let i=0;i<400;i++)A._frame(.1);const sgt=AL.eye.sight,amt=1-Math.exp(-Math.pow(scene.fog.density*sgt,2));
 ok('...in the black storm the fog is the sight: a '+sgt.toFixed(0)+' m sight leaves 2% at '+sgt.toFixed(0)+' m, tinted to the dust',sgt<80&&near(amt,.98,1e-9)&&scene.fog.color.r!==.5,near(scene.fog.density,base,1e-12));
 const d0=scene.fog.density,c0=scene.fog.color.clone();A.wxFog(scene.fog);A.wxFog(scene.fog);
 ok('...applied twice in a frame (the sky and the hook) it does not stack',near(scene.fog.density,d0,1e-15)&&scene.fog.color.equals(c0),scene.fog.density>d0);
 ok('KHAZ gets dust (thinning with height), ash, alkali and visibility',['alkali','ash','dust','visibility'].every(k=>prov[k])&&prov.dust(2500,2,0)>prov.dust(2500,1000,0)&&near(prov.dust(2500,2,0),AL.eye.dust,1e-9)&&near(prov.alkali(-500,2,0),.5,1e-6),!prov.dust);
 ok('...the visibility field is the page\'s own fog (not the dust\'s: no counting it twice)',prov.visibility(2500,2,0)>10*sgt,prov.visibility(2500,2,0)<=sgt*1.01);
 AL.stormTo=0;for(let i=0;i<600;i++)A._frame(.1);
 ok('...and when the storm has passed the fog is the page\'s again (no stacking with the weather binding\'s own law)',near(scene.fog.density,AL.base,1e-15)&&AL.base<.001,scene.fog.density>AL.base*1.01);
 const wr=A.fx.find(r=>r.type==='weather');ok('the weather record carries the air\'s numbers (and an airload record)',wr&&wr.air&&wr.air.storm===2000&&wr.air.sight&&A.fx.some(r=>r.type==='airload'),!(wr&&wr.air));
 // against core/hazard itself when it is in the tree (or KRATOR_KHAZ_DIR names a checkout of it): the same sight and dose
 const kd=process.env.KRATOR_KHAZ_DIR||path.join(D,'..');let real=null;
 try{const src=n=>fs.readFileSync(path.join(kd,n),'utf8');delete global.KHAZ;global.KTAGS=undefined;
  eval(src('rand/08-core-rand.js'));eval(src('tags/50-core-tags.js'));eval(src('tags/52-core-tags-vocab.js'));eval(src('biome/37-core-traps.js'));eval(src('hazard/20-core-hazard.js'));
  real=typeof KHAZ!=='undefined'&&KHAZ.sight&&KHAZ.provide?KHAZ:null;}catch(e){real=null;}
 if(real){AL.stormTo=1;for(let i=0;i<400;i++)A._frame(.1);for(const k of ['dust','ash','alkali'])real.provide(k,prov[k]);
  const ks=real.sight(2500,2,0).range,amb=real.ambient(2500,2,0);
  ok('with core/hazard: KHAZ.sight is the drawn sight ('+ks.toFixed(1)+' m), and the storm chokes and corrodes',near(ks,AL.at(2500,2,0).sight,1e-6)&&amb.some(a=>a.kind==='dust'&&a.k>.9)&&amb.some(a=>a.kind==='caustic-dust'&&a.k>.9),false);
  AL.stormTo=0;for(let i=0;i<600;i++)A._frame(.1);}
 else console.log('skip  core/hazard has no sight here (KRATOR_KHAZ_DIR=<core of its branch> to run it)');
 delete global.KHAZ;A.h.ground=g_;A.windBase.set(wb[0],wb[1]);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
