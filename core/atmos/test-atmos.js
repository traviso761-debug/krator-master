// node core/atmos/test-atmos.js — the atmosphere's engine-neutral contract, each check with a broken input that must
// fail. The pure part (the evening, a light's hours, the weather state machine, the lightning flash, the gusts, and
// that the GLSL the shaders get computes the same as the JS) needs no browser. The placement part loads a three.min.js
// (r128) if one is found, places a small street, steps the clock and fingerprints ATMOS.export(): the golden vectors a
// Godot Atmos autoload is tested against (GODOT-PLAN.md rule 9).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const FRAGS=fs.readdirSync(__dirname).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort();
const load=()=>{global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');};
load();const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-9);

// ---- the evening and a light's hours
ok('noon is day, midnight is night',A.night(12)===0&&A.night(0)===1,A.night(12)===1);
ok('dusk ramps between 17.2 and 18.8',A.night(18)>0&&A.night(18)<1&&near(A.night(18),.5,.01),near(A.night(18),0));
ok('a lamp on 17.6..29.6 is lit at 22 and at 3 next morning',near(A.litAt(22,17.6,29.6),1)&&near(A.litAt(3,17.6,29.6),1),near(A.litAt(22,17.6,29.6),0));
ok('...and dark at noon and at 6 (29.6 is 5:36)',near(A.litAt(12,17.6,29.6),0)&&near(A.litAt(6,17.6,29.6),0),near(A.litAt(6,17.6,29.6),1));

// ---- the weather state machine
const W=A.weatherState('storm');for(let i=0;i<600;i++)A.weatherStep(W,14,1/60);
ok('ten seconds of storm: rain near 1, wind toward 2.4, ground getting wet',W.rain>.99&&W.wind>2&&W.wet>.5,W.rain<.5);
const C=A.weatherState('clear');Object.assign(C,{rain:1,fog:1,wet:1,wind:2.4});for(let i=0;i<600;i++)A.weatherStep(C,14,1/60);
ok('clearing: rain gone, fog going, wet dries slowly',C.rain<.01&&C.fog<.01&&C.wet>.7&&C.wet<1,C.rain>.5);
ok('auto mode: the evening shower is on at 20.5 and off at 23',near(A.weatherTarget('auto',20.5).rain,1)&&near(A.weatherTarget('auto',23).rain,0),near(A.weatherTarget('auto',20.5).rain,0));
ok('auto mode: dawn fog at 6.5',A.weatherTarget('auto',6.5).fog>.6,A.weatherTarget('auto',6.5).fog<.1);
// ---- the ash (opt-in): older modes never raise it, the ash modes do, and the default mode list is unchanged
ok('the default modes are unchanged (no ash unless asked)',A.MODES.join()==='auto,clear,rain,storm,fog'&&A.weatherState('auto').MODES===A.MODES,false);
ok('the older modes never raise the ash',['auto','clear','rain','storm','fog'].every(m=>A.weatherTarget(m,14).ash===0),A.weatherTarget('ash',14).ash===0);
{const S=A.weatherState('ash');for(let i=0;i<900;i++)A.weatherStep(S,14,1/60);ok('the ash storm eases to full ash, a gale and haze',near(S.ash,1,.02)&&S.wind>2&&S.fog>.4,S.ash<.5);}
{const S=A.weatherState('ashfall');for(let i=0;i<900;i++)A.weatherStep(S,14,1/60);ok('ashfall eases to a light ash',S.ash>.25&&S.ash<.45&&S.fog<.05,S.ash>.9);}
// ---- the snow (opt-in, the Throne's glacier): the same rules as the ash
ok('the older modes and the ash never raise the snow',['auto','clear','rain','storm','fog','ashfall','ash'].every(m=>A.weatherTarget(m,14).snow===0),A.weatherTarget('blizzard',14).snow===0);
{const S=A.weatherState('blizzard');for(let i=0;i<900;i++)A.weatherStep(S,14,1/60);ok('the blizzard eases to full snow, a gale and a white-out, no ash',near(S.snow,1,.02)&&S.wind>2&&S.fog>.4&&S.ash<.01,S.snow<.5);}
{const S=A.weatherState('snowfall');for(let i=0;i<900;i++)A.weatherStep(S,14,1/60);ok('snowfall eases to a light snow',S.snow>.3&&S.snow<.5&&S.fog<.05,S.snow>.9);}
ok('the snow modes are offered apart from the ash',A.SNOW_MODES.join()==='snowfall,blizzard'&&A.ASH_MODES.indexOf('snowfall')<0,false);
ok('a step of zero time changes nothing (a pinned clock)',(()=>{const S=A.weatherState('rain'),b=JSON.stringify(S);A.weatherStep(S,12,0);return JSON.stringify(S)===b;})(),false);
ok('the flash: double, then a fade, then dark',A.flashAt(40)===1&&A.flashAt(100)===.25&&A.flashAt(200)===.8&&A.flashAt(400)>0&&A.flashAt(700)===0,A.flashAt(700)>0);

