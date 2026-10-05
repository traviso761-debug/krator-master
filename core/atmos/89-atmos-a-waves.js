// ================================================================= ATMOS - waves: the open-water wave field, one GLSL chunk and its JS twin
// Ported from World of ClaudeCraft (MIT; src/render/water_wave_core.ts and the water shader that reads it). Three families
// of travelling waves (PRESETS.waves): the CHOP (12-21 m) shades the water near the camera, the MID waves (44-70 m) shade it
// out to a kilometre, the SWELL (150-180 m) is long enough for a coarse water mesh to displace. A slow GROUP envelope gathers
// them into sets (a running set, then a near-glassy lull) and a slow WARP bends every crest line, so open water neither
// reads as one corduroy sheet nor interferes on a fixed lattice. group takes three waves and warp two; the families any number.
// ONE SEAMLESS CLOCK: the shaders read ATMOS.U.waveTime, the module clock wrapped at PRESETS.waves.period. Every wave runs a
// whole number of cycles per period, so the wrap is exact and phases never grow (fp32 sin() goes steppy on long sessions).
// A HOST'S WATER SHADER: after ATMOS.init, ATMOS.waveUniforms(material.uniforms) adds atmWaveT (the shared clock) and
// atmWaveAmp. Both stages then `#include <atmos_waves>` at the top (init registers the ShaderChunk; three.js resolves it when
// the material first compiles, so a material made before the atmos fragments is fine) and call
//   atmWaveHeight(xz, chopW)       metres to add to position.y: the swell, plus the chop where chopW > 0 (a fine mesh only)
//   atmWaveSlope(xz, camDist)      vec3: (dh/dx, dh/dz) for shading, every family faded by camera distance; .z the crest
//                                  height, 0.5 = still water (whitecaps, the light through a crest)
//   atmWaveNormal(xz, camDist, k)  the shading normal, its tilt scaled by k (0..1: a depth or shore fade)
// JS twin: ATMOS.waveHeight(x,z,t,chopW) and ATMOS.waveSlope(x,z,t,camDist) compute the same field (boats, buoys, tests).
// Engine-neutral: no browser API. Godot: the chunk becomes a .gdshaderinc ([G shader]) and the presets carry the numbers.
(function(){const A=ATMOS,TAU=Math.PI*2;
 // a wave in TURNS: [kx/TAU, kz/TAU, c/period], so phase = TAU*(fract(x*k0)+fract(z*k1)+fract(t*k2)). Each fract drops a
 // whole number of turns from its own term, which leaves sin and cos unchanged and keeps every argument small.
 const turns=w=>[w[0]/TAU,w[1]/TAU,w[2]/A.PRESETS.waves.period];
 const fr=x=>x-Math.floor(x),ph=(x,z,t,k)=>TAU*(fr(x*k[0])+fr(z*k[1])+fr(t*k[2]));
 A.waveWrap=t=>{const p=A.PRESETS.waves.period;return(t%p+p)%p;};
 const warp=(x,z,t)=>{const P=A.PRESETS.waves,a=ph(x,z,t,turns(P.warp[0])),b=ph(x,z,t,turns(P.warp[1]));
  return[x+P.warpAmp*(Math.sin(a)+.6*Math.cos(b)),z+P.warpAmp*(Math.sin(b)-.6*Math.cos(a))];};
 const group=(x,z,t)=>{const G=A.PRESETS.waves.group;
  return .52+.48*Math.sin(ph(x,z,t,turns(G[0])))*(.62*Math.sin(ph(x,z,t,turns(G[1])))+.38*Math.sin(ph(x,z,t,turns(G[2]))));};
 // one family at a point, per unit amplitude: [crest, dh/dx, dh/dz]
 const fam=(F,x,z,t)=>{let c=0,sx=0,sz=0;for(const w of F){const p=ph(x,z,t,turns(w));c+=Math.sin(p)*w[3];sx+=Math.cos(p)*w[3]*w[0];sz+=Math.cos(p)*w[3]*w[1];}return[c,sx,sz];};
 A.waveHeight=(x,z,t,chopW)=>{const P=A.PRESETS.waves,G=P.gain,M=P.groupMix;t=A.waveWrap(t);const q=warp(x,z,t),g=group(q[0],q[1],t);
  let h=fam(P.swell,q[0],q[1],t)[0]*P.amp*G.swell*(M.swell[0]+M.swell[1]*g);
  if(chopW>0)h+=fam(P.chop,x,z,t)[0]*P.amp*G.chop*chopW*(M.chop[0]+M.chop[1]*g);return h;};
 A.waveSlope=(x,z,t,d)=>{const P=A.PRESETS.waves;t=A.waveWrap(t);const w={},out=[0,0,0];let any=false;
  for(const f of['chop','mid','swell']){w[f]=1-A.ss(P.fade[f][0],P.fade[f][1],d);if(w[f]>P.skip)any=true;}
  if(any){const q=warp(x,z,t),g=group(q[0],q[1],t);
   for(const f of['chop','mid','swell'])if(w[f]>P.skip){const r=f==='chop'?fam(P.chop,x,z,t):fam(P[f],q[0],q[1],t),M=P.groupMix[f],C=P.crestMix[f],k=P.amp*P.gain[f]*w[f]*(M[0]+M[1]*g);
    out[0]+=r[1]*k;out[1]+=r[2]*k;out[2]+=r[0]*w[f]*(C[0]+C[1]*g);}}
  out[2]=out[2]*P.crestNorm*.5+.5;return out;};
 // THE CHUNK, written from the presets so it computes what the twin above does
 A.waveGLSL=()=>{const P=A.PRESETS.waves,f=A.glf,v3=w=>{const k=turns(w);return'vec3('+k.map(f).join(',')+')';};
  const famFn=(name,F)=>'vec3 '+name+'(vec2 p){vec3 r=vec3(0.0);'+F.map(w=>'atmWaveAdd(p,'+v3(w)+','+f(w[3])+',r);').join('')+'return r;}';
  const mix=(f2,a)=>'('+f(a[0])+'+'+f(a[1])+'*g)';
  const term=(n,fn,pt)=>'if(w'+n+'>'+f(P.skip)+'){r='+fn+'('+pt+');s+=r.yz*atmWaveAmp*'+f(P.gain[n])+'*w'+n+'*'+mix(0,P.groupMix[n])+';c+=r.x*w'+n+'*'+mix(0,P.crestMix[n])+';}';
  const fade=n=>'float w'+n+'=1.0-smoothstep('+f(P.fade[n][0])+','+f(P.fade[n][1])+',d);';
  return['uniform float atmWaveT;uniform float atmWaveAmp;',
   'float atmWavePh(vec2 p,vec3 k){return 6.283185307*(fract(p.x*k.x)+fract(p.y*k.y)+fract(atmWaveT*k.z));}',
   'void atmWaveAdd(vec2 p,vec3 k,float a,inout vec3 r){float q=atmWavePh(p,k);r.x+=sin(q)*a;r.yz+=cos(q)*a*k.xy*6.283185307;}',
   'vec2 atmWaveWarp(vec2 p){float a=atmWavePh(p,'+v3(P.warp[0])+'),b=atmWavePh(p,'+v3(P.warp[1])+');return p+'+f(P.warpAmp)+'*vec2(sin(a)+0.6*cos(b),sin(b)-0.6*cos(a));}',
   'float atmWaveGroup(vec2 q){return 0.52+0.48*sin(atmWavePh(q,'+v3(P.group[0])+'))*(0.62*sin(atmWavePh(q,'+v3(P.group[1])+'))+0.38*sin(atmWavePh(q,'+v3(P.group[2])+')));}',
   famFn('atmWaveChop',P.chop),famFn('atmWaveMid',P.mid),famFn('atmWaveSwell',P.swell),
   'float atmWaveHeight(vec2 p,float chopW){vec2 q=atmWaveWarp(p);float g=atmWaveGroup(q);float h=atmWaveSwell(q).x*atmWaveAmp*'+f(P.gain.swell)+'*'+mix(0,P.groupMix.swell)+';',
   ' if(chopW>0.0)h+=atmWaveChop(p).x*atmWaveAmp*'+f(P.gain.chop)+'*chopW*'+mix(0,P.groupMix.chop)+';return h;}',
   'vec3 atmWaveSlope(vec2 p,float d){'+fade('chop')+fade('mid')+fade('swell')+'vec2 s=vec2(0.0);float c=0.0;',
   ' if(wchop>'+f(P.skip)+'||wmid>'+f(P.skip)+'||wswell>'+f(P.skip)+'){vec2 q=atmWaveWarp(p);float g=atmWaveGroup(q);vec3 r;',
   '  '+term('chop','atmWaveChop','p')+term('mid','atmWaveMid','q')+term('swell','atmWaveSwell','q')+'}',
   ' return vec3(s,c*'+f(P.crestNorm)+'*0.5+0.5);}',
   'vec3 atmWaveNormal(vec2 p,float d,float k){vec3 w=atmWaveSlope(p,d);return normalize(vec3(-w.x*'+f(P.tilt)+'*k,1.0,-w.y*'+f(P.tilt)+'*k));}'].join('\n');};
 A.waveUniforms=u=>{u.atmWaveT=A.U.waveTime;u.atmWaveAmp=A.U.waveAmp;return u;};
 A.onInit.push(h=>{A.U.waveTime={value:0};A.U.waveAmp={value:A.PRESETS.waves.amp};
  if(A.T.ShaderChunk)A.T.ShaderChunk.atmos_waves=A.waveGLSL();
  A.hook(t=>{A.U.waveTime.value=A.waveWrap(t);});});
})();
