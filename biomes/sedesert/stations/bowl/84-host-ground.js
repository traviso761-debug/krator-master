// ================================================================= HOST — the ground (the Bowl)
// One ground mesh (the 640-cell lattice, the delta's window at half that), painted from the fields (45) and the library's
// layers laid over it by weight per vertex (stations/bowl/materials.json, the 'bowl' pack): the white polygonal salt of the
// flat, the efflorescence at the shore and in the hollows, the soda crust between them, the ochre salt rim out in the
// shallows, the delta's reed bed and cracked silt, the popcorn clay of the halo, the rippled sand of the dunes and the pale
// silt of the kaluts. On the kaluts' steep faces the kit's strata shader (35-core-strata) draws the old lake's beds in a pale
// badland palette (PLAN-BOWL.md section 5). Without the pack (?mat=proc) the ground is the painted one.
// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={SALT:K(0xeee8dc),SALT2:K(0xe2d9c8),EFF:K(0xf6f2ea),SODA:K(0xe0c8b0),OCHRE:K(0xc8945a),OCHRE2:K(0xd8a868),BED:K(0xb89a72),
 MUD:K(0x6e6252),SILT:K(0x8e8270),SILT2:K(0xa49478),REED:K(0x6e7048),SAND:K(0xc8ae88),SAND2:K(0xb89c78),GRAV:K(0x9a7660),GRAV2:K(0x86624e),
 DUNE:K(0xdcae7c),DUNE2:K(0xe8c094),YARD:K(0xd8c4a0),STRAND:K(0xcfc0a4),GRASS:K(0x9a9446),GRASS2:K(0x7a8a3c),LITTER:K(0x55603a),SOIL:K(0x6a5038)};
if(STATION.paint)for(const k in STATION.paint)PAINT[k]=K(STATION.paint[k]);   /* a station's own colours over the Bowl's */
PAINT.BARE=PAINT.BARE||K(0xb48a68);PAINT.GRANITE=PAINT.GRANITE||K(0xa89890);
const _t=new THREE.Color();
function paintAt(c,x,z,at,n,n2){const sa=at('salt'),lu=at('lush'),fo=at('forest'),ga=at('garden'),de=at('delta'),ha=at('halo'),rg=at('reg'),dm=at('damp'),yd=at('yard'),dn=at('dune'),lk=at('lake'),rd=at('ridge'),fa=at('fan'),fl=at('flow');
 c.copy(PAINT.GRAV).lerp(PAINT.GRAV2,clamp(.5+n*1.8,0,1));                                       /* the reg's gravel */
 _t.copy(PAINT.SAND).lerp(PAINT.SAND2,clamp(.5+n*1.6,0,1));c.lerp(_t,clamp(ha+(1-rg),0,1)*.85);       /* the halo's saline sand */
 _t.copy(PAINT.SALT).lerp(PAINT.SALT2,clamp(.5+n*2,0,1)).lerp(PAINT.SODA,smooth(.55,.7,BIO.fn.fbm(x*.0016,z*.0016,8401,2))*.6);c.lerp(_t,sa);   /* the flat */
 c.lerp(PAINT.STRAND,at('strand')*.5);
 _t.copy(PAINT.SILT).lerp(PAINT.SILT2,clamp(.5+n*1.6,0,1)).lerp(PAINT.REED,smooth(.5,.9,de)*.45);c.lerp(_t,Math.max(de,fa*.4));   /* the delta */
 c.lerp(PAINT.MUD,Math.max(fl*.9,dm*.55));c.lerp(PAINT.EFF,dm*(1-fl)*smooth(.3,.7,sa)*.45);         /* wet silt, the efflorescence round the hollows */
 _t.copy(PAINT.DUNE).lerp(PAINT.DUNE2,clamp(.5+n*1.5,0,1));c.lerp(_t,dn);
 c.lerp(PAINT.YARD,Math.max(yd*.9,at('plat')*(1-dn)*.65));   /* the old lake silt of the kaluts' plateau, buff */
 /* a green station's (Mantis's pocket): the savanna's grass, the forest's litter, the gardens' dark worked soil (0 on the Bowl) */
 _t.copy(PAINT.GRASS).lerp(PAINT.GRASS2,clamp(.5+n*1.8,0,1));c.lerp(_t,lu*.85);c.lerp(PAINT.LITTER,fo*.8);c.lerp(PAINT.SOIL,ga*.75);
 _t.copy(PAINT.OCHRE).lerp(PAINT.OCHRE2,clamp(.5+n*1.8,0,1));c.lerp(_t,Math.max(rd,lk*.85));          /* the ochre rim, and the bed under the shallows */
 c.lerp(PAINT.GRANITE,at('granite')*.9);c.lerp(PAINT.BARE,at('bare')*.85);                             /* a station's granite and its bare ground (0 on the Bowl) */
 return c;}
