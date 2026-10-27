// ================================================================= CORE — strata, the three.js half (core/terrain/STRATA-PLAN.md)
// [G shader] The shader for every surface that shows bedded rock, on the data half's records (35-core-strata.js, KSTRATA:
// load it and core/rand first). Two paths behind today's API (S.uniforms, S.parsVertex, S.vertex, S.parsFragment with
// strataColor(vec3 wp, vec3 wn), S.inject(shader), S.colorAt(y) as a THREE.Color, S.beds, S.columnM):
//
//   BIO.strata(opt)       with no recipe, formations or strata in opt: TODAY'S SHADER, character for character (the
//                         canyon column from KSTRATA's legacy beds, which are BIO.strata's own, the canvas noise warp),
//                         so a page that moves onto the core path draws the same pixels. Needs the biome core (BIO.fn,
//                         BIO.canvasTex). The first call without opt.private is kept and returned to later calls
//   BIO.strata({recipe | formations | strata, ...KSTRATA.create's options, cap, foot, dust, res, varnish})
//   KSTRATA.shade(S | opt, {THREE, cap, foot, dust, res, varnish})
//                         THE CORE PATH: the stack's column baked to two RGBA8 textures (res m per texel, .25 by default,
//                         at most 262144 texels) and the warp, dip, fold and faults computed in the shader from the same
//                         lattice table as S.yy (an RGBA8 texture read at texel centres), so the bed the GPU draws is the
//                         bed S.at reports. Adds S.at, S.hardnessAt, S.yy, S.terrace and S.strata (the data stack).
//                         Effects by recipe fx: cross-bedding (per kind), desert varnish (per kind; varnish: a colour
//                         multiplier), the iridescent opal-shell beds (ringfold), Liesegang bands on hard beds (pillar),
//                         columnar joints in thick hard flows (tibasalt-ponded), impact-glass flecks in the matrix
//                         (megabreccia); the alteration (palagonite, laterite) under its line. The ilmenite sheen is the
//                         page's material (roughness, metalness), not a colour. One blocks formation and one alteration
//                         line per shader (the first of each in the stack). `#define KSTRATA_RAW` before the include makes
//                         strataColor return the bed's own colour (sRGB, no effects): the GPU-against-S.at check
(function(root){
  'use strict';
  var K=root.KSTRATA;
  function three(o){return (o&&o.THREE)||(root.BIO&&root.BIO.host&&root.BIO.host.THREE)||root.THREE;}

  // ---- today's shader (biomes/sedesert/src/35-core-strata.js), its column now from KSTRATA
  function legacy(opt){var T=BIO.host.THREE,F=BIO.fn;
   var seed=opt.seed==null?4711:opt.seed,colM=opt.columnM==null?180:opt.columnM,N=1024;
   var beds=K.create({seed:seed,legacy:{columnM:colM,palette:opt.palette}}).beds.map(function(b){return {y0:b.y0,th:b.th,kind:b.kind,c:new T.Color(b.colour[0],b.colour[1],b.colour[2])};});
   var c=document.createElement('canvas');c.width=1;c.height=N;var g=c.getContext('2d'),id=g.createImageData(1,N);
   var c2=document.createElement('canvas');c2.width=1;c2.height=N;var g2=c2.getContext('2d'),id2=g2.createImageData(1,N);
   for(var i=0;i<N;i++){var yy=(i+.5)/N*colM,b=beds[beds.length-1];for(var qi=0;qi<beds.length;qi++){var q=beds[qi];if(yy<q.y0+q.th){b=q;break;}}
    var f=(yy-b.y0)/b.th,edge=Math.min(f*b.th,(1-f)*b.th);
    var k=1-.1*F.smooth(.25,0,edge);
    if(b.kind==='sand')k*=.94+.1*f;
    var o=(N-1-i)*4;id.data[o]=Math.min(255,b.c.r*255*k);id.data[o+1]=Math.min(255,b.c.g*255*k);id.data[o+2]=Math.min(255,b.c.b*255*k);
    id.data[o+3]=b.kind==='sand'?255:b.kind==='bleach'?200:b.kind==='mud'?120:60;
    id2.data[o]=Math.round(f*255);id2.data[o+1]=b.kind==='sand'||b.kind==='bleach'?255:90;id2.data[o+2]=0;id2.data[o+3]=255;}
   g.putImageData(id,0,0);g2.putImageData(id2,0,0);
   var col=new T.CanvasTexture(c);col.wrapS=T.ClampToEdgeWrapping;col.wrapT=T.RepeatWrapping;col.magFilter=T.LinearFilter;col.minFilter=T.LinearFilter;col.generateMipmaps=false;col.encoding=T.sRGBEncoding;
   var bedT=new T.CanvasTexture(c2);bedT.wrapS=T.ClampToEdgeWrapping;bedT.wrapT=T.RepeatWrapping;bedT.magFilter=T.NearestFilter;bedT.minFilter=T.NearestFilter;bedT.generateMipmaps=false;
   var nz=BIO.canvasTex(256,256,function(gg,w,h){var d=gg.createImageData(w,h);for(var yy=0;yy<h;yy++)for(var xx=0;xx<w;xx++){var v=F.fbm(xx/32,yy/32,seed%97,4);var o=(yy*w+xx)*4;d.data[o]=d.data[o+1]=d.data[o+2]=Math.round(v*255);d.data[o+3]=255;}gg.putImageData(d,0,0);});
   nz.wrapS=nz.wrapT=T.RepeatWrapping;nz.encoding=T.LinearEncoding;
   var dip=opt.dip||[.6,.8,.012],warp=opt.warp||[9,2.2];
   var cap=opt.cap||[1e5,1e5+1],dust=new T.Color(opt.dust||0xc9a27e).convertSRGBToLinear();
   var uniforms={uSBed:{value:bedT},uSCap:{value:new T.Vector2(cap[0],cap[1])},uSFoot:{value:opt.foot===undefined?-1e5:opt.foot},uSDust:{value:new T.Vector3(dust.r,dust.g,dust.b)},uSCol:{value:col},uSNz:{value:nz},uSColH:{value:colM},uSDip:{value:new T.Vector3(dip[0],dip[1],dip[2])},uSWarp:{value:new T.Vector2(warp[0],warp[1])}};
   var parsVertex='varying vec3 vSWP;varying vec3 vSWN;';
   var vertex='vSWP=(modelMatrix*vec4(transformed,1.0)).xyz;vSWN=normalize(mat3(modelMatrix)*objectNormal);';
   var parsFragment=['varying vec3 vSWP;varying vec3 vSWN;uniform sampler2D uSCol,uSNz,uSBed;uniform float uSColH,uSFoot;uniform vec2 uSCap;uniform vec3 uSDust;uniform vec3 uSDip;uniform vec2 uSWarp;',
    'vec3 strataColor(vec3 wp,vec3 wn){',
    ' wn=normalize(wn);',
    ' float w1=texture2D(uSNz,wp.xz*0.0019).r-0.5,w2=texture2D(uSNz,wp.xz*0.0087+0.37).r-0.5;',
    ' float yy=wp.y+w1*uSWarp.x+w2*uSWarp.y+dot(wp.xz,uSDip.xy)*uSDip.z;',
    ' vec4 bed=texture2D(uSCol,vec2(0.5,yy/uSColH));bed.rgb=pow(bed.rgb,vec3(2.2));',
    ' vec2 fp=abs(wn.x)>abs(wn.z)?vec2(wp.z,wp.y):vec2(wp.x,wp.y);',
    ' float lam=0.95+0.05*sin(yy*5.1+w2*31.0);',
    ' float xb=texture2D(uSNz,vec2(fp.x*0.06+yy*0.09,yy*0.55)).r;',
    ' xb=mix(1.0,0.9+0.18*smoothstep(0.3,0.8,fract(xb*4.0)),bed.a);',
    ' vec3 c=bed.rgb*lam*xb;',
    ' vec4 bi=texture2D(uSBed,vec2(0.5,yy/uSColH));',
    ' float iv=texture2D(uSNz,vec2(dot(wp.xz,vec2(0.0061,0.0043)),yy*0.0137)).r,ib=texture2D(uSNz,vec2(dot(wp.xz,vec2(-0.0047,0.0069))+0.5,yy*0.029)).r;',
    ' c*=mix(vec3(1.09,0.97,0.88),vec3(0.92,0.98,1.07),smoothstep(0.3,0.7,iv))*(0.9+0.2*ib);',
    ' float cp=smoothstep(uSCap.x,uSCap.y,yy);c=mix(c,c*vec3(1.2,1.14,1.06)+vec3(0.05,0.042,0.03),cp*0.6);',
    ' float steep=1.0-abs(wn.y);',
    ' float s1=texture2D(uSNz,vec2(fp.x*0.21,wp.y*0.004+w1*0.15)).r,s2=texture2D(uSNz,vec2(fp.x*0.071+0.3,wp.y*0.002)).r;',
    ' float hang=mix(0.3,1.0,bi.r*bi.r)*bi.g;',
    ' float vn=max(smoothstep(0.6,0.78,s1)*0.8,smoothstep(0.62,0.85,s2))*hang*steep*steep;',
    ' c=mix(c,c*vec3(0.36,0.3,0.28)+vec3(0.012,0.009,0.008),vn*0.62);',
    ' float up=smoothstep(0.62,0.93,wn.y),ft=smoothstep(uSFoot+5.0,uSFoot+0.5,wp.y);',
    ' c=mix(c,c*1.08+vec3(0.02),up*0.35);c=mix(c,uSDust,clamp(up*0.38+ft*0.45*(1.0+0.8*w2),0.0,0.75));',
    ' return c;}'].join('\n');
   var inject=function(sh){Object.assign(sh.uniforms,uniforms);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+parsVertex).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertex);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+parsFragment);return sh;};
   var colorAt=function(yy){var v=((yy%colM)+colM)%colM;for(var qi=0;qi<beds.length;qi++)if(v<beds[qi].y0+beds[qi].th)return beds[qi].c.clone();return beds[beds.length-1].c.clone();};
   return {uniforms:uniforms,parsVertex:parsVertex,vertex:vertex,parsFragment:parsFragment,inject:inject,colorAt:colorAt,beds:beds,columnM:colM};}

  // ---- the core path
  var GLSL=[
   'varying vec3 vSWP;varying vec3 vSWN;',
   'uniform sampler2D uKSCol,uKSBed,uKSAlt,uKSNz;uniform vec4 uKSCR;uniform float uKSN;uniform vec3 uKSDip;uniform vec2 uKSWarp,uKSWF;',
   'uniform vec4 uKSFold,uKSFold2;uniform vec4 uKSFa[4];uniform vec4 uKSFb[4];uniform float uKSFn;uniform vec2 uKSAl;',
   'uniform vec2 uKSCap;uniform float uKSFoot;uniform vec3 uKSDust;uniform vec4 uKSFx;uniform vec3 uKSVc;',
   'uniform vec4 uKSBk;uniform float uKSBnest,uKSBnc,uKSMcn;uniform float uKSBw[8];uniform float uKSBcn[8];uniform vec3 uKSBc[32];uniform vec3 uKSMc[4];',
   /* the lattice: texel (i,j) of the 64 x 64 table, every channel (k/255, as KSTRATA's tv) */
   /* WebGL2 reads the texel itself (no gradients, so the block loops need not unroll); WebGL1 samples its centre */
   '#if __VERSION__ >= 300',
   'vec4 ksT4(float i,float j){return texelFetch(uKSNz,ivec2(int(mod(i,64.0)),int(mod(j,64.0))),0);}',
   '#else',
   'vec4 ksT4(float i,float j){return texture2D(uKSNz,(vec2(mod(i,64.0),mod(j,64.0))+0.5)/64.0);}',
   '#endif',
   'float ksNoise(vec4 m,float x,float z){float xi=floor(x),zi=floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3.0-2.0*fx),v=fz*fz*(3.0-2.0*fz);',
   ' float a=dot(ksT4(xi,zi),m),b=dot(ksT4(xi+1.0,zi),m),d=dot(ksT4(xi,zi+1.0),m),e=dot(ksT4(xi+1.0,zi+1.0),m);',
   ' float p=a+(b-a)*u,q=d+(e-d)*u;return p+(q-p)*v;}',
   /* S.yy: the warp, the dip, the fold, the faults, in the data half's order */
   'float ksYY(vec3 wp,out float w1){w1=ksNoise(vec4(1,0,0,0),wp.x*uKSWF.x,wp.z*uKSWF.x)-0.5;',
   ' float v=wp.y+w1*uKSWarp.x+(ksNoise(vec4(0,1,0,0),wp.x*uKSWF.y+0.37,wp.z*uKSWF.y+0.37)-0.5)*uKSWarp.y+(wp.x*uKSDip.x+wp.z*uKSDip.y)*uKSDip.z;',
   ' if(uKSFold.w!=0.0){float t=fract(((wp.x-uKSFold2.z)*uKSFold.x+(wp.z-uKSFold2.w)*uKSFold.y)/uKSFold.z+uKSFold2.x);',
   '  float s=1.0-32.0*t*t*(1.0-t)*(1.0-t),tri=4.0*abs(t-0.5)-1.0;v-=uKSFold.w*(s+(tri-s)*uKSFold2.y);}',
   ' for(int i=0;i<4;i++){if(float(i)>=uKSFn)break;vec4 A=uKSFa[i],B=uKSFb[i];float dx=A.z-A.x,dz=A.w-A.y,L=sqrt(dx*dx+dz*dz);',
   '  float s=(dz*(wp.x-A.x)-dx*(wp.z-A.y))/L,m=1.0;',
   '  if(B.z>0.0){float t=((wp.x-A.x)*dx+(wp.z-A.y)*dz)/(L*L);m=clamp(1.0+min(t,1.0-t)*L/B.z,0.0,1.0);}',
   '  v+=B.x*smoothstep(-B.y,B.y,s)*m;}',
   ' return v;}',
   /* the blocks: 27 jittered cells, as KSTRATA's worley */
   'vec4 ksCell(vec3 q,float off){return ksT4(q.x+7.0*q.z+off,q.y+13.0*q.z+off*3.0);}',
   'vec2 ksWorley(vec3 p,float size,float off,out vec3 bc,out vec4 bv){vec3 c=floor(p/size);float d1=1e30,d2=1e30;bc=c;bv=vec4(0.0);',
   ' for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)for(int e=-1;e<=1;e++){vec3 q=c+vec3(float(a),float(b),float(e));vec4 v=ksCell(q,off);',
   '  float d=length((q+0.15+0.7*v.xyz)*size-p);if(d<d1){d2=d1;d1=d;bc=q;bv=v;}else if(d<d2)d2=d;}',
   ' return vec2(d1,d2);}',
   'float ksPick(float u){float tot=0.0;for(int i=0;i<8;i++)tot+=uKSBw[i];float a=u*tot,id=uKSBnc-1.0;bool got=false;',
   ' for(int i=0;i<8;i++){if(!got&&float(i)<uKSBnc){if(a<uKSBw[i]){id=float(i);got=true;}else a-=uKSBw[i];}}return id;}',
   'vec3 ksClast(float id,float u){vec3 c=uKSMc[0];',
   ' if(id<0.0){float j=mod(floor(u*uKSMcn),uKSMcn);for(int k=0;k<4;k++)if(float(k)==j)c=uKSMc[k];return c;}',
   ' float n=1.0;for(int i=0;i<8;i++){if(float(i)==id)n=uKSBcn[i];}float j=id*4.0+mod(floor(u*n),n);',
   ' for(int k=0;k<32;k++)if(float(k)==j)c=uKSBc[k];return c;}',
   'vec3 ksBlock(vec3 p,out float mat){vec3 bc=vec3(0.0);vec4 bv=vec4(0.0);vec2 dd=ksWorley(p,uKSBk.x,11.0,bc,bv);mat=0.0;',
   ' if(dd.y-dd.x<uKSBk.y*uKSBk.x){mat=1.0;return ksClast(-1.0,bv.w);}',
   ' float id=ksPick(bv.w);',
   ' if(id==uKSBnest){dd=ksWorley(p,uKSBk.z,29.0,bc,bv);if(dd.y-dd.x<uKSBk.y*uKSBk.z){mat=1.0;return uKSMc[0];}',
   '  id=ksPick(bv.w);if(id==uKSBnest){id=-1.0;mat=1.0;}}',
   ' vec4 vv=ksCell(bc,23.0);vec3 n=vv.xyz-0.5;float nl=length(n);if(nl<1e-6){n=vec3(0.0,1.0,0.0);nl=1.0;}',
   ' float band=floor(dot(p,n)/nl/uKSBk.w),odd=band-2.0*floor(band/2.0);',
   ' return ksClast(id,vv.w)*(odd>0.5?0.9:1.0);}',
   'vec3 strataColor(vec3 wp,vec3 wn){',
   ' wn=normalize(wn);float w1;float yy=ksYY(wp,w1);',
   ' float idx=clamp(floor((yy-uKSCR.x)/uKSCR.y),0.0,uKSN-1.0);',
   ' vec2 uv=vec2((mod(idx,uKSCR.z)+0.5)/uKSCR.z,(floor(idx/uKSCR.z)+0.5)/uKSCR.w);',
   ' vec4 bed=texture2D(uKSCol,uv),bi=texture2D(uKSBed,uv),al=texture2D(uKSAlt,uv);',
   ' vec2 fp=abs(wn.x)>abs(wn.z)?vec2(wp.z,wp.y):vec2(wp.x,wp.y);vec3 c;',
   ' if(bi.a>0.9){float mat=0.0;c=ksBlock(vec3(wp.x,yy,wp.z),mat);',
   '#ifdef KSTRATA_RAW',
   '  return c;',
   '#endif',
   '  c=pow(c,vec3(2.2));',
   '  float fl=ksNoise(vec4(0,0,0,1),fp.x*0.9+wp.y*0.37,wp.y*0.9+fp.x*0.21);',      /* impact glass: black and bottle-green flecks */
   '  c=mix(c,fl>0.93?vec3(0.012,0.04,0.02):vec3(0.008),mat*uKSFx.w*smoothstep(0.86,0.9,fl));}',
   ' else{if(al.a>0.5&&wp.y<uKSAl.x+uKSAl.y*2.0*w1)bed.rgb=al.rgb;',
   '#ifdef KSTRATA_RAW',
   '  return bed.rgb;',
   '#endif',
   '  c=pow(bed.rgb,vec3(2.2));',
   '  float lam=0.95+0.05*sin(yy*5.1+w1*31.0);',
   '  float xb=ksNoise(vec4(0,0,1,0),fp.x*0.48+yy*0.72,yy*4.4);xb=mix(1.0,0.9+0.18*smoothstep(0.3,0.8,fract(xb*4.0)),bed.a);',
   '  c*=lam*xb;',
   '  if(bi.a>0.3&&bi.a<0.7){float h=fract(fp.x*0.031+yy*0.37+w1*2.0);vec3 rb=0.5+0.5*cos(6.2832*(h+vec3(0.0,0.33,0.67)));c=mix(c,c*(0.6+0.8*rb),0.45);}',
   '  if(uKSFx.z>0.0&&bi.b>0.8){float ls=fract((fp.x+yy)*0.045+ksNoise(vec4(0,0,0,1),fp.x*0.02,yy*0.02)*3.0);',
   '   c=mix(c,c*vec3(0.62,0.38,0.26),smoothstep(0.9,0.97,ls)*0.6*uKSFx.z);}',
   '  if(uKSFx.y>0.0&&bi.b>0.92){float up=step(0.62,bi.r),cw=mix(1.4,0.7,up);',   /* colonnade below, hackly entablature above */
   '   float jx=fract(fp.x/cw+ksNoise(vec4(0,0,1,0),fp.x*0.4,yy*mix(0.05,0.6,up))*mix(0.5,2.0,up));',
   '   c*=1.0-uKSFx.y*0.35*smoothstep(0.07,0.0,min(jx,1.0-jx));}}',
   ' float iv=ksNoise(vec4(0,0,1,0),dot(wp.xz,vec2(0.0488,0.0344)),yy*0.11),ib=ksNoise(vec4(0,0,0,1),dot(wp.xz,vec2(-0.0376,0.0552))+4.0,yy*0.232);',
   ' c*=mix(vec3(1.09,0.97,0.88),vec3(0.92,0.98,1.07),smoothstep(0.3,0.7,iv))*(0.9+0.2*ib);',
   ' float cp=smoothstep(uKSCap.x,uKSCap.y,yy);c=mix(c,c*vec3(1.2,1.14,1.06)+vec3(0.05,0.042,0.03),cp*0.6);',
   ' float steep=1.0-abs(wn.y);',
   ' float s1=ksNoise(vec4(0,0,0,1),fp.x*1.68,wp.y*0.032+w1*1.2),s2=ksNoise(vec4(0,0,1,0),fp.x*0.568+2.4,wp.y*0.016);',
   ' float hang=mix(0.3,1.0,bi.r*bi.r)*bi.g;',
   ' float vn=max(smoothstep(0.6,0.78,s1)*0.8,smoothstep(0.62,0.85,s2))*hang*steep*steep;',
   ' c=mix(c,c*uKSVc+vec3(0.012,0.009,0.008),vn*0.62*uKSFx.x);',
   ' float up=smoothstep(0.62,0.93,wn.y),ft=smoothstep(uKSFoot+5.0,uKSFoot+0.5,wp.y);',
   ' c=mix(c,c*1.08+vec3(0.02),up*0.35);c=mix(c,uKSDust,clamp(up*0.38+ft*0.45*(1.0+0.8*w1),0.0,0.75));',
   ' return c;}'].join('\n');

  function dataTex(T,data,w,h){var t=new T.DataTexture(data,w,h,T.RGBAFormat);t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;
    t.generateMipmaps=false;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.needsUpdate=true;return t;}
  function shade(S,o){o=o||{};if(!S||!S.at)S=K.create(S||{});var T=three(o),R=root.KRAND;
    var kinds=S.kinds,fs=S.formations,span=S.range[1]-S.range[0],res=o.res==null?.25:o.res;
    if(span/res>262144)res=span/262144;
    var N=Math.ceil(span/res),W=256,H=Math.ceil(N/W),A=new Uint8ClampedArray(W*H*4),B=new Uint8ClampedArray(W*H*4),C=new Uint8ClampedArray(W*H*4),q={};
    var fx={};fs.forEach(function(f){var r=K.recipe(f.recipe).fx||{};for(var k in r)fx[k]=Math.max(fx[k]||0,r[k]);});
    var alF=null;for(var fi=0;fi<fs.length;fi++)if(fs[fi].alter&&fs[fi].alter.length&&!fs[fi].blocks){alF=fs[fi];break;}
    var ss=function(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
    for(var i=0;i<N;i++){S.bedAt(S.range[0]+(i+.5)*res,q);var Kd=kinds[q.kid],o4=i*4;
      if(q.blocks){B[o4+3]=255;continue;}
      var k=1-.1*ss(.25,0,q.edge);if(Kd.xbed>=.99)k*=.94+.1*q.f;
      A[o4]=Math.round(q.colour[0]*255*k);A[o4+1]=Math.round(q.colour[1]*255*k);A[o4+2]=Math.round(q.colour[2]*255*k);A[o4+3]=Math.round(Kd.xbed*255);
      B[o4]=Math.round(q.f*255);B[o4+1]=Math.round(Kd.varnish*255);B[o4+2]=Math.round(Kd.hard*255);B[o4+3]=Kd.irid?128:0;
      var F=fs[q.formation];if(F===alF){var Al=F.alter[0];
        if(Al.kinds==='*'||Al.kinds.indexOf(Kd.kind)>=0){var tk=kinds.findIndex(function(z){return z.name===F.recipe+'.'+Al.to;});
          if(tk>=0){var cc=kinds[tk].col,u=R.unit(R.hash(F.salt,q.bed,5)),c3=cc[Math.floor(u*cc.length)%cc.length];
            C[o4]=Math.round(c3[0]*255);C[o4+1]=Math.round(c3[1]*255);C[o4+2]=Math.round(c3[2]*255);C[o4+3]=255;}}}}
    var nz=dataTex(T,new Uint8Array(S.table.buffer.slice(0)),K.P,K.P);
    var lin=function(c){return new T.Vector3(c[0],c[1],c[2]);};   /* sRGB: the shader decodes, as it does the column */
    var Bf=null;for(fi=0;fi<fs.length;fi++)if(fs[fi].blocks){Bf=fs[fi];break;}
    var Bw=[],Bcn=[],Bc=[],Mc=[],nest=-1,mcn=1,bk=[60,.04,7.5,1.6];
    for(i=0;i<8;i++){Bw.push(0);Bcn.push(1);}for(i=0;i<32;i++)Bc.push(new T.Vector3());for(i=0;i<4;i++)Mc.push(new T.Vector3());
    if(Bf){var bl=Bf.blocks,mk=kinds.find(function(z){return z.name===Bf.recipe+'.'+bl.matrix;});
      bk=[bl.size,bl.gap,bl.nest?bl.nest.size:1,bl.bed];
      bl.clasts.slice(0,8).forEach(function(id,j){Bw[j]=bl.weights[j];var cl=kinds[id].col.slice(0,4);Bcn[j]=cl.length;
        cl.forEach(function(c,m){Bc[j*4+m]=lin(c);});if(bl.nest&&kinds[id].kind===bl.nest.kind)nest=j;});
      var mc=mk.col.slice(0,4);mcn=mc.length;mc.forEach(function(c,m){Mc[m]=lin(c);});}
    var fd=S.fold,fold=[0,0,1,0],fold2=[0,0,0,0];
    if(fd){var dl=Math.sqrt(fd.dir[0]*fd.dir[0]+fd.dir[1]*fd.dir[1]);fold=[-fd.dir[1]/dl,fd.dir[0]/dl,fd.wl,fd.amp];
      fold2=[fd.phase==null?0:fd.phase,fd.sharp==null?0:fd.sharp,fd.at?fd.at[0]:0,fd.at?fd.at[1]:0];}
    var Fa=[],Fb=[];for(i=0;i<4;i++){var Ft=S.faults[i];
      Fa.push(Ft?new T.Vector4(Ft.a[0],Ft.a[1],Ft.b[0],Ft.b[1]):new T.Vector4());
      Fb.push(Ft?new T.Vector4(Ft.throw,Ft.w==null?2:Ft.w,Ft.taper||0,0):new T.Vector4());}
    var cap=o.cap||[1e5,1e5+1],dust=new T.Color(o.dust==null?0xc9a27e:o.dust).convertSRGBToLinear(),vc=o.varnish||[.36,.3,.28];
    var V3=function(a){return new T.Vector3(a[0],a[1],a[2]);},V4=function(a){return new T.Vector4(a[0],a[1],a[2],a[3]);};
    var uniforms={uKSCol:{value:dataTex(T,new Uint8Array(A.buffer),W,H)},uKSBed:{value:dataTex(T,new Uint8Array(B.buffer),W,H)},
      uKSAlt:{value:dataTex(T,new Uint8Array(C.buffer),W,H)},uKSNz:{value:nz},
      uKSCR:{value:new T.Vector4(S.range[0],res,W,H)},uKSN:{value:N},uKSDip:{value:V3(S.dip)},uKSWarp:{value:new T.Vector2(S.warp[0],S.warp[1])},
      uKSWF:{value:new T.Vector2(S.warpF[0],S.warpF[1])},uKSFold:{value:V4(fold)},uKSFold2:{value:V4(fold2)},uKSFa:{value:Fa},uKSFb:{value:Fb},
      uKSFn:{value:Math.min(4,S.faults.length)},uKSAl:{value:alF?new T.Vector2(alF.alter[0].below,alF.alter[0].band):new T.Vector2(-1e9,0)},
      uKSCap:{value:new T.Vector2(cap[0],cap[1])},uKSFoot:{value:o.foot==null?-1e5:o.foot},uKSDust:{value:new T.Vector3(dust.r,dust.g,dust.b)},
      uKSFx:{value:new T.Vector4(fx.varnish||0,fx.columns||0,fx.liesegang||0,fx.flecks||0)},uKSVc:{value:V3(vc)},
      uKSBk:{value:V4(bk)},uKSBnest:{value:nest},uKSBnc:{value:Bf?Math.min(8,Bf.blocks.clasts.length):1},uKSMcn:{value:mcn},
      uKSBw:{value:Bw},uKSBcn:{value:Bcn},uKSBc:{value:Bc},uKSMc:{value:Mc}};
    var parsVertex='varying vec3 vSWP;varying vec3 vSWN;';
    var vertex='vSWP=(modelMatrix*vec4(transformed,1.0)).xyz;vSWN=normalize(mat3(modelMatrix)*objectNormal);';
    var inject=function(sh){Object.assign(sh.uniforms,uniforms);
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+parsVertex).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertex);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GLSL);return sh;};
    var colorAt=function(y){var c=S.colorAt(y);return new T.Color(c[0],c[1],c[2]);};
    return {uniforms:uniforms,parsVertex:parsVertex,vertex:vertex,parsFragment:GLSL,inject:inject,colorAt:colorAt,
      beds:S.beds,columnM:S.columnM,strata:S,at:S.at,yy:S.yy,hardnessAt:S.hardnessAt,terrace:S.terrace,res:res,texels:N};}

  K.shade=shade;K.GLSL=GLSL;
  if(root.BIO){var ONE=null;
    root.BIO.strata=function(opt){if(ONE&&!opt)return ONE;opt=opt||{};
      var S=(opt.recipe||opt.formations||opt.strata)?shade(opt.strata||K.create(opt),opt):legacy(opt);
      if(!opt.private)ONE=S;return S;};}
})(typeof window!=='undefined'?window:globalThis);
