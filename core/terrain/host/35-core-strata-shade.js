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
//                         THE CORE PATH: the bytes of KSTRATA.bake (the column of the stack and of its lateral stack at res
//                         m a texel, .25 by default; the alterations; the blocks formations' clasts) as RGBA8 data textures,
//                         the warp, dip, fold, faults and lateral side computed in the shader from the same lattice table as
//                         S.yy, so the bed the GPU draws is the bed S.surface reports (wash included). Adds S.at, S.surface,
//                         S.ledge, S.hardnessAt, S.yy, S.terrace, S.strata (the data stack), S.params (the uniforms as plain
//                         numbers, KSTRATA.params(S, bake, o): kstrata.gd gives Godot the same). Effects by recipe fx:
//                         cross-bedding and varnish (per kind; varnish: a colour multiplier, a recipe's fx.varnishCol by
//                         default: tepui's black-green), opal-shell iridescence (ringfold), Liesegang bands (pillar), colonnade
//                         joints (tibasalt-ponded), impact-glass flecks (megabreccia), a shadow line under each hard bed's lip
//                         (the ledge at close range), the loose cover in the bed's colour by `regolith`. Up to 4 alterations
//                         and 4 blocks formations a stack (an alteration of a blocks formation's clasts is the CPU's only).
//                         The ilmenite sheen is the page's material (roughness, metalness), not a colour. `#define
//                         KSTRATA_RAW` before the include makes strataColor return the bed's own colour (sRGB, no effects):
//                         the GPU-against-S.surface check
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

  // ---- the core path. The GLSL is the data half's arithmetic in its order (ksYY is S.yy, ksWorley is the blocks' lattice,
  // the lateral side is S.side), on the bytes of KSTRATA.bake; godot/shaders/lib/strata.gdshaderinc is the same in Godot's
  // shading language
  var GLSL=[
   'varying vec3 vSWP;varying vec3 vSWN;',
   'uniform sampler2D uKSCol,uKSBed,uKSAlt,uKSNz,uKSBt;uniform vec4 uKSCR,uKSLB,uKSLat,uKSLat2,uKSWash,uKSRep,uKSRepB;uniform float uKSN,uKSAln,uKSBn;',
   'uniform vec3 uKSDip;uniform vec2 uKSWarp,uKSWF;uniform vec4 uKSFold,uKSFold2;uniform vec4 uKSFa[4];uniform vec4 uKSFb[4];uniform float uKSFn;',
   'uniform vec4 uKSAl[4];uniform vec4 uKSBk[4];uniform vec4 uKSBm[4];uniform vec4 uKSBw[8];',
   'uniform vec2 uKSCap;uniform float uKSFoot;uniform vec3 uKSDust;uniform vec4 uKSFx;uniform vec3 uKSVc;',
   /* a texel of a data texture: WebGL2 reads it itself (no gradients, so loops need not unroll), WebGL1 samples its centre */
   '#if __VERSION__ >= 300',
   '#define KSFETCH(s,i,j,w,h) texelFetch(s,ivec2(int(i),int(j)),0)',
   '#else',
   '#define KSFETCH(s,i,j,w,h) texture2D(s,(vec2(i,j)+0.5)/vec2(w,h))',
   '#endif',
   'vec4 ksT4(float i,float j){return KSFETCH(uKSNz,mod(i,64.0),mod(j,64.0),64.0,64.0);}',
   'float ksNoise(vec4 m,float x,float z){float xi=floor(x),zi=floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3.0-2.0*fx),v=fz*fz*(3.0-2.0*fz);',
   ' float a=dot(ksT4(xi,zi),m),b=dot(ksT4(xi+1.0,zi),m),d=dot(ksT4(xi,zi+1.0),m),e=dot(ksT4(xi+1.0,zi+1.0),m);',
   ' float p=a+(b-a)*u,q=d+(e-d)*u;return p+(q-p)*v;}',
   'float ksYY(vec3 wp,out float w1){w1=ksNoise(vec4(1,0,0,0),wp.x*uKSWF.x,wp.z*uKSWF.x)-0.5;',
   ' float v=wp.y+w1*uKSWarp.x+(ksNoise(vec4(0,1,0,0),wp.x*uKSWF.y+0.37,wp.z*uKSWF.y+0.37)-0.5)*uKSWarp.y+(wp.x*uKSDip.x+wp.z*uKSDip.y)*uKSDip.z;',
   ' if(uKSFold.w!=0.0){float t=fract(((wp.x-uKSFold2.z)*uKSFold.x+(wp.z-uKSFold2.w)*uKSFold.y)/uKSFold.z+uKSFold2.x);',
   '  float s=1.0-32.0*t*t*(1.0-t)*(1.0-t),tri=4.0*abs(t-0.5)-1.0;v-=uKSFold.w*(s+(tri-s)*uKSFold2.y);}',
   ' for(int i=0;i<4;i++){if(float(i)>=uKSFn)break;vec4 A=uKSFa[i],B=uKSFb[i];float dx=A.z-A.x,dz=A.w-A.y,L=sqrt(dx*dx+dz*dz);',
   '  float s=(dz*(wp.x-A.x)-dx*(wp.z-A.y))/L,m=1.0;',
   '  if(B.z>0.0){float t=((wp.x-A.x)*dx+(wp.z-A.y)*dz)/(L*L);m=clamp(1.0+min(t,1.0-t)*L/B.z,0.0,1.0);}',
   '  v+=B.x*smoothstep(-B.y,B.y,s)*m;}',
   ' return v;}',
   'vec4 ksCell(vec3 q,float off){return ksT4(q.x+7.0*q.z+off,q.y+13.0*q.z+off*3.0);}',
   'vec2 ksWorley(vec3 p,float size,float off,out vec3 bc,out vec4 bv){vec3 c=floor(p/size);float d1=1e30,d2=1e30;bc=c;bv=vec4(0.0);',
   ' for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)for(int e=-1;e<=1;e++){vec3 q=c+vec3(float(a),float(b),float(e));vec4 v=ksCell(q,off);',
   '  float d=length((q+0.15+0.7*v.xyz)*size-p);if(d<d1){d2=d1;d1=d;bc=q;bv=v;}else if(d<d2)d2=d;}',
   ' return vec2(d1,d2);}',
   'float ksPick(float u,vec4 wa,vec4 wb,float nc){float tot=dot(wa,vec4(1.0))+dot(wb,vec4(1.0)),a=u*tot,id=nc-1.0;bool got=false;',
   ' for(int i=0;i<8;i++){float w=i<4?(i==0?wa.x:i==1?wa.y:i==2?wa.z:wa.w):(i==4?wb.x:i==5?wb.y:i==6?wb.z:wb.w);',
   '  if(!got&&float(i)<nc){if(a<w){id=float(i);got=true;}else a-=w;}}return id;}',
   'vec3 ksClast(float ib,float id,float u){float c0=id<0.0?32.0:id*4.0;',
   ' float n=floor(KSFETCH(uKSBt,c0,ib,36.0,uKSBn).a*255.0+0.5);',
   ' return KSFETCH(uKSBt,c0+mod(floor(u*n),n),ib,36.0,uKSBn).rgb;}',
   'vec3 ksBlock(vec3 p,float ib,out float mat){vec4 bk=uKSBk[0],bm=uKSBm[0],wa=uKSBw[0],wb=uKSBw[1];',
   ' for(int i=1;i<4;i++){if(float(i)==ib){bk=uKSBk[i];bm=uKSBm[i];wa=uKSBw[2*i];wb=uKSBw[2*i+1];}}',
   ' vec3 bc=vec3(0.0);vec4 bv=vec4(0.0);vec2 dd=ksWorley(p,bk.x,11.0,bc,bv);mat=0.0;',
   ' if(dd.y-dd.x<bk.y*bk.x){mat=1.0;return ksClast(ib,-1.0,bv.w);}',
   ' float id=ksPick(bv.w,wa,wb,bm.y);',
   ' if(id==bm.x){dd=ksWorley(p,bk.z,29.0,bc,bv);if(dd.y-dd.x<bk.y*bk.z){mat=1.0;return KSFETCH(uKSBt,32.0,ib,36.0,uKSBn).rgb;}',
   '  id=ksPick(bv.w,wa,wb,bm.y);if(id==bm.x){id=-1.0;mat=1.0;}}',
   ' vec4 vv=ksCell(bc,23.0);vec3 n=vv.xyz-0.5;float nl=length(n);if(nl<1e-6){n=vec3(0.0,1.0,0.0);nl=1.0;}',
   ' float band=floor(dot(p,n)/nl/bk.w),odd=band-2.0*floor(band/2.0);',
   ' return ksClast(ib,id,vv.w)*(odd>0.5?0.9:1.0);}',
   'vec3 strataColor(vec3 wp,vec3 wn){',
   ' wn=normalize(wn);float w1;float wsh=uKSWash.x*smoothstep(uKSWash.y,uKSWash.z,wn.y);',   /* the wash: a gentle slope shows the bed wsh m higher */
   ' float yy=ksYY(wp,w1)+wsh,wy=wp.y+wsh,steep=1.0-abs(wn.y),side=0.0;',
   ' if(uKSLB.w>0.5){float w=smoothstep(uKSLat2.x,uKSLat2.y,(wp.x-uKSLat.z)*uKSLat.x+(wp.z-uKSLat.w)*uKSLat.y);',   /* S.side */
   '  if(w>=1.0)side=1.0;else if(w>0.0)side=w>ksNoise(vec4(0,0,1,0),yy/uKSLat2.z,((wp.z-uKSLat.w)*uKSLat.x-(wp.x-uKSLat.z)*uKSLat.y)/500.0)?1.0:0.0;}',
   ' float y0=side>0.5?uKSLB.x:uKSCR.x,yl=yy;vec4 rp=side>0.5?uKSRepB:uKSRep;',   /* a repeating first or last formation comes round past the baked range */
   ' if(rp.x>0.0&&yl<y0)yl=y0+mod(yl-y0,rp.x);if(rp.y>0.0&&yl>=rp.w)yl=rp.z+mod(yl-rp.z,rp.y);',
   ' float idx=side>0.5?uKSLB.z+clamp(floor((yl-uKSLB.x)/uKSCR.y),0.0,uKSLB.y-1.0):clamp(floor((yl-uKSCR.x)/uKSCR.y),0.0,uKSN-1.0);',
   ' float ci=mod(idx,uKSCR.z),cj=floor(idx/uKSCR.z);',
   ' vec4 bed=KSFETCH(uKSCol,ci,cj,uKSCR.z,uKSCR.w),bi=KSFETCH(uKSBed,ci,cj,uKSCR.z,uKSCR.w);',
   ' vec2 fp=abs(wn.x)>abs(wn.z)?vec2(wp.z,wp.y):vec2(wp.x,wp.y);vec3 c,raw;',
   ' if(bi.a>0.9){float mat=0.0;raw=ksBlock(vec3(wp.x,yy,wp.z),floor(bi.r*255.0+0.5),mat);',
   '#ifdef KSTRATA_RAW',
   '  return raw;',
   '#endif',
   '  c=pow(raw,vec3(2.2));',
   '  float fl=ksNoise(vec4(0,0,0,1),fp.x*0.9+wp.y*0.37,wp.y*0.9+fp.x*0.21);',      /* impact glass: black and bottle-green flecks */
   '  c=mix(c,fl>0.93?vec3(0.012,0.04,0.02):vec3(0.008),mat*uKSFx.w*smoothstep(0.86,0.9,fl));}',
   ' else{for(int s=0;s<4;s++){if(float(s)>=uKSAln)break;vec4 al=KSFETCH(uKSAlt,ci,cj+float(s)*uKSCR.w,uKSCR.z,uKSCR.w*uKSAln);',   /* the alterations in order */
   '   if(al.a>0.5&&wy<uKSAl[s].x+uKSAl[s].y*2.0*w1){bed.rgb=al.rgb;break;}}',
   '  raw=bed.rgb;',
   '#ifdef KSTRATA_RAW',
   '  return raw;',
   '#endif',
   '  c=pow(raw,vec3(2.2));',
   '  float lam=0.95+0.05*sin(yy*5.1+w1*31.0);',
   '  float xb=ksNoise(vec4(0,0,1,0),fp.x*0.48+yy*0.72,yy*4.4);xb=mix(1.0,0.9+0.18*smoothstep(0.3,0.8,fract(xb*4.0)),bed.a);',
   '  c*=lam*xb;',
   '  if(bi.a>0.3&&bi.a<0.7){float h=fract(fp.x*0.031+yy*0.37+w1*2.0);vec3 rb=0.5+0.5*cos(6.2832*(h+vec3(0.0,0.33,0.67)));c=mix(c,c*(0.6+0.8*rb),0.45);}',
   '  if(uKSFx.z>0.0&&bi.b>0.8){float ls=fract((fp.x+yy)*0.045+ksNoise(vec4(0,0,0,1),fp.x*0.02,yy*0.02)*3.0);',
   '   c=mix(c,c*vec3(0.62,0.38,0.26),smoothstep(0.9,0.97,ls)*0.6*uKSFx.z);}',
   '  if(uKSFx.y>0.0&&bi.b>0.92){float up=step(0.62,bi.r),cw=mix(1.4,0.7,up);',   /* colonnade below, hackly entablature above */
   '   float jx=fract(fp.x/cw+ksNoise(vec4(0,0,1,0),fp.x*0.4,yy*mix(0.05,0.6,up))*mix(0.5,2.0,up));',
   '   c*=1.0-uKSFx.y*0.35*smoothstep(0.07,0.0,min(jx,1.0-jx));}',
   '  if(bi.b>0.7)c*=1.0-0.25*smoothstep(0.88,0.98,bi.r)*steep*(bi.b-0.7)/0.3;}',   /* the ledge's shadow line under each hard bed's lip */
   ' float iv=ksNoise(vec4(0,0,1,0),dot(wp.xz,vec2(0.0488,0.0344)),yy*0.11),ib=ksNoise(vec4(0,0,0,1),dot(wp.xz,vec2(-0.0376,0.0552))+4.0,yy*0.232);',
   ' c*=mix(vec3(1.09,0.97,0.88),vec3(0.92,0.98,1.07),smoothstep(0.3,0.7,iv))*(0.9+0.2*ib);',
   ' float cp=smoothstep(uKSCap.x,uKSCap.y,yy);c=mix(c,c*vec3(1.2,1.14,1.06)+vec3(0.05,0.042,0.03),cp*0.6);',
   ' float s1=ksNoise(vec4(0,0,0,1),fp.x*1.68,wp.y*0.032+w1*1.2),s2=ksNoise(vec4(0,0,1,0),fp.x*0.568+2.4,wp.y*0.016);',
   ' float hang=mix(0.3,1.0,bi.r*bi.r)*bi.g*(bi.a>0.9?0.0:1.0);',
   ' float vn=max(smoothstep(0.6,0.78,s1)*0.8,smoothstep(0.62,0.85,s2))*hang*steep*steep;',
   ' c=mix(c,c*uKSVc+vec3(0.012,0.009,0.008),vn*0.62*uKSFx.x);',
   ' vec3 dust=pow(mix(uKSDust,raw*0.85+0.12,uKSWash.w),vec3(2.2));',   /* the loose cover: the dust, or the bed's own colour (S.surface's cover) */
   ' float up=smoothstep(0.62,0.93,wn.y),ft=smoothstep(uKSFoot+5.0,uKSFoot+0.5,wp.y);',
   ' c=mix(c,c*1.08+vec3(0.02),up*0.35);c=mix(c,dust,clamp(up*0.38+ft*0.45*(1.0+0.8*w1),0.0,0.75));',
   ' return c;}'].join('\n');

  function dataTex(T,data,w,h){var t=new T.DataTexture(data,w,h,T.RGBAFormat);t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;
    t.generateMipmaps=false;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.needsUpdate=true;return t;}
  // the uniforms' values as plain numbers (kstrata.gd gives Godot the same list)
  function params(S,B,o){o=o||{};var fd=S.fold,fold=[0,0,1,0],fold2=[0,0,0,0],i,Lt=[0,0,0,0],Lt2=[0,1,6,0];
    if(fd){var dl=Math.sqrt(fd.dir[0]*fd.dir[0]+fd.dir[1]*fd.dir[1]);fold=[-fd.dir[1]/dl,fd.dir[0]/dl,fd.wl,fd.amp];
      fold2=[fd.phase==null?0:fd.phase,fd.sharp==null?0:fd.sharp,fd.at?fd.at[0]:0,fd.at?fd.at[1]:0];}
    var La=S.export().lateral;
    if(La){var ll=Math.sqrt(La.dir[0]*La.dir[0]+La.dir[1]*La.dir[1]);Lt=[La.dir[0]/ll,La.dir[1]/ll,La.at[0],La.at[1]];Lt2=[La.d0,La.d1,La.tongue,0];}
    var Fa=[],Fb=[];for(i=0;i<4;i++){var Ft=S.faults[i];Fa.push(Ft?[Ft.a[0],Ft.a[1],Ft.b[0],Ft.b[1]]:[0,0,0,0]);
      Fb.push(Ft?[Ft.throw,Ft.w==null?2:Ft.w,Ft.taper||0,0]:[0,0,0,0]);}
    var Al=[],Bk=[],Bm=[],Bw=[];for(i=0;i<4;i++){var s=B.slots[i],b=B.blocks[i];Al.push(s?[s.below,s.band,0,0]:[0,0,0,0]);
      Bk.push(b?[b.size,b.gap,b.nestSize,b.bed]:[1,0,1,1]);Bm.push(b?[b.nest,b.nc,b.mcn,0]:[-1,1,1,0]);
      Bw.push(b?b.w.slice(0,4):[0,0,0,0]);Bw.push(b?b.w.slice(4,8):[0,0,0,0]);}
    var hx=function(h){return [((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];};
    var rep=function(h){if(!h)return [0,0,0,0];var f0=h.formations[0],fl=h.formations[h.formations.length-1];
      return [f0.repeat==null?0:f0.repeat,fl.repeat==null?0:fl.repeat,fl.base,fl.top];};
    return {CR:[B.yA,B.res,B.W,B.H],LB:[B.yB,B.NB,B.NA,S.lateral?1:0],Lat:Lt,Lat2:Lt2,
      Rep:rep(S),RepB:rep(S.lateral),Wash:[S.wash?S.wash.m:0,S.wash?S.wash.from:.55,S.wash?S.wash.to:.9,S.regolith||0],N:B.NA,Aln:B.slots.length,Bn:B.nblocks,
      Dip:S.dip,Warp:S.warp,WF:S.warpF,Fold:fold,Fold2:fold2,Fa:Fa,Fb:Fb,Fn:Math.min(4,S.faults.length),Al:Al,Bk:Bk,Bm:Bm,Bw:Bw,
      Cap:o.cap||[1e5,1e5+1],Foot:o.foot==null?-1e5:o.foot,Dust:o.dust==null?S.dust:hx(o.dust),
      Fx:[B.fx.varnish||0,B.fx.columns||0,B.fx.liesegang||0,B.fx.flecks||0],Vc:o.varnish||B.varnishCol||[.36,.3,.28]};}
  function shade(S,o){o=o||{};if(!S||!S.at)S=K.create(S||{});var T=three(o);
    var B=K.bake(S,{res:o.res}),P=params(S,B,o);
    var v2=function(a){return new T.Vector2(a[0],a[1]);},v3=function(a){return new T.Vector3(a[0],a[1],a[2]);},v4=function(a){return new T.Vector4(a[0],a[1],a[2],a[3]);};
    var uniforms={uKSCol:{value:dataTex(T,B.col,B.W,B.H)},uKSBed:{value:dataTex(T,B.bed,B.W,B.H)},uKSAlt:{value:dataTex(T,B.alt,B.W,B.H*B.nslots)},
      uKSNz:{value:dataTex(T,new Uint8Array(S.table.buffer.slice(0)),K.P,K.P)},uKSBt:{value:dataTex(T,B.btab,36,B.nblocks)},
      uKSCR:{value:v4(P.CR)},uKSLB:{value:v4(P.LB)},uKSLat:{value:v4(P.Lat)},uKSLat2:{value:v4(P.Lat2)},uKSWash:{value:v4(P.Wash)},uKSRep:{value:v4(P.Rep)},uKSRepB:{value:v4(P.RepB)},
      uKSN:{value:P.N},uKSAln:{value:P.Aln},uKSBn:{value:P.Bn},uKSDip:{value:v3(P.Dip)},uKSWarp:{value:v2(P.Warp)},uKSWF:{value:v2(P.WF)},
      uKSFold:{value:v4(P.Fold)},uKSFold2:{value:v4(P.Fold2)},uKSFa:{value:P.Fa.map(v4)},uKSFb:{value:P.Fb.map(v4)},uKSFn:{value:P.Fn},
      uKSAl:{value:P.Al.map(v4)},uKSBk:{value:P.Bk.map(v4)},uKSBm:{value:P.Bm.map(v4)},uKSBw:{value:P.Bw.map(v4)},
      uKSCap:{value:v2(P.Cap)},uKSFoot:{value:P.Foot},uKSDust:{value:v3(P.Dust)},uKSFx:{value:v4(P.Fx)},uKSVc:{value:v3(P.Vc)}};
    var parsVertex='varying vec3 vSWP;varying vec3 vSWN;';
    var vertex='vSWP=(modelMatrix*vec4(transformed,1.0)).xyz;vSWN=normalize(mat3(modelMatrix)*objectNormal);';
    var inject=function(sh){Object.assign(sh.uniforms,uniforms);
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+parsVertex).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertex);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GLSL);return sh;};
    var colorAt=function(y){var c=S.colorAt(y);return new T.Color(c[0],c[1],c[2]);};
    return {uniforms:uniforms,parsVertex:parsVertex,vertex:vertex,parsFragment:GLSL,inject:inject,colorAt:colorAt,params:P,bake:B,
      beds:S.beds,columnM:S.columnM,strata:S,at:S.at,yy:S.yy,surface:S.surface,ledge:S.ledge,hardnessAt:S.hardnessAt,terrace:S.terrace,
      res:B.res,texels:B.NA+B.NB};}

  K.params=params;
  K.shade=shade;K.GLSL=GLSL;
  if(root.BIO){var ONE=null;
    root.BIO.strata=function(opt){if(ONE&&!opt)return ONE;opt=opt||{};
      var S=(opt.recipe||opt.formations||opt.strata)?shade(opt.strata||K.create(opt),opt):legacy(opt);
      if(!opt.private)ONE=S;return S;};}
})(typeof window!=='undefined'?window:globalThis);