const paintTex=(W,x0,z0,S)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=BIO.fn.fbm(wx*.03,wz*.03,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  paintAt(c,wx,wz,k=>FC.a[k]?FC.at(FC.a[k],wx,wz):0,n,n2);const k=1+n*.1+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(BIO.fn.fbm(x/9,y/9,5,2)-.5)*34+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// a tiling noise in the full 0..1 range: the layers' tile variation (which offset each patch samples), the blend weights'
// dither and the screen dither
const TEX_NOISE=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=BIO.fn.fbm(x/32,y/32,8404,3),b=BIO.fn.fbm(x/8,y/8,8405,2);
  d[i]=clamp((a-.5)*2.6*255+128,0,255);d[i+1]=clamp((b-.5)*2.6*255+128,0,255);d[i+2]=BIO.fn.h3(x,y,8406)*255;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_NOISE.wrapS=TEX_NOISE.wrapT=THREE.RepeatWrapping;TEX_NOISE.encoding=THREE.LinearEncoding;
// the kaluts' beds: the kit's strata shader in a pale badland palette, a 40 m column, nearly level
const STRATA=BIO.strata({seed:8402,columnM:40,dip:[1,.3,.006],palette:{sand:[0xd8c4a0,0xe2d0ae,0xcbb48e,0xd4bc94],shale:[0xa89478,0x9c8a72,0xb0987a],
 bleach:[0xece2cc,0xf0e6d4,0xe6d8bc],mud:[0xb89e80,0xc0a888,0xae9476],green:[0xb4b098,0xa8a690]}});
// THE LIBRARY LAYERS: the full-colour sets replace the paint (x their gain), the tintable ones multiply it (over their mean)
// a station may take fewer (STATION.groundLayers: a fragment shader has 16 texture units, and a green station adds two layers)
const GL_PICK=k=>!STATION.groundLayers||STATION.groundLayers.indexOf(k)>=0;
const GL_FULL=['salt','ochre','soda','efflor'].filter(GL_PICK),GL_TINT=['dune','yard','playa','reedbed','popcorn'].filter(GL_PICK);
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 /* STATION.layerPack: a station's own pack takes a layer's family first (the steppe's granite for the 'yard' slot) */
 for(const k of GL_FULL.concat(GL_TINT)){const P=(STATION.layerPack&&KMAT.packed(STATION.layerPack,'ground.'+k))||KMAT.packed('bowl','ground.'+k);if(!P)return null;
  o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0],m:Math.pow(P.tint&&P.tint.mean!=null?P.tint.mean:.78,2.2)};}
 /* a green station's two layers (Mantis's pack, 'mantis'): the savanna's grass (full colour) and the forest floor (multiplied) */
 for(const k of ['lush','forest']){const P=(STATION.layerPack&&KMAT.packed(STATION.layerPack,'ground.'+k))||KMAT.packed('mantis','ground.'+k);if(P)o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0],m:Math.pow(P.tint&&P.tint.mean!=null?P.tint.mean:.78,2.2)};}
 return o;})();
const TILES=new URLSearchParams(location.search).get('tiles')!=='0';   /* the layers' tile breakup (bowlTex, below) */
/* MeshStandard (2026-11-04, the ground catch-up; core/terrain/GROUND.md: r128's Lambert lights per vertex on the cells, so no relief could show on it): the light per
   pixel, roughness high as dry ground and salt crust are. ?kgstd=0 the Lambert ground (and no relief), ?kgrelief=0 the Standard ground without the relief: the two
   before states. Read by the Bowl, Mantis's pocket and the steppe (station.json "base") */
