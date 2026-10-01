// ================================================================= BIOME CORE — strata (layered sedimentary rock)
// One shader function for every surface that shows bedded rock: the host's
// ground (the canyon and mesa walls), and anything carved from it (a host can
// hand the same object to its building kit, so a carving shows the bands of
// the face it is cut from). Engine-independent; a host calls BIO.strata()
// after BIO.init and gets one shared object.
//
// What makes it read as rock rather than as a stack of paint:
//   - a COLUMN of beds of irregular thickness (thick cross-bedded sandstones,
//     thin dark shales and mudstones, bleached bands), seeded, baked into a
//     1 x 1024 texture that repeats every `columnM` metres;
//   - the beds DIP gently and WARP (two octaves of noise in plan), so a bed
//     line wanders across a face instead of running level;
//   - LAMINAE inside every bed and CROSS-BEDDING on the sandstones;
//   - COLOUR THAT DRIFTS ALONG A BED: iron staining warms and cools each bed
//     in patches tens of metres long, so no band is one flat colour;
//   - DESERT VARNISH: dark streaks hanging from the top of each bed and fading
//     down it (the water that leaves them runs off the ledge above);
//   - SAND: dust settles on every up-facing ledge and banks against the foot;
//     a bleached CAP (the white Navajo-like top of a mesa) where the host asks.
//
//   const S=BIO.strata({seed, columnM, dip:[dx,dz,slope], warp:[m1,m2], palette,
//                       cap:[y0,y1] (bleaching from y0 to y1; off by default),
//                       foot:y (the floor the dust banks on; off by default), dust:0xhex})
//   S.uniforms                    merge into a material's uniforms (onBeforeCompile)
//   S.parsVertex / S.vertex       declare and write vSWP, vSWN (world position, normal)
//   S.parsFragment                the function strataColor(vec3 wp, vec3 wn) -> vec3
//   S.inject(shader)              does all three for a stock material and returns the shader
//   S.colorAt(y)                  the column's colour at a height (sRGB THREE.Color), for painters
(function(){
let ONE=null;
BIO.strata=function(opt){if(ONE&&!opt)return ONE;opt=opt||{};const T=BIO.host.THREE,F=BIO.fn;
 const seed=opt.seed||4711,colM=opt.columnM||180,N=1024;
 // the palette: Wingate/Kayenta reds and oranges, purple-brown shales, buff and cream
 // bleached sandstones, chocolate mudstones, and the rare grey-green of a reduced bed
 const pal=opt.palette||{sand:[0xb5643a,0xc2723f,0xa85a36,0xbd7a4e,0xc98a58],shale:[0x7b4a3e,0x6f4a44,0x80503c],
  bleach:[0xd9b48a,0xe0c39a,0xcfa27a],mud:[0x93553f,0x8a5a48,0x9c6248],green:[0x8c8a6e,0x9a9478]};
 // the column: beds bottom to top, thickness in metres, kind, colour
 let s=seed>>>0;const R=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const pick=a=>a[Math.floor(R()*a.length)%a.length];
 const beds=[];let y=0;
 while(y<colM){const u=R();let kind,th;
  if(u<.46){kind='sand';th=2.5+R()*9;}else if(u<.68){kind='shale';th=.35+R()*1.4;}else if(u<.83){kind='mud';th=.8+R()*2.2;}else if(u<.95){kind='bleach';th=1+R()*3.5;}else{kind='green';th=.3+R()*.9;}
  th=Math.min(th,colM-y);beds.push({y0:y,th,kind,c:new T.Color(pick(pal[kind]||pal.mud))});y+=th;}
 const c=document.createElement('canvas');c.width=1;c.height=N;const g=c.getContext('2d'),id=g.createImageData(1,N);
 const c2=document.createElement('canvas');c2.width=1;c2.height=N;const g2=c2.getContext('2d'),id2=g2.createImageData(1,N);
 for(let i=0;i<N;i++){const yy=(i+.5)/N*colM;let b=beds[beds.length-1];for(const q of beds)if(yy<q.y0+q.th){b=q;break;}
  const f=(yy-b.y0)/b.th,edge=Math.min(f*b.th,(1-f)*b.th);   // metres to the nearest bed boundary
  let k=1-.1*F.smooth(.25,0,edge);                          // a dark seam where beds meet
  if(b.kind==='sand')k*=.94+.1*f;                            // a sandstone bed pales upward
  const o=(N-1-i)*4;id.data[o]=Math.min(255,b.c.r*255*k);id.data[o+1]=Math.min(255,b.c.g*255*k);id.data[o+2]=Math.min(255,b.c.b*255*k);
  id.data[o+3]=b.kind==='sand'?255:b.kind==='bleach'?200:b.kind==='mud'?120:60;       // alpha: how much cross-bedding shows
  // the second column: R how far up its bed (varnish hangs from the top), G how much the bed holds varnish
  id2.data[o]=Math.round(f*255);id2.data[o+1]=b.kind==='sand'||b.kind==='bleach'?255:90;id2.data[o+2]=0;id2.data[o+3]=255;}
 g.putImageData(id,0,0);g2.putImageData(id2,0,0);
 const col=new T.CanvasTexture(c);col.wrapS=T.ClampToEdgeWrapping;col.wrapT=T.RepeatWrapping;col.magFilter=T.LinearFilter;col.minFilter=T.LinearFilter;col.generateMipmaps=false;col.encoding=T.sRGBEncoding;
 const bedT=new T.CanvasTexture(c2);bedT.wrapS=T.ClampToEdgeWrapping;bedT.wrapT=T.RepeatWrapping;bedT.magFilter=T.NearestFilter;bedT.minFilter=T.NearestFilter;bedT.generateMipmaps=false;
 // a tiling value noise for the warp, the streaks and the cross-bedding
 const nz=BIO.canvasTex(256,256,(gg,w,h)=>{const d=gg.createImageData(w,h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const v=F.fbm(xx/32,yy/32,seed%97,4);const o=(yy*w+xx)*4;d.data[o]=d.data[o+1]=d.data[o+2]=Math.round(v*255);d.data[o+3]=255;}gg.putImageData(d,0,0);});
 nz.wrapS=nz.wrapT=T.RepeatWrapping;nz.encoding=T.LinearEncoding;
 const dip=opt.dip||[.6,.8,.012],warp=opt.warp||[9,2.2];
 const cap=opt.cap||[1e5,1e5+1],dust=new T.Color(opt.dust||0xc9a27e).convertSRGBToLinear();
 const uniforms={uSBed:{value:bedT},uSCap:{value:new T.Vector2(cap[0],cap[1])},uSFoot:{value:opt.foot===undefined?-1e5:opt.foot},uSDust:{value:new T.Vector3(dust.r,dust.g,dust.b)},uSCol:{value:col},uSNz:{value:nz},uSColH:{value:colM},uSDip:{value:new T.Vector3(dip[0],dip[1],dip[2])},uSWarp:{value:new T.Vector2(warp[0],warp[1])}};
 const parsVertex='varying vec3 vSWP;varying vec3 vSWN;';
 const vertex='vSWP=(modelMatrix*vec4(transformed,1.0)).xyz;vSWN=normalize(mat3(modelMatrix)*objectNormal);';
 const parsFragment=['varying vec3 vSWP;varying vec3 vSWN;uniform sampler2D uSCol,uSNz,uSBed;uniform float uSColH,uSFoot;uniform vec2 uSCap;uniform vec3 uSDust;uniform vec3 uSDip;uniform vec2 uSWarp;',
  'vec3 strataColor(vec3 wp,vec3 wn){',
  ' wn=normalize(wn);',
  ' float w1=texture2D(uSNz,wp.xz*0.0019).r-0.5,w2=texture2D(uSNz,wp.xz*0.0087+0.37).r-0.5;',
  ' float yy=wp.y+w1*uSWarp.x+w2*uSWarp.y+dot(wp.xz,uSDip.xy)*uSDip.z;',
  ' vec4 bed=texture2D(uSCol,vec2(0.5,yy/uSColH));bed.rgb=pow(bed.rgb,vec3(2.2));',   // a custom sampler is not decoded from sRGB for us
  ' vec2 fp=abs(wn.x)>abs(wn.z)?vec2(wp.z,wp.y):vec2(wp.x,wp.y);',             // the face's own plane
  ' float lam=0.95+0.05*sin(yy*5.1+w2*31.0);',                                     // laminae
  ' float xb=texture2D(uSNz,vec2(fp.x*0.06+yy*0.09,yy*0.55)).r;',                 // cross-bedding: sets of inclined lines
  ' xb=mix(1.0,0.9+0.18*smoothstep(0.3,0.8,fract(xb*4.0)),bed.a);',
  ' vec3 c=bed.rgb*lam*xb;',
  ' vec4 bi=texture2D(uSBed,vec2(0.5,yy/uSColH));',                                 // r: how far up its bed; g: holds varnish
  // iron staining: each bed warms and cools along its length (patches of 20-80 m), a little brighter or darker
  ' float iv=texture2D(uSNz,vec2(dot(wp.xz,vec2(0.0061,0.0043)),yy*0.0137)).r,ib=texture2D(uSNz,vec2(dot(wp.xz,vec2(-0.0047,0.0069))+0.5,yy*0.029)).r;',
  ' c*=mix(vec3(1.09,0.97,0.88),vec3(0.92,0.98,1.07),smoothstep(0.3,0.7,iv))*(0.9+0.2*ib);',
  // the bleached cap
  ' float cp=smoothstep(uSCap.x,uSCap.y,yy);c=mix(c,c*vec3(1.2,1.14,1.06)+vec3(0.05,0.042,0.03),cp*0.6);',
  // desert varnish: streaks of several widths hanging from the top of the bed and fading down it
  ' float steep=1.0-abs(wn.y);',
  ' float s1=texture2D(uSNz,vec2(fp.x*0.21,wp.y*0.004+w1*0.15)).r,s2=texture2D(uSNz,vec2(fp.x*0.071+0.3,wp.y*0.002)).r;',
  ' float hang=mix(0.3,1.0,bi.r*bi.r)*bi.g;',
  ' float vn=max(smoothstep(0.6,0.78,s1)*0.8,smoothstep(0.62,0.85,s2))*hang*steep*steep;',
  ' c=mix(c,c*vec3(0.36,0.3,0.28)+vec3(0.012,0.009,0.008),vn*0.62);',
  // sand: on every ledge, banked against the foot
  ' float up=smoothstep(0.62,0.93,wn.y),ft=smoothstep(uSFoot+5.0,uSFoot+0.5,wp.y);',
  ' c=mix(c,c*1.08+vec3(0.02),up*0.35);c=mix(c,uSDust,clamp(up*0.38+ft*0.45*(1.0+0.8*w2),0.0,0.75));',
  ' return c;}'].join('\n');
 const inject=sh=>{Object.assign(sh.uniforms,uniforms);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+parsVertex).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertex);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+parsFragment);return sh;};
 const colorAt=yy=>{const v=((yy%colM)+colM)%colM;for(const q of beds)if(v<q.y0+q.th)return q.c.clone();return beds[beds.length-1].c.clone();};
 const S={uniforms,parsVertex,vertex,parsFragment,inject,colorAt,beds,columnM:colM};
 if(!opt.private)ONE=S;return S;};
})();