// ---- gusts, and the GLSL agreeing with the JS (the shaders and Godot get the same function)
A.U={wind:{value:{x:.8,y:.35}},gustAmp:{value:.55}};
ok('gusts stay within -1..1',(()=>{for(let t=0;t<400;t+=.37){const g=A.gust(t,13,-40);if(g<-1||g>1)return false;}return true;})(),A.gust(5,0,0)>1);
ok('a gust front travels downwind: what blows at x=0 now blows 12 m downwind a second later',
 (()=>{const w=A.U.wind.value,l=Math.hypot(w.x,w.y),d=[w.x/l*12,w.y/l*12];return near(A.gust(10,0,0),A.gust(11,d[0],d[1]),1e-12);})(),near(A.gust(10,0,0),A.gust(10,5,5),1e-12));
// translate the GLSL bodies the module writes into JS and compare (init writes them from the presets; build them the same way)
const glsl=(()=>{const T={Vector2:function(x,y){this.x=x;this.y=y;this.set=(a,b)=>{this.x=a;this.y=b;return this;};this.addScaledVector=()=>this;},Group:function(){this.add=()=>{};}};
 const B=Object.assign({},A);const h={THREE:T,scene:{add:()=>{}},camera:{fov:60},hour:()=>12,onFrame:()=>{},seed:1};A.init(h);const out={wind:A.GLSL_WIND,lit:A.GLSL_LIT};
 A.U={wind:{value:{x:.8,y:.35}},gustAmp:{value:.55}};return out;})();