const KG_GQ=new URLSearchParams(location.search),KG_STD=KG_GQ.get('kgstd')!=='0',KG_RELIEF=KG_STD&&KG_GQ.get('kgrelief')!=='0';
const MAT_GROUND=KG_STD?new THREE.MeshStandardMaterial({map:null,color:0xb4aca4,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:null,color:0xb4aca4});
MAT_GROUND.extensions={derivatives:true};
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uKgSun={value:KG_SUN};sh.uniforms.uBowlNoise={value:TEX_NOISE};
 const gl2=renderer.capabilities.isWebGL2;
 const GX=GLAY?['lush','forest'].filter(k=>GLAY[k]):[];
 if(GLAY)GL_FULL.concat(GL_TINT,GX).forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1,aL2;varying vec4 vL0,vL1,vL2;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;vL2=aL2;');
 const W={salt:'vL0.x',ochre:'vL0.y',soda:'vL0.z',efflor:'vL0.w',dune:'vL1.x',yard:'vL1.y',playa:'vL1.z',reedbed:'vL1.w',popcorn:'vL2.x'};
 let decl='uniform sampler2D uDetail,uBowlNoise;varying vec3 vGWP;varying vec4 vL0,vL1,vL2;uniform vec3 uKgSun;'+
  /* THE TILE VARIATION: each layer is sampled twice at offsets that change patch by patch (a 48 m noise picks which), blended
     across the patches' edges, so no repeat lines up (Quilez's texture variation). The offsets are golden-ratio steps, the
     gradients the plain uv's (textureGrad, WebGL2), so the mip level does not jump at a patch's edge */
  /* (the final rebuild, 2026-10-27; the owner: the salt flat's crust read as a grid of one tile; ?tiles=0 the old two copies) each patch's copy is
     TURNED as well as shifted (a golden-angle step), the patches are a third the size, and a third copy at 0.37 the scale, turned 0.6 rad, takes
     a quarter of the colour, so no repeat lines up in rows or columns */
  'vec3 bowlTex(sampler2D s,vec2 uv,vec2 w){float n=texture2D(uBowlNoise,w*'+(TILES?'0.0125':'0.0047')+').r*7.0,i=floor(n),f=fract(n);'+
  'vec2 oa=fract(i*vec2(0.7548777,0.5698403)),ob=fract((i+1.0)*vec2(0.7548777,0.5698403));'+
  (TILES?'float ra=i*2.39996,rb=ra+2.39996;mat2 Ra=mat2(cos(ra),-sin(ra),sin(ra),cos(ra)),Rb=mat2(cos(rb),-sin(rb),sin(rb),cos(rb));const mat2 R3=mat2(0.8253,-0.5646,0.5646,0.8253);':'mat2 Ra=mat2(1.0),Rb=mat2(1.0);')+
  (gl2?'vec2 dx=dFdx(uv),dy=dFdy(uv);vec3 a=textureGrad(s,Ra*uv+oa,Ra*dx,Ra*dy).rgb,b=textureGrad(s,Rb*uv+ob,Rb*dx,Rb*dy).rgb;':'vec3 a=texture2D(s,Ra*uv+oa).rgb,b=texture2D(s,Rb*uv+ob).rgb;')+
  'vec3 c=mix(a,b,smoothstep(0.2,0.8,f-0.1*dot(a-b,vec3(1.0))));'+
  (TILES?(gl2?'c=mix(c,textureGrad(s,R3*uv*0.37+0.31,R3*dx*0.37,R3*dy*0.37).rgb,0.25);':'c=mix(c,texture2D(s,R3*uv*0.37+0.31).rgb,0.25);'):'')+
  'return c;}'+
  /* THE WEIGHTS' DITHER: a blend weight w moves by up to 0.45 with a 9 m and a 2 m noise where it is mid-way, and not at all at 0 or 1,
     so an edge between two surfaces is ragged patches, not a cross-fade */
  'float bowlW(float w,float d){return smoothstep(0.0,1.0,clamp(w+d*4.0*w*(1.0-w),0.0,1.0));}',
  body='{vec2 p=vGWP.xz;vec3 dt=texture2D(uDetail,p*0.15).rgb,dt2=texture2D(uDetail,p*0.019+0.37).rgb;'+
  'float dw=(texture2D(uBowlNoise,p*0.011).g-0.5)*0.6+(texture2D(uBowlNoise,p*0.05+0.3).g-0.5)*0.3;';
 if(GLAY){decl+='uniform sampler2D '+GL_FULL.concat(GL_TINT,GX).map(k=>'uG_'+k).join(',')+';';
  /* a custom sampler is not decoded from sRGB: pow 2.2 by hand */
  body+='vec3 L;';
  const lay=k=>'L=pow(bowlTex(uG_'+k+',p*'+GLAY[k].k.toFixed(4)+',p),vec3(2.2));';
  body+=GL_TINT.map(k=>lay(k)+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*L/'+GLAY[k].m.toFixed(4)+',bowlW('+W[k]+',dw));').join('');
  /* the salt's second texture (?tiles=0 none): the soda crust's curled plates blended through it in broad soft patches (a 60 m and a 20 m
     noise), up to half, so the flat is not one crust from shore to halo */
  const SALT2=TILES&&GLAY.soda&&GL_FULL.indexOf('salt')>=0?'{float sp=smoothstep(0.45,0.75,texture2D(uBowlNoise,p*0.0045+0.17).r*0.7+texture2D(uBowlNoise,p*0.017+0.53).g*0.3);'+
   'L=mix(L,pow(bowlTex(uG_soda,p*'+GLAY.soda.k.toFixed(4)+'*0.8,p+37.0),vec3(2.2)),sp*0.5);}':'';
  body+=GL_FULL.map(k=>lay(k)+(k==='salt'?SALT2:'')+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.18,bowlW('+W[k]+',dw));').join('');
  if(GLAY.forest)body+=lay('forest')+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*L/'+GLAY.forest.m.toFixed(4)+',bowlW(vL2.w,dw));';
  if(GLAY.lush)body+=lay('lush')+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.1,bowlW(vL2.z,dw));';
  body+='diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.35);';}
 else body+='diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);';
 body+='diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN)*(0.88+0.24*dt.r),vL2.y);/*KGROUND*/'+
  /* a screen dither of a quarter step of 8 bits, so the long smooth gradients of the flat and the haze do not band */
  'diffuseColor.rgb+=(texture2D(uBowlNoise,gl_FragCoord.xy/256.0).b-0.5)/400.0;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body);
 /* the shore pan's crust (89w-host-water.js sets BOWL_PAN before the first frame: core/water's pan GLSL, by the ground's height over the lake) */
 if(BOWL_PAN){Object.assign(sh.uniforms,BOWL_PAN.U);sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uPanWet;\n'+BOWL_PAN.CH)
  .replace('#include <color_fragment>','#include <color_fragment>\n'+BOWL_PAN.mix);}};
