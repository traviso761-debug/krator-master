// ================================================================= WATER - ext: a tint field that moves (the plume; 2026-11-02, the owner on swlowlands' delta: "swirl and mix with the clearer water")
// [G data] + [G shader]. Opt-in by path, after 20, 50 (tools/fragment_needs.json). An open surface's tint field (20: WATER.open({tint})) is laid once; with
// WATER.open({tint, tintFlow}) it is carried on a slow current: the field is read upstream along a velocity field plus a curl-noise swirl, in two phases half a
// cycle apart that cross-fade (the flow-map method: Vlachos, "Water Flow in Portal 2", 2010), so a river's silt fans out from its mouths in eddies and tongues
// and keeps moving, and is broken into filaments by a noise carried with it. Driven by the flow given, never painted. A surface without tintFlow is drawn as before:
// 50's text changes only behind S.tintFlow, and without this fragment on the page a tintFlow is ignored.
//   tintFlow: {v(x, z) -> [vx, vz] m/s | null (the current: a river's mouths outward, a longshore drift), cell (m, the tint's), period (s, 60: one phase's run),
//              swirl (m/s, .12: the curl noise's speed), scale (m, 140: the eddies' size), evolve (.8: how far the eddies wander, in noise cells, round one loop a wave
//              period, so they change shape and never pop at the clock's wrap), fil (0..1, .45: how much the filaments break the plume), filScale (m, 30)}
// A flow map keeps a steady current's mean picture still by design (Vlachos): the motion is the detail carried downstream and the eddies turning over
//   WATER.tintFlowAt(S, x, z, t) -> [r, g, b, a] premultiplied, the shader's twin (t: seconds on the module clock; the shader reads atmWaveT, wrapped as W.period())
//   WATER.tintFlowGLSL(S), WATER.tintFlowTexture(S, THREE): what 50 asks for when S.tintFlow is set
(function(){const W=WATER,cl=(x,a,b)=>x<a?a:x>b?b:x,fr=x=>x-Math.floor(x),glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};
 // Dave Hoskins' hash (no sine), value noise with a smoothstep blend: the same numbers in JS and GLSL
 W.plumeHash=(x,y)=>{let a=fr(x*.1031),b=fr(y*.1031),c=fr(x*.1031);const d=a*(b+33.33)+b*(c+33.33)+c*(a+33.33);a+=d;b+=d;c+=d;return fr((a+b)*c);};
 W.plumeNoise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),f=x-i,g=y-j,u=f*f*(3-2*f),v=g*g*(3-2*g),H=W.plumeHash;
  const a=H(i,j),b=H(i+1,j),c=H(i,j+1),d=H(i+1,j+1);return(a+(b-a)*u)+((c+(d-c)*u)-(a+(b-a)*u))*v;};
 const opts=o=>Object.assign({cell:16,period:60,swirl:.12,scale:140,evolve:.8,fil:.45,filScale:30},o);
 // the current baked to bytes over the tint's box: RG = 128 + 127 * v / vmax, B 0, A 255
 W.bakeTintFlow=S=>{if(S.tintFlowB)return S.tintFlowB;const T=S.tint,F=opts(S.tintFlow),nx=T.nx,nz=T.nz,c=T.cell,V=new Float32Array(nx*nz*2);let vmax=1e-6;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const v=F.v?F.v(T.x0+(i+.5)*c,T.z0+(j+.5)*c):null,k=(j*nx+i)*2;if(!v)continue;V[k]=v[0];V[k+1]=v[1];vmax=Math.max(vmax,Math.abs(v[0]),Math.abs(v[1]));}
  const data=new Uint8Array(nx*nz*4);for(let k=0;k<nx*nz;k++){data[k*4]=Math.round(128+127*V[k*2]/vmax);data[k*4+1]=Math.round(128+127*V[k*2+1]/vmax);data[k*4+3]=255;}
  return S.tintFlowB={x0:T.x0,z0:T.z0,cell:c,nx,nz,data,vmax,F,n:Math.max(1,Math.round(W.period()/F.period))};};
 // the velocity at a point: the baked current (bilinear, as the GPU filters) plus the curl of the noise (its gradient turned a quarter: no divergence)
 const loop=(F,t)=>{const a=6.283185307*fr(t/W.period());return[F.evolve*Math.cos(a),F.evolve*Math.sin(a)];};
 const curl=(B,x,z,t)=>{const F=B.F,q=1/F.scale,e=.25,N=W.plumeNoise,o=loop(F,t||0),X=x*q+o[0],Z=z*q+o[1];const dx=N(X+e,Z)-N(X-e,Z),dz=N(X,Z+e)-N(X,Z-e);return[F.swirl*dz/(2*e),-F.swirl*dx/(2*e)];};
 W.tintFlowVel=(S,x,z,t)=>{const B=W.bakeTintFlow(S),s=W.tintSample(B,x,z),k=B.vmax*255/127,inb=s[3]>0,cu=curl(B,x,z,t);
  return[(inb?(s[0]-128/255)*k:0)+cu[0],(inb?(s[1]-128/255)*k:0)+cu[1]];};
 // the filaments: the plume's alpha broken by a noise read at the advected point, so the breaks travel with the water
 const filK=(F,x,z)=>1+F.fil*(2*W.plumeNoise(x/F.filScale+7.3,z/F.filScale-3.1)-1);
 const at=(S,F,x,z)=>{const t=W.tintSample(S.tint,x,z),k=filK(F,x,z),a=t[3]*k,m=a>1?k/a:k;return t.map(v=>v*m);};
 W.tintFlowAt=(S,x,z,t)=>{if(!S.tint)return[0,0,0,0];if(!S.tintFlow)return S.tintAt(x,z);const B=W.bakeTintFlow(S),F=B.F,P=W.period()/B.n,w=W.period(),tw=fr(t/w)*w;
  const s0=fr(tw*B.n/w),s1=fr(s0+.5),v=W.tintFlowVel(S,x,z,tw),a=at(S,F,x-v[0]*s0*P,z-v[1]*s0*P),b=at(S,F,x-v[0]*s1*P,z-v[1]*s1*P),wa=1-Math.abs(2*s0-1);
  return a.map((q,i)=>q*wa+b[i]*(1-wa));};
 // the shader: wtrTintFlow(p), after 50's wtrTintAt; the uniform wtrTintV. Its reads are at an explicit LOD (texture2DLodEXT, which three.js maps to textureLod on
 // WebGL2): displaced reads with implicit gradients beside the draw's discards drew the sea black where it should have discarded, on ANGLE's D3D11 (2026-11-02)
 W.tintFlowGLSL=S=>{const B=W.bakeTintFlow(S),F=B.F,f=glf,P=W.period()/B.n,k=B.vmax*255/127;
  return['#ifndef texture2DLodEXT\n#if __VERSION__>=300\n#define texture2DLodEXT textureLod\n#else\n#define texture2DLodEXT texture2DLod\n#endif\n#endif','uniform sampler2D wtrTintV;',
   'float wtrPlH(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
   'float wtrPlN(vec2 p){vec2 i=floor(p);vec2 f=p-i;vec2 u=f*f*(3.0-2.0*f);float a=wtrPlH(i);float b=wtrPlH(i+vec2(1.0,0.0));float c=wtrPlH(i+vec2(0.0,1.0));float d=wtrPlH(i+vec2(1.0,1.0));'+
    'float ab=a+(b-a)*u.x;return ab+((c+(d-c)*u.x)-ab)*u.y;}',
   'vec2 wtrPlV(vec2 p){vec2 uv=(p-vec2('+f(B.x0)+','+f(B.z0)+'))*vec2('+f(1/(B.cell*B.nx))+','+f(1/(B.cell*B.nz))+');vec2 v=vec2(0.0);'+
    'if(uv.x>=0.0&&uv.y>=0.0&&uv.x<=1.0&&uv.y<=1.0)v=(texture2DLodEXT(wtrTintV,uv,0.0).rg-vec2(128.0/255.0))*'+f(k)+';'+
    'float la=6.283185307*fract(atmWaveT*'+f(1/W.period())+');vec2 q=p*'+f(1/F.scale)+'+'+f(F.evolve)+'*vec2(cos(la),sin(la));float dx=wtrPlN(q+vec2(0.25,0.0))-wtrPlN(q-vec2(0.25,0.0));float dz=wtrPlN(q+vec2(0.0,0.25))-wtrPlN(q-vec2(0.0,0.25));'+
    'return v+'+f(F.swirl)+'*vec2(dz,-dx)/0.5;}',
   'vec4 wtrPlTint(vec2 p){vec2 uv=(p-vec2('+f(S.tint.x0)+','+f(S.tint.z0)+'))*vec2('+f(1/(S.tint.cell*S.tint.nx))+','+f(1/(S.tint.cell*S.tint.nz))+');'+
    'if(uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)return vec4(0.0);return texture2DLodEXT(wtrTint,uv,0.0);}',
   'vec4 wtrPlAt(vec2 p){vec4 t=wtrPlTint(p);float k=1.0+'+f(F.fil)+'*(2.0*wtrPlN(p/'+f(F.filScale)+'+vec2(7.3,-3.1))-1.0);float a=t.a*k;return t*(a>1.0?k/a:k);}',
   'vec4 wtrTintFlow(vec2 p){float s0=fract(atmWaveT*'+f(B.n/W.period())+');float s1=fract(s0+0.5);vec2 v=wtrPlV(p)*'+f(P)+';'+
    'float wa=1.0-abs(2.0*s0-1.0);return wtrPlAt(p-v*s0)*wa+wtrPlAt(p-v*s1)*(1.0-wa);}'].join('\n');};
 W.tintFlowTexture=(S,T)=>{const B=W.bakeTintFlow(S),tx=new T.DataTexture(B.data,B.nx,B.nz,T.RGBAFormat,T.UnsignedByteType);tx.minFilter=tx.magFilter=T.LinearFilter;
  tx.wrapS=tx.wrapT=T.ClampToEdgeWrapping;tx.generateMipmaps=false;tx.flipY=false;tx.needsUpdate=true;return tx;};
})();