const toJs=(src,fn)=>{const m=src.match(new RegExp('float '+fn+'\\(([^)]*)\\)\\{(.*?)\\}(?=\\s*(vec2|$))','s'));const args=m[1].split(',').map(a=>a.trim().split(/\s+/)[1]);
 let body=m[2].replace(/float /g,'let ').replace(/\b(sin|max)\(/g,'Math.$1(').replace(/smoothstep\(/g,'SS(').replace(/length\((\w+)\)/g,'Math.hypot($1[0],$1[1])').replace(/dot\((\w+),(\w+)\)/g,'($1[0]*$2[0]+$1[1]*$2[1])');
 return new Function('SS',...args,body).bind(null,(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);});};
const gG=toJs(glsl.wind,'atmGust'),gL=toJs(glsl.lit,'atmLit');
ok('GLSL atmGust equals ATMOS.gust',(()=>{for(let t=0;t<200;t+=3.1)for(const p of[[0,0],[40,-7],[-300,120]])if(!near(gG(t,p,[.8,.35]),A.gust(t,p[0],p[1]),1e-9))return false;return true;})(),near(gG(3,[0,0],[.8,.35]),A.gust(4,0,0),1e-9));
ok('GLSL atmLit equals ATMOS.litAt',(()=>{for(let h=0;h<24;h+=.25)if(!near(gL(h,{x:17.6,y:29.6}),A.litAt(h,17.6,29.6),1e-9))return false;return true;})(),near(gL(18.6,{x:17.6,y:29.6}),A.litAt(18.6,18.5,29.6),1e-9));

// ---- the wave field (89-atmos-a-waves.js). Its GLSL was checked against the JS twin on a GPU on 2026-10-05 (16 points,
// height, slope and crest within 6e-6, three r128 in Voth); here: the clock, the bounds, and the chunk carrying the presets
const PW=A.PRESETS.waves,WP=[[0,0],[-2500,1800],[812.5,-333],[3100,2900],[-40.25,77]];
ok('every wave runs a whole number of cycles per period (the wrap cannot jump)',['chop','mid','swell','group','warp'].every(f=>PW[f].every(w=>Number.isInteger(w[2]))),Number.isInteger(86.5));
ok('the wrapped clock is seamless: the field at t=0 equals the field at t=period',WP.every(p=>near(A.waveHeight(p[0],p[1],0,1),A.waveHeight(p[0],p[1],PW.period,1),1e-12)&&near(A.waveSlope(p[0],p[1],0,90)[0],A.waveSlope(p[0],p[1],PW.period,90)[0],1e-12)),
 WP.every(p=>near(A.waveHeight(p[0],p[1],0,1),A.waveHeight(p[0],p[1],PW.period/2,1),1e-12)));
ok('...and so is a time far past the period (a long session)',WP.every(p=>near(A.waveHeight(p[0],p[1],37.5,1),A.waveHeight(p[0],p[1],37.5+PW.period*400,1),1e-9)),false);
const swMax=PW.amp*PW.gain.swell*(PW.groupMix.swell[0]+PW.groupMix.swell[1])*PW.swell.reduce((s,w)=>s+w[3],0);let swSeen=0;
for(let t=0;t<PW.period;t+=11.3)for(const p of WP)swSeen=Math.max(swSeen,Math.abs(A.waveHeight(p[0],p[1],t,0)));
ok('the swell heaves, within amp x gain x (floor+depth) x its shares ('+swSeen.toFixed(3)+' of '+swMax.toFixed(3)+' m)',swSeen<=swMax&&swSeen>.1*swMax,swSeen<.01);
ok('the far sea is still: past every fade the slope is 0 and the crest 0.5',(()=>{const s=A.waveSlope(500,500,123,PW.fade.swell[1]+1);return s[0]===0&&s[1]===0&&s[2]===.5;})(),(()=>{const s=A.waveSlope(500,500,123,0);return s[0]===0&&s[1]===0;})());
const WG=A.waveGLSL();
ok('the chunk carries every wave of the presets and the three calls a host uses',['chop','mid','swell','group','warp'].every(f=>PW[f].every(w=>WG.includes('vec3('+[w[0]/(2*Math.PI),w[1]/(2*Math.PI),w[2]/PW.period].map(A.glf).join(',')+')')))&&
 /float atmWaveHeight\(vec2 p,float chopW\)/.test(WG)&&/vec3 atmWaveSlope\(vec2 p,float d\)/.test(WG)&&/vec3 atmWaveNormal\(vec2 p,float d,float k\)/.test(WG),WG.includes('vec3(9.0,9.0,9.0)'));
ok('the sky light leaves a build\'s tuned diffuse alone unless asked (PRESETS.skylight.diffuse 0)',typeof A.skylight==='function'&&A.PRESETS.skylight.diffuse===0,A.PRESETS.skylight.diffuse===1);

// ---- placement and export (needs three.js r128)
const T3=['../../settlements/iziz/three.min.js','../../biomes/sedesert/three.min.js'].map(p=>path.join(__dirname,p)).find(p=>fs.existsSync(p));
if(!T3)console.log('skip  placement and export (no three.min.js found)');
else{const THREE=require(T3);
 const run=()=>{let frame=null;const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1.5,.5,5000);camera.position.set(30,12,30);
  A.init({THREE,scene,camera,hour:()=>21.5,onFrame:f=>{frame=f;},ground:(x,z)=>.02*x,seed:4242,err:m=>{throw new Error(m);},viewH:720,pixelRatio:1});
  A.lampRow([[0,0],[80,0],[80,60]],{step:16});A.banner(10,10,.4,0xa83232);A.fountain(40,30,{r:3});A.beacon(0,40,0);A.brazier(20,0,-20);
  A.smoke([[5,6,5,'chimney'],[15,4,5,1],[25,2,5,'spray']]);A.fireflies([[50,0,50]]);A.moths({p:1});A.fogBank([[0,0,0],[30,0,30]]);A.weather({mode:'rain'});
  A.bakeSets();for(let i=0;i<180;i++)frame(1/60);return{json:JSON.stringify(A.export()),scene};};
 const r1=run(),r2=run(),E=JSON.parse(r1.json),fp=crypto.createHash('sha256').update(r1.json).digest('hex').slice(0,16);
 ok('placing twice from one seed exports the same bytes',r1.json===r2.json,false);
 ok('the clock advanced three seconds from host dt',near(E.clock.t,3,1e-6),near(E.clock.t,0));
 ok('the weather eased toward rain (0.75) and a 1.5x wind',E.fx.find(r=>r.type==='weather')&&near(A.W.rain,.75,.02)&&A.W.wind>1.3,A.W.rain<.1);
 ok('every record has an id and a type; the export says its colour space',E.fx.every(r=>r.id&&r.type)&&E.convention.colour==='srgb',false);
 ok('moths: one per lamp head times n',A.lamps.length>0&&E.fx.find(r=>r.type==='moths').lamps.length===A.lamps.length,false);
 ok('lamps follow the row: the evening running down it',E.lamps.length===A.lamps.length&&E.lamps[E.lamps.length-1].hours[0]>E.lamps[0].hours[0],E.lamps[0].hours[0]>E.lamps[E.lamps.length-1].hours[0]);
 const GOLD='ff4137190889c79d';   // 2026-10-06: the export gained presets.snow, the wind's snowfall/blizzard scales and the atm_snow uniform (the opt-in snow weather, biomes/throne station 9), after presets.ash and atm_ash (station 7); nothing placed or drawn changed for a host that asks for neither
 ok('export fingerprint '+fp+(fp===GOLD?'':' (golden '+GOLD+'; if the change is meant, take a screenshot diff and update GOLD)'),fp===GOLD,false);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