var BOWL_PAN=null;   /* the shore pan's drawing on this ground (89w) */
MAT_GROUND.customProgramCacheKey=()=>'bowl-ground3'+(GLAY?'-lib'+(GLAY.lush?'g':''):'')+(KG_STD?'-std':'');
// THE LAYER KINDS (core/terrain 43, KGROUND; the final rebuild 2026-10-27, BACKPORT.md sedesert's row), procedural over the layers above, no
// sampler of their own: the salt crust's PRESSURE POLYGONS (?polygon=0), metres-wide cells whose edges buckle up into pale ridges over buff
// troughs, on the white crust (vL0.x) only, the library's crust texture the fine cracks inside them; the dunes' SAND (?sand=0), the wind's
// ripples lit by the sun and the glints of single grains over the dune layer (vL1.x), across the wind that built them (WIND)
const KG_SUN=new THREE.Vector3(...(STATION.sun||[-600,900,-400])).normalize();TICKS.push(()=>KG_SUN.copy(sun.position).normalize());
{const q=new URLSearchParams(location.search),poly=q.get('polygon')!=='0',sand=q.get('sand')!=='0',wl=Math.hypot(WIND[0],WIND[1])||1;
 KGROUND.hook(MAT_GROUND,{key:'bowl-ground-k'+(poly?'p':'')+(sand?'s':''),blend:0,far:false,layers:[
  poly?{kind:'polygon',name:'salt pressure polygons',w:'vL0.x*1.15',amt:.9,size:7,width:.03,warp:.08,jitter:.8,vary:.06,edgeTint:'vec3(0.8,0.76,0.7)',rim:.05,rimTint:'vec3(1.1)',seed:301}:null,
  sand?{kind:'sand',name:'dune sand',w:'vL1.x*1.1',amt:1,color:0xffffff,tint:'diffuseColor.rgb',ripple:.12,wind:[WIND[0]/wl,WIND[1]/wl],sun:'uKgSun',seed:302}:null],
  /* THE RELIEF (2026-11-04, the ground catch-up; HANDOFF-REBUILD's adoption list): the layers' height bumps the lit normal (no texture unit), its low and the floor's
     own hollows (KGROUND.cavityMesh, below) lose sky light, and on the yardangs' flanks where the strata show (vL2.y) the beds stand by hardness on the core strata
     path. No side planes: no flank here is steep and near */
  relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1,strata:.45,strataW:'vL2.y'}:null});}
