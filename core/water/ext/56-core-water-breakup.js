// ================================================================= WATER - ext: breakup (natural ripples on open and still water)
// [draw] + [G shader], with its CPU twin. Needs 20, 22 (W.hash2), 50 and 51; core/atmos bound (atmWaveT). Opt-in by path. Nothing runs at load time.
//
// A lake with only its few trochoids (field 0) or a pool with still water's three cosine ripples shades in regular stripes: the sun's glint
// lines up into a grid (the owner, 2026-10-27, eastabyss's salt lake). The breakup changes the shading normal only (the surface, its heights
// and the twins of the kinds are as they were):
//   - an ENVELOPE: the surface's own slope times a slow noise between env[0] and env[1] (`envSize` m), so the swell's stripes come and go in
//     patches, as wave groups do;
//   - CHOP: two octaves of value noise (`size` m, then half) as a slope of `amp`, drifting with `drift` [x, z] m/s and cross-faded over two
//     phases (whole cycles per wave period, as the rivers' ripples are), so it never jumps when the clock wraps.
//   WATER.BREAKUP  the defaults {amp: .05, size: 4, env: [.35, 1.3], envSize: 38, drift: [.35, .22], cycle: 7}
//   WATER.breakupGLSL(B)  wtrBreakup(vec3 n, vec2 p) -> the normal (world space) with the breakup; twin WATER.breakup(n, x, z, t, B)
//   WATER.breakupOn(material, B)  patches a water material made by WATER.draw, drawStill or stillMaterial (it finds the world position
//        varying: vWtrP for open water, vWtrW for still): the world normal is taken back from the view normal, broken up and put back.
//        Idempotent; its program key changes only for the materials patched
//   WATER.breakupAll(B)  every open and still drawing WATER.drawn holds (not the rivers: their ripples are advected along the current)
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf,fr=x=>x-Math.floor(x);
 W.BREAKUP={amp:.05,size:4,env:[.35,1.3],envSize:38,drift:[.35,.22],cycle:7};
 const opt=B=>Object.assign({},W.BREAKUP,B&&typeof B==='object'?B:{});
 const cyc=B=>Math.max(1,Math.round(W.period()/B.cycle));
 // value noise on W.hash2 (the shaders' hash), smoothstep-interpolated, and its slope by central differences (e = .35 of a cell)
 const vn=(x,z)=>{const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j,a=u*u*(3-2*u),b=v*v*(3-2*v);
  return(W.hash2(i,j)*(1-a)+W.hash2(i+1,j)*a)*(1-b)+(W.hash2(i,j+1)*(1-a)+W.hash2(i+1,j+1)*a)*b;};
 const grad=(x,z,s)=>{const e=.35,q=1/s;return[(vn((x+e*s)*q,z*q)-vn((x-e*s)*q,z*q))/(2*e),(vn(x*q,(z+e*s)*q)-vn(x*q,(z-e*s)*q))/(2*e)];};
 const chop=(x,z,B)=>{const a=grad(x,z,B.size),b=grad(x+17.3,z-9.1,B.size/2);return[a[0]+.5*b[0],a[1]+.5*b[1]];};
 // FLOWS (2026-10-27, the owner: a zigzag on eastabyss's stream): a ribbon's ripple is four cosines at fixed angles to its current, and
 // where they cross they read as a herringbone. With v (the current, m/s: the ribbon's vWtrF) the chop drifts WITH the water instead of
 // `drift`, and BREAKUP_FLOW's envelope dims the regular ripple to patches, so the advected noise carries the surface
 W.BREAKUP_FLOW={amp:.07,size:2.6,env:[.15,.8],envSize:22,cycle:7};
 W.breakup=(n,x,z,t,Bo,v)=>{const B=opt(Bo),per=W.period(),c=cyc(B),T=per/c,p0=fr(t*c/per),p1=fr(p0+.5),w0=1-Math.abs(2*p0-1),dr=v||B.drift;
  let sx=-n[0]/n[1],sz=-n[2]/n[1];const e=B.env[0]+(B.env[1]-B.env[0])*vn(x/B.envSize+3.7,z/B.envSize-1.3);sx*=e;sz*=e;
  const g0=chop(x-dr[0]*p0*T,z-dr[1]*p0*T,B),g1=chop(x-dr[0]*p1*T+5.3,z-dr[1]*p1*T+2.9,B);
  sx+=B.amp*(g0[0]*w0+g1[0]*(1-w0));sz+=B.amp*(g0[1]*w0+g1[1]*(1-w0));const l=Math.hypot(sx,1,sz);return[-sx/l,1/l,-sz/l];};
 W.breakupGLSL=Bo=>{const B=opt(Bo),per=W.period(),c=cyc(B),T=per/c,s1=1/B.size,s2=2/B.size;
  return['float wtrBkH(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'float wtrBkN(vec2 p){vec2 i=floor(p);vec2 u=p-i;vec2 a=u*u*(3.0-2.0*u);return mix(mix(wtrBkH(i),wtrBkH(i+vec2(1.0,0.0)),a.x),mix(wtrBkH(i+vec2(0.0,1.0)),wtrBkH(i+vec2(1.0,1.0)),a.x),a.y);}',
   'vec2 wtrBkG(vec2 p,float q,float s){float e=0.35*s;return vec2(wtrBkN(vec2(p.x+e,p.y)*q)-wtrBkN(vec2(p.x-e,p.y)*q),wtrBkN(vec2(p.x,p.y+e)*q)-wtrBkN(vec2(p.x,p.y-e)*q))/0.7;}',
   'vec2 wtrBkC(vec2 p){return wtrBkG(p,'+f(s1)+','+f(B.size)+')+0.5*wtrBkG(p+vec2(17.3,-9.1),'+f(s2)+','+f(B.size/2)+');}',
   'vec3 wtrBreakupV(vec3 n,vec2 p,vec2 d){float p0=fract(atmWaveT*'+f(c/per)+');float p1=fract(p0+0.5);float w0=1.0-abs(2.0*p0-1.0);vec2 s=-n.xz/n.y;'+
    's*='+f(B.env[0])+'+'+f(B.env[1]-B.env[0])+'*wtrBkN(vec2(p.x*'+f(1/B.envSize)+'+3.7,p.y*'+f(1/B.envSize)+'-1.3));'+
    'd*='+f(T)+';s+='+f(B.amp)+'*(wtrBkC(p-d*p0)*w0+wtrBkC(p-d*p1+vec2(5.3,2.9))*(1.0-w0));'+
    'return normalize(vec3(-s.x,1.0,-s.y));}',
   'vec3 wtrBreakup(vec3 n,vec2 p){return wtrBreakupV(n,p,vec2('+f(B.drift[0])+','+f(B.drift[1])+'));}',
   'vec3 wtrBreakupF(vec3 n,vec2 p,vec2 v){return wtrBreakupV(n,p,v);}'].join('\n');};
 W.breakupOn=(mat,Bo)=>{if(!mat||mat.userData.wtrBreakup)return mat;const ch=W.breakupGLSL(Bo),ob=mat.onBeforeCompile,ok=mat.customProgramCacheKey;mat.userData.wtrBreakup=true;
  /* the world position varying: open water's vWtrP, still water's vWtrW; a ribbon (or a confluence) also carries its current vWtrF, and its
     chop drifts with it (wtrBreakupF) */
  mat.onBeforeCompile=(sh,r)=>{ob.call(mat,sh,r);const fs=sh.fragmentShader,P=/varying vec2 vWtrP\b/.test(fs)?'vWtrP':/varying vec3 vWtrW\b/.test(fs)?'vWtrW.xz':null;if(!P)return;
   const call=/varying vec2 vWtrF\b/.test(fs)&&P==='vWtrW.xz'?'wtrBreakupF(wtrBn,vWtrW.xz,vWtrF)':'wtrBreakup(wtrBn,'+P+')';
   const at=fs.includes('#include <normal_fragment_maps>')?'#include <normal_fragment_maps>':'#include <emissivemap_fragment>';
   /* the chunk goes just before main, after every declaration the drawing added (its clock, atmWaveT, comes in with atmos_waves wherever the
      drawing put it; first after <common> it ran before that and failed to compile: silently, the mesh just stops drawing); declared here
      only if the fragment has no clock at all */
   const clk=/#include <atmos_waves>|uniform\s+float\s+atmWaveT\b/.test(fs)?'':'uniform float atmWaveT;\n';const A=typeof ATMOS!=='undefined'?ATMOS:null;if(clk&&A&&A.waveUniforms)A.waveUniforms(sh.uniforms);
   sh.fragmentShader=fs.replace(/void\s+main\s*\(/,m=>clk+ch+'\n'+m).replace(at,'{vec3 wtrBn=(vec4(normal,0.0)*viewMatrix).xyz;normal=normalize((viewMatrix*vec4('+call+',0.0)).xyz);}\n'+at);};
  mat.customProgramCacheKey=()=>ok.call(mat)+'|bk:'+W.hashStr(ch);mat.needsUpdate=true;return mat;};
 W.breakupAll=Bo=>{let n=0;for(const D of W.drawn||[]){const k=D.S&&D.S.kind;if((k==='open'||k==='still')&&D.material){W.breakupOn(D.material,Bo);n++;}}return n;};
 // AUTO (2026-10-27, the core pass): WATER.BREAKUP_AUTO (false) set true before a page draws its water, and every drawing made after takes the
 // breakup as it is made: open and still water (draw, drawStill, stillMaterial, drawPools) with BREAKUP, ribbons and confluences (drawFlow,
 // drawConfluence) with BREAKUP_FLOW; a drawing's own o.breakup (an object) is laid over those numbers, o.breakup: false keeps it out. The
 // default stays false until the all-builds rebuild flips it (TODO.md, "Ride along with the next all-builds rebuild"): it moves every page.
 W.BREAKUP_AUTO=false;
 W.breakupWrap=()=>{const one=(name,arg,flow)=>{const f0=W[name];if(typeof f0!=='function'||f0._bk)return;
   const f1=function(){const D=f0.apply(this,arguments),o=arguments[arg]||{};if(W.BREAKUP_AUTO&&D&&o.breakup!==false){const m=D.material&&D.material.onBeforeCompile?D.material:D.onBeforeCompile?D:null;
     if(m)W.breakupOn(m,Object.assign({},flow?W.BREAKUP_FLOW:{},o.breakup&&typeof o.breakup==='object'?o.breakup:{}));}return D;};
   f1._bk=1;W[name]=f1;};
  one('draw',1,false);one('drawStill',1,false);one('stillMaterial',0,false);one('drawPools',1,false);one('drawFlow',1,true);one('drawConfluence',1,true);};
 W.breakupWrap();   /* (call again after loading a drawing fragment listed after this one: it wraps what is new, once) */
 // every river ribbon and confluence WATER.drawn holds, with BREAKUP_FLOW's numbers (B over them)
 W.breakupFlows=Bo=>{let n=0;const B=Object.assign({},W.BREAKUP_FLOW,Bo||{});for(const D of W.drawn||[]){if(((D.S&&D.S.kind==='flow')||D.C)&&D.material){W.breakupOn(D.material,B);n++;}}return n;};
})();
