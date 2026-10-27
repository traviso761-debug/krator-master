// node core/shader/test-kcolor.js — KCOLOR (06b-core-kcolor.js): the conversions against three.js r128's own, the convention (display
// unless linear; a THREE.Color is linear), mixing in linear light, the GLSL against the JS, the renderer's output.
const R=require('./r128.js'),T=R.THREE;
global.window=global;global.THREE=T;require('./06-core-khook.js');require('./06b-core-kcolor.js');const C=global.KCOLOR;
let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-12);

// 1. the curves are three's, to the bit (the sky host's lights were convertSRGBToLinear: KCOLOR.lin moves no page)
{let same=true;for(let i=0;i<=255;i++){const c=new T.Color(i/255,i/255,i/255).convertSRGBToLinear();if(C.toLin(i/255)!==c.r)same=false;}
 ok('toLin is three\'s SRGBToLinear bit for bit (all 256 levels)',same,!same);
 let back=true;for(let i=0;i<=255;i++)if(Math.round(C.toSRGB(C.toLin(i/255))*255)!==i)back=false;ok('toSRGB(toLin(c)) round-trips every 8-bit level',back,false);
 const h=0xa8382a,c3=new T.Color(h).convertSRGBToLinear(),k=C.lin('#a8382a');
 ok('lin(\'#a8382a\') is new THREE.Color(0xa8382a).convertSRGBToLinear(), a THREE.Color',k.isColor&&k.r===c3.r&&k.g===c3.g&&k.b===c3.b,false);
 const out=new T.Color();ok('lin into a given Color; a number, a #hex, a 3-digit hex, an array and {r,g,b} agree',C.lin(h,out)===out&&out.equals(c3)&&C.lin('#A8382A').equals(c3)&&C.lin([0xa8/255,0x38/255,0x2a/255]).equals(c3)&&C.lin({r:0xa8/255,g:0x38/255,b:0x2a/255}).equals(c3)&&C.lin('#fff').equals(new T.Color(1,1,1)),false);}

// 2. the convention: display unless linear; a THREE.Color is linear already
{const c=new T.Color(0.5,0.25,0.125);
 ok('a THREE.Color is taken as linear (no second decode)',C.linArr(c).join()===[0.5,0.25,0.125].join(),C.linArr([0.5,0.25,0.125]).join()===[0.5,0.25,0.125].join());
 ok('o.linear: a hex or an array already linear passes through',C.linArr([0.5,0.5,0.5],{linear:true})[0]===0.5&&near(C.linArr(0x808080,{linear:true})[0],128/255),false);
 ok('a display mid grey is about 0.216 linear (why a display hex used as linear reads pale)',near(C.linArr('#808080')[0],0.2158605,1e-6),false);
 let threw=0;for(const x of [null,'#12345','blue',{}])try{C.rgb(x);}catch(e){threw++;}ok('a thing that is not a colour throws',threw===4,threw!==4);}

// 3. mixing in linear light: the halfway of black and white is linear 0.5 (display 0.735), not display 0.5
{const m=C.mix('#000000','#ffffff',.5);ok('mix in linear light',near(m[0],.5)&&near(C.toSRGB(m[0]),0.7353569830524495,1e-5),near(m[0],C.toLin(.5)));
 ok('hex: linear back to a display hex',C.hex(C.linArr(0xa8382a))===0xa8382a&&C.hex([1,1,1])===0xffffff,false);
 ok('lum: Rec. 709 weights on linear',near(C.lum([1,1,1]),1)&&near(C.lum([0,1,0]),.7152),false);
 ok('vec3: a linear GLSL literal',C.vec3('#ffffff')==='vec3(1.0,1.0,1.0)'&&C.vec3([0.5,0.5,0.5],{linear:true})==='vec3(0.5,0.5,0.5)',false);}

// 4. the GLSL agrees with the JS (evaluated by hand on the formulas' terms) and is guarded
{const lin=c=>c<0.04045?c*0.0773993808:Math.pow(c*0.9478672986+0.0521327014,2.4);   /* the GLSL's mix(step) form */
 const glsl=C.GLSL;ok('GLSL: srgbToLinear has the JS constants, sampleSRGB decodes rgb and keeps alpha, a guard',/0\.0773993808/.test(glsl)&&/0\.9478672986/.test(glsl)&&/0\.04045/.test(glsl)&&/vec4\(srgbToLinear\(s\.rgb\),s\.a\)/.test(glsl)&&/#ifndef KCOLOR_GLSL/.test(glsl)&&lin(.3)===C.toLin(.3),false);
 const sh=R.shader('standard');C.include(sh);C.include(sh);
 ok('include: once per stage',(sh.fragmentShader.match(/#define KCOLOR_GLSL/g)||[]).length===1&&(sh.vertexShader.match(/#define KCOLOR_GLSL/g)||[]).length===1,false);}

// 5. the renderer: sRGB out, the tone mapping, the exposure; a bad exposure is ignored, a bad tone throws
{const r={};C.output(r,{exposure:.8});const rep=C.report(r);
 ok('output: sRGB, ACES by default, the exposure; report reads it back',r.outputEncoding===T.sRGBEncoding&&r.toneMapping===T.ACESFilmicToneMapping&&rep.output==='sRGB'&&rep.tone==='aces'&&rep.exposure===.8,false);
 C.exposure(r,NaN);let t=null;try{C.output(r,{tone:'filmic'});}catch(e){t=e;}ok('exposure ignores NaN; an unknown tone throws',r.toneMappingExposure===.8&&!!t,!t);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