const GROUND=(function(){const N=GRID.N,S=GRID.S,cs=GRID.cs,M=GRID.M;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const axis=(lo,hi)=>{const o=[];for(let i=0;i<=N;i++){const a=-S/2+i*cs;o.push(a);if(i<N&&a+cs>lo&&a<hi)for(let k=1;k<M;k++)o.push(a+cs*k/M);}return o;};
 const X=axis(GRID.win.x[0],GRID.win.x[1]),Z=axis(GRID.win.z[0],GRID.win.z[1]),nx=X.length,nz=Z.length;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),L2=new Float32Array(nx*nz*4);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=X[i],z=Z[j],y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.a[n]?FC.at(FC.a[n],x,z):0,sa=at('salt'),de=at('delta'),dm=at('damp'),fl=at('flow'),yd=at('yard'),dn=at('dune'),rd=at('ridge'),lk=at('lake'),ha=at('halo'),fa=at('fan'),sl=at('slope');
  const crust=sa*(1-de*.55)*(1-lk),wetEdge=Math.max(dm*.7,smooth(LAKE.level+.9,LAKE.level+.15,y)*(1-lk));
  L0[k*4]=crust*(1-wetEdge)*.85;                                   /* the white polygons */
  L0[k*4+1]=Math.max(rd,lk*.8)*.9;                                 /* the ochre rim; the bed under the shallows */
  L0[k*4+2]=crust*smooth(.55,.7,BIO.fn.fbm(x*.0016,z*.0016,8401,2))*.6*(1-wetEdge);   /* the soda crust's curled plates */
  L0[k*4+3]=crust*wetEdge*.8+ha*(1-dn)*(1-yd)*smooth(.62,.78,BIO.fn.fbm(x*.005,z*.005,8403,2))*.5;   /* efflorescence */
  L1[k*4]=dn*.9;L1[k*4+1]=Math.max(yd*.8,at('granite')*.9);L1[k*4+2]=fa*(1-fl)*(1-crust)*smooth(.2,.6,de)*.6;L1[k*4+3]=de*smooth(.45,.85,at('wet'))*(1-fl)*.55;
  L2[k*4]=ha*(1-yd)*(1-dn)*.55;L2[k*4+1]=STATION.strata===false?0:yd*smooth(.22,.5,sl)*.95;const br=1-at('bare');L2[k*4+2]=at('lush')*.5*br;L2[k*4+3]=at('forest')*.6*br;}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});m.userData.probeSkip=true;m.userData.inspectLabel='The Bowl';scene.add(m);return m;})();
_mark('ground');
